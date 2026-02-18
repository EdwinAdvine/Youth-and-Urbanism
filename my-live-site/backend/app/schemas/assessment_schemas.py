"""
Assessment Pydantic Schemas

This module defines all Pydantic schemas for assessment-related operations including
assessments, questions, and submissions. These schemas handle validation for creating,
updating, and returning assessment data.
"""

from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel, Field, validator


class QuestionSchema(BaseModel):
    """
    Individual question structure for assessments.

    Supports multiple question types: multiple choice, essay, true/false, and short answer.
    """
    id: str = Field(..., description="Unique question identifier")
    type: str = Field(
        ...,
        pattern="^(multiple_choice|essay|true_false|short_answer)$",
        description="Type of question"
    )
    question: str = Field(..., min_length=5, description="Question text")
    options: Optional[List[str]] = Field(
        None,
        description="Answer options for multiple choice questions"
    )
    correct_answer: Optional[str] = Field(
        None,
        description="Correct answer (visible to admin/instructor only)"
    )
    points: int = Field(..., ge=1, le=100, description="Points for this question")

    @validator('options')
    def validate_options(cls, v, values):
        """Ensure multiple choice questions have options."""
        if values.get('type') == 'multiple_choice' and not v:
            raise ValueError('Multiple choice questions must have options')
        if values.get('type') == 'multiple_choice' and len(v) < 2:
            raise ValueError('Multiple choice questions must have at least 2 options')
        return v


class AssessmentBase(BaseModel):
    """
    Base schema for assessments containing common fields.
    """
    title: str = Field(..., min_length=3, max_length=200, description="Assessment title")
    description: Optional[str] = Field(None, description="Assessment description")
    assessment_type: str = Field(
        ...,
        pattern="^(quiz|assignment|project|exam)$",
        description="Type of assessment"
    )


class AssessmentCreate(AssessmentBase):
    """
    Schema for creating new assessments.

    Includes all fields required to set up a new assessment including questions,
    scoring parameters, and availability settings.
    """
    course_id: UUID = Field(..., description="ID of the course this assessment belongs to")
    questions: List[QuestionSchema] = Field(..., min_items=1, description="List of questions")
    total_points: int = Field(..., ge=1, description="Total points for the assessment")
    passing_score: int = Field(..., ge=0, description="Minimum score required to pass")
    duration_minutes: Optional[int] = Field(
        None,
        ge=1,
        description="Time limit in minutes (None for unlimited)"
    )
    available_from: Optional[datetime] = Field(
        None,
        description="Date/time when assessment becomes available"
    )
    available_until: Optional[datetime] = Field(
        None,
        description="Date/time when assessment is no longer available"
    )
    max_attempts: int = Field(
        default=1,
        ge=1,
        le=10,
        description="Maximum number of attempts allowed"
    )

    @validator('passing_score')
    def validate_passing_score(cls, v, values):
        """Ensure passing score does not exceed total points."""
        total_points = values.get('total_points')
        if total_points is not None and v > total_points:
            raise ValueError('Passing score cannot exceed total points')
        return v

    @validator('available_until')
    def validate_availability_dates(cls, v, values):
        """Ensure available_until is after available_from."""
        available_from = values.get('available_from')
        if available_from is not None and v is not None and v <= available_from:
            raise ValueError('available_until must be after available_from')
        return v

    @validator('total_points')
    def validate_total_points(cls, v, values):
        """Ensure total points matches sum of question points."""
        questions = values.get('questions')
        if questions:
            calculated_points = sum(q.points for q in questions)
            if v != calculated_points:
                raise ValueError(
                    f'Total points ({v}) must equal sum of question points ({calculated_points})'
                )
        return v


class AssessmentUpdate(BaseModel):
    """
    Schema for updating existing assessments.

    All fields are optional to allow partial updates.
    """
    title: Optional[str] = Field(None, min_length=3, max_length=200)
    description: Optional[str] = None
    questions: Optional[List[QuestionSchema]] = None
    total_points: Optional[int] = Field(None, ge=1)
    passing_score: Optional[int] = Field(None, ge=0)
    duration_minutes: Optional[int] = Field(None, ge=1)
    is_published: Optional[bool] = Field(None, description="Whether the assessment is published")
    available_from: Optional[datetime] = None
    available_until: Optional[datetime] = None
    max_attempts: Optional[int] = Field(None, ge=1, le=10)

    @validator('passing_score')
    def validate_passing_score(cls, v, values):
        """Ensure passing score does not exceed total points if both are provided."""
        total_points = values.get('total_points')
        if total_points is not None and v is not None and v > total_points:
            raise ValueError('Passing score cannot exceed total points')
        return v

    @validator('available_until')
    def validate_availability_dates(cls, v, values):
        """Ensure available_until is after available_from if both are provided."""
        available_from = values.get('available_from')
        if available_from is not None and v is not None and v <= available_from:
            raise ValueError('available_until must be after available_from')
        return v


