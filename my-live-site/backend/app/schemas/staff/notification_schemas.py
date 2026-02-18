"""
Notification Schemas

Request/response schemas for push notifications, in-app notifications, and digest config.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


# ── Push Subscription ───────────────────────────────────────

class PushSubscribeRequest(BaseModel):
    endpoint: str = Field(..., min_length=1)
    p256dh_key: str = Field(..., min_length=1)
    auth_key: str = Field(..., min_length=1)


class PushUnsubscribeRequest(BaseModel):
    endpoint: str = Field(..., min_length=1)


class PushSubscriptionResponse(BaseModel):
    id: str
    endpoint: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ── Notifications ───────────────────────────────────────────

class NotificationResponse(BaseModel):
    id: str
    notification_type: str = Field(..., description="ticket | moderation | sla | session | content | system | alert")
    title: str
    message: str
    data: Dict[str, Any] = Field(default_factory=dict)
    priority: str = Field(default="normal", description="low | normal | high | critical")
    read: bool = False
    action_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationListResponse(BaseModel):
    items: List[NotificationResponse]
    total: int
    unread_count: int
    page: int
    page_size: int


class NotificationMarkReadRequest(BaseModel):
    notification_ids: List[str] = Field(..., min_length=1, max_length=100)


class NotificationMarkAllReadResponse(BaseModel):
    marked_count: int


# ── Notification Create (internal use) ─────────────────────

class NotificationCreate(BaseModel):
    user_id: str
    notification_type: str
    title: str
    message: str
    data: Dict[str, Any] = Field(default_factory=dict)
    priority: str = "normal"
    action_url: Optional[str] = None


class BulkNotificationCreate(BaseModel):
    user_ids: List[str] = Field(..., min_length=1)
    notification_type: str
    title: str
    message: str
    data: Dict[str, Any] = Field(default_factory=dict)
    priority: str = "normal"
    action_url: Optional[str] = None


# ── Digest Config ───────────────────────────────────────────

class DigestConfigUpdate(BaseModel):
    frequency: str = Field(..., description="realtime | hourly | daily | weekly")
    include_categories: Optional[List[str]] = None
    delivery_time: Optional[str] = Field(None, description="HH:MM format for daily/weekly digests")
    delivery_day: Optional[int] = Field(None, ge=0, le=6, description="0=Mon, 6=Sun for weekly digests")
