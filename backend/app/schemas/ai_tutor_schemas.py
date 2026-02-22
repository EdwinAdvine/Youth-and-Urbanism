"""
AI Tutor Pydantic Schemas

This module contains Pydantic schemas for the AI tutor feature - the core
functionality of Urban Home School. These schemas handle validation for
AI-powered tutoring interactions, conversation history, and tutor status.

The AI tutor supports multi-AI orchestration with multiple providers
(Gemini, Claude, GPT-4, Grok) and multiple response modes (text, voice).
"""

from datetime import datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    """
    Individual chat message in a conversation.

    Used for both user messages and AI tutor responses in conversation history.
    """
    role: str = Field(
        ...,
        pattern="^(user|assistant)$",
        description="Message role: 'user' for student messages, 'assistant' for AI responses"
    )
    content: str = Field(..., description="Message content/text")
    timestamp: datetime = Field(..., description="When the message was sent")


class ChatRequest(BaseModel):
    """
    Request schema for sending a message to the AI tutor.

    Example:
        {
            "message": "Can you help me understand photosynthesis?",
            "include_context": true,
            "context_messages": 10
        }
    """
    message: str = Field(
        ...,
        min_length=1,
        max_length=5000,
        description="Student's message to the AI tutor"
    )
    include_context: bool = Field(
        default=True,
        description="Whether to include past conversation for context"
    )
    context_messages: int = Field(
        default=10,
        ge=1,
        le=50,
        description="Number of previous messages to include for context"
    )


class ChatResponse(BaseModel):
    """
    Response schema from the AI tutor.

    Example:
        {
            "message": "Photosynthesis is the process by which plants...",
            "response_mode": "text",
            "audio_url": null,
            "conversation_id": "123e4567-e89b-12d3-a456-426614174000",
            "timestamp": "2024-01-15T10:30:00"
        }
    """
    message: str = Field(..., description="AI tutor's response text")
    response_mode: str = Field(
        ...,
        description="Response mode used: 'text' or 'voice'"
    )
    audio_url: Optional[str] = Field(
        default=None,
        description="URL to audio response (when response_mode is 'voice')"
    )
    conversation_id: UUID = Field(
        ...,
        description="Unique identifier for this conversation/tutor instance"
    )
    timestamp: datetime = Field(..., description="When the response was generated")


class ResponseModeUpdate(BaseModel):
    """
    Schema for updating the AI tutor's response mode preference.

    Students can choose how they want the AI to respond: text or voice.
    """
    response_mode: str = Field(
        ...,
        pattern="^(text|voice)$",
        description="Preferred response mode: 'text' or 'voice'"
    )


class TutorStatus(BaseModel):
    """
    AI tutor status and metrics for a specific student.

    Provides comprehensive information about the student's AI tutor instance,
    including usage statistics, performance metrics, and learning path progress.
    """
    id: UUID = Field(..., description="AI tutor instance ID")
    student_id: UUID = Field(..., description="Student this tutor is assigned to")
    name: str = Field(..., description="AI tutor's name")
    response_mode: str = Field(
        ...,
        description="Current response mode: 'text' or 'voice'"
    )
    total_interactions: int = Field(
        ...,
        ge=0,
        description="Total number of interactions with this tutor"
    )
    last_interaction: Optional[datetime] = Field(
        default=None,
        description="Timestamp of the last interaction"
    )
    performance_metrics: dict = Field(
        ...,
        description="Performance metrics (e.g., response time, accuracy, engagement)"
    )
    learning_path: dict = Field(
        ...,
        description="Current learning path and progress data"
    )
    created_at: datetime = Field(..., description="When the tutor was created")

    class Config:
        from_attributes = True


class ConversationHistory(BaseModel):
    """
    Complete conversation history between a student and their AI tutor.

    Used for retrieving past conversations for review or context.
    """
    tutor_id: UUID = Field(..., description="AI tutor instance ID")
    student_id: UUID = Field(..., description="Student ID")
    messages: List[ChatMessage] = Field(
        ...,
        description="List of messages in chronological order"
    )
    total_messages: int = Field(..., ge=0, description="Total number of messages")
    oldest_message: Optional[datetime] = Field(
        default=None,
        description="Timestamp of the oldest message in this history"
    )
    newest_message: Optional[datetime] = Field(
        default=None,
        description="Timestamp of the most recent message"
    )


class AIProviderInfo(BaseModel):
    """
    Information about an AI provider (admin feature).

    Used for listing available AI providers and their capabilities.
    Admins can view which AI models are available and their specializations.
    """
    id: UUID = Field(..., description="AI provider ID")
    name: str = Field(..., description="AI provider name (e.g., 'Gemini Pro', 'Claude 3.5')")
    provider_type: str = Field(
        ...,
        description="Provider type (e.g., 'google', 'anthropic', 'openai', 'x-ai')"
    )
    specialization: Optional[str] = Field(
        default=None,
        description="AI specialization (e.g., 'reasoning', 'creative', 'research')"
    )
    is_active: bool = Field(
        ...,
        description="Whether this provider is currently active and available"
    )
    is_recommended: bool = Field(
        ...,
        description="Whether this provider is recommended for general use"
    )
    description: Optional[str] = Field(
        default=None,
        description="Detailed description of the provider's capabilities"
    )

    class Config:
        from_attributes = True
