import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sun,
  Moon,
  Monitor,
  Globe,
  Bell,
  Layout,
  Save,
  RotateCcw,
  Keyboard,
} from 'lucide-react';
import AdminPageHeader from '../../components/admin/shared/AdminPageHeader';

interface Preferences {
  theme: 'dark' | 'light' | 'system';
  timezone: string;
  language: string;
  date_format: string;
  notifications_email: boolean;
  notifications_push: boolean;
  notifications_sound: boolean;
  dashboard_layout: 'default' | 'compact' | 'expanded';
  sidebar_collapsed: boolean;
  auto_refresh_interval: number;
}

const AdminPreferencesPage: React.FC = () => {
  const [preferences, setPreferences] = useState<Preferences>({
    theme: 'dark',
    timezone: 'Africa/Nairobi',
    language: 'en',
    date_format: 'DD/MM/YYYY',
    notifications_email: true,
    notifications_push: true,
    notifications_sound: false,
    dashboard_layout: 'default',
    sidebar_collapsed: false,
    auto_refresh_interval: 60,
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showToast('Preferences saved successfully');
    }, 1000);
  };
  const handleReset = () => {
    setPreferences({ theme: 'dark', timezone: 'Africa/Nairobi', language: 'en', date_format: 'DD/MM/YYYY', notifications_email: true, notifications_push: true, notifications_sound: false, dashboard_layout: 'default', sidebar_collapsed: false, auto_refresh_interval: 60 });
    showToast('Preferences reset to defaults');
  };

  const themeIcons = { dark: Moon, light: Sun, system: Monitor };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Preferences"
        breadcrumbs={[
          { label: 'Admin', path: '/dashboard/admin' },
          { label: 'Account' },
          { label: 'Preferences' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-[#444] transition-colors">
              <RotateCcw className="w-4 h-4" />Reset
            </button>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-gray-900 dark:text-white rounded-lg transition-colors disabled:opacity-50">
              <Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appearance */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sun className="w-5 h-5 text-gray-500 dark:text-white/50" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Appearance</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 dark:text-white/50 mb-2">Theme</label>
              <div className="grid grid-cols-3 gap-2">
                {(['dark', 'light', 'system'] as const).map(theme => {
                  const Icon = themeIcons[theme];
                  return (
                    <button key={theme} onClick={() => setPreferences({ ...preferences, theme })} className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm transition-colors capitalize ${preferences.theme === theme ? 'bg-red-600/20 border-red-600 text-red-400' : 'bg-gray-100 dark:bg-[#22272B] border-gray-300 dark:border-[#333] text-gray-500 dark:text-white/60 hover:border-gray-300 dark:hover:border-[#444]'}`}>
                      <Icon className="w-4 h-4" />{theme}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-white/50 mb-2">Dashboard Layout</label>
              <div className="grid grid-cols-3 gap-2">
                {(['default', 'compact', 'expanded'] as const).map(layout => (
                  <button key={layout} onClick={() => setPreferences({ ...preferences, dashboard_layout: layout })} className={`px-3 py-2.5 rounded-lg border text-sm transition-colors capitalize ${preferences.dashboard_layout === layout ? 'bg-red-600/20 border-red-600 text-red-400' : 'bg-gray-100 dark:bg-[#22272B] border-gray-300 dark:border-[#333] text-gray-500 dark:text-white/60 hover:border-gray-300 dark:hover:border-[#444]'}`}>
                    {layout}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Localization */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-gray-500 dark:text-white/50" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Localization</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 dark:text-white/50 mb-1.5">Timezone</label>
              <select value={preferences.timezone} onChange={e => setPreferences({ ...preferences, timezone: e.target.value })} className="w-full px-3 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-gray-300 dark:focus:border-[#444]">
                <option value="Africa/Nairobi">Africa/Nairobi (EAT +03:00)</option>
                <option value="UTC">UTC (+00:00)</option>
                <option value="America/New_York">America/New York (EST -05:00)</option>
                <option value="Europe/London">Europe/London (GMT +00:00)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-white/50 mb-1.5">Language</label>
              <select value={preferences.language} onChange={e => setPreferences({ ...preferences, language: e.target.value })} className="w-full px-3 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-gray-300 dark:focus:border-[#444]">
                <option value="en">English</option>
                <option value="sw">Swahili</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-white/50 mb-1.5">Date Format</label>
              <select value={preferences.date_format} onChange={e => setPreferences({ ...preferences, date_format: e.target.value })} className="w-full px-3 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-gray-300 dark:focus:border-[#444]">
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-gray-500 dark:text-white/50" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Notifications</h3>
          </div>
          <div className="space-y-3">
            {([
              { key: 'notifications_email' as const, label: 'Email Notifications', desc: 'Receive email for critical alerts' },
              { key: 'notifications_push' as const, label: 'Push Notifications', desc: 'Browser push for real-time updates' },
              { key: 'notifications_sound' as const, label: 'Sound Alerts', desc: 'Play sound on new notifications' },
            ]).map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between py-2">
                <div>
                  <div className="text-sm text-gray-900 dark:text-white">{label}</div>
                  <div className="text-xs text-gray-400 dark:text-white/40">{desc}</div>
                </div>
                <button onClick={() => setPreferences({ ...preferences, [key]: !preferences[key] })} className={`relative w-11 h-6 rounded-full transition-colors ${preferences[key] ? 'bg-emerald-500' : 'bg-[#333]'}`}>
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${preferences[key] ? 'left-[22px]' : 'left-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Dashboard Settings */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Layout className="w-5 h-5 text-gray-500 dark:text-white/50" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Dashboard Settings</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 dark:text-white/50 mb-1.5">Auto-Refresh Interval</label>
              <select value={preferences.auto_refresh_interval} onChange={e => setPreferences({ ...preferences, auto_refresh_interval: Number(e.target.value) })} className="w-full px-3 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-gray-300 dark:focus:border-[#444]">
                <option value={15}>15 seconds</option>
                <option value={30}>30 seconds</option>
                <option value={60}>60 seconds</option>
                <option value={120}>2 minutes</option>
                <option value={0}>Disabled</option>
              </select>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-sm text-gray-900 dark:text-white">Collapsed Sidebar</div>
                <div className="text-xs text-gray-400 dark:text-white/40">Start with sidebar collapsed by default</div>
              </div>
              <button onClick={() => setPreferences({ ...preferences, sidebar_collapsed: !preferences.sidebar_collapsed })} className={`relative w-11 h-6 rounded-full transition-colors ${preferences.sidebar_collapsed ? 'bg-emerald-500' : 'bg-[#333]'}`}>
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${preferences.sidebar_collapsed ? 'left-[22px]' : 'left-0.5'}`} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Keyboard Shortcuts */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Keyboard className="w-5 h-5 text-gray-500 dark:text-white/50" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">Keyboard Shortcuts</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-[#22272B]">
                <th className="text-left py-2.5 px-3 text-gray-500 dark:text-white/50 font-medium text-xs">Shortcut</th>
                <th className="text-left py-2.5 px-3 text-gray-500 dark:text-white/50 font-medium text-xs">Action</th>
                <th className="text-left py-2.5 px-3 text-gray-500 dark:text-white/50 font-medium text-xs">Category</th>
              </tr>
            </thead>
            <tbody>
              {[
                { keys: ['Ctrl', 'K'], action: 'Open command palette', category: 'General' },
                { keys: ['Ctrl', '/'], action: 'Toggle sidebar', category: 'General' },
                { keys: ['Ctrl', 'Shift', 'N'], action: 'Open notifications', category: 'General' },
                { keys: ['G', 'D'], action: 'Go to Dashboard', category: 'Navigation' },
                { keys: ['G', 'U'], action: 'Go to Users', category: 'Navigation' },
                { keys: ['G', 'T'], action: 'Go to Tickets', category: 'Navigation' },
                { keys: ['G', 'A'], action: 'Go to Audit Logs', category: 'Navigation' },
                { keys: ['Esc'], action: 'Close modal / Cancel', category: 'Actions' },
                { keys: ['Ctrl', 'S'], action: 'Save current form', category: 'Actions' },
                { keys: ['Ctrl', 'Enter'], action: 'Submit / Confirm', category: 'Actions' },
                { keys: ['?'], action: 'Show keyboard shortcuts', category: 'Help' },
              ].map((shortcut, idx) => (
                <tr key={idx} className="border-b border-gray-200 dark:border-[#22272B]/50">
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, i) => (
                        <React.Fragment key={i}>
                          {i > 0 && <span className="text-gray-400 dark:text-gray-300 dark:text-white/20 text-xs mx-0.5">+</span>}
                          <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded text-[11px] text-gray-600 dark:text-white/70 font-mono">{key}</kbd>
                        </React.Fragment>
                      ))}
                    </div>
                  </td>
                  <td className="py-2 px-3 text-gray-500 dark:text-white/60 text-xs">{shortcut.action}</td>
                  <td className="py-2 px-3 text-gray-400 dark:text-white/40 text-xs">{shortcut.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
      {toast && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className={`flex items-center gap-3 px-5 py-3 rounded-lg shadow-xl ${
            toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
          }`}>
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPreferencesPage;
