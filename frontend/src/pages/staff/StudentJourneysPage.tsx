import React, { useState } from 'react';
import { Search, Filter, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

const StudentJourneysPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'at-risk' | 'thriving' | 'needs-attention'>('all');

  const students = [
    { id: '1', name: 'John Kamau', grade: 'Grade 8', status: 'thriving', riskScore: 15, flags: 0 },
    { id: '2', name: 'Mary Wanjiku', grade: 'Grade 7', status: 'at-risk', riskScore: 75, flags: 3 },
    { id: '3', name: 'David Otieno', grade: 'Grade 9', status: 'needs-attention', riskScore: 45, flags: 1 },
  ];

  return (
    <div className="min-h-screen bg-[#0F1112] p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Student Journeys</h1>

        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search students..."
              className="w-full bg-[#181C1F] border border-[#22272B] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="bg-[#181C1F] border border-[#22272B] rounded-lg px-4 py-2.5 text-sm text-white"
          >
            <option value="all">All Students</option>
            <option value="at-risk">At Risk</option>
            <option value="thriving">Thriving</option>
            <option value="needs-attention">Needs Attention</option>
          </select>
        </div>

        <div className="grid gap-4">
          {students.map((student) => (
            <div
              key={student.id}
              className="bg-[#181C1F] border border-[#22272B] rounded-xl p-5 hover:border-[#E40000]/30 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#22272B] flex items-center justify-center text-white font-medium">
                    {student.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">{student.name}</h3>
                    <p className="text-sm text-white/50">{student.grade}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-white/40">Risk Score</p>
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
