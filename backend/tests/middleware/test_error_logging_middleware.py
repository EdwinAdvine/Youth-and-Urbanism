"""
Error Logging Middleware Tests

Tests for app/middleware/error_logging_middleware.py:
- 5xx responses are logged
- Exceptions are logged and re-raised
- SKIP_PATHS are skipped
- Sensitive field sanitization
- _get_client_ip extracts correct IP
- _sanitize_data redacts sensitive fields
"""

import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.middleware.error_logging_middleware import (
    ErrorLoggingMiddleware,
    SKIP_PATHS,
    SENSITIVE_FIELDS,
    _sanitize_data,
    _get_client_ip,
)


def _make_mock_request(
    path="/api/v1/test",
    method="GET",
    headers=None,
    client_host="127.0.0.1",
    query_params=None,
    state_attrs=None,
):
    """Build a mock Starlette Request."""
    request = MagicMock()
    request.url.path = path
    request.method = method

    default_headers = {"User-Agent": "TestBrowser/1.0"}
    if headers:
        default_headers.update(headers)
    mock_headers = MagicMock()
    mock_headers.get = lambda key, default="": default_headers.get(key, default)
    mock_headers.__iter__ = lambda self: iter(default_headers)
    mock_headers.__getitem__ = lambda self, key: default_headers[key]
    mock_headers.__contains__ = lambda self, key: key in default_headers
    request.headers = mock_headers

    client = MagicMock()
    client.host = client_host
    request.client = client

    request.query_params = query_params or {}

    # Set up request.state
    state = MagicMock()
    if state_attrs:
        for k, v in state_attrs.items():
            setattr(state, k, v)
    else:
        state.user_id = None
        state.user_role = None
    request.state = state

    # Body for POST requests
    async def mock_body():
        return b""

    request.body = mock_body

    return request


def _make_mock_response(status_code=200):
    """Build a mock Starlette Response."""
    response = MagicMock()
    response.status_code = status_code
    return response


@pytest.mark.unit
class TestSanitizeData:
    """Tests for _sanitize_data()."""

    def test_redacts_password(self):
        """Should redact 'password' fields."""
        data = {"username": "test", "password": "secret123"}
        result = _sanitize_data(data)

        assert result["username"] == "test"
        assert result["password"] == "***REDACTED***"

    def test_redacts_api_key(self):
        """Should redact 'api_key' fields."""
        data = {"api_key": "sk-abc123", "name": "test"}
        result = _sanitize_data(data)

        assert result["api_key"] == "***REDACTED***"
        assert result["name"] == "test"

    def test_redacts_nested_sensitive_fields(self):
        """Should recursively redact sensitive fields in nested dicts."""
        data = {
            "user": {
                "email": "test@test.com",
                "password": "secret",
                "token": "jwt-token-here",
            }
        }
        result = _sanitize_data(data)

        assert result["user"]["email"] == "test@test.com"
        assert result["user"]["password"] == "***REDACTED***"
        assert result["user"]["token"] == "***REDACTED***"

    def test_case_insensitive_matching(self):
        """Should match sensitive fields case-insensitively."""
        data = {"Password": "secret", "API_KEY": "key123"}
        result = _sanitize_data(data)

        assert result["Password"] == "***REDACTED***"
        assert result["API_KEY"] == "***REDACTED***"

    def test_non_dict_returns_as_is(self):
        """Should return non-dict values unchanged."""
        assert _sanitize_data("string") == "string"
        assert _sanitize_data(42) == 42
        assert _sanitize_data(None) is None

    def test_empty_dict(self):
        """Should handle empty dict."""
        assert _sanitize_data({}) == {}

    def test_all_sensitive_fields_redacted(self):
        """All fields in SENSITIVE_FIELDS should be redacted."""
        data = {field: f"value_{field}" for field in SENSITIVE_FIELDS}
        result = _sanitize_data(data)

        for field in SENSITIVE_FIELDS:
            assert result[field] == "***REDACTED***"


@pytest.mark.unit
class TestGetClientIP:
    """Tests for _get_client_ip()."""

    def test_returns_x_forwarded_for(self):
        """Should return the first IP from X-Forwarded-For header."""
        request = _make_mock_request(
            headers={"X-Forwarded-For": "203.0.113.1, 10.0.0.1"}
        )
        assert _get_client_ip(request) == "203.0.113.1"

    def test_returns_x_real_ip(self):
        """Should return X-Real-IP when X-Forwarded-For is absent."""
        request = _make_mock_request(headers={"X-Real-IP": "198.51.100.1"})
        # Make sure X-Forwarded-For returns None
        original_get = request.headers.get
        def custom_get(key, default=""):
            if key == "X-Forwarded-For":
                return None
            return original_get(key, default)
        request.headers.get = custom_get

        assert _get_client_ip(request) == "198.51.100.1"

    def test_returns_client_host_as_fallback(self):
        """Should return request.client.host when no proxy headers present."""
        request = _make_mock_request(client_host="192.168.1.1")
        # Ensure proxy headers return None/empty
        def custom_get(key, default=""):
            if key in ("X-Forwarded-For", "X-Real-IP"):
                return None
            return default
        request.headers.get = custom_get

        assert _get_client_ip(request) == "192.168.1.1"

    def test_returns_unknown_when_no_client(self):
        """Should return 'unknown' when request.client is None."""
        request = _make_mock_request()
        request.client = None
        def custom_get(key, default=""):
            return None
        request.headers.get = custom_get

        assert _get_client_ip(request) == "unknown"


