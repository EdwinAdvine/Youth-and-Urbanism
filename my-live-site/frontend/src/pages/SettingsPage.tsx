// SettingsPage - Authenticated page at /settings. Provides theme, notification, privacy,
// and accessibility preferences for all user roles.
import React, { useState, useEffect } from 'react';
import {
  Save,
  RotateCcw,
  Sun,
  Moon,
  Monitor,
  Bell,
  Lock,
  Eye,
  EyeOff,
  Mail,
  MessageSquare,
  BookOpen,
  Users,
  Activity,
  Sparkles,
  Shield,
  Volume2,
  Video,
  Type,
  Check,
  AlertCircle
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useThemeStore, useUserStore } from '../store';
import apiClient from '../services/api';

interface UserSettings {
  // Appearance
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'sw';
  fontSize: 'small' | 'medium' | 'large';

  // Notifications
  notifications: {
    email: boolean;
    push: boolean;
    types: string[];
    frequency: 'immediate' | 'daily' | 'weekly';
  };

  // Privacy
  privacy: {
    profileVisibility: 'public' | 'private';
    showProgressToParents: boolean;
    allowForumPosts: boolean;
    analytics: boolean;
    personalization: boolean;
  };

  // Learning Preferences (Students only)
  learning?: {
    responseMode: 'text' | 'voice_text' | 'video_text';
    aiPersonality: 'encouraging' | 'professional' | 'friendly';
    difficulty: 'easier' | 'standard' | 'challenging';
  };

  // Parental Controls (Parents only)
  parentalControls?: {
    screenTimeLimit: number; // minutes per day
    contentFilter: boolean;
    activityReportsFrequency: 'daily' | 'weekly' | 'monthly';
  };
}

const defaultSettings: UserSettings = {
  theme: 'dark',
  language: 'en',
  fontSize: 'medium',
  notifications: {
    email: true,
    push: false,
    types: ['assignments', 'grades', 'course_updates', 'messages'],
    frequency: 'immediate'
  },
  privacy: {
    profileVisibility: 'public',
    showProgressToParents: true,
    allowForumPosts: true,
    analytics: true,
    personalization: true
  },
  learning: {
    responseMode: 'text',
    aiPersonality: 'encouraging',
    difficulty: 'standard'
  }
};

const SettingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const { updatePreferences } = useUserStore();

  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [originalSettings, setOriginalSettings] = useState<UserSettings>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Sync theme with theme store
  useEffect(() => {
    setSettings(prev => ({ ...prev, theme }));
  }, [theme]);

  // Check for changes
  useEffect(() => {
    const changed = JSON.stringify(settings) !== JSON.stringify(originalSettings);
    setHasChanges(changed);
  }, [settings, originalSettings]);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      // Try to load from backend profile_data.settings
      const response = await apiClient.get('/api/v1/users/me');
      const profileSettings = response.data?.profile_data?.settings;
      if (profileSettings) {
        const loadedSettings = { ...defaultSettings, ...profileSettings };
        setSettings(loadedSettings);
        setOriginalSettings(loadedSettings);
      } else {
        throw new Error('No settings in profile');
      }
    } catch (error) {
      // Fallback to localStorage
      const savedSettings = localStorage.getItem('userSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
        setOriginalSettings(parsed);
      } else {
        // Use defaults with current theme
        const initialSettings = { ...defaultSettings, theme };
        setSettings(initialSettings);
        setOriginalSettings(initialSettings);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      // Update theme store
      setTheme(settings.theme);

      // Update user preferences store
      updatePreferences({
        theme: settings.theme,
        language: settings.language,
        notifications: settings.notifications.email,
        emailNotifications: settings.notifications.email,
        pushNotifications: settings.notifications.push
      });

      // Save to localStorage (optimistic update)
      localStorage.setItem('userSettings', JSON.stringify(settings));

      // Save to backend via profile_data
      await apiClient.put('/api/v1/users/me', { profile_data: { settings } });

      setOriginalSettings(settings);
      setHasChanges(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      // Settings still saved to localStorage
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
    setShowResetConfirm(false);
  };

  const updateSetting = (path: string, value: any) => {
    setSettings(prev => {
      const keys = path.split('.');
      const newSettings = { ...prev };
      let current: any = newSettings;

      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  const toggleNotificationType = (type: string) => {
    const types = settings.notifications.types;
    const newTypes = types.includes(type)
      ? types.filter(t => t !== type)
      : [...types, type];
    updateSetting('notifications.types', newTypes);
  };

  if (isLoading) {
    return (
      <>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
              <p className="text-gray-500 dark:text-white/60 mt-1">Manage your account preferences and settings</p>
            </div>
            {hasChanges && (
              <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/20 border border-orange-500/50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-orange-400" />
                <span className="text-sm text-orange-400 font-medium">Unsaved changes</span>
              </div>
            )}
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-green-500/20 border border-green-500/50 rounded-lg">
            <Check className="w-5 h-5 text-green-400" />
            <span className="text-green-400 font-medium">Settings saved successfully!</span>
          </div>
        )}

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Appearance Settings */}
          <section className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Sparkles className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Appearance</h2>
                <p className="text-sm text-gray-500 dark:text-white/60">Customize how the platform looks</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Theme Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">Theme</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { value: 'light', label: 'Light', icon: Sun },
                    { value: 'dark', label: 'Dark', icon: Moon },
                    { value: 'system', label: 'System', icon: Monitor }
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => updateSetting('theme', value)}
                      className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                        settings.theme === value
                          ? 'bg-blue-500/20 border-blue-500'
                          : 'bg-gray-100 dark:bg-[#22272B] border-[#2A3035] hover:border-[#3A4045]'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${settings.theme === value ? 'text-blue-400' : 'text-gray-500 dark:text-white/60'}`} />
                      <span className={`font-medium ${settings.theme === value ? 'text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Language Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">Language</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { value: 'en', label: 'English', flag: '🇬🇧' },
                    { value: 'sw', label: 'Kiswahili', flag: '🇰🇪', disabled: true }
                  ].map(({ value, label, flag, disabled }) => (
                    <button
                      key={value}
                      onClick={() => !disabled && updateSetting('language', value)}
                      disabled={disabled}
                      className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                        settings.language === value
                          ? 'bg-blue-500/20 border-blue-500'
                          : disabled
                          ? 'bg-gray-100 dark:bg-[#22272B] border-[#2A3035] opacity-50 cursor-not-allowed'
                          : 'bg-gray-100 dark:bg-[#22272B] border-[#2A3035] hover:border-[#3A4045]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{flag}</span>
                        <span className={`font-medium ${settings.language === value ? 'text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                          {label}
                        </span>
                      </div>
                      {disabled && <span className="text-xs text-gray-400 dark:text-white/40">Coming soon</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">Font Size</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { value: 'small', label: 'Small', icon: Type },
                    { value: 'medium', label: 'Medium', icon: Type },
                    { value: 'large', label: 'Large', icon: Type }
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => updateSetting('fontSize', value)}
                      className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                        settings.fontSize === value
                          ? 'bg-blue-500/20 border-blue-500'
                          : 'bg-gray-100 dark:bg-[#22272B] border-[#2A3035] hover:border-[#3A4045]'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${settings.fontSize === value ? 'text-blue-400' : 'text-gray-500 dark:text-white/60'}`} />
                      <span className={`font-medium ${settings.fontSize === value ? 'text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Notification Settings */}
          <section className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Bell className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Notifications</h2>
                <p className="text-sm text-gray-500 dark:text-white/60">Manage how you receive updates</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Email & Push Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-[#22272B] rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-500 dark:text-white/60" />
                    <span className="font-medium text-gray-900 dark:text-white">Email Notifications</span>
                  </div>
                  <button
                    onClick={() => updateSetting('notifications.email', !settings.notifications.email)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.notifications.email ? 'bg-blue-500' : 'bg-[#2A3035]'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.notifications.email ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-[#22272B] rounded-lg opacity-50">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-gray-500 dark:text-white/60" />
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white block">Push Notifications</span>
                      <span className="text-xs text-gray-400 dark:text-white/40">Coming soon</span>
                    </div>
                  </div>
                  <button
                    disabled
                    className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#2A3035] cursor-not-allowed"
                  >
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
                  </button>
                </div>
              </div>

              {/* Notification Types */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">Notification Types</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { value: 'assignments', label: 'New Assignments', icon: BookOpen },
                    { value: 'grades', label: 'Quiz Results', icon: Activity },
                    { value: 'course_updates', label: 'Course Updates', icon: Sparkles },
                    { value: 'messages', label: 'Messages from Instructors', icon: Mail },
                    { value: 'forum_replies', label: 'Community Forum Replies', icon: MessageSquare }
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => toggleNotificationType(value)}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        settings.notifications.types.includes(value)
                          ? 'bg-blue-500/20 border-blue-500'
                          : 'bg-gray-100 dark:bg-[#22272B] border-[#2A3035] hover:border-[#3A4045]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${settings.notifications.types.includes(value) ? 'text-blue-400' : 'text-gray-500 dark:text-white/60'}`} />
                      <span className={`text-sm ${settings.notifications.types.includes(value) ? 'text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                        {label}
                      </span>
                      {settings.notifications.types.includes(value) && (
                        <Check className="w-4 h-4 text-blue-400 ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">Notification Frequency</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { value: 'immediate', label: 'Immediately' },
                    { value: 'daily', label: 'Daily Digest' },
                    { value: 'weekly', label: 'Weekly Summary' }
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => updateSetting('notifications.frequency', value)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        settings.notifications.frequency === value
                          ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                          : 'bg-gray-100 dark:bg-[#22272B] border-[#2A3035] text-gray-900 dark:text-white hover:border-[#3A4045]'
                      }`}
                    >
                      <span className="font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Privacy Settings */}
          <section className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Lock className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Privacy</h2>
                <p className="text-sm text-gray-500 dark:text-white/60">Control your data and visibility</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Profile Visibility */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">Profile Visibility</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { value: 'public', label: 'Public', icon: Eye, description: 'Visible to all users' },
                    { value: 'private', label: 'Private', icon: EyeOff, description: 'Only instructors & admin' }
                  ].map(({ value, label, icon: Icon, description }) => (
                    <button
                      key={value}
                      onClick={() => updateSetting('privacy.profileVisibility', value)}
                      className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all text-left ${
                        settings.privacy.profileVisibility === value
                          ? 'bg-blue-500/20 border-blue-500'
                          : 'bg-gray-100 dark:bg-[#22272B] border-[#2A3035] hover:border-[#3A4045]'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mt-0.5 ${settings.privacy.profileVisibility === value ? 'text-blue-400' : 'text-gray-500 dark:text-white/60'}`} />
                      <div>
                        <span className={`font-medium block ${settings.privacy.profileVisibility === value ? 'text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                          {label}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-white/60">{description}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Privacy Toggles */}
              <div className="space-y-3">
                {user?.role === 'student' && (
                  <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-[#22272B] rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-gray-500 dark:text-white/60" />
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white block">Show Progress to Parents</span>
                        <span className="text-xs text-gray-500 dark:text-white/60">Allow parents to view your learning progress</span>
                      </div>
                    </div>
                    <button
                      onClick={() => updateSetting('privacy.showProgressToParents', !settings.privacy.showProgressToParents)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.privacy.showProgressToParents ? 'bg-blue-500' : 'bg-[#2A3035]'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.privacy.showProgressToParents ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-[#22272B] rounded-lg">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-gray-500 dark:text-white/60" />
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white block">Allow Forum Posts</span>
                      <span className="text-xs text-gray-500 dark:text-white/60">Enable posting in community forums</span>
                    </div>
                  </div>
                  <button
                    onClick={() => updateSetting('privacy.allowForumPosts', !settings.privacy.allowForumPosts)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.privacy.allowForumPosts ? 'bg-blue-500' : 'bg-[#2A3035]'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.privacy.allowForumPosts ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-[#22272B] rounded-lg">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-gray-500 dark:text-white/60" />
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white block">Analytics</span>
                      <span className="text-xs text-gray-500 dark:text-white/60">Help improve the platform with usage data</span>
                    </div>
                  </div>
                  <button
                    onClick={() => updateSetting('privacy.analytics', !settings.privacy.analytics)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.privacy.analytics ? 'bg-blue-500' : 'bg-[#2A3035]'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.privacy.analytics ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-[#22272B] rounded-lg">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-gray-500 dark:text-white/60" />
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white block">Personalization</span>
                      <span className="text-xs text-gray-500 dark:text-white/60">Personalized content recommendations</span>
                    </div>
                  </div>
                  <button
                    onClick={() => updateSetting('privacy.personalization', !settings.privacy.personalization)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.privacy.personalization ? 'bg-blue-500' : 'bg-[#2A3035]'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.privacy.personalization ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Learning Preferences (Students only) */}
          {user?.role === 'student' && (
            <section className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <BookOpen className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Learning Preferences</h2>
                  <p className="text-sm text-gray-500 dark:text-white/60">Customize your AI tutor experience</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Response Mode */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">Preferred Response Mode</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { value: 'text', label: 'Text Only', icon: Type },
                      { value: 'voice_text', label: 'Voice + Text', icon: Volume2 },
                      { value: 'video_text', label: 'Video + Text', icon: Video }
                    ].map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        onClick={() => updateSetting('learning.responseMode', value)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                          settings.learning?.responseMode === value
                            ? 'bg-blue-500/20 border-blue-500'
                            : 'bg-gray-100 dark:bg-[#22272B] border-[#2A3035] hover:border-[#3A4045]'
                        }`}
                      >
                        <Icon className={`w-6 h-6 ${settings.learning?.responseMode === value ? 'text-blue-400' : 'text-gray-500 dark:text-white/60'}`} />
                        <span className={`font-medium text-sm ${settings.learning?.responseMode === value ? 'text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                          {label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI Personality */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">AI Tutor Personality</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { value: 'encouraging', label: 'Encouraging', description: 'Supportive and motivating' },
                      { value: 'professional', label: 'Professional', description: 'Formal and focused' },
                      { value: 'friendly', label: 'Friendly', description: 'Casual and approachable' }
                    ].map(({ value, label, description }) => (
                      <button
                        key={value}
                        onClick={() => updateSetting('learning.aiPersonality', value)}
                        className={`flex flex-col items-start gap-1 p-4 rounded-lg border-2 transition-all text-left ${
                          settings.learning?.aiPersonality === value
                            ? 'bg-blue-500/20 border-blue-500'
                            : 'bg-gray-100 dark:bg-[#22272B] border-[#2A3035] hover:border-[#3A4045]'
                        }`}
                      >
                        <span className={`font-medium ${settings.learning?.aiPersonality === value ? 'text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                          {label}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-white/60">{description}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">Difficulty Preference</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { value: 'easier', label: 'Easier', description: 'More guidance' },
                      { value: 'standard', label: 'Standard', description: 'Balanced approach' },
                      { value: 'challenging', label: 'Challenging', description: 'Advanced concepts' }
                    ].map(({ value, label, description }) => (
                      <button
                        key={value}
                        onClick={() => updateSetting('learning.difficulty', value)}
                        className={`flex flex-col items-start gap-1 p-4 rounded-lg border-2 transition-all text-left ${
                          settings.learning?.difficulty === value
                            ? 'bg-blue-500/20 border-blue-500'
                            : 'bg-gray-100 dark:bg-[#22272B] border-[#2A3035] hover:border-[#3A4045]'
                        }`}
                      >
                        <span className={`font-medium ${settings.learning?.difficulty === value ? 'text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                          {label}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-white/60">{description}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Parental Controls (Parents only) */}
          {user?.role === 'parent' && (
            <section className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <Shield className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Parental Controls</h2>
                  <p className="text-sm text-gray-500 dark:text-white/60">Manage children's learning environment</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Screen Time Limit */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Daily Screen Time Limit (minutes)
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="480"
                    step="30"
                    value={settings.parentalControls?.screenTimeLimit || 120}
                    onChange={(e) => updateSetting('parentalControls.screenTimeLimit', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-[#22272B] border border-[#2A3035] rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 dark:text-white/60 mt-2">
                    Current limit: {settings.parentalControls?.screenTimeLimit || 120} minutes ({Math.floor((settings.parentalControls?.screenTimeLimit || 120) / 60)}h {(settings.parentalControls?.screenTimeLimit || 120) % 60}m)
                  </p>
                </div>

                {/* Content Filter */}
                <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-[#22272B] rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-gray-500 dark:text-white/60" />
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white block">Content Filters</span>
                      <span className="text-xs text-gray-500 dark:text-white/60">Filter age-inappropriate content</span>
                    </div>
                  </div>
                  <button
                    onClick={() => updateSetting('parentalControls.contentFilter', !settings.parentalControls?.contentFilter)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.parentalControls?.contentFilter ? 'bg-blue-500' : 'bg-[#2A3035]'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.parentalControls?.contentFilter ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Activity Reports */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">Activity Reports Frequency</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { value: 'daily', label: 'Daily' },
                      { value: 'weekly', label: 'Weekly' },
                      { value: 'monthly', label: 'Monthly' }
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => updateSetting('parentalControls.activityReportsFrequency', value)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          settings.parentalControls?.activityReportsFrequency === value
                            ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                            : 'bg-gray-100 dark:bg-[#22272B] border-[#2A3035] text-gray-900 dark:text-white hover:border-[#3A4045]'
                        }`}
                      >
                        <span className="font-medium">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 sticky bottom-4 bg-gradient-to-t from-gray-50 dark:from-[#0F1112] via-[#0F1112]/95 to-transparent pt-6 pb-4">
          <button
            onClick={saveSettings}
            disabled={!hasChanges || isSaving}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              hasChanges && !isSaving
                ? 'bg-blue-500 hover:bg-blue-600 text-gray-900 dark:text-white'
                : 'bg-gray-100 dark:bg-[#22272B] text-gray-400 dark:text-white/40 cursor-not-allowed'
            }`}
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Save All Settings</span>
              </>
            )}
          </button>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="sm:w-auto px-6 py-3 bg-gray-100 dark:bg-[#22272B] hover:bg-[#2A3035] border border-[#2A3035] text-gray-900 dark:text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Reset to Defaults</span>
          </button>
        </div>

        {/* Reset Confirmation Modal */}
        {showResetConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6 max-w-md w-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-orange-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Reset to Defaults?</h3>
              </div>
              <p className="text-gray-500 dark:text-white/60 mb-6">
                This will reset all settings to their default values. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={resetToDefaults}
                  className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-gray-900 dark:text-white rounded-lg font-medium transition-all"
                >
                  Reset Settings
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-[#22272B] hover:bg-[#2A3035] text-gray-900 dark:text-white rounded-lg font-medium transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SettingsPage;
