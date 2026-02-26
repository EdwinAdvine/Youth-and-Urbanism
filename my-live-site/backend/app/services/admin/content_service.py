"""
Admin Content & Learning Integrity Service - Phase 4

Provides methods for course management, CBC alignment analysis,
assessment override handling, certificate management, and resource
library moderation.

All methods query real database models (Course, ContentVersion,
CompetencyTag, CourseCompetencyMapping, GradeOverride, ResourceItem).
"""

import logging
import uuid
from datetime import datetime
from decimal import Decimal
from typing import Any, Dict, List, Optional

from sqlalchemy import select, func, and_, or_, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.course import Course
from app.models.user import User
from app.models.certificate import Certificate
from app.models.admin.content_integrity import (
    ContentVersion,
    CompetencyTag,
    CourseCompetencyMapping,
    GradeOverride,
    ResourceItem,
)

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
        """Return a paginated list of courses with optional filters."""
        base_q = select(Course)
        count_q = select(func.count(Course.id))

        if search:
            search_pattern = f"%{search}%"
            search_cond = or_(
                Course.title.ilike(search_pattern),
                Course.learning_area.ilike(search_pattern),
            )
            base_q = base_q.where(search_cond)
            count_q = count_q.where(search_cond)

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

        total_result = await db.execute(count_q)
        total: int = total_result.scalar() or 0

        offset = (page - 1) * page_size
        base_q = base_q.order_by(Course.created_at.desc()).offset(offset).limit(page_size)

        result = await db.execute(base_q)
        courses = result.scalars().all()

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
            "total_pages": max(1, -(-total // page_size)),
        }

    @staticmethod
    async def approve_course(db: AsyncSession, course_id: str) -> Dict[str, Any]:
        """Approve a course for publication."""
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
        """Reject a course submission."""
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

    # ------------------------------------------------------------------
    # Course Versions (real queries)
    # ------------------------------------------------------------------
    @staticmethod
    async def get_course_versions(
        db: AsyncSession, course_id: str
    ) -> List[Dict[str, Any]]:
        """Return version history for a course from ContentVersion model."""
        try:
            course_uuid = uuid.UUID(course_id)
        except ValueError:
            return []

        q = (
            select(ContentVersion)
            .where(ContentVersion.course_id == course_uuid)
            .order_by(ContentVersion.version_number.desc())
        )
        result = await db.execute(q)
        versions = result.scalars().all()

        # Resolve author names
        author_ids = list({v.created_by for v in versions if v.created_by})
        names: Dict[str, str] = {}
        if author_ids:
            uq = select(User.id, User.first_name, User.last_name).where(User.id.in_(author_ids))
            uresult = await db.execute(uq)
            for row in uresult:
                names[str(row.id)] = f"{row.first_name} {row.last_name}"

        items: List[Dict[str, Any]] = []
        for v in versions:
            changes_data = v.changes if isinstance(v.changes, dict) else {}
            items.append({
                "id": str(v.id),
                "version": f"{v.version_number}.0.0",
                "author": names.get(str(v.created_by), "Unknown") if v.created_by else "System",
                "changes": changes_data.get("summary", str(changes_data)),
                "created_at": v.created_at.isoformat() if v.created_at else None,
                "status": changes_data.get("status", "approved"),
            })

        return items

    # ------------------------------------------------------------------
    # CBC Alignment (real queries)
    # ------------------------------------------------------------------
    @staticmethod
    async def get_cbc_alignment_data(db: AsyncSession) -> Dict[str, Any]:
        """
        Return CBC strand coverage data from CompetencyTag and
        CourseCompetencyMapping models.
        """
        # Get all competency tags grouped by strand
        tags_q = select(CompetencyTag).where(CompetencyTag.is_active == True)
        tags_result = await db.execute(tags_q)
        all_tags = tags_result.scalars().all()

        # Get all mappings
        mappings_q = select(CourseCompetencyMapping)
        mappings_result = await db.execute(mappings_q)
        all_mappings = mappings_result.scalars().all()

        # Build mapped tag IDs set
        mapped_tag_ids = {str(m.competency_tag_id) for m in all_mappings}

        # Group by strand
        strand_data: Dict[str, Dict[str, Any]] = {}
        for tag in all_tags:
            strand = tag.strand or "Uncategorised"
            if strand not in strand_data:
                strand_data[strand] = {
                    "strand": strand,
                    "total_competencies": 0,
                    "mapped_competencies": 0,
                    "sub_strands": {},
                    "gaps": [],
                }
            strand_data[strand]["total_competencies"] += 1
            if str(tag.id) in mapped_tag_ids:
                strand_data[strand]["mapped_competencies"] += 1

            # Track sub-strands
            sub = tag.sub_strand or "General"
            if sub not in strand_data[strand]["sub_strands"]:
                strand_data[strand]["sub_strands"][sub] = {"total": 0, "mapped": 0}
            strand_data[strand]["sub_strands"][sub]["total"] += 1
            if str(tag.id) in mapped_tag_ids:
                strand_data[strand]["sub_strands"][sub]["mapped"] += 1
            else:
                strand_data[strand]["gaps"].append(
                    f"{tag.name} ({tag.grade_level})" if tag.grade_level else tag.name
                )

        # Format output
        strands: List[Dict[str, Any]] = []
        for s_data in strand_data.values():
            total = s_data["total_competencies"]
            mapped = s_data["mapped_competencies"]
            coverage = round((mapped / total) * 100, 1) if total > 0 else 0

            sub_list = []
            for sub_name, sub_counts in s_data["sub_strands"].items():
                sub_cov = round((sub_counts["mapped"] / sub_counts["total"]) * 100) if sub_counts["total"] > 0 else 0
                sub_list.append({
                    "name": sub_name,
                    "coverage": sub_cov,
                    "total": sub_counts["total"],
                    "mapped": sub_counts["mapped"],
                })

            strands.append({
                "strand": s_data["strand"],
                "total_competencies": total,
                "mapped_competencies": mapped,
                "coverage_percentage": coverage,
                "sub_strands": sub_list,
                "gaps": s_data["gaps"][:5],  # Limit to top 5 gaps
            })

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
    # Assessment Overrides (real queries)
    # ------------------------------------------------------------------
    @staticmethod
    async def get_assessment_overrides(
        db: AsyncSession,
        page: int = 1,
        page_size: int = 10,
    ) -> Dict[str, Any]:
        """Return grade override request queue from GradeOverride model."""
        count_q = select(func.count(GradeOverride.id))
        count_result = await db.execute(count_q)
        total: int = count_result.scalar() or 0

        offset = (page - 1) * page_size
        q = (
            select(GradeOverride)
            .order_by(GradeOverride.created_at.desc())
            .offset(offset)
            .limit(page_size)
        )
        result = await db.execute(q)
        overrides = result.scalars().all()

        # Resolve user names (requesters and deciders)
        user_ids = set()
        for o in overrides:
            if o.requested_by:
                user_ids.add(o.requested_by)
            if o.decided_by:
                user_ids.add(o.decided_by)
        names: Dict[str, str] = {}
        if user_ids:
            uq = select(User.id, User.first_name, User.last_name).where(User.id.in_(list(user_ids)))
            uresult = await db.execute(uq)
            for row in uresult:
                names[str(row.id)] = f"{row.first_name} {row.last_name}"

        items: List[Dict[str, Any]] = []
        for o in overrides:
            item = {
                "id": str(o.id),
                "assessment_id": str(o.assessment_id) if o.assessment_id else None,
                "student_id": str(o.student_id) if o.student_id else None,
                "original_score": o.original_score,
                "override_score": o.override_score,
                "reason": o.reason,
                "requested_by": names.get(str(o.requested_by), "Unknown") if o.requested_by else None,
                "status": o.status,
                "created_at": o.created_at.isoformat() if o.created_at else None,
            }
            if o.decided_by:
                item["decided_by"] = names.get(str(o.decided_by), "Unknown")
                item["decided_at"] = o.decided_at.isoformat() if o.decided_at else None
            items.append(item)

        # Stats
        pending_q = select(func.count(GradeOverride.id)).where(GradeOverride.status == "pending")
        approved_q = select(func.count(GradeOverride.id)).where(GradeOverride.status == "approved")
        rejected_q = select(func.count(GradeOverride.id)).where(GradeOverride.status == "rejected")

        pending_r = await db.execute(pending_q)
        approved_r = await db.execute(approved_q)
        rejected_r = await db.execute(rejected_q)

        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": max(1, -(-total // page_size)),
            "stats": {
                "total_this_month": total,
                "pending": pending_r.scalar() or 0,
                "approved": approved_r.scalar() or 0,
                "rejected": rejected_r.scalar() or 0,
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
        """Return certificate issuance log from the Certificate model."""
        count_q = select(func.count(Certificate.id))
        count_result = await db.execute(count_q)
        total_db: int = count_result.scalar() or 0

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
            },
        }

    # ------------------------------------------------------------------
    # Resource Library (real queries)
    # ------------------------------------------------------------------
    @staticmethod
    async def list_resources(
        db: AsyncSession,
        page: int = 1,
        page_size: int = 10,
        category: Optional[str] = None,
        status: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Return resource library items from the ResourceItem model."""
        conditions = []
        if category:
            conditions.append(ResourceItem.category == category)
        if status:
            conditions.append(ResourceItem.moderation_status == status)

        where_clause = and_(*conditions) if conditions else True

        count_q = select(func.count(ResourceItem.id)).where(where_clause)
        count_result = await db.execute(count_q)
        total: int = count_result.scalar() or 0

        offset = (page - 1) * page_size
        q = (
            select(ResourceItem)
            .where(where_clause)
            .order_by(ResourceItem.created_at.desc())
            .offset(offset)
            .limit(page_size)
        )
        result = await db.execute(q)
        resources = result.scalars().all()

        # Resolve uploader names
        uploader_ids = list({r.uploaded_by for r in resources if r.uploaded_by})
        names: Dict[str, str] = {}
        if uploader_ids:
            uq = select(User.id, User.first_name, User.last_name).where(User.id.in_(uploader_ids))
            uresult = await db.execute(uq)
            for row in uresult:
                names[str(row.id)] = f"{row.first_name} {row.last_name}"

        items: List[Dict[str, Any]] = []
        for r in resources:
            # Format file size
            size_bytes = r.file_size_bytes or 0
            if size_bytes >= 1_048_576:
                file_size = f"{size_bytes / 1_048_576:.1f} MB"
            elif size_bytes >= 1024:
                file_size = f"{size_bytes / 1024:.0f} KB"
            else:
                file_size = f"{size_bytes} B"

            items.append({
                "id": str(r.id),
                "title": r.title,
                "type": r.file_type,
                "category": r.category,
                "file_size": file_size,
                "file_size_bytes": size_bytes,
                "status": r.moderation_status,
                "usage_count": r.usage_count or 0,
                "uploaded_by": names.get(str(r.uploaded_by), "Platform") if r.uploaded_by else "Platform",
                "uploaded_at": r.created_at.isoformat() if r.created_at else None,
                "tags": r.tags or [],
            })

        # Stats
        approved_q = select(func.count(ResourceItem.id)).where(ResourceItem.moderation_status == "approved")
        pending_q = select(func.count(ResourceItem.id)).where(ResourceItem.moderation_status == "pending")
        flagged_q = select(func.count(ResourceItem.id)).where(ResourceItem.moderation_status == "flagged")

        approved_r = await db.execute(approved_q)
        pending_r = await db.execute(pending_q)
        flagged_r = await db.execute(flagged_q)

        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": max(1, -(-total // page_size)),
            "stats": {
                "total_resources": total,
                "approved": approved_r.scalar() or 0,
                "pending": pending_r.scalar() or 0,
                "flagged": flagged_r.scalar() or 0,
            },
        }
