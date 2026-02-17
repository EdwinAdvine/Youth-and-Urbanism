# Staff Dashboard API Reference

**Base URL:** `http://localhost:8000/api/v1/staff`
**Authentication:** Bearer JWT token required on all endpoints
**Required Role:** `staff`

All endpoints enforce role-based access control via the `require_role(["staff"])` dependency. Requests from non-staff roles receive a `403 Forbidden` response.

---

## Table of Contents

- [Dashboard](#dashboard)
  - [GET /staff/dashboard/stats](#get-staffdashboardstats)
- [User Management](#user-management)
  - [GET /staff/users](#get-staffusers)
  - [GET /staff/users/{id}](#get-staffusersid)
  - [PUT /staff/users/{id}](#put-staffusersid)
  - [GET /staff/instructor-applications](#get-staffinstructor-applications)
  - [PUT /staff/instructor-applications/{id}](#put-staffinstructor-applicationsid)
- [Content Moderation](#content-moderation)
  - [GET /staff/moderation/queue](#get-staffmoderationqueue)
  - [PUT /staff/moderation/{id}/action](#put-staffmoderationidaction)
  - [GET /staff/moderation/reported-content](#get-staffmoderationreported-content)
- [System Health](#system-health)
  - [GET /staff/system/health](#get-staffsystemhealth)
  - [GET /staff/system/audit-log](#get-staffsystemaudit-log)
- [Reports](#reports)
  - [GET /staff/reports/user-growth](#get-staffreportsuser-growth)
  - [GET /staff/reports/engagement](#get-staffreportsengagement)
  - [GET /staff/reports/revenue](#get-staffreportsrevenue)
- [Support Tickets](#support-tickets)
  - [GET /staff/support/tickets](#get-staffsupporttickets)
  - [GET /staff/support/tickets/{id}](#get-staffsupportticketsid)
  - [PUT /staff/support/tickets/{id}](#put-staffsupportticketsid)
  - [POST /staff/support/tickets/{id}/reply](#post-staffsupportticketsidreply)

---

## Dashboard

### GET /staff/dashboard/stats

Get the complete staff dashboard overview including platform statistics, pending tasks, system alerts, and recent activity.

**Authentication:** Bearer token (staff role required)

**Response 200:**

```json
{
  "stats": {
    "total_users": 2450,
    "new_users_today": 18,
    "new_users_this_week": 97,
    "active_users_today": 342,
    "total_students": 1890,
    "total_instructors": 45,
    "total_parents": 480,
    "total_courses": 156,
    "pending_moderation_items": 8,
    "open_support_tickets": 23,
    "system_health": "healthy"
  },
  "pending_tasks": [
    {
      "type": "instructor_application",
      "count": 3,
      "label": "Pending instructor applications",
      "url": "/staff/instructor-applications"
    },
    {
      "type": "moderation",
      "count": 8,
      "label": "Items in moderation queue",
      "url": "/staff/moderation/queue"
    },
    {
      "type": "support_tickets",
      "count": 5,
      "label": "Unassigned support tickets",
      "url": "/staff/support/tickets?status=unassigned"
    }
  ],
  "system_alerts": [
    {
      "id": "alert-001",
      "severity": "warning",
      "message": "Redis cache hit rate dropped below 80%",
      "timestamp": "2026-02-15T08:30:00Z"
    }
  ],
  "recent_activity": [
    {
      "id": "act-001",
      "type": "user_registration",
      "description": "New student registered: Amani K.",
      "timestamp": "2026-02-15T09:15:00Z"
    },
    {
      "id": "act-002",
      "type": "content_flagged",
      "description": "Forum post flagged for review",
      "timestamp": "2026-02-15T09:00:00Z"
    }
  ]
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/staff/dashboard/stats" \
  -H "Authorization: Bearer <token>"
```

---

## User Management

### GET /staff/users

Get a paginated list of all platform users with filtering and search.

**Authentication:** Bearer token (staff role required)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Results per page (max 100) |
| `role` | string | - | Filter by role: `student`, `parent`, `instructor`, `admin`, `partner`, `staff` |
| `status` | string | - | Filter: `active`, `suspended`, `banned`, `pending` |
| `search` | string | - | Search by name, email, or phone number |
| `sort_by` | string | `created_at` | Sort: `created_at`, `name`, `email`, `last_login` |
| `sort_order` | string | `desc` | Sort order: `asc`, `desc` |

**Response 200:**

```json
{
  "users": [
    {
      "id": "user-001",
      "first_name": "Amani",
      "last_name": "Kariuki",
      "email": "amani.k@example.com",
      "phone_number": "254712345678",
      "role": "student",
      "status": "active",
      "grade_level": 5,
      "last_login": "2026-02-15T08:00:00Z",
      "created_at": "2025-09-01T00:00:00Z"
    }
  ],
  "total": 2450,
  "page": 1,
  "limit": 20,
  "pages": 123
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/staff/users?role=student&status=active&search=amani" \
  -H "Authorization: Bearer <token>"
```

---

### GET /staff/users/{id}

Get detailed information about a specific user.

**Authentication:** Bearer token (staff role required)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | User identifier |

**Response 200:**

```json
{
  "id": "user-001",
  "first_name": "Amani",
  "last_name": "Kariuki",
  "email": "amani.k@example.com",
  "phone_number": "254712345678",
  "role": "student",
  "status": "active",
  "grade_level": 5,
  "profile_data": {
    "school": "Nairobi Primary",
    "county": "Nairobi"
  },
  "enrolled_courses": 4,
  "completed_courses": 2,
  "total_spent": 4500,
  "ai_tutor_sessions": 89,
  "last_login": "2026-02-15T08:00:00Z",
  "login_count": 156,
  "created_at": "2025-09-01T00:00:00Z",
  "updated_at": "2026-02-15T08:00:00Z",
  "parent_account": {
    "id": "user-050",
    "name": "Jane Kariuki",
    "email": "jane.k@example.com"
  }
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/staff/users/a1b2c3d4-e5f6-7890-abcd-ef1234567890" \
  -H "Authorization: Bearer <token>"
```

---

### PUT /staff/users/{id}

Update a user's account status or profile information.

**Authentication:** Bearer token (staff role required)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | User identifier |

**Request Body:**

```json
{
  "status": "suspended",
  "suspension_reason": "Violation of community guidelines",
  "suspension_duration_days": 7
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | string | No | New status: `active`, `suspended`, `banned` |
| `role` | string | No | New role (requires admin approval for elevation) |
| `suspension_reason` | string | Conditional | Required when status is `suspended` or `banned` |
| `suspension_duration_days` | integer | No | Duration of suspension (null for permanent) |
| `first_name` | string | No | Update first name |
| `last_name` | string | No | Update last name |
| `email` | string | No | Update email |

**Response 200:**

```json
{
  "id": "user-001",
  "status": "suspended",
  "suspension_reason": "Violation of community guidelines",
  "suspension_expires_at": "2026-02-22T00:00:00Z",
  "updated_at": "2026-02-15T10:00:00Z",
  "message": "User account suspended for 7 days"
}
```

**curl:**

```bash
curl -X PUT "http://localhost:8000/api/v1/staff/users/a1b2c3d4-e5f6-7890-abcd-ef1234567890" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "suspended", "suspension_reason": "Violation of community guidelines", "suspension_duration_days": 7}'
```

---

### GET /staff/instructor-applications

Get pending instructor applications.

**Authentication:** Bearer token (staff role required)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Results per page |
| `status` | string | `pending` | Filter: `pending`, `approved`, `rejected` |

**Response 200:**

```json
{
  "applications": [
    {
      "id": "app-001",
      "applicant": {
        "id": "user-200",
        "first_name": "Peter",
        "last_name": "Mwangi",
        "email": "peter.m@example.com",
        "phone_number": "254723456789"
      },
      "qualifications": [
        {
          "degree": "Bachelor of Education",
          "institution": "Kenyatta University",
          "year": 2018
        }
      ],
      "subjects": ["Mathematics", "Physics"],
      "grade_levels": [7, 8, 9],
      "teaching_experience_years": 6,
      "motivation": "I want to help students across Kenya access quality education through technology.",
      "status": "pending",
      "submitted_at": "2026-02-14T10:00:00Z"
    }
  ],
  "total": 3,
  "page": 1,
  "limit": 20
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/staff/instructor-applications?status=pending" \
  -H "Authorization: Bearer <token>"
```

---

### PUT /staff/instructor-applications/{id}

Approve or reject an instructor application.

**Authentication:** Bearer token (staff role required)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Application identifier |

**Request Body:**

```json
{
  "decision": "approved",
  "notes": "Verified qualifications and teaching experience. Approved for Mathematics and Physics."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `decision` | string | Yes | `approved` or `rejected` |
| `notes` | string | No | Staff notes regarding the decision |
| `rejection_reason` | string | Conditional | Required when decision is `rejected` |

**Response 200:**

```json
{
  "id": "app-001",
  "status": "approved",
  "reviewed_by": "staff-001",
  "reviewed_at": "2026-02-15T10:00:00Z",
  "message": "Application approved. User role updated to instructor."
}
```

**curl:**

```bash
curl -X PUT "http://localhost:8000/api/v1/staff/instructor-applications/a1b2c3d4-e5f6-7890-abcd-ef1234567890" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"decision": "approved", "notes": "Verified qualifications."}'
```

---

## Content Moderation

### GET /staff/moderation/queue

Get the content moderation queue with flagged items.

**Authentication:** Bearer token (staff role required)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Results per page |
| `content_type` | string | - | Filter: `forum_post`, `course_review`, `comment`, `profile` |
| `priority` | string | - | Filter: `low`, `medium`, `high`, `urgent` |
| `status` | string | `pending` | Filter: `pending`, `approved`, `removed`, `escalated` |

**Response 200:**

```json
{
  "items": [
    {
      "id": "mod-001",
      "content_type": "forum_post",
      "content_id": "post-123",
      "content_preview": "This is the flagged content preview text...",
      "author": {
        "id": "user-045",
        "name": "Student User",
        "role": "student"
      },
      "reporter": {
        "id": "user-078",
        "name": "Another Student",
        "reason": "Inappropriate language"
      },
      "priority": "medium",
      "status": "pending",
      "flagged_at": "2026-02-15T07:00:00Z",
      "auto_flag_reason": null
    }
  ],
  "total": 8,
  "page": 1,
  "limit": 20
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/staff/moderation/queue?priority=high&status=pending" \
  -H "Authorization: Bearer <token>"
```

---

### PUT /staff/moderation/{id}/action

Take a moderation action on a flagged item.

**Authentication:** Bearer token (staff role required)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Moderation item identifier |

**Request Body:**

```json
{
  "action": "remove",
  "reason": "Content violates community guidelines regarding appropriate language.",
  "notify_author": true,
  "warn_author": true
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `action` | string | Yes | `approve`, `remove`, `warn`, `escalate` |
| `reason` | string | Yes | Reason for the moderation decision |
| `notify_author` | boolean | No | Send notification to the content author (default: `true`) |
| `warn_author` | boolean | No | Issue a formal warning to the author (default: `false`) |

**Response 200:**

```json
{
  "id": "mod-001",
  "action_taken": "remove",
  "moderated_by": "staff-001",
  "moderated_at": "2026-02-15T10:00:00Z",
  "author_notified": true,
  "warning_issued": true,
  "message": "Content removed and author warned."
}
```

**curl:**

```bash
curl -X PUT "http://localhost:8000/api/v1/staff/moderation/mod-001/action" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"action": "remove", "reason": "Violates community guidelines.", "notify_author": true, "warn_author": true}'
```

---

### GET /staff/moderation/reported-content

Get a summary of reported content across the platform.

**Authentication:** Bearer token (staff role required)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `period` | string | `week` | Time period: `day`, `week`, `month` |

**Response 200:**

```json
{
  "period": "week",
  "summary": {
    "total_reports": 24,
    "resolved": 16,
    "pending": 8,
    "resolution_rate": 66.7
  },
  "by_type": {
    "forum_post": 12,
    "course_review": 5,
    "comment": 4,
    "profile": 3
  },
  "by_reason": {
    "inappropriate_language": 8,
    "spam": 6,
    "harassment": 4,
    "misinformation": 3,
    "other": 3
  },
  "trending_issues": [
    {
      "issue": "Spam accounts posting promotional content",
      "count": 6,
      "first_seen": "2026-02-12T00:00:00Z"
    }
  ]
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/staff/moderation/reported-content?period=week" \
  -H "Authorization: Bearer <token>"
```

---

## System Health

### GET /staff/system/health

Get system health metrics including API performance, database status, and cache statistics.

**Authentication:** Bearer token (staff role required)

**Response 200:**

```json
{
  "overall_status": "healthy",
  "checked_at": "2026-02-15T10:00:00Z",
  "services": {
    "api": {
      "status": "healthy",
      "average_response_time_ms": 45,
      "requests_per_minute": 120,
      "error_rate_percent": 0.2
    },
    "database": {
      "status": "healthy",
      "connection_pool_size": 10,
      "active_connections": 4,
      "average_query_time_ms": 12,
      "disk_usage_percent": 35
    },
    "redis": {
      "status": "healthy",
      "memory_used_mb": 128,
      "memory_max_mb": 512,
      "hit_rate_percent": 92,
      "connected_clients": 8
    },
    "ai_providers": {
      "gemini": { "status": "healthy", "average_response_ms": 850 },
      "claude": { "status": "healthy", "average_response_ms": 920 },
      "openai": { "status": "healthy", "average_response_ms": 780 },
      "grok": { "status": "degraded", "average_response_ms": 2100 }
    }
  },
  "uptime_hours": 720,
  "last_restart": "2026-01-15T02:00:00Z"
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/staff/system/health" \
  -H "Authorization: Bearer <token>"
```

---

### GET /staff/system/audit-log

Get the administrative audit log.

**Authentication:** Bearer token (staff role required)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 50 | Results per page (max 200) |
| `action_type` | string | - | Filter: `user_update`, `content_moderation`, `system_config`, `security` |
| `actor_id` | UUID | - | Filter by the staff member who performed the action |
| `start_date` | date | - | Filter from this date |
| `end_date` | date | - | Filter up to this date |

**Response 200:**

```json
{
  "entries": [
    {
      "id": "audit-001",
      "action_type": "user_update",
      "description": "Suspended user account: user-045",
      "actor": {
        "id": "staff-001",
        "name": "Grace Wanjiku"
      },
      "target": {
        "type": "user",
        "id": "user-045",
        "name": "Student User"
      },
      "details": {
        "field": "status",
        "old_value": "active",
        "new_value": "suspended"
      },
      "ip_address": "41.89.xxx.xxx",
      "timestamp": "2026-02-15T09:30:00Z"
    }
  ],
  "total": 1250,
  "page": 1,
  "limit": 50
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/staff/system/audit-log?action_type=user_update&limit=50" \
  -H "Authorization: Bearer <token>"
```

---

## Reports

### GET /staff/reports/user-growth

Get user growth analytics.

**Authentication:** Bearer token (staff role required)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `period` | string | `month` | Time period: `week`, `month`, `quarter`, `year` |
| `group_by` | string | `day` | Group data: `day`, `week`, `month` |
| `role` | string | - | Filter by role |

**Response 200:**

```json
{
  "period": "month",
  "total_new_users": 245,
  "growth_rate_percent": 12.5,
  "by_role": {
    "student": 180,
    "parent": 45,
    "instructor": 8,
    "partner": 2
  },
  "timeline": [
    { "date": "2026-02-01", "registrations": 12, "cumulative": 2217 },
    { "date": "2026-02-02", "registrations": 8, "cumulative": 2225 },
    { "date": "2026-02-03", "registrations": 15, "cumulative": 2240 }
  ],
  "top_sources": [
    { "source": "organic", "count": 120 },
    { "source": "referral", "count": 65 },
    { "source": "social_media", "count": 40 }
  ]
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/staff/reports/user-growth?period=month&group_by=day" \
  -H "Authorization: Bearer <token>"
```

---

### GET /staff/reports/engagement

Get platform engagement metrics.

**Authentication:** Bearer token (staff role required)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `period` | string | `month` | Time period: `week`, `month`, `quarter`, `year` |

**Response 200:**

```json
{
  "period": "month",
  "metrics": {
    "daily_active_users": 342,
    "monthly_active_users": 1560,
    "dau_mau_ratio": 21.9,
    "average_session_duration_minutes": 28,
    "average_sessions_per_user": 4.2,
    "course_completion_rate": 68,
    "ai_tutor_sessions_today": 456,
    "ai_tutor_messages_total": 12500,
    "forum_posts_this_month": 234,
    "lessons_completed_today": 890
  },
  "top_courses_by_engagement": [
    {
      "course_title": "CBC Mathematics Grade 5",
      "active_students": 89,
      "average_time_minutes": 35,
      "completion_rate": 72
    }
  ]
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/staff/reports/engagement?period=month" \
  -H "Authorization: Bearer <token>"
```

---

### GET /staff/reports/revenue

Get revenue analytics.

**Authentication:** Bearer token (staff role required)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `period` | string | `month` | Time period: `week`, `month`, `quarter`, `year` |

**Response 200:**

```json
{
  "period": "month",
  "total_revenue": 485000,
  "currency": "KES",
  "growth_rate_percent": 15.2,
  "by_payment_method": {
    "mpesa": 350000,
    "paypal": 85000,
    "stripe": 50000
  },
  "by_category": {
    "course_sales": 380000,
    "session_fees": 65000,
    "subscriptions": 40000
  },
  "instructor_payouts": 290000,
  "platform_revenue": 195000
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/staff/reports/revenue?period=month" \
  -H "Authorization: Bearer <token>"
```

---

## Support Tickets

### GET /staff/support/tickets

Get support tickets with filtering and sorting.

**Authentication:** Bearer token (staff role required)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Results per page |
| `status` | string | - | Filter: `open`, `in_progress`, `waiting_on_user`, `resolved`, `closed` |
| `priority` | string | - | Filter: `low`, `medium`, `high`, `urgent` |
| `assigned_to` | UUID | - | Filter by assigned staff member |
| `category` | string | - | Filter: `account`, `payment`, `course`, `technical`, `ai_tutor`, `other` |

**Response 200:**

```json
{
  "tickets": [
    {
      "id": "ticket-001",
      "subject": "Unable to complete M-Pesa payment",
      "category": "payment",
      "priority": "high",
      "status": "open",
      "requester": {
        "id": "user-100",
        "name": "Mary Njeri",
        "email": "mary.n@example.com",
        "role": "parent"
      },
      "assigned_to": null,
      "message_count": 2,
      "created_at": "2026-02-15T07:30:00Z",
      "updated_at": "2026-02-15T07:30:00Z"
    }
  ],
  "total": 23,
  "page": 1,
  "limit": 20
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/staff/support/tickets?status=open&priority=high" \
  -H "Authorization: Bearer <token>"
```

---

### GET /staff/support/tickets/{id}

Get detailed information about a specific support ticket.

**Authentication:** Bearer token (staff role required)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Ticket identifier |

**Response 200:**

```json
{
  "id": "ticket-001",
  "subject": "Unable to complete M-Pesa payment",
  "category": "payment",
  "priority": "high",
  "status": "open",
  "requester": {
    "id": "user-100",
    "name": "Mary Njeri",
    "email": "mary.n@example.com",
    "role": "parent"
  },
  "assigned_to": null,
  "messages": [
    {
      "id": "msg-001",
      "sender_type": "user",
      "sender_name": "Mary Njeri",
      "content": "I tried to pay for my daughter's CBC Mathematics course via M-Pesa but the transaction failed. The amount was deducted from my account but the course was not unlocked.",
      "created_at": "2026-02-15T07:30:00Z"
    },
    {
      "id": "msg-002",
      "sender_type": "user",
      "sender_name": "Mary Njeri",
      "content": "The M-Pesa confirmation code is QJK3L2M1N0. Amount: KES 1,500.",
      "created_at": "2026-02-15T07:32:00Z"
    }
  ],
  "internal_notes": [],
  "created_at": "2026-02-15T07:30:00Z",
  "updated_at": "2026-02-15T07:32:00Z"
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/staff/support/tickets/ticket-001" \
  -H "Authorization: Bearer <token>"
```

---

### PUT /staff/support/tickets/{id}

Update a support ticket (assign, change status, change priority).

**Authentication:** Bearer token (staff role required)

**Request Body:**

```json
{
  "status": "in_progress",
  "assigned_to": "staff-001",
  "priority": "urgent",
  "internal_note": "Verified M-Pesa transaction. Escalating to payment team for manual reconciliation."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | string | No | New status |
| `assigned_to` | UUID | No | Staff member to assign |
| `priority` | string | No | New priority level |
| `internal_note` | string | No | Internal staff note (not visible to user) |

**Response 200:**

```json
{
  "id": "ticket-001",
  "status": "in_progress",
  "assigned_to": "staff-001",
  "priority": "urgent",
  "updated_at": "2026-02-15T10:00:00Z",
  "message": "Ticket updated successfully"
}
```

**curl:**

```bash
curl -X PUT "http://localhost:8000/api/v1/staff/support/tickets/ticket-001" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "in_progress", "assigned_to": "staff-001", "priority": "urgent"}'
```

---

### POST /staff/support/tickets/{id}/reply

Reply to a support ticket.

**Authentication:** Bearer token (staff role required)

**Request Body:**

```json
{
  "content": "Hello Mary, thank you for reporting this. We have verified your M-Pesa transaction and the payment has been reconciled. Your daughter should now have access to the CBC Mathematics course. Please let us know if you need any further assistance.",
  "is_internal": false
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `content` | string | Yes | Reply message content |
| `is_internal` | boolean | No | If `true`, the reply is an internal note not visible to the user (default: `false`) |

**Response 201:**

```json
{
  "id": "msg-003",
  "ticket_id": "ticket-001",
  "sender_type": "staff",
  "sender_name": "Grace Wanjiku",
  "content": "Hello Mary, thank you for reporting this...",
  "is_internal": false,
  "created_at": "2026-02-15T10:05:00Z",
  "message": "Reply sent successfully"
}
```

**curl:**

```bash
curl -X POST "http://localhost:8000/api/v1/staff/support/tickets/ticket-001/reply" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"content": "Hello Mary, thank you for reporting this. We have verified your M-Pesa transaction.", "is_internal": false}'
```

---

## Error Responses

All endpoints may return the following standard error responses:

| Status Code | Description | Example |
|-------------|-------------|---------|
| `400` | Bad Request -- invalid parameters or request body | `{"detail": "Invalid status value"}` |
| `401` | Unauthorized -- missing or invalid JWT token | `{"detail": "Not authenticated"}` |
| `403` | Forbidden -- user does not have the staff role | `{"detail": "Role 'staff' required"}` |
| `404` | Not Found -- requested resource does not exist | `{"detail": "User not found"}` |
| `422` | Validation Error -- request body failed validation | `{"detail": [{"msg": "field required", "type": "value_error.missing"}]}` |
| `429` | Too Many Requests -- rate limit exceeded | `{"detail": "Rate limit exceeded. Retry after 60 seconds."}` |
| `500` | Internal Server Error -- unexpected server error | `{"detail": "Internal server error"}` |
