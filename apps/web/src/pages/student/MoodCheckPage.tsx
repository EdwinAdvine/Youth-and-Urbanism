import React, { useState } from 'react';
import { useStudentStore } from '../../store/studentStore';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { submitMoodCheckIn } from '../../services/student/studentDashboardService';
import { Smile, Meh, Frown, Coffee, Zap, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import type { MoodType } from '../../types/student';

const MoodCheckPage: React.FC = () => {
  const { setCurrentMood } = useStudentStore();
  const { borderRadius } = useAgeAdaptiveUI();
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const moods: { type: MoodType; icon: React.ReactNode; label: string; color: string }[] = [
    { type: 'excited', icon: <Zap className="w-12 h-12" />, label: 'Excited', color: 'from-yellow-500 to-orange-500' },
    { type: 'happy', icon: <Smile className="w-12 h-12" />, label: 'Happy', color: 'from-green-500 to-teal-500' },
    { type: 'okay', icon: <Meh className="w-12 h-12" />, label: 'Okay', color: 'from-blue-500 to-cyan-500' },
    { type: 'tired', icon: <Coffee className="w-12 h-12" />, label: 'Tired', color: 'from-purple-500 to-pink-500' },
    { type: 'frustrated', icon: <Frown className="w-12 h-12" />, label: 'Frustrated', color: 'from-red-500 to-orange-500' },
  ];

  const handleSubmit = async () => {
    if (!selectedMood) return;

    setLoading(true);
    setError(null);

    try {
      const response = await submitMoodCheckIn({
        mood_type: selectedMood,
        energy_level: 3,
        note: note || undefined,
      });

      // After successful API call, update Zustand store
      setCurrentMood({
        id: response.id || Date.now().toString(),
        studentId: 'current-student',
        moodType: selectedMood,
        energyLevel: response.energy_level || 3,
        note: response.note || note,
        timestamp: response.timestamp ? new Date(response.timestamp) : new Date(),
      });
      localStorage.setItem('last_mood_checkin', new Date().toDateString());
      setSubmitted(true);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || err?.message || 'Failed to save mood check-in. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="space-y-6">
        <div className={`p-12 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] text-center`}>
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Mood Saved!</h2>
          <p className="text-gray-500 dark:text-white/60">Your mood has been recorded. We'll use this to personalize your learning today.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">How are you feeling today?</h1>
        <p className="text-gray-600 dark:text-white/70">Your mood helps us personalize your learning experience</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {moods.map((mood) => (
          <button
            key={mood.type}
            onClick={() => setSelectedMood(mood.type)}
            disabled={loading}
            className={`p-6 bg-gradient-to-br ${mood.color} ${borderRadius} border-2 ${
              selectedMood === mood.type ? 'border-white' : 'border-transparent'
            } hover:scale-105 transition-transform disabled:opacity-70`}
          >
            <div className="flex flex-col items-center gap-3 text-gray-900 dark:text-white">
              {mood.icon}
              <span className="font-medium">{mood.label}</span>
            </div>
          </button>
        ))}
      </div>

      <div className={`p-6 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
        <label className="block text-gray-900 dark:text-white font-medium mb-2">Anything you'd like to share? (Optional)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="How are you feeling today? What's on your mind?"
          className={`w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 ${borderRadius} text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus:outline-none focus:border-[#FF0000]`}
          rows={4}
        />
      </div>

      {error && (
        <div className={`p-3 bg-red-500/10 border border-red-500/20 ${borderRadius} flex items-center gap-2 text-red-400 text-sm`}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!selectedMood || loading}
        className={`w-full px-6 py-3 bg-[#FF0000] hover:bg-[#FF0000]/80 disabled:bg-gray-100 dark:disabled:bg-white/10 disabled:cursor-not-allowed text-gray-900 dark:text-white font-medium ${borderRadius} flex items-center justify-center gap-2`}
      >
        {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</> : 'Save Mood Check-in'}
      </button>
    </div>
  );
};

export default MoodCheckPage;
