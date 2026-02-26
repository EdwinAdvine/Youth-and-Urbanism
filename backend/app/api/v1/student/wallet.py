"""
Student Wallet & Payment API Routes
"""
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, List, Optional
from pydantic import BaseModel, EmailStr

logger = logging.getLogger(__name__)

from app.database import get_db
from app.models.user import User
from app.services.student.wallet_service import WalletService
from app.utils.security import get_current_user


router = APIRouter(prefix="/student/wallet", tags=["Student Wallet"])


# Pydantic schemas
class InitiatePaymentRequest(BaseModel):
    amount: int  # Amount in kobo
    metadata: Optional[Dict] = None


class SavePaymentMethodRequest(BaseModel):
    authorization_code: str
    card_type: str
    last4: str
    exp_month: str
    exp_year: str
    bank: Optional[str] = None


# API Endpoints
@router.get("/balance")
async def get_wallet_balance(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    """
    Get wallet balance
    """
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access this endpoint"
        )

    service = WalletService(db)

    try:
        balance_data = await service.get_wallet_balance(current_user.id)
        return balance_data
    except Exception as e:
        logger.error(f"Failed to fetch wallet balance for user {current_user.id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch wallet balance"
        )


@router.get("/transactions")
async def get_transaction_history(
    limit: int = 20,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    """
    Get transaction history

    Query params:
    - limit: Results per page (default: 20)
    - offset: Pagination offset (default: 0)
    """
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access this endpoint"
        )

    service = WalletService(db)

    try:
        history = await service.get_transaction_history(
            user_id=current_user.id,
            limit=limit,
            offset=offset
        )
        return history
    except Exception as e:
        logger.error(f"Failed to fetch transaction history for user {current_user.id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch transaction history"
        )


@router.post("/topup/paystack")
async def initiate_paystack_payment(
    request: InitiatePaymentRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    """
    Initiate Paystack card payment

    Body:
    - amount: Amount in kobo (100 kobo = 1 KES)
    - metadata: Optional custom metadata
    """
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can initiate payments"
        )

    if not current_user.student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student profile not found"
        )

    if request.amount < 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Minimum amount is 100 kobo (1 KES)"
        )

    service = WalletService(db)

    try:
        payment_data = await service.initiate_paystack_payment(
            user_id=current_user.id,
            student_id=current_user.student_id,
            amount=request.amount,
            email=current_user.email,
            metadata=request.metadata
        )

        return {
            "reference": payment_data["reference"],
            "authorization_url": payment_data["authorization_url"],
            "access_code": payment_data["access_code"],
            "message": "Payment initialized. Redirect user to authorization_url"
        }
    except Exception as e:
        logger.error(f"Failed to initiate Paystack payment for user {current_user.id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to initiate payment"
        )


@router.get("/payment/verify/{reference}")
async def verify_paystack_payment(
    reference: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    """
    Verify Paystack payment

    Path params:
    - reference: Payment reference
    """
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can verify payments"
        )

    service = WalletService(db)

    try:
        verification = await service.verify_paystack_payment(reference)
        return verification
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    except Exception as e:
        logger.error(f"Failed to verify Paystack payment {reference}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to verify payment"
        )


@router.get("/payment-methods")
async def get_payment_methods(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> List[Dict]:
    """
    Get saved payment methods
    """
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access this endpoint"
        )

    if not current_user.student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student profile not found"
        )

    service = WalletService(db)

    try:
        methods = await service.get_payment_methods(current_user.student_id)
        return methods
    except Exception as e:
        logger.error(f"Failed to fetch payment methods for student {current_user.student_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch payment methods"
        )


@router.post("/payment-methods")
async def save_payment_method(
    request: SavePaymentMethodRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    """
    Save a payment method

    Body:
    - authorization_code: Paystack authorization code
    - card_type: Card type (visa, mastercard, etc.)
    - last4: Last 4 digits
    - exp_month: Expiry month
    - exp_year: Expiry year
    - bank: Optional bank name
    """
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can save payment methods"
        )

    if not current_user.student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student profile not found"
        )

    service = WalletService(db)

    try:
        method = await service.save_payment_method(
            student_id=current_user.student_id,
            authorization_code=request.authorization_code,
            card_type=request.card_type,
            last4=request.last4,
            exp_month=request.exp_month,
            exp_year=request.exp_year,
            bank=request.bank
        )

        return {
            "id": str(method.id),
            "card_type": method.card_type,
            "last4": method.last4,
            "is_default": method.is_default,
            "message": "Payment method saved successfully"
        }
    except Exception as e:
        logger.error(f"Failed to save payment method for student {current_user.student_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save payment method"
        )


@router.get("/subscription")
async def get_subscription_info(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    """
    Get subscription information
    """
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access this endpoint"
        )

    if not current_user.student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student profile not found"
        )

    service = WalletService(db)

    try:
        subscription = await service.get_subscription_info(current_user.student_id)
        return subscription
    except Exception as e:
        logger.error(f"Failed to fetch subscription info for student {current_user.student_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch subscription info"
        )


@router.get("/ai-advisor")
async def get_ai_fund_advisor(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    """
    Get AI-powered financial advice
    """
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access this endpoint"
        )

    if not current_user.student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student profile not found"
        )

    service = WalletService(db)

    try:
        advice = await service.get_ai_fund_advisor(current_user.student_id)
        return advice
    except Exception as e:
        logger.error(f"Failed to generate AI advice for student {current_user.student_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate financial advice"
        )
