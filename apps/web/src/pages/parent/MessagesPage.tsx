/**
 * Messages Page
 *
 * Split-panel messaging interface for parent communications.
 * Left panel shows conversation list, right panel shows
 * the selected conversation thread with a message composer.
 * On mobile, shows conversation list first, click to open thread.
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MessageSquare, ArrowLeft, Send, Filter, ChevronLeft,
  Bot, GraduationCap, Users, Headphones,
} from 'lucide-react';
import {
  getConversations,
  getConversationMessages,
  sendMessage,
  markMessageRead,
} from '../../services/parentCommunicationsService';
import type {
  ConversationSummary,
  ConversationMessagesResponse,
} from '../../types/parent';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

type ChannelFilter = 'all' | 'ai_tutor' | 'teacher' | 'family' | 'support';

const CHANNEL_TABS: { key: ChannelFilter; label: string; icon: React.ReactNode }[] = [
  { key: 'all', label: 'All', icon: <Filter className="w-3.5 h-3.5" /> },
  { key: 'ai_tutor', label: 'AI Tutor', icon: <Bot className="w-3.5 h-3.5" /> },
  { key: 'teacher', label: 'Teacher', icon: <GraduationCap className="w-3.5 h-3.5" /> },
  { key: 'family', label: 'Family', icon: <Users className="w-3.5 h-3.5" /> },
  { key: 'support', label: 'Support', icon: <Headphones className="w-3.5 h-3.5" /> },
];

/* ------------------------------------------------------------------ */
/* Helper: relative time string                                       */
/* ------------------------------------------------------------------ */
function timeAgo(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const seconds = Math.floor((now - then) / 1000);
  if (seconds < 60) return 'Now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateString).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

/* ------------------------------------------------------------------ */
/* Helper: channel badge                                              */
/* ------------------------------------------------------------------ */
function channelBadge(channel: string) {
  const map: Record<string, { color: string; label: string }> = {
    ai_tutor: { color: 'bg-purple-500/20 text-purple-400', label: 'AI Tutor' },
    teacher: { color: 'bg-blue-500/20 text-blue-400', label: 'Teacher' },
    family: { color: 'bg-green-500/20 text-green-400', label: 'Family' },
    support: { color: 'bg-yellow-500/20 text-yellow-400', label: 'Support' },
  };
  const entry = map[channel] || { color: 'bg-gray-500/20 text-gray-400', label: channel };
  return (
    <span className={`px-2 py-0.5 text-[10px] rounded font-medium ${entry.color}`}>
      {entry.label}
    </span>
  );
}

/* ================================================================== */
/* Component                                                          */
/* ================================================================== */

const MessagesPage: React.FC = () => {
  const navigate = useNavigate();

  /* ---- state ---- */
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeThread, setActiveThread] = useState<ConversationMessagesResponse | null>(null);
  const [selectedConvoId, setSelectedConvoId] = useState<string | null>(null);
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>('all');
  const [loading, setLoading] = useState(true);
  const [threadLoading, setThreadLoading] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [mobileShowThread, setMobileShowThread] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  /* ---- load conversations ---- */
  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      const channel = channelFilter === 'all' ? undefined : channelFilter;
      const data = await getConversations(channel);
      setConversations(data.conversations);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  }, [channelFilter]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  /* ---- load thread ---- */
  const openThread = async (convo: ConversationSummary) => {
    try {
      setThreadLoading(true);
      setSelectedConvoId(convo.conversation_id);
      setMobileShowThread(true);
      const data = await getConversationMessages(convo.conversation_id);
      setActiveThread(data);

      // Mark unread messages as read
      const unread = data.messages.filter((m) => !m.is_read);
      for (const msg of unread) {
        try {
          await markMessageRead(msg.id);
        } catch {
          // silently ignore
        }
      }
    } catch (error) {
      console.error('Failed to load conversation messages:', error);
    } finally {
      setThreadLoading(false);
    }
  };

  /* ---- auto-scroll messages ---- */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThread?.messages]);

  /* ---- send message ---- */
  const handleSend = async () => {
    if (!messageText.trim() || !activeThread || sending) return;

    try {
      setSending(true);
      await sendMessage({
        conversation_id: activeThread.conversation_id,
        channel: activeThread.channel,
        content: messageText.trim(),
        message_type: 'text',
      });
      setMessageText('');
      // Reload thread to show new message
      const updatedThread = await getConversationMessages(activeThread.conversation_id);
      setActiveThread(updatedThread);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* ---- loading state ---- */
  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E40000]" />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Back */}
        <button
          onClick={() => navigate('/dashboard/parent')}
          className="flex items-center gap-2 text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Dashboard</span>
        </button>

        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#E40000] to-[#FF0000] rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-gray-900 dark:text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Messages</h1>
              <p className="text-gray-500 dark:text-white/60 mt-1">
                Communicate with tutors, teachers, and support
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main Split Panel */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="flex bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl overflow-hidden" style={{ height: 'calc(100vh - 280px)', minHeight: '500px' }}>

            {/* ---- Left Panel: Conversation List ---- */}
            <div
              className={`${
                mobileShowThread ? 'hidden md:flex' : 'flex'
              } flex-col w-full md:w-1/3 border-r border-gray-200 dark:border-[#22272B]`}
            >
              {/* Channel Filter */}
              <div className="flex items-center gap-1.5 p-3 overflow-x-auto border-b border-gray-200 dark:border-[#22272B]">
                {CHANNEL_TABS.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setChannelFilter(tab.key)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg whitespace-nowrap transition-colors ${
                      channelFilter === tab.key
                        ? 'bg-[#E40000] text-gray-900 dark:text-white'
                        : 'bg-gray-100 dark:bg-[#22272B] text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-[#2A2E33]'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Conversation Items */}
              <div className="flex-1 overflow-y-auto">
                {conversations.length > 0 ? (
                  conversations.map((convo) => (
                    <button
                      key={convo.conversation_id}
                      onClick={() => openThread(convo)}
                      className={`w-full text-left p-3 border-b border-gray-200 dark:border-[#22272B] transition-colors ${
                        selectedConvoId === convo.conversation_id
                          ? 'bg-gray-100 dark:bg-[#22272B]'
                          : 'hover:bg-gray-100 dark:hover:bg-[#22272B]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate flex-1 mr-2">
                          {convo.other_participant.full_name}
                        </span>
                        <span className="text-[10px] text-gray-400 dark:text-white/40 flex-shrink-0">
                          {timeAgo(convo.last_message_at)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        {channelBadge(convo.channel)}
                        {convo.child_name && (
                          <span className="text-[10px] text-gray-400 dark:text-white/40">{convo.child_name}</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500 dark:text-white/50 truncate flex-1 mr-2">
                          {convo.last_message}
                        </p>
                        {convo.unread_count > 0 && (
                          <span className="min-w-[18px] h-[18px] flex items-center justify-center bg-[#E40000] text-gray-900 dark:text-white text-[10px] font-bold rounded-full px-1">
                            {convo.unread_count}
                          </span>
                        )}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                    <MessageSquare className="w-12 h-12 text-gray-400 dark:text-gray-300 dark:text-white/20 mb-3" />
                    <p className="text-sm text-gray-500 dark:text-white/50">No conversations yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* ---- Right Panel: Message Thread ---- */}
            <div
              className={`${
                !mobileShowThread ? 'hidden md:flex' : 'flex'
              } flex-col flex-1`}
            >
              {activeThread ? (
                <>
                  {/* Thread Header */}
                  <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-[#22272B]">
                    <button
                      onClick={() => setMobileShowThread(false)}
                      className="md:hidden text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {activeThread.participants.length > 0
                            ? activeThread.participants[0].full_name
                            : 'Conversation'}
                        </span>
                        {channelBadge(activeThread.channel)}
                      </div>
                      {activeThread.child_name && (
                        <p className="text-xs text-gray-400 dark:text-white/40 mt-0.5">
                          Re: {activeThread.child_name}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {threadLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#E40000]" />
                      </div>
                    ) : activeThread.messages.length > 0 ? (
                      activeThread.messages.map((msg) => {
                        const isSent = msg.sender.role === 'parent';
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                                isSent
                                  ? 'bg-[#E40000] text-gray-900 dark:text-white rounded-br-md'
                                  : 'bg-gray-100 dark:bg-[#22272B] text-gray-800 dark:text-white/90 rounded-bl-md'
                              }`}
                            >
                              {!isSent && (
                                <p className="text-[10px] font-medium text-gray-500 dark:text-white/50 mb-1">
                                  {msg.sender.full_name}
                                </p>
                              )}
                              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                              <div
                                className={`flex items-center gap-1 mt-1 ${
                                  isSent ? 'justify-end' : 'justify-start'
                                }`}
                              >
                                <span className="text-[10px] opacity-60">
                                  {new Date(msg.created_at).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                                {isSent && msg.is_read && (
                                  <span className="text-[10px] opacity-60">Read</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <MessageSquare className="w-10 h-10 text-gray-400 dark:text-gray-300 dark:text-white/20 mb-2" />
                        <p className="text-sm text-gray-400 dark:text-white/40">No messages in this conversation</p>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-3 border-t border-gray-200 dark:border-[#22272B]">
                    <div className="flex items-end gap-2">
                      <textarea
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        rows={1}
                        className="flex-1 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-white/30 resize-none focus:outline-none focus:ring-1 focus:ring-[#E40000]"
                        style={{ maxHeight: '120px' }}
                      />
                      <button
                        onClick={handleSend}
                        disabled={!messageText.trim() || sending}
                        className="w-10 h-10 flex items-center justify-center bg-[#E40000] rounded-xl text-gray-900 dark:text-white transition-colors hover:bg-[#c00000] disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                      >
                        {sending ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <MessageSquare className="w-16 h-16 text-white/15 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-500 dark:text-white/60 mb-1">
                    Select a conversation
                  </h3>
                  <p className="text-sm text-gray-400 dark:text-white/40">
                    Choose a conversation from the list to view messages
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default MessagesPage;
