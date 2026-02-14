import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { ArrowLeft, MessageSquare, FolderOpen } from 'lucide-react';

const projects = [
  { id: '1', title: 'Solar System Model', subject: 'Science', grade: 'A', feedback: 'Excellent creativity and accuracy. Your model clearly shows the relative sizes of planets. Consider adding information about orbital periods.', teacher: 'Mr. Ochieng', date: 'Feb 10' },
  { id: '2', title: 'Community Survey Report', subject: 'Social Studies', grade: 'B+', feedback: 'Good survey questions and data analysis. Your charts are clear. The conclusion could be stronger — tie your findings back to the hypothesis.', teacher: 'Ms. Njeri', date: 'Feb 5' },
];

const ProjectFeedbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { borderRadius } = useAgeAdaptiveUI();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className={`p-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 ${borderRadius}`}>
          <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-white" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Project Feedback</h1>
          <p className="text-gray-600 dark:text-white/70">Teacher feedback on your projects</p>
        </div>
      </div>

      <div className="space-y-4">
        {projects.map((project) => (
          <div key={project.id} className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
            <div className="flex items-start gap-3 mb-3">
              <div className={`w-10 h-10 bg-orange-500/20 ${borderRadius} flex items-center justify-center flex-shrink-0`}>
                <FolderOpen className="w-5 h-5 text-orange-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-gray-900 dark:text-white font-semibold">{project.title}</h3>
                <p className="text-gray-400 dark:text-white/40 text-sm">{project.subject} · {project.teacher}</p>
              </div>
              <div className="text-right">
                <span className="text-green-400 font-bold text-lg">{project.grade}</span>
              </div>
            </div>
            <div className={`p-4 bg-blue-500/10 ${borderRadius} border border-blue-500/20`}>
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 text-sm font-medium">Teacher Feedback</span>
              </div>
              <p className="text-gray-600 dark:text-white/70 text-sm">{project.feedback}</p>
            </div>
            <span className="text-gray-400 dark:text-white/30 text-xs mt-3 block">{project.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectFeedbackPage;
