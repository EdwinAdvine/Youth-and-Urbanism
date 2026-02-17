# Search API Reference

> **Base URL:** `/api/v1/search`
>
> **Authentication:** Search endpoints are public. Authenticated users may receive personalized results based on their enrollment and grade level.
>
> **Version:** 1.0 &mdash; Urban Home School (The Bird AI)

---

## Table of Contents

1. [Global Search](#1-global-search)
2. [Search Courses](#2-search-courses)
3. [Search Forum Posts](#3-search-forum-posts)
4. [Error Codes](#error-codes)

---

## 1. Global Search

Perform a unified search across courses, forum posts, and other platform content. Returns results grouped by content type.

### Request

```
GET /api/v1/search/
```

| Parameter | Location | Type   | Required | Description |
|-----------|----------|--------|----------|-------------|
| `q`       | query    | string | Yes      | Search query string (minimum 2 characters). |
| `type`    | query    | string | No       | Filter results by type. Allowed values: `courses`, `posts`, `all` (default: `all`). |
| `page`    | query    | integer | No      | Page number (default: `1`). |
| `limit`   | query    | integer | No      | Items per page per type (default: `10`, max: `50`). |

### Response `200 OK`

```json
{
  "status": "success",
  "data": {
    "query": "fractions",
    "total_results": 23,
    "results": {
      "courses": [
        {
          "id": "c1d2e3f4-a5b6-7890-cdef-123456789012",
          "type": "course",
          "title": "Grade 4 Mathematics - Fractions",
          "description": "Learn about fractions, equivalent fractions, and comparing fractions on a number line.",
          "thumbnail_url": "https://cdn.urbanhomeschool.co.ke/courses/math-fractions.webp",
          "grade_levels": ["Grade 4"],
          "learning_area": "Mathematics",
          "average_rating": 4.75,
          "enrollment_count": 234,
          "is_free": true,
          "relevance_score": 0.95
        },
        {
          "id": "c2d3e4f5-b6c7-8901-def0-234567890123",
          "type": "course",
          "title": "Grade 7 Mathematics - Operations with Fractions",
          "description": "Advanced fraction operations including multiplication, division, and word problems.",
          "thumbnail_url": "https://cdn.urbanhomeschool.co.ke/courses/math-adv-fractions.webp",
          "grade_levels": ["Grade 7"],
          "learning_area": "Mathematics",
          "average_rating": 4.60,
          "enrollment_count": 178,
          "is_free": false,
          "price": 500.00,
          "currency": "KES",
          "relevance_score": 0.88
        }
      ],
      "posts": [
        {
          "id": "f1a2b3c4-d5e6-7890-abcd-ef1234567890",
          "type": "post",
          "title": "How do I add fractions with different denominators?",
          "content_preview": "I am confused about adding fractions when the bottom numbers are different...",
          "category": "mathematics",
          "author_name": "Brian Kipchoge",
          "replies_count": 8,
          "is_solved": true,
          "created_at": "2026-02-08T14:30:00Z",
          "relevance_score": 0.82
        }
      ]
    },
    "pagination": {
      "page": 1,
      "limit": 10,
      "has_more_courses": true,
      "has_more_posts": false
    }
  }
}
```

### Error Responses

| Status | Description |
|--------|-------------|
| `400 Bad Request` | Missing query parameter `q` or query is too short. |
| `422 Unprocessable Entity` | Invalid `type` filter value. |

### cURL Example

```bash
# Global search for "fractions"
curl -X GET "http://localhost:8000/api/v1/search/?q=fractions&type=all&page=1&limit=10"

# Search only courses
curl -X GET "http://localhost:8000/api/v1/search/?q=fractions&type=courses"
```

---

## 2. Search Courses

Search specifically within courses with additional filtering by grade level and learning area.

### Request

```
GET /api/v1/search/courses
```

| Parameter       | Location | Type    | Required | Description |
|-----------------|----------|---------|----------|-------------|
| `q`             | query    | string  | Yes      | Search query string (minimum 2 characters). |
| `grade_level`   | query    | string  | No       | Filter by grade level (e.g., `Grade 4`, `Grade 7`, `ECD 1`). |
| `learning_area` | query    | string  | No       | Filter by learning area (e.g., `Mathematics`, `Science`, `Languages`). |
| `is_free`       | query    | boolean | No       | Filter by pricing. `true` for free courses, `false` for paid. |
| `min_rating`    | query    | number  | No       | Minimum average rating (0.0 to 5.0). |
| `page`          | query    | integer | No       | Page number (default: `1`). |
| `limit`         | query    | integer | No       | Items per page (default: `20`, max: `50`). |
| `sort`          | query    | string  | No       | Sort order: `relevance` (default), `rating`, `newest`, `popular`. |

### Response `200 OK`

```json
{
  "status": "success",
  "data": {
    "query": "fractions",
    "filters": {
      "grade_level": "Grade 4",
      "learning_area": "Mathematics"
    },
    "courses": [
      {
        "id": "c1d2e3f4-a5b6-7890-cdef-123456789012",
        "title": "Grade 4 Mathematics - Fractions",
        "description": "Learn about fractions, equivalent fractions, and comparing fractions on a number line.",
        "thumbnail_url": "https://cdn.urbanhomeschool.co.ke/courses/math-fractions.webp",
        "grade_levels": ["Grade 4"],
        "learning_area": "Mathematics",
        "instructor": {
          "id": "u2b3c4d5-e6f7-8901-bcde-f12345678901",
          "name": "Ms. Faith Akinyi"
        },
        "price": 0.00,
        "currency": "KES",
        "is_free": true,
        "is_published": true,
        "is_featured": true,
        "average_rating": 4.75,
        "total_reviews": 45,
        "enrollment_count": 234,
        "estimated_duration_hours": 30,
        "competencies": ["Number and Operations", "Fractions"],
        "relevance_score": 0.95,
        "created_at": "2025-10-15T08:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total_items": 8,
      "total_pages": 1
    }
  }
}
```

### Error Responses

| Status | Description |
|--------|-------------|
| `400 Bad Request` | Missing query parameter `q`. |

### cURL Example

```bash
# Search for Grade 4 Mathematics courses about fractions
curl -X GET "http://localhost:8000/api/v1/search/courses?q=fractions&grade_level=Grade%204&learning_area=Mathematics&sort=relevance"
```

---

## 3. Search Forum Posts

Search specifically within forum discussions.

### Request

```
GET /api/v1/search/posts
```

| Parameter  | Location | Type    | Required | Description |
|------------|----------|---------|----------|-------------|
| `q`        | query    | string  | Yes      | Search query string (minimum 2 characters). |
| `category` | query    | string  | No       | Filter by forum category (e.g., `mathematics`, `science`). |
| `is_solved` | query   | boolean | No       | Filter by solved status. |
| `page`     | query    | integer | No       | Page number (default: `1`). |
| `limit`    | query    | integer | No       | Items per page (default: `20`, max: `50`). |
| `sort`     | query    | string  | No       | Sort order: `relevance` (default), `latest`, `popular`. |

### Response `200 OK`

```json
{
  "status": "success",
  "data": {
    "query": "quadratic equations",
    "filters": {
      "category": null,
      "is_solved": null
    },
    "posts": [
      {
        "id": "f1a2b3c4-d5e6-7890-abcd-ef1234567890",
        "title": "How do I solve quadratic equations?",
        "content_preview": "I am struggling with factoring quadratic equations. Can someone explain the steps...",
        "category": "mathematics",
        "tags": ["algebra", "quadratic", "grade-9"],
        "author": {
          "id": "u1a2b3c4-d5e6-7890-abcd-ef1234567890",
          "display_name": "Jane Wanjiku",
          "role": "student"
        },
        "is_pinned": false,
        "is_solved": true,
        "view_count": 87,
        "likes_count": 12,
        "replies_count": 5,
        "created_at": "2026-02-10T14:30:00Z",
        "last_activity_at": "2026-02-14T09:15:00Z",
        "relevance_score": 0.91
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total_items": 3,
      "total_pages": 1
    }
  }
}
```

### Error Responses

| Status | Description |
|--------|-------------|
| `400 Bad Request` | Missing query parameter `q`. |

### cURL Example

```bash
# Search for solved math forum posts about quadratic equations
curl -X GET "http://localhost:8000/api/v1/search/posts?q=quadratic%20equations&category=mathematics&is_solved=true"
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
| `400` | Missing or too-short search query. |
| `422` | Invalid filter parameter values. |
| `500` | Unexpected server error. |

---

## Search Behavior

### Indexed Fields

| Content Type | Fields Searched |
|-------------|----------------|
| Courses | `title`, `description`, `learning_area`, `grade_levels`, `competencies` |
| Forum Posts | `title`, `content`, `tags`, `category` |

### Relevance Scoring

Search results include a `relevance_score` (0.0 to 1.0) indicating how closely the result matches the query. Scoring factors include:

- **Title match** (highest weight): Direct keyword match in the title.
- **Content match**: Keyword match in description or body content.
- **Exact phrase match**: Bonus for matching the exact search phrase.
- **Recency**: More recent content receives a slight boost.
- **Popularity**: Higher enrollment counts or view counts provide a minor boost.

### Search Query Syntax

- **Simple keywords**: `fractions addition` - matches documents containing both words.
- **Quoted phrases**: `"quadratic equations"` - matches the exact phrase.
- **Partial matches**: The search engine performs prefix matching, so `frac` will match `fractions`.
