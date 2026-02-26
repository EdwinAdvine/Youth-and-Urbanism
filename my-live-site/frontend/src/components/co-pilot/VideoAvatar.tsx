/**
 * VideoAvatar Component
 *
 * Displays the AI agent's avatar in video mode with synchronized audio playback.
 * Provides visual "talking" animation when audio is playing and breathing animation
 * when idle. This is the foundation for future video avatar integrations (Synthesia, D-ID).
 *
 * Features:
 * - Circular avatar frame with agent image
 * - CSS animations for "talking" effect (scale/pulse)
 * - Audio playback synchronized with avatar animation
 * - Fallback to default Bot icon if no avatar set
 * - Responsive design
 */

import React, { useState, useEffect, useRef } from 'react';
import { Bot } from 'lucide-react';

interface VideoAvatarProps {
  /** Agent's avatar image URL */
  avatarUrl?: string | null;
  /** Agent's name for alt text */
  agentName?: string;
  /** Audio URL to play (synced with talking animation) */
  audioUrl?: string | null;
  /** Whether the avatar should be in "listening" state */
  isListening?: boolean;
  /** Custom CSS classes */
  className?: string;
}

export const VideoAvatar: React.FC<VideoAvatarProps> = ({
  avatarUrl,
  agentName = 'AI Assistant',
  audioUrl,
  isListening = false,
  className = '',
}) => {
  const [isTalking, setIsTalking] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Handle audio playback
  useEffect(() => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onloadeddata = () => {
        setAudioError(false);
        audio.play().catch((error) => {
          console.error('Audio playback failed:', error);
          setAudioError(true);
        });
      };

      audio.onplay = () => {
        setIsTalking(true);
      };

      audio.onended = () => {
        setIsTalking(false);
      };

      audio.onerror = () => {
        console.error('Failed to load audio');
        setAudioError(true);
        setIsTalking(false);
      };

      return () => {
        audio.pause();
        audio.src = '';
        audioRef.current = null;
        setIsTalking(false);
      };
    }
  }, [audioUrl]);

  // Determine animation state
  const animationState = isTalking ? 'talking' : isListening ? 'listening' : 'idle';

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Avatar Container */}
      <div className="relative">
        {/* Circular Frame */}
        <div
          className={`
            relative w-32 h-32 rounded-full overflow-hidden
            border-4 shadow-lg transition-all duration-300
            ${
              animationState === 'talking'
                ? 'border-green-500 shadow-green-500/50 animate-talk'
                : animationState === 'listening'
                ? 'border-blue-500 shadow-blue-500/50 animate-pulse'
                : 'border-gray-300 dark:border-gray-700 shadow-gray-500/30 animate-breathe'
            }
          `}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`${agentName}'s avatar`}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to default icon on image load error
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
              <Bot className="w-16 h-16 text-gray-400 dark:text-gray-600" />
            </div>
          )}
        </div>

        {/* Status Indicator */}
        <div
          className={`
            absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white dark:border-gray-900
            transition-colors duration-300
            ${
              animationState === 'talking'
                ? 'bg-green-500 animate-pulse'
                : animationState === 'listening'
                ? 'bg-blue-500 animate-bounce'
                : 'bg-gray-400'
            }
          `}
          aria-label={
            animationState === 'talking'
              ? 'Speaking'
              : animationState === 'listening'
              ? 'Listening'
              : 'Idle'
          }
        />
      </div>

      {/* Agent Name */}
      <div className="mt-3 text-center">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {agentName}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {animationState === 'talking'
            ? 'Speaking...'
            : animationState === 'listening'
            ? 'Listening...'
            : 'Ready'}
        </p>
      </div>

      {/* Audio Error Message */}
      {audioError && (
        <p className="mt-2 text-xs text-red-500 text-center">
          Audio playback failed. Please check your connection.
        </p>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes talk {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes breathe {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.02);
            opacity: 0.95;
          }
        }

        .animate-talk {
          animation: talk 0.5s ease-in-out infinite;
        }

        .animate-breathe {
          animation: breathe 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
