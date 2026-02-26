import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Upload,
  FileText,
  Video,
  Image,
  Presentation,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Eye,
  Edit3,
  Download,
  FolderOpen,
} from 'lucide-react';

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface Resource {
  id: string;
  title: string;
  type: 'document' | 'video' | 'image' | 'presentation';
  status: 'approved' | 'pending' | 'draft';
  usageCount: number;
  uploadDate: string;
  fileSize: string;
}

const ResourceContributionsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const resources: Resource[] = [
    {
      id: '1',
      title: 'STEM Curriculum Guide 2026',
      type: 'document',
      status: 'approved',
      usageCount: 234,
      uploadDate: 'Feb 10, 2026',
      fileSize: '4.2 MB',
    },
    {
      id: '2',
      title: 'Introduction to Renewable Energy',
      type: 'video',
      status: 'approved',
      usageCount: 187,
      uploadDate: 'Feb 5, 2026',
      fileSize: '128 MB',
    },
    {
      id: '3',
      title: 'Math Worksheets - Grade 4',
      type: 'document',
      status: 'pending',
      usageCount: 0,
      uploadDate: 'Feb 12, 2026',
      fileSize: '2.1 MB',
    },
    {
      id: '4',
      title: 'Science Lab Infographics Pack',
      type: 'image',
      status: 'approved',
      usageCount: 156,
      uploadDate: 'Jan 28, 2026',
      fileSize: '18.5 MB',
    },
    {
      id: '5',
      title: 'Digital Literacy Training Deck',
      type: 'presentation',
      status: 'pending',
      usageCount: 0,
      uploadDate: 'Feb 13, 2026',
      fileSize: '9.7 MB',
    },
  ];

  const stats = [
    {
      label: 'Total Resources',
      value: '24',
      icon: FolderOpen,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Approved',
      value: '18',
      icon: CheckCircle,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
    },
    {
      label: 'Pending Review',
      value: '4',
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
    {
      label: 'Downloads',
      value: '1,234',
      icon: Download,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
  ];

  const getTypeIcon = (type: string) => {
    const icons = {
      document: FileText,
      video: Video,
      image: Image,
      presentation: Presentation,
    };
    return icons[type as keyof typeof icons] || FileText;
  };

  const getTypeBadge = (type: string) => {
    const styles = {
      document: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      video: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      image: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      presentation: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    };
    const TypeIcon = getTypeIcon(type);
    return (
      <span
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
          styles[type as keyof typeof styles]
        }`}
      >
        <TypeIcon className="w-3 h-3" />
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      approved: 'bg-green-500/20 text-green-400 border-green-500/30',
      pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      draft: 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white/50 border-gray-300 dark:border-white/20',
    };
    return (
      <span
        className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
          styles[status as keyof typeof styles]
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredResources = resources.filter((resource) => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || resource.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || resource.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F1112] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Resource Contributions</h1>
              <p className="text-gray-500 dark:text-white/60">Upload and manage your educational resources</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-[#E40000] text-gray-900 dark:text-white rounded-lg hover:bg-[#FF4444] transition-colors">
              <Upload className="w-5 h-5" />
              Upload Resource
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={fadeUp}
              className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</p>
              <p className="text-xs text-gray-500 dark:text-white/50">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex flex-col md:flex-row items-start md:items-center gap-3"
        >
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg text-sm text-gray-900 dark:text-white placeholder-white/30 focus:outline-none focus:border-red-500/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400 dark:text-white/40" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500/50"
            >
              <option value="all">All Types</option>
              <option value="document">Document</option>
              <option value="video">Video</option>
              <option value="image">Image</option>
              <option value="presentation">Presentation</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500/50"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </motion.div>

        {/* Resource Grid */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredResources.map((resource) => {
            const TypeIcon = getTypeIcon(resource.type);
            return (
              <motion.div
                key={resource.id}
                variants={fadeUp}
                className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl overflow-hidden hover:border-gray-200 dark:hover:border-[#2A2F34] transition-colors"
              >
                {/* Thumbnail Placeholder */}
                <div className="h-32 bg-gray-100 dark:bg-[#22272B] flex items-center justify-center">
                  <TypeIcon className="w-10 h-10 text-gray-400 dark:text-white/20" />
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white leading-tight flex-1 pr-2">
                      {resource.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    {getTypeBadge(resource.type)}
                    {getStatusBadge(resource.status)}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-400 dark:text-white/40 mb-4">
                    <span>{resource.usageCount} downloads</span>
                    <span>{resource.fileSize}</span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-[#22272B]">
                    <span className="text-xs text-gray-400 dark:text-white/40">{resource.uploadDate}</span>
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 text-gray-400 dark:text-white/40 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-gray-400 dark:text-white/40 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

export default ResourceContributionsPage;
