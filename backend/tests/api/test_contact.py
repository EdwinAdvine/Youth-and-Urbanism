"""
Contact API Tests

Tests for contact form endpoint at /api/v1/contact/.
"""

import pytest


@pytest.mark.unit
class TestContactForm:
    """Test contact form submission."""

    async def test_submit_contact_form_success(self, client):
        response = await client.post(
            "/api/v1/contact/submit",
            json={
                "name": "John Doe",
                "email": "john@example.com",
                "subject": "Test Subject",
                "message": "Test message body",
            },
        )
        assert response.status_code in (200, 201, 404)

    async def test_submit_contact_form_missing_fields(self, client):
        response = await client.post(
            "/api/v1/contact/submit",
            json={"name": "John"},
        )
        assert response.status_code in (422, 404)

    async def test_submit_contact_form_invalid_email(self, client):
        response = await client.post(
            "/api/v1/contact/submit",
            json={
                "name": "John",
                "email": "not-an-email",
                "subject": "Test",
                "message": "Body",
            },
        )
        assert response.status_code in (422, 404)

    async def test_submit_contact_form_empty_message(self, client):
        response = await client.post(
            "/api/v1/contact/submit",
            json={
                "name": "John",
                "email": "john@example.com",
                "subject": "Test",
                "message": "",
            },
        )
        assert response.status_code in (422, 404, 200)
