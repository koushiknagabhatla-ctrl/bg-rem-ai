import json

notebook = {
  "cells": [],
  "metadata": {
    "kernelspec": {
      "display_name": "Python 3",
      "language": "python",
      "name": "python3"
    },
    "language_info": {
      "name": "python",
      "version": "3.12.0"
    },
    "kaggle": {
      "accelerator": "gpu",
      "dataSources": [],
      "isGpuEnabled": True,
      "isInternetEnabled": True
    }
  },
  "nbformat": 4,
  "nbformat_minor": 4
}

cells_data = [
    ("CELL 1 — Packages + Imports", r'''import subprocess, sys
subprocess.check_call([sys.executable, '-m', 'pip', 'install',
    '-q', 'albumentations>=1.3.0', 'onnx>=1.14.0',
    'onnxruntime>=1.15.0'])

import os, random, time, math, json, gc, warnings
warnings.filterwarnings('ignore')

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import Dataset, DataLoader
from torch.cuda.amp import autocast, GradScaler
from pathlib import Path
from PIL import Image
import matplotlib.pyplot as plt
import albumentations as A
from albumentations.pytorch import ToTensorV2
import cv2
import onnx
from onnxruntime.quantization import quantize_dynamic, QuantType

# ── Seeds ──────────────────────────────────────────────────
torch.manual_seed(42)
np.random.seed(42)
random.seed(42)
torch.backends.cudnn.benchmark = True
torch.backends.cudnn.deterministic = False

# ── Device ─────────────────────────────────────────────────
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f'Device : {device}')
if torch.cuda.is_available():
    print(f'GPU    : {torch.cuda.get_device_name(0)}')
    print(f'VRAM   : {torch.cuda.get_device_properties(0).total_memory/1e9:.1f} GB')
    print(f'PyTorch: {torch.__version__}')

# ── Config ─────────────────────────────────────────────────
INPUT_SIZE   = 256
BATCH_SIZE   = 4
ACCUM_STEPS  = 4      # effective batch = 16
EPOCHS       = 70
LR           = 1e-4
MIN_LR       = 1e-6
WEIGHT_DECAY = 1e-4
PATIENCE     = 20
WARMUP_EP    = 5

KAGGLE_WORKING  = '/kaggle/working'
CHECKPOINT_DIR  = f'{KAGGLE_WORKING}/checkpoints'
EXPORT_DIR      = f'{KAGGLE_WORKING}/exports'
BEST_CKPT       = f'{KAGGLE_WORKING}/best_model.pth'

os.makedirs(CHECKPOINT_DIR, exist_ok=True)
os.makedirs(EXPORT_DIR,     exist_ok=True)
print('Dirs ready.')
print(f'Config: INPUT={INPUT_SIZE} BATCH={BATCH_SIZE} '
      f'ACCUM={ACCUM_STEPS} EFFECTIVE_BATCH={BATCH_SIZE*ACCUM_STEPS}')
print(f'Estimated time: {EPOCHS * 180 / 3600:.1f} hours')'''),

    ("CELL 2 — Dataset Discovery", r'''def discover_dataset(root='/kaggle/input'):
    """Auto-find image and mask directories in any dataset."""
    IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp'}
    MASK_KEYWORDS    = ['mask', 'alpha', 'matte', 'trimap', 'seg']
    IMAGE_KEYWORDS   = ['image', 'img', 'original', 'fg', 'photo']

    all_dirs = []
    for r, dirs, files in os.walk(root):
        imgs = [f for f in files
                if Path(f).suffix.lower() in IMAGE_EXTENSIONS]
        if len(imgs) > 50:
            all_dirs.append((r, len(imgs)))

    print(f'\n=== Kaggle Input Contents ===')
    for d, n in sorted(all_dirs, key=lambda x: -x[1])[:20]:
        print(f'  {d}  ({n} files)')

    image_dir, mask_dir = None, None
    candidates = sorted(all_dirs, key=lambda x: -x[1])

    for d, n in candidates:
        dl = d.lower()
        if any(k in dl for k in MASK_KEYWORDS):
            if mask_dir is None:
                mask_dir = d
        elif any(k in dl for k in IMAGE_KEYWORDS):
            if image_dir is None:
                image_dir = d

    if image_dir is None or mask_dir is None:
        # fallback: largest two dirs
        if len(candidates) >= 2:
            image_dir = candidates[0][0]
            mask_dir  = candidates[1][0]

    print(f'\n=== Selected ===')
    print(f'  Images : {image_dir}')
    print(f'  Masks  : {mask_dir}')
    return image_dir, mask_dir


IMAGE_DIR, MASK_DIR = discover_dataset()
assert IMAGE_DIR and MASK_DIR, \
    'Could not find dataset! Check the Input panel.' '''),

    ("CELL 3 — Dataset Class + Augmentations", r'''def make_transforms(training=True):
    if training:
        return A.Compose([
            A.HorizontalFlip(p=0.5),
            A.ShiftScaleRotate(
                shift_limit=0.1, scale_limit=0.2,
                rotate_limit=15, border_mode=cv2.BORDER_REFLECT,
                p=0.7),
            A.RandomBrightnessContrast(0.2, 0.2, p=0.5),
            A.HueSaturationValue(15, 25, 15, p=0.4),
            A.GaussianBlur(blur_limit=(3, 5), p=0.2),
            A.CoarseDropout(
                max_holes=4, max_height=32,
                max_width=32, p=0.2),
            A.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]),
            ToTensorV2(),
        ], additional_targets={'mask': 'mask'})
    else:
        return A.Compose([
            A.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]),
            ToTensorV2(),
        ], additional_targets={'mask': 'mask'})


class SegDataset(Dataset):
    def __init__(self, pairs, transform):
        self.pairs     = pairs
        self.transform = transform

    def __len__(self):
        return len(self.pairs)

    def __getitem__(self, idx):
        img_path, msk_path = self.pairs[idx]
        try:
            img  = np.array(
                Image.open(img_path).convert('RGB').resize(
                    (INPUT_SIZE, INPUT_SIZE), Image.BILINEAR),
                dtype=np.uint8)
            mask = np.array(
                Image.open(msk_path).convert('L').resize(
                    (INPUT_SIZE, INPUT_SIZE), Image.NEAREST))
            # Binarize alpha matte → binary mask
            mask = (mask > 127).astype(np.float32)
            out  = self.transform(image=img, mask=mask)
            return {
                'image': out['image'],
                'mask' : out['mask'].unsqueeze(0).float()
            }
        except Exception as e:
            # Return black image/mask on corrupt file
            return {
                'image': torch.zeros(3, INPUT_SIZE, INPUT_SIZE),
                'mask' : torch.zeros(1, INPUT_SIZE, INPUT_SIZE)
            }


def build_pairs(image_dir, mask_dir):
    """Match images to masks by filename stem."""
    IMG_EXT = {'.jpg', '.jpeg', '.png', '.webp'}

    img_files = {
        Path(f).stem: Path(image_dir) / f
        for f in os.listdir(image_dir)
        if Path(f).suffix.lower() in IMG_EXT
    }
    msk_files = {
        Path(f).stem: Path(mask_dir) / f
        for f in os.listdir(mask_dir)
        if Path(f).suffix.lower() in IMG_EXT
    }

    common = sorted(set(img_files) & set(msk_files))
    pairs  = [(str(img_files[s]), str(msk_files[s]))
              for s in common]
    print(f'Matched pairs: {len(pairs)}')
    assert len(pairs) > 100, \
        f'Too few pairs ({len(pairs)}). Check directories.'
    return pairs


# Build pairs and split 80/10/10
all_pairs = build_pairs(IMAGE_DIR, MASK_DIR)
random.Random(42).shuffle(all_pairs)

n       = len(all_pairs)
n_train = int(0.80 * n)
n_val   = int(0.10 * n)

train_pairs = all_pairs[:n_train]
val_pairs   = all_pairs[n_train:n_train + n_val]
test_pairs  = all_pairs[n_train + n_val:]

print(f'Train: {len(train_pairs)} | '
      f'Val: {len(val_pairs)} | '
      f'Test: {len(test_pairs)}')

train_tf = make_transforms(training=True)
val_tf   = make_transforms(training=False)

train_ds = SegDataset(train_pairs, train_tf)
val_ds   = SegDataset(val_pairs,   val_tf)
test_ds  = SegDataset(test_pairs,  val_tf)

# num_workers=0 — mandatory for Python 3.12 + Kaggle
train_loader = DataLoader(
    train_ds, batch_size=BATCH_SIZE,
    shuffle=True, num_workers=0,
    pin_memory=False, drop_last=True)

val_loader = DataLoader(
    val_ds, batch_size=BATCH_SIZE,
    shuffle=False, num_workers=0,
    pin_memory=False)

test_loader = DataLoader(
    test_ds, batch_size=BATCH_SIZE,
    shuffle=False, num_workers=0,
    pin_memory=False)

print(f'Loaders ready. '
      f'Train batches: {len(train_loader)} | '
      f'Val batches: {len(val_loader)}')'''),

    ("CELL 4 — CBAM Attention Module", r'''class ChannelAttention(nn.Module):
    def __init__(self, channels, reduction=16):
        super().__init__()
        mid = max(channels // reduction, 4)
        self.mlp = nn.Sequential(
            nn.Linear(channels, mid, bias=False),
            nn.ReLU(inplace=True),
            nn.Linear(mid, channels, bias=False)
        )

    def forward(self, x):
        B, C, H, W = x.shape
        gap = x.mean(dim=(2, 3))           # (B,C)
        gmp = x.amax(dim=(2, 3))           # (B,C)
        gate = torch.sigmoid(
            self.mlp(gap) + self.mlp(gmp)) # (B,C)
        return x * gate.view(B, C, 1, 1)


class SpatialAttention(nn.Module):
    def __init__(self):
        super().__init__()
        self.conv = nn.Conv2d(2, 1, kernel_size=7,
                              padding=3, bias=False)

    def forward(self, x):
        avg = x.mean(dim=1, keepdim=True)  # (B,1,H,W)
        mx  = x.amax(dim=1, keepdim=True)  # (B,1,H,W)
        gate = torch.sigmoid(
            self.conv(torch.cat([avg, mx], dim=1)))
        return x * gate


class CBAM(nn.Module):
    def __init__(self, channels, reduction=16):
        super().__init__()
        self.ca = ChannelAttention(channels, reduction)
        self.sa = SpatialAttention()

    def forward(self, x):
        x = self.ca(x)
        x = self.sa(x)
        return x


print('CBAM defined.')'''),

    ("CELL 5 — MobileNetV3 Encoder Blocks", r'''def hswish(x):
    return x * F.relu6(x + 3, inplace=True) / 6

def hsigmoid(x):
    return F.relu6(x + 3, inplace=True) / 6


class HSwish(nn.Module):
    def forward(self, x): return hswish(x)


class SqueezeExcite(nn.Module):
    def __init__(self, ch, reduction=4):
        super().__init__()
        mid = max(ch // reduction, 4)
        self.fc = nn.Sequential(
            nn.AdaptiveAvgPool2d(1),
            nn.Flatten(),
            nn.Linear(ch, mid, bias=False),
            nn.ReLU(inplace=True),
            nn.Linear(mid, ch, bias=False),
        )

    def forward(self, x):
        s = torch.sigmoid(self.fc(x))
        return x * s.view(x.size(0), x.size(1), 1, 1)


class InvertedResidual(nn.Module):
    def __init__(self, in_ch, out_ch, stride,
                 expand_ratio, kernel=3, use_se=False):
        super().__init__()
        self.use_skip = (stride == 1 and in_ch == out_ch)
        mid = int(in_ch * expand_ratio)

        layers = []
        if expand_ratio != 1:
            layers += [
                nn.Conv2d(in_ch, mid, 1, bias=False),
                nn.BatchNorm2d(mid),
                HSwish()
            ]
        layers += [
            nn.Conv2d(mid, mid, kernel,
                      stride=stride,
                      padding=kernel // 2,
                      groups=mid, bias=False),
            nn.BatchNorm2d(mid),
            HSwish()
        ]
        if use_se:
            layers.append(SqueezeExcite(mid))
        layers += [
            nn.Conv2d(mid, out_ch, 1, bias=False),
            nn.BatchNorm2d(out_ch)
        ]
        self.block = nn.Sequential(*layers)

    def forward(self, x):
        out = self.block(x)
        if self.use_skip:
            out = out + x
        return out


print('Encoder blocks defined.')'''),

    ("CELL 6 — Full Model (Encoder + Decoder + Deep Supervision)", r'''class DecoderBlock(nn.Module):
    def __init__(self, in_ch, skip_ch, out_ch):
        super().__init__()
        self.conv = nn.Sequential(
            nn.Conv2d(in_ch + skip_ch, out_ch,
                      3, padding=1, bias=False),
            nn.BatchNorm2d(out_ch),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_ch, out_ch,
                      3, padding=1, bias=False),
            nn.BatchNorm2d(out_ch),
            nn.ReLU(inplace=True),
        )
        self.cbam = CBAM(out_ch)

    def forward(self, x, skip):
        x = F.interpolate(x, size=skip.shape[2:],
                          mode='bilinear',
                          align_corners=False)
        x = torch.cat([x, skip], dim=1)
        x = self.conv(x)
        x = self.cbam(x)
        return x


class BgRemovalNet(nn.Module):
    """
    MobileNetV3-Small encoder + U-Net decoder + CBAM.
    Output: RAW LOGITS (no sigmoid).
    Train mode → [main, s2, s3, s4]
    Eval  mode → main logit tensor
    """
    def __init__(self):
        super().__init__()

        # ── Encoder ────────────────────────────────────────
        self.stem = nn.Sequential(
            nn.Conv2d(3, 16, 3, stride=2,
                      padding=1, bias=False),
            nn.BatchNorm2d(16),
            HSwish()
        )  # 128×128×16

        self.e1 = InvertedResidual(16, 16,  stride=2,
            expand_ratio=1,   kernel=3)           # 64×64×16
        self.e2 = InvertedResidual(16, 24,  stride=2,
            expand_ratio=4.5, kernel=3)           # 32×32×24
        self.e3 = InvertedResidual(24, 40,  stride=2,
            expand_ratio=4,   kernel=5, use_se=True) # 16×16×40
        self.e4 = InvertedResidual(40, 96,  stride=2,
            expand_ratio=6,   kernel=5, use_se=True) # 8×8×96

        self.bottleneck = nn.Sequential(
            nn.Conv2d(96, 576, 1, bias=False),
            nn.BatchNorm2d(576),
            HSwish()
        )  # 8×8×576

        # ── Decoder ────────────────────────────────────────
        self.d1 = DecoderBlock(576, 96,  128)   # 16×16
        self.d2 = DecoderBlock(128, 40,  64)    # 32×32
        self.d3 = DecoderBlock(64,  24,  32)    # 64×64
        self.d4 = DecoderBlock(32,  16,  16)    # 128×128

        self.final_up = nn.Sequential(
            nn.Conv2d(16, 8, 3, padding=1, bias=False),
            nn.BatchNorm2d(8),
            nn.ReLU(inplace=True),
        )  # 256×256×8

        # ── Output head — NO SIGMOID ───────────────────────
        self.out_head = nn.Conv2d(8, 1, 1)

        # ── Deep supervision heads — NO SIGMOID ───────────
        self.s2_head = nn.Conv2d(64, 1, 1)
        self.s3_head = nn.Conv2d(32, 1, 1)
        self.s4_head = nn.Conv2d(16, 1, 1)

        self._init_weights()

        total = sum(p.numel() for p in self.parameters())
        print(f'Model params: {total/1e6:.2f}M')

    def _init_weights(self):
        for m in self.modules():
            if isinstance(m, nn.Conv2d):
                nn.init.kaiming_normal_(
                    m.weight, mode='fan_out',
                    nonlinearity='relu')
            elif isinstance(m, nn.BatchNorm2d):
                nn.init.ones_(m.weight)
                nn.init.zeros_(m.bias)
            elif isinstance(m, nn.Linear):
                nn.init.normal_(m.weight, 0, 0.01)
                if m.bias is not None:
                    nn.init.zeros_(m.bias)

    def forward(self, x):
        # ── Encode ─────────────────────────────────────────
        s  = self.stem(x)     # 128×128×16
        e1 = self.e1(s)       # 64×64×16
        e2 = self.e2(e1)      # 32×32×24
        e3 = self.e3(e2)      # 16×16×40
        e4 = self.e4(e3)      # 8×8×96
        b  = self.bottleneck(e4) # 8×8×576

        # ── Decode ─────────────────────────────────────────
        d1 = self.d1(b,  e4)  # 16×16×128
        d2 = self.d2(d1, e3)  # 32×32×64
        d3 = self.d3(d2, e2)  # 64×64×32
        d4 = self.d4(d3, e1)  # 128×128×16

        # ── Final upsample ─────────────────────────────────
        d5 = F.interpolate(d4, scale_factor=2,
                           mode='bilinear',
                           align_corners=False)
        d5 = self.final_up(d5)  # 256×256×8

        # ── Main output (raw logits) ───────────────────────
        main = self.out_head(d5)  # 256×256×1

        if self.training:
            H, W = x.shape[2:]
            def up(t):
                return F.interpolate(
                    t, size=(H, W),
                    mode='bilinear',
                    align_corners=False)
            s2 = up(self.s2_head(d2))
            s3 = up(self.s3_head(d3))
            s4 = up(self.s4_head(d4))
            return [main, s2, s3, s4]

        return main


model = BgRemovalNet().to(device)'''),

    ("CELL 7 — Loss Functions", r'''class BCELoss(nn.Module):
    """Safe with autocast. Uses with_logits."""
    def forward(self, logits, target):
        return F.binary_cross_entropy_with_logits(
            logits, target, reduction='mean')


class DiceLoss(nn.Module):
    """Sigmoid applied internally."""
    def forward(self, logits, target):
        pred  = torch.sigmoid(logits)
        pred  = pred.clamp(1e-6, 1 - 1e-6)
        inter = (pred * target).sum(dim=(2, 3))
        union = pred.sum(dim=(2, 3)) + \
                target.sum(dim=(2, 3))
        dice  = (2 * inter + 1) / (union + 1)
        return (1 - dice).mean()


class FocalLoss(nn.Module):
    """Hard example mining. with_logits safe."""
    def __init__(self, alpha=0.25, gamma=2.0):
        super().__init__()
        self.alpha = alpha
        self.gamma = gamma

    def forward(self, logits, target):
        bce  = F.binary_cross_entropy_with_logits(
            logits, target, reduction='none')
        pt   = torch.exp(-bce)
        loss = self.alpha * (1 - pt) ** self.gamma * bce
        return loss.mean()


class IoULoss(nn.Module):
    """Direct IoU optimization."""
    def forward(self, logits, target):
        pred  = torch.sigmoid(logits)
        pred  = pred.clamp(1e-6, 1 - 1e-6)
        inter = (pred * target).sum(dim=(2, 3))
        union = pred.sum(dim=(2, 3)) + \
                target.sum(dim=(2, 3)) - inter
        iou   = (inter + 1) / (union + 1)
        return (1 - iou).mean()


class CombinedLoss(nn.Module):
    """
    L = 0.3·BCE + 0.4·Dice + 0.2·Focal + 0.1·IoU
    """
    def __init__(self):
        super().__init__()
        self.bce   = BCELoss()
        self.dice  = DiceLoss()
        self.focal = FocalLoss()
        self.iou   = IoULoss()

    def forward(self, logits, target):
        return (0.3 * self.bce(logits,   target) +
                0.4 * self.dice(logits,  target) +
                0.2 * self.focal(logits, target) +
                0.1 * self.iou(logits,   target))


def get_pred(out):
    """Handle list (train) or tensor (eval) output."""
    return out[0] if isinstance(out, (list, tuple)) else out


def deep_supervision_loss(preds, target, criterion):
    """Weighted loss across all supervision outputs."""
    if isinstance(preds, (list, tuple)):
        weights = [1.0, 0.4, 0.2, 0.1][:len(preds)]
        return sum(w * criterion(p, target)
                   for w, p in zip(weights, preds))
    return criterion(preds, target)


criterion = CombinedLoss().to(device)
print('Loss functions ready.')'''),

    ("CELL 8 — Metrics + Optimizer + Scheduler", r'''def compute_iou(prob, target, thresh=0.5):
    pb    = (prob > thresh).float()
    tb    = (target > thresh).float()
    inter = (pb * tb).sum()
    union = pb.sum() + tb.sum() - inter
    return ((inter + 1e-7) / (union + 1e-7)).item()


def compute_dice(prob, target, thresh=0.5):
    pb    = (prob > thresh).float()
    tb    = (target > thresh).float()
    inter = (pb * tb).sum()
    return ((2 * inter + 1e-7) /
            (pb.sum() + tb.sum() + 1e-7)).item()


def compute_mae(prob, target):
    return (prob - target).abs().mean().item()


# ── Optimizer ──────────────────────────────────────────────
optimizer = torch.optim.AdamW(
    model.parameters(),
    lr=LR,
    weight_decay=WEIGHT_DECAY,
    betas=(0.9, 0.999),
    eps=1e-8
)

# ── Scheduler ──────────────────────────────────────────────
scheduler = torch.optim.lr_scheduler.CosineAnnealingWarmRestarts(
    optimizer, T_0=10, T_mult=2, eta_min=MIN_LR
)

# ── AMP Scaler ─────────────────────────────────────────────
scaler = GradScaler()

print('Optimizer, scheduler, scaler ready.')'''),

    ("CELL 9 — Checkpoint System + Auto-Resume", r'''def save_checkpoint(epoch, best_iou, val_iou, is_best=False):
    ckpt = {
        'epoch'          : epoch,
        'model_state'    : model.state_dict(),
        'optimizer_state': optimizer.state_dict(),
        'scheduler_state': scheduler.state_dict(),
        'scaler_state'   : scaler.state_dict(),
        'best_iou'       : best_iou,
        'val_iou'        : val_iou,
        'config': {
            'input_size'  : INPUT_SIZE,
            'batch_size'  : BATCH_SIZE,
            'accum_steps' : ACCUM_STEPS,
            'lr'          : LR,
        }
    }
    # Always save latest
    torch.save(ckpt, BEST_CKPT)

    # Save epoch file
    ep_path = f'{CHECKPOINT_DIR}/epoch_{epoch:03d}.pth'
    torch.save(ckpt, ep_path)

    # Delete old epoch files — keep only last 2
    ep_files = sorted(Path(CHECKPOINT_DIR).glob('epoch_*.pth'))
    for old in ep_files[:-2]:
        old.unlink()

    if is_best:
        torch.save(ckpt,
            f'{CHECKPOINT_DIR}/best_model.pth')
        print(f'  >> New best IoU: {best_iou:.4f}')


def load_checkpoint():
    """Auto-resume from checkpoint if exists."""
    if os.path.exists(BEST_CKPT):
        print(f'Found checkpoint — resuming...')
        ckpt = torch.load(BEST_CKPT,
                          map_location=device)
        model.load_state_dict(ckpt['model_state'])
        optimizer.load_state_dict(ckpt['optimizer_state'])
        scheduler.load_state_dict(ckpt['scheduler_state'])
        if 'scaler_state' in ckpt:
            scaler.load_state_dict(ckpt['scaler_state'])
        start_ep  = ckpt['epoch'] + 1
        best_iou  = ckpt['best_iou']
        print(f'Resumed from epoch {start_ep} '
              f'| Best IoU: {best_iou:.4f}')
        return start_ep, best_iou
    print('No checkpoint found — starting fresh.')
    return 0, 0.0


start_epoch, best_iou = load_checkpoint()'''),

    ("CELL 10 — Training Loop", r'''def train_one_epoch(epoch):
    model.train()
    total_loss = 0.0
    n_batches  = 0
    optimizer.zero_grad()

    for i, batch in enumerate(train_loader):
        imgs  = batch['image'].to(device, non_blocking=True)
        masks = batch['mask'].to(device,  non_blocking=True)

        with autocast():
            outs = model(imgs)
            loss = deep_supervision_loss(
                outs, masks, criterion
            ) / ACCUM_STEPS

        # NaN guard
        if torch.isnan(loss) or torch.isinf(loss):
            print(f'  WARNING: NaN/Inf at step {i} — skip')
            optimizer.zero_grad()
            continue

        scaler.scale(loss).backward()

        if (i + 1) % ACCUM_STEPS == 0:
            scaler.unscale_(optimizer)
            torch.nn.utils.clip_grad_norm_(
                model.parameters(), 1.0)
            scaler.step(optimizer)
            scaler.update()
            optimizer.zero_grad()

        total_loss += loss.item() * ACCUM_STEPS
        n_batches  += 1

    return total_loss / max(n_batches, 1)


def validate():
    model.eval()
    t_iou, t_dice, t_mae, n = 0, 0, 0, 0

    with torch.no_grad():
        for batch in val_loader:
            imgs  = batch['image'].to(device)
            masks = batch['mask'].to(device)

            outs = model(imgs)
            pred = get_pred(outs)
            prob = torch.sigmoid(pred)  # sigmoid HERE only

            t_iou  += compute_iou(prob,  masks)
            t_dice += compute_dice(prob, masks)
            t_mae  += compute_mae(prob,  masks)
            n += 1

    return (t_iou  / max(n, 1),
            t_dice / max(n, 1),
            t_mae  / max(n, 1))


print('Training functions ready.')'''),

    ("CELL 11 — Run Training", r'''train_losses, val_ious = [], []
no_improve = 0

print(f'\n{"="*70}')
print(f' TRAINING START — {EPOCHS} epochs')
print(f' Effective batch: {BATCH_SIZE * ACCUM_STEPS}')
print(f' Starting epoch : {start_epoch}')
print(f'{"="*70}\n')

for epoch in range(start_epoch, EPOCHS):
    t0 = time.time()

    # Linear warmup
    if epoch < WARMUP_EP:
        for pg in optimizer.param_groups:
            pg['lr'] = LR * (epoch + 1) / WARMUP_EP

    # Train
    train_loss = train_one_epoch(epoch)

    # Validate
    val_iou, val_dice, val_mae = validate()

    # Scheduler step
    if epoch >= WARMUP_EP:
        scheduler.step()

    current_lr = optimizer.param_groups[0]['lr']
    elapsed    = time.time() - t0
    remaining  = (EPOCHS - epoch - 1) * elapsed
    eta_h      = remaining / 3600

    # Log
    print(f'Ep {epoch+1:3d}/{EPOCHS} | '
          f'Loss: {train_loss:.4f} | '
          f'IoU: {val_iou:.4f} | '
          f'Dice: {val_dice:.4f} | '
          f'MAE: {val_mae:.4f} | '
          f'LR: {current_lr:.1e} | '
          f'{elapsed:.0f}s | '
          f'ETA: {eta_h:.1f}h')

    train_losses.append(train_loss)
    val_ious.append(val_iou)

    # Save checkpoint
    is_best = val_iou > best_iou
    if is_best:
        best_iou  = val_iou
        no_improve = 0
    else:
        no_improve += 1

    save_checkpoint(epoch, best_iou, val_iou, is_best)

    # Visualize every 10 epochs
    if (epoch + 1) % 10 == 0:
        fig, axes = plt.subplots(2, 4, figsize=(16, 8))
        model.eval()
        sample = next(iter(val_loader))
        with torch.no_grad():
            imgs  = sample['image'][:4].to(device)
            masks = sample['mask'][:4]
            pred  = torch.sigmoid(get_pred(model(imgs)))
            pred  = (pred > 0.5).float().cpu()

        mean = torch.tensor([0.485,0.456,0.406])
        std  = torch.tensor([0.229,0.224,0.225])

        for j in range(4):
            img_show = imgs[j].cpu().permute(1,2,0)
            img_show = (img_show * std + mean).clamp(0,1)
            axes[0,j].imshow(img_show)
            axes[0,j].set_title('Image')
            axes[0,j].axis('off')
            axes[1,j].imshow(pred[j,0], cmap='gray')
            axes[1,j].set_title(f'Pred IoU≈{val_iou:.3f}')
            axes[1,j].axis('off')

        plt.suptitle(f'Epoch {epoch+1}')
        plt.tight_layout()
        plt.savefig(
            f'{KAGGLE_WORKING}/preview_ep{epoch+1:03d}.png')
        plt.show()
        model.train()

    # Early stopping
    if no_improve >= PATIENCE:
        print(f'\nEarly stop: no improvement '
              f'for {PATIENCE} epochs.')
        break

    # Free memory
    torch.cuda.empty_cache()
    gc.collect()

# Plot curves
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4))
ax1.plot(train_losses, label='Train Loss', color='red')
ax1.set_title('Training Loss')
ax1.set_xlabel('Epoch')
ax1.legend()

ax2.plot(val_ious, label='Val IoU', color='blue')
ax2.axhline(0.85, color='green',
            linestyle='--', label='Target 0.85')
ax2.set_title('Validation IoU')
ax2.set_xlabel('Epoch')
ax2.legend()

plt.tight_layout()
plt.savefig(f'{KAGGLE_WORKING}/training_curves.png')
plt.show()

print(f'\n{"="*50}')
print(f'Training complete! Best IoU: {best_iou:.4f}')
print(f'{"="*50}')'''),

    ("CELL 12 — Export ONNX + INT8", r'''class ExportWrapper(nn.Module):
    """Adds sigmoid for inference — model outputs logits."""
    def __init__(self, m):
        super().__init__()
        self.m = m
    def forward(self, x):
        out = self.m(x)
        out = out[0] if isinstance(out,(list,tuple)) else out
        return torch.sigmoid(out)


# Load best checkpoint
print('Loading best checkpoint...')
ckpt = torch.load(f'{CHECKPOINT_DIR}/best_model.pth',
                  map_location=device)
model.load_state_dict(ckpt['model_state'])
model.eval()

# ── Test set evaluation ────────────────────────────────────
print('\nEvaluating on test set...')
t_iou, t_dice, t_mae, n, t_inf = 0, 0, 0, 0, 0

with torch.no_grad():
    for batch in test_loader:
        imgs  = batch['image'].to(device)
        masks = batch['mask'].to(device)
        t0    = time.time()
        pred  = torch.sigmoid(get_pred(model(imgs)))
        t_inf += (time.time() - t0) * 1000
        t_iou  += compute_iou(pred,  masks)
        t_dice += compute_dice(pred, masks)
        t_mae  += compute_mae(pred,  masks)
        n += 1

print(f'\n{"="*45}')
print(f'  TEST RESULTS')
print(f'{"="*45}')
print(f'  IoU : {t_iou/n:.4f}')
print(f'  Dice: {t_dice/n:.4f}')
print(f'  MAE : {t_mae/n:.4f}')
print(f'  GPU ms/img: {t_inf/n/BATCH_SIZE:.1f}ms')
print(f'{"="*45}')

# ── Export FP32 ONNX ───────────────────────────────────────
fp32_path = f'{EXPORT_DIR}/model_fp32.onnx'
int8_path = f'{EXPORT_DIR}/model_int8.onnx'

print('\nExporting FP32 ONNX...')
export_model = ExportWrapper(model).cpu()
dummy = torch.randn(1, 3, INPUT_SIZE, INPUT_SIZE)

torch.onnx.export(
    export_model, dummy, fp32_path,
    opset_version=13,
    input_names=['input'],
    output_names=['output'],
    dynamic_axes={
        'input' : {0:'batch', 2:'height', 3:'width'},
        'output': {0:'batch', 2:'height', 3:'width'}
    }
)
onnx.checker.check_model(onnx.load(fp32_path))
fp32_mb = os.path.getsize(fp32_path) / 1024 / 1024
print(f'FP32: {fp32_mb:.1f}MB — VALID')

# ── INT8 Quantization ──────────────────────────────────────
print('Quantizing to INT8...')
quantize_dynamic(fp32_path, int8_path,
                 weight_type=QuantType.QUInt8)
int8_mb = os.path.getsize(int8_path) / 1024 / 1024
print(f'INT8: {int8_mb:.1f}MB')

# ── Validate INT8 ──────────────────────────────────────────
import onnxruntime as ort

def eval_onnx(path, loader, max_batches=20):
    sess     = ort.InferenceSession(
        path, providers=['CPUExecutionProvider'])
    inp_name = sess.get_inputs()[0].name
    ious, ms = [], []
    for i, batch in enumerate(loader):
        if i >= max_batches: break
        imgs  = batch['image'].numpy()
        masks = batch['mask']
        t0    = time.time()
        pred  = sess.run(None, {inp_name: imgs})[0]
        ms.append((time.time()-t0)*1000)
        prob  = torch.from_numpy(pred)
        ious.append(compute_iou(prob, masks))
    return np.mean(ious), np.mean(ms)

print('\nValidating models on CPU...')
iou32, t32 = eval_onnx(fp32_path, test_loader)
iou8,  t8  = eval_onnx(int8_path, test_loader)
delta = abs(iou32 - iou8)

print(f'\n{"="*52}')
print(f'{"Model":<8}{"Size":>8}{"CPU ms":>10}{"IoU":>10}')
print(f'{"-"*52}')
print(f'{"FP32":<8}{fp32_mb:>6.1f}MB{t32:>8.1f}ms{iou32:>10.4f}')
print(f'{"INT8":<8}{int8_mb:>6.1f}MB{t8:>8.1f}ms{iou8:>10.4f}')
print(f'{"Delta":<8}{"":>8}{"":>10}{delta:>10.4f}')
print(f'{"="*52}')
print('PASS ✅' if delta < 0.02 else
      'WARNING: >2% quality drop ⚠️')

# ── Save config ────────────────────────────────────────────
config = {
    'input_size' : INPUT_SIZE,
    'mean'       : [0.485, 0.456, 0.406],
    'std'        : [0.229, 0.224, 0.225],
    'threshold'  : 0.5,
    'best_iou'   : float(best_iou),
    'fp32_mb'    : round(fp32_mb, 1),
    'int8_mb'    : round(int8_mb, 1),
    'fp32_iou'   : round(float(iou32), 4),
    'int8_iou'   : round(float(iou8),  4),
}
with open(f'{EXPORT_DIR}/model_config.json', 'w') as f:
    json.dump(config, f, indent=2)

print(f'\n{"="*52}')
print(f'  DONE!')
print(f'  Best IoU   : {best_iou:.4f}')
print(f'  Files saved: {EXPORT_DIR}')
print(f'\n  NEXT STEP:')
print(f'  Click Output tab (right panel)')
print(f'  → exports/model_int8.onnx')
print(f'  → Download it')
print(f'  → Deploy to Render')
print(f'{"="*52}')''')
]

