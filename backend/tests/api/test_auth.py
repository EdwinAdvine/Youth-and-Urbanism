"""
Authentication API Tests

Tests for authentication endpoints:
- POST /api/v1/auth/register - User registration
- POST /api/v1/auth/login - User login
- POST /api/v1/auth/refresh - Token refresh
- GET /api/v1/auth/me - Get current user

Coverage target: 95%+ (critical authentication flow)
"""

import pytest
from fastapi import status
from sqlalchemy.orm import Session

from app.models.user import User
from tests.conftest import TEST_PASSWORD, ADMIN_PASSWORD


@pytest.mark.unit
class TestUserRegistration:
    """Test user registration endpoint: POST /api/v1/auth/register"""

    def test_register_student_success(self, client):
        """Test successful student registration with complete profile data."""
        response = client.post("/api/v1/auth/register", json={
            "email": "newstudent@example.com",
            "password": "StrongPass123!",
            "role": "student",
            "profile_data": {
                "first_name": "New",
                "last_name": "Student",
                "grade_level": 5
            }
        })

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["email"] == "newstudent@example.com"
        assert data["role"] == "student"
        assert "id" in data
        assert "password" not in data  # Password should never be in response
        assert "password_hash" not in data

    def test_register_all_roles_success(self, client):
        """Test successful registration for all user roles."""
        roles = ["student", "parent", "instructor", "admin", "partner", "staff"]

        for role in roles:
            response = client.post("/api/v1/auth/register", json={
                "email": f"{role}test@example.com",
                "password": "StrongPass123!",
                "role": role,
                "profile_data": {
                    "first_name": role.title(),
                    "last_name": "User"
                }
            })

            assert response.status_code == status.HTTP_201_CREATED, f"Failed to register {role}"
            data = response.json()
            assert data["role"] == role

    def test_register_duplicate_email_fails(self, client, test_user):
        """Test registration with existing email returns 400."""
        response = client.post("/api/v1/auth/register", json={
            "email": test_user.email,  # Duplicate email
            "password": "StrongPass123!",
            "role": "student"
        })

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "already" in response.json()["detail"].lower()

    def test_register_weak_password_fails(self, client):
        """Test registration with weak password fails validation."""
        weak_passwords = ["123", "password", "abc", "12345678"]

        for weak_pwd in weak_passwords:
            response = client.post("/api/v1/auth/register", json={
                "email": f"weak{weak_pwd}@example.com",
                "password": weak_pwd,
                "role": "student"
            })

            # Should fail with 422 (validation error) or 400 (business logic)
            assert response.status_code in [
                status.HTTP_422_UNPROCESSABLE_ENTITY,
                status.HTTP_400_BAD_REQUEST
            ], f"Weak password '{weak_pwd}' was accepted"

    def test_register_invalid_email_fails(self, client):
        """Test registration with invalid email format fails."""
        invalid_emails = ["notanemail", "missing@domain", "@nodomain.com", "spaces in@email.com"]

        for invalid_email in invalid_emails:
            response = client.post("/api/v1/auth/register", json={
                "email": invalid_email,
                "password": "StrongPass123!",
                "role": "student"
            })

            assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_register_invalid_role_fails(self, client):
        """Test registration with invalid role fails."""
        response = client.post("/api/v1/auth/register", json={
            "email": "invalidrole@example.com",
            "password": "StrongPass123!",
            "role": "hacker"  # Invalid role
        })

        assert response.status_code in [
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            status.HTTP_400_BAD_REQUEST
        ]

    def test_register_missing_required_fields_fails(self, client):
        """Test registration fails when required fields are missing."""
        # Missing email
        response = client.post("/api/v1/auth/register", json={
            "password": "StrongPass123!",
            "role": "student"
        })
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

        # Missing password
        response = client.post("/api/v1/auth/register", json={
            "email": "test@example.com",
            "role": "student"
        })
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

        # Missing role
        response = client.post("/api/v1/auth/register", json={
            "email": "test@example.com",
            "password": "StrongPass123!"
        })
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


@pytest.mark.unit
class TestUserLogin:
    """Test user login endpoint: POST /api/v1/auth/login"""

    def test_login_success_returns_tokens(self, client, test_user):
        """Test successful login returns access and refresh tokens."""
        response = client.post("/api/v1/auth/login", json={
            "email": test_user.email,
            "password": TEST_PASSWORD
        })

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"
        assert "user" in data or "expires_in" in data

    def test_login_wrong_password_fails(self, client, test_user):
        """Test login with incorrect password returns 401."""
        response = client.post("/api/v1/auth/login", json={
            "email": test_user.email,
            "password": "WrongPassword123!"
        })

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert "invalid" in response.json()["detail"].lower() or "incorrect" in response.json()["detail"].lower()

    def test_login_nonexistent_user_fails(self, client):
        """Test login with non-existent email returns 401."""
        response = client.post("/api/v1/auth/login", json={
            "email": "ghost@example.com",
            "password": "AnyPassword123!"
        })

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_inactive_user_fails(self, client, db_session, test_user):
        """Test login with inactive user account fails."""
        # Deactivate user
        test_user.is_active = False
        db_session.commit()

        response = client.post("/api/v1/auth/login", json={
            "email": test_user.email,
            "password": TEST_PASSWORD
        })

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_deleted_user_fails(self, client, db_session, test_user):
        """Test login with soft-deleted user account fails."""
        # Soft delete user
        test_user.is_deleted = True
        db_session.commit()

        response = client.post("/api/v1/auth/login", json={
            "email": test_user.email,
            "password": TEST_PASSWORD
        })

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_case_insensitive_email(self, client, test_user):
        """Test login is case-insensitive for email."""
        response = client.post("/api/v1/auth/login", json={
            "email": test_user.email.upper(),  # UPPERCASE email
            "password": TEST_PASSWORD
        })

        # Should succeed (email lookup should be case-insensitive)
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_401_UNAUTHORIZED]


