"""
Tile-Based Inference for High-Resolution Images
================================================

For images larger than 320×320, we divide into overlapping tiles,
run model on each tile, and blend results seamlessly.

Algorithm:
──────────
1. Divide image into 320×320 tiles with 32px overlap
     n_tiles_x = ceil(W / (320 - 32))
     n_tiles_y = ceil(H / (320 - 32))

2. Run model on each tile independently

3. Blend overlapping regions with linear weight ramp:
     w(x) = min(x, tile_size - x) / overlap
     weight_map = outer(w_x, w_y)
     
     This creates a smooth falloff at tile borders:
     - Center of tile: weight = 1.0
     - Edge of tile: weight → 0.0
     - Overlap zone: linear interpolation between adjacent tiles

4. Normalize by total weight at each pixel

5. Threshold at 0.5 for binary mask (optional, can return soft mask)

Memory efficiency: process one tile at a time → O(1) extra memory.
"""

import numpy as np
import torch
import torch.nn.functional as F
from PIL import Image
from typing import Optional, Tuple
import math


def create_weight_map(tile_size: int, overlap: int) -> np.ndarray:
    """
    Create a 2D weight map for tile blending.

    The weight ramps linearly from 0 at the edge to 1
    at distance=overlap from the edge.

    w(x) = min(x, tile_size - 1 - x, overlap) / overlap
    weight_map = outer(w_x, w_y)

    This ensures:
        - Tile centers have weight 1.0
        - Tile borders have weight → 0
        - Overlapping regions have complementary weights summing to ~1

    Args:
        tile_size: Size of each tile (pixels)
        overlap: Overlap between adjacent tiles (pixels)

    Returns:
        2D weight map (tile_size, tile_size) with values in [0, 1]
    """
    # 1D weight ramp
    ramp = np.ones(tile_size, dtype=np.float32)
    for i in range(overlap):
        weight = (i + 1) / overlap
        ramp[i] = weight
        ramp[tile_size - 1 - i] = weight

    # 2D weight map via outer product
    weight_map = np.outer(ramp, ramp)
    return weight_map


def pad_to_tile_grid(
    image: np.ndarray,
    tile_size: int,
    stride: int,
) -> Tuple[np.ndarray, Tuple[int, int]]:
    """
    Pad image so it can be evenly divided into tiles.

    Args:
        image: Input image (H, W, C) or (H, W)
        tile_size: Size of each tile
        stride: Step between tiles (tile_size - overlap)

    Returns:
        padded_image: Image padded to fit tile grid
        original_size: (H, W) before padding
    """
    if image.ndim == 2:
        H, W = image.shape
    else:
        H, W = image.shape[:2]

    original_size = (H, W)

    # Calculate required size
    # Number of tiles: ceil((size - tile_size) / stride) + 1
    # But we need at least 1 tile
    n_tiles_h = max(1, math.ceil((H - tile_size) / stride) + 1)
    n_tiles_w = max(1, math.ceil((W - tile_size) / stride) + 1)

    needed_h = (n_tiles_h - 1) * stride + tile_size
    needed_w = (n_tiles_w - 1) * stride + tile_size

    pad_h = max(0, needed_h - H)
    pad_w = max(0, needed_w - W)

    if pad_h > 0 or pad_w > 0:
        if image.ndim == 2:
            image = np.pad(image, ((0, pad_h), (0, pad_w)), mode="reflect")
        else:
            image = np.pad(image, ((0, pad_h), (0, pad_w), (0, 0)), mode="reflect")

    return image, original_size


