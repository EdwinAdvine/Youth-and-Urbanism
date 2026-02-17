# Authentication Flow

> **Source files**: `backend/app/api/v1/auth.py`, `backend/app/utils/security.py`, `backend/app/services/auth_service.py`
> **Last updated**: 2026-02-15

## Overview

Urban Home School uses JWT (JSON Web Token) authentication with bcrypt password hashing. The system supports user registration, login, token refresh, logout (token blacklisting via Redis), email verification, and password reset.

---

## Registration

### Flow

```mermaid
sequenceDiagram
    participant User
    participant FE as Frontend
    participant BE as Backend API
    participant DB as PostgreSQL
    participant Redis
    participant Email as Email Service

    User->>FE: Fill registration form
    FE->>BE: POST /api/v1/auth/register
    Note over BE: Validate input (email, password, role)
    Note over BE: Check email uniqueness
    Note over BE: Hash password with bcrypt
    BE->>DB: INSERT INTO users (email, password_hash, role, ...)
    DB-->>BE: User created
    alt Role is "student"
        Note over BE: Auto-create AI tutor for student
        BE->>DB: INSERT INTO ai_tutors (student_id, ...)
    end
    BE->>Email: Background task: send verification email
    BE-->>FE: 201 Created {user_id, email, role}
    FE-->>User: Registration successful
    Note over Email: Email sent with verification link
```

### Endpoint

```
POST /api/v1/auth/register
```

### Request Body (UserCreate schema)

```json
{
    "email": "student@example.com",
    "password": "MyP@ssw0rd!",
    "role": "student",
    "full_name": "John Doe",
    "phone": "+254712345678"
}
```

### Password Requirements

- Minimum 8 characters (`password_min_length`)
- At least one uppercase letter (`password_require_uppercase`)
- At least one lowercase letter
- At least one digit (`password_require_numbers`)
- At least one special character (`password_require_special`)

### Password Hashing

```python
import bcrypt
hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
```

The system uses `bcrypt` directly (not via `passlib`) to avoid version incompatibility issues. The bcrypt salt is automatically generated and embedded in the hash.

### Verification Email

Sent as a background task via FastAPI `BackgroundTasks`:
```python
background_tasks.add_task(send_verification_email, user.email, str(user.id), user_name)
```

---

## Login

### Flow

```mermaid
sequenceDiagram
    participant User
    participant FE as Frontend
    participant BE as Backend API
    participant DB as PostgreSQL

    User->>FE: Enter email and password
    FE->>BE: POST /api/v1/auth/login
    BE->>DB: SELECT * FROM users WHERE email = ?
    DB-->>BE: User record
    Note over BE: Verify password with bcrypt
    alt Password valid
        Note over BE: Create access token (30 min)
        Note over BE: Create refresh token (7 days)
        BE-->>FE: 200 OK {access_token, refresh_token, token_type, expires_in}
    else Password invalid
        BE-->>FE: 401 Unauthorized
    end
    FE->>FE: Store tokens in localStorage
    FE-->>User: Login successful, redirect to dashboard
```

### Endpoint

```
POST /api/v1/auth/login
```

### Request Body (UserLogin schema)

```json
{
    "email": "student@example.com",
    "password": "MyP@ssw0rd!"
}
```

### Response (TokenResponse schema)

```json
{
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "token_type": "bearer",
    "expires_in": 1800
}
```

### JWT Claims

#### Access Token Claims

| Claim | Description | Example |
|---|---|---|
| `sub` | User UUID | `"550e8400-e29b-41d4-a716-446655440000"` |
| `role` | User role | `"student"` |
| `email` | User email | `"student@example.com"` |
| `exp` | Expiration timestamp | `1708012200` |
| `iat` | Issued at timestamp | `1708010400` |
| `type` | Token type | `"access"` |

#### Refresh Token Claims

| Claim | Description |
|---|---|
| `sub` | User UUID |
| `exp` | Expiration (7 days from issuance) |
| `iat` | Issued at timestamp |
| `type` | `"refresh"` |

---

## Token Refresh

### Flow

