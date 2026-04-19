"""
Segmentation Dataset for Background Removal
============================================

PyTorch Dataset class that:
    - Loads image + mask pairs from directory structure
    - Applies synchronized augmentations (via Albumentations)
    - Handles corrupt/missing files gracefully
    - Caches file paths at init for fast iteration
    - Returns {'image': Tensor, 'mask': Tensor, 'path': str}
    - Logs class balance statistics (foreground ratio)

Expected directory structure:
    dataset/
        images/  ← RGB JPG/PNG files
        masks/   ← Binary PNG masks (255=foreground, 0=background)
    
    File naming: image and mask must share the same stem name.
    Example: images/photo_001.jpg ↔ masks/photo_001.png
"""

import os
import logging
from pathlib import Path
from typing import Optional

import cv2
import numpy as np
import torch
from torch.utils.data import Dataset
import albumentations as A

logger = logging.getLogger(__name__)


class SegmentationDataset(Dataset):
    """
    PyTorch Dataset for binary segmentation (background removal).

    The mask is loaded as a single-channel binary image:
        - Pixel = 255 → foreground (1.0 after normalization)
        - Pixel = 0   → background (0.0 after normalization)

    Normalization: mask_float = mask_uint8 / 255.0
        This maps {0, 255} → {0.0, 1.0} for BCE/Dice loss compatibility.

    Args:
        image_dir: Path to directory containing RGB images
        mask_dir: Path to directory containing binary masks
        transform: Albumentations transformation pipeline
        max_samples: Optional limit on number of samples (for debugging)
    """

    # Supported image extensions
    VALID_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp", ".tif", ".tiff"}

    def __init__(
        self,
        image_dir: str,
        mask_dir: str,
        transform: Optional[A.Compose] = None,
        max_samples: Optional[int] = None,
    ):
        self.image_dir = Path(image_dir)
        self.mask_dir = Path(mask_dir)
        self.transform = transform

        # Validate directories exist
        if not self.image_dir.is_dir():
            raise FileNotFoundError(f"Image directory not found: {self.image_dir}")
        if not self.mask_dir.is_dir():
            raise FileNotFoundError(f"Mask directory not found: {self.mask_dir}")

        # Cache valid image-mask pairs at init
        # Only include pairs where BOTH image and mask exist
        self.pairs = self._find_valid_pairs()

        if max_samples is not None:
            self.pairs = self.pairs[:max_samples]

        if len(self.pairs) == 0:
            raise RuntimeError(
                f"No valid image-mask pairs found!\n"
                f"  Image dir: {self.image_dir} ({self._count_files(self.image_dir)} files)\n"
                f"  Mask dir:  {self.mask_dir} ({self._count_files(self.mask_dir)} files)\n"
                f"  Ensure matching filenames (stem) between image and mask directories."
            )

        # Log dataset statistics
        logger.info(f"Dataset initialized: {len(self.pairs)} image-mask pairs")
        self._log_class_balance()

    def _count_files(self, directory: Path) -> int:
        """Count files with valid extensions in directory."""
        return sum(
            1 for f in directory.iterdir()
            if f.suffix.lower() in self.VALID_EXTENSIONS
        )

    def _find_valid_pairs(self) -> list:
        """
        Find all valid image-mask pairs.

        Matching strategy:
            1. List all images in image_dir
            2. For each image, look for mask with same stem in mask_dir
            3. Try multiple mask extensions (.png, .jpg, etc.)
            4. Only include pair if mask exists

        Returns sorted list for reproducibility.
        """
        pairs = []

        # Build set of mask stems for fast lookup
        mask_files = {}
        for f in self.mask_dir.iterdir():
            if f.suffix.lower() in self.VALID_EXTENSIONS:
                mask_files[f.stem.lower()] = f

        # Match images to masks
        for img_path in sorted(self.image_dir.iterdir()):
            if img_path.suffix.lower() not in self.VALID_EXTENSIONS:
                continue

            stem = img_path.stem.lower()
            if stem in mask_files:
                pairs.append((str(img_path), str(mask_files[stem])))

        # Sort for reproducibility
        pairs.sort(key=lambda x: x[0])
        return pairs

    def _log_class_balance(self, sample_count: int = 20):
        """
        Log foreground ratio for class balance analysis.

        Samples a subset of masks and computes average foreground %.
        If foreground < 30%, class imbalance is significant →
        Dice/Focal loss become critical.

        Foreground ratio = (# foreground pixels) / (total pixels)
        """
        sample_indices = np.linspace(
            0, len(self.pairs) - 1,
            min(sample_count, len(self.pairs)),
            dtype=int,
        )

        fg_ratios = []
        for idx in sample_indices:
            _, mask_path = self.pairs[idx]
            mask = cv2.imread(mask_path, cv2.IMREAD_GRAYSCALE)
            if mask is not None:
                fg_ratio = (mask > 127).sum() / mask.size
                fg_ratios.append(fg_ratio)

        if fg_ratios:
            avg_fg = np.mean(fg_ratios)
            logger.info(
                f"Class balance (sampled {len(fg_ratios)} masks): "
                f"foreground = {avg_fg:.1%}, background = {1-avg_fg:.1%}"
            )
            if avg_fg < 0.3:
                logger.warning(
                    "Significant class imbalance detected! "
                    "Dice and Focal loss will help compensate."
                )

    def __len__(self) -> int:
        return len(self.pairs)

    def __getitem__(self, idx: int) -> dict:
        """
        Load and transform an image-mask pair.

        Returns:
            dict with:
                'image': Tensor (3, H, W) — normalized RGB
                'mask':  Tensor (1, H, W) — binary float [0, 1]
                'path':  str — original image path (for debugging)

        Error handling:
            If image or mask fails to load (corrupt file, etc.),
            returns a random different sample instead.
            This prevents training crashes from bad data.
        """
        img_path, mask_path = self.pairs[idx]

        try:
            # Load image: BGR → RGB (OpenCV loads as BGR)
            image = cv2.imread(img_path, cv2.IMREAD_COLOR)
            if image is None:
                raise IOError(f"Failed to load image: {img_path}")
            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

            # Load mask: grayscale
            mask = cv2.imread(mask_path, cv2.IMREAD_GRAYSCALE)
            if mask is None:
                raise IOError(f"Failed to load mask: {mask_path}")

            # Binarize mask: threshold at 127
            # Values > 127 → 255 (foreground), else → 0 (background)
            # This handles masks that aren't perfectly binary
            mask = (mask > 127).astype(np.uint8) * 255

        except Exception as e:
            logger.warning(
                f"Error loading sample {idx} ({img_path}): {e}. "
                f"Returning random replacement."
            )
            # Return a random different sample
            replacement_idx = np.random.randint(0, len(self.pairs))
            if replacement_idx == idx:
                replacement_idx = (idx + 1) % len(self.pairs)
            return self.__getitem__(replacement_idx)

        # Apply transforms (synchronized for image + mask)
        if self.transform is not None:
            transformed = self.transform(image=image, mask=mask)
            image = transformed["image"]      # (3, H, W) float tensor
            mask = transformed["mask"]         # (H, W) uint8 tensor
        else:
            # Default: just convert to tensor
            image = torch.from_numpy(image.transpose(2, 0, 1)).float() / 255.0
            mask = torch.from_numpy(mask)

        # Normalize mask: {0, 255} → {0.0, 1.0}
        # If already float from transforms, just ensure [0,1] range
        if isinstance(mask, torch.Tensor):
            mask = mask.float()
            if mask.max() > 1.0:
                mask = mask / 255.0
        else:
            mask = torch.from_numpy(mask).float() / 255.0

        # Add channel dimension: (H, W) → (1, H, W)
        if mask.dim() == 2:
            mask = mask.unsqueeze(0)

        return {
            "image": image,    # (3, H, W) float32
            "mask": mask,      # (1, H, W) float32 in [0, 1]
            "path": img_path,  # str
        }


