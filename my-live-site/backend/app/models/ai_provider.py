"""
AIProvider Model - Flexible Multi-AI System

This model enables admins to configure any AI provider (text, voice, video, multimodal)
through the admin interface without code changes. Supports dynamic API configuration,
cost tracking, and capability-based routing.

Admin can add providers like:
- Text: Gemini, Claude, GPT-4, Grok, Llama, etc.
- Voice: ElevenLabs, Google TTS, Azure Speech, etc.
- Video: Synthesia, D-ID, HeyGen, etc.
- Multimodal: Any provider supporting multiple modalities
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Numeric
from sqlalchemy.dialects.postgresql import UUID, JSONB

from app.database import Base


class AIProvider(Base):
    """
    Admin-configurable AI Provider model for flexible multi-AI orchestration.

    This model allows administrators to:
    - Add any AI provider without code changes
    - Configure API endpoints and authentication
    - Set provider specializations and capabilities
    - Track costs and usage
    - Enable/disable providers dynamically
    - Mark recommended providers for specific tasks

    Attributes:
        id: Unique identifier (UUID)
        name: Provider name (e.g., "Gemini Pro", "Claude 3.5 Sonnet")
        provider_type: Type of provider ("text", "voice", "video", "multimodal")
        api_endpoint: API URL for the provider
        api_key_encrypted: Encrypted API key (using Fernet encryption)
        specialization: Provider's strength ("reasoning", "creative", "research", etc.)
        is_active: Whether the provider is currently enabled
        is_recommended: Platform recommendation flag
        cost_per_request: Average cost per API request in USD
        configuration: Flexible JSONB field for provider-specific settings
        description: Human-readable description of the provider
        created_at: Timestamp of provider registration
        updated_at: Timestamp of last configuration update
    """

    __tablename__ = "ai_providers"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Provider identification
    name = Column(String(100), nullable=False, index=True)
    provider_type = Column(String(50), nullable=False, index=True)

    # API configuration
    api_endpoint = Column(String(255), nullable=False)
    api_key_encrypted = Column(String(500), nullable=False)

    # Provider capabilities
    specialization = Column(String(100), nullable=True, index=True)
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    is_recommended = Column(Boolean, default=False, nullable=False)

    # Cost tracking
    cost_per_request = Column(Numeric(10, 6), nullable=True)

    # Model-specific settings (flexible JSONB)
    configuration = Column(JSONB, default={}, nullable=False)

    # Metadata
    description = Column(String(500), nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self) -> str:
        """String representation for debugging."""
        return (
            f"<AIProvider(id={self.id}, name='{self.name}', "
            f"type='{self.provider_type}', active={self.is_active}, "
            f"specialization='{self.specialization}')>"
        )

    @property
    def is_text_provider(self) -> bool:
        """
        Check if provider supports text generation.

        Returns:
            bool: True if provider supports text or is multimodal
        """
        return 'text' in self.provider_type.lower() or self.provider_type.lower() == 'multimodal'

    @property
    def is_voice_provider(self) -> bool:
        """
        Check if provider supports voice/speech generation.

        Returns:
            bool: True if provider supports voice or is multimodal
        """
        return 'voice' in self.provider_type.lower() or self.provider_type.lower() == 'multimodal'

    @property
    def is_video_provider(self) -> bool:
        """
        Check if provider supports video generation.

        Returns:
            bool: True if provider supports video or is multimodal
        """
        return 'video' in self.provider_type.lower() or self.provider_type.lower() == 'multimodal'
