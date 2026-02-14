import React, { useState } from 'react';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { Bot, Send, Sparkles } from 'lucide-react';

const AITutorChatPage: React.FC = () => {
  const { borderRadius } = useAgeAdaptiveUI();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, sender: 'ai', text: 'Hi! I\'m your AI tutor. How can I help you learn today?' },
  ]);

  const handleSend = () => {
    if (!message.trim()) return;
    setMessages([...messages, { id: Date.now(), sender: 'student', text: message }]);
    setMessage('');
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now(), sender: 'ai', text: 'That\'s a great question! Let me help you with that...' }]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Chat with AI Tutor</h1>
        <p className="text-gray-600 dark:text-white/70">Ask me anything - I'm here to help you learn!</p>
      </div>

      <div className={`flex-1 p-6 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] overflow-y-auto mb-4`}>
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
        </div>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your question..."
          className={`flex-1 px-4 py-3 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus:outline-none focus:border-[#FF0000]`}
        />
        <button
          onClick={handleSend}
          className={`px-6 py-3 bg-[#FF0000] hover:bg-[#FF0000]/80 text-gray-900 dark:text-white ${borderRadius}`}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      <div className="mt-4 flex gap-2 flex-wrap">
        <button onClick={() => setMessage('Can you explain this concept to me?')} className={`px-4 py-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-900 dark:text-white text-sm ${borderRadius}`}>
          <Sparkles className="w-4 h-4 inline-block mr-2" />
          Explain this concept
        </button>
        <button onClick={() => setMessage('I need help with my homework.')} className={`px-4 py-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-900 dark:text-white text-sm ${borderRadius}`}>
          Help with homework
        </button>
        <button onClick={() => setMessage('Give me a practice quiz on what I learned today.')} className={`px-4 py-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-900 dark:text-white text-sm ${borderRadius}`}>
          Practice quiz
        </button>
      </div>
    </div>
  );
};

export default AITutorChatPage;
