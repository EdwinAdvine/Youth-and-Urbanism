"""Tests for Staff Assessment Builder API endpoints"""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_get_templates(async_client: AsyncClient, staff_token: str):
    """Test GET /api/v1/staff/assessment-builder/templates"""
    response = await async_client.get(
        "/api/v1/staff/assessment-builder/templates",
        headers={"Authorization": f"Bearer {staff_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "templates" in data
    assert isinstance(data["templates"], list)


@pytest.mark.asyncio
async def test_list_assessments(async_client: AsyncClient, staff_token: str):
    """Test GET /api/v1/staff/assessment-builder/assessments"""
    response = await async_client.get(
        "/api/v1/staff/assessment-builder/assessments",
        headers={"Authorization": f"Bearer {staff_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "assessments" in data
    assert "total" in data


@pytest.mark.asyncio
async def test_create_assessment(async_client: AsyncClient, staff_token: str):
    """Test POST /api/v1/staff/assessment-builder/assessments"""
    assessment_data = {
        "title": "Grade 4 Mathematics Quiz",
        "subject": "mathematics",
        "grade_level": 4,
        "type": "quiz",
        "questions": [
            {
                "text": "What is 12 + 8?",
                "type": "multiple_choice",
                "options": ["18", "20", "22", "24"],
                "correct_answer": "20"
            }
        ],
        "duration_minutes": 30
    }
    response = await async_client.post(
        "/api/v1/staff/assessment-builder/assessments",
        json=assessment_data,
        headers={"Authorization": f"Bearer {staff_token}"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Grade 4 Mathematics Quiz"


@pytest.mark.asyncio
async def test_assessment_builder_unauthorized(async_client: AsyncClient):
    """Test assessment builder access without authentication"""
    response = await async_client.get("/api/v1/staff/assessment-builder/templates")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_assessment_builder_student_forbidden(async_client: AsyncClient, student_token: str):
    """Test staff assessment builder blocked for student role"""
    response = await async_client.get(
        "/api/v1/staff/assessment-builder/templates",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert response.status_code == 403
