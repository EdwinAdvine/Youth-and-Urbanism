"""
Refund Pydantic Schemas for Urban Home School

Request and response schemas for refund management system with admin approval workflow.
"""

from datetime import datetime
from decimal import Decimal
from typing import Optional, List, Dict, Any
from uuid import UUID
from enum import Enum

from pydantic import BaseModel, Field, field_validator, ConfigDict


# Enums

class RefundStatusEnum(str, Enum):
    """Refund request status"""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class RefundTypeEnum(str, Enum):
    """Type of refund"""
    FULL = "full"
    PARTIAL = "partial"
    PRORATED = "prorated"


class RefundReasonEnum(str, Enum):
    """Common refund reasons"""
    ACCIDENTAL_PURCHASE = "accidental_purchase"
    COURSE_NOT_AS_DESCRIBED = "course_not_as_described"
    TECHNICAL_ISSUES = "technical_issues"
    POOR_QUALITY = "poor_quality"
    DUPLICATE_PAYMENT = "duplicate_payment"
    DID_NOT_USE = "did_not_use"
    FINANCIAL_HARDSHIP = "financial_hardship"
    OTHER = "other"


# ========== REFUND REQUEST SCHEMAS ==========

class RefundRequestCreate(BaseModel):
    """Schema for creating a refund request"""
    transaction_id: UUID = Field(..., description="Payment transaction ID to refund")
    refund_reason: RefundReasonEnum = Field(..., description="Reason category")
    user_reason: str = Field(
        ...,
        min_length=10,
        max_length=1000,
        description="Detailed reason from user"
    )
    refund_amount: Optional[Decimal] = Field(
        None,
        gt=0,
        decimal_places=2,
        description="Partial refund amount (optional, defaults to eligible amount)"
    )

    @field_validator('user_reason')
    @classmethod
    def validate_user_reason(cls, v: str) -> str:
        """Ensure reason is meaningful"""
        if len(v.strip()) < 10:
            raise ValueError("Please provide a detailed reason (minimum 10 characters)")
        return v.strip()


class RefundEligibilityCheck(BaseModel):
    """Schema for checking refund eligibility"""
    transaction_id: UUID = Field(..., description="Transaction to check")


class RefundEligibilityResponse(BaseModel):
    """Schema for refund eligibility check response"""
    eligible: bool = Field(..., description="Whether refund is eligible")
    refund_type: Optional[RefundTypeEnum] = Field(None, description="Type of eligible refund")
    eligible_amount: Decimal = Field(..., description="Maximum eligible refund amount")
    original_amount: Decimal = Field(..., description="Original payment amount")
    days_since_payment: int = Field(..., description="Days since payment")
    completion_percentage: float = Field(..., description="Course completion percentage")
    full_refund_eligible: bool = Field(..., description="Eligible for 100% refund")
    partial_refund_eligible: bool = Field(..., description="Eligible for 50% refund")
    policy_details: Dict[str, Any] = Field(..., description="Policy criteria details")
    reasons: List[str] = Field(..., description="Reasons for eligibility status")


# ========== ADMIN REFUND ACTIONS ==========

class RefundApprove(BaseModel):
    """Schema for approving a refund request"""
    admin_notes: Optional[str] = Field(
        None,
        max_length=1000,
        description="Internal notes from admin"
    )


class RefundReject(BaseModel):
    """Schema for rejecting a refund request"""
    rejection_reason: str = Field(
        ...,
        min_length=10,
        max_length=1000,
        description="Reason for rejection"
    )
    admin_notes: Optional[str] = Field(
        None,
        max_length=1000,
        description="Additional internal notes"
    )

    @field_validator('rejection_reason')
    @classmethod
    def validate_rejection_reason(cls, v: str) -> str:
        """Ensure rejection reason is meaningful"""
        if len(v.strip()) < 10:
            raise ValueError("Please provide a detailed rejection reason")
        return v.strip()


class RefundProcess(BaseModel):
    """Schema for processing an approved refund"""
    refund_id: UUID = Field(..., description="Refund ID to process")
    force_process: bool = Field(
        default=False,
        description="Force processing even if eligibility expired"
    )


# ========== REFUND RESPONSE SCHEMAS ==========

