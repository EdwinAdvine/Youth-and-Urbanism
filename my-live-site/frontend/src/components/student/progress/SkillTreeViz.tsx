import React from 'react';
import { useAgeAdaptiveUI } from '../../../hooks/useAgeAdaptiveUI';
import RadarChart from '../charts/RadarChart';

interface SkillData {
  label: string;
  value: number;
}

interface SkillTreeVizProps {
  skills: SkillData[];
  title?: string;
}

const SkillTreeViz: React.FC<SkillTreeVizProps> = ({ skills, title = 'Skill Map' }) => {
  const { borderRadius } = useAgeAdaptiveUI();

  return (
    <div className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
      <h3 className="text-gray-900 dark:text-white font-semibold mb-4">{title}</h3>
      <div className="flex justify-center">
        <RadarChart
          labels={skills.map((s) => s.label)}
          datasets={[{ label: 'Skills', data: skills.map((s) => s.value), color: '#FF0000' }]}
        />
      </div>
      <div className="grid grid-cols-2 gap-2 mt-4">
        {skills.map((skill) => (
          <div key={skill.label} className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-white/60">{skill.label}</span>
            <span className="text-gray-900 dark:text-white font-medium">{skill.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillTreeViz;
