"""
Staff Insights API Endpoints

Provides REST endpoints for platform analytics and insights:
- Platform health metrics (DAU, engagement, AI usage)
- Content performance and effectiveness
- Support metrics (resolution time, CSAT, ticket volumes, trends)

All endpoints require staff or admin role access.
"""

import logging
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.utils.permissions import verify_staff_or_admin_access

from app.services.staff.insights_service import InsightsService

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Staff Insights"])


# ------------------------------------------------------------------
# GET /platform-health
# ------------------------------------------------------------------
@router.get("/platform-health")
async def get_platform_health(
    date_from: Optional[str] = Query(None, description="Start date (ISO-8601)"),
    date_to: Optional[str] = Query(None, description="End date (ISO-8601)"),
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Platform health metrics.

    Returns daily active users, engagement rates, and AI usage
    statistics for the requested date range. Defaults to the last
    30 days when no range is supplied.
    """
    try:
        data = await InsightsService.get_platform_health(
            db, date_from=date_from, date_to=date_to
        )
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to fetch platform health metrics")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch platform health metrics.",
        ) from exc


# ------------------------------------------------------------------
# GET /content-performance
# ------------------------------------------------------------------
@router.get("/content-performance")
async def get_content_performance(
    date_from: Optional[str] = Query(None, description="Start date (ISO-8601)"),
    date_to: Optional[str] = Query(None, description="End date (ISO-8601)"),
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Content effectiveness metrics.

    Returns completion rates, average time-on-task, and engagement
    scores per content item or category.
    """
    try:
        data = await InsightsService.get_content_performance(
            db, date_from=date_from, date_to=date_to
        )
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to fetch content performance metrics")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch content performance metrics.",
        ) from exc


# ------------------------------------------------------------------
# GET /support-metrics
# ------------------------------------------------------------------
@router.get("/support-metrics")
async def get_support_metrics(
    date_from: Optional[str] = Query(None, description="Start date (ISO-8601)"),
    date_to: Optional[str] = Query(None, description="End date (ISO-8601)"),
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Support performance metrics.

    Returns average resolution time, CSAT scores, ticket volumes,
    and trend data for the requested date range.
    """
    try:
        data = await InsightsService.get_support_metrics(
            db, date_from=date_from, date_to=date_to
        )
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to fetch support metrics")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch support metrics.",
        ) from exc
