# Certificates API Reference

> **Base URL:** `/api/v1/certificates`
>
> **Authentication:** Most endpoints require a valid JWT Bearer token. Certificate verification is public.
>
> **Version:** 1.0 &mdash; Urban Home School (The Bird AI)

---

## Table of Contents

1. [List Certificates](#1-list-certificates)
2. [Get Certificate Details](#2-get-certificate-details)
3. [Verify Certificate](#3-verify-certificate)
4. [Download Certificate PDF](#4-download-certificate-pdf)
5. [Error Codes](#error-codes)
6. [Data Models](#data-models)

---

## 1. List Certificates

Retrieve all certificates issued to the authenticated student user.

### Request

```
GET /api/v1/certificates/
```

| Parameter | Location | Type    | Required | Description |
|-----------|----------|---------|----------|-------------|
| `page`    | query    | integer | No       | Page number (default: `1`). |
| `limit`   | query    | integer | No       | Items per page (default: `20`, max: `100`). |

### Headers

| Header          | Value               |
|-----------------|---------------------|
| `Authorization` | `Bearer <token>`    |

### Response `200 OK`

```json
{
  "status": "success",
  "data": {
    "certificates": [
      {
        "id": "cert1a2b-3c4d-5e6f-7890-abcdef123456",
        "serial_number": "UHS-20260210-00042",
        "student_name": "Jane Wanjiku",
        "course_id": "c1d2e3f4-a5b6-7890-cdef-123456789012",
        "course_name": "Grade 7 Mathematics - CBC Aligned",
        "grade": "A",
        "completion_date": "2026-02-10T00:00:00Z",
        "issued_at": "2026-02-10T12:00:00Z",
        "is_valid": true
      },
      {
        "id": "cert2b3c-4d5e-6f78-9012-bcdef1234567",
        "serial_number": "UHS-20260115-00031",
        "student_name": "Jane Wanjiku",
        "course_id": "c2d3e4f5-b6c7-8901-def0-234567890123",
        "course_name": "Introduction to Coding with Scratch",
        "grade": "B+",
        "completion_date": "2026-01-15T00:00:00Z",
        "issued_at": "2026-01-15T14:00:00Z",
        "is_valid": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total_items": 2,
      "total_pages": 1
    }
  }
}
```

### Error Responses

| Status | Description |
|--------|-------------|
| `401 Unauthorized` | Missing or invalid JWT token. |

### cURL Example

```bash
curl -X GET "http://localhost:8000/api/v1/certificates/?page=1&limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 2. Get Certificate Details

Retrieve the full details of a specific certificate.

### Request

```
GET /api/v1/certificates/{certificate_id}
```

| Parameter        | Location | Type          | Required | Description |
|------------------|----------|---------------|----------|-------------|
| `certificate_id` | path     | string (UUID) | Yes      | The unique identifier of the certificate. |

### Headers

| Header          | Value               |
|-----------------|---------------------|
| `Authorization` | `Bearer <token>`    |

### Response `200 OK`

```json
{
  "status": "success",
  "data": {
    "id": "cert1a2b-3c4d-5e6f-7890-abcdef123456",
    "serial_number": "UHS-20260210-00042",
    "student_id": "u1a2b3c4-d5e6-7890-abcd-ef1234567890",
    "student_name": "Jane Wanjiku",
    "course_id": "c1d2e3f4-a5b6-7890-cdef-123456789012",
    "course_name": "Grade 7 Mathematics - CBC Aligned",
    "grade": "A",
    "completion_date": "2026-02-10T00:00:00Z",
    "issued_at": "2026-02-10T12:00:00Z",
    "is_valid": true,
    "revoked_at": null,
    "metadata": {
      "issuer": "Urban Home School",
      "curriculum": "CBC (Competency-Based Curriculum)",
      "learning_area": "Mathematics",
      "grade_level": "Grade 7",
      "total_hours": 120,
      "competencies_achieved": [
        "Number and Operations",
        "Geometry and Measurement",
        "Data Handling and Probability"
      ]
    }
  }
}
```

### Error Responses

| Status | Description |
|--------|-------------|
| `401 Unauthorized` | Missing or invalid JWT token. |
| `403 Forbidden` | Certificate does not belong to the authenticated user (unless user is admin). |
| `404 Not Found` | Certificate not found. |

### cURL Example

```bash
curl -X GET "http://localhost:8000/api/v1/certificates/cert1a2b-3c4d-5e6f-7890-abcdef123456" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 3. Verify Certificate

Publicly verify the authenticity of a certificate using its serial number. **No authentication required.**

This endpoint is designed for employers, schools, and other third parties to validate that a certificate was genuinely issued by Urban Home School and is currently valid.

### Request

```
POST /api/v1/certificates/{certificate_id}/verify
```

| Parameter        | Location | Type          | Required | Description |
|------------------|----------|---------------|----------|-------------|
| `certificate_id` | path     | string (UUID) | Yes      | The certificate to verify. |

### Alternative: Verify by Serial Number

```
POST /api/v1/certificates/verify
```

### Request Body (Alternative)

```json
{
  "serial_number": "UHS-20260210-00042"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `serial_number` | string | Yes | The certificate serial number (format: `UHS-YYYYMMDD-XXXXX`). |

### Response `200 OK` (Valid Certificate)

```json
{
  "status": "success",
  "data": {
    "is_valid": true,
    "serial_number": "UHS-20260210-00042",
    "student_name": "Jane Wanjiku",
    "course_name": "Grade 7 Mathematics - CBC Aligned",
    "grade": "A",
    "completion_date": "2026-02-10T00:00:00Z",
    "issued_at": "2026-02-10T12:00:00Z",
    "issuer": "Urban Home School"
  },
  "message": "Certificate is valid and authentic."
}
```

### Response `200 OK` (Revoked Certificate)

```json
{
  "status": "success",
  "data": {
    "is_valid": false,
    "serial_number": "UHS-20260210-00042",
    "student_name": "Jane Wanjiku",
    "course_name": "Grade 7 Mathematics - CBC Aligned",
    "revoked_at": "2026-02-12T10:00:00Z"
  },
  "message": "This certificate has been revoked."
}
```

### Error Responses

| Status | Description |
|--------|-------------|
| `404 Not Found` | No certificate found with the given ID or serial number. |

### cURL Example

```bash
# Verify by certificate ID (public, no auth required)
curl -X POST "http://localhost:8000/api/v1/certificates/cert1a2b-3c4d-5e6f-7890-abcdef123456/verify"

# Verify by serial number
curl -X POST "http://localhost:8000/api/v1/certificates/verify" \
  -H "Content-Type: application/json" \
  -d '{"serial_number": "UHS-20260210-00042"}'
```

---

## 4. Download Certificate PDF

Download a formatted PDF of the certificate. The PDF includes the student name, course details, grade, completion date, serial number, and a QR code linking to the verification endpoint.

### Request

```
GET /api/v1/certificates/{certificate_id}/download
```

| Parameter        | Location | Type          | Required | Description |
|------------------|----------|---------------|----------|-------------|
| `certificate_id` | path     | string (UUID) | Yes      | The certificate to download. |

### Headers

| Header          | Value               |
|-----------------|---------------------|
| `Authorization` | `Bearer <token>`    |

### Response `200 OK`

The response is a binary PDF file:

| Header | Value |
|--------|-------|
| `Content-Type` | `application/pdf` |
| `Content-Disposition` | `attachment; filename="UHS-20260210-00042.pdf"` |

### Error Responses

| Status | Description |
|--------|-------------|
| `401 Unauthorized` | Missing or invalid JWT token. |
| `403 Forbidden` | Certificate does not belong to the authenticated user (unless user is admin). |
| `404 Not Found` | Certificate not found. |
| `410 Gone` | Certificate has been revoked and is no longer downloadable. |

### cURL Example

```bash
curl -X GET "http://localhost:8000/api/v1/certificates/cert1a2b-3c4d-5e6f-7890-abcdef123456/download" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -o certificate.pdf
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
| `401` | Authentication token missing, expired, or invalid. |
| `403` | User does not own this certificate and is not an admin. |
| `404` | Certificate or serial number not found. |
| `410` | Certificate has been revoked. |
| `500` | Unexpected server error. |

---

## Data Models

### Certificate

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique certificate identifier. |
| `serial_number` | string (max 50) | Unique, publicly verifiable serial number. Format: `UHS-YYYYMMDD-XXXXX`. Indexed. |
| `student_id` | UUID | FK to the student user. Indexed. |
| `student_name` | string (max 200) | Denormalized student name for display. |
| `course_id` | UUID | FK to the completed course. Indexed. |
| `course_name` | string (max 500) | Denormalized course name for display. |
| `grade` | string (max 10) or null | Achievement grade (e.g., "A", "B+", "Pass"). |
| `completion_date` | datetime | When the course was completed. |
| `issued_at` | datetime | When the certificate was issued. Indexed. |
| `is_valid` | boolean | Whether the certificate is currently valid. Indexed. |
| `revoked_at` | datetime or null | When the certificate was revoked (if applicable). |
| `metadata` | JSONB or null | Additional certificate information (issuer, competencies, etc.). |

### Serial Number Format

The serial number follows the pattern `UHS-YYYYMMDD-XXXXX` where:
- `UHS` is the platform prefix (Urban Home School).
- `YYYYMMDD` is the issuance date.
- `XXXXX` is a zero-padded sequential number.

Example: `UHS-20260210-00042` represents the 42nd certificate issued on February 10, 2026.
