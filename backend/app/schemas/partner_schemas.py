"""
Partner Dashboard Pydantic Schemas for Urban Home School

This module defines comprehensive Pydantic v2 schemas for the partner dashboard
feature, covering sponsorship programs, sponsored children, consent management,
billing/subscriptions, payments, impact reporting, messaging, meetings, resources,
and support tickets.

Partner Flow:
1. Partner creates profile with organisation details and branding
2. Partner creates sponsorship programs (direct or cohort-based, min 10 children)
3. Children are added to programs; parental consent is collected
4. Billing runs on monthly/termly/annual cycles via PartnerSubscription
5. AI-generated impact reports track child progress against CBC competencies
6. Partners communicate with staff and view child learning journeys
"""

from datetime import datetime, date
from decimal import Decimal
from typing import Optional, List, Dict, Any
from uuid import UUID
from enum import Enum

from pydantic import BaseModel, Field, field_validator, ConfigDict


# =============================================================================
# Enums
# =============================================================================

class PartnershipTier(str, Enum):
    """Partnership tier levels determining features and pricing."""
    BRONZE = "bronze"
    SILVER = "silver"
    GOLD = "gold"
    PLATINUM = "platinum"


class OrganisationType(str, Enum):
    """Types of partner organisations."""
    CORPORATE = "corporate"
    NGO = "ngo"
    FOUNDATION = "foundation"
    GOVERNMENT = "government"
    INDIVIDUAL = "individual"
    FAITH_BASED = "faith_based"
    COMMUNITY = "community"


class ProgramType(str, Enum):
    """Sponsorship program types."""
    DIRECT = "direct"
    COHORT = "cohort"


class ProgramStatus(str, Enum):
    """Sponsorship program lifecycle statuses."""
    DRAFT = "draft"
    PENDING_APPROVAL = "pending_approval"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class BillingPeriod(str, Enum):
    """Billing cycle options for sponsorship programs."""
    MONTHLY = "monthly"
    TERMLY = "termly"
    ANNUAL = "annual"


class SponsoredChildStatus(str, Enum):
    """Status of a child within a sponsorship program."""
    PENDING_CONSENT = "pending_consent"
    ACTIVE = "active"
    PAUSED = "paused"
    GRADUATED = "graduated"
    REMOVED = "removed"


class PartnerPaymentStatus(str, Enum):
    """Payment transaction statuses for partner billing."""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"
    CANCELLED = "cancelled"


class PartnerPaymentGateway(str, Enum):
    """Supported payment gateways for partner transactions."""
    MPESA = "mpesa"
    BANK_TRANSFER = "bank_transfer"
    PAYPAL = "paypal"
    STRIPE = "stripe"
    INVOICE = "invoice"


class SubscriptionStatus(str, Enum):
    """Partner subscription statuses."""
    ACTIVE = "active"
    PAST_DUE = "past_due"
    PAUSED = "paused"
    CANCELLED = "cancelled"
    EXPIRED = "expired"


class ReportType(str, Enum):
    """Impact report types."""
    MONTHLY = "monthly"
    TERMLY = "termly"
    ANNUAL = "annual"
    CUSTOM = "custom"
    AD_HOC = "ad_hoc"


class ExportFormat(str, Enum):
    """Supported export formats for reports."""
    PDF = "pdf"
    CSV = "csv"
    XLSX = "xlsx"
    JSON = "json"


class ResourceType(str, Enum):
    """Types of partner-shared resources."""
    DOCUMENT = "document"
    VIDEO = "video"
    IMAGE = "image"
    TEMPLATE = "template"
    PRESENTATION = "presentation"
    BROCHURE = "brochure"


class ResourceStatus(str, Enum):
    """Content resource lifecycle statuses."""
    DRAFT = "draft"
    PENDING_REVIEW = "pending_review"
    APPROVED = "approved"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class TicketCategory(str, Enum):
    """Support ticket categories."""
    BILLING = "billing"
    TECHNICAL = "technical"
    PROGRAM = "program"
    CHILD_CONCERN = "child_concern"
    REPORTING = "reporting"
    ACCOUNT = "account"
    OTHER = "other"


class TicketPriority(str, Enum):
    """Support ticket priority levels."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class TicketStatus(str, Enum):
    """Support ticket lifecycle statuses."""
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    WAITING_ON_PARTNER = "waiting_on_partner"
    WAITING_ON_STAFF = "waiting_on_staff"
    RESOLVED = "resolved"
    CLOSED = "closed"


class MeetingStatus(str, Enum):
    """Meeting lifecycle statuses."""
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"


# =============================================================================
# Partner Profile Schemas
# =============================================================================

class PartnerProfileBase(BaseModel):
    """
    Base schema for partner organisation profile.

    Contains the common fields shared between create, update, and response schemas.
    """
    org_name: str = Field(
        ..., min_length=2, max_length=200,
        description="Official organisation name"
    )
    org_type: OrganisationType = Field(
        ..., description="Type of partner organisation"
    )
    display_name: Optional[str] = Field(
        None, max_length=100,
        description="Public-facing display name"
    )
    bio: Optional[str] = Field(
        None, max_length=2000,
        description="Organisation biography or mission statement"
    )
    tagline: Optional[str] = Field(
        None, max_length=200,
        description="Short tagline for the organisation"
    )


class PartnerProfileCreate(PartnerProfileBase):
    """
    Schema for creating a new partner profile.

    Includes all required and optional fields for initial partner onboarding.
    """
    logo_url: Optional[str] = Field(
        None, max_length=500,
        description="URL to organisation logo image"
    )
    banner_url: Optional[str] = Field(
        None, max_length=500,
        description="URL to profile banner image"
    )
    contact_email: str = Field(
        ..., max_length=254,
        description="Primary contact email address"
    )
    contact_phone: Optional[str] = Field(
        None, max_length=20,
        description="Primary contact phone number"
    )
    website_url: Optional[str] = Field(
        None, max_length=500,
        description="Organisation website URL"
    )
    registration_number: Optional[str] = Field(
        None, max_length=100,
        description="Business/NGO registration number"
    )
    tax_id: Optional[str] = Field(
        None, max_length=50,
        description="Tax identification number (KRA PIN for Kenya)"
    )
    specializations: List[str] = Field(
        default_factory=list,
        description="Areas of expertise or focus (e.g. STEM, arts, special needs)"
    )
    partnership_tier: PartnershipTier = Field(
        default=PartnershipTier.BRONZE,
        description="Partnership tier level"
    )
    branding_config: Dict[str, Any] = Field(
        default_factory=dict,
        description="Custom branding settings (primary_color, secondary_color, font, etc.)"
    )

    @field_validator('contact_email')
    @classmethod
    def validate_contact_email(cls, v: str) -> str:
        """Validate that the contact email has a basic valid format."""
        if '@' not in v or '.' not in v.split('@')[-1]:
            raise ValueError('Invalid email format for contact_email')
        return v.lower().strip()


class PartnerProfileUpdate(BaseModel):
    """
    Schema for updating an existing partner profile.

    All fields are optional to support partial updates.
    """
    org_name: Optional[str] = Field(None, min_length=2, max_length=200)
    org_type: Optional[OrganisationType] = None
    display_name: Optional[str] = Field(None, max_length=100)
    bio: Optional[str] = Field(None, max_length=2000)
    tagline: Optional[str] = Field(None, max_length=200)
    logo_url: Optional[str] = Field(None, max_length=500)
    banner_url: Optional[str] = Field(None, max_length=500)
    contact_email: Optional[str] = Field(None, max_length=254)
    contact_phone: Optional[str] = Field(None, max_length=20)
    website_url: Optional[str] = Field(None, max_length=500)
    registration_number: Optional[str] = Field(None, max_length=100)
    tax_id: Optional[str] = Field(None, max_length=50)
    specializations: Optional[List[str]] = None
    partnership_tier: Optional[PartnershipTier] = None
    branding_config: Optional[Dict[str, Any]] = None

    @field_validator('contact_email')
    @classmethod
    def validate_contact_email(cls, v: Optional[str]) -> Optional[str]:
        """Validate contact email format when provided."""
        if v is not None:
            if '@' not in v or '.' not in v.split('@')[-1]:
                raise ValueError('Invalid email format for contact_email')
            return v.lower().strip()
        return v


class PartnerProfileResponse(PartnerProfileBase):
    """
    Schema for returning partner profile data in API responses.

    Includes all profile fields plus server-generated metadata.
    """
    id: UUID
    user_id: UUID
    logo_url: Optional[str] = None
    banner_url: Optional[str] = None
    contact_email: str
    contact_phone: Optional[str] = None
    website_url: Optional[str] = None
    registration_number: Optional[str] = None
    tax_id: Optional[str] = None
    specializations: List[str] = Field(default_factory=list)
    partnership_tier: str
    branding_config: Dict[str, Any] = Field(default_factory=dict)
    is_verified: bool = Field(..., description="Whether the partner has been verified by staff")
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# =============================================================================
# Sponsorship Program Schemas
# =============================================================================

class SponsorshipProgramBase(BaseModel):
    """
    Base schema for sponsorship programs.

    A program defines the sponsorship structure, pricing, and target demographics.
    """
    name: str = Field(
        ..., min_length=3, max_length=200,
        description="Program name"
    )
    description: Optional[str] = Field(
        None, max_length=3000,
        description="Detailed program description"
    )
    program_type: ProgramType = Field(
        ..., description="Direct sponsorship or cohort-based"
    )


class SponsorshipProgramCreate(SponsorshipProgramBase):
    """
    Schema for creating a new sponsorship program.

    Includes pricing, capacity, schedule, and targeting fields.
    Minimum of 10 children required per program.
    """
    min_children: int = Field(
        ..., ge=10,
        description="Minimum number of children (must be at least 10)"
    )
    max_children: Optional[int] = Field(
        None, ge=10,
        description="Maximum number of children (None for unlimited)"
    )
    billing_period: BillingPeriod = Field(
        ..., description="Billing cycle: monthly, termly, or annual"
    )
    price_per_child: Decimal = Field(
        ..., gt=0, decimal_places=2,
        description="Sponsorship cost per child per billing period (must be > 0)"
    )
    currency: str = Field(
        default="KES", max_length=3,
        description="ISO 4217 currency code"
    )
    goals: List[str] = Field(
        default_factory=list,
        description="Program goals and objectives"
    )
    target_grade_levels: List[str] = Field(
        default_factory=list,
        description="Target CBC grade levels (e.g. ['Grade 4', 'Grade 5'])"
    )
    target_regions: List[str] = Field(
        default_factory=list,
        description="Target geographic regions within Kenya"
    )
    start_date: Optional[date] = Field(
        None, description="Program start date"
    )
    end_date: Optional[date] = Field(
        None, description="Program end date"
    )

    @field_validator('min_children')
    @classmethod
    def validate_min_children(cls, v: int) -> int:
        """Ensure minimum children is at least 10."""
        if v < 10:
            raise ValueError('Sponsorship programs require a minimum of 10 children')
        return v

    @field_validator('max_children')
    @classmethod
    def validate_max_children(cls, v: Optional[int], info) -> Optional[int]:
        """Ensure max_children is greater than or equal to min_children."""
        if v is not None:
            min_children = info.data.get('min_children')
            if min_children is not None and v < min_children:
                raise ValueError('max_children must be greater than or equal to min_children')
        return v

    @field_validator('end_date')
    @classmethod
    def validate_end_date(cls, v: Optional[date], info) -> Optional[date]:
        """Ensure end_date is after start_date when both are provided."""
        if v is not None:
            start_date = info.data.get('start_date')
            if start_date is not None and v <= start_date:
                raise ValueError('end_date must be after start_date')
        return v

    @field_validator('currency')
    @classmethod
    def validate_currency_uppercase(cls, v: str) -> str:
        """Ensure currency code is uppercase."""
        return v.upper()


class SponsorshipProgramUpdate(BaseModel):
    """
    Schema for updating an existing sponsorship program.

    All fields are optional to support partial updates.
    Programs in ACTIVE status have restricted updatable fields.
    """
    name: Optional[str] = Field(None, min_length=3, max_length=200)
    description: Optional[str] = Field(None, max_length=3000)
    status: Optional[ProgramStatus] = None
    max_children: Optional[int] = Field(None, ge=10)
    goals: Optional[List[str]] = None
    target_grade_levels: Optional[List[str]] = None
    target_regions: Optional[List[str]] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None

    @field_validator('end_date')
    @classmethod
    def validate_end_date(cls, v: Optional[date], info) -> Optional[date]:
        """Ensure end_date is after start_date when both are provided."""
        if v is not None:
            start_date = info.data.get('start_date')
            if start_date is not None and v <= start_date:
                raise ValueError('end_date must be after start_date')
        return v


class SponsorshipProgramResponse(SponsorshipProgramBase):
    """
    Schema for returning sponsorship program data in API responses.

    Includes computed fields like current enrollment counts.
    """
    id: UUID
    partner_id: UUID
    min_children: int
    max_children: Optional[int] = None
    status: str
    billing_period: str
    price_per_child: Decimal
    currency: str
    goals: List[str] = Field(default_factory=list)
    target_grade_levels: List[str] = Field(default_factory=list)
    target_regions: List[str] = Field(default_factory=list)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    current_children_count: int = Field(
        default=0, description="Number of children currently enrolled"
    )
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SponsorshipProgramListResponse(BaseModel):
    """Schema for paginated list of sponsorship programs."""
    programs: List[SponsorshipProgramResponse]
    total: int = Field(..., ge=0, description="Total number of programs")
    page: int = Field(..., ge=1, description="Current page number")
    limit: int = Field(..., ge=1, le=100, description="Items per page")


# =============================================================================
# Sponsored Child Schemas
# =============================================================================

class SponsoredChildBase(BaseModel):
    """Base schema for a child within a sponsorship program."""
    program_id: UUID = Field(..., description="Sponsorship program ID")
    student_id: UUID = Field(..., description="Student user ID")


class SponsoredChildCreate(SponsoredChildBase):
    """
    Schema for adding a child to a sponsorship program.

    The partner_id is inferred from the authenticated user.
    """
    partner_goals: List[str] = Field(
        default_factory=list,
        description="Partner-specific learning goals for this child"
    )
    notes: Optional[str] = Field(
        None, max_length=1000,
        description="Internal notes about this sponsorship"
    )


class SponsoredChildUpdate(BaseModel):
    """Schema for updating a sponsored child record."""
    status: Optional[SponsoredChildStatus] = None
    partner_goals: Optional[List[str]] = None
    ai_milestones: Optional[List[Dict[str, Any]]] = Field(
        None,
        description="AI-tracked milestone data"
    )
    notes: Optional[str] = Field(None, max_length=1000)


class SponsoredChildResponse(SponsoredChildBase):
    """
    Schema for returning sponsored child data.

    Includes status, goals, AI milestones, and consent state.
    """
    id: UUID
    partner_id: UUID
    status: str
    partner_goals: List[str] = Field(default_factory=list)
    ai_milestones: List[Dict[str, Any]] = Field(default_factory=list)
    notes: Optional[str] = None
    consent_given: bool = Field(
        default=False,
        description="Whether parental consent has been provided"
    )
    student_name: Optional[str] = Field(
        None, description="Student display name (visible after consent)"
    )
    grade_level: Optional[str] = Field(
        None, description="Student grade level"
    )
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SponsoredChildListResponse(BaseModel):
    """Schema for paginated list of sponsored children."""
    children: List[SponsoredChildResponse]
    total: int = Field(..., ge=0, description="Total number of children")
    page: int = Field(..., ge=1, description="Current page number")
    limit: int = Field(..., ge=1, le=100, description="Items per page")


class BulkAddChildrenRequest(BaseModel):
    """
    Schema for adding multiple children to a sponsorship program at once.

    Used for batch enrollment of students into a program.
    """
    program_id: UUID = Field(..., description="Target sponsorship program ID")
    student_ids: List[UUID] = Field(
        ..., min_length=1,
        description="List of student IDs to enrol"
    )
    partner_goals: List[str] = Field(
        default_factory=list,
        description="Shared partner goals applied to all children"
    )
    notes: Optional[str] = Field(
        None, max_length=1000,
        description="Shared notes for all children in this batch"
    )

    @field_validator('student_ids')
    @classmethod
    def validate_unique_student_ids(cls, v: List[UUID]) -> List[UUID]:
        """Ensure no duplicate student IDs in the batch."""
        if len(v) != len(set(v)):
            raise ValueError('Duplicate student IDs are not allowed in a single batch')
        return v


class BulkAddChildrenResponse(BaseModel):
    """Response for bulk child enrollment."""
    added: int = Field(..., description="Number of children successfully added")
    skipped: int = Field(..., description="Number of children skipped (already enrolled or invalid)")
    errors: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Details of any errors encountered"
    )


# =============================================================================
# Sponsorship Consent Schemas
# =============================================================================

class SponsorshipConsentCreate(BaseModel):
    """
    Schema for recording parental consent for a sponsored child.

    Consent is required before a partner can view child learning data.
    """
    sponsored_child_id: UUID = Field(
        ..., description="ID of the sponsored child record"
    )
    consent_given: bool = Field(
        ..., description="Whether consent is granted (True) or denied (False)"
    )
    consent_text: str = Field(
        ..., min_length=10, max_length=5000,
        description="Full text of the consent agreement presented to the parent"
    )
    ip_address: Optional[str] = Field(
        None, max_length=45,
        description="IP address of the consenting user"
    )
    user_agent: Optional[str] = Field(
        None, max_length=500,
        description="Browser user agent of the consenting user"
    )


class SponsorshipConsentResponse(BaseModel):
    """Schema for returning consent data."""
    id: UUID
    sponsored_child_id: UUID
    parent_id: UUID
    consent_given: bool
    consent_text: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# =============================================================================
# Partner Subscription Schemas
# =============================================================================

class PartnerSubscriptionCreate(BaseModel):
    """
    Schema for creating a partner billing subscription.

    Links a partner to a sponsorship program with recurring billing.
    """
    program_id: UUID = Field(
        ..., description="Sponsorship program to subscribe to"
    )
    billing_period: BillingPeriod = Field(
        ..., description="Billing cycle: monthly, termly, or annual"
    )
    amount_per_child: Decimal = Field(
        ..., gt=0, decimal_places=2,
        description="Amount charged per child per billing period"
    )
    total_children: int = Field(
        ..., ge=1,
        description="Number of children in the subscription"
    )
    currency: str = Field(
        default="KES", max_length=3,
        description="ISO 4217 currency code"
    )
    auto_renew: bool = Field(
        default=True,
        description="Whether the subscription auto-renews at period end"
    )

    @field_validator('currency')
    @classmethod
    def validate_currency_uppercase(cls, v: str) -> str:
        """Ensure currency code is uppercase."""
        return v.upper()


class PartnerSubscriptionUpdate(BaseModel):
    """Schema for updating a partner subscription."""
    auto_renew: Optional[bool] = None
    status: Optional[SubscriptionStatus] = None
    total_children: Optional[int] = Field(None, ge=1)


class PartnerSubscriptionResponse(BaseModel):
    """
    Schema for returning partner subscription data.

    Includes computed total_amount based on children count and per-child pricing.
    """
    id: UUID
    partner_id: UUID
    program_id: UUID
    billing_period: str
    amount_per_child: Decimal
    total_children: int
    total_amount: Decimal = Field(
        ..., description="Computed total: amount_per_child * total_children"
    )
    currency: str
    status: str
    auto_renew: bool
    current_period_start: Optional[datetime] = None
    current_period_end: Optional[datetime] = None
    next_billing_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PartnerSubscriptionListResponse(BaseModel):
    """Schema for paginated list of partner subscriptions."""
    subscriptions: List[PartnerSubscriptionResponse]
    total: int = Field(..., ge=0)
    page: int = Field(..., ge=1)
    limit: int = Field(..., ge=1, le=100)


# =============================================================================
# Partner Payment Schemas
# =============================================================================

class PartnerPaymentCreate(BaseModel):
    """
    Schema for recording a partner payment against a subscription.

    Payments are typically system-generated but can be manually recorded.
    """
    subscription_id: UUID = Field(
        ..., description="Partner subscription this payment applies to"
    )
    amount: Decimal = Field(
        ..., gt=0, decimal_places=2,
        description="Payment amount (must be > 0)"
    )
    currency: str = Field(
        default="KES", max_length=3,
        description="ISO 4217 currency code"
    )
    payment_gateway: PartnerPaymentGateway = Field(
        ..., description="Payment gateway used"
    )
    transaction_reference: Optional[str] = Field(
        None, max_length=200,
        description="External transaction reference from the gateway"
    )
    period_start: Optional[date] = Field(
        None, description="Start of the billing period this payment covers"
    )
    period_end: Optional[date] = Field(
        None, description="End of the billing period this payment covers"
    )

    @field_validator('currency')
    @classmethod
    def validate_currency_uppercase(cls, v: str) -> str:
        """Ensure currency code is uppercase."""
        return v.upper()

    @field_validator('period_end')
    @classmethod
    def validate_period_end(cls, v: Optional[date], info) -> Optional[date]:
        """Ensure period_end is after period_start when both are provided."""
        if v is not None:
            period_start = info.data.get('period_start')
            if period_start is not None and v <= period_start:
                raise ValueError('period_end must be after period_start')
        return v


class PartnerPaymentResponse(BaseModel):
    """Schema for returning partner payment data."""
    id: UUID
    subscription_id: UUID
    amount: Decimal
    currency: str
    status: str
    payment_gateway: str
    transaction_reference: Optional[str] = None
    receipt_url: Optional[str] = None
    invoice_number: Optional[str] = None
    period_start: Optional[date] = None
    period_end: Optional[date] = None
    paid_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PartnerPaymentListResponse(BaseModel):
    """Schema for paginated list of partner payments."""
    payments: List[PartnerPaymentResponse]
    total: int = Field(..., ge=0)
    page: int = Field(..., ge=1)
    limit: int = Field(..., ge=1, le=100)


# =============================================================================
# Partner Impact Report Schemas
# =============================================================================

class PartnerImpactReportCreate(BaseModel):
    """
    Schema for generating or creating an impact report.

    Reports aggregate child progress, AI insights, and CBC alignment
    metrics for a given period.
    """
    report_type: ReportType = Field(
        ..., description="Type of report to generate"
    )
    title: str = Field(
        ..., min_length=3, max_length=200,
        description="Report title"
    )
    summary: Optional[str] = Field(
        None, max_length=3000,
        description="Executive summary of the report"
    )
    program_id: Optional[UUID] = Field(
        None, description="Specific program to report on (None for all programs)"
    )
    period_start: Optional[date] = Field(
        None, description="Reporting period start date"
    )
    period_end: Optional[date] = Field(
        None, description="Reporting period end date"
    )
    export_format: ExportFormat = Field(
        default=ExportFormat.PDF,
        description="Desired export format"
    )

    @field_validator('period_end')
    @classmethod
    def validate_period_end(cls, v: Optional[date], info) -> Optional[date]:
        """Ensure period_end is after period_start when both are provided."""
        if v is not None:
            period_start = info.data.get('period_start')
            if period_start is not None and v <= period_start:
                raise ValueError('period_end must be after period_start')
        return v


class PartnerImpactReportResponse(BaseModel):
    """
    Schema for returning impact report data.

    Includes AI-generated insights, CBC progress metrics, and export links.
    """
    id: UUID
    partner_id: UUID
    report_type: str
    title: str
    summary: Optional[str] = None
    metrics: Dict[str, Any] = Field(
        default_factory=dict,
        description="Aggregated impact metrics (enrollment, completion, scores)"
    )
    ai_insights: Dict[str, Any] = Field(
        default_factory=dict,
        description="AI-generated insights and recommendations"
    )
    cbc_progress: Dict[str, Any] = Field(
        default_factory=dict,
        description="CBC competency progress across sponsored children"
    )
    export_format: str
    export_url: Optional[str] = Field(
        None, description="URL to download the exported report"
    )
    generated_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PartnerImpactReportListResponse(BaseModel):
    """Schema for paginated list of impact reports."""
    reports: List[PartnerImpactReportResponse]
    total: int = Field(..., ge=0)
    page: int = Field(..., ge=1)
    limit: int = Field(..., ge=1, le=100)


# =============================================================================
# Partner Message Schemas
# =============================================================================

class PartnerMessageCreate(BaseModel):
    """
    Schema for sending a message from the partner dashboard.

    Messages are directed to staff members or platform support.
    """
    recipient_id: UUID = Field(
        ..., description="User ID of the message recipient"
    )
    subject: str = Field(
        ..., min_length=3, max_length=200,
        description="Message subject line"
    )
    body: str = Field(
        ..., min_length=1, max_length=5000,
        description="Message body text (supports markdown)"
    )
    attachments: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="List of attachment objects {filename, url, size_bytes, mime_type}"
    )


class PartnerMessageUpdate(BaseModel):
    """Schema for updating a message (e.g. marking as read)."""
    is_read: Optional[bool] = None
    is_archived: Optional[bool] = None


class PartnerMessageResponse(BaseModel):
    """Schema for returning message data."""
    id: UUID
    sender_id: UUID
    recipient_id: UUID
    subject: str
    body: str
    attachments: List[Dict[str, Any]] = Field(default_factory=list)
    is_read: bool = Field(default=False)
    is_archived: bool = Field(default=False)
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PartnerMessageListResponse(BaseModel):
    """Schema for paginated list of messages."""
    messages: List[PartnerMessageResponse]
    total: int = Field(..., ge=0)
    page: int = Field(..., ge=1)
    limit: int = Field(..., ge=1, le=100)


# =============================================================================
# Partner Meeting Schemas
# =============================================================================

class PartnerMeetingCreate(BaseModel):
    """
    Schema for scheduling a meeting.

    Meetings can be scheduled manually by the partner or suggested by AI.
    """
    title: str = Field(
        ..., min_length=3, max_length=200,
        description="Meeting title"
    )
    description: Optional[str] = Field(
        None, max_length=2000,
        description="Meeting description and agenda"
    )
    scheduled_at: datetime = Field(
        ..., description="Scheduled date and time for the meeting"
    )
    duration_minutes: int = Field(
        ..., ge=15, le=480,
        description="Meeting duration in minutes (15-480)"
    )
    meeting_url: Optional[str] = Field(
        None, max_length=500,
        description="Video conference or meeting URL"
    )
    attendees: List[UUID] = Field(
        default_factory=list,
        description="List of attendee user IDs"
    )
    ai_suggested: bool = Field(
        default=False,
        description="Whether this meeting was suggested by AI"
    )

    @field_validator('scheduled_at')
    @classmethod
    def validate_scheduled_at(cls, v: datetime) -> datetime:
        """Ensure meeting is not scheduled in the past."""
        if v < datetime.utcnow():
            raise ValueError('Meeting cannot be scheduled in the past')
        return v


class PartnerMeetingUpdate(BaseModel):
    """Schema for updating a meeting."""
    title: Optional[str] = Field(None, min_length=3, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    scheduled_at: Optional[datetime] = None
    duration_minutes: Optional[int] = Field(None, ge=15, le=480)
    meeting_url: Optional[str] = Field(None, max_length=500)
    attendees: Optional[List[UUID]] = None
    status: Optional[MeetingStatus] = None


class PartnerMeetingResponse(BaseModel):
    """Schema for returning meeting data."""
    id: UUID
    partner_id: UUID
    title: str
    description: Optional[str] = None
    scheduled_at: datetime
    duration_minutes: int
    meeting_url: Optional[str] = None
    attendees: List[UUID] = Field(default_factory=list)
    status: str
    ai_suggested: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PartnerMeetingListResponse(BaseModel):
    """Schema for paginated list of meetings."""
    meetings: List[PartnerMeetingResponse]
    total: int = Field(..., ge=0)
    page: int = Field(..., ge=1)
    limit: int = Field(..., ge=1, le=100)


# =============================================================================
# Partner Resource Schemas
# =============================================================================

class PartnerResourceCreate(BaseModel):
    """
    Schema for uploading or creating a partner resource.

    Resources can be branded with the partner's identity and shared
    with specific sponsorship programs.
    """
    title: str = Field(
        ..., min_length=3, max_length=200,
        description="Resource title"
    )
    description: Optional[str] = Field(
        None, max_length=2000,
        description="Resource description"
    )
    resource_type: ResourceType = Field(
        ..., description="Type of resource"
    )
    file_url: str = Field(
        ..., max_length=500,
        description="URL to the uploaded resource file"
    )
    branding_applied: bool = Field(
        default=False,
        description="Whether partner branding has been applied"
    )
    target_programs: List[UUID] = Field(
        default_factory=list,
        description="Program IDs this resource is associated with"
    )


class PartnerResourceUpdate(BaseModel):
    """Schema for updating a partner resource."""
    title: Optional[str] = Field(None, min_length=3, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    status: Optional[ResourceStatus] = None
    branding_applied: Optional[bool] = None
    target_programs: Optional[List[UUID]] = None


class PartnerResourceResponse(BaseModel):
    """Schema for returning partner resource data."""
    id: UUID
    partner_id: UUID
    title: str
    description: Optional[str] = None
    resource_type: str
    file_url: str
    status: str
    branding_applied: bool
    target_programs: List[UUID] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PartnerResourceListResponse(BaseModel):
    """Schema for paginated list of partner resources."""
    resources: List[PartnerResourceResponse]
    total: int = Field(..., ge=0)
    page: int = Field(..., ge=1)
    limit: int = Field(..., ge=1, le=100)


# =============================================================================
# Partner Ticket Schemas
# =============================================================================

class PartnerTicketCreate(BaseModel):
    """
    Schema for creating a support ticket from the partner dashboard.

    Tickets may be triaged by AI to assign priority and suggest solutions.
    """
    subject: str = Field(
        ..., min_length=5, max_length=200,
        description="Ticket subject line"
    )
    description: str = Field(
        ..., min_length=10, max_length=5000,
        description="Detailed description of the issue"
    )
    category: TicketCategory = Field(
        ..., description="Ticket category"
    )
    priority: TicketPriority = Field(
        default=TicketPriority.MEDIUM,
        description="Ticket priority level"
    )
    attachments: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="List of attachment objects {filename, url, size_bytes, mime_type}"
    )
    related_program_id: Optional[UUID] = Field(
        None, description="Related sponsorship program (if applicable)"
    )
    related_child_id: Optional[UUID] = Field(
        None, description="Related sponsored child (if applicable)"
    )


class PartnerTicketUpdate(BaseModel):
    """Schema for updating a support ticket."""
    status: Optional[TicketStatus] = None
    priority: Optional[TicketPriority] = None
    description: Optional[str] = Field(None, min_length=10, max_length=5000)
    attachments: Optional[List[Dict[str, Any]]] = None


class PartnerTicketResponse(BaseModel):
    """
    Schema for returning support ticket data.

    Includes AI triage information when available.
    """
    id: UUID
    partner_id: UUID
    subject: str
    description: str
    category: str
    priority: str
    status: str
    attachments: List[Dict[str, Any]] = Field(default_factory=list)
    related_program_id: Optional[UUID] = None
    related_child_id: Optional[UUID] = None
    assigned_to: Optional[UUID] = Field(
        None, description="Staff member assigned to this ticket"
    )
    ai_triage_priority: Optional[str] = Field(
        None, description="AI-suggested priority level"
    )
    ai_triage_category: Optional[str] = Field(
        None, description="AI-suggested category"
    )
    ai_suggested_response: Optional[str] = Field(
        None, description="AI-generated suggested response"
    )
    resolved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PartnerTicketListResponse(BaseModel):
    """Schema for paginated list of partner tickets."""
    tickets: List[PartnerTicketResponse]
    total: int = Field(..., ge=0)
    page: int = Field(..., ge=1)
    limit: int = Field(..., ge=1, le=100)


# =============================================================================
# Child Learning Journey & Activity Schemas
# =============================================================================

class ChildLearningJourney(BaseModel):
    """
    Comprehensive view of a child's CBC-aligned learning journey.

    Provides competency progress, weekly trends, and AI-identified
    strengths and growth areas.
    """
    student_id: UUID
    student_name: Optional[str] = None
    grade_level: Optional[str] = None
    cbc_competencies: Dict[str, Any] = Field(
        default_factory=dict,
        description="CBC competency scores by strand and sub-strand"
    )
    weekly_progress: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Weekly progress data points [{week, score, activities, engagement}]"
    )
    focus_areas: List[str] = Field(
        default_factory=list,
        description="Current focus areas identified by AI"
    )
    strengths: List[str] = Field(
        default_factory=list,
        description="Identified learning strengths"
    )
    growing_edges: List[str] = Field(
        default_factory=list,
        description="Areas for growth and improvement"
    )
    overall_progress_pct: Decimal = Field(
        default=Decimal("0.00"),
        description="Overall progress percentage across all competencies"
    )


class ChildActivity(BaseModel):
    """
    Activity summary for a sponsored child over a given period.

    Tracks engagement metrics, session counts, and content interaction.
    """
    student_id: UUID
    period_start: date
    period_end: date
    time_spent_minutes: int = Field(
        ..., ge=0, description="Total time spent on platform in minutes"
    )
    sessions_count: int = Field(
        ..., ge=0, description="Number of learning sessions"
    )
    streaks: int = Field(
        default=0, ge=0,
        description="Current consecutive-day learning streak"
    )
    most_engaged_content: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Top content items by engagement [{title, type, time_minutes}]"
    )
    ai_tutor_highlights: List[str] = Field(
        default_factory=list,
        description="Notable AI tutor interaction highlights"
    )


class ChildAchievement(BaseModel):
    """
    Achievements earned by a sponsored child.

    Includes certificates, badges, and milestone completions with timestamps.
    """
    student_id: UUID
    certificates: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Certificates earned [{title, course, issued_at, url}]"
    )
    badges: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Badges earned [{name, description, icon_url, earned_at}]"
    )
    milestones: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Milestones reached [{title, description, achieved_at}]"
    )
    total_points: int = Field(default=0, ge=0, description="Total gamification points")


class ChildGoal(BaseModel):
    """
    Learning goal set for a sponsored child.

    Goals can be set by partners or suggested by the AI tutor.
    """
    id: Optional[UUID] = None
    student_id: UUID
    goal: str = Field(
        ..., min_length=5, max_length=500,
        description="Goal description"
    )
    target_date: Optional[date] = Field(
        None, description="Target completion date"
    )
    progress_percentage: Decimal = Field(
        default=Decimal("0.00"), ge=0, le=100,
        description="Current progress towards the goal (0-100)"
    )
    ai_suggested: bool = Field(
        default=False,
        description="Whether this goal was suggested by AI"
    )
    status: str = Field(
        default="active",
        description="Goal status: active, completed, abandoned"
    )
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class ChildAIInsight(BaseModel):
    """
    AI-generated insights about a sponsored child's learning patterns.

    Provides actionable intelligence for partners to understand
    how their sponsorship is impacting learning outcomes.
    """
    student_id: UUID
    learning_style: Optional[str] = Field(
        None,
        description="Identified learning style (visual, auditory, kinesthetic, reading)"
    )
    support_tips: List[str] = Field(
        default_factory=list,
        description="AI-recommended support tips for the partner"
    )
    upcoming_topics: List[str] = Field(
        default_factory=list,
        description="Topics the child will be learning next"
    )
    curiosity_patterns: List[str] = Field(
        default_factory=list,
        description="Topics and areas where the child shows high curiosity"
    )
    early_warnings: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Early warning flags [{area, severity, description, recommendation}]"
    )
    generated_at: Optional[datetime] = None


# =============================================================================
# Dashboard Overview & Analytics Schemas
# =============================================================================

class ROIMetrics(BaseModel):
    """
    Return on investment metrics for the partner's sponsorship.

    Provides financial and educational impact analysis.
    """
    total_invested: Decimal = Field(
        ..., description="Total amount invested across all programs (KES)"
    )
    students_supported: int = Field(
        ..., ge=0, description="Total number of students supported"
    )
    avg_progress: Decimal = Field(
        ..., description="Average learning progress percentage across all children"
    )
    completion_rate: Decimal = Field(
        ..., description="Course completion rate percentage"
    )
    cost_per_student: Decimal = Field(
        ..., description="Average cost per student per period"
    )
    cost_per_completion: Optional[Decimal] = Field(
        None, description="Average cost per course completion"
    )
    engagement_rate: Decimal = Field(
        default=Decimal("0.00"),
        description="Percentage of sponsored children actively engaged"
    )


class BudgetOverview(BaseModel):
    """
    Budget overview for the partner's sponsorship spending.

    Tracks total budget, expenditure, and allocation breakdown.
    """
    total_budget: Decimal = Field(
        ..., description="Total budget allocated for sponsorships"
    )
    spent: Decimal = Field(
        ..., description="Total amount spent to date"
    )
    remaining: Decimal = Field(
        ..., description="Remaining budget"
    )
    allocation_breakdown: Dict[str, Decimal] = Field(
        default_factory=dict,
        description="Spending breakdown by program {program_name: amount}"
    )
    next_payment_date: Optional[date] = Field(
        None, description="Date of the next scheduled payment"
    )
    next_payment_amount: Optional[Decimal] = Field(
        None, description="Amount of the next scheduled payment"
    )
    currency: str = Field(default="KES", description="Currency code")


class PartnerDashboardOverview(BaseModel):
    """
    Composite dashboard overview response for the partner landing page.

    Aggregates key statistics, financial summaries, and AI highlights
    into a single response for efficient dashboard rendering.
    """
    # Program counts
    total_programs: int = Field(
        ..., ge=0, description="Total number of sponsorship programs"
    )
    active_programs: int = Field(
        ..., ge=0, description="Number of currently active programs"
    )
    draft_programs: int = Field(
        ..., ge=0, description="Number of programs in draft status"
    )

    # Children counts
    total_children_sponsored: int = Field(
        ..., ge=0, description="Total children across all programs"
    )
    active_children: int = Field(
        ..., ge=0, description="Children with active sponsorship status"
    )
    pending_consent: int = Field(
        ..., ge=0, description="Children awaiting parental consent"
    )

    # Financial summary
    total_invested: Decimal = Field(
        ..., description="Total amount invested to date"
    )
    current_monthly_cost: Decimal = Field(
        ..., description="Current monthly sponsorship cost"
    )
    currency: str = Field(default="KES", description="Currency code")

    # Engagement & progress
    avg_child_progress: Decimal = Field(
        ..., description="Average progress percentage across all sponsored children"
    )
    avg_engagement_rate: Decimal = Field(
        ..., description="Average platform engagement rate"
    )

    # AI highlights
    ai_highlights: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="AI-generated highlights [{type, title, description, priority}]"
    )

    # Recent activity
    recent_payments: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Last 5 payments [{amount, date, status, program}]"
    )
    upcoming_meetings: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Next 3 scheduled meetings [{title, date, attendees}]"
    )
    open_tickets: int = Field(
        ..., ge=0, description="Number of unresolved support tickets"
    )
    unread_messages: int = Field(
        ..., ge=0, description="Number of unread messages"
    )


# =============================================================================
# Filter Schemas for List Endpoints
# =============================================================================

class ProgramFilterParams(BaseModel):
    """Query parameters for filtering sponsorship programs."""
    status: Optional[ProgramStatus] = Field(None, description="Filter by program status")
    program_type: Optional[ProgramType] = Field(None, description="Filter by program type")
    billing_period: Optional[BillingPeriod] = Field(None, description="Filter by billing period")
    search: Optional[str] = Field(None, max_length=200, description="Search by name or description")
    page: int = Field(default=1, ge=1, description="Page number")
    limit: int = Field(default=20, ge=1, le=100, description="Items per page")
    sort_by: str = Field(default="created_at", description="Sort field")
    sort_order: str = Field(
        default="desc", pattern="^(asc|desc)$",
        description="Sort order: asc or desc"
    )


class ChildFilterParams(BaseModel):
    """Query parameters for filtering sponsored children."""
    program_id: Optional[UUID] = Field(None, description="Filter by sponsorship program")
    status: Optional[SponsoredChildStatus] = Field(None, description="Filter by child status")
    grade_level: Optional[str] = Field(None, max_length=20, description="Filter by grade level")
    search: Optional[str] = Field(None, max_length=200, description="Search by name")
    page: int = Field(default=1, ge=1, description="Page number")
    limit: int = Field(default=20, ge=1, le=100, description="Items per page")
    sort_by: str = Field(default="created_at", description="Sort field")
    sort_order: str = Field(
        default="desc", pattern="^(asc|desc)$",
        description="Sort order: asc or desc"
    )


class PaymentFilterParams(BaseModel):
    """Query parameters for filtering partner payments."""
    subscription_id: Optional[UUID] = Field(None, description="Filter by subscription")
    status: Optional[PartnerPaymentStatus] = Field(None, description="Filter by payment status")
    gateway: Optional[PartnerPaymentGateway] = Field(None, description="Filter by gateway")
    date_from: Optional[date] = Field(None, description="Filter payments from this date")
    date_to: Optional[date] = Field(None, description="Filter payments up to this date")
    page: int = Field(default=1, ge=1, description="Page number")
    limit: int = Field(default=20, ge=1, le=100, description="Items per page")
    sort_by: str = Field(default="created_at", description="Sort field")
    sort_order: str = Field(
        default="desc", pattern="^(asc|desc)$",
        description="Sort order: asc or desc"
    )

    @field_validator('date_to')
    @classmethod
    def validate_date_range(cls, v: Optional[date], info) -> Optional[date]:
        """Ensure date_to is after date_from when both are provided."""
        if v is not None:
            date_from = info.data.get('date_from')
            if date_from is not None and v < date_from:
                raise ValueError('date_to must be on or after date_from')
        return v


class ReportFilterParams(BaseModel):
    """Query parameters for filtering impact reports."""
    report_type: Optional[ReportType] = Field(None, description="Filter by report type")
    program_id: Optional[UUID] = Field(None, description="Filter by program")
    date_from: Optional[date] = Field(None, description="Filter reports from this date")
    date_to: Optional[date] = Field(None, description="Filter reports up to this date")
    page: int = Field(default=1, ge=1, description="Page number")
    limit: int = Field(default=20, ge=1, le=100, description="Items per page")


class TicketFilterParams(BaseModel):
    """Query parameters for filtering support tickets."""
    status: Optional[TicketStatus] = Field(None, description="Filter by ticket status")
    category: Optional[TicketCategory] = Field(None, description="Filter by category")
    priority: Optional[TicketPriority] = Field(None, description="Filter by priority")
    search: Optional[str] = Field(None, max_length=200, description="Search by subject or description")
    page: int = Field(default=1, ge=1, description="Page number")
    limit: int = Field(default=20, ge=1, le=100, description="Items per page")
    sort_by: str = Field(default="created_at", description="Sort field")
    sort_order: str = Field(
        default="desc", pattern="^(asc|desc)$",
        description="Sort order: asc or desc"
    )


class MessageFilterParams(BaseModel):
    """Query parameters for filtering partner messages."""
    is_read: Optional[bool] = Field(None, description="Filter by read status")
    is_archived: Optional[bool] = Field(None, description="Filter by archive status")
    search: Optional[str] = Field(None, max_length=200, description="Search by subject or body")
    page: int = Field(default=1, ge=1, description="Page number")
    limit: int = Field(default=20, ge=1, le=100, description="Items per page")
    sort_by: str = Field(default="created_at", description="Sort field")
    sort_order: str = Field(
        default="desc", pattern="^(asc|desc)$",
        description="Sort order: asc or desc"
    )
