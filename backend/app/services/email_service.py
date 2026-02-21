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


def send_instructor_invite_email(to_email: str, applicant_name: str, invite_token: str) -> bool:
    """
    Send instructor setup link to an approved applicant.

    Args:
        to_email: Approved applicant's email address
        applicant_name: Applicant's full name
        invite_token: One-time JWT token (72h expiry) for account setup

    Returns:
        True if sent successfully, False otherwise
    """
    setup_url = f"{FRONTEND_URL}/instructor-setup?token={invite_token}"
    name = applicant_name or "there"

    html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #FF0000;">Congratulations — You've Been Approved!</h2>
        <p>Hi {name},</p>
        <p>
            We're excited to let you know that your instructor application to
            <strong>Urban Home School</strong> has been approved.
        </p>
        <p>
            Click the button below to set up your instructor account. This link is valid for
            <strong>72 hours</strong>.
        </p>
        <p style="text-align: center; margin: 30px 0;">
            <a href="{setup_url}"
               style="background-color: #FF0000; color: white; padding: 14px 28px;
                      text-decoration: none; border-radius: 8px; display: inline-block;
                      font-weight: bold; font-size: 16px;">
                Set Up Your Instructor Account
            </a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">{setup_url}</p>
        <p>
            Once you've set up your account, you can log in to your instructor dashboard
            and start creating CBC-aligned courses for Kenyan students.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">
            If you did not apply to be an instructor on Urban Home School, please ignore this email.
        </p>
    </body>
    </html>
    """

    return _send_email(to_email, "Your Instructor Account is Ready — Urban Home School", html)


def send_contact_notification_email(
    sender_name: str,
    sender_email: str,
    subject: str,
    message: str,
) -> bool:
    """
    Forward a contact form submission to the admin inbox.

    Sends an email to info@youthandurbanism.org with the contact form details.
    """
    ADMIN_EMAIL = "info@youthandurbanism.org"

    html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #FF0000;">New Contact Form Submission</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
                <td style="padding: 8px; font-weight: bold; width: 120px; color: #555;">From:</td>
                <td style="padding: 8px;">{sender_name} &lt;{sender_email}&gt;</td>
            </tr>
            <tr style="background: #f9f9f9;">
                <td style="padding: 8px; font-weight: bold; color: #555;">Subject:</td>
                <td style="padding: 8px;">{subject}</td>
            </tr>
        </table>
        <div style="background: #f5f5f5; border-left: 4px solid #FF0000; padding: 16px; margin-bottom: 20px;">
            <p style="margin: 0; white-space: pre-wrap;">{message}</p>
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">
            This message was submitted via the Urban Home School contact form.<br>
            Reply directly to {sender_email} to respond.
        </p>
    </body>
    </html>
    """

    return _send_email(
        ADMIN_EMAIL,
        f"[UHS Contact] {subject} — from {sender_name}",
        html,
    )
