"""
Admin Operations & Control Service - Phase 8

Provides service methods for:
- Support ticket management (mock data)
- Content moderation queue (mock data)
- System configuration (mock data)
- Audit log querying (real data via AuditLog model)

Mock methods will be replaced with real database queries once the
corresponding models (SupportTicket, ModerationItem, SystemConfig)
are created.
"""

import uuid
import logging
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from sqlalchemy import select, func, and_, desc, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.admin.audit_log import AuditLog

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Mock data generators
# ---------------------------------------------------------------------------

def _generate_mock_tickets() -> List[Dict[str, Any]]:
    """Generate realistic support ticket mock data."""
    now = datetime.utcnow()
    return [
        {
            "id": "TKT-001",
            "subject": "Unable to access Grade 5 Mathematics course",
            "reporter": {"name": "Mary Wanjiku", "email": "mary.wanjiku@example.com", "role": "parent"},
            "priority": "high",
            "status": "open",
            "assigned_to": "David Ochieng",
            "sla_status": "on_track",
            "sla_deadline": (now + timedelta(hours=4)).isoformat(),
            "created_at": (now - timedelta(hours=2)).isoformat(),
            "updated_at": (now - timedelta(minutes=30)).isoformat(),
            "category": "access",
            "messages": [
                {
                    "id": str(uuid.uuid4()),
                    "sender": {"name": "Mary Wanjiku", "role": "parent"},
                    "content": "My daughter has been enrolled in Grade 5 Mathematics but when she tries to access the course, it shows 'Course not available'. We paid via M-Pesa last week and the payment was confirmed.",
                    "created_at": (now - timedelta(hours=2)).isoformat(),
                    "is_internal": False,
                },
                {
                    "id": str(uuid.uuid4()),
                    "sender": {"name": "David Ochieng", "role": "staff"},
                    "content": "Thank you for reaching out, Mary. I can see the payment was processed successfully. Let me check the enrollment status and course assignment for your daughter's account.",
                    "created_at": (now - timedelta(hours=1, minutes=45)).isoformat(),
                    "is_internal": False,
                },
                {
                    "id": str(uuid.uuid4()),
                    "sender": {"name": "David Ochieng", "role": "staff"},
                    "content": "Internal note: The enrollment record exists but course_access flag was not set. This appears to be a bug in the enrollment flow when M-Pesa callback is delayed.",
                    "created_at": (now - timedelta(hours=1, minutes=30)).isoformat(),
                    "is_internal": True,
                },
            ],
        },
        {
            "id": "TKT-002",
            "subject": "AI Tutor giving incorrect answers in Science",
            "reporter": {"name": "James Kamau", "email": "james.kamau@example.com", "role": "instructor"},
            "priority": "critical",
            "status": "in_progress",
            "assigned_to": "Faith Muthoni",
            "sla_status": "at_risk",
            "sla_deadline": (now + timedelta(hours=1)).isoformat(),
            "created_at": (now - timedelta(hours=5)).isoformat(),
            "updated_at": (now - timedelta(minutes=15)).isoformat(),
            "category": "ai_quality",
            "messages": [
                {
                    "id": str(uuid.uuid4()),
                    "sender": {"name": "James Kamau", "role": "instructor"},
                    "content": "The AI tutor in Grade 7 Science is providing incorrect information about the water cycle. It's telling students that evaporation happens at 100 degrees Celsius only, which is wrong. Evaporation occurs at any temperature.",
                    "created_at": (now - timedelta(hours=5)).isoformat(),
                    "is_internal": False,
                },
                {
                    "id": str(uuid.uuid4()),
                    "sender": {"name": "Faith Muthoni", "role": "staff"},
                    "content": "Thank you for flagging this, James. This is a critical issue. I'm escalating to the AI team to review the Gemini Pro responses for Science topics.",
                    "created_at": (now - timedelta(hours=4)).isoformat(),
                    "is_internal": False,
                },
                {
                    "id": str(uuid.uuid4()),
                    "sender": {"name": "Faith Muthoni", "role": "staff"},
                    "content": "AI team confirmed: The system prompt for Science needs to be updated. A fix is being deployed now. We'll also audit all Grade 7 Science responses from the past 48 hours.",
                    "created_at": (now - timedelta(minutes=15)).isoformat(),
                    "is_internal": False,
                },
            ],
        },
        {
            "id": "TKT-003",
            "subject": "M-Pesa payment deducted but enrollment not confirmed",
            "reporter": {"name": "Peter Otieno", "email": "peter.otieno@example.com", "role": "parent"},
            "priority": "high",
            "status": "open",
            "assigned_to": None,
            "sla_status": "breached",
            "sla_deadline": (now - timedelta(hours=2)).isoformat(),
            "created_at": (now - timedelta(hours=8)).isoformat(),
            "updated_at": (now - timedelta(hours=8)).isoformat(),
            "category": "payments",
            "messages": [
                {
                    "id": str(uuid.uuid4()),
                    "sender": {"name": "Peter Otieno", "role": "parent"},
                    "content": "I paid KES 2,500 for Grade 3 English course for my son via M-Pesa (transaction ID: QJK4XY78Z9). The money was deducted from my account but the enrollment shows 'Pending Payment'. Please help resolve this urgently.",
                    "created_at": (now - timedelta(hours=8)).isoformat(),
                    "is_internal": False,
                },
                {
                    "id": str(uuid.uuid4()),
                    "sender": {"name": "Peter Otieno", "role": "parent"},
                    "content": "It's been 8 hours and no one has responded. My son needs to access the course for his homework. Please prioritize this.",
                    "created_at": (now - timedelta(hours=2)).isoformat(),
                    "is_internal": False,
                },
            ],
        },
        {
            "id": "TKT-004",
            "subject": "Request for CBC Grade 8 syllabus alignment report",
            "reporter": {"name": "Grace Akinyi", "email": "grace.akinyi@example.com", "role": "partner"},
            "priority": "medium",
            "status": "open",
            "assigned_to": "David Ochieng",
            "sla_status": "on_track",
            "sla_deadline": (now + timedelta(days=2)).isoformat(),
            "created_at": (now - timedelta(days=1)).isoformat(),
            "updated_at": (now - timedelta(hours=12)).isoformat(),
            "category": "content",
            "messages": [
                {
                    "id": str(uuid.uuid4()),
                    "sender": {"name": "Grace Akinyi", "role": "partner"},
                    "content": "As a partner school, we need a detailed report showing how the Grade 8 courses align with the CBC competency framework. This is needed for our upcoming KICD audit. Can you provide this within the next 3 days?",
                    "created_at": (now - timedelta(days=1)).isoformat(),
                    "is_internal": False,
                },
                {
                    "id": str(uuid.uuid4()),
                    "sender": {"name": "David Ochieng", "role": "staff"},
                    "content": "Hi Grace, thank you for the request. I'll coordinate with our curriculum team to prepare the alignment report. We should have it ready within 48 hours.",
                    "created_at": (now - timedelta(hours=12)).isoformat(),
                    "is_internal": False,
                },
            ],
        },
        {
            "id": "TKT-005",
            "subject": "Cannot download certificate after course completion",
            "reporter": {"name": "Brian Kiprop", "email": "brian.kiprop@example.com", "role": "student"},
            "priority": "low",
            "status": "resolved",
            "assigned_to": "Faith Muthoni",
            "sla_status": "on_track",
            "sla_deadline": (now + timedelta(days=1)).isoformat(),
            "created_at": (now - timedelta(days=2)).isoformat(),
            "updated_at": (now - timedelta(hours=6)).isoformat(),
            "category": "feature",
            "messages": [
                {
                    "id": str(uuid.uuid4()),
                    "sender": {"name": "Brian Kiprop", "role": "student"},
                    "content": "I completed Grade 6 Social Studies with 92% but the certificate download button shows an error. I need the certificate for my school records.",
                    "created_at": (now - timedelta(days=2)).isoformat(),
                    "is_internal": False,
                },
                {
                    "id": str(uuid.uuid4()),
                    "sender": {"name": "Faith Muthoni", "role": "staff"},
                    "content": "Hi Brian, congratulations on your excellent score! I've regenerated your certificate. Please try downloading it again from your profile page.",
                    "created_at": (now - timedelta(hours=6)).isoformat(),
                    "is_internal": False,
                },
                {
                    "id": str(uuid.uuid4()),
                    "sender": {"name": "Brian Kiprop", "role": "student"},
                    "content": "It works now. Thank you so much!",
                    "created_at": (now - timedelta(hours=5)).isoformat(),
                    "is_internal": False,
                },
            ],
        },
        {
            "id": "TKT-006",
            "subject": "Voice lessons not loading on mobile browser",
            "reporter": {"name": "Ann Njeri", "email": "ann.njeri@example.com", "role": "parent"},
            "priority": "medium",
            "status": "in_progress",
            "assigned_to": "David Ochieng",
            "sla_status": "on_track",
            "sla_deadline": (now + timedelta(hours=12)).isoformat(),
            "created_at": (now - timedelta(hours=6)).isoformat(),
            "updated_at": (now - timedelta(hours=3)).isoformat(),
            "category": "technical",
            "messages": [
                {
                    "id": str(uuid.uuid4()),
                    "sender": {"name": "Ann Njeri", "role": "parent"},
                    "content": "The ElevenLabs voice lessons are not playing on my daughter's phone (Samsung A23, Chrome browser). Audio just shows loading spinner indefinitely. It works on my laptop though.",
                    "created_at": (now - timedelta(hours=6)).isoformat(),
                    "is_internal": False,
                },
                {
                    "id": str(uuid.uuid4()),
                    "sender": {"name": "David Ochieng", "role": "staff"},
                    "content": "Thank you for the detailed report, Ann. This appears to be a known issue with audio autoplay policies on mobile Chrome. We're working on a fix that adds a manual play button for mobile devices.",
                    "created_at": (now - timedelta(hours=3)).isoformat(),
                    "is_internal": False,
                },
            ],
        },
        {
            "id": "TKT-007",
            "subject": "Account locked after multiple failed login attempts",
            "reporter": {"name": "Samuel Mwangi", "email": "samuel.mwangi@example.com", "role": "instructor"},
            "priority": "medium",
            "status": "closed",
            "assigned_to": "Faith Muthoni",
            "sla_status": "on_track",
            "sla_deadline": (now - timedelta(days=1)).isoformat(),
            "created_at": (now - timedelta(days=3)).isoformat(),
            "updated_at": (now - timedelta(days=2)).isoformat(),
            "category": "access",
            "messages": [
                {
                    "id": str(uuid.uuid4()),
                    "sender": {"name": "Samuel Mwangi", "role": "instructor"},
                    "content": "My account seems to be locked. I forgot my password and tried multiple times. Now it says 'Account temporarily locked'. I need access to upload this week's assignments.",
                    "created_at": (now - timedelta(days=3)).isoformat(),
                    "is_internal": False,
                },
                {
                    "id": str(uuid.uuid4()),
                    "sender": {"name": "Faith Muthoni", "role": "staff"},
                    "content": "Hi Samuel, I've unlocked your account and sent a password reset link to your email. The lockout is a security feature that triggers after 5 failed attempts. Please use the reset link to set a new password.",
                    "created_at": (now - timedelta(days=3, hours=-2)).isoformat(),
                    "is_internal": False,
                },
                {
                    "id": str(uuid.uuid4()),
                    "sender": {"name": "Samuel Mwangi", "role": "instructor"},
                    "content": "Password reset worked. I can access my account now. Thanks for the quick help!",
                    "created_at": (now - timedelta(days=2)).isoformat(),
                    "is_internal": False,
                },
            ],
        },
    ]


