"""
CBAM: Convolutional Block Attention Module
==========================================

Mathematical Derivation:
────────────────────────

CHANNEL ATTENTION (Squeeze-and-Excitation variant):
    Given feature map F ∈ ℝ^{C×H×W}:
    
    Step 1 — Global Average Pool (Squeeze):
        z_c = F_sq(u_c) = (1/HW) Σ_i Σ_j u_c(i,j)
        Produces z ∈ ℝ^C — one scalar per channel.
    
    Step 2 — Global Max Pool (additional statistics):
        z'_c = max_{i,j} u_c(i,j)
        Captures strongest activation per channel.
    
    Step 3 — Excitation (shared MLP):
        s = σ(W₂ · δ(W₁ · z) + W₂ · δ(W₁ · z'))
        Where:
            W₁ ∈ ℝ^{(C/r)×C}   — reduction (r=16 default)
            W₂ ∈ ℝ^{C×(C/r)}   — expansion
            δ = ReLU
            σ = Sigmoid
    
    Step 4 — Scale:
        F' = s ⊗ F   (channel-wise multiplication)

SPATIAL ATTENTION:
    Given channel-refined F' ∈ ℝ^{C×H×W}:
    
    Step 1 — Channel compression:
        F_avg = AvgPool(F', dim=channel) ∈ ℝ^{1×H×W}
        F_max = MaxPool(F', dim=channel) ∈ ℝ^{1×H×W}
    
    Step 2 — Concatenate + Conv:
        M_s = σ(f^{7×7}([F_avg; F_max]))
        7×7 kernel captures local spatial context.
    
    Step 3 — Scale:
        F'' = M_s ⊗ F'

COMBINED CBAM:
    F'  = M_c(F) ⊗ F      [channel attention first]
    F'' = M_s(F') ⊗ F'    [then spatial attention]

Why attention improves segmentation:
    - Channel attention learns "what" features matter (e.g., edge vs texture)
    - Spatial attention learns "where" in the image to focus (foreground regions)
    - Together: model selectively amplifies relevant foreground features
      and suppresses background noise.
"""

import torch
import torch.nn as nn
import torch.nn.functional as F


class ChannelAttention(nn.Module):
    """
    Channel Attention Module (SE-Net variant with both avg+max pooling).
    
    Math:
        z_avg = GAP(F)           ∈ ℝ^C
        z_max = GMP(F)           ∈ ℝ^C
        s = σ(MLP(z_avg) + MLP(z_max))  ∈ ℝ^C
        F' = s ⊗ F
    
    Parameters:
        in_channels: Number of input channels C
        reduction_ratio: r in the bottleneck (default=16)
            Bottleneck dim = max(C // r, 8) to prevent collapsing to 0
    """

    def __init__(self, in_channels: int, reduction_ratio: int = 16):
        super().__init__()
        # Ensure bottleneck has at least 8 channels
        mid_channels = max(in_channels // reduction_ratio, 8)
        
        # Shared MLP: two FC layers with ReLU between
        # W₁ ∈ ℝ^{mid×C}, W₂ ∈ ℝ^{C×mid}
        self.shared_mlp = nn.Sequential(
            nn.Linear(in_channels, mid_channels, bias=False),
            nn.ReLU(inplace=True),
            nn.Linear(mid_channels, in_channels, bias=False),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Args:
            x: Input feature map (B, C, H, W)
        Returns:
            Attention-weighted feature map (B, C, H, W)
        """
        B, C, H, W = x.shape

        # Global Average Pooling: z_avg_c = (1/HW) Σ_i Σ_j x_c(i,j)
        avg_pool = x.mean(dim=[2, 3])  # (B, C)

        # Global Max Pooling: z_max_c = max_{i,j} x_c(i,j)
        max_pool = x.amax(dim=[2, 3])  # (B, C)

        # Shared MLP applied to both, then sum
        # s = σ(W₂·δ(W₁·z_avg) + W₂·δ(W₁·z_max))
        avg_out = self.shared_mlp(avg_pool)  # (B, C)
        max_out = self.shared_mlp(max_pool)  # (B, C)

        # Sigmoid activation: s ∈ (0, 1)^C
        attention = torch.sigmoid(avg_out + max_out)  # (B, C)

        # Scale: F' = s ⊗ F (broadcast over H, W)
        return x * attention.unsqueeze(-1).unsqueeze(-1)


class SpatialAttention(nn.Module):
    """
    Spatial Attention Module.
    
    Math:
        F_avg = AvgPool(F, dim=C) ∈ ℝ^{1×H×W}
        F_max = MaxPool(F, dim=C) ∈ ℝ^{1×H×W}
        M_s = σ(Conv7×7([F_avg; F_max]))  ∈ ℝ^{1×H×W}
        F' = M_s ⊗ F
    
    Parameters:
        kernel_size: Size of convolution kernel (default=7)
            We use 7×7 to capture local spatial context.
            Padding = kernel_size // 2 = 3 for same-padding.
    """

    def __init__(self, kernel_size: int = 7):
        super().__init__()
        # Same-padding: p = floor(k/2) = 3 for k=7
        padding = kernel_size // 2

        # 2 input channels = [avg_pool, max_pool] concatenated
        # 1 output channel = spatial attention map
        self.conv = nn.Conv2d(
            in_channels=2,
            out_channels=1,
            kernel_size=kernel_size,
            padding=padding,
            bias=False,
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Args:
            x: Input feature map (B, C, H, W)
        Returns:
            Attention-weighted feature map (B, C, H, W)
        """
        # Channel-wise average: F_avg = (1/C) Σ_c x_c
        avg_pool = x.mean(dim=1, keepdim=True)  # (B, 1, H, W)

        # Channel-wise max: F_max = max_c x_c
        max_pool = x.amax(dim=1, keepdim=True)  # (B, 1, H, W)

        # Concatenate along channel axis: [F_avg; F_max] ∈ ℝ^{2×H×W}
        concat = torch.cat([avg_pool, max_pool], dim=1)  # (B, 2, H, W)

        # 7×7 convolution + sigmoid
        # M_s = σ(f^{7×7}([F_avg; F_max]))
        attention = torch.sigmoid(self.conv(concat))  # (B, 1, H, W)

        # Scale: F' = M_s ⊗ F (broadcast over C)
        return x * attention


class CBAM(nn.Module):
    """
    Convolutional Block Attention Module.
    
    Applies channel attention then spatial attention sequentially:
        F'  = M_c(F) ⊗ F       [channel: "what" features matter]
        F'' = M_s(F') ⊗ F'     [spatial: "where" in image matters]
    
    The sequential application is important:
        - Channel attention first: re-weights feature channels globally
        - Spatial attention second: focuses on important spatial regions
          within the already-refined feature channels
    
    Parameters:
        in_channels: Number of input channels
        reduction_ratio: Bottleneck ratio for channel attention (default=16)
        spatial_kernel_size: Kernel size for spatial attention conv (default=7)
    """

    def __init__(
        self,
        in_channels: int,
        reduction_ratio: int = 16,
        spatial_kernel_size: int = 7,
    ):
        super().__init__()
        self.channel_attention = ChannelAttention(in_channels, reduction_ratio)
        self.spatial_attention = SpatialAttention(spatial_kernel_size)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Args:
            x: Input feature map (B, C, H, W)
        Returns:
            CBAM-refined feature map (B, C, H, W)
        """
        # Step 1: Channel attention — "what"
        x = self.channel_attention(x)
        # Step 2: Spatial attention — "where"
        x = self.spatial_attention(x)
        return x
