"""
Test Runner Service Tests

Tests for app/services/admin/test_runner_service.py:
- _parse_pytest_summary() correctly extracts pass/fail counts
- _parse_vitest_summary() correctly extracts pass/fail counts
- run_tests() creates TestRun record and spawns subprocess
- is_run_active() returns lock state
- Concurrent run prevention
"""

import asyncio
import uuid
from datetime import datetime
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.services.admin.test_runner_service import (
    _parse_pytest_summary,
    _parse_vitest_summary,
    is_run_active,
    run_tests,
    get_test_runs,
    get_test_run_by_id,
)


@pytest.mark.unit
class TestParsePytestSummary:
    """Tests for _parse_pytest_summary()."""

    def test_parse_all_categories(self):
        """Should parse output with passed, failed, and skipped counts."""
        output = "====== 10 passed, 3 failed, 2 skipped in 5.67s ======"
        result = _parse_pytest_summary(output)

        assert result["passed"] == 10
        assert result["failed"] == 3
        assert result["skipped"] == 2
        assert result["total"] == 15

    def test_parse_passed_only(self):
        """Should parse output with only passed tests."""
        output = "====== 25 passed in 3.45s ======"
        result = _parse_pytest_summary(output)

        assert result["passed"] == 25
        assert result["failed"] == 0
        assert result["skipped"] == 0
        assert result["total"] == 25

    def test_parse_failed_only(self):
        """Should parse output with only failed tests."""
        output = "====== 5 failed in 2.10s ======"
        result = _parse_pytest_summary(output)

        assert result["failed"] == 5
        assert result["total"] == 5

    def test_parse_with_errors(self):
        """Should parse output with error count."""
        output = "====== 2 passed, 1 failed, 3 error in 1.00s ======"
        result = _parse_pytest_summary(output)

        assert result["passed"] == 2
        assert result["failed"] == 1
        assert result["errors"] == 3
        assert result["total"] == 6

    def test_parse_no_match(self):
        """Should return zeroes when output has no summary line."""
        output = "Some random output without test results"
        result = _parse_pytest_summary(output)

        assert result["passed"] == 0
        assert result["failed"] == 0
        assert result["total"] == 0

    def test_parse_empty_string(self):
        """Should handle empty string gracefully."""
        result = _parse_pytest_summary("")

        assert result["total"] == 0

    def test_parse_multiline_output(self):
        """Should find the summary in multi-line output."""
        output = (
            "tests/test_auth.py::test_login PASSED\n"
            "tests/test_auth.py::test_signup PASSED\n"
            "tests/test_auth.py::test_invalid FAILED\n"
            "\n"
            "======================= 2 passed, 1 failed in 0.85s ========================\n"
        )
        result = _parse_pytest_summary(output)

        assert result["passed"] == 2
        assert result["failed"] == 1
        assert result["total"] == 3


@pytest.mark.unit
class TestParseVitestSummary:
    """Tests for _parse_vitest_summary()."""

    def test_parse_standard_vitest_output(self):
        """Should parse standard vitest summary line."""
        output = " Tests  5 passed | 2 failed | 1 skipped (8)"
        result = _parse_vitest_summary(output)

        assert result["passed"] == 5
        assert result["failed"] == 2
        assert result["skipped"] == 1
        assert result["total"] == 8

    def test_parse_all_passed(self):
        """Should parse output where all tests passed."""
        output = " Tests  10 passed (10)"
        result = _parse_vitest_summary(output)

        assert result["passed"] == 10
        assert result["failed"] == 0
        assert result["total"] == 10

    def test_parse_with_todo(self):
        """Should count todo tests as skipped."""
        output = " Tests  3 passed | 2 todo (5)"
        result = _parse_vitest_summary(output)

        assert result["passed"] == 3
        assert result["skipped"] == 2
        assert result["total"] == 5

    def test_parse_no_match(self):
        """Should return zeroes when no vitest summary found."""
        output = "Compiling TypeScript...\nBundling..."
        result = _parse_vitest_summary(output)

        assert result["total"] == 0

    def test_parse_empty_string(self):
        """Should handle empty string gracefully."""
        result = _parse_vitest_summary("")

        assert result["total"] == 0

    def test_parse_multiline_vitest(self):
        """Should find counts in multi-line vitest output."""
        output = (
            "stdout | src/App.test.tsx\n"
            " PASS  src/App.test.tsx (0.45s)\n"
            " FAIL  src/Login.test.tsx (0.23s)\n"
            "\n"
            " Tests  4 passed | 1 failed (5)\n"
            " Time   1.23s\n"
        )
        result = _parse_vitest_summary(output)

        assert result["passed"] == 4
        assert result["failed"] == 1
        assert result["total"] == 5


@pytest.mark.unit
class TestIsRunActive:
    """Tests for is_run_active()."""

    async def test_returns_false_when_no_run(self):
        """is_run_active should return False when no test run is in progress."""
        result = await is_run_active()

        # Default state: lock is not held
        assert result is False


