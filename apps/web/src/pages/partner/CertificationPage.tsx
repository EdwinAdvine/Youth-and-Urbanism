import React from 'react';
import { motion } from 'framer-motion';
import {
  Award,
  Shield,
  Star,
  Crown,
  CheckCircle,
  Circle,
  ArrowRight,
  Trophy,
  Calendar,
  TrendingUp,
  Gem,
} from 'lucide-react';

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

type CertificationTier = 'bronze' | 'silver' | 'gold' | 'platinum';

interface Requirement {
  id: string;
  label: string;
  completed: boolean;
}

interface Certification {
  id: string;
  tier: CertificationTier;
  title: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  borderColor: string;
  requirements: Requirement[];
  benefits: string[];
}

interface EarnedCertificate {
  id: string;
  title: string;
  tier: CertificationTier;
  earnedDate: string;
}

const CertificationPage: React.FC = () => {
  const currentLevel = 'Bronze Partner';
  const progressToNext = 68;

  const currentRequirements: Requirement[] = [
    { id: '1', label: 'Complete partner onboarding', completed: true },
    { id: '2', label: 'Sponsor at least 10 students', completed: true },
    { id: '3', label: 'Maintain active status for 3 months', completed: true },
    { id: '4', label: 'Submit first impact report', completed: true },
    { id: '5', label: 'Achieve 80% student engagement rate', completed: false },
    { id: '6', label: 'Complete partner training modules', completed: false },
  ];

  const certifications: Certification[] = [
    {
      id: 'silver',
      tier: 'silver',
      title: 'Silver Partner',
      icon: Shield,
      iconColor: 'text-gray-400 dark:text-gray-300',
      iconBg: 'bg-gray-500/10',
      borderColor: 'border-gray-500/30',
      requirements: [
        { id: '1', label: 'Sponsor 25+ students', completed: true },
        { id: '2', label: '6 months active partnership', completed: true },
        { id: '3', label: '85% student engagement rate', completed: false },
        { id: '4', label: 'Complete advanced training', completed: false },
        { id: '5', label: 'Submit quarterly impact reports', completed: true },
      ],
      benefits: [
        'Priority support response',
        'Quarterly impact briefings',
        'Partner badge on profile',
        'Access to advanced analytics',
      ],
    },
    {
      id: 'gold',
      tier: 'gold',
      title: 'Gold Partner',
      icon: Star,
      iconColor: 'text-yellow-400',
      iconBg: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30',
      requirements: [
        { id: '1', label: 'Sponsor 100+ students', completed: false },
        { id: '2', label: '12 months active partnership', completed: false },
        { id: '3', label: '90% student engagement rate', completed: false },
        { id: '4', label: 'Achieve Silver certification', completed: false },
        { id: '5', label: 'Participate in 2 partner events', completed: false },
      ],
      benefits: [
        'Dedicated account manager',
        'Custom reporting dashboards',
        'Early access to new features',
        'Featured in partner directory',
        'Invitation to annual summit',
      ],
    },
    {
      id: 'platinum',
      tier: 'platinum',
      title: 'Platinum Partner',
      icon: Crown,
      iconColor: 'text-cyan-400',
      iconBg: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/30',
      requirements: [
        { id: '1', label: 'Sponsor 500+ students', completed: false },
        { id: '2', label: '24 months active partnership', completed: false },
        { id: '3', label: '95% student engagement rate', completed: false },
        { id: '4', label: 'Achieve Gold certification', completed: false },
        { id: '5', label: 'Contribute to platform development', completed: false },
        { id: '6', label: 'Mentor 3+ new partners', completed: false },
      ],
      benefits: [
        'Executive partnership team',
        'Co-branded programs',
        'API integration access',
        'Board advisory opportunity',
        'Global impact showcase',
        'Custom program development',
      ],
    },
  ];

  const earnedCertificates: EarnedCertificate[] = [
    {
      id: '1',
      title: 'Bronze Partner Certification',
      tier: 'bronze',
      earnedDate: 'December 15, 2025',
    },
  ];

  const getTierIcon = (tier: CertificationTier) => {
    const config: Record<CertificationTier, { icon: React.ElementType; color: string }> = {
      bronze: { icon: Award, color: 'text-orange-400' },
      silver: { icon: Shield, color: 'text-gray-400 dark:text-gray-300' },
      gold: { icon: Star, color: 'text-yellow-400' },
      platinum: { icon: Crown, color: 'text-cyan-400' },
    };
    return config[tier];
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F1112] p-6">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <motion.div variants={fadeUp}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-red-500/10">
              <Trophy className="w-6 h-6 text-red-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Certification Program</h1>
          </div>
          <p className="text-gray-500 dark:text-white/60">Advance your partnership tier and unlock exclusive benefits</p>
        </motion.div>

        {/* Current Progress */}
        <motion.div variants={fadeUp}>
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-orange-500/10">
                  <Award className="w-8 h-8 text-orange-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{currentLevel}</h2>
                  <p className="text-sm text-gray-500 dark:text-white/60">Your current certification level</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-400 font-medium">{progressToNext}% to Silver</span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400 dark:text-white/40">Progress to Silver Partner</span>
                <span className="text-xs text-gray-500 dark:text-white/60 font-medium">{progressToNext}%</span>
              </div>
              <div className="w-full h-3 bg-gray-100 dark:bg-[#22272B] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-700"
                  style={{ width: `${progressToNext}%` }}
                />
              </div>
            </div>

            {/* Requirements Checklist */}
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Requirements for Next Level</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentRequirements.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-[#22272B]/50 border border-gray-200 dark:border-[#2A2F34] rounded-lg"
                >
                  {req.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400 dark:text-white/20 flex-shrink-0" />
                  )}
                  <span className={`text-sm ${req.completed ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-white/50'}`}>
                    {req.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Available Certifications */}
        <motion.div variants={fadeUp}>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Available Certifications</h2>
        </motion.div>

        <motion.div variants={stagger} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {certifications.map((cert) => {
            const Icon = cert.icon;
            const completedCount = cert.requirements.filter((r) => r.completed).length;
            const totalCount = cert.requirements.length;

            return (
              <motion.div
                key={cert.id}
                variants={fadeUp}
                className={`bg-white dark:bg-[#181C1F] border ${cert.borderColor} rounded-xl p-6 hover:border-opacity-60 transition-colors`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 rounded-xl ${cert.iconBg}`}>
                    <Icon className={`w-6 h-6 ${cert.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{cert.title}</h3>
                    <p className="text-xs text-gray-400 dark:text-white/40">{completedCount}/{totalCount} requirements met</p>
                  </div>
                </div>

                {/* Requirements */}
                <div className="mb-5">
                  <p className="text-xs text-gray-400 dark:text-white/40 mb-2 uppercase tracking-wider">Requirements</p>
                  <div className="space-y-2">
                    {cert.requirements.map((req) => (
                      <div key={req.id} className="flex items-center gap-2">
                        {req.completed ? (
                          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-400 dark:text-white/20 flex-shrink-0" />
                        )}
                        <span className={`text-xs ${req.completed ? 'text-gray-600 dark:text-white/70' : 'text-gray-400 dark:text-white/40'}`}>
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Benefits */}
                <div className="mb-5">
                  <p className="text-xs text-gray-400 dark:text-white/40 mb-2 uppercase tracking-wider">Benefits</p>
                  <div className="space-y-1.5">
                    {cert.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Gem className="w-3 h-3 text-red-400 flex-shrink-0" />
                        <span className="text-xs text-gray-500 dark:text-white/60">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-[#22272B] text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-[#2A2F34] transition-colors text-sm">
                  Learn More
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Earned Certificates */}
        <motion.div variants={fadeUp}>
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Earned Certificates</h2>
            {earnedCertificates.length > 0 ? (
              <div className="space-y-3">
                {earnedCertificates.map((cert) => {
                  const tierInfo = getTierIcon(cert.tier);
                  const TierIcon = tierInfo.icon;
                  return (
                    <div
                      key={cert.id}
                      className="flex items-center justify-between p-4 bg-gray-100 dark:bg-[#22272B]/50 border border-gray-200 dark:border-[#2A2F34] rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <TierIcon className={`w-6 h-6 ${tierInfo.color}`} />
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{cert.title}</h3>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Calendar className="w-3 h-3 text-gray-400 dark:text-white/40" />
                            <span className="text-xs text-gray-400 dark:text-white/40">Earned {cert.earnedDate}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="text-xs text-green-400 font-medium">Verified</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Award className="w-12 h-12 text-gray-400 dark:text-white/20 mx-auto mb-3" />
                <p className="text-sm text-gray-500 dark:text-white/60">No certificates earned yet. Start your certification journey above.</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default CertificationPage;
