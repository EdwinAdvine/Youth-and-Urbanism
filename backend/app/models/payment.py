"""
Payment Models - Multi-Gateway Payment Processing

This module implements comprehensive payment infrastructure for the Urban Home School platform:

Models:
- Transaction: Payment transactions with multi-gateway support (M-Pesa, PayPal, Stripe)
- Wallet: User wallet system for balance tracking and credit management
- PaymentMethod: Saved payment methods for users

Features:
- Multi-gateway payment processing (M-Pesa, PayPal, Stripe)
- Transaction status lifecycle tracking
- User wallet with balance management
- Saved payment methods for recurring payments
- Comprehensive metadata storage for gateway-specific data
- Audit trail with timestamps
"""

import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import (
    Column,
    String,
    Boolean,
    DateTime,
    ForeignKey,
    Numeric,
    Index,
    Enum as SQLEnum,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.ext.asyncio import AsyncAttrs
from sqlalchemy.orm import relationship

from app.database import Base


class Transaction(AsyncAttrs, Base):
    """
    Payment transaction model for multi-gateway payment processing.

    Supports three payment gateways:
    - M-Pesa: Mobile money payment (Kenya)
    - PayPal: International payment gateway
    - Stripe: Credit/debit card processing

    Transaction lifecycle:
    pending -> completed | failed | refunded

    Attributes:
        id: Unique transaction identifier (UUID)
        user_id: Foreign key to users table
        amount: Transaction amount (Decimal, 2 decimal places)
        currency: Currency code (default: KES for Kenyan Shilling)
        gateway: Payment gateway used (mpesa, paypal, stripe)
        status: Current transaction status (pending, completed, failed, refunded)
        transaction_reference: Unique transaction reference from gateway
        metadata: JSONB field for gateway-specific data and additional info
        created_at: Timestamp when transaction was created
        updated_at: Timestamp when transaction was last updated
    """

    __tablename__ = "transactions"

    # Primary key
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
        doc="Unique transaction identifier",
    )

    # Foreign key to users
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        doc="User who initiated the transaction",
    )

    # Transaction details
    amount = Column(
        Numeric(10, 2),
        nullable=False,
        doc="Transaction amount with 2 decimal precision",
    )

    currency = Column(
        String(3),
        default="KES",
        nullable=False,
        doc="ISO 4217 currency code (KES, USD, EUR, etc.)",
    )

    # Payment gateway
    gateway = Column(
        SQLEnum("mpesa", "paypal", "stripe", name="payment_gateway_enum"),
        nullable=False,
        index=True,
        doc="Payment gateway used for this transaction",
    )

    # Transaction status
    status = Column(
        SQLEnum(
            "pending", "completed", "failed", "refunded", name="transaction_status_enum"
        ),
        default="pending",
        nullable=False,
        index=True,
        doc="Current transaction status",
    )

    # Unique transaction reference from gateway
    transaction_reference = Column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
        doc="Unique reference from payment gateway",
    )

    # Gateway-specific data and additional metadata
    transaction_metadata = Column(
        JSONB,
        default=dict,
        nullable=False,
        doc="Gateway-specific data, customer info, and transaction details",
    )

    # Timestamps
    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        index=True,
        doc="Transaction creation timestamp",
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
        doc="Last update timestamp",
    )

    # Relationships
    user = relationship("User", back_populates="transactions")
    refunds = relationship("Refund", back_populates="transaction", cascade="all, delete-orphan")
    currency_conversions = relationship("CurrencyConversion", back_populates="transaction", cascade="all, delete-orphan")

    # Indexes for performance optimization
    __table_args__ = (
        Index("idx_transactions_user_status", "user_id", "status"),
        Index("idx_transactions_gateway_status", "gateway", "status"),
        Index("idx_transactions_created_at_desc", created_at.desc()),
    )

    def __repr__(self) -> str:
        """String representation for debugging."""
        return (
            f"<Transaction(id={self.id}, user_id={self.user_id}, "
            f"gateway={self.gateway}, amount={self.amount} {self.currency}, "
            f"status={self.status})>"
        )

    # Gateway type properties
    @property
    def is_mpesa(self) -> bool:
        """Check if transaction is via M-Pesa."""
        return self.gateway == "mpesa"

    @property
    def is_paypal(self) -> bool:
        """Check if transaction is via PayPal."""
        return self.gateway == "paypal"

    @property
    def is_stripe(self) -> bool:
        """Check if transaction is via Stripe."""
        return self.gateway == "stripe"

    # Status properties
    @property
    def is_pending(self) -> bool:
        """Check if transaction is pending."""
        return self.status == "pending"

    @property
    def is_completed(self) -> bool:
        """Check if transaction is completed."""
        return self.status == "completed"

    @property
    def is_failed(self) -> bool:
        """Check if transaction has failed."""
        return self.status == "failed"

    @property
    def is_refunded(self) -> bool:
        """Check if transaction has been refunded."""
        return self.status == "refunded"

    # Status update methods
    def mark_completed(self) -> None:
        """
        Mark transaction as completed.

        Updates:
        - status to 'completed'
        - updated_at to current UTC time
        - metadata with completion timestamp
        """
        self.status = "completed"
        self.updated_at = datetime.utcnow()
        if self.metadata is None:
            self.metadata = {}
        self.metadata["completed_at"] = datetime.utcnow().isoformat()

    def mark_failed(self, reason: Optional[str] = None) -> None:
        """
        Mark transaction as failed with optional reason.

        Args:
            reason: Optional description of why the transaction failed

        Updates:
        - status to 'failed'
        - metadata with failure reason and timestamp
        - updated_at to current UTC time
        """
        self.status = "failed"
        self.updated_at = datetime.utcnow()
        if self.metadata is None:
            self.metadata = {}
        self.metadata["failed_at"] = datetime.utcnow().isoformat()
        if reason:
            self.metadata["failure_reason"] = reason

    def mark_refunded(self, reason: Optional[str] = None) -> None:
        """
        Mark transaction as refunded with optional reason.

        Args:
            reason: Optional description of why the transaction was refunded

        Updates:
        - status to 'refunded'
        - metadata with refund reason and timestamp
        - updated_at to current UTC time
        """
        self.status = "refunded"
        self.updated_at = datetime.utcnow()
        if self.metadata is None:
            self.metadata = {}
        self.metadata["refunded_at"] = datetime.utcnow().isoformat()
        if reason:
            self.metadata["refund_reason"] = reason