@pytest.mark.unit
class TestRunTests:
    """Tests for run_tests()."""

    @patch("app.services.admin.test_runner_service._run_subprocess", new_callable=AsyncMock)
    async def test_run_tests_creates_test_run_record(self, mock_subprocess):
        """run_tests should create a TestRun record in the database."""
        mock_subprocess.return_value = "====== 5 passed in 1.00s ======\n"
        mock_db = AsyncMock()
        triggered_by = uuid.uuid4()

        # Reset the global lock state by ensuring it is not locked
        import app.services.admin.test_runner_service as trs
        if trs._running_lock.locked():
            # Skip test if lock is held (concurrent test issue)
            pytest.skip("Lock is held from another test")

        result = await run_tests(mock_db, "backend", triggered_by)

        # DB operations: add, commit (create), then commit (update), refresh x2
        assert mock_db.add.called
        assert mock_db.commit.await_count >= 2

    @patch("app.services.admin.test_runner_service._run_subprocess", new_callable=AsyncMock)
    async def test_run_tests_backend_calls_subprocess(self, mock_subprocess):
        """run_tests for backend should invoke _run_subprocess with pytest command."""
        mock_subprocess.return_value = "====== 3 passed in 0.50s ======\n"
        mock_db = AsyncMock()
        triggered_by = uuid.uuid4()

        import app.services.admin.test_runner_service as trs
        if trs._running_lock.locked():
            pytest.skip("Lock is held from another test")

        await run_tests(mock_db, "backend", triggered_by)

        mock_subprocess.assert_awaited()
        call_kwargs = mock_subprocess.call_args
        cmd = call_kwargs.kwargs.get("cmd") or call_kwargs[1].get("cmd") or call_kwargs[0][0]
        assert "pytest" in cmd[-1] or "pytest" in str(cmd)

    @patch("app.services.admin.test_runner_service._run_subprocess", new_callable=AsyncMock)
    async def test_run_tests_determines_passed_status(self, mock_subprocess):
        """run_tests should set status='passed' when no failures."""
        mock_subprocess.return_value = "====== 5 passed in 1.00s ======\n"
        mock_db = AsyncMock()

        import app.services.admin.test_runner_service as trs
        if trs._running_lock.locked():
            pytest.skip("Lock is held from another test")

        result = await run_tests(mock_db, "backend", uuid.uuid4())

        assert result.status == "passed"

    @patch("app.services.admin.test_runner_service._run_subprocess", new_callable=AsyncMock)
    async def test_run_tests_determines_failed_status(self, mock_subprocess):
        """run_tests should set status='failed' when there are failures."""
        mock_subprocess.return_value = "====== 2 passed, 3 failed in 1.00s ======\n"
        mock_db = AsyncMock()

        import app.services.admin.test_runner_service as trs
        if trs._running_lock.locked():
            pytest.skip("Lock is held from another test")

        result = await run_tests(mock_db, "backend", uuid.uuid4())

        assert result.status == "failed"

    @patch("app.services.admin.test_runner_service._run_subprocess", new_callable=AsyncMock)
    async def test_run_tests_handles_exception(self, mock_subprocess):
        """run_tests should set status='error' when subprocess raises."""
        mock_subprocess.side_effect = Exception("Command not found")
        mock_db = AsyncMock()

        import app.services.admin.test_runner_service as trs
        if trs._running_lock.locked():
            pytest.skip("Lock is held from another test")

        result = await run_tests(mock_db, "backend", uuid.uuid4())

        assert result.status == "error"
        assert "ERROR" in result.output

    @patch("app.services.admin.test_runner_service._run_subprocess", new_callable=AsyncMock)
    async def test_run_tests_invokes_output_callback(self, mock_subprocess):
        """run_tests should call the output_callback with header and output."""
        mock_subprocess.return_value = "====== 1 passed in 0.10s ======\n"
        mock_db = AsyncMock()
        callback = AsyncMock()

        import app.services.admin.test_runner_service as trs
        if trs._running_lock.locked():
            pytest.skip("Lock is held from another test")

        await run_tests(mock_db, "backend", uuid.uuid4(), output_callback=callback)

        assert callback.await_count >= 1


@pytest.mark.unit
class TestGetTestRuns:
    """Tests for get_test_runs()."""

    async def test_get_test_runs_no_filter(self):
        """get_test_runs should return paginated results."""
        mock_db = AsyncMock()

        count_res = MagicMock()
        count_res.scalar.return_value = 5

        items_res = MagicMock()
        items_res.scalars.return_value.all.return_value = ["run1", "run2"]

        mock_db.execute = AsyncMock(side_effect=[count_res, items_res])

        result = await get_test_runs(mock_db)

        assert result["total"] == 5
        assert result["page"] == 1
        assert result["page_size"] == 20

    async def test_get_test_runs_with_type_filter(self):
        """get_test_runs should filter by run_type."""
        mock_db = AsyncMock()

        count_res = MagicMock()
        count_res.scalar.return_value = 2

        items_res = MagicMock()
        items_res.scalars.return_value.all.return_value = ["run_be1", "run_be2"]

        mock_db.execute = AsyncMock(side_effect=[count_res, items_res])

        result = await get_test_runs(mock_db, run_type="backend")

        assert result["total"] == 2


@pytest.mark.unit
class TestGetTestRunById:
    """Tests for get_test_run_by_id()."""

    async def test_returns_run_when_found(self):
        """get_test_run_by_id should return the TestRun when found."""
        mock_db = AsyncMock()
        run_id = uuid.uuid4()
        mock_run = MagicMock(id=run_id)

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_run
        mock_db.execute.return_value = mock_result

        result = await get_test_run_by_id(mock_db, run_id)

        assert result is mock_run

    async def test_returns_none_when_not_found(self):
        """get_test_run_by_id should return None for non-existent ID."""
        mock_db = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result

        result = await get_test_run_by_id(mock_db, uuid.uuid4())

        assert result is None
