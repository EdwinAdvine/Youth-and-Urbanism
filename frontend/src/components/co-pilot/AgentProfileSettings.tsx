import React, { useState, useEffect } from 'react';
import { Bot, Save, RotateCcw, X, Sparkles } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const getAuthHeaders = () => {
  const stored = localStorage.getItem('auth-storage');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      const token = parsed?.state?.token;
      if (token) return { Authorization: `Bearer ${token}` };
    } catch { /* ignore */ }
  }
  return {};
};

interface AgentProfile {
  agent_name: string;
  avatar_url: string | null;
  persona: string;
  preferred_language: string;
  expertise_focus: string[];
  response_style: string;
  quick_action_shortcuts: { label: string; action: string }[];
}

const defaultProfile: AgentProfile = {
  agent_name: 'The Bird AI',
  avatar_url: null,
  persona: 'A helpful, encouraging AI tutor for Kenyan students.',
  preferred_language: 'en',
  expertise_focus: [],
  response_style: 'conversational',
  quick_action_shortcuts: [],
};

const responseStyles = [
  { value: 'concise', label: 'Concise', desc: 'Short, to-the-point answers' },
  { value: 'detailed', label: 'Detailed', desc: 'Thorough explanations' },
  { value: 'conversational', label: 'Conversational', desc: 'Friendly, chat-like tone' },
  { value: 'academic', label: 'Academic', desc: 'Formal, scholarly style' },
];

const expertiseOptions = [
  'Mathematics', 'Science', 'English', 'Kiswahili', 'Social Studies',
  'Creative Arts', 'Technology', 'Health Education', 'Life Skills',
];

const languages = [
  { value: 'en', label: 'English' },
  { value: 'sw', label: 'Kiswahili' },
  { value: 'en-sw', label: 'English + Kiswahili' },
];

interface AgentProfileSettingsProps {
  onClose: () => void;
}

const AgentProfileSettings: React.FC<AgentProfileSettingsProps> = ({ onClose }) => {
  const [profile, setProfile] = useState<AgentProfile>(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/v1/ai-agent/profile`, { headers: getAuthHeaders() });
      setProfile({ ...defaultProfile, ...res.data });
    } catch {
      // Use defaults
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    setMessage('');
    try {
      await axios.put(`${API_URL}/api/v1/ai-agent/profile`, profile, { headers: getAuthHeaders() });
      setMessage('Profile saved!');
      setTimeout(() => setMessage(''), 2000);
    } catch {
      setMessage('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const resetProfile = async () => {
    setSaving(true);
    try {
      await axios.post(`${API_URL}/api/v1/ai-agent/profile/reset`, {}, { headers: getAuthHeaders() });
      setProfile(defaultProfile);
      setMessage('Reset to defaults');
      setTimeout(() => setMessage(''), 2000);
    } catch {
      setMessage('Failed to reset');
    } finally {
      setSaving(false);
    }
  };

  const toggleExpertise = (subject: string) => {
    setProfile(prev => ({
      ...prev,
      expertise_focus: prev.expertise_focus.includes(subject)
        ? prev.expertise_focus.filter(s => s !== subject)
        : [...prev.expertise_focus, subject],
    }));
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-400 dark:text-white/60">
        <Bot className="w-8 h-8 mx-auto mb-2 animate-pulse" />
        <p className="text-sm">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#181C1F]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#22272B]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#FF0000]" />
          <h2 className="font-semibold text-gray-900 dark:text-white">AI Agent Profile</h2>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Agent Name */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-white/60 uppercase mb-1">Agent Name</label>
          <input
            type="text"
            value={profile.agent_name}
            onChange={(e) => setProfile(prev => ({ ...prev, agent_name: e.target.value }))}
            className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#333] rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-[#FF0000]/50 transition-colors"
            placeholder="e.g. The Bird AI"
          />
        </div>

        {/* Persona */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-white/60 uppercase mb-1">Persona / System Prompt</label>
          <textarea
            value={profile.persona}
            onChange={(e) => setProfile(prev => ({ ...prev, persona: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#333] rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-[#FF0000]/50 transition-colors resize-none"
            placeholder="Describe how the AI should behave..."
          />
        </div>

        {/* Language */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-white/60 uppercase mb-1">Preferred Language</label>
          <div className="flex gap-2 flex-wrap">
            {languages.map((lang) => (
              <button
                key={lang.value}
                onClick={() => setProfile(prev => ({ ...prev, preferred_language: lang.value }))}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  profile.preferred_language === lang.value
                    ? 'bg-[#FF0000]/10 border-[#FF0000]/30 text-[#FF0000]'
                    : 'bg-gray-100 dark:bg-[#22272B] border-gray-200 dark:border-[#333] text-gray-600 dark:text-white/70 hover:border-gray-300 dark:hover:border-[#444]'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Response Style */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-white/60 uppercase mb-1">Response Style</label>
          <div className="grid grid-cols-2 gap-2">
            {responseStyles.map((style) => (
              <button
                key={style.value}
                onClick={() => setProfile(prev => ({ ...prev, response_style: style.value }))}
                className={`px-3 py-2 text-left rounded-lg border transition-colors ${
                  profile.response_style === style.value
                    ? 'bg-[#FF0000]/10 border-[#FF0000]/30'
                    : 'bg-gray-100 dark:bg-[#22272B] border-gray-200 dark:border-[#333] hover:border-gray-300 dark:hover:border-[#444]'
                }`}
              >
                <p className={`text-xs font-semibold ${profile.response_style === style.value ? 'text-[#FF0000]' : 'text-gray-700 dark:text-white/80'}`}>
                  {style.label}
                </p>
                <p className="text-[10px] text-gray-400 dark:text-white/40 mt-0.5">{style.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Expertise Focus */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-white/60 uppercase mb-1">Expertise Focus</label>
          <div className="flex flex-wrap gap-1.5">
            {expertiseOptions.map((subject) => (
              <button
                key={subject}
                onClick={() => toggleExpertise(subject)}
                className={`px-2.5 py-1 text-xs font-medium rounded-full border transition-colors ${
                  profile.expertise_focus.includes(subject)
                    ? 'bg-[#FF0000]/10 border-[#FF0000]/30 text-[#FF0000]'
                    : 'bg-gray-100 dark:bg-[#22272B] border-gray-200 dark:border-[#333] text-gray-500 dark:text-white/60 hover:text-gray-700 dark:hover:text-white/80'
                }`}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`text-xs font-medium text-center py-1 rounded ${message.includes('Failed') ? 'text-red-400' : 'text-green-400'}`}>
            {message}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200 dark:border-[#22272B] flex items-center gap-2">
        <button
          onClick={saveProfile}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#FF0000] hover:bg-[#E40000] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
        <button
          onClick={resetProfile}
          disabled={saving}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white/70 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
          title="Reset to defaults"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default AgentProfileSettings;
