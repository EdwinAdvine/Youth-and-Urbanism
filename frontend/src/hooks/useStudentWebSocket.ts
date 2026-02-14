/**
 * Student WebSocket Hook - Real-time notifications via Socket.IO
 */
import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useStudentStore } from '../store/studentStore';

const WS_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface WebSocketMessage {
  type: string;
  data: Record<string, unknown>;
}

export default function useStudentWebSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const store = useStudentStore();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const socket = io(`${WS_URL}/student`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Student WebSocket connected');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Student WebSocket disconnected');
    });

    // Handle notification events
    socket.on('notification', (data: WebSocketMessage) => {
      if (data.type === 'new_notification') {
        store.setUnreadNotifications((store.unreadNotifications || 0) + 1);
      }
    });

    // Handle assignment updates
    socket.on('assignment_update', (data: WebSocketMessage) => {
      if (data.type === 'new_assignment') {
        store.setPendingAssignments((store.pendingAssignments || 0) + 1);
      }
    });

    // Handle friend request
    socket.on('friend_request', (data: WebSocketMessage) => {
      if (data.type === 'new_request') {
        store.setFriendRequests((store.friendRequests || 0) + 1);
      }
    });

    // Handle achievement unlocked
    socket.on('achievement', (data: WebSocketMessage) => {
      if (data.type === 'badge_earned') {
        // Could trigger a toast notification
        console.log('Badge earned:', data.data);
      }
    });

    // Handle streak update
    socket.on('streak_update', (data: WebSocketMessage) => {
      if (data.data && typeof data.data.streak === 'number') {
        store.setCurrentStreak(data.data.streak as number);
      }
    });

    // Handle XP update
    socket.on('xp_update', (data: WebSocketMessage) => {
      if (data.data && typeof data.data.xp === 'number') {
        store.setXp(data.data.xp as number);
      }
      if (data.data && typeof data.data.level === 'number') {
        store.setLevel(data.data.level as number);
      }
    });

    socket.on('connect_error', (error) => {
      console.warn('Student WebSocket connection error:', error.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const emit = useCallback((event: string, data: unknown) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);

  return { isConnected, emit };
}
