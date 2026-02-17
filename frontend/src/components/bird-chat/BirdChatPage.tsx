import React, { useState, useEffect } from 'react';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import aiTutorService from '../../services/aiTutorService';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import InputBar from './InputBar';

const BirdChatPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [responseMode, setResponseMode] = useState<'text' | 'voice' | 'video'>('text');
  const [error, setError] = useState<string | null>(null);

  // Store state
  const { user } = useAuthStore();
  const messages = useChatStore((state) => state.messages);
  const addMessage = useChatStore((state) => state.addMessage);
  const updateCurrentInput = useChatStore((state) => state.updateCurrentInput);
  const clearChat = useChatStore((state) => state.clearChat);
  const loadChatHistory = useChatStore((state) => state.loadChatHistory);


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
          audioUrl: msg.audio_url,
          videoUrl: msg.video_url
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

    try {
      // Send message to backend AI tutor
      const response = await aiTutorService.sendMessage({
        message,
        include_context: true,
        context_messages: 10
      });

      // Add AI response
      addMessage({
        type: 'ai',
        content: response.message,
        audioUrl: response.audio_url,
        videoUrl: response.video_url
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

  const handleResponseModeChange = async (mode: 'text' | 'voice' | 'video') => {
    try {
      await aiTutorService.updateResponseMode(mode);
      setResponseMode(mode);
    } catch (error) {
      console.error('Failed to update response mode:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-50 dark:from-[#0F1112] to-gray-100 dark:to-[#181C1F]">
      {/* Header */}
      <ChatHeader 
        onNewChat={handleNewChat}
        onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />

      {/* Main Chat Area */}
      <div className="flex-1 overflow-hidden">
        <ChatMessages
          messages={messages}
          isTyping={isTyping}
        />
      </div>

      {/* Response Mode Selector */}
      <div className="px-4 py-2 border-t border-gray-200 dark:border-white/10">
        <div className="flex gap-2 items-center">
          <span className="text-gray-500 dark:text-white/60 text-sm">Response:</span>
          <button
            onClick={() => handleResponseModeChange('text')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              responseMode === 'text'
                ? 'bg-blue-600 text-gray-900 dark:text-white'
                : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white/60 hover:bg-gray-200 dark:hover:bg-white/20'
            }`}
          >
            Text
          </button>
          <button
            onClick={() => handleResponseModeChange('voice')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              responseMode === 'voice'
                ? 'bg-blue-600 text-gray-900 dark:text-white'
                : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white/60 hover:bg-gray-200 dark:hover:bg-white/20'
            }`}
          >
            Voice
          </button>
          <button
            onClick={() => handleResponseModeChange('video')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              responseMode === 'video'
                ? 'bg-blue-600 text-gray-900 dark:text-white'
                : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white/60 hover:bg-gray-200 dark:hover:bg-white/20'
            }`}
          >
            Video
          </button>
        </div>
        {error && (
          <div className="mt-2 text-red-400 text-xs">
            {error}
          </div>
        )}
      </div>

      {/* Input Bar */}
      <InputBar
        onSendMessage={handleSendMessage}
        onQuickAction={handleQuickAction}
        isTyping={isTyping}
      />
    </div>
  );
};

export default BirdChatPage;