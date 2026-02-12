"""
Contact Message Pydantic schemas for request/response validation.
"""

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, EmailStr


class ContactCreate(BaseModel):
    """Schema for submitting a contact form message."""
    name: str = Field(..., min_length=1, max_length=200, description="Sender's full name")
    email: EmailStr = Field(..., description="Sender's email address")
    subject: str = Field(..., min_length=1, max_length=500, description="Message subject")
    message: str = Field(..., min_length=1, description="Message body")


class ContactReply(BaseModel):
    """Schema for admin reply to a contact message."""
    reply_message: str = Field(..., min_length=1, description="Reply text")


class ContactResponse(BaseModel):
    """Full contact message in API response."""
    id: UUID
    name: str
    email: str
    subject: str
    message: str
    is_read: bool = False
    read_at: Optional[datetime] = None
    replied_at: Optional[datetime] = None
    reply_message: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ContactListResponse(BaseModel):
    """Paginated contact message list."""
    messages: List[ContactResponse]
    total: int
