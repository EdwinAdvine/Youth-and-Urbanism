/**
 * AITutorChatPage — /dashboard/student/ai-tutor/chat
 *
 * Unified multi-mode AI tutor interface combining:
 *  - Text chat with rich markdown display
 *  - Voice mode (speech-to-text input + spoken responses)
 *  - Video mode (placeholder for avatar video responses)
 *  - Screen reading capability (AI describes current page content)
 *
 * Each student's tutor is identified by a unique AIT code shown in the header.
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bot, Send, Sparkles, AlertCircle, Loader2,
  Monitor, Mic, MicOff, Video, MessageSquare, RefreshCw
} from 'lucide-react';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { useScreenContext } from '../../hooks/useScreenContext';
import { chatWithAIExtended, getTutorInfo } from '../../services/student/studentAIService';
import { VoiceRecorder } from '../../components/co-pilot/VoiceRecorder';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

type ChatMode = 'text' | 'voice' | 'video';

interface TutorInfo {
  tutor_name: string;
  ait_code: string | null;
  grade_level: string;
  total_interactions: number;
}

// ──────────────────────────────────────────────
// Markdown renderer (safe, no external deps)
// ──────────────────────────────────────────────
function renderMarkdown(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Code blocks
    .replace(/```[\w]*\n?([\s\S]*?)```/g, '<pre class="bg-black/20 rounded-lg p-3 my-2 text-sm overflow-x-auto whitespace-pre-wrap font-mono"><code>$1</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="bg-black/20 px-1 rounded font-mono text-sm">$1</code>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/_(.+?)_/g, '<em>$1</em>')
    // Numbered lists
    .replace(/^\d+\.\s+(.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
    // Bullet lists
    .replace(/^[-*]\s+(.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    // Wrap adjacent <li> in <ul>/<ol>
    .replace(/(<li.*<\/li>\n?)+/g, (m) => `<ul class="space-y-1 my-2">${m}</ul>`)
    // Line breaks
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}

// ──────────────────────────────────────────────
// Message bubble
// ──────────────────────────────────────────────
const MessageBubble: React.FC<{ msg: ChatMessage; borderRadius: string }> = ({ msg, borderRadius }) => {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-2`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0 mt-1">
          <Bot className="w-4 h-4 text-purple-400" />
        </div>
      )}
      <div
        className={`max-w-[82%] px-4 py-3 ${borderRadius} text-sm leading-relaxed ${
          isUser
            ? 'bg-[#FF0000]/90 text-white'
            : 'bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white'
        }`}
      >
        {isUser ? (
          <span>{msg.content}</span>
        ) : (
          <div
            className="prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
          />
        )}
        <div className={`text-xs mt-1 ${isUser ? 'text-white/60 text-right' : 'text-gray-400 dark:text-white/40'}`}>
          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────
// Main page component
// ──────────────────────────────────────────────
const AITutorChatPage: React.FC = () => {
  const { borderRadius } = useAgeAdaptiveUI();
  const getScreenContext = useScreenContext();

  // ── State ──
  const [mode, setMode] = useState<ChatMode>('text');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tutorInfo, setTutorInfo] = useState<TutorInfo | null>(null);
  const [tutorLoading, setTutorLoading] = useState(true);
  const [screenContextAttached, setScreenContextAttached] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Speech recognition for inline voice-in-text mode
  const { isRecording, isSupported: micSupported, interimTranscript, toggle: toggleMic } =
    useSpeechRecognition({
      onFinalTranscript: (text) => {
        setInputText((prev) => {
          const trimmed = prev.trimEnd();
          return trimmed ? `${trimmed} ${text}` : text;
        });
      },
    });

  // ── Load tutor info on mount ──
  useEffect(() => {
    const loadTutorInfo = async () => {
      try {
        setTutorLoading(true);
        const info = await getTutorInfo();
        setTutorInfo({
          tutor_name: info.tutor_name,
          ait_code: info.ait_code,
          grade_level: info.grade_level,
          total_interactions: info.total_interactions,
        });
        // Set welcome message personalised to tutor name
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            content: `Hi! I'm **${info.tutor_name}**, your personal AI tutor. I'm here to help you learn and explore ideas — ask me anything!`,
            timestamp: new Date(),
          },
        ]);
      } catch {
        // Use default if tutor info fails
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            content: "Hi! I'm **Birdy**, your personal AI tutor. I'm here to help you learn — ask me anything!",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setTutorLoading(false);
      }
    };
    loadTutorInfo();
  }, []);

  // ── Auto-scroll ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // ── Auto-resize textarea ──
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputText]);

  // ── Send message ──
  const handleSend = useCallback(async (text?: string, withScreenContext = false) => {
    const messageText = (text ?? inputText).trim();
    if (!messageText || loading) return;

    setInputText('');
    setError(null);
    setScreenContextAttached(false);

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const conversationHistory = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content }));

      const screenCtx = withScreenContext ? getScreenContext() : undefined;

      const response = await chatWithAIExtended({
        message: messageText,
        conversation_history: conversationHistory,
        screen_context: screenCtx,
      });

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to get a response. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [inputText, loading, messages, getScreenContext]);

  // ── Screen context attach/detach toggle ──
  const handleAttachScreen = () => {
    const ctx = getScreenContext();
    if (!ctx) return;
    setScreenContextAttached((prev) => !prev);
    if (!screenContextAttached) {
      setInputText((prev) => prev || 'What am I looking at?');
    }
  };

  // ── "What am I looking at?" quick action ──
  const handleWhatAmILooking = () => {
    handleSend('What am I looking at?', true);
  };

  // ── Voice transcript callback ──
  const handleVoiceTranscript = (text: string) => {
    // In voice mode: auto-send after STT finishes
    if (mode === 'voice') {
      handleSend(text, false);
    } else {
      setInputText(text);
    }
  };

  // ── Clear chat ──
  const handleClear = () => {
    const welcome = messages.find((m) => m.id === 'welcome');
    setMessages(welcome ? [welcome] : []);
    setError(null);
  };

  const quickActions = [
    { label: 'Explain this concept', message: 'Can you explain this concept to me step by step?' },
    { label: 'Help with homework', message: 'I need help with my homework. Can you guide me?' },
    { label: 'Practice quiz', message: 'Give me a practice quiz on what I learned today.' },
    { label: 'What am I looking at?', action: handleWhatAmILooking },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">

      {/* ── Header ── */}
      <div className={`p-4 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] ${borderRadius} mb-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  {tutorLoading ? 'Loading…' : (tutorInfo?.tutor_name ?? 'Birdy')}
                </h1>
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" title="Online" />
              </div>
              <p className="text-xs text-gray-500 dark:text-white/50">Your personal AI tutor</p>
              {tutorInfo?.ait_code && (
                <p className="text-xs font-mono text-purple-500 dark:text-purple-400 tracking-wide">
                  {tutorInfo.ait_code}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode tabs */}
            <div className={`flex ${borderRadius} bg-gray-100 dark:bg-white/5 p-1 gap-1`}>
              {(['text', 'voice', 'video'] as ChatMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-1.5 text-xs font-medium ${borderRadius} flex items-center gap-1 transition-colors ${
                    mode === m
                      ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-white/50 hover:text-gray-700 dark:hover:text-white/70'
                  }`}
                >
                  {m === 'text' && <MessageSquare className="w-3 h-3" />}
                  {m === 'voice' && <Mic className="w-3 h-3" />}
                  {m === 'video' && <Video className="w-3 h-3" />}
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>

            {/* Clear button */}
            <button
              onClick={handleClear}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white/70 transition-colors"
              title="Clear chat"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Video mode placeholder ── */}
      {mode === 'video' && (
        <div className={`p-4 mb-3 bg-purple-500/10 border border-purple-500/20 ${borderRadius} text-center`}>
          <Video className="w-8 h-8 text-purple-400 mx-auto mb-2" />
          <p className="text-purple-300 font-medium text-sm">Video responses via AI avatar — coming soon</p>
          <p className="text-purple-400/70 text-xs mt-1">Text responses are still shown below while this feature is being built.</p>
        </div>
      )}

      {/* ── Messages area ── */}
      <div className={`flex-1 p-4 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] overflow-y-auto mb-3 space-y-4`}>
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} borderRadius={borderRadius} />
        ))}

        {loading && (
          <div className="flex justify-start gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-purple-400" />
            </div>
            <div className={`px-4 py-3 ${borderRadius} bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10`}>
              <span className="flex items-center gap-2 text-gray-500 dark:text-white/50 text-sm">
                <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                Thinking…
                <span className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </span>
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className={`mb-2 p-3 bg-red-500/10 border border-red-500/20 ${borderRadius} flex items-center gap-2 text-red-400 text-sm`}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300 text-xs underline">
            Dismiss
          </button>
        </div>
      )}

      {/* ── Voice mode ── */}
      {mode === 'voice' && (
        <div className={`p-4 mb-3 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
          <p className="text-center text-sm text-gray-500 dark:text-white/60 mb-3">
            Tap the microphone and speak your question — Birdy will reply in text.
          </p>
          <div className="flex justify-center">
            <VoiceRecorder
              onTranscript={handleVoiceTranscript}
              onError={(e: string) => setError(e)}
            />
          </div>
        </div>
      )}

      {/* ── Text / Video input area ── */}
      {(mode === 'text' || mode === 'video') && (
        <div className="space-y-2">
          {/* Screen context indicator */}
          {screenContextAttached && (
            <div className={`px-3 py-1.5 ${borderRadius} bg-blue-500/10 border border-blue-500/20 flex items-center gap-2 text-blue-400 text-xs`}>
              <Monitor className="w-3 h-3" />
              Screen content attached to next message
              <button onClick={() => setScreenContextAttached(false)} className="ml-auto hover:text-blue-300">✕</button>
            </div>
          )}

          <div className="flex gap-2">
            {/* Screen context button */}
            <button
              onClick={handleAttachScreen}
              title="Attach current screen content as context"
              className={`px-3 py-3 ${borderRadius} border transition-colors ${
                screenContextAttached
                  ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                  : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-[#22272B] text-gray-500 dark:text-white/50 hover:text-gray-700 dark:hover:text-white/70'
              }`}
            >
              <Monitor className="w-5 h-5" />
            </button>

            {/* Textarea */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(undefined, screenContextAttached);
                  }
                }}
                placeholder="Ask me anything… (Enter to send, Shift+Enter for new line)"
                disabled={loading}
                rows={1}
                className={`w-full px-4 py-3 pr-12 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus:outline-none focus:border-purple-500/50 disabled:opacity-50 resize-none`}
              />
              {/* Inline mic for text mode */}
              {micSupported && (
                <button
                  onClick={toggleMic}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${
                    isRecording ? 'text-red-400' : 'text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/70'
                  }`}
                  title={isRecording ? 'Stop recording' : 'Start voice input'}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              )}
            </div>

            {/* Send button */}
            <button
              onClick={() => handleSend(undefined, screenContextAttached)}
              disabled={loading || !inputText.trim()}
              className={`px-4 py-3 bg-[#FF0000] hover:bg-[#FF0000]/80 text-white ${borderRadius} disabled:opacity-50 transition-colors`}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>

          {/* Interim transcript */}
          {isRecording && interimTranscript && (
            <p className="text-xs text-gray-400 dark:text-white/40 italic px-1">
              Listening: {interimTranscript}…
            </p>
          )}
        </div>
      )}

      {/* ── Quick actions ── */}
      <div className="mt-3 flex gap-2 flex-wrap">
        {quickActions.map((qa) => (
          <button
            key={qa.label}
            onClick={() => {
              if (qa.action) {
                qa.action();
              } else if (qa.message) {
                setInputText(qa.message);
                textareaRef.current?.focus();
              }
            }}
            disabled={loading}
            className={`px-3 py-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-white/80 text-xs ${borderRadius} flex items-center gap-1.5 transition-colors disabled:opacity-50`}
          >
            {qa.label === 'What am I looking at?' ? (
              <Monitor className="w-3 h-3 text-blue-400" />
            ) : (
              <Sparkles className="w-3 h-3 text-purple-400" />
            )}
            {qa.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AITutorChatPage;
