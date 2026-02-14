import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCoPilotStore, useThemeStore } from '../../store';
import { 
  Bot, 
  X, 
  Plus, 
  BookOpen, 
  Star, 
  MessageCircle, 
  Brain, 
  Sparkles, 
  Wifi, 
  WifiOff,
  Sun,
  Moon
} from 'lucide-react';

interface CoPilotMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CoPilotMobileDrawer: React.FC<CoPilotMobileDrawerProps> = ({ isOpen, onClose }) => {
  const { isDarkMode } = useThemeStore();
  const { activeRole, isOnline } = useCoPilotStore();

  const roleConfig = {
    student: { color: 'from-blue-500 to-cyan-500', icon: <BookOpen className="w-6 h-6" /> },
    parent: { color: 'from-green-500 to-emerald-500', icon: <Bot className="w-6 h-6" /> },
    teacher: { color: 'from-purple-500 to-pink-500', icon: <Bot className="w-6 h-6" /> },
    admin: { color: 'from-orange-500 to-red-500', icon: <Bot className="w-6 h-6" /> },
    partner: { color: 'from-teal-500 to-blue-500', icon: <Bot className="w-6 h-6" /> },
    staff: { color: 'from-blue-500 to-indigo-500', icon: <Bot className="w-6 h-6" /> },
  };

  const currentConfig = roleConfig[activeRole];

  const handleQuickAction = (action: string) => {
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Mobile Drawer */}
          <motion.div
            className={`
              fixed bottom-0 left-0 right-0 z-50 
              bg-gradient-to-t from-gray-50 dark:from-[#0F1112] to-gray-100 dark:to-[#181C1F]
              border-t border-gray-200 dark:border-[#22272B] shadow-2xl
              lg:hidden
            `}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Handle */}
            <div className="flex justify-center py-2">
              <div className="w-12 h-1 bg-white/30 rounded-full" />
            </div>

            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-[#22272B]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`
                    p-2 rounded-lg bg-gradient-to-br ${currentConfig.color} text-gray-900 dark:text-white
                    shadow-lg shadow-blue-500/20
                  `}>
                    {currentConfig.icon}
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900 dark:text-white text-lg">AI Co-Pilot</h2>
                    <p className="text-gray-600 dark:text-white/70 text-sm">Tap to expand full view</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Online Status */}
                  <div className={`flex items-center gap-2 text-xs ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`} />
                    {isOnline ? 'Online' : 'Offline'}
                  </div>
                  
                  {/* Close Button */}
                  <motion.button
                    className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                    onClick={onClose}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Close Co-Pilot"
                  >
                    <X className="w-5 h-5 text-gray-900 dark:text-white" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-white/80 mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  className="p-4 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl border border-gray-300 dark:border-white/20 text-left transition-all"
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleQuickAction('progress')}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <BookOpen className="w-5 h-5 text-blue-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Progress</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-white/60">View assignments & progress</p>
                </motion.button>

                <motion.button
                  className="p-4 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl border border-gray-300 dark:border-white/20 text-left transition-all"
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleQuickAction('achievements')}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-yellow-500/20 rounded-lg">
                      <Star className="w-5 h-5 text-yellow-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Achievements</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-white/60">View certificates & badges</p>
                </motion.button>

                <motion.button
                  className="p-4 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl border border-gray-300 dark:border-white/20 text-left transition-all"
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleQuickAction('community')}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <MessageCircle className="w-5 h-5 text-green-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Community</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-white/60">Forum posts & replies</p>
                </motion.button>

                <motion.button
                  className="p-4 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl border border-gray-300 dark:border-white/20 text-left transition-all"
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleQuickAction('finance')}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Brain className="w-5 h-5 text-purple-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Finance</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-white/60">Transactions & balance</p>
                </motion.button>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-gray-200 dark:border-[#22272B]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-white/60">
                  <span>{isDarkMode ? 'Dark' : 'Light'} Mode</span>
                  <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-gray-400' : 'bg-yellow-400'}`}></div>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-gray-900 dark:text-white rounded-lg font-medium shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      onClose();
                      // Navigate to full co-pilot page
                      window.location.href = '/dashboard/student/co-pilot';
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Full View
                    </span>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CoPilotMobileDrawer;