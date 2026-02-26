/**
 * Adaptive Assessment Hook
 *
 * Manages the state machine for adaptive assessment sessions. Tracks
 * difficulty progression, answer history, scoring, and communicates
 * with the backend API for question selection and grading.
 */

import { useState, useCallback, useRef } from 'react';
import type { AssessmentQuestion } from '../../types/staff';

interface AdaptiveSessionState {
  /** ID of the active assessment */
  assessmentId: string;
  /** Current difficulty level (1-5 scale) */
  currentDifficulty: number;
  /** Total number of questions answered in this session */
  questionsAnswered: number;
  /** Number of correct answers */
  correctCount: number;
  /** Current streak of consecutive correct answers */
  currentStreak: number;
  /** History of difficulty levels through the session */
  difficultyHistory: number[];
  /** IDs of questions already answered (to prevent repeats) */
  answeredQuestionIds: string[];
}

interface AnswerResult {
  correct: boolean;
  feedback: string;
}

interface SessionEndResult {
  finalScore: number;
  breakdown: {
    total_questions: number;
    correct_count: number;
    accuracy: number;
    difficulty_progression: number[];
    time_taken_seconds: number;
    competencies_met: string[];
    competencies_missed: string[];
  };
}

interface UseAdaptiveAssessmentResult {
  /** Current session state */
  sessionState: AdaptiveSessionState;
  /** The current question to display */
  currentQuestion: AssessmentQuestion | null;
  /** Whether a question or grading request is loading */
  isLoading: boolean;
  /** Whether the assessment session is complete */
  isComplete: boolean;
  /** Final score (available after endSession) */
  score: number | null;
  /** Start a new adaptive assessment session */
  startSession: (assessmentId: string) => Promise<void>;
  /** Submit an answer for the current question */
  submitAnswer: (questionId: string, answer: string) => Promise<AnswerResult>;
  /** Fetch the next question based on current difficulty */
  getNextQuestion: () => Promise<void>;
  /** End the session and get final results */
  endSession: () => Promise<SessionEndResult>;
}

const INITIAL_SESSION_STATE: AdaptiveSessionState = {
  assessmentId: '',
  currentDifficulty: 3,
  questionsAnswered: 0,
  correctCount: 0,
  currentStreak: 0,
  difficultyHistory: [],
  answeredQuestionIds: [],
};

/** Difficulty adjustment thresholds */
const STEP_UP_STREAK = 2; // Increase difficulty after 2 consecutive correct answers
const STEP_DOWN_STREAK = 2; // Decrease difficulty after 2 consecutive wrong answers
const MIN_DIFFICULTY = 1;
const MAX_DIFFICULTY = 5;

/**
 * Get the JWT token from localStorage.
 */
function getToken(): string | null {
  try {
    const stored = localStorage.getItem('auth-store');
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return parsed?.state?.token || parsed?.token || null;
  } catch {
    return null;
  }
}

/**
 * Build authorization headers.
 */
