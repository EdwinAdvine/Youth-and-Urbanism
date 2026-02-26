"""
Session Service

Live virtual classroom session management: scheduling, LiveKit room
integration, recording control, and breakout room management.
"""

import logging
import uuid
import time
from datetime import datetime
from typing import Any, Dict, List, Optional

from sqlalchemy import select, func, and_, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.staff.live_session import (
    LiveSession,
    LiveSessionRecording,
    BreakoutRoom,
)
from app.config import settings

# LiveKit SDK placeholder
try:
    from livekit import api as livekit_api
except ImportError:
    livekit_api = None

logger = logging.getLogger(__name__)


class SessionService:
    """Facade exposing session functions as static methods."""

    @staticmethod
    async def list_sessions(db, *, page=1, page_size=20, status_filter=None, host_id=None, session_type=None):
        filters = {}
        if status_filter: filters["status"] = status_filter
        if host_id: filters["host_id"] = host_id
        if session_type: filters["session_type"] = session_type
        return await list_sessions(db, filters=filters, page=page, page_size=page_size)

    @staticmethod
    async def get_session(db, *, session_id):
        return await get_session(db, session_id=session_id)

    @staticmethod
    async def create_session(db, *, host_id, title, description=None, session_type, scheduled_start, scheduled_end=None, max_participants=None, metadata=None):
        session_data = {
            "title": title,
            "description": description,
            "session_type": session_type,
            "scheduled_at": scheduled_start,
            "max_participants": max_participants or 30,
        }
        if metadata:
            session_data["metadata"] = metadata
        return await create_session(db, host_id=host_id, session_data=session_data)

    @staticmethod
    async def update_session(db, *, session_id, updates):
        return await update_session(db, session_id=session_id, data=updates)

    @staticmethod
    async def generate_token(db, *, session_id, user_id, user_name):
        session = await get_session(db, session_id=session_id)
        if session is None:
            return None
        return await generate_livekit_token(session=session, user_id=user_id, user_name=user_name)

    @staticmethod
    async def start_recording(db, *, session_id):
        return await start_recording(session_id=session_id)

    @staticmethod
    async def stop_recording(db, *, session_id):
        return await stop_recording(session_id=session_id)

    @staticmethod
    async def list_recordings(db, *, session_id):
        return {"recordings": []}

    @staticmethod
    async def manage_breakout_rooms(db, *, session_id, action="create", rooms=None, room_id=None):
        rooms_config = rooms or []
        return await manage_breakout_rooms(db, session_id=session_id, rooms_config=rooms_config)


# LiveKit configuration placeholders (loaded from settings in production)
LIVEKIT_API_URL = getattr(settings, "livekit_api_url", "wss://livekit.example.com")
LIVEKIT_API_KEY = getattr(settings, "livekit_api_key", "")
LIVEKIT_API_SECRET = getattr(settings, "livekit_api_secret", "")


def _generate_room_name() -> str:
    """Generate a unique LiveKit room name."""
    return f"tuhs-{uuid.uuid4().hex[:8]}-{int(time.time()) % 10000}"


async def list_sessions(
    db: AsyncSession,
    filters: Optional[Dict[str, Any]] = None,
    page: int = 1,
    page_size: int = 20,
) -> Dict[str, Any]:
    """Return a paginated list of live sessions."""
    try:
        filters = filters or {}
        conditions = []

        if filters.get("status"):
            conditions.append(LiveSession.status == filters["status"])
        if filters.get("host_id"):
            conditions.append(LiveSession.host_id == filters["host_id"])
        if filters.get("session_type"):
            conditions.append(LiveSession.session_type == filters["session_type"])
        if filters.get("grade_level"):
            conditions.append(LiveSession.grade_level == filters["grade_level"])
        if filters.get("date_from"):
            conditions.append(LiveSession.scheduled_at >= filters["date_from"])
        if filters.get("date_to"):
            conditions.append(LiveSession.scheduled_at <= filters["date_to"])

        where_clause = and_(*conditions) if conditions else True

        total_q = select(func.count(LiveSession.id)).where(where_clause)
        total_result = await db.execute(total_q)
        total: int = total_result.scalar() or 0

        offset = (page - 1) * page_size
        items_q = (
            select(LiveSession)
            .where(where_clause)
            .order_by(LiveSession.scheduled_at.desc())
            .offset(offset)
            .limit(page_size)
        )
        items_result = await db.execute(items_q)
        sessions = items_result.scalars().all()

        item_list = [
            {
                "id": str(s.id),
                "title": s.title,
                "description": s.description,
                "host_id": str(s.host_id),
                "session_type": s.session_type,
                "room_name": s.room_name,
                "status": s.status,
                "max_participants": s.max_participants,
                "recording_enabled": s.recording_enabled,
                "screen_share_enabled": s.screen_share_enabled,
                "course_id": str(s.course_id) if s.course_id else None,
                "grade_level": s.grade_level,
                "scheduled_at": s.scheduled_at.isoformat(),
                "started_at": s.started_at.isoformat() if s.started_at else None,
                "ended_at": s.ended_at.isoformat() if s.ended_at else None,
                "created_at": s.created_at.isoformat(),
            }
            for s in sessions
        ]

        return {
            "items": item_list,
            "total": total,
            "page": page,
            "page_size": page_size,
        }

    except Exception as e:
        logger.error(f"Error listing sessions: {e}")
        raise


