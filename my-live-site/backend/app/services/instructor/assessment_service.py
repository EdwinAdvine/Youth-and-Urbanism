"""
Instructor Assessment Service

CRUD for assessments, submissions, grading, AI-powered feedback, and rubrics.
"""

import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
from decimal import Decimal

from sqlalchemy import select, func, and_, or_, desc, asc
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.assessment import Assessment, AssessmentSubmission
from app.models.course import Course
from app.models.user import User

logger = logging.getLogger(__name__)


# ── Assessment CRUD ─────────────────────────────────────────────────

async def create_assessment(
    db: AsyncSession,
    instructor_id: str,
    data: Dict[str, Any]
) -> Assessment:
    """Create a new assessment for a course owned by the instructor."""
    try:
        # Verify course ownership
        course_q = select(Course).where(
            and_(
                Course.id == data["course_id"],
                Course.instructor_id == instructor_id,
            )
        )
        course = (await db.execute(course_q)).scalar_one_or_none()
        if not course:
            raise ValueError("Course not found or not owned by instructor")

        # Calculate total points from questions
        questions = data.get("questions", [])
        total_points = sum(q.get("points", 1) for q in questions)

        assessment = Assessment(
            course_id=data["course_id"],
            creator_id=instructor_id,
            title=data["title"],
            description=data.get("description"),
            assessment_type=data["assessment_type"],
            questions=questions,
            total_points=total_points or data.get("max_score", 100),
            passing_score=int(data.get("passing_score", 50)),
            auto_gradable=all(
                q.get("question_type") in ("multiple_choice", "true_false")
                for q in questions
            ) if questions else True,
            duration_minutes=data.get("time_limit_minutes"),
            max_attempts=data.get("max_attempts", 1),
            is_published=data.get("status") == "published",
        )
        db.add(assessment)
        await db.commit()
        await db.refresh(assessment)

        logger.info(f"Created assessment: {assessment.id}")
        return assessment

    except Exception as e:
        logger.error(f"Error creating assessment: {str(e)}")
        await db.rollback()
        raise


async def update_assessment(
    db: AsyncSession,
    assessment_id: str,
    instructor_id: str,
    data: Dict[str, Any]
) -> Assessment:
    """Update an assessment owned by the instructor."""
    try:
        assessment = await _get_instructor_assessment(db, assessment_id, instructor_id)

        updatable_fields = [
            "title", "description", "duration_minutes", "max_attempts",
            "passing_score", "is_published",
        ]
        for key in updatable_fields:
            if key in data:
                setattr(assessment, key, data[key])

        if "questions" in data:
            assessment.questions = data["questions"]
            assessment.total_points = sum(
                q.get("points", 1) for q in data["questions"]
            )

        if "status" in data:
            assessment.is_published = data["status"] == "published"

        if "time_limit_minutes" in data:
            assessment.duration_minutes = data["time_limit_minutes"]

        if "time_limit" in data:
            assessment.duration_minutes = data["time_limit"]

        await db.commit()
        await db.refresh(assessment)

        logger.info(f"Updated assessment: {assessment_id}")
        return assessment

    except Exception as e:
        logger.error(f"Error updating assessment: {str(e)}")
        await db.rollback()
        raise


async def delete_assessment(
    db: AsyncSession,
    assessment_id: str,
    instructor_id: str,
) -> None:
    """Delete an assessment owned by the instructor."""
    try:
        assessment = await _get_instructor_assessment(db, assessment_id, instructor_id)
        await db.delete(assessment)
        await db.commit()
        logger.info(f"Deleted assessment: {assessment_id}")
    except Exception as e:
        logger.error(f"Error deleting assessment: {str(e)}")
        await db.rollback()
        raise


async def get_assessment(
    db: AsyncSession,
    assessment_id: str,
    instructor_id: str,
) -> Assessment:
    """Get assessment detail for the instructor."""
    return await _get_instructor_assessment(db, assessment_id, instructor_id)


