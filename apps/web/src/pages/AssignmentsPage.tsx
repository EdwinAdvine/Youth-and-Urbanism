// AssignmentsPage - Authenticated page at /assignments. Lists all assignments with status
// filtering, submission upload, grading details, and deadline tracking.
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUserStore } from '../store';
import {
  FileText,
  Calendar,
  Clock,
  CheckCircle,
  Upload,
  Eye,
  Download,
  Search,
  Star,
  TrendingUp,
  AlertCircle,
  FileCheck
} from 'lucide-react';

const AssignmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { status: statusParam } = useParams();
  const { assignments } = useUserStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'due_date' | 'title' | 'grade' | 'course'>('due_date');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'submitted' | 'graded'>(statusParam as any || 'all');

  // Filter and sort assignments
  const filteredAssignments = assignments
    .filter(assignment => {
      const matchesSearch = assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           assignment.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           assignment.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || assignment.status === filterStatus;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'due_date':
          return a.dueDate.getTime() - b.dueDate.getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'grade':
          return (b.grade || 0) - (a.grade || 0);
        case 'course':
          return a.courseTitle.localeCompare(b.courseTitle);
        default:
          return 0;
      }
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'graded': return 'from-green-500 to-emerald-500';
      case 'submitted': return 'from-blue-500 to-cyan-500';
      case 'pending': return 'from-orange-500 to-red-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'graded': return <CheckCircle className="w-4 h-4" />;
      case 'submitted': return <FileCheck className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getDaysUntilDue = (dueDate: Date) => {
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} days`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `Due in ${diffDays} days`;
  };

  const isOverdue = (dueDate: Date) => {
    return dueDate < new Date();
  };

  return (
    <>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-gradient-to-br from-white dark:from-[#181C1F] to-[#22272B] border border-[#2A3035] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {filterStatus === 'all' ? 'All Assignments' : `${filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)} Assignments`}
              </h1>
              <p className="text-gray-500 dark:text-white/60 text-sm">
                Manage your assignments and track your progress
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-500 dark:text-white/60">
                <FileText className="w-5 h-5" />
                <span>{assignments.length} assignments</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Graded: {assignments.filter(a => a.status === 'graded').length}</span>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">Submitted: {assignments.filter(a => a.status === 'submitted').length}</span>
                <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full">Pending: {assignments.filter(a => a.status === 'pending').length}</span>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-white/60 w-5 h-5" />
              <input
                type="text"
                placeholder="Search assignments, courses, or descriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-[#22272B] border border-[#2A3035] rounded-lg text-gray-900 dark:text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#FF0000]/50 focus:border-transparent transition-all"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-3 bg-gray-100 dark:bg-[#22272B] border border-[#2A3035] rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF0000]/50 focus:border-transparent transition-all"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="submitted">Submitted</option>
                <option value="graded">Graded</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-3 bg-gray-100 dark:bg-[#22272B] border border-[#2A3035] rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF0000]/50 focus:border-transparent transition-all"
              >
                <option value="due_date">Sort by Due Date</option>
                <option value="title">Sort by Title</option>
                <option value="grade">Sort by Grade</option>
                <option value="course">Sort by Course</option>
              </select>
            </div>
          </div>
        </div>

        {/* Assignments List */}
        <div className="space-y-4">
          {filteredAssignments.length > 0 ? (
            filteredAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className={`bg-gradient-to-br from-white dark:from-[#181C1F] to-[#22272B] border border-[#2A3035] rounded-xl p-6 hover:border-[#FF0000]/50 transition-all duration-300 ${
                  isOverdue(assignment.dueDate) && assignment.status === 'pending' ? 'ring-2 ring-red-500/30' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${getStatusColor(assignment.status)} rounded-xl flex items-center justify-center text-gray-900 dark:text-white font-bold text-lg`}>
                      {getStatusIcon(assignment.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-[#FF0000] transition-colors">
                          {assignment.title}
                        </h3>
                        {assignment.status === 'graded' && assignment.grade && (
                          <span className="px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-gray-900 dark:text-white text-xs rounded-full font-medium">
                            {assignment.grade}/{assignment.maxPoints} points
                          </span>
                        )}
                        {isOverdue(assignment.dueDate) && assignment.status === 'pending' && (
                          <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Overdue
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-white/60 mb-2">{assignment.courseTitle}</p>
                      <p className="text-sm text-gray-700 dark:text-white/80 line-clamp-2">{assignment.description}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-white/60">
                        <Calendar className="w-3 h-3" />
                        <span>{assignment.dueDate.toLocaleDateString()}</span>
                      </div>
                      <div className={`text-xs font-medium ${
                        isOverdue(assignment.dueDate) && assignment.status === 'pending' 
                          ? 'text-red-400' 
                          : assignment.status === 'graded' 
                            ? 'text-green-400' 
                            : 'text-blue-400'
                      }`}>
                        {getDaysUntilDue(assignment.dueDate)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Assignment Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-100 dark:bg-[#22272B] border border-[#2A3035] rounded-lg p-3">
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-white/60 mb-1">
                      <FileText className="w-3 h-3" />
                      <span>Max Points</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{assignment.maxPoints}</p>
                  </div>
                  
                  <div className="bg-gray-100 dark:bg-[#22272B] border border-[#2A3035] rounded-lg p-3">
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-white/60 mb-1">
                      <Calendar className="w-3 h-3" />
                      <span>Due Date</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{assignment.dueDate.toLocaleDateString()}</p>
                  </div>
                  
                  {assignment.status === 'graded' && (
                    <div className="bg-gray-100 dark:bg-[#22272B] border border-[#2A3035] rounded-lg p-3">
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-white/60 mb-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>Your Grade</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{assignment.grade || 0}/{assignment.maxPoints}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getStatusColor(assignment.status)} text-gray-900 dark:text-white`}>
                      {assignment.status}
                    </span>
                    {assignment.attachments && assignment.attachments.length > 0 && (
                      <span className="text-xs text-gray-500 dark:text-white/60">
                        {assignment.attachments.length} attachment(s)
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {assignment.status === 'pending' && (
                      <>
                        <button
                          onClick={() => navigate(`/dashboard/student/assignments/${assignment.id}/submit`)}
                          className="flex items-center gap-2 bg-gradient-to-r from-[#FF0000] to-[#E40000] text-gray-900 dark:text-white px-4 py-2 rounded-lg hover:from-[#E40000] hover:to-[#CC0000] transition-all duration-200"
                        >
                          <Upload className="w-4 h-4" />
                          Submit
                        </button>
                        <button
                          onClick={() => navigate(`/dashboard/student/assignments/${assignment.id}`)}
                          className="flex items-center gap-2 border border-[#2A3035] text-gray-900 dark:text-white px-4 py-2 rounded-lg hover:border-[#FF0000] hover:text-[#FF0000] transition-all duration-200"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                      </>
                    )}
                    {assignment.status === 'submitted' && (
                      <>
                        <button
                          onClick={() => navigate(`/dashboard/student/assignments/${assignment.id}`)}
                          className="flex items-center gap-2 border border-[#2A3035] text-gray-900 dark:text-white px-4 py-2 rounded-lg hover:border-[#FF0000] hover:text-[#FF0000] transition-all duration-200"
                        >
                          <Eye className="w-4 h-4" />
                          View Submission
                        </button>
                        {assignment.attachments && (
                          <button
                            className="flex items-center gap-2 border border-[#2A3035] text-gray-900 dark:text-white px-4 py-2 rounded-lg hover:border-[#FF0000] hover:text-[#FF0000] transition-all duration-200"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </button>
                        )}
                      </>
                    )}
                    {assignment.status === 'graded' && (
                      <>
                        <button
                          onClick={() => navigate(`/dashboard/student/assignments/${assignment.id}`)}
                          className="flex items-center gap-2 border border-[#2A3035] text-gray-900 dark:text-white px-4 py-2 rounded-lg hover:border-[#FF0000] hover:text-[#FF0000] transition-all duration-200"
                        >
                          <Eye className="w-4 h-4" />
                          View Feedback
                        </button>
                        {assignment.attachments && (
                          <button
                            className="flex items-center gap-2 border border-[#2A3035] text-gray-900 dark:text-white px-4 py-2 rounded-lg hover:border-[#FF0000] hover:text-[#FF0000] transition-all duration-200"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Feedback */}
                {assignment.status === 'graded' && assignment.feedback && (
                  <div className="mt-4 p-4 bg-gray-100 dark:bg-[#22272B] border border-[#2A3035] rounded-lg">
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-white/60 mb-2">
                      <Star className="w-3 h-3" />
                      <span>Feedback</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-white/80">{assignment.feedback}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-[#FF0000] to-[#E40000] rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-900 dark:text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No assignments found</h3>
              <p className="text-gray-500 dark:text-white/60 mb-6">
                Try adjusting your search criteria or filters to find what you're looking for.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterStatus('all');
                }}
                className="bg-gradient-to-r from-[#FF0000] to-[#E40000] text-gray-900 dark:text-white px-6 py-2 rounded-lg hover:from-[#E40000] hover:to-[#CC0000] transition-all duration-200"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Empty State for Specific Status */}
        {statusParam && filteredAssignments.length === 0 && assignments.filter(a => a.status === statusParam).length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-12 h-12 text-gray-900 dark:text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No {statusParam} assignments yet</h3>
            <p className="text-gray-500 dark:text-white/60 mb-6">
              {statusParam === 'pending' 
                ? "You don't have any pending assignments. Great job staying on top of your work!"
                : statusParam === 'submitted'
                  ? "You haven't submitted any assignments yet. Check the pending assignments to get started!"
                  : "Your assignments are still being graded. Please be patient!"}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => navigate('/dashboard/student/assignments/pending')}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-gray-900 dark:text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200"
              >
                View Pending Assignments
              </button>
              <button
                onClick={() => navigate('/dashboard/student/courses/in-progress')}
                className="border border-[#2A3035] text-gray-900 dark:text-white px-6 py-3 rounded-lg hover:border-[#FF0000] hover:text-[#FF0000] transition-all duration-200"
              >
                Continue Learning
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AssignmentsPage;