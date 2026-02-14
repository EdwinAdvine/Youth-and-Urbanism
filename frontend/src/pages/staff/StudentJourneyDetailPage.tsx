import React from 'react';
import { ArrowLeft, TrendingUp, AlertTriangle, CheckCircle, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentJourneyDetailPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0F1112] p-6">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/60 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Journeys
        </button>

        <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#22272B] flex items-center justify-center text-xl text-white font-medium">
                JK
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">John Kamau</h1>
                <p className="text-sm text-white/50">Grade 8 • Student ID: STU001</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-white/40">Risk Score</p>
                <p className="text-2xl font-bold text-green-400">15</p>
              </div>
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-[#22272B]/50 rounded-lg">
              <p className="text-xs text-white/40 mb-1">Attendance</p>
              <p className="text-2xl font-bold text-white">95%</p>
            </div>
            <div className="p-4 bg-[#22272B]/50 rounded-lg">
              <p className="text-xs text-white/40 mb-1">Avg Performance</p>
              <p className="text-2xl font-bold text-white">87%</p>
            </div>
            <div className="p-4 bg-[#22272B]/50 rounded-lg">
              <p className="text-xs text-white/40 mb-1">Engagement</p>
              <p className="text-2xl font-bold text-white">High</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentJourneyDetailPage;
