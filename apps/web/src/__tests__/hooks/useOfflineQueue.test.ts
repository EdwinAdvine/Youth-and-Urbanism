import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOfflineQueue } from '../../hooks/staff/useOfflineQueue';

// We need to mock IndexedDB since jsdom does not provide one.
// We create an in-memory store to simulate the queue behaviour.
const mockStore: Map<string, unknown> = new Map();

function createMockIDBRequest<T>(result: T): IDBRequest<T> {
  const request = {
    result,
    error: null,
    onsuccess: null as ((ev: Event) => void) | null,
    onerror: null as ((ev: Event) => void) | null,
    readyState: 'done' as IDBRequestReadyState,
    source: null,
    transaction: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as unknown as IDBRequest<T>;

  // Fire onsuccess asynchronously
  setTimeout(() => {
    if (request.onsuccess) {
      request.onsuccess(new Event('success'));
    }
  }, 0);

  return request;
}

function createMockObjectStore() {
  return {
    add: vi.fn((value: unknown) => {
      const record = value as { id: string };
      mockStore.set(record.id, value);
      return createMockIDBRequest(undefined);
    }),
    put: vi.fn((value: unknown) => {
      const record = value as { id: string };
      mockStore.set(record.id, value);
      return createMockIDBRequest(undefined);
    }),
    delete: vi.fn((key: string) => {
      mockStore.delete(key);
      return createMockIDBRequest(undefined);
    }),
    clear: vi.fn(() => {
      mockStore.clear();
      return createMockIDBRequest(undefined);
    }),
    getAll: vi.fn(() => {
      return createMockIDBRequest(Array.from(mockStore.values()));
    }),
    index: vi.fn(() => ({
      getAll: vi.fn(() => {
        return createMockIDBRequest(Array.from(mockStore.values()));
      }),
    })),
    createIndex: vi.fn(),
  };
}

function createMockTransaction(store: ReturnType<typeof createMockObjectStore>) {
  const transaction = {
    objectStore: vi.fn(() => store),
    oncomplete: null as ((ev: Event) => void) | null,
    onerror: null as ((ev: Event) => void) | null,
    onabort: null as ((ev: Event) => void) | null,
    abort: vi.fn(),
    commit: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as unknown as IDBTransaction;

  setTimeout(() => {
    if (transaction.oncomplete) {
      transaction.oncomplete(new Event('complete'));
    }
  }, 0);

  return transaction;
}

const mockObjectStore = createMockObjectStore();
const mockDb = {
  objectStoreNames: { contains: vi.fn(() => false) },
  createObjectStore: vi.fn(() => mockObjectStore),
  transaction: vi.fn(() => createMockTransaction(mockObjectStore)),
  close: vi.fn(),
};

// Mock indexedDB.open
const mockIndexedDB = {
  open: vi.fn(() => {
    const request = {
      result: mockDb,
      error: null,
      onsuccess: null as ((ev: Event) => void) | null,
      onerror: null as ((ev: Event) => void) | null,
      onupgradeneeded: null as ((ev: Event) => void) | null,
    } as unknown as IDBOpenDBRequest;

    setTimeout(() => {
      if (request.onupgradeneeded) {
        request.onupgradeneeded(new Event('upgradeneeded') as unknown as IDBVersionChangeEvent);
      }
      if (request.onsuccess) {
        request.onsuccess(new Event('success'));
      }
    }, 0);

    return request;
  }),
};

// Apply the mock before all tests
Object.defineProperty(globalThis, 'indexedDB', {
  value: mockIndexedDB,
  writable: true,
});

// Mock crypto.randomUUID
let uuidCounter = 0;
Object.defineProperty(globalThis.crypto, 'randomUUID', {
  value: () => `mock-uuid-${++uuidCounter}`,
  writable: true,
});

describe('useOfflineQueue', () => {
  beforeEach(() => {
    mockStore.clear();
    uuidCounter = 0;
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── isOnline reflects navigator.onLine ─────────────────────────

  it('isOnline reflects navigator.onLine when true', () => {
    Object.defineProperty(navigator, 'onLine', { value: true, writable: true, configurable: true });
    const { result } = renderHook(() => useOfflineQueue());
    expect(result.current.isOnline).toBe(true);
  });

  it('responds to offline event', async () => {
    Object.defineProperty(navigator, 'onLine', { value: true, writable: true, configurable: true });
    const { result } = renderHook(() => useOfflineQueue());

    await act(async () => {
      Object.defineProperty(navigator, 'onLine', { value: false, writable: true, configurable: true });
      window.dispatchEvent(new Event('offline'));
    });

    expect(result.current.isOnline).toBe(false);
  });

  it('responds to online event', async () => {
    Object.defineProperty(navigator, 'onLine', { value: false, writable: true, configurable: true });
    const { result } = renderHook(() => useOfflineQueue());

    await act(async () => {
      Object.defineProperty(navigator, 'onLine', { value: true, writable: true, configurable: true });
      window.dispatchEvent(new Event('online'));
      // Let timers flush for IndexedDB mock callbacks
      vi.advanceTimersByTime(50);
    });

    expect(result.current.isOnline).toBe(true);
  });

  // ── queueAction adds to queue ──────────────────────────────────

  it('queueAction adds an action to the queue', async () => {
    Object.defineProperty(navigator, 'onLine', { value: false, writable: true, configurable: true });
    const { result } = renderHook(() => useOfflineQueue());

    await act(async () => {
      vi.advanceTimersByTime(10);
    });

    await act(async () => {
      await result.current.queueAction({
        type: 'POST',
        url: '/api/v1/tickets',
        body: { subject: 'Test ticket' },
      });
      vi.advanceTimersByTime(50);
    });

    // The mock store should now have one entry
    expect(mockStore.size).toBe(1);
  });

  // ── clearQueue empties queue ───────────────────────────────────

  it('clearQueue empties the queue', async () => {
    Object.defineProperty(navigator, 'onLine', { value: false, writable: true, configurable: true });
    const { result } = renderHook(() => useOfflineQueue());

    await act(async () => {
      vi.advanceTimersByTime(10);
    });

    // Add an item first
    await act(async () => {
      await result.current.queueAction({
        type: 'PUT',
        url: '/api/v1/tickets/1',
        body: { status: 'resolved' },
      });
      vi.advanceTimersByTime(50);
    });

    expect(mockStore.size).toBe(1);

    // Now clear
    await act(async () => {
      await result.current.clearQueue();
      vi.advanceTimersByTime(50);
    });

    expect(mockStore.size).toBe(0);
    expect(result.current.queuedCount).toBe(0);
  });

  // ── getQueue returns queued actions ────────────────────────────

  it('getQueue returns the currently queued actions', async () => {
    Object.defineProperty(navigator, 'onLine', { value: false, writable: true, configurable: true });
    const { result } = renderHook(() => useOfflineQueue());

    await act(async () => {
      vi.advanceTimersByTime(10);
    });

    await act(async () => {
      await result.current.queueAction({
        type: 'DELETE',
        url: '/api/v1/tickets/42',
      });
      vi.advanceTimersByTime(50);
    });

    let queue: unknown[] = [];
    await act(async () => {
      queue = await result.current.getQueue();
      vi.advanceTimersByTime(50);
    });

    expect(queue.length).toBe(1);
  });

  // ── isSyncing defaults to false ────────────────────────────────

  it('isSyncing defaults to false', () => {
    const { result } = renderHook(() => useOfflineQueue());
    expect(result.current.isSyncing).toBe(false);
  });
});