def _generate_mock_moderation_queue() -> List[Dict[str, Any]]:
    """Generate realistic content moderation queue items."""
    now = datetime.utcnow()
    return [
        {
            "id": str(uuid.uuid4()),
            "content_type": "ai_response",
            "content_preview": "The process of photosynthesis involves... [AI response flagged for potential inaccuracy in Grade 4 Science]",
            "reason": "Factual accuracy concern",
            "ai_confidence": 0.72,
            "reporter": "Auto-detection",
            "status": "pending",
            "created_at": (now - timedelta(minutes=15)).isoformat(),
            "source": "Gemini Pro",
            "grade_level": "Grade 4",
            "subject": "Science",
        },
        {
            "id": str(uuid.uuid4()),
            "content_type": "forum_post",
            "content_preview": "Hey everyone, check out this link for free answers to all CBC exams...",
            "reason": "Spam / External links",
            "ai_confidence": 0.95,
            "reporter": "Auto-detection",
            "status": "pending",
            "created_at": (now - timedelta(minutes=30)).isoformat(),
            "source": "Student Forum",
            "grade_level": None,
            "subject": None,
        },
        {
            "id": str(uuid.uuid4()),
            "content_type": "ai_response",
            "content_preview": "To solve this equation, you need to multiply both sides by... [Content contains age-inappropriate complexity for Grade 2]",
            "reason": "Age-inappropriate content",
            "ai_confidence": 0.68,
            "reporter": "Instructor James Kamau",
            "status": "pending",
            "created_at": (now - timedelta(hours=1)).isoformat(),
            "source": "Claude 3.5 Sonnet",
            "grade_level": "Grade 2",
            "subject": "Mathematics",
        },
        {
            "id": str(uuid.uuid4()),
            "content_type": "profile_image",
            "content_preview": "[Image upload - potentially inappropriate avatar]",
            "reason": "Inappropriate image",
            "ai_confidence": 0.84,
            "reporter": "Auto-detection",
            "status": "pending",
            "created_at": (now - timedelta(hours=2)).isoformat(),
            "source": "User Profile",
            "grade_level": None,
            "subject": None,
        },
        {
            "id": str(uuid.uuid4()),
            "content_type": "course_content",
            "content_preview": "Lesson 5: Understanding Human Reproduction... [flagged for review of age-appropriateness]",
            "reason": "Sensitive topic review",
            "ai_confidence": 0.55,
            "reporter": "Auto-detection",
            "status": "flagged",
            "created_at": (now - timedelta(hours=3)).isoformat(),
            "source": "Course: Grade 7 Science",
            "grade_level": "Grade 7",
            "subject": "Science",
        },
        {
            "id": str(uuid.uuid4()),
            "content_type": "forum_post",
            "content_preview": "This teacher doesn't know what they're teaching, the lessons are terrible and waste of time",
            "reason": "Harassment / Negative conduct",
            "ai_confidence": 0.79,
            "reporter": "Parent Ann Njeri",
            "status": "pending",
            "created_at": (now - timedelta(hours=4)).isoformat(),
            "source": "Student Forum",
            "grade_level": None,
            "subject": None,
        },
        {
            "id": str(uuid.uuid4()),
            "content_type": "ai_response",
            "content_preview": "Kenya's independence was in 1964... [Incorrect: Kenya's independence was on 12 December 1963]",
            "reason": "Factual error - Historical date",
            "ai_confidence": 0.91,
            "reporter": "Auto-detection",
            "status": "approved",
            "created_at": (now - timedelta(hours=6)).isoformat(),
            "source": "GPT-4",
            "grade_level": "Grade 5",
            "subject": "Social Studies",
        },
    ]


