"""
Authentication Service Tests

Tests for auth service business logic:
- User registration
- User authentication
- Token generation
- Password verification

Coverage target: 90%+ (critical auth logic)
"""

import pytest
from app.services import auth_service
from app.utils.security import verify_password
from tests.factories import UserFactory


@pytest.mark.unit
class TestAuthService:
    """Test authentication service methods."""

    async def test_create_user_success(self, db_session):
        """Test user creation with valid data."""
        user = await auth_service.create_user(
            db_session,
            email="service@test.com",
            password="Test123!@#",
            role="student",
            profile_data={"first_name": "Service", "last_name": "Test"}
        )

        assert user.id is not None
        assert user.email == "service@test.com"
        assert user.role == "student"
        assert verify_password("Test123!@#", user.password_hash)

    async def test_authenticate_user_success(self, db_session, test_user):
        """Test successful user authentication."""
        authenticated_user = await auth_service.authenticate_user(
            db_session,
            email=test_user.email,
            password="Test123!@#"
        )

        assert authenticated_user is not None
        assert authenticated_user.id == test_user.id

    async def test_authenticate_wrong_password_fails(self, db_session, test_user):
        """Test authentication with wrong password returns None."""
        authenticated_user = await auth_service.authenticate_user(
            db_session,
            email=test_user.email,
            password="WrongPassword123!"
        )

        assert authenticated_user is None

    async def test_authenticate_nonexistent_user_fails(self, db_session):
        """Test authentication with non-existent user returns None."""
        authenticated_user = await auth_service.authenticate_user(
            db_session,
            email="ghost@example.com",
            password="AnyPassword123!"
        )

        assert authenticated_user is None


# Target: 90%+ coverage for auth_service.py
