import React, { useState } from 'react';
import {
  Shield,
  Key,
  Users,
  Lock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Save,
} from 'lucide-react';
import { motion } from 'framer-motion';
import AdminPageHeader from '../../components/admin/shared/AdminPageHeader';

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

interface Role {
  id: string;
  name: string;
  display_name: string;
  description: string;
  user_count: number;
  color: string;
}

interface Permission {
  id: string;
  name: string;
  display_name: string;
  category: string;
  description: string;
}

type PermissionMatrix = Record<string, Record<string, boolean>>;

// ------------------------------------------------------------------
// Mock data
// ------------------------------------------------------------------

const mockRoles: Role[] = [
  { id: 'admin', name: 'admin', display_name: 'Admin', description: 'Full platform access', user_count: 3, color: 'text-red-400' },
  { id: 'instructor', name: 'instructor', display_name: 'Instructor', description: 'Course management and teaching', user_count: 24, color: 'text-purple-400' },
  { id: 'student', name: 'student', display_name: 'Student', description: 'Learning and assessments', user_count: 847, color: 'text-blue-400' },
  { id: 'parent', name: 'parent', display_name: 'Parent', description: 'Child monitoring and payments', user_count: 312, color: 'text-green-400' },
  { id: 'partner', name: 'partner', display_name: 'Partner', description: 'Organisation management', user_count: 8, color: 'text-orange-400' },
  { id: 'staff', name: 'staff', display_name: 'Staff', description: 'Support and moderation', user_count: 12, color: 'text-cyan-400' },
];

const mockPermissions: Permission[] = [
  // Users
  { id: 'users.view', name: 'users.view', display_name: 'View Users', category: 'Users', description: 'View user profiles and lists' },
  { id: 'users.create', name: 'users.create', display_name: 'Create Users', category: 'Users', description: 'Create new user accounts' },
  { id: 'users.edit', name: 'users.edit', display_name: 'Edit Users', category: 'Users', description: 'Modify user accounts' },
  { id: 'users.delete', name: 'users.delete', display_name: 'Delete Users', category: 'Users', description: 'Soft-delete user accounts' },
  // Courses
  { id: 'courses.view', name: 'courses.view', display_name: 'View Courses', category: 'Courses', description: 'Browse and view courses' },
  { id: 'courses.create', name: 'courses.create', display_name: 'Create Courses', category: 'Courses', description: 'Create new courses' },
  { id: 'courses.edit', name: 'courses.edit', display_name: 'Edit Courses', category: 'Courses', description: 'Modify course content' },
  { id: 'courses.enroll', name: 'courses.enroll', display_name: 'Enroll in Courses', category: 'Courses', description: 'Enroll students into courses' },
  // AI Tutor
  { id: 'ai_tutor.access', name: 'ai_tutor.access', display_name: 'Access AI Tutor', category: 'AI Tutor', description: 'Use AI tutor chat' },
  { id: 'ai_tutor.configure', name: 'ai_tutor.configure', display_name: 'Configure AI Tutor', category: 'AI Tutor', description: 'Configure AI models and settings' },
  // Assessments
  { id: 'assessments.take', name: 'assessments.take', display_name: 'Take Assessments', category: 'Assessments', description: 'Complete quizzes and exams' },
  { id: 'assessments.create', name: 'assessments.create', display_name: 'Create Assessments', category: 'Assessments', description: 'Create quizzes and exams' },
  { id: 'assessments.grade', name: 'assessments.grade', display_name: 'Grade Assessments', category: 'Assessments', description: 'Grade student submissions' },
  // Payments
  { id: 'payments.view', name: 'payments.view', display_name: 'View Payments', category: 'Payments', description: 'View payment history' },
  { id: 'payments.manage', name: 'payments.manage', display_name: 'Manage Payments', category: 'Payments', description: 'Process refunds and adjustments' },
  // Platform
  { id: 'platform.settings', name: 'platform.settings', display_name: 'Platform Settings', category: 'Platform', description: 'Access platform configuration' },
  { id: 'platform.analytics', name: 'platform.analytics', display_name: 'View Analytics', category: 'Platform', description: 'View platform analytics' },
  { id: 'platform.audit_log', name: 'platform.audit_log', display_name: 'View Audit Log', category: 'Platform', description: 'Access audit trail' },
];

