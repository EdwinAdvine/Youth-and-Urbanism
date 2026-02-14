import React, { useEffect, useRef, useState } from 'react';
import { useCoPilotStore } from '../../store';

interface CoPilotPerformanceProps {
  isExpanded: boolean;
}

const CoPilotPerformance: React.FC<CoPilotPerformanceProps> = ({ isExpanded }) => {
  const [isLowEndDevice, setIsLowEndDevice] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const animationFrameRef = useRef<number>();
  const lastScrollY = useRef(0);

  // Device capability detection
  useEffect(() => {
    const checkDeviceCapabilities = () => {
      // Check for low-end device indicators
      const memory = (navigator as any).deviceMemory;
      const connection = (navigator as any).connection;
      
      // Low-end device criteria
      const isLowMemory = memory && memory < 4;
      const isSlowConnection = connection && (
        connection.effectiveType === 'slow-2g' || 
        connection.effectiveType === '2g' || 
        connection.effectiveType === '3g'
      );
      const isLowCPU = !window.matchMedia('(min-width: 1024px)').matches;

      const isLowEnd = isLowMemory || isSlowConnection || isLowCPU;
      setIsLowEndDevice(isLowEnd);

      // Apply performance optimizations
      if (isLowEnd) {
        document.documentElement.classList.add('co-pilot-low-end');
        // Reduce animation complexity
        document.documentElement.style.setProperty('--animation-duration', '150ms');
        // Disable heavy shadows
        document.documentElement.style.setProperty('--shadow-strength', '0px');
      } else {
        document.documentElement.classList.remove('co-pilot-low-end');
        document.documentElement.style.setProperty('--animation-duration', '300ms');
        document.documentElement.style.setProperty('--shadow-strength', '8px');
      }
    };

    checkDeviceCapabilities();
    window.addEventListener('resize', checkDeviceCapabilities);
    return () => window.removeEventListener('resize', checkDeviceCapabilities);
  }, []);

  // Reduced motion detection
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
      if (e.matches) {
        document.documentElement.style.setProperty('--animation-duration', '0ms');
      } else {
        document.documentElement.style.setProperty('--animation-duration', '300ms');
      }
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Virtualization for long lists
  useEffect(() => {
    if (!isExpanded) return;

    const optimizeScrolling = () => {
      const sidebar = document.querySelector('.co-pilot-sidebar');
      if (!sidebar) return;

      const handleScroll = () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }

        animationFrameRef.current = requestAnimationFrame(() => {
          // Throttle scroll events for performance
          const scrollTop = sidebar.scrollTop;
          const scrollHeight = sidebar.scrollHeight;
          const clientHeight = sidebar.clientHeight;

          // Lazy load content based on scroll position
          if (scrollTop + clientHeight >= scrollHeight - 100) {
            // Near bottom - could trigger loading more content
          }

          lastScrollY.current = scrollTop;
        });
      };

      sidebar.addEventListener('scroll', handleScroll, { passive: true });
      return () => sidebar.removeEventListener('scroll', handleScroll);
    };

    const cleanup = optimizeScrolling();
    return cleanup;
  }, [isExpanded]);

  // Memory management
  useEffect(() => {
    const cleanup = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };

    return cleanup;
  }, []);

  // Performance monitoring
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'measure' && entry.name.includes('co-pilot')) {
            console.log(`Co-Pilot Performance: ${entry.name} - ${entry.duration.toFixed(2)}ms`);
          }
        }
      });

      observer.observe({ entryTypes: ['measure'] });
      return () => observer.disconnect();
    }
  }, []);

  return (
    <>
      {/* Performance indicators for debugging */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-20 left-4 bg-black/50 text-gray-900 dark:text-white p-2 rounded text-xs z-50">
          <div>Device: {isLowEndDevice ? 'Low-end' : 'Standard'}</div>
          <div>Motion: {isReducedMotion ? 'Reduced' : 'Normal'}</div>
          <div>Status: {isExpanded ? 'Expanded' : 'Retracted'}</div>
        </div>
      )}

      {/* CSS-in-JS for performance optimizations */}
      <style>
        {`
          /* Low-end device optimizations */
          .co-pilot-low-end .co-pilot-sidebar {
            will-change: auto;
            transform: none !important;
          }
          
          .co-pilot-low-end .co-pilot-sidebar button {
            transition: none !important;
          }
          
          .co-pilot-low-end .co-pilot-sidebar .message-bubble {
            animation: none !important;
          }
          
          /* Reduced motion optimizations */
          @media (prefers-reduced-motion: reduce) {
            .co-pilot-sidebar * {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }
          
          /* Scroll performance */
          .co-pilot-sidebar {
            overflow-anchor: none;
          }
          
          .co-pilot-sidebar .scroll-container {
            contain: strict;
          }
          
          /* Image optimization */
          .co-pilot-sidebar img {
            image-rendering: -webkit-optimize-contrast;
          }
        `}
      </style>
    </>
  );
};

export default CoPilotPerformance;