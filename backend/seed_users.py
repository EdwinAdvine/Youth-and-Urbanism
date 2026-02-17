"""
Seed script: Creates all database tables and one user per role.

Usage (run inside Docker for consistent password hashing):
    docker exec tuhs_backend python seed_users.py

Or locally (may cause bcrypt hash issues if Python version differs from Docker):
    cd backend/
    python seed_users.py

Roles: student, parent, instructor, admin, partner, staff
"""

import asyncio
import sys
import os

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
from app.models.student import Student
from app.models.ai_tutor import AITutor
from app.utils.security import get_password_hash
from datetime import datetime


# Users to seed: one per role
SEED_USERS = [
    {
        "email": "admin@urbanhomeschool.co.ke",
        "password": "Admin@2026!",
        "role": "admin",
        "profile_data": {
            "full_name": "Admin User",
            "phone": "+254700000001",
            "department": "Platform Administration",
        },
    },
    {
        "email": "student@urbanhomeschool.co.ke",
        "password": "Student@2026!",
        "role": "student",
        "profile_data": {
            "full_name": "John Kamau",
            "phone": "+254700000002",
            "grade_level": "Grade 5",
            "tutor_name": "Birdy",
            "learning_profile": {
                "learning_style": "visual",
                "strengths": ["mathematics", "science"],
                "interests": ["coding", "art"],
            },
        },
    },
    {
        "email": "parent@urbanhomeschool.co.ke",
        "password": "Parent@2026!",
        "role": "parent",
        "profile_data": {
            "full_name": "Mary Wanjiku",
            "phone": "+254700000003",
            "relationship": "mother",
            "children_count": 1,
        },
    },
    {
        "email": "instructor@urbanhomeschool.co.ke",
        "password": "Instructor@2026!",
        "role": "instructor",
        "profile_data": {
            "full_name": "David Ochieng",
            "phone": "+254700000004",
            "specialization": "Mathematics",
            "bio": "Experienced CBC Mathematics instructor with 10+ years of teaching.",
            "qualifications": ["B.Ed Mathematics", "M.Ed Curriculum Development"],
        },
    },
    {
        "email": "partner@urbanhomeschool.co.ke",
        "password": "Partner@2026!",
        "role": "partner",
        "profile_data": {
            "full_name": "Grace Akinyi",
            "phone": "+254700000005",
            "organization": "EduTech Partners Ltd",
            "partnership_type": "content_provider",
        },
    },
    {
        "email": "staff@urbanhomeschool.co.ke",
        "password": "Staff@2026!",
        "role": "staff",
        "profile_data": {
            "full_name": "Peter Mwangi",
            "phone": "+254700000006",
            "department": "Support",
            "position": "Customer Support Specialist",
        },
    },
]


async def main():
    print("=" * 65)
    print("  Urban Home School - Database Setup & User Seeding")
    print("=" * 65)

    # Initialize database connection (sets up engine + session maker)
    print("\n1. Initializing database connection...")
    await init_db()

    # Import engine/session AFTER init_db has set them up
    from app.database import engine, AsyncSessionLocal

    # Create all tables
    print("\n2. Creating database tables...")
    async with engine.begin() as conn:
        await conn.execute(text('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"'))
        await conn.execute(text('CREATE EXTENSION IF NOT EXISTS "pgcrypto"'))
        await conn.run_sync(Base.metadata.create_all)
    print("   Tables created successfully.")

    # List tables
    async with engine.begin() as conn:
        result = await conn.execute(text(
            "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
        ))
        tables = [row[0] for row in result.fetchall()]
    print(f"   Total tables: {len(tables)}")
    for t in tables:
        print(f"     - {t}")

    # Seed users
    print("\n3. Seeding users (one per role)...")
    async with AsyncSessionLocal() as session:
        created = []

        for user_data in SEED_USERS:
            result = await session.execute(
                select(User).where(User.email == user_data["email"])
            )
            existing = result.scalars().first()

            if existing:
                print(f"  [SKIP] {user_data['role']:12s} | {user_data['email']} (already exists)")
                created.append(user_data)
                continue

            # Create user
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

            # For student role: also create Student + AITutor records
            if user_data["role"] == "student":
                profile = user_data["profile_data"]
                grade_level = profile.get("grade_level", "Grade 1")
                year = datetime.utcnow().year

                count_result = await session.execute(select(Student))
                count = len(count_result.scalars().all())
                admission_number = f"TUHS-{year}-{(count + 1):05d}"

                new_student = Student(
                    user_id=new_user.id,
                    parent_id=None,
                    admission_number=admission_number,
                    grade_level=grade_level,
                    enrollment_date=datetime.utcnow().date(),
                    is_active=True,
                    learning_profile=profile.get("learning_profile", {}),
                    competencies={},
                    overall_performance={},
                )
                session.add(new_student)
                await session.flush()

                ai_tutor = AITutor(
                    student_id=new_student.id,
                    name=profile.get("tutor_name", "Birdy"),
                    conversation_history=[],
                    learning_path={},
                    performance_metrics={},
                    response_mode="text",
                    total_interactions=0,
                )
                session.add(ai_tutor)

            print(f"  [NEW]  {user_data['role']:12s} | {user_data['email']}")
            created.append(user_data)

        await session.commit()
        print(f"\n   Seeded {len(created)} users successfully.")

    # Print credentials
    print("\n" + "=" * 65)
    print("  LOGIN CREDENTIALS")
    print("=" * 65)
    print(f"  {'Role':<12s} | {'Email':<40s} | Password")
    print(f"  {'-'*12} | {'-'*40} | {'-'*18}")
    for u in SEED_USERS:
        print(f"  {u['role']:<12s} | {u['email']:<40s} | {u['password']}")
    print("=" * 65)

    # Cleanup
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
