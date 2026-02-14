import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  TrendingUp,
  AlertTriangle,
  Award,
  Search,
  Filter,
  ArrowUpDown,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface Student {
  id: string;
  name: string;
  grade: string;
  progress: number;
  completion_percent: number;
  risk: 'low' | 'medium' | 'high';
  risk_score: number;
  last_active: string;
  subjects_enrolled: number;
  avg_score: number;
  ai_sessions: number;
}

/* ------------------------------------------------------------------ */
/* Mock data                                                           */
/* ------------------------------------------------------------------ */

const MOCK_STUDENTS: Student[] = [
  { id: 'STU-001', name: 'Brian Otieno', grade: 'Grade 4', progress: 87, completion_percent: 82, risk: 'low', risk_score: 12, last_active: '2025-01-15T16:30:00Z', subjects_enrolled: 6, avg_score: 78, ai_sessions: 45 },
  { id: 'STU-002', name: 'Amina Wafula', grade: 'Grade 5', progress: 92, completion_percent: 91, risk: 'low', risk_score: 5, last_active: '2025-01-15T15:45:00Z', subjects_enrolled: 7, avg_score: 85, ai_sessions: 62 },
  { id: 'STU-003', name: 'Kevin Njoroge', grade: 'Grade 3', progress: 45, completion_percent: 38, risk: 'high', risk_score: 78, last_active: '2025-01-10T09:00:00Z', subjects_enrolled: 5, avg_score: 52, ai_sessions: 8 },
  { id: 'STU-004', name: 'Mercy Akinyi', grade: 'Grade 6', progress: 73, completion_percent: 68, risk: 'medium', risk_score: 35, last_active: '2025-01-14T11:20:00Z', subjects_enrolled: 7, avg_score: 67, ai_sessions: 28 },
  { id: 'STU-005', name: 'Dennis Kipchoge', grade: 'Grade 4', progress: 95, completion_percent: 94, risk: 'low', risk_score: 3, last_active: '2025-01-15T17:00:00Z', subjects_enrolled: 6, avg_score: 91, ai_sessions: 78 },
  { id: 'STU-006', name: 'Esther Wambui', grade: 'Grade 7', progress: 58, completion_percent: 52, risk: 'medium', risk_score: 42, last_active: '2025-01-13T14:00:00Z', subjects_enrolled: 8, avg_score: 61, ai_sessions: 19 },
  { id: 'STU-007', name: 'Samuel Mwangi', grade: 'Grade 5', progress: 34, completion_percent: 28, risk: 'high', risk_score: 85, last_active: '2025-01-08T10:30:00Z', subjects_enrolled: 6, avg_score: 44, ai_sessions: 5 },
  { id: 'STU-008', name: 'Joy Nyambura', grade: 'Grade 3', progress: 81, completion_percent: 76, risk: 'low', risk_score: 15, last_active: '2025-01-15T13:15:00Z', subjects_enrolled: 5, avg_score: 74, ai_sessions: 38 },
  { id: 'STU-009', name: 'Collins Ochieng', grade: 'Grade 8', progress: 66, completion_percent: 60, risk: 'medium', risk_score: 38, last_active: '2025-01-14T08:45:00Z', subjects_enrolled: 8, avg_score: 63, ai_sessions: 22 },
  { id: 'STU-010', name: 'Faith Chebet', grade: 'Grade 6', progress: 88, completion_percent: 85, risk: 'low', risk_score: 8, last_active: '2025-01-15T16:00:00Z', subjects_enrolled: 7, avg_score: 82, ai_sessions: 55 },
  { id: 'STU-011', name: 'Isaac Karanja', grade: 'Grade 4', progress: 42, completion_percent: 35, risk: 'high', risk_score: 72, last_active: '2025-01-11T10:00:00Z', subjects_enrolled: 6, avg_score: 48, ai_sessions: 10 },
  { id: 'STU-012', name: 'Lydia Auma', grade: 'Grade 7', progress: 76, completion_percent: 71, risk: 'low', risk_score: 18, last_active: '2025-01-15T12:30:00Z', subjects_enrolled: 8, avg_score: 72, ai_sessions: 41 },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const riskColors: Record<string, string> = {
  low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const formatDate = (iso: string): string => {
  const diff = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.round(diff / 60)}h ago`;
  return `${Math.round(diff / 1440)}d ago`;
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const StudentProgressPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'progress' | 'risk' | 'last_active'>('name');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const totalStudents = MOCK_STUDENTS.length;
  const onTrack = MOCK_STUDENTS.filter((s) => s.risk === 'low').length;
  const atRisk = MOCK_STUDENTS.filter((s) => s.risk === 'high').length;
  const excelling = MOCK_STUDENTS.filter((s) => s.progress >= 90).length;

  const filteredStudents = MOCK_STUDENTS
    .filter((s) => {
      const matchesSearch = !search || s.name.toLowerCase().includes(search.toLowerCase());
      const matchesGrade = !gradeFilter || s.grade === gradeFilter;
      return matchesSearch && matchesGrade;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'progress': return b.progress - a.progress;
        case 'risk': return b.risk_score - a.risk_score;
        case 'last_active': return new Date(b.last_active).getTime() - new Date(a.last_active).getTime();
        default: return 0;
      }
    });

  const grades = [...new Set(MOCK_STUDENTS.map((s) => s.grade))].sort();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-16 bg-[#22272B] rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-[#22272B] rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-40 bg-[#22272B] rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Student Progress</h1>
          <p className="text-sm text-white/50 mt-1">Monitor student engagement, progress, and risk indicators</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-white/40" />
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="px-3 py-2 bg-[#181C1F] border border-[#22272B] rounded-lg text-white text-sm focus:outline-none focus:border-[#E40000]/50 appearance-none cursor-pointer"
          >
            <option value="">All Grades</option>
            {grades.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: totalStudents, icon: Users, color: 'text-blue-400' },
          { label: 'On Track', value: onTrack, icon: TrendingUp, color: 'text-emerald-400' },
          { label: 'At Risk', value: atRisk, icon: AlertTriangle, color: 'text-red-400' },
          { label: 'Excelling', value: excelling, icon: Award, color: 'text-yellow-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#181C1F] border border-[#22272B] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/50 text-xs font-medium">{stat.label}</span>
              <div className={`p-1.5 bg-[#22272B] rounded-lg ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Search and Sort */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#181C1F] border border-[#22272B] rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#E40000]/50 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-white/40" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-2.5 bg-[#181C1F] border border-[#22272B] rounded-lg text-white text-sm focus:outline-none focus:border-[#E40000]/50 appearance-none cursor-pointer"
          >
            <option value="name">Sort by Name</option>
            <option value="progress">Sort by Progress</option>
            <option value="risk">Sort by Risk Score</option>
            <option value="last_active">Sort by Last Active</option>
          </select>
        </div>
      </motion.div>

      {/* Student Cards Grid */}
      {filteredStudents.length === 0 ? (
        <motion.div variants={itemVariants} className="text-center py-16">
          <Users className="w-12 h-12 text-white/10 mx-auto mb-3" />
          <p className="text-white/40 text-sm">No students found matching your criteria</p>
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className="bg-[#181C1F] border border-[#22272B] rounded-xl p-4 hover:border-[#333] transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#22272B] flex items-center justify-center text-sm font-bold text-white/60">
                    {student.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white">{student.name}</h4>
                    <p className="text-xs text-white/40">{student.grade}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border capitalize ${riskColors[student.risk]}`}>
                  {student.risk === 'high' ? 'At Risk' : student.risk === 'medium' ? 'Watch' : 'On Track'}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-white/40">Overall Progress</span>
                  <span className="text-[10px] font-medium text-white">{student.completion_percent}%</span>
                </div>
                <div className="h-2 bg-[#22272B] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      student.progress >= 80 ? 'bg-emerald-400' : student.progress >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                    }`}
                    style={{ width: `${student.progress}%` }}
                  />
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xs font-medium text-white">{student.avg_score}%</p>
                  <p className="text-[10px] text-white/30">Avg Score</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-white">{student.ai_sessions}</p>
                  <p className="text-[10px] text-white/30">AI Sessions</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-white">{student.subjects_enrolled}</p>
                  <p className="text-[10px] text-white/30">Subjects</p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-[#22272B] flex items-center justify-between">
                <span className="text-[10px] text-white/30">Last active: {formatDate(student.last_active)}</span>
                <span className="text-[10px] text-white/20 font-mono">{student.id}</span>
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default StudentProgressPage;
