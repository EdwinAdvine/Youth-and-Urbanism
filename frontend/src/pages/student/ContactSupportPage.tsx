import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { Headphones, Send, Clock, CheckCircle, AlertTriangle, MessageCircle, Bot, Phone, Mail } from 'lucide-react';

const tickets = [
  { id: 'TKT-001', subject: 'Cannot access Science course', status: 'open' as const, priority: 'high' as const, createdAt: '2 hours ago', lastReply: 'Support team is looking into it' },
  { id: 'TKT-002', subject: 'M-Pesa payment not reflected', status: 'resolved' as const, priority: 'medium' as const, createdAt: '3 days ago', lastReply: 'Issue resolved, funds credited' },
  { id: 'TKT-003', subject: 'Quiz timer not working properly', status: 'open' as const, priority: 'low' as const, createdAt: '1 week ago', lastReply: 'We are investigating the issue' },
];

const ContactSupportPage: React.FC = () => {
  const navigate = useNavigate();
  const { borderRadius } = useAgeAdaptiveUI();
  const [activeTab, setActiveTab] = useState<'new' | 'tickets'>('new');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('medium');
  const [submitted, setSubmitted] = useState(false);

  const statusConfig = {
    open: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
    resolved: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/20' },
  };

  const priorityConfig = {
    high: { color: 'text-red-400', bg: 'bg-red-500/20' },
    medium: { color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
    low: { color: 'text-blue-400', bg: 'bg-blue-500/20' },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <Headphones className="w-8 h-8 text-green-400" /> Contact Support
        </h1>
        <p className="text-gray-600 dark:text-white/70">We're here to help you with any issues</p>
      </div>

      {/* Quick Contact Options */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button onClick={() => navigate('/dashboard/student/support/ai-help')} className={`p-4 bg-purple-500/10 ${borderRadius} border border-purple-500/20 text-center hover:bg-purple-500/20`}>
          <Bot className="w-6 h-6 text-purple-400 mx-auto mb-1" />
          <span className="text-gray-900 dark:text-white text-sm font-medium block">AI Help</span>
          <span className="text-gray-400 dark:text-white/40 text-xs">Instant</span>
        </button>
        <button onClick={() => navigate('/dashboard/student/support/teacher-chat')} className={`p-4 bg-green-500/10 ${borderRadius} border border-green-500/20 text-center hover:bg-green-500/20`}>
          <MessageCircle className="w-6 h-6 text-green-400 mx-auto mb-1" />
          <span className="text-gray-900 dark:text-white text-sm font-medium block">Live Chat</span>
          <span className="text-gray-400 dark:text-white/40 text-xs">Online</span>
        </button>
        <button onClick={() => { setActiveTab('new'); window.scrollTo({ top: 400, behavior: 'smooth' }); }} className={`p-4 bg-blue-500/10 ${borderRadius} border border-blue-500/20 text-center hover:bg-blue-500/20`}>
          <Mail className="w-6 h-6 text-blue-400 mx-auto mb-1" />
          <span className="text-gray-900 dark:text-white text-sm font-medium block">Email</span>
          <span className="text-gray-400 dark:text-white/40 text-xs">24hr response</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('new')}
          className={`px-4 py-2 ${borderRadius} text-sm font-medium ${
            activeTab === 'new' ? 'bg-[#FF0000] text-gray-900 dark:text-white' : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/60'
          }`}
        >
          New Ticket
        </button>
        <button
          onClick={() => setActiveTab('tickets')}
          className={`px-4 py-2 ${borderRadius} text-sm font-medium ${
            activeTab === 'tickets' ? 'bg-[#FF0000] text-gray-900 dark:text-white' : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/60'
          }`}
        >
          My Tickets ({tickets.length})
        </button>
      </div>

      {activeTab === 'new' && (
        <div className={`p-6 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
          <h3 className="text-gray-900 dark:text-white font-medium mb-4">Create Support Ticket</h3>
          <div className="space-y-4">
            <div>
              <label className="text-gray-500 dark:text-white/60 text-sm mb-1 block">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white focus:outline-none focus:border-green-500`}
              >
                <option value="" className="bg-white dark:bg-[#181C1F]">Select a category...</option>
                <option value="technical" className="bg-white dark:bg-[#181C1F]">Technical Issue</option>
                <option value="payment" className="bg-white dark:bg-[#181C1F]">Payment Problem</option>
                <option value="course" className="bg-white dark:bg-[#181C1F]">Course Access</option>
                <option value="account" className="bg-white dark:bg-[#181C1F]">Account Issue</option>
                <option value="other" className="bg-white dark:bg-[#181C1F]">Other</option>
              </select>
            </div>

            <div>
              <label className="text-gray-500 dark:text-white/60 text-sm mb-1 block">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief description of your issue"
                className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-green-500`}
              />
            </div>

            <div>
              <label className="text-gray-500 dark:text-white/60 text-sm mb-1 block">Priority</label>
              <div className="flex gap-2">
                {(['low', 'medium', 'high'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`px-3 py-1.5 ${borderRadius} text-sm capitalize ${
                      priority === p
                        ? `${priorityConfig[p].bg} ${priorityConfig[p].color}`
                        : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/60'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-gray-500 dark:text-white/60 text-sm mb-1 block">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue in detail..."
                rows={4}
                className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-green-500 resize-none`}
              />
            </div>

            <button
              disabled={!subject || !message || !category}
              onClick={() => {
                setSubmitted(true);
                setSubject('');
                setMessage('');
                setCategory('');
                setPriority('medium');
                setTimeout(() => setSubmitted(false), 3000);
              }}
              className={`w-full py-2.5 ${submitted ? 'bg-green-600' : 'bg-green-500 hover:bg-green-600'} disabled:bg-gray-100 dark:disabled:bg-white/10 disabled:text-gray-400 dark:disabled:text-white/30 text-gray-900 dark:text-white font-medium ${borderRadius} flex items-center justify-center gap-2`}
            >
              {submitted ? <><CheckCircle className="w-4 h-4" /> Ticket Submitted!</> : <><Send className="w-4 h-4" /> Submit Ticket</>}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'tickets' && (
        <div className="space-y-3">
          {tickets.map((ticket) => {
            const sConfig = statusConfig[ticket.status];
            const pConfig = priorityConfig[ticket.priority];
            const StatusIcon = sConfig.icon;

            return (
              <div key={ticket.id} className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] hover:border-gray-300 dark:hover:border-white/20 transition-colors`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 ${sConfig.bg} ${sConfig.color} text-xs ${borderRadius} flex items-center gap-1`}>
                    <StatusIcon className="w-3 h-3" /> {ticket.status}
                  </span>
                  <span className={`px-2 py-0.5 ${pConfig.bg} ${pConfig.color} text-xs ${borderRadius}`}>{ticket.priority}</span>
                  <span className="text-gray-400 dark:text-white/30 text-xs">{ticket.id}</span>
                </div>
                <h3 className="text-gray-900 dark:text-white font-medium">{ticket.subject}</h3>
                <p className="text-gray-500 dark:text-white/50 text-sm mt-1">{ticket.lastReply}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-400 dark:text-white/40">
                  <Clock className="w-3 h-3" /> {ticket.createdAt}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Emergency Contact */}
      <div className={`p-4 bg-red-500/10 ${borderRadius} border border-red-500/20`}>
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-gray-900 dark:text-white font-medium text-sm">Urgent Issue?</p>
            <p className="text-gray-500 dark:text-white/60 text-xs">For urgent matters, contact us directly</p>
          </div>
          <button className={`px-3 py-1.5 bg-red-500 hover:bg-red-600 text-gray-900 dark:text-white text-sm ${borderRadius} flex items-center gap-1`}>
            <Phone className="w-3 h-3" /> Call
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactSupportPage;
