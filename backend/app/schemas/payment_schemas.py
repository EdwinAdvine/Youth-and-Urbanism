"""
Payment Pydantic Schemas for Urban Home School

This module defines Pydantic schemas for the multi-gateway payment processing system.
Supports M-Pesa, PayPal, and Stripe payment gateways with comprehensive validation.

Revenue Split Model (for external instructors):
- Instructor: 60%
- Platform: 30%
- Marketing/Support: 10%

Payment Flow:
1. User initiates payment via PaymentInitiateRequest
2. Payment gateway processes transaction
3. Callback confirms payment (MpesaCallbackRequest for M-Pesa)
4. Funds distributed to instructor wallet via AddFundsRequest
5. Instructor can request payout via PayoutRequest
"""

from datetime import datetime
from decimal import Decimal
from typing import Optional, List, Dict, Any
from uuid import UUID
from enum import Enum

from pydantic import BaseModel, Field, field_validator, ConfigDict


# Enums for validation
class PaymentGateway(str, Enum):
    """Supported payment gateways."""
    MPESA = "mpesa"
    PAYPAL = "paypal"
    STRIPE = "stripe"


class PaymentStatus(str, Enum):
    """Payment transaction statuses."""
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"
    CANCELLED = "cancelled"


class TransactionType(str, Enum):
    """Wallet transaction types."""
    CREDIT = "credit"
    DEBIT = "debit"
    REFUND = "refund"
    PAYOUT = "payout"
    ADJUSTMENT = "adjustment"


class PaymentMethodType(str, Enum):
    """Saved payment method types."""
    MPESA = "mpesa"
    CARD = "card"
    PAYPAL = "paypal"


# Request Schemas

class PaymentInitiateRequest(BaseModel):
    """
    Schema for initiating a payment for course enrollment or service.

    Supports three payment gateways:
    - mpesa: M-Pesa STK Push (Kenya)
    - paypal: PayPal Standard Payments
    - stripe: Stripe Checkout

    Attributes:
        gateway: Payment gateway identifier (required)
        amount: Payment amount (must be positive, 2 decimal places)
        phone_number: Required for M-Pesa, format: 254XXXXXXXXX or 07XXXXXXXX
        payment_method_id: Optional saved payment method ID for repeat payments
        course_id: Optional UUID of the course being purchased
        metadata: Optional additional payment metadata
        currency: ISO 4217 currency code (default: KES for Kenyan Shilling)
        description: Optional payment description
    """
    gateway: PaymentGateway = Field(..., description="Payment gateway: mpesa, paypal, or stripe")
    amount: Decimal = Field(..., gt=0, decimal_places=2, description="Payment amount (must be > 0)")
    phone_number: Optional[str] = Field(
        None,
        description="Required for M-Pesa. Format: 254XXXXXXXXX or 07XXXXXXXX"
    )
    payment_method_id: Optional[UUID] = Field(None, description="Saved payment method ID")
    course_id: Optional[UUID] = Field(None, description="UUID of the course being purchased")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional payment metadata")
    currency: str = Field(default="KES", max_length=3, description="ISO 4217 currency code")
    description: Optional[str] = Field(None, max_length=500, description="Payment description")

    @field_validator('phone_number')
    @classmethod
    def validate_mpesa_phone(cls, v: Optional[str], info) -> Optional[str]:
        """
        Validate phone number for M-Pesa transactions.

        M-Pesa requires a valid Kenyan phone number in one of these formats:
        - 254XXXXXXXXX (international format with country code)
        - 07XXXXXXXX (local format)
        - 01XXXXXXXX (local format for landlines, rarely used)

        Args:
            v: Phone number value
            info: ValidationInfo containing other field values

        Returns:
            Validated phone number in international format (254XXXXXXXXX)

        Raises:
            ValueError: If gateway is M-Pesa and phone number is invalid or missing
        """
        values = info.data
        gateway = values.get('gateway')

        if gateway == PaymentGateway.MPESA:
            if not v:
                raise ValueError('Phone number is required for M-Pesa payments')

            # Remove spaces and common separators
            cleaned = v.replace(' ', '').replace('-', '').replace('+', '')

            # Validate Kenyan phone number formats
            if cleaned.startswith('254') and len(cleaned) == 12:
                # International format: 254XXXXXXXXX
                if not cleaned[3:].isdigit():
                    raise ValueError('Invalid M-Pesa phone number format')
                return cleaned
            elif cleaned.startswith('0') and len(cleaned) == 10:
                # Local format: 07XXXXXXXX or 01XXXXXXXX
                if not cleaned[1:].isdigit():
                    raise ValueError('Invalid M-Pesa phone number format')
                # Convert to international format
                return f"254{cleaned[1:]}"
            else:
                raise ValueError(
                    'Phone number must be in format 254XXXXXXXXX or 07XXXXXXXX'
                )

        return v

    @field_validator('currency')
    @classmethod
    def validate_currency_uppercase(cls, v: str) -> str:
        """Ensure currency code is uppercase."""
        return v.upper()


