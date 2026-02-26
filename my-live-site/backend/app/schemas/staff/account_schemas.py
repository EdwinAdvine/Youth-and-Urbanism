"""
Account & Preferences Schemas

Request/response schemas for staff profile, preferences, security, and audit.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, EmailStr


# ── Profile ─────────────────────────────────────────────────

class StaffProfileResponse(BaseModel):
    id: str
    user_id: str
    email: str
    first_name: str
    last_name: str
    department: Optional[str] = None
    position: Optional[str] = None
    employee_id: Optional[str] = None
    specializations: List[str] = Field(default_factory=list)
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    phone: Optional[str] = None
    team_id: Optional[str] = None
    team_name: Optional[str] = None
    is_department_lead: bool = False
    view_mode: str = "teacher_focus"
    hired_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    bio: Optional[str] = Field(None, max_length=1000)
    phone: Optional[str] = Field(None, max_length=20)
    avatar_url: Optional[str] = None
    specializations: Optional[List[str]] = None


# ── Preferences ─────────────────────────────────────────────

class PreferencesUpdate(BaseModel):
    view_mode: Optional[str] = Field(None, description="teacher_focus | operations_focus | custom")
    custom_layout: Optional[Dict[str, Any]] = None
    theme: Optional[str] = Field(None, description="light | dark | system")
    sidebar_collapsed: Optional[bool] = None
    keyboard_shortcuts_enabled: Optional[bool] = None
    compact_mode: Optional[bool] = None


class PreferencesResponse(BaseModel):
    view_mode: str = "teacher_focus"
    custom_layout: Optional[Dict[str, Any]] = None
    theme: str = "system"
    sidebar_collapsed: bool = False
    keyboard_shortcuts_enabled: bool = True
    compact_mode: bool = False

    class Config:
        from_attributes = True


# ── Notification Preferences ───────────────────────────────

class NotificationChannels(BaseModel):
    in_app: bool = True
    push: bool = True
    email: bool = True


class QuietHours(BaseModel):
    enabled: bool = False
    start: str = "22:00"
    end: str = "07:00"
    timezone: str = "Africa/Nairobi"


class NotificationPrefUpdate(BaseModel):
    channels: Optional[NotificationChannels] = None
    digest_frequency: Optional[str] = Field(None, description="realtime | hourly | daily | weekly")
    quiet_hours: Optional[QuietHours] = None
    categories: Optional[Dict[str, bool]] = None


class NotificationPrefResponse(BaseModel):
    user_id: str
    channels: NotificationChannels = NotificationChannels()
    digest_frequency: str = "realtime"
    quiet_hours: QuietHours = QuietHours()
    categories: Dict[str, bool] = Field(default_factory=lambda: {
        "tickets": True,
        "moderation": True,
        "sla_alerts": True,
        "sessions": True,
        "content": True,
        "system": True,
    })

    class Config:
        from_attributes = True


# ── Security ────────────────────────────────────────────────

class PasswordChange(BaseModel):
    current_password: str = Field(..., min_length=8)
    new_password: str = Field(..., min_length=8)


class ActiveSession(BaseModel):
    session_id: str
    ip_address: str
    user_agent: str
    location: Optional[str] = None
    created_at: datetime
    last_active: datetime
    is_current: bool = False


class SecurityOverview(BaseModel):
    two_factor_enabled: bool = False
    last_password_change: Optional[datetime] = None
    active_sessions: List[ActiveSession] = Field(default_factory=list)
    login_history: List[Dict[str, Any]] = Field(default_factory=list)


# ── Audit Log (own actions) ────────────────────────────────

class StaffAuditEntry(BaseModel):
    id: str
    action: str
    resource_type: str
    resource_id: Optional[str] = None
    details: Dict[str, Any] = Field(default_factory=dict)
    ip_address: Optional[str] = None
    status: str = "success"
    created_at: datetime

    class Config:
        from_attributes = True


class StaffAuditListResponse(BaseModel):
    items: List[StaffAuditEntry]
    total: int
    page: int
    page_size: int
