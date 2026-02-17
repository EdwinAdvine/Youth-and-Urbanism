"""
Tests for Partner Sponsorships API endpoints.

Endpoints under test:
    POST   /api/v1/partner/sponsorships/programs                      - Create programme
    GET    /api/v1/partner/sponsorships/programs                      - List programmes
    GET    /api/v1/partner/sponsorships/programs/{id}                 - Get programme
    PUT    /api/v1/partner/sponsorships/programs/{id}                 - Update programme
    POST   /api/v1/partner/sponsorships/programs/{id}/children        - Add children
    DELETE /api/v1/partner/sponsorships/programs/{id}/children/{sid}  - Remove child
    GET    /api/v1/partner/sponsorships/children                      - List sponsored children
    GET    /api/v1/partner/sponsorships/children/{id}/progress        - Child progress
    GET    /api/v1/partner/sponsorships/children/{id}/activity        - Child activity
    GET    /api/v1/partner/sponsorships/children/{id}/achievements    - Child achievements
    GET    /api/v1/partner/sponsorships/children/{id}/goals           - Child goals
    GET    /api/v1/partner/sponsorships/children/{id}/ai-insights     - AI insights
    POST   /api/v1/partner/sponsorships/consent/request               - Request consent
    POST   /api/v1/partner/sponsorships/consent/{id}/respond          - Respond consent
    GET    /api/v1/partner/sponsorships/consent/status                 - Consent status

The sponsorships router uses verify_partner_or_admin_access().
Service calls go through SponsorshipService and PartnerAIService.
"""

import pytest
import uuid
from unittest.mock import patch, AsyncMock, MagicMock


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
BASE_URL = "/api/v1/partner/sponsorships"
FAKE_PROGRAM_ID = str(uuid.uuid4())
FAKE_CHILD_ID = str(uuid.uuid4())
FAKE_CONSENT_ID = str(uuid.uuid4())

MOCK_PROGRAM = {
    "id": FAKE_PROGRAM_ID,
    "name": "STEM Scholarship 2026",
    "description": "Sponsoring underprivileged students",
    "budget": 500000.0,
    "currency": "KES",
    "max_children": 50,
    "status": "active",
    "enrolled_children_count": 12,
    "created_at": "2026-01-01T00:00:00",
}

MOCK_PROGRAMS_LIST = {
    "programs": [MOCK_PROGRAM],
    "total": 1,
    "page": 1,
    "page_size": 20,
}

MOCK_CHILDREN = {
    "children": [
        {
            "id": FAKE_CHILD_ID,
            "full_name": "Test Child",
            "grade_level": "5",
            "program_name": "STEM Scholarship 2026",
        }
    ],
    "total": 1,
    "page": 1,
    "page_size": 20,
}

MOCK_CHILD_PROGRESS = {
    "student_id": FAKE_CHILD_ID,
    "full_name": "Test Child",
    "course_progress": [],
    "completion_rate": 0.75,
    "grade_trends": [],
}

MOCK_ADD_CHILDREN = {
    "added": 3,
    "skipped": 0,
    "program_id": FAKE_PROGRAM_ID,
}

MOCK_CONSENT_REQUEST = {
    "id": FAKE_CONSENT_ID,
    "status": "pending",
    "sponsored_child_id": FAKE_CHILD_ID,
    "created_at": "2026-02-15T10:00:00",
}

MOCK_CONSENT_STATUS = [
    {
        "id": FAKE_CONSENT_ID,
        "status": "pending",
        "child_name": "Test Child",
    }
]


# ---------------------------------------------------------------------------
# Create Programme
# ---------------------------------------------------------------------------

