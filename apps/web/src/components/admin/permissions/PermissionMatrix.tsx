import React from 'react';
import { Check, X, Loader2 } from 'lucide-react';

interface PermissionEntry {
  permission_id: string;
  permission_name: string;
  granted: boolean;
  expires_at: string | null;
}

interface PermissionMatrixProps {
  matrix: Record<string, PermissionEntry[]> | null;
  loading?: boolean;
  onToggle?: (role: string, permissionId: string, granted: boolean) => void;
}

const ROLE_ORDER = ['admin', 'staff', 'instructor', 'parent', 'partner', 'student'];

const ROLE_COLORS: Record<string, string> = {
  admin: 'text-red-400',
  staff: 'text-blue-400',
  instructor: 'text-green-400',
  parent: 'text-purple-400',
  partner: 'text-orange-400',
  student: 'text-cyan-400',
};

const PermissionMatrix: React.FC<PermissionMatrixProps> = ({ matrix, loading, onToggle }) => {
  if (loading || !matrix) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-400 dark:text-white/40">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Loading permissions...
      </div>
    );
  }

  // Extract unique permissions from the first role
  const firstRole = ROLE_ORDER.find((r) => matrix[r]);
  const permissions = firstRole ? matrix[firstRole] : [];

  // Group permissions by resource
  const grouped: Record<string, PermissionEntry[]> = {};
  for (const perm of permissions) {
    const resource = perm.permission_name.split('.')[0];
    if (!grouped[resource]) grouped[resource] = [];
    grouped[resource].push(perm);
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-[#22272B]">
            <th className="text-left py-3 px-4 text-gray-500 dark:text-white/50 font-medium min-w-[200px]">
              Permission
            </th>
            {ROLE_ORDER.map((role) =>
              matrix[role] ? (
                <th
                  key={role}
                  className={`py-3 px-3 font-medium text-center capitalize ${ROLE_COLORS[role] || 'text-white/70'}`}
                >
                  {role}
                </th>
              ) : null,
            )}
          </tr>
        </thead>
        <tbody>
          {Object.entries(grouped).map(([resource, perms]) => (
            <React.Fragment key={resource}>
              {/* Resource group header */}
              <tr>
                <td
                  colSpan={ROLE_ORDER.filter((r) => matrix[r]).length + 1}
                  className="py-2 px-4 text-xs font-semibold text-gray-400 dark:text-white/30 uppercase tracking-wider bg-gray-50 dark:bg-[#161A1D]"
                >
                  {resource}
                </td>
              </tr>
              {/* Permission rows */}
              {perms.map((perm) => (
                <tr
                  key={perm.permission_id}
                  className="border-b border-gray-100 dark:border-[#1E2225] hover:bg-gray-50 dark:hover:bg-[#181C1F] transition-colors"
                >
                  <td className="py-2.5 px-4 text-gray-700 dark:text-white/70">
                    {perm.permission_name.split('.').slice(1).join('.')}
                  </td>
                  {ROLE_ORDER.map((role) => {
                    if (!matrix[role]) return null;
                    const entry = matrix[role].find((p) => p.permission_id === perm.permission_id);
                    const granted = entry?.granted ?? false;

                    return (
                      <td key={role} className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => onToggle?.(role, perm.permission_id, !granted)}
                          className={`inline-flex items-center justify-center w-7 h-7 rounded transition-colors ${
                            granted
                              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                              : 'bg-gray-100 dark:bg-[#22272B] text-gray-400 dark:text-white/20 hover:bg-gray-200 dark:hover:bg-[#2A2F33]'
                          }`}
                        >
                          {granted ? <Check className="w-4 h-4" /> : <X className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PermissionMatrix;
