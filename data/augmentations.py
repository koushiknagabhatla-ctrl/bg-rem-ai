"""
Augmentation Pipeline for Background Removal
=============================================

All geometric transforms applied IDENTICALLY to image AND mask.
Photometric transforms applied to image ONLY.

Mathematical basis for each transform documented inline.

Uses Albumentations library for efficient, synchronized image+mask transforms.

Three pipelines:
    1. Training: Full augmentation (geometric + photometric)
    2. Validation: Resize + normalize only (no randomness)
    3. TTA (Test-Time Augmentation): Original + flips, average predictions
"""

import albumentations as A
from albumentations.pytorch import ToTensorV2
import numpy as np
import torch
from typing import Callable, Optional


# ─────────────────────────────────────────────────────────────────
# Constants
# ─────────────────────────────────────────────────────────────────

# ImageNet normalization stats
# Why use ImageNet stats even without pretraining:
#    Natural image statistics are approximately universal.
#    μ and σ computed over millions of natural images (ImageNet)
#    center and scale the input to zero-mean, unit-variance.
#    This stabilizes early training convergence by ensuring
#    gradient magnitudes are reasonable from epoch 1.
IMAGENET_MEAN = [0.485, 0.456, 0.406]  # RGB channel means
IMAGENET_STD = [0.229, 0.224, 0.225]   # RGB channel stds

INPUT_SIZE = 320  # Model expected input resolution


# ─────────────────────────────────────────────────────────────────
# Training Augmentation Pipeline
# ─────────────────────────────────────────────────────────────────

