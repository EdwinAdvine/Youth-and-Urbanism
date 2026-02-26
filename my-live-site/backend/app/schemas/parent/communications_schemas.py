"""
Parent Communications Schemas

Schemas for notifications, messages, and support.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime


# ============================================================================
# NOTIFICATION SCHEMAS
# ============================================================================

class ParentNotificationResponse(BaseModel):
    """Parent notification detail"""
    id: UUID
    parent_id: UUID
    child_id: Optional[UUID] = None
    child_name: Optional[str] = None
    notification_type: str  # achievement, alert, message, system, payment, report
    title: str
    message: str
    priority: str  # low, normal, high, urgent
    is_read: bool
    read_at: Optional[datetime] = None
    action_url: Optional[str] = None
    icon: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationsListResponse(BaseModel):
    """Notifications list with counts"""
    notifications: List[ParentNotificationResponse]
    total_count: int
    unread_count: int
    has_urgent: bool


class NotificationCountsResponse(BaseModel):
    """Unread notification counts by type"""
    total_unread: int
    by_type: dict  # {notification_type: count}
    urgent_count: int


# ============================================================================
# MESSAGE SCHEMAS
# ============================================================================

class MessageParticipant(BaseModel):
    """Message participant info"""
    user_id: UUID
    full_name: str
    role: str
    avatar_url: Optional[str] = None


class ParentMessageResponse(BaseModel):
    """Single message in conversation"""
    id: UUID
    conversation_id: UUID
    sender: MessageParticipant
    content: str
    message_type: str  # text, image, file, system
    is_read: bool
    read_at: Optional[datetime] = None
    metadata_: Optional[dict] = Field(None, alias="metadata")
    created_at: datetime

    class Config:
        from_attributes = True
        populate_by_name = True


class ConversationSummary(BaseModel):
    """Conversation summary for list view"""
    conversation_id: UUID
    channel: str  # ai_tutor, teacher, family, support
    child_id: Optional[UUID] = None
    child_name: Optional[str] = None
    other_participant: MessageParticipant
    last_message: str
    last_message_at: datetime
    unread_count: int
    is_pinned: bool = False


class ConversationsListResponse(BaseModel):
    """List of conversations"""
    conversations: List[ConversationSummary]
    total_count: int


class ConversationMessagesResponse(BaseModel):
    """Messages in a conversation"""
    conversation_id: UUID
    channel: str
    participants: List[MessageParticipant]
    messages: List[ParentMessageResponse]
    total_count: int
    child_id: Optional[UUID] = None
    child_name: Optional[str] = None


class SendMessageRequest(BaseModel):
    """Send message request"""
    conversation_id: Optional[UUID] = None
    recipient_id: Optional[UUID] = None
    channel: str
    child_id: Optional[UUID] = None
    content: str
    message_type: str = "text"
    metadata_: Optional[dict] = Field(None, alias="metadata")


# ============================================================================
# SUPPORT SCHEMAS
# ============================================================================

class SupportArticle(BaseModel):
    """Help article"""
    id: UUID
    title: str
    summary: str
    category: str
    tags: List[str]
    content: str
    helpful_count: int
    view_count: int
    created_at: datetime
    updated_at: datetime


class SupportArticlesResponse(BaseModel):
    """List of support articles"""
    articles: List[SupportArticle]
    total_count: int
    categories: List[str]


class SupportTicketMessage(BaseModel):
    """Message in support ticket"""
    id: UUID
    ticket_id: UUID
    sender: MessageParticipant
    content: str
    is_staff_response: bool
    created_at: datetime


class SupportTicketResponse(BaseModel):
    """Support ticket detail"""
    id: UUID
    parent_id: UUID
    child_id: Optional[UUID] = None
    child_name: Optional[str] = None
    title: str
    description: str
    category: str  # technical, billing, content, other
    priority: str  # low, normal, high, urgent
    status: str  # open, in_progress, waiting_response, resolved, closed
    assigned_to: Optional[MessageParticipant] = None
    messages: List[SupportTicketMessage]
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None


class SupportTicketsListResponse(BaseModel):
    """List of support tickets"""
    tickets: List[SupportTicketResponse]
    total_count: int
    open_count: int
    resolved_count: int


class CreateSupportTicketRequest(BaseModel):
    """Create support ticket request"""
    title: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=20)
    category: str
    priority: str = "normal"
    child_id: Optional[UUID] = None


class AddTicketMessageRequest(BaseModel):
    """Add message to ticket"""
    content: str = Field(..., min_length=1)
