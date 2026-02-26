"""
Parent Finance Schemas

Schemas for subscriptions, payments, and M-Pesa integration.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime, date


# ============================================================================
# SUBSCRIPTION SCHEMAS
# ============================================================================

class SubscriptionPlan(BaseModel):
    """Available subscription plan"""
    id: str
    name: str
    description: str
    price_monthly: float
    price_annual: float
    features: List[str]
    max_children: int
    is_popular: bool = False
    is_current: bool = False


class CurrentSubscriptionResponse(BaseModel):
    """Current subscription status"""
    plan_id: str
    plan_name: str
    status: str  # active, paused, cancelled, expired
    billing_cycle: str  # monthly, annual
    current_period_start: date
    current_period_end: date
    next_billing_date: Optional[date] = None
    amount: float
    children_count: int
    max_children: int
    auto_renew: bool
    payment_method: str  # mpesa, card, other


class AvailablePlansResponse(BaseModel):
    """List of available plans"""
    plans: List[SubscriptionPlan]
    current_plan_id: Optional[str] = None


class ChangeSubscriptionRequest(BaseModel):
    """Change subscription plan"""
    new_plan_id: str
    billing_cycle: str  # monthly, annual


class PauseSubscriptionRequest(BaseModel):
    """Pause subscription"""
    reason: Optional[str] = None
    resume_date: Optional[date] = None


# ============================================================================
# PAYMENT SCHEMAS
# ============================================================================

class PaymentHistoryItem(BaseModel):
    """Payment history record"""
    id: UUID
    transaction_date: datetime
    amount: float
    currency: str = "KES"
    payment_method: str
    status: str  # completed, pending, failed, refunded
    description: str
    receipt_number: Optional[str] = None
    mpesa_receipt: Optional[str] = None


class PaymentHistoryResponse(BaseModel):
    """Payment history list"""
    payments: List[PaymentHistoryItem]
    total_count: int
    total_paid: float


class ReceiptResponse(BaseModel):
    """Payment receipt"""
    receipt_url: str
    payment_id: UUID
    amount: float
    date: datetime
    receipt_number: str


# ============================================================================
# M-PESA SCHEMAS
# ============================================================================

class MpesaSTKPushRequest(BaseModel):
    """Initiate M-Pesa STK push"""
    phone_number: str = Field(..., pattern=r"^254\d{9}$", description="Phone number in format 254XXXXXXXXX")
    amount: float = Field(..., gt=0, description="Amount in KES")
    account_reference: str
    transaction_desc: str


class MpesaSTKPushResponse(BaseModel):
    """STK push response"""
    checkout_request_id: str
    merchant_request_id: str
    response_code: str
    response_description: str
    customer_message: str


class MpesaPaymentStatusResponse(BaseModel):
    """Payment status"""
    checkout_request_id: str
    status: str  # pending, completed, failed, cancelled
    result_code: Optional[str] = None
    result_desc: Optional[str] = None
    mpesa_receipt_number: Optional[str] = None
    transaction_date: Optional[datetime] = None
    phone_number: Optional[str] = None
    amount: Optional[float] = None


# ============================================================================
# ADD-ONS SCHEMAS
# ============================================================================

class AddOn(BaseModel):
    """Available add-on"""
    id: str
    name: str
    description: str
    price: float
    duration_months: int
    features: List[str]
    is_purchased: bool = False


class AddOnsResponse(BaseModel):
    """Available add-ons"""
    addons: List[AddOn]
    active_addons: List[str]


class PurchaseAddOnRequest(BaseModel):
    """Purchase add-on"""
    addon_id: str
    payment_method: str  # mpesa, card
    phone_number: Optional[str] = Field(None, pattern=r"^254\d{9}$")
