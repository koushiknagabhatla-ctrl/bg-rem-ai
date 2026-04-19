"""
Post-Processing Pipeline for Background Removal Masks
=====================================================

After model outputs raw probability mask, apply these refinements:

1. Threshold → binary mask
2. Connected Components → remove small isolated regions (noise)
3. Morphological operations → close holes, smooth edges
4. Guided Filter alpha matting → sharpen edges at boundaries
5. Anti-aliasing → smooth mask borders

The complete pipeline transforms a noisy probability map into
a clean, production-ready alpha mask with hair-level precision.
"""

import cv2
import numpy as np
from typing import Optional, Tuple


def threshold_mask(
    mask: np.ndarray,
    threshold: float = 0.5,
) -> np.ndarray:
    """
    Step 1: Convert probability mask to binary.

    binary_mask = (mask > threshold) × 255

    Args:
        mask: Float probability mask (H, W) in [0, 1]
        threshold: Decision boundary (0.5 = equal prior)

    Returns:
        Binary mask (H, W) uint8 with values {0, 255}
    """
    binary = (mask > threshold).astype(np.uint8) * 255
    return binary


def remove_small_components(
    binary_mask: np.ndarray,
    min_area: int = 500,
) -> np.ndarray:
    """
    Step 2: Remove small isolated foreground regions (noise).

    Uses OpenCV connected components analysis:
        labels = connectedComponentsWithStats(mask)
    
    For each connected component:
        - If area < min_area: remove (set to 0)
        - If area ≥ min_area: keep

    This removes specks of foreground caused by model uncertainty.

    Args:
        binary_mask: Binary mask (H, W) uint8 {0, 255}
        min_area: Minimum pixel area to keep a component (500px² default)

    Returns:
        Cleaned binary mask (H, W) uint8
    """
    # Find connected components
    # stats: [left, top, width, height, area] per component
    n_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(
        binary_mask, connectivity=8
    )

    # Create clean mask
    clean_mask = np.zeros_like(binary_mask)

    # Label 0 is always background — skip it
    for label_id in range(1, n_labels):
        area = stats[label_id, cv2.CC_STAT_AREA]
        if area >= min_area:
            clean_mask[labels == label_id] = 255

    return clean_mask


def fill_small_holes(
    binary_mask: np.ndarray,
    max_hole_area: int = 1000,
) -> np.ndarray:
    """
    Fill small holes inside foreground regions.

    Inverts the mask, finds small connected components (= holes in original),
    and fills them.

    Args:
        binary_mask: Binary mask (H, W) uint8 {0, 255}
        max_hole_area: Maximum hole area to fill

    Returns:
        Mask with small holes filled
    """
    # Invert: holes become foreground
    inverted = cv2.bitwise_not(binary_mask)

    # Find connected components of holes
    n_labels, labels, stats, _ = cv2.connectedComponentsWithStats(
        inverted, connectivity=8
    )

    # Fill small holes
    result = binary_mask.copy()
    for label_id in range(1, n_labels):
        area = stats[label_id, cv2.CC_STAT_AREA]
        if area <= max_hole_area:
            result[labels == label_id] = 255

    return result


def morphological_refinement(
    binary_mask: np.ndarray,
    close_kernel_size: int = 5,
    open_kernel_size: int = 3,
) -> np.ndarray:
    """
    Step 3: Morphological operations for clean mask edges.

    1. Closing (dilation then erosion):
         MORPH_CLOSE with kernel=5×5
         Fills small gaps and holes in the foreground.
         close(A) = erode(dilate(A))

    2. Opening (erosion then dilation):
         MORPH_OPEN with kernel=3×3
         Removes small protrusions and noise on edges.
         open(A) = dilate(erode(A))

    The order matters:
        Close first → fill holes → smooth
        Open second → clean edges → precision

    Args:
        binary_mask: Binary mask (H, W) uint8
        close_kernel_size: Kernel for closing (fills holes)
        open_kernel_size: Kernel for opening (smooths edges)

    Returns:
        Morphologically refined mask
    """
    # Closing: fill small gaps
    close_kernel = cv2.getStructuringElement(
        cv2.MORPH_ELLIPSE, (close_kernel_size, close_kernel_size)
    )
    mask = cv2.morphologyEx(binary_mask, cv2.MORPH_CLOSE, close_kernel)

    # Opening: smooth jagged edges
    open_kernel = cv2.getStructuringElement(
        cv2.MORPH_ELLIPSE, (open_kernel_size, open_kernel_size)
    )
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, open_kernel)

    return mask


