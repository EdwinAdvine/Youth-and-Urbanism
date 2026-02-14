import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Award,
  CheckCircle2,
  XCircle,
  FileText,
  Eye,
  Download,
  MoreHorizontal,
  Plus,
  Ban,
} from 'lucide-react';
import AdminPageHeader from '../../components/admin/shared/AdminPageHeader';
import AdminStatsCard from '../../components/admin/shared/AdminStatsCard';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type TabKey = 'issuance' | 'templates' | 'revoked';
type CertificateStatus = 'active' | 'revoked' | 'expired';

interface Certificate {
  id: string;
  student_name: string;
  student_id: string;
  course: string;
  issued_at: string;
  certificate_number: string;
  status: CertificateStatus;
  grade_achieved: string;
}

interface CertificateTemplate {
  id: string;
  name: string;
  description: string;
  course_type: string;
  created_at: string;
  usage_count: number;
  is_active: boolean;
}

/* ------------------------------------------------------------------ */
/* Mock data                                                           */
/* ------------------------------------------------------------------ */

const MOCK_CERTIFICATES: Certificate[] = [
  { id: 'cert1', student_name: 'Amina Hassan', student_id: 'STU-001', course: 'CBC Mathematics - Fractions', issued_at: '2026-01-15', certificate_number: 'TUHS-2026-0001', status: 'active', grade_achieved: 'A-' },
  { id: 'cert2', student_name: 'Brian Kipchoge', student_id: 'STU-045', course: 'Introduction to Kiswahili Grammar', issued_at: '2026-01-12', certificate_number: 'TUHS-2026-0002', status: 'active', grade_achieved: 'B+' },
  { id: 'cert3', student_name: 'Catherine Wanjiru', student_id: 'STU-112', course: 'Digital Literacy Basics', issued_at: '2025-12-20', certificate_number: 'TUHS-2025-0148', status: 'active', grade_achieved: 'A' },
  { id: 'cert4', student_name: 'Daniel Omondi', student_id: 'STU-078', course: 'English Language Arts', issued_at: '2025-12-18', certificate_number: 'TUHS-2025-0145', status: 'revoked', grade_achieved: 'B' },
  { id: 'cert5', student_name: 'Esther Nyambura', student_id: 'STU-034', course: 'Environmental Science', issued_at: '2025-11-30', certificate_number: 'TUHS-2025-0132', status: 'active', grade_achieved: 'B+' },
  { id: 'cert6', student_name: 'Felix Maina', student_id: 'STU-156', course: 'Creative Arts & Design', issued_at: '2025-11-22', certificate_number: 'TUHS-2025-0128', status: 'active', grade_achieved: 'A-' },
  { id: 'cert7', student_name: 'Grace Atieno', student_id: 'STU-089', course: 'Science & Technology', issued_at: '2025-11-15', certificate_number: 'TUHS-2025-0120', status: 'revoked', grade_achieved: 'C+' },
  { id: 'cert8', student_name: 'Henry Wafula', student_id: 'STU-201', course: 'Social Studies - History', issued_at: '2026-02-05', certificate_number: 'TUHS-2026-0015', status: 'active', grade_achieved: 'B' },
  { id: 'cert9', student_name: 'Irene Chebet', student_id: 'STU-067', course: 'Religious Education', issued_at: '2026-02-01', certificate_number: 'TUHS-2026-0012', status: 'active', grade_achieved: 'A' },
  { id: 'cert10', student_name: 'James Kamau', student_id: 'STU-143', course: 'Physical Education', issued_at: '2025-10-28', certificate_number: 'TUHS-2025-0105', status: 'expired', grade_achieved: 'B-' },
];

