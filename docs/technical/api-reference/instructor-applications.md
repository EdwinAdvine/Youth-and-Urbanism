# Instructor Applications API Reference

> **Base URL:** `/api/v1/instructor-applications`
>
> **Authentication:** Varies by endpoint. Application submission requires user authentication. Listing and management require admin authentication.
>
> **Version:** 1.0 &mdash; Urban Home School (The Bird AI)

---

## Table of Contents

1. [Submit Application](#1-submit-application)
2. [Get Application Status](#2-get-application-status)
3. [List Applications (Admin)](#3-list-applications-admin)
4. [Approve Application (Admin)](#4-approve-application-admin)
5. [Reject Application (Admin)](#5-reject-application-admin)
6. [Error Codes](#error-codes)
7. [Data Models](#data-models)

---

## 1. Submit Application

Submit an application to become an instructor on the platform. The applicant must have an existing user account.

### Request

```
POST /api/v1/instructor-applications/apply
```

### Headers

| Header          | Value               |
|-----------------|---------------------|
| `Authorization` | `Bearer <token>`    |
| `Content-Type`  | `application/json`  |

### Request Body

```json
{
  "full_name": "John Ochieng Otieno",
  "email": "john.ochieng@example.com",
  "phone": "+254712345678",
  "qualifications": "BSc Mathematics from University of Nairobi, Postgraduate Diploma in Education (PGDE). Certified by TSC.",
  "experience_years": 10,
  "subjects": ["mathematics", "physics", "computer-science"],
  "bio": "Passionate mathematics educator with 10 years of experience in both primary and secondary schools in Nairobi and Kisumu. Specialize in making complex concepts accessible to all learners.",
  "cv_url": "https://storage.urbanhomeschool.co.ke/uploads/cv-john-ochieng.pdf",
  "id_document_front_url": "https://storage.urbanhomeschool.co.ke/uploads/id-front-john.jpg",
  "id_document_back_url": "https://storage.urbanhomeschool.co.ke/uploads/id-back-john.jpg"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `full_name` | string | Yes | Applicant's full legal name (max 200 characters). |
| `email` | string | Yes | Contact email address (max 200 characters). |
| `phone` | string | No | Phone number in international format (max 50 characters). |
| `qualifications` | string | Yes | Description of academic and professional qualifications. |
| `experience_years` | integer | Yes | Years of teaching experience (minimum: `0`). |
| `subjects` | array of strings | No | List of subjects the applicant can teach. |
| `bio` | string | No | Short biography or personal statement. |
| `cv_url` | string | No | URL to an uploaded CV/resume document (max 500 characters). |
| `id_document_front_url` | string | No | URL to the front of an ID document (max 500 characters). |
| `id_document_back_url` | string | No | URL to the back of an ID document (max 500 characters). |

### Response `201 Created`

```json
{
  "status": "success",
  "data": {
    "id": "app1a2b3-c4d5-6789-0abc-def123456789",
    "user_id": "u1a2b3c4-d5e6-7890-abcd-ef1234567890",
    "full_name": "John Ochieng Otieno",
    "email": "john.ochieng@example.com",
    "status": "pending",
    "created_at": "2026-02-15T10:00:00Z"
  },
  "message": "Application submitted successfully. You will be notified of the review outcome within 5-7 business days."
}
```

### Error Responses

| Status | Description |
|--------|-------------|
| `400 Bad Request` | Missing required fields or invalid data. |
| `401 Unauthorized` | Missing or invalid JWT token. |
| `409 Conflict` | User already has a pending or approved application. |
| `422 Unprocessable Entity` | Validation errors. |

### cURL Example

```bash
curl -X POST "http://localhost:8000/api/v1/instructor-applications/apply" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Ochieng Otieno",
    "email": "john.ochieng@example.com",
    "phone": "+254712345678",
    "qualifications": "BSc Mathematics from University of Nairobi, PGDE.",
    "experience_years": 10,
    "subjects": ["mathematics", "physics"],
    "bio": "Passionate mathematics educator with 10 years of experience."
  }'
```

---

## 2. Get Application Status

Retrieve the status of a specific instructor application. The applicant can view their own application; admins can view any.

### Request

```
GET /api/v1/instructor-applications/{app_id}
```

| Parameter | Location | Type          | Required | Description |
|-----------|----------|---------------|----------|-------------|
| `app_id`  | path     | string (UUID) | Yes      | The application identifier. |

### Headers

| Header          | Value               |
|-----------------|---------------------|
| `Authorization` | `Bearer <token>`    |

### Response `200 OK`

```json
{
  "status": "success",
  "data": {
    "id": "app1a2b3-c4d5-6789-0abc-def123456789",
    "user_id": "u1a2b3c4-d5e6-7890-abcd-ef1234567890",
    "full_name": "John Ochieng Otieno",
    "email": "john.ochieng@example.com",
    "phone": "+254712345678",
    "qualifications": "BSc Mathematics from University of Nairobi, PGDE.",
    "experience_years": 10,
    "subjects": ["mathematics", "physics", "computer-science"],
    "bio": "Passionate mathematics educator with 10 years of experience.",
    "cv_url": "https://storage.urbanhomeschool.co.ke/uploads/cv-john-ochieng.pdf",
    "id_document_front_url": "https://storage.urbanhomeschool.co.ke/uploads/id-front-john.jpg",
    "id_document_back_url": "https://storage.urbanhomeschool.co.ke/uploads/id-back-john.jpg",
    "status": "pending",
    "reviewed_by": null,
    "reviewed_at": null,
    "review_notes": null,
    "created_at": "2026-02-15T10:00:00Z",
    "updated_at": "2026-02-15T10:00:00Z"
  }
}
```

### Error Responses

| Status | Description |
|--------|-------------|
| `401 Unauthorized` | Missing or invalid JWT token. |
| `403 Forbidden` | User does not own this application and is not an admin. |
| `404 Not Found` | Application not found. |

### cURL Example

```bash
curl -X GET "http://localhost:8000/api/v1/instructor-applications/app1a2b3-c4d5-6789-0abc-def123456789" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 3. List Applications (Admin)

Retrieve all instructor applications. **Requires admin role.**

### Request

```
GET /api/v1/instructor-applications/
```

| Parameter | Location | Type    | Required | Description |
|-----------|----------|---------|----------|-------------|
| `status`  | query    | string  | No       | Filter by status: `pending`, `approved`, `rejected`. |
| `page`    | query    | integer | No       | Page number (default: `1`). |
| `limit`   | query    | integer | No       | Items per page (default: `20`, max: `100`). |
| `sort`    | query    | string  | No       | Sort order: `newest` (default), `oldest`. |

### Headers

| Header          | Value               |
|-----------------|---------------------|
| `Authorization` | `Bearer <token>`    |

### Authorization

This endpoint requires the `admin` role.

### Response `200 OK`

```json
{
  "status": "success",
  "data": {
    "applications": [
      {
        "id": "app1a2b3-c4d5-6789-0abc-def123456789",
        "user_id": "u1a2b3c4-d5e6-7890-abcd-ef1234567890",
        "full_name": "John Ochieng Otieno",
        "email": "john.ochieng@example.com",
        "phone": "+254712345678",
        "qualifications": "BSc Mathematics from University of Nairobi, PGDE.",
        "experience_years": 10,
        "subjects": ["mathematics", "physics", "computer-science"],
        "status": "pending",
        "created_at": "2026-02-15T10:00:00Z"
      }
    ],
    "summary": {
      "total": 48,
      "pending": 12,
      "approved": 30,
      "rejected": 6
    },
    "pagination": {
      "page": 1,
      "limit": 20,
      "total_items": 48,
      "total_pages": 3
    }
  }
}
```

### Error Responses

| Status | Description |
|--------|-------------|
| `401 Unauthorized` | Missing or invalid JWT token. |
| `403 Forbidden` | User does not have admin role. |

### cURL Example

```bash
# List all pending applications
curl -X GET "http://localhost:8000/api/v1/instructor-applications/?status=pending&page=1&limit=20" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 4. Approve Application (Admin)

Approve an instructor application. This changes the application status to `approved` and upgrades the user's role to `instructor`. **Requires admin role.**

### Request

```
POST /api/v1/instructor-applications/{app_id}/approve
```

| Parameter | Location | Type          | Required | Description |
|-----------|----------|---------------|----------|-------------|
| `app_id`  | path     | string (UUID) | Yes      | The application to approve. |

### Headers

| Header          | Value               |
|-----------------|---------------------|
| `Authorization` | `Bearer <token>`    |

### Request Body (Optional)

```json
{
  "review_notes": "Excellent qualifications and experience. Approved for Mathematics and Physics courses."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `review_notes` | string | No | Admin notes about the approval decision. |

### Response `200 OK`

```json
{
  "status": "success",
  "data": {
    "id": "app1a2b3-c4d5-6789-0abc-def123456789",
    "status": "approved",
    "reviewed_by": "admin-uuid-here",
    "reviewed_at": "2026-02-16T09:00:00Z",
    "review_notes": "Excellent qualifications and experience. Approved for Mathematics and Physics courses."
  },
  "message": "Application approved. User role has been upgraded to instructor."
}
```

### Side Effects

When an application is approved:
1. The `InstructorApplication.status` is set to `approved`.
2. The applicant's `User.role` is updated to `instructor`.
3. An `InstructorProfile` record is created for the user.
4. A notification is sent to the applicant informing them of the approval.

### Error Responses

| Status | Description |
|--------|-------------|
| `401 Unauthorized` | Missing or invalid JWT token. |
| `403 Forbidden` | User does not have admin role. |
| `404 Not Found` | Application not found. |
| `409 Conflict` | Application has already been approved or rejected. |

### cURL Example

```bash
curl -X POST "http://localhost:8000/api/v1/instructor-applications/app1a2b3-c4d5-6789-0abc-def123456789/approve" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"review_notes": "Excellent qualifications. Approved for Mathematics and Physics."}'
```

---

## 5. Reject Application (Admin)

Reject an instructor application with a reason. **Requires admin role.**

### Request

```
POST /api/v1/instructor-applications/{app_id}/reject
```

| Parameter | Location | Type          | Required | Description |
|-----------|----------|---------------|----------|-------------|
| `app_id`  | path     | string (UUID) | Yes      | The application to reject. |

### Headers

| Header          | Value               |
|-----------------|---------------------|
| `Authorization` | `Bearer <token>`    |
| `Content-Type`  | `application/json`  |

### Request Body

```json
{
  "reason": "We require a minimum of 3 years of teaching experience for instructor positions. Please reapply once you have gained more experience."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `reason` | string | Yes | The reason for rejection. This will be communicated to the applicant. |

### Response `200 OK`

```json
{
  "status": "success",
  "data": {
    "id": "app1a2b3-c4d5-6789-0abc-def123456789",
    "status": "rejected",
    "reviewed_by": "admin-uuid-here",
    "reviewed_at": "2026-02-16T09:30:00Z",
    "review_notes": "We require a minimum of 3 years of teaching experience for instructor positions. Please reapply once you have gained more experience."
  },
  "message": "Application rejected. The applicant has been notified."
}
```

### Side Effects

When an application is rejected:
1. The `InstructorApplication.status` is set to `rejected`.
2. A notification is sent to the applicant with the rejection reason.
3. The applicant's user role remains unchanged.

### Error Responses

| Status | Description |
|--------|-------------|
| `400 Bad Request` | Missing `reason` field. |
| `401 Unauthorized` | Missing or invalid JWT token. |
| `403 Forbidden` | User does not have admin role. |
| `404 Not Found` | Application not found. |
| `409 Conflict` | Application has already been approved or rejected. |

### cURL Example

```bash
curl -X POST "http://localhost:8000/api/v1/instructor-applications/app1a2b3-c4d5-6789-0abc-def123456789/reject" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"reason": "We require a minimum of 3 years of teaching experience."}'
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
| `400` | Missing required fields. |
| `401` | Authentication token missing, expired, or invalid. |
| `403` | Insufficient permissions. |
| `404` | Application not found. |
| `409` | Conflict (duplicate application or already reviewed). |
| `422` | Validation errors. |
| `500` | Unexpected server error. |

---

## Data Models

### InstructorApplication

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique application identifier. |
| `user_id` | UUID or null | FK to existing user account. Indexed. |
| `full_name` | string (max 200) | Applicant's legal name. |
| `email` | string (max 200) | Contact email. Indexed. |
| `phone` | string (max 50) or null | Phone number. |
| `qualifications` | text | Academic/professional qualifications. |
| `experience_years` | integer | Years of teaching experience. |
| `subjects` | JSONB array or null | List of subjects the applicant can teach. |
| `bio` | text or null | Personal statement. |
| `cv_url` | string (max 500) or null | URL to uploaded CV. |
| `id_document_front_url` | string (max 500) or null | URL to ID front. |
| `id_document_back_url` | string (max 500) or null | URL to ID back. |
| `status` | string (max 20) | Application status: `pending`, `approved`, `rejected`. Indexed. |
| `reviewed_by` | UUID or null | FK to the admin who reviewed. |
| `reviewed_at` | datetime or null | Review timestamp. |
| `review_notes` | text or null | Admin notes. |
| `created_at` | datetime | Submission timestamp. Indexed. |
| `updated_at` | datetime | Last modification timestamp. |

### Application Workflow

```
[Submitted] --> [Pending] --> [Under Review] --> [Approved] --> Instructor role granted
                                             --> [Rejected] --> Applicant notified
```
