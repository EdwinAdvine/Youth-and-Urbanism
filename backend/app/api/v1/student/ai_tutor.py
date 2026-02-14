"""
Student AI Tutor API Routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, List, Optional
from uuid import UUID
from pydantic import BaseModel

from app.database import get_db
from app.models.user import User
from app.models.student_dashboard import MoodType
from app.services.student.ai_tutor_service import AITutorService
from app.utils.security import get_current_user


router = APIRouter(prefix="/student/ai", tags=["Student AI Tutor"])


# Pydantic schemas
class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[Dict]] = None


class JournalEntryRequest(BaseModel):
    content: str
    mood_tag: Optional[MoodType] = None


class ExplainRequest(BaseModel):
    concept: str
    context: Optional[str] = None


class TeacherQuestionRequest(BaseModel):
    teacher_id: str
    question: str


class VoiceRequest(BaseModel):
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
            conversation_history=request.conversation_history
        )
        return response
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to chat with AI: {str(e)}"
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
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate learning path: {str(e)}"
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
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch journal entries: {str(e)}"
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
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create journal entry: {str(e)}"
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
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to explain concept: {str(e)}"
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
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid teacher ID: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send question: {str(e)}"
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
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch teacher responses: {str(e)}"
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
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate voice response: {str(e)}"
        )
