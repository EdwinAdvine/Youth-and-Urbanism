import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Paperclip } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isDisabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isDisabled = false }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    if (trimmedMessage && !isDisabled) {
      onSendMessage(trimmedMessage);
      setMessage('');
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    setIsTyping(e.target.value.length > 0);
  };

  // Focus input when component mounts or becomes enabled
  useEffect(() => {
    if (!isDisabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isDisabled]);

  return (
    <div className="border-t border-gray-200 dark:border-[#22272B] bg-gradient-to-t from-gray-50 dark:from-[#0F1112] to-transparent p-4">
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        {/* Attach Button */}
        <button
          type="button"
          className="p-2 text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
          disabled={isDisabled}
          title="Attach file"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Voice Input Button */}
        <button
          type="button"
          className="p-2 text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
          disabled={isDisabled}
          title="Voice input"
        >
          <Mic className="w-5 h-5" />
        </button>

        {/* Input Field */}
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={isDisabled ? "Chat mode is not active" : "Type your message..."}
            disabled={isDisabled}
            className={`
              w-full px-4 py-3 pr-12 bg-gray-100 dark:bg-[#22272B] border border-[#2A3035] rounded-full
              text-gray-900 dark:text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#FF0000]/50 focus:border-transparent
              transition-all disabled:opacity-50 disabled:cursor-not-allowed
              ${isTyping ? 'ring-2 ring-[#FF0000]/30 border-[#FF0000]/50' : ''}
            `}
          />
          
          {/* Character Counter */}
          {message.length > 0 && (
            <div className="absolute right-12 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 dark:text-white/60">
              {message.length}
            </div>
          )}
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={message.trim().length === 0 || isDisabled}
          className={`
            p-2 rounded-full transition-all transform hover:scale-105
            ${message.trim().length > 0 && !isDisabled 
              ? 'bg-gradient-to-r from-[#FF0000] to-[#E40000] text-gray-900 dark:text-white shadow-lg shadow-[#FF0000]/30' 
              : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white/60 cursor-not-allowed'
            }
          `}
          title="Send message (Enter)"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>

      {/* Typing Indicator */}
      {isTyping && !isDisabled && (
        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-white/60">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <span>Typing...</span>
        </div>
      )}
    </div>
  );
};

export default ChatInput;