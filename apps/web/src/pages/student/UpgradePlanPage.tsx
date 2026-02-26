import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { ArrowLeft } from 'lucide-react';
import PlanCard from '../../components/student/wallet/PlanCard';

const plans = [
  { name: 'Free', price: 0, period: 'month', features: ['5 courses', 'Basic AI tutor', 'Community access', 'Limited quizzes'], isCurrent: true },
  { name: 'Standard', price: 299, period: 'month', features: ['Unlimited courses', 'Full AI tutor', 'Live sessions', 'All quizzes', 'Progress reports'], isPopular: true },
  { name: 'Premium', price: 599, period: 'month', features: ['Everything in Standard', '1-on-1 tutoring', 'Offline access', 'Parent dashboard', 'Priority support', 'Certificate of completion'] },
];

const UpgradePlanPage: React.FC = () => {
  const navigate = useNavigate();
  const { borderRadius } = useAgeAdaptiveUI();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className={`p-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 ${borderRadius}`}>
          <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-white" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Upgrade Plan</h1>
          <p className="text-gray-600 dark:text-white/70">Choose the plan that works for you</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <PlanCard
            key={plan.name}
            name={plan.name}
            price={plan.price}
            period={plan.period}
            features={plan.features}
            isCurrent={plan.isCurrent}
            isPopular={plan.isPopular}
            onSelect={() => navigate('/dashboard/student/wallet/topup/mpesa')}
          />
        ))}
      </div>
    </div>
  );
};

export default UpgradePlanPage;
