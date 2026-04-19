"""
Complete Training Pipeline for Background Removal U-Net
=======================================================

Features:
    - Mixed Precision Training (AMP) for GPU efficiency
    - Gradient accumulation for effective larger batch sizes
    - Gradient clipping for training stability
    - Cosine annealing with warm restarts LR schedule
    - Linear warmup for first 5 epochs
    - Deep supervision loss
    - Full checkpoint system (resume after disconnect)
    - Early stopping with patience
    - Top-3 checkpoint tracking by validation IoU
    - Training/validation logging
    - Sample prediction visualization

Optimizer: AdamW
────────────────
Full equations:
    gₜ = ∇_θ Lₜ(θₜ₋₁)                              [gradient]
    mₜ = β₁·mₜ₋₁ + (1-β₁)·gₜ                      [1st moment]
    vₜ = β₂·vₜ₋₁ + (1-β₂)·gₜ²                     [2nd moment]
    m̂ₜ = mₜ / (1-β₁ᵗ)                               [bias correction]
    v̂ₜ = vₜ / (1-β₂ᵗ)                               [bias correction]
    θₜ = θₜ₋₁ - α·[m̂ₜ/(√v̂ₜ + ε) + λ·θₜ₋₁]        [update + decay]

Parameters:
    α  = 1e-4   (learning rate)
    β₁ = 0.9    (momentum decay)
    β₂ = 0.999  (RMS decay)
    ε  = 1e-8   (numerical stability)
    λ  = 1e-4   (weight decay — decoupled in AdamW)

Why AdamW over Adam:
    Adam L2: effectively reduces lr for large weights (coupled)
    AdamW: directly decays weights independent of gradient (decoupled)
    Result: AdamW gives better generalization in practice.

LR Schedule: Cosine Annealing with Warm Restarts
─────────────────────────────────────────────────
    ηₜ = η_min + 0.5·(η_max - η_min)·(1 + cos(π·T_cur/T_i))

    T_cur = iterations since last restart
    T_i = period of current cycle
    η_max = 1e-4, η_min = 1e-6

    Warm restarts: T_i doubles each cycle (T_mult=2)
        Cycle 1: epochs 0-10
        Cycle 2: epochs 10-30
        Cycle 3: epochs 30-70

    Linear warmup for first 5 epochs:
        η = η_max · (epoch / warmup_epochs)
        Prevents gradient explosion at training start.
"""

import os
import sys
import json
import time
import random
import logging
import argparse
from pathlib import Path
from typing import Optional
from collections import OrderedDict

import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torch.cuda.amp import autocast, GradScaler

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from model.unet import BGRemovalUNet, build_model
from model.loss import CombinedLoss, DeepSupervisionLoss
from data.dataset import SegmentationDataset, create_data_loaders
from data.augmentations import get_train_transforms, get_val_transforms

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────
# Reproducibility
# ─────────────────────────────────────────────────────────────────

def set_seed(seed: int = 42):
    """
    Set all random seeds for reproducibility.

    Sets seeds for:
        - Python random module
        - NumPy random generator
        - PyTorch CPU generator
        - PyTorch CUDA generators (all GPUs)
        - cuDNN deterministic mode

    Note: deterministic=True can slow down training by ~10%
    but ensures exact reproducibility across runs.
    """
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False


# ─────────────────────────────────────────────────────────────────
# Metrics
# ─────────────────────────────────────────────────────────────────

def compute_iou(pred: torch.Tensor, target: torch.Tensor, threshold: float = 0.5) -> float:
    """
    Compute IoU (Intersection over Union) metric.

    IoU = TP / (TP + FP + FN)
        = |P ∩ G| / |P ∪ G|

    Args:
        pred: Predicted probabilities (B, 1, H, W) in [0, 1]
        target: Ground truth binary masks (B, 1, H, W) in {0, 1}
        threshold: Binarization threshold for predictions

    Returns:
        Mean IoU across batch (float)
    """
    pred_binary = (pred > threshold).float()
    intersection = (pred_binary * target).sum(dim=[1, 2, 3])
    union = pred_binary.sum(dim=[1, 2, 3]) + target.sum(dim=[1, 2, 3]) - intersection
    iou = (intersection + 1e-6) / (union + 1e-6)
    return iou.mean().item()


