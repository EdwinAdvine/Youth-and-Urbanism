"""
Instructor Dashboard Service

Aggregates data for the instructor dashboard overview.
"""

import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List

from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.staff.live_session import LiveSession
from app.models.staff.assessment import Assessment
from app.models.instructor.instructor_earnings import InstructorEarning
from app.models.instructor.instructor_points import InstructorPoints
from app.services.ai_orchestrator import AIOrchestrator

logger = logging.getLogger(__name__)


async def get_dashboard_stats(
    db: AsyncSession,
    instructor_id: str
) -> Dict[str, Any]:
    """
    Return dashboard statistics for instructor overview.
    """
    try:
        now = datetime.utcnow()
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

        # Total courses created by instructor
        total_courses_q = select(func.count(Course.id)).where(
            Course.instructor_id == instructor_id
        )
        total_courses_result = await db.execute(total_courses_q)
        total_courses: int = total_courses_result.scalar() or 0

        # Published courses
        published_courses_q = select(func.count(Course.id)).where(
            and_(
                Course.instructor_id == instructor_id,
                Course.is_published == True
            )
        )
        published_courses_result = await db.execute(published_courses_q)
        published_courses: int = published_courses_result.scalar() or 0

        # Total students (unique enrollments across all courses)
        total_students_q = select(func.count(func.distinct(Enrollment.student_id))).join(
            Course, Course.id == Enrollment.course_id
        ).where(
            Course.instructor_id == instructor_id
        )
        total_students_result = await db.execute(total_students_q)
        total_students: int = total_students_result.scalar() or 0

        # Active students today (students who accessed course content today)
        # TODO: Track last_access_at on enrollments
        active_students_today: int = 0

        # Upcoming sessions
        upcoming_sessions_q = select(func.count(LiveSession.id)).where(
            and_(
                LiveSession.host_id == instructor_id,
                LiveSession.status == "scheduled",
                LiveSession.scheduled_at >= now
            )
        )
        upcoming_sessions_result = await db.execute(upcoming_sessions_q)
        upcoming_sessions_count: int = upcoming_sessions_result.scalar() or 0

        # Earnings this month
        earnings_month_q = select(func.sum(InstructorEarning.net_amount)).where(
            and_(
                InstructorEarning.instructor_id == instructor_id,
                InstructorEarning.created_at >= month_start,
                InstructorEarning.status == "confirmed"
            )
        )
        earnings_month_result = await db.execute(earnings_month_q)
        earnings_this_month = earnings_month_result.scalar() or 0.0

        # Total earnings (all time)
        earnings_total_q = select(func.sum(InstructorEarning.net_amount)).where(
            and_(
                InstructorEarning.instructor_id == instructor_id,
                InstructorEarning.status.in_(["confirmed", "paid"])
            )
        )
        earnings_total_result = await db.execute(earnings_total_q)
        earnings_total = earnings_total_result.scalar() or 0.0

        # Average rating and reviews
        # TODO: Calculate from course ratings
        average_rating = 0.0
        total_reviews = 0

        # Pending submissions
        # TODO: Count from assessment submissions where is_graded = False
        pending_submissions = 0

        # AI-flagged students
        # TODO: Get from student intervention/flag system
        ai_flagged_students = []

        # Points and streaks
        points_q = select(InstructorPoints).where(
            InstructorPoints.instructor_id == instructor_id
        )
        points_result = await db.execute(points_q)
        points_record = points_result.scalar_one_or_none()

        current_streak = points_record.streak_days if points_record else 0
        total_points = points_record.points if points_record else 0
        level = points_record.level if points_record else 1

        return {
            "total_students": total_students,
            "active_students_today": active_students_today,
            "total_courses": total_courses,
            "published_courses": published_courses,
            "upcoming_sessions_count": upcoming_sessions_count,
            "earnings_this_month": float(earnings_this_month),
            "earnings_total": float(earnings_total),
            "average_rating": float(average_rating),
            "total_reviews": total_reviews,
            "pending_submissions": pending_submissions,
            "ai_flagged_students": ai_flagged_students,
            "current_streak": current_streak,
            "total_points": total_points,
            "level": level
        }

    except Exception as e:
        logger.error(f"Error getting dashboard stats: {str(e)}")
        raise


async def get_dashboard_overview(
    db: AsyncSession,
    instructor_id: str
) -> Dict[str, Any]:
    """
    Get complete dashboard overview with stats, upcoming sessions, and AI insights.
    """
    try:
        # Get basic stats
        stats = await get_dashboard_stats(db, instructor_id)

        # Get upcoming sessions (next 3)
        now = datetime.utcnow()
        sessions_q = select(LiveSession).where(
            and_(
                LiveSession.host_id == instructor_id,
                LiveSession.status == "scheduled",
                LiveSession.scheduled_at >= now
            )
        ).order_by(LiveSession.scheduled_at).limit(3)
        sessions_result = await db.execute(sessions_q)
        sessions = sessions_result.scalars().all()

        upcoming_sessions = [
            {
                "id": str(session.id),
                "title": session.title,
                "scheduled_at": session.scheduled_at.isoformat(),
                "duration_minutes": session.duration_minutes,
                "participants_count": 0,  # TODO: Count from session_attendance
                "course_id": str(session.course_id) if session.course_id else None
            }
            for session in sessions
        ]

        # Pending submissions
        # TODO: Get from assessment submissions
        pending_submissions = []

        # AI-flagged students
        # TODO: Get from intervention system
        ai_flagged_students = []

        # Quick actions (context-aware)
        quick_actions = [
            {
                "title": "Create New Course",
                "icon": "plus",
                "url": "/dashboard/instructor/courses/new",
                "priority": "high" if stats["total_courses"] == 0 else "low"
            },
            {
                "title": "Schedule Live Session",
                "icon": "calendar",
                "url": "/dashboard/instructor/sessions/new",
                "priority": "medium"
            },
            {
                "title": "Grade Submissions",
                "icon": "check-circle",
                "url": "/dashboard/instructor/submissions",
                "priority": "high" if stats["pending_submissions"] > 0 else "low"
            }
        ]

        return {
            "stats": stats,
            "upcoming_sessions": upcoming_sessions,
            "pending_submissions": pending_submissions,
            "ai_flagged_students": ai_flagged_students,
            "quick_actions": quick_actions
        }

    except Exception as e:
        logger.error(f"Error getting dashboard overview: {str(e)}")
        raise
