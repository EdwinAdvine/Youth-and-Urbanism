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
        """Get list of conversations grouped by conversation_id"""

        # Build filters
        filters = [
            or_(
                ParentMessage.sender_id == parent_id,
                ParentMessage.recipient_id == parent_id
            )
        ]
        if channel:
            filters.append(ParentMessage.channel == channel)
        # Exclude support ticket messages from general conversations
        if not channel:
            filters.append(ParentMessage.channel != 'support')

        # Get all messages for parent
        result = await db.execute(
            select(ParentMessage)
            .where(and_(*filters))
            .order_by(desc(ParentMessage.created_at))
        )
        messages = result.scalars().all()

        # Group by conversation_id
        conversations_map = {}
        for msg in messages:
            conv_id = str(msg.conversation_id)
            if conv_id not in conversations_map:
                conversations_map[conv_id] = {
                    'messages': [],
                    'channel': msg.channel,
                    'last_message': msg,
                    'unread': 0,
                }
            conversations_map[conv_id]['messages'].append(msg)
            if not msg.is_read and msg.recipient_id == parent_id:
                conversations_map[conv_id]['unread'] += 1

        # Build conversation summaries
        conversation_summaries = []
        for conv_id, conv_data in conversations_map.items():
            last_msg = conv_data['last_message']

            # Get other participant
            other_id = last_msg.recipient_id if last_msg.sender_id == parent_id else last_msg.sender_id
            other_name = "Platform"
            other_role = "system"
            if other_id:
                other_result = await db.execute(
                    select(User).where(User.id == other_id)
                )
                other_user = other_result.scalar_one_or_none()
                if other_user:
                    other_name = other_user.profile_data.get('full_name', 'Unknown') if other_user.profile_data else 'Unknown'
                    other_role = other_user.role

            # Get child name if applicable
            child_name = None
            if last_msg.child_id:
                child_result = await db.execute(
                    select(Student).where(Student.id == last_msg.child_id)
                )
                child = child_result.scalar_one_or_none()
                if child and child.user:
                    child_name = child.user.profile_data.get('full_name', 'Unknown')

            conversation_summaries.append(ConversationSummary(
                conversation_id=last_msg.conversation_id,
                channel=conv_data['channel'],
                other_participant=MessageParticipant(
                    user_id=other_id or parent_id,
                    full_name=other_name,
                    role=other_role,
                    avatar_url=None,
                ),
                child_name=child_name,
                last_message_preview=last_msg.content[:100] if last_msg.content else '',
                last_message_at=last_msg.created_at,
                unread_count=conv_data['unread'],
                total_messages=len(conv_data['messages']),
            ))

        return ConversationsListResponse(
            conversations=conversation_summaries,
            total_count=len(conversation_summaries)
        )

    async def get_conversation_messages(
        self,
        db: AsyncSession,
        parent_id: UUID,
        conversation_id: UUID
    ) -> ConversationMessagesResponse:
        """Get messages in a conversation"""

        result = await db.execute(
            select(ParentMessage)
            .where(ParentMessage.conversation_id == conversation_id)
            .order_by(ParentMessage.created_at)
        )
        messages = result.scalars().all()

        channel = messages[0].channel if messages else "ai_tutor"

        # Build participant set
        participant_ids = set()
        for msg in messages:
            participant_ids.add(msg.sender_id)
            if msg.recipient_id:
                participant_ids.add(msg.recipient_id)

        participants = []
        for pid in participant_ids:
            user_result = await db.execute(select(User).where(User.id == pid))
            user = user_result.scalar_one_or_none()
            if user:
                participants.append(MessageParticipant(
                    user_id=user.id,
                    full_name=user.profile_data.get('full_name', 'Unknown') if user.profile_data else 'Unknown',
                    role=user.role,
                    avatar_url=None,
                ))

        # Build message responses
        msg_responses = []
        for msg in messages:
            sender_result = await db.execute(select(User).where(User.id == msg.sender_id))
            sender = sender_result.scalar_one_or_none()
            sender_info = MessageParticipant(
                user_id=msg.sender_id,
                full_name=sender.profile_data.get('full_name', 'Unknown') if sender and sender.profile_data else 'Unknown',
                role=sender.role if sender else 'parent',
                avatar_url=None,
            )
            msg_responses.append(ParentMessageResponse(
                id=msg.id,
                conversation_id=msg.conversation_id,
                sender=sender_info,
                content=msg.content,
                message_type=msg.message_type,
                is_read=msg.is_read,
                read_at=msg.read_at,
                metadata_=msg.metadata_,
                created_at=msg.created_at,
            ))

        return ConversationMessagesResponse(
            conversation_id=conversation_id,
            channel=channel,
            participants=participants,
            messages=msg_responses,
            total_count=len(msg_responses)
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

        # Static support articles
        all_articles = [
            SupportArticle(
                id="sa-1", title="Getting Started with Urban Home School",
                category="Getting Started", content="Learn how to set up your family account, add children, and explore the platform features.",
                helpful_count=42, created_at=datetime.utcnow()
            ),
            SupportArticle(
                id="sa-2", title="How AI Tutoring Works",
                category="Features", content="Your child gets a personalized AI companion that adapts to their learning style, pace, and interests.",
                helpful_count=38, created_at=datetime.utcnow()
            ),
            SupportArticle(
                id="sa-3", title="Understanding CBC Competencies",
                category="Features", content="The platform tracks seven CBC competencies: Communication, Critical Thinking, Creativity, Collaboration, Citizenship, Digital Literacy, and Learning to Learn.",
                helpful_count=35, created_at=datetime.utcnow()
            ),
            SupportArticle(
                id="sa-4", title="Managing Subscription & Billing",
                category="Billing", content="View your subscription plan, payment history, and manage add-ons from the Finance section of your dashboard.",
                helpful_count=30, created_at=datetime.utcnow()
            ),
            SupportArticle(
                id="sa-5", title="Setting Data Consent Preferences",
                category="Account", content="Control what data is collected and shared for each child through the Consent Matrix in Settings.",
                helpful_count=25, created_at=datetime.utcnow()
            ),
            SupportArticle(
                id="sa-6", title="Troubleshooting Login Issues",
                category="Technical", content="If you're having trouble logging in, try resetting your password or clearing your browser cache.",
                helpful_count=22, created_at=datetime.utcnow()
            ),
        ]

        # Filter by category
        if category:
            all_articles = [a for a in all_articles if a.category == category]

        # Filter by search
        if search:
            search_lower = search.lower()
            all_articles = [
                a for a in all_articles
                if search_lower in a.title.lower() or search_lower in a.content.lower()
            ]

        return SupportArticlesResponse(
            articles=all_articles,
            total_count=len(all_articles),
            categories=["Getting Started", "Account", "Billing", "Technical", "Features"]
        )

    async def get_support_tickets(
        self,
        db: AsyncSession,
        parent_id: UUID,
        status: Optional[str] = None
    ) -> SupportTicketsListResponse:
        """Get support tickets (stored as ParentMessage with channel='support' and metadata ticket=True)"""

        # Find ticket messages (initial messages with ticket metadata)
        filters = [
            ParentMessage.sender_id == parent_id,
            ParentMessage.channel == 'support',
        ]

        result = await db.execute(
            select(ParentMessage)
            .where(and_(*filters))
            .order_by(desc(ParentMessage.created_at))
        )
        all_support_msgs = result.scalars().all()

        # Group: ticket root messages have metadata_.ticket = True
        ticket_roots = [m for m in all_support_msgs if m.metadata_ and m.metadata_.get('ticket')]

        if status:
            ticket_roots = [
                t for t in ticket_roots
                if t.metadata_.get('status') == status
            ]

        tickets = []
        open_count = 0
        resolved_count = 0

        for ticket_msg in ticket_roots:
            meta = ticket_msg.metadata_ or {}
            ticket_status = meta.get('status', 'open')

            if ticket_status == 'open':
                open_count += 1
            elif ticket_status == 'resolved':
                resolved_count += 1

            # Get child name if applicable
            child_name = None
            if ticket_msg.child_id:
                child_result = await db.execute(
                    select(Student).where(Student.id == ticket_msg.child_id)
                )
                child = child_result.scalar_one_or_none()
                if child and child.user:
                    child_name = child.user.profile_data.get('full_name', 'Unknown')

            # Get replies for this ticket
            reply_result = await db.execute(
                select(ParentMessage).where(
                    and_(
                        ParentMessage.conversation_id == ticket_msg.conversation_id,
                        ParentMessage.id != ticket_msg.id,
                    )
                ).order_by(ParentMessage.created_at)
            )
            replies = reply_result.scalars().all()

            reply_messages = []
            for reply in replies:
                sender_result = await db.execute(
                    select(User).where(User.id == reply.sender_id)
                )
                sender_user = sender_result.scalar_one_or_none()
                sender_info = MessageParticipant(
                    user_id=reply.sender_id,
                    full_name=sender_user.profile_data.get('full_name', 'Unknown') if sender_user and sender_user.profile_data else 'Unknown',
                    role=sender_user.role if sender_user else 'parent',
                    avatar_url=None,
                )
                reply_messages.append(ParentMessageResponse(
                    id=reply.id,
                    conversation_id=reply.conversation_id,
                    sender=sender_info,
                    content=reply.content,
                    message_type=reply.message_type,
                    is_read=reply.is_read,
                    read_at=reply.read_at,
                    metadata_=reply.metadata_,
                    created_at=reply.created_at,
                ))

            tickets.append(SupportTicketResponse(
                id=ticket_msg.id,
                parent_id=parent_id,
                child_id=ticket_msg.child_id,
                child_name=child_name,
                title=meta.get('subject', 'Support Request'),
                description=ticket_msg.content,
                category=meta.get('category', 'general'),
                priority=meta.get('priority', 'medium'),
                status=ticket_status,
                assigned_to=meta.get('assigned_to'),
                messages=reply_messages,
                created_at=ticket_msg.created_at,
                updated_at=ticket_msg.created_at,
                resolved_at=None,
            ))

        return SupportTicketsListResponse(
            tickets=tickets,
            total_count=len(tickets),
            open_count=open_count,
            resolved_count=resolved_count
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
