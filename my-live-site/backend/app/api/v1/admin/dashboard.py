"""
Admin Dashboard API Endpoints - Phase 1 (At a Glance)

Provides REST endpoints for the admin dashboard overview including:
- Platform-wide metrics overview
- System and safety alerts
- Pending approvals / action items
- Revenue snapshot
- AI anomaly detections

All endpoints require admin or staff role access.
"""

import logging
from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.utils.permissions import verify_admin_access
from app.services.admin.dashboard_service import DashboardService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/dashboard", tags=["Admin - Dashboard"])


# ------------------------------------------------------------------
# GET /overview
# ------------------------------------------------------------------
@router.get("/overview")
async def get_dashboard_overview(
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    High-level platform metrics for the admin dashboard.

    Returns counts for users, enrollments, revenue, AI sessions, and courses.
    """
    try:
        data = await DashboardService.get_overview(db)
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to fetch dashboard overview")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch dashboard overview.",
        ) from exc


# ------------------------------------------------------------------
# GET /alerts
# ------------------------------------------------------------------
@router.get("/alerts")
async def get_dashboard_alerts(
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    System and safety alerts for the admin dashboard.

    Returns a list of alerts with severity, type, and action URLs.
    """
    try:
        alerts = await DashboardService.get_alerts(db)
        return {"status": "success", "data": alerts, "count": len(alerts)}
    except Exception as exc:
        logger.exception("Failed to fetch dashboard alerts")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch dashboard alerts.",
        ) from exc


# ------------------------------------------------------------------
# GET /pending-items
# ------------------------------------------------------------------
@router.get("/pending-items")
async def get_pending_items(
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Counts of items awaiting admin action: pending enrollments,
    unpublished courses, pending transactions, open tickets,
    and moderation items.
    """
    try:
        data = await DashboardService.get_pending_items(db)
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to fetch pending items")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch pending items.",
        ) from exc


# ------------------------------------------------------------------
# GET /revenue-snapshot
# ------------------------------------------------------------------
@router.get("/revenue-snapshot")
async def get_revenue_snapshot(
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Revenue snapshot for today, this week, and this month.

    Includes a trend percentage vs yesterday and the five most recent
    completed transactions.
    """
    try:
        data = await DashboardService.get_revenue_snapshot(db)
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to fetch revenue snapshot")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch revenue snapshot.",
        ) from exc


# ------------------------------------------------------------------
# GET /ai-anomalies
# ------------------------------------------------------------------
@router.get("/ai-anomalies")
async def get_ai_anomalies(
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    AI anomaly detections (content safety, usage spikes,
    response quality degradation).

    Returns mock data until the AI monitoring pipeline is active.
    """
    try:
        anomalies = await DashboardService.get_ai_anomalies(db)
        return {"status": "success", "data": anomalies, "count": len(anomalies)}
    except Exception as exc:
        logger.exception("Failed to fetch AI anomalies")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch AI anomalies.",
        ) from exc
