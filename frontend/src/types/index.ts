// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'parent' | 'instructor' | 'admin' | 'partner';
  avatar?: string;
  createdAt: Date;
  lastLogin: Date;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'sw';
  notifications: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  dashboardWidgets: DashboardWidget[];
}

// Course Types
export interface Course {
  id: string;
  title: string;
  description: string;
  category: CourseCategory;
  level: 'beginner' | 'intermediate' | 'advanced';
  instructor: string;
  instructorId: string;
  duration: string;
  lessons: Lesson[];
  progress: number;
  enrolledAt: Date;
  status: 'enrolled' | 'in_progress' | 'completed' | 'dropped';
  rating?: number;
  reviews: Review[];
  price: number;
  isFree: boolean;
  thumbnail?: string;
  tags: string[];
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  type: 'video' | 'reading' | 'quiz' | 'assignment';
  contentUrl?: string;
  completed: boolean;
  completedAt?: Date;
  progress: number;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export type CourseCategory = 
  | 'core_competencies'
  | 'core_values'
  | 'languages'
  | 'mathematics'
  | 'science_technology'
  | 'social_studies'
  | 'religious_education'
  | 'creative_arts'
  | 'physical_health'
  | 'agriculture_nutrition'
  | 'home_science'
  | 'pre_technical_career';

// Assignment Types
export interface Assignment {
  id: string;
  title: string;
  description: string;
  courseId: string;
  courseTitle: string;
  dueDate: Date;
  createdAt: Date;
  status: 'pending' | 'submitted' | 'graded' | 'overdue';
  submission?: Submission;
  grade?: number;
  feedback?: string;
  maxPoints: number;
  type: 'homework' | 'project' | 'quiz' | 'exam';
  attachments?: Attachment[];
}

export interface Submission {
  id: string;
  assignmentId: string;
  userId: string;
  content: string;
  attachments: Attachment[];
  submittedAt: Date;
  updatedAt: Date;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: 'document' | 'image' | 'video' | 'audio';
  size: number;
}

// Quiz Types
export interface Quiz {
  id: string;
  title: string;
  description: string;
  courseId: string;
  courseTitle: string;
  duration: number; // in minutes
  questions: Question[];
  totalPoints: number;
  passingScore: number;
  attemptsAllowed: number;
  createdAt: Date;
  scheduledDate?: Date;
  results: QuizResult[];
}

export interface Question {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'matching';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  points: number;
  explanation?: string;
}

export interface QuizResult {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  totalPoints: number;
  percentage: number;
  answers: Answer[];
  completedAt: Date;
  attemptNumber: number;
}

export interface Answer {
  questionId: string;
  userAnswer: string | string[];
  isCorrect: boolean;
  pointsAwarded: number;
}

// Certificate Types
export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  courseTitle: string;
  completionDate: Date;
  certificateUrl: string;
  verificationCode: string;
  type: 'course_completion' | 'achievement' | 'badge';
  metadata: CertificateMetadata;
}

export interface CertificateMetadata {
  instructor: string;
  duration: string;
  totalLessons: number;
  finalGrade: number;
  skills: string[];
}

// Transaction Types
export interface Transaction {
  id: string;
  userId: string;
  type: 'credit' | 'debit';
  amount: number;
  currency: 'KES';
  description: string;
  category: 'course_purchase' | 'subscription' | 'refund' | 'payout' | 'wallet_topup';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: Date;
  referenceId?: string;
  metadata?: Record<string, any>;
}

// Forum Types
export interface ForumPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  category: ForumCategory;
  tags: string[];
  replies: ForumReply[];
  createdAt: Date;
  updatedAt: Date;
  isPinned: boolean;
  isLocked: boolean;
  views: number;
  likes: string[]; // userIds
}

export interface ForumReply {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: Date;
  isEdited: boolean;
  editedAt?: Date;
  likes: string[]; // userIds
}

export type ForumCategory = 
  | 'general_discussion'
  | 'course_help'
  | 'technical_support'
  | 'study_groups'
  | 'announcements'
  | 'off_topic';

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'assignment_due' | 'grade_published' | 'forum_reply' | 'course_update' | 'system';
  title: string;
  message: string;
  data?: NotificationData;
  read: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export interface NotificationData {
  courseId?: string;
  assignmentId?: string;
  postId?: string;
  actionUrl?: string;
}

// Analytics Types
export interface AnalyticsData {
  userId: string;
  timeRange: 'week' | 'month' | 'year';
  courseProgress: CourseProgressData[];
  timeSpent: TimeSpentData[];
  assignmentStats: AssignmentStats;
  quizStats: QuizStats;
  engagement: EngagementData;
}

export interface CourseProgressData {
  courseId: string;
  courseTitle: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  lastActive: Date;
}

export interface TimeSpentData {
  date: string;
  minutes: number;
}

export interface AssignmentStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  averageGrade: number;
}

export interface QuizStats {
  total: number;
  passed: number;
  failed: number;
  averageScore: number;
  bestScore: number;
}

export interface EngagementData {
  totalLogins: number;
  averageSessionTime: number;
  activeDays: number;
  forumPosts: number;
  forumReplies: number;
}

// Dashboard Types
export interface DashboardWidget {
  id: string;
  type: 'welcome' | 'stats' | 'calendar' | 'continue_learning' | 'upcoming_events' | 'assignments' | 'performance' | 'recommended';
  position: { x: number; y: number; w: number; h: number };
  collapsed: boolean;
  settings: WidgetSettings;
}

export interface WidgetSettings {
  refreshInterval?: number;
  showDetails?: boolean;
  customTitle?: string;
}

// Form Types
export interface CourseFormData {
  title: string;
  description: string;
  category: CourseCategory;
  level: 'beginner' | 'intermediate' | 'advanced';
  instructor: string;
  price: number;
  isFree: boolean;
  tags: string[];
}

export interface AssignmentFormData {
  title: string;
  description: string;
  courseId: string;
  dueDate: Date;
  maxPoints: number;
  type: 'homework' | 'project' | 'quiz' | 'exam';
  attachments: File[];
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Utility Types
export type SortDirection = 'asc' | 'desc';
export type FilterOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';

export interface Filter {
  field: string;
  operator: FilterOperator;
  value: any;
}

export interface Sort {
  field: string;
  direction: SortDirection;
}

export interface Pagination {
  page: number;
  limit: number;
}

export interface ListParams {
  filters?: Filter[];
  sort?: Sort;
  pagination?: Pagination;
}