import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  ClipboardCheck,
  Clock,
  AlertTriangle,
  FileText,
  Eye,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  RefreshCw,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import AdminPageHeader from '../../components/admin/shared/AdminPageHeader';
import AdminStatsCard from '../../components/admin/shared/AdminStatsCard';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type TabKey = 'overrides' | 'rubrics';
type OverrideStatus = 'pending' | 'approved' | 'rejected';

interface GradeOverride {
  id: string;
  student_name: string;
  student_id: string;
  course: string;
  assessment_title: string;
  original_grade: string;
  requested_grade: string;
  reason: string;
  requested_by: string;
  requested_at: string;
  status: OverrideStatus;
}

interface RubricTemplate {
  id: string;
  name: string;
  assessment_type: string;
  criteria_count: number;
  grade_levels: string;
  last_updated: string;
  usage_count: number;
}

/* ------------------------------------------------------------------ */
/* Mock data                                                           */
/* ------------------------------------------------------------------ */

const MOCK_OVERRIDES: GradeOverride[] = [
  { id: 'go1', student_name: 'Amina Hassan', student_id: 'STU-001', course: 'CBC Mathematics', assessment_title: 'Term 2 Exam', original_grade: 'C+', requested_grade: 'B', reason: 'Student was unwell during exam; re-sat and scored higher', requested_by: 'David Ochieng (Instructor)', requested_at: '2026-02-10', status: 'pending' },
  { id: 'go2', student_name: 'Brian Kipchoge', student_id: 'STU-045', course: 'English Language Arts', assessment_title: 'Essay Assignment 3', original_grade: 'D', requested_grade: 'C', reason: 'Marking error identified on question 4; rubric misapplied', requested_by: 'Diana Chebet (Instructor)', requested_at: '2026-02-08', status: 'pending' },
  { id: 'go3', student_name: 'Catherine Wanjiru', student_id: 'STU-112', course: 'Science & Technology', assessment_title: 'Lab Practical', original_grade: 'B-', requested_grade: 'B+', reason: 'Equipment malfunction during practical affected results', requested_by: 'Mary Akinyi (Instructor)', requested_at: '2026-02-05', status: 'pending' },
  { id: 'go4', student_name: 'Daniel Omondi', student_id: 'STU-078', course: 'Kiswahili Grammar', assessment_title: 'Insha Writing', original_grade: 'C', requested_grade: 'B-', reason: 'Parent appeal: additional context provided for narrative topic', requested_by: 'Jane Wanjiku (Instructor)', requested_at: '2026-01-28', status: 'approved' },
  { id: 'go5', student_name: 'Esther Nyambura', student_id: 'STU-034', course: 'Social Studies', assessment_title: 'Project Presentation', original_grade: 'B', requested_grade: 'A-', reason: 'Group contribution was not fairly assessed', requested_by: 'Michael Oduor (Instructor)', requested_at: '2026-01-25', status: 'rejected' },
  { id: 'go6', student_name: 'Felix Maina', student_id: 'STU-156', course: 'Digital Literacy', assessment_title: 'Coding Project', original_grade: 'C+', requested_grade: 'B+', reason: 'Technical submission issue; code was functional but file corrupted', requested_by: 'Sarah Njeri (Instructor)', requested_at: '2026-02-12', status: 'pending' },
];

const MOCK_RUBRICS: RubricTemplate[] = [
  { id: 'r1', name: 'CBC Standard Assessment Rubric', assessment_type: 'Exam', criteria_count: 5, grade_levels: 'Grade 1-9', last_updated: '2026-01-15', usage_count: 234 },
  { id: 'r2', name: 'Project-Based Learning Rubric', assessment_type: 'Project', criteria_count: 8, grade_levels: 'Grade 4-9', last_updated: '2025-12-20', usage_count: 89 },
  { id: 'r3', name: 'Essay & Writing Rubric', assessment_type: 'Assignment', criteria_count: 6, grade_levels: 'Grade 3-9', last_updated: '2025-11-10', usage_count: 156 },
  { id: 'r4', name: 'Practical Lab Assessment', assessment_type: 'Practical', criteria_count: 7, grade_levels: 'Grade 5-9', last_updated: '2026-01-05', usage_count: 67 },
  { id: 'r5', name: 'Oral Presentation Rubric', assessment_type: 'Presentation', criteria_count: 5, grade_levels: 'Grade 2-9', last_updated: '2025-10-22', usage_count: 112 },
  { id: 'r6', name: 'Lower Primary Activity Rubric', assessment_type: 'Activity', criteria_count: 4, grade_levels: 'Grade 1-3', last_updated: '2026-02-01', usage_count: 198 },
];

