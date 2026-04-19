"""
Single Image Inference Pipeline
================================

End-to-end inference: JPEG input → RGBA transparent PNG output.

Pipeline:
    1. Read image (handle EXIF rotation)
    2. Preprocess (normalize)
    3. Run model (tile-based if large, TTA optional)
    4. Post-process (morphology, guided filter, anti-alias)
    5. Create RGBA image with transparent background
    6. Save as PNG

Supports:
    - PyTorch model (.pth checkpoint)
    - ONNX model (.onnx)
    - INT8 quantized ONNX (.onnx)
"""

import os
import sys
import time
import argparse
import logging
from pathlib import Path
from typing import Optional

import cv2
import numpy as np
import torch
from PIL import Image, ExifTags

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from model.unet import BGRemovalUNet
from data.augmentations import IMAGENET_MEAN, IMAGENET_STD, apply_tta
from tile_inference import tile_inference, create_transparent_image
from postprocess import full_postprocess, apply_mask_to_image

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────
# EXIF Rotation Handling
# ─────────────────────────────────────────────────────────────────

def fix_exif_rotation(image: Image.Image) -> Image.Image:
    """
    Handle EXIF orientation tag (people upload rotated photos).

    EXIF orientation values:
        1 = Normal
        2 = Flipped horizontally
        3 = Rotated 180°
        4 = Flipped vertically
        5 = Transposed (flip + rotate 270°)
        6 = Rotated 90° CW (most common for phone photos)
        7 = Transverse (flip + rotate 90°)
        8 = Rotated 270° CW

    If we don't handle this, portrait phone photos appear sideways.
    """
    try:
        exif = image._getexif()
        if exif is None:
            return image

        # Find orientation tag
        orientation_key = None
        for key, val in ExifTags.TAGS.items():
            if val == "Orientation":
                orientation_key = key
                break

        if orientation_key is None or orientation_key not in exif:
            return image

        orientation = exif[orientation_key]

        if orientation == 2:
            image = image.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
        elif orientation == 3:
            image = image.rotate(180, expand=True)
        elif orientation == 4:
            image = image.transpose(Image.Transpose.FLIP_TOP_BOTTOM)
        elif orientation == 5:
            image = image.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
            image = image.rotate(270, expand=True)
        elif orientation == 6:
            image = image.rotate(270, expand=True)
        elif orientation == 7:
            image = image.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
            image = image.rotate(90, expand=True)
        elif orientation == 8:
            image = image.rotate(90, expand=True)

    except (AttributeError, KeyError, IndexError):
        pass

    return image


# ─────────────────────────────────────────────────────────────────
# Model Loading
# ─────────────────────────────────────────────────────────────────

def load_pytorch_model(
    checkpoint_path: str,
    device: torch.device,
    input_size: int = 320,
) -> torch.nn.Module:
    """Load trained PyTorch model from checkpoint."""
    model = BGRemovalUNet(input_size=input_size)

    checkpoint = torch.load(checkpoint_path, map_location=device, weights_only=False)

    if "model_state_dict" in checkpoint:
        model.load_state_dict(checkpoint["model_state_dict"])
    else:
        model.load_state_dict(checkpoint)

    model = model.to(device)
    model.eval()

    logger.info(f"Loaded PyTorch model from {checkpoint_path}")
    return model


def load_onnx_model(onnx_path: str):
    """Load ONNX model for inference."""
    try:
        import onnxruntime as ort
    except ImportError:
        raise ImportError("Install onnxruntime: pip install onnxruntime")

    # Configure session options
    sess_options = ort.SessionOptions()
    sess_options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
    sess_options.intra_op_num_threads = os.cpu_count()

    # Prefer CPU execution provider
    providers = ["CPUExecutionProvider"]
    if "CUDAExecutionProvider" in ort.get_available_providers():
        providers.insert(0, "CUDAExecutionProvider")

    session = ort.InferenceSession(onnx_path, sess_options, providers=providers)
    logger.info(f"Loaded ONNX model from {onnx_path}")
    return session


# ─────────────────────────────────────────────────────────────────
# Normalization
# ─────────────────────────────────────────────────────────────────

def normalize_image(image: np.ndarray) -> np.ndarray:
    """
    Apply ImageNet normalization.

    I_norm = (I/255 - μ) / σ
    μ = [0.485, 0.456, 0.406]
    σ = [0.229, 0.224, 0.225]
    """
    img = image.astype(np.float32) / 255.0
    mean = np.array(IMAGENET_MEAN, dtype=np.float32)
    std = np.array(IMAGENET_STD, dtype=np.float32)
    img = (img - mean) / std
    return img


