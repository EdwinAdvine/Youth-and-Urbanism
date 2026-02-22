"""
CoPilot API Schemas

Pydantic models for request/response validation in the CoPilot API.
These schemas handle chat requests, session management, and role-specific insights.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from uuid import UUID
from pydantic import BaseModel, Field


# ============================================================================
# Chat Request/Response Schemas
# ============================================================================

class CopilotChatRequest(BaseModel):
    """Request schema for sending a message to the AI CoPilot."""
    message: str = Field(..., min_length=1, max_length=5000, description="User's message to the AI")
    session_id: Optional[UUID] = Field(None, description="Session ID (null creates new session)")
    response_mode: str = Field(
        default="text",
        pattern="^(text|voice)$",
        description="Response format: text or voice"
    )
    include_context: bool = Field(
        default=True,
        description="Whether to include conversation history in context"
    )
    context_messages: int = Field(
        default=10,
        ge=1,
        le=50,
        description="Number of recent messages to include as context"
    )


class CopilotChatResponse(BaseModel):
    """Response schema for AI CoPilot chat messages."""
    message: str = Field(..., description="AI's text response")
    session_id: UUID = Field(..., description="Session ID for this conversation")
    message_id: UUID = Field(..., description="Unique ID for this message")
    response_mode: str = Field(..., description="Actual response mode delivered")
    audio_url: Optional[str] = Field(None, description="URL to audio file (voice mode)")
    provider_used: Optional[str] = Field(None, description="AI provider that generated response")
    timestamp: datetime = Field(..., description="Response timestamp")

    class Config:
        from_attributes = True


# ============================================================================
# Session Management Schemas
# ============================================================================

class CopilotSessionSummary(BaseModel):
    """Summary of a CoPilot session (list view)."""
    id: UUID
    title: str
    summary: Optional[str] = None
    message_count: int
    response_mode: str
    is_pinned: bool
    last_message_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CopilotSessionList(BaseModel):
    """Paginated list of CoPilot sessions."""
    sessions: List[CopilotSessionSummary]
    total: int
    page: int
    page_size: int


class CopilotMessageOut(BaseModel):
    """Individual message in a session."""
    id: UUID
    role: str  # "user" or "assistant"
    content: str
    audio_url: Optional[str] = None
    provider_used: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class CopilotSessionDetail(BaseModel):
    """Detailed view of a session with all messages."""
    id: UUID
    title: str
    summary: Optional[str] = None
    response_mode: str
    is_pinned: bool
    message_count: int
    messages: List[CopilotMessageOut]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CopilotSessionUpdate(BaseModel):
    """Schema for updating session metadata."""
    title: Optional[str] = Field(None, max_length=255)
    is_pinned: Optional[bool] = None
    response_mode: Optional[str] = Field(None, pattern="^(text|voice)$")


# ============================================================================
# Insights Schemas
# ============================================================================

class CopilotInsight(BaseModel):
    """Single contextual insight or tip for the user."""
    type: str = Field(
        ...,
        description="Insight category: tip, reminder, alert, metric"
    )
    title: str = Field(..., description="Short insight title")
    body: str = Field(..., description="Detailed insight message")
    priority: int = Field(
        default=0,
        description="Priority level (higher = more important)"
    )
    action_url: Optional[str] = Field(
        None,
        description="Frontend route to navigate to when clicked"
    )
    metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Additional insight metadata"
    )


class CopilotInsightsResponse(BaseModel):
    """Response containing role-specific insights."""
    role: str = Field(..., description="User's role")
    insights: List[CopilotInsight]
    generated_at: datetime = Field(..., description="When insights were generated")
