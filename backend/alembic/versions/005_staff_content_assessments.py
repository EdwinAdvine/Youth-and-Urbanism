"""Add staff content and assessment tables: staff_content_items, staff_content_versions, staff_collab_sessions, adaptive_assessments, assessment_questions, cbc_competencies

Revision ID: 005_staff_content_assessments
Revises: 004_staff_tickets_sla
Create Date: 2026-02-13

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import uuid

# revision identifiers, used by Alembic.
revision = '005_staff_content_assessments'
down_revision = '004_staff_tickets_sla'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create staff content and assessment tables."""

    # 1. Create staff_content_items table
    op.create_table(
        'staff_content_items',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('content_type', sa.String(50), nullable=False),
        sa.Column('body', sa.Text, nullable=True),
        sa.Column('body_json', postgresql.JSONB, nullable=True),
        sa.Column('status', sa.String(30), server_default='draft'),
        sa.Column('author_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('reviewer_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('course_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('grade_levels', postgresql.JSONB, server_default='[]'),
        sa.Column('learning_area', sa.String(100), nullable=True),
        sa.Column('cbc_tags', postgresql.JSONB, server_default='[]'),
        sa.Column('version', sa.Integer, server_default='1'),
        sa.Column('metadata', postgresql.JSONB, server_default='{}'),
        sa.Column('published_at', sa.DateTime, nullable=True),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.text("now()")),
        sa.Column('updated_at', sa.DateTime, nullable=True, server_default=sa.text("now()")),
    )

    # 2. Create staff_content_versions table
    op.create_table(
        'staff_content_versions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column('content_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('staff_content_items.id', ondelete='CASCADE'), nullable=False),
        sa.Column('version_number', sa.Integer, nullable=False),
        sa.Column('body_snapshot', postgresql.JSONB, nullable=False),
        sa.Column('changes_summary', sa.Text, nullable=True),
        sa.Column('created_by', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.text("now()")),
    )

    # 3. Create staff_collab_sessions table
    op.create_table(
        'staff_collab_sessions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column('content_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('staff_content_items.id', ondelete='CASCADE'), nullable=False),
        sa.Column('yjs_doc_id', sa.String(100), unique=True, nullable=False),
        sa.Column('participants', postgresql.JSONB, server_default='[]'),
        sa.Column('is_active', sa.Boolean, nullable=False, server_default=sa.text('true')),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.text("now()")),
        sa.Column('ended_at', sa.DateTime, nullable=True),
    )

    # 4. Create adaptive_assessments table
    op.create_table(
        'adaptive_assessments',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('assessment_type', sa.String(50), nullable=False),
        sa.Column('course_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('grade_level', sa.String(20), nullable=True),
        sa.Column('learning_area', sa.String(100), nullable=True),
        sa.Column('cbc_tags', postgresql.JSONB, server_default='[]'),
        sa.Column('difficulty_range', postgresql.JSONB, server_default='{"min":1,"max":5}'),
        sa.Column('adaptive_config', postgresql.JSONB, server_default='{}'),
        sa.Column('time_limit_minutes', sa.Integer, nullable=True),
        sa.Column('is_ai_graded', sa.Boolean, nullable=False, server_default=sa.text('false')),
        sa.Column('rubric', postgresql.JSONB, nullable=True),
        sa.Column('status', sa.String(30), server_default='draft'),
        sa.Column('author_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('total_questions', sa.Integer, server_default='0'),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.text("now()")),
        sa.Column('updated_at', sa.DateTime, nullable=True, server_default=sa.text("now()")),
    )

    # 5. Create assessment_questions table
    op.create_table(
        'assessment_questions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column('assessment_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('adaptive_assessments.id', ondelete='CASCADE'), nullable=False),
        sa.Column('question_text', sa.Text, nullable=False),
        sa.Column('question_type', sa.String(30), nullable=False),
        sa.Column('options', postgresql.JSONB, nullable=True),
        sa.Column('correct_answer', sa.Text, nullable=True),
        sa.Column('explanation', sa.Text, nullable=True),
        sa.Column('difficulty', sa.SmallInteger, nullable=False),
        sa.Column('points', sa.Integer, server_default='1'),
        sa.Column('cbc_competency', sa.String(255), nullable=True),
        sa.Column('media_url', sa.String(500), nullable=True),
        sa.Column('order_index', sa.Integer, nullable=False),
        sa.Column('adaptive_paths', postgresql.JSONB, server_default='[]'),
        sa.Column('ai_grading_prompt', sa.Text, nullable=True),
        sa.Column('metadata', postgresql.JSONB, server_default='{}'),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.text("now()")),
    )

    # 6. Create cbc_competencies table
    op.create_table(
        'cbc_competencies',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column('code', sa.String(50), unique=True, nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('learning_area', sa.String(100), nullable=False),
        sa.Column('strand', sa.String(100), nullable=False),
        sa.Column('sub_strand', sa.String(100), nullable=True),
        sa.Column('grade_level', sa.String(20), nullable=False),
        sa.Column('level', sa.String(50), nullable=True),
        sa.Column('keywords', postgresql.JSONB, server_default='[]'),
        sa.Column('is_active', sa.Boolean, nullable=False, server_default=sa.text('true')),
        sa.Column('sort_order', sa.Integer, server_default='0'),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.text("now()")),
    )


def downgrade() -> None:
    """Remove staff content and assessment tables."""
    op.drop_table('cbc_competencies')
    op.drop_table('assessment_questions')
    op.drop_table('adaptive_assessments')
    op.drop_table('staff_collab_sessions')
    op.drop_table('staff_content_versions')
    op.drop_table('staff_content_items')
