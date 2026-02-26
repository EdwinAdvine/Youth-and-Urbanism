import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Users,
  TrendingUp,
  Award,
  AlertTriangle,
  Eye,
  BookOpen,
  CheckCircle,
  Clock,
  Zap,
  Target,
  Activity,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getSponsoredChildren } from '../../services/partner/sponsorshipService';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface SponsoredChildUI {
  id: string;
  name: string;
  avatar: string;
  program: string;
  grade: string;
  status: 'excellent' | 'good' | 'needs-support';
  progress: number;
  weeklyActivity: number;
  streakDays: number;
  recentAchievement: string;
  consentStatus: 'approved' | 'pending' | 'expired';
  lastActive: string;
  alerts: number;
}

/** Hardcoded fallback data used when the API is unavailable */
const FALLBACK_CHILDREN: SponsoredChildUI[] = [
  {
    id: '1',
    name: 'Sarah Mwangi',
    avatar: 'SM',
    program: 'STEM Excellence',
    grade: 'Grade 8',
    status: 'excellent',
    progress: 95,
    weeklyActivity: 18,
    streakDays: 12,
    recentAchievement: 'Mathematics Excellence Award',
    consentStatus: 'approved',
    lastActive: '2 hours ago',
    alerts: 0,
  },
  {
    id: '2',
    name: 'James Omondi',
    avatar: 'JO',
    program: 'Early Childhood',
    grade: 'Grade 2',
    status: 'good',
    progress: 78,
    weeklyActivity: 12,
    streakDays: 5,
    recentAchievement: 'Reading Milestone',
    consentStatus: 'approved',
    lastActive: '1 day ago',
    alerts: 0,
  },
  {
    id: '3',
    name: 'Grace Kamau',
    avatar: 'GK',
    program: 'Girls in Tech',
    grade: 'Grade 7',
    status: 'excellent',
    progress: 92,
    weeklyActivity: 20,
    streakDays: 15,
    recentAchievement: 'Coding Challenge Winner',
    consentStatus: 'approved',
    lastActive: '3 hours ago',
    alerts: 0,
  },
  {
    id: '4',
    name: 'David Kiprono',
    avatar: 'DK',
    program: 'Sports & Arts',
    grade: 'Grade 5',
    status: 'needs-support',
    progress: 58,
    weeklyActivity: 6,
    streakDays: 2,
    recentAchievement: 'Art Project Completion',
    consentStatus: 'approved',
    lastActive: '3 days ago',
    alerts: 2,
  },
  {
    id: '5',
    name: 'Lucy Wanjiru',
    avatar: 'LW',
    program: 'STEM Excellence',
    grade: 'Grade 9',
    status: 'good',
    progress: 85,
    weeklyActivity: 14,
    streakDays: 8,
    recentAchievement: 'Science Fair Participant',
    consentStatus: 'approved',
    lastActive: '5 hours ago',
    alerts: 0,
  },
  {
    id: '6',
    name: 'Michael Otieno',
    avatar: 'MO',
    program: 'Special Needs Support',
    grade: 'Grade 4',
    status: 'good',
    progress: 72,
    weeklyActivity: 10,
    streakDays: 4,
    recentAchievement: 'Communication Progress',
    consentStatus: 'pending',
    lastActive: '1 day ago',
    alerts: 1,
  },
];

/**
 * Map an API-returned SponsoredChild to the UI shape.
 * Fields that do not exist on the API response get sensible defaults.
 */
const mapApiChildToUI = (apiChild: Record<string, any>): SponsoredChildUI => {
  const name: string = apiChild.student_name || apiChild.name || 'Unknown';
  const initials = name
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return {
    id: apiChild.id,
    name,
    avatar: apiChild.avatar || initials,
    program: apiChild.program || apiChild.program_name || 'General',
    grade: apiChild.grade_level || apiChild.grade || 'N/A',
    status: apiChild.status === 'active' ? 'good' : apiChild.status === 'paused' ? 'needs-support' : (apiChild.status as SponsoredChildUI['status']) || 'good',
    progress: apiChild.progress ?? 0,
    weeklyActivity: apiChild.weeklyActivity ?? apiChild.weekly_activity ?? 0,
    streakDays: apiChild.streakDays ?? apiChild.streak_days ?? 0,
    recentAchievement: apiChild.recentAchievement || apiChild.recent_achievement || 'No recent achievements',
    consentStatus: apiChild.consent_given === true ? 'approved' : apiChild.consent_given === false ? 'pending' : (apiChild.consentStatus as SponsoredChildUI['consentStatus']) || 'pending',
    lastActive: apiChild.lastActive || apiChild.last_active || 'Unknown',
    alerts: apiChild.alerts ?? 0,
  };
};

const SponsoredChildrenPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [programFilter, setProgramFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [children, setChildren] = useState<SponsoredChildUI[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchChildren = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getSponsoredChildren();
        if (!cancelled) {
          if (response?.items && response.items.length > 0) {
            setChildren(response.items.map((item: any) => mapApiChildToUI(item)));
          } else {
            // API returned empty list -- fall back to hardcoded data
            setChildren(FALLBACK_CHILDREN);
          }
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error('Failed to fetch sponsored children:', err);
          setError(err?.message || 'Failed to load sponsored children');
          // Fall back to hardcoded data on error
          setChildren(FALLBACK_CHILDREN);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchChildren();

    return () => {
      cancelled = true;
    };
  }, []);

  const getStatusBadge = (status: string) => {
    const styles = {
      excellent: 'bg-green-500/20 text-green-400 border-green-500/30',
      good: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'needs-support': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium border ${
          styles[status as keyof typeof styles]
        }`}
      >
        {status === 'needs-support' ? 'Needs Support' : status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getConsentBadge = (status: string) => {
    const styles = {
      approved: 'bg-green-500/20 text-green-400',
      pending: 'bg-yellow-500/20 text-yellow-400',
      expired: 'bg-red-500/20 text-red-400',
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredChildren = children.filter((child) => {
    const matchesSearch = child.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProgram = programFilter === 'all' || child.program === programFilter;
    const matchesStatus = statusFilter === 'all' || child.status === statusFilter;
    return matchesSearch && matchesProgram && matchesStatus;
  });

  const stats = [
    {
      label: 'Total Children',
      value: children.length,
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Excellent Progress',
      value: children.filter((c) => c.status === 'excellent').length,
      icon: TrendingUp,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
    },
    {
      label: 'Needs Support',
      value: children.filter((c) => c.status === 'needs-support').length,
      icon: AlertTriangle,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
    },
    {
      label: 'Avg Progress',
      value: `${children.length > 0 ? Math.round(children.reduce((sum, c) => sum + c.progress, 0) / children.length) : 0}%`,
      icon: Target,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0F1112] p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-white dark:bg-[#181C1F] rounded-lg w-1/3" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl" />
              ))}
            </div>
            <div className="h-14 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-72 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F1112] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Sponsored Children</h1>
            <p className="text-gray-500 dark:text-white/60">Monitor progress and achievements of all sponsored children</p>
          </div>
        </motion.div>

        {/* Error banner -- shown when API failed but fallback data is in use */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
            <p className="text-sm text-yellow-400">
              Unable to load live data. Showing cached results. ({error})
            </p>
          </div>
        )}

        {/* Stats Overview */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          {stats.map((stat, index) => (
            <div key={index} className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 dark:text-white/50 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Search and Filters */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40" />
                <input
                  type="text"
                  placeholder="Search by child name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg text-sm text-gray-900 dark:text-white placeholder-white/30 focus:outline-none focus:border-[#E40000]/50"
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400 dark:text-white/40" />
                  <select
                    value={programFilter}
                    onChange={(e) => setProgramFilter(e.target.value)}
                    className="px-4 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#E40000]/50"
                  >
                    <option value="all">All Programs</option>
                    <option value="STEM Excellence">STEM Excellence</option>
                    <option value="Early Childhood">Early Childhood</option>
                    <option value="Girls in Tech">Girls in Tech</option>
                    <option value="Sports & Arts">Sports & Arts</option>
                    <option value="Special Needs Support">Special Needs</option>
                  </select>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#E40000]/50"
                >
                  <option value="all">All Status</option>
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="needs-support">Needs Support</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Children Grid */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-4"
        >
          {filteredChildren.map((child) => (
            <motion.div
              key={child.id}
              whileHover={{ scale: 1.01 }}
              className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6 hover:border-[#E40000]/30 transition-colors cursor-pointer"
              onClick={() => navigate(`/dashboard/partner/sponsored-children/${child.id}`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#E40000] to-[#FF4444] rounded-full flex items-center justify-center text-gray-900 dark:text-white font-bold">
                    {child.avatar}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{child.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-white/60">{child.grade}</span>
                      <span className="text-xs text-gray-400 dark:text-white/40">•</span>
                      <span className="text-xs text-gray-500 dark:text-white/60">{child.program}</span>
                    </div>
                  </div>
                </div>
                {getStatusBadge(child.status)}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-100 dark:bg-[#22272B] rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen className="w-4 h-4 text-blue-400" />
                    <p className="text-xs text-gray-400 dark:text-white/40">Progress</p>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{child.progress}%</p>
                </div>
                <div className="bg-gray-100 dark:bg-[#22272B] rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="w-4 h-4 text-green-400" />
                    <p className="text-xs text-gray-400 dark:text-white/40">Weekly</p>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{child.weeklyActivity}h</p>
                </div>
                <div className="bg-gray-100 dark:bg-[#22272B] rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-orange-400" />
                    <p className="text-xs text-gray-400 dark:text-white/40">Streak</p>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{child.streakDays}d</p>
                </div>
              </div>

              <div className="bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg p-3 mb-4">
                <div className="flex items-start gap-2">
                  <Award className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 dark:text-white/40 mb-1">Recent Achievement</p>
                    <p className="text-sm text-gray-900 dark:text-white font-medium">{child.recentAchievement}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-gray-400 dark:text-white/40" />
                  <span className="text-xs text-gray-500 dark:text-white/60">Consent:</span>
                  {getConsentBadge(child.consentStatus)}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-white/40">
                  <Clock className="w-3 h-3" />
                  {child.lastActive}
                </div>
              </div>

              {child.alerts > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-orange-500/10 border border-orange-500/30 rounded-lg mb-4">
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
                  <span className="text-sm text-orange-400">
                    {child.alerts} alert{child.alerts > 1 ? 's' : ''} - attention needed
                  </span>
                </div>
              )}

              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#E40000]/20 text-[#E40000] rounded-lg hover:bg-[#E40000]/30 transition-colors">
                <Eye className="w-4 h-4" />
                View Full Progress
              </button>
            </motion.div>
          ))}
        </motion.div>

        {filteredChildren.length === 0 && (
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-12 text-center">
            <Users className="w-12 h-12 text-gray-400 dark:text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No children found</h3>
            <p className="text-sm text-gray-500 dark:text-white/60">
              Try adjusting your search or filters to find what you're looking for
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SponsoredChildrenPage;
