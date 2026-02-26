import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Video,
  MapPin,
  Clock,
  Users,
  PenSquare,
  CalendarPlus,
  Circle,
  ExternalLink,
  Mail,
} from 'lucide-react';

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

interface Message {
  id: string;
  senderName: string;
  subject: string;
  preview: string;
  timestamp: string;
  isRead: boolean;
}

type MeetingType = 'virtual' | 'in-person';

interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  attendees: number;
  type: MeetingType;
}

const mockMessages: Message[] = [
  {
    id: '1',
    senderName: 'Dr. Faith Muthoni',
    subject: 'Q1 Partnership Review Meeting',
    preview: 'Hi, I wanted to follow up on our discussion regarding the Q1 targets and the upcoming review session scheduled for next week...',
    timestamp: '2026-02-14T09:30:00',
    isRead: false,
  },
  {
    id: '2',
    senderName: 'James Otieno',
    subject: 'New Enrollment Batch - February',
    preview: 'We have a new batch of 15 students ready for enrollment. Please review the consent forms attached and confirm the program allocation...',
    timestamp: '2026-02-13T16:45:00',
    isRead: false,
  },
  {
    id: '3',
    senderName: 'Alice Wairimu',
    subject: 'Impact Report Feedback',
    preview: 'Thank you for sharing the January impact report. The board was impressed with the completion rates. A few suggestions for improvement...',
    timestamp: '2026-02-12T11:20:00',
    isRead: true,
  },
  {
    id: '4',
    senderName: 'Samuel Kipchoge',
    subject: 'Resource Allocation Update',
    preview: 'Just a quick update on the resource allocation for Term 1. We have secured additional learning materials for the science program...',
    timestamp: '2026-02-10T14:00:00',
    isRead: true,
  },
  {
    id: '5',
    senderName: 'Mary Njeri',
    subject: 'Parent Orientation Schedule',
    preview: 'The parent orientation for new enrollees is confirmed for February 20th. Kindly share the agenda and any materials you want included...',
    timestamp: '2026-02-08T10:15:00',
    isRead: true,
  },
];

const mockMeetings: Meeting[] = [
  {
    id: '1',
    title: 'Q1 Partnership Review',
    date: '2026-02-18',
    time: '10:00 AM',
    duration: '1 hour',
    attendees: 6,
    type: 'virtual',
  },
  {
    id: '2',
    title: 'Parent Orientation Session',
    date: '2026-02-20',
    time: '2:00 PM',
    duration: '2 hours',
    attendees: 24,
    type: 'in-person',
  },
  {
    id: '3',
    title: 'STEM Program Planning',
    date: '2026-02-25',
    time: '11:00 AM',
    duration: '45 min',
    attendees: 4,
    type: 'virtual',
  },
];

