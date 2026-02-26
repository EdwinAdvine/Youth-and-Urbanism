import { useState, useEffect } from 'react';

/**
 * Custom hook to track scroll position and determine button visibility
 * @param threshold - Scroll position threshold in pixels (default: 300px)
 * @returns boolean indicating if scroll position is past threshold
 */
export const useScrollPosition = (threshold: number = 300): boolean => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleScroll = () => {
      // Clear previous timeout to debounce
      clearTimeout(timeoutId);

      // Set new timeout with 100ms delay
      timeoutId = setTimeout(() => {
        // Use Math.max to handle negative scroll values (Mobile Safari bounce)
        const scrollY = Math.max(0, window.scrollY);
        setIsVisible(scrollY > threshold);
      }, 100);
    };

    // Add scroll listener with passive option for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Check initial scroll position
    handleScroll();

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [threshold]);

  return isVisible;
};