@pytest.mark.unit
class TestCreateProgram:
    """Tests for POST /api/v1/partner/sponsorships/programs."""

    @patch(
        "app.api.v1.partner.sponsorships.SponsorshipService.create_program",
        new_callable=AsyncMock,
    )
    async def test_create_program_success(
        self,
        mock_create,
        client,
        partner_user,
        partner_auth_headers,
        sample_program_payload,
    ):
        """Partner receives 201 with created programme."""
        mock_create.return_value = MOCK_PROGRAM

        response = await client.post(
            f"{BASE_URL}/programs",
            json=sample_program_payload,
            headers=partner_auth_headers,
        )

        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "success"
        mock_create.assert_awaited_once()

    async def test_create_program_requires_auth(self, client, sample_program_payload):
        """Request without auth returns 401 or 403."""
        response = await client.post(
            f"{BASE_URL}/programs", json=sample_program_payload
        )
        assert response.status_code in (401, 403)

    async def test_create_program_rejects_student(
        self, client, student_user, student_auth_headers, sample_program_payload
    ):
        """Student role returns 403."""
        response = await client.post(
            f"{BASE_URL}/programs",
            json=sample_program_payload,
            headers=student_auth_headers,
        )
        assert response.status_code == 403

    async def test_create_program_validates_body(
        self, client, partner_user, partner_auth_headers
    ):
        """Missing required name field returns 422."""
        response = await client.post(
            f"{BASE_URL}/programs",
            json={"description": "No name provided"},
            headers=partner_auth_headers,
        )
        assert response.status_code == 422

    @patch(
        "app.api.v1.partner.sponsorships.SponsorshipService.create_program",
        new_callable=AsyncMock,
    )
    async def test_create_program_admin_access(
        self,
        mock_create,
        client,
        admin_user,
        admin_auth_headers,
        sample_program_payload,
    ):
        """Admin role can also create programmes."""
        mock_create.return_value = MOCK_PROGRAM

        response = await client.post(
            f"{BASE_URL}/programs",
            json=sample_program_payload,
            headers=admin_auth_headers,
        )

        assert response.status_code == 201

    @patch(
        "app.api.v1.partner.sponsorships.SponsorshipService.create_program",
        new_callable=AsyncMock,
        side_effect=Exception("DB error"),
    )
    async def test_create_program_service_error(
        self,
        mock_create,
        client,
        partner_user,
        partner_auth_headers,
        sample_program_payload,
    ):
        """Service error returns 500."""
        response = await client.post(
            f"{BASE_URL}/programs",
            json=sample_program_payload,
            headers=partner_auth_headers,
        )
        assert response.status_code == 500


# ---------------------------------------------------------------------------
# List Programmes
# ---------------------------------------------------------------------------

