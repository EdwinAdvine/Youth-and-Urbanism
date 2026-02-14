import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  TrendingUp,
  UserPlus,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Bell,
  Search,
  Filter,
} from 'lucide-react';

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

type EnrollmentStatus = 'active' | 'pending_consent' | 'paused';
type ConsentStatus = 'granted' | 'pending' | 'revoked';

interface Enrollment {
  id: string;
  childName: string;
  program: string;
  status: EnrollmentStatus;
  consentStatus: ConsentStatus;
  enrolledDate: string;
}

const mockEnrollments: Enrollment[] = [
  { id: '1', childName: 'Amara Ochieng', program: 'Primary Mathematics', status: 'active', consentStatus: 'granted', enrolledDate: '2026-01-15' },
  { id: '2', childName: 'Brian Kamau', program: 'Science Explorer', status: 'pending_consent', consentStatus: 'pending', enrolledDate: '2026-02-10' },
  { id: '3', childName: 'Cynthia Wanjiku', program: 'English Literacy', status: 'active', consentStatus: 'granted', enrolledDate: '2025-11-20' },
  { id: '4', childName: 'David Mwangi', program: 'Creative Arts', status: 'paused', consentStatus: 'revoked', enrolledDate: '2025-09-05' },
  { id: '5', childName: 'Esther Akinyi', program: 'Kiswahili Mastery', status: 'pending_consent', consentStatus: 'pending', enrolledDate: '2026-02-12' },
  { id: '6', childName: 'Felix Njoroge', program: 'Social Studies', status: 'active', consentStatus: 'granted', enrolledDate: '2025-12-01' },
  { id: '7', childName: 'Grace Nyambura', program: 'Primary Mathematics', status: 'active', consentStatus: 'granted', enrolledDate: '2026-01-28' },
  { id: '8', childName: 'Hassan Ali', program: 'Science Explorer', status: 'pending_consent', consentStatus: 'pending', enrolledDate: '2026-02-13' },
];

const stats = [
  { label: 'Total Enrolled', value: '247', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { label: 'Pending Consent', value: '12', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { label: 'Consent Rate', value: '95%', icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10' },
  { label: 'Recently Added', value: '8', icon: UserPlus, color: 'text-red-400', bg: 'bg-red-500/10' },
];

type TabKey = 'all' | 'pending' | 'recent';

const tabs: { key: TabKey; label: string }[] = [
  { key: 'all', label: 'All Enrollments' },
  { key: 'pending', label: 'Pending Consent' },
  { key: 'recent', label: 'Recently Added' },
];

const statusBadge: Record<EnrollmentStatus, { label: string; cls: string }> = {
  active: { label: 'Active', cls: 'bg-green-500/10 text-green-400' },
  pending_consent: { label: 'Pending Consent', cls: 'bg-amber-500/10 text-amber-400' },
  paused: { label: 'Paused', cls: 'bg-red-500/10 text-red-400' },
};

const borderColor: Record<ConsentStatus, string> = {
  granted: 'border-l-green-500',
  pending: 'border-l-amber-500',
  revoked: 'border-l-red-500',
};

const EnrollmentsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEnrollments = mockEnrollments.filter((e) => {
    const matchesSearch =
      e.childName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.program.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (activeTab === 'pending') return e.consentStatus === 'pending';
    if (activeTab === 'recent') {
      const enrollDate = new Date(e.enrolledDate);
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      return enrollDate >= twoWeeksAgo;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F1112] p-6">
      <motion.div variants={stagger} initial="hidden" animate="visible" className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div variants={fadeUp}>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Enrollments & Consent Management</h1>
          <p className="text-gray-400 dark:text-white/40 mt-1">Track enrollments and manage parental consent workflows</p>
        </motion.div>

        {/* Stats Row */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5 flex items-center gap-4"
            >
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-gray-400 dark:text-white/40">{stat.label}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Tabs and Search */}
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex gap-1 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg p-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-red-500/10 text-red-400'
                    : 'text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/70'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40" />
            <input
              type="text"
              placeholder="Search enrollments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus:outline-none focus:border-red-500/50"
            />
          </div>
        </motion.div>

        {/* Table Header */}
        <motion.div variants={fadeUp} className="hidden lg:grid grid-cols-12 gap-4 px-5 py-3 text-xs font-medium text-gray-400 dark:text-white/40 uppercase tracking-wider">
          <div className="col-span-3">Child Name</div>
          <div className="col-span-2">Program</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Consent</div>
          <div className="col-span-1">Enrolled</div>
          <div className="col-span-2 text-right">Actions</div>
        </motion.div>

        {/* Enrollment Rows */}
        <motion.div variants={stagger} className="space-y-2">
          {filteredEnrollments.map((enrollment) => (
            <motion.div
              key={enrollment.id}
              variants={fadeUp}
              className={`bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl border-l-4 ${borderColor[enrollment.consentStatus]} p-5 lg:grid lg:grid-cols-12 lg:gap-4 lg:items-center space-y-3 lg:space-y-0`}
            >
              {/* Child Name */}
              <div className="col-span-3">
                <p className="text-gray-900 dark:text-white font-medium">{enrollment.childName}</p>
              </div>

              {/* Program */}
              <div className="col-span-2">
                <p className="text-gray-600 dark:text-white/70 text-sm">{enrollment.program}</p>
              </div>

              {/* Status */}
              <div className="col-span-2">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge[enrollment.status].cls}`}>
                  {statusBadge[enrollment.status].label}
                </span>
              </div>

              {/* Consent */}
              <div className="col-span-2 flex items-center gap-2">
                {enrollment.consentStatus === 'granted' ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-sm">Granted</span>
                  </>
                ) : enrollment.consentStatus === 'pending' ? (
                  <>
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-400 text-sm">Pending</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-red-400" />
                    <span className="text-red-400 text-sm">Revoked</span>
                  </>
                )}
              </div>

              {/* Enrolled Date */}
              <div className="col-span-1">
                <p className="text-gray-400 dark:text-white/40 text-sm">
                  {new Date(enrollment.enrolledDate).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                  })}
                </p>
              </div>

              {/* Actions */}
              <div className="col-span-2 flex items-center justify-end gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 dark:text-white/70 bg-gray-100 dark:bg-[#22272B] hover:bg-[#2a3035] transition-colors">
                  <Eye className="w-3.5 h-3.5" />
                  View
                </button>
                {enrollment.consentStatus === 'pending' && (
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors">
                    <Bell className="w-3.5 h-3.5" />
                    Send Reminder
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filteredEnrollments.length === 0 && (
          <motion.div variants={fadeUp} className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-12 text-center">
            <Filter className="w-10 h-10 text-gray-400 dark:text-white/20 mx-auto mb-3" />
            <p className="text-gray-400 dark:text-white/40">No enrollments match your current filters.</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default EnrollmentsPage;
