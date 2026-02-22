"""
Comprehensive Seed Script for Urban Home School Platform.

Creates a fully populated development database with:
- 50+ users across all 6 roles (admin, staff, instructor, parent, student, partner)
- 6 AI provider configurations (Gemini, Claude, GPT-4, Grok, ElevenLabs, Synthesia)
- 15 CBC-aligned sample courses
- Sample notifications for every user
- Student records with AI tutors
- 5 subscription plans (Free, Basic, Premium, Annual Premium, Sponsorship)
- Parent subscriptions with M-Pesa payment methods
- Wallets for all users with role-appropriate balances
- Payment transactions tied to subscriptions
- Student enrollments in courses with progress tracking
- Assessments and student submissions with grades
- Credential table printed at the end

Usage:
    cd backend/
    python seed_comprehensive.py

Or inside Docker:
    docker exec tuhs_backend python seed_comprehensive.py
"""

import asyncio
import sys
import os
import uuid
import random
from datetime import datetime, timedelta, date
from decimal import Decimal

# Ensure the backend directory is in the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Load .env.development before importing app modules
from dotenv import load_dotenv
load_dotenv(".env.development")

from sqlalchemy import text, select, func
from app.database import Base, init_db
from app.models import *  # noqa: F403 - Import all models so Base.metadata is populated
from app.models.user import User
from app.models.student import Student
from app.models.ai_tutor import AITutor
from app.models.ai_provider import AIProvider
from app.models.course import Course
from app.models.notification import Notification, NotificationType
from app.models.subscription import SubscriptionPlan, Subscription, BillingCycle, PlanType, SubscriptionStatus
from app.models.payment import Transaction, Wallet, PaymentMethod
from app.models.enrollment import Enrollment, EnrollmentStatus
from app.models.assessment import Assessment, AssessmentSubmission
from app.utils.security import get_password_hash


# ---------------------------------------------------------------------------
# Kenyan name pools for realistic data
# ---------------------------------------------------------------------------
FIRST_NAMES_MALE = [
    "Brian", "Kevin", "Dennis", "Collins", "James", "Daniel", "Peter",
    "Samuel", "Joseph", "Michael", "David", "Stephen", "George", "Patrick",
    "Felix", "Victor", "Eric", "Moses", "Martin", "Isaac", "Kelvin",
    "Emmanuel", "Erick", "Kennedy", "Benard", "Caleb", "Allan", "Timothy",
    "Robert", "Charles",
]

FIRST_NAMES_FEMALE = [
    "Faith", "Grace", "Mercy", "Joy", "Esther", "Lucy", "Catherine",
    "Caroline", "Janet", "Lydia", "Beatrice", "Diana", "Susan", "Alice",
    "Sharon", "Naomi", "Winnie", "Dorothy", "Eunice", "Agnes", "Lillian",
    "Purity", "Cynthia", "Irene", "Rachel", "Margaret", "Gladys", "Sheila",
    "Marion", "Brenda",
]

LAST_NAMES = [
    "Odhiambo", "Kamau", "Mwangi", "Wanjiku", "Ochieng", "Njoroge",
    "Kipchoge", "Korir", "Mutua", "Wambui", "Chebet", "Rotich",
    "Otieno", "Nyambura", "Kiptoo", "Akinyi", "Karanja", "Kimani",
    "Onyango", "Ndungu", "Muturi", "Githinji", "Muthoni", "Ogola",
    "Kiprotich", "Wafula", "Njenga", "Maina", "Okello", "Barasa",
    "Juma", "Chege", "Ouma", "Kariuki", "Mugo", "Mburu", "Atieno",
    "Makori", "Ng'ang'a", "Kinyanjui",
]

KENYAN_SCHOOLS = [
    "Starehe Boys Centre", "Kenya High School", "Alliance High School",
    "Moi Girls Isinya", "Pangani Girls", "Mangu High School",
    "Maranda High School", "Maseno School", "Loreto Convent Msongari",
    "Precious Blood Riruta",
]

LEARNING_AREAS = [
    "Mathematics", "English", "Kiswahili", "Science and Technology",
    "Social Studies", "Creative Arts", "Religious Education",
    "Health Education", "Agriculture", "Home Science",
    "Physical Education", "Music", "Art and Craft",
    "Computer Science", "Life Skills",
]

GRADE_LEVELS = [
    "ECD 1", "ECD 2", "Grade 1", "Grade 2", "Grade 3", "Grade 4",
    "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9",
]

LEARNING_STYLES = ["visual", "auditory", "kinesthetic", "reading_writing"]

TUTOR_NAMES = [
    "Birdy", "Einstein", "Nyota", "Simba", "Safari", "Twiga",
    "Kanga", "Ndovu", "Duma", "Malaika",
]

DEPARTMENTS_STAFF = [
    "Support", "Content", "QA", "Operations", "Moderation",
    "Curriculum", "IT", "Finance",
]

POSITIONS_STAFF = [
    "Customer Support Specialist", "Content Reviewer",
    "Quality Analyst", "Operations Coordinator",
    "Content Moderator", "Curriculum Specialist",
    "Systems Administrator", "Accounts Officer",
]

SPECIALIZATIONS = [
    "Mathematics", "English Language", "Kiswahili",
    "Science and Technology", "Social Studies",
    "Creative Arts and Music", "Religious Education",
    "Computer Science", "Physical Education",
    "Environmental Education",
]


# ---------------------------------------------------------------------------
# Helper: deterministic unique names
# ---------------------------------------------------------------------------
_used_names: set = set()


def _unique_name(first_pool: list, last_pool: list) -> tuple:
    """Return a unique (first, last) name pair."""
    for _ in range(500):
        first = random.choice(first_pool)
        last = random.choice(last_pool)
        key = f"{first}_{last}"
        if key not in _used_names:
            _used_names.add(key)
            return first, last
    # Fallback: append random digits
    first = random.choice(first_pool)
    last = random.choice(last_pool)
    suffix = random.randint(10, 99)
    return f"{first}{suffix}", last


def _phone(index: int) -> str:
    """Generate a Kenyan phone number."""
    return f"+2547{index:08d}"


def _email(first: str, last: str, domain: str = "urbanhomeschool.co.ke") -> str:
    """Generate an email address."""
    clean_first = first.lower().replace("'", "").replace(" ", "")
    clean_last = last.lower().replace("'", "").replace(" ", "")
    return f"{clean_first}.{clean_last}@{domain}"


# ---------------------------------------------------------------------------
# User definitions
# ---------------------------------------------------------------------------
# Global password per role (easy to remember for development)
ROLE_PASSWORDS = {
    "admin": "Admin@2026!",
    "staff": "Staff@2026!",
    "instructor": "Instructor@2026!",
    "parent": "Parent@2026!",
    "student": "Student@2026!",
    "partner": "Partner@2026!",
}


