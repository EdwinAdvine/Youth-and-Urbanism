"""
Parent-specific database models for Urban Home School.

This module contains all parent dashboard related models:
- MoodEntry: Daily mood/energy tracking
- FamilyGoal: Family learning goals
- ConsentRecord: Granular consent matrix
- ConsentAuditLog: Consent change audit trail
- ParentMessage: Real-time messaging
- AIAlert: AI-generated warnings/insights
- NotificationPreference: Per-child notification controls
- ParentReport: Generated reports
"""

from app.models.parent.mood_entry import MoodEntry
from app.models.parent.family_goal import FamilyGoal
from app.models.parent.consent_record import ConsentRecord
from app.models.parent.consent_audit_log import ConsentAuditLog
from app.models.parent.parent_message import ParentMessage
from app.models.parent.ai_alert import AIAlert
from app.models.parent.notification_preference import NotificationPreference
from app.models.parent.parent_report import ParentReport

__all__ = [
    'MoodEntry',
    'FamilyGoal',
    'ConsentRecord',
    'ConsentAuditLog',
    'ParentMessage',
    'AIAlert',
    'NotificationPreference',
    'ParentReport',
]
