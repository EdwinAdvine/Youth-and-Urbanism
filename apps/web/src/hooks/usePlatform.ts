import { isTauri, getPlatform, isMobile, isDesktop, isWeb } from '@uhs/config'

/**
 * Returns the current runtime platform info.
 * Safe to call at render-time (no async needed).
 *
 * Usage:
 *   const { platform, isMobile, isDesktop, isTauri } = usePlatform()
 */
export function usePlatform() {
  const platform = getPlatform()

  return {
    platform,         // 'web' | 'desktop' | 'android' | 'ios'
    isTauri: isTauri(),
    isMobile: isMobile(),
    isDesktop: isDesktop(),
    isWeb: isWeb(),
    isAndroid: platform === 'android',
    isIOS: platform === 'ios',
  }
}
