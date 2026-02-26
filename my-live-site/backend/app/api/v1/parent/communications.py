"""
Parent Communications Router

API endpoints for notifications, messages, and support.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from uuid import UUID

from app.database import get_db
from app.models import User
from app.utils.security import get_current_user
from app.schemas.parent.communications_schemas import (
    NotificationsListResponse, ParentNotificationResponse, NotificationCountsResponse,
    ConversationsListResponse, ConversationMessagesResponse,
    ParentMessageResponse, SendMessageRequest,
    SupportArticlesResponse, SupportTicketsListResponse,
    SupportTicketResponse, CreateSupportTicketRequest, AddTicketMessageRequest
)
from app.services.parent.communications_service import parent_communications_service

router = APIRouter(prefix="/parent/communications", tags=["parent-communications"])


def require_parent_role(current_user: User = Depends(get_current_user)) -> User:
    """Dependency to ensure user has parent role."""
    if current_user.role != "parent":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Parent role required"
        )
    return current_user


# ============================================================================
# NOTIFICATION ENDPOINTS
# ============================================================================

@router.get("/notifications", response_model=NotificationsListResponse)
async def get_notifications(
    notification_type: Optional[str] = Query(None, description="Filter by type"),
    is_read: Optional[bool] = Query(None, description="Filter by read status"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """
    Get parent notifications.

    Query parameters:
    - notification_type: Filter by type
    - is_read: Filter by read status
    - limit: Max results
    - offset: Pagination offset

    Returns:
    - List of notifications with counts
    """
    return await parent_communications_service.get_notifications(
        db=db,
        parent_id=current_user.id,
        notification_type=notification_type,
        is_read=is_read,
        limit=limit,
        offset=offset
    )


@router.put("/notifications/{notification_id}/read", response_model=ParentNotificationResponse)
async def mark_notification_read(
    notification_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """Mark a notification as read."""
    try:
        return await parent_communications_service.mark_notification_read(
            db=db,
            parent_id=current_user.id,
            notification_id=notification_id
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.put("/notifications/read-all", status_code=status.HTTP_200_OK)
async def mark_all_read(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """Mark all notifications as read."""
    return await parent_communications_service.mark_all_read(
        db=db,
        parent_id=current_user.id
    )


@router.get("/notifications/counts", response_model=NotificationCountsResponse)
async def get_notification_counts(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """
    Get unread notification counts by type.

    Returns:
    - Total unread count
    - Counts by type
    - Urgent notification count
    """
    return await parent_communications_service.get_notification_counts(
        db=db,
        parent_id=current_user.id
    )


# ============================================================================
# MESSAGE ENDPOINTS
# ============================================================================

@router.get("/messages/conversations", response_model=ConversationsListResponse)
async def get_conversations(
    channel: Optional[str] = Query(None, description="Filter by channel"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """
    Get list of conversations.

    Query parameters:
    - channel: Filter by channel (ai_tutor, teacher, family, support)

    Returns:
    - List of conversation summaries
    """
    return await parent_communications_service.get_conversations(
        db=db,
        parent_id=current_user.id,
        channel=channel
    )


@router.get("/messages/conversations/{conversation_id}", response_model=ConversationMessagesResponse)
async def get_conversation_messages(
    conversation_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """
    Get messages in a conversation.

    Returns:
    - Conversation details
    - List of messages
    - Participant info
    """
    return await parent_communications_service.get_conversation_messages(
        db=db,
        parent_id=current_user.id,
        conversation_id=conversation_id
    )


@router.post("/messages/send", response_model=ParentMessageResponse)
async def send_message(
    request: SendMessageRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """
    Send a message (REST fallback).

    Note: Use WebSocket for real-time messaging.
    This endpoint is provided as a fallback.
    """
    try:
        return await parent_communications_service.send_message(
            db=db,
            parent_id=current_user.id,
            request=request
        )
    except NotImplementedError:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Use WebSocket for real-time messaging"
        )


@router.put("/messages/{message_id}/read", status_code=status.HTTP_204_NO_CONTENT)
async def mark_message_read(
    message_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """Mark a message as read."""
    try:
        await parent_communications_service.mark_message_read(
            db=db,
            parent_id=current_user.id,
            message_id=message_id
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


# ============================================================================
# SUPPORT ENDPOINTS
# ============================================================================

@router.get("/support/articles", response_model=SupportArticlesResponse)
async def get_support_articles(
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search query"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """
    Get help articles.

    Query parameters:
    - category: Filter by category
    - search: Search in title and content

    Returns:
    - List of help articles
    - Available categories
    """
    return await parent_communications_service.get_support_articles(
        db=db,
        category=category,
        search=search
    )


@router.get("/support/tickets", response_model=SupportTicketsListResponse)
async def get_support_tickets(
    status: Optional[str] = Query(None, description="Filter by status"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """
    Get support tickets.

    Query parameters:
    - status: Filter by status (open, in_progress, resolved, closed)

    Returns:
    - List of support tickets
    - Counts by status
    """
    return await parent_communications_service.get_support_tickets(
        db=db,
        parent_id=current_user.id,
        status=status
    )


@router.post("/support/tickets", response_model=SupportTicketResponse, status_code=status.HTTP_201_CREATED)
async def create_support_ticket(
    request: CreateSupportTicketRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """
    Create a support ticket.

    Request body:
    - title: Ticket title
    - description: Detailed description
    - category: Ticket category
    - priority: Priority level
    - child_id: Optional child ID if related to specific child

    Returns:
    - Created ticket details
    """
    try:
        return await parent_communications_service.create_support_ticket(
            db=db,
            parent_id=current_user.id,
            request=request
        )
    except NotImplementedError:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Support tickets not yet implemented"
        )


@router.post("/support/tickets/{ticket_id}/messages", status_code=status.HTTP_201_CREATED)
async def add_ticket_message(
    ticket_id: UUID,
    request: AddTicketMessageRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """Add a message to a support ticket."""
    # Placeholder - will be implemented with ticket system
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Support tickets not yet implemented"
    )
