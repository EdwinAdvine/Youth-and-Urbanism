# Contact API Reference

> **Base URL:** `/api/v1/contact`
>
> **Authentication:** The submission endpoint is public. The admin listing endpoint requires admin-level authentication.
>
> **Version:** 1.0 &mdash; Urban Home School (The Bird AI)

---

## Table of Contents

1. [Submit Contact Form](#1-submit-contact-form)
2. [Get Submissions (Admin)](#2-get-submissions-admin)
3. [Error Codes](#error-codes)
4. [Data Models](#data-models)

---

## 1. Submit Contact Form

Submit a contact form message. This endpoint is public and does not require authentication. Messages are stored in the database for admin review.

### Request

```
POST /api/v1/contact/
```

### Headers

| Header         | Value              |
|----------------|--------------------|
| `Content-Type` | `application/json` |

### Request Body

```json
{
  "name": "Grace Mwangi",
  "email": "grace.mwangi@example.com",
  "subject": "Inquiry about Grade 5 Enrollment",
  "message": "Hello, I would like to know more about enrolling my daughter in the Grade 5 program. What courses are available and what is the fee structure? Thank you."
}
```

| Field     | Type   | Required | Description |
|-----------|--------|----------|-------------|
| `name`    | string | Yes      | Sender's full name (max 200 characters). |
| `email`   | string | Yes      | Sender's email address (max 200 characters). Must be a valid email format. |
| `subject` | string | Yes      | Message subject line (max 500 characters). |
| `message` | string | Yes      | Full message body text. |

### Response `201 Created`

```json
{
  "status": "success",
  "data": {
    "id": "msg1a2b3-c4d5-6789-0abc-def123456789",
    "name": "Grace Mwangi",
    "email": "grace.mwangi@example.com",
    "subject": "Inquiry about Grade 5 Enrollment",
    "created_at": "2026-02-15T10:30:00Z"
  },
  "message": "Your message has been submitted successfully. We will respond within 24-48 hours."
}
```

### Error Responses

| Status | Description |
|--------|-------------|
| `400 Bad Request` | Missing required fields. |
| `422 Unprocessable Entity` | Invalid email format or field validation errors. |
| `429 Too Many Requests` | Rate limit exceeded. Maximum 5 submissions per IP per hour. |

### Rate Limiting

To prevent abuse, contact form submissions are rate-limited:

| Limit | Description |
|-------|-------------|
| 5 per hour per IP | Maximum submissions from a single IP address. |
| 20 per day per email | Maximum submissions from a single email address. |

### cURL Example

```bash
curl -X POST "http://localhost:8000/api/v1/contact/" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Grace Mwangi",
    "email": "grace.mwangi@example.com",
    "subject": "Inquiry about Grade 5 Enrollment",
    "message": "Hello, I would like to know more about enrolling my daughter in the Grade 5 program."
  }'
```

---

## 2. Get Submissions (Admin)

Retrieve all contact form submissions. **Requires admin role authentication.**

### Request

```
GET /api/v1/contact/submissions
```

| Parameter | Location | Type    | Required | Description |
|-----------|----------|---------|----------|-------------|
| `page`    | query    | integer | No       | Page number (default: `1`). |
| `limit`   | query    | integer | No       | Items per page (default: `20`, max: `100`). |
| `is_read` | query    | boolean | No       | Filter by read status. `true` for read, `false` for unread. Omit for all. |
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
    "submissions": [
      {
        "id": "msg1a2b3-c4d5-6789-0abc-def123456789",
        "name": "Grace Mwangi",
        "email": "grace.mwangi@example.com",
        "subject": "Inquiry about Grade 5 Enrollment",
        "message": "Hello, I would like to know more about enrolling my daughter in the Grade 5 program. What courses are available and what is the fee structure? Thank you.",
        "is_read": false,
        "read_at": null,
        "replied_at": null,
        "reply_message": null,
        "created_at": "2026-02-15T10:30:00Z"
      },
      {
        "id": "msg2b3c4-d5e6-7890-1abc-ef1234567890",
        "name": "John Otieno",
        "email": "john.otieno@example.com",
        "subject": "Partnership Inquiry",
        "message": "We are a local NGO and would like to explore partnership opportunities with Urban Home School for our community program.",
        "is_read": true,
        "read_at": "2026-02-14T16:00:00Z",
        "replied_at": "2026-02-14T17:30:00Z",
        "reply_message": "Thank you for your interest in partnering with us. Please visit our partnerships page or contact partnerships@urbanhomeschool.co.ke.",
        "created_at": "2026-02-14T12:00:00Z"
      }
    ],
    "summary": {
      "total_submissions": 156,
      "unread_count": 12,
      "replied_count": 132
    },
    "pagination": {
      "page": 1,
      "limit": 20,
      "total_items": 156,
      "total_pages": 8
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
# Get unread contact submissions
curl -X GET "http://localhost:8000/api/v1/contact/submissions?is_read=false&page=1&limit=20" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
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
| `403` | User does not have admin role. |
| `422` | Validation errors (e.g., invalid email). |
| `429` | Rate limit exceeded for contact submissions. |
| `500` | Unexpected server error. |

---

## Data Models

### ContactMessage

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique message identifier. |
| `name` | string (max 200) | Sender's full name. |
| `email` | string (max 200) | Sender's email address. |
| `subject` | string (max 500) | Message subject line. |
| `message` | text | Full message body. |
| `is_read` | boolean | Whether an admin has read the message. Indexed. |
| `read_at` | datetime or null | When the message was first read by an admin. |
| `replied_at` | datetime or null | When an admin reply was sent. |
| `reply_message` | text or null | Admin's reply text. |
| `created_at` | datetime | Submission timestamp. Indexed. |
