"""
Partner Dashboard API Endpoints

Provides REST endpoints for the partner dashboard overview including:
- Dashboard statistics overview (sponsored children, active programs,
  budget utilisation, impact metrics)
- AI-generated daily highlights and recommendations

All endpoints require partner or admin role access.
"""

import logging
from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.utils.permissions import verify_partner_or_admin_access

from app.services.partner.partner_service import PartnerDashboardService
from app.services.partner.partner_ai_service import PartnerAIService

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Partner - Dashboard"])


# ------------------------------------------------------------------
# GET /overview
# ------------------------------------------------------------------
@router.get("/overview")
async def get_dashboard_overview(
    current_user: dict = Depends(verify_partner_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    High-level dashboard statistics for the partner portal.

    Returns counts for sponsored children, active programs, total
    investment, budget utilisation, impact score, and recent activity.
    """
    try:
        user_id = current_user.get("id") or current_user.get("user_id")
        data = await PartnerDashboardService.get_overview(db, user_id=user_id)
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to fetch partner dashboard overview")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch partner dashboard overview.",
        ) from exc


# ------------------------------------------------------------------
# GET /ai-highlights
# ------------------------------------------------------------------
@router.get("/ai-highlights")
async def get_ai_highlights(
    current_user: dict = Depends(verify_partner_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    AI-generated daily highlights and recommendations.

    Uses sponsorship data, student performance trends, and budget
    patterns to produce actionable insights for the partner.
    """
    try:
        user_id = current_user.get("id") or current_user.get("user_id")
        data = await PartnerAIService.get_daily_highlights(db, user_id=user_id)
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to generate AI highlights")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate AI highlights.",
        ) from exc
