import React, { useEffect, useState } from 'react';
import { useAgeAdaptiveUI } from '../../../hooks/useAgeAdaptiveUI';
import { useTranslation } from 'react-i18next';
import { Heart } from 'lucide-react';
import type { MoodEntry } from '../../../types/student';

interface TimeAdaptiveGreetingProps {
  currentMood?: MoodEntry | null;
}

const TimeAdaptiveGreeting: React.FC<TimeAdaptiveGreetingProps> = ({ currentMood }) => {
  const { t } = useTranslation();
  const { ageGroup, borderRadius, useEmojis } = useAgeAdaptiveUI();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting(t('student.dashboard.welcome_morning'));
    else if (hour < 18) setGreeting(t('student.dashboard.welcome_afternoon'));
    else setGreeting(t('student.dashboard.welcome_evening'));
  }, [t]);

  return (
    <div className={`p-6 bg-gradient-to-r from-[#FF0000]/20 to-purple-500/20 ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        {greeting}! {useEmojis && (ageGroup === 'young' ? '🌟' : ageGroup === 'tween' ? '👋' : '')}
      </h1>
      <p className="text-gray-600 dark:text-white/70">
        {ageGroup === 'young'
          ? "Let's have a great day of learning and fun!"
          : ageGroup === 'tween'
          ? "Ready to learn something amazing today?"
          : "Welcome back. Let's make today productive."}
      </p>
      {currentMood && (
        <div className="mt-3 flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-400" />
          <span className="text-gray-700 dark:text-white/80 text-sm">
            Feeling: <span className="capitalize text-gray-900 dark:text-white">{currentMood.moodType}</span>
          </span>
        </div>
      )}
    </div>
  );
};

export default TimeAdaptiveGreeting;
