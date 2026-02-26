"""
Student Model Tests

Tests for the Student SQLAlchemy model:
- Student instantiation with required fields
- Default values for optional fields
- Table name verification
- Grade level properties (is_ecd, is_primary, is_junior_secondary, is_senior_secondary)
- Grade number extraction
- Relationships definition
- String representation

Coverage target: 70%+
"""

import pytest
from datetime import datetime, date

from app.models.student import Student
from tests.factories import UserFactory


@pytest.mark.unit
class TestStudentInstantiation:
    """Test Student model instantiation."""

    async def test_instantiation_with_required_fields(self, db_session):
        """Test creating a student with all required fields."""
        user = await UserFactory.create(db_session, role="student")

        student = Student(
            user_id=user.id,
            admission_number="ADM001",
            grade_level="Grade 4",
            enrollment_date=date(2025, 1, 15),
        )

        db_session.add(student)
        await db_session.commit()
        await db_session.refresh(student)

        assert student.id is not None
        assert student.user_id == user.id
        assert student.admission_number == "ADM001"
        assert student.grade_level == "Grade 4"
        assert student.enrollment_date == date(2025, 1, 15)

    async def test_instantiation_with_parent(self, db_session):
        """Test creating a student with a parent relationship."""
        user = await UserFactory.create(db_session, role="student")
        parent = await UserFactory.create(db_session, role="parent")

        student = Student(
            user_id=user.id,
            parent_id=parent.id,
            admission_number="ADM002",
            grade_level="Grade 1",
            enrollment_date=date(2025, 2, 1),
        )

        db_session.add(student)
        await db_session.commit()
        await db_session.refresh(student)

        assert student.parent_id == parent.id

    async def test_instantiation_with_all_fields(self, db_session):
        """Test creating a student with all fields populated."""
        user = await UserFactory.create(db_session, role="student")
        parent = await UserFactory.create(db_session, role="parent")

        student = Student(
            user_id=user.id,
            parent_id=parent.id,
            admission_number="ADM003",
            grade_level="Grade 7",
            enrollment_date=date(2024, 9, 1),
            is_active=True,
            learning_profile={
                "learning_style": "visual",
                "strengths": ["mathematics", "science"],
                "weaknesses": ["essay writing"],
            },
            competencies={
                "mathematics": {"level": "intermediate", "score": 75},
                "science": {"level": "advanced", "score": 88},
            },
            overall_performance={
                "average_grade": "B+",
                "total_assessments": 15,
            },
        )

        db_session.add(student)
        await db_session.commit()
        await db_session.refresh(student)

        assert student.learning_profile["learning_style"] == "visual"
        assert student.competencies["mathematics"]["score"] == 75
        assert student.overall_performance["average_grade"] == "B+"


@pytest.mark.unit
class TestStudentDefaultValues:
    """Test default values for Student model fields."""

    async def test_default_is_active_true(self, db_session):
        """Test that is_active defaults to True."""
        user = await UserFactory.create(db_session, role="student")

        student = Student(
            user_id=user.id,
            admission_number="ADM010",
            grade_level="Grade 3",
            enrollment_date=date(2025, 1, 1),
        )

        db_session.add(student)
        await db_session.commit()
        await db_session.refresh(student)

        assert student.is_active is True

    async def test_default_parent_id_null(self, db_session):
        """Test that parent_id defaults to None."""
        user = await UserFactory.create(db_session, role="student")

        student = Student(
            user_id=user.id,
            admission_number="ADM011",
            grade_level="Grade 5",
            enrollment_date=date(2025, 1, 1),
        )

        db_session.add(student)
        await db_session.commit()
        await db_session.refresh(student)

        assert student.parent_id is None

    async def test_timestamps_auto_set(self, db_session):
        """Test that created_at and updated_at are automatically set."""
        user = await UserFactory.create(db_session, role="student")

        student = Student(
            user_id=user.id,
            admission_number="ADM012",
            grade_level="Grade 6",
            enrollment_date=date(2025, 3, 1),
        )

        db_session.add(student)
        await db_session.commit()
        await db_session.refresh(student)

        assert student.created_at is not None
        assert student.updated_at is not None
        assert isinstance(student.created_at, datetime)
        assert isinstance(student.updated_at, datetime)

    async def test_default_learning_profile_empty(self, db_session):
        """Test that learning_profile defaults to empty dict."""
        user = await UserFactory.create(db_session, role="student")

        student = Student(
            user_id=user.id,
            admission_number="ADM013",
            grade_level="Grade 2",
            enrollment_date=date(2025, 1, 1),
        )

        db_session.add(student)
        await db_session.commit()
        await db_session.refresh(student)

        # Should default to empty dict (or at least not None)
        assert student.learning_profile is not None

    async def test_default_competencies_empty(self, db_session):
        """Test that competencies defaults to empty dict."""
        user = await UserFactory.create(db_session, role="student")

        student = Student(
            user_id=user.id,
            admission_number="ADM014",
            grade_level="Grade 1",
            enrollment_date=date(2025, 1, 1),
        )

        db_session.add(student)
        await db_session.commit()
        await db_session.refresh(student)

        assert student.competencies is not None

    async def test_default_overall_performance_empty(self, db_session):
        """Test that overall_performance defaults to empty dict."""
        user = await UserFactory.create(db_session, role="student")

        student = Student(
            user_id=user.id,
            admission_number="ADM015",
            grade_level="Grade 1",
            enrollment_date=date(2025, 1, 1),
        )

        db_session.add(student)
        await db_session.commit()
        await db_session.refresh(student)

        assert student.overall_performance is not None


