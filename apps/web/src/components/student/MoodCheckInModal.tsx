/**
 * MoodCheckInModal — full-screen overlay modal shown to students on their
 * first login of the day. Submits to POST /api/v1/student/dashboard/mood
 * and sets localStorage 'last_mood_checkin' to today's date string so it
 * doesn't reappear on subsequent logins the same day.
 */
import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { submitMoodCheckIn } from '../../services/student/studentDashboardService';
import { useStudentStore } from '../../store/studentStore';
import type { MoodType } from '../../types/student';

interface MoodOption {
  value: MoodType;
  emoji: string;
  label: string;
  description: string;
  bgColor: string;
  selectedBg: string;
}

const moodOptions: MoodOption[] = [
  { value: 'excited',    emoji: '🚀', label: 'Excited',    description: "Can't wait to learn!", bgColor: 'border-gray-200 dark:border-white/10', selectedBg: 'border-yellow-400 bg-yellow-500/10' },
  { value: 'happy',      emoji: '😊', label: 'Happy',      description: 'Feeling great today',  bgColor: 'border-gray-200 dark:border-white/10', selectedBg: 'border-green-400 bg-green-500/10'  },
  { value: 'okay',       emoji: '😐', label: 'Okay',       description: 'Pretty normal day',    bgColor: 'border-gray-200 dark:border-white/10', selectedBg: 'border-blue-400 bg-blue-500/10'    },
  { value: 'tired',      emoji: '😴', label: 'Tired',      description: 'A bit low on energy',  bgColor: 'border-gray-200 dark:border-white/10', selectedBg: 'border-orange-400 bg-orange-500/10'},
  { value: 'frustrated', emoji: '😤', label: 'Frustrated', description: 'Facing some challenges', bgColor: 'border-gray-200 dark:border-white/10', selectedBg: 'border-red-400 bg-red-500/10' },
];

interface Props {
  onClose: () => void;
}

const MoodCheckInModal: React.FC<Props> = ({ onClose }) => {
  const { setCurrentMood } = useStudentStore();
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [energyLevel, setEnergyLevel] = useState(3);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!selectedMood) return;

    setSaving(true);
    setError(null);

    try {
      const result = await submitMoodCheckIn({
        mood_type: selectedMood,
        energy_level: energyLevel,
        note: note.trim() || undefined,
      });

      // Update Zustand store
      setCurrentMood({ id: '', studentId: '', moodType: result.mood_type as MoodType, energyLevel: result.energy_level, timestamp: new Date() });

      // Mark checked-in today so modal doesn't reappear
      localStorage.setItem('last_mood_checkin', new Date().toDateString());

      onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } }; message?: string };
      setError(e?.response?.data?.detail || e?.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    // Mark checked-in today so modal doesn't show again (skipped counts as seen)
    localStorage.setItem('last_mood_checkin', new Date().toDateString());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#181C1F] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#22272B] overflow-hidden">
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-1 rounded-full text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/70 transition-colors"
          aria-label="Skip mood check-in"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header gradient */}
        <div className="h-1 bg-gradient-to-r from-[#FF0000] via-orange-500 to-yellow-500" />

        <div className="p-6 space-y-6">
          {/* Title */}
          <div className="text-center pr-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              Hey! How are you feeling? 👋
            </h2>
            <p className="text-gray-500 dark:text-white/60 text-sm">
              A quick check-in helps us personalise your learning experience today.
            </p>
          </div>

          {/* Mood selection */}
          <div className="grid grid-cols-5 gap-2">
            {moodOptions.map((mood) => (
              <button
                key={mood.value}
                onClick={() => setSelectedMood(mood.value)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                  selectedMood === mood.value ? mood.selectedBg : mood.bgColor + ' hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                <span className="text-2xl">{mood.emoji}</span>
                <span className="text-xs font-medium text-gray-700 dark:text-white/80">{mood.label}</span>
              </button>
            ))}
          </div>

          {/* Energy level slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white/80 mb-2">
              Energy level today: <span className="text-[#FF0000] font-bold">{energyLevel}/5</span>
            </label>
            <input
              type="range"
              min={1}
              max={5}
              value={energyLevel}
              onChange={(e) => setEnergyLevel(Number(e.target.value))}
              className="w-full accent-[#FF0000]"
            />
            <div className="flex justify-between text-xs text-gray-400 dark:text-white/40 mt-1">
              <span>Very low</span>
              <span>Very high</span>
            </div>
          </div>

          {/* Optional note */}
          <div>
            <label className="block text-sm text-gray-500 dark:text-white/60 mb-1">
              Anything you want to share? (optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Excited about today's science class!"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#22272B] rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-[#FF0000] text-sm"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSkip}
              className="flex-1 px-4 py-3 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-white/70 rounded-xl text-sm transition-colors"
            >
              Skip for now
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedMood || saving}
              className="flex-1 px-4 py-3 bg-[#FF0000] hover:bg-[#FF0000]/80 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              That's My Mood Today
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodCheckInModal;
