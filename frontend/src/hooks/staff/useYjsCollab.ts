/**
 * Yjs Document Collaboration Hook
 *
 * Manages a Yjs document with WebSocket provider for real-time collaborative
 * editing in the Content Studio TipTap editor. Tracks active users, cursors,
 * and connection state. Gracefully handles missing yjs/y-websocket packages.
 */

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseYjsCollabOptions {
  /** Unique document identifier for the collaboration session */
  docId: string;
  /** Display name for the current user in the awareness protocol */
  userName: string;
  /** Cursor/selection color for the current user */
  userColor?: string;
}

interface CollabUser {
  id: string;
  name: string;
  color: string;
  cursor?: { anchor: number; head: number };
}

interface UseYjsCollabResult {
  /** Whether the WebSocket provider is connected */
  isConnected: boolean;
  /** Whether the initial document sync is complete */
  isSynced: boolean;
  /** List of currently active collaborators */
  activeUsers: CollabUser[];
  /** The Yjs document instance (Y.Doc) */
  ydoc: unknown;
  /** The WebSocket provider instance */
  provider: unknown;
  /** Error message if connection or library loading failed */
  error: string | null;
  /** Manually disconnect from the collaboration session */
  disconnect: () => void;
}

// Color palette for random user colors when none is provided
const USER_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#F97316', '#14B8A6', '#6366F1',
];

function getRandomColor(): string {
  return USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
}

function getToken(): string | null {
  try {
    const stored = localStorage.getItem('auth-store');
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return parsed?.state?.token || parsed?.token || null;
  } catch {
    return null;
  }
}

export function useYjsCollab(options: UseYjsCollabOptions): UseYjsCollabResult {
  const { docId, userName, userColor } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isSynced, setIsSynced] = useState(false);
  const [activeUsers, setActiveUsers] = useState<CollabUser[]>([]);
  const [ydoc, setYdoc] = useState<unknown>(null);
  const [provider, setProvider] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  const ydocRef = useRef<unknown>(null);
  const providerRef = useRef<unknown>(null);
  const mountedRef = useRef(true);
  const colorRef = useRef(userColor || getRandomColor());

  /**
   * Initialize Yjs document and WebSocket provider.
   */
  const initialize = useCallback(async () => {
    try {
      // Dynamically import yjs and y-websocket to handle missing packages
      let Y: { Doc: new () => unknown };
      let WebsocketProvider: new (
        url: string,
        roomname: string,
        doc: unknown,
        options?: Record<string, unknown>
      ) => unknown;

      try {
        const yjsModule = await import('yjs');
        Y = yjsModule as unknown as typeof Y;
      } catch {
        if (mountedRef.current) {
          setError('yjs package is not installed. Run: npm install yjs');
        }
        return;
      }

      try {
        const wsModule = await import('y-websocket');
        WebsocketProvider = (wsModule as unknown as { WebsocketProvider: typeof WebsocketProvider }).WebsocketProvider;
      } catch {
        if (mountedRef.current) {
          setError('y-websocket package is not installed. Run: npm install y-websocket');
        }
        return;
      }

      const token = getToken();
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const wsProtocol = apiUrl.startsWith('https') ? 'wss' : 'ws';
      const host = apiUrl.replace(/^https?:\/\//, '');
      const wsUrl = `${wsProtocol}://${host}/ws/yjs/${docId}${token ? `/${token}` : ''}`;

      const doc = new Y.Doc();
      const prov = new WebsocketProvider(wsUrl, docId, doc, {
        connect: true,
      });

      ydocRef.current = doc;
      providerRef.current = prov;

      // Type assertion helpers for the provider interface
      const typedProvider = prov as {
        on: (event: string, handler: (...args: unknown[]) => void) => void;
        off: (event: string, handler: (...args: unknown[]) => void) => void;
        awareness: {
          setLocalStateField: (field: string, value: unknown) => void;
          getStates: () => Map<number, Record<string, unknown>>;
          on: (event: string, handler: () => void) => void;
          off: (event: string, handler: () => void) => void;
        };
        wsconnected: boolean;
        synced: boolean;
        disconnect: () => void;
        destroy: () => void;
      };

      // Set local awareness state
      typedProvider.awareness.setLocalStateField('user', {
        name: userName,
        color: colorRef.current,
      });

      // Track connection status
      const onStatus = (event: { status: string }) => {
        if (!mountedRef.current) return;
        setIsConnected(event.status === 'connected');
      };
      typedProvider.on('status', onStatus as (...args: unknown[]) => void);

      // Track sync status
      const onSync = (synced: boolean) => {
        if (!mountedRef.current) return;
        setIsSynced(synced);
      };
      typedProvider.on('sync', onSync as (...args: unknown[]) => void);

      // Track active users via awareness
      const onAwarenessChange = () => {
        if (!mountedRef.current) return;

        const states = typedProvider.awareness.getStates();
        const users: CollabUser[] = [];

        states.forEach((state, clientId) => {
          const user = state.user as { name?: string; color?: string } | undefined;
          if (user?.name) {
            users.push({
              id: String(clientId),
              name: user.name,
              color: user.color || getRandomColor(),
              cursor: state.cursor as CollabUser['cursor'],
            });
          }
        });

        setActiveUsers(users);
      };
      typedProvider.awareness.on('change', onAwarenessChange);

      if (mountedRef.current) {
        setYdoc(doc);
        setProvider(prov);
        setIsConnected(typedProvider.wsconnected);
        setIsSynced(typedProvider.synced);
        setError(null);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to initialize Yjs collaboration';
      if (mountedRef.current) {
        setError(message);
      }
    }
  }, [docId, userName]);

  /**
   * Disconnect and clean up all Yjs resources.
   */
  const disconnect = useCallback(() => {
    const prov = providerRef.current as {
      disconnect?: () => void;
      destroy?: () => void;
    } | null;
    const doc = ydocRef.current as {
      destroy?: () => void;
    } | null;

    if (prov) {
      try {
        prov.disconnect?.();
        prov.destroy?.();
      } catch {
        // Ignore cleanup errors
      }
      providerRef.current = null;
    }

    if (doc) {
      try {
        doc.destroy?.();
      } catch {
        // Ignore cleanup errors
      }
      ydocRef.current = null;
    }

    if (mountedRef.current) {
      setIsConnected(false);
      setIsSynced(false);
      setActiveUsers([]);
      setYdoc(null);
      setProvider(null);
    }
  }, []);

  // Initialize on mount, cleanup on unmount or when docId/userName changes
  useEffect(() => {
    mountedRef.current = true;
    initialize();

    return () => {
      mountedRef.current = false;
      disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docId, userName]);

  return {
    isConnected,
    isSynced,
    activeUsers,
    ydoc,
    provider,
    error,
    disconnect,
  };
}

export type { UseYjsCollabOptions, CollabUser, UseYjsCollabResult };
export default useYjsCollab;