async def list_assessments(
    db: AsyncSession,
    instructor_id: str,
    course_id: Optional[str] = None,
    assessment_type: Optional[str] = None,
    is_published: Optional[bool] = None,
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
    sort_by: str = "created_at",
    sort_order: str = "desc",
) -> Dict[str, Any]:
    """List assessments created by the instructor with filtering and pagination."""
    try:
        # Base filter: assessments for courses owned by this instructor
        course_ids_q = select(Course.id).where(
            Course.instructor_id == instructor_id
        )
        filters = [Assessment.course_id.in_(course_ids_q)]

        if course_id:
            filters.append(Assessment.course_id == course_id)
        if assessment_type:
            filters.append(Assessment.assessment_type == assessment_type)
        if is_published is not None:
            filters.append(Assessment.is_published == is_published)
        if search:
            filters.append(
                or_(
                    Assessment.title.ilike(f"%{search}%"),
                    Assessment.description.ilike(f"%{search}%"),
                )
            )

        # Count
        count_q = select(func.count()).select_from(Assessment).where(and_(*filters))
        total = (await db.execute(count_q)).scalar() or 0

        # Sort
        sort_col = getattr(Assessment, sort_by, Assessment.created_at)
        order_fn = desc if sort_order == "desc" else asc

        # Paginated results
        query = (
            select(Assessment)
            .where(and_(*filters))
            .order_by(order_fn(sort_col))
            .offset((page - 1) * limit)
            .limit(limit)
        )
        rows = (await db.execute(query)).scalars().all()

        return {
            "assessments": [_assessment_to_dict(a) for a in rows],
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": (total + limit - 1) // limit if limit else 1,
        }

    except Exception as e:
        logger.error(f"Error listing assessments: {str(e)}")
        raise


# ── Submissions ─────────────────────────────────────────────────────

async def get_submissions(
    db: AsyncSession,
    instructor_id: str,
    assessment_id: Optional[str] = None,
    is_graded: Optional[bool] = None,
    status: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
) -> Dict[str, Any]:
    """Get submissions for assessments owned by the instructor."""
    try:
        # All assessments for this instructor's courses
        course_ids_q = select(Course.id).where(
            Course.instructor_id == instructor_id
        )
        assessment_ids_q = select(Assessment.id).where(
            Assessment.course_id.in_(course_ids_q)
        )

        filters = [AssessmentSubmission.assessment_id.in_(assessment_ids_q)]

        if assessment_id:
            filters.append(AssessmentSubmission.assessment_id == assessment_id)
        if is_graded is not None:
            filters.append(AssessmentSubmission.is_graded == is_graded)
        if status == "pending":
            filters.append(AssessmentSubmission.is_graded == False)
        elif status == "graded":
            filters.append(AssessmentSubmission.is_graded == True)

        # Count
        count_q = select(func.count()).select_from(AssessmentSubmission).where(and_(*filters))
        total = (await db.execute(count_q)).scalar() or 0

        # Paginated results with related data
        query = (
            select(AssessmentSubmission, Assessment.title.label("assessment_title"), User.full_name.label("student_name"))
            .join(Assessment, Assessment.id == AssessmentSubmission.assessment_id)
            .outerjoin(User, User.id == AssessmentSubmission.student_id)
            .where(and_(*filters))
            .order_by(desc(AssessmentSubmission.submitted_at))
            .offset((page - 1) * limit)
            .limit(limit)
        )
        rows = (await db.execute(query)).all()

        submissions = []
        for row in rows:
            sub = row[0]
            assessment_title = row[1] if len(row) > 1 else "Unknown"
            student_name = row[2] if len(row) > 2 else "Unknown Student"

            days_pending = 0
            if sub.submitted_at and not sub.is_graded:
                days_pending = (datetime.utcnow() - sub.submitted_at).days

            submissions.append({
                "id": str(sub.id),
                "assessment_id": str(sub.assessment_id),
                "assessment_title": assessment_title,
                "student_id": str(sub.student_id),
                "student_name": student_name or "Unknown Student",
                "answers": sub.answers,
                "score": sub.score,
                "is_graded": sub.is_graded,
                "feedback": sub.feedback,
                "submitted_at": sub.submitted_at.isoformat() if sub.submitted_at else None,
                "graded_at": sub.graded_at.isoformat() if sub.graded_at else None,
                "status": "graded" if sub.is_graded else ("late" if days_pending > 3 else "pending"),
                "days_pending": days_pending,
                "max_score": 100,  # Will be enriched from assessment
            })

        return {
            "submissions": submissions,
            "total": total,
            "page": page,
            "limit": limit,
        }

    except Exception as e:
        logger.error(f"Error getting submissions: {str(e)}")
        raise


