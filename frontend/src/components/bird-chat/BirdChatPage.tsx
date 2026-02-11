import React, { useState } from 'react';
import { useChatStore } from '../../store/chatStore';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import InputBar from './InputBar';

const BirdChatPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  // Chat state from store
  const messages = useChatStore((state) => state.messages);
  const currentInput = useChatStore((state) => state.currentInput);
  const addMessage = useChatStore((state) => state.addMessage);
  const updateCurrentInput = useChatStore((state) => state.updateCurrentInput);
  const clearChat = useChatStore((state) => state.clearChat);


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
      content: message
    });

    // Clear input
    updateCurrentInput('');
    setIsTyping(true);

    // Simulate AI thinking and response
    setTimeout(() => {
      setIsTyping(false);
      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      
      addMessage({
        type: 'ai',
        content: randomResponse
      });

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
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-[#0F1112] to-[#181C1F]">
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