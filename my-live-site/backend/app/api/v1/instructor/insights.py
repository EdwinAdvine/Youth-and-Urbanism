"""
Instructor AI Insights API Routes

Endpoints for AI-generated daily insights, CBC alignment analysis,
and AI-suggested resources.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, desc
from typing import Optional, List
from datetime import date, datetime
import json

from app.database import get_db
from app.models.user import User
from app.utils.security import require_role
from app.schemas.instructor.insight_schemas import (
    InstructorDailyInsightResponse,
    DailyInsightQueryParams,
    CBCAnalysisRequest,
    InstructorCBCAnalysisResponse,
    AIResourceSuggestionsResponse,
)

router = APIRouter(prefix="/insights", tags=["Instructor AI Insights"])


# ============================================================================
# Daily AI Insights
# ============================================================================

@router.get("/daily", response_model=dict)
async def list_daily_insights(
    start_date: Optional[date] = Query(None, description="Filter insights from this date"),
    end_date: Optional[date] = Query(None, description="Filter insights up to this date"),
    priority: Optional[str] = Query(None, description="Filter by priority (low, medium, high, urgent)"),
    category: Optional[str] = Query(None, description="Filter by category (submissions, sessions, students, earnings, content)"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=50, description="Items per page"),
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """
    Get daily AI insights for the instructor.

    Supports date range filtering, priority/category filters, and pagination.
    Returns most recent insights first.
    """
    try:
        from app.models.instructor.instructor_ai_insight import InstructorDailyInsight

        # Build query
        conditions = [InstructorDailyInsight.instructor_id == current_user.id]

        if start_date:
            conditions.append(InstructorDailyInsight.insight_date >= start_date)
        if end_date:
            conditions.append(InstructorDailyInsight.insight_date <= end_date)

        query = (
            select(InstructorDailyInsight)
            .where(and_(*conditions))
            .order_by(desc(InstructorDailyInsight.insight_date), desc(InstructorDailyInsight.created_at))
        )

        # Get total count
        from sqlalchemy import func

        count_query = (
            select(func.count())
            .select_from(InstructorDailyInsight)
            .where(and_(*conditions))
        )
        count_result = await db.execute(count_query)
        total = count_result.scalar()

        # Apply pagination
        offset = (page - 1) * limit
        query = query.offset(offset).limit(limit)

        result = await db.execute(query)
        insights = result.scalars().all()

        # Post-query filtering on JSONB insight items for priority/category
        filtered_insights = []
        for insight in insights:
            if priority or category:
                filtered_items = []
                for item in (insight.insights or []):
                    matches_priority = (not priority) or item.get("priority") == priority
                    matches_category = (not category) or item.get("category") == category
                    if matches_priority and matches_category:
                        filtered_items.append(item)
                if filtered_items:
                    # Return insight with only matching items
                    insight_dict = {
                        "id": str(insight.id),
                        "instructor_id": str(insight.instructor_id),
                        "insight_date": insight.insight_date.isoformat(),
                        "insights": filtered_items,
                        "generated_at": insight.generated_at.isoformat(),
                        "ai_model_used": insight.ai_model_used,
                        "extra_data": insight.extra_data,
                        "created_at": insight.created_at.isoformat(),
                    }
                    filtered_insights.append(insight_dict)
            else:
                insight_dict = {
                    "id": str(insight.id),
                    "instructor_id": str(insight.instructor_id),
                    "insight_date": insight.insight_date.isoformat(),
                    "insights": insight.insights,
                    "generated_at": insight.generated_at.isoformat(),
                    "ai_model_used": insight.ai_model_used,
                    "extra_data": insight.extra_data,
                    "created_at": insight.created_at.isoformat(),
                }
                filtered_insights.append(insight_dict)

        return {
            "items": filtered_insights,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit if total else 0,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/daily/generate", response_model=InstructorDailyInsightResponse)
async def generate_daily_insight(
    insight_date: Optional[date] = Query(None, description="Date to generate insights for (defaults to today)"),
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """
    Manually trigger AI daily insight generation.

    Generates a fresh set of prioritized insights based on the instructor's
    current activity, pending submissions, upcoming sessions, and student
    engagement metrics.
    """
    try:
        from app.services.instructor.ai_insight_service import generate_daily_insights

        insight = await generate_daily_insights(
            db,
            str(current_user.id),
            insight_date=insight_date,
        )
        return insight

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/daily/{insight_id}", response_model=InstructorDailyInsightResponse)
async def get_daily_insight(
    insight_id: str,
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """
    Get a specific daily insight by ID.

    Only returns insights belonging to the authenticated instructor.
    """
    try:
        from app.models.instructor.instructor_ai_insight import InstructorDailyInsight

        query = select(InstructorDailyInsight).where(
            and_(
                InstructorDailyInsight.id == insight_id,
                InstructorDailyInsight.instructor_id == current_user.id,
            )
        )
        result = await db.execute(query)
        insight = result.scalar_one_or_none()

        if not insight:
            raise HTTPException(
                status_code=404,
                detail="Insight not found or you do not have permission to access it",
            )

        return insight

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/daily/{insight_id}/dismiss")
async def dismiss_daily_insight(
    insight_id: str,
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """
    Dismiss/mark an insight as read.

    Stores dismissal metadata in the insight's extra_data JSONB field.
    """
    try:
        from app.models.instructor.instructor_ai_insight import InstructorDailyInsight

        query = select(InstructorDailyInsight).where(
            and_(
                InstructorDailyInsight.id == insight_id,
                InstructorDailyInsight.instructor_id == current_user.id,
            )
        )
        result = await db.execute(query)
        insight = result.scalar_one_or_none()

        if not insight:
            raise HTTPException(
                status_code=404,
                detail="Insight not found or you do not have permission to access it",
            )

        # Update extra_data with dismissal info
        extra_data = insight.extra_data or {}
        extra_data["dismissed"] = True
        extra_data["dismissed_at"] = datetime.utcnow().isoformat()
        insight.extra_data = extra_data

        await db.commit()
        await db.refresh(insight)

        return {
            "message": "Insight dismissed successfully",
            "insight_id": str(insight.id),
            "dismissed": True,
            "dismissed_at": extra_data["dismissed_at"],
        }

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# CBC Alignment Analysis
# ============================================================================

@router.post("/cbc/analyze", response_model=InstructorCBCAnalysisResponse)
async def analyze_cbc_alignment(
    request: CBCAnalysisRequest,
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """
    Trigger AI-powered CBC (Competency-Based Curriculum) alignment analysis
    for a specific course.

    Analyzes the course content against Kenya's CBC framework and returns
    an alignment score, covered/missing competencies, and actionable suggestions.
    """
    try:
        from app.services.instructor.ai_insight_service import analyze_cbc_alignment as svc_analyze

        analysis = await svc_analyze(
            db,
            course_id=request.course_id,
            instructor_id=str(current_user.id),
        )
        return analysis

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/cbc/analyses", response_model=dict)
async def list_cbc_analyses(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=50, description="Items per page"),
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """
    List CBC alignment analyses for the instructor's courses.

    Returns paginated results ordered by most recently created.
    """
    try:
        from app.models.instructor.instructor_ai_insight import InstructorCBCAnalysis
        from sqlalchemy import func

        # Count total
        count_query = (
            select(func.count())
            .select_from(InstructorCBCAnalysis)
            .where(InstructorCBCAnalysis.instructor_id == current_user.id)
        )
        count_result = await db.execute(count_query)
        total = count_result.scalar()

        # Fetch paginated results
        offset = (page - 1) * limit
        query = (
            select(InstructorCBCAnalysis)
            .where(InstructorCBCAnalysis.instructor_id == current_user.id)
            .order_by(desc(InstructorCBCAnalysis.created_at))
            .offset(offset)
            .limit(limit)
        )
        result = await db.execute(query)
        analyses = result.scalars().all()

        # Serialize
        items = []
        for analysis in analyses:
            items.append({
                "id": str(analysis.id),
                "course_id": str(analysis.course_id),
                "instructor_id": str(analysis.instructor_id),
                "alignment_score": float(analysis.alignment_score),
                "competencies_covered": analysis.competencies_covered,
                "competencies_missing": analysis.competencies_missing,
                "suggestions": analysis.suggestions,
                "ai_model_used": analysis.ai_model_used,
                "analysis_data": analysis.analysis_data,
                "created_at": analysis.created_at.isoformat(),
                "updated_at": analysis.updated_at.isoformat(),
            })

        return {
            "items": items,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit if total else 0,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# AI Resource Suggestions
# ============================================================================

@router.get("/resources", response_model=AIResourceSuggestionsResponse)
async def get_ai_resource_suggestions(
    topic: str = Query(..., min_length=1, description="Topic to find resources for"),
    grade_level: str = Query(..., min_length=1, description="Target grade level (e.g., 'Grade 4', 'PP2')"),
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """
    Get AI-suggested educational resources for a given topic and grade level.

    Delegates to the AI Orchestrator to generate relevant resource
    suggestions aligned with Kenya's CBC curriculum.
    """
    try:
        from app.services.ai_orchestrator import AIOrchestrator

        prompt = (
            f"Suggest educational resources for teaching '{topic}' to {grade_level} students "
            f"in Kenya's CBC curriculum. For each resource, provide: title, type (pdf, link, video, file), "
            f"url, description, and a relevance score (0-100). Return as a structured JSON array."
        )

        ai_orchestrator = AIOrchestrator()
        result = await ai_orchestrator.process_request(
            task_type="research",
            user_prompt=prompt,
            conversation_history=[],
            system_prompt=(
                "You are an educational resource specialist for Kenya's CBC curriculum. "
                "Suggest high-quality, age-appropriate resources."
            ),
        )

        # Parse AI response into resource suggestions
        # Attempt to extract structured data; fall back to a default suggestion
        suggestions = []
        ai_response = result.get("response", "")
        try:
            # Try parsing as JSON if AI returned structured output
            parsed = json.loads(ai_response) if isinstance(ai_response, str) else ai_response
            if isinstance(parsed, list):
                for item in parsed:
                    suggestions.append({
                        "title": item.get("title", "Untitled Resource"),
                        "type": item.get("type", "link"),
                        "url": item.get("url", ""),
                        "description": item.get("description", ""),
                        "relevance_score": item.get("relevance_score", 50),
                    })
        except (json.JSONDecodeError, TypeError):
            # AI returned unstructured text - provide it as a single suggestion
            suggestions.append({
                "title": f"AI Suggestions for {topic}",
                "type": "link",
                "url": "",
                "description": ai_response[:500] if ai_response else "No suggestions available",
                "relevance_score": 50,
            })

        return AIResourceSuggestionsResponse(
            suggestions=suggestions,
            ai_model_used=result.get("model_used", "unknown"),
            generated_at=datetime.utcnow(),
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
