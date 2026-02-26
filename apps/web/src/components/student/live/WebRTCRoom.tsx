import React from 'react';
import { useAgeAdaptiveUI } from '../../../hooks/useAgeAdaptiveUI';
import { Video, VideoOff, Mic, MicOff, Phone, Hand, MessageSquare } from 'lucide-react';

interface WebRTCRoomProps {
  sessionTitle: string;
  instructor: string;
  onLeave: () => void;
  onHandRaise?: () => void;
}

const WebRTCRoom: React.FC<WebRTCRoomProps> = ({ sessionTitle, instructor, onLeave, onHandRaise }) => {
  const { borderRadius } = useAgeAdaptiveUI();
  const [videoOn, setVideoOn] = React.useState(true);
  const [micOn, setMicOn] = React.useState(true);

  return (
    <div className="flex flex-col h-full">
      <div className={`flex-1 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] flex items-center justify-center mb-4`}>
        <div className="text-center">
          <div className={`w-32 h-32 mx-auto bg-gradient-to-br from-purple-500 to-blue-500 ${borderRadius} flex items-center justify-center mb-4`}>
            <Video className="w-12 h-12 text-gray-900 dark:text-white" />
          </div>
          <h3 className="text-gray-900 dark:text-white font-semibold">{sessionTitle}</h3>
          <p className="text-gray-400 dark:text-white/40 text-sm">{instructor}</p>
          <p className="text-gray-400 dark:text-white/30 text-xs mt-2">Video placeholder — WebRTC integration pending</p>
        </div>
      </div>
      <div className={`p-4 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] flex items-center justify-center gap-3`}>
        <button
          onClick={() => setMicOn(!micOn)}
          className={`p-3 ${borderRadius} ${micOn ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white' : 'bg-red-500/20 text-red-400'}`}
        >
          {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>
        <button
          onClick={() => setVideoOn(!videoOn)}
          className={`p-3 ${borderRadius} ${videoOn ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white' : 'bg-red-500/20 text-red-400'}`}
        >
          {videoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>
        {onHandRaise && (
          <button onClick={onHandRaise} className={`p-3 bg-yellow-500/20 text-yellow-400 ${borderRadius}`}>
            <Hand className="w-5 h-5" />
          </button>
        )}
        <button className={`p-3 bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white ${borderRadius}`}>
          <MessageSquare className="w-5 h-5" />
        </button>
        <button onClick={onLeave} className={`p-3 bg-red-500 text-gray-900 dark:text-white ${borderRadius}`}>
          <Phone className="w-5 h-5 rotate-[135deg]" />
        </button>
      </div>
    </div>
  );
};

export default WebRTCRoom;
