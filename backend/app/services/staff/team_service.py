"""
Team Service

Staff performance metrics, team pulse overviews, AI-powered workload
rebalancing suggestions, and learning resource retrieval.
"""

import logging
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.staff.staff_profile import StaffProfile, StaffTeam
from app.models.staff.ticket import StaffTicket
from app.models.staff.moderation_queue import StaffModerationItem
from app.models.staff.live_session import LiveSession
from app.models.user import User
from app.services.ai_orchestrator import AIOrchestrator

logger = logging.getLogger(__name__)


async def get_my_performance(
    db: AsyncSession,
    user_id: str,
) -> Dict[str, Any]:
    """
    Compute task metrics, quality metrics, and AI insights for a
    single staff member's performance dashboard.
    """
    try:
        now = datetime.utcnow()
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        # Fetch staff profile
        profile_q = select(StaffProfile).where(StaffProfile.user_id == user_id)
        profile_result = await db.execute(profile_q)
        profile = profile_result.scalar_one_or_none()

        # Fetch user name
        user_q = select(User).where(User.id == user_id)
        user_result = await db.execute(user_q)
        user = user_result.scalar_one_or_none()
        staff_name = f"{user.first_name} {user.last_name}" if user else "Staff Member"

        # Task metrics
        total_assigned_q = select(func.count(StaffTicket.id)).where(
            and_(
                StaffTicket.assigned_to == user_id,
                StaffTicket.created_at >= month_start,
            )
        )
        total_assigned_result = await db.execute(total_assigned_q)
        total_assigned: int = total_assigned_result.scalar() or 0

        completed_q = select(func.count(StaffTicket.id)).where(
            and_(
                StaffTicket.assigned_to == user_id,
                StaffTicket.status.in_(["resolved", "closed"]),
                StaffTicket.created_at >= month_start,
            )
        )
        completed_result = await db.execute(completed_q)
        completed: int = completed_result.scalar() or 0

        in_progress_q = select(func.count(StaffTicket.id)).where(
            and_(
                StaffTicket.assigned_to == user_id,
                StaffTicket.status == "in_progress",
            )
        )
        in_progress_result = await db.execute(in_progress_q)
        in_progress: int = in_progress_result.scalar() or 0

        overdue_q = select(func.count(StaffTicket.id)).where(
            and_(
                StaffTicket.assigned_to == user_id,
                StaffTicket.sla_breached == True,  # noqa: E712
                StaffTicket.status.in_(["open", "in_progress"]),
            )
        )
        overdue_result = await db.execute(overdue_q)
        overdue: int = overdue_result.scalar() or 0

        completion_rate = round((completed / total_assigned * 100), 1) if total_assigned > 0 else 0.0

        # Quality metrics
        csat_q = select(func.avg(StaffTicket.csat_score)).where(
            and_(
                StaffTicket.assigned_to == user_id,
                StaffTicket.csat_score.isnot(None),
                StaffTicket.created_at >= month_start,
            )
        )
        csat_result = await db.execute(csat_q)
        csat_avg = csat_result.scalar()
        csat_average = round(float(csat_avg), 2) if csat_avg else 0.0

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
                StaffTicket.assigned_to == user_id,
                StaffTicket.first_response_at.isnot(None),
                StaffTicket.created_at >= month_start,
            )
        )
        avg_fr_result = await db.execute(avg_first_response_q)
        avg_fr = avg_fr_result.scalar()
        first_response_avg = round(float(avg_fr), 1) if avg_fr else 0.0

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
                StaffTicket.assigned_to == user_id,
                StaffTicket.resolved_at.isnot(None),
                StaffTicket.created_at >= month_start,
            )
        )
        avg_res_result = await db.execute(avg_resolution_q)
        avg_res = avg_res_result.scalar()
        resolution_avg = round(float(avg_res), 1) if avg_res else 0.0

        # SLA compliance rate
        sla_tickets_q = select(func.count(StaffTicket.id)).where(
            and_(
                StaffTicket.assigned_to == user_id,
                StaffTicket.sla_deadline.isnot(None),
                StaffTicket.resolved_at.isnot(None),
                StaffTicket.created_at >= month_start,
            )
        )
        sla_tickets_result = await db.execute(sla_tickets_q)
        total_sla_tickets: int = sla_tickets_result.scalar() or 0

        sla_compliant_q = select(func.count(StaffTicket.id)).where(
            and_(
                StaffTicket.assigned_to == user_id,
                StaffTicket.sla_deadline.isnot(None),
                StaffTicket.sla_breached == False,  # noqa: E712
                StaffTicket.resolved_at.isnot(None),
                StaffTicket.created_at >= month_start,
            )
        )
        sla_compliant_result = await db.execute(sla_compliant_q)
        sla_compliant: int = sla_compliant_result.scalar() or 0

        sla_compliance = (
            round((sla_compliant / total_sla_tickets * 100), 1)
            if total_sla_tickets > 0
            else 100.0
        )

        # AI insights
        ai_insights = []
        if completion_rate < 50 and total_assigned > 5:
            ai_insights.append(
                "Your completion rate is below 50%. Consider prioritising "
                "quick-win tickets to improve throughput."
            )
        if overdue > 0:
            ai_insights.append(
                f"You have {overdue} overdue ticket(s). Addressing these first "
                "will improve SLA compliance."
            )
        if csat_average >= 4.0:
            ai_insights.append(
                "Your CSAT score is excellent. Keep up the quality responses!"
            )

        return {
            "staff_id": str(user_id),
            "staff_name": staff_name,
            "department": profile.department if profile else None,
            "position": profile.position if profile else None,
            "tasks": {
                "total_assigned": total_assigned,
                "completed": completed,
                "in_progress": in_progress,
                "overdue": overdue,
                "completion_rate": completion_rate,
            },
            "quality": {
                "csat_average": csat_average,
                "content_approval_rate": 0.0,
                "first_response_time_avg_minutes": first_response_avg,
                "resolution_time_avg_minutes": resolution_avg,
                "sla_compliance_rate": sla_compliance,
            },
            "ai_insights": ai_insights,
            "period": "current_month",
            "trends": {},
        }

    except Exception as e:
        logger.error(f"Error fetching performance for user {user_id}: {e}")
        raise


