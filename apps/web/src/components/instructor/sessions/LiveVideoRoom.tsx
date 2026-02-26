import React, { useEffect, useRef, useState } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  MonitorOff,
  MessageSquare,
  Users,
  PhoneOff,
  Send,
} from 'lucide-react';
import { useWebRTC } from '../../../hooks/useWebRTC';

interface LiveVideoRoomProps {
  roomId: string;
  token: string;
  sessionTitle?: string;
  onLeave?: () => void;
}

export const LiveVideoRoom: React.FC<LiveVideoRoomProps> = ({
  roomId,
  token,
  sessionTitle = 'Live Session',
  onLeave,
}) => {
  const {
    localStream,
    participants,
    chatMessages,
    isConnected,
    isVideoEnabled,
    isAudioEnabled,
    isScreenSharing,
    connect,
    disconnect,
    toggleVideo,
    toggleAudio,
    startScreenShare,
    stopScreenShare,
    sendChat,
  } = useWebRTC({ roomId, token });

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [sidebarTab, setSidebarTab] = useState<'chat' | 'participants'>('participants');
  const [chatInput, setChatInput] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Attach local stream to video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendChat = () => {
    if (chatInput.trim()) {
      sendChat(chatInput.trim());
      setChatInput('');
    }
  };

  const handleLeave = () => {
    disconnect();
    onLeave?.();
  };

  const participantArray = Array.from(participants.values());
  const totalParticipants = participantArray.length + 1; // +1 for self

  // Determine grid layout based on participant count
  const getGridClass = () => {
    if (totalParticipants <= 1) return 'grid-cols-1';
    if (totalParticipants <= 2) return 'grid-cols-2';
    if (totalParticipants <= 4) return 'grid-cols-2 grid-rows-2';
    return 'grid-cols-3 grid-rows-2';
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{sessionTitle}</h2>
          <p className="text-gray-500 dark:text-white/60">Ready to join the live session?</p>
        </div>
        <button
          onClick={connect}
          className="px-8 py-3 bg-purple-500 hover:bg-purple-600 text-gray-900 dark:text-white rounded-xl text-lg font-semibold transition-colors"
        >
          Join Session
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-120px)] gap-4">
      {/* Video grid */}
      <div className="flex-1 flex flex-col">
        <div className={`flex-1 grid ${getGridClass()} gap-2 p-2`}>
          {/* Local video */}
          <div className="relative bg-black rounded-xl overflow-hidden">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            {!isVideoEnabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl text-gray-900 dark:text-white font-bold">You</span>
                </div>
              </div>
            )}
            <div className="absolute bottom-2 left-2 flex items-center gap-1">
              <span className="px-2 py-0.5 bg-black/60 rounded text-xs text-gray-900 dark:text-white">
                You {isScreenSharing ? '(Screen)' : ''}
              </span>
              {!isAudioEnabled && <MicOff className="w-3 h-3 text-red-400" />}
            </div>
          </div>

          {/* Remote videos */}
          {participantArray.map((p) => (
            <RemoteVideo key={p.userId} participant={p} />
          ))}
        </div>

        {/* Controls bar */}
        <div className="flex items-center justify-center gap-3 py-4">
          <button
            onClick={toggleAudio}
            className={`p-3 rounded-full transition-colors ${
              isAudioEnabled
                ? 'bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white'
                : 'bg-red-500 hover:bg-red-600 text-gray-900 dark:text-white'
            }`}
            title={isAudioEnabled ? 'Mute' : 'Unmute'}
          >
            {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full transition-colors ${
              isVideoEnabled
                ? 'bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white'
                : 'bg-red-500 hover:bg-red-600 text-gray-900 dark:text-white'
            }`}
            title={isVideoEnabled ? 'Stop Video' : 'Start Video'}
          >
            {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          <button
            onClick={isScreenSharing ? stopScreenShare : startScreenShare}
            className={`p-3 rounded-full transition-colors ${
              isScreenSharing
                ? 'bg-purple-500 hover:bg-purple-600 text-gray-900 dark:text-white'
                : 'bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white'
            }`}
            title={isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
          >
            {isScreenSharing ? (
              <MonitorOff className="w-5 h-5" />
            ) : (
              <Monitor className="w-5 h-5" />
            )}
          </button>

          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className={`p-3 rounded-full transition-colors ${
              showSidebar
                ? 'bg-purple-500/20 text-purple-400'
                : 'bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white'
            }`}
            title="Toggle Sidebar"
          >
            <MessageSquare className="w-5 h-5" />
          </button>

          <button
            onClick={handleLeave}
            className="p-3 bg-red-500 hover:bg-red-600 text-gray-900 dark:text-white rounded-full transition-colors"
            title="Leave Session"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Sidebar */}
      {showSidebar && (
        <div className="w-80 bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl flex flex-col">
          {/* Tab switcher */}
          <div className="flex border-b border-gray-200 dark:border-white/10">
            <button
              onClick={() => setSidebarTab('chat')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                sidebarTab === 'chat'
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4 inline mr-1" />
              Chat
            </button>
            <button
              onClick={() => setSidebarTab('participants')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                sidebarTab === 'participants'
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 inline mr-1" />
              ({totalParticipants})
            </button>
          </div>

          {sidebarTab === 'chat' ? (
            <>
              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {chatMessages.length === 0 && (
                  <p className="text-center text-gray-400 dark:text-gray-300 dark:text-white/40 text-sm mt-8">No messages yet</p>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i} className="text-sm">
                    <span className="font-medium text-purple-300">{msg.fromName}: </span>
                    <span className="text-gray-600 dark:text-white/80">{msg.content}</span>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              {/* Chat input */}
              <div className="p-3 border-t border-gray-200 dark:border-white/10">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-purple-500/50"
                  />
                  <button
                    onClick={handleSendChat}
                    className="p-2 bg-purple-500 hover:bg-purple-600 text-gray-900 dark:text-white rounded-lg transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Participants list */
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {/* Self */}
              <div className="flex items-center gap-3 p-2 bg-purple-500/10 rounded-lg">
                <div className="w-8 h-8 bg-purple-500/30 rounded-full flex items-center justify-center text-sm text-gray-900 dark:text-white font-bold">
                  Y
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">You</p>
                  <p className="text-xs text-gray-500 dark:text-white/60">Instructor</p>
                </div>
                <div className="flex gap-1">
                  {isAudioEnabled ? (
                    <Mic className="w-3 h-3 text-green-400" />
                  ) : (
                    <MicOff className="w-3 h-3 text-red-400" />
                  )}
                  {isVideoEnabled ? (
                    <Video className="w-3 h-3 text-green-400" />
                  ) : (
                    <VideoOff className="w-3 h-3 text-red-400" />
                  )}
                </div>
              </div>
              {/* Remote participants */}
              {participantArray.map((p) => (
                <div key={p.userId} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-white/5 rounded-lg">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-white/10 rounded-full flex items-center justify-center text-sm text-gray-900 dark:text-white font-bold">
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{p.name}</p>
                    <p className="text-xs text-gray-500 dark:text-white/60 capitalize">{p.role}</p>
                  </div>
                  <div className="flex gap-1">
                    {p.audio ? (
                      <Mic className="w-3 h-3 text-green-400" />
                    ) : (
                      <MicOff className="w-3 h-3 text-red-400" />
                    )}
                    {p.video ? (
                      <Video className="w-3 h-3 text-green-400" />
                    ) : (
                      <VideoOff className="w-3 h-3 text-red-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Component for rendering a remote participant's video stream.
 */
const RemoteVideo: React.FC<{ participant: { userId: string; name: string; stream: MediaStream | null; video: boolean; audio: boolean } }> = ({
  participant,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && participant.stream) {
      videoRef.current.srcObject = participant.stream;
    }
  }, [participant.stream]);

  return (
    <div className="relative bg-black rounded-xl overflow-hidden">
      {participant.stream && participant.video ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="w-16 h-16 bg-gray-100 dark:bg-white/10 rounded-full flex items-center justify-center">
            <span className="text-2xl text-gray-900 dark:text-white font-bold">
              {participant.name.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      )}
      <div className="absolute bottom-2 left-2 flex items-center gap-1">
        <span className="px-2 py-0.5 bg-black/60 rounded text-xs text-gray-900 dark:text-white">
          {participant.name}
        </span>
        {!participant.audio && <MicOff className="w-3 h-3 text-red-400" />}
      </div>
    </div>
  );
};
