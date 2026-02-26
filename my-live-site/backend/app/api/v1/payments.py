"""
Payment API Endpoints for Urban Home School

Multi-gateway payment processing system supporting:
- M-Pesa (Safaricom mobile money)
- PayPal (international payments)
- Stripe (credit/debit cards)

Features:
- Payment initiation and processing
- Webhook handlers for gateway callbacks
- Wallet management and transaction history
- Saved payment methods
- Instructor revenue tracking
"""

import hmac
import hashlib
import logging
from typing import List, Optional
from uuid import UUID
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status, Request, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.database import get_db
from app.config import settings
from app.schemas import (
    PaymentInitiateRequest,
    MpesaCallbackRequest,
    TransactionResponse,
    PaymentStatusResponse,
    WalletResponse,
    PayoutRequest,
    RefundRequest,
)
from app.models.payment import Transaction, Wallet, PaymentMethod
from app.models.user import User
from app.utils.security import get_current_user, get_current_active_user, RateLimitExceeded

logger = logging.getLogger(__name__)

# Safaricom M-Pesa IP whitelist (sandbox + production)
MPESA_ALLOWED_IPS = {
    "196.201.214.200", "196.201.214.206", "196.201.214.207",
    "196.201.214.208", "196.201.213.114", "196.201.214.105",
    # Allow localhost/Docker for development
    "127.0.0.1", "::1",
}


# NOTE: PaymentService needs to be created in backend/app/services/payment_service.py
# This service should implement the business logic for:
# - M-Pesa STK Push initiation and callback processing
# - PayPal order creation and capture
# - Stripe payment intent creation and confirmation
# - Wallet balance management
# - Transaction recording and revenue distribution
# For now, we'll import it as if it exists
try:
    from app.services.payment_service import PaymentService
except ImportError:
    # Placeholder for development
    PaymentService = None


# Create router with payments prefix and tags
router = APIRouter(prefix="/payments", tags=["Payments"])


# ============================================================================
# Helper Functions
# ============================================================================

async def verify_payment_service():
    """Verify payment service is available."""
    if PaymentService is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Payment service is currently unavailable"
        )


# ============================================================================
# Payment Initiation
# ============================================================================

