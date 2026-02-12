"""
Email Service for Urban Home School

Handles sending transactional emails including:
- Email verification after registration
- Password reset links
- Welcome emails

Uses SMTP configured via app settings. Falls back to logging
when SMTP is not configured (development mode).
"""

import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import timedelta
from typing import Optional

from app.config import settings
from app.utils.security import create_access_token

logger = logging.getLogger(__name__)

# Frontend URL for building links
FRONTEND_URL = "http://localhost:3000"


def _generate_verification_token(user_id: str) -> str:
    """Generate a JWT token for email verification (24h expiry)."""
    return create_access_token(
        data={"sub": user_id, "type": "email_verification"},
        expires_delta=timedelta(hours=24),
    )


def _generate_password_reset_token(user_id: str) -> str:
    """Generate a JWT token for password reset (1h expiry)."""
    return create_access_token(
        data={"sub": user_id, "type": "password_reset"},
        expires_delta=timedelta(hours=1),
    )


def _send_email(to_email: str, subject: str, html_body: str) -> bool:
    """
    Send an email via SMTP.

    Returns True if sent successfully, False otherwise.
    In development (no SMTP configured), logs the email instead.
    """
    if not settings.smtp_host or not settings.from_email:
        logger.info(
            f"[DEV] Email would be sent to {to_email}\n"
            f"Subject: {subject}\n"
            f"Body:\n{html_body}"
        )
        return True

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = settings.from_email
        msg["To"] = to_email
        msg.attach(MIMEText(html_body, "html"))

        if settings.smtp_use_tls:
            server = smtplib.SMTP(settings.smtp_host, settings.smtp_port)
            server.starttls()
        else:
            server = smtplib.SMTP(settings.smtp_host, settings.smtp_port)

        if settings.smtp_username and settings.smtp_password:
            server.login(settings.smtp_username, settings.smtp_password)

        server.sendmail(settings.from_email, to_email, msg.as_string())
        server.quit()

        logger.info(f"Email sent to {to_email}: {subject}")
        return True

    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return False


def send_verification_email(to_email: str, user_id: str, user_name: Optional[str] = None) -> str:
    """
    Send email verification link to a newly registered user.

    Args:
        to_email: Recipient email address
        user_id: User's UUID string
        user_name: Optional display name

    Returns:
        The verification token (useful for testing)
    """
    token = _generate_verification_token(user_id)
    verify_url = f"{FRONTEND_URL}/verify-email?token={token}"
    name = user_name or "there"

    html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a73e8;">Welcome to Urban Home School!</h2>
        <p>Hi {name},</p>
        <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
        <p style="text-align: center; margin: 30px 0;">
            <a href="{verify_url}"
               style="background-color: #1a73e8; color: white; padding: 12px 24px;
                      text-decoration: none; border-radius: 6px; display: inline-block;">
                Verify Email Address
            </a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">{verify_url}</p>
        <p>This link expires in 24 hours.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">
            If you did not create an account, please ignore this email.
        </p>
    </body>
    </html>
    """

    _send_email(to_email, "Verify your email - Urban Home School", html)
    return token


def send_password_reset_email(to_email: str, user_id: str, user_name: Optional[str] = None) -> str:
    """
    Send password reset link to a user.

    Args:
        to_email: Recipient email address
        user_id: User's UUID string
        user_name: Optional display name

    Returns:
        The reset token (useful for testing)
    """
    token = _generate_password_reset_token(user_id)
    reset_url = f"{FRONTEND_URL}/reset-password?token={token}"
    name = user_name or "there"

    html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a73e8;">Password Reset Request</h2>
        <p>Hi {name},</p>
        <p>We received a request to reset your password. Click the button below to set a new password:</p>
        <p style="text-align: center; margin: 30px 0;">
            <a href="{reset_url}"
               style="background-color: #1a73e8; color: white; padding: 12px 24px;
                      text-decoration: none; border-radius: 6px; display: inline-block;">
                Reset Password
            </a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">{reset_url}</p>
        <p>This link expires in 1 hour.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">
            If you did not request a password reset, please ignore this email.
            Your password will remain unchanged.
        </p>
    </body>
    </html>
    """

    _send_email(to_email, "Reset your password - Urban Home School", html)
    return token
