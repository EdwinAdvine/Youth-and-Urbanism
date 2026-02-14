import sys
from pathlib import Path
from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# Add the backend directory to sys.path to allow imports
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

# Import our application settings and database Base
from app.config import settings
from app.database import Base

# Import all models to ensure they're registered with Base.metadata
from app.models import (
    User,
    Student,
    AIProvider,
    AITutor,
    Course,
    Enrollment,
    EnrollmentStatus,
    Assessment,
    AssessmentSubmission,
    Transaction,
    Wallet,
    PaymentMethod,
    # Parent dashboard models
    MoodEntry,
    FamilyGoal,
    ConsentRecord,
    ConsentAuditLog,
    ParentMessage,
    AIAlert,
    NotificationPreference,
    ParentReport,
    # Cross-cutting security models
    TwoFactorAuth,
    LoginHistory,
)

# Admin models
from app.models.admin import (
    AuditLog,
    Permission,
    RolePermission,
    UserPermissionOverride,
    SystemHealthSnapshot,
    UserRestriction,
    APIToken,
    ContentVersion,
    CompetencyTag,
    CourseCompetencyMapping,
    GradeOverride,
    CertificateTemplate,
    ResourceItem,
    AIConversationFlag,
    AIContentReview,
    AIPerformanceMetric,
    ComplianceIncident,
    ScheduledReport,
    PartnerContract,
    Invoice,
    PayoutQueueItem,
    SupportTicket,
    ModerationItem,
    SystemConfig,
    SystemConfigChangeRequest,
    KeywordFilter,
)

# Staff models
from app.models.staff import (
    StaffProfile,
    StaffTeam,
    StaffTicket,
    StaffTicketMessage,
    SLAPolicy,
    SLAEscalation,
    StaffContentItem,
    StaffContentVersion,
    StaffCollabSession,
    AdaptiveAssessment,
    AssessmentQuestion,
    CBCCompetency,
    KBCategory,
    KBArticle,
    KBEmbedding,
    LiveSession,
    LiveSessionRecording,
    BreakoutRoom,
    ReportDefinition,
    ReportSchedule,
    PushSubscription,
    StaffNotificationPref,
    StaffModerationItem,
    ReviewDecision,
    StudentJourney,
    FamilyCase,
    CaseNote,
)

# Instructor models
from app.models.instructor import (
    InstructorProfile,
    InstructorEarning,
    InstructorPayout,
    InstructorRevenueSplit,
    InstructorBadge,
    InstructorBadgeAward,
    InstructorPoints,
    InstructorPointsLog,
    PeerKudo,
    InstructorSessionAttendance,
    InstructorSessionFollowUp,
    InstructorDailyInsight,
    InstructorCBCAnalysis,
    InstructorForumPost,
    InstructorForumReply,
    InstructorTwoFactor,
    LoginHistory,
)

# Partner models
from app.models.partner import (
    PartnerProfile,
    SponsorshipProgram,
    SponsoredChild,
    SponsorshipConsent,
    PartnerSubscription,
    PartnerPayment,
    PartnerImpactReport,
    PartnerMessage,
    PartnerMeeting,
    PartnerResource,
    PartnerTicket,
)

# Student dashboard models
from app.models.student_dashboard import (
    StudentMoodEntry,
    StudentStreak,
    StudentDailyPlan,
    StudentJournalEntry,
    StudentWishlist,
    StudentSessionPrep,
)

# Student gamification models
from app.models.student_gamification import (
    StudentXPEvent,
    StudentLevel,
    StudentBadge,
    StudentGoal,
    StudentSkillNode,
    StudentWeeklyReport,
)

# Student community models
from app.models.student_community import (
    StudentFriendship,
    StudentStudyGroup,
    StudentShoutout,
    StudentTeacherQA,
)

# Student wallet models
from app.models.student_wallet import (
    PaystackTransaction,
    StudentSavedPaymentMethod,
)

# Student account models
from app.models.student_account import (
    StudentConsentRecord,
    StudentTeacherAccess,
)

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Override sqlalchemy.url with our settings (supports environment-based config)
# Convert async URL to sync for migrations (Alembic doesn't support async)
database_url = settings.database_url.replace("postgresql+asyncpg://", "postgresql://")
config.set_main_option("sqlalchemy.url", database_url)

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Set target_metadata to our Base.metadata for autogenerate support
target_metadata = Base.metadata

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
