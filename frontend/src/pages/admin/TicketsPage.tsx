import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Ticket,
  RefreshCw,
  Search,
  Filter,
  Eye,
  AlertCircle,
  Clock,
  SmilePlus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import AdminPageHeader from '../../components/admin/shared/AdminPageHeader';
import AdminStatsCard from '../../components/admin/shared/AdminStatsCard';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface SupportTicket {
  id: string;
  ticket_number: string;
  subject: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
  assignee: string;
  reporter: string;
  reporter_email: string;
  category: string;
  sla_deadline: string;
  created_at: string;
  updated_at: string;
}

/* ------------------------------------------------------------------ */
/* Mock data                                                           */
/* ------------------------------------------------------------------ */

const MOCK_TICKETS: SupportTicket[] = [
  { id: 'TK-001', ticket_number: 'TK-2025-0001', subject: 'Cannot access AI tutor after payment', description: 'User reports payment was successful but AI tutor is locked.', priority: 'critical', status: 'open', assignee: 'Admin Team', reporter: 'Grace Njeri', reporter_email: 'grace@example.com', category: 'Billing', sla_deadline: '2025-01-15T14:00:00Z', created_at: '2025-01-15T10:00:00Z', updated_at: '2025-01-15T10:00:00Z' },
  { id: 'TK-002', ticket_number: 'TK-2025-0002', subject: 'M-Pesa payment not reflecting', description: 'M-Pesa confirmation received but balance not updated.', priority: 'high', status: 'in_progress', assignee: 'Finance Team', reporter: 'David Kamau', reporter_email: 'david@example.com', category: 'Payments', sla_deadline: '2025-01-15T18:00:00Z', created_at: '2025-01-15T08:30:00Z', updated_at: '2025-01-15T09:15:00Z' },
  { id: 'TK-003', ticket_number: 'TK-2025-0003', subject: 'Course video not loading on mobile', description: 'Videos buffer endlessly on Android devices.', priority: 'medium', status: 'open', assignee: 'Tech Support', reporter: 'Mary Akinyi', reporter_email: 'mary@example.com', category: 'Technical', sla_deadline: '2025-01-16T10:00:00Z', created_at: '2025-01-15T07:45:00Z', updated_at: '2025-01-15T07:45:00Z' },
  { id: 'TK-004', ticket_number: 'TK-2025-0004', subject: 'Request to change child grade level', description: 'Parent wants to update child from Grade 3 to Grade 4.', priority: 'low', status: 'waiting', assignee: 'Admin Team', reporter: 'Jane Wanjiku', reporter_email: 'jane@example.com', category: 'Account', sla_deadline: '2025-01-17T10:00:00Z', created_at: '2025-01-14T16:00:00Z', updated_at: '2025-01-15T08:00:00Z' },
  { id: 'TK-005', ticket_number: 'TK-2025-0005', subject: 'Inappropriate content flagged by AI', description: 'AI tutor generated an inappropriate response during a session.', priority: 'critical', status: 'in_progress', assignee: 'Safety Team', reporter: 'Peter Ochieng', reporter_email: 'peter@example.com', category: 'Safety', sla_deadline: '2025-01-15T12:00:00Z', created_at: '2025-01-15T06:30:00Z', updated_at: '2025-01-15T07:00:00Z' },
  { id: 'TK-006', ticket_number: 'TK-2025-0006', subject: 'Certificate not generating after course completion', description: 'Completed all modules but certificate page shows error.', priority: 'medium', status: 'resolved', assignee: 'Tech Support', reporter: 'Brian Otieno', reporter_email: 'brian@example.com', category: 'Technical', sla_deadline: '2025-01-16T10:00:00Z', created_at: '2025-01-14T14:00:00Z', updated_at: '2025-01-15T09:30:00Z' },
  { id: 'TK-007', ticket_number: 'TK-2025-0007', subject: 'Partner dashboard access issue', description: 'Cannot view revenue reports in partner dashboard.', priority: 'high', status: 'open', assignee: 'Tech Support', reporter: 'EduTech Kenya', reporter_email: 'support@edutechke.com', category: 'Partner', sla_deadline: '2025-01-15T16:00:00Z', created_at: '2025-01-15T09:00:00Z', updated_at: '2025-01-15T09:00:00Z' },
  { id: 'TK-008', ticket_number: 'TK-2025-0008', subject: 'Password reset email not received', description: 'Multiple reset attempts but no email received.', priority: 'low', status: 'closed', assignee: 'Admin Team', reporter: 'Sarah Wambui', reporter_email: 'sarah@example.com', category: 'Account', sla_deadline: '2025-01-16T10:00:00Z', created_at: '2025-01-13T11:00:00Z', updated_at: '2025-01-14T09:00:00Z' },
];

/* ------------------------------------------------------------------ */
/* Badge helpers                                                       */
/* ------------------------------------------------------------------ */

