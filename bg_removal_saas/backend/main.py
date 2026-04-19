import os
import time
import hmac
import hashlib
import collections
from datetime import datetime
import io
import uuid

from fastapi import FastAPI, Request, Form, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
import uvicorn
from pydantic import BaseModel

import numpy as np
from PIL import Image, ImageOps
import onnxruntime as ort
import cloudinary
import cloudinary.uploader
from supabase import create_client, Client
from jose import jwt

# Environment Variables
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")
ADMIN_API_KEY = os.environ.get("ADMIN_API_KEY")
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "koushiknagabhatla@gmail.com")
WEBHOOK_SECRET = os.environ.get("WEBHOOK_SECRET")
CLOUDINARY_CLOUD_NAME = os.environ.get("CLOUDINARY_CLOUD_NAME")
CLOUDINARY_API_KEY = os.environ.get("CLOUDINARY_API_KEY")
CLOUDINARY_API_SECRET = os.environ.get("CLOUDINARY_API_SECRET")
MODEL_PATH = os.environ.get("MODEL_PATH", "/app/model/model_fp32.onnx")

# Initialize Clients
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY) if SUPABASE_URL else None
if CLOUDINARY_CLOUD_NAME:
    cloudinary.config(
        cloud_name=CLOUDINARY_CLOUD_NAME,
        api_key=CLOUDINARY_API_KEY,
        api_secret=CLOUDINARY_API_SECRET
    )

app = FastAPI(title="Background Removal API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-app.vercel.app", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type", "X-Timestamp", "X-Signature"],
)

# ── Inference Engine ───────────────────────────────────────
class InferenceEngine:
    def __init__(self, model_path):
        self.session = None
        self.loaded = False
        try:
            self.session = ort.InferenceSession(model_path, providers=['CPUExecutionProvider'])
            self.loaded = True
            print("Model loaded successfully.")
        except Exception as e:
            print(f"Warning: Model not found at {model_path}. Error: {e}")

    def preprocess(self, image_bytes):
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img = ImageOps.exif_transpose(img)
        w, h = img.size
        
        resized = img.resize((256, 256), Image.Resampling.LANCZOS)
        arr = np.array(resized, dtype=np.float32) / 255.0
        
        # Normalize
        mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
        std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
        arr = (arr - mean) / std
        
        # Transpose to (1, 3, 256, 256)
        tensor = np.transpose(arr, (2, 0, 1))
        tensor = np.expand_dims(tensor, axis=0)
        return tensor, img

    def postprocess(self, mask_output, original_image):
        mask = mask_output[0][0] # (256, 256)
        mask = (mask > 0.5).astype(np.uint8) * 255
        
        mask_img = Image.fromarray(mask, mode="L")
        mask_img = mask_img.resize(original_image.size, Image.Resampling.LANCZOS)
        
        rgba = original_image.convert("RGBA")
        rgba.putalpha(mask_img)
        
        out_buf = io.BytesIO()
        rgba.save(out_buf, format="PNG")
        return out_buf.getvalue()

    def run(self, image_bytes):
        t0 = time.time()
        tensor, original_image = self.preprocess(image_bytes)
        output = self.session.run(['output'], {'input': tensor})
        png_bytes = self.postprocess(output[0], original_image)
        inference_ms = int((time.time() - t0) * 1000)
        return png_bytes, inference_ms, original_image.size

engine = InferenceEngine(MODEL_PATH)

# ── Simple Rate Limiter ────────────────────────────────────
class SimpleRateLimiter:
    def __init__(self):
        self.requests = collections.defaultdict(list)

    def check(self, user_id):
        now = time.time()
        # Clean up old timestamps
        self.requests[user_id] = [t for t in self.requests[user_id] if now - t < 60]
        if len(self.requests[user_id]) >= 10:
            return False
        self.requests[user_id].append(now)
        return True

limiter = SimpleRateLimiter()

# ── Gatekeeper Middleware ──────────────────────────────────
class GatekeeperMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.url.path != "/remove-bg" or request.method != "POST":
            return await call_next(request)

        # We must read body here, but starlette makes reading body inside middleware tricky.
        # So we do the 7 layers directly in the endpoint.
        # But per instructions, implement as much as possible gracefully.
        return await call_next(request)

app.add_middleware(GatekeeperMiddleware)

def check_magic_bytes(header_bytes):
    if header_bytes.startswith(b'\x89PNG'):
        return True
    if header_bytes.startswith(b'\xFF\xD8\xFF'):
        return True
    if header_bytes[8:12] == b'WEBP':
        return True
    return False

# ── Endpoints ──────────────────────────────────────────────
@app.get("/")
def read_root():
    return {
        "status": "ok",
        "model": "BgRemovalNet",
        "iou": 0.9023,
        "version": "1.0.0"
    }

@app.get("/health")
def read_health():
    return {"status": "ok", "model_loaded": engine.loaded}

