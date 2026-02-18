import React from 'react';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import SkillTreeViz from '../../components/student/progress/SkillTreeViz';

const skills = [
  { label: 'Mathematics', value: 78 },
  { label: 'Science', value: 65 },
  { label: 'English', value: 85 },
  { label: 'Social Studies', value: 55 },
  { label: 'Kiswahili', value: 70 },
];

const detailedSkills = [
  { name: 'Fractions', subject: 'Math', score: 92, trend: 'up' as const },
  { name: 'Decimals', subject: 'Math', score: 78, trend: 'up' as const },
  { name: 'Grammar', subject: 'English', score: 88, trend: 'stable' as const },
  { name: 'Photosynthesis', subject: 'Science', score: 65, trend: 'down' as const },
  { name: 'Kenya History', subject: 'Social Studies', score: 58, trend: 'up' as const },
  { name: 'Sarufi', subject: 'Kiswahili', score: 72, trend: 'stable' as const },
];

const SkillReportsPage: React.FC = () => {
  const { borderRadius } = useAgeAdaptiveUI();

  const trendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-gray-400 dark:text-white/40" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Skill Reports</h1>
        <p className="text-gray-600 dark:text-white/70">Detailed analysis of your subject-level skills</p>
      </div>

      <SkillTreeViz skills={skills} title="Subject Overview" />

      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Skill Breakdown</h2>
        <div className="space-y-2">
          {detailedSkills.map((skill) => (
            <div key={skill.name} className={`p-4 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] flex items-center gap-4`}>
              <div className="flex-1">
                <h3 className="text-gray-900 dark:text-white font-medium text-sm">{skill.name}</h3>
                <p className="text-gray-400 dark:text-white/40 text-xs">{skill.subject}</p>
              </div>
              <div className="w-32">
                <div className="w-full h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${skill.score >= 80 ? 'bg-green-500' : skill.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${skill.score}%` }}
                  />
                </div>
              </div>
              <span className="text-gray-900 dark:text-white font-bold text-sm w-10 text-right">{skill.score}%</span>
              {trendIcon(skill.trend)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkillReportsPage;
