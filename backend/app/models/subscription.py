"""
Subscription Models for Recurring Payments - Urban Home School

This module implements a comprehensive subscription and recurring payment system:

Models:
- SubscriptionPlan: Configurable pricing plans (weekly, monthly, annual)
- Subscription: User subscription tracking with auto-renewal and payment handling

Features:
- Flexible billing cycles (weekly, monthly, quarterly, annual)
- Trial period support
- Automatic renewal with saved payment methods
- Failed payment retry logic
- Subscription pause/resume functionality
- Proration support for plan changes
- Revenue tracking and analytics
"""

import uuid
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Optional, List

from sqlalchemy import (
    Column,
    String,
    Boolean,
    Integer,
    DateTime,
    ForeignKey,
    Numeric,
    Index,
    Enum as SQLEnum,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.ext.asyncio import AsyncAttrs
from sqlalchemy.orm import relationship
import enum

from app.database import Base


class BillingCycle(str, enum.Enum):
    """Subscription billing cycle options"""
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    SEMI_ANNUAL = "semi_annual"
    ANNUAL = "annual"


class SubscriptionStatus(str, enum.Enum):
    """Subscription status lifecycle"""
    ACTIVE = "active"  # Active and billing
    TRIALING = "trialing"  # In trial period
    PAUSED = "paused"  # Temporarily paused by user
    PAST_DUE = "past_due"  # Payment failed, grace period
    CANCELLED = "cancelled"  # Cancelled by user
    EXPIRED = "expired"  # Trial ended or payment failed permanently
    SUSPENDED = "suspended"  # Suspended by admin


class PlanType(str, enum.Enum):
    """Subscription plan types"""
    COURSE_ACCESS = "course_access"  # Single course subscription
    PLATFORM_ACCESS = "platform_access"  # Full platform access
    PREMIUM_FEATURES = "premium_features"  # Premium features (AI tutor, certificates)
    BUNDLE = "bundle"  # Course bundle subscription


class SubscriptionPlan(AsyncAttrs, Base):
    """
    Subscription pricing plans and configurations.

    Defines reusable subscription plans with pricing, billing cycles,
    and feature access controls. Plans can be for individual courses,
    platform-wide access, or premium feature bundles.

    Attributes:
        id: Unique plan identifier (UUID)
        name: Plan display name (e.g., "Monthly Pro", "Annual Premium")
        description: Detailed plan description
        plan_type: Type of subscription (course, platform, premium, bundle)
        billing_cycle: How often to bill (weekly, monthly, quarterly, annual)
        price: Subscription price per billing cycle
        currency: ISO 4217 currency code (default: KES)
        trial_days: Number of trial days (0 = no trial)
        features: JSONB array of included features
        course_ids: JSONB array of course IDs included (for course/bundle plans)
        max_enrollments: Maximum course enrollments (-1 = unlimited)
        is_active: Whether plan is available for new subscriptions
        is_popular: Display as "most popular" plan
        display_order: Sort order for display
        metadata: Additional plan configuration
        created_at: Plan creation timestamp
        updated_at: Last update timestamp
    """

    __tablename__ = "subscription_plans"

    # Primary key
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
        doc="Unique subscription plan identifier",
    )

    # Plan details
    name = Column(
        String(100),
        nullable=False,
        index=True,
        doc="Plan display name (e.g., 'Monthly Pro')",
    )

    description = Column(
        Text,
        nullable=True,
        doc="Detailed plan description with benefits",
    )

    plan_type = Column(
        SQLEnum(PlanType),
        nullable=False,
        index=True,
        doc="Type of subscription plan",
    )

    # Billing configuration
    billing_cycle = Column(
        SQLEnum(BillingCycle),
        nullable=False,
        index=True,
        doc="Billing frequency (weekly, monthly, quarterly, annual)",
    )

    price = Column(
        Numeric(10, 2),
        nullable=False,
        doc="Subscription price per billing cycle",
    )

    currency = Column(
        String(3),
        default="KES",
        nullable=False,
        doc="ISO 4217 currency code",
    )

    # Trial configuration
    trial_days = Column(
        Integer,
        default=0,
        nullable=False,
        doc="Number of trial days (0 = no trial)",
    )

    # Feature configuration
    features = Column(
        JSONB,
        default=list,
        nullable=False,
        doc="Array of included features/benefits",
    )

    course_ids = Column(
        JSONB,
        default=list,
        nullable=False,
        doc="Array of course IDs included in plan",
    )

    max_enrollments = Column(
        Integer,
        default=-1,
        nullable=False,
        doc="Maximum course enrollments (-1 = unlimited)",
    )

    # Display and availability
    is_active = Column(
        Boolean,
        default=True,
        nullable=False,
        index=True,
        doc="Whether plan is available for new subscriptions",
    )

    is_popular = Column(
        Boolean,
        default=False,
        nullable=False,
        doc="Mark as 'Most Popular' plan",
    )

    display_order = Column(
        Integer,
        default=0,
        nullable=False,
        doc="Sort order for display (lower = first)",
    )

    # Additional metadata
    meta = Column(
        JSONB,
        default=dict,
        nullable=False,
        doc="Additional plan configuration",
    )

    # Timestamps
    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        index=True,
        doc="Plan creation timestamp",
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
        doc="Last update timestamp",
    )

    # Relationships
    subscriptions = relationship(
        "Subscription",
        back_populates="plan",
        cascade="all, delete-orphan",
    )

    # Indexes
    __table_args__ = (
        Index("idx_subscription_plans_type_active", "plan_type", "is_active"),
        Index("idx_subscription_plans_billing_cycle", "billing_cycle"),
        Index("idx_subscription_plans_display", "is_active", "display_order"),
    )

    def __repr__(self) -> str:
        """String representation for debugging."""
        return (
            f"<SubscriptionPlan(id={self.id}, name='{self.name}', "
            f"type={self.plan_type}, cycle={self.billing_cycle}, "
            f"price={self.price} {self.currency})>"
        )

    # Helper properties
    @property
    def is_course_plan(self) -> bool:
        """Check if plan is for course access."""
        return self.plan_type == PlanType.COURSE_ACCESS

    @property
    def is_platform_plan(self) -> bool:
        """Check if plan is for full platform access."""
        return self.plan_type == PlanType.PLATFORM_ACCESS

    @property
    def has_trial(self) -> bool:
        """Check if plan includes trial period."""
        return self.trial_days > 0

    @property
    def is_unlimited_enrollments(self) -> bool:
        """Check if plan allows unlimited enrollments."""
        return self.max_enrollments == -1

    @property
    def monthly_equivalent_price(self) -> Decimal:
        """
        Calculate monthly equivalent price for comparison.

        Returns:
            Decimal: Monthly equivalent price
        """
        if self.billing_cycle == BillingCycle.WEEKLY:
            return self.price * Decimal("4.33")  # Average weeks per month
        elif self.billing_cycle == BillingCycle.MONTHLY:
            return self.price
        elif self.billing_cycle == BillingCycle.QUARTERLY:
            return self.price / Decimal("3")
        elif self.billing_cycle == BillingCycle.SEMI_ANNUAL:
            return self.price / Decimal("6")
        elif self.billing_cycle == BillingCycle.ANNUAL:
            return self.price / Decimal("12")
        return self.price

    def get_billing_interval_days(self) -> int:
        """
        Get billing interval in days.

        Returns:
            int: Number of days in billing cycle
        """
        if self.billing_cycle == BillingCycle.WEEKLY:
            return 7
        elif self.billing_cycle == BillingCycle.MONTHLY:
            return 30
        elif self.billing_cycle == BillingCycle.QUARTERLY:
            return 90
        elif self.billing_cycle == BillingCycle.SEMI_ANNUAL:
            return 180
        elif self.billing_cycle == BillingCycle.ANNUAL:
            return 365
        return 30  # Default to monthly


