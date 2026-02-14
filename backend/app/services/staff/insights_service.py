"""
Insights Service

Platform health, content performance, and support metrics for the
staff insights dashboard. Aggregates data across multiple models to
produce time-series and summary statistics.
"""

import logging
from datetime import datetime, timedelta
from typing import Any, Dict, Optional

from sqlalchemy import select, func, and_, cast, Date
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.enrollment import Enrollment
from app.models.ai_tutor import AITutor
from app.models.staff.ticket import StaffTicket
from app.models.staff.content_item import StaffContentItem
from app.models.staff.live_session import LiveSession

logger = logging.getLogger(__name__)


class InsightsService:
    """Facade exposing insights functions as static methods."""

    @staticmethod
    def _build_date_range(date_from=None, date_to=None):
        if date_from or date_to:
            return {"start": date_from, "end": date_to}
        return None

    @staticmethod
    async def get_platform_health(db, *, date_from=None, date_to=None):
        date_range = InsightsService._build_date_range(date_from, date_to)
        return await get_platform_health(db, date_range=date_range)

    @staticmethod
    async def get_content_performance(db, *, date_from=None, date_to=None):
        date_range = InsightsService._build_date_range(date_from, date_to)
        return await get_content_performance(db, date_range=date_range)

    @staticmethod
    async def get_support_metrics(db, *, date_from=None, date_to=None):
        date_range = InsightsService._build_date_range(date_from, date_to)
        return await get_support_metrics(db, date_range=date_range)


def _parse_date_range(date_range: Optional[Dict[str, str]] = None) -> tuple:
    """Parse a date range dict into start/end datetimes, defaulting to last 30 days."""
    now = datetime.utcnow()
    if date_range:
        start = datetime.fromisoformat(date_range["start"]) if date_range.get("start") else now - timedelta(days=30)
        end = datetime.fromisoformat(date_range["end"]) if date_range.get("end") else now
    else:
        start = now - timedelta(days=30)
        end = now
    return start, end


async def get_platform_health(
    db: AsyncSession,
    date_range: Optional[Dict[str, str]] = None,
) -> Dict[str, Any]:
    """
    Platform health metrics: DAU, engagement, AI usage stats.

    Returns summary statistics and daily time-series data for the
    given date range.
    """
    try:
        start, end = _parse_date_range(date_range)
        now = datetime.utcnow()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

        # Daily active users (logged in today)
        dau_q = select(func.count(User.id)).where(
            and_(
                User.is_deleted == False,  # noqa: E712
                User.is_active == True,  # noqa: E712
                User.last_login >= today_start,
            )
        )
        dau_result = await db.execute(dau_q)
        dau: int = dau_result.scalar() or 0

        # Total registered users
        total_users_q = select(func.count(User.id)).where(
            User.is_deleted == False  # noqa: E712
        )
        total_users_result = await db.execute(total_users_q)
        total_users: int = total_users_result.scalar() or 0

        # New registrations in date range
        new_users_q = select(func.count(User.id)).where(
            and_(
                User.is_deleted == False,  # noqa: E712
                User.created_at >= start,
                User.created_at <= end,
            )
        )
        new_users_result = await db.execute(new_users_q)
        new_users: int = new_users_result.scalar() or 0

        # Active enrollments in range
        active_enrollments_q = select(func.count(Enrollment.id)).where(
            and_(
                Enrollment.is_deleted == False,  # noqa: E712
                Enrollment.status == "active",
            )
        )
        active_enrollments_result = await db.execute(active_enrollments_q)
        active_enrollments: int = active_enrollments_result.scalar() or 0

        # AI tutor sessions in range
        ai_sessions_q = select(func.count(AITutor.id)).where(
            and_(
                AITutor.last_interaction >= start,
                AITutor.last_interaction <= end,
            )
        )
        ai_sessions_result = await db.execute(ai_sessions_q)
        ai_sessions: int = ai_sessions_result.scalar() or 0

        # Live sessions in range
        live_sessions_q = select(func.count(LiveSession.id)).where(
            and_(
                LiveSession.scheduled_at >= start,
                LiveSession.scheduled_at <= end,
            )
        )
        live_sessions_result = await db.execute(live_sessions_q)
        live_sessions: int = live_sessions_result.scalar() or 0

        # Daily registrations time series
        daily_registrations_q = (
            select(
                cast(User.created_at, Date).label("date"),
                func.count(User.id).label("count"),
            )
            .where(
                and_(
                    User.is_deleted == False,  # noqa: E712
                    User.created_at >= start,
                    User.created_at <= end,
                )
            )
            .group_by(cast(User.created_at, Date))
            .order_by(cast(User.created_at, Date))
        )
        daily_reg_result = await db.execute(daily_registrations_q)
        daily_registrations = [
            {"date": row[0].isoformat(), "count": row[1]}
            for row in daily_reg_result.all()
        ]

        return {
            "dau": dau,
            "total_users": total_users,
            "new_users": new_users,
            "active_enrollments": active_enrollments,
            "ai_sessions": ai_sessions,
            "live_sessions": live_sessions,
            "daily_registrations": daily_registrations,
            "date_range": {
                "start": start.isoformat(),
                "end": end.isoformat(),
            },
            "generated_at": now.isoformat(),
        }

    except Exception as e:
        logger.error(f"Error fetching platform health: {e}")
        raise