function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export function useAdaptiveAssessment(): UseAdaptiveAssessmentResult {
  const [sessionState, setSessionState] = useState<AdaptiveSessionState>(INITIAL_SESSION_STATE);
  const [currentQuestion, setCurrentQuestion] = useState<AssessmentQuestion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const wrongStreakRef = useRef(0);
  const sessionStartRef = useRef<number>(0);
  const mountedRef = useRef(true);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  /**
   * Adjust difficulty based on the current answer streak.
   */
  const adjustDifficulty = useCallback(
    (correct: boolean, state: AdaptiveSessionState): number => {
      let newDifficulty = state.currentDifficulty;

      if (correct) {
        wrongStreakRef.current = 0;
        const newStreak = state.currentStreak + 1;
        if (newStreak >= STEP_UP_STREAK) {
          newDifficulty = Math.min(MAX_DIFFICULTY, state.currentDifficulty + 1);
        }
      } else {
        wrongStreakRef.current += 1;
        if (wrongStreakRef.current >= STEP_DOWN_STREAK) {
          newDifficulty = Math.max(MIN_DIFFICULTY, state.currentDifficulty - 1);
          wrongStreakRef.current = 0;
        }
      }

      return newDifficulty;
    },
    []
  );

  /**
   * Start a new adaptive assessment session.
   */
  const startSession = useCallback(
    async (assessmentId: string) => {
      setIsLoading(true);
      setIsComplete(false);
      setScore(null);
      setCurrentQuestion(null);
      wrongStreakRef.current = 0;
      sessionStartRef.current = Date.now();

      try {
        // Try to start session via API
        const response = await fetch(
          `${apiUrl}/api/v1/staff/assessments/${assessmentId}/start-session`,
          {
            method: 'POST',
            headers: getHeaders(),
          }
        );

        let initialDifficulty = 3;

        if (response.ok) {
          const data = await response.json();
          initialDifficulty = data.initial_difficulty ?? 3;
        }

        const newState: AdaptiveSessionState = {
          assessmentId,
          currentDifficulty: initialDifficulty,
          questionsAnswered: 0,
          correctCount: 0,
          currentStreak: 0,
          difficultyHistory: [initialDifficulty],
          answeredQuestionIds: [],
        };

        if (mountedRef.current) {
          setSessionState(newState);
        }

        // Fetch the first question
        await fetchNextQuestion(assessmentId, initialDifficulty, []);
      } catch (err) {
        console.error('Failed to start adaptive assessment session:', err);
        // Initialize with defaults and attempt to fetch a question anyway
        const fallbackState: AdaptiveSessionState = {
          assessmentId,
          currentDifficulty: 3,
          questionsAnswered: 0,
          correctCount: 0,
          currentStreak: 0,
          difficultyHistory: [3],
          answeredQuestionIds: [],
        };
        if (mountedRef.current) {
          setSessionState(fallbackState);
        }
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [apiUrl]
  );

  /**
   * Internal helper to fetch the next question from the API.
   */
  const fetchNextQuestion = useCallback(
    async (
      assessmentId: string,
      difficulty: number,
      answeredIds: string[]
    ) => {
      try {
        const params = new URLSearchParams({
          difficulty: String(difficulty),
          exclude: answeredIds.join(','),
        });

        const response = await fetch(
          `${apiUrl}/api/v1/staff/assessments/${assessmentId}/next-question?${params}`,
          {
            headers: getHeaders(),
          }
        );

        if (response.ok) {
          const question = await response.json();
          if (mountedRef.current) {
            setCurrentQuestion(question);
          }
        } else if (response.status === 404 || response.status === 204) {
          // No more questions available; assessment is complete
          if (mountedRef.current) {
            setCurrentQuestion(null);
            setIsComplete(true);
          }
        }
      } catch (err) {
        console.error('Failed to fetch next question:', err);
      }
    },
    [apiUrl]
  );

  /**
   * Submit an answer for the current question and get feedback.
   */
  const submitAnswer = useCallback(
    async (questionId: string, answer: string): Promise<AnswerResult> => {
      setIsLoading(true);

      try {
        const response = await fetch(
          `${apiUrl}/api/v1/staff/assessments/${sessionState.assessmentId}/submit-answer`,
          {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
              question_id: questionId,
              answer,
              current_difficulty: sessionState.currentDifficulty,
            }),
          }
        );

        let result: AnswerResult = { correct: false, feedback: 'Unable to grade answer.' };

        if (response.ok) {
          result = await response.json();
        }

        // Update session state
        const newDifficulty = adjustDifficulty(result.correct, sessionState);

        setSessionState((prev) => ({
          ...prev,
          questionsAnswered: prev.questionsAnswered + 1,
          correctCount: result.correct ? prev.correctCount + 1 : prev.correctCount,
          currentStreak: result.correct ? prev.currentStreak + 1 : 0,
          currentDifficulty: newDifficulty,
          difficultyHistory: [...prev.difficultyHistory, newDifficulty],
          answeredQuestionIds: [...prev.answeredQuestionIds, questionId],
        }));

        return result;
      } catch (err) {
        console.error('Failed to submit answer:', err);
        return { correct: false, feedback: 'Network error. Please try again.' };
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    },
    [apiUrl, sessionState, adjustDifficulty]
  );

  /**
   * Fetch the next question based on the current session state.
   */
  const getNextQuestion = useCallback(async () => {
    setIsLoading(true);

    try {
      await fetchNextQuestion(
        sessionState.assessmentId,
        sessionState.currentDifficulty,
        sessionState.answeredQuestionIds
      );
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [
    fetchNextQuestion,
    sessionState.assessmentId,
    sessionState.currentDifficulty,
    sessionState.answeredQuestionIds,
  ]);

  /**
   * End the assessment session and retrieve final results.
   */
  const endSession = useCallback(async (): Promise<SessionEndResult> => {
    setIsLoading(true);
    const timeTaken = Math.floor((Date.now() - sessionStartRef.current) / 1000);

    try {
      const response = await fetch(
        `${apiUrl}/api/v1/staff/assessments/${sessionState.assessmentId}/end-session`,
        {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({
            questions_answered: sessionState.questionsAnswered,
            correct_count: sessionState.correctCount,
            difficulty_history: sessionState.difficultyHistory,
            answered_question_ids: sessionState.answeredQuestionIds,
            time_taken_seconds: timeTaken,
          }),
        }
      );

      let result: SessionEndResult;

      if (response.ok) {
        result = await response.json();
      } else {
        // Compute results locally if the API fails
        const accuracy =
          sessionState.questionsAnswered > 0
            ? sessionState.correctCount / sessionState.questionsAnswered
            : 0;

        result = {
          finalScore: Math.round(accuracy * 100),
          breakdown: {
            total_questions: sessionState.questionsAnswered,
            correct_count: sessionState.correctCount,
            accuracy,
            difficulty_progression: sessionState.difficultyHistory,
            time_taken_seconds: timeTaken,
            competencies_met: [],
            competencies_missed: [],
          },
        };
      }

      if (mountedRef.current) {
        setScore(result.finalScore);
        setIsComplete(true);
        setCurrentQuestion(null);
      }

      return result;
    } catch (err) {
      console.error('Failed to end assessment session:', err);

      // Return locally computed results on error
      const accuracy =
        sessionState.questionsAnswered > 0
          ? sessionState.correctCount / sessionState.questionsAnswered
          : 0;

      const fallback: SessionEndResult = {
        finalScore: Math.round(accuracy * 100),
        breakdown: {
          total_questions: sessionState.questionsAnswered,
          correct_count: sessionState.correctCount,
          accuracy,
          difficulty_progression: sessionState.difficultyHistory,
          time_taken_seconds: timeTaken,
          competencies_met: [],
          competencies_missed: [],
        },
      };

      if (mountedRef.current) {
        setScore(fallback.finalScore);
        setIsComplete(true);
        setCurrentQuestion(null);
      }

      return fallback;
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [apiUrl, sessionState]);

  return {
    sessionState,
    currentQuestion,
    isLoading,
    isComplete,
    score,
    startSession,
    submitAnswer,
    getNextQuestion,
    endSession,
  };
}

export type { AdaptiveSessionState, AnswerResult, SessionEndResult, UseAdaptiveAssessmentResult };
export default useAdaptiveAssessment;
