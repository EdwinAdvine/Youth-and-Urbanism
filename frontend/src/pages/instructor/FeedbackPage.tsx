import React, { useEffect, useState } from 'react';
import { Star, MessageSquare, ThumbsUp, Filter, Send } from 'lucide-react';
import { InstructorPageHeader } from '../../components/instructor/shared/InstructorPageHeader';
import axios from 'axios';
import { format } from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface Feedback {
  id: string;
  student_name: string;
  student_avatar?: string;
  course_title: string;
  rating: number;
  comment: string;
  created_at: string;
  instructor_reply?: string;
  instructor_reply_at?: string;
  is_public: boolean;
  helpful_count: number;
}

export const FeedbackPage: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  useEffect(() => {
    fetchFeedback();
  }, [ratingFilter, statusFilter]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const params: any = {};
      if (ratingFilter !== 'all') params.rating = ratingFilter;
      if (statusFilter !== 'all') params.status = statusFilter;

      const response = await axios.get(`${API_URL}/api/v1/instructor/feedback`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      // Mock data for development
      if (!response.data || response.data.length === 0) {
        setFeedbacks([
          {
            id: '1',
            student_name: 'Jane Mwangi',
            course_title: 'Introduction to Mathematics - Grade 7',
            rating: 5,
            comment:
              'Amazing course! The instructor explains concepts very clearly and the practice exercises are really helpful. I improved my math grades significantly.',
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            is_public: true,
            helpful_count: 12,
          },
          {
            id: '2',
            student_name: 'John Kamau',
            course_title: 'English Language & Literature',
            rating: 4,
            comment:
              'Great content overall. The lessons are engaging and well-structured. Would love to see more video examples though.',
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            instructor_reply:
              'Thank you for the feedback, John! I\'m working on adding more video content to the course. Glad you\'re enjoying it!',
            instructor_reply_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            is_public: true,
            helpful_count: 8,
          },
          {
            id: '3',
            student_name: 'Sarah Wanjiru',
            course_title: 'Introduction to Mathematics - Grade 7',
            rating: 5,
            comment:
              'Best math teacher ever! I used to struggle with algebra but now I understand it. The step-by-step explanations are perfect.',
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            instructor_reply:
              'So happy to hear this, Sarah! Keep up the great work. Don\'t hesitate to ask questions in the discussion forums!',
            instructor_reply_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
            is_public: true,
            helpful_count: 15,
          },
          {
            id: '4',
            student_name: 'David Omondi',
            course_title: 'Science - Grade 8',
            rating: 3,
            comment:
              'The course is okay but some topics are covered too quickly. I had to rewatch some lessons multiple times to understand.',
            created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            is_public: false,
            helpful_count: 2,
          },
          {
            id: '5',
            student_name: 'Grace Akinyi',
            course_title: 'English Language & Literature',
            rating: 5,
            comment:
              'I love how the instructor uses real-world examples. The essay writing tips have been incredibly useful for my school assignments!',
            created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            instructor_reply: 'Thank you, Grace! So glad the tips are helping you succeed!',
            instructor_reply_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
            is_public: true,
            helpful_count: 10,
          },
        ]);
      } else {
        setFeedbacks(response.data);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReply = async (feedbackId: string) => {
    if (!replyText.trim()) {
      alert('Please enter a reply');
      return;
    }

    try {
      setSubmittingReply(true);
      const token = localStorage.getItem('access_token');
      await axios.post(
        `${API_URL}/api/v1/instructor/feedback/${feedbackId}/reply`,
        { reply: replyText.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setFeedbacks((prev) =>
        prev.map((f) =>
          f.id === feedbackId
            ? {
                ...f,
                instructor_reply: replyText.trim(),
                instructor_reply_at: new Date().toISOString(),
              }
            : f
        )
      );

      setReplyText('');
      setReplyingTo(null);
      alert('Reply posted successfully!');
    } catch (error) {
      console.error('Error posting reply:', error);
      alert('Failed to post reply');
    } finally {
      setSubmittingReply(false);
    }
  };

  const averageRating =
    feedbacks.length > 0
      ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
      : 0;

  const ratingDistribution = {
    5: feedbacks.filter((f) => f.rating === 5).length,
    4: feedbacks.filter((f) => f.rating === 4).length,
    3: feedbacks.filter((f) => f.rating === 3).length,
    2: feedbacks.filter((f) => f.rating === 2).length,
    1: feedbacks.filter((f) => f.rating === 1).length,
  };

  const unrepliedCount = feedbacks.filter((f) => !f.instructor_reply).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <InstructorPageHeader
        title="Student Feedback & Reviews"
        description="View and respond to student reviews of your courses"
        icon={<MessageSquare className="w-6 h-6 text-purple-400" />}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-xl p-5">
          <p className="text-sm text-purple-200 mb-2">Average Rating</p>
          <div className="flex items-center gap-2">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{averageRating.toFixed(1)}</p>
            <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
          </div>
          <p className="text-xs text-purple-200/60 mt-1">Based on {feedbacks.length} reviews</p>
        </div>

        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-5">
          <p className="text-sm text-gray-500 dark:text-white/60 mb-2">Total Reviews</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{feedbacks.length}</p>
        </div>

        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-5">
          <p className="text-sm text-gray-500 dark:text-white/60 mb-2">Pending Replies</p>
          <p className="text-3xl font-bold text-orange-400">{unrepliedCount}</p>
        </div>

        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-5">
          <p className="text-sm text-gray-500 dark:text-white/60 mb-2">Public Reviews</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {feedbacks.filter((f) => f.is_public).length}
          </p>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Rating Distribution</h3>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = ratingDistribution[rating as keyof typeof ratingDistribution];
            const percentage = feedbacks.length > 0 ? (count / feedbacks.length) * 100 : 0;

            return (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm text-gray-900 dark:text-white">{rating}</span>
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                </div>
                <div className="flex-1 h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-500 dark:text-white/60 w-12 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500 dark:text-white/60" />
          <span className="text-sm text-gray-500 dark:text-white/60">Rating:</span>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-white/60">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50"
          >
            <option value="all">All Feedback</option>
            <option value="unreplied">Unreplied</option>
            <option value="replied">Replied</option>
          </select>
        </div>
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {feedbacks.map((feedback) => (
          <div
            key={feedback.id}
            className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-6"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  {feedback.student_avatar ? (
                    <img
                      src={feedback.student_avatar}
                      alt={feedback.student_name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-medium text-purple-300">
                      {feedback.student_name.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{feedback.student_name}</p>
                  <p className="text-xs text-gray-500 dark:text-white/60">{feedback.course_title}</p>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-1 mb-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < feedback.rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-400 dark:text-gray-300 dark:text-white/20'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-300 dark:text-white/40">
                  {format(new Date(feedback.created_at), 'MMM d, yyyy')}
                </p>
              </div>
            </div>

            {/* Comment */}
            <p className="text-sm text-gray-600 dark:text-white/80 mb-3">{feedback.comment}</p>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-white/10">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-white/60">
                  <ThumbsUp className="w-4 h-4" />
                  <span>{feedback.helpful_count} found helpful</span>
                </div>
                {feedback.is_public && (
                  <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/30 text-green-300 text-xs rounded">
                    Public
                  </span>
                )}
              </div>

              {!feedback.instructor_reply && (
                <button
                  onClick={() => setReplyingTo(feedback.id)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 rounded-lg transition-colors text-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  Reply
                </button>
              )}
            </div>

            {/* Instructor Reply */}
            {feedback.instructor_reply && (
              <div className="mt-4 pl-6 border-l-2 border-purple-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-900 dark:text-white">You</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-white/60">
                    Replied {format(new Date(feedback.instructor_reply_at!), 'MMM d, yyyy')}
                  </p>
                </div>
                <p className="text-sm text-gray-800 dark:text-white/90">{feedback.instructor_reply}</p>
              </div>
            )}

            {/* Reply Form */}
            {replyingTo === feedback.id && (
              <div className="mt-4 space-y-3">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write your reply..."
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-purple-500/50 resize-none"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSubmitReply(feedback.id)}
                    disabled={submittingReply}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/50 disabled:cursor-not-allowed text-gray-900 dark:text-white rounded-lg transition-colors text-sm"
                  >
                    <Send className="w-4 h-4" />
                    {submittingReply ? 'Posting...' : 'Post Reply'}
                  </button>
                  <button
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyText('');
                    }}
                    className="px-4 py-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-lg transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {feedbacks.length === 0 && (
          <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-400 dark:text-white/30 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-white/60">No feedback found</p>
          </div>
        )}
      </div>
    </div>
  );
};
