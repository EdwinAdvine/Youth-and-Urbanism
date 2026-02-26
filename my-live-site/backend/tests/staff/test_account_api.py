"""Tests for Staff Account API endpoints"""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_get_profile(async_client: AsyncClient, staff_token: str):
    """Test GET /api/v1/staff/account/profile"""
    response = await async_client.get(
        "/api/v1/staff/account/profile",
        headers={"Authorization": f"Bearer {staff_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "email" in data
    assert "role" in data
    assert "display_name" in data


@pytest.mark.asyncio
async def test_update_profile(async_client: AsyncClient, staff_token: str):
    """Test PUT /api/v1/staff/account/profile"""
    update_data = {
        "display_name": "Updated Staff Name",
        "phone": "+254700000000",
        "bio": "Experienced support staff"
    }
    response = await async_client.put(
        "/api/v1/staff/account/profile",
        json=update_data,
        headers={"Authorization": f"Bearer {staff_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["display_name"] == "Updated Staff Name"


@pytest.mark.asyncio
async def test_get_security_settings(async_client: AsyncClient, staff_token: str):
    """Test GET /api/v1/staff/account/security"""
    response = await async_client.get(
        "/api/v1/staff/account/security",
        headers={"Authorization": f"Bearer {staff_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "two_factor_enabled" in data
    assert "last_password_change" in data


@pytest.mark.asyncio
async def test_account_unauthorized(async_client: AsyncClient):
    """Test account access without authentication"""
    response = await async_client.get("/api/v1/staff/account/profile")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_account_student_forbidden(async_client: AsyncClient, student_token: str):
    """Test staff account blocked for student role"""
    response = await async_client.get(
        "/api/v1/staff/account/profile",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert response.status_code == 403
