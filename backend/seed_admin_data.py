"""
Seed script: Populates admin-dashboard test data.

Creates courses, support tickets (with messages), audit-log entries,
system configuration keys, and subscription plans for admin UI testing.

Usage:
    cd backend/
    python seed_admin_data.py

Prerequisites:
    - Run `python seed_users.py` first (creates the six demo users).
    - PostgreSQL + Redis must be running (docker compose -f docker-compose.dev.yml up -d).
"""

import asyncio
import sys
import os
import uuid
from datetime import datetime, timedelta
from decimal import Decimal

# Ensure the backend directory is in the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Load .env.development before importing app modules
from dotenv import load_dotenv
load_dotenv(".env.development")

# ============================================================================
# SAFETY GUARD: Prevent running seed script in production
# ============================================================================
_environment = os.getenv("ENVIRONMENT", "development").lower()
if _environment == "production":
    print("ERROR: Seed script cannot run in production environment.")
    print("Set ENVIRONMENT to 'development' or 'staging' to use this script.")
    sys.exit(1)

from sqlalchemy import text, select
from app.database import Base, init_db
from app.models import *  # noqa: F403 - Import all models so Base.metadata is populated
from app.models.user import User
from app.models.course import Course
from app.models.category import Category
from app.models.admin.audit_log import AuditLog
from app.models.admin.operations import SupportTicket, SystemConfig
from app.models.staff.ticket import StaffTicket, StaffTicketMessage
from app.models.subscription import SubscriptionPlan, BillingCycle, PlanType


# ---------------------------------------------------------------------------
# Seed data definitions
# ---------------------------------------------------------------------------

SEED_CATEGORIES = [
    {"name": "Mathematics", "slug": "mathematics", "description": "CBC Mathematics for all grade levels", "icon": "calculator", "display_order": 1},
    {"name": "English", "slug": "english", "description": "English language, reading, and writing", "icon": "book-open", "display_order": 2},
    {"name": "Kiswahili", "slug": "kiswahili", "description": "Kiswahili language and literature", "icon": "message-circle", "display_order": 3},
    {"name": "Science", "slug": "science", "description": "Integrated science and technology", "icon": "flask", "display_order": 4},
    {"name": "Social Studies", "slug": "social-studies", "description": "Social studies, citizenship, and history", "icon": "globe", "display_order": 5},
    {"name": "CRE", "slug": "cre", "description": "Christian Religious Education", "icon": "heart", "display_order": 6},
    {"name": "Art & Craft", "slug": "art-craft", "description": "Creative arts, drawing, and crafts", "icon": "palette", "display_order": 7},
    {"name": "Music", "slug": "music", "description": "Music theory, instruments, and performance", "icon": "music", "display_order": 8},
    {"name": "Physical Education", "slug": "physical-education", "description": "PE, sports, and health education", "icon": "activity", "display_order": 9},
    {"name": "ICT", "slug": "ict", "description": "Information and Communication Technology", "icon": "monitor", "display_order": 10},
    {"name": "Agriculture", "slug": "agriculture", "description": "Agriculture and environmental studies", "icon": "sprout", "display_order": 11},
    {"name": "Home Science", "slug": "home-science", "description": "Home science and life skills", "icon": "home", "display_order": 12},
]