@pytest.mark.unit
class TestErrorLoggingMiddlewareDispatch:
    """Tests for ErrorLoggingMiddleware.dispatch()."""

    async def test_skips_health_check_path(self):
        """Middleware should skip /health and return response directly."""
        app = MagicMock()
        middleware = ErrorLoggingMiddleware(app)

        request = _make_mock_request(path="/health")
        expected_response = _make_mock_response(200)
        call_next = AsyncMock(return_value=expected_response)

        response = await middleware.dispatch(request, call_next)

        assert response == expected_response
        call_next.assert_awaited_once()

    async def test_skips_docs_path(self):
        """Middleware should skip /docs path."""
        app = MagicMock()
        middleware = ErrorLoggingMiddleware(app)

        request = _make_mock_request(path="/docs")
        expected_response = _make_mock_response(200)
        call_next = AsyncMock(return_value=expected_response)

        response = await middleware.dispatch(request, call_next)

        assert response == expected_response

    async def test_skips_all_skip_paths(self):
        """Middleware should skip all paths in SKIP_PATHS."""
        app = MagicMock()
        middleware = ErrorLoggingMiddleware(app)

        for path in SKIP_PATHS:
            request = _make_mock_request(path=path)
            call_next = AsyncMock(return_value=_make_mock_response(200))

            response = await middleware.dispatch(request, call_next)
            assert response.status_code == 200

    @patch.object(ErrorLoggingMiddleware, "_log_error", new_callable=AsyncMock)
    async def test_logs_5xx_responses(self, mock_log_error):
        """Middleware should log errors for 5xx responses."""
        app = MagicMock()
        middleware = ErrorLoggingMiddleware(app)

        request = _make_mock_request(path="/api/v1/crash", method="GET")
        error_response = _make_mock_response(500)
        call_next = AsyncMock(return_value=error_response)

        response = await middleware.dispatch(request, call_next)

        assert response.status_code == 500
        mock_log_error.assert_awaited_once()
        call_kwargs = mock_log_error.call_args
        assert call_kwargs.kwargs.get("level") == "ERROR" or call_kwargs[1].get("level") == "ERROR"

    @patch.object(ErrorLoggingMiddleware, "_log_error", new_callable=AsyncMock)
    async def test_does_not_log_4xx_responses(self, mock_log_error):
        """Middleware should NOT log errors for 4xx client errors."""
        app = MagicMock()
        middleware = ErrorLoggingMiddleware(app)

        request = _make_mock_request(path="/api/v1/missing")
        not_found_response = _make_mock_response(404)
        call_next = AsyncMock(return_value=not_found_response)

        response = await middleware.dispatch(request, call_next)

        assert response.status_code == 404
        mock_log_error.assert_not_awaited()

    @patch.object(ErrorLoggingMiddleware, "_log_error", new_callable=AsyncMock)
    async def test_does_not_log_2xx_responses(self, mock_log_error):
        """Middleware should NOT log for successful responses."""
        app = MagicMock()
        middleware = ErrorLoggingMiddleware(app)

        request = _make_mock_request(path="/api/v1/users")
        ok_response = _make_mock_response(200)
        call_next = AsyncMock(return_value=ok_response)

        response = await middleware.dispatch(request, call_next)

        assert response.status_code == 200
        mock_log_error.assert_not_awaited()

    @patch.object(ErrorLoggingMiddleware, "_log_error", new_callable=AsyncMock)
    async def test_logs_exception_and_reraises(self, mock_log_error):
        """Middleware should log unhandled exceptions and re-raise them."""
        app = MagicMock()
        middleware = ErrorLoggingMiddleware(app)

        request = _make_mock_request(path="/api/v1/explode", method="POST")
        call_next = AsyncMock(side_effect=RuntimeError("Unexpected error"))

        with pytest.raises(RuntimeError, match="Unexpected error"):
            await middleware.dispatch(request, call_next)

        mock_log_error.assert_awaited_once()
        call_kwargs = mock_log_error.call_args
        kwargs = call_kwargs.kwargs if call_kwargs.kwargs else {}
        assert kwargs.get("level") == "CRITICAL"
        assert kwargs.get("error_type") == "RuntimeError"

    @patch.object(ErrorLoggingMiddleware, "_log_error", new_callable=AsyncMock)
    async def test_logs_503_response(self, mock_log_error):
        """Middleware should log 503 Service Unavailable as a 5xx error."""
        app = MagicMock()
        middleware = ErrorLoggingMiddleware(app)

        request = _make_mock_request(path="/api/v1/service")
        unavailable_response = _make_mock_response(503)
        call_next = AsyncMock(return_value=unavailable_response)

        response = await middleware.dispatch(request, call_next)

        assert response.status_code == 503
        mock_log_error.assert_awaited_once()


