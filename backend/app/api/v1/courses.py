"""
Course Management API Endpoints for Urban Home School

This module defines FastAPI routes for course management including:
- Course CRUD operations (create, read, update, delete)
- Course enrollment and progress tracking
- Course ratings and reviews
- Course search and filtering by CBC alignment
- Instructor course management
- Student enrollment management

Features:
- Role-based access control (students, instructors, admins)
- CBC-aligned course filtering
- Revenue sharing for external instructors (60/30/10 split)
- Progress tracking and completion certificates
"""

from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.models.enrollment import EnrollmentStatus
from app.schemas.course_schemas import (
    CourseCreate,
    CourseUpdate,
    CourseResponse,
    CourseWithDetails
)
from app.schemas.enrollment_schemas import (
    EnrollmentCreate,
    EnrollmentResponse,
    EnrollmentRatingRequest,
    LessonCompletionRequest,
    StudentEnrollmentListResponse,
    EnrollmentWithCourseDetails
)
from app.services.course_service import CourseService
from app.utils.security import get_current_user

# Create router with courses prefix
router = APIRouter(prefix="/courses", tags=["Courses"])


# ========================
# Course CRUD Endpoints
# ========================

@router.post(
    "/",
    response_model=CourseResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new course",
    description="Create a new course. Instructors can create courses, admins can create platform courses."
)
async def create_course(
    course_data: CourseCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> CourseResponse:
    """
    Create a new course.

    Permissions:
    - Instructors can create their own courses (revenue split: 60/30/10)
    - Admins can create platform courses (100% platform revenue)

    Args:
        course_data: Course creation data
        current_user: Authenticated user (from JWT token)
        db: Database session

    Returns:
        CourseResponse: Created course data

    Raises:
        HTTPException 403: If user is not an instructor or admin
        HTTPException 400: If validation fails
    """
    # Check permissions
    if current_user.role not in ['instructor', 'admin', 'external_instructor']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only instructors and admins can create courses"
        )

    try:
        # Determine if platform-created
        is_platform_created = current_user.role == 'admin'
        instructor_id = None if is_platform_created else current_user.id

        course = await CourseService.create_course(
            db=db,
            course_data=course_data,
            instructor_id=instructor_id,
            is_platform_created=is_platform_created
        )

        return CourseResponse.model_validate(course)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get(
    "/",
    response_model=dict,
    summary="List courses with filtering",
    description="Get paginated list of courses with optional filters for grade level, learning area, etc."
)
async def list_courses(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=100, description="Maximum number of records"),
    grade_level: Optional[str] = Query(None, description="Filter by grade level (e.g., 'Grade 1')"),
    learning_area: Optional[str] = Query(None, description="Filter by CBC learning area"),
    is_featured: Optional[bool] = Query(None, description="Filter featured courses"),
    search: Optional[str] = Query(None, description="Search in title and description"),
    instructor_id: Optional[UUID] = Query(None, description="Filter by instructor UUID"),
    db: AsyncSession = Depends(get_db)
) -> dict:
    """
    List published courses with optional filtering.

    Query Parameters:
    - skip: Pagination offset (default: 0)
    - limit: Max results per page (default: 20, max: 100)
    - grade_level: Filter by CBC grade level
    - learning_area: Filter by learning area (Mathematics, Science, etc.)
    - is_featured: Show only featured courses
    - search: Search query for title/description
    - instructor_id: Filter courses by specific instructor

    Returns:
        Dictionary with courses list, total count, and pagination info
    """
    try:
        courses, total = await CourseService.list_courses(
            db=db,
            skip=skip,
            limit=limit,
            grade_level=grade_level,
            learning_area=learning_area,
            is_published=True,
            is_featured=is_featured,
            search_query=search,
            instructor_id=instructor_id
        )

        return {
            "courses": [CourseResponse.model_validate(course) for course in courses],
            "total": total,
            "skip": skip,
            "limit": limit,
            "has_more": (skip + limit) < total
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list courses: {str(e)}"
        )


@router.get(
    "/{course_id}",
    response_model=CourseWithDetails,
    summary="Get course details",
    description="Get full details of a specific course including syllabus and lessons."
)
async def get_course(
    course_id: UUID,
    db: AsyncSession = Depends(get_db)
) -> CourseWithDetails:
    """
    Get detailed course information.

    Args:
        course_id: Course UUID
        db: Database session

    Returns:
        CourseWithDetails: Full course information

    Raises:
        HTTPException 404: If course not found
    """
    course = await CourseService.get_course_by_id(db, course_id)

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    return CourseWithDetails.model_validate(course)


