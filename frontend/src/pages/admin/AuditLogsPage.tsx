import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  RefreshCw,
  Search,
  Download,
  Filter,
  Users,
  Activity,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import AdminPageHeader from '../../components/admin/shared/AdminPageHeader';
import AdminStatsCard from '../../components/admin/shared/AdminStatsCard';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface AuditLog {
  id: string;
  timestamp: string;
  actor_email: string;
  actor_role: string;
  action: string;
  resource_type: string;
  resource_id: string;
  status: 'success' | 'failure' | 'warning';
  ip_address: string;
  details: string;
}

/* ------------------------------------------------------------------ */
/* Mock data                                                           */
/* ------------------------------------------------------------------ */

const MOCK_LOGS: AuditLog[] = [
  { id: 'AL-001', timestamp: '2025-01-15T10:45:00Z', actor_email: 'admin@urbanhomeschool.co.ke', actor_role: 'admin', action: 'user.update', resource_type: 'User', resource_id: 'USR-1234', status: 'success', ip_address: '102.89.45.12', details: 'Updated user role from student to instructor' },
  { id: 'AL-002', timestamp: '2025-01-15T10:30:00Z', actor_email: 'admin@urbanhomeschool.co.ke', actor_role: 'admin', action: 'config.update', resource_type: 'Config', resource_id: 'CFG-007', status: 'success', ip_address: '102.89.45.12', details: 'Changed AI content filter level to strict' },
  { id: 'AL-003', timestamp: '2025-01-15T10:15:00Z', actor_email: 'jane@example.com', actor_role: 'instructor', action: 'course.create', resource_type: 'Course', resource_id: 'CRS-0089', status: 'success', ip_address: '197.248.10.55', details: 'Created new course: Grade 4 Mathematics' },
  { id: 'AL-004', timestamp: '2025-01-15T09:50:00Z', actor_email: 'unknown@suspicious.com', actor_role: 'unknown', action: 'auth.login', resource_type: 'Auth', resource_id: '-', status: 'failure', ip_address: '45.33.22.11', details: 'Failed login attempt - invalid credentials (attempt 5)' },
  { id: 'AL-005', timestamp: '2025-01-15T09:30:00Z', actor_email: 'admin@urbanhomeschool.co.ke', actor_role: 'admin', action: 'user.deactivate', resource_type: 'User', resource_id: 'USR-0567', status: 'success', ip_address: '102.89.45.12', details: 'Deactivated user account for policy violation' },
  { id: 'AL-006', timestamp: '2025-01-15T09:00:00Z', actor_email: 'system@urbanhomeschool.co.ke', actor_role: 'system', action: 'backup.complete', resource_type: 'System', resource_id: 'BKP-20250115', status: 'success', ip_address: '127.0.0.1', details: 'Daily database backup completed successfully' },
  { id: 'AL-007', timestamp: '2025-01-15T08:45:00Z', actor_email: 'peter@example.com', actor_role: 'parent', action: 'payment.create', resource_type: 'Payment', resource_id: 'TXN-0023', status: 'success', ip_address: '197.248.55.90', details: 'Premium plan subscription payment via M-Pesa' },
  { id: 'AL-008', timestamp: '2025-01-15T08:30:00Z', actor_email: 'admin@urbanhomeschool.co.ke', actor_role: 'admin', action: 'provider.toggle', resource_type: 'AIProvider', resource_id: 'PROV-GROK', status: 'warning', ip_address: '102.89.45.12', details: 'Disabled Grok AI provider - API quota exceeded' },
  { id: 'AL-009', timestamp: '2025-01-15T08:00:00Z', actor_email: 'david@example.com', actor_role: 'student', action: 'assessment.submit', resource_type: 'Assessment', resource_id: 'ASM-0412', status: 'success', ip_address: '197.248.33.77', details: 'Submitted Grade 5 Science assessment - Score: 78%' },
  { id: 'AL-010', timestamp: '2025-01-15T07:30:00Z', actor_email: 'system@urbanhomeschool.co.ke', actor_role: 'system', action: 'cron.execute', resource_type: 'System', resource_id: 'CRON-CLEANUP', status: 'success', ip_address: '127.0.0.1', details: 'Expired session cleanup - removed 145 sessions' },
  { id: 'AL-011', timestamp: '2025-01-14T23:55:00Z', actor_email: 'unknown@bruteforce.net', actor_role: 'unknown', action: 'auth.login', resource_type: 'Auth', resource_id: '-', status: 'failure', ip_address: '185.220.101.34', details: 'Brute force attempt detected - IP blocked' },
  { id: 'AL-012', timestamp: '2025-01-14T22:00:00Z', actor_email: 'staff@urbanhomeschool.co.ke', actor_role: 'staff', action: 'ticket.resolve', resource_type: 'Ticket', resource_id: 'TK-0156', status: 'success', ip_address: '102.89.45.20', details: 'Resolved support ticket - billing inquiry' },
];

/* ------------------------------------------------------------------ */
/* Badge helpers                                                       */
/* ------------------------------------------------------------------ */

