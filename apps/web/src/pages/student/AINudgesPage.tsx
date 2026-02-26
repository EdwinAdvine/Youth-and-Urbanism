// AINudgesPage - Student page at /dashboard/student/ai-nudges. Displays AI-generated
// motivational nudges including celebrations, suggestions, reminders, and goal progress alerts.
import React from 'react';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { Sparkles, Trophy, Target, Clock, Lightbulb } from 'lucide-react';

const nudges = [
  { id: '1', type: 'celebration' as const, icon: Trophy, title: 'Amazing streak!', message: "You've been learning for 15 days straight! That's better than 90% of students. Keep it up!", color: 'from-yellow-500/20 to-orange-500/20', border: 'border-yellow-500/30' },
  { id: '2', type: 'suggestion' as const, icon: Lightbulb, title: 'Try something new', message: 'Based on your interests in Science, you might love the new Chemistry experiments course!', color: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/30' },
  { id: '3', type: 'reminder' as const, icon: Clock, title: 'Quiz tomorrow', message: "Don't forget — your Fractions quiz is tomorrow at 3 PM. Review practice questions to prepare.", color: 'from-purple-500/20 to-pink-500/20', border: 'border-purple-500/30' },
  { id: '4', type: 'goal' as const, icon: Target, title: 'Almost there!', message: "You're just 2 lessons away from completing your English course. Finish strong!", color: 'from-green-500/20 to-emerald-500/20', border: 'border-green-500/30' },
  { id: '5', type: 'celebration' as const, icon: Sparkles, title: 'Level Up!', message: "Congratulations! You've reached Level 12. You've earned the 'Dedicated Learner' badge.", color: 'from-red-500/20 to-pink-500/20', border: 'border-red-500/30' },
];

const AINudgesPage: React.FC = () => {
  const { borderRadius } = useAgeAdaptiveUI();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-purple-400" /> AI Nudges & Celebrations
        </h1>
        <p className="text-gray-600 dark:text-white/70">Personalized encouragement and reminders from your AI tutor</p>
      </div>

      <div className="space-y-4">
        {nudges.map((nudge) => {
          const Icon = nudge.icon;
          return (
            <div key={nudge.id} className={`p-5 bg-gradient-to-r ${nudge.color} ${borderRadius} border ${nudge.border}`}>
              <div className="flex items-start gap-3">
                <Icon className="w-6 h-6 text-gray-900 dark:text-white flex-shrink-0" />
                <div>
                  <h3 className="text-gray-900 dark:text-white font-semibold">{nudge.title}</h3>
                  <p className="text-gray-600 dark:text-white/70 text-sm mt-1">{nudge.message}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AINudgesPage;