const MOCK_TEMPLATES: CertificateTemplate[] = [
  { id: 't1', name: 'CBC Course Completion', description: 'Standard certificate for completing a CBC-aligned course', course_type: 'All Courses', created_at: '2025-08-01', usage_count: 456, is_active: true },
  { id: 't2', name: 'Grade Level Achievement', description: 'Awarded upon completing all courses for a grade level', course_type: 'Grade Completion', created_at: '2025-08-01', usage_count: 89, is_active: true },
  { id: 't3', name: 'Excellence Award', description: 'Special recognition for outstanding academic performance', course_type: 'Merit Award', created_at: '2025-09-15', usage_count: 34, is_active: true },
  { id: 't4', name: 'Digital Skills Certification', description: 'Digital literacy and ICT skills certification', course_type: 'Digital Literacy', created_at: '2025-10-01', usage_count: 67, is_active: true },
  { id: 't5', name: 'Workshop Participation', description: 'Certificate of participation for workshops and seminars', course_type: 'Workshop', created_at: '2025-11-10', usage_count: 23, is_active: false },
];

/* ------------------------------------------------------------------ */
/* Badge helpers                                                       */
/* ------------------------------------------------------------------ */

const certStatusStyles: Record<CertificateStatus, string> = {
  active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  revoked: 'bg-red-500/20 text-red-400 border-red-500/30',
  expired: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

const CertStatusBadge: React.FC<{ status: CertificateStatus }> = ({ status }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${certStatusStyles[status]}`}
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
  { key: 'issuance', label: 'Issuance Log' },
  { key: 'templates', label: 'Templates' },
  { key: 'revoked', label: 'Revoked' },
];

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const CertificatesAdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('issuance');
  const [search, setSearch] = useState('');

  const totalIssued = MOCK_CERTIFICATES.length;
  const activeCerts = MOCK_CERTIFICATES.filter((c) => c.status === 'active').length;
  const revokedCerts = MOCK_CERTIFICATES.filter((c) => c.status === 'revoked').length;
  const templateCount = MOCK_TEMPLATES.filter((t) => t.is_active).length;

  const getFilteredCerts = () => {
    let certs = MOCK_CERTIFICATES;
    if (activeTab === 'revoked') {
      certs = certs.filter((c) => c.status === 'revoked');
    }
    if (search) {
      const q = search.toLowerCase();
      certs = certs.filter(
        (c) =>
          c.student_name.toLowerCase().includes(q) ||
          c.course.toLowerCase().includes(q) ||
          c.certificate_number.toLowerCase().includes(q)
      );
    }
    return certs;
  };

  const filteredCerts = getFilteredCerts();

  const filteredTemplates = MOCK_TEMPLATES.filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
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
    <>
      <motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <AdminPageHeader
          title="Certificate Management"
          subtitle="Issue, track, and manage student certificates"
          breadcrumbs={[
            { label: 'Content & Learning', path: '/dashboard/admin' },
            { label: 'Certificates' },
          ]}
          actions={
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-[#444] transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-sm bg-[#E40000] text-gray-900 dark:text-white rounded-lg hover:bg-[#C00] transition-colors">
                <Plus className="w-4 h-4" />
                Issue Certificate
              </button>
            </div>
          }
        />

        {/* Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminStatsCard
            title="Total Issued"
            value={totalIssued}
            icon={<Award className="w-5 h-5" />}
            trend={{ value: 18, label: 'vs last term', direction: 'up' }}
          />
          <AdminStatsCard
            title="Active Certificates"
            value={activeCerts}
            icon={<CheckCircle2 className="w-5 h-5" />}
            trend={{ value: 12, label: 'vs last month', direction: 'up' }}
          />
          <AdminStatsCard
            title="Revoked"
            value={revokedCerts}
            icon={<XCircle className="w-5 h-5" />}
            subtitle="Certificates revoked or invalidated"
          />
          <AdminStatsCard
            title="Active Templates"
            value={templateCount}
            icon={<FileText className="w-5 h-5" />}
            subtitle="Certificate templates in use"
          />
        </motion.div>

        {/* Tabs */}
        <motion.div variants={itemVariants} className="flex items-center gap-1 border-b border-gray-200 dark:border-[#22272B]">
          {TAB_CONFIG.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setSearch(''); }}
              className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
                activeTab === tab.key
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/70'
              }`}
            >
              {tab.label}
              {tab.key === 'revoked' && revokedCerts > 0 && (
                <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-red-500/80 text-gray-900 dark:text-white rounded-full">
                  {revokedCerts}
                </span>
              )}
              {activeTab === tab.key && (
                <motion.div
                  layoutId="certificates-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E40000]"
                />
              )}
            </button>
          ))}
        </motion.div>

        {/* Search */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40" />
            <input
              type="text"
              placeholder={
                activeTab === 'templates'
                  ? 'Search templates...'
                  : 'Search by student, course, or certificate number...'
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg text-gray-900 dark:text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#E40000]/50 transition-colors"
            />
          </div>
        </motion.div>

        {/* Issuance Log / Revoked Tab */}
        {(activeTab === 'issuance' || activeTab === 'revoked') && (
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl overflow-hidden"
          >
            {filteredCerts.length === 0 ? (
              <div className="text-center py-16">
                <Award className="w-16 h-16 text-white/10 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Certificates Found</h3>
                <p className="text-gray-400 dark:text-white/40 text-sm">
                  {activeTab === 'revoked'
                    ? 'No revoked certificates to display.'
                    : 'No certificates match your search criteria.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-[#22272B] text-left">
                      <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Student</th>
                      <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Course</th>
                      <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Certificate No.</th>
                      <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium text-center">Grade</th>
                      <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Issued</th>
                      <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Status</th>
                      <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCerts.map((cert) => (
                      <tr
                        key={cert.id}
                        className="border-b border-gray-200 dark:border-[#22272B]/50 hover:bg-[#1E2327] transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div>
                            <span className="text-gray-900 dark:text-white font-medium">{cert.student_name}</span>
                            <p className="text-gray-400 text-xs mt-0.5">{cert.student_id}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-400 dark:text-gray-300">{cert.course}</td>
                        <td className="px-4 py-3">
                          <span className="text-gray-100 font-mono text-xs">{cert.certificate_number}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-gray-900 dark:text-white font-medium">{cert.grade_achieved}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-400">{formatDate(cert.issued_at)}</td>
                        <td className="px-4 py-3">
                          <CertStatusBadge status={cert.status} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              title="View"
                              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#22272B] text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              title="Download"
                              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#22272B] text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            {cert.status === 'active' && (
                              <button
                                title="Revoke"
                                className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 dark:text-white/50 hover:text-red-400 transition-colors"
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {filteredCerts.length > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-[#22272B]">
                <p className="text-xs text-gray-400 dark:text-white/40">
                  Showing {filteredCerts.length} certificate{filteredCerts.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl overflow-hidden"
          >
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-16">
                <FileText className="w-16 h-16 text-white/10 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Templates Found</h3>
                <p className="text-gray-400 dark:text-white/40 text-sm">No certificate templates match your search.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-[#22272B] text-left">
                      <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Template Name</th>
                      <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Description</th>
                      <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Course Type</th>
                      <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Created</th>
                      <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium text-center">Usage</th>
                      <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium text-center">Status</th>
                      <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTemplates.map((tmpl) => (
                      <tr
                        key={tmpl.id}
                        className="border-b border-gray-200 dark:border-[#22272B]/50 hover:bg-[#1E2327] transition-colors"
                      >
                        <td className="px-4 py-3">
                          <span className="text-gray-900 dark:text-white font-medium">{tmpl.name}</span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-gray-400 text-xs max-w-[280px] truncate">{tmpl.description}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-purple-500/20 text-purple-400 border-purple-500/30">
                            {tmpl.course_type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-400">{formatDate(tmpl.created_at)}</td>
                        <td className="px-4 py-3 text-center text-gray-400 dark:text-gray-300">{tmpl.usage_count}</td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                              tmpl.is_active
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${tmpl.is_active ? 'bg-emerald-400' : 'bg-gray-400'}`} />
                            {tmpl.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              title="View"
                              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#22272B] text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              title="More"
                              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#22272B] text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white transition-colors"
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

            {filteredTemplates.length > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-[#22272B]">
                <p className="text-xs text-gray-400 dark:text-white/40">
                  Showing {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </>
  );
};

export default CertificatesAdminPage;
