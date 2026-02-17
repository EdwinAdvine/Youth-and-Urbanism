"""
Pytest fixtures for instructor API tests.

Provides instructor-specific users, auth headers, and sample data
for testing instructor dashboard, courses, and earnings endpoints.
"""

import pytest
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.utils.security import create_access_token, get_password_hash
from app.models.user import User


@pytest.fixture
async def instructor_user(db_session: AsyncSession):
    """Create an instructor user for testing."""
    user = User(
        email="test_instructor@example.com",
        password_hash=get_password_hash("Test123!@#"),
        role="instructor",
        is_active=True,
        is_verified=True,
        profile_data={
            "first_name": "Test",
            "last_name": "Instructor",
            "expertise": ["Mathematics", "Physics"],
        },
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest.fixture
def instructor_auth_headers(instructor_user):
    """Generate JWT authorization headers for instructor user."""
    token = create_access_token(data={"sub": str(instructor_user.id)})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
async def student_user(db_session: AsyncSession):
    """Create a student user for role-restriction tests."""
    user = User(
        email="student_for_instructor_test@example.com",
        password_hash=get_password_hash("Test123!@#"),
        role="student",
        is_active=True,
        is_verified=True,
        profile_data={"first_name": "Student", "last_name": "User"},
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest.fixture
def student_auth_headers(student_user):
    """Generate JWT authorization headers for student user."""
    token = create_access_token(data={"sub": str(student_user.id)})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def sample_course_payload():
    """Sample payload for creating a course."""
    return {
        "title": "Introduction to Mathematics",
        "description": "A comprehensive mathematics course for Grade 5",
        "grade_levels": ["5"],
        "learning_area": "Mathematics",
        "price": 1500.0,
        "currency": "KES",
        "estimated_duration_hours": 40,
        "competencies": ["Numeracy", "Problem Solving"],
    }


@pytest.fixture
def sample_payout_payload():
    """Sample payload for requesting a payout."""
    return {
        "amount": 5000.0,
        "payout_method": "mpesa",
        "payout_details": {
            "phone_number": "+254712345678",
        },
    }
