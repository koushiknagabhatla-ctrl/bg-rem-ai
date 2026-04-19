"""
Evaluation Metrics and Visualization
=====================================

Complete evaluation suite with 5 metrics:
    1. IoU (Jaccard Index)     — region overlap
    2. F1 / Dice Score         — harmonic mean of P/R
    3. MAE                     — pixel-level error
    4. Boundary F1 (BF)        — edge quality
    5. Mean Boundary IoU (BIoU)— boundary accuracy

Plus:
    - Confusion matrix
    - Per-image breakdown
    - Visual grid: original | GT | prediction | overlay
    - Error analysis: worst predictions
"""

import os
import sys
import logging
import argparse
from pathlib import Path
from typing import Optional

import cv2
import numpy as np
import torch
from torch.utils.data import DataLoader

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from model.unet import BGRemovalUNet
from data.dataset import SegmentationDataset
from data.augmentations import get_val_transforms, denormalize_image

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(message)s")
logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────
# Metric Functions
# ─────────────────────────────────────────────────────────────────

def compute_iou(pred: np.ndarray, gt: np.ndarray, threshold: float = 0.5) -> float:
    """
    IoU = TP / (TP + FP + FN) = |P ∩ G| / |P ∪ G|

    Perfect = 1.0, Worst = 0.0
    Target: IoU > 0.85 = good model
    """
    pred_bin = (pred > threshold).astype(np.uint8)
    gt_bin = (gt > threshold).astype(np.uint8)

    intersection = (pred_bin & gt_bin).sum()
    union = (pred_bin | gt_bin).sum()

    if union == 0:
        return 1.0  # Both empty → perfect

    return float(intersection) / float(union)


def compute_dice(pred: np.ndarray, gt: np.ndarray, threshold: float = 0.5) -> float:
    """
    Dice = 2·TP / (2·TP + FP + FN) = 2·|P ∩ G| / (|P| + |G|)

    Equivalently: Dice = 2·IoU / (1 + IoU)
    Dice ≥ IoU always.

    Harmonic mean of Precision and Recall:
        Precision = TP / (TP + FP)
        Recall    = TP / (TP + FN)
        Dice      = 2 · P · R / (P + R)
    """
    pred_bin = (pred > threshold).astype(np.uint8)
    gt_bin = (gt > threshold).astype(np.uint8)

    intersection = (pred_bin & gt_bin).sum()
    total = pred_bin.sum() + gt_bin.sum()

    if total == 0:
        return 1.0

    return float(2.0 * intersection) / float(total)


def compute_mae(pred: np.ndarray, gt: np.ndarray) -> float:
    """
    MAE = (1/HW) · ΣΣ |p_ij - g_ij|

    Mean Absolute Error on probability masks.
    Target: MAE < 0.05 = good model
    """
    return float(np.abs(pred.astype(np.float64) - gt.astype(np.float64)).mean())


def extract_boundary(mask: np.ndarray, radius: int = 3) -> np.ndarray:
    """
    Extract boundary pixels using morphological erosion.

    B = mask - erode(mask)

    Boundary pixels are those within 'radius' pixels of the mask edge.
    """
    mask_uint8 = (mask > 0.5).astype(np.uint8) * 255
    kernel = cv2.getStructuringElement(
        cv2.MORPH_ELLIPSE, (2 * radius + 1, 2 * radius + 1)
    )
    eroded = cv2.erode(mask_uint8, kernel)
    boundary = mask_uint8 - eroded
    return boundary


def compute_boundary_f1(
    pred: np.ndarray,
    gt: np.ndarray,
    tolerance: int = 3,
) -> float:
    """
    Boundary F1 Score — measures edge quality specifically.

    Algorithm:
        1. Extract boundaries: B_pred, B_gt
        2. Dilate B_gt by tolerance radius
        3. Precision = |B_pred ∩ dilated(B_gt)| / |B_pred|
        4. Recall = |B_gt ∩ dilated(B_pred)| / |B_gt|
        5. BF = 2·P·R / (P + R)

    Tolerance radius = 3 pixels: prediction boundary must be
    within 3 pixels of GT boundary to count as correct.

    Target: BF > 0.75 = sharp, accurate edges
    """
    b_pred = extract_boundary(pred, radius=1)
    b_gt = extract_boundary(gt, radius=1)

    # Dilate boundaries for tolerance matching
    kernel = cv2.getStructuringElement(
        cv2.MORPH_ELLIPSE, (2 * tolerance + 1, 2 * tolerance + 1)
    )
    b_gt_dilated = cv2.dilate(b_gt, kernel)
    b_pred_dilated = cv2.dilate(b_pred, kernel)

    # Count boundary pixels
    n_pred = max(b_pred.sum(), 1)
    n_gt = max(b_gt.sum(), 1)

    # Precision: how many predicted boundary pixels are near GT boundary
    precision = float((b_pred & b_gt_dilated).sum()) / float(n_pred)

    # Recall: how many GT boundary pixels are near predicted boundary
    recall = float((b_gt & b_pred_dilated).sum()) / float(n_gt)

    if precision + recall == 0:
        return 0.0

    return 2.0 * precision * recall / (precision + recall)


