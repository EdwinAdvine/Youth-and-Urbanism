import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listAssessments } from '../services/assessmentService';
import { useAuthStore } from '../store/authStore';

interface Quiz {
  id: string;
  title: string;
  subject: string;
  gradeLevel: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
  timeLimit: number; // minutes
  description: string;
  topics: string[];
  learningObjectives: string[];
}

interface QuizProgress {
  quizId: string;
  status: 'available' | 'in_progress' | 'completed';
  questionsAnswered: number;
  score?: number; // percentage
  lastAttempt?: Date;
  bestScore?: number;
}

const MOCK_QUIZZES: Quiz[] = [
  {
    id: 'quiz-1',
    title: 'Fractions and Decimals Mastery',
    subject: 'Mathematics',
    gradeLevel: 'Grade 5',
    difficulty: 'medium',
    questionCount: 15,
    timeLimit: 30,
    description: 'Test your understanding of fractions, decimals, and their conversions.',
    topics: ['Proper fractions', 'Improper fractions', 'Decimal conversion', 'Mixed numbers'],
    learningObjectives: [
      'Convert between fractions and decimals',
      'Compare and order fractions',
      'Perform basic operations with fractions'
    ]
  },
  {
    id: 'quiz-2',
    title: 'Algebra Basics',
    subject: 'Mathematics',
    gradeLevel: 'Grade 7',
    difficulty: 'hard',
    questionCount: 20,
    timeLimit: 45,
    description: 'Master fundamental algebraic concepts and equation solving.',
    topics: ['Variables and expressions', 'Linear equations', 'Word problems', 'Simplification'],
    learningObjectives: [
      'Solve linear equations',
      'Translate word problems to equations',
      'Simplify algebraic expressions'
    ]
  },
  {
    id: 'quiz-3',
    title: 'States of Matter',
    subject: 'Science',
    gradeLevel: 'Grade 4',
    difficulty: 'easy',
    questionCount: 10,
    timeLimit: 20,
    description: 'Explore the three states of matter and their properties.',
    topics: ['Solids', 'Liquids', 'Gases', 'State changes'],
    learningObjectives: [
      'Identify properties of different states',
      'Understand state transitions',
      'Apply knowledge to real-world examples'
    ]
  },
  {
    id: 'quiz-4',
    title: 'Photosynthesis Process',
    subject: 'Science',
    gradeLevel: 'Grade 6',
    difficulty: 'medium',
    questionCount: 12,
    timeLimit: 25,
    description: 'Learn how plants convert sunlight into energy.',
    topics: ['Chlorophyll', 'Light reactions', 'Dark reactions', 'Products and reactants'],
    learningObjectives: [
      'Explain the photosynthesis process',
      'Identify factors affecting photosynthesis',
      'Understand the role of chlorophyll'
    ]
  },
  {
    id: 'quiz-5',
    title: 'Grammar and Composition',
    subject: 'English',
    gradeLevel: 'Grade 5',
    difficulty: 'medium',
    questionCount: 18,
    timeLimit: 35,
    description: 'Test your grammar skills and composition techniques.',
    topics: ['Parts of speech', 'Sentence structure', 'Punctuation', 'Writing techniques'],
    learningObjectives: [
      'Apply correct grammar rules',
      'Construct well-formed sentences',
      'Use appropriate punctuation'
    ]
  },
  {
    id: 'quiz-6',
    title: 'Kiswahili Comprehension',
    subject: 'Kiswahili',
    gradeLevel: 'Grade 6',
    difficulty: 'medium',
    questionCount: 15,
    timeLimit: 30,
    description: 'Soma na uelewa maandishi ya Kiswahili.',
    topics: ['Ufahamu wa maandishi', 'Sarufi', 'Msamiati', 'Utungaji'],
    learningObjectives: [
      'Kuelewa maandishi mbalimbali',
      'Kutumia sarufi sahihi',
      'Kuongeza msamiati'
    ]
  },
  {
    id: 'quiz-7',
    title: "Kenya's Geography",
    subject: 'Social Studies',
    gradeLevel: 'Grade 4',
    difficulty: 'easy',
    questionCount: 12,
    timeLimit: 20,
    description: 'Explore the physical and political geography of Kenya.',
    topics: ['Counties', 'Physical features', 'Climate', 'Natural resources'],
    learningObjectives: [
      'Identify major physical features',
      'Locate counties on a map',
      'Understand climate zones'
    ]
  },
  {
    id: 'quiz-8',
    title: 'African History: Pre-Colonial Era',
    subject: 'Social Studies',
    gradeLevel: 'Grade 8',
    difficulty: 'hard',
    questionCount: 25,
    timeLimit: 50,
    description: 'Study the rich history of Africa before colonialism.',
    topics: ['Ancient kingdoms', 'Trade routes', 'Cultural practices', 'Political systems'],
    learningObjectives: [
      'Understand African kingdoms',
      'Analyze trade networks',
      'Appreciate cultural diversity'
    ]
  },
  {
    id: 'quiz-9',
    title: 'Number Patterns and Sequences',
    subject: 'Mathematics',
    gradeLevel: 'Grade 3',
    difficulty: 'easy',
    questionCount: 10,
    timeLimit: 15,
    description: 'Recognize and complete number patterns.',
    topics: ['Skip counting', 'Odd and even numbers', 'Simple sequences', 'Pattern rules'],
    learningObjectives: [
      'Identify number patterns',
      'Continue sequences',
      'Apply pattern rules'
    ]
  },
  {
    id: 'quiz-10',
    title: 'The Water Cycle',
    subject: 'Science',
    gradeLevel: 'Grade 5',
    difficulty: 'easy',
    questionCount: 12,
    timeLimit: 20,
    description: 'Understand how water moves through the environment.',
    topics: ['Evaporation', 'Condensation', 'Precipitation', 'Collection'],
    learningObjectives: [
      'Explain the water cycle stages',
      'Understand water conservation',
      'Identify factors affecting the cycle'
    ]
  },
  {
    id: 'quiz-11',
    title: 'Poetry Analysis',
    subject: 'English',
    gradeLevel: 'Grade 7',
    difficulty: 'hard',
    questionCount: 15,
    timeLimit: 40,
    description: 'Analyze poetic devices and literary techniques.',
    topics: ['Metaphors', 'Similes', 'Rhyme scheme', 'Imagery', 'Theme'],
    learningObjectives: [
      'Identify poetic devices',
      'Analyze themes and messages',
      'Interpret figurative language'
    ]
  },
  {
    id: 'quiz-12',
    title: 'Simple Machines',
    subject: 'Science',
    gradeLevel: 'Grade 6',
    difficulty: 'medium',
    questionCount: 14,
    timeLimit: 25,
    description: 'Learn about levers, pulleys, and other simple machines.',
    topics: ['Levers', 'Pulleys', 'Inclined planes', 'Wheels and axles', 'Mechanical advantage'],
    learningObjectives: [
      'Identify types of simple machines',
      'Calculate mechanical advantage',
      'Apply concepts to real-world tools'
    ]
  },
  {
    id: 'quiz-13',
    title: 'Kenyan Government Structure',
    subject: 'Social Studies',
    gradeLevel: 'Grade 7',
    difficulty: 'medium',
    questionCount: 16,
    timeLimit: 30,
    description: 'Understand the three arms of government in Kenya.',
    topics: ['Legislature', 'Executive', 'Judiciary', 'Devolution', 'Constitution'],
    learningObjectives: [
      'Explain the separation of powers',
      'Understand county governments',
      'Know citizen rights and responsibilities'
    ]
  },
  {
    id: 'quiz-14',
    title: 'Ratios and Proportions',
    subject: 'Mathematics',
    gradeLevel: 'Grade 6',
    difficulty: 'medium',
    questionCount: 18,
    timeLimit: 35,
    description: 'Master ratios, proportions, and their applications.',
    topics: ['Simplifying ratios', 'Proportional relationships', 'Scale', 'Word problems'],
    learningObjectives: [
      'Simplify and compare ratios',
      'Solve proportion problems',
      'Apply ratios to real situations'
    ]
  },
  {
    id: 'quiz-15',
    title: 'Electricity and Circuits',
    subject: 'Science',
    gradeLevel: 'Grade 8',
    difficulty: 'hard',
    questionCount: 20,
    timeLimit: 40,
    description: 'Explore electrical concepts and circuit design.',
    topics: ['Conductors and insulators', 'Series and parallel circuits', 'Ohms law', 'Electrical safety'],
    learningObjectives: [
      'Design simple circuits',
      'Apply Ohms law',
      'Understand electrical safety'
    ]
  },
  {
    id: 'quiz-16',
    title: 'Creative Writing Fundamentals',
    subject: 'English',
    gradeLevel: 'Grade 6',
    difficulty: 'medium',
    questionCount: 12,
    timeLimit: 30,
    description: 'Develop your creative writing skills.',
    topics: ['Character development', 'Plot structure', 'Dialogue', 'Descriptive writing'],
    learningObjectives: [
      'Create compelling characters',
      'Structure a story effectively',
      'Write engaging dialogue'
    ]
  },
  {
    id: 'quiz-17',
    title: 'Addition and Subtraction Facts',
    subject: 'Mathematics',
    gradeLevel: 'Grade 2',
    difficulty: 'easy',
    questionCount: 20,
    timeLimit: 15,
    description: 'Practice basic addition and subtraction within 100.',
    topics: ['Single-digit addition', 'Two-digit addition', 'Subtraction', 'Mental math'],
    learningObjectives: [
      'Master basic number facts',
      'Develop mental math skills',
      'Solve problems quickly'
    ]
  },
  {
    id: 'quiz-18',
    title: 'Human Body Systems',
    subject: 'Science',
    gradeLevel: 'Grade 7',
    difficulty: 'hard',
    questionCount: 22,
    timeLimit: 45,
    description: 'Study the major systems of the human body.',
    topics: ['Circulatory system', 'Respiratory system', 'Digestive system', 'Nervous system'],
    learningObjectives: [
      'Identify major organs and functions',
      'Understand system interactions',
      'Apply health knowledge'
    ]
  },
  {
    id: 'quiz-19',
    title: 'Map Reading Skills',
    subject: 'Social Studies',
    gradeLevel: 'Grade 5',
    difficulty: 'easy',
    questionCount: 10,
    timeLimit: 20,
    description: 'Learn to read and interpret maps effectively.',
    topics: ['Map symbols', 'Scale', 'Compass directions', 'Grid references'],
    learningObjectives: [
      'Read map symbols and keys',
      'Use scale to calculate distances',
      'Navigate using grid references'
    ]
  },
  {
    id: 'quiz-20',
    title: 'Geometry: Angles and Shapes',
    subject: 'Mathematics',
    gradeLevel: 'Grade 4',
    difficulty: 'easy',
    questionCount: 15,
    timeLimit: 25,
    description: 'Explore angles, shapes, and their properties.',
    topics: ['Acute and obtuse angles', '2D shapes', 'Symmetry', 'Perimeter'],
    learningObjectives: [
      'Classify angles and shapes',
      'Identify lines of symmetry',
      'Calculate perimeter'
    ]
  }
];

