"""
Email Service Tests

Tests for app/services/email_service.py:
- Verification email sending and token generation
- Password reset email sending and token generation
- SMTP email delivery (mocked)
- Development mode fallback (logging instead of sending)
- Error handling for SMTP failures

Coverage target: 70%+
"""

import smtplib
from unittest.mock import patch, MagicMock

import pytest

from app.services.email_service import (
    _send_email,
    _generate_verification_token,
    _generate_password_reset_token,
    send_verification_email,
    send_password_reset_email,
    FRONTEND_URL,
)


@pytest.mark.unit
class TestGenerateVerificationToken:
    """Tests for _generate_verification_token."""

    def test_returns_string_token(self):
        """Test that a string JWT token is returned."""
        token = _generate_verification_token("user-123")
        assert isinstance(token, str)
        assert len(token) > 0

    def test_different_users_get_different_tokens(self):
        """Test that different user IDs produce different tokens."""
        token1 = _generate_verification_token("user-aaa")
        token2 = _generate_verification_token("user-bbb")
        assert token1 != token2


@pytest.mark.unit
class TestGeneratePasswordResetToken:
    """Tests for _generate_password_reset_token."""

    def test_returns_string_token(self):
        """Test that a string JWT token is returned."""
        token = _generate_password_reset_token("user-456")
        assert isinstance(token, str)
        assert len(token) > 0

    def test_different_users_get_different_tokens(self):
        """Test that different user IDs produce different tokens."""
        token1 = _generate_password_reset_token("user-ccc")
        token2 = _generate_password_reset_token("user-ddd")
        assert token1 != token2


@pytest.mark.unit
class TestSendEmailDevelopmentMode:
    """Tests for _send_email in development mode (no SMTP configured)."""

    @patch("app.services.email_service.settings")
    def test_send_email_logs_in_dev_mode(self, mock_settings):
        """Test that _send_email returns True and logs when SMTP is not configured."""
        mock_settings.smtp_host = None
        mock_settings.from_email = None

        result = _send_email("test@example.com", "Test Subject", "<p>Test body</p>")

        assert result is True

    @patch("app.services.email_service.settings")
    def test_send_email_logs_when_no_from_email(self, mock_settings):
        """Test that _send_email returns True when from_email is not set."""
        mock_settings.smtp_host = "smtp.test.com"
        mock_settings.from_email = None

        result = _send_email("test@example.com", "Test Subject", "<p>Body</p>")

        assert result is True

    @patch("app.services.email_service.settings")
    def test_send_email_logs_when_no_smtp_host(self, mock_settings):
        """Test that _send_email returns True when smtp_host is not set."""
        mock_settings.smtp_host = None
        mock_settings.from_email = "noreply@test.com"

        result = _send_email("test@example.com", "Test Subject", "<p>Body</p>")

        assert result is True


@pytest.mark.unit
class TestSendEmailSMTP:
    """Tests for _send_email with SMTP configured (mocked)."""

    @patch("app.services.email_service.smtplib.SMTP")
    @patch("app.services.email_service.settings")
    def test_send_email_success_with_tls(self, mock_settings, mock_smtp_class):
        """Test successful email sending via SMTP with TLS."""
        mock_settings.smtp_host = "smtp.test.com"
        mock_settings.smtp_port = 587
        mock_settings.from_email = "noreply@test.com"
        mock_settings.smtp_use_tls = True
        mock_settings.smtp_username = "user"
        mock_settings.smtp_password = "pass"

        mock_server = MagicMock()
        mock_smtp_class.return_value = mock_server

        result = _send_email("recipient@test.com", "Subject", "<p>Body</p>")

        assert result is True
        mock_smtp_class.assert_called_once_with("smtp.test.com", 587)
        mock_server.starttls.assert_called_once()
        mock_server.login.assert_called_once_with("user", "pass")
        mock_server.sendmail.assert_called_once()
        mock_server.quit.assert_called_once()

    @patch("app.services.email_service.smtplib.SMTP")
    @patch("app.services.email_service.settings")
    def test_send_email_success_without_tls(self, mock_settings, mock_smtp_class):
        """Test successful email sending via SMTP without TLS."""
        mock_settings.smtp_host = "smtp.test.com"
        mock_settings.smtp_port = 25
        mock_settings.from_email = "noreply@test.com"
        mock_settings.smtp_use_tls = False
        mock_settings.smtp_username = None
        mock_settings.smtp_password = None

        mock_server = MagicMock()
        mock_smtp_class.return_value = mock_server

        result = _send_email("recipient@test.com", "Subject", "<p>Body</p>")

        assert result is True
        mock_server.starttls.assert_not_called()
        mock_server.login.assert_not_called()
        mock_server.sendmail.assert_called_once()
        mock_server.quit.assert_called_once()

    @patch("app.services.email_service.smtplib.SMTP")
    @patch("app.services.email_service.settings")
    def test_send_email_smtp_failure_returns_false(self, mock_settings, mock_smtp_class):
        """Test that SMTP failure returns False."""
        mock_settings.smtp_host = "smtp.test.com"
        mock_settings.smtp_port = 587
        mock_settings.from_email = "noreply@test.com"
        mock_settings.smtp_use_tls = True
        mock_settings.smtp_username = "user"
        mock_settings.smtp_password = "pass"

        mock_smtp_class.side_effect = smtplib.SMTPException("Connection refused")

        result = _send_email("recipient@test.com", "Subject", "<p>Body</p>")

        assert result is False

    @patch("app.services.email_service.smtplib.SMTP")
    @patch("app.services.email_service.settings")
    def test_send_email_general_exception_returns_false(self, mock_settings, mock_smtp_class):
        """Test that a general exception during SMTP returns False."""
        mock_settings.smtp_host = "smtp.test.com"
        mock_settings.smtp_port = 587
        mock_settings.from_email = "noreply@test.com"
        mock_settings.smtp_use_tls = True
        mock_settings.smtp_username = "user"
        mock_settings.smtp_password = "pass"

        mock_smtp_class.side_effect = OSError("Network unreachable")

        result = _send_email("bad@test.com", "Subject", "<p>Body</p>")

        assert result is False


@pytest.mark.unit
class TestSendVerificationEmail:
    """Tests for send_verification_email."""

    @patch("app.services.email_service._send_email")
    def test_send_verification_email_returns_token(self, mock_send):
        """Test that send_verification_email returns a token string."""
        mock_send.return_value = True

        token = send_verification_email("user@test.com", "user-id-123")

        assert isinstance(token, str)
        assert len(token) > 0

    @patch("app.services.email_service._send_email")
    def test_send_verification_email_calls_send_email(self, mock_send):
        """Test that send_verification_email calls _send_email."""
        mock_send.return_value = True

        send_verification_email("user@test.com", "user-id-123", "John")

        mock_send.assert_called_once()
        call_args = mock_send.call_args
        assert call_args[0][0] == "user@test.com"
        assert "Verify your email" in call_args[0][1]
        assert "John" in call_args[0][2]

    @patch("app.services.email_service._send_email")
    def test_send_verification_email_uses_default_name(self, mock_send):
        """Test that send_verification_email uses 'there' when no name given."""
        mock_send.return_value = True

        send_verification_email("user@test.com", "user-id-456")

        call_args = mock_send.call_args
        html_body = call_args[0][2]
        assert "there" in html_body

    @patch("app.services.email_service._send_email")
    def test_send_verification_email_includes_verify_url(self, mock_send):
        """Test that the verification email body contains a verify URL."""
        mock_send.return_value = True

        send_verification_email("user@test.com", "user-id-789")

        call_args = mock_send.call_args
        html_body = call_args[0][2]
        assert f"{FRONTEND_URL}/verify-email?token=" in html_body


@pytest.mark.unit
class TestSendPasswordResetEmail:
    """Tests for send_password_reset_email."""

    @patch("app.services.email_service._send_email")
    def test_send_password_reset_email_returns_token(self, mock_send):
        """Test that send_password_reset_email returns a token string."""
        mock_send.return_value = True

        token = send_password_reset_email("user@test.com", "user-id-abc")

        assert isinstance(token, str)
        assert len(token) > 0

    @patch("app.services.email_service._send_email")
    def test_send_password_reset_email_calls_send_email(self, mock_send):
        """Test that send_password_reset_email calls _send_email."""
        mock_send.return_value = True

        send_password_reset_email("user@test.com", "user-id-abc", "Jane")

        mock_send.assert_called_once()
        call_args = mock_send.call_args
        assert call_args[0][0] == "user@test.com"
        assert "Reset your password" in call_args[0][1]
        assert "Jane" in call_args[0][2]

    @patch("app.services.email_service._send_email")
    def test_send_password_reset_email_uses_default_name(self, mock_send):
        """Test that send_password_reset_email uses 'there' when no name given."""
        mock_send.return_value = True

        send_password_reset_email("user@test.com", "user-id-def")

        call_args = mock_send.call_args
        html_body = call_args[0][2]
        assert "there" in html_body

    @patch("app.services.email_service._send_email")
    def test_send_password_reset_email_includes_reset_url(self, mock_send):
        """Test that the password reset email body contains a reset URL."""
        mock_send.return_value = True

        send_password_reset_email("user@test.com", "user-id-ghi")

        call_args = mock_send.call_args
        html_body = call_args[0][2]
        assert f"{FRONTEND_URL}/reset-password?token=" in html_body

    @patch("app.services.email_service._send_email")
    def test_send_password_reset_email_mentions_1_hour_expiry(self, mock_send):
        """Test that the password reset email mentions 1 hour expiry."""
        mock_send.return_value = True

        send_password_reset_email("user@test.com", "user-id-jkl")

        call_args = mock_send.call_args
        html_body = call_args[0][2]
        assert "1 hour" in html_body
