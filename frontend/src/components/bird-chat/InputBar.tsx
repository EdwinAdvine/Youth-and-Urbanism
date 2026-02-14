import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff, Sparkles, Brain, BookOpen, Play, Paperclip, Image, FileText, Code, Lightbulb, Star } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';

interface InputBarProps {
  onSendMessage: (message: string) => void;
  onQuickAction: (action: string) => void;
  isTyping: boolean;
}

const InputBar: React.FC<InputBarProps> = ({ onSendMessage, onQuickAction, isTyping }) => {
  const [inputValue, setInputValue] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  
  const currentInput = useChatStore((state) => state.currentInput);
  const updateCurrentInput = useChatStore((state) => state.updateCurrentInput);
  const setIsRecording = useChatStore((state) => state.setIsRecording);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [inputValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputValue(value);
    updateCurrentInput(value);
  };

  const handleSend = () => {
    const message = inputValue.trim();
    if (message) {
      onSendMessage(message);
      setInputValue('');
      updateCurrentInput('');
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };


  const handleQuickAction = (action: string) => {
    onQuickAction(action);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    updateCurrentInput(suggestion);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="bg-gradient-to-t from-gray-50 dark:from-[#0F1112] to-transparent border-t border-gray-200 dark:border-[#22272B] p-4 shadow-2xl shadow-black/50 backdrop-blur-sm">
      {/* Quick Actions Row */}
      <AnimatePresence>
        {(!inputValue.trim() && !isTyping) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-wrap justify-center gap-2 mb-3"
          >
            {[
              { icon: Sparkles, label: 'Story Time', action: 'story-time', color: 'from-[#FF0000] to-[#E40000]' },
              { icon: Brain, label: 'Fun Facts', action: 'fun-facts', color: 'from-[#00F5FF] to-[#7B68EE]' },
              { icon: BookOpen, label: 'Science Explorer', action: 'science-explorer', color: 'from-[#FF0000] to-[#E40000]' },
              { icon: Play, label: 'Draw Something', action: 'draw-something', color: 'from-[#00F5FF] to-[#7B68EE]' },
            ].map((action, index) => (
              <motion.button
                key={action.action}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, boxShadow: "0 0 15px #FF0000" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleQuickAction(action.action)}
                className={`flex items-center gap-2 bg-gradient-to-r ${action.color} text-gray-900 dark:text-white px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 shadow-lg shadow-[#FF0000]/20 border border-[#FF0000]/30`}
              >
                <action.icon className="w-4 h-4" />
                <span>{action.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="relative">
        <div className="bg-gradient-to-r from-gray-50 dark:from-[#0F1112] to-gray-100 dark:to-[#181C1F] rounded-3xl border-2 border-gray-200 dark:border-[#22272B] focus-within:border-[#00F5FF] shadow-xl shadow-black/50 overflow-hidden backdrop-blur-sm transition-all duration-300">
          {/* Input Container */}
          <div className="flex items-end gap-3 p-3">

            {/* Text Input */}
            <div className="flex-1 min-w-0">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Ask The Bird anything..."
                className="w-full text-lg bg-transparent outline-none placeholder-gray-400 resize-none max-h-32 min-h-12"
                disabled={isTyping}
                rows={1}
              />
            </div>

            {/* Send Button */}
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 15px #FF0000" }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className={`p-3 rounded-xl transition-all duration-300 ${
                inputValue.trim()
                  ? 'bg-gradient-to-r from-[#FF0000] to-[#E40000] text-gray-900 dark:text-white shadow-lg shadow-[#FF0000]/30 border border-[#FF0000]/50'
                  : 'bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-white/40 cursor-not-allowed border border-gray-300 dark:border-white/20'
              }`}
              aria-label="Send message"
            >
              <Send className="w-6 h-6" />
            </motion.button>
          </div>

          {/* Expanded Features */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-gray-200 dark:border-[#22272B] p-3 bg-gray-50 dark:bg-[#0F1112]/50"
              >
                <div className="flex flex-wrap gap-2">
                  {[
                    { icon: Paperclip, label: 'Attach File', action: 'attach' },
                    { icon: Image, label: 'Upload Image', action: 'image' },
                    { icon: FileText, label: 'Document', action: 'document' },
                    { icon: Code, label: 'Code', action: 'code' },
                  ].map((feature, index) => (
                    <motion.button
                      key={feature.action}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white rounded-full text-sm font-medium hover:bg-gray-200 dark:hover:bg-white/20 transition-all duration-300 border border-gray-300 dark:border-white/20"
                    >
                      <feature.icon className="w-4 h-4" />
                      <span>{feature.label}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Expand/Collapse Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute -top-8 right-0 flex items-center gap-2 text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white transition-all duration-300 text-sm"
        >
          <span>{isExpanded ? 'Less' : 'More'}</span>
          <div className={`w-4 h-4 border-2 border-white/60 rounded-sm transition-all duration-300 ${isExpanded ? 'bg-white/60' : ''}`}>
            <svg className="w-2 h-2 mx-auto mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </motion.button>
      </div>


      {/* Typing Indicator */}
      <AnimatePresence>
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-center gap-2 mt-2 text-gray-500 dark:text-white/60"
          >
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-sm">The Bird is thinking...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InputBar;