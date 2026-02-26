"""
Student Code Generation Utilities

Generates unique admission numbers and AI Tutor (AIT) codes for students.

Admission number format: UHS/{year}/G{grade}/{seq:03d}
  - year: enrollment year (e.g. 2026)
  - grade: grade code derived from grade_level string (G3, ECD1, etc.)
  - seq: school-wide annual sequence shared across ALL grades in that year
         (e.g. if student #1 is G3 → UHS/2026/G3/001,
               student #2 is G4 → UHS/2026/G4/002  ← NOT 001)

AIT code format: {admission_number}-AIT{seq:03d}
  - seq: global all-time sequence across all AI tutors
"""
import re
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func


def _grade_code(grade_level: str) -> str:
    """
    Convert a grade_level string to a compact code for the admission number.

    Examples:
        "ECD 1"   → "ECD1"
        "ECD 2"   → "ECD2"
        "Grade 1" → "G1"
        "Grade 3" → "G3"
        "Grade 10" → "G10"
    """
    grade_level = grade_level.strip()

    if grade_level.upper().startswith("ECD"):
        # Extract the number after ECD
        match = re.search(r'\d+', grade_level)
        num = match.group() if match else "1"
        return f"ECD{num}"

    # Match "Grade N" pattern
    match = re.search(r'\d+', grade_level)
    if match:
        return f"G{match.group()}"

    # Fallback: remove spaces and uppercase
    return grade_level.replace(" ", "").upper()


async def generate_admission_number(
    db: AsyncSession,
    grade_level: str,
    enrollment_year: int
) -> str:
    """
    Generate a unique admission number for a new student.

    The sequence is school-wide for the given year — all grades share
    one incrementing counter per academic year.

    Args:
        db: Async database session
        grade_level: Student's grade level string (e.g. "Grade 3", "ECD 1")
        enrollment_year: Year of enrollment (e.g. 2026)

    Returns:
        Admission number string, e.g. "UHS/2026/G3/001"
    """
    from app.models.student import Student

    # Count ALL students enrolled in this year (school-wide counter)
    # Use LIKE on admission_number to match "UHS/{year}/%"
    year_prefix = f"UHS/{enrollment_year}/%"
    result = await db.execute(
        select(func.count(Student.id)).where(
            Student.admission_number.like(year_prefix)
        )
    )
    existing_count = result.scalar() or 0

    # Next sequence = existing count + 1
    sequence = existing_count + 1
    grade_code = _grade_code(grade_level)

    return f"UHS/{enrollment_year}/{grade_code}/{sequence:03d}"


async def generate_ait_code(
    db: AsyncSession,
    admission_number: str
) -> str:
    """
    Generate a unique AI Tutor code tied to a student's admission number.

    The AIT sequence is global across all AI tutors (all-time).

    Args:
        db: Async database session
        admission_number: The student's admission number (e.g. "UHS/2026/G3/001")

    Returns:
        AIT code string, e.g. "UHS/2026/G3/001-AIT001"
    """
    from app.models.ai_tutor import AITutor

    result = await db.execute(
        select(func.count(AITutor.id))
    )
    existing_count = result.scalar() or 0

    sequence = existing_count + 1
    return f"{admission_number}-AIT{sequence:03d}"
