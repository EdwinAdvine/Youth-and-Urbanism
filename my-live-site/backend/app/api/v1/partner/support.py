"""
Partner Support API Endpoints

Ticket management and AI triage.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Any, Dict

from app.database import get_db
from app.utils.permissions import verify_partner_or_admin_access

router = APIRouter(tags=["Partner - Support"])


@router.get("/tickets")
async def list_tickets(
    current_user: dict = Depends(verify_partner_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """List support tickets for the partner."""
    return {"status": "success", "data": []}
