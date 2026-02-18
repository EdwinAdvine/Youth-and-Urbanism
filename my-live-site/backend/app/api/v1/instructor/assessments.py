"""
Instructor Assessments API Routes

CRUD endpoints for assessments, submissions, grading, AI feedback,
rubrics, and batch operations.
"""

import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.utils.security import get_current_user, require_role
from app.schemas.instructor.assessment_schemas import (
    AssessmentCreate,
    AssessmentUpdate,
    AssessmentQuestionsUpdate,
    InstructorAssessmentResponse,
    GradeSubmission,
    BatchGradeRequest,
    AIFeedbackRequest,
    AIAssessmentGenerateRequest,
    RubricCreate,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/assessments", tags=["Instructor Assessments"])


# ── LIST ─────────────────────────────────────────────────────────────

@router.get("", response_model=dict)
async def list_assessments(
    course_id: Optional[str] = Query(None),
    assessment_type: Optional[str] = Query(None),
    is_published: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """List all assessments for the authenticated instructor with filtering."""
    from app.services.instructor.assessment_service import list_assessments as svc_list

    return await svc_list(
        db,
        instructor_id=str(current_user.id),
        course_id=course_id,
        assessment_type=assessment_type,
        is_published=is_published,
        search=search,
        page=page,
        limit=limit,
        sort_by=sort_by,
        sort_order=sort_order,
    )


# ── CREATE ───────────────────────────────────────────────────────────

@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_assessment(
    body: AssessmentCreate,
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """Create a new assessment."""
    from app.services.instructor.assessment_service import create_assessment as svc_create

    try:
        assessment = await svc_create(db, str(current_user.id), body.model_dump())
        return _assessment_response(assessment)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ── GET DETAIL ───────────────────────────────────────────────────────

@router.get("/{assessment_id}", response_model=dict)
async def get_assessment_detail(
    assessment_id: str,
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """Get detailed information for a single assessment."""
    from app.services.instructor.assessment_service import get_assessment as svc_get

    try:
        assessment = await svc_get(db, assessment_id, str(current_user.id))
        return _assessment_response(assessment)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# ── UPDATE ───────────────────────────────────────────────────────────

@router.put("/{assessment_id}", response_model=dict)
async def update_assessment(
    assessment_id: str,
    body: AssessmentUpdate,
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """Update assessment metadata."""
    from app.services.instructor.assessment_service import update_assessment as svc_update

    try:
        assessment = await svc_update(
            db, assessment_id, str(current_user.id), body.model_dump(exclude_unset=True)
        )
        return _assessment_response(assessment)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# ── DELETE ───────────────────────────────────────────────────────────

@router.delete("/{assessment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_assessment(
    assessment_id: str,
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """Delete an assessment."""
    from app.services.instructor.assessment_service import delete_assessment as svc_delete

    try:
        await svc_delete(db, assessment_id, str(current_user.id))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# ── UPDATE QUESTIONS ─────────────────────────────────────────────────

@router.put("/{assessment_id}/questions", response_model=dict)
async def update_questions(
    assessment_id: str,
    body: AssessmentQuestionsUpdate,
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """Update assessment questions."""
    from app.services.instructor.assessment_service import update_assessment as svc_update

    try:
        assessment = await svc_update(
            db, assessment_id, str(current_user.id),
            {"questions": [q.model_dump() for q in body.questions]}
        )
        return _assessment_response(assessment)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# ── SUBMISSIONS ──────────────────────────────────────────────────────

@router.get("/submissions", response_model=dict)
async def list_submissions(
    assessment_id: Optional[str] = Query(None),
    is_graded: Optional[bool] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """List submissions for the instructor's assessments."""
    from app.services.instructor.assessment_service import get_submissions as svc_subs

    return await svc_subs(
        db,
        instructor_id=str(current_user.id),
        assessment_id=assessment_id,
        is_graded=is_graded,
        status=status_filter,
        page=page,
        limit=limit,
    )


@router.get("/{assessment_id}/submissions", response_model=dict)
async def list_assessment_submissions(
    assessment_id: str,
    is_graded: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """List submissions for a specific assessment."""
    from app.services.instructor.assessment_service import get_submissions as svc_subs

    return await svc_subs(
        db,
        instructor_id=str(current_user.id),
        assessment_id=assessment_id,
        is_graded=is_graded,
        page=page,
        limit=limit,
    )


# ── GRADE ────────────────────────────────────────────────────────────

@router.post("/grade", response_model=dict)
async def grade_single_submission(
    body: GradeSubmission,
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """Grade a single submission."""
    from app.services.instructor.assessment_service import grade_submission as svc_grade

    try:
        return await svc_grade(
            db,
            submission_id=body.submission_id,
            instructor_id=str(current_user.id),
            score=int(body.score),
            feedback=body.feedback,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# ── BATCH GRADE ──────────────────────────────────────────────────────

@router.post("/batch-grade", response_model=dict)
async def batch_grade_submissions(
    body: BatchGradeRequest,
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """Batch grade multiple submissions with AI assistance."""
    from app.services.instructor.assessment_service import batch_grade as svc_batch

    return await svc_batch(
        db,
        instructor_id=str(current_user.id),
        submission_ids=body.submission_ids,
    )


# ── AI FEEDBACK ──────────────────────────────────────────────────────

@router.post("/ai-feedback", response_model=dict)
async def get_ai_feedback(
    body: AIFeedbackRequest,
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """Generate AI-powered feedback for a student answer."""
    from app.services.instructor.assessment_service import generate_ai_feedback as svc_feedback

    try:
        return await svc_feedback(
            db,
            instructor_id=str(current_user.id),
            submission_id=body.submission_id,
            question_id=body.question_id,
            student_answer=body.student_answer,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# ── AI QUESTION GENERATION ───────────────────────────────────────────

@router.post("/ai-generate", response_model=dict)
async def ai_generate_questions(
    body: AIAssessmentGenerateRequest,
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """AI-generate assessment questions based on course content."""
    from app.services.instructor.assessment_service import generate_ai_questions as svc_gen

    try:
        return await svc_gen(
            db,
            instructor_id=str(current_user.id),
            course_id=body.course_id,
            assessment_type=body.assessment_type,
            topic=body.topic,
            grade_level=body.grade_level,
            num_questions=body.num_questions,
            difficulty=body.difficulty,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ── RUBRIC ───────────────────────────────────────────────────────────

@router.post("/{assessment_id}/rubric", response_model=dict)
async def create_rubric(
    assessment_id: str,
    body: RubricCreate,
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """Create or update a rubric for an assessment."""
    from app.services.instructor.assessment_service import create_rubric as svc_rubric

    try:
        return await svc_rubric(
            db,
            instructor_id=str(current_user.id),
            assessment_id=assessment_id,
            criteria=[c.model_dump() for c in body.criteria],
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# ── EXPORT ───────────────────────────────────────────────────────────

@router.get("/export", response_model=None)
async def export_submissions(
    assessment_id: Optional[str] = Query(None),
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """Export submissions as CSV."""
    from app.services.instructor.assessment_service import export_submissions_csv as svc_export
    import io

    csv_data = await svc_export(db, str(current_user.id), assessment_id)
    return StreamingResponse(
        io.StringIO(csv_data),
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=submissions_export.csv"
        },
    )


# ── Helper ───────────────────────────────────────────────────────────

def _assessment_response(assessment) -> dict:
    """Convert an Assessment ORM object to a JSON-friendly dict."""
    return {
        "id": str(assessment.id),
        "title": assessment.title,
        "description": assessment.description,
        "assessment_type": assessment.assessment_type,
        "course_id": str(assessment.course_id),
        "creator_id": str(assessment.creator_id) if assessment.creator_id else None,
        "questions": assessment.questions or [],
        "total_points": assessment.total_points,
        "passing_score": assessment.passing_score,
        "auto_gradable": assessment.auto_gradable,
        "duration_minutes": assessment.duration_minutes,
        "max_attempts": assessment.max_attempts,
        "is_published": assessment.is_published,
        "total_submissions": assessment.total_submissions,
        "average_score": float(assessment.average_score) if assessment.average_score else 0.0,
        "created_at": assessment.created_at.isoformat() if assessment.created_at else None,
        "updated_at": assessment.updated_at.isoformat() if assessment.updated_at else None,
    }
