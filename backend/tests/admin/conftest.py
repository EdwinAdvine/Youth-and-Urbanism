"""
Admin Test Fixtures

Provides admin-specific test fixtures for admin API endpoint tests.
These supplement the root conftest fixtures (db_session, client, test_admin, admin_headers)
with additional role-specific users, tokens, and authorization headers.
"""

import uuid

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.utils.security import create_access_token, get_password_hash


# ── Admin fixtures ──────────────────────────────────────────────────

@pytest.fixture
async def admin_user(db_session: AsyncSession) -> User:
    """
    Create an admin user in the test database.

    Returns:
        User: Admin user instance with admin role
    """
    user = User(
        email="admin-test@tuhs.co.ke",
        password_hash=get_password_hash("AdminTest123!@#"),
        role="admin",
        is_active=True,
        is_verified=True,
        profile_data={
            "first_name": "Admin",
            "last_name": "Tester",
        },
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest.fixture
def admin_token(admin_user: User) -> str:
    """
    Generate a JWT access token for the admin user.

    Args:
        admin_user: Admin user created in the test database

    Returns:
        str: JWT access token
    """
    return create_access_token(data={"sub": str(admin_user.id)})


@pytest.fixture
def admin_headers(admin_user: User) -> dict:
    """
    Generate Authorization headers for the admin user.

    Args:
        admin_user: Admin user created in the test database

    Returns:
        dict: Headers dict with Bearer token
    """
    token = create_access_token(data={"sub": str(admin_user.id)})
    return {"Authorization": f"Bearer {token}"}


# ── Staff fixtures ──────────────────────────────────────────────────

@pytest.fixture
async def staff_user(db_session: AsyncSession) -> User:
    """
    Create a staff user in the test database.

    Returns:
        User: Staff user instance with staff role
    """
    user = User(
        email="staff-test@tuhs.co.ke",
        password_hash=get_password_hash("StaffTest123!@#"),
        role="staff",
        is_active=True,
        is_verified=True,
        profile_data={
            "first_name": "Staff",
            "last_name": "Tester",
        },
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest.fixture
def staff_token(staff_user: User) -> str:
    """
    Generate a JWT access token for the staff user.

    Args:
        staff_user: Staff user created in the test database

    Returns:
        str: JWT access token
    """
    return create_access_token(data={"sub": str(staff_user.id)})


@pytest.fixture
def staff_headers(staff_user: User) -> dict:
    """
    Generate Authorization headers for the staff user.

    Args:
        staff_user: Staff user created in the test database

    Returns:
        dict: Headers dict with Bearer token
    """
    token = create_access_token(data={"sub": str(staff_user.id)})
    return {"Authorization": f"Bearer {token}"}


# ── Non-admin fixtures (student) ────────────────────────────────────

@pytest.fixture
async def non_admin_user(db_session: AsyncSession) -> User:
    """
    Create a student user for access control (permission denial) tests.

    Returns:
        User: Student user instance
    """
    user = User(
        email="student-nonadmin@tuhs.co.ke",
        password_hash=get_password_hash("Student123!@#"),
        role="student",
        is_active=True,
        is_verified=True,
        profile_data={
            "first_name": "Student",
            "last_name": "NoAdmin",
            "grade_level": 7,
        },
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest.fixture
def non_admin_token(non_admin_user: User) -> str:
    """
    Generate a JWT access token for the non-admin (student) user.

    Args:
        non_admin_user: Student user created in the test database

    Returns:
        str: JWT access token
    """
    return create_access_token(data={"sub": str(non_admin_user.id)})


@pytest.fixture
def non_admin_headers(non_admin_user: User) -> dict:
    """
    Generate Authorization headers for a non-admin (student) user.

    Args:
        non_admin_user: Student user created in the test database

    Returns:
        dict: Headers dict with Bearer token
    """
    token = create_access_token(data={"sub": str(non_admin_user.id)})
    return {"Authorization": f"Bearer {token}"}
