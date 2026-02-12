"""
Subscription Pydantic Schemas for Urban Home School

Request and response schemas for subscription management system.
"""

from datetime import datetime, date
from decimal import Decimal
from typing import Optional, List, Dict, Any
from uuid import UUID
from enum import Enum

from pydantic import BaseModel, Field, field_validator, ConfigDict


# Enums

class BillingCycleEnum(str, Enum):
    """Subscription billing cycle options"""
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    SEMI_ANNUAL = "semi_annual"
    ANNUAL = "annual"


class SubscriptionStatusEnum(str, Enum):
    """Subscription status options"""
    ACTIVE = "active"
    TRIALING = "trialing"
    PAUSED = "paused"
    PAST_DUE = "past_due"
    CANCELLED = "cancelled"
    EXPIRED = "expired"
    SUSPENDED = "suspended"


class PlanTypeEnum(str, Enum):
    """Subscription plan types"""
    COURSE_ACCESS = "course_access"
    PLATFORM_ACCESS = "platform_access"
    PREMIUM_FEATURES = "premium_features"
    BUNDLE = "bundle"


# ========== SUBSCRIPTION PLAN SCHEMAS ==========

class SubscriptionPlanCreate(BaseModel):
    """Schema for creating a subscription plan"""
    name: str = Field(..., min_length=1, max_length=100, description="Plan display name")
    description: Optional[str] = Field(None, description="Detailed plan description")
    plan_type: PlanTypeEnum = Field(..., description="Type of subscription plan")
    billing_cycle: BillingCycleEnum = Field(..., description="Billing frequency")
    price: Decimal = Field(..., gt=0, decimal_places=2, description="Subscription price")
    currency: str = Field(default="KES", max_length=3, description="ISO 4217 currency code")
    trial_days: int = Field(default=0, ge=0, le=365, description="Trial period days")
    features: List[str] = Field(default_factory=list, description="Included features")
    course_ids: List[UUID] = Field(default_factory=list, description="Included course IDs")
    max_enrollments: int = Field(default=-1, ge=-1, description="Max enrollments (-1 = unlimited)")
    is_active: bool = Field(default=True, description="Plan availability")
    is_popular: bool = Field(default=False, description="Mark as popular")
    display_order: int = Field(default=0, ge=0, description="Display sort order")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")

    @field_validator('currency')
    @classmethod
    def validate_currency_uppercase(cls, v: str) -> str:
        """Ensure currency code is uppercase"""
        return v.upper()


class SubscriptionPlanUpdate(BaseModel):
    """Schema for updating a subscription plan"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    price: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    trial_days: Optional[int] = Field(None, ge=0, le=365)
    features: Optional[List[str]] = None
    course_ids: Optional[List[UUID]] = None
    max_enrollments: Optional[int] = Field(None, ge=-1)
    is_active: Optional[bool] = None
    is_popular: Optional[bool] = None
    display_order: Optional[int] = Field(None, ge=0)
    metadata: Optional[Dict[str, Any]] = None


class SubscriptionPlanResponse(BaseModel):
    """Schema for subscription plan response"""
    id: UUID
    name: str
    description: Optional[str] = None
    plan_type: str
    billing_cycle: str
    price: Decimal
    currency: str
    trial_days: int
    features: List[str]
    course_ids: List[UUID]
    max_enrollments: int
    is_active: bool
    is_popular: bool
    display_order: int
    monthly_equivalent_price: Decimal = Field(..., description="Price normalized to monthly")
    metadata: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SubscriptionPlanListResponse(BaseModel):
    """Schema for paginated subscription plan list"""
    plans: List[SubscriptionPlanResponse]
    total: int = Field(..., ge=0)
    page: int = Field(..., ge=1)
    page_size: int = Field(..., ge=1, le=100)
    total_pages: int = Field(..., ge=0)


# ========== SUBSCRIPTION SCHEMAS ==========

class SubscriptionCreate(BaseModel):
    """Schema for creating a subscription"""
    plan_id: UUID = Field(..., description="Subscription plan ID")
    enrollment_id: Optional[UUID] = Field(None, description="Related enrollment ID")
    payment_method_id: Optional[UUID] = Field(None, description="Saved payment method ID")
    start_trial: bool = Field(default=True, description="Start with trial if available")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional data")


class SubscriptionCancel(BaseModel):
    """Schema for cancelling a subscription"""
    immediately: bool = Field(
        default=False,
        description="Cancel immediately or at period end"
    )
    reason: Optional[str] = Field(
        None,
        min_length=10,
        max_length=500,
        description="Cancellation reason"
    )


class SubscriptionPause(BaseModel):
    """Schema for pausing a subscription"""
    reason: Optional[str] = Field(
        None,
        max_length=500,
        description="Reason for pausing"
    )


class SubscriptionUpdatePaymentMethod(BaseModel):
    """Schema for updating subscription payment method"""
    payment_method_id: UUID = Field(..., description="New payment method ID")


class SubscriptionResponse(BaseModel):
    """Schema for subscription response"""
    id: UUID
    user_id: UUID
    plan_id: UUID
    enrollment_id: Optional[UUID] = None
    payment_method_id: Optional[UUID] = None
    status: str
    current_period_start: datetime
    current_period_end: datetime
    trial_start: Optional[datetime] = None
    trial_end: Optional[datetime] = None
    cancel_at_period_end: bool
    cancelled_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    next_billing_date: Optional[datetime] = None
    last_payment_date: Optional[datetime] = None
    last_payment_amount: Optional[Decimal] = None
    failed_payment_count: int
    renewal_count: int

    # Computed fields
    is_active: bool
    is_trialing: bool
    in_trial_period: bool
    days_until_renewal: int

    # Relationships (optional, can be included via joins)
    plan: Optional[SubscriptionPlanResponse] = None

    metadata: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SubscriptionListResponse(BaseModel):
    """Schema for paginated subscription list"""
    subscriptions: List[SubscriptionResponse]
    total: int = Field(..., ge=0)
    page: int = Field(..., ge=1)
    page_size: int = Field(..., ge=1, le=100)
    total_pages: int = Field(..., ge=0)


class SubscriptionSummary(BaseModel):
    """Schema for user subscription summary"""
    active_subscriptions: int
    trialing_subscriptions: int
    past_due_subscriptions: int
    total_subscriptions: int
    monthly_cost: Decimal = Field(..., description="Total monthly subscription cost")
    next_billing_date: Optional[datetime] = None
    subscriptions: List[SubscriptionResponse]


# ========== SUBSCRIPTION ANALYTICS ==========

class SubscriptionMetrics(BaseModel):
    """Schema for subscription metrics"""
    total_active: int
    total_trialing: int
    total_past_due: int
    total_cancelled_this_month: int
    monthly_recurring_revenue: Decimal
    annual_recurring_revenue: Decimal
    churn_rate: Decimal = Field(..., description="Monthly churn rate percentage")
    average_subscription_value: Decimal
    most_popular_plan: Optional[SubscriptionPlanResponse] = None


class SubscriptionRenewalPreview(BaseModel):
    """Schema for upcoming renewal preview"""
    subscription_id: UUID
    plan_name: str
    next_billing_date: datetime
    amount: Decimal
    currency: str
    payment_method: Optional[str] = Field(None, description="Masked payment method")
    can_renew: bool = Field(..., description="Whether renewal is possible")
    issues: List[str] = Field(default_factory=list, description="Renewal issues if any")
