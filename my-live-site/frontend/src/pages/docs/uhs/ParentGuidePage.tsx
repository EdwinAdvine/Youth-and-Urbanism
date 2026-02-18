// ParentGuidePage - Comprehensive guide for parents managing their children's education.
// Covers dashboard, child management, progress monitoring, AI insights, payments, and more.

import React from 'react';
import { Link } from 'react-router-dom';
import DocsSection from '../../../components/docs/DocsSection';
import DocsImagePlaceholder from '../../../components/docs/DocsImagePlaceholder';

const ParentGuidePage: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
        Parent Guide
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        Monitor, support, and manage your children's learning journey on Urban Home School.
      </p>

      {/* Table of Contents */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-8">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">On this page</h3>
        <nav className="grid sm:grid-cols-2 gap-1">
          {[
            { id: 'dashboard', label: 'Dashboard Overview' },
            { id: 'managing-children', label: 'Adding & Managing Children' },
            { id: 'monitoring-progress', label: 'Monitoring Progress' },
            { id: 'ai-insights', label: 'AI Insights' },
            { id: 'cbc-tracking', label: 'CBC Competency Tracking' },
            { id: 'payments', label: 'Subscription & Payments' },
            { id: 'communication', label: 'Communication' },
            { id: 'privacy', label: 'Privacy & Consent' },
            { id: 'reports', label: 'Reports' },
          ].map(item => (
            <a key={item.id} href={`#${item.id}`} className="text-sm text-red-600 dark:text-red-400 hover:underline py-0.5">
              {item.label}
            </a>
          ))}
        </nav>
      </div>

      {/* Dashboard Overview */}
      <DocsSection
        id="dashboard"
        title="Dashboard Overview"
        description="Your central hub for overseeing your children's education."
      >
        <p className="mb-4">
          The parent dashboard provides a bird's-eye view of all your children's learning
          activities. At a glance, you can see each child's progress, recent activity,
          upcoming assessments, and any notifications that need your attention.
        </p>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Dashboard sections:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>Children Overview Cards:</strong> One card per child showing their grade, enrolled courses, and overall progress</li>
            <li><strong>Activity Timeline:</strong> Recent learning activities across all children</li>
            <li><strong>Upcoming Deadlines:</strong> Assignments and assessments due soon for any child</li>
            <li><strong>AI Recommendations:</strong> Suggestions from The Bird AI on how to support your children</li>
            <li><strong>Quick Actions:</strong> Enroll in courses, top up wallet, view reports</li>
          </ul>
        </div>
        <DocsImagePlaceholder
          description="Parent dashboard showing children overview cards and activity timeline"
          path="/docs/screenshots/parent-dashboard.png"
        />
      </DocsSection>

      {/* Adding & Managing Children */}
      <DocsSection
        id="managing-children"
        title="Adding & Managing Children"
        description="Link existing student accounts or create new ones for your children."
      >
        <p className="mb-4">
          You can manage multiple children from a single parent account. There are two ways
          to add a child:
        </p>
        <div className="space-y-4 mb-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Option 1: Link an Existing Student</h4>
            <ol className="list-decimal list-inside text-sm space-y-1">
              <li>Navigate to "My Children" in your sidebar</li>
              <li>Click "Add Child" and select "Link Existing Account"</li>
              <li>Enter your child's email address or admission number</li>
              <li>Your child will receive a confirmation request to approve the link</li>
              <li>Once approved, the child appears in your dashboard</li>
            </ol>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Option 2: Create a New Student Account</h4>
            <ol className="list-decimal list-inside text-sm space-y-1">
              <li>Navigate to "My Children" and click "Add Child"</li>
              <li>Select "Create New Account"</li>
              <li>Enter the child's name, grade level, and date of birth</li>
              <li>An account is created automatically and linked to your parent profile</li>
              <li>You manage the account until the child is old enough to take over</li>
            </ol>
          </div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">Note:</h4>
          <p className="text-sm text-yellow-700 dark:text-yellow-400">
            There is no limit to how many children you can add. Each child maintains their own
            independent learning profile, AI tutor history, and progress data.
          </p>
        </div>
        <DocsImagePlaceholder
          description="Add child interface showing link existing or create new options"
          path="/docs/screenshots/parent-add-child.png"
        />
      </DocsSection>

      {/* Monitoring Progress */}
      <DocsSection
        id="monitoring-progress"
        title="Monitoring Progress"
        description="Stay informed about how your children are doing in their courses."
      >
        <p className="mb-4">
          The progress monitoring tools give you detailed visibility into each child's
          academic journey without needing to look over their shoulder.
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Course Progress</h4>
            <p className="text-sm">See completion percentages for each enrolled course, lessons completed, and time spent learning.</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Assessment Scores</h4>
            <p className="text-sm">View grades for all quizzes, assignments, projects, and exams with trend analysis over time.</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Attendance & Activity</h4>
            <p className="text-sm">Track login frequency, active learning days, and session duration to understand engagement patterns.</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Comparison View</h4>
            <p className="text-sm">If you have multiple children, compare their progress side by side to identify who might need extra support.</p>
          </div>
        </div>
        <DocsImagePlaceholder
          description="Progress monitoring dashboard showing course progress bars and assessment scores"
          path="/docs/screenshots/parent-progress.png"
        />
      </DocsSection>

      {/* AI Insights */}
      <DocsSection
        id="ai-insights"
        title="AI Insights"
        description="The Bird AI analyzes your child's learning patterns and provides actionable insights."
      >
        <p className="mb-4">
          The Bird AI does not just tutor your children -- it also generates insights for you
          as a parent. These insights help you understand your child's learning style, strengths,
          and areas that need attention.
        </p>
        <div className="space-y-3 mb-4">
          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Learning Style Analysis</h4>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Based on interaction patterns, the AI identifies whether your child learns best through
              visual, auditory, reading, or kinesthetic approaches.
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 dark:text-green-300 mb-1">Strength Areas</h4>
            <p className="text-sm text-green-700 dark:text-green-400">
              The AI highlights subjects and topics where your child excels, along with
              recommendations for advanced challenges.
            </p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">Areas for Improvement</h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              Identify topics where your child struggles and get suggested resources,
              practice exercises, and tutoring session recommendations.
            </p>
          </div>
        </div>
        <DocsImagePlaceholder
          description="AI insights panel showing learning style, strengths, and improvement areas"
          path="/docs/screenshots/parent-ai-insights.png"
        />
      </DocsSection>

      {/* CBC Competency Tracking */}
      <DocsSection
        id="cbc-tracking"
        title="CBC Competency Tracking"
        description="Monitor your child's progress against Kenya's Competency-Based Curriculum standards."
      >
        <p className="mb-4">
          UHS aligns all course content with the Kenyan CBC framework. As a parent, you can
          track your child's mastery of competencies defined by the curriculum.
        </p>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Competency levels:</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0"></span>
              <span className="text-sm"><strong>Below Expectation:</strong> Needs significant support in this area</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-yellow-500 flex-shrink-0"></span>
              <span className="text-sm"><strong>Approaching Expectation:</strong> Making progress but not yet proficient</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0"></span>
              <span className="text-sm"><strong>Meeting Expectation:</strong> Demonstrates required competency</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0"></span>
              <span className="text-sm"><strong>Exceeding Expectation:</strong> Shows advanced understanding</span>
            </div>
          </div>
        </div>
        <DocsImagePlaceholder
          description="CBC competency grid showing mastery levels across learning areas"
          path="/docs/screenshots/parent-cbc-tracking.png"
        />
      </DocsSection>

      {/* Subscription & Payments */}
      <DocsSection
        id="payments"
        title="Subscription & Payments (M-Pesa)"
        description="Manage subscriptions and make payments for your children's courses."
      >
        <p className="mb-4">
          As a parent, you manage the financial side of your children's education. UHS
          supports M-Pesa as the primary payment method, along with PayPal and card payments.
        </p>
        <div className="space-y-3 mb-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Subscription Plans</h4>
            <p className="text-sm">Choose from Basic (free), Standard, or Premium plans. Higher tiers unlock more courses, AI features, and support.</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">M-Pesa Payments</h4>
            <p className="text-sm">Pay using M-Pesa STK push. Simply enter your phone number, confirm the prompt on your phone, and payment is processed instantly.</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Family Wallet</h4>
            <p className="text-sm">Maintain a shared wallet balance. Top up once and use it to pay for courses across all your children's accounts.</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Payment History</h4>
            <p className="text-sm">View all payments, receipts, and subscription invoices. Download PDF receipts for record-keeping.</p>
          </div>
        </div>
        <DocsImagePlaceholder
          description="Payment management page with subscription plan and M-Pesa top-up"
          path="/docs/screenshots/parent-payments.png"
        />
      </DocsSection>

      {/* Communication */}
      <DocsSection
        id="communication"
        title="Communication"
        description="Stay connected with instructors and the UHS team."
      >
        <p className="mb-4">
          Communication tools help you stay connected with your children's instructors and
          the UHS support team.
        </p>
        <ul className="list-disc list-inside space-y-2 text-sm mb-4">
          <li><strong>Instructor Messages:</strong> Send direct messages to your child's course instructors for questions about performance or content</li>
          <li><strong>Notifications:</strong> Receive real-time alerts about deadlines, grade updates, and important announcements</li>
          <li><strong>Weekly Digests:</strong> Opt in to receive a weekly email summary of each child's learning activity</li>
          <li><strong>Support Chat:</strong> Contact UHS support directly from your dashboard for any platform-related questions</li>
        </ul>
        <DocsImagePlaceholder
          description="Communication center showing messages and notification settings"
          path="/docs/screenshots/parent-communication.png"
        />
      </DocsSection>

      {/* Privacy & Consent */}
      <DocsSection
        id="privacy"
        title="Privacy & Consent"
        description="Control how your children's data is used and shared."
      >
        <p className="mb-4">
          UHS takes children's privacy seriously. As a parent, you have full control over
          data sharing and consent settings for your children's accounts.
        </p>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Privacy controls include:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Toggle AI data collection for personalization (opt in/out)</li>
            <li>Control whether your child's name appears in forum posts or leaderboards</li>
            <li>Manage data sharing with partner organizations (if sponsored)</li>
            <li>Request data export or deletion (GDPR/Kenya DPA compliant)</li>
            <li>Set content filters and age-appropriate restrictions</li>
          </ul>
        </div>
      </DocsSection>

      {/* Reports */}
      <DocsSection
        id="reports"
        title="Reports"
        description="Generate and download detailed academic reports."
      >
        <p className="mb-4">
          Generate comprehensive reports about your children's learning progress. Reports can
          be downloaded as PDFs and shared with tutors, schools, or family members.
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Weekly Report</h4>
            <p className="text-sm">Summary of the past week's activities, courses accessed, assessments taken, and time spent learning.</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Monthly Report</h4>
            <p className="text-sm">Detailed monthly overview with progress trends, competency changes, and AI recommendations.</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Term Report</h4>
            <p className="text-sm">End-of-term comprehensive report aligned with the school calendar, showing cumulative progress.</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Custom Report</h4>
            <p className="text-sm">Select date ranges, specific courses, or competency areas for a tailored report.</p>
          </div>
        </div>
        <DocsImagePlaceholder
          description="Report generation page with options for weekly, monthly, and term reports"
          path="/docs/screenshots/parent-reports.png"
        />
      </DocsSection>

      {/* Bottom navigation */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8 flex justify-between items-center">
        <Link to="/docs/student-guide" className="text-sm text-red-600 dark:text-red-400 hover:underline">
          Student Guide
        </Link>
        <Link to="/docs/instructor-guide" className="text-sm text-red-600 dark:text-red-400 hover:underline">
          Instructor Guide
        </Link>
      </div>
    </div>
  );
};

export default ParentGuidePage;
