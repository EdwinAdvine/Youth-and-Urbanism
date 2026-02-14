import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Filter, Download, Users, RefreshCw,
  ChevronLeft, ChevronRight, Eye, UserX, UserCheck,
  MoreHorizontal, AlertCircle, CheckCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import adminUserService from '../../services/admin/adminUserService';
import type { AdminUser, UserListResponse } from '../../services/admin/adminUserService';

// ------------------------------------------------------------------
// Badge helpers
// ------------------------------------------------------------------
const roleBadgeColors: Record<string, string> = {
  admin: 'bg-red-500/20 text-red-400 border-red-500/30',
  instructor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  student: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  parent: 'bg-green-500/20 text-green-400 border-green-500/30',
  partner: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  staff: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
};

const RoleBadge: React.FC<{ role: string }> = ({ role }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${
      roleBadgeColors[role] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }`}
  >
    {role}
  </span>
);

const StatusBadge: React.FC<{ active: boolean }> = ({ active }) => (
  <span
    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
      active
        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
        : 'bg-red-500/20 text-red-400 border-red-500/30'
    }`}
  >
    <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-400' : 'bg-red-400'}`} />
    {active ? 'Active' : 'Inactive'}
  </span>
);

// ------------------------------------------------------------------
// Loading skeleton
// ------------------------------------------------------------------
const TableSkeleton: React.FC = () => (
  <div className="space-y-3">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="animate-pulse flex items-center gap-4 px-4 py-3">
        <div className="w-5 h-5 bg-[#22272B] rounded" />
        <div className="w-40 h-4 bg-[#22272B] rounded" />
        <div className="w-48 h-4 bg-[#22272B] rounded" />
        <div className="w-20 h-4 bg-[#22272B] rounded" />
        <div className="w-16 h-4 bg-[#22272B] rounded" />
        <div className="w-32 h-4 bg-[#22272B] rounded" />
        <div className="w-20 h-4 bg-[#22272B] rounded" />
      </div>
    ))}
  </div>
);

