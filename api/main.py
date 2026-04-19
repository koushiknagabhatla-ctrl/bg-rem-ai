"""
FastAPI Backend for Background Removal
=======================================

Production API with ONNX Runtime backend for CPU-optimized inference.

Endpoints:
    GET  /            → Health check + model info
    POST /remove-bg   → Remove background from uploaded image
    GET  /benchmark   → Run inference benchmark

Performance target: < 3 seconds on CPU for 1080p image.
"""

import os
import io
import time
import logging
import threading
from pathlib import Path
from typing import Optional
from contextlib import asynccontextmanager

import numpy as np
import cv2
from PIL import Image, ExifTags
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────
# Configuration
# ─────────────────────────────────────────────────────────────────

# Model paths (priority: INT8 → FP32 → PyTorch)
MODEL_DIR = os.environ.get("MODEL_DIR", os.path.join(os.path.dirname(__file__), "..", "exported_models"))
ONNX_INT8_PATH = os.path.join(MODEL_DIR, "model_int8.onnx")
ONNX_FP32_PATH = os.path.join(MODEL_DIR, "model.onnx")
PYTORCH_PATH = os.path.join(MODEL_DIR, "..", "checkpoints", "best_model.pth")

INPUT_SIZE = 320
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB
ALLOWED_TYPES = {"image/png", "image/jpeg", "image/webp"}
ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}

# ImageNet normalization
IMAGENET_MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
IMAGENET_STD = np.array([0.229, 0.224, 0.225], dtype=np.float32)


# ─────────────────────────────────────────────────────────────────
# Model Manager (thread-safe)
# ─────────────────────────────────────────────────────────────────

