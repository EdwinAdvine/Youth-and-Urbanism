"""
Admin Platform Pulse API Endpoints - Phase 2 (Real-Time Monitoring)

Provides REST endpoints for the Platform Pulse dashboard including:
- Real-time platform activity metrics
- Service health status across all providers
- Urgent safety and policy flags
- Historical metrics with configurable time periods

All endpoints require admin or staff role access.
"""

import logging
from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, Path, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.utils.permissions import verify_admin_access
from app.services.admin.pulse_service import PulseService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/pulse", tags=["Admin - Platform Pulse"])


# ------------------------------------------------------------------
# GET /pulse/realtime
# ------------------------------------------------------------------
@router.get("/realtime")
async def get_realtime_metrics(
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Real-time platform activity metrics.

    Returns active users, concurrent sessions, AI conversations per hour,
    requests per minute, average response time, error rate, and a
    sessions-over-time array for the last 60 minutes.
    """
    try:
        data = await PulseService.get_realtime_metrics(db)
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to fetch real-time metrics")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch real-time metrics.",
        ) from exc


# ------------------------------------------------------------------
# GET /pulse/health
# ------------------------------------------------------------------
@router.get("/health")
async def get_health_status(
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Service health status for all monitored platform services.

    Returns an array of service health objects and a summary with
    counts of healthy, degraded, and down services.
    """
    try:
        data = await PulseService.get_health_status(db)
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to fetch health status")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch health status.",
        ) from exc


# ------------------------------------------------------------------
# GET /pulse/urgent-flags
# ------------------------------------------------------------------
@router.get("/urgent-flags")
async def get_urgent_flags(
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Urgent flags requiring immediate admin attention.

    Returns child safety flags, policy violations, escalated support
    tickets, and system-critical alerts with severity levels.
    """
    try:
        data = await PulseService.get_urgent_flags(db)
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to fetch urgent flags")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch urgent flags.",
        ) from exc


# ------------------------------------------------------------------
# GET /pulse/metrics/{period}
# ------------------------------------------------------------------
@router.get("/metrics/{period}")
async def get_metrics_history(
    period: str = Path(
        ...,
        description="Time period: 1h, 6h, 24h, or 7d",
        pattern="^(1h|6h|24h|7d)$",
    ),
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Historical metrics for charting.

    Returns time-series arrays of active users, sessions, AI chats,
    error rate, and response time for the specified period.

    Supported periods:
    - **1h**: Last 1 hour (5-minute intervals)
    - **6h**: Last 6 hours (15-minute intervals)
    - **24h**: Last 24 hours (30-minute intervals)
    - **7d**: Last 7 days (3-hour intervals)
    """
    try:
        data = await PulseService.get_metrics_history(db, period)
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception(f"Failed to fetch metrics history for period={period}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch metrics history.",
        ) from exc
