"""
AI Tutor API Endpoints - CORE FEATURE

This module defines the AI tutor chat interface endpoints, which is a core feature
of the Urban Home School platform. The AI tutor provides personalized one-on-one
tutoring to students using multi-AI orchestration.

Features:
- Real-time chat with AI tutor
- Multi-modal responses (text, voice, video)
- Conversation history tracking
- Learning path adaptation
- Performance metrics

Dependencies:
- AIOrchestrator: Routes queries to appropriate AI providers (Gemini, Claude, GPT-4, Grok)
- get_current_user: Authentication dependency (needs to be implemented in security.py)
"""

import logging
from datetime import datetime
from typing import List, Optional
from uuid import UUID

logger = logging.getLogger(__name__)

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models import Student, AITutor, User
from app.schemas.ai_tutor_schemas import (
    ChatRequest,
    ChatResponse,
    ChatMessage,
    ResponseModeUpdate,
    ConversationHistory,
    TutorStatus
)
from app.utils.security import get_current_user
from app.services.ai_orchestrator import AIOrchestrator


# Create API router
router = APIRouter(prefix="/ai-tutor", tags=["AI Tutor"])


# ============================================================================
# Helper Functions
# ============================================================================

async def get_student_from_user(
    user: User,
    db: AsyncSession
) -> Student:
    """
    Get student record from user.

    Args:
        user: The authenticated user
        db: Database session

    Returns:
        Student record

    Raises:
        HTTPException 403: If user is not a student
        HTTPException 404: If student record not found
    """
    # Verify user is a student
    if user.role != 'student':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This endpoint is only accessible to students"
        )

    # Get student record
    result = await db.execute(
        select(Student).where(Student.user_id == user.id)
    )
    student = result.scalar_one_or_none()

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student record not found"
        )

    return student


async def get_student_tutor(
    student_id: UUID,
    db: AsyncSession
) -> AITutor:
    """
    Get AI tutor for a student.

    Args:
        student_id: Student's UUID
        db: Database session

    Returns:
        AITutor instance

    Raises:
        HTTPException 404: If tutor not found
    """
    result = await db.execute(
        select(AITutor).where(AITutor.student_id == student_id)
    )
    tutor = result.scalar_one_or_none()

    if not tutor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="AI tutor not found for this student"
        )

    return tutor


# ============================================================================
# Chat Endpoints
# ============================================================================

