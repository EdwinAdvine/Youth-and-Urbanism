"""
Redis cache-aside helper for service layer caching.

Provides simple get/set/delete operations with automatic JSON
serialization and configurable TTL. All operations fail silently
(log warning + return None) so cache failures never break the app.

Usage:
    from app.utils.cache import cache_get, cache_set, cache_delete

    cached = await cache_get("admin:dashboard:overview")
    if cached:
        return cached

    result = await expensive_db_query()
    await cache_set("admin:dashboard:overview", result, ttl=60)
    return result
"""
import json
import logging
from typing import Any, Optional

from app.config import settings

logger = logging.getLogger(__name__)

# All cache keys are prefixed to avoid collisions with rate limiting, OTP, etc.
_KEY_PREFIX = "cache:"


async def cache_get(key: str) -> Optional[Any]:
    """Get a value from cache. Returns None on miss or error."""
    try:
        from app.redis import get_redis
        r = get_redis()
        data = await r.get(f"{_KEY_PREFIX}{key}")
        if data:
            return json.loads(data)
    except Exception as e:
        logger.warning(f"Cache GET failed for {key}: {e}")
    return None


async def cache_set(key: str, value: Any, ttl: Optional[int] = None) -> None:
    """Set a value in cache with TTL (seconds). Uses redis_cache_ttl default."""
    try:
        from app.redis import get_redis
        r = get_redis()
        ttl = ttl or settings.redis_cache_ttl
        await r.setex(f"{_KEY_PREFIX}{key}", ttl, json.dumps(value, default=str))
    except Exception as e:
        logger.warning(f"Cache SET failed for {key}: {e}")


async def cache_delete(key: str) -> None:
    """Delete a single cache key."""
    try:
        from app.redis import get_redis
        r = get_redis()
        await r.delete(f"{_KEY_PREFIX}{key}")
    except Exception as e:
        logger.warning(f"Cache DELETE failed for {key}: {e}")


async def cache_delete_pattern(pattern: str) -> None:
    """Delete all cache keys matching a glob pattern (e.g. 'admin:dashboard:*')."""
    try:
        from app.redis import get_redis
        r = get_redis()
        keys = []
        async for key in r.scan_iter(f"{_KEY_PREFIX}{pattern}"):
            keys.append(key)
        if keys:
            await r.delete(*keys)
    except Exception as e:
        logger.warning(f"Cache DELETE pattern failed for {pattern}: {e}")