const MOCK_PROGRESS: QuizProgress[] = [
  {
    quizId: 'quiz-1',
    status: 'completed',
    questionsAnswered: 15,
    score: 87,
    lastAttempt: new Date('2024-02-10'),
    bestScore: 87
  },
  {
    quizId: 'quiz-3',
    status: 'completed',
    questionsAnswered: 10,
    score: 95,
    lastAttempt: new Date('2024-02-08'),
    bestScore: 95
  },
  {
    quizId: 'quiz-5',
    status: 'in_progress',
    questionsAnswered: 9,
    lastAttempt: new Date('2024-02-11')
  },
  {
    quizId: 'quiz-7',
    status: 'completed',
    questionsAnswered: 12,
    score: 75,
    lastAttempt: new Date('2024-02-05'),
    bestScore: 75
  },
  {
    quizId: 'quiz-9',
    status: 'completed',
    questionsAnswered: 10,
    score: 100,
    lastAttempt: new Date('2024-02-12'),
    bestScore: 100
  },
  {
    quizId: 'quiz-12',
    status: 'in_progress',
    questionsAnswered: 6,
    lastAttempt: new Date('2024-02-11')
  }
];

const subjects = [
  'All Subjects',
  'Mathematics',
  'Science',
  'English',
  'Kiswahili',
  'Social Studies'
];

