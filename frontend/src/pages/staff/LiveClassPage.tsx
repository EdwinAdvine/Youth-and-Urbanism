import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Monitor,
  MessageSquare,
  Users,
  LogOut,
  LayoutGrid,
  Clock,
  Radio,
  ChevronRight,
  Send,
  X,
  Maximize2,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface Participant {
  id: string;
  name: string;
  role: 'host' | 'co-host' | 'student';
  is_muted: boolean;
  camera_on: boolean;
  hand_raised: boolean;
}

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
}

/* ------------------------------------------------------------------ */
/* Mock data                                                           */
/* ------------------------------------------------------------------ */

const MOCK_PARTICIPANTS: Participant[] = [
  { id: 'P-001', name: 'Mr. James Odhiambo', role: 'host', is_muted: false, camera_on: true, hand_raised: false },
  { id: 'P-002', name: 'Ms. Faith Wanjiku', role: 'co-host', is_muted: false, camera_on: true, hand_raised: false },
  { id: 'P-003', name: 'Brian Otieno', role: 'student', is_muted: true, camera_on: true, hand_raised: false },
  { id: 'P-004', name: 'Amina Wafula', role: 'student', is_muted: true, camera_on: false, hand_raised: true },
  { id: 'P-005', name: 'Kevin Njoroge', role: 'student', is_muted: true, camera_on: true, hand_raised: false },
  { id: 'P-006', name: 'Mercy Akinyi', role: 'student', is_muted: true, camera_on: true, hand_raised: false },
  { id: 'P-007', name: 'Dennis Kipchoge', role: 'student', is_muted: true, camera_on: false, hand_raised: false },
  { id: 'P-008', name: 'Esther Wambui', role: 'student', is_muted: true, camera_on: true, hand_raised: false },
];

const MOCK_CHAT: ChatMessage[] = [
  { id: 'M-001', sender: 'Mr. James Odhiambo', text: 'Welcome everyone! Today we will cover the water cycle.', timestamp: '09:01' },
  { id: 'M-002', sender: 'Brian Otieno', text: 'Good morning, teacher!', timestamp: '09:02' },
  { id: 'M-003', sender: 'Amina Wafula', text: 'Can you explain evaporation again?', timestamp: '09:05' },
  { id: 'M-004', sender: 'Ms. Faith Wanjiku', text: 'Great question, Amina. Mr. Odhiambo will cover that next.', timestamp: '09:06' },
  { id: 'M-005', sender: 'Kevin Njoroge', text: 'Is condensation the same as precipitation?', timestamp: '09:08' },
];

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const LiveClassPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [loading, setLoading] = useState(true);
  const [micOn, setMicOn] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<'participants' | 'chat' | 'breakout'>('chat');
  const [chatInput, setChatInput] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [chatMessages, setChatMessages] = useState(MOCK_CHAT);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading) {
      const interval = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [loading]);

  const formatElapsed = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? `${h}:` : ''}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    setChatMessages([
      ...chatMessages,
      {
        id: `M-${chatMessages.length + 1}`,
        sender: 'You (Staff)',
        text: chatInput,
        timestamp: new Date().toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setChatInput('');
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-5rem)] bg-gray-50 dark:bg-[#0F1112] rounded-xl animate-pulse flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-[#22272B] rounded-full mx-auto mb-4 animate-pulse" />
          <div className="h-4 w-48 bg-gray-100 dark:bg-[#22272B] rounded mx-auto animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col bg-gray-50 dark:bg-[#0F1112] rounded-xl overflow-hidden border border-gray-200 dark:border-[#22272B]">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white dark:bg-[#181C1F] border-b border-gray-200 dark:border-[#22272B]">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">Grade 5 Science - The Water Cycle</h2>
          {sessionId && (
            <span className="text-[10px] text-gray-400 dark:text-white/30 font-mono">{sessionId}</span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-400 font-medium">REC</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-white/50">
            <Users className="w-3.5 h-3.5" />
            <span>{MOCK_PARTICIPANTS.length}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-white/50">
            <Clock className="w-3.5 h-3.5" />
            <span className="font-mono">{formatElapsed(elapsedSeconds)}</span>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Grid */}
        <div className="flex-1 p-4">
          <div className="h-full grid grid-cols-2 lg:grid-cols-3 gap-3">
            {MOCK_PARTICIPANTS.filter((p) => p.camera_on).slice(0, 6).map((participant) => (
              <motion.div
                key={participant.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl overflow-hidden flex items-center justify-center"
              >
                <div className="text-center">
                  <div className={`w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center text-xl font-bold ${participant.role === 'host' ? 'bg-[#E40000]/20 text-[#E40000]' : 'bg-gray-100 dark:bg-[#22272B] text-gray-500 dark:text-white/50'}`}>
                    {participant.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-white/70">{participant.name}</p>
                  {participant.role === 'host' && (
                    <span className="text-[9px] text-[#E40000]">Host</span>
                  )}
                </div>
                {participant.is_muted && (
                  <div className="absolute top-2 right-2 p-1 bg-red-500/20 rounded-full">
                    <MicOff className="w-3 h-3 text-red-400" />
                  </div>
                )}
                {participant.hand_raised && (
                  <div className="absolute top-2 left-2 text-yellow-400 text-sm">
                    &#9995;
                  </div>
                )}
                <button className="absolute bottom-2 right-2 p-1 hover:bg-gray-100 dark:hover:bg-[#22272B] rounded transition-colors">
                  <Maximize2 className="w-3 h-3 text-gray-400 dark:text-white/30" />
                </button>
              </motion.div>
            ))}

            {/* LiveKit notice */}
            {MOCK_PARTICIPANTS.filter((p) => p.camera_on).length < 6 && (
              <div className="flex items-center justify-center bg-white dark:bg-[#181C1F] border border-dashed border-gray-300 dark:border-[#333] rounded-xl">
                <div className="text-center px-4">
                  <Radio className="w-8 h-8 text-white/10 mx-auto mb-2" />
                  <p className="text-xs text-gray-400 dark:text-white/30">LiveKit room will be initialized here</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        {sidebarOpen && (
          <div className="w-80 bg-white dark:bg-[#181C1F] border-l border-gray-200 dark:border-[#22272B] flex flex-col">
            {/* Sidebar tabs */}
            <div className="flex items-center border-b border-gray-200 dark:border-[#22272B]">
              {(['participants', 'chat', 'breakout'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSidebarTab(tab)}
                  className={`flex-1 py-2.5 text-xs font-medium transition-colors capitalize ${
                    sidebarTab === tab ? 'text-gray-900 dark:text-white border-b-2 border-[#E40000]' : 'text-gray-400 dark:text-white/40 hover:text-gray-500 dark:hover:text-white/60'
                  }`}
                >
                  {tab}
                </button>
              ))}
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 text-gray-400 dark:text-white/30 hover:text-gray-500 dark:hover:text-white/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sidebar content */}
            <div className="flex-1 overflow-y-auto">
              {sidebarTab === 'participants' && (
                <div className="p-3 space-y-1">
                  {MOCK_PARTICIPANTS.map((p) => (
                    <div key={p.id} className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#22272B] transition-colors">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${p.role === 'host' ? 'bg-[#E40000]/20 text-[#E40000]' : 'bg-gray-100 dark:bg-[#22272B] text-gray-500 dark:text-white/50'}`}>
                        {p.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-900 dark:text-white truncate">{p.name}</p>
                        <p className="text-[10px] text-gray-400 dark:text-white/30 capitalize">{p.role.replace('-', ' ')}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {p.is_muted && <MicOff className="w-3 h-3 text-red-400" />}
                        {!p.camera_on && <CameraOff className="w-3 h-3 text-red-400" />}
                        {p.hand_raised && <span className="text-yellow-400 text-xs">&#9995;</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {sidebarTab === 'chat' && (
                <div className="flex flex-col h-full">
                  <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                    {chatMessages.map((msg) => (
                      <div key={msg.id}>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-medium text-gray-600 dark:text-white/70">{msg.sender}</span>
                          <span className="text-[9px] text-gray-400 dark:text-gray-300 dark:text-white/20">{msg.timestamp}</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-white/50 pl-0">{msg.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {sidebarTab === 'breakout' && (
                <div className="p-4 text-center">
                  <LayoutGrid className="w-8 h-8 text-white/10 mx-auto mb-3" />
                  <p className="text-xs text-gray-400 dark:text-white/40 mb-3">No breakout rooms active</p>
                  <button className="px-3 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg text-xs text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-[#444] transition-colors">
                    Create Breakout Rooms
                  </button>
                </div>
              )}
            </div>

            {/* Chat input */}
            {sidebarTab === 'chat' && (
              <div className="p-3 border-t border-gray-200 dark:border-[#22272B]">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg text-gray-900 dark:text-white text-xs focus:outline-none focus:border-[#E40000]/50 placeholder-white/30"
                  />
                  <button
                    onClick={handleSendChat}
                    className="p-2 bg-[#E40000] hover:bg-[#C80000] rounded-lg text-gray-900 dark:text-white transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      <div className="flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-[#181C1F] border-t border-gray-200 dark:border-[#22272B]">
        <button
          onClick={() => setMicOn(!micOn)}
          className={`p-3 rounded-xl transition-colors ${micOn ? 'bg-gray-100 dark:bg-[#22272B] text-gray-900 dark:text-white hover:bg-[#2A2F33]' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'}`}
        >
          {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>
        <button
          onClick={() => setCameraOn(!cameraOn)}
          className={`p-3 rounded-xl transition-colors ${cameraOn ? 'bg-gray-100 dark:bg-[#22272B] text-gray-900 dark:text-white hover:bg-[#2A2F33]' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'}`}
        >
          {cameraOn ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
        </button>
        <button
          onClick={() => setScreenSharing(!screenSharing)}
          className={`p-3 rounded-xl transition-colors ${screenSharing ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-100 dark:bg-[#22272B] text-gray-900 dark:text-white hover:bg-[#2A2F33]'}`}
        >
          <Monitor className="w-5 h-5" />
        </button>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`p-3 rounded-xl transition-colors ${sidebarOpen ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-100 dark:bg-[#22272B] text-gray-900 dark:text-white hover:bg-[#2A2F33]'}`}
        >
          <MessageSquare className="w-5 h-5" />
        </button>
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-3 rounded-xl bg-gray-100 dark:bg-[#22272B] text-gray-900 dark:text-white hover:bg-[#2A2F33] transition-colors"
        >
          <LayoutGrid className="w-5 h-5" />
        </button>
        <div className="w-px h-8 bg-gray-100 dark:bg-[#22272B] mx-2" />
        <button className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-gray-900 dark:text-white text-sm font-medium transition-colors">
          <LogOut className="w-4 h-4" />
          Leave
        </button>
      </div>
    </div>
  );
};

export default LiveClassPage;
