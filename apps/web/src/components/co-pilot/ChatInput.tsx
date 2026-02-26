/**
 * ChatInput Component — compact single-row input
 *
 * Layout:  [ textarea + inline 🎤 ] [ ➤ send ]
 *
 * - No mode-selector tabs (text is always the default)
 * - Inline mic icon for voice dictation (appends to message field)
 * - Send on Enter, new line on Shift+Enter
 * - Auto-resize textarea, character counter
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff } from 'lucide-react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isDisabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isDisabled = false }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Speech recognition — appends final transcript to the message field
  const { isRecording, isSupported, interimTranscript, toggle: toggleMic } =
    useSpeechRecognition({
      onFinalTranscript: (text) => {
        setMessage((prev) => {
          const trimmed = prev.trimEnd();
          return trimmed ? `${trimmed} ${text}` : text;
        });
      },
      onError: (err) => console.error('Speech recognition error:', err),
    });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (trimmed && !isDisabled) {
      onSendMessage(trimmed);
      setMessage('');
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
    // Auto-resize
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  // Focus textarea when enabled
  useEffect(() => {
    if (!isDisabled && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isDisabled]);

  const displayPlaceholder = isDisabled
    ? 'Chat mode is not active'
    : isRecording
    ? interimTranscript || 'Listening...'
    : 'How can I help you today?';

  return (
    <div className="border-t border-gray-200 dark:border-[#22272B] bg-gradient-to-t from-gray-50 dark:from-[#0F1112] to-transparent p-3">

      {/* Recording indicator */}
      {isRecording && (
        <div className="flex items-center gap-2 mb-2 text-xs text-red-500">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span>Recording... speak clearly</span>
          {interimTranscript && (
            <span className="italic text-gray-500 dark:text-gray-400 truncate max-w-[160px]">
              "{interimTranscript}"
            </span>
          )}
        </div>
      )}

      {/* Input row */}
      <form onSubmit={handleSubmit} className="flex items-end gap-2">

        {/* Textarea + inline mic */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={displayPlaceholder}
            disabled={isDisabled}
            rows={1}
            className={`
              w-full pl-4 pr-10 py-3 bg-gray-100 dark:bg-[#22272B]
              border border-[#2A3035] rounded-2xl
              text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40
              focus:outline-none focus:ring-2 focus:ring-[#FF0000]/50 focus:border-transparent
              transition-all disabled:opacity-50 disabled:cursor-not-allowed resize-none
              ${isRecording ? 'ring-2 ring-red-500/40 border-red-500/40' : ''}
            `}
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />

          {/* Character count */}
          {message.length > 0 && !isRecording && (
            <div className="absolute right-10 bottom-3 text-xs text-gray-400 dark:text-white/40 pointer-events-none">
              {message.length}
            </div>
          )}

          {/* Inline mic button */}
          {isSupported && (
            <button
              type="button"
              onClick={toggleMic}
              title={isRecording ? 'Stop recording' : 'Start voice input'}
              className={`
                absolute right-2 bottom-2 p-1.5 rounded-lg transition-all
                ${isRecording
                  ? 'text-red-500 bg-red-50 dark:bg-red-900/20 animate-pulse'
                  : 'text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-200 dark:hover:bg-[#2A3035]'
                }
              `}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Send button */}
        <button
          type="submit"
          disabled={message.trim().length === 0 || isDisabled}
          title="Send message (Enter)"
          className={`
            flex-shrink-0 p-2.5 rounded-xl transition-all transform hover:scale-105
            ${message.trim().length > 0 && !isDisabled
              ? 'bg-gradient-to-r from-[#FF0000] to-[#E40000] text-white shadow-lg shadow-[#FF0000]/30'
              : 'bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-white/40 cursor-not-allowed'
            }
          `}
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
