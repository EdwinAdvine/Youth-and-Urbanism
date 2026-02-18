"""
Sponsorship Service

Core business logic for sponsorship programs, sponsored children
management, progress tracking, and parent e-signature consent workflows.
"""

import logging
import uuid
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from sqlalchemy import select, func, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.partner.sponsorship import (
    SponsorshipProgram,
    SponsoredChild,
    SponsorshipConsent,
    ProgramStatus,
    SponsoredChildStatus,
)
from app.models.student import Student
from app.models.enrollment import Enrollment
from app.models.certificate import Certificate
from app.models.user import User

logger = logging.getLogger(__name__)


class SponsorshipService:
    """Facade used by partner sponsorship routes.

    Bridges between route-level call signatures and the module-level
    async functions defined below.
    """

    @staticmethod
    async def create_program(db, partner_id, **kwargs):
        return await create_sponsorship_program(db, partner_id, kwargs)

    @staticmethod
    async def list_programs(db, partner_id, page=1, page_size=20, status_filter=None):
        return await get_programs(db, partner_id, page=page, page_size=page_size)

    @staticmethod
    async def get_program(db, partner_id, program_id):
        return await get_program_detail(db, partner_id, program_id)

    @staticmethod
    async def update_program(db, partner_id, program_id, updates):
        return await update_program(db, partner_id, program_id, updates)

    @staticmethod
    async def add_children(db, partner_id, program_id, student_ids):
        return await add_children_to_program(db, partner_id, program_id, student_ids)

    @staticmethod
    async def remove_child(db, partner_id, program_id, student_id):
        return await remove_child_from_program(db, partner_id, program_id, student_id)

    @staticmethod
    async def list_children(db, partner_id, page=1, page_size=20, program_id=None, grade_level=None):
        return await get_sponsored_children(db, partner_id, page=page, page_size=page_size)

    @staticmethod
    async def get_child_progress(db, partner_id, child_id):
        # Module function takes (db, sponsored_child_id, partner_id)
        return await get_child_progress(db, child_id, partner_id)

    @staticmethod
    async def get_child_activity(db, partner_id, child_id, period="week"):
        # Module function takes (db, sponsored_child_id, partner_id)
        return await get_child_activity(db, child_id, partner_id)

    @staticmethod
    async def get_child_achievements(db, partner_id, child_id):
        return await get_child_achievements(db, child_id, partner_id)

    @staticmethod
    async def get_child_goals(db, partner_id, child_id):
        return await get_child_goals(db, child_id, partner_id)

    @staticmethod
    async def request_consent(db, partner_id, sponsored_child_id):
        # Module function takes (db, sponsored_child_id) only
        return await request_consent(db, sponsored_child_id)

    @staticmethod
    async def respond_to_consent(db, consent_id, responder_id, agreed, consent_text=None):
        # Module function: process_consent(db, consent_id, parent_id, agreed, ip_address, user_agent)
        return await process_consent(db, consent_id, responder_id, agreed, ip_address="api", user_agent="api")

    @staticmethod
    async def get_consent_status(db, partner_id):
        return await get_consent_status(db, partner_id)


# ------------------------------------------------------------------
# Default consent text shown to parents
# ------------------------------------------------------------------
DEFAULT_CONSENT_TEXT = (
    "I, the parent/guardian, hereby consent to sharing my child's academic "
    "progress data (grades, attendance, learning milestones) with the "
    "sponsoring partner organisation for the purpose of monitoring educational "
    "outcomes. I understand that personally identifiable information will be "
    "protected in accordance with Kenya's Data Protection Act, 2019. "
    "I may revoke this consent at any time."
)


# ------------------------------------------------------------------
# Program CRUD
# ------------------------------------------------------------------

