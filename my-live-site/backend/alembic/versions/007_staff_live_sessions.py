"""Add live session tables: live_sessions, live_session_recordings, breakout_rooms

Revision ID: 007_staff_live_sessions
Revises: 006_staff_knowledge_base
Create Date: 2026-02-13

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import uuid

# revision identifiers, used by Alembic.
revision = '007_staff_live_sessions'
down_revision = '006_staff_knowledge_base'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create live session tables."""

    # 1. Create live_sessions table
    op.create_table(
        'live_sessions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('host_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('session_type', sa.String(50), nullable=False),
        sa.Column('room_name', sa.String(100), unique=True, nullable=False),
        sa.Column('status', sa.String(30), server_default='scheduled'),
        sa.Column('max_participants', sa.Integer, server_default='30'),
        sa.Column('scheduled_at', sa.DateTime, nullable=False),
        sa.Column('started_at', sa.DateTime, nullable=True),
        sa.Column('ended_at', sa.DateTime, nullable=True),
        sa.Column('recording_enabled', sa.Boolean, nullable=False, server_default=sa.text('false')),
        sa.Column('screen_share_enabled', sa.Boolean, nullable=False, server_default=sa.text('true')),
        sa.Column('course_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('grade_level', sa.String(20), nullable=True),
        sa.Column('metadata', postgresql.JSONB, server_default='{}'),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.text("now()")),
    )

    # 2. Create live_session_recordings table
    op.create_table(
        'live_session_recordings',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column('session_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('live_sessions.id', ondelete='CASCADE'), nullable=False),
        sa.Column('recording_url', sa.String(500), nullable=False),
        sa.Column('duration_seconds', sa.Integer, nullable=True),
        sa.Column('file_size_bytes', sa.BigInteger, nullable=True),
        sa.Column('format', sa.String(20), server_default='mp4'),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.text("now()")),
    )

    # 3. Create breakout_rooms table
    op.create_table(
        'breakout_rooms',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column('session_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('live_sessions.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('participants', postgresql.JSONB, server_default='[]'),
        sa.Column('is_active', sa.Boolean, nullable=False, server_default=sa.text('true')),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.text("now()")),
    )


def downgrade() -> None:
    """Remove live session tables."""
    op.drop_table('breakout_rooms')
    op.drop_table('live_session_recordings')
    op.drop_table('live_sessions')
