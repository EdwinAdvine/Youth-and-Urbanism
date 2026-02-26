import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { TrendingUp, Target, Lightbulb } from 'lucide-react';

const areas = [
  { subject: 'Social Studies', skill: 'Kenya Geography', score: 45, tip: 'Try the interactive map exercises and quiz practice mode.', coursePath: '/dashboard/student/courses/enrolled' },
  { subject: 'Mathematics', skill: 'Decimal Conversion', score: 55, tip: 'Review the video lessons on decimals and practice with the AI tutor.', coursePath: '/dashboard/student/ai-tutor/chat' },
  { subject: 'Kiswahili', skill: 'Insha Writing', score: 50, tip: 'Read sample essays and try writing one per week with AI feedback.', coursePath: '/dashboard/student/ai-tutor/chat' },
];

const GrowingAreasPage: React.FC = () => {
  const navigate = useNavigate();
  const { borderRadius } = useAgeAdaptiveUI();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <Target className="w-8 h-8 text-orange-400" /> Growing Areas
        </h1>
        <p className="text-gray-600 dark:text-white/70">Topics with room for improvement — you've got this!</p>
      </div>

      <div className="space-y-4">
        {areas.map((area, i) => (
          <div key={i} className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-gray-900 dark:text-white font-semibold">{area.skill}</h3>
                <p className="text-gray-400 dark:text-white/40 text-sm">{area.subject}</p>
              </div>
              <span className="text-orange-400 font-bold text-lg">{area.score}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 dark:bg-white/10 rounded-full mb-3 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full" style={{ width: `${area.score}%` }} />
            </div>
            <div className={`p-3 bg-yellow-500/10 ${borderRadius} border border-yellow-500/20 flex items-start gap-2`}>
              <Lightbulb className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-gray-500 dark:text-white/60 text-sm">{area.tip}</p>
            </div>
            <button
              onClick={() => navigate(area.coursePath)}
              className={`mt-3 px-4 py-2 bg-[#FF0000] hover:bg-[#FF0000]/80 text-gray-900 dark:text-white text-sm ${borderRadius} flex items-center gap-2`}
            >
              <TrendingUp className="w-4 h-4" /> Practice Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GrowingAreasPage;
