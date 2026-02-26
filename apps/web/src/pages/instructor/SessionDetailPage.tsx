import React, { useEffect, useState } from 'react';
import { ArrowLeft, Users, Clock, Download, Video, CheckSquare, Plus } from 'lucide-react';
import { InstructorPageHeader } from '../../components/instructor/shared/InstructorPageHeader';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../../services/api';
import { format } from 'date-fns';


interface Attendee {
  student_id: string;
  student_name: string;
  joined_at: string;
  left_at?: string;
  duration_minutes: number;
  engagement_score: number;
}

interface FollowUpTask {
  id: string;
  title: string;
  description: string;
  assigned_to_student_id?: string;
  assigned_to_student_name?: string;
  due_date?: string;
  status: 'pending' | 'completed';
}

interface SessionDetail {
  id: string;
  title: string;
  description: string;
  course_title?: string;
  scheduled_start: string;
  scheduled_end: string;
  actual_start?: string;
  actual_end?: string;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  recording_url?: string;
  attendees: Attendee[];
  follow_ups: FollowUpTask[];
  ai_summary?: string;
}

export const SessionDetailPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingSummary, setGeneratingSummary] = useState(false);

  useEffect(() => {
    if (sessionId) {
      fetchSessionDetails();
    }
  }, [sessionId]);

  const fetchSessionDetails = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/v1/instructor/sessions/${sessionId}`);

      // Mock data for development
      if (!response.data) {
        setSession({
          id: sessionId || '1',
          title: 'Algebra Review Session',
          description: 'Q&A session covering linear equations and problem-solving strategies',
          course_title: 'Introduction to Mathematics - Grade 7',
          scheduled_start: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          scheduled_end: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          actual_start: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          actual_end: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          status: 'completed',
          recording_url: '/recordings/algebra-review.mp4',
          attendees: [
            {
              student_id: '1',
              student_name: 'Jane Mwangi',
              joined_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              left_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
              duration_minutes: 60,
              engagement_score: 92,
            },
            {
              student_id: '2',
              student_name: 'John Kamau',
              joined_at: new Date(Date.now() - 115 * 60 * 1000).toISOString(),
              left_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
              duration_minutes: 55,
              engagement_score: 78,
            },
            {
              student_id: '3',
              student_name: 'Sarah Wanjiru',
              joined_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              left_at: new Date(Date.now() - 70 * 60 * 1000).toISOString(),
              duration_minutes: 50,
              engagement_score: 85,
            },
          ],
          follow_ups: [
            {
              id: '1',
              title: 'Review quadratic equations',
              description: 'Student requested additional practice problems',
              assigned_to_student_id: '2',
              assigned_to_student_name: 'John Kamau',
              status: 'pending',
            },
            {
              id: '2',
              title: 'Upload session slides',
              description: 'Share presentation materials with all attendees',
              status: 'completed',
            },
          ],
          ai_summary:
            'Session covered linear equations, focusing on solving for variables and real-world applications. Students showed strong understanding of basic concepts but requested more practice with word problems. Key questions addressed: slope-intercept form, graphing techniques, and system of equations. Recommended follow-up: additional practice worksheets and one-on-one support for 2 students struggling with word problem translation.',
        });
      } else {
        setSession(response.data);
      }
    } catch (error) {
      console.error('Error fetching session details:', error);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    try {
      setGeneratingSummary(true);
      const response = await apiClient.post(
        `/api/v1/instructor/sessions/${sessionId}/ai-summary`,
        {}
      );

      if (session) {
        setSession({ ...session, ai_summary: response.data.summary });
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      alert('Failed to generate AI summary');
    } finally {
      setGeneratingSummary(false);
    }
  };

  const handleAddFollowUp = () => {
    // Navigate to follow-up creation or open modal
    alert('Follow-up creation feature coming soon');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 dark:text-white/60">Session not found</p>
      </div>
    );
  }

  const avgEngagement =
    session.attendees.reduce((sum, a) => sum + a.engagement_score, 0) /
    (session.attendees.length || 1);

  return (
    <div className="space-y-6">
      <InstructorPageHeader
        title={session.title}
        description={session.course_title || 'Live Session'}
        icon={
          <button
            onClick={() => navigate('/dashboard/instructor/sessions')}
            className="p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white" />
          </button>
        }
      />

      {/* Session Info */}
      <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-white/60 mb-1">Scheduled Time</p>
            <p className="text-gray-900 dark:text-white font-medium">
              {format(new Date(session.scheduled_start), 'MMM d, yyyy')}
            </p>
            <p className="text-gray-600 dark:text-white/80">
              {format(new Date(session.scheduled_start), 'h:mm a')} -{' '}
              {format(new Date(session.scheduled_end), 'h:mm a')}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 dark:text-white/60 mb-1">Attendance</p>
            <p className="text-gray-900 dark:text-white font-medium text-2xl">{session.attendees.length}</p>
            <p className="text-gray-500 dark:text-white/60 text-sm">students attended</p>
          </div>

          <div>
            <p className="text-sm text-gray-500 dark:text-white/60 mb-1">Avg Engagement</p>
            <p className="text-gray-900 dark:text-white font-medium text-2xl">{Math.round(avgEngagement)}%</p>
            <p className="text-gray-500 dark:text-white/60 text-sm">AI-calculated</p>
          </div>
        </div>

        {session.description && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10">
            <p className="text-sm text-gray-600 dark:text-white/80">{session.description}</p>
          </div>
        )}
      </div>

      {/* Recording */}
      {session.recording_url && (
        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Video className="w-5 h-5 text-purple-400" />
              Session Recording
            </h3>
            <a
              href={session.recording_url}
              download
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-gray-900 dark:text-white rounded-lg transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              Download
            </a>
          </div>
          <div className="bg-black/30 rounded-lg aspect-video flex items-center justify-center">
            <Video className="w-16 h-16 text-gray-400 dark:text-white/30" />
            <p className="text-gray-500 dark:text-white/60 ml-3">Recording available for download</p>
          </div>
        </div>
      )}

      {/* AI Summary */}
      <div className="bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-purple-500/20 border border-purple-500/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Session Summary</h3>
          {!session.ai_summary && (
            <button
              onClick={handleGenerateSummary}
              disabled={generatingSummary}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/50 text-gray-900 dark:text-white rounded-lg transition-colors text-sm"
            >
              {generatingSummary ? 'Generating...' : 'Generate Summary'}
            </button>
          )}
        </div>
        {session.ai_summary ? (
          <p className="text-gray-600 dark:text-white/80">{session.ai_summary}</p>
        ) : (
          <p className="text-gray-500 dark:text-white/60">No AI summary generated yet</p>
        )}
      </div>

      {/* Attendance Details */}
      <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-400" />
          Attendance Details
        </h3>

        <div className="space-y-3">
          {session.attendees.map((attendee) => (
            <div
              key={attendee.student_id}
              className="bg-gray-50 dark:bg-white/5 rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <span className="text-sm font-medium text-purple-300">
                    {attendee.student_name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-gray-900 dark:text-white font-medium">{attendee.student_name}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-white/60">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {attendee.duration_minutes} min
                    </span>
                    <span>Joined {format(new Date(attendee.joined_at), 'h:mm a')}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-white/60 mb-1">Engagement</p>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-100 dark:bg-white/10 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${attendee.engagement_score}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-900 dark:text-white font-medium">
                    {attendee.engagement_score}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Follow-up Tasks */}
      <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-purple-400" />
            Follow-up Tasks
          </h3>
          <button
            onClick={handleAddFollowUp}
            className="flex items-center gap-2 px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-gray-900 dark:text-white rounded-lg transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>

        {session.follow_ups.length === 0 ? (
          <p className="text-gray-500 dark:text-white/60 text-sm">No follow-up tasks yet</p>
        ) : (
          <div className="space-y-3">
            {session.follow_ups.map((task) => (
              <div
                key={task.id}
                className={`p-4 rounded-lg border ${
                  task.status === 'completed'
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-gray-900 dark:text-white font-medium mb-1">{task.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-white/60 mb-2">{task.description}</p>
                    {task.assigned_to_student_name && (
                      <p className="text-xs text-gray-400 dark:text-gray-300 dark:text-white/40">
                        Assigned to: {task.assigned_to_student_name}
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${
                      task.status === 'completed'
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-orange-500/20 text-orange-300'
                    }`}
                  >
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
