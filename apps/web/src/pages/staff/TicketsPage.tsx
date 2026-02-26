import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getTickets,
  createTicket,
} from '@/services/staff/staffSupportService';
import type {
  TicketListParams,
  CreateTicketPayload,
} from '@/services/staff/staffSupportService';
import type { StaffTicket } from '@/types/staff';

/* ------------------------------------------------------------------ */
/* Create Ticket Modal                                                 */
/* ------------------------------------------------------------------ */

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const CreateTicketModal: React.FC<CreateTicketModalProps> = ({ isOpen, onClose, onCreated }) => {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CreateTicketPayload['category']>('technical');
  const [priority, setPriority] = useState<CreateTicketPayload['priority']>('medium');
  const [tags, setTags] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await createTicket({
        subject: subject.trim(),
        description: description.trim(),
        category,
        priority,
        tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
      });
      setSubject('');
      setDescription('');
      setCategory('technical');
      setPriority('medium');
      setTags('');
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-[#181C1F] rounded-xl border border-gray-200 dark:border-[#22272B] p-6 w-full max-w-lg mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">New Ticket</h2>
          <button onClick={onClose} className="text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/60 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500 dark:text-white/50 mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="w-full px-3 py-2 bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:border-[#E40000]/50"
              placeholder="Brief description of the issue"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-white/50 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:border-[#E40000]/50 resize-none"
              placeholder="Provide details about the issue..."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 dark:text-white/50 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CreateTicketPayload['category'])}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-lg text-sm text-gray-600 dark:text-white/70 focus:outline-none focus:border-[#E40000]/50"
              >
                <option value="technical">Technical</option>
                <option value="billing">Billing</option>
                <option value="account">Account</option>
                <option value="content">Content</option>
                <option value="safety">Safety</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-white/50 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as CreateTicketPayload['priority'])}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-lg text-sm text-gray-600 dark:text-white/70 focus:outline-none focus:border-[#E40000]/50"
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-white/50 mb-1">Tags (comma separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:border-[#E40000]/50"
              placeholder="e.g. m-pesa, payment, urgent"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-500 dark:text-white/50 hover:text-gray-700 dark:hover:text-white/70 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !subject.trim() || !description.trim()}
              className="px-4 py-2 bg-[#E40000] hover:bg-[#E40000]/90 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-40"
            >
              {submitting ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Tickets Page                                                        */
/* ------------------------------------------------------------------ */

const TicketsPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<StaffTicket[]>([]);
  const [totalTickets, setTotalTickets] = useState(0);
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const params: TicketListParams = {};
      if (priorityFilter !== 'all') params.priority = priorityFilter;
      if (statusFilter !== 'all') params.status = statusFilter;

      const response = await getTickets(params);
      setTickets(response.items);
      setTotalTickets(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tickets');
    } finally {
      setIsLoading(false);
    }
  }, [priorityFilter, statusFilter]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Client-side search filtering on the fetched tickets
  const filteredTickets = tickets.filter((ticket) => {
    if (
      searchTerm &&
      !ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !ticket.ticket_number.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false;
    return true;
  });

  // Derive stats from current tickets
  const stats = {
    totalOpen: tickets.filter(t => !['resolved', 'closed'].includes(t.status)).length,
    criticalSLA: tickets.filter(t => t.sla_status?.is_breached || (t.sla_status?.time_remaining_minutes != null && t.sla_status.time_remaining_minutes < 60)).length,
    avgResolutionTime: (() => {
      const resolved = tickets.filter(t => t.resolved_at && t.created_at);
      if (resolved.length === 0) return '--';
      const totalMinutes = resolved.reduce((sum, t) => {
        const diff = (new Date(t.resolved_at!).getTime() - new Date(t.created_at).getTime()) / 60000;
        return sum + diff;
      }, 0);
      const avgHours = (totalMinutes / resolved.length / 60).toFixed(1);
      return `${avgHours}h`;
    })(),
    csatScore: (() => {
      const rated = tickets.filter(t => t.csat_score != null);
      if (rated.length === 0) return '--';
      const avg = rated.reduce((sum, t) => sum + (t.csat_score ?? 0), 0) / rated.length;
      return avg.toFixed(1);
    })(),
  };

  const getPriorityBadge = (priority: StaffTicket['priority']) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-500/20 text-red-400 border-red-500/30',
      high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      low: 'bg-green-500/20 text-green-400 border-green-500/30',
    };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${colors[priority]}`}>{priority}</span>;
  };

  const getStatusBadge = (status: StaffTicket['status']) => {
    const config: Record<string, { label: string; color: string }> = {
      open: { label: 'Open', color: 'bg-blue-500/20 text-blue-400' },
      in_progress: { label: 'In Progress', color: 'bg-cyan-500/20 text-cyan-400' },
      waiting: { label: 'Waiting', color: 'bg-yellow-500/20 text-yellow-400' },
      escalated: { label: 'Escalated', color: 'bg-purple-500/20 text-purple-400' },
      resolved: { label: 'Resolved', color: 'bg-green-500/20 text-green-400' },
      closed: { label: 'Closed', color: 'bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-white/40' },
    };
    const { label, color } = config[status] || { label: status, color: 'bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-white/40' };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>{label}</span>;
  };

  const getSLAIndicator = (slaStatus: StaffTicket['sla_status']) => {
    if (!slaStatus) {
      return <span className="text-xs text-gray-400 dark:text-white/40">--</span>;
    }

    const remaining = slaStatus.time_remaining_minutes;
    let slaLevel: 'on_track' | 'at_risk' | 'breached' = 'on_track';
    let remainingText = '--';

    if (slaStatus.is_breached) {
      slaLevel = 'breached';
      remainingText = remaining != null ? `Breached ${Math.abs(remaining)}m ago` : 'Breached';
    } else if (remaining != null) {
      if (remaining < 60) {
        slaLevel = 'at_risk';
      }
      const hours = Math.floor(remaining / 60);
      const mins = remaining % 60;
      remainingText = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    }

    const colors: Record<string, string> = {
      on_track: 'text-green-400',
      at_risk: 'text-yellow-400',
      breached: 'text-red-400',
    };
    const dots: Record<string, string> = {
      on_track: 'bg-green-400',
      at_risk: 'bg-yellow-400',
      breached: 'bg-red-400 animate-pulse',
    };
    return (
      <div className="flex items-center gap-1.5">
        <div className={`w-2 h-2 rounded-full ${dots[slaLevel]}`} />
        <span className={`text-xs ${colors[slaLevel]}`}>{remainingText}</span>
      </div>
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-KE', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-7 w-56 bg-white dark:bg-[#181C1F] rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-white dark:bg-[#181C1F] rounded-xl border border-gray-200 dark:border-[#22272B] animate-pulse" />
          ))}
        </div>
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-14 bg-white dark:bg-[#181C1F] rounded-lg border border-gray-200 dark:border-[#22272B] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Tickets & Conversations</h1>
          <p className="text-sm text-gray-500 dark:text-white/50 mt-1">
            Manage support tickets, track SLAs, and resolve issues
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-[#E40000] hover:bg-[#E40000]/90 text-white text-sm font-medium rounded-lg transition-colors"
        >
          New Ticket
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-between">
          <span className="text-sm text-red-400">{error}</span>
          <button onClick={fetchTickets} className="text-xs text-red-400 underline hover:text-red-300">
            Retry
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#181C1F] rounded-xl border border-gray-200 dark:border-[#22272B] p-4">
          <p className="text-xs text-gray-500 dark:text-white/50 uppercase tracking-wider">Total Open</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalOpen}</p>
        </div>
        <div className="bg-white dark:bg-[#181C1F] rounded-xl border border-gray-200 dark:border-[#22272B] p-4">
          <p className="text-xs text-gray-500 dark:text-white/50 uppercase tracking-wider">Critical SLA</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{stats.criticalSLA}</p>
        </div>
        <div className="bg-white dark:bg-[#181C1F] rounded-xl border border-gray-200 dark:border-[#22272B] p-4">
          <p className="text-xs text-gray-500 dark:text-white/50 uppercase tracking-wider">Avg Resolution</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.avgResolutionTime}</p>
        </div>
        <div className="bg-white dark:bg-[#181C1F] rounded-xl border border-gray-200 dark:border-[#22272B] p-4">
          <p className="text-xs text-gray-500 dark:text-white/50 uppercase tracking-wider">CSAT Score</p>
          <div className="flex items-baseline gap-1 mt-1">
            <p className="text-2xl font-bold text-green-400">{stats.csatScore}</p>
            {stats.csatScore !== '--' && <p className="text-sm text-gray-400 dark:text-white/30">/5.0</p>}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-white dark:bg-[#181C1F] rounded-xl border border-gray-200 dark:border-[#22272B]">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search tickets by subject or number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:border-[#E40000]/50"
          />
        </div>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-2 bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-lg text-sm text-gray-600 dark:text-white/70 focus:outline-none focus:border-[#E40000]/50"
        >
          <option value="all">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-lg text-sm text-gray-600 dark:text-white/70 focus:outline-none focus:border-[#E40000]/50"
        >
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="waiting">Waiting</option>
          <option value="escalated">Escalated</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <span className="text-xs text-gray-400 dark:text-white/40">
          {filteredTickets.length} of {totalTickets} tickets
        </span>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-[#181C1F] rounded-xl border border-gray-200 dark:border-[#22272B] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-[#22272B]">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-white/50 uppercase tracking-wider">Ticket #</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-white/50 uppercase tracking-wider">Subject</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-white/50 uppercase tracking-wider">Priority</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-white/50 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-white/50 uppercase tracking-wider">Assigned To</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-white/50 uppercase tracking-wider">SLA Remaining</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-white/50 uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-[#22272B]">
              {filteredTickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
                  onClick={() => navigate(`/dashboard/staff/support/tickets/${ticket.id}`)}
                >
                  <td className="px-4 py-3">
                    <span className="text-sm text-[#E40000] font-mono">{ticket.ticket_number}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm text-gray-900 dark:text-white font-medium">{ticket.subject}</p>
                      <p className="text-xs text-gray-400 dark:text-white/40 mt-0.5">
                        {ticket.reporter.name} ({ticket.reporter.role}) &middot; {ticket.message_count} messages
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">{getPriorityBadge(ticket.priority)}</td>
                  <td className="px-4 py-3">{getStatusBadge(ticket.status)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs ${!ticket.assigned_to ? 'text-red-400' : 'text-gray-500 dark:text-white/60'}`}>
                      {ticket.assigned_to?.name || 'Unassigned'}
                    </span>
                  </td>
                  <td className="px-4 py-3">{getSLAIndicator(ticket.sla_status)}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-500 dark:text-white/50">{formatDate(ticket.created_at)}</span>
                  </td>
                </tr>
              ))}
              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400 dark:text-white/40">
                    No tickets found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Ticket Modal */}
      <CreateTicketModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={fetchTickets}
      />
    </div>
  );
};

export default TicketsPage;
