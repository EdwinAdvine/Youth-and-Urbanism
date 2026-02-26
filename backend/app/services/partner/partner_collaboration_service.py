"""
Partner Collaboration Service

Messaging and meeting scheduling between partners and instructors/parents.
Uses async SQLAlchemy queries against PartnerMessage and PartnerMeeting models.
"""

import logging
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from sqlalchemy import select, and_, or_, desc, asc
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.partner.partner_collaboration import (
    PartnerMessage,
    PartnerMeeting,
    MeetingStatus,
)
from app.models.user import User

logger = logging.getLogger(__name__)


async def send_message(
    db: AsyncSession,
    sender_id: str,
    recipient_id: str,
    message_data: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Send a message from a partner to an instructor, parent, or staff member.

    Creates a new PartnerMessage record with the provided subject, body,
    and optional attachments. Supports threaded conversations via
    parent_message_id in message_data.

    Args:
        db: Async database session.
        sender_id: UUID string of the sending partner.
        recipient_id: UUID string of the recipient user.
        message_data: Dict containing subject, body, and optional attachments
                      and parent_message_id for threading.

    Returns:
        Dict with the created message details.
    """
    try:
        sender_uuid = uuid.UUID(sender_id)
        recipient_uuid = uuid.UUID(recipient_id)

        parent_message_id = message_data.get("parent_message_id")
        parent_msg_uuid = uuid.UUID(parent_message_id) if parent_message_id else None

        new_message = PartnerMessage(
            partner_id=sender_uuid,
            recipient_id=recipient_uuid,
            subject=message_data.get("subject", ""),
            body=message_data.get("body", ""),
            attachments=message_data.get("attachments", []),
            parent_message_id=parent_msg_uuid,
        )

        db.add(new_message)
        await db.commit()
        await db.refresh(new_message)

        # Look up sender and recipient names for the response
        sender_name = await _get_user_display_name(db, sender_uuid)
        recipient_name = await _get_user_display_name(db, recipient_uuid)

        return {
            "id": str(new_message.id),
            "sender_id": str(new_message.partner_id),
            "sender_name": sender_name,
            "recipient_id": str(new_message.recipient_id),
            "recipient_name": recipient_name,
            "subject": new_message.subject,
            "body": new_message.body,
            "attachments": new_message.attachments or [],
            "parent_message_id": str(new_message.parent_message_id) if new_message.parent_message_id else None,
            "read_at": None,
            "is_archived": False,
            "created_at": new_message.created_at.isoformat(),
        }

    except Exception as e:
        await db.rollback()
        logger.error(f"Error sending message from {sender_id} to {recipient_id}: {e}")
        raise


async def get_messages(
    db: AsyncSession,
    user_id: str,
    conversation_id: Optional[str] = None,
    limit: int = 50,
) -> List[Dict[str, Any]]:
    """
    Get messages for a user, optionally filtered by conversation thread.

    Retrieves messages where the user is either the sender (partner_id) or
    the recipient. Results are ordered by created_at descending.

    Args:
        db: Async database session.
        user_id: UUID string of the user requesting messages.
        conversation_id: Optional parent_message_id to filter a conversation thread.
        limit: Maximum number of messages to return (default 50).

    Returns:
        List of message dicts ordered by most recent first.
    """
    try:
        user_uuid = uuid.UUID(user_id)

        # Base filter: user is sender or recipient
        user_filter = or_(
            PartnerMessage.partner_id == user_uuid,
            PartnerMessage.recipient_id == user_uuid,
        )

        if conversation_id:
            conv_uuid = uuid.UUID(conversation_id)
            # Include the parent message itself and all replies in the thread
            thread_filter = or_(
                PartnerMessage.id == conv_uuid,
                PartnerMessage.parent_message_id == conv_uuid,
            )
            stmt = (
                select(PartnerMessage)
                .where(and_(user_filter, thread_filter))
                .order_by(desc(PartnerMessage.created_at))
                .limit(limit)
            )
        else:
            stmt = (
                select(PartnerMessage)
                .where(user_filter)
                .order_by(desc(PartnerMessage.created_at))
                .limit(limit)
            )

        result = await db.execute(stmt)
        messages = result.scalars().all()

        # Collect unique user IDs for batch name lookup
        user_ids: set = set()
        for msg in messages:
            user_ids.add(msg.partner_id)
            user_ids.add(msg.recipient_id)

        name_map = await _get_user_display_names_batch(db, user_ids)

        return [
            {
                "id": str(msg.id),
                "sender_id": str(msg.partner_id),
                "sender_name": name_map.get(msg.partner_id, "Unknown"),
                "recipient_id": str(msg.recipient_id),
                "recipient_name": name_map.get(msg.recipient_id, "Unknown"),
                "subject": msg.subject,
                "body": msg.body,
                "attachments": msg.attachments or [],
                "parent_message_id": str(msg.parent_message_id) if msg.parent_message_id else None,
                "read_at": msg.read_at.isoformat() if msg.read_at else None,
                "is_archived": msg.is_archived,
                "created_at": msg.created_at.isoformat(),
            }
            for msg in messages
        ]

    except Exception as e:
        logger.error(f"Error fetching messages for user {user_id}: {e}")
        raise


async def schedule_meeting(
    db: AsyncSession,
    organizer_id: str,
    meeting_data: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Schedule a new meeting between a partner and stakeholders.

    Creates a PartnerMeeting record with the provided details.
    The scheduled_at value should be an ISO-format datetime string or a
    datetime object.

    Args:
        db: Async database session.
        organizer_id: UUID string of the partner organizing the meeting.
        meeting_data: Dict containing title, description, scheduled_at,
                      duration_minutes, meeting_url, location, and attendees.

    Returns:
        Dict with the created meeting details.
    """
    try:
        organizer_uuid = uuid.UUID(organizer_id)

        scheduled_at = meeting_data.get("scheduled_at")
        if isinstance(scheduled_at, str):
            scheduled_at = datetime.fromisoformat(scheduled_at)

        new_meeting = PartnerMeeting(
            partner_id=organizer_uuid,
            title=meeting_data.get("title", ""),
            description=meeting_data.get("description"),
            scheduled_at=scheduled_at,
            duration_minutes=meeting_data.get("duration_minutes", 60),
            meeting_url=meeting_data.get("meeting_url"),
            location=meeting_data.get("location"),
            attendees=meeting_data.get("attendees", []),
            status=MeetingStatus.SCHEDULED,
            ai_suggested=meeting_data.get("ai_suggested", False),
            ai_agenda=meeting_data.get("ai_agenda"),
            notes=meeting_data.get("notes"),
        )

        db.add(new_meeting)
        await db.commit()
        await db.refresh(new_meeting)

        organizer_name = await _get_user_display_name(db, organizer_uuid)

        return {
            "id": str(new_meeting.id),
            "organizer_id": str(new_meeting.partner_id),
            "organizer_name": organizer_name,
            "title": new_meeting.title,
            "description": new_meeting.description,
            "scheduled_at": new_meeting.scheduled_at.isoformat(),
            "duration_minutes": new_meeting.duration_minutes,
            "meeting_url": new_meeting.meeting_url,
            "location": new_meeting.location,
            "attendees": new_meeting.attendees or [],
            "status": new_meeting.status.value,
            "ai_suggested": new_meeting.ai_suggested,
            "ai_agenda": new_meeting.ai_agenda,
            "notes": new_meeting.notes,
            "created_at": new_meeting.created_at.isoformat(),
        }

    except Exception as e:
        await db.rollback()
        logger.error(f"Error scheduling meeting for organizer {organizer_id}: {e}")
        raise


async def get_meetings(
    db: AsyncSession,
    user_id: str,
    upcoming_only: bool = True,
) -> List[Dict[str, Any]]:
    """
    Get meetings for a partner user.

    When upcoming_only is True, returns only meetings that are scheduled
    in the future and have SCHEDULED status. Otherwise returns all meetings.

    Args:
        db: Async database session.
        user_id: UUID string of the partner user.
        upcoming_only: If True, filter to future scheduled meetings only.

    Returns:
        List of meeting dicts ordered by scheduled_at ascending.
    """
    try:
        user_uuid = uuid.UUID(user_id)
        now = datetime.utcnow()

        if upcoming_only:
            stmt = (
                select(PartnerMeeting)
                .where(
                    and_(
                        PartnerMeeting.partner_id == user_uuid,
                        PartnerMeeting.scheduled_at >= now,
                        PartnerMeeting.status == MeetingStatus.SCHEDULED,
                    )
                )
                .order_by(asc(PartnerMeeting.scheduled_at))
            )
        else:
            stmt = (
                select(PartnerMeeting)
                .where(PartnerMeeting.partner_id == user_uuid)
                .order_by(asc(PartnerMeeting.scheduled_at))
            )

        result = await db.execute(stmt)
        meetings = result.scalars().all()

        organizer_name = await _get_user_display_name(db, user_uuid)

        return [
            {
                "id": str(meeting.id),
                "organizer_id": str(meeting.partner_id),
                "organizer_name": organizer_name,
                "title": meeting.title,
                "description": meeting.description,
                "scheduled_at": meeting.scheduled_at.isoformat(),
                "duration_minutes": meeting.duration_minutes,
                "meeting_url": meeting.meeting_url,
                "location": meeting.location,
                "attendees": meeting.attendees or [],
                "status": meeting.status.value,
                "ai_suggested": meeting.ai_suggested,
                "ai_agenda": meeting.ai_agenda,
                "notes": meeting.notes,
                "created_at": meeting.created_at.isoformat(),
            }
            for meeting in meetings
        ]

    except Exception as e:
        logger.error(f"Error fetching meetings for user {user_id}: {e}")
        raise


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------


async def _get_user_display_name(db: AsyncSession, user_id: uuid.UUID) -> str:
    """
    Look up a user's display name from the User model.

    Attempts to build a full name from profile_data fields (first_name,
    last_name). Falls back to the email address if profile data is absent.

    Args:
        db: Async database session.
        user_id: UUID of the user.

    Returns:
        A display name string, or "Unknown" if the user is not found.
    """
    try:
        stmt = select(User).where(User.id == user_id)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()

        if user is None:
            return "Unknown"

        profile = user.profile_data or {}
        first_name = profile.get("first_name", "")
        last_name = profile.get("last_name", "")
        full_name = f"{first_name} {last_name}".strip()

        return full_name if full_name else user.email

    except Exception as e:
        logger.warning(f"Could not resolve display name for user {user_id}: {e}")
        return "Unknown"


async def _get_user_display_names_batch(
    db: AsyncSession,
    user_ids: set,
) -> Dict[uuid.UUID, str]:
    """
    Batch-fetch display names for a set of user UUIDs.

    Performs a single query to retrieve all requested users and builds
    a mapping of UUID -> display name.

    Args:
        db: Async database session.
        user_ids: Set of user UUIDs to look up.

    Returns:
        Dict mapping each UUID to its display name string.
    """
    if not user_ids:
        return {}

    try:
        stmt = select(User).where(User.id.in_(user_ids))
        result = await db.execute(stmt)
        users = result.scalars().all()

        name_map: Dict[uuid.UUID, str] = {}
        for user in users:
            profile = user.profile_data or {}
            first_name = profile.get("first_name", "")
            last_name = profile.get("last_name", "")
            full_name = f"{first_name} {last_name}".strip()
            name_map[user.id] = full_name if full_name else user.email

        return name_map

    except Exception as e:
        logger.warning(f"Could not batch-resolve display names: {e}")
        return {}
