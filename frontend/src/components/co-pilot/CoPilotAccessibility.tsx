import React, { useEffect, useRef } from 'react';

interface CoPilotAccessibilityProps {
  isExpanded: boolean;
  activeRole: string;
}

const CoPilotAccessibility: React.FC<CoPilotAccessibilityProps> = ({ isExpanded, activeRole }) => {
  const lastAnnouncementRef = useRef<string>('');

  // Screen reader announcements
  useEffect(() => {
    if (isExpanded) {
      const announcement = `AI Co-Pilot opened for ${activeRole} mode. Use Tab to navigate, Enter to activate buttons, and Escape to close.`;
      if (announcement !== lastAnnouncementRef.current) {
        lastAnnouncementRef.current = announcement;
        // Use aria-live region for screen reader announcements
        const liveRegion = document.getElementById('co-pilot-live-region');
        if (liveRegion) {
          liveRegion.textContent = announcement;
        }
      }
    }
  }, [isExpanded, activeRole]);

  // Keyboard navigation handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key to close sidebar
      if (e.key === 'Escape' && isExpanded) {
        const toggleButton = document.querySelector('[aria-label="Close Co-Pilot"]');
        if (toggleButton) {
          (toggleButton as HTMLElement).click();
        }
      }
      
      // Tab navigation enhancement
      if (e.key === 'Tab' && isExpanded) {
        const focusableElements = document.querySelectorAll(
          '.co-pilot-sidebar button, .co-pilot-sidebar input, .co-pilot-sidebar [tabindex="0"]'
        );
        
        if (focusableElements.length > 0) {
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
          
          // Implement focus trapping
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    if (isExpanded) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isExpanded]);

  // Reduced motion support
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleReducedMotion = (e: MediaQueryListEvent) => {
      if (e.matches) {
        // Apply reduced motion styles
        document.documentElement.style.setProperty('--animation-duration', '0ms');
      } else {
        // Restore normal animation
        document.documentElement.style.setProperty('--animation-duration', '300ms');
      }
    };

    if (mediaQuery.matches) {
      document.documentElement.style.setProperty('--animation-duration', '0ms');
    }

    mediaQuery.addEventListener('change', handleReducedMotion);
    return () => mediaQuery.removeEventListener('change', handleReducedMotion);
  }, []);

  return (
    <>
      {/* Screen reader live region */}
      <div
        id="co-pilot-live-region"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        style={{ position: 'absolute', left: '-9999px' }}
      />
      
      {/* High contrast mode detection */}
      <style>
        {`
          @media (prefers-contrast: high) {
            .co-pilot-sidebar {
              filter: contrast(1.5);
            }
            .co-pilot-sidebar button {
              border: 2px solid currentColor;
            }
          }
          
          @media (prefers-color-scheme: dark) {
            .co-pilot-sidebar {
              filter: brightness(1.1);
            }
          }
        `}
      </style>
    </>
  );
};

export default CoPilotAccessibility;