"""Central router registration — all API routers attached to the FastAPI app."""

import logging

from fastapi import FastAPI

from app.config import settings

logger = logging.getLogger(__name__)


def register_all_routers(app: FastAPI) -> None:
    """Register all API routers on the FastAPI application."""
    prefix = settings.api_v1_prefix

    # ── Shared / Public API routes ──────────────────────────────────
    from app.api.v1 import (
        auth, ai_tutor, courses, payments, assessments, users,
        parents, notifications, forum, categories, store,
        contact, certificates, instructor_applications,
        ai_agent_profile, copilot, health,
    )
    from app.api.v1 import search as global_search

    app.include_router(health.router, tags=["Health"])
    app.include_router(auth.router, prefix=prefix, tags=["Authentication"])
    app.include_router(ai_tutor.router, prefix=prefix, tags=["AI Tutor"])
    app.include_router(courses.router, prefix=prefix, tags=["Courses"])
    app.include_router(payments.router, prefix=prefix, tags=["Payments"])
    app.include_router(assessments.router, prefix=prefix, tags=["Assessments"])
    app.include_router(users.router, prefix=prefix, tags=["Users"])
    app.include_router(parents.router, prefix=prefix, tags=["Parents"])
    app.include_router(notifications.router, prefix=prefix, tags=["Notifications"])
    app.include_router(forum.router, prefix=prefix, tags=["Forum"])
    app.include_router(categories.router, prefix=prefix, tags=["Categories"])
    app.include_router(store.router, prefix=prefix, tags=["Store"])
    app.include_router(contact.router, prefix=prefix, tags=["Contact"])
    app.include_router(certificates.router, prefix=prefix, tags=["Certificates"])
    app.include_router(instructor_applications.router, prefix=prefix, tags=["Instructor Applications"])
    app.include_router(global_search.router, prefix=prefix, tags=["Search"])
    app.include_router(ai_agent_profile.router, prefix=prefix, tags=["AI Agent Profile"])
    app.include_router(copilot.router, prefix=prefix, tags=["CoPilot"])

    # ── Admin routes ────────────────────────────────────────────────
    from app.api.v1.admin import (
        ai_providers, analytics as admin_analytics, dashboard as admin_dashboard,
        permissions_api as admin_permissions, pulse as admin_pulse,
        users as admin_users, content as admin_content,
        ai_monitoring as admin_ai_monitoring,
        advanced_analytics as admin_advanced_analytics,
        finance as admin_finance, operations as admin_operations,
        account as admin_account, families as admin_families,
        restrictions as admin_restrictions, system_health as admin_system_health,
    )

    admin_prefix = f"{prefix}/admin"
    app.include_router(ai_providers.router, prefix=admin_prefix, tags=["Admin - AI Providers"])
    app.include_router(admin_analytics.router, prefix=admin_prefix, tags=["Admin - Analytics"])
    app.include_router(admin_dashboard.router, prefix=admin_prefix, tags=["Admin - Dashboard"])
    app.include_router(admin_permissions.router, prefix=admin_prefix, tags=["Admin - Permissions"])
    app.include_router(admin_pulse.router, prefix=admin_prefix, tags=["Admin - Platform Pulse"])
    app.include_router(admin_users.router, prefix=admin_prefix, tags=["Admin - Users"])
    app.include_router(admin_content.router, prefix=admin_prefix, tags=["Admin - Content"])
    app.include_router(admin_ai_monitoring.router, prefix=admin_prefix, tags=["Admin - AI Monitoring"])
    app.include_router(admin_advanced_analytics.router, prefix=admin_prefix, tags=["Admin - Advanced Analytics"])
    app.include_router(admin_finance.router, prefix=admin_prefix, tags=["Admin - Finance"])
    app.include_router(admin_operations.router, prefix=admin_prefix, tags=["Admin - Operations"])
    app.include_router(admin_account.router, prefix=admin_prefix, tags=["Admin - Account"])
    app.include_router(admin_families.router, prefix=admin_prefix, tags=["Admin - Families"])
    app.include_router(admin_restrictions.router, prefix=admin_prefix, tags=["Admin - Restrictions"])
    app.include_router(admin_system_health.router, prefix=admin_prefix, tags=["Admin - System Health"])

    # ── Staff routes ────────────────────────────────────────────────
    from app.api.v1.staff import (
        dashboard as staff_dashboard, moderation as staff_moderation,
        support as staff_support, live_support as staff_live_support,
        student_journeys as staff_student_journeys,
        knowledge_base as staff_knowledge_base,
        content_studio as staff_content_studio,
        assessment_builder as staff_assessment_builder,
        sessions as staff_sessions, insights as staff_insights,
        reports as staff_reports, student_progress as staff_student_progress,
        team as staff_team, account as staff_account,
        notifications as staff_notifications,
    )

    app.include_router(staff_dashboard.router, prefix=f"{prefix}/staff/dashboard", tags=["Staff - Dashboard"])
    app.include_router(staff_moderation.router, prefix=f"{prefix}/staff/moderation", tags=["Staff - Moderation"])
    app.include_router(staff_support.router, prefix=f"{prefix}/staff/support", tags=["Staff - Support"])
    app.include_router(staff_live_support.router, prefix=f"{prefix}/staff/live-support", tags=["Staff - Live Support"])
    app.include_router(staff_student_journeys.router, prefix=f"{prefix}/staff/students", tags=["Staff - Student Journeys"])
    app.include_router(staff_knowledge_base.router, prefix=f"{prefix}/staff/kb", tags=["Staff - Knowledge Base"])
    app.include_router(staff_content_studio.router, prefix=f"{prefix}/staff/content", tags=["Staff - Content Studio"])
    app.include_router(staff_assessment_builder.router, prefix=f"{prefix}/staff/assessments", tags=["Staff - Assessments"])
    app.include_router(staff_sessions.router, prefix=f"{prefix}/staff/sessions", tags=["Staff - Sessions"])
    app.include_router(staff_insights.router, prefix=f"{prefix}/staff/insights", tags=["Staff - Insights"])
    app.include_router(staff_reports.router, prefix=f"{prefix}/staff/reports", tags=["Staff - Reports"])
    app.include_router(staff_student_progress.router, prefix=f"{prefix}/staff/progress", tags=["Staff - Student Progress"])
    app.include_router(staff_team.router, prefix=f"{prefix}/staff/team", tags=["Staff - Team"])
    app.include_router(staff_account.router, prefix=f"{prefix}/staff/account", tags=["Staff - Account"])
    app.include_router(staff_notifications.router, prefix=f"{prefix}/staff/notifications", tags=["Staff - Notifications"])

    # ── Instructor routes ───────────────────────────────────────────
    from app.api.v1.instructor import (
        dashboard_router as instructor_dashboard,
        account_router as instructor_account,
        earnings_router as instructor_earnings,
        courses_router as instructor_courses,
        assessments_router as instructor_assessments,
        sessions_router as instructor_sessions,
        interactions_router as instructor_interactions,
        impact_router as instructor_impact,
        hub_router as instructor_hub,
        resources_router as instructor_resources,
        insights_router as instructor_insights,
    )

    inst_prefix = f"{prefix}/instructor"
    app.include_router(instructor_dashboard, prefix=inst_prefix, tags=["Instructor - Dashboard"])
    app.include_router(instructor_account, prefix=inst_prefix, tags=["Instructor - Account"])
    app.include_router(instructor_earnings, prefix=inst_prefix, tags=["Instructor - Earnings"])
    app.include_router(instructor_courses, prefix=inst_prefix, tags=["Instructor - Courses"])
    app.include_router(instructor_assessments, prefix=inst_prefix, tags=["Instructor - Assessments"])
    app.include_router(instructor_sessions, prefix=inst_prefix, tags=["Instructor - Sessions"])
    app.include_router(instructor_interactions, prefix=inst_prefix, tags=["Instructor - Interactions"])
    app.include_router(instructor_impact, prefix=inst_prefix, tags=["Instructor - Impact & Recognition"])
    app.include_router(instructor_hub, prefix=inst_prefix, tags=["Instructor - Hub & Community"])
    app.include_router(instructor_resources, prefix=inst_prefix, tags=["Instructor - Resources"])
    app.include_router(instructor_insights, prefix=inst_prefix, tags=["Instructor - AI Insights"])

    # ── Parent routes ───────────────────────────────────────────────
    from app.api.v1.parent import (
        dashboard_router as parent_dashboard,
        children_router as parent_children,
        ai_insights_router as parent_ai_insights,
        communications_router as parent_communications,
        finance_router as parent_finance,
        mpesa_router as parent_mpesa,
        reports_router as parent_reports,
        settings_router as parent_settings,
    )

    app.include_router(parent_dashboard, prefix=prefix, tags=["Parent - Dashboard"])
    app.include_router(parent_children, prefix=prefix, tags=["Parent - Children"])
    app.include_router(parent_ai_insights, prefix=prefix, tags=["Parent - AI Insights"])
    app.include_router(parent_communications, prefix=prefix, tags=["Parent - Communications"])
    app.include_router(parent_finance, prefix=prefix, tags=["Parent - Finance"])
    app.include_router(parent_mpesa, prefix=prefix, tags=["Parent - M-Pesa"])
    app.include_router(parent_reports, prefix=prefix, tags=["Parent - Reports"])
    app.include_router(parent_settings, prefix=prefix, tags=["Parent - Settings"])

    # ── Student routes ──────────────────────────────────────────────
    from app.api.v1.student import (
        dashboard as student_dashboard, ai_tutor as student_ai_tutor,
        progress as student_progress, learning as student_learning,
        community as student_community, wallet as student_wallet,
        support as student_support, account as student_account,
    )

    app.include_router(student_dashboard.router, prefix=prefix, tags=["Student - Dashboard"])
    app.include_router(student_ai_tutor.router, prefix=prefix, tags=["Student - AI Tutor"])
    app.include_router(student_progress.router, prefix=prefix, tags=["Student - Progress"])
    app.include_router(student_learning.router, prefix=prefix, tags=["Student - Learning"])
    app.include_router(student_community.router, prefix=prefix, tags=["Student - Community"])
    app.include_router(student_wallet.router, prefix=prefix, tags=["Student - Wallet"])
    app.include_router(student_support.router, prefix=prefix, tags=["Student - Support"])
    app.include_router(student_account.router, prefix=prefix, tags=["Student - Account"])

    # ── Partner routes ──────────────────────────────────────────────
    from app.api.v1.partner import (
        dashboard as partner_dashboard, sponsorships as partner_sponsorships,
        finance as partner_finance, analytics as partner_analytics,
        content as partner_content, support as partner_support,
        account as partner_account, collaboration as partner_collaboration,
    )

    app.include_router(partner_dashboard.router, prefix=f"{prefix}/partner/dashboard", tags=["Partner - Dashboard"])
    app.include_router(partner_sponsorships.router, prefix=f"{prefix}/partner/sponsorships", tags=["Partner - Sponsorships"])
    app.include_router(partner_finance.router, prefix=f"{prefix}/partner/finance", tags=["Partner - Finance"])
    app.include_router(partner_analytics.router, prefix=f"{prefix}/partner/analytics", tags=["Partner - Analytics"])
    app.include_router(partner_content.router, prefix=f"{prefix}/partner/content", tags=["Partner - Content"])
    app.include_router(partner_support.router, prefix=f"{prefix}/partner/support", tags=["Partner - Support"])
    app.include_router(partner_account.router, prefix=f"{prefix}/partner/account", tags=["Partner - Account"])
    app.include_router(partner_collaboration.router, prefix=f"{prefix}/partner/collaboration", tags=["Partner - Collaboration"])

    logger.info(
        "Routers registered: auth, ai-tutor, copilot, courses, payments, parents, notifications, forum, "
        "categories, store, admin/*, staff/*, instructor/*, parent/*, student/*, partner/*, "
        "contact, certificates, instructor-applications, search, ai-agent-profile"
    )
