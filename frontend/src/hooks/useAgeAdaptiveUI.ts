import { useMemo } from 'react';
import { useAuthStore } from '../store/authStore';
import type { AgeGroup } from '../types/student';

/**
 * Hook that determines the appropriate age group for UI adaptation
 * based on the student's grade level or manual preference override
 */
export const useAgeAdaptiveUI = (): {
  ageGroup: AgeGroup;
  fontSize: string;
  borderRadius: string;
  animationIntensity: 'high' | 'medium' | 'low';
  useEmojis: boolean;
  useGamification: boolean;
} => {
  const { user } = useAuthStore();

  // CBC Grade level to age mapping
  const getAgeGroupFromGrade = (grade?: string): AgeGroup => {
    if (!grade) return 'tween'; // Default

    const gradeNum = parseInt(grade.replace(/\D/g, ''));

    if (gradeNum >= 1 && gradeNum <= 3) return 'young'; // Grade 1-3 (ages 6-9)
    if (gradeNum >= 4 && gradeNum <= 6) return 'tween'; // Grade 4-6 (ages 10-12)
    if (gradeNum >= 7) return 'teen'; // Grade 7+ (ages 13-17)

    return 'tween';
  };

  // Check if user has manual age UI preference override
  const ageGroup: AgeGroup = useMemo(() => {
    // Check for manual override in user preferences
    if (user?.preferences?.ageUiMode) {
      return user.preferences.ageUiMode as AgeGroup;
    }

    // Fall back to grade-based detection
    // Assuming student profile has grade_level field
    const studentProfile = (user as any)?.student_profile;
    if (studentProfile?.grade_level) {
      return getAgeGroupFromGrade(studentProfile.grade_level);
    }

    // Default to tween if no info available
    return 'tween';
  }, [user]);

  // Return age-appropriate UI settings
  const uiSettings = useMemo(() => {
    switch (ageGroup) {
      case 'young':
        return {
          ageGroup,
          fontSize: 'text-base lg:text-lg', // Larger text
          borderRadius: 'rounded-2xl', // Very rounded
          animationIntensity: 'high' as const,
          useEmojis: true,
          useGamification: true,
        };

      case 'tween':
        return {
          ageGroup,
          fontSize: 'text-sm lg:text-base', // Medium text
          borderRadius: 'rounded-xl', // Moderately rounded
          animationIntensity: 'medium' as const,
          useEmojis: true,
          useGamification: true,
        };

      case 'teen':
        return {
          ageGroup,
          fontSize: 'text-sm', // Standard text
          borderRadius: 'rounded-lg', // Slightly rounded
          animationIntensity: 'low' as const,
          useEmojis: false,
          useGamification: true, // Still gamified but more subtle
        };

      default:
        return {
          ageGroup: 'tween' as AgeGroup,
          fontSize: 'text-sm lg:text-base',
          borderRadius: 'rounded-xl',
          animationIntensity: 'medium' as const,
          useEmojis: true,
          useGamification: true,
        };
    }
  }, [ageGroup]);

  return uiSettings;
};
