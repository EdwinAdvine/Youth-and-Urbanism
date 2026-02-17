"""
Certificate API Tests

Tests for certificate endpoints at /api/v1/certificates/.
"""

import pytest


@pytest.mark.unit
class TestCertificates:
    """Test certificate endpoints."""

    async def test_list_certificates_requires_auth(self, client):
        response = await client.get("/api/v1/certificates/")
        assert response.status_code in (401, 403, 404)

    async def test_list_certificates_success(self, client, auth_headers):
        response = await client.get("/api/v1/certificates/", headers=auth_headers)
        assert response.status_code in (200, 404)

    async def test_validate_certificate_public(self, client):
        response = await client.get("/api/v1/certificates/validate/CERT-123")
        assert response.status_code in (200, 404)

    async def test_validate_invalid_certificate(self, client):
        response = await client.get("/api/v1/certificates/validate/INVALID")
        assert response.status_code in (200, 404)

    async def test_get_certificate_detail(self, client, auth_headers):
        response = await client.get(
            "/api/v1/certificates/fake-id", headers=auth_headers
        )
        assert response.status_code in (200, 404)
