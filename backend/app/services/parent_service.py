"""
Parent-Student Linking Service

Handles linking parents to students, retrieving children's progress,
and managing the parent-student relationship.
"""

import logging
from typing import List
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.student import Student
from app.models.user import User
from app.models.enrollment import Enrollment
from app.models.course import Course
from app.models.ai_tutor import AITutor

logger = logging.getLogger(__name__)


async def link_student_to_parent(
    parent_id: UUID,
    admission_number: str,
    db: AsyncSession,
) -> Student:
    """
    Link a student to a parent by admission number.

    Args:
        parent_id: The parent user's UUID
        admission_number: Student's admission number
        db: Database session

    Returns:
        The updated Student record

    Raises:
        HTTPException 404: Student not found
        HTTPException 400: Student already linked to another parent
    """
    result = await db.execute(
        select(Student).where(Student.admission_number == admission_number)
    )
    student = result.scalars().first()

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No student found with that admission number",
        )

    if student.parent_id and student.parent_id != parent_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This student is already linked to another parent",
        )

    if student.parent_id == parent_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This student is already linked to you",
        )

    student.parent_id = parent_id
    await db.commit()
    await db.refresh(student)

    return student


async def unlink_student_from_parent(
    parent_id: UUID,
    student_id: UUID,
    db: AsyncSession,
) -> None:
    """
    Unlink a student from a parent.

    Args:
        parent_id: The parent user's UUID
        student_id: The student record's UUID
        db: Database session

    Raises:
        HTTPException 404: Student not found or not linked to this parent
    """
    result = await db.execute(
        select(Student).where(Student.id == student_id, Student.parent_id == parent_id)
    )
    student = result.scalars().first()

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found or not linked to you",
        )

    student.parent_id = None
    await db.commit()


async def get_children(parent_id: UUID, db: AsyncSession) -> List[dict]:
    """
    Get all students linked to a parent.

    Returns a list of child summary dicts with user profile data merged in.
    """
    result = await db.execute(
        select(Student).where(Student.parent_id == parent_id)
    )
    students = result.scalars().all()

    children = []
    for student in students:
        # Fetch the student's user record for name
        user_result = await db.execute(
            select(User).where(User.id == student.user_id)
        )
        user = user_result.scalars().first()
        full_name = (user.profile_data or {}).get("full_name") if user else None

        children.append({
            "student_id": student.id,
            "user_id": student.user_id,
            "admission_number": student.admission_number,
            "full_name": full_name,
            "grade_level": student.grade_level,
            "is_active": student.is_active,
            "enrollment_date": student.enrollment_date,
        })

    return children


async def get_child_progress(
    parent_id: UUID,
    student_id: UUID,
    db: AsyncSession,
) -> dict:
    """
    Get detailed progress for a specific child.

    Includes learning profile, competencies, enrolled courses, and AI tutor stats.

    Raises:
        HTTPException 404: Student not found or not linked to this parent
    """
    result = await db.execute(
        select(Student).where(Student.id == student_id, Student.parent_id == parent_id)
    )
    student = result.scalars().first()

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found or not linked to you",
        )

    # Get user profile name
    user_result = await db.execute(
        select(User).where(User.id == student.user_id)
    )
    user = user_result.scalars().first()
    full_name = (user.profile_data or {}).get("full_name") if user else None

    # Get enrolled courses
    enrollments_result = await db.execute(
        select(Enrollment).where(Enrollment.student_id == student.id)
    )
    enrollments = enrollments_result.scalars().all()

    enrolled_courses = []
    for enrollment in enrollments:
        course_result = await db.execute(
            select(Course).where(Course.id == enrollment.course_id)
        )
        course = course_result.scalars().first()
        if course:
            enrolled_courses.append({
                "course_id": str(course.id),
                "title": course.title,
                "progress_percentage": enrollment.progress_percentage,
                "status": enrollment.status.value if hasattr(enrollment.status, 'value') else str(enrollment.status),
            })

    # Get AI tutor interaction count
    tutor_result = await db.execute(
        select(AITutor).where(AITutor.student_id == student.id)
    )
    tutor = tutor_result.scalars().first()
    total_interactions = tutor.total_interactions if tutor else 0

    return {
        "student_id": student.id,
        "admission_number": student.admission_number,
        "full_name": full_name,
        "grade_level": student.grade_level,
        "learning_profile": student.learning_profile or {},
        "competencies": student.competencies or {},
        "overall_performance": student.overall_performance or {},
        "enrolled_courses": enrolled_courses,
        "total_interactions_with_tutor": total_interactions,
    }
