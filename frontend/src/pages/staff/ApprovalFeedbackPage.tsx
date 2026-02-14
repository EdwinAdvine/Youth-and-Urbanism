import React, { useState, useEffect } from 'react';

type TabType = 'pending' | 'completed' | 'ai_drafted';

interface ApprovalItem {
  id: string;
  title: string;
  type: 'content' | 'course' | 'assessment' | 'partner_submission' | 'instructor_application';
  submittedBy: string;
  submittedAt: string;
  grade: string;
  status: 'pending' | 'approved' | 'changes_requested' | 'rejected';
  aiFeedbackDraft: string;
  aiConfidenceScore: number;
  reviewNotes: string;
  priority: 'high' | 'medium' | 'low';
}

const ApprovalFeedbackPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [items, setItems] = useState<ApprovalItem[]>([]);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const mockItems: ApprovalItem[] = [
    {
      id: 'APR-001', title: 'Grade 6 Mathematics: Geometry Module', type: 'content',
      submittedBy: 'Dr. Agnes Mutua', submittedAt: '2024-01-15T08:00:00Z', grade: 'Grade 6',
      status: 'pending', priority: 'high',
      aiFeedbackDraft: 'This module covers key geometry concepts aligned with CBC standards for Grade 6. The content is well-structured with clear learning objectives. Recommendation: Approve with minor suggestion to add more visual diagrams in Section 3.',
      aiConfidenceScore: 87, reviewNotes: '',
    },
    {
      id: 'APR-002', title: 'New Partner: TechKids Africa Content Pack', type: 'partner_submission',
      submittedBy: 'TechKids Africa Ltd.', submittedAt: '2024-01-14T14:30:00Z', grade: 'Grade 7-8',
      status: 'pending', priority: 'high',
      aiFeedbackDraft: 'Content pack includes 12 coding lessons targeting Grade 7-8. Quality is generally high, but 3 lessons need CBC standard tagging. Recommend requesting revisions for CBC alignment before approval.',
      aiConfidenceScore: 72, reviewNotes: '',
    },
    {
      id: 'APR-003', title: 'End of Term 1 Science Assessment', type: 'assessment',
      submittedBy: 'James Kariuki', submittedAt: '2024-01-15T06:45:00Z', grade: 'Grade 5',
      status: 'pending', priority: 'medium',
      aiFeedbackDraft: 'Assessment contains 40 questions across 5 strands. Difficulty distribution is appropriate. Minor concern: Question 23 may be ambiguous. Suggest clarifying the wording before deployment.',
      aiConfidenceScore: 91, reviewNotes: '',
    },
    {
      id: 'APR-004', title: 'Instructor Application: Sarah Nzomo', type: 'instructor_application',
      submittedBy: 'Sarah Nzomo', submittedAt: '2024-01-13T10:00:00Z', grade: 'N/A',
      status: 'pending', priority: 'medium',
      aiFeedbackDraft: 'Applicant has B.Ed from Kenyatta University, 4 years teaching experience in Mathematics and Science. Qualifications verified against TSC records. Background check clear. Recommended for probationary approval.',
      aiConfidenceScore: 94, reviewNotes: '',
    },
    {
      id: 'APR-005', title: 'Kiswahili Literature: Fasihi ya Watoto', type: 'course',
      submittedBy: 'Peter Oloo', submittedAt: '2024-01-12T11:30:00Z', grade: 'Grade 4',
      status: 'pending', priority: 'low',
      aiFeedbackDraft: 'Course introduces young learners to Kiswahili children\'s literature. Content is age-appropriate and culturally relevant. All 8 modules align with CBC Kiswahili language competencies. Recommend approval.',
      aiConfidenceScore: 96, reviewNotes: '',
    },
    {
      id: 'APR-006', title: 'Grade 8 History: Independence Movements', type: 'content',
      submittedBy: 'Michael Kipchirchir', submittedAt: '2024-01-10T09:00:00Z', grade: 'Grade 8',
      status: 'approved', priority: 'medium',
      aiFeedbackDraft: 'Comprehensive coverage of East African independence movements. Well-balanced perspectives with primary source references. Approved.',
      aiConfidenceScore: 88, reviewNotes: 'Reviewed and approved. Excellent content quality.',
    },
    {
      id: 'APR-007', title: 'Grade 3 Art & Craft: Traditional Patterns', type: 'content',
      submittedBy: 'Lucy Wanjala', submittedAt: '2024-01-11T13:00:00Z', grade: 'Grade 3',
      status: 'changes_requested', priority: 'low',
      aiFeedbackDraft: 'Content is creative and engaging. However, some craft materials listed may not be widely available. Suggest providing alternative materials list.',
      aiConfidenceScore: 79, reviewNotes: 'Please add alternative materials list for rural schools.',
    },
    {
      id: 'APR-008', title: 'Grade 7 Computer Studies Module', type: 'course',
      submittedBy: 'Dennis Otieno', submittedAt: '2024-01-09T15:00:00Z', grade: 'Grade 7',
      status: 'rejected', priority: 'high',
      aiFeedbackDraft: 'Course content uses outdated software versions and references deprecated technologies. Multiple factual errors detected in networking section.',
      aiConfidenceScore: 65, reviewNotes: 'Rejected: Content outdated. Please update to current technology standards and resubmit.',
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setItems(mockItems);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredItems = items.filter((item) => {
    if (activeTab === 'pending') return item.status === 'pending';
    if (activeTab === 'completed') return item.status !== 'pending';
    if (activeTab === 'ai_drafted') return item.aiConfidenceScore >= 85 && item.status === 'pending';
    return true;
  });

  const tabCounts = {
    pending: items.filter(i => i.status === 'pending').length,
    completed: items.filter(i => i.status !== 'pending').length,
    ai_drafted: items.filter(i => i.aiConfidenceScore >= 85 && i.status === 'pending').length,
  };

  const getTypeBadge = (type: ApprovalItem['type']) => {
    const config: Record<string, { label: string; color: string }> = {
      content: { label: 'Content', color: 'bg-blue-500/20 text-blue-400' },
      course: { label: 'Course', color: 'bg-purple-500/20 text-purple-400' },
      assessment: { label: 'Assessment', color: 'bg-cyan-500/20 text-cyan-400' },
      partner_submission: { label: 'Partner', color: 'bg-orange-500/20 text-orange-400' },
      instructor_application: { label: 'Instructor App', color: 'bg-green-500/20 text-green-400' },
    };
    const { label, color } = config[type];
    return <span className={`px-2 py-0.5 rounded text-xs font-medium ${color}`}>{label}</span>;
  };

  const getStatusBadge = (status: ApprovalItem['status']) => {
    const config: Record<string, { label: string; color: string }> = {
      pending: { label: 'Pending', color: 'bg-yellow-500/20 text-yellow-400' },
      approved: { label: 'Approved', color: 'bg-green-500/20 text-green-400' },
      changes_requested: { label: 'Changes Requested', color: 'bg-orange-500/20 text-orange-400' },
      rejected: { label: 'Rejected', color: 'bg-red-500/20 text-red-400' },
    };
    const { label, color } = config[status];
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>{label}</span>;
  };

  const handleAction = (id: string, newStatus: ApprovalItem['status']) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
    setExpandedItem(null);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-KE', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-7 w-52 bg-white dark:bg-[#181C1F] rounded animate-pulse" />
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-9 w-36 bg-white dark:bg-[#181C1F] rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-white dark:bg-[#181C1F] rounded-xl border border-gray-200 dark:border-[#22272B] animate-pulse" />
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
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Approval & Feedback</h1>
          <p className="text-sm text-gray-500 dark:text-white/50 mt-1">
            Review submissions and manage AI-drafted feedback responses
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-white dark:bg-[#181C1F] rounded-lg border border-gray-200 dark:border-[#22272B] w-fit">
        {([
          { key: 'pending' as TabType, label: 'Pending Reviews' },
          { key: 'completed' as TabType, label: 'Completed' },
          { key: 'ai_drafted' as TabType, label: 'AI Drafted Feedback' },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-[#E40000] text-gray-900 dark:text-white'
                : 'text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
            }`}
          >
            {tab.label}
            <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
              activeTab === tab.key ? 'bg-gray-200 dark:bg-white/20' : 'bg-gray-100 dark:bg-white/10'
            }`}>
              {tabCounts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Items */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-gray-400 dark:text-white/40">
            <p className="text-lg">No items in this category</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-[#181C1F] rounded-xl border border-gray-200 dark:border-[#22272B] overflow-hidden"
            >
              {/* Card Header */}
              <div
                className="p-4 flex items-start justify-between cursor-pointer hover:bg-white/[0.02] transition-colors"
                onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    {getTypeBadge(item.type)}
                    {getStatusBadge(item.status)}
                    {item.priority === 'high' && (
                      <span className="text-xs text-[#E40000] font-medium">HIGH PRIORITY</span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mt-2">{item.title}</h3>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-gray-400 dark:text-white/40">By {item.submittedBy}</span>
                    <span className="text-xs text-gray-400 dark:text-white/40">{item.grade}</span>
                    <span className="text-xs text-gray-400 dark:text-white/40">{formatDate(item.submittedAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <div className="text-right">
                    <p className="text-xs text-gray-400 dark:text-white/40">AI Confidence</p>
                    <p className={`text-sm font-bold ${
                      item.aiConfidenceScore >= 85 ? 'text-green-400' :
                      item.aiConfidenceScore >= 70 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {item.aiConfidenceScore}%
                    </p>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-400 dark:text-white/30 transition-transform ${expandedItem === item.id ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedItem === item.id && (
                <div className="border-t border-gray-200 dark:border-[#22272B] p-4 space-y-4">
                  {/* AI Feedback Draft */}
                  <div className="bg-gray-50 dark:bg-[#0F1112] rounded-lg p-4 border border-purple-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <span className="text-xs font-medium text-purple-400 uppercase tracking-wider">AI-Drafted Feedback</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-white/70 leading-relaxed">{item.aiFeedbackDraft}</p>
                  </div>

                  {/* Review Notes */}
                  {item.reviewNotes && (
                    <div className="bg-gray-50 dark:bg-[#0F1112] rounded-lg p-4 border border-gray-200 dark:border-[#22272B]">
                      <p className="text-xs font-medium text-gray-500 dark:text-white/50 mb-1">Staff Review Notes</p>
                      <p className="text-sm text-gray-600 dark:text-white/70">{item.reviewNotes}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {item.status === 'pending' && (
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={() => handleAction(item.id, 'approved')}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-gray-900 dark:text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(item.id, 'changes_requested')}
                        className="px-4 py-2 bg-gray-50 dark:bg-[#0F1112] border border-orange-500/30 text-orange-400 hover:bg-orange-500/10 text-sm font-medium rounded-lg transition-colors"
                      >
                        Request Changes
                      </button>
                      <button
                        onClick={() => handleAction(item.id, 'rejected')}
                        className="px-4 py-2 bg-gray-50 dark:bg-[#0F1112] border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm font-medium rounded-lg transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ApprovalFeedbackPage;
