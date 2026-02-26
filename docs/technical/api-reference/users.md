# Users API Reference

> **Base URL:** `/api/v1/users`
>
> **Authentication:** All endpoints require a valid JWT Bearer token.
>
> **Version:** 1.0 &mdash; Urban Home School (The Bird AI)

---

## Table of Contents

1. [Get Profile](#1-get-profile)
2. [Update Profile](#2-update-profile)
3. [Change Password](#3-change-password)
4. [Error Codes](#error-codes)
5. [Data Models](#data-models)

---

## 1. Get Profile

Retrieve the authenticated user's profile information, including role-specific data stored in `profile_data`.

### Request

```
GET /api/v1/users/me
```

### Headers

| Header          | Value               |
|-----------------|---------------------|
| `Authorization` | `Bearer <token>`    |

### Response `200 OK`

```json
{
  "status": "success",
  "data": {
    "id": "u1a2b3c4-d5e6-7890-abcd-ef1234567890",
    "email": "jane.wanjiku@example.com",
    "role": "student",
    "is_active": true,
    "is_verified": true,
    "profile_data": {
      "full_name": "Jane Wanjiku",
      "phone_number": "+254712345678",
      "bio": "Grade 7 student at Urban Home School. I love mathematics and science!",
      "grade_level": "Grade 7",
      "avatar_url": "https://cdn.urbanhomeschool.co.ke/avatars/jane-w.webp",
      "date_of_birth": "2014-03-15",
      "county": "Nairobi",
      "learning_interests": ["mathematics", "science", "technology"]
    },
    "created_at": "2025-09-01T08:00:00Z",
    "updated_at": "2026-02-10T14:30:00Z",
    "last_login": "2026-02-15T07:45:00Z"
  }
}
```

### Profile Data by Role

The `profile_data` JSONB field contains role-specific information:

**Student:**
```json
{
  "full_name": "Jane Wanjiku",
  "phone_number": "+254712345678",
  "bio": "...",
  "grade_level": "Grade 7",
  "avatar_url": "...",
  "date_of_birth": "2014-03-15",
  "county": "Nairobi",
  "learning_interests": ["mathematics", "science"]
}
```

**Parent:**
```json
{
  "full_name": "Mary Wanjiku",
  "phone_number": "+254712345678",
  "bio": "...",
  "children_count": 2,
  "county": "Nairobi",
  "occupation": "Teacher"
}
```

**Instructor:**
```json
{
  "full_name": "Mr. John Ochieng",
  "phone_number": "+254712345678",
  "bio": "10 years teaching experience in Mathematics",
  "qualifications": "BSc Mathematics, PGDE",
  "subjects": ["mathematics", "physics"],
  "experience_years": 10,
  "county": "Kisumu"
}
```

### Error Responses

| Status | Description |
|--------|-------------|
| `401 Unauthorized` | Missing or invalid JWT token. |

### cURL Example

```bash
curl -X GET "http://localhost:8000/api/v1/users/me" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 2. Update Profile

Update the authenticated user's profile information. Only the provided fields are updated; all other fields remain unchanged.

### Request

```
PUT /api/v1/users/me
```

### Headers

| Header          | Value               |
|-----------------|---------------------|
| `Authorization` | `Bearer <token>`    |
| `Content-Type`  | `application/json`  |

### Request Body

```json
{
  "full_name": "Jane Wanjiku Kamau",
  "phone_number": "+254712345678",
  "bio": "Grade 7 student passionate about STEM subjects and coding!",
  "grade_level": "Grade 7"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `full_name` | string | No | User's full name (max 200 characters). |
| `phone_number` | string | No | Phone number in international format (max 20 characters). |
| `bio` | string | No | Short biography or personal statement (max 500 characters). |
| `grade_level` | string | No | Student's current grade level (e.g., `Grade 7`, `ECD 2`). Only applicable for student role. |
| `avatar_url` | string | No | URL to profile avatar image (max 500 characters). |
| `county` | string | No | Kenyan county of residence. |
| `date_of_birth` | string | No | Date of birth in `YYYY-MM-DD` format. |
| `learning_interests` | array of strings | No | Student's learning interests (student role only). |

> **Note:** The `email` and `role` fields cannot be updated through this endpoint. Email changes require a separate verification flow. Role changes require admin authorization.

### Response `200 OK`

```json
{
  "status": "success",
  "data": {
    "id": "u1a2b3c4-d5e6-7890-abcd-ef1234567890",
    "email": "jane.wanjiku@example.com",
    "role": "student",
    "profile_data": {
      "full_name": "Jane Wanjiku Kamau",
      "phone_number": "+254712345678",
      "bio": "Grade 7 student passionate about STEM subjects and coding!",
      "grade_level": "Grade 7",
      "avatar_url": "https://cdn.urbanhomeschool.co.ke/avatars/jane-w.webp",
      "date_of_birth": "2014-03-15",
      "county": "Nairobi",
      "learning_interests": ["mathematics", "science", "technology"]
    },
    "updated_at": "2026-02-15T09:00:00Z"
  },
  "message": "Profile updated successfully."
}
```

### Error Responses

| Status | Description |
|--------|-------------|
| `400 Bad Request` | No valid fields provided for update, or invalid field values. |
| `401 Unauthorized` | Missing or invalid JWT token. |
| `422 Unprocessable Entity` | Validation errors (e.g., invalid phone format, invalid date). |

### cURL Example

```bash
curl -X PUT "http://localhost:8000/api/v1/users/me" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Jane Wanjiku Kamau",
    "bio": "Grade 7 student passionate about STEM subjects and coding!"
  }'
```

---

## 3. Change Password

Change the authenticated user's password. Requires the current password for verification.

### Request

```
PUT /api/v1/users/me/password
```

### Headers

| Header          | Value               |
|-----------------|---------------------|
| `Authorization` | `Bearer <token>`    |
| `Content-Type`  | `application/json`  |

### Request Body

```json
{
  "current_password": "MyOldP@ssw0rd!",
  "new_password": "MyN3wS3cur3P@ss!"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `current_password` | string | Yes | The user's current password for verification. |
| `new_password` | string | Yes | The new password. Must meet the following requirements: |

### Password Requirements

- Minimum 8 characters long.
- At least one uppercase letter (A-Z).
- At least one lowercase letter (a-z).
- At least one digit (0-9).
- At least one special character (!@#$%^&*).
- Cannot be the same as the current password.

### Response `200 OK`

```json
{
  "status": "success",
  "message": "Password changed successfully. Please log in again with your new password."
}
```

> **Note:** After a successful password change, all existing JWT tokens for the user are invalidated. The user must log in again to receive a new token.

### Error Responses

| Status | Description |
|--------|-------------|
| `400 Bad Request` | New password does not meet complexity requirements, or new password is the same as current. |
| `401 Unauthorized` | Missing or invalid JWT token, or current password is incorrect. |
| `422 Unprocessable Entity` | Missing required fields. |

### cURL Example

```bash
curl -X PUT "http://localhost:8000/api/v1/users/me/password" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "current_password": "MyOldP@ssw0rd!",
    "new_password": "MyN3wS3cur3P@ss!"
  }'
```

---

## Error Codes

All error responses follow a consistent format:

```json
{
  "status": "error",
  "message": "Human-readable error description.",
  "detail": "Optional technical detail."
}
```

| HTTP Status | Description |
|-------------|-------------|
| `400` | Malformed request body or invalid field values. |
| `401` | Authentication token missing, expired, or invalid. Also returned when current password is incorrect. |
| `422` | Request body is well-formed but semantically invalid. |
| `500` | Unexpected server error. |

---

## Data Models

### User

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique user identifier. Primary key. |
| `email` | string (max 255) | User's email address. Unique. Indexed. |
| `password_hash` | string (max 255) | Bcrypt-hashed password (never exposed in API responses). |
| `role` | string (max 50) | User role: `student`, `parent`, `instructor`, `admin`, `partner`, `staff`. Indexed. |
| `is_active` | boolean | Whether the user account is active. |
| `is_deleted` | boolean | Soft-delete flag. Indexed. |
| `is_verified` | boolean | Whether the user's email has been verified. |
| `profile_data` | JSONB | Flexible role-specific profile fields. |
| `created_at` | datetime | Account creation timestamp. Indexed. |
| `updated_at` | datetime | Last profile update timestamp. |
| `last_login` | datetime or null | Timestamp of the most recent login. |
| `deleted_at` | datetime or null | When the account was soft-deleted. |

### User Roles

| Role | Description |
|------|-------------|
| `student` | Enrolled learners using the platform for education. |
| `parent` | Parent or guardian accounts linked to students. |
| `instructor` | External educators and content creators. |
| `admin` | Platform administrators with full system access. |
| `partner` | External partners and sponsoring organizations. |
| `staff` | Internal platform staff members. |
