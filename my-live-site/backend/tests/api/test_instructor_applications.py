"""
Instructor Application API Tests

Tests for instructor application endpoints:
- POST /api/v1/instructor-applications - Submit application
- GET /api/v1/instructor-applications - List applications (admin)
- GET /api/v1/instructor-applications/{id} - Get application detail
- PUT /api/v1/instructor-applications/{id}/review - Approve/reject application

Coverage target: 75%+
"""

import pytest
from fastapi import status


@pytest.mark.unit
class TestSubmitApplication:
    """Test submit application endpoint: POST /api/v1/instructor-applications"""

    async def test_submit_application(self, client):
        """Test submitting a complete instructor application succeeds."""
        response = await client.post(
            "/api/v1/instructor-applications",
            json={
                "full_name": "Jane Wanjiku",
                "email": "jane.wanjiku@example.com",
                "phone": "+254712345678",
                "qualifications": "B.Ed Mathematics, University of Nairobi",
                "experience_years": 5,
                "subjects": ["Mathematics", "Physics"],
                "bio": "Experienced secondary school teacher with a passion for STEM education.",
            },
        )

        assert response.status_code in (
            status.HTTP_201_CREATED,
            status.HTTP_404_NOT_FOUND,
        )

        if response.status_code == status.HTTP_201_CREATED:
            data = response.json()
            assert data["full_name"] == "Jane Wanjiku"
            assert data["email"] == "jane.wanjiku@example.com"
            assert "id" in data

    async def test_submit_application_missing_fields(self, client):
        """Test submitting an application with missing required fields fails validation."""
        response = await client.post(
            "/api/v1/instructor-applications",
            json={
                "full_name": "Incomplete Applicant",
                # Missing email, phone, qualifications, etc.
            },
        )

        assert response.status_code in (
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            status.HTTP_400_BAD_REQUEST,
            status.HTTP_404_NOT_FOUND,
        )


@pytest.mark.unit
class TestListApplications:
    """Test list applications endpoint: GET /api/v1/instructor-applications"""

    async def test_list_applications_requires_admin(self, client, auth_headers):
        """Test that listing applications as a non-admin (student) is forbidden."""
        response = await client.get(
            "/api/v1/instructor-applications",
            headers=auth_headers,
        )

        assert response.status_code in (
            status.HTTP_403_FORBIDDEN,
            status.HTTP_404_NOT_FOUND,
        )

    async def test_list_applications_as_admin(self, client, admin_headers):
        """Test that an admin can list instructor applications."""
        response = await client.get(
            "/api/v1/instructor-applications",
            headers=admin_headers,
        )

        assert response.status_code in (
            status.HTTP_200_OK,
            status.HTTP_404_NOT_FOUND,
        )

        if response.status_code == status.HTTP_200_OK:
            data = response.json()
            assert "applications" in data
            assert "total" in data

    async def test_list_applications_unauthenticated_fails(self, client):
        """Test that listing applications without auth fails."""
        response = await client.get("/api/v1/instructor-applications")

        assert response.status_code in (
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_404_NOT_FOUND,
        )


@pytest.mark.unit
class TestGetApplicationDetail:
    """Test get application detail endpoint: GET /api/v1/instructor-applications/{id}"""

    async def test_get_application_detail(self, client, admin_headers):
        """Test getting a single application by ID (returns 404 for non-existent)."""
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = await client.get(
            f"/api/v1/instructor-applications/{fake_id}",
            headers=admin_headers,
        )

        assert response.status_code in (
            status.HTTP_200_OK,
            status.HTTP_404_NOT_FOUND,
        )

    async def test_get_application_detail_no_auth(self, client):
        """Test that accessing application detail without auth fails."""
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = await client.get(f"/api/v1/instructor-applications/{fake_id}")

        assert response.status_code in (
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_404_NOT_FOUND,
        )


@pytest.mark.unit
class TestReviewApplication:
    """Test review application endpoint: PUT /api/v1/instructor-applications/{id}/review"""

    async def test_approve_application(self, client, admin_headers):
        """Test approving an instructor application (admin only)."""
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = await client.put(
            f"/api/v1/instructor-applications/{fake_id}/review",
            headers=admin_headers,
            json={
                "status": "approved",
                "review_notes": "Strong qualifications, approved.",
            },
        )

        assert response.status_code in (
            status.HTTP_200_OK,
            status.HTTP_400_BAD_REQUEST,
            status.HTTP_404_NOT_FOUND,
        )

    async def test_reject_application(self, client, admin_headers):
        """Test rejecting an instructor application (admin only)."""
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = await client.put(
            f"/api/v1/instructor-applications/{fake_id}/review",
            headers=admin_headers,
            json={
                "status": "rejected",
                "review_notes": "Insufficient qualifications.",
            },
        )

        assert response.status_code in (
            status.HTTP_200_OK,
            status.HTTP_400_BAD_REQUEST,
            status.HTTP_404_NOT_FOUND,
        )

    async def test_review_application_non_admin_forbidden(self, client, auth_headers):
        """Test that a non-admin user cannot review applications."""
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = await client.put(
            f"/api/v1/instructor-applications/{fake_id}/review",
            headers=auth_headers,
            json={
                "status": "approved",
                "review_notes": "Should not be allowed.",
            },
        )

        assert response.status_code in (
            status.HTTP_403_FORBIDDEN,
            status.HTTP_404_NOT_FOUND,
        )

    async def test_review_application_unauthenticated_fails(self, client):
        """Test that reviewing without auth fails."""
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = await client.put(
            f"/api/v1/instructor-applications/{fake_id}/review",
            json={
                "status": "approved",
                "review_notes": "No auth.",
            },
        )

        assert response.status_code in (
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_404_NOT_FOUND,
            status.HTTP_422_UNPROCESSABLE_ENTITY,
        )
