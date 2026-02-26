"""
Instructor Earnings Schemas

Pydantic v2 schemas for earnings, payouts, revenue splits, and financial management.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal


# Payout Details Schema
class PayoutDetailsSchema(BaseModel):
    phone: Optional[str] = None  # M-Pesa
    bank_account: Optional[str] = None
    bank_name: Optional[str] = None
    swift_code: Optional[str] = None
    paypal_email: Optional[str] = None


# Earnings Schemas
class InstructorEarningResponse(BaseModel):
    id: str
    instructor_id: str
    course_id: Optional[str] = None
    session_id: Optional[str] = None
    earning_type: str  # course_sale, session_fee, bonus, referral
    gross_amount: Decimal
    platform_fee_pct: Decimal
    partner_fee_pct: Decimal
    net_amount: Decimal
    currency: str
    status: str  # pending, confirmed, paid, reversed
    period_start: Optional[datetime] = None
    period_end: Optional[datetime] = None
    extra_data: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Payout Schemas
class PayoutRequest(BaseModel):
    amount: Decimal = Field(..., gt=0, description="Amount to withdraw")
    payout_method: str = Field(..., description="mpesa_b2c, bank_transfer, paypal")
    payout_details: PayoutDetailsSchema


class InstructorPayoutResponse(BaseModel):
    id: str
    instructor_id: str
    amount: Decimal
    currency: str
    payout_method: str
    payout_details: PayoutDetailsSchema
    status: str  # requested, processing, completed, failed, reversed
    transaction_reference: Optional[str] = None
    processed_at: Optional[datetime] = None
    failure_reason: Optional[str] = None
    extra_data: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Revenue Split Schemas
class RevenueSplitCreate(BaseModel):
    course_id: Optional[str] = None
    instructor_pct: Decimal = Field(default=Decimal("70.00"), ge=0, le=100)
    platform_pct: Decimal = Field(default=Decimal("20.00"), ge=0, le=100)
    partner_pct: Decimal = Field(default=Decimal("10.00"), ge=0, le=100)
    effective_from: Optional[datetime] = None
    effective_until: Optional[datetime] = None
    notes: Optional[str] = None


class RevenueSplitUpdate(BaseModel):
    instructor_pct: Optional[Decimal] = Field(None, ge=0, le=100)
    platform_pct: Optional[Decimal] = Field(None, ge=0, le=100)
    partner_pct: Optional[Decimal] = Field(None, ge=0, le=100)
    effective_until: Optional[datetime] = None
    notes: Optional[str] = None


class InstructorRevenueSplitResponse(BaseModel):
    id: str
    instructor_id: str
    course_id: Optional[str] = None
    instructor_pct: Decimal
    platform_pct: Decimal
    partner_pct: Decimal
    set_by: Optional[str] = None
    effective_from: Optional[datetime] = None
    effective_until: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# Earnings Breakdown Schema
class CourseEarningsItem(BaseModel):
    course_id: str
    course_title: str
    amount: Decimal
    count: int


class SessionEarningsItem(BaseModel):
    session_id: str
    session_title: str
    amount: Decimal


class EarningsByType(BaseModel):
    course_sales: Decimal = Decimal("0.00")
    session_fees: Decimal = Decimal("0.00")
    bonuses: Decimal = Decimal("0.00")
    referrals: Decimal = Decimal("0.00")


class EarningsBreakdownResponse(BaseModel):
    total_gross: Decimal
    total_net: Decimal
    by_type: EarningsByType
    by_course: List[CourseEarningsItem]
    by_session: List[SessionEarningsItem]


# Earnings Projection Schema
class EarningsProjectionRequest(BaseModel):
    months_ahead: int = Field(default=3, ge=1, le=12)


class MonthlyProjection(BaseModel):
    month: str  # YYYY-MM format
    projected_gross: Decimal
    projected_net: Decimal
    confidence: str  # low, medium, high


class EarningsProjectionResponse(BaseModel):
    projections: List[MonthlyProjection]
    ai_model_used: str
    generated_at: datetime


# AI Rate Optimizer Schema
class RateOptimizationRequest(BaseModel):
    course_id: Optional[str] = None
    current_price: Decimal


class RateOptimizationResponse(BaseModel):
    recommended_price: Decimal
    expected_revenue_change_pct: Decimal
    rationale: str
    ai_model_used: str


# Earnings Query Schemas
class EarningsQueryParams(BaseModel):
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    earning_type: Optional[str] = None
    status: Optional[str] = None
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=20, ge=1, le=100)


class PayoutQueryParams(BaseModel):
    status: Optional[str] = None
    payout_method: Optional[str] = None
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=20, ge=1, le=100)
