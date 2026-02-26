import React from 'react';
import { motion } from 'framer-motion';
import {
  Handshake,
  Users,
  DollarSign,
  BarChart3,
  FileText,
  MessageCircle,
  LifeBuoy,
  Settings,
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

const quickLinks = [
  {
    title: 'View Programs',
    description: 'Browse and manage your active sponsorship programs and partnerships.',
    icon: Handshake,
    route: '/dashboard/partner/sponsorships',
  },
  {
    title: 'Sponsored Children',
    description: 'View profiles and progress of all children under your sponsorship.',
    icon: Users,
    route: '/dashboard/partner/children/overview',
  },
  {
    title: 'Funding Overview',
    description: 'Track disbursements, balances, and funding allocation details.',
    icon: DollarSign,
    route: '/dashboard/partner/finance/funding',
  },
  {
    title: 'Analytics',
    description: 'Explore ROI metrics, trends, and performance analytics.',
    icon: BarChart3,
    route: '/dashboard/partner/analytics/roi',
  },
  {
    title: 'Impact Reports',
    description: 'Access detailed impact reports and downloadable summaries.',
    icon: FileText,
    route: '/dashboard/partner/impact-reports',
  },
  {
    title: 'Collaboration',
    description: 'Communicate with school staff, instructors, and other partners.',
    icon: MessageCircle,
    route: '/dashboard/partner/collaboration',
  },
  {
    title: 'Support Tickets',
    description: 'Submit and track support requests or escalation tickets.',
    icon: LifeBuoy,
    route: '/dashboard/partner/support/tickets',
  },
  {
    title: 'Profile Settings',
    description: 'Update your organization profile, preferences, and account settings.',
    icon: Settings,
    route: '/dashboard/partner/profile',
  },
];

const QuickLinksPage: React.FC = () => {
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quick Links</h1>
          <p className="text-gray-400 mt-1">
            Access key areas of your partner dashboard
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <motion.div
                key={link.title}
                variants={fadeUp}
                onClick={() => navigate(link.route)}
                className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5 cursor-pointer
                  transition-all duration-200 hover:scale-[1.03] hover:border-red-500 group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-red-500/10 text-red-400 group-hover:bg-red-500/20 transition-colors">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-gray-900 dark:text-white font-semibold text-sm">
                    {link.title}
                  </h3>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed">
                  {link.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default QuickLinksPage;
