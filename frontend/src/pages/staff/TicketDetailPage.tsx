import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface TicketMessage {
  id: string;
  senderName: string;
  senderRole: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  isInternal: boolean;
  attachments: string[];
}

interface TicketDetails {
  ticketNumber: string;
  subject: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'waiting_on_customer' | 'waiting_on_internal' | 'resolved' | 'closed';
  category: string;
  assignedTo: string;
  reporterName: string;
  reporterEmail: string;
  reporterRole: string;
  tags: string[];
  slaDeadline: string;
  slaStatus: 'on_track' | 'at_risk' | 'breached';
  slaRemaining: string;
  createdAt: string;
  updatedAt: string;
  firstResponseAt: string | null;
  messages: TicketMessage[];
}

const TicketDetailPage: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [ticket, setTicket] = useState<TicketDetails | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [showInternalNotes, setShowInternalNotes] = useState(true);

  const mockTicket: TicketDetails = {
    ticketNumber: ticketId || 'TK-2024-0089',
    subject: 'Payment gateway timeout affecting multiple families',
    priority: 'critical',
    status: 'in_progress',
    category: 'Payment',
    assignedTo: 'James Kariuki',
    reporterName: 'Mary Wanjiku',
    reporterEmail: 'mary.wanjiku@email.co.ke',
    reporterRole: 'Parent',
    tags: ['m-pesa', 'payment', 'urgent', 'multi-user'],
    slaDeadline: '2024-01-15T11:00:00Z',
    slaStatus: 'at_risk',
    slaRemaining: '1h 23m',
    createdAt: '2024-01-15T07:00:00Z',
    updatedAt: '2024-01-15T09:30:00Z',
    firstResponseAt: '2024-01-15T07:15:00Z',
    messages: [
      {
        id: 'msg-1', senderName: 'Mary Wanjiku', senderRole: 'Parent', senderAvatar: 'MW',
        content: 'I have been trying to make a payment for my two children\'s enrollment since this morning but the M-Pesa payment keeps timing out. I get an error "Transaction timeout - please try again." I have tried 4 times already and my M-Pesa balance was debited once but no confirmation received on the platform. My children need access by tomorrow. Please help urgently!',
        timestamp: '2024-01-15T07:00:00Z', isInternal: false, attachments: ['screenshot_error.png'],
      },
      {
        id: 'msg-2', senderName: 'James Kariuki', senderRole: 'Staff', senderAvatar: 'JK',
        content: 'Hello Mary, thank you for reaching out. I understand the urgency and I am sorry for the inconvenience. I can see the failed transaction attempts in our system. Let me investigate the M-Pesa integration status right away. In the meantime, could you please share the M-Pesa transaction ID from the SMS you received for the debited amount?',
        timestamp: '2024-01-15T07:15:00Z', isInternal: false, attachments: [],
      },
      {
        id: 'msg-3', senderName: 'James Kariuki', senderRole: 'Staff', senderAvatar: 'JK',
        content: 'INTERNAL: Checked M-Pesa API dashboard - seeing elevated error rates since 6:00 AM. Appears to be an issue on Safaricom\'s callback endpoint. 12 other families also affected. Escalating to tech team and reaching out to our Safaricom contact.',
        timestamp: '2024-01-15T07:20:00Z', isInternal: true, attachments: [],
      },
      {
        id: 'msg-4', senderName: 'Mary Wanjiku', senderRole: 'Parent', senderAvatar: 'MW',
        content: 'The M-Pesa transaction code is RCJ8KMQT2P. The amount of KSh 2,500 was deducted from my account at 7:02 AM today.',
        timestamp: '2024-01-15T07:45:00Z', isInternal: false, attachments: ['mpesa_sms_screenshot.jpg'],
      },
      {
        id: 'msg-5', senderName: 'James Kariuki', senderRole: 'Staff', senderAvatar: 'JK',
        content: 'Thank you Mary. I have confirmed the transaction RCJ8KMQT2P in our system. The payment was received but the callback failed, so it was not applied to your account. I am manually crediting your account now. For the enrollment access, I will grant temporary access while we process the full payment reconciliation.',
        timestamp: '2024-01-15T08:30:00Z', isInternal: false, attachments: [],
      },
      {
        id: 'msg-6', senderName: 'Tech Team', senderRole: 'Staff', senderAvatar: 'TT',
        content: 'INTERNAL: M-Pesa callback issue identified and being tracked under incident INC-2024-045. Safaricom acknowledged the issue on their end. ETA for resolution is 2-3 hours. All affected transactions need manual reconciliation. List of 12 affected families attached.',
        timestamp: '2024-01-15T09:00:00Z', isInternal: true, attachments: ['affected_transactions.csv'],
      },
    ],
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setTicket(mockTicket);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [ticketId]);

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-500/20 text-red-400 border-red-500/30',
      high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      low: 'bg-green-500/20 text-green-400 border-green-500/30',
    };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${colors[priority]}`}>{priority}</span>;
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; color: string }> = {
      open: { label: 'Open', color: 'bg-blue-500/20 text-blue-400' },
      in_progress: { label: 'In Progress', color: 'bg-cyan-500/20 text-cyan-400' },
      waiting_on_customer: { label: 'Waiting (Customer)', color: 'bg-yellow-500/20 text-yellow-400' },
      waiting_on_internal: { label: 'Waiting (Internal)', color: 'bg-purple-500/20 text-purple-400' },
      resolved: { label: 'Resolved', color: 'bg-green-500/20 text-green-400' },
      closed: { label: 'Closed', color: 'bg-white/10 text-white/40' },
    };
    const { label, color } = config[status] || { label: status, color: 'bg-white/10 text-white/40' };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>{label}</span>;
  };

  const getSLAColor = (status: string) => {
    const colors: Record<string, string> = {
      on_track: 'text-green-400 bg-green-500/10 border-green-500/20',
      at_risk: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
      breached: 'text-red-400 bg-red-500/10 border-red-500/20',
    };
    return colors[status] || '';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-KE', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const getAvatarColor = (name: string) => {
    const colors = ['bg-blue-600', 'bg-purple-600', 'bg-green-600', 'bg-orange-600', 'bg-cyan-600'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !ticket) return;
    const newMsg: TicketMessage = {
      id: `msg-${Date.now()}`,
      senderName: 'You (Staff)',
      senderRole: 'Staff',
      senderAvatar: 'YS',
      content: isInternalNote ? `INTERNAL: ${newMessage}` : newMessage,
      timestamp: new Date().toISOString(),
      isInternal: isInternalNote,
      attachments: [],
    };
    setTicket({ ...ticket, messages: [...ticket.messages, newMsg] });
    setNewMessage('');
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-5 w-48 bg-[#181C1F] rounded animate-pulse" />
        <div className="h-16 w-full bg-[#181C1F] rounded-xl border border-[#22272B] animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-[#181C1F] rounded-xl border border-[#22272B] animate-pulse" />
            ))}
          </div>
          <div className="h-80 bg-[#181C1F] rounded-xl border border-[#22272B] animate-pulse" />
        </div>
      </div>
    );
  }

  if (!ticket) return null;

  const visibleMessages = ticket.messages.filter(m => showInternalNotes || !m.isInternal);

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <button onClick={() => navigate('/staff/tickets')} className="text-white/40 hover:text-white transition-colors">
          Tickets
        </button>
        <span className="text-white/20">/</span>
        <span className="text-white/70">{ticket.ticketNumber}</span>
      </div>

      {/* Ticket Header */}
      <div className="bg-[#181C1F] rounded-xl border border-[#22272B] p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm text-[#E40000] font-mono font-bold">{ticket.ticketNumber}</span>
              {getPriorityBadge(ticket.priority)}
              {getStatusBadge(ticket.status)}
            </div>
            <h1 className="text-lg font-bold text-white">{ticket.subject}</h1>
          </div>
          <div className={`px-3 py-2 rounded-lg border text-center ${getSLAColor(ticket.slaStatus)}`}>
            <p className="text-xs uppercase tracking-wider opacity-70">SLA</p>
            <p className="text-sm font-bold">{ticket.slaRemaining}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Conversation Thread */}
        <div className="lg:col-span-2 space-y-4">
          {/* Internal Notes Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInternalNotes(!showInternalNotes)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                showInternalNotes
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'bg-[#181C1F] text-white/40 border border-[#22272B]'
              }`}
            >
              {showInternalNotes ? 'Showing' : 'Hiding'} Internal Notes
            </button>
          </div>

          {/* Messages */}
          <div className="space-y-4">
            {visibleMessages.map((msg) => (
              <div
                key={msg.id}
                className={`rounded-xl border p-4 ${
                  msg.isInternal
                    ? 'bg-purple-500/5 border-purple-500/20'
                    : 'bg-[#181C1F] border-[#22272B]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${getAvatarColor(msg.senderName)}`}>
                    {msg.senderAvatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-white">{msg.senderName}</span>
                      <span className="text-xs text-white/30">{msg.senderRole}</span>
                      {msg.isInternal && (
                        <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded">Internal</span>
                      )}
                      <span className="text-xs text-white/30 ml-auto">{formatDate(msg.timestamp)}</span>
                    </div>
                    <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
                      {msg.isInternal ? msg.content.replace('INTERNAL: ', '') : msg.content}
                    </p>
                    {msg.attachments.length > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        {msg.attachments.map((att, i) => (
                          <span key={i} className="px-2 py-1 bg-[#0F1112] rounded text-xs text-white/50 border border-[#22272B]">
                            <svg className="w-3 h-3 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                            {att}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="bg-[#181C1F] rounded-xl border border-[#22272B] p-4">
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() => setIsInternalNote(false)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  !isInternalNote ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'
                }`}
              >
                Reply
              </button>
              <button
                onClick={() => setIsInternalNote(true)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  isInternalNote ? 'bg-purple-500/20 text-purple-400' : 'text-white/40 hover:text-white/60'
                }`}
              >
                Internal Note
              </button>
            </div>
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={isInternalNote ? 'Add an internal note...' : 'Type your reply...'}
              rows={3}
              className={`w-full px-4 py-3 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none resize-none ${
                isInternalNote
                  ? 'bg-purple-500/5 border border-purple-500/20 focus:border-purple-500/40'
                  : 'bg-[#0F1112] border border-[#22272B] focus:border-[#E40000]/50'
              }`}
            />
            <div className="flex items-center justify-between mt-3">
              <button className="text-xs text-white/30 hover:text-white/50 transition-colors">
                Attach file
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isInternalNote
                    ? 'bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-40'
                    : 'bg-[#E40000] hover:bg-[#E40000]/90 text-white disabled:opacity-40'
                }`}
              >
                {isInternalNote ? 'Add Note' : 'Send Reply'}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Ticket Details */}
        <div className="space-y-4">
          {/* Details Panel */}
          <div className="bg-[#181C1F] rounded-xl border border-[#22272B] p-4 space-y-4">
            <h3 className="text-sm font-semibold text-white">Ticket Details</h3>

            <div>
              <p className="text-xs text-white/40 mb-1">Assigned To</p>
              <p className="text-sm text-white">{ticket.assignedTo}</p>
            </div>

            <div>
              <p className="text-xs text-white/40 mb-1">Reporter</p>
              <p className="text-sm text-white">{ticket.reporterName}</p>
              <p className="text-xs text-white/40">{ticket.reporterEmail}</p>
              <p className="text-xs text-white/40">{ticket.reporterRole}</p>
            </div>

            <div>
              <p className="text-xs text-white/40 mb-1">Category</p>
              <p className="text-sm text-white">{ticket.category}</p>
            </div>

            <div>
              <p className="text-xs text-white/40 mb-1">Tags</p>
              <div className="flex flex-wrap gap-1">
                {ticket.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 bg-[#0F1112] border border-[#22272B] rounded text-xs text-white/50">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-white/40 mb-1">Created</p>
              <p className="text-xs text-white/60">{formatDate(ticket.createdAt)}</p>
            </div>

            <div>
              <p className="text-xs text-white/40 mb-1">Last Updated</p>
              <p className="text-xs text-white/60">{formatDate(ticket.updatedAt)}</p>
            </div>

            {ticket.firstResponseAt && (
              <div>
                <p className="text-xs text-white/40 mb-1">First Response</p>
                <p className="text-xs text-white/60">{formatDate(ticket.firstResponseAt)}</p>
              </div>
            )}
          </div>

          {/* SLA Info */}
          <div className={`rounded-xl border p-4 ${getSLAColor(ticket.slaStatus)}`}>
            <h3 className="text-sm font-semibold mb-2">SLA Information</h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs opacity-70">Deadline</p>
                <p className="text-sm font-medium">{formatDate(ticket.slaDeadline)}</p>
              </div>
              <div>
                <p className="text-xs opacity-70">Time Remaining</p>
                <p className="text-lg font-bold">{ticket.slaRemaining}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button className="w-full px-4 py-2 bg-[#181C1F] border border-[#22272B] rounded-lg text-sm text-white/70 hover:text-white hover:border-blue-500/50 transition-colors text-left">
              Assign to...
            </button>
            <button className="w-full px-4 py-2 bg-[#181C1F] border border-[#22272B] rounded-lg text-sm text-white/70 hover:text-white hover:border-orange-500/50 transition-colors text-left">
              Escalate
            </button>
            <button className="w-full px-4 py-2 bg-green-600/10 border border-green-500/30 rounded-lg text-sm text-green-400 hover:bg-green-600/20 transition-colors text-left">
              Mark as Resolved
            </button>
            <button className="w-full px-4 py-2 bg-[#181C1F] border border-[#22272B] rounded-lg text-sm text-white/40 hover:text-white/60 transition-colors text-left">
              Close Ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailPage;
