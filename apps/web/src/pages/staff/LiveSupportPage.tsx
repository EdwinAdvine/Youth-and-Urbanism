import React, { useState, useEffect, useCallback } from 'react';
import { getTeamMembers } from '@/services/staff/staffTeamService';
import type { TeamMember } from '@/services/staff/staffTeamService';

interface ChatSession {
  id: string;
  userName: string;
  userRole: string;
  userAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: 'active' | 'waiting' | 'idle' | 'resolved';
  priority: 'high' | 'medium' | 'low';
  topic: string;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  isStaff: boolean;
}

interface AISuggestion {
  id: string;
  text: string;
  confidence: number;
  source: string;
}

interface SupportStats {
  activeChats: number;
  waitingQueue: number;
  avgWaitTime: string;
  resolvedToday: number;
}

interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'info';
}

const LiveSupportPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [stats, setStats] = useState<SupportStats>({ activeChats: 0, waitingQueue: 0, avgWaitTime: '0m', resolvedToday: 0 });
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({});
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatSearch, setChatSearch] = useState('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Transfer modal state
  const [showTransferDropdown, setShowTransferDropdown] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(false);

  // Toast helper
  const showToast = useCallback((text: string, type: 'success' | 'info' = 'success') => {
    const id = `toast-${Date.now()}`;
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  // Initial data load (local state since this is WebSocket-based)
  const initialSessions: ChatSession[] = [
    { id: 'chat-1', userName: 'Mary Wanjiku', userRole: 'Parent', userAvatar: 'MW', lastMessage: 'My daughter cannot log in to her account', lastMessageTime: '2 min ago', unreadCount: 3, status: 'active', priority: 'high', topic: 'Login Issue' },
    { id: 'chat-2', userName: 'Peter Kamau', userRole: 'Instructor', userAvatar: 'PK', lastMessage: 'How do I upload a new course module?', lastMessageTime: '5 min ago', unreadCount: 1, status: 'active', priority: 'medium', topic: 'Content Upload' },
    { id: 'chat-3', userName: 'Agnes Mutua', userRole: 'Parent', userAvatar: 'AM', lastMessage: 'I need to change my payment plan', lastMessageTime: '8 min ago', unreadCount: 0, status: 'waiting', priority: 'medium', topic: 'Billing' },
    { id: 'chat-4', userName: 'Kevin Otieno', userRole: 'Student', userAvatar: 'KO', lastMessage: 'The quiz timer stopped working', lastMessageTime: '12 min ago', unreadCount: 2, status: 'active', priority: 'high', topic: 'Assessment Bug' },
    { id: 'chat-5', userName: 'Jane Mwende', userRole: 'Instructor', userAvatar: 'JM', lastMessage: 'Can I get analytics for my students?', lastMessageTime: '15 min ago', unreadCount: 0, status: 'idle', priority: 'low', topic: 'Analytics' },
    { id: 'chat-6', userName: 'David Ochieng', userRole: 'Parent', userAvatar: 'DO', lastMessage: 'Waiting for response...', lastMessageTime: '20 min ago', unreadCount: 1, status: 'waiting', priority: 'medium', topic: 'General Inquiry' },
    { id: 'chat-7', userName: 'Grace Nzomo', userRole: 'Parent', userAvatar: 'GN', lastMessage: 'Thank you for the help!', lastMessageTime: '25 min ago', unreadCount: 0, status: 'idle', priority: 'low', topic: 'Enrollment' },
  ];

  const initialMessages: Record<string, ChatMessage[]> = {
    'chat-1': [
      { id: 'm1', senderId: 'user', senderName: 'Mary Wanjiku', content: 'Hello, I need help urgently. My daughter Faith cannot log in to her student account.', timestamp: '9:42 AM', isStaff: false },
      { id: 'm2', senderId: 'staff', senderName: 'You', content: 'Hello Mary, I am sorry to hear that. Let me look into this right away. Can you share the username or email address associated with Faith\'s account?', timestamp: '9:43 AM', isStaff: true },
      { id: 'm3', senderId: 'user', senderName: 'Mary Wanjiku', content: 'Her email is faith.wanjiku@student.urbanhomeschool.co.ke. She has been trying since this morning and keeps getting "Invalid credentials" error.', timestamp: '9:45 AM', isStaff: false },
      { id: 'm4', senderId: 'user', senderName: 'Mary Wanjiku', content: 'She has an exam in Grade 6 Mathematics today and needs access immediately.', timestamp: '9:45 AM', isStaff: false },
      { id: 'm5', senderId: 'staff', senderName: 'You', content: 'I understand the urgency, Mary. I can see Faith\'s account in the system. It appears the password was reset during our security update last night. Let me send a password reset link to your email.', timestamp: '9:47 AM', isStaff: true },
      { id: 'm6', senderId: 'user', senderName: 'Mary Wanjiku', content: 'Oh I see! That explains it. Yes please, send the reset link to my email mary.wanjiku@email.co.ke', timestamp: '9:48 AM', isStaff: false },
    ],
  };

  const initialSuggestions: AISuggestion[] = [
    { id: 's1', text: 'The password reset link has been sent to your email. Please check your inbox and spam folder. The link expires in 30 minutes.', confidence: 95, source: 'KB: Password Reset Process' },
    { id: 's2', text: 'While you wait, I can grant temporary exam access for Faith so she does not miss her Grade 6 Mathematics exam today.', confidence: 88, source: 'Policy: Emergency Access' },
    { id: 's3', text: 'If you do not receive the reset email within 5 minutes, please let me know and I can reset the password manually.', confidence: 82, source: 'KB: Password Reset Troubleshooting' },
  ];

  useEffect(() => {
    // Simulate initial connection - in production this would be a WebSocket connection
    const timer = setTimeout(() => {
      setSessions(initialSessions);
      setChatMessages(initialMessages);
      setSuggestions(initialSuggestions);
      const activeSessions = initialSessions.filter(s => s.status === 'active');
      const waitingSessions = initialSessions.filter(s => s.status === 'waiting');
      setStats({
        activeChats: activeSessions.length,
        waitingQueue: waitingSessions.length,
        avgWaitTime: '3m 24s',
        resolvedToday: 18,
      });
      setSelectedChat('chat-1');
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recalculate stats when sessions change
  const recalcStats = useCallback((currentSessions: ChatSession[]) => {
    setStats(prev => ({
      ...prev,
      activeChats: currentSessions.filter(s => s.status === 'active').length,
      waitingQueue: currentSessions.filter(s => s.status === 'waiting').length,
    }));
  }, []);

  const getStatusDot = (status: ChatSession['status']) => {
    const colors: Record<string, string> = {
      active: 'bg-green-400',
      waiting: 'bg-yellow-400 animate-pulse',
      idle: 'bg-gray-200 dark:bg-white/20',
      resolved: 'bg-blue-400',
    };
    return <div className={`w-2 h-2 rounded-full ${colors[status]}`} />;
  };

  const getAvatarColor = (name: string) => {
    const colors = ['bg-blue-600', 'bg-purple-600', 'bg-green-600', 'bg-orange-600', 'bg-cyan-600', 'bg-pink-600'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const handleUseSuggestion = (text: string) => {
    setNewMessage(text);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;
    const msg: ChatMessage = {
      id: `m-${Date.now()}`, senderId: 'staff', senderName: 'You',
      content: newMessage, timestamp: new Date().toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' }),
      isStaff: true,
    };
    setChatMessages(prev => ({
      ...prev,
      [selectedChat]: [...(prev[selectedChat] || []), msg],
    }));
    // Update last message in session list
    setSessions(prev =>
      prev.map(s =>
        s.id === selectedChat
          ? { ...s, lastMessage: newMessage, lastMessageTime: 'Just now', status: 'active' as const }
          : s
      )
    );
    setNewMessage('');
  };

  const handleResolve = () => {
    if (!selectedChat) return;
    setSessions(prev => {
      const updated = prev.map(s =>
        s.id === selectedChat ? { ...s, status: 'resolved' as const, unreadCount: 0 } : s
      );
      recalcStats(updated);
      return updated;
    });
    setStats(prev => ({ ...prev, resolvedToday: prev.resolvedToday + 1 }));
    showToast(`Chat with ${sessions.find(s => s.id === selectedChat)?.userName} marked as resolved`);
  };

  const handleTransferClick = async () => {
    setShowTransferDropdown(!showTransferDropdown);
    if (!showTransferDropdown && teamMembers.length === 0) {
      setLoadingTeam(true);
      try {
        const members = await getTeamMembers();
        setTeamMembers(members);
      } catch {
        showToast('Failed to load team members', 'info');
      } finally {
        setLoadingTeam(false);
      }
    }
  };

  const handleTransferTo = (member: TeamMember) => {
    if (!selectedChat) return;
    const session = sessions.find(s => s.id === selectedChat);
    setSessions(prev =>
      prev.map(s =>
        s.id === selectedChat ? { ...s, status: 'idle' as const } : s
      )
    );
    setShowTransferDropdown(false);
    showToast(`Chat with ${session?.userName} transferred to ${member.name}`);
    setSelectedChat(null);
  };

  const handleQuickAction = (action: string) => {
    const selectedSession = sessions.find(s => s.id === selectedChat);
    const userName = selectedSession?.userName || 'user';

    switch (action) {
      case 'Send password reset link':
        showToast(`Password reset link sent to ${userName}'s email`);
        break;
      case 'Check account status':
        showToast(`Account status check initiated for ${userName}`);
        break;
      case 'View user history':
        showToast(`Loading support history for ${userName}...`, 'info');
        break;
      case 'Create follow-up ticket':
        showToast(`Follow-up ticket created for ${userName}`);
        break;
      default:
        showToast(`Action "${action}" executed`);
    }
  };

  // Filter sessions by search
  const filteredSessions = sessions.filter(session => {
    if (!chatSearch) return true;
    const term = chatSearch.toLowerCase();
    return (
      session.userName.toLowerCase().includes(term) ||
      session.topic.toLowerCase().includes(term) ||
      session.lastMessage.toLowerCase().includes(term)
    );
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-7 w-40 bg-white dark:bg-[#181C1F] rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-white dark:bg-[#181C1F] rounded-xl border border-gray-200 dark:border-[#22272B] animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-12 gap-4 h-[600px]">
          <div className="col-span-3 bg-white dark:bg-[#181C1F] rounded-xl border border-gray-200 dark:border-[#22272B] animate-pulse" />
          <div className="col-span-6 bg-white dark:bg-[#181C1F] rounded-xl border border-gray-200 dark:border-[#22272B] animate-pulse" />
          <div className="col-span-3 bg-white dark:bg-[#181C1F] rounded-xl border border-gray-200 dark:border-[#22272B] animate-pulse" />
        </div>
      </div>
    );
  }

  const selectedSession = sessions.find(s => s.id === selectedChat);
  const currentMessages = selectedChat ? (chatMessages[selectedChat] || []) : [];

  return (
    <div className="p-6 space-y-6">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-in slide-in-from-right ${
              toast.type === 'success'
                ? 'bg-green-600 text-white'
                : 'bg-blue-600 text-white'
            }`}
          >
            {toast.text}
          </div>
        ))}
      </div>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Live Support</h1>
          <p className="text-sm text-gray-500 dark:text-white/50 mt-1">Real-time chat support with AI-powered suggestions</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-green-400 font-medium">Online</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#181C1F] rounded-xl border border-gray-200 dark:border-[#22272B] p-3">
          <p className="text-xs text-gray-500 dark:text-white/50">Active Chats</p>
          <p className="text-xl font-bold text-green-400">{stats.activeChats}</p>
        </div>
        <div className="bg-white dark:bg-[#181C1F] rounded-xl border border-gray-200 dark:border-[#22272B] p-3">
          <p className="text-xs text-gray-500 dark:text-white/50">Waiting Queue</p>
          <p className="text-xl font-bold text-yellow-400">{stats.waitingQueue}</p>
        </div>
        <div className="bg-white dark:bg-[#181C1F] rounded-xl border border-gray-200 dark:border-[#22272B] p-3">
          <p className="text-xs text-gray-500 dark:text-white/50">Avg Wait Time</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.avgWaitTime}</p>
        </div>
        <div className="bg-white dark:bg-[#181C1F] rounded-xl border border-gray-200 dark:border-[#22272B] p-3">
          <p className="text-xs text-gray-500 dark:text-white/50">Resolved Today</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.resolvedToday}</p>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="grid grid-cols-12 gap-4" style={{ height: 'calc(100vh - 320px)', minHeight: '500px' }}>
        {/* Chat List */}
        <div className="col-span-3 bg-white dark:bg-[#181C1F] rounded-xl border border-gray-200 dark:border-[#22272B] flex flex-col overflow-hidden">
          <div className="p-3 border-b border-gray-200 dark:border-[#22272B]">
            <input
              type="text"
              placeholder="Search chats..."
              value={chatSearch}
              onChange={(e) => setChatSearch(e.target.value)}
              className="w-full px-3 py-1.5 bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-lg text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:border-[#E40000]/50"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredSessions.map((session) => (
              <button
                key={session.id}
                onClick={() => {
                  setSelectedChat(session.id);
                  // Clear unread count when selecting
                  setSessions(prev =>
                    prev.map(s => s.id === session.id ? { ...s, unreadCount: 0 } : s)
                  );
                }}
                className={`w-full p-3 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors border-b border-gray-200 dark:border-[#22272B]/50 text-left ${
                  selectedChat === session.id ? 'bg-gray-50 dark:bg-white/[0.04]' : ''
                }`}
              >
                <div className="relative flex-shrink-0">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white ${getAvatarColor(session.userName)}`}>
                    {session.userAvatar}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5">
                    {getStatusDot(session.status)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-semibold text-gray-900 dark:text-white truncate">{session.userName}</span>
                    <span className="text-[10px] text-gray-400 dark:text-white/30 flex-shrink-0">{session.lastMessageTime}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 dark:text-white/40 truncate">{session.lastMessage}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] text-gray-400 dark:text-white/30 bg-gray-50 dark:bg-[#0F1112] px-1.5 py-0.5 rounded">{session.topic}</span>
                    {session.status === 'resolved' && (
                      <span className="text-[10px] text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">Resolved</span>
                    )}
                    {session.unreadCount > 0 && (
                      <span className="w-4 h-4 rounded-full bg-[#E40000] text-white text-[10px] flex items-center justify-center font-bold">
                        {session.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
            {filteredSessions.length === 0 && (
              <div className="p-4 text-center text-xs text-gray-400 dark:text-white/40">
                No chats match your search.
              </div>
            )}
          </div>
        </div>

        {/* Active Chat */}
        <div className="col-span-6 bg-white dark:bg-[#181C1F] rounded-xl border border-gray-200 dark:border-[#22272B] flex flex-col overflow-hidden">
          {selectedSession ? (
            <>
              {/* Chat Header */}
              <div className="p-3 border-b border-gray-200 dark:border-[#22272B] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${getAvatarColor(selectedSession.userName)}`}>
                    {selectedSession.userAvatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedSession.userName}</p>
                    <p className="text-xs text-gray-400 dark:text-white/40">{selectedSession.userRole} &middot; {selectedSession.topic}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleResolve}
                    disabled={selectedSession.status === 'resolved'}
                    className="px-3 py-1 bg-green-600/10 border border-green-500/30 rounded text-xs text-green-400 hover:bg-green-600/20 transition-colors disabled:opacity-40"
                  >
                    {selectedSession.status === 'resolved' ? 'Resolved' : 'Resolve'}
                  </button>
                  <div className="relative">
                    <button
                      onClick={handleTransferClick}
                      className="px-3 py-1 bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded text-xs text-gray-400 dark:text-white/40 hover:text-gray-500 dark:hover:text-white/60 transition-colors"
                    >
                      Transfer
                    </button>
                    {showTransferDropdown && (
                      <div className="absolute top-full right-0 mt-1 w-56 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg shadow-xl z-20 max-h-48 overflow-y-auto">
                        {loadingTeam ? (
                          <div className="p-3 text-xs text-gray-400 dark:text-white/40 text-center">Loading...</div>
                        ) : teamMembers.length === 0 ? (
                          <div className="p-3 text-xs text-gray-400 dark:text-white/40 text-center">No team members</div>
                        ) : (
                          teamMembers.filter(m => m.is_active).map(member => (
                            <button
                              key={member.id}
                              onClick={() => handleTransferTo(member)}
                              className="w-full px-3 py-2 text-left text-sm text-gray-600 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors"
                            >
                              <p className="text-xs font-medium">{member.name}</p>
                              <p className="text-[10px] text-gray-400 dark:text-white/30">{member.position}</p>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {currentMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.isStaff ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] px-3 py-2 rounded-xl ${
                      msg.isStaff
                        ? 'bg-[#E40000]/10 border border-[#E40000]/20 text-gray-700 dark:text-white/80'
                        : 'bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] text-gray-600 dark:text-white/70'
                    }`}>
                      <p className="text-xs text-gray-400 dark:text-white/40 mb-1">{msg.senderName}</p>
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-300 dark:text-white/20 mt-1 text-right">{msg.timestamp}</p>
                    </div>
                  </div>
                ))}
                {currentMessages.length === 0 && (
                  <div className="flex-1 flex items-center justify-center h-full">
                    <p className="text-sm text-gray-400 dark:text-white/30">No messages in this chat yet.</p>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-3 border-t border-gray-200 dark:border-[#22272B]">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:border-[#E40000]/50"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="px-4 py-2 bg-[#E40000] hover:bg-[#E40000]/90 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-40"
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm text-gray-400 dark:text-white/30">Select a chat to begin</p>
            </div>
          )}
        </div>

        {/* AI Suggestions Panel */}
        <div className="col-span-3 bg-white dark:bg-[#181C1F] rounded-xl border border-gray-200 dark:border-[#22272B] flex flex-col overflow-hidden">
          <div className="p-3 border-b border-gray-200 dark:border-[#22272B]">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">AI Assistant</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            <p className="text-xs text-gray-400 dark:text-white/40">Suggested responses based on context:</p>
            {suggestions.map((suggestion) => (
              <div key={suggestion.id} className="bg-gray-50 dark:bg-[#0F1112] rounded-lg border border-purple-500/10 p-3">
                <p className="text-xs text-gray-600 dark:text-white/70 leading-relaxed mb-2">{suggestion.text}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 dark:text-white/30">{suggestion.source}</span>
                    <span className={`text-[10px] font-medium ${
                      suggestion.confidence >= 90 ? 'text-green-400' : suggestion.confidence >= 80 ? 'text-yellow-400' : 'text-gray-400 dark:text-white/40'
                    }`}>
                      {suggestion.confidence}%
                    </span>
                  </div>
                  <button
                    onClick={() => handleUseSuggestion(suggestion.text)}
                    className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 rounded text-[10px] text-purple-400 hover:bg-purple-500/20 transition-colors"
                  >
                    Use
                  </button>
                </div>
              </div>
            ))}

            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-[#22272B]">
              <p className="text-xs text-gray-400 dark:text-white/40 mb-2">Quick Actions</p>
              <div className="space-y-1.5">
                {['Send password reset link', 'Check account status', 'View user history', 'Create follow-up ticket'].map((action) => (
                  <button
                    key={action}
                    onClick={() => handleQuickAction(action)}
                    className="w-full text-left px-3 py-1.5 bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded text-xs text-gray-500 dark:text-white/50 hover:text-gray-600 dark:hover:text-white/70 hover:border-[#E40000]/30 transition-colors"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveSupportPage;
