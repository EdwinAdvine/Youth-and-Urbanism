"""Health and readiness endpoints for monitoring and load balancers."""

from fastapi import APIRouter

from app.config import settings
from app.database import check_db_connection
from app.redis import get_redis

router = APIRouter()


@router.get("/health", tags=["Health"], summary="Liveness check")
async def liveness():
    """
    Liveness probe - is the process alive?

    Returns 200 if the application process is running.
    Used by orchestrators (Kubernetes, Docker Swarm) to determine if the container is alive.
    Does NOT check dependencies (DB, Redis) - just confirms the process is responsive.
    """
    return {
        "status": "alive",
        "version": settings.app_version,
        "environment": settings.environment,
    }


@router.get("/ready", tags=["Health"], summary="Readiness check")
async def readiness():
    """
    Readiness probe - is the application ready to serve traffic?

    Returns 200 only if all critical dependencies are healthy:
    - Database connection
    - Redis connection

    Used by load balancers to determine if this instance should receive traffic.
    If readiness fails, the instance is temporarily removed from the load balancer pool.
    """
    db_healthy = await check_db_connection()

    redis_healthy = False
    try:
        r = get_redis()
        await r.ping()
        redis_healthy = True
    except Exception:
        pass

    ready = db_healthy and redis_healthy

    return {
        "status": "ready" if ready else "not_ready",
        "version": settings.app_version,
        "environment": settings.environment,
        "database": {
            "status": "connected" if db_healthy else "disconnected",
            "healthy": db_healthy,
        },
        "redis": {
            "status": "connected" if redis_healthy else "disconnected",
            "healthy": redis_healthy,
        },
    }, (200 if ready else 503)
