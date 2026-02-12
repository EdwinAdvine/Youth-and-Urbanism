"""
Test Data Factories

This module provides factory functions for generating test data.
Uses Faker for realistic test data generation.

Usage:
    user = UserFactory.create(db_session, role="student")
    course = CourseFactory.create(db_session, creator_id=user.id)
"""

from faker import Faker
from typing import Optional
from sqlalchemy.orm import Session

from app.models.user import User
from app.utils.security import get_password_hash


# Initialize Faker
fake = Faker()


class UserFactory:
    """Factory for creating User instances."""

    @staticmethod
    def create(
        db_session: Session,
        role: str = "student",
        email: Optional[str] = None,
        password: str = "Test123!@#",
        is_active: bool = True,
        is_verified: bool = True,
        **kwargs
    ) -> User:
        """
        Create a test user.

        Args:
            db_session: Database session
            role: User role (student, parent, instructor, admin, partner, staff)
            email: User email (auto-generated if not provided)
            password: User password (default: Test123!@#)
            is_active: Whether user is active
            is_verified: Whether user email is verified
            **kwargs: Additional user attributes

        Returns:
            User: Created user instance
        """
        # Generate email if not provided
        if email is None:
            email = fake.email()

        # Base profile data
        profile_data = {
            "first_name": kwargs.pop("first_name", fake.first_name()),
            "last_name": kwargs.pop("last_name", fake.last_name()),
        }

        # Add role-specific profile data
        if role == "student":
            profile_data.update({
                "grade_level": kwargs.pop("grade_level", fake.random_int(1, 8)),
                "date_of_birth": kwargs.pop("date_of_birth", fake.date_of_birth(minimum_age=6, maximum_age=16).isoformat()),
            })
        elif role == "parent":
            profile_data.update({
                "phone": kwargs.pop("phone", fake.phone_number()),
                "occupation": kwargs.pop("occupation", fake.job()),
            })
        elif role == "instructor":
            profile_data.update({
                "expertise": kwargs.pop("expertise", [fake.word() for _ in range(2)]),
                "bio": kwargs.pop("bio", fake.text(max_nb_chars=200)),
            })

        # Merge with any provided profile data
        if "profile_data" in kwargs:
            profile_data.update(kwargs.pop("profile_data"))

        # Create user
        user = User(
            email=email,
            password_hash=get_password_hash(password),
            role=role,
            is_active=is_active,
            is_verified=is_verified,
            profile_data=profile_data,
            **kwargs
        )

        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)

        return user

    @staticmethod
    def create_batch(
        db_session: Session,
        count: int,
        role: str = "student",
        **kwargs
    ) -> list[User]:
        """
        Create multiple test users.

        Args:
            db_session: Database session
            count: Number of users to create
            role: User role
            **kwargs: Additional user attributes

        Returns:
            list[User]: List of created users
        """
        return [
            UserFactory.create(db_session, role=role, **kwargs)
            for _ in range(count)
        ]


class CourseFactory:
    """Factory for creating Course instances."""

    @staticmethod
    def create(
        db_session: Session,
        creator_id,
        title: Optional[str] = None,
        description: Optional[str] = None,
        grade_levels: Optional[list[int]] = None,
        learning_area: Optional[str] = None,
        price: Optional[float] = None,
        is_published: bool = True,
        **kwargs
    ):
        """
        Create a test course.

        Args:
            db_session: Database session
            creator_id: ID of course creator (instructor/admin)
            title: Course title
            description: Course description
            grade_levels: List of grade levels (1-8)
            learning_area: CBC learning area
            price: Course price in KES
            is_published: Whether course is published
            **kwargs: Additional course attributes

        Returns:
            Course: Created course instance
        """
        from app.models.course import Course

        # Generate realistic course data
        learning_areas = [
            "Mathematics",
            "English",
            "Kiswahili",
            "Science and Technology",
            "Social Studies",
            "Religious Education",
            "Creative Arts",
            "Physical Education"
        ]

        course = Course(
            title=title or f"{fake.catch_phrase()} - {fake.word().title()} Course",
            description=description or fake.text(max_nb_chars=500),
            creator_id=creator_id,
            grade_levels=grade_levels or [fake.random_int(1, 8)],
            learning_area=learning_area or fake.random_element(learning_areas),
            price=price if price is not None else fake.random_int(1000, 10000),
            is_published=is_published,
            **kwargs
        )

        db_session.add(course)
        db_session.commit()
        db_session.refresh(course)

        return course


