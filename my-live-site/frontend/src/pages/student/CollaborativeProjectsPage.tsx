import React from 'react';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { Users, FolderOpen, Clock, Plus } from 'lucide-react';

const projects = [
  { id: '1', title: 'Climate Change Research', subject: 'Science', members: ['Amina', 'Kevin', 'Brian'], progress: 45, dueDate: 'Mar 1' },
  { id: '2', title: 'Kenya History Timeline', subject: 'Social Studies', members: ['Kevin', 'Jane', 'Peter', 'Sarah'], progress: 70, dueDate: 'Feb 25' },
  { id: '3', title: 'Math Games App', subject: 'Mathematics', members: ['Kevin', 'David'], progress: 20, dueDate: 'Mar 15' },
];

const CollaborativeProjectsPage: React.FC = () => {
  const { borderRadius } = useAgeAdaptiveUI();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Collaborative Projects</h1>
          <p className="text-gray-600 dark:text-white/70">Work together with classmates on group projects</p>
        </div>
        <button className={`px-4 py-2 bg-[#FF0000] hover:bg-[#FF0000]/80 text-gray-900 dark:text-white ${borderRadius} flex items-center gap-2`}>
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      <div className="space-y-4">
        {projects.map((project) => (
          <div key={project.id} className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] hover:border-gray-300 dark:hover:border-white/20 transition-colors`}>
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 bg-purple-500/20 ${borderRadius} flex items-center justify-center flex-shrink-0`}>
                <FolderOpen className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-gray-900 dark:text-white font-semibold text-lg">{project.title}</h3>
                <p className="text-gray-400 dark:text-white/40 text-sm">{project.subject}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-white/50">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {project.members.length} members</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Due: {project.dueDate}</span>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-400 dark:text-white/40 text-xs">Progress</span>
                    <span className="text-gray-500 dark:text-white/60 text-xs">{project.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" style={{ width: `${project.progress}%` }} />
                  </div>
                </div>
                <div className="flex gap-1 mt-3">
                  {project.members.map((m) => (
                    <span key={m} className={`px-2 py-0.5 bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/50 text-xs ${borderRadius}`}>{m}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CollaborativeProjectsPage;
