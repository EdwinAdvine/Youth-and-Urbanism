/**
 * Admin Permissions Hook
 *
 * Loads the current user's permissions from the backend and provides
 * helper functions for checking access throughout the admin UI.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';

interface PermissionEntry {
  id: string;
  name: string;
  resource: string;
  action: string;
  granted: boolean;
  field_restrictions: Record<string, unknown> | null;
}

interface UseAdminPermissionsReturn {
  /** All permissions for the current user */
  permissions: PermissionEntry[];
  /** Whether permissions are still loading */
  isLoading: boolean;
  /** Check if user has a specific named permission */
  hasPermission: (name: string) => boolean;
  /** Check if user can read a resource */
  canRead: (resource: string) => boolean;
  /** Check if user can write (create/update) a resource */
  canWrite: (resource: string) => boolean;
  /** Check if user can delete a resource */
  canDelete: (resource: string) => boolean;
  /** Get field restrictions for a resource */
  getFieldRestrictions: (resource: string) => Record<string, unknown> | null;
  /** Reload permissions from server */
  reload: () => Promise<void>;
}

export function useAdminPermissions(): UseAdminPermissionsReturn {
  const [permissions, setPermissions] = useState<PermissionEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPermissions = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth-store');
      let jwt = '';

      if (token) {
        try {
          const parsed = JSON.parse(token);
          jwt = parsed?.state?.token || parsed?.token || '';
        } catch {
          jwt = token;
        }
      }

      if (!jwt) {
        setPermissions([]);
        setIsLoading(false);
        return;
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/v1/admin/permissions/me`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPermissions(data.permissions || data || []);
      } else {
        // If 403/401, user doesn't have admin access — empty permissions
        setPermissions([]);
      }
    } catch (err) {
      console.error('Failed to load permissions:', err);
      setPermissions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  // Build a lookup map for fast permission checks
  const permissionMap = useMemo(() => {
    const map = new Map<string, PermissionEntry>();
    permissions.forEach((p) => {
      map.set(p.name, p);
    });
    return map;
  }, [permissions]);

  // Build resource-action lookup
  const resourceActionMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    permissions.forEach((p) => {
      if (p.granted) {
        if (!map.has(p.resource)) {
          map.set(p.resource, new Set());
        }
        map.get(p.resource)!.add(p.action);
      }
    });
    return map;
  }, [permissions]);

  const hasPermission = useCallback(
    (name: string): boolean => {
      const perm = permissionMap.get(name);
      return perm?.granted ?? false;
    },
    [permissionMap]
  );

  const canRead = useCallback(
    (resource: string): boolean => {
      return resourceActionMap.get(resource)?.has('read') ?? false;
    },
    [resourceActionMap]
  );

  const canWrite = useCallback(
    (resource: string): boolean => {
      const actions = resourceActionMap.get(resource);
      if (!actions) return false;
      return actions.has('create') || actions.has('update') || actions.has('write');
    },
    [resourceActionMap]
  );

  const canDelete = useCallback(
    (resource: string): boolean => {
      return resourceActionMap.get(resource)?.has('delete') ?? false;
    },
    [resourceActionMap]
  );

  const getFieldRestrictions = useCallback(
    (resource: string): Record<string, unknown> | null => {
      // Find the most specific permission for this resource
      for (const perm of permissions) {
        if (perm.resource === resource && perm.field_restrictions) {
          return perm.field_restrictions;
        }
      }
      return null;
    },
    [permissions]
  );

  return {
    permissions,
    isLoading,
    hasPermission,
    canRead,
    canWrite,
    canDelete,
    getFieldRestrictions,
    reload: fetchPermissions,
  };
}

export default useAdminPermissions;