# ─────────────────────────────────────────────────────────────────
# Inference Functions
# ─────────────────────────────────────────────────────────────────

def infer_pytorch(
    model: torch.nn.Module,
    image: np.ndarray,
    device: torch.device,
    tile_size: int = 320,
    overlap: int = 32,
    use_tta: bool = False,
) -> np.ndarray:
    """
    Run inference with PyTorch model.

    For images ≤ tile_size: direct inference
    For larger images: tile-based inference with blending

    Args:
        model: Trained model in eval mode
        image: RGB image (H, W, 3) uint8
        device: Inference device
        tile_size: Model input size
        overlap: Tile overlap for large images
        use_tta: Enable test-time augmentation

    Returns:
        Probability mask (H, W) float32 in [0, 1]
    """
    H, W = image.shape[:2]

    if max(H, W) > tile_size:
        # Tile-based inference for high-res images
        mask = tile_inference(
            model, image, device,
            tile_size=tile_size,
            overlap=overlap,
            normalize_fn=normalize_image,
        )
    else:
        # Direct inference for small images
        img_resized = cv2.resize(image, (tile_size, tile_size))
        img_norm = normalize_image(img_resized)
        img_tensor = torch.from_numpy(img_norm.transpose(2, 0, 1)).float().unsqueeze(0)

        if use_tta:
            mask = apply_tta(model, img_tensor, device)
            mask = mask.cpu().numpy()[0, 0]
        else:
            with torch.no_grad():
                output = model(img_tensor.to(device))
                if isinstance(output, list):
                    output = output[0]
                mask = output.cpu().numpy()[0, 0]

        # Resize mask back to original dimensions
        mask = cv2.resize(mask, (W, H), interpolation=cv2.INTER_LINEAR)

    return mask


def infer_onnx(
    session,
    image: np.ndarray,
    tile_size: int = 320,
) -> np.ndarray:
    """
    Run inference with ONNX model.

    Args:
        session: ONNX Runtime inference session
        image: RGB image (H, W, 3) uint8
        tile_size: Model input size

    Returns:
        Probability mask (H, W) float32 in [0, 1]
    """
    H, W = image.shape[:2]

    # Get input/output names
    input_name = session.get_inputs()[0].name
    output_name = session.get_outputs()[0].name

    if max(H, W) > tile_size:
        # TODO: integrate tile inference with ONNX
        # For now, resize to tile_size
        img_resized = cv2.resize(image, (tile_size, tile_size))
    else:
        img_resized = cv2.resize(image, (tile_size, tile_size))

    # Normalize
    img_norm = normalize_image(img_resized)
    img_input = img_norm.transpose(2, 0, 1)[np.newaxis, :].astype(np.float32)

    # Run inference
    result = session.run([output_name], {input_name: img_input})
    mask = result[0][0, 0]  # (tile_size, tile_size)

    # Resize back to original
    mask = cv2.resize(mask, (W, H), interpolation=cv2.INTER_LINEAR)

    return mask


# ─────────────────────────────────────────────────────────────────
# Main Inference Pipeline
# ─────────────────────────────────────────────────────────────────