# 12 courses: 5 published, 3 pending_review (is_published=False, published_at=None),
# 2 draft (is_published=False), 2 archived (is_published=False, stored in syllabus metadata).
# NOTE: The Course model has `is_published` (bool) but no `status` enum.
# We use `syllabus` JSONB to store {"status": "..."} for admin display.
SEED_COURSES = [
    # --- 5 PUBLISHED ---
    {
        "title": "CBC Mathematics Grade 4-5",
        "description": "Master number operations, fractions, geometry, and measurement aligned to Kenya's CBC for Grade 4 and 5 learners. Includes interactive exercises and AI-graded quizzes.",
        "grade_levels": ["Grade 4", "Grade 5"],
        "learning_area": "Mathematics",
        "price": Decimal("1500.00"),
        "is_published": True,
        "is_featured": True,
        "enrollment_count": 87,
        "average_rating": Decimal("4.60"),
        "total_reviews": 23,
        "estimated_duration_hours": 60,
        "syllabus": {"status": "published", "modules": 8, "lessons": 48},
        "lessons": [{"id": "L1", "title": "Place Value"}, {"id": "L2", "title": "Addition & Subtraction"}],
        "competencies": ["numeracy", "critical-thinking"],
    },
    {
        "title": "English Language Arts Grade 3",
        "description": "Build reading comprehension, creative writing, and grammar skills through story-based lessons for CBC Grade 3.",
        "grade_levels": ["Grade 3"],
        "learning_area": "English",
        "price": Decimal("1200.00"),
        "is_published": True,
        "is_featured": False,
        "enrollment_count": 64,
        "average_rating": Decimal("4.30"),
        "total_reviews": 15,
        "estimated_duration_hours": 48,
        "syllabus": {"status": "published", "modules": 6, "lessons": 36},
        "lessons": [{"id": "L1", "title": "Phonics Revision"}, {"id": "L2", "title": "Story Comprehension"}],
        "competencies": ["literacy", "communication"],
    },
    {
        "title": "Kiswahili Sanifu Grade 6",
        "description": "Sarufi, ufahamu, insha, na fasihi kwa wanafunzi wa Darasa la 6 kulingana na CBC.",
        "grade_levels": ["Grade 6"],
        "learning_area": "Kiswahili",
        "price": Decimal("1000.00"),
        "is_published": True,
        "is_featured": False,
        "enrollment_count": 42,
        "average_rating": Decimal("4.10"),
        "total_reviews": 9,
        "estimated_duration_hours": 40,
        "syllabus": {"status": "published", "modules": 5, "lessons": 30},
        "lessons": [{"id": "L1", "title": "Sarufi ya Msingi"}, {"id": "L2", "title": "Ufahamu"}],
        "competencies": ["literacy", "cultural-identity"],
    },
    {
        "title": "Integrated Science Grade 7",
        "description": "Explore matter, energy, living things, and the environment through hands-on virtual labs for junior secondary learners.",
        "grade_levels": ["Grade 7"],
        "learning_area": "Science",
        "price": Decimal("2000.00"),
        "is_published": True,
        "is_featured": True,
        "enrollment_count": 55,
        "average_rating": Decimal("4.70"),
        "total_reviews": 18,
        "estimated_duration_hours": 72,
        "syllabus": {"status": "published", "modules": 10, "lessons": 60},
        "lessons": [{"id": "L1", "title": "States of Matter"}, {"id": "L2", "title": "Photosynthesis"}],
        "competencies": ["scientific-inquiry", "critical-thinking"],
    },
    {
        "title": "Social Studies & Citizenship Grade 5",
        "description": "Learn about Kenya's counties, governance, history, and responsible citizenship for CBC Grade 5.",
        "grade_levels": ["Grade 5"],
        "learning_area": "Social Studies",
        "price": Decimal("800.00"),
        "is_published": True,
        "is_featured": False,
        "enrollment_count": 38,
        "average_rating": Decimal("4.00"),
        "total_reviews": 7,
        "estimated_duration_hours": 36,
        "syllabus": {"status": "published", "modules": 5, "lessons": 30},
        "lessons": [{"id": "L1", "title": "Our County"}, {"id": "L2", "title": "Kenya's History"}],
        "competencies": ["citizenship", "social-skills"],
    },
    # --- 3 PENDING REVIEW ---
    {
        "title": "CRE: Christian Living Grade 4",
        "description": "Bible stories, moral values, and Christian ethics curriculum for Grade 4 learners aligned with CBC.",
        "grade_levels": ["Grade 4"],
        "learning_area": "CRE",
        "price": Decimal("700.00"),
        "is_published": False,
        "is_featured": False,
        "enrollment_count": 0,
        "average_rating": Decimal("0.00"),
        "total_reviews": 0,
        "estimated_duration_hours": 30,
        "syllabus": {"status": "pending_review", "modules": 4, "lessons": 24},
        "lessons": [{"id": "L1", "title": "Creation Story"}, {"id": "L2", "title": "Ten Commandments"}],
        "competencies": ["moral-values", "spiritual-growth"],
    },
    {
        "title": "Art & Craft Exploration Grade 2-3",
        "description": "Unleash creativity with drawing, painting, paper crafts, and clay modelling activities for lower primary.",
        "grade_levels": ["Grade 2", "Grade 3"],
        "learning_area": "Art & Craft",
        "price": Decimal("500.00"),
        "is_published": False,
        "is_featured": False,
        "enrollment_count": 0,
        "average_rating": Decimal("0.00"),
        "total_reviews": 0,
        "estimated_duration_hours": 24,
        "syllabus": {"status": "pending_review", "modules": 4, "lessons": 20},
        "lessons": [{"id": "L1", "title": "Colour Theory"}, {"id": "L2", "title": "Paper Crafts"}],
        "competencies": ["creativity", "fine-motor-skills"],
    },
    {
        "title": "Music Fundamentals Grade 5-6",
        "description": "Rhythm, melody, African instruments, and song composition for upper primary learners.",
        "grade_levels": ["Grade 5", "Grade 6"],
        "learning_area": "Music",
        "price": Decimal("600.00"),
        "is_published": False,
        "is_featured": False,
        "enrollment_count": 0,
        "average_rating": Decimal("0.00"),
        "total_reviews": 0,
        "estimated_duration_hours": 28,
        "syllabus": {"status": "pending_review", "modules": 4, "lessons": 22},
        "lessons": [{"id": "L1", "title": "Beat & Rhythm"}, {"id": "L2", "title": "Kenyan Folk Songs"}],
        "competencies": ["creativity", "cultural-identity"],
    },
    # --- 2 DRAFT ---
    {
        "title": "PE & Health Education Grade 1-2",
        "description": "Movement games, body awareness, nutrition basics, and hygiene for early years learners.",
        "grade_levels": ["Grade 1", "Grade 2"],
        "learning_area": "Physical Education",
        "price": Decimal("0.00"),
        "is_published": False,
        "is_featured": False,
        "enrollment_count": 0,
        "average_rating": Decimal("0.00"),
        "total_reviews": 0,
        "estimated_duration_hours": 20,
        "syllabus": {"status": "draft", "modules": 3, "lessons": 12},
        "lessons": [],
        "competencies": ["health-awareness", "motor-skills"],
    },
    {
        "title": "ICT & Digital Literacy Grade 6-7",
        "description": "Computer basics, internet safety, coding with Scratch, and digital citizenship for upper primary and junior secondary.",
        "grade_levels": ["Grade 6", "Grade 7"],
        "learning_area": "ICT",
        "price": Decimal("1800.00"),
        "is_published": False,
        "is_featured": False,
        "enrollment_count": 0,
        "average_rating": Decimal("0.00"),
        "total_reviews": 0,
        "estimated_duration_hours": 50,
        "syllabus": {"status": "draft", "modules": 6, "lessons": 0},
        "lessons": [],
        "competencies": ["digital-literacy", "problem-solving"],
    },
    # --- 2 ARCHIVED ---
    {
        "title": "Agriculture & Environment Grade 4 (2024)",
        "description": "Soil types, crop farming, livestock, and conservation — archived after 2024 curriculum revision.",
        "grade_levels": ["Grade 4"],
        "learning_area": "Agriculture",
        "price": Decimal("900.00"),
        "is_published": False,
        "is_featured": False,
        "enrollment_count": 31,
        "average_rating": Decimal("3.80"),
        "total_reviews": 6,
        "estimated_duration_hours": 32,
        "syllabus": {"status": "archived", "archived_reason": "2024 curriculum revision", "modules": 5, "lessons": 28},
        "lessons": [{"id": "L1", "title": "Soil Types"}, {"id": "L2", "title": "Crop Farming"}],
        "competencies": ["environmental-awareness", "practical-skills"],
    },
    {
        "title": "Home Science Basics Grade 3 (2024)",
        "description": "Nutrition, cooking safety, sewing, and household management — archived after syllabus restructure.",
        "grade_levels": ["Grade 3"],
        "learning_area": "Home Science",
        "price": Decimal("750.00"),
        "is_published": False,
        "is_featured": False,
        "enrollment_count": 19,
        "average_rating": Decimal("3.50"),
        "total_reviews": 4,
        "estimated_duration_hours": 26,
        "syllabus": {"status": "archived", "archived_reason": "Syllabus restructure", "modules": 4, "lessons": 20},
        "lessons": [{"id": "L1", "title": "Food Groups"}, {"id": "L2", "title": "Kitchen Safety"}],
        "competencies": ["life-skills", "health-awareness"],
    },
]


