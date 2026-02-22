import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { getAtRiskLearners } from '../../services/staff/staffStudentService';

interface StudentJourneyItem {
  id: string;
  name: string;
  grade: string;
  status: 'thriving' | 'at-risk' | 'needs-attention';
  riskScore: number;
  flags: number;
}

const FALLBACK_STUDENTS: StudentJourneyItem[] = [
  { id: '1', name: 'John Kamau', grade: 'Grade 8', status: 'thriving', riskScore: 15, flags: 0 },
  { id: '2', name: 'Mary Wanjiku', grade: 'Grade 7', status: 'at-risk', riskScore: 75, flags: 3 },
  { id: '3', name: 'David Otieno', grade: 'Grade 9', status: 'needs-attention', riskScore: 45, flags: 1 },
];

const StudentJourneysPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'at-risk' | 'thriving' | 'needs-attention'>('all');
  const [students, setStudents] = useState<StudentJourneyItem[]>(FALLBACK_STUDENTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getAtRiskLearners({ page: 1, page_size: 50 });
        if (response.items && response.items.length > 0) {
          setStudents(response.items.map((item) => ({
            id: item.student_id,
            name: item.student_name,
            grade: 'Grade ' + (item.learning_style || '?'),
            status: item.risk_level === 'high' || item.risk_level === 'critical' ? 'at-risk' :
                    item.risk_level === 'medium' ? 'needs-attention' : 'thriving',
            riskScore: item.risk_level === 'critical' ? 90 : item.risk_level === 'high' ? 75 :
                       item.risk_level === 'medium' ? 45 : 15,
            flags: item.risk_factors?.length || 0,
          })));
        }
      } catch (err) {
        console.warn('[StudentJourneys] API unavailable, using fallback data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredStudents = students.filter((s) => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus !== 'all' && s.status !== filterStatus) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F1112] p-6">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="h-8 w-48 bg-white dark:bg-[#181C1F] rounded animate-pulse" />
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-white dark:bg-[#181C1F] rounded-xl border border-gray-200 dark:border-[#22272B] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F1112] p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Student Journeys</h1>

        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search students..."
              className="w-full bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-white/30"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white"
          >
            <option value="all">All Students</option>
            <option value="at-risk">At Risk</option>
            <option value="thriving">Thriving</option>
            <option value="needs-attention">Needs Attention</option>
          </select>
        </div>

        <div className="grid gap-4">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5 hover:border-[#E40000]/30 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-[#22272B] flex items-center justify-center text-gray-900 dark:text-white font-medium">
                    {student.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">{student.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-white/50">{student.grade}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-gray-400 dark:text-white/40">Risk Score</p>
                    <p className={`text-lg font-bold ${
                      student.riskScore >= 70 ? 'text-red-400' :
                      student.riskScore >= 40 ? 'text-yellow-400' : 'text-green-400'
                    }`}>{student.riskScore}</p>
                  </div>
                  {student.status === 'thriving' && <CheckCircle className="w-5 h-5 text-green-400" />}
                  {student.status === 'at-risk' && <AlertTriangle className="w-5 h-5 text-red-400" />}
                  {student.status === 'needs-attention' && <TrendingUp className="w-5 h-5 text-yellow-400" />}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentJourneysPage;
