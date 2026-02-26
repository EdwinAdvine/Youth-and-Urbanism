import React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  PartyPopper,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

type HighlightType = 'celebration' | 'insight' | 'alert' | 'recommendation';
type Priority = 'low' | 'medium' | 'high';

interface Highlight {
  id: number;
  type: HighlightType;
  title: string;
  description: string;
  priority: Priority;
  createdAt: string;
  actionLabel?: string;
  actionRoute?: string;
}

const highlights: Highlight[] = [
  {
    id: 1,
    type: 'celebration',
    title: 'Grade 4 Math Improvement',
    description:
      'Students in STEM Achievers program showed 23% improvement in mathematics over the last month.',
    priority: 'low',
    createdAt: '2026-02-14',
  },
  {
    id: 2,
    type: 'insight',
    title: 'Engagement Peak Hours',
    description:
      'Sponsored children are most active between 4-6 PM on weekdays. Consider scheduling sessions during this window.',
    priority: 'medium',
    createdAt: '2026-02-13',
    actionLabel: 'View Analytics',
    actionRoute: '/dashboard/partner/analytics/roi',
  },
  {
    id: 3,
    type: 'alert',
    title: '3 Children Need Attention',
    description:
      'Three students in Individual Scholarship program have shown declining activity this week.',
    priority: 'high',
    createdAt: '2026-02-14',
    actionLabel: 'View Children',
    actionRoute: '/dashboard/partner/children/overview',
  },
  {
    id: 4,
    type: 'recommendation',
    title: 'Expand to Grade 5',
    description:
      'Based on current success rates, expanding STEM Achievers to Grade 5 could benefit 15 additional students.',
    priority: 'medium',
    createdAt: '2026-02-12',
    actionLabel: 'View Programs',
    actionRoute: '/dashboard/partner/sponsorships',
  },
  {
    id: 5,
    type: 'insight',
    title: 'Cost Efficiency Up',
    description:
      'Your cost per student completion has decreased by 12% compared to last term.',
    priority: 'low',
    createdAt: '2026-02-11',
  },
  {
    id: 6,
    type: 'alert',
    title: 'Pending Consents',
    description:
      '4 parent consents are still pending for recently added children. Follow up recommended.',
    priority: 'high',
    createdAt: '2026-02-14',
    actionLabel: 'View Details',
    actionRoute: '/dashboard/partner/children/overview',
  },
];

const typeBadgeConfig: Record<
  HighlightType,
  { label: string; bg: string; text: string; icon: React.ElementType }
> = {
  celebration: {
    label: 'Celebration',
    bg: 'bg-green-500/10',
    text: 'text-green-400',
    icon: PartyPopper,
  },
  insight: {
    label: 'Insight',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    icon: TrendingUp,
  },
  alert: {
    label: 'Alert',
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    icon: AlertTriangle,
  },
  recommendation: {
    label: 'Recommendation',
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    icon: Lightbulb,
  },
};

const priorityConfig: Record<Priority, { label: string; dot: string }> = {
  low: { label: 'Low', dot: 'bg-gray-400' },
  medium: { label: 'Medium', dot: 'bg-yellow-400' },
  high: { label: 'High', dot: 'bg-red-400' },
};

const AIHighlightsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F1112] p-6">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto"
      >
        <motion.div variants={fadeUp} className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Highlights</h1>
          <p className="text-gray-400 mt-1">
            AI-powered insights about your sponsorship programs
          </p>
        </motion.div>

        {/* Daily Summary Card */}
        <motion.div
          variants={fadeUp}
          className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Sparkles size={20} className="text-amber-400" />
            </div>
            <h2 className="text-gray-900 dark:text-white font-semibold text-lg">Daily Summary</h2>
          </div>
          <p className="text-gray-400 dark:text-gray-300 text-sm leading-relaxed">
            Good morning! Today your sponsorship programs are supporting{' '}
            <span className="text-gray-900 dark:text-white font-medium">42 active students</span>{' '}
            across 3 programs. Overall engagement is up{' '}
            <span className="text-green-400 font-medium">8% this week</span>.
            The STEM Achievers program continues to outperform targets with a{' '}
            <span className="text-gray-900 dark:text-white font-medium">
              92% attendance rate
            </span>
            . Two action items require your attention today: pending parent
            consents and students flagged for follow-up. Your total impact score
            has risen to{' '}
            <span className="text-amber-400 font-medium">87/100</span>, placing
            you in the top 15% of active partners this quarter.
          </p>
        </motion.div>

        {/* Highlight Cards Grid */}
        <motion.div
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {highlights.map((item) => {
            const badge = typeBadgeConfig[item.type];
            const priority = priorityConfig[item.priority];
            const BadgeIcon = badge.icon;

            return (
              <motion.div
                key={item.id}
                variants={fadeUp}
                className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5 flex flex-col"
              >
                {/* Type Badge and Priority */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}
                  >
                    <BadgeIcon size={12} />
                    {badge.label}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                    <span
                      className={`w-2 h-2 rounded-full ${priority.dot}`}
                    />
                    {priority.label}
                  </span>
                </div>

                {/* Title and Description */}
                <h3 className="text-gray-900 dark:text-white font-semibold text-sm mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-400 text-xs leading-relaxed flex-1">
                  {item.description}
                </p>

                {/* Footer: Date and Action */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-[#22272B]">
                  <span className="text-gray-500 text-xs">
                    {new Date(item.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  {item.actionLabel && item.actionRoute && (
                    <button
                      onClick={() => navigate(item.actionRoute!)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-red-400 hover:text-red-300 transition-colors"
                    >
                      {item.actionLabel}
                      <ArrowRight size={12} />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AIHighlightsPage;
