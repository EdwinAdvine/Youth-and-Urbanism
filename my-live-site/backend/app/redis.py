"""Centralized Redis client management for the application."""

import logging
from typing import Optional

import redis.asyncio as aioredis

from app.config import settings

logger = logging.getLogger(__name__)

# Global Redis client instance
_redis_client: Optional[aioredis.Redis] = None


async def init_redis() -> None:
    """
    Initialize the global Redis client connection.

    Should be called during application startup (in lifespan).
    """
    global _redis_client

    if _redis_client is not None:
        logger.warning("Redis client already initialized")
        return

    try:
        _redis_client = aioredis.from_url(
            settings.redis_url,
            encoding="utf-8",
            decode_responses=True,
        )
        # Test connection
        await _redis_client.ping()
        logger.info(f"Redis client initialized successfully: {settings.redis_url}")
    except Exception as e:
        logger.error(f"Failed to initialize Redis client: {str(e)}")
        _redis_client = None
        raise


async def close_redis() -> None:
    """
    Close the global Redis client connection.

    Should be called during application shutdown (in lifespan).
    """
    global _redis_client

    if _redis_client is not None:
        try:
            await _redis_client.close()
            logger.info("Redis client closed successfully")
        except Exception as e:
            logger.error(f"Error closing Redis client: {str(e)}")
        finally:
            _redis_client = None


def get_redis() -> aioredis.Redis:
    """
    Get the global Redis client instance.

    Returns:
        Configured Redis client

    Raises:
        RuntimeError: If Redis client is not initialized
    """
    if _redis_client is None:
        raise RuntimeError(
            "Redis client not initialized. Call init_redis() during application startup."
        )
    return _redis_client