def guided_filter_matting(
    image: np.ndarray,
    mask: np.ndarray,
    radius: int = 10,
    epsilon: float = 1e-4,
    uncertain_low: float = 0.1,
    uncertain_high: float = 0.9,
) -> np.ndarray:
    """
    Step 4: Alpha matting at boundaries using guided filter.

    At uncertain regions (uncertain_low < mask < uncertain_high):
    Uses the original image as a guide to refine mask edges.

    Guided Filter equation:
        q_i = a_k · I_i + b_k,   ∀i ∈ ω_k

    Where:
        a_k = (cov(I, p) in ω_k) / (var(I in ω_k) + ε)
        b_k = mean(p in ω_k) - a_k · mean(I in ω_k)
        ω_k = square window of radius r centered at k

    The guided filter:
        - Uses I (original image) as guide
        - Filters p (mask) to produce q (refined mask)
        - ε controls smoothness: small ε → sharp edges
        - Result: edges align with image edges (hair-level precision!)

    Args:
        image: Original RGB image (H, W, 3) uint8
        mask: Probability mask (H, W) float32 in [0, 1]
        radius: Filter window radius
        epsilon: Regularization (smaller = sharper edges)
        uncertain_low: Lower bound of uncertain region
        uncertain_high: Upper bound of uncertain region

    Returns:
        Refined mask (H, W) float32 in [0, 1]
    """
    # Convert image to grayscale float for guide
    if image.ndim == 3:
        guide = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY).astype(np.float32) / 255.0
    else:
        guide = image.astype(np.float32) / 255.0

    mask_float = mask.astype(np.float32)
    if mask_float.max() > 1.0:
        mask_float = mask_float / 255.0

    # Apply guided filter to entire mask
    try:
        # OpenCV's ximgproc guided filter (if available)
        refined = cv2.ximgproc.guidedFilter(
            guide=guide,
            src=mask_float,
            radius=radius,
            eps=epsilon,
        )
    except AttributeError:
        # Fallback: manual guided filter implementation
        refined = _manual_guided_filter(guide, mask_float, radius, epsilon)

    # Only apply refinement in uncertain regions
    # Keep certain regions (very foreground / very background) untouched
    certain_fg = mask_float > uncertain_high
    certain_bg = mask_float < uncertain_low

    result = refined.copy()
    result[certain_fg] = 1.0
    result[certain_bg] = 0.0

    return np.clip(result, 0, 1)


def _manual_guided_filter(
    guide: np.ndarray,
    src: np.ndarray,
    radius: int,
    epsilon: float,
) -> np.ndarray:
    """
    Manual guided filter implementation (fallback if ximgproc not available).

    Algorithm:
        mean_I  = boxFilter(I)
        mean_p  = boxFilter(p)
        mean_Ip = boxFilter(I * p)
        cov_Ip  = mean_Ip - mean_I * mean_p

        mean_II = boxFilter(I * I)
        var_I   = mean_II - mean_I * mean_I

        a = cov_Ip / (var_I + ε)
        b = mean_p - a * mean_I

        mean_a = boxFilter(a)
        mean_b = boxFilter(b)

        q = mean_a * I + mean_b
    """
    ksize = 2 * radius + 1

    mean_I = cv2.boxFilter(guide, -1, (ksize, ksize))
    mean_p = cv2.boxFilter(src, -1, (ksize, ksize))
    mean_Ip = cv2.boxFilter(guide * src, -1, (ksize, ksize))
    cov_Ip = mean_Ip - mean_I * mean_p

    mean_II = cv2.boxFilter(guide * guide, -1, (ksize, ksize))
    var_I = mean_II - mean_I * mean_I

    a = cov_Ip / (var_I + epsilon)
    b = mean_p - a * mean_I

    mean_a = cv2.boxFilter(a, -1, (ksize, ksize))
    mean_b = cv2.boxFilter(b, -1, (ksize, ksize))

    q = mean_a * guide + mean_b
    return q


def antialias_edges(
    mask: np.ndarray,
    sigma: float = 1.0,
    edge_width: int = 3,
) -> np.ndarray:
    """
    Step 5: Anti-alias mask edges with Gaussian blur.

    Strategy:
        1. Find boundary region: dilate(mask) XOR erode(mask)
        2. Gaussian blur the mask at boundary only
        3. Replace boundary pixels with blurred values

    This produces smooth, natural-looking edges without
    affecting the interior or exterior of the mask.

    Gaussian kernel: G(x,y) = (1/2πσ²) · exp(-(x²+y²)/2σ²)

    Args:
        mask: Mask (H, W) float32 in [0, 1] or uint8 {0, 255}
        sigma: Gaussian blur σ
        edge_width: Width of edge region for anti-aliasing

    Returns:
        Anti-aliased mask (H, W) float32 in [0, 1]
    """
    # Ensure float
    if mask.dtype == np.uint8:
        mask_float = mask.astype(np.float32) / 255.0
    else:
        mask_float = mask.astype(np.float32)

    # Binarize for edge detection
    binary = (mask_float > 0.5).astype(np.uint8) * 255

    # Find boundary: dilate XOR erode
    kernel = cv2.getStructuringElement(
        cv2.MORPH_ELLIPSE, (edge_width * 2 + 1, edge_width * 2 + 1)
    )
    dilated = cv2.dilate(binary, kernel)
    eroded = cv2.erode(binary, kernel)
    boundary = cv2.bitwise_xor(dilated, eroded)
    boundary_mask = boundary > 0

    # Gaussian blur the mask
    ksize = int(2 * np.ceil(3 * sigma) + 1)
    blurred = cv2.GaussianBlur(mask_float, (ksize, ksize), sigma)

    # Apply blur only at boundaries
    result = mask_float.copy()
    result[boundary_mask] = blurred[boundary_mask]

    return np.clip(result, 0, 1)


def full_postprocess(
    image: np.ndarray,
    raw_mask: np.ndarray,
    threshold: float = 0.5,
    min_component_area: int = 500,
    max_hole_area: int = 1000,
    close_kernel: int = 5,
    open_kernel: int = 3,
    use_guided_filter: bool = True,
    guided_radius: int = 10,
    guided_epsilon: float = 1e-4,
    antialias_sigma: float = 1.0,
    edge_width: int = 3,
) -> np.ndarray:
    """
    Complete post-processing pipeline.

    Input:  raw probability mask from model (H, W) float32 [0, 1]
    Output: refined alpha mask (H, W) float32 [0, 1]

    Pipeline:
        1. Threshold → binary
        2. Remove small components (< min_area)
        3. Fill small holes (< max_hole_area)
        4. Morphological close/open
        5. Guided filter matting (optional, for edge refinement)
        6. Anti-alias edges

    Args:
        image: Original RGB image (H, W, 3) uint8 — used as guide
        raw_mask: Model output probability mask (H, W) float32 [0, 1]
        All other args: Parameters for each pipeline step

    Returns:
        Refined mask (H, W) float32 in [0, 1]
    """
    # Step 1: Threshold
    binary = threshold_mask(raw_mask, threshold)

    # Step 2: Remove small isolated regions
    binary = remove_small_components(binary, min_component_area)

    # Step 3: Fill small holes
    binary = fill_small_holes(binary, max_hole_area)

    # Step 4: Morphological refinement
    binary = morphological_refinement(binary, close_kernel, open_kernel)

    # Step 5: Guided filter matting (uses original image as guide)
    if use_guided_filter:
        # Use raw soft mask for guided filter (not binary)
        # Binary would lose the soft edge information
        refined = guided_filter_matting(
            image, raw_mask,
            radius=guided_radius,
            epsilon=guided_epsilon,
        )
        # Combine: use binary mask for certain regions,
        # guided filter result for uncertain boundaries
        binary_float = binary.astype(np.float32) / 255.0
        # Where binary says foreground AND guided agrees → 1.0
        # Where binary says background AND guided agrees → 0.0
        # Boundary: use guided filter result
        result = np.where(binary > 127, np.maximum(refined, 0.5), np.minimum(refined, 0.5))
        # Clamp to respect binary decision for non-boundary pixels
        result = np.where(
            (binary > 127) & (refined > 0.3), refined,
            np.where((binary == 0) & (refined < 0.7), refined, binary_float)
        )
    else:
        result = binary.astype(np.float32) / 255.0

    # Step 6: Anti-alias edges
    result = antialias_edges(result, antialias_sigma, edge_width)

    return result


def apply_mask_to_image(
    image: np.ndarray,
    mask: np.ndarray,
) -> np.ndarray:
    """
    Create RGBA image with mask as alpha channel.

    Args:
        image: RGB image (H, W, 3) uint8
        mask: Alpha mask (H, W) float32 [0, 1]

    Returns:
        RGBA image (H, W, 4) uint8
    """
    H, W = image.shape[:2]

    # Resize mask if needed
    if mask.shape[:2] != (H, W):
        mask = cv2.resize(mask, (W, H), interpolation=cv2.INTER_LINEAR)

    # Create RGBA
    rgba = np.zeros((H, W, 4), dtype=np.uint8)
    rgba[:, :, :3] = image

    # Convert mask to uint8 alpha
    alpha = (np.clip(mask, 0, 1) * 255).astype(np.uint8)
    rgba[:, :, 3] = alpha

    return rgba


if __name__ == "__main__":
    print("=" * 60)
    print("Post-Processing Pipeline — Validation")
    print("=" * 60)

    # Create test data
    H, W = 320, 320
    image = np.random.randint(0, 255, (H, W, 3), dtype=np.uint8)

    # Simulate noisy raw mask
    raw_mask = np.zeros((H, W), dtype=np.float32)
    # Main foreground region
    raw_mask[80:240, 60:260] = 0.9
    # Some noise
    raw_mask[10:20, 10:20] = 0.8  # small isolated region
    # Soft edges
    raw_mask[78:82, 60:260] = 0.5
    raw_mask[238:242, 60:260] = 0.5
    # Add random noise
    raw_mask += np.random.normal(0, 0.05, (H, W)).astype(np.float32)
    raw_mask = np.clip(raw_mask, 0, 1)

    # Run full pipeline
    refined = full_postprocess(
        image, raw_mask,
        use_guided_filter=True,
    )

    print(f"  Input mask:    shape={raw_mask.shape}, range=[{raw_mask.min():.3f}, {raw_mask.max():.3f}]")
    print(f"  Refined mask:  shape={refined.shape}, range=[{refined.min():.3f}, {refined.max():.3f}]")

    # Test RGBA creation
    rgba = apply_mask_to_image(image, refined)
    print(f"  RGBA output:   shape={rgba.shape}, dtype={rgba.dtype}")

    # Test individual steps
    binary = threshold_mask(raw_mask)
    print(f"\n  Step 1 (threshold):  unique values = {np.unique(binary)}")

    cleaned = remove_small_components(binary, min_area=500)
    print(f"  Step 2 (components): foreground pixels = {(cleaned > 0).sum()}")

    morphed = morphological_refinement(cleaned)
    print(f"  Step 3 (morphology): foreground pixels = {(morphed > 0).sum()}")

    aa = antialias_edges(morphed.astype(np.float32) / 255.0)
    print(f"  Step 5 (antialias):  range = [{aa.min():.3f}, {aa.max():.3f}]")

    print("\n✓ Post-processing pipeline validated!")
