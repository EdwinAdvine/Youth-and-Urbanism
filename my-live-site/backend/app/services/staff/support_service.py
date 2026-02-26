"""
Support Service

Full lifecycle management for support tickets: creation, assignment,
messaging, escalation, and resolution. Integrates with SLA engine
for deadline computation.
"""

import logging
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from sqlalchemy import select, func, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.staff.ticket import StaffTicket, StaffTicketMessage
from app.models.user import User

logger = logging.getLogger(__name__)


class SupportService:
    """Facade exposing support functions as static methods."""

    @staticmethod
    async def list_tickets(db, *, page=1, page_size=20, status_filter=None, priority=None, category=None, assigned_to=None, sla_status=None):
        filters = {}
        if status_filter: filters["status"] = status_filter
        if priority: filters["priority"] = priority
        if category: filters["category"] = category
        if assigned_to: filters["assigned_to"] = assigned_to
        if sla_status: filters["sla_status"] = sla_status
        return await list_tickets(db, filters=filters, page=page, page_size=page_size)

    @staticmethod
    async def get_ticket(db, *, ticket_id):
        return await get_ticket(db, ticket_id=ticket_id)

    @staticmethod
    async def create_ticket(db, *, creator_id, subject, description, category=None, priority="medium", requester_id=None):
        ticket_data = {"subject": subject, "description": description, "category": category, "priority": priority}
        if requester_id: ticket_data["requester_id"] = requester_id
        return await create_ticket(db, creator_id=creator_id, ticket_data=ticket_data)

    @staticmethod
    async def update_ticket(db, *, ticket_id, updates):
        return await update_ticket(db, ticket_id=ticket_id, update_data=updates)

    @staticmethod
    async def add_message(db, *, ticket_id, author_id, content, is_internal=False):
        message_data = {"content": content, "is_internal": is_internal}
        return await add_message(db, ticket_id=ticket_id, author_id=author_id, message_data=message_data)

    @staticmethod
    async def assign_ticket(db, *, ticket_id, assignee_id, assigner_id=None, note=None):
        return await assign_ticket(db, ticket_id=ticket_id, assigned_to=assignee_id)

    @staticmethod
    async def escalate_ticket(db, *, ticket_id, escalator_id, reason, escalation_level="tier_2"):
        return await escalate_ticket(db, ticket_id=ticket_id, reason=reason)

    @staticmethod
    async def get_sla_status(db):
        return {"within_sla": 0, "at_risk": 0, "breached": 0, "avg_resolution_minutes": 0}


def _generate_ticket_number() -> str:
    """Generate a unique ticket number like TKT-20260213-XXXX."""
    date_part = datetime.utcnow().strftime("%Y%m%d")
    rand_part = uuid.uuid4().hex[:4].upper()
    return f"TKT-{date_part}-{rand_part}"