class ModelManager:
    """
    Thread-safe model manager for ONNX Runtime.

    Handles:
        - Automatic model format selection (INT8 > FP32 > PyTorch)
        - Thread-safe inference (ONNX Sessions are thread-safe)
        - Model info and benchmarking
    """

    def __init__(self):
        self.session = None
        self.model_type = None
        self.model_path = None
        self.pytorch_model = None
        self._lock = threading.Lock()

    def load(self):
        """Load best available model."""
        # Try INT8 ONNX first (fastest)
        if os.path.exists(ONNX_INT8_PATH):
            self._load_onnx(ONNX_INT8_PATH, "ONNX_INT8")
        elif os.path.exists(ONNX_FP32_PATH):
            self._load_onnx(ONNX_FP32_PATH, "ONNX_FP32")
        elif os.path.exists(PYTORCH_PATH):
            self._load_pytorch(PYTORCH_PATH)
        else:
            logger.warning(
                "No model found! Place exported models in:\n"
                f"  ONNX: {ONNX_INT8_PATH} or {ONNX_FP32_PATH}\n"
                f"  PyTorch: {PYTORCH_PATH}"
            )

    def _load_onnx(self, path: str, model_type: str):
        try:
            import onnxruntime as ort

            sess_options = ort.SessionOptions()
            sess_options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
            sess_options.intra_op_num_threads = max(os.cpu_count() // 2, 1)

            self.session = ort.InferenceSession(
                path, sess_options,
                providers=["CPUExecutionProvider"],
            )
            self.model_type = model_type
            self.model_path = path

            size_mb = os.path.getsize(path) / 1024 / 1024
            logger.info(f"Loaded {model_type} model: {path} ({size_mb:.1f} MB)")

        except Exception as e:
            logger.error(f"Failed to load ONNX model: {e}")

    def _load_pytorch(self, path: str):
        try:
            import sys
            sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
            import torch
            from model.unet import BGRemovalUNet

            model = BGRemovalUNet(input_size=INPUT_SIZE)
            ckpt = torch.load(path, map_location="cpu", weights_only=False)
            if "model_state_dict" in ckpt:
                model.load_state_dict(ckpt["model_state_dict"])
            else:
                model.load_state_dict(ckpt)
            model.eval()

            self.pytorch_model = model
            self.model_type = "PyTorch"
            self.model_path = path
            logger.info(f"Loaded PyTorch model: {path}")

        except Exception as e:
            logger.error(f"Failed to load PyTorch model: {e}")

    def predict(self, image_np: np.ndarray) -> np.ndarray:
        """
        Run inference on preprocessed image.

        Args:
            image_np: Normalized image (1, 3, H, W) float32

        Returns:
            Mask (H, W) float32 in [0, 1]
        """
        if self.session is not None:
            # ONNX inference
            input_name = self.session.get_inputs()[0].name
            output_name = self.session.get_outputs()[0].name
            result = self.session.run([output_name], {input_name: image_np})
            return result[0][0, 0]  # (H, W)

        elif self.pytorch_model is not None:
            import torch
            with torch.no_grad():
                tensor = torch.from_numpy(image_np)
                output = self.pytorch_model(tensor)
                if isinstance(output, list):
                    output = output[0]
                return output.cpu().numpy()[0, 0]

        else:
            raise RuntimeError("No model loaded!")

    @property
    def is_loaded(self) -> bool:
        return self.session is not None or self.pytorch_model is not None

    def get_info(self) -> dict:
        if not self.is_loaded:
            return {"status": "no_model", "message": "No model loaded"}

        info = {
            "model_type": self.model_type,
            "model_path": self.model_path,
            "input_size": INPUT_SIZE,
        }

        if self.model_path and os.path.exists(self.model_path):
            info["model_size_mb"] = round(os.path.getsize(self.model_path) / 1024 / 1024, 1)

        return info


# Global model manager
model_manager = ModelManager()


# ─────────────────────────────────────────────────────────────────
# Image Processing Helpers
# ─────────────────────────────────────────────────────────────────

def fix_exif_rotation(pil_image: Image.Image) -> Image.Image:
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
            if orient == 3:
                pil_image = pil_image.rotate(180, expand=True)
            elif orient == 6:
                pil_image = pil_image.rotate(270, expand=True)
            elif orient == 8:
                pil_image = pil_image.rotate(90, expand=True)
    except Exception:
        pass
    return pil_image


def preprocess(image: np.ndarray) -> np.ndarray:
    """
    Preprocess image for model input.

    Steps:
        1. Resize to INPUT_SIZE × INPUT_SIZE
        2. Normalize with ImageNet stats
        3. Transpose HWC → CHW
        4. Add batch dimension

    Returns:
        (1, 3, INPUT_SIZE, INPUT_SIZE) float32
    """
    resized = cv2.resize(image, (INPUT_SIZE, INPUT_SIZE), interpolation=cv2.INTER_LINEAR)
    normalized = (resized.astype(np.float32) / 255.0 - IMAGENET_MEAN) / IMAGENET_STD
    transposed = normalized.transpose(2, 0, 1)  # HWC → CHW
    batched = transposed[np.newaxis, :]  # Add batch dim
    return batched.astype(np.float32)


def postprocess_mask(mask: np.ndarray, original_size: tuple) -> np.ndarray:
    """
    Post-process model output mask.

    Steps:
        1. Resize to original image dimensions
        2. Threshold at 0.5
        3. Basic morphological cleanup

    Args:
        mask: Model output (INPUT_SIZE, INPUT_SIZE) float32
        original_size: (W, H) of original image

    Returns:
        Binary mask (H, W) uint8 {0, 255}
    """
    # Resize to original dimensions
    mask_resized = cv2.resize(mask, original_size, interpolation=cv2.INTER_LINEAR)

    # Threshold
    binary = (mask_resized > 0.5).astype(np.uint8) * 255

    # Light morphological cleanup
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    binary = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel)
    binary = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel)

    # Remove small components
    n_labels, labels, stats, _ = cv2.connectedComponentsWithStats(binary, connectivity=8)
    min_area = max(500, binary.size * 0.001)  # At least 0.1% of image
    clean = np.zeros_like(binary)
    for i in range(1, n_labels):
        if stats[i, cv2.CC_STAT_AREA] >= min_area:
            clean[labels == i] = 255

    return clean


def create_rgba(image: np.ndarray, mask: np.ndarray) -> np.ndarray:
    """Create RGBA image from RGB + mask."""
    rgba = np.zeros((*image.shape[:2], 4), dtype=np.uint8)
    rgba[:, :, :3] = image
    rgba[:, :, 3] = mask
    return rgba


# ─────────────────────────────────────────────────────────────────
# FastAPI Application
# ─────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load model on startup."""
    model_manager.load()
    yield
    logger.info("Application shutting down")