class StudentFactory:
    """Factory for creating Student instances."""

    @staticmethod
    def create(
        db_session: Session,
        user_id,
        admission_number: Optional[str] = None,
        grade_level: Optional[int] = None,
        parent_id=None,
        **kwargs
    ):
        """
        Create a test student.

        Args:
            db_session: Database session
            user_id: ID of associated user
            admission_number: Student admission number
            grade_level: Grade level (1-8)
            parent_id: ID of parent/guardian
            **kwargs: Additional student attributes

        Returns:
            Student: Created student instance
        """
        from app.models.student import Student

        student = Student(
            user_id=user_id,
            admission_number=admission_number or f"ADM{fake.random_number(6)}",
            grade_level=grade_level or fake.random_int(1, 8),
            parent_id=parent_id,
            learning_profile=kwargs.pop("learning_profile", {
                "learning_style": fake.random_element(["visual", "auditory", "kinesthetic"]),
                "strengths": [fake.word() for _ in range(2)],
                "weaknesses": [fake.word() for _ in range(2)],
            }),
            **kwargs
        )

        db_session.add(student)
        db_session.commit()
        db_session.refresh(student)

        return student


class EnrollmentFactory:
    """Factory for creating Enrollment instances."""

    @staticmethod
    def create(
        db_session: Session,
        student_id,
        course_id,
        status: str = "active",
        **kwargs
    ):
        """
        Create a test enrollment.

        Args:
            db_session: Database session
            student_id: ID of student
            course_id: ID of course
            status: Enrollment status
            **kwargs: Additional enrollment attributes

        Returns:
            Enrollment: Created enrollment instance
        """
        from app.models.enrollment import Enrollment

        enrollment = Enrollment(
            student_id=student_id,
            course_id=course_id,
            status=status,
            progress_percentage=kwargs.pop("progress_percentage", 0.0),
            **kwargs
        )

        db_session.add(enrollment)
        db_session.commit()
        db_session.refresh(enrollment)

        return enrollment


class AITutorFactory:
    """Factory for creating AITutor instances."""

    @staticmethod
    def create(
        db_session: Session,
        student_id,
        tutor_name: Optional[str] = None,
        **kwargs
    ):
        """
        Create a test AI tutor.

        Args:
            db_session: Database session
            student_id: ID of associated student
            tutor_name: Custom tutor name
            **kwargs: Additional tutor attributes

        Returns:
            AITutor: Created AI tutor instance
        """
        from app.models.ai_tutor import AITutor

        tutor = AITutor(
            student_id=student_id,
            tutor_name=tutor_name or fake.first_name(),
            conversation_history=kwargs.pop("conversation_history", []),
            response_mode=kwargs.pop("response_mode", "text"),
            performance_metrics=kwargs.pop("performance_metrics", {}),
            **kwargs
        )

        db_session.add(tutor)
        db_session.commit()
        db_session.refresh(tutor)

        return tutor


# Convenience function to create complete test scenarios
def create_student_with_tutor(db_session: Session, **kwargs):
    """
    Create a student user with associated student profile and AI tutor.

    Args:
        db_session: Database session
        **kwargs: Additional attributes

    Returns:
        tuple: (user, student, ai_tutor)
    """
    # Create user
    user = UserFactory.create(db_session, role="student", **kwargs.get("user_kwargs", {}))

    # Create student profile
    student = StudentFactory.create(
        db_session,
        user_id=user.id,
        **kwargs.get("student_kwargs", {})
    )

    # Create AI tutor
    ai_tutor = AITutorFactory.create(
        db_session,
        student_id=student.id,
        **kwargs.get("tutor_kwargs", {})
    )

    return user, student, ai_tutor
