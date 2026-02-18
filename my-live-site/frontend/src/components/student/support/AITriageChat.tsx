import React, { useState } from 'react';
import { useAgeAdaptiveUI } from '../../../hooks/useAgeAdaptiveUI';
import { Bot, Send, Lightbulb } from 'lucide-react';

interface AITriageChatProps {
  onEscalate?: (summary: string) => void;
}

const AITriageChat: React.FC<AITriageChatProps> = ({ onEscalate }) => {
  const { borderRadius } = useAgeAdaptiveUI();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{ id: number; sender: 'ai' | 'student'; text: string }[]>([
    { id: 1, sender: 'ai', text: "Hi! I'm the AI Help assistant. Describe your issue and I'll try to solve it or connect you with the right support." },
  ]);

  const handleSend = () => {
    if (!message.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), sender: 'student' as const, text: message }]);
    const userMsg = message;
    setMessage('');

    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'ai' as const,
        text: `I understand you're having an issue with "${userMsg.slice(0, 50)}". Let me check a few things for you. If I can't resolve this, I'll connect you with a human support agent.`
      }]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full">
      <div className={`p-3 bg-purple-500/10 ${borderRadius} border border-purple-500/20 mb-3 flex items-center gap-2`}>
        <Bot className="w-5 h-5 text-purple-400" />
        <span className="text-purple-400 text-sm font-medium">AI Help Assistant</span>
        <span className={`px-2 py-0.5 bg-purple-500/20 text-purple-400 text-[10px] ${borderRadius}`}>Instant</span>
      </div>

      <div className={`flex-1 p-4 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] overflow-y-auto mb-3`}>
        <div className="space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'student' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] sm:max-w-[70%] p-3 ${borderRadius} ${
                msg.sender === 'student'
                  ? 'bg-[#FF0000] text-gray-900 dark:text-white'
                  : 'bg-purple-500/20 text-gray-900 dark:text-white border border-purple-500/30'
              }`}>
                {msg.sender === 'ai' && <Bot className="w-3.5 h-3.5 inline-block mr-1.5 mb-0.5" />}
                <span className="text-sm">{msg.text}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Describe your issue..."
          className={`flex-1 px-4 py-2.5 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-purple-500`}
        />
        <button onClick={handleSend} className={`px-4 py-2.5 bg-purple-500 hover:bg-purple-600 text-gray-900 dark:text-white ${borderRadius}`}>
          <Send className="w-4 h-4" />
        </button>
      </div>

      {onEscalate && (
        <button
          onClick={() => onEscalate(messages.map(m => m.text).join('\n'))}
          className={`mt-3 w-full py-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-white/60 text-sm ${borderRadius} flex items-center justify-center gap-2`}
        >
          <Lightbulb className="w-4 h-4" /> Talk to a human instead
        </button>
      )}
    </div>
  );
};

export default AITriageChat;