const priorityColors: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${
      priorityColors[priority] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }`}
  >
    {priority}
  </span>
);

const statusColors: Record<string, string> = {
  open: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  in_progress: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  waiting: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  resolved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  closed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${
      statusColors[status.replace('_', ' ')] || statusColors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }`}
  >
    {status.replace('_', ' ')}
  </span>
);

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
  });

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const TicketsPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const filteredTickets = MOCK_TICKETS.filter(
    (t) =>
      (!priorityFilter || t.priority === priorityFilter) &&
      (!statusFilter || t.status === statusFilter) &&
      (!search ||
        t.ticket_number.toLowerCase().includes(search.toLowerCase()) ||
        t.subject.toLowerCase().includes(search.toLowerCase()) ||
        t.reporter.toLowerCase().includes(search.toLowerCase()))
  );

  const openCount = MOCK_TICKETS.filter((t) => t.status === 'open' || t.status === 'in_progress').length;
  const criticalCount = MOCK_TICKETS.filter((t) => t.priority === 'critical').length;

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
        <div className="h-16 bg-[#22272B] rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-[#22272B] rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-80 bg-[#22272B] rounded-xl animate-pulse" />
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
        title="Support Tickets"
        subtitle="Manage and resolve customer support requests"
        breadcrumbs={[
          { label: 'Operations', path: '/dashboard/admin' },
          { label: 'Tickets' },
        ]}
        actions={
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-[#22272B] border border-[#333] rounded-lg text-white/70 hover:text-white hover:border-[#444] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        }
      />

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatsCard
          title="Open Tickets"
          value={openCount}
          icon={<Ticket className="w-5 h-5" />}
          trend={{ value: 3, label: 'new today', direction: 'up' }}
        />
        <AdminStatsCard
          title="Critical"
          value={criticalCount}
          icon={<AlertCircle className="w-5 h-5" />}
          trend={{ value: 1, label: 'needs immediate attention', direction: 'down' }}
        />
        <AdminStatsCard
          title="Avg Response Time"
          value="2.4h"
          icon={<Clock className="w-5 h-5" />}
          trend={{ value: 15, label: 'faster than target', direction: 'up' }}
        />
        <AdminStatsCard
          title="CSAT Score"
          value="4.6/5"
          icon={<SmilePlus className="w-5 h-5" />}
          trend={{ value: 0.2, label: 'vs last month', direction: 'up' }}
        />
      </motion.div>

      {/* Search / Filters */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search by ticket number, subject, or reporter..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#181C1F] border border-[#22272B] rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#E40000]/50 transition-colors"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="pl-10 pr-8 py-2.5 bg-[#181C1F] border border-[#22272B] rounded-lg text-white text-sm appearance-none cursor-pointer focus:outline-none focus:border-[#E40000]/50 transition-colors min-w-[140px]"
          >
            <option value="">All Priority</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-[#181C1F] border border-[#22272B] rounded-lg text-white text-sm appearance-none cursor-pointer focus:outline-none focus:border-[#E40000]/50 transition-colors min-w-[140px]"
        >
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="waiting">Waiting</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </motion.div>

      {/* Table */}
      <motion.div variants={itemVariants} className="bg-[#181C1F] border border-[#22272B] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#22272B] text-left">
                <th className="px-4 py-3 text-white/60 font-medium">Ticket #</th>
                <th className="px-4 py-3 text-white/60 font-medium">Subject</th>
                <th className="px-4 py-3 text-white/60 font-medium">Priority</th>
                <th className="px-4 py-3 text-white/60 font-medium">Status</th>
                <th className="px-4 py-3 text-white/60 font-medium">Assignee</th>
                <th className="px-4 py-3 text-white/60 font-medium">SLA Deadline</th>
                <th className="px-4 py-3 text-white/60 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <Ticket className="w-12 h-12 text-white/10 mx-auto mb-3" />
                    <p className="text-white/40 text-sm">No tickets found</p>
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="border-b border-[#22272B]/50 hover:bg-[#1E2327] transition-colors cursor-pointer"
                    onClick={() => navigate(`/dashboard/admin/tickets/${ticket.id}`)}
                  >
                    <td className="px-4 py-3">
                      <span className="text-white font-mono text-xs">{ticket.ticket_number}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <span className="text-white font-medium">{ticket.subject}</span>
                        <span className="block text-xs text-white/40">{ticket.reporter} - {ticket.category}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><PriorityBadge priority={ticket.priority} /></td>
                    <td className="px-4 py-3"><StatusBadge status={ticket.status} /></td>
                    <td className="px-4 py-3 text-white/60">{ticket.assignee}</td>
                    <td className="px-4 py-3">
                      <span className={
                        new Date(ticket.sla_deadline) < new Date() && ticket.status !== 'resolved' && ticket.status !== 'closed'
                          ? 'text-red-400'
                          : 'text-white/60'
                      }>
                        {formatDate(ticket.sla_deadline)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/dashboard/admin/tickets/${ticket.id}`);
                          }}
                          title="View Ticket"
                          className="p-1.5 rounded-lg hover:bg-[#22272B] text-white/50 hover:text-white transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#22272B]">
          <p className="text-xs text-white/40">
            Showing 1-{filteredTickets.length} of {filteredTickets.length} tickets
          </p>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-lg hover:bg-[#22272B] text-white/50 hover:text-white disabled:opacity-30 transition-colors" disabled>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 rounded-lg text-xs font-medium bg-[#E40000] text-white">1</button>
            <button className="p-1.5 rounded-lg hover:bg-[#22272B] text-white/50 hover:text-white disabled:opacity-30 transition-colors" disabled>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TicketsPage;
