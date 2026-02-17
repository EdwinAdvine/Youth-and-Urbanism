# Categories API Reference

> **Base URL:** `/api/v1/categories`
>
> **Authentication:** All category endpoints are public (no authentication required). Categories represent Kenya's CBC (Competency-Based Curriculum) learning areas.
>
> **Version:** 1.0 &mdash; Urban Home School (The Bird AI)

---

## Table of Contents

1. [List Categories](#1-list-categories)
2. [Get Category](#2-get-category)
3. [Get Category Competencies](#3-get-category-competencies)
4. [Error Codes](#error-codes)
5. [Data Models](#data-models)

---

## 1. List Categories

Retrieve all active CBC learning area categories. Returns a hierarchical list with top-level categories and their subcategories.

### Request

```
GET /api/v1/categories/
```

| Parameter   | Location | Type    | Required | Description |
|-------------|----------|---------|----------|-------------|
| `is_active` | query    | boolean | No       | Filter by active status (default: `true`). |

### Response `200 OK`

```json
{
  "status": "success",
  "data": {
    "categories": [
      {
        "id": "cat1a2b3-c4d5-6789-0abc-def123456789",
        "name": "Mathematics",
        "slug": "mathematics",
        "description": "CBC Mathematics covering number operations, algebra, geometry, measurement, and data handling.",
        "icon": "calculator",
        "image_url": "https://cdn.urbanhomeschool.co.ke/categories/mathematics.webp",
        "parent_id": null,
        "display_order": 1,
        "is_active": true,
        "course_count": 45,
        "subcategories": [
          {
            "id": "cat2b3c4-d5e6-7890-1abc-ef1234567890",
            "name": "Number and Operations",
            "slug": "number-and-operations",
            "description": "Whole numbers, fractions, decimals, and arithmetic operations.",
            "parent_id": "cat1a2b3-c4d5-6789-0abc-def123456789",
            "display_order": 1,
            "course_count": 18
          },
          {
            "id": "cat3c4d5-e6f7-8901-2bcd-f12345678901",
            "name": "Geometry and Measurement",
            "slug": "geometry-and-measurement",
            "description": "Shapes, spatial reasoning, units of measurement, and practical applications.",
            "parent_id": "cat1a2b3-c4d5-6789-0abc-def123456789",
            "display_order": 2,
            "course_count": 12
          }
        ]
      },
      {
        "id": "cat4d5e6-f7a8-9012-3cde-123456789012",
        "name": "Science and Technology",
        "slug": "science-and-technology",
        "description": "CBC Science covering living things, environment, matter, energy, and technology.",
        "icon": "flask",
        "image_url": "https://cdn.urbanhomeschool.co.ke/categories/science.webp",
        "parent_id": null,
        "display_order": 2,
        "is_active": true,
        "course_count": 38,
        "subcategories": []
      },
      {
        "id": "cat5e6f7-a8b9-0123-4def-234567890123",
        "name": "Languages",
        "slug": "languages",
        "description": "English, Kiswahili, and indigenous languages aligned with CBC language activities.",
        "icon": "book-open",
        "image_url": "https://cdn.urbanhomeschool.co.ke/categories/languages.webp",
        "parent_id": null,
        "display_order": 3,
        "is_active": true,
        "course_count": 32,
        "subcategories": []
      },
      {
        "id": "cat6f7a8-b9c0-1234-5ef0-345678901234",
        "name": "Social Studies",
        "slug": "social-studies",
        "description": "Citizenship, history, geography, and social responsibility within the CBC framework.",
        "icon": "globe",
        "image_url": "https://cdn.urbanhomeschool.co.ke/categories/social-studies.webp",
        "parent_id": null,
        "display_order": 4,
        "is_active": true,
        "course_count": 22,
        "subcategories": []
      },
      {
        "id": "cat7a8b9-c0d1-2345-6f01-456789012345",
        "name": "Creative Arts",
        "slug": "creative-arts",
        "description": "Art, music, drama, and creative expression as per CBC requirements.",
        "icon": "palette",
        "image_url": "https://cdn.urbanhomeschool.co.ke/categories/creative-arts.webp",
        "parent_id": null,
        "display_order": 5,
        "is_active": true,
        "course_count": 15,
        "subcategories": []
      },
      {
        "id": "cat8b9c0-d1e2-3456-7012-567890123456",
        "name": "Digital Literacy",
        "slug": "digital-literacy",
        "description": "Computer skills, coding, digital citizenship, and online safety.",
        "icon": "laptop",
        "image_url": "https://cdn.urbanhomeschool.co.ke/categories/digital-literacy.webp",
        "parent_id": null,
        "display_order": 6,
        "is_active": true,
        "course_count": 20,
        "subcategories": []
      }
    ]
  }
}
```

### cURL Example

```bash
curl -X GET "http://localhost:8000/api/v1/categories/"
```

---

## 2. Get Category

Retrieve a single category by ID, including its subcategories.

### Request

```
GET /api/v1/categories/{id}
```

| Parameter | Location | Type          | Required | Description |
|-----------|----------|---------------|----------|-------------|
| `id`      | path     | string (UUID) | Yes      | The category identifier. |

### Response `200 OK`

```json
{
  "status": "success",
  "data": {
    "id": "cat1a2b3-c4d5-6789-0abc-def123456789",
    "name": "Mathematics",
    "slug": "mathematics",
    "description": "CBC Mathematics covering number operations, algebra, geometry, measurement, and data handling.",
    "icon": "calculator",
    "image_url": "https://cdn.urbanhomeschool.co.ke/categories/mathematics.webp",
    "parent_id": null,
    "display_order": 1,
    "is_active": true,
    "course_count": 45,
    "subcategories": [
      {
        "id": "cat2b3c4-d5e6-7890-1abc-ef1234567890",
        "name": "Number and Operations",
        "slug": "number-and-operations",
        "description": "Whole numbers, fractions, decimals, and arithmetic operations.",
        "parent_id": "cat1a2b3-c4d5-6789-0abc-def123456789",
        "display_order": 1,
        "course_count": 18
      },
      {
        "id": "cat3c4d5-e6f7-8901-2bcd-f12345678901",
        "name": "Geometry and Measurement",
        "slug": "geometry-and-measurement",
        "description": "Shapes, spatial reasoning, units of measurement, and practical applications.",
        "parent_id": "cat1a2b3-c4d5-6789-0abc-def123456789",
        "display_order": 2,
        "course_count": 12
      },
      {
        "id": "cat9c0d1-e2f3-4567-8123-678901234567",
        "name": "Algebra",
        "slug": "algebra",
        "description": "Algebraic expressions, equations, inequalities, and patterns.",
        "parent_id": "cat1a2b3-c4d5-6789-0abc-def123456789",
        "display_order": 3,
        "course_count": 8
      },
      {
        "id": "cata0d1e-2f34-5678-9234-789012345678",
        "name": "Data Handling and Probability",
        "slug": "data-handling-and-probability",
        "description": "Collecting, organizing, and interpreting data; basic probability concepts.",
        "parent_id": "cat1a2b3-c4d5-6789-0abc-def123456789",
        "display_order": 4,
        "course_count": 7
      }
    ],
    "created_at": "2025-08-01T00:00:00Z",
    "updated_at": "2026-02-01T10:00:00Z"
  }
}
```

### Error Responses

| Status | Description |
|--------|-------------|
| `404 Not Found` | Category with the given ID does not exist. |

### cURL Example

```bash
curl -X GET "http://localhost:8000/api/v1/categories/cat1a2b3-c4d5-6789-0abc-def123456789"
```

---

## 3. Get Category Competencies

Retrieve the CBC competencies associated with a specific learning area category. Competencies define the measurable skills and knowledge that students should develop.

### Request

```
GET /api/v1/categories/{id}/competencies
```

| Parameter    | Location | Type          | Required | Description |
|--------------|----------|---------------|----------|-------------|
| `id`         | path     | string (UUID) | Yes      | The category identifier. |
| `grade_level` | query   | string        | No       | Filter competencies by grade level (e.g., `Grade 4`, `Grade 7`). |

### Response `200 OK`

```json
{
  "status": "success",
  "data": {
    "category_id": "cat1a2b3-c4d5-6789-0abc-def123456789",
    "category_name": "Mathematics",
    "competencies": [
      {
        "id": "comp1a2b-3c4d-5e6f-7890-abcdef123456",
        "code": "MATH-G7-NO-01",
        "title": "Number Operations",
        "description": "Perform operations with whole numbers, fractions, decimals, and integers with fluency and accuracy.",
        "grade_level": "Grade 7",
        "strand": "Number and Operations",
        "sub_strand": "Operations with Integers",
        "learning_outcomes": [
          "Add and subtract integers using a number line",
          "Multiply and divide integers",
          "Apply order of operations with integers"
        ],
        "assessment_criteria": [
          "Solves integer arithmetic problems accurately",
          "Applies BODMAS/PEMDAS correctly",
          "Explains reasoning behind integer operations"
        ]
      },
      {
        "id": "comp2b3c-4d5e-6f78-9012-bcdef1234567",
        "code": "MATH-G7-GM-01",
        "title": "Geometric Reasoning",
        "description": "Identify, describe, and construct geometric shapes; calculate perimeter, area, and volume.",
        "grade_level": "Grade 7",
        "strand": "Geometry and Measurement",
        "sub_strand": "Properties of Shapes",
        "learning_outcomes": [
          "Classify triangles and quadrilaterals by properties",
          "Calculate perimeter and area of composite shapes",
          "Construct geometric shapes using instruments"
        ],
        "assessment_criteria": [
          "Correctly classifies shapes by properties",
          "Calculates measurements with proper units",
          "Uses construction tools accurately"
        ]
      }
    ],
    "total_competencies": 12
  }
}
```

### Error Responses

| Status | Description |
|--------|-------------|
| `404 Not Found` | Category not found. |

### cURL Example

```bash
# Get Grade 7 Mathematics competencies
curl -X GET "http://localhost:8000/api/v1/categories/cat1a2b3-c4d5-6789-0abc-def123456789/competencies?grade_level=Grade%207"
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
| `404` | Requested category does not exist. |
| `500` | Unexpected server error. |

---

## Data Models

### Category

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique category identifier. |
| `name` | string (max 100) | Category display name. Indexed. |
| `slug` | string (max 100) | URL-friendly unique identifier. Unique. Indexed. |
| `description` | text or null | Category description. |
| `icon` | string (max 100) or null | Icon identifier or CSS class. |
| `image_url` | string (max 500) or null | Category header image URL. |
| `parent_id` | UUID or null | FK to parent category (self-referencing). Indexed. |
| `display_order` | integer | Sort order for display (default: 0). |
| `is_active` | boolean | Whether the category is visible. Indexed. |
| `course_count` | integer | Number of courses in this category. |
| `created_at` | datetime | Creation timestamp. |
| `updated_at` | datetime | Last update timestamp. |

### CBC Learning Areas

The category hierarchy maps to Kenya's Competency-Based Curriculum learning areas:

| Category | Description | CBC Alignment |
|----------|-------------|---------------|
| Mathematics | Number operations, algebra, geometry, measurement, data handling | Mathematics Activity Area |
| Science and Technology | Living things, environment, matter, energy, technology | Science and Technology Activity Area |
| Languages | English, Kiswahili, indigenous languages | Language Activities |
| Social Studies | Citizenship, history, geography, social responsibility | Social Studies Activity Area |
| Creative Arts | Art, music, drama, creative expression | Creative Activities |
| Digital Literacy | Computer skills, coding, digital citizenship | Digital Literacy |
| Religious Education | Christian Religious Education, Islamic Religious Education | Religious Activity Area |
| Physical Education | Health, fitness, sports, wellness | Physical and Health Education |
