"""Add content integrity tables: content_versions, competency_tags, course_competency_mappings, grade_overrides, certificate_templates, resource_items

Revision ID: admin_005_content
Revises: admin_004_people
Create Date: 2026-02-14

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import uuid

revision = 'admin_005_content'
down_revision = 'admin_004_people'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. content_versions
    op.create_table(
        'content_versions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('course_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('courses.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('version_number', sa.Integer, nullable=False),
        sa.Column('changes', postgresql.JSONB, server_default='{}'),
        sa.Column('created_by', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id'), nullable=False),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.func.now()),
    )
    op.create_index('ix_cv_course_version', 'content_versions', ['course_id', 'version_number'])

    # 2. competency_tags
    op.create_table(
        'competency_tags',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('name', sa.String(200), nullable=False, index=True),
        sa.Column('strand', sa.String(100), nullable=False),
        sa.Column('sub_strand', sa.String(100), nullable=True),
        sa.Column('grade_level', sa.String(20), nullable=True, index=True),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('is_active', sa.Boolean, nullable=False, server_default=sa.text('true')),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.func.now()),
    )

    # 3. course_competency_mappings
    op.create_table(
        'course_competency_mappings',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('course_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('courses.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('competency_tag_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('competency_tags.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('coverage_level', sa.String(20), server_default='full'),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.func.now()),
    )
    op.create_index('ix_ccm_course_comp', 'course_competency_mappings',
                     ['course_id', 'competency_tag_id'], unique=True)

    # 4. grade_overrides
    op.create_table(
        'grade_overrides',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('assessment_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('assessments.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('student_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('students.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('original_score', sa.Float, nullable=False),
        sa.Column('override_score', sa.Float, nullable=False),
        sa.Column('reason', sa.Text, nullable=False),
        sa.Column('requested_by', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id'), nullable=False),
        sa.Column('status', sa.String(20), server_default='pending', index=True),
        sa.Column('decided_by', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id'), nullable=True),
        sa.Column('decided_at', sa.DateTime, nullable=True),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.func.now()),
    )

    # 5. certificate_templates
    op.create_table(
        'certificate_templates',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('template_data', postgresql.JSONB, server_default='{}'),
        sa.Column('is_active', sa.Boolean, nullable=False, server_default=sa.text('true')),
        sa.Column('created_by', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id'), nullable=True),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.func.now()),
    )

    # 6. resource_items
    op.create_table(
        'resource_items',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('title', sa.String(300), nullable=False, index=True),
        sa.Column('file_url', sa.String(500), nullable=False),
        sa.Column('file_type', sa.String(50), nullable=False),
        sa.Column('file_size_bytes', sa.Integer, nullable=True),
        sa.Column('category', sa.String(100), nullable=True, index=True),
        sa.Column('tags', postgresql.JSONB, server_default='[]'),
        sa.Column('uploaded_by', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id'), nullable=False),
        sa.Column('moderation_status', sa.String(20), server_default='pending', index=True),
        sa.Column('usage_count', sa.Integer, server_default='0'),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table('resource_items')
    op.drop_table('certificate_templates')
    op.drop_table('grade_overrides')
    op.drop_index('ix_ccm_course_comp', table_name='course_competency_mappings')
    op.drop_table('course_competency_mappings')
    op.drop_table('competency_tags')
    op.drop_index('ix_cv_course_version', table_name='content_versions')
    op.drop_table('content_versions')
