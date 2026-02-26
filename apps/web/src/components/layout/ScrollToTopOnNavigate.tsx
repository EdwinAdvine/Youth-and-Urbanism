import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Utility component that automatically scrolls to top when route changes
 *
 * Features:
 * - Triggers on pathname changes (ignores hash/query changes)
 * - Instant scroll (no smooth behavior for auto-navigation)
 * - No UI rendering (utility component)
 *
 * Usage: Place inside Router component, before Routes
 */
const ScrollToTopOnNavigate: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top instantly when route pathname changes
    window.scrollTo(0, 0);
  }, [pathname]);

  // This component renders nothing
  return null;
};

export default ScrollToTopOnNavigate;