class MpesaCallbackRequest(BaseModel):
    """
    M-Pesa Daraja API STK Push callback schema.

    This schema handles the callback data sent by Safaricom's M-Pesa API
    after an STK Push transaction is completed or failed.

    Attributes:
        MerchantRequestID: Unique identifier from merchant system
        CheckoutRequestID: Unique identifier from M-Pesa system
        ResultCode: Transaction result code (0 = success, non-zero = failure)
        ResultDesc: Human-readable result description
        CallbackMetadata: Additional transaction metadata (amount, phone, receipt, etc.)

    Result Codes:
        0: Success
        1: Insufficient funds
        1032: Request cancelled by user
        1037: Timeout (user didn't enter PIN)
        2001: Invalid initiator information
    """
    MerchantRequestID: str = Field(..., description="Merchant request identifier")
    CheckoutRequestID: str = Field(..., description="M-Pesa checkout request identifier")
    ResultCode: int = Field(..., description="Transaction result code (0 = success)")
    ResultDesc: str = Field(..., description="Result description")
    CallbackMetadata: Optional[Dict[str, Any]] = Field(
        None,
        description="Transaction metadata including amount, phone, receipt number, and transaction date"
    )


class PayPalWebhookRequest(BaseModel):
    """
    PayPal webhook event schema.

    Handles PayPal IPN (Instant Payment Notification) or webhook events
    for payment confirmations and refunds.

    Attributes:
        event_type: Type of PayPal event (PAYMENT.CAPTURE.COMPLETED, etc.)
        resource: Payment resource data
        id: PayPal event ID
        create_time: Event creation timestamp
        resource_type: Type of resource (capture, refund, etc.)
    """
    event_type: str = Field(..., description="PayPal event type")
    resource: Dict[str, Any] = Field(..., description="Payment resource data")
    id: str = Field(..., description="PayPal event ID")
    create_time: Optional[str] = Field(None, description="Event creation timestamp")
    resource_type: Optional[str] = Field(None, description="Resource type")


class StripeWebhookRequest(BaseModel):
    """
    Stripe webhook event schema.

    Handles Stripe webhook events for payment confirmations, refunds,
    and other payment lifecycle events.

    Attributes:
        id: Stripe event ID
        type: Event type (payment_intent.succeeded, charge.refunded, etc.)
        data: Event data containing the payment object
        created: Event creation timestamp
        livemode: Whether this is a live mode event
    """
    id: str = Field(..., description="Stripe event ID")
    type: str = Field(..., description="Stripe event type")
    data: Dict[str, Any] = Field(..., description="Event data with payment object")
    created: int = Field(..., description="Event creation timestamp")
    livemode: bool = Field(default=False, description="Live mode indicator")


class AddFundsRequest(BaseModel):
    """
    Schema for adding funds to user wallet.

    Used when payment is confirmed and funds need to be credited to user's wallet.
    Typically used internally after successful payment callback.

    Attributes:
        amount: Amount to add to wallet (must be positive, 2 decimal places)
        gateway: Payment gateway that processed the payment
        transaction_ref: Reference number from the payment gateway
        description: Optional description of the transaction
        metadata: Optional additional transaction metadata
    """
    amount: Decimal = Field(..., gt=0, decimal_places=2, description="Amount to add (must be > 0)")
    gateway: PaymentGateway = Field(..., description="Payment gateway used")
    transaction_ref: str = Field(..., min_length=1, max_length=200, description="Gateway transaction reference")
    description: Optional[str] = Field(None, max_length=500, description="Transaction description")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional metadata")