# 8 support tickets with 2-4 messages each.
# Uses the admin SupportTicket model (admin/operations.py) for the tickets.
# Ticket messages use StaffTicketMessage (staff/ticket.py) via parallel StaffTicket records,
# since the admin SupportTicket model has no message child table.
# We therefore seed into StaffTicket + StaffTicketMessage for the conversation data.

SEED_SUPPORT_TICKETS = [
    {
        "ticket_number": "TKT-2026-0001",
        "subject": "Cannot access Mathematics course after payment",
        "description": "I paid KES 1,500 via M-Pesa for the Grade 4-5 Mathematics course but it still shows as locked. Transaction ID: QKJ3H7RM2X.",
        "category": "billing",
        "priority": "high",
        "status": "open",
        "messages": [
            {"content": "I paid KES 1,500 via M-Pesa for the Grade 4-5 Mathematics course but it still shows as locked. Transaction ID: QKJ3H7RM2X.", "is_internal": False, "role": "reporter"},
            {"content": "Thank you for reaching out. Let me verify your M-Pesa transaction.", "is_internal": False, "role": "staff"},
            {"content": "Internal note: Checked M-Pesa API — payment confirmed, enrollment sync failed. Triggering manual enrollment.", "is_internal": True, "role": "staff"},
        ],
    },
    {
        "ticket_number": "TKT-2026-0002",
        "subject": "AI Tutor giving incorrect answers in Science",
        "description": "The AI tutor told my child that the sun revolves around the earth during the Grade 7 Science lesson on the solar system.",
        "category": "ai_quality",
        "priority": "critical",
        "status": "in_progress",
        "messages": [
            {"content": "The AI tutor told my child that the sun revolves around the earth during the Grade 7 Science lesson on the solar system.", "is_internal": False, "role": "reporter"},
            {"content": "This is concerning. We are escalating to the AI quality team immediately.", "is_internal": False, "role": "staff"},
            {"content": "AI team confirmed: The response was a hallucination triggered by ambiguous prompt phrasing. Hotfix deployed to guardrails.", "is_internal": True, "role": "staff"},
            {"content": "We have fixed the issue. The AI tutor now correctly teaches that the Earth revolves around the Sun. Thank you for reporting this.", "is_internal": False, "role": "staff"},
        ],
    },
    {
        "ticket_number": "TKT-2026-0003",
        "subject": "Request to reset child's password",
        "description": "My daughter Amina forgot her password and I cannot reset it from my parent dashboard.",
        "category": "account",
        "priority": "medium",
        "status": "resolved",
        "messages": [
            {"content": "My daughter Amina forgot her password and I cannot reset it from my parent dashboard.", "is_internal": False, "role": "reporter"},
            {"content": "I have sent a password reset link to the email on file. Please check amina@example.com.", "is_internal": False, "role": "staff"},
        ],
    },
    {
        "ticket_number": "TKT-2026-0004",
        "subject": "Certificate not generated after completing course",
        "description": "I completed the English Language Arts Grade 3 course last week but my certificate has not appeared in my dashboard.",
        "category": "certificates",
        "priority": "medium",
        "status": "resolved",
        "messages": [
            {"content": "I completed the English Language Arts Grade 3 course last week but my certificate has not appeared in my dashboard.", "is_internal": False, "role": "reporter"},
            {"content": "Checking your enrollment record now.", "is_internal": False, "role": "staff"},
            {"content": "Internal: Enrollment shows 100% progress but is_completed flag was not set. Running fix script.", "is_internal": True, "role": "staff"},
            {"content": "Your certificate has been generated and is now available in your dashboard. Sorry for the delay!", "is_internal": False, "role": "staff"},
        ],
    },
    {
        "ticket_number": "TKT-2026-0005",
        "subject": "Slow loading on mobile phone",
        "description": "The platform takes over 30 seconds to load on my Tecno Spark phone using Safaricom 4G.",
        "category": "performance",
        "priority": "low",
        "status": "open",
        "messages": [
            {"content": "The platform takes over 30 seconds to load on my Tecno Spark phone using Safaricom 4G.", "is_internal": False, "role": "reporter"},
            {"content": "Thank you for the report. Could you share your browser name and version?", "is_internal": False, "role": "staff"},
        ],
    },
    {
        "ticket_number": "TKT-2026-0006",
        "subject": "M-Pesa double charge on subscription renewal",
        "description": "I was charged twice (KES 999 x2) for my Standard subscription renewal on 2026-02-01.",
        "category": "billing",
        "priority": "high",
        "status": "in_progress",
        "messages": [
            {"content": "I was charged twice (KES 999 x2) for my Standard subscription renewal on 2026-02-01.", "is_internal": False, "role": "reporter"},
            {"content": "I can see two transactions on your account. Initiating a refund for the duplicate charge.", "is_internal": False, "role": "staff"},
            {"content": "Refund request REF-20260203-001 submitted to M-Pesa B2C queue.", "is_internal": True, "role": "staff"},
        ],
    },
    {
        "ticket_number": "TKT-2026-0007",
        "subject": "Cannot upload profile picture",
        "description": "When I try to upload a profile picture from my gallery it says 'File too large' even though it is only 2 MB.",
        "category": "account",
        "priority": "low",
        "status": "closed",
        "messages": [
            {"content": "When I try to upload a profile picture from my gallery it says 'File too large' even though it is only 2 MB.", "is_internal": False, "role": "reporter"},
            {"content": "The current upload limit is 1 MB. We will increase it to 5 MB in the next release. In the meantime, please compress the image.", "is_internal": False, "role": "staff"},
        ],
    },
    {
        "ticket_number": "TKT-2026-0008",
        "subject": "Requesting Kiswahili course for Grade 7",
        "description": "Is there a Kiswahili course for Grade 7? My son will be joining junior secondary next term.",
        "category": "feature_request",
        "priority": "low",
        "status": "closed",
        "messages": [
            {"content": "Is there a Kiswahili course for Grade 7? My son will be joining junior secondary next term.", "is_internal": False, "role": "reporter"},
            {"content": "Great suggestion! We are currently developing Kiswahili for Grade 7. It should be available by April 2026.", "is_internal": False, "role": "staff"},
            {"content": "Linked to roadmap item ROAD-KSW-G7. ETA: April 2026.", "is_internal": True, "role": "staff"},
        ],
    },
]