def get_train_transforms(input_size: int = INPUT_SIZE) -> A.Compose:
    """
    Full training augmentation pipeline.

    GEOMETRIC TRANSFORMS (applied to both image AND mask):
    ───────────────────────────────────────────────────────
    1. Random Horizontal Flip (p=0.5):
         I'[i,j] = I[i, W-1-j]
         50% chance — adds left-right invariance.
         Critical because people/objects can face either direction.

    2. Random Rotation (±15°):
         [x']   [cos θ  -sin θ] [x - cx]   [cx]
         [y'] = [sin θ   cos θ] [y - cy] + [cy]
         θ ~ Uniform(-15°, +15°)
         Bilinear interpolation for image (smooth),
         nearest-neighbor for mask (preserves binary values).

    3. Random Scale + Crop:
         Scale s ~ Uniform(0.75, 1.25)
         Resize to (s·H, s·W) → Random crop to (input_size, input_size)
         Teaches the model to handle objects at varied scales.

    4. Elastic Distortion (for edge robustness):
         Generate random displacement field:
             dx[i,j] ~ N(0, σ²), dy[i,j] ~ N(0, σ²)
         Smooth with Gaussian kernel (sigma=5)
         Apply: I'[i,j] = I[i + α·dy[i,j], j + α·dx[i,j]]
         α = 34, σ = 5 (empirically effective)
         Same field applied to both image and mask.
         Teaches model to handle non-rigid deformations.

    PHOTOMETRIC TRANSFORMS (image ONLY, NOT mask):
    ──────────────────────────────────────────────
    5. Color Jitter:
         Brightness: I' = I · b,  b ~ U(0.7, 1.3)
         Contrast:   I' = (I - μ)·c + μ,  c ~ U(0.8, 1.2)
         Saturation: HSV space, S' = S · s, s ~ U(0.7, 1.3)
         Hue:        H' = H + δ,  δ ~ U(-18°, +18°) → shift_limit=0.1

    6. Gaussian Blur (simulates focus variation):
         G(x,y) = (1/2πσ²) · exp(-(x²+y²)/2σ²)
         σ ~ U(0.1, 2.0), kernel = 2·ceil(3σ)+1
         Blur limit = (3, 7) covers σ range

    7. Random Grayscale (p=0.1):
         Gray = 0.2989·R + 0.5870·G + 0.1140·B
         ITU-R BT.601 luminance coefficients.
         Forces model to use shape, not color, for segmentation.

    8. Gaussian Noise (p=0.2):
         I' = I + n,  n ~ N(0, σ²), σ ∈ [10, 50]
         Robustness to sensor noise in low-light photos.

    9. CLAHE (p=0.2):
         Contrast Limited Adaptive Histogram Equalization.
         Enhances local contrast, simulates HDR-like imaging.

    ALWAYS LAST — Normalize (image only):
         I_norm = (I - μ) / σ
         μ = [0.485, 0.456, 0.406], σ = [0.229, 0.224, 0.225]
    """
    return A.Compose([
        # ── GEOMETRIC (image + mask) ──

        # Horizontal flip: I'[i,j] = I[i, W-1-j], p=0.5
        A.HorizontalFlip(p=0.5),

        # Vertical flip: I'[i,j] = I[H-1-i, j], p=0.1
        # Less common since most photos are upright, but adds robustness
        A.VerticalFlip(p=0.1),

        # Random rotation: θ ~ U(-15°, 15°)
        # border_mode=BORDER_REFLECT to fill edges naturally
        A.Rotate(
            limit=15,
            interpolation=1,  # cv2.INTER_LINEAR for image
            border_mode=2,    # cv2.BORDER_REFLECT
            p=0.5,
        ),

        # Random scale + crop: s ~ U(0.75, 1.25), then crop to input_size
        A.RandomResizedCrop(
            size=(input_size, input_size),
            scale=(0.75, 1.0),
            ratio=(0.9, 1.1),
            interpolation=1,
            p=0.5,
        ),

        # Elastic distortion: displacement field + Gaussian smooth
        # α=34 (displacement magnitude), σ=5 (smoothing)
        A.ElasticTransform(
            alpha=34,
            sigma=5,
            p=0.2,
        ),

        # ShiftScaleRotate: additional geometric augmentation
        A.ShiftScaleRotate(
            shift_limit=0.05,
            scale_limit=0.1,
            rotate_limit=10,
            border_mode=2,
            p=0.3,
        ),

        # Ensure output is exactly input_size × input_size
        A.Resize(input_size, input_size),

        # ── PHOTOMETRIC (image only) ──

        # Color jitter: brightness, contrast, saturation, hue
        A.ColorJitter(
            brightness=(0.7, 1.3),     # b ~ U(0.7, 1.3)
            contrast=(0.8, 1.2),       # c ~ U(0.8, 1.2)
            saturation=(0.7, 1.3),     # s ~ U(0.7, 1.3)
            hue=(-0.1, 0.1),           # δ ~ U(-18°, 18°) = ±0.1 in [0,1] scale
            p=0.5,
        ),

        # Gaussian blur: G(x,y) = (1/2πσ²)·exp(-(x²+y²)/2σ²)
        A.GaussianBlur(
            blur_limit=(3, 7),  # kernel sizes for σ ~ U(0.1, 2.0)
            p=0.2,
        ),

        # Random grayscale: Gray = 0.2989·R + 0.587·G + 0.114·B
        A.ToGray(p=0.1),

        # Gaussian noise: I' = I + N(0, σ²)
        A.GaussNoise(
            std_range=(0.04, 0.2),  # noise standard deviation range as fraction
            p=0.2,
        ),

        # CLAHE: adaptive histogram equalization
        A.CLAHE(
            clip_limit=4.0,
            tile_grid_size=(8, 8),
            p=0.2,
        ),

        # Random brightness-contrast (backup photometric)
        A.RandomBrightnessContrast(
            brightness_limit=0.2,
            contrast_limit=0.2,
            p=0.3,
        ),

        # ── ALWAYS LAST ──
        # Normalize: I_norm = (I - μ) / σ
        A.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),

        # Convert to PyTorch tensor: (H, W, C) → (C, H, W)
        ToTensorV2(),
    ])


# ─────────────────────────────────────────────────────────────────
# Validation Pipeline (no augmentation)
# ─────────────────────────────────────────────────────────────────

def get_val_transforms(input_size: int = INPUT_SIZE) -> A.Compose:
    """
    Validation/test pipeline: resize + normalize only.
    No random augmentation to ensure deterministic evaluation.
    """
    return A.Compose([
        A.Resize(input_size, input_size),
        A.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
        ToTensorV2(),
    ])


# ─────────────────────────────────────────────────────────────────
# Test-Time Augmentation (TTA)
# ─────────────────────────────────────────────────────────────────