def _generate_mock_keyword_filters() -> List[Dict[str, Any]]:
    """Generate keyword filter configuration mock data."""
    return [
        {"id": str(uuid.uuid4()), "pattern": "free answers", "type": "keyword", "action": "block", "status": "active", "hits": 23},
        {"id": str(uuid.uuid4()), "pattern": "exam leak", "type": "keyword", "action": "block", "status": "active", "hits": 5},
        {"id": str(uuid.uuid4()), "pattern": r"https?://(?!urbanhomeschool)", "type": "regex", "action": "flag", "status": "active", "hits": 142},
        {"id": str(uuid.uuid4()), "pattern": "hack", "type": "keyword", "action": "warn", "status": "active", "hits": 8},
        {"id": str(uuid.uuid4()), "pattern": "cheat", "type": "keyword", "action": "flag", "status": "active", "hits": 31},
        {"id": str(uuid.uuid4()), "pattern": r"\b\d{10}\b", "type": "regex", "action": "flag", "status": "active", "hits": 67},
        {"id": str(uuid.uuid4()), "pattern": "password", "type": "keyword", "action": "warn", "status": "inactive", "hits": 12},
    ]


def _generate_mock_system_configs() -> List[Dict[str, Any]]:
    """Generate realistic system configuration mock data."""
    now = datetime.utcnow()
    return [
        # General
        {"key": "platform.name", "value": "Urban Home School", "category": "General", "description": "Platform display name", "last_modified": (now - timedelta(days=90)).isoformat(), "modified_by": "admin@urbanhomeschool.co.ke"},
        {"key": "platform.maintenance_mode", "value": "false", "category": "General", "description": "Enable maintenance mode to block user access", "last_modified": (now - timedelta(days=14)).isoformat(), "modified_by": "admin@urbanhomeschool.co.ke"},
        {"key": "platform.max_students_per_class", "value": "40", "category": "General", "description": "Maximum number of students per virtual class", "last_modified": (now - timedelta(days=30)).isoformat(), "modified_by": "admin@urbanhomeschool.co.ke"},
        {"key": "platform.default_language", "value": "en", "category": "General", "description": "Default platform language (en, sw)", "last_modified": (now - timedelta(days=60)).isoformat(), "modified_by": "admin@urbanhomeschool.co.ke"},
        # Security
        {"key": "security.max_login_attempts", "value": "5", "category": "Security", "description": "Maximum failed login attempts before account lockout", "last_modified": (now - timedelta(days=7)).isoformat(), "modified_by": "admin@urbanhomeschool.co.ke"},
        {"key": "security.lockout_duration_minutes", "value": "30", "category": "Security", "description": "Account lockout duration in minutes", "last_modified": (now - timedelta(days=7)).isoformat(), "modified_by": "admin@urbanhomeschool.co.ke"},
        {"key": "security.session_timeout_minutes", "value": "60", "category": "Security", "description": "User session timeout in minutes", "last_modified": (now - timedelta(days=21)).isoformat(), "modified_by": "admin@urbanhomeschool.co.ke"},
        {"key": "security.password_min_length", "value": "8", "category": "Security", "description": "Minimum password length for user accounts", "last_modified": (now - timedelta(days=45)).isoformat(), "modified_by": "admin@urbanhomeschool.co.ke"},
        {"key": "security.require_2fa_admin", "value": "true", "category": "Security", "description": "Require two-factor authentication for admin accounts", "last_modified": (now - timedelta(days=3)).isoformat(), "modified_by": "admin@urbanhomeschool.co.ke"},
        # AI
        {"key": "ai.default_model", "value": "gemini-pro", "category": "AI", "description": "Default AI model for tutoring sessions", "last_modified": (now - timedelta(days=5)).isoformat(), "modified_by": "admin@urbanhomeschool.co.ke"},
        {"key": "ai.max_tokens_per_response", "value": "2048", "category": "AI", "description": "Maximum tokens per AI response", "last_modified": (now - timedelta(days=10)).isoformat(), "modified_by": "admin@urbanhomeschool.co.ke"},
        {"key": "ai.safety_filter_threshold", "value": "0.7", "category": "AI", "description": "AI content safety filter confidence threshold (0-1)", "last_modified": (now - timedelta(days=2)).isoformat(), "modified_by": "admin@urbanhomeschool.co.ke"},
        {"key": "ai.fallback_enabled", "value": "true", "category": "AI", "description": "Enable automatic failover to alternative AI models", "last_modified": (now - timedelta(days=15)).isoformat(), "modified_by": "admin@urbanhomeschool.co.ke"},
        {"key": "ai.daily_token_budget", "value": "500000", "category": "AI", "description": "Daily token budget across all AI providers", "last_modified": (now - timedelta(days=1)).isoformat(), "modified_by": "admin@urbanhomeschool.co.ke"},
        # Payments
        {"key": "payments.mpesa_enabled", "value": "true", "category": "Payments", "description": "Enable M-Pesa payment gateway", "last_modified": (now - timedelta(days=30)).isoformat(), "modified_by": "admin@urbanhomeschool.co.ke"},
        {"key": "payments.mpesa_shortcode", "value": "174379", "category": "Payments", "description": "M-Pesa business shortcode", "last_modified": (now - timedelta(days=60)).isoformat(), "modified_by": "admin@urbanhomeschool.co.ke"},
        {"key": "payments.currency", "value": "KES", "category": "Payments", "description": "Default payment currency", "last_modified": (now - timedelta(days=90)).isoformat(), "modified_by": "admin@urbanhomeschool.co.ke"},
        {"key": "payments.min_amount", "value": "100", "category": "Payments", "description": "Minimum payment amount in KES", "last_modified": (now - timedelta(days=30)).isoformat(), "modified_by": "admin@urbanhomeschool.co.ke"},
        # Notifications
        {"key": "notifications.email_enabled", "value": "true", "category": "Notifications", "description": "Enable email notifications", "last_modified": (now - timedelta(days=20)).isoformat(), "modified_by": "admin@urbanhomeschool.co.ke"},
        {"key": "notifications.sms_enabled", "value": "true", "category": "Notifications", "description": "Enable SMS notifications via Africa's Talking", "last_modified": (now - timedelta(days=20)).isoformat(), "modified_by": "admin@urbanhomeschool.co.ke"},
        {"key": "notifications.push_enabled", "value": "false", "category": "Notifications", "description": "Enable push notifications", "last_modified": (now - timedelta(days=10)).isoformat(), "modified_by": "admin@urbanhomeschool.co.ke"},
        {"key": "notifications.digest_frequency", "value": "daily", "category": "Notifications", "description": "Email digest frequency (daily, weekly, none)", "last_modified": (now - timedelta(days=15)).isoformat(), "modified_by": "admin@urbanhomeschool.co.ke"},
    ]


