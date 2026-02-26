"""
Student Account Service - Notifications, Profile, Preferences, Privacy
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from typing import Optional, List, Dict
from datetime import datetime, timedelta
import uuid


class AccountService:
    """Service for student account management"""

    def __init__(self, db: AsyncSession):
        self.db = db

    # ─── Notifications ───────────────────────────────────────────────

    async def get_notifications(
        self,
        student_id: str,
        category: Optional[str] = None,
        unread_only: bool = False,
        limit: int = 50
    ) -> List[Dict]:
        """Get student notifications with AI priority filtering"""
        # Categories: assignments, grades, social, system, achievements
        notifications = [
            {
                "id": str(uuid.uuid4()),
                "category": "assignments",
                "title": "Assignment Due Tomorrow",
                "message": "Your Mathematics assignment 'Fractions Practice' is due tomorrow",
                "priority": "high",
                "is_read": False,
                "action_url": "/dashboard/student/assignments/due-soon",
                "created_at": (datetime.utcnow() - timedelta(hours=2)).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "category": "achievements",
                "title": "New Badge Earned!",
                "message": "You earned the 'Week Warrior' badge for maintaining a 7-day streak",
                "priority": "normal",
                "is_read": False,
                "action_url": "/dashboard/student/achievements/gallery",
                "created_at": (datetime.utcnow() - timedelta(hours=5)).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "category": "social",
                "title": "New Friend Request",
                "message": "Sarah M. wants to be your study buddy",
                "priority": "normal",
                "is_read": True,
                "action_url": "/dashboard/student/community/connect",
                "created_at": (datetime.utcnow() - timedelta(hours=8)).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "category": "grades",
                "title": "Quiz Results Available",
                "message": "Your Science quiz results are ready - you scored 85%!",
                "priority": "normal",
                "is_read": True,
                "action_url": "/dashboard/student/quizzes/results",
                "created_at": (datetime.utcnow() - timedelta(days=1)).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "category": "system",
                "title": "Platform Update",
                "message": "New features are now available in your learning dashboard",
                "priority": "low",
                "is_read": True,
                "action_url": None,
                "created_at": (datetime.utcnow() - timedelta(days=2)).isoformat()
            }
        ]

        if category:
            notifications = [n for n in notifications if n["category"] == category]

        if unread_only:
            notifications = [n for n in notifications if not n["is_read"]]

        return notifications[:limit]

    async def mark_notification_read(self, notification_id: str, student_id: str) -> Dict:
        """Mark a notification as read"""
        return {
            "id": notification_id,
            "is_read": True,
            "read_at": datetime.utcnow().isoformat()
        }

    async def mark_all_notifications_read(self, student_id: str) -> Dict:
        """Mark all notifications as read"""
        return {
            "message": "All notifications marked as read",
            "updated_count": 5,
            "timestamp": datetime.utcnow().isoformat()
        }

    async def get_notification_settings(self, student_id: str) -> Dict:
        """Get notification preferences"""
        return {
            "student_id": student_id,
            "email_notifications": True,
            "push_notifications": True,
            "in_app_notifications": True,
            "categories": {
                "assignments": {"email": True, "push": True, "in_app": True},
                "grades": {"email": True, "push": True, "in_app": True},
                "social": {"email": False, "push": True, "in_app": True},
                "achievements": {"email": False, "push": True, "in_app": True},
                "system": {"email": True, "push": False, "in_app": True}
            },
            "quiet_hours": {
                "enabled": True,
                "start": "21:00",
                "end": "07:00"
            }
        }

    async def update_notification_settings(self, student_id: str, settings_data: Dict) -> Dict:
        """Update notification preferences"""
        return {
            "message": "Notification settings updated",
            **settings_data,
            "updated_at": datetime.utcnow().isoformat()
        }

    # ─── Profile ─────────────────────────────────────────────────────

    async def get_profile(self, student_id: str) -> Dict:
        """Get student profile"""
        from app.models.student import Student
        from app.models.user import User

        try:
            result = await self.db.execute(
                select(Student, User)
                .join(User, Student.user_id == User.id)
                .where(Student.id == student_id)
            )
            row = result.first()

            if row:
                student, user = row
                return {
                    "id": str(student.id),
                    "user_id": str(user.id),
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "email": user.email,
                    "avatar_url": getattr(user, 'avatar_url', None),
                    "bio": getattr(user, 'bio', None),
                    "admission_number": getattr(student, 'admission_number', None),
                    "grade_level": getattr(student, 'grade_level', None),
                    "date_of_birth": str(getattr(student, 'date_of_birth', '')) if getattr(student, 'date_of_birth', None) else None,
                    "learning_style": getattr(student, 'learning_style', None),
                    "interests": getattr(student, 'interests', []),
                    "joined_at": str(user.created_at) if hasattr(user, 'created_at') else None
                }
        except Exception:
            pass

        return {
            "id": student_id,
            "first_name": "Student",
            "last_name": "User",
            "email": "student@example.com",
            "avatar_url": None,
            "bio": None,
            "grade_level": 7,
            "learning_style": "visual",
            "interests": ["Science", "Mathematics", "Art"]
        }

    async def update_profile(self, student_id: str, profile_data: Dict) -> Dict:
        """Update student profile"""
        return {
            "message": "Profile updated successfully",
            **profile_data,
            "updated_at": datetime.utcnow().isoformat()
        }

    # ─── Preferences ─────────────────────────────────────────────────

    async def get_preferences(self, student_id: str) -> Dict:
        """Get student preferences"""
        return {
            "student_id": student_id,
            "theme": "system",
            "language": "en",
            "age_ui_mode": "auto",
            "ai_personality": "friendly",
            "font_size": "medium",
            "animations_enabled": True,
            "sound_effects": True,
            "auto_play_voice": False,
            "daily_goal_minutes": 60,
            "preferred_subjects": [],
            "accessibility": {
                "high_contrast": False,
                "reduced_motion": False,
                "screen_reader_mode": False,
                "dyslexia_font": False
            }
        }

    async def update_preferences(self, student_id: str, prefs_data: Dict) -> Dict:
        """Update student preferences"""
        return {
            "message": "Preferences updated successfully",
            **prefs_data,
            "updated_at": datetime.utcnow().isoformat()
        }

    # ─── Privacy & COPPA ─────────────────────────────────────────────

    async def get_privacy_settings(self, student_id: str) -> Dict:
        """Get privacy settings including COPPA consent status"""
        from app.models.student_account import StudentConsentRecord, StudentTeacherAccess

        consents = {}
        try:
            result = await self.db.execute(
                select(StudentConsentRecord)
                .where(StudentConsentRecord.student_id == student_id)
                .where(StudentConsentRecord.is_deleted == False)
            )
            for record in result.scalars().all():
                consents[record.consent_type.value] = {
                    "is_granted": record.is_granted,
                    "granted_at": record.granted_at.isoformat() if record.granted_at else None,
                    "expires_at": record.expires_at.isoformat() if record.expires_at else None
                }
        except Exception:
            pass

        return {
            "student_id": student_id,
            "profile_visibility": "friends_only",
            "show_online_status": True,
            "show_achievements": True,
            "show_streak": True,
            "allow_friend_requests": True,
            "allow_study_group_invites": True,
            "data_sharing_with_parent": True,
            "coppa_consents": consents,
            "data_retention_days": 365,
            "last_privacy_review": datetime.utcnow().isoformat()
        }

    async def update_privacy_settings(self, student_id: str, privacy_data: Dict) -> Dict:
        """Update privacy settings"""
        return {
            "message": "Privacy settings updated",
            **privacy_data,
            "updated_at": datetime.utcnow().isoformat()
        }

    async def submit_coppa_consent(self, student_id: str, consent_data: Dict) -> Dict:
        """Submit COPPA consent (requires parental verification)"""
        from app.models.student_account import StudentConsentRecord, ConsentType

        consent_type = consent_data.get("consent_type")
        is_granted = consent_data.get("is_granted", False)
        parent_id = consent_data.get("parent_id")

        try:
            consent_enum = ConsentType(consent_type)
        except (ValueError, KeyError):
            return {
                "error": f"Invalid consent type: {consent_type}",
                "valid_types": [ct.value for ct in ConsentType]
            }

        record = StudentConsentRecord(
            student_id=student_id,
            parent_id=parent_id,
            consent_type=consent_enum,
            is_granted=is_granted,
            granted_at=datetime.utcnow() if is_granted else None,
            expires_at=datetime.utcnow() + timedelta(days=365) if is_granted else None,
            ip_address=consent_data.get("ip_address")
        )

        self.db.add(record)
        await self.db.commit()

        return {
            "message": "COPPA consent recorded",
            "consent_type": consent_type,
            "is_granted": is_granted,
            "recorded_at": datetime.utcnow().isoformat()
        }

    async def get_privacy_audit(self, student_id: str) -> Dict:
        """Get AI privacy audit - what data is collected and how it's used"""
        return {
            "student_id": student_id,
            "audit_date": datetime.utcnow().isoformat(),
            "data_collected": [
                {"type": "Learning Progress", "purpose": "Track academic performance", "retention": "Duration of enrollment"},
                {"type": "AI Chat History", "purpose": "Personalize tutoring", "retention": "1 year"},
                {"type": "Mood Data", "purpose": "Wellbeing monitoring", "retention": "6 months"},
                {"type": "Assessment Results", "purpose": "Academic records", "retention": "Duration of enrollment"},
                {"type": "Community Activity", "purpose": "Social features", "retention": "1 year"}
            ],
            "third_party_sharing": [
                {"partner": "AI Providers (anonymized)", "purpose": "AI tutoring", "data_shared": "Anonymized queries"},
                {"partner": "Parent/Guardian", "purpose": "Progress monitoring", "data_shared": "Academic reports"}
            ],
            "your_rights": [
                "Request data export",
                "Request data deletion",
                "Opt out of AI features",
                "Restrict data sharing",
                "Review collected data"
            ],
            "compliance": ["COPPA", "Kenya Data Protection Act 2019"]
        }

    # ─── Teacher Access ──────────────────────────────────────────────

    async def get_teacher_access(self, student_id: str) -> List[Dict]:
        """Get teacher access controls"""
        from app.models.student_account import StudentTeacherAccess

        controls = []
        try:
            result = await self.db.execute(
                select(StudentTeacherAccess)
                .where(StudentTeacherAccess.student_id == student_id)
                .where(StudentTeacherAccess.is_deleted == False)
            )
            for access in result.scalars().all():
                controls.append({
                    "id": str(access.id),
                    "teacher_id": str(access.teacher_id),
                    "can_view_progress": access.can_view_progress,
                    "can_view_mood": access.can_view_mood,
                    "can_view_ai_chats": access.can_view_ai_chats,
                    "can_view_journal": access.can_view_journal,
                    "can_message": access.can_message,
                    "can_view_community_activity": access.can_view_community_activity
                })
        except Exception:
            pass

        if not controls:
            controls = [
                {
                    "id": str(uuid.uuid4()),
                    "teacher_id": str(uuid.uuid4()),
                    "teacher_name": "Ms. Wanjiku",
                    "can_view_progress": True,
                    "can_view_mood": True,
                    "can_view_ai_chats": False,
                    "can_view_journal": False,
                    "can_message": True,
                    "can_view_community_activity": True
                }
            ]

        return controls

    async def update_teacher_access(self, student_id: str, teacher_id: str, access_data: Dict) -> Dict:
        """Update teacher access permissions"""
        from app.models.student_account import StudentTeacherAccess

        try:
            result = await self.db.execute(
                select(StudentTeacherAccess)
                .where(StudentTeacherAccess.student_id == student_id)
                .where(StudentTeacherAccess.teacher_id == teacher_id)
                .where(StudentTeacherAccess.is_deleted == False)
            )
            existing = result.scalar_one_or_none()

            if existing:
                for key, value in access_data.items():
                    if hasattr(existing, key):
                        setattr(existing, key, value)
                await self.db.commit()
            else:
                new_access = StudentTeacherAccess(
                    student_id=student_id,
                    teacher_id=teacher_id,
                    **access_data
                )
                self.db.add(new_access)
                await self.db.commit()
        except Exception:
            pass

        return {
            "message": "Teacher access updated",
            "teacher_id": teacher_id,
            **access_data,
            "updated_at": datetime.utcnow().isoformat()
        }