def compute_dice(pred: torch.Tensor, target: torch.Tensor, threshold: float = 0.5) -> float:
    """
    Compute Dice score (F1 for segmentation).

    Dice = 2·|P ∩ G| / (|P| + |G|)
    """
    pred_binary = (pred > threshold).float()
    intersection = (pred_binary * target).sum(dim=[1, 2, 3])
    dice = (2 * intersection + 1e-6) / (
        pred_binary.sum(dim=[1, 2, 3]) + target.sum(dim=[1, 2, 3]) + 1e-6
    )
    return dice.mean().item()


# ─────────────────────────────────────────────────────────────────
# Warmup + Cosine Schedule
# ─────────────────────────────────────────────────────────────────

class WarmupCosineScheduler:
    """
    Linear warmup + CosineAnnealingWarmRestarts.

    For first warmup_epochs:
        η = η_max · (epoch / warmup_epochs)

    After warmup — cosine annealing with warm restarts:
        ηₜ = η_min + 0.5·(η_max - η_min)·(1 + cos(π·T_cur/T_i))
        T_mult = 2 (period doubles each restart)
    """

    def __init__(
        self,
        optimizer: torch.optim.Optimizer,
        warmup_epochs: int,
        T_0: int,
        T_mult: int,
        eta_min: float,
        total_epochs: int,
    ):
        self.optimizer = optimizer
        self.warmup_epochs = warmup_epochs
        self.base_lr = optimizer.param_groups[0]["lr"]
        self.eta_min = eta_min
        self.total_epochs = total_epochs

        # Create cosine scheduler (starts after warmup)
        self.cosine_scheduler = torch.optim.lr_scheduler.CosineAnnealingWarmRestarts(
            optimizer, T_0=T_0, T_mult=T_mult, eta_min=eta_min,
        )

        self.current_epoch = 0

    def step(self, epoch: int):
        self.current_epoch = epoch

        if epoch < self.warmup_epochs:
            # Linear warmup: η = η_max · (epoch / warmup_epochs)
            warmup_factor = (epoch + 1) / self.warmup_epochs
            lr = self.base_lr * warmup_factor
            for param_group in self.optimizer.param_groups:
                param_group["lr"] = lr
        else:
            # Cosine annealing with warm restarts
            self.cosine_scheduler.step(epoch - self.warmup_epochs)

    def get_lr(self) -> float:
        return self.optimizer.param_groups[0]["lr"]


# ─────────────────────────────────────────────────────────────────
# Checkpoint Manager
# ─────────────────────────────────────────────────────────────────

