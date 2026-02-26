import React from 'react';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { TrendingUp, Star, Award } from 'lucide-react';

const strengths = [
  { subject: 'English', skill: 'Creative Writing', score: 92, detail: 'Your essays consistently show excellent vocabulary and narrative structure.' },
  { subject: 'Mathematics', skill: 'Fractions', score: 88, detail: 'Strong understanding of fraction operations and conversion.' },
  { subject: 'Science', skill: 'Lab Reports', score: 95, detail: 'Outstanding observation skills and data presentation.' },
];

const StrengthsPage: React.FC = () => {
  const { borderRadius } = useAgeAdaptiveUI();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <Star className="w-8 h-8 text-yellow-400" /> Your Strengths
        </h1>
        <p className="text-gray-600 dark:text-white/70">Areas where you're excelling</p>
      </div>

      <div className="space-y-4">
        {strengths.map((s, i) => (
          <div key={i} className={`p-5 bg-gradient-to-r from-green-500/10 to-transparent ${borderRadius} border border-green-500/20`}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-gray-900 dark:text-white font-semibold">{s.skill}</h3>
                <p className="text-gray-400 dark:text-white/40 text-sm">{s.subject}</p>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-green-400 font-bold text-lg">{s.score}%</span>
              </div>
            </div>
            <p className="text-gray-500 dark:text-white/60 text-sm">{s.detail}</p>
            <div className="w-full h-2 bg-gray-100 dark:bg-white/10 rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: `${s.score}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
        <div className="flex items-center gap-2 mb-3">
          <Award className="w-5 h-5 text-yellow-400" />
          <h3 className="text-gray-900 dark:text-white font-semibold">AI Recommendation</h3>
        </div>
        <p className="text-gray-500 dark:text-white/60 text-sm">Based on your strengths, you might enjoy the Advanced Creative Writing course or the Science Olympiad prep materials. Keep up the great work!</p>
      </div>
    </div>
  );
};

export default StrengthsPage;
