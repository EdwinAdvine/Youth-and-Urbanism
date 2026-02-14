"""
Staff Dashboard Service

Aggregates data for the staff member's personalised "My Focus" view,
including today's tasks, pending tickets, moderation items, upcoming sessions,
and an AI-prioritised agenda.
"""

import logging
import uuid
from datetime import datetime, timedelta
from typing import Any, Dict, List

from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.staff.ticket import StaffTicket
from app.models.staff.moderation_queue import StaffModerationItem
from app.models.staff.content_item import StaffContentItem
from app.models.staff.live_session import LiveSession
from app.models.staff.student_journey import StudentJourney
from app.models.user import User
from app.services.ai_orchestrator import AIOrchestrator

logger = logging.getLogger(__name__)


async def get_dashboard_stats(db: AsyncSession, user_id: str) -> Dict[str, Any]:
    """
    Return numeric counts for the staff dashboard stat cards.

    Aggregates: tickets assigned, tickets resolved today, moderation pending,
    content in review, active sessions, students monitored, SLA at risk,
    and average response time.
    """
    try:
        now = datetime.utcnow()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

        # Tickets assigned to this staff member (open/in_progress)
        tickets_assigned_q = select(func.count(StaffTicket.id)).where(
            and_(
                StaffTicket.assigned_to == user_id,
                StaffTicket.status.in_(["open", "in_progress"]),
            )
        )
        tickets_assigned_result = await db.execute(tickets_assigned_q)
        tickets_assigned: int = tickets_assigned_result.scalar() or 0

        # Tickets resolved today by this staff member
        tickets_resolved_q = select(func.count(StaffTicket.id)).where(
            and_(
                StaffTicket.assigned_to == user_id,
                StaffTicket.status == "resolved",
                StaffTicket.resolved_at >= today_start,
            )
        )
        tickets_resolved_result = await db.execute(tickets_resolved_q)
        tickets_resolved_today: int = tickets_resolved_result.scalar() or 0

        # Moderation items pending
        moderation_pending_q = select(func.count(StaffModerationItem.id)).where(
            StaffModerationItem.status == "pending"
        )
        moderation_pending_result = await db.execute(moderation_pending_q)
        moderation_pending: int = moderation_pending_result.scalar() or 0

        # Content in review
        content_in_review_q = select(func.count(StaffContentItem.id)).where(
            StaffContentItem.status == "in_review"
        )
        content_in_review_result = await db.execute(content_in_review_q)
        content_in_review: int = content_in_review_result.scalar() or 0

        # Active live sessions
        active_sessions_q = select(func.count(LiveSession.id)).where(
            LiveSession.status.in_(["live", "scheduled"])
        )
        active_sessions_result = await db.execute(active_sessions_q)
        active_sessions: int = active_sessions_result.scalar() or 0

        # Students monitored (high / critical risk)
        students_monitored_q = select(func.count(StudentJourney.id)).where(
            StudentJourney.risk_level.in_(["high", "critical"])
        )
        students_monitored_result = await db.execute(students_monitored_q)
        students_monitored: int = students_monitored_result.scalar() or 0

        # SLA at risk (deadline within next 30 minutes, not yet breached)
        sla_risk_threshold = now + timedelta(minutes=30)
        sla_at_risk_q = select(func.count(StaffTicket.id)).where(
            and_(
                StaffTicket.sla_breached == False,  # noqa: E712
                StaffTicket.sla_deadline.isnot(None),
                StaffTicket.sla_deadline <= sla_risk_threshold,
                StaffTicket.status.in_(["open", "in_progress"]),
            )
        )
        sla_at_risk_result = await db.execute(sla_at_risk_q)
        sla_at_risk: int = sla_at_risk_result.scalar() or 0

        # Average response time (minutes) for this staff member's resolved tickets
        avg_response_q = select(
            func.avg(
                func.extract(
                    "epoch",
                    StaffTicket.first_response_at - StaffTicket.created_at,
                )
                / 60
            )
        ).where(
            and_(
                StaffTicket.assigned_to == user_id,
                StaffTicket.first_response_at.isnot(None),
            )
        )
        avg_response_result = await db.execute(avg_response_q)
        avg_response_time = avg_response_result.scalar()
        avg_response_time_minutes = round(float(avg_response_time), 1) if avg_response_time else 0.0

        return {
            "tickets_assigned": tickets_assigned,
            "tickets_resolved_today": tickets_resolved_today,
            "moderation_pending": moderation_pending,
            "content_in_review": content_in_review,
            "active_sessions": active_sessions,
            "students_monitored": students_monitored,
            "sla_at_risk": sla_at_risk,
            "avg_response_time_minutes": avg_response_time_minutes,
        }

    except Exception as e:
        logger.error(f"Error fetching dashboard stats for user {user_id}: {e}")
        raise


