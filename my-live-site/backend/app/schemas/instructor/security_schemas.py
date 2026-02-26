"""
Instructor Security Schemas

Pydantic v2 schemas for 2FA, login history, and security management.
"""

from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime


# TOTP (Time-based One-Time Password) Schemas
class TOTPSetupResponse(BaseModel):
    secret: str
    qr_code_uri: str
    backup_codes: List[str]


class TOTPVerifyRequest(BaseModel):
    code: str = Field(..., min_length=6, max_length=6, pattern="^[0-9]{6}$")


class TOTPEnableRequest(BaseModel):
    code: str = Field(..., min_length=6, max_length=6, pattern="^[0-9]{6}$")
    secret: str


class TOTPDisableRequest(BaseModel):
    code: str = Field(..., min_length=6, max_length=6, pattern="^[0-9]{6}$")


# SMS OTP Schemas
class SMSOTPEnableRequest(BaseModel):
    phone: str = Field(..., pattern="^\\+?[1-9]\\d{1,14}$")  # E.164 format


class SMSOTPVerifyRequest(BaseModel):
    code: str = Field(..., min_length=6, max_length=6, pattern="^[0-9]{6}$")


class SMSOTPDisableRequest(BaseModel):
    code: str = Field(..., min_length=6, max_length=6, pattern="^[0-9]{6}$")


# Email OTP Schemas
class EmailOTPEnableRequest(BaseModel):
    email: EmailStr


class EmailOTPVerifyRequest(BaseModel):
    code: str = Field(..., min_length=6, max_length=6, pattern="^[0-9]{6}$")


class EmailOTPDisableRequest(BaseModel):
    code: str = Field(..., min_length=6, max_length=6, pattern="^[0-9]{6}$")


# 2FA Status Response
class TwoFactorStatusResponse(BaseModel):
    id: str
    user_id: str
    totp_enabled: bool
    sms_enabled: bool
    sms_phone: Optional[str] = None
    email_otp_enabled: bool
    last_verified_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Backup Codes Schemas
class BackupCodesRegenerateResponse(BaseModel):
    backup_codes: List[str]


class BackupCodeVerifyRequest(BaseModel):
    code: str


# Login History Schemas
class LoginHistoryResponse(BaseModel):
    id: str
    user_id: str
    ip_address: str
    user_agent: str
    location: Optional[str] = None
    success: bool
    failure_reason: Optional[str] = None
    two_factor_method: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class LoginHistoryQueryParams(BaseModel):
    success: Optional[bool] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=50, ge=1, le=100)


# Security Alert Schemas
class SecurityAlertResponse(BaseModel):
    id: str
    alert_type: str  # unusual_location, multiple_failed_attempts, new_device, etc.
    severity: str  # low, medium, high, critical
    message: str
    details: dict
    created_at: datetime


# Session Management Schemas
class ActiveSessionResponse(BaseModel):
    id: str
    device: str
    location: Optional[str] = None
    ip_address: str
    last_active: datetime
    is_current: bool


class RevokeSessionRequest(BaseModel):
    session_id: str


# Password Change Schema
class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)
    confirm_password: str


# Security Settings Update
class SecuritySettingsUpdate(BaseModel):
    require_2fa: Optional[bool] = None
    session_timeout_minutes: Optional[int] = Field(None, ge=5, le=1440)  # 5min to 24h
    allowed_ip_addresses: Optional[List[str]] = None
