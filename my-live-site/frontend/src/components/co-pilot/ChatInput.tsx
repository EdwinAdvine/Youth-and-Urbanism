/**
 * ChatInput Component (upgraded with three-mode selector)
 *
 * Multi-modal chat input supporting text, voice, and video response modes.
 * Dynamically switches UI based on selected mode:
 * - Text mode: Multi-line textarea with auto-resize
 * - Voice mode: VoiceRecorder component with Web Speech API
 * - Video mode: VideoAvatar + VoiceRecorder for video-based interaction
 *
 * Features:
 * - Segmented control mode selector
 * - Send on Enter, new line on Shift+Enter (text mode)
 * - Auto-resize textarea
 * - Character counter
 * - Typing indicator
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Type, Mic, Video } from 'lucide-react';
import { useCoPilotStore } from '../../store/coPilotStore';
import { VoiceRecorder } from './VoiceRecorder';
import { VideoAvatar } from './VideoAvatar';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isDisabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isDisabled = false }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { responseMode, setResponseMode, agentProfile } = useCoPilotStore();

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

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    setIsTyping(e.target.value.length > 0);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const handleVoiceTranscript = (transcript: string) => {
    // Auto-send voice transcript
    if (transcript.trim() && !isDisabled) {
      onSendMessage(transcript.trim());
    }
  };

  const handleVoiceError = (error: string) => {
    console.error('Voice input error:', error);
  };

  // Focus textarea when in text mode and component becomes enabled
  useEffect(() => {
    if (!isDisabled && responseMode === 'text' && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isDisabled, responseMode]);

  return (
    <div className="border-t border-gray-200 dark:border-[#22272B] bg-gradient-to-t from-gray-50 dark:from-[#0F1112] to-transparent p-4">
      {/* Mode Selector (Segmented Control) */}
      <div className="mb-4 flex items-center justify-center">
        <div className="inline-flex items-center bg-gray-200 dark:bg-[#22272B] rounded-full p-1 space-x-1">
          {/* Text Mode */}
          <button
            type="button"
            onClick={() => setResponseMode('text')}
            disabled={isDisabled}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
              ${responseMode === 'text'
                ? 'bg-white dark:bg-[#0F1112] text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            <Type className="w-4 h-4" />
            <span>Text</span>
          </button>

          {/* Voice Mode */}
          <button
            type="button"
            onClick={() => setResponseMode('voice')}
            disabled={isDisabled}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
              ${responseMode === 'voice'
                ? 'bg-white dark:bg-[#0F1112] text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            <Mic className="w-4 h-4" />
            <span>Voice</span>
          </button>

          {/* Video Mode */}
          <button
            type="button"
            onClick={() => setResponseMode('video')}
            disabled={isDisabled}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
              ${responseMode === 'video'
                ? 'bg-white dark:bg-[#0F1112] text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            <Video className="w-4 h-4" />
            <span>Video</span>
          </button>
        </div>
      </div>

      {/* Mode-Specific Input UI */}
      {responseMode === 'text' && (
        <form onSubmit={handleSubmit} className="flex items-end gap-3">
          {/* Text Input (Textarea) */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={isDisabled ? "Chat mode is not active" : "Type your message... (Shift+Enter for new line)"}
              disabled={isDisabled}
              rows={1}
              className={`
                w-full px-4 py-3 pr-12 bg-gray-100 dark:bg-[#22272B] border border-[#2A3035] rounded-2xl
                text-gray-900 dark:text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#FF0000]/50 focus:border-transparent
                transition-all disabled:opacity-50 disabled:cursor-not-allowed resize-none
                ${isTyping ? 'ring-2 ring-[#FF0000]/30 border-[#FF0000]/50' : ''}
              `}
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />

            {/* Character Counter */}
            {message.length > 0 && (
              <div className="absolute right-12 bottom-3 text-xs text-gray-500 dark:text-white/60">
                {message.length}
              </div>
            )}
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={message.trim().length === 0 || isDisabled}
            className={`
              p-3 rounded-full transition-all transform hover:scale-105
              ${message.trim().length > 0 && !isDisabled
                ? 'bg-gradient-to-r from-[#FF0000] to-[#E40000] text-white shadow-lg shadow-[#FF0000]/30'
                : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white/60 cursor-not-allowed'
              }
            `}
            title="Send message (Enter)"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      )}

      {responseMode === 'voice' && (
        <div className="py-4">
          <VoiceRecorder
            onTranscript={handleVoiceTranscript}
            onError={handleVoiceError}
          />
        </div>
      )}

      {responseMode === 'video' && (
        <div className="py-4 flex flex-col items-center space-y-4">
          {/* Avatar Display */}
          <VideoAvatar
            avatarUrl={agentProfile?.avatar_url}
            agentName={agentProfile?.agent_name || 'AI Assistant'}
            isListening={false}
          />

          {/* Voice Recorder for Video Mode */}
          <div className="w-full">
            <VoiceRecorder
              onTranscript={handleVoiceTranscript}
              onError={handleVoiceError}
            />
          </div>
        </div>
      )}

      {/* Typing Indicator (Text Mode Only) */}
      {isTyping && !isDisabled && responseMode === 'text' && (
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