class AssessmentResponse(AssessmentBase):
    """
    Schema for returning assessment data without questions.

    Includes metadata, statistics, and configuration details.
    """
    id: UUID
    course_id: UUID
    creator_id: Optional[UUID] = Field(None, description="ID of the user who created the assessment")
    total_points: int
    passing_score: int
    auto_gradable: bool = Field(description="Whether assessment can be automatically graded")
    duration_minutes: Optional[int] = None
    is_published: bool = Field(description="Whether the assessment is published and visible")
    available_from: Optional[datetime] = None
    available_until: Optional[datetime] = None
    max_attempts: int
    total_submissions: int = Field(
        default=0,
        description="Total number of submissions received"
    )
    average_score: Decimal = Field(
        default=Decimal('0.00'),
        description="Average score across all submissions"
    )
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AssessmentWithQuestions(AssessmentResponse):
    """
    Schema for returning assessment data with questions included.

    Used when full assessment details are needed, such as when a student
    starts taking an assessment or an instructor reviews questions.
    """
    questions: List[QuestionSchema] = Field(..., description="List of assessment questions")


class SubmissionCreate(BaseModel):
    """
    Schema for creating new assessment submissions.

    Used when a student starts or submits an assessment.
    """
    assessment_id: UUID = Field(..., description="ID of the assessment being submitted")
    answers: dict = Field(
        ...,
        description="Mapping of question IDs to student answers"
    )

    @validator('answers')
    def validate_answers(cls, v):
        """Ensure answers dict is not empty."""
        if not v:
            raise ValueError('Answers cannot be empty')
        return v


class SubmissionUpdate(BaseModel):
    """
    Schema for updating submissions before final submission.

    Allows students to save progress or modify answers before submitting.
    """
    answers: dict = Field(..., description="Updated answers mapping")
    is_submitted: bool = Field(
        default=False,
        description="Mark as submitted (cannot be changed after)"
    )


class SubmissionResponse(BaseModel):
    """
    Schema for returning submission data.

    Includes answers, grading information, and timing metadata.
    """
    id: UUID
    assessment_id: UUID
    student_id: UUID
    answers: dict = Field(description="Student's answers")
    score: Optional[int] = Field(None, description="Final score (if graded)")
    is_graded: bool = Field(description="Whether submission has been graded")
    graded_by: Optional[UUID] = Field(None, description="ID of instructor who graded")
    feedback: Optional[str] = Field(None, description="Instructor feedback")
    is_submitted: bool = Field(description="Whether submission is finalized")
    attempt_number: int = Field(description="Attempt number for this assessment")
    started_at: Optional[datetime] = Field(None, description="When student started")
    submitted_at: Optional[datetime] = Field(None, description="When student submitted")
    graded_at: Optional[datetime] = Field(None, description="When submission was graded")
    created_at: datetime

    class Config:
        from_attributes = True


class GradeSubmission(BaseModel):
    """
    Schema for instructor grading of submissions.

    Used by instructors to assign scores and provide feedback.
    """
    submission_id: UUID = Field(..., description="ID of the submission to grade")
    score: int = Field(..., ge=0, description="Score awarded (must be >= 0)")
    feedback: Optional[str] = Field(
        None,
        max_length=2000,
        description="Instructor feedback on the submission"
    )


class AssessmentListResponse(BaseModel):
    """
    Schema for paginated list of assessments.

    Used for listing assessments with metadata.
    """
    assessments: List[AssessmentResponse]
    total: int = Field(description="Total number of assessments")
    page: int = Field(description="Current page number")
    page_size: int = Field(description="Number of items per page")

    class Config:
        from_attributes = True


class SubmissionListResponse(BaseModel):
    """
    Schema for paginated list of submissions.

    Used for listing student submissions with metadata.
    """
    submissions: List[SubmissionResponse]
    total: int = Field(description="Total number of submissions")
    page: int = Field(description="Current page number")
    page_size: int = Field(description="Number of items per page")

    class Config:
        from_attributes = True


class AssessmentStats(BaseModel):
    """
    Schema for assessment statistics.

    Provides aggregate data about assessment performance.
    """
    assessment_id: UUID
    total_attempts: int = Field(description="Total number of attempts")
    completed_attempts: int = Field(description="Number of completed attempts")
    average_score: Decimal = Field(description="Average score across all attempts")
    highest_score: Optional[int] = Field(None, description="Highest score achieved")
    lowest_score: Optional[int] = Field(None, description="Lowest score achieved")
    pass_rate: Decimal = Field(description="Percentage of students who passed")
    average_time_minutes: Optional[Decimal] = Field(
        None,
        description="Average time taken to complete"
    )

    class Config:
        from_attributes = True
