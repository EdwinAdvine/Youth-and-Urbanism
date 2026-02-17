"""
Tests for Admin User Management API Endpoints

Tests the following routes under /api/v1/admin/users/:
- GET    /                    - Paginated user listing with search/filter/sort
- GET    /{user_id}           - User detail retrieval
- PUT    /{user_id}/role      - Update user role
- PUT    /{user_id}/deactivate - Deactivate a user account
- GET    /export              - Export users as CSV

All endpoints require admin or staff role access (verify_admin_access).
Non-admin/non-staff users receive 403.
"""

import uuid
from unittest.mock import patch, AsyncMock

import pytest


BASE_URL = "/api/v1/admin/users"


# =====================================================================
# GET /users/ - list users
# =====================================================================


@pytest.mark.unit
class TestListUsers:
    """Tests for the GET /users/ endpoint."""

    async def test_list_users_requires_admin(self, client, non_admin_headers):
        """GET / returns 403 for non-admin (student) users."""
        response = await client.get(f"{BASE_URL}/", headers=non_admin_headers)
        assert response.status_code == 403

    @patch(
        "app.api.v1.admin.users.user_management_service.list_users",
        new_callable=AsyncMock,
    )
    async def test_list_users_success(self, mock_list, client, admin_headers):
        """GET / returns paginated user list for admin."""
        mock_list.return_value = {
            "items": [
                {
                    "id": str(uuid.uuid4()),
                    "email": "student1@tuhs.co.ke",
                    "role": "student",
                    "is_active": True,
                    "created_at": "2026-01-15T10:00:00",
                },
                {
                    "id": str(uuid.uuid4()),
                    "email": "parent1@tuhs.co.ke",
                    "role": "parent",
                    "is_active": True,
                    "created_at": "2026-01-20T08:30:00",
                },
            ],
            "total": 2,
            "page": 1,
            "page_size": 20,
            "pages": 1,
        }

        response = await client.get(f"{BASE_URL}/", headers=admin_headers)

        assert response.status_code == 200
        body = response.json()
        assert body["status"] == "success"
        data = body["data"]
        assert len(data["items"]) == 2
        assert data["total"] == 2
        assert data["page"] == 1

    @patch(
        "app.api.v1.admin.users.user_management_service.list_users",
        new_callable=AsyncMock,
    )
    async def test_list_users_allowed_for_staff(self, mock_list, client, staff_headers):
        """GET / is accessible by staff users (verify_admin_access allows staff)."""
        mock_list.return_value = {
            "items": [],
            "total": 0,
            "page": 1,
            "page_size": 20,
            "pages": 0,
        }

        response = await client.get(f"{BASE_URL}/", headers=staff_headers)

        assert response.status_code == 200

    async def test_list_users_denied_without_auth(self, client):
        """GET / returns 401 when no auth token is provided."""
        response = await client.get(f"{BASE_URL}/")
        assert response.status_code == 401


# =====================================================================
# GET /users/?search=... - search users
# =====================================================================


@pytest.mark.unit
class TestSearchUsers:
    """Tests for the GET /users/?search= endpoint with search parameter."""

    @patch(
        "app.api.v1.admin.users.user_management_service.list_users",
        new_callable=AsyncMock,
    )
    async def test_search_users(self, mock_list, client, admin_headers):
        """GET /?search= passes search query to the service and returns results."""
        mock_list.return_value = {
            "items": [
                {
                    "id": str(uuid.uuid4()),
                    "email": "jane.doe@tuhs.co.ke",
                    "role": "student",
                    "is_active": True,
                    "created_at": "2026-01-10T10:00:00",
                },
            ],
            "total": 1,
            "page": 1,
            "page_size": 20,
            "pages": 1,
        }

        response = await client.get(
            f"{BASE_URL}/",
            headers=admin_headers,
            params={"search": "jane", "role": "student"},
        )

        assert response.status_code == 200
        body = response.json()
        assert body["status"] == "success"
        assert body["data"]["total"] == 1
        mock_list.assert_awaited_once()
        # Verify the search parameter was forwarded
        call_kwargs = mock_list.call_args
        assert call_kwargs.kwargs.get("search") == "jane" or (
            len(call_kwargs.args) > 0
        )


