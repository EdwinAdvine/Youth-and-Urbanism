"""
Database Models for Urban Home School Platform

This module exports all SQLAlchemy ORM models for easy importing.
Models include:
- User: Authentication and multi-role support
- Student: Student profiles with CBC tracking
- AIProvider: Admin-configurable AI providers (flexible AI system)
- AITutor: Dedicated AI tutors for students (core feature)
- Course: CBC-aligned courses with revenue sharing
- Assessment: Quizzes, assignments, projects, exams
- AssessmentSubmission: Student assessment submissions
- Payment: Multi-gateway payment transactions (M-Pesa, PayPal, Stripe)
- Wallet: User wallets for credits and revenue tracking
- WalletTransaction: Wallet transaction audit trail
- Subscription: Recurring subscription management (NEW)
- SubscriptionPlan: Subscription pricing plans (NEW)
- Refund: Refund request and processing (NEW)
- ExchangeRate: Currency exchange rates (NEW)
- CurrencyConversion: Currency conversion log (NEW)
- RevenueMetrics: Revenue analytics aggregation (NEW)
- PaymentAnalytics: Payment and subscription analytics (NEW)
- ContactMessage: Contact form submissions (Phase 8)
- Certificate: Course completion certificates with public validation (Phase 8)
- InstructorApplication: Instructor onboarding applications (Phase 8)
"""

from app.models.user import User
from app.models.student import Student
from app.models.ai_provider import AIProvider
from app.models.ai_tutor import AITutor
from app.models.ai_agent_profile import AIAgentProfile
from app.models.user_avatar import UserAvatar, AvatarType
from app.models.copilot_session import CopilotSession, CopilotMessage
from app.models.course import Course
from app.models.enrollment import Enrollment, EnrollmentStatus
from app.models.assessment import Assessment, AssessmentSubmission
from app.models.payment import Transaction, Wallet, PaymentMethod

# Enhanced payment features (NEW)
from app.models.subscription import (
    Subscription,
    SubscriptionPlan,
    BillingCycle,
    SubscriptionStatus,
    PlanType,
)
from app.models.refund import (
    Refund,
    RefundStatus,
    RefundType,
    RefundReason,
)
from app.models.currency import (
    ExchangeRate,
    CurrencyConversion,
)
from app.models.analytics import (
    RevenueMetrics,
    PaymentAnalytics,
)
from app.models.notification import Notification, NotificationType
from app.models.forum import ForumPost, ForumReply, ForumLike
from app.models.category import Category
from app.models.store import ProductCategory, Product, Cart, CartItem, Order, OrderItem, ShippingAddress

# Phase 8 - Supporting APIs
from app.models.contact import ContactMessage
from app.models.certificate import Certificate
from app.models.instructor_application import InstructorApplication

# Account creation & onboarding models
from app.models.partner_application import PartnerApplication
from app.models.staff_account_request import StaffAccountRequest
from app.models.account_delinking_request import AccountDelinkingRequest

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

# Parent dashboard models
from app.models.parent import (
    MoodEntry,
    FamilyGoal,
    ConsentRecord,
    ConsentAuditLog,
    ParentMessage,
    AIAlert,
    NotificationPreference,
    ParentReport,
    ParentDiscussionCard,
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

# Student account models
from app.models.student_account import StudentConsentRecord, StudentTeacherAccess

# Student mastery and session tracking models
from app.models.student_mastery import StudentMasteryRecord, StudentSessionLog

# Student wallet models
from app.models.student_wallet import PaystackTransaction, StudentSavedPaymentMethod

# Staff models (must be imported before instructor models due to LiveSession relationship)
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
    InstructorLoginHistory,
)

# Plan feature toggles
from app.models.plan_feature import PlanFeature

# Cross-cutting security models
from app.models.two_factor_auth import TwoFactorAuth
from app.models.login_history import LoginHistory

