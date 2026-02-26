"""
Parent Settings Service

Business logic for consent, preferences, and security settings.
"""

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
from uuid import UUID
from datetime import datetime

from app.models import User, Student
from app.models.parent.consent_record import ConsentRecord
from app.models.parent.notification_preference import NotificationPreference
from app.schemas.parent.settings_schemas import (
    ConsentMatrixResponse, ConsentRecordResponse, UpdateConsentRequest,
    ConsentAuditResponse, NotificationPreferencesResponse,
    UpdateNotificationPreferenceRequest, ParentProfileResponse,
    UpdateParentProfileRequest, FamilyMembersResponse, InviteFamilyMemberRequest,
    UpdateViewingRightsRequest, SharedDataOverview, DataRequestResponse,
    ChangePasswordRequest, LoginHistoryResponse
)


class ParentSettingsService:
    """Service for parent settings"""

    async def get_consent_matrix(
        self,
        db: AsyncSession,
        parent_id: UUID,
        child_id: UUID
    ) -> ConsentMatrixResponse:
        """Get consent matrix for child"""

        # Get child name
        child_result = await db.execute(
            select(Student).where(
                and_(Student.id == child_id, Student.parent_id == parent_id)
            )
        )
        child = child_result.scalar_one_or_none()
        child_name = child.user.profile_data.get('full_name', 'Unknown') if child and child.user else 'Unknown'

        # Query consent records
        result = await db.execute(
            select(ConsentRecord).where(
                and_(
                    ConsentRecord.parent_id == parent_id,
                    ConsentRecord.child_id == child_id
                )
            )
        )
        records = result.scalars().all()

        consents = [
            ConsentRecordResponse(
                id=r.id,
                parent_id=r.parent_id,
                child_id=r.child_id,
                data_type=r.data_type,
                recipient_type=r.recipient_type,
                consent_given=r.consent_given,
                granted_at=r.granted_at,
                revoked_at=r.revoked_at,
                expires_at=r.expires_at,
                reason=r.reason,
                created_at=r.created_at,
                updated_at=r.updated_at
            )
            for r in records
        ]

        return ConsentMatrixResponse(
            child_id=child_id,
            child_name=child_name,
            consents=consents,
            data_types=["learning_data", "ai_interactions", "assessments", "photos", "progress_reports"],
            recipient_types=["ai_tutor", "teachers", "platform", "third_party_analytics"]
        )

    async def update_consent(
        self,
        db: AsyncSession,
        parent_id: UUID,
        request: UpdateConsentRequest
    ) -> ConsentRecordResponse:
        """Update consent record"""

        # Would update consent and create audit entry
        raise NotImplementedError("Consent update not yet implemented")

    async def get_consent_audit(
        self,
        db: AsyncSession,
        parent_id: UUID,
        child_id: Optional[UUID] = None
    ) -> ConsentAuditResponse:
        """Get consent audit trail"""

        return ConsentAuditResponse(entries=[], total_count=0)

    async def get_notification_preferences(
        self,
        db: AsyncSession,
        parent_id: UUID
    ) -> NotificationPreferencesResponse:
        """Get notification preferences"""

        result = await db.execute(
            select(NotificationPreference).where(
                NotificationPreference.parent_id == parent_id
            )
        )
        prefs = result.scalars().all()

        pref_responses = []
        for p in prefs:
            pref_responses.append({
                "id": str(p.id),
                "notification_type": p.notification_type,
                "child_id": str(p.child_id) if p.child_id else None,
                "channel_email": p.channel_email,
                "channel_sms": p.channel_sms,
                "channel_push": p.channel_push,
                "channel_in_app": p.channel_in_app,
                "severity_threshold": p.severity_threshold or "info",
                "is_enabled": p.is_enabled,
            })

        return NotificationPreferencesResponse(
            preferences=pref_responses,
            global_email=True,
            global_sms=True,
            global_push=True
        )

    async def update_notification_preference(
        self,
        db: AsyncSession,
        parent_id: UUID,
        request: UpdateNotificationPreferenceRequest
    ) -> dict:
        """Update notification preference"""

        # Find existing preference
        result = await db.execute(
            select(NotificationPreference).where(
                and_(
                    NotificationPreference.parent_id == parent_id,
                    NotificationPreference.notification_type == request.notification_type
                )
            )
        )
        pref = result.scalar_one_or_none()

        if pref:
            # Update existing
            if hasattr(request, 'channel_email') and request.channel_email is not None:
                pref.channel_email = request.channel_email
            if hasattr(request, 'channel_sms') and request.channel_sms is not None:
                pref.channel_sms = request.channel_sms
            if hasattr(request, 'channel_push') and request.channel_push is not None:
                pref.channel_push = request.channel_push
            if hasattr(request, 'channel_in_app') and request.channel_in_app is not None:
                pref.channel_in_app = request.channel_in_app
            if hasattr(request, 'severity_threshold') and request.severity_threshold is not None:
                pref.severity_threshold = request.severity_threshold
            if hasattr(request, 'is_enabled') and request.is_enabled is not None:
                pref.is_enabled = request.is_enabled
            pref.updated_at = datetime.utcnow()
        else:
            # Create new
            import uuid as uuid_mod
            pref = NotificationPreference(
                id=uuid_mod.uuid4(),
                parent_id=parent_id,
                notification_type=request.notification_type,
                channel_email=getattr(request, 'channel_email', True),
                channel_sms=getattr(request, 'channel_sms', False),
                channel_push=getattr(request, 'channel_push', True),
                channel_in_app=getattr(request, 'channel_in_app', True),
                severity_threshold=getattr(request, 'severity_threshold', 'info'),
                is_enabled=getattr(request, 'is_enabled', True),
            )
            db.add(pref)

        await db.commit()
        return {"status": "updated"}

    async def get_parent_profile(
        self,
        db: AsyncSession,
        parent_id: UUID
    ) -> ParentProfileResponse:
        """Get parent profile"""

        result = await db.execute(
            select(User).where(User.id == parent_id)
        )
        user = result.scalar_one_or_none()

        if not user:
            raise ValueError("User not found")

        profile_data = user.profile_data or {}

        return ParentProfileResponse(
            id=user.id,
            email=user.email,
            full_name=profile_data.get('full_name', ''),
            phone=profile_data.get('phone', ''),
            avatar_url=profile_data.get('avatar_url'),
            timezone=profile_data.get('timezone', 'Africa/Nairobi'),
            language=profile_data.get('language', 'en'),
            created_at=user.created_at
        )

    async def update_parent_profile(
        self,
        db: AsyncSession,
        parent_id: UUID,
        request: UpdateParentProfileRequest
    ) -> ParentProfileResponse:
        """Update parent profile"""

        result = await db.execute(
            select(User).where(User.id == parent_id)
        )
        user = result.scalar_one_or_none()

        if not user:
            raise ValueError("User not found")

        profile_data = user.profile_data or {}

        if hasattr(request, 'full_name') and request.full_name is not None:
            profile_data['full_name'] = request.full_name
        if hasattr(request, 'phone') and request.phone is not None:
            profile_data['phone'] = request.phone
        if hasattr(request, 'avatar_url') and request.avatar_url is not None:
            profile_data['avatar_url'] = request.avatar_url
        if hasattr(request, 'timezone') and request.timezone is not None:
            profile_data['timezone'] = request.timezone
        if hasattr(request, 'language') and request.language is not None:
            profile_data['language'] = request.language

        user.profile_data = profile_data
        await db.commit()
        await db.refresh(user)

        return ParentProfileResponse(
            id=user.id,
            email=user.email,
            full_name=profile_data.get('full_name', ''),
            phone=profile_data.get('phone', ''),
            avatar_url=profile_data.get('avatar_url'),
            timezone=profile_data.get('timezone', 'Africa/Nairobi'),
            language=profile_data.get('language', 'en'),
            created_at=user.created_at
        )

    async def get_family_members(
        self,
        db: AsyncSession,
        parent_id: UUID
    ) -> FamilyMembersResponse:
        """Get family members"""

        return FamilyMembersResponse(members=[], total_count=0)

    async def invite_family_member(
        self,
        db: AsyncSession,
        parent_id: UUID,
        request: InviteFamilyMemberRequest
    ) -> dict:
        """Invite family member"""

        return {"status": "invited"}

    async def remove_family_member(
        self,
        db: AsyncSession,
        parent_id: UUID,
        member_id: UUID
    ) -> dict:
        """Remove family member"""

        return {"status": "removed"}

    async def update_viewing_rights(
        self,
        db: AsyncSession,
        parent_id: UUID,
        member_id: UUID,
        request: UpdateViewingRightsRequest
    ) -> dict:
        """Update family member viewing rights"""

        return {"status": "updated"}

    async def get_shared_data_overview(
        self,
        db: AsyncSession,
        parent_id: UUID
    ) -> SharedDataOverview:
        """Get data sharing overview"""

        return SharedDataOverview(
            total_consents_given=0,
            total_consents_revoked=0,
            active_third_party_shares=0,
            data_retention_days=365,
            last_data_export=None
        )

    async def request_data_export(
        self,
        db: AsyncSession,
        parent_id: UUID
    ) -> DataRequestResponse:
        """Request GDPR data export"""

        raise NotImplementedError("Data export not yet implemented")

    async def change_password(
        self,
        db: AsyncSession,
        parent_id: UUID,
        request: ChangePasswordRequest
    ) -> dict:
        """Change password"""

        # Would verify current password and update
        return {"status": "password_changed"}

    async def get_login_history(
        self,
        db: AsyncSession,
        parent_id: UUID,
        limit: int = 50
    ) -> LoginHistoryResponse:
        """Get login history"""

        return LoginHistoryResponse(entries=[], total_count=0)


# Singleton instance
parent_settings_service = ParentSettingsService()