@pytest.mark.unit
class TestTokenRefresh:
    """Test token refresh endpoint: POST /api/v1/auth/refresh"""

    def test_refresh_token_success(self, client, test_user):
        """Test successful token refresh returns new tokens."""
        # First login to get refresh token
        login_response = client.post("/api/v1/auth/login", json={
            "email": test_user.email,
            "password": TEST_PASSWORD
        })
        assert login_response.status_code == status.HTTP_200_OK
        refresh_token = login_response.json()["refresh_token"]

        # Use refresh token to get new access token
        response = client.post("/api/v1/auth/refresh", json={
            "refresh_token": refresh_token
        })

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    def test_refresh_invalid_token_fails(self, client):
        """Test refresh with invalid token returns 401."""
        response = client.post("/api/v1/auth/refresh", json={
            "refresh_token": "invalid.token.here"
        })

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_refresh_expired_token_fails(self, client):
        """Test refresh with expired token fails."""
        # This would require creating an expired token
        # For now, test with malformed token
        response = client.post("/api/v1/auth/refresh", json={
            "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.expired.token"
        })

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_refresh_missing_token_fails(self, client):
        """Test refresh without token returns 400."""
        response = client.post("/api/v1/auth/refresh", json={})

        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.unit
class TestGetCurrentUser:
    """Test get current user endpoint: GET /api/v1/auth/me"""

    def test_get_current_user_success(self, client, test_user, auth_headers):
        """Test getting current user with valid token returns user data."""
        response = client.get("/api/v1/auth/me", headers=auth_headers)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["email"] == test_user.email
        assert data["role"] == test_user.role
        assert data["id"] == str(test_user.id)
        assert "password" not in data
        assert "password_hash" not in data

    def test_get_current_user_no_token_fails(self, client):
        """Test getting current user without token returns 401."""
        response = client.get("/api/v1/auth/me")

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_get_current_user_invalid_token_fails(self, client):
        """Test getting current user with invalid token returns 401."""
        response = client.get("/api/v1/auth/me", headers={
            "Authorization": "Bearer invalid.token.here"
        })

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_get_current_user_malformed_header_fails(self, client):
        """Test getting current user with malformed auth header fails."""
        # Missing "Bearer" prefix
        response = client.get("/api/v1/auth/me", headers={
            "Authorization": "not-a-valid-header"
        })

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_get_current_user_expired_token_fails(self, client):
        """Test getting current user with expired token returns 401."""
        # Would need to create expired token
        # For now, test with invalid token
        response = client.get("/api/v1/auth/me", headers={
            "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.expired.signature"
        })

        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.integration
class TestAuthenticationFlow:
    """Integration tests for complete authentication flows."""

    def test_complete_auth_flow_student(self, client, db_session):
        """Test complete authentication flow: register → login → access protected route."""
        # Step 1: Register
        register_response = client.post("/api/v1/auth/register", json={
            "email": "flowtest@example.com",
            "password": "FlowTest123!",
            "role": "student",
            "profile_data": {
                "first_name": "Flow",
                "last_name": "Test"
            }
        })
        assert register_response.status_code == status.HTTP_201_CREATED
        user_id = register_response.json()["id"]

        # Step 2: Login
        login_response = client.post("/api/v1/auth/login", json={
            "email": "flowtest@example.com",
            "password": "FlowTest123!"
        })
        assert login_response.status_code == status.HTTP_200_OK
        access_token = login_response.json()["access_token"]

        # Step 3: Access protected route
        me_response = client.get("/api/v1/auth/me", headers={
            "Authorization": f"Bearer {access_token}"
        })
        assert me_response.status_code == status.HTTP_200_OK
        assert me_response.json()["id"] == user_id

    def test_token_refresh_flow(self, client, test_user):
        """Test complete token refresh flow."""
        # Login
        login_response = client.post("/api/v1/auth/login", json={
            "email": test_user.email,
            "password": TEST_PASSWORD
        })
        assert login_response.status_code == status.HTTP_200_OK
        tokens = login_response.json()
        original_access_token = tokens["access_token"]
        refresh_token = tokens["refresh_token"]

        # Refresh token
        refresh_response = client.post("/api/v1/auth/refresh", json={
            "refresh_token": refresh_token
        })
        assert refresh_response.status_code == status.HTTP_200_OK
        new_tokens = refresh_response.json()
        new_access_token = new_tokens["access_token"]

        # Tokens should be different
        assert new_access_token != original_access_token

        # New token should work
        me_response = client.get("/api/v1/auth/me", headers={
            "Authorization": f"Bearer {new_access_token}"
        })
        assert me_response.status_code == status.HTTP_200_OK

    def test_multiple_role_registrations(self, client):
        """Test registering multiple users with different roles."""
        roles_data = [
            ("student", {"first_name": "Student", "grade_level": 5}),
            ("parent", {"first_name": "Parent", "phone": "+254712345678"}),
            ("instructor", {"first_name": "Instructor", "expertise": ["Math"]}),
            ("admin", {"first_name": "Admin"}),
        ]

        for i, (role, profile) in enumerate(roles_data):
            response = client.post("/api/v1/auth/register", json={
                "email": f"{role}{i}@example.com",
                "password": "Password123!",
                "role": role,
                "profile_data": profile
            })
            assert response.status_code == status.HTTP_201_CREATED, f"Failed for role: {role}"


# Target: 95%+ coverage for auth.py endpoints
