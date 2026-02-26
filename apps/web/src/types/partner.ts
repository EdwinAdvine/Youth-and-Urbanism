// ============================================================
// Partner Dashboard TypeScript Types
// Derived from backend/app/schemas/partner_schemas.py
// ============================================================

// --- Enums (string unions matching backend) ---

export type PartnershipTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export type OrganisationType =
  | 'corporate'
  | 'ngo'
  | 'foundation'
  | 'government'
  | 'individual'
  | 'faith_based'
  | 'community';

export type ProgramType = 'direct' | 'cohort';

export type ProgramStatus =
  | 'draft'
  | 'pending_approval'
  | 'active'
  | 'paused'
  | 'completed'
  | 'cancelled';

export type BillingPeriod = 'monthly' | 'termly' | 'annual';

export type SponsoredChildStatus =
  | 'pending_consent'
  | 'active'
  | 'paused'
  | 'graduated'
  | 'removed';

export type PartnerPaymentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'cancelled';

export type PartnerPaymentGateway =
  | 'mpesa'
  | 'bank_transfer'
  | 'paypal'
  | 'stripe'
  | 'invoice';

export type SubscriptionStatus =
  | 'active'
  | 'past_due'
  | 'paused'
  | 'cancelled'
  | 'expired';

export type ReportType = 'monthly' | 'termly' | 'annual' | 'custom' | 'ad_hoc';

export type ExportFormat = 'pdf' | 'csv' | 'xlsx' | 'json';

export type ResourceType =
  | 'document'
  | 'video'
  | 'image'
  | 'template'
  | 'presentation'
  | 'brochure';

export type ResourceStatus =
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'published'
  | 'archived';

export type TicketCategory =
  | 'billing'
  | 'technical'
  | 'program'
  | 'child_concern'
  | 'reporting'
  | 'account'
  | 'other';

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TicketStatus =
  | 'open'
  | 'in_progress'
  | 'waiting_on_partner'
  | 'waiting_on_staff'
  | 'resolved'
  | 'closed';

export type MeetingStatus =
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

// --- Generic Pagination ---

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// --- Partner Notifications ---

export interface PartnerNotification {
  id: string;
  title: string;
  message: string;
  type: 'sponsorship' | 'billing' | 'consent' | 'milestone' | 'system';
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  data?: any;
  created_at: string;
}

// --- Partner Profile ---

