import React, { useState, useEffect, useCallback } from 'react';
import ViewToggle from '../../components/staff/dashboard/ViewToggle';
import StaffBentoGrid from '../../components/staff/dashboard/StaffBentoGrid';
import UrgentTicketsCard from '../../components/staff/dashboard/UrgentTicketsCard';
import ModerationQueueCard from '../../components/staff/dashboard/ModerationQueueCard';
import AIAgendaCard from '../../components/staff/dashboard/AIAgendaCard';
import TasksDeadlinesCard from '../../components/staff/dashboard/TasksDeadlinesCard';
import StudentFlagsCard from '../../components/staff/dashboard/StudentFlagsCard';
import AnomaliesCard from '../../components/staff/dashboard/AnomaliesCard';
import { getDashboardStats, getMyFocus, getAIAgenda } from '@/services/staff/staffDashboardService';
import { useStaffStore } from '@/store/staffStore';
import type {
  StaffDashboardStats,
  MyFocusData,
  AIAgendaItem as APIAgendaItem,
  StaffTicketSummary,
  ModerationItemSummary,
  TaskDeadline,
  StudentFlag as APIStudentFlag,
  AIAnomalyItem,
} from '@/types/staff';

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
  priority: 'critical' | 'high';
  slaRemaining: string;
  isBreached: boolean;
}

interface ModerationHighlight {
  id: string;
  contentType: string;
  contentTitle: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  aiRiskScore: number;
}

interface AgendaItem {
  id: string;
  title: string;
  priority: number;
  rationale: string;
  category: string;
  estimatedMinutes: number;
  actionUrl: string;
}

interface Task {
  id: string;
  title: string;
  dueDate: string;
  type: 'review' | 'ticket' | 'session' | 'content' | 'assessment';
  isOverdue: boolean;
  isCompleted: boolean;
}

interface StudentFlagUI {
  id: string;
  studentName: string;
  flagType: 'at_risk' | 'attendance' | 'performance' | 'behavior';
  description: string;
  riskScore: number;
}

interface Anomaly {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  trend: 'up' | 'down' | 'flat';
  metric: string;
  detectedAt: string;
}

/** Map API priority string to numeric priority for the agenda card. */
function priorityToNumber(p: string): number {
  switch (p) {
    case 'critical': return 1;
    case 'high': return 2;
    case 'medium': return 3;
    case 'low': return 4;
    default: return 5;
  }
}

