import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  BookOpen,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  Headphones,
  ArrowRight,
  FileText,
  Mail,
  Phone,
  ExternalLink,
  Rocket,
} from 'lucide-react';

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface HelpCategory {
  id: string;
  title: string;
  description: string;
  articleCount: number;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
}

interface PopularArticle {
  id: string;
  title: string;
  description: string;
  category: string;
}

const SupportResourcesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const categories: HelpCategory[] = [
    {
      id: '1',
      title: 'Getting Started',
      description: 'Setup guides, onboarding tutorials, and first steps for new partners.',
      articleCount: 12,
      icon: Rocket,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/10',
    },
    {
      id: '2',
      title: 'Sponsorship Management',
      description: 'Learn how to create, manage, and monitor your sponsorship programs.',
      articleCount: 18,
      icon: Users,
      iconColor: 'text-green-400',
      iconBg: 'bg-green-500/10',
    },
    {
      id: '3',
      title: 'Billing & Finance',
      description: 'Payment methods, invoices, receipts, and subscription management.',
      articleCount: 9,
      icon: CreditCard,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/10',
    },
    {
      id: '4',
      title: 'Reports & Analytics',
      description: 'Understanding dashboards, generating reports, and data exports.',
      articleCount: 14,
      icon: BarChart3,
      iconColor: 'text-orange-400',
      iconBg: 'bg-orange-500/10',
    },
    {
      id: '5',
      title: 'Account Settings',
      description: 'Profile management, security settings, notifications, and preferences.',
      articleCount: 7,
      icon: Settings,
      iconColor: 'text-cyan-400',
      iconBg: 'bg-cyan-500/10',
    },
    {
      id: '6',
      title: 'Technical Support',
      description: 'Troubleshooting, integrations, API access, and technical documentation.',
      articleCount: 11,
      icon: Headphones,
      iconColor: 'text-red-400',
      iconBg: 'bg-red-500/10',
    },
  ];

  const popularArticles: PopularArticle[] = [
    {
      id: '1',
      title: 'How to Create Your First Sponsorship Program',
      description: 'Step-by-step guide to setting up a sponsorship program, adding children, and configuring funding.',
      category: 'Getting Started',
    },
    {
      id: '2',
      title: 'Understanding Your Impact Dashboard',
      description: 'A detailed walkthrough of all dashboard metrics, charts, and what they mean for your programs.',
      category: 'Reports & Analytics',
    },
    {
      id: '3',
      title: 'Setting Up Recurring Payments via M-Pesa',
      description: 'Configure automatic monthly payments using M-Pesa for seamless sponsorship funding.',
      category: 'Billing & Finance',
    },
    {
      id: '4',
      title: 'Monitoring Student Progress and Engagement',
      description: 'Learn how to track individual student performance and engagement through AI-powered insights.',
      category: 'Sponsorship Management',
    },
    {
      id: '5',
      title: 'Exporting Reports for Stakeholders',
      description: 'Generate and export PDF and CSV reports to share with your organization\'s stakeholders.',
      category: 'Reports & Analytics',
    },
  ];

  const filteredCategories = categories.filter((cat) =>
    cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredArticles = popularArticles.filter((article) =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Help & Resources</h1>
          <p className="text-gray-500 dark:text-white/60">Find answers, guides, and support for your partnership</p>
        </motion.div>

        {/* Search */}
        <motion.div variants={fadeUp}>
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-white/40" />
            <input
              type="text"
              placeholder="Search help topics, articles, and guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl text-sm text-gray-900 dark:text-white placeholder-white/30 focus:outline-none focus:border-[#E40000]/50"
            />
          </div>
        </motion.div>

        {/* Categories Grid */}
        <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((category) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.id}
                variants={fadeUp}
                whileHover={{ scale: 1.01 }}
                className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6 hover:border-[#E40000]/30 transition-colors cursor-pointer group"
              >
                <div className={`p-3 rounded-lg ${category.iconBg} w-fit mb-4`}>
                  <Icon className={`w-6 h-6 ${category.iconColor}`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{category.title}</h3>
                <p className="text-sm text-gray-500 dark:text-white/60 mb-4 leading-relaxed">{category.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 dark:text-white/40">{category.articleCount} articles</span>
                  <span className="flex items-center gap-1 text-xs font-medium text-red-400 group-hover:text-red-300 transition-colors">
                    Browse
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Popular Articles */}
        <motion.div variants={fadeUp}>
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="w-5 h-5 text-red-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Popular Articles</h2>
            </div>
            <div className="space-y-4">
              {filteredArticles.map((article) => (
                <div
                  key={article.id}
                  className="flex items-start gap-4 p-4 bg-gray-100 dark:bg-[#22272B]/50 border border-gray-200 dark:border-[#2A2F34] rounded-lg hover:bg-gray-100 dark:hover:bg-[#22272B] transition-colors cursor-pointer group"
                >
                  <div className="p-2 rounded-lg bg-red-500/10 mt-0.5">
                    <FileText className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-red-400 transition-colors">
                        {article.title}
                      </h3>
                      <span className="px-2 py-0.5 bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-white/40 text-xs rounded-full">
                        {article.category}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-white/60 leading-relaxed">{article.description}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 dark:text-white/20 group-hover:text-red-400 transition-colors mt-1" />
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Contact Support */}
        <motion.div variants={fadeUp}>
          <div className="bg-gradient-to-br from-white dark:from-[#181C1F] to-[#1a1f24] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-red-500/10">
                <Headphones className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Need More Help?</h2>
                <p className="text-sm text-gray-500 dark:text-white/60">Our support team is available Monday-Friday, 8am-6pm EAT</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-3 p-4 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg">
                <Mail className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-xs text-gray-400 dark:text-white/40 mb-0.5">Email Support</p>
                  <p className="text-sm text-gray-900 dark:text-white font-medium">partners@urbanhomeschool.co.ke</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg">
                <Phone className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-xs text-gray-400 dark:text-white/40 mb-0.5">Phone Support</p>
                  <p className="text-sm text-gray-900 dark:text-white font-medium">+254 700 123 456</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SupportResourcesPage;
