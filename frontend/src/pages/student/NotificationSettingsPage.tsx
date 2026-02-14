import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { ArrowLeft, CheckCircle } from 'lucide-react';

const settings = [
  { id: 'quiz_reminders', label: 'Quiz Reminders', description: 'Get notified before upcoming quizzes', default: true },
  { id: 'assignment_due', label: 'Assignment Deadlines', description: 'Reminders when assignments are due', default: true },
  { id: 'session_start', label: 'Live Session Alerts', description: 'Notify when live sessions are starting', default: true },
  { id: 'teacher_messages', label: 'Teacher Messages', description: 'New messages and feedback from teachers', default: true },
  { id: 'achievements', label: 'Achievement Alerts', description: 'When you earn badges or level up', default: true },
  { id: 'community', label: 'Community Updates', description: 'New replies and shoutouts', default: false },
  { id: 'promotions', label: 'Promotions & Offers', description: 'Special deals on courses and plans', default: false },
];

const NotificationSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { borderRadius } = useAgeAdaptiveUI();
  const [prefs, setPrefs] = useState<Record<string, boolean>>(
    Object.fromEntries(settings.map(s => [s.id, s.default]))
  );
  const [saved, setSaved] = useState(false);

  const toggle = (id: string) => setPrefs(prev => ({ ...prev, [id]: !prev[id] }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className={`p-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 ${borderRadius}`}>
          <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-white" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Notification Settings</h1>
          <p className="text-gray-600 dark:text-white/70">Choose what you want to be notified about</p>
        </div>
      </div>

      <div className="space-y-2">
        {settings.map((s) => (
          <div key={s.id} className={`p-4 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] flex items-center gap-4`}>
            <div className="flex-1">
              <h3 className="text-gray-900 dark:text-white font-medium text-sm">{s.label}</h3>
              <p className="text-gray-400 dark:text-white/40 text-xs">{s.description}</p>
            </div>
            <button
              onClick={() => toggle(s.id)}
              className={`relative w-11 h-6 rounded-full transition-colors ${prefs[s.id] ? 'bg-green-500' : 'bg-gray-200 dark:bg-white/20'}`}
            >
              <div
                className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform"
                style={{ transform: prefs[s.id] ? 'translateX(20px)' : 'translateX(0)' }}
              />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        className={`w-full py-2.5 ${saved ? 'bg-green-600' : 'bg-[#FF0000] hover:bg-[#FF0000]/80'} text-gray-900 dark:text-white font-medium ${borderRadius} flex items-center justify-center gap-2`}
      >
        {saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : 'Save Settings'}
      </button>
    </div>
  );
};

export default NotificationSettingsPage;
