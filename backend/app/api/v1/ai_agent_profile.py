"""
AI Agent Profile API - Per-user AI assistant customization
"""
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.utils.security import get_current_user


router = APIRouter()


class AgentProfileResponse(BaseModel):
    agent_name: str = "The Bird AI"
    avatar_url: Optional[str] = None
    persona: str = "A helpful, encouraging AI tutor for Kenyan students."
    preferred_language: str = "en"
    expertise_focus: List[str] = []
    response_style: str = "conversational"
    quick_action_shortcuts: List[dict] = []

    class Config:
        from_attributes = True


class AgentProfileUpdate(BaseModel):
    agent_name: Optional[str] = Field(None, max_length=100)
    avatar_url: Optional[str] = Field(None, max_length=500)
    persona: Optional[str] = Field(None, max_length=2000)
    preferred_language: Optional[str] = Field(None, max_length=10)
    expertise_focus: Optional[List[str]] = None
    response_style: Optional[str] = None
    quick_action_shortcuts: Optional[List[dict]] = None


@router.get("/ai-agent/profile", response_model=AgentProfileResponse)
async def get_agent_profile(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Get the current user's AI agent profile."""
    try:
        from app.models.ai_agent_profile import AIAgentProfile
        stmt = select(AIAgentProfile).where(AIAgentProfile.user_id == current_user.id)
        result = await db.execute(stmt)
        profile = result.scalar_one_or_none()

        if profile:
            return AgentProfileResponse(
                agent_name=profile.agent_name or "The Bird AI",
                avatar_url=profile.avatar_url,
                persona=profile.persona or "A helpful, encouraging AI tutor for Kenyan students.",
                preferred_language=profile.preferred_language or "en",
                expertise_focus=profile.expertise_focus or [],
                response_style=profile.response_style.value if profile.response_style else "conversational",
                quick_action_shortcuts=profile.quick_action_shortcuts or [],
            )
    except Exception:
        pass

    # Return defaults if no profile exists
    return AgentProfileResponse()


@router.put("/ai-agent/profile", response_model=AgentProfileResponse)
async def update_agent_profile(
    data: AgentProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Update the current user's AI agent profile."""
    from app.models.ai_agent_profile import AIAgentProfile, ResponseStyle

    stmt = select(AIAgentProfile).where(AIAgentProfile.user_id == current_user.id)
    result = await db.execute(stmt)
    profile = result.scalar_one_or_none()

    if not profile:
        profile = AIAgentProfile(user_id=current_user.id)
        db.add(profile)

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if key == "response_style" and value:
            try:
                setattr(profile, key, ResponseStyle(value))
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid response style: {value}")
        else:
            setattr(profile, key, value)

    await db.commit()
    await db.refresh(profile)

    return AgentProfileResponse(
        agent_name=profile.agent_name or "The Bird AI",
        avatar_url=profile.avatar_url,
        persona=profile.persona or "A helpful, encouraging AI tutor for Kenyan students.",
        preferred_language=profile.preferred_language or "en",
        expertise_focus=profile.expertise_focus or [],
        response_style=profile.response_style.value if profile.response_style else "conversational",
        quick_action_shortcuts=profile.quick_action_shortcuts or [],
    )


@router.post("/ai-agent/profile/reset", response_model=AgentProfileResponse)
async def reset_agent_profile(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Reset the current user's AI agent profile to defaults."""
    from app.models.ai_agent_profile import AIAgentProfile

    stmt = select(AIAgentProfile).where(AIAgentProfile.user_id == current_user.id)
    result = await db.execute(stmt)
    profile = result.scalar_one_or_none()

    if profile:
        await db.delete(profile)
        await db.commit()

    return AgentProfileResponse()
