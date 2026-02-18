"""
System Health Snapshot Model

Stores point-in-time health checks for all platform services (database,
Redis, AI providers, payment gateways). Used by the Platform Pulse
dashboard to render real-time service status and historical trends.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, UUID, Index
from sqlalchemy.dialects.postgresql import JSONB
from app.database import Base


class SystemHealthSnapshot(Base):
    """
    Point-in-time health snapshot for a platform service.

    Each row represents a single health check result for one service.
    The pulse dashboard queries recent snapshots to build the real-time
    health grid and historical charts.
    """

    __tablename__ = "system_health_snapshots"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Service identification
    service_name = Column(String(100), nullable=False, index=True)

    # Health status: healthy | degraded | down
    status = Column(String(20), nullable=False, default="healthy")

    # Performance metrics
    response_time_ms = Column(Float, nullable=True)
    error_rate = Column(Float, nullable=True, default=0.0)

    # Flexible metadata (provider-specific details, error messages, etc.)
    details = Column(JSONB, default={})

    # When this check was performed
    checked_at = Column(
        DateTime, default=datetime.utcnow, nullable=False, index=True
    )

    # Composite indexes for common query patterns
    __table_args__ = (
        Index(
            "ix_health_service_checked",
            "service_name",
            "checked_at",
        ),
        Index(
            "ix_health_status_checked",
            "status",
            "checked_at",
        ),
    )

    def __repr__(self) -> str:
        return (
            f"<SystemHealthSnapshot("
            f"service='{self.service_name}', "
            f"status='{self.status}', "
            f"response_time={self.response_time_ms}ms)>"
        )