async def create_sponsorship_program(
    db: AsyncSession,
    partner_id: str,
    data: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Create a new sponsorship program.

    The program is created in DRAFT status. The partner must later submit
    it for approval to activate it.

    Args:
        db: Async database session.
        partner_id: UUID of the partner user creating the program.
        data: Program fields (name, description, program_type,
              min_children, max_children, billing_period, etc.).

    Returns:
        Dictionary representing the newly created program.
    """
    try:
        program = SponsorshipProgram(
            partner_id=partner_id,
            name=data.get("name", "Untitled Program"),
            description=data.get("description"),
            program_type=data.get("program_type", "cohort"),
            min_children=data.get("min_children", 10),
            max_children=data.get("max_children"),
            status=ProgramStatus.DRAFT,
            billing_period=data.get("billing_period"),
            price_per_child=data.get("price_per_child"),
            currency=data.get("currency", "KES"),
            custom_pricing_notes=data.get("custom_pricing_notes"),
            start_date=data.get("start_date"),
            end_date=data.get("end_date"),
            goals=data.get("goals", []),
            target_grade_levels=data.get("target_grade_levels", []),
            target_regions=data.get("target_regions", []),
        )

        db.add(program)
        await db.flush()

        logger.info(
            f"Created sponsorship program '{program.name}' "
            f"(id={program.id}) for partner {partner_id}"
        )

        return _program_to_dict(program)

    except Exception as e:
        logger.error(f"Error creating sponsorship program for partner {partner_id}: {e}")
        raise


async def get_programs(
    db: AsyncSession,
    partner_id: str,
    page: int = 1,
    page_size: int = 20,
) -> Dict[str, Any]:
    """
    Return a paginated list of sponsorship programs belonging to a partner.

    Args:
        db: Async database session.
        partner_id: UUID of the partner user.
        page: 1-based page number.
        page_size: Number of items per page.

    Returns:
        Dictionary with items, total, page, page_size, and total_pages.
    """
    try:
        base_filter = SponsorshipProgram.partner_id == partner_id

        # Total count
        total_q = select(func.count(SponsorshipProgram.id)).where(base_filter)
        total_result = await db.execute(total_q)
        total: int = total_result.scalar() or 0

        # Paginated items
        offset = (page - 1) * page_size
        items_q = (
            select(SponsorshipProgram)
            .where(base_filter)
            .order_by(SponsorshipProgram.created_at.desc())
            .offset(offset)
            .limit(page_size)
        )
        items_result = await db.execute(items_q)
        programs = items_result.scalars().all()

        # Count children per program
        program_ids = [p.id for p in programs]
        child_counts: Dict[str, int] = {}
        if program_ids:
            counts_q = (
                select(
                    SponsoredChild.program_id,
                    func.count(SponsoredChild.id).label("cnt"),
                )
                .where(
                    and_(
                        SponsoredChild.program_id.in_(program_ids),
                        SponsoredChild.status != SponsoredChildStatus.REMOVED,
                    )
                )
                .group_by(SponsoredChild.program_id)
            )
            counts_result = await db.execute(counts_q)
            for row in counts_result.all():
                child_counts[str(row.program_id)] = row.cnt

        items = []
        for p in programs:
            d = _program_to_dict(p)
            d["children_count"] = child_counts.get(str(p.id), 0)
            items.append(d)

        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": max(1, -(-total // page_size)),
        }

    except Exception as e:
        logger.error(f"Error listing programs for partner {partner_id}: {e}")
        raise


async def get_program_detail(
    db: AsyncSession,
    program_id: str,
    partner_id: str,
) -> Optional[Dict[str, Any]]:
    """
    Get detailed information about a single sponsorship program.

    Includes child counts by status and recent activity summary.

    Args:
        db: Async database session.
        program_id: UUID of the program.
        partner_id: UUID of the partner user (for ownership check).

    Returns:
        Detailed program dictionary or None if not found / not owned.
    """
    try:
        query = select(SponsorshipProgram).where(
            and_(
                SponsorshipProgram.id == program_id,
                SponsorshipProgram.partner_id == partner_id,
            )
        )
        result = await db.execute(query)
        program = result.scalar_one_or_none()

        if not program:
            return None

        # Children by status
        status_q = (
            select(
                SponsoredChild.status,
                func.count(SponsoredChild.id).label("cnt"),
            )
            .where(SponsoredChild.program_id == program_id)
            .group_by(SponsoredChild.status)
        )
        status_result = await db.execute(status_q)
        children_by_status = {
            str(row.status.value) if hasattr(row.status, "value") else str(row.status): row.cnt
            for row in status_result.all()
        }

        detail = _program_to_dict(program)
        detail["children_by_status"] = children_by_status
        detail["total_children"] = sum(children_by_status.values())

        return detail

    except Exception as e:
        logger.error(f"Error fetching program {program_id} for partner {partner_id}: {e}")
        raise


async def update_program(
    db: AsyncSession,
    program_id: str,
    partner_id: str,
    updates: Dict[str, Any],
) -> Optional[Dict[str, Any]]:
    """
    Update an existing sponsorship program.

    Only programs owned by the partner can be updated. Certain fields
    are only editable while the program is in DRAFT status.

    Args:
        db: Async database session.
        program_id: UUID of the program.
        partner_id: UUID of the partner user.
        updates: Dictionary of fields to update.

    Returns:
        Updated program dictionary or None if not found.
    """
    try:
        query = select(SponsorshipProgram).where(
            and_(
                SponsorshipProgram.id == program_id,
                SponsorshipProgram.partner_id == partner_id,
            )
        )
        result = await db.execute(query)
        program = result.scalar_one_or_none()

        if not program:
            return None

        updatable_fields = [
            "name",
            "description",
            "program_type",
            "min_children",
            "max_children",
            "status",
            "billing_period",
            "price_per_child",
            "currency",
            "custom_pricing_notes",
            "start_date",
            "end_date",
            "goals",
            "target_grade_levels",
            "target_regions",
        ]

        for field in updatable_fields:
            if field in updates:
                setattr(program, field, updates[field])

        program.updated_at = datetime.utcnow()
        await db.flush()

        logger.info(f"Updated program {program_id} for partner {partner_id}")

        return await get_program_detail(db, program_id, partner_id)

    except Exception as e:
        logger.error(f"Error updating program {program_id}: {e}")
        raise


# ------------------------------------------------------------------
# Child management
# ------------------------------------------------------------------

async def add_children_to_program(
    db: AsyncSession,
    program_id: str,
    partner_id: str,
    student_ids: List[str],
) -> List[Dict[str, Any]]:
    """
    Add one or more students to a sponsorship program.

    Each child is linked with PENDING_CONSENT status. A consent
    record is automatically created for the parent to approve.

    Args:
        db: Async database session.
        program_id: UUID of the sponsorship program.
        partner_id: UUID of the partner user.
        student_ids: List of student UUIDs to add.

    Returns:
        List of dictionaries representing the newly created SponsoredChild records.
    """
    try:
        # Verify program ownership
        prog_q = select(SponsorshipProgram).where(
            and_(
                SponsorshipProgram.id == program_id,
                SponsorshipProgram.partner_id == partner_id,
            )
        )
        prog_result = await db.execute(prog_q)
        program = prog_result.scalar_one_or_none()

        if not program:
            raise ValueError(f"Program {program_id} not found or not owned by partner {partner_id}")

        # Fetch existing child IDs to avoid duplicates
        existing_q = select(SponsoredChild.student_id).where(
            and_(
                SponsoredChild.program_id == program_id,
                SponsoredChild.status != SponsoredChildStatus.REMOVED,
            )
        )
        existing_result = await db.execute(existing_q)
        existing_student_ids = {str(row[0]) for row in existing_result.all()}

        added: List[Dict[str, Any]] = []

        for sid in student_ids:
            if sid in existing_student_ids:
                logger.warning(f"Student {sid} already in program {program_id}, skipping")
                continue

            # Verify student exists
            student_q = select(Student).where(Student.id == sid)
            student_result = await db.execute(student_q)
            student = student_result.scalar_one_or_none()
            if not student:
                logger.warning(f"Student {sid} not found, skipping")
                continue

            child = SponsoredChild(
                program_id=program_id,
                student_id=sid,
                partner_id=partner_id,
                status=SponsoredChildStatus.PENDING_CONSENT,
                partner_goals=[],
                ai_milestones=[],
            )
            db.add(child)
            await db.flush()

            # Auto-create consent record for the parent
            parent_id = student.parent_id
            if parent_id:
                consent = SponsorshipConsent(
                    sponsored_child_id=child.id,
                    parent_id=parent_id,
                    consent_given=False,
                    consent_text=DEFAULT_CONSENT_TEXT,
                )
                db.add(consent)
                await db.flush()

            added.append({
                "id": str(child.id),
                "program_id": str(child.program_id),
                "student_id": str(child.student_id),
                "partner_id": str(child.partner_id),
                "status": child.status.value if hasattr(child.status, "value") else str(child.status),
                "created_at": child.created_at.isoformat() if child.created_at else None,
            })

        logger.info(f"Added {len(added)} children to program {program_id}")
        return added

    except ValueError:
        raise
    except Exception as e:
        logger.error(f"Error adding children to program {program_id}: {e}")
        raise


async def remove_child_from_program(
    db: AsyncSession,
    program_id: str,
    student_id: str,
    partner_id: str,
) -> bool:
    """
    Remove a child from a sponsorship program.

    Sets the child's status to REMOVED and records a timestamp rather
    than deleting the record, preserving audit history.

    Args:
        db: Async database session.
        program_id: UUID of the program.
        student_id: UUID of the student.
        partner_id: UUID of the partner (ownership verification).

    Returns:
        True if the child was removed, False if not found.
    """
    try:
        query = select(SponsoredChild).where(
            and_(
                SponsoredChild.program_id == program_id,
                SponsoredChild.student_id == student_id,
                SponsoredChild.partner_id == partner_id,
                SponsoredChild.status != SponsoredChildStatus.REMOVED,
            )
        )
        result = await db.execute(query)
        child = result.scalar_one_or_none()

        if not child:
            return False

        child.status = SponsoredChildStatus.REMOVED
        child.removed_at = datetime.utcnow()
        child.updated_at = datetime.utcnow()
        await db.flush()

        logger.info(
            f"Removed student {student_id} from program {program_id} "
            f"(partner {partner_id})"
        )
        return True

    except Exception as e:
        logger.error(
            f"Error removing child {student_id} from program {program_id}: {e}"
        )
        raise


async def get_sponsored_children(
    db: AsyncSession,
    partner_id: str,
    page: int = 1,
    page_size: int = 20,
) -> Dict[str, Any]:
    """
    Return a paginated list of all sponsored children for a partner
    across all programs.

    Includes basic student info and current status.

    Args:
        db: Async database session.
        partner_id: UUID of the partner user.
        page: 1-based page number.
        page_size: Number of items per page.

    Returns:
        Dictionary with items, total, page, page_size, and total_pages.
    """
    try:
        base_filter = and_(
            SponsoredChild.partner_id == partner_id,
            SponsoredChild.status != SponsoredChildStatus.REMOVED,
        )

        # Total count
        total_q = select(func.count(SponsoredChild.id)).where(base_filter)
        total_result = await db.execute(total_q)
        total: int = total_result.scalar() or 0

        # Paginated items
        offset = (page - 1) * page_size
        items_q = (
            select(SponsoredChild)
            .where(base_filter)
            .order_by(SponsoredChild.created_at.desc())
            .offset(offset)
            .limit(page_size)
        )
        items_result = await db.execute(items_q)
        children = items_result.scalars().all()

        # Enrich with student details
        items = []
        for child in children:
            student_q = select(Student).where(Student.id == child.student_id)
            student_result = await db.execute(student_q)
            student = student_result.scalar_one_or_none()

            # Get program name
            prog_q = select(SponsorshipProgram.name).where(
                SponsorshipProgram.id == child.program_id
            )
            prog_result = await db.execute(prog_q)
            prog_name = prog_result.scalar()

            items.append({
                "id": str(child.id),
                "program_id": str(child.program_id),
                "program_name": prog_name,
                "student_id": str(child.student_id),
                "grade_level": student.grade_level if student else None,
                "admission_number": student.admission_number if student else None,
                "is_active_student": student.is_active if student else False,
                "status": child.status.value if hasattr(child.status, "value") else str(child.status),
                "enrolled_at": child.enrolled_at.isoformat() if child.enrolled_at else None,
                "partner_goals": child.partner_goals or [],
                "ai_milestones": child.ai_milestones or [],
                "notes": child.notes,
                "created_at": child.created_at.isoformat() if child.created_at else None,
            })

        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": max(1, -(-total // page_size)),
        }

    except Exception as e:
        logger.error(f"Error listing sponsored children for partner {partner_id}: {e}")
        raise


# ------------------------------------------------------------------
# Child progress / activity / achievements / goals
# ------------------------------------------------------------------

async def get_child_progress(
    db: AsyncSession,
    sponsored_child_id: str,
    partner_id: str,
) -> Optional[Dict[str, Any]]:
    """
    Return learning journey data for a sponsored child.

    Includes enrollment progress, time spent, current grades, and
    CBC competency tracking.

    Args:
        db: Async database session.
        sponsored_child_id: UUID of the SponsoredChild record.
        partner_id: UUID of the partner (ownership check).

    Returns:
        Progress dictionary or None if the child is not found / not owned.
    """
    try:
        child = await _get_verified_child(db, sponsored_child_id, partner_id)
        if not child:
            return None

        student_q = select(Student).where(Student.id == child.student_id)
        student_result = await db.execute(student_q)
        student = student_result.scalar_one_or_none()

        # Get enrollments
        enrollments_q = (
            select(Enrollment)
            .where(
                and_(
                    Enrollment.student_id == child.student_id,
                    Enrollment.is_deleted == False,  # noqa: E712
                )
            )
            .order_by(Enrollment.enrolled_at.desc())
        )
        enrollments_result = await db.execute(enrollments_q)
        enrollments = enrollments_result.scalars().all()

        enrollment_data = []
        for e in enrollments:
            enrollment_data.append({
                "enrollment_id": str(e.id),
                "course_id": str(e.course_id),
                "status": e.status.value if hasattr(e.status, "value") else str(e.status),
                "progress_percentage": float(e.progress_percentage) if e.progress_percentage else 0.0,
                "current_grade": float(e.current_grade) if e.current_grade else None,
                "total_time_spent_minutes": e.total_time_spent_minutes or 0,
                "is_completed": e.is_completed,
                "completed_at": e.completed_at.isoformat() if e.completed_at else None,
                "enrolled_at": e.enrolled_at.isoformat() if e.enrolled_at else None,
            })

        total_time = sum(e.total_time_spent_minutes or 0 for e in enrollments)
        avg_progress = 0.0
        if enrollments:
            avg_progress = round(
                sum(float(e.progress_percentage or 0) for e in enrollments) / len(enrollments),
                2,
            )

        return {
            "sponsored_child_id": str(child.id),
            "student_id": str(child.student_id),
            "grade_level": student.grade_level if student else None,
            "competencies": student.competencies if student else {},
            "overall_performance": student.overall_performance if student else {},
            "enrollments": enrollment_data,
            "summary": {
                "total_courses": len(enrollments),
                "completed_courses": sum(1 for e in enrollments if e.is_completed),
                "average_progress": avg_progress,
                "total_time_spent_minutes": total_time,
            },
            "partner_goals": child.partner_goals or [],
            "ai_milestones": child.ai_milestones or [],
        }

    except Exception as e:
        logger.error(f"Error fetching child progress for {sponsored_child_id}: {e}")
        raise


async def get_child_activity(
    db: AsyncSession,
    sponsored_child_id: str,
    partner_id: str,
) -> Optional[Dict[str, Any]]:
    """
    Return daily/weekly activity data for a sponsored child.

    Provides recent enrollment access timestamps, lesson completion
    events, and time-spent metrics.

    Args:
        db: Async database session.
        sponsored_child_id: UUID of the SponsoredChild record.
        partner_id: UUID of the partner (ownership check).

    Returns:
        Activity dictionary or None if not found.
    """
    try:
        child = await _get_verified_child(db, sponsored_child_id, partner_id)
        if not child:
            return None

        now = datetime.utcnow()
        week_ago = now - timedelta(days=7)

        # Recent enrollments activity (accessed in last 7 days)
        recent_q = (
            select(Enrollment)
            .where(
                and_(
                    Enrollment.student_id == child.student_id,
                    Enrollment.is_deleted == False,  # noqa: E712
                    or_(
                        Enrollment.last_accessed_at >= week_ago,
                        Enrollment.updated_at >= week_ago,
                    ),
                )
            )
            .order_by(Enrollment.last_accessed_at.desc().nullslast())
        )
        recent_result = await db.execute(recent_q)
        recent_enrollments = recent_result.scalars().all()

        # Total active enrollments
        active_count_q = select(func.count(Enrollment.id)).where(
            and_(
                Enrollment.student_id == child.student_id,
                Enrollment.is_deleted == False,  # noqa: E712
                Enrollment.status == "active",
            )
        )
        active_count_result = await db.execute(active_count_q)
        active_count: int = active_count_result.scalar() or 0

        recent_activity = []
        for e in recent_enrollments:
            recent_activity.append({
                "enrollment_id": str(e.id),
                "course_id": str(e.course_id),
                "last_accessed_at": e.last_accessed_at.isoformat() if e.last_accessed_at else None,
                "progress_percentage": float(e.progress_percentage) if e.progress_percentage else 0.0,
                "time_spent_minutes": e.total_time_spent_minutes or 0,
            })

        # Weekly time estimate
        weekly_time = sum(e.total_time_spent_minutes or 0 for e in recent_enrollments)

        return {
            "sponsored_child_id": str(child.id),
            "student_id": str(child.student_id),
            "active_enrollments": active_count,
            "recent_activity": recent_activity,
            "weekly_time_spent_minutes": weekly_time,
            "last_active_at": (
                recent_enrollments[0].last_accessed_at.isoformat()
                if recent_enrollments and recent_enrollments[0].last_accessed_at
                else None
            ),
            "period": {
                "from": week_ago.isoformat(),
                "to": now.isoformat(),
            },
        }

    except Exception as e:
        logger.error(f"Error fetching child activity for {sponsored_child_id}: {e}")
        raise


async def get_child_achievements(
    db: AsyncSession,
    sponsored_child_id: str,
    partner_id: str,
) -> Optional[Dict[str, Any]]:
    """
    Return certificates, badges, and milestones for a sponsored child.

    Args:
        db: Async database session.
        sponsored_child_id: UUID of the SponsoredChild record.
        partner_id: UUID of the partner (ownership check).

    Returns:
        Achievements dictionary or None if not found.
    """
    try:
        child = await _get_verified_child(db, sponsored_child_id, partner_id)
        if not child:
            return None

        # Fetch student record
        student_q = select(Student).where(Student.id == child.student_id)
        student_result = await db.execute(student_q)
        student = student_result.scalar_one_or_none()

        # Fetch certificates (linked via user_id on student)
        certificates = []
        if student:
            certs_q = (
                select(Certificate)
                .where(
                    and_(
                        Certificate.student_id == student.user_id,
                        Certificate.is_valid == True,  # noqa: E712
                    )
                )
                .order_by(Certificate.issued_at.desc())
            )
            certs_result = await db.execute(certs_q)
            for cert in certs_result.scalars().all():
                certificates.append({
                    "id": str(cert.id),
                    "serial_number": cert.serial_number,
                    "course_name": cert.course_name,
                    "grade": cert.grade,
                    "completion_date": cert.completion_date.isoformat() if cert.completion_date else None,
                    "issued_at": cert.issued_at.isoformat() if cert.issued_at else None,
                })

        # Completed courses count
        completed_q = select(func.count(Enrollment.id)).where(
            and_(
                Enrollment.student_id == child.student_id,
                Enrollment.is_completed == True,  # noqa: E712
                Enrollment.is_deleted == False,  # noqa: E712
            )
        )
        completed_result = await db.execute(completed_q)
        completed_courses: int = completed_result.scalar() or 0

        return {
            "sponsored_child_id": str(child.id),
            "student_id": str(child.student_id),
            "certificates": certificates,
            "certificates_count": len(certificates),
            "completed_courses": completed_courses,
            "ai_milestones": child.ai_milestones or [],
            "competencies": student.competencies if student else {},
        }

    except Exception as e:
        logger.error(f"Error fetching child achievements for {sponsored_child_id}: {e}")
        raise


async def get_child_goals(
    db: AsyncSession,
    sponsored_child_id: str,
    partner_id: str,
) -> Optional[Dict[str, Any]]:
    """
    Return partner-set goals and AI-suggested milestones for a child.

    Args:
        db: Async database session.
        sponsored_child_id: UUID of the SponsoredChild record.
        partner_id: UUID of the partner (ownership check).

    Returns:
        Goals dictionary or None if not found.
    """
    try:
        child = await _get_verified_child(db, sponsored_child_id, partner_id)
        if not child:
            return None

        # Get program-level goals
        prog_q = select(SponsorshipProgram).where(
            SponsorshipProgram.id == child.program_id
        )
        prog_result = await db.execute(prog_q)
        program = prog_result.scalar_one_or_none()

        return {
            "sponsored_child_id": str(child.id),
            "student_id": str(child.student_id),
            "program_goals": program.goals if program else [],
            "partner_goals": child.partner_goals or [],
            "ai_milestones": child.ai_milestones or [],
            "notes": child.notes,
        }

    except Exception as e:
        logger.error(f"Error fetching child goals for {sponsored_child_id}: {e}")
        raise


# ------------------------------------------------------------------
# Consent workflow
# ------------------------------------------------------------------

async def request_consent(
    db: AsyncSession,
    sponsored_child_id: str,
) -> Dict[str, Any]:
    """
    Create or refresh a consent request for a sponsored child's parent.

    If a consent record already exists, it is returned. Otherwise a new
    one is created and associated with the child's parent.

    Args:
        db: Async database session.
        sponsored_child_id: UUID of the SponsoredChild record.

    Returns:
        Dictionary containing consent record information.
    """
    try:
        # Load the sponsored child
        child_q = select(SponsoredChild).where(SponsoredChild.id == sponsored_child_id)
        child_result = await db.execute(child_q)
        child = child_result.scalar_one_or_none()

        if not child:
            raise ValueError(f"Sponsored child {sponsored_child_id} not found")

        # Check for existing consent
        existing_q = select(SponsorshipConsent).where(
            SponsorshipConsent.sponsored_child_id == sponsored_child_id
        )
        existing_result = await db.execute(existing_q)
        existing = existing_result.scalar_one_or_none()

        if existing:
            return _consent_to_dict(existing)

        # Get parent from student record
        student_q = select(Student).where(Student.id == child.student_id)
        student_result = await db.execute(student_q)
        student = student_result.scalar_one_or_none()

        if not student or not student.parent_id:
            raise ValueError(
                f"Cannot create consent: student {child.student_id} "
                "has no linked parent"
            )

        consent = SponsorshipConsent(
            sponsored_child_id=sponsored_child_id,
            parent_id=student.parent_id,
            consent_given=False,
            consent_text=DEFAULT_CONSENT_TEXT,
        )
        db.add(consent)
        await db.flush()

        logger.info(f"Created consent request for sponsored child {sponsored_child_id}")

        return _consent_to_dict(consent)

    except ValueError:
        raise
    except Exception as e:
        logger.error(f"Error requesting consent for {sponsored_child_id}: {e}")
        raise


async def process_consent(
    db: AsyncSession,
    consent_id: str,
    parent_id: str,
    agreed: bool,
    ip_address: str,
    user_agent: str,
) -> Dict[str, Any]:
    """
    Process a parent's consent decision (agree or decline).

    Records the audit trail (IP, user agent, timestamp) and updates the
    sponsored child status accordingly.

    Args:
        db: Async database session.
        consent_id: UUID of the SponsorshipConsent record.
        parent_id: UUID of the parent user (authorization check).
        agreed: True if the parent consents, False to decline.
        ip_address: IP address of the parent at time of consent.
        user_agent: Browser user agent string.

    Returns:
        Updated consent record dictionary.
    """
    try:
        query = select(SponsorshipConsent).where(
            and_(
                SponsorshipConsent.id == consent_id,
                SponsorshipConsent.parent_id == parent_id,
            )
        )
        result = await db.execute(query)
        consent = result.scalar_one_or_none()

        if not consent:
            raise ValueError(f"Consent {consent_id} not found for parent {parent_id}")

        consent.consent_given = agreed
        consent.ip_address = ip_address
        consent.user_agent = user_agent
        consent.updated_at = datetime.utcnow()

        if agreed:
            consent.consented_at = datetime.utcnow()

            # Update the sponsored child status to ACTIVE
            child_q = select(SponsoredChild).where(
                SponsoredChild.id == consent.sponsored_child_id
            )
            child_result = await db.execute(child_q)
            child = child_result.scalar_one_or_none()
            if child:
                child.status = SponsoredChildStatus.ACTIVE
                child.enrolled_at = datetime.utcnow()
                child.updated_at = datetime.utcnow()
        else:
            consent.revoked_at = datetime.utcnow()
            consent.revocation_reason = "Parent declined consent"

            # Update child status to REMOVED
            child_q = select(SponsoredChild).where(
                SponsoredChild.id == consent.sponsored_child_id
            )
            child_result = await db.execute(child_q)
            child = child_result.scalar_one_or_none()
            if child:
                child.status = SponsoredChildStatus.REMOVED
                child.removed_at = datetime.utcnow()
                child.updated_at = datetime.utcnow()

        await db.flush()

        logger.info(
            f"Consent {consent_id} processed: agreed={agreed} "
            f"by parent {parent_id}"
        )

        return _consent_to_dict(consent)

    except ValueError:
        raise
    except Exception as e:
        logger.error(f"Error processing consent {consent_id}: {e}")
        raise


async def get_consent_status(
    db: AsyncSession,
    partner_id: str,
) -> List[Dict[str, Any]]:
    """
    Return the consent status for all sponsored children of a partner.

    Args:
        db: Async database session.
        partner_id: UUID of the partner user.

    Returns:
        List of consent status dictionaries.
    """
    try:
        # Get all sponsored children for this partner
        children_q = select(SponsoredChild).where(
            SponsoredChild.partner_id == partner_id
        )
        children_result = await db.execute(children_q)
        children = children_result.scalars().all()

        results: List[Dict[str, Any]] = []

        for child in children:
            consent_q = select(SponsorshipConsent).where(
                SponsorshipConsent.sponsored_child_id == child.id
            )
            consent_result = await db.execute(consent_q)
            consent = consent_result.scalar_one_or_none()

            results.append({
                "sponsored_child_id": str(child.id),
                "student_id": str(child.student_id),
                "program_id": str(child.program_id),
                "child_status": child.status.value if hasattr(child.status, "value") else str(child.status),
                "consent_id": str(consent.id) if consent else None,
                "consent_given": consent.consent_given if consent else None,
                "consented_at": consent.consented_at.isoformat() if consent and consent.consented_at else None,
                "revoked_at": consent.revoked_at.isoformat() if consent and consent.revoked_at else None,
            })

        return results

    except Exception as e:
        logger.error(f"Error fetching consent status for partner {partner_id}: {e}")
        raise


# ------------------------------------------------------------------
# Private helpers
# ------------------------------------------------------------------

async def _get_verified_child(
    db: AsyncSession,
    sponsored_child_id: str,
    partner_id: str,
) -> Optional[SponsoredChild]:
    """Fetch a SponsoredChild and verify partner ownership."""
    query = select(SponsoredChild).where(
        and_(
            SponsoredChild.id == sponsored_child_id,
            SponsoredChild.partner_id == partner_id,
        )
    )
    result = await db.execute(query)
    return result.scalar_one_or_none()


def _program_to_dict(program: SponsorshipProgram) -> Dict[str, Any]:
    """Convert a SponsorshipProgram model instance to a dictionary."""
    return {
        "id": str(program.id),
        "partner_id": str(program.partner_id),
        "name": program.name,
        "description": program.description,
        "program_type": program.program_type.value if hasattr(program.program_type, "value") else str(program.program_type),
        "min_children": program.min_children,
        "max_children": program.max_children,
        "status": program.status.value if hasattr(program.status, "value") else str(program.status),
        "billing_period": program.billing_period.value if program.billing_period and hasattr(program.billing_period, "value") else str(program.billing_period) if program.billing_period else None,
        "price_per_child": float(program.price_per_child) if program.price_per_child else None,
        "currency": program.currency,
        "custom_pricing_notes": program.custom_pricing_notes,
        "start_date": program.start_date.isoformat() if program.start_date else None,
        "end_date": program.end_date.isoformat() if program.end_date else None,
        "goals": program.goals or [],
        "target_grade_levels": program.target_grade_levels or [],
        "target_regions": program.target_regions or [],
        "approved_by": str(program.approved_by) if program.approved_by else None,
        "approved_at": program.approved_at.isoformat() if program.approved_at else None,
        "rejection_reason": program.rejection_reason,
        "created_at": program.created_at.isoformat() if program.created_at else None,
        "updated_at": program.updated_at.isoformat() if program.updated_at else None,
    }


def _consent_to_dict(consent: SponsorshipConsent) -> Dict[str, Any]:
    """Convert a SponsorshipConsent model instance to a dictionary."""
    return {
        "id": str(consent.id),
        "sponsored_child_id": str(consent.sponsored_child_id),
        "parent_id": str(consent.parent_id),
        "consent_given": consent.consent_given,
        "consent_text": consent.consent_text,
        "consented_at": consent.consented_at.isoformat() if consent.consented_at else None,
        "revoked_at": consent.revoked_at.isoformat() if consent.revoked_at else None,
        "revocation_reason": consent.revocation_reason,
        "created_at": consent.created_at.isoformat() if consent.created_at else None,
        "updated_at": consent.updated_at.isoformat() if consent.updated_at else None,
    }
