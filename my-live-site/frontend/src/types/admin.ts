// ============================================================
// Admin Dashboard TypeScript Types
// ============================================================

// --- Pagination & Data Table ---

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

// --- WebSocket ---

export interface WebSocketEvent {
  type: string;
  data: Record<string, unknown>;
  timestamp: string;
}

export type WSEventType =
  | 'system.health.update'
  | 'system.alert'
  | 'user.online'
  | 'user.offline'
  | 'user.registered'
  | 'course.submitted'
  | 'content.flagged'
  | 'ai.anomaly'
  | 'ai.safety_violation'
  | 'payment.received'
  | 'refund.requested'
  | 'ticket.created'
  | 'ticket.escalated'
  | 'safety.incident'
  | 'moderation.reported';

// --- Audit Logging ---

export interface AuditLogEntry {
  id: string;
  actor_id: string;
  actor_email: string;
  actor_role: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  status: 'success' | 'failure';
  created_at: string;
}

// --- Admin Notifications ---

export type NotificationPriority = 'critical' | 'high' | 'medium' | 'low';

export interface AdminNotification {
  id: string;
  type: string;
  priority: NotificationPriority;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  created_at: string;
}

// --- Permissions ---

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  field_restrictions: Record<string, unknown>;
  is_active: boolean;
}

export interface RolePermission {
  id: string;
  role: string;
  permission_id: string;
  granted_by: string;
  granted_at: string;
  expires_at: string | null;
}

export interface UserPermissionOverride {
  id: string;
  user_id: string;
  permission_id: string;
  granted: boolean;
  granted_by: string;
  reason: string;
  expires_at: string | null;
}

export interface PermissionMatrix {
  permissions: Permission[];
  roles: { role: string; granted: string[] }[];
}

// --- Dashboard / At a Glance ---

export interface DashboardOverview {
  total_users: number;
  active_today: number;
  new_enrollments_today: number;
  revenue_today: number;
  revenue_currency: string;
  ai_sessions_today: number;
  system_status: 'healthy' | 'degraded' | 'down';
}

export interface DashboardAlert {
  id: string;
  severity: 'critical' | 'high' | 'medium';
  type: string;
  title: string;
  message: string;
  action_url?: string;
  created_at: string;
}

export interface PendingItem {
  id: string;
  type: 'enrollment' | 'course_approval' | 'refund' | 'escalation' | 'flag';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  action_url: string;
  created_at: string;
}

export interface RevenueSnapshot {
  today: number;
  yesterday: number;
  this_week: number;
  this_month: number;
  currency: string;
  payout_queue_count: number;
  payout_queue_total: number;
  trend: { date: string; amount: number }[];
}

export interface AIAnomaly {
  id: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  student_id?: string;
  student_name?: string;
  detected_at: string;
}

// --- Platform Pulse ---

export interface RealtimeMetrics {
  active_users: number;
  concurrent_sessions: number;
  ai_conversations_per_hour: number;
  active_users_trend: { time: string; count: number }[];
}

export interface ServiceHealth {
  service_name: string;
  status: 'healthy' | 'degraded' | 'down';
  response_time_ms: number;
  error_rate: number;
  last_checked: string;
  details?: Record<string, unknown>;
}

export interface UrgentFlag {
  id: string;
  type: 'child_safety' | 'policy_violation' | 'escalated_ticket' | 'fraud_abuse';
  severity: 'critical' | 'high';
  title: string;
  description: string;
  reporter_id?: string;
  action_url: string;
  created_at: string;
}

// --- People & Access ---

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'parent' | 'instructor' | 'admin' | 'partner' | 'staff';
  avatar?: string;
  is_active: boolean;
  is_verified: boolean;
  profile_data: Record<string, unknown>;
  created_at: string;
  last_login: string | null;
}

export interface UserDevice {
  id: string;
  device_type: string;
  browser: string;
  os: string;
  ip_address: string;
  last_active: string;
  is_current: boolean;
}

export interface UserActivity {
  id: string;
  action: string;
  description: string;
  ip_address: string;
  created_at: string;
}

export interface UserRestriction {
  id: string;
  user_id: string;
  user_email?: string;
  user_name?: string;
  restriction_type: 'ban' | 'suspend' | 'restrict' | 'watch';
  reason: string;
  imposed_by: string;
  imposed_by_name?: string;
  starts_at: string;
  expires_at: string | null;
  is_active: boolean;
  appeal_status: 'none' | 'pending' | 'approved' | 'denied';
  appeal_text?: string;
  notes?: Record<string, unknown>;
  created_at: string;
}

