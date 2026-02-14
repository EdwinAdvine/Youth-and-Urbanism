"""
Instructor Sessions API Routes

CRUD endpoints for live sessions, attendance, recordings, AI summaries,
and follow-up tasks.
"""

import uuid
import logging
from typing import Optional
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func, and_, desc, asc
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.models.staff.live_session import LiveSession, LiveSessionRecording
from app.models.instructor.instructor_session import (
    InstructorSessionAttendance,
    InstructorSessionFollowUp,
    FollowUpStatus,
)
from app.utils.security import get_current_user, require_role
from app.schemas.instructor.session_schemas import (
    SessionCreate,
    SessionUpdate,
    FollowUpCreate,
    FollowUpUpdate,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/sessions", tags=["Instructor Sessions"])


# ── Helper ───────────────────────────────────────────────────────────

def _session_to_dict(session: LiveSession) -> dict:
    extra = session.extra_data or {}
    return {
        "id": str(session.id),
        "title": session.title,
        "description": session.description,
        "host_id": str(session.host_id),
        "session_type": session.session_type,
        "room_name": session.room_name,
        "status": session.status,
        "max_participants": session.max_participants,
        "recording_enabled": session.recording_enabled,
        "screen_share_enabled": session.screen_share_enabled,
        "course_id": str(session.course_id) if session.course_id else None,
        "grade_level": session.grade_level,
        "scheduled_at": session.scheduled_at.isoformat() if session.scheduled_at else None,
        "scheduled_start": session.scheduled_at.isoformat() if session.scheduled_at else None,
        "started_at": session.started_at.isoformat() if session.started_at else None,
        "ended_at": session.ended_at.isoformat() if session.ended_at else None,
        "duration_minutes": extra.get("duration_minutes", 60),
        "participants_count": extra.get("participants_count", 0),
        "meeting_url": extra.get("meeting_url"),
        "recording_url": extra.get("recording_url"),
        "extra_data": extra,
        "created_at": session.created_at.isoformat() if session.created_at else None,
    }


async def _get_instructor_session(
    db: AsyncSession, session_id: str, instructor_id: str
) -> LiveSession:
    query = select(LiveSession).where(
        and_(LiveSession.id == session_id, LiveSession.host_id == instructor_id)
    )
    result = await db.execute(query)
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


# ── LIST ─────────────────────────────────────────────────────────────

@router.get("", response_model=dict)
async def list_sessions(
    status_filter: Optional[str] = Query(None, alias="status"),
    course_id: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    sort_by: str = Query("scheduled_at"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """List all live sessions for the authenticated instructor."""
    instructor_id = str(current_user.id)

    filters = [LiveSession.host_id == instructor_id]
    if status_filter:
        filters.append(LiveSession.status == status_filter)
    if course_id:
        filters.append(LiveSession.course_id == course_id)

    count_q = select(func.count()).select_from(LiveSession).where(and_(*filters))
    total = (await db.execute(count_q)).scalar() or 0

    sort_col = getattr(LiveSession, sort_by, LiveSession.scheduled_at)
    order_fn = desc if sort_order == "desc" else asc

    query = (
        select(LiveSession)
        .where(and_(*filters))
        .order_by(order_fn(sort_col))
        .offset((page - 1) * limit)
        .limit(limit)
    )
    rows = (await db.execute(query)).scalars().all()

    return {
        "sessions": [_session_to_dict(s) for s in rows],
        "total": total,
        "page": page,
        "limit": limit,
    }


# ── CREATE ───────────────────────────────────────────────────────────

@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_session(
    body: SessionCreate,
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """Schedule a new live session."""
    instructor_id = str(current_user.id)

    room_name = f"instructor-{instructor_id[:8]}-{uuid.uuid4().hex[:8]}"

    session = LiveSession(
        host_id=instructor_id,
        title=body.title,
        description=body.description,
        session_type="instructor_live",
        room_name=room_name,
        scheduled_at=body.scheduled_at,
        max_participants=body.max_participants,
        recording_enabled=body.recording_enabled,
        screen_share_enabled=body.screen_sharing_enabled,
        course_id=body.course_id,
        grade_level=body.grade_level,
        status="scheduled",
        extra_data={
            "duration_minutes": body.duration_minutes,
            "participants_count": 0,
        },
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)

    logger.info(f"Created session: {session.id}")
    return _session_to_dict(session)


# ── GET DETAIL ───────────────────────────────────────────────────────

@router.get("/{session_id}", response_model=dict)
async def get_session_detail(
    session_id: str,
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """Get detailed session information including attendees and follow-ups."""
    session = await _get_instructor_session(db, session_id, str(current_user.id))

    # Get attendance
    att_q = select(InstructorSessionAttendance).where(
        InstructorSessionAttendance.session_id == session_id
    )
    attendees = (await db.execute(att_q)).scalars().all()

    # Get follow-ups
    fu_q = select(InstructorSessionFollowUp).where(
        InstructorSessionFollowUp.session_id == session_id
    ).order_by(InstructorSessionFollowUp.created_at.desc())
    follow_ups = (await db.execute(fu_q)).scalars().all()

    # Get recordings
    rec_q = select(LiveSessionRecording).where(
        LiveSessionRecording.session_id == session_id
    )
    recordings = (await db.execute(rec_q)).scalars().all()

    result = _session_to_dict(session)
    result["attendees"] = [
        {
            "student_id": str(a.student_id),
            "joined_at": a.joined_at.isoformat() if a.joined_at else None,
            "left_at": a.left_at.isoformat() if a.left_at else None,
            "duration_seconds": a.duration_seconds,
            "engagement_score": float(a.engagement_score) if a.engagement_score else None,
        }
        for a in attendees
    ]
    result["follow_ups"] = [
        {
            "id": str(f.id),
            "title": f.title,
            "description": f.description,
            "due_date": f.due_date.isoformat() if f.due_date else None,
            "status": f.status.value if f.status else "pending",
            "assigned_to_student_id": str(f.assigned_to_student_id) if f.assigned_to_student_id else None,
            "created_at": f.created_at.isoformat() if f.created_at else None,
        }
        for f in follow_ups
    ]
    result["recordings"] = [
        {
            "id": str(r.id),
            "recording_url": r.recording_url,
            "duration_seconds": r.duration_seconds,
            "file_size_bytes": r.file_size_bytes,
            "format": r.format,
        }
        for r in recordings
    ]

    return result


# ── UPDATE ───────────────────────────────────────────────────────────

@router.put("/{session_id}", response_model=dict)
async def update_session(
    session_id: str,
    body: SessionUpdate,
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """Update session details (before it starts)."""
    session = await _get_instructor_session(db, session_id, str(current_user.id))

    if session.status != "scheduled":
        raise HTTPException(status_code=400, detail="Can only update scheduled sessions")

    update_data = body.model_dump(exclude_unset=True)
    for key in ("title", "description", "scheduled_at", "max_participants",
                "recording_enabled"):
        if key in update_data:
            setattr(session, key, update_data[key])

    if "screen_sharing_enabled" in update_data:
        session.screen_share_enabled = update_data["screen_sharing_enabled"]

    if "duration_minutes" in update_data:
        extra = session.extra_data or {}
        extra["duration_minutes"] = update_data["duration_minutes"]
        session.extra_data = extra

    await db.commit()
    await db.refresh(session)
    return _session_to_dict(session)


# ── DELETE ───────────────────────────────────────────────────────────

@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_session(
    session_id: str,
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """Cancel and delete a scheduled session."""
    session = await _get_instructor_session(db, session_id, str(current_user.id))
    if session.status == "started":
        raise HTTPException(status_code=400, detail="Cannot delete an active session")
    await db.delete(session)
    await db.commit()


# ── START / END ──────────────────────────────────────────────────────

@router.post("/{session_id}/start", response_model=dict)
async def start_session(
    session_id: str,
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """Start a scheduled live session."""
    session = await _get_instructor_session(db, session_id, str(current_user.id))

    if session.status != "scheduled":
        raise HTTPException(status_code=400, detail=f"Session is {session.status}, not scheduled")

    session.status = "started"
    session.started_at = datetime.utcnow()
    await db.commit()
    await db.refresh(session)

    logger.info(f"Started session {session_id}")
    return _session_to_dict(session)


@router.post("/{session_id}/end", response_model=dict)
async def end_session(
    session_id: str,
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """End an active live session."""
    session = await _get_instructor_session(db, session_id, str(current_user.id))

    if session.status != "started":
        raise HTTPException(status_code=400, detail="Session is not active")

    session.status = "completed"
    session.ended_at = datetime.utcnow()
    await db.commit()
    await db.refresh(session)

    logger.info(f"Ended session {session_id}")
    return _session_to_dict(session)


# ── ATTENDANCE ───────────────────────────────────────────────────────

@router.get("/{session_id}/attendance", response_model=dict)
async def get_attendance(
    session_id: str,
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """Get attendance records for a session."""
    await _get_instructor_session(db, session_id, str(current_user.id))

    att_q = select(InstructorSessionAttendance).where(
        InstructorSessionAttendance.session_id == session_id
    )
    attendees = (await db.execute(att_q)).scalars().all()

    return {
        "session_id": session_id,
        "total_attendees": len(attendees),
        "attendees": [
            {
                "id": str(a.id),
                "student_id": str(a.student_id),
                "joined_at": a.joined_at.isoformat() if a.joined_at else None,
                "left_at": a.left_at.isoformat() if a.left_at else None,
                "duration_seconds": a.duration_seconds,
                "engagement_score": float(a.engagement_score) if a.engagement_score else None,
                "attention_data": a.attention_data,
            }
            for a in attendees
        ],
    }


# ── RECORDINGS ───────────────────────────────────────────────────────

@router.get("/{session_id}/recordings", response_model=dict)
async def get_recordings(
    session_id: str,
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """Get recordings for a session."""
    await _get_instructor_session(db, session_id, str(current_user.id))

    rec_q = select(LiveSessionRecording).where(
        LiveSessionRecording.session_id == session_id
    )
    recordings = (await db.execute(rec_q)).scalars().all()

    return {
        "session_id": session_id,
        "recordings": [
            {
                "id": str(r.id),
                "recording_url": r.recording_url,
                "duration_seconds": r.duration_seconds,
                "file_size_bytes": r.file_size_bytes,
                "format": r.format,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in recordings
        ],
    }


# ── AI SESSION SUMMARY ──────────────────────────────────────────────

@router.post("/{session_id}/ai-summary", response_model=dict)
async def generate_ai_summary(
    session_id: str,
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """Generate an AI-powered session summary."""
    session = await _get_instructor_session(db, session_id, str(current_user.id))

    from app.services.instructor.session_service import generate_session_summary

    summary = await generate_session_summary(db, session_id)
    return summary


# ── FOLLOW-UPS ───────────────────────────────────────────────────────

@router.get("/{session_id}/follow-ups", response_model=dict)
async def list_follow_ups(
    session_id: str,
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """List follow-up tasks for a session."""
    await _get_instructor_session(db, session_id, str(current_user.id))

    fu_q = select(InstructorSessionFollowUp).where(
        InstructorSessionFollowUp.session_id == session_id
    ).order_by(InstructorSessionFollowUp.created_at.desc())
    follow_ups = (await db.execute(fu_q)).scalars().all()

    return {
        "session_id": session_id,
        "follow_ups": [
            {
                "id": str(f.id),
                "title": f.title,
                "description": f.description,
                "due_date": f.due_date.isoformat() if f.due_date else None,
                "status": f.status.value if f.status else "pending",
                "assigned_to_student_id": str(f.assigned_to_student_id) if f.assigned_to_student_id else None,
                "created_at": f.created_at.isoformat() if f.created_at else None,
                "completed_at": f.completed_at.isoformat() if f.completed_at else None,
            }
            for f in follow_ups
        ],
    }


@router.post("/{session_id}/follow-ups", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_follow_up(
    session_id: str,
    body: FollowUpCreate,
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """Create a follow-up task for a session."""
    await _get_instructor_session(db, session_id, str(current_user.id))

    follow_up = InstructorSessionFollowUp(
        session_id=session_id,
        instructor_id=str(current_user.id),
        title=body.title,
        description=body.description,
        due_date=body.due_date,
        assigned_to_student_id=body.assigned_to_student_id,
        status=FollowUpStatus.PENDING,
    )
    db.add(follow_up)
    await db.commit()
    await db.refresh(follow_up)

    return {
        "id": str(follow_up.id),
        "session_id": session_id,
        "title": follow_up.title,
        "description": follow_up.description,
        "due_date": follow_up.due_date.isoformat() if follow_up.due_date else None,
        "status": follow_up.status.value,
        "created_at": follow_up.created_at.isoformat(),
    }


@router.put("/follow-ups/{follow_up_id}", response_model=dict)
async def update_follow_up(
    follow_up_id: str,
    body: FollowUpUpdate,
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """Update a follow-up task."""
    fu_q = select(InstructorSessionFollowUp).where(
        and_(
            InstructorSessionFollowUp.id == follow_up_id,
            InstructorSessionFollowUp.instructor_id == str(current_user.id),
        )
    )
    fu = (await db.execute(fu_q)).scalar_one_or_none()
    if not fu:
        raise HTTPException(status_code=404, detail="Follow-up not found")

    update_data = body.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if key == "status" and value == "completed":
            fu.status = FollowUpStatus.COMPLETED
            fu.completed_at = datetime.utcnow()
        elif key == "status" and value == "pending":
            fu.status = FollowUpStatus.PENDING
            fu.completed_at = None
        else:
            setattr(fu, key, value)

    await db.commit()
    await db.refresh(fu)

    return {
        "id": str(fu.id),
        "title": fu.title,
        "status": fu.status.value,
        "completed_at": fu.completed_at.isoformat() if fu.completed_at else None,
    }
