import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { ArrowLeft, Shield } from 'lucide-react';
import TeacherAccessToggle from '../../components/student/account/TeacherAccessToggle';

const defaultPermissions = [
  { id: 'grades', label: 'View My Grades', description: 'Teachers can see your quiz and assignment scores', enabled: true },
  { id: 'progress', label: 'View Learning Progress', description: 'Teachers can see your course progress and streak', enabled: true },
  { id: 'mood', label: 'View Mood Check-ins', description: 'Teachers can see how you are feeling', enabled: false },
  { id: 'journal', label: 'View AI Journal', description: 'Teachers can read your learning journal entries', enabled: false },
  { id: 'activity', label: 'View Activity Log', description: 'Teachers can see when you were last active', enabled: true },
];

const TeacherAccessPage: React.FC = () => {
  const navigate = useNavigate();
  const { borderRadius } = useAgeAdaptiveUI();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className={`p-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 ${borderRadius}`}>
          <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-white" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
            <Shield className="w-8 h-8 text-green-400" /> Teacher Access
          </h1>
          <p className="text-gray-600 dark:text-white/70">Control what your teachers can see</p>
        </div>
      </div>

      <div className={`p-4 bg-blue-500/10 ${borderRadius} border border-blue-500/20`}>
        <p className="text-gray-600 dark:text-white/70 text-sm">Your teachers need some access to help you learn better. Toggle off any data you prefer to keep private.</p>
      </div>

      <TeacherAccessToggle
        permissions={defaultPermissions}
        onUpdate={(_perms) => { /* Save to backend */ }}
      />
    </div>
  );
};

export default TeacherAccessPage;
