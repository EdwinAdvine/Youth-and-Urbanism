/**
 * ChatMessages Component
 *
 * Displays chat conversation with:
 * - Real-time streaming text with blinking cursor
 * - Markdown rendering for AI responses
 * - Smooth pop-in animations for new messages
 * - Inline audio player for voice mode
 * - Smart auto-scroll (only when user is near bottom)
 * - Typing indicator with agent name
 * - MessageToolbar under every AI response (TTS, copy, share, feedback, etc.)
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, User as UserIcon } from 'lucide-react';
import { ChatMessage } from '../../store/coPilotStore';
import { useCoPilotStore } from '../../store';
import MessageToolbar from '../shared/MessageToolbar';

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
    agentProfile,
    sendMessage,
  } = useCoPilotStore();

  const checkIfNearBottom = () => {
    const container = messagesContainerRef.current;
    if (container) {
      const threshold = 100;
      const isNear = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
      setIsNearBottom(isNear);
    }
  };

  useEffect(() => {
    if (isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streamingContent, isNearBottom]);

  useEffect(() => {
    const visibleMessages = messages.filter(msg => msg.status === 'sent');
    visibleMessages.forEach(msg => {
      setTimeout(() => updateMessageStatus(msg.id, 'delivered'), 1000);
    });
  }, [messages, updateMessageStatus]);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const getMessageStatusIcon = (status: ChatMessage['status']) => {
    switch (status) {
      case 'sending': return <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" title="Sending" />;
      case 'sent':    return <div className="w-2 h-2 bg-blue-400 rounded-full" title="Sent" />;
      case 'delivered': return <div className="w-2 h-2 bg-green-400 rounded-full" title="Delivered" />;
      case 'read':    return <div className="w-2 h-2 bg-green-400 rounded-full" title="Read" />;
      default:        return null;
    }
  };

  const renderMarkdown = (text: string) => {
    let html = text;
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-gray-800 text-gray-100 p-3 rounded-lg my-2 overflow-x-auto"><code>$2</code></pre>');
    html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-700 px-1.5 py-0.5 rounded text-sm">$1</code>');
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold">$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');
    html = html.replace(/^- (.+)$/gm, '<li class="ml-4">• $1</li>');
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');
    html = html.replace(/\n/g, '<br/>');
    return html;
  };

  const getPrecedingUserMessage = useCallback((aiIdx: number): string | null => {
    for (let i = aiIdx - 1; i >= 0; i--) {
      if (messages[i].sender === 'user') return messages[i].content;
    }
    return null;
  }, [messages]);

  const handleRegenerate = useCallback((aiIdx: number) => {
    const userText = getPrecedingUserMessage(aiIdx);
    if (userText) sendMessage(userText);
  }, [getPrecedingUserMessage, sendMessage]);

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
        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className={`flex items-end gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {/* AI Avatar */}
            {message.sender === 'ai' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center self-start mt-1">
                <Bot className="w-5 h-5 text-white" />
              </div>
            )}

            {/* Bubble + toolbar */}
            <div className="flex flex-col max-w-xs lg:max-w-md">
              <div
                className={`
                  px-4 py-3 rounded-2xl shadow-sm
                  ${message.sender === 'user'
                    ? 'bg-gradient-to-r from-[#FF0000] to-[#E40000] text-white rounded-br-sm'
                    : 'bg-gray-100 dark:bg-[#22272B] text-gray-900 dark:text-white rounded-bl-sm'
                  }
                `}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium opacity-75">
                    {message.sender === 'user' ? 'You' : (agentProfile?.agent_name || 'AI Assistant')}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs opacity-60">{formatTime(message.timestamp)}</span>
                    {message.sender === 'user' && getMessageStatusIcon(message.status)}
                  </div>
                </div>

                {message.sender === 'ai' ? (
                  <div
                    className="text-sm prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
                  />
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                )}

                {message.audio_url && (
                  <div className="mt-2 pt-2 border-t border-white/10">
                    <audio controls className="w-full h-8" style={{ filter: 'invert(0.9)' }}>
                      <source src={message.audio_url} type="audio/mpeg" />
                    </audio>
                  </div>
                )}

              </div>

              {/* Toolbar — AI messages only */}
              {message.sender === 'ai' && (
                <MessageToolbar
                  messageId={message.id}
                  content={message.content}
                  audioUrl={message.audio_url}
                  responseTimeMs={message.response_time_ms}
                  onRegenerate={() => handleRegenerate(index)}
                />
              )}
            </div>

            {/* User Avatar */}
            {message.sender === 'user' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-white" />
              </div>
            )}
          </motion.div>
        ))}

        {/* Streaming Message */}
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

        {/* Typing Indicator */}
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
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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
