"""Application lifespan manager for startup and shutdown events."""

import asyncio
import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI

from app.config import settings
from app.database import init_db, close_db, check_db_connection
from app.redis import init_redis, close_redis

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator:
    """
    Application lifespan manager for startup and shutdown events.

    Startup tasks:
    - Initialize database connection
    - Check database connectivity
    - Start SLA background monitor

    Shutdown tasks:
    - Stop background tasks
    - Close database connections
    """
    # Startup
    logger.info("=" * 70)
    logger.info(f"Starting {settings.app_name} v{settings.app_version}")
    logger.info("=" * 70)
    logger.info(f"Environment: {settings.environment}")
    logger.info(f"Debug Mode: {settings.debug}")
    logger.info(f"API Documentation: http://localhost:8000/docs")
    logger.info(f"CORS Origins: {', '.join(settings.cors_origins_list)}")
    logger.info("-" * 70)

    try:
        # Initialize database connection
        logger.info("Initializing database connection...")
        await init_db()

        # Check database health
        db_healthy = await check_db_connection()
        if db_healthy:
            logger.info("Database connection: HEALTHY")
        else:
            logger.warning("Database connection: UNHEALTHY - Some features may not work")

        # Initialize Redis connection
        logger.info("Initializing Redis connection...")
        await init_redis()
        logger.info("Redis connection: HEALTHY")

        logger.info("-" * 70)
        logger.info("Application startup complete")
        logger.info("=" * 70)

        # Start SLA background monitor
        async def sla_monitor_loop():
            """Periodically check for SLA breaches every 60 seconds."""
            from app.database import AsyncSessionLocal
            from app.services.staff.sla_engine import check_sla_breaches
            while True:
                try:
                    await asyncio.sleep(60)
                    if AsyncSessionLocal is not None:
                        async with AsyncSessionLocal() as db:
                            result = await check_sla_breaches(db)
                            if result.get("breaches_detected", 0) > 0:
                                logger.info(
                                    f"SLA monitor: {result['breaches_detected']} breaches detected, "
                                    f"{result.get('escalations_triggered', 0)} escalations triggered"
                                )
                except asyncio.CancelledError:
                    break
                except Exception as e:
                    logger.error(f"SLA monitor error: {str(e)}")
                    await asyncio.sleep(10)

        sla_task = asyncio.create_task(sla_monitor_loop())
        logger.info("SLA background monitor started (60s interval)")

    except Exception as e:
        logger.error(f"Failed to start application: {str(e)}")
        raise

    yield

    # Shutdown
    sla_task.cancel()
    try:
        await sla_task
    except asyncio.CancelledError:
        pass
    logger.info("SLA background monitor stopped")
    logger.info("=" * 70)
    logger.info("Shutting down application...")
    logger.info("-" * 70)

    try:
        # Close Redis connection
        await close_redis()
        logger.info("Redis connection closed")

        # Close database connections
        await close_db()
        logger.info("Database connections closed")

    except Exception as e:
        logger.error(f"Error during shutdown: {str(e)}")

    logger.info("-" * 70)
    logger.info("Application shutdown complete")
    logger.info("=" * 70)