async def get_my_focus(db: AsyncSession, user_id: str) -> Dict[str, Any]:
    """
    Aggregate today's focus items for the staff member.

    Combines urgent tickets, moderation highlights, approaching deadlines,
    student risk flags, and AI anomalies into a single response.
    """
    try:
        now = datetime.utcnow()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

        # Urgent tickets assigned to this user
        urgent_tickets_q = (
            select(StaffTicket)
            .where(
                and_(
                    StaffTicket.assigned_to == user_id,
                    StaffTicket.status.in_(["open", "in_progress"]),
                    StaffTicket.priority.in_(["critical", "high"]),
                )
            )
            .order_by(StaffTicket.created_at.asc())
            .limit(10)
        )
        urgent_tickets_result = await db.execute(urgent_tickets_q)
        urgent_tickets = [
            {
                "id": str(t.id),
                "ticket_number": t.ticket_number,
                "subject": t.subject,
                "priority": t.priority,
                "status": t.status,
                "sla_deadline": t.sla_deadline.isoformat() if t.sla_deadline else None,
                "sla_breached": t.sla_breached,
                "created_at": t.created_at.isoformat(),
            }
            for t in urgent_tickets_result.scalars().all()
        ]

        # Moderation highlights (critical/high priority pending items)
        moderation_q = (
            select(StaffModerationItem)
            .where(
                and_(
                    StaffModerationItem.status == "pending",
                    StaffModerationItem.priority.in_(["critical", "high"]),
                )
            )
            .order_by(StaffModerationItem.ai_risk_score.desc().nullslast())
            .limit(5)
        )
        moderation_result = await db.execute(moderation_q)
        moderation_highlights = [
            {
                "id": str(m.id),
                "title": m.title,
                "content_type": m.content_type,
                "priority": m.priority,
                "ai_risk_score": m.ai_risk_score,
                "created_at": m.created_at.isoformat(),
            }
            for m in moderation_result.scalars().all()
        ]

        # Tasks / deadlines: SLA deadlines approaching today
        sla_deadline_q = (
            select(StaffTicket)
            .where(
                and_(
                    StaffTicket.assigned_to == user_id,
                    StaffTicket.sla_deadline.isnot(None),
                    StaffTicket.sla_deadline >= now,
                    StaffTicket.sla_deadline <= now + timedelta(hours=8),
                    StaffTicket.status.in_(["open", "in_progress"]),
                )
            )
            .order_by(StaffTicket.sla_deadline.asc())
            .limit(5)
        )
        sla_deadline_result = await db.execute(sla_deadline_q)
        tasks_deadlines = [
            {
                "id": str(t.id),
                "ticket_number": t.ticket_number,
                "subject": t.subject,
                "sla_deadline": t.sla_deadline.isoformat() if t.sla_deadline else None,
                "time_remaining_minutes": round(
                    (t.sla_deadline - now).total_seconds() / 60, 1
                )
                if t.sla_deadline
                else None,
            }
            for t in sla_deadline_result.scalars().all()
        ]

        # Student risk flags
        student_flags_q = (
            select(StudentJourney)
            .where(StudentJourney.risk_level.in_(["high", "critical"]))
            .order_by(StudentJourney.updated_at.desc())
            .limit(5)
        )
        student_flags_result = await db.execute(student_flags_q)
        student_flags = [
            {
                "id": str(s.id),
                "student_id": str(s.student_id),
                "risk_level": s.risk_level,
                "risk_factors": s.risk_factors,
                "last_assessed_at": s.last_assessed_at.isoformat() if s.last_assessed_at else None,
            }
            for s in student_flags_result.scalars().all()
        ]

        # AI anomalies placeholder (would come from AI monitoring service)
        ai_anomalies: List[Dict[str, Any]] = []

        # Fetch stats
        stats = await get_dashboard_stats(db, user_id)

        # Generate AI agenda
        ai_agenda = await get_ai_agenda(db, user_id)

        return {
            "urgent_tickets": urgent_tickets,
            "moderation_highlights": moderation_highlights,
            "tasks_deadlines": tasks_deadlines,
            "student_flags": student_flags,
            "ai_anomalies": ai_anomalies,
            "ai_agenda": ai_agenda,
            "stats": stats,
        }

    except Exception as e:
        logger.error(f"Error building My Focus for user {user_id}: {e}")
        raise


