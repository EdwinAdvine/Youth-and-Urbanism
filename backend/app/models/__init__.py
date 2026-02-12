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
"""

from app.models.user import User
from app.models.student import Student
from app.models.ai_provider import AIProvider
from app.models.ai_tutor import AITutor
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

__all__ = [
    # Core user models
    "User",
    "Student",

    # AI system models (core feature)
    "AIProvider",
    "AITutor",

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
]