async def list_tickets(
    db: AsyncSession,
    filters: Optional[Dict[str, Any]] = None,
    page: int = 1,
    page_size: int = 20,
) -> Dict[str, Any]:
    """
    Return a paginated list of tickets with SLA status indicators.

    Supports filtering by status, priority, category, assigned_to, and
    free-text search over subject/description.
    """
    try:
        filters = filters or {}
        conditions = []

        if filters.get("status"):
            conditions.append(StaffTicket.status == filters["status"])
        if filters.get("priority"):
            conditions.append(StaffTicket.priority == filters["priority"])
        if filters.get("category"):
            conditions.append(StaffTicket.category == filters["category"])
        if filters.get("assigned_to"):
            val = filters["assigned_to"]
            if val == "unassigned":
                conditions.append(StaffTicket.assigned_to.is_(None))
            elif val != "me":
                conditions.append(StaffTicket.assigned_to == val)
        if filters.get("search"):
            search_term = f"%{filters['search']}%"
            conditions.append(
                or_(
                    StaffTicket.subject.ilike(search_term),
                    StaffTicket.description.ilike(search_term),
                    StaffTicket.ticket_number.ilike(search_term),
                )
            )

        where_clause = and_(*conditions) if conditions else True

        # Total count
        total_q = select(func.count(StaffTicket.id)).where(where_clause)
        total_result = await db.execute(total_q)
        total: int = total_result.scalar() or 0

        # Determine sort
        sort_by = filters.get("sort_by", "created_at")
        sort_dir = filters.get("sort_direction", "desc")
        sort_col = getattr(StaffTicket, sort_by, StaffTicket.created_at)
        order = sort_col.desc() if sort_dir == "desc" else sort_col.asc()

        # Paginated tickets
        offset = (page - 1) * page_size
        items_q = (
            select(StaffTicket)
            .where(where_clause)
            .order_by(order)
            .offset(offset)
            .limit(page_size)
        )
        items_result = await db.execute(items_q)
        tickets = items_result.scalars().all()

        # Count messages per ticket for the response
        ticket_ids = [t.id for t in tickets]
        msg_counts: Dict[str, int] = {}
        if ticket_ids:
            msg_q = (
                select(
                    StaffTicketMessage.ticket_id,
                    func.count(StaffTicketMessage.id).label("cnt"),
                )
                .where(StaffTicketMessage.ticket_id.in_(ticket_ids))
                .group_by(StaffTicketMessage.ticket_id)
            )
            msg_result = await db.execute(msg_q)
            for row in msg_result.all():
                msg_counts[str(row[0])] = row[1]

        items = []
        now = datetime.utcnow()
        for t in tickets:
            # Compute SLA status inline
            sla_status = None
            if t.sla_deadline:
                remaining = (t.sla_deadline - now).total_seconds() / 60
                sla_status = {
                    "deadline": t.sla_deadline.isoformat(),
                    "is_breached": t.sla_breached,
                    "time_remaining_minutes": round(remaining, 1) if remaining > 0 else 0,
                }

            items.append({
                "id": str(t.id),
                "ticket_number": t.ticket_number,
                "subject": t.subject,
                "description": t.description[:200],
                "category": t.category,
                "priority": t.priority,
                "status": t.status,
                "reporter": {"id": str(t.reporter_id)},
                "assigned_to": {"id": str(t.assigned_to)} if t.assigned_to else None,
                "sla_status": sla_status,
                "tags": t.tags or [],
                "message_count": msg_counts.get(str(t.id), 0),
                "first_response_at": t.first_response_at.isoformat() if t.first_response_at else None,
                "resolved_at": t.resolved_at.isoformat() if t.resolved_at else None,
                "csat_score": t.csat_score,
                "created_at": t.created_at.isoformat(),
                "updated_at": t.updated_at.isoformat(),
            })

        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
        }

    except Exception as e:
        logger.error(f"Error listing tickets: {e}")
        raise


async def get_ticket(db: AsyncSession, ticket_id: str) -> Optional[Dict[str, Any]]:
    """Return a single ticket with its message thread."""
    try:
        q = select(StaffTicket).where(StaffTicket.id == ticket_id)
        result = await db.execute(q)
        t = result.scalar_one_or_none()

        if not t:
            return None

        # Fetch messages
        msgs_q = (
            select(StaffTicketMessage)
            .where(StaffTicketMessage.ticket_id == ticket_id)
            .order_by(StaffTicketMessage.created_at.asc())
        )
        msgs_result = await db.execute(msgs_q)
        messages = [
            {
                "id": str(m.id),
                "author_id": str(m.author_id),
                "content": m.content,
                "is_internal": m.is_internal,
                "attachments": m.attachments or [],
                "created_at": m.created_at.isoformat(),
            }
            for m in msgs_result.scalars().all()
        ]

        now = datetime.utcnow()
        sla_status = None
        if t.sla_deadline:
            remaining = (t.sla_deadline - now).total_seconds() / 60
            sla_status = {
                "deadline": t.sla_deadline.isoformat(),
                "is_breached": t.sla_breached,
                "time_remaining_minutes": round(remaining, 1) if remaining > 0 else 0,
            }

        return {
            "id": str(t.id),
            "ticket_number": t.ticket_number,
            "subject": t.subject,
            "description": t.description,
            "category": t.category,
            "priority": t.priority,
            "status": t.status,
            "reporter": {"id": str(t.reporter_id)},
            "assigned_to": {"id": str(t.assigned_to)} if t.assigned_to else None,
            "escalated_to": {"id": str(t.escalated_to)} if t.escalated_to else None,
            "sla_status": sla_status,
            "tags": t.tags or [],
            "metadata": t.metadata or {},
            "resolution": t.resolution,
            "csat_score": t.csat_score,
            "messages": messages,
            "message_count": len(messages),
            "first_response_at": t.first_response_at.isoformat() if t.first_response_at else None,
            "resolved_at": t.resolved_at.isoformat() if t.resolved_at else None,
            "closed_at": t.closed_at.isoformat() if t.closed_at else None,
            "created_at": t.created_at.isoformat(),
            "updated_at": t.updated_at.isoformat(),
        }

    except Exception as e:
        logger.error(f"Error fetching ticket {ticket_id}: {e}")
        raise


