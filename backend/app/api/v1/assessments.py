"""
Assessment API Endpoints

CRUD operations for assessments (quizzes, assignments, exams)
and student submission handling with auto-grading.
"""

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.user import User
from app.models.student import Student
from app.utils.security import get_current_user
from app.services import assessment_service

router = APIRouter(prefix="/assessments", tags=["Assessments"])


async def _get_student_id(user: User, db: AsyncSession) -> UUID:
    """Get student record ID from user. Raises 403 if not a student."""
    if user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can perform this action",
        )
    result = await db.execute(
        select(Student).where(Student.user_id == user.id)
    )
    student = result.scalar_one_or_none()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found",
        )
    return student.id


@router.get(
    "/",
    status_code=status.HTTP_200_OK,
    summary="List assessments",
    description="Get paginated list of published assessments with optional filtering",
)
async def list_assessments(
    course_id: Optional[UUID] = Query(None, description="Filter by course"),
    assessment_type: Optional[str] = Query(None, description="Filter by type: quiz, assignment, project, exam"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """List published assessments."""
    result = await assessment_service.list_assessments(
        db, course_id=course_id, assessment_type=assessment_type, skip=skip, limit=limit
    )
    # Convert ORM objects to dicts for JSON serialization
    assessments = []
    for a in result["assessments"]:
        assessments.append({
            "id": str(a.id),
            "course_id": str(a.course_id),
            "title": a.title,
            "description": a.description,
            "assessment_type": a.assessment_type,
            "total_points": a.total_points,
            "passing_score": a.passing_score,
            "duration_minutes": a.duration_minutes,
            "max_attempts": a.max_attempts,
            "total_submissions": a.total_submissions,
            "average_score": float(a.average_score) if a.average_score else None,
            "is_published": a.is_published,
            "created_at": a.created_at.isoformat() if a.created_at else None,
        })
    return {
        "assessments": assessments,
        "total": result["total"],
        "page": result["page"],
        "page_size": result["page_size"],
    }


@router.get(
    "/{assessment_id}",
    status_code=status.HTTP_200_OK,
    summary="Get assessment with questions",
    description="Get a single assessment including its questions",
)
async def get_assessment(
    assessment_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get assessment details including questions."""
    assessment = await assessment_service.get_assessment(db, assessment_id)
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found",
        )
    return {
        "id": str(assessment.id),
        "course_id": str(assessment.course_id),
        "title": assessment.title,
        "description": assessment.description,
        "assessment_type": assessment.assessment_type,
        "questions": assessment.questions,
        "total_points": assessment.total_points,
        "passing_score": assessment.passing_score,
        "duration_minutes": assessment.duration_minutes,
        "max_attempts": assessment.max_attempts,
        "total_submissions": assessment.total_submissions,
        "is_published": assessment.is_published,
        "created_at": assessment.created_at.isoformat() if assessment.created_at else None,
    }


@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    summary="Create assessment",
    description="Create a new assessment (instructor or admin only)",
)
async def create_assessment(
    data: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new assessment. Only instructors and admins."""
    if current_user.role not in ("instructor", "admin", "external_instructor"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only instructors and admins can create assessments",
        )

    try:
        assessment = await assessment_service.create_assessment(
            db, creator_id=current_user.id, data=data
        )
        return {
            "id": str(assessment.id),
            "title": assessment.title,
            "assessment_type": assessment.assessment_type,
            "message": "Assessment created successfully",
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post(
    "/{assessment_id}/submit",
    status_code=status.HTTP_201_CREATED,
    summary="Submit assessment answers",
    description="Submit answers for an assessment. Auto-grades if applicable.",
)
async def submit_assessment(
    assessment_id: UUID,
    data: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Submit answers for an assessment."""
    student_id = await _get_student_id(current_user, db)

    try:
        submission = await assessment_service.submit_assessment(
            db,
            assessment_id=assessment_id,
            student_id=student_id,
            answers=data.get("answers", {}),
        )
        return {
            "id": str(submission.id),
            "assessment_id": str(submission.assessment_id),
            "score": submission.score,
            "is_graded": submission.is_graded,
            "attempt_number": submission.attempt_number,
            "submitted_at": submission.submitted_at.isoformat() if submission.submitted_at else None,
            "message": "Assessment submitted successfully",
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get(
    "/{assessment_id}/submissions",
    status_code=status.HTTP_200_OK,
    summary="Get student submissions",
    description="Get the current student's submissions for an assessment",
)
async def get_submissions(
    assessment_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get student's submissions for an assessment."""
    student_id = await _get_student_id(current_user, db)

    submissions = await assessment_service.get_student_submissions(
        db, student_id=student_id, assessment_id=assessment_id
    )
    return [
        {
            "id": str(s.id),
            "assessment_id": str(s.assessment_id),
            "score": s.score,
            "is_graded": s.is_graded,
            "attempt_number": s.attempt_number,
            "answers": s.answers,
            "feedback": s.feedback,
            "submitted_at": s.submitted_at.isoformat() if s.submitted_at else None,
        }
        for s in submissions
    ]