const defaultMatrix: PermissionMatrix = {
  admin: Object.fromEntries(mockPermissions.map((p) => [p.id, true])),
  instructor: {
    'users.view': true, 'users.create': false, 'users.edit': false, 'users.delete': false,
    'courses.view': true, 'courses.create': true, 'courses.edit': true, 'courses.enroll': true,
    'ai_tutor.access': true, 'ai_tutor.configure': false,
    'assessments.take': false, 'assessments.create': true, 'assessments.grade': true,
    'payments.view': false, 'payments.manage': false,
    'platform.settings': false, 'platform.analytics': true, 'platform.audit_log': false,
  },
  student: {
    'users.view': false, 'users.create': false, 'users.edit': false, 'users.delete': false,
    'courses.view': true, 'courses.create': false, 'courses.edit': false, 'courses.enroll': true,
    'ai_tutor.access': true, 'ai_tutor.configure': false,
    'assessments.take': true, 'assessments.create': false, 'assessments.grade': false,
    'payments.view': true, 'payments.manage': false,
    'platform.settings': false, 'platform.analytics': false, 'platform.audit_log': false,
  },
  parent: {
    'users.view': true, 'users.create': false, 'users.edit': false, 'users.delete': false,
    'courses.view': true, 'courses.create': false, 'courses.edit': false, 'courses.enroll': true,
    'ai_tutor.access': false, 'ai_tutor.configure': false,
    'assessments.take': false, 'assessments.create': false, 'assessments.grade': false,
    'payments.view': true, 'payments.manage': true,
    'platform.settings': false, 'platform.analytics': false, 'platform.audit_log': false,
  },
  partner: {
    'users.view': true, 'users.create': false, 'users.edit': false, 'users.delete': false,
    'courses.view': true, 'courses.create': false, 'courses.edit': false, 'courses.enroll': false,
    'ai_tutor.access': false, 'ai_tutor.configure': false,
    'assessments.take': false, 'assessments.create': false, 'assessments.grade': false,
    'payments.view': true, 'payments.manage': false,
    'platform.settings': false, 'platform.analytics': true, 'platform.audit_log': false,
  },
  staff: {
    'users.view': true, 'users.create': true, 'users.edit': true, 'users.delete': false,
    'courses.view': true, 'courses.create': false, 'courses.edit': true, 'courses.enroll': true,
    'ai_tutor.access': true, 'ai_tutor.configure': false,
    'assessments.take': false, 'assessments.create': false, 'assessments.grade': true,
    'payments.view': true, 'payments.manage': false,
    'platform.settings': false, 'platform.analytics': true, 'platform.audit_log': true,
  },
};

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

function groupPermissionsByCategory(permissions: Permission[]): Record<string, Permission[]> {
  return permissions.reduce<Record<string, Permission[]>>((acc, perm) => {
    if (!acc[perm.category]) acc[perm.category] = [];
    acc[perm.category].push(perm);
    return acc;
  }, {});
}

// ------------------------------------------------------------------
// Main component
// ------------------------------------------------------------------

