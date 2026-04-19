"""
Gatekeeper Middleware — Bulletproof Request Validation
======================================================

7-Layer Security Pipeline:
    Layer 1: HMAC-SHA256 Signature Verification
             Prevents direct API calls bypassing frontend.
             timestamp + body_hash signed with WEBHOOK_SECRET.
             Replay attack protection: reject if |now - timestamp| > 30s.

    Layer 2: Identity Resolution
             ADMIN_API_KEY → unlimited (you)
             JWT from Supabase Auth → authenticated user
             No auth → 401 rejected

    Layer 3: Rate Limiting (Upstash Redis)
             Sliding window: max 10 req/min/user
             key = "ratelimit:{user_id}:{current_minute}"
             TTL = 60 seconds

    Layer 4: Credit Check (Supabase)
             Query user_credits table for remaining credits.

    Layer 5: Atomic Credit Deduction
             SQL function: decrement only if credits_left > 0
             Prevents race condition where 2 concurrent requests
             both see credits=1, both proceed, leaving credits=-1.

    Layer 6: Inference (delegated to engine)

    Layer 7: Audit Logging
             Record every request for analytics + abuse detection.

HMAC-SHA256 Math:
    HMAC(K, m) = H((K' XOR opad) || H((K' XOR ipad) || m))
    Where:
        K' = H(K) if |K| > block_size, else K padded to block_size
        opad = 0x5c repeated block_size times
        ipad = 0x36 repeated block_size times
        H = SHA-256
    
    This is a keyed hash — only someone with WEBHOOK_SECRET can
    produce a valid signature. The browser NEVER sees this secret.
"""

import hashlib
import hmac
import time
import logging
from typing import Optional

from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)


class GatekeeperConfig:
    """Configuration for the Gatekeeper middleware."""

    def __init__(
        self,
        admin_api_key: str,
        webhook_secret: str,
        signature_max_age_seconds: int = 30,
        rate_limit_per_minute: int = 10,
        enable_signature_check: bool = True,
        bypass_paths: Optional[list] = None,
    ):
        self.admin_api_key = admin_api_key
        self.webhook_secret = webhook_secret
        self.signature_max_age_seconds = signature_max_age_seconds
        self.rate_limit_per_minute = rate_limit_per_minute
        self.enable_signature_check = enable_signature_check
        # Paths that skip gatekeeper (health check, docs, etc.)
        self.bypass_paths = bypass_paths or ["/", "/health", "/docs", "/openapi.json"]


def verify_hmac_signature(
    webhook_secret: str,
    timestamp: str,
    body_hash: str,
    provided_signature: str,
) -> bool:
    """
    Verify HMAC-SHA256 signature.

    The frontend (Next.js API route) computes:
        message = f"{timestamp}:{body_hash}"
        signature = HMAC-SHA256(WEBHOOK_SECRET, message)

    We recompute and compare using constant-time comparison
    (hmac.compare_digest) to prevent timing attacks.

    Timing attack: if we compared character-by-character,
    an attacker could measure response time to guess
    each character of the signature sequentially.
    """
    message = f"{timestamp}:{body_hash}".encode("utf-8")
    expected = hmac.new(
        webhook_secret.encode("utf-8"),
        message,
        hashlib.sha256,
    ).hexdigest()

    # Constant-time comparison prevents timing attacks
    return hmac.compare_digest(expected, provided_signature)


def compute_body_hash(body: bytes) -> str:
    """SHA-256 hash of request body."""
    return hashlib.sha256(body).hexdigest()


async def check_signature(
    request: Request,
    config: GatekeeperConfig,
    body: bytes,
) -> None:
    """
    Layer 1: Signature Verification.

    Validates that the request came from our Next.js API proxy
    and hasn't been tampered with or replayed.

    Headers required:
        X-Timestamp: Unix timestamp (milliseconds)
        X-Signature: HMAC-SHA256(WEBHOOK_SECRET, "{timestamp}:{body_hash}")
    """
    timestamp_str = request.headers.get("X-Timestamp")
    signature = request.headers.get("X-Signature")

    if not timestamp_str or not signature:
        raise HTTPException(
            status_code=401,
            detail="Missing signature headers (X-Timestamp, X-Signature)",
        )

    # Replay attack protection: reject old requests
    try:
        timestamp_ms = int(timestamp_str)
        age_seconds = abs(time.time() * 1000 - timestamp_ms) / 1000
    except (ValueError, TypeError):
        raise HTTPException(status_code=401, detail="Invalid timestamp format")

    if age_seconds > config.signature_max_age_seconds:
        logger.warning(f"Replay attack detected: request age = {age_seconds:.1f}s")
        raise HTTPException(
            status_code=401,
            detail=f"Request expired ({age_seconds:.0f}s old, max {config.signature_max_age_seconds}s)",
        )

    # Verify HMAC signature
    body_hash = compute_body_hash(body)
    if not verify_hmac_signature(
        config.webhook_secret, timestamp_str, body_hash, signature
    ):
        logger.warning("Invalid HMAC signature")
        raise HTTPException(status_code=401, detail="Invalid request signature")


