import React, { useState } from 'react';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { Crown, Check, Star, Zap, Shield, ArrowRight } from 'lucide-react';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'forever',
    icon: Star,
    color: 'text-gray-500 dark:text-white/60',
    bgColor: 'bg-gray-50 dark:bg-white/5',
    borderColor: 'border-gray-200 dark:border-[#22272B]',
    features: ['3 courses', 'Basic AI tutor', 'Community access', '5 quizzes/month'],
  },
  {
    id: 'plus',
    name: 'Plus',
    price: 499,
    period: '/month',
    icon: Zap,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    popular: true,
    features: ['Unlimited courses', 'Advanced AI tutor', 'Voice mode', 'Unlimited quizzes', 'Progress reports', 'Priority support'],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 999,
    period: '/month',
    icon: Crown,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    features: ['Everything in Plus', 'Live 1-on-1 tutoring', 'AI journal insights', 'Skill tree access', 'Shareable certificates', 'Family plan (up to 4)', 'Offline downloads'],
  },
];

const SubscriptionsPage: React.FC = () => {
  const { borderRadius } = useAgeAdaptiveUI();
  const [currentPlan] = useState('free');
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <Crown className="w-8 h-8 text-yellow-400" /> Subscription Plans
        </h1>
        <p className="text-gray-600 dark:text-white/70">Choose the plan that fits your learning goals</p>
      </div>

      {/* Current Plan */}
      <div className={`p-4 bg-green-500/10 ${borderRadius} border border-green-500/20 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-green-400" />
          <span className="text-gray-900 dark:text-white text-sm">Current Plan: <span className="font-bold capitalize">{currentPlan}</span></span>
        </div>
        <span className="text-green-400 text-sm font-medium">Active</span>
      </div>

      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => setBilling('monthly')}
          className={`px-4 py-2 ${borderRadius} text-sm font-medium ${billing === 'monthly' ? 'bg-[#FF0000] text-gray-900 dark:text-white' : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/60'}`}
        >
          Monthly
        </button>
        <button
          onClick={() => setBilling('annual')}
          className={`px-4 py-2 ${borderRadius} text-sm font-medium ${billing === 'annual' ? 'bg-[#FF0000] text-gray-900 dark:text-white' : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/60'}`}
        >
          Annual <span className="text-green-400 text-xs ml-1">Save 20%</span>
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const displayPrice = billing === 'annual' && plan.price > 0
            ? Math.round(plan.price * 0.8)
            : plan.price;

          return (
            <div
              key={plan.id}
              className={`p-6 ${plan.bgColor} ${borderRadius} border ${plan.borderColor} relative ${
                plan.popular ? 'ring-2 ring-blue-500/50' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className={`px-3 py-1 bg-blue-500 text-gray-900 dark:text-white text-xs font-bold ${borderRadius}`}>
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-4">
                <Icon className={`w-8 h-8 ${plan.color} mx-auto mb-2`} />
                <h3 className="text-gray-900 dark:text-white font-bold text-lg">{plan.name}</h3>
                <div className="mt-2">
                  {plan.price === 0 ? (
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">Free</span>
                  ) : (
                    <>
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">KES {displayPrice}</span>
                      <span className="text-gray-400 dark:text-white/40 text-sm">{plan.period}</span>
                    </>
                  )}
                </div>
              </div>

              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className={`w-4 h-4 ${plan.color} flex-shrink-0`} />
                    <span className="text-gray-600 dark:text-white/70">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                disabled={currentPlan === plan.id}
                className={`w-full py-2.5 ${borderRadius} font-medium flex items-center justify-center gap-2 ${
                  currentPlan === plan.id
                    ? 'bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-white/40 cursor-default'
                    : plan.popular
                    ? 'bg-blue-500 hover:bg-blue-600 text-gray-900 dark:text-white'
                    : 'bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white'
                }`}
              >
                {currentPlan === plan.id ? 'Current Plan' : (
                  <>Upgrade <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Family Plan Banner */}
      <div className={`p-5 bg-purple-500/10 ${borderRadius} border border-purple-500/20`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-gray-900 dark:text-white font-bold">Family Plan</h3>
            <p className="text-gray-500 dark:text-white/60 text-sm mt-1">Add up to 4 children on a single Premium plan. Save KES 1,500/month.</p>
          </div>
          <button className={`px-4 py-2 bg-purple-500 hover:bg-purple-600 text-gray-900 dark:text-white ${borderRadius} text-sm`}>
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionsPage;