class Subscription(AsyncAttrs, Base):
    """
    User subscription tracking with auto-renewal.

    Manages individual user subscriptions including billing, renewals,
    payment failures, and subscription lifecycle.

    Subscription Lifecycle:
        trialing -> active -> (paused/past_due) -> cancelled/expired

    Failed Payment Handling:
        - 1st failure: Retry immediately, status = past_due
        - 2nd failure: Retry after 3 days
        - 3rd failure: Retry after 5 days
        - After 3 failures: status = expired, subscription ends

    Attributes:
        id: Unique subscription identifier (UUID)
        user_id: Foreign key to users table
        plan_id: Foreign key to subscription_plans table
        enrollment_id: Optional link to enrollment (for course subscriptions)
        payment_method_id: Saved payment method for auto-billing
        status: Current subscription status
        current_period_start: Start of current billing period
        current_period_end: End of current billing period
        trial_start: Trial period start date
        trial_end: Trial period end date
        cancel_at_period_end: Whether to cancel at period end
        cancelled_at: When subscription was cancelled
        ended_at: When subscription ended
        next_billing_date: Next scheduled billing date
        last_payment_date: Last successful payment date
        last_payment_amount: Amount of last payment
        failed_payment_count: Count of consecutive failed payments
        renewal_count: Total number of successful renewals
        metadata: Additional subscription data
        created_at: Subscription creation timestamp
        updated_at: Last update timestamp
    """

    __tablename__ = "subscriptions"

    # Primary key
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
        doc="Unique subscription identifier",
    )

    # Foreign keys
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        doc="User who owns this subscription",
    )

    plan_id = Column(
        UUID(as_uuid=True),
        ForeignKey("subscription_plans.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
        doc="Subscription plan",
    )

    enrollment_id = Column(
        UUID(as_uuid=True),
        ForeignKey("enrollments.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        doc="Related enrollment for course subscriptions",
    )

    payment_method_id = Column(
        UUID(as_uuid=True),
        ForeignKey("payment_methods.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        doc="Saved payment method for auto-billing",
    )

    # Status
    status = Column(
        SQLEnum(SubscriptionStatus),
        default=SubscriptionStatus.ACTIVE,
        nullable=False,
        index=True,
        doc="Current subscription status",
    )

    # Billing period tracking
    current_period_start = Column(
        DateTime,
        nullable=False,
        doc="Start of current billing period",
    )

    current_period_end = Column(
        DateTime,
        nullable=False,
        index=True,
        doc="End of current billing period",
    )

    # Trial tracking
    trial_start = Column(
        DateTime,
        nullable=True,
        doc="Trial period start date",
    )

    trial_end = Column(
        DateTime,
        nullable=True,
        index=True,
        doc="Trial period end date",
    )

    # Cancellation tracking
    cancel_at_period_end = Column(
        Boolean,
        default=False,
        nullable=False,
        doc="Cancel at end of current period",
    )

    cancelled_at = Column(
        DateTime,
        nullable=True,
        doc="When subscription was cancelled",
    )

    ended_at = Column(
        DateTime,
        nullable=True,
        doc="When subscription ended",
    )

    # Payment tracking
    next_billing_date = Column(
        DateTime,
        nullable=True,
        index=True,
        doc="Next scheduled billing date",
    )

    last_payment_date = Column(
        DateTime,
        nullable=True,
        doc="Last successful payment date",
    )

    last_payment_amount = Column(
        Numeric(10, 2),
        nullable=True,
        doc="Amount of last payment",
    )

    failed_payment_count = Column(
        Integer,
        default=0,
        nullable=False,
        doc="Consecutive failed payment attempts",
    )

    renewal_count = Column(
        Integer,
        default=0,
        nullable=False,
        doc="Total successful renewals",
    )

    # Additional metadata
    meta = Column(
        JSONB,
        default=dict,
        nullable=False,
        doc="Additional subscription data (pause history, notes, etc.)",
    )

    # Timestamps
    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        index=True,
        doc="Subscription creation timestamp",
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
        doc="Last update timestamp",
    )

    # Relationships
    user = relationship("User", back_populates="subscriptions")
    plan = relationship("SubscriptionPlan", back_populates="subscriptions")
    enrollment = relationship("Enrollment")
    payment_method = relationship("PaymentMethod")

    # Indexes
    __table_args__ = (
        Index("idx_subscriptions_user_status", "user_id", "status"),
        Index("idx_subscriptions_next_billing", "next_billing_date", "status"),
        Index("idx_subscriptions_trial_end", "trial_end", "status"),
        Index("idx_subscriptions_period_end", "current_period_end", "status"),
    )

    def __repr__(self) -> str:
        """String representation for debugging."""
        return (
            f"<Subscription(id={self.id}, user_id={self.user_id}, "
            f"plan_id={self.plan_id}, status={self.status}, "
            f"next_billing={self.next_billing_date})>"
        )

    # Status properties
    @property
    def is_active(self) -> bool:
        """Check if subscription is active."""
        return self.status == SubscriptionStatus.ACTIVE

    @property
    def is_trialing(self) -> bool:
        """Check if subscription is in trial."""
        return self.status == SubscriptionStatus.TRIALING

    @property
    def is_past_due(self) -> bool:
        """Check if subscription has failed payment."""
        return self.status == SubscriptionStatus.PAST_DUE

    @property
    def is_cancelled(self) -> bool:
        """Check if subscription is cancelled."""
        return self.status == SubscriptionStatus.CANCELLED

    @property
    def is_billable(self) -> bool:
        """Check if subscription can be billed."""
        return self.status in [
            SubscriptionStatus.ACTIVE,
            SubscriptionStatus.TRIALING,
            SubscriptionStatus.PAST_DUE,
        ]

    @property
    def in_trial_period(self) -> bool:
        """Check if currently in trial period."""
        if not self.trial_end:
            return False
        return datetime.utcnow() < self.trial_end

    @property
    def days_until_renewal(self) -> int:
        """Get days until next renewal."""
        if not self.next_billing_date:
            return 0
        delta = self.next_billing_date - datetime.utcnow()
        return max(0, delta.days)

    # Lifecycle methods
    def start_trial(self, trial_days: int) -> None:
        """
        Start trial period.

        Args:
            trial_days: Number of trial days
        """
        self.status = SubscriptionStatus.TRIALING
        self.trial_start = datetime.utcnow()
        self.trial_end = datetime.utcnow() + timedelta(days=trial_days)
        self.next_billing_date = self.trial_end
        self.updated_at = datetime.utcnow()

    def activate(self) -> None:
        """Activate subscription after trial or payment."""
        self.status = SubscriptionStatus.ACTIVE
        self.failed_payment_count = 0
        self.updated_at = datetime.utcnow()

    def pause(self, reason: Optional[str] = None) -> None:
        """
        Pause subscription.

        Args:
            reason: Optional reason for pausing
        """
        self.status = SubscriptionStatus.PAUSED
        if reason:
            if self.metadata is None:
                self.metadata = {}
            self.metadata["pause_reason"] = reason
            self.metadata["paused_at"] = datetime.utcnow().isoformat()
        self.updated_at = datetime.utcnow()

    def resume(self) -> None:
        """Resume paused subscription."""
        if self.status == SubscriptionStatus.PAUSED:
            self.status = SubscriptionStatus.ACTIVE
            if self.metadata and "paused_at" in self.metadata:
                self.metadata["resumed_at"] = datetime.utcnow().isoformat()
            self.updated_at = datetime.utcnow()

    def cancel(self, immediately: bool = False, reason: Optional[str] = None) -> None:
        """
        Cancel subscription.

        Args:
            immediately: If True, cancel now. If False, cancel at period end.
            reason: Optional cancellation reason
        """
        self.cancelled_at = datetime.utcnow()

        if immediately:
            self.status = SubscriptionStatus.CANCELLED
            self.ended_at = datetime.utcnow()
            self.next_billing_date = None
        else:
            self.cancel_at_period_end = True
            # Keep active until period ends

        if reason:
            if self.metadata is None:
                self.metadata = {}
            self.metadata["cancellation_reason"] = reason

        self.updated_at = datetime.utcnow()

    def expire(self, reason: Optional[str] = None) -> None:
        """
        Mark subscription as expired.

        Args:
            reason: Expiration reason (trial ended, payment failed, etc.)
        """
        self.status = SubscriptionStatus.EXPIRED
        self.ended_at = datetime.utcnow()
        self.next_billing_date = None

        if reason:
            if self.metadata is None:
                self.metadata = {}
            self.metadata["expiration_reason"] = reason

        self.updated_at = datetime.utcnow()

    def mark_payment_failed(self) -> None:
        """Record failed payment attempt."""
        self.failed_payment_count += 1
        self.status = SubscriptionStatus.PAST_DUE

        # Schedule retry based on attempt count
        if self.failed_payment_count == 1:
            # Retry immediately (handled by webhook)
            retry_delay = 0
        elif self.failed_payment_count == 2:
            # Retry after 3 days
            retry_delay = 3
        elif self.failed_payment_count >= 3:
            # Retry after 5 days (last attempt)
            retry_delay = 5
        else:
            retry_delay = 1

        self.next_billing_date = datetime.utcnow() + timedelta(days=retry_delay)

        if self.metadata is None:
            self.metadata = {}
        self.metadata["last_payment_failure"] = datetime.utcnow().isoformat()
        self.metadata["failed_attempts"] = self.failed_payment_count

        self.updated_at = datetime.utcnow()

    def mark_payment_successful(self, amount: Decimal) -> None:
        """
        Record successful payment.

        Args:
            amount: Payment amount
        """
        self.last_payment_date = datetime.utcnow()
        self.last_payment_amount = amount
        self.failed_payment_count = 0
        self.renewal_count += 1

        if self.status == SubscriptionStatus.PAST_DUE:
            self.status = SubscriptionStatus.ACTIVE

        # Update billing period
        self.current_period_start = datetime.utcnow()

        if self.metadata is None:
            self.metadata = {}
        self.metadata["last_successful_payment"] = datetime.utcnow().isoformat()

        self.updated_at = datetime.utcnow()

    def advance_billing_period(self, plan: SubscriptionPlan) -> None:
        """
        Advance to next billing period.

        Args:
            plan: Subscription plan with billing cycle
        """
        billing_days = plan.get_billing_interval_days()

        self.current_period_start = self.current_period_end
        self.current_period_end = self.current_period_start + timedelta(days=billing_days)
        self.next_billing_date = self.current_period_end
        self.updated_at = datetime.utcnow()

    def should_retry_payment(self) -> bool:
        """
        Check if should retry failed payment.

        Returns:
            bool: True if should retry, False if should expire
        """
        return self.failed_payment_count < 3
