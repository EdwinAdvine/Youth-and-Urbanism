"""
Test Runner Service

Executes backend (pytest) and frontend (vitest) test suites as subprocesses.
Captures output in real-time and stores results in the test_runs table.
Only one test run can be active at a time.
"""

import asyncio
import logging
import os
import re
from datetime import datetime
from typing import Optional, AsyncGenerator
from uuid import UUID

from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.admin.test_run import TestRun

logger = logging.getLogger(__name__)

# Determine project root (backend/ is one level up from app/)
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FRONTEND_DIR = os.path.join(os.path.dirname(BACKEND_DIR), "frontend")

# Global lock to prevent concurrent test runs
_running_lock = asyncio.Lock()
_current_run_id: Optional[UUID] = None


def _parse_pytest_summary(output: str) -> dict:
    """Parse pytest output to extract pass/fail/skip counts."""
    summary = {"passed": 0, "failed": 0, "skipped": 0, "errors": 0, "total": 0}

    # Look for the summary line like: "5 passed, 2 failed, 1 skipped in 3.45s"
    match = re.search(
        r"(?:=+\s*)?(\d+\s+passed)?[,\s]*(\d+\s+failed)?[,\s]*(\d+\s+skipped)?[,\s]*(\d+\s+error)?",
        output,
    )
    if match:
        for group in match.groups():
            if group:
                parts = group.strip().split()
                if len(parts) == 2:
                    count = int(parts[0])
                    category = parts[1].rstrip("s").rstrip("ed")
                    if "pass" in category:
                        summary["passed"] = count
                    elif "fail" in category:
                        summary["failed"] = count
                    elif "skip" in category:
                        summary["skipped"] = count
                    elif "error" in category:
                        summary["errors"] = count

    summary["total"] = summary["passed"] + summary["failed"] + summary["skipped"] + summary["errors"]
    return summary


def _parse_vitest_summary(output: str) -> dict:
    """Parse vitest output to extract pass/fail counts."""
    summary = {"passed": 0, "failed": 0, "skipped": 0, "errors": 0, "total": 0}

    # Vitest output: "Tests  5 passed | 2 failed | 1 skipped (8)"
    for line in output.split("\n"):
        if "passed" in line.lower() or "failed" in line.lower():
            for part in re.findall(r"(\d+)\s+(passed|failed|skipped|todo)", line.lower()):
                count = int(part[0])
                category = part[1]
                if category == "passed":
                    summary["passed"] = count
                elif category == "failed":
                    summary["failed"] = count
                elif category in ("skipped", "todo"):
                    summary["skipped"] += count

    summary["total"] = summary["passed"] + summary["failed"] + summary["skipped"]
    return summary


async def is_run_active() -> bool:
    """Check if a test run is currently in progress."""
    return _running_lock.locked()