@pytest.mark.unit
class TestStudentTableName:
    """Test Student model table name."""

    def test_table_name(self):
        """Test that the table name is 'students'."""
        assert Student.__tablename__ == "students"


@pytest.mark.unit
class TestStudentGradeLevelProperties:
    """Test grade level property helpers."""

    def test_is_ecd_for_ecd_level(self):
        """Test is_ecd returns True for ECD students."""
        student = Student(
            admission_number="ADM100",
            grade_level="ECD 1",
            enrollment_date=date(2025, 1, 1),
        )
        assert student.is_ecd is True

    def test_is_ecd_for_ecd2(self):
        """Test is_ecd returns True for ECD 2."""
        student = Student(
            admission_number="ADM101",
            grade_level="ECD 2",
            enrollment_date=date(2025, 1, 1),
        )
        assert student.is_ecd is True

    def test_is_ecd_false_for_grade(self):
        """Test is_ecd returns False for graded students."""
        student = Student(
            admission_number="ADM102",
            grade_level="Grade 1",
            enrollment_date=date(2025, 1, 1),
        )
        assert student.is_ecd is False

    def test_is_primary_for_grade_1(self):
        """Test is_primary returns True for Grade 1."""
        student = Student(
            admission_number="ADM103",
            grade_level="Grade 1",
            enrollment_date=date(2025, 1, 1),
        )
        assert student.is_primary is True

    def test_is_primary_for_grade_6(self):
        """Test is_primary returns True for Grade 6."""
        student = Student(
            admission_number="ADM104",
            grade_level="Grade 6",
            enrollment_date=date(2025, 1, 1),
        )
        assert student.is_primary is True

    def test_is_primary_false_for_grade_7(self):
        """Test is_primary returns False for Grade 7 (junior secondary)."""
        student = Student(
            admission_number="ADM105",
            grade_level="Grade 7",
            enrollment_date=date(2025, 1, 1),
        )
        assert student.is_primary is False

    def test_is_primary_false_for_ecd(self):
        """Test is_primary returns False for ECD students."""
        student = Student(
            admission_number="ADM106",
            grade_level="ECD 1",
            enrollment_date=date(2025, 1, 1),
        )
        assert student.is_primary is False

    def test_is_junior_secondary_for_grade_7(self):
        """Test is_junior_secondary returns True for Grade 7."""
        student = Student(
            admission_number="ADM107",
            grade_level="Grade 7",
            enrollment_date=date(2025, 1, 1),
        )
        assert student.is_junior_secondary is True

    def test_is_junior_secondary_for_grade_9(self):
        """Test is_junior_secondary returns True for Grade 9."""
        student = Student(
            admission_number="ADM108",
            grade_level="Grade 9",
            enrollment_date=date(2025, 1, 1),
        )
        assert student.is_junior_secondary is True

    def test_is_junior_secondary_false_for_grade_6(self):
        """Test is_junior_secondary returns False for Grade 6."""
        student = Student(
            admission_number="ADM109",
            grade_level="Grade 6",
            enrollment_date=date(2025, 1, 1),
        )
        assert student.is_junior_secondary is False

    def test_is_junior_secondary_false_for_grade_10(self):
        """Test is_junior_secondary returns False for Grade 10."""
        student = Student(
            admission_number="ADM110",
            grade_level="Grade 10",
            enrollment_date=date(2025, 1, 1),
        )
        assert student.is_junior_secondary is False

    def test_is_senior_secondary_for_grade_10(self):
        """Test is_senior_secondary returns True for Grade 10."""
        student = Student(
            admission_number="ADM111",
            grade_level="Grade 10",
            enrollment_date=date(2025, 1, 1),
        )
        assert student.is_senior_secondary is True

    def test_is_senior_secondary_for_grade_12(self):
        """Test is_senior_secondary returns True for Grade 12."""
        student = Student(
            admission_number="ADM112",
            grade_level="Grade 12",
            enrollment_date=date(2025, 1, 1),
        )
        assert student.is_senior_secondary is True

    def test_is_senior_secondary_false_for_grade_9(self):
        """Test is_senior_secondary returns False for Grade 9."""
        student = Student(
            admission_number="ADM113",
            grade_level="Grade 9",
            enrollment_date=date(2025, 1, 1),
        )
        assert student.is_senior_secondary is False


