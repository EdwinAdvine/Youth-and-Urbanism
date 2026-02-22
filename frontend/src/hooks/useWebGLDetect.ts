/**
 * Hook to detect WebGL capability tier.
 *
 * Returns 'full' | 'limited' | 'none' so components can progressively
 * degrade from 3D avatar to emoji fallback.
 */

import { useEffect } from 'react';
import { useAvatarStore } from '../store/avatarStore';
import type { WebGLTier } from '../types/avatar';

export function useWebGLDetect(): WebGLTier {
  const tier = useAvatarStore((s) => s.webglTier);
  const check = useAvatarStore((s) => s.checkWebGLSupport);

  useEffect(() => {
    check();
  }, [check]);

  return tier;
}
