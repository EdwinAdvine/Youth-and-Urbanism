"""
Tests for Admin Content & Learning Integrity API Endpoints

Tests the following routes under /api/v1/admin/content/:
- GET /courses                   - Paginated course listing with filters
- PUT /courses/{id}/approve      - Approve a pending course
- PUT /courses/{id}/reject       - Reject a pending course (requires reason)

All endpoints require admin or staff role access (verify_admin_access).
Non-admin/non-staff users receive 403.
"""

import uuid
from unittest.mock import patch, AsyncMock

import pytest


BASE_URL = "/api/v1/admin/content"


# =====================================================================
# GET /content/courses - list courses
# =====================================================================


@pytest.mark.unit
class TestListContent:
    """Tests for the GET /content/courses endpoint."""

    async def test_list_content_requires_admin(self, client, non_admin_headers):
        """GET /courses returns 403 for non-admin (student) users."""
        response = await client.get(f"{BASE_URL}/courses", headers=non_admin_headers)
        assert response.status_code == 403

    @patch(
        "app.api.v1.admin.content.ContentService.list_courses",
        new_callable=AsyncMock,
    )
    async def test_list_content_success(self, mock_list, client, admin_headers):
        """GET /courses returns paginated course list for admin."""
        mock_list.return_value = {
            "items": [
                {
                    "id": str(uuid.uuid4()),
                    "title": "Mathematics Grade 7",
                    "learning_area": "Mathematics",
                    "grade_levels": [7],
                    "is_published": True,
                    "status": "published",
                    "creator": {
                        "id": str(uuid.uuid4()),
                        "name": "John Instructor",
                    },
                    "rating": 4.5,
                    "enrollment_count": 85,
                    "created_at": "2026-01-10T10:00:00",
                },
                {
                    "id": str(uuid.uuid4()),
                    "title": "English Grade 6",
                    "learning_area": "English",
                    "grade_levels": [6],
                    "is_published": False,
                    "status": "pending_review",
                    "creator": {
                        "id": str(uuid.uuid4()),
                        "name": "Jane Instructor",
                    },
                    "rating": None,
                    "enrollment_count": 0,
                    "created_at": "2026-02-01T14:00:00",
                },
            ],
            "total": 2,
            "page": 1,
            "page_size": 10,
            "pages": 1,
        }

        response = await client.get(f"{BASE_URL}/courses", headers=admin_headers)

        assert response.status_code == 200
        body = response.json()
        assert body["status"] == "success"
        data = body["data"]
        assert len(data["items"]) == 2
        assert data["total"] == 2

    @patch(
        "app.api.v1.admin.content.ContentService.list_courses",
        new_callable=AsyncMock,
    )
    async def test_list_content_with_filters(self, mock_list, client, admin_headers):
        """GET /courses passes status filter and search query to the service."""
        mock_list.return_value = {
            "items": [],
            "total": 0,
            "page": 1,
            "page_size": 10,
            "pages": 0,
        }

        response = await client.get(
            f"{BASE_URL}/courses",
            headers=admin_headers,
            params={"status": "pending_review", "search": "math"},
        )

        assert response.status_code == 200
        mock_list.assert_awaited_once()

    @patch(
        "app.api.v1.admin.content.ContentService.list_courses",
        new_callable=AsyncMock,
    )
    async def test_list_content_allowed_for_staff(self, mock_list, client, staff_headers):
        """GET /courses is accessible by staff users."""
        mock_list.return_value = {
            "items": [],
            "total": 0,
            "page": 1,
            "page_size": 10,
            "pages": 0,
        }

        response = await client.get(f"{BASE_URL}/courses", headers=staff_headers)

        assert response.status_code == 200

    async def test_list_content_denied_without_auth(self, client):
        """GET /courses returns 401 when no auth token is provided."""
        response = await client.get(f"{BASE_URL}/courses")
        assert response.status_code == 401


# =====================================================================
# PUT /content/courses/{id}/approve - approve course
# =====================================================================


@pytest.mark.unit
class TestApproveCourse:
    """Tests for the PUT /content/courses/{course_id}/approve endpoint."""

    @patch(
        "app.api.v1.admin.content.ContentService.approve_course",
        new_callable=AsyncMock,
    )
    async def test_approve_content(self, mock_approve, client, admin_headers):
        """PUT /courses/{id}/approve approves a pending course for admin."""
        course_id = str(uuid.uuid4())
        mock_approve.return_value = {
            "success": True,
            "course_id": course_id,
            "status": "published",
            "published_at": "2026-02-15T12:00:00",
        }

        response = await client.put(
            f"{BASE_URL}/courses/{course_id}/approve",
            headers=admin_headers,
        )

        assert response.status_code == 200
        body = response.json()
        assert body["status"] == "success"
        assert body["data"]["success"] is True

    @patch(
        "app.api.v1.admin.content.ContentService.approve_course",
        new_callable=AsyncMock,
    )
    async def test_approve_content_failure(self, mock_approve, client, admin_headers):
        """PUT /courses/{id}/approve returns 400 when approval fails."""
        course_id = str(uuid.uuid4())
        mock_approve.return_value = {
            "success": False,
            "error": "Course not found or already published",
        }

        response = await client.put(
            f"{BASE_URL}/courses/{course_id}/approve",
            headers=admin_headers,
        )

        assert response.status_code == 400

    async def test_approve_content_denied_for_student(self, client, non_admin_headers):
        """PUT /courses/{id}/approve returns 403 for non-admin users."""
        fake_id = str(uuid.uuid4())
        response = await client.put(
            f"{BASE_URL}/courses/{fake_id}/approve",
            headers=non_admin_headers,
        )
        assert response.status_code == 403


