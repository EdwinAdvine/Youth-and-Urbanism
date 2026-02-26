/**
 * Notification Preferences Page
 *
 * Allows parents to configure notification channels and severity thresholds
 * for different notification types (achievement, alert, report, message, payment, system).
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Save, CheckCircle, AlertCircle } from 'lucide-react';
import {
  getNotificationPreferences,
  updateNotificationPreference,
} from '../../services/parentSettingsService';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface NotificationPref {
  id: string;
  notification_type: string;
  child_id: string | null;
  channel_email: boolean;
  channel_sms: boolean;
  channel_push: boolean;
  channel_in_app: boolean;
  severity_threshold: string;
  is_enabled: boolean;
}

const NOTIFICATION_TYPES = [
  { key: 'achievement', label: 'Achievements', description: 'Certificates, badges, milestones' },
  { key: 'alert', label: 'Alerts', description: 'AI warnings, engagement drops' },
  { key: 'report', label: 'Reports', description: 'Weekly progress, assessments' },
  { key: 'message', label: 'Messages', description: 'Instructor messages, platform updates' },
  { key: 'payment', label: 'Payments', description: 'Billing, subscription, receipts' },
  { key: 'system', label: 'System', description: 'Maintenance, policy changes' },
];

const SEVERITY_OPTIONS = ['info', 'warning', 'critical'];

const NotificationPrefsPage: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPref[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const data = await getNotificationPreferences();
      if (data.preferences && data.preferences.length > 0) {
        setPreferences(data.preferences);
      } else {
        // Initialize with defaults for each notification type
        const defaults: NotificationPref[] = NOTIFICATION_TYPES.map((nt) => ({
          id: nt.key,
          notification_type: nt.key,
          child_id: null,
          channel_email: true,
          channel_sms: false,
          channel_push: true,
          channel_in_app: true,
          severity_threshold: 'info',
          is_enabled: true,
        }));
        setPreferences(defaults);
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
      // Initialize with defaults on error
      const defaults: NotificationPref[] = NOTIFICATION_TYPES.map((nt) => ({
        id: nt.key,
        notification_type: nt.key,
        child_id: null,
        channel_email: true,
        channel_sms: false,
        channel_push: true,
        channel_in_app: true,
        severity_threshold: 'info',
        is_enabled: true,
      }));
      setPreferences(defaults);
    } finally {
      setLoading(false);
    }
  };

  const toggleChannel = (index: number, channel: 'channel_email' | 'channel_sms' | 'channel_push' | 'channel_in_app') => {
    setPreferences((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [channel]: !updated[index][channel] };
      return updated;
    });
    setDirty(true);
  };

  const toggleEnabled = (index: number) => {
    setPreferences((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], is_enabled: !updated[index].is_enabled };
      return updated;
    });
    setDirty(true);
  };

  const setSeverity = (index: number, severity: string) => {
    setPreferences((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], severity_threshold: severity };
      return updated;
    });
    setDirty(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      for (const pref of preferences) {
        await updateNotificationPreference({
          notification_type: pref.notification_type,
          channel_email: pref.channel_email,
          channel_sms: pref.channel_sms,
          channel_push: pref.channel_push,
          channel_in_app: pref.channel_in_app,
          severity_threshold: pref.severity_threshold,
          is_enabled: pref.is_enabled,
        });
      }
      setToast({ type: 'success', message: 'Notification preferences saved successfully.' });
      setDirty(false);
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
      setToast({ type: 'error', message: 'Failed to save preferences. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E40000]" />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Toast notification */}
        {toast && (
          <div
            className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
              toast.type === 'success'
                ? 'bg-green-500/20 border border-green-500/40 text-green-400'
                : 'bg-red-500/20 border border-red-500/40 text-red-400'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="text-sm">{toast.message}</span>
          </div>
        )}

        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#E40000] to-[#FF0000] rounded-lg flex items-center justify-center">
              <Bell className="w-6 h-6 text-gray-900 dark:text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notification Preferences</h1>
              <p className="text-sm text-gray-500 dark:text-white/60">
                Control how and when you receive notifications
              </p>
            </div>
          </div>
        </motion.div>

        {/* Notification Types Grid */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-4">
          {/* Column headers */}
          <div className="hidden lg:grid lg:grid-cols-[1fr_80px_80px_80px_80px_120px_80px] gap-3 px-4 text-xs text-gray-400 dark:text-white/40 uppercase tracking-wider">
            <span>Type</span>
            <span className="text-center">Email</span>
            <span className="text-center">SMS</span>
            <span className="text-center">Push</span>
            <span className="text-center">In-App</span>
            <span className="text-center">Severity</span>
            <span className="text-center">Enabled</span>
          </div>

          {preferences.map((pref, index) => {
            const typeInfo = NOTIFICATION_TYPES.find((t) => t.key === pref.notification_type);
            return (
              <div
                key={pref.notification_type}
                className={`bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-4 lg:p-4 ${
                  !pref.is_enabled ? 'opacity-50' : ''
                }`}
              >
                <div className="lg:grid lg:grid-cols-[1fr_80px_80px_80px_80px_120px_80px] lg:gap-3 lg:items-center space-y-3 lg:space-y-0">
                  {/* Type info */}
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {typeInfo?.label || pref.notification_type}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-white/40">{typeInfo?.description}</p>
                  </div>

                  {/* Channel toggles */}
                  {(['channel_email', 'channel_sms', 'channel_push', 'channel_in_app'] as const).map(
                    (channel) => (
                      <div key={channel} className="flex items-center justify-between lg:justify-center">
                        <span className="text-xs text-gray-400 dark:text-white/40 lg:hidden">
                          {channel.replace('channel_', '').replace('_', '-').toUpperCase()}
                        </span>
                        <button
                          onClick={() => toggleChannel(index, channel)}
                          disabled={!pref.is_enabled}
                          className={`w-10 h-6 rounded-full transition-colors relative ${
                            pref[channel] ? 'bg-[#E40000]' : 'bg-gray-100 dark:bg-[#22272B]'
                          } ${!pref.is_enabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <span
                            className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                              pref[channel] ? 'translate-x-5' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    )
                  )}

                  {/* Severity threshold */}
                  <div className="flex items-center justify-between lg:justify-center">
                    <span className="text-xs text-gray-400 dark:text-white/40 lg:hidden">Severity</span>
                    <select
                      value={pref.severity_threshold}
                      onChange={(e) => setSeverity(index, e.target.value)}
                      disabled={!pref.is_enabled}
                      className="bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] text-gray-900 dark:text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#E40000]"
                    >
                      {SEVERITY_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt.charAt(0).toUpperCase() + opt.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Enabled toggle */}
                  <div className="flex items-center justify-between lg:justify-center">
                    <span className="text-xs text-gray-400 dark:text-white/40 lg:hidden">Enabled</span>
                    <button
                      onClick={() => toggleEnabled(index)}
                      className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                        pref.is_enabled ? 'bg-green-500' : 'bg-gray-100 dark:bg-[#22272B]'
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                          pref.is_enabled ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Save Button */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving || !dirty}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg text-gray-900 dark:text-white font-medium transition-colors ${
                dirty
                  ? 'bg-[#E40000] hover:bg-[#FF0000]'
                  : 'bg-gray-100 dark:bg-[#22272B] text-gray-400 dark:text-white/40 cursor-not-allowed'
              }`}
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default NotificationPrefsPage;
