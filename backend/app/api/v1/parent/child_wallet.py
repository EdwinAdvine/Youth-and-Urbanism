"""
Parent Child Wallet API

Endpoints for parents to manage their children's wallets:
- Top up child wallet
- View child wallet balance and transactions
- Configure purchase approval settings
- Approve/reject child purchases
"""

import logging
from decimal import Decimal
from typing import Any, Dict, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.utils.security import get_current_active_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/parent", tags=["Parent - Child Wallet"])


# ── Schemas ──────────────────────────────────────────────────────

class TopUpChildRequest(BaseModel):
    amount: Decimal = Field(..., gt=0)


class ApprovalSettingsUpdate(BaseModel):
    mode: str = Field(..., description="realtime or spending_limit")
    daily_limit: Optional[Decimal] = Field(None, ge=0)
    monthly_limit: Optional[Decimal] = Field(None, ge=0)
    per_purchase_limit: Optional[Decimal] = Field(None, ge=0)


class RejectPurchaseBody(BaseModel):
    reason: Optional[str] = Field(None, max_length=500)


# ── Endpoints ────────────────────────────────────────────────────

@router.post("/children/{child_id}/wallet/top-up")
async def top_up_child_wallet(
    child_id: UUID,
    body: TopUpChildRequest,
    current_user: dict = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Transfer funds from parent's wallet to child's wallet."""
    from app.services.parent.child_wallet_service import ChildWalletService

    if current_user.get("role") != "parent":
        raise HTTPException(status_code=403, detail="Parent role required")

    try:
        parent_id = UUID(current_user["id"])
        result = await ChildWalletService.top_up_child_wallet(
            db, parent_id=parent_id, child_user_id=child_id, amount=body.amount,
        )
        return {"status": "success", "data": result}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/children/{child_id}/wallet/balance")
async def get_child_wallet_balance(
    child_id: UUID,
    current_user: dict = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Get child's wallet balance."""
    from app.services.parent.child_wallet_service import ChildWalletService

    if current_user.get("role") != "parent":
        raise HTTPException(status_code=403, detail="Parent role required")

    try:
        parent_id = UUID(current_user["id"])
        result = await ChildWalletService.get_child_wallet_balance(
            db, parent_id=parent_id, child_user_id=child_id,
        )
        return {"status": "success", "data": result}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.put("/children/{child_id}/wallet/approval-settings")
async def update_approval_settings(
    child_id: UUID,
    body: ApprovalSettingsUpdate,
    current_user: dict = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Configure purchase approval mode and spending limits for a child."""
    from app.services.parent.child_wallet_service import ChildWalletService

    if current_user.get("role") != "parent":
        raise HTTPException(status_code=403, detail="Parent role required")

    try:
        parent_id = UUID(current_user["id"])
        result = await ChildWalletService.configure_approval_settings(
            db,
            parent_id=parent_id,
            child_user_id=child_id,
            mode=body.mode,
            daily_limit=body.daily_limit,
            monthly_limit=body.monthly_limit,
            per_purchase_limit=body.per_purchase_limit,
        )
        return {"status": "success", "data": result}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/children/{child_id}/wallet/approval-settings")
async def get_approval_settings(
    child_id: UUID,
    current_user: dict = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Get current purchase approval settings for a child."""
    from app.services.parent.child_wallet_service import ChildWalletService

    if current_user.get("role") != "parent":
        raise HTTPException(status_code=403, detail="Parent role required")

    try:
        parent_id = UUID(current_user["id"])
        result = await ChildWalletService.get_approval_settings(
            db, parent_id=parent_id, child_user_id=child_id,
        )
        return {"status": "success", "data": result}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/purchase-requests")
async def list_purchase_requests(
    current_user: dict = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """List pending purchase approval requests from children."""
    from app.services.parent.child_wallet_service import ChildWalletService

    if current_user.get("role") != "parent":
        raise HTTPException(status_code=403, detail="Parent role required")

    parent_id = UUID(current_user["id"])
    requests = await ChildWalletService.list_pending_approvals(db, parent_id)
    return {"status": "success", "data": requests}


@router.post("/purchase-requests/{request_id}/approve")
async def approve_purchase(
    request_id: UUID,
    current_user: dict = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Approve a child's purchase request."""
    from app.services.parent.child_wallet_service import ChildWalletService

    if current_user.get("role") != "parent":
        raise HTTPException(status_code=403, detail="Parent role required")

    try:
        parent_id = UUID(current_user["id"])
        result = await ChildWalletService.approve_purchase(
            db, parent_id=parent_id, request_id=request_id,
        )
        return {"status": "success", "data": result}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/purchase-requests/{request_id}/reject")
async def reject_purchase(
    request_id: UUID,
    body: RejectPurchaseBody,
    current_user: dict = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Reject a child's purchase request."""
    from app.services.parent.child_wallet_service import ChildWalletService

    if current_user.get("role") != "parent":
        raise HTTPException(status_code=403, detail="Parent role required")

    try:
        parent_id = UUID(current_user["id"])
        result = await ChildWalletService.reject_purchase(
            db, parent_id=parent_id, request_id=request_id, reason=body.reason,
        )
        return {"status": "success", "data": result}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
