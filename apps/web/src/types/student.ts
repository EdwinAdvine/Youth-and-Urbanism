// Student Dashboard Types

export type MoodType = 'happy' | 'okay' | 'tired' | 'frustrated' | 'excited';
export type AgeGroup = 'young' | 'tween' | 'teen' | 'senior';
export type AIPersonality = 'friendly' | 'professional' | 'encouraging' | 'playful';

// Dashboard & Daily Plan
export interface DailyPlanItem {
  id: string;
  type: 'lesson' | 'assignment' | 'quiz' | 'practice' | 'break' | 'review';
  title: string;
  description?: string;
  duration: number; // minutes
  completed: boolean;
  courseId?: string;
  teacherNote?: string;
  aiSuggested: boolean;
  priority: 'low' | 'medium' | 'high';
  timeSlot?: string; // "09:00-10:00"
  order: number;
}

export interface DailyPlan {
  id: string;
  studentId: string;
  date: string;
  items: DailyPlanItem[];
  aiGenerated: boolean;
  manuallyEdited: boolean;
  totalDuration: number;
  completedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentDashboard {
  id: string;
  studentId: string;
  dailyPlan: DailyPlan;
  currentStreak: number;
  longestStreak: number;
  currentMood?: MoodEntry;
  urgentItems: UrgentItem[];
  dailyQuote?: DailyQuote;
  teacherSync: TeacherSyncItem[];
  xp: number;
  level: number;
  recentBadges: Badge[];
}

// Mood Tracking
export interface MoodEntry {
  id: string;
  studentId: string;
  moodType: MoodType;
  energyLevel: number; // 1-5
  note?: string;
  timestamp: Date;
  context?: 'login' | 'manual' | 'ai_prompt';
}

// Streaks
export interface Streak {
  id: string;
  studentId: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date;
  streakShields: number; // Can "freeze" a streak
  history: StreakHistory[];
}

export interface StreakHistory {
  date: string;
  completed: boolean;
  activitiesCount: number;
}

// Gamification
export interface XPEvent {
  id: string;
  studentId: string;
  xpAmount: number;
  source: 'assignment' | 'quiz' | 'challenge' | 'streak' | 'login' | 'helping_peer' | 'project';
  description: string;
  timestamp: Date;
  multiplier?: number;
}

export interface Level {
  id: string;
  studentId: string;
  currentLevel: number;
  totalXp: number;
  nextLevelXp: number;
  percentToNext: number;
}

export interface Badge {
  id: string;
  studentId?: string;
  badgeType: 'achievement' | 'milestone' | 'skill' | 'special';
  badgeName: string;
  description: string;
  icon: string; // URL or icon name
  earnedAt?: Date;
  isShareable: boolean;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  metadata?: Record<string, any>;
}

export interface Achievement extends Badge {
  criteria: string;
  progress: number;
  target: number;
  category: string;
}

// Learning Goals & Habits
export interface LearningGoal {
  id: string;
  studentId: string;
  title: string;
  description?: string;
  target: number;
  current: number;
  unit: string; // "lessons", "hours", "assignments"
  deadline?: Date;
  aiSuggested: boolean;
  teacherAssigned: boolean;
  status: 'active' | 'completed' | 'abandoned';
  createdAt: Date;
}

export interface HabitTracker {
  id: string;
  studentId: string;
  habitName: string;
  frequency: 'daily' | 'weekly';
  completedDates: string[]; // Array of ISO date strings
  currentStreak: number;
  longestStreak: number;
}

// Community & Social
export interface FriendRequest {
  id: string;
  fromStudentId: string;
  toStudentId: string;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: Date;
}

export interface StudyGroup {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  members: string[]; // Student IDs
  subject?: string;
  maxMembers: number;
  isPublic: boolean;
  createdAt: Date;
}

export interface Shoutout {
  id: string;
  fromStudent: string;
  toStudent: string;
  message: string;
  category: 'helpful' | 'creative' | 'hardworking' | 'kind' | 'smart';
  createdAt: Date;
  likes: number;
}

// Teacher Collaboration
export interface TeacherMessage {
  id: string;
  teacherId: string;
  studentId: string;
  message: string;
  aiSummary?: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
}

export interface TeacherCollaboration {
  id: string;
  studentId: string;
  teacherId: string;
  questionFromStudent?: string;
  responseFromTeacher?: string;
  aiSummary?: string;
  status: 'pending' | 'answered' | 'escalated';
  createdAt: Date;
}

export interface TeacherSyncItem {
  id: string;
  teacherId: string;
  teacherName: string;
  note: string;
  attachedToDailyPlan: boolean;
  courseId?: string;
  priority: 'info' | 'todo' | 'urgent';
  createdAt: Date;
}

// Support
export interface SupportTicket {
  id: string;
  studentId: string;
  subject: string;
  description: string;
  category: 'technical' | 'account' | 'course' | 'payment' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupportChat {
  id: string;
  ticketId?: string;
  studentId: string;
  messages: ChatMessage[];
  status: 'active' | 'closed';
  assignedAgentId?: string;
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderType: 'student' | 'agent' | 'ai';
  content: string;
  timestamp: Date;
  read: boolean;
}

// Wallet & Payments
export interface Subscription {
  id: string;
  studentId: string;
  planName: string;
  planType: 'basic' | 'premium' | 'family';
  status: 'active' | 'cancelled' | 'expired';
  amount: number;
  currency: string;
  billingCycle: 'monthly' | 'annually';
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
}

export interface Receipt {
  id: string;
  transactionId: string;
  studentId: string;
  amount: number;
  currency: string;
  description: string;
  method: 'mpesa' | 'card' | 'bank';
  status: 'success' | 'pending' | 'failed';
  downloadUrl?: string;
  createdAt: Date;
}

// Student Preferences
export interface StudentPreferences {
  ageUiMode?: AgeGroup; // Manual override for UI adaptation
  aiPersonality: AIPersonality;
  language: 'en' | 'sw';
  theme: 'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  soundEffects: boolean;
  animations: boolean;
  autoPlayVideos: boolean;
  showHints: boolean;
}

// Notifications
export type NotificationCategory =
  | 'assignment_due'
  | 'quiz_available'
  | 'grade_published'
  | 'teacher_message'
  | 'friend_request'
  | 'shoutout_received'
  | 'achievement_unlocked'
  | 'streak_milestone'
  | 'live_session_starting'
  | 'course_update'
  | 'system';

export interface NotificationItem {
  id: string;
  studentId: string;
  category: NotificationCategory;
  title: string;
  message: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

// Projects & Uploads
export interface ProjectUpload {
  id: string;
  studentId: string;
  projectId: string;
  fileName: string;
  filePath: string;
  fileType: string; // MIME type
  fileSize: number; // bytes
  version: number;
  uploadedAt: Date;
  status: 'uploaded' | 'processing' | 'ready' | 'error';
}

export interface PeerGalleryItem {
  id: string;
  projectId: string;
  studentId: string;
  studentName: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  likes: number;
  views: number;
  tags: string[];
  createdAt: Date;
}

// Skill Tree & Progress
export interface SkillNode {
  id: string;
  studentId: string;
  skillName: string;
  subject: string;
  proficiency: number; // 0-100
  parentNodeId?: string;
  childNodes: string[];
  lastPracticed?: Date;
}

export interface SkillTree {
  id: string;
  studentId: string;
  nodes: SkillNode[];
  overallProficiency: number;
  strongestSkills: string[];
  growingSkills: string[];
}

// Live Sessions
export interface LiveSessionStudent {
  id: string;
  sessionId: string;
  studentId: string;
  joinedAt?: Date;
  leftAt?: Date;
  participationScore: number;
  handRaisedCount: number;
  questionsAsked: number;
  status: 'registered' | 'joined' | 'left';
}

export interface SessionRecording {
  id: string;
  sessionId: string;
  title: string;
  recordingUrl: string;
  duration: number; // seconds
  thumbnailUrl?: string;
  transcriptUrl?: string;
  chaptersUrl?: string;
  recordedAt: Date;
  expiresAt?: Date;
}

// Wishlist & Course Review
export interface Wishlist {
  id: string;
  studentId: string;
  courseId: string;
  addedAt: Date;
  priority: number;
}

export interface CourseReview {
  id: string;
  studentId: string;
  courseId: string;
  rating: number; // 1-5
  reviewText?: string;
  wouldRecommend: boolean;
  createdAt: Date;
}

// Daily Quote
export interface DailyQuote {
  id: string;
  quote: string;
  author?: string;
  category: 'motivational' | 'educational' | 'fun';
  date: string;
  microLesson?: {
    title: string;
    content: string;
    duration: number; // seconds
  };
}

// Urgent Items
export interface UrgentItem {
  id: string;
  type: 'assignment' | 'quiz' | 'live_session' | 'teacher_message' | 'payment';
  title: string;
  description?: string;
  dueDate?: Date;
  actionUrl: string;
  priority: 'high' | 'urgent';
}

// Weekly Report
export interface WeeklyReport {
  id: string;
  studentId: string;
  weekStart: Date;
  weekEnd: Date;
  aiStory: string; // AI-generated narrative
  metrics: {
    lessonsCompleted: number;
    assignmentsSubmitted: number;
    quizzesTaken: number;
    averageScore: number;
    timeSpent: number; // minutes
    streakDays: number;
    xpEarned: number;
    badgesEarned: number;
  };
  strongestSubject?: string;
  improvementArea?: string;
  teacherHighlight?: string;
  sharedWithParent: boolean;
  createdAt: Date;
}

// AI Journal
export interface JournalEntry {
  id: string;
  studentId: string;
  content: string;
  moodTag?: MoodType;
  aiInsights?: {
    sentiment: 'positive' | 'neutral' | 'negative';
    topics: string[];
    suggestions: string[];
  };
  reflectionPrompts?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Session Prep
export interface SessionPrep {
  id: string;
  sessionId: string;
  studentId: string;
  tips: string[];
  engagementPrediction: 'high' | 'medium' | 'low';
  recommendedPreReading?: string[];
  teacherNotes?: string;
  createdAt: Date;
}

// Teacher Access Controls
export interface TeacherAccessControl {
  id: string;
  studentId: string;
  teacherId: string;
  canViewProgress: boolean;
  canViewMood: boolean;
  canMessage: boolean;
  canViewJournal: boolean;
  canAssignWork: boolean;
  parentApprovalRequired: boolean;
}

// COPPA Consent
export interface ConsentRecord {
  id: string;
  studentId: string;
  parentId?: string;
  consentType: 'data_collection' | 'ai_interaction' | 'social_features' | 'teacher_access';
  granted: boolean;
  grantedAt?: Date;
  expiresAt?: Date;
  ipAddress?: string;
  parentSignature?: string;
}
