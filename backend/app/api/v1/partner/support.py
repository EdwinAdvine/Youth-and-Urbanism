"""
Partner Support API Endpoints

Ticket management and AI triage.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Any, Dict, Optional
from uuid import UUID

from app.database import get_db
from app.utils.permissions import verify_partner_or_admin_access
from app.models.partner.partner_ticket import PartnerTicket

router = APIRouter(tags=["Partner - Support"])


@router.get("/tickets")
async def list_tickets(
    current_user: dict = Depends(verify_partner_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """List support tickets for the partner."""
    user_id = current_user.get("id") or current_user.get("user_id")
    result = await db.execute(
        select(PartnerTicket)
        .where(PartnerTicket.partner_id == user_id)
        .order_by(desc(PartnerTicket.created_at))
    )
    tickets = result.scalars().all()
    data = [
        {
            "id": str(t.id),
            "subject": t.subject,
            "description": t.description,
            "category": t.category.value if hasattr(t.category, "value") else str(t.category),
            "priority": t.priority.value if hasattr(t.priority, "value") else str(t.priority),
            "status": t.status.value if hasattr(t.status, "value") else str(t.status),
            "resolution": t.resolution,
            "created_at": t.created_at.isoformat() if t.created_at else None,
            "resolved_at": t.resolved_at.isoformat() if t.resolved_at else None,
        }
        for t in tickets
    ]
    return {"status": "success", "data": data}


@router.post("/tickets", status_code=status.HTTP_201_CREATED)
async def create_ticket(
    payload: Dict[str, Any],
    current_user: dict = Depends(verify_partner_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Create a new support ticket."""
    user_id = current_user.get("id") or current_user.get("user_id")
    ticket = PartnerTicket(
        partner_id=user_id,
        subject=payload.get("subject", ""),
        description=payload.get("description", ""),
        category=payload.get("category", "general"),
        priority=payload.get("priority", "medium"),
    )
    db.add(ticket)
    await db.commit()
    await db.refresh(ticket)
    return {
        "status": "success",
        "data": {
            "id": str(ticket.id),
            "subject": ticket.subject,
            "status": ticket.status.value if hasattr(ticket.status, "value") else str(ticket.status),
            "created_at": ticket.created_at.isoformat() if ticket.created_at else None,
        },
    }


@router.get("/tickets/{ticket_id}")
async def get_ticket(
    ticket_id: UUID,
    current_user: dict = Depends(verify_partner_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Get a specific support ticket."""
    user_id = current_user.get("id") or current_user.get("user_id")
    result = await db.execute(
        select(PartnerTicket).where(PartnerTicket.id == ticket_id)
    )
    ticket = result.scalar_one_or_none()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")
    if str(ticket.partner_id) != str(user_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return {
        "status": "success",
        "data": {
            "id": str(ticket.id),
            "subject": ticket.subject,
            "description": ticket.description,
            "category": ticket.category.value if hasattr(ticket.category, "value") else str(ticket.category),
            "priority": ticket.priority.value if hasattr(ticket.priority, "value") else str(ticket.priority),
            "status": ticket.status.value if hasattr(ticket.status, "value") else str(ticket.status),
            "resolution": ticket.resolution,
            "ai_summary": ticket.ai_summary,
            "created_at": ticket.created_at.isoformat() if ticket.created_at else None,
            "resolved_at": ticket.resolved_at.isoformat() if ticket.resolved_at else None,
        },
    }