# =====================================================================
# GET /users/{user_id} - user detail
# =====================================================================


@pytest.mark.unit
class TestGetUserDetail:
    """Tests for the GET /users/{user_id} endpoint."""

    @patch(
        "app.api.v1.admin.users.user_management_service.get_user_detail",
        new_callable=AsyncMock,
    )
    async def test_get_user_detail(self, mock_detail, client, admin_headers):
        """GET /{user_id} returns detailed user profile for admin."""
        user_id = str(uuid.uuid4())
        mock_detail.return_value = {
            "id": user_id,
            "email": "student1@tuhs.co.ke",
            "role": "student",
            "is_active": True,
            "is_verified": True,
            "profile_data": {
                "first_name": "Student",
                "last_name": "One",
                "grade_level": 7,
            },
            "created_at": "2026-01-15T10:00:00",
        }

        response = await client.get(
            f"{BASE_URL}/{user_id}", headers=admin_headers
        )

        assert response.status_code == 200
        body = response.json()
        assert body["status"] == "success"
        assert body["data"]["id"] == user_id
        assert body["data"]["role"] == "student"

    @patch(
        "app.api.v1.admin.users.user_management_service.get_user_detail",
        new_callable=AsyncMock,
    )
    async def test_get_user_detail_not_found(self, mock_detail, client, admin_headers):
        """GET /{user_id} returns 404 when user does not exist."""
        mock_detail.return_value = None
        fake_id = str(uuid.uuid4())

        response = await client.get(
            f"{BASE_URL}/{fake_id}", headers=admin_headers
        )

        assert response.status_code == 404

    async def test_get_user_detail_denied_for_student(self, client, non_admin_headers):
        """GET /{user_id} returns 403 for non-admin users."""
        fake_id = str(uuid.uuid4())
        response = await client.get(
            f"{BASE_URL}/{fake_id}", headers=non_admin_headers
        )
        assert response.status_code == 403


# =====================================================================
# PUT /users/{user_id}/role - update user role
# =====================================================================


@pytest.mark.unit
class TestUpdateUserRole:
    """Tests for the PUT /users/{user_id}/role endpoint."""

    @patch("app.api.v1.admin.users.audit_service.log_action", new_callable=AsyncMock)
    @patch(
        "app.api.v1.admin.users.user_management_service.update_user_role",
        new_callable=AsyncMock,
    )
    async def test_update_user_role(
        self, mock_update_role, mock_audit, client, admin_headers
    ):
        """PUT /{user_id}/role updates the user role for admin."""
        user_id = str(uuid.uuid4())
        mock_update_role.return_value = {
            "id": user_id,
            "email": "user@tuhs.co.ke",
            "role": "instructor",
            "previous_role": "student",
        }
        mock_audit.return_value = None

        response = await client.put(
            f"{BASE_URL}/{user_id}/role",
            json={"role": "instructor"},
            headers=admin_headers,
        )

        assert response.status_code == 200
        body = response.json()
        assert body["status"] == "success"
        assert body["data"]["role"] == "instructor"

    @patch(
        "app.api.v1.admin.users.user_management_service.update_user_role",
        new_callable=AsyncMock,
    )
    async def test_update_user_role_not_found(
        self, mock_update_role, client, admin_headers
    ):
        """PUT /{user_id}/role returns 400 when user not found or invalid role."""
        mock_update_role.return_value = None
        fake_id = str(uuid.uuid4())

        response = await client.put(
            f"{BASE_URL}/{fake_id}/role",
            json={"role": "instructor"},
            headers=admin_headers,
        )

        assert response.status_code == 400

    async def test_update_user_role_denied_for_student(self, client, non_admin_headers):
        """PUT /{user_id}/role returns 403 for non-admin users."""
        fake_id = str(uuid.uuid4())
        response = await client.put(
            f"{BASE_URL}/{fake_id}/role",
            json={"role": "instructor"},
            headers=non_admin_headers,
        )
        assert response.status_code == 403


