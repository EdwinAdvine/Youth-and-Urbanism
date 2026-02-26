"""add_mastery_session_discussion_tables

Revision ID: birdy_001
Revises: 023ea9a2808d
Create Date: 2026-02-22 18:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'birdy_001'
down_revision: Union[str, None] = '023ea9a2808d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Student Mastery Records - topic-level mastery with spaced repetition
    op.create_table(
        'student_mastery_records',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('student_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('students.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('topic_name', sa.String(200), nullable=False),
        sa.Column('subject', sa.String(100), nullable=False, index=True),
        sa.Column('grade_level', sa.String(20), nullable=False),
        sa.Column('mastery_level', sa.Float, nullable=False, server_default='0.0'),
        sa.Column('attempt_count', sa.Integer, nullable=False, server_default='0'),
        sa.Column('consecutive_correct', sa.Integer, nullable=False, server_default='0'),
        sa.Column('is_mastered', sa.Boolean, nullable=False, server_default='false', index=True),
        sa.Column('next_review_date', sa.DateTime, nullable=True, index=True),
        sa.Column('review_interval_days', sa.Integer, nullable=False, server_default='1'),
        sa.Column('easiness_factor', sa.Float, nullable=False, server_default='2.5'),
        sa.Column('attempt_history', postgresql.JSONB, nullable=False, server_default='[]'),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime, nullable=False, server_default=sa.func.now()),
        sa.Column('is_deleted', sa.Boolean, nullable=False, server_default='false'),
    )

    # Student Session Logs - daily AI usage tracking
    op.create_table(
        'student_session_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('student_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('students.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('date', sa.Date, nullable=False, index=True),
        sa.Column('total_minutes', sa.Integer, nullable=False, server_default='0'),
        sa.Column('core_tutoring_minutes', sa.Integer, nullable=False, server_default='0'),
        sa.Column('message_count', sa.Integer, nullable=False, server_default='0'),
        sa.Column('pomodoro_completed', sa.Integer, nullable=False, server_default='0'),
        sa.Column('break_count', sa.Integer, nullable=False, server_default='0'),
        sa.Column('session_metadata', postgresql.JSONB, nullable=False, server_default='{}'),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime, nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint('student_id', 'date', name='uq_student_session_log_date'),
    )

    # Parent Discussion Cards - AI-generated weekly content for parents
    op.create_table(
        'parent_discussion_cards',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('parent_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('child_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('students.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('week_start', sa.Date, nullable=False),
        sa.Column('week_end', sa.Date, nullable=False),
        sa.Column('summary_text', sa.Text, nullable=False),
        sa.Column('discussion_starters', postgresql.JSONB, nullable=False, server_default='[]'),
        sa.Column('offline_activities', postgresql.JSONB, nullable=False, server_default='[]'),
        sa.Column('confidence_trend', sa.String(20), nullable=True),
        sa.Column('metrics', postgresql.JSONB, nullable=False, server_default='{}'),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.func.now()),
        sa.Column('is_deleted', sa.Boolean, nullable=False, server_default='false'),
    )


def downgrade() -> None:
    op.drop_table('parent_discussion_cards')
    op.drop_table('student_session_logs')
    op.drop_table('student_mastery_records')
