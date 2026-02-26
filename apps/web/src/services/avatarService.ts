/**
 * Avatar API service — REST + WebSocket helpers for 3D avatars.
 */

import api from './api';
import type {
  AvatarCreatePayload,
  AvatarPreset,
  AvatarStreamMessage,
  GestureAnnotation,
  UserAvatar,
} from '../types/avatar';

const BASE = '/avatar';

const avatarService = {
  /* ── REST endpoints ─────────────────────────────────────────────── */

  async getPresets(): Promise<AvatarPreset[]> {
    const { data } = await api.get<AvatarPreset[]>(`${BASE}/presets`);
    return data;
  },

  async getMyAvatars(): Promise<UserAvatar[]> {
    const { data } = await api.get<UserAvatar[]>(`${BASE}/my-avatars`);
    return data;
  },

  async getActiveAvatar(): Promise<UserAvatar | null> {
    try {
      const { data } = await api.get<UserAvatar>(`${BASE}/active`);
      return data;
    } catch {
      return null;
    }
  },

  async saveAvatar(payload: AvatarCreatePayload): Promise<UserAvatar> {
    const { data } = await api.post<UserAvatar>(`${BASE}/save`, payload);
    return data;
  },

  async activateAvatar(avatarId: string): Promise<void> {
    await api.put(`${BASE}/${avatarId}/activate`);
  },

  async deleteAvatar(avatarId: string): Promise<void> {
    await api.delete(`${BASE}/${avatarId}`);
  },

  async uploadPhoto(): Promise<{ rpm_session_url: string }> {
    const { data } = await api.post<{ rpm_session_url: string }>(
      `${BASE}/upload-photo`
    );
    return data;
  },

  async rpmCallback(payload: {
    rpm_avatar_id: string;
    model_url: string;
    thumbnail_url?: string;
  }): Promise<UserAvatar> {
    const { data } = await api.post<UserAvatar>(`${BASE}/rpm-callback`, payload);
    return data;
  },

  /* ── WebSocket streaming ────────────────────────────────────────── */

  connectAvatarStream(token: string): WebSocket {
    const wsBase = (
      import.meta.env.VITE_API_URL || 'http://localhost:8000'
    ).replace(/^http/, 'ws');
    return new WebSocket(`${wsBase}/ws/avatar-stream?token=${token}`);
  },

  sendNarration(
    ws: WebSocket,
    text: string,
    gestureAnnotations: GestureAnnotation[] = []
  ): void {
    ws.send(
      JSON.stringify({
        type: 'narrate',
        text,
        gesture_annotations: gestureAnnotations,
      })
    );
  },

  stopNarration(ws: WebSocket): void {
    ws.send(JSON.stringify({ type: 'stop' }));
  },

  parseStreamMessage(event: MessageEvent): AvatarStreamMessage {
    return JSON.parse(event.data) as AvatarStreamMessage;
  },
};

export default avatarService;
