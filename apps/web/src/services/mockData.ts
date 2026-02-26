import {
  User,
  Course,
  Assignment,
  Quiz,
  Certificate,
  Transaction,
  ForumPost,
  Notification,
  CourseCategory,
} from '../types/index';

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    createdAt: new Date('2024-01-15'),
    lastLogin: new Date('2024-03-15'),
    preferences: {
      theme: 'light',
      language: 'en',
      notifications: true,
      emailNotifications: true,
      pushNotifications: false,
      dashboardWidgets: []
    }
  },
  {
    id: 'user-2',
    name: 'Michael Chen',
    email: 'michael.chen@example.com',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    createdAt: new Date('2024-02-20'),
    lastLogin: new Date('2024-03-14'),
    preferences: {
      theme: 'dark',
      language: 'en',
      notifications: true,
      emailNotifications: false,
      pushNotifications: true,
      dashboardWidgets: []
    }
  }
];

// Mock Courses
export const mockCourses: Course[] = [
  {
    id: 'course-1',
    title: 'Mathematics - Algebra Basics',
    description: 'Master the fundamentals of algebra including equations, inequalities, and functions.',
    category: 'mathematics',
    level: 'beginner',
    instructor: 'Dr. Emily Watson',
    instructorId: 'instructor-1',
    duration: '6 weeks',
    lessons: [
      {
        id: 'lesson-1-1',
        title: 'Introduction to Algebra',
        description: 'Understanding variables and expressions',
        duration: '15 minutes',
        type: 'video',
        contentUrl: 'https://example.com/video1',
        completed: true,
        completedAt: new Date('2024-03-10'),
        progress: 100
      },
      {
        id: 'lesson-1-2',
        title: 'Linear Equations',
        description: 'Solving linear equations and graphing',
        duration: '20 minutes',
        type: 'video',
        contentUrl: 'https://example.com/video2',
        completed: true,
        completedAt: new Date('2024-03-11'),
        progress: 100
      },
      {
        id: 'lesson-1-3',
        title: 'Quadratic Equations',
        description: 'Understanding and solving quadratic equations',
        duration: '25 minutes',
        type: 'video',
        contentUrl: 'https://example.com/video3',
        completed: false,
        progress: 40
      }
    ],
    progress: 67,
    enrolledAt: new Date('2024-03-01'),
    status: 'in_progress',
    rating: 4.5,
    reviews: [
      {
        id: 'review-1',
        userId: 'user-1',
        userName: 'Sarah Johnson',
        rating: 5,
        comment: 'Excellent course! Very clear explanations.',
        createdAt: new Date('2024-03-10')
      }
    ],
    price: 0,
    isFree: true,
    thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop',
    tags: ['algebra', 'math', 'beginner']
  },
  {
    id: 'course-2',
    title: 'English - Reading Comprehension',
    description: 'Improve your reading skills and comprehension techniques.',
    category: 'languages',
    level: 'intermediate',
    instructor: 'Prof. James Wilson',
    instructorId: 'instructor-2',
    duration: '4 weeks',
    lessons: [
      {
        id: 'lesson-2-1',
        title: 'Reading Strategies',
        description: 'Effective reading techniques',
        duration: '18 minutes',
        type: 'reading',
        contentUrl: 'https://example.com/article1',
        completed: true,
        completedAt: new Date('2024-03-12'),
        progress: 100
      },
      {
        id: 'lesson-2-2',
        title: 'Critical Analysis',
        description: 'Analyzing texts critically',
        duration: '22 minutes',
        type: 'reading',
        contentUrl: 'https://example.com/article2',
        completed: true,
        completedAt: new Date('2024-03-13'),
        progress: 100
      }
    ],
    progress: 100,
    enrolledAt: new Date('2024-02-28'),
    status: 'completed',
    rating: 4.2,
    reviews: [],
    price: 2500,
    isFree: false,
    thumbnail: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=400&h=300&fit=crop',
    tags: ['english', 'reading', 'comprehension']
  },
  {
    id: 'course-3',
    title: 'Science - Ecosystems',
    description: 'Explore the fascinating world of ecosystems and biodiversity.',
    category: 'science_technology',
    level: 'beginner',
    instructor: 'Dr. Anna Rodriguez',
    instructorId: 'instructor-3',
    duration: '8 weeks',
    lessons: [
      {
        id: 'lesson-3-1',
        title: 'Introduction to Ecosystems',
        description: 'Understanding ecosystem components',
        duration: '20 minutes',
        type: 'video',
        contentUrl: 'https://example.com/video4',
        completed: false,
        progress: 0
      }
    ],
    progress: 0,
    enrolledAt: new Date('2024-03-15'),
    status: 'enrolled',
    rating: 0,
    reviews: [],
    price: 0,
    isFree: true,
    thumbnail: 'https://images.unsplash.com/photo-1541997264101-F8fe5349c657?w=400&h=300&fit=crop',
    tags: ['science', 'ecosystems', 'biology']
  }
];