// ------------------------------------------------------------------
// Main component
// ------------------------------------------------------------------
const UsersPage: React.FC = () => {
  const navigate = useNavigate();

  // Data state
  const [data, setData] = useState<UserListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [sortBy] = useState('created_at');
  const [sortDir] = useState('desc');

  // Selection state
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showBulkBar, setShowBulkBar] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ------------------------------------------------------------------
  // Fetch users
  // ------------------------------------------------------------------
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await adminUserService.listUsers({
        page,
        page_size: pageSize,
        search: search || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
        sort_by: sortBy,
        sort_dir: sortDir,
      });
      setData(result);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, roleFilter, statusFilter, sortBy, sortDir]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  // Bulk bar visibility
  useEffect(() => {
    setShowBulkBar(selected.size > 0);
  }, [selected]);

  // ------------------------------------------------------------------
  // Handlers
  // ------------------------------------------------------------------
  const handleSelectAll = () => {
    if (!data) return;
    if (selected.size === data.items.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(data.items.map((u) => u.id)));
    }
  };

  const handleSelectOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDeactivate = async (userId: string) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return;
    try {
      await adminUserService.deactivateUser(userId);
      showToast('User deactivated successfully', 'success');
      fetchUsers();
    } catch {
      showToast('Failed to deactivate user', 'error');
    }
  };

  const handleReactivate = async (userId: string) => {
    try {
      await adminUserService.reactivateUser(userId);
      showToast('User reactivated successfully', 'success');
      fetchUsers();
    } catch {
      showToast('Failed to reactivate user', 'error');
    }
  };

  const handleBulkAction = async (action: string) => {
    if (!confirm(`Are you sure you want to ${action} ${selected.size} users?`)) return;
    try {
      const result = await adminUserService.bulkAction(Array.from(selected), action);
      showToast(`${result.affected} users ${action}d successfully`, 'success');
      setSelected(new Set());
      fetchUsers();
    } catch {
      showToast(`Failed to ${action} users`, 'error');
    }
  };

  const handleExport = async () => {
    try {
      const blobUrl = await adminUserService.exportUsers({
        role: roleFilter || undefined,
        status: statusFilter || undefined,
        search: search || undefined,
      });
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = 'users_export.csv';
      a.click();
      URL.revokeObjectURL(blobUrl);
      showToast('Export downloaded', 'success');
    } catch {
      showToast('Failed to export users', 'error');
    }
  };

  const formatDate = (iso: string | null): string => {
    if (!iso) return 'Never';
    return new Date(iso).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const users = data?.items ?? [];
  const totalPages = data?.total_pages ?? 1;
  const total = data?.total ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">User Management</h1>
          <p className="text-white/50 text-sm mt-1">
            Manage all platform accounts&nbsp;
            {total > 0 && <span className="text-white/30">({total.toLocaleString()} users)</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-[#22272B] border border-[#333] rounded-lg text-white/70 hover:text-white hover:border-[#444] transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={() => fetchUsers()}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-[#22272B] border border-[#333] rounded-lg text-white/70 hover:text-white hover:border-[#444] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#181C1F] border border-[#22272B] rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#E40000]/50 transition-colors"
          />
        </div>

        {/* Role filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="pl-10 pr-8 py-2.5 bg-[#181C1F] border border-[#22272B] rounded-lg text-white text-sm appearance-none cursor-pointer focus:outline-none focus:border-[#E40000]/50 transition-colors min-w-[140px]"
          >
            <option value="">All Roles</option>
            <option value="student">Student</option>
            <option value="parent">Parent</option>
            <option value="instructor">Instructor</option>
            <option value="admin">Admin</option>
            <option value="partner">Partner</option>
            <option value="staff">Staff</option>
          </select>
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 bg-[#181C1F] border border-[#22272B] rounded-lg text-white text-sm appearance-none cursor-pointer focus:outline-none focus:border-[#E40000]/50 transition-colors min-w-[130px]"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Bulk action bar */}
      {showBulkBar && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 px-4 py-3 bg-[#E40000]/10 border border-[#E40000]/20 rounded-lg"
        >
          <span className="text-sm text-white">
            <strong>{selected.size}</strong> user{selected.size !== 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => handleBulkAction('deactivate')}
              className="px-3 py-1.5 text-xs bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              Deactivate Selected
            </button>
            <button
              onClick={() => handleBulkAction('reactivate')}
              className="px-3 py-1.5 text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/30 transition-colors"
            >
              Reactivate Selected
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="px-3 py-1.5 text-xs text-white/50 hover:text-white transition-colors"
            >
              Clear
            </button>
          </div>
        </motion.div>
      )}

      {/* Table */}
      <div className="bg-[#181C1F] border border-[#22272B] rounded-xl overflow-hidden">
        {loading ? (
          <TableSkeleton />
        ) : users.length === 0 ? (
          /* Empty state */
          <div className="text-center py-16">
            <Users className="w-16 h-16 text-white/10 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Users Found</h3>
            <p className="text-white/40 text-sm">
              {search || roleFilter || statusFilter
                ? 'Try adjusting your search or filter criteria.'
                : 'No users have been created yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#22272B] text-left">
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={selected.size === users.length && users.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-[#333] bg-[#22272B] text-[#E40000] focus:ring-[#E40000]/30"
                    />
                  </th>
                  <th className="px-4 py-3 text-white/60 font-medium">Name</th>
                  <th className="px-4 py-3 text-white/60 font-medium">Email</th>
                  <th className="px-4 py-3 text-white/60 font-medium">Role</th>
                  <th className="px-4 py-3 text-white/60 font-medium">Status</th>
                  <th className="px-4 py-3 text-white/60 font-medium">Last Login</th>
                  <th className="px-4 py-3 text-white/60 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-[#22272B]/50 hover:bg-[#1E2327] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(user.id)}
                        onChange={() => handleSelectOne(user.id)}
                        className="rounded border-[#333] bg-[#22272B] text-[#E40000] focus:ring-[#E40000]/30"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#22272B] flex items-center justify-center text-white/60 text-xs font-bold uppercase">
                          {(user.full_name || user.email).slice(0, 2)}
                        </div>
                        <span className="text-white font-medium truncate max-w-[180px]">
                          {user.full_name || '(No name)'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white/60 truncate max-w-[200px]">{user.email}</td>
                    <td className="px-4 py-3"><RoleBadge role={user.role} /></td>
                    <td className="px-4 py-3"><StatusBadge active={user.is_active} /></td>
                    <td className="px-4 py-3 text-white/40">{formatDate(user.last_login)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/dashboard/admin/users/${user.id}`)}
                          title="View"
                          className="p-1.5 rounded-lg hover:bg-[#22272B] text-white/50 hover:text-white transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {user.is_active ? (
                          <button
                            onClick={() => handleDeactivate(user.id)}
                            title="Deactivate"
                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/50 hover:text-red-400 transition-colors"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReactivate(user.id)}
                            title="Reactivate"
                            className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-white/50 hover:text-emerald-400 transition-colors"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && users.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#22272B]">
            <p className="text-xs text-white/40">
              Showing {(page - 1) * pageSize + 1}
              &ndash;{Math.min(page * pageSize, total)} of {total}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg hover:bg-[#22272B] text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                if (pageNum > totalPages) return null;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                      pageNum === page
                        ? 'bg-[#E40000] text-white'
                        : 'text-white/50 hover:bg-[#22272B] hover:text-white'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg hover:bg-[#22272B] text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-in-bottom">
          <div
            className={`flex items-center gap-3 px-5 py-3 rounded-lg shadow-xl ${
              toast.type === 'success'
                ? 'bg-emerald-500 text-white'
                : 'bg-red-500 text-white'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default UsersPage;