class PaymentMethodCreate(BaseModel):
    """
    Schema for creating a saved payment method.

    Allows users to save payment methods for faster checkout.

    Attributes:
        gateway: Payment gateway (mpesa, paypal, stripe)
        method_type: Type of payment method (mpesa, card, paypal)
        details: Payment method details
            - For M-Pesa: {"phone_number": "254XXXXXXXXX"}
            - For Card: {"last4": "4242", "brand": "visa", "exp_month": 12, "exp_year": 2025}
            - For PayPal: {"email": "user@example.com"}
        is_default: Whether this should be the default payment method
    """
    gateway: PaymentGateway = Field(..., description="Payment gateway")
    method_type: PaymentMethodType = Field(..., description="Payment method type")
    details: Dict[str, Any] = Field(..., description="Payment method details (encrypted)")
    is_default: bool = Field(default=False, description="Set as default payment method")

    @field_validator('details')
    @classmethod
    def validate_payment_details(cls, v: Dict[str, Any], info) -> Dict[str, Any]:
        """
        Validate payment method details based on method type.

        Args:
            v: Payment method details
            info: ValidationInfo containing other field values

        Returns:
            Validated payment details

        Raises:
            ValueError: If required fields are missing
        """
        values = info.data
        method_type = values.get('method_type')

        if method_type == PaymentMethodType.MPESA:
            if 'phone_number' not in v:
                raise ValueError('phone_number is required for M-Pesa payment methods')

        elif method_type == PaymentMethodType.CARD:
            required_fields = ['last4', 'brand', 'exp_month', 'exp_year']
            missing = [field for field in required_fields if field not in v]
            if missing:
                raise ValueError(f'Missing required fields for card: {", ".join(missing)}')

        elif method_type == PaymentMethodType.PAYPAL:
            if 'email' not in v:
                raise ValueError('email is required for PayPal payment methods')

        return v


class PayoutRequest(BaseModel):
    """
    Schema for instructor payout requests.

    External instructors can request payouts from their wallet balance
    via M-Pesa or bank transfer.

    Minimum Payout:
        - M-Pesa: KES 100
        - Bank Transfer: KES 1,000

    Attributes:
        amount: Payout amount (must be positive, 2 decimal places)
        payment_method: Payout method (mpesa or bank_transfer)
        account_details: Payment account details
            - For M-Pesa: {"phone_number": "254XXXXXXXXX"}
            - For Bank: {"account_number": "...", "bank_code": "...", "account_name": "..."}
    """
    amount: Decimal = Field(
        ...,
        gt=0,
        decimal_places=2,
        description="Payout amount (minimum: KES 100 for M-Pesa, KES 1,000 for bank)"
    )
    payment_method: str = Field(
        ...,
        pattern="^(mpesa|bank_transfer)$",
        description="Payout method: mpesa or bank_transfer"
    )
    account_details: Dict[str, Any] = Field(
        ...,
        description="Payment account details (phone number for M-Pesa, bank details for bank transfer)"
    )

    @field_validator('account_details')
    @classmethod
    def validate_account_details(cls, v: Dict[str, Any], info) -> Dict[str, Any]:
        """
        Validate account details based on payment method.

        Args:
            v: Account details dictionary
            info: ValidationInfo containing other field values

        Returns:
            Validated account details

        Raises:
            ValueError: If required fields are missing or invalid
        """
        values = info.data
        payment_method = values.get('payment_method')

        if payment_method == 'mpesa':
            if 'phone_number' not in v:
                raise ValueError('phone_number is required for M-Pesa payouts')

            phone = v['phone_number']
            # Remove spaces and common separators
            cleaned = phone.replace(' ', '').replace('-', '').replace('+', '')

            # Validate Kenyan phone number
            if not (cleaned.startswith('254') and len(cleaned) == 12) and \
               not (cleaned.startswith('0') and len(cleaned) == 10):
                raise ValueError('Invalid M-Pesa phone number format')

        elif payment_method == 'bank_transfer':
            required_fields = ['account_number', 'bank_code', 'account_name']
            missing = [field for field in required_fields if field not in v]
            if missing:
                raise ValueError(f'Missing required fields for bank transfer: {", ".join(missing)}')

        return v

    @field_validator('amount')
    @classmethod
    def validate_minimum_payout(cls, v: Decimal, info) -> Decimal:
        """
        Validate minimum payout amount based on payment method.

        Args:
            v: Payout amount
            info: ValidationInfo containing other field values

        Returns:
            Validated amount

        Raises:
            ValueError: If amount is below minimum for payment method
        """
        values = info.data
        payment_method = values.get('payment_method')

        if payment_method == 'mpesa' and v < Decimal('100'):
            raise ValueError('Minimum M-Pesa payout is KES 100')

        if payment_method == 'bank_transfer' and v < Decimal('1000'):
            raise ValueError('Minimum bank transfer payout is KES 1,000')

        return v