@router.put(
    "/{course_id}",
    response_model=CourseResponse,
    summary="Update course",
    description="Update course details. Only course instructor or admin can update."
)
async def update_course(
    course_id: UUID,
    course_data: CourseUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> CourseResponse:
    """
    Update an existing course.

    Permissions:
    - Course instructor can update their own course
    - Admins can update any course

    Args:
        course_id: Course UUID
        course_data: Course update data
        current_user: Authenticated user
        db: Database session

    Returns:
        CourseResponse: Updated course data

    Raises:
        HTTPException 404: If course not found
        HTTPException 403: If user doesn't have permission
    """
    # Get course
    course = await CourseService.get_course_by_id(db, course_id, include_unpublished=True)

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    # Check permissions
    is_owner = course.instructor_id == current_user.id
    is_admin = current_user.role == 'admin'

    if not (is_owner or is_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to update this course"
        )

    try:
        updated_course = await CourseService.update_course(db, course_id, course_data)

        if not updated_course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found"
            )

        return CourseResponse.model_validate(updated_course)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.delete(
    "/{course_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete course",
    description="Soft delete a course (unpublish). Only course instructor or admin can delete."
)
async def delete_course(
    course_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete (unpublish) a course.

    Permissions:
    - Course instructor can delete their own course
    - Admins can delete any course

    Note: This is a soft delete - course is unpublished, not removed from database.

    Args:
        course_id: Course UUID
        current_user: Authenticated user
        db: Database session

    Raises:
        HTTPException 404: If course not found
        HTTPException 403: If user doesn't have permission
    """
    # Get course
    course = await CourseService.get_course_by_id(db, course_id, include_unpublished=True)

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    # Check permissions
    is_owner = course.instructor_id == current_user.id
    is_admin = current_user.role == 'admin'

    if not (is_owner or is_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this course"
        )

    success = await CourseService.delete_course(db, course_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )


# ========================
# Enrollment Endpoints
# ========================

@router.post(
    "/{course_id}/enroll",
    response_model=EnrollmentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Enroll in a course",
    description="Enroll the current student in a course. Handles payment verification for paid courses."
)
async def enroll_in_course(
    course_id: UUID,
    payment_id: Optional[UUID] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> EnrollmentResponse:
    """
    Enroll current user in a course.

    For paid courses, payment_id must be provided.
    For free courses, enrollment is immediate.

    Args:
        course_id: Course UUID to enroll in
        payment_id: Payment transaction UUID (required for paid courses)
        current_user: Authenticated user (must be student)
        db: Database session

    Returns:
        EnrollmentResponse: Created enrollment data

    Raises:
        HTTPException 403: If user is not a student
        HTTPException 400: If already enrolled or payment required
        HTTPException 404: If course not found
    """
    # Check if user is a student
    if current_user.role != 'student':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can enroll in courses"
        )

    # Get course to check price
    course = await CourseService.get_course_by_id(db, course_id)
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found or not published"
        )

    # Validate payment for paid courses
    if course.is_paid and not payment_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment required for this course"
        )

    try:
        # Create enrollment
        enrollment_data = EnrollmentCreate(
            student_id=current_user.id,
            course_id=course_id,
            payment_id=payment_id,
            payment_amount=course.price
        )

        enrollment = await CourseService.enroll_student(db, enrollment_data)

        return EnrollmentResponse.model_validate(enrollment)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get(
    "/my-enrollments",
    response_model=List[EnrollmentResponse],
    summary="Get my enrollments",
    description="Get all course enrollments for the current student."
)
async def get_my_enrollments(
    status_filter: Optional[str] = Query(None, description="Filter by status (active, completed, dropped)"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> List[EnrollmentResponse]:
    """
    Get enrollments for the current user.

    Args:
        status_filter: Optional status filter (active, completed, dropped)
        current_user: Authenticated user (must be student)
        db: Database session

    Returns:
        List of EnrollmentResponse objects

    Raises:
        HTTPException 403: If user is not a student
    """
    if current_user.role != 'student':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students have enrollments"
        )

    # Parse status filter
    status_enum = None
    if status_filter:
        try:
            status_enum = EnrollmentStatus(status_filter.lower())
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status filter. Must be one of: {[s.value for s in EnrollmentStatus]}"
            )

    enrollments = await CourseService.get_student_enrollments(
        db=db,
        student_id=current_user.id,
        status=status_enum
    )

    return [EnrollmentResponse.model_validate(e) for e in enrollments]


@router.post(
    "/enrollments/{enrollment_id}/complete-lesson",
    response_model=EnrollmentResponse,
    summary="Mark lesson as completed",
    description="Mark a lesson as completed and update progress."
)
async def complete_lesson(
    enrollment_id: UUID,
    lesson_data: LessonCompletionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> EnrollmentResponse:
    """
    Mark a lesson as completed for an enrollment.

    Args:
        enrollment_id: Enrollment UUID
        lesson_data: Lesson completion data (lesson_id, time_spent)
        current_user: Authenticated user (must be the enrolled student)
        db: Database session

    Returns:
        EnrollmentResponse: Updated enrollment data

    Raises:
        HTTPException 404: If enrollment not found
        HTTPException 403: If user is not the enrolled student
    """
    # TODO: Add authorization check that current_user owns this enrollment
    # TODO: Get total lessons from course to calculate progress

    try:
        total_lessons = 10  # Placeholder - should get from course

        enrollment = await CourseService.update_enrollment_progress(
            db=db,
            enrollment_id=enrollment_id,
            completed_lesson_id=lesson_data.lesson_id,
            total_lessons=total_lessons,
            time_spent_minutes=lesson_data.time_spent_minutes
        )

        if not enrollment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Enrollment not found"
            )

        return EnrollmentResponse.model_validate(enrollment)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update progress: {str(e)}"
        )


@router.post(
    "/enrollments/{enrollment_id}/rate",
    response_model=EnrollmentResponse,
    summary="Rate a course",
    description="Submit a rating and review for a course after enrollment."
)
async def rate_course(
    enrollment_id: UUID,
    rating_data: EnrollmentRatingRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> EnrollmentResponse:
    """
    Rate and review a course.

    Students can rate courses they are enrolled in.

    Args:
        enrollment_id: Enrollment UUID
        rating_data: Rating and review data
        current_user: Authenticated user (must be the enrolled student)
        db: Database session

    Returns:
        EnrollmentResponse: Updated enrollment data with rating

    Raises:
        HTTPException 404: If enrollment not found
        HTTPException 403: If user is not the enrolled student
        HTTPException 400: If rating is invalid
    """
    # TODO: Add authorization check that current_user owns this enrollment

    try:
        result = await CourseService.rate_course(
            db=db,
            enrollment_id=enrollment_id,
            rating=rating_data.rating,
            review=rating_data.review
        )

        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Enrollment not found"
            )

        enrollment, course = result

        return EnrollmentResponse.model_validate(enrollment)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
