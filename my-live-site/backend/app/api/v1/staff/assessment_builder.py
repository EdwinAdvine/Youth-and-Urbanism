"""
Staff Assessment Builder API Endpoints

Provides REST endpoints for creating and managing assessments:
- CRUD operations on assessments
- Question management (add, update, delete)
- Adaptive question selection (AI-driven next-question logic)
- AI-powered response grading

All endpoints require staff or admin role access.
"""

import logging
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.utils.permissions import verify_staff_or_admin_access

from app.services.staff.assessment_builder_service import AssessmentBuilderService

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Staff Assessments"])


# ------------------------------------------------------------------
# Pydantic request models
# ------------------------------------------------------------------
class CreateAssessmentRequest(BaseModel):
    """Payload for creating an assessment."""
    title: str
    description: Optional[str] = None
    assessment_type: str  # 'quiz' | 'assignment' | 'project' | 'exam'
    grade_level: Optional[str] = None
    subject: Optional[str] = None
    time_limit_minutes: Optional[int] = None
    passing_score: Optional[float] = None
    is_adaptive: bool = False
    metadata: Optional[Dict[str, Any]] = None


class UpdateAssessmentRequest(BaseModel):
    """Payload for updating an assessment."""
    title: Optional[str] = None
    description: Optional[str] = None
    assessment_type: Optional[str] = None
    grade_level: Optional[str] = None
    subject: Optional[str] = None
    time_limit_minutes: Optional[int] = None
    passing_score: Optional[float] = None
    is_adaptive: Optional[bool] = None
    metadata: Optional[Dict[str, Any]] = None


class AddQuestionRequest(BaseModel):
    """Payload for adding a question to an assessment."""
    question_text: str
    question_type: str  # 'multiple_choice' | 'short_answer' | 'essay' | 'true_false'
    options: Optional[List[Dict[str, Any]]] = None
    correct_answer: Optional[str] = None
    points: float = 1.0
    difficulty: Optional[str] = "medium"
    explanation: Optional[str] = None
    tags: Optional[List[str]] = None


class UpdateQuestionRequest(BaseModel):
    """Payload for updating an existing question."""
    question_text: Optional[str] = None
    question_type: Optional[str] = None
    options: Optional[List[Dict[str, Any]]] = None
    correct_answer: Optional[str] = None
    points: Optional[float] = None
    difficulty: Optional[str] = None
    explanation: Optional[str] = None
    tags: Optional[List[str]] = None


class AdaptiveNextRequest(BaseModel):
    """Context for selecting the next adaptive question."""
    student_id: str
    answers_so_far: Optional[List[Dict[str, Any]]] = None


class GradeResponseRequest(BaseModel):
    """Payload for AI-grading a student response."""
    student_id: str
    response_text: str
    rubric: Optional[str] = None


# ------------------------------------------------------------------
# GET /
# ------------------------------------------------------------------
@router.get("/")
async def list_assessments(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    assessment_type: Optional[str] = Query(None),
    grade_level: Optional[str] = Query(None),
    subject: Optional[str] = Query(None),
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Paginated list of assessments.

    Supports filtering by assessment_type, grade_level, and subject.
    """
    try:
        data = await AssessmentBuilderService.list_assessments(
            db,
            page=page,
            page_size=page_size,
            assessment_type=assessment_type,
            grade_level=grade_level,
            subject=subject,
        )
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to list assessments")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list assessments.",
        ) from exc


# ------------------------------------------------------------------
# GET /{assessment_id}
# ------------------------------------------------------------------
@router.get("/{assessment_id}")
async def get_assessment(
    assessment_id: str,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Retrieve a single assessment with its questions."""
    try:
        data = await AssessmentBuilderService.get_assessment(
            db, assessment_id=assessment_id
        )
        if data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assessment not found.",
            )
        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to fetch assessment %s", assessment_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch assessment.",
        ) from exc