# 10 Audit-log entries
SEED_AUDIT_LOGS = [
    {
        "action": "user.login",
        "resource_type": "user",
        "details": {"method": "email_password", "ip": "41.90.200.12"},
        "ip_address": "41.90.200.12",
        "user_agent": "Mozilla/5.0 (Linux; Android 13; Tecno SPARK 10 Pro) AppleWebKit/537.36",
        "status": "success",
    },
    {
        "action": "user.role_change",
        "resource_type": "user",
        "details": {"previous_role": "student", "new_role": "instructor", "reason": "Application approved"},
        "ip_address": "41.90.200.12",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        "status": "success",
    },
    {
        "action": "course.approved",
        "resource_type": "course",
        "details": {"course_title": "CRE: Christian Living Grade 4", "reviewer_notes": "Content verified against CBC standards"},
        "ip_address": "41.90.200.12",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        "status": "success",
    },
    {
        "action": "payment.processed",
        "resource_type": "payment",
        "details": {"amount": 1500, "currency": "KES", "method": "mpesa", "transaction_ref": "QKJ3H7RM2X"},
        "ip_address": "196.201.214.100",
        "user_agent": "M-Pesa Callback/1.0",
        "status": "success",
    },
    {
        "action": "settings.updated",
        "resource_type": "system_config",
        "details": {"key": "maintenance_mode", "old_value": False, "new_value": True, "reason": "Scheduled database migration"},
        "ip_address": "41.90.200.12",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        "status": "success",
    },
    {
        "action": "user.deactivated",
        "resource_type": "user",
        "details": {"reason": "Violation of terms of service", "user_email": "badactor@example.com"},
        "ip_address": "41.90.200.12",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        "status": "success",
    },
    {
        "action": "subscription.created",
        "resource_type": "subscription",
        "details": {"plan": "Standard", "billing_cycle": "monthly", "amount": 999},
        "ip_address": "41.90.200.12",
        "user_agent": "Mozilla/5.0 (Linux; Android 13; Samsung Galaxy S23)",
        "status": "success",
    },
    {
        "action": "course.deleted",
        "resource_type": "course",
        "details": {"course_title": "Agriculture & Environment Grade 4 (2024)", "reason": "Archived after curriculum revision"},
        "ip_address": "41.90.200.12",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        "status": "success",
    },
    {
        "action": "ai_provider.config_changed",
        "resource_type": "ai_provider",
        "details": {"provider": "gemini-pro", "change": "Updated API key", "masked_key": "AIza...Xk9Q"},
        "ip_address": "41.90.200.12",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        "status": "success",
    },
    {
        "action": "export.generated",
        "resource_type": "report",
        "details": {"report_type": "monthly_revenue", "period": "2026-01", "format": "csv", "rows": 1847},
        "ip_address": "41.90.200.12",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        "status": "success",
    },
]