async def get_team_pulse(
    db: AsyncSession,
    team_id_or_department: str,
) -> Dict[str, Any]:
    """
    Return team member summaries and workload distribution for a team
    or department.
    """
    try:
        # Determine if input is a team_id or department name
        team = None
        team_q = select(StaffTeam).where(StaffTeam.id == team_id_or_department)
        team_result = await db.execute(team_q)
        team = team_result.scalar_one_or_none()

        if team:
            # Get members by team
            members_q = select(StaffProfile).where(
                StaffProfile.team_id == team.id
            )
        else:
            # Treat as department name
            members_q = select(StaffProfile).where(
                StaffProfile.department == team_id_or_department
            )

        members_result = await db.execute(members_q)
        members = members_result.scalars().all()

        member_summaries = []
        total_open_tickets = 0
        total_pending_reviews = 0
        workload_scores = []

        for member in members:
            user_id = str(member.user_id)

            # Open tickets for this member
            open_q = select(func.count(StaffTicket.id)).where(
                and_(
                    StaffTicket.assigned_to == user_id,
                    StaffTicket.status.in_(["open", "in_progress"]),
                )
            )
            open_result = await db.execute(open_q)
            open_tickets: int = open_result.scalar() or 0

            # Pending reviews
            reviews_q = select(func.count(StaffModerationItem.id)).where(
                and_(
                    StaffModerationItem.assigned_to == user_id,
                    StaffModerationItem.status == "pending",
                )
            )
            reviews_result = await db.execute(reviews_q)
            pending_reviews: int = reviews_result.scalar() or 0

            # Active sessions
            sessions_q = select(func.count(LiveSession.id)).where(
                and_(
                    LiveSession.host_id == user_id,
                    LiveSession.status == "live",
                )
            )
            sessions_result = await db.execute(sessions_q)
            active_sessions: int = sessions_result.scalar() or 0

            # Workload score (normalized: 10 items = 1.0)
            workload_score = min(
                (open_tickets + pending_reviews + active_sessions) / 10.0,
                1.0,
            )
            workload_scores.append(workload_score)

            total_open_tickets += open_tickets
            total_pending_reviews += pending_reviews

            # Fetch user name
            user_q = select(User).where(User.id == member.user_id)
            user_result = await db.execute(user_q)
            user = user_result.scalar_one_or_none()
            name = f"{user.first_name} {user.last_name}" if user else "Unknown"

            member_summaries.append({
                "user_id": user_id,
                "name": name,
                "position": member.position,
                "department": member.department,
                "open_tickets": open_tickets,
                "pending_reviews": pending_reviews,
                "active_sessions": active_sessions,
                "sla_compliance_rate": 0.0,
                "csat_average": 0.0,
                "workload_score": round(workload_score, 2),
                "status": "available",
            })

        # Workload distribution
        avg_workload = (
            sum(workload_scores) / len(workload_scores)
            if workload_scores
            else 0.0
        )
        max_workload = max(workload_scores) if workload_scores else 0.0
        min_workload = min(workload_scores) if workload_scores else 0.0
        imbalance = max_workload - min_workload if workload_scores else 0.0

        dept = team.department if team else team_id_or_department
        distribution = [
            {
                "department": dept,
                "total_staff": len(members),
                "average_workload": round(avg_workload, 2),
                "max_workload": round(max_workload, 2),
                "min_workload": round(min_workload, 2),
                "imbalance_score": round(imbalance, 2),
            }
        ]

        return {
            "team_id": str(team.id) if team else None,
            "team_name": team.name if team else team_id_or_department,
            "members": member_summaries,
            "workload_distribution": distribution,
            "total_open_tickets": total_open_tickets,
            "total_pending_reviews": total_pending_reviews,
            "overall_sla_compliance": 0.0,
            "ai_suggestions": [],
        }

    except Exception as e:
        logger.error(f"Error fetching team pulse: {e}")
        raise


