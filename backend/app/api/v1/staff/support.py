"""
Staff Support / Ticketing API Endpoints

Provides REST endpoints for the support ticket system:
- Paginated ticket listing with filters (status, priority, category,
  assigned_to, sla_status)
- Single ticket retrieval with full message thread
- Ticket creation, update, and assignment
- Manual escalation workflow
- SLA dashboard statistics

All endpoints require staff or admin role access.
"""

import logging
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.utils.permissions import verify_staff_or_admin_access

from app.services.staff.support_service import SupportService

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Staff Support"])


# ------------------------------------------------------------------
# Pydantic request models
# ------------------------------------------------------------------
class CreateTicketRequest(BaseModel):
    """Payload for creating a new support ticket."""
    subject: str
    description: str
    category: Optional[str] = None
    priority: Optional[str] = "medium"
    requester_id: Optional[str] = None


class UpdateTicketRequest(BaseModel):
    """Payload for updating an existing ticket."""
    subject: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    category: Optional[str] = None


class AddMessageRequest(BaseModel):
    """Payload for adding a message or internal note to a ticket."""
    content: str
    is_internal: bool = False


class AssignTicketRequest(BaseModel):
    """Payload for assigning or reassigning a ticket."""
    assignee_id: str
    note: Optional[str] = None


class EscalateTicketRequest(BaseModel):
    """Payload for manually escalating a ticket."""
    reason: str
    escalation_level: Optional[str] = "tier_2"


# ------------------------------------------------------------------
# GET /tickets
# ------------------------------------------------------------------
@router.get("/tickets")
async def list_tickets(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = Query(None, alias="status"),
    priority: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    assigned_to: Optional[str] = Query(None),
    sla_status: Optional[str] = Query(None),
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Paginated list of support tickets with optional filters.

    Filters: status, priority, category, assigned_to, sla_status.
    """
    try:
        data = await SupportService.list_tickets(
            db,
            page=page,
            page_size=page_size,
            status_filter=status_filter,
            priority=priority,
            category=category,
            assigned_to=assigned_to,
            sla_status=sla_status,
        )
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to list support tickets")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list support tickets.",
        ) from exc


# ------------------------------------------------------------------
# GET /tickets/{ticket_id}
# ------------------------------------------------------------------
@router.get("/tickets/{ticket_id}")
async def get_ticket(
    ticket_id: str,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Retrieve a single support ticket with its full message thread."""
    try:
        data = await SupportService.get_ticket(db, ticket_id=ticket_id)
        if data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Ticket not found.",
            )
        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to fetch ticket %s", ticket_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch ticket.",
        ) from exc


# ------------------------------------------------------------------
# POST /tickets
# ------------------------------------------------------------------
@router.post("/tickets", status_code=status.HTTP_201_CREATED)
async def create_ticket(
    body: CreateTicketRequest,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Create a new support ticket on behalf of a requester."""
    try:
        creator_id = current_user.get("id") or current_user.get("user_id")
        data = await SupportService.create_ticket(
            db,
            creator_id=creator_id,
            subject=body.subject,
            description=body.description,
            category=body.category,
            priority=body.priority,
            requester_id=body.requester_id,
        )
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to create support ticket")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create support ticket.",
        ) from exc


# ------------------------------------------------------------------
# PATCH /tickets/{ticket_id}
# ------------------------------------------------------------------
@router.patch("/tickets/{ticket_id}")
async def update_ticket(
    ticket_id: str,
    body: UpdateTicketRequest,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Update an existing support ticket's fields."""
    try:
        updates = body.model_dump(exclude_unset=True)
        data = await SupportService.update_ticket(
            db, ticket_id=ticket_id, updates=updates
        )
        if data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Ticket not found.",
            )
        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to update ticket %s", ticket_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update ticket.",
        ) from exc


# ------------------------------------------------------------------
# POST /tickets/{ticket_id}/messages
# ------------------------------------------------------------------
@router.post(
    "/tickets/{ticket_id}/messages",
    status_code=status.HTTP_201_CREATED,
)
async def add_ticket_message(
    ticket_id: str,
    body: AddMessageRequest,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Add a public message or internal note to a ticket."""
    try:
        author_id = current_user.get("id") or current_user.get("user_id")
        data = await SupportService.add_message(
            db,
            ticket_id=ticket_id,
            author_id=author_id,
            content=body.content,
            is_internal=body.is_internal,
        )
        if data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Ticket not found.",
            )
        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to add message to ticket %s", ticket_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add message to ticket.",
        ) from exc


# ------------------------------------------------------------------
# POST /tickets/{ticket_id}/assign
# ------------------------------------------------------------------
@router.post("/tickets/{ticket_id}/assign")
async def assign_ticket(
    ticket_id: str,
    body: AssignTicketRequest,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Assign or reassign a support ticket to a staff member."""
    try:
        assigner_id = current_user.get("id") or current_user.get("user_id")
        data = await SupportService.assign_ticket(
            db,
            ticket_id=ticket_id,
            assignee_id=body.assignee_id,
            assigner_id=assigner_id,
            note=body.note,
        )
        if data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Ticket not found.",
            )
        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to assign ticket %s", ticket_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to assign ticket.",
        ) from exc


# ------------------------------------------------------------------
# POST /tickets/{ticket_id}/escalate
# ------------------------------------------------------------------
@router.post("/tickets/{ticket_id}/escalate")
async def escalate_ticket(
    ticket_id: str,
    body: EscalateTicketRequest,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Manually escalate a support ticket to a higher tier."""
    try:
        escalator_id = current_user.get("id") or current_user.get("user_id")
        data = await SupportService.escalate_ticket(
            db,
            ticket_id=ticket_id,
            escalator_id=escalator_id,
            reason=body.reason,
            escalation_level=body.escalation_level,
        )
        if data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Ticket not found.",
            )
        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to escalate ticket %s", ticket_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to escalate ticket.",
        ) from exc


# ------------------------------------------------------------------
# GET /sla/status
# ------------------------------------------------------------------
@router.get("/sla/status")
async def get_sla_status(
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Overall SLA dashboard statistics.

    Returns counts of tickets within SLA, at risk, breached,
    average resolution time, and trend data.
    """
    try:
        data = await SupportService.get_sla_status(db)
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to fetch SLA status")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch SLA status.",
        ) from exc
