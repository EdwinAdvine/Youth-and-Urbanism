"""
Seed script: Creates comprehensive instructor dashboard test data.

Prerequisites: Run seed_users.py first to create the base instructor user.

Usage (run inside Docker for consistent password hashing):
    docker exec tuhs_backend python seed_instructor.py

Or locally:
    cd backend/
    python seed_instructor.py

Seeds: courses, enrollments, live sessions, assessments, submissions,
       earnings, payouts, forum posts, badges, points, AI insights,
       instructor profile, and availability config.
"""

import asyncio
import sys
import os
import uuid
from datetime import datetime, timedelta, date
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

from sqlalchemy import select, text
from app.database import Base, init_db
from app.models import *  # noqa: F403
from app.models.user import User
from app.models.student import Student
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.assessment import Assessment, AssessmentSubmission
from app.models.staff.live_session import LiveSession
from app.models.instructor.instructor_profile import InstructorProfile
from app.models.instructor.instructor_earnings import (
    InstructorEarning, InstructorPayout, InstructorRevenueSplit,
)
from app.models.instructor.instructor_gamification import (
    InstructorBadge, InstructorBadgeAward, InstructorPoints, InstructorPointsLog,
)
from app.models.instructor.instructor_ai_insight import (
    InstructorDailyInsight, InstructorCBCAnalysis,
)
from app.models.instructor.instructor_discussion import (
    InstructorForumPost, InstructorForumReply,
)
from app.utils.security import get_password_hash


# ============================================================================
# Helper: generate a new UUID
# ============================================================================
def new_id():
    return uuid.uuid4()


# ============================================================================
# Seed student users (for enrollment / submission data)
# ============================================================================
SEED_STUDENTS = [
    {
        "email": "jane.mwangi@student.uhs.co.ke",
        "password": "Student@2026!",
        "role": "student",
        "profile_data": {
            "full_name": "Jane Mwangi",
            "phone": "+254711000001",
            "grade_level": "Grade 7",
        },
    },
    {
        "email": "john.kamau@student.uhs.co.ke",
        "password": "Student@2026!",
        "role": "student",
        "profile_data": {
            "full_name": "John Kamau",
            "phone": "+254711000002",
            "grade_level": "Grade 7",
        },
    },
    {
        "email": "sarah.wanjiru@student.uhs.co.ke",
        "password": "Student@2026!",
        "role": "student",
        "profile_data": {
            "full_name": "Sarah Wanjiru",
            "phone": "+254711000003",
            "grade_level": "Grade 8",
        },
    },
    {
        "email": "david.omondi@student.uhs.co.ke",
        "password": "Student@2026!",
        "role": "student",
        "profile_data": {
            "full_name": "David Omondi",
            "phone": "+254711000004",
            "grade_level": "Grade 6",
        },
    },
    {
        "email": "grace.akinyi@student.uhs.co.ke",
        "password": "Student@2026!",
        "role": "student",
        "profile_data": {
            "full_name": "Grace Akinyi",
            "phone": "+254711000005",
            "grade_level": "Grade 7",
        },
    },
]


