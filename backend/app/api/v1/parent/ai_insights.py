"""
Parent AI Insights Router

API endpoints for AI companion insights and parent coaching.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from uuid import UUID

from app.database import get_db
from app.models import User, AIAlert
from app.utils.security import get_current_user
from app.schemas.parent.ai_insights_schemas import (
    AITutorSummary, LearningStyleAnalysis, SupportTipsResponse,
    AIPlanningResponse, CuriosityPatternsResponse, WarningSignsResponse,
    AlertsListResponse, AlertDetailResponse, ParentCoachingResponse
)
from app.services.parent.ai_insights_service import parent_ai_insights_service

router = APIRouter(prefix="/parent/ai", tags=["parent-ai-insights"])


def require_parent_role(current_user: User = Depends(get_current_user)) -> User:
    """Dependency to ensure user has parent role."""
    if current_user.role != "parent":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Parent role required"
        )
    return current_user


@router.get("/summary/{child_id}", response_model=AITutorSummary)
async def get_ai_tutor_summary(
    child_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """
    Get AI tutor summary for child.

    Returns:
    - Total interactions and engagement metrics
    - Current and recent topics
    - Strengths and areas for improvement
    - Recent conversation samples
    - Parent-friendly AI summary
    """
    try:
        return await parent_ai_insights_service.get_ai_tutor_summary(
            db=db,
            parent_id=current_user.id,
            child_id=child_id
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.get("/learning-style/{child_id}", response_model=LearningStyleAnalysis)
async def get_learning_style_analysis(
    child_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """
    Get learning style analysis for child.

    Returns:
    - Primary learning style (visual, auditory, kinesthetic)
    - Detailed learning traits with scores
    - Preferred activities and optimal learning times
    - Recommendations for parents
    """
    try:
        return await parent_ai_insights_service.get_learning_style_analysis(
            db=db,
            parent_id=current_user.id,
            child_id=child_id
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.get("/support-tips/{child_id}", response_model=SupportTipsResponse)
async def get_support_tips(
    child_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """
    Get practical home support tips for parents.

    Returns:
    - Categorized actionable tips (academic, emotional, practical, motivational)
    - This week's focus and priority actions
    - Recommended resources
    """
    try:
        return await parent_ai_insights_service.get_support_tips(
            db=db,
            parent_id=current_user.id,
            child_id=child_id
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.get("/planning/{child_id}", response_model=AIPlanningResponse)
async def get_ai_planning(
    child_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """
    Get topics AI is planning for child.

    Returns:
    - Upcoming topics with learning objectives
    - Current learning trajectory and pacing
    - AI planning rationale
    - Parent involvement opportunities
    """
    try:
        return await parent_ai_insights_service.get_ai_planning(
            db=db,
            parent_id=current_user.id,
            child_id=child_id
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.get("/patterns/{child_id}", response_model=CuriosityPatternsResponse)
async def get_curiosity_patterns(
    child_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """
    Get child's curiosity patterns analysis.

    Returns:
    - Identified curiosity patterns
    - Top interest areas with engagement scores
    - Common question types and complexity trends
    - Suggestions for nurturing curiosity
    """
    try:
        return await parent_ai_insights_service.get_curiosity_patterns(
            db=db,
            parent_id=current_user.id,
            child_id=child_id
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.get("/warnings/{child_id}", response_model=WarningSignsResponse)
async def get_warning_signs(
    child_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """
    Get early warning signs analysis for child.

    Returns:
    - Active warning indicators
    - Overall risk assessment
    - Risk and protective factors
    - Intervention recommendations
    """
    try:
        return await parent_ai_insights_service.get_warning_signs(
            db=db,
            parent_id=current_user.id,
            child_id=child_id
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.get("/alerts", response_model=AlertsListResponse)
async def get_alerts_list(
    child_id: Optional[UUID] = Query(None, description="Filter by child ID"),
    severity: Optional[str] = Query(None, description="Filter by severity (info, warning, critical)"),
    is_read: Optional[bool] = Query(None, description="Filter by read status"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """
    Get list of AI alerts.

    Query parameters:
    - child_id: Filter by specific child
    - severity: Filter by severity level
    - is_read: Filter by read status

    Returns:
    - List of alerts with summaries
    - Total, unread, and critical counts
    """
    return await parent_ai_insights_service.get_alerts_list(
        db=db,
        parent_id=current_user.id,
        child_id=child_id,
        severity=severity,
        is_read=is_read
    )


@router.get("/alerts/{alert_id}", response_model=AlertDetailResponse)
async def get_alert_detail(
    alert_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """
    Get detailed alert information.

    Returns:
    - Full alert details
    - AI recommendations
    - Action URLs
    - Metadata
    """
    from sqlalchemy import select, and_

    result = await db.execute(
        select(AIAlert).where(
            and_(
                AIAlert.id == alert_id,
                AIAlert.parent_id == current_user.id
            )
        )
    )
    alert = result.scalar_one_or_none()

    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found"
        )

    # Get child name
    from app.models import Student
    child_name = "Unknown"
    if alert.child_id:
        child_result = await db.execute(
            select(Student).where(Student.id == alert.child_id)
        )
        child = child_result.scalar_one_or_none()
        if child and child.user:
            child_name = child.user.profile_data.get('full_name', 'Unknown')

    return AlertDetailResponse(
        id=alert.id,
        parent_id=alert.parent_id,
        child_id=alert.child_id,
        child_name=child_name,
        alert_type=alert.alert_type,
        severity=alert.severity,
        title=alert.title,
        message=alert.message,
        ai_recommendation=alert.ai_recommendation,
        is_read=alert.is_read,
        is_dismissed=alert.is_dismissed,
        action_url=alert.action_url,
        metadata_=alert.metadata_,
        created_at=alert.created_at
    )


@router.put("/alerts/{alert_id}/read", response_model=AlertDetailResponse)
async def mark_alert_read(
    alert_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """Mark an alert as read."""
    from sqlalchemy import select, and_

    result = await db.execute(
        select(AIAlert).where(
            and_(
                AIAlert.id == alert_id,
                AIAlert.parent_id == current_user.id
            )
        )
    )
    alert = result.scalar_one_or_none()

    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found"
        )

    alert.is_read = True
    await db.commit()
    await db.refresh(alert)

    # Get child name
    from app.models import Student
    child_name = "Unknown"
    if alert.child_id:
        child_result = await db.execute(
            select(Student).where(Student.id == alert.child_id)
        )
        child = child_result.scalar_one_or_none()
        if child and child.user:
            child_name = child.user.profile_data.get('full_name', 'Unknown')

    return AlertDetailResponse(
        id=alert.id,
        parent_id=alert.parent_id,
        child_id=alert.child_id,
        child_name=child_name,
        alert_type=alert.alert_type,
        severity=alert.severity,
        title=alert.title,
        message=alert.message,
        ai_recommendation=alert.ai_recommendation,
        is_read=alert.is_read,
        is_dismissed=alert.is_dismissed,
        action_url=alert.action_url,
        metadata_=alert.metadata_,
        created_at=alert.created_at
    )


@router.put("/alerts/{alert_id}/dismiss", status_code=status.HTTP_204_NO_CONTENT)
async def dismiss_alert(
    alert_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """Dismiss an alert."""
    from sqlalchemy import select, and_

    result = await db.execute(
        select(AIAlert).where(
            and_(
                AIAlert.id == alert_id,
                AIAlert.parent_id == current_user.id
            )
        )
    )
    alert = result.scalar_one_or_none()

    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found"
        )

    alert.is_dismissed = True
    await db.commit()

    return None


@router.get("/coaching/{child_id}", response_model=ParentCoachingResponse)
async def get_parent_coaching(
    child_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """
    Get AI parent coaching content.

    Returns:
    - Personalized coaching recommendations
    - Available modules
    - Progress tracking
    - Personalized tips
    """
    from sqlalchemy import select, and_
    from app.models import Student
    from app.schemas.parent.ai_insights_schemas import CoachingModule, CoachingRecommendation

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

    # Sample coaching modules (would be dynamic in production)
    modules = [
        CoachingModule(
            module_id="mod_001",
            title="Understanding CBC Competencies",
            description="Learn how to support CBC-aligned learning at home",
            estimated_duration_minutes=15,
            topics_covered=["CBC framework", "7 core competencies", "Home support strategies"],
            is_completed=False
        ),
        CoachingModule(
            module_id="mod_002",
            title="Supporting Visual Learners",
            description="Strategies for visual learning styles",
            estimated_duration_minutes=12,
            topics_covered=["Visual learning", "Tools and techniques", "Practice activities"],
            is_completed=False
        )
    ]

    recommendations = [
        CoachingRecommendation(
            recommendation_id="rec_001",
            title="Start with CBC Competencies",
            reason="Understanding CBC will help you support your child's holistic development",
            priority="high",
            module_id="mod_001"
        )
    ]

    return ParentCoachingResponse(
        student_id=child.id,
        student_name=child.user.profile_data.get('full_name', 'Unknown') if child.user else 'Unknown',
        recommended_modules=recommendations,
        available_modules=modules,
        completed_modules_count=0,
        total_modules_count=len(modules),
        coaching_focus="Building effective home learning support",
        personalized_tips=[
            "Review CBC competency progress weekly",
            "Create visual learning aids for key concepts",
            "Celebrate effort, not just results"
        ]
    )
