/**
 * AvatarPage — 3D Avatar Management
 *
 * Three tabs:
 * 1. Gallery — preset stylized + realistic avatars
 * 2. Photo Upload — selfie-to-avatar via RPM
 * 3. Customize — RPM iframe full editor
 *
 * Right panel: live 3D preview of selected avatar.
 */

import React, { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle,
  Grid3X3,
  Camera,
  Palette,
  Star,
  Trash2,
  Loader2,
} from 'lucide-react';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { useWebGLDetect } from '../../hooks/useWebGLDetect';
import { useAvatarStore } from '../../store/avatarStore';
import avatarService from '../../services/avatarService';
import AvatarThumbnail from '../../components/avatar/AvatarThumbnail';
import type { AvatarPreset, UserAvatar } from '../../types/avatar';

const AvatarCanvas = lazy(() => import('../../components/avatar/AvatarCanvas'));

type Tab = 'gallery' | 'upload' | 'customize';
type StyleFilter = 'all' | 'stylized' | 'realistic';

const AvatarPage: React.FC = () => {
  const navigate = useNavigate();
  const { borderRadius } = useAgeAdaptiveUI();
  const webglTier = useWebGLDetect();

  const {
    presetAvatars,
    userAvatars,
    activeAvatar,
    loadPresetAvatars,
    loadUserAvatars,
  } = useAvatarStore();

  const [tab, setTab] = useState<Tab>('gallery');
  const [styleFilter, setStyleFilter] = useState<StyleFilter>('all');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState('');
  const [saving, setSaving] = useState(false);
  const [activating, setActivating] = useState<string | null>(null);
  const [rpmUrl, setRpmUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadPresetAvatars();
    loadUserAvatars();
  }, [loadPresetAvatars, loadUserAvatars]);

  // Set initial preview
  useEffect(() => {
    if (activeAvatar) {
      setPreviewUrl(activeAvatar.model_url);
      setPreviewName(activeAvatar.name);
    } else if (presetAvatars.length > 0) {
      setPreviewUrl(presetAvatars[0].model_url);
      setPreviewName(presetAvatars[0].name);
    }
  }, [activeAvatar, presetAvatars]);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  /* ── Gallery handlers ─────────────────────────────────────────── */

  const filteredPresets = presetAvatars.filter(
    (p) => styleFilter === 'all' || p.style === styleFilter
  );

  const handleSelectPreset = useCallback(
    async (preset: AvatarPreset) => {
      setPreviewUrl(preset.model_url);
      setPreviewName(preset.name);
    },
    []
  );

  const handleSaveAndActivatePreset = useCallback(
    async (preset: AvatarPreset) => {
      setSaving(true);
      try {
        const saved = await avatarService.saveAvatar({
          name: preset.name,
          avatar_type: preset.style === 'stylized' ? 'preset_stylized' : 'preset_realistic',
          model_url: preset.model_url,
          thumbnail_url: preset.thumbnail_url,
        });
        await avatarService.activateAvatar(saved.id);
        await loadUserAvatars();
        showMessage(`${preset.name} activated!`, 'success');
      } catch {
        showMessage('Failed to save avatar', 'error');
      } finally {
        setSaving(false);
      }
    },
    [loadUserAvatars]
  );

  const handleActivateUserAvatar = useCallback(
    async (avatar: UserAvatar) => {
      setActivating(avatar.id);
      try {
        await avatarService.activateAvatar(avatar.id);
        await loadUserAvatars();
        setPreviewUrl(avatar.model_url);
        setPreviewName(avatar.name);
        showMessage(`${avatar.name} activated!`, 'success');
      } catch {
        showMessage('Failed to activate', 'error');
      } finally {
        setActivating(null);
      }
    },
    [loadUserAvatars]
  );

  const handleDeleteAvatar = useCallback(
    async (avatar: UserAvatar) => {
      try {
        await avatarService.deleteAvatar(avatar.id);
        await loadUserAvatars();
        showMessage('Avatar deleted', 'success');
      } catch {
        showMessage('Cannot delete active avatar', 'error');
      }
    },
    [loadUserAvatars]
  );

  /* ── RPM handlers ─────────────────────────────────────────────── */

  const handleOpenRPM = useCallback(async () => {
    try {
      const { rpm_session_url } = await avatarService.uploadPhoto();
      setRpmUrl(rpm_session_url);
      setTab('customize');
    } catch {
      showMessage('Failed to open editor', 'error');
    }
  }, []);

  // Listen for RPM iframe messages
  useEffect(() => {
    const handler = async (event: MessageEvent) => {
      // RPM sends avatar URL on completion
      if (typeof event.data === 'string' && event.data.includes('.glb')) {
        try {
          const avatar = await avatarService.rpmCallback({
            rpm_avatar_id: `rpm_${Date.now()}`,
            model_url: event.data,
          });
          await avatarService.activateAvatar(avatar.id);
          await loadUserAvatars();
          setPreviewUrl(avatar.model_url);
          setPreviewName(avatar.name);
          showMessage('Custom avatar created!', 'success');
          setTab('gallery');
        } catch {
          showMessage('Failed to save custom avatar', 'error');
        }
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [loadUserAvatars]);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'gallery', label: 'Gallery', icon: <Grid3X3 size={16} /> },
    { id: 'upload', label: 'Photo Upload', icon: <Camera size={16} /> },
    { id: 'customize', label: 'Customize', icon: <Palette size={16} /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className={`p-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 ${borderRadius}`}
        >
          <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-white" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            3D Avatar Studio
          </h1>
          <p className="text-gray-600 dark:text-white/70">
            Choose or create your AI tutor avatar
          </p>
        </div>
      </div>

      {/* Message toast */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              message.type === 'success'
                ? 'bg-green-900/30 text-green-300 border border-green-800'
                : 'bg-red-900/30 text-red-300 border border-red-800'
            }`}
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Tab content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tab bar */}
          <div className="flex gap-1 p-1 bg-[#181C1F] rounded-xl border border-[#22272B]">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  tab === t.id
                    ? 'bg-gradient-to-r from-[#FF0000] to-[#E40000] text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab: Gallery */}
          {tab === 'gallery' && (
            <div className="space-y-4">
              {/* Style filter */}
              <div className="flex gap-2">
                {(['all', 'stylized', 'realistic'] as StyleFilter[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setStyleFilter(f)}
                    className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${
                      styleFilter === f
                        ? 'bg-[#FF0000] text-white'
                        : 'bg-[#22272B] text-gray-400 hover:text-white'
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>

              {/* Preset grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filteredPresets.map((preset) => (
                  <motion.button
                    key={preset.id}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleSelectPreset(preset)}
                    onDoubleClick={() => handleSaveAndActivatePreset(preset)}
                    className={`relative rounded-xl overflow-hidden border-2 transition-colors aspect-square ${
                      previewUrl === preset.model_url
                        ? 'border-[#FF0000] shadow-[0_0_15px_rgba(255,0,0,0.3)]'
                        : 'border-[#22272B] hover:border-gray-600'
                    }`}
                  >
                    <img
                      src={preset.thumbnail_url}
                      alt={preset.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      <p className="text-xs text-white font-medium truncate">
                        {preset.name}
                      </p>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          preset.style === 'stylized'
                            ? 'bg-blue-900/50 text-blue-300'
                            : 'bg-purple-900/50 text-purple-300'
                        }`}
                      >
                        {preset.style}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>

              <p className="text-xs text-gray-500 text-center">
                Click to preview. Double-click to save and activate.
              </p>

              {/* User's saved avatars */}
              {userAvatars.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-[#22272B]">
                  <h3 className="text-sm font-semibold text-white">My Avatars</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {userAvatars.map((avatar) => (
                      <div
                        key={avatar.id}
                        className={`relative rounded-xl border-2 p-3 ${
                          avatar.is_active
                            ? 'border-[#FF0000] bg-red-900/10'
                            : 'border-[#22272B] bg-[#181C1F]'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <AvatarThumbnail size={28} />
                          <span className="text-sm text-white font-medium truncate">
                            {avatar.name}
                          </span>
                          {avatar.is_active && (
                            <CheckCircle size={14} className="text-green-400 flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex gap-2">
                          {!avatar.is_active && (
                            <button
                              onClick={() => handleActivateUserAvatar(avatar)}
                              disabled={activating === avatar.id}
                              className="flex-1 text-xs py-1.5 bg-[#FF0000] hover:bg-[#FF0000]/80 text-white rounded-lg transition-colors disabled:opacity-50"
                            >
                              {activating === avatar.id ? (
                                <Loader2 size={12} className="animate-spin mx-auto" />
                              ) : (
                                'Activate'
                              )}
                            </button>
                          )}
                          {!avatar.is_active && (
                            <button
                              onClick={() => handleDeleteAvatar(avatar)}
                              className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab: Photo Upload */}
          {tab === 'upload' && (
            <div className={`p-8 bg-[#181C1F] ${borderRadius} border border-[#22272B] text-center space-y-4`}>
              <div className="w-20 h-20 mx-auto bg-[#22272B] rounded-full flex items-center justify-center">
                <Camera size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                Create Avatar from Photo
              </h3>
              <p className="text-gray-400 text-sm max-w-md mx-auto">
                Upload a selfie and Ready Player Me will generate a personalized 3D
                avatar that looks like you. You can customize it further in the editor.
              </p>
              <button
                onClick={handleOpenRPM}
                className={`px-6 py-3 bg-gradient-to-r from-[#FF0000] to-[#E40000] text-white font-medium ${borderRadius} hover:shadow-[0_0_20px_rgba(255,0,0,0.3)] transition-all`}
              >
                Open Avatar Creator
              </button>
            </div>
          )}

          {/* Tab: Customize (RPM iframe) */}
          {tab === 'customize' && (
            <div className={`bg-[#181C1F] ${borderRadius} border border-[#22272B] overflow-hidden`}>
              {rpmUrl ? (
                <iframe
                  src={rpmUrl}
                  title="Ready Player Me Avatar Editor"
                  className="w-full border-0"
                  style={{ height: '600px' }}
                  allow="camera *; microphone *"
                />
              ) : (
                <div className="p-8 text-center space-y-4">
                  <Palette size={32} className="text-gray-400 mx-auto" />
                  <p className="text-gray-400">
                    Click "Open Avatar Creator" in the Photo Upload tab to start.
                  </p>
                  <button
                    onClick={handleOpenRPM}
                    className="px-4 py-2 bg-[#FF0000] text-white rounded-lg text-sm"
                  >
                    Open Editor
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Live 3D Preview */}
        <div className="space-y-4">
          <div
            className={`bg-[#181C1F] ${borderRadius} border border-[#22272B] overflow-hidden`}
            style={{ minHeight: 400 }}
          >
            <div className="px-4 py-3 border-b border-[#22272B]">
              <h3 className="text-sm font-semibold text-white">
                {previewName || 'Preview'}
              </h3>
            </div>
            {webglTier !== 'none' && previewUrl ? (
              <Suspense
                fallback={
                  <div className="flex items-center justify-center h-80 text-gray-500">
                    <Loader2 className="animate-spin mr-2" size={16} />
                    Loading 3D model...
                  </div>
                }
              >
                <AvatarCanvas
                  modelUrl={previewUrl}
                  enableControls
                  animate
                  height={350}
                />
              </Suspense>
            ) : (
              <div className="flex items-center justify-center h-80 text-gray-500 text-sm">
                {webglTier === 'none'
                  ? 'WebGL not supported on this device'
                  : 'Select an avatar to preview'}
              </div>
            )}
          </div>

          {previewUrl && webglTier !== 'none' && (
            <button
              onClick={() => {
                const preset = presetAvatars.find((p) => p.model_url === previewUrl);
                if (preset) handleSaveAndActivatePreset(preset);
              }}
              disabled={saving}
              className={`w-full py-3 bg-gradient-to-r from-[#FF0000] to-[#E40000] text-white font-medium ${borderRadius} flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(255,0,0,0.3)] transition-all disabled:opacity-50`}
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Star size={16} />
              )}
              {saving ? 'Saving...' : 'Save & Activate'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvatarPage;