class Wallet(AsyncAttrs, Base):
    """
    User wallet for balance tracking and credit management.

    Features:
    - Track user balance in platform currency
    - Support for multiple currencies (default: KES)
    - One-to-one relationship with user
    - Balance operations with validation

    Each user has exactly one wallet (one-to-one relationship).
    The wallet stores credits that can be used for platform services,
    course purchases, and other transactions.

    Attributes:
        id: Unique wallet identifier (UUID)
        user_id: Foreign key to users table (unique - one wallet per user)
        balance: Current wallet balance (Decimal, 2 decimal places)
        currency: Currency code (default: KES)
        created_at: Timestamp when wallet was created
        updated_at: Timestamp when wallet was last updated
    """

    __tablename__ = "wallets"

    # Primary key
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
        doc="Unique wallet identifier",
    )

    # One-to-one relationship with user
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
        doc="User who owns this wallet (one wallet per user)",
    )

    # Balance
    balance = Column(
        Numeric(10, 2),
        default=Decimal("0.00"),
        nullable=False,
        doc="Current wallet balance with 2 decimal precision",
    )

    currency = Column(
        String(3),
        default="KES",
        nullable=False,
        doc="ISO 4217 currency code (KES, USD, EUR, etc.)",
    )

    # Timestamps
    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        index=True,
        doc="Wallet creation timestamp",
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
        doc="Last update timestamp",
    )

    # Relationships
    user = relationship("User", back_populates="wallet")

    def __repr__(self) -> str:
        """String representation for debugging."""
        return (
            f"<Wallet(id={self.id}, user_id={self.user_id}, "
            f"balance={self.balance} {self.currency})>"
        )

    def credit(self, amount: Decimal) -> None:
        """
        Add credits to wallet balance.

        Args:
            amount: Amount to add to balance (must be positive)

        Updates:
        - balance increased by amount
        - updated_at to current UTC time

        Raises:
            ValueError: If amount is negative or zero
        """
        if amount <= 0:
            raise ValueError("Credit amount must be positive")

        self.balance = Decimal(str(self.balance)) + Decimal(str(amount))
        self.updated_at = datetime.utcnow()

    def debit(self, amount: Decimal) -> None:
        """
        Deduct credits from wallet balance.

        Args:
            amount: Amount to deduct from balance (must be positive)

        Updates:
        - balance decreased by amount
        - updated_at to current UTC time

        Raises:
            ValueError: If amount is negative/zero or exceeds balance
        """
        if amount <= 0:
            raise ValueError("Debit amount must be positive")

        current_balance = Decimal(str(self.balance))
        debit_amount = Decimal(str(amount))

        if debit_amount > current_balance:
            raise ValueError(
                f"Insufficient balance. Available: {current_balance}, "
                f"Required: {debit_amount}"
            )

        self.balance = current_balance - debit_amount
        self.updated_at = datetime.utcnow()

    @property
    def has_balance(self) -> bool:
        """Check if wallet has a positive balance."""
        return Decimal(str(self.balance)) > 0


