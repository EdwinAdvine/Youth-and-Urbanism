"""
Admin Finance API Endpoints

Provides REST endpoints for the admin finance dashboard:
- Paginated transaction listing
- Refund queue management
- Payout queue management
- Subscription plan listing
- Invoice listing

All endpoints require admin or staff role access.
"""

import logging
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.utils.permissions import verify_admin_access
from app.services.admin.finance_service import FinanceService

logger = logging.getLogger(__name__)

router = APIRouter()


# ------------------------------------------------------------------
# GET /finance/transactions - paginated transaction list
# ------------------------------------------------------------------
@router.get("/finance/transactions")
async def list_transactions(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = Query(None, alias="status"),
    payment_method: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Paginated list of all platform transactions.

    Supports filtering by status, payment method, and search by reference or user name.
    """
    try:
        data = await FinanceService.list_transactions(
            db,
            page=page,
            page_size=page_size,
            status_filter=status_filter,
            gateway_filter=payment_method,
        )
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to list transactions")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list transactions.",
        ) from exc


# ------------------------------------------------------------------
# GET /finance/refunds - refund queue
# ------------------------------------------------------------------
@router.get("/finance/refunds")
async def list_refunds(
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    List refund requests in the review queue.

    Returns pending, approved, and recently processed refund requests.
    """
    try:
        refunds = await FinanceService.get_refund_queue(db, status_filter=status_filter)
        return {
            "status": "success",
            "data": {
                "items": refunds,
                "total": len(refunds),
            },
        }
    except Exception as exc:
        logger.exception("Failed to list refunds")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list refunds.",
        ) from exc


# ------------------------------------------------------------------
# GET /finance/payouts - payout queue
# ------------------------------------------------------------------
@router.get("/finance/payouts")
async def list_payouts(
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    List instructor payout queue.

    Returns pending and processing payouts scheduled for disbursement.
    """
    try:
        payouts = await FinanceService.get_payout_queue(db, status_filter=status_filter)
        return {
            "status": "success",
            "data": {
                "items": payouts,
                "total": len(payouts),
            },
        }
    except Exception as exc:
        logger.exception("Failed to list payouts")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list payouts.",
        ) from exc


# ------------------------------------------------------------------
# GET /finance/plans - subscription plans
# ------------------------------------------------------------------
@router.get("/finance/plans")
async def list_plans(
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    List all subscription plans with active subscriber counts.

    Returns plan details including pricing, features, and subscriber metrics.
    """
    try:
        plans = await FinanceService.list_subscription_plans(db)
        return {
            "status": "success",
            "data": {
                "items": plans,
                "total": len(plans),
            },
        }
    except Exception as exc:
        logger.exception("Failed to list plans")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list plans.",
        ) from exc


# ------------------------------------------------------------------
# GET /finance/invoices - invoice list
# ------------------------------------------------------------------
@router.get("/finance/invoices")
async def list_invoices(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None),
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Paginated list of invoices.

    Supports filtering by status and search by invoice number or customer name.
    """
    try:
        data = await FinanceService.list_invoices(
            db,
            page=page,
            page_size=page_size,
            status_filter=status_filter,
        )
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to list invoices")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list invoices.",
        ) from exc
