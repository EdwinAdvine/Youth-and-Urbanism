import React, { useState } from 'react';
import { useStudentStore } from '../../../store/studentStore';
import { useAgeAdaptiveUI } from '../../../hooks/useAgeAdaptiveUI';
import { Smile, Meh, Frown, Coffee, Zap, X } from 'lucide-react';
import type { MoodType } from '../../../types/student';

interface MoodCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const moods: { type: MoodType; icon: React.ReactNode; label: string; color: string }[] = [
  { type: 'excited', icon: <Zap className="w-10 h-10" />, label: 'Excited', color: 'from-yellow-500 to-orange-500' },
  { type: 'happy', icon: <Smile className="w-10 h-10" />, label: 'Happy', color: 'from-green-500 to-teal-500' },
  { type: 'okay', icon: <Meh className="w-10 h-10" />, label: 'Okay', color: 'from-blue-500 to-cyan-500' },
  { type: 'tired', icon: <Coffee className="w-10 h-10" />, label: 'Tired', color: 'from-purple-500 to-pink-500' },
  { type: 'frustrated', icon: <Frown className="w-10 h-10" />, label: 'Frustrated', color: 'from-red-500 to-orange-500' },
];

const MoodCheckInModal: React.FC<MoodCheckInModalProps> = ({ isOpen, onClose }) => {
  const { setCurrentMood } = useStudentStore();
  const { borderRadius } = useAgeAdaptiveUI();
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (selectedMood) {
      setCurrentMood({
        id: Date.now().toString(),
        studentId: 'current-student',
        moodType: selectedMood,
        energyLevel: 3,
        note: '',
        timestamp: new Date()
      });
      localStorage.setItem('last_mood_checkin', new Date().toDateString());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className={`w-full max-w-md mx-4 p-6 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">How are you feeling?</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg">
            <X className="w-5 h-5 text-gray-500 dark:text-white/60" />
          </button>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-4">
          {moods.map((mood) => (
            <button
              key={mood.type}
              onClick={() => setSelectedMood(mood.type)}
              className={`p-4 bg-gradient-to-br ${mood.color} ${borderRadius} border-2 ${
                selectedMood === mood.type ? 'border-white' : 'border-transparent'
              } hover:scale-105 transition-transform`}
            >
              <div className="flex flex-col items-center gap-2 text-gray-900 dark:text-white">
                {mood.icon}
                <span className="text-xs font-medium">{mood.label}</span>
              </div>
            </button>
          ))}
        </div>
        <button
          onClick={handleSubmit}
          disabled={!selectedMood}
          className={`w-full py-2.5 bg-[#FF0000] hover:bg-[#FF0000]/80 disabled:bg-gray-100 dark:disabled:bg-white/10 disabled:text-gray-400 dark:disabled:text-white/30 text-gray-900 dark:text-white font-medium ${borderRadius}`}
        >
          Save & Continue
        </button>
      </div>
    </div>
  );
};

export default MoodCheckInModal;
