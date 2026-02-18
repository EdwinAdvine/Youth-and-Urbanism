/**
 * LiveKit Room Connection Hook
 *
 * Manages a LiveKit video session connection for staff live sessions.
 * Handles audio, video, and screen share toggles, participant tracking,
 * and connection lifecycle. Gracefully falls back if livekit-client
 * is not installed.
 */

import { useState, useCallback, useEffect, useRef } from 'react';

// Simplified participant types (actual types come from livekit-client)
interface Participant {
  id: string;
  name: string;
  isSpeaking: boolean;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
}

interface LocalParticipant extends Participant {
  isLocal: true;
}

interface UseLiveKitOptions {
  /** LiveKit server URL (e.g. wss://your-livekit-server.com) */
  serverUrl?: string;
  /** JWT token for room authentication */
  token?: string;
  /** Whether to connect automatically when token is available */
  autoConnect?: boolean;
}

interface UseLiveKitResult {
  /** Whether connected to the LiveKit room */
  isConnected: boolean;
  /** Whether currently attempting to connect */
  isConnecting: boolean;
  /** Connection or runtime error message */
  error: string | null;
  /** List of remote participants */
  participants: Participant[];
  /** The local participant */
  localParticipant: LocalParticipant | null;
  /** Connect to a room with the given token */
  connect: (token: string) => Promise<void>;
  /** Disconnect from the room */
  disconnect: () => void;
  /** Toggle local audio track */
  toggleAudio: () => void;
  /** Toggle local video track */
  toggleVideo: () => void;
  /** Toggle screen share */
  toggleScreenShare: () => void;
  /** Whether local audio is enabled */
  isAudioEnabled: boolean;
  /** Whether local video is enabled */
  isVideoEnabled: boolean;
  /** Whether screen share is active */
  isScreenSharing: boolean;
}

// Placeholder for the LiveKit Room instance
type LiveKitRoom = {
  connect: (url: string, token: string) => Promise<void>;
  disconnect: () => void;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  off: (event: string, handler: (...args: unknown[]) => void) => void;
  localParticipant: {
    identity: string;
    name?: string;
    isSpeaking: boolean;
    isMicrophoneEnabled: boolean;
    isCameraEnabled: boolean;
    isScreenShareEnabled: boolean;
    setMicrophoneEnabled: (enabled: boolean) => Promise<void>;
    setCameraEnabled: (enabled: boolean) => Promise<void>;
    setScreenShareEnabled: (enabled: boolean) => Promise<void>;
  };
  participants: Map<string, {
    identity: string;
    name?: string;
    isSpeaking: boolean;
    isMicrophoneEnabled: boolean;
    isCameraEnabled: boolean;
  }>;
  state: string;
};

