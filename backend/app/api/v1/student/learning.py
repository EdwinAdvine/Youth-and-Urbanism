"""
Student Learning API Routes - Courses, Enrollments, Live Sessions, Assessments
"""
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from typing import Dict, List, Optional
from uuid import UUID
from pydantic import BaseModel

from app.database import get_db
from app.models.user import User
from app.models.assessment import Assessment, AssessmentSubmission
from app.models.enrollment import Enrollment
from app.models.course import Course
from app.services.student.learning_service import LearningService
from app.utils.security import get_current_user


router = APIRouter(prefix="/student/learning", tags=["Student Learning"])
assessments_router = APIRouter(prefix="/student/assessments", tags=["Student Assessments"])


# Pydantic schemas
class WishlistRequest(BaseModel):
    course_id: str


# API Endpoints
@router.get("/courses/enrolled")
async def get_enrolled_courses(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> List[Dict]:
    """
    Get student's enrolled courses with progress
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

    service = LearningService(db)

    try:
        courses = await service.get_enrolled_courses(current_user.student_id)
        return courses
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch enrolled courses: {str(e)}"
        )


@router.get("/courses/recommended")
async def get_ai_recommended_courses(
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> List[Dict]:
    """
    Get AI-recommended courses based on student profile

    Query params:
    - limit: Number of recommendations (default: 10)
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

    service = LearningService(db)

    try:
        courses = await service.get_ai_recommended_courses(
            student_id=current_user.student_id,
            limit=limit
        )
        return courses
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get recommendations: {str(e)}"
        )


