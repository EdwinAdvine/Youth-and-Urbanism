"""
Partner Analytics API Endpoints

ROI metrics, custom reports, and data export.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Any, Dict

from app.database import get_db
from app.utils.permissions import verify_partner_or_admin_access
from app.services.partner.partner_analytics_service import (
    get_roi_metrics,
    get_custom_report,
    export_report,
)

router = APIRouter(tags=["Partner - Analytics"])


@router.get("/roi")
async def roi_metrics(
    current_user: dict = Depends(verify_partner_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Get ROI metrics for sponsorships."""
    user_id = current_user.get("id") or current_user.get("user_id")
    data = await get_roi_metrics(db, user_id)
    return {"status": "success", "data": data}