class PaymentMethod(AsyncAttrs, Base):
    """
    Saved payment methods for recurring payments and quick checkout.

    Allows users to save their preferred payment methods for:
    - Recurring payments (subscriptions)
    - Quick checkout without re-entering details
    - Managing multiple payment options

    Supported payment methods:
    - M-Pesa: Phone number
    - PayPal: PayPal account email
    - Stripe: Credit/debit card (tokenized)

    Security:
    - Sensitive details stored in encrypted JSONB field
    - Card numbers tokenized by Stripe
    - Only last 4 digits stored for display

    Attributes:
        id: Unique payment method identifier (UUID)
        user_id: Foreign key to users table
        gateway: Payment gateway (mpesa, paypal, stripe)
        method_type: Type of payment method (phone, card, paypal_account)
        details: JSONB field for encrypted payment details
        is_default: Whether this is the user's default payment method
        is_active: Whether this payment method is currently active
        created_at: Timestamp when payment method was created
        updated_at: Timestamp when payment method was last updated
    """

    __tablename__ = "payment_methods"

    # Primary key
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
        doc="Unique payment method identifier",
    )

    # Foreign key to users
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        doc="User who owns this payment method",
    )

    # Payment gateway
    gateway = Column(
        SQLEnum("mpesa", "paypal", "stripe", name="payment_method_gateway_enum"),
        nullable=False,
        index=True,
        doc="Payment gateway for this payment method",
    )

    # Method type
    method_type = Column(
        String(50),
        nullable=False,
        doc="Payment method type (phone, card, paypal_account)",
    )

    # Payment details (encrypted)
    details = Column(
        JSONB,
        default=dict,
        nullable=False,
        doc="Encrypted payment details (last 4 digits, tokens, etc.)",
    )

    # Status flags
    is_default = Column(
        Boolean,
        default=False,
        nullable=False,
        doc="Whether this is the default payment method",
    )

    is_active = Column(
        Boolean, default=True, nullable=False, doc="Whether this method is active"
    )

    # Timestamps
    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        index=True,
        doc="Payment method creation timestamp",
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
        doc="Last update timestamp",
    )

    # Relationships
    user = relationship("User", back_populates="payment_methods")

    # Indexes for performance optimization
    __table_args__ = (
        Index("idx_payment_methods_user_active", "user_id", "is_active"),
        Index("idx_payment_methods_user_default", "user_id", "is_default"),
        Index("idx_payment_methods_gateway", "gateway"),
    )

    def __repr__(self) -> str:
        """String representation for debugging."""
        return (
            f"<PaymentMethod(id={self.id}, user_id={self.user_id}, "
            f"gateway={self.gateway}, type={self.method_type}, "
            f"default={self.is_default}, active={self.is_active})>"
        )

    # Gateway type properties
    @property
    def is_mpesa(self) -> bool:
        """Check if payment method is M-Pesa."""
        return self.gateway == "mpesa"

    @property
    def is_paypal(self) -> bool:
        """Check if payment method is PayPal."""
        return self.gateway == "paypal"

    @property
    def is_stripe(self) -> bool:
        """Check if payment method is Stripe."""
        return self.gateway == "stripe"

    # Method type properties
    @property
    def is_phone(self) -> bool:
        """Check if payment method is phone-based (M-Pesa)."""
        return self.method_type == "phone"

    @property
    def is_card(self) -> bool:
        """Check if payment method is card-based (Stripe)."""
        return self.method_type == "card"

    @property
    def is_paypal_account(self) -> bool:
        """Check if payment method is PayPal account."""
        return self.method_type == "paypal_account"

    def activate(self) -> None:
        """
        Activate this payment method.

        Updates:
        - is_active to True
        - updated_at to current UTC time
        """
        self.is_active = True
        self.updated_at = datetime.utcnow()

    def deactivate(self) -> None:
        """
        Deactivate this payment method.

        Updates:
        - is_active to False
        - is_default to False (cannot be default if inactive)
        - updated_at to current UTC time
        """
        self.is_active = False
        self.is_default = False  # Cannot be default if inactive
        self.updated_at = datetime.utcnow()

    def set_as_default(self) -> None:
        """
        Set this payment method as the default.

        Note: The caller should ensure that other payment methods
        for this user are set to is_default=False.

        Updates:
        - is_default to True
        - is_active to True (must be active to be default)
        - updated_at to current UTC time
        """
        self.is_default = True
        self.is_active = True  # Must be active to be default
        self.updated_at = datetime.utcnow()

    def get_display_info(self) -> str:
        """
        Get displayable information about this payment method.

        Returns:
            String representation safe for display to user
            (e.g., "M-Pesa •••• 1234", "Card •••• 5678")
        """
        if self.details is None:
            return f"{self.gateway.upper()} (No details)"

        # M-Pesa: Show last 4 digits of phone
        if self.is_mpesa and "last4" in self.details:
            return f"M-Pesa •••• {self.details['last4']}"

        # Stripe card: Show last 4 digits
        if self.is_stripe and "last4" in self.details:
            card_brand = self.details.get("brand", "Card")
            return f"{card_brand} •••• {self.details['last4']}"

        # PayPal: Show masked email
        if self.is_paypal and "email" in self.details:
            email = self.details["email"]
            if "@" in email:
                local, domain = email.split("@", 1)
                masked_local = local[:2] + "•" * (len(local) - 2)
                return f"PayPal ({masked_local}@{domain})"

        return f"{self.gateway.upper()} payment method"
