import React, { useState, useEffect } from 'react';
import ViewToggle from '../../components/staff/dashboard/ViewToggle';
import StaffBentoGrid from '../../components/staff/dashboard/StaffBentoGrid';
import UrgentTicketsCard from '../../components/staff/dashboard/UrgentTicketsCard';
import ModerationQueueCard from '../../components/staff/dashboard/ModerationQueueCard';
import AIAgendaCard from '../../components/staff/dashboard/AIAgendaCard';
import TasksDeadlinesCard from '../../components/staff/dashboard/TasksDeadlinesCard';
import StudentFlagsCard from '../../components/staff/dashboard/StudentFlagsCard';
import AnomaliesCard from '../../components/staff/dashboard/AnomaliesCard';

interface StatCard {
  label: string;
  value: number;
  change: number;
  changeLabel: string;
  icon: string;
}

interface UrgentTicket {
  id: string;
  subject: string;
  priority: 'critical' | 'high' | 'medium';
  slaRemaining: string;
  assignedTo: string;
}

interface ModerationItem {
  id: string;
  contentTitle: string;
  type: string;
  riskScore: number;
  flagSource: 'ai' | 'user' | 'system';
  createdAt: string;
}

interface AgendaItem {
  id: string;
  title: string;
  time: string;
  type: 'review' | 'meeting' | 'deadline' | 'followup';
  priority: 'high' | 'medium' | 'low';
}

interface TaskItem {
  id: string;
  title: string;
  deadline: string;
  status: 'overdue' | 'due_today' | 'upcoming';
  category: string;
}

interface StudentFlag {
  id: string;
  studentName: string;
  grade: string;
  riskScore: number;
  flagType: string;
  lastActivity: string;
}

interface Anomaly {
  id: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  detectedAt: string;
  category: string;
}

const StaffDashboardPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'bento' | 'list'>('bento');

  const [stats, setStats] = useState<StatCard[]>([]);
  const [urgentTickets, setUrgentTickets] = useState<UrgentTicket[]>([]);
  const [moderationQueue, setModerationQueue] = useState<ModerationItem[]>([]);
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [studentFlags, setStudentFlags] = useState<StudentFlag[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStats([
        { label: 'Open Tickets', value: 23, change: -3, changeLabel: 'from yesterday', icon: 'ticket' },
        { label: 'Moderation Queue', value: 8, change: 2, changeLabel: 'new today', icon: 'shield' },
        { label: 'Pending Approvals', value: 14, change: 0, changeLabel: 'unchanged', icon: 'check' },
        { label: 'Active Sessions', value: 342, change: 18, changeLabel: 'vs last hour', icon: 'users' },
      ]);
      setUrgentTickets([
        { id: 'TK-2024-0089', subject: 'Payment gateway timeout affecting 12 families', priority: 'critical', slaRemaining: '1h 23m', assignedTo: 'James K.' },
        { id: 'TK-2024-0091', subject: 'Student unable to access Grade 7 CBC content', priority: 'high', slaRemaining: '3h 45m', assignedTo: 'Unassigned' },
        { id: 'TK-2024-0087', subject: 'AI tutor generating incorrect Kiswahili translations', priority: 'critical', slaRemaining: '0h 42m', assignedTo: 'Sarah M.' },
        { id: 'TK-2024-0093', subject: 'Parent dashboard showing wrong student data', priority: 'high', slaRemaining: '5h 10m', assignedTo: 'David O.' },
      ]);
      setModerationQueue([
        { id: 'MOD-001', contentTitle: 'Grade 5 Science: Human Body Systems', type: 'lesson', riskScore: 78, flagSource: 'ai', createdAt: '2024-01-15T08:30:00Z' },
        { id: 'MOD-002', contentTitle: 'Forum post: Homework help request', type: 'forum_post', riskScore: 45, flagSource: 'user', createdAt: '2024-01-15T09:15:00Z' },
        { id: 'MOD-003', contentTitle: 'Grade 8 Social Studies assignment', type: 'assignment', riskScore: 62, flagSource: 'ai', createdAt: '2024-01-15T07:45:00Z' },
      ]);
      setAgendaItems([
        { id: 'AG-001', title: 'Review flagged AI tutor responses (12 items)', time: '09:00 AM', type: 'review', priority: 'high' },
        { id: 'AG-002', title: 'Weekly content quality standup', time: '10:30 AM', type: 'meeting', priority: 'medium' },
        { id: 'AG-003', title: 'CBC alignment report due', time: '02:00 PM', type: 'deadline', priority: 'high' },
        { id: 'AG-004', title: 'Follow up with Wanjiku family case', time: '03:30 PM', type: 'followup', priority: 'medium' },
        { id: 'AG-005', title: 'Review new partner content submissions', time: '04:00 PM', type: 'review', priority: 'low' },
      ]);
      setTasks([
        { id: 'TSK-001', title: 'Approve Grade 6 Mathematics module', deadline: '2024-01-15', status: 'overdue', category: 'Content Review' },
        { id: 'TSK-002', title: 'Respond to parent escalation - Ochieng family', deadline: '2024-01-15', status: 'due_today', category: 'Support' },
        { id: 'TSK-003', title: 'Complete safety audit for AI chat logs', deadline: '2024-01-17', status: 'upcoming', category: 'Safety' },
        { id: 'TSK-004', title: 'Update KB article: M-Pesa payment guide', deadline: '2024-01-16', status: 'upcoming', category: 'Knowledge Base' },
      ]);
      setStudentFlags([
        { id: 'SF-001', studentName: 'Brian Kipchoge', grade: 'Grade 7', riskScore: 85, flagType: 'Engagement Drop', lastActivity: '3 days ago' },
        { id: 'SF-002', studentName: 'Amina Hassan', grade: 'Grade 5', riskScore: 72, flagType: 'Assessment Decline', lastActivity: '1 day ago' },
        { id: 'SF-003', studentName: 'Kevin Otieno', grade: 'Grade 8', riskScore: 91, flagType: 'Absence Pattern', lastActivity: '5 days ago' },
      ]);
      setAnomalies([
        { id: 'AN-001', description: 'Unusual spike in failed login attempts from Mombasa region', severity: 'critical', detectedAt: '2024-01-15T06:30:00Z', category: 'Security' },
        { id: 'AN-002', description: 'AI tutor response time degraded by 340% in last hour', severity: 'warning', detectedAt: '2024-01-15T08:45:00Z', category: 'Performance' },
        { id: 'AN-003', description: '15 students submitted identical assessment answers in Grade 6 Math', severity: 'warning', detectedAt: '2024-01-15T07:20:00Z', category: 'Academic Integrity' },
      ]);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-7 w-48 bg-[#181C1F] rounded animate-pulse" />
            <div className="h-4 w-72 bg-[#181C1F] rounded animate-pulse mt-2" />
          </div>
          <div className="h-9 w-32 bg-[#181C1F] rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-[#181C1F] rounded-xl border border-[#22272B] animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`h-64 bg-[#181C1F] rounded-xl border border-[#22272B] animate-pulse ${i === 2 ? 'lg:col-span-2' : ''}`} />
          ))}
        </div>
      </div>
    );
  }

  const getStatIcon = (icon: string) => {
    switch (icon) {
      case 'ticket':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
        );
      case 'shield':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      case 'check':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        );
      case 'users':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">My Focus</h1>
          <p className="text-sm text-white/50 mt-1">
            Welcome back. Here is what needs your attention today.
          </p>
        </div>
        <ViewToggle activeView={viewMode} onViewChange={setViewMode} />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-[#181C1F] rounded-xl border border-[#22272B] p-4 flex items-center gap-4"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#E40000]/10 text-[#E40000] flex items-center justify-center">
              {getStatIcon(stat.icon)}
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-white/50">{stat.label}</p>
              <p className={`text-xs mt-0.5 ${stat.change > 0 ? 'text-yellow-400' : stat.change < 0 ? 'text-green-400' : 'text-white/30'}`}>
                {stat.change > 0 ? '+' : ''}{stat.change} {stat.changeLabel}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Bento Grid */}
      <StaffBentoGrid viewMode={viewMode}>
        <UrgentTicketsCard tickets={urgentTickets} />
        <ModerationQueueCard items={moderationQueue} />
        <AIAgendaCard items={agendaItems} />
        <TasksDeadlinesCard tasks={tasks} />
        <StudentFlagsCard flags={studentFlags} />
        <AnomaliesCard anomalies={anomalies} />
      </StaffBentoGrid>
    </div>
  );
};

export default StaffDashboardPage;