def remove_background(
    input_path: str,
    output_path: str,
    model_path: str,
    device: Optional[torch.device] = None,
    tile_size: int = 320,
    use_tta: bool = False,
    use_postprocessing: bool = True,
    use_guided_filter: bool = True,
    soft_alpha: bool = False,
) -> dict:
    """
    Complete background removal pipeline.

    Mental trace — one complete inference:
    ──────────────────────────────────────
    1. Read JPEG file → PIL Image
    2. Fix EXIF rotation → correctly oriented PIL Image
    3. Convert to RGB numpy array (H, W, 3) uint8
    4. If H or W > 320: tile-based inference
       Else: resize to 320×320, normalize, run model
    5. Model outputs probability mask (H, W) float32 [0, 1]
    6. Post-process:
       a. Threshold at 0.5 → binary {0, 255}
       b. Remove components < 500px²
       c. Fill holes < 1000px²
       d. Morphological close(5×5) + open(3×3)
       e. Guided filter with image as guide (radius=10, ε=1e-4)
       f. Anti-alias edges (σ=1.0, 3px edge band)
    7. Create RGBA: paste RGB + alpha channel
    8. Save as PNG (lossless, preserves transparency)

    Args:
        input_path: Path to input image (JPEG/PNG/WebP)
        output_path: Path to save output PNG (RGBA)
        model_path: Path to model checkpoint (.pth) or ONNX (.onnx)
        device: Inference device (auto-detect if None)
        tile_size: Model input resolution
        use_tta: Enable test-time augmentation (+1-2% IoU, 3x slower)
        use_postprocessing: Enable full post-processing pipeline
        use_guided_filter: Enable guided filter edge refinement
        soft_alpha: Use soft alpha (vs. hard threshold)

    Returns:
        dict with timing and metadata
    """
    if device is None:
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    timings = {}
    t_start = time.time()

    # ── Step 1: Read Image ──
    t0 = time.time()
    pil_image = Image.open(input_path)
    pil_image = fix_exif_rotation(pil_image)
    pil_image = pil_image.convert("RGB")
    image = np.array(pil_image)  # (H, W, 3) uint8 RGB
    timings["read"] = time.time() - t0
    logger.info(f"  Image loaded: {image.shape[1]}×{image.shape[0]}")

    # ── Step 2: Load Model ──
    t0 = time.time()
    is_onnx = model_path.endswith(".onnx")

    if is_onnx:
        session = load_onnx_model(model_path)
    else:
        model = load_pytorch_model(model_path, device, tile_size)
    timings["model_load"] = time.time() - t0

    # ── Step 3: Inference ──
    t0 = time.time()
    if is_onnx:
        raw_mask = infer_onnx(session, image, tile_size)
    else:
        raw_mask = infer_pytorch(model, image, device, tile_size, use_tta=use_tta)
    timings["inference"] = time.time() - t0
    logger.info(f"  Inference: {timings['inference']:.3f}s")

    # ── Step 4: Post-Process ──
    t0 = time.time()
    if use_postprocessing:
        refined_mask = full_postprocess(
            image, raw_mask,
            use_guided_filter=use_guided_filter,
        )
    else:
        refined_mask = raw_mask
    timings["postprocess"] = time.time() - t0

    # ── Step 5: Create RGBA ──
    t0 = time.time()
    if soft_alpha:
        rgba = apply_mask_to_image(image, refined_mask)
    else:
        binary_mask = (refined_mask > 0.5).astype(np.float32)
        # Use refined mask for alpha at edges, binary elsewhere
        alpha_mask = np.where(
            np.abs(refined_mask - 0.5) < 0.3,  # uncertain region
            refined_mask,
            binary_mask,
        )
        rgba = apply_mask_to_image(image, alpha_mask)
    timings["composite"] = time.time() - t0

    # ── Step 6: Save ──
    t0 = time.time()
    output_image = Image.fromarray(rgba, "RGBA")
    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    output_image.save(output_path, "PNG")
    timings["save"] = time.time() - t0

    timings["total"] = time.time() - t_start
    logger.info(f"  Total time: {timings['total']:.3f}s")
    logger.info(f"  Saved to: {output_path}")

    return {
        "input_size": f"{image.shape[1]}×{image.shape[0]}",
        "output_path": output_path,
        "timings": timings,
    }


def main():
    parser = argparse.ArgumentParser(
        description="Remove background from image",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument("input", help="Input image path")
    parser.add_argument("--output", "-o", help="Output path (default: input_nobg.png)")
    parser.add_argument("--model", "-m", default="checkpoints/best_model.pth",
                        help="Model path (.pth or .onnx)")
    parser.add_argument("--tile-size", type=int, default=320, help="Model input size")
    parser.add_argument("--tta", action="store_true", help="Enable test-time augmentation")
    parser.add_argument("--no-postprocess", action="store_true",
                        help="Disable post-processing")
    parser.add_argument("--no-guided-filter", action="store_true",
                        help="Disable guided filter edge refinement")
    parser.add_argument("--soft-alpha", action="store_true",
                        help="Use soft alpha channel (preserves semi-transparency)")
    parser.add_argument("--cpu", action="store_true", help="Force CPU inference")

    args = parser.parse_args()

    # Auto-generate output path
    if args.output is None:
        stem = Path(args.input).stem
        args.output = f"{stem}_nobg.png"

    device = torch.device("cpu") if args.cpu else None

    result = remove_background(
        input_path=args.input,
        output_path=args.output,
        model_path=args.model,
        device=device,
        tile_size=args.tile_size,
        use_tta=args.tta,
        use_postprocessing=not args.no_postprocess,
        use_guided_filter=not args.no_guided_filter,
        soft_alpha=args.soft_alpha,
    )

    print(f"\n✓ Background removed successfully!")
    print(f"  Input:  {result['input_size']}")
    print(f"  Output: {result['output_path']}")
    print(f"  Time breakdown:")
    for step, t in result["timings"].items():
        print(f"    {step:15s}: {t:.3f}s")


if __name__ == "__main__":
    main()