export function useLiveKit(options?: UseLiveKitOptions): UseLiveKitResult {
  const { serverUrl, token: initialToken, autoConnect = false } = options ?? {};

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [localParticipant, setLocalParticipant] = useState<LocalParticipant | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const roomRef = useRef<LiveKitRoom | null>(null);
  const mountedRef = useRef(true);
  const livekitAvailableRef = useRef<boolean | null>(null);

  /**
   * Attempt to dynamically import livekit-client and create a Room instance.
   */
  const createRoom = useCallback(async (): Promise<LiveKitRoom | null> => {
    try {
      // Dynamic import to avoid build errors when livekit-client is not installed
      const livekit = await import('livekit-client');
      livekitAvailableRef.current = true;
      const room = new livekit.Room() as unknown as LiveKitRoom;
      return room;
    } catch {
      livekitAvailableRef.current = false;
      return null;
    }
  }, []);

  /**
   * Sync remote participants from the room to state.
   */
  const syncParticipants = useCallback(() => {
    const room = roomRef.current;
    if (!room) return;

    const remotes: Participant[] = [];
    room.participants.forEach((p) => {
      remotes.push({
        id: p.identity,
        name: p.name || p.identity,
        isSpeaking: p.isSpeaking,
        isAudioEnabled: p.isMicrophoneEnabled,
        isVideoEnabled: p.isCameraEnabled,
      });
    });

    if (mountedRef.current) {
      setParticipants(remotes);
    }
  }, []);

  /**
   * Sync local participant state.
   */
  const syncLocal = useCallback(() => {
    const room = roomRef.current;
    if (!room) return;

    const lp = room.localParticipant;
    if (mountedRef.current) {
      setLocalParticipant({
        id: lp.identity,
        name: lp.name || lp.identity,
        isSpeaking: lp.isSpeaking,
        isAudioEnabled: lp.isMicrophoneEnabled,
        isVideoEnabled: lp.isCameraEnabled,
        isLocal: true,
      });
      setIsAudioEnabled(lp.isMicrophoneEnabled);
      setIsVideoEnabled(lp.isCameraEnabled);
      setIsScreenSharing(lp.isScreenShareEnabled);
    }
  }, []);

  /**
   * Connect to a LiveKit room.
   */
  const connect = useCallback(
    async (connectToken: string) => {
      if (isConnecting || isConnected) return;

      setIsConnecting(true);
      setError(null);

      try {
        const room = await createRoom();
        if (!room) {
          setError(
            'livekit-client is not installed. Run: npm install livekit-client'
          );
          setIsConnecting(false);
          return;
        }

        const url =
          serverUrl ||
          import.meta.env.VITE_LIVEKIT_URL ||
          'wss://localhost:7880';

        // Set up event handlers
        room.on('participantConnected', () => {
          syncParticipants();
        });
        room.on('participantDisconnected', () => {
          syncParticipants();
        });
        room.on('trackSubscribed', () => {
          syncParticipants();
          syncLocal();
        });
        room.on('trackUnsubscribed', () => {
          syncParticipants();
          syncLocal();
        });
        room.on('activeSpeakersChanged', () => {
          syncParticipants();
          syncLocal();
        });
        room.on('disconnected', () => {
          if (mountedRef.current) {
            setIsConnected(false);
            setParticipants([]);
            setLocalParticipant(null);
          }
        });

        await room.connect(url, connectToken);

        roomRef.current = room;

        if (mountedRef.current) {
          setIsConnected(true);
          syncParticipants();
          syncLocal();
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to connect to LiveKit room';
        if (mountedRef.current) {
          setError(message);
        }
      } finally {
        if (mountedRef.current) {
          setIsConnecting(false);
        }
      }
    },
    [isConnecting, isConnected, createRoom, serverUrl, syncParticipants, syncLocal]
  );

  /**
   * Disconnect from the LiveKit room.
   */
  const disconnect = useCallback(() => {
    if (roomRef.current) {
      try {
        roomRef.current.disconnect();
      } catch {
        // Ignore disconnect errors
      }
      roomRef.current = null;
    }

    if (mountedRef.current) {
      setIsConnected(false);
      setParticipants([]);
      setLocalParticipant(null);
      setIsAudioEnabled(true);
      setIsVideoEnabled(true);
      setIsScreenSharing(false);
    }
  }, []);

  /**
   * Toggle local audio.
   */
  const toggleAudio = useCallback(() => {
    const room = roomRef.current;
    if (!room) return;

    const newState = !room.localParticipant.isMicrophoneEnabled;
    room.localParticipant.setMicrophoneEnabled(newState).then(() => {
      if (mountedRef.current) {
        setIsAudioEnabled(newState);
        syncLocal();
      }
    }).catch((err: Error) => {
      console.error('Failed to toggle audio:', err);
    });
  }, [syncLocal]);

  /**
   * Toggle local video.
   */
  const toggleVideo = useCallback(() => {
    const room = roomRef.current;
    if (!room) return;

    const newState = !room.localParticipant.isCameraEnabled;
    room.localParticipant.setCameraEnabled(newState).then(() => {
      if (mountedRef.current) {
        setIsVideoEnabled(newState);
        syncLocal();
      }
    }).catch((err: Error) => {
      console.error('Failed to toggle video:', err);
    });
  }, [syncLocal]);

  /**
   * Toggle screen share.
   */
  const toggleScreenShare = useCallback(() => {
    const room = roomRef.current;
    if (!room) return;

    const newState = !room.localParticipant.isScreenShareEnabled;
    room.localParticipant.setScreenShareEnabled(newState).then(() => {
      if (mountedRef.current) {
        setIsScreenSharing(newState);
        syncLocal();
      }
    }).catch((err: Error) => {
      console.error('Failed to toggle screen share:', err);
    });
  }, [syncLocal]);

  // Auto-connect when token is provided and autoConnect is true
  useEffect(() => {
    if (autoConnect && initialToken) {
      connect(initialToken);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoConnect, initialToken]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      if (roomRef.current) {
        try {
          roomRef.current.disconnect();
        } catch {
          // Ignore cleanup errors
        }
        roomRef.current = null;
      }
    };
  }, []);

  return {
    isConnected,
    isConnecting,
    error,
    participants,
    localParticipant,
    connect,
    disconnect,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
  };
}

export type { Participant, LocalParticipant, UseLiveKitOptions, UseLiveKitResult };
export default useLiveKit;
