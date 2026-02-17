"""
Tests for Parent Children API endpoints.

Endpoints under test:
    GET    /api/v1/parent/children                           - List children
    GET    /api/v1/parent/children/{child_id}                - Child profile
    GET    /api/v1/parent/children/{child_id}/learning-journey  - Learning journey
    GET    /api/v1/parent/children/{child_id}/cbc-competencies  - CBC competencies
    GET    /api/v1/parent/children/{child_id}/activity       - Activity data
    GET    /api/v1/parent/children/{child_id}/achievements   - Achievements
    GET    /api/v1/parent/children/{child_id}/goals          - Child goals
    GET    /api/v1/parent/children/goals/all                 - All family goals
    POST   /api/v1/parent/children/goals                     - Create goal
    PUT    /api/v1/parent/children/goals/{goal_id}           - Update goal
    DELETE /api/v1/parent/children/goals/{goal_id}           - Delete goal
    GET    /api/v1/parent/children/{child_id}/ai-pathways    - AI pathways

The children router uses require_parent_role which returns 403 for
non-parent roles. Child-specific endpoints validate that the child
belongs to the requesting parent.
"""

import pytest
import uuid
from unittest.mock import patch, AsyncMock, MagicMock


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
BASE_URL = "/api/v1/parent/children"
FAKE_CHILD_ID = str(uuid.uuid4())

MOCK_CHILDREN_LIST = {
    "children": [
        {
            "id": FAKE_CHILD_ID,
            "full_name": "Amara Test",
            "grade_level": "5",
            "age": 11,
            "is_active_today": True,
            "quick_stats": {
                "courses_enrolled": 3,
                "avg_performance": 85.0,
                "streak_days": 7,
            },
        }
    ],
    "total": 1,
}

MOCK_CHILD_PROFILE = {
    "id": FAKE_CHILD_ID,
    "full_name": "Amara Test",
    "grade_level": "5",
    "learning_profile": {},
    "cbc_competency_scores": {},
    "performance_metrics": {},
    "activity_stats": {},
    "ai_tutor_info": {},
}

MOCK_LEARNING_JOURNEY = {
    "current_focus_areas": ["Mathematics"],
    "weekly_narrative": "Strong progress in algebra this week.",
    "cbc_competency_radar": {},
    "learning_path": [],
}

MOCK_ACTIVITY = {
    "daily_stats": [],
    "weekly_summary": {},
    "streak": {"current": 7, "longest": 14},
    "activity_feed": [],
}

MOCK_ACHIEVEMENTS = {
    "certificates": [],
    "badges": [],
    "milestones": [],
    "recent_timeline": [],
}

MOCK_GOALS_LIST = {
    "goals": [
        {
            "id": str(uuid.uuid4()),
            "title": "Read 10 books",
            "category": "academic",
            "progress_percentage": 30.0,
            "status": "active",
        }
    ],
    "total": 1,
}

MOCK_AI_PATHWAYS = {
    "student_id": FAKE_CHILD_ID,
    "full_name": "Amara Test",
    "grade_level": "5",
    "pathways": [],
    "current_trajectory": "STEM-focused",
    "trajectory_confidence": 0.78,
    "recommended_focus_areas": ["Mathematics"],
    "potential_career_interests": ["Engineering"],
}


# ---------------------------------------------------------------------------
# List Children
# ---------------------------------------------------------------------------

