# Authentication API Reference

**Urban Home School (UHS v1) / Urban Bird v1**
*Authentication Endpoints*

Base Path: `/api/v1/auth`
Last Updated: 2026-02-15

---

## Table of Contents

1. [Overview](#overview)
2. [POST /auth/register](#post-authregister)
3. [POST /auth/login](#post-authlogin)
4. [POST /auth/refresh](#post-authrefresh)
5. [GET /auth/me](#get-authme)
6. [POST /auth/verify-email](#post-authverify-email)
7. [POST /auth/resend-verification](#post-authresend-verification)
8. [POST /auth/forgot-password](#post-authforgot-password)
9. [POST /auth/reset-password](#post-authreset-password)
10. [POST /auth/logout](#post-authlogout)

---

## Overview

The Authentication API handles user registration, login, token management, email verification, and password reset flows. All authentication tokens are JWTs signed with HS256.

**Password Requirements:**
- Minimum 8 characters, maximum 100 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one digit (0-9)
- At least one special character (!@#$%^&*(),.?":{}|<>_-+=[]\/;'`~)

**Supported Roles:**
- `student` -- Enrolled learner
- `parent` -- Parent or guardian
- `instructor` -- External educator or content creator
- `admin` -- Platform administrator
- `partner` -- External partner or organization
- `staff` -- Internal staff member

---

## POST /auth/register

Register a new user account. Automatically creates an AI tutor instance for student accounts and sends a verification email in the background.

### Details

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Path** | `/api/v1/auth/register` |
| **Auth Required** | No |
| **Rate Limit** | 10 requests/minute |

### Request Body

```json
{
  "email": "student@example.com",
  "password": "MySecure1!Pass",
  "role": "student",
  "profile_data": {
    "full_name": "Jane Mwangi",
    "phone_number": "+254712345678",
    "grade_level": "Grade 7",
    "school_name": "Nairobi Academy"
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string (email) | Yes | Valid email address |
| `password` | string | Yes | Password meeting strength requirements (8-100 chars) |
| `role` | string (enum) | Yes | One of: `student`, `parent`, `instructor`, `admin`, `partner`, `staff` |
| `profile_data` | object | No | Role-specific profile information (stored as JSONB) |

**Common `profile_data` fields by role:**

| Role | Suggested Fields |
|------|-----------------|
| student | `full_name`, `grade_level`, `school_name`, `phone_number` |
| parent | `full_name`, `phone_number`, `location` |
| instructor | `full_name`, `phone_number`, `qualifications`, `subjects` |
| admin | `full_name`, `department` |
| partner | `full_name`, `organization_name`, `type` |
| staff | `full_name`, `department`, `position` |

### Response (201 Created)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "student@example.com",
  "role": "student",
  "is_active": true,
  "is_verified": false,
  "profile_data": {
    "full_name": "Jane Mwangi",
    "phone_number": "+254712345678",
    "grade_level": "Grade 7",
    "school_name": "Nairobi Academy"
  },
  "created_at": "2026-02-15T10:30:00.000000",
  "last_login": null
}
```

### Error Responses

| Status | Condition | Example |
|--------|-----------|---------|
| `400` | Email already registered | `{"detail": "Email already registered", "status_code": 400}` |
| `422` | Validation failure | `{"detail": "Validation error", "errors": [...]}` |
| `500` | Server error | `{"detail": "Registration failed: ...", "status_code": 500}` |

### cURL Example

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "MySecure1!Pass",
    "role": "student",
    "profile_data": {
      "full_name": "Jane Mwangi",
      "grade_level": "Grade 7"
    }
  }'
```

---

## POST /auth/login

Authenticate a user with email and password. Returns JWT access and refresh tokens. For student accounts, ensures an AI tutor instance exists.

### Details

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Path** | `/api/v1/auth/login` |
| **Auth Required** | No |
| **Rate Limit** | 10 requests/minute |

### Request Body

```json
{
  "email": "student@example.com",
  "password": "MySecure1!Pass"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string (email) | Yes | Registered email address |
| `password` | string | Yes | Account password |

### Response (200 OK)

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJyb2xlIjoic3R1ZGVudCIsImVtYWlsIjoic3R1ZGVudEBleGFtcGxlLmNvbSIsInR5cGUiOiJhY2Nlc3MiLCJleHAiOjE3MDgwMTIzNDUsImlhdCI6MTcwODAxMDU0NX0.signature",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJ0eXBlIjoicmVmcmVzaCIsImV4cCI6MTcwODYxNTM0NSwiaWF0IjoxNzA4MDEwNTQ1fQ.signature",
  "token_type": "bearer",
  "expires_in": 1800
}
```

| Field | Type | Description |
|-------|------|-------------|
| `access_token` | string | JWT access token (30-minute lifetime) |
| `refresh_token` | string | JWT refresh token (7-day lifetime) |
| `token_type` | string | Always `"bearer"` |
| `expires_in` | integer | Access token lifetime in seconds (1800 = 30 minutes) |

### JWT Payload Structure

The decoded access token contains:

```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "role": "student",
  "email": "student@example.com",
  "type": "access",
  "exp": 1708012345,
  "iat": 1708010545
}
```

### Error Responses

| Status | Condition | Example |
|--------|-----------|---------|
| `401` | Invalid credentials | `{"detail": "Invalid email or password"}` |
| `401` | Account inactive | `{"detail": "Account is deactivated"}` |
| `500` | Server error | `{"detail": "Login failed: ..."}` |

### cURL Example

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "MySecure1!Pass"
  }'
```

---

## POST /auth/refresh

Generate a new access token using a valid refresh token. The old access token is not invalidated; it continues to be valid until expiry or logout.

### Details

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Path** | `/api/v1/auth/refresh` |
| **Auth Required** | No (uses refresh token in body) |
| **Rate Limit** | 10 requests/minute |

### Request Body

```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `refresh_token` | string | Yes | Valid refresh token from login response |

### Response (200 OK)

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

### Error Responses

| Status | Condition | Example |
|--------|-----------|---------|
| `400` | Missing refresh token | `{"detail": "Refresh token is required"}` |
| `401` | Invalid or expired refresh token | `{"detail": "Invalid or expired refresh token"}` |
| `500` | Server error | `{"detail": "Token refresh failed: ..."}` |

### cURL Example

```bash
curl -X POST http://localhost:8000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

---

## GET /auth/me

Retrieve the currently authenticated user's profile information. This is the primary endpoint for verifying token validity and fetching user data.

### Details

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Path** | `/api/v1/auth/me` |
| **Auth Required** | Yes (Bearer token) |
| **Rate Limit** | 100 requests/minute |

### Request Headers

```
Authorization: Bearer <access_token>
```

### Response (200 OK)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "student@example.com",
  "role": "student",
  "is_active": true,
  "is_verified": true,
  "profile_data": {
    "full_name": "Jane Mwangi",
    "phone_number": "+254712345678",
    "grade_level": "Grade 7",
    "school_name": "Nairobi Academy"
  },
  "created_at": "2026-02-15T10:30:00.000000",
  "last_login": "2026-02-15T14:00:00.000000"
}
```

### Error Responses

| Status | Condition | Example |
|--------|-----------|---------|
| `401` | Missing or invalid token | `{"detail": "Could not validate credentials"}` |
| `401` | Expired token | `{"detail": "Token has expired"}` |
| `401` | Blacklisted token (logged out) | `{"detail": "Token has been revoked"}` |

### cURL Example

```bash
curl -X GET http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## POST /auth/verify-email

Verify a user's email address using the verification token sent during registration. The token is embedded in the verification link sent via email.

### Details

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Path** | `/api/v1/auth/verify-email` |
| **Auth Required** | No |
| **Rate Limit** | 10 requests/minute |

### Request Body

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJ0eXBlIjoiZW1haWxfdmVyaWZpY2F0aW9uIn0.signature"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `token` | string | Yes | Email verification JWT token |

### Response (200 OK)

```json
{
  "message": "Email verified successfully"
}
```

If already verified:

```json
{
  "message": "Email is already verified"
}
```

### Error Responses

| Status | Condition | Example |
|--------|-----------|---------|
| `400` | Invalid token | `{"detail": "Invalid or expired verification token"}` |
| `400` | Wrong token type | `{"detail": "Invalid verification token"}` |
| `404` | User not found | `{"detail": "User not found"}` |

### cURL Example

```bash
curl -X POST http://localhost:8000/api/v1/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

---

## POST /auth/resend-verification

Resend the email verification link to the currently authenticated user. Requires a valid access token since the user must be logged in to request a resend.

### Details

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Path** | `/api/v1/auth/resend-verification` |
| **Auth Required** | Yes (Bearer token) |
| **Rate Limit** | 10 requests/minute |

### Request Headers

```
Authorization: Bearer <access_token>
```

### Request Body

No request body required.

### Response (200 OK)

```json
{
  "message": "Verification email sent"
}
```

If already verified:

```json
{
  "message": "Email is already verified"
}
```

### Error Responses

| Status | Condition | Example |
|--------|-----------|---------|
| `401` | Missing or invalid token | `{"detail": "Could not validate credentials"}` |

### cURL Example

```bash
curl -X POST http://localhost:8000/api/v1/auth/resend-verification \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## POST /auth/forgot-password

Request a password reset email. For security, this endpoint always returns a success response regardless of whether the email exists in the system (prevents email enumeration attacks).

### Details

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Path** | `/api/v1/auth/forgot-password` |
| **Auth Required** | No |
| **Rate Limit** | 10 requests/minute |

### Request Body

```json
{
  "email": "student@example.com"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string (email) | Yes | Email address to send the reset link to |

### Response (200 OK)

Always returns the same response to prevent email enumeration:

```json
{
  "message": "If an account exists with that email, a reset link has been sent"
}
```

### Error Responses

| Status | Condition | Example |
|--------|-----------|---------|
| `422` | Invalid email format | `{"detail": "Validation error", "errors": [...]}` |

### cURL Example

```bash
curl -X POST http://localhost:8000/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com"
  }'
```

---

## POST /auth/reset-password

Complete the password reset process using the token received via email and set a new password.

### Details

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Path** | `/api/v1/auth/reset-password` |
| **Auth Required** | No (uses reset token in body) |
| **Rate Limit** | 10 requests/minute |

### Request Body

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "new_password": "NewSecure2!Pass"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `token` | string | Yes | Password reset JWT token from email |
| `new_password` | string | Yes | New password meeting strength requirements (8-100 chars) |

### Response (200 OK)

```json
{
  "message": "Password reset successfully"
}
```

### Error Responses

| Status | Condition | Example |
|--------|-----------|---------|
| `400` | Invalid or expired token | `{"detail": "Failed to reset password"}` |
| `422` | Weak password | `{"detail": "Validation error", "errors": [{"msg": "Password must contain at least one uppercase letter"}]}` |

### cURL Example

```bash
curl -X POST http://localhost:8000/api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "new_password": "NewSecure2!Pass"
  }'
```

---

## POST /auth/logout

Invalidate the current access token by adding it to the Redis blacklist. The token will remain blacklisted for the remainder of its natural lifetime (TTL), after which the blacklist entry auto-expires.

### Details

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Path** | `/api/v1/auth/logout` |
| **Auth Required** | Yes (Bearer token) |
| **Rate Limit** | 10 requests/minute |

### Request Headers

```
Authorization: Bearer <access_token>
```

### Request Body

No request body required.

### Response (200 OK)

```json
{
  "message": "Logged out successfully"
}
```

### Behavior Notes

- If the token is already expired or invalid, the endpoint still returns a 200 success (graceful handling).
- If Redis is unavailable, the logout succeeds from the client perspective, but the token will not be blacklisted (fail-open for availability).
- The blacklist entry is stored as `blacklist:<token>` with a TTL equal to the token's remaining lifetime.
- After logout, the access token will be rejected by any endpoint that checks the blacklist.

### Error Responses

Logout is designed to always succeed (even with an invalid token), so error responses are rare.

| Status | Condition | Example |
|--------|-----------|---------|
| `500` | Unexpected server error | `{"detail": "Internal server error"}` |

### cURL Example

```bash
curl -X POST http://localhost:8000/api/v1/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Authentication Flow Summary

```
1. Register  --> POST /auth/register        (get user object)
2. Verify    --> POST /auth/verify-email     (confirm email from link)
3. Login     --> POST /auth/login            (get access + refresh tokens)
4. Use API   --> GET/POST/PUT/DELETE /api/v1/... (include Bearer token)
5. Refresh   --> POST /auth/refresh          (get new access token when expired)
6. Logout    --> POST /auth/logout           (blacklist the access token)

Password Reset:
1. Forgot    --> POST /auth/forgot-password  (request reset email)
2. Reset     --> POST /auth/reset-password   (set new password with token)
```
