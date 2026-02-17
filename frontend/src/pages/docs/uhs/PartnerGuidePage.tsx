// PartnerGuidePage - Comprehensive guide for partners (organizations, NGOs, corporates)
// sponsoring students on the UHS platform. Covers dashboard, sponsorships, impact tracking,
// programs, payments, reports, and account settings.

import React from 'react';
import { Link } from 'react-router-dom';
import DocsSection from '../../../components/docs/DocsSection';
import DocsImagePlaceholder from '../../../components/docs/DocsImagePlaceholder';

const PartnerGuidePage: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
        Partner Guide
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        Sponsor students, track impact, and manage your organization's educational programs on Urban Home School.
      </p>

      {/* Table of Contents */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-8">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">On this page</h3>
        <nav className="grid sm:grid-cols-2 gap-1">
          {[
            { id: 'what-is-partner', label: 'What is a Partner?' },
            { id: 'dashboard', label: 'Dashboard Overview' },
            { id: 'sponsoring', label: 'Sponsoring Children' },
            { id: 'impact', label: 'Impact Tracking' },
            { id: 'programs', label: 'Programs Management' },
            { id: 'payments', label: 'Payments & Budgets' },
            { id: 'reports', label: 'Reports & Analytics' },
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

      {/* What is a Partner? */}
      <DocsSection
        id="what-is-partner"
        title="What is a Partner?"
        description="Understanding the partner role on Urban Home School."
      >
        <p className="mb-4">
          Partners are organizations, NGOs, corporate entities, and philanthropic individuals who
          sponsor students' education on Urban Home School. By becoming a partner, you help provide
          access to quality education for children who might not otherwise afford it.
        </p>
        <div className="grid sm:grid-cols-3 gap-4 mb-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Organizations</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">Schools, educational institutions, and community organizations</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">NGOs</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">Non-profits and international development agencies</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Corporates</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">Companies funding CSR education initiatives</p>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Partner benefits:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Transparent impact tracking with real-time student progress data</li>
            <li>Branded sponsorship pages and recognition on student certificates</li>
            <li>Detailed analytics and downloadable reports for stakeholders</li>
            <li>Dedicated partner success manager for organizations sponsoring 50+ students</li>
            <li>Tax-deductible receipts for qualifying donations</li>
          </ul>
        </div>
      </DocsSection>

      {/* Dashboard Overview */}
      <DocsSection
        id="dashboard"
        title="Dashboard Overview"
        description="Your central hub for managing sponsorships and tracking educational impact."
      >
        <p className="mb-4">
          The partner dashboard provides an at-a-glance view of your sponsorship portfolio,
          funding status, and the impact your contributions are making on students' lives.
        </p>
        <div className="space-y-3 mb-4">
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-700 dark:text-red-400 text-sm font-bold flex-shrink-0">1</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Impact Summary Cards</h4>
              <p className="text-sm">Key metrics at the top: total students sponsored, active sponsorships, total funding contributed, and average student completion rate.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-700 dark:text-red-400 text-sm font-bold flex-shrink-0">2</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Sponsorship Portfolio</h4>
              <p className="text-sm">A list of all sponsored students with their current grade, enrolled courses, progress, and last activity date.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-700 dark:text-red-400 text-sm font-bold flex-shrink-0">3</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Funding Overview</h4>
              <p className="text-sm">Budget allocation, amount spent, remaining balance, and upcoming payment schedules.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-700 dark:text-red-400 text-sm font-bold flex-shrink-0">4</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Recent Activity Feed</h4>
              <p className="text-sm">A timeline of recent milestones: course completions, certificate awards, and assessment results from your sponsored students.</p>
            </div>
          </div>
        </div>
        <DocsImagePlaceholder
          description="Partner dashboard showing impact summary cards and sponsorship portfolio"
          path="/docs/screenshots/partner-dashboard.png"
        />
      </DocsSection>

      {/* Sponsoring Children */}
      <DocsSection
        id="sponsoring"
        title="Sponsoring Children"
        description="How sponsorship works, selecting students, and managing active sponsorships."
      >
        <p className="mb-4">
          Sponsoring a child on UHS means covering the cost of their course enrollments,
          subscription plan, and learning materials. You can sponsor individual students or
          groups, and choose how much control you have over course selection.
        </p>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">How sponsorship works:</h4>
        <ol className="list-decimal list-inside space-y-2 text-sm mb-4">
          <li>Navigate to "Sponsorships" in your sidebar and click "Sponsor a Student"</li>
          <li>Browse the pool of eligible students or enter a specific student's admission number</li>
          <li>Select a sponsorship plan (monthly, termly, or annual)</li>
          <li>Choose course access level: specific courses, a learning area, or full platform access</li>
          <li>Confirm and process payment -- the student gains immediate access</li>
          <li>The student and their parent (if linked) are notified of the sponsorship</li>
        </ol>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Managing sponsorships:</h4>
        <ul className="list-disc list-inside space-y-1 text-sm mb-4">
          <li><strong>Renew:</strong> Extend a sponsorship when the current period ends</li>
          <li><strong>Upgrade:</strong> Move a student to a higher access level or add more courses</li>
          <li><strong>Pause:</strong> Temporarily halt a sponsorship (student retains progress but loses access)</li>
          <li><strong>Transfer:</strong> Reassign sponsorship funds from one student to another</li>
          <li><strong>End:</strong> Gracefully close a sponsorship with a transition period for the student</li>
        </ul>
        <DocsImagePlaceholder
          description="Sponsorship management interface with student selection and plan options"
          path="/docs/screenshots/partner-sponsorships.png"
        />
      </DocsSection>

      {/* Impact Tracking */}
      <DocsSection
        id="impact"
        title="Impact Tracking"
        description="Measure the real educational impact of your sponsorships."
      >
        <p className="mb-4">
          UHS provides comprehensive impact metrics so you can demonstrate the value of your
          sponsorships to stakeholders, board members, and donors. All data is updated in real time.
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 dark:text-green-300 mb-1">Student Progress</h4>
            <p className="text-sm text-green-700 dark:text-green-400">Track each sponsored student's course progress, lesson completions, and overall learning trajectory over time.</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Completion Rates</h4>
            <p className="text-sm text-blue-700 dark:text-blue-400">View course completion rates across all sponsored students, compared with platform averages to gauge effectiveness.</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-1">Engagement Metrics</h4>
            <p className="text-sm text-purple-700 dark:text-purple-400">Monitor login frequency, time spent learning, AI tutor usage, and assessment participation for each student.</p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">Certificates Earned</h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-400">Track the number of certificates awarded to sponsored students as tangible proof of learning outcomes.</p>
          </div>
        </div>
        <DocsImagePlaceholder
          description="Impact tracking dashboard with progress charts and completion rate metrics"
          path="/docs/screenshots/partner-impact.png"
        />
      </DocsSection>

      {/* Programs Management */}
      <DocsSection
        id="programs"
        title="Programs Management"
        description="Create structured educational programs, events, and collaborations."
      >
        <p className="mb-4">
          Beyond individual sponsorships, partners can create programs that group students,
          courses, and goals into structured initiatives. Programs are ideal for NGOs running
          educational campaigns or corporates with CSR objectives.
        </p>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Creating a program:</h4>
        <ol className="list-decimal list-inside space-y-1 text-sm mb-4">
          <li>Go to "Programs" in your sidebar and click "Create Program"</li>
          <li>Define the program name, description, target audience, and duration</li>
          <li>Select the courses or learning paths included in the program</li>
          <li>Set enrollment criteria (grade level, region, age group)</li>
          <li>Assign a budget and funding source</li>
          <li>Invite students or allow open enrollment with application review</li>
          <li>Launch the program and monitor progress from the program dashboard</li>
        </ol>
        <div className="space-y-3 mb-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Events</h4>
            <p className="text-sm">Organize virtual events such as workshops, hackathons, or mentorship sessions as part of your program.</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Collaborations</h4>
            <p className="text-sm">Partner with other organizations or instructors on the platform to co-create programs and share resources.</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Milestones</h4>
            <p className="text-sm">Set program milestones with target dates and track collective progress towards completion goals.</p>
          </div>
        </div>
      </DocsSection>

      {/* Payments & Budgets */}
      <DocsSection
        id="payments"
        title="Payments & Budgets"
        description="Manage funding, process payments, and track budget allocation."
      >
        <p className="mb-4">
          The payments section provides full visibility into your sponsorship spending. You can
          manage budgets, process bulk payments, and download financial records for accounting.
        </p>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Payment features:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>Budget Allocation:</strong> Set total budget and allocate amounts per student, program, or course</li>
            <li><strong>Bulk Payments:</strong> Process payments for multiple students or an entire program at once</li>
            <li><strong>Payment Methods:</strong> M-Pesa, PayPal, bank transfer, or corporate invoicing</li>
            <li><strong>Auto-Renewal:</strong> Set sponsorships to automatically renew at the end of each period</li>
            <li><strong>Transaction History:</strong> Complete log of all payments with downloadable receipts and invoices</li>
            <li><strong>Tax Receipts:</strong> Generate tax-deductible donation receipts for qualifying contributions</li>
          </ul>
        </div>
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left px-4 py-2 font-semibold text-gray-900 dark:text-white">Sponsorship Level</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-900 dark:text-white">Monthly Cost (KES)</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-900 dark:text-white">Includes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              <tr>
                <td className="px-4 py-2">Basic</td>
                <td className="px-4 py-2">500</td>
                <td className="px-4 py-2">3 courses per term</td>
              </tr>
              <tr>
                <td className="px-4 py-2">Standard</td>
                <td className="px-4 py-2">1,500</td>
                <td className="px-4 py-2">Unlimited courses + AI tutor</td>
              </tr>
              <tr>
                <td className="px-4 py-2">Premium</td>
                <td className="px-4 py-2">3,000</td>
                <td className="px-4 py-2">Full access + live sessions + store credits</td>
              </tr>
            </tbody>
          </table>
        </div>
      </DocsSection>

      {/* Reports & Analytics */}
      <DocsSection
        id="reports"
        title="Reports & Analytics"
        description="Generate detailed reports for stakeholders and organizational records."
      >
        <p className="mb-4">
          UHS provides powerful reporting tools designed for partner organizations. Reports can
          be customized, scheduled, and shared with stakeholders to demonstrate program
          effectiveness and return on investment.
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Impact Report</h4>
            <p className="text-sm">Comprehensive overview of all sponsorships, student outcomes, completion rates, and certificates earned over a selected time period.</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Financial Report</h4>
            <p className="text-sm">Detailed breakdown of all spending, budget utilization, per-student costs, and remaining allocation.</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Student Progress Report</h4>
            <p className="text-sm">Individual or aggregate student progress data including grades, engagement, and CBC competency levels.</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Custom Report Builder</h4>
            <p className="text-sm">Select metrics, date ranges, student groups, and visualization types to create bespoke reports for presentations.</p>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Export formats:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>PDF reports with charts, tables, and executive summaries</li>
            <li>CSV data exports for custom analysis in Excel or Google Sheets</li>
            <li>Scheduled email delivery (weekly, monthly, or quarterly)</li>
            <li>Shareable links for stakeholders with read-only access</li>
          </ul>
        </div>
        <DocsImagePlaceholder
          description="Reports dashboard with impact metrics, financial summary, and export options"
          path="/docs/screenshots/partner-reports.png"
        />
      </DocsSection>

      {/* Account Settings */}
      <DocsSection
        id="settings"
        title="Account Settings"
        description="Manage your organization profile, team members, and preferences."
      >
        <p className="mb-4">
          Configure your organization's profile, manage team access, and customize your partner
          experience from the account settings.
        </p>
        <div className="space-y-3 mb-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Organization Profile</h4>
            <p className="text-sm">Update your organization name, logo, description, website, and contact information displayed on sponsorship pages.</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Team Management</h4>
            <p className="text-sm">Add team members with specific roles: Admin (full access), Manager (sponsorship management), Viewer (read-only reports).</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Notification Preferences</h4>
            <p className="text-sm">Configure which notifications you and your team receive: new milestones, payment confirmations, report availability.</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Data & Privacy</h4>
            <p className="text-sm">Manage data access permissions, consent settings, and compliance with Kenya's Data Protection Act and GDPR.</p>
          </div>
        </div>
      </DocsSection>

      {/* Bottom navigation */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8 flex justify-between items-center">
        <Link to="/docs/instructor-guide" className="text-sm text-red-600 dark:text-red-400 hover:underline">
          Instructor Guide
        </Link>
        <Link to="/docs/courses" className="text-sm text-red-600 dark:text-red-400 hover:underline">
          Courses
        </Link>
      </div>
    </div>
  );
};

export default PartnerGuidePage;
