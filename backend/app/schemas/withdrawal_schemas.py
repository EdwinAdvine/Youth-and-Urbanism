"""
Withdrawal Schemas

Pydantic models for withdrawal request/response validation.
"""

from datetime import datetime
from decimal import Decimal
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field


class WithdrawalRequestCreate(BaseModel):
    """Request body for creating a withdrawal request."""
    amount: Decimal = Field(..., gt=0, description="Amount to withdraw")
    currency: str = Field(default="KES", max_length=3)
    payout_method: str = Field(
        ...,
        description="One of: mpesa_b2c, bank_transfer, paypal",
    )
    payout_details: Dict[str, Any] = Field(
        ...,
        description="Method-specific details",
    )


class WithdrawalRequestResponse(BaseModel):
    """Response for a single withdrawal request."""
    id: str
    user_id: str
    amount: Decimal
    currency: str
    payout_method: str
    payout_details: Dict[str, Any]
    status: str
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    transaction_reference: Optional[str] = None
    processed_at: Optional[datetime] = None
    failure_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    # User info (populated from relationship)
    user_email: Optional[str] = None
    user_name: Optional[str] = None
    user_role: Optional[str] = None

    class Config:
        from_attributes = True


class WithdrawalRejectBody(BaseModel):
    """Request body for rejecting a withdrawal."""
    reason: str = Field(..., min_length=1, max_length=1000)
