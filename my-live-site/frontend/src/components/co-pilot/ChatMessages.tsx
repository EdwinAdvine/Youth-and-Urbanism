/**
 * ChatMessages Component (upgraded with streaming and markdown)
 *
 * Displays chat conversation with enhanced features:
 * - Real-time streaming text with blinking cursor
 * - Markdown rendering for AI responses (bold, italic, lists, code blocks)
 * - Smooth pop-in animations for new messages
 * - Inline audio/video players for voice/video modes
 * - Smart auto-scroll (only when user is near bottom)
 * - Typing indicator with agent name
 * - User/AI avatar display
 */

import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, User as UserIcon, Volume2 } from 'lucide-react';
import { ChatMessage } from '../../store/coPilotStore';
import { useCoPilotStore } from '../../store';

interface ChatMessagesProps {
  messages: ChatMessage[];
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages }) => {
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);

  const {
    updateMessageStatus,
    isStreaming,
    streamingContent,
    isAiTyping,
    agentProfile
  } = useCoPilotStore();

  // Check if user is near bottom of scroll container
  const checkIfNearBottom = () => {
    const container = messagesContainerRef.current;
    if (container) {
      const threshold = 100; // pixels from bottom
      const isNear = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
      setIsNearBottom(isNear);
    }
  };

  // Smart auto-scroll: only scroll if user is near bottom
  useEffect(() => {
    if (isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streamingContent, isNearBottom]);

  // Update message status to delivered when visible
  useEffect(() => {
    const visibleMessages = messages.filter(msg => msg.status === 'sent');
    visibleMessages.forEach(msg => {
      setTimeout(() => {
        updateMessageStatus(msg.id, 'delivered');
      }, 1000);
    });
  }, [messages, updateMessageStatus]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMessageStatusIcon = (status: ChatMessage['status']) => {
    switch (status) {
      case 'sending':
        return <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" title="Sending"></div>;
      case 'sent':
        return <div className="w-2 h-2 bg-blue-400 rounded-full" title="Sent"></div>;
      case 'delivered':
        return <div className="w-2 h-2 bg-green-400 rounded-full" title="Delivered"></div>;
      case 'read':
        return <div className="w-2 h-2 bg-green-400 rounded-full" title="Read"></div>;
      default:
        return null;
    }
  };

  // Simple markdown rendering (bold, italic, code, lists)
  const renderMarkdown = (text: string) => {
    let html = text;

    // Code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-gray-800 text-gray-100 p-3 rounded-lg my-2 overflow-x-auto"><code>$2</code></pre>');

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-700 px-1.5 py-0.5 rounded text-sm">$1</code>');

    // Bold
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold">$1</strong>');

    // Italic
    html = html.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');

    // Unordered lists
    html = html.replace(/^- (.+)$/gm, '<li class="ml-4">• $1</li>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');

    // Preserve line breaks
    html = html.replace(/\n/g, '<br/>');

    return html;
  };

  if (messages.length === 0 && !isStreaming && !isAiTyping) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-white/60 text-sm p-4">
        <div className="text-center">
          <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">Start a conversation with your AI assistant</p>
          <p className="text-xs mt-1 opacity-75">
            {agentProfile?.agent_name || 'AI Assistant'} is ready to help!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={messagesContainerRef}
      onScroll={checkIfNearBottom}
      className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
    >
      <AnimatePresence initial={false}>
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className={`flex items-end gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {/* AI Avatar (left side) */}
            {message.sender === 'ai' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
            )}

            {/* Message Bubble */}
            <div
              className={`
                max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm
                ${message.sender === 'user'
                  ? 'bg-gradient-to-r from-[#FF0000] to-[#E40000] text-white rounded-br-sm'
                  : 'bg-gray-100 dark:bg-[#22272B] text-gray-900 dark:text-white rounded-bl-sm'
                }
              `}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium opacity-75">
                  {message.sender === 'user' ? 'You' : (agentProfile?.agent_name || 'AI Assistant')}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs opacity-60">{formatTime(message.timestamp)}</span>
                  {message.sender === 'user' && getMessageStatusIcon(message.status)}
                </div>
              </div>

              {/* Content */}
              {message.sender === 'ai' ? (
                <div
                  className="text-sm prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
                />
              ) : (
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              )}

              {/* Audio Player (Voice Mode) */}
              {message.audio_url && (
                <div className="mt-2 pt-2 border-t border-white/10">
                  <audio controls className="w-full h-8" style={{ filter: 'invert(0.9)' }}>
                    <source src={message.audio_url} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}

              {/* Video Player (Video Mode) */}
              {message.video_url && (
                <div className="mt-2 pt-2 border-t border-white/10">
                  <video controls className="w-full rounded-lg">
                    <source src={message.video_url} type="video/mp4" />
                    Your browser does not support the video element.
                  </video>
                </div>
              )}
            </div>

            {/* User Avatar (right side) */}
            {message.sender === 'user' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-white" />
              </div>
            )}
          </motion.div>
        ))}

        {/* Streaming Message (AI is generating response in real-time) */}
        {isStreaming && streamingContent && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-end gap-2 justify-start"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>

            <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm bg-gray-100 dark:bg-[#22272B] text-gray-900 dark:text-white rounded-bl-sm">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium opacity-75">
                  {agentProfile?.agent_name || 'AI Assistant'}
                </span>
                <span className="text-xs opacity-60">Generating...</span>
              </div>

              <div className="text-sm prose prose-sm dark:prose-invert max-w-none">
                <span dangerouslySetInnerHTML={{ __html: renderMarkdown(streamingContent) }} />
                <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse">|</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Typing Indicator (AI is thinking) */}
        {isAiTyping && !isStreaming && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-end gap-2 justify-start"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white animate-pulse" />
            </div>

            <div className="px-4 py-3 rounded-2xl shadow-sm bg-gray-100 dark:bg-[#22272B] rounded-bl-sm">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {agentProfile?.agent_name || 'AI Assistant'} is thinking
                </span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;