__all__ = [
    # Core user models
    "User",
    "Student",

    # AI system models (core feature)
    "AIProvider",
    "AITutor",
    "AIAgentProfile",
    "CopilotSession",
    "CopilotMessage",

    # Course and assessment models
    "Course",
    "Enrollment",
    "EnrollmentStatus",
    "Assessment",
    "AssessmentSubmission",

    # Payment models (multi-gateway)
    "Transaction",
    "Wallet",
    "PaymentMethod",

    # Subscription models (NEW)
    "Subscription",
    "SubscriptionPlan",
    "BillingCycle",
    "SubscriptionStatus",
    "PlanType",

    # Refund models (NEW)
    "Refund",
    "RefundStatus",
    "RefundType",
    "RefundReason",

    # Currency models (NEW)
    "ExchangeRate",
    "CurrencyConversion",

    # Analytics models (NEW)
    "RevenueMetrics",
    "PaymentAnalytics",

    # Notification models
    "Notification",
    "NotificationType",

    # Forum models
    "ForumPost",
    "ForumReply",
    "ForumLike",

    # Category models
    "Category",

    # Store models
    "ProductCategory",
    "Product",
    "Cart",
    "CartItem",
    "Order",
    "OrderItem",
    "ShippingAddress",

    # Phase 8 - Supporting APIs
    "ContactMessage",
    "Certificate",
    "InstructorApplication",

    # Account creation & onboarding models
    "PartnerApplication",
    "StaffAccountRequest",
    "AccountDelinkingRequest",

    # Partner models
    "PartnerProfile",
    "SponsorshipProgram",
    "SponsoredChild",
    "SponsorshipConsent",
    "PartnerSubscription",
    "PartnerPayment",
    "PartnerImpactReport",
    "PartnerMessage",
    "PartnerMeeting",
    "PartnerResource",
    "PartnerTicket",

    # Parent dashboard models
    "MoodEntry",
    "FamilyGoal",
    "ConsentRecord",
    "ConsentAuditLog",
    "ParentMessage",
    "AIAlert",
    "NotificationPreference",
    "ParentReport",

    # Student dashboard models
    "StudentMoodEntry",
    "StudentStreak",
    "StudentDailyPlan",
    "StudentJournalEntry",
    "StudentWishlist",
    "StudentSessionPrep",

    # Student gamification models
    "StudentXPEvent",
    "StudentLevel",
    "StudentBadge",
    "StudentGoal",
    "StudentSkillNode",
    "StudentWeeklyReport",

    # Student community models
    "StudentFriendship",
    "StudentStudyGroup",
    "StudentShoutout",
    "StudentTeacherQA",

    # Student account models
    "StudentConsentRecord",
    "StudentTeacherAccess",

    # Student wallet models
    "PaystackTransaction",
    "StudentSavedPaymentMethod",

    # Staff models
    "StaffProfile",
    "StaffTeam",
    "StaffTicket",
    "StaffTicketMessage",
    "SLAPolicy",
    "SLAEscalation",
    "StaffContentItem",
    "StaffContentVersion",
    "StaffCollabSession",
    "AdaptiveAssessment",
    "AssessmentQuestion",
    "CBCCompetency",
    "KBCategory",
    "KBArticle",
    "KBEmbedding",
    "LiveSession",
    "LiveSessionRecording",
    "BreakoutRoom",
    "ReportDefinition",
    "ReportSchedule",
    "PushSubscription",
    "StaffNotificationPref",
    "StaffModerationItem",
    "ReviewDecision",
    "StudentJourney",
    "FamilyCase",
    "CaseNote",

    # Instructor models
    "InstructorProfile",
    "InstructorEarning",
    "InstructorPayout",
    "InstructorRevenueSplit",
    "InstructorBadge",
    "InstructorBadgeAward",
    "InstructorPoints",
    "InstructorPointsLog",
    "PeerKudo",
    "InstructorSessionAttendance",
    "InstructorSessionFollowUp",
    "InstructorDailyInsight",
    "InstructorCBCAnalysis",
    "InstructorForumPost",
    "InstructorForumReply",
    "InstructorTwoFactor",
    "InstructorLoginHistory",

    # Plan feature toggles
    "PlanFeature",

    # Cross-cutting security models
    "TwoFactorAuth",
    "LoginHistory",
]
