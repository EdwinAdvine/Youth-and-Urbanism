// GettingStartedPage - Introduction and onboarding guide for new users.
// Covers what UHS is, how to sign up, set up profiles, and navigate the platform.

import React from 'react';
import { Link } from 'react-router-dom';
import DocsSection from '../../components/docs/DocsSection';
import DocsImagePlaceholder from '../../components/docs/DocsImagePlaceholder';

const GettingStartedPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
        Getting Started
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        Everything you need to know to start learning with Urban Home School.
      </p>

      {/* What is UHS */}
      <DocsSection
        id="what-is-uhs"
        title="What is Urban Home School?"
        description="A comprehensive educational platform built for Kenyan children and families."
      >
        <p className="mb-4">
          Urban Home School (UHS) is a full-stack educational platform designed to deliver the
          Competency-Based Curriculum (CBC) to learners across Kenya. Whether you are a student,
          parent, instructor, or education partner, UHS provides tools tailored to your role.
        </p>
        <p className="mb-4">
          The platform features multi-role dashboards, AI-powered tutoring, CBC-aligned courses,
          community forums, an integrated payment system with M-Pesa support, and real-time
          collaboration tools. Every aspect of the platform is built around the needs of the
          Kenyan education system while embracing modern learning technologies.
        </p>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Key highlights:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>CBC-aligned course content for all grade levels</li>
            <li>AI-powered personal tutoring with The Bird AI</li>
            <li>Six distinct user roles: Student, Parent, Instructor, Admin, Partner, and Staff</li>
            <li>Integrated M-Pesa payments and wallet system</li>
            <li>Real-time WebSocket communication</li>
            <li>Community forums and peer interaction</li>
            <li>Certificates upon course completion</li>
          </ul>
        </div>
        <DocsImagePlaceholder
          description="UHS Platform Overview - Landing page showing key features"
          path="/docs/screenshots/uhs-landing-page.png"
        />
      </DocsSection>

      {/* What is Urban Bird */}
      <DocsSection
        id="what-is-urban-bird"
        title="What is Urban Bird?"
        description="Your personal AI tutor powered by multiple AI models."
      >
        <p className="mb-4">
          Urban Bird (also called "The Bird AI") is the intelligent tutoring system embedded in
          UHS. It uses a multi-AI orchestration layer that routes questions to the most appropriate
          AI model -- Gemini Pro for reasoning, Claude for creative explanations, GPT-4 as a
          fallback, and Grok for research-oriented queries.
        </p>
        <p className="mb-4">
          Urban Bird adapts to each student's learning style, tracks performance over time, and
          generates personalized learning paths. It supports text, voice (via ElevenLabs), and
          video (via Synthesia) response modes.
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">AI Tutor</h4>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Full-screen chat interface for deep learning conversations. Ask questions,
              get explanations, and work through problems step by step.
            </p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">CoPilot</h4>
            <p className="text-sm text-purple-700 dark:text-purple-400">
              A compact sidebar assistant available on every page. Quick help,
              performance insights, and contextual suggestions.
            </p>
          </div>
        </div>
        <DocsImagePlaceholder
          description="The Bird AI chat interface showing a tutoring conversation"
          path="/docs/screenshots/bird-ai-chat.png"
        />
      </DocsSection>

      {/* How to Sign Up */}
      <DocsSection
        id="sign-up"
        title="How to Sign Up"
        description="Create your account based on your role in the platform."
      >
        <p className="mb-4">
          UHS supports multiple user roles. The sign-up process varies slightly depending on
          which role you select.
        </p>

        <div className="space-y-4 mb-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Student</h4>
            <p className="text-sm mb-2">
              Students can sign up directly or be registered by a parent. You will need your
              name, email, and grade level. An admission number is assigned automatically.
            </p>
            <ol className="list-decimal list-inside text-sm space-y-1 text-gray-600 dark:text-gray-400">
              <li>Visit the signup page and select "Student"</li>
              <li>Enter your full name, email address, and password</li>
              <li>Select your grade level (Grade 1-12 or Pre-Primary)</li>
              <li>Verify your email address via the confirmation link</li>
              <li>Complete your profile setup</li>
            </ol>
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Parent</h4>
            <p className="text-sm mb-2">
              Parents create an account to manage their children's education. After sign-up,
              you can add children and monitor their learning progress.
            </p>
            <ol className="list-decimal list-inside text-sm space-y-1 text-gray-600 dark:text-gray-400">
              <li>Visit the signup page and select "Parent"</li>
              <li>Enter your full name, email address, and password</li>
              <li>Verify your email address</li>
              <li>Add your children from your dashboard (link existing students or create new accounts)</li>
            </ol>
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Instructor</h4>
            <p className="text-sm mb-2">
              Instructors apply to teach on the platform. Your application is reviewed by the
              admin team before you gain access to course creation tools.
            </p>
            <ol className="list-decimal list-inside text-sm space-y-1 text-gray-600 dark:text-gray-400">
              <li>Visit the signup page and select "Instructor"</li>
              <li>Fill in your qualifications, teaching experience, and subject areas</li>
              <li>Submit your application for review</li>
              <li>Once approved, access your instructor dashboard</li>
            </ol>
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Partner</h4>
            <p className="text-sm mb-2">
              Partners are organizations or individuals who sponsor children's education.
              Partner accounts require admin approval.
            </p>
            <ol className="list-decimal list-inside text-sm space-y-1 text-gray-600 dark:text-gray-400">
              <li>Contact UHS administration or apply online</li>
              <li>Provide organization details and sponsorship intent</li>
              <li>Once approved, access the partner dashboard to sponsor students</li>
            </ol>
          </div>
        </div>

        <DocsImagePlaceholder
          description="Sign-up page showing role selection"
          path="/docs/screenshots/signup-role-selection.png"
        />
      </DocsSection>

      {/* Setting Up Profile */}
      <DocsSection
        id="profile-setup"
        title="Setting Up Your Profile"
        description="Complete your profile to get the most out of UHS."
      >
        <p className="mb-4">
          After creating your account, take a few minutes to fill in your profile. A complete
          profile helps the AI tutor personalize your experience and enables other users to
          identify you in forums and courses.
        </p>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Profile includes:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>Avatar / Profile Photo:</strong> Upload a photo or choose an avatar</li>
            <li><strong>Bio:</strong> A short description about yourself</li>
            <li><strong>Grade Level (Students):</strong> Your current grade in the CBC system</li>
            <li><strong>Subjects of Interest:</strong> Help the AI tutor prioritize topics</li>
            <li><strong>Learning Preferences:</strong> Visual, auditory, reading, or kinesthetic</li>
            <li><strong>Notification Preferences:</strong> Choose how you want to be notified</li>
          </ul>
        </div>
        <DocsImagePlaceholder
          description="Profile settings page with form fields"
          path="/docs/screenshots/profile-settings.png"
        />
      </DocsSection>

      {/* Navigating the Dashboard */}
      <DocsSection
        id="navigating-dashboard"
        title="Navigating Your Dashboard"
        description="Every role has a personalized dashboard with relevant tools and information."
      >
        <p className="mb-4">
          Once logged in, you land on your role-specific dashboard. The dashboard provides
          an overview of your activity, quick access to key features, and navigation through
          the sidebar.
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Sidebar Navigation</h4>
            <p className="text-sm">
              The left sidebar contains links to all major sections: Dashboard, Courses,
              Assessments, Forum, Store, Payments, and Settings. The sidebar collapses on
              mobile for a full-screen experience.
            </p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Top Bar</h4>
            <p className="text-sm">
              The top bar shows your name, notifications bell, theme toggle (light/dark),
              and quick access to The Bird AI CoPilot. Click on your avatar for account
              settings and logout.
            </p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Stats Cards</h4>
            <p className="text-sm">
              At the top of each dashboard, you will see summary cards showing key metrics:
              enrolled courses, completion percentage, upcoming assignments, and wallet balance.
            </p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Quick Actions</h4>
            <p className="text-sm">
              Role-specific quick action buttons let you jump directly to common tasks like
              starting a lesson, viewing grades, or creating a course.
            </p>
          </div>
        </div>
        <DocsImagePlaceholder
          description="Student dashboard overview with sidebar, stats cards, and quick actions"
          path="/docs/screenshots/student-dashboard.png"
        />
      </DocsSection>

      {/* First Lesson */}
      <DocsSection
        id="first-lesson"
        title="Your First Lesson"
        description="Start learning in just a few steps."
      >
        <p className="mb-4">
          Ready to dive in? Follow these steps to begin your first lesson on UHS:
        </p>
        <ol className="list-decimal list-inside space-y-3 mb-4">
          <li>
            <strong>Browse Courses:</strong> Navigate to the Courses section from your sidebar.
            Filter by grade level, learning area, or search by keyword.
          </li>
          <li>
            <strong>Choose a Course:</strong> Click on a course card to see details, including
            the syllabus, instructor, duration, and student reviews.
          </li>
          <li>
            <strong>Enroll:</strong> Click the "Enroll" button. Free courses are instant; paid
            courses will prompt you through the payment flow (M-Pesa, PayPal, or wallet).
          </li>
          <li>
            <strong>Start Learning:</strong> Once enrolled, click "Start Lesson" to open the
            course content. Lessons include text, video, and interactive elements.
          </li>
          <li>
            <strong>Ask The Bird AI:</strong> Stuck on a concept? Open The Bird AI chat from
            the sidebar or use the CoPilot button in the top bar for instant help.
          </li>
          <li>
            <strong>Complete Assessment:</strong> After finishing the lesson content, take the
            quiz or submit the assignment to track your progress.
          </li>
        </ol>
        <DocsImagePlaceholder
          description="Course enrollment flow - Browse, select, enroll, and start learning"
          path="/docs/screenshots/first-lesson-flow.png"
          aspectRatio="wide"
        />

        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mt-4">
          <h4 className="font-semibold text-green-800 dark:text-green-300 mb-1">What's next?</h4>
          <p className="text-sm text-green-700 dark:text-green-400 mb-2">
            Now that you have completed your first lesson, explore these guides to get more
            from the platform:
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/docs/student-guide"
              className="text-sm px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 hover:underline"
            >
              Student Guide
            </Link>
            <Link
              to="/docs/ai-tutor"
              className="text-sm px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 hover:underline"
            >
              AI Tutor Guide
            </Link>
            <Link
              to="/docs/courses"
              className="text-sm px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 hover:underline"
            >
              Courses Guide
            </Link>
            <Link
              to="/docs/faq"
              className="text-sm px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 hover:underline"
            >
              FAQ
            </Link>
          </div>
        </div>
      </DocsSection>
    </div>
  );
};

export default GettingStartedPage;
