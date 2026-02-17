"""
Authentication Service Tests

Tests for auth service business logic:
- User registration (register_user)
- User authentication (authenticate_user)
- Token generation
- Password verification

Coverage target: 90%+ (critical auth logic)
"""

import pytest
from fastapi import HTTPException
from app.services.auth_service import register_user, authenticate_user
from app.schemas.user_schemas import UserCreate, UserLogin
from app.utils.security import verify_password


@pytest.mark.unit
class TestAuthService:
    """Test authentication service methods."""

    async def test_register_user_success(self, db_session):
        """Test user registration with valid data."""
        user_data = UserCreate(
            email="service@test.com",
            password="Test123!@#",
            role="student",
            profile_data={"first_name": "Service", "last_name": "Test"}
        )

        user = await register_user(user_data, db_session)

        assert user.id is not None
        assert user.email == "service@test.com"
        assert user.role == "student"
        assert verify_password("Test123!@#", user.password_hash)

    async def test_authenticate_user_success(self, db_session, test_user):
        """Test successful user authentication returns TokenResponse."""
        credentials = UserLogin(
            email=test_user.email,
            password="Test123!@#"
        )

        token_response = await authenticate_user(credentials, db_session)

        assert token_response is not None
        assert token_response.access_token is not None
        assert token_response.refresh_token is not None
        assert token_response.token_type == "bearer"
        assert token_response.expires_in > 0

    async def test_authenticate_wrong_password_raises(self, db_session, test_user):
        """Test authentication with wrong password raises HTTPException."""
        credentials = UserLogin(
            email=test_user.email,
            password="WrongPassword123!"
        )

        with pytest.raises(HTTPException) as exc_info:
            await authenticate_user(credentials, db_session)

        assert exc_info.value.status_code == 401
        assert "Invalid email or password" in str(exc_info.value.detail)

    async def test_authenticate_nonexistent_user_raises(self, db_session):
        """Test authentication with non-existent user raises HTTPException."""
        credentials = UserLogin(
            email="ghost@example.com",
            password="AnyPassword123!"
        )

        with pytest.raises(HTTPException) as exc_info:
            await authenticate_user(credentials, db_session)

        assert exc_info.value.status_code == 401
        assert "Invalid email or password" in str(exc_info.value.detail)

    def test_user_create_schema_validates_email(self):
        """Test UserCreate schema rejects invalid email."""
        with pytest.raises(Exception):
            UserCreate(
                email="not-an-email",
                password="Test123!@#",
                role="student",
            )

    def test_user_create_schema_validates_role(self):
        """Test UserCreate schema rejects invalid role."""
        with pytest.raises(Exception):
            UserCreate(
                email="valid@test.com",
                password="Test123!@#",
                role="superuser",
            )

    def test_user_login_schema_valid(self):
        """Test UserLogin schema accepts valid data."""
        credentials = UserLogin(
            email="test@example.com",
            password="Test123!@#"
        )
        assert credentials.email == "test@example.com"
        assert credentials.password == "Test123!@#"


# Target: 90%+ coverage for auth_service.py
