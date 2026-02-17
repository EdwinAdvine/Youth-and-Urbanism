import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCoPilotStore } from '../../store';
import AgentProfileSettings from './AgentProfileSettings';
import {
  Bot,
  Plus,
  Settings,
  User,
  MessageCircle,
  Sparkles,
  Brain,
  BookOpen,
  Play,
  Star,
  X,
  WifiOff,
  Eye,
  Trash2,
  Sliders
} from 'lucide-react';
import { getDashboardConfig, DashboardType } from '../../utils/dashboardDetection';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';

interface CoPilotSidebarProps {
  onOpenAuthModal?: () => void;
}

const CoPilotSidebar: React.FC<CoPilotSidebarProps> = ({ onOpenAuthModal: _onOpenAuthModal }) => {
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);
  const [showAgentSettings, setShowAgentSettings] = useState(false);
  
  // State from stores
  const { 
    isExpanded, 
    activeRole, 
    isOnline, 
    sessions, 
    currentSessionId, 
    toggleExpanded, 
    setActiveRole, 
    setOnlineStatus,
    createSession,
    switchSession,
    deleteSession,
    markAsRead,
    isChatMode,
    chatMessages,
    activateChatMode,
    sendMessage,
    resetToNormalMode,
    clearChatMessages
  } = useCoPilotStore();

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setOnlineStatus(true);
      setShowOfflineMessage(false);
    };
    
    const handleOffline = () => {
      setOnlineStatus(false);
      setShowOfflineMessage(true);
      setTimeout(() => setShowOfflineMessage(false), 3000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnlineStatus]);

  // Role-specific content
  const roleConfig = {
    student: {
      title: "AI Learning Assistant",
      subtitle: "Your personal tutor",
      icon: <BookOpen className="w-6 h-6" />,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-gradient-to-br from-blue-500/10 to-cyan-500/10",
      borderColor: "border-blue-500/30"
    },
    parent: {
      title: "Parent Assistant", 
      subtitle: "Track progress & get insights",
      icon: <User className="w-6 h-6" />,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-gradient-to-br from-green-500/10 to-emerald-500/10",
      borderColor: "border-green-500/30"
    },
    teacher: {
      title: "Teaching Assistant",
      subtitle: "Class insights & tools",
      icon: <Play className="w-6 h-6" />,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-gradient-to-br from-purple-500/10 to-pink-500/10",
      borderColor: "border-purple-500/30"
    },
    admin: {
      title: "Admin Assistant",
      subtitle: "System insights",
      icon: <Settings className="w-6 h-6" />,
      color: "from-orange-500 to-red-500",
      bgColor: "bg-gradient-to-br from-orange-500/10 to-red-500/10",
      borderColor: "border-orange-500/30"
    },
    partner: {
      title: "Partner Assistant",
      subtitle: "Collaboration tools",
      icon: <MessageCircle className="w-6 h-6" />,
      color: "from-teal-500 to-blue-500",
      bgColor: "bg-gradient-to-br from-teal-500/10 to-blue-500/10",
      borderColor: "border-teal-500/30"
    },
    staff: {
      title: "Staff Assistant",
      subtitle: "Teaching & support tools",
      icon: <Brain className="w-6 h-6" />,
      color: "from-red-500 to-orange-500",
      bgColor: "bg-gradient-to-br from-red-500/10 to-orange-500/10",
      borderColor: "border-red-500/30"
    },
    instructor: {
      title: "Instructor Assistant",
      subtitle: "Course & student tools",
      icon: <Star className="w-6 h-6" />,
      color: "from-purple-500 to-violet-500",
      bgColor: "bg-gradient-to-br from-purple-500/10 to-violet-500/10",
      borderColor: "border-purple-500/30"
    }
  };

  const currentConfig = roleConfig[activeRole as keyof typeof roleConfig];
  
  // Get dashboard-specific quick actions
  const dashboardConfig = getDashboardConfig(activeRole as DashboardType);

  const handleNewSession = () => {
    createSession(activeRole);
  };

  const handleSessionSelect = (sessionId: string) => {
    switchSession(sessionId);
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteSession(sessionId);
  };

  const handleCloseSidebar = () => {
    toggleExpanded();
    markAsRead();
  };

  return (
    <>
      {/* Sidebar */}
      <motion.aside
        className={`
          fixed right-0 top-16 lg:top-20 z-40 h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)] 
          bg-gradient-to-b from-gray-50 dark:from-[#0F1112] to-gray-100 dark:to-[#181C1F]
          border-l border-gray-200 dark:border-[#22272B] shadow-xl
          overflow-hidden
        `}
        initial={{ x: 48, width: 48 }}
        animate={{ x: 0, width: isExpanded ? 360 : 48 }}
        transition={{ 
          duration: 0.3, 
          ease: 'easeInOut',
          layout: { duration: 0.3 }
        }}
        style={{
          boxShadow: isExpanded 
            ? '-8px 0 25px rgba(0, 0, 0, 0.3), -2px 0 8px rgba(0, 0, 0, 0.2)'
            : '-4px 0 15px rgba(0, 0, 0, 0.2)'
        }}
      >
        {/* Retracted View */}
        {!isExpanded && (
          <div className="h-full flex flex-col items-center justify-between py-4">
            {/* Top Icons */}
            <div className="space-y-2">
              <motion.button
                className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-300 dark:border-white/20 flex items-center justify-center transition-all duration-200"
                onClick={toggleExpanded}
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                whileTap={{ scale: 0.95 }}
                aria-label="Expand Co-Pilot"
              >
                <Sparkles className="w-5 h-5 text-gray-900 dark:text-white" />
              </motion.button>
              
              <motion.button
                className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-300 dark:border-white/20 flex items-center justify-center transition-all duration-200"
                onClick={() => setActiveRole(activeRole === 'student' ? 'parent' : 'student')}
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                whileTap={{ scale: 0.95 }}
                aria-label="Switch Role"
              >
                <User className="w-5 h-5 text-gray-900 dark:text-white" />
              </motion.button>
            </div>

            {/* Status Indicator */}
            <div className="flex flex-col items-center space-y-2">
              <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'} shadow-lg`} />
              <div className="text-xs text-gray-500 dark:text-white/60 rotate-90 whitespace-nowrap">
                {isOnline ? 'Online' : 'Offline'}
              </div>
            </div>
          </div>
        )}

        {/* Expanded View */}
        {isExpanded && (
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className={`
              p-4 border-b border-gray-200 dark:border-[#22272B] bg-gradient-to-r ${currentConfig.bgColor}
            `}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`
                    p-2 rounded-lg bg-gradient-to-br ${currentConfig.color} text-gray-900 dark:text-white
                    shadow-lg shadow-blue-500/20
                  `}>
                    {currentConfig.icon}
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900 dark:text-white text-lg">{currentConfig.title}</h2>
                    <p className="text-gray-600 dark:text-white/70 text-sm">{currentConfig.subtitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Online Status */}
                  <div className={`flex items-center gap-2 text-xs ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`} />
                    {isOnline ? 'Online' : 'Offline'}
                  </div>

                  {/* Agent Profile Settings */}
                  <motion.button
                    className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                    onClick={() => setShowAgentSettings(!showAgentSettings)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Agent Settings"
                    title="Customize AI Agent"
                  >
                    <Sliders className="w-4 h-4 text-gray-900 dark:text-white" />
                  </motion.button>

                  {/* Close Button */}
                  <motion.button
                    className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                    onClick={handleCloseSidebar}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Close Co-Pilot"
                  >
                    <X className="w-5 h-5 text-gray-900 dark:text-white" />
                  </motion.button>
                </div>
              </div>


              {/* Chat Toggle */}
              <div className="flex gap-2 mt-3">
                <motion.button
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                    transition-all duration-200 border
                    ${isChatMode 
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-gray-900 dark:text-white border-transparent' 
                      : 'bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-white/80 border-gray-300 dark:border-white/20 hover:bg-gray-100 dark:hover:bg-white/10'
                    }
                  `}
                  onClick={() => {
                    if (isChatMode) {
                      resetToNormalMode();
                    } else {
                      activateChatMode();
                    }
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <MessageCircle className="w-4 h-4" />
                  {isChatMode ? 'Exit Chat' : 'Chat with AI'}
                </motion.button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {showAgentSettings ? (
                <AgentProfileSettings onClose={() => setShowAgentSettings(false)} />
              ) : isChatMode ? (
                // Chat Interface
                <div className="flex flex-col h-full">
                  {/* Chat Header */}
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200 dark:border-[#22272B]">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                        <Bot className="w-5 h-5 text-gray-900 dark:text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">AI Assistant</h3>
                        <p className="text-xs text-gray-500 dark:text-white/60">Connected • Ready to help</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.button
                        className="p-2 text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                        onClick={clearChatMessages}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label="Clear chat"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                      <span className="text-xs text-gray-500 dark:text-white/60">Session: {currentSessionId || 'New'}</span>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <ChatMessages messages={chatMessages} />

                  {/* Chat Input */}
                  <ChatInput 
                    onSendMessage={sendMessage}
                    isDisabled={!isOnline}
                  />
                </div>
              ) : (
                // Normal Dashboard Content
                <>
                  {/* Dashboard-Specific Quick Actions */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-white/80 mb-3">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {dashboardConfig.quickActions.slice(0, 4).map((action) => (
                        <motion.button
                          key={action.id}
                          className="p-3 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg border border-gray-300 dark:border-white/20 text-left transition-all"
                          whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                          whileTap={{ scale: 0.98 }}
                          onClick={action.onClick}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-2xl">{action.icon}</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{action.title}</span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-white/60">{action.description}</p>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Sessions */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-white/80">Recent Sessions</h3>
                      <motion.button
                        className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                        onClick={handleNewSession}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label="New Session"
                      >
                        <Plus className="w-4 h-4 text-gray-900 dark:text-white" />
                      </motion.button>
                    </div>
                    
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {sessions.slice(0, 5).map((session) => (
                        <motion.button
                          key={session.id}
                          className={`
                            w-full p-3 rounded-lg text-left border transition-all
                            ${currentSessionId === session.id 
                              ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/40' 
                              : 'bg-gray-50 dark:bg-white/5 border-gray-300 dark:border-white/20 hover:bg-gray-100 dark:hover:bg-white/10'
                            }
                          `}
                          onClick={() => handleSessionSelect(session.id)}
                          whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{session.title}</span>
                            <button
                              className="p-1 hover:bg-gray-200 dark:hover:bg-white/20 rounded transition-colors"
                              onClick={(e) => handleDeleteSession(session.id, e)}
                              aria-label="Delete session"
                            >
                              <X className="w-3 h-3 text-gray-500 dark:text-white/60" />
                            </button>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-white/60">
                            <span>{session.role}</span>
                            <span>{session.lastActivity.toLocaleDateString()}</span>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Tips */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-white/80 mb-3">Tips</h3>
                    <div className="space-y-2">
                      <div className="p-3 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/20">
                        <div className="flex items-center gap-2 mb-1">
                          <Sparkles className="w-4 h-4 text-blue-400" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">Ask me anything</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-white/70">I can help with assignments, progress tracking, and learning tips</p>
                      </div>
                      
                      <div className="p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
                        <div className="flex items-center gap-2 mb-1">
                          <Eye className="w-4 h-4 text-green-400" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">Privacy first</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-white/70">Your data is secure and private</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-[#22272B] bg-gradient-to-t from-gray-50 dark:from-[#0F1112] to-transparent">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-white/60">
                <span>AI Co-Pilot v1.0</span>
              </div>
            </div>
          </div>
        )}
      </motion.aside>

      {/* Offline Message */}
      <AnimatePresence>
        {showOfflineMessage && (
          <motion.div
            className="fixed bottom-4 left-4 right-4 md:right-4 md:left-auto md:w-64 bg-red-500/90 text-gray-900 dark:text-white p-3 rounded-lg shadow-lg backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4" />
              <span className="text-sm">Offline mode - limited functionality</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CoPilotSidebar;