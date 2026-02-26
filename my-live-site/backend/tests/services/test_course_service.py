"""
Course Service Tests

Tests for app/services/course_service.py:
- CourseService.create_course()
- CourseService.get_course_by_id()
- CourseService.list_courses()
- CourseService.update_course()
- CourseService.delete_course()
- CourseService.enroll_student()
- CourseService.get_student_enrollments()
- CourseService.update_enrollment_progress()
- CourseService.rate_course()
"""

import uuid
from datetime import datetime
from decimal import Decimal
from unittest.mock import AsyncMock, MagicMock, patch, PropertyMock

import pytest

from app.services.course_service import CourseService


def _make_mock_course(**overrides):
    """Build a mock Course object."""
    defaults = {
        "id": uuid.uuid4(),
        "title": "Mathematics Grade 5",
        "description": "CBC Mathematics for Grade 5 students",
        "thumbnail_url": None,
        "grade_levels": ["Grade 5"],
        "learning_area": "Mathematics",
        "syllabus": {},
        "lessons": [],
        "instructor_id": None,
        "is_platform_created": False,
        "price": Decimal("0.00"),
        "currency": "KES",
        "is_published": True,
        "is_featured": False,
        "is_free": True,
        "enrollment_count": 0,
        "average_rating": Decimal("0.00"),
        "total_reviews": 0,
        "estimated_duration_hours": None,
        "competencies": [],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "published_at": None,
    }
    defaults.update(overrides)
    obj = MagicMock()
    for k, v in defaults.items():
        setattr(obj, k, v)
    return obj


