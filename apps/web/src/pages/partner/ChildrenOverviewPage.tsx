import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Users,
  TrendingUp,
  AlertTriangle,
  Target,
  Eye,
  ChevronRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface ChildOverview {
  id: string;
  name: string;
  initials: string;
  color: string;
  grade: string;
  program: string;
  status: 'excellent' | 'good' | 'needs-support';
  progress: number;
}

const ChildrenOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [programFilter, setProgramFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [gradeFilter, setGradeFilter] = useState<string>('all');

  const children: ChildOverview[] = [
    {
      id: '1',
      name: 'Sarah Mwangi',
      initials: 'SM',
      color: 'from-red-500 to-orange-500',
      grade: 'Grade 8',
      program: 'STEM Excellence',
      status: 'excellent',
      progress: 95,
    },
    {
      id: '2',
      name: 'James Omondi',
      initials: 'JO',
      color: 'from-blue-500 to-cyan-500',
      grade: 'Grade 2',
      program: 'Early Childhood',
      status: 'good',
      progress: 78,
    },
    {
      id: '3',
      name: 'Grace Kamau',
      initials: 'GK',
      color: 'from-purple-500 to-pink-500',
      grade: 'Grade 7',
      program: 'Girls in Tech',
      status: 'excellent',
      progress: 92,
    },
    {
      id: '4',
      name: 'David Kiprono',
      initials: 'DK',
      color: 'from-amber-500 to-yellow-500',
      grade: 'Grade 5',
      program: 'Sports & Arts',
      status: 'needs-support',
      progress: 58,
    },
    {
      id: '5',
      name: 'Lucy Wanjiru',
      initials: 'LW',
      color: 'from-green-500 to-emerald-500',
      grade: 'Grade 9',
      program: 'STEM Excellence',
      status: 'good',
      progress: 85,
    },
    {
      id: '6',
      name: 'Michael Otieno',
      initials: 'MO',
      color: 'from-teal-500 to-cyan-500',
      grade: 'Grade 4',
      program: 'Special Needs Support',
      status: 'good',
      progress: 72,
    },
  ];

  const stats = [
    {
      label: 'Total Children',
      value: '247',
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Excellent Progress',
      value: '156',
      icon: TrendingUp,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
    },
    {
      label: 'Needs Support',
      value: '18',
      icon: AlertTriangle,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
    },
    {
      label: 'Average Progress',
      value: '72%',
      icon: Target,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
    },
  ];

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      excellent: 'bg-green-500/20 text-green-400 border-green-500/30',
      good: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'needs-support': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    };
    const labels: Record<string, string> = {
      excellent: 'Excellent',
      good: 'Good',
      'needs-support': 'Needs Support',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const filteredChildren = children.filter((child) => {
    const matchesSearch = child.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProgram = programFilter === 'all' || child.program === programFilter;
    const matchesStatus = statusFilter === 'all' || child.status === statusFilter;
    const matchesGrade = gradeFilter === 'all' || child.grade === gradeFilter;
    return matchesSearch && matchesProgram && matchesStatus && matchesGrade;
  });

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F1112] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Sponsored Children Overview</h1>
          <p className="text-gray-600 dark:text-white/70">
            Monitor the progress and well-being of all children under your sponsorship programs
          </p>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={fadeUp}
              className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 dark:text-white/40 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            </motion.div>
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
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg text-sm text-gray-900 dark:text-white placeholder-white/30 focus:outline-none focus:border-red-500/50"
                />
              </div>
              <div className="flex items-center gap-3">
                <Filter className="w-4 h-4 text-gray-400 dark:text-white/40" />
                <select
                  value={programFilter}
                  onChange={(e) => setProgramFilter(e.target.value)}
                  className="px-4 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500/50"
                >
                  <option value="all">All Programs</option>
                  <option value="STEM Excellence">STEM Excellence</option>
                  <option value="Early Childhood">Early Childhood</option>
                  <option value="Girls in Tech">Girls in Tech</option>
                  <option value="Sports & Arts">Sports & Arts</option>
                  <option value="Special Needs Support">Special Needs</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500/50"
                >
                  <option value="all">All Status</option>
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="needs-support">Needs Support</option>
                </select>
                <select
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value)}
                  className="px-4 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500/50"
                >
                  <option value="all">All Grades</option>
                  <option value="Grade 2">Grade 2</option>
                  <option value="Grade 4">Grade 4</option>
                  <option value="Grade 5">Grade 5</option>
                  <option value="Grade 7">Grade 7</option>
                  <option value="Grade 8">Grade 8</option>
                  <option value="Grade 9">Grade 9</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Children Grid */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-4"
        >
          {filteredChildren.map((child) => (
            <motion.div
              key={child.id}
              variants={fadeUp}
              whileHover={{ scale: 1.01 }}
              className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6 hover:border-red-500/30 transition-colors cursor-pointer"
              onClick={() => navigate(`/dashboard/partner/sponsored-children/${child.id}`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${child.color} rounded-full flex items-center justify-center text-gray-900 dark:text-white font-bold text-sm`}
                  >
                    {child.initials}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{child.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600 dark:text-white/70">{child.grade}</span>
                      <span className="text-xs text-gray-400 dark:text-white/40">|</span>
                      <span className="text-xs text-gray-600 dark:text-white/70">{child.program}</span>
                    </div>
                  </div>
                </div>
                {getStatusBadge(child.status)}
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400 dark:text-white/40">Overall Progress</span>
                  <span className="text-xs text-gray-900 dark:text-white font-medium">{child.progress}%</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-[#22272B] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all duration-500"
                    style={{ width: `${child.progress}%` }}
                  />
                </div>
              </div>

              {/* View Details Link */}
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors text-sm font-medium">
                <Eye className="w-4 h-4" />
                View Details
                <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredChildren.length === 0 && (
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-12 text-center">
            <Users className="w-12 h-12 text-gray-400 dark:text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No children found</h3>
            <p className="text-sm text-gray-600 dark:text-white/70">
              Try adjusting your search or filters to find what you are looking for
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChildrenOverviewPage;
