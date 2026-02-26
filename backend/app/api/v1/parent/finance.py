"""
Parent Finance Router

API endpoints for subscriptions, payments, and billing.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.database import get_db
from app.models import User
from app.utils.security import get_current_user
from app.schemas.parent.finance_schemas import (
    CurrentSubscriptionResponse, AvailablePlansResponse,
    PaymentHistoryResponse, ChangeSubscriptionRequest,
    PauseSubscriptionRequest, AddOnsResponse, PurchaseAddOnRequest
)
from app.services.parent.finance_service import parent_finance_service

router = APIRouter(prefix="/parent/finance", tags=["parent-finance"])


def require_parent_role(current_user: User = Depends(get_current_user)) -> User:
    """Dependency to ensure user has parent role."""
    if current_user.role != "parent":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Parent role required"
        )
    return current_user


@router.get("/subscription", response_model=CurrentSubscriptionResponse)
async def get_subscription(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """
    Get current subscription status.

    Returns:
    - Current plan details
    - Billing cycle and dates
    - Usage and limits
    - Auto-renewal status
    """
    return await parent_finance_service.get_current_subscription(
        db=db,
        parent_id=current_user.id
    )


@router.get("/plans", response_model=AvailablePlansResponse)
async def get_plans(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """
    Get available subscription plans.

    Returns:
    - List of available plans
    - Features and pricing
    - Current plan indicator
    """
    return await parent_finance_service.get_available_plans(
        db=db,
        parent_id=current_user.id
    )


@router.post("/subscription/change", response_model=CurrentSubscriptionResponse)
async def change_subscription(
    request: ChangeSubscriptionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """
    Change subscription plan.

    Request body:
    - new_plan_id: Target plan ID
    - billing_cycle: monthly or annual

    Returns:
    - Updated subscription details
    """
    return await parent_finance_service.change_subscription(
        db=db,
        parent_id=current_user.id,
        request=request
    )


@router.post("/subscription/pause", response_model=CurrentSubscriptionResponse)
async def pause_subscription(
    request: PauseSubscriptionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """
    Pause subscription.

    Request body:
    - reason: Optional pause reason
    - resume_date: Optional auto-resume date

    Returns:
    - Updated subscription with paused status
    """
    return await parent_finance_service.pause_subscription(
        db=db,
        parent_id=current_user.id,
        request=request
    )


@router.post("/subscription/resume", response_model=CurrentSubscriptionResponse)
async def resume_subscription(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """
    Resume paused subscription.

    Returns:
    - Updated subscription with active status
    """
    return await parent_finance_service.resume_subscription(
        db=db,
        parent_id=current_user.id
    )


@router.get("/history", response_model=PaymentHistoryResponse)
async def get_payment_history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """
    Get payment history.

    Returns:
    - List of past payments
    - Total paid amount
    - Receipt information
    """
    return await parent_finance_service.get_payment_history(
        db=db,
        parent_id=current_user.id
    )


@router.get("/addons", response_model=AddOnsResponse)
async def get_addons(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """
    Get available add-ons.

    Returns:
    - List of available add-ons
    - Active add-ons
    - Pricing and features
    """
    return await parent_finance_service.get_available_addons(
        db=db,
        parent_id=current_user.id
    )


@router.post("/addons/purchase")
async def purchase_addon(
    request: PurchaseAddOnRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """
    Purchase an add-on.

    Request body:
    - addon_id: Add-on to purchase
    - payment_method: Payment method (mpesa, card)
    - phone_number: M-Pesa phone number if applicable

    Returns:
    - Purchase status
    """
    return await parent_finance_service.purchase_addon(
        db=db,
        parent_id=current_user.id,
        request=request
    )