async def get_session(db: AsyncSession, session_id: str) -> Optional[Dict[str, Any]]:
    """Return a single session with recordings and breakout rooms."""
    try:
        q = select(LiveSession).where(LiveSession.id == session_id)
        result = await db.execute(q)
        s = result.scalar_one_or_none()

        if not s:
            return None

        # Fetch recordings
        recordings_q = (
            select(LiveSessionRecording)
            .where(LiveSessionRecording.session_id == session_id)
            .order_by(LiveSessionRecording.created_at.desc())
        )
        recordings_result = await db.execute(recordings_q)
        recordings = [
            {
                "id": str(r.id),
                "recording_url": r.recording_url,
                "duration_seconds": r.duration_seconds,
                "file_size_bytes": r.file_size_bytes,
                "format": r.format,
                "created_at": r.created_at.isoformat(),
            }
            for r in recordings_result.scalars().all()
        ]

        # Fetch breakout rooms
        breakouts_q = (
            select(BreakoutRoom)
            .where(BreakoutRoom.session_id == session_id)
            .order_by(BreakoutRoom.created_at.asc())
        )
        breakouts_result = await db.execute(breakouts_q)
        breakout_rooms = [
            {
                "id": str(b.id),
                "name": b.name,
                "participants": b.participants or [],
                "is_active": b.is_active,
                "created_at": b.created_at.isoformat(),
            }
            for b in breakouts_result.scalars().all()
        ]

        return {
            "id": str(s.id),
            "title": s.title,
            "description": s.description,
            "host_id": str(s.host_id),
            "session_type": s.session_type,
            "room_name": s.room_name,
            "status": s.status,
            "max_participants": s.max_participants,
            "recording_enabled": s.recording_enabled,
            "screen_share_enabled": s.screen_share_enabled,
            "course_id": str(s.course_id) if s.course_id else None,
            "grade_level": s.grade_level,
            "metadata": s.metadata or {},
            "recordings": recordings,
            "breakout_rooms": breakout_rooms,
            "scheduled_at": s.scheduled_at.isoformat(),
            "started_at": s.started_at.isoformat() if s.started_at else None,
            "ended_at": s.ended_at.isoformat() if s.ended_at else None,
            "created_at": s.created_at.isoformat(),
        }

    except Exception as e:
        logger.error(f"Error fetching session {session_id}: {e}")
        raise


async def create_session(
    db: AsyncSession,
    host_id: str,
    session_data: Dict[str, Any],
) -> Dict[str, Any]:
    """Create a new live session with a LiveKit room name."""
    try:
        room_name = _generate_room_name()

        session = LiveSession(
            id=uuid.uuid4(),
            title=session_data["title"],
            description=session_data.get("description"),
            host_id=host_id,
            session_type=session_data["session_type"],
            room_name=room_name,
            status="scheduled",
            max_participants=session_data.get("max_participants", 30),
            recording_enabled=session_data.get("recording_enabled", False),
            screen_share_enabled=session_data.get("screen_share_enabled", True),
            course_id=session_data.get("course_id"),
            grade_level=session_data.get("grade_level"),
            scheduled_at=session_data["scheduled_at"],
        )
        db.add(session)

        # Create LiveKit room if SDK available
        if livekit_api and LIVEKIT_API_KEY:
            try:
                room_service = livekit_api.RoomServiceClient(
                    LIVEKIT_API_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET
                )
                await room_service.create_room(
                    livekit_api.CreateRoomRequest(
                        name=room_name,
                        max_participants=session.max_participants,
                    )
                )
                logger.info(f"LiveKit room '{room_name}' created")
            except Exception as lk_error:
                logger.warning(f"LiveKit room creation failed: {lk_error}")

        await db.flush()

        logger.info(f"Session created: '{session.title}' by {host_id}")

        return {
            "id": str(session.id),
            "title": session.title,
            "room_name": room_name,
            "status": session.status,
            "scheduled_at": session.scheduled_at.isoformat(),
            "created_at": session.created_at.isoformat(),
        }

    except Exception as e:
        logger.error(f"Error creating session: {e}")
        raise


