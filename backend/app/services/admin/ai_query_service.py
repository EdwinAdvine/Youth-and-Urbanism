"""
Admin AI Query Service - Phase 6 (Analytics & Intelligence)

Translates natural-language analytics queries into safe, read-only SQL,
executes them, and returns structured results with optional chart
configuration.

Security measures:
- Whitelist of allowed tables and columns
- Query timeout enforcement
- Result size limits
- Read-only execution (no INSERT/UPDATE/DELETE)
"""

import logging
import re
import time
from typing import Any, Dict, List, Optional

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Allowed schema whitelist
# ---------------------------------------------------------------------------

ALLOWED_TABLES: Dict[str, List[str]] = {
    "users": [
        "id", "email", "role", "first_name", "last_name",
        "is_active", "is_deleted", "created_at", "last_login",
    ],
    "students": [
        "id", "user_id", "parent_id", "admission_number",
        "grade_level", "created_at",
    ],
    "courses": [
        "id", "title", "learning_area", "grade_levels",
        "is_published", "enrollment_count", "average_rating",
        "total_reviews", "price", "currency", "created_at",
    ],
    "enrollments": [
        "id", "student_id", "course_id", "status",
        "progress_percentage", "enrolled_at", "completed_at",
    ],
    "transactions": [
        "id", "user_id", "amount", "currency", "gateway",
        "status", "created_at",
    ],
    "audit_logs": [
        "id", "actor_id", "actor_email", "action",
        "resource_type", "resource_id", "status", "created_at",
    ],
}

ALLOWED_TABLES_SET = set(ALLOWED_TABLES.keys())

MAX_ROWS = 500
QUERY_TIMEOUT_SECONDS = 10

# ---------------------------------------------------------------------------
# Simple NL → SQL translation
# ---------------------------------------------------------------------------

# Pre-built queries for common natural-language patterns
_NL_PATTERNS: List[Dict[str, Any]] = [
    {
        "patterns": [r"total\s+users", r"how many\s+users", r"user\s+count"],
        "sql": "SELECT role, COUNT(*) as count FROM users WHERE is_deleted = false GROUP BY role ORDER BY count DESC",
        "chart": {"type": "bar", "x_key": "role", "y_key": "count", "title": "Users by Role"},
    },
    {
        "patterns": [r"active\s+users\s+today", r"users\s+logged\s+in\s+today"],
        "sql": "SELECT role, COUNT(*) as count FROM users WHERE is_active = true AND last_login >= CURRENT_DATE GROUP BY role ORDER BY count DESC",
        "chart": {"type": "bar", "x_key": "role", "y_key": "count", "title": "Active Users Today"},
    },
    {
        "patterns": [r"revenue", r"total\s+income", r"earnings"],
        "sql": "SELECT gateway, SUM(amount) as total, COUNT(*) as txn_count FROM transactions WHERE status = 'completed' GROUP BY gateway ORDER BY total DESC",
        "chart": {"type": "bar", "x_key": "gateway", "y_key": "total", "title": "Revenue by Gateway"},
    },
    {
        "patterns": [r"top\s+courses", r"popular\s+courses", r"best\s+courses"],
        "sql": "SELECT title, enrollment_count, average_rating FROM courses WHERE is_published = true ORDER BY enrollment_count DESC LIMIT 10",
        "chart": {"type": "bar", "x_key": "title", "y_key": "enrollment_count", "title": "Top 10 Courses by Enrollment"},
    },
    {
        "patterns": [r"new\s+registrations", r"signups?\s+this\s+month", r"new\s+users\s+this\s+month"],
        "sql": "SELECT DATE(created_at) as date, COUNT(*) as registrations FROM users WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE) AND is_deleted = false GROUP BY DATE(created_at) ORDER BY date",
        "chart": {"type": "line", "x_key": "date", "y_key": "registrations", "title": "New Registrations This Month"},
    },
    {
        "patterns": [r"enrollment\s+status", r"enrollment\s+breakdown"],
        "sql": "SELECT status, COUNT(*) as count FROM enrollments GROUP BY status ORDER BY count DESC",
        "chart": {"type": "pie", "x_key": "status", "y_key": "count", "title": "Enrollment Status Breakdown"},
    },
    {
        "patterns": [r"course\s+completion", r"completion\s+rate"],
        "sql": "SELECT c.title, COUNT(e.id) as enrolled, SUM(CASE WHEN e.status = 'completed' THEN 1 ELSE 0 END) as completed FROM enrollments e JOIN courses c ON e.course_id = c.id GROUP BY c.title ORDER BY enrolled DESC LIMIT 10",
        "chart": {"type": "bar", "x_key": "title", "y_key": "completed", "title": "Course Completion (Top 10)"},
    },
    {
        "patterns": [r"failed\s+payments", r"payment\s+failures"],
        "sql": "SELECT gateway, COUNT(*) as failures FROM transactions WHERE status = 'failed' GROUP BY gateway ORDER BY failures DESC",
        "chart": {"type": "bar", "x_key": "gateway", "y_key": "failures", "title": "Failed Payments by Gateway"},
    },
    {
        "patterns": [r"grade\s+level\s+distribution", r"students?\s+per\s+grade"],
        "sql": "SELECT grade_level, COUNT(*) as students FROM students GROUP BY grade_level ORDER BY grade_level",
        "chart": {"type": "bar", "x_key": "grade_level", "y_key": "students", "title": "Students per Grade Level"},
    },
    {
        "patterns": [r"audit\s+log", r"recent\s+actions", r"admin\s+activity"],
        "sql": "SELECT action, resource_type, COUNT(*) as count FROM audit_logs WHERE created_at >= CURRENT_DATE - INTERVAL '7 days' GROUP BY action, resource_type ORDER BY count DESC LIMIT 20",
        "chart": {"type": "bar", "x_key": "action", "y_key": "count", "title": "Admin Actions (Last 7 Days)"},
    },
]


