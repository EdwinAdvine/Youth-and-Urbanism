import React, { useState } from 'react';
import { useAgeAdaptiveUI } from '../../../hooks/useAgeAdaptiveUI';
import { Send } from 'lucide-react';

interface ChatMessage {
  id: number;
  sender: 'student' | 'support';
  text: string;
  time: string;
}

interface LiveChatProps {
  agentName?: string;
}

const LiveChat: React.FC<LiveChatProps> = ({ agentName = 'Support Agent' }) => {
  const { borderRadius } = useAgeAdaptiveUI();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, sender: 'support', text: `Hi! I'm ${agentName}. How can I help you today?`, time: 'Just now' },
  ]);

  const handleSend = () => {
    if (!message.trim()) return;
    const newMsg: ChatMessage = { id: Date.now(), sender: 'student', text: message, time: 'Just now' };
    setMessages([...messages, newMsg]);
    setMessage('');
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'support',
        text: "Thanks for reaching out! Let me look into that for you.",
        time: 'Just now'
      }]);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full">
      <div className={`p-3 bg-green-500/10 ${borderRadius} border border-green-500/20 mb-3 flex items-center gap-2`}>
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-green-400 text-sm font-medium">{agentName}</span>
        <span className="text-gray-400 dark:text-white/30 text-xs">Online</span>
      </div>
      <div className={`flex-1 p-4 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] overflow-y-auto mb-3`}>
        <div className="space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'student' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 ${borderRadius} ${
                msg.sender === 'student' ? 'bg-[#FF0000] text-gray-900 dark:text-white' : 'bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10'
              }`}>
                <p className="text-sm">{msg.text}</p>
                <p className="text-[10px] mt-1 opacity-50">{msg.time}</p>
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
          placeholder="Type a message..."
          className={`flex-1 px-4 py-2.5 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-green-500`}
        />
        <button onClick={handleSend} className={`px-4 py-2.5 bg-green-500 hover:bg-green-600 text-gray-900 dark:text-white ${borderRadius}`}>
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default LiveChat;
