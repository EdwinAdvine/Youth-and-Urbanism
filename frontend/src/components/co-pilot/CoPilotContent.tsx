import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '../../store/chatStore';
import { useCoPilotStore } from '../../store';
import { 
  Bot, 
  User, 
  Sparkles, 
  Brain, 
  BookOpen, 
  Play, 
  Star, 
  Clock, 
  Eye, 
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

  // AI responses for different roles
  const roleResponses = {
    student: [
      "Let me check your recent assignments and progress...",
      "Based on your learning patterns, I recommend focusing on math fundamentals.",
      "Here's a fun way to learn that concept - let's explore together!",
      "Your progress is impressive! Keep up the great work.",
      "I can help explain that topic in a simpler way."
    ],
    parent: [
      "Your child is making excellent progress in math and reading.",
      "Here are some activities you can do at home to support their learning.",
      "I've noticed some areas where they could use extra practice.",
      "Their recent quiz scores show improvement in science concepts.",
      "Let me generate a progress report for you."
    ],
    teacher: [
      "Class average on the recent test was 78%, with 3 students needing extra help.",
      "I've analyzed the learning patterns and suggest these teaching strategies.",
      "Here are insights on student engagement levels this week.",
      "The most challenging topic this month was algebra fundamentals.",
      "Let me help you create a personalized learning plan for struggling students."
    ],
    admin: [
      "System usage has increased by 25% this month across all departments.",
      "Here are the key performance metrics for the learning platform.",
      "I've identified some areas where we can improve user engagement.",
      "Budget allocation analysis shows optimal resource distribution.",
      "Let me generate a comprehensive system report for you."
    ],
    partner: [
      "Your collaboration metrics show strong engagement with community features.",
      "Here are some partnership opportunities based on your interests.",
      "I've found relevant resources for your current projects.",
      "Your recent contributions have been highly valued by the community.",
      "Let me suggest some networking opportunities for you."
    ]
  };

  const handleSendMessage = (message: string) => {
    if (!message.trim()) return;

    // Add user message
    addMessage({
      type: 'user',
      content: message
    });

    // Clear input
    setCurrentInput('');
    setIsTyping(true);

    // Simulate AI thinking and response
    setTimeout(() => {
      setIsTyping(false);
      const responses = roleResponses[activeRole as keyof typeof roleResponses] || roleResponses.student;
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      addMessage({
        type: 'ai',
        content: randomResponse
      });

    }, 1500);
  };

  const handleQuickAction = (action: string) => {
    const actionMessages: Record<string, string> = {
      'progress': "Let me analyze your recent progress and assignments...",
      'achievements': "Here are your recent certificates and achievements...",
      'community': "Let me check your recent forum activity and community posts...",
      'finance': "Here are your recent transactions and wallet balance...",
      'insights': "Let me provide some personalized learning insights...",
      'report': "Generating a comprehensive progress report..."
    };

    const message = actionMessages[action] || "Let me help you with that!";
    handleSendMessage(message);
  };

  const getRoleIcon = () => {
    switch (activeRole) {
      case 'student': return <BookOpen className="w-6 h-6" />;
      case 'parent': return <Users className="w-6 h-6" />;
      case 'teacher': return <Play className="w-6 h-6" />;
      case 'admin': return <Award className="w-6 h-6" />;
      case 'partner': return <MessageCircle className="w-6 h-6" />;
      default: return <Bot className="w-6 h-6" />;
    }
  };

  const getRoleColor = () => {
    switch (activeRole) {
      case 'student': return 'from-blue-500 to-cyan-500';
      case 'parent': return 'from-green-500 to-emerald-500';
      case 'teacher': return 'from-purple-500 to-pink-500';
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
          <div className="p-4 border-b border-[#22272B] bg-gradient-to-r from-white/5 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`
                  p-2 rounded-lg bg-gradient-to-br ${getRoleColor()} text-white
                  shadow-lg shadow-blue-500/20
                `}>
                  {getRoleIcon()}
                </div>
                <div>
                  <h2 className="font-semibold text-white text-lg">
                    {activeRole.charAt(0).toUpperCase() + activeRole.slice(1)} Assistant
                  </h2>
                  <p className="text-white/70 text-sm">CBC-aligned personalized support</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/60">
                <span>Session: {currentSessionId?.slice(0, 8) || 'N/A'}</span>
                <div className="w-2 h-2 rounded-full bg-green-400 shadow-lg" />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-4 border-b border-[#22272B]">
            <h3 className="text-sm font-semibold text-white/80 mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <motion.button
                className="p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/20 text-left transition-all"
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleQuickAction('progress')}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1 bg-blue-500/20 rounded">
                    <FileText className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-sm font-medium text-white">Progress</span>
                </div>
                <p className="text-xs text-white/60">View assignments & progress</p>
              </motion.button>

              <motion.button
                className="p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/20 text-left transition-all"
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleQuickAction('achievements')}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1 bg-yellow-500/20 rounded">
                    <Award className="w-4 h-4 text-yellow-400" />
                  </div>
                  <span className="text-sm font-medium text-white">Achievements</span>
                </div>
                <p className="text-xs text-white/60">View certificates & badges</p>
              </motion.button>

              <motion.button
                className="p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/20 text-left transition-all"
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleQuickAction('community')}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1 bg-green-500/20 rounded">
                    <Users className="w-4 h-4 text-green-400" />
                  </div>
                  <span className="text-sm font-medium text-white">Community</span>
                </div>
                <p className="text-xs text-white/60">Forum posts & replies</p>
              </motion.button>

              <motion.button
                className="p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/20 text-left transition-all"
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleQuickAction('finance')}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1 bg-purple-500/20 rounded">
                    <Wallet className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="text-sm font-medium text-white">Finance</span>
                </div>
                <p className="text-xs text-white/60">Transactions & balance</p>
              </motion.button>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <div className="flex justify-center mb-4">
                  <div className={`
                    p-4 rounded-full bg-gradient-to-br ${getRoleColor()} text-white
                    shadow-lg shadow-blue-500/20
                  `}>
                    <Bot className="w-8 h-8" />
                  </div>
                </div>
                <h3 className="text-white text-lg font-semibold mb-2">Welcome to AI Co-Pilot</h3>
                <p className="text-white/70 mb-4">
                  I'm here to help you with {activeRole}-specific tasks and questions.
                </p>
                <div className="space-y-2">
                  <p className="text-xs text-white/60">Try asking:</p>
                  <div className="grid grid-cols-1 gap-2 text-xs">
                    <span className="bg-white/10 text-white/80 px-3 py-2 rounded-lg">"How is my progress?"</span>
                    <span className="bg-white/10 text-white/80 px-3 py-2 rounded-lg">"What assignments are due?"</span>
                    <span className="bg-white/10 text-white/80 px-3 py-2 rounded-lg">"Show me my achievements"</span>
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
                      : 'bg-white/5 border-white/20 mr-auto'
                    }
                  `}>
                    <div className="flex items-start gap-2 mb-1">
                      <div className={`
                        p-1 rounded-full
                        ${message.type === 'user' ? 'bg-blue-500/30' : 'bg-white/20'}
                      `}>
                        {message.type === 'user' ? (
                          <User className="w-4 h-4 text-blue-400" />
                        ) : (
                          <Bot className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <span className="text-xs text-white/60">
                        {message.type === 'user' ? 'You' : 'AI Assistant'}
                      </span>
                    </div>
                    <p className="text-sm text-white">{message.content}</p>
                    <div className="flex justify-end mt-1">
                      <span className="text-xs text-white/50">
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
                <div className="bg-white/5 border border-white/20 rounded-2xl p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-xs text-white/60">Thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-[#22272B] bg-gradient-to-t from-[#0F1112] to-transparent">
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
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
              <motion.button
                className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg shadow-lg"
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
            <div className="flex justify-between items-center mt-2 text-xs text-white/60">
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