@router.post(
    "/initiate",
    response_model=dict,
    status_code=status.HTTP_200_OK,
    summary="Initiate payment",
    description="Initiate a payment transaction using selected gateway (M-Pesa, PayPal, or Stripe)"
)
async def initiate_payment(
    payment_data: PaymentInitiateRequest,
    current_user: dict = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> dict:
    """
    Initiate a payment for course enrollment.

    Args:
        payment_data: Payment initiation details (gateway, amount, phone, etc.)
        current_user: Authenticated user information
        db: Database session

    Returns:
        Payment URL or confirmation data based on gateway:
        - M-Pesa: Returns CheckoutRequestID and MerchantRequestID
        - PayPal: Returns approval_url for redirect
        - Stripe: Returns payment_intent and client_secret

    Raises:
        HTTPException 400: Invalid payment data or gateway error
        HTTPException 501: Payment service not implemented
    """
    await verify_payment_service()

    try:
        # Initialize payment service
        payment_service = PaymentService(db)

        # Initiate payment based on gateway
        if payment_data.gateway == "mpesa":
            result = await payment_service.initiate_mpesa_payment(
                user_id=UUID(current_user["id"]),
                course_id=payment_data.course_id,
                amount=payment_data.amount,
                phone_number=payment_data.phone_number,
                currency=payment_data.currency
            )
        elif payment_data.gateway == "paypal":
            result = await payment_service.initiate_paypal_payment(
                user_id=UUID(current_user["id"]),
                course_id=payment_data.course_id,
                amount=payment_data.amount,
                currency=payment_data.currency
            )
        elif payment_data.gateway == "stripe":
            result = await payment_service.initiate_stripe_payment(
                user_id=UUID(current_user["id"]),
                course_id=payment_data.course_id,
                amount=payment_data.amount,
                currency=payment_data.currency
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported payment gateway: {payment_data.gateway}"
            )

        return result

    except ValueError as e:
        logger.warning(f"Payment initiation validation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid payment data"
        )
    except Exception as e:
        logger.error(f"Payment initiation failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Payment initiation failed"
        )


# ============================================================================
# M-Pesa Endpoints
# ============================================================================

@router.post(
    "/mpesa/callback",
    status_code=status.HTTP_200_OK,
    summary="M-Pesa payment callback",
    description="Webhook endpoint for M-Pesa Daraja API callbacks (IP-restricted)"
)
async def mpesa_callback(
    request: Request,
    callback_data: MpesaCallbackRequest,
    db: AsyncSession = Depends(get_db)
) -> dict:
    """
    Handle M-Pesa STK Push callback.

    This endpoint receives payment confirmation from Safaricom's M-Pesa API.
    Validates request source IP against Safaricom's known IP ranges.

    Args:
        request: FastAPI request for IP verification
        callback_data: M-Pesa callback payload
        db: Database session

    Returns:
        Acknowledgment response for M-Pesa
    """
    # Verify source IP is from Safaricom (skip in sandbox/dev)
    client_ip = request.client.host if request.client else "unknown"
    is_production = getattr(settings, 'environment', 'development') == 'production'

    if is_production and client_ip not in MPESA_ALLOWED_IPS:
        logger.warning(f"M-Pesa callback rejected: unauthorized IP {client_ip}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized callback source"
        )

    await verify_payment_service()

    try:
        payment_service = PaymentService(db)
        await payment_service.handle_mpesa_callback(callback_data)

        return {
            "ResultCode": 0,
            "ResultDesc": "Callback processed successfully"
        }

    except Exception as e:
        logger.error(f"M-Pesa callback processing error: {str(e)}", exc_info=True)
        # CRITICAL: Return error result code so Safaricom retries the callback
        # ResultCode != 0 signals failure and triggers automatic retry
        return {
            "ResultCode": 1,
            "ResultDesc": f"Callback processing failed: {str(e)}"
        }


@router.get(
    "/mpesa/status/{transaction_ref}",
    response_model=PaymentStatusResponse,
    status_code=status.HTTP_200_OK,
    summary="Check M-Pesa payment status",
    description="Query the status of an M-Pesa payment transaction"
)
async def check_mpesa_status(
    transaction_ref: str,
    current_user: dict = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> PaymentStatusResponse:
    """
    Check M-Pesa payment status.

    Args:
        transaction_ref: Internal payment reference number
        current_user: Authenticated user
        db: Database session

    Returns:
        Payment status information

    Raises:
        HTTPException 404: Payment not found
        HTTPException 403: Not authorized to view this payment
    """
    await verify_payment_service()

    try:
        payment_service = PaymentService(db)
        payment_status = await payment_service.get_payment_status(
            transaction_ref=transaction_ref,
            user_id=UUID(current_user["id"])
        )

        return payment_status

    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    except PermissionError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this payment"
        )


# ============================================================================
# PayPal Endpoints
# ============================================================================

@router.post(
    "/paypal/webhook",
    status_code=status.HTTP_200_OK,
    summary="PayPal webhook handler",
    description="Webhook endpoint for PayPal payment events (signature-verified)"
)
async def paypal_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db)
) -> dict:
    """
    Handle PayPal webhook events.

    Processes PayPal webhook notifications for payment events.
    Verifies webhook signature using PayPal transmission headers.

    Args:
        request: FastAPI request containing webhook payload
        db: Database session

    Returns:
        Acknowledgment response

    Raises:
        HTTPException 400: If signature verification fails
    """
    await verify_payment_service()

    # Verify required PayPal signature headers are present
    required_headers = [
        "paypal-transmission-id",
        "paypal-transmission-time",
        "paypal-transmission-sig",
        "paypal-cert-url",
    ]
    headers = dict(request.headers)
    missing_headers = [h for h in required_headers if h not in headers]
    if missing_headers:
        logger.warning(f"PayPal webhook missing headers: {missing_headers}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing required PayPal signature headers"
        )

    try:
        # Get raw body for signature verification
        body = await request.body()

        payment_service = PaymentService(db)
        await payment_service.handle_paypal_webhook(body, headers)

        return {"status": "success"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"PayPal webhook processing error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Webhook processing failed"
        )


@router.post(
    "/paypal/capture/{order_id}",
    response_model=TransactionResponse,
    status_code=status.HTTP_200_OK,
    summary="Capture PayPal payment",
    description="Capture an authorized PayPal payment"
)
async def capture_paypal_payment(
    order_id: str,
    current_user: dict = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> TransactionResponse:
    """
    Capture a PayPal payment after user approval.

    Args:
        order_id: PayPal order ID to capture
        current_user: Authenticated user
        db: Database session

    Returns:
        Payment response with transaction details

    Raises:
        HTTPException 400: Capture failed or invalid order
        HTTPException 403: Not authorized to capture this payment
    """
    await verify_payment_service()

    try:
        payment_service = PaymentService(db)
        payment = await payment_service.capture_paypal_payment(
            order_id=order_id,
            user_id=UUID(current_user["id"])
        )

        return TransactionResponse.model_validate(payment)

    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment capture failed"
        )
    except PermissionError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to capture this payment"
        )


