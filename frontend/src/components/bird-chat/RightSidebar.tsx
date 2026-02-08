import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Settings, 
  HelpCircle, 
  FileText, 
  Download, 
  Volume2, 
  Globe, 
  Moon, 
  Sun, 
  Eye, 
  Shield, 
  LogOut 
} from 'lucide-react';
import { useChatStore } from '../../store/chatStore';

interface RightSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  width?: number; // Optional width prop for dynamic sizing
  compactWidth?: number; // Optional compact width for icon-only mode
}

const RightSidebar: React.FC<RightSidebarProps> = ({ isOpen, onClose, width = 320 }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'tools' | 'settings' | 'help'>('profile');
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [language, setLanguage] = useState('English');
  const [theme, setTheme] = useState('Dark');
  const clearChat = useChatStore((state) => state.clearChat);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'tools', label: 'Tools', icon: Settings },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help', icon: HelpCircle }
  ];

  const handleClearChat = () => {
    clearChat();
    onClose();
  };

  const exportChat = () => {
    const messages = useChatStore.getState().messages;
    const chatData = messages.map(msg => ({
      type: msg.type,
      content: msg.content,
      timestamp: msg.timestamp.toLocaleString()
    }));
    
    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bird-ai-chat-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={onClose}
        />
      )}

      {/* Right Sidebar */}
      <motion.aside
        className="bg-gradient-to-b from-[#0A0A0A] to-[#121212] border-l border-[#2A2A2A] shadow-lg shadow-black/50 fixed md:static right-0 top-0 h-full z-40 backdrop-blur-sm"
        initial={{ x: width }}
        animate={{ 
          x: isOpen ? 0 : width,
          width: isOpen ? width : 0
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{ 
          transform: isOpen ? 'translateX(0)' : `translateX(${width}px)`,
          minWidth: isOpen ? width : 0,
          maxWidth: isOpen ? width : 0
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-[#2A2A2A]">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Chat Tools</h2>
              <button
                onClick={onClose}
                className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors border border-white/10"
              >
                <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Tab Navigation */}
            <div className="flex gap-2 mt-3">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 border ${
                    activeTab === tab.id 
                      ? 'bg-gradient-to-r from-[#00F5FF] to-[#7B68EE] text-black border-[#00F5FF]/50 shadow-lg shadow-[#00F5FF]/30' 
                      : 'text-white/80 hover:bg-white/10 border-white/20'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4">
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="bg-gradient-to-r from-[#FF0000] to-[#E40000] rounded-2xl p-4 shadow-lg shadow-[#FF0000]/20 border border-[#FF0000]/30">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black font-bold text-lg shadow-lg">
                        👨‍💻
                      </div>
                      <div>
                        <h3 className="font-bold text-black">Student User</h3>
                        <p className="text-black/80 text-sm">Active Session</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-white/80">Session Info</h4>
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <div className="text-xs text-white/60">Messages</div>
                      <div className="text-lg font-semibold text-white">{useChatStore.getState().messages.length}</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <div className="text-xs text-white/60">Session Time</div>
                      <div className="text-lg font-semibold text-white">Active</div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'tools' && (
                <motion.div
                  key="tools"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-white/80">AI Tools</h4>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={exportChat}
                      className="w-full flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-[#FF0000] to-[#E40000] text-white font-medium shadow-lg shadow-[#FF0000]/20 border border-[#FF0000]/30 transition-all duration-300"
                    >
                      <Download className="w-5 h-5" />
                      Export Chat
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleClearChat}
                      className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20 border border-white/20 transition-all duration-300"
                    >
                      <FileText className="w-5 h-5" />
                      Clear Chat
                    </motion.button>

                    <div className="grid grid-cols-2 gap-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 p-2 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20 border border-white/20 transition-all duration-300 text-xs"
                      >
                        <Eye className="w-4 h-4" />
                        Summarize
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 p-2 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20 border border-white/20 transition-all duration-300 text-xs"
                      >
                        <Shield className="w-4 h-4" />
                        Privacy
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-white/80">Voice Settings</h4>
                    
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                      <div>
                        <div className="font-medium text-white">Voice Assistant</div>
                        <div className="text-xs text-white/60">Enable AI voice responses</div>
                      </div>
                      <button
                        onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                        className={`w-12 h-6 rounded-full transition-colors duration-300 ${
                          isVoiceEnabled 
                            ? 'bg-gradient-to-r from-[#00F5FF] to-[#7B68EE] shadow-lg shadow-[#00F5FF]/30' 
                            : 'bg-white/20'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${isVoiceEnabled ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                      </button>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">Language</label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full p-2 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:border-[#00F5FF] transition-colors"
                      >
                        <option value="English">English</option>
                        <option value="Kiswahili">Kiswahili</option>
                        <option value="French">French</option>
                        <option value="Spanish">Spanish</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">Theme</label>
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setTheme('Dark')}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all duration-300 ${
                            theme === 'Dark' 
                              ? 'bg-gradient-to-r from-[#FF0000] to-[#E40000] text-white border-[#FF0000]/50 shadow-lg shadow-[#FF0000]/30' 
                              : 'text-white/80 hover:bg-white/10 border-white/20'
                          }`}
                        >
                          <Moon className="w-4 h-4" />
                          Dark
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setTheme('Light')}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all duration-300 ${
                            theme === 'Light' 
                              ? 'bg-gradient-to-r from-[#FF0000] to-[#E40000] text-white border-[#FF0000]/50 shadow-lg shadow-[#FF0000]/30' 
                              : 'text-white/80 hover:bg-white/10 border-white/20'
                          }`}
                        >
                          <Sun className="w-4 h-4" />
                          Light
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'help' && (
                <motion.div
                  key="help"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-white/80">Help & Support</h4>
                    
                    <div className="space-y-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20 border border-white/20 transition-all duration-300"
                      >
                        <HelpCircle className="w-5 h-5" />
                        <div className="text-left">
                          <div className="font-medium">Getting Started</div>
                          <div className="text-xs text-white/60">Learn how to use The Bird AI</div>
                        </div>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20 border border-white/20 transition-all duration-300"
                      >
                        <Volume2 className="w-5 h-5" />
                        <div className="text-left">
                          <div className="font-medium">Voice Features</div>
                          <div className="text-xs text-white/60">How to use voice commands</div>
                        </div>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20 border border-white/20 transition-all duration-300"
                      >
                        <Globe className="w-5 h-5" />
                        <div className="text-left">
                          <div className="font-medium">CBC Curriculum</div>
                          <div className="text-xs text-white/60">Learn about our curriculum</div>
                        </div>
                      </motion.button>
                    </div>

                    <div className="p-3 bg-gradient-to-r from-[#FF0000] to-[#E40000] rounded-lg shadow-lg shadow-[#FF0000]/20 border border-[#FF0000]/30">
                      <div className="text-white font-semibold">Need Help?</div>
                      <div className="text-white/80 text-sm mt-1">Contact support@thebirdai.com</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[#2A2A2A]">
            <div className="text-xs text-white/60 text-center">
              🐦 The Bird AI • Safe for Kids • CBC Aligned
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default RightSidebar;