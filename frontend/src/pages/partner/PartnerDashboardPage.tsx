import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  TrendingUp,
  FileCheck,
  DollarSign,
  Calendar,
  Bell,
  ArrowRight,
  BookOpen,
  Award,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { usePartnerStore } from '../../store/partnerStore';
import { useNavigate } from 'react-router-dom';
import {
  getPartnerDashboardOverview,
  getPartnerAIHighlights,
} from '../../services/partner/partnerDashboardService';
import type { PartnerDashboardOverview } from '../../types/partner';

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// --- Fallback mock data used when API calls fail ---

const fallbackStats = [
  {
    title: 'Total Children',
    value: '247',
    change: '+12 this month',
    icon: Users,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    trend: 'up',
  },
  {
    title: 'Active Programs',
    value: '12',
    change: '8 running',
    icon: BookOpen,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    trend: 'stable',
  },
  {
    title: 'Pending Consents',
    value: '5',
    change: 'Needs attention',
    icon: FileCheck,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    trend: 'attention',
  },
  {
    title: 'Monthly Spend',
    value: 'KSh 845K',
    change: '+8% vs last month',
    icon: DollarSign,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    trend: 'up',
  },
];

const fallbackAIHighlights = [
  {
    title: 'Top Performer',
    content: 'Sarah M. achieved 95% in Mathematics this week - highest in STEM program',
    icon: Award,
    color: 'text-yellow-400',
  },
  {
    title: 'Learning Alert',
    content: '3 students showing slower progress in Science - suggested intervention available',
    icon: AlertCircle,
    color: 'text-orange-400',
  },
  {
    title: 'Milestone Reached',
    content: 'Grace K. completed all Grade 5 CBC competencies - ready for advancement',
    icon: CheckCircle,
    color: 'text-green-400',
  },
];

const fallbackRecentActivities = [
  {
    id: 1,
    type: 'consent',
    title: 'New consent form submitted',
    description: 'Parent of James M. approved learning path changes',
    time: '2 hours ago',
    icon: FileCheck,
    iconColor: 'text-green-400',
    iconBg: 'bg-green-500/10',
  },
  {
    id: 2,
    type: 'achievement',
    title: 'Student milestone achieved',
    description: 'Sarah M. completed Advanced Mathematics module',
    time: '5 hours ago',
    icon: Award,
    iconColor: 'text-yellow-400',
    iconBg: 'bg-yellow-500/10',
  },
  {
    id: 3,
    type: 'payment',
    title: 'Monthly payment processed',
    description: 'KSh 845,000 for December sponsorships',
    time: '1 day ago',
    icon: DollarSign,
    iconColor: 'text-purple-400',
    iconBg: 'bg-purple-500/10',
  },
  {
    id: 4,
    type: 'alert',
    title: 'Attention needed',
    description: '2 students require additional support in Science',
    time: '2 days ago',
    icon: Bell,
    iconColor: 'text-orange-400',
    iconBg: 'bg-orange-500/10',
  },
];

const fallbackUpcomingMeetings = [
  {
    id: 1,
    title: 'Quarterly Review Meeting',
    date: 'Feb 18, 2026',
    time: '10:00 AM',
    participants: 'Program coordinators, 3 staff members',
    type: 'virtual',
  },
  {
    id: 2,
    title: 'Parent-Partner Forum',
    date: 'Feb 22, 2026',
    time: '2:00 PM',
    participants: '15 parents, support staff',
    type: 'in-person',
  },
  {
    id: 3,
    title: 'Impact Assessment Workshop',
    date: 'Mar 1, 2026',
    time: '9:00 AM',
    participants: 'All program managers',
    type: 'virtual',
  },
];

// --- Helper to map AI highlight type to icon & color ---

const highlightIconMap: Record<string, { icon: typeof Award; color: string }> = {
  celebration: { icon: Award, color: 'text-yellow-400' },
  alert: { icon: AlertCircle, color: 'text-orange-400' },
  insight: { icon: CheckCircle, color: 'text-green-400' },
  recommendation: { icon: Sparkles, color: 'text-blue-400' },
};