async def get_ai_agenda(db: AsyncSession, user_id: str) -> List[Dict[str, Any]]:
    """
    Call the AI orchestrator to prioritise today's work items into an
    intelligent agenda for the staff member.

    Falls back to a rule-based priority list if the AI service is unavailable.
    """
    try:
        # Gather work items summary for AI context
        now = datetime.utcnow()

        open_tickets_q = select(func.count(StaffTicket.id)).where(
            and_(
                StaffTicket.assigned_to == user_id,
                StaffTicket.status.in_(["open", "in_progress"]),
            )
        )
        open_tickets_result = await db.execute(open_tickets_q)
        open_tickets_count = open_tickets_result.scalar() or 0

        moderation_q = select(func.count(StaffModerationItem.id)).where(
            StaffModerationItem.status == "pending"
        )
        moderation_result = await db.execute(moderation_q)
        moderation_count = moderation_result.scalar() or 0

        upcoming_sessions_q = select(func.count(LiveSession.id)).where(
            and_(
                LiveSession.host_id == user_id,
                LiveSession.status == "scheduled",
                LiveSession.scheduled_at >= now,
                LiveSession.scheduled_at <= now + timedelta(hours=12),
            )
        )
        upcoming_sessions_result = await db.execute(upcoming_sessions_q)
        upcoming_sessions_count = upcoming_sessions_result.scalar() or 0

        # Build context prompt for AI
        context_summary = (
            f"Staff member has {open_tickets_count} open tickets, "
            f"{moderation_count} moderation items pending, and "
            f"{upcoming_sessions_count} upcoming sessions today. "
            "Prioritise the most impactful work items for today."
        )

        try:
            orchestrator = AIOrchestrator(db)
            await orchestrator.load_providers()
            result = await orchestrator.route_query(
                query=(
                    "You are a staff productivity assistant. Based on this workload: "
                    f"{context_summary} "
                    "Return a JSON array of 3-5 prioritised agenda items with fields: "
                    "title, description, priority (critical/high/medium/low), "
                    "category (ticket/moderation/content/session), ai_rationale."
                ),
                context={"user_id": user_id},
                response_mode="text",
            )
            # Attempt to parse the AI response; if structured JSON parsing
            # fails, fall through to rule-based fallback.
            import json

            ai_text = result.get("message", "")
            # Try to extract JSON from the response
            start_idx = ai_text.find("[")
            end_idx = ai_text.rfind("]") + 1
            if start_idx != -1 and end_idx > start_idx:
                parsed = json.loads(ai_text[start_idx:end_idx])
                agenda = []
                for item in parsed[:5]:
                    agenda.append({
                        "id": str(uuid.uuid4()),
                        "title": item.get("title", "Untitled"),
                        "description": item.get("description", ""),
                        "priority": item.get("priority", "medium"),
                        "category": item.get("category", "ticket"),
                        "due_at": None,
                        "ai_rationale": item.get("ai_rationale", ""),
                        "action_url": "",
                    })
                return agenda

        except Exception as ai_error:
            logger.warning(f"AI agenda generation failed, using rule-based: {ai_error}")

        # Rule-based fallback agenda
        agenda: List[Dict[str, Any]] = []
        if open_tickets_count > 0:
            agenda.append({
                "id": str(uuid.uuid4()),
                "title": f"Resolve {open_tickets_count} open tickets",
                "description": "Focus on critical and high-priority tickets first.",
                "priority": "high",
                "category": "ticket",
                "due_at": None,
                "ai_rationale": "Tickets directly impact customer satisfaction and SLA compliance.",
                "action_url": "/staff/tickets?status=open",
            })
        if moderation_count > 0:
            agenda.append({
                "id": str(uuid.uuid4()),
                "title": f"Review {moderation_count} moderation items",
                "description": "Clear the moderation queue to ensure content safety.",
                "priority": "high" if moderation_count > 5 else "medium",
                "category": "moderation",
                "due_at": None,
                "ai_rationale": "Pending moderation items block content publication.",
                "action_url": "/staff/moderation?status=pending",
            })
        if upcoming_sessions_count > 0:
            agenda.append({
                "id": str(uuid.uuid4()),
                "title": f"Prepare for {upcoming_sessions_count} upcoming session(s)",
                "description": "Review materials and ensure session rooms are ready.",
                "priority": "medium",
                "category": "session",
                "due_at": None,
                "ai_rationale": "Preparation improves session quality and student engagement.",
                "action_url": "/staff/sessions?status=scheduled",
            })

        return agenda

    except Exception as e:
        logger.error(f"Error generating AI agenda for user {user_id}: {e}")
        return []
