import React from 'react';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { Map, TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';
import RadarChart from '../../components/student/charts/RadarChart';

const skills = [
  { subject: 'Mathematics', proficiency: 78, trend: 'up', areas: ['Fractions', 'Geometry', 'Algebra'] },
  { subject: 'Science', proficiency: 65, trend: 'up', areas: ['Biology', 'Chemistry', 'Physics'] },
  { subject: 'English', proficiency: 82, trend: 'stable', areas: ['Grammar', 'Writing', 'Reading'] },
  { subject: 'Kiswahili', proficiency: 70, trend: 'down', areas: ['Sarufi', 'Insha', 'Fasihi'] },
  { subject: 'Social Studies', proficiency: 55, trend: 'up', areas: ['Geography', 'History', 'Civics'] },
  { subject: 'Creative Arts', proficiency: 90, trend: 'stable', areas: ['Drawing', 'Music', 'Drama'] },
];

const trendIcons = { up: <TrendingUp className="w-4 h-4 text-green-400" />, down: <TrendingDown className="w-4 h-4 text-red-400" />, stable: <Minus className="w-4 h-4 text-yellow-400" /> };

const LearningMapPage: React.FC = () => {
  const { borderRadius } = useAgeAdaptiveUI();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <Map className="w-8 h-8 text-blue-400" /> Learning Map
        </h1>
        <p className="text-gray-600 dark:text-white/70">Your skill proficiency across all subjects</p>
      </div>

      {/* Radar Chart */}
      <div className={`p-6 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
        <h3 className="text-gray-900 dark:text-white font-medium mb-4">Skill Overview</h3>
        <RadarChart
          labels={skills.map(s => s.subject)}
          datasets={[{ label: 'Your Proficiency', data: skills.map(s => s.proficiency) }]}
          height={350}
        />
      </div>

      {/* Skill Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {skills.map((skill) => (
          <div key={skill.subject} className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-gray-900 dark:text-white font-semibold">{skill.subject}</h3>
              <div className="flex items-center gap-2">
                {trendIcons[skill.trend as keyof typeof trendIcons]}
                <span className="text-gray-900 dark:text-white font-bold">{skill.proficiency}%</span>
              </div>
            </div>
            <div className="w-full h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden mb-3">
              <div className={`h-full rounded-full ${skill.proficiency >= 80 ? 'bg-green-500' : skill.proficiency >= 60 ? 'bg-blue-500' : 'bg-orange-500'}`} style={{ width: `${skill.proficiency}%` }} />
            </div>
            <div className="flex gap-2 flex-wrap">
              {skill.areas.map((area) => (
                <span key={area} className={`px-2 py-0.5 bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/50 text-xs ${borderRadius}`}>{area}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* AI Insight */}
      <div className={`p-4 bg-purple-500/10 ${borderRadius} border border-purple-500/20`}>
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-gray-900 dark:text-white font-medium text-sm">AI Learning Insight</p>
            <p className="text-gray-500 dark:text-white/60 text-sm mt-1">Your Creative Arts skills are outstanding! To bring Social Studies up, try connecting geography concepts to your art projects — visual learning is your strength.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningMapPage;
