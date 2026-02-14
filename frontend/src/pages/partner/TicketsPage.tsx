import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Loader2,
  Eye,
  User,
  Inbox,
} from 'lucide-react';

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
type TicketCategory = 'billing' | 'sponsorship' | 'technical' | 'general' | 'account';

interface SupportTicket {
  id: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  assignedTo: string;
}

const TicketsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const stats = [
    { label: 'Open', value: 5, icon: AlertCircle, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'In Progress', value: 3, icon: Loader2, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { label: 'Resolved', value: 28, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Avg Response', value: '4h', icon: Clock, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ];

  const tickets: SupportTicket[] = [
    {
      id: 'TKT-001',
      subject: 'Unable to view sponsorship payment receipt for January',
      category: 'billing',
      priority: 'medium',
      status: 'open',
      createdAt: 'Feb 12, 2026',
      assignedTo: 'Sarah K.',
    },
    {
      id: 'TKT-002',
      subject: 'Request to add 5 new children to STEM Excellence Program',
      category: 'sponsorship',
      priority: 'high',
      status: 'in_progress',
      createdAt: 'Feb 10, 2026',
      assignedTo: 'James M.',
    },
    {
      id: 'TKT-003',
      subject: 'Dashboard analytics not loading correctly',
      category: 'technical',
      priority: 'urgent',
      status: 'open',
      createdAt: 'Feb 14, 2026',
      assignedTo: 'David O.',
    },
    {
      id: 'TKT-004',
      subject: 'How to set up recurring monthly payments via M-Pesa',
      category: 'billing',
      priority: 'low',
      status: 'resolved',
      createdAt: 'Feb 8, 2026',
      assignedTo: 'Sarah K.',
    },
    {
      id: 'TKT-005',
      subject: 'Update organization name and logo on partner profile',
      category: 'account',
      priority: 'low',
      status: 'in_progress',
      createdAt: 'Feb 11, 2026',
      assignedTo: 'Grace N.',
    },
    {
      id: 'TKT-006',
      subject: 'Urgent: Child progress report data appears incorrect',
      category: 'sponsorship',
      priority: 'urgent',
      status: 'open',
      createdAt: 'Feb 14, 2026',
      assignedTo: 'James M.',
    },
  ];

  const getStatusBadge = (status: TicketStatus) => {
    const config: Record<TicketStatus, { label: string; bg: string; text: string; icon: React.ElementType }> = {
      open: { label: 'Open', bg: 'bg-blue-500/20', text: 'text-blue-400', icon: AlertCircle },
      in_progress: { label: 'In Progress', bg: 'bg-yellow-500/20', text: 'text-yellow-400', icon: Loader2 },
      resolved: { label: 'Resolved', bg: 'bg-green-500/20', text: 'text-green-400', icon: CheckCircle },
      closed: { label: 'Closed', bg: 'bg-gray-100 dark:bg-white/10', text: 'text-gray-500 dark:text-white/50', icon: CheckCircle },
    };
    const c = config[status];
    const Icon = c.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${c.bg} ${c.text} border-transparent`}>
        <Icon className="w-3 h-3" />
        {c.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: TicketPriority) => {
    const config: Record<TicketPriority, { label: string; bg: string; text: string; pulse: boolean }> = {
      low: { label: 'Low', bg: 'bg-gray-500/20', text: 'text-gray-400', pulse: false },
      medium: { label: 'Medium', bg: 'bg-amber-500/20', text: 'text-amber-400', pulse: false },
      high: { label: 'High', bg: 'bg-red-500/20', text: 'text-red-400', pulse: false },
      urgent: { label: 'Urgent', bg: 'bg-red-500/20', text: 'text-red-400', pulse: true },
    };
    const c = config[priority];
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text} ${c.pulse ? 'animate-pulse' : ''}`}>
        {priority === 'urgent' && <AlertTriangle className="w-3 h-3" />}
        {c.label}
      </span>
    );
  };

  const getCategoryBadge = (category: TicketCategory) => {
    const config: Record<TicketCategory, { label: string; bg: string; text: string }> = {
      billing: { label: 'Billing', bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
      sponsorship: { label: 'Sponsorship', bg: 'bg-blue-500/10', text: 'text-blue-400' },
      technical: { label: 'Technical', bg: 'bg-orange-500/10', text: 'text-orange-400' },
      general: { label: 'General', bg: 'bg-gray-50 dark:bg-white/5', text: 'text-gray-500 dark:text-white/60' },
      account: { label: 'Account', bg: 'bg-purple-500/10', text: 'text-purple-400' },
    };
    const c = config[category];
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
        {c.label}
      </span>
    );
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || ticket.category === categoryFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F1112] p-6">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <motion.div variants={fadeUp}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Support Tickets</h1>
              <p className="text-gray-500 dark:text-white/60">Track and manage your support requests</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-[#E40000] text-gray-900 dark:text-white rounded-lg hover:bg-[#FF4444] transition-colors">
              <Plus className="w-5 h-5" />
              Create Ticket
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 dark:text-white/50 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div variants={fadeUp}>
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40" />
                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg text-sm text-gray-900 dark:text-white placeholder-white/30 focus:outline-none focus:border-[#E40000]/50"
                />
              </div>
              <div className="flex items-center gap-3">
                <Filter className="w-4 h-4 text-gray-400 dark:text-white/40" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#E40000]/50"
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#E40000]/50"
                >
                  <option value="all">All Categories</option>
                  <option value="billing">Billing</option>
                  <option value="sponsorship">Sponsorship</option>
                  <option value="technical">Technical</option>
                  <option value="account">Account</option>
                  <option value="general">General</option>
                </select>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-3 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#E40000]/50"
                >
                  <option value="all">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Ticket List */}
        <motion.div variants={fadeUp}>
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl overflow-hidden">
            {filteredTickets.length > 0 ? (
              <div className="overflow-x-auto">
                <div className="overflow-x-auto"><table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-[#22272B]">
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 dark:text-white/40">ID</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 dark:text-white/40">Subject</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 dark:text-white/40">Category</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 dark:text-white/40">Priority</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 dark:text-white/40">Status</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 dark:text-white/40">Created</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 dark:text-white/40">Assigned</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 dark:text-white/40">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets.map((ticket) => (
                      <tr
                        key={ticket.id}
                        className="border-b border-gray-200 dark:border-[#22272B] hover:bg-gray-100 dark:hover:bg-[#22272B]/50 dark:bg-[#22272B]/50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <span className="text-xs font-mono text-gray-500 dark:text-white/60">{ticket.id}</span>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm text-gray-900 dark:text-white max-w-xs truncate">{ticket.subject}</p>
                        </td>
                        <td className="py-3 px-4">{getCategoryBadge(ticket.category)}</td>
                        <td className="py-3 px-4">{getPriorityBadge(ticket.priority)}</td>
                        <td className="py-3 px-4">{getStatusBadge(ticket.status)}</td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-500 dark:text-white/60">{ticket.createdAt}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-gray-400 dark:text-white/40" />
                            <span className="text-sm text-gray-500 dark:text-white/60">{ticket.assignedTo}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-[#22272B] text-gray-600 dark:text-white/70 rounded-lg hover:bg-[#2A2F34] transition-colors text-xs">
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table></div>
              </div>
            ) : (
              <div className="p-12 text-center">
                <Inbox className="w-12 h-12 text-gray-400 dark:text-white/20 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No tickets found</h3>
                <p className="text-sm text-gray-500 dark:text-white/60">Try adjusting your filters or search query</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default TicketsPage;
