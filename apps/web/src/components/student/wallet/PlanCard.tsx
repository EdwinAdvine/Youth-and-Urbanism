import React from 'react';
import { useAgeAdaptiveUI } from '../../../hooks/useAgeAdaptiveUI';
import { Check, Star } from 'lucide-react';

interface PlanCardProps {
  name: string;
  price: number;
  period: string;
  features: string[];
  isPopular?: boolean;
  isCurrent?: boolean;
  onSelect: () => void;
}

const PlanCard: React.FC<PlanCardProps> = ({ name, price, period, features, isPopular, isCurrent, onSelect }) => {
  const { borderRadius } = useAgeAdaptiveUI();

  return (
    <div className={`p-6 bg-white dark:bg-[#181C1F] ${borderRadius} border ${
      isPopular ? 'border-[#FF0000]/50' : isCurrent ? 'border-green-500/30' : 'border-gray-200 dark:border-[#22272B]'
    } relative`}>
      {isPopular && (
        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[#FF0000] text-gray-900 dark:text-white text-xs ${borderRadius} flex items-center gap-1`}>
          <Star className="w-3 h-3" /> Popular
        </div>
      )}
      <h3 className="text-gray-900 dark:text-white font-bold text-lg">{name}</h3>
      <div className="mt-2">
        <span className="text-3xl font-bold text-gray-900 dark:text-white">KES {price.toLocaleString()}</span>
        <span className="text-gray-400 dark:text-white/40 text-sm">/{period}</span>
      </div>
      <ul className="mt-4 space-y-2">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
            <span className="text-gray-600 dark:text-white/70">{f}</span>
          </li>
        ))}
      </ul>
      <button
        onClick={onSelect}
        disabled={isCurrent}
        className={`w-full mt-4 py-2.5 ${borderRadius} font-medium text-sm ${
          isCurrent
            ? 'bg-green-500/20 text-green-400'
            : isPopular
            ? 'bg-[#FF0000] hover:bg-[#FF0000]/80 text-gray-900 dark:text-white'
            : 'bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-900 dark:text-white'
        }`}
      >
        {isCurrent ? 'Current Plan' : 'Select Plan'}
      </button>
    </div>
  );
};

export default PlanCard;