// Mock Assignments
export const mockAssignments: Assignment[] = [
  {
    id: 'assignment-1',
    title: 'Algebra Practice Problems',
    description: 'Solve the following algebra problems and submit your solutions.',
    courseId: 'course-1',
    courseTitle: 'Mathematics - Algebra Basics',
    dueDate: new Date('2024-03-20'),
    createdAt: new Date('2024-03-15'),
    status: 'pending',
    submission: undefined,
    grade: undefined,
    feedback: undefined,
    maxPoints: 100,
    type: 'homework',
    attachments: [
      {
        id: 'att-1',
        name: 'algebra_problems.pdf',
        url: 'https://example.com/algebra_problems.pdf',
        type: 'document',
        size: 1024
      }
    ]
  },
  {
    id: 'assignment-2',
    title: 'Reading Analysis Essay',
    description: 'Write a 500-word analysis of the provided text.',
    courseId: 'course-2',
    courseTitle: 'English - Reading Comprehension',
    dueDate: new Date('2024-03-18'),
    createdAt: new Date('2024-03-10'),
    status: 'submitted',
    submission: {
      id: 'sub-1',
      assignmentId: 'assignment-2',
      userId: 'user-1',
      content: 'This is my essay content about the reading analysis...',
      attachments: [],
      submittedAt: new Date('2024-03-16'),
      updatedAt: new Date('2024-03-16')
    },
    grade: 85,
    feedback: 'Good analysis, but needs more specific examples from the text.',
    maxPoints: 100,
    type: 'homework',
    attachments: []
  },
  {
    id: 'assignment-3',
    title: 'Ecosystem Project',
    description: 'Create a presentation about a local ecosystem.',
    courseId: 'course-3',
    courseTitle: 'Science - Ecosystems',
    dueDate: new Date('2024-04-01'),
    createdAt: new Date('2024-03-15'),
    status: 'pending',
    submission: undefined,
    grade: undefined,
    feedback: undefined,
    maxPoints: 200,
    type: 'project',
    attachments: []
  }
];

// Mock Quizzes
export const mockQuizzes: Quiz[] = [
  {
    id: 'quiz-1',
    title: 'Algebra Basics Quiz',
    description: 'Test your understanding of basic algebra concepts.',
    courseId: 'course-1',
    courseTitle: 'Mathematics - Algebra Basics',
    duration: 30,
    questions: [
      {
        id: 'q-1',
        type: 'multiple_choice',
        question: 'What is the solution to 2x + 5 = 15?',
        options: ['x = 5', 'x = 7.5', 'x = 10', 'x = 3'],
        correctAnswer: 'x = 5',
        points: 10,
        explanation: '2x = 15 - 5 = 10, so x = 5'
      },
      {
        id: 'q-2',
        type: 'true_false',
        question: 'The equation y = 2x + 3 represents a linear function.',
        options: ['True', 'False'],
        correctAnswer: 'True',
        points: 5,
        explanation: 'This is in the form y = mx + b, which is linear.'
      }
    ],
    totalPoints: 15,
    passingScore: 10,
    attemptsAllowed: 3,
    createdAt: new Date('2024-03-14'),
    scheduledDate: undefined,
    results: [
      {
        id: 'result-1',
        quizId: 'quiz-1',
        userId: 'user-1',
        score: 15,
        totalPoints: 15,
        percentage: 100,
        answers: [
          {
            questionId: 'q-1',
            userAnswer: 'x = 5',
            isCorrect: true,
            pointsAwarded: 10
          },
          {
            questionId: 'q-2',
            userAnswer: 'True',
            isCorrect: true,
            pointsAwarded: 5
          }
        ],
        completedAt: new Date('2024-03-15'),
        attemptNumber: 1
      }
    ]
  }
];

// Mock Certificates
export const mockCertificates: Certificate[] = [
  {
    id: 'cert-1',
    userId: 'user-1',
    courseId: 'course-2',
    courseTitle: 'English - Reading Comprehension',
    completionDate: new Date('2024-03-14'),
    certificateUrl: 'https://example.com/certificates/cert-1.pdf',
    verificationCode: 'ABC123XYZ',
    type: 'course_completion',
    metadata: {
      instructor: 'Prof. James Wilson',
      duration: '4 weeks',
      totalLessons: 2,
      finalGrade: 92,
      skills: ['Reading Comprehension', 'Critical Analysis', 'Text Analysis']
    }
  }
];

// Mock Transactions
export const mockTransactions: Transaction[] = [
  {
    id: 'trans-1',
    userId: 'user-1',
    type: 'debit',
    amount: 2500,
    currency: 'KES',
    description: 'Course purchase: English - Reading Comprehension',
    category: 'course_purchase',
    status: 'completed',
    createdAt: new Date('2024-02-28'),
    referenceId: 'course-purchase-123',
    metadata: {
      courseId: 'course-2',
      courseTitle: 'English - Reading Comprehension'
    }
  },
  {
    id: 'trans-2',
    userId: 'user-1',
    type: 'credit',
    amount: 500,
    currency: 'KES',
    description: 'Refund for dropped course',
    category: 'refund',
    status: 'completed',
    createdAt: new Date('2024-03-05'),
    referenceId: 'refund-456',
    metadata: {
      courseId: 'course-1',
      reason: 'Course not suitable'
    }
  },
  {
    id: 'trans-3',
    userId: 'user-1',
    type: 'debit',
    amount: 100,
    currency: 'KES',
    description: 'Wallet top-up',
    category: 'wallet_topup',
    status: 'completed',
    createdAt: new Date('2024-03-10'),
    referenceId: 'wallet-789',
    metadata: {}
  }
];

