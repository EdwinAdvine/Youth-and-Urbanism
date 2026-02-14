"""
Staff Dashboard API Endpoints

Provides REST endpoints for the staff dashboard overview including:
- Dashboard statistics overview (open tickets, moderation queue, pending
  approvals, active sessions, unread notifications, SLA-at-risk items)
- Today's prioritised focus tasks
- AI-generated daily agenda

All endpoints require staff or admin role access.
"""

import logging
from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.utils.permissions import verify_staff_or_admin_access

from app.services.staff.dashboard_service import StaffDashboardService

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Staff Dashboard"])


# ------------------------------------------------------------------
# GET /overview
# ------------------------------------------------------------------
@router.get("/overview")
async def get_dashboard_overview(
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    High-level dashboard statistics for the staff portal.

    Returns counts for open tickets, items in the moderation queue,
    pending approvals, active live-support sessions, unread
    notifications, and SLA-at-risk tickets.
    """
    try:
        user_id = current_user.get("id") or current_user.get("user_id")
        data = await StaffDashboardService.get_overview(db, user_id=user_id)
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to fetch staff dashboard overview")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch staff dashboard overview.",
        ) from exc


# ------------------------------------------------------------------
# GET /my-focus
# ------------------------------------------------------------------
@router.get("/my-focus")
async def get_my_focus(
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Return today's prioritised tasks for the authenticated staff member.

    The list is ordered by urgency and due-time so the most important
    items appear first.
    """
    try:
        user_id = current_user.get("id") or current_user.get("user_id")
        data = await StaffDashboardService.get_my_focus(db, user_id=user_id)
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to fetch staff focus tasks")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch focus tasks.",
        ) from exc


# ------------------------------------------------------------------
# GET /ai-agenda
# ------------------------------------------------------------------
@router.get("/ai-agenda")
async def get_ai_agenda(
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    AI-prioritised daily agenda.

    Uses historical workload patterns, pending ticket urgency, and
    upcoming deadlines to produce a suggested daily schedule.
    """
    try:
        user_id = current_user.get("id") or current_user.get("user_id")
        data = await StaffDashboardService.get_ai_agenda(db, user_id=user_id)
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to generate AI agenda")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate AI agenda.",
        ) from exc