for title, code_src in cells_data:
    # Add the markdown title cell
    notebook['cells'].append({
        "cell_type": "markdown",
        "metadata": {},
        "source": [f"### {title}"]
    })
    
    # Add the code cell
    code_lines = [line + '\n' for line in code_src.split('\n')]
    if code_lines:
        code_lines[-1] = code_lines[-1].rstrip('\n') # Remove trailing newline from last line just to be neat
    
    notebook['cells'].append({
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": code_lines
    })

with open(r"c:\Users\koush\OneDrive\Desktop\bg rem ai\notebooks\update_nb.py", "w", encoding="utf-8") as f:
    f.write('''import json\n''' + open(__file__).read() if '__file__' in globals() else '') # Self-contained logic, just write the dump

with open(r"c:\Users\koush\OneDrive\Desktop\bg rem ai\notebooks\update_nb.py", "w", encoding="utf-8") as f:
    f.write("""import json
import os
""" + open(__file__).read().split("cells_data = ")[1] if '__file__' in globals() else "") # Fallback

# Simplified self-contained python script syntax:
with open(r"c:\Users\koush\OneDrive\Desktop\bg rem ai\notebooks\update_nb.py", "w", encoding="utf-8") as f:
    f.write("""import json\n\n""" + open(__file__).read() if '__file__' in globals() else "")
