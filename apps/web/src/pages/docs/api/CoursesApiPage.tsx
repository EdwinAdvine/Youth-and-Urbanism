// CoursesApiPage - Courses API endpoint documentation.
// Documents course listing, CRUD operations, enrollment, modules, and reviews.

import React from 'react';
import { Link } from 'react-router-dom';
import DocsSection from '../../../components/docs/DocsSection';
import DocsApiEndpoint from '../../../components/docs/DocsApiEndpoint';

const CoursesApiPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
        Courses API
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        Endpoints for browsing, creating, managing, and enrolling in CBC-aligned courses.
        All course endpoints are prefixed with <code className="text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">/api/v1/courses</code>.
      </p>

      {/* Overview */}
      <DocsSection
        id="courses-overview"
        title="Overview"
        description="Courses are the core learning units aligned with the Kenyan CBC curriculum."
      >
        <p className="mb-4">
          Courses contain modules and lessons organized by grade level and learning area.
          Instructors can create and manage courses, while students browse, enroll, and
          track their progress. Course pricing supports both free and paid content.
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Role Permissions</h4>
          <ul className="text-sm text-blue-700 dark:text-blue-400 list-disc list-inside space-y-1">
            <li><strong>Students:</strong> Browse, enroll, view content, submit reviews</li>
            <li><strong>Instructors:</strong> Create, update, delete own courses</li>
            <li><strong>Admins:</strong> Full access to all course operations</li>
            <li><strong>Public:</strong> Browse courses (no authentication required)</li>
          </ul>
        </div>
      </DocsSection>

      {/* List Courses */}
      <DocsSection
        id="list-courses"
        title="List Courses"
        description="Retrieve a paginated list of available courses."
      >
        <DocsApiEndpoint
          method="GET"
          path="/api/v1/courses/"
          description="Retrieve a paginated list of published courses. Supports filtering by grade level, learning area, and sorting. No authentication required for browsing."
          auth={false}
          responseBody={`{
  "status": "success",
  "data": {
    "courses": [
      {
        "id": "course-uuid-001",
        "title": "Mathematics Grade 7 - Numbers",
        "description": "Comprehensive number operations for Grade 7 learners.",
        "grade_levels": ["Grade 7"],
        "learning_area": "Mathematics",
        "instructor": {
          "id": "instructor-uuid",
          "full_name": "Mr. Ochieng"
        },
        "price": 500.00,
        "currency": "KES",
        "rating": 4.7,
        "enrolled_count": 234,
        "thumbnail_url": "/uploads/courses/math7.jpg",
        "created_at": "2026-01-10T08:00:00Z"
      }
    ],
    "page": 1,
    "limit": 20,
    "total": 156,
    "total_pages": 8
  }
}`}
          curlExample={`# List all courses (default pagination)
curl -X GET "http://localhost:8000/api/v1/courses/"

# Filter by grade level and learning area
curl -X GET "http://localhost:8000/api/v1/courses/?grade_level=Grade%207&learning_area=Mathematics&page=1&limit=10&sort_by=rating"

# Available query parameters:
# page (default: 1)
# limit (default: 20, max: 100)
# grade_level (e.g., "Grade 7", "Grade 8")
# learning_area (e.g., "Mathematics", "Science", "English")
# sort_by (options: "rating", "newest", "popular", "price_asc", "price_desc")`}
        />
      </DocsSection>

      {/* Get Course Details */}
      <DocsSection
        id="get-course"
        title="Get Course Details"
        description="Retrieve detailed information for a specific course."
      >
        <DocsApiEndpoint
          method="GET"
          path="/api/v1/courses/:id"
          description="Get full details of a specific course including its description, modules overview, instructor info, pricing, and enrollment status. If authenticated, includes the current user's enrollment and progress data."
          auth={false}
          responseBody={`{
  "status": "success",
  "data": {
    "id": "course-uuid-001",
    "title": "Mathematics Grade 7 - Numbers",
    "description": "Comprehensive number operations for Grade 7 learners aligned with CBC.",
    "grade_levels": ["Grade 7"],
    "learning_area": "Mathematics",
    "instructor": {
      "id": "instructor-uuid",
      "full_name": "Mr. Ochieng",
      "avatar_url": "/uploads/avatars/ochieng.jpg"
    },
    "price": 500.00,
    "currency": "KES",
    "is_free": false,
    "rating": 4.7,
    "review_count": 45,
    "enrolled_count": 234,
    "module_count": 8,
    "lesson_count": 32,
    "estimated_duration": "12 hours",
    "thumbnail_url": "/uploads/courses/math7.jpg",
    "is_enrolled": false,
    "created_at": "2026-01-10T08:00:00Z",
    "updated_at": "2026-02-01T14:30:00Z"
  }
}`}
          curlExample={`curl -X GET http://localhost:8000/api/v1/courses/course-uuid-001`}
        />
      </DocsSection>

      {/* Create Course */}
      <DocsSection
        id="create-course"
        title="Create Course"
        description="Create a new course (instructors only)."
      >
        <DocsApiEndpoint
          method="POST"
          path="/api/v1/courses/"
          description="Create a new course. Only users with the instructor or admin role can create courses. New courses are created in draft status and must be published separately. The modules array defines the course structure."
          auth={true}
          requestBody={`{
  "title": "Science Grade 8 - Living Things",
  "description": "Explore the diversity of living organisms and their classifications.",
  "grade_levels": ["Grade 8"],
  "learning_area": "Science",
  "price": 750.00,
  "currency": "KES",
  "modules": [
    {
      "title": "Introduction to Classification",
      "description": "Understanding how scientists classify living things.",
      "order": 1,
      "lessons": [
        {
          "title": "What is Classification?",
          "content_type": "text",
          "order": 1
        }
      ]
    }
  ]
}`}
          responseBody={`{
  "status": "success",
  "data": {
    "id": "course-uuid-new",
    "title": "Science Grade 8 - Living Things",
    "status": "draft",
    "created_at": "2026-02-15T10:00:00Z"
  }
}`}
          curlExample={`curl -X POST http://localhost:8000/api/v1/courses/ \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Science Grade 8 - Living Things",
    "description": "Explore the diversity of living organisms.",
    "grade_levels": ["Grade 8"],
    "learning_area": "Science",
    "price": 750.00,
    "modules": [{"title": "Introduction", "order": 1}]
  }'`}
        />
      </DocsSection>

      {/* Update Course */}
      <DocsSection
        id="update-course"
        title="Update Course"
        description="Update an existing course (owner or admin only)."
      >
        <DocsApiEndpoint
          method="PUT"
          path="/api/v1/courses/:id"
          description="Update course details. Only the course creator or an admin can update a course. Partial updates are supported; only include the fields you want to change."
          auth={true}
          requestBody={`{
  "title": "Science Grade 8 - Living Things (Updated)",
  "price": 600.00,
  "description": "Updated description with more comprehensive content."
}`}
          responseBody={`{
  "status": "success",
  "data": {
    "id": "course-uuid-001",
    "title": "Science Grade 8 - Living Things (Updated)",
    "price": 600.00,
    "updated_at": "2026-02-15T11:00:00Z"
  }
}`}
          curlExample={`curl -X PUT http://localhost:8000/api/v1/courses/course-uuid-001 \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \\
  -H "Content-Type: application/json" \\
  -d '{"title": "Updated Course Title", "price": 600.00}'`}
        />
      </DocsSection>

      {/* Delete Course */}
      <DocsSection
        id="delete-course"
        title="Delete Course"
        description="Soft-delete a course (owner or admin only)."
      >
        <DocsApiEndpoint
          method="DELETE"
          path="/api/v1/courses/:id"
          description="Soft-delete a course. The course is marked as deleted but data is preserved for recovery. Only the course creator or admin can delete a course. Active enrollments are preserved but the course becomes inaccessible to new students."
          auth={true}
          responseBody={`{
  "status": "success",
  "data": {
    "message": "Course deleted successfully."
  }
}`}
          curlExample={`curl -X DELETE http://localhost:8000/api/v1/courses/course-uuid-001 \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."`}
        />
      </DocsSection>

      {/* Enroll in Course */}
      <DocsSection
        id="enroll"
        title="Enroll in Course"
        description="Enroll the authenticated user in a course."
      >
        <DocsApiEndpoint
          method="POST"
          path="/api/v1/courses/:id/enroll"
          description="Enroll the authenticated student in a course. Free courses are enrolled instantly. Paid courses require a completed payment (via wallet, M-Pesa, or other payment method). Returns the enrollment record with initial progress."
          auth={true}
          responseBody={`{
  "status": "success",
  "data": {
    "enrollment_id": "enrollment-uuid",
    "course_id": "course-uuid-001",
    "student_id": "student-uuid",
    "status": "active",
    "progress": 0,
    "enrolled_at": "2026-02-15T12:00:00Z"
  }
}`}
          curlExample={`curl -X POST http://localhost:8000/api/v1/courses/course-uuid-001/enroll \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."`}
        />
      </DocsSection>

      {/* Get Course Modules */}
      <DocsSection
        id="course-modules"
        title="Course Modules"
        description="Retrieve modules and lessons for a course."
      >
        <DocsApiEndpoint
          method="GET"
          path="/api/v1/courses/:id/modules"
          description="Get the complete module and lesson structure of a course. Includes lesson content for enrolled users. Non-enrolled users see module titles and descriptions but not full lesson content."
          auth={true}
          responseBody={`{
  "status": "success",
  "data": {
    "course_id": "course-uuid-001",
    "modules": [
      {
        "id": "module-uuid-001",
        "title": "Introduction to Classification",
        "description": "Understanding how scientists classify living things.",
        "order": 1,
        "lesson_count": 4,
        "lessons": [
          {
            "id": "lesson-uuid-001",
            "title": "What is Classification?",
            "content_type": "text",
            "duration": "15 min",
            "order": 1,
            "is_completed": false
          }
        ]
      }
    ]
  }
}`}
          curlExample={`curl -X GET http://localhost:8000/api/v1/courses/course-uuid-001/modules \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."`}
        />
      </DocsSection>

      {/* Get Course Reviews */}
      <DocsSection
        id="get-reviews"
        title="Get Course Reviews"
        description="Retrieve reviews for a specific course."
      >
        <DocsApiEndpoint
          method="GET"
          path="/api/v1/courses/:id/reviews"
          description="Get paginated reviews for a course. Reviews include a rating (1-5), text comment, and reviewer info. No authentication required to read reviews."
          auth={false}
          responseBody={`{
  "status": "success",
  "data": {
    "reviews": [
      {
        "id": "review-uuid",
        "rating": 5,
        "comment": "Excellent course! The explanations are clear and the exercises are helpful.",
        "reviewer": {
          "id": "student-uuid",
          "full_name": "Amina K.",
          "avatar_url": "/uploads/avatars/amina.jpg"
        },
        "created_at": "2026-02-10T16:00:00Z"
      }
    ],
    "average_rating": 4.7,
    "total_reviews": 45,
    "page": 1,
    "limit": 10
  }
}`}
          curlExample={`curl -X GET "http://localhost:8000/api/v1/courses/course-uuid-001/reviews?page=1&limit=10"`}
        />
      </DocsSection>

      {/* Add Course Review */}
      <DocsSection
        id="add-review"
        title="Add Course Review"
        description="Submit a review for an enrolled course."
      >
        <DocsApiEndpoint
          method="POST"
          path="/api/v1/courses/:id/reviews"
          description="Submit a review for a course. Only enrolled students who have made progress in the course can submit reviews. Each student can submit one review per course and can update it later."
          auth={true}
          requestBody={`{
  "rating": 5,
  "comment": "Excellent course! The explanations are very clear."
}`}
          responseBody={`{
  "status": "success",
  "data": {
    "id": "review-uuid-new",
    "course_id": "course-uuid-001",
    "rating": 5,
    "comment": "Excellent course! The explanations are very clear.",
    "created_at": "2026-02-15T14:00:00Z"
  }
}`}
          curlExample={`curl -X POST http://localhost:8000/api/v1/courses/course-uuid-001/reviews \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \\
  -H "Content-Type: application/json" \\
  -d '{"rating": 5, "comment": "Excellent course!"}'`}
        />
      </DocsSection>

      {/* Query Parameters Reference */}
      <DocsSection
        id="query-params"
        title="Query Parameters Reference"
        description="Summary of available query parameters for course listing."
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800">
                <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">Parameter</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">Type</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">Default</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              <tr>
                <td className="px-4 py-2 font-mono text-xs text-gray-900 dark:text-white">page</td>
                <td className="px-4 py-2 text-gray-600 dark:text-gray-400">integer</td>
                <td className="px-4 py-2 text-gray-600 dark:text-gray-400">1</td>
                <td className="px-4 py-2 text-gray-600 dark:text-gray-400">Page number for pagination</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono text-xs text-gray-900 dark:text-white">limit</td>
                <td className="px-4 py-2 text-gray-600 dark:text-gray-400">integer</td>
                <td className="px-4 py-2 text-gray-600 dark:text-gray-400">20</td>
                <td className="px-4 py-2 text-gray-600 dark:text-gray-400">Items per page (max 100)</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono text-xs text-gray-900 dark:text-white">grade_level</td>
                <td className="px-4 py-2 text-gray-600 dark:text-gray-400">string</td>
                <td className="px-4 py-2 text-gray-600 dark:text-gray-400">-</td>
                <td className="px-4 py-2 text-gray-600 dark:text-gray-400">Filter by grade (e.g., "Grade 7")</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono text-xs text-gray-900 dark:text-white">learning_area</td>
                <td className="px-4 py-2 text-gray-600 dark:text-gray-400">string</td>
                <td className="px-4 py-2 text-gray-600 dark:text-gray-400">-</td>
                <td className="px-4 py-2 text-gray-600 dark:text-gray-400">Filter by subject area</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono text-xs text-gray-900 dark:text-white">sort_by</td>
                <td className="px-4 py-2 text-gray-600 dark:text-gray-400">string</td>
                <td className="px-4 py-2 text-gray-600 dark:text-gray-400">newest</td>
                <td className="px-4 py-2 text-gray-600 dark:text-gray-400">Sort order: rating, newest, popular, price_asc, price_desc</td>
              </tr>
            </tbody>
          </table>
        </div>
      </DocsSection>

      {/* Bottom navigation */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8 flex justify-between items-center">
        <Link
          to="/docs/api/auth"
          className="text-sm text-red-600 dark:text-red-400 hover:underline"
        >
          &larr; Auth API
        </Link>
        <Link
          to="/docs/api/ai-tutor"
          className="text-sm text-red-600 dark:text-red-400 hover:underline"
        >
          AI Tutor API &rarr;
        </Link>
      </div>
    </div>
  );
};

export default CoursesApiPage;