class RefundResponse(BaseModel):
    """Schema for refund response"""
    id: UUID
    transaction_id: UUID
    enrollment_id: Optional[UUID] = None
    subscription_id: Optional[UUID] = None
    user_id: UUID
    refund_type: str
    refund_reason: str
    refund_amount: Decimal
    original_amount: Decimal
    currency: str
    status: str
    gateway: str
    gateway_refund_id: Optional[str] = None

    # Detailed information
    user_reason: str
    admin_notes: Optional[str] = None
    rejection_reason: Optional[str] = None

    # User info
    requested_by_id: Optional[UUID] = None
    approved_by_id: Optional[UUID] = None
    processed_by_id: Optional[UUID] = None

    # Eligibility
    eligibility_check: Dict[str, Any]

    # Computed fields
    is_pending: bool
    is_approved: bool
    is_rejected: bool
    is_completed: bool
    refund_percentage: Decimal

    # Timestamps
    requested_at: datetime
    reviewed_at: Optional[datetime] = None
    processed_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    metadata: Dict[str, Any]

    model_config = ConfigDict(from_attributes=True)


class RefundListResponse(BaseModel):
    """Schema for paginated refund list"""
    refunds: List[RefundResponse]
    total: int = Field(..., ge=0)
    page: int = Field(..., ge=1)
    page_size: int = Field(..., ge=1, le=100)
    total_pages: int = Field(..., ge=0)


class RefundSummary(BaseModel):
    """Schema for refund summary statistics"""
    total_refunds: int
    pending_refunds: int
    approved_refunds: int
    rejected_refunds: int
    completed_refunds: int
    total_refund_amount: Decimal
    refund_rate: Decimal = Field(..., description="Refund rate percentage")
    average_refund_amount: Decimal
    refunds_by_reason: Dict[str, int] = Field(..., description="Breakdown by reason")
    recent_refunds: List[RefundResponse] = Field(..., max_items=5)


# ========== REFUND ANALYTICS ==========

class RefundAnalytics(BaseModel):
    """Schema for refund analytics"""
    period_start: datetime
    period_end: datetime
    total_refunds: int
    total_refund_amount: Decimal
    refund_rate: Decimal = Field(..., description="Percentage of revenue refunded")
    refunds_by_reason: Dict[str, int]
    refunds_by_gateway: Dict[str, int]
    refunds_by_type: Dict[str, int]
    average_days_to_refund: float = Field(..., description="Avg days from request to completion")
    approval_rate: Decimal = Field(..., description="Percentage of refunds approved")
    top_refund_courses: List[Dict[str, Any]] = Field(..., description="Courses with most refunds")


class RefundBatchApprove(BaseModel):
    """Schema for batch approving refunds"""
    refund_ids: List[UUID] = Field(..., min_items=1, max_items=100)
    admin_notes: Optional[str] = Field(None, max_length=1000)


class RefundBatchReject(BaseModel):
    """Schema for batch rejecting refunds"""
    refund_ids: List[UUID] = Field(..., min_items=1, max_items=100)
    rejection_reason: str = Field(..., min_length=10, max_length=1000)
    admin_notes: Optional[str] = Field(None, max_length=1000)


# ========== REFUND FILTERS ==========

class RefundFilters(BaseModel):
    """Schema for filtering refunds"""
    status: Optional[List[RefundStatusEnum]] = Field(None, description="Filter by status")
    refund_reason: Optional[List[RefundReasonEnum]] = Field(None, description="Filter by reason")
    gateway: Optional[List[str]] = Field(None, description="Filter by gateway")
    min_amount: Optional[Decimal] = Field(None, ge=0, description="Minimum refund amount")
    max_amount: Optional[Decimal] = Field(None, ge=0, description="Maximum refund amount")
    date_from: Optional[datetime] = Field(None, description="Refunds requested after")
    date_to: Optional[datetime] = Field(None, description="Refunds requested before")
    user_id: Optional[UUID] = Field(None, description="Filter by user")
    course_id: Optional[UUID] = Field(None, description="Filter by course")


# ========== REFUND POLICY ==========

class RefundPolicyResponse(BaseModel):
    """Schema for refund policy information"""
    full_refund_window_days: int = Field(default=7, description="Days for 100% refund")
    partial_refund_window_days: int = Field(default=14, description="Days for 50% refund")
    full_refund_max_completion: float = Field(default=10.0, description="Max completion % for full refund")
    partial_refund_max_completion: float = Field(default=30.0, description="Max completion % for partial refund")
    partial_refund_percentage: int = Field(default=50, description="Partial refund percentage")
    processing_time_days: str = Field(default="3-5 business days", description="Refund processing time")
    supported_gateways: List[str] = Field(default=["mpesa", "paypal", "stripe"])
    policy_last_updated: datetime
