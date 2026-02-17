"""
CoPilot API Routes

Provides AI-powered conversational assistance for all authenticated users.
Each user has their own dedicated AI agent that adapts to their role and preferences.

Features:
- Role-specific AI assistance (student, parent, instructor, admin, staff, partner)
- Multi-modal responses (text, voice, video)
- Persistent conversation sessions with auto-generated titles
- Real-time streaming responses via Server-Sent Events
- Contextual insights and tips based on user activity
- Customizable AI agent profiles (name, persona, expertise)

Endpoints:
- POST /chat - Send message and get AI response
- POST /chat/stream - Send message with SSE streaming response
- GET /sessions - List user's conversation sessions
- GET /sessions/{id} - Get session details with messages
- PATCH /sessions/{id} - Update session metadata
- DELETE /sessions/{id} - Soft-delete a session
- GET /insights - Get role-specific contextual insights
"""

import logging
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.schemas.copilot_schemas import (
    CopilotChatRequest,
    CopilotChatResponse,
    CopilotSessionList,
    CopilotSessionDetail,
    CopilotSessionUpdate,
    CopilotInsightsResponse
)
from app.services.copilot_service import CopilotService
from app.services.copilot_insights_service import CopilotInsightsService
from app.utils.security import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/copilot", tags=["CoPilot"])

# Service instances
copilot_service = CopilotService()
insights_service = CopilotInsightsService()


@router.post("/chat", response_model=CopilotChatResponse)
async def chat_with_copilot(
    request: CopilotChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> CopilotChatResponse:
    """
    Send a message to the AI CoPilot and receive a response.

    This endpoint handles the core chat functionality:
    - Creates a new session if session_id is null
    - Loads user's custom AI agent profile (name, persona, expertise)
    - Builds role-specific system prompt
    - Routes query to appropriate AI provider (Gemini, Claude, etc.)
    - Saves user message and AI response to database
    - Auto-generates session title from first message
    - Supports text, voice, and video response modes

    Args:
        request: Chat request with message and optional session ID
        db: Database session
        current_user: Authenticated user

    Returns:
        CopilotChatResponse with AI's message and session info

    Raises:
        HTTPException: If chat processing fails
    """
    try:
        logger.info(
            f"Chat request from user {current_user.id} "
            f"(role: {current_user.role}, mode: {request.response_mode})"
        )

        response = await copilot_service.chat(db, current_user, request)
        return response

    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process chat request: {str(e)}"
        )


