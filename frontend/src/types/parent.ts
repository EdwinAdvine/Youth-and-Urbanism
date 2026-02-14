/**
 * Parent Dashboard TypeScript Types
 *
 * Type definitions for the parent dashboard features including:
 * - Child management and tracking
 * - Mood and goal tracking
 * - Consent and privacy controls
 * - Messaging and alerts
 * - Reports and analytics
 * - 2FA and security
 */

// ==================== Child & Student Types ====================

export interface ChildSummary {
  id?: string;
  student_id: string;
  user_id?: string;
  admission_number?: string;
  full_name: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  grade_level: string;
  is_active: boolean;
  enrollment_date?: string;
  profile_picture?: string;
}

export interface ChildDetailProgress {
  student_id: string;
  admission_number: string;
  full_name: string;
  grade_level: string;
  learning_profile?: Record<string, any>;
  competencies?: Record<string, any>;
  overall_performance?: Record<string, any>;
  enrolled_courses: EnrolledCourse[];
  total_interactions_with_tutor: number;
  ai_tutor_id?: string;
}

export interface EnrolledCourse {
  course_id: string;
  title: string;
  progress_percentage: number;
  current_grade?: number;
  total_time_spent_minutes: number;
  last_accessed_at?: string;
  status: string;
}

// ==================== CBC Competencies ====================

export interface CBCCompetency {
  name: string;
  score: number; // 0-100
  level: string; // 'Emerging', 'Developing', 'Proficient', 'Advanced'
  description?: string;
  trend?: 'improving' | 'stable' | 'declining';
}

/** Alias used by some components */
export type CBCCompetencyScore = CBCCompetency;

export interface CBCRadarData {
  competencies: CBCCompetency[];
  overall_score: number;
  last_updated: string;
}

// ==================== Mood Tracking ====================

export interface MoodEntry {
  id: string;
  parent_id: string;
  child_id?: string; // null = family-level
  emoji: 'happy' | 'tired' | 'anxious' | 'excited' | 'stressed' | 'neutral';
  energy_level?: number; // 1-5
  note?: string;
  recorded_date: string; // ISO date
  created_at: string;
}

export interface MoodCreate {
  child_id?: string;
  emoji: string;
  energy_level?: number;
  note?: string;
  recorded_date?: string;
}

// ==================== Family Goals ====================

