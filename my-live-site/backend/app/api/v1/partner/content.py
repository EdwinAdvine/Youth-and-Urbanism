"""
Partner Content API Endpoints

AI-generated content and impact reports.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Any, Dict

from app.database import get_db
from app.utils.permissions import verify_partner_or_admin_access
from app.services.partner.partner_ai_service import (
    generate_impact_report,
    generate_custom_content,
)

router = APIRouter(tags=["Partner - Content"])


@router.post("/impact-report")
async def create_impact_report(
    current_user: dict = Depends(verify_partner_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Generate an AI-powered impact report."""
    user_id = current_user.get("id") or current_user.get("user_id")
    data = await generate_impact_report(db, user_id)
    return {"status": "success", "data": data}
