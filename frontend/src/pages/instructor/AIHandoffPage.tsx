import React, { useEffect, useState } from 'react';
import { Search, Sparkles, TrendingUp, MessageCircle, BookOpen, AlertCircle } from 'lucide-react';
import { InstructorPageHeader } from '../../components/instructor/shared/InstructorPageHeader';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/api';
import { format } from 'date-fns';


interface AIConversation {
  id: string;
  student_id: string;
  student_name: string;
  total_messages: number;
  last_interaction: string;
  topics_discussed: string[];
  struggles_identified: string[];
  comprehension_score: number;
  requires_intervention: boolean;
}

interface ConversationDetail {
  message: string;
  sender: 'student' | 'ai';
  timestamp: string;
  topic?: string;
}

export const AIHandoffPage: React.FC = () => {
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<ConversationDetail[]>([]);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      fetchConversationDetails(selectedStudent);
    }
  }, [selectedStudent]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/v1/instructor/ai-handoff');

      // Mock data for development
      if (!response.data || response.data.length === 0) {
        setConversations([
          {
            id: '1',
            student_id: 'student-1',
            student_name: 'Jane Mwangi',
            total_messages: 45,
            last_interaction: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            topics_discussed: ['Linear Equations', 'Quadratic Functions', 'Word Problems'],
            struggles_identified: ['Translating word problems to equations'],
            comprehension_score: 78,
            requires_intervention: false,
          },
          {
            id: '2',
            student_id: 'student-2',
            student_name: 'John Kamau',
            total_messages: 32,
            last_interaction: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            topics_discussed: ['Fractions', 'Decimals', 'Percentages'],
            struggles_identified: ['Converting between fractions and decimals', 'Percentage calculations'],
            comprehension_score: 62,
            requires_intervention: true,
          },
          {
            id: '3',
            student_id: 'student-3',
            student_name: 'Sarah Wanjiru',
            total_messages: 28,
            last_interaction: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            topics_discussed: ['Geometry', 'Angles', 'Triangles'],
            struggles_identified: [],
            comprehension_score: 89,
            requires_intervention: false,
          },
        ]);
      } else {
        setConversations(response.data);
      }
    } catch (error) {
      console.error('Error fetching AI conversations:', error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversationDetails = async (studentId: string) => {
    try {
      const response = await apiClient.get(
        `/api/v1/instructor/ai-handoff/${studentId}/summary`
      );

      // Mock data for development
      if (!response.data) {
        setConversationHistory([
          {
            message: 'I don\'t understand how to solve this equation: 2x + 5 = 15',
            sender: 'student',
            timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
            topic: 'Linear Equations',
          },
          {
            message: 'Let me help you solve this step by step! To solve 2x + 5 = 15, we need to isolate x. First, let\'s subtract 5 from both sides...',
            sender: 'ai',
            timestamp: new Date(Date.now() - 59 * 60 * 1000).toISOString(),
            topic: 'Linear Equations',
          },
          {
            message: 'Oh I see! So it becomes 2x = 10, right?',
            sender: 'student',
            timestamp: new Date(Date.now() - 58 * 60 * 1000).toISOString(),
            topic: 'Linear Equations',
          },
          {
            message: 'Exactly! Now divide both sides by 2 to get x = 5. Great work!',
            sender: 'ai',
            timestamp: new Date(Date.now() - 57 * 60 * 1000).toISOString(),
            topic: 'Linear Equations',
          },
        ]);

        setAiSummary(
          'Student shows good understanding of basic algebraic concepts but occasionally struggles with translating word problems into equations. Recent sessions focused on linear equations and functions. Comprehension improving with practice. Recommended: Provide additional word problem worksheets and real-world application exercises.'
        );
      } else {
        setConversationHistory(response.data.history || []);
        setAiSummary(response.data.summary || '');
      }
    } catch (error) {
      console.error('Error fetching conversation details:', error);
      setConversationHistory([]);
      setAiSummary('');
    }
  };

  const handleTakeAction = (studentId: string) => {
    navigate(`/dashboard/instructor/students/${studentId}/interventions`);
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.student_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: conversations.length,
    needsIntervention: conversations.filter((c) => c.requires_intervention).length,
    avgComprehension: Math.round(
      conversations.reduce((sum, c) => sum + c.comprehension_score, 0) /
        (conversations.length || 1)
    ),
    totalInteractions: conversations.reduce((sum, c) => sum + c.total_messages, 0),
  };

  const selectedConv = conversations.find((c) => c.student_id === selectedStudent);

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
        title="AI Tutor Handoff"
        description="Review AI tutor conversations and identify students who need support"
        badge="AI Powered"
        icon={<Sparkles className="w-6 h-6 text-purple-400" />}
      />

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <MessageCircle className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-white/60">Active Students</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <AlertCircle className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-white/60">Need Intervention</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.needsIntervention}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-white/60">Avg Comprehension</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgComprehension}%</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Sparkles className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-white/60">Total Interactions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalInteractions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Students List */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
            {/* Search */}
            <div className="p-4 border-b border-gray-200 dark:border-white/10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-300 dark:text-white/40" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-purple-500/50"
                />
              </div>
            </div>

            {/* Student List */}
            <div className="max-h-[600px] overflow-y-auto">
              {filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedStudent(conv.student_id)}
                  className={`p-4 border-b border-gray-200 dark:border-white/10 cursor-pointer transition-colors ${
                    selectedStudent === conv.student_id
                      ? 'bg-purple-500/10'
                      : 'hover:bg-gray-50 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{conv.student_name}</h4>
                    {conv.requires_intervention && (
                      <AlertCircle className="w-4 h-4 text-orange-400" />
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-gray-400 dark:text-gray-300 dark:text-white/40">
                      {conv.total_messages} messages
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-300 dark:text-white/40">•</span>
                    <span className="text-xs text-gray-400 dark:text-gray-300 dark:text-white/40">
                      {format(new Date(conv.last_interaction), 'MMM d')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 dark:bg-white/10 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${
                          conv.comprehension_score >= 80
                            ? 'bg-green-500'
                            : conv.comprehension_score >= 60
                            ? 'bg-orange-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${conv.comprehension_score}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-white/60">{conv.comprehension_score}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Conversation Details */}
        <div className="lg:col-span-2 space-y-6">
          {selectedConv ? (
            <>
              {/* Student Info */}
              <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                      {selectedConv.student_name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-white/60">
                      {selectedConv.total_messages} AI interactions
                    </p>
                  </div>

                  {selectedConv.requires_intervention && (
                    <button
                      onClick={() => handleTakeAction(selectedConv.student_id)}
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-gray-900 dark:text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      Take Action
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-white/60 mb-1">Topics Discussed</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedConv.topics_discussed.map((topic, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 dark:text-white/60 mb-1">Struggles Identified</p>
                    {selectedConv.struggles_identified.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedConv.struggles_identified.map((struggle, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-orange-500/20 text-orange-300 rounded"
                          >
                            {struggle}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-green-400">No struggles identified</p>
                    )}
                  </div>
                </div>
              </div>

              {/* AI Summary */}
              {aiSummary && (
                <div className="bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-purple-500/20 border border-purple-500/30 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    AI Summary & Recommendations
                  </h3>
                  <p className="text-gray-600 dark:text-white/80">{aiSummary}</p>
                </div>
              )}

              {/* Recent Conversations */}
              <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-purple-400" />
                  Recent Conversations
                </h3>

                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                  {conversationHistory.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === 'ai' ? 'justify-start' : 'justify-end'}`}>
                      <div
                        className={`max-w-[80%] rounded-xl px-4 py-3 ${
                          msg.sender === 'ai'
                            ? 'bg-purple-500/20 border border-purple-500/30'
                            : 'bg-gray-100 dark:bg-white/10'
                        }`}
                      >
                        {msg.topic && (
                          <p className="text-xs text-purple-300 mb-1 flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            {msg.topic}
                          </p>
                        )}
                        <p className="text-sm text-gray-800 dark:text-white/90 mb-1">{msg.message}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-300 dark:text-white/40">
                          {format(new Date(msg.timestamp), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-12 text-center">
              <Sparkles className="w-16 h-16 text-gray-400 dark:text-white/30 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-white/60">Select a student to view AI conversation history</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
