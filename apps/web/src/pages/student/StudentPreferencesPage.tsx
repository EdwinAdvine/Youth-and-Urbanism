import React, { useState } from 'react';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { useThemeStore } from '../../store';
import { Settings, Palette, Globe, Bell, Bot, Volume2, Sun, Moon, Monitor, Save, CheckCircle } from 'lucide-react';

const StudentPreferencesPage: React.FC = () => {
  const { borderRadius } = useAgeAdaptiveUI();
  const { theme, setTheme } = useThemeStore();
  const [language, setLanguage] = useState('en');
  const [aiPersonality, setAiPersonality] = useState('friendly');
  const [ageMode, setAgeMode] = useState<'auto' | 'young' | 'tween' | 'teen'>('auto');
  const [saved, setSaved] = useState(false);
  const [notifSettings, setNotifSettings] = useState({
    assignments: true,
    achievements: true,
    social: true,
    marketing: false,
    sound: true,
  });

  const toggleNotif = (key: keyof typeof notifSettings) => {
    setNotifSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const themeOptions = [
    { id: 'dark' as const, label: 'Dark', icon: Moon },
    { id: 'light' as const, label: 'Light', icon: Sun },
    { id: 'system' as const, label: 'System', icon: Monitor },
  ];

  const personalities = [
    { id: 'friendly', label: 'Friendly Teacher', desc: 'Warm and encouraging' },
    { id: 'coach', label: 'Motivating Coach', desc: 'Energetic and challenging' },
    { id: 'calm', label: 'Calm Guide', desc: 'Patient and gentle' },
    { id: 'fun', label: 'Fun Buddy', desc: 'Playful with jokes' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <Settings className="w-8 h-8 text-gray-500 dark:text-white/60" /> Preferences
        </h1>
        <p className="text-gray-600 dark:text-white/70">Customize your learning experience</p>
      </div>

      {/* Theme */}
      <div className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-purple-400" />
          <h3 className="text-gray-900 dark:text-white font-medium">Appearance</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-gray-500 dark:text-white/60 text-sm mb-2 block">Theme</label>
            <div className="flex gap-2">
              {themeOptions.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setTheme(opt.id)}
                    className={`flex-1 py-3 ${borderRadius} flex flex-col items-center gap-1 ${
                      theme === opt.id ? 'bg-[#FF0000]/20 border border-[#FF0000]/30 text-gray-900 dark:text-white' : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/60'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-gray-500 dark:text-white/60 text-sm mb-2 block">Age-Adaptive UI Mode</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['auto', 'young', 'tween', 'teen'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setAgeMode(mode)}
                  className={`py-2 ${borderRadius} text-sm capitalize ${
                    ageMode === mode ? 'bg-purple-500 text-gray-900 dark:text-white' : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/60'
                  }`}
                >
                  {mode === 'auto' ? 'Auto' : mode === 'young' ? '6-9' : mode === 'tween' ? '10-13' : '14-17'}
                </button>
              ))}
            </div>
            <p className="text-gray-400 dark:text-white/40 text-xs mt-1">Auto mode adjusts UI based on your grade level</p>
          </div>
        </div>
      </div>

      {/* Language */}
      <div className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-blue-400" />
          <h3 className="text-gray-900 dark:text-white font-medium">Language</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setLanguage('en')}
            className={`p-3 ${borderRadius} text-left ${
              language === 'en' ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-gray-50 dark:bg-white/5'
            }`}
          >
            <div className={language === 'en' ? 'text-blue-400' : 'text-gray-500 dark:text-white/60'}>English</div>
            <div className="text-gray-400 dark:text-white/40 text-xs">Default language</div>
          </button>
          <button
            onClick={() => setLanguage('sw')}
            className={`p-3 ${borderRadius} text-left ${
              language === 'sw' ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-gray-50 dark:bg-white/5'
            }`}
          >
            <div className={language === 'sw' ? 'text-blue-400' : 'text-gray-500 dark:text-white/60'}>Kiswahili</div>
            <div className="text-gray-400 dark:text-white/40 text-xs">Lugha ya Kiswahili</div>
          </button>
        </div>
      </div>

      {/* AI Personality */}
      <div className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
        <div className="flex items-center gap-2 mb-4">
          <Bot className="w-5 h-5 text-green-400" />
          <h3 className="text-gray-900 dark:text-white font-medium">AI Tutor Personality</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {personalities.map((p) => (
            <button
              key={p.id}
              onClick={() => setAiPersonality(p.id)}
              className={`p-3 ${borderRadius} text-left ${
                aiPersonality === p.id ? 'bg-green-500/20 border border-green-500/30' : 'bg-gray-50 dark:bg-white/5'
              }`}
            >
              <div className={`text-sm font-medium ${aiPersonality === p.id ? 'text-green-400' : 'text-gray-600 dark:text-white/70'}`}>{p.label}</div>
              <div className="text-gray-400 dark:text-white/40 text-xs">{p.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-yellow-400" />
          <h3 className="text-gray-900 dark:text-white font-medium">Notifications</h3>
        </div>
        <div className="space-y-3">
          {[
            { key: 'assignments' as const, label: 'Assignment Updates', desc: 'New assignments, grades, and deadlines' },
            { key: 'achievements' as const, label: 'Achievements', desc: 'Badges, XP, and level-ups' },
            { key: 'social' as const, label: 'Social', desc: 'Friend requests, messages, shoutouts' },
            { key: 'marketing' as const, label: 'Promotions', desc: 'New courses and special offers' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <div className="text-gray-900 dark:text-white text-sm">{item.label}</div>
                <div className="text-gray-400 dark:text-white/40 text-xs">{item.desc}</div>
              </div>
              <button
                onClick={() => toggleNotif(item.key)}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  notifSettings[item.key] ? 'bg-green-500' : 'bg-gray-200 dark:bg-white/20'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                  notifSettings[item.key] ? 'translate-x-5' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          ))}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-gray-400 dark:text-white/40" />
              <span className="text-gray-900 dark:text-white text-sm">Sound Effects</span>
            </div>
            <button
              onClick={() => toggleNotif('sound')}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                notifSettings.sound ? 'bg-green-500' : 'bg-gray-200 dark:bg-white/20'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                notifSettings.sound ? 'translate-x-5' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Save */}
      <button
        onClick={() => {
          localStorage.setItem('student_prefs', JSON.stringify({ language, aiPersonality, ageMode, notifSettings }));
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        }}
        className={`w-full py-3 ${saved ? 'bg-green-500' : 'bg-[#FF0000] hover:bg-[#FF0000]/80'} text-gray-900 dark:text-white font-bold ${borderRadius} flex items-center justify-center gap-2 transition-colors`}
      >
        {saved ? <><CheckCircle className="w-5 h-5" /> Saved!</> : <><Save className="w-5 h-5" /> Save Preferences</>}
      </button>
    </div>
  );
};

export default StudentPreferencesPage;