```mermaid
sequenceDiagram
    participant FE as Frontend
    participant BE as Backend API
    participant DB as PostgreSQL

    Note over FE: Access token expired
    FE->>BE: POST /api/v1/auth/refresh
    Note over BE: Verify refresh token
    Note over BE: Check token type == "refresh"
    Note over BE: Check user exists and is active
    alt Refresh token valid
        Note over BE: Create new access token (30 min)
        Note over BE: Create new refresh token (7 days)
        BE-->>FE: 200 OK {access_token, refresh_token}
    else Refresh token invalid or expired
        BE-->>FE: 401 Unauthorized
    end
```

### Endpoint

```
POST /api/v1/auth/refresh
```

### Request Body

```json
{
    "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

## Logout

### Flow

```mermaid
sequenceDiagram
    participant FE as Frontend
    participant BE as Backend API
    participant Redis

    FE->>BE: POST /api/v1/auth/logout (Bearer token)
    Note over BE: Extract token from Authorization header
    Note over BE: Verify token (or treat as success if already invalid)
    Note over BE: Calculate remaining TTL
    BE->>Redis: SETEX blacklist:{token} {ttl} "1"
    Redis-->>BE: OK
    BE-->>FE: 200 OK {message: "Logged out successfully"}
    FE->>FE: Clear tokens from localStorage
```

### Token Blacklisting

Logged-out tokens are stored in Redis with a TTL equal to their remaining lifetime:

```python
exp = payload.get("exp", 0)
ttl = max(int(exp - time.time()), 1)
await redis.setex(f"blacklist:{token}", ttl, "1")
```

On every authenticated request, the system checks if the token is blacklisted:

```python
async def is_token_blacklisted(token: str) -> bool:
    return await redis.exists(f"blacklist:{token}") == 1
```

If Redis is unavailable, the system **fails open** (treats the token as not blacklisted) to avoid blocking all authenticated users.

---

## Email Verification

### Flow

```mermaid
sequenceDiagram
    participant User
    participant Email as Email Service
    participant FE as Frontend
    participant BE as Backend API
    participant DB as PostgreSQL

    Note over Email: Send verification link (contains JWT token)
    User->>FE: Clicks verification link in email
    FE->>BE: POST /api/v1/auth/verify-email {token}
    Note over BE: Verify JWT token
    Note over BE: Check token type == "email_verification"
    BE->>DB: UPDATE users SET is_verified = true WHERE id = ?
    BE-->>FE: 200 OK {message: "Email verified successfully"}
```

### Endpoint

```
POST /api/v1/auth/verify-email
```

### Resend Verification

```
POST /api/v1/auth/resend-verification (requires authentication)
```

---

## Password Reset

### Flow

```mermaid
sequenceDiagram
    participant User
    participant FE as Frontend
    participant BE as Backend API
    participant DB as PostgreSQL
    participant Email as Email Service

    User->>FE: Clicks "Forgot Password"
    FE->>BE: POST /api/v1/auth/forgot-password {email}
    BE->>DB: SELECT * FROM users WHERE email = ? AND is_active = true
    alt User found
        BE->>Email: Background task: send reset email with JWT token
    end
    BE-->>FE: 200 OK {message: "If an account exists..."}
    Note over BE: Always returns success (prevents email enumeration)

    User->>FE: Clicks reset link in email
    FE->>BE: POST /api/v1/auth/reset-password {token, new_password}
    Note over BE: Verify reset token
    Note over BE: Validate new password strength
    Note over BE: Hash new password
    BE->>DB: UPDATE users SET password_hash = ? WHERE id = ?
    BE-->>FE: 200 OK {message: "Password reset successfully"}
```

### Endpoints

```
POST /api/v1/auth/forgot-password    # Initiate reset
POST /api/v1/auth/reset-password     # Complete reset
```

### Security Measures

- **Email enumeration prevention**: The forgot-password endpoint always returns success, regardless of whether the email exists
- **Token expiration**: Reset tokens have a limited lifetime
- **Password validation**: New password must meet strength requirements

---

## Token Security Configuration

| Setting | Default | Description |
|---|---|---|
| `SECRET_KEY` | Required (min 32 chars) | JWT signing key |
| `ALGORITHM` | `HS256` | JWT signing algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | Access token lifetime |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `7` | Refresh token lifetime |

### Production Requirements

In production (`environment=production`):
- `SECRET_KEY` must be at least 64 characters
- `ENCRYPTION_KEY` must be at least 64 characters
- `SESSION_COOKIE_SECURE` must be `True`
- `DEBUG` must be `False`