// Mock Forum Posts
export const mockForumPosts: ForumPost[] = [
  {
    id: 'post-1',
    title: 'Struggling with Algebra Equations',
    content: 'I\'m having trouble understanding how to solve quadratic equations. Can anyone help explain the quadratic formula?',
    authorId: 'user-1',
    authorName: 'Sarah Johnson',
    category: 'course_help',
    tags: ['algebra', 'math', 'help'],
    replies: [
      {
        id: 'reply-1',
        postId: 'post-1',
        authorId: 'user-2',
        authorName: 'Michael Chen',
        content: 'The quadratic formula is x = (-b ± √(b²-4ac)) / 2a. Let me know if you need help with a specific problem!',
        createdAt: new Date('2024-03-15'),
        isEdited: false,
        likes: ['user-1']
      }
    ],
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date('2024-03-15'),
    isPinned: false,
    isLocked: false,
    views: 15,
    likes: ['user-2']
  },
  {
    id: 'post-2',
    title: 'Best Study Techniques for Reading Comprehension',
    content: 'What are your favorite techniques for improving reading comprehension? I find it hard to retain information from long texts.',
    authorId: 'user-2',
    authorName: 'Michael Chen',
    category: 'study_groups',
    tags: ['reading', 'study-tips', 'comprehension'],
    replies: [],
    createdAt: new Date('2024-03-14'),
    updatedAt: new Date('2024-03-14'),
    isPinned: true,
    isLocked: false,
    views: 23,
    likes: []
  }
];

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    userId: 'user-1',
    type: 'assignment_due',
    title: 'Assignment Due Soon',
    message: 'Your Algebra Practice Problems assignment is due in 2 days.',
    data: {
      courseId: 'course-1',
      assignmentId: 'assignment-1',
      actionUrl: '/dashboard/student/assignments/pending'
    },
    read: false,
    createdAt: new Date('2024-03-18'),
    expiresAt: new Date('2024-03-20')
  },
  {
    id: 'notif-2',
    userId: 'user-1',
    type: 'grade_published',
    title: 'Quiz Results Available',
    message: 'Your Algebra Basics quiz has been graded. You scored 100%!',
    data: {
      courseId: 'course-1',
      assignmentId: 'quiz-1',
      actionUrl: '/dashboard/student/quizzes/results'
    },
    read: false,
    createdAt: new Date('2024-03-16'),
    expiresAt: undefined
  },
  {
    id: 'notif-3',
    userId: 'user-1',
    type: 'forum_reply',
    title: 'New Reply to Your Post',
    message: 'Michael Chen replied to your post about algebra equations.',
    data: {
      postId: 'post-1',
      actionUrl: '/dashboard/student/community/forum/post-1'
    },
    read: true,
    createdAt: new Date('2024-03-15'),
    expiresAt: undefined
  }
];

// Helper functions to generate more mock data
export const generateMockData = () => {
  // Generate additional courses
  const additionalCourses: Course[] = [];
  const categories: CourseCategory[] = ['languages', 'science_technology', 'social_studies', 'creative_arts'];
  
  for (let i = 0; i < 5; i++) {
    additionalCourses.push({
      id: `course-${4 + i}`,
      title: `Sample Course ${i + 1}`,
      description: `This is a sample course description for course ${i + 1}.`,
      category: categories[i % categories.length],
      level: i % 3 === 0 ? 'beginner' : i % 3 === 1 ? 'intermediate' : 'advanced',
      instructor: `Instructor ${i + 1}`,
      instructorId: `instructor-${i + 4}`,
      duration: `${4 + i} weeks`,
      lessons: [],
      progress: Math.floor(Math.random() * 100),
      enrolledAt: new Date(),
      status: 'enrolled',
      rating: Math.floor(Math.random() * 5) + 1,
      reviews: [],
      price: Math.floor(Math.random() * 5000),
      isFree: Math.random() > 0.5,
      thumbnail: `https://picsum.photos/400/300?random=${i}`,
      tags: ['sample', 'course', 'test']
    });
  }

  return {
    courses: [...mockCourses, ...additionalCourses],
    assignments: mockAssignments,
    quizzes: mockQuizzes,
    certificates: mockCertificates,
    transactions: mockTransactions,
    forumPosts: mockForumPosts,
    notifications: mockNotifications
  };
};

export default {
  users: mockUsers,
  courses: mockCourses,
  assignments: mockAssignments,
  quizzes: mockQuizzes,
  certificates: mockCertificates,
  transactions: mockTransactions,
  forumPosts: mockForumPosts,
  notifications: mockNotifications,
  generateMockData
};