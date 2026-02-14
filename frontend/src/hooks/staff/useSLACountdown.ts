/**
 * SLA Countdown Hook
 *
 * Provides a real-time countdown timer for SLA deadlines on tickets.
 * Updates every second and calculates severity levels based on
 * the percentage of time remaining.
 */

import { useState, useEffect, useRef, useMemo } from 'react';

interface SLACountdownResult {
  /** Remaining time in seconds (negative when breached) */
  timeRemaining: number;
  /** Human-readable formatted time string (e.g. "2h 15m", "45m", "BREACHED") */
  formattedTime: string;
  /** Whether the SLA deadline has been breached */
  isBreached: boolean;
  /** Whether less than 25% of the total time remains */
  isAtRisk: boolean;
  /** Severity classification based on remaining time percentage */
  severity: 'normal' | 'warning' | 'critical' | 'breached';
  /** Percentage of total time remaining (0-100) */
  percentRemaining: number;
}

const BREACHED_RESULT: SLACountdownResult = {
  timeRemaining: 0,
  formattedTime: 'BREACHED',
  isBreached: true,
  isAtRisk: true,
  severity: 'breached',
  percentRemaining: 0,
};

const NULL_RESULT: SLACountdownResult = {
  timeRemaining: 0,
  formattedTime: '--',
  isBreached: false,
  isAtRisk: false,
  severity: 'normal',
  percentRemaining: 100,
};

/**
 * Formats seconds into a human-readable string.
 * Examples: "2h 15m", "45m", "3m 20s", "< 1m"
 */
function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return 'BREACHED';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }

  if (minutes > 0) {
    return minutes < 5 && secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`;
  }

  if (secs > 0) {
    return `< 1m`;
  }

  return 'BREACHED';
}

/**
 * Determines severity level based on percentage of time remaining.
 * - breached: 0% or less
 * - critical: less than 10%
 * - warning: less than 25%
 * - normal: 25% or more
 */
function getSeverity(percentRemaining: number): SLACountdownResult['severity'] {
  if (percentRemaining <= 0) return 'breached';
  if (percentRemaining < 10) return 'critical';
  if (percentRemaining < 25) return 'warning';
  return 'normal';
}

export function useSLACountdown(
  deadline: string | Date | null,
  totalMinutes?: number
): SLACountdownResult {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const deadlineMs = useMemo(() => {
    if (!deadline) return null;
    try {
      const date = deadline instanceof Date ? deadline : new Date(deadline);
      if (isNaN(date.getTime())) return null;
      return date.getTime();
    } catch {
      return null;
    }
  }, [deadline]);

  const totalSeconds = useMemo(() => {
    if (totalMinutes && totalMinutes > 0) {
      return totalMinutes * 60;
    }
    return null;
  }, [totalMinutes]);

  useEffect(() => {
    if (deadlineMs === null) {
      setTimeRemaining(0);
      return;
    }

    const updateRemaining = () => {
      const remaining = Math.floor((deadlineMs - Date.now()) / 1000);
      setTimeRemaining(remaining);
    };

    // Set initial value immediately
    updateRemaining();

    // Update every second
    intervalRef.current = setInterval(updateRemaining, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [deadlineMs]);

  // If no deadline provided, return null result
  if (deadlineMs === null) {
    return NULL_RESULT;
  }

  // Breached
  if (timeRemaining <= 0) {
    return BREACHED_RESULT;
  }

  // Calculate percentage remaining
  let percentRemaining = 100;
  if (totalSeconds && totalSeconds > 0) {
    percentRemaining = Math.max(0, Math.min(100, (timeRemaining / totalSeconds) * 100));
  } else {
    // If total time not provided, estimate based on time remaining
    // Use time remaining relative to a 24h window as a rough approximation
    const twentyFourHoursInSeconds = 86400;
    percentRemaining = Math.max(0, Math.min(100, (timeRemaining / twentyFourHoursInSeconds) * 100));
  }

  const severity = getSeverity(percentRemaining);
  const isBreached = timeRemaining <= 0;
  const isAtRisk = percentRemaining < 25;

  return {
    timeRemaining,
    formattedTime: formatTimeRemaining(timeRemaining),
    isBreached,
    isAtRisk,
    severity,
    percentRemaining,
  };
}

export default useSLACountdown;
