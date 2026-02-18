import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { ArrowLeft, CheckCircle } from 'lucide-react';

const availableInterests = [
  'Science', 'Mathematics', 'Coding', 'Space', 'History', 'Geography',
  'Art', 'Music', 'Sports', 'Reading', 'Writing', 'Nature',
  'Cooking', 'Photography', 'Robotics', 'Animals', 'Languages', 'Chess',
];

const InterestsPage: React.FC = () => {
  const navigate = useNavigate();
  const { borderRadius } = useAgeAdaptiveUI();
  const [selected, setSelected] = useState<Set<string>>(new Set(['Science', 'Mathematics', 'Coding', 'Space']));
  const [saved, setSaved] = useState(false);

  const toggle = (interest: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(interest) ? next.delete(interest) : next.add(interest);
      return next;
    });
  };

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">My Interests</h1>
          <p className="text-gray-600 dark:text-white/70">Select topics you're interested in to personalize your experience</p>
        </div>
      </div>

      <div className={`p-6 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
        <div className="flex flex-wrap gap-2">
          {availableInterests.map((interest) => (
            <button
              key={interest}
              onClick={() => toggle(interest)}
              className={`px-4 py-2 ${borderRadius} text-sm transition-colors ${
                selected.has(interest)
                  ? 'bg-[#FF0000]/20 text-[#FF0000] border border-[#FF0000]/30'
                  : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/60 border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10'
              }`}
            >
              {interest}
            </button>
          ))}
        </div>
        <p className="text-gray-400 dark:text-white/30 text-xs mt-3">{selected.size} selected</p>
      </div>

      <button
        onClick={handleSave}
        className={`w-full py-2.5 ${saved ? 'bg-green-600' : 'bg-[#FF0000] hover:bg-[#FF0000]/80'} text-gray-900 dark:text-white font-medium ${borderRadius} flex items-center justify-center gap-2`}
      >
        {saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : 'Save Interests'}
      </button>
    </div>
  );
};

export default InterestsPage;
