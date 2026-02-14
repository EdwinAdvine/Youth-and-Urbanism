import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, User as UserIcon, Sparkles, Brain, BookOpen, Play } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface ChatMessagesProps {
  messages: ChatMessage[];
  isTyping: boolean;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, isTyping }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const setBirdExpression = useChatStore((state) => state.setBirdExpression);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isTyping) {
      setBirdExpression('thinking');
    } else if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.type === 'ai') {
        setBirdExpression('happy');
      } else {
        setBirdExpression('listening');
      }
    } else {
      setBirdExpression('happy');
    }
  }, [isTyping, messages, setBirdExpression]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessageContent = (content: string) => {
    // Simple markdown-like formatting
    const lines = content.split('\n');
    
    return lines.map((line, index) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <p key={index} className="font-bold text-lg">
            {line.slice(2, -2)}
          </p>
        );
      } else if (line.startsWith('* ') || line.startsWith('- ')) {
        return (
          <li key={index} className="list-disc list-inside text-lg">
            {line.slice(2)}
          </li>
        );
      } else if (line.trim() === '') {
        return <br key={index} />;
      } else {
        return (
          <p key={index} className="text-lg">
            {line}
          </p>
        );
      }
    });
  };

  if (messages.length === 0 && !isTyping) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-r from-[#FF0000] to-[#E40000] rounded-full flex items-center justify-center text-gray-900 dark:text-white text-2xl mx-auto mb-6 shadow-lg shadow-[#FF0000]/30">
            🐦
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-[#FF0000] bg-clip-text text-transparent mb-4">
            Hi friend! 🐦✨
          </h2>
          <p className="text-lg text-gray-800 dark:text-white/90 mb-8 leading-relaxed">
            What do you want to talk about today? I'm here to help you learn and have fun!
          </p>
          
          {/* Suggestion Chips */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-sm mx-auto">
            {[
              { text: "Tell me a story", emoji: "📖" },
              { text: "Fun facts about animals", emoji: "🦁" },
              { text: "Help with math", emoji: "🔢" },
              { text: "Science questions", emoji: "🧪" }
            ].map((suggestion, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, boxShadow: "0 0 20px #FF0000" }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-[#FF0000] to-[#E40000] text-gray-900 dark:text-white px-4 py-3 rounded-full font-semibold text-base shadow-lg shadow-[#FF0000]/30 hover:shadow-[#FF0000]/50 transition-all duration-300 border border-[#FF0000]/50"
                >
                <span className="mr-2">{suggestion.emoji}</span>
                {suggestion.text}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
      <AnimatePresence mode="wait">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.type === 'ai' && (
              <div className="flex items-end gap-3 max-w-[80%]">
                <div className="w-10 h-10 bg-gradient-to-r from-[#FF0000] to-[#E40000] rounded-full flex items-center justify-center text-gray-900 dark:text-white text-lg shadow-lg shadow-[#FF0000]/30">
                  🐦
                </div>
                <div className="bg-gradient-to-r from-[#FF0000] to-[#E40000] border border-[#FF0000]/30 rounded-3xl rounded-tl-none px-4 py-3 shadow-lg shadow-[#FF0000]/20">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-800 dark:text-white/90">Chirpy</span>
                    <span className="text-xs text-gray-700 dark:text-white/80">{formatTime(message.timestamp)}</span>
                  </div>
                  <div className="text-lg text-gray-900 dark:text-white leading-relaxed">
                    {renderMessageContent(message.content)}
                  </div>
                </div>
              </div>
            )}
            
            {message.type === 'user' && (
              <div className="flex items-end gap-3 max-w-[80%]">
                <div className="bg-gradient-to-r from-[#FF0000] to-[#E40000] text-gray-900 dark:text-white rounded-3xl rounded-tr-none px-4 py-3 shadow-lg shadow-[#FF0000]/20 border border-[#FF0000]/30">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-800 dark:text-white/90">You</span>
                    <span className="text-xs text-gray-700 dark:text-white/80">{formatTime(message.timestamp)}</span>
                  </div>
                  <div className="text-lg leading-relaxed">
                    {renderMessageContent(message.content)}
                  </div>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-[#FF0000] to-[#E40000] rounded-full flex items-center justify-center text-gray-900 dark:text-white shadow-lg shadow-[#FF0000]/30">
                  <UserIcon className="w-5 h-5" />
                </div>
              </div>
            )}
          </motion.div>
        ))}
        
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex items-end gap-3 max-w-[80%]">
              <div className="w-10 h-10 bg-gradient-to-r from-[#FF0000] to-[#E40000] rounded-full flex items-center justify-center text-gray-900 dark:text-white text-lg shadow-lg shadow-[#FF0000]/30">
                🐦
              </div>
              <div className="bg-gradient-to-r from-[#FF0000] to-[#E40000] text-gray-900 dark:text-white rounded-3xl rounded-tl-none px-4 py-3 shadow-lg shadow-[#FF0000]/20 border border-[#FF0000]/30">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-gray-800 dark:text-white/90">Chirpy</span>
                    <span className="text-xs text-gray-700 dark:text-white/80">Typing...</span>
                  </div>
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;