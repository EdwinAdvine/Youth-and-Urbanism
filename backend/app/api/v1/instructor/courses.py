"""
Instructor Courses API Routes

CRUD endpoints for instructor course management, modules, analytics,
publishing, and CBC alignment analysis.
"""

import logging
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func, and_, or_, desc, asc
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.models.course import Course
from app.models.enrollment import Enrollment, EnrollmentStatus
from app.utils.security import get_current_user, require_role
from app.schemas.instructor.course_schemas import (
    CourseCreate,
    CourseUpdate,
    CourseModulesUpdate,
    InstructorCourseResponse,
    CourseAnalyticsResponse,
    AIContentGenerateRequest,
    AIContentGenerateResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/courses", tags=["Instructor Courses"])


# ── Helper: verify course ownership ──────────────────────────────────

async def _get_instructor_course(
    db: AsyncSession, course_id: str, instructor_id: str
) -> Course:
    """Fetch a course belonging to this instructor or raise 404."""
    query = select(Course).where(
        and_(Course.id == course_id, Course.instructor_id == instructor_id)
    )
    result = await db.execute(query)
    course = result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


# ── LIST ─────────────────────────────────────────────────────────────

@router.get("", response_model=dict)
async def list_instructor_courses(
    is_published: Optional[bool] = Query(None),
    grade_level: Optional[str] = Query(None),
    learning_area: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """List all courses for the authenticated instructor with filtering and pagination."""
    instructor_id = str(current_user.id)

    # Base query
    filters = [Course.instructor_id == instructor_id]

    if is_published is not None:
        filters.append(Course.is_published == is_published)
    if learning_area:
        filters.append(Course.learning_area == learning_area)
    if grade_level:
        filters.append(Course.grade_levels.contains([grade_level]))
    if search:
        filters.append(
            or_(
                Course.title.ilike(f"%{search}%"),
                Course.description.ilike(f"%{search}%"),
            )
        )

    # Count
    count_q = select(func.count()).select_from(Course).where(and_(*filters))
    total = (await db.execute(count_q)).scalar() or 0

    # Sort
    sort_col = getattr(Course, sort_by, Course.created_at)
    order_fn = desc if sort_order == "desc" else asc

    # Paginated results
    query = (
        select(Course)
        .where(and_(*filters))
        .order_by(order_fn(sort_col))
        .offset((page - 1) * limit)
        .limit(limit)
    )
    rows = (await db.execute(query)).scalars().all()

    return {
        "courses": [_course_to_dict(c) for c in rows],
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit if limit else 1,
    }


# ── CREATE ───────────────────────────────────────────────────────────

@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_course(
    body: CourseCreate,
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """Create a new course for the authenticated instructor."""
    from app.services.instructor.course_service import create_course as svc_create

    course = await svc_create(db, str(current_user.id), body.model_dump())
    return _course_to_dict(course)


# ── GET DETAIL ───────────────────────────────────────────────────────

@router.get("/{course_id}", response_model=dict)
async def get_course_detail(
    course_id: str,
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """Get detailed information for a single course."""
    course = await _get_instructor_course(db, course_id, str(current_user.id))
    return _course_to_dict(course)


# ── UPDATE ───────────────────────────────────────────────────────────

@router.put("/{course_id}", response_model=dict)
async def update_course(
    course_id: str,
    body: CourseUpdate,
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """Update course metadata (title, description, price, etc.)."""
    course = await _get_instructor_course(db, course_id, str(current_user.id))

    update_data = body.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(course, key, value)

    await db.commit()
    await db.refresh(course)
    logger.info(f"Updated course {course_id}")
    return _course_to_dict(course)


# ── DELETE (soft) ────────────────────────────────────────────────────

@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_course(
    course_id: str,
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """Soft-delete a course (unpublish and mark deleted)."""
    course = await _get_instructor_course(db, course_id, str(current_user.id))
    course.is_published = False
    # We keep the record but mark unpublished. A hard delete can be an admin action.
    await db.delete(course)
    await db.commit()
    logger.info(f"Deleted course {course_id}")


# ── UPDATE MODULES / LESSONS ─────────────────────────────────────────

@router.put("/{course_id}/modules", response_model=dict)
async def update_course_modules(
    course_id: str,
    body: CourseModulesUpdate,
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """Update the syllabus structure and lessons for a course."""
    from app.services.instructor.course_service import update_course_modules as svc_update

    course = await svc_update(
        db, course_id, str(current_user.id), body.model_dump()
    )
    return _course_to_dict(course)


# ── ANALYTICS ────────────────────────────────────────────────────────

@router.get("/{course_id}/analytics", response_model=CourseAnalyticsResponse)
async def get_course_analytics(
    course_id: str,
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """Get analytics for a specific course (enrollments, completion, revenue)."""
    # Verify ownership
    await _get_instructor_course(db, course_id, str(current_user.id))

    from app.services.instructor.course_service import get_course_analytics as svc_analytics
    return await svc_analytics(db, course_id, str(current_user.id))


# ── PUBLISH / UNPUBLISH ──────────────────────────────────────────────

@router.post("/{course_id}/publish", response_model=dict)
async def publish_course(
    course_id: str,
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """Publish a course, making it visible to students."""
    course = await _get_instructor_course(db, course_id, str(current_user.id))

    if course.is_published:
        raise HTTPException(status_code=400, detail="Course is already published")

    # Basic validation
    if not course.title or not course.description:
        raise HTTPException(status_code=400, detail="Course must have a title and description to publish")
    if not course.lessons:
        raise HTTPException(status_code=400, detail="Course must have at least one lesson to publish")

    course.is_published = True
    course.published_at = datetime.utcnow()
    await db.commit()
    await db.refresh(course)

    logger.info(f"Published course {course_id}")
    return _course_to_dict(course)


@router.post("/{course_id}/unpublish", response_model=dict)
async def unpublish_course(
    course_id: str,
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """Unpublish a course, hiding it from students."""
    course = await _get_instructor_course(db, course_id, str(current_user.id))

    if not course.is_published:
        raise HTTPException(status_code=400, detail="Course is not published")

    course.is_published = False
    await db.commit()
    await db.refresh(course)

    logger.info(f"Unpublished course {course_id}")
    return _course_to_dict(course)


# ── CBC ALIGNMENT ────────────────────────────────────────────────────

@router.post("/{course_id}/cbc-analysis", response_model=dict)
async def run_cbc_analysis(
    course_id: str,
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """Run AI-powered CBC curriculum alignment analysis on a course."""
    # Verify ownership
    await _get_instructor_course(db, course_id, str(current_user.id))

    from app.services.instructor.ai_insight_service import analyze_cbc_alignment

    analysis = await analyze_cbc_alignment(db, course_id, str(current_user.id))
    return {
        "id": str(analysis.id),
        "course_id": str(analysis.course_id),
        "alignment_score": float(analysis.alignment_score),
        "competencies_covered": analysis.competencies_covered,
        "competencies_missing": analysis.competencies_missing,
        "suggestions": analysis.suggestions,
        "ai_model_used": analysis.ai_model_used,
        "analysis_data": analysis.analysis_data,
    }


# ── AI CONTENT GENERATION ────────────────────────────────────────────

@router.post("/ai-generate", response_model=AIContentGenerateResponse)
async def ai_generate_content(
    body: AIContentGenerateRequest,
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """AI-generate lesson content, quiz questions, or activities for a course."""
    # Verify course ownership
    await _get_instructor_course(db, body.course_id, str(current_user.id))

    from app.services.ai_orchestrator import AIOrchestrator

    ai = AIOrchestrator()
    prompt = (
        f"Generate {body.content_type} content for a {body.grade_level} level course.\n"
        f"Topic: {body.topic}\n"
    )
    if body.additional_context:
        prompt += f"Additional context: {body.additional_context}\n"

    result = await ai.process_request(
        task_type="creative",
        user_prompt=prompt,
        conversation_history=[],
        system_prompt=(
            "You are a Kenyan CBC curriculum content creator. "
            "Generate high-quality educational content aligned with the CBC framework."
        ),
    )

    return AIContentGenerateResponse(
        generated_content=result.get("response", ""),
        suggestions=result.get("suggestions", []),
        ai_model_used=result.get("model_used", "unknown"),
        generated_at=datetime.utcnow(),
    )


# ── Serialisation helper ─────────────────────────────────────────────

def _course_to_dict(course: Course) -> dict:
    """Convert a Course ORM object to a JSON-friendly dict."""
    return {
        "id": str(course.id),
        "title": course.title,
        "description": course.description,
        "thumbnail_url": course.thumbnail_url,
        "grade_levels": course.grade_levels or [],
        "learning_area": course.learning_area,
        "syllabus": course.syllabus or {},
        "lessons": course.lessons or [],
        "instructor_id": str(course.instructor_id) if course.instructor_id else None,
        "is_platform_created": course.is_platform_created,
        "price": float(course.price) if course.price else 0.0,
        "currency": course.currency,
        "is_published": course.is_published,
        "is_featured": course.is_featured,
        "enrollment_count": course.enrollment_count or 0,
        "average_rating": float(course.average_rating) if course.average_rating else 0.0,
        "total_reviews": course.total_reviews or 0,
        "estimated_duration_hours": course.estimated_duration_hours,
        "competencies": course.competencies or [],
        "revenue_split_id": str(course.revenue_split_id) if course.revenue_split_id else None,
        "cbc_analysis_id": str(course.cbc_analysis_id) if course.cbc_analysis_id else None,
        "ai_generated_meta": course.ai_generated_meta,
        "created_at": course.created_at.isoformat() if course.created_at else None,
        "updated_at": course.updated_at.isoformat() if course.updated_at else None,
        "published_at": course.published_at.isoformat() if course.published_at else None,
    }
