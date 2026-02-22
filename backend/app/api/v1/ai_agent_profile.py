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
    """Response schema for a user's AI agent profile settings."""
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
    """Request schema for updating AI agent profile fields (all optional)."""
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
    from app.services.copilot_service import CopilotService

    # Get role-specific defaults for fallback values
    role_defaults = CopilotService.ROLE_DEFAULTS.get(current_user.role, {})
    default_name = role_defaults.get("agent_name", "Urban Home School AI")
    default_persona = role_defaults.get("persona", "A helpful AI assistant on the Urban Home School platform.")
    default_expertise = role_defaults.get("expertise_focus", [])

    try:
        from app.models.ai_agent_profile import AIAgentProfile
        stmt = select(AIAgentProfile).where(AIAgentProfile.user_id == current_user.id)
        result = await db.execute(stmt)
        profile = result.scalar_one_or_none()

        if profile:
            return AgentProfileResponse(
                agent_name=profile.agent_name or default_name,
                avatar_url=profile.avatar_url,
                persona=profile.persona or default_persona,
                preferred_language=profile.preferred_language or "en",
                expertise_focus=profile.expertise_focus or default_expertise,
                response_style=profile.response_style.value if profile.response_style else "conversational",
                quick_action_shortcuts=profile.quick_action_shortcuts or [],
            )
    except Exception:
        pass

    # Return role-specific defaults if no profile exists
    return AgentProfileResponse(
        agent_name=default_name,
        persona=default_persona,
        expertise_focus=default_expertise,
    )


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
    """Reset the current user's AI agent profile to role-specific defaults."""
    from app.models.ai_agent_profile import AIAgentProfile, ResponseStyle
    from app.services.copilot_service import CopilotService

    # Get role-specific defaults (not student-centric generic defaults)
    role_defaults = CopilotService.ROLE_DEFAULTS.get(current_user.role, {})
    default_name = role_defaults.get("agent_name", "Urban Home School AI")
    default_persona = role_defaults.get("persona", "A helpful AI assistant on the Urban Home School platform.")
    default_expertise = role_defaults.get("expertise_focus", [])

    stmt = select(AIAgentProfile).where(AIAgentProfile.user_id == current_user.id)
    result = await db.execute(stmt)
    profile = result.scalar_one_or_none()

    if profile:
        # Reset fields to role-specific defaults instead of deleting
        profile.agent_name = default_name
        profile.persona = default_persona
        profile.expertise_focus = default_expertise
        profile.preferred_language = "en"
        profile.response_style = ResponseStyle.conversational
        profile.avatar_url = None
        profile.quick_action_shortcuts = []
        await db.commit()
        await db.refresh(profile)

    return AgentProfileResponse(
        agent_name=default_name,
        persona=default_persona,
        expertise_focus=default_expertise,
    )
