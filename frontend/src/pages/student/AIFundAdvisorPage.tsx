import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { Sparkles, Lightbulb, ArrowLeft, Wallet } from 'lucide-react';

const tips = [
  { title: 'Save for Coding Course', message: 'Based on your interests, the upcoming "Python for Beginners" course costs KES 800. Save KES 200/week to be ready by March.', type: 'save' },
  { title: 'Upgrade to Standard Plan', message: 'You use AI tutoring 5+ times a week. The Standard plan at KES 299/month gives you unlimited access — better value than per-session costs.', type: 'upgrade' },
  { title: 'Spending Pattern', message: 'You spent KES 1,549 last month, mostly on courses. Consider the Standard plan which includes unlimited courses.', type: 'insight' },
];

const AIFundAdvisorPage: React.FC = () => {
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
            <Sparkles className="w-8 h-8 text-purple-400" /> AI Fund Advisor
          </h1>
          <p className="text-gray-600 dark:text-white/70">Smart suggestions for your learning budget</p>
        </div>
      </div>

      <div className={`p-6 bg-gradient-to-r from-purple-500/20 to-blue-500/20 ${borderRadius} border border-purple-500/30`}>
        <div className="flex items-center gap-3 mb-3">
          <Wallet className="w-6 h-6 text-purple-400" />
          <h2 className="text-gray-900 dark:text-white font-semibold">Your Wallet Summary</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">KES 1,451</div>
            <div className="text-gray-400 dark:text-white/40 text-xs">Current Balance</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">KES 1,549</div>
            <div className="text-gray-400 dark:text-white/40 text-xs">Spent This Month</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">KES 3,000</div>
            <div className="text-gray-400 dark:text-white/40 text-xs">Total Top-ups</div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {tips.map((tip, i) => (
          <div key={i} className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-gray-900 dark:text-white font-semibold">{tip.title}</h3>
                <p className="text-gray-500 dark:text-white/60 text-sm mt-1">{tip.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIFundAdvisorPage;
