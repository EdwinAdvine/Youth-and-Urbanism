"""
Student Dashboard API Routes

Provides the student's daily dashboard experience including time-adaptive
greetings, AI-generated daily plans, mood check-ins, learning streaks,
daily quotes, and XP/level progression data.
"""
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, List, Optional
from uuid import UUID
from pydantic import BaseModel

logger = logging.getLogger(__name__)

from app.database import get_db
from app.models.user import User
from app.models.student_dashboard import MoodType
from app.services.student.dashboard_service import DashboardService
from app.utils.security import get_current_user


router = APIRouter(prefix="/student/dashboard", tags=["Student Dashboard"])


# Pydantic schemas
class MoodCheckInRequest(BaseModel):
    """Request body for submitting a student mood check-in."""
    mood_type: MoodType
    energy_level: int  # 1-5 scale
    note: Optional[str] = None


class DailyPlanUpdateRequest(BaseModel):
    """Request body for reordering or marking items complete in the daily plan."""
    items: List[Dict]


# API Endpoints
@router.get("/today")
async def get_today_dashboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    """
    Get comprehensive dashboard data for today

    Returns:
    - Time-adaptive greeting
    - AI-generated daily plan
    - Current streak
    - Latest mood check-in
    - Urgent items
    - Daily quote
    - XP and level data
    """
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access this endpoint"
        )

    if not current_user.student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student profile not found"
        )

    service = DashboardService(db)

    try:
        dashboard_data = await service.get_today_dashboard(current_user.student_id)
        return dashboard_data
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found"
        )
    except Exception as e:
        logger.error(f"Failed to fetch dashboard for student {current_user.student_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load dashboard data"
        )


@router.post("/mood")
async def submit_mood_check_in(
    request: MoodCheckInRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    """
    Submit mood check-in

    Body:
    - mood_type: happy | okay | tired | frustrated | excited
    - energy_level: 1-5
    - note: Optional note about mood
    """
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can submit mood check-ins"
        )

    if not current_user.student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student profile not found"
        )

    # Validate energy level
    if request.energy_level < 1 or request.energy_level > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Energy level must be between 1 and 5"
        )

    service = DashboardService(db)

    try:
        mood_entry = await service.submit_mood_check_in(
            student_id=current_user.student_id,
            mood_type=request.mood_type,
            energy_level=request.energy_level,
            note=request.note
        )

        return {
            "id": str(mood_entry.id),
            "mood_type": mood_entry.mood_type.value,
            "energy_level": mood_entry.energy_level,
            "note": mood_entry.note,
            "timestamp": mood_entry.timestamp,
            "message": "Mood check-in saved successfully"
        }
    except Exception as e:
        logger.error(f"Failed to save mood check-in for student {current_user.student_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save mood check-in"
        )


@router.get("/teacher-sync")
async def get_teacher_sync_notes(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> List[Dict]:
    """
    Get teacher notes integrated into student's daily plan

    Returns list of teacher-added notes/tasks for the student
    """
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access this endpoint"
        )

    if not current_user.student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student profile not found"
        )

    service = DashboardService(db)

    try:
        notes = await service.get_teacher_sync_notes(current_user.student_id)
        return notes
    except Exception as e:
        logger.error(f"Failed to fetch teacher notes for student {current_user.student_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch teacher notes"
        )


@router.get("/quote")
async def get_daily_quote(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    """
    Get daily quote/micro-lesson

    Returns age-appropriate inspirational quote
    """
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access this endpoint"
        )

    # Get student's grade level
    from app.models.student import Student
    from sqlalchemy import select

    result = await db.execute(
        select(Student).where(Student.id == current_user.student_id)
    )
    student = result.scalar_one_or_none()

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found"
        )

    service = DashboardService(db)

    try:
        quote = await service._get_daily_quote(student.grade_level)
        return quote
    except Exception as e:
        logger.error(f"Failed to fetch daily quote: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch daily quote"
        )


@router.put("/daily-plan")
async def update_daily_plan(
    request: DailyPlanUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    """
    Update daily plan (drag-drop reorder, mark complete, etc.)

    Body:
    - items: Updated list of plan items
    """
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can update their daily plan"
        )

    if not current_user.student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student profile not found"
        )

    service = DashboardService(db)

    try:
        updated_plan = await service.update_daily_plan(
            student_id=current_user.student_id,
            plan_items=request.items
        )

        return {
            "date": updated_plan.date,
            "items": updated_plan.items,
            "manually_edited": updated_plan.manually_edited,
            "message": "Daily plan updated successfully"
        }
    except Exception as e:
        logger.error(f"Failed to update daily plan for student {current_user.student_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update daily plan"
        )