# ============================================================================
# Stripe Endpoints
# ============================================================================

@router.post(
    "/stripe/webhook",
    status_code=status.HTTP_200_OK,
    summary="Stripe webhook handler",
    description="Webhook endpoint for Stripe payment events (no authentication required)"
)
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(..., alias="stripe-signature"),
    db: AsyncSession = Depends(get_db)
) -> dict:
    """
    Handle Stripe webhook events.

    Processes Stripe webhook notifications for payment events.
    Verifies webhook signature for security.

    Args:
        request: FastAPI request containing webhook payload
        stripe_signature: Stripe signature header for verification
        db: Database session

    Returns:
        Acknowledgment response
    """
    await verify_payment_service()

    try:
        # Get raw body for signature verification
        body = await request.body()

        payment_service = PaymentService(db)
        await payment_service.handle_stripe_webhook(body, stripe_signature)

        return {"status": "success"}

    except Exception as e:
        logger.error(f"Stripe webhook processing error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Webhook processing failed"
        )


@router.post(
    "/stripe/confirm/{payment_intent_id}",
    response_model=TransactionResponse,
    status_code=status.HTTP_200_OK,
    summary="Confirm Stripe payment",
    description="Confirm a Stripe payment intent"
)
async def confirm_stripe_payment(
    payment_intent_id: str,
    current_user: dict = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> TransactionResponse:
    """
    Confirm a Stripe payment intent.

    Args:
        payment_intent_id: Stripe PaymentIntent ID to confirm
        current_user: Authenticated user
        db: Database session

    Returns:
        Payment response with transaction details

    Raises:
        HTTPException 400: Confirmation failed or invalid payment intent
        HTTPException 403: Not authorized to confirm this payment
    """
    await verify_payment_service()

    try:
        payment_service = PaymentService(db)
        payment = await payment_service.confirm_stripe_payment(
            payment_intent_id=payment_intent_id,
            user_id=UUID(current_user["id"])
        )

        return TransactionResponse.model_validate(payment)

    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment confirmation failed"
        )
    except PermissionError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to confirm this payment"
        )


# ============================================================================
# Wallet Endpoints
# ============================================================================

@router.get(
    "/wallet",
    response_model=WalletResponse,
    status_code=status.HTTP_200_OK,
    summary="Get wallet balance",
    description="Get current user's wallet balance and earnings"
)
async def get_wallet_balance(
    current_user: dict = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> WalletResponse:
    """
    Get user's wallet information.

    Returns wallet balance, lifetime earnings, and pending payout amount.
    Wallets are primarily used by instructors to track course revenue.

    Args:
        current_user: Authenticated user
        db: Database session

    Returns:
        Wallet information including balance and earnings

    Raises:
        HTTPException 404: Wallet not found (will auto-create for instructors)
    """
    try:
        # Query wallet
        result = await db.execute(
            select(Wallet).where(Wallet.user_id == UUID(current_user["id"]))
        )
        wallet = result.scalar_one_or_none()

        # Auto-create wallet if user is instructor/external_instructor
        if not wallet and current_user["role"] in ["instructor", "external_instructor"]:
            wallet = Wallet(
                user_id=UUID(current_user["id"]),
                balance=Decimal("0.00"),
                total_earned=Decimal("0.00"),
                pending_payout=Decimal("0.00")
            )
            db.add(wallet)
            await db.commit()
            await db.refresh(wallet)
        elif not wallet:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Wallet not found. Wallets are only available for instructors."
            )

        return WalletResponse.model_validate(wallet)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to retrieve wallet: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve wallet"
        )


@router.get(
    "/transactions",
    response_model=List[TransactionResponse],
    status_code=status.HTTP_200_OK,
    summary="Get transaction history",
    description="Get paginated wallet transaction history"
)
async def get_transaction_history(
    current_user: dict = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 50
) -> List[TransactionResponse]:
    """
    Get user's wallet transaction history with pagination.

    Args:
        current_user: Authenticated user
        db: Database session
        skip: Number of records to skip (default: 0)
        limit: Maximum number of records to return (default: 50, max: 100)

    Returns:
        List of wallet transactions ordered by creation date (newest first)

    Raises:
        HTTPException 404: Wallet not found
        HTTPException 400: Invalid pagination parameters
    """
    # Validate pagination parameters
    if skip < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Skip must be non-negative"
        )
    if limit < 1 or limit > 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Limit must be between 1 and 100"
        )

    try:
        # Get transactions for the user
        transactions_result = await db.execute(
            select(Transaction)
            .where(Transaction.user_id == UUID(current_user["id"]))
            .order_by(desc(Transaction.created_at))
            .offset(skip)
            .limit(limit)
        )
        transactions = transactions_result.scalars().all()

        return [TransactionResponse.model_validate(t) for t in transactions]

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to retrieve transactions: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve transactions"
        )


