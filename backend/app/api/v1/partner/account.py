"""
Partner Account API Endpoints

Profile management and settings.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Any, Dict

from app.database import get_db
from app.utils.permissions import verify_partner_or_admin_access
from app.services.partner.partner_service import (
    get_partner_profile,
    update_partner_profile,
)

router = APIRouter(tags=["Partner - Account"])


@router.get("/profile")
async def get_profile(
    current_user: dict = Depends(verify_partner_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Get partner profile."""
    user_id = current_user.get("id") or current_user.get("user_id")
    data = await get_partner_profile(db, user_id)
    return {"status": "success", "data": data}
