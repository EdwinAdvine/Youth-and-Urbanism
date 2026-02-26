"""
SLA Engine

Service-level agreement computation, breach detection, and escalation
management. Designed to run as both request-time helpers (resolve_sla_policy,
compute_sla_deadline, get_sla_status) and as a background task
(check_sla_breaches).
"""

import logging
import uuid
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from sqlalchemy import select, func, and_, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.staff.sla_policy import SLAPolicy, SLAEscalation
from app.models.staff.ticket import StaffTicket

logger = logging.getLogger(__name__)


async def resolve_sla_policy(
    db: AsyncSession,
    priority: str,
    category: Optional[str] = None,
) -> Optional[SLAPolicy]:
    """
    Find the most specific active SLA policy for a given priority and category.

    Matching order:
    1. Exact match on priority + category
    2. Priority-only match (category IS NULL)
    3. None if no policy exists
    """
    try:
        # Try exact match first
        if category:
            exact_q = (
                select(SLAPolicy)
                .where(
                    and_(
                        SLAPolicy.is_active == True,  # noqa: E712
                        SLAPolicy.priority == priority,
                        SLAPolicy.category == category,
                    )
                )
                .limit(1)
            )
            result = await db.execute(exact_q)
            policy = result.scalar_one_or_none()
            if policy:
                logger.debug(
                    f"Resolved SLA policy '{policy.name}' for "
                    f"priority={priority}, category={category}"
                )
                return policy

        # Fallback to priority-only
        priority_q = (
            select(SLAPolicy)
            .where(
                and_(
                    SLAPolicy.is_active == True,  # noqa: E712
                    SLAPolicy.priority == priority,
                    SLAPolicy.category.is_(None),
                )
            )
            .limit(1)
        )
        result = await db.execute(priority_q)
        policy = result.scalar_one_or_none()

        if policy:
            logger.debug(
                f"Resolved SLA policy '{policy.name}' (priority-only) for "
                f"priority={priority}"
            )
        else:
            logger.debug(f"No SLA policy found for priority={priority}, category={category}")

        return policy

    except Exception as e:
        logger.error(f"Error resolving SLA policy: {e}")
        return None


def compute_sla_deadline(policy: SLAPolicy, created_at: datetime) -> datetime:
    """
    Calculate the SLA resolution deadline from policy and creation time.

    Uses the policy's resolution_minutes to determine the absolute deadline.
    Business-hours adjustment could be added here in the future.
    """
    deadline = created_at + timedelta(minutes=policy.resolution_minutes)
    logger.debug(
        f"SLA deadline computed: {deadline.isoformat()} "
        f"(policy={policy.name}, resolution={policy.resolution_minutes}m)"
    )
    return deadline


async def check_sla_breaches(db: AsyncSession) -> Dict[str, Any]:
    """
    Background task: find overdue tickets, mark them as breached,
    and trigger appropriate escalation actions.

    Should be called periodically (e.g., every 5 minutes) by a scheduler.

    Returns a summary of breaches detected and escalations triggered.
    """
    try:
        now = datetime.utcnow()
        breaches_detected = 0
        escalations_triggered = 0

        # Find tickets that have passed their SLA deadline but are not yet marked breached
        overdue_q = (
            select(StaffTicket)
            .where(
                and_(
                    StaffTicket.sla_deadline.isnot(None),
                    StaffTicket.sla_deadline <= now,
                    StaffTicket.sla_breached == False,  # noqa: E712
                    StaffTicket.status.in_(["open", "in_progress"]),
                )
            )
        )
        result = await db.execute(overdue_q)
        overdue_tickets = result.scalars().all()

        for ticket in overdue_tickets:
            # Mark as breached
            ticket.sla_breached = True
            ticket.updated_at = now
            breaches_detected += 1

            # Determine escalation level
            existing_esc_q = (
                select(func.coalesce(func.max(SLAEscalation.level), 0))
                .where(SLAEscalation.ticket_id == ticket.id)
            )
            esc_result = await db.execute(existing_esc_q)
            current_max_level: int = esc_result.scalar() or 0

            next_level = current_max_level + 1

            # Trigger escalation
            await trigger_escalation(db, ticket, next_level)
            escalations_triggered += 1

            logger.warning(
                f"SLA breach detected for ticket {ticket.ticket_number}: "
                f"deadline={ticket.sla_deadline.isoformat()}, "
                f"escalation_level={next_level}"
            )

        if breaches_detected > 0:
            await db.flush()

        logger.info(
            f"SLA breach check complete: {breaches_detected} breaches, "
            f"{escalations_triggered} escalations"
        )

        return {
            "checked_at": now.isoformat(),
            "breaches_detected": breaches_detected,
            "escalations_triggered": escalations_triggered,
        }

    except Exception as e:
        logger.error(f"Error checking SLA breaches: {e}")
        raise


