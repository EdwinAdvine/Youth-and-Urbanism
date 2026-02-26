/**
 * Hook for managing the floating avatar panel.
 *
 * Handles dragging (PiP mode), mode transitions, resize, and minimize.
 */

import { useCallback, useRef, useState } from 'react';
import { useAvatarStore } from '../store/avatarStore';
import type { AvatarPanelMode } from '../types/avatar';

interface PanelControls {
  panelRef: React.RefObject<HTMLDivElement>;
  /** Pointer-down handler for the drag handle. */
  onDragStart: (e: React.PointerEvent) => void;
  mode: AvatarPanelMode;
  setMode: (mode: AvatarPanelMode) => void;
  isMinimized: boolean;
  toggleMinimize: () => void;
  close: () => void;
}

export function useAvatarPanel(): PanelControls {
  const panelRef = useRef<HTMLDivElement>(null!);
  const [isMinimized, setIsMinimized] = useState(false);

  const mode = useAvatarStore((s) => s.avatarMode);
  const setAvatarMode = useAvatarStore((s) => s.setAvatarMode);
  const setPanelPosition = useAvatarStore((s) => s.setPanelPosition);
  const hidePanel = useAvatarStore((s) => s.hideAvatarPanel);

  const dragOffsetRef = useRef({ x: 0, y: 0 });

  const onDragStart = useCallback(
    (e: React.PointerEvent) => {
      if (mode !== 'pip') return;
      e.preventDefault();

      const panel = panelRef.current;
      if (!panel) return;

      const rect = panel.getBoundingClientRect();
      dragOffsetRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      const onMove = (ev: PointerEvent) => {
        const x = Math.max(0, Math.min(ev.clientX - dragOffsetRef.current.x, window.innerWidth - rect.width));
        const y = Math.max(0, Math.min(ev.clientY - dragOffsetRef.current.y, window.innerHeight - rect.height));
        setPanelPosition({ x, y });
        if (panel) {
          panel.style.left = `${x}px`;
          panel.style.top = `${y}px`;
        }
      };

      const onUp = () => {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
      };

      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
    },
    [mode, setPanelPosition]
  );

  const setMode = useCallback(
    (newMode: AvatarPanelMode) => {
      setIsMinimized(false);
      setAvatarMode(newMode);
    },
    [setAvatarMode]
  );

  const toggleMinimize = useCallback(() => {
    setIsMinimized((prev) => !prev);
  }, []);

  const close = useCallback(() => {
    setIsMinimized(false);
    hidePanel();
  }, [hidePanel]);

  return { panelRef, onDragStart, mode, setMode, isMinimized, toggleMinimize, close };
}
