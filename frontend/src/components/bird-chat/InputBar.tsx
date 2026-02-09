import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff, Image, Gamepad2, Sparkles } from 'lucide-react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';
import { useChatStore } from '../../store/chatStore';

interface InputBarProps {
  onSendMessage: (message: string) => void;
  onQuickAction: (action: string) => void;
}

const InputBar: React.FC<InputBarProps> = ({ onSendMessage, onQuickAction }) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { isRecording, transcript, startRecording, stopRecording, clearTranscript } = useSpeechRecognition();
  const { speak } = useSpeechSynthesis();
  
  const currentInput = useChatStore((state) => state.currentInput);
  const updateCurrentInput = useChatStore((state) => state.updateCurrentInput);
  const setIsRecording = useChatStore((state) => state.setIsRecording);
  const setIsTyping = useChatStore((state) => state.setIsTyping);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    updateCurrentInput(value);
  };

  const handleSend = () => {
    const message = inputValue.trim() || transcript.trim();
    if (message) {
      onSendMessage(message);
      setInputValue('');
      clearTranscript();
      updateCurrentInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
      setIsRecording(false);
    } else {
      startRecording();
      setIsRecording(true);
    }
  };

  const handleQuickAction = (action: string) => {
    onQuickAction(action);
  };

  return (
    <div className="bg-[#181C1F] border-t border-[#22272B] p-4 shadow-lg">
      {/* Quick Actions Row */}
      <div className="flex justify-center gap-2 mb-3">
        {[
          { icon: Sparkles, label: 'Story Time', action: 'story-time' },
          { icon: Image, label: 'Fun Facts', action: 'fun-facts' },
          { icon: Gamepad2, label: 'Science Explorer', action: 'science-explorer' },
        ].map((action, index) => (
          <motion.button
            key={action.action}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05, boxShadow: "0 0 15px #FF0000" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleQuickAction(action.action)}
            className="flex items-center gap-2 bg-gradient-to-r from-[#FF0000] to-[#E40000] text-white px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 shadow-lg shadow-[#FF0000]/20 border border-[#FF0000]/30"
          >
            <action.icon className="w-4 h-4 text-black/80" />
            <span className="text-black/90 font-medium">{action.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Input Area */}
      <div className="flex items-end gap-3 bg-gradient-to-r from-[#0A0A0A] to-[#121212] rounded-3xl border-2 border-[#2A2A2A] focus-within:border-[#00F5FF] shadow-lg shadow-black/50 overflow-hidden backdrop-blur-sm">
        {/* Microphone Button */}
        <motion.button
          whileHover={{ scale: 1.1, boxShadow: "0 0 15px #FF0000" }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleRecording}
          className={`p-3 transition-all duration-300 ${
            isRecording 
              ? 'bg-gradient-to-r from-[#FF0000] to-[#E40000] text-white border-r border-[#FF0000]/50 shadow-lg shadow-[#FF0000]/30' 
              : 'hover:bg-white/10 text-white/80 border-r border-white/20'
          }`}
          aria-label={isRecording ? "Stop recording" : "Start recording"}
          aria-pressed={isRecording}
        >
          {isRecording ? (
            <MicOff className="w-6 h-6 animate-pulse text-black" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
        </motion.button>

        {/* Input Field */}
        <div className="flex-1 min-w-0">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={isRecording ? "Listening..." : "Ask Bird anything..."}
            className="w-full text-2xl px-4 py-4 outline-none placeholder-gray-400"
            disabled={isRecording}
          />
          
          {/* Voice Transcript Preview */}
          <AnimatePresence>
            {transcript && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-4 pb-2 text-sm text-gray-600 border-t border-gray-100"
              >
                <span className="text-gray-400">You said:</span> {transcript}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Send Button */}
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: "0 0 15px #FF0000" }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          disabled={!inputValue.trim() && !transcript.trim()}
          className={`p-3 transition-all duration-300 ${
            inputValue.trim() || transcript.trim()
              ? 'bg-gradient-to-r from-[#FF0000] to-[#E40000] text-white shadow-lg shadow-[#FF0000]/30 border border-[#FF0000]/50'
              : 'bg-white/10 text-white/40 cursor-not-allowed border border-white/20'
          }`}
          aria-label="Send message"
        >
          <Send className="w-6 h-6" />
        </motion.button>
      </div>

      {/* Recording Indicator */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center justify-center gap-2 mt-2 text-red-600"
          >
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-sm font-medium">Recording...</span>
            <button
              onClick={stopRecording}
              className="ml-2 text-sm text-red-500 hover:text-red-700"
            >
              Stop
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InputBar;