class RefundRequest(BaseModel):
    """
    Schema for requesting payment refunds.

    Refunds can be initiated by users or administrators within the refund
    policy window (typically 14 days for course enrollments).

    Refund Policy:
        - Full refund: Within 7 days, less than 10% course completion
        - Partial refund (50%): Within 14 days, less than 30% completion
        - No refund: After 14 days or more than 30% completion

    Attributes:
        payment_id: ID of the payment to refund
        reason: Detailed reason for refund request (10-500 characters)
        amount: Optional partial refund amount (defaults to full payment amount)
    """
    payment_id: UUID = Field(..., description="Payment ID to refund")
    reason: str = Field(
        ...,
        min_length=10,
        max_length=500,
        description="Detailed reason for refund request"
    )
    amount: Optional[Decimal] = Field(
        None,
        gt=0,
        decimal_places=2,
        description="Partial refund amount (defaults to full amount)"
    )


# Response Schemas

class PaymentInitiateResponse(BaseModel):
    """
    Schema for payment initiation response.

    Returned when a payment is successfully initiated, providing
    either a payment URL (PayPal/Stripe) or confirmation message (M-Pesa).

    Attributes:
        payment_id: UUID of the created payment record
        reference_number: Internal payment reference number
        status: Current payment status
        payment_url: Payment URL for PayPal/Stripe checkout (if applicable)
        message: User-friendly message about the payment
        gateway: Payment gateway used
        amount: Payment amount
        currency: Payment currency
        expires_at: When the payment link expires (if applicable)
    """
    payment_id: UUID = Field(..., description="Payment record ID")
    reference_number: str = Field(..., description="Internal reference number")
    status: PaymentStatus = Field(..., description="Payment status")
    payment_url: Optional[str] = Field(None, description="Payment URL for redirect (PayPal/Stripe)")
    message: str = Field(..., description="User-friendly status message")
    gateway: PaymentGateway = Field(..., description="Payment gateway used")
    amount: Decimal = Field(..., description="Payment amount")
    currency: str = Field(..., description="Payment currency")
    expires_at: Optional[datetime] = Field(None, description="Payment link expiration time")


class TransactionResponse(BaseModel):
    """
    Schema for returning payment transaction data.

    Used for API responses when fetching payment details.

    Attributes:
        id: Unique payment identifier
        user_id: ID of user who made the payment
        course_id: ID of course being purchased (if applicable)
        gateway: Payment gateway used
        transaction_id: Gateway-specific transaction identifier
        reference_number: Internal reference number for tracking
        amount: Payment amount
        currency: ISO 4217 currency code
        status: Payment status (pending, completed, failed, refunded)
        description: Optional payment description
        phone_number: Phone number used (for M-Pesa)
        payment_metadata: Additional payment metadata
        gateway_response: Raw gateway response data
        initiated_at: Timestamp when payment was initiated
        completed_at: Timestamp when payment was completed (if applicable)
        created_at: Record creation timestamp
        updated_at: Record last update timestamp
    """
    id: UUID
    user_id: Optional[UUID] = None
    course_id: Optional[UUID] = None
    gateway: str = Field(..., description="Payment gateway used")
    transaction_id: str = Field(..., description="Gateway transaction identifier")
    reference_number: str = Field(..., description="Internal reference number")
    amount: Decimal = Field(..., description="Payment amount")
    currency: str = Field(..., max_length=3, description="ISO 4217 currency code")
    status: str = Field(..., description="Payment status: pending, completed, failed, refunded")
    description: Optional[str] = Field(None, description="Payment description")
    phone_number: Optional[str] = Field(None, description="Phone number for M-Pesa")
    payment_metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Payment metadata")
    gateway_response: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Gateway response")
    initiated_at: datetime = Field(..., description="Payment initiation timestamp")
    completed_at: Optional[datetime] = Field(None, description="Payment completion timestamp")
    created_at: datetime = Field(..., description="Record creation timestamp")
    updated_at: datetime = Field(..., description="Record update timestamp")

    model_config = ConfigDict(from_attributes=True)


