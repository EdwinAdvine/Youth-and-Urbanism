import React, { useEffect, useState } from 'react';
import { Heart, Send, Trophy, User, MessageSquare, Plus } from 'lucide-react';
import { InstructorPageHeader } from '../../components/instructor/shared/InstructorPageHeader';
import axios from 'axios';
import { format } from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface Kudo {
  id: string;
  from_instructor_name: string;
  from_instructor_avatar?: string;
  to_instructor_name?: string;
  message: string;
  category: string;
  is_public: boolean;
  created_at: string;
}

interface LeaderboardEntry {
  rank: number;
  instructor_name: string;
  instructor_avatar?: string;
  points: number;
  level: number;
  badges_count: number;
  kudos_count: number;
  is_you: boolean;
}

export const RecognitionPage: React.FC = () => {
  const [kudosReceived, setKudosReceived] = useState<Kudo[]>([]);
  const [kudosSent, setKudosSent] = useState<Kudo[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'received' | 'sent' | 'leaderboard'>('received');
  const [showSendKudoForm, setShowSendKudoForm] = useState(false);
  const [kudoForm, setKudoForm] = useState({
    to_instructor_id: '',
    category: '',
    message: '',
    is_public: true,
  });
  const [submittingKudo, setSubmittingKudo] = useState(false);

  useEffect(() => {
    fetchRecognitionData();
  }, []);

  const fetchRecognitionData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');

      const [receivedResponse, sentResponse, leaderboardResponse] = await Promise.all([
        axios.get(`${API_URL}/api/v1/instructor/gamification/kudos/received`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/api/v1/instructor/gamification/kudos/sent`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/api/v1/instructor/gamification/leaderboard`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // Mock data for development
      if (!receivedResponse.data || receivedResponse.data.length === 0) {
        setKudosReceived([
          {
            id: '1',
            from_instructor_name: 'Sarah Wambui',
            message:
              'Thank you for helping me set up my CBC-aligned curriculum! Your guidance was invaluable.',
            category: 'Helpful',
            is_public: true,
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '2',
            from_instructor_name: 'James Ochieng',
            message:
              'Your presentation on student engagement strategies at the community lounge was fantastic. Learned so much!',
            category: 'Inspiring',
            is_public: true,
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '3',
            from_instructor_name: 'Grace Njeri',
            message: 'Love how you break down complex math concepts. Your students are lucky!',
            category: 'Teaching Excellence',
            is_public: true,
            created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '4',
            from_instructor_name: 'David Mutua',
            message:
              'Thanks for sharing your assessment templates in the hub. Saved me hours of work!',
            category: 'Collaborative',
            is_public: true,
            created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ]);

        setKudosSent([
          {
            id: '5',
            from_instructor_name: 'You',
            to_instructor_name: 'Mary Wangari',
            message: 'Your science course structure is brilliant! Inspired me to redesign mine.',
            category: 'Inspiring',
            is_public: true,
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '6',
            from_instructor_name: 'You',
            to_instructor_name: 'Peter Kimani',
            message: 'Thanks for the feedback on my course pricing strategy. Really helpful!',
            category: 'Helpful',
            is_public: true,
            created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ]);
      } else {
        setKudosReceived(receivedResponse.data);
        setKudosSent(sentResponse.data);
      }

      if (!leaderboardResponse.data || leaderboardResponse.data.length === 0) {
        setLeaderboard([
          {
            rank: 1,
            instructor_name: 'Mary Wangari',
            points: 1850,
            level: 12,
            badges_count: 18,
            kudos_count: 45,
            is_you: false,
          },
          {
            rank: 2,
            instructor_name: 'Peter Kimani',
            points: 1720,
            level: 11,
            badges_count: 16,
            kudos_count: 38,
            is_you: false,
          },
          {
            rank: 3,
            instructor_name: 'Sarah Wambui',
            points: 1580,
            level: 10,
            badges_count: 15,
            kudos_count: 32,
            is_you: false,
          },
          {
            rank: 4,
            instructor_name: 'James Ochieng',
            points: 1420,
            level: 10,
            badges_count: 14,
            kudos_count: 28,
            is_you: false,
          },
          {
            rank: 5,
            instructor_name: 'You',
            points: 1280,
            level: 9,
            badges_count: 12,
            kudos_count: 24,
            is_you: true,
          },
          {
            rank: 6,
            instructor_name: 'Grace Njeri',
            points: 1150,
            level: 8,
            badges_count: 11,
            kudos_count: 20,
            is_you: false,
          },
          {
            rank: 7,
            instructor_name: 'David Mutua',
            points: 980,
            level: 7,
            badges_count: 9,
            kudos_count: 16,
            is_you: false,
          },
          {
            rank: 8,
            instructor_name: 'Alice Mwende',
            points: 850,
            level: 6,
            badges_count: 8,
            kudos_count: 12,
            is_you: false,
          },
        ]);
      } else {
        setLeaderboard(leaderboardResponse.data);
      }
    } catch (error) {
      console.error('Error fetching recognition data:', error);
      setKudosReceived([]);
      setKudosSent([]);
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendKudo = async () => {
    if (!kudoForm.to_instructor_id || !kudoForm.category || !kudoForm.message.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSubmittingKudo(true);
      const token = localStorage.getItem('access_token');
      await axios.post(
        `${API_URL}/api/v1/instructor/gamification/kudos`,
        kudoForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Kudo sent successfully!');
      setKudoForm({
        to_instructor_id: '',
        category: '',
        message: '',
        is_public: true,
      });
      setShowSendKudoForm(false);
      fetchRecognitionData();
    } catch (error) {
      console.error('Error sending kudo:', error);
      alert('Failed to send kudo');
    } finally {
      setSubmittingKudo(false);
    }
  };

  const categoryColors = {
    Helpful: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    Inspiring: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    'Teaching Excellence': 'bg-green-500/10 text-green-400 border-green-500/30',
    Collaborative: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    Supportive: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
  };

  const yourRank = leaderboard.find((entry) => entry.is_you)?.rank || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <InstructorPageHeader
        title="Peer Recognition"
        description="Give and receive kudos from fellow instructors"
        icon={<Heart className="w-6 h-6 text-purple-400" />}
        actions={
          <button
            onClick={() => setShowSendKudoForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-gray-900 dark:text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Send Kudo
          </button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-5">
          <p className="text-sm text-purple-200 mb-2">Kudos Received</p>
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-pink-400 fill-pink-400" />
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{kudosReceived.length}</p>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-5">
          <p className="text-sm text-gray-500 dark:text-white/60 mb-2">Kudos Sent</p>
          <div className="flex items-center gap-2">
            <Send className="w-6 h-6 text-blue-400" />
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{kudosSent.length}</p>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-5">
          <p className="text-sm text-gray-500 dark:text-white/60 mb-2">Leaderboard Rank</p>
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <p className="text-3xl font-bold text-gray-900 dark:text-white">#{yourRank}</p>
          </div>
        </div>
      </div>

      {/* Send Kudo Form */}
      {showSendKudoForm && (
        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Send a Kudo</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-white/80 mb-2">
                To Instructor *
              </label>
              <select
                value={kudoForm.to_instructor_id}
                onChange={(e) =>
                  setKudoForm({ ...kudoForm, to_instructor_id: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50"
              >
                <option value="">Select an instructor</option>
                <option value="1">Mary Wangari</option>
                <option value="2">Peter Kimani</option>
                <option value="3">Sarah Wambui</option>
                <option value="4">James Ochieng</option>
                <option value="5">Grace Njeri</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-white/80 mb-2">Category *</label>
              <select
                value={kudoForm.category}
                onChange={(e) => setKudoForm({ ...kudoForm, category: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50"
              >
                <option value="">Select a category</option>
                <option value="Helpful">Helpful</option>
                <option value="Inspiring">Inspiring</option>
                <option value="Teaching Excellence">Teaching Excellence</option>
                <option value="Collaborative">Collaborative</option>
                <option value="Supportive">Supportive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-white/80 mb-2">Message *</label>
              <textarea
                value={kudoForm.message}
                onChange={(e) => setKudoForm({ ...kudoForm, message: e.target.value })}
                placeholder="Write your message of appreciation..."
                rows={4}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-purple-500/50 resize-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_public"
                checked={kudoForm.is_public}
                onChange={(e) => setKudoForm({ ...kudoForm, is_public: e.target.checked })}
                className="w-4 h-4 rounded border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-purple-500 focus:ring-purple-500"
              />
              <label htmlFor="is_public" className="text-sm text-gray-600 dark:text-white/80">
                Make this kudo public (visible in leaderboard)
              </label>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSendKudo}
                disabled={submittingKudo}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/50 disabled:cursor-not-allowed text-gray-900 dark:text-white rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
                {submittingKudo ? 'Sending...' : 'Send Kudo'}
              </button>
              <button
                onClick={() => setShowSendKudoForm(false)}
                className="px-4 py-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-white/10">
        <button
          onClick={() => setActiveTab('received')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'received'
              ? 'border-purple-500 text-gray-900 dark:text-white'
              : 'border-transparent text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Received ({kudosReceived.length})
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'sent'
              ? 'border-purple-500 text-gray-900 dark:text-white'
              : 'border-transparent text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Sent ({kudosSent.length})
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'leaderboard'
              ? 'border-purple-500 text-gray-900 dark:text-white'
              : 'border-transparent text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Leaderboard
        </button>
      </div>

      {/* Kudos Received */}
      {activeTab === 'received' && (
        <div className="space-y-4">
          {kudosReceived.map((kudo) => (
            <div
              key={kudo.id}
              className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    {kudo.from_instructor_avatar ? (
                      <img
                        src={kudo.from_instructor_avatar}
                        alt={kudo.from_instructor_name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-purple-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {kudo.from_instructor_name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-white/60">
                      {format(new Date(kudo.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-lg border text-xs font-medium ${
                    categoryColors[kudo.category as keyof typeof categoryColors]
                  }`}
                >
                  {kudo.category}
                </span>
              </div>

              <p className="text-sm text-gray-600 dark:text-white/80 mb-3">{kudo.message}</p>

              {kudo.is_public && (
                <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-300 dark:text-white/40">
                  <MessageSquare className="w-3 h-3" />
                  <span>Public</span>
                </div>
              )}
            </div>
          ))}

          {kudosReceived.length === 0 && (
            <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-12 text-center">
              <Heart className="w-16 h-16 text-gray-400 dark:text-white/30 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-white/60">No kudos received yet</p>
            </div>
          )}
        </div>
      )}

      {/* Kudos Sent */}
      {activeTab === 'sent' && (
        <div className="space-y-4">
          {kudosSent.map((kudo) => (
            <div
              key={kudo.id}
              className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm text-gray-500 dark:text-white/60 mb-1">
                    To: <span className="text-gray-900 dark:text-white font-semibold">{kudo.to_instructor_name}</span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-white/60">
                    {format(new Date(kudo.created_at), 'MMM d, yyyy')}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-lg border text-xs font-medium ${
                    categoryColors[kudo.category as keyof typeof categoryColors]
                  }`}
                >
                  {kudo.category}
                </span>
              </div>

              <p className="text-sm text-gray-600 dark:text-white/80">{kudo.message}</p>
            </div>
          ))}

          {kudosSent.length === 0 && (
            <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-12 text-center">
              <Send className="w-16 h-16 text-gray-400 dark:text-white/30 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-white/60">No kudos sent yet</p>
            </div>
          )}
        </div>
      )}

      {/* Leaderboard */}
      {activeTab === 'leaderboard' && (
        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-white/10 text-left">
                  <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-white/60">Rank</th>
                  <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-white/60">Instructor</th>
                  <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-white/60">Level</th>
                  <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-white/60">Points</th>
                  <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-white/60">Badges</th>
                  <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-white/60">Kudos</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry) => (
                  <tr
                    key={entry.rank}
                    className={`border-b border-gray-200 dark:border-white/10 ${
                      entry.is_you
                        ? 'bg-purple-500/10'
                        : 'hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {entry.rank === 1 && <Trophy className="w-5 h-5 text-yellow-400" />}
                        {entry.rank === 2 && <Trophy className="w-5 h-5 text-gray-400 dark:text-gray-300" />}
                        {entry.rank === 3 && <Trophy className="w-5 h-5 text-orange-400" />}
                        <span className="text-lg font-bold text-gray-900 dark:text-white">#{entry.rank}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                          {entry.instructor_avatar ? (
                            <img
                              src={entry.instructor_avatar}
                              alt={entry.instructor_name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-4 h-4 text-purple-400" />
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {entry.instructor_name}
                          {entry.is_you && (
                            <span className="ml-2 px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded">
                              You
                            </span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900 dark:text-white">Level {entry.level}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-purple-300 font-medium">
                        {entry.points.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900 dark:text-white">{entry.badges_count}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900 dark:text-white">{entry.kudos_count}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-6">
        <h4 className="text-sm font-semibold text-purple-200 mb-2">About Peer Recognition</h4>
        <ul className="text-sm text-purple-200/80 space-y-1 list-disc list-inside">
          <li>
            Kudos are a way to recognize and appreciate fellow instructors for their contributions
          </li>
          <li>Public kudos appear on instructor profiles and in the community leaderboard</li>
          <li>
            Receiving kudos contributes to your overall points and can boost your leaderboard
            ranking
          </li>
          <li>The leaderboard resets monthly to encourage ongoing engagement and improvement</li>
          <li>
            Top-ranked instructors receive visibility boosts and may qualify for platform bonuses
          </li>
        </ul>
      </div>
    </div>
  );
};
