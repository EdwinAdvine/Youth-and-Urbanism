"""
Student AI Tutor API Routes

Endpoints for the student's AI tutor experience including chat, learning
path generation, journal entries with AI insights, concept explanations,
teacher Q&A with AI summaries, and voice response generation via ElevenLabs.
"""
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, List, Optional
from uuid import UUID
from pydantic import BaseModel

logger = logging.getLogger(__name__)

from app.database import get_db
from app.models.user import User
from app.models.student_dashboard import MoodType
from app.services.student.ai_tutor_service import AITutorService
from app.utils.security import get_current_user


router = APIRouter(prefix="/student/ai", tags=["Student AI Tutor"])


# Pydantic schemas
class ChatRequest(BaseModel):
    """Request body for sending a message to the AI tutor."""
    message: str
    conversation_history: Optional[List[Dict]] = None
    screen_context: Optional[str] = None  # Visible text from the student's current screen


class JournalEntryRequest(BaseModel):
    """Request body for creating a journal entry with optional mood tag."""
    content: str
    mood_tag: Optional[MoodType] = None


class ExplainRequest(BaseModel):
    """Request body for asking the AI to explain a concept."""
    concept: str
    context: Optional[str] = None


class TeacherQuestionRequest(BaseModel):
    """Request body for sending a question to a teacher through the AI."""
    teacher_id: str
    question: str


class VoiceRequest(BaseModel):
    """Request body for generating a voice response from text via ElevenLabs TTS."""
    text: str


# API Endpoints
@router.post("/chat")
async def chat_with_ai_tutor(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    """
    Chat with AI tutor

    Body:
    - message: User's message
    - conversation_history: Optional previous conversation
    """
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access this endpoint"
        )

    if not current_user.student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student profile not found"
        )

    service = AITutorService(db)

    try:
        response = await service.chat_with_ai(
            student_id=current_user.student_id,
            message=request.message,
            conversation_history=request.conversation_history,
            screen_context=request.screen_context
        )
        return response
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="AI tutor not found for this student"
        )
    except Exception as e:
        logger.error(f"AI tutor chat failed for student {current_user.student_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process AI chat request"
        )


@router.get("/learning-path")
async def get_learning_path(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    """
    Get AI-generated daily learning path
    """
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access this endpoint"
        )

    if not current_user.student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student profile not found"
        )

    service = AITutorService(db)

    try:
        path = await service.get_learning_path(current_user.student_id)
        return path
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="AI tutor not found for this student"
        )
    except Exception as e:
        logger.error(f"Learning path generation failed for student {current_user.student_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate learning path"
        )


@router.get("/journal")
async def get_journal_entries(
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> List[Dict]:
    """
    Get student's journal entries

    Query params:
    - limit: Number of entries to return (default 10)
    """
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access this endpoint"
        )

    if not current_user.student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student profile not found"
        )

    service = AITutorService(db)

    try:
        entries = await service.get_journal_entries(current_user.student_id, limit)

        return [
            {
                "id": str(entry.id),
                "content": entry.content,
                "mood_tag": entry.mood_tag,
                "ai_insights": entry.ai_insights,
                "reflection_prompts": entry.reflection_prompts,
                "created_at": entry.created_at
            }
            for entry in entries
        ]
    except Exception as e:
        logger.error(f"Failed to fetch journal entries for student {current_user.student_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch journal entries"
        )


@router.post("/journal")
async def create_journal_entry(
    request: JournalEntryRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    """
    Create journal entry with AI insights

    Body:
    - content: Journal entry text
    - mood_tag: Optional mood (happy | okay | tired | frustrated | excited)
    """
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can create journal entries"
        )

    if not current_user.student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student profile not found"
        )

    service = AITutorService(db)

    try:
        entry = await service.create_journal_entry(
            student_id=current_user.student_id,
            content=request.content,
            mood_tag=request.mood_tag
        )

        return {
            "id": str(entry.id),
            "content": entry.content,
            "mood_tag": entry.mood_tag,
            "ai_insights": entry.ai_insights,
            "created_at": entry.created_at,
            "message": "Journal entry created successfully"
        }
    except Exception as e:
        logger.error(f"Failed to create journal entry for student {current_user.student_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create journal entry"
        )


class JournalUpdateRequest(BaseModel):
    """Request body for updating an existing journal entry."""
    content: str
    mood_tag: Optional[MoodType] = None


@router.put("/journal/{entry_id}")
async def update_journal_entry(
    entry_id: str,
    request: JournalUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    """
    Update an existing journal entry (content and/or mood tag).

    Path params:
    - entry_id: UUID of the journal entry to update

    Body:
    - content: Updated journal text
    - mood_tag: Optional updated mood
    """
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can update journal entries"
        )
    if not current_user.student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student profile not found"
        )

    service = AITutorService(db)
    try:
        entry_uuid = UUID(entry_id)
        entry = await service.update_journal_entry(
            student_id=current_user.student_id,
            entry_id=entry_uuid,
            content=request.content,
            mood_tag=request.mood_tag
        )
        return {
            "id": str(entry.id),
            "content": entry.content,
            "mood_tag": entry.mood_tag,
            "ai_insights": entry.ai_insights,
            "updated_at": entry.updated_at,
            "message": "Journal entry updated successfully"
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Failed to update journal entry: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update journal entry"
        )


