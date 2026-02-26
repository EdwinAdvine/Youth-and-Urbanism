"""
Course Model Tests

Tests for the Course SQLAlchemy model:
- Course instantiation with required fields
- Default values for optional fields
- Table name verification
- Property helpers (is_free, is_paid, is_external_instructor)
- Rating update method
- String representation

Note: The Course model uses PostgreSQL ARRAY columns (grade_levels) which
are not natively supported by the SQLite test database. Tests that would
persist Course instances are written as in-memory unit tests (no db_session)
to avoid SQLite ARRAY binding errors. Tests that require database interaction
use json.dumps() for ARRAY columns as a workaround.

Coverage target: 70%+
"""

import json
import uuid
import pytest
from datetime import datetime
from decimal import Decimal

from app.models.course import Course
from tests.factories import UserFactory


@pytest.mark.unit
class TestCourseInstantiation:
    """Test Course model instantiation with required fields."""

    def test_instantiation_with_required_fields(self):
        """Test creating a course object with all required fields."""
        instructor_id = uuid.uuid4()

        course = Course(
            title="Introduction to Mathematics",
            description="A beginner course on mathematics for Grade 1 students.",
            grade_levels=["Grade 1", "Grade 2"],
            learning_area="Mathematics",
            instructor_id=instructor_id,
        )

        assert course.title == "Introduction to Mathematics"
        assert course.description == "A beginner course on mathematics for Grade 1 students."
        assert course.grade_levels == ["Grade 1", "Grade 2"]
        assert course.learning_area == "Mathematics"
        assert course.instructor_id == instructor_id

    def test_instantiation_without_instructor(self):
        """Test creating a platform-created course without an instructor."""
        course = Course(
            title="Platform Science Course",
            description="A science course created by the platform.",
            grade_levels=["Grade 3"],
            learning_area="Science and Technology",
            is_platform_created=True,
        )

        assert course.instructor_id is None
        assert course.is_platform_created is True

    def test_instantiation_with_all_fields(self):
        """Test creating a course object with all fields populated."""
        instructor_id = uuid.uuid4()

        course = Course(
            title="Advanced Kiswahili",
            description="Advanced Kiswahili for senior students.",
            thumbnail_url="https://example.com/thumb.jpg",
            grade_levels=["Grade 7", "Grade 8", "Grade 9"],
            learning_area="Kiswahili",
            syllabus={"unit_1": "Grammar", "unit_2": "Composition"},
            lessons=[{"title": "Lesson 1", "content": "Introduction"}],
            instructor_id=instructor_id,
            is_platform_created=False,
            price=Decimal("2500.00"),
            currency="KES",
            is_published=True,
            is_featured=True,
            enrollment_count=50,
            average_rating=Decimal("4.50"),
            total_reviews=10,
            estimated_duration_hours=40,
            competencies=["communication", "literacy"],
        )

        assert course.title == "Advanced Kiswahili"
        assert course.thumbnail_url == "https://example.com/thumb.jpg"
        assert course.grade_levels == ["Grade 7", "Grade 8", "Grade 9"]
        assert course.currency == "KES"
        assert course.is_featured is True
        assert course.enrollment_count == 50
        assert course.estimated_duration_hours == 40
        assert course.competencies == ["communication", "literacy"]
        assert course.syllabus == {"unit_1": "Grammar", "unit_2": "Composition"}
        assert course.lessons == [{"title": "Lesson 1", "content": "Introduction"}]

    async def test_instantiation_persists_to_database(self, db_session):
        """Test that a course can be persisted (using json for ARRAY columns in SQLite)."""
        instructor = await UserFactory.create(db_session, role="instructor")

        course = Course(
            title="DB Persistence Test",
            description="Testing database persistence.",
            grade_levels=json.dumps(["Grade 1"]),  # JSON string for SQLite ARRAY compat
            learning_area="Mathematics",
            instructor_id=instructor.id,
        )

        db_session.add(course)
        await db_session.commit()
        await db_session.refresh(course)

        assert course.id is not None
        assert course.title == "DB Persistence Test"
        assert course.instructor_id == instructor.id
        assert course.created_at is not None
        assert course.updated_at is not None
        assert isinstance(course.created_at, datetime)


@pytest.mark.unit
class TestCourseDefaultValues:
    """Test default values for Course model fields."""

    def test_default_price_is_zero(self):
        """Test that price defaults to 0.00 (free course) via column default."""
        # Column default is set in the model definition
        assert Course.__table__.columns["price"].default.arg == 0.00

    def test_default_currency_is_kes(self):
        """Test that currency defaults to KES."""
        assert Course.__table__.columns["currency"].default.arg == "KES"

    def test_default_is_published_false(self):
        """Test that is_published defaults to False."""
        assert Course.__table__.columns["is_published"].default.arg is False

    def test_default_is_featured_false(self):
        """Test that is_featured defaults to False."""
        assert Course.__table__.columns["is_featured"].default.arg is False

    def test_default_is_platform_created_false(self):
        """Test that is_platform_created defaults to False."""
        assert Course.__table__.columns["is_platform_created"].default.arg is False

    def test_default_enrollment_count_zero(self):
        """Test that enrollment_count defaults to 0."""
        assert Course.__table__.columns["enrollment_count"].default.arg == 0

    def test_default_total_reviews_zero(self):
        """Test that total_reviews defaults to 0."""
        assert Course.__table__.columns["total_reviews"].default.arg == 0

    async def test_defaults_applied_on_instantiation(self, db_session):
        """Test that defaults are applied when persisting to database."""
        course = Course(
            title="Defaults Test",
            description="Checking defaults.",
            grade_levels=json.dumps(["Grade 1"]),
            learning_area="Mathematics",
        )

        db_session.add(course)
        await db_session.commit()
        await db_session.refresh(course)

        assert course.is_published is False
        assert course.is_featured is False
        assert course.is_platform_created is False
        assert course.enrollment_count == 0
        assert course.total_reviews == 0
        assert course.created_at is not None
        assert course.updated_at is not None
        assert isinstance(course.created_at, datetime)
        assert isinstance(course.updated_at, datetime)


@pytest.mark.unit
class TestCourseTableName:
    """Test Course model table name."""

    def test_table_name(self):
        """Test that the table name is 'courses'."""
        assert Course.__tablename__ == "courses"


@pytest.mark.unit
class TestCourseProperties:
    """Test Course model property helpers."""

    def test_is_free_when_price_zero(self):
        """Test is_free returns True when price is 0."""
        course = Course(
            title="Free",
            description="Free course",
            grade_levels=["Grade 1"],
            learning_area="Mathematics",
            price=Decimal("0.00"),
        )
        assert course.is_free is True

    def test_is_free_when_price_nonzero(self):
        """Test is_free returns False when price is greater than 0."""
        course = Course(
            title="Paid",
            description="Paid course",
            grade_levels=["Grade 1"],
            learning_area="Mathematics",
            price=Decimal("1500.00"),
        )
        assert course.is_free is False

    def test_is_paid_when_price_nonzero(self):
        """Test is_paid returns True when price is greater than 0."""
        course = Course(
            title="Paid",
            description="Paid course",
            grade_levels=["Grade 1"],
            learning_area="Mathematics",
            price=Decimal("500.00"),
        )
        assert course.is_paid is True

    def test_is_paid_when_price_zero(self):
        """Test is_paid returns False when price is 0."""
        course = Course(
            title="Free",
            description="Free course",
            grade_levels=["Grade 1"],
            learning_area="Mathematics",
            price=Decimal("0.00"),
        )
        assert course.is_paid is False

    def test_is_external_instructor_true(self):
        """Test is_external_instructor returns True for instructor-created courses."""
        course = Course(
            title="Instructor Course",
            description="Created by instructor",
            grade_levels=["Grade 1"],
            learning_area="Mathematics",
            instructor_id=uuid.uuid4(),
            is_platform_created=False,
        )
        assert course.is_external_instructor is True

    def test_is_external_instructor_false_when_platform_created(self):
        """Test is_external_instructor returns False for platform-created courses."""
        course = Course(
            title="Platform Course",
            description="Created by platform",
            grade_levels=["Grade 1"],
            learning_area="Mathematics",
            instructor_id=uuid.uuid4(),
            is_platform_created=True,
        )
        assert course.is_external_instructor is False

    def test_is_external_instructor_false_when_no_instructor(self):
        """Test is_external_instructor returns False when no instructor set."""
        course = Course(
            title="No Instructor",
            description="No instructor",
            grade_levels=["Grade 1"],
            learning_area="Mathematics",
            is_platform_created=False,
        )
        assert course.is_external_instructor is False


