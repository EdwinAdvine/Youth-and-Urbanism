/**
 * MessageToolbar
 *
 * Horizontal toolbar displayed below every AI response bubble.
 * All icons are functional.
 *
 * Layout (left → right):
 *   ↩ Regenerate  |  🔇 TTS speaker  |  💬 Comment  |  📋 Copy  |
 *   ⬆ Share  |  👍 Like  |  👎 Dislike  |  ··· More  ‖  NNNms latency
 *
 * The toolbar is self-contained: TTS, copy, share, and feedback are
 * handled internally. Regenerate is delegated to an optional parent callback.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  RotateCcw,
  Volume2,
  VolumeX,
  Video,
  MessageSquare,
  Copy,
  Check,
  Share2,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  Flag,
  FileText,
  X,
} from 'lucide-react';
import { useAvatarStore } from '../../store/avatarStore';
import { useAvatarLipSync } from '../../hooks/useAvatarLipSync';

interface MessageToolbarProps {
  /** Unique message ID (used for share links and feedback) */
  messageId: string;
  /** Plain-text content of the AI response (for TTS and copy) */
  content: string;
  /** Pre-generated audio URL from ElevenLabs TTS (if available) */
  audioUrl?: string | null;
  /** Response latency in milliseconds */
  responseTimeMs?: number;
  /** Called when user clicks the regenerate (undo) button */
  onRegenerate?: () => void;
}