@router.post("/chat/stream")
async def chat_with_copilot_stream(
    request: CopilotChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> StreamingResponse:
    """
    Send a message to the AI CoPilot with streaming response.

    This endpoint provides real-time streaming of AI responses using
    Server-Sent Events (SSE). Tokens are streamed as they're generated,
    providing a more responsive user experience.

    SSE Event Format:
        data: {"token": "Hello", "done": false}
        data: {"token": " world", "done": false}
        data: {"token": "", "done": true, "session_id": "...", "message_id": "..."}

    Args:
        request: Chat request with message and optional session ID
        db: Database session
        current_user: Authenticated user

    Returns:
        StreamingResponse with SSE events

    Raises:
        HTTPException: If streaming setup fails
    """
    try:
        logger.info(
            f"Streaming chat request from user {current_user.id} "
            f"(role: {current_user.role})"
        )

        async def event_generator():
            """Generate SSE events for streaming response."""
            try:
                async for event in copilot_service.chat_stream(
                    db, current_user, request
                ):
                    yield f"data: {event}\n\n"
            except Exception as e:
                logger.error(f"Error in stream generator: {str(e)}")
                error_event = f'{{"error": "{str(e)}", "done": true}}'
                yield f"data: {error_event}\n\n"

        return StreamingResponse(
            event_generator(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"  # Disable nginx buffering
            }
        )

    except Exception as e:
        logger.error(f"Error setting up chat stream: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to start streaming chat: {str(e)}"
        )


@router.get("/sessions", response_model=CopilotSessionList)
async def list_sessions(
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> CopilotSessionList:
    """
    List user's conversation sessions with pagination.

    Returns sessions ordered by most recently updated first.
    Only non-deleted sessions with at least one message are returned.

    Args:
        page: Page number (1-indexed)
        page_size: Number of sessions per page (max 100)
        db: Database session
        current_user: Authenticated user

    Returns:
        CopilotSessionList with sessions and pagination info

    Raises:
        HTTPException: If session listing fails
    """
    try:
        logger.info(
            f"Listing sessions for user {current_user.id} "
            f"(page {page}, size {page_size})"
        )

        result = await copilot_service.list_sessions(
            db, current_user.id, page, page_size
        )
        return result

    except Exception as e:
        logger.error(f"Error listing sessions: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to list sessions: {str(e)}"
        )


@router.get("/sessions/{session_id}", response_model=CopilotSessionDetail)
async def get_session(
    session_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> CopilotSessionDetail:
    """
    Get detailed session information with all messages.

    Loads the complete conversation history for a session,
    including user messages and AI responses with timestamps.

    Args:
        session_id: UUID of the session to retrieve
        db: Database session
        current_user: Authenticated user

    Returns:
        CopilotSessionDetail with session metadata and messages

    Raises:
        HTTPException: If session not found or access denied
    """
    try:
        logger.info(
            f"Getting session {session_id} for user {current_user.id}"
        )

        session = await copilot_service.get_session(
            db, session_id, current_user.id
        )

        if not session:
            raise HTTPException(
                status_code=404,
                detail="Session not found or access denied"
            )

        return session

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting session: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get session: {str(e)}"
        )


@router.patch("/sessions/{session_id}", response_model=CopilotSessionDetail)
async def update_session(
    session_id: UUID,
    update_data: CopilotSessionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> CopilotSessionDetail:
    """
    Update session metadata (title, pinned status, response mode).

    Allows users to rename sessions, pin important conversations,
    or change the preferred response mode for a session.

    Args:
        session_id: UUID of the session to update
        update_data: Fields to update (all optional)
        db: Database session
        current_user: Authenticated user

    Returns:
        Updated CopilotSessionDetail

    Raises:
        HTTPException: If session not found or update fails
    """
    try:
        logger.info(
            f"Updating session {session_id} for user {current_user.id}"
        )

        session = await copilot_service.update_session(
            db, session_id, current_user.id, update_data
        )

        if not session:
            raise HTTPException(
                status_code=404,
                detail="Session not found or access denied"
            )

        return session

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating session: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update session: {str(e)}"
        )


@router.delete("/sessions/{session_id}", status_code=204)
async def delete_session(
    session_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> None:
    """
    Soft-delete a conversation session.

    Marks the session as deleted without actually removing it from
    the database. Deleted sessions are hidden from session lists
    but can be recovered by admins if needed.

    Args:
        session_id: UUID of the session to delete
        db: Database session
        current_user: Authenticated user

    Returns:
        None (204 No Content on success)

    Raises:
        HTTPException: If session not found or deletion fails
    """
    try:
        logger.info(
            f"Deleting session {session_id} for user {current_user.id}"
        )

        success = await copilot_service.delete_session(
            db, session_id, current_user.id
        )

        if not success:
            raise HTTPException(
                status_code=404,
                detail="Session not found or access denied"
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting session: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete session: {str(e)}"
        )


@router.get("/insights", response_model=CopilotInsightsResponse)
async def get_insights(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> CopilotInsightsResponse:
    """
    Get role-specific contextual insights and tips.

    Generates personalized insights by querying relevant database
    tables based on the user's role and current activity:

    - Student: Upcoming assignments, grade trends, learning streaks
    - Parent: Children's performance, payment reminders, event notices
    - Instructor: Pending submissions, class analytics, session reminders
    - Admin: User activity metrics, support ticket counts, system health
    - Staff: Open tickets, SLA breaches, moderation queue
    - Partner: Revenue updates, sponsorship status, referral counts

    Args:
        db: Database session
        current_user: Authenticated user

    Returns:
        CopilotInsightsResponse with role-specific insights

    Raises:
        HTTPException: If insights generation fails
    """
    try:
        logger.info(
            f"Getting insights for user {current_user.id} "
            f"(role: {current_user.role})"
        )

        insights = await insights_service.get_insights(db, current_user)
        return insights

    except Exception as e:
        logger.error(f"Error getting insights: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get insights: {str(e)}"
        )