async def get_content_performance(
    db: AsyncSession,
    date_range: Optional[Dict[str, str]] = None,
) -> Dict[str, Any]:
    """
    Content effectiveness metrics: published content, completion rates,
    content by type, and review pipeline stats.
    """
    try:
        start, end = _parse_date_range(date_range)
        now = datetime.utcnow()

        # Total published content
        published_q = select(func.count(StaffContentItem.id)).where(
            StaffContentItem.status == "published"
        )
        published_result = await db.execute(published_q)
        total_published: int = published_result.scalar() or 0

        # Content created in date range
        created_q = select(func.count(StaffContentItem.id)).where(
            and_(
                StaffContentItem.created_at >= start,
                StaffContentItem.created_at <= end,
            )
        )
        created_result = await db.execute(created_q)
        content_created: int = created_result.scalar() or 0

        # Content by status
        status_q = (
            select(
                StaffContentItem.status,
                func.count(StaffContentItem.id).label("count"),
            )
            .group_by(StaffContentItem.status)
        )
        status_result = await db.execute(status_q)
        by_status = {row[0]: row[1] for row in status_result.all()}

        # Content by type
        type_q = (
            select(
                StaffContentItem.content_type,
                func.count(StaffContentItem.id).label("count"),
            )
            .group_by(StaffContentItem.content_type)
        )
        type_result = await db.execute(type_q)
        by_type = {row[0]: row[1] for row in type_result.all()}

        # Completion rates from enrollments
        completed_enrollments_q = select(func.count(Enrollment.id)).where(
            and_(
                Enrollment.is_deleted == False,  # noqa: E712
                Enrollment.status == "completed",
                Enrollment.enrolled_at >= start,
            )
        )
        completed_result = await db.execute(completed_enrollments_q)
        completed: int = completed_result.scalar() or 0

        total_enrollments_q = select(func.count(Enrollment.id)).where(
            and_(
                Enrollment.is_deleted == False,  # noqa: E712
                Enrollment.enrolled_at >= start,
            )
        )
        total_enr_result = await db.execute(total_enrollments_q)
        total_enr: int = total_enr_result.scalar() or 0

        completion_rate = round((completed / total_enr * 100), 1) if total_enr > 0 else 0.0

        return {
            "total_published": total_published,
            "content_created": content_created,
            "by_status": by_status,
            "by_type": by_type,
            "completion_rate": completion_rate,
            "completed_enrollments": completed,
            "total_enrollments": total_enr,
            "date_range": {
                "start": start.isoformat(),
                "end": end.isoformat(),
            },
            "generated_at": now.isoformat(),
        }

    except Exception as e:
        logger.error(f"Error fetching content performance: {e}")
        raise