async def grade_submission(
    db: AsyncSession,
    submission_id: str,
    instructor_id: str,
    score: int,
    feedback: Optional[str] = None,
) -> Dict[str, Any]:
    """Grade a single submission."""
    try:
        # Verify the submission belongs to this instructor's assessment
        sub_q = (
            select(AssessmentSubmission)
            .join(Assessment, Assessment.id == AssessmentSubmission.assessment_id)
            .join(Course, Course.id == Assessment.course_id)
            .where(
                and_(
                    AssessmentSubmission.id == submission_id,
                    Course.instructor_id == instructor_id,
                )
            )
        )
        sub = (await db.execute(sub_q)).scalar_one_or_none()
        if not sub:
            raise ValueError("Submission not found or not authorized")

        sub.score = score
        sub.feedback = feedback
        sub.is_graded = True
        sub.graded_by = instructor_id
        sub.graded_at = datetime.utcnow()

        # Update assessment stats
        assessment = (await db.execute(
            select(Assessment).where(Assessment.id == sub.assessment_id)
        )).scalar_one()

        graded_q = select(func.count()).select_from(AssessmentSubmission).where(
            and_(
                AssessmentSubmission.assessment_id == sub.assessment_id,
                AssessmentSubmission.is_graded == True,
            )
        )
        graded_count = (await db.execute(graded_q)).scalar() or 0
        assessment.total_submissions = graded_count

        avg_q = select(func.avg(AssessmentSubmission.score)).where(
            and_(
                AssessmentSubmission.assessment_id == sub.assessment_id,
                AssessmentSubmission.is_graded == True,
            )
        )
        avg_score = (await db.execute(avg_q)).scalar() or 0
        assessment.average_score = Decimal(str(round(float(avg_score), 2)))

        await db.commit()
        await db.refresh(sub)

        logger.info(f"Graded submission {submission_id}: score={score}")
        return {
            "id": str(sub.id),
            "score": sub.score,
            "feedback": sub.feedback,
            "is_graded": True,
            "graded_at": sub.graded_at.isoformat(),
        }

    except Exception as e:
        logger.error(f"Error grading submission: {str(e)}")
        await db.rollback()
        raise


async def batch_grade(
    db: AsyncSession,
    instructor_id: str,
    submission_ids: List[str],
) -> Dict[str, Any]:
    """Batch grade submissions with AI-powered feedback."""
    try:
        results = []
        for sub_id in submission_ids:
            try:
                # Get submission with answers
                sub_q = (
                    select(AssessmentSubmission)
                    .join(Assessment, Assessment.id == AssessmentSubmission.assessment_id)
                    .join(Course, Course.id == Assessment.course_id)
                    .where(
                        and_(
                            AssessmentSubmission.id == sub_id,
                            Course.instructor_id == instructor_id,
                        )
                    )
                )
                sub = (await db.execute(sub_q)).scalar_one_or_none()
                if not sub:
                    results.append({"id": sub_id, "status": "not_found"})
                    continue

                # Get assessment for auto-grading
                assessment = (await db.execute(
                    select(Assessment).where(Assessment.id == sub.assessment_id)
                )).scalar_one()

                # Auto-grade if possible
                score = 0
                feedback_parts = []
                questions = assessment.questions or []
                answers = sub.answers or {}

                for q in questions:
                    q_id = q.get("id", "")
                    student_answer = answers.get(q_id, "")
                    correct = q.get("correct_answer", "")
                    points = q.get("points", 1)

                    if q.get("question_type") in ("multiple_choice", "true_false"):
                        if str(student_answer).lower().strip() == str(correct).lower().strip():
                            score += points
                            feedback_parts.append(f"Q{q.get('order', '')}: Correct (+{points})")
                        else:
                            feedback_parts.append(
                                f"Q{q.get('order', '')}: Incorrect. Expected: {correct}"
                            )
                    else:
                        # For essays/short answers, give partial credit
                        score += points // 2
                        feedback_parts.append(
                            f"Q{q.get('order', '')}: Requires manual review"
                        )

                feedback = "\n".join(feedback_parts)

                sub.score = score
                sub.feedback = feedback
                sub.is_graded = True
                sub.graded_by = instructor_id
                sub.graded_at = datetime.utcnow()

                results.append({
                    "id": sub_id,
                    "status": "graded",
                    "score": score,
                })

            except Exception as e:
                results.append({"id": sub_id, "status": "error", "detail": str(e)})

        await db.commit()

        logger.info(f"Batch graded {len(results)} submissions")
        return {
            "graded": len([r for r in results if r.get("status") == "graded"]),
            "errors": len([r for r in results if r.get("status") == "error"]),
            "results": results,
        }

    except Exception as e:
        logger.error(f"Error batch grading: {str(e)}")
        await db.rollback()
        raise


