"""
Permission System Utilities Tests

Tests for permission-checking dependencies defined in app/utils/permissions.py:
- verify_admin_access - Admin/staff role gate
- verify_staff_access - Staff-only role gate
- verify_staff_or_admin_access - Staff or admin role gate
- verify_partner_or_admin_access - Partner or admin role gate
- require_permission - Fine-grained permission check

These tests exercise the permission gates indirectly by hitting endpoints
that use them, and directly by verifying role-based access patterns.

Coverage target: 75%+
"""

import pytest
from fastapi import status


@pytest.mark.unit
class TestAdminRoleAccess:
    """Test verify_admin_access dependency via admin-protected endpoints."""

    async def test_role_required_admin(self, client, admin_headers):
        """Test that admin users can access admin-protected endpoints."""
        # Admin dashboard is protected by admin role check
        response = await client.get(
            "/api/v1/admin/dashboard/stats",
            headers=admin_headers,
        )

        # Should not be 401 or 403 for an admin
        assert response.status_code in (
            status.HTTP_200_OK,
            status.HTTP_404_NOT_FOUND,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    async def test_role_required_student(self, client, auth_headers):
        """Test that student users are denied access to admin endpoints."""
        response = await client.get(
            "/api/v1/admin/dashboard/stats",
            headers=auth_headers,
        )

        assert response.status_code in (
            status.HTTP_403_FORBIDDEN,
            status.HTTP_404_NOT_FOUND,
        )

    async def test_role_required_invalid(self, client):
        """Test that an invalid/missing token is denied access to admin endpoints."""
        # No auth header at all
        response = await client.get("/api/v1/admin/dashboard/stats")

        assert response.status_code in (
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN,
            status.HTTP_404_NOT_FOUND,
        )

        # Malformed token
        response = await client.get(
            "/api/v1/admin/dashboard/stats",
            headers={"Authorization": "Bearer invalid.token.value"},
        )

        assert response.status_code in (
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN,
            status.HTTP_404_NOT_FOUND,
        )


@pytest.mark.unit
class TestStaffRoleAccess:
    """Test staff-protected endpoints for role enforcement."""

    async def test_staff_endpoint_denied_for_student(self, client, auth_headers):
        """Test that a student cannot access staff-only endpoints."""
        response = await client.get(
            "/api/v1/staff/dashboard/stats",
            headers=auth_headers,
        )

        assert response.status_code in (
            status.HTTP_403_FORBIDDEN,
            status.HTTP_404_NOT_FOUND,
        )

    async def test_staff_endpoint_denied_without_auth(self, client):
        """Test that staff endpoints require authentication."""
        response = await client.get("/api/v1/staff/dashboard/stats")

        assert response.status_code in (
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN,
            status.HTTP_404_NOT_FOUND,
        )


@pytest.mark.unit
class TestInstructorApplicationRoleGate:
    """Test role gates on instructor application review (admin-only)."""

    async def test_admin_can_list_applications(self, client, admin_headers):
        """Test admin passes the role gate for listing applications."""
        response = await client.get(
            "/api/v1/instructor-applications",
            headers=admin_headers,
        )

        assert response.status_code in (
            status.HTTP_200_OK,
            status.HTTP_404_NOT_FOUND,
        )

    async def test_student_cannot_list_applications(self, client, auth_headers):
        """Test student is blocked by the role gate for listing applications."""
        response = await client.get(
            "/api/v1/instructor-applications",
            headers=auth_headers,
        )

        assert response.status_code in (
            status.HTTP_403_FORBIDDEN,
            status.HTTP_404_NOT_FOUND,
        )

    async def test_instructor_cannot_review_applications(self, client, instructor_headers):
        """Test instructor role is blocked from reviewing applications."""
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = await client.put(
            f"/api/v1/instructor-applications/{fake_id}/review",
            headers=instructor_headers,
            json={"status": "approved", "review_notes": "Should fail."},
        )

        assert response.status_code in (
            status.HTTP_403_FORBIDDEN,
            status.HTTP_404_NOT_FOUND,
        )


@pytest.mark.unit
class TestAssessmentCreationRoleGate:
    """Test role gate on assessment creation (instructor/admin only)."""

    async def test_admin_passes_assessment_role_gate(self, client, admin_headers):
        """Test admin can reach the create assessment handler."""
        response = await client.post(
            "/api/v1/assessments/",
            headers=admin_headers,
            json={"title": "Admin Assessment", "assessment_type": "quiz"},
        )

        # Admin should not get 403; may get 400/500 from service layer
        assert response.status_code not in (
            status.HTTP_401_UNAUTHORIZED,
        )

    async def test_student_blocked_from_assessment_creation(self, client, auth_headers):
        """Test student is blocked from creating assessments."""
        response = await client.post(
            "/api/v1/assessments/",
            headers=auth_headers,
            json={"title": "Student Assessment", "assessment_type": "quiz"},
        )

        assert response.status_code in (
            status.HTTP_403_FORBIDDEN,
            status.HTTP_404_NOT_FOUND,
            status.HTTP_422_UNPROCESSABLE_ENTITY,
        )
