// ============================================================
// Staff Dashboard TypeScript Types
// ============================================================

// --- Pagination & Common ---

export interface PaginatedRequest {
  page: number;
  limit: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface BulkActionResult {
  success_count: number;
  failure_count: number;
  errors: { id: string; error: string }[];
}

export interface ExportConfig {
  format: 'csv' | 'excel' | 'pdf';
  columns?: string[];
  filters?: Record<string, unknown>;
  filename?: string;
}

// --- WebSocket Events ---

export interface StaffWebSocketEvent {
  type: StaffWSEventType;
  data: Record<string, unknown>;
  timestamp: string;
}

export type StaffWSEventType =
  | 'ticket.assigned'
  | 'ticket.updated'
  | 'ticket.sla_warning'
  | 'ticket.sla_breached'
  | 'ticket.escalated'
  | 'moderation.new_item'
  | 'moderation.decided'
  | 'content.updated'
  | 'content.approved'
  | 'content.rejected'
  | 'session.starting'
  | 'session.participant_joined'
  | 'session.ended'
  | 'notification.new'
  | 'counter.update'
  | 'kb.article_suggested'
  | 'collab.user_joined'
  | 'collab.user_left';

// --- Staff Profile ---

export interface StaffProfile {
  id: string;
  user_id: string;
  department: string;
  position: string;
  employee_id: string | null;
  specializations: string[];
  view_mode: 'teacher_focus' | 'operations_focus' | 'custom';
  custom_layout: Record<string, unknown>;
  availability: Record<string, unknown>;
  team_id: string | null;
  team_name: string | null;
  is_department_lead: boolean;
  hired_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface StaffTeam {
  id: string;
  name: string;
  department: string;
  lead_id: string | null;
  lead_name: string | null;
  description: string | null;
  member_count: number;
  is_active: boolean;
  created_at: string;
}

// --- Dashboard ---

export interface StaffDashboardStats {
  tickets_assigned: number;
  tickets_resolved_today: number;
  moderation_pending: number;
  content_in_review: number;
  active_sessions: number;
  students_monitored: number;
  sla_at_risk: number;
  avg_response_time_minutes: number;
}

export interface AIAgendaItem {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'ticket' | 'moderation' | 'content' | 'assessment' | 'session';
  due_at: string | null;
  ai_rationale: string;
  action_url: string;
}

export interface MyFocusData {
  urgent_tickets: StaffTicketSummary[];
  moderation_highlights: ModerationItemSummary[];
  tasks_deadlines: TaskDeadline[];
  student_flags: StudentFlag[];
  ai_anomalies: AIAnomalyItem[];
  ai_agenda: AIAgendaItem[];
  stats: StaffDashboardStats;
}

export interface TaskDeadline {
  id: string;
  title: string;
  type: 'content_review' | 'assessment_grade' | 'session_prep' | 'report_due';
  due_at: string;
  status: 'pending' | 'overdue' | 'upcoming';
}

export interface StudentFlag {
  id: string;
  student_name: string;
  student_id: string;
  flag_type: 'at_risk' | 'attendance' | 'behavior' | 'achievement';
  description: string;
  severity: 'high' | 'medium' | 'low';
  created_at: string;
}

export interface AIAnomalyItem {
  id: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  detected_at: string;
}

// --- Tickets & SLA ---

export interface StaffTicket {
  id: string;
  ticket_number: string;
  subject: string;
  description: string;
  category: 'account' | 'billing' | 'technical' | 'content' | 'safety';
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'waiting' | 'escalated' | 'resolved' | 'closed';
  reporter: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  assigned_to: {
    id: string;
    name: string;
  } | null;
  escalated_to: {
    id: string;
    name: string;
  } | null;
  sla_status: SLAStatus | null;
  tags: string[];
  message_count: number;
  first_response_at: string | null;
  resolved_at: string | null;
  closed_at: string | null;
  csat_score: number | null;
  created_at: string;
  updated_at: string;
}

export interface StaffTicketSummary {
  id: string;
  ticket_number: string;
  subject: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: string;
  sla_time_remaining_minutes: number | null;
  sla_breached: boolean;
  created_at: string;
}

export interface TicketMessage {
  id: string;
  author_id: string;
  author_name: string;
  author_role: string;
  content: string;
  is_internal: boolean;
  attachments: Record<string, unknown>[];
  created_at: string;
}

export interface SLAStatus {
  policy_name: string;
  first_response_deadline: string | null;
  resolution_deadline: string | null;
  first_response_met: boolean;
  is_breached: boolean;
  time_remaining_minutes: number | null;
  escalation_level: number;
}

export interface SLAPolicy {
  id: string;
  name: string;
  priority: string;
  category: string | null;
  first_response_minutes: number;
  resolution_minutes: number;
  escalation_chain: EscalationLevel[];
  is_active: boolean;
  created_at: string;
}

export interface EscalationLevel {
  level: number;
  after_minutes: number;
  notify: string[];
  action: 'notify' | 'reassign' | 'alert';
}

// --- Moderation ---

export interface ModerationItem {
  id: string;
  content_type: string;
  content_id: string;
  title: string;
  description: string | null;
  submitted_by: {
    id: string;
    name: string;
    email: string;
  };
  assigned_to: {
    id: string;
    name: string;
  } | null;
  status: 'pending' | 'approved' | 'rejected' | 'changes_requested' | 'escalated';
  priority: 'critical' | 'high' | 'medium' | 'low';
  ai_flags: AIFlag[];
  ai_risk_score: number | null;
  category: string | null;
  created_at: string;
  updated_at: string;
}

export interface ModerationItemSummary {
  id: string;
  title: string;
  content_type: string;
  priority: string;
  ai_risk_score: number | null;
  created_at: string;
}

export interface AIFlag {
  type: string;
  confidence: number;
  description: string;
}

export interface ReviewDecision {
  id: string;
  moderation_item_id: string;
  reviewer_id: string;
  reviewer_name: string;
  decision: 'approved' | 'rejected' | 'changes_requested';
  feedback: string | null;
  is_ai_assisted: boolean;
  created_at: string;
}

// --- Content Studio ---

export interface ContentItem {
  id: string;
  title: string;
  content_type: 'lesson' | 'quiz' | 'worksheet' | 'activity' | 'resource';
  body: string | null;
  body_json: Record<string, unknown> | null;
  status: 'draft' | 'review' | 'approved' | 'published' | 'archived';
  author: {
    id: string;
    name: string;
  };
  reviewer: {
    id: string;
    name: string;
  } | null;
  course_id: string | null;
  course_title: string | null;
  grade_levels: string[];
  learning_area: string | null;
  cbc_tags: CBCTag[];
  version: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContentVersion {
  id: string;
  content_id: string;
  version_number: number;
  changes_summary: string | null;
  created_by: {
    id: string;
    name: string;
  };
  created_at: string;
}

export interface CollabSession {
  id: string;
  content_id: string;
  yjs_doc_id: string;
  participants: CollabParticipant[];
  is_active: boolean;
  created_at: string;
}

export interface CollabParticipant {
  user_id: string;
  name: string;
  color: string;
  joined_at: string;
}

// --- CBC Competencies ---

export interface CBCCompetency {
  id: string;
  code: string;
  name: string;
  description: string | null;
  learning_area: string;
  strand: string;
  sub_strand: string | null;
  grade_level: string;
  level: string | null;
  keywords: string[];
}

export interface CBCTag {
  strand: string;
  sub_strand: string;
  competency: string;
  competency_code?: string;
}

export interface CBCAlignmentData {
  learning_area: string;
  grade_level: string;
  total_competencies: number;
  covered_competencies: number;
  coverage_percentage: number;
  gaps: CBCCompetency[];
}

// --- Assessments ---

export interface AdaptiveAssessment {
  id: string;
  title: string;
  description: string | null;
  assessment_type: 'quiz' | 'exam' | 'formative' | 'diagnostic';
  course_id: string | null;
  course_title: string | null;
  grade_level: string | null;
  learning_area: string | null;
  cbc_tags: CBCTag[];
  difficulty_range: { min: number; max: number };
  adaptive_config: AdaptiveConfig;
  time_limit_minutes: number | null;
  is_ai_graded: boolean;
  rubric: Record<string, unknown> | null;
  status: 'draft' | 'active' | 'archived';
  author: { id: string; name: string };
  total_questions: number;
  created_at: string;
  updated_at: string;
}

export interface AdaptiveConfig {
  initial_difficulty: number;
  step_up_threshold: number;
  step_down_threshold: number;
}

export interface AssessmentQuestion {
  id: string;
  assessment_id: string;
  question_text: string;
  question_type: 'mcq' | 'short_answer' | 'essay' | 'fill_blank' | 'matching' | 'ordering';
  options: QuestionOption[] | null;
  correct_answer: string | null;
  explanation: string | null;
  difficulty: 1 | 2 | 3 | 4 | 5;
  points: number;
  cbc_competency: string | null;
  media_url: string | null;
  order_index: number;
  adaptive_paths: AdaptivePath[];
  ai_grading_prompt: string | null;
  created_at: string;
}

export interface QuestionOption {
  text: string;
  is_correct: boolean;
}

export interface AdaptivePath {
  if_correct: string | null;  // next question ID
  if_wrong: string | null;    // next question ID
}

export interface AIGradingResult {
  question_id: string;
  student_answer: string;
  score: number;
  max_score: number;
  feedback: string;
  competency_met: boolean;
  confidence: number;
}

// --- Live Sessions ---

export interface LiveSession {
  id: string;
  title: string;
  description: string | null;
  host: { id: string; name: string };
  session_type: 'class' | 'tutoring' | 'meeting' | 'workshop';
  room_name: string;
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  max_participants: number;
  current_participants: number;
  scheduled_at: string;
  started_at: string | null;
  ended_at: string | null;
  recording_enabled: boolean;
  screen_share_enabled: boolean;
  course_id: string | null;
  course_title: string | null;
  grade_level: string | null;
  created_at: string;
}

export interface LiveSessionRecording {
  id: string;
  session_id: string;
  recording_url: string;
  duration_seconds: number | null;
  file_size_bytes: number | null;
  format: string;
  created_at: string;
}

export interface BreakoutRoom {
  id: string;
  session_id: string;
  name: string;
  participants: { user_id: string; name: string }[];
  is_active: boolean;
}

export interface LiveKitToken {
  token: string;
  room_name: string;
  server_url: string;
}

// --- Knowledge Base ---

export interface KBArticle {
  id: string;
  title: string;
  slug: string;
  body: string;
  body_html: string | null;
  category: KBCategory | null;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  author: { id: string; name: string };
  view_count: number;
  helpful_count: number;
  not_helpful_count: number;
  is_internal: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface KBCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  article_count: number;
  sort_order: number;
}

export interface KBSearchResult {
  article_id: string;
  title: string;
  slug: string;
  snippet: string;
  similarity_score: number;
  category: string | null;
  tags: string[];
}

// --- Reports ---

export interface ReportDefinition {
  id: string;
  name: string;
  description: string | null;
  report_type: 'dashboard' | 'table' | 'chart' | 'mixed';
  config: ReportConfig;
  filters: Record<string, unknown>;
  created_by: { id: string; name: string };
  is_template: boolean;
  is_shared: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReportConfig {
  widgets: ReportWidget[];
  layout: { columns: number; row_height: number };
}

export interface ReportWidget {
  id: string;
  type: 'metric_card' | 'line_chart' | 'bar_chart' | 'pie_chart' | 'data_table' | 'text_block';
  data_source: string;
  position: { x: number; y: number; w: number; h: number };
  config: Record<string, unknown>;
}

export interface ReportSchedule {
  id: string;
  report_id: string;
  report_name: string;
  schedule_cron: string;
  format: 'csv' | 'excel' | 'pdf';
  recipients: { email: string; name: string }[];
  is_active: boolean;
  last_run_at: string | null;
  next_run_at: string | null;
  created_at: string;
}

// --- Team & Performance ---

export interface MyPerformanceData {
  tickets_resolved: number;
  tickets_avg_resolution_minutes: number;
  content_reviewed: number;
  quality_score: number;
  response_time_avg_minutes: number;
  sessions_hosted: number;
  student_satisfaction_avg: number;
  period: '7d' | '30d' | '90d';
  goals: PerformanceGoal[];
  trend: { date: string; metric: string; value: number }[];
}

export interface PerformanceGoal {
  id: string;
  metric: string;
  target: number;
  current: number;
  unit: string;
}

export interface TeamMemberMetrics {
  user_id: string;
  name: string;
  role: string;
  avatar: string | null;
  tickets_open: number;
  tickets_resolved_period: number;
  avg_resolution_minutes: number;
  moderation_items: number;
  quality_score: number;
}

export interface TeamPulseData {
  team_name: string;
  department: string;
  members: TeamMemberMetrics[];
  workload_balance_score: number;
  ai_suggestions: WorkloadSuggestion[];
}

export interface WorkloadSuggestion {
  suggestion_type: 'redistribute' | 'escalate' | 'defer';
  from_staff: string | null;
  to_staff: string | null;
  items: string[];
  rationale: string;
}

// --- Student Progress ---

export interface StudentProgressCard {
  student_id: string;
  student_name: string;
  grade_level: string;
  avatar: string | null;
  overall_progress: number;
  risk_level: 'low' | 'medium' | 'high';
  recent_activity: string;
  ai_focus_areas: string[];
  last_active: string;
}

export interface StudentLearningJourney {
  student_id: string;
  student_name: string;
  grade_level: string;
  ai_companion_insights: {
    learning_style: string;
    preferences: string[];
    early_warnings: string[];
    support_tips: string[];
  };
  cbc_snapshot: CBCAlignmentData[];
  progress_narrative: string;
  daily_activities: DailyActivity[];
  achievements: Achievement[];
}

export interface DailyActivity {
  date: string;
  activities: {
    type: string;
    title: string;
    duration_minutes: number;
    result: string | null;
  }[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  earned_at: string;
  badge_url: string | null;
}

// --- Student Journeys ---

export interface StudentJourney {
  id: string;
  student_id: string;
  student_name: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  risk_factors: string[];
  ai_insights: Record<string, unknown>;
  learning_style: string | null;
  strengths: string[];
  areas_for_improvement: string[];
  last_assessed_at: string | null;
  created_at: string;
}

export interface FamilyCase {
  id: string;
  family_name: string;
  primary_contact: { id: string; name: string; email: string };
  students: { id: string; name: string; grade_level: string }[];
  case_status: 'active' | 'monitoring' | 'resolved' | 'closed';
  priority: 'critical' | 'high' | 'medium' | 'low';
  notes_count: number;
  assigned_to: { id: string; name: string } | null;
  created_at: string;
}

export interface CaseNote {
  id: string;
  case_type: 'student' | 'family';
  case_ref_id: string;
  author: { id: string; name: string };
  content: string;
  is_private: boolean;
  created_at: string;
}

// --- Notifications ---

export type StaffNotificationPriority = 'critical' | 'high' | 'medium' | 'low';

export interface StaffNotification {
  id: string;
  type: string;
  priority: StaffNotificationPriority;
  title: string;
  message: string;
  category: string;
  action_url: string | null;
  data?: Record<string, unknown>;
  read: boolean;
  created_at: string;
}

export interface NotificationPreferences {
  channels: { push: boolean; email: boolean; in_app: boolean };
  digest_frequency: 'instant' | 'hourly' | 'daily' | 'weekly';
  quiet_hours: { enabled: boolean; start: string; end: string };
  categories: Record<string, string>;
}

// --- Account ---

export interface StaffPreferences {
  view_mode: 'teacher_focus' | 'operations_focus' | 'custom';
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'sw';
  timezone: string;
  custom_layout: Record<string, unknown>;
}

export interface StaffPresence {
  status: 'available' | 'focused' | 'offline';
  working_hours: { start: string; end: string };
}

export interface ActiveSession {
  id: string;
  device_type: string;
  browser: string;
  os: string;
  ip_address: string;
  is_current: boolean;
  last_active: string;
  created_at: string;
}

// --- Insights ---

export interface PlatformHealthMetrics {
  daily_active_users: number;
  dau_trend: { date: string; count: number }[];
  engagement_curves: { hour: number; engagement: number }[];
  dropout_rate: number;
  bottleneck_areas: { area: string; dropout_rate: number }[];
  ai_tutor_usage: { model: string; sessions: number; avg_duration: number }[];
}

export interface ContentPerformanceData {
  id: string;
  title: string;
  content_type: string;
  completion_rate: number;
  avg_time_on_task_minutes: number;
  avg_score: number | null;
  feedback_sentiment: number;
  engagement_score: number;
  view_count: number;
}

export interface SupportMetrics {
  avg_resolution_time_minutes: number;
  first_contact_resolution_rate: number;
  csat_average: number;
  ticket_volume_trend: { date: string; count: number }[];
  recurring_issues: { issue: string; count: number; trend: 'up' | 'down' | 'stable' }[];
  sla_compliance_rate: number;
}

// --- Sidebar Navigation ---

export interface StaffNavItem {
  id: string;
  title: string;
  icon?: React.ReactNode;
  path?: string;
  children?: StaffNavItem[];
  badge?: number;
  disabled?: boolean;
  onClick?: () => void;
}

export interface StaffNavSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: StaffNavItem[];
}

// --- Realtime Counters ---

export interface StaffRealtimeCounters {
  openTickets: number;
  moderationQueue: number;
  pendingApprovals: number;
  activeSessions: number;
  unreadNotifications: number;
  slaAtRisk: number;
}
