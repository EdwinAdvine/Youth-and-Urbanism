"""
M-Pesa Router

API endpoints for M-Pesa payments.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User
from app.utils.security import get_current_user
from app.schemas.parent.finance_schemas import (
    MpesaSTKPushRequest, MpesaSTKPushResponse, MpesaPaymentStatusResponse
)
from app.services.parent.mpesa_service import mpesa_service

router = APIRouter(prefix="/parent/mpesa", tags=["parent-mpesa"])


def require_parent_role(current_user: User = Depends(get_current_user)) -> User:
    """Dependency to ensure user has parent role."""
    if current_user.role != "parent":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Parent role required"
        )
    return current_user


@router.post("/stk-push", response_model=MpesaSTKPushResponse)
async def initiate_stk_push(
    request: MpesaSTKPushRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """
    Initiate M-Pesa STK push.

    Request body:
    - phone_number: M-Pesa phone number (254XXXXXXXXX)
    - amount: Amount in KES
    - account_reference: Reference for the payment
    - transaction_desc: Description

    Returns:
    - CheckoutRequestID for tracking
    - Customer message
    """
    return await mpesa_service.initiate_stk_push(request)


@router.post("/callback", status_code=status.HTTP_200_OK)
async def mpesa_callback(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    M-Pesa callback endpoint (public).

    This endpoint receives payment confirmations from Safaricom.
    """
    callback_data = await request.json()
    result = await mpesa_service.process_callback(callback_data)
    return result


@router.get("/status/{checkout_request_id}", response_model=MpesaPaymentStatusResponse)
async def check_payment_status(
    checkout_request_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """
    Check M-Pesa payment status.

    Path parameters:
    - checkout_request_id: Checkout request ID from STK push

    Returns:
    - Payment status
    - M-Pesa receipt number if completed
    """
    return await mpesa_service.check_payment_status(checkout_request_id)
