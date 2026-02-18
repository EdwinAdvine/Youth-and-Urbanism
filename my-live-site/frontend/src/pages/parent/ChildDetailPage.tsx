/**
 * Child Detail Page
 *
 * Tabbed interface showing:
 * - Learning Journey (CBC radar, focus areas, weekly narrative)
 * - Activity (daily stats, timeline)
 * - Achievements (certificates, badges, milestones)
 * - Goals (CRUD interface)
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, BookOpen, Activity, Award, Target,
  TrendingUp, Zap, Clock
} from 'lucide-react';
import CBCRadarChart from '../../components/parent/children/CBCRadarChart';
import ActivityTimeline from '../../components/parent/children/ActivityTimeline';
import GoalManager from '../../components/parent/children/GoalManager';
import {
  getChildProfile,
  getLearningJourney,
  getActivity,
  getAchievements,
  getChildGoals,
} from '../../services/parentChildrenService';
import type {
  ChildProfileResponse,
  LearningJourneyResponse,
  ActivityResponse,
  AchievementsResponse,
  GoalsListResponse,
} from '../../types/parent';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const ChildDetailPage: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // State
  const [activeTab, setActiveTab] = useState<string>('learning');
  const [profile, setProfile] = useState<ChildProfileResponse | null>(null);
  const [journey, setJourney] = useState<LearningJourneyResponse | null>(null);
  const [activity, setActivity] = useState<ActivityResponse | null>(null);
  const [achievements, setAchievements] = useState<AchievementsResponse | null>(null);
  const [goals, setGoals] = useState<GoalsListResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Extract tab from URL hash
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (['learning', 'activity', 'achievements', 'goals'].includes(hash)) {
      setActiveTab(hash);
    }
  }, [location.hash]);

  // Load data
  useEffect(() => {
    if (childId) {
      loadChildData();
    }
  }, [childId]);

  const loadChildData = async () => {
    if (!childId) return;

    try {
      setLoading(true);

      // Load all data in parallel
      const [profileData, journeyData, activityData, achievementsData, goalsData] =
        await Promise.all([
          getChildProfile(childId),
          getLearningJourney(childId),
          getActivity(childId),
          getAchievements(childId),
          getChildGoals(childId),
        ]);

      setProfile(profileData);
      setJourney(journeyData);
      setActivity(activityData);
      setAchievements(achievementsData);
      setGoals(goalsData);
    } catch (error) {
      console.error('Failed to load child data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    navigate(`#${tab}`, { replace: true });
  };

  const tabs = [
    { id: 'learning', label: 'Learning Journey', icon: BookOpen },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'goals', label: 'Goals', icon: Target },
  ];

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E40000]" />
        </div>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-white/60">Child not found</p>
          <button
            onClick={() => navigate('/dashboard/parent/children')}
            className="mt-4 px-6 py-2 bg-[#E40000] text-gray-900 dark:text-white rounded-lg hover:bg-[#FF0000] transition-colors"
          >
            Back to Children
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard/parent/children')}
          className="flex items-center gap-2 text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Children</span>
        </button>

        {/* Child Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-gradient-to-r from-[#E40000]/20 to-transparent border border-gray-200 dark:border-[#22272B] rounded-2xl p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#E40000] to-[#FF0000] flex items-center justify-center text-gray-900 dark:text-white text-3xl font-semibold">
                  {profile.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {profile.full_name}
                  </h1>
                  <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-white/60">
                    <span>{profile.grade_level}</span>
                    <span>•</span>
                    <span>{profile.admission_number}</span>
                    {profile.learning_style && (
                      <>
                        <span>•</span>
                        <span className="capitalize">{profile.learning_style} learner</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="hidden md:flex gap-4">
                <div className="text-center">
                  <div className="flex items-center gap-1 justify-center mb-1">
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {profile.average_grade ? `${profile.average_grade.toFixed(0)}%` : 'N/A'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-white/60">Average</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1 justify-center mb-1">
                    <Zap className="w-4 h-4 text-orange-500" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {profile.current_streak_days}d
                  </p>
                  <p className="text-xs text-gray-500 dark:text-white/60">Streak</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1 justify-center mb-1">
                    <Clock className="w-4 h-4 text-purple-500" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {(profile.total_learning_hours ?? 0).toFixed(0)}h
                  </p>
                  <p className="text-xs text-gray-500 dark:text-white/60">Total</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl overflow-hidden">
          <div className="border-b border-gray-200 dark:border-[#22272B]">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'text-[#E40000] border-b-2 border-[#E40000]'
                        : 'text-gray-500 dark:text-white/60 hover:text-gray-700 dark:hover:text-white/80'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Learning Journey Tab */}
            {activeTab === 'learning' && journey && (
              <motion.div
                key="learning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* Weekly Narrative */}
                {journey.weekly_narrative && (
                  <div className="bg-gray-100 dark:bg-[#22272B] rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">This Week</h3>
                    <p className="text-gray-700 dark:text-white/80 mb-4">{journey.weekly_narrative.summary}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Highlights</h4>
                        <ul className="space-y-1">
                          {(journey.weekly_narrative.highlights ?? []).map((h: string, i: number) => (
                            <li key={i} className="text-sm text-gray-600 dark:text-white/70 flex items-start gap-2">
                              <span className="text-green-500">✓</span>
                              <span>{h}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Growth Areas</h4>
                        <ul className="space-y-1">
                          {(journey.weekly_narrative.areas_of_growth ?? []).map((g: string, i: number) => (
                            <li key={i} className="text-sm text-gray-600 dark:text-white/70 flex items-start gap-2">
                              <span className="text-blue-500">→</span>
                              <span>{g}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Recommendations</h4>
                        <ul className="space-y-1">
                          {(journey.weekly_narrative.recommendations ?? []).map((r: string, i: number) => (
                            <li key={i} className="text-sm text-gray-600 dark:text-white/70 flex items-start gap-2">
                              <span className="text-yellow-500">★</span>
                              <span>{r}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* CBC Competencies Radar */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">CBC Competencies</h3>
                  <CBCRadarChart competencies={journey.cbc_competencies ?? []} showLegend={true} />
                </div>

                {/* Current Focus Areas */}
                {journey.current_focus_areas.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Current Focus</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {journey.current_focus_areas.map((area, i) => (
                        <div key={i} className="bg-gray-100 dark:bg-[#22272B] rounded-lg p-4">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{area.subject}</h4>
                          <p className="text-xs text-gray-600 dark:text-white/70 mb-3">{area.topic}</p>
                          <div className="w-full bg-white dark:bg-[#181C1F] rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-[#E40000] to-[#FF0000] h-2 rounded-full"
                              style={{ width: `${area.progress_percentage}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 dark:text-white/60 mt-1">
                            {area.progress_percentage.toFixed(0)}% complete
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && activity && (
              <motion.div
                key="activity"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <ActivityTimeline dailyActivity={activity.daily_activity} />
              </motion.div>
            )}

            {/* Achievements Tab */}
            {activeTab === 'achievements' && achievements && (
              <motion.div
                key="achievements"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* Certificates */}
                {achievements.certificates.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Certificates ({achievements.total_certificates})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {achievements.certificates.map((cert) => (
                        <div
                          key={cert.id}
                          className="bg-gray-100 dark:bg-[#22272B] rounded-lg p-4 hover:bg-[#2A2E33] transition-colors cursor-pointer"
                          onClick={() => window.open(cert.certificate_url, '_blank')}
                        >
                          {cert.thumbnail_url && (
                            <img
                              src={cert.thumbnail_url}
                              alt={cert.title}
                              className="w-full h-32 object-cover rounded-lg mb-3"
                            />
                          )}
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{cert.title}</h4>
                          <p className="text-xs text-gray-500 dark:text-white/60 mb-2">{cert.description}</p>
                          {cert.course_name && (
                            <p className="text-xs text-[#E40000]">{cert.course_name}</p>
                          )}
                          <p className="text-xs text-gray-400 dark:text-white/40 mt-2">
                            {new Date(cert.issued_date || cert.earned_date || '').toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Badges */}
                {achievements.badges.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Badges ({achievements.total_badges})
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                      {achievements.badges.map((badge) => (
                        <div
                          key={badge.id}
                          className="bg-gray-100 dark:bg-[#22272B] rounded-lg p-4 text-center"
                        >
                          <div className="w-16 h-16 mx-auto mb-2">
                            <img
                              src={badge.icon_url}
                              alt={badge.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-1">{badge.name}</h4>
                          <p className="text-xs text-gray-400 dark:text-white/40">
                            {new Date(badge.earned_date).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {achievements.certificates.length === 0 && achievements.badges.length === 0 && (
                  <div className="text-center py-12">
                    <Award className="w-16 h-16 text-gray-400 dark:text-gray-300 dark:text-white/20 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-white/60">No achievements yet</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Goals Tab */}
            {activeTab === 'goals' && goals && (
              <motion.div
                key="goals"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <GoalManager
                  goals={goals.goals}
                  childId={childId}
                  onGoalsChange={loadChildData}
                />
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ChildDetailPage;