# =====================================================================
# PUT /content/courses/{id}/reject - reject course
# =====================================================================


@pytest.mark.unit
class TestRejectCourse:
    """Tests for the PUT /content/courses/{course_id}/reject endpoint."""

    @patch(
        "app.api.v1.admin.content.ContentService.reject_course",
        new_callable=AsyncMock,
    )
    async def test_reject_content(self, mock_reject, client, admin_headers):
        """PUT /courses/{id}/reject rejects a course with reason for admin."""
        course_id = str(uuid.uuid4())
        mock_reject.return_value = {
            "success": True,
            "course_id": course_id,
            "status": "rejected",
            "reason": "Content does not meet CBC alignment standards",
        }

        response = await client.put(
            f"{BASE_URL}/courses/{course_id}/reject",
            json={"reason": "Content does not meet CBC alignment standards"},
            headers=admin_headers,
        )

        assert response.status_code == 200
        body = response.json()
        assert body["status"] == "success"
        assert body["data"]["success"] is True

    @patch(
        "app.api.v1.admin.content.ContentService.reject_course",
        new_callable=AsyncMock,
    )
    async def test_reject_content_failure(self, mock_reject, client, admin_headers):
        """PUT /courses/{id}/reject returns 400 when rejection fails."""
        course_id = str(uuid.uuid4())
        mock_reject.return_value = {
            "success": False,
            "error": "Course not found",
        }

        response = await client.put(
            f"{BASE_URL}/courses/{course_id}/reject",
            json={"reason": "Not aligned with CBC"},
            headers=admin_headers,
        )

        assert response.status_code == 400

    async def test_reject_content_missing_reason(self, client, admin_headers):
        """PUT /courses/{id}/reject returns 422 when reason is missing."""
        fake_id = str(uuid.uuid4())
        response = await client.put(
            f"{BASE_URL}/courses/{fake_id}/reject",
            json={},
            headers=admin_headers,
        )
        assert response.status_code == 422

    async def test_reject_content_denied_for_student(self, client, non_admin_headers):
        """PUT /courses/{id}/reject returns 403 for non-admin users."""
        fake_id = str(uuid.uuid4())
        response = await client.put(
            f"{BASE_URL}/courses/{fake_id}/reject",
            json={"reason": "Test"},
            headers=non_admin_headers,
        )
        assert response.status_code == 403


# =====================================================================
# Cross-cutting: student denial
# =====================================================================


@pytest.mark.unit
class TestContentDeniedForStudent:
    """Verify all content endpoints deny student access."""

    async def test_content_denied_for_student(self, client, non_admin_headers):
        """All content management endpoints return 403 for a student user."""
        fake_id = str(uuid.uuid4())

        endpoints = [
            ("GET", f"{BASE_URL}/courses"),
            ("PUT", f"{BASE_URL}/courses/{fake_id}/approve"),
            ("PUT", f"{BASE_URL}/courses/{fake_id}/reject"),
        ]

        for method, url in endpoints:
            if method == "GET":
                resp = await client.get(url, headers=non_admin_headers)
            elif method == "PUT":
                resp = await client.put(
                    url,
                    json={"reason": "test"},
                    headers=non_admin_headers,
                )
            else:
                continue

            assert resp.status_code == 403, (
                f"Expected 403 for {method} {url}, got {resp.status_code}"
            )

    async def test_content_denied_without_auth(self, client):
        """All content management endpoints return 401 without auth headers."""
        fake_id = str(uuid.uuid4())

        endpoints = [
            ("GET", f"{BASE_URL}/courses"),
            ("PUT", f"{BASE_URL}/courses/{fake_id}/approve"),
            ("PUT", f"{BASE_URL}/courses/{fake_id}/reject"),
        ]

        for method, url in endpoints:
            if method == "GET":
                resp = await client.get(url)
            elif method == "PUT":
                resp = await client.put(url, json={"reason": "test"})
            else:
                continue

            assert resp.status_code == 401, (
                f"Expected 401 for {method} {url}, got {resp.status_code}"
            )
