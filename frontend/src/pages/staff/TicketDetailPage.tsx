import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getTicket,
  addMessage,
  assignTicket,
  escalateTicket,
  updateTicket,
} from '@/services/staff/staffSupportService';
import { getTeamMembers } from '@/services/staff/staffTeamService';
import type { TeamMember } from '@/services/staff/staffTeamService';
import type { StaffTicket, TicketMessage } from '@/types/staff';

const TicketDetailPage: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [ticket, setTicket] = useState<StaffTicket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [showInternalNotes, setShowInternalNotes] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

  // Assign modal state
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(false);

  // Escalate modal state
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalateReason, setEscalateReason] = useState('');
  const [escalating, setEscalating] = useState(false);

  // Action loading
  const [actionLoading, setActionLoading] = useState('');

  // File attach ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  const fetchTicket = useCallback(async () => {
    if (!ticketId) return;
    setIsLoading(true);
    setError('');
    try {
      const data = await getTicket(ticketId);
      setTicket(data);
      // Messages are not part of StaffTicket type, so we'll track them separately
      // The API may return messages as part of a detail endpoint; for now we keep
      // the messages list in local state after sending new ones.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ticket');
    } finally {
      setIsLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !ticketId || !ticket) return;
    setSendingMessage(true);
    try {
      const sentMessage = await addMessage(ticketId, {
        content: newMessage.trim(),
        is_internal: isInternalNote,
      });
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');
      setAttachedFiles([]);
      // Refresh ticket to get updated message count and status
      fetchTicket();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleOpenAssign = async () => {
    setShowAssignDropdown(!showAssignDropdown);
    if (!showAssignDropdown && teamMembers.length === 0) {
      setLoadingTeam(true);
      try {
        const members = await getTeamMembers();
        setTeamMembers(members);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load team members');
      } finally {
        setLoadingTeam(false);
      }
    }
  };

  const handleAssign = async (memberId: string) => {
    if (!ticketId) return;
    setActionLoading('assign');
    try {
      await assignTicket(ticketId, memberId);
      setShowAssignDropdown(false);
      fetchTicket();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign ticket');
    } finally {
      setActionLoading('');
    }
  };

  const handleEscalate = async () => {
    if (!ticketId || !escalateReason.trim()) return;
    setEscalating(true);
    try {
      await escalateTicket(ticketId, escalateReason.trim());
      setShowEscalateModal(false);
      setEscalateReason('');
      fetchTicket();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to escalate ticket');
    } finally {
      setEscalating(false);
    }
  };

  const handleResolve = async () => {
    if (!ticketId) return;
    setActionLoading('resolve');
    try {
      await updateTicket(ticketId, { status: 'resolved' });
      fetchTicket();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve ticket');
    } finally {
      setActionLoading('');
    }
  };

  const handleClose = async () => {
    if (!ticketId) return;
    setActionLoading('close');
    try {
      await updateTicket(ticketId, { status: 'closed' });
      fetchTicket();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to close ticket');
    } finally {
      setActionLoading('');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeAttachedFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

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
      waiting: { label: 'Waiting', color: 'bg-yellow-500/20 text-yellow-400' },
      escalated: { label: 'Escalated', color: 'bg-purple-500/20 text-purple-400' },
      resolved: { label: 'Resolved', color: 'bg-green-500/20 text-green-400' },
      closed: { label: 'Closed', color: 'bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-white/40' },
    };
    const { label, color } = config[status] || { label: status, color: 'bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-white/40' };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>{label}</span>;
  };

  const getSLAColor = (slaStatus: StaffTicket['sla_status']) => {
    if (!slaStatus) return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    if (slaStatus.is_breached) return 'text-red-400 bg-red-500/10 border-red-500/20';
    if (slaStatus.time_remaining_minutes != null && slaStatus.time_remaining_minutes < 60) {
      return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    }
    return 'text-green-400 bg-green-500/10 border-green-500/20';
  };

  const getSLARemainingText = (slaStatus: StaffTicket['sla_status']) => {
    if (!slaStatus) return '--';
    if (slaStatus.is_breached) {
      return slaStatus.time_remaining_minutes != null
        ? `Breached ${Math.abs(slaStatus.time_remaining_minutes)}m ago`
        : 'Breached';
    }
    if (slaStatus.time_remaining_minutes == null) return '--';
    const hours = Math.floor(slaStatus.time_remaining_minutes / 60);
    const mins = slaStatus.time_remaining_minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-5 w-48 bg-white dark:bg-[#181C1F] rounded animate-pulse" />
        <div className="h-16 w-full bg-white dark:bg-[#181C1F] rounded-xl border border-gray-200 dark:border-[#22272B] animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-white dark:bg-[#181C1F] rounded-xl border border-gray-200 dark:border-[#22272B] animate-pulse" />
            ))}
          </div>
          <div className="h-80 bg-white dark:bg-[#181C1F] rounded-xl border border-gray-200 dark:border-[#22272B] animate-pulse" />
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-6 space-y-4">
        <button onClick={() => navigate('/dashboard/staff/support/tickets')} className="text-sm text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/60">
          &larr; Back to Tickets
        </button>
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
          <p className="text-sm text-red-400">{error || 'Ticket not found'}</p>
          <button onClick={fetchTicket} className="mt-2 text-xs text-red-400 underline hover:text-red-300">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const visibleMessages = messages.filter(m => showInternalNotes || !m.is_internal);

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <button onClick={() => navigate('/dashboard/staff/support/tickets')} className="text-gray-400 dark:text-white/40 hover:text-gray-900 dark:hover:text-white transition-colors">
          Tickets
        </button>
        <span className="text-gray-400 dark:text-gray-300 dark:text-white/20">/</span>
        <span className="text-gray-600 dark:text-white/70">{ticket.ticket_number}</span>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-between">
          <span className="text-sm text-red-400">{error}</span>
          <button onClick={() => setError('')} className="text-xs text-red-400 hover:text-red-300">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Ticket Header */}
      <div className="bg-white dark:bg-[#181C1F] rounded-xl border border-gray-200 dark:border-[#22272B] p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm text-[#E40000] font-mono font-bold">{ticket.ticket_number}</span>
              {getPriorityBadge(ticket.priority)}
              {getStatusBadge(ticket.status)}
            </div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">{ticket.subject}</h1>
          </div>
          <div className={`px-3 py-2 rounded-lg border text-center ${getSLAColor(ticket.sla_status)}`}>
            <p className="text-xs uppercase tracking-wider opacity-70">SLA</p>
            <p className="text-sm font-bold">{getSLARemainingText(ticket.sla_status)}</p>
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
                  : 'bg-white dark:bg-[#181C1F] text-gray-400 dark:text-white/40 border border-gray-200 dark:border-[#22272B]'
              }`}
            >
              {showInternalNotes ? 'Showing' : 'Hiding'} Internal Notes
            </button>
          </div>

          {/* Messages */}
          <div className="space-y-4">
            {visibleMessages.length === 0 && (
              <div className="bg-white dark:bg-[#181C1F] rounded-xl border border-gray-200 dark:border-[#22272B] p-8 text-center">
                <p className="text-sm text-gray-400 dark:text-white/40">No messages yet. Send the first reply below.</p>
              </div>
            )}
            {visibleMessages.map((msg) => (
              <div
                key={msg.id}
                className={`rounded-xl border p-4 ${
                  msg.is_internal
                    ? 'bg-purple-500/5 border-purple-500/20'
                    : 'bg-white dark:bg-[#181C1F] border-gray-200 dark:border-[#22272B]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${getAvatarColor(msg.author_name)}`}>
                    {getInitials(msg.author_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{msg.author_name}</span>
                      <span className="text-xs text-gray-400 dark:text-white/30">{msg.author_role}</span>
                      {msg.is_internal && (
                        <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded">Internal</span>
                      )}
                      <span className="text-xs text-gray-400 dark:text-white/30 ml-auto">{formatDate(msg.created_at)}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-white/70 leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </p>
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        {msg.attachments.map((att, i) => (
                          <span key={i} className="px-2 py-1 bg-gray-50 dark:bg-[#0F1112] rounded text-xs text-gray-500 dark:text-white/50 border border-gray-200 dark:border-[#22272B]">
                            <svg className="w-3 h-3 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                            {(att as Record<string, unknown>).name as string || `Attachment ${i + 1}`}
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
          <div className="bg-white dark:bg-[#181C1F] rounded-xl border border-gray-200 dark:border-[#22272B] p-4">
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() => setIsInternalNote(false)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  !isInternalNote ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white' : 'text-gray-400 dark:text-white/40 hover:text-gray-500 dark:hover:text-white/60'
                }`}
              >
                Reply
              </button>
              <button
                onClick={() => setIsInternalNote(true)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  isInternalNote ? 'bg-purple-500/20 text-purple-400' : 'text-gray-400 dark:text-white/40 hover:text-gray-500 dark:hover:text-white/60'
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
              className={`w-full px-4 py-3 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none resize-none ${
                isInternalNote
                  ? 'bg-purple-500/5 border border-purple-500/20 focus:border-purple-500/40'
                  : 'bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] focus:border-[#E40000]/50'
              }`}
            />
            {/* Attached files preview */}
            {attachedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {attachedFiles.map((file, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 dark:bg-[#0F1112] rounded text-xs text-gray-500 dark:text-white/50 border border-gray-200 dark:border-[#22272B]">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    {file.name}
                    <button onClick={() => removeAttachedFile(i)} className="ml-1 text-gray-400 hover:text-red-400">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between mt-3">
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-gray-400 dark:text-white/30 hover:text-gray-500 dark:hover:text-white/50 transition-colors"
                >
                  Attach file
                </button>
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sendingMessage}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isInternalNote
                    ? 'bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-40'
                    : 'bg-[#E40000] hover:bg-[#E40000]/90 text-white disabled:opacity-40'
                }`}
              >
                {sendingMessage ? 'Sending...' : isInternalNote ? 'Add Note' : 'Send Reply'}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Ticket Details */}
        <div className="space-y-4">
          {/* Details Panel */}
          <div className="bg-white dark:bg-[#181C1F] rounded-xl border border-gray-200 dark:border-[#22272B] p-4 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Ticket Details</h3>

            <div>
              <p className="text-xs text-gray-400 dark:text-white/40 mb-1">Assigned To</p>
              <p className="text-sm text-gray-900 dark:text-white">{ticket.assigned_to?.name || 'Unassigned'}</p>
            </div>

            <div>
              <p className="text-xs text-gray-400 dark:text-white/40 mb-1">Reporter</p>
              <p className="text-sm text-gray-900 dark:text-white">{ticket.reporter.name}</p>
              <p className="text-xs text-gray-400 dark:text-white/40">{ticket.reporter.email}</p>
              <p className="text-xs text-gray-400 dark:text-white/40">{ticket.reporter.role}</p>
            </div>

            <div>
              <p className="text-xs text-gray-400 dark:text-white/40 mb-1">Category</p>
              <p className="text-sm text-gray-900 dark:text-white capitalize">{ticket.category}</p>
            </div>

            <div>
              <p className="text-xs text-gray-400 dark:text-white/40 mb-1">Tags</p>
              <div className="flex flex-wrap gap-1">
                {ticket.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded text-xs text-gray-500 dark:text-white/50">
                    {tag}
                  </span>
                ))}
                {ticket.tags.length === 0 && (
                  <span className="text-xs text-gray-400 dark:text-white/30">No tags</span>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400 dark:text-white/40 mb-1">Created</p>
              <p className="text-xs text-gray-500 dark:text-white/60">{formatDate(ticket.created_at)}</p>
            </div>

            <div>
              <p className="text-xs text-gray-400 dark:text-white/40 mb-1">Last Updated</p>
              <p className="text-xs text-gray-500 dark:text-white/60">{formatDate(ticket.updated_at)}</p>
            </div>

            {ticket.first_response_at && (
              <div>
                <p className="text-xs text-gray-400 dark:text-white/40 mb-1">First Response</p>
                <p className="text-xs text-gray-500 dark:text-white/60">{formatDate(ticket.first_response_at)}</p>
              </div>
            )}
          </div>

          {/* SLA Info */}
          <div className={`rounded-xl border p-4 ${getSLAColor(ticket.sla_status)}`}>
            <h3 className="text-sm font-semibold mb-2">SLA Information</h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs opacity-70">Deadline</p>
                <p className="text-sm font-medium">
                  {ticket.sla_status?.resolution_deadline
                    ? formatDate(ticket.sla_status.resolution_deadline)
                    : '--'}
                </p>
              </div>
              <div>
                <p className="text-xs opacity-70">Time Remaining</p>
                <p className="text-lg font-bold">{getSLARemainingText(ticket.sla_status)}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 relative">
            {/* Assign Button + Dropdown */}
            <div className="relative">
              <button
                onClick={handleOpenAssign}
                disabled={actionLoading === 'assign'}
                className="w-full px-4 py-2 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg text-sm text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:border-blue-500/50 transition-colors text-left disabled:opacity-40"
              >
                {actionLoading === 'assign' ? 'Assigning...' : 'Assign to...'}
              </button>
              {showAssignDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg shadow-xl z-10 max-h-48 overflow-y-auto">
                  {loadingTeam ? (
                    <div className="p-3 text-xs text-gray-400 dark:text-white/40 text-center">Loading team members...</div>
                  ) : teamMembers.length === 0 ? (
                    <div className="p-3 text-xs text-gray-400 dark:text-white/40 text-center">No team members found</div>
                  ) : (
                    teamMembers.filter(m => m.is_active).map(member => (
                      <button
                        key={member.id}
                        onClick={() => handleAssign(member.id)}
                        className="w-full px-3 py-2 text-left text-sm text-gray-600 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors flex items-center gap-2"
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${getAvatarColor(member.name)}`}>
                          {getInitials(member.name)}
                        </div>
                        <div>
                          <p className="text-xs font-medium">{member.name}</p>
                          <p className="text-[10px] text-gray-400 dark:text-white/30">{member.position}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => setShowEscalateModal(true)}
              className="w-full px-4 py-2 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg text-sm text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:border-orange-500/50 transition-colors text-left"
            >
              Escalate
            </button>
            <button
              onClick={handleResolve}
              disabled={actionLoading === 'resolve' || ticket.status === 'resolved'}
              className="w-full px-4 py-2 bg-green-600/10 border border-green-500/30 rounded-lg text-sm text-green-400 hover:bg-green-600/20 transition-colors text-left disabled:opacity-40"
            >
              {actionLoading === 'resolve' ? 'Resolving...' : 'Mark as Resolved'}
            </button>
            <button
              onClick={handleClose}
              disabled={actionLoading === 'close' || ticket.status === 'closed'}
              className="w-full px-4 py-2 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg text-sm text-gray-400 dark:text-white/40 hover:text-gray-500 dark:hover:text-white/60 transition-colors text-left disabled:opacity-40"
            >
              {actionLoading === 'close' ? 'Closing...' : 'Close Ticket'}
            </button>
          </div>
        </div>
      </div>

      {/* Escalate Modal */}
      {showEscalateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowEscalateModal(false)} />
          <div className="relative bg-white dark:bg-[#181C1F] rounded-xl border border-gray-200 dark:border-[#22272B] p-6 w-full max-w-md mx-4 shadow-2xl">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Escalate Ticket</h2>
            <p className="text-sm text-gray-500 dark:text-white/50 mb-4">
              Provide a reason for escalating ticket {ticket.ticket_number}.
            </p>
            <textarea
              value={escalateReason}
              onChange={(e) => setEscalateReason(e.target.value)}
              placeholder="Reason for escalation..."
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:border-[#E40000]/50 resize-none"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => { setShowEscalateModal(false); setEscalateReason(''); }}
                className="px-4 py-2 text-sm text-gray-500 dark:text-white/50 hover:text-gray-700 dark:hover:text-white/70 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEscalate}
                disabled={!escalateReason.trim() || escalating}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-40"
              >
                {escalating ? 'Escalating...' : 'Escalate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketDetailPage;
