import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  User,
  Tag,
  Send,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import AdminPageHeader from '../../components/admin/shared/AdminPageHeader';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface TicketMessage {
  id: string;
  sender: string;
  sender_role: 'customer' | 'agent';
  content: string;
  timestamp: string;
}

interface TicketDetail {
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
  messages: TicketMessage[];
}

/* ------------------------------------------------------------------ */
/* Mock data                                                           */
/* ------------------------------------------------------------------ */

const MOCK_TICKETS: Record<string, TicketDetail> = {
  'TK-001': {
    id: 'TK-001',
    ticket_number: 'TK-2025-0001',
    subject: 'Cannot access AI tutor after payment',
    description: 'I made a payment via M-Pesa for the Premium plan but the AI tutor is still locked. The payment confirmation SMS was received at 9:45 AM.',
    priority: 'critical',
    status: 'open',
    assignee: 'Admin Team',
    reporter: 'Grace Njeri',
    reporter_email: 'grace@example.com',
    category: 'Billing',
    sla_deadline: '2025-01-15T14:00:00Z',
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-15T10:00:00Z',
    messages: [
      { id: 'msg-1', sender: 'Grace Njeri', sender_role: 'customer', content: 'I made a payment via M-Pesa for the Premium plan but the AI tutor is still locked. The payment confirmation SMS was received at 9:45 AM. Transaction ID: QK7F3H. Please help urgently as my child has an exam next week.', timestamp: '2025-01-15T10:00:00Z' },
      { id: 'msg-2', sender: 'Admin Team', sender_role: 'agent', content: 'Hi Grace, thank you for reaching out. We can see your payment in our system and are investigating the delay in activating your account. We will resolve this within the next hour.', timestamp: '2025-01-15T10:15:00Z' },
      { id: 'msg-3', sender: 'Grace Njeri', sender_role: 'customer', content: 'Thank you for the quick response. Looking forward to the resolution.', timestamp: '2025-01-15T10:20:00Z' },
      { id: 'msg-4', sender: 'Admin Team', sender_role: 'agent', content: 'We have identified the issue - there was a sync delay with the payment gateway. Your Premium plan is now active. Please log out and log back in to access the AI tutor. We apologize for the inconvenience.', timestamp: '2025-01-15T10:45:00Z' },
    ],
  },
  'TK-002': {
    id: 'TK-002',
    ticket_number: 'TK-2025-0002',
    subject: 'M-Pesa payment not reflecting',
    description: 'Made payment yesterday but balance not updated.',
    priority: 'high',
    status: 'in_progress',
    assignee: 'Finance Team',
    reporter: 'David Kamau',
    reporter_email: 'david@example.com',
    category: 'Payments',
    sla_deadline: '2025-01-15T18:00:00Z',
    created_at: '2025-01-15T08:30:00Z',
    updated_at: '2025-01-15T09:15:00Z',
    messages: [
      { id: 'msg-1', sender: 'David Kamau', sender_role: 'customer', content: 'I paid KES 2,500 via M-Pesa yesterday at around 4 PM but my account still shows unpaid. Transaction code: LM9P2T.', timestamp: '2025-01-15T08:30:00Z' },
      { id: 'msg-2', sender: 'Finance Team', sender_role: 'agent', content: 'Hello David, we are looking into your payment. Could you please share a screenshot of the M-Pesa confirmation message?', timestamp: '2025-01-15T09:15:00Z' },
    ],
  },
};

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
      statusColors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
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

const TicketDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [replyText, setReplyText] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const initialTicket = id ? MOCK_TICKETS[id] : null;

  // Fallback for unknown tickets
  const fallbackTicket: TicketDetail = {
    id: id || 'TK-000',
    ticket_number: `TK-2025-${(id || '').replace('TK-', '').padStart(4, '0')}`,
    subject: 'Support Ticket',
    description: 'Ticket details are being loaded...',
    priority: 'medium',
    status: 'open',
    assignee: 'Unassigned',
    reporter: 'Unknown',
    reporter_email: 'unknown@example.com',
    category: 'General',
    sla_deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    messages: [
      { id: 'msg-fallback', sender: 'System', sender_role: 'agent', content: 'This ticket is pending review.', timestamp: new Date().toISOString() },
    ],
  };

  const [ticketData, setTicketData] = useState<TicketDetail>(initialTicket || fallbackTicket);
  const [localMessages, setLocalMessages] = useState<TicketMessage[]>((initialTicket || fallbackTicket).messages);

  const data = ticketData;

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    const newMessage: TicketMessage = {
      id: `msg-${Date.now()}`,
      sender: 'Admin Team',
      sender_role: 'agent',
      content: replyText.trim(),
      timestamp: new Date().toISOString(),
    };
    setLocalMessages((prev) => [...prev, newMessage]);
    setReplyText('');
    showToast('Reply sent successfully');
  };

  const handleResolve = () => {
    setTicketData((prev) => ({ ...prev, status: 'resolved', updated_at: new Date().toISOString() }));
    showToast('Ticket resolved');
  };

  const handleClose = () => {
    setTicketData((prev) => ({ ...prev, status: 'closed', updated_at: new Date().toISOString() }));
    showToast('Ticket closed');
  };

  const handleReassign = () => {
    const assignee = prompt('Reassign ticket to:');
    if (assignee && assignee.trim()) {
      setTicketData((prev) => ({ ...prev, assignee: assignee.trim(), updated_at: new Date().toISOString() }));
      showToast(`Ticket reassigned to ${assignee.trim()}`);
    }
  };

  const handleChangePriority = () => {
    const priorities: TicketDetail['priority'][] = ['low', 'medium', 'high', 'critical'];
    const currentIndex = priorities.indexOf(data.priority);
    const nextPriority = priorities[(currentIndex + 1) % priorities.length];
    setTicketData((prev) => ({ ...prev, priority: nextPriority, updated_at: new Date().toISOString() }));
    showToast(`Priority changed to ${nextPriority}`);
  };

  const handleEscalate = () => {
    if (confirm('Are you sure you want to escalate this ticket to a manager?')) {
      showToast('Ticket escalated to manager');
    }
  };

  const handleMerge = () => {
    alert('Merge feature coming soon');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <AdminPageHeader
        title={data.ticket_number}
        subtitle={data.subject}
        breadcrumbs={[
          { label: 'Operations', path: '/dashboard/admin' },
          { label: 'Tickets', path: '/dashboard/admin/tickets' },
          { label: data.ticket_number },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/dashboard/admin/tickets')}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-[#444] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Tickets
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Message Thread */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Header Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6"
          >
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <PriorityBadge priority={data.priority} />
              <StatusBadge status={data.status} />
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-gray-100 dark:bg-[#22272B] text-gray-500 dark:text-white/60 border-gray-300 dark:border-[#333]">
                {data.category}
              </span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{data.subject}</h2>
            <p className="text-sm text-gray-500 dark:text-white/60">{data.description}</p>
          </motion.div>

          {/* Message Thread */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            {localMessages.map((msg, idx) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender_role === 'agent' ? 'justify-end' : 'justify-start'}`}
              >
                <motion.div
                  initial={{ opacity: 0, x: msg.sender_role === 'agent' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`max-w-[80%] rounded-xl p-4 ${
                    msg.sender_role === 'agent'
                      ? 'bg-[#E40000]/10 border border-[#E40000]/20'
                      : 'bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      msg.sender_role === 'agent' ? 'bg-[#E40000]/20 text-red-400' : 'bg-gray-100 dark:bg-[#22272B] text-gray-500 dark:text-white/60'
                    }`}>
                      {msg.sender.slice(0, 1)}
                    </div>
                    <span className="text-xs font-medium text-gray-700 dark:text-white/80">{msg.sender}</span>
                    <span className="text-xs text-gray-400 dark:text-white/30">{formatDate(msg.timestamp)}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-white/70 leading-relaxed">{msg.content}</p>
                </motion.div>
              </div>
            ))}
          </motion.div>

          {/* Reply Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-4"
          >
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your reply..."
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-lg text-gray-900 dark:text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#E40000]/50 transition-colors resize-none"
            />
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResolve}
                  className="px-3 py-1.5 text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/30 transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Resolve
                </button>
                <button
                  onClick={handleClose}
                  className="px-3 py-1.5 text-xs bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Close
                </button>
              </div>
              <button
                onClick={handleSendReply}
                disabled={!replyText.trim()}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-[#E40000] rounded-lg text-gray-900 dark:text-white hover:bg-[#C00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                Send Reply
              </button>
            </div>
          </motion.div>
        </div>

        {/* Sidebar - Ticket Info */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5"
          >
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Ticket Information</h3>
            <div className="space-y-4">
              <div>
                <span className="text-xs text-gray-400 dark:text-white/40 block mb-1">Reporter</span>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400 dark:text-white/40" />
                  <div>
                    <span className="text-sm text-gray-900 dark:text-white">{data.reporter}</span>
                    <span className="block text-xs text-gray-400 dark:text-white/40">{data.reporter_email}</span>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-xs text-gray-400 dark:text-white/40 block mb-1">Assignee</span>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400 dark:text-white/40" />
                  <span className="text-sm text-gray-900 dark:text-white">{data.assignee}</span>
                </div>
              </div>

              <div>
                <span className="text-xs text-gray-400 dark:text-white/40 block mb-1">Category</span>
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-gray-400 dark:text-white/40" />
                  <span className="text-sm text-gray-900 dark:text-white">{data.category}</span>
                </div>
              </div>

              <div>
                <span className="text-xs text-gray-400 dark:text-white/40 block mb-1">Priority</span>
                <PriorityBadge priority={data.priority} />
              </div>

              <div>
                <span className="text-xs text-gray-400 dark:text-white/40 block mb-1">Status</span>
                <StatusBadge status={data.status} />
              </div>

              <div className="pt-3 border-t border-gray-200 dark:border-[#22272B]">
                <span className="text-xs text-gray-400 dark:text-white/40 block mb-1">SLA Deadline</span>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400 dark:text-white/40" />
                  <span className={`text-sm ${
                    new Date(data.sla_deadline) < new Date() ? 'text-red-400' : 'text-gray-900 dark:text-white'
                  }`}>
                    {formatDate(data.sla_deadline)}
                  </span>
                </div>
                {new Date(data.sla_deadline) < new Date() && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-red-400">
                    <AlertCircle className="w-3.5 h-3.5" />
                    SLA breached
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-gray-200 dark:border-[#22272B]">
                <span className="text-xs text-gray-400 dark:text-white/40 block mb-1">Created</span>
                <span className="text-sm text-gray-500 dark:text-white/60">{formatDate(data.created_at)}</span>
              </div>

              <div>
                <span className="text-xs text-gray-400 dark:text-white/40 block mb-1">Last Updated</span>
                <span className="text-sm text-gray-500 dark:text-white/60">{formatDate(data.updated_at)}</span>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5"
          >
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={handleReassign}
                className="w-full text-left px-3 py-2 text-sm text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#22272B] rounded-lg transition-colors"
              >
                Reassign Ticket
              </button>
              <button
                onClick={handleChangePriority}
                className="w-full text-left px-3 py-2 text-sm text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#22272B] rounded-lg transition-colors"
              >
                Change Priority
              </button>
              <button
                onClick={handleEscalate}
                className="w-full text-left px-3 py-2 text-sm text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#22272B] rounded-lg transition-colors"
              >
                Escalate to Manager
              </button>
              <button
                onClick={handleMerge}
                className="w-full text-left px-3 py-2 text-sm text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#22272B] rounded-lg transition-colors"
              >
                Merge with Another Ticket
              </button>
            </div>
          </motion.div>
        </div>
      </div>
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className={`flex items-center gap-3 px-5 py-3 rounded-lg shadow-xl ${
            toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
          }`}>
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default TicketDetailPage;
