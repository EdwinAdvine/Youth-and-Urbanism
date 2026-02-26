"""
AI Agent Profile Model

Per-user customization for the AI assistant ("The Bird AI"). Each user
can personalize their AI tutor's name, avatar, persona, language,
expertise focus areas, response style, and quick-action shortcuts.
This profile drives the system prompt and UI presentation of the AI
assistant throughout the student dashboard and CoPilot interface.
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Enum as SAEnum, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class ResponseStyle(str, enum.Enum):
    concise = "concise"
    detailed = "detailed"
    conversational = "conversational"
    academic = "academic"


class AIAgentProfile(Base):
    """
    Per-user AI assistant configuration.

    Stores the user's chosen agent name, avatar, persona prompt, preferred
    language, expertise subjects, response style (concise/detailed/
    conversational/academic), and quick-action shortcuts. One profile per
    user (unique user_id). The AI orchestrator reads these settings when
    building the system prompt for each conversation.
    """

    __tablename__ = "ai_agent_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    agent_name = Column(String(100), default="The Bird AI")
    avatar_url = Column(String(500), nullable=True)
    persona = Column(Text, default="A helpful, encouraging AI tutor for Kenyan students.")
    preferred_language = Column(String(10), default="en")
    expertise_focus = Column(JSON, default=list)  # ["math", "science", "english"]
    response_style = Column(SAEnum(ResponseStyle), default=ResponseStyle.conversational)
    quick_action_shortcuts = Column(JSON, default=list)  # [{"label": "Explain", "action": "explain_topic"}]
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", backref="ai_agent_profile")
