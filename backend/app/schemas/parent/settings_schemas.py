"""
Parent Settings Schemas

Schemas for consent management, preferences, and security.
"""

from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict
from uuid import UUID
from datetime import datetime


# ============================================================================
# CONSENT SCHEMAS
# ============================================================================

class ConsentRecordResponse(BaseModel):
    """Consent record"""
    id: UUID
    child_id: UUID
    child_name: str
    data_type: str  # learning_data, ai_interactions, assessments, photos, etc.
    recipient_type: str  # ai_tutor, teachers, platform, third_party
    consent_given: bool
    granted_at: Optional[datetime] = None
    revoked_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    reason: Optional[str] = None


class ConsentMatrixResponse(BaseModel):
    """Complete consent matrix"""
    child_id: UUID
    child_name: str
    consents: List[ConsentRecordResponse]
    data_types: List[str]
    recipient_types: List[str]


class UpdateConsentRequest(BaseModel):
    """Update consent"""
    child_id: UUID
    data_type: str
    recipient_type: str
    consent_given: bool
    reason: Optional[str] = None


class ConsentAuditEntry(BaseModel):
    """Consent audit log entry"""
    id: UUID
    action: str  # granted, revoked, updated, expired
    performed_by: UUID
    old_value: Optional[bool] = None
    new_value: Optional[bool] = None
    ip_address: Optional[str] = None
    created_at: datetime


class ConsentAuditResponse(BaseModel):
    """Consent audit trail"""
    entries: List[ConsentAuditEntry]
    total_count: int


# ============================================================================
# NOTIFICATION PREFERENCES SCHEMAS
# ============================================================================

class NotificationPreferenceResponse(BaseModel):
    """Notification preference"""
    id: UUID
    child_id: Optional[UUID] = None
    notification_type: str
    channel_email: bool
    channel_sms: bool
    channel_push: bool
    channel_in_app: bool
    severity_threshold: str  # info, warning, critical
    is_enabled: bool


class NotificationPreferencesResponse(BaseModel):
    """All notification preferences"""
    preferences: List[NotificationPreferenceResponse]
    global_email: bool
    global_sms: bool
    global_push: bool


class UpdateNotificationPreferenceRequest(BaseModel):
    """Update notification preference"""
    notification_type: str
    child_id: Optional[UUID] = None
    channel_email: Optional[bool] = None
    channel_sms: Optional[bool] = None
    channel_push: Optional[bool] = None
    channel_in_app: Optional[bool] = None
    severity_threshold: Optional[str] = None
    is_enabled: Optional[bool] = None


# ============================================================================
# PROFILE SCHEMAS
# ============================================================================

class ParentProfileResponse(BaseModel):
    """Parent profile"""
    id: UUID
    email: str
    full_name: str
    phone_number: Optional[str] = None
    preferred_language: str = "en"
    timezone: str = "Africa/Nairobi"
    profile_photo_url: Optional[str] = None
    bio: Optional[str] = None


class UpdateParentProfileRequest(BaseModel):
    """Update parent profile"""
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    preferred_language: Optional[str] = None
    timezone: Optional[str] = None
    bio: Optional[str] = None


# ============================================================================
# FAMILY MEMBERS SCHEMAS
# ============================================================================

class FamilyMember(BaseModel):
    """Family member with viewing rights"""
    id: UUID
    email: str
    full_name: str
    relationship: str  # co_parent, guardian, other
    viewing_rights: List[str]  # children IDs they can view
    can_edit: bool
    invited_at: datetime
    accepted_at: Optional[datetime] = None


class FamilyMembersResponse(BaseModel):
    """Family members list"""
    members: List[FamilyMember]
    total_count: int


class InviteFamilyMemberRequest(BaseModel):
    """Invite family member"""
    email: EmailStr
    full_name: str
    relationship: str
    viewing_rights: List[UUID]  # child IDs
    can_edit: bool = False


class UpdateViewingRightsRequest(BaseModel):
    """Update viewing rights"""
    viewing_rights: List[UUID]
    can_edit: bool


# ============================================================================
# PRIVACY SCHEMAS
# ============================================================================

class SharedDataOverview(BaseModel):
    """Data sharing overview"""
    total_consents_given: int
    total_consents_revoked: int
    active_third_party_shares: int
    data_retention_days: int
    last_data_export: Optional[datetime] = None


class DataRequestResponse(BaseModel):
    """GDPR/DPA data request"""
    request_id: UUID
    request_type: str  # export, deletion
    status: str  # pending, processing, completed, failed
    requested_at: datetime
    completed_at: Optional[datetime] = None
    download_url: Optional[str] = None


# ============================================================================
# SECURITY SCHEMAS
# ============================================================================

class ChangePasswordRequest(BaseModel):
    """Change password"""
    current_password: str
    new_password: str = Field(..., min_length=8)


class LoginHistoryEntry(BaseModel):
    """Login history entry"""
    id: UUID
    ip_address: str
    user_agent: str
    device_info: Optional[Dict] = None
    location: Optional[str] = None
    login_at: datetime
    success: bool
    failure_reason: Optional[str] = None


class LoginHistoryResponse(BaseModel):
    """Login history"""
    entries: List[LoginHistoryEntry]
    total_count: int
