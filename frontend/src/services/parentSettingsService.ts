/**
 * Parent Settings Service
 *
 * API service for parent settings & controls endpoints:
 * - Consent management
 * - Notification preferences
 * - Profile management
 * - Family members
 * - Privacy & data
 * - Security (password, login history)
 */

import api from './api';

// ============================================================================
// CONSENT
// ============================================================================

export const getConsentMatrix = (childId: string) =>
  api.get(`/api/v1/parent/settings/consent/${childId}`).then((r) => r.data);

export const updateConsent = (data: {
  child_id: string;
  data_type: string;
  recipient_type: string;
  consent_given: boolean;
  reason?: string;
}) => api.put('/api/v1/parent/settings/consent', data).then((r) => r.data);

export const getConsentAudit = (childId?: string) =>
  api
    .get('/api/v1/parent/settings/consent/audit', {
      params: { child_id: childId },
    })
    .then((r) => r.data);

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export const getNotificationPreferences = () =>
  api.get('/api/v1/parent/settings/notifications').then((r) => r.data);

export const updateNotificationPreference = (data: {
  notification_type: string;
  child_id?: string;
  channel_email?: boolean;
  channel_sms?: boolean;
  channel_push?: boolean;
  channel_in_app?: boolean;
  is_enabled?: boolean;
}) =>
  api.put('/api/v1/parent/settings/notifications', data).then((r) => r.data);

// ============================================================================
// PROFILE
// ============================================================================

export const getParentProfile = () =>
  api.get('/api/v1/parent/settings/profile').then((r) => r.data);

export const updateParentProfile = (data: {
  full_name?: string;
  phone_number?: string;
  preferred_language?: string;
  timezone?: string;
  bio?: string;
}) =>
  api.put('/api/v1/parent/settings/profile', data).then((r) => r.data);

// ============================================================================
// FAMILY MEMBERS
// ============================================================================

export const getFamilyMembers = () =>
  api.get('/api/v1/parent/settings/family').then((r) => r.data);

export const inviteFamilyMember = (data: {
  email: string;
  full_name: string;
  relationship: string;
  viewing_rights: string[];
  can_edit: boolean;
}) =>
  api.post('/api/v1/parent/settings/family/invite', data).then((r) => r.data);

export const removeFamilyMember = (memberId: string) =>
  api
    .delete(`/api/v1/parent/settings/family/${memberId}`)
    .then((r) => r.data);

export const updateViewingRights = (
  memberId: string,
  data: { viewing_rights: string[]; can_edit: boolean }
) =>
  api
    .put(`/api/v1/parent/settings/family/${memberId}/rights`, data)
    .then((r) => r.data);

// ============================================================================
// PRIVACY
// ============================================================================

export const getSharedDataOverview = () =>
  api.get('/api/v1/parent/settings/privacy/shared-data').then((r) => r.data);

export const requestDataExport = () =>
  api.post('/api/v1/parent/settings/privacy/data-request').then((r) => r.data);

// ============================================================================
// SECURITY
// ============================================================================

export const changePassword = (data: {
  current_password: string;
  new_password: string;
}) =>
  api
    .put('/api/v1/parent/settings/security/password', data)
    .then((r) => r.data);

export const getLoginHistory = (limit?: number) =>
  api
    .get('/api/v1/parent/settings/security/login-history', {
      params: { limit },
    })
    .then((r) => r.data);

export default {
  getConsentMatrix,
  updateConsent,
  getConsentAudit,
  getNotificationPreferences,
  updateNotificationPreference,
  getParentProfile,
  updateParentProfile,
  getFamilyMembers,
  inviteFamilyMember,
  removeFamilyMember,
  updateViewingRights,
  getSharedDataOverview,
  requestDataExport,
  changePassword,
  getLoginHistory,
};