/** Convert SLA remaining minutes to a human-readable string. */
function formatSlaRemaining(minutes: number | null): string {
  if (minutes === null || minutes === undefined) return 'N/A';
  if (minutes <= 0) return '0h 0m';
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hours}h ${mins}m`;
}

/** Map API task type to component task type. */
function mapTaskType(apiType: string): Task['type'] {
  const mapping: Record<string, Task['type']> = {
    content_review: 'review',
    assessment_grade: 'assessment',
    session_prep: 'session',
    report_due: 'content',
  };
  return mapping[apiType] || 'review';
}

/** Map API flag type to UI flag type. */
function mapFlagType(apiType: string): StudentFlagUI['flagType'] {
  const mapping: Record<string, StudentFlagUI['flagType']> = {
    at_risk: 'at_risk',
    attendance: 'attendance',
    behavior: 'behavior',
    achievement: 'performance',
  };
  return mapping[apiType] || 'at_risk';
}

/** Map severity to a numeric risk score for display. */
function severityToRiskScore(severity: string): number {
  switch (severity) {
    case 'high': return 0.85;
    case 'medium': return 0.6;
    case 'low': return 0.35;
    default: return 0.5;
  }
}

const StaffDashboardPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState<StatCard[]>([]);
  const [urgentTickets, setUrgentTickets] = useState<UrgentTicket[]>([]);
  const [moderationQueue, setModerationQueue] = useState<ModerationHighlight[]>([]);
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [studentFlags, setStudentFlags] = useState<StudentFlagUI[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);

  const { updateCounters } = useStaffStore();

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [focusData, dashboardStats, aiAgenda] = await Promise.allSettled([
        getMyFocus(),
        getDashboardStats(),
        getAIAgenda(),
      ]);

      // --- Process dashboard stats ---
      let statsResult: StaffDashboardStats | null = null;

      if (dashboardStats.status === 'fulfilled') {
        statsResult = dashboardStats.value;
      } else if (focusData.status === 'fulfilled') {
        statsResult = focusData.value.stats;
      }

      if (statsResult) {
        setStats([
          { label: 'Open Tickets', value: statsResult.tickets_assigned, change: 0, changeLabel: 'assigned to you', icon: 'ticket' },
          { label: 'Moderation Queue', value: statsResult.moderation_pending, change: 0, changeLabel: 'pending review', icon: 'shield' },
          { label: 'Pending Approvals', value: statsResult.content_in_review, change: 0, changeLabel: 'in review', icon: 'check' },
          { label: 'Active Sessions', value: statsResult.active_sessions, change: 0, changeLabel: 'live now', icon: 'users' },
        ]);

        // Sync counters to the store so sidebar badges update
        updateCounters({
          openTickets: statsResult.tickets_assigned,
          moderationQueue: statsResult.moderation_pending,
          pendingApprovals: statsResult.content_in_review,
          activeSessions: statsResult.active_sessions,
          slaAtRisk: statsResult.sla_at_risk,
        });
      }

      // --- Process My Focus data ---
      if (focusData.status === 'fulfilled') {
        const focus: MyFocusData = focusData.value;

        // Map urgent tickets
        setUrgentTickets(
          focus.urgent_tickets.map((t: StaffTicketSummary) => ({
            id: t.ticket_number || t.id,
            subject: t.subject,
            priority: (t.priority === 'critical' || t.priority === 'high' ? t.priority : 'high') as 'critical' | 'high',
            slaRemaining: formatSlaRemaining(t.sla_time_remaining_minutes),
            isBreached: t.sla_breached,
          }))
        );

        // Map moderation highlights
        setModerationQueue(
          focus.moderation_highlights.map((m: ModerationItemSummary) => ({
            id: m.id,
            contentType: m.content_type,
            contentTitle: m.title,
            priority: (m.priority as ModerationHighlight['priority']) || 'medium',
            aiRiskScore: m.ai_risk_score ?? 0,
          }))
        );

        // Map tasks and deadlines
        setTasks(
          focus.tasks_deadlines.map((t: TaskDeadline) => ({
            id: t.id,
            title: t.title,
            dueDate: t.due_at ? new Date(t.due_at).toLocaleDateString() : '',
            type: mapTaskType(t.type),
            isOverdue: t.status === 'overdue',
            isCompleted: false,
          }))
        );

        // Map student flags
        setStudentFlags(
          focus.student_flags.map((f: APIStudentFlag) => ({
            id: f.student_id || f.id,
            studentName: f.student_name,
            flagType: mapFlagType(f.flag_type),
            description: f.description,
            riskScore: severityToRiskScore(f.severity),
          }))
        );

        // Map AI anomalies
        setAnomalies(
          focus.ai_anomalies.map((a: AIAnomalyItem) => ({
            id: a.id,
            title: a.type,
            description: a.description,
            severity: (a.severity === 'critical' ? 'high' : a.severity) as Anomaly['severity'],
            trend: 'up' as const,
            metric: '',
            detectedAt: a.detected_at ? new Date(a.detected_at).toLocaleString() : '',
          }))
        );

        // Use agenda from focus data if separate call failed
        if (aiAgenda.status !== 'fulfilled') {
          setAgendaItems(
            focus.ai_agenda.map((a: APIAgendaItem) => ({
              id: a.id,
              title: a.title,
              priority: priorityToNumber(a.priority),
              rationale: a.ai_rationale || a.description,
              category: a.category,
              estimatedMinutes: 30,
              actionUrl: a.action_url,
            }))
          );
        }
      }

      // --- Process AI agenda from dedicated endpoint ---
      if (aiAgenda.status === 'fulfilled') {
        setAgendaItems(
          aiAgenda.value.map((a: APIAgendaItem) => ({
            id: a.id,
            title: a.title,
            priority: priorityToNumber(a.priority),
            rationale: a.ai_rationale || a.description,
            category: a.category,
            estimatedMinutes: 30,
            actionUrl: a.action_url,
          }))
        );
      }

      // If all three requests failed, show an error
      if (
        focusData.status === 'rejected' &&
        dashboardStats.status === 'rejected' &&
        aiAgenda.status === 'rejected'
      ) {
        throw new Error(
          (focusData.reason as Error)?.message || 'Failed to load dashboard data'
        );
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, [updateCounters]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-7 w-48 bg-white dark:bg-[#181C1F] rounded animate-pulse" />
            <div className="h-4 w-72 bg-white dark:bg-[#181C1F] rounded animate-pulse mt-2" />
          </div>
          <div className="h-9 w-32 bg-white dark:bg-[#181C1F] rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-white dark:bg-[#181C1F] rounded-xl border border-gray-200 dark:border-[#22272B] animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`h-64 bg-white dark:bg-[#181C1F] rounded-xl border border-gray-200 dark:border-[#22272B] animate-pulse ${i === 2 ? 'lg:col-span-2' : ''}`} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Focus</h1>
            <p className="text-sm text-gray-500 dark:text-white/50 mt-1">
              Welcome back. Here is what needs your attention today.
            </p>
          </div>
          <ViewToggle />
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <p className="text-red-600 dark:text-red-400 font-medium mb-2">Failed to load dashboard</p>
          <p className="text-sm text-red-500 dark:text-red-400/70 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-[#E40000] text-white text-sm font-medium rounded-lg hover:bg-[#C00] transition-colors"
          >
            Retry
          </button>
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
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Focus</h1>
          <p className="text-sm text-gray-500 dark:text-white/50 mt-1">
            Welcome back. Here is what needs your attention today.
          </p>
        </div>
        <ViewToggle />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-[#181C1F] rounded-xl border border-gray-200 dark:border-[#22272B] p-4 flex items-center gap-4"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#E40000]/10 text-[#E40000] flex items-center justify-center">
              {getStatIcon(stat.icon)}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-xs text-gray-500 dark:text-white/50">{stat.label}</p>
              <p className={`text-xs mt-0.5 ${stat.change > 0 ? 'text-yellow-400' : stat.change < 0 ? 'text-green-400' : 'text-gray-400 dark:text-white/30'}`}>
                {stat.change > 0 ? '+' : ''}{stat.change} {stat.changeLabel}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Bento Grid */}
      <StaffBentoGrid>
        <UrgentTicketsCard tickets={urgentTickets} />
        <ModerationQueueCard items={moderationQueue} totalPending={moderationQueue.length} />
        <AIAgendaCard items={agendaItems} />
        <TasksDeadlinesCard tasks={tasks} />
        <StudentFlagsCard flags={studentFlags} />
        <AnomaliesCard anomalies={anomalies} />
      </StaffBentoGrid>
    </div>
  );
};

export default StaffDashboardPage;
