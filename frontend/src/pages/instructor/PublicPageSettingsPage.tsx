import React, { useEffect, useState } from 'react';
import { Globe, Save, Eye, Camera, Link, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { InstructorPageHeader } from '../../components/instructor/shared/InstructorPageHeader';
import apiClient from '../../services/api';


interface ProfileSettings {
  public_profile_enabled: boolean;
  public_slug: string;
  profile_photo_url: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  social_links: {
    twitter: string;
    linkedin: string;
    website: string;
  };
}

const defaultSettings: ProfileSettings = {
  public_profile_enabled: true,
  public_slug: '',
  profile_photo_url: '',
  seo_title: '',
  seo_description: '',
  seo_keywords: '',
  social_links: {
    twitter: '',
    linkedin: '',
    website: '',
  },
};

export const PublicPageSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<ProfileSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/v1/instructor/account/profile');

      if (response.data) {
        setSettings({
          public_profile_enabled: response.data.public_profile_enabled ?? true,
          public_slug: response.data.public_slug ?? '',
          profile_photo_url: response.data.profile_photo_url ?? '',
          seo_title: response.data.seo_title ?? '',
          seo_description: response.data.seo_description ?? '',
          seo_keywords: response.data.seo_keywords ?? '',
          social_links: {
            twitter: response.data.social_links?.twitter ?? '',
            linkedin: response.data.social_links?.linkedin ?? '',
            website: response.data.social_links?.website ?? '',
          },
        });
      }
    } catch (error) {
      console.error('Error fetching profile settings:', error);
      // Use defaults on error so the form is still usable
      setSettings({
        ...defaultSettings,
        public_slug: 'john-instructor',
        seo_title: 'John Instructor - Mathematics & Science Teacher',
        seo_description: 'Experienced mathematics and science instructor helping students excel in CBC curriculum',
        seo_keywords: 'mathematics teacher, science instructor, CBC, Kenya education',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setFeedback(null);

      await apiClient.put(
        '/api/v1/instructor/account/profile',
        {
          public_profile_enabled: settings.public_profile_enabled,
          public_slug: settings.public_slug,
          profile_photo_url: settings.profile_photo_url,
          seo_title: settings.seo_title,
          seo_description: settings.seo_description,
          seo_keywords: settings.seo_keywords,
          social_links: settings.social_links,
        }
      );

      setFeedback({ type: 'success', message: 'Profile settings saved successfully!' });
    } catch (error: any) {
      console.error('Error saving profile settings:', error);
      const message =
        error.response?.data?.detail || 'Failed to save profile settings. Please try again.';
      setFeedback({ type: 'error', message });
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    if (settings.public_slug) {
      window.open(`/instructor/${settings.public_slug}`, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <InstructorPageHeader
        title="Public Profile Settings"
        description="Configure your public instructor profile and SEO settings"
        icon={<Globe className="w-6 h-6 text-purple-400" />}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handlePreview}
              disabled={!settings.public_slug}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        }
      />

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl border ${
            feedback.type === 'success'
              ? 'bg-green-500/10 border-green-500/30 text-green-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="text-sm font-medium">{feedback.message}</span>
        </div>
      )}

      {/* Profile Photo & Enable/Disable */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Photo URL */}
        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile Photo</h3>
          <div className="flex flex-col items-center gap-4">
            {settings.profile_photo_url ? (
              <img
                src={settings.profile_photo_url}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-2 border-purple-500/30"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div
              className={`w-32 h-32 rounded-full bg-purple-500/20 flex items-center justify-center ${
                settings.profile_photo_url ? 'hidden' : ''
              }`}
            >
              <Camera className="w-16 h-16 text-purple-400" />
            </div>
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-600 dark:text-white/80 mb-2">
                Photo URL
              </label>
              <input
                type="url"
                value={settings.profile_photo_url}
                onChange={(e) => setSettings({ ...settings, profile_photo_url: e.target.value })}
                placeholder="https://example.com/photo.jpg"
                className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-purple-500/50 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Enable/Disable + URL */}
        <div className="lg:col-span-2 bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-6 space-y-6">
          {/* Enable/Disable */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Public Profile
              </h3>
              <p className="text-sm text-gray-500 dark:text-white/60">
                Allow students to discover your profile page
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.public_profile_enabled}
                onChange={(e) =>
                  setSettings({ ...settings, public_profile_enabled: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 dark:bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
            </label>
          </div>

          {/* Public URL */}
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-white/80 mb-2">
              Public URL Slug
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-white/60">
                urbanhomeschool.co.ke/instructor/
              </span>
              <input
                type="text"
                value={settings.public_slug}
                onChange={(e) => setSettings({ ...settings, public_slug: e.target.value })}
                className="flex-1 px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50"
              />
            </div>
          </div>

          {!settings.public_profile_enabled && (
            <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <p className="text-sm text-orange-300">
                Your public profile is currently disabled. Students will not be able to find your
                profile page.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Link className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Social Links</h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-white/60 mb-4">
          Add your social media profiles to your public page
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-white/80 mb-2">
              Twitter / X
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-white/40">
                @
              </span>
              <input
                type="text"
                value={settings.social_links.twitter}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    social_links: { ...settings.social_links, twitter: e.target.value },
                  })
                }
                placeholder="username"
                className="w-full pl-8 pr-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-purple-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-white/80 mb-2">
              LinkedIn
            </label>
            <input
              type="url"
              value={settings.social_links.linkedin}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  social_links: { ...settings.social_links, linkedin: e.target.value },
                })
              }
              placeholder="https://linkedin.com/in/username"
              className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-purple-500/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-white/80 mb-2">
              Website
            </label>
            <input
              type="url"
              value={settings.social_links.website}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  social_links: { ...settings.social_links, website: e.target.value },
                })
              }
              placeholder="https://yourwebsite.com"
              className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-purple-500/50"
            />
          </div>
        </div>
      </div>

      {/* SEO Settings */}
      <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-6 space-y-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
          SEO & Search Settings
        </h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-white/80 mb-2">
              Page Title
            </label>
            <input
              type="text"
              value={settings.seo_title}
              onChange={(e) => setSettings({ ...settings, seo_title: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50"
            />
            <p className="text-xs text-gray-500 dark:text-white/40 mt-1">
              {settings.seo_title.length}/70 characters recommended
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-white/80 mb-2">
              Meta Description
            </label>
            <textarea
              value={settings.seo_description}
              onChange={(e) => setSettings({ ...settings, seo_description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50 resize-none"
            />
            <p className="text-xs text-gray-500 dark:text-white/40 mt-1">
              {settings.seo_description.length}/160 characters recommended
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-white/80 mb-2">
              Keywords (comma-separated)
            </label>
            <input
              type="text"
              value={settings.seo_keywords}
              onChange={(e) => setSettings({ ...settings, seo_keywords: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50"
            />
          </div>
        </div>
      </div>

      {/* SEO Preview */}
      <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-6">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Search Engine Preview
        </h4>
        <div className="p-4 bg-white dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10">
          <p className="text-blue-600 dark:text-blue-400 text-lg font-medium truncate">
            {settings.seo_title || 'Your Page Title'}
          </p>
          <p className="text-green-700 dark:text-green-400 text-sm mt-1">
            urbanhomeschool.co.ke/instructor/{settings.public_slug || 'your-slug'}
          </p>
          <p className="text-gray-600 dark:text-white/60 text-sm mt-1 line-clamp-2">
            {settings.seo_description || 'Your meta description will appear here...'}
          </p>
        </div>
      </div>
    </div>
  );
};
