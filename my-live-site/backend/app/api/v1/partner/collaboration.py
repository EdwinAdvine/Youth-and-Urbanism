"""
Partner Collaboration API Endpoints

Messaging and meeting scheduling.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Any, Dict

from app.database import get_db
from app.utils.permissions import verify_partner_or_admin_access
from app.services.partner.partner_collaboration_service import (
    get_messages,
    get_meetings,
)

router = APIRouter(tags=["Partner - Collaboration"])


@router.get("/messages")
async def list_messages(
    current_user: dict = Depends(verify_partner_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Get messages for the partner."""
    user_id = current_user.get("id") or current_user.get("user_id")
    data = await get_messages(db, user_id)
    return {"status": "success", "data": data}


@router.get("/meetings")
async def list_meetings(
    current_user: dict = Depends(verify_partner_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Get meetings for the partner."""
    user_id = current_user.get("id") or current_user.get("user_id")
    data = await get_meetings(db, user_id)
    return {"status": "success", "data": data}
