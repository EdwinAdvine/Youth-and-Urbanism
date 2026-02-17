# Partner Dashboard API Reference

**Base URL:** `http://localhost:8000/api/v1/partner`
**Authentication:** Bearer JWT token required on all endpoints
**Required Role:** `partner`

All endpoints enforce role-based access control via the `require_role(["partner"])` dependency. Requests from non-partner roles receive a `403 Forbidden` response.

---

## Table of Contents

- [Dashboard](#dashboard)
  - [GET /partner/dashboard/stats](#get-partnerdashboardstats)
- [Sponsorships](#sponsorships)
  - [GET /partner/sponsorships](#get-partnersponsorships)
  - [POST /partner/sponsorships](#post-partnersponsorships)
  - [GET /partner/sponsorships/{id}](#get-partnersponsorshipsid)
  - [GET /partner/sponsored-students](#get-partnersponsored-students)
- [Impact Analytics](#impact-analytics)
  - [GET /partner/impact](#get-partnerimpact)
  - [GET /partner/impact/student-outcomes](#get-partnerimpactstudent-outcomes)
  - [GET /partner/impact/reports](#get-partnerimpactreports)
- [Programs](#programs)
  - [GET /partner/programs](#get-partnerprograms)
  - [POST /partner/programs](#post-partnerprograms)
  - [GET /partner/programs/{id}](#get-partnerprogramsid)
- [Payments](#payments)
  - [GET /partner/payments](#get-partnerpayments)
  - [GET /partner/payments/invoices](#get-partnerpaymentsinvoices)
  - [POST /partner/payments](#post-partnerpayments)
- [Reports](#reports)
  - [GET /partner/reports/export](#get-partnerreportsexport)

---

## Dashboard

### GET /partner/dashboard/stats

Get the complete partner dashboard overview including sponsorship statistics, impact metrics, recent student activity, and payment summary.

**Authentication:** Bearer token (partner role required)

**Response 200:**

```json
{
  "stats": {
    "total_sponsorships": 45,
    "active_sponsorships": 38,
    "total_students_sponsored": 120,
    "total_invested": 2500000,
    "currency": "KES",
    "average_student_score_improvement": 18.5,
    "courses_funded": 15,
    "programs_active": 3
  },
  "recent_milestones": [
    {
      "student_name": "Amani K.",
      "milestone": "Completed CBC Mathematics Grade 5 with 92% score",
      "date": "2026-02-14T15:00:00Z",
      "sponsorship_id": "spn-012"
    },
    {
      "student_name": "Baraka M.",
      "milestone": "Earned Science Excellence certificate",
      "date": "2026-02-13T10:00:00Z",
      "sponsorship_id": "spn-015"
    }
  ],
  "payment_summary": {
    "total_paid": 2200000,
    "pending_payments": 150000,
    "next_scheduled_payment": {
      "amount": 75000,
      "date": "2026-03-01T00:00:00Z",
      "description": "Monthly scholarship disbursement"
    }
  },
  "impact_snapshot": {
    "students_improving": 95,
    "students_stable": 18,
    "students_declining": 7,
    "overall_completion_rate": 74
  }
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/partner/dashboard/stats" \
  -H "Authorization: Bearer <token>"
```

---

## Sponsorships

### GET /partner/sponsorships

Get a paginated list of the partner's sponsorships.

**Authentication:** Bearer token (partner role required)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Results per page (max 100) |
| `status` | string | - | Filter: `active`, `pending`, `completed`, `cancelled` |
| `sort_by` | string | `created_at` | Sort: `created_at`, `student_name`, `amount`, `end_date` |
| `sort_order` | string | `desc` | Sort order: `asc`, `desc` |

**Response 200:**

```json
{
  "sponsorships": [
    {
      "id": "spn-012",
      "student": {
        "id": "student-045",
        "name": "Amani Kariuki",
        "grade_level": 5,
        "school": "Nairobi Primary",
        "county": "Nairobi"
      },
      "type": "full_scholarship",
      "status": "active",
      "courses_covered": ["CBC Mathematics Grade 5", "CBC Science Grade 5"],
      "total_amount": 50000,
      "amount_disbursed": 35000,
      "currency": "KES",
      "start_date": "2025-09-01T00:00:00Z",
      "end_date": "2026-08-31T00:00:00Z",
      "student_performance": {
        "average_score": 85,
        "courses_completed": 1,
        "courses_in_progress": 1
      },
      "created_at": "2025-08-15T00:00:00Z"
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 20,
  "pages": 3
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/partner/sponsorships?status=active&sort_by=student_name" \
  -H "Authorization: Bearer <token>"
```

---

### POST /partner/sponsorships

Create a new sponsorship for a student or group of students.

**Authentication:** Bearer token (partner role required)

**Request Body:**

```json
{
  "student_ids": ["student-045", "student-046"],
  "type": "course_specific",
  "course_ids": ["course-001", "course-005"],
  "amount_per_student": 25000,
  "currency": "KES",
  "start_date": "2026-03-01",
  "end_date": "2026-12-31",
  "notes": "Sponsoring Grade 5 students for Mathematics and Science courses."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `student_ids` | array[UUID] | Yes | Students to sponsor |
| `type` | string | Yes | `full_scholarship`, `course_specific`, `partial` |
| `course_ids` | array[UUID] | Conditional | Required for `course_specific` type |
| `amount_per_student` | integer | Yes | Sponsorship amount per student in specified currency |
| `currency` | string | No | Currency code (default: `KES`) |
| `start_date` | date | Yes | Sponsorship start date |
| `end_date` | date | Yes | Sponsorship end date |
| `notes` | string | No | Internal notes about the sponsorship |

**Response 201:**

```json
{
  "sponsorships_created": 2,
  "sponsorship_ids": ["spn-050", "spn-051"],
  "total_amount": 50000,
  "currency": "KES",
  "status": "pending",
  "message": "Sponsorships created successfully. Payment required to activate."
}
```

**curl:**

```bash
curl -X POST "http://localhost:8000/api/v1/partner/sponsorships" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"student_ids": ["student-045"], "type": "course_specific", "course_ids": ["course-001"], "amount_per_student": 25000, "start_date": "2026-03-01", "end_date": "2026-12-31"}'
```

---

### GET /partner/sponsorships/{id}

Get detailed information about a specific sponsorship.

**Authentication:** Bearer token (partner role required)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Sponsorship identifier |

**Response 200:**

```json
{
  "id": "spn-012",
  "student": {
    "id": "student-045",
    "name": "Amani Kariuki",
    "grade_level": 5,
    "avatar_url": "/avatars/amani.png"
  },
  "type": "full_scholarship",
  "status": "active",
  "courses": [
    {
      "id": "course-001",
      "title": "CBC Mathematics Grade 5",
      "progress_percent": 72,
      "current_score": 85,
      "status": "in_progress"
    },
    {
      "id": "course-005",
      "title": "CBC Science Grade 5",
      "progress_percent": 45,
      "current_score": 78,
      "status": "in_progress"
    }
  ],
  "financial": {
    "total_amount": 50000,
    "amount_disbursed": 35000,
    "amount_remaining": 15000,
    "currency": "KES",
    "disbursement_history": [
      { "date": "2025-09-01", "amount": 15000, "description": "Initial disbursement" },
      { "date": "2025-12-01", "amount": 10000, "description": "Term 2 disbursement" },
      { "date": "2026-01-15", "amount": 10000, "description": "Term 3 disbursement" }
    ]
  },
  "timeline": [
    { "date": "2025-08-15", "event": "Sponsorship created" },
    { "date": "2025-09-01", "event": "Sponsorship activated" },
    { "date": "2025-11-20", "event": "Student completed CBC Mathematics Module 3" },
    { "date": "2026-02-14", "event": "Student completed CBC Mathematics Grade 5" }
  ],
  "start_date": "2025-09-01T00:00:00Z",
  "end_date": "2026-08-31T00:00:00Z",
  "created_at": "2025-08-15T00:00:00Z"
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/partner/sponsorships/spn-012" \
  -H "Authorization: Bearer <token>"
```

---

### GET /partner/sponsored-students

Get an overview of all sponsored students with aggregated metrics.

**Authentication:** Bearer token (partner role required)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Results per page |
| `grade_level` | integer | - | Filter by grade level |
| `county` | string | - | Filter by county |
| `performance` | string | - | Filter: `improving`, `stable`, `declining` |

**Response 200:**

```json
{
  "students": [
    {
      "id": "student-045",
      "name": "Amani Kariuki",
      "grade_level": 5,
      "county": "Nairobi",
      "sponsorship_type": "full_scholarship",
      "courses_enrolled": 2,
      "courses_completed": 1,
      "average_score": 85,
      "performance_trend": "improving",
      "score_change": 12,
      "ai_tutor_sessions": 45,
      "last_active": "2026-02-15T08:00:00Z"
    }
  ],
  "total": 120,
  "page": 1,
  "limit": 20,
  "aggregate": {
    "average_score_all": 78,
    "improving_count": 95,
    "stable_count": 18,
    "declining_count": 7
  }
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/partner/sponsored-students?performance=improving&grade_level=5" \
  -H "Authorization: Bearer <token>"
```

---

## Impact Analytics

### GET /partner/impact

Get high-level impact metrics for the partner's sponsorship portfolio.

**Authentication:** Bearer token (partner role required)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `period` | string | `year` | Time period: `quarter`, `year`, `all_time` |

**Response 200:**

```json
{
  "period": "year",
  "students_reached": 120,
  "courses_funded": 15,
  "total_investment": 2500000,
  "currency": "KES",
  "outcomes": {
    "average_score_improvement": 18.5,
    "course_completion_rate": 74,
    "students_advancing_grade": 98,
    "certificates_earned": 85,
    "ai_tutor_sessions": 5400
  },
  "comparison_to_platform": {
    "sponsored_avg_score": 82,
    "platform_avg_score": 71,
    "sponsored_completion_rate": 74,
    "platform_completion_rate": 62
  },
  "roi_metrics": {
    "cost_per_student": 20833,
    "cost_per_course_completion": 29412,
    "cost_per_certificate": 29412
  }
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/partner/impact?period=year" \
  -H "Authorization: Bearer <token>"
```

---

### GET /partner/impact/student-outcomes

Get detailed student outcome analytics.

**Authentication:** Bearer token (partner role required)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `period` | string | `year` | Time period: `quarter`, `year`, `all_time` |
| `grade_level` | integer | - | Filter by grade level |
| `subject` | string | - | Filter by subject area |

**Response 200:**

```json
{
  "period": "year",
  "total_students": 120,
  "by_performance": {
    "excellent": { "count": 35, "avg_score": 92, "percent": 29 },
    "good": { "count": 60, "avg_score": 78, "percent": 50 },
    "needs_improvement": { "count": 18, "avg_score": 62, "percent": 15 },
    "at_risk": { "count": 7, "avg_score": 45, "percent": 6 }
  },
  "by_subject": [
    { "subject": "Mathematics", "avg_score": 80, "completion_rate": 76 },
    { "subject": "Science", "avg_score": 78, "completion_rate": 72 },
    { "subject": "English", "avg_score": 82, "completion_rate": 80 },
    { "subject": "Kiswahili", "avg_score": 75, "completion_rate": 68 }
  ],
  "score_trend": [
    { "month": "2025-09", "avg_score": 65 },
    { "month": "2025-12", "avg_score": 72 },
    { "month": "2026-02", "avg_score": 82 }
  ]
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/partner/impact/student-outcomes?subject=Mathematics" \
  -H "Authorization: Bearer <token>"
```

---

### GET /partner/impact/reports

Get downloadable impact reports.

**Authentication:** Bearer token (partner role required)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `format` | string | `json` | Output format: `json`, `pdf`, `csv` |
| `start_date` | date | - | Report start date |
| `end_date` | date | - | Report end date |

**Response 200:**

```json
{
  "report": {
    "id": "report-001",
    "title": "Q4 2025 Impact Report",
    "period": "2025-10-01 to 2025-12-31",
    "generated_at": "2026-02-15T10:00:00Z",
    "download_url": "/api/v1/partner/reports/report-001/download",
    "summary": {
      "students_reached": 120,
      "investment": 850000,
      "completion_rate": 71,
      "avg_score_improvement": 15
    }
  }
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/partner/impact/reports?format=pdf&start_date=2025-10-01&end_date=2025-12-31" \
  -H "Authorization: Bearer <token>"
```

---

## Programs

### GET /partner/programs

Get partner-funded educational programs.

**Authentication:** Bearer token (partner role required)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Results per page |
| `status` | string | - | Filter: `active`, `planning`, `completed`, `paused` |

**Response 200:**

```json
{
  "programs": [
    {
      "id": "prog-001",
      "name": "Nairobi STEM Scholars 2026",
      "description": "STEM education program for Grade 5-8 students in Nairobi county",
      "status": "active",
      "target_students": 50,
      "enrolled_students": 42,
      "budget": 1500000,
      "spent": 980000,
      "currency": "KES",
      "courses": ["Mathematics", "Science", "ICT"],
      "start_date": "2025-09-01",
      "end_date": "2026-08-31",
      "created_at": "2025-07-15T00:00:00Z"
    }
  ],
  "total": 3,
  "page": 1,
  "limit": 20
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/partner/programs?status=active" \
  -H "Authorization: Bearer <token>"
```

---

### POST /partner/programs

Create a new educational program.

**Authentication:** Bearer token (partner role required)

**Request Body:**

```json
{
  "name": "Coast Region Digital Literacy 2026",
  "description": "Digital literacy program for Grade 4-6 students in Mombasa and Kilifi counties",
  "target_students": 30,
  "budget": 900000,
  "currency": "KES",
  "course_ids": ["course-020", "course-021"],
  "eligibility": {
    "grade_levels": [4, 5, 6],
    "counties": ["Mombasa", "Kilifi"],
    "max_household_income": 50000
  },
  "start_date": "2026-05-01",
  "end_date": "2027-04-30"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Program name |
| `description` | string | Yes | Program description |
| `target_students` | integer | Yes | Target number of students |
| `budget` | integer | Yes | Total program budget |
| `currency` | string | No | Currency code (default: `KES`) |
| `course_ids` | array[UUID] | No | Specific courses included in the program |
| `eligibility` | object | No | Eligibility criteria for students |
| `start_date` | date | Yes | Program start date |
| `end_date` | date | Yes | Program end date |

**Response 201:**

```json
{
  "id": "prog-004",
  "name": "Coast Region Digital Literacy 2026",
  "status": "planning",
  "target_students": 30,
  "budget": 900000,
  "created_at": "2026-02-15T10:00:00Z",
  "message": "Program created successfully. Student enrollment can begin after payment."
}
```

**curl:**

```bash
curl -X POST "http://localhost:8000/api/v1/partner/programs" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Coast Region Digital Literacy 2026", "description": "Digital literacy program", "target_students": 30, "budget": 900000, "start_date": "2026-05-01", "end_date": "2027-04-30"}'
```

---

### GET /partner/programs/{id}

Get detailed information about a specific program.

**Authentication:** Bearer token (partner role required)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Program identifier |

**Response 200:**

```json
{
  "id": "prog-001",
  "name": "Nairobi STEM Scholars 2026",
  "description": "STEM education program for Grade 5-8 students in Nairobi county",
  "status": "active",
  "target_students": 50,
  "enrolled_students": 42,
  "budget": 1500000,
  "spent": 980000,
  "remaining": 520000,
  "currency": "KES",
  "courses": [
    { "id": "course-001", "title": "CBC Mathematics Grade 5", "enrolled": 42 },
    { "id": "course-005", "title": "CBC Science Grade 5", "enrolled": 38 }
  ],
  "participants": {
    "by_grade": { "5": 15, "6": 12, "7": 10, "8": 5 },
    "by_county": { "Nairobi": 42 },
    "average_score": 79,
    "completion_rate": 68
  },
  "milestones": [
    { "date": "2025-09-01", "description": "Program launched" },
    { "date": "2025-12-15", "description": "42 students enrolled" },
    { "date": "2026-01-20", "description": "First cohort completed Mathematics module" }
  ],
  "start_date": "2025-09-01",
  "end_date": "2026-08-31",
  "created_at": "2025-07-15T00:00:00Z"
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/partner/programs/prog-001" \
  -H "Authorization: Bearer <token>"
```

---

## Payments

### GET /partner/payments

Get payment history for the partner.

**Authentication:** Bearer token (partner role required)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Results per page |
| `status` | string | - | Filter: `completed`, `pending`, `failed`, `refunded` |
| `method` | string | - | Filter: `mpesa`, `bank_transfer`, `paypal`, `stripe` |
| `start_date` | date | - | Filter from date |
| `end_date` | date | - | Filter to date |

**Response 200:**

```json
{
  "payments": [
    {
      "id": "pay-001",
      "amount": 75000,
      "currency": "KES",
      "method": "bank_transfer",
      "status": "completed",
      "description": "Monthly scholarship disbursement - February 2026",
      "reference": "BT_20260201_001",
      "program_id": "prog-001",
      "created_at": "2026-02-01T00:00:00Z",
      "completed_at": "2026-02-01T10:00:00Z"
    }
  ],
  "total": 24,
  "page": 1,
  "limit": 20,
  "summary": {
    "total_paid": 2200000,
    "this_month": 75000,
    "pending": 150000
  }
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/partner/payments?status=completed&method=bank_transfer" \
  -H "Authorization: Bearer <token>"
```

---

### GET /partner/payments/invoices

Get invoices for partner payments.

**Authentication:** Bearer token (partner role required)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Results per page |
| `status` | string | - | Filter: `draft`, `sent`, `paid`, `overdue` |

**Response 200:**

```json
{
  "invoices": [
    {
      "id": "inv-001",
      "invoice_number": "INV-2026-001",
      "amount": 75000,
      "currency": "KES",
      "status": "paid",
      "description": "Monthly scholarship disbursement - February 2026",
      "program": "Nairobi STEM Scholars 2026",
      "issued_date": "2026-02-01",
      "due_date": "2026-02-15",
      "paid_date": "2026-02-01",
      "download_url": "/api/v1/partner/payments/invoices/inv-001/pdf"
    }
  ],
  "total": 12,
  "page": 1,
  "limit": 20
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/partner/payments/invoices?status=paid" \
  -H "Authorization: Bearer <token>"
```

---

### POST /partner/payments

Make a payment for a sponsorship or program.

**Authentication:** Bearer token (partner role required)

**Request Body:**

```json
{
  "amount": 150000,
  "currency": "KES",
  "method": "bank_transfer",
  "program_id": "prog-001",
  "description": "Q2 2026 program funding",
  "bank_reference": "BT_REF_12345"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `amount` | integer | Yes | Payment amount |
| `currency` | string | No | Currency code (default: `KES`) |
| `method` | string | Yes | `mpesa`, `bank_transfer`, `paypal`, `stripe` |
| `program_id` | UUID | No | Program to fund |
| `sponsorship_ids` | array[UUID] | No | Specific sponsorships to fund |
| `description` | string | No | Payment description |
| `bank_reference` | string | Conditional | Required for bank transfers |

**Response 201:**

```json
{
  "id": "pay-025",
  "amount": 150000,
  "currency": "KES",
  "method": "bank_transfer",
  "status": "pending",
  "created_at": "2026-02-15T10:00:00Z",
  "message": "Payment initiated. Bank transfer verification pending."
}
```

**curl:**

```bash
curl -X POST "http://localhost:8000/api/v1/partner/payments" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"amount": 150000, "method": "bank_transfer", "program_id": "prog-001", "description": "Q2 2026 program funding"}'
```

---

## Reports

### GET /partner/reports/export

Export a comprehensive impact report.

**Authentication:** Bearer token (partner role required)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `format` | string | `pdf` | Export format: `pdf`, `csv`, `json` |
| `report_type` | string | `impact` | Report type: `impact`, `financial`, `student_outcomes` |
| `start_date` | date | - | Report start date |
| `end_date` | date | - | Report end date |

**Response 200:**

```json
{
  "report_id": "rpt-001",
  "report_type": "impact",
  "format": "pdf",
  "download_url": "/api/v1/partner/reports/rpt-001/download",
  "generated_at": "2026-02-15T10:00:00Z",
  "expires_at": "2026-02-16T10:00:00Z",
  "message": "Report generated successfully. Download link valid for 24 hours."
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/partner/reports/export?format=pdf&report_type=impact&start_date=2025-09-01&end_date=2026-02-15" \
  -H "Authorization: Bearer <token>"
```

---

## Error Responses

All endpoints may return the following standard error responses:

| Status Code | Description | Example |
|-------------|-------------|---------|
| `400` | Bad Request -- invalid parameters or request body | `{"detail": "Invalid sponsorship type"}` |
| `401` | Unauthorized -- missing or invalid JWT token | `{"detail": "Not authenticated"}` |
| `403` | Forbidden -- user does not have the partner role | `{"detail": "Role 'partner' required"}` |
| `404` | Not Found -- requested resource does not exist | `{"detail": "Sponsorship not found"}` |
| `422` | Validation Error -- request body failed validation | `{"detail": [{"msg": "field required", "type": "value_error.missing"}]}` |
| `429` | Too Many Requests -- rate limit exceeded | `{"detail": "Rate limit exceeded. Retry after 60 seconds."}` |
| `500` | Internal Server Error -- unexpected server error | `{"detail": "Internal server error"}` |
