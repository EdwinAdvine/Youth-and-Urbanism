"""
Admin Dashboard Service - Phase 1 (At a Glance)

Provides aggregated dashboard data by querying across existing models
(User, Student, Course, Enrollment, Transaction, AITutor) to power
the admin dashboard overview.

Methods return dicts/lists suitable for direct JSON serialisation in
FastAPI response models.
"""

import logging
import uuid
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Any, Dict, List

from sqlalchemy import select, func, and_, or_, cast, Date
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.student import Student
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.payment import Transaction
from app.models.ai_tutor import AITutor
from app.models.admin.operations import SupportTicket, ModerationItem

from app.utils.cache import cache_get, cache_set

logger = logging.getLogger(__name__)


def _decimal_to_float(value: Any) -> float:
    """Safely convert a Decimal/None to float for JSON serialisation."""
    if value is None:
        return 0.0
    return float(value)


class DashboardService:
    """Aggregation service for the admin 'At a Glance' dashboard."""

    # ------------------------------------------------------------------
    # Overview
    # ------------------------------------------------------------------
    @staticmethod
    async def get_overview(db: AsyncSession) -> Dict[str, Any]:
        """
        Return high-level platform metrics:
        total_users, active_users_today, revenue_today,
        new_enrollments_today, ai_sessions_today,
        total_courses, active_courses.

        Cached for 60 seconds to reduce the 7 sequential DB queries.
        """
        cache_key = "admin:dashboard:overview"
        cached = await cache_get(cache_key)
        if cached:
            return cached

        now = datetime.utcnow()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

        # Total users (non-deleted)
        total_users_q = select(func.count(User.id)).where(
            User.is_deleted == False
        )
        total_users_result = await db.execute(total_users_q)
        total_users: int = total_users_result.scalar() or 0

        # Active users today (logged in today)
        active_today_q = select(func.count(User.id)).where(
            and_(
                User.is_deleted == False,
                User.is_active == True,
                User.last_login >= today_start,
            )
        )
        active_today_result = await db.execute(active_today_q)
        active_users_today: int = active_today_result.scalar() or 0

        # Revenue today (completed transactions)
        revenue_today_q = select(func.coalesce(func.sum(Transaction.amount), 0)).where(
            and_(
                Transaction.status == "completed",
                Transaction.created_at >= today_start,
            )
        )
        revenue_today_result = await db.execute(revenue_today_q)
        revenue_today = _decimal_to_float(revenue_today_result.scalar())

        # New enrollments today
        new_enrollments_q = select(func.count(Enrollment.id)).where(
            and_(
                Enrollment.is_deleted == False,
                Enrollment.enrolled_at >= today_start,
            )
        )
        new_enrollments_result = await db.execute(new_enrollments_q)
        new_enrollments_today: int = new_enrollments_result.scalar() or 0

        # AI tutor sessions today (tutors with last_interaction today)
        ai_sessions_q = select(func.count(AITutor.id)).where(
            AITutor.last_interaction >= today_start
        )
        ai_sessions_result = await db.execute(ai_sessions_q)
        ai_sessions_today: int = ai_sessions_result.scalar() or 0

        # Total courses
        total_courses_q = select(func.count(Course.id))
        total_courses_result = await db.execute(total_courses_q)
        total_courses: int = total_courses_result.scalar() or 0

        # Active (published) courses
        active_courses_q = select(func.count(Course.id)).where(
            Course.is_published == True
        )
        active_courses_result = await db.execute(active_courses_q)
        active_courses: int = active_courses_result.scalar() or 0

        result = {
            "total_users": total_users,
            "active_users_today": active_users_today,
            "revenue_today": revenue_today,
            "new_enrollments_today": new_enrollments_today,
            "ai_sessions_today": ai_sessions_today,
            "total_courses": total_courses,
            "active_courses": active_courses,
            "generated_at": now.isoformat(),
        }
        await cache_set(cache_key, result, ttl=60)
        return result

    # ------------------------------------------------------------------
    # Alerts
    # ------------------------------------------------------------------
    @staticmethod
    async def get_alerts(db: AsyncSession) -> List[Dict[str, Any]]:
        """
        Return critical system and safety alerts.

        Currently returns realistic mock data because dedicated alert
        tables do not exist yet. Replace with real queries once the
        AlertLog / SystemAlert models are added.
        """
        now = datetime.utcnow()

        # Mock alerts -- will be replaced with real queries later
        alerts: List[Dict[str, Any]] = [
            {
                "id": str(uuid.uuid4()),
                "type": "safety",
                "severity": "critical",
                "title": "Content flagged for review",
                "message": (
                    "AI-generated response in Grade 4 Science was flagged "
                    "by the content safety filter. Manual review required."
                ),
                "created_at": (now - timedelta(minutes=23)).isoformat(),
                "is_read": False,
                "action_url": "/admin/moderation/flagged",
            },
            {
                "id": str(uuid.uuid4()),
                "type": "system",
                "severity": "high",
                "title": "Database storage at 82%",
                "message": (
                    "PostgreSQL disk usage has reached 82%. Consider "
                    "archiving old audit logs or scaling storage."
                ),
                "created_at": (now - timedelta(hours=2)).isoformat(),
                "is_read": False,
                "action_url": "/admin/system/storage",
            },
            {
                "id": str(uuid.uuid4()),
                "type": "payment",
                "severity": "medium",
                "title": "M-Pesa callback failures",
                "message": (
                    "3 M-Pesa payment callbacks failed in the last hour. "
                    "Transactions are queued for retry."
                ),
                "created_at": (now - timedelta(hours=1, minutes=15)).isoformat(),
                "is_read": True,
                "action_url": "/admin/payments/failures",
            },
            {
                "id": str(uuid.uuid4()),
                "type": "user",
                "severity": "low",
                "title": "Unusual sign-up spike",
                "message": (
                    "47 new student registrations in the past 30 minutes, "
                    "which is 3x the normal rate. No bot indicators found."
                ),
                "created_at": (now - timedelta(minutes=35)).isoformat(),
                "is_read": False,
                "action_url": "/admin/users/registrations",
            },
        ]

        return alerts

    # ------------------------------------------------------------------
    # Pending items
    # ------------------------------------------------------------------
    @staticmethod
    async def get_pending_items(db: AsyncSession) -> Dict[str, Any]:
        """
        Count pending approvals, escalations, and flags across the
        platform. Returns a breakdown by category.

        Cached for 30 seconds to reduce the 5 sequential DB queries.
        """
        cache_key = "admin:dashboard:pending"
        cached = await cache_get(cache_key)
        if cached:
            return cached

        # Pending-payment enrollments (awaiting payment confirmation)
        pending_enrollments_q = select(func.count(Enrollment.id)).where(
            and_(
                Enrollment.is_deleted == False,
                Enrollment.status == "pending_payment",
            )
        )
        pending_enrollments_result = await db.execute(pending_enrollments_q)
        pending_enrollments: int = pending_enrollments_result.scalar() or 0

        # Unpublished courses awaiting review (not yet published, created
        # by external instructors)
        pending_courses_q = select(func.count(Course.id)).where(
            and_(
                Course.is_published == False,
                Course.is_platform_created == False,
                Course.instructor_id.isnot(None),
            )
        )
        pending_courses_result = await db.execute(pending_courses_q)
        pending_courses: int = pending_courses_result.scalar() or 0

        # Pending transactions (payment gateway hasn't confirmed yet)
        pending_transactions_q = select(func.count(Transaction.id)).where(
            Transaction.status == "pending"
        )
        pending_transactions_result = await db.execute(pending_transactions_q)
        pending_transactions: int = pending_transactions_result.scalar() or 0

        # Open support tickets
        open_tickets_q = select(func.count(SupportTicket.id)).where(
            SupportTicket.status.in_(["open", "in_progress", "escalated"])
        )
        open_tickets_result = await db.execute(open_tickets_q)
        open_tickets: int = open_tickets_result.scalar() or 0

        # Pending moderation items
        moderation_q = select(func.count(ModerationItem.id)).where(
            ModerationItem.status == "pending_review"
        )
        moderation_result = await db.execute(moderation_q)
        moderation_items: int = moderation_result.scalar() or 0

        total = (
            pending_enrollments
            + pending_courses
            + pending_transactions
            + open_tickets
            + moderation_items
        )

        result = {
            "total": total,
            "categories": {
                "pending_enrollments": pending_enrollments,
                "pending_courses": pending_courses,
                "pending_transactions": pending_transactions,
                "open_tickets": open_tickets,
                "moderation_items": moderation_items,
            },
        }
        await cache_set(cache_key, result, ttl=30)
        return result

    # ------------------------------------------------------------------
    # Revenue snapshot
    # ------------------------------------------------------------------
    @staticmethod
    async def get_revenue_snapshot(db: AsyncSession) -> Dict[str, Any]:
        """
        Today's revenue breakdown plus weekly/monthly aggregates and
        the five most recent completed transactions.

        Cached for 60 seconds to reduce the 5 sequential DB queries.
        """
        cache_key = "admin:dashboard:revenue"
        cached = await cache_get(cache_key)
        if cached:
            return cached

        now = datetime.utcnow()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_start = today_start - timedelta(days=today_start.weekday())  # Monday
        month_start = today_start.replace(day=1)
        yesterday_start = today_start - timedelta(days=1)

        # Helper to sum completed transactions in a window
        async def _sum_revenue(start: datetime, end: datetime) -> float:
            q = select(func.coalesce(func.sum(Transaction.amount), 0)).where(
                and_(
                    Transaction.status == "completed",
                    Transaction.created_at >= start,
                    Transaction.created_at < end,
                )
            )
            result = await db.execute(q)
            return _decimal_to_float(result.scalar())

        total_today = await _sum_revenue(today_start, now)
        total_yesterday = await _sum_revenue(yesterday_start, today_start)
        total_week = await _sum_revenue(week_start, now)
        total_month = await _sum_revenue(month_start, now)

        # Simple trend: percentage change vs yesterday
        if total_yesterday > 0:
            trend_percentage = round(
                ((total_today - total_yesterday) / total_yesterday) * 100, 1
            )
        else:
            trend_percentage = 100.0 if total_today > 0 else 0.0

        # Last 5 completed transactions
        recent_q = (
            select(Transaction)
            .where(Transaction.status == "completed")
            .order_by(Transaction.created_at.desc())
            .limit(5)
        )
        recent_result = await db.execute(recent_q)
        recent_rows = recent_result.scalars().all()

        recent_transactions: List[Dict[str, Any]] = []
        for txn in recent_rows:
            recent_transactions.append(
                {
                    "id": str(txn.id),
                    "amount": _decimal_to_float(txn.amount),
                    "currency": txn.currency,
                    "gateway": txn.gateway,
                    "created_at": txn.created_at.isoformat() if txn.created_at else None,
                }
            )

        result = {
            "total_today": total_today,
            "total_yesterday": total_yesterday,
            "total_week": total_week,
            "total_month": total_month,
            "trend_percentage": trend_percentage,
            "currency": "KES",
            "recent_transactions": recent_transactions,
            "generated_at": now.isoformat(),
        }
        await cache_set(cache_key, result, ttl=60)
        return result

    # ------------------------------------------------------------------
    # AI Anomalies
    # ------------------------------------------------------------------
    @staticmethod
    async def get_ai_anomalies(db: AsyncSession) -> List[Dict[str, Any]]:
        """
        AI anomaly detections.

        Currently returns mock data until dedicated AI monitoring
        tables and the anomaly-detection pipeline are in place.
        Replace with real queries once those models exist.
        """
        now = datetime.utcnow()

        anomalies: List[Dict[str, Any]] = [
            {
                "id": str(uuid.uuid4()),
                "type": "response_quality",
                "severity": "high",
                "title": "Low-quality AI responses detected",
                "description": (
                    "Gemini Pro returned 12 responses in Grade 6 Mathematics "
                    "with confidence scores below 0.4 in the last 2 hours. "
                    "Possible model degradation or prompt injection attempt."
                ),
                "affected_model": "gemini-pro",
                "affected_subject": "Mathematics",
                "affected_grade": "Grade 6",
                "detected_at": (now - timedelta(minutes=45)).isoformat(),
                "status": "open",
                "action_url": "/admin/ai/anomalies/response-quality",
            },
            {
                "id": str(uuid.uuid4()),
                "type": "usage_spike",
                "severity": "medium",
                "title": "Unusual API usage spike",
                "description": (
                    "Claude 3.5 Sonnet token usage spiked by 320% in the "
                    "last hour compared to the 7-day average. Cost impact "
                    "estimated at KES 4,200 above budget."
                ),
                "affected_model": "claude-3.5-sonnet",
                "affected_subject": None,
                "affected_grade": None,
                "detected_at": (now - timedelta(hours=1, minutes=10)).isoformat(),
                "status": "investigating",
                "action_url": "/admin/ai/anomalies/usage-spike",
            },
            {
                "id": str(uuid.uuid4()),
                "type": "content_safety",
                "severity": "critical",
                "title": "Blocked harmful content generation",
                "description": (
                    "Safety filter blocked 2 AI responses that contained "
                    "age-inappropriate content for Grade 3 students. "
                    "The prompts have been quarantined for review."
                ),
                "affected_model": "gpt-4",
                "affected_subject": "English",
                "affected_grade": "Grade 3",
                "detected_at": (now - timedelta(minutes=18)).isoformat(),
                "status": "escalated",
                "action_url": "/admin/ai/anomalies/content-safety",
            },
        ]

        return anomalies