@router.post(
    "/chat",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK,
    summary="Send message to AI tutor",
    description="Send a message to the student's AI tutor and receive a response in the preferred mode (text/voice/video)"
)
async def chat_with_tutor(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> ChatResponse:
    """
    Send a message to the AI tutor and receive a response.

    This endpoint is the core of the AI tutoring feature. It:
    1. Validates the user is a student
    2. Retrieves the student's AI tutor
    3. Loads conversation history for context
    4. Routes the query to the appropriate AI provider
    5. Saves the conversation to history
    6. Updates interaction metrics
    7. Returns the AI response with optional voice/video

    Args:
        request: Chat request with message and context preferences
        current_user: Authenticated user (must be student)
        db: Database session

    Returns:
        ChatResponse with AI tutor's response and optional media URLs

    Raises:
        HTTPException 403: If user is not a student
        HTTPException 404: If tutor not found
        HTTPException 500: If AI service fails
    """
    # Get student record
    student = await get_student_from_user(current_user, db)

    # Get student's AI tutor
    tutor = await get_student_tutor(student.id, db)

    # Load conversation history
    conversation_history = tutor.conversation_history or []

    # Get context messages if requested
    context = []
    if request.include_context and conversation_history:
        # Get the last N messages for context
        context = conversation_history[-request.context_messages:]

    # Get user's response mode preference
    response_mode = tutor.response_mode

    # Route query to AI orchestrator
    ai_message = ""
    audio_url = None
    video_url = None

    try:
        orchestrator = AIOrchestrator(db)
        ai_response = await orchestrator.route_query(
            query=request.message,
            context={
                "conversation_history": context,
                "grade_level": getattr(student, 'grade_level', None),
                "learning_profile": getattr(student, 'learning_profile', {}),
            },
            response_mode=response_mode,
        )
        ai_message = ai_response.get('message', 'I received your message but could not generate a response.')
        audio_url = ai_response.get('audio_url')
        video_url = ai_response.get('video_url')
    except Exception as e:
        logger.warning(f"AI Orchestrator error: {str(e)}")
        ai_message = (
            "I'm having trouble connecting to my AI services right now. "
            "Please try again in a moment, or ask your question differently. "
            "If this continues, an administrator may need to configure AI providers."
        )

    # Add user message to conversation history
    user_message = {
        "role": "user",
        "content": request.message,
        "timestamp": datetime.utcnow().isoformat()
    }
    conversation_history.append(user_message)

    # Add AI response to conversation history
    assistant_message = {
        "role": "assistant",
        "content": ai_message,
        "timestamp": datetime.utcnow().isoformat()
    }
    conversation_history.append(assistant_message)

    # Update tutor record
    tutor.conversation_history = conversation_history
    tutor.total_interactions += 1
    tutor.last_interaction = datetime.utcnow()

    # Save to database
    await db.commit()
    await db.refresh(tutor)

    # Return response
    return ChatResponse(
        message=ai_message,
        response_mode=response_mode,
        audio_url=audio_url,
        video_url=video_url,
        conversation_id=tutor.id,
        timestamp=datetime.utcnow()
    )


# ============================================================================
# Conversation History
# ============================================================================

@router.get(
    "/history",
    response_model=ConversationHistory,
    status_code=status.HTTP_200_OK,
    summary="Get conversation history",
    description="Retrieve the conversation history between the student and their AI tutor"
)
async def get_conversation_history(
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> ConversationHistory:
    """
    Get the conversation history between student and AI tutor.

    Args:
        limit: Maximum number of messages to return (default 50)
        offset: Number of messages to skip (default 0)
        current_user: Authenticated user (must be student)
        db: Database session

    Returns:
        ConversationHistory with messages and metadata

    Raises:
        HTTPException 403: If user is not a student
        HTTPException 404: If tutor not found
    """
    # Get student record
    student = await get_student_from_user(current_user, db)

    # Get student's AI tutor
    tutor = await get_student_tutor(student.id, db)

    # Get conversation history
    all_messages = tutor.conversation_history or []

    # Apply pagination
    paginated_messages = all_messages[offset:offset + limit]

    # Convert to ChatMessage objects
    messages = [
        ChatMessage(
            role=msg["role"],
            content=msg["content"],
            timestamp=datetime.fromisoformat(msg["timestamp"])
        )
        for msg in paginated_messages
    ]

    # Get timestamps
    oldest_message = None
    newest_message = None
    if all_messages:
        oldest_message = datetime.fromisoformat(all_messages[0]["timestamp"])
        newest_message = datetime.fromisoformat(all_messages[-1]["timestamp"])

    return ConversationHistory(
        tutor_id=tutor.id,
        student_id=student.id,
        messages=messages,
        total_messages=len(all_messages),
        oldest_message=oldest_message,
        newest_message=newest_message
    )


# ============================================================================
# Tutor Settings
# ============================================================================

@router.put(
    "/response-mode",
    status_code=status.HTTP_200_OK,
    summary="Update response mode",
    description="Update the AI tutor's response mode preference (text, voice, or video)"
)
async def update_response_mode(
    update: ResponseModeUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> dict:
    """
    Update the AI tutor's response mode preference.

    Students can choose how they want the AI tutor to respond:
    - text: Text-only responses (fastest, lowest data usage)
    - voice: Text with audio narration (moderate speed and data)
    - video: Text with AI-generated video (slowest, highest data usage)

    Args:
        update: Response mode update request
        current_user: Authenticated user (must be student)
        db: Database session

    Returns:
        Success message with updated response mode

    Raises:
        HTTPException 403: If user is not a student
        HTTPException 404: If tutor not found
    """
    # Get student record
    student = await get_student_from_user(current_user, db)

    # Get student's AI tutor
    tutor = await get_student_tutor(student.id, db)

    # Update response mode
    tutor.response_mode = update.response_mode

    # Save to database
    await db.commit()
    await db.refresh(tutor)

    return {
        "response_mode": tutor.response_mode,
        "message": f"Response mode updated to {tutor.response_mode}"
    }


# ============================================================================
# Tutor Status
# ============================================================================

@router.get(
    "/status",
    response_model=TutorStatus,
    status_code=status.HTTP_200_OK,
    summary="Get AI tutor status",
    description="Get the AI tutor's status, metrics, and configuration for the current student"
)
async def get_tutor_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> TutorStatus:
    """
    Get AI tutor status and metrics.

    Returns comprehensive information about the student's AI tutor including:
    - Total number of interactions
    - Last interaction timestamp
    - Current response mode
    - Performance metrics
    - Learning path progress

    Args:
        current_user: Authenticated user (must be student)
        db: Database session

    Returns:
        TutorStatus with comprehensive tutor information

    Raises:
        HTTPException 403: If user is not a student
        HTTPException 404: If tutor not found
    """
    # Get student record
    student = await get_student_from_user(current_user, db)

    # Get student's AI tutor
    tutor = await get_student_tutor(student.id, db)

    return TutorStatus(
        id=tutor.id,
        student_id=tutor.student_id,
        name=tutor.name,
        response_mode=tutor.response_mode,
        total_interactions=tutor.total_interactions,
        last_interaction=tutor.last_interaction,
        performance_metrics=tutor.performance_metrics,
        learning_path=tutor.learning_path,
        created_at=tutor.created_at
    )


# ============================================================================
# Administrative Actions
# ============================================================================

@router.post(
    "/reset",
    status_code=status.HTTP_200_OK,
    summary="Reset conversation",
    description="Clear the conversation history with the AI tutor (student or admin only)"
)
async def reset_conversation(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> dict:
    """
    Reset the conversation history with the AI tutor.

    This clears all conversation history but preserves:
    - Learning path progress
    - Performance metrics
    - Interaction count (resets to 0)

    Only accessible to:
    - The student themselves
    - Admin users

    Args:
        current_user: Authenticated user (must be student or admin)
        db: Database session

    Returns:
        Success message

    Raises:
        HTTPException 403: If user is not a student or admin
        HTTPException 404: If tutor not found
    """
    # Check if user is admin
    is_admin = current_user.role == 'admin'

    # If not admin, must be a student
    if not is_admin:
        student = await get_student_from_user(current_user, db)
        tutor = await get_student_tutor(student.id, db)
    else:
        # Admin can reset any student's conversation
        # For this implementation, we'll require student context
        # In production, you might add a student_id parameter for admins
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin reset requires student_id parameter (not yet implemented)"
        )

    # Clear conversation history
    tutor.conversation_history = []
    tutor.total_interactions = 0
    tutor.last_interaction = None

    # Save to database
    await db.commit()

    return {
        "message": "Conversation history reset successfully",
        "tutor_id": str(tutor.id)
    }


# ============================================================================
# Health Check
# ============================================================================

@router.get(
    "/health",
    status_code=status.HTTP_200_OK,
    summary="AI Tutor service health check",
    description="Check if the AI Tutor service is operational"
)
async def health_check() -> dict:
    """
    Health check endpoint for AI Tutor service.

    Returns:
        Service status and version information
    """
    return {
        "status": "operational",
        "service": "AI Tutor",
        "version": "1.0.0",
        "features": {
            "chat": True,
            "history": True,
            "response_modes": ["text", "voice", "video"],
            "ai_orchestrator": False  # TODO: Set to True once implemented
        }
    }
