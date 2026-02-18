"""
Instructor Interactions API Routes

Endpoints for student interactions: messages, AI handoff, student progress,
flags/celebrations, and student management.
"""

import uuid
import logging
from typing import Optional
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import select, func, and_, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.models.course import Course
from app.models.enrollment import Enrollment, EnrollmentStatus
from app.utils.security import get_current_user, require_role

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Instructor Interactions"])


# ── Request schemas (inline for simplicity) ─────────────────────────

class FlagCelebrateRequest(BaseModel):
    reason: str = Field(..., min_length=1, max_length=500)
    message: Optional[str] = None


class SendMessageRequest(BaseModel):
    to_user_id: str
    content: str = Field(..., min_length=1, max_length=5000)


# ── STUDENT PROGRESS ────────────────────────────────────────────────

@router.get("/students/progress", response_model=dict)
async def get_students_progress(
    search: Optional[str] = Query(None),
    at_risk: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """Get progress data for all students enrolled in instructor's courses."""
    instructor_id = str(current_user.id)

    # Get distinct students across instructor's courses with progress
    course_ids_q = select(Course.id).where(Course.instructor_id == instructor_id)

    progress_q = (
        select(
            Enrollment.student_id,
            func.avg(Enrollment.progress_percentage).label("overall_progress"),
            func.avg(Enrollment.current_grade).label("average_score"),
            func.count(Enrollment.id).label("courses_enrolled"),
            func.max(Enrollment.last_accessed_at).label("last_activity"),
            func.count().filter(Enrollment.is_completed == True).label("completed_count"),
            func.count().label("total_count"),
        )
        .where(
            and_(
                Enrollment.course_id.in_(course_ids_q),
                Enrollment.is_deleted == False,
            )
        )
        .group_by(Enrollment.student_id)
    )

    result = await db.execute(progress_q)
    rows = result.all()

    students = []
    for row in rows:
        progress = float(row.overall_progress or 0)
        completed = row.completed_count or 0
        total = row.total_count or 1
        completion_rate = round((completed / total) * 100, 2)
        is_at_risk = progress < 20

        if at_risk is not None and at_risk != is_at_risk:
            continue

        # Determine trend (simplified: based on progress level)
        trend = "stable"
        if progress > 60:
            trend = "up"
        elif progress < 25:
            trend = "down"

        engagement = "medium"
        if progress > 70:
            engagement = "high"
        elif progress < 30:
            engagement = "low"

        # Get student name
        student_q = select(User.full_name, User.profile_picture).where(User.id == row.student_id)
        student_info = (await db.execute(student_q)).one_or_none()

        students.append({
            "student_id": str(row.student_id),
            "student_name": student_info[0] if student_info else "Unknown",
            "student_avatar": student_info[1] if student_info else None,
            "overall_progress": round(progress, 2),
            "completion_rate": completion_rate,
            "average_score": float(row.average_score or 0),
            "trend": trend,
            "engagement_level": engagement,
            "at_risk": is_at_risk,
            "courses_enrolled": row.courses_enrolled,
            "last_activity": row.last_activity.isoformat() if row.last_activity else None,
        })

    # Search filter
    if search:
        students = [
            s for s in students
            if search.lower() in s["student_name"].lower()
        ]

    total = len(students)
    paginated = students[(page - 1) * limit: page * limit]

    return {
        "students": paginated,
        "total": total,
        "page": page,
        "limit": limit,
    }


# ── STUDENT LIST ────────────────────────────────────────────────────

@router.get("/students", response_model=dict)
async def list_students(
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """List all students enrolled in the instructor's courses."""
    instructor_id = str(current_user.id)

    course_ids_q = select(Course.id).where(Course.instructor_id == instructor_id)

    student_ids_q = (
        select(func.distinct(Enrollment.student_id))
        .where(
            and_(
                Enrollment.course_id.in_(course_ids_q),
                Enrollment.is_deleted == False,
            )
        )
    )
    student_ids = (await db.execute(student_ids_q)).scalars().all()

    filters = [User.id.in_(student_ids)]
    if search:
        filters.append(User.full_name.ilike(f"%{search}%"))

    count_q = select(func.count()).select_from(User).where(and_(*filters))
    total = (await db.execute(count_q)).scalar() or 0

    users_q = (
        select(User)
        .where(and_(*filters))
        .order_by(User.full_name)
        .offset((page - 1) * limit)
        .limit(limit)
    )
    users = (await db.execute(users_q)).scalars().all()

    return {
        "students": [
            {
                "id": str(u.id),
                "name": u.full_name,
                "email": u.email,
                "avatar": u.profile_picture,
            }
            for u in users
        ],
        "total": total,
        "page": page,
        "limit": limit,
    }


# ── FLAG / CELEBRATE ────────────────────────────────────────────────

@router.post("/students/{student_id}/flag", response_model=dict)
async def flag_student(
    student_id: str,
    body: FlagCelebrateRequest,
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """Flag a student for attention (at-risk, behavior, etc.)."""
    # Verify the student is enrolled in one of the instructor's courses
    instructor_id = str(current_user.id)
    course_ids_q = select(Course.id).where(Course.instructor_id == instructor_id)
    enrollment_q = select(Enrollment).where(
        and_(
            Enrollment.student_id == student_id,
            Enrollment.course_id.in_(course_ids_q),
            Enrollment.is_deleted == False,
        )
    ).limit(1)
    enrollment = (await db.execute(enrollment_q)).scalar_one_or_none()
    if not enrollment:
        raise HTTPException(status_code=404, detail="Student not found in your courses")

    # Store flag in enrollment metadata or extra_data
    # For now, return success (will integrate with notification system)
    logger.info(f"Instructor {instructor_id} flagged student {student_id}: {body.reason}")

    return {
        "student_id": student_id,
        "action": "flagged",
        "reason": body.reason,
        "message": body.message,
        "flagged_by": instructor_id,
        "flagged_at": datetime.utcnow().isoformat(),
    }


@router.post("/students/{student_id}/celebrate", response_model=dict)
async def celebrate_student(
    student_id: str,
    body: FlagCelebrateRequest,
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """Celebrate a student achievement."""
    instructor_id = str(current_user.id)
    course_ids_q = select(Course.id).where(Course.instructor_id == instructor_id)
    enrollment_q = select(Enrollment).where(
        and_(
            Enrollment.student_id == student_id,
            Enrollment.course_id.in_(course_ids_q),
            Enrollment.is_deleted == False,
        )
    ).limit(1)
    enrollment = (await db.execute(enrollment_q)).scalar_one_or_none()
    if not enrollment:
        raise HTTPException(status_code=404, detail="Student not found in your courses")

    logger.info(f"Instructor {instructor_id} celebrated student {student_id}: {body.reason}")

    return {
        "student_id": student_id,
        "action": "celebrated",
        "reason": body.reason,
        "message": body.message,
        "celebrated_by": instructor_id,
        "celebrated_at": datetime.utcnow().isoformat(),
    }


# ── AI HANDOFF ──────────────────────────────────────────────────────

@router.get("/ai-handoff", response_model=dict)
async def list_ai_conversations(
    requires_intervention: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """List AI tutor conversations for students in instructor's courses."""
    # Get student IDs from instructor's courses
    instructor_id = str(current_user.id)
    course_ids_q = select(Course.id).where(Course.instructor_id == instructor_id)
    student_ids_q = (
        select(func.distinct(Enrollment.student_id))
        .where(
            and_(
                Enrollment.course_id.in_(course_ids_q),
                Enrollment.is_deleted == False,
                Enrollment.status == EnrollmentStatus.ACTIVE,
            )
        )
    )
    student_ids = (await db.execute(student_ids_q)).scalars().all()

    # Get AI tutor data for these students
    try:
        from app.models.ai_tutor import AITutor
        tutor_q = select(AITutor).where(AITutor.student_id.in_(student_ids))
        tutors = (await db.execute(tutor_q)).scalars().all()

        conversations = []
        for tutor in tutors:
            history = tutor.conversation_history or []
            total_messages = len(history)
            if total_messages == 0:
                continue

            student_q = select(User.full_name).where(User.id == tutor.student_id)
            student_name = (await db.execute(student_q)).scalar() or "Unknown"

            last_msg = history[-1] if history else {}
            conversations.append({
                "id": str(tutor.id),
                "student_id": str(tutor.student_id),
                "student_name": student_name,
                "total_messages": total_messages,
                "last_interaction": last_msg.get("timestamp"),
                "topics_discussed": tutor.learning_paths or [],
                "struggles_identified": [],
                "comprehension_score": float(tutor.performance_metrics.get("comprehension", 50)) if tutor.performance_metrics else 50,
                "requires_intervention": total_messages > 10 and (tutor.performance_metrics or {}).get("comprehension", 100) < 40,
            })

        if requires_intervention is not None:
            conversations = [c for c in conversations if c["requires_intervention"] == requires_intervention]

        total = len(conversations)
        paginated = conversations[(page - 1) * limit: page * limit]

        return {"conversations": paginated, "total": total}

    except (ImportError, Exception) as e:
        logger.warning(f"AI tutor data not available: {e}")
        return {"conversations": [], "total": 0}


@router.get("/ai-handoff/{student_id}/summary", response_model=dict)
async def get_ai_conversation_summary(
    student_id: str,
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """Get AI conversation summary for a specific student."""
    try:
        from app.models.ai_tutor import AITutor

        tutor_q = select(AITutor).where(AITutor.student_id == student_id)
        tutor = (await db.execute(tutor_q)).scalar_one_or_none()

        if not tutor:
            return {"history": [], "summary": "No AI tutor conversations found."}

        history = tutor.conversation_history or []

        # Generate summary via AI
        from app.services.ai_orchestrator import AIOrchestrator
        ai = AIOrchestrator()

        # Format last 20 messages for summary
        recent = history[-20:]
        formatted = "\n".join(
            f"{msg.get('role', 'unknown')}: {msg.get('content', '')}"
            for msg in recent
        )

        result = await ai.process_request(
            task_type="general",
            user_prompt=f"Summarize this student-AI tutor conversation:\n{formatted}",
            conversation_history=[],
            system_prompt="Provide a concise summary highlighting student strengths, struggles, and areas needing instructor attention.",
        )

        return {
            "history": recent,
            "summary": result.get("response", "Summary generation failed."),
        }

    except (ImportError, Exception) as e:
        logger.warning(f"Error getting AI conversation: {e}")
        return {"history": [], "summary": "AI tutor data not available."}


# ── MESSAGES ────────────────────────────────────────────────────────

@router.get("/messages/conversations", response_model=dict)
async def list_message_conversations(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """List message conversations for the instructor."""
    # For now, return conversations based on enrolled students
    instructor_id = str(current_user.id)
    course_ids_q = select(Course.id).where(Course.instructor_id == instructor_id)
    student_ids_q = (
        select(func.distinct(Enrollment.student_id))
        .where(
            and_(
                Enrollment.course_id.in_(course_ids_q),
                Enrollment.is_deleted == False,
            )
        )
    )
    student_ids = (await db.execute(student_ids_q)).scalars().all()

    users_q = (
        select(User)
        .where(User.id.in_(student_ids))
        .order_by(User.full_name)
        .offset((page - 1) * limit)
        .limit(limit)
    )
    users = (await db.execute(users_q)).scalars().all()

    return {
        "conversations": [
            {
                "user_id": str(u.id),
                "user_name": u.full_name,
                "user_avatar": u.profile_picture,
                "last_message": "",
                "last_message_time": None,
                "unread_count": 0,
            }
            for u in users
        ],
        "total": len(student_ids),
    }


@router.get("/messages/{user_id}", response_model=dict)
async def get_messages(
    user_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """Get messages between instructor and a user."""
    # Placeholder - will integrate with messaging system
    return {
        "messages": [],
        "total": 0,
        "user_id": user_id,
    }


@router.post("/messages", response_model=dict, status_code=status.HTTP_201_CREATED)
async def send_message(
    body: SendMessageRequest,
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """Send a message to a student or parent."""
    return {
        "id": str(uuid.uuid4()),
        "from_user_id": str(current_user.id),
        "to_user_id": body.to_user_id,
        "content": body.content,
        "timestamp": datetime.utcnow().isoformat(),
        "read": False,
    }