class CheckpointManager:
    """
    Manages model checkpoints:
        - Save every epoch
        - Track top-3 by validation IoU
        - Auto-resume from latest checkpoint
        - Save training config as JSON

    Checkpoint contents:
        - model_state_dict
        - optimizer_state_dict
        - scheduler_state (epoch + cosine state)
        - scaler_state_dict (for AMP)
        - epoch number
        - best IoU
        - training config
        - loss history
    """

    def __init__(self, save_dir: str, keep_top_k: int = 3):
        self.save_dir = Path(save_dir)
        self.save_dir.mkdir(parents=True, exist_ok=True)
        self.keep_top_k = keep_top_k
        self.top_checkpoints = []  # (iou, path)

    def save(
        self,
        model: nn.Module,
        optimizer: torch.optim.Optimizer,
        scheduler: WarmupCosineScheduler,
        scaler: GradScaler,
        epoch: int,
        val_iou: float,
        config: dict,
        loss_history: dict,
    ):
        """Save checkpoint and manage top-k."""
        checkpoint = {
            "model_state_dict": model.state_dict(),
            "optimizer_state_dict": optimizer.state_dict(),
            "scheduler_epoch": scheduler.current_epoch,
            "scaler_state_dict": scaler.state_dict(),
            "epoch": epoch,
            "val_iou": val_iou,
            "config": config,
            "loss_history": loss_history,
        }

        # Save latest (always overwritten for resume)
        latest_path = self.save_dir / "latest.pth"
        torch.save(checkpoint, latest_path)

        # Save epoch checkpoint
        epoch_path = self.save_dir / f"epoch_{epoch:03d}_iou_{val_iou:.4f}.pth"
        torch.save(checkpoint, epoch_path)

        # Track top-k
        self.top_checkpoints.append((val_iou, str(epoch_path)))
        self.top_checkpoints.sort(key=lambda x: x[0], reverse=True)

        # Remove excess checkpoints
        while len(self.top_checkpoints) > self.keep_top_k:
            _, old_path = self.top_checkpoints.pop()
            if os.path.exists(old_path) and old_path != str(latest_path):
                os.remove(old_path)

        # Save best model separately
        if val_iou >= self.top_checkpoints[0][0]:
            best_path = self.save_dir / "best_model.pth"
            torch.save(checkpoint, best_path)

        # Save config as JSON
        config_path = self.save_dir / "config.json"
        with open(config_path, "w") as f:
            json.dump(config, f, indent=2)

    def load_latest(self) -> Optional[dict]:
        """Load latest checkpoint if exists."""
        latest_path = self.save_dir / "latest.pth"
        if latest_path.exists():
            logger.info(f"Resuming from checkpoint: {latest_path}")
            return torch.load(latest_path, map_location="cpu", weights_only=False)
        return None


# ─────────────────────────────────────────────────────────────────
# Training Loop
# ─────────────────────────────────────────────────────────────────

def train_one_epoch(
    model: nn.Module,
    loader: DataLoader,
    optimizer: torch.optim.Optimizer,
    scaler: GradScaler,
    criterion: DeepSupervisionLoss,
    device: torch.device,
    accumulation_steps: int = 4,
    log_interval: int = 50,
) -> dict:
    """
    Train for one epoch with AMP + gradient accumulation + clipping.

    Mixed Precision Training (AMP):
        FP16 training uses 2x less VRAM, ~1.5-2x faster on T4.
        FP32 range: [1.2e-38, 3.4e38]
        FP16 range: [6e-8, 65504]
        GradScaler prevents FP16 underflow by scaling loss up then down.

    Gradient Accumulation:
        effective_batch = batch_size × accumulation_steps
        Example: batch=4, accumulate=4 → effective batch of 16
        This simulates larger batches without more VRAM.

    Gradient Clipping:
        clip_grad_norm_(params, max_norm=1.0)
        Prevents gradient explosion (norm > 1.0 gets scaled down).
    """
    model.train()
    epoch_loss = 0.0
    epoch_iou = 0.0
    epoch_dice = 0.0
    n_batches = 0
    loss_details_accum = {}

    optimizer.zero_grad()

    for batch_idx, batch in enumerate(loader):
        images = batch["image"].to(device, non_blocking=True)
        masks = batch["mask"].to(device, non_blocking=True)

        # ── Mixed Precision Forward ──
        with autocast(device_type=device.type, enabled=(device.type == "cuda")):
            outputs = model(images)
            loss, loss_dict = criterion(outputs, masks)
            # Scale loss by accumulation steps
            loss = loss / accumulation_steps

        # ── Backward ──
        scaler.scale(loss).backward()

        # ── Gradient step (every accumulation_steps batches) ──
        if (batch_idx + 1) % accumulation_steps == 0:
            # Unscale gradients for clipping
            scaler.unscale_(optimizer)

            # Gradient clipping: prevent explosion
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)

            # Optimizer step
            scaler.step(optimizer)
            scaler.update()
            optimizer.zero_grad()

        # ── Metrics ──
        with torch.no_grad():
            # Get main output for metrics
            main_pred = outputs[0] if isinstance(outputs, list) else outputs
            batch_iou = compute_iou(main_pred, masks)
            batch_dice = compute_dice(main_pred, masks)

        epoch_loss += loss.item() * accumulation_steps  # Un-scale for logging
        epoch_iou += batch_iou
        epoch_dice += batch_dice
        n_batches += 1

        # Accumulate loss details
        for k, v in loss_dict.items():
            loss_details_accum[k] = loss_details_accum.get(k, 0) + v

        # ── Logging ──
        if (batch_idx + 1) % log_interval == 0:
            avg_loss = epoch_loss / n_batches
            avg_iou = epoch_iou / n_batches
            logger.info(
                f"  Batch {batch_idx+1}/{len(loader)} | "
                f"Loss: {avg_loss:.4f} | IoU: {avg_iou:.4f} | "
                f"LR: {optimizer.param_groups[0]['lr']:.2e}"
            )

    # Handle remaining accumulated gradients
    if (batch_idx + 1) % accumulation_steps != 0:
        scaler.unscale_(optimizer)
        torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
        scaler.step(optimizer)
        scaler.update()
        optimizer.zero_grad()

    metrics = {
        "loss": epoch_loss / max(n_batches, 1),
        "iou": epoch_iou / max(n_batches, 1),
        "dice": epoch_dice / max(n_batches, 1),
    }

    # Average loss details
    for k, v in loss_details_accum.items():
        metrics[f"loss_{k}"] = v / max(n_batches, 1)

    return metrics


