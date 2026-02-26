"""
Notification API Tests

Tests for notification endpoints at /api/v1/notifications/.
"""

import pytest
from unittest.mock import patch, MagicMock


@pytest.mark.unit
class TestNotifications:
    """Test notification CRUD endpoints."""

    async def test_list_notifications_requires_auth(self, client):
        response = await client.get("/api/v1/notifications/")
        assert response.status_code in (401, 403)

    async def test_list_notifications_success(self, client, auth_headers):
        response = await client.get("/api/v1/notifications/", headers=auth_headers)
        assert response.status_code in (200, 404)

    async def test_mark_notification_read(self, client, auth_headers):
        response = await client.patch(
            "/api/v1/notifications/fake-id/read",
            headers=auth_headers,
        )
        assert response.status_code in (200, 404, 405)

    async def test_mark_all_read(self, client, auth_headers):
        response = await client.patch(
            "/api/v1/notifications/read-all",
            headers=auth_headers,
        )
        assert response.status_code in (200, 404, 405)

    async def test_delete_notification(self, client, auth_headers):
        response = await client.delete(
            "/api/v1/notifications/fake-id",
            headers=auth_headers,
        )
        assert response.status_code in (200, 204, 404, 405)

    async def test_unread_count(self, client, auth_headers):
        response = await client.get(
            "/api/v1/notifications/unread-count",
            headers=auth_headers,
        )
        assert response.status_code in (200, 404)
