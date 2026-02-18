"""
Instructor Dashboard API Routes

Endpoints for instructor dashboard overview and statistics.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.utils.security import get_current_user, require_role
from app.schemas.instructor.dashboard_schemas import DashboardOverviewResponse
from app.services.instructor.dashboard_service import get_dashboard_overview

router = APIRouter(prefix="/dashboard", tags=["Instructor Dashboard"])


@router.get("/overview", response_model=DashboardOverviewResponse)
async def get_instructor_dashboard(
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db)
):
    """
    Get complete instructor dashboard overview.

    Returns:
    - Dashboard statistics
    - Upcoming sessions
    - Pending submissions
    - AI-flagged students
    - Quick action suggestions
    """
    try:
        overview = await get_dashboard_overview(db, str(current_user.id))
        return overview
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