@pytest.mark.unit
class TestListChildren:
    """Tests for GET /api/v1/parent/children."""

    @patch(
        "app.api.v1.parent.children.parent_children_service.get_children_list",
        new_callable=AsyncMock,
    )
    async def test_list_children_success(
        self, mock_list, client, parent_user, parent_auth_headers
    ):
        """Parent receives 200 with children list."""
        mock_list.return_value = MOCK_CHILDREN_LIST

        response = await client.get(BASE_URL, headers=parent_auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert "children" in data
        mock_list.assert_awaited_once()

    @patch(
        "app.api.v1.parent.children.parent_children_service.get_children_list",
        new_callable=AsyncMock,
    )
    async def test_list_children_passes_parent_id(
        self, mock_list, client, parent_user, parent_auth_headers
    ):
        """Service is called with the authenticated parent's id."""
        mock_list.return_value = MOCK_CHILDREN_LIST

        await client.get(BASE_URL, headers=parent_auth_headers)

        call_kwargs = mock_list.call_args.kwargs
        assert call_kwargs["parent_id"] == parent_user.id

    async def test_list_children_requires_auth(self, client):
        """Request without auth returns 401 or 403."""
        response = await client.get(BASE_URL)
        assert response.status_code in (401, 403)

    async def test_list_children_rejects_student(
        self, client, student_user, student_auth_headers
    ):
        """Student role returns 403."""
        response = await client.get(BASE_URL, headers=student_auth_headers)
        assert response.status_code == 403

    async def test_list_children_rejects_instructor(
        self, client, instructor_user, instructor_auth_headers
    ):
        """Instructor role returns 403."""
        response = await client.get(BASE_URL, headers=instructor_auth_headers)
        assert response.status_code == 403


# ---------------------------------------------------------------------------
# Child Profile
# ---------------------------------------------------------------------------

@pytest.mark.unit
class TestChildProfile:
    """Tests for GET /api/v1/parent/children/{child_id}."""

    @patch(
        "app.api.v1.parent.children.parent_children_service.get_child_profile",
        new_callable=AsyncMock,
    )
    async def test_child_profile_success(
        self, mock_profile, client, parent_user, parent_auth_headers
    ):
        """Parent receives 200 with child profile."""
        mock_profile.return_value = MOCK_CHILD_PROFILE

        response = await client.get(
            f"{BASE_URL}/{FAKE_CHILD_ID}", headers=parent_auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert "full_name" in data

    @patch(
        "app.api.v1.parent.children.parent_children_service.get_child_profile",
        new_callable=AsyncMock,
        side_effect=ValueError("Child not found or does not belong to parent"),
    )
    async def test_child_profile_not_found(
        self, mock_profile, client, parent_user, parent_auth_headers
    ):
        """Non-existent child returns 404."""
        response = await client.get(
            f"{BASE_URL}/{FAKE_CHILD_ID}", headers=parent_auth_headers
        )
        assert response.status_code == 404

    async def test_child_profile_requires_auth(self, client):
        """Request without auth returns 401 or 403."""
        response = await client.get(f"{BASE_URL}/{FAKE_CHILD_ID}")
        assert response.status_code in (401, 403)

    async def test_child_profile_rejects_student(
        self, client, student_user, student_auth_headers
    ):
        """Student role returns 403."""
        response = await client.get(
            f"{BASE_URL}/{FAKE_CHILD_ID}", headers=student_auth_headers
        )
        assert response.status_code == 403


# ---------------------------------------------------------------------------
# Learning Journey
# ---------------------------------------------------------------------------

@pytest.mark.unit
class TestLearningJourney:
    """Tests for GET /api/v1/parent/children/{child_id}/learning-journey."""

    @patch(
        "app.api.v1.parent.children.parent_children_service.get_learning_journey",
        new_callable=AsyncMock,
    )
    async def test_learning_journey_success(
        self, mock_journey, client, parent_user, parent_auth_headers
    ):
        """Parent receives 200 with learning journey."""
        mock_journey.return_value = MOCK_LEARNING_JOURNEY

        response = await client.get(
            f"{BASE_URL}/{FAKE_CHILD_ID}/learning-journey",
            headers=parent_auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert "weekly_narrative" in data

    @patch(
        "app.api.v1.parent.children.parent_children_service.get_learning_journey",
        new_callable=AsyncMock,
        side_effect=ValueError("Child not found"),
    )
    async def test_learning_journey_not_found(
        self, mock_journey, client, parent_user, parent_auth_headers
    ):
        """Non-existent child returns 404."""
        response = await client.get(
            f"{BASE_URL}/{FAKE_CHILD_ID}/learning-journey",
            headers=parent_auth_headers,
        )
        assert response.status_code == 404


# ---------------------------------------------------------------------------
# Activity
# ---------------------------------------------------------------------------

@pytest.mark.unit
class TestActivity:
    """Tests for GET /api/v1/parent/children/{child_id}/activity."""

    @patch(
        "app.api.v1.parent.children.parent_children_service.get_activity",
        new_callable=AsyncMock,
    )
    async def test_activity_success(
        self, mock_activity, client, parent_user, parent_auth_headers
    ):
        """Parent receives 200 with activity data."""
        mock_activity.return_value = MOCK_ACTIVITY

        response = await client.get(
            f"{BASE_URL}/{FAKE_CHILD_ID}/activity",
            headers=parent_auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert "daily_stats" in data
        assert "streak" in data

    async def test_activity_requires_auth(self, client):
        """Request without auth returns 401 or 403."""
        response = await client.get(f"{BASE_URL}/{FAKE_CHILD_ID}/activity")
        assert response.status_code in (401, 403)


# ---------------------------------------------------------------------------
# Achievements
# ---------------------------------------------------------------------------

@pytest.mark.unit
class TestAchievements:
    """Tests for GET /api/v1/parent/children/{child_id}/achievements."""

    @patch(
        "app.api.v1.parent.children.parent_children_service.get_achievements",
        new_callable=AsyncMock,
    )
    async def test_achievements_success(
        self, mock_achievements, client, parent_user, parent_auth_headers
    ):
        """Parent receives 200 with achievements."""
        mock_achievements.return_value = MOCK_ACHIEVEMENTS

        response = await client.get(
            f"{BASE_URL}/{FAKE_CHILD_ID}/achievements",
            headers=parent_auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert "certificates" in data
        assert "badges" in data

    async def test_achievements_requires_auth(self, client):
        """Request without auth returns 401 or 403."""
        response = await client.get(f"{BASE_URL}/{FAKE_CHILD_ID}/achievements")
        assert response.status_code in (401, 403)


# ---------------------------------------------------------------------------
# Goals - CRUD
# ---------------------------------------------------------------------------

@pytest.mark.unit
class TestGoals:
    """Tests for /api/v1/parent/children/goals endpoints."""

    @patch(
        "app.api.v1.parent.children.parent_children_service.get_goals",
        new_callable=AsyncMock,
    )
    async def test_get_all_goals_success(
        self, mock_goals, client, parent_user, parent_auth_headers
    ):
        """Parent receives 200 with all family goals."""
        mock_goals.return_value = MOCK_GOALS_LIST

        response = await client.get(
            f"{BASE_URL}/goals/all", headers=parent_auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert "goals" in data

    async def test_create_goal_requires_auth(self, client, sample_goal_payload):
        """Request without auth returns 401 or 403."""
        response = await client.post(f"{BASE_URL}/goals", json=sample_goal_payload)
        assert response.status_code in (401, 403)

    async def test_create_goal_rejects_student(
        self, client, student_user, student_auth_headers, sample_goal_payload
    ):
        """Student role returns 403."""
        response = await client.post(
            f"{BASE_URL}/goals",
            json=sample_goal_payload,
            headers=student_auth_headers,
        )
        assert response.status_code == 403

    async def test_create_goal_validates_body(
        self, client, parent_user, parent_auth_headers
    ):
        """Missing required fields returns 422."""
        response = await client.post(
            f"{BASE_URL}/goals",
            json={},
            headers=parent_auth_headers,
        )
        assert response.status_code == 422

    async def test_update_goal_not_found(
        self, client, parent_user, parent_auth_headers
    ):
        """Updating a non-existent goal returns 404."""
        fake_goal_id = str(uuid.uuid4())
        response = await client.put(
            f"{BASE_URL}/goals/{fake_goal_id}",
            json={"title": "Updated goal title"},
            headers=parent_auth_headers,
        )
        assert response.status_code == 404

    async def test_delete_goal_not_found(
        self, client, parent_user, parent_auth_headers
    ):
        """Deleting a non-existent goal returns 404."""
        fake_goal_id = str(uuid.uuid4())
        response = await client.delete(
            f"{BASE_URL}/goals/{fake_goal_id}",
            headers=parent_auth_headers,
        )
        assert response.status_code == 404

    async def test_delete_goal_requires_auth(self, client):
        """Delete without auth returns 401 or 403."""
        fake_goal_id = str(uuid.uuid4())
        response = await client.delete(f"{BASE_URL}/goals/{fake_goal_id}")
        assert response.status_code in (401, 403)

    async def test_get_all_goals_requires_auth(self, client):
        """Request without auth returns 401 or 403."""
        response = await client.get(f"{BASE_URL}/goals/all")
        assert response.status_code in (401, 403)


# ---------------------------------------------------------------------------
# AI Pathways
# ---------------------------------------------------------------------------

@pytest.mark.unit
class TestAIPathways:
    """Tests for GET /api/v1/parent/children/{child_id}/ai-pathways."""

    async def test_ai_pathways_requires_auth(self, client):
        """Request without auth returns 401 or 403."""
        response = await client.get(f"{BASE_URL}/{FAKE_CHILD_ID}/ai-pathways")
        assert response.status_code in (401, 403)

    async def test_ai_pathways_rejects_student(
        self, client, student_user, student_auth_headers
    ):
        """Student role returns 403."""
        response = await client.get(
            f"{BASE_URL}/{FAKE_CHILD_ID}/ai-pathways",
            headers=student_auth_headers,
        )
        assert response.status_code == 403

    async def test_ai_pathways_child_not_found(
        self, client, parent_user, parent_auth_headers
    ):
        """Non-existent child returns 404."""
        response = await client.get(
            f"{BASE_URL}/{FAKE_CHILD_ID}/ai-pathways",
            headers=parent_auth_headers,
        )
        assert response.status_code == 404
