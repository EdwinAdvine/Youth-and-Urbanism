"""
Instructor Assessment Schemas

Pydantic v2 schemas for assessments, submissions, grading, and AI-powered assessment features.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal


# Question Schemas
class AssessmentQuestionSchema(BaseModel):
    id: str
    question_text: str
    question_type: str  # multiple_choice, true_false, essay, short_answer
    options: Optional[List[str]] = None
    correct_answer: Optional[Any] = None
    points: int
    order: int


class QuestionCreate(BaseModel):
    question_text: str
    question_type: str
    options: Optional[List[str]] = None
    correct_answer: Optional[Any] = None
    points: int = 1
    order: int


class QuestionUpdate(BaseModel):
    question_text: Optional[str] = None
    question_type: Optional[str] = None
    options: Optional[List[str]] = None
    correct_answer: Optional[Any] = None
    points: Optional[int] = None
    order: Optional[int] = None


# Assessment Schemas
class AssessmentCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: Optional[str] = None
    assessment_type: str  # quiz, assignment, project, exam
    course_id: str
    questions: List[QuestionCreate]
    time_limit_minutes: Optional[int] = None
    max_attempts: int = Field(default=1, ge=1)
    passing_score: Decimal = Field(default=Decimal("50.00"), ge=0, le=100)


class AssessmentUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=200)
    description: Optional[str] = None
    time_limit_minutes: Optional[int] = None
    max_attempts: Optional[int] = Field(None, ge=1)
    passing_score: Optional[Decimal] = Field(None, ge=0, le=100)
    is_published: Optional[bool] = None


class AssessmentQuestionsUpdate(BaseModel):
    """Update assessment questions"""
    questions: List[AssessmentQuestionSchema]


class InstructorAssessmentResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    assessment_type: str
    course_id: str
    questions: List[AssessmentQuestionSchema]
    time_limit_minutes: Optional[int] = None
    max_attempts: int
    passing_score: Decimal
    is_published: bool
    total_submissions: int
    average_score: Decimal
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Submission Schemas
class AssessmentSubmissionResponse(BaseModel):
    id: str
    assessment_id: str
    student_id: str
    student_name: str
    student_avatar: Optional[str] = None
    answers: Dict[str, Any]
    score: Optional[Decimal] = None
    is_graded: bool
    feedback: Optional[str] = None
    submitted_at: datetime
    graded_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Grading Schemas
class GradeSubmission(BaseModel):
    submission_id: str
    score: Decimal = Field(..., ge=0, le=100)
    feedback: Optional[str] = None


class BatchGradeRequest(BaseModel):
    submission_ids: List[str]
    scores: List[Decimal]
    feedback: List[str]


class AIFeedbackRequest(BaseModel):
    submission_id: str
    question_id: str
    student_answer: str


class AIFeedbackResponse(BaseModel):
    feedback: str
    suggested_score: Decimal
    rationale: str
    ai_model_used: str


# AI Assessment Generation Schemas
class AIAssessmentGenerateRequest(BaseModel):
    course_id: str
    assessment_type: str  # quiz, assignment, project, exam
    topic: str
    grade_level: str
    num_questions: int = Field(default=10, ge=1, le=50)
    difficulty: str = Field(default="medium")  # easy, medium, hard
    question_types: Optional[List[str]] = None


class AIAssessmentGenerateResponse(BaseModel):
    title: str
    description: str
    questions: List[QuestionCreate]
    ai_model_used: str
    generated_at: datetime


# Rubric Schemas
class RubricCriterion(BaseModel):
    name: str
    description: str
    max_points: int
    levels: Dict[str, Any]  # e.g., {"excellent": 5, "good": 4, "fair": 3, "poor": 1}


class RubricCreate(BaseModel):
    assessment_id: str
    criteria: List[RubricCriterion]


class RubricResponse(BaseModel):
    id: str
    assessment_id: str
    criteria: List[RubricCriterion]
    created_at: datetime

    class Config:
        from_attributes = True


# Submission Query Schemas
class SubmissionQueryParams(BaseModel):
    assessment_id: Optional[str] = None
    is_graded: Optional[bool] = None
    student_id: Optional[str] = None
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=20, ge=1, le=100)
    sort_by: str = Field(default="submitted_at")
    sort_order: str = Field(default="desc", pattern="^(asc|desc)$")
