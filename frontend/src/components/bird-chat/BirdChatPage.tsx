import React, { useState, useEffect, useCallback } from 'react';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import aiTutorService from '../../services/aiTutorService';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import InputBar from './InputBar';

const POMODORO_MINUTES = 25;

const BirdChatPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBreakBanner, setShowBreakBanner] = useState(false);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  // Store state
  const { user } = useAuthStore();
  const messages = useChatStore((state) => state.messages);
  const addMessage = useChatStore((state) => state.addMessage);
  const updateCurrentInput = useChatStore((state) => state.updateCurrentInput);
  const clearChat = useChatStore((state) => state.clearChat);
  const loadChatHistory = useChatStore((state) => state.loadChatHistory);
  const sessionStartTime = useChatStore((state) => state.sessionStartTime);
  const isOnBreak = useChatStore((state) => state.isOnBreak);
  const dailyMinutesUsed = useChatStore((state) => state.dailyMinutesUsed);
  const dailyLimitMinutes = useChatStore((state) => state.dailyLimitMinutes);
  const startSession = useChatStore((state) => state.startSession);
  const pauseForBreak = useChatStore((state) => state.pauseForBreak);
  const resumeSession = useChatStore((state) => state.resumeSession);

  // Start session timer on mount
  useEffect(() => {
    if (!sessionStartTime) {
      startSession();
    }
  }, [sessionStartTime, startSession]);

  // Track elapsed minutes
  useEffect(() => {
    if (isOnBreak || !sessionStartTime) return;

    const interval = setInterval(() => {
      const mins = Math.floor((Date.now() - sessionStartTime) / 60000);
      setElapsedMinutes(mins);

      // Show break banner at Pomodoro intervals
      if (mins > 0 && mins % POMODORO_MINUTES === 0) {
        setShowBreakBanner(true);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [sessionStartTime, isOnBreak]);

  const handleDismissBreak = useCallback(() => {
    setShowBreakBanner(false);
  }, []);

  const handleTakeBreak = useCallback(() => {
    pauseForBreak();
    setShowBreakBanner(false);
  }, [pauseForBreak]);

  const handleResumeFromBreak = useCallback(() => {
    resumeSession();
  }, [resumeSession]);

  // Load conversation history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await aiTutorService.getHistory(50, 0);
        // Convert backend messages to chat messages
        const chatMessages = history.messages.map((msg, index) => ({
          id: `${Date.now()}-${index}`,
          type: msg.role === 'user' ? 'user' as const : 'ai' as const,
          content: msg.content,
          timestamp: new Date(msg.timestamp),
          audioUrl: msg.audio_url
        }));
        loadChatHistory(chatMessages);
      } catch (error) {
        console.error('Failed to load conversation history:', error);
      }
    };

    if (user && user.role === 'student') {
      loadHistory();
    }
  }, [user, loadChatHistory]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    // Add user message immediately
    addMessage({
      type: 'user',
      content: message
    });

    // Clear input
    updateCurrentInput('');
    setIsTyping(true);
    setError(null);

    const requestStartMs = Date.now();

    try {
      // Send message to backend AI tutor
      const response = await aiTutorService.sendMessage({
        message,
        include_context: true,
        context_messages: 10
      });

      // Add AI response with latency
      addMessage({
        type: 'ai',
        content: response.message,
        audioUrl: response.audio_url,
        response_time_ms: Date.now() - requestStartMs
      });

    } catch (error: any) {
      console.error('Failed to send message:', error);
      setError('Sorry, I had trouble understanding that. Please try again!');

      // Add error message to chat
      addMessage({
        type: 'ai',
        content: 'Oops! I had trouble with that. Can you try asking again?'
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = (action: string) => {
    const actionPrompts: Record<string, string> = {
      'story-time': "Tell me an exciting and educational story appropriate for my grade level. Make it fun and include a lesson I can learn from!",
      'fun-facts': "Share some amazing and educational fun facts that are appropriate for my grade level. Make them surprising and interesting!",
      'science-explorer': "Let's do a fun science exploration! Suggest an age-appropriate science activity or experiment I can try, and explain the science behind it.",
      'draw-something': "Suggest a creative drawing activity for me. Describe what I should draw step by step, and tell me something interesting about the subject!"
    };

    const prompt = actionPrompts[action] || `Help me with a fun ${action} activity!`;
    handleSendMessage(prompt);
  };

  const handleNewChat = async () => {
    try {
      await aiTutorService.resetConversation();
      clearChat();
    } catch (error) {
      console.error('Failed to reset conversation:', error);
      // Still clear local chat even if backend reset fails
      clearChat();
    }
  };

  const progressPercent = dailyLimitMinutes > 0
    ? Math.min(100, (dailyMinutesUsed / dailyLimitMinutes) * 100)
    : 0;

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-50 dark:from-[#0F1112] to-gray-100 dark:to-[#181C1F]">
      {/* Header */}
      <ChatHeader
        onNewChat={handleNewChat}
        onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />

      {/* Session Timer Bar */}
      <div className="px-4 py-1.5 flex items-center gap-3 border-b border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5">
        <div className="flex-1 h-1.5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              progressPercent >= 90 ? 'bg-red-500' :
              progressPercent >= 70 ? 'bg-yellow-500' :
              'bg-gradient-to-r from-cyan-400 to-blue-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
          {elapsedMinutes}m this session
        </span>
      </div>

      {/* Break Banner */}
      {showBreakBanner && !isOnBreak && (
        <div className="mx-4 mt-2 p-3 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 flex items-center gap-3">
          <span className="text-lg">🧘</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800 dark:text-white">
              Time for a break!
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              You have been focused for {POMODORO_MINUTES} minutes. Stretch, drink water, look outside!
            </p>
          </div>
          <button
            onClick={handleTakeBreak}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-cyan-500 text-white hover:bg-cyan-600 transition-colors"
          >
            Take Break
          </button>
          <button
            onClick={handleDismissBreak}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 dark:border-white/20 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            Later
          </button>
        </div>
      )}

      {/* Break Overlay */}
      {isOnBreak && (
        <div className="mx-4 mt-2 p-6 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 text-center">
          <span className="text-3xl mb-2 block">🌿</span>
          <p className="text-lg font-medium text-gray-800 dark:text-white mb-1">
            Break Time!
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Stretch, drink water, or look outside. Your brain is storing what you learned!
          </p>
          <button
            onClick={handleResumeFromBreak}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
          >
            Ready to Continue
          </button>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 overflow-hidden">
        <ChatMessages
          messages={messages}
          isTyping={isTyping}
          onResendMessage={handleSendMessage}
        />
      </div>

      {/* Error display */}
      {error && (
        <div className="px-4 py-2 text-red-400 text-xs border-t border-gray-200 dark:border-white/10">
          {error}
        </div>
      )}

      {/* Input Bar */}
      {!isOnBreak && (
        <InputBar
          onSendMessage={handleSendMessage}
          onQuickAction={handleQuickAction}
          isTyping={isTyping}
        />
      )}
    </div>
  );
};

export default BirdChatPage;