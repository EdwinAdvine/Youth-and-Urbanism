"""
Admin Content & Learning Integrity Service - Phase 4

Provides methods for course management, CBC alignment analysis,
assessment override handling, certificate management, and resource
library moderation.

Methods return dicts/lists suitable for direct JSON serialisation in
FastAPI response models.
"""

import logging
import uuid
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Any, Dict, List, Optional

from sqlalchemy import select, func, and_, or_, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.course import Course
from app.models.user import User
from app.models.certificate import Certificate

logger = logging.getLogger(__name__)


def _decimal_to_float(value: Any) -> float:
    """Safely convert a Decimal/None to float for JSON serialisation."""
    if value is None:
        return 0.0
    return float(value)


class ContentService:
    """Service for admin content management and learning integrity."""

    # ------------------------------------------------------------------
    # Course Management
    # ------------------------------------------------------------------
    @staticmethod
    async def list_courses(
        db: AsyncSession,
        page: int = 1,
        page_size: int = 10,
        status_filter: Optional[str] = None,
        search: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Return a paginated list of courses with optional status filter
        and search.

        Status values:
        - published: is_published=True
        - draft: is_published=False and no instructor (platform draft)
        - pending_review: is_published=False, has instructor, not platform
        - rejected: courses whose status column equals 'rejected' (future)

        For now we derive status from existing boolean columns.
        """
        base_q = select(Course)
        count_q = select(func.count(Course.id))

        # Apply search filter
        if search:
            search_pattern = f"%{search}%"
            search_cond = or_(
                Course.title.ilike(search_pattern),
                Course.learning_area.ilike(search_pattern),
            )
            base_q = base_q.where(search_cond)
            count_q = count_q.where(search_cond)

        # Apply status filter
        if status_filter == "published":
            cond = Course.is_published == True
            base_q = base_q.where(cond)
            count_q = count_q.where(cond)
        elif status_filter == "draft":
            cond = and_(
                Course.is_published == False,
                Course.is_platform_created == True,
            )
            base_q = base_q.where(cond)
            count_q = count_q.where(cond)
        elif status_filter == "pending_review":
            cond = and_(
                Course.is_published == False,
                Course.is_platform_created == False,
                Course.instructor_id.isnot(None),
            )
            base_q = base_q.where(cond)
            count_q = count_q.where(cond)

        # Get total count
        total_result = await db.execute(count_q)
        total: int = total_result.scalar() or 0

        # Paginate and order
        offset = (page - 1) * page_size
        base_q = base_q.order_by(Course.created_at.desc()).offset(offset).limit(page_size)

        result = await db.execute(base_q)
        courses = result.scalars().all()

        # Resolve creator names
        creator_ids = [c.instructor_id for c in courses if c.instructor_id]
        creator_names: Dict[str, str] = {}
        if creator_ids:
            users_q = select(User.id, User.first_name, User.last_name).where(
                User.id.in_(creator_ids)
            )
            users_result = await db.execute(users_q)
            for row in users_result:
                creator_names[str(row.id)] = f"{row.first_name} {row.last_name}"

        items: List[Dict[str, Any]] = []
        for c in courses:
            # Derive status
            if c.is_published:
                status = "published"
            elif not c.is_platform_created and c.instructor_id:
                status = "pending_review"
            else:
                status = "draft"

            items.append({
                "id": str(c.id),
                "title": c.title,
                "description": c.description[:120] + "..." if c.description and len(c.description) > 120 else c.description,
                "grade_levels": c.grade_levels or [],
                "learning_area": c.learning_area,
                "status": status,
                "creator_name": creator_names.get(str(c.instructor_id), "Platform") if c.instructor_id else "Platform",
                "creator_id": str(c.instructor_id) if c.instructor_id else None,
                "is_platform_created": c.is_platform_created,
                "price": _decimal_to_float(c.price),
                "currency": c.currency,
                "rating": _decimal_to_float(c.average_rating),
                "total_reviews": c.total_reviews,
                "enrollment_count": c.enrollment_count,
                "created_at": c.created_at.isoformat() if c.created_at else None,
            })

        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": max(1, -(-total // page_size)),  # ceiling division
        }

    @staticmethod
    async def approve_course(db: AsyncSession, course_id: str) -> Dict[str, Any]:
        """
        Approve a course for publication.

        Sets is_published=True and records published_at timestamp.
        """
        try:
            course_uuid = uuid.UUID(course_id)
        except ValueError:
            return {"success": False, "error": "Invalid course ID format"}

        q = select(Course).where(Course.id == course_uuid)
        result = await db.execute(q)
        course = result.scalar_one_or_none()

        if not course:
            return {"success": False, "error": "Course not found"}

        if course.is_published:
            return {"success": False, "error": "Course is already published"}

        course.is_published = True
        course.published_at = datetime.utcnow()
        await db.commit()

        return {
            "success": True,
            "course_id": course_id,
            "title": course.title,
            "status": "published",
            "published_at": course.published_at.isoformat(),
        }

    @staticmethod
    async def reject_course(
        db: AsyncSession, course_id: str, reason: str
    ) -> Dict[str, Any]:
        """
        Reject a course submission.

        Currently sets is_published=False (it should already be).
        The rejection reason is returned for the frontend to display;
        a dedicated rejection_reason column can be added later.
        """
        try:
            course_uuid = uuid.UUID(course_id)
        except ValueError:
            return {"success": False, "error": "Invalid course ID format"}

        q = select(Course).where(Course.id == course_uuid)
        result = await db.execute(q)
        course = result.scalar_one_or_none()

        if not course:
            return {"success": False, "error": "Course not found"}

        course.is_published = False
        await db.commit()

        return {
            "success": True,
            "course_id": course_id,
            "title": course.title,
            "status": "rejected",
            "reason": reason,
            "rejected_at": datetime.utcnow().isoformat(),
        }

    @staticmethod
    async def get_course_versions(
        db: AsyncSession, course_id: str
    ) -> List[Dict[str, Any]]:
        """
        Return version history for a course.

        Currently returns mock data until a dedicated CourseVersion model
        is implemented.
        """
        now = datetime.utcnow()

        return [
            {
                "version": "1.0.0",
                "author": "Jane Wanjiku",
                "changes": "Initial course submission with 12 lessons",
                "created_at": (now - timedelta(days=14)).isoformat(),
                "status": "approved",
            },
            {
                "version": "1.1.0",
                "author": "Jane Wanjiku",
                "changes": "Added CBC strand mapping for Mathematics",
                "created_at": (now - timedelta(days=7)).isoformat(),
                "status": "approved",
            },
            {
                "version": "1.2.0",
                "author": "Jane Wanjiku",
                "changes": "Updated assessment rubrics and added Grade 5 content",
                "created_at": (now - timedelta(days=2)).isoformat(),
                "status": "pending_review",
            },
        ]

    # ------------------------------------------------------------------
    # CBC Alignment
    # ------------------------------------------------------------------
    @staticmethod
    async def get_cbc_alignment_data(db: AsyncSession) -> Dict[str, Any]:
        """
        Return CBC strand coverage data for the platform.

        Returns mock data based on the Kenya CBC framework strands.
        Will be replaced with real analysis once competency mapping
        tables are in place.
        """
        strands = [
            {
                "strand": "Language Activities",
                "short_name": "Language",
                "total_competencies": 48,
                "mapped_competencies": 42,
                "coverage_percentage": 87.5,
                "sub_strands": [
                    {"name": "Listening & Speaking", "coverage": 92, "courses_count": 18},
                    {"name": "Reading", "coverage": 88, "courses_count": 22},
                    {"name": "Writing", "coverage": 85, "courses_count": 16},
                    {"name": "Grammar", "coverage": 78, "courses_count": 14},
                ],
                "gaps": ["Advanced creative writing for Grade 7-8", "Kiswahili literature analysis"],
            },
            {
                "strand": "Mathematics Activities",
                "short_name": "Mathematics",
                "total_competencies": 52,
                "mapped_competencies": 48,
                "coverage_percentage": 92.3,
                "sub_strands": [
                    {"name": "Numbers", "coverage": 95, "courses_count": 24},
                    {"name": "Measurement", "coverage": 90, "courses_count": 18},
                    {"name": "Geometry", "coverage": 88, "courses_count": 15},
                    {"name": "Data Handling", "coverage": 82, "courses_count": 12},
                    {"name": "Algebra", "coverage": 78, "courses_count": 10},
                ],
                "gaps": ["Advanced algebra for Grade 8", "Statistics and probability enrichment"],
            },
            {
                "strand": "Science & Technology",
                "short_name": "Science & Tech",
                "total_competencies": 44,
                "mapped_competencies": 36,
                "coverage_percentage": 81.8,
                "sub_strands": [
                    {"name": "Living Things", "coverage": 88, "courses_count": 16},
                    {"name": "Earth & Environment", "coverage": 82, "courses_count": 14},
                    {"name": "Energy", "coverage": 76, "courses_count": 10},
                    {"name": "Technology & Design", "coverage": 72, "courses_count": 8},
                ],
                "gaps": [
                    "Coding and robotics for upper primary",
                    "Environmental conservation projects",
                    "Renewable energy concepts",
                ],
            },
            {
                "strand": "Social Studies",
                "short_name": "Social Studies",
                "total_competencies": 40,
                "mapped_competencies": 32,
                "coverage_percentage": 80.0,
                "sub_strands": [
                    {"name": "Citizenship", "coverage": 85, "courses_count": 12},
                    {"name": "People & Population", "coverage": 80, "courses_count": 10},
                    {"name": "Culture & Social Organisation", "coverage": 78, "courses_count": 9},
                    {"name": "Resources & Economic Activities", "coverage": 72, "courses_count": 8},
                ],
                "gaps": [
                    "County governance for Grades 6-8",
                    "African history and heritage content",
                ],
            },
            {
                "strand": "Creative Arts",
                "short_name": "Creative Arts",
                "total_competencies": 36,
                "mapped_competencies": 24,
                "coverage_percentage": 66.7,
                "sub_strands": [
                    {"name": "Art & Craft", "coverage": 72, "courses_count": 8},
                    {"name": "Music", "coverage": 68, "courses_count": 7},
                    {"name": "Drama", "coverage": 58, "courses_count": 5},
                    {"name": "Film & Theatre", "coverage": 45, "courses_count": 3},
                ],
                "gaps": [
                    "Drama and performance arts",
                    "Digital art and design tools",
                    "Traditional Kenyan music instruments",
                    "Film and media studies",
                ],
            },
            {
                "strand": "Physical & Health Education",
                "short_name": "Physical Ed.",
                "total_competencies": 32,
                "mapped_competencies": 20,
                "coverage_percentage": 62.5,
                "sub_strands": [
                    {"name": "Movement & Physical Activities", "coverage": 70, "courses_count": 6},
                    {"name": "Health Education", "coverage": 68, "courses_count": 7},
                    {"name": "Sports & Games", "coverage": 55, "courses_count": 4},
                    {"name": "Safety & First Aid", "coverage": 52, "courses_count": 3},
                ],
                "gaps": [
                    "Sports coaching content for Grades 5-8",
                    "Mental health and wellbeing modules",
                    "First aid and emergency preparedness",
                ],
            },
            {
                "strand": "Religious Education",
                "short_name": "Religious Ed.",
                "total_competencies": 28,
                "mapped_competencies": 22,
                "coverage_percentage": 78.6,
                "sub_strands": [
                    {"name": "Christian Religious Education", "coverage": 85, "courses_count": 10},
                    {"name": "Islamic Religious Education", "coverage": 75, "courses_count": 8},
                    {"name": "Hindu Religious Education", "coverage": 60, "courses_count": 4},
                ],
                "gaps": [
                    "Inter-faith dialogue modules",
                    "Hindu Religious Education Grade 6-8 content",
                ],
            },
        ]

        # Summary statistics
        total_competencies = sum(s["total_competencies"] for s in strands)
        total_mapped = sum(s["mapped_competencies"] for s in strands)
        total_gaps = sum(len(s["gaps"]) for s in strands)

        return {
            "summary": {
                "total_competencies": total_competencies,
                "mapped_competencies": total_mapped,
                "coverage_percentage": round((total_mapped / total_competencies) * 100, 1) if total_competencies > 0 else 0,
                "total_gaps": total_gaps,
                "total_strands": len(strands),
            },
            "strands": strands,
            "generated_at": datetime.utcnow().isoformat(),
        }

    # ------------------------------------------------------------------
    # Assessment Overrides
    # ------------------------------------------------------------------
    @staticmethod
    async def get_assessment_overrides(
        db: AsyncSession,
        page: int = 1,
        page_size: int = 10,
    ) -> Dict[str, Any]:
        """
        Return grade override request queue.

        Currently returns mock data until dedicated override tables
        are implemented.
        """
        now = datetime.utcnow()

        all_overrides = [
            {
                "id": str(uuid.uuid4()),
                "student_name": "Amina Ochieng",
                "student_id": str(uuid.uuid4()),
                "assessment_title": "Grade 6 Mathematics - End of Term Exam",
                "assessment_type": "exam",
                "course_name": "CBC Mathematics Grade 6",
                "original_grade": 58,
                "requested_grade": 72,
                "reason": "Student submitted handwritten work that the auto-grader could not parse. Manual review shows correct working and answers.",
                "instructor_name": "David Kimani",
                "instructor_id": str(uuid.uuid4()),
                "status": "pending",
                "requested_at": (now - timedelta(hours=3)).isoformat(),
            },
            {
                "id": str(uuid.uuid4()),
                "student_name": "Brian Mwangi",
                "student_id": str(uuid.uuid4()),
                "assessment_title": "Grade 5 English - Creative Writing Assignment",
                "assessment_type": "assignment",
                "course_name": "CBC English Grade 5",
                "original_grade": 45,
                "requested_grade": 65,
                "reason": "AI grading did not account for student's creative approach to the prompt. Instructor believes the response demonstrates understanding of narrative techniques.",
                "instructor_name": "Sarah Wambui",
                "instructor_id": str(uuid.uuid4()),
                "status": "pending",
                "requested_at": (now - timedelta(hours=6)).isoformat(),
            },
            {
                "id": str(uuid.uuid4()),
                "student_name": "Faith Njeri",
                "student_id": str(uuid.uuid4()),
                "assessment_title": "Grade 7 Science - Lab Report Project",
                "assessment_type": "project",
                "course_name": "CBC Science & Technology Grade 7",
                "original_grade": 70,
                "requested_grade": 82,
                "reason": "Student submitted supplementary video demonstration that was not evaluated in initial grading. Video shows excellent practical application.",
                "instructor_name": "Peter Otieno",
                "instructor_id": str(uuid.uuid4()),
                "status": "pending",
                "requested_at": (now - timedelta(hours=12)).isoformat(),
            },
            {
                "id": str(uuid.uuid4()),
                "student_name": "James Wafula",
                "student_id": str(uuid.uuid4()),
                "assessment_title": "Grade 4 Social Studies - Kenya Counties Quiz",
                "assessment_type": "quiz",
                "course_name": "CBC Social Studies Grade 4",
                "original_grade": 40,
                "requested_grade": 55,
                "reason": "Technical issue during quiz caused 3 questions to timeout. Student had answered correctly on practice attempts.",
                "instructor_name": "Mary Adhiambo",
                "instructor_id": str(uuid.uuid4()),
                "status": "pending",
                "requested_at": (now - timedelta(days=1)).isoformat(),
            },
            {
                "id": str(uuid.uuid4()),
                "student_name": "Grace Wangari",
                "student_id": str(uuid.uuid4()),
                "assessment_title": "Grade 8 Mathematics - Algebra Quiz",
                "assessment_type": "quiz",
                "course_name": "CBC Mathematics Grade 8",
                "original_grade": 62,
                "requested_grade": 75,
                "reason": "Student used an alternative valid method to solve equations. Auto-grader only accepted the standard approach.",
                "instructor_name": "David Kimani",
                "instructor_id": str(uuid.uuid4()),
                "status": "approved",
                "approved_by": "Admin",
                "approved_at": (now - timedelta(hours=2)).isoformat(),
                "requested_at": (now - timedelta(days=2)).isoformat(),
            },
            {
                "id": str(uuid.uuid4()),
                "student_name": "Dennis Kariuki",
                "student_id": str(uuid.uuid4()),
                "assessment_title": "Grade 6 English - Comprehension Exam",
                "assessment_type": "exam",
                "course_name": "CBC English Grade 6",
                "original_grade": 55,
                "requested_grade": 70,
                "reason": "Override request lacks sufficient justification. Student answers do not demonstrate the required comprehension level.",
                "instructor_name": "Sarah Wambui",
                "instructor_id": str(uuid.uuid4()),
                "status": "rejected",
                "rejected_by": "Admin",
                "rejected_at": (now - timedelta(hours=5)).isoformat(),
                "requested_at": (now - timedelta(days=3)).isoformat(),
            },
        ]

        # Calculate stats
        pending_count = sum(1 for o in all_overrides if o["status"] == "pending")
        approved_count = sum(1 for o in all_overrides if o["status"] == "approved")
        rejected_count = sum(1 for o in all_overrides if o["status"] == "rejected")

        # Paginate
        total = len(all_overrides)
        start = (page - 1) * page_size
        end = start + page_size
        items = all_overrides[start:end]

        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": max(1, -(-total // page_size)),
            "stats": {
                "total_this_month": total,
                "pending": pending_count,
                "approved": approved_count,
                "rejected": rejected_count,
            },
        }

    # ------------------------------------------------------------------
    # Certificates
    # ------------------------------------------------------------------
    @staticmethod
    async def get_certificates_log(
        db: AsyncSession,
        page: int = 1,
        page_size: int = 10,
    ) -> Dict[str, Any]:
        """
        Return certificate issuance log from the Certificate model.

        Falls back to mock data if the certificates table is empty.
        """
        count_q = select(func.count(Certificate.id))
        count_result = await db.execute(count_q)
        total_db: int = count_result.scalar() or 0

        if total_db > 0:
            # Use real data
            offset = (page - 1) * page_size
            q = (
                select(Certificate)
                .order_by(Certificate.issued_at.desc())
                .offset(offset)
                .limit(page_size)
            )
            result = await db.execute(q)
            certs = result.scalars().all()

            items = []
            for c in certs:
                items.append({
                    "id": str(c.id),
                    "serial_number": c.serial_number,
                    "student_name": c.student_name,
                    "course_name": c.course_name,
                    "grade": c.grade,
                    "issued_at": c.issued_at.isoformat() if c.issued_at else None,
                    "is_valid": c.is_valid,
                    "revoked_at": c.revoked_at.isoformat() if c.revoked_at else None,
                })

            valid_q = select(func.count(Certificate.id)).where(Certificate.is_valid == True)
            valid_result = await db.execute(valid_q)
            valid_count: int = valid_result.scalar() or 0

            revoked_q = select(func.count(Certificate.id)).where(Certificate.is_valid == False)
            revoked_result = await db.execute(revoked_q)
            revoked_count: int = revoked_result.scalar() or 0

            return {
                "items": items,
                "total": total_db,
                "page": page,
                "page_size": page_size,
                "total_pages": max(1, -(-total_db // page_size)),
                "stats": {
                    "total_issued": total_db,
                    "valid": valid_count,
                    "revoked": revoked_count,
                    "pending_issuance": 3,
                },
            }

        # Mock data fallback
        now = datetime.utcnow()

        mock_certs = [
            {
                "id": str(uuid.uuid4()),
                "serial_number": "UHS-20260115-00142",
                "student_name": "Amina Ochieng",
                "course_name": "CBC Mathematics Grade 6",
                "grade": "A",
                "issued_at": (now - timedelta(days=2)).isoformat(),
                "is_valid": True,
                "revoked_at": None,
            },
            {
                "id": str(uuid.uuid4()),
                "serial_number": "UHS-20260114-00141",
                "student_name": "Brian Mwangi",
                "course_name": "CBC English Grade 5",
                "grade": "B+",
                "issued_at": (now - timedelta(days=3)).isoformat(),
                "is_valid": True,
                "revoked_at": None,
            },
            {
                "id": str(uuid.uuid4()),
                "serial_number": "UHS-20260113-00140",
                "student_name": "Faith Njeri",
                "course_name": "CBC Science & Technology Grade 7",
                "grade": "A-",
                "issued_at": (now - timedelta(days=4)).isoformat(),
                "is_valid": True,
                "revoked_at": None,
            },
            {
                "id": str(uuid.uuid4()),
                "serial_number": "UHS-20260112-00139",
                "student_name": "James Wafula",
                "course_name": "CBC Social Studies Grade 4",
                "grade": "B",
                "issued_at": (now - timedelta(days=5)).isoformat(),
                "is_valid": True,
                "revoked_at": None,
            },
            {
                "id": str(uuid.uuid4()),
                "serial_number": "UHS-20260111-00138",
                "student_name": "Grace Wangari",
                "course_name": "CBC Mathematics Grade 8",
                "grade": "A",
                "issued_at": (now - timedelta(days=6)).isoformat(),
                "is_valid": True,
                "revoked_at": None,
            },
            {
                "id": str(uuid.uuid4()),
                "serial_number": "UHS-20260110-00137",
                "student_name": "Dennis Kariuki",
                "course_name": "CBC English Grade 6",
                "grade": "C+",
                "issued_at": (now - timedelta(days=8)).isoformat(),
                "is_valid": False,
                "revoked_at": (now - timedelta(days=1)).isoformat(),
            },
            {
                "id": str(uuid.uuid4()),
                "serial_number": "UHS-20260109-00136",
                "student_name": "Catherine Akinyi",
                "course_name": "CBC Creative Arts Grade 3",
                "grade": "A",
                "issued_at": (now - timedelta(days=10)).isoformat(),
                "is_valid": True,
                "revoked_at": None,
            },
            {
                "id": str(uuid.uuid4()),
                "serial_number": "UHS-20260108-00135",
                "student_name": "Peter Otieno Jr.",
                "course_name": "CBC Physical Education Grade 5",
                "grade": "B+",
                "issued_at": (now - timedelta(days=12)).isoformat(),
                "is_valid": True,
                "revoked_at": None,
            },
        ]

        total = len(mock_certs)
        start = (page - 1) * page_size
        end = start + page_size
        items = mock_certs[start:end]

        valid_count = sum(1 for c in mock_certs if c["is_valid"])
        revoked_count = sum(1 for c in mock_certs if not c["is_valid"])

        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": max(1, -(-total // page_size)),
            "stats": {
                "total_issued": total,
                "valid": valid_count,
                "revoked": revoked_count,
                "pending_issuance": 3,
            },
        }

    # ------------------------------------------------------------------
    # Resource Library
    # ------------------------------------------------------------------
    @staticmethod
    async def list_resources(
        db: AsyncSession,
        page: int = 1,
        page_size: int = 10,
        category: Optional[str] = None,
        status: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Return resource library items.

        Currently returns mock data until dedicated resource tables
        are implemented.
        """
        now = datetime.utcnow()

        all_resources = [
            {
                "id": str(uuid.uuid4()),
                "title": "Grade 4 Mathematics Workbook",
                "type": "PDF",
                "category": "Mathematics",
                "file_size": "4.2 MB",
                "file_size_bytes": 4404019,
                "status": "approved",
                "usage_count": 342,
                "uploaded_by": "Jane Wanjiku",
                "uploaded_at": (now - timedelta(days=15)).isoformat(),
                "grade_level": "Grade 4",
            },
            {
                "id": str(uuid.uuid4()),
                "title": "CBC Science Experiments - Water Cycle",
                "type": "Video",
                "category": "Science & Technology",
                "file_size": "128 MB",
                "file_size_bytes": 134217728,
                "status": "approved",
                "usage_count": 567,
                "uploaded_by": "Platform",
                "uploaded_at": (now - timedelta(days=20)).isoformat(),
                "grade_level": "Grade 5",
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Kenya Map - Counties Poster",
                "type": "Image",
                "category": "Social Studies",
                "file_size": "2.8 MB",
                "file_size_bytes": 2936013,
                "status": "approved",
                "usage_count": 891,
                "uploaded_by": "Platform",
                "uploaded_at": (now - timedelta(days=30)).isoformat(),
                "grade_level": "Grade 4-8",
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Kiswahili Grammar Guide",
                "type": "PDF",
                "category": "Language",
                "file_size": "1.5 MB",
                "file_size_bytes": 1572864,
                "status": "approved",
                "usage_count": 256,
                "uploaded_by": "Mary Adhiambo",
                "uploaded_at": (now - timedelta(days=10)).isoformat(),
                "grade_level": "Grade 6",
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Music Instruments of East Africa",
                "type": "Video",
                "category": "Creative Arts",
                "file_size": "95 MB",
                "file_size_bytes": 99614720,
                "status": "pending",
                "usage_count": 0,
                "uploaded_by": "David Kimani",
                "uploaded_at": (now - timedelta(days=1)).isoformat(),
                "grade_level": "Grade 3-5",
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Physical Education Safety Manual",
                "type": "Doc",
                "category": "Physical Education",
                "file_size": "850 KB",
                "file_size_bytes": 870400,
                "status": "approved",
                "usage_count": 134,
                "uploaded_by": "Platform",
                "uploaded_at": (now - timedelta(days=45)).isoformat(),
                "grade_level": "Grade 1-8",
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Unverified Religious Content Pack",
                "type": "PDF",
                "category": "Religious Education",
                "file_size": "3.1 MB",
                "file_size_bytes": 3250586,
                "status": "flagged",
                "usage_count": 12,
                "uploaded_by": "External Contributor",
                "uploaded_at": (now - timedelta(days=2)).isoformat(),
                "grade_level": "Grade 5",
                "flag_reason": "Content not verified against approved CRE/IRE syllabus",
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Grade 7 English Composition Templates",
                "type": "Doc",
                "category": "Language",
                "file_size": "620 KB",
                "file_size_bytes": 634880,
                "status": "approved",
                "usage_count": 445,
                "uploaded_by": "Sarah Wambui",
                "uploaded_at": (now - timedelta(days=8)).isoformat(),
                "grade_level": "Grade 7",
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Multiplication Tables Flashcards",
                "type": "Image",
                "category": "Mathematics",
                "file_size": "5.4 MB",
                "file_size_bytes": 5662310,
                "status": "approved",
                "usage_count": 723,
                "uploaded_by": "Platform",
                "uploaded_at": (now - timedelta(days=60)).isoformat(),
                "grade_level": "Grade 2-4",
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Suspicious External Resource",
                "type": "PDF",
                "category": "Mathematics",
                "file_size": "12.1 MB",
                "file_size_bytes": 12688506,
                "status": "flagged",
                "usage_count": 3,
                "uploaded_by": "Unknown Contributor",
                "uploaded_at": (now - timedelta(hours=8)).isoformat(),
                "grade_level": "Grade 6",
                "flag_reason": "Unusually large file size for content type. Potential embedded content detected.",
            },
        ]

        # Apply category filter
        if category:
            all_resources = [r for r in all_resources if r["category"] == category]

        # Apply status filter
        if status:
            all_resources = [r for r in all_resources if r["status"] == status]

        total = len(all_resources)
        start = (page - 1) * page_size
        end = start + page_size
        items = all_resources[start:end]

        # Stats
        approved_count = sum(1 for r in all_resources if r["status"] == "approved")
        pending_count = sum(1 for r in all_resources if r["status"] == "pending")
        flagged_count = sum(1 for r in all_resources if r["status"] == "flagged")

        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": max(1, -(-total // page_size)),
            "stats": {
                "total_resources": total,
                "approved": approved_count,
                "pending": pending_count,
                "flagged": flagged_count,
            },
        }
