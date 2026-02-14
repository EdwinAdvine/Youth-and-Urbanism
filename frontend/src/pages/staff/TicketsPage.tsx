import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'waiting_on_customer' | 'waiting_on_internal' | 'resolved' | 'closed';
  category: string;
  assignedTo: string;
  reporterName: string;
  reporterRole: string;
  slaDeadline: string;
  slaStatus: 'on_track' | 'at_risk' | 'breached';
  slaRemaining: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

interface TicketStats {
  totalOpen: number;
  criticalSLA: number;
  avgResolutionTime: string;
  csatScore: number;
}

const TicketsPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<TicketStats>({ totalOpen: 0, criticalSLA: 0, avgResolutionTime: '0h', csatScore: 0 });
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const mockTickets: Ticket[] = [
    {
      id: '1', ticketNumber: 'TK-2024-0089', subject: 'Payment gateway timeout affecting multiple families',
      description: 'M-Pesa payments failing with timeout error',
      priority: 'critical', status: 'open', category: 'Payment', assignedTo: 'James K.',
      reporterName: 'Mary Wanjiku', reporterRole: 'Parent',
      slaDeadline: '2024-01-15T11:00:00Z', slaStatus: 'at_risk', slaRemaining: '1h 23m',
      createdAt: '2024-01-15T07:00:00Z', updatedAt: '2024-01-15T09:30:00Z', messageCount: 5,
    },
    {
      id: '2', ticketNumber: 'TK-2024-0091', subject: 'Cannot access Grade 7 CBC content modules',
      description: 'Student gets 403 error when opening any Grade 7 content',
      priority: 'high', status: 'in_progress', category: 'Access', assignedTo: 'Sarah M.',
      reporterName: 'Otieno Ochieng', reporterRole: 'Parent',
      slaDeadline: '2024-01-15T14:00:00Z', slaStatus: 'on_track', slaRemaining: '4h 15m',
      createdAt: '2024-01-15T08:00:00Z', updatedAt: '2024-01-15T09:45:00Z', messageCount: 3,
    },
    {
      id: '3', ticketNumber: 'TK-2024-0087', subject: 'AI tutor giving incorrect Kiswahili translations',
      description: 'AI tutor translating Grade 5 vocab incorrectly',
      priority: 'critical', status: 'in_progress', category: 'AI Tutor', assignedTo: 'Dr. Amina H.',
      reporterName: 'Peter Kamau', reporterRole: 'Instructor',
      slaDeadline: '2024-01-15T10:30:00Z', slaStatus: 'breached', slaRemaining: 'Breached 42m ago',
      createdAt: '2024-01-14T16:00:00Z', updatedAt: '2024-01-15T08:00:00Z', messageCount: 8,
    },
    {
      id: '4', ticketNumber: 'TK-2024-0093', subject: 'Parent dashboard showing wrong student data',
      description: 'Dashboard shows another family\'s student grades and progress',
      priority: 'high', status: 'open', category: 'Data Issue', assignedTo: 'David O.',
      reporterName: 'Lucy Akinyi', reporterRole: 'Parent',
      slaDeadline: '2024-01-15T16:00:00Z', slaStatus: 'on_track', slaRemaining: '6h 10m',
      createdAt: '2024-01-15T09:00:00Z', updatedAt: '2024-01-15T09:00:00Z', messageCount: 1,
    },
    {
      id: '5', ticketNumber: 'TK-2024-0085', subject: 'Certificate generation failing for completed courses',
      description: 'Students who completed Grade 6 Math course cannot generate certificates',
      priority: 'medium', status: 'waiting_on_internal', category: 'Feature', assignedTo: 'Kevin M.',
      reporterName: 'System Auto-Report', reporterRole: 'System',
      slaDeadline: '2024-01-16T10:00:00Z', slaStatus: 'on_track', slaRemaining: '24h 10m',
      createdAt: '2024-01-14T10:00:00Z', updatedAt: '2024-01-15T08:30:00Z', messageCount: 4,
    },
    {
      id: '6', ticketNumber: 'TK-2024-0082', subject: 'Request to add Luo language support for AI tutor',
      description: 'Multiple parents requesting Luo language support in AI chat',
      priority: 'low', status: 'open', category: 'Feature Request', assignedTo: 'Unassigned',
      reporterName: 'Community Forum', reporterRole: 'Multiple',
      slaDeadline: '2024-01-20T10:00:00Z', slaStatus: 'on_track', slaRemaining: '5d 0h',
      createdAt: '2024-01-12T11:00:00Z', updatedAt: '2024-01-13T09:00:00Z', messageCount: 12,
    },
    {
      id: '7', ticketNumber: 'TK-2024-0090', subject: 'Video lessons not loading on slow connections',
      description: 'Students in rural areas unable to stream video content',
      priority: 'medium', status: 'in_progress', category: 'Performance', assignedTo: 'Tech Team',
      reporterName: 'Field Coordinator', reporterRole: 'Staff',
      slaDeadline: '2024-01-16T14:00:00Z', slaStatus: 'on_track', slaRemaining: '28h',
      createdAt: '2024-01-14T14:00:00Z', updatedAt: '2024-01-15T07:00:00Z', messageCount: 6,
    },
    {
      id: '8', ticketNumber: 'TK-2024-0088', subject: 'Enrollment payment not reflected in student account',
      description: 'Parent paid for Grade 8 enrollment via M-Pesa but student shows as unpaid',
      priority: 'high', status: 'waiting_on_customer', category: 'Payment', assignedTo: 'Finance Team',
      reporterName: 'Agnes Mutua', reporterRole: 'Parent',
      slaDeadline: '2024-01-15T12:00:00Z', slaStatus: 'at_risk', slaRemaining: '2h 15m',
      createdAt: '2024-01-14T18:00:00Z', updatedAt: '2024-01-15T08:00:00Z', messageCount: 4,
    },
    {
      id: '9', ticketNumber: 'TK-2024-0086', subject: 'Assessment timer stops unexpectedly',
      description: 'Grade 5 students report the quiz timer freezing mid-assessment',
      priority: 'medium', status: 'resolved', category: 'Bug', assignedTo: 'Dev Team',
      reporterName: 'Jane Mwende', reporterRole: 'Instructor',
      slaDeadline: '2024-01-15T10:00:00Z', slaStatus: 'on_track', slaRemaining: '--',
      createdAt: '2024-01-13T09:00:00Z', updatedAt: '2024-01-14T16:00:00Z', messageCount: 7,
    },
    {
      id: '10', ticketNumber: 'TK-2024-0084', subject: 'Partner content not appearing in content library',
      description: 'Approved partner content from TechKids is not visible to students',
      priority: 'low', status: 'closed', category: 'Content', assignedTo: 'Content Team',
      reporterName: 'TechKids Africa', reporterRole: 'Partner',
      slaDeadline: '2024-01-15T10:00:00Z', slaStatus: 'on_track', slaRemaining: '--',
      createdAt: '2024-01-11T08:00:00Z', updatedAt: '2024-01-13T11:00:00Z', messageCount: 9,
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setTickets(mockTickets);
      const openTickets = mockTickets.filter(t => !['resolved', 'closed'].includes(t.status));
      setStats({
        totalOpen: openTickets.length,
        criticalSLA: mockTickets.filter(t => t.slaStatus === 'breached' || t.slaStatus === 'at_risk').length,
        avgResolutionTime: '14.2h',
        csatScore: 4.3,
      });
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredTickets = tickets.filter((ticket) => {
    if (priorityFilter !== 'all' && ticket.priority !== priorityFilter) return false;
    if (statusFilter !== 'all' && ticket.status !== statusFilter) return false;
    if (searchTerm && !ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const getPriorityBadge = (priority: Ticket['priority']) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-500/20 text-red-400 border-red-500/30',
      high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      low: 'bg-green-500/20 text-green-400 border-green-500/30',
    };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${colors[priority]}`}>{priority}</span>;
  };

  const getStatusBadge = (status: Ticket['status']) => {
    const config: Record<string, { label: string; color: string }> = {
      open: { label: 'Open', color: 'bg-blue-500/20 text-blue-400' },
      in_progress: { label: 'In Progress', color: 'bg-cyan-500/20 text-cyan-400' },
      waiting_on_customer: { label: 'Waiting (Customer)', color: 'bg-yellow-500/20 text-yellow-400' },
      waiting_on_internal: { label: 'Waiting (Internal)', color: 'bg-purple-500/20 text-purple-400' },
      resolved: { label: 'Resolved', color: 'bg-green-500/20 text-green-400' },
      closed: { label: 'Closed', color: 'bg-white/10 text-white/40' },
    };
    const { label, color } = config[status];
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>{label}</span>;
  };

  const getSLAIndicator = (slaStatus: Ticket['slaStatus'], remaining: string) => {
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
        <div className={`w-2 h-2 rounded-full ${dots[slaStatus]}`} />
        <span className={`text-xs ${colors[slaStatus]}`}>{remaining}</span>
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
        <div className="h-7 w-56 bg-[#181C1F] rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-[#181C1F] rounded-xl border border-[#22272B] animate-pulse" />
          ))}
        </div>
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-14 bg-[#181C1F] rounded-lg border border-[#22272B] animate-pulse" />
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
          <h1 className="text-xl font-bold text-white">Tickets & Conversations</h1>
          <p className="text-sm text-white/50 mt-1">
            Manage support tickets, track SLAs, and resolve issues
          </p>
        </div>
        <button className="px-4 py-2 bg-[#E40000] hover:bg-[#E40000]/90 text-white text-sm font-medium rounded-lg transition-colors">
          New Ticket
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#181C1F] rounded-xl border border-[#22272B] p-4">
          <p className="text-xs text-white/50 uppercase tracking-wider">Total Open</p>
          <p className="text-2xl font-bold text-white mt-1">{stats.totalOpen}</p>
        </div>
        <div className="bg-[#181C1F] rounded-xl border border-[#22272B] p-4">
          <p className="text-xs text-white/50 uppercase tracking-wider">Critical SLA</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{stats.criticalSLA}</p>
        </div>
        <div className="bg-[#181C1F] rounded-xl border border-[#22272B] p-4">
          <p className="text-xs text-white/50 uppercase tracking-wider">Avg Resolution</p>
          <p className="text-2xl font-bold text-white mt-1">{stats.avgResolutionTime}</p>
        </div>
        <div className="bg-[#181C1F] rounded-xl border border-[#22272B] p-4">
          <p className="text-xs text-white/50 uppercase tracking-wider">CSAT Score</p>
          <div className="flex items-baseline gap-1 mt-1">
            <p className="text-2xl font-bold text-green-400">{stats.csatScore}</p>
            <p className="text-sm text-white/30">/5.0</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-[#181C1F] rounded-xl border border-[#22272B]">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search tickets by subject or number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0F1112] border border-[#22272B] rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#E40000]/50"
          />
        </div>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-2 bg-[#0F1112] border border-[#22272B] rounded-lg text-sm text-white/70 focus:outline-none focus:border-[#E40000]/50"
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
          className="px-3 py-2 bg-[#0F1112] border border-[#22272B] rounded-lg text-sm text-white/70 focus:outline-none focus:border-[#E40000]/50"
        >
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="waiting_on_customer">Waiting (Customer)</option>
          <option value="waiting_on_internal">Waiting (Internal)</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <span className="text-xs text-white/40">
          {filteredTickets.length} tickets
        </span>
      </div>

      {/* Data Table */}
      <div className="bg-[#181C1F] rounded-xl border border-[#22272B] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#22272B]">
                <th className="text-left px-4 py-3 text-xs font-medium text-white/50 uppercase tracking-wider">Ticket #</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-white/50 uppercase tracking-wider">Subject</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-white/50 uppercase tracking-wider">Priority</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-white/50 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-white/50 uppercase tracking-wider">Assigned To</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-white/50 uppercase tracking-wider">SLA Remaining</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-white/50 uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#22272B]">
              {filteredTickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                  onClick={() => navigate(`/staff/tickets/${ticket.ticketNumber}`)}
                >
                  <td className="px-4 py-3">
                    <span className="text-sm text-[#E40000] font-mono">{ticket.ticketNumber}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm text-white font-medium">{ticket.subject}</p>
                      <p className="text-xs text-white/40 mt-0.5">
                        {ticket.reporterName} ({ticket.reporterRole}) &middot; {ticket.messageCount} messages
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">{getPriorityBadge(ticket.priority)}</td>
                  <td className="px-4 py-3">{getStatusBadge(ticket.status)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs ${ticket.assignedTo === 'Unassigned' ? 'text-red-400' : 'text-white/60'}`}>
                      {ticket.assignedTo}
                    </span>
                  </td>
                  <td className="px-4 py-3">{getSLAIndicator(ticket.slaStatus, ticket.slaRemaining)}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-white/50">{formatDate(ticket.createdAt)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TicketsPage;
