"""
AI Tutor Model - Core Feature

This model represents the dedicated AI tutor assigned to each student.
Each student has exactly one AI tutor that serves as their lifetime learning companion,
tracking conversation history, learning paths, and performance metrics.

The AI tutor personalizes the learning experience and adapts to each student's needs.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB

from app.database import Base


class AITutor(Base):
    """
    Dedicated AI tutor for each student - lifetime learning companion.

    Core feature providing one-to-one AI tutoring with:
    - Persistent conversation history
    - Personalized learning paths
    - Performance tracking and analytics
    - Multi-modal response modes (text, voice)
    """
    __tablename__ = "ai_tutors"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # One-to-one relationship with student
    student_id = Column(
        UUID(as_uuid=True),
        ForeignKey("students.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True
    )

    # Tutor personalization
    name = Column(String(100), nullable=False, default="Birdy")  # Personalized tutor name (e.g., "Birdy", "Einstein")

    # Unique AI Tutor identifier code — format: {admission_number}-AIT{seq}
    # Example: UHS/2026/G3/001-AIT001
    ait_code = Column(String(50), unique=True, nullable=True, index=True)

    # Conversation history (JSONB array of messages)
    # Format: [{"role": "user"|"assistant", "content": str, "timestamp": str}]
    conversation_history = Column(JSONB, default=list, nullable=False)

    # Learning path tracking
    learning_path = Column(JSONB, default=dict, nullable=False)  # Personalized curriculum

    # Performance metrics
    performance_metrics = Column(JSONB, default=dict, nullable=False)  # Strengths, weaknesses, progress

    # Response mode preference (text, voice, avatar)
    response_mode = Column(
        String(20),
        default='text',
        nullable=False,
        index=True
    )  # 'text', 'voice', 'avatar'

    # Interaction tracking
    total_interactions = Column(Integer, default=0, nullable=False)
    last_interaction = Column(DateTime, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self) -> str:
        """String representation for debugging."""
        return (
            f"<AITutor(id={self.id}, name='{self.name}', "
            f"student_id={self.student_id}, mode={self.response_mode}, "
            f"interactions={self.total_interactions})>"
        )

    @property
    def is_text_mode(self) -> bool:
        """Check if tutor is in text response mode."""
        return self.response_mode == 'text'

    @property
    def is_voice_mode(self) -> bool:
        """Check if tutor is in voice response mode."""
        return self.response_mode == 'voice'

    @property
    def is_avatar_mode(self) -> bool:
        """Check if tutor is in avatar (3D talking head) response mode."""
        return self.response_mode == 'avatar'

    def add_message(self, role: str, content: str) -> None:
        """
        Add a message to the conversation history.

        Args:
            role: The message role ('user' or 'assistant')
            content: The message content
        """
        if self.conversation_history is None:
            self.conversation_history = []

        message = {
            "role": role,
            "content": content,
            "timestamp": datetime.utcnow().isoformat()
        }

        self.conversation_history.append(message)
        self.total_interactions += 1
        self.last_interaction = datetime.utcnow()
