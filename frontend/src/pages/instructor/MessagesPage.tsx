import React, { useEffect, useState } from 'react';
import { Search, Send, User, Paperclip, MoreVertical } from 'lucide-react';
import { InstructorPageHeader } from '../../components/instructor/shared/InstructorPageHeader';
import axios from 'axios';
import { format } from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface Message {
  id: string;
  from_user_id: string;
  to_user_id: string;
  content: string;
  timestamp: string;
  read: boolean;
}

interface Conversation {
  user_id: string;
  user_name: string;
  user_avatar?: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

export const MessagesPage: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const currentUserId = 'instructor-1'; // Would come from auth context

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/api/v1/instructor/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Mock data for development
      if (!response.data || response.data.length === 0) {
        setConversations([
          {
            user_id: 'student-1',
            user_name: 'Jane Mwangi',
            user_avatar: '',
            last_message: 'Thank you for the feedback on my assignment!',
            last_message_time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            unread_count: 2,
          },
          {
            user_id: 'student-2',
            user_name: 'John Kamau',
            user_avatar: '',
            last_message: 'I have a question about the algebra homework',
            last_message_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            unread_count: 1,
          },
          {
            user_id: 'student-3',
            user_name: 'Sarah Wanjiru',
            user_avatar: '',
            last_message: 'Got it, thanks!',
            last_message_time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            unread_count: 0,
          },
        ]);
      } else {
        setConversations(response.data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId: string) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/api/v1/instructor/messages/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Mock data for development
      if (!response.data || response.data.length === 0) {
        setMessages([
          {
            id: '1',
            from_user_id: userId,
            to_user_id: currentUserId,
            content: 'Hello! I have a question about today\'s assignment.',
            timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
            read: true,
          },
          {
            id: '2',
            from_user_id: currentUserId,
            to_user_id: userId,
            content: 'Hi! Of course, what would you like to know?',
            timestamp: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
            read: true,
          },
          {
            id: '3',
            from_user_id: userId,
            to_user_id: currentUserId,
            content: 'I\'m confused about question 5. Can you explain the approach?',
            timestamp: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
            read: true,
          },
          {
            id: '4',
            from_user_id: currentUserId,
            to_user_id: userId,
            content: 'Sure! For question 5, you need to first isolate the variable on one side...',
            timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
            read: true,
          },
        ]);
      } else {
        setMessages(response.data);
      }

      // Mark conversation as read
      setConversations((prev) =>
        prev.map((conv) => (conv.user_id === userId ? { ...conv, unread_count: 0 } : conv))
      );
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation || sending) return;

    try {
      setSending(true);
      const token = localStorage.getItem('access_token');
      const newMessage = {
        to_user_id: selectedConversation,
        content: messageInput.trim(),
      };

      await axios.post(`${API_URL}/api/v1/instructor/messages`, newMessage, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Optimistically add message to UI
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        from_user_id: currentUserId,
        to_user_id: selectedConversation,
        content: messageInput.trim(),
        timestamp: new Date().toISOString(),
        read: false,
      };

      setMessages([...messages, optimisticMessage]);
      setMessageInput('');

      // Update conversation list
      setConversations((prev) =>
        prev.map((conv) =>
          conv.user_id === selectedConversation
            ? {
                ...conv,
                last_message: messageInput.trim(),
                last_message_time: new Date().toISOString(),
              }
            : conv
        )
      );
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.user_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConv = conversations.find((c) => c.user_id === selectedConversation);

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unread_count, 0);

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
        title="Messages"
        description="Direct messaging with students"
        badge={totalUnread > 0 ? `${totalUnread} unread` : undefined}
      />

      <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden h-[calc(100vh-250px)]">
        <div className="grid grid-cols-12 h-full">
          {/* Conversations List */}
          <div className="col-span-4 border-r border-gray-200 dark:border-white/10 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-gray-200 dark:border-white/10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-300 dark:text-white/40" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-purple-500/50"
                />
              </div>
            </div>

            {/* Conversation Items */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500 dark:text-white/60 text-sm">No conversations</p>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <div
                    key={conv.user_id}
                    onClick={() => setSelectedConversation(conv.user_id)}
                    className={`p-4 border-b border-gray-200 dark:border-white/10 cursor-pointer transition-colors ${
                      selectedConversation === conv.user_id
                        ? 'bg-purple-500/10'
                        : 'hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                        {conv.user_avatar ? (
                          <img
                            src={conv.user_avatar}
                            alt={conv.user_name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-purple-400" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {conv.user_name}
                          </h4>
                          <span className="text-xs text-gray-400 dark:text-gray-300 dark:text-white/40">
                            {format(new Date(conv.last_message_time), 'h:mm a')}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-white/60 truncate">{conv.last_message}</p>
                      </div>

                      {conv.unread_count > 0 && (
                        <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-gray-900 dark:text-white">
                            {conv.unread_count}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className="col-span-8 flex flex-col">
            {selectedConv ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                      {selectedConv.user_avatar ? (
                        <img
                          src={selectedConv.user_avatar}
                          alt={selectedConv.user_name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-purple-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                        {selectedConv.user_name}
                      </h3>
                      <p className="text-xs text-gray-400 dark:text-gray-300 dark:text-white/40">Student</p>
                    </div>
                  </div>

                  <button className="p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors">
                    <MoreVertical className="w-5 h-5 text-gray-500 dark:text-white/60" />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => {
                    const isFromInstructor = message.from_user_id === currentUserId;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isFromInstructor ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-xl px-4 py-2 ${
                            isFromInstructor
                              ? 'bg-purple-500 text-gray-900 dark:text-white'
                              : 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isFromInstructor ? 'text-gray-600 dark:text-white/70' : 'text-gray-400 dark:text-gray-300 dark:text-white/40'
                            }`}
                          >
                            {format(new Date(message.timestamp), 'h:mm a')}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-gray-200 dark:border-white/10">
                  <div className="flex items-end gap-3">
                    <button className="p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors">
                      <Paperclip className="w-5 h-5 text-gray-500 dark:text-white/60" />
                    </button>

                    <textarea
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Type a message..."
                      rows={1}
                      className="flex-1 px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-purple-500/50 resize-none"
                    />

                    <button
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim() || sending}
                      className="p-2 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/50 disabled:cursor-not-allowed text-gray-900 dark:text-white rounded-lg transition-colors"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-gray-400 dark:text-white/30" />
                  </div>
                  <p className="text-gray-500 dark:text-white/60">Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
