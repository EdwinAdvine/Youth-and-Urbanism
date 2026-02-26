"""
Partner Finance API Endpoints

Subscription management, billing history, and budget overview.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Any, Dict, Optional

from app.database import get_db
from app.utils.permissions import verify_partner_or_admin_access
from app.services.partner.partner_subscription_service import (
    create_subscription,
    get_subscriptions,
    get_billing_history,
    get_budget_overview,
)

router = APIRouter(tags=["Partner - Finance"])


@router.get("/billing-history")
async def billing_history(
    limit: int = Query(50, ge=1, le=100),
    current_user: dict = Depends(verify_partner_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Get billing and payment history."""
    user_id = current_user.get("id") or current_user.get("user_id")
    data = await get_billing_history(db, user_id, limit=limit)
    return {"status": "success", "data": data}


@router.get("/budget")
async def budget_overview(
    current_user: dict = Depends(verify_partner_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Get budget overview and allocations."""
    user_id = current_user.get("id") or current_user.get("user_id")
    data = await get_budget_overview(db, user_id)
    return {"status": "success", "data": data}
