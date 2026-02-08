import React from 'react';
import { motion } from 'framer-motion';
import { Menu, User, Settings } from 'lucide-react';
import BirdAvatar from './BirdAvatar';

interface ChatHeaderProps {
  onMenuToggle: () => void;
  isSidebarOpen: boolean;
  onRightMenuToggle: () => void;
  isRightSidebarOpen: boolean; // Add this prop to show/hide right toggle button
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ onMenuToggle, isSidebarOpen, onRightMenuToggle, isRightSidebarOpen }) => {
  return (
    <header className="bg-gradient-to-b from-[#0A0A0A] to-[#121212] border-b border-[#2A2A2A] shadow-lg shadow-black/50 sticky top-0 z-40 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 sm:h-20">
        {/* Left: Logo and Title */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-lg hover:bg-white/10 transition-all duration-300 md:hidden border border-white/10"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-6 h-6 text-white/80" />
          </button>
          
          <div className="flex items-center gap-3">
            <BirdAvatar expression="happy" size={40} />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white to-[#FF0000] bg-clip-text text-transparent">The Bird AI</h1>
              <p className="text-xs sm:text-sm text-white/80">Your AI Learning Friend</p>
            </div>
          </div>
        </div>

        {/* Center: Chat Title (editable) */}
        <div className="hidden md:flex flex-1 justify-center">
          <div className="text-center">
            <h2 className="text-lg sm:text-xl font-semibold text-white">
              Why do birds sing?
            </h2>
            <p className="text-xs text-white/80 mt-1">Ask me anything about learning!</p>
          </div>
        </div>

        {/* Right: User Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button className="p-2 rounded-lg hover:bg-white/10 transition-all duration-300 border border-white/10">
            <User className="w-5 h-5 text-white/80" />
          </button>
          <button className="p-2 rounded-lg hover:bg-white/10 transition-all duration-300 border border-white/10">
            <Settings className="w-5 h-5 text-white/80" />
          </button>
          
          {/* Right Sidebar Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRightMenuToggle}
            className="p-2 rounded-lg hover:bg-white/10 transition-all duration-300 border border-white/10"
            aria-label="Toggle chat tools"
          >
            <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </motion.button>
          
          {/* Parent Mode Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-[#FF0000] to-[#E40000] text-white px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 shadow-lg shadow-[#FF0000]/20 border border-[#FF0000]/50"
          >
            Parent Mode
          </motion.button>
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;