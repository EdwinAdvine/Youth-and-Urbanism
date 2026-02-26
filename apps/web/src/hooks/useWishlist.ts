/**
 * useWishlist — manages the student's wishlist state across course listings.
 *
 * Fetches the set of wishlisted course IDs on first use. Provides
 * toggleWishlist() to add/remove a course, with grade-mismatch error handling.
 */
import { useState, useEffect, useCallback } from 'react';
import {
  getWishlistIds,
  addToWishlist,
  removeFromWishlist,
} from '../services/student/studentLearningService';
import { useAuthStore } from '../store/authStore';

interface WishlistHook {
  wishlistedIds: Set<string>;
  isWishlisted: (courseId: string) => boolean;
  toggleWishlist: (courseId: string) => Promise<{ success: boolean; error?: string }>;
  loading: boolean;
}

export const useWishlist = (): WishlistHook => {
  const { user } = useAuthStore();
  const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // Only fetch if the current user is a student
  useEffect(() => {
    if (user?.role !== 'student') return;

    let cancelled = false;
    setLoading(true);
    getWishlistIds()
      .then((ids) => {
        if (!cancelled) setWishlistedIds(new Set(ids));
      })
      .catch(() => {
        // Non-critical — heart icons simply default to un-filled
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [user?.role]);

  const isWishlisted = useCallback(
    (courseId: string) => wishlistedIds.has(courseId),
    [wishlistedIds],
  );

  const toggleWishlist = useCallback(
    async (courseId: string): Promise<{ success: boolean; error?: string }> => {
      const alreadyIn = wishlistedIds.has(courseId);

      // Optimistic UI update
      setWishlistedIds((prev) => {
        const next = new Set(prev);
        if (alreadyIn) next.delete(courseId);
        else next.add(courseId);
        return next;
      });

      try {
        if (alreadyIn) {
          await removeFromWishlist(courseId);
        } else {
          await addToWishlist(courseId);
        }
        return { success: true };
      } catch (err: unknown) {
        // Roll back optimistic update
        setWishlistedIds((prev) => {
          const next = new Set(prev);
          if (alreadyIn) next.add(courseId);
          else next.delete(courseId);
          return next;
        });

        // Extract API error message
        const axiosErr = err as { response?: { data?: { detail?: string } }; message?: string };
        const detail =
          axiosErr?.response?.data?.detail ||
          axiosErr?.message ||
          'Failed to update wishlist';

        return { success: false, error: detail };
      }
    },
    [wishlistedIds],
  );

  return { wishlistedIds, isWishlisted, toggleWishlist, loading };
};