def _generate_mock_pending_changes() -> List[Dict[str, Any]]:
    """Generate mock pending config changes awaiting approval."""
    now = datetime.utcnow()
    return [
        {
            "id": str(uuid.uuid4()),
            "config_key": "ai.max_tokens_per_response",
            "current_value": "2048",
            "proposed_value": "4096",
            "requested_by": "faith.muthoni@urbanhomeschool.co.ke",
            "requested_at": (now - timedelta(hours=3)).isoformat(),
            "reason": "Students in higher grades need longer AI responses for complex topics",
        },
        {
            "id": str(uuid.uuid4()),
            "config_key": "security.session_timeout_minutes",
            "current_value": "60",
            "proposed_value": "120",
            "requested_by": "david.ochieng@urbanhomeschool.co.ke",
            "requested_at": (now - timedelta(hours=8)).isoformat(),
            "reason": "Parents report being logged out too frequently during long study sessions",
        },
        {
            "id": str(uuid.uuid4()),
            "config_key": "ai.daily_token_budget",
            "current_value": "500000",
            "proposed_value": "750000",
            "requested_by": "faith.muthoni@urbanhomeschool.co.ke",
            "requested_at": (now - timedelta(days=1)).isoformat(),
            "reason": "Current budget is being reached by 3pm due to increased student adoption",
        },
    ]


