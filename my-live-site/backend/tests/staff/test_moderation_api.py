"""Tests for Content Moderation API"""
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_list_moderation_queue(async_client: AsyncClient, staff_token: str):
    """Test GET /api/v1/staff/moderation/queue"""
    response = await async_client.get(
        "/api/v1/staff/moderation/queue",
        headers={"Authorization": f"Bearer {staff_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "items" in data

@pytest.mark.asyncio
async def test_review_item(async_client: AsyncClient, staff_token: str):
    """Test POST /api/v1/staff/moderation/review"""
    review_data = {
        "item_id": "item-123",
        "decision": "approved",
        "notes": "Looks good"
    }
    response = await async_client.post(
        "/api/v1/staff/moderation/review",
        json=review_data,
        headers={"Authorization": f"Bearer {staff_token}"}
    )
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_bulk_moderation(async_client: AsyncClient, staff_token: str):
    """Test POST /api/v1/staff/moderation/bulk"""
    bulk_data = {
        "item_ids": ["item-1", "item-2", "item-3"],
        "action": "approve"
    }
    response = await async_client.post(
        "/api/v1/staff/moderation/bulk",
        json=bulk_data,
        headers={"Authorization": f"Bearer {staff_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["processed"] == 3
