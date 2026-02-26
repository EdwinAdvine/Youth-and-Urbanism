import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  PlayCircle,
  Clock,
  Calendar,
  Video,
} from 'lucide-react';

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

type WebinarCategory = 'onboarding' | 'best-practices' | 'platform-updates' | 'partner-success';

interface Webinar {
  id: string;
  title: string;
  duration: string;
  category: WebinarCategory;
  description: string;
  publishedDate: string;
  gradientFrom: string;
  gradientTo: string;
}

const WebinarsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const webinars: Webinar[] = [
    {
      id: '1',
      title: 'Getting Started: Your First 30 Days as a Partner',
      duration: '45 min',
      category: 'onboarding',
      description: 'A comprehensive walkthrough of the partner dashboard, setting up your first sponsorship program, and understanding key metrics.',
      publishedDate: 'Jan 15, 2026',
      gradientFrom: 'from-blue-600',
      gradientTo: 'to-cyan-500',
    },
    {
      id: '2',
      title: 'Maximizing Student Engagement Through Sponsorship',
      duration: '32 min',
      category: 'best-practices',
      description: 'Learn proven strategies for keeping sponsored students engaged and motivated throughout their educational journey.',
      publishedDate: 'Jan 28, 2026',
      gradientFrom: 'from-green-600',
      gradientTo: 'to-emerald-500',
    },
    {
      id: '3',
      title: 'Platform Update: February 2026 Features',
      duration: '20 min',
      category: 'platform-updates',
      description: 'Overview of new features including AI-powered insights, enhanced reporting, and improved child progress tracking.',
      publishedDate: 'Feb 5, 2026',
      gradientFrom: 'from-purple-600',
      gradientTo: 'to-violet-500',
    },
    {
      id: '4',
      title: 'Partner Spotlight: How Safaricom Foundation Scales Impact',
      duration: '38 min',
      category: 'partner-success',
      description: 'Case study featuring Safaricom Foundation\'s approach to managing 500+ sponsored students across 12 programs.',
      publishedDate: 'Feb 1, 2026',
      gradientFrom: 'from-orange-600',
      gradientTo: 'to-amber-500',
    },
    {
      id: '5',
      title: 'Understanding AI Analytics and Student Reports',
      duration: '28 min',
      category: 'best-practices',
      description: 'Deep dive into interpreting AI-generated student insights, learning style analysis, and actionable recommendations.',
      publishedDate: 'Jan 20, 2026',
      gradientFrom: 'from-red-600',
      gradientTo: 'to-rose-500',
    },
    {
      id: '6',
      title: 'Onboarding New Students to Your Programs',
      duration: '25 min',
      category: 'onboarding',
      description: 'Best practices for the student enrollment process, parent consent workflows, and initial assessment setup.',
      publishedDate: 'Feb 10, 2026',
      gradientFrom: 'from-teal-600',
      gradientTo: 'to-cyan-500',
    },
  ];

  const getCategoryBadge = (category: WebinarCategory) => {
    const config: Record<WebinarCategory, { label: string; bg: string; text: string }> = {
      onboarding: { label: 'Onboarding', bg: 'bg-blue-500/10', text: 'text-blue-400' },
      'best-practices': { label: 'Best Practices', bg: 'bg-green-500/10', text: 'text-green-400' },
      'platform-updates': { label: 'Platform Updates', bg: 'bg-purple-500/10', text: 'text-purple-400' },
      'partner-success': { label: 'Partner Success', bg: 'bg-orange-500/10', text: 'text-orange-400' },
    };
    const c = config[category];
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
        {c.label}
      </span>
    );
  };

  const filteredWebinars = webinars.filter((webinar) => {
    const matchesSearch =
      webinar.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      webinar.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || webinar.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

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
              <Video className="w-6 h-6 text-red-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">On-Demand Webinars</h1>
          </div>
          <p className="text-gray-500 dark:text-white/60">Watch tutorials, best practices, and partner success stories at your own pace</p>
        </motion.div>

        {/* Filters */}
        <motion.div variants={fadeUp}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40" />
              <input
                type="text"
                placeholder="Search webinars..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl text-sm text-gray-900 dark:text-white placeholder-white/30 focus:outline-none focus:border-[#E40000]/50"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400 dark:text-white/40" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2.5 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#E40000]/50"
              >
                <option value="all">All Categories</option>
                <option value="onboarding">Onboarding</option>
                <option value="best-practices">Best Practices</option>
                <option value="platform-updates">Platform Updates</option>
                <option value="partner-success">Partner Success</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Webinar Grid */}
        <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWebinars.map((webinar) => (
            <motion.div
              key={webinar.id}
              variants={fadeUp}
              whileHover={{ scale: 1.02 }}
              className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl overflow-hidden hover:border-[#E40000]/30 transition-colors group"
            >
              {/* Thumbnail Placeholder */}
              <div className={`relative h-40 bg-gradient-to-br ${webinar.gradientFrom} ${webinar.gradientTo} flex items-center justify-center`}>
                <div className="absolute inset-0 bg-black/20" />
                <div className="relative z-10 p-4 rounded-full bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                  <PlayCircle className="w-10 h-10 text-gray-900 dark:text-white" />
                </div>
                <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/50 backdrop-blur-sm rounded text-xs text-gray-900 dark:text-white">
                  <Clock className="w-3 h-3" />
                  {webinar.duration}
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  {getCategoryBadge(webinar.category)}
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">{webinar.title}</h3>
                <p className="text-sm text-gray-500 dark:text-white/60 mb-4 line-clamp-2 leading-relaxed">{webinar.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-white/40">
                    <Calendar className="w-3.5 h-3.5" />
                    {webinar.publishedDate}
                  </div>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E40000]/20 text-[#E40000] rounded-lg hover:bg-[#E40000]/30 transition-colors text-xs font-medium">
                    <PlayCircle className="w-3.5 h-3.5" />
                    Watch Now
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filteredWebinars.length === 0 && (
          <motion.div variants={fadeUp}>
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-12 text-center">
              <Video className="w-12 h-12 text-gray-400 dark:text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No webinars found</h3>
              <p className="text-sm text-gray-500 dark:text-white/60">Try adjusting your filters or search query</p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default WebinarsPage;
