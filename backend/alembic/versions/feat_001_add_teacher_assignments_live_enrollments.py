"""feat: add teacher assignments, live session enrollments, teacher questions

Revision ID: feat_001
Revises: 9c79a8d107ea
Create Date: 2026-02-26 00:00:00.000000

Creates:
- grade_class_teachers   — maps a staff user to a grade level as class teacher
- subject_department_heads — maps a staff user to a learning area as subject head
- teacher_questions      — student Q&A threads directed to teachers
- live_session_enrollments — tracks which students are enrolled in live sessions

Alters:
- live_session_recordings — adds ai_summary JSONB column
"""
from typing import Sequence, Union

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB
from alembic import op

# revision identifiers
revision: str = 'feat_001'
down_revision: Union[str, None] = '9c79a8d107ea'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── grade_class_teachers ─────────────────────────────────────────
    op.create_table(
        'grade_class_teachers',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('grade_level', sa.String(20), nullable=False),
        sa.Column('staff_user_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('academic_year', sa.String(10), nullable=False, server_default='2026'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
    )
    op.create_index('ix_grade_class_teachers_grade_level', 'grade_class_teachers', ['grade_level'])
    op.create_index('ix_grade_class_teachers_staff_user_id', 'grade_class_teachers', ['staff_user_id'])

    # ── subject_department_heads ──────────────────────────────────────
    op.create_table(
        'subject_department_heads',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('learning_area', sa.String(100), nullable=False),
        sa.Column('staff_user_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('academic_year', sa.String(10), nullable=False, server_default='2026'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
    )
    op.create_index('ix_subject_department_heads_learning_area', 'subject_department_heads', ['learning_area'])
    op.create_index('ix_subject_department_heads_staff_user_id', 'subject_department_heads', ['staff_user_id'])

    # ── teacher_questions ─────────────────────────────────────────────
    op.create_table(
        'teacher_questions',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('student_id', UUID(as_uuid=True), sa.ForeignKey('students.id', ondelete='CASCADE'), nullable=False),
        sa.Column('staff_user_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('subject', sa.String(100), nullable=True),
        sa.Column('question', sa.Text(), nullable=False),
        sa.Column('ai_summary', sa.Text(), nullable=True),
        sa.Column('answer', sa.Text(), nullable=True),
        sa.Column('status', sa.String(20), nullable=False, server_default='pending'),
        sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('answered_at', sa.DateTime(), nullable=True),
    )
    op.create_index('ix_teacher_questions_student_id', 'teacher_questions', ['student_id'])
    op.create_index('ix_teacher_questions_staff_user_id', 'teacher_questions', ['staff_user_id'])
    op.create_index('ix_teacher_questions_status', 'teacher_questions', ['status'])

    # ── live_session_enrollments ──────────────────────────────────────
    op.create_table(
        'live_session_enrollments',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('session_id', UUID(as_uuid=True), sa.ForeignKey('live_sessions.id', ondelete='CASCADE'), nullable=False),
        sa.Column('student_id', UUID(as_uuid=True), sa.ForeignKey('students.id', ondelete='CASCADE'), nullable=False),
        sa.Column('joined_at', sa.DateTime(), nullable=True),
        sa.Column('is_present', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
    )
    op.create_index('ix_live_session_enrollments_session_id', 'live_session_enrollments', ['session_id'])
    op.create_index('ix_live_session_enrollments_student_id', 'live_session_enrollments', ['student_id'])

    # ── alter live_session_recordings — add ai_summary ────────────────
    op.add_column(
        'live_session_recordings',
        sa.Column('ai_summary', JSONB(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column('live_session_recordings', 'ai_summary')

    op.drop_index('ix_live_session_enrollments_student_id', table_name='live_session_enrollments')
    op.drop_index('ix_live_session_enrollments_session_id', table_name='live_session_enrollments')
    op.drop_table('live_session_enrollments')

    op.drop_index('ix_teacher_questions_status', table_name='teacher_questions')
    op.drop_index('ix_teacher_questions_staff_user_id', table_name='teacher_questions')
    op.drop_index('ix_teacher_questions_student_id', table_name='teacher_questions')
    op.drop_table('teacher_questions')

    op.drop_index('ix_subject_department_heads_staff_user_id', table_name='subject_department_heads')
    op.drop_index('ix_subject_department_heads_learning_area', table_name='subject_department_heads')
    op.drop_table('subject_department_heads')

    op.drop_index('ix_grade_class_teachers_staff_user_id', table_name='grade_class_teachers')
    op.drop_index('ix_grade_class_teachers_grade_level', table_name='grade_class_teachers')
    op.drop_table('grade_class_teachers')