def build_users() -> list:
    """Build a list of 54 user dicts spanning all 6 roles."""
    users = []
    phone_counter = 100

    # ── Admins (4) ────────────────────────────────────────────────────────
    admin_data = [
        ("Edwin", "Odhiambo", "Platform Administration", "Super Admin"),
        ("Amina", "Hassan", "Platform Administration", "System Admin"),
        ("Tom", "Mboya", "Security", "Security Admin"),
        ("Lilian", "Cheruiyot", "Finance", "Finance Admin"),
    ]
    for first, last, dept, position in admin_data:
        phone_counter += 1
        users.append({
            "email": _email(first, last),
            "password": ROLE_PASSWORDS["admin"],
            "role": "admin",
            "profile_data": {
                "full_name": f"{first} {last}",
                "phone": _phone(phone_counter),
                "department": dept,
                "position": position,
            },
        })
        _used_names.add(f"{first}_{last}")

    # ── Staff / Teachers (8) ─────────────────────────────────────────────
    for i in range(8):
        pool = FIRST_NAMES_FEMALE if i % 2 == 0 else FIRST_NAMES_MALE
        first, last = _unique_name(pool, LAST_NAMES)
        phone_counter += 1
        dept = DEPARTMENTS_STAFF[i % len(DEPARTMENTS_STAFF)]
        pos = POSITIONS_STAFF[i % len(POSITIONS_STAFF)]
        users.append({
            "email": _email(first, last),
            "password": ROLE_PASSWORDS["staff"],
            "role": "staff",
            "profile_data": {
                "full_name": f"{first} {last}",
                "phone": _phone(phone_counter),
                "department": dept,
                "position": pos,
            },
        })

    # ── Instructors (10) ─────────────────────────────────────────────────
    for i in range(10):
        pool = FIRST_NAMES_MALE if i % 2 == 0 else FIRST_NAMES_FEMALE
        first, last = _unique_name(pool, LAST_NAMES)
        phone_counter += 1
        spec = SPECIALIZATIONS[i % len(SPECIALIZATIONS)]
        users.append({
            "email": _email(first, last),
            "password": ROLE_PASSWORDS["instructor"],
            "role": "instructor",
            "profile_data": {
                "full_name": f"{first} {last}",
                "phone": _phone(phone_counter),
                "specialization": spec,
                "bio": f"Experienced CBC {spec} instructor with a passion for learner-centred pedagogy.",
                "qualifications": [f"B.Ed {spec}", "KNEC Certified"],
                "years_experience": random.randint(3, 15),
            },
        })

    # ── Parents (10) ─────────────────────────────────────────────────────
    for i in range(10):
        pool = FIRST_NAMES_FEMALE if i % 2 == 0 else FIRST_NAMES_MALE
        first, last = _unique_name(pool, LAST_NAMES)
        phone_counter += 1
        relationship = "mother" if i % 2 == 0 else "father"
        users.append({
            "email": _email(first, last),
            "password": ROLE_PASSWORDS["parent"],
            "role": "parent",
            "profile_data": {
                "full_name": f"{first} {last}",
                "phone": _phone(phone_counter),
                "relationship": relationship,
                "children_count": random.randint(1, 4),
                "county": random.choice([
                    "Nairobi", "Mombasa", "Kisumu", "Nakuru",
                    "Eldoret", "Nyeri", "Machakos", "Kiambu",
                ]),
            },
        })

    # ── Students (16) ────────────────────────────────────────────────────
    for i in range(16):
        pool = FIRST_NAMES_MALE if i % 2 == 0 else FIRST_NAMES_FEMALE
        first, last = _unique_name(pool, LAST_NAMES)
        phone_counter += 1
        grade = GRADE_LEVELS[i % len(GRADE_LEVELS)]
        style = LEARNING_STYLES[i % len(LEARNING_STYLES)]
        strengths = random.sample(LEARNING_AREAS, k=2)
        interests = random.sample(
            ["coding", "art", "music", "football", "reading", "chess",
             "science experiments", "storytelling", "gardening", "cooking"],
            k=2,
        )
        users.append({
            "email": _email(first, last),
            "password": ROLE_PASSWORDS["student"],
            "role": "student",
            "profile_data": {
                "full_name": f"{first} {last}",
                "phone": _phone(phone_counter),
                "grade_level": grade,
                "tutor_name": TUTOR_NAMES[i % len(TUTOR_NAMES)],
                "learning_profile": {
                    "learning_style": style,
                    "strengths": strengths,
                    "interests": interests,
                },
            },
        })

    # ── Partners (6) ─────────────────────────────────────────────────────
    partner_orgs = [
        ("Safaricom Foundation", "corporate_sponsor", "Nairobi"),
        ("EduTech Partners Ltd", "content_provider", "Nairobi"),
        ("Equity Bank Foundation", "financial_sponsor", "Nairobi"),
        ("UNICEF Kenya", "ngo_partner", "Nairobi"),
        ("Longhorn Publishers", "content_provider", "Nairobi"),
        ("Kenya Red Cross", "community_partner", "Nairobi"),
    ]
    for i, (org, ptype, city) in enumerate(partner_orgs):
        pool = FIRST_NAMES_MALE if i % 2 == 0 else FIRST_NAMES_FEMALE
        first, last = _unique_name(pool, LAST_NAMES)
        phone_counter += 1
        users.append({
            "email": _email(first, last),
            "password": ROLE_PASSWORDS["partner"],
            "role": "partner",
            "profile_data": {
                "full_name": f"{first} {last}",
                "phone": _phone(phone_counter),
                "organization": org,
                "partnership_type": ptype,
                "city": city,
            },
        })

    return users