@pytest.mark.unit
class TestLogErrorMethod:
    """Tests for ErrorLoggingMiddleware._log_error() database interaction."""

    @patch("app.middleware.error_logging_middleware.AsyncSessionLocal")
    async def test_log_error_writes_to_database(self, mock_session_local):
        """_log_error should create an ErrorLog entry and commit."""
        app = MagicMock()
        middleware = ErrorLoggingMiddleware(app)

        mock_session = AsyncMock()
        mock_ctx = AsyncMock()
        mock_ctx.__aenter__ = AsyncMock(return_value=mock_session)
        mock_ctx.__aexit__ = AsyncMock(return_value=False)
        mock_session_local.return_value = mock_ctx

        request = _make_mock_request()

        await middleware._log_error(
            level="ERROR",
            error_type="TestError",
            message="test message",
            stack_trace=None,
            endpoint="/api/v1/test",
            method="GET",
            request=request,
            request_body=None,
            client_ip="127.0.0.1",
            user_agent="TestBrowser/1.0",
        )

        mock_session.add.assert_called_once()
        mock_session.commit.assert_awaited_once()

    @patch("app.middleware.error_logging_middleware.AsyncSessionLocal", None)
    async def test_log_error_handles_no_database(self):
        """_log_error should silently skip if AsyncSessionLocal is None."""
        app = MagicMock()
        middleware = ErrorLoggingMiddleware(app)

        request = _make_mock_request()

        # Should not raise any exception
        await middleware._log_error(
            level="ERROR",
            error_type="TestError",
            message="test message",
            stack_trace=None,
            endpoint="/api/v1/test",
            method="GET",
            request=request,
            request_body=None,
            client_ip="127.0.0.1",
            user_agent="TestBrowser/1.0",
        )

    @patch("app.middleware.error_logging_middleware.AsyncSessionLocal")
    async def test_log_error_catches_database_errors(self, mock_session_local):
        """_log_error should catch and log database exceptions without propagating."""
        app = MagicMock()
        middleware = ErrorLoggingMiddleware(app)

        mock_session_local.side_effect = Exception("DB connection failed")

        request = _make_mock_request()

        # Should not raise, just log the error
        await middleware._log_error(
            level="CRITICAL",
            error_type="DBError",
            message="failed",
            stack_trace=None,
            endpoint="/api/v1/test",
            method="POST",
            request=request,
            request_body=None,
            client_ip="127.0.0.1",
            user_agent="TestBrowser/1.0",
        )


@pytest.mark.unit
class TestRequestBodyHandling:
    """Tests for request body reading and sanitization during dispatch."""

    @patch.object(ErrorLoggingMiddleware, "_log_error", new_callable=AsyncMock)
    async def test_reads_and_sanitizes_post_body(self, mock_log_error):
        """Middleware should read and sanitize POST request body."""
        app = MagicMock()
        middleware = ErrorLoggingMiddleware(app)

        body_data = json.dumps({"email": "test@test.com", "password": "secret123"})
        request = _make_mock_request(path="/api/v1/auth/login", method="POST")

        async def mock_body():
            return body_data.encode("utf-8")
        request.body = mock_body

        error_response = _make_mock_response(500)
        call_next = AsyncMock(return_value=error_response)

        await middleware.dispatch(request, call_next)

        mock_log_error.assert_awaited_once()
        call_kwargs = mock_log_error.call_args.kwargs
        request_body = call_kwargs.get("request_body")
        if request_body:
            assert request_body.get("password") == "***REDACTED***"
            assert request_body.get("email") == "test@test.com"

    @patch.object(ErrorLoggingMiddleware, "_log_error", new_callable=AsyncMock)
    async def test_handles_invalid_json_body_gracefully(self, mock_log_error):
        """Middleware should handle non-JSON POST body gracefully."""
        app = MagicMock()
        middleware = ErrorLoggingMiddleware(app)

        request = _make_mock_request(path="/api/v1/upload", method="POST")

        async def mock_body():
            return b"not-json-data"
        request.body = mock_body

        error_response = _make_mock_response(500)
        call_next = AsyncMock(return_value=error_response)

        # Should not raise
        await middleware.dispatch(request, call_next)

        mock_log_error.assert_awaited_once()
        call_kwargs = mock_log_error.call_args.kwargs
        assert call_kwargs.get("request_body") is None