# 5 System configuration entries
SEED_SYSTEM_CONFIGS = [
    {
        "key": "max_file_upload_size",
        "value": {"bytes": 5242880, "display": "5 MB"},
        "description": "Maximum file upload size for user-submitted content (profile pictures, assignments, etc.).",
        "category": "storage",
        "editable": True,
    },
    {
        "key": "maintenance_mode",
        "value": {"enabled": False, "message": "Platform is under scheduled maintenance. We will be back shortly."},
        "description": "Toggle platform-wide maintenance mode. When enabled, all users see the maintenance message.",
        "category": "operations",
        "editable": True,
    },
    {
        "key": "default_language",
        "value": {"code": "en", "name": "English", "supported": ["en", "sw"]},
        "description": "Default platform language and list of supported locale codes.",
        "category": "i18n",
        "editable": True,
    },
    {
        "key": "ai_model_provider",
        "value": {"primary": "gemini-pro", "fallback": "gpt-4", "creative": "claude-3.5-sonnet", "voice": "elevenlabs"},
        "description": "AI model routing configuration for the multi-AI orchestrator.",
        "category": "ai",
        "editable": True,
    },
    {
        "key": "session_timeout",
        "value": {"minutes": 30, "remember_me_days": 30, "refresh_token_hours": 168},
        "description": "Session and token expiration settings for user authentication.",
        "category": "security",
        "editable": True,
    },
]


# 3 Subscription plans
SEED_SUBSCRIPTION_PLANS = [
    {
        "name": "Free Tier",
        "description": "Access 3 free courses with limited AI tutor interactions. Perfect for trying out the platform.",
        "plan_type": PlanType.PLATFORM_ACCESS,
        "billing_cycle": BillingCycle.MONTHLY,
        "price": Decimal("0.00"),
        "currency": "KES",
        "trial_days": 0,
        "features": [
            "Access up to 3 free courses",
            "5 AI tutor questions per day",
            "Community forum access",
            "Basic progress tracking",
        ],
        "max_enrollments": 3,
        "is_active": True,
        "is_popular": False,
        "display_order": 1,
    },
    {
        "name": "Standard",
        "description": "Unlimited course access with full AI tutor support. Ideal for active learners.",
        "plan_type": PlanType.PLATFORM_ACCESS,
        "billing_cycle": BillingCycle.MONTHLY,
        "price": Decimal("999.00"),
        "currency": "KES",
        "trial_days": 7,
        "features": [
            "Unlimited course access",
            "Unlimited AI tutor interactions",
            "Progress reports for parents",
            "Downloadable certificates",
            "Priority email support",
        ],
        "max_enrollments": -1,
        "is_active": True,
        "is_popular": True,
        "display_order": 2,
    },
    {
        "name": "Premium",
        "description": "Everything in Standard plus live tutoring sessions, voice AI, and family dashboard for up to 5 children.",
        "plan_type": PlanType.PREMIUM_FEATURES,
        "billing_cycle": BillingCycle.MONTHLY,
        "price": Decimal("2499.00"),
        "currency": "KES",
        "trial_days": 14,
        "features": [
            "Everything in Standard",
            "Live 1-on-1 tutoring (4 sessions/month)",
            "AI voice tutor (ElevenLabs)",
            "Family dashboard for up to 5 children",
            "Advanced analytics & insights",
            "Dedicated support agent",
            "Early access to new courses",
        ],
        "max_enrollments": -1,
        "is_active": True,
        "is_popular": False,
        "display_order": 3,
    },
]


