"""
Parent Settings Router

API endpoints for consent, preferences, and security settings.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from uuid import UUID

from app.database import get_db
from app.models import User
from app.utils.security import get_current_user
from app.schemas.parent.settings_schemas import (
    ConsentMatrixResponse, UpdateConsentRequest, ConsentRecordResponse,
    ConsentAuditResponse, NotificationPreferencesResponse,
    UpdateNotificationPreferenceRequest, ParentProfileResponse,
    UpdateParentProfileRequest, FamilyMembersResponse,
    InviteFamilyMemberRequest, UpdateViewingRightsRequest,
    SharedDataOverview, DataRequestResponse, ChangePasswordRequest,
    LoginHistoryResponse
)
from app.services.parent.settings_service import parent_settings_service

router = APIRouter(prefix="/parent/settings", tags=["parent-settings"])


def require_parent_role(current_user: User = Depends(get_current_user)) -> User:
    """Dependency to ensure user has parent role."""
    if current_user.role != "parent":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Parent role required"
        )
    return current_user


# ============================================================================
# CONSENT ENDPOINTS
# ============================================================================

@router.get("/consent/{child_id}", response_model=ConsentMatrixResponse)
async def get_consent_matrix(
    child_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """Get consent matrix for child."""
    return await parent_settings_service.get_consent_matrix(
        db=db,
        parent_id=current_user.id,
        child_id=child_id
    )


@router.put("/consent", response_model=ConsentRecordResponse)
async def update_consent(
    request: UpdateConsentRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """Update consent record."""
    try:
        return await parent_settings_service.update_consent(
            db=db,
            parent_id=current_user.id,
            request=request
        )
    except NotImplementedError:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Consent management not yet implemented"
        )


@router.get("/consent/audit", response_model=ConsentAuditResponse)
async def get_consent_audit(
    child_id: Optional[UUID] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """Get consent audit trail."""
    return await parent_settings_service.get_consent_audit(
        db=db,
        parent_id=current_user.id,
        child_id=child_id
    )


# ============================================================================
# NOTIFICATION PREFERENCES ENDPOINTS
# ============================================================================

@router.get("/notifications", response_model=NotificationPreferencesResponse)
async def get_notification_preferences(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """Get notification preferences."""
    return await parent_settings_service.get_notification_preferences(
        db=db,
        parent_id=current_user.id
    )


@router.put("/notifications")
async def update_notification_preference(
    request: UpdateNotificationPreferenceRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """Update notification preference."""
    return await parent_settings_service.update_notification_preference(
        db=db,
        parent_id=current_user.id,
        request=request
    )


# ============================================================================
# PROFILE ENDPOINTS
# ============================================================================

@router.get("/profile", response_model=ParentProfileResponse)
async def get_profile(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """Get parent profile."""
    try:
        return await parent_settings_service.get_parent_profile(
            db=db,
            parent_id=current_user.id
        )
    except NotImplementedError:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Profile not yet implemented"
        )


@router.put("/profile", response_model=ParentProfileResponse)
async def update_profile(
    request: UpdateParentProfileRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """Update parent profile."""
    try:
        return await parent_settings_service.update_parent_profile(
            db=db,
            parent_id=current_user.id,
            request=request
        )
    except NotImplementedError:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Profile update not yet implemented"
        )


# ============================================================================
# FAMILY MEMBERS ENDPOINTS
# ============================================================================

@router.get("/family", response_model=FamilyMembersResponse)
async def get_family_members(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """Get family members."""
    return await parent_settings_service.get_family_members(
        db=db,
        parent_id=current_user.id
    )


@router.post("/family/invite")
async def invite_family_member(
    request: InviteFamilyMemberRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """Invite family member."""
    return await parent_settings_service.invite_family_member(
        db=db,
        parent_id=current_user.id,
        request=request
    )


@router.delete("/family/{member_id}")
async def remove_family_member(
    member_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """Remove family member."""
    return await parent_settings_service.remove_family_member(
        db=db,
        parent_id=current_user.id,
        member_id=member_id
    )


@router.put("/family/{member_id}/rights")
async def update_viewing_rights(
    member_id: UUID,
    request: UpdateViewingRightsRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """Update viewing rights."""
    return await parent_settings_service.update_viewing_rights(
        db=db,
        parent_id=current_user.id,
        member_id=member_id,
        request=request
    )


# ============================================================================
# PRIVACY ENDPOINTS
# ============================================================================

@router.get("/privacy/shared-data", response_model=SharedDataOverview)
async def get_shared_data_overview(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """Get data sharing overview."""
    return await parent_settings_service.get_shared_data_overview(
        db=db,
        parent_id=current_user.id
    )


@router.post("/privacy/data-request", response_model=DataRequestResponse)
async def request_data_export(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """Request GDPR/DPA data export."""
    try:
        return await parent_settings_service.request_data_export(
            db=db,
            parent_id=current_user.id
        )
    except NotImplementedError:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Data export not yet implemented"
        )


# ============================================================================
# SECURITY ENDPOINTS
# ============================================================================

@router.put("/security/password")
async def change_password(
    request: ChangePasswordRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """Change password."""
    return await parent_settings_service.change_password(
        db=db,
        parent_id=current_user.id,
        request=request
    )


@router.get("/security/login-history", response_model=LoginHistoryResponse)
async def get_login_history(
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """Get login history."""
    return await parent_settings_service.get_login_history(
        db=db,
        parent_id=current_user.id,
        limit=limit
    )
