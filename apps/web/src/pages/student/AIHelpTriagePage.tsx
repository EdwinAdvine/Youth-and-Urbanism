import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { ArrowLeft } from 'lucide-react';
import AITriageChat from '../../components/student/support/AITriageChat';

const AIHelpTriagePage: React.FC = () => {
  const navigate = useNavigate();
  const { borderRadius } = useAgeAdaptiveUI();

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className={`p-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 ${borderRadius}`}>
          <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-white" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Help</h1>
          <p className="text-gray-600 dark:text-white/70 text-sm">Get instant help from our AI assistant</p>
        </div>
      </div>

      <div className="flex-1">
        <AITriageChat onEscalate={() => navigate('/dashboard/student/support/teacher-chat')} />
      </div>
    </div>
  );
};

export default AIHelpTriagePage;
