import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  UserPlus, Shield, CheckCircle, XCircle, Clock, Users,
  AlertCircle, RefreshCw,
} from 'lucide-react';
import staffAccountService from '../../services/admin/staffAccountService';
import type { StaffAccountRequest, CreateStaffAccountData } from '../../services/admin/staffAccountService';

// ------------------------------------------------------------------
// Status badge
// ------------------------------------------------------------------
const statusBadgeColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  approved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="w-3 h-3" />,
  approved: <CheckCircle className="w-3 h-3" />,
  rejected: <XCircle className="w-3 h-3" />,
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${
      statusBadgeColors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }`}
  >
    {statusIcons[status]}
    {status}
  </span>
);

// ------------------------------------------------------------------
// Loading skeleton
// ------------------------------------------------------------------
const TableSkeleton: React.FC = () => (
  <div className="space-y-3">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="animate-pulse flex items-center gap-4 px-4 py-3">
        <div className="w-40 h-4 bg-gray-100 dark:bg-[#22272B] rounded" />
        <div className="w-48 h-4 bg-gray-100 dark:bg-[#22272B] rounded" />
        <div className="w-28 h-4 bg-gray-100 dark:bg-[#22272B] rounded" />
        <div className="w-24 h-4 bg-gray-100 dark:bg-[#22272B] rounded" />
        <div className="w-20 h-4 bg-gray-100 dark:bg-[#22272B] rounded" />
        <div className="w-24 h-4 bg-gray-100 dark:bg-[#22272B] rounded" />
      </div>
    ))}
  </div>
);

// ------------------------------------------------------------------
// Filter tabs
// ------------------------------------------------------------------
const TABS = [
  { key: '', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
] as const;

// ------------------------------------------------------------------
// Main component
// ------------------------------------------------------------------
const StaffAccountsPage: React.FC = () => {
  // Data state
  const [requests, setRequests] = useState<StaffAccountRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [activeTab, setActiveTab] = useState('');

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreateStaffAccountData>({
    email: '',
    full_name: '',
    phone: '',
    department: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Reject modal state
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ------------------------------------------------------------------
  // Fetch requests
  // ------------------------------------------------------------------
  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await staffAccountService.list(activeTab || undefined);
      setRequests(res.data);
    } catch (err) {
      console.error('Failed to fetch staff accounts:', err);
      setError('Failed to load staff account requests. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // ------------------------------------------------------------------
  // Create handler
  // ------------------------------------------------------------------
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.email || !formData.full_name) {
      setFormError('Name and email are required.');
      return;
    }

    setFormLoading(true);
    try {
      await staffAccountService.create(formData);
      showToast('Staff account created successfully', 'success');
      setFormData({ email: '', full_name: '', phone: '', department: '' });
      setShowForm(false);
      fetchRequests();
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setFormError(detail || 'Failed to create staff account.');
    } finally {
      setFormLoading(false);
    }
  };

  // ------------------------------------------------------------------
  // Approve / Reject handlers
  // ------------------------------------------------------------------
  const handleApprove = async (requestId: string) => {
    try {
      await staffAccountService.approve(requestId);
      showToast('Staff account approved', 'success');
      fetchRequests();
    } catch {
      showToast('Failed to approve account', 'error');
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    try {
      await staffAccountService.reject(rejectTarget, rejectReason || undefined);
      showToast('Staff account rejected', 'success');
      setRejectTarget(null);
      setRejectReason('');
      fetchRequests();
    } catch {
      showToast('Failed to reject account', 'error');
    }
  };

  // ------------------------------------------------------------------
  // Format helpers
  // ------------------------------------------------------------------
  const formatDate = (iso?: string): string => {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Shield className="w-7 h-7 text-[#FF0000]" />
            Staff Accounts
          </h1>
          <p className="text-gray-500 dark:text-white/50 text-sm mt-1">
            Create and manage staff account requests
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowForm((p) => !p)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm bg-[#FF0000] hover:bg-[#E40000] text-white rounded-lg font-medium transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            New Staff Account
          </button>
          <button
            onClick={() => fetchRequests()}
            className="flex items-center gap-2 px-3 py-2.5 text-sm bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-[#444] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Create form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#FF0000]" />
            Create Staff Account
          </h2>

          {formError && (
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{formError}</p>
            </div>
          )}

          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white/80 mb-2">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData((p) => ({ ...p, full_name: e.target.value }))}
                placeholder="Staff member name"
                required
                className="w-full bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-[#FF0000]/50 focus:ring-1 focus:ring-[#FF0000]/50 transition-colors text-sm"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white/80 mb-2">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                placeholder="staff@urbanhomeschool.co.ke"
                required
                className="w-full bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-[#FF0000]/50 focus:ring-1 focus:ring-[#FF0000]/50 transition-colors text-sm"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white/80 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                placeholder="+254 7XX XXX XXX"
                className="w-full bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-[#FF0000]/50 focus:ring-1 focus:ring-[#FF0000]/50 transition-colors text-sm"
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white/80 mb-2">
                Department
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData((p) => ({ ...p, department: e.target.value }))}
                placeholder="e.g. Support, Content, Operations"
                className="w-full bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-[#FF0000]/50 focus:ring-1 focus:ring-[#FF0000]/50 transition-colors text-sm"
              />
            </div>

            {/* Buttons */}
            <div className="sm:col-span-2 flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={formLoading}
                className="inline-flex items-center gap-2 bg-[#FF0000] hover:bg-[#E40000] disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200"
              >
                {formLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Create Account
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setFormError(''); }}
                className="px-6 py-3 text-sm text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Status filter tabs */}
      <div className="flex items-center gap-1 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab.key
                ? 'bg-[#FF0000] text-white'
                : 'text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#22272B]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl overflow-hidden">
        {loading ? (
          <TableSkeleton />
        ) : requests.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-16 h-16 text-white/10 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Staff Accounts Found</h3>
            <p className="text-gray-400 dark:text-white/40 text-sm">
              {activeTab
                ? `No ${activeTab} staff account requests.`
                : 'Create a new staff account to get started.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-[#22272B] text-left">
                  <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Name</th>
                  <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Email</th>
                  <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Phone</th>
                  <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Department</th>
                  <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Status</th>
                  <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Created</th>
                  <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr
                    key={req.id}
                    className="border-b border-gray-200 dark:border-[#22272B]/50 hover:bg-gray-50 dark:hover:bg-[#1E2327] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#22272B] flex items-center justify-center text-gray-500 dark:text-white/60 text-xs font-bold uppercase">
                          {req.full_name.slice(0, 2)}
                        </div>
                        <span className="text-gray-900 dark:text-white font-medium truncate max-w-[180px]">
                          {req.full_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-white/60 truncate max-w-[200px]">
                      {req.email}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-white/60">
                      {req.phone || '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-white/60">
                      {req.department || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-400 dark:text-white/40">
                      {formatDate(req.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {req.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(req.id)}
                              title="Approve"
                              className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-gray-500 dark:text-white/50 hover:text-emerald-400 transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setRejectTarget(req.id)}
                              title="Reject"
                              className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 dark:text-white/50 hover:text-red-400 transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {req.status === 'rejected' && req.rejection_reason && (
                          <span className="text-xs text-gray-400 dark:text-white/30 italic truncate max-w-[150px]" title={req.rejection_reason}>
                            {req.rejection_reason}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject modal */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-2xl p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-400" />
              Reject Staff Account
            </h3>
            <p className="text-sm text-gray-500 dark:text-white/50 mb-4">
              Provide an optional reason for rejecting this staff account request.
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (optional)"
              className="w-full bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-[#FF0000]/50 focus:ring-1 focus:ring-[#FF0000]/50 transition-colors text-sm resize-none mb-4"
            />
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => { setRejectTarget(null); setRejectReason(''); }}
                className="px-4 py-2 text-sm text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
            </div>
          </motion.div>
        </div>
      )}

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

export default StaffAccountsPage;
