"""
Assessment Service - Business Logic for Assessments and Submissions

Handles quiz/assignment CRUD, student submissions, and auto-grading.

This module provides functions for:
- Listing and retrieving assessments with pagination and filtering
- Creating new assessments (quizzes, assignments, projects, exams)
- Submitting student answers with automatic grading for supported types
- Retrieving student submission history
- Auto-grading logic for multiple choice, true/false, and short answer questions

All database operations are async and accept an AsyncSession.
"""

import logging
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from app.models.assessment import Assessment, AssessmentSubmission
from app.models.student import Student

logger = logging.getLogger(__name__)


async def list_assessments(
    db: AsyncSession,
    course_id: Optional[UUID] = None,
    assessment_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
) -> Dict[str, Any]:
    """
    List published assessments with optional filtering and pagination.

    Accepts optional course_id and assessment_type to narrow down results.
    Returns a dictionary with the assessments list, total count, current page,
    and page size. Only published assessments are returned.

    The db session is the async database connection. course_id filters by
    course, assessment_type filters by type (quiz, assignment, etc.). skip
    and limit control pagination.

    Returns a dict with keys: assessments, total, page, page_size.
    """
    query = select(Assessment).where(Assessment.is_published == True)

    if course_id:
        query = query.where(Assessment.course_id == course_id)
    if assessment_type:
        query = query.where(Assessment.assessment_type == assessment_type)

    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Get paginated results
    query = query.order_by(desc(Assessment.created_at)).offset(skip).limit(limit)
    result = await db.execute(query)
    assessments = result.scalars().all()

    return {
        "assessments": assessments,
        "total": total,
        "page": skip // limit + 1 if limit > 0 else 1,
        "page_size": limit,
    }


async def get_assessment(db: AsyncSession, assessment_id: UUID) -> Optional[Assessment]:
    """
    Get a single assessment by its UUID.

    Accepts a database session and the assessment UUID. Returns the
    Assessment model instance if found, or None if no assessment
    matches the given ID.
    """
    result = await db.execute(
        select(Assessment).where(Assessment.id == assessment_id)
    )
    return result.scalar_one_or_none()


async def create_assessment(
    db: AsyncSession,
    creator_id: UUID,
    data: Dict[str, Any],
) -> Assessment:
    """
    Create a new assessment record in the database.

    Accepts a database session, the creator's user UUID, and a data dict
    containing fields like course_id, title, description, assessment_type,
    questions (as a JSON list), total_points, passing_score, etc.

    Defaults to quiz type, 100 total points, 50 passing score, auto-gradable,
    and 1 max attempt if not specified. The assessment starts unpublished.

    Returns the newly created Assessment instance with its generated UUID.
    """
    assessment = Assessment(
        course_id=data["course_id"],
        creator_id=creator_id,
        title=data["title"],
        description=data.get("description"),
        assessment_type=data.get("assessment_type", "quiz"),
        questions=data.get("questions", []),
        total_points=data.get("total_points", 100),
        passing_score=data.get("passing_score", 50),
        auto_gradable=data.get("auto_gradable", True),
        duration_minutes=data.get("duration_minutes"),
        is_published=data.get("is_published", False),
        available_from=data.get("available_from"),
        available_until=data.get("available_until"),
        max_attempts=data.get("max_attempts", 1),
    )
    db.add(assessment)
    await db.flush()
    await db.refresh(assessment)
    return assessment


async def submit_assessment(
    db: AsyncSession,
    assessment_id: UUID,
    student_id: UUID,
    answers: Dict[str, Any],
) -> AssessmentSubmission:
    """
    Submit answers for an assessment and auto-grade if applicable.

    Accepts the database session, assessment UUID, student UUID, and an
    answers dict mapping question IDs to student responses.

    Checks that the assessment exists and that the student has not exceeded
    the maximum allowed attempts. If the assessment is auto-gradable and has
    questions defined, scores the submission immediately using _auto_grade().

    Returns the created AssessmentSubmission instance.

    Raises ValueError if the assessment is not found or if the student has
    already used all allowed attempts.
    """
    # Get the assessment
    assessment = await get_assessment(db, assessment_id)
    if not assessment:
        raise ValueError("Assessment not found")

    # Check attempt count
    attempt_result = await db.execute(
        select(func.count()).select_from(AssessmentSubmission).where(
            AssessmentSubmission.assessment_id == assessment_id,
            AssessmentSubmission.student_id == student_id,
        )
    )
    attempt_count = attempt_result.scalar() or 0

    if assessment.max_attempts and attempt_count >= assessment.max_attempts:
        raise ValueError(f"Maximum attempts ({assessment.max_attempts}) reached")

    # Create submission
    submission = AssessmentSubmission(
        assessment_id=assessment_id,
        student_id=student_id,
        answers=answers,
        attempt_number=attempt_count + 1,
        is_submitted=True,
        submitted_at=datetime.utcnow(),
    )

    # Auto-grade if the assessment supports it
    if assessment.auto_gradable and assessment.questions:
        score = _auto_grade(assessment.questions, answers)
        submission.score = score
        submission.is_graded = True
        submission.graded_by = None  # auto-graded
        submission.graded_at = datetime.utcnow()

    db.add(submission)

    # Update assessment stats
    assessment.total_submissions = (assessment.total_submissions or 0) + 1

    await db.flush()
    await db.refresh(submission)
    return submission


async def get_student_submissions(
    db: AsyncSession,
    student_id: UUID,
    assessment_id: Optional[UUID] = None,
    skip: int = 0,
    limit: int = 20,
) -> List[AssessmentSubmission]:
    """
    Get a student's assessment submissions with optional filtering.

    Accepts the database session, student UUID, and an optional assessment
    UUID to filter results for a specific assessment. Uses skip and limit
    for pagination. Results are ordered by creation date, newest first.

    Returns a list of AssessmentSubmission instances.
    """
    query = select(AssessmentSubmission).where(
        AssessmentSubmission.student_id == student_id
    )
    if assessment_id:
        query = query.where(AssessmentSubmission.assessment_id == assessment_id)

    query = query.order_by(desc(AssessmentSubmission.created_at)).offset(skip).limit(limit)
    result = await db.execute(query)
    return list(result.scalars().all())


def _auto_grade(questions: list, answers: Dict[str, Any]) -> int:
    """
    Auto-grade student answers against the assessment questions.

    Iterates through each question and compares the student's answer to the
    correct answer. Supports multiple_choice, true_false, and short_answer
    question types with case-insensitive string comparison. Essay questions
    are skipped since they require manual grading.

    Accepts the questions list (from the assessment JSONB column) and the
    answers dict mapping question IDs to student responses.

    Returns the total score as an integer sum of points earned.
    """
    total_score = 0

    for question in questions:
        q_id = str(question.get("id", ""))
        q_type = question.get("type", "")
        correct = question.get("correct_answer")
        points = question.get("points", 1)
        student_answer = answers.get(q_id)

        if student_answer is None:
            continue

        if q_type in ("multiple_choice", "true_false"):
            if str(student_answer).strip().lower() == str(correct).strip().lower():
                total_score += points
        elif q_type == "short_answer":
            if str(student_answer).strip().lower() == str(correct).strip().lower():
                total_score += points
        # Essay questions require manual grading — skip

    return total_score
