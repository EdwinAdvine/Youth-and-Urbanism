"""
Partner Wallet API

Endpoints for partner wallet management: balance, transactions,
top-up, and withdrawal requests.
"""

from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.utils.permissions import verify_partner_or_admin_access
from app.services.partner.wallet_service import partner_wallet_service

router = APIRouter(tags=["Partner - Wallet"])


class TopUpRequest(BaseModel):
    amount: float = Field(..., gt=0, description="Amount to top up in KES")
    payment_method: str = Field("paystack", description="Payment method to use")


class WithdrawRequest(BaseModel):
    amount: float = Field(..., gt=0, description="Amount to withdraw in KES")
    payout_method: str = Field(..., description="mpesa_b2c or bank_transfer")
    payout_details: dict = Field(..., description="Method-specific details")


@router.get("/wallet/balance")
async def get_wallet_balance(
    current_user: dict = Depends(verify_partner_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Get the partner's wallet balance and tracking totals."""
    user_id = current_user.get("id") or current_user.get("user_id")
    data = await partner_wallet_service.get_balance(db, user_id)
    return {"status": "success", "data": data}


@router.get("/wallet/transactions")
async def get_wallet_transactions(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: dict = Depends(verify_partner_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Get paginated wallet transactions."""
    user_id = current_user.get("id") or current_user.get("user_id")
    data = await partner_wallet_service.get_transactions(db, user_id, limit=limit, offset=offset)
    return {"status": "success", "data": data}


@router.post("/wallet/top-up")
async def top_up_wallet(
    body: TopUpRequest,
    current_user: dict = Depends(verify_partner_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Top up the partner's wallet."""
    user_id = current_user.get("id") or current_user.get("user_id")
    try:
        data = await partner_wallet_service.top_up(
            db, user_id, body.amount, body.payment_method,
        )
        return {"status": "success", "data": data}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/wallet/withdraw")
async def request_withdrawal(
    body: WithdrawRequest,
    current_user: dict = Depends(verify_partner_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Create a withdrawal request (uses the shared withdrawal system)."""
    from app.services.withdrawal_service import WithdrawalService

    user_id = current_user.get("id") or current_user.get("user_id")
    withdrawal_svc = WithdrawalService()

    try:
        result = await withdrawal_svc.create_request(
            db=db,
            user_id=user_id,
            amount=body.amount,
            payout_method=body.payout_method,
            payout_details=body.payout_details,
        )
        return {"status": "success", "data": {"withdrawal_id": str(result.id), "status": result.status.value}}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