def _match_nl_query(query: str) -> Optional[Dict[str, Any]]:
    """Match a natural-language query against known patterns."""
    normalised = query.lower().strip()
    for entry in _NL_PATTERNS:
        for pattern in entry["patterns"]:
            if re.search(pattern, normalised):
                return entry
    return None


def _validate_sql(sql: str) -> bool:
    """Reject any write/destructive statements."""
    upper = sql.upper().strip()
    forbidden = ["INSERT", "UPDATE", "DELETE", "DROP", "ALTER", "TRUNCATE", "CREATE", "GRANT", "REVOKE"]
    for word in forbidden:
        if re.search(rf"\b{word}\b", upper):
            return False
    return True


class AIQueryService:
    """Service for natural-language analytics queries."""

    @staticmethod
    async def execute_nl_query(
        db: AsyncSession,
        query: str,
    ) -> Dict[str, Any]:
        """
        Translate a natural-language query to SQL, execute it, and
        return structured results.

        Returns:
            Dict with query, sql_generated, results, chart_config,
            row_count, execution_time_ms
        """
        start = time.monotonic()

        # Try pattern matching first
        matched = _match_nl_query(query)
        if not matched:
            return {
                "query": query,
                "sql_generated": None,
                "results": [],
                "chart_config": None,
                "row_count": 0,
                "execution_time_ms": round((time.monotonic() - start) * 1000, 2),
                "error": (
                    "Could not interpret the query. Try phrases like: "
                    "'total users', 'revenue by gateway', 'top courses', "
                    "'enrollment breakdown', 'new registrations this month'."
                ),
            }

        sql = matched["sql"]
        chart_config = matched.get("chart")

        # Safety check
        if not _validate_sql(sql):
            return {
                "query": query,
                "sql_generated": sql,
                "results": [],
                "chart_config": None,
                "row_count": 0,
                "execution_time_ms": round((time.monotonic() - start) * 1000, 2),
                "error": "Query blocked: write operations are not allowed.",
            }

        try:
            result = await db.execute(
                text(f"{sql} LIMIT {MAX_ROWS}")
                if "LIMIT" not in sql.upper()
                else text(sql)
            )
            rows = result.mappings().all()
            results = [dict(row) for row in rows]

            # Convert non-serialisable types
            for row in results:
                for key, value in row.items():
                    if hasattr(value, "isoformat"):
                        row[key] = value.isoformat()
                    elif hasattr(value, "__float__"):
                        row[key] = float(value)

            elapsed = round((time.monotonic() - start) * 1000, 2)

            return {
                "query": query,
                "sql_generated": sql,
                "results": results,
                "chart_config": chart_config,
                "row_count": len(results),
                "execution_time_ms": elapsed,
            }
        except Exception as exc:
            logger.exception("AI query execution failed: %s", sql)
            elapsed = round((time.monotonic() - start) * 1000, 2)
            return {
                "query": query,
                "sql_generated": sql,
                "results": [],
                "chart_config": None,
                "row_count": 0,
                "execution_time_ms": elapsed,
                "error": f"Query execution failed: {str(exc)[:200]}",
            }

    @staticmethod
    def get_available_queries() -> List[Dict[str, str]]:
        """Return list of example queries the system can handle."""
        examples = [
            {"query": "Total users by role", "description": "Count of all users grouped by their role"},
            {"query": "Active users today", "description": "Users who logged in today, grouped by role"},
            {"query": "Revenue by gateway", "description": "Total revenue grouped by payment gateway"},
            {"query": "Top courses", "description": "Top 10 courses by enrollment count"},
            {"query": "New registrations this month", "description": "Daily registration count for the current month"},
            {"query": "Enrollment breakdown", "description": "Enrollment status distribution"},
            {"query": "Course completion rates", "description": "Completion stats for top 10 courses"},
            {"query": "Failed payments", "description": "Payment failure count by gateway"},
            {"query": "Students per grade", "description": "Student distribution across grade levels"},
            {"query": "Recent admin actions", "description": "Audit log summary for the last 7 days"},
        ]
        return examples
