"""
Student Progress & Gamification API Routes

Endpoints for XP/level data, badges, leaderboards, learning goals,
and AI-powered weekly progress reports.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, List, Optional
from uuid import UUID
from pydantic import BaseModel
from datetime import datetime

from app.database import get_db
from app.models.user import User
from app.services.student.gamification_service import GamificationService
from app.utils.security import get_current_user


router = APIRouter(prefix="/student/progress", tags=["Student Progress"])


# Pydantic schemas
class CreateGoalRequest(BaseModel):
    """Request body for creating a new learning goal."""
    title: str
    target: int
    unit: str = "lessons"  # e.g. lessons, hours, assignments
    deadline: Optional[datetime] = None


# API Endpoints
@router.get("/xp")
async def get_xp_and_level(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    """
    Get student's XP and level data
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

    service = GamificationService(db)

    try:
        level_data = await service.get_student_level_data(current_user.student_id)
        return level_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch XP data: {str(e)}"
        )


@router.get("/badges")
async def get_badges(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> List[Dict]:
    """
    Get all badges earned by the student
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

    service = GamificationService(db)

    try:
        badges = await service.get_student_badges(current_user.student_id)
        return badges
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch badges: {str(e)}"
        )


@router.get("/leaderboard")
async def get_leaderboard(
    scope: str = "class",
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> List[Dict]:
    """
    Get leaderboard data

    Query params:
    - scope: "class" | "grade" | "school" (default: "class")
    - limit: Number of entries (default: 10)
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

    if scope not in ["class", "grade", "school"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid scope. Must be 'class', 'grade', or 'school'"
        )

    service = GamificationService(db)

    try:
        leaderboard = await service.get_leaderboard(
            student_id=current_user.student_id,
            scope=scope,
            limit=limit
        )
        return leaderboard
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch leaderboard: {str(e)}"
        )


@router.get("/goals")
async def get_goals(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> List[Dict]:
    """
    Get student's active learning goals
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

    service = GamificationService(db)

    try:
        goals = await service.get_student_goals(current_user.student_id)
        return goals
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch goals: {str(e)}"
        )


@router.post("/goals")
async def create_goal(
    request: CreateGoalRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    """
    Create a new learning goal

    Body:
    - title: Goal title
    - target: Target value
    - unit: Unit of measurement (lessons, hours, assignments, etc.)
    - deadline: Optional deadline
    """
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can create goals"
        )

    if not current_user.student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student profile not found"
        )

    service = GamificationService(db)

    try:
        goal = await service.create_goal(
            student_id=current_user.student_id,
            title=request.title,
            target=request.target,
            unit=request.unit,
            deadline=request.deadline,
            ai_suggested=False
        )

        return {
            "id": str(goal.id),
            "title": goal.title,
            "target": goal.target,
            "current": goal.current,
            "unit": goal.unit,
            "deadline": goal.deadline,
            "message": "Goal created successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create goal: {str(e)}"
        )


@router.get("/weekly-report")
async def get_weekly_report(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    """
    Get or generate AI-powered weekly learning report
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

    service = GamificationService(db)

    try:
        report = await service.generate_weekly_report(current_user.student_id)

        return {
            "id": str(report.id),
            "week_start": report.week_start,
            "week_end": report.week_end,
            "ai_story": report.ai_story,
            "metrics": report.metrics,
            "strongest_subject": report.strongest_subject,
            "improvement_area": report.improvement_area,
            "shared_with_parent": report.shared_with_parent
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate weekly report: {str(e)}"
        )
