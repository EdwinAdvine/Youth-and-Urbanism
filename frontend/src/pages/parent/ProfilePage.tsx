/**
 * Parent Profile Page
 *
 * Profile management for parent users.
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Save, Loader } from 'lucide-react';
import { getParentProfile, updateParentProfile } from '../../services/parentSettingsService';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const ProfilePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    phone_number: '',
    preferred_language: 'en',
    timezone: 'Africa/Nairobi',
    bio: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getParentProfile();
      setForm({
        full_name: data.full_name || '',
        phone_number: data.phone_number || '',
        preferred_language: data.preferred_language || 'en',
        timezone: data.timezone || 'Africa/Nairobi',
        bio: data.bio || '',
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSuccess(false);
      await updateParentProfile(form);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);
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
        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#E40000] to-[#FF0000] rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-gray-900 dark:text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile & Preferences</h1>
              <p className="text-sm text-gray-500 dark:text-white/60">Manage your account details</p>
            </div>
          </div>
        </motion.div>

        {/* Profile Form */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6 space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Full Name</label>
              <input
                type="text"
                value={form.full_name}
                onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-[#E40000]"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Phone Number</label>
              <input
                type="tel"
                value={form.phone_number}
                onChange={(e) => setForm((f) => ({ ...f, phone_number: e.target.value }))}
                placeholder="+254..."
                className="w-full px-4 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-[#E40000]"
              />
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Preferred Language</label>
              <select
                value={form.preferred_language}
                onChange={(e) => setForm((f) => ({ ...f, preferred_language: e.target.value }))}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-[#E40000]"
              >
                <option value="en">English</option>
                <option value="sw">Swahili</option>
              </select>
            </div>

            {/* Timezone */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Timezone</label>
              <select
                value={form.timezone}
                onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-[#E40000]"
              >
                <option value="Africa/Nairobi">East Africa Time (EAT)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Bio</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                rows={3}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-[#E40000] resize-none"
                placeholder="Tell us about yourself..."
              />
            </div>

            {/* Success Message */}
            {success && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                <p className="text-sm text-green-400">Profile updated successfully!</p>
              </div>
            )}

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3 bg-[#E40000] text-gray-900 dark:text-white rounded-lg hover:bg-[#FF0000] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default ProfilePage;