const statusColors: Record<string, string> = {
  success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  failure: 'bg-red-500/20 text-red-400 border-red-500/30',
  warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${
      statusColors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }`}
  >
    {status}
  </span>
);

const roleColors: Record<string, string> = {
  admin: 'bg-red-500/20 text-red-400 border-red-500/30',
  instructor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  student: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  parent: 'bg-green-500/20 text-green-400 border-green-500/30',
  staff: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  system: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  unknown: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const AuditLogsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Actor', 'Role', 'Action', 'Resource Type', 'Status', 'IP Address', 'Details'];
    const rows = MOCK_LOGS.map((log) => [
      log.timestamp,
      log.actor_email,
      log.actor_role,
      log.action,
      log.resource_type,
      log.status,
      log.ip_address,
      log.details,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'audit_logs.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 5;

  const filteredLogs = MOCK_LOGS.filter((log) => {
    if (statusFilter && log.status !== statusFilter) return false;
    if (
      search &&
      !log.actor_email.toLowerCase().includes(search.toLowerCase()) &&
      !log.action.toLowerCase().includes(search.toLowerCase()) &&
      !log.details.toLowerCase().includes(search.toLowerCase()) &&
      !log.resource_type.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    if (dateFrom) {
      const logDate = new Date(log.timestamp);
      const fromDate = new Date(dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      if (logDate < fromDate) return false;
    }
    if (dateTo) {
      const logDate = new Date(log.timestamp);
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      if (logDate > toDate) return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / logsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedLogs = filteredLogs.slice(
    (safePage - 1) * logsPerPage,
    safePage * logsPerPage
  );

  // Reset to page 1 when filters change
  const handleSearch = (value: string) => { setSearch(value); setCurrentPage(1); };
  const handleStatusFilter = (value: string) => { setStatusFilter(value); setCurrentPage(1); };
  const handleDateFrom = (value: string) => { setDateFrom(value); setCurrentPage(1); };
  const handleDateTo = (value: string) => { setDateTo(value); setCurrentPage(1); };

  const todayLogs = MOCK_LOGS.filter(
    (log) => new Date(log.timestamp).toDateString() === new Date('2025-01-15').toDateString()
  ).length;
  const uniqueActors = new Set(MOCK_LOGS.map((log) => log.actor_email)).size;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-16 bg-gray-100 dark:bg-[#22272B] rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-gray-100 dark:bg-[#22272B] rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-80 bg-gray-100 dark:bg-[#22272B] rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <AdminPageHeader
        title="Audit Logs"
        subtitle="Track all system actions and changes across the platform"
        breadcrumbs={[
          { label: 'Operations', path: '/dashboard/admin' },
          { label: 'Audit Logs' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-[#444] transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-[#444] transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        }
      />

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AdminStatsCard
          title="Total Logs"
          value={MOCK_LOGS.length.toLocaleString()}
          icon={<FileText className="w-5 h-5" />}
          subtitle="All time"
        />
        <AdminStatsCard
          title="Today's Actions"
          value={todayLogs}
          icon={<Activity className="w-5 h-5" />}
          trend={{ value: 8, label: 'vs yesterday', direction: 'up' }}
        />
        <AdminStatsCard
          title="Unique Actors"
          value={uniqueActors}
          icon={<Users className="w-5 h-5" />}
          subtitle="Distinct users with actions"
        />
      </motion.div>

      {/* Search & Filters */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40" />
          <input
            type="text"
            placeholder="Search by actor, action, or resource..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg text-gray-900 dark:text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#E40000]/50 transition-colors"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40" />
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="pl-10 pr-8 py-2.5 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg text-gray-900 dark:text-white text-sm appearance-none cursor-pointer focus:outline-none focus:border-[#E40000]/50 transition-colors min-w-[140px]"
          >
            <option value="">All Status</option>
            <option value="success">Success</option>
            <option value="failure">Failure</option>
            <option value="warning">Warning</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => handleDateFrom(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#E40000]/50 transition-colors"
              placeholder="From"
            />
          </div>
          <span className="text-gray-400 dark:text-white/30">-</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => handleDateTo(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#E40000]/50 transition-colors"
            placeholder="To"
          />
        </div>
      </motion.div>

      {/* Table */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-[#22272B] text-left">
                <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Timestamp</th>
                <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Actor</th>
                <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Action</th>
                <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Resource</th>
                <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Status</th>
                <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">IP Address</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <FileText className="w-12 h-12 text-white/10 mx-auto mb-3" />
                    <p className="text-gray-400 dark:text-white/40 text-sm">No audit logs found</p>
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-200 dark:border-[#22272B]/50 hover:bg-[#1E2327] transition-colors">
                    <td className="px-4 py-3 text-gray-500 dark:text-white/50 text-xs whitespace-nowrap">{formatDate(log.timestamp)}</td>
                    <td className="px-4 py-3">
                      <div>
                        <span className="text-gray-900 dark:text-white text-xs">{log.actor_email}</span>
                        <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border capitalize ${
                          roleColors[log.actor_role] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                        }`}>
                          {log.actor_role}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <span className="text-gray-900 dark:text-white font-mono text-xs">{log.action}</span>
                        <span className="block text-[11px] text-gray-400 dark:text-white/40 mt-0.5 max-w-[250px] truncate">{log.details}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <span className="text-gray-600 dark:text-white/70 text-xs">{log.resource_type}</span>
                        <span className="block text-[10px] text-gray-400 dark:text-white/30 font-mono">{log.resource_id}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={log.status} /></td>
                    <td className="px-4 py-3 text-gray-400 dark:text-white/40 font-mono text-xs">{log.ip_address}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-[#22272B]">
          <p className="text-xs text-gray-400 dark:text-white/40">
            Showing {filteredLogs.length === 0 ? 0 : (safePage - 1) * logsPerPage + 1}-{Math.min(safePage * logsPerPage, filteredLogs.length)} of {filteredLogs.length} logs
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#22272B] text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                  page === safePage
                    ? 'bg-[#E40000] text-gray-900 dark:text-white'
                    : 'hover:bg-gray-100 dark:hover:bg-[#22272B] text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#22272B] text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AuditLogsPage;
