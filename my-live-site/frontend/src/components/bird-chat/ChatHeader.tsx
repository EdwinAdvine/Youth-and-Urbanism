import React from 'react';
import { motion } from 'framer-motion';
import { Menu, Plus, Settings, ChevronDown, Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../../store';

interface ChatHeaderProps {
  onNewChat: () => void;
  onSidebarToggle: () => void;
  isSidebarOpen: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  onNewChat, 
  onSidebarToggle, 
  isSidebarOpen: _isSidebarOpen
}) => {
  const { isDarkMode, toggleTheme } = useThemeStore();

  return (
    <header className="bg-gradient-to-r from-gray-50 dark:from-[#0F1112] to-gray-100 dark:to-[#181C1F] border-b border-gray-200 dark:border-[#22272B] shadow-lg shadow-black/30 sticky top-0 z-50">
      <div className="flex items-center justify-between h-16 sm:h-20 px-4 sm:px-6 lg:px-8">
        {/* Left Section */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onSidebarToggle}
            className="lg:hidden p-2 rounded-lg text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[#FF0000] to-[#E40000] rounded-xl flex items-center justify-center text-gray-900 dark:text-white font-bold text-lg shadow-lg shadow-[#FF0000]/30">
              🐦
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white to-[#FF0000] bg-clip-text text-transparent">
                The Bird AI
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-white/60">Your AI Learning Companion</p>
            </div>
          </div>
        </div>

        {/* Center Section */}
        <div className="hidden md:flex items-center gap-2">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Chat Interface</h2>
            <p className="text-xs text-gray-700 dark:text-white/80">Powered by CBC Curriculum</p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* New Chat Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNewChat}
            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#FF0000] to-[#E40000] text-gray-900 dark:text-white rounded-lg font-medium transition-all duration-300 shadow-lg shadow-[#FF0000]/30 border border-[#FF0000]/50 hover:shadow-[#FF0000]/50"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Chat</span>
          </motion.button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            title={`Switch to ${isDarkMode ? 'Light' : 'Dark'} Mode`}
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
              <Moon className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {/* User Menu */}
          <div className="relative">
            <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
              <div className="w-8 h-8 bg-gradient-to-br from-[#FF0000] to-[#E40000] rounded-full flex items-center justify-center text-gray-900 dark:text-white font-semibold text-sm">
                S
              </div>
              <span className="hidden sm:inline text-sm text-gray-700 dark:text-white/80">Student</span>
              <ChevronDown className="w-4 h-4 text-gray-500 dark:text-white/60" />
            </button>
          </div>

          {/* Settings Button */}
          <button
            className="p-2 rounded-lg text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;