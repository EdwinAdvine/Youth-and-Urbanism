import React, { useState, useRef, useEffect } from 'react';
import { useAgeAdaptiveUI } from '../../../hooks/useAgeAdaptiveUI';
import { Bot, Send, Sparkles, Mic, MicOff } from 'lucide-react';
import { useSpeechRecognition } from '../../../hooks/useSpeechRecognition';

interface Message {
  id: number;
  sender: 'ai' | 'student';
  text: string;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSend: (text: string) => void;
  placeholder?: string;
  quickActions?: { label: string; text: string }[];
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSend,
  placeholder = 'Type your question...',
  quickActions,
}) => {
  const { borderRadius } = useAgeAdaptiveUI();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;
    onSend(message);
    setMessage('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className={`flex-1 p-4 sm:p-6 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] overflow-y-auto mb-4`}>
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'student' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] sm:max-w-[70%] p-4 ${borderRadius} ${
                msg.sender === 'student'
                  ? 'bg-[#FF0000] text-gray-900 dark:text-white'
                  : 'bg-purple-500/20 text-gray-900 dark:text-white border border-purple-500/30'
              }`}>
                {msg.sender === 'ai' && <Bot className="w-4 h-4 inline-block mr-2" />}
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Recording indicator */}
      {isRecording && (
        <div className="flex items-center gap-2 mb-2 text-xs text-red-500">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span>Recording... speak clearly</span>
          {interimTranscript && (
            <span className="italic text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
              &ldquo;{interimTranscript}&rdquo;
            </span>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isRecording ? (interimTranscript || 'Listening...') : placeholder}
            className={`w-full px-4 py-3 ${isSupported ? 'pr-10' : ''} bg-white dark:bg-[#181C1F] border ${isRecording ? 'border-red-500/40' : 'border-gray-200 dark:border-[#22272B]'} ${borderRadius} text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus:outline-none focus:border-[#FF0000]`}
          />

          {/* Inline mic button */}
          {isSupported && (
            <button
              type="button"
              onClick={toggleMic}
              title={isRecording ? 'Stop recording' : 'Start voice input'}
              className={`
                absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all
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

        <button
          onClick={handleSend}
          className={`px-6 py-3 bg-[#FF0000] hover:bg-[#FF0000]/80 text-gray-900 dark:text-white ${borderRadius}`}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      {quickActions && quickActions.length > 0 && (
        <div className="mt-3 flex gap-2 flex-wrap">
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={() => { setMessage(action.text); }}
              className={`px-4 py-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-900 dark:text-white text-sm ${borderRadius}`}
            >
              <Sparkles className="w-4 h-4 inline-block mr-2" />
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
