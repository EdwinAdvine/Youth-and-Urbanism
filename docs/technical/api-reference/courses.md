# Courses API Reference

**Urban Home School (UHS v1) / Urban Bird v1**
*Course Management Endpoints*

Base Path: `/api/v1/courses`
Last Updated: 2026-02-15

---

## Table of Contents

1. [Overview](#overview)
2. [POST /courses/](#post-courses)
3. [GET /courses/](#get-courses)
4. [GET /courses/{course_id}](#get-coursescourse_id)
5. [PUT /courses/{course_id}](#put-coursescourse_id)
6. [DELETE /courses/{course_id}](#delete-coursescourse_id)
7. [POST /courses/{course_id}/enroll](#post-coursescourse_idenroll)
8. [GET /courses/my-enrollments](#get-coursesmy-enrollments)
9. [POST /courses/enrollments/{enrollment_id}/complete-lesson](#post-coursesenrollmentsenrollment_idcomplete-lesson)
10. [POST /courses/enrollments/{enrollment_id}/rate](#post-coursesenrollmentsenrollment_idrate)

---

## Overview

The Courses API manages the full lifecycle of educational courses on the Urban Home School platform. Courses are aligned with Kenya's Competency-Based Curriculum (CBC) and support grade-level filtering, learning area categorization, enrollment management, and progress tracking.

### Revenue Model

| Creator | Revenue Split | Notes |
|---------|--------------|-------|
| Platform (admin-created) | 100% to platform | Created by admin role |
| External Instructor | 60% instructor / 30% platform / 10% marketing | Created by instructor role |

### Course Lifecycle

```
Draft -> Published -> Enrolled -> In Progress -> Completed -> Certificated
                                                       |
                                                       v
                                                    Dropped
```

### CBC Learning Areas

Courses are categorized by CBC learning areas:
- Mathematics
- English
- Kiswahili
- Science and Technology
- Social Studies
- Creative Arts
- Physical and Health Education
- Religious Education
- Agriculture
- Home Science
- Business Studies
- Pre-Technical Studies

---

## POST /courses/

Create a new course. Only users with the `instructor`, `admin`, or `external_instructor` role can create courses.

### Details

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Path** | `/api/v1/courses/` |
| **Auth Required** | Yes (Bearer token, instructor/admin role) |
| **Rate Limit** | 100 requests/minute |

### Request Body

```json
{
  "title": "Grade 7 Mathematics: Fractions and Decimals",
  "description": "A comprehensive course covering fractions, decimals, and their applications in everyday life. Aligned with the CBC Grade 7 Mathematics curriculum.",
  "grade_levels": ["Grade 7", "Grade 8"],
  "learning_area": "Mathematics",
  "syllabus": {
    "strands": [
      {
        "name": "Numbers",
        "sub_strands": [
          {
            "name": "Fractions",
            "competencies": ["Convert between mixed numbers and improper fractions", "Add and subtract fractions"]
          }
        ]
      }
    ]
  },
  "lessons": [
    {
      "id": "lesson-001",
      "title": "Introduction to Fractions",
      "description": "Understanding what fractions are and where we use them",
      "duration_minutes": 30,
      "content_type": "video",
      "order": 1
    },
    {
      "id": "lesson-002",
      "title": "Adding Fractions",
      "description": "Learn to add fractions with like and unlike denominators",
      "duration_minutes": 45,
      "content_type": "interactive",
      "order": 2
    }
  ],
  "price": 500.00,
  "currency": "KES",
  "is_featured": false,
  "thumbnail_url": "https://example.com/thumbnails/math-fractions.jpg"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Course title (max 255 characters) |
| `description` | string | Yes | Course description |
| `grade_levels` | array of strings | Yes | CBC grade levels (e.g., `["Grade 7", "Grade 8"]`) |
| `learning_area` | string | Yes | CBC learning area classification |
| `syllabus` | object (JSONB) | No | Structured CBC-aligned syllabus |
| `lessons` | array (JSONB) | No | Array of lesson objects |
| `price` | decimal | No | Course price (0 for free courses) |
| `currency` | string | No | ISO 4217 currency code (default: `"KES"`) |
| `is_featured` | boolean | No | Whether to feature on homepage (default: `false`) |
| `thumbnail_url` | string | No | Course thumbnail image URL |

### Response (201 Created)

```json
{
  "id": "c1d2e3f4-a5b6-7890-cdef-123456789012",
  "title": "Grade 7 Mathematics: Fractions and Decimals",
  "description": "A comprehensive course covering fractions, decimals, and their applications...",
  "grade_levels": ["Grade 7", "Grade 8"],
  "learning_area": "Mathematics",
  "instructor_id": "550e8400-e29b-41d4-a716-446655440000",
  "price": 500.00,
  "currency": "KES",
  "is_paid": true,
  "is_published": true,
  "is_featured": false,
  "is_platform_created": false,
  "rating": 0.0,
  "total_enrollments": 0,
  "created_at": "2026-02-15T10:00:00.000000",
  "updated_at": "2026-02-15T10:00:00.000000"
}
```

### Error Responses

| Status | Condition | Example |
|--------|-----------|---------|
| `400` | Validation failure | `{"detail": "Invalid grade level"}` |
| `403` | Insufficient role | `{"detail": "Only instructors and admins can create courses"}` |

### cURL Example

```bash
curl -X POST http://localhost:8000/api/v1/courses/ \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Grade 7 Mathematics: Fractions and Decimals",
    "description": "A comprehensive course covering fractions and decimals.",
    "grade_levels": ["Grade 7", "Grade 8"],
    "learning_area": "Mathematics",
    "price": 500.00,
    "currency": "KES"
  }'
```

---

## GET /courses/

List published courses with optional filtering by grade level, learning area, search query, and more. Results are paginated.

### Details

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Path** | `/api/v1/courses/` |
| **Auth Required** | No (public endpoint) |
| **Rate Limit** | 100 requests/minute |

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `skip` | integer | No | `0` | Pagination offset (min: 0) |
| `limit` | integer | No | `20` | Page size (min: 1, max: 100) |
| `grade_level` | string | No | -- | Filter by CBC grade level (e.g., `"Grade 7"`) |
| `learning_area` | string | No | -- | Filter by learning area (e.g., `"Mathematics"`) |
| `is_featured` | boolean | No | -- | Filter for featured courses only |
| `search` | string | No | -- | Full-text search in title and description |
| `instructor_id` | UUID | No | -- | Filter by instructor UUID |

### Response (200 OK)

```json
{
  "courses": [
    {
      "id": "c1d2e3f4-a5b6-7890-cdef-123456789012",
      "title": "Grade 7 Mathematics: Fractions and Decimals",
      "description": "A comprehensive course covering fractions and decimals...",
      "grade_levels": ["Grade 7", "Grade 8"],
      "learning_area": "Mathematics",
      "instructor_id": "550e8400-e29b-41d4-a716-446655440000",
      "price": 500.00,
      "currency": "KES",
      "is_paid": true,
      "is_published": true,
      "is_featured": false,
      "is_platform_created": false,
      "rating": 4.5,
      "total_enrollments": 128,
      "created_at": "2026-02-01T08:00:00.000000",
      "updated_at": "2026-02-10T12:00:00.000000"
    }
  ],
  "total": 42,
  "skip": 0,
  "limit": 20,
  "has_more": true
}
```

| Field | Type | Description |
|-------|------|-------------|
| `courses` | array | Array of course objects |
| `total` | integer | Total number of matching courses |
| `skip` | integer | Current pagination offset |
| `limit` | integer | Current page size |
| `has_more` | boolean | Whether there are more results beyond this page |

### cURL Examples

```bash
# List all courses (first page)
curl "http://localhost:8000/api/v1/courses/"

# Search for math courses for Grade 7
curl "http://localhost:8000/api/v1/courses/?grade_level=Grade%207&learning_area=Mathematics"

# Search by keyword
curl "http://localhost:8000/api/v1/courses/?search=fractions&limit=10"

# Get featured courses
curl "http://localhost:8000/api/v1/courses/?is_featured=true"

# Paginate (second page of 20)
curl "http://localhost:8000/api/v1/courses/?skip=20&limit=20"
```

---

## GET /courses/{course_id}

Get full details of a specific course, including syllabus, lessons, and instructor information.

### Details

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Path** | `/api/v1/courses/{course_id}` |
| **Auth Required** | No (public endpoint) |
| **Rate Limit** | 100 requests/minute |

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `course_id` | UUID | Yes | Course unique identifier |

### Response (200 OK)

```json
{
  "id": "c1d2e3f4-a5b6-7890-cdef-123456789012",
  "title": "Grade 7 Mathematics: Fractions and Decimals",
  "description": "A comprehensive course covering fractions, decimals, and their applications in everyday life.",
  "grade_levels": ["Grade 7", "Grade 8"],
  "learning_area": "Mathematics",
  "instructor_id": "550e8400-e29b-41d4-a716-446655440000",
  "price": 500.00,
  "currency": "KES",
  "is_paid": true,
  "is_published": true,
  "is_featured": false,
  "is_platform_created": false,
  "rating": 4.5,
  "total_enrollments": 128,
  "syllabus": {
    "strands": [
      {
        "name": "Numbers",
        "sub_strands": [
          {
            "name": "Fractions",
            "competencies": [
              "Convert between mixed numbers and improper fractions",
              "Add and subtract fractions"
            ]
          }
        ]
      }
    ]
  },
  "lessons": [
    {
      "id": "lesson-001",
      "title": "Introduction to Fractions",
      "description": "Understanding what fractions are and where we use them",
      "duration_minutes": 30,
      "content_type": "video",
      "order": 1
    },
    {
      "id": "lesson-002",
      "title": "Adding Fractions",
      "description": "Learn to add fractions with like and unlike denominators",
      "duration_minutes": 45,
      "content_type": "interactive",
      "order": 2
    }
  ],
  "created_at": "2026-02-01T08:00:00.000000",
  "updated_at": "2026-02-10T12:00:00.000000"
}
```

### Error Responses

| Status | Condition | Example |
|--------|-----------|---------|
| `404` | Course not found | `{"detail": "Course not found"}` |

### cURL Example

```bash
curl "http://localhost:8000/api/v1/courses/c1d2e3f4-a5b6-7890-cdef-123456789012"
```

---

## PUT /courses/{course_id}

Update an existing course. Only the course instructor (owner) or an admin can perform updates.

### Details

| Property | Value |
|----------|-------|
| **Method** | `PUT` |
| **Path** | `/api/v1/courses/{course_id}` |
| **Auth Required** | Yes (Bearer token, owner or admin role) |
| **Rate Limit** | 100 requests/minute |

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `course_id` | UUID | Yes | Course unique identifier |

### Request Body

All fields are optional (partial update supported):

```json
{
  "title": "Updated: Grade 7 Mathematics",
  "description": "Updated course description with new content.",
  "price": 450.00,
  "is_featured": true,
  "lessons": [
    {
      "id": "lesson-001",
      "title": "Introduction to Fractions (Updated)",
      "description": "Revised introduction with interactive examples",
      "duration_minutes": 35,
      "content_type": "interactive",
      "order": 1
    }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | No | Updated course title |
| `description` | string | No | Updated description |
| `grade_levels` | array | No | Updated CBC grade levels |
| `learning_area` | string | No | Updated learning area |
| `syllabus` | object | No | Updated syllabus (JSONB) |
| `lessons` | array | No | Updated lessons (JSONB) |
| `price` | decimal | No | Updated price |
| `is_featured` | boolean | No | Featured status |
| `is_published` | boolean | No | Published status |

### Response (200 OK)

Returns the updated course object (same structure as `POST /courses/` response).

### Error Responses

| Status | Condition | Example |
|--------|-----------|---------|
| `400` | Validation failure | `{"detail": "Invalid update data"}` |
| `403` | Not owner or admin | `{"detail": "You don't have permission to update this course"}` |
| `404` | Course not found | `{"detail": "Course not found"}` |

### cURL Example

```bash
curl -X PUT http://localhost:8000/api/v1/courses/c1d2e3f4-a5b6-7890-cdef-123456789012 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated: Grade 7 Mathematics",
    "price": 450.00
  }'
```

---

## DELETE /courses/{course_id}

Soft-delete (unpublish) a course. The course is not removed from the database; instead, it is marked as unpublished and hidden from public listings. Only the course instructor (owner) or an admin can delete courses.

### Details

| Property | Value |
|----------|-------|
| **Method** | `DELETE` |
| **Path** | `/api/v1/courses/{course_id}` |
| **Auth Required** | Yes (Bearer token, owner or admin role) |
| **Rate Limit** | 100 requests/minute |

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `course_id` | UUID | Yes | Course unique identifier |

### Response (204 No Content)

No response body. The `204` status code indicates successful deletion.

### Error Responses

| Status | Condition | Example |
|--------|-----------|---------|
| `403` | Not owner or admin | `{"detail": "You don't have permission to delete this course"}` |
| `404` | Course not found | `{"detail": "Course not found"}` |

### cURL Example

```bash
curl -X DELETE http://localhost:8000/api/v1/courses/c1d2e3f4-a5b6-7890-cdef-123456789012 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## POST /courses/{course_id}/enroll

Enroll the current student in a course. For paid courses, a valid `payment_id` must be provided. Free courses allow immediate enrollment.

### Details

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Path** | `/api/v1/courses/{course_id}/enroll` |
| **Auth Required** | Yes (Bearer token, student role) |
| **Rate Limit** | 100 requests/minute |

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `course_id` | UUID | Yes | Course unique identifier |

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `payment_id` | UUID | Conditional | Required for paid courses; the UUID of a completed payment transaction |

### Response (201 Created)

```json
{
  "id": "e1f2a3b4-c5d6-7890-efab-cdef12345678",
  "student_id": "550e8400-e29b-41d4-a716-446655440000",
  "course_id": "c1d2e3f4-a5b6-7890-cdef-123456789012",
  "status": "active",
  "progress": 0.0,
  "completed_lessons": [],
  "total_time_spent_minutes": 0,
  "payment_id": "d4e5f6a7-b8c9-0123-4567-890abcdef012",
  "payment_amount": 500.00,
  "rating": null,
  "review": null,
  "enrolled_at": "2026-02-15T14:00:00.000000",
  "completed_at": null
}
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Enrollment unique identifier |
| `student_id` | UUID | Student's user ID |
| `course_id` | UUID | Course ID |
| `status` | string | Enrollment status: `active`, `completed`, `dropped` |
| `progress` | float | Completion percentage (0.0 to 100.0) |
| `completed_lessons` | array | List of completed lesson IDs |
| `total_time_spent_minutes` | integer | Total learning time in minutes |
| `payment_id` | UUID or null | Associated payment transaction |
| `payment_amount` | decimal or null | Amount paid |
| `rating` | integer or null | Student's rating (1-5) |
| `review` | string or null | Student's review text |
| `enrolled_at` | datetime | Enrollment timestamp |
| `completed_at` | datetime or null | Completion timestamp |

### Error Responses

| Status | Condition | Example |
|--------|-----------|---------|
| `400` | Already enrolled | `{"detail": "Student is already enrolled in this course"}` |
| `400` | Payment required | `{"detail": "Payment required for this course"}` |
| `403` | Not a student | `{"detail": "Only students can enroll in courses"}` |
| `404` | Course not found | `{"detail": "Course not found or not published"}` |

### cURL Examples

```bash
# Enroll in a free course
curl -X POST http://localhost:8000/api/v1/courses/c1d2e3f4-a5b6-7890-cdef-123456789012/enroll \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Enroll in a paid course (with payment ID)
curl -X POST "http://localhost:8000/api/v1/courses/c1d2e3f4-a5b6-7890-cdef-123456789012/enroll?payment_id=d4e5f6a7-b8c9-0123-4567-890abcdef012" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## GET /courses/my-enrollments

Get all course enrollments for the currently authenticated student. Supports filtering by enrollment status.

### Details

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Path** | `/api/v1/courses/my-enrollments` |
| **Auth Required** | Yes (Bearer token, student role) |
| **Rate Limit** | 100 requests/minute |

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `status_filter` | string | No | -- | Filter by status: `active`, `completed`, `dropped` |

### Response (200 OK)

```json
[
  {
    "id": "e1f2a3b4-c5d6-7890-efab-cdef12345678",
    "student_id": "550e8400-e29b-41d4-a716-446655440000",
    "course_id": "c1d2e3f4-a5b6-7890-cdef-123456789012",
    "status": "active",
    "progress": 40.0,
    "completed_lessons": ["lesson-001", "lesson-002"],
    "total_time_spent_minutes": 75,
    "payment_id": "d4e5f6a7-b8c9-0123-4567-890abcdef012",
    "payment_amount": 500.00,
    "rating": null,
    "review": null,
    "enrolled_at": "2026-02-01T08:00:00.000000",
    "completed_at": null
  },
  {
    "id": "f2a3b4c5-d6e7-8901-fabc-def123456789",
    "student_id": "550e8400-e29b-41d4-a716-446655440000",
    "course_id": "a2b3c4d5-e6f7-8901-abcd-ef1234567890",
    "status": "completed",
    "progress": 100.0,
    "completed_lessons": ["lesson-001", "lesson-002", "lesson-003", "lesson-004", "lesson-005"],
    "total_time_spent_minutes": 240,
    "payment_id": null,
    "payment_amount": 0.00,
    "rating": 5,
    "review": "Excellent course! Very clear explanations.",
    "enrolled_at": "2026-01-15T08:00:00.000000",
    "completed_at": "2026-02-10T12:00:00.000000"
  }
]
```

### Error Responses

| Status | Condition | Example |
|--------|-----------|---------|
| `400` | Invalid status filter | `{"detail": "Invalid status filter. Must be one of: ['active', 'completed', 'dropped']"}` |
| `403` | Not a student | `{"detail": "Only students have enrollments"}` |

### cURL Examples

```bash
# Get all enrollments
curl "http://localhost:8000/api/v1/courses/my-enrollments" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Get only active enrollments
curl "http://localhost:8000/api/v1/courses/my-enrollments?status_filter=active" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Get completed enrollments
curl "http://localhost:8000/api/v1/courses/my-enrollments?status_filter=completed" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## POST /courses/enrollments/{enrollment_id}/complete-lesson

Mark a specific lesson as completed within an enrollment and update the student's progress percentage.

### Details

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Path** | `/api/v1/courses/enrollments/{enrollment_id}/complete-lesson` |
| **Auth Required** | Yes (Bearer token, student role) |
| **Rate Limit** | 100 requests/minute |

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `enrollment_id` | UUID | Yes | Enrollment unique identifier |

### Request Body

```json
{
  "lesson_id": "lesson-002",
  "time_spent_minutes": 45
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `lesson_id` | string | Yes | Unique identifier of the completed lesson |
| `time_spent_minutes` | integer | No | Time spent on the lesson in minutes |

### Response (200 OK)

Returns the updated enrollment object with new progress percentage.

```json
{
  "id": "e1f2a3b4-c5d6-7890-efab-cdef12345678",
  "student_id": "550e8400-e29b-41d4-a716-446655440000",
  "course_id": "c1d2e3f4-a5b6-7890-cdef-123456789012",
  "status": "active",
  "progress": 40.0,
  "completed_lessons": ["lesson-001", "lesson-002"],
  "total_time_spent_minutes": 75,
  "enrolled_at": "2026-02-01T08:00:00.000000",
  "completed_at": null
}
```

### Progress Calculation

Progress is calculated as:

```
progress = (number_of_completed_lessons / total_lessons_in_course) * 100
```

When progress reaches 100%, the enrollment status is automatically updated to `completed` and the `completed_at` timestamp is set.

### Error Responses

| Status | Condition | Example |
|--------|-----------|---------|
| `404` | Enrollment not found | `{"detail": "Enrollment not found"}` |
| `500` | Update failure | `{"detail": "Failed to update progress: ..."}` |

### cURL Example

```bash
curl -X POST http://localhost:8000/api/v1/courses/enrollments/e1f2a3b4-c5d6-7890-efab-cdef12345678/complete-lesson \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "lesson_id": "lesson-002",
    "time_spent_minutes": 45
  }'
```

---

## POST /courses/enrollments/{enrollment_id}/rate

Submit a rating and review for a course the student is enrolled in. Students can rate courses on a 1-5 scale and provide optional text reviews.

### Details

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Path** | `/api/v1/courses/enrollments/{enrollment_id}/rate` |
| **Auth Required** | Yes (Bearer token, student role) |
| **Rate Limit** | 100 requests/minute |

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `enrollment_id` | UUID | Yes | Enrollment unique identifier |

### Request Body

```json
{
  "rating": 5,
  "review": "Excellent course! The explanations are very clear and the interactive exercises really helped me understand fractions. I would highly recommend this to other Grade 7 students."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `rating` | integer | Yes | Rating from 1 (poor) to 5 (excellent) |
| `review` | string | No | Optional text review |

### Response (200 OK)

Returns the updated enrollment object with the new rating.

```json
{
  "id": "e1f2a3b4-c5d6-7890-efab-cdef12345678",
  "student_id": "550e8400-e29b-41d4-a716-446655440000",
  "course_id": "c1d2e3f4-a5b6-7890-cdef-123456789012",
  "status": "completed",
  "progress": 100.0,
  "completed_lessons": ["lesson-001", "lesson-002", "lesson-003", "lesson-004", "lesson-005"],
  "total_time_spent_minutes": 240,
  "rating": 5,
  "review": "Excellent course! The explanations are very clear...",
  "enrolled_at": "2026-01-15T08:00:00.000000",
  "completed_at": "2026-02-10T12:00:00.000000"
}
```

### Course Rating Aggregation

When a student submits a rating, the course's aggregate `rating` field is recalculated as the average of all enrollment ratings. The `total_enrollments` count on the course also reflects the number of rated enrollments.

### Error Responses

| Status | Condition | Example |
|--------|-----------|---------|
| `400` | Invalid rating value | `{"detail": "Rating must be between 1 and 5"}` |
| `404` | Enrollment not found | `{"detail": "Enrollment not found"}` |

### cURL Example

```bash
curl -X POST http://localhost:8000/api/v1/courses/enrollments/e1f2a3b4-c5d6-7890-efab-cdef12345678/rate \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "review": "Excellent course! Very clear explanations."
  }'
```

---

## Data Model Reference

### Course Table (`courses`)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `title` | VARCHAR(255) | Course title |
| `description` | TEXT | Course description |
| `grade_levels` | ARRAY(VARCHAR) | CBC grade levels |
| `learning_area` | VARCHAR(100) | CBC learning area |
| `instructor_id` | UUID (FK) | Instructor user ID (null for platform courses) |
| `syllabus` | JSONB | Structured syllabus data |
| `lessons` | JSONB | Array of lesson objects |
| `price` | DECIMAL(10,2) | Course price |
| `currency` | VARCHAR(3) | ISO 4217 currency code |
| `is_paid` | BOOLEAN | Whether course requires payment |
| `is_published` | BOOLEAN | Whether course is visible to students |
| `is_featured` | BOOLEAN | Whether course is featured |
| `is_platform_created` | BOOLEAN | Whether created by admin |
| `rating` | DECIMAL(2,1) | Average rating (1.0-5.0) |
| `total_enrollments` | INTEGER | Number of enrolled students |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |
| `is_deleted` | BOOLEAN | Soft delete flag |

### Enrollment Table (`enrollments`)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `student_id` | UUID (FK) | Student user ID |
| `course_id` | UUID (FK) | Course ID |
| `status` | ENUM | `active`, `completed`, `dropped` |
| `progress` | DECIMAL(5,2) | Completion percentage (0.00-100.00) |
| `completed_lessons` | JSONB | Array of completed lesson IDs |
| `total_time_spent_minutes` | INTEGER | Learning time in minutes |
| `payment_id` | UUID (FK) | Associated payment |
| `payment_amount` | DECIMAL(10,2) | Amount paid |
| `rating` | INTEGER | Student rating (1-5) |
| `review` | TEXT | Student review text |
| `enrolled_at` | TIMESTAMP | Enrollment timestamp |
| `completed_at` | TIMESTAMP | Completion timestamp |