@torch.no_grad()
def validate(
    model: nn.Module,
    loader: DataLoader,
    criterion: DeepSupervisionLoss,
    device: torch.device,
) -> dict:
    """
    Validate model on validation set.

    No gradient computation, no augmentation, no AMP.
    Computes all metrics on full validation set.
    """
    model.eval()
    val_loss = 0.0
    val_iou = 0.0
    val_dice = 0.0
    n_batches = 0

    for batch in loader:
        images = batch["image"].to(device, non_blocking=True)
        masks = batch["mask"].to(device, non_blocking=True)

        outputs = model(images)
        loss, loss_dict = criterion(outputs, masks)

        # Metrics on main output
        main_pred = outputs[0] if isinstance(outputs, list) else outputs
        val_loss += loss.item()
        val_iou += compute_iou(main_pred, masks)
        val_dice += compute_dice(main_pred, masks)
        n_batches += 1

    return {
        "loss": val_loss / max(n_batches, 1),
        "iou": val_iou / max(n_batches, 1),
        "dice": val_dice / max(n_batches, 1),
    }


def save_sample_predictions(
    model: nn.Module,
    loader: DataLoader,
    device: torch.device,
    save_path: str,
    n_samples: int = 4,
):
    """
    Save a grid of sample predictions for visual inspection.

    Grid: [Original Image | Ground Truth | Prediction | Overlay]
    """
    try:
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
        from data.augmentations import denormalize_image
    except ImportError:
        logger.warning("matplotlib not available, skipping prediction visualization")
        return

    model.eval()
    batch = next(iter(loader))
    images = batch["image"][:n_samples].to(device)
    masks = batch["mask"][:n_samples]

    with torch.no_grad():
        preds = model(images)
        if isinstance(preds, list):
            preds = preds[0]
        preds = preds.cpu()

    fig, axes = plt.subplots(n_samples, 4, figsize=(16, 4 * n_samples))
    if n_samples == 1:
        axes = axes.reshape(1, -1)

    for i in range(n_samples):
        # Original image (denormalize)
        img = denormalize_image(images[i].cpu())
        axes[i, 0].imshow(img)
        axes[i, 0].set_title("Input")
        axes[i, 0].axis("off")

        # Ground truth mask
        gt = masks[i, 0].numpy()
        axes[i, 1].imshow(gt, cmap="gray", vmin=0, vmax=1)
        axes[i, 1].set_title("Ground Truth")
        axes[i, 1].axis("off")

        # Predicted mask
        pred = preds[i, 0].numpy()
        axes[i, 2].imshow(pred, cmap="gray", vmin=0, vmax=1)
        axes[i, 2].set_title(f"Prediction (IoU: {compute_iou(preds[i:i+1], masks[i:i+1]):.3f})")
        axes[i, 2].axis("off")

        # Overlay
        overlay = img.copy()
        pred_bin = (pred > 0.5).astype(np.uint8)
        overlay[pred_bin == 0] = overlay[pred_bin == 0] // 2  # darken background
        axes[i, 3].imshow(overlay)
        axes[i, 3].set_title("Overlay")
        axes[i, 3].axis("off")

    plt.tight_layout()
    os.makedirs(os.path.dirname(save_path) or ".", exist_ok=True)
    plt.savefig(save_path, dpi=100, bbox_inches="tight")
    plt.close()
    logger.info(f"  Sample predictions saved to {save_path}")


