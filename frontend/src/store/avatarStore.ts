/**
 * Zustand store for 3D avatar state management.
 *
 * Persisted fields: activeAvatar, avatarMode, panelPosition, panelSize.
 * Transient fields: animation state, WebGL detection, data caches.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AvatarPanelMode,
  AvatarPreset,
  UserAvatar,
  WebGLTier,
} from '../types/avatar';
import avatarService from '../services/avatarService';

interface AvatarState {
  /* ── persisted ─────────────────────────────────────────────────── */
  activeAvatar: UserAvatar | null;
  avatarMode: AvatarPanelMode;
  panelPosition: { x: number; y: number };
  panelSize: { width: number; height: number };

  /* ── transient ─────────────────────────────────────────────────── */
  isAvatarSpeaking: boolean;
  currentGesture: string | null;
  currentViseme: number;
  webglTier: WebGLTier;
  userAvatars: UserAvatar[];
  presetAvatars: AvatarPreset[];
  isLoadingAvatars: boolean;

  /* ── actions ───────────────────────────────────────────────────── */
  setActiveAvatar: (avatar: UserAvatar | null) => void;
  setAvatarMode: (mode: AvatarPanelMode) => void;
  setPanelPosition: (pos: { x: number; y: number }) => void;
  setPanelSize: (size: { width: number; height: number }) => void;
  setIsAvatarSpeaking: (speaking: boolean) => void;
  setCurrentGesture: (gesture: string | null) => void;
  setCurrentViseme: (viseme: number) => void;
  checkWebGLSupport: () => void;
  loadUserAvatars: () => Promise<void>;
  loadPresetAvatars: () => Promise<void>;
  showAvatarPanel: () => void;
  hideAvatarPanel: () => void;
}

export const useAvatarStore = create<AvatarState>()(
  persist(
    (set, get) => ({
      /* defaults */
      activeAvatar: null,
      avatarMode: 'hidden',
      panelPosition: { x: window.innerWidth - 340, y: 80 },
      panelSize: { width: 300, height: 300 },

      isAvatarSpeaking: false,
      currentGesture: null,
      currentViseme: 0,
      webglTier: 'none',
      userAvatars: [],
      presetAvatars: [],
      isLoadingAvatars: false,

      /* actions */
      setActiveAvatar: (avatar) => {
        set({ activeAvatar: avatar });
        // Signal service worker to proactively cache the model file
        if (avatar?.model_url && 'serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'CACHE_AVATAR_MODEL',
            url: avatar.model_url,
          });
        }
      },
      setAvatarMode: (mode) => set({ avatarMode: mode }),
      setPanelPosition: (pos) => set({ panelPosition: pos }),
      setPanelSize: (size) => set({ panelSize: size }),
      setIsAvatarSpeaking: (speaking) => set({ isAvatarSpeaking: speaking }),
      setCurrentGesture: (gesture) => set({ currentGesture: gesture }),
      setCurrentViseme: (viseme) => set({ currentViseme: viseme }),

      checkWebGLSupport: () => {
        try {
          const canvas = document.createElement('canvas');
          const gl =
            canvas.getContext('webgl2') || canvas.getContext('webgl');
          if (!gl) {
            set({ webglTier: 'none' });
            return;
          }
          const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
          const renderer = debugInfo
            ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
            : '';
          // Basic heuristic: if the renderer string contains "SwiftShader"
          // or similar software renderers, mark as limited.
          const isLimited =
            /swiftshader|llvmpipe|mesa/i.test(renderer) ||
            gl.getParameter(gl.MAX_TEXTURE_SIZE) < 4096;
          set({ webglTier: isLimited ? 'limited' : 'full' });
        } catch {
          set({ webglTier: 'none' });
        }
      },

      loadUserAvatars: async () => {
        set({ isLoadingAvatars: true });
        try {
          const avatars = await avatarService.getMyAvatars();
          const active = avatars.find((a) => a.is_active) ?? null;
          set({ userAvatars: avatars, activeAvatar: active });
        } catch {
          /* silently fail — avatars are optional */
        } finally {
          set({ isLoadingAvatars: false });
        }
      },

      loadPresetAvatars: async () => {
        try {
          const presets = await avatarService.getPresets();
          set({ presetAvatars: presets });
        } catch {
          /* silently fail */
        }
      },

      showAvatarPanel: () => {
        const { activeAvatar, webglTier } = get();
        if (!activeAvatar || webglTier === 'none') return;
        set({ avatarMode: 'pip' });
      },

      hideAvatarPanel: () => {
        set({ avatarMode: 'hidden', isAvatarSpeaking: false });
      },
    }),
    {
      name: 'avatar-storage',
      partialize: (state) => ({
        activeAvatar: state.activeAvatar,
        avatarMode: state.avatarMode,
        panelPosition: state.panelPosition,
        panelSize: state.panelSize,
      }),
    }
  )
);
