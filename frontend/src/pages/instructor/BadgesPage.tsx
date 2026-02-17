import React, { useEffect, useState } from 'react';
import { Award, Star, Zap, Lock, Target } from 'lucide-react';
import { InstructorPageHeader } from '../../components/instructor/shared/InstructorPageHeader';
import apiClient from '../../services/api';
import { format } from 'date-fns';


interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url?: string;
  category: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  points_value: number;
  criteria: Record<string, any>;
  is_earned: boolean;
  earned_at?: string;
  progress?: number;
  max_progress?: number;
}

interface PointsData {
  total_points: number;
  current_level: number;
  points_to_next_level: number;
  total_points_for_next_level: number;
  streak_days: number;
  longest_streak: number;
}

export const BadgesPage: React.FC = () => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [pointsData, setPointsData] = useState<PointsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'earned' | 'locked'>('all');

  useEffect(() => {
    fetchBadgesAndPoints();
  }, []);

  const fetchBadgesAndPoints = async () => {
    try {
      setLoading(true);

      const [badgesResponse, pointsResponse] = await Promise.all([
        apiClient.get('/api/v1/instructor/gamification/badges'),
        apiClient.get('/api/v1/instructor/gamification/points'),
      ]);

      // Mock data for development
      if (!badgesResponse.data || badgesResponse.data.length === 0) {
        setBadges([
          {
            id: '1',
            name: 'First Course Published',
            description: 'Publish your first course on the platform',
            category: 'Teaching',
            tier: 'bronze',
            points_value: 10,
            criteria: { courses_published: 1 },
            is_earned: true,
            earned_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '2',
            name: '100 Students Enrolled',
            description: 'Reach 100 total student enrollments across all your courses',
            category: 'Growth',
            tier: 'silver',
            points_value: 50,
            criteria: { total_enrollments: 100 },
            is_earned: true,
            earned_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '3',
            name: '500 Students Enrolled',
            description: 'Reach 500 total student enrollments - a major milestone!',
            category: 'Growth',
            tier: 'gold',
            points_value: 100,
            criteria: { total_enrollments: 500 },
            is_earned: false,
            progress: 458,
            max_progress: 500,
          },
          {
            id: '4',
            name: 'Perfect Rating',
            description: 'Maintain a 5.0 average rating with at least 50 reviews',
            category: 'Excellence',
            tier: 'gold',
            points_value: 75,
            criteria: { avg_rating: 5.0, min_reviews: 50 },
            is_earned: false,
            progress: 4.7,
            max_progress: 5.0,
          },
          {
            id: '5',
            name: 'CBC Champion',
            description: 'Achieve 90%+ CBC alignment on 5 courses',
            category: 'Quality',
            tier: 'silver',
            points_value: 40,
            criteria: { cbc_aligned_courses: 5, min_alignment: 90 },
            is_earned: true,
            earned_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '6',
            name: '7-Day Streak',
            description: 'Stay active on the platform for 7 consecutive days',
            category: 'Consistency',
            tier: 'bronze',
            points_value: 20,
            criteria: { streak_days: 7 },
            is_earned: true,
            earned_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '7',
            name: '30-Day Streak',
            description: 'Stay active for 30 consecutive days - dedication!',
            category: 'Consistency',
            tier: 'silver',
            points_value: 50,
            criteria: { streak_days: 30 },
            is_earned: false,
            progress: 23,
            max_progress: 30,
          },
          {
            id: '8',
            name: 'Community Contributor',
            description: 'Help 10 fellow instructors in the community lounge',
            category: 'Community',
            tier: 'bronze',
            points_value: 15,
            criteria: { community_helps: 10 },
            is_earned: true,
            earned_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '9',
            name: 'Peer Recognized',
            description: 'Receive 10 kudos from fellow instructors',
            category: 'Community',
            tier: 'silver',
            points_value: 30,
            criteria: { kudos_received: 10 },
            is_earned: false,
            progress: 7,
            max_progress: 10,
          },
          {
            id: '10',
            name: 'KSh 100K Earned',
            description: 'Earn a total of KSh 100,000 from your courses',
            category: 'Revenue',
            tier: 'gold',
            points_value: 100,
            criteria: { total_revenue: 100000 },
            is_earned: true,
            earned_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '11',
            name: 'Elite Educator',
            description: 'Reach 1000 enrollments with 4.8+ rating',
            category: 'Excellence',
            tier: 'platinum',
            points_value: 200,
            criteria: { total_enrollments: 1000, avg_rating: 4.8 },
            is_earned: false,
            progress: 458,
            max_progress: 1000,
          },
        ]);
      } else {
        setBadges(badgesResponse.data);
      }

      if (!pointsResponse.data) {
        setPointsData({
          total_points: 445,
          current_level: 7,
          points_to_next_level: 55,
          total_points_for_next_level: 500,
          streak_days: 23,
          longest_streak: 45,
        });
      } else {
        setPointsData(pointsResponse.data);
      }
    } catch (error) {
      console.error('Error fetching badges and points:', error);
      setBadges([]);
    } finally {
      setLoading(false);
    }
  };

  const tierColors = {
    bronze: 'bg-orange-900/30 border-orange-700/50 text-orange-300',
    silver: 'bg-gray-400/20 border-gray-400/50 text-gray-200',
    gold: 'bg-yellow-600/30 border-yellow-500/50 text-yellow-200',
    platinum: 'bg-purple-500/30 border-purple-400/50 text-purple-200',
  };

  const tierIcons = {
    bronze: '🥉',
    silver: '🥈',
    gold: '🥇',
    platinum: '💎',
  };

  const categories = ['all', 'Teaching', 'Growth', 'Excellence', 'Quality', 'Consistency', 'Community', 'Revenue'];

  const filteredBadges = badges.filter((badge) => {
    if (filterCategory !== 'all' && badge.category !== filterCategory) return false;
    if (filterStatus === 'earned' && !badge.is_earned) return false;
    if (filterStatus === 'locked' && badge.is_earned) return false;
    return true;
  });

  const earnedBadges = badges.filter((b) => b.is_earned);
  const totalPoints = earnedBadges.reduce((sum, b) => sum + b.points_value, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <InstructorPageHeader
        title="Badges & Milestones"
        description="Track your achievements and level up your instructor profile"
        icon={<Award className="w-6 h-6 text-purple-400" />}
      />

      {/* Level Progress */}
      {pointsData && (
        <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                Level {pointsData.current_level}
              </h3>
              <p className="text-sm text-purple-200">
                {pointsData.total_points.toLocaleString()} total points
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-purple-200 mb-1">Next Level</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {pointsData.points_to_next_level} points to go
              </p>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-purple-200 mb-2">
              <span>Progress to Level {pointsData.current_level + 1}</span>
              <span>
                {((pointsData.total_points / pointsData.total_points_for_next_level) * 100).toFixed(
                  1
                )}
                %
              </span>
            </div>
            <div className="h-3 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                style={{
                  width: `${
                    (pointsData.total_points / pointsData.total_points_for_next_level) * 100
                  }%`,
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-white/5 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-orange-400" />
                <span className="text-xs text-gray-500 dark:text-white/60">Current Streak</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{pointsData.streak_days} days</p>
            </div>
            <div className="bg-gray-50 dark:bg-white/5 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-xs text-gray-500 dark:text-white/60">Longest Streak</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{pointsData.longest_streak} days</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-5">
          <p className="text-sm text-gray-500 dark:text-white/60 mb-2">Total Badges</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{badges.length}</p>
        </div>

        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-5">
          <p className="text-sm text-gray-500 dark:text-white/60 mb-2">Earned</p>
          <p className="text-3xl font-bold text-green-400">{earnedBadges.length}</p>
        </div>

        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-5">
          <p className="text-sm text-gray-500 dark:text-white/60 mb-2">In Progress</p>
          <p className="text-3xl font-bold text-orange-400">
            {badges.filter((b) => !b.is_earned && b.progress).length}
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-5">
          <p className="text-sm text-gray-500 dark:text-white/60 mb-2">Total Points</p>
          <p className="text-3xl font-bold text-purple-400">{totalPoints}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-white/60">Category:</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-white/60">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'earned' | 'locked')}
            className="px-3 py-1.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50"
          >
            <option value="all">All Badges</option>
            <option value="earned">Earned</option>
            <option value="locked">Locked</option>
          </select>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBadges.map((badge) => (
          <div
            key={badge.id}
            className={`bg-gray-50 dark:bg-white/5 backdrop-blur-sm border rounded-xl p-5 transition-all ${
              badge.is_earned
                ? 'border-gray-200 dark:border-white/10 hover:border-purple-500/30'
                : 'border-gray-100 dark:border-white/5 opacity-60 hover:opacity-80'
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="text-4xl">{tierIcons[badge.tier]}</div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{badge.name}</h4>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium border ${
                      tierColors[badge.tier]
                    }`}
                  >
                    {badge.tier}
                  </span>
                </div>
              </div>
              {!badge.is_earned && <Lock className="w-4 h-4 text-gray-400 dark:text-gray-300 dark:text-white/40" />}
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-white/70 mb-3">{badge.description}</p>

            {/* Progress Bar (for locked badges with progress) */}
            {!badge.is_earned && badge.progress !== undefined && badge.max_progress && (
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-white/60 mb-1">
                  <span>Progress</span>
                  <span>
                    {badge.progress} / {badge.max_progress}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                    style={{ width: `${(badge.progress / badge.max_progress) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-white/10">
              <div className="flex items-center gap-1 text-sm text-purple-300">
                <Star className="w-4 h-4" />
                <span>{badge.points_value} pts</span>
              </div>
              {badge.is_earned && badge.earned_at && (
                <span className="text-xs text-gray-400 dark:text-gray-300 dark:text-white/40">
                  {format(new Date(badge.earned_at), 'MMM d, yyyy')}
                </span>
              )}
            </div>

            {/* Category Tag */}
            <div className="mt-3">
              <span className="px-2 py-1 bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/60 text-xs rounded">
                {badge.category}
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredBadges.length === 0 && (
        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-12 text-center">
          <Award className="w-16 h-16 text-gray-400 dark:text-white/30 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-white/60">No badges found with the selected filters</p>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Target className="w-5 h-5 text-purple-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-purple-200 mb-2">How Badges Work</h4>
            <ul className="text-sm text-purple-200/80 space-y-1 list-disc list-inside">
              <li>Earn badges by reaching milestones in teaching, growth, quality, and community</li>
              <li>
                Higher tier badges (Gold, Platinum) grant more points and boost your profile visibility
              </li>
              <li>Points accumulate to increase your instructor level - each level unlocks perks</li>
              <li>
                Maintain activity streaks to earn bonus points and keep your profile ranking high
              </li>
              <li>
                Badges are displayed on your public instructor profile to attract more students
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
