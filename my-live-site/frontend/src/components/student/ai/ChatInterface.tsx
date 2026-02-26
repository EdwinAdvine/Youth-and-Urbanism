import React, { useState, useRef, useEffect } from 'react';
import { useAgeAdaptiveUI } from '../../../hooks/useAgeAdaptiveUI';
import { Bot, Send, Sparkles } from 'lucide-react';

interface Message {
  id: number;
  sender: 'ai' | 'student';
  text: string;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSend: (text: string) => void;
  placeholder?: string;
  quickActions?: { label: string; text: string }[];
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSend,
  placeholder = 'Type your question...',
  quickActions,
}) => {
  const { borderRadius } = useAgeAdaptiveUI();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;
    onSend(message);
    setMessage('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className={`flex-1 p-4 sm:p-6 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] overflow-y-auto mb-4`}>
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'student' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] sm:max-w-[70%] p-4 ${borderRadius} ${
                msg.sender === 'student'
                  ? 'bg-[#FF0000] text-gray-900 dark:text-white'
                  : 'bg-purple-500/20 text-gray-900 dark:text-white border border-purple-500/30'
              }`}>
                {msg.sender === 'ai' && <Bot className="w-4 h-4 inline-block mr-2" />}
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={placeholder}
          className={`flex-1 px-4 py-3 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus:outline-none focus:border-[#FF0000]`}
        />
        <button
          onClick={handleSend}
          className={`px-6 py-3 bg-[#FF0000] hover:bg-[#FF0000]/80 text-gray-900 dark:text-white ${borderRadius}`}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      {quickActions && quickActions.length > 0 && (
        <div className="mt-3 flex gap-2 flex-wrap">
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={() => { setMessage(action.text); }}
              className={`px-4 py-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-900 dark:text-white text-sm ${borderRadius}`}
            >
              <Sparkles className="w-4 h-4 inline-block mr-2" />
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
