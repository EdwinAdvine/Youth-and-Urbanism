// TeacherCollabPage - Student page at /dashboard/student/ai-tutor/teacher-collab.
// Students ask questions to their assigned class teacher or subject department heads.
// Teachers are loaded from the backend based on the student's grade + enrolled subjects.
import React, { useState, useEffect } from 'react';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import {
  getAvailableTeachers,
  getTeacherQuestions,
  sendTeacherQuestion,
} from '../../services/student/studentAIService';
import {
  Users, Send, MessageCircle, Clock, CheckCircle,
  AlertCircle, Bot, Loader2,
} from 'lucide-react';

interface AvailableTeacher {
  id: string;
  name: string;
  role: 'class_teacher' | 'subject_head';
  subject: string | null;
  label: string;
}

interface TeacherThread {
  id: string;
  question: string;
  ai_summary: string | null;
  answer: string | null;
  teacher_name: string;
  status: 'pending' | 'answered';
  created_at: string;
  answered_at: string | null;
}

const TeacherCollabPage: React.FC = () => {
  const { borderRadius } = useAgeAdaptiveUI();

  const [teachers, setTeachers] = useState<AvailableTeacher[]>([]);
  const [teachersLoading, setTeachersLoading] = useState(true);

  const [threads, setThreads] = useState<TeacherThread[]>([]);
  const [threadsLoading, setThreadsLoading] = useState(true);
  const [threadsError, setThreadsError] = useState<string | null>(null);

  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  useEffect(() => {
    loadTeachers();
    loadThreads();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTeachers = async () => {
    setTeachersLoading(true);
    try {
      const data = await getAvailableTeachers();
      setTeachers(data);
    } catch {
      // Non-fatal — keep empty list
    } finally {
      setTeachersLoading(false);
    }
  };

  const loadThreads = async () => {
    setThreadsLoading(true);
    setThreadsError(null);
    try {
      const data = await getTeacherQuestions();
      setThreads(data);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } }; message?: string };
      setThreadsError(e?.response?.data?.detail || e?.message || 'Failed to load questions.');
    } finally {
      setThreadsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!newQuestion.trim() || !selectedTeacher) return;
    setSending(true);
    setSendError(null);
    try {
      await sendTeacherQuestion({ teacher_id: selectedTeacher, question: newQuestion });
      setNewQuestion('');
      setSelectedTeacher('');
      await loadThreads();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } }; message?: string };
      setSendError(e?.response?.data?.detail || e?.message || 'Failed to send question.');
    } finally {
      setSending(false);
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  const answeredCount = threads.filter(t => t.status === 'answered').length;
  const pendingCount = threads.filter(t => t.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <Users className="w-8 h-8 text-blue-400" /> Teacher Collaboration
        </h1>
        <p className="text-gray-600 dark:text-white/70">Ask questions and get answers from your teachers</p>
      </div>

      {/* Ask New Question */}
      <div className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
        <h3 className="text-gray-900 dark:text-white font-medium mb-3">Ask a Teacher</h3>
        <div className="space-y-3">
          <select
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
            disabled={teachersLoading}
            className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 disabled:opacity-60`}
          >
            <option value="" className="bg-white dark:bg-[#181C1F]">
              {teachersLoading
                ? 'Loading teachers…'
                : teachers.length === 0
                ? 'No teachers assigned yet'
                : 'Select a teacher…'}
            </option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id} className="bg-white dark:bg-[#181C1F]">
                {t.label}
              </option>
            ))}
          </select>

          <textarea
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="Type your question here…"
            rows={3}
            className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-blue-500 resize-none`}
          />

          {sendError && (
            <div className={`p-3 bg-red-500/10 border border-red-500/20 ${borderRadius} flex items-center gap-2 text-red-400 text-sm`}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{sendError}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-400 dark:text-white/40 text-xs">
              <Bot className="w-3 h-3" />
              <span>AI will summarise your question for the teacher</span>
            </div>
            <button
              onClick={handleSend}
              disabled={sending || !newQuestion.trim() || !selectedTeacher}
              className={`px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-100 dark:disabled:bg-white/10 disabled:text-gray-400 dark:disabled:text-white/30 text-white ${borderRadius} flex items-center gap-2 text-sm`}
            >
              {sending
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                : <><Send className="w-4 h-4" /> Send Question</>}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className={`p-3 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] text-center`}>
          <div className="text-green-400 font-bold text-lg">{answeredCount}</div>
          <div className="text-gray-400 dark:text-white/40 text-xs">Answered</div>
        </div>
        <div className={`p-3 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] text-center`}>
          <div className="text-yellow-400 font-bold text-lg">{pendingCount}</div>
          <div className="text-gray-400 dark:text-white/40 text-xs">Pending</div>
        </div>
        <div className={`p-3 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] text-center`}>
          <div className="text-blue-400 font-bold text-lg">{threads.length}</div>
          <div className="text-gray-400 dark:text-white/40 text-xs">Total</div>
        </div>
      </div>

      {/* Threads */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Your Questions</h2>

        {threadsLoading && (
          <div className={`p-8 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] flex items-center justify-center gap-2 text-gray-500 dark:text-white/60`}>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading questions…</span>
          </div>
        )}

        {threadsError && (
          <div className={`p-3 bg-red-500/10 border border-red-500/20 ${borderRadius} flex items-center gap-2 text-red-400 text-sm mb-3`}>
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{threadsError}</span>
            <button onClick={loadThreads} className="ml-auto text-red-400 hover:text-red-300 text-xs underline">Retry</button>
          </div>
        )}

        {!threadsLoading && !threadsError && threads.length === 0 && (
          <div className={`p-8 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] text-center text-gray-500 dark:text-white/50`}>
            <MessageCircle className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-white/20" />
            <p>No questions yet. Ask your first question above!</p>
          </div>
        )}

        {!threadsLoading && threads.length > 0 && (
          <div className="space-y-3">
            {threads.map((thread) => {
              const isAnswered = thread.status === 'answered';
              return (
                <div key={thread.id} className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 text-xs ${borderRadius} ${isAnswered ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {isAnswered ? 'Answered' : 'Pending'}
                    </span>
                    <span className="text-gray-400 dark:text-white/40 text-xs">{formatDate(thread.created_at)}</span>
                  </div>

                  {thread.teacher_name && (
                    <p className="text-gray-700 dark:text-white/80 text-sm mb-2">
                      <span className="text-gray-400 dark:text-white/40">To: </span>
                      <span className="text-gray-900 dark:text-white font-medium">{thread.teacher_name}</span>
                    </p>
                  )}

                  <div className={`p-3 bg-gray-50 dark:bg-white/5 ${borderRadius} mb-2`}>
                    <div className="flex items-start gap-2">
                      <MessageCircle className="w-4 h-4 text-gray-400 dark:text-white/40 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-600 dark:text-white/70 text-sm">{thread.question}</p>
                    </div>
                  </div>

                  {thread.ai_summary && (
                    <div className={`p-2 bg-purple-500/10 ${borderRadius} mb-2 flex items-start gap-2`}>
                      <Bot className="w-3 h-3 text-purple-400 flex-shrink-0 mt-0.5" />
                      <p className="text-purple-300 text-xs">{thread.ai_summary}</p>
                    </div>
                  )}

                  {isAnswered && thread.answer ? (
                    <div className={`p-3 bg-green-500/10 ${borderRadius} flex items-start gap-2`}>
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-green-400 text-xs font-medium mb-1">
                          {thread.teacher_name ? `${thread.teacher_name}'s Response` : 'Teacher Response'}
                        </p>
                        <p className="text-gray-600 dark:text-white/70 text-sm">{thread.answer}</p>
                      </div>
                    </div>
                  ) : (
                    <div className={`p-3 bg-yellow-500/10 ${borderRadius} flex items-center gap-2`}>
                      <Clock className="w-4 h-4 text-yellow-400" />
                      <p className="text-yellow-300 text-sm">Waiting for teacher response…</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherCollabPage;
