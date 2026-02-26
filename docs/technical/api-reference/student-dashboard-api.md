# Student Dashboard API Reference

**Base URL:** `http://localhost:8000/api/v1`
**Authentication:** Bearer JWT token required on all endpoints
**Required Role:** `student`

All endpoints enforce role-based access control. Requests from non-student roles receive a `403 Forbidden` response. Most endpoints also require the authenticated user to have a linked `student_id` profile; requests without one receive `400 Bad Request`.

---

## Table of Contents

- [Dashboard](#dashboard)
  - [GET /student/dashboard/today](#get-studentdashboardtoday)
  - [POST /student/dashboard/mood](#post-studentdashboardmood)
  - [GET /student/dashboard/teacher-sync](#get-studentdashboardteacher-sync)
  - [GET /student/dashboard/quote](#get-studentdashboardquote)
  - [PUT /student/dashboard/daily-plan](#put-studentdashboarddaily-plan)
- [AI Tutor](#ai-tutor)
  - [POST /student/ai/chat](#post-studentaichat)
  - [GET /student/ai/learning-path](#get-studentailearning-path)
  - [GET /student/ai/journal](#get-studentaijournal)
  - [POST /student/ai/journal](#post-studentaijournal)
  - [POST /student/ai/explain](#post-studentaiexplain)
  - [POST /student/ai/teacher-question](#post-studentaiteacher-question)
  - [GET /student/ai/teacher-responses](#get-studentaiteacher-responses)
  - [POST /student/ai/voice](#post-studentaivoice)
- [Progress & Gamification](#progress--gamification)
  - [GET /student/progress/xp](#get-studentprogressxp)
  - [GET /student/progress/badges](#get-studentprogressbadges)
  - [GET /student/progress/leaderboard](#get-studentprogressleaderboard)
  - [GET /student/progress/goals](#get-studentprogressgoals)
  - [POST /student/progress/goals](#post-studentprogressgoals)
  - [GET /student/progress/weekly-report](#get-studentprogressweekly-report)
- [Learning](#learning)
  - [GET /student/learning/courses/enrolled](#get-studentlearningcoursesenrolled)
  - [GET /student/learning/courses/recommended](#get-studentlearningcoursesrecommended)
  - [GET /student/learning/browse](#get-studentlearningbrowse)
  - [GET /student/learning/course/{course_id}/preview](#get-studentlearningcoursecourse_idpreview)
  - [GET /student/learning/wishlist](#get-studentlearningwishlist)
  - [POST /student/learning/wishlist](#post-studentlearningwishlist)
  - [DELETE /student/learning/wishlist/{course_id}](#delete-studentlearningwishlistcourse_id)
  - [GET /student/learning/live-sessions/upcoming](#get-studentlearninglive-sessionsupcoming)
  - [GET /student/learning/session/{session_id}/prep](#get-studentlearningsessionsession_idprep)
- [Community](#community)
  - [GET /student/community/friends](#get-studentcommunityfriends)
  - [GET /student/community/friends/requests](#get-studentcommunityfriendsrequests)
  - [POST /student/community/friends/request](#post-studentcommunityfriendsrequest)
  - [POST /student/community/friends/accept/{friendship_id}](#post-studentcommunityfriendsacceptfriendship_id)
  - [GET /student/community/study-groups](#get-studentcommunitystudy-groups)
  - [POST /student/community/study-groups](#post-studentcommunitystudy-groups)
  - [POST /student/community/study-groups/{group_id}/join](#post-studentcommunitystudy-groupsgroup_idjoin)
  - [POST /student/community/shoutouts](#post-studentcommunityshoutouts)
  - [GET /student/community/shoutouts/received](#get-studentcommunityshoutoutsreceived)
  - [GET /student/community/class-wall](#get-studentcommunityclass-wall)
  - [GET /student/community/teacher-qa](#get-studentcommunityteacher-qa)
- [Wallet](#wallet)
  - [GET /student/wallet/balance](#get-studentwalletbalance)
  - [GET /student/wallet/transactions](#get-studentwallettransactions)
  - [POST /student/wallet/topup/paystack](#post-studentwallettopuppaystack)
  - [GET /student/wallet/payment/verify/{reference}](#get-studentwalletpaymentverifyreference)
  - [GET /student/wallet/payment-methods](#get-studentwalletpayment-methods)
  - [POST /student/wallet/payment-methods](#post-studentwalletpayment-methods)
  - [GET /student/wallet/subscription](#get-studentwalletsubscription)
  - [GET /student/wallet/ai-advisor](#get-studentwalletai-advisor)
- [Support](#support)
  - [GET /student/support/guides](#get-studentsupportguides)
  - [GET /student/support/guides/{guide_id}](#get-studentsupportguidesguide_id)
  - [GET /student/support/faq](#get-studentsupportfaq)
  - [POST /student/support/tickets](#post-studentsupporttickets)
  - [GET /student/support/tickets](#get-studentsupporttickets)
  - [POST /student/support/ai-help](#post-studentsupportai-help)
  - [POST /student/support/report](#post-studentsupportreport)
- [Account](#account)
  - [GET /student/account/notifications](#get-studentaccountnotifications)
  - [PUT /student/account/notifications/{notification_id}/read](#put-studentaccountnotificationsnotification_idread)
  - [PUT /student/account/notifications/read-all](#put-studentaccountnotificationsread-all)
  - [GET /student/account/notifications/settings](#get-studentaccountnotificationssettings)
  - [PUT /student/account/notifications/settings](#put-studentaccountnotificationssettings)
  - [GET /student/account/profile](#get-studentaccountprofile)
  - [PUT /student/account/profile](#put-studentaccountprofile)
  - [GET /student/account/preferences](#get-studentaccountpreferences)
  - [PUT /student/account/preferences](#put-studentaccountpreferences)
  - [GET /student/account/privacy](#get-studentaccountprivacy)
  - [PUT /student/account/privacy](#put-studentaccountprivacy)

---

## Dashboard

### GET /student/dashboard/today

Get comprehensive dashboard data for today including a time-adaptive greeting, AI-generated daily plan, current streak, latest mood check-in, urgent items, daily quote, and XP/level data.

**Authentication:** Bearer token (student role required)

**Response 200:**

```json
{
  "greeting": "Good morning, Amani!",
  "daily_plan": {
    "items": [
      {
        "id": "dp-001",
        "title": "Complete Math Lesson 4",
        "type": "lesson",
        "subject": "Mathematics",
        "duration_minutes": 30,
        "priority": 1,
        "completed": false
      }
    ],
    "manually_edited": false
  },
  "streak": {
    "current": 7,
    "longest": 14,
    "streak_type": "daily"
  },
  "mood": {
    "mood_type": "happy",
    "energy_level": 4,
    "timestamp": "2026-02-15T08:30:00Z"
  },
  "urgent_items": [],
  "quote": {
    "text": "Education is the passport to the future.",
    "author": "Malcolm X",
    "category": "motivation"
  },
  "xp": {
    "current_xp": 2450,
    "level": 5,
    "xp_to_next_level": 550,
    "total_xp": 2450
  }
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/student/dashboard/today" \
  -H "Authorization: Bearer <token>"
```

---

### POST /student/dashboard/mood

Submit a mood check-in for the student. Records emotional state and energy level.

**Authentication:** Bearer token (student role required)

**Request Body:**

```json
{
  "mood_type": "happy",
  "energy_level": 4,
  "note": "Feeling great after finishing my science project!"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `mood_type` | string | Yes | One of: `happy`, `okay`, `tired`, `frustrated`, `excited` |
| `energy_level` | integer | Yes | Energy level from 1 (low) to 5 (high) |
| `note` | string | No | Optional note about current mood |

**Response 200:**

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "mood_type": "happy",
  "energy_level": 4,
  "note": "Feeling great after finishing my science project!",
  "timestamp": "2026-02-15T10:00:00Z",
  "message": "Mood check-in saved successfully"
}
```

**curl:**

```bash
curl -X POST "http://localhost:8000/api/v1/student/dashboard/mood" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"mood_type": "happy", "energy_level": 4, "note": "Feeling great!"}'
```

---

### GET /student/dashboard/teacher-sync

Get teacher notes integrated into the student's daily plan. Returns tasks and notes that teachers have added for the student.

**Authentication:** Bearer token (student role required)

**Response 200:**

```json
[
  {
    "id": "tn-001",
    "teacher_name": "Mrs. Wanjiku",
    "subject": "Mathematics",
    "note": "Please review chapter 5 before tomorrow's session",
    "type": "task",
    "priority": "high",
    "due_date": "2026-02-16T09:00:00Z",
    "created_at": "2026-02-15T08:00:00Z"
  }
]
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/student/dashboard/teacher-sync" \
  -H "Authorization: Bearer <token>"
```

---

### GET /student/dashboard/quote

Get an age-appropriate daily inspirational quote or micro-lesson tailored to the student's grade level.

**Authentication:** Bearer token (student role required)

**Response 200:**

```json
{
  "text": "The beautiful thing about learning is that nobody can take it away from you.",
  "author": "B.B. King",
  "category": "learning"
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/student/dashboard/quote" \
  -H "Authorization: Bearer <token>"
```

---

### PUT /student/dashboard/daily-plan

Update the daily plan (drag-drop reorder, mark items complete, etc.).

**Authentication:** Bearer token (student role required)

**Request Body:**

```json
{
  "items": [
    {
      "id": "dp-001",
      "title": "Complete Math Lesson 4",
      "type": "lesson",
      "priority": 1,
      "completed": true
    },
    {
      "id": "dp-002",
      "title": "Read Chapter 3 - Science",
      "type": "reading",
      "priority": 2,
      "completed": false
    }
  ]
}
```

**Response 200:**

```json
{
  "date": "2026-02-15",
  "items": [
    {
      "id": "dp-001",
      "title": "Complete Math Lesson 4",
      "type": "lesson",
      "priority": 1,
      "completed": true
    }
  ],
  "manually_edited": true,
  "message": "Daily plan updated successfully"
}
```

**curl:**

```bash
curl -X PUT "http://localhost:8000/api/v1/student/dashboard/daily-plan" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"items": [{"id": "dp-001", "title": "Complete Math Lesson 4", "type": "lesson", "priority": 1, "completed": true}]}'
```

---

## AI Tutor

### POST /student/ai/chat

Chat with the AI tutor. Supports multi-turn conversations via optional conversation history. The orchestrator routes requests to the appropriate AI model (Gemini, Claude, GPT-4, or Grok) based on the task type.

**Authentication:** Bearer token (student role required)

**Request Body:**

```json
{
  "message": "Can you explain photosynthesis in a simple way?",
  "conversation_history": [
    {
      "role": "user",
      "content": "What are plants made of?"
    },
    {
      "role": "assistant",
      "content": "Plants are made up of cells, just like animals..."
    }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `message` | string | Yes | The student's message to the AI tutor |
| `conversation_history` | array | No | Previous conversation messages for context |

**Response 200:**

```json
{
  "response": "Great question! Photosynthesis is how plants make their own food using sunlight...",
  "model_used": "gemini-pro",
  "task_type": "general",
  "suggestions": [
    "Tell me more about chlorophyll",
    "How do plants breathe?",
    "What happens at night?"
  ],
  "metadata": {
    "tokens_used": 256,
    "response_time_ms": 1200
  }
}
```

**curl:**

```bash
curl -X POST "http://localhost:8000/api/v1/student/ai/chat" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"message": "Can you explain photosynthesis in a simple way?"}'
```

---

### GET /student/ai/learning-path

Get the AI-generated daily learning path personalized to the student's progress, strengths, and areas for improvement.

**Authentication:** Bearer token (student role required)

**Response 200:**

```json
{
  "student_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "date": "2026-02-15",
  "subjects": [
    {
      "name": "Mathematics",
      "recommended_time_minutes": 45,
      "topics": ["Fractions", "Decimals"],
      "difficulty": "intermediate",
      "reason": "Building on last week's strong performance"
    }
  ],
  "total_recommended_minutes": 180,
  "focus_areas": ["Mathematics", "Kiswahili"],
  "generated_at": "2026-02-15T06:00:00Z"
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/student/ai/learning-path" \
  -H "Authorization: Bearer <token>"
```

---

### GET /student/ai/journal

Get the student's journal entries, which include AI-generated insights and reflection prompts.

**Authentication:** Bearer token (student role required)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 10 | Number of entries to return |

**Response 200:**

```json
[
  {
    "id": "j-001",
    "content": "Today I learned about fractions and finally understood how to add them!",
    "mood_tag": "excited",
    "ai_insights": "Your enthusiasm for math is growing. Keep practicing with different denominators.",
    "reflection_prompts": [
      "What strategy helped you understand fractions?",
      "Can you think of real-life uses for fractions?"
    ],
    "created_at": "2026-02-15T14:00:00Z"
  }
]
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/student/ai/journal?limit=5" \
  -H "Authorization: Bearer <token>"
```

---

### POST /student/ai/journal

Create a journal entry. The AI automatically generates insights and reflection prompts based on the content.

**Authentication:** Bearer token (student role required)

**Request Body:**

```json
{
  "content": "I struggled with long division today but my friend helped me understand it better.",
  "mood_tag": "okay"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `content` | string | Yes | Journal entry text |
| `mood_tag` | string | No | One of: `happy`, `okay`, `tired`, `frustrated`, `excited` |

**Response 200:**

```json
{
  "id": "j-002",
  "content": "I struggled with long division today but my friend helped me understand it better.",
  "mood_tag": "okay",
  "ai_insights": "Peer learning is a powerful strategy. Collaborative problem-solving helps deepen understanding.",
  "created_at": "2026-02-15T15:30:00Z",
  "message": "Journal entry created successfully"
}
```

**curl:**

```bash
curl -X POST "http://localhost:8000/api/v1/student/ai/journal" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"content": "I struggled with long division today.", "mood_tag": "okay"}'
```

---

### POST /student/ai/explain

Get an AI explanation of a concept, tailored to the student's grade level and learning style.

**Authentication:** Bearer token (student role required)

**Request Body:**

```json
{
  "concept": "Water cycle",
  "context": "We are studying geography and weather patterns"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `concept` | string | Yes | The concept to explain |
| `context` | string | No | Additional context for a more targeted explanation |

**Response 200:**

```json
{
  "concept": "Water cycle",
  "explanation": "The water cycle is like a big journey that water takes...",
  "examples": [
    "When you boil water in a sufuria, the steam rising is like evaporation",
    "Rain falling from clouds is precipitation"
  ],
  "key_terms": ["evaporation", "condensation", "precipitation", "collection"],
  "follow_up_questions": [
    "Where does the water go after it rains?",
    "Why do clouds form?"
  ]
}
```

**curl:**

```bash
curl -X POST "http://localhost:8000/api/v1/student/ai/explain" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"concept": "Water cycle", "context": "studying geography"}'
```

---

### POST /student/ai/teacher-question

Send a question to a teacher. The AI generates a summary of the question for the teacher.

**Authentication:** Bearer token (student role required)

**Request Body:**

```json
{
  "teacher_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "question": "I do not understand how to solve quadratic equations using the formula"
}
```

**Response 200:**

```json
{
  "id": "qa-001",
  "question": "I do not understand how to solve quadratic equations using the formula",
  "ai_summary": "Student needs help applying the quadratic formula to solve equations.",
  "created_at": "2026-02-15T11:00:00Z",
  "message": "Question sent to teacher successfully"
}
```

**curl:**

```bash
curl -X POST "http://localhost:8000/api/v1/student/ai/teacher-question" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"teacher_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901", "question": "I do not understand quadratic equations"}'
```

---

### GET /student/ai/teacher-responses

Get AI-summarized teacher responses to previously submitted questions.

**Authentication:** Bearer token (student role required)

**Response 200:**

```json
[
  {
    "id": "qa-001",
    "question": "How do I solve quadratic equations?",
    "teacher_response": "Start by identifying the values of a, b, and c...",
    "ai_summary": "Teacher explains step-by-step approach to applying the quadratic formula.",
    "teacher_name": "Mr. Ochieng",
    "responded_at": "2026-02-15T14:00:00Z"
  }
]
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/student/ai/teacher-responses" \
  -H "Authorization: Bearer <token>"
```

---

### POST /student/ai/voice

Generate a voice response using ElevenLabs text-to-speech.

**Authentication:** Bearer token (student role required)

**Request Body:**

```json
{
  "text": "The quadratic formula is x equals negative b plus or minus the square root of b squared minus four a c, all over two a."
}
```

**Response 200:**

```json
{
  "audio_url": "https://storage.example.com/audio/resp-12345.mp3",
  "duration_seconds": 8.5,
  "voice_id": "default-tutor",
  "text": "The quadratic formula is..."
}
```

> **Note:** ElevenLabs integration is not yet fully implemented. This endpoint may return placeholder data.

**curl:**

```bash
curl -X POST "http://localhost:8000/api/v1/student/ai/voice" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, how are you today?"}'
```

---

## Progress & Gamification

### GET /student/progress/xp

Get the student's current XP, level, and progression data.

**Authentication:** Bearer token (student role required)

**Response 200:**

```json
{
  "current_xp": 2450,
  "level": 5,
  "level_name": "Explorer",
  "xp_to_next_level": 550,
  "total_xp": 2450,
  "xp_history": [
    {
      "date": "2026-02-15",
      "xp_earned": 120,
      "source": "lesson_completion"
    }
  ]
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/student/progress/xp" \
  -H "Authorization: Bearer <token>"
```

---

### GET /student/progress/badges

Get all badges earned by the student, including badge metadata.

**Authentication:** Bearer token (student role required)

**Response 200:**

```json
[
  {
    "id": "badge-001",
    "name": "First Steps",
    "description": "Complete your first lesson",
    "icon_url": "/badges/first-steps.png",
    "category": "milestone",
    "earned_at": "2026-01-10T09:00:00Z",
    "is_rare": false
  },
  {
    "id": "badge-002",
    "name": "Streak Master",
    "description": "Maintain a 7-day learning streak",
    "icon_url": "/badges/streak-master.png",
    "category": "consistency",
    "earned_at": "2026-02-14T18:00:00Z",
    "is_rare": true
  }
]
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/student/progress/badges" \
  -H "Authorization: Bearer <token>"
```

---

### GET /student/progress/leaderboard

Get leaderboard data with configurable scope.

**Authentication:** Bearer token (student role required)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `scope` | string | `class` | One of: `class`, `grade`, `school` |
| `limit` | integer | 10 | Number of entries to return |

**Response 200:**

```json
[
  {
    "rank": 1,
    "student_name": "Amani K.",
    "avatar_url": "/avatars/amani.png",
    "xp": 3200,
    "level": 7,
    "is_current_user": false
  },
  {
    "rank": 2,
    "student_name": "You",
    "avatar_url": "/avatars/me.png",
    "xp": 2450,
    "level": 5,
    "is_current_user": true
  }
]
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/student/progress/leaderboard?scope=grade&limit=10" \
  -H "Authorization: Bearer <token>"
```

---

### GET /student/progress/goals

Get the student's active learning goals.

**Authentication:** Bearer token (student role required)

**Response 200:**

```json
[
  {
    "id": "goal-001",
    "title": "Complete 10 math lessons",
    "target": 10,
    "current": 7,
    "unit": "lessons",
    "percentage": 70,
    "deadline": "2026-02-28T23:59:59Z",
    "ai_suggested": true,
    "created_at": "2026-02-01T08:00:00Z"
  }
]
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/student/progress/goals" \
  -H "Authorization: Bearer <token>"
```

---

### POST /student/progress/goals

Create a new learning goal.

**Authentication:** Bearer token (student role required)

**Request Body:**

```json
{
  "title": "Read 5 storybooks this month",
  "target": 5,
  "unit": "books",
  "deadline": "2026-02-28T23:59:59Z"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Goal title |
| `target` | integer | Yes | Target value |
| `unit` | string | No | Unit of measurement (default: `lessons`) |
| `deadline` | datetime | No | Optional deadline |

**Response 200:**

```json
{
  "id": "goal-002",
  "title": "Read 5 storybooks this month",
  "target": 5,
  "current": 0,
  "unit": "books",
  "deadline": "2026-02-28T23:59:59Z",
  "message": "Goal created successfully"
}
```

**curl:**

```bash
curl -X POST "http://localhost:8000/api/v1/student/progress/goals" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Read 5 storybooks", "target": 5, "unit": "books"}'
```

---

### GET /student/progress/weekly-report

Get or generate an AI-powered weekly learning report with narrative summary, metrics, and insights.

**Authentication:** Bearer token (student role required)

**Response 200:**

```json
{
  "id": "wr-001",
  "week_start": "2026-02-10",
  "week_end": "2026-02-16",
  "ai_story": "This week you made impressive progress in Mathematics, completing 8 lessons and scoring 85% on your quiz...",
  "metrics": {
    "total_xp_earned": 450,
    "lessons_completed": 12,
    "time_spent_minutes": 320,
    "average_score": 82,
    "streak_days": 5
  },
  "strongest_subject": "Mathematics",
  "improvement_area": "English Composition",
  "shared_with_parent": false
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/student/progress/weekly-report" \
  -H "Authorization: Bearer <token>"
```

---

## Learning

### GET /student/learning/courses/enrolled

Get the student's enrolled courses with progress tracking information.

**Authentication:** Bearer token (student role required)

**Response 200:**

```json
[
  {
    "id": "course-001",
    "title": "CBC Mathematics Grade 5",
    "subject": "Mathematics",
    "instructor_name": "Mr. Ochieng",
    "progress_percent": 65,
    "lessons_completed": 13,
    "total_lessons": 20,
    "last_accessed": "2026-02-14T16:00:00Z",
    "next_lesson": "Lesson 14: Decimals and Percentages",
    "grade_level": 5
  }
]
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/student/learning/courses/enrolled" \
  -H "Authorization: Bearer <token>"
```

---

### GET /student/learning/courses/recommended

Get AI-recommended courses based on the student's profile, learning history, and performance.

**Authentication:** Bearer token (student role required)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 10 | Number of recommendations |

**Response 200:**

```json
[
  {
    "id": "course-005",
    "title": "Creative Writing Adventures",
    "subject": "English",
    "instructor_name": "Mrs. Mwangi",
    "rating": 4.8,
    "price": 500,
    "currency": "KES",
    "reason": "Based on your interest in storytelling and strong reading performance",
    "match_score": 92
  }
]
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/student/learning/courses/recommended?limit=5" \
  -H "Authorization: Bearer <token>"
```

---

### GET /student/learning/browse

Browse the course marketplace with search and filter support.

**Authentication:** Bearer token (student role required)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `search` | string | - | Search query |
| `grade_level` | integer | - | Filter by grade level |
| `subject` | string | - | Filter by subject/learning area |
| `sort_by` | string | `popular` | Sort: `popular`, `rating`, `newest`, `price_low`, `price_high` |
| `limit` | integer | 20 | Results per page |
| `offset` | integer | 0 | Pagination offset |

**Response 200:**

```json
{
  "courses": [
    {
      "id": "course-010",
      "title": "Kiswahili Mastery",
      "subject": "Kiswahili",
      "grade_levels": [4, 5, 6],
      "price": 750,
      "currency": "KES",
      "rating": 4.6,
      "enrollment_count": 234,
      "instructor_name": "Mwalimu Akinyi"
    }
  ],
  "total": 45,
  "limit": 20,
  "offset": 0,
  "has_more": true
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/student/learning/browse?subject=Mathematics&grade_level=5&sort_by=rating" \
  -H "Authorization: Bearer <token>"
```

---

### GET /student/learning/course/{course_id}/preview

Get a detailed course preview including syllabus, reviews, and instructor information.

**Authentication:** Bearer token (student role required)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `course_id` | UUID | The course identifier |

**Response 200:**

```json
{
  "id": "course-010",
  "title": "Kiswahili Mastery",
  "description": "A comprehensive Kiswahili course aligned with CBC standards...",
  "subject": "Kiswahili",
  "grade_levels": [4, 5, 6],
  "instructor": {
    "name": "Mwalimu Akinyi",
    "bio": "10 years of teaching experience...",
    "avatar_url": "/avatars/akinyi.png"
  },
  "lessons": [
    {"title": "Lesson 1: Greetings", "duration_minutes": 25}
  ],
  "total_lessons": 20,
  "total_duration_hours": 10,
  "price": 750,
  "currency": "KES",
  "rating": 4.6,
  "review_count": 89,
  "enrollment_count": 234
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/student/learning/course/a1b2c3d4-e5f6-7890-abcd-ef1234567890/preview" \
  -H "Authorization: Bearer <token>"
```

---

### GET /student/learning/wishlist

Get the student's course wishlist.

**Authentication:** Bearer token (student role required)

**Response 200:**

```json
[
  {
    "id": "wl-001",
    "course_id": "course-010",
    "course_title": "Kiswahili Mastery",
    "course_price": 750,
    "added_at": "2026-02-10T09:00:00Z"
  }
]
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/student/learning/wishlist" \
  -H "Authorization: Bearer <token>"
```

---

### POST /student/learning/wishlist

Add a course to the wishlist.

**Authentication:** Bearer token (student role required)

**Request Body:**

```json
{
  "course_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

**Response 200:**

```json
{
  "id": "wl-002",
  "course_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "added_at": "2026-02-15T10:00:00Z",
  "message": "Course added to wishlist"
}
```

**curl:**

```bash
curl -X POST "http://localhost:8000/api/v1/student/learning/wishlist" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"course_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"}'
```

---

### DELETE /student/learning/wishlist/{course_id}

Remove a course from the wishlist.

**Authentication:** Bearer token (student role required)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `course_id` | UUID | The course identifier to remove |

**Response 200:**

```json
{
  "message": "Course removed from wishlist"
}
```

**curl:**

```bash
curl -X DELETE "http://localhost:8000/api/v1/student/learning/wishlist/a1b2c3d4-e5f6-7890-abcd-ef1234567890" \
  -H "Authorization: Bearer <token>"
```

---

### GET /student/learning/live-sessions/upcoming

Get upcoming live sessions the student is enrolled in.

**Authentication:** Bearer token (student role required)

**Response 200:**

```json
[
  {
    "id": "session-001",
    "title": "Mathematics - Fractions Review",
    "instructor_name": "Mr. Ochieng",
    "scheduled_at": "2026-02-16T10:00:00Z",
    "duration_minutes": 45,
    "subject": "Mathematics",
    "join_url": "https://meet.example.com/session-001",
    "status": "upcoming"
  }
]
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/student/learning/live-sessions/upcoming" \
  -H "Authorization: Bearer <token>"
```

---

### GET /student/learning/session/{session_id}/prep

Get AI-generated session preparation tips for an upcoming live session.

**Authentication:** Bearer token (student role required)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `session_id` | UUID | The session identifier |

**Response 200:**

```json
{
  "id": "prep-001",
  "session_id": "session-001",
  "tips": [
    "Review your notes on adding fractions from Lesson 10",
    "Prepare questions about mixed numbers",
    "Have your exercise book ready for practice problems"
  ],
  "engagement_prediction": "high",
  "created_at": "2026-02-15T18:00:00Z"
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/student/learning/session/a1b2c3d4-e5f6-7890-abcd-ef1234567890/prep" \
  -H "Authorization: Bearer <token>"
```

---

## Community

### GET /student/community/friends

Get the student's accepted friends list.

**Authentication:** Bearer token (student role required)

**Response 200:**

```json
[
  {
    "friendship_id": "fr-001",
    "friend_id": "student-002",
    "friend_name": "Baraka M.",
    "avatar_url": "/avatars/baraka.png",
    "is_online": true,
    "last_active": "2026-02-15T09:30:00Z",
    "mutual_groups": 2
  }
]
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/student/community/friends" \
  -H "Authorization: Bearer <token>"
```

---

### GET /student/community/friends/requests

Get pending friend requests received by the student.

**Authentication:** Bearer token (student role required)

**Response 200:**

```json
[
  {
    "friendship_id": "fr-005",
    "from_student_id": "student-010",
    "from_student_name": "Zuri A.",
    "avatar_url": "/avatars/zuri.png",
    "sent_at": "2026-02-14T15:00:00Z"
  }
]
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/student/community/friends/requests" \
  -H "Authorization: Bearer <token>"
```

---

### POST /student/community/friends/request

Send a friend request to another student.

**Authentication:** Bearer token (student role required)

**Request Body:**

```json
{
  "friend_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

**Response 200:**

```json
{
  "friendship_id": "fr-006",
  "status": "pending",
  "created_at": "2026-02-15T10:00:00Z",
  "message": "Friend request sent"
}
```

**curl:**

```bash
curl -X POST "http://localhost:8000/api/v1/student/community/friends/request" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"friend_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"}'
```

---

### POST /student/community/friends/accept/{friendship_id}

Accept a pending friend request.

**Authentication:** Bearer token (student role required)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `friendship_id` | UUID | The friendship request identifier |

**Response 200:**

```json
{
  "friendship_id": "fr-005",
  "status": "accepted",
  "message": "Friend request accepted"
}
```

**curl:**

```bash
curl -X POST "http://localhost:8000/api/v1/student/community/friends/accept/fr-005" \
  -H "Authorization: Bearer <token>"
```

---

### GET /student/community/study-groups

Get study groups the student belongs to.

**Authentication:** Bearer token (student role required)

**Response 200:**

```json
[
  {
    "id": "sg-001",
    "name": "Math Wizards",
    "description": "We solve math problems together!",
    "subject": "Mathematics",
    "member_count": 6,
    "max_members": 10,
    "is_creator": true,
    "last_activity": "2026-02-15T08:00:00Z"
  }
]
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/student/community/study-groups" \
  -H "Authorization: Bearer <token>"
```

---

### POST /student/community/study-groups

Create a new study group.

**Authentication:** Bearer token (student role required)

**Request Body:**

```json
{
  "name": "Science Explorers",
  "description": "A group for curious minds who love science experiments",
  "subject": "Science",
  "max_members": 8
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Group name |
| `description` | string | No | Group description |
| `subject` | string | No | Subject focus |
| `max_members` | integer | No | Maximum members (default: 10) |

**Response 200:**

```json
{
  "group_id": "sg-002",
  "name": "Science Explorers",
  "description": "A group for curious minds who love science experiments",
  "subject": "Science",
  "member_count": 1,
  "max_members": 8,
  "created_at": "2026-02-15T10:00:00Z",
  "message": "Study group created successfully"
}
```

**curl:**

```bash
curl -X POST "http://localhost:8000/api/v1/student/community/study-groups" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Science Explorers", "subject": "Science", "max_members": 8}'
```

---

### POST /student/community/study-groups/{group_id}/join

Join an existing study group.

**Authentication:** Bearer token (student role required)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `group_id` | UUID | The study group identifier |

**Response 200:**

```json
{
  "group_id": "sg-001",
  "member_count": 7,
  "message": "Joined study group successfully"
}
```

**curl:**

```bash
curl -X POST "http://localhost:8000/api/v1/student/community/study-groups/sg-001/join" \
  -H "Authorization: Bearer <token>"
```

---

### POST /student/community/shoutouts

Send a shoutout (kudos) to another student.

**Authentication:** Bearer token (student role required)

**Request Body:**

```json
{
  "to_student_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "message": "Great job on the math quiz! You inspired me to study harder.",
  "category": "achievement",
  "is_anonymous": false
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `to_student_id` | UUID | Yes | Recipient student ID |
| `message` | string | Yes | Shoutout message |
| `category` | string | Yes | One of: `encouragement`, `help`, `achievement`, `thanks`, `other` |
| `is_anonymous` | boolean | No | Send anonymously (default: `false`) |

**Response 200:**

```json
{
  "shoutout_id": "so-001",
  "created_at": "2026-02-15T10:00:00Z",
  "message": "Shoutout sent successfully"
}
```

**curl:**

```bash
curl -X POST "http://localhost:8000/api/v1/student/community/shoutouts" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"to_student_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890", "message": "Great job!", "category": "achievement"}'
```

---

### GET /student/community/shoutouts/received

Get shoutouts received by the student.

**Authentication:** Bearer token (student role required)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 20 | Number of shoutouts to return |

**Response 200:**

```json
[
  {
    "id": "so-002",
    "from_student_name": "Amani K.",
    "message": "Thanks for helping me with fractions!",
    "category": "thanks",
    "is_anonymous": false,
    "created_at": "2026-02-14T15:00:00Z"
  }
]
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/student/community/shoutouts/received?limit=10" \
  -H "Authorization: Bearer <token>"
```

---

### GET /student/community/class-wall

Get public shoutouts displayed on the class wall.

**Authentication:** Bearer token (student role required)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 50 | Number of posts to return |

**Response 200:**

```json
[
  {
    "id": "so-003",
    "from_name": "Zuri A.",
    "to_name": "Baraka M.",
    "message": "Amazing presentation in class today!",
    "category": "achievement",
    "created_at": "2026-02-15T09:00:00Z"
  }
]
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/student/community/class-wall?limit=20" \
  -H "Authorization: Bearer <token>"
```

---

### GET /student/community/teacher-qa

Get teacher Q&A threads for the student.

**Authentication:** Bearer token (student role required)

**Response 200:**

```json
[
  {
    "id": "qa-001",
    "teacher_name": "Mr. Ochieng",
    "question": "How do I solve quadratic equations?",
    "ai_summary": "Student needs help with the quadratic formula",
    "has_response": true,
    "created_at": "2026-02-14T10:00:00Z",
    "responded_at": "2026-02-14T14:00:00Z"
  }
]
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/student/community/teacher-qa" \
  -H "Authorization: Bearer <token>"
```

---

## Wallet

### GET /student/wallet/balance

Get the student's wallet balance and credit information.

**Authentication:** Bearer token (student role required)

**Response 200:**

```json
{
  "balance": 1500,
  "currency": "KES",
  "pending_credits": 0,
  "total_spent": 3000,
  "last_topup": "2026-02-10T12:00:00Z"
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/student/wallet/balance" \
  -H "Authorization: Bearer <token>"
```

---

### GET /student/wallet/transactions

Get wallet transaction history with pagination.

**Authentication:** Bearer token (student role required)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 20 | Results per page |
| `offset` | integer | 0 | Pagination offset |

**Response 200:**

```json
{
  "transactions": [
    {
      "id": "txn-001",
      "type": "credit",
      "amount": 500,
      "currency": "KES",
      "description": "Wallet top-up via Paystack",
      "reference": "PSK_abc123",
      "status": "completed",
      "created_at": "2026-02-10T12:00:00Z"
    },
    {
      "id": "txn-002",
      "type": "debit",
      "amount": 750,
      "currency": "KES",
      "description": "Course enrollment: Kiswahili Mastery",
      "status": "completed",
      "created_at": "2026-02-11T09:00:00Z"
    }
  ],
  "total": 15,
  "limit": 20,
  "offset": 0
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/student/wallet/transactions?limit=10&offset=0" \
  -H "Authorization: Bearer <token>"
```

---

### POST /student/wallet/topup/paystack

Initiate a Paystack card payment for wallet top-up.

**Authentication:** Bearer token (student role required)

**Request Body:**

```json
{
  "amount": 50000,
  "metadata": {
    "purpose": "wallet_topup"
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `amount` | integer | Yes | Amount in kobo (100 kobo = 1 KES). Minimum: 100 |
| `metadata` | object | No | Custom metadata |

**Response 200:**

```json
{
  "reference": "PSK_abc123def456",
  "authorization_url": "https://checkout.paystack.com/abc123",
  "access_code": "abc123def456",
  "message": "Payment initialized. Redirect user to authorization_url"
}
```

**curl:**

```bash
curl -X POST "http://localhost:8000/api/v1/student/wallet/topup/paystack" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"amount": 50000}'
```

---

### GET /student/wallet/payment/verify/{reference}

Verify a Paystack payment by reference code.

**Authentication:** Bearer token (student role required)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `reference` | string | Paystack payment reference |

**Response 200:**

```json
{
  "status": "success",
  "reference": "PSK_abc123def456",
  "amount": 500,
  "currency": "KES",
  "verified_at": "2026-02-15T10:05:00Z"
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/student/wallet/payment/verify/PSK_abc123def456" \
  -H "Authorization: Bearer <token>"
```

---

### GET /student/wallet/payment-methods

Get saved payment methods.

**Authentication:** Bearer token (student role required)

**Response 200:**

```json
[
  {
    "id": "pm-001",
    "card_type": "visa",
    "last4": "4242",
    "exp_month": "12",
    "exp_year": "2028",
    "bank": "KCB Bank",
    "is_default": true
  }
]
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/student/wallet/payment-methods" \
  -H "Authorization: Bearer <token>"
```

---

### POST /student/wallet/payment-methods

Save a new payment method.

**Authentication:** Bearer token (student role required)

**Request Body:**

```json
{
  "authorization_code": "AUTH_abc123",
  "card_type": "visa",
  "last4": "4242",
  "exp_month": "12",
  "exp_year": "2028",
  "bank": "KCB Bank"
}
```

**Response 200:**

```json
{
  "id": "pm-002",
  "card_type": "visa",
  "last4": "4242",
  "is_default": false,
  "message": "Payment method saved successfully"
}
```

**curl:**

```bash
curl -X POST "http://localhost:8000/api/v1/student/wallet/payment-methods" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"authorization_code": "AUTH_abc123", "card_type": "visa", "last4": "4242", "exp_month": "12", "exp_year": "2028"}'
```

---

### GET /student/wallet/subscription

Get current subscription information.

**Authentication:** Bearer token (student role required)

**Response 200:**

```json
{
  "plan": "premium",
  "status": "active",
  "started_at": "2026-01-01T00:00:00Z",
  "expires_at": "2026-12-31T23:59:59Z",
  "auto_renew": true,
  "features": [
    "Unlimited AI tutor sessions",
    "All courses included",
    "Priority live session booking"
  ]
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/student/wallet/subscription" \
  -H "Authorization: Bearer <token>"
```

---

### GET /student/wallet/ai-advisor

Get AI-powered financial advice related to course spending and subscription optimization.

**Authentication:** Bearer token (student role required)

**Response 200:**

```json
{
  "advice": "You have spent KES 3,000 on courses this term. Consider the Premium plan at KES 2,500/month for unlimited access.",
  "recommendations": [
    {
      "type": "plan_upgrade",
      "description": "Upgrade to Premium to save KES 500 this month",
      "potential_savings": 500
    }
  ],
  "spending_summary": {
    "this_month": 1500,
    "last_month": 2000,
    "trend": "decreasing"
  }
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/student/wallet/ai-advisor" \
  -H "Authorization: Bearer <token>"
```

---

## Support

### GET /student/support/guides

Get help guides with optional category filtering.

**Authentication:** Bearer token (student role required)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `category` | string | - | Filter: `basics`, `assignments`, `ai`, `live`, `gamification` |

**Response 200:**

```json
[
  {
    "id": "guide-001",
    "title": "Getting Started with The Bird AI",
    "category": "basics",
    "summary": "Learn how to use your AI tutor for the first time",
    "read_time_minutes": 3,
    "updated_at": "2026-02-01T00:00:00Z"
  }
]
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/student/support/guides?category=ai" \
  -H "Authorization: Bearer <token>"
```

---

### GET /student/support/guides/{guide_id}

Get a specific help guide by ID.

**Authentication:** Bearer token (student role required)

**Response 200:**

```json
{
  "id": "guide-001",
  "title": "Getting Started with The Bird AI",
  "category": "basics",
  "content": "Welcome to The Bird AI! Here is how to get started...",
  "steps": [
    "Log in to your dashboard",
    "Click on the AI Tutor icon",
    "Type your question or choose a subject"
  ],
  "related_guides": ["guide-002", "guide-003"]
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/student/support/guides/guide-001" \
  -H "Authorization: Bearer <token>"
```

---

### GET /student/support/faq

Get frequently asked questions.

**Authentication:** Bearer token (student role required)

**Response 200:**

```json
[
  {
    "id": "faq-001",
    "question": "How do I reset my password?",
    "answer": "Go to Settings > Account > Change Password, or click 'Forgot Password' on the login page.",
    "category": "account",
    "helpful_count": 42
  }
]
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/student/support/faq" \
  -H "Authorization: Bearer <token>"
```

---

### POST /student/support/tickets

Create a support ticket.

**Authentication:** Bearer token (student role required)

**Request Body:**

```json
{
  "subject": "Cannot access my enrolled course",
  "description": "When I click on the Mathematics course, the page shows a blank screen.",
  "priority": "high"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `subject` | string | Yes | Ticket subject |
| `description` | string | Yes | Detailed description of the issue |
| `priority` | string | No | One of: `normal`, `high`, `urgent` (default: `normal`) |

**Response 200:**

```json
{
  "id": "ticket-001",
  "subject": "Cannot access my enrolled course",
  "status": "open",
  "priority": "high",
  "created_at": "2026-02-15T10:00:00Z",
  "message": "Support ticket created successfully"
}
```

**curl:**

```bash
curl -X POST "http://localhost:8000/api/v1/student/support/tickets" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"subject": "Cannot access my enrolled course", "description": "Blank screen on course page", "priority": "high"}'
```

---

### GET /student/support/tickets

Get the student's support tickets.

**Authentication:** Bearer token (student role required)

**Response 200:**

```json
[
  {
    "id": "ticket-001",
    "subject": "Cannot access my enrolled course",
    "status": "in_progress",
    "priority": "high",
    "created_at": "2026-02-15T10:00:00Z",
    "last_updated": "2026-02-15T11:00:00Z",
    "assigned_to": "Support Agent"
  }
]
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/student/support/tickets" \
  -H "Authorization: Bearer <token>"
```

---

### POST /student/support/ai-help

Get AI-powered instant help. The AI triages the question and provides an immediate answer or routes to human support.

**Authentication:** Bearer token (student role required)

**Request Body:**

```json
{
  "question": "How do I join a live session?"
}
```

**Response 200:**

```json
{
  "answer": "To join a live session, go to your Learning page and click on 'Live Sessions'. Click the 'Join' button next to the session you want to attend.",
  "confidence": 0.95,
  "category": "live_sessions",
  "needs_human": false,
  "related_guides": ["guide-005"]
}
```

**curl:**

```bash
curl -X POST "http://localhost:8000/api/v1/student/support/ai-help" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"question": "How do I join a live session?"}'
```

---

### POST /student/support/report

Report a technical problem.

**Authentication:** Bearer token (student role required)

**Request Body:**

```json
{
  "problem_type": "app_crash",
  "description": "The app freezes when I try to upload my assignment",
  "urgency": "high"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `problem_type` | string | Yes | Type of problem |
| `description` | string | Yes | Detailed description |
| `urgency` | string | No | One of: `normal`, `high`, `critical` (default: `normal`) |

**Response 200:**

```json
{
  "id": "rpt-001",
  "problem_type": "app_crash",
  "status": "reported",
  "urgency": "high",
  "created_at": "2026-02-15T10:00:00Z",
  "message": "Problem reported successfully. Our team will investigate."
}
```

**curl:**

```bash
curl -X POST "http://localhost:8000/api/v1/student/support/report" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"problem_type": "app_crash", "description": "App freezes on upload", "urgency": "high"}'
```

---

## Account

### GET /student/account/notifications

Get student notifications with optional filtering.

**Authentication:** Bearer token (student role required)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `category` | string | - | Filter by notification category |
| `unread_only` | boolean | `false` | Show only unread notifications |
| `limit` | integer | 50 | Maximum number of notifications |

**Response 200:**

```json
[
  {
    "id": "notif-001",
    "title": "New badge earned!",
    "message": "You earned the 'Streak Master' badge for 7 consecutive days of learning.",
    "category": "achievement",
    "is_read": false,
    "action_url": "/progress/badges",
    "created_at": "2026-02-15T09:00:00Z"
  }
]
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/student/account/notifications?unread_only=true&limit=20" \
  -H "Authorization: Bearer <token>"
```

---

### PUT /student/account/notifications/{notification_id}/read

Mark a single notification as read.

**Authentication:** Bearer token (student role required)

**Response 200:**

```json
{
  "id": "notif-001",
  "is_read": true,
  "message": "Notification marked as read"
}
```

**curl:**

```bash
curl -X PUT "http://localhost:8000/api/v1/student/account/notifications/notif-001/read" \
  -H "Authorization: Bearer <token>"
```

---

### PUT /student/account/notifications/read-all

Mark all notifications as read.

**Authentication:** Bearer token (student role required)

**Response 200:**

```json
{
  "count": 5,
  "message": "All notifications marked as read"
}
```

**curl:**

```bash
curl -X PUT "http://localhost:8000/api/v1/student/account/notifications/read-all" \
  -H "Authorization: Bearer <token>"
```

---

### GET /student/account/notifications/settings

Get notification preference settings.

**Authentication:** Bearer token (student role required)

**Response 200:**

```json
{
  "email_notifications": true,
  "push_notifications": true,
  "in_app_notifications": true,
  "categories": {
    "achievements": true,
    "assignments": true,
    "live_sessions": true,
    "social": true,
    "system": true
  },
  "quiet_hours": {
    "enabled": true,
    "start": "21:00",
    "end": "07:00"
  }
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/student/account/notifications/settings" \
  -H "Authorization: Bearer <token>"
```

---

### PUT /student/account/notifications/settings

Update notification preference settings. Only include fields you want to change.

**Authentication:** Bearer token (student role required)

**Request Body:**

```json
{
  "push_notifications": false,
  "quiet_hours": {
    "enabled": true,
    "start": "20:00",
    "end": "08:00"
  }
}
```

**Response 200:**

```json
{
  "email_notifications": true,
  "push_notifications": false,
  "in_app_notifications": true,
  "quiet_hours": {
    "enabled": true,
    "start": "20:00",
    "end": "08:00"
  },
  "message": "Notification settings updated"
}
```

**curl:**

```bash
curl -X PUT "http://localhost:8000/api/v1/student/account/notifications/settings" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"push_notifications": false}'
```

---

### GET /student/account/profile

Get the student's profile information.

**Authentication:** Bearer token (student role required)

**Response 200:**

```json
{
  "id": "student-001",
  "first_name": "Amani",
  "last_name": "Kimani",
  "email": "amani@example.com",
  "bio": "I love science and mathematics!",
  "avatar_url": "/avatars/amani.png",
  "grade_level": 5,
  "learning_style": "visual",
  "interests": ["science", "mathematics", "art"],
  "admission_number": "UHS-2025-001",
  "joined_at": "2025-09-01T00:00:00Z"
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/student/account/profile" \
  -H "Authorization: Bearer <token>"
```

---

### PUT /student/account/profile

Update the student's profile. Only include fields you want to change.

**Authentication:** Bearer token (student role required)

**Request Body:**

```json
{
  "bio": "I love science, math, and playing football!",
  "learning_style": "kinesthetic",
  "interests": ["science", "mathematics", "sports"]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `first_name` | string | No | First name |
| `last_name` | string | No | Last name |
| `bio` | string | No | Profile bio |
| `avatar_url` | string | No | Avatar image URL |
| `learning_style` | string | No | Preferred learning style |
| `interests` | array | No | List of interests |

**Response 200:**

```json
{
  "id": "student-001",
  "bio": "I love science, math, and playing football!",
  "learning_style": "kinesthetic",
  "interests": ["science", "mathematics", "sports"],
  "message": "Profile updated successfully"
}
```

**curl:**

```bash
curl -X PUT "http://localhost:8000/api/v1/student/account/profile" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"bio": "I love science, math, and playing football!"}'
```

---

### GET /student/account/preferences

Get the student's UI and app preferences.

**Authentication:** Bearer token (student role required)

**Response 200:**

```json
{
  "theme": "light",
  "language": "en",
  "age_ui_mode": "child",
  "ai_personality": "friendly",
  "font_size": "medium",
  "animations_enabled": true,
  "sound_effects": true,
  "auto_play_voice": false,
  "daily_goal_minutes": 60
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/student/account/preferences" \
  -H "Authorization: Bearer <token>"
```

---

### PUT /student/account/preferences

Update preferences. Only include fields you want to change.

**Authentication:** Bearer token (student role required)

**Request Body:**

```json
{
  "theme": "dark",
  "daily_goal_minutes": 90,
  "auto_play_voice": true
}
```

**Response 200:**

```json
{
  "theme": "dark",
  "language": "en",
  "daily_goal_minutes": 90,
  "auto_play_voice": true,
  "message": "Preferences updated successfully"
}
```

**curl:**

```bash
curl -X PUT "http://localhost:8000/api/v1/student/account/preferences" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"theme": "dark", "daily_goal_minutes": 90}'
```

---

### GET /student/account/privacy

Get privacy settings including COPPA consent status.

**Authentication:** Bearer token (student role required)

**Response 200:**

```json
{
  "profile_visibility": "friends_only",
  "show_online_status": true,
  "show_achievements": true,
  "show_streak": true,
  "allow_friend_requests": true,
  "allow_study_group_invites": true,
  "data_sharing_with_parent": true,
  "coppa_consent": {
    "status": "granted",
    "granted_by": "parent-001",
    "granted_at": "2025-09-01T00:00:00Z"
  }
}
```

**curl:**

```bash
curl -X GET "http://localhost:8000/api/v1/student/account/privacy" \
  -H "Authorization: Bearer <token>"
```

---

### PUT /student/account/privacy

Update privacy settings. Only include fields you want to change.

**Authentication:** Bearer token (student role required)

**Request Body:**

```json
{
  "profile_visibility": "private",
  "show_online_status": false
}
```

**Response 200:**

```json
{
  "profile_visibility": "private",
  "show_online_status": false,
  "message": "Privacy settings updated"
}
```

**curl:**

```bash
curl -X PUT "http://localhost:8000/api/v1/student/account/privacy" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"profile_visibility": "private", "show_online_status": false}'
```

---

## Error Responses

All endpoints may return the following standard error responses:

### 400 Bad Request

```json
{
  "detail": "Student profile not found"
}
```

### 401 Unauthorized

```json
{
  "detail": "Not authenticated"
}
```

### 403 Forbidden

```json
{
  "detail": "Only students can access this endpoint"
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
  "detail": "Failed to fetch dashboard: <error message>"
}
```
