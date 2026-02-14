/**
 * Achievements Page
 *
 * Displays certificates, badges, and growth milestones for the selected
 * child. Shows achievement stats at the top, followed by categorized
 * grids for each achievement type.
 *
 * Route: /dashboard/parent/achievements
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Award, Trophy, Users, RefreshCw, Medal, Star,
  Calendar, ExternalLink,
} from 'lucide-react';
import { useParentStore } from '../../store/parentStore';
import { getAchievements } from '../../services/parentChildrenService';
import type { AchievementsResponse } from '../../types/parent';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const AchievementsPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedChildId, children } = useParentStore();

  const [achievements, setAchievements] = useState<AchievementsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const selectedChild = children.find((c) => c.student_id === selectedChildId);

  useEffect(() => {
    if (selectedChildId) {
      loadAchievements();
    } else {
      setLoading(false);
    }
  }, [selectedChildId]);

  const loadAchievements = async () => {
    if (!selectedChildId) return;

    try {
      setLoading(true);
      const data = await getAchievements(selectedChildId);
      setAchievements(data);
    } catch (error) {
      console.error('Failed to load achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E40000]" />
        </div>
      </>
    );
  }

  if (!selectedChildId) {
    return (
      <>
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 dark:text-white/30 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-white/60 mb-2">Select a child to view achievements</p>
          <p className="text-sm text-gray-400 dark:text-white/40 mb-4">Use the child selector in the sidebar</p>
          <button
            onClick={() => navigate('/dashboard/parent/children')}
            className="px-6 py-2 bg-[#E40000] text-gray-900 dark:text-white rounded-lg hover:bg-[#FF0000] transition-colors"
          >
            View Children
          </button>
        </div>
      </>
    );
  }

  const certificates = achievements?.certificates || [];
  const badges = achievements?.badges || [];
  const milestones = achievements?.milestones || [];
  const totalCertificates = achievements?.total_certificates || certificates.length;
  const totalBadges = achievements?.total_badges || badges.length;
  const totalMilestones = milestones.length;

  const hasAnyAchievements = certificates.length > 0 || badges.length > 0 || milestones.length > 0;

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#E40000] to-[#FF0000] rounded-xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-gray-900 dark:text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Achievements & Milestones</h1>
                {selectedChild && (
                  <p className="text-gray-500 dark:text-white/60 mt-1">{selectedChild.full_name}</p>
                )}
              </div>
            </div>
            <button
              onClick={loadAchievements}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] text-gray-700 dark:text-white/80 text-sm rounded-lg hover:bg-[#2A2E33] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </motion.div>

        {/* Achievement Stats */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <motion.div
            variants={fadeUp}
            className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-yellow-500" />
              </div>
              <span className="text-sm text-gray-500 dark:text-white/60">Certificates</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalCertificates}</p>
            <p className="text-xs text-gray-400 dark:text-white/40 mt-1">Earned</p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Medal className="w-5 h-5 text-purple-500" />
              </div>
              <span className="text-sm text-gray-500 dark:text-white/60">Badges</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalBadges}</p>
            <p className="text-xs text-gray-400 dark:text-white/40 mt-1">Collected</p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-sm text-gray-500 dark:text-white/60">Milestones</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalMilestones}</p>
            <p className="text-xs text-gray-400 dark:text-white/40 mt-1">Reached</p>
          </motion.div>
        </motion.div>

        {/* Certificates Grid */}
        {certificates.length > 0 && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Certificates ({totalCertificates})
            </h2>
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {certificates.map((cert) => (
                <motion.div
                  key={cert.id}
                  variants={fadeUp}
                  className="bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] rounded-xl overflow-hidden hover:border-[#E40000]/30 transition-colors group"
                >
                  {/* Thumbnail */}
                  {cert.thumbnail_url ? (
                    <img
                      src={cert.thumbnail_url}
                      alt={cert.title}
                      className="w-full h-36 object-cover"
                    />
                  ) : (
                    <div className="w-full h-36 bg-gradient-to-br from-[#E40000]/20 to-gray-100 dark:to-[#181C1F] flex items-center justify-center">
                      <Award className="w-12 h-12 text-[#E40000]/40" />
                    </div>
                  )}

                  <div className="p-4">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{cert.title}</h4>
                    {cert.description && (
                      <p className="text-xs text-gray-500 dark:text-white/60 mb-2 line-clamp-2">{cert.description}</p>
                    )}
                    {cert.course_name && (
                      <p className="text-xs text-[#E40000] mb-2">{cert.course_name}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400 dark:text-white/40 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(cert.earned_date || cert.issued_date || '').toLocaleDateString()}
                      </span>
                      {cert.certificate_url && (
                        <button
                          onClick={() => window.open(cert.certificate_url, '_blank')}
                          className="text-xs text-[#E40000] hover:text-[#FF0000] flex items-center gap-1 transition-colors"
                        >
                          View
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* Badges Grid */}
        {badges.length > 0 && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Badges ({totalBadges})
            </h2>
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4"
            >
              {badges.map((badge) => (
                <motion.div
                  key={badge.id}
                  variants={fadeUp}
                  className="bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] rounded-xl p-4 text-center hover:border-[#E40000]/30 transition-colors"
                >
                  {badge.icon_url ? (
                    <div className="w-16 h-16 mx-auto mb-2">
                      <img
                        src={badge.icon_url}
                        alt={badge.name || badge.title}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 mx-auto mb-2 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-full flex items-center justify-center">
                      <Medal className="w-8 h-8 text-yellow-500" />
                    </div>
                  )}
                  <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-1">
                    {badge.name || badge.title}
                  </h4>
                  <p className="text-xs text-gray-400 dark:text-white/40">
                    {new Date(badge.earned_date).toLocaleDateString()}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* Growth Milestones Timeline */}
        {milestones.length > 0 && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Growth Milestones</h2>
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
              <div className="space-y-6">
                {milestones.map((milestone, i) => (
                  <div key={milestone.id || i} className="flex items-start gap-4">
                    {/* Timeline dot and line */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className="w-3 h-3 bg-[#E40000] rounded-full" />
                      {i < milestones.length - 1 && (
                        <div className="w-px h-full min-h-[40px] bg-gray-100 dark:bg-[#22272B] mt-1" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-2">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                          {milestone.title}
                        </h4>
                        <span className="text-xs text-gray-400 dark:text-white/40 flex-shrink-0">
                          {new Date(milestone.earned_date).toLocaleDateString()}
                        </span>
                      </div>
                      {milestone.description && (
                        <p className="text-xs text-gray-500 dark:text-white/60">{milestone.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!hasAnyAchievements && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-12 text-center">
              <Trophy className="w-16 h-16 text-gray-400 dark:text-gray-300 dark:text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No achievements yet. Keep learning!
              </h3>
              <p className="text-gray-500 dark:text-white/60 text-sm">
                Certificates, badges, and milestones will appear here as your child progresses through their courses.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default AchievementsPage;
