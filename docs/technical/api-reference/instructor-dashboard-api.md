# Instructor Dashboard API Reference

**Base URL:** `http://localhost:8000/api/v1/instructor`
**Authentication:** Bearer JWT token required on all endpoints
**Required Role:** `instructor`

All endpoints enforce role-based access control via the `require_role(["instructor"])` dependency. Requests from non-instructor roles receive a `403 Forbidden` response.

---

## Table of Contents

- [Dashboard](#dashboard)
  - [GET /instructor/dashboard/overview](#get-instructordashboardoverview)
- [Courses](#courses)
  - [GET /instructor/courses](#get-instructorcourses)
  - [POST /instructor/courses](#post-instructorcourses)
  - [PUT /instructor/courses/{id}](#put-instructorcoursesid)
- [Assessments](#assessments)
  - [GET /instructor/assessments](#get-instructorassessments)
  - [POST /instructor/assessments](#post-instructorassessments)
- [Sessions](#sessions)
  - [GET /instructor/sessions](#get-instructorsessions)
  - [POST /instructor/sessions](#post-instructorsessions)
- [Interactions](#interactions)
  - [GET /instructor/interactions](#get-instructorinteractions)
- [Impact](#impact)
  - [GET /instructor/impact](#get-instructorimpact)
- [AI Insights](#ai-insights)
  - [GET /instructor/insights/daily](#get-instructorinsightsdaily)
- [Earnings](#earnings)
  - [GET /instructor/earnings](#get-instructorearnings)
  - [GET /instructor/earnings/payouts](#get-instructorearningspayouts)
  - [POST /instructor/earnings/payout](#post-instructorearningspayout)
- [Hub / Resources](#hub--resources)
  - [GET /instructor/hub/resources](#get-instructorhubresources)
- [Account](#account)
  - [GET /instructor/account/profile](#get-instructoraccountprofile)
  - [PUT /instructor/account/profile](#put-instructoraccountprofile)

---

## Dashboard

### GET /instructor/dashboard/overview

Get the complete instructor dashboard overview including statistics, upcoming sessions, pending submissions, AI-flagged students, and quick action suggestions.

**Authentication:** Bearer token (instructor role required)

**Response 200:**

```json
{
  "stats": {
    "total_students": 156,
    "active_students_today": 42,
    "total_courses": 8,
    "published_courses": 6,
    "draft_courses": 2,
    "pending_submissions": 12,
    "average_rating": 4.7,
    "total_revenue": 125000
  },
  "upcoming_sessions": [
    {
      "id": "session-001",
      "title": "Grade 5 Math - Fractions Review",
      "scheduled_at": "2026-02-16T10:00:00Z",
      "duration_minutes": 45,
      "enrolled_count": 28,
      "status": "upcoming"
    }
  ],
  "pending_submissions": [
    {
      "id": "sub-001",
      "student_name": "Amani K.",
      "course_title": "CBC Mathematics Grade 5",
      "assignment_title": "Fractions Quiz",
      "submitted_at": "2026-02-15T14:00:00Z",
      "priority": "normal"
    }
  ],
  "ai_flagged_students": [
    {
      "student_id": "student-010",
      "student_name": "Zuri A.",
      "flag_type": "declining_performance",
      "description": "Science scores dropped 20% over the last 2 weeks",
      "recommended_action": "Schedule a 1-on-1 check-in session"
    }
  ],
  "quick_actions": [
    {
      "type": "grade_submissions",
      "label": "Grade 12 pending submissions",
      "count": 12,
      "url": "/instructor/assessments?status=pending"
    },
    {
      "type": "upcoming_session",
      "label": "Next session in 2 hours",
      "url": "/instructor/sessions/session-001"
    }
  ]
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/instructor/dashboard/overview" \
  -H "Authorization: Bearer <token>"
```

---

## Courses

### GET /instructor/courses

Get a paginated list of the instructor's courses with filtering and sorting options.

**Authentication:** Bearer token (instructor role required)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Results per page (max 100) |
| `status` | string | - | Filter: `draft`, `published`, `archived` |
| `search` | string | - | Search by course title |
| `sort_by` | string | `created_at` | Sort: `created_at`, `title`, `students`, `rating` |
| `sort_order` | string | `desc` | Sort order: `asc`, `desc` |

**Response 200:**

```json
{
  "courses": [
    {
      "id": "course-001",
      "title": "CBC Mathematics Grade 5",
      "description": "Comprehensive math course aligned with Kenya's CBC curriculum",
      "status": "published",
      "grade_levels": [5],
      "learning_area": "Mathematics",
      "price": 1500,
      "currency": "KES",
      "rating": 4.8,
      "enrollment_count": 89,
      "total_lessons": 20,
      "total_modules": 5,
      "completion_rate": 72,
      "revenue": 45000,
      "created_at": "2025-10-01T00:00:00Z",
      "updated_at": "2026-02-10T12:00:00Z",
      "thumbnail_url": "/courses/math-5-thumb.png"
    }
  ],
  "total": 8,
  "page": 1,
  "limit": 20,
  "pages": 1
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/instructor/courses?status=published&sort_by=rating" \
  -H "Authorization: Bearer <token>"
```

---

### POST /instructor/courses

Create a new course.

**Authentication:** Bearer token (instructor role required)

**Request Body:**

```json
{
  "title": "Kiswahili for Grade 4",
  "description": "An engaging Kiswahili course covering reading, writing, and conversation skills aligned with CBC Grade 4 standards.",
  "grade_levels": [4],
  "learning_area": "Kiswahili",
  "price": 1200,
  "currency": "KES",
  "modules": [
    {
      "title": "Module 1: Greetings and Introductions",
      "description": "Basic greetings, self-introductions, and polite expressions",
      "lessons": [
        {
          "title": "Lesson 1: Salamu za Asubuhi",
          "content_type": "video",
          "duration_minutes": 20
        }
      ]
    }
  ],
  "tags": ["kiswahili", "grade-4", "cbc", "language"]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Course title |
| `description` | string | Yes | Course description |
| `grade_levels` | array[int] | Yes | Target grade levels |
| `learning_area` | string | Yes | Subject/learning area |
| `price` | integer | No | Price in KES (0 for free) |
| `currency` | string | No | Currency code (default: `KES`) |
| `modules` | array | No | Course modules with lessons |
| `tags` | array[string] | No | Searchable tags |

**Response 201:**

```json
{
  "id": "course-009",
  "title": "Kiswahili for Grade 4",
  "status": "draft",
  "grade_levels": [4],
  "learning_area": "Kiswahili",
  "price": 1200,
  "created_at": "2026-02-15T10:00:00Z",
  "message": "Course created successfully. Publish when ready."
}
```

**curl:**

```bash
curl -X POST "http://localhost:8000/api/v1/instructor/courses" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Kiswahili for Grade 4", "description": "An engaging Kiswahili course", "grade_levels": [4], "learning_area": "Kiswahili", "price": 1200}'
```

---

### PUT /instructor/courses/{id}

Update an existing course. Only the course creator can update it.

**Authentication:** Bearer token (instructor role required)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Course identifier |

**Request Body:**

```json
{
  "title": "Kiswahili for Grade 4 - Updated",
  "description": "Updated description with new learning objectives",
  "price": 1000,
  "status": "published",
  "modules": [
    {
      "title": "Module 1: Greetings and Introductions (Revised)",
      "description": "Expanded module with new interactive exercises"
    }
  ]
}
```

**Response 200:**

```json
{
  "id": "course-009",
  "title": "Kiswahili for Grade 4 - Updated",
  "status": "published",
  "price": 1000,
  "updated_at": "2026-02-15T11:00:00Z",
  "message": "Course updated successfully"
}
```

**curl:**

```bash
curl -X PUT "http://localhost:8000/api/v1/instructor/courses/a1b2c3d4-e5f6-7890-abcd-ef1234567890" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Kiswahili for Grade 4 - Updated", "price": 1000, "status": "published"}'
```

---

## Assessments

### GET /instructor/assessments

Get assessments created by the instructor, with filtering by status and course.

**Authentication:** Bearer token (instructor role required)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Results per page |
| `course_id` | UUID | - | Filter by course |
| `status` | string | - | Filter: `draft`, `active`, `closed` |
| `type` | string | - | Filter: `quiz`, `assignment`, `exam`, `project` |

**Response 200:**

```json
{
  "assessments": [
    {
      "id": "assess-001",
      "title": "Fractions Mid-Term Quiz",
      "course_title": "CBC Mathematics Grade 5",
      "type": "quiz",
      "status": "active",
      "total_questions": 15,
      "max_score": 100,
      "submissions_count": 45,
      "pending_grading": 12,
      "average_score": 78,
      "due_date": "2026-02-20T23:59:59Z",
      "created_at": "2026-02-01T08:00:00Z"
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 20
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/instructor/assessments?status=active&type=quiz" \
  -H "Authorization: Bearer <token>"
```

---

### POST /instructor/assessments

Create a new assessment for a course.

**Authentication:** Bearer token (instructor role required)

**Request Body:**

```json
{
  "title": "End of Chapter 5 Quiz",
  "course_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "type": "quiz",
  "description": "Quiz covering fractions, decimals, and percentages",
  "max_score": 50,
  "time_limit_minutes": 30,
  "due_date": "2026-02-28T23:59:59Z",
  "questions": [
    {
      "text": "What is 1/4 + 1/2?",
      "type": "multiple_choice",
      "options": ["1/6", "3/4", "2/6", "1/3"],
      "correct_answer": "3/4",
      "points": 5,
      "explanation": "Convert 1/2 to 2/4, then 1/4 + 2/4 = 3/4"
    }
  ],
  "is_randomized": true,
  "allow_retakes": false
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Assessment title |
| `course_id` | UUID | Yes | Course this assessment belongs to |
| `type` | string | Yes | One of: `quiz`, `assignment`, `exam`, `project` |
| `description` | string | No | Assessment description |
| `max_score` | integer | Yes | Maximum possible score |
| `time_limit_minutes` | integer | No | Time limit in minutes |
| `due_date` | datetime | No | Submission deadline |
| `questions` | array | Yes | Array of question objects |
| `is_randomized` | boolean | No | Randomize question order (default: `false`) |
| `allow_retakes` | boolean | No | Allow multiple attempts (default: `false`) |

**Response 201:**

```json
{
  "id": "assess-010",
  "title": "End of Chapter 5 Quiz",
  "course_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "type": "quiz",
  "status": "draft",
  "total_questions": 1,
  "max_score": 50,
  "created_at": "2026-02-15T10:00:00Z",
  "message": "Assessment created successfully"
}
```

**curl:**

```bash
curl -X POST "http://localhost:8000/api/v1/instructor/assessments" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "End of Chapter 5 Quiz", "course_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890", "type": "quiz", "max_score": 50, "questions": [{"text": "What is 1/4 + 1/2?", "type": "multiple_choice", "options": ["1/6", "3/4"], "correct_answer": "3/4", "points": 5}]}'
```

---

## Sessions

### GET /instructor/sessions

Get live sessions hosted by the instructor.

**Authentication:** Bearer token (instructor role required)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Results per page |
| `status` | string | - | Filter: `upcoming`, `live`, `completed`, `cancelled` |
| `sort_by` | string | `scheduled_at` | Sort field |
| `sort_order` | string | `asc` | Sort order: `asc`, `desc` |

**Response 200:**

```json
{
  "sessions": [
    {
      "id": "session-001",
      "title": "Grade 5 Math - Fractions Review",
      "description": "Live review session for fractions chapter",
      "session_type": "lecture",
      "status": "upcoming",
      "scheduled_at": "2026-02-16T10:00:00Z",
      "duration_minutes": 45,
      "max_participants": 30,
      "enrolled_count": 28,
      "room_name": "math-fractions-review",
      "join_url": "https://meet.example.com/session-001",
      "recording_available": false,
      "created_at": "2026-02-10T08:00:00Z"
    }
  ],
  "total": 12,
  "page": 1,
  "limit": 20
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/instructor/sessions?status=upcoming" \
  -H "Authorization: Bearer <token>"
```

---

### POST /instructor/sessions

Schedule a new live session.

**Authentication:** Bearer token (instructor role required)

**Request Body:**

```json
{
  "title": "Science Lab - Water Purification Experiment",
  "description": "Interactive virtual lab session demonstrating water purification methods",
  "session_type": "lab",
  "scheduled_at": "2026-02-20T14:00:00Z",
  "duration_minutes": 60,
  "max_participants": 25,
  "course_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "requires_camera": false,
  "materials": [
    "Water purification worksheet",
    "Lab safety guidelines"
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Session title |
| `description` | string | No | Session description |
| `session_type` | string | Yes | One of: `lecture`, `lab`, `tutorial`, `review`, `office_hours` |
| `scheduled_at` | datetime | Yes | Session start time (ISO 8601) |
| `duration_minutes` | integer | Yes | Session duration |
| `max_participants` | integer | No | Maximum participants |
| `course_id` | UUID | No | Associated course |
| `requires_camera` | boolean | No | Whether camera is required |
| `materials` | array[string] | No | Session materials list |

**Response 201:**

```json
{
  "id": "session-015",
  "title": "Science Lab - Water Purification Experiment",
  "status": "upcoming",
  "scheduled_at": "2026-02-20T14:00:00Z",
  "duration_minutes": 60,
  "room_name": "science-lab-water-purification",
  "join_url": "https://meet.example.com/session-015",
  "created_at": "2026-02-15T10:00:00Z",
  "message": "Session scheduled successfully"
}
```

**curl:**

```bash
curl -X POST "http://localhost:8000/api/v1/instructor/sessions" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Science Lab - Water Purification", "session_type": "lab", "scheduled_at": "2026-02-20T14:00:00Z", "duration_minutes": 60}'
```

---

## Interactions

### GET /instructor/interactions

Get student interactions including questions, submissions, and discussion activity.

**Authentication:** Bearer token (instructor role required)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `type` | string | - | Filter: `question`, `submission`, `discussion` |
| `course_id` | UUID | - | Filter by course |
| `status` | string | - | Filter: `pending`, `responded`, `resolved` |
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Results per page |

**Response 200:**

```json
{
  "interactions": [
    {
      "id": "int-001",
      "type": "question",
      "student_name": "Amani K.",
      "student_id": "student-001",
      "course_title": "CBC Mathematics Grade 5",
      "content": "I do not understand how to add fractions with different denominators",
      "ai_summary": "Student needs help with adding unlike fractions",
      "status": "pending",
      "priority": "normal",
      "created_at": "2026-02-15T09:00:00Z"
    },
    {
      "id": "int-002",
      "type": "submission",
      "student_name": "Baraka M.",
      "student_id": "student-002",
      "course_title": "CBC Mathematics Grade 5",
      "content": "Assignment: Fractions Practice Set",
      "status": "pending",
      "score": null,
      "max_score": 50,
      "created_at": "2026-02-15T14:00:00Z"
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 20
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/instructor/interactions?type=question&status=pending" \
  -H "Authorization: Bearer <token>"
```

---

## Impact

### GET /instructor/impact

Get performance metrics and impact data showing the instructor's effectiveness and student outcomes.

**Authentication:** Bearer token (instructor role required)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `period` | string | `month` | Time period: `week`, `month`, `term`, `year` |

**Response 200:**

```json
{
  "period": "month",
  "metrics": {
    "total_students_taught": 156,
    "new_students_this_period": 12,
    "average_student_score": 78.5,
    "student_completion_rate": 72,
    "average_session_attendance": 85,
    "student_satisfaction_rating": 4.7,
    "total_sessions_conducted": 18,
    "total_assessments_graded": 245,
    "average_response_time_hours": 4.2
  },
  "student_outcomes": {
    "improving": 98,
    "stable": 42,
    "declining": 16,
    "at_risk": 5
  },
  "top_performing_courses": [
    {
      "course_title": "CBC Mathematics Grade 5",
      "average_score": 82,
      "completion_rate": 78,
      "enrollment_count": 89
    }
  ],
  "comparison_to_platform": {
    "student_score": "above_average",
    "completion_rate": "above_average",
    "satisfaction": "top_10_percent"
  }
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/instructor/impact?period=term" \
  -H "Authorization: Bearer <token>"
```

---

## AI Insights

### GET /instructor/insights/daily

Get AI-generated daily insights about student performance, course analytics, and recommended actions.

**Authentication:** Bearer token (instructor role required)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `start_date` | date | - | Filter insights from this date |
| `end_date` | date | - | Filter insights up to this date |
| `priority` | string | - | Filter: `low`, `medium`, `high`, `urgent` |
| `category` | string | - | Filter: `submissions`, `sessions`, `students`, `earnings`, `content` |
| `page` | integer | 1 | Page number |
| `limit` | integer | 10 | Items per page (max 50) |

**Response 200:**

```json
{
  "insights": [
    {
      "id": "insight-001",
      "date": "2026-02-15",
      "category": "students",
      "priority": "high",
      "title": "Declining Performance Alert",
      "description": "5 students in your Mathematics Grade 5 course have shown a >15% score decline over the past two weeks.",
      "recommended_action": "Review recent quiz results and consider a review session for struggling students.",
      "action_url": "/instructor/courses/course-001/students?filter=declining",
      "is_read": false,
      "generated_at": "2026-02-15T06:00:00Z"
    },
    {
      "id": "insight-002",
      "date": "2026-02-15",
      "category": "submissions",
      "priority": "medium",
      "title": "Submissions Backlog",
      "description": "12 submissions are awaiting grading, with 3 overdue by more than 48 hours.",
      "recommended_action": "Prioritize grading the overdue submissions from Fractions Quiz.",
      "action_url": "/instructor/assessments?status=pending&sort=oldest",
      "is_read": false,
      "generated_at": "2026-02-15T06:00:00Z"
    }
  ],
  "total": 8,
  "page": 1,
  "limit": 10
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/instructor/insights/daily?priority=high&category=students" \
  -H "Authorization: Bearer <token>"
```

---

## Earnings

### GET /instructor/earnings

Get instructor earnings with filtering and pagination.

**Authentication:** Bearer token (instructor role required)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Results per page (max 100) |
| `earning_type` | string | - | Filter: `course_sale`, `session_fee`, `bonus` |
| `status` | string | - | Filter: `pending`, `confirmed`, `paid` |

**Response 200:**

```json
{
  "earnings": [
    {
      "id": "earn-001",
      "type": "course_sale",
      "amount": 1050,
      "currency": "KES",
      "description": "Course sale: CBC Mathematics Grade 5",
      "student_name": "New enrollment",
      "revenue_split": {
        "instructor_share": 70,
        "platform_share": 30
      },
      "status": "confirmed",
      "created_at": "2026-02-14T10:00:00Z"
    }
  ],
  "summary": {
    "total_earnings": 125000,
    "pending_amount": 15000,
    "available_for_payout": 110000,
    "paid_out": 95000,
    "this_month": 18500
  },
  "total": 245,
  "page": 1,
  "limit": 20
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/instructor/earnings?status=confirmed&page=1" \
  -H "Authorization: Bearer <token>"
```

---

### GET /instructor/earnings/payouts

Get payout history.

**Authentication:** Bearer token (instructor role required)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Results per page |
| `status` | string | - | Filter: `pending`, `processing`, `completed`, `failed` |

**Response 200:**

```json
{
  "payouts": [
    {
      "id": "payout-001",
      "amount": 45000,
      "currency": "KES",
      "method": "mpesa",
      "phone_number": "254712345678",
      "status": "completed",
      "reference": "MPY_abc123",
      "requested_at": "2026-02-01T10:00:00Z",
      "completed_at": "2026-02-01T10:05:00Z"
    },
    {
      "id": "payout-002",
      "amount": 50000,
      "currency": "KES",
      "method": "bank_transfer",
      "bank_name": "KCB Bank",
      "account_last4": "4567",
      "status": "processing",
      "requested_at": "2026-02-14T09:00:00Z",
      "completed_at": null
    }
  ],
  "total": 10,
  "page": 1,
  "limit": 20
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/instructor/earnings/payouts?status=completed" \
  -H "Authorization: Bearer <token>"
```

---

### POST /instructor/earnings/payout

Request a payout of available earnings.

**Authentication:** Bearer token (instructor role required)

**Request Body:**

```json
{
  "amount": 25000,
  "method": "mpesa",
  "phone_number": "254712345678"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `amount` | integer | Yes | Payout amount in KES |
| `method` | string | Yes | One of: `mpesa`, `bank_transfer` |
| `phone_number` | string | Conditional | Required if method is `mpesa` |
| `bank_account_id` | string | Conditional | Required if method is `bank_transfer` |

**Response 200:**

```json
{
  "id": "payout-003",
  "amount": 25000,
  "currency": "KES",
  "method": "mpesa",
  "status": "pending",
  "estimated_arrival": "2026-02-15T12:00:00Z",
  "requested_at": "2026-02-15T10:00:00Z",
  "message": "Payout request submitted. Funds will be sent to 254712345678 via M-Pesa."
}
```

**curl:**

```bash
curl -X POST "http://localhost:8000/api/v1/instructor/earnings/payout" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"amount": 25000, "method": "mpesa", "phone_number": "254712345678"}'
```

---

## Hub / Resources

### GET /instructor/hub/resources

Get teaching resources available in the instructor hub, including CBC curriculum guides, teaching aids, and community-shared materials.

**Authentication:** Bearer token (instructor role required)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `category` | string | - | Filter: `curriculum`, `teaching_aids`, `templates`, `community` |
| `subject` | string | - | Filter by subject |
| `grade_level` | integer | - | Filter by grade level |
| `search` | string | - | Search query |
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Results per page |

**Response 200:**

```json
{
  "resources": [
    {
      "id": "res-001",
      "title": "CBC Grade 5 Mathematics Curriculum Guide",
      "category": "curriculum",
      "subject": "Mathematics",
      "grade_levels": [5],
      "description": "Official curriculum guide with learning objectives and competency standards",
      "file_type": "pdf",
      "file_url": "/resources/cbc-math-grade5-guide.pdf",
      "downloads": 156,
      "rating": 4.9,
      "author": "KICD",
      "created_at": "2025-08-01T00:00:00Z"
    },
    {
      "id": "res-002",
      "title": "Interactive Fractions Activity Templates",
      "category": "teaching_aids",
      "subject": "Mathematics",
      "grade_levels": [4, 5, 6],
      "description": "Ready-to-use activity templates for teaching fractions",
      "file_type": "zip",
      "file_url": "/resources/fractions-activities.zip",
      "downloads": 89,
      "rating": 4.7,
      "author": "Mr. Ochieng",
      "created_at": "2025-11-15T00:00:00Z"
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 20
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/instructor/hub/resources?subject=Mathematics&grade_level=5" \
  -H "Authorization: Bearer <token>"
```

---

## Account

### GET /instructor/account/profile

Get the instructor's profile information including bio, qualifications, and teaching preferences.

**Authentication:** Bearer token (instructor role required)

**Response 200:**

```json
{
  "id": "instructor-001",
  "first_name": "James",
  "last_name": "Ochieng",
  "email": "james.ochieng@example.com",
  "phone_number": "254712345678",
  "bio": "Experienced mathematics teacher with 10 years of teaching in primary and secondary schools across Kenya.",
  "avatar_url": "/avatars/ochieng.png",
  "qualifications": [
    {
      "degree": "Bachelor of Education",
      "institution": "University of Nairobi",
      "year": 2015
    }
  ],
  "subjects": ["Mathematics", "Science"],
  "grade_levels": [4, 5, 6, 7],
  "teaching_since": "2015-01-01",
  "total_students": 156,
  "total_courses": 8,
  "average_rating": 4.7,
  "is_verified": true,
  "verification_date": "2025-09-15T00:00:00Z",
  "payout_settings": {
    "default_method": "mpesa",
    "mpesa_number": "254712345678",
    "bank_accounts": []
  },
  "joined_at": "2025-08-01T00:00:00Z"
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/instructor/account/profile" \
  -H "Authorization: Bearer <token>"
```

---

### PUT /instructor/account/profile

Update the instructor's profile. Only include fields you want to change.

**Authentication:** Bearer token (instructor role required)

**Request Body:**

```json
{
  "bio": "Updated bio with new accomplishments and teaching philosophy.",
  "subjects": ["Mathematics", "Science", "ICT"],
  "phone_number": "254722345678",
  "payout_settings": {
    "default_method": "bank_transfer",
    "bank_accounts": [
      {
        "bank_name": "KCB Bank",
        "account_number": "1234567890",
        "branch": "Nairobi Main"
      }
    ]
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `first_name` | string | No | First name |
| `last_name` | string | No | Last name |
| `bio` | string | No | Profile bio |
| `avatar_url` | string | No | Avatar image URL |
| `phone_number` | string | No | Phone number |
| `subjects` | array[string] | No | Teaching subjects |
| `grade_levels` | array[int] | No | Grade levels taught |
| `qualifications` | array | No | Qualifications list |
| `payout_settings` | object | No | Payout preferences |

**Response 200:**

```json
{
  "id": "instructor-001",
  "bio": "Updated bio with new accomplishments and teaching philosophy.",
  "subjects": ["Mathematics", "Science", "ICT"],
  "phone_number": "254722345678",
  "updated_at": "2026-02-15T10:00:00Z",
  "message": "Profile updated successfully"
}
```

**curl:**

```bash
curl -X PUT "http://localhost:8000/api/v1/instructor/account/profile" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"bio": "Updated bio with new accomplishments.", "subjects": ["Mathematics", "Science", "ICT"]}'
```

---

## Error Responses

All endpoints may return the following standard error responses:

### 401 Unauthorized

```json
{
  "detail": "Not authenticated"
}
```

### 403 Forbidden

```json
{
  "detail": "Role 'instructor' required"
}
```

### 404 Not Found

```json
{
  "detail": "Course not found"
}
```

### 500 Internal Server Error

```json
{
  "detail": "Internal server error message"
}
```
