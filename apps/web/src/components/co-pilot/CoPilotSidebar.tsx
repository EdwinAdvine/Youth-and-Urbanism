import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCoPilotStore } from '../../store';
import { useAuthStore } from '../../store/authStore';
import AgentProfileSettings from './AgentProfileSettings';
import copilotService from '../../services/copilotService';
import {
  Settings,
  User,
  MessageCircle,
  Sparkles,
  Brain,
  BookOpen,
  Star,
  X,
  WifiOff,
  Trash2
} from 'lucide-react';
import { getDashboardConfig, DashboardType } from '../../utils/dashboardDetection';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import AvatarThumbnail from '../avatar/AvatarThumbnail';
import { useAvatarStore } from '../../store/avatarStore';


interface CoPilotSidebarProps {
  onOpenAuthModal?: () => void;
}

const CoPilotSidebar: React.FC<CoPilotSidebarProps> = ({ onOpenAuthModal: _onOpenAuthModal }) => {
  const navigate = useNavigate();
  const authUser = useAuthStore((s) => s.user);
  const activeAvatar = useAvatarStore((s) => s.activeAvatar);

  const [showOfflineMessage, setShowOfflineMessage] = useState(false);
  const [showAgentSettings, setShowAgentSettings] = useState(false);
  const [studentAitCode, setStudentAitCode] = useState<string | null>(null);

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
    switchSession,
    deleteSession,
    markAsRead,
    isChatMode,
    chatMessages,
    activateChatMode,
    sendMessage,
    resetToNormalMode,
    clearChatMessages,
    agentProfile,
    setAgentProfile,
    insights,
    setInsights,
    setPendingAiPrompt,
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

  // Auto-sync role from auth — fail safe for unknown roles
  useEffect(() => {
    if (authUser?.role) {
      const validRoles = new Set(['student', 'parent', 'instructor', 'admin', 'partner', 'staff']);
      const normalizedRole =
        (authUser.role as string) === 'teacher' ? 'instructor' :
        validRoles.has(authUser.role) ? authUser.role : null;

      if (normalizedRole === null) {
        console.error(`CoPilot: Unknown auth role "${authUser.role}". Using safe default.`);
        return;
      }

      if (normalizedRole !== activeRole) {
        setActiveRole(normalizedRole as any);
      }
    }
  }, [authUser?.role, activeRole, setActiveRole]);

  // Load agent profile on mount
  useEffect(() => {
    if (authUser) {
      copilotService.getAgentProfile()
        .then(p => setAgentProfile({ agent_name: p.agent_name, avatar_url: p.avatar_url ?? null }))
        .catch(() => {
          // Use defaults
        });
    }
  }, [authUser, setAgentProfile]);

  // Load AI Tutor AIT code for student role
  useEffect(() => {
    if (authUser?.role === 'student') {
      import('../../services/student/studentAIService')
        .then(({ getTutorInfo }) => getTutorInfo())
        .then((info) => setStudentAitCode(info.ait_code))
        .catch(() => {
          // AIT code not critical — silently skip
        });
    }
  }, [authUser?.role]);

  // Load insights on mount
  useEffect(() => {
    if (authUser) {
      copilotService.getInsights()
        .then(response => setInsights(response.insights))
        .catch(() => {
          // Use empty insights
        });
    }
  }, [authUser, setInsights]);

  // Auto-open CoPilot for new users with a welcome session
  useEffect(() => {
    if (!authUser) return;

    const welcomeShownKey = `copilot_welcome_shown_${authUser.id}`;
    const alreadyShown = localStorage.getItem(welcomeShownKey);
    if (alreadyShown) return;

    // Check if user has a welcome session by loading sessions
    copilotService.listSessions(1, 5)
      .then(response => {
        const welcomeSession = response.sessions?.find(
          (s: { title: string }) => s.title?.startsWith('Welcome to')
        );
        if (welcomeSession) {
          // Auto-expand sidebar and load the welcome session
          useCoPilotStore.getState().setExpanded(true);
          useCoPilotStore.getState().activateChatMode();

          // Load the welcome message into chat
          copilotService.getSession(welcomeSession.id)
            .then(sessionDetail => {
              if (sessionDetail.messages?.length > 0) {
                const msg = sessionDetail.messages[0];
                useCoPilotStore.getState().addChatMessage({
                  id: msg.id,
                  content: msg.content,
                  sender: 'ai',
                  timestamp: new Date(msg.created_at),
                  status: 'sent',
                });
                useCoPilotStore.setState({ currentSessionId: welcomeSession.id });
              }
            })
            .catch(() => {});

          localStorage.setItem(welcomeShownKey, 'true');
        }
      })
      .catch(() => {});
  }, [authUser]);

  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  // Role-specific content
  const roleConfig = {
    student: {
      title: "Birdy",
      subtitle: "Your personal AI tutor",
      icon: <BookOpen className="w-6 h-6" />,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-gradient-to-br from-blue-500/10 to-cyan-500/10",
      borderColor: "border-blue-500/30"
    },
    parent: {
      title: "Parents Companion",
      subtitle: "Track progress & get insights",
      icon: <User className="w-6 h-6" />,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-gradient-to-br from-green-500/10 to-emerald-500/10",
      borderColor: "border-green-500/30"
    },
    admin: {
      title: "Bird Admin AI",
      subtitle: "Platform analytics & operations",
      icon: <Settings className="w-6 h-6" />,
      color: "from-orange-500 to-red-500",
      bgColor: "bg-gradient-to-br from-orange-500/10 to-red-500/10",
      borderColor: "border-orange-500/30"
    },
    partner: {
      title: "Sponsors AI",
      subtitle: "Impact tracking & collaboration",
      icon: <MessageCircle className="w-6 h-6" />,
      color: "from-teal-500 to-blue-500",
      bgColor: "bg-gradient-to-br from-teal-500/10 to-blue-500/10",
      borderColor: "border-teal-500/30"
    },
    staff: {
      title: "Staff AI",
      subtitle: "Support & operations tools",
      icon: <Brain className="w-6 h-6" />,
      color: "from-red-500 to-orange-500",
      bgColor: "bg-gradient-to-br from-red-500/10 to-orange-500/10",
      borderColor: "border-red-500/30"
    },
    instructor: {
      title: "Instructor AI",
      subtitle: "Lesson planning & student tools",
      icon: <Star className="w-6 h-6" />,
      color: "from-purple-500 to-violet-500",
      bgColor: "bg-gradient-to-br from-purple-500/10 to-violet-500/10",
      borderColor: "border-purple-500/30"
    }
  };

  const currentConfig = roleConfig[activeRole as keyof typeof roleConfig];

  // Role-canonical agent names — these are role-locked and always shown as primary identity
  const roleCanonicalNames: Record<string, string> = {
    student: 'Birdy',
    parent: 'Parents Companion',
    instructor: 'Instructor AI',
    admin: 'Bird Admin AI',
    staff: 'Staff AI',
    partner: 'Sponsors AI',
  };

  // Always display the role-locked canonical name as primary identity
  const canonicalName = roleCanonicalNames[activeRole] || currentConfig.title;
  const genericDefaults = ['The Bird AI', 'AI Assistant', 'Urban Home School AI', ...Object.values(roleCanonicalNames)];
  const hasCustomName = agentProfile?.agent_name
    && !genericDefaults.includes(agentProfile.agent_name);
  const displayAgentName = canonicalName;
  const customSubtitle = hasCustomName ? agentProfile!.agent_name : null;

  // Get dashboard-specific quick actions
  const dashboardConfig = getDashboardConfig(activeRole as DashboardType);

  const handleSessionSelect = (sessionId: string) => {
    switchSession(sessionId);
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteSession(sessionId);
  };

  const handleCloseSidebar = () => {
    if (isChatMode) {
      resetToNormalMode();
    }
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
                onClick={() => {
                  toggleExpanded();
                  setShowAgentSettings(true);
                }}
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                whileTap={{ scale: 0.95 }}
                aria-label="Open Agent Profile"
              >
                {activeAvatar?.thumbnail_url ? (
                  <AvatarThumbnail size={24} />
                ) : agentProfile?.avatar_url ? (
                  <img
                    src={agentProfile.avatar_url}
                    alt="Agent avatar"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 text-gray-900 dark:text-white" />
                )}
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
            {/* Unified Header */}
            <div className={`
              px-3 py-2.5 border-b border-gray-200 dark:border-[#22272B] bg-gradient-to-r ${currentConfig.bgColor}
            `}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`
                    p-1.5 rounded-lg bg-gradient-to-br ${currentConfig.color} text-gray-900 dark:text-white
                    shadow-lg shadow-blue-500/20 flex-shrink-0
                  `}>
                    {activeAvatar?.thumbnail_url ? (
                      <AvatarThumbnail size={20} />
                    ) : agentProfile?.avatar_url ? (
                      <img
                        src={agentProfile.avatar_url}
                        alt={agentProfile.agent_name}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                    ) : (
                      React.cloneElement(currentConfig.icon, { className: 'w-5 h-5' })
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h2 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                        {displayAgentName}
                      </h2>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-white/50 border border-gray-300 dark:border-white/10 flex-shrink-0">
                        {activeRole.charAt(0).toUpperCase() + activeRole.slice(1)}
                      </span>
                    </div>
                    {customSubtitle && (
                      <p className="text-[10px] text-gray-400 dark:text-white/40 truncate">
                        aka &ldquo;{customSubtitle}&rdquo;
                      </p>
                    )}
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isOnline ? 'bg-green-400' : 'bg-red-400'}`} />
                      <p className="text-gray-600 dark:text-white/60 text-xs truncate">
                        {isOnline ? (isChatMode ? 'Connected' : currentConfig.subtitle) : 'Offline'}
                      </p>
                    </div>
                    {activeRole === 'student' && studentAitCode && (
                      <p className="text-[10px] font-mono text-blue-400/80 dark:text-blue-400/70 truncate mt-0.5">
                        {studentAitCode}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {/* Clear chat (only in chat mode) */}
                  {isChatMode && (
                    <motion.button
                      className="p-1.5 text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                      onClick={clearChatMessages}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label="Clear chat"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  )}
                  {/* Close Button */}
                  <motion.button
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                    onClick={handleCloseSidebar}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Close Co-Pilot"
                  >
                    <X className="w-4 h-4 text-gray-900 dark:text-white" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className={`flex-1 min-h-0 ${isChatMode && !showAgentSettings ? 'overflow-hidden flex flex-col' : 'overflow-y-auto p-4 space-y-4'}`}>
              {showAgentSettings ? (
                <AgentProfileSettings
                  onClose={() => setShowAgentSettings(false)}
                  onProfileUpdate={(profile) => setAgentProfile(profile)}
                />
              ) : isChatMode ? (
                // Chat Interface
                <>
                  {/* Chat Messages */}
                  <ChatMessages messages={chatMessages} />

                  {/* Chat Input */}
                  <ChatInput
                    onSendMessage={sendMessage}
                    isDisabled={!isOnline}
                  />
                </>
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
                          onClick={() => {
                            navigate(action.route);
                            setPendingAiPrompt(action.aiPrompt);
                            activateChatMode();
                          }}
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
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-white/80 mb-3">Recent Sessions</h3>

                    {sessions.filter(s => s.messages > 0).length === 0 ? (
                      <div className="text-center py-6 text-gray-500 dark:text-white/60">
                        <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-xs">No conversations yet. Start chatting below!</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {sessions.filter(s => s.messages > 0).slice(0, 5).map((session) => (
                          <motion.button
                            key={session.id}
                            className={`
                              w-full p-3 rounded-lg text-left border transition-all
                              ${currentSessionId === session.id
                                ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/40'
                                : 'bg-gray-50 dark:bg-white/5 border-gray-300 dark:border-white/20 hover:bg-gray-100 dark:hover:bg-white/10'
                              }
                            `}
                            onClick={() => {
                              handleSessionSelect(session.id);
                              activateChatMode();
                            }}
                            whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{session.title}</span>
                              <button
                                className="p-1 hover:bg-gray-200 dark:hover:bg-white/20 rounded transition-colors"
                                onClick={(e) => handleDeleteSession(session.id, e)}
                                aria-label="Delete session"
                              >
                                <X className="w-3 h-3 text-gray-500 dark:text-white/60" />
                              </button>
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-white/60">
                              <span className="capitalize">{session.role}</span>
                              <span>{formatRelativeTime(session.lastActivity)}</span>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Dynamic Insights */}
                  {insights.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-white/80 mb-3">Insights</h3>
                      <div className="space-y-2">
                        {insights.slice(0, 3).map((insight, idx) => {
                          const priorityColor =
                            insight.priority >= 80 ? 'from-red-500/10 to-orange-500/10 border-red-500/20' :
                            insight.priority >= 50 ? 'from-blue-500/10 to-cyan-500/10 border-blue-500/20' :
                            'from-green-500/10 to-emerald-500/10 border-green-500/20';

                          const iconColor =
                            insight.priority >= 80 ? 'text-red-400' :
                            insight.priority >= 50 ? 'text-blue-400' :
                            'text-green-400';

                          return (
                            <motion.div
                              key={idx}
                              className={`p-3 bg-gradient-to-r ${priorityColor} rounded-lg border cursor-pointer hover:scale-102 transition-transform`}
                              onClick={() => {
                                if (insight.action_url) {
                                  navigate(insight.action_url);
                                }
                              }}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <Sparkles className={`w-4 h-4 ${iconColor}`} />
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{insight.title}</span>
                              </div>
                              <p className="text-xs text-gray-600 dark:text-white/70">{insight.body}</p>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Chat with AI Button (Fixed Bottom) */}
            {!showAgentSettings && !isChatMode && (
              <div className="p-4 border-t border-gray-200 dark:border-[#22272B]">
                <motion.button
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#FF0000] to-[#E40000] hover:from-[#E40000] hover:to-[#D00000] text-white font-semibold rounded-lg shadow-lg transition-all"
                  onClick={activateChatMode}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <MessageCircle className="w-5 h-5" />
                  <Sparkles className="w-4 h-4" />
                  Chat with AI
                </motion.button>
              </div>
            )}

            {/* Footer */}
            <div className="p-2 border-t border-gray-200 dark:border-[#22272B] bg-gradient-to-t from-gray-50 dark:from-[#0F1112] to-transparent">
              <div className="flex items-center justify-center text-xs text-gray-500 dark:text-white/60">
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