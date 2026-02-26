"""
Instructor Course Service

Course CRUD, modules/lessons management, analytics.
"""

import logging
from typing import List, Dict, Any
from datetime import datetime, timedelta
from decimal import Decimal

from sqlalchemy import select, func, and_, case
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.course import Course
from app.models.enrollment import Enrollment, EnrollmentStatus

logger = logging.getLogger(__name__)


async def create_course(
    db: AsyncSession,
    instructor_id: str,
    course_data: Dict[str, Any]
) -> Course:
    """Create new course."""
    try:
        course = Course(
            instructor_id=instructor_id,
            title=course_data["title"],
            description=course_data["description"],
            thumbnail_url=course_data.get("thumbnail_url"),
            grade_levels=course_data.get("grade_levels", []),
            learning_area=course_data["learning_area"],
            price=course_data.get("price", 0),
            currency=course_data.get("currency", "KES"),
            competencies=course_data.get("competencies", []),
            estimated_duration_hours=course_data.get("estimated_duration_hours"),
            is_platform_created=False,
            is_published=False,
            syllabus={},
            lessons=[]
        )
        db.add(course)
        await db.commit()
        await db.refresh(course)

        logger.info(f"Created course: {course.id}")
        return course

    except Exception as e:
        logger.error(f"Error creating course: {str(e)}")
        await db.rollback()
        raise


async def update_course_modules(
    db: AsyncSession,
    course_id: str,
    instructor_id: str,
    modules_data: Dict[str, Any]
) -> Course:
    """Update course syllabus and lessons (JSONB)."""
    try:
        query = select(Course).where(
            and_(
                Course.id == course_id,
                Course.instructor_id == instructor_id
            )
        )
        result = await db.execute(query)
        course = result.scalar_one()

        course.syllabus = modules_data.get("syllabus", course.syllabus)
        course.lessons = modules_data.get("lessons", course.lessons)

        await db.commit()
        await db.refresh(course)

        logger.info(f"Updated modules for course: {course_id}")
        return course

    except Exception as e:
        logger.error(f"Error updating course modules: {str(e)}")
        await db.rollback()
        raise


async def get_course_analytics(
    db: AsyncSession,
    course_id: str,
    instructor_id: str
) -> Dict[str, Any]:
    """Get course analytics (enrollments, completion, engagement, revenue)."""
    try:
        # Total enrollments
        total_q = select(func.count()).select_from(Enrollment).where(
            and_(
                Enrollment.course_id == course_id,
                Enrollment.is_deleted == False,
            )
        )
        total_enrollments = (await db.execute(total_q)).scalar() or 0

        # Active students
        active_q = select(func.count()).select_from(Enrollment).where(
            and_(
                Enrollment.course_id == course_id,
                Enrollment.status == EnrollmentStatus.ACTIVE,
                Enrollment.is_deleted == False,
            )
        )
        active_students = (await db.execute(active_q)).scalar() or 0

        # Completion rate
        completed_q = select(func.count()).select_from(Enrollment).where(
            and_(
                Enrollment.course_id == course_id,
                Enrollment.is_completed == True,
                Enrollment.is_deleted == False,
            )
        )
        completed_count = (await db.execute(completed_q)).scalar() or 0
        completion_rate = (
            round((completed_count / total_enrollments) * 100, 2)
            if total_enrollments > 0
            else 0.0
        )

        # Average progress
        avg_progress_q = select(
            func.coalesce(func.avg(Enrollment.progress_percentage), 0)
        ).where(
            and_(
                Enrollment.course_id == course_id,
                Enrollment.is_deleted == False,
            )
        )
        average_progress = float((await db.execute(avg_progress_q)).scalar() or 0)

        # Average rating and total reviews from the course record
        course_q = select(Course).where(Course.id == course_id)
        course = (await db.execute(course_q)).scalar_one()
        average_rating = float(course.average_rating) if course.average_rating else 0.0
        total_reviews = course.total_reviews or 0

        # Total revenue (sum of payment_amount for this course's enrollments)
        rev_q = select(
            func.coalesce(func.sum(Enrollment.payment_amount), 0)
        ).where(
            and_(
                Enrollment.course_id == course_id,
                Enrollment.is_deleted == False,
            )
        )
        total_revenue = float((await db.execute(rev_q)).scalar() or 0)

        # Revenue this month
        month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        rev_month_q = select(
            func.coalesce(func.sum(Enrollment.payment_amount), 0)
        ).where(
            and_(
                Enrollment.course_id == course_id,
                Enrollment.enrolled_at >= month_start,
                Enrollment.is_deleted == False,
            )
        )
        revenue_this_month = float((await db.execute(rev_month_q)).scalar() or 0)

        # Engagement score: weighted combination of active rate + avg progress
        active_rate = (active_students / total_enrollments * 100) if total_enrollments > 0 else 0
        engagement_score = round((active_rate * 0.4 + average_progress * 0.6), 2)

        # Popular lessons: count completions per lesson from JSONB
        # (Simplified: we return empty for now until we have lesson-level tracking)
        popular_lessons: List[Dict[str, Any]] = []

        # Drop-off points (simplified)
        drop_off_points: List[Dict[str, Any]] = []

        return {
            "course_id": course_id,
            "total_enrollments": total_enrollments,
            "active_students": active_students,
            "completion_rate": completion_rate,
            "average_progress": round(average_progress, 2),
            "average_rating": average_rating,
            "total_reviews": total_reviews,
            "total_revenue": total_revenue,
            "revenue_this_month": revenue_this_month,
            "engagement_score": engagement_score,
            "popular_lessons": popular_lessons,
            "drop_off_points": drop_off_points,
        }

    except Exception as e:
        logger.error(f"Error getting course analytics: {str(e)}")
        raise