def compute_boundary_iou(
    pred: np.ndarray,
    gt: np.ndarray,
    radius: int = 3,
) -> float:
    """
    Mean Boundary IoU — IoU computed only on boundary regions.

    1. Extract boundary band from GT (dilate - erode)
    2. Mask both pred and GT to boundary region only
    3. Compute IoU on this masked region

    High BIoU = clean, accurate object edges.
    """
    gt_uint8 = (gt > 0.5).astype(np.uint8) * 255
    kernel = cv2.getStructuringElement(
        cv2.MORPH_ELLIPSE, (2 * radius + 1, 2 * radius + 1)
    )

    dilated = cv2.dilate(gt_uint8, kernel)
    eroded = cv2.erode(gt_uint8, kernel)
    boundary_band = dilated - eroded
    boundary_mask = boundary_band > 0

    if boundary_mask.sum() == 0:
        return 1.0  # No boundary → trivially correct

    pred_at_boundary = (pred > 0.5) & boundary_mask
    gt_at_boundary = (gt > 0.5) & boundary_mask

    intersection = (pred_at_boundary & gt_at_boundary).sum()
    union = (pred_at_boundary | gt_at_boundary).sum()

    if union == 0:
        return 1.0

    return float(intersection) / float(union)


def compute_confusion_matrix(
    pred: np.ndarray, gt: np.ndarray, threshold: float = 0.5
) -> dict:
    """
    Compute confusion matrix elements.

    Returns: {TP, FP, FN, TN, precision, recall, accuracy}
    """
    pred_bin = (pred > threshold).astype(bool)
    gt_bin = (gt > threshold).astype(bool)

    tp = (pred_bin & gt_bin).sum()
    fp = (pred_bin & ~gt_bin).sum()
    fn = (~pred_bin & gt_bin).sum()
    tn = (~pred_bin & ~gt_bin).sum()

    total = tp + fp + fn + tn
    precision = tp / max(tp + fp, 1)
    recall = tp / max(tp + fn, 1)
    accuracy = (tp + tn) / max(total, 1)

    return {
        "TP": int(tp), "FP": int(fp),
        "FN": int(fn), "TN": int(tn),
        "precision": float(precision),
        "recall": float(recall),
        "accuracy": float(accuracy),
    }


# ─────────────────────────────────────────────────────────────────
# Full Evaluation
# ─────────────────────────────────────────────────────────────────

