"""
Student Mastery API Routes

Endpoints for topic-level mastery tracking, spaced repetition reviews,
and daily session usage statistics. Used by the frontend to display
mastery progress widgets and session timers.
"""
import logging
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, List, Optional
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

from app.database import get_db
from app.models.user import User
from app.services.student.mastery_service import StudentMasteryService
from app.services.student.session_limit_service import StudentSessionLimitService
from app.utils.security import get_current_user


router = APIRouter(prefix="/student/mastery", tags=["Student Mastery"])


# Pydantic schemas
class RecordAttemptRequest(BaseModel):
    """Request body for recording a mastery attempt."""
    topic_name: str
    subject: str
    score: float = Field(..., ge=0.0, le=1.0, description="Score from 0.0 to 1.0")
    time_spent_seconds: int = Field(0, ge=0)


def _get_student_id(user: User):
    """Extract student_id from authenticated user, raising 403 if not a student."""
    if user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access this endpoint",
        )
    student_profile = getattr(user, 'student_profile', None)
    student_id = getattr(user, 'student_id', None) or (student_profile.id if student_profile else None)
    if not student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student profile not found",
        )
    return student_id


@router.get("")
async def get_mastery_status(
    subject: Optional[str] = Query(None, description="Filter by subject"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> List[Dict]:
    """Get mastery records for all subjects or a specific subject."""
    student_id = _get_student_id(current_user)
    service = StudentMasteryService(db)
    return await service.get_mastery_status(student_id, subject=subject)


@router.get("/due-reviews")
async def get_due_reviews(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> List[Dict]:
    """Get topics due for spaced repetition review."""
    student_id = _get_student_id(current_user)
    service = StudentMasteryService(db)
    return await service.get_due_reviews(student_id)


@router.get("/gate/{topic_name}")
async def check_mastery_gate(
    topic_name: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Dict:
    """Check if the student can advance past a topic."""
    student_id = _get_student_id(current_user)
    service = StudentMasteryService(db)
    return await service.check_mastery_gate(student_id, topic_name)


@router.post("/attempt")
async def record_attempt(
    request: RecordAttemptRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Dict:
    """Record a mastery attempt for a topic."""
    student_id = _get_student_id(current_user)
    student_profile = current_user.student_profile
    service = StudentMasteryService(db)

    record = await service.record_attempt(
        student_id=student_id,
        topic_name=request.topic_name,
        subject=request.subject,
        grade_level=student_profile.grade_level if student_profile else "Unknown",
        score=request.score,
        time_spent_seconds=request.time_spent_seconds,
    )
    return {
        "id": str(record.id),
        "topic_name": record.topic_name,
        "mastery_level": record.mastery_level,
        "is_mastered": record.is_mastered,
        "consecutive_correct": record.consecutive_correct,
        "next_review_date": record.next_review_date.isoformat() if record.next_review_date else None,
    }


@router.get("/session-stats")
async def get_session_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Dict:
    """Get today's AI session usage statistics."""
    student_id = _get_student_id(current_user)
    service = StudentSessionLimitService(db)
    return await service.get_daily_stats(student_id)


@router.post("/session-break")
async def log_break(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Dict:
    """Record that the student took a break."""
    student_id = _get_student_id(current_user)
    service = StudentSessionLimitService(db)
    return await service.log_break(student_id)
