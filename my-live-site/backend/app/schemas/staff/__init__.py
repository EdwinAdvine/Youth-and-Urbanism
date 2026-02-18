# Staff Dashboard Schemas
# Pydantic v2 schema definitions for all Staff Dashboard endpoints

from .dashboard_schemas import (
    AIAgendaItem,
    MyFocusResponse,
    StaffDashboardStats,
)
from .ticket_schemas import (
    TicketCreate,
    TicketUpdate,
    TicketMessageCreate,
    TicketAssign,
    TicketEscalate,
    TicketListFilters,
    TicketResponse,
)
from .sla_schemas import (
    SLAPolicyCreate,
    SLAStatus,
)
from .content_schemas import (
    ContentCreate,
    ContentUpdate,
    ContentPublish,
    ContentReject,
    VersionResponse,
    CollabSessionCreate,
)
from .assessment_schemas import (
    AssessmentCreate,
    QuestionCreate,
    AdaptiveSessionState,
    AIGradingResult,
)
from .session_schemas import (
    SessionCreate,
    SessionUpdate,
    LiveKitTokenResponse,
    BreakoutRoomCreate,
)
from .knowledge_base_schemas import (
    ArticleCreate,
    ArticleUpdate,
    KBSearchQuery,
    KBSearchResult,
    KBCategoryCreate,
)
from .report_schemas import (
    ReportWidgetConfig,
    ReportConfigSchema,
    ReportCreate,
    ScheduleCreate,
    ExportRequest,
)
from .team_schemas import (
    MyPerformance,
    TeamMemberMetrics,
    TeamPulseResponse,
    WorkloadSuggestion,
)
from .account_schemas import (
    ProfileUpdate,
    PreferencesUpdate,
    NotificationPrefUpdate,
    StaffPresenceUpdate,
)
from .moderation_schemas import (
    ModerationItemResponse,
    ReviewDecisionCreate,
    BulkModerationAction,
)
from .notification_schemas import (
    PushSubscribeRequest,
    NotificationResponse,
    NotificationMarkRead,
)

__all__ = [
    # Dashboard
    "AIAgendaItem",
    "MyFocusResponse",
    "StaffDashboardStats",
    # Tickets
    "TicketCreate",
    "TicketUpdate",
    "TicketMessageCreate",
    "TicketAssign",
    "TicketEscalate",
    "TicketListFilters",
    "TicketResponse",
    # SLA
    "SLAPolicyCreate",
    "SLAStatus",
    # Content
    "ContentCreate",
    "ContentUpdate",
    "ContentPublish",
    "ContentReject",
    "VersionResponse",
    "CollabSessionCreate",
    # Assessments
    "AssessmentCreate",
    "QuestionCreate",
    "AdaptiveSessionState",
    "AIGradingResult",
    # Sessions
    "SessionCreate",
    "SessionUpdate",
    "LiveKitTokenResponse",
    "BreakoutRoomCreate",
    # Knowledge Base
    "ArticleCreate",
    "ArticleUpdate",
    "KBSearchQuery",
    "KBSearchResult",
    "KBCategoryCreate",
    # Reports
    "ReportWidgetConfig",
    "ReportConfigSchema",
    "ReportCreate",
    "ScheduleCreate",
    "ExportRequest",
    # Team
    "MyPerformance",
    "TeamMemberMetrics",
    "TeamPulseResponse",
    "WorkloadSuggestion",
    # Account
    "ProfileUpdate",
    "PreferencesUpdate",
    "NotificationPrefUpdate",
    "StaffPresenceUpdate",
    # Moderation
    "ModerationItemResponse",
    "ReviewDecisionCreate",
    "BulkModerationAction",
    # Notifications
    "PushSubscribeRequest",
    "NotificationResponse",
    "NotificationMarkRead",
]
