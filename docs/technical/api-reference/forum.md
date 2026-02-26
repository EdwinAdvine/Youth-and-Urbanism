# Forum API Reference

> **Base URL:** `/api/v1/forum`
>
> **Authentication:** Endpoints require a valid JWT Bearer token unless marked as public.
>
> **Version:** 1.0 &mdash; Urban Home School (The Bird AI)

---

## Table of Contents

1. [List Forum Posts](#1-list-forum-posts)
2. [Create Post](#2-create-post)
3. [Get Post](#3-get-post)
4. [Update Post](#4-update-post)
5. [Reply to Post](#5-reply-to-post)
6. [Like Post](#6-like-post)
7. [Pin Post](#7-pin-post)
8. [Mark Post as Solved](#8-mark-post-as-solved)
9. [Error Codes](#error-codes)
10. [Data Models](#data-models)

---

## 1. List Forum Posts

Retrieve a paginated list of forum posts with optional sorting and filtering.

### Request

```
GET /api/v1/forum/posts
```

| Parameter  | Location | Type    | Required | Description |
|------------|----------|---------|----------|-------------|
| `sort`     | query    | string  | No       | Sort order. Allowed values: `latest` (default), `popular`, `unanswered`. |
| `category` | query    | string  | No       | Filter by category. Allowed values: `general`, `mathematics`, `science`, `languages`, `social-studies`, `technology`, `help-support`. |
| `page`     | query    | integer | No       | Page number (default: `1`). |
| `limit`    | query    | integer | No       | Items per page (default: `20`, max: `100`). |

### Headers

| Header          | Value               |
|-----------------|---------------------|
| `Authorization` | `Bearer <token>`    |

### Response `200 OK`

```json
{
  "status": "success",
  "data": {
    "posts": [
      {
        "id": "f1a2b3c4-d5e6-7890-abcd-ef1234567890",
        "title": "How do I solve quadratic equations?",
        "content": "I am struggling with factoring quadratic equations. Can someone explain the steps?",
        "category": "mathematics",
        "tags": ["algebra", "quadratic", "grade-9"],
        "author": {
          "id": "u1a2b3c4-d5e6-7890-abcd-ef1234567890",
          "display_name": "Jane Wanjiku",
          "role": "student",
          "avatar_url": null
        },
        "is_pinned": false,
        "is_solved": false,
        "view_count": 87,
        "likes_count": 12,
        "replies_count": 5,
        "created_at": "2026-02-10T14:30:00Z",
        "last_activity_at": "2026-02-14T09:15:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total_items": 234,
      "total_pages": 12
    }
  }
}
```

### Sort Behavior

| Value | Description |
|-------|-------------|
| `latest` | Most recently created or active posts first (ordered by `last_activity_at` descending). |
| `popular` | Posts with the highest `view_count` and `likes_count` combined. |
| `unanswered` | Posts with `replies_count = 0`, ordered by `created_at` descending. |

### cURL Example

```bash
curl -X GET "http://localhost:8000/api/v1/forum/posts?sort=latest&category=mathematics&page=1&limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 2. Create Post

Create a new forum discussion post. Requires authentication.

### Request

```
POST /api/v1/forum/posts
```

### Headers

| Header          | Value               |
|-----------------|---------------------|
| `Authorization` | `Bearer <token>`    |
| `Content-Type`  | `application/json`  |

### Request Body

```json
{
  "title": "How do I solve quadratic equations?",
  "content": "I am struggling with factoring quadratic equations. Can someone explain the steps involved?",
  "category": "mathematics",
  "tags": ["algebra", "quadratic", "grade-9"]
}
```

| Field      | Type     | Required | Description |
|------------|----------|----------|-------------|
| `title`    | string   | Yes      | Post title (max 255 characters). |
| `content`  | string   | Yes      | Post body text (supports markdown). |
| `category` | string   | Yes      | One of: `general`, `mathematics`, `science`, `languages`, `social-studies`, `technology`, `help-support`. |
| `tags`     | array of strings | No | Optional tags for discoverability (max 10 tags). |

### Response `201 Created`

```json
{
  "status": "success",
  "data": {
    "id": "f1a2b3c4-d5e6-7890-abcd-ef1234567890",
    "title": "How do I solve quadratic equations?",
    "content": "I am struggling with factoring quadratic equations. Can someone explain the steps involved?",
    "category": "mathematics",
    "tags": ["algebra", "quadratic", "grade-9"],
    "author": {
      "id": "u1a2b3c4-d5e6-7890-abcd-ef1234567890",
      "display_name": "Jane Wanjiku",
      "role": "student"
    },
    "is_pinned": false,
    "is_solved": false,
    "view_count": 0,
    "likes_count": 0,
    "replies_count": 0,
    "created_at": "2026-02-15T10:00:00Z",
    "last_activity_at": "2026-02-15T10:00:00Z"
  },
  "message": "Post created successfully."
}
```

### Error Responses

| Status | Description |
|--------|-------------|
| `400 Bad Request` | Missing required fields or invalid category. |
| `401 Unauthorized` | Missing or invalid JWT token. |
| `422 Unprocessable Entity` | Validation error on request body fields. |

### cURL Example

```bash
curl -X POST "http://localhost:8000/api/v1/forum/posts" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "How do I solve quadratic equations?",
    "content": "I am struggling with factoring quadratic equations.",
    "category": "mathematics",
    "tags": ["algebra", "quadratic", "grade-9"]
  }'
```

---

## 3. Get Post

Retrieve a single forum post with its full content and replies.

### Request

```
GET /api/v1/forum/posts/{post_id}
```

| Parameter | Location | Type          | Required | Description |
|-----------|----------|---------------|----------|-------------|
| `post_id` | path     | string (UUID) | Yes      | The unique identifier of the post. |

### Headers

| Header          | Value               |
|-----------------|---------------------|
| `Authorization` | `Bearer <token>`    |

### Response `200 OK`

```json
{
  "status": "success",
  "data": {
    "id": "f1a2b3c4-d5e6-7890-abcd-ef1234567890",
    "title": "How do I solve quadratic equations?",
    "content": "I am struggling with factoring quadratic equations. Can someone explain the steps?",
    "category": "mathematics",
    "tags": ["algebra", "quadratic", "grade-9"],
    "author": {
      "id": "u1a2b3c4-d5e6-7890-abcd-ef1234567890",
      "display_name": "Jane Wanjiku",
      "role": "student"
    },
    "is_pinned": false,
    "is_solved": true,
    "view_count": 88,
    "likes_count": 12,
    "replies_count": 5,
    "created_at": "2026-02-10T14:30:00Z",
    "updated_at": "2026-02-10T14:30:00Z",
    "last_activity_at": "2026-02-14T09:15:00Z",
    "replies": [
      {
        "id": "r1a2b3c4-d5e6-7890-abcd-ef1234567890",
        "content": "First, make sure the equation is in the form ax^2 + bx + c = 0. Then look for two numbers that multiply to give ac and add to give b.",
        "author": {
          "id": "u2b3c4d5-e6f7-8901-bcde-f12345678901",
          "display_name": "Mr. Ochieng",
          "role": "instructor"
        },
        "is_solution": true,
        "likes_count": 8,
        "created_at": "2026-02-10T15:45:00Z",
        "updated_at": "2026-02-10T15:45:00Z"
      }
    ]
  }
}
```

> **Note:** Viewing a post increments its `view_count` by one.

### Error Responses

| Status | Description |
|--------|-------------|
| `401 Unauthorized` | Missing or invalid JWT token. |
| `404 Not Found` | Post with the given ID does not exist or has been deleted. |

### cURL Example

```bash
curl -X GET "http://localhost:8000/api/v1/forum/posts/f1a2b3c4-d5e6-7890-abcd-ef1234567890" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 4. Update Post

Update an existing forum post. Only the original author can update their post.

### Request

```
PUT /api/v1/forum/posts/{post_id}
```

| Parameter | Location | Type          | Required | Description |
|-----------|----------|---------------|----------|-------------|
| `post_id` | path     | string (UUID) | Yes      | The unique identifier of the post. |

### Headers

| Header          | Value               |
|-----------------|---------------------|
| `Authorization` | `Bearer <token>`    |
| `Content-Type`  | `application/json`  |

### Request Body

```json
{
  "title": "How do I solve quadratic equations step by step?",
  "content": "I am struggling with factoring quadratic equations. Can someone explain the steps involved? Specifically the ac method.",
  "category": "mathematics",
  "tags": ["algebra", "quadratic", "grade-9", "factoring"]
}
```

| Field      | Type     | Required | Description |
|------------|----------|----------|-------------|
| `title`    | string   | No       | Updated post title (max 255 characters). |
| `content`  | string   | No       | Updated post body text. |
| `category` | string   | No       | Updated category. |
| `tags`     | array of strings | No | Updated tags array. |

### Response `200 OK`

```json
{
  "status": "success",
  "data": {
    "id": "f1a2b3c4-d5e6-7890-abcd-ef1234567890",
    "title": "How do I solve quadratic equations step by step?",
    "content": "I am struggling with factoring quadratic equations. Can someone explain the steps involved? Specifically the ac method.",
    "category": "mathematics",
    "tags": ["algebra", "quadratic", "grade-9", "factoring"],
    "updated_at": "2026-02-15T11:00:00Z"
  },
  "message": "Post updated successfully."
}
```

### Error Responses

| Status | Description |
|--------|-------------|
| `400 Bad Request` | No valid fields provided for update. |
| `401 Unauthorized` | Missing or invalid JWT token. |
| `403 Forbidden` | User is not the author of the post. |
| `404 Not Found` | Post not found. |

### cURL Example

```bash
curl -X PUT "http://localhost:8000/api/v1/forum/posts/f1a2b3c4-d5e6-7890-abcd-ef1234567890" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "How do I solve quadratic equations step by step?",
    "tags": ["algebra", "quadratic", "grade-9", "factoring"]
  }'
```

---

## 5. Reply to Post

Add a reply to an existing forum post. Requires authentication.

### Request

```
POST /api/v1/forum/posts/{post_id}/replies
```

| Parameter | Location | Type          | Required | Description |
|-----------|----------|---------------|----------|-------------|
| `post_id` | path     | string (UUID) | Yes      | The post to reply to. |

### Headers

| Header          | Value               |
|-----------------|---------------------|
| `Authorization` | `Bearer <token>`    |
| `Content-Type`  | `application/json`  |

### Request Body

```json
{
  "content": "Here is how you can factor a quadratic equation using the ac method:\n\n1. Multiply a and c\n2. Find two numbers that multiply to ac and add to b\n3. Rewrite the middle term and factor by grouping"
}
```

| Field     | Type   | Required | Description |
|-----------|--------|----------|-------------|
| `content` | string | Yes      | The reply text (supports markdown). |

### Response `201 Created`

```json
{
  "status": "success",
  "data": {
    "id": "r2b3c4d5-e6f7-8901-bcde-f12345678901",
    "post_id": "f1a2b3c4-d5e6-7890-abcd-ef1234567890",
    "content": "Here is how you can factor a quadratic equation using the ac method...",
    "author": {
      "id": "u2b3c4d5-e6f7-8901-bcde-f12345678901",
      "display_name": "Mr. Ochieng",
      "role": "instructor"
    },
    "is_solution": false,
    "created_at": "2026-02-15T11:30:00Z"
  },
  "message": "Reply posted successfully."
}
```

### Error Responses

| Status | Description |
|--------|-------------|
| `400 Bad Request` | Empty content. |
| `401 Unauthorized` | Missing or invalid JWT token. |
| `404 Not Found` | Parent post not found. |

### cURL Example

```bash
curl -X POST "http://localhost:8000/api/v1/forum/posts/f1a2b3c4-d5e6-7890-abcd-ef1234567890/replies" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"content": "Here is how you can factor a quadratic equation..."}'
```

---

## 6. Like Post

Toggle a like on a forum post. If the user has already liked the post, the like is removed (unlike).

### Request

```
POST /api/v1/forum/posts/{post_id}/like
```

| Parameter | Location | Type          | Required | Description |
|-----------|----------|---------------|----------|-------------|
| `post_id` | path     | string (UUID) | Yes      | The post to like or unlike. |

### Headers

| Header          | Value               |
|-----------------|---------------------|
| `Authorization` | `Bearer <token>`    |

### Response `200 OK` (Liked)

```json
{
  "status": "success",
  "data": {
    "post_id": "f1a2b3c4-d5e6-7890-abcd-ef1234567890",
    "liked": true,
    "likes_count": 13
  },
  "message": "Post liked."
}
```

### Response `200 OK` (Unliked)

```json
{
  "status": "success",
  "data": {
    "post_id": "f1a2b3c4-d5e6-7890-abcd-ef1234567890",
    "liked": false,
    "likes_count": 12
  },
  "message": "Post unliked."
}
```

### Error Responses

| Status | Description |
|--------|-------------|
| `401 Unauthorized` | Missing or invalid JWT token. |
| `404 Not Found` | Post not found. |

### cURL Example

```bash
curl -X POST "http://localhost:8000/api/v1/forum/posts/f1a2b3c4-d5e6-7890-abcd-ef1234567890/like" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 7. Pin Post

Pin or unpin a forum post. Pinned posts appear at the top of listing pages. **Requires moderator or admin role.**

### Request

```
POST /api/v1/forum/posts/{post_id}/pin
```

| Parameter | Location | Type          | Required | Description |
|-----------|----------|---------------|----------|-------------|
| `post_id` | path     | string (UUID) | Yes      | The post to pin or unpin. |

### Headers

| Header          | Value               |
|-----------------|---------------------|
| `Authorization` | `Bearer <token>`    |

### Authorization

This endpoint requires one of the following roles:
- `admin`
- `staff`
- `instructor` (moderator)

### Response `200 OK`

```json
{
  "status": "success",
  "data": {
    "post_id": "f1a2b3c4-d5e6-7890-abcd-ef1234567890",
    "is_pinned": true
  },
  "message": "Post pinned."
}
```

### Error Responses

| Status | Description |
|--------|-------------|
| `401 Unauthorized` | Missing or invalid JWT token. |
| `403 Forbidden` | User does not have moderator privileges. |
| `404 Not Found` | Post not found. |

### cURL Example

```bash
curl -X POST "http://localhost:8000/api/v1/forum/posts/f1a2b3c4-d5e6-7890-abcd-ef1234567890/pin" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 8. Mark Post as Solved

Mark a forum post as solved. Only the original post author can mark their post as solved.

### Request

```
POST /api/v1/forum/posts/{post_id}/mark-solved
```

| Parameter | Location | Type          | Required | Description |
|-----------|----------|---------------|----------|-------------|
| `post_id` | path     | string (UUID) | Yes      | The post to mark as solved. |

### Headers

| Header          | Value               |
|-----------------|---------------------|
| `Authorization` | `Bearer <token>`    |

### Request Body (Optional)

```json
{
  "solution_reply_id": "r1a2b3c4-d5e6-7890-abcd-ef1234567890"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `solution_reply_id` | string (UUID) | No | ID of the reply that solved the question. Marks that reply with `is_solution = true`. |

### Response `200 OK`

```json
{
  "status": "success",
  "data": {
    "post_id": "f1a2b3c4-d5e6-7890-abcd-ef1234567890",
    "is_solved": true,
    "solution_reply_id": "r1a2b3c4-d5e6-7890-abcd-ef1234567890"
  },
  "message": "Post marked as solved."
}
```

### Error Responses

| Status | Description |
|--------|-------------|
| `401 Unauthorized` | Missing or invalid JWT token. |
| `403 Forbidden` | User is not the original author. |
| `404 Not Found` | Post or reply not found. |

### cURL Example

```bash
curl -X POST "http://localhost:8000/api/v1/forum/posts/f1a2b3c4-d5e6-7890-abcd-ef1234567890/mark-solved" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"solution_reply_id": "r1a2b3c4-d5e6-7890-abcd-ef1234567890"}'
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
| `400` | Malformed request body or invalid field values. |
| `401` | Authentication token missing, expired, or invalid. |
| `403` | User does not have permission for this action. |
| `404` | Requested resource does not exist or has been deleted. |
| `422` | Request body is well-formed but semantically invalid. |
| `429` | Rate limit exceeded. |
| `500` | Unexpected server error. |

---

## Data Models

### ForumPost

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique post identifier. |
| `author_id` | UUID | FK to the user who created the post. |
| `title` | string (max 255) | Post title. |
| `content` | text | Post body content. |
| `category` | string (max 50) | Post category. Indexed. |
| `tags` | JSONB array | Tags for search and filtering. |
| `is_pinned` | boolean | Whether the post is pinned to the top. |
| `is_solved` | boolean | Whether the question has been answered. |
| `is_deleted` | boolean | Soft-delete flag. |
| `is_flagged` | boolean | Whether the post has been reported. |
| `view_count` | integer | Number of views. |
| `created_at` | datetime | Creation timestamp. Indexed. |
| `updated_at` | datetime | Last update timestamp. |
| `last_activity_at` | datetime | Timestamp of the most recent reply or edit. Indexed. |

### ForumReply

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique reply identifier. |
| `post_id` | UUID | FK to the parent forum post. |
| `author_id` | UUID | FK to the user who wrote the reply. |
| `content` | text | Reply body content. |
| `is_solution` | boolean | Whether this reply is marked as the solution. |
| `is_deleted` | boolean | Soft-delete flag. |
| `created_at` | datetime | Creation timestamp. |
| `updated_at` | datetime | Last update timestamp. |

### ForumLike

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique like identifier. |
| `user_id` | UUID | FK to the user who liked. |
| `post_id` | UUID or null | FK to the liked post (null if liking a reply). |
| `reply_id` | UUID or null | FK to the liked reply (null if liking a post). |
| `created_at` | datetime | When the like was created. |

**Constraints:**
- `UNIQUE(user_id, post_id)` -- one like per user per post.
- `UNIQUE(user_id, reply_id)` -- one like per user per reply.

### Forum Categories

| Value | Description |
|-------|-------------|
| `general` | General discussion topics. |
| `mathematics` | Mathematics and numeracy. |
| `science` | Science and technology. |
| `languages` | English, Kiswahili, and other languages. |
| `social-studies` | Social studies and citizenship. |
| `technology` | Digital literacy and computer science. |
| `help-support` | Platform help and technical support. |