def _make_mock_enrollment(**overrides):
    """Build a mock Enrollment object."""
    defaults = {
        "id": uuid.uuid4(),
        "student_id": uuid.uuid4(),
        "course_id": uuid.uuid4(),
        "status": "active",
        "progress_percentage": Decimal("0.00"),
        "completed_lessons": [],
        "total_time_spent_minutes": 0,
        "is_completed": False,
        "is_deleted": False,
        "enrolled_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    defaults.update(overrides)
    obj = MagicMock()
    for k, v in defaults.items():
        setattr(obj, k, v)
    return obj


@pytest.mark.unit
class TestCreateCourse:
    """Tests for CourseService.create_course()."""

    async def test_create_course_success(self):
        """create_course should add a Course, commit, and return it."""
        mock_db = AsyncMock()
        course_data = MagicMock()
        course_data.title = "Science Grade 3"
        course_data.description = "CBC Science for Grade 3 students covering plants and animals"
        course_data.thumbnail_url = None
        course_data.grade_levels = ["Grade 3"]
        course_data.learning_area = "Science and Technology"
        course_data.syllabus = {}
        course_data.lessons = []
        course_data.price = Decimal("0.00")
        course_data.currency = "KES"
        course_data.estimated_duration_hours = 20
        course_data.competencies = []

        result = await CourseService.create_course(mock_db, course_data)

        mock_db.add.assert_called_once()
        mock_db.commit.assert_awaited_once()
        mock_db.refresh.assert_awaited_once()

    async def test_create_course_with_instructor(self):
        """create_course should assign the instructor_id."""
        mock_db = AsyncMock()
        instructor_id = uuid.uuid4()
        course_data = MagicMock()
        course_data.title = "English Language"
        course_data.description = "CBC English for Grade 4 covering reading and writing"
        course_data.thumbnail_url = None
        course_data.grade_levels = ["Grade 4"]
        course_data.learning_area = "Languages"
        course_data.syllabus = {}
        course_data.lessons = []
        course_data.price = Decimal("500.00")
        course_data.currency = "KES"
        course_data.estimated_duration_hours = 30
        course_data.competencies = []

        result = await CourseService.create_course(
            mock_db, course_data, instructor_id=instructor_id
        )

        added_obj = mock_db.add.call_args[0][0]
        assert added_obj.instructor_id == instructor_id

    async def test_create_course_starts_unpublished(self):
        """create_course should always create courses as unpublished."""
        mock_db = AsyncMock()
        course_data = MagicMock()
        course_data.title = "Kiswahili"
        course_data.description = "CBC Kiswahili for Grade 2 covering basic vocabulary"
        course_data.thumbnail_url = None
        course_data.grade_levels = ["Grade 2"]
        course_data.learning_area = "Languages"
        course_data.syllabus = {}
        course_data.lessons = []
        course_data.price = Decimal("0.00")
        course_data.currency = "KES"
        course_data.estimated_duration_hours = None
        course_data.competencies = []

        await CourseService.create_course(mock_db, course_data)

        added_obj = mock_db.add.call_args[0][0]
        assert added_obj.is_published is False


@pytest.mark.unit
class TestGetCourseById:
    """Tests for CourseService.get_course_by_id()."""

    async def test_returns_published_course(self):
        """get_course_by_id should return a published course."""
        mock_db = AsyncMock()
        course = _make_mock_course(is_published=True)
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = course
        mock_db.execute.return_value = mock_result

        result = await CourseService.get_course_by_id(mock_db, course.id)

        assert result is course

    async def test_returns_none_for_missing_course(self):
        """get_course_by_id should return None when course not found."""
        mock_db = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result

        result = await CourseService.get_course_by_id(mock_db, uuid.uuid4())

        assert result is None

    async def test_include_unpublished_flag(self):
        """get_course_by_id with include_unpublished=True should return draft courses."""
        mock_db = AsyncMock()
        draft_course = _make_mock_course(is_published=False)
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = draft_course
        mock_db.execute.return_value = mock_result

        result = await CourseService.get_course_by_id(
            mock_db, draft_course.id, include_unpublished=True
        )

        assert result is draft_course


@pytest.mark.unit
class TestListCourses:
    """Tests for CourseService.list_courses()."""

    async def test_list_courses_returns_tuple(self):
        """list_courses should return (list, total_count)."""
        mock_db = AsyncMock()

        count_res = MagicMock()
        count_res.scalar_one.return_value = 3

        items_res = MagicMock()
        items_res.scalars.return_value.all.return_value = [
            _make_mock_course(), _make_mock_course(), _make_mock_course()
        ]

        mock_db.execute = AsyncMock(side_effect=[count_res, items_res])

        courses, total = await CourseService.list_courses(mock_db)

        assert total == 3
        assert len(courses) == 3

    async def test_list_courses_with_search_query(self):
        """list_courses should filter by search query in title/description."""
        mock_db = AsyncMock()

        count_res = MagicMock()
        count_res.scalar_one.return_value = 1

        items_res = MagicMock()
        items_res.scalars.return_value.all.return_value = [_make_mock_course(title="Math")]

        mock_db.execute = AsyncMock(side_effect=[count_res, items_res])

        courses, total = await CourseService.list_courses(
            mock_db, search_query="Math"
        )

        assert total == 1

    async def test_list_courses_with_pagination(self):
        """list_courses should apply skip and limit."""
        mock_db = AsyncMock()

        count_res = MagicMock()
        count_res.scalar_one.return_value = 50

        items_res = MagicMock()
        items_res.scalars.return_value.all.return_value = [_make_mock_course()] * 10

        mock_db.execute = AsyncMock(side_effect=[count_res, items_res])

        courses, total = await CourseService.list_courses(
            mock_db, skip=10, limit=10
        )

        assert total == 50
        assert len(courses) == 10


@pytest.mark.unit
class TestUpdateCourse:
    """Tests for CourseService.update_course()."""

    @patch.object(CourseService, "get_course_by_id")
    async def test_update_course_success(self, mock_get):
        """update_course should update fields and commit."""
        mock_db = AsyncMock()
        course = _make_mock_course()
        mock_get.return_value = course

        update_data = MagicMock()
        update_data.model_dump.return_value = {"title": "Updated Title"}
        update_data.is_published = None

        result = await CourseService.update_course(mock_db, course.id, update_data)

        assert result is not None
        mock_db.commit.assert_awaited_once()
        mock_db.refresh.assert_awaited_once()

    @patch.object(CourseService, "get_course_by_id")
    async def test_update_course_returns_none_for_missing(self, mock_get):
        """update_course should return None if course not found."""
        mock_db = AsyncMock()
        mock_get.return_value = None

        update_data = MagicMock()
        update_data.model_dump.return_value = {"title": "No Course"}

        result = await CourseService.update_course(mock_db, uuid.uuid4(), update_data)

        assert result is None
        mock_db.commit.assert_not_awaited()

    @patch.object(CourseService, "get_course_by_id")
    async def test_update_course_sets_published_at(self, mock_get):
        """update_course should set published_at when publishing for the first time."""
        mock_db = AsyncMock()
        course = _make_mock_course(published_at=None)
        mock_get.return_value = course

        update_data = MagicMock()
        update_data.model_dump.return_value = {"is_published": True}
        update_data.is_published = True

        result = await CourseService.update_course(mock_db, course.id, update_data)

        assert course.published_at is not None


@pytest.mark.unit
class TestDeleteCourse:
    """Tests for CourseService.delete_course()."""

    @patch.object(CourseService, "get_course_by_id")
    async def test_delete_course_soft_deletes(self, mock_get):
        """delete_course should set is_published=False (soft delete)."""
        mock_db = AsyncMock()
        course = _make_mock_course(is_published=True)
        mock_get.return_value = course

        result = await CourseService.delete_course(mock_db, course.id)

        assert result is True
        assert course.is_published is False
        mock_db.commit.assert_awaited_once()

    @patch.object(CourseService, "get_course_by_id")
    async def test_delete_course_returns_false_for_missing(self, mock_get):
        """delete_course should return False if course not found."""
        mock_db = AsyncMock()
        mock_get.return_value = None

        result = await CourseService.delete_course(mock_db, uuid.uuid4())

        assert result is False


@pytest.mark.unit
class TestEnrollStudent:
    """Tests for CourseService.enroll_student()."""

    @patch.object(CourseService, "get_course_by_id")
    async def test_enroll_student_success_free_course(self, mock_get):
        """enroll_student should create enrollment for a free published course."""
        mock_db = AsyncMock()
        course = _make_mock_course(is_published=True, is_free=True, enrollment_count=0)
        mock_get.return_value = course

        # No existing enrollment
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result

        enrollment_data = MagicMock()
        enrollment_data.student_id = uuid.uuid4()
        enrollment_data.course_id = course.id
        enrollment_data.payment_id = None
        enrollment_data.payment_amount = Decimal("0.00")

        result = await CourseService.enroll_student(mock_db, enrollment_data)

        mock_db.add.assert_called_once()
        mock_db.commit.assert_awaited_once()
        assert course.enrollment_count == 1

    @patch.object(CourseService, "get_course_by_id")
    async def test_enroll_student_raises_for_unpublished_course(self, mock_get):
        """enroll_student should raise ValueError if course is not published."""
        mock_db = AsyncMock()
        mock_get.return_value = None  # get_course_by_id returns None for unpublished

        enrollment_data = MagicMock()
        enrollment_data.course_id = uuid.uuid4()

        with pytest.raises(ValueError, match="Course not found or not published"):
            await CourseService.enroll_student(mock_db, enrollment_data)

    @patch.object(CourseService, "get_course_by_id")
    async def test_enroll_student_raises_for_duplicate_enrollment(self, mock_get):
        """enroll_student should raise ValueError if student is already enrolled."""
        mock_db = AsyncMock()
        course = _make_mock_course(is_published=True)
        mock_get.return_value = course

        existing = _make_mock_enrollment()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = existing
        mock_db.execute.return_value = mock_result

        enrollment_data = MagicMock()
        enrollment_data.student_id = uuid.uuid4()
        enrollment_data.course_id = course.id

        with pytest.raises(ValueError, match="already enrolled"):
            await CourseService.enroll_student(mock_db, enrollment_data)


@pytest.mark.unit
class TestGetStudentEnrollments:
    """Tests for CourseService.get_student_enrollments()."""

    async def test_returns_list_of_enrollments(self):
        """get_student_enrollments should return enrollments for a student."""
        mock_db = AsyncMock()
        student_id = uuid.uuid4()
        enrollments = [_make_mock_enrollment(), _make_mock_enrollment()]

        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = enrollments
        mock_db.execute.return_value = mock_result

        result = await CourseService.get_student_enrollments(mock_db, student_id)

        assert len(result) == 2

    async def test_returns_empty_for_no_enrollments(self):
        """get_student_enrollments should return empty list when none found."""
        mock_db = AsyncMock()

        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = []
        mock_db.execute.return_value = mock_result

        result = await CourseService.get_student_enrollments(mock_db, uuid.uuid4())

        assert result == []


@pytest.mark.unit
class TestUpdateEnrollmentProgress:
    """Tests for CourseService.update_enrollment_progress()."""

    async def test_update_progress_marks_lesson_complete(self):
        """update_enrollment_progress should mark the lesson and update progress."""
        mock_db = AsyncMock()
        enrollment_id = uuid.uuid4()
        enrollment = _make_mock_enrollment(id=enrollment_id)

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = enrollment
        mock_db.execute.return_value = mock_result

        result = await CourseService.update_enrollment_progress(
            mock_db, enrollment_id, "lesson_01", total_lessons=10, time_spent_minutes=15
        )

        enrollment.mark_lesson_complete.assert_called_once_with("lesson_01")
        enrollment.update_progress.assert_called_once_with(10)
        mock_db.commit.assert_awaited_once()

    async def test_update_progress_returns_none_for_missing(self):
        """update_enrollment_progress should return None if enrollment not found."""
        mock_db = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result

        result = await CourseService.update_enrollment_progress(
            mock_db, uuid.uuid4(), "lesson_01", total_lessons=10
        )

        assert result is None


@pytest.mark.unit
class TestRateCourse:
    """Tests for CourseService.rate_course()."""

    @patch.object(CourseService, "get_course_by_id")
    async def test_rate_course_success(self, mock_get_course):
        """rate_course should add rating to enrollment and update course."""
        mock_db = AsyncMock()
        enrollment = _make_mock_enrollment()
        enrollment.course_id = uuid.uuid4()
        course = _make_mock_course(id=enrollment.course_id)
        mock_get_course.return_value = course

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = enrollment
        mock_db.execute.return_value = mock_result

        result = await CourseService.rate_course(mock_db, enrollment.id, 5, "Excellent!")

        enrollment.add_rating.assert_called_once_with(5, "Excellent!")
        course.update_rating.assert_called_once_with(5.0)
        mock_db.commit.assert_awaited_once()
        assert result is not None

    async def test_rate_course_returns_none_for_missing_enrollment(self):
        """rate_course should return None if enrollment not found."""
        mock_db = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result

        result = await CourseService.rate_course(mock_db, uuid.uuid4(), 4)

        assert result is None

    @patch.object(CourseService, "get_course_by_id")
    async def test_rate_course_returns_none_for_missing_course(self, mock_get_course):
        """rate_course should return None if course not found."""
        mock_db = AsyncMock()
        enrollment = _make_mock_enrollment()
        mock_get_course.return_value = None

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = enrollment
        mock_db.execute.return_value = mock_result

        result = await CourseService.rate_course(mock_db, enrollment.id, 3)

        assert result is None