/* ------------------------------------------------------------------ */
/* Badge helpers                                                       */
/* ------------------------------------------------------------------ */

const overrideStatusStyles: Record<OverrideStatus, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  approved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const OverrideStatusBadge: React.FC<{ status: OverrideStatus }> = ({ status }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${overrideStatusStyles[status]}`}
  >
    {status}
  </span>
);

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' });

const TAB_CONFIG: { key: TabKey; label: string }[] = [
  { key: 'overrides', label: 'Grade Overrides' },
  { key: 'rubrics', label: 'Rubric Management' },
];

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const AssessmentsAdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('overrides');
  const [search, setSearch] = useState('');

  const pendingOverrides = MOCK_OVERRIDES.filter((o) => o.status === 'pending');
  const totalAssessments = 1847; // Mock total
  const totalOverrides = MOCK_OVERRIDES.length;

  const filteredOverrides = MOCK_OVERRIDES.filter((o) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      o.student_name.toLowerCase().includes(q) ||
      o.course.toLowerCase().includes(q) ||
      o.assessment_title.toLowerCase().includes(q)
    );
  });

  const filteredRubrics = MOCK_RUBRICS.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return r.name.toLowerCase().includes(q) || r.assessment_type.toLowerCase().includes(q);
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <DashboardLayout role="admin">
      <motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <AdminPageHeader
          title="Assessment Management"
          subtitle="Grade overrides, rubric templates, and assessment administration"
          breadcrumbs={[
            { label: 'Content & Learning', path: '/dashboard/admin' },
            { label: 'Assessments' },
          ]}
          actions={
            <button className="flex items-center gap-2 px-3 py-2 text-sm bg-[#22272B] border border-[#333] rounded-lg text-white/70 hover:text-white hover:border-[#444] transition-colors">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          }
        />

        {/* Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminStatsCard
            title="Total Assessments"
            value={totalAssessments.toLocaleString()}
            icon={<ClipboardCheck className="w-5 h-5" />}
            trend={{ value: 14, label: 'vs last term', direction: 'up' }}
          />
          <AdminStatsCard
            title="Pending Overrides"
            value={pendingOverrides.length}
            icon={<Clock className="w-5 h-5" />}
            subtitle="Awaiting admin review"
          />
          <AdminStatsCard
            title="Total Override Requests"
            value={totalOverrides}
            icon={<AlertTriangle className="w-5 h-5" />}
            trend={{ value: 2, label: 'vs last month', direction: 'up' }}
          />
          <AdminStatsCard
            title="Rubric Templates"
            value={MOCK_RUBRICS.length}
            icon={<FileText className="w-5 h-5" />}
            subtitle="Active templates in use"
          />
        </motion.div>

        {/* Tabs */}
        <motion.div variants={itemVariants} className="flex items-center gap-1 border-b border-[#22272B]">
          {TAB_CONFIG.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setSearch(''); }}
              className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
                activeTab === tab.key
                  ? 'text-white'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              {tab.label}
              {tab.key === 'overrides' && pendingOverrides.length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-[#E40000] text-white rounded-full">
                  {pendingOverrides.length}
                </span>
              )}
              {activeTab === tab.key && (
                <motion.div
                  layoutId="assessments-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E40000]"
                />
              )}
            </button>
          ))}
        </motion.div>

        {/* Search */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder={activeTab === 'overrides' ? 'Search by student, course, or assessment...' : 'Search rubric templates...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#181C1F] border border-[#22272B] rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#E40000]/50 transition-colors"
            />
          </div>
        </motion.div>

        {/* Grade Overrides Tab */}
        {activeTab === 'overrides' && (
          <motion.div
            variants={itemVariants}
            className="bg-[#181C1F] border border-[#22272B] rounded-xl overflow-hidden"
          >
            {filteredOverrides.length === 0 ? (
              <div className="text-center py-16">
                <ClipboardCheck className="w-16 h-16 text-white/10 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Override Requests</h3>
                <p className="text-white/40 text-sm">No grade override requests match your criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#22272B] text-left">
                      <th className="px-4 py-3 text-white/60 font-medium">Student</th>
                      <th className="px-4 py-3 text-white/60 font-medium">Course / Assessment</th>
                      <th className="px-4 py-3 text-white/60 font-medium text-center">Original</th>
                      <th className="px-4 py-3 text-white/60 font-medium text-center">Requested</th>
                      <th className="px-4 py-3 text-white/60 font-medium">Reason</th>
                      <th className="px-4 py-3 text-white/60 font-medium">Status</th>
                      <th className="px-4 py-3 text-white/60 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOverrides.map((ov) => (
                      <tr
                        key={ov.id}
                        className="border-b border-[#22272B]/50 hover:bg-[#1E2327] transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div>
                            <span className="text-white font-medium">{ov.student_name}</span>
                            <p className="text-gray-400 text-xs mt-0.5">{ov.student_id}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <span className="text-gray-300">{ov.course}</span>
                            <p className="text-gray-400 text-xs mt-0.5">{ov.assessment_title}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-red-400 font-medium">{ov.original_grade}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-emerald-400 font-medium">{ov.requested_grade}</span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-gray-400 text-xs max-w-[240px] truncate" title={ov.reason}>
                            {ov.reason}
                          </p>
                          <p className="text-gray-500 text-[10px] mt-0.5">
                            by {ov.requested_by} &middot; {formatDate(ov.requested_at)}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <OverrideStatusBadge status={ov.status} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              title="View Details"
                              className="p-1.5 rounded-lg hover:bg-[#22272B] text-white/50 hover:text-white transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {ov.status === 'pending' && (
                              <>
                                <button
                                  title="Approve"
                                  className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-white/50 hover:text-emerald-400 transition-colors"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  title="Reject"
                                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/50 hover:text-red-400 transition-colors"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {filteredOverrides.length > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-[#22272B]">
                <p className="text-xs text-white/40">
                  Showing {filteredOverrides.length} override request{filteredOverrides.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Rubric Management Tab */}
        {activeTab === 'rubrics' && (
          <motion.div
            variants={itemVariants}
            className="bg-[#181C1F] border border-[#22272B] rounded-xl overflow-hidden"
          >
            {filteredRubrics.length === 0 ? (
              <div className="text-center py-16">
                <FileText className="w-16 h-16 text-white/10 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Rubrics Found</h3>
                <p className="text-white/40 text-sm">No rubric templates match your search.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#22272B] text-left">
                      <th className="px-4 py-3 text-white/60 font-medium">Rubric Name</th>
                      <th className="px-4 py-3 text-white/60 font-medium">Assessment Type</th>
                      <th className="px-4 py-3 text-white/60 font-medium text-center">Criteria</th>
                      <th className="px-4 py-3 text-white/60 font-medium">Grade Levels</th>
                      <th className="px-4 py-3 text-white/60 font-medium">Last Updated</th>
                      <th className="px-4 py-3 text-white/60 font-medium text-center">Usage</th>
                      <th className="px-4 py-3 text-white/60 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRubrics.map((rubric) => (
                      <tr
                        key={rubric.id}
                        className="border-b border-[#22272B]/50 hover:bg-[#1E2327] transition-colors"
                      >
                        <td className="px-4 py-3">
                          <span className="text-white font-medium">{rubric.name}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-blue-500/20 text-blue-400 border-blue-500/30">
                            {rubric.assessment_type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-gray-300">{rubric.criteria_count}</td>
                        <td className="px-4 py-3 text-gray-400">{rubric.grade_levels}</td>
                        <td className="px-4 py-3 text-gray-400">{formatDate(rubric.last_updated)}</td>
                        <td className="px-4 py-3 text-center text-gray-300">{rubric.usage_count}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              title="View"
                              className="p-1.5 rounded-lg hover:bg-[#22272B] text-white/50 hover:text-white transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              title="More"
                              className="p-1.5 rounded-lg hover:bg-[#22272B] text-white/50 hover:text-white transition-colors"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {filteredRubrics.length > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-[#22272B]">
                <p className="text-xs text-white/40">
                  Showing {filteredRubrics.length} rubric template{filteredRubrics.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default AssessmentsAdminPage;