const RolesPermissionsPage: React.FC = () => {
  const [matrix, setMatrix] = useState<PermissionMatrix>(defaultMatrix);
  const [hasChanges, setHasChanges] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleToggle = (roleId: string, permId: string) => {
    // Admin permissions are locked
    if (roleId === 'admin') return;

    setMatrix((prev) => ({
      ...prev,
      [roleId]: {
        ...prev[roleId],
        [permId]: !prev[roleId][permId],
      },
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // In production, this would call an API
    setHasChanges(false);
    showToast('Permission matrix saved successfully', 'success');
  };

  const handleReset = () => {
    setMatrix(defaultMatrix);
    setHasChanges(false);
    showToast('Permissions reset to defaults', 'success');
  };

  const permissionsByCategory = groupPermissionsByCategory(mockPermissions);
  const totalPermissions = mockPermissions.length;
  const totalRoles = mockRoles.length;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <AdminPageHeader
          title="Roles & Permissions"
          subtitle="Manage role-based access control across the platform"
          breadcrumbs={[{ label: 'Roles & Permissions' }]}
          actions={
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-[#444] transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Reset
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
                  hasChanges
                    ? 'bg-[#E40000] text-gray-900 dark:text-white hover:bg-[#CC0000]'
                    : 'bg-gray-100 dark:bg-[#22272B] text-gray-400 dark:text-white/30 cursor-not-allowed'
                }`}
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          }
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 dark:text-white/60 text-sm">Total Roles</span>
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalRoles}</p>
            <p className="text-xs text-gray-400 dark:text-white/40 mt-1">
              {mockRoles.reduce((sum, r) => sum + r.user_count, 0).toLocaleString()} users assigned
            </p>
          </div>
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 dark:text-white/60 text-sm">Total Permissions</span>
              <Key className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalPermissions}</p>
            <p className="text-xs text-gray-400 dark:text-white/40 mt-1">
              {Object.keys(permissionsByCategory).length} categories
            </p>
          </div>
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 dark:text-white/60 text-sm">Active API Tokens</span>
              <Lock className="w-5 h-5 text-orange-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">14</p>
            <p className="text-xs text-gray-400 dark:text-white/40 mt-1">Across 4 service integrations</p>
          </div>
        </div>

        {/* Unsaved changes banner */}
        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 px-4 py-3 bg-[#E40000]/10 border border-[#E40000]/20 rounded-lg"
          >
            <AlertCircle className="w-4 h-4 text-[#E40000] flex-shrink-0" />
            <span className="text-sm text-gray-900 dark:text-white">
              You have unsaved changes to the permission matrix.
            </span>
            <button
              onClick={handleSave}
              className="ml-auto px-3 py-1.5 text-xs bg-[#E40000] text-gray-900 dark:text-white rounded-lg hover:bg-[#CC0000] transition-colors"
            >
              Save Now
            </button>
          </motion.div>
        )}

        {/* Permission Matrix */}
        <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-[#22272B]">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#E40000]" />
              Permission Matrix
            </h3>
            <p className="text-xs text-gray-400 dark:text-white/40 mt-1">
              Toggle permissions for each role. Admin role permissions are locked.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-[#22272B]">
                  <th className="px-6 py-3 text-left text-gray-500 dark:text-white/60 font-medium sticky left-0 bg-white dark:bg-[#181C1F] z-10 min-w-[200px]">
                    Permission
                  </th>
                  {mockRoles.map((role) => (
                    <th key={role.id} className="px-4 py-3 text-center min-w-[100px]">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`text-xs font-semibold ${role.color}`}>
                          {role.display_name}
                        </span>
                        <span className="text-[10px] text-gray-400 dark:text-white/30">
                          {role.user_count} users
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(permissionsByCategory).map(([category, perms]) => (
                  <React.Fragment key={category}>
                    {/* Category header row */}
                    <tr className="bg-gray-50 dark:bg-[#0F1112]">
                      <td
                        colSpan={mockRoles.length + 1}
                        className="px-6 py-2 text-xs font-bold text-gray-400 dark:text-white/40 uppercase tracking-wider"
                      >
                        {category}
                      </td>
                    </tr>
                    {perms.map((perm) => (
                      <tr
                        key={perm.id}
                        className="border-b border-gray-200 dark:border-[#22272B]/50 hover:bg-[#1E2327] transition-colors"
                      >
                        <td className="px-6 py-3 sticky left-0 bg-white dark:bg-[#181C1F] z-10">
                          <div>
                            <span className="text-gray-700 dark:text-white/80 text-sm">{perm.display_name}</span>
                            <p className="text-[11px] text-gray-400 dark:text-white/30 mt-0.5">{perm.description}</p>
                          </div>
                        </td>
                        {mockRoles.map((role) => (
                          <td key={role.id} className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleToggle(role.id, perm.id)}
                              disabled={role.id === 'admin'}
                              className={`w-5 h-5 rounded border-2 inline-flex items-center justify-center transition-all ${
                                matrix[role.id]?.[perm.id]
                                  ? role.id === 'admin'
                                    ? 'bg-red-500/40 border-red-500/50 cursor-not-allowed'
                                    : 'bg-emerald-500 border-emerald-500 hover:bg-emerald-600'
                                  : role.id === 'admin'
                                  ? 'border-gray-300 dark:border-[#333] cursor-not-allowed'
                                  : 'border-gray-300 dark:border-[#444] hover:border-white/40 cursor-pointer'
                              }`}
                              title={
                                role.id === 'admin'
                                  ? 'Admin permissions are locked'
                                  : `Toggle ${perm.display_name} for ${role.display_name}`
                              }
                            >
                              {matrix[role.id]?.[perm.id] && (
                                <svg className="w-3 h-3 text-gray-900 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </button>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Role Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockRoles.map((role) => {
            const grantedCount = Object.values(matrix[role.id] || {}).filter(Boolean).length;
            return (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className={`text-sm font-semibold ${role.color}`}>{role.display_name}</h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 dark:bg-[#22272B] text-gray-500 dark:text-white/50">
                    {role.user_count} users
                  </span>
                </div>
                <p className="text-xs text-gray-400 dark:text-white/40 mb-3">{role.description}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-[#22272B] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${(grantedCount / totalPermissions) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 dark:text-white/40">
                    {grantedCount}/{totalPermissions}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 animate-slide-in-bottom">
            <div
              className={`flex items-center gap-3 px-5 py-3 rounded-lg shadow-xl ${
                toast.type === 'success'
                  ? 'bg-emerald-500 text-gray-900 dark:text-white'
                  : 'bg-red-500 text-gray-900 dark:text-white'
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
    </>
  );
};

export default RolesPermissionsPage;