async def get_workload_suggestions(
    db: AsyncSession,
    department: str,
) -> Dict[str, Any]:
    """
    Use AI to suggest workload rebalancing for a department.
    """
    try:
        # Get team pulse data
        pulse = await get_team_pulse(db, department)
        members = pulse.get("members", [])

        if not members:
            return {
                "suggestions": [],
                "current_imbalance": 0.0,
                "projected_imbalance": 0.0,
                "affected_staff_count": 0,
            }

        # Build context for AI
        member_summary = "; ".join(
            f"{m['name']}: {m['open_tickets']} tickets, "
            f"{m['pending_reviews']} reviews, workload={m['workload_score']}"
            for m in members
        )

        suggestions = []
        current_imbalance = pulse["workload_distribution"][0]["imbalance_score"] if pulse["workload_distribution"] else 0.0

        try:
            orchestrator = AIOrchestrator(db)
            await orchestrator.load_providers()
            result = await orchestrator.route_query(
                query=(
                    f"Analyse this team workload and suggest rebalancing: {member_summary}. "
                    "Return JSON array of suggestions with: suggestion_type (rebalance/reassign), "
                    "description, from_staff_id, to_staff_id, impact_score (0-1), rationale."
                ),
                context={"task": "workload_rebalancing", "department": department},
                response_mode="text",
            )

            ai_message = result.get("message", "")
            import json

            start_idx = ai_message.find("[")
            end_idx = ai_message.rfind("]") + 1
            if start_idx != -1 and end_idx > start_idx:
                parsed = json.loads(ai_message[start_idx:end_idx])
                for item in parsed[:5]:
                    suggestions.append({
                        "suggestion_type": item.get("suggestion_type", "rebalance"),
                        "description": item.get("description", ""),
                        "from_staff_id": item.get("from_staff_id"),
                        "to_staff_id": item.get("to_staff_id"),
                        "affected_items": item.get("affected_items", []),
                        "impact_score": float(item.get("impact_score", 0.5)),
                        "rationale": item.get("rationale", ""),
                    })

        except Exception as ai_error:
            logger.warning(f"AI workload suggestion failed: {ai_error}")

            # Rule-based fallback
            overloaded = [m for m in members if m["workload_score"] > 0.7]
            underloaded = [m for m in members if m["workload_score"] < 0.3]

            if overloaded and underloaded:
                suggestions.append({
                    "suggestion_type": "rebalance",
                    "description": (
                        f"Reassign tickets from {overloaded[0]['name']} "
                        f"(workload: {overloaded[0]['workload_score']}) to "
                        f"{underloaded[0]['name']} "
                        f"(workload: {underloaded[0]['workload_score']})"
                    ),
                    "from_staff_id": overloaded[0]["user_id"],
                    "to_staff_id": underloaded[0]["user_id"],
                    "affected_items": [],
                    "impact_score": 0.6,
                    "rationale": "Significant workload imbalance detected.",
                })

        return {
            "suggestions": suggestions,
            "current_imbalance": current_imbalance,
            "projected_imbalance": max(0, current_imbalance - 0.2) if suggestions else current_imbalance,
            "affected_staff_count": len(members),
        }

    except Exception as e:
        logger.error(f"Error generating workload suggestions: {e}")
        raise


async def get_learning_resources(
    db: AsyncSession,
    filters: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Return training/wiki learning resources for staff development.

    Currently returns placeholder resources. In production, these would
    be stored in a dedicated learning resources table.
    """
    try:
        filters = filters or {}
        now = datetime.utcnow()

        # Placeholder resources (to be replaced with DB queries)
        resources = [
            {
                "id": "lr-001",
                "title": "Staff Onboarding Guide",
                "resource_type": "wiki",
                "url": "/wiki/onboarding",
                "description": "Complete guide for new staff members.",
                "category": "onboarding",
                "is_required": True,
                "completion_status": None,
                "created_at": now.isoformat(),
            },
            {
                "id": "lr-002",
                "title": "Content Moderation Best Practices",
                "resource_type": "training",
                "url": "/training/moderation",
                "description": "Guidelines for content moderation and safety reviews.",
                "category": "moderation",
                "is_required": True,
                "completion_status": None,
                "created_at": now.isoformat(),
            },
            {
                "id": "lr-003",
                "title": "CBC Curriculum Alignment Workshop",
                "resource_type": "video",
                "url": "/training/cbc-alignment",
                "description": "Video training on aligning content with CBC standards.",
                "category": "curriculum",
                "is_required": False,
                "completion_status": None,
                "created_at": now.isoformat(),
            },
        ]

        # Apply filters
        if filters.get("category"):
            resources = [r for r in resources if r["category"] == filters["category"]]
        if filters.get("is_required") is not None:
            resources = [r for r in resources if r["is_required"] == filters["is_required"]]

        categories = list(set(r["category"] for r in resources))

        return {
            "items": resources,
            "total": len(resources),
            "categories": categories,
        }

    except Exception as e:
        logger.error(f"Error fetching learning resources: {e}")
        raise