# ---------------------------------------------------------------------------
# Main seeding logic
# ---------------------------------------------------------------------------

async def main():
    print("=" * 65)
    print("  Urban Home School - Admin Dashboard Data Seeding")
    print("=" * 65)

    # Initialize database connection
    print("\n1. Initializing database connection...")
    await init_db()

    from app.database import engine, AsyncSessionLocal

    # Ensure tables exist
    print("\n2. Ensuring database tables exist...")
    async with engine.begin() as conn:
        await conn.execute(text('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"'))
        await conn.execute(text('CREATE EXTENSION IF NOT EXISTS "pgcrypto"'))
        await conn.run_sync(Base.metadata.create_all)
    print("   Tables verified.")

    async with AsyncSessionLocal() as session:

        # -----------------------------------------------------------------
        # Look up the admin and other seed users
        # -----------------------------------------------------------------
        print("\n3. Looking up seed users...")
        admin_result = await session.execute(
            select(User).where(User.email == "admin@urbanhomeschool.co.ke")
        )
        admin_user = admin_result.scalars().first()
        if not admin_user:
            print("  [ERROR] Admin user not found. Run `python seed_users.py` first.")
            await engine.dispose()
            sys.exit(1)
        print(f"   Admin user found: {admin_user.email} (id={admin_user.id})")

        student_result = await session.execute(
            select(User).where(User.email == "student@urbanhomeschool.co.ke")
        )
        student_user = student_result.scalars().first()

        parent_result = await session.execute(
            select(User).where(User.email == "parent@urbanhomeschool.co.ke")
        )
        parent_user = parent_result.scalars().first()

        instructor_result = await session.execute(
            select(User).where(User.email == "instructor@urbanhomeschool.co.ke")
        )
        instructor_user = instructor_result.scalars().first()

        staff_result = await session.execute(
            select(User).where(User.email == "staff@urbanhomeschool.co.ke")
        )
        staff_user = staff_result.scalars().first()

        # Use admin as fallback if any user is missing
        reporter_users = [u for u in [student_user, parent_user] if u]
        if not reporter_users:
            reporter_users = [admin_user]

        staff_agent = staff_user or admin_user

        # -----------------------------------------------------------------
        # 3a. Seed categories (needed for courses)
        # -----------------------------------------------------------------
        print("\n4. Seeding categories...")
        category_count = 0
        for cat_data in SEED_CATEGORIES:
            result = await session.execute(
                select(Category).where(Category.slug == cat_data["slug"])
            )
            existing = result.scalars().first()
            if existing:
                print(f"   [SKIP] Category: {cat_data['name']} (already exists)")
                continue

            new_cat = Category(
                name=cat_data["name"],
                slug=cat_data["slug"],
                description=cat_data["description"],
                icon=cat_data["icon"],
                display_order=cat_data["display_order"],
                is_active=True,
                course_count=0,
            )
            session.add(new_cat)
            category_count += 1
            print(f"   [NEW]  Category: {cat_data['name']}")

        await session.flush()
        print(f"   Seeded {category_count} new categories.")

        # -----------------------------------------------------------------
        # 4. Seed 12 courses
        # -----------------------------------------------------------------
        print("\n5. Seeding courses (12 total)...")
        course_count = 0
        for course_data in SEED_COURSES:
            result = await session.execute(
                select(Course).where(Course.title == course_data["title"])
            )
            existing = result.scalars().first()
            if existing:
                print(f"   [SKIP] Course: {course_data['title'][:50]}... (already exists)")
                continue

            # Use instructor for published courses, admin for others
            creator = instructor_user if (course_data["is_published"] and instructor_user) else admin_user

            new_course = Course(
                title=course_data["title"],
                description=course_data["description"],
                grade_levels=course_data["grade_levels"],
                learning_area=course_data["learning_area"],
                syllabus=course_data["syllabus"],
                lessons=course_data["lessons"],
                instructor_id=creator.id,
                is_platform_created=(creator.id == admin_user.id),
                price=course_data["price"],
                currency="KES",
                is_published=course_data["is_published"],
                is_featured=course_data["is_featured"],
                enrollment_count=course_data["enrollment_count"],
                average_rating=course_data["average_rating"],
                total_reviews=course_data["total_reviews"],
                estimated_duration_hours=course_data["estimated_duration_hours"],
                competencies=course_data["competencies"],
                published_at=datetime.utcnow() - timedelta(days=30) if course_data["is_published"] else None,
            )
            session.add(new_course)
            course_count += 1
            status_label = course_data["syllabus"].get("status", "unknown")
            print(f"   [NEW]  Course: {course_data['title'][:50]:50s} | {status_label}")

        await session.flush()
        print(f"   Seeded {course_count} new courses.")

        # -----------------------------------------------------------------
        # 5. Seed 8 support tickets with messages
        # -----------------------------------------------------------------
        # NOTE: The admin SupportTicket model (admin/operations.py) has no
        # child message table. We seed into BOTH:
        #   - SupportTicket  (for the admin dashboard ticket list)
        #   - StaffTicket + StaffTicketMessage (for the conversation thread)
        # -----------------------------------------------------------------
        print("\n6. Seeding support tickets (8 total with messages)...")
        ticket_count = 0
        message_count = 0

        for idx, ticket_data in enumerate(SEED_SUPPORT_TICKETS):
            # Check if admin SupportTicket already exists
            result = await session.execute(
                select(SupportTicket).where(SupportTicket.ticket_number == ticket_data["ticket_number"])
            )
            existing_support = result.scalars().first()

            # Check if StaffTicket already exists
            result = await session.execute(
                select(StaffTicket).where(StaffTicket.ticket_number == ticket_data["ticket_number"])
            )
            existing_staff = result.scalars().first()

            if existing_support and existing_staff:
                print(f"   [SKIP] Ticket: {ticket_data['ticket_number']} (already exists)")
                continue

            # Rotate reporters among student and parent users
            reporter = reporter_users[idx % len(reporter_users)]

            sla_hours = {"critical": 2, "high": 8, "medium": 24, "low": 72}
            sla_deadline = datetime.utcnow() + timedelta(hours=sla_hours.get(ticket_data["priority"], 24))
            resolved_at = datetime.utcnow() - timedelta(hours=3) if ticket_data["status"] in ("resolved", "closed") else None

            # Seed admin SupportTicket
            if not existing_support:
                support_ticket = SupportTicket(
                    ticket_number=ticket_data["ticket_number"],
                    subject=ticket_data["subject"],
                    description=ticket_data["description"],
                    category=ticket_data["category"],
                    priority=ticket_data["priority"],
                    status=ticket_data["status"],
                    reporter_id=reporter.id,
                    assigned_to=staff_agent.id,
                    sla_deadline=sla_deadline,
                    resolved_at=resolved_at,
                )
                session.add(support_ticket)

            # Seed StaffTicket + messages
            if not existing_staff:
                staff_ticket = StaffTicket(
                    ticket_number=ticket_data["ticket_number"],
                    subject=ticket_data["subject"],
                    description=ticket_data["description"],
                    category=ticket_data["category"],
                    priority=ticket_data["priority"],
                    status=ticket_data["status"],
                    reporter_id=reporter.id,
                    assigned_to=staff_agent.id,
                    sla_deadline=sla_deadline,
                    resolved_at=resolved_at,
                    closed_at=datetime.utcnow() - timedelta(hours=1) if ticket_data["status"] == "closed" else None,
                )
                session.add(staff_ticket)
                await session.flush()  # get staff_ticket.id

                # Add messages
                for msg_idx, msg_data in enumerate(ticket_data["messages"]):
                    author = reporter if msg_data["role"] == "reporter" else staff_agent
                    msg = StaffTicketMessage(
                        ticket_id=staff_ticket.id,
                        author_id=author.id,
                        content=msg_data["content"],
                        is_internal=msg_data["is_internal"],
                        created_at=datetime.utcnow() - timedelta(hours=(len(ticket_data["messages"]) - msg_idx)),
                    )
                    session.add(msg)
                    message_count += 1

            ticket_count += 1
            print(f"   [NEW]  Ticket: {ticket_data['ticket_number']} | {ticket_data['priority']:8s} | {ticket_data['status']}")

        await session.flush()
        print(f"   Seeded {ticket_count} tickets with {message_count} messages.")

        # -----------------------------------------------------------------
        # 6. Seed 10 audit-log entries
        # -----------------------------------------------------------------
        print("\n7. Seeding audit-log entries (10 total)...")
        # Check if any admin audit logs already exist for this actor
        result = await session.execute(
            select(AuditLog).where(AuditLog.actor_id == admin_user.id).limit(1)
        )
        existing_logs = result.scalars().first()

        if existing_logs:
            print("   [SKIP] Audit logs for admin user already exist.")
            audit_count = 0
        else:
            audit_count = 0
            for idx, log_data in enumerate(SEED_AUDIT_LOGS):
                new_log = AuditLog(
                    actor_id=admin_user.id,
                    actor_email=admin_user.email,
                    actor_role="admin",
                    action=log_data["action"],
                    resource_type=log_data["resource_type"],
                    resource_id=None,
                    details=log_data["details"],
                    ip_address=log_data["ip_address"],
                    user_agent=log_data["user_agent"],
                    status=log_data["status"],
                    created_at=datetime.utcnow() - timedelta(days=10 - idx, hours=idx * 2),
                )
                session.add(new_log)
                audit_count += 1
                print(f"   [NEW]  AuditLog: {log_data['action']:30s} | {log_data['resource_type']}")

            await session.flush()
        print(f"   Seeded {audit_count} audit-log entries.")

        # -----------------------------------------------------------------
        # 7. Seed 5 system-config entries
        # -----------------------------------------------------------------
        print("\n8. Seeding system configuration entries (5 total)...")
        config_count = 0
        for cfg_data in SEED_SYSTEM_CONFIGS:
            result = await session.execute(
                select(SystemConfig).where(SystemConfig.key == cfg_data["key"])
            )
            existing = result.scalars().first()
            if existing:
                print(f"   [SKIP] Config: {cfg_data['key']} (already exists)")
                continue

            new_cfg = SystemConfig(
                key=cfg_data["key"],
                value=cfg_data["value"],
                description=cfg_data["description"],
                category=cfg_data["category"],
                editable=cfg_data["editable"],
                last_modified_by=admin_user.id,
            )
            session.add(new_cfg)
            config_count += 1
            print(f"   [NEW]  Config: {cfg_data['key']}")

        await session.flush()
        print(f"   Seeded {config_count} system-config entries.")

        # -----------------------------------------------------------------
        # 8. Seed 3 subscription plans
        # -----------------------------------------------------------------
        print("\n9. Seeding subscription plans (3 total)...")
        plan_count = 0
        for plan_data in SEED_SUBSCRIPTION_PLANS:
            result = await session.execute(
                select(SubscriptionPlan).where(SubscriptionPlan.name == plan_data["name"])
            )
            existing = result.scalars().first()
            if existing:
                print(f"   [SKIP] Plan: {plan_data['name']} (already exists)")
                continue

            new_plan = SubscriptionPlan(
                name=plan_data["name"],
                description=plan_data["description"],
                plan_type=plan_data["plan_type"],
                billing_cycle=plan_data["billing_cycle"],
                price=plan_data["price"],
                currency=plan_data["currency"],
                trial_days=plan_data["trial_days"],
                features=plan_data["features"],
                course_ids=[],
                max_enrollments=plan_data["max_enrollments"],
                is_active=plan_data["is_active"],
                is_popular=plan_data["is_popular"],
                display_order=plan_data["display_order"],
                meta={},
            )
            session.add(new_plan)
            plan_count += 1
            price_display = f"KES {plan_data['price']:,.2f}/mo" if plan_data["price"] > 0 else "Free"
            print(f"   [NEW]  Plan: {plan_data['name']:20s} | {price_display}")

        await session.flush()
        print(f"   Seeded {plan_count} subscription plans.")

        # -----------------------------------------------------------------
        # Commit all changes
        # -----------------------------------------------------------------
        await session.commit()

    # Summary
    print("\n" + "=" * 65)
    print("  SEED SUMMARY")
    print("=" * 65)
    print(f"  Categories:          {len(SEED_CATEGORIES)} defined ({category_count} new)")
    print(f"  Courses:             {len(SEED_COURSES)} defined ({course_count} new)")
    print(f"    - Published:       5")
    print(f"    - Pending review:  3")
    print(f"    - Draft:           2")
    print(f"    - Archived:        2")
    print(f"  Support tickets:     {len(SEED_SUPPORT_TICKETS)} defined ({ticket_count} new)")
    print(f"    - Messages:        {message_count} new")
    print(f"  Audit-log entries:   {len(SEED_AUDIT_LOGS)} defined ({audit_count} new)")
    print(f"  System configs:      {len(SEED_SYSTEM_CONFIGS)} defined ({config_count} new)")
    print(f"  Subscription plans:  {len(SEED_SUBSCRIPTION_PLANS)} defined ({plan_count} new)")
    print()
    print("  NOTE: Course 'status' is stored in syllabus JSONB (draft,")
    print("  pending_review, published, archived) since the Course model")
    print("  uses a boolean is_published field rather than a status enum.")
    print()
    print("  NOTE: Support ticket messages are seeded into StaffTicket +")
    print("  StaffTicketMessage tables. The admin SupportTicket model does")
    print("  not have a child message table.")
    print("=" * 65)

    # Cleanup
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
