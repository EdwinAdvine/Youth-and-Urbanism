import React, { useState } from 'react';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { Mic, MicOff, Volume2, VolumeX, Settings, MessageSquare, Sparkles, Bot } from 'lucide-react';

const conversationHistory = [
  { id: '1', role: 'ai' as const, text: 'Hello! I\'m your AI tutor. You can speak to me and I\'ll respond with voice. What would you like to learn today?', timestamp: '2:30 PM' },
  { id: '2', role: 'user' as const, text: 'Can you explain how photosynthesis works?', timestamp: '2:31 PM' },
  { id: '3', role: 'ai' as const, text: 'Photosynthesis is the process by which plants make their own food using sunlight, water, and carbon dioxide. Think of it like a recipe: the plant takes in sunlight through its leaves, water through its roots, and carbon dioxide from the air. It then combines these ingredients to make glucose (sugar) for energy and releases oxygen as a byproduct.', timestamp: '2:31 PM' },
];

const VoiceModePage: React.FC = () => {
  const { borderRadius } = useAgeAdaptiveUI();
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [voiceSpeed, setVoiceSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [showSettings, setShowSettings] = useState(false);

  const voicePersonalities = [
    { id: 'friendly', name: 'Friendly Teacher', active: true },
    { id: 'encouraging', name: 'Encouraging Coach', active: false },
    { id: 'calm', name: 'Calm Guide', active: false },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <Mic className="w-8 h-8 text-purple-400" /> Voice Mode
          </h1>
          <p className="text-gray-600 dark:text-white/70">Talk to your AI tutor with voice</p>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`p-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 ${borderRadius}`}
        >
          <Settings className="w-5 h-5 text-gray-500 dark:text-white/60" />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
          <h3 className="text-gray-900 dark:text-white font-medium mb-3">Voice Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="text-gray-500 dark:text-white/60 text-sm mb-2 block">Voice Speed</label>
              <div className="flex gap-2">
                {(['slow', 'normal', 'fast'] as const).map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setVoiceSpeed(speed)}
                    className={`px-3 py-1.5 ${borderRadius} text-sm capitalize ${
                      voiceSpeed === speed ? 'bg-purple-500 text-gray-900 dark:text-white' : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/60'
                    }`}
                  >
                    {speed}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-gray-500 dark:text-white/60 text-sm mb-2 block">Voice Personality</label>
              <div className="space-y-2">
                {voicePersonalities.map((voice) => (
                  <button
                    key={voice.id}
                    className={`w-full p-3 text-left ${borderRadius} flex items-center justify-between ${
                      voice.active ? 'bg-purple-500/20 border border-purple-500/30' : 'bg-gray-50 dark:bg-white/5'
                    }`}
                  >
                    <span className={voice.active ? 'text-purple-300' : 'text-gray-500 dark:text-white/60'}>{voice.name}</span>
                    {voice.active && <span className="text-purple-400 text-xs">Active</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Voice Visualizer */}
      <div className={`p-8 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] text-center`}>
        <div className="relative inline-block mb-6">
          <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${
            isRecording
              ? 'bg-red-500/20 ring-4 ring-red-500/30 animate-pulse'
              : 'bg-purple-500/20 ring-2 ring-purple-500/20'
          }`}>
            <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
              isRecording ? 'bg-red-500/30' : 'bg-purple-500/30'
            }`}>
              {isRecording ? (
                <MicOff className="w-10 h-10 text-red-400" />
              ) : (
                <Mic className="w-10 h-10 text-purple-400" />
              )}
            </div>
          </div>
        </div>

        {/* Waveform Bars */}
        <div className="flex items-center justify-center gap-1 h-12 mb-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className={`w-1.5 ${borderRadius} transition-all ${
                isRecording ? 'bg-red-400' : 'bg-purple-500/30'
              }`}
              style={{
                height: isRecording ? `${Math.random() * 40 + 8}px` : '8px',
                transition: 'height 0.1s',
              }}
            />
          ))}
        </div>

        <button
          onClick={() => setIsRecording(!isRecording)}
          className={`px-8 py-3 ${borderRadius} font-bold text-lg ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600 text-gray-900 dark:text-white'
              : 'bg-purple-500 hover:bg-purple-600 text-gray-900 dark:text-white'
          }`}
        >
          {isRecording ? 'Stop Recording' : 'Start Speaking'}
        </button>

        <p className="text-gray-400 dark:text-white/40 text-sm mt-3">
          {isRecording ? 'Listening... speak clearly' : 'Tap to start talking to your AI tutor'}
        </p>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`p-3 ${borderRadius} ${isMuted ? 'bg-red-500/20 text-red-400' : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/60'}`}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
        <button className={`p-3 bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/60 ${borderRadius}`}>
          <MessageSquare className="w-5 h-5" />
        </button>
      </div>

      {/* Conversation History */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Conversation</h2>
        <div className="space-y-3">
          {conversationHistory.map((msg) => (
            <div
              key={msg.id}
              className={`p-4 ${borderRadius} ${
                msg.role === 'ai'
                  ? 'bg-purple-500/10 border border-purple-500/20'
                  : 'bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B]'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {msg.role === 'ai' ? (
                  <Bot className="w-4 h-4 text-purple-400" />
                ) : (
                  <Sparkles className="w-4 h-4 text-blue-400" />
                )}
                <span className="text-gray-400 dark:text-white/40 text-xs">{msg.role === 'ai' ? 'AI Tutor' : 'You'} · {msg.timestamp}</span>
              </div>
              <p className="text-gray-700 dark:text-white/80 text-sm">{msg.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VoiceModePage;
