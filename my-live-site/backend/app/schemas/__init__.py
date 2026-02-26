"""
Pydantic Schemas for Urban Home School Platform

This module exports all Pydantic schemas for request/response validation.
Schemas are organized by domain and support automatic FastAPI documentation.
"""

# User and Authentication Schemas
from app.schemas.user_schemas import (
    UserBase,
    UserCreate,
    UserLogin,
    UserResponse,
    UserUpdate,
    TokenResponse,
    PasswordChange,
    PasswordReset,
    PasswordResetConfirm,
    EmailVerification,
    RefreshTokenRequest,
)

# Student Schemas
from app.schemas.student_schemas import (
    StudentBase,
    StudentCreate,
    StudentUpdate,
    StudentResponse,
    StudentWithAITutor,
)

# AI Provider Schemas (Admin Feature)
from app.schemas.ai_provider_schemas import (
    AIProviderBase,
    AIProviderCreate,
    AIProviderUpdate,
    AIProviderResponse,
    AIProviderListResponse,
    RecommendedProviderInfo,
)

# AI Tutor Schemas (Core Feature)
from app.schemas.ai_tutor_schemas import (
    ChatMessage,
    ChatRequest,
    ChatResponse,
    ResponseModeUpdate,
    TutorStatus,
    ConversationHistory,
    AIProviderInfo,
)

# Course Schemas (CBC-aligned)
from app.schemas.course_schemas import (
    CourseBase,
    CourseCreate,
    CourseUpdate,
    CourseResponse,
    CourseWithDetails,
    CourseEnrollment,
    CourseRating,
)

# Assessment Schemas
from app.schemas.assessment_schemas import (
    QuestionSchema,
    AssessmentBase,
    AssessmentCreate,
    AssessmentUpdate,
    AssessmentResponse,
    AssessmentWithQuestions,
    SubmissionCreate,
    SubmissionUpdate,
    SubmissionResponse,
    GradeSubmission,
    AssessmentListResponse,
    SubmissionListResponse,
    AssessmentStats,
)

# Payment Schemas (Multi-Gateway)
from app.schemas.payment_schemas import (
    # Enums
    PaymentGateway,
    PaymentStatus,
    TransactionType,
    PaymentMethodType,
    # Request Schemas
    PaymentInitiateRequest,
    MpesaCallbackRequest,
    PayPalWebhookRequest,
    StripeWebhookRequest,
    AddFundsRequest,
    PaymentMethodCreate,
    PayoutRequest,
    RefundRequest,
    # Response Schemas
    PaymentInitiateResponse,
    TransactionResponse,
    WalletResponse,
    WalletTransactionResponse,
    PaymentMethodResponse,
    TransactionListResponse,
    PaymentStatusResponse,
)

__all__ = [
    # User and Authentication
    "UserBase",
    "UserCreate",
    "UserLogin",
    "UserResponse",
    "UserUpdate",
    "TokenResponse",
    "PasswordChange",
    "PasswordReset",
    "PasswordResetConfirm",
    "EmailVerification",
    "RefreshTokenRequest",

    # Student
    "StudentBase",
    "StudentCreate",
    "StudentUpdate",
    "StudentResponse",
    "StudentWithAITutor",

    # AI Provider (Admin Feature)
    "AIProviderBase",
    "AIProviderCreate",
    "AIProviderUpdate",
    "AIProviderResponse",
    "AIProviderListResponse",
    "RecommendedProviderInfo",

    # AI Tutor (Core Feature)
    "ChatMessage",
    "ChatRequest",
    "ChatResponse",
    "ResponseModeUpdate",
    "TutorStatus",
    "ConversationHistory",
    "AIProviderInfo",

    # Course (CBC-aligned)
    "CourseBase",
    "CourseCreate",
    "CourseUpdate",
    "CourseResponse",
    "CourseWithDetails",
    "CourseEnrollment",
    "CourseRating",

    # Assessment
    "QuestionSchema",
    "AssessmentBase",
    "AssessmentCreate",
    "AssessmentUpdate",
    "AssessmentResponse",
    "AssessmentWithQuestions",
    "SubmissionCreate",
    "SubmissionUpdate",
    "SubmissionResponse",
    "GradeSubmission",
    "AssessmentListResponse",
    "SubmissionListResponse",
    "AssessmentStats",

    # Payment (Multi-Gateway)
    # Enums
    "PaymentGateway",
    "PaymentStatus",
    "TransactionType",
    "PaymentMethodType",
    # Request Schemas
    "PaymentInitiateRequest",
    "MpesaCallbackRequest",
    "PayPalWebhookRequest",
    "StripeWebhookRequest",
    "AddFundsRequest",
    "PaymentMethodCreate",
    "PayoutRequest",
    "RefundRequest",
    # Response Schemas
    "PaymentInitiateResponse",
    "TransactionResponse",
    "WalletResponse",
    "WalletTransactionResponse",
    "PaymentMethodResponse",
    "TransactionListResponse",
    "PaymentStatusResponse",
]
