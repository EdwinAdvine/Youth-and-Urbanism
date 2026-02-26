import React, { useEffect, useState } from 'react';
import { Search, Flag, Award, Heart, Send, User } from 'lucide-react';
import { InstructorPageHeader } from '../../components/instructor/shared/InstructorPageHeader';
import apiClient from '../../services/api';


interface Student {
  id: string;
  name: string;
  avatar?: string;
  recent_flags: number;
  recent_celebrations: number;
}

export const InterventionsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [actionType, setActionType] = useState<'flag' | 'celebrate' | 'message'>('flag');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/v1/instructor/students');

      // Mock data for development
      if (!response.data || response.data.length === 0) {
        setStudents([
          {
            id: '1',
            name: 'Jane Mwangi',
            recent_flags: 0,
            recent_celebrations: 3,
          },
          {
            id: '2',
            name: 'John Kamau',
            recent_flags: 2,
            recent_celebrations: 0,
          },
          {
            id: '3',
            name: 'Sarah Wanjiru',
            recent_flags: 0,
            recent_celebrations: 5,
          },
          {
            id: '4',
            name: 'David Omondi',
            recent_flags: 1,
            recent_celebrations: 1,
          },
          {
            id: '5',
            name: 'Grace Akinyi',
            recent_flags: 0,
            recent_celebrations: 7,
          },
        ]);
      } else {
        setStudents(response.data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAction = async () => {
    if (!selectedStudent || !reason.trim()) {
      alert('Please select a student and provide a reason');
      return;
    }

    try {
      setSubmitting(true);
      const endpoint =
        actionType === 'flag'
          ? `/api/v1/instructor/students/${selectedStudent.id}/flag`
          : `/api/v1/instructor/students/${selectedStudent.id}/celebrate`;

      await apiClient.post(
        endpoint,
        {
          reason: reason.trim(),
          message: message.trim() || undefined,
        }
      );

      alert(
        `Successfully ${
          actionType === 'flag' ? 'flagged' : 'celebrated'
        } ${selectedStudent.name}!`
      );

      // Reset form
      setReason('');
      setMessage('');
      setSelectedStudent(null);
      fetchStudents();
    } catch (error) {
      console.error('Error submitting action:', error);
      alert('Failed to submit action');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const flagReasons = [
    'Declining engagement',
    'Missing assignments',
    'Low test scores',
    'Not participating in discussions',
    'Technical difficulties',
    'Needs extra support',
    'Other',
  ];

  const celebrationReasons = [
    'Perfect score on assessment',
    'Significant improvement',
    'Helpful to peers',
    'Consistent effort',
    'Creative solution',
    'Course completion',
    'Other',
  ];

  const actionIcons = {
    flag: Flag,
    celebrate: Award,
    message: Send,
  };

  const actionColors = {
    flag: 'bg-red-500/10 text-red-400 border-red-500/30',
    celebrate: 'bg-green-500/10 text-green-400 border-green-500/30',
    message: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  };

  const ActionIcon = actionIcons[actionType];

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
        title="Student Interventions"
        description="Flag struggling students or celebrate achievements"
        icon={<Heart className="w-6 h-6 text-purple-400" />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Students List */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
            {/* Search */}
            <div className="p-4 border-b border-gray-200 dark:border-white/10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-300 dark:text-white/40" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-purple-500/50"
                />
              </div>
            </div>

            {/* Student List */}
            <div className="max-h-[600px] overflow-y-auto">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className={`p-4 border-b border-gray-200 dark:border-white/10 cursor-pointer transition-colors ${
                    selectedStudent?.id === student.id
                      ? 'bg-purple-500/10'
                      : 'hover:bg-gray-50 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                      {student.avatar ? (
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-purple-400" />
                      )}
                    </div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{student.name}</h4>
                  </div>

                  <div className="flex items-center gap-3 ml-13">
                    {student.recent_flags > 0 && (
                      <div className="flex items-center gap-1 text-xs text-red-400">
                        <Flag className="w-3 h-3" />
                        <span>{student.recent_flags} flags</span>
                      </div>
                    )}
                    {student.recent_celebrations > 0 && (
                      <div className="flex items-center gap-1 text-xs text-green-400">
                        <Award className="w-3 h-3" />
                        <span>{student.recent_celebrations} celebrations</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Form */}
        <div className="lg:col-span-2">
          {selectedStudent ? (
            <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-6 space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {selectedStudent.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-white/60">
                  Select an action to take with this student
                </p>
              </div>

              {/* Action Type Selector */}
              <div className="flex gap-3">
                <button
                  onClick={() => setActionType('flag')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-colors ${
                    actionType === 'flag'
                      ? 'bg-red-500/20 border-red-500/30 text-red-300'
                      : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/10'
                  }`}
                >
                  <Flag className="w-5 h-5" />
                  Flag for Help
                </button>

                <button
                  onClick={() => setActionType('celebrate')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-colors ${
                    actionType === 'celebrate'
                      ? 'bg-green-500/20 border-green-500/30 text-green-300'
                      : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/10'
                  }`}
                >
                  <Award className="w-5 h-5" />
                  Celebrate
                </button>
              </div>

              {/* Reason Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-white/80 mb-2">
                  Reason *
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50"
                >
                  <option value="">Select a reason</option>
                  {(actionType === 'flag' ? flagReasons : celebrationReasons).map(
                    (r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-white/80 mb-2">
                  Personal Message (Optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    actionType === 'flag'
                      ? 'Add a note about what support the student needs...'
                      : 'Add a personalized congratulatory message...'
                  }
                  rows={4}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-purple-500/50 resize-none"
                />
              </div>

              {/* Preview */}
              {reason && (
                <div
                  className={`p-4 rounded-lg border ${actionColors[actionType]}`}
                >
                  <div className="flex items-start gap-3">
                    <ActionIcon className="w-5 h-5 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Preview</p>
                      <p className="text-sm text-gray-600 dark:text-white/80 mb-2">
                        {actionType === 'flag' ? 'Flag:' : 'Celebration:'}{' '}
                        {reason}
                      </p>
                      {message && (
                        <p className="text-sm text-gray-600 dark:text-white/70 italic">
                          "{message}"
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmitAction}
                disabled={!reason || submitting}
                className="w-full px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/50 disabled:cursor-not-allowed text-gray-900 dark:text-white rounded-lg transition-colors font-medium"
              >
                {submitting
                  ? 'Submitting...'
                  : actionType === 'flag'
                  ? 'Submit Flag'
                  : 'Send Celebration'}
              </button>

              {/* Info Box */}
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                <p className="text-sm text-purple-200">
                  <strong>What happens next?</strong>
                  <br />
                  {actionType === 'flag' ? (
                    <>
                      The student will be marked for intervention. You'll receive AI-powered
                      suggestions for support strategies, and the student may be assigned
                      additional resources or one-on-one sessions.
                    </>
                  ) : (
                    <>
                      The student will receive a notification with your message and earn bonus
                      points. This positive reinforcement helps build confidence and motivation.
                    </>
                  )}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-12 text-center">
              <Heart className="w-16 h-16 text-gray-400 dark:text-white/30 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-white/60">
                Select a student from the list to flag for help or celebrate their achievements
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
