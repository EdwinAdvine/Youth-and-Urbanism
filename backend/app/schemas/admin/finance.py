"""Pydantic schemas for admin finance endpoints."""

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class RefundRequest(BaseModel):
    transaction_id: UUID
    reason: str
    amount: Optional[float] = None  # partial refund if specified


class PayoutProcessRequest(BaseModel):
    payout_id: UUID


class InvoiceCreate(BaseModel):
    partner_id: Optional[UUID] = None
    user_id: Optional[UUID] = None
    amount: float
    currency: str = "KES"
    due_date: Optional[datetime] = None
    items: List[dict] = []
    notes: Optional[str] = None


class InvoiceResponse(BaseModel):
    id: UUID
    invoice_number: str
    amount: float
    currency: str
    status: str
    due_date: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class PartnerContractCreate(BaseModel):
    partner_id: UUID
    contract_type: str = Field(..., description="sponsorship | revenue_share | flat_fee")
    terms: dict = {}
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    total_value: Optional[float] = None
    currency: str = "KES"
    auto_renew: bool = False


class SubscriptionPlanUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    features: Optional[List[str]] = None
    is_active: Optional[bool] = None