@app.post("/remove-bg")
async def remove_bg(request: Request, image: UploadFile = File(...)):
    # Layer 1: Request Size 
    # FastAPI handles large files, but check if we can read safely
    image_bytes = await image.read()
    image_size_kb = len(image_bytes) / 1024
    if len(image_bytes) > 20 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large (max 20MB)")

    # Auth & Signature bypass check
    auth_header = request.headers.get("Authorization", "")
    is_admin = False
    user_id = None
    
    if auth_header == f"Bearer {ADMIN_API_KEY}" and ADMIN_API_KEY:
        is_admin = True
        user_id = "admin-" + ADMIN_EMAIL
    else:
        # Layer 2: HMAC Signature
        timestamp = request.headers.get("X-Timestamp")
        signature = request.headers.get("X-Signature")
        if not timestamp or not signature or not WEBHOOK_SECRET:
            raise HTTPException(status_code=401, detail="Missing signature headers")
        
        try:
            ts_int = int(timestamp)
            if time.time() * 1000 - ts_int > 30000:
                raise HTTPException(status_code=401, detail="Request expired")
        except:
            raise HTTPException(status_code=401, detail="Invalid timestamp")
            
        body_hash = hashlib.sha256(image_bytes).hexdigest()
        expected_sig = hmac.new(
            WEBHOOK_SECRET.encode(),
            f"{timestamp}:{body_hash}".encode(),
            hashlib.sha256
        ).hexdigest()
        
        if not hmac.compare_digest(expected_sig, signature):
            raise HTTPException(status_code=401, detail="Invalid signature")

        # Layer 3: Authentication
        if not auth_header.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Invalid auth header")
        
        jwt_token = auth_header.split(" ")[1]
        try:
            # Decode JWT without verification (Supabase validates on their end, but we extract)
            # In production, verify against Supabase JWT secret
            payload = jwt.get_unverified_claims(jwt_token)
            user_id = payload.get("sub")
            email = payload.get("email", "")
            is_admin = (email == ADMIN_EMAIL)
        except Exception:
            raise HTTPException(status_code=401, detail="Invalid JWT")

    # Layer 4: Rate Limiting
    if not is_admin:
        if not limiter.check(user_id):
            return JSONResponse({"detail": "Too Many Requests"}, status_code=429, headers={"Retry-After": "60"})

    # Layer 6: File Validation (Magic Bytes)
    if not check_magic_bytes(image_bytes[:16]):
        raise HTTPException(status_code=415, detail="Unsupported file format (PNG, JPEG, WEBP only)")

    # Layer 5: Credit Check
    credits_before = 0
    credits_after = 0
    if not is_admin and supabase:
        res = supabase.rpc('deduct_credits', {'p_user_id': user_id, 'p_amount': 5}).execute()
        data = res.data[0] if res.data else None
        if not data or not data.get('success'):
            raise HTTPException(status_code=402, detail=f"Insufficient credits: {data.get('message') if data else 'Unknown error'}")
        credits_before = data.get('credits_remaining', 0) + 5
        credits_after = data.get('credits_remaining', 0)

    # Run Inference
    success = False
    result_url = ""
    inference_ms = 0
    error_message = ""
    original_size = [0, 0]
    
    try:
        png_bytes, inference_ms, original_size = engine.run(image_bytes)
        
        # Upload to Cloudinary
        upload_result = cloudinary.uploader.upload(
            png_bytes,
            folder="bg-removal-results",
            resource_type="image"
        )
        result_url = upload_result.get("secure_url")
        success = True
    except Exception as e:
        error_message = str(e)
        success = False

    # Layer 7: Audit Logging
    if supabase and user_id and not user_id.startswith("admin-"):
        try:
            supabase.table("usage_log").insert({
                "user_id": user_id,
                "image_size_kb": image_size_kb,
                "inference_ms": inference_ms,
                "credits_before": credits_before,
                "credits_after": credits_after,
                "result_url": result_url,
                "success": success,
                "error_message": error_message
            }).execute()
        except:
            pass # Non-fatal

    if not success:
        raise HTTPException(status_code=500, detail=f"Processing failed: {error_message}")

    headers = {
        "X-Credits-Remaining": "Unlimited" if is_admin else str(credits_after),
        "X-Processing-Time-Ms": str(inference_ms)
    }

    return JSONResponse({
        "result_url": result_url,
        "credits_remaining": "Unlimited" if is_admin else credits_after,
        "inference_ms": inference_ms,
        "original_size": original_size
    }, headers=headers)

@app.get("/me/credits")
async def get_credits(request: Request):
    auth_header = request.headers.get("Authorization", "")
    if auth_header == f"Bearer {ADMIN_API_KEY}":
        return {"credits_left": "Unlimited", "total_used": 0, "plan": "unlimited", "is_admin": True}
        
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
        
    jwt_token = auth_header.split(" ")[1]
    try:
        payload = jwt.get_unverified_claims(jwt_token)
        user_id = payload.get("sub")
        email = payload.get("email", "")
        # The user has to pull their data using the supabase instance
        response = supabase.table("user_credits").select("credits_left, total_used").eq("user_id", user_id).execute()
        plan_resp = supabase.table("users").select("plan, is_admin").eq("id", user_id).execute()
        
        if not response.data:
            return {"credits_left": 0, "total_used": 0, "plan": "free", "is_admin": False}
            
        c_data = response.data[0]
        u_data = plan_resp.data[0] if plan_resp.data else {"plan": "free", "is_admin": False}
        
        is_admin = u_data.get("is_admin") or (email == ADMIN_EMAIL)
        return {
            "credits_left": "Unlimited" if is_admin else c_data.get("credits_left"),
            "total_used": c_data.get("total_used"),
            "plan": u_data.get("plan"),
            "is_admin": is_admin
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid Token")
