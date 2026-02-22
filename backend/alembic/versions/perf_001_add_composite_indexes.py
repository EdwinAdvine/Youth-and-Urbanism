"""Add composite indexes for 1000+ QPS performance

Adds missing composite indexes on frequently queried column combinations
identified during production hardening audit. These indexes target:
- Admin/staff dashboard aggregate queries (users, enrollments, transactions)
- CoPilot parent context builder (students, enrollments)
- CoPilot message history loading (copilot_messages)
- Course catalog filtering (courses)

Revision ID: perf_001
Revises: 6f28748ccf26
Create Date: 2026-02-22
"""
from alembic import op

# revision identifiers, used by Alembic.
revision = "perf_001"
down_revision = "6f28748ccf26"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Enrollments: student dashboard, parent context, copilot queries
    op.create_index(
        "ix_enrollments_student_status",
        "enrollments",
        ["student_id", "status"],
    )
    op.create_index(
        "ix_enrollments_course_status",
        "enrollments",
        ["course_id", "status"],
    )

    # Courses: instructor dashboard, catalog filtering
    op.create_index(
        "ix_courses_instructor_published",
        "courses",
        ["instructor_id", "is_published"],
    )

    # Users: admin dashboard role counts, active user queries
    op.create_index(
        "ix_users_role_active_deleted",
        "users",
        ["role", "is_active", "is_deleted"],
    )
    op.create_index(
        "ix_users_active_last_login",
        "users",
        ["is_active", "is_deleted", "last_login"],
    )

    # Students: parent context builder (JOIN students + users by parent)
    op.create_index(
        "ix_students_parent_user",
        "students",
        ["parent_id", "user_id"],
    )

    # CoPilot messages: history loading ordered by created_at
    op.create_index(
        "ix_copilot_messages_session_created",
        "copilot_messages",
        ["session_id", "created_at"],
    )

    # Transactions: revenue queries filtered by status + date range
    op.create_index(
        "ix_transactions_status_created",
        "transactions",
        ["status", "created_at"],
    )


def downgrade() -> None:
    op.drop_index("ix_transactions_status_created")
    op.drop_index("ix_copilot_messages_session_created")
    op.drop_index("ix_students_parent_user")
    op.drop_index("ix_users_active_last_login")
    op.drop_index("ix_users_role_active_deleted")
    op.drop_index("ix_courses_instructor_published")
    op.drop_index("ix_enrollments_course_status")
    op.drop_index("ix_enrollments_student_status")
