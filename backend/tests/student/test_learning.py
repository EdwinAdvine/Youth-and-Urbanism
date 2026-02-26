"""
Tests for Student Learning API Routes

Endpoints under test:
- GET    /api/v1/student/learning/courses/enrolled      -- enrolled courses
- GET    /api/v1/student/learning/courses/recommended    -- AI recommended courses
- GET    /api/v1/student/learning/browse                 -- browse marketplace
- GET    /api/v1/student/learning/course/{id}/preview    -- course preview
- GET    /api/v1/student/learning/wishlist               -- get wishlist
- POST   /api/v1/student/learning/wishlist               -- add to wishlist
- DELETE /api/v1/student/learning/wishlist/{course_id}   -- remove from wishlist
- GET    /api/v1/student/learning/live-sessions/upcoming -- upcoming sessions
- GET    /api/v1/student/learning/session/{id}/prep      -- session prep tips
"""
import pytest
import uuid
from unittest.mock import patch, AsyncMock, MagicMock
from httpx import AsyncClient


BASE = "/api/v1/student/learning"


# ──────────────────────────────────────────────────────────────
# GET /courses/enrolled
# ──────────────────────────────────────────────────────────────

@pytest.mark.unit
@pytest.mark.asyncio
async def test_get_enrolled_courses_success(
    async_client: AsyncClient,
    override_current_user,
    mock_course_data,
):
    """Student retrieves their enrolled courses list."""
    with patch("app.api.v1.student.learning.LearningService") as MockService:
        instance = MockService.return_value
        instance.get_enrolled_courses = AsyncMock(return_value=[mock_course_data])

        response = await async_client.get(
            f"{BASE}/courses/enrolled",
            headers={"Authorization": "Bearer fake-token"},
        )

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]["title"] == "Mathematics Grade 5"


@pytest.mark.unit
@pytest.mark.asyncio
async def test_get_enrolled_courses_requires_auth(async_client: AsyncClient):
    """Unauthenticated request is rejected."""
    response = await async_client.get(f"{BASE}/courses/enrolled")
    assert response.status_code in [401, 403]


@pytest.mark.unit
@pytest.mark.asyncio
async def test_get_enrolled_courses_non_student_forbidden(
    async_client: AsyncClient,
    override_current_user_admin,
):
    """Admin role cannot access student enrolled courses."""
    response = await async_client.get(
        f"{BASE}/courses/enrolled",
        headers={"Authorization": "Bearer fake-token"},
    )
    assert response.status_code == 403


@pytest.mark.unit
@pytest.mark.asyncio
async def test_get_enrolled_courses_no_profile(
    async_client: AsyncClient,
    override_current_user_no_profile,
):
    """Student without student_id returns 400."""
    response = await async_client.get(
        f"{BASE}/courses/enrolled",
        headers={"Authorization": "Bearer fake-token"},
    )
    assert response.status_code == 400


# ──────────────────────────────────────────────────────────────
# GET /courses/recommended
# ──────────────────────────────────────────────────────────────

@pytest.mark.unit
@pytest.mark.asyncio
async def test_get_ai_recommended_courses_success(
    async_client: AsyncClient,
    override_current_user,
):
    """Student receives AI-recommended courses."""
    mock_recs = [
        {"id": str(uuid.uuid4()), "title": "Science Grade 5", "score": 0.92}
    ]

    with patch("app.api.v1.student.learning.LearningService") as MockService:
        instance = MockService.return_value
        instance.get_ai_recommended_courses = AsyncMock(return_value=mock_recs)

        response = await async_client.get(
            f"{BASE}/courses/recommended",
            headers={"Authorization": "Bearer fake-token"},
            params={"limit": 5},
        )

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1


@pytest.mark.unit
@pytest.mark.asyncio
async def test_get_ai_recommended_courses_value_error(
    async_client: AsyncClient,
    override_current_user,
):
    """ValueError from service returns 404."""
    with patch("app.api.v1.student.learning.LearningService") as MockService:
        instance = MockService.return_value
        instance.get_ai_recommended_courses = AsyncMock(
            side_effect=ValueError("Student not found")
        )

        response = await async_client.get(
            f"{BASE}/courses/recommended",
            headers={"Authorization": "Bearer fake-token"},
        )

    assert response.status_code == 404


# ──────────────────────────────────────────────────────────────
# GET /browse
# ──────────────────────────────────────────────────────────────

@pytest.mark.unit
@pytest.mark.asyncio
async def test_browse_courses_success(
    async_client: AsyncClient,
    override_current_user,
):
    """Browse courses with default params returns paginated result."""
    mock_result = {
        "courses": [],
        "total": 0,
        "limit": 20,
        "offset": 0,
    }

    with patch("app.api.v1.student.learning.LearningService") as MockService:
        instance = MockService.return_value
        instance.browse_courses = AsyncMock(return_value=mock_result)

        response = await async_client.get(
            f"{BASE}/browse",
            headers={"Authorization": "Bearer fake-token"},
        )

    assert response.status_code == 200
    data = response.json()
    assert "courses" in data


