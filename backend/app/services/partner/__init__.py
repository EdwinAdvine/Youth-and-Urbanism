"""
Partner Services

Business logic layer for all partner dashboard features including
profile management, sponsorship programs, billing, AI insights,
analytics, and collaboration.
"""

# Profile Service
from .partner_service import (
    get_partner_profile,
    create_partner_profile,
    update_partner_profile,
)

# Sponsorship Service
from .sponsorship_service import (
    create_sponsorship_program,
    get_programs,
    get_program_detail,
    update_program,
    add_children_to_program,
    remove_child_from_program,
    get_sponsored_children,
    get_child_progress,
    get_child_activity,
    get_child_achievements,
    get_child_goals,
    request_consent,
    process_consent,
    get_consent_status,
)

# Subscription Service
from .partner_subscription_service import (
    create_subscription,
    get_subscriptions,
    update_subscription,
    cancel_subscription,
    process_payment,
    get_billing_history,
    get_budget_overview,
)

# AI Service
from .partner_ai_service import (
    generate_impact_report,
    get_ai_forecasts,
    get_child_ai_insights,
    ai_triage_ticket,
    generate_custom_content,
    get_cohort_benchmarking,
)

# Analytics Service
from .partner_analytics_service import (
    get_roi_metrics,
    get_custom_report,
    export_report,
    get_student_ai_insights,
)

# Collaboration Service
from .partner_collaboration_service import (
    send_message,
    get_messages,
    schedule_meeting,
    get_meetings,
)

__all__ = [
    # Profile
    "get_partner_profile",
    "create_partner_profile",
    "update_partner_profile",
    # Sponsorship
    "create_sponsorship_program",
    "get_programs",
    "get_program_detail",
    "update_program",
    "add_children_to_program",
    "remove_child_from_program",
    "get_sponsored_children",
    "get_child_progress",
    "get_child_activity",
    "get_child_achievements",
    "get_child_goals",
    "request_consent",
    "process_consent",
    "get_consent_status",
    # Subscriptions
    "create_subscription",
    "get_subscriptions",
    "update_subscription",
    "cancel_subscription",
    "process_payment",
    "get_billing_history",
    "get_budget_overview",
    # AI
    "generate_impact_report",
    "get_ai_forecasts",
    "get_child_ai_insights",
    "ai_triage_ticket",
    "generate_custom_content",
    "get_cohort_benchmarking",
    # Analytics
    "get_roi_metrics",
    "get_custom_report",
    "export_report",
    "get_student_ai_insights",
    # Collaboration
    "send_message",
    "get_messages",
    "schedule_meeting",
    "get_meetings",
]
