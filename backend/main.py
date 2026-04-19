"""
Background Removal SaaS — FastAPI Backend
==========================================

Single-file production backend with all classes inline.
Deployed on Render.com Starter ($7/month, always-on).

Classes:
    InferenceEngine   — ONNX Runtime, preprocess, postprocess, thread-safe
    RateLimiter       — Upstash Redis REST API, sliding window 10/min
    GatekeeperMiddleware — 7-layer security on POST /remove-bg

Endpoints:
    GET  /             — Health + model info
    GET  /health       — Liveness probe
    POST /remove-bg    — Background removal (fully protected)
    GET  /me/credits   — User credit info

Environment Variables:
    SUPABASE_URL, SUPABASE_SERVICE_KEY
    UPSTASH_REDIS_URL, UPSTASH_REDIS_TOKEN
    ADMIN_API_KEY, ADMIN_EMAIL, WEBHOOK_SECRET
    ALLOWED_ORIGINS, MODEL_PATH
"""

import asyncio
import hashlib
import hmac
import io
import logging
import os
import time
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Optional

import cv2
import numpy as np
from fastapi import FastAPI, File, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from PIL import Image, ExifTags
from starlette.middleware.base import BaseHTTPMiddleware

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("bg-removal")

# ─────────────────────────────────────────────────────────────
# Configuration
# ─────────────────────────────────────────────────────────────

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")
UPSTASH_REDIS_URL = os.environ.get("UPSTASH_REDIS_URL", "")
UPSTASH_REDIS_TOKEN = os.environ.get("UPSTASH_REDIS_TOKEN", "")
ADMIN_API_KEY = os.environ.get("ADMIN_API_KEY", "")
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "koushiknagabhatla@gmail.com")
WEBHOOK_SECRET = os.environ.get("WEBHOOK_SECRET", "")
MODEL_PATH = os.environ.get("MODEL_PATH", "./model/model_int8.onnx")
ALLOWED_ORIGINS = [
    o.strip() for o in os.environ.get("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
]
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB
CREDITS_PER_IMAGE = 5
IMAGENET_MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
IMAGENET_STD = np.array([0.229, 0.224, 0.225], dtype=np.float32)
INPUT_SIZE = 320
START_TIME = time.time()


# ═══════════════════════════════════════════════════════════════
# CLASS: InferenceEngine
# ═══════════════════════════════════════════════════════════════

class InferenceEngine:
    """
    ONNX Runtime inference engine.
    Loads model once on startup, stays hot in memory.
    Thread-safe via asyncio.Lock (prevents concurrent session.run calls).
    """

    def __init__(self):
        self.session = None
        self.input_name: Optional[str] = None
        self.output_name: Optional[str] = None
        self.model_path: Optional[str] = None
        self.model_size_mb: float = 0.0
        self._lock = asyncio.Lock()

    def load(self, model_path: str) -> None:
        """Load ONNX model into memory. Called once at startup."""
        if not os.path.exists(model_path):
            logger.error(
                f"Model file not found: {model_path}. "
                "The model has not been trained yet. "
                "Train with notebooks/train_kaggle.ipynb, then place "
                "model_int8.onnx at the MODEL_PATH location."
            )
            return

        try:
            import onnxruntime as ort

            opts = ort.SessionOptions()
            opts.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
            opts.intra_op_num_threads = max(os.cpu_count() // 2, 1)
            opts.inter_op_num_threads = 1

            self.session = ort.InferenceSession(
                model_path, opts, providers=["CPUExecutionProvider"]
            )
            self.input_name = self.session.get_inputs()[0].name
            self.output_name = self.session.get_outputs()[0].name
            self.model_path = model_path
            self.model_size_mb = round(os.path.getsize(model_path) / 1024 / 1024, 1)

            # Warmup inference
            dummy = np.random.rand(1, 3, INPUT_SIZE, INPUT_SIZE).astype(np.float32)
            self.session.run([self.output_name], {self.input_name: dummy})
            logger.info(f"Model loaded: {self.model_size_mb} MB, warmup complete")

        except ImportError:
            logger.error("onnxruntime not installed: pip install onnxruntime")
        except Exception as e:
            logger.error(f"Model load failed: {e}")

    @property
    def is_ready(self) -> bool:
        return self.session is not None

    def get_info(self) -> dict:
        if not self.is_ready:
            return {"status": "not_loaded", "message": "Model not trained yet"}
        return {
            "status": "loaded",
            "path": self.model_path,
            "size_mb": self.model_size_mb,
            "input_size": INPUT_SIZE,
        }

    def _fix_exif(self, img: Image.Image) -> Image.Image:
        """Handle EXIF orientation from phone cameras."""
        try:
            exif = img._getexif()
            if exif is None:
                return img
            orient_key = None
            for k, v in ExifTags.TAGS.items():
                if v == "Orientation":
                    orient_key = k
                    break
            if orient_key and orient_key in exif:
                o = exif[orient_key]
                if o == 3:
                    img = img.rotate(180, expand=True)
                elif o == 6:
                    img = img.rotate(270, expand=True)
                elif o == 8:
                    img = img.rotate(90, expand=True)
        except Exception:
            pass
        return img

    def preprocess(self, image_bytes: bytes) -> tuple:
        """
        Raw bytes → normalized tensor + original PIL image.

        Steps:
            1. bytes → PIL Image → fix EXIF → convert RGBA if needed
            2. Store original size
            3. Resize to 320×320
            4. Convert to RGB float32
            5. Normalize with ImageNet stats
            6. Transpose HWC → CHW, add batch dim
        """
        pil_img = Image.open(io.BytesIO(image_bytes))
        pil_img = self._fix_exif(pil_img)

        # Ensure RGBA for final compositing
        if pil_img.mode != "RGBA":
            pil_img = pil_img.convert("RGBA")

        original_rgba = pil_img.copy()
        original_w, original_h = pil_img.size

        # Convert to RGB for model input
        rgb = pil_img.convert("RGB")
        resized = rgb.resize((INPUT_SIZE, INPUT_SIZE), Image.BILINEAR)

        arr = np.array(resized, dtype=np.float32) / 255.0
        arr = (arr - IMAGENET_MEAN) / IMAGENET_STD
        tensor = arr.transpose(2, 0, 1)[np.newaxis, :].astype(np.float32)

        return tensor, original_rgba, (original_w, original_h)

    def postprocess(
        self, raw_output: np.ndarray, original_rgba: Image.Image, original_size: tuple
    ) -> Image.Image:
        """
        Model output → transparent PNG.

        Steps:
            1. Raw (1,1,320,320) → squeeze → (320,320) float
            2. Resize to original dimensions (bilinear)
            3. Threshold at 0.5 → binary uint8
            4. Morphological close (5×5, 2 iterations)
            5. Remove connected components < 500px²
            6. Gaussian smooth boundary (σ=1, 3px edge band)
            7. Apply mask as alpha channel to original RGBA
        """
        mask = raw_output[0, 0]  # (320, 320)
        ow, oh = original_size

        # Resize mask to original size
        mask_full = cv2.resize(mask, (ow, oh), interpolation=cv2.INTER_LINEAR)

        # Threshold
        binary = (mask_full > 0.5).astype(np.uint8) * 255

        # Morphological close (fill small holes)
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        binary = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel, iterations=2)

        # Remove small connected components
        n_labels, labels, stats, _ = cv2.connectedComponentsWithStats(
            binary, connectivity=8
        )
        clean = np.zeros_like(binary)
        for i in range(1, n_labels):
            if stats[i, cv2.CC_STAT_AREA] >= 500:
                clean[labels == i] = 255

        # Smooth boundary: Gaussian blur only at edge region (3px band)
        edges = cv2.Canny(clean, 50, 150)
        edge_band = cv2.dilate(edges, np.ones((3, 3), np.uint8), iterations=1)
        smoothed = cv2.GaussianBlur(clean.astype(np.float32), (0, 0), sigmaX=1.0)
        final_mask = np.where(edge_band > 0, smoothed, clean.astype(np.float32))
        final_mask = np.clip(final_mask, 0, 255).astype(np.uint8)

        # Apply mask to original RGBA
        rgba_arr = np.array(original_rgba)
        rgba_arr[:, :, 3] = final_mask

        return Image.fromarray(rgba_arr, "RGBA")

    async def process(self, image_bytes: bytes) -> tuple:
        """
        Full pipeline: bytes → transparent PNG bytes + timing.
        Thread-safe via asyncio.Lock.
        """
        if not self.is_ready:
            raise RuntimeError(
                "Model not loaded. Train with notebooks/train_kaggle.ipynb first."
            )

        t_start = time.time()

        tensor, original_rgba, original_size = self.preprocess(image_bytes)

        async with self._lock:
            t_inf = time.time()
            raw = self.session.run([self.output_name], {self.input_name: tensor})[0]
            inference_ms = int((time.time() - t_inf) * 1000)

        result_img = self.postprocess(raw, original_rgba, original_size)

        buf = io.BytesIO()
        result_img.save(buf, format="PNG", optimize=True)
        png_bytes = buf.getvalue()

        total_ms = int((time.time() - t_start) * 1000)

        return png_bytes, {"inference_ms": inference_ms, "total_ms": total_ms}


# ═══════════════════════════════════════════════════════════════
# CLASS: RateLimiter
# ═══════════════════════════════════════════════════════════════

class RateLimiter:
    """
    Sliding window rate limiter using Upstash Redis REST API.

    Algorithm:
        key = "rl:{user_id}:{unix_minute}"
        INCR key → count
        EXPIRE key 60 → auto-cleanup
        If count > 10 → reject

    Uses HTTP POST to Upstash REST endpoint (not redis-py).
    10 requests per 60 seconds per user.
    """

    def __init__(self, url: str, token: str, max_per_minute: int = 10):
        self.url = url.rstrip("/")
        self.token = token
        self.max_per_minute = max_per_minute
        self.enabled = bool(url and token)
        if not self.enabled:
            logger.warning("Upstash Redis not configured — rate limiting disabled")

    async def check_and_increment(self, user_id: str) -> tuple:
        """
        Check rate limit for user.
        Returns: (allowed: bool, remaining: int, retry_after: int)
        """
        if not self.enabled:
            return True, self.max_per_minute, 0

        minute_bucket = int(time.time() // 60)
        key = f"rl:{user_id}:{minute_bucket}"

        try:
            import httpx

            headers = {
                "Authorization": f"Bearer {self.token}",
                "Content-Type": "application/json",
            }

            async with httpx.AsyncClient(timeout=5.0) as client:
                # INCR
                resp = await client.post(
                    self.url, headers=headers, json=["INCR", key]
                )
                resp.raise_for_status()
                count = int(resp.json().get("result", 0))

                # EXPIRE (only on first request this minute)
                if count == 1:
                    await client.post(
                        self.url, headers=headers, json=["EXPIRE", key, "60"]
                    )

            remaining = max(0, self.max_per_minute - count)
            retry_after = 60 - int(time.time() % 60)
            allowed = count <= self.max_per_minute

            return allowed, remaining, retry_after

        except Exception as e:
            logger.error(f"Redis rate limit error: {e}")
            # Fail-open: allow request if Redis is down
            return True, self.max_per_minute, 0


# ═══════════════════════════════════════════════════════════════
# SUPABASE HELPERS
# ═══════════════════════════════════════════════════════════════

_supabase_client = None


def get_supabase():
    """Lazy-init Supabase client with service_role key (bypasses RLS)."""
    global _supabase_client
    if _supabase_client is None and SUPABASE_URL and SUPABASE_SERVICE_KEY:
        try:
            from supabase import create_client

            _supabase_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
            logger.info("Supabase client connected")
        except ImportError:
            logger.error("supabase-py not installed: pip install supabase")
        except Exception as e:
            logger.error(f"Supabase init error: {e}")
    return _supabase_client


async def verify_jwt(token: str) -> Optional[dict]:
    """Verify Supabase JWT and return user info."""
    sb = get_supabase()
    if not sb:
        return None
    try:
        user_resp = sb.auth.get_user(token)
        if user_resp and user_resp.user:
            return {
                "id": str(user_resp.user.id),
                "email": user_resp.user.email or "",
            }
    except Exception as e:
        logger.warning(f"JWT verification failed: {e}")
    return None


async def get_user_credits_info(user_id: str) -> Optional[dict]:
    """Get credits info from Supabase."""
    sb = get_supabase()
    if not sb:
        return None
    try:
        cred_resp = (
            sb.table("user_credits")
            .select("credits_left, total_used")
            .eq("user_id", user_id)
            .single()
            .execute()
        )
        user_resp = (
            sb.table("users")
            .select("plan, is_admin")
            .eq("id", user_id)
            .single()
            .execute()
        )
        if cred_resp.data and user_resp.data:
            return {
                "credits_left": cred_resp.data["credits_left"],
                "total_used": cred_resp.data["total_used"],
                "plan": user_resp.data["plan"],
                "is_admin": user_resp.data["is_admin"],
            }
    except Exception as e:
        logger.error(f"Credits lookup error: {e}")
    return None


async def deduct_credits(user_id: str, amount: int = CREDITS_PER_IMAGE) -> dict:
    """Call atomic deduct_credits RPC. Returns {success, credits_remaining, message}."""
    sb = get_supabase()
    if not sb:
        return {"success": True, "credits_remaining": -1, "message": "Supabase not configured (dev mode)"}
    try:
        resp = sb.rpc("deduct_credits", {"p_user_id": user_id, "p_amount": amount}).execute()
        if resp.data and len(resp.data) > 0:
            row = resp.data[0]
            return {
                "success": row["success"],
                "credits_remaining": row["credits_remaining"],
                "message": row["message"],
            }
        return {"success": False, "credits_remaining": 0, "message": "No response from deduct_credits"}
    except Exception as e:
        logger.error(f"Credit deduction error: {e}")
        return {"success": False, "credits_remaining": 0, "message": str(e)}


async def refund_credits(user_id: str, amount: int = CREDITS_PER_IMAGE) -> None:
    """Refund credits on inference failure."""
    sb = get_supabase()
    if not sb:
        return
    try:
        sb.rpc("refund_credits", {"p_user_id": user_id, "p_amount": amount}).execute()
    except Exception as e:
        logger.error(f"Credit refund failed: {e}")


async def log_usage(
    user_id: str,
    image_size_kb: float,
    inference_ms: int,
    credits_before: int,
    credits_after: int,
    success: bool,
    error_message: str = "",
) -> None:
    """Insert row into usage_log."""
    sb = get_supabase()
    if not sb:
        return
    try:
        sb.table("usage_log").insert({
            "user_id": user_id,
            "image_size_kb": round(image_size_kb, 1),
            "inference_ms": inference_ms,
            "credits_before": credits_before,
            "credits_after": credits_after,
            "success": success,
            "error_message": error_message,
        }).execute()
    except Exception as e:
        # Audit logging must never block the response
        logger.error(f"Usage log insert failed: {e}")


# ═══════════════════════════════════════════════════════════════
# MAGIC BYTES VALIDATION
# ═══════════════════════════════════════════════════════════════

def validate_magic_bytes(data: bytes) -> Optional[str]:
    """
    Validate image format by reading magic bytes, not Content-Type header.
    Content-Type can be spoofed. Magic bytes cannot.

    Returns detected format string or None if invalid.
    """
    if len(data) < 12:
        return None

    # PNG: first 4 bytes = \x89PNG
    if data[:4] == b"\x89PNG":
        return "image/png"

    # JPEG: first 3 bytes = \xFF\xD8\xFF
    if data[:3] == b"\xff\xd8\xff":
        return "image/jpeg"

    # WebP: bytes 8-12 = WEBP
    if data[8:12] == b"WEBP":
        return "image/webp"

    return None


# ═══════════════════════════════════════════════════════════════
# CLASS: GatekeeperMiddleware
# ═══════════════════════════════════════════════════════════════

class GatekeeperMiddleware(BaseHTTPMiddleware):
    """
    7-layer security middleware on POST /remove-bg.

    Layer 1: Request size (max 20MB)
    Layer 2: HMAC-SHA256 signature verification
    Layer 3: Authentication (Admin API key or Supabase JWT)
    Layer 4: Rate limiting (non-admin only)
    Layer 5: Credit check + atomic deduction (non-admin only)
    Layer 6: File validation (magic bytes)
    Layer 7: Audit logging (after response)
    """

    async def dispatch(self, request: Request, call_next):
        # Only gate the inference endpoint
        if request.method != "POST" or request.url.path != "/remove-bg":
            return await call_next(request)

        # Pre-read body for signature verification
        body = await request.body()

        # ── Layer 1: Request Size ──
        if len(body) > MAX_FILE_SIZE:
            return JSONResponse(
                status_code=413,
                content={
                    "error": f"File too large: {len(body)/1024/1024:.1f}MB (max 20MB)"
                },
            )

        # ── Layer 2: HMAC Signature ──
        auth_header = request.headers.get("Authorization", "")
        is_admin_key = auth_header == f"Bearer {ADMIN_API_KEY}" and ADMIN_API_KEY

        # Skip HMAC check for admin API key (direct backend access)
        if not is_admin_key and WEBHOOK_SECRET:
            ts = request.headers.get("X-Timestamp", "")
            sig = request.headers.get("X-Signature", "")

            if not ts or not sig:
                return JSONResponse(
                    status_code=401,
                    content={"error": "Missing signature headers"},
                )

            try:
                age = abs(time.time() * 1000 - int(ts)) / 1000
            except (ValueError, TypeError):
                return JSONResponse(
                    status_code=401, content={"error": "Invalid timestamp"}
                )

            if age > 30:
                return JSONResponse(
                    status_code=401,
                    content={"error": f"Request expired ({age:.0f}s old, max 30s)"},
                )

            body_hash = hashlib.sha256(body).hexdigest()
            expected_sig = hmac.new(
                WEBHOOK_SECRET.encode(), f"{ts}:{body_hash}".encode(), hashlib.sha256
            ).hexdigest()

            if not hmac.compare_digest(expected_sig, sig):
                return JSONResponse(
                    status_code=401, content={"error": "Invalid signature"}
                )

        # ── Layer 3: Authentication ──
        if is_admin_key:
            request.state.is_admin = True
            request.state.user_id = "admin"
            request.state.user_email = ADMIN_EMAIL
            request.state.credits_before = 999999
            request.state.credits_after = 999999
        else:
            if not auth_header.startswith("Bearer "):
                return JSONResponse(
                    status_code=401, content={"error": "Missing authorization"}
                )

            token = auth_header[7:]
            user = await verify_jwt(token)
            if not user:
                return JSONResponse(
                    status_code=401, content={"error": "Invalid or expired token"}
                )

            request.state.user_id = user["id"]
            request.state.user_email = user["email"]
            request.state.is_admin = user["email"] == ADMIN_EMAIL

        # ── Layer 4: Rate Limiting (non-admin) ──
        if not request.state.is_admin:
            allowed, remaining, retry_after = await rate_limiter.check_and_increment(
                request.state.user_id
            )
            if not allowed:
                return JSONResponse(
                    status_code=429,
                    content={"error": f"Rate limit exceeded. Try again in {retry_after}s."},
                    headers={"Retry-After": str(retry_after)},
                )

        # ── Layer 5: Credit Check (non-admin) ──
        if not request.state.is_admin:
            credit_info = await get_user_credits_info(request.state.user_id)
            credits_before = credit_info["credits_left"] if credit_info else 0
            request.state.credits_before = credits_before

            result = await deduct_credits(request.state.user_id, CREDITS_PER_IMAGE)
            if not result["success"]:
                return JSONResponse(
                    status_code=402,
                    content={
                        "error": result["message"],
                        "credits_remaining": result["credits_remaining"],
                    },
                )
            request.state.credits_after = result["credits_remaining"]
        else:
            request.state.credits_before = 999999
            request.state.credits_after = 999999

        # ── Layer 6: File Validation (magic bytes) ──
        # Extract the file part from multipart form data
        # We'll validate in the endpoint (body has been read)
        # Store validated body for the endpoint
        request.state.validated_body = body

        # Pass to endpoint
        response = await call_next(request)

        # ── Layer 7: Audit Logging ──
        success = 200 <= response.status_code < 300
        await log_usage(
            user_id=request.state.user_id,
            image_size_kb=len(body) / 1024,
            inference_ms=getattr(request.state, "inference_ms", 0),
            credits_before=request.state.credits_before,
            credits_after=request.state.credits_after,
            success=success,
            error_message="" if success else f"HTTP {response.status_code}",
        )

        return response


# ═══════════════════════════════════════════════════════════════
# Global Instances
# ═══════════════════════════════════════════════════════════════

engine = InferenceEngine()
rate_limiter = RateLimiter(UPSTASH_REDIS_URL, UPSTASH_REDIS_TOKEN)


# ═══════════════════════════════════════════════════════════════
# FastAPI Application
# ═══════════════════════════════════════════════════════════════

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("=" * 60)
    logger.info("STARTING BACKGROUND REMOVAL API v2.0")
    logger.info("=" * 60)

    engine.load(MODEL_PATH)
    get_supabase()

    logger.info(f"  Model:     {engine.get_info()['status']}")
    logger.info(f"  Supabase:  {'connected' if get_supabase() else 'not configured'}")
    logger.info(f"  Redis:     {'connected' if rate_limiter.enabled else 'not configured'}")
    logger.info(f"  Admin:     {ADMIN_EMAIL}")
    logger.info(f"  CORS:      {ALLOWED_ORIGINS}")
    logger.info("=" * 60)

    yield

    logger.info("Shutting down")


app = FastAPI(
    title="Background Removal API",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(GatekeeperMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=[
        "X-Credits-Remaining",
        "X-Processing-Time-Ms",
    ],
)


# ─────────────────────────────────────────────────────────────
# GET /
# ─────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {
        "service": "bg-removal-api",
        "version": "2.0.0",
        "uptime_seconds": int(time.time() - START_TIME),
        "model": engine.get_info(),
        "environment": os.environ.get("ENV", "development"),
    }


# ─────────────────────────────────────────────────────────────
# GET /health
# ─────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok", "model_ready": engine.is_ready}


# ─────────────────────────────────────────────────────────────
# POST /remove-bg (protected by GatekeeperMiddleware)
# ─────────────────────────────────────────────────────────────

@app.post("/remove-bg")
async def remove_background(request: Request, image: UploadFile = File(...)):
    if not engine.is_ready:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. ONNX file not found at MODEL_PATH.",
        )

    # Read uploaded file bytes
    content = await image.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Empty file")

    # Magic bytes validation
    detected_type = validate_magic_bytes(content)
    if detected_type is None:
        raise HTTPException(
            status_code=400,
            detail="Invalid file format. Upload a PNG, JPEG, or WebP image. "
            "(Validated by magic bytes, not file extension.)",
        )

    # Run inference
    try:
        png_bytes, timings = await engine.process(content)
        request.state.inference_ms = timings["inference_ms"]
    except Exception as e:
        logger.error(f"Inference failed: {e}", exc_info=True)
        # Refund credits on failure
        if not getattr(request.state, "is_admin", False):
            await refund_credits(
                request.state.user_id, CREDITS_PER_IMAGE
            )
            request.state.credits_after = (
                getattr(request.state, "credits_before", 0)
            )
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

    # Build response
    out_buf = io.BytesIO(png_bytes)
    out_buf.seek(0)

    stem = Path(image.filename or "image").stem

    return StreamingResponse(
        out_buf,
        media_type="image/png",
        headers={
            "Content-Disposition": f'inline; filename="{stem}_nobg.png"',
            "X-Credits-Remaining": str(getattr(request.state, "credits_after", -1)),
            "X-Processing-Time-Ms": str(timings["total_ms"]),
        },
    )


# ─────────────────────────────────────────────────────────────
# GET /me/credits
# ─────────────────────────────────────────────────────────────

@app.get("/me/credits")
async def my_credits(request: Request):
    auth_header = request.headers.get("Authorization", "")

    # Admin key
    if auth_header == f"Bearer {ADMIN_API_KEY}" and ADMIN_API_KEY:
        return {
            "credits_left": 999999,
            "total_used": 0,
            "plan": "unlimited",
            "is_admin": True,
        }

    # JWT
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authorization required")

    user = await verify_jwt(auth_header[7:])
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")

    info = await get_user_credits_info(user["id"])
    if not info:
        raise HTTPException(status_code=404, detail="User credits not found")

    return info


# ─────────────────────────────────────────────────────────────
# Run
# ─────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 10000)),
        workers=1,
    )
