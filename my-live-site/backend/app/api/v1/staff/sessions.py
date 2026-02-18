"""
Staff Sessions API Endpoints

Provides REST endpoints for managing live sessions (classes, tutorials,
workshops):
- CRUD operations on sessions
- LiveKit token generation for WebRTC joining
- Recording start / stop and listing
- Breakout room management

All endpoints require staff or admin role access.
"""

import logging
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.utils.permissions import verify_staff_or_admin_access

from app.services.staff.session_service import SessionService

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Staff Sessions"])


# ------------------------------------------------------------------
# Pydantic request models
# ------------------------------------------------------------------
class CreateSessionRequest(BaseModel):
    """Payload for creating a new session."""
    title: str
    description: Optional[str] = None
    session_type: str  # 'class' | 'tutorial' | 'workshop' | 'webinar'
    scheduled_start: str  # ISO-8601
    scheduled_end: str  # ISO-8601
    max_participants: Optional[int] = None
    metadata: Optional[Dict[str, Any]] = None


class UpdateSessionRequest(BaseModel):
    """Payload for updating a session."""
    title: Optional[str] = None
    description: Optional[str] = None
    session_type: Optional[str] = None
    scheduled_start: Optional[str] = None
    scheduled_end: Optional[str] = None
    status: Optional[str] = None
    max_participants: Optional[int] = None
    metadata: Optional[Dict[str, Any]] = None


class BreakoutRoomRequest(BaseModel):
    """Payload for managing breakout rooms."""
    action: str  # 'create' | 'close' | 'reassign'
    rooms: Optional[List[Dict[str, Any]]] = None
    room_id: Optional[str] = None


# ------------------------------------------------------------------
# GET /
# ------------------------------------------------------------------
@router.get("/")
async def list_sessions(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = Query(None, alias="status"),
    host_id: Optional[str] = Query(None),
    session_type: Optional[str] = Query(None),
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Paginated list of sessions.

    Supports filtering by status, host_id, and session_type.
    """
    try:
        data = await SessionService.list_sessions(
            db,
            page=page,
            page_size=page_size,
            status_filter=status_filter,
            host_id=host_id,
            session_type=session_type,
        )
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to list sessions")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list sessions.",
        ) from exc


# ------------------------------------------------------------------
# GET /{session_id}
# ------------------------------------------------------------------
@router.get("/{session_id}")
async def get_session(
    session_id: str,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Retrieve a single session with participant details."""
    try:
        data = await SessionService.get_session(db, session_id=session_id)
        if data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found.",
            )
        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to fetch session %s", session_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch session.",
        ) from exc


# ------------------------------------------------------------------
# POST /
# ------------------------------------------------------------------
@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_session(
    body: CreateSessionRequest,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Create a new live session."""
    try:
        host_id = current_user.get("id") or current_user.get("user_id")
        data = await SessionService.create_session(
            db,
            host_id=host_id,
            title=body.title,
            description=body.description,
            session_type=body.session_type,
            scheduled_start=body.scheduled_start,
            scheduled_end=body.scheduled_end,
            max_participants=body.max_participants,
            metadata=body.metadata,
        )
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to create session")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create session.",
        ) from exc


# ------------------------------------------------------------------
# PATCH /{session_id}
# ------------------------------------------------------------------
@router.patch("/{session_id}")
async def update_session(
    session_id: str,
    body: UpdateSessionRequest,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Update an existing session."""
    try:
        updates = body.model_dump(exclude_unset=True)
        data = await SessionService.update_session(
            db, session_id=session_id, updates=updates
        )
        if data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found.",
            )
        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to update session %s", session_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update session.",
        ) from exc


# ------------------------------------------------------------------
# POST /{session_id}/token
# ------------------------------------------------------------------
@router.post("/{session_id}/token")
async def generate_join_token(
    session_id: str,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Generate a LiveKit token for joining the session.

    Returns the token and the WebSocket connection URL.
    """
    try:
        user_id = current_user.get("id") or current_user.get("user_id")
        user_name = current_user.get("email", "Staff Member")
        data = await SessionService.generate_token(
            db,
            session_id=session_id,
            user_id=user_id,
            user_name=user_name,
        )
        if data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found.",
            )
        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to generate token for session %s", session_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate session token.",
        ) from exc


# ------------------------------------------------------------------
# POST /{session_id}/recording/start
# ------------------------------------------------------------------
@router.post("/{session_id}/recording/start")
async def start_recording(
    session_id: str,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Start recording the session."""
    try:
        data = await SessionService.start_recording(db, session_id=session_id)
        if data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found.",
            )
        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to start recording for session %s", session_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to start recording.",
        ) from exc


# ------------------------------------------------------------------
# POST /{session_id}/recording/stop
# ------------------------------------------------------------------
@router.post("/{session_id}/recording/stop")
async def stop_recording(
    session_id: str,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Stop recording the session."""
    try:
        data = await SessionService.stop_recording(db, session_id=session_id)
        if data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found.",
            )
        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to stop recording for session %s", session_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to stop recording.",
        ) from exc


# ------------------------------------------------------------------
# GET /{session_id}/recordings
# ------------------------------------------------------------------
@router.get("/{session_id}/recordings")
async def list_recordings(
    session_id: str,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """List all recordings for a session."""
    try:
        data = await SessionService.list_recordings(db, session_id=session_id)
        if data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found.",
            )
        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to list recordings for session %s", session_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list recordings.",
        ) from exc


# ------------------------------------------------------------------
# POST /{session_id}/breakout-rooms
# ------------------------------------------------------------------
@router.post("/{session_id}/breakout-rooms")
async def manage_breakout_rooms(
    session_id: str,
    body: BreakoutRoomRequest,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Manage breakout rooms for a session.

    Actions: create, close, reassign.
    """
    try:
        data = await SessionService.manage_breakout_rooms(
            db,
            session_id=session_id,
            action=body.action,
            rooms=body.rooms,
            room_id=body.room_id,
        )
        if data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found.",
            )
        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception(
            "Failed to manage breakout rooms for session %s", session_id
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to manage breakout rooms.",
        ) from exc
