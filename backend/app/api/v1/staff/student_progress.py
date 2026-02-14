"""
Staff Student Progress API Endpoints

Provides REST endpoints for monitoring student progress:
- Overview cards for all students (or filtered by class/grade)
- Individual student progress detail
- Complete learning journey timeline
- Daily activity data

All endpoints require staff or admin role access.
"""

import logging
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.utils.permissions import verify_staff_or_admin_access

from app.services.staff.student_progress_service import StudentProgressService

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Staff Student Progress"])


# ------------------------------------------------------------------
# GET /overview
# ------------------------------------------------------------------
@router.get("/overview")
async def get_progress_overview(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    grade_level: Optional[str] = Query(None),
    class_id: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Overview cards for all students.

    Each card includes the student's name, grade level, overall
    completion percentage, and current streak. Supports filtering
    by grade_level, class_id, and text search on student name.
    """
    try:
        data = await StudentProgressService.get_overview(
            db,
            page=page,
            page_size=page_size,
            grade_level=grade_level,
            class_id=class_id,
            search=search,
        )
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to fetch student progress overview")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch student progress overview.",
        ) from exc


# ------------------------------------------------------------------
# GET /{student_id}
# ------------------------------------------------------------------
@router.get("/{student_id}")
async def get_student_progress_detail(
    student_id: str,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Detailed progress data for a specific student.

    Includes enrolment breakdown, subject-level scores, completion
    rates, and AI tutor interaction summary.
    """
    try:
        data = await StudentProgressService.get_student_detail(
            db, student_id=student_id
        )
        if data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student not found.",
            )
        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception(
            "Failed to fetch progress detail for student %s", student_id
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch student progress detail.",
        ) from exc


# ------------------------------------------------------------------
# GET /{student_id}/learning-journey
# ------------------------------------------------------------------
@router.get("/{student_id}/learning-journey")
async def get_learning_journey(
    student_id: str,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Complete learning journey for a student.

    Returns a chronological timeline of key milestones, course
    completions, assessment results, and AI tutor highlights.
    """
    try:
        data = await StudentProgressService.get_learning_journey(
            db, student_id=student_id
        )
        if data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student not found.",
            )
        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception(
            "Failed to fetch learning journey for student %s", student_id
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch learning journey.",
        ) from exc


# ------------------------------------------------------------------
# GET /{student_id}/daily-activity
# ------------------------------------------------------------------
@router.get("/{student_id}/daily-activity")
async def get_daily_activity(
    student_id: str,
    date_from: Optional[str] = Query(None, description="Start date (ISO-8601)"),
    date_to: Optional[str] = Query(None, description="End date (ISO-8601)"),
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Daily activity data for a student.

    Returns per-day login times, lessons completed, time spent,
    and AI interactions for the requested date range.
    """
    try:
        data = await StudentProgressService.get_daily_activity(
            db,
            student_id=student_id,
            date_from=date_from,
            date_to=date_to,
        )
        if data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student not found.",
            )
        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception(
            "Failed to fetch daily activity for student %s", student_id
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch daily activity.",
        ) from exc
