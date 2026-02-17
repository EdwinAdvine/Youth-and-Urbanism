import React from 'react';
import { ChevronUp } from 'lucide-react';
import { useScrollPosition } from '../../hooks/useScrollPosition';

/**
 * Floating scroll-to-top button that appears when user scrolls down
 * Features:
 * - Appears after scrolling 300px down
 * - Smooth fade-in/fade-out animation
 * - Fixed position in bottom-right corner
 * - Dark mode support
 * - Accessibility features (ARIA labels, keyboard support)
 * - Respects prefers-reduced-motion
 */
const ScrollToTopButton: React.FC = () => {
  const isVisible = useScrollPosition(300);

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      onClick={handleScrollToTop}
      aria-label="Scroll to top"
      className={`
        fixed bottom-6 right-6 md:bottom-8 md:right-8
        w-12 h-12 rounded-full
        bg-copilot-blue-500 dark:bg-copilot-blue-600
        hover:bg-copilot-blue-600 dark:hover:bg-copilot-blue-700
        text-white
        shadow-lg hover:shadow-xl
        dark:shadow-copilot-blue-900/50
        z-50
        transition-all duration-300 ease-in-out
        transform hover:scale-110 active:scale-95
        focus:outline-none focus:ring-2 focus:ring-copilot-blue-500 focus:ring-offset-2
        dark:focus:ring-offset-[#0F1112]
        ${
          isVisible
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }
        motion-reduce:transition-none motion-reduce:transform-none
      `}
      disabled={!isVisible}
    >
      <ChevronUp className="w-6 h-6 mx-auto" strokeWidth={2.5} />
    </button>
  );
};

export default React.memo(ScrollToTopButton);