def get_sla_status(ticket: StaffTicket) -> Dict[str, Any]:
    """
    Compute the current SLA status for a ticket.

    Returns remaining time, breach state, and escalation level.
    This is a synchronous helper that does not query the database.
    """
    now = datetime.utcnow()

    if not ticket.sla_deadline:
        return {
            "policy_name": "None",
            "resolution_deadline": None,
            "first_response_deadline": None,
            "first_response_met": ticket.first_response_at is not None,
            "is_breached": ticket.sla_breached,
            "time_remaining_minutes": None,
            "escalation_level": 0,
        }

    remaining_seconds = (ticket.sla_deadline - now).total_seconds()
    remaining_minutes = round(remaining_seconds / 60, 1) if remaining_seconds > 0 else 0.0

    return {
        "policy_name": str(ticket.sla_policy_id) if ticket.sla_policy_id else "Default",
        "resolution_deadline": ticket.sla_deadline.isoformat(),
        "first_response_deadline": None,
        "first_response_met": ticket.first_response_at is not None,
        "is_breached": ticket.sla_breached or remaining_seconds <= 0,
        "time_remaining_minutes": remaining_minutes,
        "escalation_level": 0,
    }


async def trigger_escalation(
    db: AsyncSession,
    ticket: StaffTicket,
    level: int,
) -> Dict[str, Any]:
    """
    Execute an escalation chain action for a ticket.

    Looks up the SLA policy's escalation_chain JSONB to determine the
    target user/role for the given level. Creates an SLAEscalation record
    and updates the ticket's escalated_to field.
    """
    try:
        escalated_to = None
        reason = f"SLA breach - escalation level {level}"

        # Try to load the escalation chain from the SLA policy
        if ticket.sla_policy_id:
            policy_q = select(SLAPolicy).where(SLAPolicy.id == ticket.sla_policy_id)
            policy_result = await db.execute(policy_q)
            policy = policy_result.scalar_one_or_none()

            if policy and policy.escalation_chain:
                chain = policy.escalation_chain
                if isinstance(chain, list) and len(chain) >= level:
                    chain_entry = chain[level - 1]
                    escalated_to = chain_entry.get("user_id") or chain_entry.get("escalate_to")
                    reason = chain_entry.get("reason", reason)

        # Create escalation record
        escalation = SLAEscalation(
            id=uuid.uuid4(),
            ticket_id=ticket.id,
            level=level,
            escalated_to=escalated_to,
            reason=reason,
        )
        db.add(escalation)

        # Update ticket
        if escalated_to:
            ticket.escalated_to = escalated_to

        logger.info(
            f"Escalation created for ticket {ticket.ticket_number}: "
            f"level={level}, escalated_to={escalated_to}"
        )

        return {
            "id": str(escalation.id),
            "ticket_id": str(ticket.id),
            "level": level,
            "escalated_to": str(escalated_to) if escalated_to else None,
            "reason": reason,
            "escalated_at": escalation.escalated_at.isoformat(),
        }

    except Exception as e:
        logger.error(f"Error triggering escalation for ticket {ticket.id}: {e}")
        raise
