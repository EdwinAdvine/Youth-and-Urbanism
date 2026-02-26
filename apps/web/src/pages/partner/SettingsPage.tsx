import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  Lock,
  Globe,
  Trash2,
  Mail,
  Building2,
  ChevronRight,
  Check,
} from 'lucide-react';
import PartnerPageHeader from '../../components/partner/shared/PartnerPageHeader';

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface SettingsState {
  notifications: {
    email: boolean;
    push: boolean;
    weeklyDigest: boolean;
    paymentAlerts: boolean;
    childProgressAlerts: boolean;
    consentStatusAlerts: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: '15' | '30' | '60' | '120';
  };
  regional: {
    language: 'English' | 'Kiswahili';
    timezone: 'EAT' | 'UTC' | 'GMT';
    currency: 'KES' | 'USD' | 'GBP' | 'EUR';
  };
}

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SettingsState>({
    notifications: {
      email: true,
      push: true,
      weeklyDigest: true,
      paymentAlerts: true,
      childProgressAlerts: true,
      consentStatusAlerts: true,
    },
    security: {
      twoFactorEnabled: false,
      sessionTimeout: '30',
    },
    regional: {
      language: 'English',
      timezone: 'EAT',
      currency: 'KES',
    },
  });

  const [isSaved, setIsSaved] = useState(false);

  const toggleNotification = (key: keyof SettingsState['notifications']) => {
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key],
      },
    }));
    setIsSaved(false);
  };

  const toggleTwoFactor = () => {
    setSettings((prev) => ({
      ...prev,
      security: {
        ...prev.security,
        twoFactorEnabled: !prev.security.twoFactorEnabled,
      },
    }));
    setIsSaved(false);
  };

  const updateSessionTimeout = (value: '15' | '30' | '60' | '120') => {
    setSettings((prev) => ({
      ...prev,
      security: {
        ...prev.security,
        sessionTimeout: value,
      },
    }));
    setIsSaved(false);
  };

  const updateLanguage = (lang: 'English' | 'Kiswahili') => {
    setSettings((prev) => ({
      ...prev,
      regional: {
        ...prev.regional,
        language: lang,
      },
    }));
    setIsSaved(false);
  };

  const updateTimezone = (tz: 'EAT' | 'UTC' | 'GMT') => {
    setSettings((prev) => ({
      ...prev,
      regional: {
        ...prev.regional,
        timezone: tz,
      },
    }));
    setIsSaved(false);
  };

  const updateCurrency = (curr: 'KES' | 'USD' | 'GBP' | 'EUR') => {
    setSettings((prev) => ({
      ...prev,
      regional: {
        ...prev.regional,
        currency: curr,
      },
    }));
    setIsSaved(false);
  };

  const handleSaveSettings = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const ToggleSwitch: React.FC<{ enabled: boolean; onChange: () => void }> = ({ enabled, onChange }) => (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-[#E40000]' : 'bg-gray-100 dark:bg-[#22272B]'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F1112] p-6">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto space-y-6"
      >
        {/* Header */}
        <motion.div variants={fadeUp}>
          <PartnerPageHeader
            title="Settings"
            subtitle="Manage your account preferences and security settings"
            breadcrumbs={[{ label: 'Settings' }]}
          />
        </motion.div>

        {/* Settings Grid */}
        <motion.div variants={stagger} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notification Settings Card */}
          <motion.div
            variants={fadeUp}
            className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl overflow-hidden"
          >
            {/* Card Header */}
            <div className="p-4 border-b border-gray-200 dark:border-[#22272B] bg-gray-50 dark:bg-[#0F1112]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Bell className="w-5 h-5 text-blue-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notification Settings</h2>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-4 space-y-0">
              {/* Email Notifications */}
              <div className="flex items-center justify-between py-4 px-2 border-b border-gray-200 dark:border-[#22272B]">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                  <p className="text-xs text-gray-500 dark:text-white/50 mt-1">Receive updates via email</p>
                </div>
                <ToggleSwitch
                  enabled={settings.notifications.email}
                  onChange={() => toggleNotification('email')}
                />
              </div>

              {/* Push Notifications */}
              <div className="flex items-center justify-between py-4 px-2 border-b border-gray-200 dark:border-[#22272B]">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Push Notifications</p>
                  <p className="text-xs text-gray-500 dark:text-white/50 mt-1">Real-time browser alerts</p>
                </div>
                <ToggleSwitch
                  enabled={settings.notifications.push}
                  onChange={() => toggleNotification('push')}
                />
              </div>

              {/* Weekly Digest */}
              <div className="flex items-center justify-between py-4 px-2 border-b border-gray-200 dark:border-[#22272B]">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Weekly Digest</p>
                  <p className="text-xs text-gray-500 dark:text-white/50 mt-1">Summary of activities</p>
                </div>
                <ToggleSwitch
                  enabled={settings.notifications.weeklyDigest}
                  onChange={() => toggleNotification('weeklyDigest')}
                />
              </div>

              {/* Payment Alerts */}
              <div className="flex items-center justify-between py-4 px-2 border-b border-gray-200 dark:border-[#22272B]">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Payment Alerts</p>
                  <p className="text-xs text-gray-500 dark:text-white/50 mt-1">Billing and transaction updates</p>
                </div>
                <ToggleSwitch
                  enabled={settings.notifications.paymentAlerts}
                  onChange={() => toggleNotification('paymentAlerts')}
                />
              </div>

              {/* Child Progress Alerts */}
              <div className="flex items-center justify-between py-4 px-2 border-b border-gray-200 dark:border-[#22272B]">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Child Progress Alerts</p>
                  <p className="text-xs text-gray-500 dark:text-white/50 mt-1">Student performance updates</p>
                </div>
                <ToggleSwitch
                  enabled={settings.notifications.childProgressAlerts}
                  onChange={() => toggleNotification('childProgressAlerts')}
                />
              </div>

              {/* Consent Status Alerts */}
              <div className="flex items-center justify-between py-4 px-2">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Consent Status Alerts</p>
                  <p className="text-xs text-gray-500 dark:text-white/50 mt-1">Parental consent reminders</p>
                </div>
                <ToggleSwitch
                  enabled={settings.notifications.consentStatusAlerts}
                  onChange={() => toggleNotification('consentStatusAlerts')}
                />
              </div>
            </div>
          </motion.div>

          {/* Security Settings Card */}
          <motion.div
            variants={fadeUp}
            className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl overflow-hidden"
          >
            {/* Card Header */}
            <div className="p-4 border-b border-gray-200 dark:border-[#22272B] bg-gray-50 dark:bg-[#0F1112]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Lock className="w-5 h-5 text-green-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Security Settings</h2>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-4 space-y-0">
              {/* Two-Factor Authentication */}
              <div className="flex items-center justify-between py-4 px-2 border-b border-gray-200 dark:border-[#22272B]">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
                  <p className="text-xs text-gray-500 dark:text-white/50 mt-1">Enhance account security</p>
                </div>
                <ToggleSwitch
                  enabled={settings.security.twoFactorEnabled}
                  onChange={toggleTwoFactor}
                />
              </div>

              {/* Session Timeout */}
              <div className="py-4 px-2 border-b border-gray-200 dark:border-[#22272B]">
                <p className="font-medium text-gray-900 dark:text-white mb-3">Session Timeout</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(['15', '30', '60', '120'] as const).map((minutes) => (
                    <button
                      key={minutes}
                      onClick={() => updateSessionTimeout(minutes as '15' | '30' | '60' | '120')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                        settings.security.sessionTimeout === minutes
                          ? 'bg-[#E40000] text-gray-900 dark:text-white border-[#E40000]'
                          : 'border-gray-200 dark:border-[#22272B] text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-[#2A2F34]'
                      }`}
                    >
                      {minutes}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Change Password */}
              <div className="py-4 px-2">
                <button className="w-full flex items-center justify-between px-3 py-3 rounded-lg bg-gray-100 dark:bg-[#22272B] hover:bg-gray-200 dark:hover:bg-[#2C3238] text-gray-900 dark:text-white transition-colors">
                  <span className="font-medium">Change Password</span>
                  <ChevronRight className="w-4 h-4 text-gray-500 dark:text-white/50" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Regional Settings Card */}
          <motion.div
            variants={fadeUp}
            className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl overflow-hidden"
          >
            {/* Card Header */}
            <div className="p-4 border-b border-gray-200 dark:border-[#22272B] bg-gray-50 dark:bg-[#0F1112]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Globe className="w-5 h-5 text-purple-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Regional Settings</h2>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-4 space-y-0">
              {/* Language */}
              <div className="py-4 px-2 border-b border-gray-200 dark:border-[#22272B]">
                <p className="font-medium text-gray-900 dark:text-white mb-3">Language</p>
                <div className="flex gap-2">
                  {(['English', 'Kiswahili'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => updateLanguage(lang)}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                        settings.regional.language === lang
                          ? 'bg-[#E40000] text-gray-900 dark:text-white border-[#E40000]'
                          : 'border-gray-200 dark:border-[#22272B] text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* Timezone */}
              <div className="py-4 px-2 border-b border-gray-200 dark:border-[#22272B]">
                <p className="font-medium text-gray-900 dark:text-white mb-3">Timezone</p>
                <div className="flex gap-2">
                  {(['EAT', 'UTC', 'GMT'] as const).map((tz) => (
                    <button
                      key={tz}
                      onClick={() => updateTimezone(tz)}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                        settings.regional.timezone === tz
                          ? 'bg-[#E40000] text-gray-900 dark:text-white border-[#E40000]'
                          : 'border-gray-200 dark:border-[#22272B] text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      {tz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Currency */}
              <div className="py-4 px-2">
                <p className="font-medium text-gray-900 dark:text-white mb-3">Currency</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(['KES', 'USD', 'GBP', 'EUR'] as const).map((curr) => (
                    <button
                      key={curr}
                      onClick={() => updateCurrency(curr)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                        settings.regional.currency === curr
                          ? 'bg-[#E40000] text-gray-900 dark:text-white border-[#E40000]'
                          : 'border-gray-200 dark:border-[#22272B] text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Account Actions Card */}
          <motion.div
            variants={fadeUp}
            className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl overflow-hidden"
          >
            {/* Card Header */}
            <div className="p-4 border-b border-gray-200 dark:border-[#22272B] bg-gray-50 dark:bg-[#0F1112]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Building2 className="w-5 h-5 text-orange-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Account Actions</h2>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-4 space-y-0">
              {/* Change Email */}
              <div className="py-4 px-2 border-b border-gray-200 dark:border-[#22272B]">
                <button className="w-full flex items-center justify-between px-3 py-3 rounded-lg bg-gray-100 dark:bg-[#22272B] hover:bg-gray-200 dark:hover:bg-[#2C3238] text-gray-900 dark:text-white transition-colors">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500 dark:text-white/60" />
                    <span className="font-medium">Change Email</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-500 dark:text-white/50" />
                </button>
              </div>

              {/* Update Organization Info */}
              <div className="py-4 px-2 border-b border-gray-200 dark:border-[#22272B]">
                <button className="w-full flex items-center justify-between px-3 py-3 rounded-lg bg-gray-100 dark:bg-[#22272B] hover:bg-gray-200 dark:hover:bg-[#2C3238] text-gray-900 dark:text-white transition-colors">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-500 dark:text-white/60" />
                    <span className="font-medium">Update Organization Info</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-500 dark:text-white/50" />
                </button>
              </div>

              {/* Deactivate Account */}
              <div className="py-4 px-2">
                <button className="w-full flex items-center justify-between px-3 py-3 rounded-lg bg-red-500/10 hover:bg-red-500/15 text-red-400 transition-colors border border-red-500/20">
                  <div className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    <span className="font-medium">Deactivate Account</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Save Button + Success Message */}
        <motion.div variants={fadeUp} className="flex items-center justify-between gap-4 pt-6 border-t border-gray-200 dark:border-[#22272B]">
          <div>
            {isSaved && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2 text-green-400"
              >
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">Settings saved successfully</span>
              </motion.div>
            )}
          </div>
          <button
            onClick={handleSaveSettings}
            className="px-6 py-3 bg-[#E40000] text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
          >
            Save Settings
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SettingsPage;
