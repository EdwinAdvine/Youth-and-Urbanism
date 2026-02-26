import React, { useState } from 'react';
import { Bell, Moon, Globe, Save, AlertCircle } from 'lucide-react';
import { updatePreferences } from '@/services/staff/staffAccountService';

const StaffPreferencesPage: React.FC = () => {
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [language, setLanguage] = useState<'en' | 'sw'>('en');
  const [timezone, setTimezone] = useState('Africa/Nairobi');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await updatePreferences({
        theme: darkMode ? 'dark' : 'light',
        language,
        timezone,
      });
      setSuccessMessage('Preferences saved successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F1112] p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Preferences</h1>

        {/* Success message */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
            {successMessage}
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-xs underline">Dismiss</button>
          </div>
        )}

        <div className="space-y-4">
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-400" />
              Notifications
            </h2>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 bg-gray-100 dark:bg-[#22272B]/50 rounded-lg cursor-pointer">
                <span className="text-sm text-gray-900 dark:text-white">Email Notifications</span>
                <input
                  type="checkbox"
                  checked={emailNotifs}
                  onChange={(e) => setEmailNotifs(e.target.checked)}
                  className="w-5 h-5 rounded bg-white dark:bg-[#181C1F] border-gray-200 dark:border-[#2A2F34] text-[#E40000] focus:ring-[#E40000]"
                />
              </label>
              <label className="flex items-center justify-between p-3 bg-gray-100 dark:bg-[#22272B]/50 rounded-lg cursor-pointer">
                <span className="text-sm text-gray-900 dark:text-white">Push Notifications</span>
                <input
                  type="checkbox"
                  checked={pushNotifs}
                  onChange={(e) => setPushNotifs(e.target.checked)}
                  className="w-5 h-5 rounded bg-white dark:bg-[#181C1F] border-gray-200 dark:border-[#2A2F34] text-[#E40000] focus:ring-[#E40000]"
                />
              </label>
            </div>
          </div>

          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Moon className="w-4 h-4 text-purple-400" />
              Appearance
            </h2>
            <label className="flex items-center justify-between p-3 bg-gray-100 dark:bg-[#22272B]/50 rounded-lg cursor-pointer">
              <span className="text-sm text-gray-900 dark:text-white">Dark Mode</span>
              <input
                type="checkbox"
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
                className="w-5 h-5 rounded bg-white dark:bg-[#181C1F] border-gray-200 dark:border-[#2A2F34] text-[#E40000] focus:ring-[#E40000]"
              />
            </label>
          </div>

          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-green-400" />
              Language & Region
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 dark:text-white/50 block mb-1.5">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as 'en' | 'sw')}
                  className="w-full bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white"
                >
                  <option value="en">English</option>
                  <option value="sw">Swahili</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-white/50 block mb-1.5">Timezone</label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white"
                >
                  <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
                  <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                  <option value="Africa/Cairo">Africa/Cairo (EET)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#E40000]/20 text-[#FF4444] rounded-lg hover:bg-[#E40000]/30 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffPreferencesPage;