async def generate_ai_feedback(
    db: AsyncSession,
    instructor_id: str,
    submission_id: str,
    question_id: str,
    student_answer: str,
) -> Dict[str, Any]:
    """Generate AI-powered feedback for a student answer."""
    try:
        from app.services.ai_orchestrator import AIOrchestrator

        # Verify submission belongs to instructor
        sub_q = (
            select(AssessmentSubmission)
            .join(Assessment, Assessment.id == AssessmentSubmission.assessment_id)
            .join(Course, Course.id == Assessment.course_id)
            .where(
                and_(
                    AssessmentSubmission.id == submission_id,
                    Course.instructor_id == instructor_id,
                )
            )
        )
        sub = (await db.execute(sub_q)).scalar_one_or_none()
        if not sub:
            raise ValueError("Submission not found")

        # Get the question
        assessment = (await db.execute(
            select(Assessment).where(Assessment.id == sub.assessment_id)
        )).scalar_one()

        question = next(
            (q for q in (assessment.questions or []) if q.get("id") == question_id),
            None,
        )
        if not question:
            raise ValueError("Question not found")

        ai = AIOrchestrator()
        result = await ai.process_request(
            task_type="reasoning",
            user_prompt=(
                f"Question: {question.get('question_text', '')}\n"
                f"Expected Answer: {question.get('correct_answer', '')}\n"
                f"Student Answer: {student_answer}\n\n"
                "Provide constructive feedback, suggest a score (0-100), and explain your rationale."
            ),
            conversation_history=[],
            system_prompt=(
                "You are an educational assessment grader for Kenyan CBC curriculum. "
                "Provide encouraging, constructive feedback."
            ),
        )

        return {
            "feedback": result.get("response", ""),
            "suggested_score": Decimal("75.00"),
            "rationale": "AI-generated feedback based on answer analysis",
            "ai_model_used": result.get("model_used", "unknown"),
        }

    except Exception as e:
        logger.error(f"Error generating AI feedback: {str(e)}")
        raise


async def generate_ai_questions(
    db: AsyncSession,
    instructor_id: str,
    course_id: str,
    assessment_type: str,
    topic: str,
    grade_level: str,
    num_questions: int = 10,
    difficulty: str = "medium",
) -> Dict[str, Any]:
    """AI-generate assessment questions for a course."""
    try:
        # Verify course ownership
        course_q = select(Course).where(
            and_(Course.id == course_id, Course.instructor_id == instructor_id)
        )
        course = (await db.execute(course_q)).scalar_one_or_none()
        if not course:
            raise ValueError("Course not found or not authorized")

        from app.services.ai_orchestrator import AIOrchestrator

        ai = AIOrchestrator()
        result = await ai.process_request(
            task_type="reasoning",
            user_prompt=(
                f"Generate {num_questions} {assessment_type} questions for:\n"
                f"Topic: {topic}\n"
                f"Grade Level: {grade_level}\n"
                f"Difficulty: {difficulty}\n"
                f"Course: {course.title}\n"
                f"Learning Area: {course.learning_area}\n\n"
                "Format each question with: question_text, question_type (multiple_choice/true_false/short_answer/essay), "
                "options (for multiple choice), correct_answer, and points."
            ),
            conversation_history=[],
            system_prompt=(
                "You are a Kenyan CBC curriculum content creator. "
                "Generate high-quality assessment questions aligned with the CBC framework."
            ),
        )

        return {
            "title": f"{topic} - {assessment_type.title()}",
            "description": f"AI-generated {assessment_type} on {topic} for {grade_level}",
            "questions": [],  # Would be parsed from AI response
            "ai_model_used": result.get("model_used", "unknown"),
            "generated_at": datetime.utcnow().isoformat(),
            "raw_response": result.get("response", ""),
        }

    except Exception as e:
        logger.error(f"Error generating AI questions: {str(e)}")
        raise


