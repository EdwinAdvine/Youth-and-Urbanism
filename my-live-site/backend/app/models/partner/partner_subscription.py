"""
Partner Subscription Models

Models for managing partner sponsorship subscriptions with support
for monthly, termly, and annual billing periods, plus payment tracking.
"""

import uuid
from datetime import datetime

from sqlalchemy import (
    Column, String, Text, Boolean, Integer, DateTime, UUID,
    ForeignKey, Numeric, Date, Enum as SQLEnum, Index,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
import enum

from app.database import Base


class PartnerSubscriptionStatus(str, enum.Enum):
    """Status of a partner subscription"""
    ACTIVE = "active"
    PAST_DUE = "past_due"
    CANCELLED = "cancelled"
    EXPIRED = "expired"
    PAUSED = "paused"


class PartnerPaymentStatus(str, enum.Enum):
    """Status of individual partner payments"""
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"


class PartnerPaymentGateway(str, enum.Enum):
    """Supported payment gateways"""
    MPESA = "mpesa"
    STRIPE = "stripe"
    PAYPAL = "paypal"


class PartnerSubscription(Base):
    """Subscription record linking a partner to a sponsorship program billing cycle"""

    __tablename__ = "partner_subscriptions"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # References
    partner_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    program_id = Column(UUID(as_uuid=True), ForeignKey("sponsorship_programs.id", ondelete="CASCADE"), nullable=False, index=True)

    # Billing configuration
    billing_period = Column(String(20), nullable=False)  # monthly, termly, annual
    amount_per_child = Column(Numeric(12, 2), nullable=False)
    total_children = Column(Integer, nullable=False)
    total_amount = Column(Numeric(12, 2), nullable=False)
    currency = Column(String(3), default="KES", nullable=False)

    # Status
    status = Column(SQLEnum(PartnerSubscriptionStatus), default=PartnerSubscriptionStatus.ACTIVE, nullable=False, index=True)

    # Billing period tracking
    current_period_start = Column(Date, nullable=True)
    current_period_end = Column(Date, nullable=True)
    next_billing_date = Column(Date, nullable=True)

    # Payment method reference
    payment_method_id = Column(UUID(as_uuid=True), ForeignKey("payment_methods.id", ondelete="SET NULL"), nullable=True)

    # Auto-renewal
    auto_renew = Column(Boolean, default=True, nullable=False)

    # Cancellation
    cancelled_at = Column(DateTime, nullable=True)
    cancellation_reason = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    partner = relationship("User", foreign_keys=[partner_id])
    program = relationship("SponsorshipProgram", back_populates="subscriptions")
    payment_method = relationship("PaymentMethod", foreign_keys=[payment_method_id])
    payments = relationship("PartnerPayment", back_populates="subscription", cascade="all, delete-orphan")

    # Indexes
    __table_args__ = (
        Index("ix_partner_subscriptions_partner_status", "partner_id", "status"),
    )


class PartnerPayment(Base):
    """Individual payment records for partner sponsorship subscriptions"""

    __tablename__ = "partner_payments"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # References
    subscription_id = Column(UUID(as_uuid=True), ForeignKey("partner_subscriptions.id", ondelete="CASCADE"), nullable=False, index=True)
    partner_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Payment details
    amount = Column(Numeric(12, 2), nullable=False)
    currency = Column(String(3), default="KES", nullable=False)
    status = Column(SQLEnum(PartnerPaymentStatus), default=PartnerPaymentStatus.PENDING, nullable=False, index=True)

    # Gateway details
    payment_gateway = Column(SQLEnum(PartnerPaymentGateway), nullable=True)
    transaction_reference = Column(String(200), nullable=True, unique=True)
    gateway_response = Column(JSONB, nullable=True)

    # Invoice/receipt
    receipt_url = Column(String(500), nullable=True)
    invoice_number = Column(String(100), nullable=True, unique=True)

    # Period covered
    period_start = Column(Date, nullable=True)
    period_end = Column(Date, nullable=True)

    # Timestamps
    paid_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationships
    subscription = relationship("PartnerSubscription", back_populates="payments")
    partner = relationship("User", foreign_keys=[partner_id])

    # Indexes
    __table_args__ = (
        Index("ix_partner_payments_partner_status", "partner_id", "status"),
    )