app = FastAPI(
    title="Background Removal API",
    description="CPU-optimized background removal using custom-trained MobileNetV3 U-Net",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for your frontend domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def health_check():
    """Health check + model info."""
    return {
        "status": "healthy",
        "model": model_manager.get_info(),
        "api_version": "1.0.0",
        "max_file_size_mb": MAX_FILE_SIZE / 1024 / 1024,
        "supported_formats": list(ALLOWED_EXTENSIONS),
        "input_resolution": f"{INPUT_SIZE}×{INPUT_SIZE}",
    }


@app.post("/remove-bg")
async def remove_background(image: UploadFile = File(...)):
    """
    Remove background from uploaded image.

    Input:  multipart/form-data, field "image"
    Output: PNG image with transparent background (RGBA)

    Pipeline:
        1. Validate file (size, type)
        2. Read + EXIF rotation fix
        3. Preprocess (resize, normalize)
        4. Model inference
        5. Post-process mask
        6. Create RGBA with transparent background
        7. Return as PNG
    """
    # ── Validation ──
    if not model_manager.is_loaded:
        raise HTTPException(status_code=503, detail="Model not loaded. Check server logs.")

    # Check file extension
    ext = Path(image.filename or "").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported format: {ext}. Allowed: {sorted(ALLOWED_EXTENSIONS)}"
        )

    # Check content type
    if image.content_type and image.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported content type: {image.content_type}"
        )

    # Read file bytes
    content = await image.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large: {len(content)/1024/1024:.1f}MB (max {MAX_FILE_SIZE/1024/1024}MB)"
        )

    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Empty file uploaded")

    # ── Process ──
    t_start = time.time()

    try:
        # Read image
        pil_image = Image.open(io.BytesIO(content))
        pil_image = fix_exif_rotation(pil_image)
        pil_image = pil_image.convert("RGB")
        image_np = np.array(pil_image)  # (H, W, 3) RGB uint8

        original_size = (image_np.shape[1], image_np.shape[0])  # (W, H)

        # Preprocess
        input_tensor = preprocess(image_np)

        # Inference
        t_infer = time.time()
        mask = model_manager.predict(input_tensor)
        inference_time = time.time() - t_infer

        # Post-process
        mask_clean = postprocess_mask(mask, original_size)

        # Create RGBA
        rgba = create_rgba(image_np, mask_clean)

        # Encode as PNG
        output_image = Image.fromarray(rgba, "RGBA")
        output_buffer = io.BytesIO()
        output_image.save(output_buffer, format="PNG", optimize=True)
        output_buffer.seek(0)

        total_time = time.time() - t_start

        logger.info(
            f"Processed {image.filename}: {original_size[0]}×{original_size[1]} "
            f"in {total_time:.2f}s (inference: {inference_time:.2f}s)"
        )

        return StreamingResponse(
            output_buffer,
            media_type="image/png",
            headers={
                "X-Inference-Time": f"{inference_time:.3f}",
                "X-Total-Time": f"{total_time:.3f}",
                "X-Input-Size": f"{original_size[0]}x{original_size[1]}",
                "Content-Disposition": f'inline; filename="{Path(image.filename or "output").stem}_nobg.png"',
            },
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Processing error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")


@app.get("/benchmark")
async def benchmark():
    """Run benchmark with synthetic input."""
    if not model_manager.is_loaded:
        raise HTTPException(status_code=503, detail="Model not loaded")

    # Create dummy input
    dummy = np.random.rand(1, 3, INPUT_SIZE, INPUT_SIZE).astype(np.float32)

    # Warmup
    for _ in range(3):
        model_manager.predict(dummy)

    # Benchmark
    times = []
    n_runs = 10
    for _ in range(n_runs):
        t0 = time.time()
        model_manager.predict(dummy)
        times.append((time.time() - t0) * 1000)

    return {
        "model": model_manager.model_type,
        "input_size": f"{INPUT_SIZE}×{INPUT_SIZE}",
        "n_runs": n_runs,
        "mean_ms": round(np.mean(times), 1),
        "std_ms": round(np.std(times), 1),
        "min_ms": round(min(times), 1),
        "max_ms": round(max(times), 1),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "api.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        workers=1,
    )
