"""
Analytics Service for Urban Home School

Provides aggregation queries for the admin analytics dashboard:
- Dashboard summary (users, revenue, courses, enrollments)
- Revenue metrics with date range filtering
- User growth and activity
- Course performance
"""

import logging
from datetime import date, timedelta
from typing import Optional

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.student import Student
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.payment import Transaction
from app.models.analytics import RevenueMetrics, PaymentAnalytics

logger = logging.getLogger(__name__)


async def get_dashboard_summary(db: AsyncSession) -> dict:
    """
    Get admin dashboard summary with key platform metrics.

    Aggregates counts of users (total and by role), courses (total and
    published), enrollments, total completed revenue, and new user
    registrations in the last 7 days.

    Returns a nested dict with users, courses, enrollments, and revenue sections.
    """
    # Total users by role
    total_users = (await db.execute(
        select(func.count()).where(User.is_deleted == False)
    )).scalar() or 0

    total_students = (await db.execute(
        select(func.count()).where(User.role == "student", User.is_deleted == False)
    )).scalar() or 0

    total_parents = (await db.execute(
        select(func.count()).where(User.role == "parent", User.is_deleted == False)
    )).scalar() or 0

    total_instructors = (await db.execute(
        select(func.count()).where(User.role == "instructor", User.is_deleted == False)
    )).scalar() or 0

    # Courses
    total_courses = (await db.execute(
        select(func.count()).select_from(Course)
    )).scalar() or 0

    published_courses = (await db.execute(
        select(func.count()).where(Course.is_published == True)
    )).scalar() or 0

    # Enrollments
    total_enrollments = (await db.execute(
        select(func.count()).select_from(Enrollment)
    )).scalar() or 0

    # Revenue (total completed transactions)
    total_revenue = (await db.execute(
        select(func.coalesce(func.sum(Transaction.amount), 0)).where(
            Transaction.status == "completed"
        )
    )).scalar() or 0

    # New users in last 7 days
    week_ago = date.today() - timedelta(days=7)
    new_users_7d = (await db.execute(
        select(func.count()).where(
            func.date(User.created_at) >= week_ago,
            User.is_deleted == False,
        )
    )).scalar() or 0

    return {
        "users": {
            "total": total_users,
            "students": total_students,
            "parents": total_parents,
            "instructors": total_instructors,
            "new_last_7_days": new_users_7d,
        },
        "courses": {
            "total": total_courses,
            "published": published_courses,
        },
        "enrollments": {
            "total": total_enrollments,
        },
        "revenue": {
            "total": float(total_revenue),
            "currency": "KES",
        },
    }


async def get_revenue_metrics(
    db: AsyncSession,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> dict:
    """
    Get revenue time series data for a date range.

    First tries pre-computed data from the RevenueMetrics table. If no
    pre-computed metrics exist, falls back to aggregating directly from
    the Transaction table (completed transactions only).

    Defaults to the last 30 days if no date range is specified. Returns
    a dict with the period and a list of daily data points containing
    gross revenue, net revenue, transaction counts, and currency.
    """
    if not start_date:
        start_date = date.today() - timedelta(days=30)
    if not end_date:
        end_date = date.today()

    # Try pre-computed metrics first
    result = await db.execute(
        select(RevenueMetrics)
        .where(
            RevenueMetrics.metric_date >= start_date,
            RevenueMetrics.metric_date <= end_date,
        )
        .order_by(RevenueMetrics.metric_date)
    )
    metrics = result.scalars().all()

    if metrics:
        return {
            "period": {"start": str(start_date), "end": str(end_date)},
            "data_points": [
                {
                    "date": str(m.metric_date),
                    "gross_revenue": float(m.gross_revenue),
                    "net_revenue": float(m.net_revenue),
                    "total_transactions": m.total_transactions,
                    "successful_transactions": m.successful_transactions,
                    "currency": m.currency,
                }
                for m in metrics
            ],
        }

    # Fallback: aggregate from transactions
    query = (
        select(
            func.date(Transaction.created_at).label("day"),
            func.coalesce(func.sum(Transaction.amount), 0).label("revenue"),
            func.count().label("count"),
        )
        .where(
            func.date(Transaction.created_at) >= start_date,
            func.date(Transaction.created_at) <= end_date,
            Transaction.status == "completed",
        )
        .group_by(func.date(Transaction.created_at))
        .order_by(func.date(Transaction.created_at))
    )
    result = await db.execute(query)
    rows = result.all()

    return {
        "period": {"start": str(start_date), "end": str(end_date)},
        "data_points": [
            {
                "date": str(row.day),
                "gross_revenue": float(row.revenue),
                "net_revenue": float(row.revenue),
                "total_transactions": row.count,
                "successful_transactions": row.count,
                "currency": "KES",
            }
            for row in rows
        ],
    }


async def get_user_growth(
    db: AsyncSession,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> dict:
    """
    Get user registration trends over a date range.

    Aggregates daily registration counts and provides a role-based
    breakdown for the specified period. Defaults to the last 30 days
    if no date range is specified.

    Returns a dict with the period, daily_registrations time series,
    and a by_role dict mapping role names to counts.
    """
    if not start_date:
        start_date = date.today() - timedelta(days=30)
    if not end_date:
        end_date = date.today()

    query = (
        select(
            func.date(User.created_at).label("day"),
            func.count().label("count"),
        )
        .where(
            func.date(User.created_at) >= start_date,
            func.date(User.created_at) <= end_date,
            User.is_deleted == False,
        )
        .group_by(func.date(User.created_at))
        .order_by(func.date(User.created_at))
    )
    result = await db.execute(query)
    rows = result.all()

    # Role breakdown for the period
    role_query = (
        select(User.role, func.count().label("count"))
        .where(
            func.date(User.created_at) >= start_date,
            func.date(User.created_at) <= end_date,
            User.is_deleted == False,
        )
        .group_by(User.role)
    )
    role_result = await db.execute(role_query)
    role_rows = role_result.all()

    return {
        "period": {"start": str(start_date), "end": str(end_date)},
        "daily_registrations": [
            {"date": str(row.day), "count": row.count} for row in rows
        ],
        "by_role": {row.role: row.count for row in role_rows},
    }


async def get_course_performance(db: AsyncSession) -> dict:
    """
    Get course performance metrics for the admin dashboard.

    Returns the top 10 courses ranked by enrollment count and the
    platform-wide average enrollment progress percentage. Useful for
    identifying popular courses and overall completion trends.
    """
    # Top courses by enrollment
    top_enrolled = await db.execute(
        select(
            Course.id, Course.title,
            func.count(Enrollment.id).label("enrollment_count"),
        )
        .join(Enrollment, Enrollment.course_id == Course.id, isouter=True)
        .group_by(Course.id, Course.title)
        .order_by(func.count(Enrollment.id).desc())
        .limit(10)
    )
    top_courses = top_enrolled.all()

    # Average completion rate
    avg_progress = (await db.execute(
        select(func.avg(Enrollment.progress_percentage))
    )).scalar() or 0

    return {
        "top_courses_by_enrollment": [
            {
                "course_id": str(row.id),
                "title": row.title,
                "enrollments": row.enrollment_count,
            }
            for row in top_courses
        ],
        "average_progress_percentage": round(float(avg_progress), 1),
    }
