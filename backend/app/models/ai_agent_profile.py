"""
AI Agent Profile - Per-user AI assistant customization
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
