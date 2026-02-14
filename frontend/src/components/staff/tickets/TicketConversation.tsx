import React, { useState, useRef, useEffect } from 'react';
import { Send, Lock, MessageSquare } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: string;
  senderRole: 'staff' | 'customer';
  isInternal: boolean;
  createdAt: string;
}

interface TicketConversationProps {
  messages: Message[];
  onSendMessage: (content: string, isInternal: boolean) => void;
}

const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-KE', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' });
};

const TicketConversation: React.FC<TicketConversationProps> = ({ messages, onSendMessage }) => {
  const [newMessage, setNewMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    onSendMessage(newMessage.trim(), isInternal);
    setNewMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Group messages by date
  const groupedMessages: { date: string; messages: Message[] }[] = [];
  let currentDate = '';
  messages.forEach((msg) => {
    const date = formatDate(msg.createdAt);
    if (date !== currentDate) {
      currentDate = date;
      groupedMessages.push({ date, messages: [msg] });
    } else {
      groupedMessages[groupedMessages.length - 1].messages.push(msg);
    }
  });

  return (
    <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl overflow-hidden flex flex-col h-[500px]">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-200 dark:border-[#22272B] flex-shrink-0">
        <MessageSquare className="w-4 h-4 text-gray-500 dark:text-white/60" />
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Conversation</h3>
        <span className="ml-auto text-xs text-gray-400 dark:text-white/40">{messages.length} messages</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {groupedMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-white/30">
            <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">No messages yet</p>
          </div>
        ) : (
          groupedMessages.map((group) => (
            <div key={group.date}>
              {/* Date separator */}
              <div className="flex items-center gap-3 my-3">
                <div className="flex-1 h-px bg-gray-100 dark:bg-[#22272B]" />
                <span className="text-[10px] text-gray-400 dark:text-white/30 font-medium">{group.date}</span>
                <div className="flex-1 h-px bg-gray-100 dark:bg-[#22272B]" />
              </div>

              <div className="space-y-2">
                {group.messages.map((msg) => {
                  const isStaff = msg.senderRole === 'staff';

                  if (msg.isInternal) {
                    // Internal note
                    return (
                      <div key={msg.id} className="flex justify-center">
                        <div className="max-w-[80%] px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Lock className="w-3 h-3 text-amber-400" />
                            <span className="text-[10px] font-medium text-amber-400">
                              Internal Note
                            </span>
                            <span className="text-[10px] text-amber-400/50 ml-auto">
                              {msg.sender} - {formatTime(msg.createdAt)}
                            </span>
                          </div>
                          <p className="text-xs text-amber-200/80 leading-relaxed">
                            {msg.content}
                          </p>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isStaff ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] px-3.5 py-2.5 rounded-xl ${
                          isStaff
                            ? 'bg-blue-600/20 border border-blue-500/20 rounded-br-md'
                            : 'bg-gray-100 dark:bg-[#22272B]/70 border border-gray-200 dark:border-[#22272B] rounded-bl-md'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-[10px] font-medium ${
                              isStaff ? 'text-blue-400' : 'text-gray-500 dark:text-white/50'
                            }`}
                          >
                            {msg.sender}
                          </span>
                          <span className="text-[10px] text-gray-400 dark:text-white/30">
                            {formatTime(msg.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-white/80 leading-relaxed whitespace-pre-wrap">
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 dark:border-[#22272B] p-3 flex-shrink-0">
        {/* Internal note toggle */}
        <div className="flex items-center gap-2 mb-2">
          <button
            type="button"
            onClick={() => setIsInternal(!isInternal)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium border transition-colors ${
              isInternal
                ? 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                : 'bg-gray-100 dark:bg-[#22272B]/50 border-gray-200 dark:border-[#22272B] text-gray-400 dark:text-white/40 hover:text-gray-500 dark:hover:text-white/60'
            }`}
          >
            <Lock className="w-3 h-3" />
            {isInternal ? 'Internal Note' : 'Reply to Customer'}
          </button>
        </div>

        <div className="flex items-end gap-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isInternal ? 'Write an internal note...' : 'Type your reply...'}
            rows={2}
            className={`flex-1 px-3 py-2 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 outline-none resize-none transition-colors ${
              isInternal
                ? 'bg-amber-500/5 border border-amber-500/20 focus:border-amber-500/40'
                : 'bg-gray-100 dark:bg-[#22272B]/50 border border-gray-200 dark:border-[#22272B] focus:border-[#E40000]/50'
            }`}
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="p-2.5 rounded-lg bg-[#E40000] text-gray-900 dark:text-white hover:bg-[#E40000]/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketConversation;