// --- Helper to format currency amounts ---

const formatCurrency = (amount: number, currency: string): string => {
  if (amount >= 1_000_000) {
    return `${currency} ${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `${currency} ${(amount / 1_000).toFixed(0)}K`;
  }
  return `${currency} ${amount}`;
};

const PartnerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const counters = usePartnerStore((state) => state.counters);

  // --- API state ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<PartnerDashboardOverview | null>(null);
  const [highlights, setHighlights] = useState<
    Array<{
      id: string;
      type: 'insight' | 'alert' | 'recommendation' | 'celebration';
      title: string;
      description: string;
      priority: 'low' | 'medium' | 'high';
      action?: { label: string; url: string };
      created_at: string;
    }>
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewData, highlightsData] = await Promise.all([
          getPartnerDashboardOverview(),
          getPartnerAIHighlights(),
        ]);
        setOverview(overviewData);
        setHighlights(highlightsData.highlights || []);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Showing cached information.');
        // Fallback: leave overview as null, highlights as empty so mock data is used
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Build stats from API data or fall back to mock ---
  const stats = overview
    ? [
        {
          title: 'Total Children',
          value: overview.total_children_sponsored.toString(),
          change: `${overview.active_children} active`,
          icon: Users,
          color: 'text-blue-400',
          bg: 'bg-blue-500/10',
          trend: 'up',
        },
        {
          title: 'Active Programs',
          value: overview.active_programs.toString(),
          change: `${overview.total_programs} total`,
          icon: BookOpen,
          color: 'text-green-400',
          bg: 'bg-green-500/10',
          trend: 'stable',
        },
        {
          title: 'Pending Consents',
          value: overview.pending_consent.toString(),
          change: overview.pending_consent > 0 ? 'Needs attention' : 'All clear',
          icon: FileCheck,
          color: 'text-orange-400',
          bg: 'bg-orange-500/10',
          trend: overview.pending_consent > 0 ? 'attention' : 'stable',
        },
        {
          title: 'Monthly Spend',
          value: formatCurrency(overview.current_monthly_cost, overview.currency),
          change: `${formatCurrency(overview.total_invested, overview.currency)} total invested`,
          icon: DollarSign,
          color: 'text-purple-400',
          bg: 'bg-purple-500/10',
          trend: 'up',
        },
      ]
    : [
        // Fallback: merge store counters into mock stats
        { ...fallbackStats[0] },
        {
          ...fallbackStats[1],
          value: counters.activeSponsorships.toString(),
        },
        {
          ...fallbackStats[2],
          value: counters.pendingConsents.toString(),
        },
        { ...fallbackStats[3] },
      ];

  // --- Build AI highlights from API data or fall back to mock ---
  const aiHighlights =
    highlights.length > 0
      ? highlights.map((h) => {
          const mapping = highlightIconMap[h.type] || {
            icon: Sparkles,
            color: 'text-gray-900 dark:text-white',
          };
          return {
            title: h.title,
            content: h.description,
            icon: mapping.icon,
            color: mapping.color,
          };
        })
      : fallbackAIHighlights;

  // --- Recent activities & meetings: use API data when available, else mock ---
  const recentActivities = fallbackRecentActivities;
  const upcomingMeetings = fallbackUpcomingMeetings;

  const quickLinks = [
    {
      title: 'View All Programs',
      description: 'Manage your sponsorship programs',
      icon: BookOpen,
      color: 'from-blue-500/20 to-cyan-500/20',
      borderColor: 'border-blue-500/30',
      onClick: () => navigate('/dashboard/partner/sponsorships'),
    },
    {
      title: 'Sponsored Children',
      description: 'Track progress and achievements',
      icon: Users,
      color: 'from-green-500/20 to-emerald-500/20',
      borderColor: 'border-green-500/30',
      onClick: () => navigate('/dashboard/partner/sponsored-children'),
    },
    {
      title: 'Funding & Billing',
      description: 'Review payments and invoices',
      icon: DollarSign,
      color: 'from-purple-500/20 to-pink-500/20',
      borderColor: 'border-purple-500/30',
      onClick: () => navigate('/dashboard/partner/funding'),
    },
    {
      title: 'Reports & Analytics',
      description: 'View impact metrics',
      icon: TrendingUp,
      color: 'from-orange-500/20 to-red-500/20',
      borderColor: 'border-orange-500/30',
      onClick: () => {},
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0F1112] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#E40000]/20 animate-pulse" />
          <p className="text-gray-600 dark:text-white/70 animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F1112] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Error banner */}
        {error && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0" />
            <p className="text-sm text-orange-300">{error}</p>
          </div>
        )}

        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-gradient-to-r from-[#E40000]/20 to-transparent border border-gray-200 dark:border-[#22272B] rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Partner Dashboard</h1>
                <p className="text-gray-600 dark:text-white/70">
                  Welcome back! Here's an overview of your sponsorship programs and impact.
                </p>
              </div>
              <div className="hidden md:block">
                <div className="w-16 h-16 bg-[#E40000]/20 rounded-full flex items-center justify-center">
                  <Activity className="w-8 h-8 text-[#E40000]" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {stats.map((stat, index) => (
            <motion.div key={index} variants={fadeUp} whileHover={{ scale: 1.02 }}>
              <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${stat.bg}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  {stat.trend === 'up' && (
                    <div className="flex items-center gap-1 text-xs text-green-400">
                      <TrendingUp className="w-3 h-3" />
                    </div>
                  )}
                  {stat.trend === 'attention' && (
                    <div className="flex items-center gap-1 text-xs text-orange-400">
                      <AlertCircle className="w-3 h-3" />
                    </div>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</h3>
                <p className="text-sm text-gray-500 dark:text-white/60 mb-1">{stat.title}</p>
                <p className="text-xs text-gray-400 dark:text-white/40">{stat.change}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* BentoGrid Quick Links */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickLinks.map((link, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                onClick={link.onClick}
                className="cursor-pointer"
              >
                <div
                  className={`bg-gradient-to-br ${link.color} border ${link.borderColor} rounded-xl p-6 h-full`}
                >
                  <link.icon className="w-8 h-8 text-gray-900 dark:text-white mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{link.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-white/70 mb-4">{link.description}</p>
                  <div className="flex items-center text-[#E40000] text-sm font-medium">
                    View <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Highlights Section */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6 h-full">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-[#E40000]" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">AI Insights</h2>
              </div>
              <div className="space-y-4">
                {aiHighlights.map((highlight, index) => (
                  <div
                    key={index}
                    className="bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg p-4 hover:bg-[#2A2F34] transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <highlight.icon className={`w-5 h-5 ${highlight.color} flex-shrink-0 mt-0.5`} />
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{highlight.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-white/70">{highlight.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Recent Activity Feed */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6 h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
                <button className="text-[#E40000] text-sm font-medium hover:text-[#FF4444] transition-colors">
                  View all
                </button>
              </div>
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg p-4 hover:bg-[#2A2F34] transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${activity.iconBg}`}>
                        <activity.icon className={`w-4 h-4 ${activity.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{activity.title}</h3>
                        <p className="text-xs text-gray-500 dark:text-white/60 mb-2">{activity.description}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-white/40">
                          <Clock className="w-3 h-3" />
                          {activity.time}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Upcoming Meetings */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Upcoming Meetings</h2>
              <button className="text-[#E40000] text-sm font-medium hover:text-[#FF4444] transition-colors flex items-center gap-2">
                View calendar <Calendar className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {upcomingMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg p-4 hover:bg-[#2A2F34] transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{meeting.title}</h3>
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        meeting.type === 'virtual'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-green-500/20 text-green-400'
                      }`}
                    >
                      {meeting.type}
                    </span>
                  </div>
                  <div className="space-y-2 text-xs text-gray-500 dark:text-white/60">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      {meeting.date}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      {meeting.time}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3 h-3" />
                      {meeting.participants}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PartnerDashboardPage;
