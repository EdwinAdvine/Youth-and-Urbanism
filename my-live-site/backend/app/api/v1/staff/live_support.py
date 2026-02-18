"""
Staff Live Support API Endpoints

Provides REST endpoints for real-time live-chat support:
- List active live-chat sessions
- Retrieve chat history for a ticket
- AI-assisted response suggestions for the current chat context

All endpoints require staff or admin role access.
"""

import logging
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.utils.permissions import verify_staff_or_admin_access

from app.services.staff.live_support_service import LiveSupportService

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Staff Live Support"])


# ------------------------------------------------------------------
# Pydantic request models
# ------------------------------------------------------------------
class AIAssistRequest(BaseModel):
    """Payload for requesting an AI-suggested response."""
    ticket_id: str
    current_message: Optional[str] = None
    tone: Optional[str] = "professional"


# ------------------------------------------------------------------
# GET /active-chats
# ------------------------------------------------------------------
@router.get("/active-chats")
async def list_active_chats(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    List all currently active live-chat sessions.

    Returns session metadata including requester info, wait time,
    and assigned agent.
    """
    try:
        data = await LiveSupportService.list_active_chats(
            db, page=page, page_size=page_size
        )
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to list active chats")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list active chats.",
        ) from exc


# ------------------------------------------------------------------
# GET /chat-history/{ticket_id}
# ------------------------------------------------------------------
@router.get("/chat-history/{ticket_id}")
async def get_chat_history(
    ticket_id: str,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Retrieve the full chat history for a given ticket.

    Messages are returned in chronological order and include
    sender info and timestamps.
    """
    try:
        data = await LiveSupportService.get_chat_history(
            db, ticket_id=ticket_id
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
        logger.exception("Failed to fetch chat history for ticket %s", ticket_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch chat history.",
        ) from exc


# ------------------------------------------------------------------
# POST /ai-assist
# ------------------------------------------------------------------
@router.post("/ai-assist")
async def get_ai_assist(
    body: AIAssistRequest,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Get an AI-suggested response for the current live-chat context.

    The suggestion is based on the ticket's conversation history,
    knowledge-base articles, and the selected tone.
    """
    try:
        staff_id = current_user.get("id") or current_user.get("user_id")
        data = await LiveSupportService.get_ai_assist(
            db,
            ticket_id=body.ticket_id,
            staff_id=staff_id,
            current_message=body.current_message,
            tone=body.tone,
        )
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to generate AI assist response")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate AI assist response.",
        ) from exc