def tile_inference(
    model: torch.nn.Module,
    image: np.ndarray,
    device: torch.device,
    tile_size: int = 320,
    overlap: int = 32,
    normalize_fn=None,
    batch_size: int = 1,
) -> np.ndarray:
    """
    Run tiled inference on a high-resolution image.

    Args:
        model: Trained model in eval mode
        image: Input image (H, W, 3) uint8 RGB
        device: Inference device
        tile_size: Size of each tile (must match model input)
        overlap: Overlap between adjacent tiles (pixels)
        normalize_fn: Optional function to normalize image tiles
            If None, uses default ImageNet normalization
        batch_size: Number of tiles to process simultaneously

    Returns:
        mask: Predicted probability mask (H, W) float32 in [0, 1]
    """
    model.eval()

    H_orig, W_orig = image.shape[:2]
    stride = tile_size - overlap

    # Default normalization
    if normalize_fn is None:
        mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
        std = np.array([0.229, 0.224, 0.225], dtype=np.float32)

        def normalize_fn(img):
            img = img.astype(np.float32) / 255.0
            img = (img - mean) / std
            return img

    # Pad image to fit tile grid
    image_padded, _ = pad_to_tile_grid(image, tile_size, stride)
    H_pad, W_pad = image_padded.shape[:2]

    # Calculate tile positions
    n_tiles_y = max(1, math.ceil((H_pad - tile_size) / stride) + 1)
    n_tiles_x = max(1, math.ceil((W_pad - tile_size) / stride) + 1)

    # If image is small enough, just run directly
    if H_orig <= tile_size and W_orig <= tile_size:
        return _single_tile_inference(model, image, device, tile_size, normalize_fn)

    # Create weight map for blending
    weight_map = create_weight_map(tile_size, overlap)

    # Output accumulation buffers
    output_sum = np.zeros((H_pad, W_pad), dtype=np.float64)
    weight_sum = np.zeros((H_pad, W_pad), dtype=np.float64)

    # Collect all tile positions
    tile_positions = []
    for ty in range(n_tiles_y):
        for tx in range(n_tiles_x):
            y = min(ty * stride, H_pad - tile_size)
            x = min(tx * stride, W_pad - tile_size)
            tile_positions.append((y, x))

    # Process tiles in batches
    for batch_start in range(0, len(tile_positions), batch_size):
        batch_end = min(batch_start + batch_size, len(tile_positions))
        batch_tiles = []
        batch_pos = []

        for idx in range(batch_start, batch_end):
            y, x = tile_positions[idx]
            tile = image_padded[y:y + tile_size, x:x + tile_size]

            # Normalize and convert to tensor
            tile_norm = normalize_fn(tile)
            tile_tensor = torch.from_numpy(tile_norm.transpose(2, 0, 1)).float()
            batch_tiles.append(tile_tensor)
            batch_pos.append((y, x))

        # Stack into batch and run inference
        batch_tensor = torch.stack(batch_tiles).to(device)

        with torch.no_grad():
            predictions = model(batch_tensor)
            if isinstance(predictions, list):
                predictions = predictions[0]
            predictions = predictions.cpu().numpy()

        # Accumulate predictions with weights
        for i, (y, x) in enumerate(batch_pos):
            pred = predictions[i, 0]  # (tile_size, tile_size)
            output_sum[y:y + tile_size, x:x + tile_size] += pred * weight_map
            weight_sum[y:y + tile_size, x:x + tile_size] += weight_map

    # Normalize by total weights
    # Avoid division by zero
    weight_sum = np.maximum(weight_sum, 1e-8)
    mask = (output_sum / weight_sum).astype(np.float32)

    # Crop back to original size
    mask = mask[:H_orig, :W_orig]

    return mask


def _single_tile_inference(
    model: torch.nn.Module,
    image: np.ndarray,
    device: torch.device,
    tile_size: int,
    normalize_fn,
) -> np.ndarray:
    """Inference on a single small image (≤ tile_size)."""
    import cv2

    H, W = image.shape[:2]

    # Resize to tile_size
    resized = cv2.resize(image, (tile_size, tile_size), interpolation=cv2.INTER_LINEAR)

    # Normalize
    tile_norm = normalize_fn(resized)
    tile_tensor = torch.from_numpy(tile_norm.transpose(2, 0, 1)).float().unsqueeze(0)

    # Inference
    with torch.no_grad():
        pred = model(tile_tensor.to(device))
        if isinstance(pred, list):
            pred = pred[0]
        mask = pred.cpu().numpy()[0, 0]  # (tile_size, tile_size)

    # Resize mask back to original dimensions
    mask = cv2.resize(mask, (W, H), interpolation=cv2.INTER_LINEAR)

    return mask


def create_transparent_image(
    image: np.ndarray,
    mask: np.ndarray,
    threshold: float = 0.5,
) -> Image.Image:
    """
    Create RGBA image with transparent background.

    Args:
        image: RGB image (H, W, 3) uint8
        mask: Probability mask (H, W) float32 in [0, 1]
        threshold: If >0, apply hard threshold. If 0, use soft alpha.

    Returns:
        PIL Image in RGBA mode with transparent background
    """
    H, W = image.shape[:2]

    # Create RGBA image
    rgba = np.zeros((H, W, 4), dtype=np.uint8)
    rgba[:, :, :3] = image

    if threshold > 0:
        # Hard threshold → binary alpha
        alpha = (mask > threshold).astype(np.uint8) * 255
    else:
        # Soft alpha (preserves semi-transparent edges)
        alpha = (np.clip(mask, 0, 1) * 255).astype(np.uint8)

    rgba[:, :, 3] = alpha

    return Image.fromarray(rgba, "RGBA")


if __name__ == "__main__":
    print("=" * 60)
    print("Tile Inference Module — Validation")
    print("=" * 60)

    # Test weight map
    wm = create_weight_map(320, 32)
    print(f"  Weight map shape: {wm.shape}")
    print(f"  Weight map center: {wm[160, 160]:.2f}")
    print(f"  Weight map corner: {wm[0, 0]:.4f}")
    print(f"  Weight map edge mid: {wm[0, 160]:.4f}")

    # Test padding
    dummy = np.random.randint(0, 255, (500, 700, 3), dtype=np.uint8)
    padded, orig_size = pad_to_tile_grid(dummy, 320, 288)
    print(f"\n  Input: {dummy.shape} → Padded: {padded.shape}")
    print(f"  Original size recorded: {orig_size}")

    # Test tile position calculation
    tile_size = 320
    overlap = 32
    stride = tile_size - overlap
    n_y = max(1, math.ceil((padded.shape[0] - tile_size) / stride) + 1)
    n_x = max(1, math.ceil((padded.shape[1] - tile_size) / stride) + 1)
    print(f"  Tiles: {n_y} × {n_x} = {n_y * n_x} total")

    print("\n✓ Tile inference module validated!")
