"""
Pytest fixtures for partner API tests.

Provides partner-specific users, auth headers, and sample data
for testing partner dashboard and sponsorship endpoints.
"""

import pytest
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.utils.security import create_access_token, get_password_hash
from app.models.user import User


@pytest.fixture
async def partner_user(db_session: AsyncSession):
    """Create a partner user for testing."""
    user = User(
        email="test_partner@example.com",
        password_hash=get_password_hash("Test123!@#"),
        role="partner",
        is_active=True,
        is_verified=True,
        profile_data={
            "first_name": "Test",
            "last_name": "Partner",
            "organization": "Test Foundation",
        },
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest.fixture
def partner_auth_headers(partner_user):
    """Generate JWT authorization headers for partner user."""
    token = create_access_token(data={"sub": str(partner_user.id)})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
async def admin_user(db_session: AsyncSession):
    """Create an admin user (partner endpoints also allow admin)."""
    user = User(
        email="admin_for_partner_test@example.com",
        password_hash=get_password_hash("Test123!@#"),
        role="admin",
        is_active=True,
        is_verified=True,
        profile_data={"first_name": "Admin", "last_name": "User"},
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest.fixture
def admin_auth_headers(admin_user):
    """Generate JWT authorization headers for admin user."""
    token = create_access_token(data={"sub": str(admin_user.id)})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
async def student_user(db_session: AsyncSession):
    """Create a student user for role-restriction tests."""
    user = User(
        email="student_for_partner_test@example.com",
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
def sample_program_payload():
    """Sample payload for creating a sponsorship programme."""
    return {
        "name": "STEM Scholarship 2026",
        "description": "Sponsoring underprivileged students in STEM subjects",
        "budget": 500000.0,
        "currency": "KES",
        "max_children": 50,
        "grade_levels": ["5", "6", "7"],
    }


@pytest.fixture
def sample_update_program_payload():
    """Sample payload for updating a sponsorship programme."""
    return {
        "name": "STEM Scholarship 2026 - Updated",
        "budget": 750000.0,
        "max_children": 75,
    }
