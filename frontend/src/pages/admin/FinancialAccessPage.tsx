/**
 * Financial Access Page
 *
 * Super Admin page for managing financial permissions.
 * Shows a table of admins/staff with toggles for each financial permission.
 */

import { useState, useEffect, useCallback } from 'react';
import { Shield, ShieldCheck, Loader2, AlertCircle, Search } from 'lucide-react';
import superAdminService, {
  FinancialAccessUser,
  FINANCIAL_PERMISSIONS,
} from '../../services/admin/superAdminService';
import { useAuthStore } from '../../store/authStore';

export default function FinancialAccessPage() {
  const [users, setUsers] = useState<FinancialAccessUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const currentUser = useAuthStore((s) => s.user);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await superAdminService.listFinancialAccess();
      setUsers(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load financial access data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleToggle = async (userId: string, permissionKey: string, currentlyGranted: boolean) => {
    const key = `${userId}-${permissionKey}`;
    setUpdating(key);
    try {
      if (currentlyGranted) {
        await superAdminService.revokeFinancialAccess(userId, permissionKey);
      } else {
        await superAdminService.grantFinancialAccess(userId, [permissionKey]);
      }
      await loadUsers();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update permission');
    } finally {
      setUpdating(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      u.email?.toLowerCase().includes(s) ||
      u.full_name?.toLowerCase().includes(s) ||
      u.role.toLowerCase().includes(s)
    );
  });

  if (!currentUser?.is_super_admin) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-zinc-400">
        <Shield className="w-16 h-16 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Super Admin Access Required</h2>
        <p>Only the Super Admin can manage financial access controls.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <ShieldCheck className="w-7 h-7 text-copilot-cyan" />
            Financial Access Control
          </h1>
          <p className="text-zinc-400 mt-1">
            Grant or revoke financial permissions for admins and staff members.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          placeholder="Search by name, email, or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-copilot-cyan/50"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-copilot-cyan" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-800">
          <table className="w-full text-sm">
            <thead className="bg-zinc-800/50">
              <tr>
                <th className="text-left px-4 py-3 text-zinc-400 font-medium">User</th>
                <th className="text-left px-4 py-3 text-zinc-400 font-medium">Role</th>
                {FINANCIAL_PERMISSIONS.map((perm) => (
                  <th
                    key={perm.key}
                    className="text-center px-3 py-3 text-zinc-400 font-medium text-xs whitespace-nowrap"
                  >
                    {perm.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-zinc-800/30">
                  <td className="px-4 py-3">
                    <div>
                      <div className="text-white font-medium">
                        {user.full_name || 'N/A'}
                        {user.is_super_admin && (
                          <span className="ml-2 text-xs bg-copilot-cyan/20 text-copilot-cyan px-2 py-0.5 rounded-full">
                            Super Admin
                          </span>
                        )}
                      </div>
                      <div className="text-zinc-500 text-xs">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-zinc-700 text-zinc-300 px-2 py-1 rounded capitalize">
                      {user.role}
                    </span>
                  </td>
                  {FINANCIAL_PERMISSIONS.map((perm) => {
                    const isGranted =
                      user.is_super_admin || user.granted_permissions.includes(perm.key);
                    const key = `${user.id}-${perm.key}`;
                    const isUpdating = updating === key;
                    const isSelf = user.id === currentUser?.id;

                    return (
                      <td key={perm.key} className="text-center px-3 py-3">
                        {user.is_super_admin ? (
                          <div className="w-5 h-5 mx-auto bg-copilot-cyan/20 rounded flex items-center justify-center">
                            <ShieldCheck className="w-3.5 h-3.5 text-copilot-cyan" />
                          </div>
                        ) : (
                          <button
                            onClick={() => handleToggle(user.id, perm.key, isGranted)}
                            disabled={isUpdating || isSelf}
                            className={`w-10 h-5 rounded-full relative transition-colors ${
                              isGranted ? 'bg-copilot-cyan' : 'bg-zinc-700'
                            } ${isUpdating || isSelf ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            {isUpdating ? (
                              <Loader2 className="w-3 h-3 animate-spin absolute top-1 left-3.5 text-white" />
                            ) : (
                              <div
                                className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
                                  isGranted ? 'translate-x-5' : 'translate-x-0.5'
                                }`}
                              />
                            )}
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={2 + FINANCIAL_PERMISSIONS.length} className="text-center py-8 text-zinc-500">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
