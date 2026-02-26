/**
 * Platform detection utilities for Tauri desktop/mobile vs browser.
 * Use these to gate platform-specific behaviour.
 */

declare global {
  interface Window {
    __TAURI_INTERNALS__?: unknown;
  }
}

export const isTauri = (): boolean =>
  typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

export type Platform = 'web' | 'desktop' | 'android' | 'ios';

export const getPlatform = (): Platform => {
  if (!isTauri()) return 'web';
  // TAURI_ENV_PLATFORM is a string injected by Tauri CLI at build time
  // It's available as a global constant in Tauri builds
  const p: string | undefined =
    typeof (globalThis as Record<string, unknown>)['__TAURI_ENV_PLATFORM__'] === 'string'
      ? (globalThis as Record<string, unknown>)['__TAURI_ENV_PLATFORM__'] as string
      : undefined;
  if (p === 'android') return 'android';
  if (p === 'ios') return 'ios';
  return 'desktop';
};

export const isMobile = (): boolean =>
  ['android', 'ios'].includes(getPlatform());

export const isDesktop = (): boolean => getPlatform() === 'desktop';

export const isWeb = (): boolean => getPlatform() === 'web';
