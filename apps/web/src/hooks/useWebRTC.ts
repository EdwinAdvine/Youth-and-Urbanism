import { useCallback, useEffect, useRef, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const WS_URL = API_URL.replace(/^http/, 'ws');

interface Participant {
  userId: string;
  name: string;
  role: string;
  stream: MediaStream | null;
  video: boolean;
  audio: boolean;
  screenSharing: boolean;
}

interface ChatMessage {
  fromPeer: string;
  fromName: string;
  content: string;
  timestamp: string;
}

interface UseWebRTCOptions {
  roomId: string;
  /** @deprecated Token is no longer needed — httpOnly cookie used for auth */
  token?: string;
  autoConnect?: boolean;
}

interface UseWebRTCReturn {
  localStream: MediaStream | null;
  participants: Map<string, Participant>;
  chatMessages: ChatMessage[];
  isConnected: boolean;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing: boolean;
  myUserId: string;
  connect: () => Promise<void>;
  disconnect: () => void;
  toggleVideo: () => void;
  toggleAudio: () => void;
  startScreenShare: () => Promise<void>;
  stopScreenShare: () => void;
  sendChat: (content: string) => void;
}

export function useWebRTC({
  roomId,
  autoConnect = false,
}: UseWebRTCOptions): UseWebRTCReturn {
  const wsRef = useRef<WebSocket | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [participants, setParticipants] = useState<Map<string, Participant>>(new Map());
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [myUserId, setMyUserId] = useState('');
  const [, setIceServers] = useState<RTCIceServer[]>([]);
  const iceServersRef = useRef<RTCIceServer[]>([]);
  const stopScreenShareRef = useRef<() => void>(() => {});

  // Fetch ICE config (uses httpOnly cookie auth)
  const fetchIceConfig = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/instructor/sessions/${roomId}/ice-config`, {
        credentials: 'include',
      });
      const data = await res.json();
      const servers = data.ice_servers?.map((s: { urls: string | string[]; username?: string; credential?: string }) => ({
          urls: s.urls,
          username: s.username,
          credential: s.credential,
        })) || [];
      iceServersRef.current = servers;
      setIceServers(servers);
    } catch {
      // Fallback to public STUN
      const fallback = [{ urls: 'stun:stun.l.google.com:19302' }];
      iceServersRef.current = fallback;
      setIceServers(fallback);
    }
  }, [roomId]);

  // Create peer connection for a remote peer
  const createPeerConnection = useCallback(
    (peerId: string): RTCPeerConnection => {
      const pc = new RTCPeerConnection({ iceServers: iceServersRef.current });

      // Add local tracks to the connection
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current!);
        });
      }

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              type: 'ice_candidate',
              target: peerId,
              candidate: event.candidate.toJSON(),
            })
          );
        }
      };

      // Handle remote stream
      pc.ontrack = (event) => {
        const [remoteStream] = event.streams;
        setParticipants((prev) => {
          const updated = new Map(prev);
          const existing = updated.get(peerId);
          if (existing) {
            updated.set(peerId, { ...existing, stream: remoteStream });
          }
          return updated;
        });
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
          // Peer disconnected, clean up
          peerConnectionsRef.current.delete(peerId);
          setParticipants((prev) => {
            const updated = new Map(prev);
            updated.delete(peerId);
            return updated;
          });
        }
      };

      peerConnectionsRef.current.set(peerId, pc);
      return pc;
    },
    []
  );

  // Handle signaling messages
  const handleSignalingMessage = useCallback(
    async (message: Record<string, unknown>) => {
      const type = message.type as string;

      if (type === 'room_state') {
        setMyUserId(message.your_id as string);
        const participantList = message.participants as Array<{
          user_id: string;
          name: string;
          role: string;
        }>;
        const newMap = new Map<string, Participant>();
        participantList.forEach((p) => {
          if (p.user_id !== (message.your_id as string)) {
            newMap.set(p.user_id, {
              userId: p.user_id,
              name: p.name,
              role: p.role,
              stream: null,
              video: true,
              audio: true,
              screenSharing: false,
            });
          }
        });
        setParticipants(newMap);

        // Initiate offer to all existing peers
        for (const peerId of newMap.keys()) {
          const pc = createPeerConnection(peerId);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          wsRef.current?.send(
            JSON.stringify({
              type: 'offer',
              target: peerId,
              sdp: offer.sdp,
            })
          );
        }
      }

      if (type === 'peer_joined') {
        const peerInfo = message.peer_info as { user_id: string; name: string; role: string };
        setParticipants((prev) => {
          const updated = new Map(prev);
          updated.set(peerInfo.user_id, {
            userId: peerInfo.user_id,
            name: peerInfo.name,
            role: peerInfo.role,
            stream: null,
            video: true,
            audio: true,
            screenSharing: false,
          });
          return updated;
        });
        // The new peer will send us an offer
      }

      if (type === 'peer_left') {
        const peerId = message.peer_id as string;
        const pc = peerConnectionsRef.current.get(peerId);
        if (pc) {
          pc.close();
          peerConnectionsRef.current.delete(peerId);
        }
        setParticipants((prev) => {
          const updated = new Map(prev);
          updated.delete(peerId);
          return updated;
        });
      }

      if (type === 'offer') {
        const fromPeer = message.from_peer as string;
        let pc = peerConnectionsRef.current.get(fromPeer);
        if (!pc) pc = createPeerConnection(fromPeer);

        await pc.setRemoteDescription(
          new RTCSessionDescription({ type: 'offer', sdp: message.sdp as string })
        );
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        wsRef.current?.send(
          JSON.stringify({
            type: 'answer',
            target: fromPeer,
            sdp: answer.sdp,
          })
        );
      }

      if (type === 'answer') {
        const fromPeer = message.from_peer as string;
        const pc = peerConnectionsRef.current.get(fromPeer);
        if (pc) {
          await pc.setRemoteDescription(
            new RTCSessionDescription({ type: 'answer', sdp: message.sdp as string })
          );
        }
      }

      if (type === 'ice_candidate') {
        const fromPeer = message.from_peer as string;
        const pc = peerConnectionsRef.current.get(fromPeer);
        if (pc && message.candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(message.candidate as RTCIceCandidateInit));
        }
      }

      if (type === 'media_state') {
        const peerId = message.peer_id as string;
        setParticipants((prev) => {
          const updated = new Map(prev);
          const existing = updated.get(peerId);
          if (existing) {
            updated.set(peerId, {
              ...existing,
              video: message.video as boolean,
              audio: message.audio as boolean,
              screenSharing: message.screen_sharing as boolean,
            });
          }
          return updated;
        });
      }

      if (type === 'chat') {
        setChatMessages((prev) => [
          ...prev,
          {
            fromPeer: message.from_peer as string,
            fromName: message.from_name as string,
            content: message.content as string,
            timestamp: message.timestamp as string,
          },
        ]);
      }
    },
    [createPeerConnection]
  );

  // Connect
  const connect = useCallback(async () => {
    await fetchIceConfig();

    // Get local media
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      setLocalStream(stream);
    } catch {
      // Camera/mic not available, continue without media
      localStreamRef.current = null;
      setLocalStream(null);
    }

    // Connect to signaling server (httpOnly cookie sent automatically)
    const ws = new WebSocket(`${WS_URL}/ws/webrtc/${roomId}`);
    wsRef.current = ws;

    ws.onopen = () => setIsConnected(true);

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handleSignalingMessage(message);
      } catch {
        // Ignore invalid messages
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    ws.onerror = () => {
      setIsConnected(false);
    };
  }, [roomId, fetchIceConfig, handleSignalingMessage]);

  // Disconnect
  const disconnect = useCallback(() => {
    // Close all peer connections
    peerConnectionsRef.current.forEach((pc) => pc.close());
    peerConnectionsRef.current.clear();

    // Stop local stream
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    setLocalStream(null);

    // Stop screen share
    screenStreamRef.current?.getTracks().forEach((track) => track.stop());
    screenStreamRef.current = null;

    // Close WebSocket
    wsRef.current?.close();
    wsRef.current = null;

    setIsConnected(false);
    setParticipants(new Map());
  }, []);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);

        wsRef.current?.send(
          JSON.stringify({
            type: 'media_state',
            video: videoTrack.enabled,
            audio: isAudioEnabled,
            screen_sharing: isScreenSharing,
          })
        );
      }
    }
  }, [isAudioEnabled, isScreenSharing]);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);

        wsRef.current?.send(
          JSON.stringify({
            type: 'media_state',
            video: isVideoEnabled,
            audio: audioTrack.enabled,
            screen_sharing: isScreenSharing,
          })
        );
      }
    }
  }, [isVideoEnabled, isScreenSharing]);

  // Start screen share
  const startScreenShare = useCallback(async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      screenStreamRef.current = screenStream;
      setIsScreenSharing(true);

      // Replace video track in all peer connections
      const screenTrack = screenStream.getVideoTracks()[0];
      peerConnectionsRef.current.forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
        if (sender) sender.replaceTrack(screenTrack);
      });

      // Handle screen share stop from browser UI — use ref to avoid stale closure
      screenTrack.onended = () => {
        stopScreenShareRef.current();
      };

      wsRef.current?.send(
        JSON.stringify({
          type: 'media_state',
          video: isVideoEnabled,
          audio: isAudioEnabled,
          screen_sharing: true,
        })
      );
    } catch {
      // User cancelled screen share
    }
  }, [isVideoEnabled, isAudioEnabled]);

  // Stop screen share — also stored in ref so onended always calls latest version
  const stopScreenShare = useCallback(() => {
    screenStreamRef.current?.getTracks().forEach((track) => track.stop());
    screenStreamRef.current = null;
    setIsScreenSharing(false);

    // Restore camera video track
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        peerConnectionsRef.current.forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
          if (sender) sender.replaceTrack(videoTrack);
        });
      }
    }

    wsRef.current?.send(
      JSON.stringify({
        type: 'media_state',
        video: isVideoEnabled,
        audio: isAudioEnabled,
        screen_sharing: false,
      })
    );
  }, [isVideoEnabled, isAudioEnabled]);

  // Keep ref in sync so onended always calls the latest stopScreenShare
  stopScreenShareRef.current = stopScreenShare;

  // Send chat message
  const sendChat = useCallback(
    (content: string) => {
      wsRef.current?.send(
        JSON.stringify({
          type: 'chat',
          content,
          from_name: 'Me',
        })
      );
    },
    []
  );

  // Auto-connect
  useEffect(() => {
    if (autoConnect && roomId) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [autoConnect, roomId, connect, disconnect]);

  return {
    localStream,
    participants,
    chatMessages,
    isConnected,
    isVideoEnabled,
    isAudioEnabled,
    isScreenSharing,
    myUserId,
    connect,
    disconnect,
    toggleVideo,
    toggleAudio,
    startScreenShare,
    stopScreenShare,
    sendChat,
  };
}