@pytest.mark.unit
class TestStudentGradeNumber:
    """Test grade_number property."""

    def test_grade_number_extracts_integer(self):
        """Test grade_number extracts numeric grade from string."""
        student = Student(
            admission_number="ADM200",
            grade_level="Grade 5",
            enrollment_date=date(2025, 1, 1),
        )
        assert student.grade_number == 5

    def test_grade_number_double_digit(self):
        """Test grade_number handles double-digit grades."""
        student = Student(
            admission_number="ADM201",
            grade_level="Grade 10",
            enrollment_date=date(2025, 1, 1),
        )
        assert student.grade_number == 10

    def test_grade_number_returns_none_for_ecd(self):
        """Test grade_number returns None for ECD levels."""
        student = Student(
            admission_number="ADM202",
            grade_level="ECD 1",
            enrollment_date=date(2025, 1, 1),
        )
        assert student.grade_number is None

    def test_grade_number_grade_1(self):
        """Test grade_number for Grade 1."""
        student = Student(
            admission_number="ADM203",
            grade_level="Grade 1",
            enrollment_date=date(2025, 1, 1),
        )
        assert student.grade_number == 1

    def test_grade_number_grade_12(self):
        """Test grade_number for Grade 12."""
        student = Student(
            admission_number="ADM204",
            grade_level="Grade 12",
            enrollment_date=date(2025, 1, 1),
        )
        assert student.grade_number == 12


@pytest.mark.unit
class TestStudentRelationships:
    """Test Student model relationship definitions."""

    def test_relationships_defined(self):
        """Test that expected relationships are defined on the model."""
        # Check that relationship attributes exist on the mapper
        mapper = Student.__mapper__
        relationship_names = [r.key for r in mapper.relationships]

        # Dashboard relationships
        assert "mood_entries" in relationship_names
        assert "streak" in relationship_names
        assert "daily_plans" in relationship_names
        assert "journal_entries" in relationship_names
        assert "wishlists" in relationship_names
        assert "session_preps" in relationship_names

        # Gamification relationships
        assert "xp_events" in relationship_names
        assert "level" in relationship_names
        assert "badges" in relationship_names
        assert "goals" in relationship_names
        assert "skill_nodes" in relationship_names
        assert "weekly_reports" in relationship_names


@pytest.mark.unit
class TestStudentRepresentation:
    """Test Student model string representation."""

    def test_repr_method(self):
        """Test __repr__ returns useful string."""
        student = Student(
            admission_number="ADM300",
            grade_level="Grade 3",
            enrollment_date=date(2025, 1, 1),
            is_active=True,
        )

        repr_str = repr(student)

        assert "Student" in repr_str
        assert "ADM300" in repr_str
        assert "Grade 3" in repr_str