async def run_tests(
    db: AsyncSession,
    run_type: str,
    triggered_by: UUID,
    output_callback=None,
) -> TestRun:
    """
    Execute a test suite and store results.

    Args:
        db: Database session
        run_type: 'backend', 'frontend', or 'all'
        triggered_by: UUID of admin who triggered the run
        output_callback: Optional async callback called with each output line

    Returns:
        TestRun record with results
    """
    global _current_run_id

    if _running_lock.locked():
        raise RuntimeError("A test run is already in progress")

    async with _running_lock:
        # Create the test run record
        test_run = TestRun(
            run_type=run_type,
            status="running",
            triggered_by=triggered_by,
            started_at=datetime.utcnow(),
        )
        db.add(test_run)
        await db.commit()
        await db.refresh(test_run)
        _current_run_id = test_run.id

        full_output = ""

        try:
            if run_type in ("backend", "all"):
                header = "=" * 60 + "\n  BACKEND TESTS (pytest)\n" + "=" * 60 + "\n\n"
                full_output += header
                if output_callback:
                    await output_callback(header)

                backend_output = await _run_subprocess(
                    cmd=["python", "-m", "pytest", "--tb=short", "-v", "--no-header"],
                    cwd=BACKEND_DIR,
                    output_callback=output_callback,
                )
                full_output += backend_output

            if run_type in ("frontend", "all"):
                header = "\n" + "=" * 60 + "\n  FRONTEND TESTS (vitest)\n" + "=" * 60 + "\n\n"
                full_output += header
                if output_callback:
                    await output_callback(header)

                frontend_output = await _run_subprocess(
                    cmd=["npm", "run", "test"],
                    cwd=FRONTEND_DIR,
                    output_callback=output_callback,
                )
                full_output += frontend_output

            # Parse summary
            if run_type == "backend":
                summary = _parse_pytest_summary(full_output)
            elif run_type == "frontend":
                summary = _parse_vitest_summary(full_output)
            else:
                # Combined: try both parsers
                backend_summary = _parse_pytest_summary(full_output)
                frontend_summary = _parse_vitest_summary(full_output)
                summary = {
                    "backend": backend_summary,
                    "frontend": frontend_summary,
                    "passed": backend_summary["passed"] + frontend_summary["passed"],
                    "failed": backend_summary["failed"] + frontend_summary["failed"],
                    "skipped": backend_summary["skipped"] + frontend_summary["skipped"],
                    "total": backend_summary["total"] + frontend_summary["total"],
                }

            # Determine status
            failed = summary.get("failed", 0) + summary.get("errors", 0)
            status = "passed" if failed == 0 and summary.get("total", 0) > 0 else "failed"

            # Update the test run record
            test_run.status = status
            test_run.output = full_output
            test_run.summary = summary
            test_run.completed_at = datetime.utcnow()
            if test_run.started_at:
                delta = test_run.completed_at - test_run.started_at
                test_run.duration_seconds = f"{delta.total_seconds():.1f}s"

            await db.commit()
            await db.refresh(test_run)
            return test_run

        except Exception as e:
            logger.error(f"Test run failed: {e}")
            test_run.status = "error"
            test_run.output = full_output + f"\n\nERROR: {str(e)}"
            test_run.completed_at = datetime.utcnow()
            await db.commit()
            await db.refresh(test_run)
            return test_run

        finally:
            _current_run_id = None


async def _run_subprocess(
    cmd: list[str],
    cwd: str,
    output_callback=None,
    timeout: int = 600,
) -> str:
    """Run a subprocess and capture output line by line."""
    full_output = ""

    try:
        process = await asyncio.create_subprocess_exec(
            *cmd,
            cwd=cwd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.STDOUT,
            env={**os.environ, "PYTHONDONTWRITEBYTECODE": "1"},
        )

        # Read output line by line
        while True:
            try:
                line = await asyncio.wait_for(
                    process.stdout.readline(), timeout=timeout
                )
            except asyncio.TimeoutError:
                process.kill()
                full_output += "\n[TIMEOUT: Test run exceeded time limit]\n"
                break

            if not line:
                break

            decoded = line.decode("utf-8", errors="replace")
            full_output += decoded

            if output_callback:
                await output_callback(decoded)

        await process.wait()

        if process.returncode not in (0, 1):
            # returncode 1 is normal for test failures
            full_output += f"\n[Process exited with code {process.returncode}]\n"

    except FileNotFoundError:
        full_output += f"\n[ERROR: Command not found: {cmd[0]}]\n"
    except Exception as e:
        full_output += f"\n[ERROR: {str(e)}]\n"

    return full_output


async def get_test_runs(
    db: AsyncSession,
    run_type: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
) -> dict:
    """Get paginated test run history."""
    from sqlalchemy import func, and_

    conditions = []
    if run_type:
        conditions.append(TestRun.run_type == run_type)

    where_clause = and_(*conditions) if conditions else True

    count_q = select(func.count(TestRun.id)).where(where_clause)
    total_result = await db.execute(count_q)
    total = total_result.scalar() or 0

    offset = (page - 1) * page_size
    items_q = (
        select(TestRun)
        .where(where_clause)
        .order_by(desc(TestRun.started_at))
        .offset(offset)
        .limit(page_size)
    )
    items_result = await db.execute(items_q)
    items = items_result.scalars().all()

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
    }


async def get_test_run_by_id(db: AsyncSession, run_id: UUID) -> Optional[TestRun]:
    """Get a single test run by ID."""
    result = await db.execute(select(TestRun).where(TestRun.id == run_id))
    return result.scalar_one_or_none()
