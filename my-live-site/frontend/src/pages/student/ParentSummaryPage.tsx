import React, { useState } from 'react';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { Share2, Download, Users, BookOpen, Award, TrendingUp, CheckCircle } from 'lucide-react';

const ParentSummaryPage: React.FC = () => {
  const { borderRadius } = useAgeAdaptiveUI();
  const [shared, setShared] = useState(false);

  const summary = {
    student: 'Kevin Ochieng',
    grade: 'Grade 7',
    period: 'Feb 1-14, 2026',
    coursesActive: 5,
    lessonsCompleted: 23,
    quizzesPassed: 8,
    avgScore: 82,
    streak: 15,
    xpEarned: 1240,
    topSubject: 'English',
    needsWork: 'Social Studies',
  };

  const handleShare = () => {
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Parent Summary</h1>
        <p className="text-gray-600 dark:text-white/70">A snapshot of your learning progress to share with parents</p>
      </div>

      <div className={`p-6 bg-gradient-to-br from-blue-500/20 to-purple-500/20 ${borderRadius} border border-blue-500/30`}>
        <div className="flex items-center gap-2 mb-1">
          <Users className="w-5 h-5 text-blue-400" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{summary.student}</h2>
        </div>
        <p className="text-gray-500 dark:text-white/60 text-sm">{summary.grade} · {summary.period}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Lessons Done', value: summary.lessonsCompleted, icon: BookOpen, color: 'text-blue-400' },
          { label: 'Quizzes Passed', value: summary.quizzesPassed, icon: Award, color: 'text-green-400' },
          { label: 'Avg Score', value: `${summary.avgScore}%`, icon: TrendingUp, color: 'text-purple-400' },
        ].map((stat) => (
          <div key={stat.label} className={`p-4 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] text-center`}>
            <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-1`} />
            <div className="text-gray-900 dark:text-white font-bold text-lg">{stat.value}</div>
            <div className="text-gray-400 dark:text-white/40 text-xs">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
        <h3 className="text-gray-900 dark:text-white font-semibold mb-3">Highlights</h3>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-white/70">
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Strongest subject: {summary.topSubject}</li>
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> {summary.streak}-day learning streak</li>
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Earned {summary.xpEarned} XP this period</li>
          <li className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-orange-400" /> Area to improve: {summary.needsWork}</li>
        </ul>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleShare}
          className={`flex-1 py-2.5 ${shared ? 'bg-green-600' : 'bg-[#FF0000] hover:bg-[#FF0000]/80'} text-gray-900 dark:text-white font-medium ${borderRadius} flex items-center justify-center gap-2`}
        >
          {shared ? <><CheckCircle className="w-4 h-4" /> Shared!</> : <><Share2 className="w-4 h-4" /> Share with Parent</>}
        </button>
        <button className={`px-4 py-2.5 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-900 dark:text-white ${borderRadius} flex items-center gap-2`}>
          <Download className="w-4 h-4" /> Download PDF
        </button>
      </div>
    </div>
  );
};

export default ParentSummaryPage;
