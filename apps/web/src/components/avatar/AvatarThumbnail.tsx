/**
 * AvatarThumbnail — small static avatar preview.
 *
 * Shows the avatar thumbnail image (not a live 3D render) for use in
 * chat messages, CoPilot sidebar header, etc. Falls back to the bird
 * emoji if no thumbnail is available.
 */

import React from 'react';
import { useAvatarStore } from '../../store/avatarStore';

interface AvatarThumbnailProps {
  size?: number;
  className?: string;
  fallbackEmoji?: string;
}

const AvatarThumbnail: React.FC<AvatarThumbnailProps> = ({
  size = 32,
  className = '',
  fallbackEmoji = '\uD83D\uDC26', // bird emoji
}) => {
  const activeAvatar = useAvatarStore((s) => s.activeAvatar);
  const webglTier = useAvatarStore((s) => s.webglTier);

  if (!activeAvatar || webglTier === 'none') {
    return (
      <span
        className={`inline-flex items-center justify-center ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.6 }}
      >
        {fallbackEmoji}
      </span>
    );
  }

  if (activeAvatar.thumbnail_url) {
    return (
      <img
        src={activeAvatar.thumbnail_url}
        alt={activeAvatar.name}
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  // Fallback: first letter of avatar name
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-700 text-white font-bold ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.45 }}
    >
      {activeAvatar.name.charAt(0)}
    </span>
  );
};

export default AvatarThumbnail;
