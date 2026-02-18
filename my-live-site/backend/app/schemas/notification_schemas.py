"""
Notification Pydantic schemas for request/response validation.
"""

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class NotificationResponse(BaseModel):
    """Single notification in API response."""
    id: UUID
    user_id: UUID
    type: str
    title: str
    message: str
    is_read: bool = False
    action_url: Optional[str] = None
    action_label: Optional[str] = None
    created_at: datetime
    read_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class NotificationListResponse(BaseModel):
    """Paginated notification list."""
    notifications: List[NotificationResponse]
    total: int
    unread_count: int
    page: int = 1
    limit: int = 20


class UnreadCountResponse(BaseModel):
    """Quick unread notification count."""
    unread_count: int