def create_data_loaders(
    train_image_dir: str,
    train_mask_dir: str,
    val_image_dir: str,
    val_mask_dir: str,
    train_transform: A.Compose,
    val_transform: A.Compose,
    batch_size: int = 4,
    num_workers: int = 2,
    max_train_samples: Optional[int] = None,
    max_val_samples: Optional[int] = None,
) -> tuple:
    """
    Create training and validation data loaders.

    Args:
        train/val_image_dir: Paths to image directories
        train/val_mask_dir: Paths to mask directories
        train/val_transform: Albumentations transforms
        batch_size: Samples per batch (4 is good for Colab T4 with 15GB VRAM)
        num_workers: DataLoader workers (2 for Colab, avoid OOM)
        max_train/val_samples: Optional limits for debugging

    Returns:
        (train_loader, val_loader) — torch.utils.data.DataLoader instances
    """
    train_dataset = SegmentationDataset(
        train_image_dir, train_mask_dir, train_transform, max_train_samples
    )
    val_dataset = SegmentationDataset(
        val_image_dir, val_mask_dir, val_transform, max_val_samples
    )

    train_loader = torch.utils.data.DataLoader(
        train_dataset,
        batch_size=batch_size,
        shuffle=True,
        num_workers=num_workers,
        pin_memory=True,
        drop_last=True,  # Drop incomplete last batch for BN stability
    )

    val_loader = torch.utils.data.DataLoader(
        val_dataset,
        batch_size=batch_size,
        shuffle=False,
        num_workers=num_workers,
        pin_memory=True,
        drop_last=False,
    )

    return train_loader, val_loader


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    print("=" * 60)
    print("Dataset Class — Structure Validation")
    print("=" * 60)
    print("\nExpected directory structure:")
    print("  dataset/")
    print("    images/  ← RGB JPG/PNG files")
    print("    masks/   ← Binary PNG masks (255=fg, 0=bg)")
    print("\nTo test with real data, run:")
    print("  python -c \"from data.dataset import SegmentationDataset; ...")
    print("    ds = SegmentationDataset('dataset/train/images', 'dataset/train/masks')\"")
    print("\n✓ Dataset module ready!")
