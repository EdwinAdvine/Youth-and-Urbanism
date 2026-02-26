// InstructorGuidePage - Comprehensive guide for instructors on the UHS platform.
// Covers becoming an instructor, dashboard, course creation, assessments, live sessions,
// earnings, student analytics, and the instructor hub.

import React from 'react';
import { Link } from 'react-router-dom';
import DocsSection from '../../../components/docs/DocsSection';
import DocsImagePlaceholder from '../../../components/docs/DocsImagePlaceholder';

const InstructorGuidePage: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
        Instructor Guide
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        Everything you need to create courses, manage students, and grow your teaching career on Urban Home School.
      </p>

      {/* Table of Contents */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-8">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">On this page</h3>
        <nav className="grid sm:grid-cols-2 gap-1">
          {[
            { id: 'becoming-instructor', label: 'Becoming an Instructor' },
            { id: 'dashboard', label: 'Dashboard Overview' },
            { id: 'creating-courses', label: 'Creating Courses' },
            { id: 'assessments', label: 'Assessments & Grading' },
            { id: 'live-sessions', label: 'Live Sessions' },
            { id: 'earnings', label: 'Earnings & Payouts' },
            { id: 'student-analytics', label: 'Student Analytics' },
            { id: 'hub', label: 'Instructor Hub' },
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

      {/* Becoming an Instructor */}
      <DocsSection
        id="becoming-instructor"
        title="Becoming an Instructor"
        description="How to apply, get approved, and set up your instructor profile."
      >
        <p className="mb-4">
          Teaching on Urban Home School is open to qualified educators, subject-matter experts,
          and professionals who want to share knowledge with Kenyan students. The application
          process ensures quality content for our learners.
        </p>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Application process:</h4>
        <div className="space-y-3 mb-4">
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-700 dark:text-red-400 text-sm font-bold flex-shrink-0">1</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Submit Application</h4>
              <p className="text-sm">Register for an account and select "Instructor" as your role. Fill in your qualifications, teaching experience, subject expertise, and upload your credentials (TSC number, certificates, or relevant portfolio).</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-700 dark:text-red-400 text-sm font-bold flex-shrink-0">2</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Review Period</h4>
              <p className="text-sm">The UHS team reviews your application within 3-5 business days. You may be asked to provide additional documentation or complete a short assessment.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-700 dark:text-red-400 text-sm font-bold flex-shrink-0">3</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Approval & Onboarding</h4>
              <p className="text-sm">Once approved, you gain access to the instructor dashboard and course creation tools. A guided onboarding walkthrough helps you set up your profile and create your first course.</p>
            </div>
          </div>
        </div>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Profile setup:</h4>
        <ul className="list-disc list-inside space-y-1 text-sm mb-4">
          <li><strong>Display Name:</strong> Your public name shown on course pages and certificates</li>
          <li><strong>Bio:</strong> A brief professional summary visible to students and parents</li>
          <li><strong>Profile Photo:</strong> A professional headshot for your instructor card</li>
          <li><strong>Subjects & Grades:</strong> Tag the learning areas and grade levels you teach</li>
          <li><strong>Qualifications:</strong> List your degrees, certifications, and teaching experience</li>
          <li><strong>Payment Details:</strong> Set up your M-Pesa or bank details for receiving earnings</li>
        </ul>
      </DocsSection>

      {/* Dashboard Overview */}
      <DocsSection
        id="dashboard"
        title="Dashboard Overview"
        description="Your command center for teaching on UHS."
      >
        <p className="mb-4">
          The instructor dashboard gives you a comprehensive view of your teaching activity.
          From here you can manage courses, view student progress, track earnings, and access
          all instructor tools.
        </p>
        <div className="space-y-3 mb-4">
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-700 dark:text-red-400 text-sm font-bold flex-shrink-0">1</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Stats Cards</h4>
              <p className="text-sm">At the top, you see key metrics: total students enrolled, active courses, total earnings this month, and average course rating.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-700 dark:text-red-400 text-sm font-bold flex-shrink-0">2</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Course Management</h4>
              <p className="text-sm">Quick access to all your courses with status indicators (draft, published, under review) and enrollment counts.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-700 dark:text-red-400 text-sm font-bold flex-shrink-0">3</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Upcoming Sessions</h4>
              <p className="text-sm">A calendar view of your scheduled live sessions with student RSVP counts and join links.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-700 dark:text-red-400 text-sm font-bold flex-shrink-0">4</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Performance Summary</h4>
              <p className="text-sm">Charts showing student engagement, course completion rates, and revenue trends over time.</p>
            </div>
          </div>
        </div>
        <DocsImagePlaceholder
          description="Instructor dashboard with stats cards, course list, and performance charts"
          path="/docs/screenshots/instructor-dashboard.png"
        />
      </DocsSection>

      {/* Creating Courses */}
      <DocsSection
        id="creating-courses"
        title="Creating Courses"
        description="Build engaging, CBC-aligned courses with the course editor."
      >
        <p className="mb-4">
          The course editor is your primary tool for building educational content. Courses on UHS
          follow a structured hierarchy: Course &gt; Modules &gt; Lessons. Each level allows you to
          add rich content, media, and assessments.
        </p>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Course creation steps:</h4>
        <ol className="list-decimal list-inside space-y-2 text-sm mb-4">
          <li>Click "Create Course" from your dashboard to open the course editor</li>
          <li>Fill in the course details: title, description, thumbnail image, and category</li>
          <li>Select the target grade level(s) and CBC learning area alignment</li>
          <li>Set pricing (free or paid) and any prerequisites</li>
          <li>Create modules to organize your course into logical sections</li>
          <li>Add lessons within each module (text, video, interactive exercises, downloadable resources)</li>
          <li>Attach assessments (quizzes, assignments) to modules or the course overall</li>
          <li>Preview your course as a student would see it</li>
          <li>Submit for review or publish directly (depending on your trust level)</li>
        </ol>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Text Lessons</h4>
            <p className="text-sm">Rich text editor with formatting, images, diagrams, code blocks, and embedded media. Supports LaTeX for mathematical formulas.</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Video Lessons</h4>
            <p className="text-sm">Upload video content directly or embed from YouTube. Add chapter markers, captions, and transcript for accessibility.</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Interactive Content</h4>
            <p className="text-sm">Create drag-and-drop exercises, fill-in-the-blank activities, matching games, and interactive diagrams.</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">CBC Alignment Tags</h4>
            <p className="text-sm">Tag each lesson with specific CBC competencies and strands to help students and parents track curriculum coverage.</p>
          </div>
        </div>
        <DocsImagePlaceholder
          description="Course editor showing module structure, lesson editor, and CBC alignment tags"
          path="/docs/screenshots/instructor-course-editor.png"
        />
      </DocsSection>

      {/* Assessments & Grading */}
      <DocsSection
        id="assessments"
        title="Assessments & Grading"
        description="Create quizzes and assignments, and grade student submissions."
      >
        <p className="mb-4">
          Assessments are an integral part of every course. You can create various assessment types
          and configure grading rules, deadlines, and retake policies.
        </p>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Creating assessments:</h4>
        <div className="space-y-3 mb-4">
          <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 dark:text-green-300 mb-1">Quizzes</h4>
            <p className="text-sm text-green-700 dark:text-green-400">
              Create multiple choice, true/false, short answer, and matching questions. Set time limits,
              passing scores, and retake policies. Quizzes are graded automatically and results are
              shown to students instantly.
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Assignments</h4>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Define assignment instructions, submission format (text, file upload, or both), deadlines,
              and rubrics. You manually grade submissions and provide written feedback. Late submission
              policies can be configured per assignment.
            </p>
          </div>
        </div>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Grading submissions:</h4>
        <ol className="list-decimal list-inside space-y-1 text-sm mb-4">
          <li>Navigate to "Assessments" in your sidebar and select a course</li>
          <li>View the submission queue sorted by newest or deadline proximity</li>
          <li>Open a submission to review the student's work</li>
          <li>Assign a grade using your rubric or point system</li>
          <li>Provide written feedback, highlighting strengths and areas for improvement</li>
          <li>Submit the grade -- the student is notified immediately</li>
        </ol>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">AI-Assisted Grading</h4>
          <p className="text-sm text-yellow-700 dark:text-yellow-400">
            The Bird AI can suggest grades and generate initial feedback for text-based submissions.
            You always have the final say -- review and adjust AI suggestions before submitting.
          </p>
        </div>
        <DocsImagePlaceholder
          description="Assessment grading interface with student submission, rubric, and feedback panel"
          path="/docs/screenshots/instructor-grading.png"
        />
      </DocsSection>

      {/* Live Sessions */}
      <DocsSection
        id="live-sessions"
        title="Live Sessions"
        description="Schedule, manage, and conduct live teaching sessions with students."
      >
        <p className="mb-4">
          Live sessions bring the classroom experience to UHS. You can conduct real-time
          lessons, Q&A sessions, and group discussions with your enrolled students using
          built-in WebRTC video rooms.
        </p>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Scheduling a session:</h4>
        <ol className="list-decimal list-inside space-y-1 text-sm mb-4">
          <li>Go to "Live Sessions" in your sidebar and click "Schedule Session"</li>
          <li>Select the course and topic for the session</li>
          <li>Pick a date, start time, and duration</li>
          <li>Add a description of what will be covered</li>
          <li>Set maximum participants (optional) and access controls</li>
          <li>Publish the session -- enrolled students receive notifications</li>
        </ol>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">During a live session:</h4>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Video & Audio</h4>
            <p className="text-sm">Full HD video and audio with screen sharing. Toggle your camera and microphone as needed.</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Screen Sharing</h4>
            <p className="text-sm">Share your entire screen, a specific window, or a browser tab for demonstrations and presentations.</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Chat & Q&A</h4>
            <p className="text-sm">A real-time chat panel where students can ask questions. Pin important messages for visibility.</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Whiteboard</h4>
            <p className="text-sm">An interactive whiteboard for drawing diagrams, writing equations, and collaborative problem-solving.</p>
          </div>
        </div>
        <DocsImagePlaceholder
          description="Live session video room with instructor view, student gallery, and chat panel"
          path="/docs/screenshots/instructor-live-session.png"
        />
      </DocsSection>

      {/* Earnings & Payouts */}
      <DocsSection
        id="earnings"
        title="Earnings & Payouts"
        description="Track your revenue, view breakdowns, and manage payouts."
      >
        <p className="mb-4">
          UHS operates on a revenue-sharing model. When students pay for your courses, you earn
          a percentage of the course price. The earnings dashboard gives you full transparency
          into your teaching income.
        </p>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Earnings dashboard:</h4>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>Total Earnings:</strong> Lifetime revenue earned from all courses</li>
            <li><strong>This Month:</strong> Current month earnings with daily breakdown chart</li>
            <li><strong>Per Course:</strong> Revenue breakdown for each individual course</li>
            <li><strong>Pending Balance:</strong> Earnings awaiting the next payout cycle</li>
            <li><strong>Paid Out:</strong> Total amount already transferred to your account</li>
          </ul>
        </div>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Revenue sharing rates:</h4>
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left px-4 py-2 font-semibold text-gray-900 dark:text-white">Tier</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-900 dark:text-white">Condition</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-900 dark:text-white">Instructor Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              <tr>
                <td className="px-4 py-2">Standard</td>
                <td className="px-4 py-2">Default for all instructors</td>
                <td className="px-4 py-2 font-semibold text-green-600 dark:text-green-400">70%</td>
              </tr>
              <tr>
                <td className="px-4 py-2">Premium</td>
                <td className="px-4 py-2">50+ enrollments and 4.5+ rating</td>
                <td className="px-4 py-2 font-semibold text-green-600 dark:text-green-400">80%</td>
              </tr>
              <tr>
                <td className="px-4 py-2">Elite</td>
                <td className="px-4 py-2">200+ enrollments and top-rated</td>
                <td className="px-4 py-2 font-semibold text-green-600 dark:text-green-400">85%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Payout schedule:</h4>
        <ul className="list-disc list-inside space-y-1 text-sm mb-4">
          <li>Payouts are processed on the 1st and 15th of each month</li>
          <li>Minimum payout threshold is KES 1,000</li>
          <li>Supported payout methods: M-Pesa and bank transfer</li>
          <li>Payout history with downloadable invoices available in the earnings dashboard</li>
        </ul>
      </DocsSection>

      {/* Student Analytics */}
      <DocsSection
        id="student-analytics"
        title="Student Analytics"
        description="Monitor student progress and intervene when learners need support."
      >
        <p className="mb-4">
          The student analytics tools give you detailed visibility into how your students are
          performing. Use these insights to improve your courses and provide targeted support
          to struggling learners.
        </p>
        <div className="space-y-3 mb-4">
          <div className="border border-blue-200 dark:border-blue-800 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/10">
            <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Progress Pulse</h4>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              A real-time heatmap of student activity across your courses. See which lessons are most
              popular, where students drop off, and which assessments have the lowest pass rates.
              Use this data to revise and improve weak content areas.
            </p>
          </div>
          <div className="border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 bg-yellow-50 dark:bg-yellow-900/10">
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">Intervention Alerts</h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              Automatic alerts when a student falls behind, fails an assessment multiple times, or
              shows declining engagement. You can send encouragement messages, offer extra resources,
              or schedule a one-on-one session.
            </p>
          </div>
          <div className="border border-purple-200 dark:border-purple-800 rounded-lg p-4 bg-purple-50 dark:bg-purple-900/10">
            <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">AI Handoff</h4>
            <p className="text-sm text-purple-700 dark:text-purple-400">
              When The Bird AI identifies a student needing human attention, it flags the student
              in your analytics dashboard. Review the AI's assessment, see the student's conversation
              history, and decide on the best intervention approach.
            </p>
          </div>
        </div>
        <DocsImagePlaceholder
          description="Student analytics dashboard with progress pulse heatmap and intervention alerts"
          path="/docs/screenshots/instructor-student-analytics.png"
        />
      </DocsSection>

      {/* Instructor Hub */}
      <DocsSection
        id="hub"
        title="Instructor Hub"
        description="Resources, community, and support for UHS instructors."
      >
        <p className="mb-4">
          The Instructor Hub is your go-to resource center for professional development,
          collaboration, and platform support. It is accessible from your sidebar under "Hub."
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">CBC References</h4>
            <p className="text-sm">Access the full CBC curriculum framework, competency maps, and suggested activities organized by grade level and learning area.</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">AI Prompt Library</h4>
            <p className="text-sm">A curated collection of AI prompts for generating lesson plans, quiz questions, explanations, and study guides using The Bird AI.</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Community Lounge</h4>
            <p className="text-sm">Connect with fellow instructors, share teaching strategies, ask questions, and collaborate on course content.</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Support & Help</h4>
            <p className="text-sm">Access FAQs, submit support tickets, and chat with the UHS support team for technical or content-related issues.</p>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Tips for successful teaching on UHS:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Keep lessons concise and focused -- aim for 10-15 minutes per lesson</li>
            <li>Use a mix of text, video, and interactive content to cater to different learning styles</li>
            <li>Respond to student questions within 24 hours to maintain engagement</li>
            <li>Update your courses regularly based on student feedback and analytics</li>
            <li>Participate in the Community Lounge to stay connected with fellow educators</li>
          </ul>
        </div>
      </DocsSection>

      {/* Bottom navigation */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8 flex justify-between items-center">
        <Link to="/docs/parent-guide" className="text-sm text-red-600 dark:text-red-400 hover:underline">
          Parent Guide
        </Link>
        <Link to="/docs/partner-guide" className="text-sm text-red-600 dark:text-red-400 hover:underline">
          Partner Guide
        </Link>
      </div>
    </div>
  );
};

export default InstructorGuidePage;
