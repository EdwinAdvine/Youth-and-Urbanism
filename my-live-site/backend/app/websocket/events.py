"""
WebSocket Event Types

Defines all real-time event types used across the admin dashboard.
"""

from enum import Enum


class WSEventType(str, Enum):
    # System
    SYSTEM_HEALTH_UPDATE = "system.health.update"
    SYSTEM_ALERT = "system.alert"

    # Users
    USER_ONLINE = "user.online"
    USER_OFFLINE = "user.offline"
    USER_REGISTERED = "user.registered"

    # Content
    COURSE_SUBMITTED = "course.submitted"
    CONTENT_FLAGGED = "content.flagged"

    # AI
    AI_ANOMALY = "ai.anomaly"
    AI_SAFETY_VIOLATION = "ai.safety_violation"

    # Finance
    PAYMENT_RECEIVED = "payment.received"
    REFUND_REQUESTED = "refund.requested"

    # Tickets
    TICKET_CREATED = "ticket.created"
    TICKET_ESCALATED = "ticket.escalated"

    # Child Safety
    SAFETY_INCIDENT = "safety.incident"

    # Moderation
    CONTENT_REPORTED = "moderation.reported"

    # Notifications
    NOTIFICATION = "notification"