export interface PartnerProfile {
  id: string;
  user_id: string;
  org_name: string;
  org_type: OrganisationType;
  display_name: string | null;
  bio: string | null;
  tagline: string | null;
  logo_url: string | null;
  banner_url: string | null;
  contact_email: string;
  contact_phone: string | null;
  website_url: string | null;
  registration_number: string | null;
  tax_id: string | null;
  specializations: string[];
  partnership_tier: PartnershipTier;
  branding_config: Record<string, any>;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

// --- Sponsorship Program ---

export interface SponsorshipProgram {
  id: string;
  partner_id: string;
  name: string;
  description: string | null;
  program_type: ProgramType;
  min_children: number;
  max_children: number | null;
  status: ProgramStatus;
  billing_period: BillingPeriod;
  price_per_child: number;
  currency: string;
  goals: string[];
  target_grade_levels: string[];
  target_regions: string[];
  start_date: string | null;
  end_date: string | null;
  current_children_count: number;
  created_at: string;
  updated_at: string;
}

// --- Sponsored Child ---

export interface SponsoredChild {
  id: string;
  program_id: string;
  student_id: string;
  partner_id: string;
  status: SponsoredChildStatus;
  partner_goals: string[];
  ai_milestones: Array<Record<string, any>>;
  notes: string | null;
  consent_given: boolean;
  student_name: string | null;
  grade_level: string | null;
  created_at: string;
  updated_at: string;
}

// --- Sponsorship Consent ---

export interface SponsorshipConsent {
  id: string;
  sponsored_child_id: string;
  parent_id: string;
  consent_given: boolean;
  consent_text: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// --- Child Learning Journey ---

export interface ChildLearningJourney {
  student_id: string;
  student_name: string | null;
  grade_level: string | null;
  cbc_competencies: Record<string, any>;
  weekly_progress: Array<Record<string, any>>;
  focus_areas: string[];
  strengths: string[];
  growing_edges: string[];
  overall_progress_pct: number;
}

// --- Child Activity ---

export interface ChildActivity {
  student_id: string;
  period_start: string;
  period_end: string;
  time_spent_minutes: number;
  sessions_count: number;
  streaks: number;
  most_engaged_content: Array<Record<string, any>>;
  ai_tutor_highlights: string[];
}

// --- Child Achievement ---

export interface ChildAchievement {
  student_id: string;
  certificates: Array<Record<string, any>>;
  badges: Array<Record<string, any>>;
  milestones: Array<Record<string, any>>;
  total_points: number;
}

// --- Child Goal ---

export interface ChildGoal {
  id: string | null;
  student_id: string;
  goal: string;
  target_date: string | null;
  progress_percentage: number;
  ai_suggested: boolean;
  status: string;
  created_at: string | null;
  updated_at: string | null;
}

// --- Child AI Insight ---

export interface ChildAIInsight {
  student_id: string;
  learning_style: string | null;
  support_tips: string[];
  upcoming_topics: string[];
  curiosity_patterns: string[];
  early_warnings: Array<Record<string, any>>;
  generated_at: string | null;
}

// --- Partner Subscription ---

export interface PartnerSubscription {
  id: string;
  partner_id: string;
  program_id: string;
  billing_period: BillingPeriod;
  amount_per_child: number;
  total_children: number;
  total_amount: number;
  currency: string;
  status: SubscriptionStatus;
  auto_renew: boolean;
  current_period_start: string | null;
  current_period_end: string | null;
  next_billing_date: string | null;
  created_at: string;
  updated_at: string;
}

// --- Partner Payment ---

export interface PartnerPayment {
  id: string;
  subscription_id: string;
  amount: number;
  currency: string;
  status: PartnerPaymentStatus;
  payment_gateway: PartnerPaymentGateway;
  transaction_reference: string | null;
  receipt_url: string | null;
  invoice_number: string | null;
  period_start: string | null;
  period_end: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

// --- Partner Impact Report ---

export interface PartnerImpactReport {
  id: string;
  partner_id: string;
  report_type: ReportType;
  title: string;
  summary: string | null;
  metrics: Record<string, any>;
  ai_insights: Record<string, any>;
  cbc_progress: Record<string, any>;
  export_format: ExportFormat;
  export_url: string | null;
  generated_at: string | null;
  created_at: string;
  updated_at: string;
}

// --- ROI Metrics ---

export interface ROIMetrics {
  total_invested: number;
  students_supported: number;
  avg_progress: number;
  completion_rate: number;
  cost_per_student: number;
  cost_per_completion: number | null;
  engagement_rate: number;
}

// --- Custom Report ---

export interface CustomReport {
  id: string;
  partner_id: string;
  report_type: ReportType;
  title: string;
  summary: string | null;
  metrics: Record<string, any>;
  generated_at: string | null;
  created_at: string;
}

// --- Partner Resource ---

export interface PartnerResource {
  id: string;
  partner_id: string;
  title: string;
  description: string | null;
  resource_type: ResourceType;
  file_url: string;
  status: ResourceStatus;
  branding_applied: boolean;
  target_programs: string[];
  created_at: string;
  updated_at: string;
}

// --- Partner Message ---

export interface PartnerMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  subject: string;
  body: string;
  attachments: Array<Record<string, any>>;
  is_read: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

// --- Partner Meeting ---

export interface PartnerMeeting {
  id: string;
  partner_id: string;
  title: string;
  description: string | null;
  scheduled_at: string;
  duration_minutes: number;
  meeting_url: string | null;
  attendees: string[];
  status: MeetingStatus;
  ai_suggested: boolean;
  created_at: string;
  updated_at: string;
}

// --- Partner Ticket ---

export interface PartnerTicket {
  id: string;
  partner_id: string;
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  attachments: Array<Record<string, any>>;
  related_program_id: string | null;
  related_child_id: string | null;
  assigned_to: string | null;
  ai_triage_priority: string | null;
  ai_triage_category: string | null;
  ai_suggested_response: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

// --- Dashboard Overview ---

export interface PartnerDashboardOverview {
  total_programs: number;
  active_programs: number;
  draft_programs: number;
  total_children_sponsored: number;
  active_children: number;
  pending_consent: number;
  total_invested: number;
  current_monthly_cost: number;
  currency: string;
  avg_child_progress: number;
  avg_engagement_rate: number;
  ai_highlights: Array<Record<string, any>>;
  recent_payments: Array<Record<string, any>>;
  upcoming_meetings: Array<Record<string, any>>;
  open_tickets: number;
  unread_messages: number;
}

// --- Budget Overview ---

export interface BudgetOverview {
  total_budget: number;
  spent: number;
  remaining: number;
  allocation_breakdown: Record<string, number>;
  next_payment_date: string | null;
  next_payment_amount: number | null;
  currency: string;
}
