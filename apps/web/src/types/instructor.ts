/**
 * Instructor Dashboard TypeScript Types
 *
 * Complete type definitions for the instructor dashboard feature.
 */

// ============================================================================
// Base Types
// ============================================================================

export type InstructorWSEventType =
  | 'counter_update'
  | 'notification'
  | 'submission_received'
  | 'session_starting'
  | 'student_flagged'
  | 'payout_status'
  | 'message_received'
  | 'badge_earned'
  | 'presence_update';

// ============================================================================
// Profile & Account
// ============================================================================

export interface InstructorProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  bio: string | null;
  tagline: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  specializations: string[];
  qualifications: Qualification[];
  experience_years: number | null;
  subjects: string[];
  languages: string[];
  teaching_style: string | null;
  ai_personality_config: Record<string, any> | null;
  public_profile_enabled: boolean;
  public_slug: string | null;
  seo_meta: SEOMeta | null;
  availability_config: AvailabilityConfig | null;
  social_links: SocialLink[];
  portfolio_items: PortfolioItem[];
  onboarding_completed: boolean;
  onboarding_step: string | null;
  created_at: string;
  updated_at: string;
}

export interface Qualification {
  degree: string;
  institution: string;
  year: number;
  field: string;
}

export interface SEOMeta {
  title: string;
  description: string;
  keywords: string[];
  og_image?: string;
}

export interface AvailabilityConfig {
  booking_window_days: number;
  min_notice_hours: number;
  max_daily_sessions: number;
  quiet_hours: TimeRange[];
  preferred_days: string[];
  time_zone: string;
}

export interface TimeRange {
  start: string; // HH:MM format
  end: string;
}

export interface SocialLink {
  platform: string;
  url: string;
  username?: string;
}

export interface PortfolioItem {
  type: 'video' | 'article' | 'project' | 'presentation';
  title: string;
  description?: string;
  url: string;
  thumbnail_url?: string;
  date?: string;
}

// ============================================================================
// Earnings & Finances
// ============================================================================

export type EarningType = 'course_sale' | 'session_fee' | 'bonus' | 'referral';
export type EarningStatus = 'pending' | 'confirmed' | 'paid' | 'reversed';
export type PayoutMethod = 'mpesa_b2c' | 'bank_transfer' | 'paypal';
export type PayoutStatus = 'requested' | 'processing' | 'completed' | 'failed' | 'reversed';