async def create_ticket(
    db: AsyncSession,
    creator_id: str,
    ticket_data: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Create a new support ticket and auto-assign an SLA policy.

    The SLA deadline is computed by the sla_engine module if a matching
    policy exists.
    """
    try:
        from app.services.staff.sla_engine import resolve_sla_policy, compute_sla_deadline

        now = datetime.utcnow()
        ticket_number = _generate_ticket_number()

        ticket = StaffTicket(
            id=uuid.uuid4(),
            ticket_number=ticket_number,
            subject=ticket_data["subject"],
            description=ticket_data["description"],
            category=ticket_data["category"],
            priority=ticket_data.get("priority", "medium"),
            status="open",
            reporter_id=creator_id,
            tags=ticket_data.get("tags", []),
            created_at=now,
            updated_at=now,
        )

        # Auto-assign SLA
        policy = await resolve_sla_policy(
            db, ticket.priority, ticket.category
        )
        if policy:
            ticket.sla_policy_id = policy.id
            ticket.sla_deadline = compute_sla_deadline(policy, now)

        db.add(ticket)
        await db.flush()

        logger.info(f"Created ticket {ticket_number} by user {creator_id}")

        return {
            "id": str(ticket.id),
            "ticket_number": ticket_number,
            "subject": ticket.subject,
            "status": ticket.status,
            "priority": ticket.priority,
            "sla_deadline": ticket.sla_deadline.isoformat() if ticket.sla_deadline else None,
            "created_at": ticket.created_at.isoformat(),
        }

    except Exception as e:
        logger.error(f"Error creating ticket: {e}")
        raise


async def update_ticket(
    db: AsyncSession,
    ticket_id: str,
    update_data: Dict[str, Any],
) -> Optional[Dict[str, Any]]:
    """Update ticket status, priority, assignment, resolution, or tags."""
    try:
        q = select(StaffTicket).where(StaffTicket.id == ticket_id)
        result = await db.execute(q)
        ticket = result.scalar_one_or_none()

        if not ticket:
            return None

        now = datetime.utcnow()

        if "status" in update_data and update_data["status"]:
            ticket.status = update_data["status"]
            if update_data["status"] == "resolved":
                ticket.resolved_at = now
            elif update_data["status"] == "closed":
                ticket.closed_at = now

        if "priority" in update_data and update_data["priority"]:
            ticket.priority = update_data["priority"]
        if "assigned_to" in update_data:
            ticket.assigned_to = update_data["assigned_to"]
        if "resolution" in update_data:
            ticket.resolution = update_data["resolution"]
        if "tags" in update_data:
            ticket.tags = update_data["tags"]

        ticket.updated_at = now
        await db.flush()

        logger.info(f"Updated ticket {ticket.ticket_number}: {list(update_data.keys())}")

        return {
            "id": str(ticket.id),
            "ticket_number": ticket.ticket_number,
            "status": ticket.status,
            "priority": ticket.priority,
            "updated_at": ticket.updated_at.isoformat(),
        }

    except Exception as e:
        logger.error(f"Error updating ticket {ticket_id}: {e}")
        raise


async def add_message(
    db: AsyncSession,
    ticket_id: str,
    author_id: str,
    message_data: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Add a reply or internal note to a ticket.

    If this is the first response, updates the ticket's first_response_at
    timestamp for SLA tracking.
    """
    try:
        message = StaffTicketMessage(
            id=uuid.uuid4(),
            ticket_id=ticket_id,
            author_id=author_id,
            content=message_data["content"],
            is_internal=message_data.get("is_internal", False),
            attachments=message_data.get("attachments", []),
        )
        db.add(message)

        # Update first response time if applicable
        if not message_data.get("is_internal", False):
            ticket_q = select(StaffTicket).where(StaffTicket.id == ticket_id)
            ticket_result = await db.execute(ticket_q)
            ticket = ticket_result.scalar_one_or_none()

            if ticket and ticket.first_response_at is None:
                ticket.first_response_at = datetime.utcnow()
                ticket.updated_at = datetime.utcnow()

        await db.flush()

        logger.info(f"Message added to ticket {ticket_id} by {author_id}")

        return {
            "id": str(message.id),
            "ticket_id": str(ticket_id),
            "author_id": str(author_id),
            "content": message.content,
            "is_internal": message.is_internal,
            "created_at": message.created_at.isoformat(),
        }

    except Exception as e:
        logger.error(f"Error adding message to ticket {ticket_id}: {e}")
        raise


async def assign_ticket(
    db: AsyncSession,
    ticket_id: str,
    assigned_to: str,
) -> Optional[Dict[str, Any]]:
    """Reassign a ticket to a different staff member."""
    try:
        q = select(StaffTicket).where(StaffTicket.id == ticket_id)
        result = await db.execute(q)
        ticket = result.scalar_one_or_none()

        if not ticket:
            return None

        previous_assignee = str(ticket.assigned_to) if ticket.assigned_to else None
        ticket.assigned_to = assigned_to
        ticket.updated_at = datetime.utcnow()

        await db.flush()

        logger.info(
            f"Ticket {ticket.ticket_number} reassigned from "
            f"{previous_assignee} to {assigned_to}"
        )

        return {
            "id": str(ticket.id),
            "ticket_number": ticket.ticket_number,
            "assigned_to": str(assigned_to),
            "previous_assignee": previous_assignee,
            "updated_at": ticket.updated_at.isoformat(),
        }

    except Exception as e:
        logger.error(f"Error assigning ticket {ticket_id}: {e}")
        raise


async def escalate_ticket(
    db: AsyncSession,
    ticket_id: str,
    reason: str,
) -> Optional[Dict[str, Any]]:
    """
    Manually escalate a ticket. Updates the ticket status and creates
    an SLA escalation record via the sla_engine.
    """
    try:
        from app.services.staff.sla_engine import trigger_escalation

        q = select(StaffTicket).where(StaffTicket.id == ticket_id)
        result = await db.execute(q)
        ticket = result.scalar_one_or_none()

        if not ticket:
            return None

        ticket.status = "escalated"
        ticket.updated_at = datetime.utcnow()

        # Determine escalation level (increment from current)
        from app.models.staff.sla_policy import SLAEscalation

        existing_q = (
            select(func.count(SLAEscalation.id))
            .where(SLAEscalation.ticket_id == ticket_id)
        )
        existing_result = await db.execute(existing_q)
        current_level = existing_result.scalar() or 0
        next_level = current_level + 1

        escalation_result = await trigger_escalation(db, ticket, next_level)

        await db.flush()

        logger.info(f"Ticket {ticket.ticket_number} escalated to level {next_level}: {reason}")

        return {
            "id": str(ticket.id),
            "ticket_number": ticket.ticket_number,
            "status": "escalated",
            "escalation_level": next_level,
            "reason": reason,
            "escalation": escalation_result,
            "updated_at": ticket.updated_at.isoformat(),
        }

    except Exception as e:
        logger.error(f"Error escalating ticket {ticket_id}: {e}")
        raise
