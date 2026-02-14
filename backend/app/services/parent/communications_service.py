"""
Parent Communications Service

Business logic for notifications, messages, and support.
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func, desc
from typing import Optional, List
from uuid import UUID
import uuid as uuid_mod
from datetime import datetime
import logging

from app.models import User, Student
from app.models.parent.parent_message import ParentMessage
from app.models.parent.ai_alert import AIAlert
from app.schemas.parent.communications_schemas import (
    NotificationsListResponse, ParentNotificationResponse, NotificationCountsResponse,
    ConversationsListResponse, ConversationSummary, ConversationMessagesResponse,
    ParentMessageResponse, MessageParticipant, SendMessageRequest,
    SupportArticlesResponse, SupportArticle, SupportTicketsListResponse,
    SupportTicketResponse, CreateSupportTicketRequest, AddTicketMessageRequest
)


logger = logging.getLogger(__name__)


class ParentCommunicationsService:
    """Service for parent communications"""

    async def get_notifications(
        self,
        db: AsyncSession,
        parent_id: UUID,
        notification_type: Optional[str] = None,
        is_read: Optional[bool] = None,
        limit: int = 50,
        offset: int = 0
    ) -> NotificationsListResponse:
        """Get parent notifications with filtering"""

        # Build query filters
        filters = [AIAlert.parent_id == parent_id]

        if notification_type:
            filters.append(AIAlert.alert_type == notification_type)

        if is_read is not None:
            filters.append(AIAlert.is_read == is_read)

        # Get total count
        count_result = await db.execute(
            select(func.count(AIAlert.id)).where(and_(*filters))
        )
        total_count = count_result.scalar() or 0

        # Get unread count
        unread_result = await db.execute(
            select(func.count(AIAlert.id)).where(
                and_(AIAlert.parent_id == parent_id, AIAlert.is_read == False)
            )
        )
        unread_count = unread_result.scalar() or 0

        # Check for urgent notifications
        urgent_result = await db.execute(
            select(func.count(AIAlert.id)).where(
                and_(
                    AIAlert.parent_id == parent_id,
                    AIAlert.severity == 'critical',
                    AIAlert.is_read == False
                )
            )
        )
        has_urgent = (urgent_result.scalar() or 0) > 0

        # Get notifications
        result = await db.execute(
            select(AIAlert)
            .where(and_(*filters))
            .order_by(desc(AIAlert.created_at))
            .limit(limit)
            .offset(offset)
        )
        alerts = result.scalars().all()

        # Build response
        notifications = []
        for alert in alerts:
            child_name = None
            if alert.child_id:
                child_result = await db.execute(
                    select(Student).where(Student.id == alert.child_id)
                )
                child = child_result.scalar_one_or_none()
                if child and child.user:
                    child_name = child.user.profile_data.get('full_name', 'Unknown')

            notifications.append(ParentNotificationResponse(
                id=alert.id,
                parent_id=alert.parent_id,
                child_id=alert.child_id,
                child_name=child_name,
                notification_type=alert.alert_type,
                title=alert.title,
                message=alert.message,
                priority=alert.severity,
                is_read=alert.is_read,
                read_at=None,  # Add to model if needed
                action_url=alert.action_url,
                icon=None,  # Can be derived from alert_type
                created_at=alert.created_at
            ))

        return NotificationsListResponse(
            notifications=notifications,
            total_count=total_count,
            unread_count=unread_count,
            has_urgent=has_urgent
        )

    async def mark_notification_read(
        self,
        db: AsyncSession,
        parent_id: UUID,
        notification_id: UUID
    ) -> ParentNotificationResponse:
        """Mark notification as read"""

        result = await db.execute(
            select(AIAlert).where(
                and_(AIAlert.id == notification_id, AIAlert.parent_id == parent_id)
            )
        )
        alert = result.scalar_one_or_none()

        if not alert:
            raise ValueError("Notification not found")

        alert.is_read = True
        await db.commit()
        await db.refresh(alert)

        # Get child name
        child_name = None
        if alert.child_id:
            child_result = await db.execute(
                select(Student).where(Student.id == alert.child_id)
            )
            child = child_result.scalar_one_or_none()
            if child and child.user:
                child_name = child.user.profile_data.get('full_name', 'Unknown')

        return ParentNotificationResponse(
            id=alert.id,
            parent_id=alert.parent_id,
            child_id=alert.child_id,
            child_name=child_name,
            notification_type=alert.alert_type,
            title=alert.title,
            message=alert.message,
            priority=alert.severity,
            is_read=alert.is_read,
            read_at=None,
            action_url=alert.action_url,
            icon=None,
            created_at=alert.created_at
        )

    async def mark_all_read(
        self,
        db: AsyncSession,
        parent_id: UUID
    ) -> dict:
        """Mark all notifications as read"""

        await db.execute(
            select(AIAlert).where(
                and_(AIAlert.parent_id == parent_id, AIAlert.is_read == False)
            )
        )

        # Update all unread to read
        result = await db.execute(
            select(AIAlert).where(
                and_(AIAlert.parent_id == parent_id, AIAlert.is_read == False)
            )
        )
        alerts = result.scalars().all()

        for alert in alerts:
            alert.is_read = True

        await db.commit()

        return {"marked_read": len(alerts)}

    async def get_notification_counts(
        self,
        db: AsyncSession,
        parent_id: UUID
    ) -> NotificationCountsResponse:
        """Get unread notification counts by type"""

        # Get all unread notifications
        result = await db.execute(
            select(AIAlert).where(
                and_(AIAlert.parent_id == parent_id, AIAlert.is_read == False)
            )
        )
        alerts = result.scalars().all()

        # Count by type
        by_type = {}
        urgent_count = 0

        for alert in alerts:
            by_type[alert.alert_type] = by_type.get(alert.alert_type, 0) + 1
            if alert.severity == 'critical':
                urgent_count += 1

        return NotificationCountsResponse(
            total_unread=len(alerts),
            by_type=by_type,
            urgent_count=urgent_count
        )

    async def get_conversations(
        self,
        db: AsyncSession,
        parent_id: UUID,
        channel: Optional[str] = None
    ) -> ConversationsListResponse:
        """Get list of conversations"""

        # Placeholder - will be implemented with full messaging system
        return ConversationsListResponse(
            conversations=[],
            total_count=0
        )

    async def get_conversation_messages(
        self,
        db: AsyncSession,
        parent_id: UUID,
        conversation_id: UUID
    ) -> ConversationMessagesResponse:
        """Get messages in a conversation"""

        # Placeholder - will be implemented with full messaging system
        return ConversationMessagesResponse(
            conversation_id=conversation_id,
            channel="ai_tutor",
            participants=[],
            messages=[],
            total_count=0
        )

    async def send_message(
        self,
        db: AsyncSession,
        parent_id: UUID,
        request: SendMessageRequest
    ) -> ParentMessageResponse:
        """Send a message (REST fallback for WebSocket)"""

        # Determine conversation_id: use existing or generate new
        conversation_id = request.conversation_id or uuid_mod.uuid4()

        # Create the message record
        message = ParentMessage(
            id=uuid_mod.uuid4(),
            conversation_id=conversation_id,
            sender_id=parent_id,
            recipient_id=request.recipient_id,
            channel=request.channel,
            child_id=request.child_id,
            content=request.content,
            message_type=request.message_type or 'text',
            is_read=False,
            metadata_=request.metadata_ if hasattr(request, 'metadata_') else None,
            created_at=datetime.utcnow(),
        )

        db.add(message)
        await db.commit()
        await db.refresh(message)

        # Get sender info
        sender_result = await db.execute(
            select(User).where(User.id == parent_id)
        )
        sender_user = sender_result.scalar_one_or_none()

        sender_info = MessageParticipant(
            user_id=parent_id,
            full_name=sender_user.profile_data.get('full_name', 'Parent') if sender_user and sender_user.profile_data else 'Parent',
            role=sender_user.role if sender_user else 'parent',
            avatar_url=None,
        )

        # Try to broadcast via WebSocket (don't fail if unavailable)
        try:
            from app.websocket.parent_connection_manager import parent_ws_manager
            await parent_ws_manager.send_to_user(
                str(parent_id),
                {
                    "type": "new_message",
                    "conversation_id": str(conversation_id),
                    "message_id": str(message.id),
                    "channel": request.channel,
                    "content": request.content,
                }
            )
        except Exception as e:
            logger.debug(f"WebSocket broadcast skipped: {e}")

        return ParentMessageResponse(
            id=message.id,
            conversation_id=message.conversation_id,
            sender=sender_info,
            content=message.content,
            message_type=message.message_type,
            is_read=message.is_read,
            read_at=message.read_at,
            metadata_=message.metadata_,
            created_at=message.created_at,
        )

    async def get_support_articles(
        self,
        db: AsyncSession,
        category: Optional[str] = None,
        search: Optional[str] = None
    ) -> SupportArticlesResponse:
        """Get help articles"""

        # Placeholder - will be populated with actual help content
        return SupportArticlesResponse(
            articles=[],
            total_count=0,
            categories=["Getting Started", "Account", "Billing", "Technical", "Features"]
        )

    async def get_support_tickets(
        self,
        db: AsyncSession,
        parent_id: UUID,
        status: Optional[str] = None
    ) -> SupportTicketsListResponse:
        """Get support tickets"""

        # Placeholder - will be implemented with ticket system
        return SupportTicketsListResponse(
            tickets=[],
            total_count=0,
            open_count=0,
            resolved_count=0
        )

    async def create_support_ticket(
        self,
        db: AsyncSession,
        parent_id: UUID,
        request: CreateSupportTicketRequest
    ) -> SupportTicketResponse:
        """Create a support ticket"""

        # Generate a new conversation_id to group ticket messages
        conversation_id = uuid_mod.uuid4()
        ticket_id = uuid_mod.uuid4()
        now = datetime.utcnow()

        # Create a ParentMessage with channel='support' as the initial ticket message
        message = ParentMessage(
            id=ticket_id,
            conversation_id=conversation_id,
            sender_id=parent_id,
            recipient_id=None,  # Platform support
            channel='support',
            child_id=request.child_id,
            content=request.description,
            message_type='text',
            is_read=False,
            metadata_={
                'ticket': True,
                'subject': request.title,
                'category': request.category,
                'priority': request.priority,
                'status': 'open',
            },
            created_at=now,
        )

        db.add(message)
        await db.commit()
        await db.refresh(message)

        # Get sender info
        sender_result = await db.execute(
            select(User).where(User.id == parent_id)
        )
        sender_user = sender_result.scalar_one_or_none()

        sender_info = MessageParticipant(
            user_id=parent_id,
            full_name=sender_user.profile_data.get('full_name', 'Parent') if sender_user and sender_user.profile_data else 'Parent',
            role=sender_user.role if sender_user else 'parent',
            avatar_url=None,
        )

        # Get child name if applicable
        child_name = None
        if request.child_id:
            child_result = await db.execute(
                select(Student).where(Student.id == request.child_id)
            )
            child = child_result.scalar_one_or_none()
            if child and child.user:
                child_name = child.user.profile_data.get('full_name', 'Unknown')

        return SupportTicketResponse(
            id=message.id,
            parent_id=parent_id,
            child_id=request.child_id,
            child_name=child_name,
            title=request.title,
            description=request.description,
            category=request.category,
            priority=request.priority,
            status='open',
            assigned_to=None,
            messages=[],
            created_at=now,
            updated_at=now,
            resolved_at=None,
        )

    async def mark_message_read(
        self,
        db: AsyncSession,
        parent_id: UUID,
        message_id: UUID
    ) -> dict:
        """Mark a message as read"""

        result = await db.execute(
            select(ParentMessage).where(
                and_(
                    ParentMessage.id == message_id,
                    or_(
                        ParentMessage.recipient_id == parent_id,
                        ParentMessage.sender_id == parent_id,
                    )
                )
            )
        )
        message = result.scalar_one_or_none()

        if not message:
            raise ValueError("Message not found")

        message.is_read = True
        message.read_at = datetime.utcnow()
        await db.commit()

        return {"success": True, "message_id": str(message_id)}

    async def add_ticket_message(
        self,
        db: AsyncSession,
        parent_id: UUID,
        ticket_id: UUID,
        content: str
    ) -> dict:
        """Add a message to a support ticket"""

        # Find the original ticket message to get the conversation_id
        ticket_result = await db.execute(
            select(ParentMessage).where(
                and_(
                    ParentMessage.id == ticket_id,
                    ParentMessage.channel == 'support',
                )
            )
        )
        ticket_msg = ticket_result.scalar_one_or_none()

        if not ticket_msg:
            raise ValueError("Support ticket not found")

        # Create a new message in the same conversation
        new_message = ParentMessage(
            id=uuid_mod.uuid4(),
            conversation_id=ticket_msg.conversation_id,
            sender_id=parent_id,
            recipient_id=None,  # Platform support
            channel='support',
            child_id=ticket_msg.child_id,
            content=content,
            message_type='text',
            is_read=False,
            metadata_={'ticket_reply': True, 'ticket_id': str(ticket_id)},
            created_at=datetime.utcnow(),
        )

        db.add(new_message)
        await db.commit()
        await db.refresh(new_message)

        return {"success": True, "message_id": str(new_message.id)}


# Singleton instance
parent_communications_service = ParentCommunicationsService()
