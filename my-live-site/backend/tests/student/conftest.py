"""
Pytest fixtures for student API tests.

Provides mock student users, authentication tokens, and common test data
used across all student endpoint test modules.
"""
import pytest
import uuid
from unittest.mock import MagicMock, AsyncMock
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.utils.security import create_access_token, get_current_user


# ---------------------------------------------------------------------------
# Async HTTP client
# ---------------------------------------------------------------------------

@pytest.fixture
async def async_client():
    """Async HTTP client wired to the FastAPI app."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client


# ---------------------------------------------------------------------------
# Identity helpers
# ---------------------------------------------------------------------------

@pytest.fixture
def student_id():
    """A stable UUID representing a student record."""
    return str(uuid.uuid4())


@pytest.fixture
def student_user_id():
    """A stable UUID representing the user row for the student."""
    return str(uuid.uuid4())


# ---------------------------------------------------------------------------
# Mock student user object
# ---------------------------------------------------------------------------

@pytest.fixture
def mock_student(student_id, student_user_id):
    """
    Return a MagicMock that behaves like a User ORM object with role=student
    and a valid student_id attribute.
    """
    user = MagicMock()
    user.id = uuid.UUID(student_user_id)
    user.email = "student@test.com"
    user.role = "student"
    user.is_active = True
    user.is_verified = True
    user.is_deleted = False
    user.student_id = uuid.UUID(student_id)
    user.profile_data = {
        "first_name": "Test",
        "last_name": "Student",
        "grade_level": 5,
    }
    return user


@pytest.fixture
def mock_student_no_profile(student_user_id):
    """
    Student user that has no linked student profile (student_id is None).
    Useful for testing the 400 guard present on most endpoints.
    """
    user = MagicMock()
    user.id = uuid.UUID(student_user_id)
    user.email = "noprofile@test.com"
    user.role = "student"
    user.is_active = True
    user.is_verified = True
    user.is_deleted = False
    user.student_id = None
    user.profile_data = {}
    return user


@pytest.fixture
def mock_admin_user():
    """Admin user for testing role-based access restrictions."""
    user = MagicMock()
    user.id = uuid.UUID(str(uuid.uuid4()))
    user.email = "admin@test.com"
    user.role = "admin"
    user.is_active = True
    user.is_verified = True
    user.is_deleted = False
    user.student_id = None
    user.profile_data = {}
    return user


@pytest.fixture
def mock_instructor_user():
    """Instructor user for testing role-based access restrictions."""
    user = MagicMock()
    user.id = uuid.UUID(str(uuid.uuid4()))
    user.email = "instructor@test.com"
    user.role = "instructor"
    user.is_active = True
    user.is_verified = True
    user.is_deleted = False
    user.student_id = None
    user.profile_data = {}
    return user


# ---------------------------------------------------------------------------
# Auth tokens (lightweight -- no DB lookup required)
# ---------------------------------------------------------------------------

@pytest.fixture
def student_token(student_user_id):
    """JWT access token for a student user."""
    return create_access_token({"sub": student_user_id})


@pytest.fixture
def admin_token():
    """JWT access token for an admin user."""
    return create_access_token({"sub": str(uuid.uuid4())})


@pytest.fixture
def instructor_token():
    """JWT access token for an instructor user."""
    return create_access_token({"sub": str(uuid.uuid4())})


# ---------------------------------------------------------------------------
# Dependency override helpers
# ---------------------------------------------------------------------------

@pytest.fixture
def override_current_user(mock_student):
    """
    Override FastAPI's get_current_user dependency to return mock_student.
    Automatically restores the original dependency after the test.
    """
    async def _override():
        return mock_student

    app.dependency_overrides[get_current_user] = _override
    yield mock_student
    app.dependency_overrides.pop(get_current_user, None)


@pytest.fixture
def override_current_user_no_profile(mock_student_no_profile):
    """
    Override get_current_user with a student that has no student_id.
    """
    async def _override():
        return mock_student_no_profile

    app.dependency_overrides[get_current_user] = _override
    yield mock_student_no_profile
    app.dependency_overrides.pop(get_current_user, None)


@pytest.fixture
def override_current_user_admin(mock_admin_user):
    """
    Override get_current_user with an admin user.
    """
    async def _override():
        return mock_admin_user

    app.dependency_overrides[get_current_user] = _override
    yield mock_admin_user
    app.dependency_overrides.pop(get_current_user, None)


@pytest.fixture
def override_current_user_instructor(mock_instructor_user):
    """
    Override get_current_user with an instructor user.
    """
    async def _override():
        return mock_instructor_user

    app.dependency_overrides[get_current_user] = _override
    yield mock_instructor_user
    app.dependency_overrides.pop(get_current_user, None)


# ---------------------------------------------------------------------------
# Common mock data
# ---------------------------------------------------------------------------

@pytest.fixture
def mock_student_data(student_id, student_user_id):
    """Dictionary representation of a student record."""
    return {
        "id": student_id,
        "user_id": student_user_id,
        "admission_number": "STU-001",
        "grade_level": 5,
        "learning_profile": {"style": "visual"},
    }


@pytest.fixture
def mock_dashboard_data():
    """Sample data returned by DashboardService.get_today_dashboard."""
    return {
        "greeting": "Good morning, Test!",
        "daily_plan": {"items": [], "date": "2026-02-15"},
        "streak": {"current": 5, "longest": 12},
        "mood": None,
        "urgent_items": [],
        "quote": {"text": "Learning is a treasure.", "author": "Proverb"},
        "xp": {"current": 1250, "level": 3, "next_level_xp": 2000},
    }


@pytest.fixture
def mock_course_data():
    """Sample enrolled course data."""
    return {
        "id": str(uuid.uuid4()),
        "title": "Mathematics Grade 5",
        "subject": "Mathematics",
        "grade_level": 5,
        "progress": 45.0,
        "instructor": "Mr. Odhiambo",
    }


@pytest.fixture
def mock_wallet_balance():
    """Sample wallet balance response."""
    return {
        "balance": 5000,
        "currency": "KES",
        "last_updated": "2026-02-15T10:00:00",
    }