async def get_support_metrics(
    db: AsyncSession,
    date_range: Optional[Dict[str, str]] = None,
) -> Dict[str, Any]:
    """
    Support team metrics: resolution time, CSAT trends, ticket volumes,
    SLA compliance rates.
    """
    try:
        start, end = _parse_date_range(date_range)
        now = datetime.utcnow()

        # Total tickets in range
        total_tickets_q = select(func.count(StaffTicket.id)).where(
            and_(
                StaffTicket.created_at >= start,
                StaffTicket.created_at <= end,
            )
        )
        total_result = await db.execute(total_tickets_q)
        total_tickets: int = total_result.scalar() or 0

        # Tickets by status
        status_q = (
            select(
                StaffTicket.status,
                func.count(StaffTicket.id).label("count"),
            )
            .where(
                and_(
                    StaffTicket.created_at >= start,
                    StaffTicket.created_at <= end,
                )
            )
            .group_by(StaffTicket.status)
        )
        status_result = await db.execute(status_q)
        by_status = {row[0]: row[1] for row in status_result.all()}

        # Average resolution time (minutes)
        avg_resolution_q = select(
            func.avg(
                func.extract(
                    "epoch",
                    StaffTicket.resolved_at - StaffTicket.created_at,
                )
                / 60
            )
        ).where(
            and_(
                StaffTicket.resolved_at.isnot(None),
                StaffTicket.created_at >= start,
                StaffTicket.created_at <= end,
            )
        )
        avg_res_result = await db.execute(avg_resolution_q)
        avg_resolution = avg_res_result.scalar()
        avg_resolution_minutes = round(float(avg_resolution), 1) if avg_resolution else 0.0

        # Average first response time (minutes)
        avg_first_response_q = select(
            func.avg(
                func.extract(
                    "epoch",
                    StaffTicket.first_response_at - StaffTicket.created_at,
                )
                / 60
            )
        ).where(
            and_(
                StaffTicket.first_response_at.isnot(None),
                StaffTicket.created_at >= start,
                StaffTicket.created_at <= end,
            )
        )
        avg_fr_result = await db.execute(avg_first_response_q)
        avg_first_response = avg_fr_result.scalar()
        avg_first_response_minutes = round(float(avg_first_response), 1) if avg_first_response else 0.0

        # CSAT average
        csat_q = select(func.avg(StaffTicket.csat_score)).where(
            and_(
                StaffTicket.csat_score.isnot(None),
                StaffTicket.created_at >= start,
                StaffTicket.created_at <= end,
            )
        )
        csat_result = await db.execute(csat_q)
        avg_csat = csat_result.scalar()
        csat_average = round(float(avg_csat), 2) if avg_csat else 0.0

        # SLA compliance (percentage of non-breached resolved tickets)
        resolved_q = select(func.count(StaffTicket.id)).where(
            and_(
                StaffTicket.resolved_at.isnot(None),
                StaffTicket.sla_deadline.isnot(None),
                StaffTicket.created_at >= start,
                StaffTicket.created_at <= end,
            )
        )
        resolved_result = await db.execute(resolved_q)
        total_resolved_with_sla: int = resolved_result.scalar() or 0

        compliant_q = select(func.count(StaffTicket.id)).where(
            and_(
                StaffTicket.resolved_at.isnot(None),
                StaffTicket.sla_deadline.isnot(None),
                StaffTicket.sla_breached == False,  # noqa: E712
                StaffTicket.created_at >= start,
                StaffTicket.created_at <= end,
            )
        )
        compliant_result = await db.execute(compliant_q)
        sla_compliant: int = compliant_result.scalar() or 0

        sla_compliance_rate = (
            round((sla_compliant / total_resolved_with_sla * 100), 1)
            if total_resolved_with_sla > 0
            else 100.0
        )

        # Daily ticket volume time series
        daily_q = (
            select(
                cast(StaffTicket.created_at, Date).label("date"),
                func.count(StaffTicket.id).label("count"),
            )
            .where(
                and_(
                    StaffTicket.created_at >= start,
                    StaffTicket.created_at <= end,
                )
            )
            .group_by(cast(StaffTicket.created_at, Date))
            .order_by(cast(StaffTicket.created_at, Date))
        )
        daily_result = await db.execute(daily_q)
        daily_volumes = [
            {"date": row[0].isoformat(), "count": row[1]}
            for row in daily_result.all()
        ]

        return {
            "total_tickets": total_tickets,
            "by_status": by_status,
            "avg_resolution_minutes": avg_resolution_minutes,
            "avg_first_response_minutes": avg_first_response_minutes,
            "csat_average": csat_average,
            "sla_compliance_rate": sla_compliance_rate,
            "daily_volumes": daily_volumes,
            "date_range": {
                "start": start.isoformat(),
                "end": end.isoformat(),
            },
            "generated_at": now.isoformat(),
        }

    except Exception as e:
        logger.error(f"Error fetching support metrics: {e}")
        raise
