import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '../../store/chatStore';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';
import ChatHeader from './ChatHeader';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';
import ChatMessages from './ChatMessages';
import InputBar from './InputBar';
import { ChatMessage, QuickAction } from '../../types/chat';

const BirdChatPage: React.FC = () => {
  const [isLeftSidebarVisible, setIsLeftSidebarVisible] = useState(true);
  const [isRightSidebarVisible, setIsRightSidebarVisible] = useState(false);
  
  // Chat state from store
  const messages = useChatStore((state) => state.messages);
  const isRecording = useChatStore((state) => state.isRecording);
  const currentInput = useChatStore((state) => state.currentInput);
  const birdExpression = useChatStore((state) => state.birdExpression);
  const addMessage = useChatStore((state) => state.addMessage);
  const updateCurrentInput = useChatStore((state) => state.updateCurrentInput);
  const setIsRecording = useChatStore((state) => state.setIsRecording);
  const setIsTyping = useChatStore((state) => state.setIsTyping);
  const setBirdExpression = useChatStore((state) => state.setBirdExpression);
  const clearChat = useChatStore((state) => state.clearChat);

  const { speak } = useSpeechSynthesis();

  // AI responses for demo
  const aiResponses = [
    "That's a great question! Let me think about that for you...",
    "I love learning about that topic! Here's what I know...",
    "Wow, that's so interesting! Let me tell you more about it...",
    "You're so smart to ask about that! Here's the answer...",
    "Let's explore this together! What do you think about...?",
    "I'm so excited to learn with you! Let me share what I know..."
  ];

  const handleSendMessage = (message: string) => {
    if (!message.trim()) return;

    // Add user message
    addMessage({
      type: 'user',
      content: message,
      avatarExpression: 'happy'
    });

    // Clear input
    updateCurrentInput('');
    setIsRecording(false);

    // Simulate AI thinking and response
    setIsTyping(true);
    setBirdExpression('thinking');

    setTimeout(() => {
      setIsTyping(false);
      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      
      addMessage({
        type: 'ai',
        content: randomResponse,
        avatarExpression: 'happy'
      });

      // Speak the response
      speak(randomResponse);
    }, 1500);
  };

  const handleQuickAction = (action: string) => {
    const actionMessages: Record<string, string> = {
      'story-time': "Once upon a time, in a beautiful forest...",
      'fun-facts': "Did you know that birds can fly really high? Let me tell you more amazing facts!",
      'science-explorer': "Let's explore the wonderful world of science together!",
      'draw-something': "I'd love to draw with you! What would you like to create?"
    };

    const message = actionMessages[action] || "That sounds like a fun activity!";
    handleSendMessage(message);
  };

  const handleNewChat = () => {
    clearChat();
    setIsLeftSidebarVisible(false);
  };

  const handleMenuToggle = () => {
    setIsLeftSidebarVisible(!isLeftSidebarVisible);
  };

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (isLeftSidebarVisible && !target.closest('aside') && !target.closest('button')) {
        setIsLeftSidebarVisible(false);
      }
    };

    if (isLeftSidebarVisible) {
      document.addEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isLeftSidebarVisible]);

  return (
    <div className="flex h-screen bg-gradient-to-b from-[#0A0A0A] to-[#121212]">
      {/* Left Sidebar */}
      <Sidebar 
        isOpen={isLeftSidebarVisible}
        onNewChat={handleNewChat}
        onQuickAction={(action) => handleQuickAction(action.id)}
        width={280} // Left sidebar width
        compactWidth={60} // Compact width for icon-only mode
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <ChatHeader 
          onMenuToggle={handleMenuToggle}
          isSidebarOpen={isLeftSidebarVisible}
          onRightMenuToggle={() => setIsRightSidebarVisible(!isRightSidebarVisible)}
          isRightSidebarOpen={isRightSidebarVisible}
        />

        {/* Chat Messages */}
        <ChatMessages 
          messages={messages}
          isTyping={useChatStore((state) => state.isTyping)}
        />

        {/* Input Bar */}
        <InputBar 
          onSendMessage={handleSendMessage}
          onQuickAction={handleQuickAction}
        />
      </div>

      {/* Right Sidebar */}
      <RightSidebar 
        isOpen={isRightSidebarVisible}
        onClose={() => setIsRightSidebarVisible(false)}
        width={320} // Right sidebar width
      />
    </div>
  );
};

export default BirdChatPage;