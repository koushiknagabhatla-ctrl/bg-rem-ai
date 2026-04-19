"""
Upstash Redis Rate Limiter
==========================

Async Redis client for Upstash (serverless Redis).

Uses the Upstash REST API — no persistent connections needed.
Works perfectly with Render's free/starter tier.

Sliding window rate limiting:
    key: "ratelimit:{user_id}:{minute_bucket}"
    INCR → count requests per minute
    EXPIRE → auto-cleanup after 60s
    
    If count > limit → 429 Too Many Requests

Upstash Free Tier: 10,000 commands/day
    At 10 req/min rate limit → each request = 2 commands (INCR + EXPIRE)
    Max 5,000 requests/day → more than enough for a starter product.
"""

import os
import time
import logging
from typing import Optional

logger = logging.getLogger(__name__)


class UpstashRedisClient:
    """
    Async-compatible Upstash Redis client using REST API.

    Environment variables:
        UPSTASH_REDIS_REST_URL: https://your-instance.upstash.io
        UPSTASH_REDIS_REST_TOKEN: AaBb...your_token
    """

    def __init__(
        self,
        url: Optional[str] = None,
        token: Optional[str] = None,
    ):
        self.url = url or os.environ.get("UPSTASH_REDIS_REST_URL", "")
        self.token = token or os.environ.get("UPSTASH_REDIS_REST_TOKEN", "")
        self._enabled = bool(self.url and self.token)

        if not self._enabled:
            logger.warning(
                "Upstash Redis not configured. Rate limiting disabled. "
                "Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN."
            )

    @property
    def is_configured(self) -> bool:
        return self._enabled

    async def _execute(self, *args) -> dict:
        """Execute a Redis command via Upstash REST API."""
        if not self._enabled:
            return {"result": 0}

        try:
            import httpx

            # Upstash REST API: POST with command as JSON array
            command = list(args)

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.url,
                    headers={
                        "Authorization": f"Bearer {self.token}",
                        "Content-Type": "application/json",
                    },
                    json=command,
                    timeout=5.0,
                )
                response.raise_for_status()
                return response.json()

        except Exception as e:
            logger.error(f"Upstash Redis error: {e}")
            return {"result": 0}

    async def incr(self, key: str) -> int:
        """Increment key and return new value."""
        result = await self._execute("INCR", key)
        return int(result.get("result", 0))

    async def expire(self, key: str, seconds: int) -> None:
        """Set key expiration."""
        await self._execute("EXPIRE", key, str(seconds))

    async def get(self, key: str) -> Optional[str]:
        """Get key value."""
        result = await self._execute("GET", key)
        return result.get("result")

    async def set(self, key: str, value: str, ex: Optional[int] = None) -> None:
        """Set key with optional expiration."""
        if ex:
            await self._execute("SET", key, value, "EX", str(ex))
        else:
            await self._execute("SET", key, value)


class RateLimiter:
    """
    Sliding window rate limiter using Redis.

    Algorithm:
        1. Key = "ratelimit:{identifier}:{minute_bucket}"
        2. INCR key → get request count for this minute
        3. If count == 1 → EXPIRE key 60s (first request this window)
        4. If count > limit → reject with 429

    The minute_bucket naturally rolls over, creating a sliding window.
    Old keys auto-expire via TTL, keeping Redis memory constant.
    """

    def __init__(
        self,
        redis_client: UpstashRedisClient,
        max_per_minute: int = 10,
    ):
        self.redis = redis_client
        self.max_per_minute = max_per_minute

    async def check(self, identifier: str) -> tuple:
        """
        Check rate limit for identifier.

        Args:
            identifier: User ID or IP address

        Returns:
            (allowed: bool, remaining: int, reset_seconds: int)
        """
        if not self.redis.is_configured:
            # No Redis → allow all (fail-open)
            return True, self.max_per_minute, 0

        current_minute = int(time.time() // 60)
        key = f"ratelimit:{identifier}:{current_minute}"

        count = await self.redis.incr(key)

        if count == 1:
            # First request this minute — set TTL
            await self.redis.expire(key, 60)

        remaining = max(0, self.max_per_minute - count)
        reset_seconds = 60 - int(time.time() % 60)
        allowed = count <= self.max_per_minute

        return allowed, remaining, reset_seconds
