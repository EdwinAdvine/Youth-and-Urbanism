// ChangelogPage - Version 1.0 changelog documenting all major features at launch.
// Organized by feature categories with detailed breakdowns.

import React from 'react';
import { Link } from 'react-router-dom';
import DocsSection from '../../components/docs/DocsSection';

interface ChangelogItemProps {
  title: string;
  description: string;
  type: 'feature' | 'improvement' | 'fix' | 'infrastructure';
}

const typeBadge: Record<string, string> = {
  feature: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  improvement: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  fix: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  infrastructure: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
};

const ChangelogItem: React.FC<ChangelogItemProps> = ({ title, description, type }) => (
  <div className="flex gap-3 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
    <span className={`px-2 py-0.5 rounded text-xs font-medium h-fit ${typeBadge[type]}`}>
      {type}
    </span>
    <div>
      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h4>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{description}</p>
    </div>
  </div>
);

const ChangelogPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
        Changelog
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
        Track every update, feature, and improvement to the Urban Home School platform.
      </p>

      {/* Version Badge */}
      <div className="flex items-center gap-3 mb-8">
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm font-semibold">
          v1.0.0
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">February 15, 2026</span>
        <span className="text-xs px-2 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
          Initial Release
        </span>
      </div>

      {/* Multi-Role Platform */}
      <DocsSection
        id="multi-role-platform"
        title="Multi-Role Platform"
        description="A complete role-based access system supporting six distinct user types."
      >
        <div className="space-y-0">
          <ChangelogItem
            type="feature"
            title="Six user roles with dedicated dashboards"
            description="Student, Parent, Instructor, Admin, Partner, and Staff roles each with tailored interfaces, sidebar navigation, and feature access."
          />
          <ChangelogItem
            type="feature"
            title="JWT-based authentication with role guards"
            description="Secure authentication using JSON Web Tokens with bcrypt password hashing. Role-based route protection on both frontend and backend."
          />
          <ChangelogItem
            type="feature"
            title="User registration with role selection"
            description="Sign-up flow that adapts to the selected role, collecting relevant information for each user type."
          />
          <ChangelogItem
            type="feature"
            title="Email verification system"
            description="Account verification via email confirmation links to ensure valid user accounts."
          />
          <ChangelogItem
            type="feature"
            title="Profile management with JSONB metadata"
            description="Flexible user profiles using PostgreSQL JSONB columns for role-specific data like learning preferences, qualifications, and organization details."
          />
        </div>
      </DocsSection>

      {/* Student Dashboard */}
      <DocsSection
        id="student-dashboard"
        title="Student Dashboard"
        description="The core learning experience for students."
      >
        <div className="space-y-0">
          <ChangelogItem
            type="feature"
            title="Personalized student dashboard"
            description="Overview of enrolled courses, upcoming assignments, progress metrics, wallet balance, and quick access to The Bird AI tutor."
          />
          <ChangelogItem
            type="feature"
            title="Course enrollment and progress tracking"
            description="Browse, enroll in, and track progress through CBC-aligned courses with lesson-by-lesson completion tracking."
          />
          <ChangelogItem
            type="feature"
            title="Assignment and quiz interface"
            description="Complete quizzes with automatic grading and submit assignments with file uploads for instructor review."
          />
          <ChangelogItem
            type="feature"
            title="Achievement and certificate system"
            description="Earn certificates upon course completion. View, download as PDF, and share certificates with public validation links."
          />
          <ChangelogItem
            type="feature"
            title="Student wallet with transaction history"
            description="Digital wallet for managing payments, viewing transaction history, and tracking spending on courses and store items."
          />
        </div>
      </DocsSection>

      {/* Parent Dashboard */}
      <DocsSection
        id="parent-dashboard"
        title="Parent Dashboard"
        description="Tools for parents to manage and monitor their children's education."
      >
        <div className="space-y-0">
          <ChangelogItem
            type="feature"
            title="Child management interface"
            description="Add, link, and manage multiple children from a single parent account. View each child's learning profile at a glance."
          />
          <ChangelogItem
            type="feature"
            title="Progress monitoring with AI insights"
            description="Track children's course progress, assessment scores, and attendance. AI-generated insights highlight strengths and areas for improvement."
          />
          <ChangelogItem
            type="feature"
            title="CBC competency tracking"
            description="Monitor progress against Competency-Based Curriculum standards. Visual indicators show mastery levels across learning areas."
          />
          <ChangelogItem
            type="feature"
            title="Subscription and payment management"
            description="Manage subscriptions, pay for courses via M-Pesa, and view payment history with downloadable receipts."
          />
          <ChangelogItem
            type="feature"
            title="Privacy and consent controls"
            description="Manage data sharing preferences and consent settings for children's accounts."
          />
        </div>
      </DocsSection>

      {/* Instructor Dashboard */}
      <DocsSection
        id="instructor-dashboard"
        title="Instructor Dashboard"
        description="Complete course creation and teaching management tools."
      >
        <div className="space-y-0">
          <ChangelogItem
            type="feature"
            title="Course creation with CBC alignment"
            description="Build courses with lessons, modules, and assessments aligned to the Kenyan Competency-Based Curriculum framework."
          />
          <ChangelogItem
            type="feature"
            title="Assessment builder"
            description="Create quizzes, assignments, projects, and exams with multiple question types. Configure auto-grading and manual review options."
          />
          <ChangelogItem
            type="feature"
            title="Student analytics dashboard"
            description="View detailed analytics on student engagement, performance trends, and completion rates across all courses."
          />
          <ChangelogItem
            type="feature"
            title="Revenue tracking with 60/30/10 split"
            description="Earnings dashboard showing the revenue split: 60% to instructor, 30% to platform, 10% to content fund. Transparent payout system."
          />
          <ChangelogItem
            type="feature"
            title="Live session management"
            description="Schedule and manage live teaching sessions with real-time student interaction capabilities."
          />
        </div>
      </DocsSection>

      {/* Admin Dashboard */}
      <DocsSection
        id="admin-dashboard"
        title="Admin Dashboard"
        description="Platform administration and oversight tools."
      >
        <div className="space-y-0">
          <ChangelogItem
            type="feature"
            title="User management console"
            description="View, search, filter, and manage all user accounts. Approve instructor applications, suspend accounts, and manage roles."
          />
          <ChangelogItem
            type="feature"
            title="Course moderation"
            description="Review and approve new courses before publication. Flag or remove content that does not meet quality standards."
          />
          <ChangelogItem
            type="feature"
            title="Platform analytics"
            description="Comprehensive analytics on user growth, revenue, course popularity, AI usage, and system performance metrics."
          />
          <ChangelogItem
            type="feature"
            title="System configuration"
            description="Manage platform settings, payment configurations, AI model preferences, and feature flags."
          />
        </div>
      </DocsSection>

      {/* Staff Dashboard */}
      <DocsSection
        id="staff-dashboard"
        title="Staff Dashboard"
        description="Operational support and content management tools."
      >
        <div className="space-y-0">
          <ChangelogItem
            type="feature"
            title="Content review queue"
            description="Review pending course submissions, forum reports, and user-generated content for quality and compliance."
          />
          <ChangelogItem
            type="feature"
            title="Support ticket management"
            description="Handle user support requests, track resolution status, and escalate issues to administrators."
          />
          <ChangelogItem
            type="feature"
            title="Operational reporting"
            description="Generate reports on platform operations, user activity, and content pipeline status."
          />
        </div>
      </DocsSection>

      {/* Partner Dashboard */}
      <DocsSection
        id="partner-dashboard"
        title="Partner Dashboard"
        description="Sponsorship and impact tracking for education partners."
      >
        <div className="space-y-0">
          <ChangelogItem
            type="feature"
            title="Student sponsorship system"
            description="Sponsor individual children or groups of students. Manage sponsorship budgets and allocations."
          />
          <ChangelogItem
            type="feature"
            title="Impact reports"
            description="View detailed impact reports showing sponsored students' progress, attendance, assessment scores, and learning milestones."
          />
          <ChangelogItem
            type="feature"
            title="Budget management"
            description="Track sponsorship spending, set budget limits, and receive alerts when budgets are approaching thresholds."
          />
        </div>
      </DocsSection>

      {/* AI System */}
      <DocsSection
        id="ai-system"
        title="AI System (The Bird AI)"
        description="Multi-AI orchestration powering personalized tutoring."
      >
        <div className="space-y-0">
          <ChangelogItem
            type="feature"
            title="Multi-AI orchestration engine"
            description="Intelligent routing across Gemini Pro, Claude 3.5 Sonnet, GPT-4, and Grok. Task-based model selection with automatic failover."
          />
          <ChangelogItem
            type="feature"
            title="AI Tutor full-screen chat"
            description="Dedicated chat interface for deep learning conversations with The Bird AI. Supports text, voice, and video responses."
          />
          <ChangelogItem
            type="feature"
            title="CoPilot sidebar assistant"
            description="Compact AI assistant accessible from any page. Quick answers, performance insights, and contextual learning suggestions."
          />
          <ChangelogItem
            type="feature"
            title="Voice mode via ElevenLabs"
            description="Text-to-speech responses using ElevenLabs API for auditory learners. Multiple voice options and language support."
          />
          <ChangelogItem
            type="feature"
            title="Video lessons via Synthesia"
            description="AI-generated video explanations using Synthesia for visual learners and complex topic breakdowns."
          />
          <ChangelogItem
            type="feature"
            title="Personalized learning paths"
            description="AI-generated learning recommendations based on student performance, learning style, and curriculum requirements."
          />
          <ChangelogItem
            type="feature"
            title="Conversation history management"
            description="Persistent conversation history stored as JSONB arrays. Students can review past tutoring sessions and continue conversations."
          />
          <ChangelogItem
            type="feature"
            title="Usage tracking and cost optimization"
            description="Per-student AI usage tracking with cost monitoring across all AI providers. Automatic budget management to optimize spend."
          />
        </div>
      </DocsSection>

      {/* Payments */}
      <DocsSection
        id="payments"
        title="Payments"
        description="Comprehensive payment system with M-Pesa integration."
      >
        <div className="space-y-0">
          <ChangelogItem
            type="feature"
            title="M-Pesa integration"
            description="Native M-Pesa payment support for course purchases, subscriptions, and wallet top-ups. STK push for seamless mobile payments."
          />
          <ChangelogItem
            type="feature"
            title="Digital wallet system"
            description="In-platform wallet for quick payments. Top up via M-Pesa, PayPal, or Stripe. View balance and transaction history."
          />
          <ChangelogItem
            type="feature"
            title="Instructor payout system"
            description="Automated payout calculations based on the 60/30/10 revenue split. Support for M-Pesa and bank transfer payouts."
          />
          <ChangelogItem
            type="feature"
            title="Transaction history and receipts"
            description="Complete transaction history with downloadable receipts for all payments, refunds, and payouts."
          />
          <ChangelogItem
            type="feature"
            title="Subscription plans"
            description="Tiered subscription plans (Basic, Standard, Premium) with different access levels and pricing."
          />
          <ChangelogItem
            type="feature"
            title="Refund processing"
            description="Refund request system with admin approval workflow. Automatic wallet credit or payment reversal."
          />
        </div>
      </DocsSection>

      {/* Real-time Features */}
      <DocsSection
        id="realtime-features"
        title="Real-time Features"
        description="WebSocket-powered real-time communication and updates."
      >
        <div className="space-y-0">
          <ChangelogItem
            type="feature"
            title="WebSocket real-time channels"
            description="Persistent WebSocket connections for instant updates on messages, notifications, and live session events."
          />
          <ChangelogItem
            type="feature"
            title="Real-time notifications"
            description="Instant push notifications for new messages, assignment deadlines, grade updates, and platform announcements."
          />
          <ChangelogItem
            type="feature"
            title="Live session support"
            description="Real-time interaction during live teaching sessions including chat, polls, and Q&A features."
          />
        </div>
      </DocsSection>

      {/* Security */}
      <DocsSection
        id="security"
        title="Security"
        description="Enterprise-grade security measures to protect user data."
      >
        <div className="space-y-0">
          <ChangelogItem
            type="infrastructure"
            title="JWT authentication with bcrypt hashing"
            description="Secure token-based authentication using HS256 algorithm. Passwords hashed with bcrypt and configurable expiration times."
          />
          <ChangelogItem
            type="infrastructure"
            title="Role-based access control (RBAC)"
            description="Fine-grained permissions system ensuring users only access features and data appropriate to their role."
          />
          <ChangelogItem
            type="infrastructure"
            title="SQL injection prevention"
            description="SQLAlchemy ORM with parameterized queries prevents SQL injection attacks. Input validation via Pydantic schemas."
          />
          <ChangelogItem
            type="infrastructure"
            title="CORS and rate limiting"
            description="Restricted CORS policies for allowed origins. API rate limiting to prevent abuse and ensure fair usage."
          />
          <ChangelogItem
            type="infrastructure"
            title="Data encryption and soft deletes"
            description="Sensitive data encryption at rest. Soft delete pattern preserves data integrity while supporting GDPR-compliant deletion."
          />
          <ChangelogItem
            type="infrastructure"
            title="Audit logging"
            description="Comprehensive logging of authentication attempts, data access, and administrative actions for security auditing."
          />
        </div>
      </DocsSection>

      {/* Bottom navigation */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8 flex justify-between items-center">
        <Link
          to="/docs"
          className="text-sm text-red-600 dark:text-red-400 hover:underline"
        >
          Back to Documentation Home
        </Link>
        <Link
          to="/docs/getting-started"
          className="text-sm text-red-600 dark:text-red-400 hover:underline"
        >
          Getting Started Guide
        </Link>
      </div>
    </div>
  );
};

export default ChangelogPage;