export interface InstructorEarning {
  id: string;
  instructor_id: string;
  course_id: string | null;
  session_id: string | null;
  earning_type: EarningType;
  gross_amount: number;
  platform_fee_pct: number;
  partner_fee_pct: number;
  net_amount: number;
  currency: string;
  status: EarningStatus;
  period_start: string | null;
  period_end: string | null;
  extra_data: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface InstructorPayout {
  id: string;
  instructor_id: string;
  amount: number;
  currency: string;
  payout_method: PayoutMethod;
  payout_details: PayoutDetails;
  status: PayoutStatus;
  transaction_reference: string | null;
  processed_at: string | null;
  failure_reason: string | null;
  extra_data: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface PayoutDetails {
  phone?: string; // M-Pesa
  bank_account?: string;
  bank_name?: string;
  swift_code?: string;
  paypal_email?: string;
}

export interface InstructorRevenueSplit {
  id: string;
  instructor_id: string;
  course_id: string | null;
  instructor_pct: number;
  platform_pct: number;
  partner_pct: number;
  set_by: string | null;
  effective_from: string | null;
  effective_until: string | null;
  notes: string | null;
  created_at: string;
}

export interface EarningsBreakdown {
  total_gross: number;
  total_net: number;
  by_type: {
    course_sales: number;
    session_fees: number;
    bonuses: number;
    referrals: number;
  };
  by_course: Array<{
    course_id: string;
    course_title: string;
    amount: number;
    count: number;
  }>;
  by_session: Array<{
    session_id: string;
    session_title: string;
    amount: number;
  }>;
}

// ============================================================================
// Gamification
// ============================================================================

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface InstructorBadge {
  id: string;
  name: string;
  description: string;
  icon_url: string | null;
  category: string | null;
  criteria: Record<string, any>;
  tier: BadgeTier;
  points_value: number;
  is_active: boolean;
  created_at: string;
}

export interface InstructorBadgeAward {
  id: string;
  instructor_id: string;
  badge_id: string;
  badge: InstructorBadge;
  awarded_at: string;
  extra_data: Record<string, any> | null;
}

export interface InstructorPoints {
  id: string;
  instructor_id: string;
  points: number;
  level: number;
  streak_days: number;
  longest_streak: number;
  last_activity_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface InstructorPointsLog {
  id: string;
  instructor_id: string;
  points_delta: number;
  reason: string;
  source: string;
  extra_data: Record<string, any> | null;
  created_at: string;
}

export interface PeerKudo {
  id: string;
  from_instructor_id: string;
  from_instructor_name: string;
  from_instructor_avatar: string | null;
  to_instructor_id: string;
  to_instructor_name: string;
  message: string;
  category: string | null;
  is_public: boolean;
  created_at: string;
}

export interface LeaderboardEntry {
  rank: number;
  instructor_id: string;
  instructor_name: string;
  instructor_avatar: string | null;
  points: number;
  level: number;
  badges_count: number;
}

// ============================================================================
// Live Sessions
// ============================================================================

export interface InstructorSession {
  id: string;
  title: string;
  description: string | null;
  host_id: string;
  scheduled_at: string;
  started_at: string | null;
  ended_at: string | null;
  duration_minutes: number;
  max_participants: number;
  recording_enabled: boolean;
  screen_sharing_enabled: boolean;
  course_id: string | null;
  grade_level: string | null;
  status: 'scheduled' | 'started' | 'ended';
  extra_data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SessionAttendance {
  id: string;
  session_id: string;
  student_id: string;
  student_name: string;
  student_avatar: string | null;
  joined_at: string;
  left_at: string | null;
  duration_seconds: number | null;
  engagement_score: number | null;
  attention_data: Record<string, any> | null;
}

export interface SessionFollowUp {
  id: string;
  session_id: string;
  instructor_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: 'pending' | 'completed';
  assigned_to_student_id: string | null;
  assigned_to_student_name: string | null;
  created_at: string;
  completed_at: string | null;
}

// ============================================================================
// AI Insights & CBC Analysis
// ============================================================================

export interface InstructorDailyInsight {
  id: string;
  instructor_id: string;
  insight_date: string;
  insights: DailyInsightItem[];
  generated_at: string;
  ai_model_used: string | null;
  extra_data: Record<string, any> | null;
  created_at: string;
}

export interface DailyInsightItem {
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  title: string;
  description: string;
  action_url: string;
  ai_rationale: string;
}

export interface InstructorCBCAnalysis {
  id: string;
  course_id: string;
  instructor_id: string;
  alignment_score: number;
  competencies_covered: CBCCompetency[];
  competencies_missing: CBCCompetency[];
  suggestions: CBCSuggestion[];
  ai_model_used: string | null;
  analysis_data: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface CBCCompetency {
  strand: string;
  sub_strand: string;
  competency: string;
  lesson_references?: string[];
  importance?: 'low' | 'medium' | 'high';
}

export interface CBCSuggestion {
  type: 'add_content' | 'revise_content' | 'add_assessment' | 'add_activity';
  competency: string;
  rationale: string;
  priority: 'low' | 'medium' | 'high';
}

// ============================================================================
// Discussion Forum
// ============================================================================

export type PostType = 'discussion' | 'announcement' | 'question';

export interface InstructorForumPost {
  id: string;
  instructor_id: string;
  instructor_name: string;
  instructor_avatar: string | null;
  forum_id: string | null;
  title: string;
  content: string;
  post_type: PostType;
  is_pinned: boolean;
  is_moderated: boolean;
  sentiment_score: number | null;
  replies_count: number;
  created_at: string;
  updated_at: string;
}

export interface InstructorForumReply {
  id: string;
  post_id: string;
  author_id: string;
  author_name: string;
  author_avatar: string | null;
  content: string;
  sentiment_score: number | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// 2FA & Security
// ============================================================================

export interface InstructorTwoFactor {
  id: string;
  user_id: string;
  totp_enabled: boolean;
  sms_enabled: boolean;
  sms_phone: string | null;
  email_otp_enabled: boolean;
  last_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoginHistoryEntry {
  id: string;
  user_id: string;
  ip_address: string;
  user_agent: string;
  location: string | null;
  success: boolean;
  failure_reason: string | null;
  two_factor_method: string | null;
  created_at: string;
}

export interface TOTPSetupResponse {
  secret: string;
  qr_code_uri: string;
  backup_codes: string[];
}

// ============================================================================
// Courses & Assessments
// ============================================================================

export interface InstructorCourse {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  grade_levels: string[];
  learning_area: string;
  syllabus: Record<string, any>;
  lessons: Lesson[];
  instructor_id: string;
  is_platform_created: boolean;
  price: number;
  currency: string;
  is_published: boolean;
  is_featured: boolean;
  enrollment_count: number;
  average_rating: number;
  total_reviews: number;
  estimated_duration_hours: number | null;
  competencies: string[];
  revenue_split_id: string | null;
  cbc_analysis_id: string | null;
  ai_generated_meta: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  type: 'video' | 'text' | 'interactive' | 'quiz';
  duration_minutes: number | null;
  resources: Resource[];
  order: number;
}

export interface Resource {
  title: string;
  type: 'pdf' | 'link' | 'video' | 'file';
  url: string;
  size?: number;
}

export interface InstructorAssessment {
  id: string;
  title: string;
  description: string | null;
  assessment_type: 'quiz' | 'assignment' | 'project' | 'exam';
  course_id: string;
  questions: AssessmentQuestion[];
  time_limit_minutes: number | null;
  max_attempts: number;
  passing_score: number;
  is_published: boolean;
  total_submissions: number;
  average_score: number;
  created_at: string;
  updated_at: string;
}

export interface AssessmentQuestion {
  id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'essay' | 'short_answer';
  options?: string[];
  correct_answer?: string | string[];
  points: number;
  order: number;
}

export interface AssessmentSubmission {
  id: string;
  assessment_id: string;
  student_id: string;
  student_name: string;
  student_avatar: string | null;
  answers: Record<string, any>;
  score: number | null;
  is_graded: boolean;
  feedback: string | null;
  submitted_at: string;
  graded_at: string | null;
}

// ============================================================================
// Dashboard & Real-time
// ============================================================================

export interface InstructorRealtimeCounters {
  pendingSubmissions: number;
  unreadMessages: number;
  upcomingSessions: number;
  aiFlaggedStudents: number;
  unreadNotifications: number;
  pendingPayouts: number;
}

export interface InstructorDashboardStats {
  total_students: number;
  active_students_today: number;
  total_courses: number;
  published_courses: number;
  upcoming_sessions_count: number;
  earnings_this_month: number;
  earnings_total: number;
  average_rating: number;
  total_reviews: number;
  pending_submissions: number;
  ai_flagged_students: number[];
  current_streak: number;
  total_points: number;
  level: number;
}

export interface InstructorNotification {
  id: string;
  type: InstructorWSEventType;
  title: string;
  message: string;
  data: Record<string, any>;
  read: boolean;
  action_url?: string;
  created_at: string;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface PaginatedRequest {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface CourseCreateRequest {
  title: string;
  description: string;
  grade_levels: string[];
  learning_area: string;
  price?: number;
  thumbnail_url?: string;
}

export interface PayoutRequest {
  amount: number;
  payout_method: PayoutMethod;
  payout_details: PayoutDetails;
}

export interface BatchGradeRequest {
  submission_ids: string[];
  scores: number[];
  feedback: string[];
}

export interface SessionCreateRequest {
  title: string;
  description?: string;
  scheduled_at: string;
  duration_minutes: number;
  max_participants?: number;
  course_id?: string;
}

// ============================================================================
// WebRTC Types
// ============================================================================

export interface WebRTCSignal {
  type: 'offer' | 'answer' | 'ice_candidate' | 'screen_share_start' | 'screen_share_stop';
  data: any;
  from: string;
  to?: string;
}

export interface RTCParticipant {
  id: string;
  name: string;
  avatar: string | null;
  is_host: boolean;
  audio_enabled: boolean;
  video_enabled: boolean;
  screen_sharing: boolean;
}

// ============================================================================
// Yjs Collaboration Types
// ============================================================================

export interface CollaborationSession {
  doc_id: string;
  doc_title: string;
  participants: CollaborationParticipant[];
  created_at: string;
}

export interface CollaborationParticipant {
  user_id: string;
  user_name: string;
  user_avatar: string | null;
  cursor_color: string;
  last_seen: string;
}
