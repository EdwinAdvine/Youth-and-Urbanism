"""Tests for Staff Student Journeys API endpoints"""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_at_risk_learners(async_client: AsyncClient, staff_token: str):
    """Test GET /api/v1/staff/students/at-risk"""
    response = await async_client.get(
        "/api/v1/staff/students/at-risk",
        headers={"Authorization": f"Bearer {staff_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "data" in data


@pytest.mark.asyncio
async def test_list_at_risk_with_filters(async_client: AsyncClient, staff_token: str):
    """Test GET /api/v1/staff/students/at-risk with query filters"""
    response = await async_client.get(
        "/api/v1/staff/students/at-risk?grade_level=5&risk_level=high&page=1&page_size=10",
        headers={"Authorization": f"Bearer {staff_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"


@pytest.mark.asyncio
async def test_get_student_journey(async_client: AsyncClient, staff_token: str):
    """Test GET /api/v1/staff/students/{student_id}/journey"""
    response = await async_client.get(
        "/api/v1/staff/students/student-test-123/journey",
        headers={"Authorization": f"Bearer {staff_token}"}
    )
    # 200 if student exists, 404 if not found
    assert response.status_code in (200, 404)


@pytest.mark.asyncio
async def test_get_student_progress_card(async_client: AsyncClient, staff_token: str):
    """Test GET /api/v1/staff/students/{student_id}/progress"""
    response = await async_client.get(
        "/api/v1/staff/students/student-test-123/progress",
        headers={"Authorization": f"Bearer {staff_token}"}
    )
    # 200 if student exists, 404 if not found
    assert response.status_code in (200, 404)


@pytest.mark.asyncio
async def test_list_families(async_client: AsyncClient, staff_token: str):
    """Test GET /api/v1/staff/students/families"""
    response = await async_client.get(
        "/api/v1/staff/students/families",
        headers={"Authorization": f"Bearer {staff_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "data" in data


@pytest.mark.asyncio
async def test_get_family_detail(async_client: AsyncClient, staff_token: str):
    """Test GET /api/v1/staff/students/families/{family_id}"""
    response = await async_client.get(
        "/api/v1/staff/students/families/family-test-123",
        headers={"Authorization": f"Bearer {staff_token}"}
    )
    # 200 if family exists, 404 if not found
    assert response.status_code in (200, 404)


@pytest.mark.asyncio
async def test_add_case_note(async_client: AsyncClient, staff_token: str):
    """Test POST /api/v1/staff/students/families/{family_id}/notes"""
    note_data = {
        "content": "Follow-up call completed. Parent confirmed attendance.",
        "note_type": "follow_up"
    }
    response = await async_client.post(
        "/api/v1/staff/students/families/family-test-123/notes",
        json=note_data,
        headers={"Authorization": f"Bearer {staff_token}"}
    )
    # 201 if family exists, 404 if not found
    assert response.status_code in (201, 404)


@pytest.mark.asyncio
async def test_student_journeys_unauthorized(async_client: AsyncClient):
    """Test student journeys access without authentication"""
    response = await async_client.get("/api/v1/staff/students/at-risk")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_student_journeys_student_forbidden(async_client: AsyncClient, student_token: str):
    """Test staff student journeys blocked for student role"""
    response = await async_client.get(
        "/api/v1/staff/students/at-risk",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_families_unauthorized(async_client: AsyncClient):
    """Test families listing without authentication"""
    response = await async_client.get("/api/v1/staff/students/families")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_families_student_forbidden(async_client: AsyncClient, student_token: str):
    """Test families listing blocked for student role"""
    response = await async_client.get(
        "/api/v1/staff/students/families",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert response.status_code == 403
