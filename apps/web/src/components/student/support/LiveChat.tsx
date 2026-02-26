import React, { useState } from 'react';
import { useAgeAdaptiveUI } from '../../../hooks/useAgeAdaptiveUI';
import { Send, Mic, MicOff } from 'lucide-react';
import { useSpeechRecognition } from '../../../hooks/useSpeechRecognition';

interface ChatMessage {
  id: number;
  sender: 'student' | 'support';
  text: string;
  time: string;
}

interface LiveChatProps {
  agentName?: string;
}

const LiveChat: React.FC<LiveChatProps> = ({ agentName = 'Support Agent' }) => {
  const { borderRadius } = useAgeAdaptiveUI();
  const [message, setMessage] = useState('');

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

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, sender: 'support', text: `Hi! I'm ${agentName}. How can I help you today?`, time: 'Just now' },
  ]);

  const handleSend = () => {
    if (!message.trim()) return;
    const newMsg: ChatMessage = { id: Date.now(), sender: 'student', text: message, time: 'Just now' };
    setMessages([...messages, newMsg]);
    setMessage('');
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'support',
        text: "Thanks for reaching out! Let me look into that for you.",
        time: 'Just now'
      }]);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full">
      <div className={`p-3 bg-green-500/10 ${borderRadius} border border-green-500/20 mb-3 flex items-center gap-2`}>
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-green-400 text-sm font-medium">{agentName}</span>
        <span className="text-gray-400 dark:text-white/30 text-xs">Online</span>
      </div>
      <div className={`flex-1 p-4 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] overflow-y-auto mb-3`}>
        <div className="space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'student' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 ${borderRadius} ${
                msg.sender === 'student' ? 'bg-[#FF0000] text-gray-900 dark:text-white' : 'bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10'
              }`}>
                <p className="text-sm">{msg.text}</p>
                <p className="text-[10px] mt-1 opacity-50">{msg.time}</p>
              </div>
            </div>
          ))}
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
            placeholder={isRecording ? (interimTranscript || 'Listening...') : 'Type a message...'}
            className={`w-full px-4 py-2.5 ${isSupported ? 'pr-10' : ''} bg-white dark:bg-[#181C1F] border ${isRecording ? 'border-red-500/40' : 'border-gray-200 dark:border-[#22272B]'} ${borderRadius} text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-green-500`}
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

        <button onClick={handleSend} className={`px-4 py-2.5 bg-green-500 hover:bg-green-600 text-gray-900 dark:text-white ${borderRadius}`}>
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default LiveChat;