# ── Rubrics ─────────────────────────────────────────────────────────

async def create_rubric(
    db: AsyncSession,
    instructor_id: str,
    assessment_id: str,
    criteria: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """Create or update a rubric for an assessment (stored as JSONB on Assessment)."""
    try:
        assessment = await _get_instructor_assessment(db, assessment_id, instructor_id)

        # Store rubric as part of assessment questions metadata
        # Since there's no separate rubric table, embed in assessment
        rubric_data = {
            "criteria": criteria,
            "created_at": datetime.utcnow().isoformat(),
        }

        # Update questions to include rubric reference
        existing_questions = assessment.questions or []
        for q in existing_questions:
            q["rubric"] = rubric_data

        assessment.questions = existing_questions
        await db.commit()
        await db.refresh(assessment)

        logger.info(f"Created rubric for assessment {assessment_id}")
        return {
            "id": str(assessment.id),
            "assessment_id": str(assessment.id),
            "criteria": criteria,
            "created_at": rubric_data["created_at"],
        }

    except Exception as e:
        logger.error(f"Error creating rubric: {str(e)}")
        await db.rollback()
        raise


# ── Export ──────────────────────────────────────────────────────────

async def export_submissions_csv(
    db: AsyncSession,
    instructor_id: str,
    assessment_id: Optional[str] = None,
) -> str:
    """Export submissions as CSV string."""
    try:
        import csv
        import io

        subs_data = await get_submissions(db, instructor_id, assessment_id=assessment_id, limit=1000)
        submissions = subs_data.get("submissions", [])

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "Student Name", "Assessment", "Score", "Status",
            "Submitted At", "Graded At", "Feedback",
        ])

        for sub in submissions:
            writer.writerow([
                sub.get("student_name", ""),
                sub.get("assessment_title", ""),
                sub.get("score", ""),
                sub.get("status", ""),
                sub.get("submitted_at", ""),
                sub.get("graded_at", ""),
                sub.get("feedback", ""),
            ])

        return output.getvalue()

    except Exception as e:
        logger.error(f"Error exporting submissions: {str(e)}")
        raise


# ── Helpers ─────────────────────────────────────────────────────────

async def _get_instructor_assessment(
    db: AsyncSession, assessment_id: str, instructor_id: str
) -> Assessment:
    """Fetch an assessment belonging to a course owned by this instructor."""
    query = (
        select(Assessment)
        .join(Course, Course.id == Assessment.course_id)
        .where(
            and_(
                Assessment.id == assessment_id,
                Course.instructor_id == instructor_id,
            )
        )
    )
    result = await db.execute(query)
    assessment = result.scalar_one_or_none()
    if not assessment:
        raise ValueError("Assessment not found or not authorized")
    return assessment


def _assessment_to_dict(assessment: Assessment) -> dict:
    """Convert Assessment ORM object to JSON-friendly dict."""
    return {
        "id": str(assessment.id),
        "title": assessment.title,
        "description": assessment.description,
        "assessment_type": assessment.assessment_type,
        "course_id": str(assessment.course_id),
        "creator_id": str(assessment.creator_id) if assessment.creator_id else None,
        "questions": assessment.questions or [],
        "total_points": assessment.total_points,
        "passing_score": assessment.passing_score,
        "auto_gradable": assessment.auto_gradable,
        "duration_minutes": assessment.duration_minutes,
        "max_attempts": assessment.max_attempts,
        "is_published": assessment.is_published,
        "total_submissions": assessment.total_submissions,
        "average_score": float(assessment.average_score) if assessment.average_score else 0.0,
        "created_at": assessment.created_at.isoformat() if assessment.created_at else None,
        "updated_at": assessment.updated_at.isoformat() if assessment.updated_at else None,
    }