export interface FamilyGoal {
  id: string;
  parent_id: string;
  child_id?: string; // null = family-wide
  child_name?: string;
  title: string;
  description?: string;
  category: 'academic' | 'behavioral' | 'creative' | 'health';
  target_date?: string; // ISO date
  progress_percentage: number; // 0-100
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  is_ai_suggested: boolean;
  ai_metadata?: {
    milestones?: string[];
    tips?: string[];
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

export interface GoalCreate {
  child_id?: string;
  title: string;
  description?: string;
  category: string;
  target_date?: string;
  progress_percentage?: number;
}

export interface GoalUpdate {
  title?: string;
  description?: string;
  progress_percentage?: number;
  status?: string;
  target_date?: string;
}

// ==================== Consent & Privacy ====================

export interface ConsentRecord {
  id: string;
  parent_id: string;
  child_id: string;
  data_type: string; // e.g., 'learning_analytics', 'ai_conversations', 'assessment_scores'
  recipient_type: string; // e.g., 'platform', 'instructors', 'ai_system', 'third_party'
  consent_given: boolean;
  granted_at?: string;
  revoked_at?: string;
  expires_at?: string;
  reason?: string;
  created_at: string;
  updated_at: string;
}

export interface ConsentAuditEntry {
  id: string;
  consent_record_id: string;
  action: 'granted' | 'revoked' | 'updated' | 'expired';
  performed_by: string;
  old_value?: boolean;
  new_value: boolean;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface ConsentUpdate {
  child_id: string;
  data_type: string;
  recipient_type: string;
  consent_given: boolean;
  reason?: string;
}

// ==================== Messaging ====================

export interface ParentMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  recipient_id?: string; // null = AI tutor
  channel: 'ai_tutor' | 'teacher' | 'family' | 'support';
  child_id?: string;
  content: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  is_read: boolean;
  read_at?: string;
  metadata_?: Record<string, any>;
  created_at: string;
}

export interface Conversation {
  id: string;
  channel: string;
  participant_name: string;
  participant_avatar?: string;
  child_name?: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

export interface MessageSend {
  conversation_id?: string;
  recipient_id?: string;
  channel: string;
  child_id?: string;
  content: string;
  message_type?: string;
}

// ==================== AI Alerts ====================

export interface AIAlert {
  id: string;
  parent_id: string;
  child_id: string;
  alert_type: 'engagement_drop' | 'performance_decline' | 'milestone_reached' | 'schedule_deviation' | 'content_concern';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  ai_recommendation?: string;
  is_read: boolean;
  is_dismissed: boolean;
  action_url?: string;
  metadata_?: Record<string, any>;
  created_at: string;
  child_name?: string; // Populated from join
}

// ==================== Notification Preferences ====================

export interface NotificationPreference {
  id: string;
  parent_id: string;
  child_id?: string; // null = all children
  notification_type: 'achievement' | 'alert' | 'report' | 'message' | 'payment' | 'system';
  channel_email: boolean;
  channel_sms: boolean;
  channel_push: boolean;
  channel_in_app: boolean;
  severity_threshold: 'info' | 'warning' | 'critical';
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferenceUpdate {
  child_id?: string;
  notification_type: string;
  channel_email?: boolean;
  channel_sms?: boolean;
  channel_push?: boolean;
  channel_in_app?: boolean;
  severity_threshold?: string;
  is_enabled?: boolean;
}

// ==================== Reports ====================

export interface ParentReport {
  id: string;
  parent_id: string;
  child_id: string;
  report_type: 'weekly' | 'monthly' | 'term' | 'transcript' | 'portfolio';
  title: string;
  period_start: string; // ISO date
  period_end: string; // ISO date
  data: Record<string, any>; // Full report data
  ai_summary?: string;
  ai_projections?: {
    trend_forecast?: string;
    milestone_etas?: Record<string, string>;
    [key: string]: any;
  };
  pdf_url?: string;
  status: 'generating' | 'ready' | 'archived';
  created_at: string;
  child_name?: string; // Populated from join
}

export interface ReportGenerate {
  child_id: string;
  report_type: string;
  period_start: string;
  period_end: string;
}

// ==================== 2FA & Security ====================

export interface TwoFactorConfig {
  id: string;
  user_id: string;
  totp_enabled: boolean;
  sms_enabled: boolean;
  sms_phone?: string;
  email_enabled: boolean;
  email_address?: string;
  has_backup_codes: boolean;
  recovery_email?: string;
  last_used_at?: string;
  created_at: string;
  updated_at: string;
}

export interface TOTPSetup {
  secret: string;
  qr_uri: string;
  backup_codes: string[];
}

export interface LoginHistoryEntry {
  id: string;
  user_id: string;
  ip_address?: string;
  user_agent?: string;
  device_info?: {
    device?: string;
    browser?: string;
    os?: string;
  };
  location?: string;
  login_at: string;
  success: boolean;
  failure_reason?: string;
}

// ==================== Real-time Counters ====================

export interface ParentRealtimeCounters {
  unreadMessages: number;
  unreadAlerts: number;
  pendingConsents: number;
  upcomingDeadlines: number;
  newAchievements: number;
  newReports: number;
}

// ==================== Parent Notifications ====================

export interface ParentNotification {
  id: string;
  type: 'achievement' | 'alert' | 'report' | 'message' | 'payment' | 'system';
  severity?: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  child_id?: string;
  child_name?: string;
  action_url?: string;
  is_read: boolean;
  created_at: string;
}

// ==================== Dashboard Stats ====================

export interface FamilyOverview {
  children: ChildQuickStatus[];
  total_active_sessions: number;
  total_time_today_minutes: number;
  overall_engagement_score: number; // 0-100
  urgent_items_count: number;
  total_children?: number;
  active_today?: number;
  family_streak_days?: number;
  total_minutes_today?: number;
  total_sessions_today?: number;
  this_week_lessons_completed?: number;
}

export interface ChildQuickStatus {
  child_id: string;
  student_id?: string;
  full_name: string;
  grade_level: string;
  admission_number?: string;
  today_active: boolean;
  today_time_minutes: number;
  today_minutes?: number;
  today_sessions?: number;
  current_streak_days?: number;
  engagement_status: 'excellent' | 'good' | 'needs_attention';
  last_activity?: string;
  profile_picture?: string;
  is_active?: boolean;
  has_urgent_alerts?: boolean;
  unread_messages?: number;
}

export interface UrgentItem {
  type: 'deadline' | 'low_engagement' | 'consent_needed' | 'payment_due';
  child_id?: string;
  child_name?: string;
  title: string;
  message: string;
  description?: string;
  due_date?: string;
  action_url?: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface TodayHighlight {
  type: 'achievement' | 'milestone' | 'improvement' | 'concern';
  child_id: string;
  child_name: string;
  title: string;
  description: string;
  icon?: string;
  timestamp: string;
}

export interface AIFamilySummary {
  week_start: string;
  week_end: string;
  overall_trend: 'improving' | 'stable' | 'declining';
  summary?: string;
  key_insights: string[];
  insights?: { title: string; description: string }[];
  recommendations: string[];
  top_recommendations?: string[];
  predictive_forecast: string;
  engagement_trend_data: { date: string; score: number }[];
}

// ==================== Communications API Response Types ====================

export interface NotificationsListResponse {
  notifications: ParentNotificationResponse[];
  total_count: number;
  unread_count: number;
  has_urgent: boolean;
}

export interface ParentNotificationResponse {
  id: string;
  parent_id: string;
  child_id?: string;
  child_name?: string;
  notification_type: string;
  title: string;
  message: string;
  priority: string;
  is_read: boolean;
  read_at?: string;
  action_url?: string;
  icon?: string;
  created_at: string;
}

export interface NotificationCountsResponse {
  total_unread: number;
  by_type: Record<string, number>;
  urgent_count: number;
}

export interface MessageParticipant {
  user_id: string;
  full_name: string;
  role: string;
  avatar_url?: string;
}

export interface ParentMessageResponse {
  id: string;
  conversation_id: string;
  sender: MessageParticipant;
  content: string;
  message_type: string;
  is_read: boolean;
  read_at?: string;
  metadata_?: Record<string, any>;
  created_at: string;
}

export interface ConversationSummary {
  conversation_id: string;
  channel: string;
  child_id?: string;
  child_name?: string;
  other_participant: MessageParticipant;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  is_pinned: boolean;
}

export interface ConversationsListResponse {
  conversations: ConversationSummary[];
  total_count: number;
}

export interface ConversationMessagesResponse {
  conversation_id: string;
  channel: string;
  participants: MessageParticipant[];
  messages: ParentMessageResponse[];
  total_count: number;
  child_id?: string;
  child_name?: string;
}

export interface SendMessageRequest {
  conversation_id?: string;
  recipient_id?: string;
  channel: string;
  child_id?: string;
  content: string;
  message_type?: string;
  metadata_?: Record<string, any>;
}

export interface SupportArticle {
  id: string;
  title: string;
  summary: string;
  category: string;
  tags: string[];
  content: string;
  helpful_count: number;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface SupportArticlesResponse {
  articles: SupportArticle[];
  total_count: number;
  categories: string[];
}

export interface SupportTicketMessage {
  id: string;
  ticket_id: string;
  sender: MessageParticipant;
  content: string;
  is_staff_response: boolean;
  created_at: string;
}

export interface SupportTicketResponse {
  id: string;
  parent_id: string;
  child_id?: string;
  child_name?: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  assigned_to?: MessageParticipant;
  messages: SupportTicketMessage[];
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface SupportTicketsListResponse {
  tickets: SupportTicketResponse[];
  total_count: number;
  open_count: number;
  resolved_count: number;
}

export interface CreateSupportTicketRequest {
  title: string;
  description: string;
  category: string;
  priority?: string;
  child_id?: string;
}

// ==================== Activity Tracking ====================

export interface ActivitySummary {
  daily_minutes: number;
  weekly_minutes: number;
  current_streak: number;
  longest_streak: number;
  total_sessions: number;
  most_engaged_content: {
    title: string;
    time_minutes: number;
    type: string;
  }[];
}

export interface ActivityFeedItem {
  id: string;
  timestamp: string;
  activity_type: 'lesson_completed' | 'quiz_taken' | 'assignment_submitted' | 'badge_earned' | 'goal_progress';
  title: string;
  description: string;
  course_name?: string;
  score?: number;
  icon?: string;
}

// ==================== Achievements ====================

export interface AchievementItem {
  id: string;
  type: 'certificate' | 'badge' | 'milestone';
  title: string;
  description: string;
  earned_date: string;
  course_name?: string;
  icon_url?: string;
  certificate_url?: string;
  share_url?: string;
}

// ==================== Response Wrapper Types ====================

/** Children list returned by GET /parent/children */
export interface ChildSummaryCard {
  student_id: string;
  full_name: string;
  grade_level: string;
  is_active: boolean;
  today_active: boolean;
  today_time_minutes: number;
  average_grade: number | null;
  current_streak_days: number;
  engagement_score: number | null;
  enrolled_courses_count: number;
  total_achievements: number;
  profile_picture?: string;
}

export interface ChildrenListResponse {
  children: ChildSummaryCard[];
}

/** Alias for dashboard home child cards */
export type ChildStatusCard = ChildQuickStatus;

/** Full child profile returned by GET /parent/children/:id */
export interface ChildProfileResponse extends ChildDetailProgress {
  profile_picture?: string;
  enrollment_date?: string;
  is_active: boolean;
  learning_style?: string;
  average_grade?: number | null;
  current_streak_days?: number;
  total_learning_hours?: number;
  cbc_competencies?: CBCCompetency[];
  recent_activity?: ActivityFeedItem[];
  recent_achievements?: AchievementItem[];
}

/** Response aliases for dashboard endpoints */
export type FamilyOverviewResponse = FamilyOverview;
export type AIFamilySummaryResponse = AIFamilySummary;
export type MoodEntryResponse = MoodEntry;
export type MoodEntryCreate = MoodCreate;
export type FamilyGoalCreate = GoalCreate;
export type FamilyGoalUpdate = GoalUpdate;
export type FamilyGoalResponse = FamilyGoal;

/** Today's highlights response */
export interface TodayHighlightsResponse {
  highlights: (TodayHighlight & {
    id: string;
    action_url?: string;
  })[];
  ai_summary?: string;
  generated_at: string;
}

/** Urgent items response */
export interface UrgentItemsResponse {
  items: UrgentItem[];
  total_count: number;
}

/** Mood history response */
export interface MoodHistoryResponse {
  entries: MoodEntry[];
  trend?: 'improving' | 'stable' | 'declining';
  total_count: number;
  average_energy?: number;
}

// ==================== Children Endpoint Response Types ====================

/** Learning journey response */
export interface LearningJourneyFocusArea {
  subject: string;
  topic: string;
  status?: string;
  progress_percentage: number;
}

export interface WeeklyNarrative {
  summary: string;
  highlights?: string[];
  areas_of_growth?: string[];
  recommendations?: string[];
}

export interface LearningPathItem {
  title: string;
  status: 'completed' | 'in_progress' | 'upcoming';
  subject?: string;
  description?: string;
}

export interface LearningJourneyResponse {
  child_id: string;
  child_name?: string;
  current_focus_areas: LearningJourneyFocusArea[];
  weekly_narrative?: WeeklyNarrative;
  cbc_competencies?: CBCCompetency[];
  learning_path: LearningPathItem[];
  overall_progress?: number;
}

/** Activity response for daily/weekly activity */
export interface ActivityDay {
  date: string;
  minutes: number;
  sessions: number;
  total_minutes?: number;
  sessions_count?: number;
  lessons_completed?: number;
}

export interface ActivityResponse {
  child_id: string;
  summary: ActivitySummary;
  daily_activity: ActivityDay[];
  recent_activities: ActivityFeedItem[];
}

/** Achievements response */
export interface AchievementCertificate {
  id: string;
  title: string;
  description?: string;
  course_name?: string;
  earned_date?: string;
  issued_date?: string;
  thumbnail_url?: string;
  certificate_url?: string;
}

export interface AchievementBadge {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  icon_url?: string;
  earned_date: string;
}

export interface AchievementMilestone {
  id: string;
  title: string;
  description?: string;
  earned_date: string;
}

export interface AchievementsResponse {
  child_id: string;
  certificates: AchievementCertificate[];
  badges: AchievementBadge[];
  milestones: AchievementMilestone[];
  total_certificates: number;
  total_badges: number;
}

/** Goals list response */
export interface GoalsListResponse {
  goals: (FamilyGoal & {
    child_name?: string;
  })[];
  total_count: number;
}

/** AI pathways response */
export interface AIPathway {
  pathway_name: string;
  description: string;
  confidence_score: number;
  recommended_courses: string[];
  estimated_duration_weeks: number;
}

export interface AIPathwaysResponse {
  child_id: string;
  child_name?: string;
  pathways: AIPathway[];
  ai_reasoning: string;
}

// ==================== AI Insight Response Types ====================

/** AI tutor summary */
export interface AIConversation {
  topic: string;
  timestamp: string;
  summary: string;
  key_insights: string[];
}

export interface AITutorSummary {
  child_id: string;
  student_name: string;
  ai_tutor_name: string;
  total_interactions: number;
  engagement_level: 'high' | 'medium' | 'low';
  progress_rate: number;
  parent_friendly_explanation: string;
  summary?: string;
  strengths: string[];
  areas_for_improvement: string[];
  recent_conversations: AIConversation[];
}

/** Learning style analysis */
export interface LearningTrait {
  trait_name: string;
  score: number;
}

export interface LearningStyleAnalysis {
  child_id: string;
  student_name: string;
  primary_style: string;
  style_description: string;
  learning_traits: LearningTrait[];
  preferred_activities: string[];
  optimal_learning_times: string[];
  recommendations_for_parents: string[];
}

/** Support tips response */
export interface SupportTipCategory {
  category: string;
  tips: string[];
}

export interface SupportResource {
  title: string;
  description: string;
  url: string;
  resource_type: string;
}

export interface SupportTipsResponse {
  child_id: string;
  student_name: string;
  this_week_focus: string;
  priority_actions: string[];
  tips_by_category: SupportTipCategory[];
  recommended_resources: SupportResource[];
}

/** AI planning response */
export interface UpcomingTopic {
  topic: string;
  subject: string;
  estimated_weeks: number;
  learning_objectives: string[];
  prerequisites: string[];
}

export interface AIPlanningResponse {
  child_id: string;
  student_name: string;
  current_trajectory: string;
  pacing_level: string;
  upcoming_topics: UpcomingTopic[];
  ai_rationale: string;
  parent_involvement_opportunities: string[];
}

/** Curiosity patterns response */
export interface InterestArea {
  topic: string;
  engagement_score: number;
  question_count: number;
}

export interface QuestionType {
  type: string;
  example: string;
}

export interface CuriosityPatternsResponse {
  child_id: string;
  student_name: string;
  patterns_identified: string[];
  interest_areas: InterestArea[];
  common_question_types: QuestionType[];
  complexity_trend: 'increasing' | 'stable' | 'decreasing';
  nurturing_suggestions: string[];
}

/** Warning signs response */
export interface WarningIndicator {
  indicator: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  observed_behavior?: string;
}

export interface WarningSignsResponse {
  child_id: string;
  student_name: string;
  overall_risk_level: 'low' | 'medium' | 'high';
  risk_summary: string;
  active_warnings: WarningIndicator[];
  risk_factors: string[];
  protective_factors: string[];
  intervention_recommendations: string[];
}

/** Alerts list response */
export interface AlertsListResponse {
  alerts: AIAlert[];
  total_count: number;
  unread_count: number;
}

/** Alert detail response */
export interface AlertDetailResponse extends AIAlert {
  related_data?: Record<string, any>;
  suggested_actions?: string[];
}

/** Parent coaching response */
export interface CoachingTip {
  category: string;
  title: string;
  content: string;
  priority: 'high' | 'medium' | 'low';
}

export interface ParentCoachingResponse {
  child_id: string;
  child_name?: string;
  coaching_tips: CoachingTip[];
  weekly_focus: string;
  ai_encouragement: string;
}