const gradeLevels = [
  'All Grades',
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10',
  'Grade 11',
  'Grade 12'
];

const difficulties = ['All Levels', 'easy', 'medium', 'hard'];

export default function QuizzesPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [progress, setProgress] = useState<QuizProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'available' | 'in_progress' | 'completed'>('available');
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [filters, setFilters] = useState({
    subject: 'All Subjects',
    gradeLevel: 'All Grades',
    difficulty: 'All Levels',
    search: ''
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const response = await listAssessments({ assessment_type: 'quiz', limit: 100 });
        if (response.assessments.length > 0) {
          const mappedQuizzes: Quiz[] = response.assessments.map(a => ({
            id: a.id,
            title: a.title,
            subject: 'General',
            gradeLevel: 'All Grades',
            difficulty: (a.total_points > 80 ? 'hard' : a.total_points > 40 ? 'medium' : 'easy') as Quiz['difficulty'],
            questionCount: a.total_points / 5 || 10,
            timeLimit: a.duration_minutes || 30,
            description: a.description || '',
            topics: [],
            learningObjectives: [],
          }));
          setQuizzes(mappedQuizzes);
        } else {
          setQuizzes(MOCK_QUIZZES);
        }
        setProgress(MOCK_PROGRESS);
      } catch {
        // API not available - fall back to mock data
        setQuizzes(MOCK_QUIZZES);
        setProgress(MOCK_PROGRESS);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, []);

  const getQuizProgress = (quizId: string): QuizProgress => {
    const existingProgress = progress.find(p => p.quizId === quizId);
    return existingProgress || {
      quizId,
      status: 'available',
      questionsAnswered: 0
    };
  };

  const getFilteredQuizzes = () => {
    let filtered = quizzes.filter(quiz => {
      const quizProgress = getQuizProgress(quiz.id);

      // Tab filter
      if (activeTab === 'available' && quizProgress.status !== 'available') return false;
      if (activeTab === 'in_progress' && quizProgress.status !== 'in_progress') return false;
      if (activeTab === 'completed' && quizProgress.status !== 'completed') return false;

      // Subject filter
      if (filters.subject !== 'All Subjects' && quiz.subject !== filters.subject) return false;

      // Grade level filter
      if (filters.gradeLevel !== 'All Grades' && quiz.gradeLevel !== filters.gradeLevel) return false;

      // Difficulty filter
      if (filters.difficulty !== 'All Levels' && quiz.difficulty !== filters.difficulty) return false;

      // Search filter
      if (filters.search && !quiz.title.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      return true;
    });

    return filtered;
  };

  const filteredQuizzes = getFilteredQuizzes();
  const totalPages = Math.ceil(filteredQuizzes.length / itemsPerPage);
  const paginatedQuizzes = filteredQuizzes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'hard': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getScoreGrade = (score: number) => {
    if (score >= 90) return { grade: 'A', color: 'text-green-400 bg-green-500/20' };
    if (score >= 80) return { grade: 'B', color: 'text-blue-400 bg-blue-500/20' };
    if (score >= 70) return { grade: 'C', color: 'text-yellow-400 bg-yellow-500/20' };
    if (score >= 60) return { grade: 'D', color: 'text-orange-400 bg-orange-500/20' };
    return { grade: 'F', color: 'text-red-400 bg-red-500/20' };
  };

  const handleQuizAction = (quiz: Quiz) => {
    const quizProgress = getQuizProgress(quiz.id);

    if (quizProgress.status === 'completed') {
      // Navigate to results page
      console.log('View results for quiz:', quiz.id);
    } else {
      // Navigate to quiz taking page
      console.log('Start/Resume quiz:', quiz.id);
    }
  };

  const handleViewDetails = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setShowDetailModal(true);
  };

  const renderQuizCard = (quiz: Quiz) => {
    const quizProgress = getQuizProgress(quiz.id);
    const scoreData = quizProgress.score !== undefined ? getScoreGrade(quizProgress.score) : null;

    return (
      <div
        key={quiz.id}
        className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-copilot-cyan/50 transition-all cursor-pointer"
        onClick={() => handleViewDetails(quiz)}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex-1">{quiz.title}</h3>
          {scoreData && (
            <span className={`ml-2 px-3 py-1 rounded-full text-sm font-bold ${scoreData.color}`}>
              {scoreData.grade}
            </span>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 bg-copilot-blue/20 text-copilot-blue text-xs rounded-full border border-copilot-blue/30">
            {quiz.subject}
          </span>
          <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full border border-purple-500/30">
            {quiz.gradeLevel}
          </span>
          <span className={`px-3 py-1 text-xs rounded-full border ${getDifficultyColor(quiz.difficulty)}`}>
            {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
          </span>
        </div>

        {/* Info */}
        <div className="space-y-2 mb-4 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>{quiz.questionCount} questions</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{quiz.timeLimit} minutes</span>
          </div>
          {quizProgress.score !== undefined && (
            <div className="flex items-center gap-2 text-copilot-cyan">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Score: {quizProgress.score}%</span>
            </div>
          )}
          {quizProgress.lastAttempt && (
            <div className="text-xs text-gray-500">
              Last attempt: {new Date(quizProgress.lastAttempt).toLocaleDateString()}
            </div>
          )}
        </div>

        {/* Progress bar for in-progress quizzes */}
        {quizProgress.status === 'in_progress' && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Progress</span>
              <span>{quizProgress.questionsAnswered}/{quiz.questionCount}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full transition-all"
                style={{ width: `${(quizProgress.questionsAnswered / quiz.questionCount) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Action button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleQuizAction(quiz);
          }}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
            quizProgress.status === 'completed'
              ? 'bg-copilot-green/20 text-copilot-green hover:bg-copilot-green/30 border border-copilot-green/30'
              : quizProgress.status === 'in_progress'
              ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border border-orange-500/30'
              : 'bg-copilot-blue/20 text-copilot-blue hover:bg-copilot-blue/30 border border-copilot-blue/30'
          }`}
        >
          {quizProgress.status === 'completed'
            ? 'Review Results'
            : quizProgress.status === 'in_progress'
            ? 'Resume Quiz'
            : 'Start Quiz'}
        </button>
      </div>
    );
  };

  const renderEmptyState = () => (
    <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-400">
      <svg className="w-16 h-16 mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <p className="text-lg font-medium mb-2">No quizzes found</p>
      <p className="text-sm">
        {activeTab === 'available' && 'All available quizzes have been started or completed.'}
        {activeTab === 'in_progress' && 'You have no quizzes in progress.'}
        {activeTab === 'completed' && 'You have not completed any quizzes yet.'}
      </p>
    </div>
  );

  const renderDetailModal = () => {
    if (!selectedQuiz) return null;
    const quizProgress = getQuizProgress(selectedQuiz.id);

    return (
      <div
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
        onClick={() => setShowDetailModal(false)}
      >
        <div
          className="bg-gray-800 rounded-lg border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex-1">{selectedQuiz.title}</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-copilot-blue/20 text-copilot-blue text-sm rounded-full border border-copilot-blue/30">
                {selectedQuiz.subject}
              </span>
              <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-sm rounded-full border border-purple-500/30">
                {selectedQuiz.gradeLevel}
              </span>
              <span className={`px-3 py-1 text-sm rounded-full border ${getDifficultyColor(selectedQuiz.difficulty)}`}>
                {selectedQuiz.difficulty.charAt(0).toUpperCase() + selectedQuiz.difficulty.slice(1)}
              </span>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-6">
            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
              <p className="text-gray-400">{selectedQuiz.description}</p>
            </div>

            {/* Quiz Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Questions</div>
                <div className="text-gray-900 dark:text-white text-xl font-bold">{selectedQuiz.questionCount}</div>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Time Limit</div>
                <div className="text-gray-900 dark:text-white text-xl font-bold">{selectedQuiz.timeLimit} min</div>
              </div>
              {quizProgress.bestScore !== undefined && (
                <div className="bg-gray-700/50 rounded-lg p-4 col-span-2">
                  <div className="text-gray-400 text-sm mb-1">Best Score</div>
                  <div className="text-copilot-cyan text-2xl font-bold">{quizProgress.bestScore}%</div>
                </div>
              )}
            </div>

            {/* Learning Objectives */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Learning Objectives</h3>
              <ul className="space-y-2">
                {selectedQuiz.learningObjectives.map((objective, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-400">
                    <svg className="w-5 h-5 text-copilot-green mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{objective}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Topics Covered */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Topics Covered</h3>
              <div className="flex flex-wrap gap-2">
                {selectedQuiz.topics.map((topic, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-700 text-gray-400 dark:text-gray-300 text-sm rounded-full"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-6 border-t border-gray-700 flex gap-3">
            <button
              onClick={() => setShowDetailModal(false)}
              className="flex-1 py-2 px-4 bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                setShowDetailModal(false);
                handleQuizAction(selectedQuiz);
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                quizProgress.status === 'completed'
                  ? 'bg-copilot-green text-gray-900 dark:text-white hover:bg-copilot-green/90'
                  : quizProgress.status === 'in_progress'
                  ? 'bg-orange-500 text-gray-900 dark:text-white hover:bg-orange-600'
                  : 'bg-copilot-blue text-gray-900 dark:text-white hover:bg-copilot-blue/90'
              }`}
            >
              {quizProgress.status === 'completed'
                ? 'Review Results'
                : quizProgress.status === 'in_progress'
                ? 'Resume Quiz'
                : 'Start Quiz'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Quizzes & Assessments</h1>
          <p className="text-gray-400">Test your knowledge with CBC-aligned quizzes</p>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Subject Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Subject</label>
              <select
                value={filters.subject}
                onChange={(e) => {
                  setFilters({ ...filters, subject: e.target.value });
                  setCurrentPage(1);
                }}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-copilot-blue"
              >
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            {/* Grade Level Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Grade Level</label>
              <select
                value={filters.gradeLevel}
                onChange={(e) => {
                  setFilters({ ...filters, gradeLevel: e.target.value });
                  setCurrentPage(1);
                }}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-copilot-blue"
              >
                {gradeLevels.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Difficulty</label>
              <select
                value={filters.difficulty}
                onChange={(e) => {
                  setFilters({ ...filters, difficulty: e.target.value });
                  setCurrentPage(1);
                }}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-copilot-blue"
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty === 'All Levels' ? difficulty : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search quizzes..."
                value={filters.search}
                onChange={(e) => {
                  setFilters({ ...filters, search: e.target.value });
                  setCurrentPage(1);
                }}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-copilot-blue"
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-700">
          {(['available', 'in_progress', 'completed'] as const).map(tab => {
            const count = quizzes.filter(q => {
              const prog = getQuizProgress(q.id);
              return prog.status === tab;
            }).length;

            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setCurrentPage(1);
                }}
                className={`pb-3 px-4 font-medium transition-colors relative ${
                  activeTab === tab
                    ? 'text-copilot-blue'
                    : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {tab === 'available' && 'Available'}
                {tab === 'in_progress' && 'In Progress'}
                {tab === 'completed' && 'Completed'}
                <span className="ml-2 px-2 py-0.5 bg-gray-700 rounded-full text-xs">
                  {count}
                </span>
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-copilot-blue" />
                )}
              </button>
            );
          })}
        </div>

        {/* Quiz Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-lg border border-gray-700 p-6 animate-pulse">
                <div className="h-6 bg-gray-700 rounded mb-4" />
                <div className="flex gap-2 mb-4">
                  <div className="h-6 bg-gray-700 rounded w-20" />
                  <div className="h-6 bg-gray-700 rounded w-16" />
                </div>
                <div className="space-y-2 mb-4">
                  <div className="h-4 bg-gray-700 rounded" />
                  <div className="h-4 bg-gray-700 rounded" />
                </div>
                <div className="h-10 bg-gray-700 rounded" />
              </div>
            ))}
          </div>
        ) : paginatedQuizzes.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginatedQuizzes.map(renderQuizCard)}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                >
                  Previous
                </button>
                <div className="flex gap-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        currentPage === i + 1
                          ? 'bg-copilot-blue text-gray-900 dark:text-white'
                          : 'bg-gray-800 border border-gray-700 text-gray-900 dark:text-white hover:bg-gray-700'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="grid grid-cols-1">
            {renderEmptyState()}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && renderDetailModal()}
    </>
  );
}