@router.post(
    "/wallet/add-funds",
    response_model=TransactionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add funds to wallet",
    description="Add funds to wallet via payment gateway"
)
async def add_funds_to_wallet(
    payment_data: PaymentInitiateRequest,
    current_user: dict = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> TransactionResponse:
    """
    Add funds to user's wallet.

    Initiates a payment to add credits to the wallet balance.
    Payment can be made via M-Pesa, PayPal, or Stripe.

    Args:
        payment_data: Payment details (gateway, amount, etc.)
        current_user: Authenticated user
        db: Database session

    Returns:
        Payment response with transaction details

    Raises:
        HTTPException 400: Invalid payment data
        HTTPException 501: Payment service not implemented
    """
    await verify_payment_service()

    try:
        payment_service = PaymentService(db)
        payment = await payment_service.add_wallet_funds(
            user_id=UUID(current_user["id"]),
            amount=payment_data.amount,
            gateway=payment_data.gateway,
            phone_number=payment_data.phone_number,
            currency=payment_data.currency
        )

        return TransactionResponse.model_validate(payment)

    except ValueError as e:
        logger.warning(f"Add funds validation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid payment data"
        )
    except Exception as e:
        logger.error(f"Failed to add wallet funds: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add funds"
        )


# ============================================================================
# Payment Methods Management
# ============================================================================

@router.get(
    "/methods",
    response_model=List[dict],
    status_code=status.HTTP_200_OK,
    summary="List saved payment methods",
    description="Get list of user's saved payment methods"
)
async def list_payment_methods(
    current_user: dict = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> List[dict]:
    """
    List user's saved payment methods.

    Returns saved cards, M-Pesa numbers, and PayPal accounts.
    Sensitive information is masked for security.

    Args:
        current_user: Authenticated user
        db: Database session

    Returns:
        List of saved payment methods with masked details
    """
    await verify_payment_service()

    try:
        payment_service = PaymentService(db)
        methods = await payment_service.list_payment_methods(
            user_id=UUID(current_user["id"])
        )

        return methods

    except Exception as e:
        logger.error(f"Failed to retrieve payment methods: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve payment methods"
        )


@router.post(
    "/methods",
    response_model=dict,
    status_code=status.HTTP_201_CREATED,
    summary="Add payment method",
    description="Save a new payment method for future use"
)
async def add_payment_method(
    method_data: dict,
    current_user: dict = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> dict:
    """
    Add a new payment method.

    Securely saves payment method details for future transactions.
    Supports credit cards (via Stripe), M-Pesa numbers, and PayPal accounts.

    Args:
        method_data: Payment method details
        current_user: Authenticated user
        db: Database session

    Returns:
        Created payment method with masked details

    Raises:
        HTTPException 400: Invalid payment method data
    """
    await verify_payment_service()

    try:
        payment_service = PaymentService(db)
        method = await payment_service.add_payment_method(
            user_id=UUID(current_user["id"]),
            method_data=method_data
        )

        return method

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid payment method data"
        )
    except Exception as e:
        logger.error(f"Failed to add payment method: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add payment method"
        )


@router.delete(
    "/methods/{method_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove payment method",
    description="Delete a saved payment method"
)
async def remove_payment_method(
    method_id: str,
    current_user: dict = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> None:
    """
    Remove a saved payment method.

    Args:
        method_id: Payment method ID to remove
        current_user: Authenticated user
        db: Database session

    Raises:
        HTTPException 404: Payment method not found
        HTTPException 403: Not authorized to delete this payment method
    """
    await verify_payment_service()

    try:
        payment_service = PaymentService(db)
        await payment_service.remove_payment_method(
            user_id=UUID(current_user["id"]),
            method_id=method_id
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment method not found"
        )
    except PermissionError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to remove this payment method"
        )
    except Exception as e:
        logger.error(f"Failed to remove payment method: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to remove payment method"
        )
