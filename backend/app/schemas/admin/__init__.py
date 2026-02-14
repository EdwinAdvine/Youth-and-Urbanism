"""Admin schemas package."""

from app.schemas.admin.base import (
    PaginationParams,
    PaginatedResponse,
    SuccessResponse,
    ErrorResponse,
)
from app.schemas.admin.users import (
    CreateRestrictionRequest,
    AppealDecisionRequest,
    RestrictionResponse,
    APITokenCreateRequest,
    APITokenResponse,
    UpdateUserRoleRequest,
    BulkUserActionRequest,
)
from app.schemas.admin.permissions import (
    PermissionResponse,
    RolePermissionEntry,
    PermissionMatrixResponse,
    RolePermissionUpdate,
    UserOverrideRequest,
)
from app.schemas.admin.content import (
    CourseApprovalRequest,
    RejectCourseRequest,
    CompetencyTagCreate,
    CompetencyTagResponse,
    GradeOverrideRequest,
    CertificateTemplateCreate,
    ResourceUploadRequest,
)
from app.schemas.admin.ai_monitoring import (
    ConversationFlagResponse,
    FlagReviewRequest,
    ContentReviewRequest,
    PerformanceMetricsParams,
)
from app.schemas.admin.analytics import (
    ComplianceIncidentCreate,
    ComplianceIncidentResponse,
    ScheduledReportCreate,
    NLQueryRequest,
    NLQueryResponse,
)
from app.schemas.admin.finance import (
    RefundRequest,
    PayoutProcessRequest,
    InvoiceCreate,
    InvoiceResponse,
    PartnerContractCreate,
    SubscriptionPlanUpdate,
)
from app.schemas.admin.operations import (
    TicketCreate,
    TicketUpdateRequest,
    TicketResponse,
    ModerationDecisionRequest,
    KeywordFilterCreate,
    ConfigChangeRequest,
    ConfigApprovalRequest,
)
