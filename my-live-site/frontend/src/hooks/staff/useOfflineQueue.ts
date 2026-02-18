/**
 * Offline Queue Hook
 *
 * Provides PWA-friendly offline support using IndexedDB. Queues HTTP
 * mutations (POST, PUT, PATCH, DELETE) when offline and automatically
 * syncs them in order when connectivity is restored. Uses the raw
 * IndexedDB API to avoid external dependencies.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface QueuedAction {
  /** Unique identifier for the queued action */
  id: string;
  /** HTTP method */
  type: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** API endpoint URL */
  url: string;
  /** Request body (if applicable) */
  body?: unknown;
  /** Timestamp when the action was queued */
  timestamp: number;
  /** Number of sync retry attempts */
  retries: number;
}

interface UseOfflineQueueResult {
  /** Whether the browser is currently online */
  isOnline: boolean;
  /** Number of actions waiting in the queue */
  queuedCount: number;
  /** Whether the queue is currently being synced */
  isSyncing: boolean;
  /** Queue a new action for later execution */
  queueAction: (action: Omit<QueuedAction, 'id' | 'timestamp' | 'retries'>) => Promise<void>;
  /** Manually trigger queue synchronization */
  syncQueue: () => Promise<void>;
  /** Clear all queued actions */
  clearQueue: () => Promise<void>;
  /** Get all currently queued actions */
  getQueue: () => Promise<QueuedAction[]>;
}

const DB_NAME = 'staff_offline_queue';
const DB_VERSION = 1;
const STORE_NAME = 'actions';
const MAX_RETRIES = 3;

/**
 * Open (or create) the IndexedDB database.
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Get all queued actions from IndexedDB, ordered by timestamp.
 */
async function getAllActions(): Promise<QueuedAction[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('timestamp');
      const request = index.getAll();

      request.onsuccess = () => {
        resolve(request.result as QueuedAction[]);
      };
      request.onerror = () => {
        reject(request.error);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch {
    return [];
  }
}

/**
 * Add an action to the IndexedDB queue.
 */
async function addAction(action: QueuedAction): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(action);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Remove an action from the IndexedDB queue by ID.
 */
async function removeAction(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Update an action's retry count in IndexedDB.
 */
async function updateAction(action: QueuedAction): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(action);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Clear all actions from the IndexedDB queue.
 */
async function clearAllActions(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Get the JWT token from localStorage.
 */
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

export function useOfflineQueue(): UseOfflineQueueResult {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [queuedCount, setQueuedCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const mountedRef = useRef(true);
  const syncingRef = useRef(false);

  /**
   * Refresh the queued count from IndexedDB.
   */
  const refreshCount = useCallback(async () => {
    try {
      const actions = await getAllActions();
      if (mountedRef.current) {
        setQueuedCount(actions.length);
      }
    } catch {
      // IndexedDB may not be available; leave count unchanged
    }
  }, []);

  /**
   * Queue a new action for later execution.
   */
  const queueAction = useCallback(
    async (action: Omit<QueuedAction, 'id' | 'timestamp' | 'retries'>) => {
      const queued: QueuedAction = {
        ...action,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        retries: 0,
      };

      try {
        await addAction(queued);
        await refreshCount();
      } catch (err) {
        console.error('Failed to queue offline action:', err);
      }
    },
    [refreshCount]
  );

  /**
   * Execute a single queued action against the API.
   */
  const executeAction = useCallback(async (action: QueuedAction): Promise<boolean> => {
    const token = getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const fetchOptions: RequestInit = {
        method: action.type,
        headers,
      };

      if (action.body && action.type !== 'DELETE') {
        fetchOptions.body = JSON.stringify(action.body);
      }

      const response = await fetch(action.url, fetchOptions);

      // Consider 2xx and 409 (conflict/already processed) as success
      return response.ok || response.status === 409;
    } catch {
      return false;
    }
  }, []);

  /**
   * Sync all queued actions in order. Failed actions are retried
   * up to MAX_RETRIES times before being discarded.
   */
  const syncQueue = useCallback(async () => {
    if (syncingRef.current || !navigator.onLine) return;

    syncingRef.current = true;
    if (mountedRef.current) {
      setIsSyncing(true);
    }

    try {
      const actions = await getAllActions();

      for (const action of actions) {
        // Stop syncing if we went offline during the sync
        if (!navigator.onLine) break;

        const success = await executeAction(action);

        if (success) {
          await removeAction(action.id);
        } else {
          if (action.retries >= MAX_RETRIES) {
            console.warn(
              `Offline action ${action.id} failed after ${MAX_RETRIES} retries, discarding.`
            );
            await removeAction(action.id);
          } else {
            await updateAction({ ...action, retries: action.retries + 1 });
          }
        }
      }
    } catch (err) {
      console.error('Failed to sync offline queue:', err);
    } finally {
      syncingRef.current = false;
      if (mountedRef.current) {
        setIsSyncing(false);
      }
      await refreshCount();
    }
  }, [executeAction, refreshCount]);

  /**
   * Clear all queued actions.
   */
  const clearQueue = useCallback(async () => {
    try {
      await clearAllActions();
      if (mountedRef.current) {
        setQueuedCount(0);
      }
    } catch (err) {
      console.error('Failed to clear offline queue:', err);
    }
  }, []);

  /**
   * Get all currently queued actions.
   */
  const getQueue = useCallback(async (): Promise<QueuedAction[]> => {
    try {
      return await getAllActions();
    } catch {
      return [];
    }
  }, []);

  // Listen to online/offline events
  useEffect(() => {
    mountedRef.current = true;

    const handleOnline = () => {
      if (mountedRef.current) {
        setIsOnline(true);
      }
      // Auto-sync when coming back online
      syncQueue();
    };

    const handleOffline = () => {
      if (mountedRef.current) {
        setIsOnline(false);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load initial queue count
    refreshCount();

    return () => {
      mountedRef.current = false;
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    isOnline,
    queuedCount,
    isSyncing,
    queueAction,
    syncQueue,
    clearQueue,
    getQueue,
  };
}

export type { QueuedAction, UseOfflineQueueResult };
export default useOfflineQueue;
