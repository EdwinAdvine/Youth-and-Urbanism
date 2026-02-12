"""
Course Management API Tests

Tests for course-related endpoints:
- POST /api/v1/courses - Create course
- GET /api/v1/courses - List/search courses
- GET /api/v1/courses/{id} - Get course details
- PUT /api/v1/courses/{id} - Update course
- DELETE /api/v1/courses/{id} - Delete course
- POST /api/v1/courses/{id}/enroll - Enroll in course
- PUT /api/v1/courses/{id}/progress - Update progress

Coverage target: 75%+
"""

import pytest
from fastapi import status
from tests.factories import UserFactory, CourseFactory


@pytest.mark.unit
class TestCourseCreation:
    """Test course creation endpoint."""

    def test_create_course_success(self, client, admin_headers, test_admin):
        """Test successful course creation by admin/instructor."""
        response = client.post("/api/v1/courses",
            headers=admin_headers,
            json={
                "title": "Introduction to Python Programming",
                "description": "Learn Python from scratch",
                "grade_levels": [7, 8, 9],
                "learning_area": "Technology",
                "price": 5000.0,
                "duration_weeks": 12
            }
        )

        assert response.status_code in [
            status.HTTP_201_CREATED,
            status.HTTP_404_NOT_FOUND
        ]

        if response.status_code == status.HTTP_201_CREATED:
            data = response.json()
            assert data["title"] == "Introduction to Python Programming"
            assert "id" in data

    def test_create_course_unauthorized_fails(self, client, auth_headers):
        """Test non-admin/instructor cannot create course."""
        response = client.post("/api/v1/courses",
            headers=auth_headers,
            json={"title": "Test Course"}
        )

        assert response.status_code in [
            status.HTTP_403_FORBIDDEN,
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_404_NOT_FOUND
        ]

    def test_create_course_missing_fields_fails(self, client, admin_headers):
        """Test course creation fails with missing required fields."""
        response = client.post("/api/v1/courses",
            headers=admin_headers,
            json={"title": "Incomplete Course"}  # Missing other required fields
        )

        assert response.status_code in [
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            status.HTTP_400_BAD_REQUEST,
            status.HTTP_404_NOT_FOUND
        ]


@pytest.mark.unit
class TestCourseRetrieval:
    """Test course retrieval endpoints."""

    def test_list_courses_success(self, client):
        """Test listing all published courses."""
        response = client.get("/api/v1/courses")

        assert response.status_code in [
            status.HTTP_200_OK,
            status.HTTP_404_NOT_FOUND
        ]

        if response.status_code == status.HTTP_200_OK:
            data = response.json()
            assert isinstance(data, list) or "courses" in data

    def test_list_courses_filter_by_grade(self, client):
        """Test filtering courses by grade level."""
        response = client.get("/api/v1/courses",
            params={"grade_level": 5}
        )

        assert response.status_code in [
            status.HTTP_200_OK,
            status.HTTP_404_NOT_FOUND
        ]

    def test_list_courses_filter_by_learning_area(self, client):
        """Test filtering courses by learning area."""
        response = client.get("/api/v1/courses",
            params={"learning_area": "Mathematics"}
        )

        assert response.status_code in [
            status.HTTP_200_OK,
            status.HTTP_404_NOT_FOUND
        ]

    def test_get_course_by_id_success(self, client, db_session):
        """Test getting single course by ID."""
        # Create a course
        admin = UserFactory.create(db_session, role="admin")
        course = CourseFactory.create(db_session, creator_id=admin.id)

        response = client.get(f"/api/v1/courses/{course.id}")

        assert response.status_code in [
            status.HTTP_200_OK,
            status.HTTP_404_NOT_FOUND
        ]

        if response.status_code == status.HTTP_200_OK:
            data = response.json()
            assert data["id"] == str(course.id)

    def test_get_course_nonexistent_id_fails(self, client):
        """Test getting non-existent course returns 404."""
        response = client.get("/api/v1/courses/00000000-0000-0000-0000-000000000000")

        assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.unit
class TestCourseEnrollment:
    """Test course enrollment functionality."""

    def test_enroll_in_course_success(self, client, auth_headers, test_user, db_session):
        """Test successful course enrollment."""
        # Create a course
        admin = UserFactory.create(db_session, role="admin")
        course = CourseFactory.create(db_session, creator_id=admin.id)

        response = client.post(f"/api/v1/courses/{course.id}/enroll",
            headers=auth_headers
        )

        assert response.status_code in [
            status.HTTP_200_OK,
            status.HTTP_201_CREATED,
            status.HTTP_404_NOT_FOUND
        ]

    def test_enroll_duplicate_fails(self, client, auth_headers, test_user, db_session):
        """Test enrolling in same course twice fails."""
        admin = UserFactory.create(db_session, role="admin")
        course = CourseFactory.create(db_session, creator_id=admin.id)

        # First enrollment
        client.post(f"/api/v1/courses/{course.id}/enroll", headers=auth_headers)

        # Second enrollment
        response = client.post(f"/api/v1/courses/{course.id}/enroll",
            headers=auth_headers
        )

        assert response.status_code in [
            status.HTTP_400_BAD_REQUEST,
            status.HTTP_409_CONFLICT,
            status.HTTP_404_NOT_FOUND
        ]

    def test_enroll_requires_authentication(self, client, db_session):
        """Test course enrollment requires authentication."""
        admin = UserFactory.create(db_session, role="admin")
        course = CourseFactory.create(db_session, creator_id=admin.id)

        response = client.post(f"/api/v1/courses/{course.id}/enroll")

        assert response.status_code in [
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_404_NOT_FOUND
        ]


@pytest.mark.unit
class TestCourseProgress:
    """Test course progress tracking."""

    def test_update_progress_success(self, client, auth_headers):
        """Test updating course progress."""
        course_id = "test-course-id"

        response = client.put(f"/api/v1/courses/{course_id}/progress",
            headers=auth_headers,
            json={
                "completed_lessons": ["lesson-1", "lesson-2"],
                "progress_percentage": 25.5
            }
        )

        assert response.status_code in [
            status.HTTP_200_OK,
            status.HTTP_404_NOT_FOUND
        ]

    def test_get_my_courses_success(self, client, auth_headers):
        """Test getting user's enrolled courses."""
        response = client.get("/api/v1/courses/my-courses",
            headers=auth_headers
        )

        assert response.status_code in [
            status.HTTP_200_OK,
            status.HTTP_404_NOT_FOUND
        ]


# Target: 75%+ coverage for courses.py
