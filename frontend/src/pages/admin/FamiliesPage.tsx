import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  FileCheck,
  Link2,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  Eye,
  Check,
  X,
  Search,
} from 'lucide-react';
import { motion } from 'framer-motion';
import AdminPageHeader from '../../components/admin/shared/AdminPageHeader';

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

type TabType = 'enrollments' | 'consent' | 'links';

interface PendingEnrollment {
  id: string;
  student_name: string;
  parent_name: string;
  grade_level: string;
  requested_at: Date;
  status: 'pending' | 'approved' | 'rejected';
  documents_submitted: boolean;
  notes: string;
}

interface ConsentRequest {
  id: string;
  parent_name: string;
  student_name: string;
  consent_type: string;
  description: string;
  requested_at: Date;
  status: 'pending' | 'approved' | 'denied';
}

interface ParentChildLink {
  id: string;
  parent_name: string;
  parent_email: string;
  children: { name: string; grade: string; status: 'active' | 'inactive' }[];
  linked_at: Date;
  verified: boolean;
}

// ------------------------------------------------------------------
// Mock data
// ------------------------------------------------------------------

const now = Date.now();
const hours = (h: number) => new Date(now - h * 60 * 60 * 1000);
const days = (d: number) => new Date(now - d * 24 * 60 * 60 * 1000);

const mockEnrollments: PendingEnrollment[] = [
  {
    id: 'enr_001',
    student_name: 'Amani Kamau',
    parent_name: 'Grace Kamau',
    grade_level: 'Grade 4',
    requested_at: hours(3),
    status: 'pending',
    documents_submitted: true,
    notes: 'Transfer from Nairobi Primary. All CBC records available.',
  },
  {
    id: 'enr_002',
    student_name: 'Baraka Otieno',
    parent_name: 'James Otieno',
    grade_level: 'Grade 6',
    requested_at: hours(8),
    status: 'pending',
    documents_submitted: true,
    notes: 'Returning student. Previously enrolled in 2025.',
  },
  {
    id: 'enr_003',
    student_name: 'Imani Njoroge',
    parent_name: 'Faith Njoroge',
    grade_level: 'Grade 3',
    requested_at: days(1),
    status: 'pending',
    documents_submitted: false,
    notes: 'Birth certificate pending submission.',
  },
  {
    id: 'enr_004',
    student_name: 'Zawadi Mwangi',
    parent_name: 'Daniel Mwangi',
    grade_level: 'Grade 5',
    requested_at: days(2),
    status: 'pending',
    documents_submitted: true,
    notes: 'Special needs accommodations requested for visual impairment.',
  },
  {
    id: 'enr_005',
    student_name: 'Jabali Wekesa',
    parent_name: 'Sarah Wekesa',
    grade_level: 'Grade 7',
    requested_at: days(3),
    status: 'pending',
    documents_submitted: true,
    notes: 'Scholarship applicant through Elimu Foundation.',
  },
];

const mockConsent: ConsentRequest[] = [
  {
    id: 'con_001',
    parent_name: 'Grace Kamau',
    student_name: 'Amani Kamau',
    consent_type: 'AI Tutor Usage',
    description: 'Consent for student to use AI-powered tutoring sessions with Ndege',
    requested_at: hours(2),
    status: 'pending',
  },
  {
    id: 'con_002',
    parent_name: 'James Otieno',
    student_name: 'Baraka Otieno',
    consent_type: 'Data Collection',
    description: 'Consent for learning analytics data collection for performance improvement',
    requested_at: hours(6),
    status: 'pending',
  },
  {
    id: 'con_003',
    parent_name: 'Faith Njoroge',
    student_name: 'Imani Njoroge',
    consent_type: 'Photo/Video',
    description: 'Consent for student image usage in promotional materials',
    requested_at: days(1),
    status: 'pending',
  },
  {
    id: 'con_004',
    parent_name: 'Sarah Wekesa',
    student_name: 'Jabali Wekesa',
    consent_type: 'Voice Recording',
    description: 'Consent to record voice during ElevenLabs tutor interactions',
    requested_at: days(2),
    status: 'pending',
  },
];

