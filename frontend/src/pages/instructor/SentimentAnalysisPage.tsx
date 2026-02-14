import React, { useEffect, useState } from 'react';
import { Brain, TrendingUp, TrendingDown, AlertCircle, Sparkles } from 'lucide-react';
import { InstructorPageHeader } from '../../components/instructor/shared/InstructorPageHeader';
import axios from 'axios';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface SentimentData {
  overall_sentiment: number;
  sentiment_trend: 'improving' | 'stable' | 'declining';
  trend_percentage: number;
  total_analyzed: number;
  distribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  trends_over_time: Array<{
    date: string;
    positive: number;
    neutral: number;
    negative: number;
    avg_score: number;
  }>;
  by_course: Array<{
    course_title: string;
    sentiment_score: number;
    review_count: number;
  }>;
  key_themes: Array<{
    theme: string;
    sentiment: 'positive' | 'negative';
    mentions: number;
  }>;
  benchmark_comparison: {
    your_score: number;
    platform_average: number;
    top_10_percent: number;
  };
}

export const SentimentAnalysisPage: React.FC = () => {
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetchSentimentData();
  }, []);

  const fetchSentimentData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/api/v1/instructor/feedback/sentiment`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Mock data for development
      if (!response.data) {
        setSentimentData({
          overall_sentiment: 0.78,
          sentiment_trend: 'improving',
          trend_percentage: 12,
          total_analyzed: 127,
          distribution: {
            positive: 89,
            neutral: 28,
            negative: 10,
          },
          trends_over_time: [
            { date: 'Week 1', positive: 70, neutral: 20, negative: 10, avg_score: 0.72 },
            { date: 'Week 2', positive: 75, neutral: 18, negative: 7, avg_score: 0.74 },
            { date: 'Week 3', positive: 78, neutral: 15, negative: 7, avg_score: 0.76 },
            { date: 'Week 4', positive: 82, neutral: 13, negative: 5, avg_score: 0.78 },
            { date: 'Week 5', positive: 85, neutral: 10, negative: 5, avg_score: 0.8 },
            { date: 'Week 6', positive: 89, neutral: 7, negative: 4, avg_score: 0.82 },
          ],
          by_course: [
            { course_title: 'Introduction to Mathematics - Grade 7', sentiment_score: 0.85, review_count: 45 },
            { course_title: 'English Language & Literature', sentiment_score: 0.78, review_count: 38 },
            { course_title: 'Science - Grade 8', sentiment_score: 0.65, review_count: 22 },
            { course_title: 'Social Studies', sentiment_score: 0.72, review_count: 22 },
          ],
          key_themes: [
            { theme: 'Clear Explanations', sentiment: 'positive', mentions: 34 },
            { theme: 'Engaging Content', sentiment: 'positive', mentions: 28 },
            { theme: 'Practice Exercises', sentiment: 'positive', mentions: 25 },
            { theme: 'Pace Too Fast', sentiment: 'negative', mentions: 8 },
            { theme: 'Need More Examples', sentiment: 'negative', mentions: 6 },
          ],
          benchmark_comparison: {
            your_score: 0.78,
            platform_average: 0.72,
            top_10_percent: 0.85,
          },
        });
      } else {
        setSentimentData(response.data);
      }
    } catch (error) {
      console.error('Error fetching sentiment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReanalyze = async () => {
    try {
      setAnalyzing(true);
      const token = localStorage.getItem('access_token');
      await axios.post(
        `${API_URL}/api/v1/instructor/feedback/sentiment/reanalyze`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchSentimentData();
      alert('Sentiment analysis updated successfully!');
    } catch (error) {
      console.error('Error reanalyzing sentiment:', error);
      alert('Failed to reanalyze sentiment');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!sentimentData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 dark:text-white/60">Failed to load sentiment data</p>
      </div>
    );
  }

  const COLORS = {
    positive: '#10b981',
    neutral: '#f59e0b',
    negative: '#ef4444',
  };

  const pieData = [
    { name: 'Positive', value: sentimentData.distribution.positive, color: COLORS.positive },
    { name: 'Neutral', value: sentimentData.distribution.neutral, color: COLORS.neutral },
    { name: 'Negative', value: sentimentData.distribution.negative, color: COLORS.negative },
  ];

  const sentimentPercentage = Math.round(sentimentData.overall_sentiment * 100);
  const trendIcon =
    sentimentData.sentiment_trend === 'improving'
      ? TrendingUp
      : sentimentData.sentiment_trend === 'declining'
      ? TrendingDown
      : AlertCircle;

  const TrendIcon = trendIcon;

  return (
    <div className="space-y-6">
      <InstructorPageHeader
        title="AI Sentiment Analysis"
        description="AI-powered analysis of student feedback sentiment and trends"
        icon={<Brain className="w-6 h-6 text-purple-400" />}
        actions={
          <button
            onClick={handleReanalyze}
            disabled={analyzing}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/50 disabled:cursor-not-allowed text-gray-900 dark:text-white rounded-lg transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            {analyzing ? 'Analyzing...' : 'Reanalyze with AI'}
          </button>
        }
      />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-xl p-5">
          <p className="text-sm text-purple-200 mb-2">Overall Sentiment Score</p>
          <div className="flex items-center gap-3">
            <p className="text-4xl font-bold text-gray-900 dark:text-white">{sentimentPercentage}%</p>
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
                sentimentData.sentiment_trend === 'improving'
                  ? 'bg-green-500/10 text-green-400'
                  : sentimentData.sentiment_trend === 'declining'
                  ? 'bg-red-500/10 text-red-400'
                  : 'bg-orange-500/10 text-orange-400'
              }`}
            >
              <TrendIcon className="w-4 h-4" />
              <span className="text-xs font-medium">{sentimentData.trend_percentage}%</span>
            </div>
          </div>
          <p className="text-xs text-purple-200/60 mt-1 capitalize">
            {sentimentData.sentiment_trend} trend
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-5">
          <p className="text-sm text-gray-500 dark:text-white/60 mb-2">Positive Reviews</p>
          <p className="text-3xl font-bold text-green-400">{sentimentData.distribution.positive}</p>
          <p className="text-xs text-gray-400 dark:text-gray-300 dark:text-white/40 mt-1">
            {Math.round((sentimentData.distribution.positive / sentimentData.total_analyzed) * 100)}
            % of total
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-5">
          <p className="text-sm text-gray-500 dark:text-white/60 mb-2">Neutral Reviews</p>
          <p className="text-3xl font-bold text-orange-400">{sentimentData.distribution.neutral}</p>
          <p className="text-xs text-gray-400 dark:text-gray-300 dark:text-white/40 mt-1">
            {Math.round((sentimentData.distribution.neutral / sentimentData.total_analyzed) * 100)}%
            of total
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-5">
          <p className="text-sm text-gray-500 dark:text-white/60 mb-2">Negative Reviews</p>
          <p className="text-3xl font-bold text-red-400">{sentimentData.distribution.negative}</p>
          <p className="text-xs text-gray-400 dark:text-gray-300 dark:text-white/40 mt-1">
            {Math.round((sentimentData.distribution.negative / sentimentData.total_analyzed) * 100)}
            % of total
          </p>
        </div>
      </div>

      {/* Sentiment Trend Over Time */}
      <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sentiment Trend Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={sentimentData.trends_over_time}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="date" stroke="#ffffff60" />
            <YAxis stroke="#ffffff60" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="avg_score"
              stroke="#8b5cf6"
              strokeWidth={2}
              name="Avg Sentiment Score"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution Pie Chart */}
        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sentiment Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Benchmark Comparison */}
        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Benchmark Comparison</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-white/80">Your Score</span>
                <span className="text-lg font-bold text-purple-300">
                  {Math.round(sentimentData.benchmark_comparison.your_score * 100)}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                  style={{
                    width: `${sentimentData.benchmark_comparison.your_score * 100}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-white/80">Platform Average</span>
                <span className="text-lg font-bold text-gray-500 dark:text-white/60">
                  {Math.round(sentimentData.benchmark_comparison.platform_average * 100)}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white/30"
                  style={{
                    width: `${sentimentData.benchmark_comparison.platform_average * 100}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-white/80">Top 10% Instructors</span>
                <span className="text-lg font-bold text-green-300">
                  {Math.round(sentimentData.benchmark_comparison.top_10_percent * 100)}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                  style={{
                    width: `${sentimentData.benchmark_comparison.top_10_percent * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <p className="text-sm text-purple-200">
                {sentimentData.benchmark_comparison.your_score >=
                sentimentData.benchmark_comparison.top_10_percent
                  ? '🎉 Congratulations! You\'re in the top 10% of instructors!'
                  : sentimentData.benchmark_comparison.your_score >=
                    sentimentData.benchmark_comparison.platform_average
                  ? '👍 You\'re performing above the platform average!'
                  : '📈 Focus on addressing negative feedback themes to improve your score.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sentiment by Course */}
      <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sentiment by Course</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={sentimentData.by_course} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis type="number" domain={[0, 1]} stroke="#ffffff60" />
            <YAxis dataKey="course_title" type="category" width={200} stroke="#ffffff60" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            <Bar dataKey="sentiment_score" fill="#8b5cf6" name="Sentiment Score" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Key Themes */}
      <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Key Themes from Student Feedback
        </h3>
        <div className="space-y-3">
          {sentimentData.key_themes.map((theme, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-2 h-2 rounded-full ${
                    theme.sentiment === 'positive' ? 'bg-green-400' : 'bg-red-400'
                  }`}
                />
                <span className="text-sm text-gray-900 dark:text-white font-medium">{theme.theme}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 dark:text-white/60">{theme.mentions} mentions</span>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                    theme.sentiment === 'positive'
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-red-500/10 text-red-400'
                  }`}
                >
                  {theme.sentiment}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-purple-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-purple-200 mb-2">AI-Powered Insights</h4>
            <ul className="text-sm text-purple-200/80 space-y-1">
              <li>
                • Your sentiment is {sentimentData.sentiment_trend} with a{' '}
                {sentimentData.trend_percentage}% change over the last 30 days
              </li>
              <li>
                • Students especially appreciate your "Clear Explanations" - continue emphasizing
                this strength
              </li>
              <li>
                • The "Pace Too Fast" theme suggests slowing down or adding more review sections in
                Science - Grade 8
              </li>
              <li>
                • You're performing{' '}
                {Math.round(
                  ((sentimentData.benchmark_comparison.your_score -
                    sentimentData.benchmark_comparison.platform_average) /
                    sentimentData.benchmark_comparison.platform_average) *
                    100
                )}
                % above the platform average - keep it up!
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
