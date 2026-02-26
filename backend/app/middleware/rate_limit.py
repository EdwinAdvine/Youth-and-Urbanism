"""
Global rate limiting middleware using Redis sliding window.

Uses an atomic Lua script (ZADD + ZREMRANGEBYSCORE) for precise
sliding-window counting. Wires into the existing config settings:
  - settings.rate_limit_enabled  (default: True)
  - settings.rate_limit_requests (default: 100)
  - settings.rate_limit_window   (default: 60 seconds)

Fails open on Redis errors — requests are allowed through if Redis
is unavailable, with a logged warning.
"""
import logging
import time

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import JSONResponse

from app.config import settings

logger = logging.getLogger(__name__)

# Paths exempt from rate limiting
_EXEMPT_PATHS = frozenset({
    "/health",
    "/docs",
    "/redoc",
    "/openapi.json",
    "/",
    "/metrics",
    "/api/v1/health",
    "/api/v1/ready",
})

# Atomic Lua script for sliding window rate limiting.
# KEYS[1] = rate limit key
# ARGV[1] = window size in seconds
# ARGV[2] = max requests allowed
# ARGV[3] = current timestamp in milliseconds
# Returns: {allowed (0/1), current_count, retry_after_ms}
_SLIDING_WINDOW_LUA = """
local key = KEYS[1]
local window = tonumber(ARGV[1])
local max_requests = tonumber(ARGV[2])
local now = tonumber(ARGV[3])

-- Remove expired entries outside the window
redis.call('ZREMRANGEBYSCORE', key, 0, now - window * 1000)

-- Count current requests in the window
local current = redis.call('ZCARD', key)

if current >= max_requests then
    -- Get the oldest entry to calculate retry-after
    local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
    local retry_after = 0
    if #oldest > 0 then
        retry_after = tonumber(oldest[2]) + window * 1000 - now
    end
    return {0, current, retry_after}
end

-- Add this request with score = current timestamp
redis.call('ZADD', key, now, now .. '-' .. math.random(1000000))
redis.call('PEXPIRE', key, window * 1000)

return {1, current + 1, 0}
"""


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Sliding-window per-IP rate limiter backed by Redis sorted sets."""

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        if not settings.rate_limit_enabled:
            return await call_next(request)

        # Skip exempt paths
        if request.url.path in _EXEMPT_PATHS:
            return await call_next(request)

        # Skip WebSocket upgrade requests
        if request.headers.get("upgrade", "").lower() == "websocket":
            return await call_next(request)

        # Extract client IP (respect X-Forwarded-For from reverse proxy)
        client_ip = (
            request.headers.get("X-Forwarded-For", "").split(",")[0].strip()
            or (request.client.host if request.client else "unknown")
        )

        try:
            from app.redis import get_redis

            r = get_redis()
            now_ms = int(time.time() * 1000)
            key = f"ratelimit:global:{client_ip}"

            result = await r.eval(
                _SLIDING_WINDOW_LUA,
                1,
                key,
                settings.rate_limit_window,
                settings.rate_limit_requests,
                now_ms,
            )
            allowed, current, retry_after_ms = result

            if not allowed:
                retry_seconds = max(1, int(retry_after_ms / 1000))
                response = JSONResponse(
                    status_code=429,
                    content={"detail": "Too many requests. Please try again later."},
                )
                response.headers["Retry-After"] = str(retry_seconds)
                response.headers["X-RateLimit-Limit"] = str(settings.rate_limit_requests)
                response.headers["X-RateLimit-Remaining"] = "0"
                return response

            # Process the request
            response = await call_next(request)

            # Add rate limit headers to successful responses
            remaining = max(0, settings.rate_limit_requests - current)
            response.headers["X-RateLimit-Limit"] = str(settings.rate_limit_requests)
            response.headers["X-RateLimit-Remaining"] = str(remaining)
            return response

        except Exception as e:
            # Fail open — allow the request through if Redis is unavailable
            logger.warning(f"Rate limit check failed (allowing request): {e}")
            return await call_next(request)
