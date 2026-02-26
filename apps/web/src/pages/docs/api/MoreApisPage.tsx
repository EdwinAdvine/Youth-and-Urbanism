// MoreApisPage - Overview of additional API endpoint groups.
// Lists users, assessments, forum, notifications, store, certificates, and more.

import React from 'react';
import { Link } from 'react-router-dom';
import DocsSection from '../../../components/docs/DocsSection';
import DocsCodeBlock from '../../../components/docs/DocsCodeBlock';
import DocsApiEndpoint from '../../../components/docs/DocsApiEndpoint';

const MoreApisPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
        More APIs
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        Overview of additional API endpoint groups including users, assessments, forum,
        notifications, store, certificates, and more.
      </p>

      {/* Users API */}
      <DocsSection
        id="users-api"
        title="Users API"
        description="User management, profile updates, and role-based queries."
      >
        <p className="mb-4">
          Manage user accounts, update profiles, and query users by role. Admin-only endpoints
          allow user suspension, role changes, and account management.
        </p>
        <DocsApiEndpoint
          method="GET"
          path="/api/v1/users/"
          description="List all users with pagination. Admin only. Supports filtering by role, verification status, and search by name or email."
          auth={true}
        />
        <DocsApiEndpoint
          method="GET"
          path="/api/v1/users/:id"
          description="Get detailed user profile by ID. Returns public profile data for any authenticated user, full profile data for the user themselves or admins."
          auth={true}
        />
        <DocsApiEndpoint
          method="PUT"
          path="/api/v1/users/:id"
          description="Update user profile. Users can update their own profile. Admins can update any user's profile including role and verification status."
          auth={true}
        />
      </DocsSection>

      {/* Assessments API */}
      <DocsSection
        id="assessments-api"
        title="Assessments API"
        description="Create and manage quizzes, assignments, exams, and grade submissions."
      >
        <p className="mb-4">
          The Assessments API supports multiple assessment types: quizzes with automatic grading,
          assignments with file uploads, projects with rubric-based evaluation, and timed exams.
          Questions are stored as JSONB for flexible question types.
        </p>
        <DocsApiEndpoint
          method="GET"
          path="/api/v1/assessments/"
          description="List assessments for a course or student. Supports filtering by type (quiz, assignment, project, exam), course ID, and status."
          auth={true}
        />
        <DocsApiEndpoint
          method="POST"
          path="/api/v1/assessments/"
          description="Create a new assessment. Instructors create assessments linked to courses with configurable question types, time limits, and grading criteria."
          auth={true}
        />
        <DocsApiEndpoint
          method="POST"
          path="/api/v1/assessments/:id/submit"
          description="Submit answers or files for an assessment. Quizzes are auto-graded immediately. Assignments and projects are queued for instructor review."
          auth={true}
        />
      </DocsSection>

      {/* Forum API */}
      <DocsSection
        id="forum-api"
        title="Forum API"
        description="Community forum with posts, replies, likes, categories, and moderation."
      >
        <p className="mb-4">
          The Forum API powers the UHS community space where students, parents, and instructors
          can discuss topics, ask questions, and share resources. Posts are organized by
          categories and support rich text content.
        </p>
        <DocsApiEndpoint
          method="GET"
          path="/api/v1/forum/posts"
          description="List forum posts with pagination. Supports filtering by category, sorting by newest, popular, or most replied. Includes post preview and reply count."
          auth={false}
        />
        <DocsApiEndpoint
          method="POST"
          path="/api/v1/forum/posts"
          description="Create a new forum post. Requires authentication. Include title, content (supports markdown), and category. Posts may be moderated before becoming visible."
          auth={true}
        />
        <DocsApiEndpoint
          method="POST"
          path="/api/v1/forum/posts/:id/replies"
          description="Reply to a forum post. Supports nested replies for threaded conversations. Users receive notifications when their posts receive replies."
          auth={true}
        />
      </DocsSection>

      {/* Notifications API */}
      <DocsSection
        id="notifications-api"
        title="Notifications API"
        description="In-app notifications and WebSocket real-time events."
      >
        <p className="mb-4">
          Manage in-app notifications delivered via REST API or WebSocket connections.
          Notifications cover assignment deadlines, grade updates, forum replies, payment
          confirmations, and system announcements.
        </p>
        <DocsApiEndpoint
          method="GET"
          path="/api/v1/notifications/"
          description="Get a paginated list of notifications for the authenticated user. Supports filtering by read/unread status and notification type."
          auth={true}
        />
        <DocsApiEndpoint
          method="PUT"
          path="/api/v1/notifications/:id/read"
          description="Mark a notification as read. Also supports marking all notifications as read with a bulk endpoint."
          auth={true}
        />
        <DocsApiEndpoint
          method="DELETE"
          path="/api/v1/notifications/:id"
          description="Delete a specific notification. Supports bulk deletion of all read notifications."
          auth={true}
        />
      </DocsSection>

      {/* Store API */}
      <DocsSection
        id="store-api"
        title="Store API"
        description="Products, cart management, orders, and order tracking."
      >
        <p className="mb-4">
          The Store API manages the UHS marketplace for educational materials, merchandise,
          and digital products. Supports cart management, checkout with multiple payment
          methods, and order tracking.
        </p>
        <DocsApiEndpoint
          method="GET"
          path="/api/v1/store/products"
          description="Browse available products with pagination, category filtering, and search. Returns product details including pricing, images, and availability."
          auth={false}
        />
        <DocsApiEndpoint
          method="POST"
          path="/api/v1/store/cart"
          description="Add an item to the shopping cart. Specify product ID and quantity. Cart is linked to the authenticated user's session."
          auth={true}
        />
        <DocsApiEndpoint
          method="POST"
          path="/api/v1/store/orders"
          description="Create an order from the current cart. Processes payment via the selected method and returns order confirmation with tracking details."
          auth={true}
        />
      </DocsSection>

      {/* Certificates API */}
      <DocsSection
        id="certificates-api"
        title="Certificates API"
        description="Issue, validate, and download course completion certificates."
      >
        <p className="mb-4">
          Certificates are issued automatically when a student completes all course requirements.
          Each certificate has a unique validation code for public verification.
        </p>
        <DocsApiEndpoint
          method="GET"
          path="/api/v1/certificates/"
          description="List all certificates for the authenticated user. Includes certificate details, course info, issue date, and download URL."
          auth={true}
        />
        <DocsApiEndpoint
          method="GET"
          path="/api/v1/certificates/:id/validate"
          description="Validate a certificate by its unique code. Returns certificate details and confirmation of authenticity. Public endpoint for third-party verification."
          auth={false}
        />
        <DocsApiEndpoint
          method="GET"
          path="/api/v1/certificates/:id/download"
          description="Download a certificate as a PDF file. The PDF includes the student's name, course title, completion date, and a QR code for validation."
          auth={true}
        />
      </DocsSection>

      {/* Categories API */}
      <DocsSection
        id="categories-api"
        title="Categories API"
        description="Course and forum categories for content organization."
      >
        <p className="mb-4">
          Categories organize courses by learning area and forum posts by topic. Admins
          can create, update, and manage category hierarchies.
        </p>
        <DocsApiEndpoint
          method="GET"
          path="/api/v1/categories/"
          description="List all categories with optional type filter (course or forum). Returns category name, description, icon, and item count."
          auth={false}
        />
        <DocsApiEndpoint
          method="POST"
          path="/api/v1/categories/"
          description="Create a new category. Admin only. Specify name, type, description, parent category (for subcategories), and display order."
          auth={true}
        />
      </DocsSection>

      {/* Search API */}
      <DocsSection
        id="search-api"
        title="Search API"
        description="Full-text search across courses, users, and forum posts."
      >
        <p className="mb-4">
          A unified search endpoint that queries across multiple content types. Results
          are ranked by relevance and grouped by type.
        </p>
        <DocsApiEndpoint
          method="GET"
          path="/api/v1/search/"
          description="Search across courses, users, and forum posts. Query parameter 'q' is the search term. Optional 'type' parameter filters results to specific content types."
          auth={false}
        />
        <DocsCodeBlock
          language="bash"
          title="Search Example"
          code={`# Search everything
curl -X GET "http://localhost:8000/api/v1/search/?q=photosynthesis"

# Search only courses
curl -X GET "http://localhost:8000/api/v1/search/?q=photosynthesis&type=courses"

# Search users (admin only)
curl -X GET "http://localhost:8000/api/v1/search/?q=jane&type=users" \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."`}
        />
      </DocsSection>

      {/* Contact API */}
      <DocsSection
        id="contact-api"
        title="Contact API"
        description="Contact form submissions for support and inquiries."
      >
        <DocsApiEndpoint
          method="POST"
          path="/api/v1/contact/"
          description="Submit a contact form message. No authentication required. Includes name, email, subject, and message body. Submissions are queued for staff review."
          auth={false}
        />
      </DocsSection>

      {/* Instructor Applications API */}
      <DocsSection
        id="instructor-applications-api"
        title="Instructor Applications API"
        description="Apply to become an instructor, review and approve applications."
      >
        <p className="mb-4">
          Prospective instructors submit applications with their qualifications and teaching
          experience. Admin and staff users review and approve or reject applications.
        </p>
        <DocsApiEndpoint
          method="POST"
          path="/api/v1/instructor-applications/"
          description="Submit an instructor application. Includes qualifications, teaching experience, subject expertise, and supporting documents."
          auth={true}
        />
        <DocsApiEndpoint
          method="GET"
          path="/api/v1/instructor-applications/"
          description="List all instructor applications. Admin and staff only. Supports filtering by status (pending, approved, rejected)."
          auth={true}
        />
        <DocsApiEndpoint
          method="PUT"
          path="/api/v1/instructor-applications/:id"
          description="Approve or reject an instructor application. Admin only. On approval, the user's role is updated to instructor and they gain access to course creation tools."
          auth={true}
        />
      </DocsSection>

      {/* AI Agent Profile API */}
      <DocsSection
        id="ai-agent-profile-api"
        title="AI Agent Profile API"
        description="Customize The Bird AI tutor personality and behavior."
      >
        <p className="mb-4">
          Students can customize their AI tutor's personality, communication style, and focus
          areas to create a more personalized learning experience.
        </p>
        <DocsApiEndpoint
          method="GET"
          path="/api/v1/ai-agent-profile/"
          description="Get the current AI agent profile for the authenticated student. Returns personality settings, preferred subjects, communication style, and response preferences."
          auth={true}
        />
        <DocsApiEndpoint
          method="PUT"
          path="/api/v1/ai-agent-profile/"
          description="Update the AI agent profile. Customize personality traits (friendly, formal, encouraging), focus subjects, response length preference, and language complexity level."
          auth={true}
        />
      </DocsSection>

      {/* Dashboard APIs */}
      <DocsSection
        id="dashboard-apis"
        title="Dashboard APIs"
        description="Role-specific dashboard data endpoints for each user type."
      >
        <p className="mb-4">
          Each user role has dedicated dashboard endpoints that return aggregated data optimized
          for their specific dashboard view. These endpoints combine data from multiple sources
          into a single response.
        </p>
        <DocsApiEndpoint
          method="GET"
          path="/api/v1/dashboard/student"
          description="Student dashboard data: enrolled courses, recent grades, upcoming assignments, wallet balance, AI tutor stats, and learning progress."
          auth={true}
        />
        <DocsApiEndpoint
          method="GET"
          path="/api/v1/dashboard/parent"
          description="Parent dashboard data: children's progress, recent activity, upcoming deadlines, payment history, and AI-generated insights."
          auth={true}
        />
        <DocsApiEndpoint
          method="GET"
          path="/api/v1/dashboard/instructor"
          description="Instructor dashboard data: course analytics, student performance, revenue stats, pending reviews, and upcoming sessions."
          auth={true}
        />
        <DocsApiEndpoint
          method="GET"
          path="/api/v1/dashboard/admin"
          description="Admin dashboard data: platform metrics, user growth, revenue overview, pending approvals, and system health status."
          auth={true}
        />
        <DocsApiEndpoint
          method="GET"
          path="/api/v1/dashboard/staff"
          description="Staff dashboard data: content review queue, support tickets, operational metrics, and pending tasks."
          auth={true}
        />
        <DocsApiEndpoint
          method="GET"
          path="/api/v1/dashboard/partner"
          description="Partner dashboard data: sponsored students, impact reports, budget usage, and sponsorship analytics."
          auth={true}
        />
      </DocsSection>

      {/* Note about full documentation */}
      <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Full Technical Documentation
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Full documentation for each API group is available in the technical docs
          at <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">docs/technical/api-reference/</code>.
          You can also explore the interactive API documentation:
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:underline"
          >
            Swagger UI (/docs)
          </a>
          <a
            href="http://localhost:8000/redoc"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm px-4 py-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 hover:underline"
          >
            ReDoc (/redoc)
          </a>
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8 flex justify-between items-center">
        <Link
          to="/docs/api/payments"
          className="text-sm text-red-600 dark:text-red-400 hover:underline"
        >
          &larr; Payments API
        </Link>
        <Link
          to="/docs/faq"
          className="text-sm text-red-600 dark:text-red-400 hover:underline"
        >
          FAQ &rarr;
        </Link>
      </div>
    </div>
  );
};

export default MoreApisPage;
