import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { FolderOpen, Clock, Upload, ChevronRight } from 'lucide-react';

const projects = [
  { id: '1', title: 'Solar System Model', subject: 'Science', dueDate: 'Feb 28', progress: 60, type: 'Individual', description: 'Build a 3D model of the solar system using everyday materials' },
  { id: '2', title: 'Community Survey Report', subject: 'Social Studies', dueDate: 'Mar 5', progress: 25, type: 'Group (4 members)', description: 'Conduct a survey about your local community and write a report' },
  { id: '3', title: 'Poetry Collection', subject: 'English', dueDate: 'Mar 10', progress: 80, type: 'Individual', description: 'Write and illustrate a collection of 5 original poems' },
];

const ActiveProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { borderRadius } = useAgeAdaptiveUI();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Active Projects</h1>
        <p className="text-gray-600 dark:text-white/70">{projects.length} projects in progress</p>
      </div>

      <div className="space-y-4">
        {projects.map((project) => (
          <div key={project.id} className={`p-6 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] hover:border-gray-300 dark:hover:border-white/20 transition-colors`}>
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 bg-orange-500/20 ${borderRadius} flex items-center justify-center flex-shrink-0`}>
                <FolderOpen className="w-6 h-6 text-orange-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-gray-900 dark:text-white font-semibold text-lg">{project.title}</h3>
                <p className="text-gray-400 dark:text-white/40 text-sm mt-0.5">{project.subject} · {project.type}</p>
                <p className="text-gray-500 dark:text-white/60 text-sm mt-2">{project.description}</p>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-white/50">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Due: {project.dueDate}</span>
                </div>
                {/* Progress */}
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-400 dark:text-white/40 text-xs">Progress</span>
                    <span className="text-gray-500 dark:text-white/60 text-xs">{project.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full" style={{ width: `${project.progress}%` }} />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={() => navigate(`/dashboard/student/projects/upload`)} className={`px-4 py-2 bg-[#FF0000] hover:bg-[#FF0000]/80 text-gray-900 dark:text-white text-sm ${borderRadius} flex items-center gap-2`}>
                  <Upload className="w-4 h-4" /> Upload
                </button>
                <button onClick={() => navigate(`/dashboard/student/projects/feedback`)} className={`px-4 py-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-white/60 text-sm ${borderRadius} flex items-center gap-2`}>
                  Details <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveProjectsPage;
