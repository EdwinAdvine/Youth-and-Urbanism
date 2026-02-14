import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { ArrowLeft, Brain } from 'lucide-react';
import LearningStyleQuiz from '../../components/student/account/LearningStyleQuiz';

const styleDescriptions: Record<string, { label: string; description: string; color: string }> = {
  visual: { label: 'Visual Learner', description: 'You learn best through images, diagrams, and videos. Your AI tutor will prioritize visual content.', color: 'from-blue-500/20 to-cyan-500/20' },
  auditory: { label: 'Auditory Learner', description: 'You learn best through listening and discussion. Your AI tutor will use more audio explanations.', color: 'from-green-500/20 to-emerald-500/20' },
  kinesthetic: { label: 'Kinesthetic Learner', description: 'You learn best through hands-on activities. Your AI tutor will suggest more interactive exercises.', color: 'from-orange-500/20 to-red-500/20' },
  reading: { label: 'Reading/Writing Learner', description: 'You learn best through reading and writing. Your AI tutor will provide detailed written explanations.', color: 'from-purple-500/20 to-pink-500/20' },
};

const LearningStylePage: React.FC = () => {
  const navigate = useNavigate();
  const { borderRadius } = useAgeAdaptiveUI();
  const [result, setResult] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className={`p-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 ${borderRadius}`}>
          <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-white" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Learning Style</h1>
          <p className="text-gray-600 dark:text-white/70">Discover how you learn best</p>
        </div>
      </div>

      {result ? (
        <div className={`p-8 bg-gradient-to-br ${styleDescriptions[result].color} ${borderRadius} border border-gray-200 dark:border-[#22272B] text-center`}>
          <Brain className="w-12 h-12 text-purple-400 mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{styleDescriptions[result].label}</h2>
          <p className="text-gray-600 dark:text-white/70 max-w-md mx-auto">{styleDescriptions[result].description}</p>
          <button
            onClick={() => setResult(null)}
            className={`mt-6 px-6 py-2 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white ${borderRadius}`}
          >
            Retake Quiz
          </button>
        </div>
      ) : (
        <LearningStyleQuiz onComplete={setResult} />
      )}
    </div>
  );
};

export default LearningStylePage;
