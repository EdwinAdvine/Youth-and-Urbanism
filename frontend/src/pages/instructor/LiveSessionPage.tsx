import React, { useEffect, useState } from 'react';
import { PhoneOff, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { LiveVideoRoom } from '../../components/instructor/sessions/LiveVideoRoom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const LiveSessionPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [sessionTitle, setSessionTitle] = useState('');
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('access_token') || '';

  useEffect(() => {
    fetchSessionInfo();
  }, [sessionId]);

  const fetchSessionInfo = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/v1/instructor/sessions/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSessionTitle(response.data?.title || 'Live Session');
    } catch {
      setSessionTitle('Live Session');
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async () => {
    if (!confirm('Are you sure you want to end this session for all participants?')) return;

    try {
      await axios.post(
        `${API_URL}/api/v1/instructor/sessions/${sessionId}/end`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch {
      // Session may already be ended
    }
    navigate('/dashboard/instructor/sessions');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard/instructor/sessions')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-500 dark:text-white/60" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{sessionTitle}</h1>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs text-red-400">LIVE</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleEndSession}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-gray-900 dark:text-white rounded-lg transition-colors text-sm"
          >
            <PhoneOff className="w-4 h-4" />
            End Session
          </button>
        </div>
      </div>

      {/* Live Video Room */}
      <div className="flex-1 p-4">
        <LiveVideoRoom
          roomId={sessionId || 'default'}
          token={token}
          sessionTitle={sessionTitle}
          onLeave={() => navigate('/dashboard/instructor/sessions')}
        />
      </div>
    </div>
  );
};
