"""
Staff Team API Endpoints

Provides REST endpoints for team management and performance:
- Individual performance metrics
- Team pulse dashboard (team leads / admins only)
- AI workload rebalancing suggestions (team leads / admins only)
- Learning resources listing
- Team members listing (team leads / admins only)

Endpoints use a mix of staff-or-admin and team-lead access checks.
"""

import logging
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.utils.permissions import verify_staff_or_admin_access, verify_team_lead

from app.services.staff.team_service import TeamService

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Staff Team"])


# ------------------------------------------------------------------
# GET /my-performance
# ------------------------------------------------------------------
@router.get("/my-performance")
async def get_my_performance(
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Performance metrics for the authenticated staff member.

    Includes tickets resolved, average resolution time, CSAT score,
    content items reviewed, and response rate.
    """
    try:
        user_id = current_user.get("id") or current_user.get("user_id")
        data = await TeamService.get_my_performance(db, user_id=user_id)
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to fetch own performance metrics")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch performance metrics.",
        ) from exc


# ------------------------------------------------------------------
# GET /pulse  (team lead / admin only)
# ------------------------------------------------------------------
@router.get("/pulse")
async def get_team_pulse(
    current_user: dict = Depends(verify_team_lead()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Team pulse dashboard.

    Returns aggregate performance metrics, workload distribution,
    and trend data for all team members. Requires department-lead
    or admin privileges.
    """
    try:
        user_id = current_user.get("id") or current_user.get("user_id")
        data = await TeamService.get_team_pulse(db, leader_id=user_id)
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to fetch team pulse")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch team pulse.",
        ) from exc


# ------------------------------------------------------------------
# POST /workload/rebalance  (team lead / admin only)
# ------------------------------------------------------------------
@router.post("/workload/rebalance")
async def rebalance_workload(
    current_user: dict = Depends(verify_team_lead()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    AI workload rebalancing suggestions.

    Analyses current ticket assignments, agent availability, and
    skill-sets to produce actionable redistribution recommendations.
    Requires department-lead or admin privileges.
    """
    try:
        leader_id = current_user.get("id") or current_user.get("user_id")
        data = await TeamService.rebalance_workload(db, leader_id=leader_id)
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to generate workload rebalancing suggestions")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate workload rebalancing suggestions.",
        ) from exc


# ------------------------------------------------------------------
# GET /learning-resources
# ------------------------------------------------------------------
@router.get("/learning-resources")
async def list_learning_resources(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category: Optional[str] = Query(None),
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    List available learning resources for staff professional development.

    Supports filtering by category.
    """
    try:
        data = await TeamService.list_learning_resources(
            db, page=page, page_size=page_size, category=category
        )
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to list learning resources")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list learning resources.",
        ) from exc


# ------------------------------------------------------------------
# GET /members  (team lead / admin only)
# ------------------------------------------------------------------
@router.get("/members")
async def list_team_members(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    department: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: dict = Depends(verify_team_lead()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    List team members with their current workload and status.

    Requires department-lead or admin privileges.
    """
    try:
        leader_id = current_user.get("id") or current_user.get("user_id")
        data = await TeamService.list_members(
            db,
            leader_id=leader_id,
            page=page,
            page_size=page_size,
            department=department,
            search=search,
        )
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to list team members")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list team members.",
        ) from exc
