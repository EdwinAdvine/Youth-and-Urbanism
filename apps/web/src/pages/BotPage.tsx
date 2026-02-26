// BotPage - Public Bird AI chat page at /bot. Connects to the real AI backend.
// No authentication required — general knowledge responses with course suggestions.
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { publicChat } from '../services/publicChatService';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Mic,
  Video,
  Type,
  Volume2,
  Plus,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Menu,
  Home,
  BookOpen,
  Sparkles,
} from 'lucide-react';

// -------------------------------------------------------------------
// Types
// -------------------------------------------------------------------

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  suggestedCourse?: { name: string; url: string };
}

type ResponseMode = 'text' | 'voice' | 'video';

interface ConversationStub {
  id: string;
  title: string;
}

// -------------------------------------------------------------------
// Static data
// -------------------------------------------------------------------

const MOCK_CONVERSATIONS: ConversationStub[] = [
  { id: '1', title: 'Help with Math' },
  { id: '2', title: 'CBC Curriculum' },
  { id: '3', title: 'Science Questions' },
  { id: '4', title: 'English Grammar' },
];

const QUICK_SUGGESTIONS = [
  'Help me with fractions',
  'Explain photosynthesis',
  'Practice English',
  'CBC Grade 5 Math',
];

// -------------------------------------------------------------------
// Sub-components
// -------------------------------------------------------------------

/** Three bouncing dots typing indicator */
const TypingIndicator: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 8 }}
    className="flex items-start gap-3 px-4 md:px-0"
  >
    {/* Avatar */}
    <div className="w-8 h-8 rounded-full bg-[#FF0000]/20 flex items-center justify-center flex-shrink-0 mt-1">
      <Sparkles size={16} className="text-[#FF0000]" />
    </div>
    <div className="bg-[#1E2327] rounded-2xl rounded-tl-sm px-5 py-3 flex gap-1.5 items-center">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 bg-white/50 rounded-full"
          animate={{ y: [0, -6, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  </motion.div>
);

/** Single chat message bubble */
const ChatBubble: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} px-4 md:px-0`}
    >
      {/* AI avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-[#FF0000]/20 flex items-center justify-center flex-shrink-0 mt-1 mr-3">
          <Sparkles size={16} className="text-[#FF0000]" />
        </div>
      )}

      <div className="max-w-[80%] md:max-w-[65%] flex flex-col gap-2">
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? 'bg-[#2A2F35] text-gray-900 dark:text-white rounded-tr-sm'
              : 'bg-[#1E2327] text-gray-800 dark:text-white/90 rounded-tl-sm'
          }`}
        >
          {message.content}
        </div>

        {/* Suggested course card */}
        {message.suggestedCourse && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Link
              to={message.suggestedCourse.url}
              className="flex items-center gap-3 bg-[#FF0000]/10 border border-[#FF0000]/20 rounded-xl px-4 py-3 hover:bg-[#FF0000]/15 transition-colors group"
            >
              <BookOpen size={18} className="text-[#FF0000] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 dark:text-white/50">Want to learn more?</p>
                <p className="text-sm text-gray-900 dark:text-white font-medium truncate group-hover:text-[#FF0000] transition-colors">
                  {message.suggestedCourse.name}
                </p>
              </div>
              <ChevronRight size={16} className="text-gray-400 dark:text-white/30 group-hover:text-[#FF0000] transition-colors" />
            </Link>
          </motion.div>
        )}

        <span className="text-[10px] text-gray-400 dark:text-white/30 px-1">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  );
};

// -------------------------------------------------------------------
// Main component
// -------------------------------------------------------------------

