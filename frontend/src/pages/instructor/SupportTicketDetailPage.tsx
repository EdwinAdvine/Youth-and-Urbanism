import React, { useEffect, useState } from 'react';
import { ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { InstructorPageHeader } from '../../components/instructor/shared/InstructorPageHeader';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface TicketMessage {
  id: string;
  author_name: string;
  author_role: 'instructor' | 'support';
  content: string;
  created_at: string;
}

export const SupportTicketDetailPage: React.FC = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<any>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchTicketDetails();
  }, [ticketId]);

  const fetchTicketDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/api/v1/instructor/hub/support/tickets/${ticketId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Mock data
      if (!response.data) {
        setTicket({
          id: ticketId,
          title: 'Unable to upload video to course',
          description: 'Getting an error when trying to upload a 200MB video file to my Mathematics course. The upload starts but fails at around 50%.',
          category: 'Technical',
          priority: 'high',
          status: 'in_progress',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        });

        setMessages([
          {
            id: '1',
            author_name: 'You',
            author_role: 'instructor',
            content: 'Getting an error when trying to upload a 200MB video file to my Mathematics course. The upload starts but fails at around 50%.',
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '2',
            author_name: 'Support Team',
            author_role: 'support',
            content: 'Hi! Thanks for reporting this. Could you let me know what browser you\'re using and if you see any specific error messages?',
            created_at: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
          },
          {
            id: '3',
            author_name: 'You',
            author_role: 'instructor',
            content: 'I\'m using Chrome. The error message says "Upload failed: Network error"',
            created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          },
          {
            id: '4',
            author_name: 'Support Team',
            author_role: 'support',
            content: 'Thanks! It looks like there might be a temporary issue with our video processing service. I\'ve escalated this to our engineering team. In the meantime, try compressing the video to under 150MB or uploading during off-peak hours.',
            created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          },
        ]);
      } else {
        setTicket(response.data.ticket);
        setMessages(response.data.messages);
      }
    } catch (error) {
      console.error('Error fetching ticket details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;

    try {
      setSending(true);
      const token = localStorage.getItem('access_token');
      await axios.post(
        `${API_URL}/api/v1/instructor/hub/support/tickets/${ticketId}/reply`,
        { content: replyText.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Add message locally
      const newMessage: TicketMessage = {
        id: Date.now().toString(),
        author_name: 'You',
        author_role: 'instructor',
        content: replyText.trim(),
        created_at: new Date().toISOString(),
      };

      setMessages([...messages, newMessage]);
      setReplyText('');
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

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
        title={ticket?.title || 'Ticket Details'}
        description={`Ticket #${ticketId}`}
        icon={
          <button
            onClick={() => navigate('/dashboard/instructor/hub/support')}
            className="p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white" />
          </button>
        }
        actions={
          ticket?.status !== 'resolved' && ticket?.status !== 'closed' && (
            <button className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-gray-900 dark:text-white rounded-lg transition-colors">
              <CheckCircle className="w-4 h-4" />
              Mark as Resolved
            </button>
          )
        }
      />

      {/* Ticket Info */}
      <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-0.5 bg-orange-500/10 text-orange-400 border border-orange-500/30 rounded text-xs font-medium">
            {ticket?.status?.replace('_', ' ')}
          </span>
          <span className="px-2 py-0.5 bg-orange-500/10 text-orange-400 rounded text-xs font-medium">
            {ticket?.priority}
          </span>
          <span className="px-2 py-0.5 bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/60 rounded text-xs">
            {ticket?.category}
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-white/70">{ticket?.description}</p>
        <p className="text-xs text-gray-400 dark:text-gray-300 dark:text-white/40 mt-2">
          Created {format(new Date(ticket?.created_at), 'MMM d, yyyy h:mm a')}
        </p>
      </div>

      {/* Messages Thread */}
      <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-6 space-y-4 max-h-[500px] overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.author_role === 'instructor' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-4 ${
                message.author_role === 'instructor'
                  ? 'bg-purple-500/20 border border-purple-500/30'
                  : 'bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-gray-900 dark:text-white">{message.author_name}</span>
                <span className="text-xs text-gray-400 dark:text-gray-300 dark:text-white/40">
                  {format(new Date(message.created_at), 'h:mm a')}
                </span>
              </div>
              <p className="text-sm text-gray-800 dark:text-white/90">{message.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Reply Input */}
      {ticket?.status !== 'resolved' && ticket?.status !== 'closed' && (
        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-4">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Type your reply..."
            rows={3}
            className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-purple-500/50 resize-none mb-3"
          />
          <button
            onClick={handleSendReply}
            disabled={!replyText.trim() || sending}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/50 disabled:cursor-not-allowed text-gray-900 dark:text-white rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
            {sending ? 'Sending...' : 'Send Reply'}
          </button>
        </div>
      )}
    </div>
  );
};
