"""
Instructor Models

Database models for the instructor dashboard feature.
"""

from app.models.instructor.instructor_profile import InstructorProfile
from app.models.instructor.instructor_earnings import (
    InstructorEarning,
    InstructorPayout,
    InstructorRevenueSplit,
)
from app.models.instructor.instructor_gamification import (
    InstructorBadge,
    InstructorBadgeAward,
    InstructorPoints,
    InstructorPointsLog,
    PeerKudo,
)
from app.models.instructor.instructor_session import (
    InstructorSessionAttendance,
    InstructorSessionFollowUp,
)
from app.models.instructor.instructor_ai_insight import (
    InstructorDailyInsight,
    InstructorCBCAnalysis,
)
from app.models.instructor.instructor_discussion import (
    InstructorForumPost,
    InstructorForumReply,
)
from app.models.instructor.instructor_2fa import InstructorTwoFactor, LoginHistory

__all__ = [
    "InstructorProfile",
    "InstructorEarning",
    "InstructorPayout",
    "InstructorRevenueSplit",
    "InstructorBadge",
    "InstructorBadgeAward",
    "InstructorPoints",
    "InstructorPointsLog",
    "PeerKudo",
    "InstructorSessionAttendance",
    "InstructorSessionFollowUp",
    "InstructorDailyInsight",
    "InstructorCBCAnalysis",
    "InstructorForumPost",
    "InstructorForumReply",
    "InstructorTwoFactor",
    "LoginHistory",
]