# ---------------------------------------------------------------------------
# AI Provider configurations
# ---------------------------------------------------------------------------
AI_PROVIDERS = [
    {
        "name": "Gemini Pro",
        "provider_type": "text",
        "api_endpoint": "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
        "api_key_encrypted": "PLACEHOLDER_ENCRYPTED_KEY_GEMINI",
        "specialization": "reasoning",
        "is_active": True,
        "is_recommended": True,
        "cost_per_request": Decimal("0.000500"),
        "description": "Google Gemini Pro - primary tutor model for reasoning, mathematics, and general education.",
        "configuration": {
            "model": "gemini-pro",
            "max_tokens": 4096,
            "temperature": 0.7,
            "top_p": 0.95,
            "safety_settings": "moderate",
            "supported_languages": ["en", "sw"],
        },
    },
    {
        "name": "Claude 3.5 Sonnet",
        "provider_type": "text",
        "api_endpoint": "https://api.anthropic.com/v1/messages",
        "api_key_encrypted": "PLACEHOLDER_ENCRYPTED_KEY_CLAUDE",
        "specialization": "creative",
        "is_active": True,
        "is_recommended": True,
        "cost_per_request": Decimal("0.003000"),
        "description": "Anthropic Claude 3.5 Sonnet - creative writing, detailed explanations, and story-based lessons.",
        "configuration": {
            "model": "claude-3-5-sonnet-20241022",
            "max_tokens": 4096,
            "temperature": 0.8,
            "supported_languages": ["en", "sw"],
        },
    },
    {
        "name": "GPT-4o",
        "provider_type": "text",
        "api_endpoint": "https://api.openai.com/v1/chat/completions",
        "api_key_encrypted": "PLACEHOLDER_ENCRYPTED_KEY_OPENAI",
        "specialization": "general",
        "is_active": True,
        "is_recommended": False,
        "cost_per_request": Decimal("0.005000"),
        "description": "OpenAI GPT-4o - fallback model for general-purpose tutoring and advanced analysis.",
        "configuration": {
            "model": "gpt-4o",
            "max_tokens": 4096,
            "temperature": 0.7,
            "supported_languages": ["en", "sw"],
        },
    },
    {
        "name": "Grok-2",
        "provider_type": "text",
        "api_endpoint": "https://api.x.ai/v1/chat/completions",
        "api_key_encrypted": "PLACEHOLDER_ENCRYPTED_KEY_GROK",
        "specialization": "research",
        "is_active": True,
        "is_recommended": False,
        "cost_per_request": Decimal("0.002000"),
        "description": "X.AI Grok-2 - research assistant for current events, news, and real-time information.",
        "configuration": {
            "model": "grok-2",
            "max_tokens": 4096,
            "temperature": 0.6,
            "supported_languages": ["en"],
        },
    },
    {
        "name": "ElevenLabs TTS",
        "provider_type": "voice",
        "api_endpoint": "https://api.elevenlabs.io/v1/text-to-speech",
        "api_key_encrypted": "PLACEHOLDER_ENCRYPTED_KEY_ELEVENLABS",
        "specialization": "voice_generation",
        "is_active": True,
        "is_recommended": True,
        "cost_per_request": Decimal("0.001500"),
        "description": "ElevenLabs - natural text-to-speech for voice responses, read-aloud, and pronunciation guides.",
        "configuration": {
            "voice_id": "21m00Tcm4TlvDq8ikWAM",
            "model_id": "eleven_multilingual_v2",
            "stability": 0.5,
            "similarity_boost": 0.75,
            "output_format": "mp3_44100_128",
            "supported_languages": ["en", "sw"],
        },
    },
    {
        "name": "Synthesia",
        "provider_type": "video",
        "api_endpoint": "https://api.synthesia.io/v2/videos",
        "api_key_encrypted": "PLACEHOLDER_ENCRYPTED_KEY_SYNTHESIA",
        "specialization": "video_generation",
        "is_active": False,
        "is_recommended": False,
        "cost_per_request": Decimal("0.500000"),
        "description": "Synthesia - AI video generation for lesson intros, summaries, and concept explainers.",
        "configuration": {
            "avatar_id": "anna_costume1_cameraA",
            "language": "en",
            "resolution": "720p",
            "max_duration_seconds": 120,
        },
    },
]


# ---------------------------------------------------------------------------
# Sample courses (CBC-aligned)
# ---------------------------------------------------------------------------
COURSES = [
    {
        "title": "CBC Mathematics: Numbers and Operations",
        "description": "Master number sense, operations, and problem-solving aligned to Kenya's CBC framework for Grades 1-3.",
        "grade_levels": ["Grade 1", "Grade 2", "Grade 3"],
        "learning_area": "Mathematics",
        "price": Decimal("0.00"),
        "is_platform_created": True,
        "is_published": True,
        "is_featured": True,
        "estimated_duration_hours": 40,
        "enrollment_count": 245,
        "average_rating": Decimal("4.70"),
        "total_reviews": 38,
    },
    {
        "title": "English Literacy: Reading & Comprehension",
        "description": "Build strong reading skills with phonics, vocabulary, and comprehension strategies for young learners.",
        "grade_levels": ["Grade 1", "Grade 2", "Grade 3"],
        "learning_area": "English",
        "price": Decimal("0.00"),
        "is_platform_created": True,
        "is_published": True,
        "is_featured": True,
        "estimated_duration_hours": 36,
        "enrollment_count": 312,
        "average_rating": Decimal("4.85"),
        "total_reviews": 52,
    },
    {
        "title": "Kiswahili Stadi za Kusoma",
        "description": "Jifunze kusoma na kuandika kwa Kiswahili kupitia hadithi, nyimbo, na michezo ya lugha.",
        "grade_levels": ["Grade 1", "Grade 2"],
        "learning_area": "Kiswahili",
        "price": Decimal("0.00"),
        "is_platform_created": True,
        "is_published": True,
        "is_featured": False,
        "estimated_duration_hours": 30,
        "enrollment_count": 189,
        "average_rating": Decimal("4.50"),
        "total_reviews": 27,
    },
    {
        "title": "Science & Technology: Our Environment",
        "description": "Explore the natural world through hands-on activities, observations, and simple experiments.",
        "grade_levels": ["Grade 3", "Grade 4", "Grade 5"],
        "learning_area": "Science and Technology",
        "price": Decimal("500.00"),
        "is_platform_created": False,
        "is_published": True,
        "is_featured": True,
        "estimated_duration_hours": 45,
        "enrollment_count": 156,
        "average_rating": Decimal("4.60"),
        "total_reviews": 23,
    },
    {
        "title": "Social Studies: Kenya My Country",
        "description": "Learn about Kenyan history, geography, culture, government, and citizenship through interactive lessons.",
        "grade_levels": ["Grade 4", "Grade 5", "Grade 6"],
        "learning_area": "Social Studies",
        "price": Decimal("0.00"),
        "is_platform_created": True,
        "is_published": True,
        "is_featured": False,
        "estimated_duration_hours": 35,
        "enrollment_count": 203,
        "average_rating": Decimal("4.40"),
        "total_reviews": 31,
    },
    {
        "title": "Creative Arts: Drawing & Painting",
        "description": "Develop artistic skills through guided drawing, painting, and mixed-media projects using local materials.",
        "grade_levels": ["Grade 1", "Grade 2", "Grade 3", "Grade 4"],
        "learning_area": "Creative Arts",
        "price": Decimal("350.00"),
        "is_platform_created": False,
        "is_published": True,
        "is_featured": False,
        "estimated_duration_hours": 25,
        "enrollment_count": 98,
        "average_rating": Decimal("4.30"),
        "total_reviews": 15,
    },
    {
        "title": "CBC Mathematics: Geometry & Measurement",
        "description": "Understand shapes, spatial relationships, measurement, and data handling for upper primary.",
        "grade_levels": ["Grade 4", "Grade 5", "Grade 6"],
        "learning_area": "Mathematics",
        "price": Decimal("750.00"),
        "is_platform_created": False,
        "is_published": True,
        "is_featured": True,
        "estimated_duration_hours": 42,
        "enrollment_count": 178,
        "average_rating": Decimal("4.55"),
        "total_reviews": 29,
    },
    {
        "title": "Health Education: My Body, My Safety",
        "description": "Age-appropriate health education covering hygiene, nutrition, safety, and emotional well-being.",
        "grade_levels": ["Grade 1", "Grade 2", "Grade 3"],
        "learning_area": "Health Education",
        "price": Decimal("0.00"),
        "is_platform_created": True,
        "is_published": True,
        "is_featured": False,
        "estimated_duration_hours": 20,
        "enrollment_count": 267,
        "average_rating": Decimal("4.75"),
        "total_reviews": 41,
    },
    {
        "title": "Computer Science: Coding for Kids",
        "description": "Introduction to computational thinking, block-based coding, and digital literacy for young learners.",
        "grade_levels": ["Grade 4", "Grade 5", "Grade 6"],
        "learning_area": "Computer Science",
        "price": Decimal("1200.00"),
        "is_platform_created": False,
        "is_published": True,
        "is_featured": True,
        "estimated_duration_hours": 50,
        "enrollment_count": 134,
        "average_rating": Decimal("4.80"),
        "total_reviews": 22,
    },
    {
        "title": "Music & Movement: Kenyan Rhythms",
        "description": "Explore Kenyan musical traditions, rhythms, instruments, and dance through interactive lessons.",
        "grade_levels": ["Grade 1", "Grade 2", "Grade 3", "Grade 4"],
        "learning_area": "Music",
        "price": Decimal("0.00"),
        "is_platform_created": True,
        "is_published": True,
        "is_featured": False,
        "estimated_duration_hours": 22,
        "enrollment_count": 145,
        "average_rating": Decimal("4.65"),
        "total_reviews": 19,
    },
    {
        "title": "Junior Secondary Mathematics",
        "description": "Advanced mathematics concepts including algebra, statistics, and trigonometry for Grade 7-9 learners.",
        "grade_levels": ["Grade 7", "Grade 8", "Grade 9"],
        "learning_area": "Mathematics",
        "price": Decimal("1500.00"),
        "is_platform_created": False,
        "is_published": True,
        "is_featured": True,
        "estimated_duration_hours": 60,
        "enrollment_count": 89,
        "average_rating": Decimal("4.45"),
        "total_reviews": 14,
    },
    {
        "title": "Agriculture: Farming Basics",
        "description": "Learn sustainable farming practices, crop science, and animal husbandry relevant to Kenyan agriculture.",
        "grade_levels": ["Grade 5", "Grade 6", "Grade 7"],
        "learning_area": "Agriculture",
        "price": Decimal("400.00"),
        "is_platform_created": False,
        "is_published": True,
        "is_featured": False,
        "estimated_duration_hours": 30,
        "enrollment_count": 72,
        "average_rating": Decimal("4.35"),
        "total_reviews": 11,
    },
    {
        "title": "Religious Education: Values & Ethics",
        "description": "Explore universal values, moral reasoning, and ethical decision-making through stories and discussions.",
        "grade_levels": ["Grade 4", "Grade 5", "Grade 6"],
        "learning_area": "Religious Education",
        "price": Decimal("0.00"),
        "is_platform_created": True,
        "is_published": True,
        "is_featured": False,
        "estimated_duration_hours": 28,
        "enrollment_count": 167,
        "average_rating": Decimal("4.20"),
        "total_reviews": 25,
    },
    {
        "title": "Physical Education: Sports & Fitness",
        "description": "Stay active with structured PE lessons, fitness routines, and sports skills for home-schooled learners.",
        "grade_levels": ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5"],
        "learning_area": "Physical Education",
        "price": Decimal("0.00"),
        "is_platform_created": True,
        "is_published": True,
        "is_featured": False,
        "estimated_duration_hours": 18,
        "enrollment_count": 210,
        "average_rating": Decimal("4.10"),
        "total_reviews": 33,
    },
    {
        "title": "Life Skills: Growing Up Strong",
        "description": "Develop critical thinking, communication, teamwork, and self-management skills for everyday life.",
        "grade_levels": ["Grade 6", "Grade 7", "Grade 8"],
        "learning_area": "Life Skills",
        "price": Decimal("600.00"),
        "is_platform_created": False,
        "is_published": True,
        "is_featured": False,
        "estimated_duration_hours": 24,
        "enrollment_count": 95,
        "average_rating": Decimal("4.50"),
        "total_reviews": 16,
    },
]


