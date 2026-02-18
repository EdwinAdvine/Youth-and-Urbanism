"""
Payment Analytics Models - Urban Home School

This module implements payment and revenue analytics with aggregated metrics:

Models:
- RevenueMetrics: Daily/monthly revenue aggregations
- PaymentAnalytics: Payment method and gateway analytics

Features:
- Daily revenue aggregation by currency and gateway
- Monthly revenue summaries
- Payment method breakdown and trends
- Refund rate tracking
- Subscription metrics (MRR, churn, etc.)
- Pre-computed analytics for dashboard performance
"""

import uuid
from datetime import datetime, date
from decimal import Decimal
from typing import Optional

from sqlalchemy import (
    Column,
    String,
    Integer,
    Date,
    DateTime,
    Numeric,
    Index,
    UniqueConstraint,
    CheckConstraint,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.ext.asyncio import AsyncAttrs

from app.database import Base


class RevenueMetrics(AsyncAttrs, Base):
    """
    Daily/monthly revenue aggregation for analytics dashboard.

    Pre-computed revenue metrics to improve dashboard performance.
    Updated by background jobs or triggers on payment completion.

    Metrics Tracked:
        - Total revenue (gross)
        - Net revenue (after refunds)
        - Transaction counts
        - Average transaction value
        - Gateway breakdown
        - Currency breakdown
        - Refund statistics

    Attributes:
        id: Unique metric identifier (UUID)
        metric_date: Date for this metric (daily or month-start for monthly)
        period_type: Type of period (daily, weekly, monthly, yearly)
        currency: Revenue currency code
        total_revenue: Gross revenue (before refunds)
        net_revenue: Net revenue (after refunds)
        refund_amount: Total refunds for period
        transaction_count: Number of transactions
        successful_count: Number of successful transactions
        failed_count: Number of failed transactions
        refund_count: Number of refunds
        average_transaction_value: Average transaction amount
        gateway_breakdown: JSONB with revenue by gateway
        payment_method_breakdown: JSONB with revenue by payment method
        course_revenue: Revenue from course purchases
        subscription_revenue: Revenue from subscriptions
        metadata: Additional metrics data
        created_at: Record creation timestamp
        updated_at: Last update timestamp
    """

    __tablename__ = "revenue_metrics"

    # Primary key
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
        doc="Unique metric identifier",
    )

    # Time period
    metric_date = Column(
        Date,
        nullable=False,
        index=True,
        doc="Date for this metric",
    )

    period_type = Column(
        String(20),
        default="daily",
        nullable=False,
        index=True,
        doc="Period type (daily, weekly, monthly, yearly)",
    )

    # Currency
    currency = Column(
        String(3),
        default="KES",
        nullable=False,
        index=True,
        doc="Revenue currency code",
    )

    # Revenue metrics
    total_revenue = Column(
        Numeric(15, 2),
        default=Decimal("0.00"),
        nullable=False,
        doc="Gross revenue before refunds",
    )

    net_revenue = Column(
        Numeric(15, 2),
        default=Decimal("0.00"),
        nullable=False,
        doc="Net revenue after refunds",
    )

    refund_amount = Column(
        Numeric(15, 2),
        default=Decimal("0.00"),
        nullable=False,
        doc="Total refund amount",
    )

    # Transaction counts
    transaction_count = Column(
        Integer,
        default=0,
        nullable=False,
        doc="Total number of transactions",
    )

    successful_count = Column(
        Integer,
        default=0,
        nullable=False,
        doc="Number of successful transactions",
    )

    failed_count = Column(
        Integer,
        default=0,
        nullable=False,
        doc="Number of failed transactions",
    )

    refund_count = Column(
        Integer,
        default=0,
        nullable=False,
        doc="Number of refunds processed",
    )

    # Calculated metrics
    average_transaction_value = Column(
        Numeric(10, 2),
        default=Decimal("0.00"),
        nullable=False,
        doc="Average transaction amount",
    )

    # Breakdown by gateway/method
    gateway_breakdown = Column(
        JSONB,
        default=dict,
        nullable=False,
        doc="Revenue breakdown by gateway (mpesa, paypal, stripe)",
    )

    payment_method_breakdown = Column(
        JSONB,
        default=dict,
        nullable=False,
        doc="Revenue breakdown by payment method",
    )

    # Revenue by type
    course_revenue = Column(
        Numeric(15, 2),
        default=Decimal("0.00"),
        nullable=False,
        doc="Revenue from course purchases",
    )

    subscription_revenue = Column(
        Numeric(15, 2),
        default=Decimal("0.00"),
        nullable=False,
        doc="Revenue from subscriptions",
    )

    # Additional metadata
    meta = Column(
        JSONB,
        default=dict,
        nullable=False,
        doc="Additional metrics (top courses, users, etc.)",
    )

    # Timestamps
    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        doc="Record creation timestamp",
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
        doc="Last update timestamp",
    )

    # Constraints and indexes
    __table_args__ = (
        Index(
            "idx_revenue_metrics_date_period",
            "metric_date",
            "period_type",
        ),
        Index(
            "idx_revenue_metrics_date_currency",
            "metric_date",
            "currency",
        ),
        UniqueConstraint(
            "metric_date",
            "period_type",
            "currency",
            name="uq_revenue_metrics_date_period_currency",
        ),
        CheckConstraint(
            "total_revenue >= 0",
            name="check_total_revenue_non_negative"
        ),
        CheckConstraint(
            "net_revenue >= 0",
            name="check_net_revenue_non_negative"
        ),
        CheckConstraint(
            "refund_amount >= 0",
            name="check_refund_amount_non_negative"
        ),
    )

    def __repr__(self) -> str:
        """String representation for debugging."""
        return (
            f"<RevenueMetrics(date={self.metric_date}, "
            f"period={self.period_type}, "
            f"total={self.total_revenue} {self.currency}, "
            f"net={self.net_revenue})>"
        )

    # Helper properties
    @property
    def refund_rate(self) -> Decimal:
        """
        Calculate refund rate as percentage of total revenue.

        Returns:
            Decimal: Refund rate percentage
        """
        if self.total_revenue <= 0:
            return Decimal("0")
        return (self.refund_amount / self.total_revenue) * Decimal("100")

    @property
    def success_rate(self) -> Decimal:
        """
        Calculate transaction success rate.

        Returns:
            Decimal: Success rate percentage
        """
        if self.transaction_count <= 0:
            return Decimal("0")
        return (Decimal(self.successful_count) / Decimal(self.transaction_count)) * Decimal("100")

    @property
    def is_daily(self) -> bool:
        """Check if this is a daily metric."""
        return self.period_type == "daily"

    @property
    def is_monthly(self) -> bool:
        """Check if this is a monthly metric."""
        return self.period_type == "monthly"

    # Calculation methods
    def calculate_average_transaction(self) -> Decimal:
        """
        Calculate average transaction value.

        Returns:
            Decimal: Average transaction value
        """
        if self.successful_count <= 0:
            return Decimal("0.00")
        return self.total_revenue / Decimal(self.successful_count)

    def add_transaction(
        self,
        amount: Decimal,
        gateway: str,
        is_course: bool = True
    ) -> None:
        """
        Add a successful transaction to metrics.

        Args:
            amount: Transaction amount
            gateway: Payment gateway
            is_course: Whether this is course revenue
        """
        self.total_revenue += amount
        self.net_revenue += amount
        self.transaction_count += 1
        self.successful_count += 1

        # Update gateway breakdown
        if self.gateway_breakdown is None:
            self.gateway_breakdown = {}
        current = Decimal(str(self.gateway_breakdown.get(gateway, "0")))
        self.gateway_breakdown[gateway] = str(current + amount)

        # Update revenue type
        if is_course:
            self.course_revenue += amount
        else:
            self.subscription_revenue += amount

        # Recalculate average
        self.average_transaction_value = self.calculate_average_transaction()
        self.updated_at = datetime.utcnow()

    def add_refund(self, amount: Decimal) -> None:
        """
        Add a refund to metrics.

        Args:
            amount: Refund amount
        """
        self.refund_amount += amount
        self.net_revenue -= amount
        self.refund_count += 1
        self.updated_at = datetime.utcnow()

    def add_failed_transaction(self) -> None:
        """Record a failed transaction."""
        self.transaction_count += 1
        self.failed_count += 1
        self.updated_at = datetime.utcnow()


