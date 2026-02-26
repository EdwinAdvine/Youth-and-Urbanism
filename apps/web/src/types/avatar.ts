/** Types for the 3D talking-tutor avatar system. */

export interface UserAvatar {
  id: string;
  user_id: string;
  name: string;
  avatar_type: 'preset_stylized' | 'preset_realistic' | 'custom_rpm';
  model_url: string;
  thumbnail_url: string | null;
  rpm_avatar_id: string | null;
  is_active: boolean;
  customization_data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface AvatarPreset {
  id: string;
  name: string;
  style: 'stylized' | 'realistic';
  model_url: string;
  thumbnail_url: string;
  description?: string;
  tags: string[];
}

export interface GestureAnnotation {
  gesture: string;
  char_position: number;
  timestamp_ms: number | null;
}

export interface VisemeData {
  viseme_id: number;
  timestamp_ms: number;
  duration_ms: number;
}

export type AvatarStreamMessageType =
  | 'audio_chunk'
  | 'viseme'
  | 'gesture'
  | 'gesture_timeline'
  | 'alignment'
  | 'audio_url'
  | 'text'
  | 'end'
  | 'error'
  | 'pong';

export interface AvatarStreamMessage {
  type: AvatarStreamMessageType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

export interface AvatarCreatePayload {
  name: string;
  avatar_type: 'preset_stylized' | 'preset_realistic' | 'custom_rpm';
  model_url: string;
  thumbnail_url?: string;
  rpm_avatar_id?: string;
  customization_data?: Record<string, unknown>;
}

export type AvatarPanelMode = 'pip' | 'docked' | 'fullscreen' | 'hidden';

export type WebGLTier = 'full' | 'limited' | 'none';
