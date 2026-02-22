"""
Avatar Pydantic Schemas

Validation schemas for the 3D avatar feature: preset galleries, user-saved
avatars, Ready Player Me integration, gesture annotations, and avatar
streaming messages.
"""

from datetime import datetime
from typing import Optional, List, Any
from uuid import UUID

from pydantic import BaseModel, Field


# ── Preset avatars (read-only gallery) ────────────────────────────────


class AvatarPreset(BaseModel):
    """A curated preset avatar available in the gallery."""

    id: str = Field(..., description="Preset avatar identifier")
    name: str = Field(..., description="Display name")
    style: str = Field(
        ...,
        pattern="^(stylized|realistic)$",
        description="Visual style: 'stylized' or 'realistic'",
    )
    model_url: str = Field(..., description="URL to GLB model file")
    thumbnail_url: str = Field(..., description="Preview thumbnail URL")
    description: Optional[str] = Field(default=None)
    tags: List[str] = Field(default_factory=list, description="Search tags")


# ── User avatars (CRUD) ──────────────────────────────────────────────


class UserAvatarCreate(BaseModel):
    """Create a new avatar for the current user."""

    name: str = Field(..., min_length=1, max_length=100)
    avatar_type: str = Field(
        ...,
        pattern="^(preset_stylized|preset_realistic|custom_rpm)$",
        description="Avatar source type",
    )
    model_url: str = Field(..., max_length=500, description="GLB model URL")
    thumbnail_url: Optional[str] = Field(default=None, max_length=500)
    rpm_avatar_id: Optional[str] = Field(default=None, max_length=200)
    customization_data: dict = Field(default_factory=dict)


class UserAvatarResponse(BaseModel):
    """Full avatar data returned from API."""

    id: UUID
    user_id: UUID
    name: str
    avatar_type: str
    model_url: str
    thumbnail_url: Optional[str]
    rpm_avatar_id: Optional[str]
    is_active: bool
    customization_data: dict
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserAvatarUpdate(BaseModel):
    """Partial update for a saved avatar."""

    name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    thumbnail_url: Optional[str] = Field(default=None, max_length=500)
    customization_data: Optional[dict] = None


class AvatarActivateRequest(BaseModel):
    """Request to activate a specific avatar."""

    avatar_id: UUID = Field(..., description="ID of the avatar to activate")


# ── Ready Player Me integration ───────────────────────────────────────


class PhotoUploadResponse(BaseModel):
    """Response after uploading a selfie for RPM avatar generation."""

    rpm_session_url: str = Field(
        ..., description="URL to the RPM editor session"
    )
    message: str = Field(default="Redirect the user to the RPM editor URL.")


class RPMCallbackRequest(BaseModel):
    """Webhook payload when RPM finishes avatar creation."""

    rpm_avatar_id: str = Field(..., description="Ready Player Me avatar ID")
    model_url: str = Field(..., description="URL to the generated GLB model")
    thumbnail_url: Optional[str] = None


# ── Gesture annotations ──────────────────────────────────────────────


class GestureAnnotation(BaseModel):
    """A single gesture annotation embedded in an AI response."""

    gesture: str = Field(
        ...,
        description="Gesture type: smile, nod, think, point, excited, calm, wave, emphasize",
    )
    char_position: int = Field(
        ..., ge=0, description="Character offset in the clean text"
    )
    timestamp_ms: Optional[int] = Field(
        default=None, ge=0, description="Estimated timestamp in milliseconds"
    )


class AnnotatedResponse(BaseModel):
    """AI response with gesture annotations parsed out."""

    clean_text: str = Field(..., description="Response text with markers removed")
    gesture_annotations: List[GestureAnnotation] = Field(default_factory=list)
    raw_annotated_text: str = Field(
        ..., description="Original text with [gesture] markers"
    )


# ── Avatar streaming messages ─────────────────────────────────────────


class AvatarStreamRequest(BaseModel):
    """Client request to start avatar narration over WebSocket."""

    text: str = Field(..., min_length=1, max_length=10000)
    gesture_annotations: List[GestureAnnotation] = Field(default_factory=list)
    avatar_id: Optional[str] = None


class AvatarStreamMessage(BaseModel):
    """A single message in the avatar narration stream."""

    type: str = Field(
        ...,
        pattern="^(audio_chunk|viseme|gesture|text|end|error)$",
        description="Message type",
    )
    data: Any = Field(default=None, description="Type-specific payload")


class VisemeData(BaseModel):
    """Viseme data for lip sync."""

    viseme_id: int = Field(..., ge=0, le=21, description="Oculus viseme index")
    timestamp_ms: int = Field(..., ge=0)
    duration_ms: int = Field(default=80, ge=0)


# ── Response mode update (extended) ───────────────────────────────────


class ResponseModeUpdateExtended(BaseModel):
    """Update response mode to include avatar option."""

    response_mode: str = Field(
        ...,
        pattern="^(text|voice|avatar)$",
        description="Preferred response mode: 'text', 'voice', or 'avatar'",
    )
