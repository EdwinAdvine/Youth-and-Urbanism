"""
Instructor Services

Business logic layer for all instructor dashboard features.
"""

# Profile Service
from .profile_service import (
    get_or_create_profile,
    update_profile,
    update_public_profile,
    get_public_profile_by_slug,
    update_availability,
    update_onboarding_step,
    ai_generate_portfolio_suggestions,
)

# Dashboard Service
from .dashboard_service import (
    get_dashboard_stats,
    get_dashboard_overview,
)

# Course Service
from .course_service import (
    create_course,
    update_course_modules,
    get_course_analytics,
)

# Session Service
from .session_service import (
    create_session,
    get_session_attendance,
    generate_session_summary,
)

# Earnings Service
from .earnings_service import (
    calculate_earning,
    request_payout,
    get_earnings_breakdown,
)

# Gamification Service
from .gamification_service import (
    get_or_create_points_record,
    add_points,
    check_and_award_badges,
    create_peer_kudo,
    get_leaderboard,
)

# Security Service
from .security_service import (
    setup_totp,
    verify_totp,
    enable_totp,
    enable_sms_otp,
    log_login_attempt,
    get_login_history,
)

# AI Insight Service
from .ai_insight_service import (
    generate_daily_insights,
    analyze_cbc_alignment,
)

__all__ = [
    # Profile
    "get_or_create_profile",
    "update_profile",
    "update_public_profile",
    "get_public_profile_by_slug",
    "update_availability",
    "update_onboarding_step",
    "ai_generate_portfolio_suggestions",
    # Dashboard
    "get_dashboard_stats",
    "get_dashboard_overview",
    # Courses
    "create_course",
    "update_course_modules",
    "get_course_analytics",
    # Sessions
    "create_session",
    "get_session_attendance",
    "generate_session_summary",
    # Earnings
    "calculate_earning",
    "request_payout",
    "get_earnings_breakdown",
    # Gamification
    "get_or_create_points_record",
    "add_points",
    "check_and_award_badges",
    "create_peer_kudo",
    "get_leaderboard",
    # Security
    "setup_totp",
    "verify_totp",
    "enable_totp",
    "enable_sms_otp",
    "log_login_attempt",
    "get_login_history",
    # AI Insights
    "generate_daily_insights",
    "analyze_cbc_alignment",
]