# ---------------------------------------------------------------------------
# Notification templates per role
# ---------------------------------------------------------------------------
def _notifications_for_role(role: str) -> list:
    """Return a list of notification dicts appropriate for a given role."""
    now = datetime.utcnow()

    base = [
        {
            "type": NotificationType.system,
            "title": "Welcome to Urban Home School!",
            "message": f"Your {role} account has been activated. Explore the platform and get started.",
            "action_url": "/dashboard",
            "action_label": "Go to Dashboard",
            "is_read": False,
            "created_at": now - timedelta(hours=1),
        },
    ]

    role_specific = {
        "admin": [
            {
                "type": NotificationType.system,
                "title": "System Health Check Complete",
                "message": "All services are running normally. Database, Redis, and AI providers are healthy.",
                "action_url": "/admin/system-config",
                "action_label": "View System Status",
                "is_read": False,
                "created_at": now - timedelta(hours=3),
            },
            {
                "type": NotificationType.moderation,
                "title": "3 New Content Reports",
                "message": "Three forum posts have been flagged for review by the community moderation system.",
                "action_url": "/admin/moderation",
                "action_label": "Review Reports",
                "is_read": False,
                "created_at": now - timedelta(hours=5),
            },
            {
                "type": NotificationType.payment,
                "title": "Monthly Revenue Report Ready",
                "message": "The February 2026 revenue report is ready for review. Total revenue: KES 2,450,000.",
                "action_url": "/admin/money-flow",
                "action_label": "View Report",
                "is_read": True,
                "created_at": now - timedelta(days=1),
            },
        ],
        "staff": [
            {
                "type": NotificationType.assignment,
                "title": "New Support Ticket Assigned",
                "message": "Ticket #1042 has been assigned to you: 'Login issues on mobile app'.",
                "action_url": "/staff/tickets/1042",
                "action_label": "View Ticket",
                "is_read": False,
                "created_at": now - timedelta(hours=2),
            },
            {
                "type": NotificationType.system,
                "title": "Content Review Deadline",
                "message": "You have 5 pending content reviews due by end of day.",
                "action_url": "/staff/content-review",
                "action_label": "Review Content",
                "is_read": False,
                "created_at": now - timedelta(hours=4),
            },
        ],
        "instructor": [
            {
                "type": NotificationType.enrollment,
                "title": "New Student Enrolled",
                "message": "A new student has enrolled in your 'CBC Mathematics' course. You now have 246 students.",
                "action_url": "/instructor/courses",
                "action_label": "View Course",
                "is_read": False,
                "created_at": now - timedelta(hours=2),
            },
            {
                "type": NotificationType.payment,
                "title": "Earnings Payout Processed",
                "message": "Your monthly earnings of KES 34,500 have been sent to your M-Pesa account.",
                "action_url": "/instructor/earnings",
                "action_label": "View Earnings",
                "is_read": True,
                "created_at": now - timedelta(days=2),
            },
            {
                "type": NotificationType.ai,
                "title": "AI Course Insight Available",
                "message": "AI has generated new insights about student performance patterns in your Science course.",
                "action_url": "/instructor/insights",
                "action_label": "View Insights",
                "is_read": False,
                "created_at": now - timedelta(hours=6),
            },
        ],
        "parent": [
            {
                "type": NotificationType.achievement,
                "title": "Your Child Earned a Badge!",
                "message": "Congratulations! Your child earned the 'Math Whiz' badge for completing 10 math quizzes.",
                "action_url": "/parent/children",
                "action_label": "View Achievement",
                "is_read": False,
                "created_at": now - timedelta(hours=3),
            },
            {
                "type": NotificationType.course,
                "title": "Weekly Progress Report",
                "message": "Your child completed 85% of this week's learning goals. Great progress!",
                "action_url": "/parent/reports",
                "action_label": "View Report",
                "is_read": False,
                "created_at": now - timedelta(days=1),
            },
            {
                "type": NotificationType.system,
                "title": "Upcoming Live Session",
                "message": "Your child has a live Kiswahili session scheduled for tomorrow at 10:00 AM.",
                "action_url": "/parent/schedule",
                "action_label": "View Schedule",
                "is_read": True,
                "created_at": now - timedelta(hours=8),
            },
        ],
        "student": [
            {
                "type": NotificationType.assignment,
                "title": "New Assignment: Math Homework",
                "message": "You have a new mathematics assignment due on Friday. Topic: Fractions and Decimals.",
                "action_url": "/assignments",
                "action_label": "Start Assignment",
                "is_read": False,
                "created_at": now - timedelta(hours=4),
            },
            {
                "type": NotificationType.quiz,
                "title": "Quiz Results: Science",
                "message": "You scored 88% on the Science quiz 'Our Environment'. Keep up the great work!",
                "action_url": "/quizzes",
                "action_label": "View Results",
                "is_read": True,
                "created_at": now - timedelta(days=1),
            },
            {
                "type": NotificationType.achievement,
                "title": "Level Up! You reached Level 5",
                "message": "You earned 150 XP this week and leveled up to 'Explorer'. New badges unlocked!",
                "action_url": "/dashboard",
                "action_label": "View Progress",
                "is_read": False,
                "created_at": now - timedelta(hours=6),
            },
            {
                "type": NotificationType.ai,
                "title": "Birdy has a new lesson for you!",
                "message": "Your AI tutor prepared a personalized lesson on multiplication tables. Let's learn!",
                "action_url": "/ai-tutor",
                "action_label": "Start Lesson",
                "is_read": False,
                "created_at": now - timedelta(hours=1),
            },
        ],
        "partner": [
            {
                "type": NotificationType.system,
                "title": "Impact Report Published",
                "message": "Your Q4 2025 sponsorship impact report is now available for download.",
                "action_url": "/partner/reports",
                "action_label": "View Report",
                "is_read": False,
                "created_at": now - timedelta(days=1),
            },
            {
                "type": NotificationType.message,
                "title": "New Message from Admin",
                "message": "The platform admin sent you a message regarding your partnership renewal.",
                "action_url": "/partner/messages",
                "action_label": "Read Message",
                "is_read": False,
                "created_at": now - timedelta(hours=5),
            },
        ],
    }

    return base + role_specific.get(role, [])


