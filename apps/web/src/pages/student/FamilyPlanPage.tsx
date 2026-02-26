import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { ArrowLeft, Users, Check, Star } from 'lucide-react';

const FamilyPlanPage: React.FC = () => {
  const navigate = useNavigate();
  const { borderRadius } = useAgeAdaptiveUI();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className={`p-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 ${borderRadius}`}>
          <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-white" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Family Plan</h1>
          <p className="text-gray-600 dark:text-white/70">Learn together and save</p>
        </div>
      </div>

      <div className={`p-6 bg-gradient-to-br from-blue-500/20 to-purple-500/20 ${borderRadius} border border-blue-500/30 text-center`}>
        <Users className="w-12 h-12 text-blue-400 mx-auto mb-3" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Family Plan</h2>
        <div className="mb-2">
          <span className="text-4xl font-bold text-gray-900 dark:text-white">KES 899</span>
          <span className="text-gray-400 dark:text-white/40">/month</span>
        </div>
        <p className="text-gray-500 dark:text-white/60 text-sm">Up to 4 students · Save 40% vs individual plans</p>
      </div>

      <div className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
        <h3 className="text-gray-900 dark:text-white font-semibold mb-3">What's Included</h3>
        <ul className="space-y-2">
          {[
            'Up to 4 student accounts',
            'Unlimited courses for all members',
            'Full AI tutor access',
            'Parent dashboard with all children',
            'Live sessions & group learning',
            'Family leaderboard',
            'Shared wallet',
            'Priority support',
          ].map((f, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
              <span className="text-gray-600 dark:text-white/70">{f}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={() => navigate('/dashboard/student/wallet/topup/mpesa')}
        className={`w-full py-3 bg-[#FF0000] hover:bg-[#FF0000]/80 text-gray-900 dark:text-white font-bold ${borderRadius} flex items-center justify-center gap-2`}
      >
        <Star className="w-5 h-5" /> Get Family Plan
      </button>
    </div>
  );
};

export default FamilyPlanPage;
