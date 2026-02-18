"""
Student Support API Routes - Help, Guides, Tickets
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, List, Optional
from pydantic import BaseModel

from app.database import get_db
from app.models.user import User
from app.services.student.support_service import SupportService
from app.utils.security import get_current_user


router = APIRouter(prefix="/student/support", tags=["Student Support"])


# Pydantic schemas
class CreateTicketRequest(BaseModel):
    subject: str
    description: str
    priority: str = "normal"


class AIHelpRequest(BaseModel):
    question: str


class ReportProblemRequest(BaseModel):
    problem_type: str
    description: str
    urgency: str = "normal"


# API Endpoints
@router.get("/guides")
async def get_help_guides(
    category: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> List[Dict]:
    """
    Get help guides

    Query params:
    - category: Filter by category (basics, assignments, ai, live, gamification)
    """
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access this endpoint"
        )

    service = SupportService(db)

    try:
        guides = await service.get_help_guides(category)
        return guides
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch guides: {str(e)}"
        )


@router.get("/guides/{guide_id}")
async def get_guide(
    guide_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    """
    Get a specific help guide
    """
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access this endpoint"
        )

    service = SupportService(db)

    try:
        guide = await service.get_guide_by_id(guide_id)

        if not guide:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Guide not found"
            )

        return guide
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch guide: {str(e)}"
        )


@router.get("/faq")
async def get_faq(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> List[Dict]:
    """
    Get frequently asked questions
    """
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access this endpoint"
        )

    service = SupportService(db)

    try:
        faq = await service.get_faq()
        return faq
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch FAQ: {str(e)}"
        )


@router.post("/tickets")
async def create_support_ticket(
    request: CreateTicketRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    """
    Create a support ticket

    Body:
    - subject: Ticket subject
    - description: Detailed description
    - priority: normal | high | urgent (default: normal)
    """
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can create tickets"
        )

    if not current_user.student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student profile not found"
        )

    if request.priority not in ["normal", "high", "urgent"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid priority. Must be normal, high, or urgent"
        )

    service = SupportService(db)

    try:
        ticket = await service.create_support_ticket(
            student_id=current_user.student_id,
            subject=request.subject,
            description=request.description,
            priority=request.priority
        )

        return {
            **ticket,
            "message": "Support ticket created successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create ticket: {str(e)}"
        )


@router.get("/tickets")
async def get_student_tickets(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> List[Dict]:
    """
    Get student's support tickets
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

    service = SupportService(db)

    try:
        tickets = await service.get_student_tickets(current_user.student_id)
        return tickets
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch tickets: {str(e)}"
        )


@router.post("/ai-help")
async def get_ai_help(
    request: AIHelpRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    """
    Get AI-powered instant help

    Body:
    - question: Your question or issue
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

    service = SupportService(db)

    try:
        help_response = await service.ai_help_triage(
            student_id=current_user.student_id,
            question=request.question
        )
        return help_response
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get AI help: {str(e)}"
        )


@router.post("/report")
async def report_problem(
    request: ReportProblemRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    """
    Report a technical problem

    Body:
    - problem_type: Type of problem
    - description: Detailed description
    - urgency: normal | high | critical (default: normal)
    """
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can report problems"
        )

    if not current_user.student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student profile not found"
        )

    service = SupportService(db)

    try:
        report = await service.report_problem(
            student_id=current_user.student_id,
            problem_type=request.problem_type,
            description=request.description,
            urgency=request.urgency
        )

        return {
            **report,
            "message": "Problem reported successfully. Our team will investigate."
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to report problem: {str(e)}"
        )
