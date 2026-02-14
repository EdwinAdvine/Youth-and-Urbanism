"""
Instructor Earnings API Routes

Endpoints for earnings, payouts, revenue splits, and financial management.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from datetime import datetime

from app.database import get_db
from app.models.user import User
from app.utils.security import require_role
from app.schemas.instructor.earnings_schemas import (
    InstructorEarningResponse,
    PayoutRequest,
    InstructorPayoutResponse,
    EarningsBreakdownResponse,
    EarningsQueryParams,
    PayoutQueryParams
)
from app.services.instructor.earnings_service import (
    request_payout,
    get_earnings_breakdown
)

router = APIRouter(prefix="/earnings", tags=["Instructor Earnings"])


@router.get("/", response_model=dict)
async def list_earnings(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    earning_type: str = Query(None),
    status: str = Query(None),
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db)
):
    """List instructor earnings with filters."""
    try:
        from app.services.instructor.earnings_service import list_earnings as svc_list
        return await svc_list(
            db, str(current_user.id),
            earning_type=earning_type, status=status,
            page=page, limit=limit,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/breakdown", response_model=EarningsBreakdownResponse)
async def get_breakdown(
    start_date: datetime = Query(None),
    end_date: datetime = Query(None),
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db)
):
    """
    Get detailed earnings breakdown by type, course, and session.
    """
    try:
        breakdown = await get_earnings_breakdown(
            db,
            str(current_user.id),
            start_date,
            end_date
        )
        return breakdown
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/payouts/request", response_model=InstructorPayoutResponse)
async def create_payout_request(
    payout_data: PayoutRequest,
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db)
):
    """
    Request withdrawal (M-Pesa B2C, bank transfer, PayPal).
    """
    try:
        payout = await request_payout(
            db,
            str(current_user.id),
            payout_data.amount,
            payout_data.payout_method,
            payout_data.payout_details.dict()
        )
        return payout
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/payouts/history", response_model=dict)
async def list_payouts(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: str = Query(None),
    payout_method: str = Query(None),
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db)
):
    """Get payout history."""
    try:
        from app.services.instructor.earnings_service import list_payouts as svc_payouts
        return await svc_payouts(
            db, str(current_user.id),
            status=status, payout_method=payout_method,
            page=page, limit=limit,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/balance", response_model=dict)
async def get_balance(
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db)
):
    """Get available balance for withdrawal."""
    try:
        from app.services.instructor.earnings_service import get_available_balance
        balance = await get_available_balance(db, str(current_user.id))
        return {"available_balance": float(balance), "currency": "KES"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