async def main():
    print("=" * 65)
    print("  Instructor Dashboard - Comprehensive Seed Data")
    print("=" * 65)

    # 1. Initialize database connection
    print("\n1. Initializing database connection...")
    await init_db()
    from app.database import engine, AsyncSessionLocal

    # 2. Create tables if missing
    print("2. Ensuring database tables exist...")
    async with engine.begin() as conn:
        await conn.execute(text('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"'))
        await conn.execute(text('CREATE EXTENSION IF NOT EXISTS "pgcrypto"'))
        await conn.run_sync(Base.metadata.create_all)
    print("   Tables ready.")

    async with AsyncSessionLocal() as session:
        now = datetime.utcnow()
        today = now.date()

        # ================================================================
        # 3. Get or verify the instructor user from seed_users.py
        # ================================================================
        print("\n3. Looking up instructor user...")
        result = await session.execute(
            select(User).where(User.email == "instructor@urbanhomeschool.co.ke")
        )
        instructor_user = result.scalars().first()

        if not instructor_user:
            print("   [WARN] Instructor user not found. Creating one...")
            instructor_user = User(
                email="instructor@urbanhomeschool.co.ke",
                password_hash=get_password_hash("Instructor@2026!"),
                role="instructor",
                profile_data={
                    "full_name": "David Ochieng",
                    "phone": "+254700000004",
                    "specialization": "Mathematics",
                    "bio": "Experienced CBC Mathematics instructor with 10+ years of teaching.",
                    "qualifications": ["B.Ed Mathematics", "M.Ed Curriculum Development"],
                },
                is_active=True,
                is_verified=True,
            )
            session.add(instructor_user)
            await session.flush()
            print(f"   [NEW] Instructor user created: {instructor_user.id}")
        else:
            print(f"   [OK]  Instructor user found: {instructor_user.id}")

        instructor_id = instructor_user.id

        # ================================================================
        # 4. Create seed student users + student records
        # ================================================================
        print("\n4. Creating seed student users...")
        student_records = []

        for i, sd in enumerate(SEED_STUDENTS):
            result = await session.execute(
                select(User).where(User.email == sd["email"])
            )
            user = result.scalars().first()

            if not user:
                user = User(
                    email=sd["email"],
                    password_hash=get_password_hash(sd["password"]),
                    role="student",
                    profile_data=sd["profile_data"],
                    is_active=True,
                    is_verified=True,
                )
                session.add(user)
                await session.flush()
                print(f"   [NEW] {sd['profile_data']['full_name']}")
            else:
                print(f"   [SKIP] {sd['profile_data']['full_name']} (exists)")

            # Create Student record if not exists
            result = await session.execute(
                select(Student).where(Student.user_id == user.id)
            )
            student = result.scalars().first()

            if not student:
                year = now.year
                student = Student(
                    user_id=user.id,
                    admission_number=f"TUHS-{year}-{(100 + i):05d}",
                    grade_level=sd["profile_data"]["grade_level"],
                    enrollment_date=today - timedelta(days=90),
                    is_active=True,
                    learning_profile={"learning_style": "visual"},
                    competencies={},
                    overall_performance={},
                )
                session.add(student)
                await session.flush()

            student_records.append(student)

        # ================================================================
        # 5. Create Instructor Profile
        # ================================================================
        print("\n5. Creating instructor profile...")
        result = await session.execute(
            select(InstructorProfile).where(InstructorProfile.user_id == instructor_id)
        )
        profile = result.scalars().first()

        if not profile:
            profile = InstructorProfile(
                user_id=instructor_id,
                display_name="David Ochieng",
                bio="Experienced CBC Mathematics instructor with 10+ years of teaching. Passionate about making math accessible to every learner through interactive methods and real-world applications.",
                tagline="Making math fun and accessible for all learners",
                specializations=["Mathematics", "Science", "Data Analysis"],
                qualifications=[
                    {"degree": "B.Ed Mathematics", "institution": "University of Nairobi", "year": 2012},
                    {"degree": "M.Ed Curriculum Development", "institution": "Kenyatta University", "year": 2016},
                ],
                experience_years=10,
                subjects=["Algebra", "Geometry", "Statistics", "Trigonometry", "General Science"],
                languages=["English", "Swahili"],
                teaching_style="interactive",
                public_profile_enabled=True,
                public_slug="david-ochieng",
                availability_config={
                    "timezone": "Africa/Nairobi",
                    "weekly_schedule": {
                        "monday": {"enabled": True, "start": "09:00", "end": "17:00"},
                        "tuesday": {"enabled": True, "start": "09:00", "end": "17:00"},
                        "wednesday": {"enabled": True, "start": "09:00", "end": "17:00"},
                        "thursday": {"enabled": True, "start": "09:00", "end": "17:00"},
                        "friday": {"enabled": True, "start": "09:00", "end": "15:00"},
                        "saturday": {"enabled": False},
                        "sunday": {"enabled": False},
                    },
                    "booking_window_days": 14,
                    "session_duration_minutes": 60,
                },
                social_links=[
                    {"platform": "linkedin", "url": "https://linkedin.com/in/david-ochieng"},
                    {"platform": "twitter", "url": "https://x.com/davidochieng_edu"},
                ],
                onboarding_completed=True,
            )
            session.add(profile)
            await session.flush()
            print("   [NEW] Instructor profile created.")
        else:
            print("   [SKIP] Instructor profile already exists.")

        # ================================================================
        # 6. Create Courses (4 courses)
        # ================================================================
        print("\n6. Creating courses...")
        courses_data = [
            {
                "title": "Introduction to Mathematics - Grade 7",
                "description": "Comprehensive math course covering algebra, geometry, and statistics aligned with the CBC curriculum. Includes interactive exercises, video lessons, and real-world problem solving.",
                "grade_levels": ["Grade 7", "Grade 8"],
                "learning_area": "Mathematics",
                "price": Decimal("3000.00"),
                "is_published": True,
                "enrollment_count": 45,
                "average_rating": Decimal("4.80"),
                "total_reviews": 28,
                "estimated_duration_hours": 40,
                "lessons": [
                    {"id": "L1", "title": "Number Systems", "type": "video", "duration_min": 45},
                    {"id": "L2", "title": "Linear Equations", "type": "video", "duration_min": 50},
                    {"id": "L3", "title": "Geometry Basics", "type": "interactive", "duration_min": 40},
                    {"id": "L4", "title": "Statistics & Data", "type": "video", "duration_min": 55},
                ],
            },
            {
                "title": "English Language & Literature",
                "description": "Improve reading, writing, and comprehension skills with interactive lessons. Covers creative writing, grammar, poetry analysis, and oral communication.",
                "grade_levels": ["Grade 6", "Grade 7"],
                "learning_area": "English",
                "price": Decimal("2500.00"),
                "is_published": True,
                "enrollment_count": 32,
                "average_rating": Decimal("4.60"),
                "total_reviews": 18,
                "estimated_duration_hours": 35,
                "lessons": [
                    {"id": "L1", "title": "Parts of Speech", "type": "video", "duration_min": 40},
                    {"id": "L2", "title": "Creative Writing", "type": "interactive", "duration_min": 50},
                    {"id": "L3", "title": "Comprehension Skills", "type": "video", "duration_min": 45},
                ],
            },
            {
                "title": "Science Experiments for Young Learners",
                "description": "Hands-on science experiments and explorations for curious minds. Learn the scientific method through fun, safe experiments you can do at home.",
                "grade_levels": ["Grade 4", "Grade 5", "Grade 6"],
                "learning_area": "Science",
                "price": Decimal("2000.00"),
                "is_published": False,
                "enrollment_count": 0,
                "average_rating": Decimal("0.00"),
                "total_reviews": 0,
                "estimated_duration_hours": 25,
                "lessons": [
                    {"id": "L1", "title": "The Scientific Method", "type": "video", "duration_min": 30},
                    {"id": "L2", "title": "Kitchen Chemistry", "type": "interactive", "duration_min": 45},
                ],
            },
            {
                "title": "Social Studies - Our Community",
                "description": "Explore Kenyan history, geography, and civic education through engaging multimedia content and project-based learning.",
                "grade_levels": ["Grade 5", "Grade 6"],
                "learning_area": "Social Studies",
                "price": Decimal("1800.00"),
                "is_published": True,
                "enrollment_count": 18,
                "average_rating": Decimal("4.50"),
                "total_reviews": 8,
                "estimated_duration_hours": 30,
                "lessons": [
                    {"id": "L1", "title": "Kenya's Geography", "type": "video", "duration_min": 40},
                    {"id": "L2", "title": "Our Constitution", "type": "video", "duration_min": 35},
                ],
            },
        ]

        course_records = []
        for cd in courses_data:
            result = await session.execute(
                select(Course).where(
                    Course.title == cd["title"],
                    Course.instructor_id == instructor_id,
                )
            )
            course = result.scalars().first()

            if not course:
                course = Course(
                    title=cd["title"],
                    description=cd["description"],
                    grade_levels=cd["grade_levels"],
                    learning_area=cd["learning_area"],
                    price=cd["price"],
                    is_published=cd["is_published"],
                    enrollment_count=cd["enrollment_count"],
                    average_rating=cd["average_rating"],
                    total_reviews=cd["total_reviews"],
                    estimated_duration_hours=cd["estimated_duration_hours"],
                    lessons=cd["lessons"],
                    instructor_id=instructor_id,
                    syllabus={"units": len(cd["lessons"]), "approach": "CBC-aligned"},
                    published_at=now - timedelta(days=60) if cd["is_published"] else None,
                )
                session.add(course)
                await session.flush()
                print(f"   [NEW] {cd['title']}")
            else:
                print(f"   [SKIP] {cd['title']} (exists)")

            course_records.append(course)

        # ================================================================
        # 7. Create Enrollments
        # ================================================================
        print("\n7. Creating enrollments...")
        enrollment_data = [
            # Math course - all 5 students
            (0, 0, Decimal("75.50"), True),
            (0, 1, Decimal("42.00"), True),
            (0, 2, Decimal("88.00"), True),
            (0, 3, Decimal("60.00"), True),
            (0, 4, Decimal("30.00"), True),
            # English course - 3 students
            (1, 0, Decimal("55.00"), True),
            (1, 1, Decimal("90.00"), True),
            (1, 3, Decimal("35.00"), True),
            # Social Studies - 2 students
            (3, 2, Decimal("20.00"), True),
            (3, 4, Decimal("65.00"), True),
        ]

        for course_idx, student_idx, progress, active in enrollment_data:
            course = course_records[course_idx]
            student = student_records[student_idx]

            result = await session.execute(
                select(Enrollment).where(
                    Enrollment.student_id == student.id,
                    Enrollment.course_id == course.id,
                )
            )
            existing = result.scalars().first()

            if not existing:
                enrollment = Enrollment(
                    student_id=student.id,
                    course_id=course.id,
                    progress_percentage=progress,
                    completed_lessons=["L1"] if float(progress) > 25 else [],
                    total_time_spent_minutes=int(float(progress) * 3),
                    last_accessed_at=now - timedelta(hours=int(float(progress) / 10)),
                    current_grade=Decimal(str(min(float(progress) + 10, 100))),
                    enrolled_at=now - timedelta(days=45),
                )
                session.add(enrollment)
            else:
                pass  # Already seeded

        await session.flush()
        print("   [OK]  Enrollments seeded.")

        # ================================================================
        # 8. Create Live Sessions (6 sessions)
        # ================================================================
        print("\n8. Creating live sessions...")
        sessions_data = [
            {
                "title": "Algebra Review Session",
                "description": "Q&A session covering linear equations and functions",
                "status": "scheduled",
                "scheduled_at": now + timedelta(hours=2),
                "course_id": course_records[0].id,
            },
            {
                "title": "Math Problem-Solving Workshop",
                "description": "Collaborative problem-solving with breakout rooms",
                "status": "scheduled",
                "scheduled_at": now + timedelta(days=3, hours=10),
                "course_id": course_records[0].id,
            },
            {
                "title": "Writing Workshop",
                "description": "Collaborative creative writing exercises and peer review",
                "status": "live",
                "scheduled_at": now - timedelta(minutes=30),
                "started_at": now - timedelta(minutes=25),
                "course_id": course_records[1].id,
            },
            {
                "title": "Geometry Deep Dive",
                "description": "In-depth exploration of geometric proofs and constructions",
                "status": "completed",
                "scheduled_at": now - timedelta(days=2),
                "started_at": now - timedelta(days=2),
                "ended_at": now - timedelta(days=2) + timedelta(hours=1),
                "course_id": course_records[0].id,
            },
            {
                "title": "Statistics Introduction",
                "description": "Introduction to data collection and basic statistics",
                "status": "completed",
                "scheduled_at": now - timedelta(days=5),
                "started_at": now - timedelta(days=5),
                "ended_at": now - timedelta(days=5) + timedelta(minutes=45),
                "course_id": course_records[0].id,
            },
            {
                "title": "Poetry Analysis Session",
                "description": "Analyzing Kenyan poets and their themes",
                "status": "completed",
                "scheduled_at": now - timedelta(days=7),
                "started_at": now - timedelta(days=7),
                "ended_at": now - timedelta(days=7) + timedelta(hours=1),
                "course_id": course_records[1].id,
            },
        ]

        session_records = []
        for i, sd in enumerate(sessions_data):
            result = await session.execute(
                select(LiveSession).where(
                    LiveSession.title == sd["title"],
                    LiveSession.host_id == instructor_id,
                )
            )
            ls = result.scalars().first()

            if not ls:
                ls = LiveSession(
                    title=sd["title"],
                    description=sd["description"],
                    host_id=instructor_id,
                    session_type="lecture",
                    room_name=f"instructor-session-{i + 1}-{uuid.uuid4().hex[:8]}",
                    status=sd["status"],
                    max_participants=30,
                    recording_enabled=True,
                    course_id=sd.get("course_id"),
                    scheduled_at=sd["scheduled_at"],
                    started_at=sd.get("started_at"),
                    ended_at=sd.get("ended_at"),
                )
                session.add(ls)
                await session.flush()
                print(f"   [NEW] {sd['title']} ({sd['status']})")
            else:
                print(f"   [SKIP] {sd['title']} (exists)")

            session_records.append(ls)

        # ================================================================
        # 9. Create Assessments (4 assessments)
        # ================================================================
        print("\n9. Creating assessments...")
        assessments_data = [
            {
                "title": "Algebra Basics - Unit Test",
                "description": "Test covering linear equations, expressions, and basic algebra concepts",
                "assessment_type": "quiz",
                "course_id": course_records[0].id,
                "total_points": 100,
                "passing_score": 50,
                "duration_minutes": 60,
                "is_published": True,
                "questions": [
                    {"id": "Q1", "type": "multiple_choice", "question": "Solve: 2x + 5 = 15", "options": ["x=3", "x=5", "x=7", "x=10"], "correct_answer": "x=5", "points": 5},
                    {"id": "Q2", "type": "multiple_choice", "question": "Simplify: 3(x + 4)", "options": ["3x + 4", "3x + 12", "x + 12", "3x + 7"], "correct_answer": "3x + 12", "points": 5},
                    {"id": "Q3", "type": "true_false", "question": "The expression 5x - 3 is a polynomial.", "correct_answer": True, "points": 5},
                ],
                "total_submissions": 35,
                "average_score": Decimal("72.50"),
            },
            {
                "title": "Creative Writing Assignment",
                "description": "Write a short story (500 words) inspired by a Kenyan folktale",
                "assessment_type": "assignment",
                "course_id": course_records[1].id,
                "total_points": 50,
                "passing_score": 25,
                "duration_minutes": None,
                "is_published": True,
                "questions": [
                    {"id": "Q1", "type": "essay", "question": "Write a 500-word short story inspired by a Kenyan folktale. Include at least 2 characters and a moral lesson.", "points": 50},
                ],
                "total_submissions": 28,
                "average_score": Decimal("38.00"),
            },
            {
                "title": "Science Fair Project Proposal",
                "description": "Submit your project idea, hypothesis, and experiment plan",
                "assessment_type": "project",
                "course_id": course_records[2].id,
                "total_points": 100,
                "passing_score": 60,
                "duration_minutes": None,
                "is_published": False,
                "questions": [],
                "total_submissions": 0,
                "average_score": Decimal("0.00"),
            },
            {
                "title": "Mid-Term Mathematics Exam",
                "description": "Comprehensive exam covering all topics from the first half of the course",
                "assessment_type": "exam",
                "course_id": course_records[0].id,
                "total_points": 200,
                "passing_score": 100,
                "duration_minutes": 120,
                "is_published": True,
                "questions": [
                    {"id": "Q1", "type": "multiple_choice", "question": "What is the LCM of 12 and 18?", "options": ["24", "36", "54", "72"], "correct_answer": "36", "points": 10},
                    {"id": "Q2", "type": "essay", "question": "Explain the concept of proportional reasoning with two real-world examples.", "points": 20},
                ],
                "total_submissions": 40,
                "average_score": Decimal("65.00"),
            },
        ]

        assessment_records = []
        for ad in assessments_data:
            result = await session.execute(
                select(Assessment).where(
                    Assessment.title == ad["title"],
                    Assessment.course_id == ad["course_id"],
                )
            )
            assessment = result.scalars().first()

            if not assessment:
                assessment = Assessment(
                    title=ad["title"],
                    description=ad["description"],
                    assessment_type=ad["assessment_type"],
                    course_id=ad["course_id"],
                    creator_id=instructor_id,
                    total_points=ad["total_points"],
                    passing_score=ad["passing_score"],
                    duration_minutes=ad["duration_minutes"],
                    is_published=ad["is_published"],
                    questions=ad["questions"],
                    total_submissions=ad["total_submissions"],
                    average_score=ad["average_score"],
                    available_from=now - timedelta(days=14) if ad["is_published"] else None,
                    available_until=now + timedelta(days=30) if ad["is_published"] else None,
                )
                session.add(assessment)
                await session.flush()
                print(f"   [NEW] {ad['title']} ({ad['assessment_type']})")
            else:
                print(f"   [SKIP] {ad['title']} (exists)")

            assessment_records.append(assessment)

        # ================================================================
        # 10. Create Submissions (8 submissions)
        # ================================================================
        print("\n10. Creating assessment submissions...")
        submissions_data = [
            # Algebra quiz submissions
            {"assessment_idx": 0, "student_idx": 0, "score": None, "is_graded": False, "days_ago": 2},
            {"assessment_idx": 0, "student_idx": 1, "score": None, "is_graded": False, "days_ago": 5},
            {"assessment_idx": 0, "student_idx": 2, "score": 85, "is_graded": True, "days_ago": 10},
            {"assessment_idx": 0, "student_idx": 4, "score": None, "is_graded": False, "days_ago": 1},
            # Creative writing submissions
            {"assessment_idx": 1, "student_idx": 0, "score": 42, "is_graded": True, "days_ago": 8},
            {"assessment_idx": 1, "student_idx": 1, "score": 38, "is_graded": True, "days_ago": 7},
            {"assessment_idx": 1, "student_idx": 3, "score": None, "is_graded": False, "days_ago": 3},
            # Mid-term exam submission
            {"assessment_idx": 3, "student_idx": 2, "score": 165, "is_graded": True, "days_ago": 12},
        ]

        for sub in submissions_data:
            assessment = assessment_records[sub["assessment_idx"]]
            student = student_records[sub["student_idx"]]

            result = await session.execute(
                select(AssessmentSubmission).where(
                    AssessmentSubmission.assessment_id == assessment.id,
                    AssessmentSubmission.student_id == student.id,
                )
            )
            existing = result.scalars().first()

            if not existing:
                submission = AssessmentSubmission(
                    assessment_id=assessment.id,
                    student_id=student.id,
                    answers={"Q1": "sample answer"},
                    score=sub["score"],
                    is_graded=sub["is_graded"],
                    graded_by=instructor_id if sub["is_graded"] else None,
                    feedback="Good work!" if sub["is_graded"] else None,
                    is_submitted=True,
                    attempt_number=1,
                    started_at=now - timedelta(days=sub["days_ago"], hours=1),
                    submitted_at=now - timedelta(days=sub["days_ago"]),
                    graded_at=now - timedelta(days=sub["days_ago"] - 1) if sub["is_graded"] else None,
                )
                session.add(submission)

        await session.flush()
        print("   [OK]  Submissions seeded.")

        # ================================================================
        # 11. Create Revenue Split + Earnings + Payouts
        # ================================================================
        print("\n11. Creating earnings data...")

        # Revenue split
        result = await session.execute(
            select(InstructorRevenueSplit).where(
                InstructorRevenueSplit.instructor_id == instructor_id,
                InstructorRevenueSplit.course_id == None,  # noqa: E711
            )
        )
        if not result.scalars().first():
            rev_split = InstructorRevenueSplit(
                instructor_id=instructor_id,
                instructor_pct=Decimal("60.00"),
                platform_pct=Decimal("30.00"),
                partner_pct=Decimal("10.00"),
                effective_from=today - timedelta(days=180),
                notes="Default 60/30/10 split",
            )
            session.add(rev_split)
            await session.flush()

        # Monthly earnings for 6 months
        for months_ago in range(6):
            month_start = date(today.year, today.month, 1) - timedelta(days=30 * months_ago)
            month_end = month_start + timedelta(days=29)
            gross = Decimal(str(25000 + months_ago * 5000))

            result = await session.execute(
                select(InstructorEarning).where(
                    InstructorEarning.instructor_id == instructor_id,
                    InstructorEarning.period_start == month_start,
                )
            )
            if not result.scalars().first():
                earning = InstructorEarning(
                    instructor_id=instructor_id,
                    course_id=course_records[0].id,
                    earning_type="COURSE_SALE",
                    gross_amount=gross,
                    platform_fee_pct=Decimal("30.00"),
                    partner_fee_pct=Decimal("10.00"),
                    net_amount=gross * Decimal("0.60"),
                    status="CONFIRMED" if months_ago > 0 else "PENDING",
                    period_start=month_start,
                    period_end=month_end,
                )
                session.add(earning)

        await session.flush()

        # Payouts (3 historical payouts)
        payout_amounts = [
            (Decimal("15000.00"), "COMPLETED", "MPESA_B2C", today - timedelta(days=60)),
            (Decimal("18000.00"), "COMPLETED", "BANK_TRANSFER", today - timedelta(days=30)),
            (Decimal("12000.00"), "REQUESTED", "MPESA_B2C", today - timedelta(days=2)),
        ]

        for amount, status, method, req_date in payout_amounts:
            result = await session.execute(
                select(InstructorPayout).where(
                    InstructorPayout.instructor_id == instructor_id,
                    InstructorPayout.amount == amount,
                )
            )
            if not result.scalars().first():
                payout = InstructorPayout(
                    instructor_id=instructor_id,
                    amount=amount,
                    payout_method=method,
                    payout_details={"phone": "+254700000004"} if method == "MPESA_B2C" else {"bank": "KCB", "account": "1234567890"},
                    status=status,
                    processed_at=req_date + timedelta(days=1) if status == "COMPLETED" else None,
                    transaction_reference=f"TXN-{uuid.uuid4().hex[:8].upper()}" if status == "COMPLETED" else None,
                )
                session.add(payout)

        await session.flush()
        print("   [OK]  Earnings & payouts seeded.")

        # ================================================================
        # 12. Create Badges + Points
        # ================================================================
        print("\n12. Creating badges and points...")

        badge_defs = [
            ("First Course Published", "Published your first course on the platform", "teaching", "BRONZE", 100),
            ("Student Magnet", "Enrolled 25+ students across all courses", "engagement", "SILVER", 250),
            ("Grading Star", "Graded 50+ submissions with detailed feedback", "teaching", "GOLD", 500),
        ]

        badge_records = []
        for name, desc, category, tier, points in badge_defs:
            result = await session.execute(
                select(InstructorBadge).where(InstructorBadge.name == name)
            )
            badge = result.scalars().first()

            if not badge:
                badge = InstructorBadge(
                    name=name,
                    description=desc,
                    category=category,
                    criteria={"type": "manual", "threshold": 1},
                    tier=tier,
                    points_value=points,
                    is_active=True,
                )
                session.add(badge)
                await session.flush()
                print(f"   [NEW] Badge: {name}")
            else:
                print(f"   [SKIP] Badge: {name} (exists)")

            badge_records.append(badge)

        # Award badges to instructor
        for badge in badge_records:
            result = await session.execute(
                select(InstructorBadgeAward).where(
                    InstructorBadgeAward.instructor_id == instructor_id,
                    InstructorBadgeAward.badge_id == badge.id,
                )
            )
            if not result.scalars().first():
                award = InstructorBadgeAward(
                    instructor_id=instructor_id,
                    badge_id=badge.id,
                    awarded_at=now - timedelta(days=30),
                )
                session.add(award)

        # Points record
        result = await session.execute(
            select(InstructorPoints).where(InstructorPoints.instructor_id == instructor_id)
        )
        if not result.scalars().first():
            pts = InstructorPoints(
                instructor_id=instructor_id,
                points=2500,
                level=5,
                streak_days=12,
                longest_streak=28,
                last_activity_at=now,
            )
            session.add(pts)

            # Points log entries
            log_entries = [
                (500, "Course published: Introduction to Mathematics", "course_published"),
                (250, "Badge earned: Student Magnet", "badge_earned"),
                (100, "10-day teaching streak", "streak_bonus"),
                (150, "Graded 20 submissions this week", "grading_activity"),
                (200, "Positive student feedback", "student_feedback"),
            ]
            for delta, reason, source in log_entries:
                log = InstructorPointsLog(
                    instructor_id=instructor_id,
                    points_delta=delta,
                    reason=reason,
                    source=source,
                )
                session.add(log)

        await session.flush()
        print("   [OK]  Badges & points seeded.")

        # ================================================================
        # 13. Create Forum Posts + Replies
        # ================================================================
        print("\n13. Creating forum posts...")

        posts_data = [
            {
                "title": "Welcome to the Mathematics Forum!",
                "content": "This is a space to discuss math concepts, share tips, and help each other learn. Feel free to ask questions or share interesting problems!",
                "post_type": "ANNOUNCEMENT",
                "is_pinned": True,
                "sentiment_score": Decimal("95.00"),
            },
            {
                "title": "How do I solve quadratic equations?",
                "content": "I'm struggling with the quadratic formula. Can someone explain the steps in a simpler way?",
                "post_type": "QUESTION",
                "is_pinned": False,
                "sentiment_score": Decimal("65.00"),
            },
            {
                "title": "Cool trick for multiplying by 9",
                "content": "Found an amazing pattern when multiplying any number by 9. The digits always add up to 9! Try it: 9x7=63, 6+3=9. Works every time!",
                "post_type": "DISCUSSION",
                "is_pinned": False,
                "sentiment_score": Decimal("88.00"),
            },
            {
                "title": "Study group for mid-term preparation",
                "content": "Anyone interested in forming a study group for the upcoming mid-term exam? We can meet online twice a week.",
                "post_type": "DISCUSSION",
                "is_pinned": False,
                "sentiment_score": Decimal("78.00"),
            },
            {
                "title": "Reported: Inappropriate content",
                "content": "This post has been flagged for containing content that violates community guidelines.",
                "post_type": "DISCUSSION",
                "is_pinned": False,
                "is_flagged": True,
                "sentiment_score": Decimal("-42.00"),
            },
        ]

        post_records = []
        for pd_item in posts_data:
            result = await session.execute(
                select(InstructorForumPost).where(
                    InstructorForumPost.title == pd_item["title"],
                    InstructorForumPost.instructor_id == instructor_id,
                )
            )
            post = result.scalars().first()

            if not post:
                post = InstructorForumPost(
                    instructor_id=instructor_id,
                    title=pd_item["title"],
                    content=pd_item["content"],
                    post_type=pd_item["post_type"],
                    is_pinned=pd_item.get("is_pinned", False),
                    is_moderated=False,
                    sentiment_score=pd_item.get("sentiment_score"),
                )
                if pd_item.get("is_flagged"):
                    pass  # Model doesn't have is_flagged; it's handled at API level
                session.add(post)
                await session.flush()
                print(f"   [NEW] Post: {pd_item['title'][:40]}...")
            else:
                print(f"   [SKIP] Post: {pd_item['title'][:40]}... (exists)")

            post_records.append(post)

        # Add replies to the question post
        if len(post_records) > 1:
            result = await session.execute(
                select(InstructorForumReply).where(
                    InstructorForumReply.post_id == post_records[1].id,
                )
            )
            if not result.scalars().first():
                replies = [
                    InstructorForumReply(
                        post_id=post_records[1].id,
                        author_id=instructor_id,
                        content="Great question! The quadratic formula is x = (-b +/- sqrt(b^2 - 4ac)) / 2a. Let me break it down step by step...",
                        sentiment_score=Decimal("90.00"),
                    ),
                    InstructorForumReply(
                        post_id=post_records[1].id,
                        author_id=student_records[0].user_id,
                        content="Thanks for the explanation! The discriminant part (b^2 - 4ac) was confusing but now I understand.",
                        sentiment_score=Decimal("85.00"),
                    ),
                ]
                for reply in replies:
                    session.add(reply)

        await session.flush()
        print("   [OK]  Forum posts & replies seeded.")

        # ================================================================
        # 14. Create AI Daily Insights
        # ================================================================
        print("\n14. Creating AI daily insights...")
        result = await session.execute(
            select(InstructorDailyInsight).where(
                InstructorDailyInsight.instructor_id == instructor_id,
                InstructorDailyInsight.insight_date == today,
            )
        )
        if not result.scalars().first():
            insight = InstructorDailyInsight(
                instructor_id=instructor_id,
                insight_date=today,
                insights=[
                    {
                        "priority": "high",
                        "category": "submissions",
                        "title": "3 pending submissions need grading",
                        "description": "Students are waiting for feedback on their Algebra quiz submissions. Timely grading improves engagement.",
                        "action_url": "/dashboard/instructor/submissions",
                        "ai_rationale": "Based on submission timestamps, average grading delay is increasing.",
                    },
                    {
                        "priority": "medium",
                        "category": "engagement",
                        "title": "Student engagement dip detected",
                        "description": "2 students in your Mathematics course haven't logged in for 5+ days. Consider sending a check-in message.",
                        "action_url": "/dashboard/instructor/progress-pulse",
                        "ai_rationale": "Login frequency analysis shows declining engagement for David and Grace.",
                    },
                    {
                        "priority": "low",
                        "category": "content",
                        "title": "Consider publishing your Science course",
                        "description": "Your 'Science Experiments' course has been in draft for 30 days. It has 2 complete lessons ready for students.",
                        "action_url": "/dashboard/instructor/courses",
                        "ai_rationale": "Draft courses older than 2 weeks with completed lessons are good candidates for publishing.",
                    },
                ],
                ai_model_used="gemini-pro",
            )
            session.add(insight)
            await session.flush()
            print("   [NEW] Today's AI insights created.")
        else:
            print("   [SKIP] Today's insights already exist.")

        # ================================================================
        # 15. Create CBC Analysis for published courses
        # ================================================================
        print("\n15. Creating CBC alignment analyses...")
        for course in course_records[:2]:  # Only published courses
            result = await session.execute(
                select(InstructorCBCAnalysis).where(
                    InstructorCBCAnalysis.course_id == course.id,
                    InstructorCBCAnalysis.instructor_id == instructor_id,
                )
            )
            if not result.scalars().first():
                analysis = InstructorCBCAnalysis(
                    course_id=course.id,
                    instructor_id=instructor_id,
                    alignment_score=Decimal("82.50") if course == course_records[0] else Decimal("76.00"),
                    competencies_covered=[
                        {"strand": "Numbers", "sub_strand": "Whole Numbers", "competency": "Number operations", "lesson_references": ["L1", "L2"]},
                        {"strand": "Algebra", "sub_strand": "Equations", "competency": "Solve linear equations", "lesson_references": ["L2"]},
                    ],
                    competencies_missing=[
                        {"strand": "Geometry", "sub_strand": "3D Shapes", "competency": "Identify 3D shapes", "importance": "medium"},
                    ],
                    suggestions=[
                        {"type": "add_lesson", "competency": "3D Shape identification", "rationale": "CBC Grade 7 requires coverage of 3D shapes", "priority": "medium"},
                    ],
                    ai_model_used="gemini-pro",
                )
                session.add(analysis)
                await session.flush()
                print(f"   [NEW] CBC analysis for: {course.title[:40]}...")
            else:
                print(f"   [SKIP] CBC analysis for: {course.title[:40]}... (exists)")

        # ================================================================
        # COMMIT
        # ================================================================
        await session.commit()
        print("\n   All data committed successfully.")

    # ================================================================
    # Summary
    # ================================================================
    print("\n" + "=" * 65)
    print("  SEED DATA SUMMARY")
    print("=" * 65)
    print(f"  {'Item':<30s} | {'Count':<8s}")
    print(f"  {'-'*30} | {'-'*8}")
    print(f"  {'Instructor Profile':<30s} | {'1':<8s}")
    print(f"  {'Student Users':<30s} | {'5':<8s}")
    print(f"  {'Courses':<30s} | {'4':<8s}")
    print(f"  {'Enrollments':<30s} | {'10':<8s}")
    print(f"  {'Live Sessions':<30s} | {'6':<8s}")
    print(f"  {'Assessments':<30s} | {'4':<8s}")
    print(f"  {'Submissions':<30s} | {'8':<8s}")
    print(f"  {'Earnings Records':<30s} | {'6':<8s}")
    print(f"  {'Payout Requests':<30s} | {'3':<8s}")
    print(f"  {'Badges':<30s} | {'3':<8s}")
    print(f"  {'Badge Awards':<30s} | {'3':<8s}")
    print(f"  {'Points (Level 5, 2500pts)':<30s} | {'1':<8s}")
    print(f"  {'Forum Posts':<30s} | {'5':<8s}")
    print(f"  {'Forum Replies':<30s} | {'2':<8s}")
    print(f"  {'AI Daily Insights':<30s} | {'1':<8s}")
    print(f"  {'CBC Analyses':<30s} | {'2':<8s}")
    print("=" * 65)
    print("\n  Login as instructor:")
    print("  Email:    instructor@urbanhomeschool.co.ke")
    print("  Password: Instructor@2026!")
    print("=" * 65)

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
