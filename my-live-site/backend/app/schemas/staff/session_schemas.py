from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class SessionCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    session_type: str = Field(..., pattern="^(class|tutoring|meeting|workshop)$")
    max_participants: int = Field(default=30, ge=1, le=30)
    scheduled_at: datetime
    recording_enabled: bool = False
    screen_share_enabled: bool = True
    course_id: Optional[str] = None
    grade_level: Optional[str] = None


class SessionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    status: Optional[str] = None
    recording_enabled: Optional[bool] = None


class LiveKitTokenResponse(BaseModel):
    token: str
    room_name: str
    server_url: str


class BreakoutRoomCreate(BaseModel):
    name: str
    participant_ids: List[str] = []
