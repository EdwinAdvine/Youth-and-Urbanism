"""
AccountDelinkingRequest Model for Urban Home School

Tracks requests from students (who have turned 19) to delink their account
from their parent's oversight. Requires parent approval.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class AccountDelinkingRequest(Base):
    """
    Account delinking request for the age transition workflow.

    When a child turns 19, they can request to delink their account
    from their parent. The parent must approve or deny the request.

    Attributes:
        id: Unique identifier (UUID)
        student_user_id: The student requesting delinking
        parent_user_id: The parent who must approve/deny
        status: Request status (pending/approved/denied)
        requested_at: When the request was submitted
        responded_at: When the parent responded
        response_note: Parent's note on their decision
    """

    __tablename__ = "account_delinking_requests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    student_user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    parent_user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    status = Column(String(20), default="pending", nullable=False, index=True)
    requested_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    responded_at = Column(DateTime(timezone=True), nullable=True)
    response_note = Column(Text, nullable=True)

    def __repr__(self) -> str:
        return (
            f"<AccountDelinkingRequest(id={self.id}, student={self.student_user_id}, "
            f"parent={self.parent_user_id}, status='{self.status}')>"
        )