const mockLinks: ParentChildLink[] = [
  {
    id: 'link_001',
    parent_name: 'Grace Kamau',
    parent_email: 'grace.kamau@example.com',
    children: [
      { name: 'Amani Kamau', grade: 'Grade 4', status: 'active' },
      { name: 'Baraka Kamau', grade: 'Grade 2', status: 'active' },
      { name: 'Imani Kamau', grade: 'Grade 5', status: 'active' },
    ],
    linked_at: days(180),
    verified: true,
  },
  {
    id: 'link_002',
    parent_name: 'James Otieno',
    parent_email: 'james.otieno@example.com',
    children: [
      { name: 'Baraka Otieno', grade: 'Grade 6', status: 'active' },
    ],
    linked_at: days(90),
    verified: true,
  },
  {
    id: 'link_003',
    parent_name: 'Faith Njoroge',
    parent_email: 'faith.njoroge@example.com',
    children: [
      { name: 'Imani Njoroge', grade: 'Grade 3', status: 'active' },
      { name: 'Neema Njoroge', grade: 'Grade 1', status: 'inactive' },
    ],
    linked_at: days(120),
    verified: true,
  },
  {
    id: 'link_004',
    parent_name: 'Daniel Mwangi',
    parent_email: 'daniel.mwangi@example.com',
    children: [
      { name: 'Zawadi Mwangi', grade: 'Grade 5', status: 'active' },
    ],
    linked_at: days(45),
    verified: false,
  },
  {
    id: 'link_005',
    parent_name: 'Sarah Wekesa',
    parent_email: 'sarah.wekesa@example.com',
    children: [
      { name: 'Jabali Wekesa', grade: 'Grade 7', status: 'active' },
      { name: 'Tumaini Wekesa', grade: 'Grade 4', status: 'active' },
    ],
    linked_at: days(200),
    verified: true,
  },
];

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hoursDiff = Math.floor(minutes / 60);
  if (hoursDiff < 24) return `${hoursDiff}h ago`;
  const daysDiff = Math.floor(hoursDiff / 24);
  if (daysDiff < 30) return `${daysDiff}d ago`;
  return date.toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ------------------------------------------------------------------
// Tab button component
// ------------------------------------------------------------------

const TabButton: React.FC<{
  tab: TabType;
  activeTab: TabType;
  label: string;
  icon: React.ReactNode;
  count: number;
  onClick: (tab: TabType) => void;
}> = ({ tab, activeTab, label, icon, count, onClick }) => (
  <button
    onClick={() => onClick(tab)}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      activeTab === tab
        ? 'bg-[#E40000] text-gray-900 dark:text-white'
        : 'bg-gray-100 dark:bg-[#22272B] text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-[#2A3035]'
    }`}
  >
    {icon}
    {label}
    <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
      activeTab === tab ? 'bg-gray-200 dark:bg-white/20' : 'bg-[#2A3035]'
    }`}>
      {count}
    </span>
  </button>
);

// ------------------------------------------------------------------
// Main component
// ------------------------------------------------------------------

const FamiliesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('enrollments');
  const [enrollments, setEnrollments] = useState(mockEnrollments);
  const [consentRequests, setConsentRequests] = useState(mockConsent);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleApproveEnrollment = (id: string) => {
    setEnrollments((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: 'approved' as const } : e))
    );
    showToast('Enrollment approved', 'success');
  };

  const handleRejectEnrollment = (id: string) => {
    setEnrollments((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: 'rejected' as const } : e))
    );
    showToast('Enrollment rejected', 'success');
  };

  const handleApproveConsent = (id: string) => {
    setConsentRequests((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'approved' as const } : c))
    );
    showToast('Consent approved', 'success');
  };

  const handleDenyConsent = (id: string) => {
    setConsentRequests((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'denied' as const } : c))
    );
    showToast('Consent denied', 'success');
  };

  const pendingEnrollments = enrollments.filter((e) => e.status === 'pending');
  const pendingConsent = consentRequests.filter((c) => c.status === 'pending');

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <AdminPageHeader
          title="Families"
          subtitle="Manage enrollments, consent requests, and parent-child links"
          breadcrumbs={[{ label: 'Families' }]}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 dark:text-white/60 text-sm">Pending Enrollments</span>
              <UserPlus className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingEnrollments.length}</p>
            <p className="text-xs text-gray-400 dark:text-white/40 mt-1">Awaiting admin review</p>
          </div>
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 dark:text-white/60 text-sm">Consent Queue</span>
              <FileCheck className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingConsent.length}</p>
            <p className="text-xs text-gray-400 dark:text-white/40 mt-1">Pending parent consent</p>
          </div>
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 dark:text-white/60 text-sm">Parent-Child Links</span>
              <Link2 className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockLinks.length}</p>
            <p className="text-xs text-gray-400 dark:text-white/40 mt-1">
              {mockLinks.filter((l) => l.verified).length} verified
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <TabButton tab="enrollments" activeTab={activeTab} label="Pending Enrollments" icon={<UserPlus className="w-4 h-4" />} count={pendingEnrollments.length} onClick={setActiveTab} />
          <TabButton tab="consent" activeTab={activeTab} label="Consent Queue" icon={<FileCheck className="w-4 h-4" />} count={pendingConsent.length} onClick={setActiveTab} />
          <TabButton tab="links" activeTab={activeTab} label="Parent-Child Links" icon={<Link2 className="w-4 h-4" />} count={mockLinks.length} onClick={setActiveTab} />
        </div>

        {/* Search (for links tab) */}
        {activeTab === 'links' && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40" />
            <input
              type="text"
              placeholder="Search by parent name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg text-gray-900 dark:text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#E40000]/50 transition-colors"
            />
          </div>
        )}

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Pending Enrollments Tab */}
          {activeTab === 'enrollments' && (
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl overflow-hidden">
              {pendingEnrollments.length === 0 ? (
                <div className="text-center py-16">
                  <UserPlus className="w-16 h-16 text-white/10 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Pending Enrollments</h3>
                  <p className="text-gray-400 dark:text-white/40 text-sm">All enrollment requests have been processed.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-[#22272B] text-left">
                        <th className="px-6 py-3 text-gray-500 dark:text-white/60 font-medium">Student</th>
                        <th className="px-6 py-3 text-gray-500 dark:text-white/60 font-medium">Parent</th>
                        <th className="px-6 py-3 text-gray-500 dark:text-white/60 font-medium">Grade</th>
                        <th className="px-6 py-3 text-gray-500 dark:text-white/60 font-medium">Documents</th>
                        <th className="px-6 py-3 text-gray-500 dark:text-white/60 font-medium">Requested</th>
                        <th className="px-6 py-3 text-gray-500 dark:text-white/60 font-medium">Status</th>
                        <th className="px-6 py-3 text-gray-500 dark:text-white/60 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enrollments.map((enrollment) => (
                        <tr
                          key={enrollment.id}
                          className="border-b border-gray-200 dark:border-[#22272B]/50 hover:bg-[#1E2327] transition-colors"
                        >
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#22272B] flex items-center justify-center text-gray-500 dark:text-white/60 text-xs font-bold uppercase">
                                {enrollment.student_name.slice(0, 2)}
                              </div>
                              <div>
                                <span className="text-gray-900 dark:text-white font-medium">{enrollment.student_name}</span>
                                <p className="text-[11px] text-gray-400 dark:text-white/30 mt-0.5 max-w-[200px] truncate">{enrollment.notes}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-3 text-gray-500 dark:text-white/60">{enrollment.parent_name}</td>
                          <td className="px-6 py-3 text-gray-500 dark:text-white/60">{enrollment.grade_level}</td>
                          <td className="px-6 py-3">
                            <span className={`inline-flex items-center gap-1 text-xs ${
                              enrollment.documents_submitted
                                ? 'text-emerald-400'
                                : 'text-orange-400'
                            }`}>
                              {enrollment.documents_submitted ? (
                                <CheckCircle className="w-3.5 h-3.5" />
                              ) : (
                                <Clock className="w-3.5 h-3.5" />
                              )}
                              {enrollment.documents_submitted ? 'Complete' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-gray-400 dark:text-white/40 text-xs">{timeAgo(enrollment.requested_at)}</td>
                          <td className="px-6 py-3">
                            {enrollment.status === 'pending' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                                <Clock className="w-3 h-3" />
                                Pending
                              </span>
                            ) : enrollment.status === 'approved' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                <CheckCircle className="w-3 h-3" />
                                Approved
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                                <XCircle className="w-3 h-3" />
                                Rejected
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-3">
                            <div className="flex items-center justify-end gap-1">
                              {enrollment.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleApproveEnrollment(enrollment.id)}
                                    className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-gray-500 dark:text-white/50 hover:text-emerald-400 transition-colors"
                                    title="Approve"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleRejectEnrollment(enrollment.id)}
                                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 dark:text-white/50 hover:text-red-400 transition-colors"
                                    title="Reject"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              <button
                                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#22272B] text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white transition-colors"
                                title="View details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Consent Queue Tab */}
          {activeTab === 'consent' && (
            <div className="space-y-3">
              {pendingConsent.length === 0 ? (
                <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl text-center py-16">
                  <FileCheck className="w-16 h-16 text-white/10 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Pending Consent Requests</h3>
                  <p className="text-gray-400 dark:text-white/40 text-sm">All consent requests have been addressed.</p>
                </div>
              ) : (
                consentRequests.map((consent) => (
                  <motion.div
                    key={consent.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-white dark:bg-[#181C1F] border rounded-xl p-5 ${
                      consent.status === 'pending'
                        ? 'border-gray-200 dark:border-[#22272B]'
                        : consent.status === 'approved'
                        ? 'border-emerald-500/20 opacity-60'
                        : 'border-red-500/20 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                        <FileCheck className="w-5 h-5 text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{consent.consent_type}</h4>
                          {consent.status === 'pending' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                              Pending
                            </span>
                          ) : consent.status === 'approved' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Approved
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                              Denied
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-white/50">{consent.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 dark:text-white/30">
                          <span>Parent: <span className="text-gray-500 dark:text-white/50">{consent.parent_name}</span></span>
                          <span>Student: <span className="text-gray-500 dark:text-white/50">{consent.student_name}</span></span>
                          <span>{timeAgo(consent.requested_at)}</span>
                        </div>
                      </div>
                      {consent.status === 'pending' && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => handleApproveConsent(consent.id)}
                            className="p-2 rounded-lg hover:bg-emerald-500/10 text-gray-400 dark:text-white/40 hover:text-emerald-400 transition-colors"
                            title="Approve consent"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDenyConsent(consent.id)}
                            className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 dark:text-white/40 hover:text-red-400 transition-colors"
                            title="Deny consent"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}

          {/* Parent-Child Links Tab */}
          {activeTab === 'links' && (
            <div className="space-y-4">
              {mockLinks
                .filter((link) => {
                  if (!search) return true;
                  const q = search.toLowerCase();
                  return (
                    link.parent_name.toLowerCase().includes(q) ||
                    link.parent_email.toLowerCase().includes(q)
                  );
                })
                .map((link) => (
                  <div
                    key={link.id}
                    className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#22272B] flex items-center justify-center text-gray-500 dark:text-white/60 text-sm font-bold uppercase">
                          {link.parent_name.slice(0, 2)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{link.parent_name}</h4>
                            {link.verified ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                Verified
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                                Unverified
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 dark:text-white/40 mt-0.5">{link.parent_email}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 dark:text-white/30">
                        Linked {timeAgo(link.linked_at)}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {link.children.map((child) => (
                        <div
                          key={child.name}
                          className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-lg"
                        >
                          <Users className="w-3.5 h-3.5 text-gray-400 dark:text-white/30" />
                          <span className="text-sm text-gray-600 dark:text-white/70">{child.name}</span>
                          <span className="text-[10px] text-gray-400 dark:text-white/40 bg-gray-100 dark:bg-[#22272B] px-1.5 py-0.5 rounded">
                            {child.grade}
                          </span>
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              child.status === 'active' ? 'bg-emerald-400' : 'bg-red-400'
                            }`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </motion.div>

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 animate-slide-in-bottom">
            <div
              className={`flex items-center gap-3 px-5 py-3 rounded-lg shadow-xl ${
                toast.type === 'success'
                  ? 'bg-emerald-500 text-gray-900 dark:text-white'
                  : 'bg-red-500 text-gray-900 dark:text-white'
              }`}
            >
              {toast.type === 'success' ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <p className="text-sm font-medium">{toast.message}</p>
            </div>
          </div>
        )}
      </motion.div>
    </>
  );
};

export default FamiliesPage;
