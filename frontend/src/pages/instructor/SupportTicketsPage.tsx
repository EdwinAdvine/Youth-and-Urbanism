import React, { useEffect, useState } from 'react';
import { LifeBuoy, Plus, Filter, Search, X, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { InstructorPageHeader } from '../../components/instructor/shared/InstructorPageHeader';
import axios from 'axios';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
  last_updated: string;
  replies_count: number;
}

interface NewTicketForm {
  title: string;
  description: string;
  category: string;
  priority: string;
}

const CATEGORIES = ['Technical', 'Billing', 'Content', 'Feature Request', 'Other'];
const PRIORITIES = ['low', 'medium', 'high'];

const emptyForm: NewTicketForm = {
  title: '',
  description: '',
  category: 'Technical',
  priority: 'medium',
};

export const SupportTicketsPage: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [newTicket, setNewTicket] = useState<NewTicketForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTickets();
  }, [statusFilter]);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const params: Record<string, string> = {};
      if (statusFilter !== 'all') params.status = statusFilter;

      const response = await axios.get(`${API_URL}/api/v1/instructor/hub/support/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      // Mock data fallback for development
      if (!response.data || response.data.length === 0) {
        setTickets([
          {
            id: '1',
            title: 'Unable to upload video to course',
            description: 'Getting an error when trying to upload a 200MB video file',
            category: 'Technical',
            priority: 'high',
            status: 'in_progress',
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            last_updated: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            replies_count: 3,
          },
          {
            id: '2',
            title: 'Question about payment processing timeline',
            description: 'When will my earnings from last month be processed?',
            category: 'Billing',
            priority: 'medium',
            status: 'resolved',
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            last_updated: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            replies_count: 2,
          },
          {
            id: '3',
            title: 'Feature request: Bulk student messaging',
            description: 'Would love to be able to send messages to multiple students at once',
            category: 'Feature Request',
            priority: 'low',
            status: 'open',
            created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
            last_updated: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
            replies_count: 0,
          },
        ]);
      } else {
        setTickets(response.data);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async () => {
    if (!newTicket.title.trim() || !newTicket.description.trim()) {
      setFeedback({ type: 'error', message: 'Please fill in both title and description.' });
      return;
    }

    try {
      setSubmitting(true);
      setFeedback(null);
      const token = localStorage.getItem('access_token');

      await axios.post(
        `${API_URL}/api/v1/instructor/hub/support/tickets`,
        {
          title: newTicket.title.trim(),
          description: newTicket.description.trim(),
          category: newTicket.category,
          priority: newTicket.priority,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setShowNewTicketModal(false);
      setNewTicket(emptyForm);
      setFeedback({ type: 'success', message: 'Support ticket created successfully!' });
      fetchTickets();
    } catch (error: any) {
      console.error('Error creating ticket:', error);
      const message =
        error.response?.data?.detail || 'Failed to create support ticket. Please try again.';
      setFeedback({ type: 'error', message });
    } finally {
      setSubmitting(false);
    }
  };

  const openNewTicketModal = () => {
    setNewTicket(emptyForm);
    setShowNewTicketModal(true);
  };

  const closeNewTicketModal = () => {
    if (!submitting) {
      setShowNewTicketModal(false);
      setNewTicket(emptyForm);
    }
  };

  const statusColors = {
    open: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    in_progress: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    resolved: 'bg-green-500/10 text-green-400 border-green-500/30',
    closed: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
  };

  const priorityColors = {
    low: 'bg-gray-500/10 text-gray-400',
    medium: 'bg-blue-500/10 text-blue-400',
    high: 'bg-orange-500/10 text-orange-400',
    urgent: 'bg-red-500/10 text-red-400',
  };

  const filteredTickets = tickets.filter((ticket) =>
    ticket.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <InstructorPageHeader
        title="Support Tickets"
        description="Get help from our support team"
        icon={<LifeBuoy className="w-6 h-6 text-purple-400" />}
        actions={
          <button
            onClick={openNewTicketModal}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Ticket
          </button>
        }
      />

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl border ${
            feedback.type === 'success'
              ? 'bg-green-500/10 border-green-500/30 text-green-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="text-sm font-medium">{feedback.message}</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-purple-500/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500 dark:text-white/60" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {filteredTickets.map((ticket) => (
          <div
            key={ticket.id}
            onClick={() => navigate(`/dashboard/instructor/hub/support/ticket/${ticket.id}`)}
            className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-5 hover:bg-white/[0.07] transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium border ${
                      statusColors[ticket.status]
                    }`}
                  >
                    {ticket.status.replace('_', ' ')}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      priorityColors[ticket.priority]
                    }`}
                  >
                    {ticket.priority}
                  </span>
                  <span className="px-2 py-0.5 bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/60 text-xs rounded">
                    {ticket.category}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {ticket.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-white/70 line-clamp-1">
                  {ticket.description}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-white/60">
              <span>Created {format(new Date(ticket.created_at), 'MMM d, h:mm a')}</span>
              <div className="flex items-center gap-4">
                <span>{ticket.replies_count} replies</span>
                <span>Updated {format(new Date(ticket.last_updated), 'MMM d, h:mm a')}</span>
              </div>
            </div>
          </div>
        ))}

        {filteredTickets.length === 0 && (
          <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-12 text-center">
            <LifeBuoy className="w-16 h-16 text-gray-400 dark:text-white/30 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-white/60 mb-4">No support tickets found</p>
            <button
              onClick={openNewTicketModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Your First Ticket
            </button>
          </div>
        )}
      </div>

      {/* New Ticket Modal */}
      {showNewTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeNewTicketModal}
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <LifeBuoy className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    New Support Ticket
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-white/60">
                    Describe your issue and we will get back to you
                  </p>
                </div>
              </div>
              <button
                onClick={closeNewTicketModal}
                disabled={submitting}
                className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-white/60" />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-white/80 mb-2">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                  placeholder="Brief summary of your issue"
                  disabled={submitting}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-purple-500/50 disabled:opacity-50"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-white/80 mb-2">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  placeholder="Provide details about your issue, including any error messages or steps to reproduce..."
                  rows={4}
                  disabled={submitting}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-purple-500/50 resize-none disabled:opacity-50"
                />
              </div>

              {/* Category & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-white/80 mb-2">
                    Category
                  </label>
                  <select
                    value={newTicket.category}
                    onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                    disabled={submitting}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50 disabled:opacity-50"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-white/80 mb-2">
                    Priority
                  </label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                    disabled={submitting}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50 disabled:opacity-50"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Priority Description */}
              <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-white/50">
                  {newTicket.priority === 'low' && 'Low: General questions or minor issues that are not time-sensitive.'}
                  {newTicket.priority === 'medium' && 'Medium: Issues affecting your workflow but with available workarounds.'}
                  {newTicket.priority === 'high' && 'High: Critical issues blocking your work with no workaround available.'}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-white/10">
              <button
                onClick={closeNewTicketModal}
                disabled={submitting}
                className="px-4 py-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-lg transition-colors text-sm disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTicket}
                disabled={submitting || !newTicket.title.trim() || !newTicket.description.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {submitting ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
