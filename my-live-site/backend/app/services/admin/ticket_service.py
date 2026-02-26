"""
Admin Ticket Service - Phase 8 (Operations & Control)

Provides CRUD operations for the support ticket system.
Queries the support_tickets table for real data.
"""

import logging
import uuid
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from sqlalchemy import select, func, and_, or_, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.admin.operations import SupportTicket
from app.models.user import User

logger = logging.getLogger(__name__)


class TicketService:
    """Service for admin support ticket management."""

    @staticmethod
    async def list_tickets(
        db: AsyncSession,
        page: int = 1,
        page_size: int = 20,
        status_filter: Optional[str] = None,
        priority: Optional[str] = None,
        category: Optional[str] = None,
        search: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Paginated list of support tickets with optional filters.
        """
        base_q = select(SupportTicket)
        count_q = select(func.count(SupportTicket.id))

        conditions = []
        if status_filter:
            conditions.append(SupportTicket.status == status_filter)
        if priority:
            conditions.append(SupportTicket.priority == priority)
        if category:
            conditions.append(SupportTicket.category == category)
        if search:
            pattern = f"%{search}%"
            conditions.append(
                or_(
                    SupportTicket.subject.ilike(pattern),
                    SupportTicket.ticket_number.ilike(pattern),
                )
            )

        if conditions:
            where = and_(*conditions)
            base_q = base_q.where(where)
            count_q = count_q.where(where)

        # Total count
        total_result = await db.execute(count_q)
        total: int = total_result.scalar() or 0

        # Summary counts (unfiltered)
        summary_q = select(
            SupportTicket.status,
            func.count(SupportTicket.id),
        ).group_by(SupportTicket.status)
        summary_result = await db.execute(summary_q)
        summary = {row[0]: row[1] for row in summary_result}

        # Paginate
        offset = (page - 1) * page_size
        base_q = (
            base_q
            .order_by(SupportTicket.created_at.desc())
            .offset(offset)
            .limit(page_size)
        )
        result = await db.execute(base_q)
        tickets = result.scalars().all()

        # Resolve reporter names
        reporter_ids = [t.reporter_id for t in tickets if t.reporter_id]
        reporter_names: Dict[str, str] = {}
        if reporter_ids:
            users_q = select(User.id, User.first_name, User.last_name, User.email, User.role).where(
                User.id.in_(reporter_ids)
            )
            users_result = await db.execute(users_q)
            for row in users_result:
                reporter_names[str(row.id)] = {
                    "name": f"{row.first_name} {row.last_name}",
                    "email": row.email,
                    "role": row.role,
                }

        items: List[Dict[str, Any]] = []
        for t in tickets:
            reporter_info = reporter_names.get(str(t.reporter_id), {})
            items.append({
                "id": str(t.id),
                "ticket_number": t.ticket_number,
                "subject": t.subject,
                "description": t.description[:200] + "..." if t.description and len(t.description) > 200 else t.description,
                "category": t.category,
                "priority": t.priority,
                "status": t.status,
                "reporter_name": reporter_info.get("name", "Unknown"),
                "reporter_email": reporter_info.get("email", ""),
                "reporter_role": reporter_info.get("role", ""),
                "assigned_to": str(t.assigned_to) if t.assigned_to else None,
                "sla_deadline": t.sla_deadline.isoformat() if t.sla_deadline else None,
                "created_at": t.created_at.isoformat() if t.created_at else None,
                "updated_at": t.updated_at.isoformat() if t.updated_at else None,
            })

        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": max(1, -(-total // page_size)),
            "summary": {
                "open": summary.get("open", 0),
                "in_progress": summary.get("in_progress", 0),
                "escalated": summary.get("escalated", 0),
                "resolved": summary.get("resolved", 0),
                "closed": summary.get("closed", 0),
            },
        }

    @staticmethod
    async def get_ticket(db: AsyncSession, ticket_id: str) -> Optional[Dict[str, Any]]:
        """
        Get full ticket detail by ID.
        """
        try:
            ticket_uuid = uuid.UUID(ticket_id)
        except ValueError:
            return None

        q = select(SupportTicket).where(SupportTicket.id == ticket_uuid)
        result = await db.execute(q)
        t = result.scalar_one_or_none()

        if not t:
            return None

        # Resolve reporter
        reporter_info: Dict[str, str] = {}
        if t.reporter_id:
            user_q = select(User).where(User.id == t.reporter_id)
            user_result = await db.execute(user_q)
            user = user_result.scalar_one_or_none()
            if user:
                reporter_info = {
                    "name": f"{user.first_name} {user.last_name}",
                    "email": user.email,
                    "role": user.role,
                }

        return {
            "id": str(t.id),
            "ticket_number": t.ticket_number,
            "subject": t.subject,
            "description": t.description,
            "category": t.category,
            "priority": t.priority,
            "status": t.status,
            "reporter_id": str(t.reporter_id) if t.reporter_id else None,
            "reporter_name": reporter_info.get("name", "Unknown"),
            "reporter_email": reporter_info.get("email", ""),
            "reporter_role": reporter_info.get("role", ""),
            "assigned_to": str(t.assigned_to) if t.assigned_to else None,
            "sla_deadline": t.sla_deadline.isoformat() if t.sla_deadline else None,
            "resolved_at": t.resolved_at.isoformat() if t.resolved_at else None,
            "created_at": t.created_at.isoformat() if t.created_at else None,
            "updated_at": t.updated_at.isoformat() if t.updated_at else None,
        }

    @staticmethod
    async def create_ticket(
        db: AsyncSession,
        reporter_id: uuid.UUID,
        subject: str,
        description: str,
        category: Optional[str] = None,
        priority: str = "medium",
    ) -> Dict[str, Any]:
        """Create a new support ticket."""
        # Generate ticket number
        count_q = select(func.count(SupportTicket.id))
        count_result = await db.execute(count_q)
        count = (count_result.scalar() or 0) + 1
        ticket_number = f"TKT-{count:05d}"

        # SLA deadline based on priority
        sla_hours = {"critical": 4, "high": 8, "medium": 24, "low": 72}
        hours = sla_hours.get(priority, 24)
        sla_deadline = datetime.utcnow() + timedelta(hours=hours)

        ticket = SupportTicket(
            ticket_number=ticket_number,
            subject=subject,
            description=description,
            category=category,
            priority=priority,
            status="open",
            reporter_id=reporter_id,
            sla_deadline=sla_deadline,
        )
        db.add(ticket)
        await db.commit()
        await db.refresh(ticket)

        return {
            "success": True,
            "id": str(ticket.id),
            "ticket_number": ticket.ticket_number,
            "status": ticket.status,
        }

    @staticmethod
    async def assign_ticket(
        db: AsyncSession,
        ticket_id: str,
        assigned_to: uuid.UUID,
    ) -> Dict[str, Any]:
        """Assign a ticket to a staff member."""
        try:
            ticket_uuid = uuid.UUID(ticket_id)
        except ValueError:
            return {"success": False, "error": "Invalid ticket ID"}

        q = select(SupportTicket).where(SupportTicket.id == ticket_uuid)
        result = await db.execute(q)
        ticket = result.scalar_one_or_none()

        if not ticket:
            return {"success": False, "error": "Ticket not found"}

        ticket.assigned_to = assigned_to
        if ticket.status == "open":
            ticket.status = "in_progress"
        await db.commit()

        return {
            "success": True,
            "ticket_number": ticket.ticket_number,
            "assigned_to": str(assigned_to),
            "status": ticket.status,
        }

    @staticmethod
    async def resolve_ticket(
        db: AsyncSession,
        ticket_id: str,
    ) -> Dict[str, Any]:
        """Mark a ticket as resolved."""
        try:
            ticket_uuid = uuid.UUID(ticket_id)
        except ValueError:
            return {"success": False, "error": "Invalid ticket ID"}

        q = select(SupportTicket).where(SupportTicket.id == ticket_uuid)
        result = await db.execute(q)
        ticket = result.scalar_one_or_none()

        if not ticket:
            return {"success": False, "error": "Ticket not found"}

        ticket.status = "resolved"
        ticket.resolved_at = datetime.utcnow()
        await db.commit()

        return {
            "success": True,
            "ticket_number": ticket.ticket_number,
            "status": "resolved",
            "resolved_at": ticket.resolved_at.isoformat(),
        }

    @staticmethod
    async def escalate_ticket(
        db: AsyncSession,
        ticket_id: str,
    ) -> Dict[str, Any]:
        """Escalate a ticket."""
        try:
            ticket_uuid = uuid.UUID(ticket_id)
        except ValueError:
            return {"success": False, "error": "Invalid ticket ID"}

        q = select(SupportTicket).where(SupportTicket.id == ticket_uuid)
        result = await db.execute(q)
        ticket = result.scalar_one_or_none()

        if not ticket:
            return {"success": False, "error": "Ticket not found"}

        ticket.status = "escalated"
        ticket.priority = "critical"
        await db.commit()

        return {
            "success": True,
            "ticket_number": ticket.ticket_number,
            "status": "escalated",
        }
