"""
ONNX Inference Engine
=====================

Self-contained inference module for the Render backend.
Loads INT8 ONNX model once at startup, processes requests.

Pipeline per request:
    1. Read image bytes → PIL → numpy RGB
    2. Fix EXIF rotation
    3. Resize to 320×320
    4. Normalize with ImageNet stats
    5. Run ONNX inference (INT8 for speed)
    6. Resize mask back to original dimensions
    7. Post-process (morphology + cleanup)
    8. Create RGBA with transparent background
    9. Encode as PNG bytes
"""

import os
import io
import time
import logging
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ExifTags

logger = logging.getLogger(__name__)

# ImageNet normalization constants
IMAGENET_MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
IMAGENET_STD = np.array([0.229, 0.224, 0.225], dtype=np.float32)

INPUT_SIZE = 320


class InferenceEngine:
    """
    ONNX Runtime inference engine.

    Loads model once on startup → stays hot in memory.
    Thread-safe: ONNX Runtime sessions support concurrent inference.

    Performance targets:
        INT8 ONNX: ~200ms per 320×320 image on CPU
        Full pipeline: < 3s for 1080p including post-processing
    """

    def __init__(self):
        self.session = None
        self.model_path = None
        self.model_type = None
        self.input_name = None
        self.output_name = None

    def load_model(self, model_path: str) -> None:
        """Load ONNX model into memory."""
        try:
            import onnxruntime as ort

            if not os.path.exists(model_path):
                logger.error(f"Model file not found: {model_path}")
                return

            sess_options = ort.SessionOptions()
            sess_options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
            # Use half of CPU cores to leave room for FastAPI async
            sess_options.intra_op_num_threads = max(os.cpu_count() // 2, 1)
            sess_options.inter_op_num_threads = 1

            self.session = ort.InferenceSession(
                model_path, sess_options,
                providers=["CPUExecutionProvider"],
            )

            self.input_name = self.session.get_inputs()[0].name
            self.output_name = self.session.get_outputs()[0].name
            self.model_path = model_path

            # Determine model type from filename
            if "int8" in Path(model_path).stem.lower():
                self.model_type = "ONNX_INT8"
            else:
                self.model_type = "ONNX_FP32"

            size_mb = os.path.getsize(model_path) / 1024 / 1024
            logger.info(f"Model loaded: {self.model_type} ({size_mb:.1f} MB)")

            # Warmup run
            dummy = np.random.rand(1, 3, INPUT_SIZE, INPUT_SIZE).astype(np.float32)
            self.session.run([self.output_name], {self.input_name: dummy})
            logger.info("Model warmup complete")

        except ImportError:
            logger.error("onnxruntime not installed: pip install onnxruntime")
        except Exception as e:
            logger.error(f"Model load failed: {e}")

    @property
    def is_loaded(self) -> bool:
        return self.session is not None

    def get_info(self) -> dict:
        if not self.is_loaded:
            return {"status": "not_loaded"}
        return {
            "status": "loaded",
            "model_type": self.model_type,
            "model_path": self.model_path,
            "input_size": INPUT_SIZE,
            "model_size_mb": round(
                os.path.getsize(self.model_path) / 1024 / 1024, 1
            ) if self.model_path and os.path.exists(self.model_path) else None,
        }

    def process_image(self, image_bytes: bytes) -> tuple:
        """
        Full inference pipeline.

        Args:
            image_bytes: Raw image file bytes (JPEG/PNG/WebP)

        Returns:
            (png_bytes, metadata_dict)
            png_bytes: RGBA PNG with transparent background
            metadata: timing info, original dimensions, etc.
        """
        if not self.is_loaded:
            raise RuntimeError("Model not loaded")

        timings = {}
        t_total = time.time()

        # ── Step 1: Read image ──
        t0 = time.time()
        pil_image = Image.open(io.BytesIO(image_bytes))
        pil_image = self._fix_exif_rotation(pil_image)
        pil_image = pil_image.convert("RGB")
        image_np = np.array(pil_image)  # (H, W, 3) uint8
        original_h, original_w = image_np.shape[:2]
        timings["decode_ms"] = (time.time() - t0) * 1000

        # ── Step 2: Preprocess ──
        t0 = time.time()
        resized = cv2.resize(image_np, (INPUT_SIZE, INPUT_SIZE), interpolation=cv2.INTER_LINEAR)
        normalized = (resized.astype(np.float32) / 255.0 - IMAGENET_MEAN) / IMAGENET_STD
        input_tensor = normalized.transpose(2, 0, 1)[np.newaxis, :].astype(np.float32)
        timings["preprocess_ms"] = (time.time() - t0) * 1000

        # ── Step 3: ONNX Inference ──
        t0 = time.time()
        result = self.session.run([self.output_name], {self.input_name: input_tensor})
        mask = result[0][0, 0]  # (INPUT_SIZE, INPUT_SIZE)
        timings["inference_ms"] = (time.time() - t0) * 1000

        # ── Step 4: Post-process ──
        t0 = time.time()
        # Resize mask to original dimensions
        mask_full = cv2.resize(mask, (original_w, original_h), interpolation=cv2.INTER_LINEAR)

        # Threshold
        binary = (mask_full > 0.5).astype(np.uint8) * 255

        # Morphological cleanup
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        binary = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel)

        kernel_small = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
        binary = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel_small)

        # Remove small components
        n_labels, labels, stats, _ = cv2.connectedComponentsWithStats(binary, connectivity=8)
        min_area = max(500, binary.size * 0.001)
        clean_mask = np.zeros_like(binary)
        for i in range(1, n_labels):
            if stats[i, cv2.CC_STAT_AREA] >= min_area:
                clean_mask[labels == i] = 255

        timings["postprocess_ms"] = (time.time() - t0) * 1000

        # ── Step 5: Create RGBA ──
        t0 = time.time()
        rgba = np.zeros((original_h, original_w, 4), dtype=np.uint8)
        rgba[:, :, :3] = image_np
        rgba[:, :, 3] = clean_mask

        # Encode as PNG
        output_image = Image.fromarray(rgba, "RGBA")
        output_buffer = io.BytesIO()
        output_image.save(output_buffer, format="PNG", optimize=True)
        png_bytes = output_buffer.getvalue()
        timings["encode_ms"] = (time.time() - t0) * 1000

        timings["total_ms"] = (time.time() - t_total) * 1000

        metadata = {
            "original_size": f"{original_w}x{original_h}",
            "input_size_kb": round(len(image_bytes) / 1024, 1),
            "output_size_kb": round(len(png_bytes) / 1024, 1),
            "timings": timings,
        }

        return png_bytes, metadata

    def benchmark(self, n_runs: int = 10, warmup: int = 3) -> dict:
        """Run inference benchmark with synthetic input."""
        if not self.is_loaded:
            return {"error": "Model not loaded"}

        dummy = np.random.rand(1, 3, INPUT_SIZE, INPUT_SIZE).astype(np.float32)

        # Warmup
        for _ in range(warmup):
            self.session.run([self.output_name], {self.input_name: dummy})

        # Benchmark
        times = []
        for _ in range(n_runs):
            t0 = time.time()
            self.session.run([self.output_name], {self.input_name: dummy})
            times.append((time.time() - t0) * 1000)

        return {
            "model_type": self.model_type,
            "input_size": f"{INPUT_SIZE}x{INPUT_SIZE}",
            "n_runs": n_runs,
            "mean_ms": round(np.mean(times), 1),
            "std_ms": round(np.std(times), 1),
            "min_ms": round(min(times), 1),
            "max_ms": round(max(times), 1),
            "p95_ms": round(np.percentile(times, 95), 1),
        }

    @staticmethod
    def _fix_exif_rotation(pil_image: Image.Image) -> Image.Image:
        """Handle EXIF orientation for phone photos."""
        try:
            exif = pil_image._getexif()
            if exif is None:
                return pil_image

            orientation_key = None
            for key, val in ExifTags.TAGS.items():
                if val == "Orientation":
                    orientation_key = key
                    break

            if orientation_key and orientation_key in exif:
                orient = exif[orientation_key]
                rotations = {3: 180, 6: 270, 8: 90}
                if orient in rotations:
                    pil_image = pil_image.rotate(rotations[orient], expand=True)
        except Exception:
            pass
        return pil_image
