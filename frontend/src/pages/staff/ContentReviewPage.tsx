import React, { useState, useEffect } from 'react';

interface ContentReviewItem {
  id: string;
  contentTitle: string;
  contentType: 'lesson' | 'assignment' | 'quiz' | 'forum_post' | 'resource' | 'video';
  author: string;
  authorRole: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  aiRiskScore: number;
  status: 'pending' | 'in_review' | 'approved' | 'rejected';
  flagSource: 'ai' | 'user' | 'system' | 'auto';
  flagReason: string;
  submittedAt: string;
  grade: string;
}

interface ReviewStats {
  totalPending: number;
  critical: number;
  highPriority: number;
  aiFlagged: number;
}

type ContentTypeFilter = 'all' | ContentReviewItem['contentType'];
type PriorityFilter = 'all' | ContentReviewItem['priority'];
type StatusFilter = 'all' | ContentReviewItem['status'];
type FlagSourceFilter = 'all' | ContentReviewItem['flagSource'];

const ContentReviewPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<ContentReviewItem[]>([]);
  const [stats, setStats] = useState<ReviewStats>({ totalPending: 0, critical: 0, highPriority: 0, aiFlagged: 0 });
  const [contentTypeFilter, setContentTypeFilter] = useState<ContentTypeFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [flagSourceFilter, setFlagSourceFilter] = useState<FlagSourceFilter>('all');

  const mockItems: ContentReviewItem[] = [
    { id: 'CR-001', contentTitle: 'Grade 5 Science: Human Body Systems', contentType: 'lesson', author: 'Dr. Wanjiku Mwangi', authorRole: 'Instructor', priority: 'critical', aiRiskScore: 82, status: 'pending', flagSource: 'ai', flagReason: 'Contains potentially inaccurate medical information', submittedAt: '2024-01-15T08:30:00Z', grade: 'Grade 5' },
    { id: 'CR-002', contentTitle: 'Homework help: Algebra shortcuts', contentType: 'forum_post', author: 'Brian Ouma', authorRole: 'Student', priority: 'high', aiRiskScore: 67, status: 'pending', flagSource: 'ai', flagReason: 'Potential academic integrity concern', submittedAt: '2024-01-15T09:15:00Z', grade: 'Grade 8' },
    { id: 'CR-003', contentTitle: 'Grade 8 Social Studies: Governance', contentType: 'assignment', author: 'Jane Achieng', authorRole: 'Instructor', priority: 'medium', aiRiskScore: 45, status: 'in_review', flagSource: 'user', flagReason: 'Parent flagged as politically biased', submittedAt: '2024-01-14T16:00:00Z', grade: 'Grade 8' },
    { id: 'CR-004', contentTitle: 'Kiswahili Poetry: Shairi la Uhuru', contentType: 'resource', author: 'Peter Kamau', authorRole: 'Instructor', priority: 'low', aiRiskScore: 12, status: 'pending', flagSource: 'auto', flagReason: 'New content submission - standard review', submittedAt: '2024-01-15T07:00:00Z', grade: 'Grade 7' },
    { id: 'CR-005', contentTitle: 'Grade 6 Math: Fractions Quiz', contentType: 'quiz', author: 'AI Generator', authorRole: 'System', priority: 'medium', aiRiskScore: 38, status: 'pending', flagSource: 'system', flagReason: 'AI-generated content requires human review', submittedAt: '2024-01-15T06:45:00Z', grade: 'Grade 6' },
    { id: 'CR-006', contentTitle: 'Video: Introduction to Coding with Python', contentType: 'video', author: 'TechKids Kenya', authorRole: 'Partner', priority: 'high', aiRiskScore: 71, status: 'pending', flagSource: 'ai', flagReason: 'Audio transcript contains potentially inappropriate language', submittedAt: '2024-01-14T14:30:00Z', grade: 'Grade 7' },
    { id: 'CR-007', contentTitle: 'Grade 4 English: Creative Writing Prompt', contentType: 'lesson', author: 'Mary Njeri', authorRole: 'Instructor', priority: 'low', aiRiskScore: 8, status: 'approved', flagSource: 'auto', flagReason: 'Routine new content submission', submittedAt: '2024-01-13T11:00:00Z', grade: 'Grade 4' },
    { id: 'CR-008', contentTitle: 'Discussion: Best study techniques', contentType: 'forum_post', author: 'Alice Wambui', authorRole: 'Parent', priority: 'medium', aiRiskScore: 52, status: 'pending', flagSource: 'user', flagReason: 'Reported by 2 users for external link spam', submittedAt: '2024-01-15T10:20:00Z', grade: 'General' },
    { id: 'CR-009', contentTitle: 'Grade 3 Environmental Studies: Water Cycle', contentType: 'lesson', author: 'John Odhiambo', authorRole: 'Instructor', priority: 'critical', aiRiskScore: 89, status: 'pending', flagSource: 'ai', flagReason: 'Significant factual errors detected in diagrams', submittedAt: '2024-01-15T05:30:00Z', grade: 'Grade 3' },
    { id: 'CR-010', contentTitle: 'Grade 7 History: Pre-colonial East Africa', contentType: 'assignment', author: 'Samuel Kiprop', authorRole: 'Instructor', priority: 'high', aiRiskScore: 63, status: 'in_review', flagSource: 'ai', flagReason: 'Potentially sensitive cultural content needs review', submittedAt: '2024-01-14T09:45:00Z', grade: 'Grade 7' },
    { id: 'CR-011', contentTitle: 'CRE: Values and Ethics Module', contentType: 'lesson', author: 'Grace Muthoni', authorRole: 'Instructor', priority: 'medium', aiRiskScore: 41, status: 'pending', flagSource: 'system', flagReason: 'Religious content flagged for balance review', submittedAt: '2024-01-14T13:15:00Z', grade: 'Grade 6' },
    { id: 'CR-012', contentTitle: 'Grade 8 Science End Term Exam', contentType: 'quiz', author: 'AI Generator', authorRole: 'System', priority: 'high', aiRiskScore: 58, status: 'rejected', flagSource: 'user', flagReason: 'Questions exceed curriculum scope - instructor flagged', submittedAt: '2024-01-13T08:00:00Z', grade: 'Grade 8' },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setItems(mockItems);
      setStats({
        totalPending: mockItems.filter(i => i.status === 'pending').length,
        critical: mockItems.filter(i => i.priority === 'critical').length,
        highPriority: mockItems.filter(i => i.priority === 'high').length,
        aiFlagged: mockItems.filter(i => i.flagSource === 'ai').length,
      });
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredItems = items.filter((item) => {
    if (contentTypeFilter !== 'all' && item.contentType !== contentTypeFilter) return false;
    if (priorityFilter !== 'all' && item.priority !== priorityFilter) return false;
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (flagSourceFilter !== 'all' && item.flagSource !== flagSourceFilter) return false;
    return true;
  });

  const getPriorityBadge = (priority: ContentReviewItem['priority']) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-500/20 text-red-400 border-red-500/30',
      high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      low: 'bg-green-500/20 text-green-400 border-green-500/30',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${colors[priority]}`}>
        {priority}
      </span>
    );
  };

  const getStatusBadge = (status: ContentReviewItem['status']) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-400',
      in_review: 'bg-blue-500/20 text-blue-400',
      approved: 'bg-green-500/20 text-green-400',
      rejected: 'bg-red-500/20 text-red-400',
    };
    const labels: Record<string, string> = {
      pending: 'Pending',
      in_review: 'In Review',
      approved: 'Approved',
      rejected: 'Rejected',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-red-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getRiskBar = (score: number) => {
    const color = score >= 70 ? 'bg-red-500' : score >= 40 ? 'bg-yellow-500' : 'bg-green-500';
    return (
      <div className="flex items-center gap-2">
        <div className="w-16 h-1.5 bg-gray-100 dark:bg-[#22272B] rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
        </div>
        <span className={`text-xs font-medium ${getRiskColor(score)}`}>{score}</span>
      </div>
    );
  };

  const getFlagBadge = (source: ContentReviewItem['flagSource']) => {
    const labels: Record<string, string> = { ai: 'AI', user: 'User', system: 'System', auto: 'Auto' };
    const colors: Record<string, string> = {
      ai: 'bg-purple-500/20 text-purple-400',
      user: 'bg-blue-500/20 text-blue-400',
      system: 'bg-gray-500/20 text-gray-400',
      auto: 'bg-cyan-500/20 text-cyan-400',
    };
    return (
      <span className={`px-2 py-0.5 rounded text-xs ${colors[source]}`}>{labels[source]}</span>
    );
  };

  const getContentTypeLabel = (type: ContentReviewItem['contentType']) => {
    const labels: Record<string, string> = {
      lesson: 'Lesson', assignment: 'Assignment', quiz: 'Quiz',
      forum_post: 'Forum Post', resource: 'Resource', video: 'Video',
    };
    return labels[type];
  };

  const handleApprove = (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, status: 'approved' as const } : item));
  };

  const handleReject = (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, status: 'rejected' as const } : item));
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-7 w-56 bg-white dark:bg-[#181C1F] rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-white dark:bg-[#181C1F] rounded-xl border border-gray-200 dark:border-[#22272B] animate-pulse" />
          ))}
        </div>
        <div className="h-10 w-full bg-white dark:bg-[#181C1F] rounded-lg animate-pulse" />
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-14 bg-white dark:bg-[#181C1F] rounded-lg border border-gray-200 dark:border-[#22272B] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Content Review Queue</h1>
          <p className="text-sm text-gray-500 dark:text-white/50 mt-1">
            Review, approve, or reject flagged content across the platform
          </p>
        </div>
        <button className="px-4 py-2 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg text-sm text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:border-[#E40000]/50 transition-colors">
          Export Report
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Pending', value: stats.totalPending, color: 'text-gray-900 dark:text-white' },
          { label: 'Critical', value: stats.critical, color: 'text-red-400' },
          { label: 'High Priority', value: stats.highPriority, color: 'text-orange-400' },
          { label: 'AI-Flagged', value: stats.aiFlagged, color: 'text-purple-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-[#181C1F] rounded-xl border border-gray-200 dark:border-[#22272B] p-4">
            <p className="text-xs text-gray-500 dark:text-white/50 uppercase tracking-wider">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-white dark:bg-[#181C1F] rounded-xl border border-gray-200 dark:border-[#22272B]">
        <select
          value={contentTypeFilter}
          onChange={(e) => setContentTypeFilter(e.target.value as ContentTypeFilter)}
          className="px-3 py-1.5 bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-lg text-sm text-gray-600 dark:text-white/70 focus:outline-none focus:border-[#E40000]/50"
        >
          <option value="all">All Types</option>
          <option value="lesson">Lesson</option>
          <option value="assignment">Assignment</option>
          <option value="quiz">Quiz</option>
          <option value="forum_post">Forum Post</option>
          <option value="resource">Resource</option>
          <option value="video">Video</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as PriorityFilter)}
          className="px-3 py-1.5 bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-lg text-sm text-gray-600 dark:text-white/70 focus:outline-none focus:border-[#E40000]/50"
        >
          <option value="all">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="px-3 py-1.5 bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-lg text-sm text-gray-600 dark:text-white/70 focus:outline-none focus:border-[#E40000]/50"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_review">In Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          value={flagSourceFilter}
          onChange={(e) => setFlagSourceFilter(e.target.value as FlagSourceFilter)}
          className="px-3 py-1.5 bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-lg text-sm text-gray-600 dark:text-white/70 focus:outline-none focus:border-[#E40000]/50"
        >
          <option value="all">All Sources</option>
          <option value="ai">AI Flagged</option>
          <option value="user">User Reported</option>
          <option value="system">System</option>
          <option value="auto">Auto</option>
        </select>
        <span className="text-xs text-gray-400 dark:text-white/40 ml-auto">
          {filteredItems.length} of {items.length} items
        </span>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-[#181C1F] rounded-xl border border-gray-200 dark:border-[#22272B] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-[#22272B]">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-white/50 uppercase tracking-wider">Content</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-white/50 uppercase tracking-wider">Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-white/50 uppercase tracking-wider">Author</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-white/50 uppercase tracking-wider">Priority</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-white/50 uppercase tracking-wider">AI Risk</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-white/50 uppercase tracking-wider">Flag</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-white/50 uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 dark:text-white/50 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-[#22272B]">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm text-gray-900 dark:text-white font-medium">{item.contentTitle}</p>
                      <p className="text-xs text-gray-400 dark:text-white/40 mt-0.5">{item.grade} &middot; {item.flagReason}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-500 dark:text-white/60 bg-gray-50 dark:bg-[#0F1112] px-2 py-1 rounded">
                      {getContentTypeLabel(item.contentType)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm text-gray-700 dark:text-white/80">{item.author}</p>
                      <p className="text-xs text-gray-400 dark:text-white/40">{item.authorRole}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">{getPriorityBadge(item.priority)}</td>
                  <td className="px-4 py-3">{getRiskBar(item.aiRiskScore)}</td>
                  <td className="px-4 py-3">{getFlagBadge(item.flagSource)}</td>
                  <td className="px-4 py-3">{getStatusBadge(item.status)}</td>
                  <td className="px-4 py-3 text-right">
                    {item.status === 'pending' || item.status === 'in_review' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleApprove(item.id)}
                          className="px-3 py-1 text-xs font-medium text-green-400 bg-green-500/10 border border-green-500/20 rounded hover:bg-green-500/20 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(item.id)}
                          className="px-3 py-1 text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded hover:bg-red-500/20 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 dark:text-white/30">--</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ContentReviewPage;
