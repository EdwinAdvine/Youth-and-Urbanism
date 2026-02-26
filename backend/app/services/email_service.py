"""
Email Service for Urban Home School

Handles sending transactional emails including:
- Email verification after registration
- Password reset links
- Welcome emails

Uses SMTP configured via app settings. Falls back to logging
when SMTP is not configured (development mode).
"""

from __future__ import annotations

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


def send_partner_invite_email(to_email: str, contact_name: str, invite_token: str) -> bool:
    """
    Send partner setup link to an approved applicant.

    Args:
        to_email: Approved applicant's email address
        contact_name: Contact person's name
        invite_token: One-time JWT token (72h expiry) for account setup

    Returns:
        True if sent successfully, False otherwise
    """
    setup_url = f"{FRONTEND_URL}/partner-setup?token={invite_token}"
    name = contact_name or "there"

    html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #FF0000;">Congratulations — Your Partnership Has Been Approved!</h2>
        <p>Hi {name},</p>
        <p>
            We're excited to let you know that your partner application to
            <strong>Urban Home School</strong> has been approved.
        </p>
        <p>
            Click the button below to set up your partner account. This link is valid for
            <strong>72 hours</strong>.
        </p>
        <p style="text-align: center; margin: 30px 0;">
            <a href="{setup_url}"
               style="background-color: #FF0000; color: white; padding: 14px 28px;
                      text-decoration: none; border-radius: 8px; display: inline-block;
                      font-weight: bold; font-size: 16px;">
                Set Up Your Partner Account
            </a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">{setup_url}</p>
        <p>
            Once you've set up your account, you can log in to your partner dashboard
            and start collaborating with Urban Home School to support education in Kenya.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">
            If you did not apply to be a partner on Urban Home School, please ignore this email.
        </p>
    </body>
    </html>
    """

    return _send_email(to_email, "Your Partner Account is Ready — Urban Home School", html)


def send_staff_invite_email(to_email: str, full_name: str, invite_token: str) -> bool:
    """
    Send staff setup link to a newly approved staff member.

    Args:
        to_email: Staff member's email address
        full_name: Staff member's full name
        invite_token: One-time JWT token (72h expiry) for account setup

    Returns:
        True if sent successfully, False otherwise
    """
    setup_url = f"{FRONTEND_URL}/staff-setup?token={invite_token}"
    name = full_name or "there"

    html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #FF0000;">Welcome to Urban Home School Staff!</h2>
        <p>Hi {name},</p>
        <p>
            Your staff account on <strong>Urban Home School</strong> has been created.
            Click the button below to set up your password and activate your account.
        </p>
        <p>
            This link is valid for <strong>72 hours</strong>. You will be required to
            change your password within 24 hours of first login.
        </p>
        <p style="text-align: center; margin: 30px 0;">
            <a href="{setup_url}"
               style="background-color: #FF0000; color: white; padding: 14px 28px;
                      text-decoration: none; border-radius: 8px; display: inline-block;
                      font-weight: bold; font-size: 16px;">
                Set Up Your Staff Account
            </a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">{setup_url}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">
            If you did not expect this email, please contact the platform administrator.
        </p>
    </body>
    </html>
    """

    return _send_email(to_email, "Your Staff Account is Ready — Urban Home School", html)


def send_staff_approval_needed_email(to_email: str, staff_name: str, requested_by_name: str) -> bool:
    """
    Notify super admin that a staff account request needs approval.

    Args:
        to_email: Super admin's email address
        staff_name: Name of the requested staff member
        requested_by_name: Name of the admin who requested the account

    Returns:
        True if sent successfully, False otherwise
    """
    review_url = f"{FRONTEND_URL}/dashboard/admin/staff-accounts"

    html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #FF0000;">Staff Account Approval Required</h2>
        <p>A new staff account request needs your approval:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
                <td style="padding: 8px; font-weight: bold; color: #555;">Staff Name:</td>
                <td style="padding: 8px;">{staff_name}</td>
            </tr>
            <tr style="background: #f9f9f9;">
                <td style="padding: 8px; font-weight: bold; color: #555;">Requested By:</td>
                <td style="padding: 8px;">{requested_by_name}</td>
            </tr>
        </table>
        <p style="text-align: center; margin: 30px 0;">
            <a href="{review_url}"
               style="background-color: #FF0000; color: white; padding: 14px 28px;
                      text-decoration: none; border-radius: 8px; display: inline-block;
                      font-weight: bold; font-size: 16px;">
                Review Request
            </a>
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">
            This is an automated notification from Urban Home School.
        </p>
    </body>
    </html>
    """

    return _send_email(to_email, f"Staff Account Approval Needed: {staff_name} — Urban Home School", html)


def send_parent_children_welcome_email(
    parent_email: str,
    parent_name: str,
    children_details: list[dict],
) -> bool:
    """
    Send welcome email to parent with all children's usernames and setup links.

    Args:
        parent_email: Parent's email address
        parent_name: Parent's full name
        children_details: List of dicts with keys: full_name, username, setup_token

    Returns:
        True if sent successfully, False otherwise
    """
    name = parent_name or "there"

    children_rows = ""
    for child in children_details:
        setup_url = f"{FRONTEND_URL}/child-setup?token={child.get('setup_token', '')}"
        children_rows += f"""
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">{child['full_name']}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>{child['username']}</strong></td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">
                <a href="{setup_url}" style="color: #FF0000;">Set up account</a>
            </td>
        </tr>
        """

    html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #FF0000;">Welcome to Urban Home School!</h2>
        <p>Hi {name},</p>
        <p>
            Your family account has been created successfully. Below are the login
            details for your children. Each child will use a <strong>username</strong>
            (not email) to log in.
        </p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
                <tr style="background: #f5f5f5;">
                    <th style="padding: 10px; text-align: left; color: #555;">Child</th>
                    <th style="padding: 10px; text-align: left; color: #555;">Username</th>
                    <th style="padding: 10px; text-align: left; color: #555;">Setup</th>
                </tr>
            </thead>
            <tbody>
                {children_rows}
            </tbody>
        </table>
        <p>
            Click each child's "Set up account" link to create their password.
            Children can then log in using their username and password.
        </p>
        <p>
            You can monitor your children's progress from your parent dashboard at
            <a href="{FRONTEND_URL}/dashboard/parent" style="color: #FF0000;">
                {FRONTEND_URL}/dashboard/parent
            </a>.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">
            If you did not create this account, please contact us immediately.
        </p>
    </body>
    </html>
    """

    return _send_email(parent_email, "Welcome to Urban Home School — Your Children's Accounts", html)


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