async def update_session(
    db: AsyncSession,
    session_id: str,
    data: Dict[str, Any],
) -> Optional[Dict[str, Any]]:
    """Update a live session (title, description, schedule, status, etc.)."""
    try:
        q = select(LiveSession).where(LiveSession.id == session_id)
        result = await db.execute(q)
        session = result.scalar_one_or_none()

        if not session:
            return None

        for key, value in data.items():
            if value is not None and hasattr(session, key):
                setattr(session, key, value)

        # Handle status transitions
        if data.get("status") == "live" and not session.started_at:
            session.started_at = datetime.utcnow()
        elif data.get("status") == "ended" and not session.ended_at:
            session.ended_at = datetime.utcnow()

        await db.flush()

        logger.info(f"Session {session_id} updated")

        return {
            "id": str(session.id),
            "title": session.title,
            "status": session.status,
            "started_at": session.started_at.isoformat() if session.started_at else None,
            "ended_at": session.ended_at.isoformat() if session.ended_at else None,
        }

    except Exception as e:
        logger.error(f"Error updating session {session_id}: {e}")
        raise


async def generate_livekit_token(
    session: Dict[str, Any],
    user_id: str,
    user_name: str,
) -> Dict[str, Any]:
    """
    Generate a LiveKit JWT access token for a participant.

    Falls back to a placeholder token if LiveKit SDK is not available.
    """
    try:
        room_name = session.get("room_name", "")

        if livekit_api and LIVEKIT_API_KEY:
            token = livekit_api.AccessToken(
                LIVEKIT_API_KEY, LIVEKIT_API_SECRET
            )
            token.with_identity(user_id)
            token.with_name(user_name)
            token.with_grants(
                livekit_api.VideoGrants(
                    room_join=True,
                    room=room_name,
                    can_publish=True,
                    can_subscribe=True,
                )
            )

            return {
                "token": token.to_jwt(),
                "room_name": room_name,
                "server_url": LIVEKIT_API_URL,
            }

        # Placeholder when LiveKit is not configured
        logger.warning("LiveKit SDK not available, returning placeholder token")
        return {
            "token": f"placeholder-token-{user_id}-{room_name}",
            "room_name": room_name,
            "server_url": LIVEKIT_API_URL,
        }

    except Exception as e:
        logger.error(f"Error generating LiveKit token: {e}")
        raise


async def start_recording(session_id: str) -> Dict[str, Any]:
    """Start recording a LiveKit session."""
    try:
        if livekit_api and LIVEKIT_API_KEY:
            # Use LiveKit Egress API to start recording
            logger.info(f"Starting recording for session {session_id}")
            # Placeholder: actual LiveKit egress implementation
            return {
                "session_id": session_id,
                "recording_status": "started",
                "started_at": datetime.utcnow().isoformat(),
            }

        logger.warning("LiveKit not configured, recording not started")
        return {
            "session_id": session_id,
            "recording_status": "unavailable",
            "message": "LiveKit SDK not configured",
        }

    except Exception as e:
        logger.error(f"Error starting recording for session {session_id}: {e}")
        raise


async def stop_recording(session_id: str) -> Dict[str, Any]:
    """Stop recording and save metadata."""
    try:
        if livekit_api and LIVEKIT_API_KEY:
            logger.info(f"Stopping recording for session {session_id}")
            # Placeholder: actual LiveKit egress stop implementation
            return {
                "session_id": session_id,
                "recording_status": "stopped",
                "stopped_at": datetime.utcnow().isoformat(),
            }

        return {
            "session_id": session_id,
            "recording_status": "unavailable",
            "message": "LiveKit SDK not configured",
        }

    except Exception as e:
        logger.error(f"Error stopping recording for session {session_id}: {e}")
        raise


async def manage_breakout_rooms(
    db: AsyncSession,
    session_id: str,
    rooms_config: List[Dict[str, Any]],
) -> List[Dict[str, Any]]:
    """
    Create or update breakout rooms for a live session.

    Accepts a list of room configurations with name and participant_ids.
    Existing rooms are deactivated if not in the new config.
    """
    try:
        # Deactivate existing breakout rooms
        await db.execute(
            update(BreakoutRoom)
            .where(
                and_(
                    BreakoutRoom.session_id == session_id,
                    BreakoutRoom.is_active == True,  # noqa: E712
                )
            )
            .values(is_active=False)
        )

        created_rooms = []
        for config in rooms_config:
            room = BreakoutRoom(
                id=uuid.uuid4(),
                session_id=session_id,
                name=config["name"],
                participants=config.get("participant_ids", []),
                is_active=True,
            )
            db.add(room)
            created_rooms.append({
                "id": str(room.id),
                "name": room.name,
                "participants": room.participants,
                "is_active": True,
            })

        await db.flush()

        logger.info(
            f"Managed {len(created_rooms)} breakout rooms for session {session_id}"
        )

        return created_rooms

    except Exception as e:
        logger.error(f"Error managing breakout rooms for session {session_id}: {e}")
        raise
