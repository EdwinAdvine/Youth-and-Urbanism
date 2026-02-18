"""
Parent Children Router

API endpoints for parent children features.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from uuid import UUID

from app.database import get_db
from app.models import User
from app.utils.security import get_current_user
from app.schemas.parent.children_schemas import (
    ChildrenListResponse, ChildProfileResponse, LearningJourneyResponse,
    ActivityResponse, AchievementsResponse, GoalsListResponse,
    FamilyGoalCreate, FamilyGoalUpdate, FamilyGoalResponse,
    AIPathwaysResponse
)
from app.services.parent.children_service import parent_children_service
from app.models import FamilyGoal

router = APIRouter(prefix="/parent/children", tags=["parent-children"])


def require_parent_role(current_user: User = Depends(get_current_user)) -> User:
    """Dependency to ensure user has parent role."""
    if current_user.role != "parent":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Parent role required"
        )
    return current_user


@router.get("", response_model=ChildrenListResponse)
async def get_children_list(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """
    Get list of all children for parent.

    Returns:
    - List of child summary cards
    - Quick stats for each child
    """
    return await parent_children_service.get_children_list(
        db=db,
        parent_id=current_user.id
    )


@router.get("/goals/all", response_model=GoalsListResponse)
async def get_all_goals(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """
    Get all family goals.

    Returns:
    - All goals across all children
    - Family-wide goals
    """
    return await parent_children_service.get_goals(
        db=db,
        parent_id=current_user.id,
        child_id=None
    )


@router.get("/{child_id}", response_model=ChildProfileResponse)
async def get_child_profile(
    child_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """
    Get full child profile.

    Returns:
    - Complete child information
    - Learning profile and preferences
    - CBC competency scores
    - Overall performance metrics
    - Activity statistics
    - AI tutor information
    """
    try:
        return await parent_children_service.get_child_profile(
            db=db,
            parent_id=current_user.id,
            child_id=child_id
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.get("/{child_id}/learning-journey", response_model=LearningJourneyResponse)
async def get_learning_journey(
    child_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """
    Get child's learning journey.

    Returns:
    - Current focus areas
    - AI-generated weekly narrative
    - CBC competency radar data
    - Learning path (completed, in-progress, upcoming topics)
    """
    try:
        return await parent_children_service.get_learning_journey(
            db=db,
            parent_id=current_user.id,
            child_id=child_id
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.get("/{child_id}/cbc-competencies", response_model=LearningJourneyResponse)
async def get_cbc_competencies(
    child_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """
    Get CBC competency snapshot (alias for learning journey).

    Returns same data as learning-journey endpoint.
    """
    try:
        return await parent_children_service.get_learning_journey(
            db=db,
            parent_id=current_user.id,
            child_id=child_id
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.get("/{child_id}/activity", response_model=ActivityResponse)
async def get_activity(
    child_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """
    Get child's activity tracking data.

    Returns:
    - Daily activity stats (last 7 days)
    - Weekly summary
    - Streak information
    - Real-time activity feed
    """
    try:
        return await parent_children_service.get_activity(
            db=db,
            parent_id=current_user.id,
            child_id=child_id
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.get("/{child_id}/achievements", response_model=AchievementsResponse)
async def get_achievements(
    child_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """
    Get child's achievements and milestones.

    Returns:
    - Certificates earned
    - Badges and awards
    - Growth milestones
    - Recent achievements timeline
    """
    try:
        return await parent_children_service.get_achievements(
            db=db,
            parent_id=current_user.id,
            child_id=child_id
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.get("/{child_id}/goals", response_model=GoalsListResponse)
async def get_child_goals(
    child_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """
    Get goals for specific child.

    Returns:
    - Child-specific goals
    - Family-wide goals
    - Goal progress and status
    """
    return await parent_children_service.get_goals(
        db=db,
        parent_id=current_user.id,
        child_id=child_id
    )


@router.post("/goals", response_model=FamilyGoalResponse, status_code=status.HTTP_201_CREATED)
async def create_goal(
    goal_data: FamilyGoalCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """
    Create a new family goal.

    Request body:
    - title: Goal title
    - description: Goal description
    - category: academic/behavioral/creative/health
    - child_id (optional): Specific child or null for family-wide
    - target_date (optional): Target completion date
    """
    # Create goal
    new_goal = FamilyGoal(
        parent_id=current_user.id,
        child_id=goal_data.child_id,
        title=goal_data.title,
        description=goal_data.description,
        category=goal_data.category,
        target_date=goal_data.target_date,
        progress_percentage=goal_data.progress_percentage,
        status='active'
    )

    db.add(new_goal)
    await db.commit()
    await db.refresh(new_goal)

    # Get child name if applicable
    child_name = None
    if new_goal.child_id:
        from app.models import Student
        from sqlalchemy import select
        child_result = await db.execute(
            select(Student).where(Student.id == new_goal.child_id)
        )
        child = child_result.scalar_one_or_none()
        if child and child.user:
            child_name = child.user.profile_data.get('full_name', 'Unknown')

    return FamilyGoalResponse(
        id=new_goal.id,
        parent_id=new_goal.parent_id,
        child_id=new_goal.child_id,
        child_name=child_name,
        title=new_goal.title,
        description=new_goal.description,
        category=new_goal.category,
        progress_percentage=float(new_goal.progress_percentage or 0),
        status=new_goal.status,
        target_date=new_goal.target_date,
        is_ai_suggested=new_goal.is_ai_suggested,
        ai_metadata=new_goal.ai_metadata,
        created_at=new_goal.created_at,
        updated_at=new_goal.updated_at
    )


@router.put("/goals/{goal_id}", response_model=FamilyGoalResponse)
async def update_goal(
    goal_id: UUID,
    goal_data: FamilyGoalUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """
    Update a family goal.

    Request body (all optional):
    - title: New goal title
    - description: New description
    - category: New category
    - target_date: New target date
    - progress_percentage: Updated progress (0-100)
    - status: New status (active/completed/paused/cancelled)
    """
    from sqlalchemy import select

    # Get goal
    result = await db.execute(
        select(FamilyGoal).where(
            FamilyGoal.id == goal_id,
            FamilyGoal.parent_id == current_user.id
        )
    )
    goal = result.scalar_one_or_none()

    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )

    # Update fields
    if goal_data.title is not None:
        goal.title = goal_data.title
    if goal_data.description is not None:
        goal.description = goal_data.description
    if goal_data.category is not None:
        goal.category = goal_data.category
    if goal_data.target_date is not None:
        goal.target_date = goal_data.target_date
    if goal_data.progress_percentage is not None:
        goal.progress_percentage = goal_data.progress_percentage
    if goal_data.status is not None:
        goal.status = goal_data.status

    await db.commit()
    await db.refresh(goal)

    # Get child name if applicable
    child_name = None
    if goal.child_id:
        from app.models import Student
        child_result = await db.execute(
            select(Student).where(Student.id == goal.child_id)
        )
        child = child_result.scalar_one_or_none()
        if child and child.user:
            child_name = child.user.profile_data.get('full_name', 'Unknown')

    return FamilyGoalResponse(
        id=goal.id,
        parent_id=goal.parent_id,
        child_id=goal.child_id,
        child_name=child_name,
        title=goal.title,
        description=goal.description,
        category=goal.category,
        progress_percentage=float(goal.progress_percentage or 0),
        status=goal.status,
        target_date=goal.target_date,
        is_ai_suggested=goal.is_ai_suggested,
        ai_metadata=goal.ai_metadata,
        created_at=goal.created_at,
        updated_at=goal.updated_at
    )


@router.delete("/goals/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_goal(
    goal_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """
    Delete a family goal.
    """
    from sqlalchemy import select, delete

    # Verify goal belongs to parent
    result = await db.execute(
        select(FamilyGoal).where(
            FamilyGoal.id == goal_id,
            FamilyGoal.parent_id == current_user.id
        )
    )
    goal = result.scalar_one_or_none()

    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )

    # Delete goal
    await db.execute(
        delete(FamilyGoal).where(FamilyGoal.id == goal_id)
    )
    await db.commit()

    return None


@router.get("/{child_id}/ai-pathways", response_model=AIPathwaysResponse)
async def get_ai_pathways(
    child_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """
    Get AI-predicted learning pathways for child.

    Returns:
    - Predicted learning pathways
    - Current trajectory analysis
    - Recommended focus areas
    - Potential career interests
    """
    from app.models import Student
    from sqlalchemy import select, and_

    # Verify child belongs to parent
    result = await db.execute(
        select(Student).where(
            and_(
                Student.id == child_id,
                Student.parent_id == current_user.id
            )
        )
    )
    child = result.scalar_one_or_none()

    if not child:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Child not found"
        )

    # Placeholder - would use AI orchestrator for real predictions
    from app.schemas.parent.children_schemas import PredictedPathway

    pathways = [
        PredictedPathway(
            pathway_name="STEM Excellence",
            description="Strong foundation in science and mathematics",
            confidence=0.85,
            recommended_subjects=["Advanced Mathematics", "Physics", "Computer Science"],
            estimated_timeline_months=24,
            key_milestones=["Master algebra", "Introduction to programming", "Physics fundamentals"]
        ),
        PredictedPathway(
            pathway_name="Creative Arts",
            description="Demonstrated creativity and artistic expression",
            confidence=0.72,
            recommended_subjects=["Visual Arts", "Music", "Creative Writing"],
            estimated_timeline_months=18,
            key_milestones=["Portfolio development", "Music theory", "Creative projects"]
        )
    ]

    return AIPathwaysResponse(
        student_id=child.id,
        full_name=child.user.profile_data.get('full_name', 'Unknown') if child.user else 'Unknown',
        grade_level=child.grade_level,
        pathways=pathways,
        current_trajectory="STEM-focused with creative interests",
        trajectory_confidence=0.78,
        recommended_focus_areas=["Mathematics", "Science", "Critical Thinking"],
        potential_career_interests=["Engineering", "Data Science", "Research"]
    )
