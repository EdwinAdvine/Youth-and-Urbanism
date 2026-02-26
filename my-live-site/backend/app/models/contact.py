"""
ContactMessage Model for Urban Home School

Stores contact form submissions from website visitors and users.
Supports admin management with read status tracking and reply capability.
"""

import uuid
from datetime import datetime

from sqlalchemy import Column, String, Text, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class ContactMessage(Base):
    """
    Contact form submission record.

    Stores messages submitted through the public contact form.
    Admins can view, mark as read, and reply to messages.

    Attributes:
        id: Unique identifier (UUID)
        name: Sender's full name
        email: Sender's email address
        subject: Message subject line
        message: Full message body
        is_read: Whether an admin has read the message
        read_at: When the message was first read
        replied_at: When a reply was sent
        reply_message: Admin's reply text
        created_at: When the message was submitted
    """

    __tablename__ = "contact_messages"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Sender information
    name = Column(String(200), nullable=False)
    email = Column(String(200), nullable=False)

    # Message content
    subject = Column(String(500), nullable=False)
    message = Column(Text, nullable=False)

    # Admin management
    is_read = Column(Boolean, default=False, nullable=False, index=True)
    read_at = Column(DateTime, nullable=True)
    replied_at = Column(DateTime, nullable=True)
    reply_message = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    def __repr__(self) -> str:
        return (
            f"<ContactMessage(id={self.id}, name='{self.name}', "
            f"subject='{self.subject}', is_read={self.is_read})>"
        )
