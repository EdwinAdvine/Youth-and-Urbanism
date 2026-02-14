"""
Admin AI Monitoring API Endpoints - Phase 5 (AI Systems)

Provides REST endpoints for AI monitoring dashboards including:
- Flagged AI conversations (safety, bias, quality, hallucination)
- AI-generated content review queue
- Personalization & adaptation audits
- AI provider performance metrics
- Safety incident dashboard

All endpoints require admin or staff role access.
"""

import logging
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.utils.permissions import verify_admin_access
from app.services.admin.ai_monitoring_service import AIMonitoringService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai-monitoring", tags=["Admin - AI Monitoring"])


# ------------------------------------------------------------------
# GET /conversations/flags
# ------------------------------------------------------------------
@router.get("/conversations/flags")
async def get_conversation_flags(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    severity: Optional[str] = Query(
        None,
        description="Filter by severity: critical, high, medium, low",
    ),
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Flagged AI conversations with safety, bias, quality, and
    hallucination issues.

    Returns paginated list of flags with severity, status, and
    conversation snippets for admin review.
    """
    try:
        data = await AIMonitoringService.get_conversation_flags(
            db, page=page, page_size=page_size, severity_filter=severity,
        )
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to fetch conversation flags")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch conversation flags.",
        ) from exc


# ------------------------------------------------------------------
# GET /content/review-queue
# ------------------------------------------------------------------
@router.get("/content/review-queue")
async def get_content_review_queue(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    AI-generated content pending human review.

    Returns paginated list of generated content items (lesson summaries,
    quiz questions, learning activities, rubrics) with accuracy scores
    and review status.
    """
    try:
        data = await AIMonitoringService.get_content_review_queue(
            db, page=page, page_size=page_size,
        )
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to fetch content review queue")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch content review queue.",
        ) from exc


# ------------------------------------------------------------------
# GET /personalization/audits
# ------------------------------------------------------------------
@router.get("/personalization/audits")
async def get_personalization_audits(
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Personalization & adaptation audit data.

    Returns learning path diversity metrics, bias analysis by
    demographics, adaptation effectiveness trends, and
    over-customization flags.
    """
    try:
        data = await AIMonitoringService.get_personalization_audits(db)
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to fetch personalization audits")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch personalization audits.",
        ) from exc


# ------------------------------------------------------------------
# GET /performance/overview
# ------------------------------------------------------------------
@router.get("/performance/overview")
async def get_performance_overview(
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    AI provider performance metrics.

    Returns per-provider stats (response time, error rate, satisfaction),
    response time trends, error patterns, and latency percentiles.
    """
    try:
        data = await AIMonitoringService.get_performance_overview(db)
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to fetch performance overview")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch performance overview.",
        ) from exc


# ------------------------------------------------------------------
# GET /safety/dashboard
# ------------------------------------------------------------------
@router.get("/safety/dashboard")
async def get_safety_dashboard(
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Safety incident summary and trends.

    Returns today's safety incidents, 7-day safety trends,
    and resolution metrics.
    """
    try:
        data = await AIMonitoringService.get_safety_dashboard(db)
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to fetch safety dashboard")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch safety dashboard.",
        ) from exc
