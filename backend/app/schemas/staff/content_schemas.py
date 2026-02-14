from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class ContentCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    content_type: str = Field(..., pattern="^(lesson|quiz|worksheet|activity|resource)$")
    body: Optional[str] = None
    body_json: Optional[Dict[str, Any]] = None
    course_id: Optional[str] = None
    grade_levels: List[str] = []
    learning_area: Optional[str] = None
    cbc_tags: List[Dict[str, Any]] = []


class ContentUpdate(BaseModel):
    title: Optional[str] = None
    body: Optional[str] = None
    body_json: Optional[Dict[str, Any]] = None
    status: Optional[str] = None
    cbc_tags: Optional[List[Dict[str, Any]]] = None
    grade_levels: Optional[List[str]] = None
    learning_area: Optional[str] = None


class ContentPublish(BaseModel):
    reviewer_notes: Optional[str] = None


class ContentReject(BaseModel):
    reason: str


class VersionResponse(BaseModel):
    id: str
    version_number: int
    changes_summary: Optional[str]
    created_by: Dict[str, Any]
    created_at: datetime


class CollabSessionCreate(BaseModel):
    content_id: str
