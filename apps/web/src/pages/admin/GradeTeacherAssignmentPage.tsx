// GradeTeacherAssignmentPage - Admin page at /dashboard/admin/grade-assignments.
// Assigns class teachers to grade levels and subject department heads to learning areas.
// These assignments populate the teacher dropdown in the student Teacher Collaboration page.
import React, { useState, useEffect } from 'react';
import {
  Users, Plus, Trash2, AlertCircle, Loader2, GraduationCap, BookOpen,
} from 'lucide-react';
import apiClient from '../../services/api';

const API = '/api/v1/admin/grade-assignments';

const GRADE_LEVELS = [
  'ECD 1', 'ECD 2',
  'Grade 1', 'Grade 2', 'Grade 3',
  'Grade 4', 'Grade 5', 'Grade 6',
  'Grade 7', 'Grade 8', 'Grade 9',
  'Grade 10', 'Grade 11', 'Grade 12',
];

const LEARNING_AREAS = [
  'Mathematics', 'English', 'Kiswahili', 'Science & Technology',
  'Social Studies', 'Religious Education', 'Creative Arts',
  'Physical & Health Education', 'Pre-Technical Studies',
  'Agriculture & Nutrition', 'Life Skills',
];

interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface GradeTeacher {
  id: string;
  grade_level: string;
  staff_user_id: string;
  staff_name: string;
  academic_year: string;
}

interface SubjectHead {
  id: string;
  learning_area: string;
  staff_user_id: string;
  staff_name: string;
  academic_year: string;
}