def evaluate_model(
    model: torch.nn.Module,
    dataloader: DataLoader,
    device: torch.device,
    output_dir: str = "eval_results",
    n_vis_samples: int = 10,
    n_worst: int = 10,
) -> dict:
    """
    Complete model evaluation.

    Computes all 5 metrics on the full dataset, generates
    visualizations, and identifies worst predictions.
    """
    model.eval()
    os.makedirs(output_dir, exist_ok=True)

    # Accumulators
    all_metrics = []
    all_ious = []
    all_paths = []

    # Aggregate confusion matrix
    total_cm = {"TP": 0, "FP": 0, "FN": 0, "TN": 0}

    logger.info(f"Evaluating on {len(dataloader.dataset)} samples...")

    for batch_idx, batch in enumerate(dataloader):
        images = batch["image"].to(device)
        masks = batch["mask"]
        paths = batch["path"]

        with torch.no_grad():
            preds = model(images)
            if isinstance(preds, list):
                preds = preds[0]
            preds = preds.cpu()

        # Per-sample metrics
        for i in range(images.size(0)):
            pred_np = preds[i, 0].numpy()
            gt_np = masks[i, 0].numpy()

            metrics = {
                "path": paths[i],
                "iou": compute_iou(pred_np, gt_np),
                "dice": compute_dice(pred_np, gt_np),
                "mae": compute_mae(pred_np, gt_np),
                "boundary_f1": compute_boundary_f1(pred_np, gt_np),
                "boundary_iou": compute_boundary_iou(pred_np, gt_np),
            }
            all_metrics.append(metrics)
            all_ious.append(metrics["iou"])
            all_paths.append(paths[i])

            # Accumulate confusion matrix
            cm = compute_confusion_matrix(pred_np, gt_np)
            for key in total_cm:
                total_cm[key] += cm[key]

    # ── Aggregate Metrics ──
    n = len(all_metrics)
    aggregate = {
        "mean_iou": np.mean([m["iou"] for m in all_metrics]),
        "mean_dice": np.mean([m["dice"] for m in all_metrics]),
        "mean_mae": np.mean([m["mae"] for m in all_metrics]),
        "mean_boundary_f1": np.mean([m["boundary_f1"] for m in all_metrics]),
        "mean_boundary_iou": np.mean([m["boundary_iou"] for m in all_metrics]),
        "std_iou": np.std([m["iou"] for m in all_metrics]),
        "n_samples": n,
    }

    # Confusion matrix totals
    total_cm["precision"] = total_cm["TP"] / max(total_cm["TP"] + total_cm["FP"], 1)
    total_cm["recall"] = total_cm["TP"] / max(total_cm["TP"] + total_cm["FN"], 1)
    total_cm["accuracy"] = (total_cm["TP"] + total_cm["TN"]) / max(
        total_cm["TP"] + total_cm["FP"] + total_cm["FN"] + total_cm["TN"], 1
    )

    # ── Print Results ──
    print("\n" + "=" * 70)
    print("EVALUATION RESULTS")
    print("=" * 70)
    print(f"  Samples evaluated: {n}")
    print(f"  {'Metric':<25s} {'Mean':>10s} {'Std':>10s} {'Target':>12s}")
    print(f"  {'-'*25} {'-'*10} {'-'*10} {'-'*12}")
    print(f"  {'IoU (Jaccard)':<25s} {aggregate['mean_iou']:>10.4f} {aggregate['std_iou']:>10.4f} {'> 0.85':>12s}")
    print(f"  {'Dice (F1)':<25s} {aggregate['mean_dice']:>10.4f} {'':>10s} {'> 0.90':>12s}")
    print(f"  {'MAE':<25s} {aggregate['mean_mae']:>10.4f} {'':>10s} {'< 0.05':>12s}")
    print(f"  {'Boundary F1':<25s} {aggregate['mean_boundary_f1']:>10.4f} {'':>10s} {'> 0.75':>12s}")
    print(f"  {'Boundary IoU':<25s} {aggregate['mean_boundary_iou']:>10.4f} {'':>10s} {'> 0.70':>12s}")
    print()
    print(f"  Confusion Matrix:")
    print(f"    TP: {total_cm['TP']:,}  FP: {total_cm['FP']:,}")
    print(f"    FN: {total_cm['FN']:,}  TN: {total_cm['TN']:,}")
    print(f"    Precision: {total_cm['precision']:.4f}")
    print(f"    Recall:    {total_cm['recall']:.4f}")
    print(f"    Accuracy:  {total_cm['accuracy']:.4f}")

    # ── Visualizations ──
    _generate_visualizations(
        model, dataloader, device, output_dir,
        all_metrics, n_vis_samples, n_worst,
    )

    return {
        "aggregate": aggregate,
        "confusion_matrix": total_cm,
        "per_sample": all_metrics,
    }


def _generate_visualizations(
    model, dataloader, device, output_dir,
    all_metrics, n_vis_samples, n_worst,
):
    """Generate visual grids and error analysis."""
    try:
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
    except ImportError:
        logger.warning("matplotlib not available, skipping visualizations")
        return

    model.eval()

    # ── Sample Prediction Grid ──
    logger.info("Generating sample prediction grid...")
    batch = next(iter(dataloader))
    images = batch["image"][:n_vis_samples].to(device)
    masks = batch["mask"][:n_vis_samples]

    with torch.no_grad():
        preds = model(images)
        if isinstance(preds, list):
            preds = preds[0]
        preds = preds.cpu()

    n = min(n_vis_samples, images.size(0))
    fig, axes = plt.subplots(n, 4, figsize=(16, 4 * n))
    if n == 1:
        axes = axes.reshape(1, -1)

    for i in range(n):
        img = denormalize_image(images[i].cpu())
        gt = masks[i, 0].numpy()
        pred = preds[i, 0].numpy()

        iou = compute_iou(pred, gt)

        axes[i, 0].imshow(img)
        axes[i, 0].set_title("Original")
        axes[i, 0].axis("off")

        axes[i, 1].imshow(gt, cmap="gray", vmin=0, vmax=1)
        axes[i, 1].set_title("Ground Truth")
        axes[i, 1].axis("off")

        axes[i, 2].imshow(pred, cmap="gray", vmin=0, vmax=1)
        axes[i, 2].set_title(f"Prediction (IoU: {iou:.3f})")
        axes[i, 2].axis("off")

        # Overlay
        overlay = img.copy()
        pred_bin = (pred > 0.5).astype(np.uint8)
        overlay[pred_bin == 0] = overlay[pred_bin == 0] // 2
        axes[i, 3].imshow(overlay)
        axes[i, 3].set_title("Overlay")
        axes[i, 3].axis("off")

    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, "sample_grid.png"), dpi=150)
    plt.close()

    # ── Worst Predictions ──
    logger.info(f"Identifying worst {n_worst} predictions...")
    sorted_metrics = sorted(all_metrics, key=lambda x: x["iou"])
    worst = sorted_metrics[:n_worst]

    print(f"\n  Worst {n_worst} Predictions by IoU:")
    print(f"  {'#':>3s} {'IoU':>8s} {'Dice':>8s} {'MAE':>8s} {'Path'}")
    for i, m in enumerate(worst):
        print(f"  {i+1:>3d} {m['iou']:>8.4f} {m['dice']:>8.4f} {m['mae']:>8.4f} {Path(m['path']).name}")

    # ── IoU Distribution ──
    ious = [m["iou"] for m in all_metrics]
    fig, ax = plt.subplots(figsize=(10, 5))
    ax.hist(ious, bins=50, color="#4287f5", edgecolor="white", alpha=0.8)
    ax.axvline(np.mean(ious), color="red", linestyle="--", label=f"Mean: {np.mean(ious):.3f}")
    ax.axvline(0.85, color="green", linestyle="--", label="Target: 0.85")
    ax.set_xlabel("IoU")
    ax.set_ylabel("Count")
    ax.set_title("IoU Distribution")
    ax.legend()
    plt.savefig(os.path.join(output_dir, "iou_distribution.png"), dpi=150)
    plt.close()

    logger.info(f"  Visualizations saved to {output_dir}/")


def main():
    parser = argparse.ArgumentParser(description="Evaluate BG removal model")
    parser.add_argument("--data-dir", default="dataset", help="Dataset root")
    parser.add_argument("--split", default="test", help="Split to evaluate (test/val)")
    parser.add_argument("--model", default="checkpoints/best_model.pth", help="Model path")
    parser.add_argument("--input-size", type=int, default=320)
    parser.add_argument("--batch-size", type=int, default=8)
    parser.add_argument("--output-dir", default="eval_results")
    parser.add_argument("--n-vis", type=int, default=10, help="Number of visualization samples")
    parser.add_argument("--n-worst", type=int, default=10, help="Number of worst predictions to show")
    parser.add_argument("--cpu", action="store_true")

    args = parser.parse_args()

    device = torch.device("cpu" if args.cpu else ("cuda" if torch.cuda.is_available() else "cpu"))

    # Load model
    model = BGRemovalUNet(input_size=args.input_size)
    checkpoint = torch.load(args.model, map_location=device, weights_only=False)
    if "model_state_dict" in checkpoint:
        model.load_state_dict(checkpoint["model_state_dict"])
    else:
        model.load_state_dict(checkpoint)
    model = model.to(device)
    model.eval()

    # Load data
    transform = get_val_transforms(args.input_size)
    dataset = SegmentationDataset(
        os.path.join(args.data_dir, args.split, "images"),
        os.path.join(args.data_dir, args.split, "masks"),
        transform=transform,
    )
    loader = DataLoader(dataset, batch_size=args.batch_size, shuffle=False, num_workers=2)

    # Evaluate
    results = evaluate_model(model, loader, device, args.output_dir, args.n_vis, args.n_worst)

    # Save results
    import json
    with open(os.path.join(args.output_dir, "metrics.json"), "w") as f:
        json.dump({
            "aggregate": results["aggregate"],
            "confusion_matrix": results["confusion_matrix"],
        }, f, indent=2)

    print(f"\n✓ Evaluation complete! Results saved to {args.output_dir}/")


if __name__ == "__main__":
    main()
