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
      <InputBar
        onSendMessage={handleSendMessage}
        onQuickAction={handleQuickAction}
        isTyping={isTyping}
      />
    </div>
  );
};

export default BirdChatPage;