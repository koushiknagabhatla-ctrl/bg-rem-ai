"""
ONNX Export + INT8 Quantization
================================

Export trained PyTorch model to ONNX format for CPU-optimized inference.
Then apply INT8 dynamic quantization for 2-4x speedup.

ONNX Export Math:
────────────────
All operations (conv, BN, activations) are traced into a static graph.
Dynamic axes allow variable batch size at inference time.

INT8 Quantization Math:
──────────────────────
Maps FP32 weights to INT8 (8-bit integers):

    Q(x) = round(x / scale) + zero_point

    scale = (x_max - x_min) / (qmax - qmin)
           = (x_max - x_min) / 255   (for uint8)

    zero_point = round(-x_min / scale)

    Dequantize: x' = scale · (q - zero_point)

Dynamic quantization: weights quantized at export time,
activations quantized at runtime per-batch.

Expected results:
    Model          | Size    | CPU Inference (320×320) | IoU Change
    FP32 ONNX      | ~22MB   | ~800ms                  | baseline
    INT8 ONNX      | ~6MB    | ~200ms                  | -1% IoU
    TorchScript    | ~22MB   | ~600ms                  | baseline
"""

import os
import sys
import argparse
import logging
import time

import numpy as np
import torch

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from model.unet import BGRemovalUNet

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


def export_to_onnx(
    model: torch.nn.Module,
    output_path: str,
    input_size: int = 320,
    opset_version: int = 13,
) -> str:
    """
    Export PyTorch model to ONNX format.

    Uses torch.onnx.export with:
        - Dynamic batch axis (supports any batch size)
        - Opset 13 (good balance of compatibility + features)
        - Input/output names for API integration

    Args:
        model: Trained model (will be set to eval mode)
        output_path: Path to save .onnx file
        input_size: Model input spatial resolution
        opset_version: ONNX opset version

    Returns:
        Path to saved ONNX model
    """
    model.eval()
    model = model.cpu()

    # Create dummy input
    dummy_input = torch.randn(1, 3, input_size, input_size)

    # Export
    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)

    logger.info(f"Exporting to ONNX (opset {opset_version})...")
    torch.onnx.export(
        model,
        dummy_input,
        output_path,
        opset_version=opset_version,
        input_names=["image"],
        output_names=["mask"],
        dynamic_axes={
            "image": {0: "batch_size"},
            "mask": {0: "batch_size"},
        },
        do_constant_folding=True,  # Fold constants for optimization
    )

    # Verify
    file_size = os.path.getsize(output_path) / 1024 / 1024
    logger.info(f"ONNX model saved: {output_path} ({file_size:.1f} MB)")

    # Validate with ONNX checker
    try:
        import onnx
        onnx_model = onnx.load(output_path)
        onnx.checker.check_model(onnx_model)
        logger.info("ONNX model validation: ✓ PASSED")
    except ImportError:
        logger.warning("onnx package not installed, skipping validation")
    except Exception as e:
        logger.error(f"ONNX validation failed: {e}")

    return output_path


def quantize_onnx(
    input_path: str,
    output_path: str,
) -> str:
    """
    Apply INT8 dynamic quantization to ONNX model.

    Dynamic quantization:
        - Weights: quantized statically (at export time)
        - Activations: quantized dynamically (at runtime, per-batch)

    Quantization formula:
        Q(x) = round(x / scale) + zero_point
        scale = (x_max - x_min) / 255
        zero_point = round(-x_min / scale)

    Result: ~4x smaller model, ~2-4x faster on CPU, ~1% IoU loss.
    """
    try:
        from onnxruntime.quantization import quantize_dynamic, QuantType
    except ImportError:
        logger.error("Install onnxruntime: pip install onnxruntime")
        return input_path

    logger.info("Applying INT8 dynamic quantization...")

    quantize_dynamic(
        model_input=input_path,
        model_output=output_path,
        weight_type=QuantType.QUInt8,
    )

    file_size = os.path.getsize(output_path) / 1024 / 1024
    orig_size = os.path.getsize(input_path) / 1024 / 1024
    compression = orig_size / max(file_size, 0.001)

    logger.info(f"Quantized model saved: {output_path} ({file_size:.1f} MB)")
    logger.info(f"Compression: {orig_size:.1f} MB → {file_size:.1f} MB ({compression:.1f}x)")

    return output_path


def export_torchscript(
    model: torch.nn.Module,
    output_path: str,
    input_size: int = 320,
) -> str:
    """
    Export model as TorchScript for deployment without Python.

    TorchScript uses torch.jit.trace to convert the model
    to a serialized intermediate representation.
    """
    model.eval()
    model = model.cpu()

    dummy_input = torch.randn(1, 3, input_size, input_size)

    logger.info("Exporting to TorchScript...")
    traced = torch.jit.trace(model, dummy_input)
    traced.save(output_path)

    file_size = os.path.getsize(output_path) / 1024 / 1024
    logger.info(f"TorchScript model saved: {output_path} ({file_size:.1f} MB)")

    return output_path