const CollaborationPage: React.FC = () => {
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const unreadCount = mockMessages.filter((m) => !m.isRead).length;

  const formatTimestamp = (ts: string) => {
    const date = new Date(ts);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  };

  const formatMeetingDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-GB', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
    });

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F1112] p-6">
      <motion.div variants={stagger} initial="hidden" animate="visible" className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div variants={fadeUp}>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Collaboration</h1>
          <p className="text-gray-400 dark:text-white/40 mt-1">Messages and meetings hub</p>
        </motion.div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Column - Messages (60%) */}
          <motion.div variants={fadeUp} className="lg:col-span-3 space-y-4">
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl overflow-hidden">
              {/* Messages Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-[#22272B]">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-600 dark:text-white/70" />
                  <h2 className="text-gray-900 dark:text-white font-semibold text-lg">Inbox</h2>
                  {unreadCount > 0 && (
                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-500 text-gray-900 dark:text-white min-w-[20px]">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowComposeModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors"
                >
                  <PenSquare className="w-4 h-4" />
                  Compose
                </button>
              </div>

              {/* Message List */}
              <div className="divide-y divide-gray-200 dark:divide-[#22272B]">
                {mockMessages.map((message) => (
                  <button
                    key={message.id}
                    onClick={() => setSelectedMessage(message.id)}
                    className={`w-full text-left p-4 hover:bg-[#1a1f23] transition-colors ${
                      selectedMessage === message.id ? 'bg-[#1a1f23]' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Unread Indicator */}
                      <div className="pt-1.5 shrink-0">
                        {!message.isRead ? (
                          <Circle className="w-2.5 h-2.5 fill-red-400 text-red-400" />
                        ) : (
                          <Circle className="w-2.5 h-2.5 text-transparent" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className={`text-sm font-medium truncate ${!message.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-white/70'}`}>
                            {message.senderName}
                          </p>
                          <span className="text-xs text-gray-400 dark:text-white/40 shrink-0">{formatTimestamp(message.timestamp)}</span>
                        </div>
                        <p className={`text-sm truncate mb-1 ${!message.isRead ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-600 dark:text-white/70'}`}>
                          {message.subject}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-white/40 truncate">{message.preview}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Column - Meetings (40%) */}
          <motion.div variants={fadeUp} className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl overflow-hidden">
              {/* Meetings Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-[#22272B]">
                <h2 className="text-gray-900 dark:text-white font-semibold text-lg">Upcoming Meetings</h2>
                <button
                  onClick={() => setShowScheduleModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors"
                >
                  <CalendarPlus className="w-4 h-4" />
                  Schedule Meeting
                </button>
              </div>

              {/* Meeting Cards */}
              <div className="p-4 space-y-3">
                {mockMeetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-xl p-4 space-y-3"
                  >
                    {/* Title and Type */}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-gray-900 dark:text-white font-medium text-sm leading-tight">{meeting.title}</h3>
                      {meeting.type === 'virtual' ? (
                        <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400">
                          <Video className="w-3 h-3" />
                          Virtual
                        </span>
                      ) : (
                        <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400">
                          <MapPin className="w-3 h-3" />
                          In-Person
                        </span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 dark:text-white/40">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatMeetingDate(meeting.date)} at {meeting.time}
                      </span>
                      <span>{meeting.duration}</span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {meeting.attendees} attendees
                      </span>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => {
                        if (meeting.type === 'virtual') {
                          window.open(`https://meet.google.com/${meeting.id}`, '_blank');
                        } else {
                          alert(`Meeting Details:\n${meeting.title}\nDate: ${formatMeetingDate(meeting.date)} at ${meeting.time}\nDuration: ${meeting.duration}\nAttendees: ${meeting.attendees}`);
                        }
                      }}
                      className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        meeting.type === 'virtual'
                          ? 'text-blue-400 bg-blue-500/10 hover:bg-blue-500/20'
                          : 'text-gray-600 dark:text-white/70 bg-gray-100 dark:bg-[#22272B] hover:bg-[#2a3035]'
                      }`}
                    >
                      {meeting.type === 'virtual' ? (
                        <>
                          <Video className="w-3.5 h-3.5" />
                          Join Meeting
                        </>
                      ) : (
                        <>
                          <ExternalLink className="w-3.5 h-3.5" />
                          View Details
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Compose Message Modal */}
        {showComposeModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6 max-w-lg w-full"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Compose Message</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600 dark:text-white/70 block mb-2">To</label>
                  <input
                    type="text"
                    placeholder="Enter recipient name"
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-red-500/50"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-white/70 block mb-2">Subject</label>
                  <input
                    type="text"
                    placeholder="Message subject"
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-red-500/50"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-white/70 block mb-2">Message</label>
                  <textarea
                    rows={5}
                    placeholder="Type your message..."
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-red-500/50 resize-none"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={() => {
                    alert('Message sent successfully!');
                    setShowComposeModal(false);
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                >
                  Send Message
                </button>
                <button
                  onClick={() => setShowComposeModal(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-[#22272B] text-gray-900 dark:text-white rounded-lg hover:bg-[#2a3035] transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Schedule Meeting Modal */}
        {showScheduleModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6 max-w-lg w-full"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Schedule Meeting</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600 dark:text-white/70 block mb-2">Meeting Title</label>
                  <input
                    type="text"
                    placeholder="Enter meeting title"
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-red-500/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-gray-600 dark:text-white/70 block mb-2">Date</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 dark:text-white/70 block mb-2">Time</label>
                    <input
                      type="time"
                      className="w-full px-3 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-white/70 block mb-2">Type</label>
                  <select className="w-full px-3 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500/50">
                    <option value="virtual">Virtual Meeting</option>
                    <option value="in-person">In-Person Meeting</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={() => {
                    alert('Meeting scheduled successfully!');
                    setShowScheduleModal(false);
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                >
                  Schedule Meeting
                </button>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-[#22272B] text-gray-900 dark:text-white rounded-lg hover:bg-[#2a3035] transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default CollaborationPage;
