"""Pydantic schemas for admin user management, restrictions, and API tokens."""

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Restrictions
# ---------------------------------------------------------------------------

class CreateRestrictionRequest(BaseModel):
    user_id: UUID
    restriction_type: str = Field(..., description="suspension | ban | feature_lock | warning")
    reason: str
    duration_days: Optional[int] = None
    affected_features: Optional[List[str]] = None


class AppealDecisionRequest(BaseModel):
    decision: str = Field(..., description="approved | rejected")
    admin_notes: Optional[str] = None


class RestrictionResponse(BaseModel):
    id: UUID
    user_id: UUID
    restriction_type: str
    reason: str
    is_active: bool
    appealed: bool
    appeal_decision: Optional[str] = None
    expires_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# API Tokens
# ---------------------------------------------------------------------------

class APITokenCreateRequest(BaseModel):
    name: str = Field(..., max_length=100)
    scopes: List[str] = []
    expires_in_days: Optional[int] = None


class APITokenResponse(BaseModel):
    id: UUID
    name: str
    scopes: list
    is_active: bool
    last_used_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class APITokenCreatedResponse(APITokenResponse):
    """Returned only at creation time — includes the raw token."""
    raw_token: str


# ---------------------------------------------------------------------------
# User updates
# ---------------------------------------------------------------------------

class UpdateUserRoleRequest(BaseModel):
    role: str = Field(..., description="student | parent | instructor | admin | partner | staff")


class BulkUserActionRequest(BaseModel):
    user_ids: List[UUID]
    action: str = Field(..., description="deactivate | reactivate | delete")
