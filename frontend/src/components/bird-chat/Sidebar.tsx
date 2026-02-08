import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, MessageCircle } from 'lucide-react';
import { QuickAction } from '../../types/chat';

interface SidebarProps {
  isOpen: boolean;
  onNewChat: () => void;
  onQuickAction: (action: QuickAction) => void;
  width?: number; // Optional width prop for dynamic sizing
  compactWidth?: number; // Optional compact width for icon-only mode
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onNewChat, onQuickAction, width = 320, compactWidth = 60 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const quickActions: QuickAction[] = [
    {
      id: 'story-time',
      title: 'Story Time',
      emoji: '📖',
      description: 'Listen to fun stories'
    },
    {
      id: 'fun-facts',
      title: 'Fun Facts',
      emoji: '🐦',
      description: 'Learn amazing facts'
    },
    {
      id: 'science-explorer',
      title: 'Science Explorer',
      emoji: '🧪',
      description: 'Explore science topics'
    },
    {
      id: 'draw-something',
      title: 'Draw Something',
      emoji: '🎨',
      description: 'Get creative together'
    }
  ];

  const chatHistory = [
    { id: '1', title: 'Butterfly Adventure', emoji: '🦋', lastMessage: new Date('2024-01-15') },
    { id: '2', title: 'Math Magic', emoji: '🔢', lastMessage: new Date('2024-01-14') },
    { id: '3', title: 'Space Journey', emoji: '🚀', lastMessage: new Date('2024-01-13') },
  ];

  // Determine current width based on expansion state and open state
  const currentWidth = isOpen ? (isExpanded ? width : compactWidth) : 0;

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => {}} // Prevent closing on overlay click for now
        />
      )}

      {/* Sidebar */}
      <motion.aside
        className="bg-gradient-to-b from-[#0A0A0A] to-[#121212] border-r border-[#2A2A2A] shadow-lg shadow-black/50 fixed md:static top-0 left-0 h-full z-40 backdrop-blur-sm"
        initial={{ x: -width }}
        animate={{ 
          x: isOpen ? 0 : -width,
          width: currentWidth
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{ 
          transform: isOpen ? 'translateX(0)' : `translateX(-${width}px)`,
          minWidth: currentWidth,
          maxWidth: currentWidth
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-3 border-b border-[#2A2A2A]">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                {isExpanded ? 'The Bird AI' : ''}
              </h2>
              <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleToggleExpand}
                    className="w-10 h-10 bg-gradient-to-r from-[#FF0000] to-[#E40000] text-white rounded-xl font-semibold text-base flex items-center justify-center transition-all duration-300 shadow-lg shadow-[#FF0000]/30 border border-[#FF0000]/50"
                  >
                  {isExpanded ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </motion.button>
              </div>
            </div>
            
            {/* Quick Actions - Compact Mode */}
            {!isExpanded && (
              <div className="space-y-2 mt-3">
                {quickActions.map((action, index) => (
                  <motion.button
                    key={action.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, boxShadow: "0 0 15px #FF0000" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onQuickAction(action)}
                    className="w-full text-left p-2 rounded-xl hover:bg-white/10 transition-all duration-300 border border-[#2A2A2A] hover:border-[#FF0000]/30"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{action.emoji}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* Expanded Content Area */}
          {isExpanded && (
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {/* Quick Actions - Expanded Mode */}
                <div>
                  <h3 className="text-sm font-medium text-white/80 mb-3">Quick Actions</h3>
                  <div className="space-y-2">
                    {quickActions.map((action, index) => (
                      <motion.button
                        key={action.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02, boxShadow: "0 0 15px #FF0000" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onQuickAction(action)}
                        className="w-full text-left p-3 rounded-xl hover:bg-white/10 transition-all duration-300 border border-[#2A2A2A] hover:border-[#FF0000]/30"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{action.emoji}</span>
                          <div>
                            <div className="font-medium text-white">{action.title}</div>
                            <div className="text-sm text-white/80">{action.description}</div>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Chat History - Expanded Mode */}
                <div>
                  <h3 className="text-sm font-medium text-white/80 mb-3">Recent Chats</h3>
                  <div className="space-y-2">
                    {chatHistory.map((chat) => (
                      <motion.button
                        key={chat.id}
                        whileHover={{ scale: 1.02, boxShadow: "0 0 15px #FF0000" }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full text-left p-3 rounded-xl hover:bg-white/10 transition-all duration-300 border border-[#2A2A2A] hover:border-[#FF0000]/30"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{chat.emoji}</span>
                          <div className="flex-1">
                            <div className="font-medium text-white text-sm">{chat.title}</div>
                            <div className="text-xs text-white/80">
                              {chat.lastMessage.toLocaleDateString()}
                            </div>
                          </div>
                          <MessageCircle className="w-4 h-4 text-white/60" />
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="p-4 border-t border-[#2A2A2A]">
            <div className="text-xs text-white/60 text-center">
              🐦 The Bird AI • Safe for Kids • Offline Mode Available
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;