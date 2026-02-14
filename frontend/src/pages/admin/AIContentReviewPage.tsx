import React, { useState } from 'react';
import {
  Search, Filter, RefreshCw, Eye, CheckCircle, XCircle,
  FileText, AlertCircle, ThumbsUp, BarChart3, Clock,
} from 'lucide-react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/layout/DashboardLayout';
import AdminPageHeader from '../../components/admin/shared/AdminPageHeader';

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------
type ContentType = 'lesson' | 'quiz' | 'explanation' | 'summary' | 'exercise';

type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'needs_revision';

type AIModel = 'Gemini Pro' | 'Claude 3.5' | 'GPT-4' | 'Grok';

interface ContentReviewItem {
  id: string;
  title: string;
  content_type: ContentType;
  model_used: AIModel;
  subject: string;
  grade_level: string;
  accuracy_score: number;
  review_status: ReviewStatus;
  generated_at: string;
  reviewed_by: string | null;
  snippet: string;
}

interface ReviewStats {
  pending_reviews: number;
  approved_today: number;
  override_rate: number;
  avg_accuracy: number;
}

// ------------------------------------------------------------------
// Mock data
// ------------------------------------------------------------------
const mockStats: ReviewStats = {
  pending_reviews: 23,
  approved_today: 47,
  override_rate: 8.3,
  avg_accuracy: 94.2,
};

const mockContentItems: ContentReviewItem[] = [
  {
    id: 'cr-001',
    title: 'Photosynthesis Explained - Grade 6',
    content_type: 'lesson',
    model_used: 'Gemini Pro',
    subject: 'Science',
    grade_level: 'Grade 6',
    accuracy_score: 97,
    review_status: 'approved',
    generated_at: '2025-01-15T14:22:00Z',
    reviewed_by: 'Dr. Otieno',
    snippet: 'Plants use sunlight, water and carbon dioxide to produce glucose and oxygen through photosynthesis...',
  },
  {
    id: 'cr-002',
    title: 'Swahili Proverbs Quiz - Grade 7',
    content_type: 'quiz',
    model_used: 'Claude 3.5',
    subject: 'Kiswahili',
    grade_level: 'Grade 7',
    accuracy_score: 88,
    review_status: 'pending',
    generated_at: '2025-01-15T13:45:00Z',
    reviewed_by: null,
    snippet: 'Q1: What does the proverb "Haraka haraka haina baraka" teach us about patience...',
  },
  {
    id: 'cr-003',
    title: 'Kenya Independence History - Grade 8',
    content_type: 'explanation',
    model_used: 'GPT-4',
    subject: 'Social Studies',
    grade_level: 'Grade 8',
    accuracy_score: 72,
    review_status: 'needs_revision',
    generated_at: '2025-01-15T12:10:00Z',
    reviewed_by: 'Mr. Kamau',
    snippet: 'Kenya gained independence on December 12, 1963. The role of Mau Mau fighters...',
  },
  {
    id: 'cr-004',
    title: 'Fractions Addition Exercises - Grade 4',
    content_type: 'exercise',
    model_used: 'Gemini Pro',
    subject: 'Mathematics',
    grade_level: 'Grade 4',
    accuracy_score: 99,
    review_status: 'approved',
    generated_at: '2025-01-15T11:30:00Z',
    reviewed_by: 'Ms. Njeri',
    snippet: 'Add the following fractions: 1/4 + 2/4, 3/8 + 1/8, 2/5 + 1/5...',
  },
  {
    id: 'cr-005',
    title: 'Water Cycle Summary - Grade 5',
    content_type: 'summary',
    model_used: 'Claude 3.5',
    subject: 'Science',
    grade_level: 'Grade 5',
    accuracy_score: 95,
    review_status: 'pending',
    generated_at: '2025-01-15T10:55:00Z',
    reviewed_by: null,
    snippet: 'The water cycle consists of evaporation, condensation, precipitation and collection...',
  },
  {
    id: 'cr-006',
    title: 'English Grammar - Tenses Quiz - Grade 6',
    content_type: 'quiz',
    model_used: 'GPT-4',
    subject: 'English',
    grade_level: 'Grade 6',
    accuracy_score: 91,
    review_status: 'pending',
    generated_at: '2025-01-15T10:20:00Z',
    reviewed_by: null,
    snippet: 'Identify the tense used in the following sentences: 1) She was running to school...',
  },
  {
    id: 'cr-007',
    title: 'Multiplication Tables Lesson - Grade 3',
    content_type: 'lesson',
    model_used: 'Gemini Pro',
    subject: 'Mathematics',
    grade_level: 'Grade 3',
    accuracy_score: 100,
    review_status: 'approved',
    generated_at: '2025-01-15T09:45:00Z',
    reviewed_by: 'Ms. Wanjiru',
    snippet: 'Learning multiplication tables helps us do math faster. Let us start with the 2 times table...',
  },
  {
    id: 'cr-008',
    title: 'Kenyan Counties Explanation - Grade 7',
    content_type: 'explanation',
    model_used: 'Grok',
    subject: 'Social Studies',
    grade_level: 'Grade 7',
    accuracy_score: 65,
    review_status: 'rejected',
    generated_at: '2025-01-15T08:15:00Z',
    reviewed_by: 'Mr. Odhiambo',
    snippet: 'Kenya has 47 counties since the 2010 constitution. Each county has a governor who...',
  },
];

