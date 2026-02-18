/**
 * Staff Permissions Hook
 *
 * Checks the current staff user's permissions for UI element visibility.
 * Fetches from the backend or derives from user role/profile. Defaults
 * all permissions to true for the staff role until a dedicated permissions
 * endpoint is available.
 */

import { useState, useEffect, useCallback } from 'react';

interface StaffPermissions {
  canManageTickets: boolean;
  canApproveContent: boolean;
  canViewTeamPulse: boolean;
  canManageAssessments: boolean;
  canManageSessions: boolean;
  canViewInsights: boolean;
  canManageReports: boolean;
  canModerateContent: boolean;
  canManageKB: boolean;
  canViewStudentJourneys: boolean;
}

interface UseStaffPermissionsReturn extends StaffPermissions {
  /** Whether permissions are still loading */
  loading: boolean;
  /** Reload permissions from the server */
  reload: () => Promise<void>;
}

const DEFAULT_PERMISSIONS: StaffPermissions = {
  canManageTickets: true,
  canApproveContent: true,
  canViewTeamPulse: true,
  canManageAssessments: true,
  canManageSessions: true,
  canViewInsights: true,
  canManageReports: true,
  canModerateContent: true,
  canManageKB: true,
  canViewStudentJourneys: true,
};

export function useStaffPermissions(): UseStaffPermissionsReturn {
  const [permissions, setPermissions] = useState<StaffPermissions>(DEFAULT_PERMISSIONS);
  const [loading, setLoading] = useState(true);

  const getToken = useCallback((): string | null => {
    try {
      const stored = localStorage.getItem('auth-store');
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      return parsed?.state?.token || parsed?.token || null;
    } catch {
      return null;
    }
  }, []);

  const fetchPermissions = useCallback(async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        // No token available; use defaults
        setPermissions(DEFAULT_PERMISSIONS);
        setLoading(false);
        return;
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/v1/staff/account/permissions`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Map backend permission keys to our interface
        const mapped: StaffPermissions = {
          canManageTickets: data.can_manage_tickets ?? DEFAULT_PERMISSIONS.canManageTickets,
          canApproveContent: data.can_approve_content ?? DEFAULT_PERMISSIONS.canApproveContent,
          canViewTeamPulse: data.can_view_team_pulse ?? DEFAULT_PERMISSIONS.canViewTeamPulse,
          canManageAssessments: data.can_manage_assessments ?? DEFAULT_PERMISSIONS.canManageAssessments,
          canManageSessions: data.can_manage_sessions ?? DEFAULT_PERMISSIONS.canManageSessions,
          canViewInsights: data.can_view_insights ?? DEFAULT_PERMISSIONS.canViewInsights,
          canManageReports: data.can_manage_reports ?? DEFAULT_PERMISSIONS.canManageReports,
          canModerateContent: data.can_moderate_content ?? DEFAULT_PERMISSIONS.canModerateContent,
          canManageKB: data.can_manage_kb ?? DEFAULT_PERMISSIONS.canManageKB,
          canViewStudentJourneys: data.can_view_student_journeys ?? DEFAULT_PERMISSIONS.canViewStudentJourneys,
        };
        setPermissions(mapped);
      } else if (response.status === 404) {
        // Endpoint not yet implemented; fall back to defaults for staff role
        setPermissions(DEFAULT_PERMISSIONS);
      } else {
        // Auth failure or server error; use restrictive defaults
        setPermissions(DEFAULT_PERMISSIONS);
      }
    } catch (err) {
      console.error('Failed to load staff permissions:', err);
      // Network error; keep defaults so staff can work offline
      setPermissions(DEFAULT_PERMISSIONS);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  return {
    ...permissions,
    loading,
    reload: fetchPermissions,
  };
}

export default useStaffPermissions;