const BotPage: React.FC = () => {
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [responseMode, setResponseMode] = useState<ResponseMode>('text');

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // ---------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    // Add user message immediately
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const result = await publicChat(trimmed);
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        role: 'ai',
        content: result.message,
        timestamp: new Date(),
        suggestedCourse: result.suggested_course
          ? { name: result.suggested_course.name, url: result.suggested_course.url }
          : undefined,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: unknown) {
      const errorText =
        err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-error-${Date.now()}`,
          role: 'ai' as const,
          content: errorText,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleNewChat = () => {
    setMessages([]);
    setIsTyping(false);
    setInput('');
    inputRef.current?.focus();
  };

  const hasMessages = messages.length > 0;

  // ---------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-[#0F1112] text-gray-900 dark:text-white overflow-hidden select-none">
      {/* ============================================================
          SIDEBAR
         ============================================================ */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop (mobile) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-30 md:hidden"
            />

            {/* Sidebar panel */}
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 26, stiffness: 260 }}
              className="fixed md:relative z-40 w-[280px] h-full bg-[#141719] border-r border-gray-200 dark:border-[#22272B] flex flex-col"
            >
              {/* Sidebar header */}
              <div className="p-4 border-b border-gray-200 dark:border-[#22272B]">
                <button
                  onClick={handleNewChat}
                  className="w-full flex items-center gap-2 justify-center bg-[#FF0000] hover:bg-[#CC0000] text-gray-900 dark:text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
                >
                  <Plus size={16} />
                  New Chat
                </button>
              </div>

              {/* Conversation list */}
              <div className="flex-1 overflow-y-auto p-3 space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-white/30 px-3 py-2">
                  Recent
                </p>
                {MOCK_CONVERSATIONS.map((convo) => (
                  <button
                    key={convo.id}
                    className="w-full flex items-center gap-3 text-left px-3 py-2.5 rounded-lg text-sm text-gray-600 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <MessageSquare size={14} className="flex-shrink-0 text-gray-400 dark:text-white/40" />
                    <span className="truncate">{convo.title}</span>
                  </button>
                ))}
              </div>

              {/* Login prompt */}
              <div className="p-4 border-t border-gray-200 dark:border-[#22272B]">
                <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500 dark:text-white/50 mb-2">
                    Sign in to save your conversations
                  </p>
                  <Link
                    to="/"
                    className="inline-block text-xs font-medium text-[#FF0000] hover:underline"
                  >
                    Sign in
                  </Link>
                </div>
              </div>

              {/* Collapse button */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-400 dark:text-white/40 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors md:hidden"
              >
                <ChevronLeft size={18} />
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ============================================================
          MAIN COLUMN
         ============================================================ */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* ----------------------------------------------------------
            TOP BAR
           ---------------------------------------------------------- */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-[#22272B] bg-gray-50 dark:bg-[#0F1112]/80 backdrop-blur-md z-20">
          <div className="flex items-center gap-3">
            {/* Sidebar toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
            </button>

            {/* Logo */}
            <Link to="/bot" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#FF0000] flex items-center justify-center">
                <Sparkles size={16} className="text-gray-900 dark:text-white" />
              </div>
              <span className="text-base font-semibold tracking-tight hidden sm:inline">
                The Bird AI
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleNewChat}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 px-3 py-2 rounded-lg transition-colors"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">New Chat</span>
            </button>

            <Link
              to="/"
              className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white px-2 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              <Home size={14} />
              <span className="hidden sm:inline">Home</span>
            </Link>
          </div>
        </header>

        {/* ----------------------------------------------------------
            CHAT AREA
           ---------------------------------------------------------- */}
        <div className="flex-1 overflow-y-auto">
          {!hasMessages ? (
            /* ---- WELCOME SCREEN ---- */
            <div className="flex flex-col items-center justify-center h-full px-4">
              {/* Pulsing bird icon */}
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="w-24 h-24 rounded-full bg-[#FF0000]/15 border border-[#FF0000]/30 flex items-center justify-center mb-6"
              >
                <Sparkles size={40} className="text-[#FF0000]" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-2xl md:text-3xl font-bold mb-2 text-center"
              >
                Hi! I'm The Bird AI
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-gray-500 dark:text-white/50 text-sm md:text-base mb-8 text-center max-w-md"
              >
                Your personal AI tutor for Kenyan students
              </motion.p>

              {/* Quick suggestion chips */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="flex flex-wrap justify-center gap-2 max-w-lg"
              >
                {QUICK_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => sendMessage(suggestion)}
                    className="px-4 py-2.5 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl text-sm text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:border-[#FF0000]/40 hover:bg-[#FF0000]/5 transition-all"
                  >
                    {suggestion}
                  </button>
                ))}
              </motion.div>
            </div>
          ) : (
            /* ---- MESSAGE LIST ---- */
            <div className="max-w-3xl mx-auto py-6 space-y-5">
              {messages.map((msg) => (
                <ChatBubble key={msg.id} message={msg} />
              ))}

              <AnimatePresence>{isTyping && <TypingIndicator />}</AnimatePresence>

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* ----------------------------------------------------------
            INPUT BAR
           ---------------------------------------------------------- */}
        <div className="border-t border-gray-200 dark:border-[#22272B] bg-gray-50 dark:bg-[#0F1112]/80 backdrop-blur-md px-4 pb-4 pt-3">
          {/* Response mode toggles */}
          <div className="flex items-center justify-center gap-1 mb-3">
            {(
              [
                { mode: 'text' as ResponseMode, icon: Type, label: 'Text' },
                { mode: 'voice' as ResponseMode, icon: Volume2, label: 'Voice' },
                { mode: 'video' as ResponseMode, icon: Video, label: 'Video' },
              ] as const
            ).map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => setResponseMode(mode)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  responseMode === mode
                    ? 'bg-[#FF0000]/15 text-[#FF0000]'
                    : 'text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/70 hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
                aria-label={`${label} mode`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          {/* Input row */}
          <form
            onSubmit={handleSubmit}
            className="max-w-3xl mx-auto flex items-center gap-2 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-2xl px-4 py-2 focus-within:border-[#FF0000]/40 transition-colors"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask The Bird AI anything..."
              className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-white/30 outline-none py-1.5"
              disabled={isTyping}
            />

            {/* Mic button */}
            <button
              type="button"
              className="p-2 rounded-lg text-gray-400 dark:text-white/40 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              aria-label="Voice input"
            >
              <Mic size={18} />
            </button>

            {/* Send button */}
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className={`p-2 rounded-lg transition-colors ${
                input.trim()
                  ? 'bg-[#FF0000] text-gray-900 dark:text-white hover:bg-[#CC0000]'
                  : 'text-gray-400 dark:text-gray-300 dark:text-white/20 cursor-not-allowed'
              }`}
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </form>

          <p className="text-[10px] text-gray-400 dark:text-gray-300 dark:text-white/20 text-center mt-2">
            The Bird AI can make mistakes. Check important info.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BotPage;
