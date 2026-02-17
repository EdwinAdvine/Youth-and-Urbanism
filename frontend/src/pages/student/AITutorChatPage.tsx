// AITutorChatPage - Student page at /dashboard/student/ai-tutor. Interactive chat interface
// with The Bird AI tutor for asking questions, getting explanations, and guided learning.
import React, { useState, useRef, useEffect } from 'react';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { chatWithAI } from '../../services/student/studentAIService';
import { Bot, Send, Sparkles, AlertCircle, Loader2 } from 'lucide-react';

interface ChatMessage {
  id: number;
  sender: 'student' | 'ai';
  text: string;
}

const AITutorChatPage: React.FC = () => {
  const { borderRadius } = useAgeAdaptiveUI();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, sender: 'ai', text: 'Hi! I\'m your AI tutor. How can I help you learn today?' },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!message.trim() || loading) return;

    const userMessage = message.trim();
    setMessage('');
    setError(null);

    const userMsg: ChatMessage = { id: Date.now(), sender: 'student', text: userMessage };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const conversationHistory = messages
        .filter(m => m.id !== 1)
        .map(m => ({
          role: m.sender === 'student' ? 'user' : 'assistant',
          content: m.text,
        }));
      conversationHistory.push({ role: 'user', content: userMessage });

      const response = await chatWithAI({
        message: userMessage,
        conversation_history: conversationHistory,
      });

      const aiMsg: ChatMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        text: response.message,
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || err?.message || 'Failed to get a response. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
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

          {loading && (
            <div className="flex justify-start">
              <div className={`max-w-[85%] sm:max-w-[70%] p-4 ${borderRadius} bg-purple-500/20 text-gray-900 dark:text-white border border-purple-500/30`}>
                <Bot className="w-4 h-4 inline-block mr-2" />
                <span className="inline-flex items-center gap-1">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Thinking...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {error && (
        <div className={`mb-2 p-3 bg-red-500/10 border border-red-500/20 ${borderRadius} flex items-center gap-2 text-red-400 text-sm`}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300 text-xs underline">Dismiss</button>
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your question..."
          disabled={loading}
          className={`flex-1 px-4 py-3 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus:outline-none focus:border-[#FF0000] disabled:opacity-50`}
        />
        <button
          onClick={handleSend}
          disabled={loading || !message.trim()}
          className={`px-6 py-3 bg-[#FF0000] hover:bg-[#FF0000]/80 text-gray-900 dark:text-white ${borderRadius} disabled:opacity-50`}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
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