def apply_tta(
    model: torch.nn.Module,
    image: torch.Tensor,
    device: torch.device,
) -> torch.Tensor:
    """
    Test-Time Augmentation: run inference on multiple versions of the input
    and average predictions for better accuracy.

    Strategy:
        1. Original image → predict
        2. Horizontal flip → predict → flip back
        3. Vertical flip → predict → flip back
        Average the 3 predictions.

    Mathematical justification:
        TTA acts as an ensemble over geometric transformations.
        Each transformation provides a different "view" of the image.
        Averaging reduces prediction variance:
            Var(mean) = Var(single) / n
        Typical improvement: +1-2% IoU at the cost of 3x inference time.

    Args:
        model: Trained model in eval mode
        image: Single image tensor (1, 3, H, W), already normalized
        device: Device to run inference on

    Returns:
        Averaged prediction mask (1, 1, H, W)
    """
    model.eval()
    predictions = []

    with torch.no_grad():
        # 1. Original
        pred_orig = model(image.to(device))
        if isinstance(pred_orig, list):
            pred_orig = pred_orig[0]
        predictions.append(pred_orig)

        # 2. Horizontal flip → predict → flip back
        # Flip: I'[i,j] = I[i, W-1-j] → dim=-1 (last spatial dim)
        img_hflip = torch.flip(image, dims=[-1]).to(device)
        pred_hflip = model(img_hflip)
        if isinstance(pred_hflip, list):
            pred_hflip = pred_hflip[0]
        pred_hflip = torch.flip(pred_hflip, dims=[-1])  # flip prediction back
        predictions.append(pred_hflip)

        # 3. Vertical flip → predict → flip back
        # Flip: I'[i,j] = I[H-1-i, j] → dim=-2
        img_vflip = torch.flip(image, dims=[-2]).to(device)
        pred_vflip = model(img_vflip)
        if isinstance(pred_vflip, list):
            pred_vflip = pred_vflip[0]
        pred_vflip = torch.flip(pred_vflip, dims=[-2])  # flip prediction back
        predictions.append(pred_vflip)

    # Average: reduces variance by factor of 3
    avg_pred = torch.stack(predictions).mean(dim=0)
    return avg_pred


def denormalize_image(
    tensor: torch.Tensor,
    mean: list = IMAGENET_MEAN,
    std: list = IMAGENET_STD,
) -> np.ndarray:
    """
    Reverse normalization for visualization.

    I_orig = I_norm * σ + μ

    Args:
        tensor: Normalized image tensor (C, H, W) or (B, C, H, W)
        mean: Channel means used in normalization
        std: Channel stds used in normalization

    Returns:
        Denormalized image as numpy array (H, W, C) in [0, 255] uint8
    """
    if tensor.dim() == 4:
        tensor = tensor[0]  # Take first batch element

    # (C, H, W) → (H, W, C)
    img = tensor.cpu().numpy().transpose(1, 2, 0)

    # Reverse normalization: I = I_norm * σ + μ
    img = img * np.array(std) + np.array(mean)

    # Clip to [0, 1] then scale to [0, 255]
    img = np.clip(img, 0, 1) * 255
    return img.astype(np.uint8)


if __name__ == "__main__":
    # Validate transforms
    print("=" * 60)
    print("Augmentation Pipeline Validation")
    print("=" * 60)

    # Create dummy image and mask
    image = np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8)
    mask = np.zeros((480, 640), dtype=np.uint8)
    mask[100:300, 150:450] = 255  # Rectangular foreground region

    # Test training transforms
    train_tf = get_train_transforms()
    result = train_tf(image=image, mask=mask)
    img_t = result["image"]
    mask_t = result["mask"]

    print(f"  Input image:  {image.shape} ({image.dtype})")
    print(f"  Input mask:   {mask.shape} ({mask.dtype})")
    print(f"  Output image: {img_t.shape} ({img_t.dtype})")
    print(f"  Output mask:  {mask_t.shape} ({mask_t.dtype})")
    assert img_t.shape == (3, INPUT_SIZE, INPUT_SIZE), f"Image shape mismatch: {img_t.shape}"
    assert mask_t.shape == (INPUT_SIZE, INPUT_SIZE), f"Mask shape mismatch: {mask_t.shape}"

    # Test val transforms
    val_tf = get_val_transforms()
    result = val_tf(image=image, mask=mask)
    img_v = result["image"]
    mask_v = result["mask"]
    print(f"  Val image:    {img_v.shape}")
    print(f"  Val mask:     {mask_v.shape}")

    # Test denormalization
    img_denorm = denormalize_image(img_v)
    print(f"  Denormalized: {img_denorm.shape} ({img_denorm.dtype})")
    assert img_denorm.dtype == np.uint8
    assert img_denorm.min() >= 0 and img_denorm.max() <= 255

    # Run multiple times to verify no crashes from random transforms
    for i in range(50):
        result = train_tf(image=image, mask=mask)
    print(f"  50 random augmentations: all passed")

    print("\n✓ All augmentation transforms validated!")