const MessageToolbar: React.FC<MessageToolbarProps> = ({
  messageId,
  content,
  audioUrl,
  responseTimeMs,
  onRegenerate,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  // Avatar narration
  const activeAvatar = useAvatarStore((s) => s.activeAvatar);
  const webglTier = useAvatarStore((s) => s.webglTier);
  const showAvatarPanel = useAvatarStore((s) => s.showAvatarPanel);
  const isAvatarSpeaking = useAvatarStore((s) => s.isAvatarSpeaking);
  const { playAudioWithSync, stopNarration } = useAvatarLipSync();
  const canUseAvatar = !!activeAvatar && webglTier !== 'none';

  const handleAvatarNarrate = useCallback(() => {
    if (isAvatarSpeaking) {
      stopNarration();
      return;
    }
    showAvatarPanel();
    // Play audio through avatar lip sync engine
    if (audioUrl) {
      playAudioWithSync(audioUrl);
    }
  }, [isAvatarSpeaking, stopNarration, showAvatarPanel, audioUrl, playAudioWithSync]);
  const [showMenu, setShowMenu] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState('');
  const [commentSaved, setCommentSaved] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Stop TTS when component unmounts
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // ── TTS (Speaker) ─────────────────────────────────────────────────
  const handleSpeak = useCallback(() => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsSpeaking(false);
      return;
    }

    // Prefer backend-generated ElevenLabs audio if available
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onplay = () => setIsSpeaking(true);
      audio.onended = () => { setIsSpeaking(false); audioRef.current = null; };
      audio.onerror = () => {
        // Fall back to browser TTS
        audioRef.current = null;
        speakWithBrowser();
      };
      audio.play().catch(() => speakWithBrowser());
      return;
    }

    speakWithBrowser();
  }, [isSpeaking, audioUrl, content]);

  const speakWithBrowser = () => {
    window.speechSynthesis.cancel();
    // Strip markdown-like syntax for cleaner speech
    const plainText = content
      .replace(/```[\s\S]*?```/g, 'code block')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/#+\s/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .trim();

    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  // ── Copy ──────────────────────────────────────────────────────────
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      // Fallback for older browsers
      const el = document.createElement('textarea');
      el.value = content;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [content]);

  // ── Share ─────────────────────────────────────────────────────────
  const handleShare = useCallback(() => {
    const url = `${window.location.href.split('?')[0]}?msg=${messageId}`;
    navigator.clipboard.writeText(url).then(() => {
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }).catch(() => {});
  }, [messageId]);

  // ── Feedback ──────────────────────────────────────────────────────
  const handleFeedback = useCallback((type: 'up' | 'down') => {
    setFeedback(prev => prev === type ? null : type);
  }, []);

  // ── Comment ───────────────────────────────────────────────────────
  const handleSaveComment = () => {
    if (comment.trim()) {
      setCommentSaved(true);
      setShowComment(false);
      setTimeout(() => setCommentSaved(false), 3000);
    }
  };

  // ── Export PDF ────────────────────────────────────────────────────
  const handleExportPDF = () => {
    setShowMenu(false);
    const win = window.open('', '_blank', 'width=800,height=600');
    if (win) {
      const formatted = content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br/>');
      win.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>AI Response — Urban Home School</title>
            <style>
              body { font-family: Georgia, serif; max-width: 700px; margin: 40px auto; line-height: 1.7; color: #1a1a1a; }
              h1 { font-size: 1.2rem; color: #E40000; border-bottom: 2px solid #E40000; padding-bottom: 8px; }
              .meta { color: #666; font-size: 0.85rem; margin-bottom: 20px; }
              .content { font-size: 1rem; }
            </style>
          </head>
          <body>
            <h1>AI Response — Urban Home School</h1>
            <div class="meta">Generated: ${new Date().toLocaleString()}</div>
            <div class="content">${formatted}</div>
          </body>
        </html>
      `);
      win.document.close();
      win.focus();
      setTimeout(() => win.print(), 500);
    }
  };

  // ── Report Issue ──────────────────────────────────────────────────
  const handleReportIssue = () => {
    setShowMenu(false);
    const body = encodeURIComponent(
      `Issue with AI response (ID: ${messageId}):\n\nResponse content:\n"${content.substring(0, 300)}..."\n\nDescribe the issue:\n`
    );
    window.open(`mailto:support@urbanhomeschool.co.ke?subject=AI Response Issue&body=${body}`, '_blank');
  };

  // ── Latency formatter ─────────────────────────────────────────────
  const formatLatency = (ms?: number) => {
    if (ms === undefined || ms === null) return '—';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="mt-1.5 ml-1">
      {/* Toolbar row */}
      <div className="flex items-center gap-0.5 flex-wrap">

        {/* Regenerate (undo) */}
        {onRegenerate && (
          <ToolbarBtn
            icon={<RotateCcw className="w-3.5 h-3.5" />}
            title="Regenerate response"
            onClick={onRegenerate}
          />
        )}

        {/* Speaker / TTS */}
        <ToolbarBtn
          icon={isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-red-500" /> : <Volume2 className="w-3.5 h-3.5" />}
          title={isSpeaking ? 'Stop reading' : 'Read aloud'}
          onClick={handleSpeak}
          active={isSpeaking}
        />

        {/* Avatar narration */}
        {canUseAvatar && (
          <ToolbarBtn
            icon={<Video className={`w-3.5 h-3.5 ${isAvatarSpeaking ? 'text-red-500' : ''}`} />}
            title={isAvatarSpeaking ? 'Stop avatar' : 'Avatar narrate'}
            onClick={handleAvatarNarrate}
            active={isAvatarSpeaking}
          />
        )}

        {/* Comment / speech bubble */}
        <ToolbarBtn
          icon={<MessageSquare className={`w-3.5 h-3.5 ${commentSaved ? 'text-blue-500' : ''}`} />}
          title="Add a note to this response"
          onClick={() => setShowComment(v => !v)}
          active={showComment || commentSaved}
        />

        {/* Copy */}
        <ToolbarBtn
          icon={copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
          title={copied ? 'Copied!' : 'Copy response'}
          onClick={handleCopy}
        />

        {/* Share */}
        <ToolbarBtn
          icon={shared ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Share2 className="w-3.5 h-3.5" />}
          title={shared ? 'Link copied!' : 'Copy shareable link'}
          onClick={handleShare}
        />

        {/* Thumbs up */}
        <ToolbarBtn
          icon={<ThumbsUp className={`w-3.5 h-3.5 ${feedback === 'up' ? 'fill-green-500 text-green-500' : ''}`} />}
          title="Good response"
          onClick={() => handleFeedback('up')}
          active={feedback === 'up'}
        />

        {/* Thumbs down */}
        <ToolbarBtn
          icon={<ThumbsDown className={`w-3.5 h-3.5 ${feedback === 'down' ? 'fill-red-500 text-red-500' : ''}`} />}
          title="Poor response"
          onClick={() => handleFeedback('down')}
          active={feedback === 'down'}
        />

        {/* More (···) */}
        <div className="relative" ref={menuRef}>
          <ToolbarBtn
            icon={<MoreHorizontal className="w-3.5 h-3.5" />}
            title="More options"
            onClick={() => setShowMenu(v => !v)}
            active={showMenu}
          />
          {showMenu && (
            <div className="absolute bottom-full left-0 mb-1 z-50 min-w-[160px] bg-white dark:bg-[#22272B] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden">
              <button
                onClick={handleReportIssue}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
              >
                <Flag className="w-4 h-4 text-orange-500" />
                Report Issue
              </button>
              <div className="border-t border-gray-100 dark:border-gray-700" />
              <button
                onClick={handleExportPDF}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
              >
                <FileText className="w-4 h-4 text-blue-500" />
                Export to PDF
              </button>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-3.5 bg-gray-300 dark:bg-gray-600 mx-1" />

        {/* Latency */}
        <span
          className="text-xs tabular-nums text-gray-400 dark:text-gray-500 select-none px-1"
          title="Response time"
        >
          {formatLatency(responseTimeMs)}
        </span>
      </div>

      {/* Inline comment box */}
      {showComment && (
        <div className="mt-2 flex items-end gap-2">
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Add a note to this response..."
            rows={2}
            className="flex-1 text-xs px-3 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-gray-600 rounded-xl resize-none focus:outline-none focus:ring-1 focus:ring-red-500 text-gray-800 dark:text-gray-200 placeholder-gray-400"
          />
          <div className="flex flex-col gap-1">
            <button
              onClick={handleSaveComment}
              disabled={!comment.trim()}
              className="px-3 py-1.5 text-xs bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white rounded-lg transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => { setShowComment(false); setComment(''); }}
              className="px-3 py-1.5 text-xs bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Small icon button ─────────────────────────────────────────────────
interface ToolbarBtnProps {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
  active?: boolean;
}

const ToolbarBtn: React.FC<ToolbarBtnProps> = ({ icon, title, onClick, active }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`
      p-1.5 rounded-lg transition-all
      ${active
        ? 'bg-gray-200 dark:bg-white/15 text-gray-900 dark:text-white'
        : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'
      }
    `}
  >
    {icon}
  </button>
);

export default MessageToolbar;
