/**
 * AvatarFloatingPanel — the main avatar display component.
 *
 * Three modes:
 * - PiP: draggable floating panel (~300x300px)
 * - Docked: fixed sidebar on the right (320px, full height)
 * - Fullscreen: immersive full-viewport view
 *
 * Rendered in a React Portal so it escapes layout constraints.
 */

import React, { lazy, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Minus,
  Maximize2,
  Minimize2,
  PanelRightOpen,
  Monitor,
  Volume2,
  Pause,
  Play,
  GripVertical,
  RefreshCw,
} from 'lucide-react';

import { useAvatarStore } from '../../store/avatarStore';
import { useAvatarPanel } from '../../hooks/useAvatarPanel';
import { useAvatarLipSync } from '../../hooks/useAvatarLipSync';

const AvatarCanvas = lazy(() => import('./AvatarCanvas'));

const AvatarFloatingPanel: React.FC = () => {
  const avatarMode = useAvatarStore((s) => s.avatarMode);
  const activeAvatar = useAvatarStore((s) => s.activeAvatar);
  const isAvatarSpeaking = useAvatarStore((s) => s.isAvatarSpeaking);
  const panelPosition = useAvatarStore((s) => s.panelPosition);
  const webglTier = useAvatarStore((s) => s.webglTier);

  const { panelRef, onDragStart, mode, setMode, isMinimized, toggleMinimize, close } =
    useAvatarPanel();
  const { stopNarration, isActive } = useAvatarLipSync();

  if (avatarMode === 'hidden' || !activeAvatar || webglTier === 'none') {
    return null;
  }

  const panel = (
    <AnimatePresence mode="wait">
      {mode === 'pip' && (
        <motion.div
          key="pip"
          ref={panelRef}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.25 }}
          className="fixed z-50 rounded-2xl overflow-hidden shadow-2xl border border-[#22272B] bg-gradient-to-br from-[#0F1112] to-[#181C1F]"
          style={{
            left: panelPosition.x,
            top: panelPosition.y,
            width: isMinimized ? 200 : 300,
            height: isMinimized ? 48 : 320,
          }}
        >
          {/* Header / Drag Handle */}
          <div
            className="flex items-center justify-between px-3 py-2 cursor-grab active:cursor-grabbing bg-[#1a1e22] border-b border-[#22272B]"
            onPointerDown={onDragStart}
          >
            <div className="flex items-center gap-2">
              <GripVertical size={14} className="text-gray-500" />
              <span className="text-xs text-gray-300 font-medium truncate max-w-[100px]">
                {activeAvatar.name}
              </span>
              {isAvatarSpeaking && (
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={toggleMinimize}
                className="p-1 hover:bg-[#22272B] rounded text-gray-400 hover:text-white transition-colors"
              >
                <Minus size={12} />
              </button>
              <button
                onClick={() => setMode('docked')}
                className="p-1 hover:bg-[#22272B] rounded text-gray-400 hover:text-white transition-colors"
              >
                <PanelRightOpen size={12} />
              </button>
              <button
                onClick={() => setMode('fullscreen')}
                className="p-1 hover:bg-[#22272B] rounded text-gray-400 hover:text-white transition-colors"
              >
                <Maximize2 size={12} />
              </button>
              <button
                onClick={close}
                className="p-1 hover:bg-red-900/50 rounded text-gray-400 hover:text-red-400 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          </div>

          {/* 3D Canvas */}
          {!isMinimized && (
            <>
              <div className="w-full" style={{ height: 230 }}>
                <Suspense
                  fallback={
                    <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                      Loading avatar...
                    </div>
                  }
                >
                  <AvatarCanvas
                    modelUrl={activeAvatar.model_url}
                    animate={isAvatarSpeaking}
                    width="100%"
                    height="100%"
                  />
                </Suspense>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-3 px-3 py-2 border-t border-[#22272B]">
                <button
                  onClick={() => (isActive ? stopNarration() : null)}
                  className="p-1.5 hover:bg-[#22272B] rounded text-gray-400 hover:text-white transition-colors"
                  title={isActive ? 'Pause' : 'Play'}
                >
                  {isActive ? <Pause size={14} /> : <Play size={14} />}
                </button>
                <button className="p-1.5 hover:bg-[#22272B] rounded text-gray-400 hover:text-white transition-colors">
                  <Volume2 size={14} />
                </button>
              </div>
            </>
          )}
        </motion.div>
      )}

      {mode === 'docked' && (
        <motion.aside
          key="docked"
          initial={{ x: 320 }}
          animate={{ x: 0 }}
          exit={{ x: 320 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed right-0 top-16 lg:top-20 bottom-0 z-50 w-80 bg-gradient-to-br from-[#0F1112] to-[#181C1F] border-l border-[#22272B] shadow-[-8px_0_25px_rgba(0,0,0,0.3)] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#22272B]">
            <div className="flex items-center gap-2">
              <span className="text-sm text-white font-semibold">
                {activeAvatar.name}
              </span>
              {isAvatarSpeaking && (
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMode('pip')}
                className="p-1.5 hover:bg-[#22272B] rounded text-gray-400 hover:text-white transition-colors"
                title="Picture-in-Picture"
              >
                <Minimize2 size={14} />
              </button>
              <button
                onClick={() => setMode('fullscreen')}
                className="p-1.5 hover:bg-[#22272B] rounded text-gray-400 hover:text-white transition-colors"
                title="Fullscreen"
              >
                <Monitor size={14} />
              </button>
              <button
                onClick={close}
                className="p-1.5 hover:bg-red-900/50 rounded text-gray-400 hover:text-red-400 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* 3D Canvas */}
          <div className="flex-1 min-h-0">
            <Suspense
              fallback={
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  Loading...
                </div>
              }
            >
              <AvatarCanvas
                modelUrl={activeAvatar.model_url}
                animate={isAvatarSpeaking}
                enableControls
                width="100%"
                height="100%"
              />
            </Suspense>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 px-4 py-3 border-t border-[#22272B]">
            <button
              onClick={() => (isActive ? stopNarration() : null)}
              className="p-2 hover:bg-[#22272B] rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              {isActive ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button className="p-2 hover:bg-[#22272B] rounded-lg text-gray-400 hover:text-white transition-colors">
              <Volume2 size={16} />
            </button>
            <button className="p-2 hover:bg-[#22272B] rounded-lg text-gray-400 hover:text-white transition-colors">
              <RefreshCw size={16} />
            </button>
          </div>
        </motion.aside>
      )}

      {mode === 'fullscreen' && (
        <motion.div
          key="fullscreen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[60] bg-[#0F1112] flex flex-col"
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-[#22272B]">
            <span className="text-white font-semibold">{activeAvatar.name}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMode('pip')}
                className="px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-[#22272B] rounded-lg transition-colors"
              >
                PiP
              </button>
              <button
                onClick={() => setMode('docked')}
                className="px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-[#22272B] rounded-lg transition-colors"
              >
                Dock
              </button>
              <button
                onClick={close}
                className="p-2 hover:bg-red-900/50 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Full canvas */}
          <div className="flex-1 min-h-0">
            <Suspense
              fallback={
                <div className="w-full h-full flex items-center justify-center text-gray-500 text-lg">
                  Loading avatar...
                </div>
              }
            >
              <AvatarCanvas
                modelUrl={activeAvatar.model_url}
                animate={isAvatarSpeaking}
                enableControls
                width="100%"
                height="100%"
              />
            </Suspense>
          </div>

          {/* Bottom controls */}
          <div className="flex items-center justify-center gap-6 px-6 py-4 border-t border-[#22272B]">
            <button
              onClick={() => (isActive ? stopNarration() : null)}
              className="p-3 hover:bg-[#22272B] rounded-xl text-gray-400 hover:text-white transition-colors"
            >
              {isActive ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button className="p-3 hover:bg-[#22272B] rounded-xl text-gray-400 hover:text-white transition-colors">
              <Volume2 size={20} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(panel, document.body);
};

export default AvatarFloatingPanel;