const GradeTeacherAssignmentPage: React.FC = () => {
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([]);
  const [gradeTeachers, setGradeTeachers] = useState<GradeTeacher[]>([]);
  const [subjectHeads, setSubjectHeads] = useState<SubjectHead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Grade teacher form
  const [gtGrade, setGtGrade] = useState('');
  const [gtStaff, setGtStaff] = useState('');
  const [gtYear, setGtYear] = useState('2026');
  const [gtSaving, setGtSaving] = useState(false);
  const [gtError, setGtError] = useState<string | null>(null);

  // Subject head form
  const [shArea, setShArea] = useState('');
  const [shStaff, setShStaff] = useState('');
  const [shYear, setShYear] = useState('2026');
  const [shSaving, setShSaving] = useState(false);
  const [shError, setShError] = useState<string | null>(null);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [staffRes, gtRes, shRes] = await Promise.all([
        apiClient.get(`${API}/staff-users`),
        apiClient.get(`${API}/grade-teachers`),
        apiClient.get(`${API}/subject-heads`),
      ]);
      setStaffUsers(staffRes.data);
      setGradeTeachers(gtRes.data);
      setSubjectHeads(shRes.data);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } }; message?: string };
      setError(e?.response?.data?.detail || e?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const assignGradeTeacher = async () => {
    if (!gtGrade || !gtStaff) return;
    setGtSaving(true);
    setGtError(null);
    try {
      await apiClient.post(`${API}/grade-teachers`, {
        grade_level: gtGrade,
        staff_user_id: gtStaff,
        academic_year: gtYear,
      });
      setGtGrade('');
      setGtStaff('');
      await loadAll();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } }; message?: string };
      setGtError(e?.response?.data?.detail || e?.message || 'Failed to assign');
    } finally {
      setGtSaving(false);
    }
  };

  const removeGradeTeacher = async (id: string) => {
    try {
      await apiClient.delete(`${API}/grade-teachers/${id}`);
      setGradeTeachers(prev => prev.filter(g => g.id !== id));
    } catch {
      // Reload to sync
      await loadAll();
    }
  };

  const assignSubjectHead = async () => {
    if (!shArea || !shStaff) return;
    setShSaving(true);
    setShError(null);
    try {
      await apiClient.post(`${API}/subject-heads`, {
        learning_area: shArea,
        staff_user_id: shStaff,
        academic_year: shYear,
      });
      setShArea('');
      setShStaff('');
      await loadAll();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } }; message?: string };
      setShError(e?.response?.data?.detail || e?.message || 'Failed to assign');
    } finally {
      setShSaving(false);
    }
  };

  const removeSubjectHead = async (id: string) => {
    try {
      await apiClient.delete(`${API}/subject-heads/${id}`);
      setSubjectHeads(prev => prev.filter(s => s.id !== id));
    } catch {
      await loadAll();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <Users className="w-8 h-8 text-blue-400" /> Grade & Subject Assignments
        </h1>
        <p className="text-gray-600 dark:text-white/70">
          Assign class teachers to grade levels and subject department heads to learning areas.
          These teachers appear in the student Teacher Collaboration page.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={loadAll} className="ml-auto underline text-xs">Retry</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ── Grade Class Teachers ─────────────────────────────────── */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-green-400" /> Class Teachers by Grade
          </h2>

          {/* Assign form */}
          <div className="p-4 bg-white dark:bg-[#181C1F] rounded-xl border border-gray-200 dark:border-[#22272B] space-y-3">
            <select
              value={gtGrade}
              onChange={e => setGtGrade(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#22272B] rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 text-sm"
            >
              <option value="">Select grade level…</option>
              {GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <select
              value={gtStaff}
              onChange={e => setGtStaff(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#22272B] rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 text-sm"
            >
              <option value="">Select staff member…</option>
              {staffUsers.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
              ))}
            </select>
            <input
              type="text"
              value={gtYear}
              onChange={e => setGtYear(e.target.value)}
              placeholder="Academic year (e.g. 2026)"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#22272B] rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 text-sm"
            />
            {gtError && <p className="text-red-400 text-xs">{gtError}</p>}
            <button
              onClick={assignGradeTeacher}
              disabled={gtSaving || !gtGrade || !gtStaff}
              className="w-full py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white rounded-lg flex items-center justify-center gap-2 text-sm"
            >
              {gtSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Assign Class Teacher
            </button>
          </div>

          {/* List */}
          <div className="space-y-2">
            {gradeTeachers.length === 0 && (
              <p className="text-gray-400 dark:text-white/40 text-sm">No assignments yet.</p>
            )}
            {gradeTeachers.map(gt => (
              <div key={gt.id} className="p-3 bg-white dark:bg-[#181C1F] rounded-xl border border-gray-200 dark:border-[#22272B] flex items-center justify-between">
                <div>
                  <p className="text-gray-900 dark:text-white text-sm font-medium">{gt.grade_level}</p>
                  <p className="text-gray-500 dark:text-white/50 text-xs">{gt.staff_name} · {gt.academic_year}</p>
                </div>
                <button
                  onClick={() => removeGradeTeacher(gt.id)}
                  className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Remove assignment"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── Subject Department Heads ──────────────────────────────── */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-400" /> Subject Department Heads
          </h2>

          {/* Assign form */}
          <div className="p-4 bg-white dark:bg-[#181C1F] rounded-xl border border-gray-200 dark:border-[#22272B] space-y-3">
            <select
              value={shArea}
              onChange={e => setShArea(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#22272B] rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 text-sm"
            >
              <option value="">Select learning area…</option>
              {LEARNING_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <select
              value={shStaff}
              onChange={e => setShStaff(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#22272B] rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 text-sm"
            >
              <option value="">Select staff member…</option>
              {staffUsers.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
              ))}
            </select>
            <input
              type="text"
              value={shYear}
              onChange={e => setShYear(e.target.value)}
              placeholder="Academic year (e.g. 2026)"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#22272B] rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 text-sm"
            />
            {shError && <p className="text-red-400 text-xs">{shError}</p>}
            <button
              onClick={assignSubjectHead}
              disabled={shSaving || !shArea || !shStaff}
              className="w-full py-2 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white rounded-lg flex items-center justify-center gap-2 text-sm"
            >
              {shSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Assign Subject Head
            </button>
          </div>

          {/* List */}
          <div className="space-y-2">
            {subjectHeads.length === 0 && (
              <p className="text-gray-400 dark:text-white/40 text-sm">No assignments yet.</p>
            )}
            {subjectHeads.map(sh => (
              <div key={sh.id} className="p-3 bg-white dark:bg-[#181C1F] rounded-xl border border-gray-200 dark:border-[#22272B] flex items-center justify-between">
                <div>
                  <p className="text-gray-900 dark:text-white text-sm font-medium">{sh.learning_area}</p>
                  <p className="text-gray-500 dark:text-white/50 text-xs">{sh.staff_name} · {sh.academic_year}</p>
                </div>
                <button
                  onClick={() => removeSubjectHead(sh.id)}
                  className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Remove assignment"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradeTeacherAssignmentPage;
