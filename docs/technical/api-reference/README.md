# API Reference

**Urban Home School (UHS v1) / Urban Bird v1**
*REST API Documentation*

Version: 1.0.0
Last Updated: 2026-02-15

---

## Table of Contents

1. [Base URL](#base-url)
2. [Authentication](#authentication)
3. [Common Response Formats](#common-response-formats)
4. [Rate Limiting](#rate-limiting)
5. [Pagination](#pagination)
6. [API Route Groups](#api-route-groups)
7. [Interactive Documentation](#interactive-documentation)

---

## Base URL

All API endpoints are prefixed with the versioned API path:

```
http://localhost:8000/api/v1
```

**Production:**

```
https://api.urbanhomeschool.ke/api/v1
```

The root endpoint (`GET /`) returns application metadata:

```bash
curl http://localhost:8000/
```

```json
{
  "name": "Urban Home School",
  "version": "1.0.0",
  "status": "running",
  "environment": "development",
  "docs": "/docs",
  "redoc": "/redoc",
  "api": "/api/v1"
}
```

A health check endpoint is also available:

```bash
curl http://localhost:8000/health
```

```json
{
  "status": "healthy",
  "version": "1.0.0",
  "environment": "development",
  "database": {
    "status": "connected",
    "healthy": true
  }
}
```

---

## Authentication

The API uses **JWT (JSON Web Token) Bearer authentication**. Most endpoints require a valid access token in the `Authorization` header.

### Obtaining Tokens

1. **Register** a new account:

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "SecurePass1!",
    "role": "student",
    "profile_data": {
      "full_name": "John Doe",
      "grade_level": "Grade 7"
    }
  }'
```

2. **Login** to get access and refresh tokens:

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "SecurePass1!"
  }'
```

Response:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

3. **Use the token** in subsequent requests:

```bash
curl -X GET http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Token Lifecycle

| Token | Lifetime | Purpose |
|-------|----------|---------|
| Access Token | 30 minutes | API authentication |
| Refresh Token | 7 days | Obtaining new access tokens |

### Token Refresh

When your access token expires, use the refresh token to obtain a new one:

```bash
curl -X POST http://localhost:8000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}'
```

### Logout (Token Invalidation)

To invalidate a token, call the logout endpoint. The token is added to a Redis blacklist for the remainder of its lifetime:

```bash
curl -X POST http://localhost:8000/api/v1/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Common Response Formats

### Success Response

Standard successful responses return the requested data directly:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "role": "student",
  "is_active": true,
  "is_verified": false,
  "profile_data": {
    "full_name": "John Doe"
  },
  "created_at": "2026-02-15T10:30:00Z",
  "last_login": null
}
```

### Paginated Response

List endpoints return paginated results:

```json
{
  "courses": [ ... ],
  "total": 42,
  "skip": 0,
  "limit": 20,
  "has_more": true
}
```

### Error Response (HTTP Errors)

```json
{
  "detail": "Course not found",
  "status_code": 404,
  "path": "/api/v1/courses/invalid-id"
}
```

### Validation Error Response (422)

```json
{
  "detail": "Validation error",
  "status_code": 422,
  "path": "/api/v1/auth/register",
  "errors": [
    {
      "type": "value_error",
      "loc": ["body", "password"],
      "msg": "Password must contain at least one uppercase letter",
      "input": "weakpass"
    }
  ]
}
```

### Common HTTP Status Codes

| Code | Meaning | Typical Use |
|------|---------|------------|
| `200` | OK | Successful GET, PUT, POST |
| `201` | Created | Successful resource creation |
| `204` | No Content | Successful DELETE |
| `400` | Bad Request | Invalid input data |
| `401` | Unauthorized | Missing or invalid token |
| `403` | Forbidden | Insufficient role/permissions |
| `404` | Not Found | Resource does not exist |
| `422` | Unprocessable Entity | Request validation failed |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Unexpected server error |
| `501` | Not Implemented | Feature not yet available |

---

## Rate Limiting

The API implements rate limiting to protect against abuse. Rate limits are enforced at both the Nginx proxy layer and the application layer.

| Endpoint Category | Rate Limit | Window |
|-------------------|-----------|--------|
| Authentication (`/auth/*`) | 10 requests | Per minute |
| AI Tutor (`/ai-tutor/*`) | 30 requests | Per minute |
| Payment Initiation (`/payments/initiate`) | 5 requests | Per minute |
| General API | 100 requests | Per minute |

When rate limited, the API returns:

```json
{
  "detail": "Rate limit exceeded. Please try again later.",
  "status_code": 429
}
```

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1708012345
```

---

## Pagination

List endpoints support pagination via query parameters:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `skip` | integer | `0` | Number of records to skip (offset) |
| `limit` | integer | `20` | Maximum number of records to return (max: 100) |

Example:

```bash
# Get the second page of courses (20 per page)
curl "http://localhost:8000/api/v1/courses/?skip=20&limit=20"
```

---

## API Route Groups

### Core APIs

These are the shared API endpoints accessible based on role permissions.

| Route Group | Prefix | Documentation | Description |
|-------------|--------|--------------|-------------|
| **Authentication** | `/api/v1/auth` | [authentication.md](authentication.md) | Registration, login, token management, password reset |
| **AI Tutor** | `/api/v1/ai-tutor` | [ai-tutor.md](ai-tutor.md) | AI tutoring chat, conversation history, tutor status |
| **Courses** | `/api/v1/courses` | [courses.md](courses.md) | Course CRUD, enrollment, ratings, progress tracking |
| **Payments** | `/api/v1/payments` | [payments.md](payments.md) | Payment processing, wallets, transactions, refunds |
| **Assessments** | `/api/v1/assessments` | -- | Quizzes, assignments, exams, grading |
| **Users** | `/api/v1/users` | -- | User profile management, password changes |
| **Parents** | `/api/v1/parents` | -- | Parent-student linking |
| **Forum** | `/api/v1/forum` | -- | Community discussion forum |
| **Notifications** | `/api/v1/notifications` | -- | Push notification management |
| **Store** | `/api/v1/store` | -- | E-commerce educational store |
| **Certificates** | `/api/v1/certificates` | -- | Course completion certificates |
| **Categories** | `/api/v1/categories` | -- | CBC learning area categories |
| **Search** | `/api/v1/search` | -- | Global search across content |
| **Contact** | `/api/v1/contact` | -- | Contact form submissions |
| **Instructor Applications** | `/api/v1/instructor-applications` | -- | Apply to become an instructor |
| **AI Agent Profile** | `/api/v1/ai-agent-profile` | -- | Per-user AI agent customization |

### Student Dashboard APIs

| Route Group | Prefix | Description |
|-------------|--------|-------------|
| Dashboard Overview | `/api/v1/student/dashboard` | Student home dashboard data |
| AI Tutor (Student) | `/api/v1/student/ai-tutor` | Student-specific AI tutor interface |
| Progress & Gamification | `/api/v1/student/progress` | Learning progress, achievements, streaks |
| Learning | `/api/v1/student/learning` | Courses, enrollments, live sessions |
| Community | `/api/v1/student/community` | Friends, study groups, shoutouts |
| Wallet | `/api/v1/student/wallet` | Student wallet and payments |
| Support | `/api/v1/student/support` | Help, guides, support tickets |
| Account | `/api/v1/student/account` | Notifications, profile, preferences, privacy |

### Parent Dashboard APIs

| Route Group | Prefix | Description |
|-------------|--------|-------------|
| Dashboard Overview | `/api/v1/parent/dashboard` | Parent home dashboard data |
| Children Management | `/api/v1/parent/children` | Manage linked children |
| AI Insights | `/api/v1/parent/ai-insights` | AI-generated insights about children's learning |
| Communications | `/api/v1/parent/communications` | Messages and announcements |
| Finance | `/api/v1/parent/finance` | Payment history, billing |
| M-Pesa | `/api/v1/parent/mpesa` | M-Pesa specific payment actions |
| Reports | `/api/v1/parent/reports` | Children's progress reports |
| Settings | `/api/v1/parent/settings` | Parent account settings |

### Instructor Dashboard APIs

| Route Group | Prefix | Description |
|-------------|--------|-------------|
| Dashboard Overview | `/api/v1/instructor/dashboard` | Instructor home dashboard data |
| Account | `/api/v1/instructor/account` | Profile and preferences |
| Earnings | `/api/v1/instructor/earnings` | Revenue tracking and payouts |
| Courses | `/api/v1/instructor/courses` | Course management for instructors |
| Assessments | `/api/v1/instructor/assessments` | Assessment creation and grading |
| Sessions | `/api/v1/instructor/sessions` | Live session scheduling and management |
| Interactions | `/api/v1/instructor/interactions` | Student interactions and communications |
| Impact & Recognition | `/api/v1/instructor/impact` | Teaching impact metrics and awards |
| Hub & Community | `/api/v1/instructor/hub` | Instructor community and collaboration |
| Resources | `/api/v1/instructor/resources` | Teaching resources and materials |
| AI Insights | `/api/v1/instructor/insights` | AI-powered teaching insights |

### Admin Dashboard APIs

| Route Group | Prefix | Description |
|-------------|--------|-------------|
| Dashboard Overview | `/api/v1/admin/dashboard` | Admin home dashboard, platform metrics |
| AI Providers | `/api/v1/admin/ai-providers` | Manage AI provider configurations |
| Analytics | `/api/v1/admin/analytics` | Platform-wide analytics |
| Advanced Analytics | `/api/v1/admin/advanced-analytics` | Detailed reports and cohort analysis |
| Users | `/api/v1/admin/users` | User management (CRUD, roles, status) |
| Content | `/api/v1/admin/content` | Content moderation and management |
| AI Monitoring | `/api/v1/admin/ai-monitoring` | Monitor AI provider usage and costs |
| Finance | `/api/v1/admin/finance` | Revenue, payouts, financial reports |
| Operations | `/api/v1/admin/operations` | Tickets, moderation, system config |
| Account | `/api/v1/admin/account` | Admin profile and preferences |
| Permissions | `/api/v1/admin/permissions` | RBAC permission management |
| Platform Pulse | `/api/v1/admin/pulse` | Real-time platform monitoring |
| Families | `/api/v1/admin/families` | Family and enrollment management |
| Restrictions | `/api/v1/admin/restrictions` | User restrictions and appeals |
| System Health | `/api/v1/admin/system-health` | Error logs, test runner, AI diagnosis |

### Staff Dashboard APIs

| Route Group | Prefix | Description |
|-------------|--------|-------------|
| Dashboard Overview | `/api/v1/staff/dashboard` | Staff home dashboard |
| Moderation | `/api/v1/staff/moderation` | Content moderation and quality control |
| Support | `/api/v1/staff/support` | Support ticket management |
| Live Support | `/api/v1/staff/live-support` | Real-time chat support |
| Student Journeys | `/api/v1/staff/students` | Student journey tracking |
| Knowledge Base | `/api/v1/staff/kb` | Knowledge base articles |
| Content Studio | `/api/v1/staff/content` | Content creation tools |
| Assessments | `/api/v1/staff/assessments` | Assessment builder |
| Sessions | `/api/v1/staff/sessions` | Session management and live delivery |
| Insights | `/api/v1/staff/insights` | Insights and impact reporting |
| Reports | `/api/v1/staff/reports` | Custom report generation |
| Student Progress | `/api/v1/staff/progress` | Student progress monitoring |
| Team | `/api/v1/staff/team` | Team management and growth |
| Account | `/api/v1/staff/account` | Staff account settings |
| Notifications | `/api/v1/staff/notifications` | Staff notification management |

### Partner Dashboard APIs

| Route Group | Prefix | Description |
|-------------|--------|-------------|
| Dashboard Overview | `/api/v1/partner/dashboard` | Partner home dashboard |
| Sponsorships | `/api/v1/partner/sponsorships` | Sponsorship program management |
| Finance | `/api/v1/partner/finance` | Financial tracking and contributions |
| Analytics | `/api/v1/partner/analytics` | Campaign and impact analytics |
| Content | `/api/v1/partner/content` | Partner-contributed content |
| Support | `/api/v1/partner/support` | Partner support channel |
| Account | `/api/v1/partner/account` | Partner account settings |
| Collaboration | `/api/v1/partner/collaboration` | Cross-partner collaboration tools |

### WebSocket Endpoints

These are not REST endpoints but WebSocket connections for real-time features.

| Endpoint | Auth | Description |
|----------|------|-------------|
| `ws://localhost:8000/ws/admin/{token}` | JWT (admin/staff) | Admin real-time updates |
| `ws://localhost:8000/ws/staff/{token}` | JWT (staff/admin) | Staff real-time updates |
| `ws://localhost:8000/ws/instructor/{token}` | JWT (instructor) | Instructor real-time updates |
| `ws://localhost:8000/ws/parent/{token}` | JWT (parent) | Parent real-time updates |
| `ws://localhost:8000/ws/student/{token}` | JWT (student) | Student real-time updates |
| `ws://localhost:8000/ws/partner/{token}` | JWT (partner) | Partner real-time updates |
| `ws://localhost:8000/ws/yjs/{doc_id}/{token}` | JWT (staff/admin/instructor) | Collaborative document editing |
| `ws://localhost:8000/ws/support-chat/{ticket_id}/{token}` | JWT (any) | Live support chat |
| `ws://localhost:8000/ws/webrtc/{room_id}/{token}` | JWT (instructor/student/staff/admin) | WebRTC video session signaling |

---

## Interactive Documentation

When the backend server is running, you can access interactive API documentation:

- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs) -- Interactive API explorer with "Try it out" functionality
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc) -- Clean, readable API reference
- **OpenAPI JSON**: [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json) -- Machine-readable API specification

These are auto-generated from the FastAPI route definitions and Pydantic schemas, so they always reflect the current state of the codebase.