@pytest.mark.unit
@pytest.mark.asyncio
async def test_browse_courses_invalid_sort_by(
    async_client: AsyncClient,
    override_current_user,
):
    """Invalid sort_by value returns 400."""
    response = await async_client.get(
        f"{BASE}/browse",
        headers={"Authorization": "Bearer fake-token"},
        params={"sort_by": "invalid_sort"},
    )
    assert response.status_code == 400
    assert "Invalid sort_by" in response.json()["detail"]


# ──────────────────────────────────────────────────────────────
# GET /course/{course_id}/preview
# ──────────────────────────────────────────────────────────────

@pytest.mark.unit
@pytest.mark.asyncio
async def test_course_preview_success(
    async_client: AsyncClient,
    override_current_user,
):
    """Valid course UUID returns preview data."""
    course_id = str(uuid.uuid4())
    mock_preview = {
        "id": course_id,
        "title": "English Grade 5",
        "description": "Comprehensive English course",
        "modules": 10,
    }

    with patch("app.api.v1.student.learning.LearningService") as MockService:
        instance = MockService.return_value
        instance.get_course_preview = AsyncMock(return_value=mock_preview)

        response = await async_client.get(
            f"{BASE}/course/{course_id}/preview",
            headers={"Authorization": "Bearer fake-token"},
        )

    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "English Grade 5"


@pytest.mark.unit
@pytest.mark.asyncio
async def test_course_preview_invalid_uuid(
    async_client: AsyncClient,
    override_current_user,
):
    """Malformed course ID returns 400."""
    response = await async_client.get(
        f"{BASE}/course/not-a-valid-uuid/preview",
        headers={"Authorization": "Bearer fake-token"},
    )
    assert response.status_code == 400
    assert "Invalid course ID" in response.json()["detail"]


# ──────────────────────────────────────────────────────────────
# POST /wishlist
# ──────────────────────────────────────────────────────────────

@pytest.mark.unit
@pytest.mark.asyncio
async def test_add_to_wishlist_success(
    async_client: AsyncClient,
    override_current_user,
):
    """Student adds a course to their wishlist."""
    course_id = str(uuid.uuid4())
    mock_item = MagicMock()
    mock_item.id = uuid.uuid4()
    mock_item.course_id = uuid.UUID(course_id)
    mock_item.added_at = "2026-02-15T12:00:00"

    with patch("app.api.v1.student.learning.LearningService") as MockService:
        instance = MockService.return_value
        instance.add_to_wishlist = AsyncMock(return_value=mock_item)

        response = await async_client.post(
            f"{BASE}/wishlist",
            headers={"Authorization": "Bearer fake-token"},
            json={"course_id": course_id},
        )

    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert data["course_id"] == course_id


@pytest.mark.unit
@pytest.mark.asyncio
async def test_add_to_wishlist_invalid_course_id(
    async_client: AsyncClient,
    override_current_user,
):
    """Malformed course_id in wishlist request returns 400."""
    response = await async_client.post(
        f"{BASE}/wishlist",
        headers={"Authorization": "Bearer fake-token"},
        json={"course_id": "not-a-uuid"},
    )
    assert response.status_code == 400


# ──────────────────────────────────────────────────────────────
# DELETE /wishlist/{course_id}
# ──────────────────────────────────────────────────────────────

@pytest.mark.unit
@pytest.mark.asyncio
async def test_remove_from_wishlist_success(
    async_client: AsyncClient,
    override_current_user,
):
    """Student removes a course from their wishlist."""
    course_id = str(uuid.uuid4())

    with patch("app.api.v1.student.learning.LearningService") as MockService:
        instance = MockService.return_value
        instance.remove_from_wishlist = AsyncMock(return_value=True)

        response = await async_client.delete(
            f"{BASE}/wishlist/{course_id}",
            headers={"Authorization": "Bearer fake-token"},
        )

    assert response.status_code == 200
    assert response.json()["message"] == "Course removed from wishlist"


@pytest.mark.unit
@pytest.mark.asyncio
async def test_remove_from_wishlist_not_found(
    async_client: AsyncClient,
    override_current_user,
):
    """Removing a course not in wishlist returns 404."""
    course_id = str(uuid.uuid4())

    with patch("app.api.v1.student.learning.LearningService") as MockService:
        instance = MockService.return_value
        instance.remove_from_wishlist = AsyncMock(return_value=False)

        response = await async_client.delete(
            f"{BASE}/wishlist/{course_id}",
            headers={"Authorization": "Bearer fake-token"},
        )

    assert response.status_code == 404


# ──────────────────────────────────────────────────────────────
# GET /live-sessions/upcoming
# ──────────────────────────────────────────────────────────────

@pytest.mark.unit
@pytest.mark.asyncio
async def test_get_upcoming_live_sessions_success(
    async_client: AsyncClient,
    override_current_user,
):
    """Student retrieves upcoming live sessions."""
    mock_sessions = [
        {
            "id": str(uuid.uuid4()),
            "title": "Math Live Q&A",
            "scheduled_at": "2026-02-16T14:00:00",
        }
    ]

    with patch("app.api.v1.student.learning.LearningService") as MockService:
        instance = MockService.return_value
        instance.get_upcoming_live_sessions = AsyncMock(return_value=mock_sessions)

        response = await async_client.get(
            f"{BASE}/live-sessions/upcoming",
            headers={"Authorization": "Bearer fake-token"},
        )

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1
