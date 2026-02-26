import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '../../store/chatStore';
import { useCoPilotStore } from '../../store';
import aiTutorService from '../../services/aiTutorService';
import {
  Bot,
  User,
  Sparkles,
  BookOpen,
  Play,
  EyeOff,
  MessageCircle,
  FileText,
  Award,
  Wallet,
  Users,
  Send
} from 'lucide-react';

interface CoPilotContentProps {
  isExpanded: boolean;
}

const CoPilotContent: React.FC<CoPilotContentProps> = ({ isExpanded }) => {
  const [isTyping, setIsTyping] = useState(false);
  const [currentInput, setCurrentInput] = useState('');

  // State from stores
  const { messages, addMessage, updateCurrentInput } = useChatStore();
  const { activeRole, currentSessionId } = useCoPilotStore();

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    // Add user message
    addMessage({
      type: 'user',
      content: message
    });

    // Clear input
    setCurrentInput('');
    setIsTyping(true);

    try {
      // Send to real AI backend
      const response = await aiTutorService.sendMessage({
        message,
        include_context: true,
        context_messages: 10
      });

      addMessage({
        type: 'ai',
        content: response.message,
        audioUrl: response.audio_url,
        videoUrl: response.video_url
      });
    } catch (error) {
      console.error('CoPilot AI request failed:', error);
      addMessage({
        type: 'ai',
        content: "I'm having trouble connecting right now. Please check that the backend is running and try again."
      });
    } finally {
      setIsTyping(false);
    }
  };

  // Quick actions send real prompts to the AI backend
  const handleQuickAction = (action: string) => {
    const actionPrompts: Record<string, string> = {
      'progress': "Analyze my recent progress and assignments. What should I focus on next?",
      'achievements': "Show me a summary of my recent certificates, badges, and achievements.",
      'community': "Summarize my recent forum activity and community interactions.",
      'finance': "Give me a summary of my recent transactions and current wallet balance.",
      'insights': "Provide personalized learning insights based on my recent performance.",
      'report': "Generate a comprehensive progress report covering my recent learning activities."
    };

    const prompt = actionPrompts[action] || `Help me with: ${action}`;
    handleSendMessage(prompt);
  };

  const getRoleIcon = () => {
    switch (activeRole) {
      case 'student': return <BookOpen className="w-6 h-6" />;
      case 'parent': return <Users className="w-6 h-6" />;
      case 'instructor': return <Play className="w-6 h-6" />;
      case 'admin': return <Award className="w-6 h-6" />;
      case 'partner': return <MessageCircle className="w-6 h-6" />;
      default: return <Bot className="w-6 h-6" />;
    }
  };

  const getRoleColor = () => {
    switch (activeRole) {
      case 'student': return 'from-blue-500 to-cyan-500';
      case 'parent': return 'from-green-500 to-emerald-500';
      case 'instructor': return 'from-purple-500 to-pink-500';
      case 'admin': return 'from-orange-500 to-red-500';
      case 'partner': return 'from-teal-500 to-blue-500';
      default: return 'from-blue-500 to-cyan-500';
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isExpanded && (
        <motion.div
          className="h-full flex flex-col"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-[#22272B] bg-gradient-to-r from-white/5 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`
                  p-2 rounded-lg bg-gradient-to-br ${getRoleColor()} text-gray-900 dark:text-white
                  shadow-lg shadow-blue-500/20
                `}>
                  {getRoleIcon()}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-white text-lg">
                    {activeRole.charAt(0).toUpperCase() + activeRole.slice(1)} Assistant
                  </h2>
                  <p className="text-gray-600 dark:text-white/70 text-sm">CBC-aligned personalized support</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-white/60">
                <span>Session: {currentSessionId?.slice(0, 8) || 'N/A'}</span>
                <div className="w-2 h-2 rounded-full bg-green-400 shadow-lg" />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-4 border-b border-gray-200 dark:border-[#22272B]">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-white/80 mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <motion.button
                className="p-3 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg border border-gray-300 dark:border-white/20 text-left transition-all"
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleQuickAction('progress')}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1 bg-blue-500/20 rounded">
                    <FileText className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Progress</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-white/60">View assignments & progress</p>
              </motion.button>

              <motion.button
                className="p-3 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg border border-gray-300 dark:border-white/20 text-left transition-all"
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleQuickAction('achievements')}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1 bg-yellow-500/20 rounded">
                    <Award className="w-4 h-4 text-yellow-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Achievements</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-white/60">View certificates & badges</p>
              </motion.button>

              <motion.button
                className="p-3 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg border border-gray-300 dark:border-white/20 text-left transition-all"
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleQuickAction('community')}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1 bg-green-500/20 rounded">
                    <Users className="w-4 h-4 text-green-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Community</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-white/60">Forum posts & replies</p>
              </motion.button>

              <motion.button
                className="p-3 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg border border-gray-300 dark:border-white/20 text-left transition-all"
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleQuickAction('finance')}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1 bg-purple-500/20 rounded">
                    <Wallet className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Finance</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-white/60">Transactions & balance</p>
              </motion.button>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <div className="flex justify-center mb-4">
                  <div className={`
                    p-4 rounded-full bg-gradient-to-br ${getRoleColor()} text-gray-900 dark:text-white
                    shadow-lg shadow-blue-500/20
                  `}>
                    <Bot className="w-8 h-8" />
                  </div>
                </div>
                <h3 className="text-gray-900 dark:text-white text-lg font-semibold mb-2">Welcome to AI Co-Pilot</h3>
                <p className="text-gray-600 dark:text-white/70 mb-4">
                  I'm here to help you with {activeRole}-specific tasks and questions.
                </p>
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 dark:text-white/60">Try asking:</p>
                  <div className="grid grid-cols-1 gap-2 text-xs">
                    <span className="bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white/80 px-3 py-2 rounded-lg">"How is my progress?"</span>
                    <span className="bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white/80 px-3 py-2 rounded-lg">"What assignments are due?"</span>
                    <span className="bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white/80 px-3 py-2 rounded-lg">"Show me my achievements"</span>
                  </div>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <motion.div
                  key={message.id}
                  className={`
                    max-w-xs lg:max-w-md mx-auto
                    ${message.type === 'user' ? 'ml-auto' : 'mr-auto'}
                  `}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={`
                    p-3 rounded-2xl border
                    ${message.type === 'user' 
                      ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/40 ml-auto' 
                      : 'bg-gray-50 dark:bg-white/5 border-gray-300 dark:border-white/20 mr-auto'
                    }
                  `}>
                    <div className="flex items-start gap-2 mb-1">
                      <div className={`
                        p-1 rounded-full
                        ${message.type === 'user' ? 'bg-blue-500/30' : 'bg-gray-200 dark:bg-white/20'}
                      `}>
                        {message.type === 'user' ? (
                          <User className="w-4 h-4 text-blue-400" />
                        ) : (
                          <Bot className="w-4 h-4 text-gray-900 dark:text-white" />
                        )}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-white/60">
                        {message.type === 'user' ? 'You' : 'AI Assistant'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 dark:text-white">{message.content}</p>
                    <div className="flex justify-end mt-1">
                      <span className="text-xs text-gray-500 dark:text-white/50">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}

            {isTyping && (
              <motion.div
                className="flex justify-start"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/20 rounded-2xl p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-white/60">Thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 dark:border-[#22272B] bg-gradient-to-t from-gray-50 dark:from-[#0F1112] to-transparent">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={currentInput}
                  onChange={(e) => {
                    setCurrentInput(e.target.value);
                    updateCurrentInput(e.target.value);
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && currentInput.trim()) {
                      handleSendMessage(currentInput);
                    }
                  }}
                  placeholder={`Ask ${activeRole} assistant...`}
                  className="w-full bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-lg px-4 py-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/50 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-white/40">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
              <motion.button
                className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-gray-900 dark:text-white rounded-lg shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (currentInput.trim()) {
                    handleSendMessage(currentInput);
                  }
                }}
                disabled={!currentInput.trim()}
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </div>
            <div className="flex justify-between items-center mt-2 text-xs text-gray-500 dark:text-white/60">
              <span>Tips: Ask about progress, assignments, or CBC topics</span>
              <div className="flex items-center gap-2">
                <EyeOff className="w-4 h-4" />
                <span>Private & secure</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CoPilotContent;