export interface APIToken {
  id: string;
  user_id: string;
  name: string;
  token_prefix: string;
  permissions: string[];
  last_used_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface FamilyUnit {
  parent_id: string;
  parent_name: string;
  parent_email: string;
  children: {
    student_id: string;
    student_name: string;
    grade_level: string;
    enrollment_status: string;
  }[];
}

// --- Content & Learning Integrity ---

export interface AdminCourse {
  id: string;
  title: string;
  description: string;
  instructor_id: string;
  instructor_name: string;
  grade_levels: string[];
  learning_area: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'archived';
  enrollment_count: number;
  average_rating: number;
  price: number;
  created_at: string;
  updated_at: string;
}

export interface ContentVersion {
  id: string;
  course_id: string;
  version_number: number;
  changes: Record<string, unknown>;
  created_by: string;
  created_by_name: string;
  created_at: string;
}

export interface CompetencyTag {
  id: string;
  name: string;
  cbc_strand: string;
  cbc_sub_strand: string;
  grade_level: string;
  description: string;
}

export interface CBCAlignmentData {
  grade_level: string;
  learning_area: string;
  total_competencies: number;
  covered_competencies: number;
  coverage_percentage: number;
  gaps: CompetencyTag[];
}

export interface GradeOverride {
  id: string;
  submission_id: string;
  student_name: string;
  course_title: string;
  assessment_title: string;
  original_grade: number;
  new_grade: number;
  reason: string;
  overridden_by: string;
  overridden_by_name: string;
  created_at: string;
}

export interface CertificateRecord {
  id: string;
  serial_number: string;
  student_name: string;
  course_title: string;
  grade: string;
  completion_date: string;
  is_valid: boolean;
  revoked_at?: string;
  revocation_reason?: string;
}

export interface CertificateTemplate {
  id: string;
  name: string;
  template_data: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
}

export interface ResourceItem {
  id: string;
  title: string;
  file_url: string;
  file_type: string;
  file_size: number;
  category: string;
  tags: string[];
  uploaded_by: string;
  uploaded_by_name: string;
  moderation_status: 'pending' | 'approved' | 'rejected';
  usage_count: number;
  created_at: string;
}

// --- AI Systems ---

export interface AIConversationFlag {
  id: string;
  ai_tutor_id: string;
  student_id: string;
  student_name: string;
  flag_type: 'safety' | 'bias' | 'prompt_drift' | 'quality' | 'hallucination';
  severity: 'critical' | 'high' | 'medium' | 'low';
  conversation_snippet: string;
  detected_by: 'auto' | 'manual';
  detection_model?: string;
  status: 'open' | 'reviewed' | 'resolved' | 'false_positive';
  reviewed_by?: string;
  reviewed_by_name?: string;
  reviewed_at?: string;
  notes?: string;
  created_at: string;
}

export interface AIContentReview {
  id: string;
  content_type: 'lesson' | 'quiz' | 'explanation';
  content_id: string;
  generated_content: string;
  model_used: string;
  model_version: string;
  accuracy_score: number | null;
  style_score: number | null;
  review_status: 'pending' | 'approved' | 'rejected' | 'overridden';
  reviewer_id?: string;
  reviewer_name?: string;
  override_content?: string;
  created_at: string;
}

export interface AIPerformanceMetric {
  id: string;
  provider_name: string;
  metric_type: 'response_time' | 'error_rate' | 'satisfaction' | 'helpfulness';
  metric_value: number;
  period_start: string;
  period_end: string;
  sample_size: number;
}

// --- Analytics & Intelligence ---

export interface LearningImpactData {
  grade_level: string;
  learning_area: string;
  average_progress: number;
  skill_acquisition_rate: number;
  cohort_comparison: { cohort: string; progress: number }[];
  equity_gap: { group: string; progress: number }[];
}

export interface BusinessMetrics {
  mrr: number;
  mrr_growth: number;
  churn_rate: number;
  active_subscriptions: number;
  new_subscriptions: number;
  cancelled_subscriptions: number;
  ltv_by_segment: { segment: string; ltv: number }[];
  acquisition_sources: { source: string; count: number; revenue: number }[];
  trend: { date: string; mrr: number; subscribers: number }[];
}

export interface ComplianceIncident {
  id: string;
  incident_type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  affected_users: string[];
  reported_by: string;
  reported_by_name: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  resolution?: string;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
}

export interface ScheduledReport {
  id: string;
  name: string;
  report_type: string;
  query_config: Record<string, unknown>;
  schedule_cron: string;
  recipients: string[];
  format: 'csv' | 'excel' | 'pdf';
  is_active: boolean;
  last_run_at: string | null;
  created_by: string;
  created_at: string;
}

export interface AIQueryResult {
  query: string;
  chart_type: 'bar' | 'line' | 'area' | 'pie' | 'radar' | 'scatter';
  data: Record<string, unknown>[];
  labels: string[];
  title: string;
  description: string;
}

// --- Finance & Partnerships ---

export interface AdminTransaction {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  type: 'credit' | 'debit';
  amount: number;
  currency: string;
  description: string;
  category: string;
  gateway: 'mpesa' | 'paypal' | 'stripe' | 'bank_transfer';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  reference_id?: string;
  created_at: string;
}

export interface PayoutQueueItem {
  id: string;
  recipient_id: string;
  recipient_name: string;
  recipient_email: string;
  amount: number;
  currency: string;
  payment_method: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  reference?: string;
  created_at: string;
}

export interface PartnerContract {
  id: string;
  partner_id: string;
  partner_name: string;
  partner_email: string;
  partner_type: 'content' | 'school' | 'business' | 'distribution';
  contract_status: 'draft' | 'active' | 'expired' | 'terminated';
  revenue_share_percent: number;
  terms: Record<string, unknown>;
  start_date: string;
  end_date: string;
  api_quota: number | null;
  api_usage_count: number;
  created_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  user_id?: string;
  user_name?: string;
  partner_id?: string;
  partner_name?: string;
  type: 'subscription' | 'course' | 'partner_payout';
  amount: number;
  currency: string;
  tax_amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'void';
  due_date: string;
  paid_at?: string;
  pdf_url?: string;
  line_items: { description: string; quantity: number; unit_price: number; total: number }[];
  created_at: string;
}

// --- Operations & Control ---

export interface SupportTicket {
  id: string;
  ticket_number: string;
  subject: string;
  description: string;
  category: 'account' | 'billing' | 'technical' | 'content' | 'safety';
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
  reporter_id: string;
  reporter_name: string;
  reporter_email: string;
  assigned_to?: string;
  assigned_to_name?: string;
  sla_deadline?: string;
  sla_breached: boolean;
  resolution?: string;
  csat_score?: number;
  tags: string[];
  messages: TicketMessage[];
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface TicketMessage {
  id: string;
  author_id: string;
  author_name: string;
  author_role: string;
  content: string;
  is_internal: boolean;
  created_at: string;
}

export interface ModerationItem {
  id: string;
  content_type: 'forum_post' | 'forum_reply' | 'course_review' | 'resource';
  content_id: string;
  content_snapshot: string;
  reason: 'reported' | 'auto_flagged' | 'keyword_match';
  reporter_id?: string;
  reporter_name?: string;
  status: 'pending' | 'approved' | 'rejected' | 'escalated';
  decision?: 'approve' | 'remove' | 'warn' | 'ban';
  decided_by?: string;
  decided_by_name?: string;
  decided_at?: string;
  ai_confidence?: number;
  created_at: string;
}

export interface SystemConfig {
  id: string;
  key: string;
  value: unknown;
  category: 'feature_flags' | 'rate_limits' | 'notifications' | 'branding' | 'security';
  description: string;
  requires_approval: boolean;
  current_version: number;
  updated_at: string;
}

export interface ConfigChangeRequest {
  id: string;
  config_id: string;
  config_key: string;
  current_value: unknown;
  proposed_value: unknown;
  reason: string;
  requested_by: string;
  requested_by_name: string;
  approved_by?: string;
  approved_by_name?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  resolved_at?: string;
}

export interface KeywordFilter {
  id: string;
  pattern: string;
  pattern_type: 'keyword' | 'regex';
  action: 'flag' | 'block' | 'warn';
  category: 'profanity' | 'pii' | 'harmful' | 'spam';
  is_active: boolean;
  created_at: string;
}

// --- Admin Account ---

export interface AdminPreferences {
  theme: 'light' | 'dark' | 'system';
  timezone: string;
  dashboard_layout: string[];
  notification_email: boolean;
  notification_sms: boolean;
  notification_in_app: boolean;
  notification_digest_frequency: 'instant' | 'hourly' | 'daily';
}

export interface ActiveSession {
  id: string;
  device_type: string;
  browser: string;
  os: string;
  ip_address: string;
  location?: string;
  is_current: boolean;
  last_active: string;
  created_at: string;
}

// --- Sidebar Navigation ---

export interface AdminNavItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  path?: string;
  children?: AdminNavItem[];
  badge?: number;
  disabled?: boolean;
  onClick?: () => void;
}