# ─────────────────────────────────────────────────────────────────
# Main Training Function
# ─────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Train Background Removal U-Net",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )

    # Data
    parser.add_argument("--data-dir", default="dataset", help="Dataset root directory")
    parser.add_argument("--input-size", type=int, default=320, help="Input image size")

    # Training
    parser.add_argument("--epochs", type=int, default=70, help="Total training epochs")
    parser.add_argument("--batch-size", type=int, default=4, help="Batch size per step")
    parser.add_argument("--accumulation-steps", type=int, default=4,
                        help="Gradient accumulation steps (effective batch = batch × accum)")
    parser.add_argument("--num-workers", type=int, default=2, help="DataLoader workers")

    # Optimizer
    parser.add_argument("--lr", type=float, default=1e-4, help="Base learning rate (α)")
    parser.add_argument("--weight-decay", type=float, default=1e-4,
                        help="AdamW weight decay (λ)")
    parser.add_argument("--beta1", type=float, default=0.9, help="AdamW β₁")
    parser.add_argument("--beta2", type=float, default=0.999, help="AdamW β₂")

    # Schedule
    parser.add_argument("--warmup-epochs", type=int, default=5,
                        help="Linear warmup epochs")
    parser.add_argument("--t0", type=int, default=10,
                        help="Initial cosine period (epochs)")
    parser.add_argument("--t-mult", type=int, default=2,
                        help="Cosine period multiplier")
    parser.add_argument("--min-lr", type=float, default=1e-6, help="Minimum LR (η_min)")

    # Loss
    parser.add_argument("--bce-weight", type=float, default=0.3)
    parser.add_argument("--dice-weight", type=float, default=0.4)
    parser.add_argument("--focal-weight", type=float, default=0.2)
    parser.add_argument("--iou-weight", type=float, default=0.1)

    # Training control
    parser.add_argument("--early-stopping-patience", type=int, default=15,
                        help="Stop if val IoU doesn't improve for N epochs")
    parser.add_argument("--checkpoint-dir", default="checkpoints",
                        help="Directory for saving checkpoints")
    parser.add_argument("--log-interval", type=int, default=50,
                        help="Log every N batches")
    parser.add_argument("--save-samples-every", type=int, default=5,
                        help="Save prediction samples every N epochs")

    # Misc
    parser.add_argument("--seed", type=int, default=42, help="Random seed")
    parser.add_argument("--resume", action="store_true", help="Resume from latest checkpoint")

    args = parser.parse_args()

    # ── Setup ──
    set_seed(args.seed)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    logger.info(f"Device: {device}")
    if device.type == "cuda":
        logger.info(f"GPU: {torch.cuda.get_device_name(0)}")
        logger.info(f"VRAM: {torch.cuda.get_device_properties(0).total_mem / 1024**3:.1f} GB")

    # ── Model ──
    model = build_model(args.input_size)
    params = model.get_param_count()
    logger.info(f"Model parameters: {params['total']:,} ({params['total_MB']:.1f} MB)")
    model = model.to(device)

    # Enable gradient checkpointing for memory efficiency
    # Trade: 30% more compute, 60% less memory
    # Recompute activations during backward instead of storing
    if hasattr(model, 'encoder'):
        for module in model.encoder.modules():
            if hasattr(module, 'gradient_checkpointing'):
                module.gradient_checkpointing = True

    # ── Data ──
    train_transform = get_train_transforms(args.input_size)
    val_transform = get_val_transforms(args.input_size)

    train_loader, val_loader = create_data_loaders(
        train_image_dir=os.path.join(args.data_dir, "train", "images"),
        train_mask_dir=os.path.join(args.data_dir, "train", "masks"),
        val_image_dir=os.path.join(args.data_dir, "val", "images"),
        val_mask_dir=os.path.join(args.data_dir, "val", "masks"),
        train_transform=train_transform,
        val_transform=val_transform,
        batch_size=args.batch_size,
        num_workers=args.num_workers,
    )

    logger.info(f"Train: {len(train_loader.dataset)} samples, {len(train_loader)} batches")
    logger.info(f"Val:   {len(val_loader.dataset)} samples, {len(val_loader)} batches")

    # ── Loss ──
    base_criterion = CombinedLoss(
        bce_weight=args.bce_weight,
        dice_weight=args.dice_weight,
        focal_weight=args.focal_weight,
        iou_weight=args.iou_weight,
    )
    criterion = DeepSupervisionLoss(criterion=base_criterion)

    # ── Optimizer ──
    optimizer = torch.optim.AdamW(
        model.parameters(),
        lr=args.lr,
        betas=(args.beta1, args.beta2),
        eps=1e-8,
        weight_decay=args.weight_decay,
    )

    # ── Scheduler ──
    scheduler = WarmupCosineScheduler(
        optimizer=optimizer,
        warmup_epochs=args.warmup_epochs,
        T_0=args.t0,
        T_mult=args.t_mult,
        eta_min=args.min_lr,
        total_epochs=args.epochs,
    )

    # ── AMP Scaler ──
    scaler = GradScaler(enabled=(device.type == "cuda"))

    # ── Checkpoint Manager ──
    ckpt_manager = CheckpointManager(args.checkpoint_dir)

    # ── Resume ──
    start_epoch = 0
    best_iou = 0.0
    loss_history = {"train": [], "val": []}

    if args.resume:
        checkpoint = ckpt_manager.load_latest()
        if checkpoint:
            model.load_state_dict(checkpoint["model_state_dict"])
            optimizer.load_state_dict(checkpoint["optimizer_state_dict"])
            scaler.load_state_dict(checkpoint["scaler_state_dict"])
            start_epoch = checkpoint["epoch"] + 1
            best_iou = checkpoint.get("val_iou", 0.0)
            loss_history = checkpoint.get("loss_history", loss_history)
            # Restore scheduler state
            for epoch in range(start_epoch):
                scheduler.step(epoch)
            logger.info(f"Resumed from epoch {start_epoch}, best IoU: {best_iou:.4f}")

    # ── Training Config ──
    config = {
        "input_size": args.input_size,
        "epochs": args.epochs,
        "batch_size": args.batch_size,
        "effective_batch_size": args.batch_size * args.accumulation_steps,
        "lr": args.lr,
        "weight_decay": args.weight_decay,
        "warmup_epochs": args.warmup_epochs,
        "loss_weights": {
            "bce": args.bce_weight, "dice": args.dice_weight,
            "focal": args.focal_weight, "iou": args.iou_weight,
        },
        "model_params": params["total"],
        "model_MB": params["total_MB"],
    }

    # ── Training Loop ──
    logger.info("\n" + "=" * 70)
    logger.info("TRAINING START")
    logger.info("=" * 70)

    no_improve_count = 0

    for epoch in range(start_epoch, args.epochs):
        epoch_start = time.time()
        logger.info(f"\nEpoch {epoch+1}/{args.epochs} | LR: {scheduler.get_lr():.2e}")
        logger.info("-" * 50)

        # ── Train ──
        train_metrics = train_one_epoch(
            model, train_loader, optimizer, scaler, criterion,
            device, args.accumulation_steps, args.log_interval,
        )

        # ── Validate ──
        val_metrics = validate(model, val_loader, criterion, device)

        # ── Schedule ──
        scheduler.step(epoch)

        # ── Log ──
        epoch_time = time.time() - epoch_start
        logger.info(
            f"  Train — Loss: {train_metrics['loss']:.4f} | "
            f"IoU: {train_metrics['iou']:.4f} | Dice: {train_metrics['dice']:.4f}"
        )
        logger.info(
            f"  Val   — Loss: {val_metrics['loss']:.4f} | "
            f"IoU: {val_metrics['iou']:.4f} | Dice: {val_metrics['dice']:.4f}"
        )
        logger.info(f"  Time: {epoch_time:.1f}s")

        # ── History ──
        loss_history["train"].append(train_metrics)
        loss_history["val"].append(val_metrics)

        # ── Checkpoint ──
        val_iou = val_metrics["iou"]
        ckpt_manager.save(
            model, optimizer, scheduler, scaler,
            epoch, val_iou, config, loss_history,
        )

        # ── Best model tracking ──
        if val_iou > best_iou:
            best_iou = val_iou
            no_improve_count = 0
            logger.info(f"  ★ New best IoU: {best_iou:.4f}")
        else:
            no_improve_count += 1
            logger.info(
                f"  No improvement for {no_improve_count}/{args.early_stopping_patience} epochs"
            )

        # ── Sample predictions ──
        if (epoch + 1) % args.save_samples_every == 0:
            save_sample_predictions(
                model, val_loader, device,
                os.path.join(args.checkpoint_dir, f"samples_epoch_{epoch+1:03d}.png"),
            )

        # ── Early stopping ──
        if no_improve_count >= args.early_stopping_patience:
            logger.info(
                f"\n⚠ Early stopping at epoch {epoch+1} "
                f"(no improvement for {args.early_stopping_patience} epochs)"
            )
            break

    # ── Training Complete ──
    logger.info("\n" + "=" * 70)
    logger.info(f"TRAINING COMPLETE — Best Val IoU: {best_iou:.4f}")
    logger.info(f"Best model saved at: {args.checkpoint_dir}/best_model.pth")
    logger.info("=" * 70)

    # Save final loss curves
    try:
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt

        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))

        epochs_range = range(1, len(loss_history["train"]) + 1)
        train_losses = [m["loss"] for m in loss_history["train"]]
        val_losses = [m["loss"] for m in loss_history["val"]]
        train_ious = [m["iou"] for m in loss_history["train"]]
        val_ious = [m["iou"] for m in loss_history["val"]]

        ax1.plot(epochs_range, train_losses, label="Train", linewidth=2)
        ax1.plot(epochs_range, val_losses, label="Val", linewidth=2)
        ax1.set_xlabel("Epoch")
        ax1.set_ylabel("Loss")
        ax1.set_title("Training Loss")
        ax1.legend()
        ax1.grid(True, alpha=0.3)

        ax2.plot(epochs_range, train_ious, label="Train", linewidth=2)
        ax2.plot(epochs_range, val_ious, label="Val", linewidth=2)
        ax2.set_xlabel("Epoch")
        ax2.set_ylabel("IoU")
        ax2.set_title("IoU Score")
        ax2.legend()
        ax2.grid(True, alpha=0.3)

        plt.tight_layout()
        plt.savefig(
            os.path.join(args.checkpoint_dir, "training_curves.png"),
            dpi=150, bbox_inches="tight",
        )
        plt.close()
        logger.info(f"Training curves saved to {args.checkpoint_dir}/training_curves.png")
    except ImportError:
        pass


if __name__ == "__main__":
    main()
