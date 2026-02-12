"""Initial schema - create all core tables

Revision ID: 000_initial_schema
Revises:
Create Date: 2026-02-12
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '000_initial_schema'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create all core tables for Urban Home School."""

    # ========== USERS ==========
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('email', sa.String(255), unique=True, nullable=False, index=True),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        sa.Column('role', sa.String(50), nullable=False, server_default='student'),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('true'), nullable=False),
        sa.Column('is_verified', sa.Boolean(), server_default=sa.text('false'), nullable=False),
        sa.Column('is_deleted', sa.Boolean(), server_default=sa.text('false'), nullable=False),
        sa.Column('profile_data', postgresql.JSONB(), server_default=sa.text("'{}'::jsonb")),
        sa.Column('last_login', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index('ix_users_role', 'users', ['role'])
    op.create_index('ix_users_created_at', 'users', ['created_at'])

    # ========== STUDENTS ==========
    op.create_table(
        'students',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, unique=True),
        sa.Column('parent_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('admission_number', sa.String(50), unique=True, nullable=True),
        sa.Column('grade_level', sa.String(20), nullable=True),
        sa.Column('learning_profile', postgresql.JSONB(), server_default=sa.text("'{}'::jsonb")),
        sa.Column('competency_tracking', postgresql.JSONB(), server_default=sa.text("'{}'::jsonb")),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('true'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index('ix_students_user_id', 'students', ['user_id'])
    op.create_index('ix_students_parent_id', 'students', ['parent_id'])
    op.create_index('ix_students_grade_level', 'students', ['grade_level'])

    # ========== AI PROVIDERS ==========
    op.create_table(
        'ai_providers',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('provider_type', sa.String(50), nullable=False),
        sa.Column('api_key_encrypted', sa.Text(), nullable=True),
        sa.Column('base_url', sa.String(500), nullable=True),
        sa.Column('model_name', sa.String(100), nullable=True),
        sa.Column('specialization', sa.String(100), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('true'), nullable=False),
        sa.Column('cost_per_1k_tokens', sa.Numeric(10, 4), nullable=True),
        sa.Column('max_tokens', sa.Integer(), nullable=True),
        sa.Column('configuration', postgresql.JSONB(), server_default=sa.text("'{}'::jsonb")),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )

    # ========== AI TUTORS ==========
    op.create_table(
        'ai_tutors',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('student_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('students.id', ondelete='CASCADE'), nullable=False, unique=True),
        sa.Column('name', sa.String(100), server_default='The Bird'),
        sa.Column('response_mode', sa.String(20), server_default='text'),
        sa.Column('conversation_history', postgresql.JSONB(), server_default=sa.text("'[]'::jsonb")),
        sa.Column('learning_path', postgresql.JSONB(), server_default=sa.text("'{}'::jsonb")),
        sa.Column('performance_metrics', postgresql.JSONB(), server_default=sa.text("'{}'::jsonb")),
        sa.Column('total_interactions', sa.Integer(), server_default=sa.text('0')),
        sa.Column('last_interaction', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index('ix_ai_tutors_student_id', 'ai_tutors', ['student_id'])

    # ========== COURSES ==========
    op.create_table(
        'courses',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('creator_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('learning_area', sa.String(100), nullable=True),
        sa.Column('grade_levels', postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column('syllabus', postgresql.JSONB(), server_default=sa.text("'{}'::jsonb")),
        sa.Column('price', sa.Numeric(10, 2), server_default=sa.text('0.00')),
        sa.Column('currency', sa.String(3), server_default='KES'),
        sa.Column('is_free', sa.Boolean(), server_default=sa.text('true')),
        sa.Column('is_published', sa.Boolean(), server_default=sa.text('false')),
        sa.Column('is_featured', sa.Boolean(), server_default=sa.text('false')),
        sa.Column('thumbnail_url', sa.String(500), nullable=True),
        sa.Column('rating', sa.Numeric(3, 2), server_default=sa.text('0.00')),
        sa.Column('total_ratings', sa.Integer(), server_default=sa.text('0')),
        sa.Column('total_enrollments', sa.Integer(), server_default=sa.text('0')),
        sa.Column('revenue_share_instructor', sa.Numeric(5, 2), server_default=sa.text('60.00')),
        sa.Column('revenue_share_platform', sa.Numeric(5, 2), server_default=sa.text('30.00')),
        sa.Column('revenue_share_partner', sa.Numeric(5, 2), server_default=sa.text('10.00')),
        sa.Column('is_deleted', sa.Boolean(), server_default=sa.text('false')),
        sa.Column('course_metadata', postgresql.JSONB(), server_default=sa.text("'{}'::jsonb")),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index('ix_courses_creator_id', 'courses', ['creator_id'])
    op.create_index('ix_courses_learning_area', 'courses', ['learning_area'])
    op.create_index('ix_courses_created_at', 'courses', ['created_at'])

    # ========== ENROLLMENTS ==========
    op.create_table(
        'enrollments',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('student_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('students.id', ondelete='CASCADE'), nullable=False),
        sa.Column('course_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('courses.id', ondelete='CASCADE'), nullable=False),
        sa.Column('status', sa.String(50), server_default='active'),
        sa.Column('progress_percentage', sa.Numeric(5, 2), server_default=sa.text('0.00')),
        sa.Column('lessons_completed', sa.Integer(), server_default=sa.text('0')),
        sa.Column('total_lessons', sa.Integer(), server_default=sa.text('0')),
        sa.Column('time_spent_minutes', sa.Integer(), server_default=sa.text('0')),
        sa.Column('current_grade', sa.Numeric(5, 2), nullable=True),
        sa.Column('quiz_scores', postgresql.JSONB(), server_default=sa.text("'[]'::jsonb")),
        sa.Column('certificate_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('rating', sa.Integer(), nullable=True),
        sa.Column('review', sa.Text(), nullable=True),
        sa.Column('enrollment_metadata', postgresql.JSONB(), server_default=sa.text("'{}'::jsonb")),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
        sa.UniqueConstraint('student_id', 'course_id', name='uq_student_course_enrollment'),
    )
    op.create_index('ix_enrollments_student_id', 'enrollments', ['student_id'])
    op.create_index('ix_enrollments_course_id', 'enrollments', ['course_id'])
    op.create_index('ix_enrollments_status', 'enrollments', ['status'])

    # ========== ASSESSMENTS ==========
    op.create_table(
        'assessments',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('course_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('courses.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('assessment_type', sa.String(50), nullable=False, server_default='quiz'),
        sa.Column('questions', postgresql.JSONB(), server_default=sa.text("'[]'::jsonb")),
        sa.Column('total_points', sa.Integer(), server_default=sa.text('100')),
        sa.Column('passing_score', sa.Integer(), server_default=sa.text('50')),
        sa.Column('time_limit_minutes', sa.Integer(), nullable=True),
        sa.Column('max_attempts', sa.Integer(), server_default=sa.text('3')),
        sa.Column('is_auto_graded', sa.Boolean(), server_default=sa.text('true')),
        sa.Column('is_published', sa.Boolean(), server_default=sa.text('false')),
        sa.Column('available_from', sa.DateTime(timezone=True), nullable=True),
        sa.Column('available_until', sa.DateTime(timezone=True), nullable=True),
        sa.Column('assessment_metadata', postgresql.JSONB(), server_default=sa.text("'{}'::jsonb")),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index('ix_assessments_course_id', 'assessments', ['course_id'])
    op.create_index('ix_assessments_type', 'assessments', ['assessment_type'])

    # ========== ASSESSMENT SUBMISSIONS ==========
    op.create_table(
        'assessment_submissions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('assessment_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('assessments.id', ondelete='CASCADE'), nullable=False),
        sa.Column('student_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('students.id', ondelete='CASCADE'), nullable=False),
        sa.Column('answers', postgresql.JSONB(), server_default=sa.text("'{}'::jsonb")),
        sa.Column('score', sa.Numeric(5, 2), nullable=True),
        sa.Column('total_points', sa.Integer(), nullable=True),
        sa.Column('percentage', sa.Numeric(5, 2), nullable=True),
        sa.Column('is_passed', sa.Boolean(), nullable=True),
        sa.Column('attempt_number', sa.Integer(), server_default=sa.text('1')),
        sa.Column('time_taken_minutes', sa.Integer(), nullable=True),
        sa.Column('feedback', sa.Text(), nullable=True),
        sa.Column('graded_by', sa.String(50), nullable=True),
        sa.Column('graded_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('submitted_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index('ix_submissions_assessment_id', 'assessment_submissions', ['assessment_id'])
    op.create_index('ix_submissions_student_id', 'assessment_submissions', ['student_id'])

    # ========== TRANSACTIONS ==========
    op.create_table(
        'transactions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('amount', sa.Numeric(10, 2), nullable=False),
        sa.Column('currency', sa.String(3), server_default='KES', nullable=False),
        sa.Column('gateway', sa.String(20), nullable=False),
        sa.Column('status', sa.String(20), server_default='pending', nullable=False),
        sa.Column('transaction_type', sa.String(50), server_default='payment'),
        sa.Column('transaction_reference', sa.String(255), unique=True, nullable=True),
        sa.Column('gateway_reference', sa.String(255), nullable=True),
        sa.Column('course_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('courses.id', ondelete='SET NULL'), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('transaction_metadata', postgresql.JSONB(), server_default=sa.text("'{}'::jsonb")),
        sa.Column('is_deleted', sa.Boolean(), server_default=sa.text('false')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index('ix_transactions_user_id', 'transactions', ['user_id'])
    op.create_index('ix_transactions_status', 'transactions', ['status'])
    op.create_index('ix_transactions_gateway', 'transactions', ['gateway'])
    op.create_index('ix_transactions_created_at', 'transactions', ['created_at'])

    # ========== WALLETS ==========
    op.create_table(
        'wallets',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, unique=True),
        sa.Column('balance', sa.Numeric(10, 2), server_default=sa.text('0.00'), nullable=False),
        sa.Column('total_earned', sa.Numeric(10, 2), server_default=sa.text('0.00')),
        sa.Column('pending_payout', sa.Numeric(10, 2), server_default=sa.text('0.00')),
        sa.Column('currency', sa.String(3), server_default='KES'),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('true')),
        sa.Column('wallet_metadata', postgresql.JSONB(), server_default=sa.text("'{}'::jsonb")),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index('ix_wallets_user_id', 'wallets', ['user_id'])

    # ========== PAYMENT METHODS ==========
    op.create_table(
        'payment_methods',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('method_type', sa.String(30), nullable=False),
        sa.Column('provider', sa.String(30), nullable=False),
        sa.Column('display_name', sa.String(100), nullable=True),
        sa.Column('last_four', sa.String(4), nullable=True),
        sa.Column('phone_number', sa.String(20), nullable=True),
        sa.Column('email', sa.String(255), nullable=True),
        sa.Column('is_default', sa.Boolean(), server_default=sa.text('false')),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('true')),
        sa.Column('gateway_token', sa.String(500), nullable=True),
        sa.Column('method_metadata', postgresql.JSONB(), server_default=sa.text("'{}'::jsonb")),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index('ix_payment_methods_user_id', 'payment_methods', ['user_id'])


def downgrade() -> None:
    """Drop all core tables."""
    op.drop_table('payment_methods')
    op.drop_table('wallets')
    op.drop_table('transactions')
    op.drop_table('assessment_submissions')
    op.drop_table('assessments')
    op.drop_table('enrollments')
    op.drop_table('courses')
    op.drop_table('ai_tutors')
    op.drop_table('ai_providers')
    op.drop_table('students')
    op.drop_table('users')
