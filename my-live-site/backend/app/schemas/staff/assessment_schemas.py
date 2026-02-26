from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class AssessmentCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    assessment_type: str = Field(..., pattern="^(quiz|exam|formative|diagnostic)$")
    course_id: Optional[str] = None
    grade_level: Optional[str] = None
    learning_area: Optional[str] = None
    cbc_tags: List[Dict[str, Any]] = []
    adaptive_config: Dict[str, Any] = {"initial_difficulty": 3, "step_up_threshold": 0.8, "step_down_threshold": 0.4}
    time_limit_minutes: Optional[int] = None
    is_ai_graded: bool = False
    rubric: Optional[Dict[str, Any]] = None


class QuestionCreate(BaseModel):
    question_text: str
    question_type: str = Field(..., pattern="^(mcq|short_answer|essay|fill_blank|matching|ordering)$")
    options: Optional[List[Dict[str, Any]]] = None
    correct_answer: Optional[str] = None
    explanation: Optional[str] = None
    difficulty: int = Field(..., ge=1, le=5)
    points: int = Field(default=1, ge=1)
    cbc_competency: Optional[str] = None
    media_url: Optional[str] = None
    order_index: int
    adaptive_paths: List[Dict[str, Any]] = []
    ai_grading_prompt: Optional[str] = None


class AdaptiveSessionState(BaseModel):
    assessment_id: str
    student_id: str
    current_difficulty: int
    questions_answered: int
    correct_count: int
    current_question_id: Optional[str] = None
    path_history: List[Dict[str, Any]] = []


class AIGradingResult(BaseModel):
    question_id: str
    student_answer: str
    score: float
    max_score: float
    feedback: str
    competency_met: bool
    confidence: float
