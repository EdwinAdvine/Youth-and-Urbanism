"""
Withdrawal API — Shared Endpoints

Allows authenticated users (instructors, partners) to request withdrawals
and view their own withdrawal history.
"""

import logging
from typing import Any, Dict
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.withdrawal_schemas import WithdrawalRequestCreate
from app.services.withdrawal_service import WithdrawalService
from app.utils.security import get_current_active_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/withdrawals", tags=["Withdrawals"])


@router.post("/request")
async def create_withdrawal_request(
    body: WithdrawalRequestCreate,
    current_user: dict = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Create a withdrawal request.

    Available to instructors and partners. Students are blocked
    (wallet.is_withdrawal_blocked = True).
    """
    try:
        user_id = UUID(current_user["id"])
        request = await WithdrawalService.create_request(
            db,
            user_id=user_id,
            amount=body.amount,
            currency=body.currency,
            payout_method=body.payout_method,
            payout_details=body.payout_details,
        )
        return {
            "status": "success",
            "data": {
                "id": str(request.id),
                "amount": float(request.amount),
                "currency": request.currency,
                "payout_method": request.payout_method.value,
                "status": request.status.value,
                "created_at": request.created_at.isoformat(),
            },
            "message": "Withdrawal request submitted. You will be notified when it is reviewed.",
        }
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        logger.exception("Failed to create withdrawal request")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create withdrawal request.",
        ) from exc


@router.get("/my-requests")
async def list_my_withdrawal_requests(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """List the current user's withdrawal requests."""
    try:
        user_id = UUID(current_user["id"])
        data = await WithdrawalService.list_user_requests(
            db, user_id=user_id, page=page, page_size=page_size,
        )
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to list withdrawal requests")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list withdrawal requests.",
        ) from exc