class PaymentAnalytics(AsyncAttrs, Base):
    """
    Payment method and subscription analytics.

    Tracks payment method usage, subscription metrics, and trends.

    Metrics Tracked:
        - Active subscriptions
        - New subscriptions
        - Cancelled subscriptions
        - Monthly Recurring Revenue (MRR)
        - Churn rate
        - Payment method preferences
        - Gateway performance

    Attributes:
        id: Unique analytics identifier (UUID)
        metric_date: Date for this metric
        period_type: Period type (daily, monthly)
        active_subscriptions: Count of active subscriptions
        new_subscriptions: New subscriptions in period
        cancelled_subscriptions: Cancelled subscriptions in period
        churned_subscriptions: Expired/failed subscriptions
        mrr: Monthly Recurring Revenue
        arr: Annual Recurring Revenue (for annual plans)
        churn_rate: Subscription churn rate percentage
        payment_method_stats: JSONB with payment method statistics
        gateway_performance: JSONB with gateway success rates
        failed_payment_stats: JSONB with failed payment analysis
        metadata: Additional analytics data
        created_at: Record creation timestamp
        updated_at: Last update timestamp
    """

    __tablename__ = "payment_analytics"

    # Primary key
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
        doc="Unique analytics identifier",
    )

    # Time period
    metric_date = Column(
        Date,
        nullable=False,
        index=True,
        doc="Date for this metric",
    )

    period_type = Column(
        String(20),
        default="daily",
        nullable=False,
        index=True,
        doc="Period type (daily, monthly)",
    )

    # Subscription metrics
    active_subscriptions = Column(
        Integer,
        default=0,
        nullable=False,
        doc="Count of active subscriptions",
    )

    new_subscriptions = Column(
        Integer,
        default=0,
        nullable=False,
        doc="New subscriptions in period",
    )

    cancelled_subscriptions = Column(
        Integer,
        default=0,
        nullable=False,
        doc="Cancelled subscriptions in period",
    )

    churned_subscriptions = Column(
        Integer,
        default=0,
        nullable=False,
        doc="Expired/failed subscriptions",
    )

    # Revenue metrics
    mrr = Column(
        Numeric(15, 2),
        default=Decimal("0.00"),
        nullable=False,
        doc="Monthly Recurring Revenue",
    )

    arr = Column(
        Numeric(15, 2),
        default=Decimal("0.00"),
        nullable=False,
        doc="Annual Recurring Revenue",
    )

    churn_rate = Column(
        Numeric(5, 2),
        default=Decimal("0.00"),
        nullable=False,
        doc="Churn rate percentage",
    )

    # Payment statistics
    payment_method_stats = Column(
        JSONB,
        default=dict,
        nullable=False,
        doc="Payment method usage statistics",
    )

    gateway_performance = Column(
        JSONB,
        default=dict,
        nullable=False,
        doc="Gateway success/failure rates",
    )

    failed_payment_stats = Column(
        JSONB,
        default=dict,
        nullable=False,
        doc="Failed payment analysis",
    )

    # Additional metadata
    meta = Column(
        JSONB,
        default=dict,
        nullable=False,
        doc="Additional analytics data",
    )

    # Timestamps
    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        doc="Record creation timestamp",
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
        doc="Last update timestamp",
    )

    # Constraints and indexes
    __table_args__ = (
        Index(
            "idx_payment_analytics_date_period",
            "metric_date",
            "period_type",
        ),
        UniqueConstraint(
            "metric_date",
            "period_type",
            name="uq_payment_analytics_date_period",
        ),
        CheckConstraint(
            "mrr >= 0",
            name="check_mrr_non_negative"
        ),
        CheckConstraint(
            "arr >= 0",
            name="check_arr_non_negative"
        ),
        CheckConstraint(
            "churn_rate >= 0 AND churn_rate <= 100",
            name="check_churn_rate_percentage"
        ),
    )

    def __repr__(self) -> str:
        """String representation for debugging."""
        return (
            f"<PaymentAnalytics(date={self.metric_date}, "
            f"active_subs={self.active_subscriptions}, "
            f"mrr={self.mrr}, churn={self.churn_rate}%)>"
        )

    # Helper properties
    @property
    def net_new_subscriptions(self) -> int:
        """Calculate net new subscriptions (new - cancelled - churned)."""
        return (
            self.new_subscriptions
            - self.cancelled_subscriptions
            - self.churned_subscriptions
        )

    @property
    def subscription_growth_rate(self) -> Decimal:
        """
        Calculate subscription growth rate.

        Returns:
            Decimal: Growth rate percentage
        """
        if self.active_subscriptions <= 0:
            return Decimal("0")

        previous_active = self.active_subscriptions - self.net_new_subscriptions
        if previous_active <= 0:
            return Decimal("100")  # Starting from zero

        growth = (
            Decimal(self.net_new_subscriptions) / Decimal(previous_active)
        ) * Decimal("100")
        return growth

    # Calculation methods
    def calculate_churn_rate(self) -> Decimal:
        """
        Calculate churn rate.

        Returns:
            Decimal: Churn rate percentage
        """
        if self.active_subscriptions <= 0:
            return Decimal("0")

        churned_total = self.cancelled_subscriptions + self.churned_subscriptions
        return (Decimal(churned_total) / Decimal(self.active_subscriptions)) * Decimal("100")

    def update_subscription_metrics(
        self,
        active: int,
        new: int,
        cancelled: int,
        churned: int
    ) -> None:
        """
        Update subscription counts.

        Args:
            active: Active subscription count
            new: New subscriptions
            cancelled: Cancelled subscriptions
            churned: Churned subscriptions
        """
        self.active_subscriptions = active
        self.new_subscriptions = new
        self.cancelled_subscriptions = cancelled
        self.churned_subscriptions = churned
        self.churn_rate = self.calculate_churn_rate()
        self.updated_at = datetime.utcnow()

    def update_revenue_metrics(self, mrr: Decimal, arr: Decimal) -> None:
        """
        Update revenue metrics.

        Args:
            mrr: Monthly Recurring Revenue
            arr: Annual Recurring Revenue
        """
        self.mrr = mrr
        self.arr = arr
        self.updated_at = datetime.utcnow()
