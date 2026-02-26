"""
Partner Application Pydantic schemas for request/response validation.
"""

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, EmailStr


class PartnerApplicationCreate(BaseModel):
    """Schema for submitting a partner application."""
    organization_name: str = Field(..., min_length=1, max_length=300, description="Name of the partner organization")
    organization_type: str = Field(
        ...,
        pattern="^(NGO|Corporate|Government|Foundation|Individual)$",
        description="Type of organization: NGO, Corporate, Government, Foundation, or Individual",
    )
    contact_person: str = Field(..., min_length=1, max_length=200, description="Primary contact person name")
    email: EmailStr = Field(..., description="Contact email address")
    phone: Optional[str] = Field(None, max_length=50, description="Contact phone number")
    description: str = Field(..., min_length=1, description="Description of the organization and its goals")
    partnership_goals: Optional[str] = Field(None, description="What the partner hopes to achieve")
    website: Optional[str] = Field(None, max_length=500, description="Organization website URL")


class PartnerApplicationReview(BaseModel):
    """Schema for admin review of a partner application."""
    status: str = Field(..., pattern="^(approved|rejected)$", description="Review decision: approved or rejected")
    review_notes: Optional[str] = Field(None, description="Notes about the review decision")


class PartnerApplicationResponse(BaseModel):
    """Full partner application in API response."""
    id: UUID
    user_id: Optional[UUID] = None
    organization_name: str
    organization_type: str
    contact_person: str
    email: str
    phone: Optional[str] = None
    description: str
    partnership_goals: Optional[str] = None
    website: Optional[str] = None
    status: str = "pending"
    invite_expires_at: Optional[datetime] = None
    reviewed_by: Optional[UUID] = None
    reviewed_at: Optional[datetime] = None
    review_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PartnerApplicationListResponse(BaseModel):
    """Paginated partner application list."""
    applications: List[PartnerApplicationResponse]
    total: int
