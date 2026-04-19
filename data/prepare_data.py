"""
Dataset Preparation Script
===========================

Downloads, merges, and splits datasets for background removal training.

Supported Datasets:
    1. DUTS-TR: 10,553 images — salient objects, clean masks
       Source: http://saliencydetection.net/duts/
    
    2. P3M-10k: Portrait matting dataset (subset)
       Source: GitHub / academic release
    
    3. HIM2K: Human Instance Matting
       Source: GitHub, free for research

Unified Format:
    dataset/
        train/
            images/  ← RGB JPG/PNG files
            masks/   ← Binary PNG masks (255=foreground, 0=background)
        val/
            images/
            masks/
        test/
            images/
            masks/

Split: 80% train / 10% val / 10% test (fixed seed=42 for reproducibility)
"""

import os
import sys
import shutil
import zipfile
import tarfile
import hashlib
import logging
from pathlib import Path
from typing import Optional
import random

import cv2
import numpy as np

try:
    import gdown
except ImportError:
    gdown = None

try:
    import requests
    from tqdm import tqdm
except ImportError:
    requests = None
    tqdm = None

logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger(__name__)


def download_file(url: str, dest: str, desc: str = "Downloading") -> bool:
    """
    Download a file with progress bar.

    Args:
        url: Direct download URL
        dest: Destination file path
        desc: Description for progress bar

    Returns:
        True if successful, False otherwise
    """
    if os.path.exists(dest):
        logger.info(f"  Already exists: {dest}")
        return True

    if requests is None:
        logger.error("  'requests' not installed. Run: pip install requests tqdm")
        return False

    os.makedirs(os.path.dirname(dest), exist_ok=True)

    try:
        response = requests.get(url, stream=True, timeout=60)
        response.raise_for_status()
        total = int(response.headers.get("content-length", 0))

        progress = tqdm(total=total, unit="B", unit_scale=True, desc=desc) if tqdm else None

        with open(dest, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
                if progress:
                    progress.update(len(chunk))

        if progress:
            progress.close()

        return True
    except Exception as e:
        logger.error(f"  Download failed: {e}")
        if os.path.exists(dest):
            os.remove(dest)
        return False


def extract_archive(archive_path: str, extract_to: str) -> bool:
    """Extract zip or tar archive."""
    try:
        if archive_path.endswith(".zip"):
            with zipfile.ZipFile(archive_path, "r") as z:
                z.extractall(extract_to)
        elif archive_path.endswith((".tar.gz", ".tgz", ".tar")):
            with tarfile.open(archive_path, "r:*") as t:
                t.extractall(extract_to)
        else:
            logger.error(f"  Unknown archive format: {archive_path}")
            return False
        return True
    except Exception as e:
        logger.error(f"  Extraction failed: {e}")
        return False


def convert_mask_to_binary(mask_path: str, output_path: str, threshold: int = 127):
    """
    Convert any mask to strict binary format.

    Input: Grayscale or alpha channel mask (any format)
    Output: Binary PNG where 255=foreground, 0=background

    Threshold strategy:
        pixel > threshold → 255 (foreground)
        pixel ≤ threshold → 0   (background)

    For matting datasets (alpha masks with gradients),
    threshold=127 properly binarizes soft edges.
    """
    # Try loading as grayscale first
    mask = cv2.imread(mask_path, cv2.IMREAD_UNCHANGED)

    if mask is None:
        return False

    # Handle multi-channel masks (RGBA → use alpha channel)
    if mask.ndim == 3:
        if mask.shape[2] == 4:
            # RGBA: 4th channel is alpha
            mask = mask[:, :, 3]
        elif mask.shape[2] == 3:
            # RGB: convert to grayscale
            mask = cv2.cvtColor(mask, cv2.COLOR_BGR2GRAY)
        else:
            mask = mask[:, :, 0]

    # Binarize
    _, binary = cv2.threshold(mask, threshold, 255, cv2.THRESH_BINARY)

    # Save as PNG
    cv2.imwrite(output_path, binary)
    return True


def prepare_duts(
    raw_dir: str,
    output_images: str,
    output_masks: str,
    prefix: str = "duts_",
):
    """
    Prepare DUTS-TR dataset.

    DUTS-TR structure (after extraction):
        DUTS-TR/
            DUTS-TR-Image/    ← RGB images (.jpg)
            DUTS-TR-Mask/     ← Saliency masks (.png)

    Download manually from: http://saliencydetection.net/duts/
    Or use the download_datasets() function below.
    """
    logger.info("Processing DUTS-TR...")

    # Find image and mask directories
    image_dir = None
    mask_dir = None

    for root, dirs, files in os.walk(raw_dir):
        dirname = os.path.basename(root).lower()
        if "image" in dirname and any(f.endswith((".jpg", ".png")) for f in files):
            image_dir = root
        elif "mask" in dirname and any(f.endswith(".png") for f in files):
            mask_dir = root

    if image_dir is None or mask_dir is None:
        logger.warning(f"  DUTS directories not found in {raw_dir}")
        return 0

    count = 0
    mask_stems = {Path(f).stem for f in os.listdir(mask_dir) if f.endswith(".png")}

    for fname in sorted(os.listdir(image_dir)):
        if not fname.lower().endswith((".jpg", ".jpeg", ".png")):
            continue

        stem = Path(fname).stem
        if stem not in mask_stems:
            continue

        src_img = os.path.join(image_dir, fname)
        src_mask = os.path.join(mask_dir, f"{stem}.png")

        dst_img = os.path.join(output_images, f"{prefix}{stem}.jpg")
        dst_mask = os.path.join(output_masks, f"{prefix}{stem}.png")

        # Copy image
        if not os.path.exists(dst_img):
            img = cv2.imread(src_img)
            if img is not None:
                cv2.imwrite(dst_img, img)

        # Convert mask to binary
        if not os.path.exists(dst_mask):
            convert_mask_to_binary(src_mask, dst_mask)

        count += 1

    logger.info(f"  DUTS-TR: {count} pairs processed")
    return count


def prepare_generic_dataset(
    image_source: str,
    mask_source: str,
    output_images: str,
    output_masks: str,
    prefix: str,
):
    """
    Prepare any dataset with matching image/mask directories.

    Handles:
        - Different extensions between image and mask
        - Alpha channel masks (converts to binary)
        - Filename normalization
    """
    if not os.path.isdir(image_source) or not os.path.isdir(mask_source):
        logger.warning(f"  Source directories not found: {image_source} / {mask_source}")
        return 0

    # Build mask stem lookup
    valid_ext = {".jpg", ".jpeg", ".png", ".bmp", ".tif", ".tiff"}
    mask_files = {}
    for f in os.listdir(mask_source):
        if Path(f).suffix.lower() in valid_ext:
            mask_files[Path(f).stem.lower()] = os.path.join(mask_source, f)

    count = 0
    for fname in sorted(os.listdir(image_source)):
        if Path(fname).suffix.lower() not in valid_ext:
            continue

        stem = Path(fname).stem.lower()
        if stem not in mask_files:
            continue

        src_img = os.path.join(image_source, fname)
        src_mask = mask_files[stem]

        dst_img = os.path.join(output_images, f"{prefix}{stem}.jpg")
        dst_mask = os.path.join(output_masks, f"{prefix}{stem}.png")

        if not os.path.exists(dst_img):
            img = cv2.imread(src_img)
            if img is not None:
                cv2.imwrite(dst_img, img)

        if not os.path.exists(dst_mask):
            convert_mask_to_binary(src_mask, dst_mask)

        count += 1

    logger.info(f"  {prefix.rstrip('_')}: {count} pairs processed")
    return count


def split_dataset(
    merged_images: str,
    merged_masks: str,
    output_root: str,
    train_ratio: float = 0.8,
    val_ratio: float = 0.1,
    seed: int = 42,
):
    """
    Split merged dataset into train/val/test.

    Split ratios: 80/10/10 (default)
    Fixed seed = 42 for reproducibility.

    Creates:
        output_root/
            train/images/, train/masks/
            val/images/,   val/masks/
            test/images/,  test/masks/
    """
    logger.info("\nSplitting dataset (80/10/10)...")

    # Get all valid pairs
    valid_ext = {".jpg", ".jpeg", ".png"}
    mask_stems = {
        Path(f).stem
        for f in os.listdir(merged_masks)
        if Path(f).suffix.lower() in valid_ext
    }

    all_stems = []
    for f in sorted(os.listdir(merged_images)):
        stem = Path(f).stem
        if stem in mask_stems:
            all_stems.append(stem)

    # Shuffle with fixed seed
    random.seed(seed)
    random.shuffle(all_stems)

    n = len(all_stems)
    n_train = int(n * train_ratio)
    n_val = int(n * val_ratio)

    splits = {
        "train": all_stems[:n_train],
        "val": all_stems[n_train:n_train + n_val],
        "test": all_stems[n_train + n_val:],
    }

    for split_name, stems in splits.items():
        img_dir = os.path.join(output_root, split_name, "images")
        mask_dir = os.path.join(output_root, split_name, "masks")
        os.makedirs(img_dir, exist_ok=True)
        os.makedirs(mask_dir, exist_ok=True)

        for stem in stems:
            # Find image file (could be .jpg or .png)
            for ext in [".jpg", ".jpeg", ".png"]:
                src_img = os.path.join(merged_images, f"{stem}{ext}")
                if os.path.exists(src_img):
                    shutil.copy2(src_img, os.path.join(img_dir, f"{stem}{ext}"))
                    break

            # Find mask file
            for ext in [".png", ".jpg"]:
                src_mask = os.path.join(merged_masks, f"{stem}{ext}")
                if os.path.exists(src_mask):
                    shutil.copy2(src_mask, os.path.join(mask_dir, f"{stem}{ext}"))
                    break

        logger.info(f"  {split_name}: {len(stems)} pairs")

    logger.info(f"  Total: {n} pairs split into train/val/test")
    return splits


def download_datasets(raw_dir: str = "raw_data"):
    """
    Download all datasets.

    NOTE: Some datasets require manual download from their official sites.
    This function provides download links and instructions.
    """
    os.makedirs(raw_dir, exist_ok=True)

    print("=" * 70)
    print("DATASET DOWNLOAD INSTRUCTIONS")
    print("=" * 70)

    print("""
╔══════════════════════════════════════════════════════════════════╗
║  OPTION 1: DUTS-TR (Recommended — easiest to obtain)           ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  Official page: http://saliencydetection.net/duts/               ║
║                                                                  ║
║  Download these two files:                                       ║
║    1. DUTS-TR-Image.zip (~350MB) — Training images               ║
║    2. DUTS-TR-Mask.zip  (~30MB)  — Ground truth masks            ║
║                                                                  ║
║  Extract both into: raw_data/DUTS-TR/                            ║
║                                                                  ║
║  Result:                                                         ║
║    raw_data/DUTS-TR/DUTS-TR-Image/  (10,553 .jpg files)          ║
║    raw_data/DUTS-TR/DUTS-TR-Mask/   (10,553 .png files)          ║
║                                                                  ║
╠══════════════════════════════════════════════════════════════════╣
║  OPTION 2: P3M-10k (Portrait-specific, high quality)            ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  GitHub: https://github.com/JizhiziLi/P3M                       ║
║  Download P3M-10k dataset following their instructions.          ║
║                                                                  ║
║  Extract into: raw_data/P3M/                                     ║
║    raw_data/P3M/images/                                          ║
║    raw_data/P3M/masks/                                           ║
║                                                                  ║
╠══════════════════════════════════════════════════════════════════╣
║  OPTION 3: Your Own Images                                      ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  Place RGB images in:     raw_data/custom/images/                ║
║  Place binary masks in:   raw_data/custom/masks/                 ║
║  (Matching filenames, mask: 255=foreground, 0=background)        ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
""")


def prepare_all(
    raw_dir: str = "raw_data",
    output_dir: str = "dataset",
    seed: int = 42,
):
    """
    Master function: merge all datasets + split.

    Workflow:
        1. Create temp merged directory
        2. Process each dataset source
        3. Split into train/val/test
        4. Clean up merged temp dir
    """
    merged_images = os.path.join(output_dir, "_merged", "images")
    merged_masks = os.path.join(output_dir, "_merged", "masks")
    os.makedirs(merged_images, exist_ok=True)
    os.makedirs(merged_masks, exist_ok=True)

    total = 0

    # DUTS-TR
    duts_dir = os.path.join(raw_dir, "DUTS-TR")
    if os.path.isdir(duts_dir):
        total += prepare_duts(duts_dir, merged_images, merged_masks, "duts_")

    # P3M
    p3m_dir = os.path.join(raw_dir, "P3M")
    if os.path.isdir(p3m_dir):
        total += prepare_generic_dataset(
            os.path.join(p3m_dir, "images"),
            os.path.join(p3m_dir, "masks"),
            merged_images, merged_masks, "p3m_",
        )

    # HIM2K
    him_dir = os.path.join(raw_dir, "HIM2K")
    if os.path.isdir(him_dir):
        total += prepare_generic_dataset(
            os.path.join(him_dir, "images"),
            os.path.join(him_dir, "masks"),
            merged_images, merged_masks, "him_",
        )

    # Custom datasets
    custom_dir = os.path.join(raw_dir, "custom")
    if os.path.isdir(custom_dir):
        total += prepare_generic_dataset(
            os.path.join(custom_dir, "images"),
            os.path.join(custom_dir, "masks"),
            merged_images, merged_masks, "custom_",
        )

    if total == 0:
        logger.error("\nNo datasets found! Please download datasets first.")
        download_datasets(raw_dir)
        return

    logger.info(f"\nTotal merged: {total} image-mask pairs")

    # Split
    split_dataset(merged_images, merged_masks, output_dir, seed=seed)

    # Clean up merged directory
    shutil.rmtree(os.path.join(output_dir, "_merged"), ignore_errors=True)

    # Print summary
    for split in ["train", "val", "test"]:
        img_dir = os.path.join(output_dir, split, "images")
        if os.path.isdir(img_dir):
            n = len(os.listdir(img_dir))
            logger.info(f"  {split}: {n} samples at {img_dir}")

    logger.info("\n✓ Dataset preparation complete!")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Prepare datasets for BG removal training")
    parser.add_argument("--raw-dir", default="raw_data", help="Raw downloaded data directory")
    parser.add_argument("--output-dir", default="dataset", help="Output dataset directory")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for split")
    parser.add_argument("--download-info", action="store_true", help="Show download instructions")

    args = parser.parse_args()

    if args.download_info:
        download_datasets(args.raw_dir)
    else:
        prepare_all(args.raw_dir, args.output_dir, args.seed)
