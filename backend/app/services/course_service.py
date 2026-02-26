"""
Course Service Layer for Urban Home School

This module contains business logic for course management operations.
It handles course CRUD, enrollments, ratings, and CBC alignment validation.

Key Features:
- Course creation and updates with CBC validation
- Enrollment management (enroll, track progress, complete)
- Course search and filtering by grade level, learning area
- Revenue sharing calculations (60/30/10 split)
- Rating and review aggregation
- Course analytics and statistics
"""

from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from uuid import UUID

from sqlalchemy import select, func, and_, or_, not_, any_, literal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.models.course import Course
from app.models.enrollment import Enrollment, EnrollmentStatus
from app.models.user import User
from app.schemas.course_schemas import CourseCreate, CourseUpdate
from app.schemas.enrollment_schemas import EnrollmentCreate


class CourseService:
    """Service class for course-related business logic"""

    @staticmethod
    async def create_course(
        db: AsyncSession,
        course_data: CourseCreate,
        instructor_id: Optional[UUID] = None,
        is_platform_created: bool = False
    ) -> Course:
        """
        Create a new course.

        Args:
            db: Database session
            course_data: Course creation data
            instructor_id: UUID of the instructor creating the course (None for platform courses)
            is_platform_created: Whether this is a platform-created course

        Returns:
            Created Course instance

        Raises:
            ValueError: If validation fails
        """
        # Create course instance
        course = Course(
            title=course_data.title,
            description=course_data.description,
            thumbnail_url=course_data.thumbnail_url,
            grade_levels=course_data.grade_levels,
            learning_area=course_data.learning_area,
            syllabus=course_data.syllabus,
            lessons=course_data.lessons,
            instructor_id=instructor_id,
            is_platform_created=is_platform_created,
            price=course_data.price,
            currency=course_data.currency,
            estimated_duration_hours=course_data.estimated_duration_hours,
            competencies=course_data.competencies,
            is_published=False  # Courses start as unpublished
        )

        db.add(course)
        await db.commit()
        await db.refresh(course)

        return course

    @staticmethod
    async def get_course_by_id(
        db: AsyncSession,
        course_id: UUID,
        include_unpublished: bool = False
    ) -> Optional[Course]:
        """
        Get a course by ID.

        Args:
            db: Database session
            course_id: Course UUID
            include_unpublished: Whether to include unpublished courses

        Returns:
            Course instance or None if not found
        """
        query = select(Course).where(Course.id == course_id)

        if not include_unpublished:
            query = query.where(Course.is_published == True)

        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def list_courses(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 20,
        grade_level: Optional[str] = None,
        learning_area: Optional[str] = None,
        is_published: bool = True,
        is_featured: Optional[bool] = None,
        search_query: Optional[str] = None,
        instructor_id: Optional[UUID] = None,
        audience: Optional[str] = None,
        is_free: Optional[bool] = None,
        course_code: Optional[str] = None,
    ) -> tuple[List[Course], int]:
        """
        List courses with filtering and pagination.

        Args:
            db: Database session
            skip: Number of records to skip (offset)
            limit: Maximum number of records to return
            grade_level: Filter by specific grade level
            learning_area: Filter by CBC learning area
            is_published: Filter by publication status (default: True)
            is_featured: Filter by featured status (None = all)
            search_query: Search in title and description
            instructor_id: Filter by instructor UUID

        Returns:
            Tuple of (list of courses, total count)
        """
        # Base query
        query = select(Course)
        count_query = select(func.count(Course.id))

        # Apply filters
        filters = []

        if is_published is not None:
            filters.append(Course.is_published == is_published)

        if is_featured is not None:
            filters.append(Course.is_featured == is_featured)

        if grade_level:
            # any_() checks if grade_level equals ANY element in the grade_levels array
            filters.append(literal(grade_level) == any_(Course.grade_levels))

        # Audience filter: separate student courses from teacher resources
        if audience == "students":
            filters.append(
                not_(or_(
                    literal("Teacher's Guide") == any_(Course.grade_levels),
                    literal("Diploma") == any_(Course.grade_levels),
                ))
            )
        elif audience == "teachers":
            filters.append(
                or_(
                    literal("Teacher's Guide") == any_(Course.grade_levels),
                    literal("Diploma") == any_(Course.grade_levels),
                )
            )
        elif audience == "revision":
            filters.append(Course.title.ilike("%Revision%"))

        if is_free is True:
            filters.append(Course.price == 0)
        elif is_free is False:
            filters.append(Course.price > 0)

        if learning_area:
            filters.append(Course.learning_area == learning_area)

        if instructor_id:
            filters.append(Course.instructor_id == instructor_id)

        if course_code:
            filters.append(Course.course_code == course_code)

        if search_query:
            search_filter = or_(
                Course.title.ilike(f"%{search_query}%"),
                Course.description.ilike(f"%{search_query}%")
            )
            filters.append(search_filter)

        if filters:
            query = query.where(and_(*filters))
            count_query = count_query.where(and_(*filters))

        # Get total count
        total_result = await db.execute(count_query)
        total = total_result.scalar_one()

        # Apply pagination and ordering
        query = query.order_by(Course.created_at.desc()).offset(skip).limit(limit)

        # Execute query
        result = await db.execute(query)
        courses = result.scalars().all()

        return list(courses), total

    @staticmethod
    async def update_course(
        db: AsyncSession,
        course_id: UUID,
        course_data: CourseUpdate
    ) -> Optional[Course]:
        """
        Update an existing course.

        Args:
            db: Database session
            course_id: Course UUID
            course_data: Course update data

        Returns:
            Updated Course instance or None if not found
        """
        course = await CourseService.get_course_by_id(db, course_id, include_unpublished=True)

        if not course:
            return None

        # Update fields that are provided
        update_dict = course_data.model_dump(exclude_unset=True)

        for field, value in update_dict.items():
            setattr(course, field, value)

        # Update published_at timestamp when publishing
        if course_data.is_published and not course.published_at:
            course.published_at = datetime.utcnow()

        course.updated_at = datetime.utcnow()

        await db.commit()
        await db.refresh(course)

        return course

    @staticmethod
    async def delete_course(db: AsyncSession, course_id: UUID) -> bool:
        """
        Delete a course (soft delete - just unpublish).

        Args:
            db: Database session
            course_id: Course UUID

        Returns:
            True if deleted, False if not found
        """
        course = await CourseService.get_course_by_id(db, course_id, include_unpublished=True)

        if not course:
            return False

        # Soft delete by unpublishing
        course.is_published = False
        course.updated_at = datetime.utcnow()

        await db.commit()

        return True

    @staticmethod
    async def enroll_student(
        db: AsyncSession,
        enrollment_data: EnrollmentCreate
    ) -> Enrollment:
        """
        Enroll a student in a course.

        Args:
            db: Database session
            enrollment_data: Enrollment creation data

        Returns:
            Created Enrollment instance

        Raises:
            ValueError: If student is already enrolled or course doesn't exist
        """
        # Check if course exists and is published
        course = await CourseService.get_course_by_id(db, enrollment_data.course_id)
        if not course:
            raise ValueError("Course not found or not published")

        # Check if already enrolled
        existing_query = select(Enrollment).where(
            and_(
                Enrollment.student_id == enrollment_data.student_id,
                Enrollment.course_id == enrollment_data.course_id,
                Enrollment.is_deleted == False
            )
        )
        result = await db.execute(existing_query)
        existing_enrollment = result.scalar_one_or_none()

        if existing_enrollment:
            raise ValueError("Student is already enrolled in this course")

        # Create enrollment
        enrollment = Enrollment(
            student_id=enrollment_data.student_id,
            course_id=enrollment_data.course_id,
            payment_id=enrollment_data.payment_id,
            payment_amount=enrollment_data.payment_amount,
            status=EnrollmentStatus.ACTIVE if course.is_free else EnrollmentStatus.PENDING_PAYMENT
        )

        # Update course enrollment count
        course.enrollment_count += 1

        db.add(enrollment)
        await db.commit()
        await db.refresh(enrollment)

        return enrollment

    @staticmethod
    async def get_student_enrollments(
        db: AsyncSession,
        student_id: UUID,
        status: Optional[EnrollmentStatus] = None
    ) -> List[Enrollment]:
        """
        Get all enrollments for a student.

        Args:
            db: Database session
            student_id: Student UUID
            status: Filter by enrollment status (None = all active statuses)

        Returns:
            List of Enrollment instances
        """
        query = select(Enrollment).where(
            and_(
                Enrollment.student_id == student_id,
                Enrollment.is_deleted == False
            )
        )

        if status:
            query = query.where(Enrollment.status == status)

        query = query.order_by(Enrollment.enrolled_at.desc())

        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def update_enrollment_progress(
        db: AsyncSession,
        enrollment_id: UUID,
        completed_lesson_id: str,
        total_lessons: int,
        time_spent_minutes: int = 0
    ) -> Optional[Enrollment]:
        """
        Update enrollment progress when a lesson is completed.

        Args:
            db: Database session
            enrollment_id: Enrollment UUID
            completed_lesson_id: ID of the completed lesson
            total_lessons: Total number of lessons in the course
            time_spent_minutes: Time spent on the lesson

        Returns:
            Updated Enrollment instance or None if not found
        """
        query = select(Enrollment).where(Enrollment.id == enrollment_id)
        result = await db.execute(query)
        enrollment = result.scalar_one_or_none()

        if not enrollment:
            return None

        # Mark lesson as complete
        enrollment.mark_lesson_complete(completed_lesson_id)

        # Update time spent
        enrollment.total_time_spent_minutes += time_spent_minutes

        # Recalculate progress
        enrollment.update_progress(total_lessons)

        await db.commit()
        await db.refresh(enrollment)

        return enrollment

    @staticmethod
    async def rate_course(
        db: AsyncSession,
        enrollment_id: UUID,
        rating: int,
        review: Optional[str] = None
    ) -> Optional[tuple[Enrollment, Course]]:
        """
        Rate a course after enrollment.

        Args:
            db: Database session
            enrollment_id: Enrollment UUID
            rating: Integer rating from 1 to 5
            review: Optional text review

        Returns:
            Tuple of (Updated Enrollment, Updated Course) or None if not found

        Raises:
            ValueError: If rating is invalid
        """
        # Get enrollment with course
        query = select(Enrollment).where(Enrollment.id == enrollment_id)
        result = await db.execute(query)
        enrollment = result.scalar_one_or_none()

        if not enrollment:
            return None

        # Get course
        course = await CourseService.get_course_by_id(db, enrollment.course_id, include_unpublished=True)
        if not course:
            return None

        # Add rating to enrollment
        enrollment.add_rating(rating, review)

        # Update course rating
        course.update_rating(float(rating))

        await db.commit()
        await db.refresh(enrollment)
        await db.refresh(course)

        return enrollment, course
