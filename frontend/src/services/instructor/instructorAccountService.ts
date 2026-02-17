/**
 * Instructor Account Service
 *
 * API calls to /api/v1/instructor/account endpoints for profile,
 * availability, password, and 2FA management.
 */
import apiClient from '../api';

export interface InstructorProfile {
  display_name: string;
  bio: string;
  tagline: string;
  avatar_url?: string;
  specializations: string[];
  qualifications: string[];
  languages: string[];
}

export interface AvailabilityConfig {
  timezone: string;
  weekly_schedule: Record<
    string,
    { enabled: boolean; start?: string; end?: string }
  >;
  booking_window_days: number;
  session_duration_minutes: number;
}

export interface TwoFactorStatus {
  totp_enabled: boolean;
  sms_enabled: boolean;
  email_otp_enabled: boolean;
  last_verified_at?: string;
}

export async function getProfile(): Promise<InstructorProfile> {
  const { data } = await apiClient.get<InstructorProfile>(
    '/api/v1/instructor/account/profile',
  );
  return data;
}

export async function updateProfile(
  profileData: InstructorProfile,
): Promise<InstructorProfile> {
  const { data } = await apiClient.put<InstructorProfile>(
    '/api/v1/instructor/account/profile',
    profileData,
  );
  return data;
}

export async function uploadAvatar(file: File): Promise<{ avatar_url: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await apiClient.post<{ avatar_url: string }>(
    '/api/v1/instructor/account/avatar',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  );
  return data;
}

export async function getAvailability(): Promise<AvailabilityConfig> {
  const { data } = await apiClient.get<AvailabilityConfig>(
    '/api/v1/instructor/account/availability',
  );
  return data;
}

export async function updateAvailability(
  availabilityData: AvailabilityConfig,
): Promise<AvailabilityConfig> {
  const { data } = await apiClient.put<AvailabilityConfig>(
    '/api/v1/instructor/account/availability',
    availabilityData,
  );
  return data;
}

export async function changePassword(passwordData: {
  current_password: string;
  new_password: string;
}): Promise<void> {
  await apiClient.post('/api/v1/instructor/account/change-password', passwordData);
}

export async function get2FAStatus(): Promise<TwoFactorStatus> {
  const { data } = await apiClient.get<TwoFactorStatus>(
    '/api/v1/instructor/account/2fa/status',
  );
  return data;
}

export async function setupTOTP(): Promise<{ secret: string; qr_code_url: string }> {
  const { data } = await apiClient.post<{ secret: string; qr_code_url: string }>(
    '/api/v1/instructor/account/2fa/totp/setup',
  );
  return data;
}

export async function verifyTOTP(
  code: string,
): Promise<{ verified: boolean }> {
  const { data } = await apiClient.post<{ verified: boolean }>(
    '/api/v1/instructor/account/2fa/totp/verify',
    { code },
  );
  return data;
}