# ------------------------------------------------------------------
# POST /
# ------------------------------------------------------------------
@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_assessment(
    body: CreateAssessmentRequest,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Create a new assessment."""
    try:
        creator_id = current_user.get("id") or current_user.get("user_id")
        data = await AssessmentBuilderService.create_assessment(
            db,
            creator_id=creator_id,
            title=body.title,
            description=body.description,
            assessment_type=body.assessment_type,
            grade_level=body.grade_level,
            subject=body.subject,
            time_limit_minutes=body.time_limit_minutes,
            passing_score=body.passing_score,
            is_adaptive=body.is_adaptive,
            metadata=body.metadata,
        )
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to create assessment")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create assessment.",
        ) from exc


# ------------------------------------------------------------------
# PATCH /{assessment_id}
# ------------------------------------------------------------------
@router.patch("/{assessment_id}")
async def update_assessment(
    assessment_id: str,
    body: UpdateAssessmentRequest,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Update an existing assessment."""
    try:
        updates = body.model_dump(exclude_unset=True)
        data = await AssessmentBuilderService.update_assessment(
            db, assessment_id=assessment_id, updates=updates
        )
        if data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assessment not found.",
            )
        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to update assessment %s", assessment_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update assessment.",
        ) from exc


# ------------------------------------------------------------------
# DELETE /{assessment_id}
# ------------------------------------------------------------------
@router.delete("/{assessment_id}")
async def delete_assessment(
    assessment_id: str,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Delete (soft-delete) an assessment."""
    try:
        success = await AssessmentBuilderService.delete_assessment(
            db, assessment_id=assessment_id
        )
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assessment not found.",
            )
        return {"status": "success", "message": "Assessment deleted."}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to delete assessment %s", assessment_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete assessment.",
        ) from exc


# ------------------------------------------------------------------
# POST /{assessment_id}/questions
# ------------------------------------------------------------------
@router.post(
    "/{assessment_id}/questions",
    status_code=status.HTTP_201_CREATED,
)
async def add_question(
    assessment_id: str,
    body: AddQuestionRequest,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Add a question to an assessment."""
    try:
        data = await AssessmentBuilderService.add_question(
            db,
            assessment_id=assessment_id,
            question_text=body.question_text,
            question_type=body.question_type,
            options=body.options,
            correct_answer=body.correct_answer,
            points=body.points,
            difficulty=body.difficulty,
            explanation=body.explanation,
            tags=body.tags,
        )
        if data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assessment not found.",
            )
        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception(
            "Failed to add question to assessment %s", assessment_id
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add question.",
        ) from exc


# ------------------------------------------------------------------
# PATCH /questions/{question_id}
# ------------------------------------------------------------------
@router.patch("/questions/{question_id}")
async def update_question(
    question_id: str,
    body: UpdateQuestionRequest,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Update an existing question."""
    try:
        updates = body.model_dump(exclude_unset=True)
        data = await AssessmentBuilderService.update_question(
            db, question_id=question_id, updates=updates
        )
        if data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Question not found.",
            )
        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to update question %s", question_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update question.",
        ) from exc


# ------------------------------------------------------------------
# DELETE /questions/{question_id}
# ------------------------------------------------------------------
@router.delete("/questions/{question_id}")
async def delete_question(
    question_id: str,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Delete a question from an assessment."""
    try:
        success = await AssessmentBuilderService.delete_question(
            db, question_id=question_id
        )
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Question not found.",
            )
        return {"status": "success", "message": "Question deleted."}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to delete question %s", question_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete question.",
        ) from exc


# ------------------------------------------------------------------
# POST /{assessment_id}/adaptive/next
# ------------------------------------------------------------------
@router.post("/{assessment_id}/adaptive/next")
async def get_next_adaptive_question(
    assessment_id: str,
    body: AdaptiveNextRequest,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Get the next adaptive question for a student.

    Uses the student's performance on previous answers to select an
    appropriately difficulty-calibrated question.
    """
    try:
        data = await AssessmentBuilderService.get_next_adaptive_question(
            db,
            assessment_id=assessment_id,
            student_id=body.student_id,
            answers_so_far=body.answers_so_far,
        )
        if data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assessment not found or no more questions available.",
            )
        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception(
            "Failed to get adaptive question for assessment %s", assessment_id
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get next adaptive question.",
        ) from exc


# ------------------------------------------------------------------
# POST /questions/{question_id}/grade
# ------------------------------------------------------------------
@router.post("/questions/{question_id}/grade")
async def ai_grade_response(
    question_id: str,
    body: GradeResponseRequest,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    AI-grade a student's response to a question.

    Returns a score, feedback, and confidence level.
    """
    try:
        data = await AssessmentBuilderService.grade_response(
            db,
            question_id=question_id,
            student_id=body.student_id,
            response_text=body.response_text,
            rubric=body.rubric,
        )
        if data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Question not found.",
            )
        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to grade response for question %s", question_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to grade response.",
        ) from exc