@pytest.mark.unit
class TestListPrograms:
    """Tests for GET /api/v1/partner/sponsorships/programs."""

    @patch(
        "app.api.v1.partner.sponsorships.SponsorshipService.list_programs",
        new_callable=AsyncMock,
    )
    async def test_list_programs_success(
        self, mock_list, client, partner_user, partner_auth_headers
    ):
        """Partner receives 200 with programme list."""
        mock_list.return_value = MOCK_PROGRAMS_LIST

        response = await client.get(
            f"{BASE_URL}/programs", headers=partner_auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert "data" in data

    @patch(
        "app.api.v1.partner.sponsorships.SponsorshipService.list_programs",
        new_callable=AsyncMock,
    )
    async def test_list_programs_with_pagination(
        self, mock_list, client, partner_user, partner_auth_headers
    ):
        """Custom pagination parameters are accepted."""
        mock_list.return_value = MOCK_PROGRAMS_LIST

        response = await client.get(
            f"{BASE_URL}/programs?page=2&page_size=5",
            headers=partner_auth_headers,
        )

        assert response.status_code == 200

    async def test_list_programs_requires_auth(self, client):
        """Request without auth returns 401 or 403."""
        response = await client.get(f"{BASE_URL}/programs")
        assert response.status_code in (401, 403)

    async def test_list_programs_rejects_student(
        self, client, student_user, student_auth_headers
    ):
        """Student role returns 403."""
        response = await client.get(
            f"{BASE_URL}/programs", headers=student_auth_headers
        )
        assert response.status_code == 403


# ---------------------------------------------------------------------------
# Get Programme
# ---------------------------------------------------------------------------

@pytest.mark.unit
class TestGetProgram:
    """Tests for GET /api/v1/partner/sponsorships/programs/{program_id}."""

    @patch(
        "app.api.v1.partner.sponsorships.SponsorshipService.get_program",
        new_callable=AsyncMock,
    )
    async def test_get_program_success(
        self, mock_get, client, partner_user, partner_auth_headers
    ):
        """Partner receives 200 with programme detail."""
        mock_get.return_value = MOCK_PROGRAM

        response = await client.get(
            f"{BASE_URL}/programs/{FAKE_PROGRAM_ID}",
            headers=partner_auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"

    @patch(
        "app.api.v1.partner.sponsorships.SponsorshipService.get_program",
        new_callable=AsyncMock,
        return_value=None,
    )
    async def test_get_program_not_found(
        self, mock_get, client, partner_user, partner_auth_headers
    ):
        """Non-existent programme returns 404."""
        response = await client.get(
            f"{BASE_URL}/programs/{FAKE_PROGRAM_ID}",
            headers=partner_auth_headers,
        )
        assert response.status_code == 404

    async def test_get_program_requires_auth(self, client):
        """Request without auth returns 401 or 403."""
        response = await client.get(f"{BASE_URL}/programs/{FAKE_PROGRAM_ID}")
        assert response.status_code in (401, 403)


# ---------------------------------------------------------------------------
# Update Programme
# ---------------------------------------------------------------------------

@pytest.mark.unit
class TestUpdateProgram:
    """Tests for PUT /api/v1/partner/sponsorships/programs/{program_id}."""

    @patch(
        "app.api.v1.partner.sponsorships.SponsorshipService.update_program",
        new_callable=AsyncMock,
    )
    async def test_update_program_success(
        self,
        mock_update,
        client,
        partner_user,
        partner_auth_headers,
        sample_update_program_payload,
    ):
        """Partner receives 200 with updated programme."""
        mock_update.return_value = {**MOCK_PROGRAM, **sample_update_program_payload}

        response = await client.put(
            f"{BASE_URL}/programs/{FAKE_PROGRAM_ID}",
            json=sample_update_program_payload,
            headers=partner_auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"

    @patch(
        "app.api.v1.partner.sponsorships.SponsorshipService.update_program",
        new_callable=AsyncMock,
        return_value=None,
    )
    async def test_update_program_not_found(
        self, mock_update, client, partner_user, partner_auth_headers
    ):
        """Updating a non-existent programme returns 404."""
        response = await client.put(
            f"{BASE_URL}/programs/{FAKE_PROGRAM_ID}",
            json={"name": "Updated"},
            headers=partner_auth_headers,
        )
        assert response.status_code == 404

    async def test_update_program_requires_auth(self, client):
        """Request without auth returns 401 or 403."""
        response = await client.put(
            f"{BASE_URL}/programs/{FAKE_PROGRAM_ID}",
            json={"name": "Updated"},
        )
        assert response.status_code in (401, 403)


# ---------------------------------------------------------------------------
# Add Children to Programme
# ---------------------------------------------------------------------------

@pytest.mark.unit
class TestAddChildren:
    """Tests for POST /api/v1/partner/sponsorships/programs/{id}/children."""

    @patch(
        "app.api.v1.partner.sponsorships.SponsorshipService.add_children",
        new_callable=AsyncMock,
    )
    async def test_add_children_success(
        self, mock_add, client, partner_user, partner_auth_headers
    ):
        """Partner receives 201 when adding children."""
        mock_add.return_value = MOCK_ADD_CHILDREN

        response = await client.post(
            f"{BASE_URL}/programs/{FAKE_PROGRAM_ID}/children",
            json={"student_ids": ["s1", "s2", "s3"]},
            headers=partner_auth_headers,
        )

        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "success"

    async def test_add_children_requires_auth(self, client):
        """Request without auth returns 401 or 403."""
        response = await client.post(
            f"{BASE_URL}/programs/{FAKE_PROGRAM_ID}/children",
            json={"student_ids": ["s1"]},
        )
        assert response.status_code in (401, 403)

    async def test_add_children_validates_body(
        self, client, partner_user, partner_auth_headers
    ):
        """Missing student_ids returns 422."""
        response = await client.post(
            f"{BASE_URL}/programs/{FAKE_PROGRAM_ID}/children",
            json={},
            headers=partner_auth_headers,
        )
        assert response.status_code == 422


# ---------------------------------------------------------------------------
# Remove Child from Programme
# ---------------------------------------------------------------------------

@pytest.mark.unit
class TestRemoveChild:
    """Tests for DELETE /api/v1/partner/sponsorships/programs/{id}/children/{sid}."""

    @patch(
        "app.api.v1.partner.sponsorships.SponsorshipService.remove_child",
        new_callable=AsyncMock,
    )
    async def test_remove_child_success(
        self, mock_remove, client, partner_user, partner_auth_headers
    ):
        """Partner receives 200 when removing a child."""
        mock_remove.return_value = True

        response = await client.delete(
            f"{BASE_URL}/programs/{FAKE_PROGRAM_ID}/children/{FAKE_CHILD_ID}",
            headers=partner_auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"

    @patch(
        "app.api.v1.partner.sponsorships.SponsorshipService.remove_child",
        new_callable=AsyncMock,
        return_value=False,
    )
    async def test_remove_child_not_found(
        self, mock_remove, client, partner_user, partner_auth_headers
    ):
        """Removing a non-existent child returns 404."""
        response = await client.delete(
            f"{BASE_URL}/programs/{FAKE_PROGRAM_ID}/children/{FAKE_CHILD_ID}",
            headers=partner_auth_headers,
        )
        assert response.status_code == 404

    async def test_remove_child_requires_auth(self, client):
        """Request without auth returns 401 or 403."""
        response = await client.delete(
            f"{BASE_URL}/programs/{FAKE_PROGRAM_ID}/children/{FAKE_CHILD_ID}"
        )
        assert response.status_code in (401, 403)


# ---------------------------------------------------------------------------
# List Sponsored Children
# ---------------------------------------------------------------------------

@pytest.mark.unit
class TestListSponsoredChildren:
    """Tests for GET /api/v1/partner/sponsorships/children."""

    @patch(
        "app.api.v1.partner.sponsorships.SponsorshipService.list_children",
        new_callable=AsyncMock,
    )
    async def test_list_children_success(
        self, mock_list, client, partner_user, partner_auth_headers
    ):
        """Partner receives 200 with children list."""
        mock_list.return_value = MOCK_CHILDREN

        response = await client.get(
            f"{BASE_URL}/children", headers=partner_auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"

    async def test_list_children_requires_auth(self, client):
        """Request without auth returns 401 or 403."""
        response = await client.get(f"{BASE_URL}/children")
        assert response.status_code in (401, 403)

    async def test_list_children_rejects_student(
        self, client, student_user, student_auth_headers
    ):
        """Student role returns 403."""
        response = await client.get(
            f"{BASE_URL}/children", headers=student_auth_headers
        )
        assert response.status_code == 403


# ---------------------------------------------------------------------------
# Child Progress
# ---------------------------------------------------------------------------

@pytest.mark.unit
class TestChildProgress:
    """Tests for GET /api/v1/partner/sponsorships/children/{id}/progress."""

    @patch(
        "app.api.v1.partner.sponsorships.SponsorshipService.get_child_progress",
        new_callable=AsyncMock,
    )
    async def test_child_progress_success(
        self, mock_progress, client, partner_user, partner_auth_headers
    ):
        """Partner receives 200 with child progress."""
        mock_progress.return_value = MOCK_CHILD_PROGRESS

        response = await client.get(
            f"{BASE_URL}/children/{FAKE_CHILD_ID}/progress",
            headers=partner_auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"

    @patch(
        "app.api.v1.partner.sponsorships.SponsorshipService.get_child_progress",
        new_callable=AsyncMock,
        return_value=None,
    )
    async def test_child_progress_not_found(
        self, mock_progress, client, partner_user, partner_auth_headers
    ):
        """Non-existent child returns 404."""
        response = await client.get(
            f"{BASE_URL}/children/{FAKE_CHILD_ID}/progress",
            headers=partner_auth_headers,
        )
        assert response.status_code == 404

    async def test_child_progress_requires_auth(self, client):
        """Request without auth returns 401 or 403."""
        response = await client.get(
            f"{BASE_URL}/children/{FAKE_CHILD_ID}/progress"
        )
        assert response.status_code in (401, 403)


# ---------------------------------------------------------------------------
# Consent Request
# ---------------------------------------------------------------------------

@pytest.mark.unit
class TestConsentRequest:
    """Tests for POST /api/v1/partner/sponsorships/consent/request."""

    @patch(
        "app.api.v1.partner.sponsorships.SponsorshipService.request_consent",
        new_callable=AsyncMock,
    )
    async def test_request_consent_success(
        self, mock_consent, client, partner_user, partner_auth_headers
    ):
        """Partner receives 201 with consent request."""
        mock_consent.return_value = MOCK_CONSENT_REQUEST

        response = await client.post(
            f"{BASE_URL}/consent/request",
            json={"sponsored_child_id": FAKE_CHILD_ID},
            headers=partner_auth_headers,
        )

        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "success"

    async def test_request_consent_requires_auth(self, client):
        """Request without auth returns 401 or 403."""
        response = await client.post(
            f"{BASE_URL}/consent/request",
            json={"sponsored_child_id": FAKE_CHILD_ID},
        )
        assert response.status_code in (401, 403)

    async def test_request_consent_validates_body(
        self, client, partner_user, partner_auth_headers
    ):
        """Missing sponsored_child_id returns 422."""
        response = await client.post(
            f"{BASE_URL}/consent/request",
            json={},
            headers=partner_auth_headers,
        )
        assert response.status_code == 422


# ---------------------------------------------------------------------------
# Consent Respond
# ---------------------------------------------------------------------------

@pytest.mark.unit
class TestConsentRespond:
    """Tests for POST /api/v1/partner/sponsorships/consent/{id}/respond."""

    @patch(
        "app.api.v1.partner.sponsorships.SponsorshipService.respond_to_consent",
        new_callable=AsyncMock,
    )
    async def test_respond_consent_success(
        self, mock_respond, client, partner_user, partner_auth_headers
    ):
        """Successful consent response returns 200."""
        mock_respond.return_value = {
            "id": FAKE_CONSENT_ID,
            "status": "approved",
        }

        response = await client.post(
            f"{BASE_URL}/consent/{FAKE_CONSENT_ID}/respond",
            json={"agreed": True},
            headers=partner_auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"

    @patch(
        "app.api.v1.partner.sponsorships.SponsorshipService.respond_to_consent",
        new_callable=AsyncMock,
        return_value=None,
    )
    async def test_respond_consent_not_found(
        self, mock_respond, client, partner_user, partner_auth_headers
    ):
        """Non-existent consent request returns 404."""
        response = await client.post(
            f"{BASE_URL}/consent/{FAKE_CONSENT_ID}/respond",
            json={"agreed": True},
            headers=partner_auth_headers,
        )
        assert response.status_code == 404


# ---------------------------------------------------------------------------
# Consent Status
# ---------------------------------------------------------------------------

@pytest.mark.unit
class TestConsentStatus:
    """Tests for GET /api/v1/partner/sponsorships/consent/status."""

    @patch(
        "app.api.v1.partner.sponsorships.SponsorshipService.get_consent_status",
        new_callable=AsyncMock,
    )
    async def test_consent_status_success(
        self, mock_status, client, partner_user, partner_auth_headers
    ):
        """Partner receives 200 with consent status list."""
        mock_status.return_value = MOCK_CONSENT_STATUS

        response = await client.get(
            f"{BASE_URL}/consent/status", headers=partner_auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"

    async def test_consent_status_requires_auth(self, client):
        """Request without auth returns 401 or 403."""
        response = await client.get(f"{BASE_URL}/consent/status")
        assert response.status_code in (401, 403)

    async def test_consent_status_rejects_student(
        self, client, student_user, student_auth_headers
    ):
        """Student role returns 403."""
        response = await client.get(
            f"{BASE_URL}/consent/status", headers=student_auth_headers
        )
        assert response.status_code == 403