// ------------------------------------------------------------------
// Badge helpers
// ------------------------------------------------------------------
const contentTypeLabels: Record<ContentType, string> = {
  lesson: 'Lesson',
  quiz: 'Quiz',
  explanation: 'Explanation',
  summary: 'Summary',
  exercise: 'Exercise',
};

const contentTypeColors: Record<ContentType, string> = {
  lesson: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  quiz: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  explanation: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  summary: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  exercise: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

const reviewStatusColors: Record<ReviewStatus, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  approved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
  needs_revision: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

const reviewStatusLabels: Record<ReviewStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  needs_revision: 'Needs Revision',
};

const ContentTypeBadge: React.FC<{ type: ContentType }> = ({ type }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${contentTypeColors[type]}`}
  >
    {contentTypeLabels[type]}
  </span>
);

const ReviewStatusBadge: React.FC<{ status: ReviewStatus }> = ({ status }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${reviewStatusColors[status]}`}
  >
    {reviewStatusLabels[status]}
  </span>
);

// ------------------------------------------------------------------
// Stats card
// ------------------------------------------------------------------
const StatsCard: React.FC<{
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconColor: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
}> = ({ label, value, icon, iconColor, change, changeType }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-[#181C1F] border border-[#22272B] rounded-xl p-6"
  >
    <div className="flex items-center justify-between mb-2">
      <span className="text-white/60 text-sm">{label}</span>
      <div className={iconColor}>{icon}</div>
    </div>
    <p className="text-2xl font-bold text-white">{value}</p>
    {change && (
      <p className={`text-xs mt-1 ${
        changeType === 'positive' ? 'text-emerald-400' :
        changeType === 'negative' ? 'text-red-400' :
        'text-white/40'
      }`}>
        {change}
      </p>
    )}
  </motion.div>
);

// ------------------------------------------------------------------
// Accuracy score indicator
// ------------------------------------------------------------------
const AccuracyScore: React.FC<{ score: number }> = ({ score }) => {
  const color =
    score >= 90 ? 'text-emerald-400' :
    score >= 75 ? 'text-yellow-400' :
    'text-red-400';
  return (
    <span className={`font-semibold ${color}`}>{score}%</span>
  );
};

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------
const formatDate = (iso: string): string => {
  return new Date(iso).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// ------------------------------------------------------------------
// Main component
// ------------------------------------------------------------------
const AIContentReviewPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [contentTypeFilter, setContentTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [items, setItems] = useState<ContentReviewItem[]>(mockContentItems);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleApprove = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, review_status: 'approved' as ReviewStatus, reviewed_by: 'Admin' } : item
      )
    );
    showToast('Content approved successfully', 'success');
  };

  const handleReject = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, review_status: 'rejected' as ReviewStatus, reviewed_by: 'Admin' } : item
      )
    );
    showToast('Content rejected', 'error');
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      !search ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.subject.toLowerCase().includes(search.toLowerCase());
    const matchesType = !contentTypeFilter || item.content_type === contentTypeFilter;
    const matchesStatus = !statusFilter || item.review_status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <DashboardLayout role="admin">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Header */}
        <AdminPageHeader
          title="AI Content Review"
          subtitle="Review and approve AI-generated educational content before it reaches students"
          breadcrumbs={[
            { label: 'AI Systems', path: '/dashboard/admin' },
            { label: 'Content Review' },
          ]}
          actions={
            <button className="flex items-center gap-2 px-3 py-2 text-sm bg-[#22272B] border border-[#333] rounded-lg text-white/70 hover:text-white hover:border-[#444] transition-colors">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            label="Pending Reviews"
            value={mockStats.pending_reviews}
            icon={<Clock className="w-5 h-5" />}
            iconColor="text-yellow-400"
            change="5 urgent (low accuracy)"
            changeType="negative"
          />
          <StatsCard
            label="Approved Today"
            value={mockStats.approved_today}
            icon={<ThumbsUp className="w-5 h-5" />}
            iconColor="text-emerald-400"
            change="+12 from yesterday"
            changeType="positive"
          />
          <StatsCard
            label="Override Rate"
            value={`${mockStats.override_rate}%`}
            icon={<AlertCircle className="w-5 h-5" />}
            iconColor="text-orange-400"
            change="-1.2% from last week"
            changeType="positive"
          />
          <StatsCard
            label="Avg Accuracy"
            value={`${mockStats.avg_accuracy}%`}
            icon={<BarChart3 className="w-5 h-5" />}
            iconColor="text-blue-400"
            change="+0.8% from last week"
            changeType="positive"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search by title or subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#181C1F] border border-[#22272B] rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#E40000]/50 transition-colors"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <select
              value={contentTypeFilter}
              onChange={(e) => setContentTypeFilter(e.target.value)}
              className="pl-10 pr-8 py-2.5 bg-[#181C1F] border border-[#22272B] rounded-lg text-white text-sm appearance-none cursor-pointer focus:outline-none focus:border-[#E40000]/50 transition-colors min-w-[150px]"
            >
              <option value="">All Types</option>
              <option value="lesson">Lesson</option>
              <option value="quiz">Quiz</option>
              <option value="explanation">Explanation</option>
              <option value="summary">Summary</option>
              <option value="exercise">Exercise</option>
            </select>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-[#181C1F] border border-[#22272B] rounded-lg text-white text-sm appearance-none cursor-pointer focus:outline-none focus:border-[#E40000]/50 transition-colors min-w-[150px]"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="needs_revision">Needs Revision</option>
          </select>
        </div>

        {/* Content review table */}
        <div className="bg-[#181C1F] border border-[#22272B] rounded-xl overflow-hidden">
          {filteredItems.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-white/10 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No Content Items</h3>
              <p className="text-white/40 text-sm">No content matches your current filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#22272B] text-left">
                    <th className="px-4 py-3 text-white/60 font-medium">Title</th>
                    <th className="px-4 py-3 text-white/60 font-medium">Content Type</th>
                    <th className="px-4 py-3 text-white/60 font-medium">Model</th>
                    <th className="px-4 py-3 text-white/60 font-medium">Accuracy</th>
                    <th className="px-4 py-3 text-white/60 font-medium">Status</th>
                    <th className="px-4 py-3 text-white/60 font-medium">Generated</th>
                    <th className="px-4 py-3 text-white/60 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-[#22272B]/50 hover:bg-[#1E2327] transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-white font-medium truncate max-w-[220px]">{item.title}</p>
                          <p className="text-xs text-white/40">{item.subject} &middot; {item.grade_level}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <ContentTypeBadge type={item.content_type} />
                      </td>
                      <td className="px-4 py-3 text-white/50">{item.model_used}</td>
                      <td className="px-4 py-3">
                        <AccuracyScore score={item.accuracy_score} />
                      </td>
                      <td className="px-4 py-3">
                        <ReviewStatusBadge status={item.review_status} />
                      </td>
                      <td className="px-4 py-3 text-white/40 text-xs">{formatDate(item.generated_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            title="Preview Content"
                            className="p-1.5 rounded-lg hover:bg-[#22272B] text-white/50 hover:text-white transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {(item.review_status === 'pending' || item.review_status === 'needs_revision') && (
                            <>
                              <button
                                onClick={() => handleApprove(item.id)}
                                title="Approve"
                                className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-white/50 hover:text-emerald-400 transition-colors"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleReject(item.id)}
                                title="Reject"
                                className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/50 hover:text-red-400 transition-colors"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}
          {filteredItems.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#22272B]">
              <p className="text-xs text-white/40">
                Showing {filteredItems.length} of {items.length} items
              </p>
              <p className="text-xs text-white/40">
                {items.filter((i) => i.review_status === 'pending').length} pending review
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-in-bottom">
          <div
            className={`flex items-center gap-3 px-5 py-3 rounded-lg shadow-xl ${
              toast.type === 'success'
                ? 'bg-emerald-500 text-white'
                : 'bg-red-500 text-white'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AIContentReviewPage;
