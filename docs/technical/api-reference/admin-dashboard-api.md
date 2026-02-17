# Admin Dashboard API Reference

**Base URL:** `http://localhost:8000/api/v1/admin`
**Authentication:** Bearer JWT token required on all endpoints
**Required Role:** `admin` (some endpoints also accept `staff`)

All endpoints enforce role-based access control via the `verify_admin_access()` dependency. Requests from unauthorized roles receive a `403 Forbidden` response.

---

## Table of Contents

- [Dashboard](#dashboard)
  - [GET /admin/dashboard/overview](#get-admindashboardoverview)
  - [GET /admin/dashboard/alerts](#get-admindashboardalerts)
  - [GET /admin/dashboard/pending-items](#get-admindashboardpending-items)
  - [GET /admin/dashboard/revenue-snapshot](#get-admindashboardrevenue-snapshot)
  - [GET /admin/dashboard/ai-anomalies](#get-admindashboardai-anomalies)
- [Pulse (Real-Time Monitoring)](#pulse)
  - [GET /admin/pulse](#get-adminpulse)
- [Users](#users)
  - [GET /admin/users](#get-adminusers)
  - [GET /admin/users/{id}](#get-adminusersid)
  - [PUT /admin/users/{id}/role](#put-adminusersidrole)
  - [POST /admin/users/{id}/restrict](#post-adminusersidrestrict)
- [AI Providers](#ai-providers)
  - [GET /admin/ai-providers](#get-adminai-providers)
  - [POST /admin/ai-providers](#post-adminai-providers)
  - [PUT /admin/ai-providers/{id}](#put-adminai-providersid)
  - [DELETE /admin/ai-providers/{id}](#delete-adminai-providersid)
- [AI Monitoring](#ai-monitoring)
  - [GET /admin/ai-monitoring](#get-adminai-monitoring)
- [Analytics](#analytics)
  - [GET /admin/analytics](#get-adminanalytics)
  - [GET /admin/analytics/learning](#get-adminanalyticslearning)
  - [GET /admin/analytics/business](#get-adminanalyticsbusiness)
- [Finance](#finance)
  - [GET /admin/finance](#get-adminfinance)
  - [GET /admin/finance/plans](#get-adminfinanceplans)
- [Operations](#operations)
  - [GET /admin/operations/tickets](#get-adminoperationstickets)
  - [GET /admin/operations/moderation](#get-adminoperationsmoderation)
  - [GET /admin/operations/audit-logs](#get-adminoperationsaudit-logs)
- [Permissions](#permissions)
  - [GET /admin/permissions](#get-adminpermissions)

---

## Dashboard

### GET /admin/dashboard/overview

Get high-level platform metrics for the admin dashboard including user counts, enrollments, revenue, AI sessions, and course statistics.

**Authentication:** Bearer token (admin role required)

**Response 200:**

```json
{
  "status": "success",
  "data": {
    "users": {
      "total": 1250,
      "students": 980,
      "parents": 150,
      "instructors": 45,
      "staff": 12,
      "partners": 8,
      "admins": 5,
      "new_this_week": 34,
      "active_today": 312
    },
    "enrollments": {
      "total": 3400,
      "active": 2800,
      "completed": 520,
      "cancelled": 80,
      "new_this_week": 156
    },
    "revenue": {
      "total": 2500000,
      "currency": "KES",
      "this_month": 450000,
      "last_month": 380000,
      "growth_percent": 18.4
    },
    "ai_sessions": {
      "total": 45000,
      "today": 1200,
      "average_daily": 1100,
      "models_active": 3
    },
    "courses": {
      "total": 120,
      "published": 95,
      "draft": 20,
      "archived": 5,
      "average_rating": 4.5
    }
  }
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/admin/dashboard/overview" \
  -H "Authorization: Bearer <token>"
```

---

### GET /admin/dashboard/alerts

Get system and safety alerts for the admin dashboard. Returns alerts with severity levels, types, and action URLs.

**Authentication:** Bearer token (admin role required)

**Response 200:**

```json
{
  "status": "success",
  "data": [
    {
      "id": "alert-001",
      "severity": "critical",
      "type": "system",
      "title": "Database Connection Pool Near Capacity",
      "description": "PostgreSQL connection pool is at 85% capacity. Consider scaling.",
      "action_url": "/admin/system/database",
      "created_at": "2026-02-15T08:00:00Z",
      "is_acknowledged": false
    },
    {
      "id": "alert-002",
      "severity": "warning",
      "type": "safety",
      "title": "Content Moderation Backlog",
      "description": "15 content items have been in the moderation queue for over 24 hours.",
      "action_url": "/admin/operations/moderation",
      "created_at": "2026-02-15T06:00:00Z",
      "is_acknowledged": false
    },
    {
      "id": "alert-003",
      "severity": "info",
      "type": "ai",
      "title": "Gemini API Latency Increase",
      "description": "Average response time for Gemini Pro increased by 15% in the last hour.",
      "action_url": "/admin/ai-monitoring",
      "created_at": "2026-02-15T09:30:00Z",
      "is_acknowledged": false
    }
  ],
  "count": 3
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/admin/dashboard/alerts" \
  -H "Authorization: Bearer <token>"
```

---

### GET /admin/dashboard/pending-items

Get counts of items awaiting admin action, including pending enrollments, unpublished courses, pending transactions, open tickets, and moderation items.

**Authentication:** Bearer token (admin role required)

**Response 200:**

```json
{
  "status": "success",
  "data": {
    "pending_enrollments": 8,
    "unpublished_courses": 20,
    "pending_transactions": 3,
    "open_tickets": 15,
    "moderation_queue": 12,
    "pending_instructor_applications": 5,
    "pending_partner_requests": 2,
    "total": 65
  }
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/admin/dashboard/pending-items" \
  -H "Authorization: Bearer <token>"
```

---

### GET /admin/dashboard/revenue-snapshot

Get revenue snapshot for today, this week, and this month, including trend percentage and recent transactions.

**Authentication:** Bearer token (admin role required)

**Response 200:**

```json
{
  "status": "success",
  "data": {
    "today": {
      "amount": 15000,
      "currency": "KES",
      "transaction_count": 12,
      "trend_vs_yesterday": 8.5
    },
    "this_week": {
      "amount": 95000,
      "currency": "KES",
      "transaction_count": 78,
      "trend_vs_last_week": 12.3
    },
    "this_month": {
      "amount": 450000,
      "currency": "KES",
      "transaction_count": 340,
      "trend_vs_last_month": 18.4
    },
    "recent_transactions": [
      {
        "id": "txn-001",
        "type": "course_purchase",
        "amount": 1500,
        "currency": "KES",
        "user_name": "Parent Kimani",
        "description": "CBC Mathematics Grade 5",
        "status": "completed",
        "created_at": "2026-02-15T09:45:00Z"
      }
    ]
  }
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/admin/dashboard/revenue-snapshot" \
  -H "Authorization: Bearer <token>"
```

---

### GET /admin/dashboard/ai-anomalies

Get AI anomaly detections including content safety violations, usage spikes, and response quality degradation.

**Authentication:** Bearer token (admin role required)

**Response 200:**

```json
{
  "status": "success",
  "data": [
    {
      "id": "anomaly-001",
      "type": "content_safety",
      "severity": "high",
      "title": "Inappropriate Content Detected",
      "description": "AI response flagged for potentially inappropriate content in a Grade 3 session.",
      "model": "gemini-pro",
      "session_id": "session-abc",
      "student_id": "student-010",
      "detected_at": "2026-02-15T08:30:00Z",
      "action_taken": "Response blocked and replaced with safe fallback",
      "status": "auto_resolved"
    },
    {
      "id": "anomaly-002",
      "type": "usage_spike",
      "severity": "medium",
      "title": "Unusual API Usage Spike",
      "description": "API calls to Claude model increased 300% in the last hour. Possible abuse or bug.",
      "model": "claude-3.5-sonnet",
      "detected_at": "2026-02-15T09:00:00Z",
      "status": "investigating"
    }
  ],
  "count": 2
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/admin/dashboard/ai-anomalies" \
  -H "Authorization: Bearer <token>"
```

---

## Pulse

### GET /admin/pulse

Get real-time platform monitoring data including live user counts, active sessions, system health, and performance metrics.

**Authentication:** Bearer token (admin role required)

**Response 200:**

```json
{
  "status": "success",
  "data": {
    "timestamp": "2026-02-15T10:00:00Z",
    "live_users": 312,
    "active_ai_sessions": 45,
    "active_live_sessions": 3,
    "system_health": {
      "api_status": "healthy",
      "database_status": "healthy",
      "redis_status": "healthy",
      "ai_providers": {
        "gemini": "operational",
        "claude": "operational",
        "openai": "operational",
        "grok": "degraded"
      }
    },
    "performance": {
      "api_avg_response_ms": 125,
      "ai_avg_response_ms": 1800,
      "database_query_avg_ms": 15,
      "error_rate_percent": 0.2
    },
    "bandwidth": {
      "requests_per_minute": 450,
      "bandwidth_mbps": 12.5
    }
  }
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/admin/pulse" \
  -H "Authorization: Bearer <token>"
```

---

## Users

### GET /admin/users

Get a paginated list of users with filtering and search capabilities.

**Authentication:** Bearer token (admin role required)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Results per page (max 100) |
| `role` | string | - | Filter by role: `student`, `parent`, `instructor`, `admin`, `partner`, `staff` |
| `status` | string | - | Filter: `active`, `restricted`, `deleted` |
| `search` | string | - | Search by name or email |
| `sort_by` | string | `created_at` | Sort field |
| `sort_order` | string | `desc` | Sort order: `asc`, `desc` |

**Response 200:**

```json
{
  "status": "success",
  "data": {
    "users": [
      {
        "id": "user-001",
        "email": "amani@example.com",
        "first_name": "Amani",
        "last_name": "Kimani",
        "role": "student",
        "status": "active",
        "is_verified": true,
        "last_login": "2026-02-15T08:00:00Z",
        "created_at": "2025-09-01T00:00:00Z"
      }
    ],
    "total": 1250,
    "page": 1,
    "limit": 20,
    "pages": 63
  }
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/admin/users?role=student&status=active&limit=50" \
  -H "Authorization: Bearer <token>"
```

---

### GET /admin/users/{id}

Get detailed information about a specific user including their profile, activity, and linked accounts.

**Authentication:** Bearer token (admin role required)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | User identifier |

**Response 200:**

```json
{
  "status": "success",
  "data": {
    "id": "user-001",
    "email": "amani@example.com",
    "first_name": "Amani",
    "last_name": "Kimani",
    "role": "student",
    "status": "active",
    "is_verified": true,
    "profile_data": {
      "grade_level": 5,
      "admission_number": "UHS-2025-001",
      "learning_style": "visual"
    },
    "parent_id": "user-050",
    "parent_name": "Mr. Kimani",
    "activity": {
      "last_login": "2026-02-15T08:00:00Z",
      "total_sessions": 245,
      "total_time_hours": 120,
      "courses_enrolled": 4,
      "courses_completed": 1
    },
    "restrictions": [],
    "created_at": "2025-09-01T00:00:00Z",
    "updated_at": "2026-02-15T08:00:00Z"
  }
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/admin/users/a1b2c3d4-e5f6-7890-abcd-ef1234567890" \
  -H "Authorization: Bearer <token>"
```

---

### PUT /admin/users/{id}/role

Change a user's role. This is a sensitive operation that is logged in the audit trail.

**Authentication:** Bearer token (admin role required)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | User identifier |

**Request Body:**

```json
{
  "new_role": "instructor",
  "reason": "Approved instructor application #IA-045"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `new_role` | string | Yes | New role: `student`, `parent`, `instructor`, `admin`, `partner`, `staff` |
| `reason` | string | Yes | Reason for the role change (logged in audit trail) |

**Response 200:**

```json
{
  "status": "success",
  "data": {
    "user_id": "user-025",
    "previous_role": "student",
    "new_role": "instructor",
    "changed_by": "admin-001",
    "reason": "Approved instructor application #IA-045",
    "changed_at": "2026-02-15T10:00:00Z"
  }
}
```

**curl:**

```bash
curl -X PUT "http://localhost:8000/api/v1/admin/users/a1b2c3d4-e5f6-7890-abcd-ef1234567890/role" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"new_role": "instructor", "reason": "Approved instructor application"}'
```

---

### POST /admin/users/{id}/restrict

Restrict a user account. Restricted users cannot access the platform until the restriction is lifted.

**Authentication:** Bearer token (admin role required)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | User identifier |

**Request Body:**

```json
{
  "restriction_type": "temporary_ban",
  "reason": "Violation of community guidelines - inappropriate content",
  "duration_days": 7,
  "notify_user": true
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `restriction_type` | string | Yes | One of: `temporary_ban`, `permanent_ban`, `content_restricted`, `feature_restricted` |
| `reason` | string | Yes | Reason for restriction |
| `duration_days` | integer | No | Duration for temporary restrictions |
| `notify_user` | boolean | No | Send notification to user (default: `true`) |

**Response 200:**

```json
{
  "status": "success",
  "data": {
    "user_id": "user-030",
    "restriction_type": "temporary_ban",
    "reason": "Violation of community guidelines - inappropriate content",
    "restricted_by": "admin-001",
    "starts_at": "2026-02-15T10:00:00Z",
    "expires_at": "2026-02-22T10:00:00Z",
    "notification_sent": true
  }
}
```

**curl:**

```bash
curl -X POST "http://localhost:8000/api/v1/admin/users/a1b2c3d4-e5f6-7890-abcd-ef1234567890/restrict" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"restriction_type": "temporary_ban", "reason": "Community guidelines violation", "duration_days": 7}'
```

---

## AI Providers

### GET /admin/ai-providers

Get a list of all configured AI providers with status and usage metrics.

**Authentication:** Bearer token (admin role required)

**Response 200:**

```json
{
  "status": "success",
  "data": [
    {
      "id": "provider-001",
      "name": "Google Gemini",
      "model": "gemini-pro",
      "status": "active",
      "is_default": true,
      "task_types": ["general", "reasoning"],
      "api_key_set": true,
      "usage": {
        "requests_today": 850,
        "requests_this_month": 18000,
        "cost_this_month": 45.00,
        "average_latency_ms": 1200,
        "error_rate_percent": 0.3
      },
      "rate_limits": {
        "requests_per_minute": 60,
        "tokens_per_minute": 32000
      },
      "created_at": "2025-08-01T00:00:00Z"
    },
    {
      "id": "provider-002",
      "name": "Anthropic Claude",
      "model": "claude-3.5-sonnet",
      "status": "active",
      "is_default": false,
      "task_types": ["creative", "detailed_explanation"],
      "api_key_set": true,
      "usage": {
        "requests_today": 300,
        "requests_this_month": 6500,
        "cost_this_month": 32.00,
        "average_latency_ms": 1500,
        "error_rate_percent": 0.1
      },
      "rate_limits": {
        "requests_per_minute": 40,
        "tokens_per_minute": 40000
      },
      "created_at": "2025-08-01T00:00:00Z"
    }
  ]
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/admin/ai-providers" \
  -H "Authorization: Bearer <token>"
```

---

### POST /admin/ai-providers

Add a new AI provider configuration.

**Authentication:** Bearer token (admin role required)

**Request Body:**

```json
{
  "name": "X.AI Grok",
  "model": "grok-2",
  "api_key": "xai-...",
  "base_url": "https://api.x.ai/v1",
  "task_types": ["research", "current_events"],
  "is_default": false,
  "rate_limits": {
    "requests_per_minute": 30,
    "tokens_per_minute": 20000
  },
  "failover_priority": 4
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Provider display name |
| `model` | string | Yes | Model identifier |
| `api_key` | string | Yes | API key (stored encrypted) |
| `base_url` | string | No | Custom API base URL |
| `task_types` | array[string] | Yes | Supported task types |
| `is_default` | boolean | No | Set as default provider |
| `rate_limits` | object | No | Rate limit configuration |
| `failover_priority` | integer | No | Priority in failover chain (lower = higher priority) |

**Response 201:**

```json
{
  "status": "success",
  "data": {
    "id": "provider-004",
    "name": "X.AI Grok",
    "model": "grok-2",
    "status": "active",
    "task_types": ["research", "current_events"],
    "created_at": "2026-02-15T10:00:00Z",
    "message": "AI provider added successfully"
  }
}
```

**curl:**

```bash
curl -X POST "http://localhost:8000/api/v1/admin/ai-providers" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "X.AI Grok", "model": "grok-2", "api_key": "xai-...", "task_types": ["research"]}'
```

---

### PUT /admin/ai-providers/{id}

Update an existing AI provider configuration.

**Authentication:** Bearer token (admin role required)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Provider identifier |

**Request Body:**

```json
{
  "status": "disabled",
  "rate_limits": {
    "requests_per_minute": 20,
    "tokens_per_minute": 15000
  },
  "failover_priority": 5
}
```

**Response 200:**

```json
{
  "status": "success",
  "data": {
    "id": "provider-004",
    "name": "X.AI Grok",
    "status": "disabled",
    "updated_at": "2026-02-15T11:00:00Z",
    "message": "AI provider updated successfully"
  }
}
```

**curl:**

```bash
curl -X PUT "http://localhost:8000/api/v1/admin/ai-providers/provider-004" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "disabled"}'
```

---

### DELETE /admin/ai-providers/{id}

Remove an AI provider configuration. The default provider cannot be deleted.

**Authentication:** Bearer token (admin role required)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Provider identifier |

**Response 200:**

```json
{
  "status": "success",
  "message": "AI provider removed successfully"
}
```

**curl:**

```bash
curl -X DELETE "http://localhost:8000/api/v1/admin/ai-providers/provider-004" \
  -H "Authorization: Bearer <token>"
```

---

## AI Monitoring

### GET /admin/ai-monitoring

Get AI usage and cost monitoring data across all providers.

**Authentication:** Bearer token (admin role required)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `period` | string | `day` | Time period: `hour`, `day`, `week`, `month` |
| `provider` | string | - | Filter by provider name |

**Response 200:**

```json
{
  "status": "success",
  "data": {
    "period": "day",
    "total_requests": 1200,
    "total_tokens": 850000,
    "total_cost": 12.50,
    "currency": "USD",
    "providers": [
      {
        "name": "gemini-pro",
        "requests": 850,
        "tokens": 600000,
        "cost": 6.00,
        "average_latency_ms": 1200,
        "error_count": 3,
        "error_rate": 0.35
      },
      {
        "name": "claude-3.5-sonnet",
        "requests": 300,
        "tokens": 200000,
        "cost": 5.00,
        "average_latency_ms": 1500,
        "error_count": 0,
        "error_rate": 0.0
      },
      {
        "name": "gpt-4",
        "requests": 50,
        "tokens": 50000,
        "cost": 1.50,
        "average_latency_ms": 2000,
        "error_count": 1,
        "error_rate": 2.0
      }
    ],
    "task_distribution": {
      "general": 60,
      "reasoning": 20,
      "creative": 12,
      "research": 8
    },
    "hourly_usage": [
      {"hour": "06:00", "requests": 25},
      {"hour": "07:00", "requests": 80},
      {"hour": "08:00", "requests": 150},
      {"hour": "09:00", "requests": 180}
    ]
  }
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/admin/ai-monitoring?period=day" \
  -H "Authorization: Bearer <token>"
```

---

## Analytics

### GET /admin/analytics

Get platform-wide analytics overview.

**Authentication:** Bearer token (admin role required)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `period` | string | `month` | Time period: `week`, `month`, `quarter`, `year` |

**Response 200:**

```json
{
  "status": "success",
  "data": {
    "period": "month",
    "user_growth": {
      "new_users": 145,
      "growth_rate": 12.5,
      "churn_rate": 2.1,
      "retention_rate": 88.5
    },
    "engagement": {
      "daily_active_users": 312,
      "weekly_active_users": 780,
      "monthly_active_users": 1050,
      "average_session_duration_minutes": 35,
      "average_sessions_per_user": 4.2
    },
    "content": {
      "new_courses": 5,
      "total_lessons_completed": 12500,
      "average_completion_rate": 72,
      "top_courses": [
        {"title": "CBC Mathematics Grade 5", "enrollments": 89}
      ]
    },
    "ai_usage": {
      "total_ai_sessions": 18000,
      "unique_ai_users": 680,
      "ai_adoption_rate": 69.4
    }
  }
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/admin/analytics?period=month" \
  -H "Authorization: Bearer <token>"
```

---

### GET /admin/analytics/learning

Get learning-specific analytics across the platform.

**Authentication:** Bearer token (admin role required)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `period` | string | `month` | Time period |
| `grade_level` | integer | - | Filter by grade level |
| `subject` | string | - | Filter by subject |

**Response 200:**

```json
{
  "status": "success",
  "data": {
    "overall_performance": {
      "average_score": 76.5,
      "median_score": 78,
      "pass_rate": 82.3,
      "improvement_rate": 68.5
    },
    "by_subject": [
      {
        "subject": "Mathematics",
        "average_score": 78,
        "enrollment_count": 450,
        "completion_rate": 74,
        "trend": "improving"
      },
      {
        "subject": "English",
        "average_score": 75,
        "enrollment_count": 380,
        "completion_rate": 70,
        "trend": "stable"
      }
    ],
    "by_grade": [
      {
        "grade_level": 5,
        "student_count": 180,
        "average_score": 78,
        "average_time_hours": 25
      }
    ],
    "cbc_competency_averages": {
      "communication": 76,
      "critical_thinking": 72,
      "creativity": 68,
      "digital_literacy": 82,
      "learning_to_learn": 74,
      "self_efficacy": 70,
      "citizenship": 78
    }
  }
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/admin/analytics/learning?period=month&grade_level=5" \
  -H "Authorization: Bearer <token>"
```

---

### GET /admin/analytics/business

Get business analytics including revenue, conversions, and customer metrics.

**Authentication:** Bearer token (admin role required)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `period` | string | `month` | Time period: `week`, `month`, `quarter`, `year` |

**Response 200:**

```json
{
  "status": "success",
  "data": {
    "revenue": {
      "total": 450000,
      "currency": "KES",
      "subscriptions": 280000,
      "course_sales": 150000,
      "other": 20000,
      "trend": "increasing",
      "growth_percent": 18.4
    },
    "subscriptions": {
      "total_active": 420,
      "new_this_period": 45,
      "cancelled": 8,
      "renewal_rate": 92.5,
      "by_plan": {
        "basic": 180,
        "premium": 150,
        "family_premium": 90
      }
    },
    "conversions": {
      "free_to_paid_rate": 15.2,
      "trial_conversion_rate": 42.5,
      "average_revenue_per_user": 428
    },
    "payment_methods": {
      "mpesa": 72,
      "card": 18,
      "wallet": 10
    }
  }
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/admin/analytics/business?period=quarter" \
  -H "Authorization: Bearer <token>"
```

---

## Finance

### GET /admin/finance

Get a comprehensive financial overview of the platform.

**Authentication:** Bearer token (admin role required)

**Response 200:**

```json
{
  "status": "success",
  "data": {
    "total_revenue": 2500000,
    "currency": "KES",
    "this_month": 450000,
    "outstanding_payables": 125000,
    "instructor_payouts_pending": 85000,
    "partner_disbursements_pending": 40000,
    "net_revenue": 2375000,
    "expenses": {
      "ai_api_costs": 45000,
      "infrastructure": 30000,
      "payment_processing_fees": 25000
    },
    "cash_flow": {
      "inflows_this_month": 450000,
      "outflows_this_month": 180000,
      "net_this_month": 270000
    }
  }
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/admin/finance" \
  -H "Authorization: Bearer <token>"
```

---

### GET /admin/finance/plans

Get subscription plan configurations.

**Authentication:** Bearer token (admin role required)

**Response 200:**

```json
{
  "status": "success",
  "data": [
    {
      "id": "plan-001",
      "name": "Basic",
      "price": 500,
      "currency": "KES",
      "billing_cycle": "monthly",
      "features": [
        "Access to 5 courses",
        "AI tutor (50 sessions/month)",
        "Basic progress tracking"
      ],
      "active_subscribers": 180,
      "status": "active"
    },
    {
      "id": "plan-002",
      "name": "Premium",
      "price": 1500,
      "currency": "KES",
      "billing_cycle": "monthly",
      "features": [
        "Unlimited courses",
        "Unlimited AI tutor",
        "Advanced analytics",
        "Live sessions",
        "Certificate generation"
      ],
      "active_subscribers": 150,
      "status": "active"
    },
    {
      "id": "plan-003",
      "name": "Family Premium",
      "price": 2500,
      "currency": "KES",
      "billing_cycle": "monthly",
      "features": [
        "Up to 5 children",
        "All Premium features per child",
        "Family dashboard",
        "Priority support"
      ],
      "active_subscribers": 90,
      "status": "active"
    }
  ]
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/admin/finance/plans" \
  -H "Authorization: Bearer <token>"
```

---

## Operations

### GET /admin/operations/tickets

Get support tickets with filtering and pagination.

**Authentication:** Bearer token (admin role required)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `status` | string | - | Filter: `open`, `in_progress`, `resolved`, `closed` |
| `priority` | string | - | Filter: `normal`, `high`, `urgent` |
| `assigned_to` | UUID | - | Filter by assigned staff member |
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Results per page |

**Response 200:**

```json
{
  "status": "success",
  "data": {
    "tickets": [
      {
        "id": "ticket-001",
        "subject": "Cannot access enrolled course",
        "description": "Blank screen when opening Mathematics course",
        "user_name": "Amani Kimani",
        "user_role": "student",
        "status": "in_progress",
        "priority": "high",
        "assigned_to": "Staff Member A",
        "created_at": "2026-02-15T10:00:00Z",
        "last_updated": "2026-02-15T11:00:00Z",
        "response_count": 2
      }
    ],
    "total": 15,
    "page": 1,
    "limit": 20,
    "summary": {
      "open": 8,
      "in_progress": 5,
      "resolved": 2,
      "urgent": 3
    }
  }
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/admin/operations/tickets?status=open&priority=urgent" \
  -H "Authorization: Bearer <token>"
```

---

### GET /admin/operations/moderation

Get the content moderation queue.

**Authentication:** Bearer token (admin role required)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `type` | string | - | Content type: `course`, `comment`, `profile`, `forum_post` |
| `status` | string | `pending` | Filter: `pending`, `approved`, `rejected` |
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Results per page |

**Response 200:**

```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "id": "mod-001",
        "content_type": "course",
        "content_id": "course-015",
        "title": "New course submission: Art for Grade 3",
        "submitted_by": "Instructor Mwangi",
        "status": "pending",
        "ai_review": {
          "safety_score": 98,
          "quality_score": 85,
          "recommendation": "approve",
          "flags": []
        },
        "submitted_at": "2026-02-14T16:00:00Z"
      },
      {
        "id": "mod-002",
        "content_type": "forum_post",
        "content_id": "post-089",
        "title": "Forum post flagged for review",
        "submitted_by": "Student Zuri A.",
        "status": "pending",
        "ai_review": {
          "safety_score": 62,
          "quality_score": 70,
          "recommendation": "review",
          "flags": ["potentially_inappropriate_language"]
        },
        "submitted_at": "2026-02-15T08:00:00Z"
      }
    ],
    "total": 12,
    "page": 1,
    "limit": 20
  }
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/admin/operations/moderation?status=pending" \
  -H "Authorization: Bearer <token>"
```

---

### GET /admin/operations/audit-logs

Get platform audit logs for compliance and security tracking.

**Authentication:** Bearer token (admin role required)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `action` | string | - | Filter: `role_change`, `restriction`, `login`, `data_access`, `config_change` |
| `user_id` | UUID | - | Filter by acting user |
| `target_id` | UUID | - | Filter by target user/resource |
| `start_date` | datetime | - | Start of date range |
| `end_date` | datetime | - | End of date range |
| `page` | integer | 1 | Page number |
| `limit` | integer | 50 | Results per page |

**Response 200:**

```json
{
  "status": "success",
  "data": {
    "logs": [
      {
        "id": "log-001",
        "action": "role_change",
        "actor": {
          "id": "admin-001",
          "name": "Admin User",
          "role": "admin"
        },
        "target": {
          "id": "user-025",
          "name": "New Instructor",
          "type": "user"
        },
        "details": {
          "previous_role": "student",
          "new_role": "instructor",
          "reason": "Approved instructor application"
        },
        "ip_address": "192.168.1.100",
        "user_agent": "Mozilla/5.0...",
        "timestamp": "2026-02-15T10:00:00Z"
      }
    ],
    "total": 1500,
    "page": 1,
    "limit": 50
  }
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/admin/operations/audit-logs?action=role_change&limit=20" \
  -H "Authorization: Bearer <token>"
```

---

## Permissions

### GET /admin/permissions

Get the roles and permissions matrix showing what each role can access.

**Authentication:** Bearer token (admin role required)

**Response 200:**

```json
{
  "status": "success",
  "data": {
    "roles": [
      {
        "name": "student",
        "description": "Student with access to learning features",
        "permissions": [
          "view_own_dashboard",
          "access_ai_tutor",
          "view_courses",
          "enroll_courses",
          "submit_assessments",
          "manage_own_profile",
          "community_features"
        ]
      },
      {
        "name": "parent",
        "description": "Parent with access to children monitoring",
        "permissions": [
          "view_own_dashboard",
          "view_children_progress",
          "manage_children_settings",
          "manage_payments",
          "communicate_with_teachers"
        ]
      },
      {
        "name": "instructor",
        "description": "Instructor with course management access",
        "permissions": [
          "view_own_dashboard",
          "manage_own_courses",
          "create_assessments",
          "host_sessions",
          "view_student_interactions",
          "manage_earnings"
        ]
      },
      {
        "name": "staff",
        "description": "Staff with operational access",
        "permissions": [
          "view_staff_dashboard",
          "moderate_content",
          "manage_tickets",
          "live_support",
          "view_student_journeys",
          "manage_knowledge_base"
        ]
      },
      {
        "name": "admin",
        "description": "Full platform access",
        "permissions": [
          "all"
        ]
      },
      {
        "name": "partner",
        "description": "Partner with sponsorship access",
        "permissions": [
          "view_partner_dashboard",
          "manage_sponsorships",
          "view_analytics",
          "manage_budget"
        ]
      }
    ]
  }
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/admin/permissions" \
  -H "Authorization: Bearer <token>"
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
  "detail": "Admin access required"
}
```

### 404 Not Found

```json
{
  "detail": "Resource not found"
}
```

### 500 Internal Server Error

```json
{
  "status": "error",
  "detail": "Failed to fetch dashboard overview."
}
```