def benchmark_models(
    pytorch_model: torch.nn.Module,
    onnx_path: str,
    int8_path: str,
    torchscript_path: str,
    input_size: int = 320,
    n_runs: int = 10,
    warmup: int = 3,
) -> dict:
    """
    Benchmark all model formats on CPU.

    Runs each model n_runs times and reports mean/std inference time.
    """
    dummy = torch.randn(1, 3, input_size, input_size)
    dummy_np = dummy.numpy()

    results = {}

    # ── PyTorch ──
    pytorch_model.eval()
    pytorch_model.cpu()
    times = []
    for i in range(warmup + n_runs):
        t0 = time.time()
        with torch.no_grad():
            _ = pytorch_model(dummy)
        t = time.time() - t0
        if i >= warmup:
            times.append(t * 1000)
    results["PyTorch"] = {"mean_ms": np.mean(times), "std_ms": np.std(times)}

    # ── TorchScript ──
    if os.path.exists(torchscript_path):
        ts_model = torch.jit.load(torchscript_path)
        ts_model.eval()
        times = []
        for i in range(warmup + n_runs):
            t0 = time.time()
            with torch.no_grad():
                _ = ts_model(dummy)
            t = time.time() - t0
            if i >= warmup:
                times.append(t * 1000)
        results["TorchScript"] = {"mean_ms": np.mean(times), "std_ms": np.std(times)}

    # ── ONNX FP32 ──
    try:
        import onnxruntime as ort

        for label, path in [("ONNX_FP32", onnx_path), ("ONNX_INT8", int8_path)]:
            if not os.path.exists(path):
                continue

            sess = ort.InferenceSession(path, providers=["CPUExecutionProvider"])
            input_name = sess.get_inputs()[0].name
            times = []
            for i in range(warmup + n_runs):
                t0 = time.time()
                _ = sess.run(None, {input_name: dummy_np})
                t = time.time() - t0
                if i >= warmup:
                    times.append(t * 1000)
            results[label] = {"mean_ms": np.mean(times), "std_ms": np.std(times)}

    except ImportError:
        logger.warning("onnxruntime not available, skipping ONNX benchmarks")

    # ── Print Results ──
    print("\n" + "=" * 70)
    print("BENCHMARK RESULTS (CPU inference, 320×320 input)")
    print("=" * 70)
    print(f"  {'Model':<15s} {'Size':>8s} {'Mean (ms)':>12s} {'Std (ms)':>10s}")
    print(f"  {'-'*15} {'-'*8} {'-'*12} {'-'*10}")

    sizes = {}
    if os.path.exists(onnx_path):
        sizes["ONNX_FP32"] = os.path.getsize(onnx_path) / 1024 / 1024
    if os.path.exists(int8_path):
        sizes["ONNX_INT8"] = os.path.getsize(int8_path) / 1024 / 1024
    if os.path.exists(torchscript_path):
        sizes["TorchScript"] = os.path.getsize(torchscript_path) / 1024 / 1024

    total_params = sum(p.numel() for p in pytorch_model.parameters())
    sizes["PyTorch"] = total_params * 4 / 1024 / 1024

    for name, timing in results.items():
        size = f"{sizes.get(name, 0):.1f}MB"
        print(f"  {name:<15s} {size:>8s} {timing['mean_ms']:>12.1f} {timing['std_ms']:>10.1f}")

    return results


def main():
    parser = argparse.ArgumentParser(description="Export model to ONNX + quantize")
    parser.add_argument("--checkpoint", default="checkpoints/best_model.pth",
                        help="PyTorch checkpoint path")
    parser.add_argument("--output-dir", default="exported_models",
                        help="Output directory for exported models")
    parser.add_argument("--input-size", type=int, default=320)
    parser.add_argument("--benchmark", action="store_true",
                        help="Run CPU benchmark after export")
    parser.add_argument("--no-quantize", action="store_true",
                        help="Skip INT8 quantization")

    args = parser.parse_args()
    os.makedirs(args.output_dir, exist_ok=True)

    # Load PyTorch model
    model = BGRemovalUNet(input_size=args.input_size)
    checkpoint = torch.load(args.checkpoint, map_location="cpu", weights_only=False)
    if "model_state_dict" in checkpoint:
        model.load_state_dict(checkpoint["model_state_dict"])
    else:
        model.load_state_dict(checkpoint)
    model.eval()

    params = sum(p.numel() for p in model.parameters())
    logger.info(f"Model loaded: {params:,} parameters")

    # Export paths
    onnx_path = os.path.join(args.output_dir, "model.onnx")
    int8_path = os.path.join(args.output_dir, "model_int8.onnx")
    ts_path = os.path.join(args.output_dir, "model.pt")

    # 1. ONNX Export
    export_to_onnx(model, onnx_path, args.input_size)

    # 2. INT8 Quantization
    if not args.no_quantize:
        quantize_onnx(onnx_path, int8_path)

    # 3. TorchScript Export
    export_torchscript(model, ts_path, args.input_size)

    # 4. Benchmark
    if args.benchmark:
        benchmark_models(model, onnx_path, int8_path, ts_path, args.input_size)

    print(f"\n✓ Export complete!")
    print(f"  ONNX FP32:    {onnx_path}")
    if not args.no_quantize:
        print(f"  ONNX INT8:    {int8_path}")
    print(f"  TorchScript:  {ts_path}")


if __name__ == "__main__":
    main()
