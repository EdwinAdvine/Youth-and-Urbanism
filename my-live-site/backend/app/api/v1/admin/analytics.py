"""
Admin Analytics API Endpoints

Admin-only endpoints for platform analytics including
dashboard summary, revenue, user growth, and course performance.
"""

from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.utils.security import get_current_user
from app.services import analytics_service


router = APIRouter(prefix="/analytics", tags=["Admin - Analytics"])


def _require_admin(user: User) -> None:
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )


@router.get(
    "/dashboard",
    status_code=status.HTTP_200_OK,
    summary="Admin dashboard summary",
    description="Get key platform metrics: users, courses, enrollments, revenue.",
)
async def dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    _require_admin(current_user)
    return await analytics_service.get_dashboard_summary(db)


@router.get(
    "/revenue",
    status_code=status.HTTP_200_OK,
    summary="Revenue metrics",
    description="Revenue time series data with optional date range filter.",
)
async def revenue_metrics(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    _require_admin(current_user)
    return await analytics_service.get_revenue_metrics(db, start_date, end_date)


@router.get(
    "/users",
    status_code=status.HTTP_200_OK,
    summary="User growth metrics",
    description="User registration trends and role breakdown.",
)
async def user_growth(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    _require_admin(current_user)
    return await analytics_service.get_user_growth(db, start_date, end_date)


@router.get(
    "/courses",
    status_code=status.HTTP_200_OK,
    summary="Course performance metrics",
    description="Top courses by enrollment and average completion rates.",
)
async def course_performance(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    _require_admin(current_user)
    return await analytics_service.get_course_performance(db)
