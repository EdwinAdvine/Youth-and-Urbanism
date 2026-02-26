import React, { useEffect, useState } from 'react';
import api from '@/services/api';

interface MasteryRecord {
  id: string;
  topic_name: string;
  subject: string;
  mastery_level: number;
  is_mastered: boolean;
  attempt_count: number;
  next_review_date: string | null;
}

interface DueReview {
  id: string;
  topic_name: string;
  subject: string;
  mastery_level: number;
  days_overdue: number;
}

/**
 * Dashboard widget showing mastery levels per subject with spaced repetition review alerts.
 * Displays progress bars for each topic and highlights items due for review.
 */
const MasteryProgressWidget: React.FC = () => {
  const [records, setRecords] = useState<MasteryRecord[]>([]);
  const [dueReviews, setDueReviews] = useState<DueReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [masteryRes, reviewsRes] = await Promise.all([
          api.get('/student/mastery'),
          api.get('/student/mastery/due-reviews'),
        ]);
        setRecords(masteryRes.data);
        setDueReviews(reviewsRes.data);
      } catch (err) {
        console.error('Failed to fetch mastery data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-4 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 animate-pulse">
        <div className="h-4 w-32 bg-gray-200 dark:bg-white/10 rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 bg-gray-200 dark:bg-white/10 rounded" />
          ))}
        </div>
      </div>
    );
  }

  // Group records by subject
  const bySubject: Record<string, MasteryRecord[]> = {};
  for (const r of records) {
    if (!bySubject[r.subject]) bySubject[r.subject] = [];
    bySubject[r.subject].push(r);
  }

  const subjects = Object.keys(bySubject);

  return (
    <div className="p-4 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10">
      <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-3">
        Mastery Progress
      </h3>

      {/* Due Reviews Alert */}
      {dueReviews.length > 0 && (
        <div className="mb-3 p-2.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <p className="text-xs font-medium text-yellow-600 dark:text-yellow-400 mb-1">
            Topics to review ({dueReviews.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {dueReviews.slice(0, 3).map((r) => (
              <span
                key={r.id}
                className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-700 dark:text-yellow-300"
              >
                {r.topic_name}
              </span>
            ))}
            {dueReviews.length > 3 && (
              <span className="text-xs text-yellow-600 dark:text-yellow-400">
                +{dueReviews.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Subject Progress */}
      {subjects.length === 0 ? (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Start learning to track your mastery!
        </p>
      ) : (
        <div className="space-y-3">
          {subjects.map((subject) => {
            const items = bySubject[subject];
            const mastered = items.filter((r) => r.is_mastered).length;
            const avgMastery =
              items.reduce((sum, r) => sum + r.mastery_level, 0) / items.length;

            return (
              <div key={subject}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {subject}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {mastered}/{items.length} mastered
                  </span>
                </div>
                <div className="h-2 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      avgMastery >= 0.8
                        ? 'bg-green-500'
                        : avgMastery >= 0.5
                        ? 'bg-cyan-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.round(avgMastery * 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MasteryProgressWidget;
