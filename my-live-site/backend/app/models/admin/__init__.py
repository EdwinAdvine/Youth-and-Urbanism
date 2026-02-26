"""
Admin Models Package

Exports all SQLAlchemy models used by the admin dashboard, organized by
domain: audit logging, permissions, system health, user restrictions,
API tokens, content integrity (versioning, CBC competency tags, grade
overrides, certificates, resources), AI monitoring (conversation flags,
content reviews, performance metrics), compliance analytics, finance
(contracts, invoices, payouts), operations (support tickets, moderation,
system config, keyword filters), error logging, and test run tracking.
"""

from app.models.admin.audit_log import AuditLog
from app.models.admin.permission import Permission, RolePermission, UserPermissionOverride
from app.models.admin.system_health import SystemHealthSnapshot
from app.models.admin.user_restriction import UserRestriction
from app.models.admin.api_token import APIToken
from app.models.admin.content_integrity import (
    ContentVersion,
    CompetencyTag,
    CourseCompetencyMapping,
    GradeOverride,
    CertificateTemplate,
    ResourceItem,
)
from app.models.admin.ai_monitoring import (
    AIConversationFlag,
    AIContentReview,
    AIPerformanceMetric,
)
from app.models.admin.analytics import ComplianceIncident, ScheduledReport
from app.models.admin.finance import PartnerContract, Invoice, PayoutQueueItem
from app.models.admin.operations import (
    SupportTicket,
    ModerationItem,
    SystemConfig,
    SystemConfigChangeRequest,
    KeywordFilter,
)
from app.models.admin.error_log import ErrorLog
from app.models.admin.test_run import TestRun

__all__ = [
    "AuditLog",
    "Permission",
    "RolePermission",
    "UserPermissionOverride",
    "SystemHealthSnapshot",
    "UserRestriction",
    "APIToken",
    "ContentVersion",
    "CompetencyTag",
    "CourseCompetencyMapping",
    "GradeOverride",
    "CertificateTemplate",
    "ResourceItem",
    "AIConversationFlag",
    "AIContentReview",
    "AIPerformanceMetric",
    "ComplianceIncident",
    "ScheduledReport",
    "PartnerContract",
    "Invoice",
    "PayoutQueueItem",
    "SupportTicket",
    "ModerationItem",
    "SystemConfig",
    "SystemConfigChangeRequest",
    "KeywordFilter",
    "ErrorLog",
    "TestRun",
]