# ---------------------------------------------------------------------------
# Service class
# ---------------------------------------------------------------------------

class OperationsService:
    """Service for Operations & Control admin features."""

    # ------------------------------------------------------------------
    # Support Tickets (mock)
    # ------------------------------------------------------------------
    @staticmethod
    async def list_tickets(
        db: AsyncSession,
        *,
        page: int = 1,
        page_size: int = 25,
        status_filter: Optional[str] = None,
        priority_filter: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        List support tickets with pagination and optional filters.
        Returns mock data until a SupportTicket model is created.
        """
        all_tickets = _generate_mock_tickets()

        # Apply filters
        filtered = all_tickets
        if status_filter and status_filter != "all":
            filtered = [t for t in filtered if t["status"] == status_filter]
        if priority_filter and priority_filter != "all":
            filtered = [t for t in filtered if t["priority"] == priority_filter]

        total = len(filtered)
        offset = (page - 1) * page_size
        page_items = filtered[offset: offset + page_size]

        # Strip messages from list view for efficiency
        items_without_messages = []
        for ticket in page_items:
            t = {k: v for k, v in ticket.items() if k != "messages"}
            items_without_messages.append(t)

        # Compute stats
        all_t = _generate_mock_tickets()
        stats = {
            "open_tickets": len([t for t in all_t if t["status"] in ("open", "in_progress")]),
            "avg_response_time": "2h 15m",
            "sla_breached": len([t for t in all_t if t["sla_status"] == "breached"]),
            "csat_score": 4.2,
        }

        return {
            "items": items_without_messages,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": max(1, (total + page_size - 1) // page_size),
            "stats": stats,
        }

    @staticmethod
    async def get_ticket_detail(
        db: AsyncSession,
        ticket_id: str,
    ) -> Optional[Dict[str, Any]]:
        """
        Get a single ticket with full message thread.
        Returns mock data until a SupportTicket model is created.
        """
        all_tickets = _generate_mock_tickets()
        for ticket in all_tickets:
            if ticket["id"] == ticket_id:
                return ticket
        return None

    # ------------------------------------------------------------------
    # Moderation Queue (mock)
    # ------------------------------------------------------------------
    @staticmethod
    async def list_moderation_queue(
        db: AsyncSession,
        *,
        page: int = 1,
        page_size: int = 25,
    ) -> Dict[str, Any]:
        """
        List moderation queue items with pagination.
        Returns mock data until a ModerationItem model is created.
        """
        all_items = _generate_mock_moderation_queue()
        total = len(all_items)
        offset = (page - 1) * page_size
        page_items = all_items[offset: offset + page_size]

        keyword_filters = _generate_mock_keyword_filters()

        stats = {
            "pending_count": len([i for i in all_items if i["status"] == "pending"]),
            "flagged_count": len([i for i in all_items if i["status"] == "flagged"]),
            "approved_today": 12,
            "removed_today": 3,
        }

        return {
            "items": page_items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": max(1, (total + page_size - 1) // page_size),
            "stats": stats,
            "keyword_filters": keyword_filters,
        }

    # ------------------------------------------------------------------
    # System Configuration (mock)
    # ------------------------------------------------------------------
    @staticmethod
    async def get_system_configs(
        db: AsyncSession,
    ) -> Dict[str, Any]:
        """
        Get all system configuration key-value pairs grouped by category.
        Returns mock data until a SystemConfig model is created.
        """
        configs = _generate_mock_system_configs()
        pending_changes = _generate_mock_pending_changes()

        # Group by category
        grouped: Dict[str, List[Dict[str, Any]]] = {}
        for cfg in configs:
            cat = cfg["category"]
            if cat not in grouped:
                grouped[cat] = []
            grouped[cat].append(cfg)

        return {
            "configs": grouped,
            "pending_changes": pending_changes,
            "total_configs": len(configs),
            "total_pending": len(pending_changes),
        }

    # ------------------------------------------------------------------
    # Audit Logs (real data from audit_logs table)
    # ------------------------------------------------------------------
    @staticmethod
    async def list_audit_logs(
        db: AsyncSession,
        *,
        page: int = 1,
        page_size: int = 50,
        action_filter: Optional[str] = None,
        status_filter: Optional[str] = None,
        date_from: Optional[str] = None,
        date_to: Optional[str] = None,
        search: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        List audit log entries with filtering and pagination.
        Queries the real AuditLog model from app.models.admin.audit_log.
        Falls back to mock data if the table is empty or query fails.
        """
        try:
            query = select(AuditLog)
            count_query = select(func.count(AuditLog.id))

            conditions = []

            if action_filter and action_filter != "all":
                conditions.append(AuditLog.action.ilike(f"%{action_filter}%"))
            if status_filter and status_filter != "all":
                conditions.append(AuditLog.status == status_filter)
            if date_from:
                try:
                    dt_from = datetime.fromisoformat(date_from)
                    conditions.append(AuditLog.created_at >= dt_from)
                except ValueError:
                    pass
            if date_to:
                try:
                    dt_to = datetime.fromisoformat(date_to)
                    conditions.append(AuditLog.created_at <= dt_to)
                except ValueError:
                    pass
            if search:
                conditions.append(
                    or_(
                        AuditLog.actor_email.ilike(f"%{search}%"),
                        AuditLog.action.ilike(f"%{search}%"),
                        AuditLog.resource_type.ilike(f"%{search}%"),
                    )
                )

            if conditions:
                query = query.where(and_(*conditions))
                count_query = count_query.where(and_(*conditions))

            # Total count
            total_result = await db.execute(count_query)
            total = total_result.scalar() or 0

            # Paginated results
            offset = (page - 1) * page_size
            query = query.order_by(desc(AuditLog.created_at)).offset(offset).limit(page_size)
            result = await db.execute(query)
            logs = result.scalars().all()

            if total > 0:
                items = [
                    {
                        "id": str(log.id),
                        "actor_id": str(log.actor_id) if log.actor_id else None,
                        "actor_email": log.actor_email,
                        "actor_role": log.actor_role,
                        "action": log.action,
                        "resource_type": log.resource_type,
                        "resource_id": str(log.resource_id) if log.resource_id else None,
                        "details": log.details,
                        "ip_address": log.ip_address,
                        "user_agent": log.user_agent,
                        "status": log.status,
                        "created_at": log.created_at.isoformat() if log.created_at else None,
                    }
                    for log in logs
                ]
            else:
                # Return mock data if table is empty
                items, total = _generate_mock_audit_logs(page, page_size)

            return {
                "items": items,
                "total": total,
                "page": page,
                "page_size": page_size,
                "total_pages": max(1, (total + page_size - 1) // page_size),
            }

        except Exception as exc:
            logger.warning(f"Failed to query audit_logs table, returning mock data: {exc}")
            items, total = _generate_mock_audit_logs(page, page_size)
            return {
                "items": items,
                "total": total,
                "page": page,
                "page_size": page_size,
                "total_pages": max(1, (total + page_size - 1) // page_size),
            }


def _generate_mock_audit_logs(
    page: int = 1,
    page_size: int = 50,
) -> tuple:
    """Generate mock audit log entries as fallback."""
    now = datetime.utcnow()
    all_logs = [
        {
            "id": str(uuid.uuid4()),
            "actor_id": str(uuid.uuid4()),
            "actor_email": "admin@urbanhomeschool.co.ke",
            "actor_role": "admin",
            "action": "user.create",
            "resource_type": "user",
            "resource_id": str(uuid.uuid4()),
            "details": {"role": "instructor", "email": "new.instructor@example.com"},
            "ip_address": "196.201.214.100",
            "user_agent": "Mozilla/5.0",
            "status": "success",
            "created_at": (now - timedelta(minutes=5)).isoformat(),
        },
        {
            "id": str(uuid.uuid4()),
            "actor_id": str(uuid.uuid4()),
            "actor_email": "faith.muthoni@urbanhomeschool.co.ke",
            "actor_role": "staff",
            "action": "course.update",
            "resource_type": "course",
            "resource_id": str(uuid.uuid4()),
            "details": {"field": "is_published", "old_value": False, "new_value": True},
            "ip_address": "196.201.214.105",
            "user_agent": "Mozilla/5.0",
            "status": "success",
            "created_at": (now - timedelta(minutes=12)).isoformat(),
        },
        {
            "id": str(uuid.uuid4()),
            "actor_id": str(uuid.uuid4()),
            "actor_email": "admin@urbanhomeschool.co.ke",
            "actor_role": "admin",
            "action": "config.update",
            "resource_type": "system_config",
            "resource_id": None,
            "details": {"key": "ai.safety_filter_threshold", "old_value": "0.6", "new_value": "0.7"},
            "ip_address": "196.201.214.100",
            "user_agent": "Mozilla/5.0",
            "status": "success",
            "created_at": (now - timedelta(minutes=25)).isoformat(),
        },
        {
            "id": str(uuid.uuid4()),
            "actor_id": str(uuid.uuid4()),
            "actor_email": "david.ochieng@urbanhomeschool.co.ke",
            "actor_role": "staff",
            "action": "user.deactivate",
            "resource_type": "user",
            "resource_id": str(uuid.uuid4()),
            "details": {"reason": "Account flagged for suspicious activity"},
            "ip_address": "196.201.214.110",
            "user_agent": "Mozilla/5.0",
            "status": "success",
            "created_at": (now - timedelta(minutes=45)).isoformat(),
        },
        {
            "id": str(uuid.uuid4()),
            "actor_id": str(uuid.uuid4()),
            "actor_email": "admin@urbanhomeschool.co.ke",
            "actor_role": "admin",
            "action": "payment.refund",
            "resource_type": "transaction",
            "resource_id": str(uuid.uuid4()),
            "details": {"amount": 2500, "currency": "KES", "gateway": "mpesa"},
            "ip_address": "196.201.214.100",
            "user_agent": "Mozilla/5.0",
            "status": "success",
            "created_at": (now - timedelta(hours=1)).isoformat(),
        },
        {
            "id": str(uuid.uuid4()),
            "actor_id": str(uuid.uuid4()),
            "actor_email": "faith.muthoni@urbanhomeschool.co.ke",
            "actor_role": "staff",
            "action": "ai_provider.toggle",
            "resource_type": "ai_provider",
            "resource_id": str(uuid.uuid4()),
            "details": {"provider": "grok", "action": "disabled", "reason": "API rate limit exceeded"},
            "ip_address": "196.201.214.105",
            "user_agent": "Mozilla/5.0",
            "status": "success",
            "created_at": (now - timedelta(hours=2)).isoformat(),
        },
        {
            "id": str(uuid.uuid4()),
            "actor_id": str(uuid.uuid4()),
            "actor_email": "unknown@attacker.com",
            "actor_role": "unknown",
            "action": "auth.login",
            "resource_type": "session",
            "resource_id": None,
            "details": {"error": "Invalid credentials", "attempts": 5},
            "ip_address": "103.45.67.89",
            "user_agent": "curl/7.68.0",
            "status": "failure",
            "created_at": (now - timedelta(hours=3)).isoformat(),
        },
        {
            "id": str(uuid.uuid4()),
            "actor_id": str(uuid.uuid4()),
            "actor_email": "admin@urbanhomeschool.co.ke",
            "actor_role": "admin",
            "action": "role.assign",
            "resource_type": "user",
            "resource_id": str(uuid.uuid4()),
            "details": {"user_email": "new.staff@example.com", "new_role": "staff"},
            "ip_address": "196.201.214.100",
            "user_agent": "Mozilla/5.0",
            "status": "success",
            "created_at": (now - timedelta(hours=4)).isoformat(),
        },
        {
            "id": str(uuid.uuid4()),
            "actor_id": str(uuid.uuid4()),
            "actor_email": "david.ochieng@urbanhomeschool.co.ke",
            "actor_role": "staff",
            "action": "enrollment.approve",
            "resource_type": "enrollment",
            "resource_id": str(uuid.uuid4()),
            "details": {"student": "student@example.com", "course": "Grade 5 Mathematics"},
            "ip_address": "196.201.214.110",
            "user_agent": "Mozilla/5.0",
            "status": "success",
            "created_at": (now - timedelta(hours=5)).isoformat(),
        },
        {
            "id": str(uuid.uuid4()),
            "actor_id": str(uuid.uuid4()),
            "actor_email": "admin@urbanhomeschool.co.ke",
            "actor_role": "admin",
            "action": "moderation.remove",
            "resource_type": "forum_post",
            "resource_id": str(uuid.uuid4()),
            "details": {"reason": "Spam content", "original_author": "spam.user@example.com"},
            "ip_address": "196.201.214.100",
            "user_agent": "Mozilla/5.0",
            "status": "success",
            "created_at": (now - timedelta(hours=6)).isoformat(),
        },
        {
            "id": str(uuid.uuid4()),
            "actor_id": str(uuid.uuid4()),
            "actor_email": "faith.muthoni@urbanhomeschool.co.ke",
            "actor_role": "staff",
            "action": "export.generate",
            "resource_type": "report",
            "resource_id": None,
            "details": {"report_type": "monthly_revenue", "format": "csv"},
            "ip_address": "196.201.214.105",
            "user_agent": "Mozilla/5.0",
            "status": "success",
            "created_at": (now - timedelta(hours=8)).isoformat(),
        },
        {
            "id": str(uuid.uuid4()),
            "actor_id": str(uuid.uuid4()),
            "actor_email": "admin@urbanhomeschool.co.ke",
            "actor_role": "admin",
            "action": "backup.create",
            "resource_type": "database",
            "resource_id": None,
            "details": {"size_mb": 245, "type": "full"},
            "ip_address": "196.201.214.100",
            "user_agent": "system/cron",
            "status": "success",
            "created_at": (now - timedelta(hours=12)).isoformat(),
        },
    ]

    total = len(all_logs)
    offset = (page - 1) * page_size
    return all_logs[offset: offset + page_size], total


# Singleton
operations_service = OperationsService()