# ---------------------------------------------------------------------------
# Main seed logic
# ---------------------------------------------------------------------------
async def main():
    print("=" * 75)
    print("  Urban Home School - Comprehensive Database Seeding")
    print("=" * 75)

    # ── 1. Initialize database ────────────────────────────────────────────
    print("\n[1/11] Initializing database connection...")
    await init_db()

    from app.database import engine, AsyncSessionLocal

    # ── 2. Create all tables ──────────────────────────────────────────────
    print("[2/11] Creating database tables...")
    async with engine.begin() as conn:
        await conn.execute(text('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"'))
        await conn.execute(text('CREATE EXTENSION IF NOT EXISTS "pgcrypto"'))
        await conn.run_sync(Base.metadata.create_all)

    async with engine.begin() as conn:
        result = await conn.execute(text(
            "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
        ))
        tables = [row[0] for row in result.fetchall()]
    print(f"      {len(tables)} tables ready.")

    # ── 3. Seed users ────────────────────────────────────────────────────
    print("[3/11] Seeding users across all 6 roles...")
    all_users = build_users()
    user_id_map: dict[str, uuid.UUID] = {}  # email -> user id
    instructor_ids: list[uuid.UUID] = []
    student_ids: list[uuid.UUID] = []
    parent_ids: list[uuid.UUID] = []
    counts = {"admin": 0, "staff": 0, "instructor": 0, "parent": 0, "student": 0, "partner": 0}

    async with AsyncSessionLocal() as session:
        for user_data in all_users:
            # Check if user already exists
            result = await session.execute(
                select(User).where(User.email == user_data["email"])
            )
            existing = result.scalars().first()
            if existing:
                user_id_map[user_data["email"]] = existing.id
                if existing.role == "instructor":
                    instructor_ids.append(existing.id)
                elif existing.role == "student":
                    student_ids.append(existing.id)
                elif existing.role == "parent":
                    parent_ids.append(existing.id)
                counts[user_data["role"]] += 1
                continue

            hashed_pw = get_password_hash(user_data["password"])
            new_user = User(
                email=user_data["email"],
                password_hash=hashed_pw,
                role=user_data["role"],
                profile_data=user_data["profile_data"],
                is_active=True,
                is_verified=True,
            )
            session.add(new_user)
            await session.flush()

            user_id_map[user_data["email"]] = new_user.id
            counts[user_data["role"]] += 1

            if user_data["role"] == "instructor":
                instructor_ids.append(new_user.id)
            elif user_data["role"] == "parent":
                parent_ids.append(new_user.id)
            elif user_data["role"] == "student":
                # Create Student record
                profile = user_data["profile_data"]
                grade_level = profile.get("grade_level", "Grade 1")
                year = datetime.utcnow().year

                count_result = await session.execute(select(Student))
                existing_count = len(count_result.scalars().all())
                admission_number = f"TUHS-{year}-{(existing_count + 1):05d}"

                parent_id = parent_ids[len(student_ids) % len(parent_ids)] if parent_ids else None

                new_student = Student(
                    user_id=new_user.id,
                    parent_id=parent_id,
                    admission_number=admission_number,
                    grade_level=grade_level,
                    enrollment_date=date.today() - timedelta(days=random.randint(30, 365)),
                    is_active=True,
                    learning_profile=profile.get("learning_profile", {}),
                    competencies={},
                    overall_performance={
                        "average_score": random.randint(60, 95),
                        "assignments_completed": random.randint(5, 50),
                        "quizzes_taken": random.randint(3, 30),
                    },
                )
                session.add(new_student)
                await session.flush()

                # Create AI Tutor
                tutor_name = profile.get("tutor_name", "Birdy")
                ai_tutor = AITutor(
                    student_id=new_student.id,
                    name=tutor_name,
                    conversation_history=[
                        {
                            "role": "assistant",
                            "content": f"Jambo! I'm {tutor_name}, your personal AI tutor. I'm here to help you learn and grow. What would you like to study today?",
                            "timestamp": datetime.utcnow().isoformat(),
                        }
                    ],
                    learning_path={
                        "current_topic": random.choice(LEARNING_AREAS),
                        "completed_topics": random.randint(0, 10),
                        "total_topics": 20,
                    },
                    performance_metrics={
                        "accuracy": round(random.uniform(0.65, 0.95), 2),
                        "engagement_score": round(random.uniform(0.5, 1.0), 2),
                        "streak_days": random.randint(0, 30),
                    },
                    response_mode="text",
                    total_interactions=random.randint(10, 200),
                )
                session.add(ai_tutor)

                student_ids.append(new_user.id)

        await session.commit()

    for role, count in counts.items():
        print(f"      {role:<12s}: {count} users")
    print(f"      {'TOTAL':<12s}: {sum(counts.values())} users")

    # ── 4. Seed AI providers ─────────────────────────────────────────────
    print("[4/11] Seeding AI provider configurations...")
    async with AsyncSessionLocal() as session:
        providers_created = 0
        for prov in AI_PROVIDERS:
            result = await session.execute(
                select(AIProvider).where(AIProvider.name == prov["name"])
            )
            if result.scalars().first():
                print(f"      [SKIP] {prov['name']} (already exists)")
                continue

            new_provider = AIProvider(
                name=prov["name"],
                provider_type=prov["provider_type"],
                api_endpoint=prov["api_endpoint"],
                api_key_encrypted=prov["api_key_encrypted"],
                specialization=prov["specialization"],
                is_active=prov["is_active"],
                is_recommended=prov["is_recommended"],
                cost_per_request=prov["cost_per_request"],
                description=prov["description"],
                configuration=prov["configuration"],
            )
            session.add(new_provider)
            providers_created += 1
            print(f"      [NEW]  {prov['name']} ({prov['provider_type']}, {'active' if prov['is_active'] else 'inactive'})")

        await session.commit()
    print(f"      {providers_created} providers seeded.")

    # ── 5. Seed courses ──────────────────────────────────────────────────
    print("[5/11] Seeding CBC-aligned courses...")
    async with AsyncSessionLocal() as session:
        courses_created = 0
        for i, course_data in enumerate(COURSES):
            result = await session.execute(
                select(Course).where(Course.title == course_data["title"])
            )
            if result.scalars().first():
                print(f"      [SKIP] {course_data['title'][:50]}...")
                continue

            # Assign an instructor for non-platform courses
            inst_id = None
            if not course_data["is_platform_created"] and instructor_ids:
                inst_id = instructor_ids[i % len(instructor_ids)]

            new_course = Course(
                title=course_data["title"],
                description=course_data["description"],
                grade_levels=course_data["grade_levels"],
                learning_area=course_data["learning_area"],
                price=course_data["price"],
                currency="KES",
                is_platform_created=course_data["is_platform_created"],
                is_published=course_data["is_published"],
                is_featured=course_data["is_featured"],
                estimated_duration_hours=course_data["estimated_duration_hours"],
                enrollment_count=course_data["enrollment_count"],
                average_rating=course_data["average_rating"],
                total_reviews=course_data["total_reviews"],
                instructor_id=inst_id,
                syllabus={
                    "units": [
                        {"title": "Unit 1: Introduction", "lessons_count": 5},
                        {"title": "Unit 2: Core Concepts", "lessons_count": 8},
                        {"title": "Unit 3: Practice", "lessons_count": 6},
                        {"title": "Unit 4: Assessment", "lessons_count": 3},
                    ]
                },
                lessons=[
                    {"id": 1, "title": "Getting Started", "duration_minutes": 30, "type": "video"},
                    {"id": 2, "title": "Key Concepts", "duration_minutes": 45, "type": "interactive"},
                    {"id": 3, "title": "Practice Exercises", "duration_minutes": 40, "type": "exercise"},
                ],
                competencies=[
                    f"CBC-{course_data['learning_area'][:3].upper()}-001",
                    f"CBC-{course_data['learning_area'][:3].upper()}-002",
                ],
                published_at=datetime.utcnow() - timedelta(days=random.randint(30, 180)),
            )
            session.add(new_course)
            courses_created += 1

        await session.commit()
    print(f"      {courses_created} courses seeded.")

    # ── 6. Seed notifications ────────────────────────────────────────────
    print("[6/11] Seeding notifications for all users...")
    async with AsyncSessionLocal() as session:
        notif_count = 0
        for user_data in all_users:
            uid = user_id_map.get(user_data["email"])
            if not uid:
                continue

            # Check if this user already has notifications
            result = await session.execute(
                select(Notification).where(Notification.user_id == uid).limit(1)
            )
            if result.scalars().first():
                continue

            notifications = _notifications_for_role(user_data["role"])
            for notif_data in notifications:
                new_notif = Notification(
                    user_id=uid,
                    type=notif_data["type"],
                    title=notif_data["title"],
                    message=notif_data["message"],
                    is_read=notif_data["is_read"],
                    action_url=notif_data.get("action_url"),
                    action_label=notif_data.get("action_label"),
                    created_at=notif_data["created_at"],
                    read_at=notif_data["created_at"] if notif_data["is_read"] else None,
                    metadata_={},
                )
                session.add(new_notif)
                notif_count += 1

        await session.commit()
    print(f"      {notif_count} notifications seeded.")

    # ── 7. Seed subscription plans ────────────────────────────────────────
    print("[7/11] Seeding subscription plans...")
    SUBSCRIPTION_PLANS = [
        {
            "name": "Free Plan",
            "description": "Basic access to free platform courses and community features.",
            "plan_type": PlanType.PLATFORM_ACCESS,
            "billing_cycle": BillingCycle.MONTHLY,
            "price": Decimal("0.00"),
            "trial_days": 0,
            "features": [
                "Access to free courses",
                "Community forums",
                "Basic AI tutor (5 queries/day)",
                "1 child account",
            ],
            "max_enrollments": 3,
            "is_active": True,
            "is_popular": False,
            "display_order": 1,
        },
        {
            "name": "Basic Plan",
            "description": "Full access to all courses with standard AI tutoring support.",
            "plan_type": PlanType.PLATFORM_ACCESS,
            "billing_cycle": BillingCycle.MONTHLY,
            "price": Decimal("999.00"),
            "trial_days": 14,
            "features": [
                "Access to all courses",
                "Standard AI tutor (50 queries/day)",
                "Progress reports",
                "Up to 2 children",
                "Email support",
                "5 GB storage",
            ],
            "max_enrollments": 10,
            "is_active": True,
            "is_popular": False,
            "display_order": 2,
        },
        {
            "name": "Premium Plan",
            "description": "Unlimited access with advanced AI tutoring, live sessions, and priority support.",
            "plan_type": PlanType.PREMIUM_FEATURES,
            "billing_cycle": BillingCycle.MONTHLY,
            "price": Decimal("2499.00"),
            "trial_days": 7,
            "features": [
                "Unlimited course access",
                "Advanced AI tutor (unlimited)",
                "Live tutoring sessions",
                "Detailed analytics & CBC reports",
                "Up to 5 children",
                "Priority support",
                "10 GB storage",
                "Downloadable resources",
                "Certificate of completion",
            ],
            "max_enrollments": -1,
            "is_active": True,
            "is_popular": True,
            "display_order": 3,
        },
        {
            "name": "Annual Premium",
            "description": "Premium plan billed annually with 2 months free.",
            "plan_type": PlanType.PREMIUM_FEATURES,
            "billing_cycle": BillingCycle.ANNUAL,
            "price": Decimal("24990.00"),
            "trial_days": 14,
            "features": [
                "Everything in Premium",
                "2 months free (save KES 4,998)",
                "Unlimited children",
                "20 GB storage",
                "Priority live sessions",
                "Dedicated support",
            ],
            "max_enrollments": -1,
            "is_active": True,
            "is_popular": False,
            "display_order": 4,
        },
        {
            "name": "Sponsorship Tier",
            "description": "For partners sponsoring children's education.",
            "plan_type": PlanType.BUNDLE,
            "billing_cycle": BillingCycle.MONTHLY,
            "price": Decimal("500.00"),
            "trial_days": 0,
            "features": [
                "Per-child pricing",
                "Impact reports & analytics",
                "Bulk enrollment",
                "Dedicated account manager",
                "Custom branding",
                "API access",
            ],
            "max_enrollments": -1,
            "is_active": True,
            "is_popular": False,
            "display_order": 5,
            "meta": {"per_child": True, "min_children": 10},
        },
    ]

    plan_id_map: dict[str, uuid.UUID] = {}
    async with AsyncSessionLocal() as session:
        plans_created = 0
        for plan_data in SUBSCRIPTION_PLANS:
            result = await session.execute(
                select(SubscriptionPlan).where(SubscriptionPlan.name == plan_data["name"])
            )
            existing = result.scalars().first()
            if existing:
                plan_id_map[plan_data["name"]] = existing.id
                print(f"      [SKIP] {plan_data['name']} (already exists)")
                continue

            new_plan = SubscriptionPlan(
                name=plan_data["name"],
                description=plan_data["description"],
                plan_type=plan_data["plan_type"],
                billing_cycle=plan_data["billing_cycle"],
                price=plan_data["price"],
                trial_days=plan_data["trial_days"],
                features=plan_data["features"],
                course_ids=[],
                max_enrollments=plan_data["max_enrollments"],
                is_active=plan_data["is_active"],
                is_popular=plan_data["is_popular"],
                display_order=plan_data["display_order"],
                meta=plan_data.get("meta", {}),
            )
            session.add(new_plan)
            await session.flush()
            plan_id_map[plan_data["name"]] = new_plan.id
            plans_created += 1
            print(f"      [NEW]  {plan_data['name']} - KES {plan_data['price']}/{plan_data['billing_cycle'].value}")

        await session.commit()
    print(f"      {plans_created} subscription plans seeded.")

    # ── 8. Seed wallets for all users ──────────────────────────────────────
    print("[8/11] Seeding wallets for all users...")
    async with AsyncSessionLocal() as session:
        wallets_created = 0
        for user_data in all_users:
            uid = user_id_map.get(user_data["email"])
            if not uid:
                continue

            result = await session.execute(
                select(Wallet).where(Wallet.user_id == uid)
            )
            if result.scalars().first():
                continue

            balance = Decimal("0.00")
            if user_data["role"] == "student":
                balance = Decimal(str(random.randint(0, 500)))
            elif user_data["role"] == "parent":
                balance = Decimal(str(random.randint(100, 2000)))
            elif user_data["role"] == "instructor":
                balance = Decimal(str(random.randint(5000, 50000)))

            wallet = Wallet(
                user_id=uid,
                balance=balance,
                currency="KES",
            )
            session.add(wallet)
            wallets_created += 1

        await session.commit()
    print(f"      {wallets_created} wallets seeded.")

    # ── 9. Seed subscriptions and payment methods for parents ──────────────
    print("[9/11] Seeding subscriptions, payment methods & transactions for parents...")
    now = datetime.utcnow()
    async with AsyncSessionLocal() as session:
        subs_created = 0
        txn_created = 0
        pm_created = 0

        for user_data in all_users:
            if user_data["role"] != "parent":
                continue

            uid = user_id_map.get(user_data["email"])
            if not uid:
                continue

            # Check if parent already has a subscription
            result = await session.execute(
                select(Subscription).where(Subscription.user_id == uid)
            )
            if result.scalars().first():
                continue

            # Assign plan: first 3 parents get Premium, next 4 get Basic, rest Free
            parent_index = subs_created
            if parent_index < 3:
                plan_name = "Premium Plan"
            elif parent_index < 7:
                plan_name = "Basic Plan"
            else:
                plan_name = "Free Plan"

            plan_id = plan_id_map.get(plan_name)
            if not plan_id:
                continue

            # Find the plan to get its price
            plan_result = await session.execute(
                select(SubscriptionPlan).where(SubscriptionPlan.id == plan_id)
            )
            plan = plan_result.scalars().first()
            if not plan:
                continue

            # Create payment method (M-Pesa) for non-free plans
            payment_method_id = None
            if plan.price > 0:
                phone = user_data["profile_data"].get("phone", "+254700000000")
                pm = PaymentMethod(
                    user_id=uid,
                    gateway="mpesa",
                    method_type="phone",
                    details={
                        "phone": phone,
                        "last4": phone[-4:],
                        "name": user_data["profile_data"].get("full_name", ""),
                    },
                    is_default=True,
                    is_active=True,
                )
                session.add(pm)
                await session.flush()
                payment_method_id = pm.id
                pm_created += 1

            # Create subscription
            period_start = now - timedelta(days=random.randint(5, 25))
            billing_days = plan.get_billing_interval_days()
            period_end = period_start + timedelta(days=billing_days)

            sub = Subscription(
                user_id=uid,
                plan_id=plan_id,
                payment_method_id=payment_method_id,
                status=SubscriptionStatus.ACTIVE,
                current_period_start=period_start,
                current_period_end=period_end,
                next_billing_date=period_end,
                last_payment_date=period_start,
                last_payment_amount=plan.price,
                renewal_count=random.randint(0, 6),
                meta={},
            )
            session.add(sub)
            subs_created += 1

            # Create a transaction for the subscription payment
            if plan.price > 0:
                txn_ref = f"MPESA-{uuid.uuid4().hex[:10].upper()}"
                txn = Transaction(
                    user_id=uid,
                    amount=plan.price,
                    currency="KES",
                    gateway="mpesa",
                    status="completed",
                    transaction_reference=txn_ref,
                    transaction_metadata={
                        "type": "subscription_payment",
                        "plan_name": plan_name,
                        "mpesa_receipt": txn_ref,
                        "phone": user_data["profile_data"].get("phone", ""),
                    },
                    created_at=period_start,
                )
                session.add(txn)
                txn_created += 1

        await session.commit()
    print(f"      {subs_created} subscriptions, {pm_created} payment methods, {txn_created} transactions seeded.")

    # ── 10. Seed enrollments ───────────────────────────────────────────────
    print("[10/11] Seeding enrollments (students → courses)...")
    async with AsyncSessionLocal() as session:
        enrollments_created = 0

        # Check if enrollments already exist
        result = await session.execute(select(func.count()).select_from(Enrollment))
        existing_enrollments = result.scalar()
        if existing_enrollments and existing_enrollments > 0:
            print(f"      [SKIP] {existing_enrollments} enrollments already exist.")
        else:
            # Get all students
            student_result = await session.execute(select(Student).where(Student.is_active == True))
            students = student_result.scalars().all()

            # Get all published courses
            course_result = await session.execute(
                select(Course).where(Course.is_published == True)
            )
            courses = course_result.scalars().all()

            for student in students:
                # Each student enrolls in 2-5 random courses
                num_courses = min(len(courses), random.randint(2, 5))
                selected_courses = random.sample(list(courses), num_courses)

                for course in selected_courses:
                    progress = Decimal(str(random.randint(0, 100)))
                    is_completed = progress >= 95
                    completed_at = now - timedelta(days=random.randint(1, 30)) if is_completed else None
                    status = EnrollmentStatus.COMPLETED if is_completed else EnrollmentStatus.ACTIVE

                    enrollment = Enrollment(
                        student_id=student.id,
                        course_id=course.id,
                        status=status,
                        progress_percentage=progress,
                        completed_lessons=[],
                        total_time_spent_minutes=random.randint(30, 1200),
                        last_accessed_at=now - timedelta(hours=random.randint(1, 72)),
                        current_grade=Decimal(str(random.randint(55, 98))),
                        quiz_scores=[
                            {"quiz_id": str(uuid.uuid4()), "score": random.randint(50, 100), "max": 100}
                            for _ in range(random.randint(1, 4))
                        ],
                        assignment_scores=[],
                        is_completed=is_completed,
                        completed_at=completed_at,
                        payment_amount=course.price or Decimal("0.00"),
                        enrolled_at=now - timedelta(days=random.randint(7, 90)),
                        rating=random.randint(3, 5) if is_completed else None,
                        review="Great course! Very helpful." if is_completed and random.random() > 0.5 else None,
                    )
                    session.add(enrollment)
                    enrollments_created += 1

            await session.commit()
        print(f"      {enrollments_created} enrollments seeded.")

    # ── 11. Seed assessments & submissions ─────────────────────────────────
    print("[11/11] Seeding assessments and submissions...")
    async with AsyncSessionLocal() as session:
        assessments_created = 0
        submissions_created = 0

        # Check if assessments already exist
        result = await session.execute(select(func.count()).select_from(Assessment))
        existing_assessments = result.scalar()
        if existing_assessments and existing_assessments > 0:
            print(f"      [SKIP] {existing_assessments} assessments already exist.")
        else:
            course_result = await session.execute(
                select(Course).where(Course.is_published == True).limit(6)
            )
            courses = course_result.scalars().all()

            for i, course in enumerate(courses):
                # Create 2 assessments per course
                for j, atype in enumerate(["quiz", "assignment"]):
                    title = f"{course.learning_area} {'Quiz' if atype == 'quiz' else 'Assignment'} {j + 1}"
                    questions = [
                        {
                            "id": str(uuid.uuid4()),
                            "type": "multiple_choice",
                            "question": f"Sample question {q + 1} for {course.learning_area}",
                            "options": ["Option A", "Option B", "Option C", "Option D"],
                            "correct_answer": random.choice(["A", "B", "C", "D"]),
                            "points": 10,
                        }
                        for q in range(5)
                    ]

                    assessment = Assessment(
                        course_id=course.id,
                        creator_id=course.instructor_id,
                        title=title,
                        description=f"Assessment for {course.title}",
                        assessment_type=atype,
                        questions=questions,
                        total_points=50,
                        passing_score=25,
                        auto_gradable=True,
                        duration_minutes=30 if atype == "quiz" else 60,
                        is_published=True,
                        available_from=now - timedelta(days=30),
                        max_attempts=3 if atype == "quiz" else 1,
                    )
                    session.add(assessment)
                    await session.flush()
                    assessments_created += 1

                    # Create submissions from students
                    student_result = await session.execute(select(Student).limit(5))
                    students = student_result.scalars().all()

                    for student in students:
                        score = random.randint(20, 50)
                        submission = AssessmentSubmission(
                            assessment_id=assessment.id,
                            student_id=student.id,
                            answers={q["id"]: random.choice(["A", "B", "C", "D"]) for q in questions},
                            score=score,
                            is_graded=True,
                            is_submitted=True,
                            attempt_number=1,
                            started_at=now - timedelta(days=random.randint(1, 20)),
                            submitted_at=now - timedelta(days=random.randint(0, 19)),
                            graded_at=now - timedelta(days=random.randint(0, 18)),
                            feedback=f"{'Good job!' if score >= 35 else 'Keep practising.'}" if random.random() > 0.3 else None,
                        )
                        session.add(submission)
                        submissions_created += 1

            await session.commit()
        print(f"      {assessments_created} assessments, {submissions_created} submissions seeded.")

    # ── Print credentials table ──────────────────────────────────────────
    print("\n")
    print("=" * 90)
    print("  SEED COMPLETE - LOGIN CREDENTIALS (one per role)")
    print("=" * 90)
    print()
    print(f"  {'Role':<12s} | {'Email':<45s} | {'Password':<18s}")
    print(f"  {'-' * 12} | {'-' * 45} | {'-' * 18}")

    # Pick the first user of each role as the representative login
    printed_roles: set = set()
    for user_data in all_users:
        role = user_data["role"]
        if role not in printed_roles:
            printed_roles.add(role)
            print(f"  {role:<12s} | {user_data['email']:<45s} | {user_data['password']}")

    print()
    print(f"  {'-' * 12} | {'-' * 45} | {'-' * 18}")
    print(f"  NOTE: All users of the same role share the same password pattern.")
    print()
    print("=" * 90)
    print()
    print("  SUMMARY")
    print("  " + "-" * 40)
    print(f"  Users seeded          : {sum(counts.values())}")
    print(f"  AI Providers          : {len(AI_PROVIDERS)}")
    print(f"  Courses               : {len(COURSES)}")
    print(f"  Notifications         : {notif_count}")
    print(f"  Student records       : {len(student_ids)}")
    print(f"  AI Tutors             : {len(student_ids)}")
    print(f"  Subscription Plans    : {len(SUBSCRIPTION_PLANS)}")
    print(f"  Wallets               : (all users)")
    print(f"  Enrollments           : (students x courses)")
    print(f"  Assessments           : (per course)")
    print()
    print("  Login at: http://localhost:3000")
    print("  API docs: http://localhost:8000/docs")
    print("=" * 90)

    # Cleanup
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
