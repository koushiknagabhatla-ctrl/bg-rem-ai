"""
BGRemovalUNet: MobileNetV3-Small Encoder + CBAM Attention Decoder
==================================================================

Architecture Choice — Why MobileNetV3 + U-Net for CPU Inference:
─────────────────────────────────────────────────────────────────
MobileNetV3 uses:
  • Depthwise separable convolutions:
      Standard: k²·C_in·C_out params
      Depthwise: k²·C_in + C_in·C_out params
      Reduction ratio: 1/C_out + 1/k²  ≈ 8-9x fewer params for k=3, C=64

  • h-swish activation: f(x) = x · ReLU6(x+3)/6
      Hardware-friendly approximation of swish.
      No exp() call → faster on CPU integer pipelines.

  • h-sigmoid: f(x) = ReLU6(x+3)/6
      Used in SE blocks. Avoids exp() of regular sigmoid.

  • Squeeze-and-Excitation in select blocks (channel attention)

  • ~2.5M total encoder params (vs ResNet34: 21.8M) → 4x faster on CPU

Inverted Residual Block (MobileNetV3 core):
──────────────────────────────────────────
  Standard residual: wide → narrow → wide   (compress then expand)
  Inverted residual: narrow → wide → narrow  (expand then compress)

  Block equations:
    x₁ = BN(PW-Conv(x))                              [expand: 1×1 conv]
    x₂ = Activation(x₁)                              [h-swish or ReLU]
    x₃ = BN(DW-Conv(x₂))                             [depthwise: k×k conv]
    x₄ = Activation(x₃)
    x₅ = SE(x₄)                                      [squeeze-excite, optional]
    x₆ = BN(PW-Conv(x₅))                             [project: 1×1 conv, LINEAR]
    out = x + x₆  (only if stride=1 AND in_ch==out_ch) [residual skip]

  Expansion factor t: intermediate channels = t × input_channels
  Linear bottleneck: no activation after final pointwise conv
  (activating low-dimensional features destroys information)

Network Dimensions:
──────────────────
  Input: (B, 3, 320, 320)

  ENCODER:
    Stem:   320×320×3   → 160×160×16    (stride 2 conv3×3)
    E1:     160×160×16  → 80×80×16      (InvRes, stride 2, exp=1)
    E2:     80×80×16    → 40×40×24      (InvRes, stride 2, exp=4.5)
    E3:     40×40×24    → 20×20×40      (InvRes, stride 2, exp=4, SE)
    E4:     20×20×40    → 10×10×96      (InvRes, stride 2, exp=6, SE)
    E5:     10×10×96    → 10×10×576     (InvRes, stride 1, exp=6, SE)

  DECODER (with skip connections + CBAM):
    D1: upsample(E5)+E4 → 20×20×128    (ConvTranspose2d → CBAM)
    D2: upsample(D1)+E3 → 40×40×64     (ConvTranspose2d → CBAM)
    D3: upsample(D2)+E2 → 80×80×32     (ConvTranspose2d → CBAM)
    D4: upsample(D3)+E1 → 160×160×16   (ConvTranspose2d → CBAM)
    D5: upsample(D4)    → 320×320×8    (bilinear upsample)

  OUTPUT HEAD:
    Conv1×1(8→1) → Sigmoid → (B, 1, 320, 320) probability mask

  DEEP SUPERVISION (training only):
    S4 from D4: Conv→Sigmoid → (B,1,160,160) → upsample to 320×320
    S3 from D3: Conv→Sigmoid → (B,1,80,80)   → upsample to 320×320
    S2 from D2: Conv→Sigmoid → (B,1,40,40)   → upsample to 320×320
    S1 from D5: (B,1,320,320)                 [main output]
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import List, Optional

from .attention import CBAM


# ─────────────────────────────────────────────────────────────────
# Activation Functions
# ─────────────────────────────────────────────────────────────────

class HSwish(nn.Module):
    """
    h-swish: f(x) = x · ReLU6(x + 3) / 6

    Derivation:
        swish(x) = x · σ(x)  where σ = sigmoid
        h-swish replaces sigmoid with piecewise-linear h-sigmoid:
            h-sigmoid(x) = ReLU6(x + 3) / 6
        This avoids the exp() call, making it ~2x faster on CPU/mobile.

        ReLU6(x) = min(max(0, x), 6)
        So h-sigmoid(x) = clip(x+3, 0, 6) / 6

        Properties:
            h-swish(0)  = 0 · (3/6) = 0
            h-swish(-3) = -3 · 0 = 0
            h-swish(3)  = 3 · 1 = 3
            Smooth transition, nearly identical to swish for |x| < 3
    """

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return x * F.relu6(x + 3.0, inplace=False) / 6.0


class HSigmoid(nn.Module):
    """
    h-sigmoid: f(x) = ReLU6(x + 3) / 6

    Piecewise linear approximation of sigmoid:
        σ(x) ≈ clip(x + 3, 0, 6) / 6

    Properties:
        h-sigmoid(0)   = 0.5  (matches sigmoid(0) = 0.5)
        h-sigmoid(-3)  = 0    (matches sigmoid(-3) ≈ 0.047)
        h-sigmoid(3)   = 1    (matches sigmoid(3) ≈ 0.953)
    """

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return F.relu6(x + 3.0, inplace=False) / 6.0


def get_activation(name: str) -> nn.Module:
    """Factory for activation functions."""
    if name == "hswish":
        return HSwish()
    elif name == "relu":
        return nn.ReLU(inplace=True)
    elif name == "hsigmoid":
        return HSigmoid()
    else:
        raise ValueError(f"Unknown activation: {name}")


# ─────────────────────────────────────────────────────────────────
# Squeeze-and-Excitation Block
# ─────────────────────────────────────────────────────────────────

class SEBlock(nn.Module):
    """
    Squeeze-and-Excitation block (MobileNetV3 variant).

    Math:
        z_c = (1/HW) Σ_i Σ_j u_c(i,j)             [squeeze: GAP]
        s = h-sigmoid(W₂ · ReLU(W₁ · z))           [excitation]
        x̃_c = s_c · u_c                             [scale]

    Uses h-sigmoid instead of sigmoid for CPU efficiency.
    Reduction ratio r=4 (MobileNetV3 uses smaller r than original SE).
    """

    def __init__(self, in_channels: int, reduction: int = 4):
        super().__init__()
        mid = max(in_channels // reduction, 8)
        self.squeeze = nn.AdaptiveAvgPool2d(1)
        self.excite = nn.Sequential(
            nn.Conv2d(in_channels, mid, 1, bias=True),
            nn.ReLU(inplace=True),
            nn.Conv2d(mid, in_channels, 1, bias=True),
            HSigmoid(),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        scale = self.squeeze(x)       # (B, C, 1, 1)
        scale = self.excite(scale)     # (B, C, 1, 1)
        return x * scale


# ─────────────────────────────────────────────────────────────────
# Inverted Residual Block
# ─────────────────────────────────────────────────────────────────

class InvertedResidual(nn.Module):
    """
    Inverted Residual Block with Linear Bottleneck (MobileNetV3).

    Architecture:
        1. Expand:  1×1 conv → BN → Activation  (only if expand_ratio != 1)
        2. Depthwise: k×k dwconv → BN → Activation
        3. SE: Squeeze-and-Excitation (optional)
        4. Project: 1×1 conv → BN (LINEAR — no activation!)
        5. Residual: add input if stride=1 and in_ch==out_ch

    Why linear bottleneck (no activation on project)?
        ReLU on low-dimensional manifolds causes information loss.
        Proved in MobileNetV2 paper: removing the last ReLU preserves
        information that would otherwise be destroyed by the non-linearity.

    Memory footprint:
        Peak memory ∝ H × W × C_expand
        Params = expand_1x1 + depthwise + project_1x1 + SE
               = C_in×C_exp + k²×C_exp + C_exp×C_out + SE_params
    """

    def __init__(
        self,
        in_channels: int,
        out_channels: int,
        kernel_size: int,
        stride: int,
        expand_ratio: float,
        use_se: bool = False,
        activation: str = "relu",
    ):
        super().__init__()
        self.stride = stride
        self.use_residual = (stride == 1 and in_channels == out_channels)
        hidden_dim = int(round(in_channels * expand_ratio))

        layers = []

        # 1. Expansion phase (pointwise 1×1) — skip if expand_ratio == 1
        if expand_ratio != 1:
            layers.extend([
                nn.Conv2d(in_channels, hidden_dim, 1, bias=False),
                nn.BatchNorm2d(hidden_dim),
                get_activation(activation),
            ])

        # 2. Depthwise convolution (k×k, groups=hidden_dim)
        #    Params: k² × hidden_dim (vs k² × C_in × C_out for standard)
        padding = (kernel_size - 1) // 2  # same-padding: p = floor(k/2)
        layers.extend([
            nn.Conv2d(
                hidden_dim, hidden_dim, kernel_size,
                stride=stride, padding=padding,
                groups=hidden_dim, bias=False,
            ),
            nn.BatchNorm2d(hidden_dim),
            get_activation(activation),
        ])

        # 3. Squeeze-and-Excitation (optional)
        if use_se:
            layers.append(SEBlock(hidden_dim))

        # 4. Projection phase (pointwise 1×1, LINEAR — no activation!)
        layers.extend([
            nn.Conv2d(hidden_dim, out_channels, 1, bias=False),
            nn.BatchNorm2d(out_channels),
        ])

        self.block = nn.Sequential(*layers)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        out = self.block(x)
        if self.use_residual:
            out = out + x
        return out


# ─────────────────────────────────────────────────────────────────
# Decoder Block
# ─────────────────────────────────────────────────────────────────

class DecoderBlock(nn.Module):
    """
    Decoder block: upsample + skip connection concat + conv + CBAM.

    Architecture:
        1. Upsample bottleneck features via ConvTranspose2d (stride=2)
        2. Concatenate with encoder skip connection
        3. Two 3×3 convolutions with BN + ReLU for feature fusion
        4. CBAM attention to refine features

    ConvTranspose2d math:
        out_size = (in_size - 1) × stride - 2×padding + kernel_size + output_padding
        For stride=2, kernel=2, pad=0: out = (in-1)×2 + 2 = 2×in  (exactly 2x upsample)
    """

    def __init__(
        self,
        in_channels: int,
        skip_channels: int,
        out_channels: int,
    ):
        super().__init__()
        # Learned upsampling: ConvTranspose2d doubles spatial dims
        self.upsample = nn.ConvTranspose2d(
            in_channels, in_channels, kernel_size=2, stride=2,
        )

        # Feature fusion after concatenation
        fused_channels = in_channels + skip_channels
        self.conv_block = nn.Sequential(
            nn.Conv2d(fused_channels, out_channels, 3, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_channels, out_channels, 3, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
        )

        # CBAM refines fused features
        self.cbam = CBAM(out_channels, reduction_ratio=16, spatial_kernel_size=7)

    def forward(
        self, x: torch.Tensor, skip: torch.Tensor
    ) -> torch.Tensor:
        """
        Args:
            x: Bottleneck features from deeper layer (B, C, H, W)
            skip: Encoder features from same resolution (B, C_skip, 2H, 2W)
        Returns:
            Fused + attention-refined features (B, C_out, 2H, 2W)
        """
        # Upsample: (B, C, H, W) → (B, C, 2H, 2W)
        x = self.upsample(x)

        # Handle size mismatch (can happen due to odd spatial dims)
        if x.shape[2:] != skip.shape[2:]:
            x = F.interpolate(x, size=skip.shape[2:], mode="bilinear", align_corners=False)

        # Concatenate along channel axis: (B, C+C_skip, 2H, 2W)
        x = torch.cat([x, skip], dim=1)

        # Feature fusion + CBAM attention
        x = self.conv_block(x)
        x = self.cbam(x)
        return x


class DecoderBlockNoSkip(nn.Module):
    """
    Final decoder block without skip connection — just upsample + conv.
    Used for D5 (320×320) where there's no encoder skip at that resolution.
    """

    def __init__(self, in_channels: int, out_channels: int):
        super().__init__()
        self.block = nn.Sequential(
            nn.Conv2d(in_channels, out_channels, 3, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_channels, out_channels, 3, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
        )

    def forward(self, x: torch.Tensor, target_size: tuple) -> torch.Tensor:
        x = F.interpolate(x, size=target_size, mode="bilinear", align_corners=False)
        return self.block(x)


# ─────────────────────────────────────────────────────────────────
# Deep Supervision Head
# ─────────────────────────────────────────────────────────────────

class DeepSupervisionHead(nn.Module):
    """
    Side output head for deep supervision.

    Applies 1×1 conv → sigmoid to produce probability mask,
    then upsamples to full resolution.

    Deep supervision forces intermediate decoder layers to learn
    meaningful segmentation features early in training, providing
    gradient shortcuts that mitigate vanishing gradients in deep nets.
    """

    def __init__(self, in_channels: int):
        super().__init__()
        self.conv = nn.Conv2d(in_channels, 1, kernel_size=1)

    def forward(
        self, x: torch.Tensor, target_size: tuple
    ) -> torch.Tensor:
        """
        Args:
            x: Decoder features (B, C, H', W')
            target_size: Target spatial size (H, W) for full resolution
        Returns:
            Probability mask at full resolution (B, 1, H, W)
        """
        x = self.conv(x)  # (B, 1, H', W')
        x = torch.sigmoid(x)
        if x.shape[2:] != target_size:
            x = F.interpolate(x, size=target_size, mode="bilinear", align_corners=False)
        return x


# ─────────────────────────────────────────────────────────────────
# MobileNetV3-Small Encoder
# ─────────────────────────────────────────────────────────────────

class MobileNetV3SmallEncoder(nn.Module):
    """
    MobileNetV3-Small encoder — designed from scratch (no pretrained weights).

    Architecture follows the MobileNetV3 paper, Table 2 (Small):
        Stem:   3×3 conv, stride 2  → 16 channels
        Stage 1: InvRes k3, exp=1,   C=16, stride 2, RE
        Stage 2: InvRes k3, exp=4.5, C=24, stride 2, RE (×2 blocks)
        Stage 3: InvRes k5, exp=4,   C=40, stride 2, RE, SE (×3 blocks)
        Stage 4: InvRes k5, exp=6,   C=48→96, stride 2, HS, SE (×3 blocks)
        Stage 5: InvRes k5, exp=6,   C=96→576, stride 1, HS, SE (×1 block)

    Returns list of feature maps at 5 scales for U-Net skip connections.
    """

    def __init__(self):
        super().__init__()

        # Stem: 320×320×3 → 160×160×16
        # Standard 3×3 conv, stride 2 — captures low-level features
        self.stem = nn.Sequential(
            nn.Conv2d(3, 16, 3, stride=2, padding=1, bias=False),
            nn.BatchNorm2d(16),
            HSwish(),
        )

        # Stage 1: 160×160×16 → 80×80×16
        # Single InvRes block, small expansion (t=1), no SE
        self.stage1 = nn.Sequential(
            InvertedResidual(16, 16, kernel_size=3, stride=2, expand_ratio=1,
                             use_se=True, activation="relu"),
        )

        # Stage 2: 80×80×16 → 40×40×24
        # Two blocks: first strides, second refines
        self.stage2 = nn.Sequential(
            InvertedResidual(16, 24, kernel_size=3, stride=2, expand_ratio=4.5,
                             use_se=False, activation="relu"),
            InvertedResidual(24, 24, kernel_size=3, stride=1, expand_ratio=3.67,
                             use_se=False, activation="relu"),
        )

        # Stage 3: 40×40×24 → 20×20×40
        # Three blocks with SE attention (starts learning "what" features)
        self.stage3 = nn.Sequential(
            InvertedResidual(24, 40, kernel_size=5, stride=2, expand_ratio=4,
                             use_se=True, activation="hswish"),
            InvertedResidual(40, 40, kernel_size=5, stride=1, expand_ratio=6,
                             use_se=True, activation="hswish"),
            InvertedResidual(40, 40, kernel_size=5, stride=1, expand_ratio=6,
                             use_se=True, activation="hswish"),
        )

        # Stage 4: 20×20×40 → 10×10×96
        # Progressive channel expansion with SE
        self.stage4 = nn.Sequential(
            InvertedResidual(40, 48, kernel_size=5, stride=1, expand_ratio=3,
                             use_se=True, activation="hswish"),
            InvertedResidual(48, 48, kernel_size=5, stride=1, expand_ratio=3,
                             use_se=True, activation="hswish"),
            InvertedResidual(48, 96, kernel_size=5, stride=2, expand_ratio=6,
                             use_se=True, activation="hswish"),
        )

        # Stage 5 (Bottleneck): 10×10×96 → 10×10×576
        # No spatial downsampling — just channel expansion for rich features
        self.stage5 = nn.Sequential(
            InvertedResidual(96, 96, kernel_size=5, stride=1, expand_ratio=6,
                             use_se=True, activation="hswish"),
            nn.Conv2d(96, 576, 1, bias=False),
            nn.BatchNorm2d(576),
            HSwish(),
        )

    def forward(self, x: torch.Tensor) -> List[torch.Tensor]:
        """
        Returns:
            List of 5 feature maps at decreasing resolutions:
            [stem_out, e1, e2, e3, e4_e5]
            stem_out: 160×160×16
            e1: 80×80×16
            e2: 40×40×24
            e3: 20×20×40
            e4: 10×10×96  (used as skip for D1)
            e5: 10×10×576 (bottleneck input to decoder)
        """
        stem_out = self.stem(x)    # 160×160×16
        e1 = self.stage1(stem_out)  # 80×80×16
        e2 = self.stage2(e1)       # 40×40×24
        e3 = self.stage3(e2)       # 20×20×40
        e4 = self.stage4(e3)       # 10×10×96
        e5 = self.stage5(e4)       # 10×10×576

        return [stem_out, e1, e2, e3, e4, e5]


# ─────────────────────────────────────────────────────────────────
# Full Background Removal U-Net
# ─────────────────────────────────────────────────────────────────

class BGRemovalUNet(nn.Module):
    """
    Complete Background Removal U-Net.

    Encoder: MobileNetV3-Small (custom, no pretrained weights)
    Decoder: 5-stage upsampling with CBAM attention + skip connections
    Output:  Sigmoid probability mask (B, 1, 320, 320)
    Deep supervision: 3 additional side outputs during training

    Total parameters: ~3.8M (lightweight for CPU inference)

    Training mode:
        Returns [S1, S2, S3, S4] — main + 3 deep supervision outputs
        All at full resolution (B, 1, 320, 320)

    Eval mode:
        Returns S1 only — main output (B, 1, 320, 320)
    """

    def __init__(self, input_size: int = 320):
        super().__init__()
        self.input_size = input_size

        # ── Encoder ──
        self.encoder = MobileNetV3SmallEncoder()

        # ── Decoder ──
        # D1: upsample(E5=576) + skip(E4=96) → 128
        self.decoder1 = DecoderBlock(in_channels=576, skip_channels=96, out_channels=128)

        # D2: upsample(D1=128) + skip(E3=40) → 64
        self.decoder2 = DecoderBlock(in_channels=128, skip_channels=40, out_channels=64)

        # D3: upsample(D2=64) + skip(E2=24) → 32
        self.decoder3 = DecoderBlock(in_channels=64, skip_channels=24, out_channels=32)

        # D4: upsample(D3=32) + skip(E1=16) → 16
        self.decoder4 = DecoderBlock(in_channels=32, skip_channels=16, out_channels=16)

        # D5: upsample(D4=16) → 8 (bilinear, no skip at this resolution)
        self.decoder5 = DecoderBlockNoSkip(in_channels=16, out_channels=8)

        # ── Output Head ──
        # Conv 1×1 reduces 8 channels → 1 → sigmoid for probability
        self.output_head = nn.Sequential(
            nn.Conv2d(8, 1, kernel_size=1),
            nn.Sigmoid(),
        )

        # ── Deep Supervision Heads (training only) ──
        # S4 from D4 (160×160×16 → 1 → upsample to 320×320)
        self.ds_head4 = DeepSupervisionHead(in_channels=16)
        # S3 from D3 (80×80×32 → 1 → upsample to 320×320)
        self.ds_head3 = DeepSupervisionHead(in_channels=32)
        # S2 from D2 (40×40×64 → 1 → upsample to 320×320)
        self.ds_head2 = DeepSupervisionHead(in_channels=64)

        # Initialize weights
        self._initialize_weights()

    def _initialize_weights(self):
        """
        Kaiming He initialization for all conv layers.

        For conv layers followed by ReLU/HSwish:
            w ~ N(0, sqrt(2 / fan_in))
        This preserves variance through the network, preventing
        gradient vanishing/explosion in deep networks.

        BN: γ=1, β=0 (identity transform initially)
        """
        for m in self.modules():
            if isinstance(m, nn.Conv2d):
                nn.init.kaiming_normal_(m.weight, mode="fan_out", nonlinearity="relu")
                if m.bias is not None:
                    nn.init.zeros_(m.bias)
            elif isinstance(m, nn.ConvTranspose2d):
                nn.init.kaiming_normal_(m.weight, mode="fan_out", nonlinearity="relu")
                if m.bias is not None:
                    nn.init.zeros_(m.bias)
            elif isinstance(m, nn.BatchNorm2d):
                nn.init.ones_(m.weight)   # γ = 1
                nn.init.zeros_(m.bias)    # β = 0
            elif isinstance(m, nn.Linear):
                nn.init.kaiming_normal_(m.weight, mode="fan_out", nonlinearity="relu")
                if m.bias is not None:
                    nn.init.zeros_(m.bias)

    def forward(self, x: torch.Tensor) -> torch.Tensor | List[torch.Tensor]:
        """
        Forward pass.

        Args:
            x: Input image tensor (B, 3, 320, 320)
               Normalized with ImageNet stats.

        Returns:
            Training mode: List[Tensor] = [S1, S2, S3, S4]
                S1: Main output   (B, 1, 320, 320)
                S2: From decoder2 (B, 1, 320, 320) — upsampled from 40×40
                S3: From decoder3 (B, 1, 320, 320) — upsampled from 80×80
                S4: From decoder4 (B, 1, 320, 320) — upsampled from 160×160

            Eval mode: Tensor = S1 only (B, 1, 320, 320)
        """
        target_size = (x.shape[2], x.shape[3])  # (H, W)

        # ── Encoder ──
        features = self.encoder(x)
        stem_out, e1, e2, e3, e4, e5 = features
        # stem_out: 160×160×16
        # e1: 80×80×16
        # e2: 40×40×24
        # e3: 20×20×40
        # e4: 10×10×96
        # e5: 10×10×576

        # ── Decoder ──
        d1 = self.decoder1(e5, e4)  # 20×20×128
        d2 = self.decoder2(d1, e3)  # 40×40×64
        d3 = self.decoder3(d2, e2)  # 80×80×32
        d4 = self.decoder4(d3, e1)  # 160×160×16
        d5 = self.decoder5(d4, target_size)  # 320×320×8

        # ── Main Output ──
        s1 = self.output_head(d5)  # (B, 1, 320, 320)

        if self.training:
            # ── Deep Supervision Outputs ──
            s4 = self.ds_head4(d4, target_size)  # (B, 1, 320, 320)
            s3 = self.ds_head3(d3, target_size)  # (B, 1, 320, 320)
            s2 = self.ds_head2(d2, target_size)  # (B, 1, 320, 320)
            return [s1, s2, s3, s4]

        return s1

    def get_param_count(self) -> dict:
        """Return parameter counts per component."""
        encoder_params = sum(p.numel() for p in self.encoder.parameters())
        decoder_params = sum(
            p.numel()
            for name, p in self.named_parameters()
            if "decoder" in name
        )
        head_params = sum(
            p.numel()
            for name, p in self.named_parameters()
            if "head" in name
        )
        total = sum(p.numel() for p in self.parameters())
        return {
            "encoder": encoder_params,
            "decoder": decoder_params,
            "heads": head_params,
            "total": total,
            "total_MB": total * 4 / 1024 / 1024,  # FP32 size in MB
        }


def build_model(input_size: int = 320) -> BGRemovalUNet:
    """Factory function to create and validate the model."""
    model = BGRemovalUNet(input_size=input_size)

    # Validate forward pass dimensions
    dummy = torch.randn(1, 3, input_size, input_size)
    model.train()
    outputs = model(dummy)
    assert isinstance(outputs, list), "Training mode should return list"
    assert len(outputs) == 4, "Should return 4 outputs (main + 3 deep supervision)"
    for i, o in enumerate(outputs):
        assert o.shape == (1, 1, input_size, input_size), \
            f"Output {i} shape {o.shape} != expected (1, 1, {input_size}, {input_size})"

    model.eval()
    with torch.no_grad():
        output = model(dummy)
    assert output.shape == (1, 1, input_size, input_size), \
        f"Eval output shape {output.shape} != expected"

    return model


if __name__ == "__main__":
    model = build_model(320)
    params = model.get_param_count()
    print("=" * 60)
    print("BGRemoval U-Net — Architecture Summary")
    print("=" * 60)
    print(f"Encoder params:  {params['encoder']:,}")
    print(f"Decoder params:  {params['decoder']:,}")
    print(f"Head params:     {params['heads']:,}")
    print(f"Total params:    {params['total']:,}")
    print(f"Model size (FP32): {params['total_MB']:.1f} MB")
    print("=" * 60)

    # Test forward pass
    x = torch.randn(2, 3, 320, 320)

    model.train()
    outputs = model(x)
    print(f"\nTraining mode outputs: {len(outputs)} tensors")
    for i, o in enumerate(outputs):
        print(f"  S{i+1}: {o.shape}")

    model.eval()
    with torch.no_grad():
        output = model(x)
    print(f"\nEval mode output: {output.shape}")
    print("\n✓ All dimension checks passed!")
