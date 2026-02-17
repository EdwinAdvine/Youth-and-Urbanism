# Assessments API Reference

> **Base URL:** `/api/v1/assessments`
>
> **Authentication:** All endpoints require a valid JWT Bearer token unless otherwise noted.
>
> **Version:** 1.0 &mdash; Urban Home School (The Bird AI)

---

## Table of Contents

1. [List Assessments](#1-list-assessments)
2. [Get Assessment](#2-get-assessment)
3. [Submit Assessment](#3-submit-assessment)
4. [Get Graded Submission](#4-get-graded-submission)
5. [Get My Submissions](#5-get-my-submissions)
6. [Error Codes](#error-codes)
7. [Data Models](#data-models)

---

## 1. List Assessments

Retrieve a paginated list of assessments. Optionally filter by assessment type or course.

### Request

```
GET /api/v1/assessments/
```

| Parameter | Location | Type   | Required | Description |
|-----------|----------|--------|----------|-------------|
| `type`    | query    | string | No       | Filter by assessment type. Allowed values: `quiz`, `assignment`, `project`, `exam`. |
| `course_id` | query | string (UUID) | No | Filter assessments belonging to a specific course. |
| `page`    | query    | integer | No      | Page number (default: `1`). |
| `limit`   | query    | integer | No      | Items per page (default: `20`, max: `100`). |

### Headers

| Header          | Value               |
|-----------------|---------------------|
| `Authorization` | `Bearer <token>`    |
| `Content-Type`  | `application/json`  |

### Response `200 OK`

```json
{
  "status": "success",
  "data": {
    "assessments": [
      {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "course_id": "c1d2e3f4-a5b6-7890-cdef-123456789012",
        "title": "Grade 4 Mathematics - Fractions Quiz",
        "description": "Test your understanding of fractions, equivalent fractions, and ordering.",
        "assessment_type": "quiz",
        "total_points": 50,
        "passing_score": 30,
        "auto_gradable": true,
        "duration_minutes": 30,
        "max_attempts": 3,
        "is_published": true,
        "available_from": "2026-02-01T08:00:00Z",
        "available_until": "2026-03-01T23:59:59Z",
        "total_submissions": 142,
        "average_score": 38.75,
        "created_at": "2026-01-15T10:30:00Z",
        "updated_at": "2026-02-10T14:22:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total_items": 45,
      "total_pages": 3
    }
  }
}
```

### Error Responses

| Status | Description |
|--------|-------------|
| `401 Unauthorized` | Missing or invalid JWT token. |
| `422 Unprocessable Entity` | Invalid query parameters (e.g., unknown assessment type). |

### cURL Example

```bash
# List all quizzes for a specific course
curl -X GET "http://localhost:8000/api/v1/assessments/?type=quiz&course_id=c1d2e3f4-a5b6-7890-cdef-123456789012&page=1&limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

---

## 2. Get Assessment

Retrieve a single assessment by ID, including its full question set.

### Request

```
GET /api/v1/assessments/{assessment_id}
```

| Parameter       | Location | Type          | Required | Description |
|-----------------|----------|---------------|----------|-------------|
| `assessment_id` | path     | string (UUID) | Yes      | The unique identifier of the assessment. |

### Headers

| Header          | Value               |
|-----------------|---------------------|
| `Authorization` | `Bearer <token>`    |

### Response `200 OK`

```json
{
  "status": "success",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "course_id": "c1d2e3f4-a5b6-7890-cdef-123456789012",
    "creator_id": "d4e5f6a7-b8c9-0123-4567-890abcdef123",
    "title": "Grade 4 Mathematics - Fractions Quiz",
    "description": "Test your understanding of fractions, equivalent fractions, and ordering.",
    "assessment_type": "quiz",
    "total_points": 50,
    "passing_score": 30,
    "auto_gradable": true,
    "duration_minutes": 30,
    "max_attempts": 3,
    "is_published": true,
    "available_from": "2026-02-01T08:00:00Z",
    "available_until": "2026-03-01T23:59:59Z",
    "questions": [
      {
        "id": "q1",
        "type": "multiple_choice",
        "question": "What is 1/2 + 1/4?",
        "options": ["1/4", "2/4", "3/4", "1/6"],
        "points": 10
      },
      {
        "id": "q2",
        "type": "true_false",
        "question": "3/6 is equivalent to 1/2.",
        "points": 5
      },
      {
        "id": "q3",
        "type": "essay",
        "question": "Explain how you would compare 2/3 and 3/4 using a number line.",
        "points": 15
      }
    ],
    "total_submissions": 142,
    "average_score": 38.75,
    "created_at": "2026-01-15T10:30:00Z",
    "updated_at": "2026-02-10T14:22:00Z"
  }
}
```

> **Note:** The `correct_answer` field in each question object is **excluded** from the response to prevent answer leakage. It is only used server-side for auto-grading.

### Error Responses

| Status | Description |
|--------|-------------|
| `401 Unauthorized` | Missing or invalid JWT token. |
| `404 Not Found` | Assessment with the given ID does not exist. |

### cURL Example

```bash
curl -X GET "http://localhost:8000/api/v1/assessments/a1b2c3d4-e5f6-7890-abcd-ef1234567890" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 3. Submit Assessment

Submit answers for an assessment. Creates a new submission record. For auto-gradable assessments (multiple choice, true/false), scores are calculated immediately. Essay and project submissions are queued for manual grading.

### Request

```
POST /api/v1/assessments/{assessment_id}/submit
```

| Parameter       | Location | Type          | Required | Description |
|-----------------|----------|---------------|----------|-------------|
| `assessment_id` | path     | string (UUID) | Yes      | The assessment to submit answers for. |

### Headers

| Header          | Value               |
|-----------------|---------------------|
| `Authorization` | `Bearer <token>`    |
| `Content-Type`  | `application/json`  |

### Request Body

```json
{
  "answers": [
    {
      "question_id": "q1",
      "selected_option": "3/4"
    },
    {
      "question_id": "q2",
      "selected_option": "true"
    },
    {
      "question_id": "q3",
      "text_answer": "To compare 2/3 and 3/4 using a number line, I would first find a common denominator..."
    }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `answers` | array | Yes | Array of answer objects. |
| `answers[].question_id` | string | Yes | The ID of the question being answered. Must match a question in the assessment. |
| `answers[].selected_option` | string | Conditional | The selected answer for multiple choice or true/false questions. Required when the question type is `multiple_choice` or `true_false`. |
| `answers[].text_answer` | string | Conditional | Free-text response for essay questions. Required when the question type is `essay`. |

### Response `201 Created`

```json
{
  "status": "success",
  "data": {
    "submission_id": "s1a2b3c4-d5e6-7890-abcd-ef1234567890",
    "assessment_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "student_id": "st1a2b3c-4d5e-6789-0abc-def123456789",
    "attempt_number": 1,
    "is_submitted": true,
    "is_graded": true,
    "score": 15,
    "total_points": 50,
    "percentage": 30.0,
    "passed": false,
    "feedback": "You scored 15 out of 50. Review fractions addition before retaking.",
    "submitted_at": "2026-02-15T09:45:00Z",
    "graded_at": "2026-02-15T09:45:01Z"
  },
  "message": "Assessment submitted successfully."
}
```

> **Note:** If the assessment contains essay questions, `is_graded` will be `false` and `score` will be `null` until an instructor grades the submission manually.

### Error Responses

| Status | Description |
|--------|-------------|
| `400 Bad Request` | Missing or invalid answers, or assessment is not currently available. |
| `401 Unauthorized` | Missing or invalid JWT token. |
| `403 Forbidden` | Student is not enrolled in the course, or maximum attempts exceeded. |
| `404 Not Found` | Assessment not found. |
| `409 Conflict` | A timed assessment session has expired. |
| `422 Unprocessable Entity` | Answer format does not match question type. |

### cURL Example

```bash
curl -X POST "http://localhost:8000/api/v1/assessments/a1b2c3d4-e5f6-7890-abcd-ef1234567890/submit" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "answers": [
      {"question_id": "q1", "selected_option": "3/4"},
      {"question_id": "q2", "selected_option": "true"},
      {"question_id": "q3", "text_answer": "To compare 2/3 and 3/4 using a number line..."}
    ]
  }'
```

---

## 4. Get Graded Submission

Retrieve the graded result for a specific assessment submission.

### Request

```
GET /api/v1/assessments/{assessment_id}/grade
```

| Parameter       | Location | Type          | Required | Description |
|-----------------|----------|---------------|----------|-------------|
| `assessment_id` | path     | string (UUID) | Yes      | The assessment to retrieve the graded submission for. |

### Headers

| Header          | Value               |
|-----------------|---------------------|
| `Authorization` | `Bearer <token>`    |

### Response `200 OK`

```json
{
  "status": "success",
  "data": {
    "submission_id": "s1a2b3c4-d5e6-7890-abcd-ef1234567890",
    "assessment_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "assessment_title": "Grade 4 Mathematics - Fractions Quiz",
    "student_id": "st1a2b3c-4d5e-6789-0abc-def123456789",
    "attempt_number": 1,
    "is_graded": true,
    "score": 40,
    "total_points": 50,
    "percentage": 80.0,
    "passed": true,
    "passing_score": 30,
    "feedback": "Great work! You demonstrated strong understanding of fractions.",
    "graded_by": "d4e5f6a7-b8c9-0123-4567-890abcdef123",
    "answers": {
      "q1": {
        "selected_option": "3/4",
        "correct": true,
        "points_earned": 10,
        "points_possible": 10
      },
      "q2": {
        "selected_option": "true",
        "correct": true,
        "points_earned": 5,
        "points_possible": 5
      },
      "q3": {
        "text_answer": "To compare 2/3 and 3/4 using a number line...",
        "points_earned": 12,
        "points_possible": 15,
        "instructor_feedback": "Good explanation but you missed the step of converting to equivalent fractions."
      }
    },
    "started_at": "2026-02-15T09:15:00Z",
    "submitted_at": "2026-02-15T09:45:00Z",
    "graded_at": "2026-02-15T14:30:00Z"
  }
}
```

### Error Responses

| Status | Description |
|--------|-------------|
| `401 Unauthorized` | Missing or invalid JWT token. |
| `404 Not Found` | No submission found for this assessment and the authenticated student. |

### cURL Example

```bash
curl -X GET "http://localhost:8000/api/v1/assessments/a1b2c3d4-e5f6-7890-abcd-ef1234567890/grade" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 5. Get My Submissions

Retrieve all assessment submissions for the authenticated student, across all courses.

### Request

```
GET /api/v1/assessments/my-submissions
```

| Parameter | Location | Type    | Required | Description |
|-----------|----------|---------|----------|-------------|
| `page`    | query    | integer | No       | Page number (default: `1`). |
| `limit`   | query    | integer | No       | Items per page (default: `20`, max: `100`). |
| `is_graded` | query | boolean | No       | Filter by grading status. |
| `course_id` | query | string (UUID) | No | Filter submissions for a specific course. |

### Headers

| Header          | Value               |
|-----------------|---------------------|
| `Authorization` | `Bearer <token>`    |

### Response `200 OK`

```json
{
  "status": "success",
  "data": {
    "submissions": [
      {
        "submission_id": "s1a2b3c4-d5e6-7890-abcd-ef1234567890",
        "assessment_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "assessment_title": "Grade 4 Mathematics - Fractions Quiz",
        "assessment_type": "quiz",
        "course_id": "c1d2e3f4-a5b6-7890-cdef-123456789012",
        "course_title": "Grade 4 Mathematics",
        "attempt_number": 1,
        "is_graded": true,
        "score": 40,
        "total_points": 50,
        "percentage": 80.0,
        "passed": true,
        "submitted_at": "2026-02-15T09:45:00Z",
        "graded_at": "2026-02-15T14:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total_items": 12,
      "total_pages": 1
    }
  }
}
```

### Error Responses

| Status | Description |
|--------|-------------|
| `401 Unauthorized` | Missing or invalid JWT token. |
| `403 Forbidden` | Only students can access their own submissions. |

### cURL Example

```bash
curl -X GET "http://localhost:8000/api/v1/assessments/my-submissions?page=1&limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Error Codes

All error responses follow a consistent format:

```json
{
  "status": "error",
  "message": "Human-readable error description.",
  "detail": "Optional technical detail for debugging."
}
```

| HTTP Status | Code | Description |
|-------------|------|-------------|
| `400` | `BAD_REQUEST` | Malformed request body or invalid field values. |
| `401` | `UNAUTHORIZED` | Authentication token missing, expired, or invalid. |
| `403` | `FORBIDDEN` | User does not have permission for this action. |
| `404` | `NOT_FOUND` | Requested resource does not exist. |
| `409` | `CONFLICT` | Request conflicts with current state (e.g., timed out assessment). |
| `422` | `UNPROCESSABLE_ENTITY` | Request body is well-formed but semantically invalid. |
| `429` | `TOO_MANY_REQUESTS` | Rate limit exceeded. Retry after the indicated period. |
| `500` | `INTERNAL_SERVER_ERROR` | Unexpected server error. |

---

## Data Models

### Assessment

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique assessment identifier. |
| `course_id` | UUID | FK to the course this assessment belongs to. |
| `creator_id` | UUID | FK to the user who created the assessment. |
| `title` | string (max 200) | Assessment title. |
| `description` | text | Optional description. |
| `assessment_type` | string | One of: `quiz`, `assignment`, `project`, `exam`. |
| `questions` | JSONB array | Array of question objects (see below). |
| `total_points` | integer | Maximum achievable points. |
| `passing_score` | integer | Minimum points required to pass. |
| `auto_gradable` | boolean | Whether the assessment can be auto-graded. |
| `duration_minutes` | integer or null | Time limit in minutes. Null for untimed. |
| `max_attempts` | integer | Maximum allowed submission attempts (default: 1). |
| `is_published` | boolean | Whether the assessment is visible to students. |
| `available_from` | datetime or null | Start of availability window. |
| `available_until` | datetime or null | End of availability window. |
| `total_submissions` | integer | Count of all submissions received. |
| `average_score` | decimal | Running average score across all graded submissions. |
| `created_at` | datetime | Record creation timestamp. |
| `updated_at` | datetime | Last modification timestamp. |

### Question Object (within `questions` JSONB)

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique question identifier within the assessment. |
| `type` | string | One of: `multiple_choice`, `true_false`, `essay`. |
| `question` | string | The question text. |
| `options` | array of strings | Answer options (for `multiple_choice` type). |
| `correct_answer` | any | Correct answer (server-side only; never sent to clients). |
| `points` | integer | Points awarded for a correct answer. |

### AssessmentSubmission

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique submission identifier. |
| `assessment_id` | UUID | FK to the assessment. |
| `student_id` | UUID | FK to the student who submitted. |
| `answers` | JSONB | Map of `question_id` to answer data. |
| `score` | integer or null | Total score (null until graded). |
| `is_graded` | boolean | Whether the submission has been graded. |
| `graded_by` | UUID or null | FK to the user who graded (null for auto-graded). |
| `feedback` | text or null | Grading feedback. |
| `is_submitted` | boolean | Whether the submission is finalized. |
| `attempt_number` | integer | The attempt number for this submission. |
| `started_at` | datetime or null | When the student started the assessment. |
| `submitted_at` | datetime or null | When the student submitted their answers. |
| `graded_at` | datetime or null | When the submission was graded. |
| `created_at` | datetime | Record creation timestamp. |
| `updated_at` | datetime | Last modification timestamp. |
