# Parent Dashboard API Reference

**Base URL:** `http://localhost:8000/api/v1`
**Authentication:** Bearer JWT token required on all endpoints
**Required Role:** `parent`

All endpoints enforce role-based access control via the `require_parent_role` dependency. Requests from non-parent roles receive a `403 Forbidden` response.

---

## Table of Contents

- [Dashboard Home](#dashboard-home)
  - [GET /parent/dashboard/overview](#get-parentdashboardoverview)
  - [GET /parent/dashboard/highlights](#get-parentdashboardhighlights)
  - [GET /parent/dashboard/urgent](#get-parentdashboardurgent)
  - [POST /parent/dashboard/mood](#post-parentdashboardmood)
  - [GET /parent/dashboard/mood/history](#get-parentdashboardmoodhistory)
  - [GET /parent/dashboard/ai-summary](#get-parentdashboardai-summary)
- [Children](#children)
  - [GET /parent/children/{child_id}/progress](#get-parentchildrenchild_idprogress)
  - [GET /parent/children/{child_id}/ai-insights](#get-parentchildrenchild_idai-insights)
  - [GET /parent/children/{child_id}/cbc-competencies](#get-parentchildrenchild_idcbc-competencies)
  - [GET /parent/children/{child_id}/goals](#get-parentchildrenchild_idgoals)
  - [PUT /parent/children/{child_id}/goals](#put-parentchildrenchild_idgoals)
- [Communications](#communications)
  - [GET /parent/communications/messages](#get-parentcommunicationsmessages)
  - [GET /parent/communications/notifications](#get-parentcommunicationsnotifications)
- [Finance](#finance)
  - [GET /parent/finance/wallet](#get-parentfinancewallet)
  - [GET /parent/finance/transactions](#get-parentfinancetransactions)
- [M-Pesa](#m-pesa)
  - [POST /parent/mpesa/initiate](#post-parentmpesainitiate)
- [Reports](#reports)
  - [GET /parent/reports](#get-parentreports)
  - [GET /parent/reports/term-summary](#get-parentreportsterm-summary)
- [Settings](#settings)
  - [GET /parent/settings/consent](#get-parentsettingsconsent)
  - [PUT /parent/settings/privacy](#put-parentsettingsprivacy)

---

## Dashboard Home

### GET /parent/dashboard/overview

Get a comprehensive family overview for the dashboard home. Provides aggregate statistics across all children linked to the parent account.

**Authentication:** Bearer token (parent role required)

**Response 200:**

```json
{
  "total_children": 3,
  "active_today": 2,
  "total_minutes_today": 145,
  "total_sessions_today": 5,
  "children": [
    {
      "id": "child-001",
      "name": "Amani Kimani",
      "grade_level": 5,
      "avatar_url": "/avatars/amani.png",
      "is_online": true,
      "current_activity": "Mathematics - Fractions",
      "minutes_today": 75,
      "sessions_today": 3,
      "mood": {
        "emoji": "happy",
        "energy_level": 4,
        "recorded_at": "2026-02-15T08:30:00Z"
      },
      "performance": {
        "weekly_average": 82,
        "trend": "improving",
        "strongest_subject": "Mathematics"
      },
      "alerts": []
    },
    {
      "id": "child-002",
      "name": "Baraka Kimani",
      "grade_level": 3,
      "avatar_url": "/avatars/baraka.png",
      "is_online": true,
      "current_activity": "Reading - Chapter Books",
      "minutes_today": 70,
      "sessions_today": 2,
      "mood": null,
      "performance": {
        "weekly_average": 75,
        "trend": "stable",
        "strongest_subject": "Kiswahili"
      },
      "alerts": [
        {
          "type": "low_engagement",
          "message": "Baraka has been less active in Science this week"
        }
      ]
    }
  ],
  "family_streak": 12,
  "weekly_averages": {
    "minutes_per_day": 120,
    "sessions_per_day": 4,
    "completion_rate": 78
  }
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/parent/dashboard/overview" \
  -H "Authorization: Bearer <token>"
```

---

### GET /parent/dashboard/highlights

Get AI-generated highlights for today. Includes achievements, milestones, and warnings across all children.

**Authentication:** Bearer token (parent role required)

**Response 200:**

```json
{
  "highlights": [
    {
      "id": "hl-001",
      "type": "achievement",
      "child_name": "Amani Kimani",
      "title": "New Badge Earned",
      "description": "Amani earned the 'Math Whiz' badge for scoring 90%+ on 5 consecutive math quizzes.",
      "icon": "trophy",
      "timestamp": "2026-02-15T09:30:00Z"
    },
    {
      "id": "hl-002",
      "type": "milestone",
      "child_name": "Baraka Kimani",
      "title": "Course Halfway Done",
      "description": "Baraka is 50% through the Kiswahili Mastery course.",
      "icon": "flag",
      "timestamp": "2026-02-15T08:00:00Z"
    },
    {
      "id": "hl-003",
      "type": "warning",
      "child_name": "Baraka Kimani",
      "title": "Declining Engagement",
      "description": "Baraka's Science activity has dropped 30% this week compared to last week.",
      "icon": "alert-triangle",
      "timestamp": "2026-02-15T07:00:00Z"
    }
  ],
  "ai_summary": "Amani is thriving in Mathematics with consistent high scores. Baraka may need encouragement in Science, though he is making steady progress in Kiswahili."
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/parent/dashboard/highlights" \
  -H "Authorization: Bearer <token>"
```

---

### GET /parent/dashboard/urgent

Get urgent items requiring immediate parent attention, including critical AI alerts, upcoming deadlines, pending consent requests, and low engagement warnings.

**Authentication:** Bearer token (parent role required)

**Response 200:**

```json
{
  "urgent_items": [
    {
      "id": "urg-001",
      "severity": "critical",
      "type": "consent_required",
      "title": "Field Trip Consent Needed",
      "description": "Amani's class has a virtual field trip on Feb 18. Your consent is required.",
      "child_name": "Amani Kimani",
      "action_url": "/settings/consent/urg-001",
      "due_date": "2026-02-17T23:59:59Z",
      "created_at": "2026-02-14T10:00:00Z"
    },
    {
      "id": "urg-002",
      "severity": "warning",
      "type": "low_engagement",
      "title": "Science Engagement Drop",
      "description": "Baraka has not opened any Science lessons in 5 days.",
      "child_name": "Baraka Kimani",
      "action_url": "/children/child-002/progress",
      "created_at": "2026-02-15T06:00:00Z"
    },
    {
      "id": "urg-003",
      "severity": "warning",
      "type": "deadline",
      "title": "Assignment Due Tomorrow",
      "description": "Amani has an incomplete English assignment due Feb 16.",
      "child_name": "Amani Kimani",
      "due_date": "2026-02-16T23:59:59Z",
      "created_at": "2026-02-15T07:00:00Z"
    }
  ],
  "total_count": 3
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/parent/dashboard/urgent" \
  -H "Authorization: Bearer <token>"
```

---

### POST /parent/dashboard/mood

Record a mood entry for a child or the whole family. Allows parents to track their children's emotional well-being over time.

**Authentication:** Bearer token (parent role required)

**Request Body:**

```json
{
  "child_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "emoji": "happy",
  "energy_level": 4,
  "note": "Amani seemed very enthusiastic about school today",
  "recorded_date": "2026-02-15"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `child_id` | UUID | No | Specific child ID, or null for whole family |
| `emoji` | string | Yes | One of: `happy`, `tired`, `anxious`, `excited`, `stressed`, `neutral` |
| `energy_level` | integer | No | Energy level from 1 (low) to 5 (high) |
| `note` | string | No | Additional notes |
| `recorded_date` | date | No | Date of entry (defaults to today) |

**Response 201:**

```json
{
  "id": "mood-001",
  "child_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "emoji": "happy",
  "energy_level": 4,
  "note": "Amani seemed very enthusiastic about school today",
  "recorded_date": "2026-02-15",
  "created_at": "2026-02-15T18:00:00Z"
}
```

**curl:**

```bash
curl -X POST "http://localhost:8000/api/v1/parent/dashboard/mood" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"child_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890", "emoji": "happy", "energy_level": 4}'
```

---

### GET /parent/dashboard/mood/history

Get mood entry history with aggregated insights across children.

**Authentication:** Bearer token (parent role required)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `child_id` | UUID | - | Filter by specific child (omit for all children) |
| `start_date` | date | - | Start of date range |
| `end_date` | date | - | End of date range |
| `limit` | integer | 30 | Maximum number of entries |

**Response 200:**

```json
{
  "entries": [
    {
      "id": "mood-001",
      "child_name": "Amani Kimani",
      "emoji": "happy",
      "energy_level": 4,
      "note": "Enthusiastic about school",
      "recorded_date": "2026-02-15"
    },
    {
      "id": "mood-002",
      "child_name": "Baraka Kimani",
      "emoji": "tired",
      "energy_level": 2,
      "note": null,
      "recorded_date": "2026-02-14"
    }
  ],
  "most_common_mood": "happy",
  "average_energy_level": 3.5,
  "mood_trend": "stable"
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/parent/dashboard/mood/history?limit=14" \
  -H "Authorization: Bearer <token>"
```

---

### GET /parent/dashboard/ai-summary

Get an AI-generated weekly family forecast with insights, engagement predictions, and personalized recommendations.

**Authentication:** Bearer token (parent role required)

**Response 200:**

```json
{
  "weekly_summary": "This week the Kimani family had a productive learning period. Amani excelled in Mathematics, completing 8 lessons with an average score of 87%. Baraka made steady progress in Kiswahili but could benefit from more time in Science.",
  "key_insights": {
    "strengths": [
      "Amani's consistent math performance is above grade average",
      "Family learning streak of 12 days shows great commitment"
    ],
    "concerns": [
      "Baraka's Science engagement dropped by 30% this week"
    ],
    "opportunities": [
      "Amani is ready for advanced Mathematics challenges",
      "Baraka might enjoy the new interactive Science experiments course"
    ]
  },
  "predicted_engagement_trend": "stable",
  "top_recommendations": [
    "Encourage Baraka to try the 'Science Fun' course this week",
    "Consider setting a family study time to boost Science engagement",
    "Amani may benefit from the Math Olympiad preparation course"
  ],
  "generated_at": "2026-02-15T06:00:00Z"
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/parent/dashboard/ai-summary" \
  -H "Authorization: Bearer <token>"
```

---

## Children

### GET /parent/children/{child_id}/progress

Get detailed learning progress for a specific child, including subject-by-subject breakdown, time metrics, and completion rates.

**Authentication:** Bearer token (parent role required)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `child_id` | UUID | The child's student ID |

**Response 200:**

```json
{
  "child_id": "child-001",
  "child_name": "Amani Kimani",
  "grade_level": 5,
  "overall_progress": {
    "courses_enrolled": 4,
    "courses_completed": 1,
    "average_score": 82,
    "total_time_hours": 45.5,
    "streak_days": 7
  },
  "subjects": [
    {
      "name": "Mathematics",
      "progress_percent": 75,
      "average_score": 87,
      "time_spent_hours": 15.2,
      "lessons_completed": 15,
      "total_lessons": 20,
      "trend": "improving",
      "last_activity": "2026-02-15T16:00:00Z"
    },
    {
      "name": "English",
      "progress_percent": 60,
      "average_score": 78,
      "time_spent_hours": 10.8,
      "lessons_completed": 12,
      "total_lessons": 20,
      "trend": "stable",
      "last_activity": "2026-02-14T14:00:00Z"
    }
  ],
  "recent_activities": [
    {
      "type": "lesson_completed",
      "subject": "Mathematics",
      "title": "Fractions - Adding Unlike Denominators",
      "score": 90,
      "completed_at": "2026-02-15T16:00:00Z"
    }
  ]
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/parent/children/a1b2c3d4-e5f6-7890-abcd-ef1234567890/progress" \
  -H "Authorization: Bearer <token>"
```

---

### GET /parent/children/{child_id}/ai-insights

Get AI-generated insights about a specific child's learning patterns, strengths, and areas for improvement.

**Authentication:** Bearer token (parent role required)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `child_id` | UUID | The child's student ID |

**Response 200:**

```json
{
  "child_id": "child-001",
  "child_name": "Amani Kimani",
  "insights": {
    "learning_style": "visual",
    "best_time_of_day": "morning",
    "attention_span_minutes": 35,
    "strongest_competencies": ["numerical_proficiency", "problem_solving"],
    "growth_areas": ["written_expression", "creative_writing"],
    "engagement_pattern": "Amani is most engaged in the first 30 minutes of each session and performs best with visual aids and interactive exercises."
  },
  "recommendations": [
    "Use visual diagrams when explaining new concepts",
    "Schedule the most challenging subjects for morning sessions",
    "Encourage creative writing through story prompts about topics Amani enjoys"
  ],
  "comparison_to_grade": {
    "mathematics": "above_average",
    "english": "at_grade_level",
    "science": "above_average",
    "kiswahili": "at_grade_level"
  },
  "generated_at": "2026-02-15T06:00:00Z"
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/parent/children/a1b2c3d4-e5f6-7890-abcd-ef1234567890/ai-insights" \
  -H "Authorization: Bearer <token>"
```

---

### GET /parent/children/{child_id}/cbc-competencies

Get CBC (Competency-Based Curriculum) tracking data for a child, showing progress across Kenya's CBC core competencies and learning areas.

**Authentication:** Bearer token (parent role required)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `child_id` | UUID | The child's student ID |

**Response 200:**

```json
{
  "child_id": "child-001",
  "child_name": "Amani Kimani",
  "grade_level": 5,
  "term": "Term 1 2026",
  "core_competencies": [
    {
      "name": "Communication and Collaboration",
      "level": "exceeding",
      "score": 88,
      "evidence": ["Active in study groups", "Strong written assignments"]
    },
    {
      "name": "Critical Thinking and Problem Solving",
      "level": "meeting",
      "score": 80,
      "evidence": ["Good quiz performance", "Asks thoughtful questions"]
    },
    {
      "name": "Creativity and Imagination",
      "level": "approaching",
      "score": 68,
      "evidence": ["Needs more creative writing practice"]
    },
    {
      "name": "Digital Literacy",
      "level": "exceeding",
      "score": 92,
      "evidence": ["Navigates platform independently", "Uses AI tutor effectively"]
    },
    {
      "name": "Learning to Learn",
      "level": "meeting",
      "score": 78,
      "evidence": ["Sets goals consistently", "Uses journal reflections"]
    },
    {
      "name": "Self-Efficacy",
      "level": "meeting",
      "score": 76,
      "evidence": ["Growing confidence in Math", "Participates in live sessions"]
    },
    {
      "name": "Citizenship",
      "level": "meeting",
      "score": 82,
      "evidence": ["Sends shoutouts to peers", "Helps in study groups"]
    }
  ],
  "learning_areas": {
    "Mathematics": {"level": "exceeding", "score": 87},
    "English": {"level": "meeting", "score": 78},
    "Kiswahili": {"level": "meeting", "score": 74},
    "Science and Technology": {"level": "meeting", "score": 80},
    "Social Studies": {"level": "approaching", "score": 65}
  }
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/parent/children/a1b2c3d4-e5f6-7890-abcd-ef1234567890/cbc-competencies" \
  -H "Authorization: Bearer <token>"
```

---

### GET /parent/children/{child_id}/goals

Get learning goals for a specific child.

**Authentication:** Bearer token (parent role required)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `child_id` | UUID | The child's student ID |

**Response 200:**

```json
{
  "child_id": "child-001",
  "child_name": "Amani Kimani",
  "goals": [
    {
      "id": "goal-001",
      "title": "Complete 10 math lessons",
      "target": 10,
      "current": 7,
      "unit": "lessons",
      "percentage": 70,
      "deadline": "2026-02-28T23:59:59Z",
      "set_by": "ai",
      "status": "in_progress",
      "created_at": "2026-02-01T08:00:00Z"
    },
    {
      "id": "goal-002",
      "title": "Read 3 storybooks",
      "target": 3,
      "current": 1,
      "unit": "books",
      "percentage": 33,
      "deadline": "2026-02-28T23:59:59Z",
      "set_by": "parent",
      "status": "in_progress",
      "created_at": "2026-02-05T10:00:00Z"
    }
  ]
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/parent/children/a1b2c3d4-e5f6-7890-abcd-ef1234567890/goals" \
  -H "Authorization: Bearer <token>"
```

---

### PUT /parent/children/{child_id}/goals

Set or update learning goals for a specific child.

**Authentication:** Bearer token (parent role required)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `child_id` | UUID | The child's student ID |

**Request Body:**

```json
{
  "goals": [
    {
      "title": "Complete Science course chapter 5",
      "target": 5,
      "unit": "lessons",
      "deadline": "2026-03-15T23:59:59Z"
    },
    {
      "title": "Practice Kiswahili vocabulary daily",
      "target": 30,
      "unit": "days",
      "deadline": "2026-03-31T23:59:59Z"
    }
  ]
}
```

**Response 200:**

```json
{
  "child_id": "child-001",
  "goals_created": 2,
  "goals": [
    {
      "id": "goal-003",
      "title": "Complete Science course chapter 5",
      "target": 5,
      "current": 0,
      "unit": "lessons",
      "deadline": "2026-03-15T23:59:59Z",
      "set_by": "parent",
      "status": "not_started"
    },
    {
      "id": "goal-004",
      "title": "Practice Kiswahili vocabulary daily",
      "target": 30,
      "current": 0,
      "unit": "days",
      "deadline": "2026-03-31T23:59:59Z",
      "set_by": "parent",
      "status": "not_started"
    }
  ],
  "message": "Goals set successfully"
}
```

**curl:**

```bash
curl -X PUT "http://localhost:8000/api/v1/parent/children/a1b2c3d4-e5f6-7890-abcd-ef1234567890/goals" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"goals": [{"title": "Complete Science chapter 5", "target": 5, "unit": "lessons"}]}'
```

---

## Communications

### GET /parent/communications/messages

Get messages between the parent and teachers/staff.

**Authentication:** Bearer token (parent role required)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `type` | string | - | Filter: `teacher`, `system`, `staff` |
| `unread_only` | boolean | `false` | Show only unread messages |
| `limit` | integer | 20 | Maximum messages to return |
| `offset` | integer | 0 | Pagination offset |

**Response 200:**

```json
{
  "messages": [
    {
      "id": "msg-001",
      "from": {
        "name": "Mr. Ochieng",
        "role": "instructor",
        "avatar_url": "/avatars/ochieng.png"
      },
      "subject": "Amani's Math Progress",
      "preview": "I wanted to let you know that Amani has been doing exceptionally well...",
      "is_read": false,
      "child_name": "Amani Kimani",
      "sent_at": "2026-02-15T10:00:00Z"
    }
  ],
  "total": 8,
  "unread_count": 3
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/parent/communications/messages?unread_only=true" \
  -H "Authorization: Bearer <token>"
```

---

### GET /parent/communications/notifications

Get notifications for the parent account, including system alerts and child activity updates.

**Authentication:** Bearer token (parent role required)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `category` | string | - | Filter by category |
| `unread_only` | boolean | `false` | Show only unread |
| `limit` | integer | 50 | Maximum notifications |

**Response 200:**

```json
[
  {
    "id": "notif-001",
    "title": "Amani earned a new badge!",
    "message": "Amani earned the 'Streak Master' badge for 7 consecutive days of learning.",
    "category": "child_achievement",
    "child_name": "Amani Kimani",
    "is_read": false,
    "action_url": "/children/child-001/progress",
    "created_at": "2026-02-15T09:00:00Z"
  },
  {
    "id": "notif-002",
    "title": "Payment received",
    "message": "Your M-Pesa payment of KES 2,500 has been confirmed.",
    "category": "payment",
    "is_read": true,
    "created_at": "2026-02-14T12:00:00Z"
  }
]
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/parent/communications/notifications?unread_only=true" \
  -H "Authorization: Bearer <token>"
```

---

## Finance

### GET /parent/finance/wallet

Get the parent's wallet balance and subscription information.

**Authentication:** Bearer token (parent role required)

**Response 200:**

```json
{
  "balance": 5000,
  "currency": "KES",
  "subscription": {
    "plan": "family_premium",
    "status": "active",
    "children_covered": 3,
    "started_at": "2026-01-01T00:00:00Z",
    "next_billing_date": "2026-03-01T00:00:00Z",
    "monthly_amount": 2500
  },
  "total_spent_this_month": 2500,
  "total_spent_this_term": 7500
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/parent/finance/wallet" \
  -H "Authorization: Bearer <token>"
```

---

### GET /parent/finance/transactions

Get payment and transaction history.

**Authentication:** Bearer token (parent role required)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `type` | string | - | Filter: `payment`, `refund`, `subscription` |
| `limit` | integer | 20 | Results per page |
| `offset` | integer | 0 | Pagination offset |

**Response 200:**

```json
{
  "transactions": [
    {
      "id": "txn-001",
      "type": "subscription",
      "amount": 2500,
      "currency": "KES",
      "description": "Family Premium - February 2026",
      "payment_method": "M-Pesa",
      "mpesa_reference": "QH234RT5",
      "status": "completed",
      "created_at": "2026-02-01T08:00:00Z"
    },
    {
      "id": "txn-002",
      "type": "payment",
      "amount": 750,
      "currency": "KES",
      "description": "Course: Advanced Science for Grade 5",
      "payment_method": "Wallet",
      "child_name": "Amani Kimani",
      "status": "completed",
      "created_at": "2026-02-05T10:00:00Z"
    }
  ],
  "total": 12,
  "limit": 20,
  "offset": 0
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/parent/finance/transactions?type=payment&limit=10" \
  -H "Authorization: Bearer <token>"
```

---

## M-Pesa

### POST /parent/mpesa/initiate

Initiate an M-Pesa STK push payment. Sends a payment prompt directly to the parent's phone.

**Authentication:** Bearer token (parent role required)

**Request Body:**

```json
{
  "phone_number": "254712345678",
  "amount": 2500,
  "description": "Subscription renewal - Family Premium",
  "account_reference": "UHS-SUB-2026-02"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `phone_number` | string | Yes | Safaricom phone number (format: `254XXXXXXXXX`) |
| `amount` | integer | Yes | Amount in KES |
| `description` | string | No | Payment description |
| `account_reference` | string | No | Account reference for M-Pesa |

**Response 200:**

```json
{
  "checkout_request_id": "ws_CO_15022026123456789",
  "merchant_request_id": "1234-5678-90",
  "response_code": "0",
  "response_description": "Success. Request accepted for processing",
  "customer_message": "Success. Request accepted for processing. Please check your phone.",
  "status": "pending",
  "amount": 2500,
  "phone_number": "254712345678"
}
```

**curl:**

```bash
curl -X POST "http://localhost:8000/api/v1/parent/mpesa/initiate" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "254712345678", "amount": 2500, "description": "Subscription renewal"}'
```

---

## Reports

### GET /parent/reports

Get available learning reports for the parent's children.

**Authentication:** Bearer token (parent role required)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `child_id` | UUID | - | Filter by specific child |
| `type` | string | - | Report type: `weekly`, `monthly`, `term` |
| `limit` | integer | 10 | Number of reports to return |

**Response 200:**

```json
{
  "reports": [
    {
      "id": "rpt-001",
      "type": "weekly",
      "title": "Weekly Report - Feb 10-16, 2026",
      "child_name": "Amani Kimani",
      "period_start": "2026-02-10",
      "period_end": "2026-02-16",
      "summary": "Excellent week with consistent engagement across all subjects.",
      "highlights": [
        "Completed 8 Math lessons",
        "Earned 'Streak Master' badge"
      ],
      "generated_at": "2026-02-16T06:00:00Z",
      "download_url": "/api/v1/parent/reports/rpt-001/download"
    }
  ],
  "total": 5
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/parent/reports?type=weekly" \
  -H "Authorization: Bearer <token>"
```

---

### GET /parent/reports/term-summary

Get a comprehensive term summary report across all children, including academic performance, engagement trends, and AI recommendations for the next term.

**Authentication:** Bearer token (parent role required)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `term` | string | current | Term identifier (e.g., `2026-T1`) |

**Response 200:**

```json
{
  "term": "2026-T1",
  "period": {
    "start": "2026-01-06",
    "end": "2026-04-04"
  },
  "children": [
    {
      "name": "Amani Kimani",
      "grade_level": 5,
      "overall_grade": "A-",
      "overall_score": 84,
      "total_time_hours": 120,
      "courses_completed": 2,
      "courses_in_progress": 2,
      "top_subjects": ["Mathematics", "Science"],
      "improvement_areas": ["Creative Writing"],
      "attendance_rate": 95,
      "engagement_score": 88
    },
    {
      "name": "Baraka Kimani",
      "grade_level": 3,
      "overall_grade": "B+",
      "overall_score": 76,
      "total_time_hours": 95,
      "courses_completed": 1,
      "courses_in_progress": 3,
      "top_subjects": ["Kiswahili", "Art"],
      "improvement_areas": ["Science", "Mathematics"],
      "attendance_rate": 88,
      "engagement_score": 72
    }
  ],
  "family_summary": {
    "total_learning_hours": 215,
    "total_courses_completed": 3,
    "family_engagement_trend": "improving",
    "total_spent": 12500
  },
  "ai_recommendations": [
    "Consider enrolling Baraka in the interactive Science experiments course for Term 2",
    "Amani is ready for advanced Math enrichment programs",
    "Schedule a family study time to boost collective engagement"
  ]
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/parent/reports/term-summary?term=2026-T1" \
  -H "Authorization: Bearer <token>"
```

---

## Settings

### GET /parent/settings/consent

Get consent settings and pending consent requests for all children. Covers COPPA compliance, data sharing, and activity-specific consents.

**Authentication:** Bearer token (parent role required)

**Response 200:**

```json
{
  "children": [
    {
      "child_id": "child-001",
      "child_name": "Amani Kimani",
      "consents": {
        "ai_tutoring": {
          "status": "granted",
          "granted_at": "2025-09-01T00:00:00Z",
          "description": "Allow AI-powered tutoring interactions"
        },
        "data_collection": {
          "status": "granted",
          "granted_at": "2025-09-01T00:00:00Z",
          "description": "Allow learning data collection for progress tracking"
        },
        "social_features": {
          "status": "granted",
          "granted_at": "2025-09-01T00:00:00Z",
          "description": "Allow participation in study groups and community features"
        },
        "third_party_sharing": {
          "status": "denied",
          "description": "Share anonymized data with research partners"
        }
      },
      "pending_requests": [
        {
          "id": "consent-req-001",
          "type": "field_trip",
          "title": "Virtual Field Trip to Nairobi National Museum",
          "description": "Consent for Amani to participate in a virtual field trip on Feb 18.",
          "requested_at": "2026-02-14T10:00:00Z",
          "deadline": "2026-02-17T23:59:59Z"
        }
      ]
    }
  ]
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/parent/settings/consent" \
  -H "Authorization: Bearer <token>"
```

---

### PUT /parent/settings/privacy

Update privacy settings for the parent account and linked children.

**Authentication:** Bearer token (parent role required)

**Request Body:**

```json
{
  "share_progress_with_school": true,
  "allow_anonymized_analytics": false,
  "email_marketing": false,
  "children_settings": {
    "child-001": {
      "allow_ai_tutoring": true,
      "allow_social_features": true,
      "allow_data_collection": true,
      "profile_visibility": "friends_only"
    }
  }
}
```

**Response 200:**

```json
{
  "share_progress_with_school": true,
  "allow_anonymized_analytics": false,
  "email_marketing": false,
  "children_settings": {
    "child-001": {
      "allow_ai_tutoring": true,
      "allow_social_features": true,
      "allow_data_collection": true,
      "profile_visibility": "friends_only"
    }
  },
  "message": "Privacy settings updated successfully"
}
```

**curl:**

```bash
curl -X PUT "http://localhost:8000/api/v1/parent/settings/privacy" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"allow_anonymized_analytics": false, "email_marketing": false}'
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
  "detail": "Parent role required"
}
```

### 404 Not Found

```json
{
  "detail": "Child not found or not linked to this parent"
}
```

### 500 Internal Server Error

```json
{
  "detail": "Failed to fetch family overview."
}
```