@pytest.mark.unit
class TestCourseUpdateRating:
    """Test Course update_rating method."""

    def test_update_rating_first_review(self):
        """Test update_rating with the first review."""
        course = Course(
            title="Rating Test",
            description="Test",
            grade_levels=["Grade 1"],
            learning_area="Mathematics",
            average_rating=Decimal("0.00"),
            total_reviews=0,
        )

        course.update_rating(4.0)

        assert course.total_reviews == 1
        assert float(course.average_rating) == 4.0

    def test_update_rating_multiple_reviews(self):
        """Test update_rating recalculates the average correctly."""
        course = Course(
            title="Multi Rating Test",
            description="Test",
            grade_levels=["Grade 1"],
            learning_area="Mathematics",
            average_rating=Decimal("4.00"),
            total_reviews=1,
        )

        course.update_rating(2.0)

        assert course.total_reviews == 2
        # (4.0 * 1 + 2.0) / 2 = 3.0
        assert float(course.average_rating) == 3.0

    def test_update_rating_invalid_too_high(self):
        """Test update_rating raises ValueError for rating above 5.00."""
        course = Course(
            title="Invalid Rating",
            description="Test",
            grade_levels=["Grade 1"],
            learning_area="Mathematics",
            average_rating=Decimal("0.00"),
            total_reviews=0,
        )

        with pytest.raises(ValueError, match="Rating must be between 0.00 and 5.00"):
            course.update_rating(5.01)

    def test_update_rating_invalid_negative(self):
        """Test update_rating raises ValueError for negative rating."""
        course = Course(
            title="Negative Rating",
            description="Test",
            grade_levels=["Grade 1"],
            learning_area="Mathematics",
            average_rating=Decimal("0.00"),
            total_reviews=0,
        )

        with pytest.raises(ValueError, match="Rating must be between 0.00 and 5.00"):
            course.update_rating(-1.0)

    def test_update_rating_boundary_values(self):
        """Test update_rating with boundary values 0.00 and 5.00."""
        course = Course(
            title="Boundary Rating",
            description="Test",
            grade_levels=["Grade 1"],
            learning_area="Mathematics",
            average_rating=Decimal("0.00"),
            total_reviews=0,
        )

        # Should accept 0.00
        course.update_rating(0.00)
        assert course.total_reviews == 1

        # Should accept 5.00
        course.update_rating(5.00)
        assert course.total_reviews == 2


@pytest.mark.unit
class TestCourseRepresentation:
    """Test Course model string representation."""

    def test_repr_method(self):
        """Test __repr__ returns useful string."""
        course = Course(
            title="Repr Test Course",
            description="Test",
            grade_levels=["Grade 1"],
            learning_area="Mathematics",
            price=Decimal("1000.00"),
            is_published=False,
        )

        repr_str = repr(course)

        assert "Course" in repr_str
        assert "Repr Test Course" in repr_str
        assert "Mathematics" in repr_str