@router.post("/explain")
async def explain_concept(
    request: ExplainRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    """
    Get AI explanation of a concept

    Body:
    - concept: The concept to explain
    - context: Optional additional context
    """
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access this endpoint"
        )

    if not current_user.student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student profile not found"
        )

    service = AITutorService(db)

    try:
        explanation = await service.explain_concept(
            student_id=current_user.student_id,
            concept=request.concept,
            context=request.context
        )
        return explanation
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="AI tutor not found for this student"
        )
    except Exception as e:
        logger.error(f"Concept explanation failed for student {current_user.student_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to explain concept"
        )


@router.post("/teacher-question")
async def send_teacher_question(
    request: TeacherQuestionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    """
    Send question to teacher (with AI summary)

    Body:
    - teacher_id: Teacher's user ID
    - question: Question text
    """
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can send questions"
        )

    if not current_user.student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student profile not found"
        )

    service = AITutorService(db)

    try:
        teacher_id = UUID(request.teacher_id)

        qa_record = await service.send_teacher_question(
            student_id=current_user.student_id,
            teacher_id=teacher_id,
            question=request.question
        )

        return {
            "id": str(qa_record.id),
            "question": qa_record.question,
            "ai_summary": qa_record.ai_summary,
            "created_at": qa_record.created_at,
            "message": "Question sent to teacher successfully"
        }
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid teacher ID format"
        )
    except Exception as e:
        logger.error(f"Failed to send teacher question for student {current_user.student_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send question"
        )


@router.get("/teacher-responses")
async def get_teacher_responses(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> List[Dict]:
    """
    Get AI-summarized teacher responses
    """
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access this endpoint"
        )

    if not current_user.student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student profile not found"
        )

    service = AITutorService(db)

    try:
        responses = await service.get_teacher_responses(current_user.student_id)
        return responses
    except Exception as e:
        logger.error(f"Failed to fetch teacher responses for student {current_user.student_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch teacher responses"
        )


@router.get("/available-teachers")
async def get_available_teachers(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> List[Dict]:
    """
    Get teachers available to receive questions from this student.

    Returns the student's class teacher (by grade) and subject department
    heads for each learning area the student is enrolled in.
    """
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access this endpoint"
        )
    if not current_user.student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student profile not found"
        )

    service = AITutorService(db)
    try:
        return await service.get_available_teachers(current_user.student_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    except Exception as e:
        logger.error(f"Failed to fetch available teachers: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch teachers"
        )


@router.get("/teacher-questions")
async def get_all_teacher_questions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> List[Dict]:
    """
    Get all teacher Q&A threads for the current student (pending + answered).
    """
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access this endpoint"
        )
    if not current_user.student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student profile not found"
        )

    service = AITutorService(db)
    try:
        return await service.get_all_teacher_questions(current_user.student_id)
    except Exception as e:
        logger.error(f"Failed to fetch teacher questions: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch questions"
        )


@router.post("/voice")
async def generate_voice_response(
    request: VoiceRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    """
    Generate voice response using ElevenLabs TTS

    Body:
    - text: Text to convert to speech

    Note: ElevenLabs integration not yet implemented
    """
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access this endpoint"
        )

    if not current_user.student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student profile not found"
        )

    service = AITutorService(db)

    try:
        voice_response = await service.generate_voice_response(
            student_id=current_user.student_id,
            text=request.text
        )
        return voice_response
    except Exception as e:
        logger.error(f"Voice response generation failed for student {current_user.student_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate voice response"
        )


@router.get("/tutor-info")
async def get_tutor_info(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    """
    Get the student's AI tutor identity information.

    Returns the tutor's name, unique AIT code (e.g. UHS/2026/G3/001-AIT001),
    interaction stats, and the student's admission number.
    Creates the tutor record if it does not yet exist.
    """
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access this endpoint"
        )

    if not current_user.student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student profile not found"
        )

    service = AITutorService(db)

    try:
        info = await service.get_tutor_info(current_user.student_id)
        return info
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    except Exception as e:
        logger.error(f"Failed to fetch tutor info for student {current_user.student_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch tutor information"
        )


@router.get("/plan-with-progress")
async def get_plan_with_progress(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    """
    Get AI-generated learning plan combined with mastery progress status.

    Returns:
    - progress_status: 'ahead' | 'on_track' | 'catching_up'
    - mastered_count / total_topics: mastery summary
    - catch_up_topics: list of topics where mastery < 70% (when catching up)
    - learning_path: AI-generated daily activities
    """
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access this endpoint"
        )

    if not current_user.student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student profile not found"
        )

    service = AITutorService(db)

    try:
        plan = await service.get_plan_with_progress(current_user.student_id)
        return plan
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    except Exception as e:
        logger.error(f"Failed to generate plan with progress for student {current_user.student_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate learning plan"
        )