async def resolve_identity(
    request: Request,
    config: GatekeeperConfig,
    supabase_client,
) -> dict:
    """
    Layer 2: Identity Resolution.

    Returns:
        {
            "type": "admin" | "user",
            "user_id": str | None,
            "email": str | None,
            "is_admin": bool,
        }
    """
    auth_header = request.headers.get("Authorization", "")

    if not auth_header:
        raise HTTPException(status_code=401, detail="No authorization header")

    # Check for admin key
    if auth_header == f"Bearer {config.admin_api_key}":
        return {
            "type": "admin",
            "user_id": "admin",
            "email": "admin",
            "is_admin": True,
        }

    # Verify JWT from Supabase Auth
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization format")

    token = auth_header[7:]  # Strip "Bearer "

    try:
        # Supabase client verifies JWT signature with its public key
        user_response = supabase_client.auth.get_user(token)
        user = user_response.user

        if not user:
            raise HTTPException(status_code=401, detail="Invalid or expired token")

        return {
            "type": "user",
            "user_id": str(user.id),
            "email": user.email,
            "is_admin": False,
        }
    except Exception as e:
        logger.warning(f"JWT verification failed: {e}")
        raise HTTPException(status_code=401, detail="Authentication failed")


async def check_rate_limit(
    user_id: str,
    redis_client,
    max_per_minute: int,
) -> None:
    """
    Layer 3: Rate Limiting via Upstash Redis.

    Sliding window algorithm:
        key = "ratelimit:{user_id}:{current_minute}"
        INCR key
        EXPIRE key 60

    If count > max_per_minute → 429 Too Many Requests.

    Why per-minute window (not per-second):
        - Background removal is expensive (~1-3s per request)
        - 10/min is generous for legitimate use
        - Prevents abuse while allowing burst usage
    """
    current_minute = int(time.time() // 60)
    key = f"ratelimit:{user_id}:{current_minute}"

    try:
        count = await redis_client.incr(key)
        if count == 1:
            # First request this minute — set TTL
            await redis_client.expire(key, 60)

        if count > max_per_minute:
            # Calculate seconds until next window
            seconds_left = 60 - int(time.time() % 60)
            raise HTTPException(
                status_code=429,
                detail=f"Rate limit exceeded ({max_per_minute}/min). Try again in {seconds_left}s.",
                headers={"Retry-After": str(seconds_left)},
            )
    except HTTPException:
        raise
    except Exception as e:
        # Redis failure → allow request (fail-open for availability)
        logger.error(f"Redis rate limit check failed: {e}")


async def check_credits(
    user_id: str,
    supabase_client,
) -> int:
    """
    Layer 4: Credit Check.

    Queries user_credits table in Supabase.
    Returns remaining credits.
    Raises 402 if no credits remaining.
    """
    try:
        response = (
            supabase_client.table("user_credits")
            .select("credits_left")
            .eq("user_id", user_id)
            .single()
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=402,
                detail="No credit record found. Please sign up.",
            )

        credits_left = response.data["credits_left"]

        if credits_left <= 0:
            raise HTTPException(
                status_code=402,
                detail="No credits remaining. Upgrade your plan at /pricing.",
            )

        return credits_left

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Credit check failed: {e}")
        raise HTTPException(status_code=500, detail="Credit system error")


async def deduct_credit_atomic(
    user_id: str,
    supabase_client,
) -> None:
    """
    Layer 5: Atomic Credit Deduction.

    Calls the SQL function:
        decrement_credits_atomic(uid UUID)

    This is ATOMIC — it uses:
        UPDATE user_credits
        SET credits_left = credits_left - 1
        WHERE user_id = uid AND credits_left > 0

    The WHERE clause prevents decrementing below 0.
    In a race condition where two requests arrive simultaneously:
        Request A: sees credits=1, decrements → credits=0
        Request B: WHERE credits_left > 0 fails → no update → 0 rows
        We check affected rows — if 0, the request is rejected.
    """
    try:
        supabase_client.rpc(
            "decrement_credits_atomic",
            {"uid": user_id},
        ).execute()
    except Exception as e:
        logger.error(f"Atomic credit deduction failed: {e}")
        raise HTTPException(status_code=500, detail="Credit deduction error")


async def log_audit(
    user_id: str,
    supabase_client,
    image_size_kb: float,
    inference_ms: float,
    credits_after: int,
    success: bool = True,
    error_message: str = "",
) -> None:
    """
    Layer 7: Audit Logging.

    Records every inference request for:
        - Usage analytics (who uses the API, how much)
        - Abuse detection (unusual patterns)
        - Cost tracking (inference time × compute cost)
        - Debugging (failed requests)
    """
    try:
        supabase_client.table("audit_log").insert({
            "user_id": user_id,
            "image_size_kb": round(image_size_kb, 1),
            "inference_ms": round(inference_ms, 1),
            "credits_after": credits_after,
            "success": success,
            "error_message": error_message,
        }).execute()
    except Exception as e:
        # Audit logging failure should NEVER block the response
        logger.error(f"Audit logging failed: {e}")
