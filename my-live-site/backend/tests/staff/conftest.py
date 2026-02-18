"""Pytest fixtures for staff tests"""
import pytest
from httpx import AsyncClient
from app.main import app
from app.utils.security import create_access_token

@pytest.fixture
async def async_client():
    """Async HTTP client for testing"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client

@pytest.fixture
def staff_token():
    """Generate JWT token for staff user"""
    return create_access_token({"sub": "staff@tuhs.co.ke", "role": "staff"})

@pytest.fixture
def admin_token():
    """Generate JWT token for admin user"""
    return create_access_token({"sub": "admin@tuhs.co.ke", "role": "admin"})

@pytest.fixture
def student_token():
    """Generate JWT token for student user (for permission tests)"""
    return create_access_token({"sub": "student@tuhs.co.ke", "role": "student"})

@pytest.fixture
def ticket_id():
    """Sample ticket ID for tests"""
    return "ticket-test-123"
