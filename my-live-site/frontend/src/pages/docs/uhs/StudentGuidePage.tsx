// StudentGuidePage - Comprehensive guide for students using the UHS platform.
// Covers dashboard, AI tutor, courses, assessments, achievements, forum, wallet, and settings.

import React from 'react';
import { Link } from 'react-router-dom';
import DocsSection from '../../../components/docs/DocsSection';
import DocsImagePlaceholder from '../../../components/docs/DocsImagePlaceholder';

const StudentGuidePage: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
        Student Guide
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        Everything a student needs to make the most of their learning experience on Urban Home School.
      </p>

      {/* Table of Contents */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-8">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">On this page</h3>
        <nav className="grid sm:grid-cols-2 gap-1">
          {[
            { id: 'dashboard', label: 'Dashboard Overview' },
            { id: 'bird-ai', label: 'Using The Bird AI' },
            { id: 'courses', label: 'Browsing & Enrolling in Courses' },
            { id: 'lessons', label: 'Completing Lessons' },
            { id: 'assessments', label: 'Quizzes & Assignments' },
            { id: 'achievements', label: 'Achievements & Progress' },
            { id: 'forum', label: 'Community & Forum' },
            { id: 'wallet', label: 'Wallet & Payments' },
            { id: 'settings', label: 'Account Settings' },
          ].map(item => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="text-sm text-red-600 dark:text-red-400 hover:underline py-0.5"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>

      {/* Dashboard Overview */}
      <DocsSection
        id="dashboard"
        title="Dashboard Overview"
        description="Your personalized home screen showing everything at a glance."
      >
        <p className="mb-4">
          The student dashboard is the first thing you see after logging in. It is designed to
          give you a quick overview of your learning journey and fast access to all major features.
        </p>
        <div className="space-y-3 mb-4">
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-700 dark:text-red-400 text-sm font-bold flex-shrink-0">1</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Stats Cards</h4>
              <p className="text-sm">At the top, you see cards showing enrolled courses count, average progress percentage, upcoming deadlines, and wallet balance.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-700 dark:text-red-400 text-sm font-bold flex-shrink-0">2</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Welcome Widget</h4>
              <p className="text-sm">A personalized greeting with motivational messages and a quick link to resume your last active course.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-700 dark:text-red-400 text-sm font-bold flex-shrink-0">3</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Active Courses</h4>
              <p className="text-sm">A list of your currently enrolled courses with progress bars and quick "Continue" buttons.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-700 dark:text-red-400 text-sm font-bold flex-shrink-0">4</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Upcoming Assignments</h4>
              <p className="text-sm">Deadlines and pending assessments sorted by due date so you never miss a submission.</p>
            </div>
          </div>
        </div>
        <DocsImagePlaceholder
          description="Student dashboard with stats cards, active courses, and upcoming assignments"
          path="/docs/screenshots/student-dashboard-full.png"
        />
      </DocsSection>

      {/* Using The Bird AI */}
      <DocsSection
        id="bird-ai"
        title="Using The Bird AI"
        description="Your personal AI tutor is always ready to help."
      >
        <p className="mb-4">
          The Bird AI is your personal tutor powered by multiple AI models. You can access it
          in two ways:
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div className="border border-blue-200 dark:border-blue-800 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/10">
            <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Full Chat (The Bird AI)</h4>
            <p className="text-sm text-blue-700 dark:text-blue-400 mb-2">
              Navigate to "The Bird AI" from your sidebar for a full-screen chat experience.
              Best for in-depth discussions, working through complex problems, and extended
              study sessions.
            </p>
            <Link to="/docs/ai-tutor" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
              Read the AI Tutor Guide
            </Link>
          </div>
          <div className="border border-purple-200 dark:border-purple-800 rounded-lg p-4 bg-purple-50 dark:bg-purple-900/10">
            <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">CoPilot Sidebar</h4>
            <p className="text-sm text-purple-700 dark:text-purple-400 mb-2">
              Click the CoPilot button in the top bar to open a compact sidebar assistant.
              Best for quick questions, hints, and getting help while browsing courses or
              taking assessments.
            </p>
            <Link to="/docs/copilot" className="text-xs text-purple-600 dark:text-purple-400 hover:underline">
              Read the CoPilot Guide
            </Link>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Tips for great AI conversations:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Be specific about what you need help with (e.g., "Explain photosynthesis for Grade 7")</li>
            <li>Ask follow-up questions if the explanation is not clear</li>
            <li>Request examples or practice problems to reinforce learning</li>
            <li>Tell the AI your preferred explanation style (simple, detailed, with diagrams)</li>
            <li>Use voice mode if you prefer listening to explanations</li>
          </ul>
        </div>
        <DocsImagePlaceholder
          description="The Bird AI chat showing a tutoring conversation with a student"
          path="/docs/screenshots/student-bird-chat.png"
        />
      </DocsSection>

      {/* Browsing & Enrolling */}
      <DocsSection
        id="courses"
        title="Browsing & Enrolling in Courses"
        description="Find the right courses for your grade and learning goals."
      >
        <p className="mb-4">
          The course catalog is accessible from the "Courses" section in your sidebar. You can
          browse, filter, and search through hundreds of CBC-aligned courses.
        </p>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Filtering options:</h4>
        <ul className="list-disc list-inside space-y-1 text-sm mb-4">
          <li><strong>Grade Level:</strong> Filter courses for your specific grade (Pre-Primary through Grade 12)</li>
          <li><strong>Learning Area:</strong> Mathematics, Sciences, Languages, Social Studies, Creative Arts, and more</li>
          <li><strong>Price:</strong> Free courses, paid courses, or subscription-included</li>
          <li><strong>Rating:</strong> Filter by student ratings and reviews</li>
          <li><strong>Duration:</strong> Short (under 2 hours), Medium (2-10 hours), Long (10+ hours)</li>
        </ul>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">How to enroll:</h4>
        <ol className="list-decimal list-inside space-y-2 text-sm mb-4">
          <li>Click on any course card to view its details page</li>
          <li>Review the syllabus, instructor info, reviews, and requirements</li>
          <li>Click "Enroll Now" -- free courses activate instantly</li>
          <li>For paid courses, choose your payment method (M-Pesa, wallet, or card)</li>
          <li>Once enrolled, the course appears in your "My Courses" section</li>
        </ol>
        <DocsImagePlaceholder
          description="Course catalog with filter sidebar and course cards"
          path="/docs/screenshots/student-course-catalog.png"
        />
      </DocsSection>

      {/* Completing Lessons */}
      <DocsSection
        id="lessons"
        title="Completing Lessons"
        description="Work through course content at your own pace."
      >
        <p className="mb-4">
          Each course is organized into modules, and each module contains one or more lessons.
          Lessons can include text content, videos, interactive exercises, and downloadable
          resources.
        </p>
        <div className="space-y-3 mb-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Reading Content</h4>
            <p className="text-sm">Rich text lessons with images, diagrams, and highlighted key concepts. Scroll through at your own pace.</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Video Lessons</h4>
            <p className="text-sm">Embedded video content from instructors. Pause, rewind, and rewatch as many times as you need.</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Interactive Exercises</h4>
            <p className="text-sm">Practice problems, drag-and-drop activities, and fill-in-the-blank exercises within lessons.</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Progress Tracking</h4>
            <p className="text-sm">Each lesson you complete is marked with a checkmark. Your overall course progress bar updates automatically.</p>
          </div>
        </div>
        <DocsImagePlaceholder
          description="Lesson viewer with content area, progress bar, and navigation"
          path="/docs/screenshots/student-lesson-viewer.png"
        />
      </DocsSection>

      {/* Quizzes & Assignments */}
      <DocsSection
        id="assessments"
        title="Quizzes & Assignments"
        description="Test your understanding and earn grades."
      >
        <p className="mb-4">
          Assessments are an essential part of learning on UHS. They help you measure your
          understanding and contribute to your course completion requirements.
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 dark:text-green-300 mb-1">Quizzes</h4>
            <p className="text-sm text-green-700 dark:text-green-400">
              Multiple choice, true/false, and short answer questions. Graded automatically
              with instant results. You may be allowed to retake quizzes depending on
              instructor settings.
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Assignments</h4>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Written work, research tasks, or creative projects. Submit text or upload files.
              Graded by the instructor with feedback provided.
            </p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-1">Projects</h4>
            <p className="text-sm text-purple-700 dark:text-purple-400">
              Larger-scale work that may span multiple weeks. Often collaborative with
              milestones and checkpoints along the way.
            </p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">Exams</h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              Timed assessments that test comprehensive understanding of a course or module.
              Usually required for certificate eligibility.
            </p>
          </div>
        </div>
        <p className="text-sm mb-4">
          For detailed instructions on each assessment type, see the{' '}
          <Link to="/docs/assessments" className="text-red-600 dark:text-red-400 hover:underline">
            Assessments Guide
          </Link>.
        </p>
        <DocsImagePlaceholder
          description="Quiz interface showing a multiple-choice question with timer"
          path="/docs/screenshots/student-quiz.png"
        />
      </DocsSection>

      {/* Achievements & Progress */}
      <DocsSection
        id="achievements"
        title="Achievements & Progress"
        description="Track your growth and celebrate milestones."
      >
        <p className="mb-4">
          UHS tracks your learning journey with detailed progress metrics and rewards you
          with achievements as you reach milestones.
        </p>
        <div className="space-y-3 mb-4">
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-700 dark:text-yellow-400 flex-shrink-0">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Course Completion Certificates</h4>
              <p className="text-sm">Complete all lessons and pass the final assessment to earn a certificate you can download and share.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-700 dark:text-green-400 flex-shrink-0">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Progress Tracking</h4>
              <p className="text-sm">View your progress across all enrolled courses. See lessons completed, time spent, and assessment scores.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-700 dark:text-purple-400 flex-shrink-0">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Performance Analytics</h4>
              <p className="text-sm">Charts and graphs showing your performance trends over time, strengths, and areas that need more practice.</p>
            </div>
          </div>
        </div>
        <DocsImagePlaceholder
          description="Student achievements page with certificates and progress charts"
          path="/docs/screenshots/student-achievements.png"
        />
      </DocsSection>

      {/* Community & Forum */}
      <DocsSection
        id="forum"
        title="Community & Forum"
        description="Connect with other students and share knowledge."
      >
        <p className="mb-4">
          The UHS community forum is where students come together to ask questions, share
          knowledge, and support each other's learning. Think of it as a study group that
          is always available.
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm mb-4">
          <li><strong>Browse Topics:</strong> Forum posts are organized by subject, grade level, and category</li>
          <li><strong>Ask Questions:</strong> Post a question and get answers from peers and instructors</li>
          <li><strong>Share Resources:</strong> Share useful study materials, tips, and links</li>
          <li><strong>Like and Reply:</strong> Engage with helpful posts by liking and replying</li>
          <li><strong>Mark as Solved:</strong> When you get a helpful answer, mark it as the solution</li>
        </ul>
        <p className="text-sm mb-4">
          For the full guide, see{' '}
          <Link to="/docs/forum" className="text-red-600 dark:text-red-400 hover:underline">
            Forum Guide
          </Link>.
        </p>
        <DocsImagePlaceholder
          description="Community forum showing posts, categories, and discussion threads"
          path="/docs/screenshots/student-forum.png"
        />
      </DocsSection>

      {/* Wallet & Payments */}
      <DocsSection
        id="wallet"
        title="Wallet & Payments"
        description="Manage your funds and purchase courses."
      >
        <p className="mb-4">
          Your digital wallet stores funds for purchasing courses, store items, and other
          platform services. You can top up using M-Pesa, and view your complete transaction
          history.
        </p>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Wallet features:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>View current balance in KES (Kenyan Shillings)</li>
            <li>Top up via M-Pesa with instant credit</li>
            <li>View complete transaction history with filters</li>
            <li>Download receipts for any transaction</li>
            <li>Auto-pay for course enrollments when balance is sufficient</li>
          </ul>
        </div>
        <p className="text-sm mb-4">
          For payment details, see the{' '}
          <Link to="/docs/payments" className="text-red-600 dark:text-red-400 hover:underline">
            Payments Guide
          </Link>.
        </p>
        <DocsImagePlaceholder
          description="Student wallet showing balance, recent transactions, and top-up button"
          path="/docs/screenshots/student-wallet.png"
        />
      </DocsSection>

      {/* Account Settings */}
      <DocsSection
        id="settings"
        title="Account Settings"
        description="Manage your profile, preferences, and security."
      >
        <p className="mb-4">
          Access your account settings from the user menu in the top-right corner. Here you can
          customize your experience and manage your account security.
        </p>
        <div className="space-y-3 mb-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Profile Information</h4>
            <p className="text-sm">Update your name, email, profile photo, bio, grade level, and learning preferences.</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Password & Security</h4>
            <p className="text-sm">Change your password, view active sessions, and manage two-factor authentication settings.</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Notifications</h4>
            <p className="text-sm">Choose which notifications you receive and how (email, in-app, or both).</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Theme</h4>
            <p className="text-sm">Switch between light mode, dark mode, or system-automatic theme.</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">AI Preferences</h4>
            <p className="text-sm">Set your preferred response mode (text, voice, or video) and learning style for The Bird AI.</p>
          </div>
        </div>
        <DocsImagePlaceholder
          description="Account settings page with profile, security, and preferences sections"
          path="/docs/screenshots/student-settings.png"
        />
      </DocsSection>

      {/* Bottom navigation */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8 flex justify-between items-center">
        <Link to="/docs/getting-started" className="text-sm text-red-600 dark:text-red-400 hover:underline">
          Getting Started
        </Link>
        <Link to="/docs/parent-guide" className="text-sm text-red-600 dark:text-red-400 hover:underline">
          Parent Guide
        </Link>
      </div>
    </div>
  );
};

export default StudentGuidePage;