@router.get("/browse")
async def browse_courses(
    search: Optional[str] = None,
    subject: Optional[str] = None,
    sort_by: str = "popular",
    limit: int = 20,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    """
    Browse course marketplace filtered to student's grade level.

    Query params:
    - search: Search query (title/description)
    - subject: Filter by subject/learning area
    - sort_by: Sort method (popular, rating, newest, price_low, price_high)
    - limit: Results per page (default: 20)
    - offset: Pagination offset (default: 0)

    Grade is automatically applied from the student's profile.
    Teacher-only courses (Teacher's Guide, Diploma) are excluded.
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

    if sort_by not in ["popular", "rating", "newest", "price_low", "price_high"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid sort_by parameter"
        )

    service = LearningService(db)

    try:
        result = await service.browse_courses(
            student_id=current_user.student_id,
            search=search,
            subject=subject,
            sort_by=sort_by,
            limit=limit,
            offset=offset
        )
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to browse courses: {str(e)}"
        )


@router.get("/course/{course_id}/preview")
async def get_course_preview(
    course_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    """
    Get detailed course preview
    """
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access this endpoint"
        )

    service = LearningService(db)

    try:
        course_uuid = UUID(course_id)
        preview = await service.get_course_preview(course_uuid)
        return preview
    except ValueError as e:
        if "badly formed hexadecimal UUID string" in str(e):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid course ID format"
            )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get course preview: {str(e)}"
        )


@router.get("/wishlist/ids")
async def get_wishlist_ids(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> List[str]:
    """
    Get the list of course IDs in the student's wishlist.
    Lightweight endpoint for populating heart-icon state on course listings.
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
    service = LearningService(db)
    try:
        return await service.get_wishlist_ids(current_user.student_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch wishlist IDs: {str(e)}"
        )


@router.get("/wishlist")
async def get_wishlist(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> List[Dict]:
    """
    Get student's course wishlist
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

    service = LearningService(db)

    try:
        wishlist = await service.get_wishlist(current_user.student_id)
        return wishlist
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch wishlist: {str(e)}"
        )


@router.post("/wishlist")
async def add_to_wishlist(
    request: WishlistRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    """
    Add course to wishlist

    Body:
    - course_id: Course UUID
    """
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can add to wishlist"
        )

    if not current_user.student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student profile not found"
        )

    service = LearningService(db)

    try:
        course_uuid = UUID(request.course_id)
        wishlist_item = await service.add_to_wishlist(
            student_id=current_user.student_id,
            course_id=course_uuid
        )

        return {
            "id": str(wishlist_item.id),
            "course_id": str(wishlist_item.course_id),
            "added_at": wishlist_item.added_at,
            "message": "Course added to wishlist"
        }
    except ValueError as e:
        if "badly formed hexadecimal UUID string" in str(e):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid course ID format"
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add to wishlist: {str(e)}"
        )


@router.delete("/wishlist/{course_id}")
async def remove_from_wishlist(
    course_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    """
    Remove course from wishlist
    """
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can modify wishlist"
        )

    if not current_user.student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student profile not found"
        )

    service = LearningService(db)

    try:
        course_uuid = UUID(course_id)
        removed = await service.remove_from_wishlist(
            student_id=current_user.student_id,
            course_id=course_uuid
        )

        if not removed:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found in wishlist"
            )

        return {"message": "Course removed from wishlist"}
    except ValueError as e:
        if "badly formed hexadecimal UUID string" in str(e):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid course ID format"
            )
        raise
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to remove from wishlist: {str(e)}"
        )


@router.get("/live-sessions/upcoming")
async def get_upcoming_live_sessions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> List[Dict]:
    """
    Get student's upcoming live sessions
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

    service = LearningService(db)

    try:
        sessions = await service.get_upcoming_live_sessions(current_user.student_id)
        return sessions
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch live sessions: {str(e)}"
        )


@router.get("/session/{session_id}/prep")
async def get_session_prep(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    """
    Get AI-generated session preparation tips
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

    service = LearningService(db)

    try:
        session_uuid = UUID(session_id)
        prep = await service.generate_session_prep(
            student_id=current_user.student_id,
            session_id=session_uuid
        )

        return {
            "id": str(prep.id),
            "session_id": str(prep.session_id),
            "tips": prep.tips,
            "engagement_prediction": prep.engagement_prediction,
            "created_at": prep.created_at
        }
    except ValueError as e:
        if "badly formed hexadecimal UUID string" in str(e):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid session ID format"
            )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate session prep: {str(e)}"
        )


# ── Shared helper ─────────────────────────────────────────────────────────────

async def _get_student_enrolled_course_ids(db: AsyncSession, student_id: UUID) -> List[UUID]:
    """Return course UUIDs the student is actively enrolled in."""
    result = await db.execute(
        select(Enrollment.course_id).where(
            and_(
                Enrollment.student_id == student_id,
                Enrollment.is_deleted == False
            )
        )
    )
    return [row[0] for row in result.all()]


async def _get_submitted_assessment_ids(db: AsyncSession, student_id: UUID) -> set:
    """Return set of assessment UUIDs the student has submitted."""
    result = await db.execute(
        select(AssessmentSubmission.assessment_id).where(
            and_(
                AssessmentSubmission.student_id == student_id,
                AssessmentSubmission.is_submitted == True
            )
        )
    )
    return {row[0] for row in result.all()}


def _assessment_to_dict(assessment: Assessment, course: Course) -> Dict:
    return {
        "id": str(assessment.id),
        "title": assessment.title,
        "description": assessment.description,
        "assessment_type": assessment.assessment_type,
        "course_id": str(assessment.course_id),
        "course_title": course.title if course else "",
        "subject": course.learning_area if course else "",
        "total_points": assessment.total_points,
        "duration_minutes": assessment.duration_minutes,
        "available_until": assessment.available_until,
        "available_from": assessment.available_from,
    }


# ── Assessment endpoints ──────────────────────────────────────────────────────

@assessments_router.get("/due-soon")
async def get_assessments_due_soon(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> List[Dict]:
    """Assessments due within the next 72 hours that the student hasn't submitted."""
    if current_user.role != "student":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Students only")
    if not current_user.student_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Student profile not found")

    enrolled_ids = await _get_student_enrolled_course_ids(db, current_user.student_id)
    if not enrolled_ids:
        return []

    submitted_ids = await _get_submitted_assessment_ids(db, current_user.student_id)
    now = datetime.utcnow()
    deadline = now + timedelta(hours=72)

    result = await db.execute(
        select(Assessment, Course)
        .join(Course, Assessment.course_id == Course.id)
        .where(
            and_(
                Assessment.course_id.in_(enrolled_ids),
                Assessment.is_published == True,
                Assessment.available_until != None,
                Assessment.available_until >= now,
                Assessment.available_until <= deadline,
            )
        )
        .order_by(Assessment.available_until.asc())
    )
    rows = result.all()

    output = []
    for assessment, course in rows:
        if assessment.id in submitted_ids:
            continue
        d = _assessment_to_dict(assessment, course)
        if assessment.available_until:
            hours_left = (assessment.available_until - now).total_seconds() / 3600
            if hours_left < 1:
                d["due_in"] = "< 1 hour"
            elif hours_left < 24:
                d["due_in"] = f"{int(hours_left)} hours"
            else:
                d["due_in"] = f"{int(hours_left / 24)} day{'s' if hours_left >= 48 else ''}"
            d["urgent"] = hours_left < 4
        output.append(d)
    return output


@assessments_router.get("/pending")
async def get_pending_assessments(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> List[Dict]:
    """All published assessments for enrolled courses that the student hasn't submitted."""
    if current_user.role != "student":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Students only")
    if not current_user.student_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Student profile not found")

    enrolled_ids = await _get_student_enrolled_course_ids(db, current_user.student_id)
    if not enrolled_ids:
        return []

    submitted_ids = await _get_submitted_assessment_ids(db, current_user.student_id)
    now = datetime.utcnow()

    result = await db.execute(
        select(Assessment, Course)
        .join(Course, Assessment.course_id == Course.id)
        .where(
            and_(
                Assessment.course_id.in_(enrolled_ids),
                Assessment.is_published == True,
                or_(
                    Assessment.available_until == None,
                    Assessment.available_until >= now
                )
            )
        )
        .order_by(Assessment.available_until.asc().nullslast())
    )
    rows = result.all()

    return [
        _assessment_to_dict(a, c)
        for a, c in rows
        if a.id not in submitted_ids
    ]


@assessments_router.get("/submitted")
async def get_submitted_assessments(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> List[Dict]:
    """Assessments the student has submitted, with grading status."""
    if current_user.role != "student":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Students only")
    if not current_user.student_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Student profile not found")

    result = await db.execute(
        select(AssessmentSubmission, Assessment, Course)
        .join(Assessment, AssessmentSubmission.assessment_id == Assessment.id)
        .join(Course, Assessment.course_id == Course.id)
        .where(
            and_(
                AssessmentSubmission.student_id == current_user.student_id,
                AssessmentSubmission.is_submitted == True
            )
        )
        .order_by(AssessmentSubmission.submitted_at.desc())
        .limit(30)
    )
    rows = result.all()

    output = []
    for submission, assessment, course in rows:
        d = _assessment_to_dict(assessment, course)
        d.update({
            "submission_id": str(submission.id),
            "submitted_at": submission.submitted_at,
            "is_graded": submission.is_graded,
            "score": submission.score,
            "status": "graded" if submission.is_graded else "pending_review",
        })
        output.append(d)
    return output


@assessments_router.get("/feedback")
async def get_assessment_feedback(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> List[Dict]:
    """Graded assessments with teacher feedback."""
    if current_user.role != "student":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Students only")
    if not current_user.student_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Student profile not found")

    result = await db.execute(
        select(AssessmentSubmission, Assessment, Course)
        .join(Assessment, AssessmentSubmission.assessment_id == Assessment.id)
        .join(Course, Assessment.course_id == Course.id)
        .where(
            and_(
                AssessmentSubmission.student_id == current_user.student_id,
                AssessmentSubmission.is_submitted == True,
                AssessmentSubmission.is_graded == True
            )
        )
        .order_by(AssessmentSubmission.graded_at.desc())
        .limit(20)
    )
    rows = result.all()

    output = []
    for submission, assessment, course in rows:
        d = _assessment_to_dict(assessment, course)
        d.update({
            "submission_id": str(submission.id),
            "submitted_at": submission.submitted_at,
            "graded_at": submission.graded_at,
            "score": submission.score,
            "total_points": assessment.total_points,
            "feedback": submission.feedback,
            "passed": (submission.score or 0) >= assessment.passing_score,
        })
        output.append(d)
    return output


# ── Quiz endpoints ────────────────────────────────────────────────────────────

@assessments_router.get("/quizzes/upcoming")
async def get_upcoming_quizzes(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> List[Dict]:
    """Upcoming quiz/exam assessments for enrolled courses that haven't been submitted."""
    if current_user.role != "student":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Students only")
    if not current_user.student_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Student profile not found")

    enrolled_ids = await _get_student_enrolled_course_ids(db, current_user.student_id)
    if not enrolled_ids:
        return []

    submitted_ids = await _get_submitted_assessment_ids(db, current_user.student_id)
    now = datetime.utcnow()

    result = await db.execute(
        select(Assessment, Course)
        .join(Course, Assessment.course_id == Course.id)
        .where(
            and_(
                Assessment.course_id.in_(enrolled_ids),
                Assessment.is_published == True,
                Assessment.assessment_type.in_(["quiz", "exam"]),
                or_(
                    Assessment.available_until == None,
                    Assessment.available_until >= now
                )
            )
        )
        .order_by(Assessment.available_until.asc().nullslast())
    )
    rows = result.all()

    output = []
    for assessment, course in rows:
        if assessment.id in submitted_ids:
            continue
        d = _assessment_to_dict(assessment, course)
        d["can_start"] = bool(
            assessment.available_from is None or assessment.available_from <= now
        )
        output.append(d)
    return output


@assessments_router.get("/quizzes/results")
async def get_quiz_results(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> List[Dict]:
    """Submitted quiz/exam assessments with scores."""
    if current_user.role != "student":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Students only")
    if not current_user.student_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Student profile not found")

    result = await db.execute(
        select(AssessmentSubmission, Assessment, Course)
        .join(Assessment, AssessmentSubmission.assessment_id == Assessment.id)
        .join(Course, Assessment.course_id == Course.id)
        .where(
            and_(
                AssessmentSubmission.student_id == current_user.student_id,
                AssessmentSubmission.is_submitted == True,
                Assessment.assessment_type.in_(["quiz", "exam"])
            )
        )
        .order_by(AssessmentSubmission.submitted_at.desc())
        .limit(30)
    )
    rows = result.all()

    output = []
    for submission, assessment, course in rows:
        total = assessment.total_points or 1
        score = submission.score or 0
        d = _assessment_to_dict(assessment, course)
        d.update({
            "submission_id": str(submission.id),
            "submitted_at": submission.submitted_at,
            "score": score,
            "percentage": round((score / total) * 100),
            "is_graded": submission.is_graded,
            "passed": score >= (assessment.passing_score or 0),
        })
        output.append(d)
    return output


@assessments_router.get("/quizzes/skill-reports")
async def get_quiz_skill_reports(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> List[Dict]:
    """Aggregate quiz scores by subject/learning_area."""
    if current_user.role != "student":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Students only")
    if not current_user.student_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Student profile not found")

    result = await db.execute(
        select(AssessmentSubmission, Assessment, Course)
        .join(Assessment, AssessmentSubmission.assessment_id == Assessment.id)
        .join(Course, Assessment.course_id == Course.id)
        .where(
            and_(
                AssessmentSubmission.student_id == current_user.student_id,
                AssessmentSubmission.is_submitted == True,
                AssessmentSubmission.is_graded == True,
                Assessment.assessment_type.in_(["quiz", "exam"])
            )
        )
        .order_by(AssessmentSubmission.submitted_at.asc())
    )
    rows = result.all()

    area_data: Dict[str, List[float]] = {}
    for submission, assessment, course in rows:
        area = course.learning_area or "General"
        total = assessment.total_points or 1
        pct = round(((submission.score or 0) / total) * 100)
        area_data.setdefault(area, []).append(pct)

    output = []
    for area, scores in area_data.items():
        avg = round(sum(scores) / len(scores))
        half = max(1, len(scores) // 2)
        first_avg = sum(scores[:half]) / half
        second_avg = sum(scores[half:]) / max(1, len(scores) - half) if len(scores) > 1 else first_avg
        if second_avg > first_avg + 5:
            trend = "up"
        elif second_avg < first_avg - 5:
            trend = "down"
        else:
            trend = "stable"
        output.append({
            "subject": area,
            "average_score": avg,
            "quizzes_taken": len(scores),
            "trend": trend,
        })

    output.sort(key=lambda x: x["average_score"], reverse=True)
    return output


@assessments_router.get("/quizzes/practice")
async def get_practice_questions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> List[Dict]:
    """Random practice questions from quiz assessments in enrolled courses."""
    import random
    if current_user.role != "student":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Students only")
    if not current_user.student_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Student profile not found")

    enrolled_ids = await _get_student_enrolled_course_ids(db, current_user.student_id)
    if not enrolled_ids:
        return []

    result = await db.execute(
        select(Assessment, Course)
        .join(Course, Assessment.course_id == Course.id)
        .where(
            and_(
                Assessment.course_id.in_(enrolled_ids),
                Assessment.is_published == True,
                Assessment.assessment_type == "quiz",
            )
        )
        .limit(20)
    )
    rows = result.all()

    all_questions = []
    for assessment, course in rows:
        questions = assessment.questions or []
        for q in questions:
            if isinstance(q, dict) and q.get("question") and q.get("options"):
                all_questions.append({
                    "id": q.get("id", str(len(all_questions))),
                    "question": q["question"],
                    "options": q["options"],
                    "correct": q.get("correct_index", q.get("correct", 0)),
                    "explanation": q.get("explanation", ""),
                    "subject": course.learning_area,
                    "assessment_title": assessment.title,
                })

    random.shuffle(all_questions)
    return all_questions[:10]


# ── Project endpoints ─────────────────────────────────────────────────────────

@assessments_router.get("/projects/active")
async def get_active_projects(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> List[Dict]:
    """Project assessments from enrolled courses that haven't been submitted."""
    if current_user.role != "student":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Students only")
    if not current_user.student_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Student profile not found")

    enrolled_ids = await _get_student_enrolled_course_ids(db, current_user.student_id)
    if not enrolled_ids:
        return []

    submitted_ids = await _get_submitted_assessment_ids(db, current_user.student_id)
    now = datetime.utcnow()

    result = await db.execute(
        select(Assessment, Course)
        .join(Course, Assessment.course_id == Course.id)
        .where(
            and_(
                Assessment.course_id.in_(enrolled_ids),
                Assessment.is_published == True,
                Assessment.assessment_type == "project",
                or_(
                    Assessment.available_until == None,
                    Assessment.available_until >= now
                )
            )
        )
        .order_by(Assessment.available_until.asc().nullslast())
    )
    rows = result.all()

    return [
        _assessment_to_dict(a, c)
        for a, c in rows
        if a.id not in submitted_ids
    ]


@assessments_router.get("/projects/feedback")
async def get_project_feedback(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> List[Dict]:
    """Submitted project assessments with teacher feedback."""
    if current_user.role != "student":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Students only")
    if not current_user.student_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Student profile not found")

    result = await db.execute(
        select(AssessmentSubmission, Assessment, Course)
        .join(Assessment, AssessmentSubmission.assessment_id == Assessment.id)
        .join(Course, Assessment.course_id == Course.id)
        .where(
            and_(
                AssessmentSubmission.student_id == current_user.student_id,
                AssessmentSubmission.is_submitted == True,
                Assessment.assessment_type == "project"
            )
        )
        .order_by(AssessmentSubmission.submitted_at.desc())
        .limit(20)
    )
    rows = result.all()

    output = []
    for submission, assessment, course in rows:
        d = _assessment_to_dict(assessment, course)
        total = assessment.total_points or 1
        score = submission.score or 0
        d.update({
            "submission_id": str(submission.id),
            "submitted_at": submission.submitted_at,
            "graded_at": submission.graded_at,
            "score": score,
            "total_points": total,
            "percentage": round((score / total) * 100) if submission.is_graded else None,
            "is_graded": submission.is_graded,
            "feedback": submission.feedback,
            "passed": score >= (assessment.passing_score or 0) if submission.is_graded else None,
        })
        output.append(d)
    return output


# ── Topic browser endpoint ────────────────────────────────────────────────────

@router.get("/browse/topics")
async def get_browse_topics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> List[Dict]:
    """Topics from enrolled courses, grouped by subject/learning_area."""
    if current_user.role != "student":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Students only")
    if not current_user.student_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Student profile not found")

    enrolled_ids = await _get_student_enrolled_course_ids(db, current_user.student_id)
    if not enrolled_ids:
        return []

    result = await db.execute(
        select(Course).where(
            and_(
                Course.id.in_(enrolled_ids),
                Course.is_published == True
            )
        )
    )
    courses = result.scalars().all()

    COLORS = [
        "from-blue-500 to-cyan-500",
        "from-green-500 to-emerald-500",
        "from-purple-500 to-pink-500",
        "from-orange-500 to-red-500",
        "from-teal-500 to-cyan-500",
        "from-yellow-500 to-orange-500",
        "from-indigo-500 to-purple-500",
        "from-rose-500 to-pink-500",
    ]
    color_idx = 0
    area_map: Dict[str, Dict] = {}

    for course in courses:
        area = course.learning_area or "General"
        if area not in area_map:
            area_map[area] = {
                "id": area.lower().replace(" ", "_"),
                "name": area,
                "subject": area,
                "color": COLORS[color_idx % len(COLORS)],
                "subtopics": [],
            }
            color_idx += 1

        syllabus = course.syllabus or {}
        topics = syllabus.get("topics") or syllabus.get("units") or []

        if topics and isinstance(topics, list):
            for topic in topics:
                if isinstance(topic, dict):
                    name = topic.get("title") or topic.get("name") or ""
                    lessons = topic.get("lesson_count") or len(topic.get("lessons", [])) or 1
                    if name:
                        area_map[area]["subtopics"].append({
                            "id": f"{area.lower().replace(' ', '_')}_{len(area_map[area]['subtopics'])}",
                            "name": name,
                            "lessons": lessons,
                            "course_id": str(course.id),
                        })
        else:
            area_map[area]["subtopics"].append({
                "id": f"{area.lower().replace(' ', '_')}_{len(area_map[area]['subtopics'])}",
                "name": course.title,
                "lessons": len(course.lessons) if isinstance(course.lessons, list) else 1,
                "course_id": str(course.id),
            })

    return list(area_map.values())
