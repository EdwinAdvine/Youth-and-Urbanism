"""
Pydantic Schemas for AI Provider Management

This module defines request/response schemas for the AI Provider admin interface,
allowing admins to configure any AI provider (text, voice, video, multimodal)
through the admin API without code changes.
"""

from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID
from decimal import Decimal

from pydantic import BaseModel, Field, ConfigDict, field_validator


class AIProviderBase(BaseModel):
    """Base schema for AI Provider with common fields."""

    name: str = Field(..., min_length=1, max_length=100, description="Provider name (e.g., 'Gemini Pro', 'Claude 3.5 Sonnet')")
    provider_type: str = Field(..., description="Provider type: 'text', 'voice', 'video', or 'multimodal'")
    api_endpoint: str = Field(..., min_length=1, max_length=255, description="API URL for the provider")
    specialization: Optional[str] = Field(None, max_length=100, description="Provider's strength: 'reasoning', 'creative', 'research', 'general'")
    is_recommended: bool = Field(False, description="Whether this provider is recommended by the platform")
    cost_per_request: Optional[Decimal] = Field(None, ge=0, description="Average cost per API request in USD")
    configuration: Dict[str, Any] = Field(default_factory=dict, description="Flexible JSONB field for provider-specific settings")
    description: Optional[str] = Field(None, max_length=500, description="Human-readable description of the provider")

    @field_validator('provider_type')
    @classmethod
    def validate_provider_type(cls, v: str) -> str:
        """Validate provider type is one of the allowed values."""
        allowed_types = ['text', 'voice', 'video', 'multimodal']
        if v.lower() not in allowed_types:
            raise ValueError(f"provider_type must be one of: {', '.join(allowed_types)}")
        return v.lower()

    @field_validator('specialization')
    @classmethod
    def validate_specialization(cls, v: Optional[str]) -> Optional[str]:
        """Validate specialization is one of the allowed values."""
        if v is None:
            return v
        allowed_specs = ['reasoning', 'creative', 'research', 'general', 'voice_generation', 'video_generation']
        if v.lower() not in allowed_specs:
            raise ValueError(f"specialization must be one of: {', '.join(allowed_specs)}")
        return v.lower()


class AIProviderCreate(AIProviderBase):
    """Schema for creating a new AI Provider."""

    api_key: str = Field(..., min_length=1, description="API key for the provider (will be encrypted before storage)")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "Gemini Pro",
                "provider_type": "text",
                "api_endpoint": "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent",
                "api_key": "AIzaSyD...",
                "specialization": "general",
                "is_recommended": True,
                "cost_per_request": 0.0001,
                "configuration": {
                    "temperature": 0.7,
                    "max_tokens": 2048,
                    "top_p": 0.9
                },
                "description": "Google's Gemini Pro model for general tutoring and reasoning"
            }
        }
    )


class AIProviderUpdate(BaseModel):
    """Schema for updating an existing AI Provider."""

    name: Optional[str] = Field(None, min_length=1, max_length=100)
    provider_type: Optional[str] = Field(None)
    api_endpoint: Optional[str] = Field(None, min_length=1, max_length=255)
    api_key: Optional[str] = Field(None, min_length=1, description="New API key (will be encrypted)")
    specialization: Optional[str] = Field(None, max_length=100)
    is_active: Optional[bool] = Field(None)
    is_recommended: Optional[bool] = Field(None)
    cost_per_request: Optional[Decimal] = Field(None, ge=0)
    configuration: Optional[Dict[str, Any]] = Field(None)
    description: Optional[str] = Field(None, max_length=500)

    @field_validator('provider_type')
    @classmethod
    def validate_provider_type(cls, v: Optional[str]) -> Optional[str]:
        """Validate provider type is one of the allowed values."""
        if v is None:
            return v
        allowed_types = ['text', 'voice', 'video', 'multimodal']
        if v.lower() not in allowed_types:
            raise ValueError(f"provider_type must be one of: {', '.join(allowed_types)}")
        return v.lower()

    @field_validator('specialization')
    @classmethod
    def validate_specialization(cls, v: Optional[str]) -> Optional[str]:
        """Validate specialization is one of the allowed values."""
        if v is None:
            return v
        allowed_specs = ['reasoning', 'creative', 'research', 'general', 'voice_generation', 'video_generation']
        if v.lower() not in allowed_specs:
            raise ValueError(f"specialization must be one of: {', '.join(allowed_specs)}")
        return v.lower()

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "Gemini Pro Updated",
                "is_active": True,
                "cost_per_request": 0.00015,
                "configuration": {
                    "temperature": 0.8,
                    "max_tokens": 4096
                }
            }
        }
    )


class AIProviderResponse(AIProviderBase):
    """Schema for AI Provider response (without decrypted API key)."""

    id: UUID = Field(..., description="Unique identifier for the provider")
    is_active: bool = Field(..., description="Whether the provider is currently enabled")
    created_at: datetime = Field(..., description="Timestamp of provider registration")
    updated_at: datetime = Field(..., description="Timestamp of last configuration update")

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
                "name": "Gemini Pro",
                "provider_type": "text",
                "api_endpoint": "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent",
                "specialization": "general",
                "is_active": True,
                "is_recommended": True,
                "cost_per_request": 0.0001,
                "configuration": {
                    "temperature": 0.7,
                    "max_tokens": 2048
                },
                "description": "Google's Gemini Pro model for general tutoring and reasoning",
                "created_at": "2024-01-15T10:30:00Z",
                "updated_at": "2024-01-15T10:30:00Z"
            }
        }
    )


class AIProviderListResponse(BaseModel):
    """Schema for list of AI Providers."""

    providers: list[AIProviderResponse] = Field(..., description="List of AI providers")
    total: int = Field(..., description="Total number of providers")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "providers": [
                    {
                        "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
                        "name": "Gemini Pro",
                        "provider_type": "text",
                        "specialization": "general",
                        "is_active": True,
                        "is_recommended": True
                    }
                ],
                "total": 1
            }
        }
    )


class RecommendedProviderInfo(BaseModel):
    """Schema for recommended provider information (public endpoint)."""

    name: str = Field(..., description="Provider name")
    description: str = Field(..., description="Description of the provider's strengths")
    specialization: str = Field(..., description="Provider specialization")
    provider_type: str = Field(..., description="Type of provider")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "Gemini Pro",
                "description": "Best for general tutoring and reasoning tasks",
                "specialization": "general",
                "provider_type": "text"
            }
        }
    )
