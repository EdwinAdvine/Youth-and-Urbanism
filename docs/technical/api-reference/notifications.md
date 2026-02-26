# Notifications API Reference

> **Base URL:** `/api/v1/notifications`
>
> **Authentication:** All endpoints require a valid JWT Bearer token.
>
> **Version:** 1.0 &mdash; Urban Home School (The Bird AI)

---

## Table of Contents

1. [Get Notifications](#1-get-notifications)
2. [Mark Notification as Read](#2-mark-notification-as-read)
3. [Mark All as Read](#3-mark-all-as-read)
4. [Get Notification Preferences](#4-get-notification-preferences)
5. [Update Notification Preferences](#5-update-notification-preferences)
6. [Error Codes](#error-codes)
7. [Data Models](#data-models)

---

## 1. Get Notifications

Retrieve a paginated list of notifications for the authenticated user.

### Request

```
GET /api/v1/notifications/
```

| Parameter | Location | Type    | Required | Description |
|-----------|----------|---------|----------|-------------|
| `page`    | query    | integer | No       | Page number (default: `1`). |
| `limit`   | query    | integer | No       | Items per page (default: `20`, max: `100`). |
| `is_read` | query    | boolean | No       | Filter by read status. `true` for read, `false` for unread. Omit for all. |
| `type`    | query    | string  | No       | Filter by notification type. See [Notification Types](#notification-types). |

### Headers

| Header          | Value               |
|-----------------|---------------------|
| `Authorization` | `Bearer <token>`    |

### Response `200 OK`

```json
{
  "status": "success",
  "data": {
    "notifications": [
      {
        "id": "n1a2b3c4-d5e6-7890-abcd-ef1234567890",
        "type": "assignment",
        "title": "New Assignment Available",
        "message": "Your instructor has posted a new assignment: 'Grade 5 Science - Plant Anatomy' due on Feb 20, 2026.",
        "is_read": false,
        "action_url": "/courses/c1d2e3f4/assessments/a1b2c3d4",
        "action_label": "View Assignment",
        "metadata": {
          "course_id": "c1d2e3f4-a5b6-7890-cdef-123456789012",
          "assessment_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
        },
        "created_at": "2026-02-15T08:00:00Z",
        "read_at": null
      },
      {
        "id": "n2b3c4d5-e6f7-8901-bcde-f12345678901",
        "type": "achievement",
        "title": "Badge Earned!",
        "message": "Congratulations! You earned the 'Math Whiz' badge for completing 10 math quizzes.",
        "is_read": true,
        "action_url": "/profile/badges",
        "action_label": "View Badge",
        "metadata": {
          "badge_id": "b1a2b3c4-d5e6-7890-abcd-ef1234567890",
          "badge_name": "Math Whiz"
        },
        "created_at": "2026-02-14T16:30:00Z",
        "read_at": "2026-02-14T17:00:00Z"
      }
    ],
    "unread_count": 5,
    "pagination": {
      "page": 1,
      "limit": 20,
      "total_items": 47,
      "total_pages": 3
    }
  }
}
```

### cURL Example

```bash
# Get unread notifications only
curl -X GET "http://localhost:8000/api/v1/notifications/?is_read=false&page=1&limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 2. Mark Notification as Read

Mark a single notification as read for the authenticated user.

### Request

```
PUT /api/v1/notifications/{notification_id}/read
```

| Parameter         | Location | Type          | Required | Description |
|-------------------|----------|---------------|----------|-------------|
| `notification_id` | path     | string (UUID) | Yes      | The notification to mark as read. |

### Headers

| Header          | Value               |
|-----------------|---------------------|
| `Authorization` | `Bearer <token>`    |

### Response `200 OK`

```json
{
  "status": "success",
  "data": {
    "id": "n1a2b3c4-d5e6-7890-abcd-ef1234567890",
    "is_read": true,
    "read_at": "2026-02-15T09:00:00Z"
  },
  "message": "Notification marked as read."
}
```

### Error Responses

| Status | Description |
|--------|-------------|
| `401 Unauthorized` | Missing or invalid JWT token. |
| `403 Forbidden` | Notification does not belong to the authenticated user. |
| `404 Not Found` | Notification not found. |

### cURL Example

```bash
curl -X PUT "http://localhost:8000/api/v1/notifications/n1a2b3c4-d5e6-7890-abcd-ef1234567890/read" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 3. Mark All as Read

Mark all unread notifications as read for the authenticated user.

### Request

```
PUT /api/v1/notifications/read-all
```

### Headers

| Header          | Value               |
|-----------------|---------------------|
| `Authorization` | `Bearer <token>`    |

### Response `200 OK`

```json
{
  "status": "success",
  "data": {
    "updated_count": 5,
    "read_at": "2026-02-15T09:05:00Z"
  },
  "message": "All notifications marked as read."
}
```

### Error Responses

| Status | Description |
|--------|-------------|
| `401 Unauthorized` | Missing or invalid JWT token. |

### cURL Example

```bash
curl -X PUT "http://localhost:8000/api/v1/notifications/read-all" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 4. Get Notification Preferences

Retrieve the authenticated user's notification preferences, controlling which notification types they wish to receive and through which channels.

### Request

```
GET /api/v1/notifications/preferences
```

### Headers

| Header          | Value               |
|-----------------|---------------------|
| `Authorization` | `Bearer <token>`    |

### Response `200 OK`

```json
{
  "status": "success",
  "data": {
    "user_id": "u1a2b3c4-d5e6-7890-abcd-ef1234567890",
    "preferences": {
      "assignment": {
        "in_app": true,
        "email": true,
        "push": true
      },
      "quiz": {
        "in_app": true,
        "email": false,
        "push": true
      },
      "course": {
        "in_app": true,
        "email": true,
        "push": false
      },
      "message": {
        "in_app": true,
        "email": true,
        "push": true
      },
      "forum": {
        "in_app": true,
        "email": false,
        "push": false
      },
      "achievement": {
        "in_app": true,
        "email": false,
        "push": true
      },
      "system": {
        "in_app": true,
        "email": true,
        "push": true
      },
      "payment": {
        "in_app": true,
        "email": true,
        "push": true
      },
      "ai": {
        "in_app": true,
        "email": false,
        "push": false
      },
      "moderation": {
        "in_app": true,
        "email": true,
        "push": false
      },
      "enrollment": {
        "in_app": true,
        "email": true,
        "push": true
      }
    },
    "quiet_hours": {
      "enabled": false,
      "start": "22:00",
      "end": "07:00",
      "timezone": "Africa/Nairobi"
    },
    "updated_at": "2026-02-10T12:00:00Z"
  }
}
```

### cURL Example

```bash
curl -X GET "http://localhost:8000/api/v1/notifications/preferences" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 5. Update Notification Preferences

Update the authenticated user's notification preferences.

### Request

```
PUT /api/v1/notifications/preferences
```

### Headers

| Header          | Value               |
|-----------------|---------------------|
| `Authorization` | `Bearer <token>`    |
| `Content-Type`  | `application/json`  |

### Request Body

```json
{
  "preferences": {
    "forum": {
      "in_app": true,
      "email": true,
      "push": false
    },
    "achievement": {
      "in_app": true,
      "email": true,
      "push": true
    }
  },
  "quiet_hours": {
    "enabled": true,
    "start": "22:00",
    "end": "07:00",
    "timezone": "Africa/Nairobi"
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `preferences` | object | No | Partial update of notification type preferences. Only include the types you want to change. |
| `preferences.<type>` | object | No | Per-type channel settings. |
| `preferences.<type>.in_app` | boolean | No | Enable/disable in-app notifications. |
| `preferences.<type>.email` | boolean | No | Enable/disable email notifications. |
| `preferences.<type>.push` | boolean | No | Enable/disable push notifications. |
| `quiet_hours` | object | No | Quiet hours configuration. |
| `quiet_hours.enabled` | boolean | No | Whether quiet hours are active. |
| `quiet_hours.start` | string | No | Start time in `HH:MM` format. |
| `quiet_hours.end` | string | No | End time in `HH:MM` format. |
| `quiet_hours.timezone` | string | No | IANA timezone string (e.g., `Africa/Nairobi`). |

### Response `200 OK`

```json
{
  "status": "success",
  "data": {
    "preferences": {
      "forum": {
        "in_app": true,
        "email": true,
        "push": false
      },
      "achievement": {
        "in_app": true,
        "email": true,
        "push": true
      }
    },
    "quiet_hours": {
      "enabled": true,
      "start": "22:00",
      "end": "07:00",
      "timezone": "Africa/Nairobi"
    },
    "updated_at": "2026-02-15T09:10:00Z"
  },
  "message": "Notification preferences updated."
}
```

### Error Responses

| Status | Description |
|--------|-------------|
| `400 Bad Request` | Invalid preference type or channel. |
| `401 Unauthorized` | Missing or invalid JWT token. |
| `422 Unprocessable Entity` | Invalid time format or timezone. |

### cURL Example

```bash
curl -X PUT "http://localhost:8000/api/v1/notifications/preferences" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "preferences": {
      "forum": {"in_app": true, "email": true, "push": false}
    },
    "quiet_hours": {
      "enabled": true,
      "start": "22:00",
      "end": "07:00",
      "timezone": "Africa/Nairobi"
    }
  }'
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
| `400` | Malformed request body or invalid parameters. |
| `401` | Authentication token missing, expired, or invalid. |
| `403` | User does not have permission (e.g., accessing another user's notification). |
| `404` | Requested resource does not exist. |
| `422` | Request body is well-formed but semantically invalid. |
| `500` | Unexpected server error. |

---

## Data Models

### Notification

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique notification identifier. |
| `user_id` | UUID | FK to the recipient user. Indexed. |
| `type` | enum | Notification category. Indexed. See [Notification Types](#notification-types). |
| `title` | string (max 255) | Short notification title. |
| `message` | text | Notification body text. |
| `is_read` | boolean | Whether the user has read this notification. Indexed. |
| `action_url` | string (max 500) or null | Optional URL to navigate to when the notification is clicked. |
| `action_label` | string (max 100) or null | Optional button/link label (e.g., "View Assignment"). |
| `metadata` | JSONB | Flexible field for extra context (course_id, assessment_id, etc.). |
| `created_at` | datetime | When the notification was created. Indexed. |
| `read_at` | datetime or null | When the notification was read. |

### Notification Types

| Type | Description |
|------|-------------|
| `assignment` | New assignment posted or graded. |
| `quiz` | Quiz available, graded, or reminder. |
| `course` | Course updates, new content, announcements. |
| `message` | Direct messages from instructors or parents. |
| `forum` | Replies to posts, mentions, solution marks. |
| `achievement` | Badges earned, levels gained, milestones. |
| `system` | Platform announcements, maintenance notices. |
| `payment` | Payment confirmations, receipts, subscription alerts. |
| `ai` | AI tutor suggestions, learning path updates. |
| `moderation` | Content moderation actions (post flagged, etc.). |
| `enrollment` | Enrollment confirmations, course access granted. |
