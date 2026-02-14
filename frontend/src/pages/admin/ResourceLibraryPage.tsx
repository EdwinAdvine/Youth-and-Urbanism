import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  FolderOpen,
  Clock,
  CheckCircle2,
  FileText,
  FileImage,
  FileVideo,
  File,
  Eye,
  Download,
  Trash2,
  MoreHorizontal,
  Plus,
  RefreshCw,
  BarChart3,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import AdminPageHeader from '../../components/admin/shared/AdminPageHeader';
import AdminStatsCard from '../../components/admin/shared/AdminStatsCard';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type TabKey = 'all' | 'moderation';
type ModerationStatus = 'approved' | 'pending' | 'rejected';
type FileType = 'pdf' | 'image' | 'video' | 'document' | 'audio' | 'other';

interface Resource {
  id: string;
  title: string;
  file_type: FileType;
  file_size: string;
  category: string;
  uploaded_by: string;
  moderation_status: ModerationStatus;
  usage_count: number;
  created_at: string;
}

/* ------------------------------------------------------------------ */
/* Mock data                                                           */
/* ------------------------------------------------------------------ */

const MOCK_RESOURCES: Resource[] = [
  { id: 'res1', title: 'CBC Grade 4 Mathematics Workbook', file_type: 'pdf', file_size: '4.2 MB', category: 'Workbooks', uploaded_by: 'David Ochieng', moderation_status: 'approved', usage_count: 342, created_at: '2025-11-20' },
  { id: 'res2', title: 'Kiswahili Vocabulary Flashcards Set', file_type: 'image', file_size: '12.8 MB', category: 'Flashcards', uploaded_by: 'Jane Wanjiku', moderation_status: 'approved', usage_count: 567, created_at: '2025-10-15' },
  { id: 'res3', title: 'Water Cycle Animation', file_type: 'video', file_size: '45.3 MB', category: 'Animations', uploaded_by: 'Mary Akinyi', moderation_status: 'approved', usage_count: 289, created_at: '2025-12-05' },
  { id: 'res4', title: 'Grade 7 Science Lab Manual', file_type: 'pdf', file_size: '8.1 MB', category: 'Lab Manuals', uploaded_by: 'Brian Wafula', moderation_status: 'pending', usage_count: 0, created_at: '2026-02-08' },
  { id: 'res5', title: 'Kenyan History Timeline Poster', file_type: 'image', file_size: '3.5 MB', category: 'Posters', uploaded_by: 'Michael Oduor', moderation_status: 'pending', usage_count: 0, created_at: '2026-02-10' },
  { id: 'res6', title: 'Multiplication Tables Song', file_type: 'audio', file_size: '5.7 MB', category: 'Audio Lessons', uploaded_by: 'Grace Otieno', moderation_status: 'approved', usage_count: 823, created_at: '2025-09-18' },
  { id: 'res7', title: 'Creative Writing Prompts Collection', file_type: 'document', file_size: '1.2 MB', category: 'Writing Resources', uploaded_by: 'Diana Chebet', moderation_status: 'approved', usage_count: 445, created_at: '2025-10-30' },
  { id: 'res8', title: 'CBC Assessment Guidelines 2026', file_type: 'pdf', file_size: '2.8 MB', category: 'Guidelines', uploaded_by: 'Admin', moderation_status: 'approved', usage_count: 156, created_at: '2026-01-03' },
  { id: 'res9', title: 'Physical Education Activity Cards', file_type: 'image', file_size: '18.4 MB', category: 'Activity Cards', uploaded_by: 'James Mwangi', moderation_status: 'pending', usage_count: 0, created_at: '2026-02-11' },
  { id: 'res10', title: 'Religious Education - Moral Stories', file_type: 'video', file_size: '67.2 MB', category: 'Video Lessons', uploaded_by: 'Grace Otieno', moderation_status: 'rejected', usage_count: 0, created_at: '2026-01-20' },
  { id: 'res11', title: 'Digital Literacy Cheat Sheet', file_type: 'pdf', file_size: '0.8 MB', category: 'Cheat Sheets', uploaded_by: 'Sarah Njeri', moderation_status: 'approved', usage_count: 678, created_at: '2025-08-25' },
  { id: 'res12', title: 'Agriculture & Nutrition Infographic', file_type: 'image', file_size: '2.1 MB', category: 'Infographics', uploaded_by: 'Francis Kiprop', moderation_status: 'pending', usage_count: 0, created_at: '2026-02-12' },
  { id: 'res13', title: 'Home Science Cooking Tutorial', file_type: 'video', file_size: '128.5 MB', category: 'Video Lessons', uploaded_by: 'Alice Wambui', moderation_status: 'approved', usage_count: 201, created_at: '2025-11-08' },
  { id: 'res14', title: 'Grade 1 Number Recognition Worksheet', file_type: 'pdf', file_size: '1.5 MB', category: 'Worksheets', uploaded_by: 'David Ochieng', moderation_status: 'approved', usage_count: 912, created_at: '2025-07-12' },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' });

const fileTypeIcons: Record<FileType, React.FC<{ className?: string }>> = {
  pdf: FileText,
  image: FileImage,
  video: FileVideo,
  document: File,
  audio: File,
  other: File,
};

const fileTypeBadgeStyles: Record<FileType, string> = {
  pdf: 'bg-red-500/20 text-red-400 border-red-500/30',
  image: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  video: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  document: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  audio: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  other: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

const moderationStyles: Record<ModerationStatus, string> = {
  approved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const FileTypeBadge: React.FC<{ type: FileType }> = ({ type }) => {
  const Icon = fileTypeIcons[type];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${fileTypeBadgeStyles[type]}`}>
      <Icon className="w-3 h-3" />
      {type.toUpperCase()}
    </span>
  );
};

const ModerationBadge: React.FC<{ status: ModerationStatus }> = ({ status }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${moderationStyles[status]}`}>
    {status}
  </span>
);

const TAB_CONFIG: { key: TabKey; label: string }[] = [
  { key: 'all', label: 'All Resources' },
  { key: 'moderation', label: 'Moderation Queue' },
];

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const ResourceLibraryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const totalResources = MOCK_RESOURCES.length;
  const pendingReview = MOCK_RESOURCES.filter((r) => r.moderation_status === 'pending').length;
  const approvedCount = MOCK_RESOURCES.filter((r) => r.moderation_status === 'approved').length;
  const categories = Array.from(new Set(MOCK_RESOURCES.map((r) => r.category)));

  const getFilteredResources = () => {
    let resources = MOCK_RESOURCES;
    if (activeTab === 'moderation') {
      resources = resources.filter((r) => r.moderation_status === 'pending');
    }
    if (search) {
      const q = search.toLowerCase();
      resources = resources.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.uploaded_by.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q)
      );
    }
    if (categoryFilter) {
      resources = resources.filter((r) => r.category === categoryFilter);
    }
    if (typeFilter) {
      resources = resources.filter((r) => r.file_type === typeFilter);
    }
    return resources;
  };

  const filteredResources = getFilteredResources();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <DashboardLayout role="admin">
      <motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <AdminPageHeader
          title="Resource Library"
          subtitle="Manage educational resources, files, and content moderation"
          breadcrumbs={[
            { label: 'Content & Learning', path: '/dashboard/admin' },
            { label: 'Resource Library' },
          ]}
          actions={
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-2 text-sm bg-[#22272B] border border-[#333] rounded-lg text-white/70 hover:text-white hover:border-[#444] transition-colors">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-sm bg-[#E40000] text-white rounded-lg hover:bg-[#C00] transition-colors">
                <Plus className="w-4 h-4" />
                Upload Resource
              </button>
            </div>
          }
        />

        {/* Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminStatsCard
            title="Total Resources"
            value={totalResources}
            icon={<FolderOpen className="w-5 h-5" />}
            trend={{ value: 22, label: 'vs last term', direction: 'up' }}
          />
          <AdminStatsCard
            title="Pending Review"
            value={pendingReview}
            icon={<Clock className="w-5 h-5" />}
            subtitle="Awaiting moderation approval"
          />
          <AdminStatsCard
            title="Approved"
            value={approvedCount}
            icon={<CheckCircle2 className="w-5 h-5" />}
            trend={{ value: 15, label: 'vs last month', direction: 'up' }}
          />
          <AdminStatsCard
            title="Categories"
            value={categories.length}
            icon={<BarChart3 className="w-5 h-5" />}
            subtitle="Resource categories in library"
          />
        </motion.div>

        {/* Tabs */}
        <motion.div variants={itemVariants} className="flex items-center gap-1 border-b border-[#22272B]">
          {TAB_CONFIG.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setSearch(''); setCategoryFilter(''); setTypeFilter(''); }}
              className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
                activeTab === tab.key
                  ? 'text-white'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              {tab.label}
              {tab.key === 'moderation' && pendingReview > 0 && (
                <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-[#E40000] text-white rounded-full">
                  {pendingReview}
                </span>
              )}
              {activeTab === tab.key && (
                <motion.div
                  layoutId="resources-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E40000]"
                />
              )}
            </button>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search by title, uploader, or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#181C1F] border border-[#22272B] rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#E40000]/50 transition-colors"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="pl-10 pr-8 py-2.5 bg-[#181C1F] border border-[#22272B] rounded-lg text-white text-sm appearance-none cursor-pointer focus:outline-none focus:border-[#E40000]/50 transition-colors min-w-[180px]"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2.5 bg-[#181C1F] border border-[#22272B] rounded-lg text-white text-sm appearance-none cursor-pointer focus:outline-none focus:border-[#E40000]/50 transition-colors min-w-[140px]"
          >
            <option value="">All Types</option>
            <option value="pdf">PDF</option>
            <option value="image">Image</option>
            <option value="video">Video</option>
            <option value="document">Document</option>
            <option value="audio">Audio</option>
          </select>
        </motion.div>

        {/* Table */}
        <motion.div
          variants={itemVariants}
          className="bg-[#181C1F] border border-[#22272B] rounded-xl overflow-hidden"
        >
          {filteredResources.length === 0 ? (
            <div className="text-center py-16">
              <FolderOpen className="w-16 h-16 text-white/10 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No Resources Found</h3>
              <p className="text-white/40 text-sm">
                {activeTab === 'moderation'
                  ? 'No resources pending moderation review.'
                  : 'Try adjusting your search or filter criteria.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#22272B] text-left">
                    <th className="px-4 py-3 text-white/60 font-medium">Title</th>
                    <th className="px-4 py-3 text-white/60 font-medium">Type</th>
                    <th className="px-4 py-3 text-white/60 font-medium">Category</th>
                    <th className="px-4 py-3 text-white/60 font-medium">Uploaded By</th>
                    <th className="px-4 py-3 text-white/60 font-medium">Status</th>
                    <th className="px-4 py-3 text-white/60 font-medium text-center">Usage</th>
                    <th className="px-4 py-3 text-white/60 font-medium">Size</th>
                    <th className="px-4 py-3 text-white/60 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResources.map((resource) => (
                    <tr
                      key={resource.id}
                      className="border-b border-[#22272B]/50 hover:bg-[#1E2327] transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <span className="text-white font-medium">{resource.title}</span>
                          <p className="text-gray-500 text-xs mt-0.5">{formatDate(resource.created_at)}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <FileTypeBadge type={resource.file_type} />
                      </td>
                      <td className="px-4 py-3 text-gray-300">{resource.category}</td>
                      <td className="px-4 py-3 text-gray-400">{resource.uploaded_by}</td>
                      <td className="px-4 py-3">
                        <ModerationBadge status={resource.moderation_status} />
                      </td>
                      <td className="px-4 py-3 text-center text-gray-300">{resource.usage_count}</td>
                      <td className="px-4 py-3 text-gray-400">{resource.file_size}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            title="Preview"
                            className="p-1.5 rounded-lg hover:bg-[#22272B] text-white/50 hover:text-white transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            title="Download"
                            className="p-1.5 rounded-lg hover:bg-[#22272B] text-white/50 hover:text-white transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          {resource.moderation_status === 'pending' && (
                            <button
                              title="Approve"
                              className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-white/50 hover:text-emerald-400 transition-colors"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            title="Delete"
                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/50 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button
                            title="More"
                            className="p-1.5 rounded-lg hover:bg-[#22272B] text-white/50 hover:text-white transition-colors"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filteredResources.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#22272B]">
              <p className="text-xs text-white/40">
                Showing {filteredResources.length} of {MOCK_RESOURCES.length} resources
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default ResourceLibraryPage;
