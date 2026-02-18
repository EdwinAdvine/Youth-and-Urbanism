"""
Student Account API Routes - Notifications, Profile, Preferences, Privacy
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, List, Optional
from pydantic import BaseModel

from app.database import get_db
from app.models.user import User
from app.services.student.account_service import AccountService
from app.utils.security import get_current_user


router = APIRouter(prefix="/student/account", tags=["Student Account"])


# Pydantic schemas
class UpdateProfileRequest(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    learning_style: Optional[str] = None
    interests: Optional[List[str]] = None


class UpdatePreferencesRequest(BaseModel):
    theme: Optional[str] = None
    language: Optional[str] = None
    age_ui_mode: Optional[str] = None
    ai_personality: Optional[str] = None
    font_size: Optional[str] = None
    animations_enabled: Optional[bool] = None
    sound_effects: Optional[bool] = None
    auto_play_voice: Optional[bool] = None
    daily_goal_minutes: Optional[int] = None


class UpdatePrivacyRequest(BaseModel):
    profile_visibility: Optional[str] = None
    show_online_status: Optional[bool] = None
    show_achievements: Optional[bool] = None
    show_streak: Optional[bool] = None
    allow_friend_requests: Optional[bool] = None
    allow_study_group_invites: Optional[bool] = None
    data_sharing_with_parent: Optional[bool] = None


class COPPAConsentRequest(BaseModel):
    consent_type: str
    is_granted: bool
    parent_id: Optional[str] = None


class UpdateTeacherAccessRequest(BaseModel):
    can_view_progress: Optional[bool] = None
    can_view_mood: Optional[bool] = None
    can_view_ai_chats: Optional[bool] = None
    can_view_journal: Optional[bool] = None
    can_message: Optional[bool] = None
    can_view_community_activity: Optional[bool] = None


class UpdateNotificationSettingsRequest(BaseModel):
    email_notifications: Optional[bool] = None
    push_notifications: Optional[bool] = None
    in_app_notifications: Optional[bool] = None
    categories: Optional[Dict] = None
    quiet_hours: Optional[Dict] = None


# ─── Notification Endpoints ───────────────────────────────────────

@router.get("/notifications")
async def get_notifications(
    category: Optional[str] = None,
    unread_only: bool = False,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> List[Dict]:
    """Get student notifications with optional filtering"""
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access this endpoint"
        )

    if not current_user.student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student profile not found"
        )

    service = AccountService(db)

    try:
        return await service.get_notifications(
            student_id=current_user.student_id,
            category=category,
            unread_only=unread_only,
            limit=limit
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch notifications: {str(e)}"
        )


@router.put("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    """Mark a notification as read"""
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access this endpoint"
        )

    service = AccountService(db)

    try:
        return await service.mark_notification_read(notification_id, current_user.student_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to mark notification: {str(e)}"
        )


@router.put("/notifications/read-all")
async def mark_all_read(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    """Mark all notifications as read"""
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access this endpoint"
        )

    service = AccountService(db)

    try:
        return await service.mark_all_notifications_read(current_user.student_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to mark all notifications: {str(e)}"
        )


@router.get("/notifications/settings")
async def get_notification_settings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    """Get notification preferences"""
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access this endpoint"
        )

    service = AccountService(db)

    try:
        return await service.get_notification_settings(current_user.student_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch notification settings: {str(e)}"
        )


@router.put("/notifications/settings")
async def update_notification_settings(
    request: UpdateNotificationSettingsRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    """Update notification preferences"""
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access this endpoint"
        )

    service = AccountService(db)

    try:
        settings_data = request.dict(exclude_none=True)
        return await service.update_notification_settings(current_user.student_id, settings_data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update notification settings: {str(e)}"
        )


# ─── Profile Endpoints ───────────────────────────────────────────

@router.get("/profile")
async def get_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    """Get student profile"""
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access this endpoint"
        )

    if not current_user.student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student profile not found"
        )

    service = AccountService(db)

    try:
        return await service.get_profile(current_user.student_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch profile: {str(e)}"
        )


@router.put("/profile")
async def update_profile(
    request: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    """Update student profile"""
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access this endpoint"
        )

    if not current_user.student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student profile not found"
        )

    service = AccountService(db)

    try:
        profile_data = request.dict(exclude_none=True)
        return await service.update_profile(current_user.student_id, profile_data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update profile: {str(e)}"
        )


# ─── Preferences Endpoints ───────────────────────────────────────

@router.get("/preferences")
async def get_preferences(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    """Get student preferences"""
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access this endpoint"
        )

    service = AccountService(db)

    try:
        return await service.get_preferences(current_user.student_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch preferences: {str(e)}"
        )


@router.put("/preferences")
async def update_preferences(
    request: UpdatePreferencesRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    """Update student preferences"""
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access this endpoint"
        )

    service = AccountService(db)

    try:
        prefs_data = request.dict(exclude_none=True)
        return await service.update_preferences(current_user.student_id, prefs_data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update preferences: {str(e)}"
        )


# ─── Privacy & COPPA Endpoints ───────────────────────────────────

@router.get("/privacy")
async def get_privacy_settings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    """Get privacy settings including COPPA consent status"""
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access this endpoint"
        )

    service = AccountService(db)

    try:
        return await service.get_privacy_settings(current_user.student_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch privacy settings: {str(e)}"
        )


@router.put("/privacy")
async def update_privacy_settings(
    request: UpdatePrivacyRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    """Update privacy settings"""
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access this endpoint"
        )

    service = AccountService(db)

    try:
        privacy_data = request.dict(exclude_none=True)
        return await service.update_privacy_settings(current_user.student_id, privacy_data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update privacy settings: {str(e)}"
        )


@router.post("/privacy/consent")
async def submit_coppa_consent(
    request: COPPAConsentRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    """Submit COPPA consent (requires parental verification)"""
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access this endpoint"
        )

    if not current_user.student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student profile not found"
        )

    service = AccountService(db)

    try:
        consent_data = {
            "consent_type": request.consent_type,
            "is_granted": request.is_granted,
            "parent_id": request.parent_id
        }
        return await service.submit_coppa_consent(current_user.student_id, consent_data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit consent: {str(e)}"
        )


@router.get("/privacy/audit")
async def get_privacy_audit(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    """Get AI privacy audit - what data is collected and how"""
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access this endpoint"
        )

    service = AccountService(db)

    try:
        return await service.get_privacy_audit(current_user.student_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate privacy audit: {str(e)}"
        )


# ─── Teacher Access Endpoints ────────────────────────────────────

@router.get("/teacher-access")
async def get_teacher_access(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> List[Dict]:
    """Get teacher access controls"""
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access this endpoint"
        )

    if not current_user.student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student profile not found"
        )

    service = AccountService(db)

    try:
        return await service.get_teacher_access(current_user.student_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch teacher access controls: {str(e)}"
        )


@router.put("/teacher-access/{teacher_id}")
async def update_teacher_access(
    teacher_id: str,
    request: UpdateTeacherAccessRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    """Update teacher access permissions"""
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access this endpoint"
        )

    if not current_user.student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student profile not found"
        )

    service = AccountService(db)

    try:
        access_data = request.dict(exclude_none=True)
        return await service.update_teacher_access(
            current_user.student_id,
            teacher_id,
            access_data
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update teacher access: {str(e)}"
        )
