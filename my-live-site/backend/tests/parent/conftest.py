"""
Pytest fixtures for parent API tests.

Provides parent-specific users, auth headers, and sample data
for testing parent dashboard and children endpoints.
"""

import pytest
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.utils.security import create_access_token, get_password_hash
from app.models.user import User


@pytest.fixture
async def parent_user(db_session: AsyncSession):
    """Create a parent user for testing."""
    user = User(
        email="test_parent@example.com",
        password_hash=get_password_hash("Test123!@#"),
        role="parent",
        is_active=True,
        is_verified=True,
        profile_data={
            "first_name": "Test",
            "last_name": "Parent",
            "phone": "+254712345678",
        },
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest.fixture
def parent_auth_headers(parent_user):
    """Generate JWT authorization headers for parent user."""
    token = create_access_token(data={"sub": str(parent_user.id)})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
async def student_user(db_session: AsyncSession):
    """Create a student user for role-restriction tests."""
    user = User(
        email="student_for_parent_test@example.com",
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
async def instructor_user(db_session: AsyncSession):
    """Create an instructor user for role-restriction tests."""
    user = User(
        email="instructor_for_parent_test@example.com",
        password_hash=get_password_hash("Test123!@#"),
        role="instructor",
        is_active=True,
        is_verified=True,
        profile_data={"first_name": "Instructor", "last_name": "User"},
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
def sample_mood_entry():
    """Sample payload for creating a mood entry."""
    return {
        "emoji": "happy",
        "energy_level": 4,
        "note": "Great day today!",
    }


@pytest.fixture
def sample_goal_payload():
    """Sample payload for creating a family goal."""
    return {
        "title": "Read 10 books this term",
        "description": "Encourage reading by completing 10 books before end of term",
        "category": "academic",
        "progress_percentage": 0,
    }
