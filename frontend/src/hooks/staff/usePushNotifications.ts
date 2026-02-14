/**
 * Push Notifications Hook
 *
 * Manages browser Push API subscription for staff notifications.
 * Handles permission requests, VAPID key configuration, service worker
 * registration, and backend subscription management.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface UsePushNotificationsResult {
  /** Whether the Push API is supported in this browser */
  isSupported: boolean;
  /** Whether the user is currently subscribed to push notifications */
  isSubscribed: boolean;
  /** Whether a subscribe/unsubscribe operation is in progress */
  isLoading: boolean;
  /** Current notification permission state */
  permission: NotificationPermission;
  /** Subscribe to push notifications */
  subscribe: () => Promise<void>;
  /** Unsubscribe from push notifications */
  unsubscribe: () => Promise<void>;
  /** Error message if an operation failed */
  error: string | null;
}

/**
 * Convert a URL-safe base64 string to a Uint8Array for the VAPID key.
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
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

/**
 * Build authorization headers for API requests.
 */
function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export function usePushNotifications(): UsePushNotificationsResult {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [error, setError] = useState<string | null>(null);

  const mountedRef = useRef(true);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

  /**
   * Check the current push subscription state.
   */
  const checkSubscription = useCallback(async () => {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        setIsSupported(false);
        return;
      }

      setIsSupported(true);
      setPermission(Notification.permission);

      const registration = await navigator.serviceWorker.ready;
      registrationRef.current = registration;

      const subscription = await registration.pushManager.getSubscription();
      if (mountedRef.current) {
        setIsSubscribed(subscription !== null);
      }
    } catch (err) {
      console.error('Failed to check push subscription:', err);
      if (mountedRef.current) {
        setIsSupported(false);
      }
    }
  }, []);

  /**
   * Subscribe to push notifications.
   *
   * 1. Request notification permission
   * 2. Subscribe via the Push API with the VAPID key
   * 3. Send the subscription to the backend
   */
  const subscribe = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      // Check for VAPID key
      if (!vapidPublicKey) {
        throw new Error(
          'VAPID public key not configured. Set VITE_VAPID_PUBLIC_KEY in your .env file.'
        );
      }

      // Request permission
      const permissionResult = await Notification.requestPermission();
      if (mountedRef.current) {
        setPermission(permissionResult);
      }

      if (permissionResult !== 'granted') {
        throw new Error(
          'Notification permission denied. Please enable notifications in your browser settings.'
        );
      }

      // Get service worker registration
      const registration =
        registrationRef.current || (await navigator.serviceWorker.ready);
      registrationRef.current = registration;

      // Subscribe to push
      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      // Send subscription to backend
      const response = await fetch(
        `${apiUrl}/api/v1/staff/notifications/push/subscribe`,
        {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(subscription.toJSON()),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.detail || `Failed to register push subscription (${response.status})`
        );
      }

      if (mountedRef.current) {
        setIsSubscribed(true);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to subscribe to push notifications';
      console.error('Push subscription error:', message);
      if (mountedRef.current) {
        setError(message);
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [apiUrl, vapidPublicKey, isLoading]);

  /**
   * Unsubscribe from push notifications.
   *
   * 1. Unsubscribe from the Push API
   * 2. Notify the backend to remove the subscription
   */
  const unsubscribe = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const registration =
        registrationRef.current || (await navigator.serviceWorker.ready);
      registrationRef.current = registration;

      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Notify backend before unsubscribing locally
        try {
          await fetch(
            `${apiUrl}/api/v1/staff/notifications/push/unsubscribe`,
            {
              method: 'POST',
              headers: getHeaders(),
              body: JSON.stringify({ endpoint: subscription.endpoint }),
            }
          );
        } catch {
          // Continue with local unsubscribe even if backend call fails
          console.warn('Failed to notify backend about push unsubscribe');
        }

        await subscription.unsubscribe();
      }

      if (mountedRef.current) {
        setIsSubscribed(false);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to unsubscribe from push notifications';
      console.error('Push unsubscribe error:', message);
      if (mountedRef.current) {
        setError(message);
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [apiUrl, isLoading]);

  // Check initial state on mount
  useEffect(() => {
    mountedRef.current = true;
    checkSubscription();

    return () => {
      mountedRef.current = false;
    };
  }, [checkSubscription]);

  return {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    subscribe,
    unsubscribe,
    error,
  };
}

export type { UsePushNotificationsResult };
export default usePushNotifications;