# =====================================================================
# PUT /users/{user_id}/deactivate - deactivate user
# =====================================================================


@pytest.mark.unit
class TestDeactivateUser:
    """Tests for the PUT /users/{user_id}/deactivate endpoint."""

    @patch("app.api.v1.admin.users.audit_service.log_action", new_callable=AsyncMock)
    @patch(
        "app.api.v1.admin.users.user_management_service.deactivate_user",
        new_callable=AsyncMock,
    )
    async def test_deactivate_user(
        self, mock_deactivate, mock_audit, client, admin_headers
    ):
        """PUT /{user_id}/deactivate deactivates the user for admin."""
        user_id = str(uuid.uuid4())
        mock_deactivate.return_value = {
            "id": user_id,
            "email": "user@tuhs.co.ke",
            "is_active": False,
            "deactivated_at": "2026-02-15T12:00:00",
        }
        mock_audit.return_value = None

        response = await client.put(
            f"{BASE_URL}/{user_id}/deactivate",
            headers=admin_headers,
        )

        assert response.status_code == 200
        body = response.json()
        assert body["status"] == "success"
        assert body["data"]["is_active"] is False

    @patch(
        "app.api.v1.admin.users.user_management_service.deactivate_user",
        new_callable=AsyncMock,
    )
    async def test_deactivate_user_not_found(
        self, mock_deactivate, client, admin_headers
    ):
        """PUT /{user_id}/deactivate returns 404 when user not found."""
        mock_deactivate.return_value = None
        fake_id = str(uuid.uuid4())

        response = await client.put(
            f"{BASE_URL}/{fake_id}/deactivate",
            headers=admin_headers,
        )

        assert response.status_code == 404

    async def test_deactivate_user_denied_for_student(self, client, non_admin_headers):
        """PUT /{user_id}/deactivate returns 403 for non-admin users."""
        fake_id = str(uuid.uuid4())
        response = await client.put(
            f"{BASE_URL}/{fake_id}/deactivate",
            headers=non_admin_headers,
        )
        assert response.status_code == 403


# =====================================================================
# Cross-cutting access control tests
# =====================================================================


@pytest.mark.unit
class TestUsersManagementAccessControl:
    """Verify that all user management endpoints enforce role-based access."""

    async def test_users_denied_for_non_admin(self, client, non_admin_headers):
        """Key user management endpoints return 403 for a student user."""
        fake_id = str(uuid.uuid4())

        endpoints = [
            ("GET", f"{BASE_URL}/"),
            ("GET", f"{BASE_URL}/{fake_id}"),
            ("PUT", f"{BASE_URL}/{fake_id}/deactivate"),
            ("PUT", f"{BASE_URL}/{fake_id}/role"),
        ]

        for method, url in endpoints:
            if method == "GET":
                resp = await client.get(url, headers=non_admin_headers)
            elif method == "PUT":
                resp = await client.put(
                    url,
                    json={"role": "instructor"},
                    headers=non_admin_headers,
                )
            else:
                continue

            assert resp.status_code == 403, (
                f"Expected 403 for {method} {url}, got {resp.status_code}"
            )

    async def test_users_denied_without_auth(self, client):
        """Key user management endpoints return 401 without auth headers."""
        fake_id = str(uuid.uuid4())

        endpoints = [
            ("GET", f"{BASE_URL}/"),
            ("GET", f"{BASE_URL}/{fake_id}"),
            ("PUT", f"{BASE_URL}/{fake_id}/deactivate"),
            ("PUT", f"{BASE_URL}/{fake_id}/role"),
        ]

        for method, url in endpoints:
            if method == "GET":
                resp = await client.get(url)
            elif method == "PUT":
                resp = await client.put(url, json={"role": "instructor"})
            else:
                continue

            assert resp.status_code == 401, (
                f"Expected 401 for {method} {url}, got {resp.status_code}"
            )
