/**
 * Spending Limits Page
 *
 * Allows parents to configure purchase approval settings for
 * their child — choosing between real-time approval or
 * spending-limit-based auto-approval.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Settings, ArrowLeft, Shield, Zap, Save,
} from 'lucide-react';
import childWalletService, { ApprovalSettings } from '../../services/parent/childWalletService';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const SpendingLimitsPage: React.FC = () => {
  const navigate = useNavigate();
  const { childId } = useParams<{ childId: string }>();
  const [settings, setSettings] = useState<ApprovalSettings>({
    mode: 'realtime',
    daily_limit: null,
    monthly_limit: null,
    per_purchase_limit: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (childId) loadSettings();
  }, [childId]);

  const loadSettings = async () => {
    if (!childId) return;
    try {
      setLoading(true);
      const data = await childWalletService.getApprovalSettings(childId);
      setSettings(data);
    } catch {
      // First time — use defaults
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!childId) return;
    try {
      setSaving(true);
      await childWalletService.updateApprovalSettings(childId, settings);
      setMessage({ type: 'success', text: 'Spending limits updated successfully' });
    } catch (error) {
      console.error('Failed to save settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E40000]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(`/dashboard/parent/children/${childId}/wallet`)}
        className="flex items-center gap-2 text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back to Wallet</span>
      </button>

      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#E40000] to-[#FF0000] rounded-xl flex items-center justify-center">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Spending Limits</h1>
            <p className="text-gray-500 dark:text-white/60 mt-1">
              Control how your child makes purchases
            </p>
          </div>
        </div>
      </motion.div>

      {/* Message */}
      {message && (
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className={`rounded-xl p-4 text-sm ${
            message.type === 'success'
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            {message.text}
          </div>
        </motion.div>
      )}

      {/* Approval Mode */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Approval Mode</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Real-time Approval */}
          <button
            onClick={() => setSettings({ ...settings, mode: 'realtime' })}
            className={`p-5 rounded-xl border-2 text-left transition-colors ${
              settings.mode === 'realtime'
                ? 'border-[#E40000] bg-[#E40000]/5'
                : 'border-gray-200 dark:border-[#22272B] bg-gray-100 dark:bg-[#22272B] hover:border-gray-300 dark:hover:border-[#2A2E33]'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                settings.mode === 'realtime' ? 'bg-[#E40000]/20' : 'bg-white/5'
              }`}>
                <Shield className={`w-5 h-5 ${settings.mode === 'realtime' ? 'text-[#E40000]' : 'text-gray-500 dark:text-white/50'}`} />
              </div>
              <h3 className="text-gray-900 dark:text-white font-medium">Real-time Approval</h3>
            </div>
            <p className="text-gray-500 dark:text-white/50 text-sm">
              Every purchase requires your explicit approval before it goes through. You'll receive a notification for each request.
            </p>
          </button>

          {/* Spending Limit */}
          <button
            onClick={() => setSettings({ ...settings, mode: 'spending_limit' })}
            className={`p-5 rounded-xl border-2 text-left transition-colors ${
              settings.mode === 'spending_limit'
                ? 'border-[#E40000] bg-[#E40000]/5'
                : 'border-gray-200 dark:border-[#22272B] bg-gray-100 dark:bg-[#22272B] hover:border-gray-300 dark:hover:border-[#2A2E33]'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                settings.mode === 'spending_limit' ? 'bg-[#E40000]/20' : 'bg-white/5'
              }`}>
                <Zap className={`w-5 h-5 ${settings.mode === 'spending_limit' ? 'text-[#E40000]' : 'text-gray-500 dark:text-white/50'}`} />
              </div>
              <h3 className="text-gray-900 dark:text-white font-medium">Spending Limits</h3>
            </div>
            <p className="text-gray-500 dark:text-white/50 text-sm">
              Auto-approve purchases within your set limits. Purchases exceeding limits still require manual approval.
            </p>
          </button>
        </div>
      </motion.div>

      {/* Limit Configuration (only visible in spending_limit mode) */}
      {settings.mode === 'spending_limit' && (
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] rounded-xl p-6 space-y-5">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Configure Limits</h3>
            <p className="text-gray-500 dark:text-white/50 text-sm -mt-3">
              Set limits to auto-approve purchases. Leave blank for no limit in that category.
            </p>

            <div>
              <label className="block text-sm text-gray-500 dark:text-white/60 mb-1">Per Purchase Limit (KES)</label>
              <input
                type="number"
                min="0"
                value={settings.per_purchase_limit ?? ''}
                onChange={(e) => setSettings({
                  ...settings,
                  per_purchase_limit: e.target.value ? parseFloat(e.target.value) : null,
                })}
                placeholder="No limit"
                className="w-full px-4 py-3 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#181C1F] rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#E40000]/50"
              />
              <p className="text-xs text-gray-400 dark:text-white/30 mt-1">Maximum amount per single purchase</p>
            </div>

            <div>
              <label className="block text-sm text-gray-500 dark:text-white/60 mb-1">Daily Limit (KES)</label>
              <input
                type="number"
                min="0"
                value={settings.daily_limit ?? ''}
                onChange={(e) => setSettings({
                  ...settings,
                  daily_limit: e.target.value ? parseFloat(e.target.value) : null,
                })}
                placeholder="No limit"
                className="w-full px-4 py-3 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#181C1F] rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#E40000]/50"
              />
              <p className="text-xs text-gray-400 dark:text-white/30 mt-1">Maximum total spending per day</p>
            </div>

            <div>
              <label className="block text-sm text-gray-500 dark:text-white/60 mb-1">Monthly Limit (KES)</label>
              <input
                type="number"
                min="0"
                value={settings.monthly_limit ?? ''}
                onChange={(e) => setSettings({
                  ...settings,
                  monthly_limit: e.target.value ? parseFloat(e.target.value) : null,
                })}
                placeholder="No limit"
                className="w-full px-4 py-3 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#181C1F] rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#E40000]/50"
              />
              <p className="text-xs text-gray-400 dark:text-white/30 mt-1">Maximum total spending per calendar month</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Save Button */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3 bg-[#E40000] hover:bg-[#FF0000] disabled:bg-gray-300 dark:disabled:bg-[#181C1F] disabled:text-gray-500 text-white rounded-lg font-medium transition-colors"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </motion.div>
    </div>
  );
};

export default SpendingLimitsPage;