class WalletResponse(BaseModel):
    """
    Schema for returning user wallet data.

    Wallets are primarily used by external instructors to receive revenue
    from course enrollments (60% of course price).

    Attributes:
        id: Unique wallet identifier
        user_id: Owner of the wallet
        balance: Current available balance
        currency: ISO 4217 currency code
        total_earned: Lifetime earnings
        pending_payout: Amount pending withdrawal
        is_active: Whether wallet is active for transactions
        created_at: Wallet creation timestamp
        updated_at: Last update timestamp
    """
    id: UUID
    user_id: UUID
    balance: Decimal = Field(..., description="Current available balance")
    currency: str = Field(..., max_length=3, description="ISO 4217 currency code")
    total_earned: Decimal = Field(..., description="Lifetime total earnings")
    pending_payout: Decimal = Field(..., description="Amount pending withdrawal")
    is_active: bool = Field(..., description="Wallet active status")
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class WalletTransactionResponse(BaseModel):
    """
    Schema for wallet transaction history.

    Tracks all wallet transactions including earnings, payouts, and adjustments.

    Transaction Types:
        - credit: Funds added to wallet (course enrollment revenue)
        - debit: Funds removed from wallet (payout, refund)
        - refund: Money returned to wallet
        - payout: Money transferred out (instructor earnings)
        - adjustment: Manual balance adjustment by admin

    Attributes:
        id: Unique transaction identifier
        wallet_id: Associated wallet
        payment_id: Related payment (if applicable)
        transaction_type: Type of transaction (credit, debit, refund, payout, adjustment)
        amount: Transaction amount (positive for credit, negative for debit)
        balance_before: Wallet balance before transaction
        balance_after: Wallet balance after transaction
        description: Transaction description
        payment_metadata: Additional transaction metadata
        created_at: Transaction timestamp
    """
    id: UUID
    wallet_id: UUID
    payment_id: Optional[UUID] = Field(None, description="Related payment ID")
    transaction_type: str = Field(..., description="Transaction type: credit, debit, refund, payout, adjustment")
    amount: Decimal = Field(..., description="Transaction amount")
    balance_before: Decimal = Field(..., description="Balance before transaction")
    balance_after: Decimal = Field(..., description="Balance after transaction")
    description: Optional[str] = Field(None, description="Transaction description")
    payment_metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Transaction metadata")
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PaymentMethodResponse(BaseModel):
    """
    Schema for returning saved payment method data.

    Attributes:
        id: Unique payment method identifier
        user_id: Owner of the payment method
        gateway: Payment gateway (mpesa, paypal, stripe)
        method_type: Type of payment method (mpesa, card, paypal)
        details: Masked payment method details (never full details)
        is_default: Whether this is the default payment method
        is_active: Whether payment method is active
        created_at: Creation timestamp
        updated_at: Last update timestamp
    """
    id: UUID
    user_id: UUID
    gateway: str = Field(..., description="Payment gateway")
    method_type: str = Field(..., description="Payment method type")
    details: Dict[str, Any] = Field(..., description="Masked payment details")
    is_default: bool = Field(..., description="Default payment method flag")
    is_active: bool = Field(..., description="Active status")
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TransactionListResponse(BaseModel):
    """
    Schema for paginated transaction list.

    Used when fetching transaction history with pagination support.

    Attributes:
        transactions: List of transactions
        total: Total number of transactions
        page: Current page number
        page_size: Number of items per page
        total_pages: Total number of pages
    """
    transactions: List[TransactionResponse] = Field(..., description="List of transactions")
    total: int = Field(..., ge=0, description="Total number of transactions")
    page: int = Field(..., ge=1, description="Current page number")
    page_size: int = Field(..., ge=1, le=100, description="Items per page")
    total_pages: int = Field(..., ge=0, description="Total number of pages")


class PaymentStatusResponse(BaseModel):
    """
    Schema for checking payment status.

    Used for querying the current status of a payment transaction.

    Attributes:
        payment_id: Payment identifier
        reference_number: Internal payment reference number
        status: Current payment status
        amount: Payment amount
        currency: ISO 4217 currency code
        gateway: Payment gateway used
        initiated_at: When payment was initiated
        completed_at: Completion timestamp (if completed)
        message: User-friendly status message
    """
    payment_id: UUID = Field(..., description="Payment identifier")
    reference_number: str = Field(..., description="Payment reference number")
    status: PaymentStatus = Field(..., description="Current payment status")
    amount: Decimal = Field(..., description="Payment amount")
    currency: str = Field(..., max_length=3, description="ISO 4217 currency code")
    gateway: str = Field(..., description="Payment gateway used")
    initiated_at: datetime = Field(..., description="Payment initiation timestamp")
    completed_at: Optional[datetime] = Field(None, description="Completion timestamp")
    message: str = Field(..., description="User-friendly status message")
