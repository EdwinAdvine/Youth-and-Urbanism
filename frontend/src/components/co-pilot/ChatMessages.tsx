import React, { useRef, useEffect } from 'react';
import { ChatMessage } from '../../store/coPilotStore';
import { useCoPilotStore } from '../../store';

interface ChatMessagesProps {
  messages: ChatMessage[];
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { updateMessageStatus } = useCoPilotStore();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update message status to delivered when visible
  useEffect(() => {
    const visibleMessages = messages.filter(msg => msg.status === 'sent');
    visibleMessages.forEach(msg => {
      setTimeout(() => {
        updateMessageStatus(msg.id, 'delivered');
      }, 1000);
    });
  }, [messages, updateMessageStatus]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMessageStatusIcon = (status: ChatMessage['status']) => {
    switch (status) {
      case 'sending':
        return <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>;
      case 'sent':
        return <div className="w-2 h-2 bg-blue-400 rounded-full"></div>;
      case 'delivered':
        return <div className="w-2 h-2 bg-green-400 rounded-full"></div>;
      case 'read':
        return <div className="w-2 h-2 bg-green-400 rounded-full"></div>;
      default:
        return null;
    }
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-white/60 text-sm">
        Start a conversation with your AI assistant
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`
              max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-lg
              ${message.sender === 'user'
                ? 'bg-gradient-to-r from-[#FF0000] to-[#E40000] text-white ml-8'
                : 'bg-[#22272B] text-white mr-8'
              }
              animate-in slide-in-from-bottom-2 duration-300
            `}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs opacity-75">
                {message.sender === 'user' ? 'You' : 'AI Assistant'}
              </span>
              <div className="flex items-center gap-1">
                <span className="text-xs opacity-75">{formatTime(message.timestamp)}</span>
                {message.sender === 'user' && getMessageStatusIcon(message.status)}
              </div>
            </div>
            <p className="text-sm">{message.content}</p>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;