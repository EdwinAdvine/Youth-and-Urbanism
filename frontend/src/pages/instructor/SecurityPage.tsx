import React, { useEffect, useState, useCallback } from 'react';
import {
  Shield,
  Key,
  Smartphone,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Copy,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { InstructorPageHeader } from '../../components/instructor/shared/InstructorPageHeader';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TwoFactorStatus {
  id: string;
  user_id: string;
  totp_enabled: boolean;
  sms_enabled: boolean;
  sms_phone: string | null;
  email_otp_enabled: boolean;
  last_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

interface TOTPSetupData {
  secret: string;
  qr_code_uri: string;
  backup_codes: string[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem('access_token')}` };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const SecurityPage: React.FC = () => {
  // ---- Global loading / status ----
  const [pageLoading, setPageLoading] = useState(true);
  const [twoFaStatus, setTwoFaStatus] = useState<TwoFactorStatus | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // ---- TOTP state ----
  const [totpSetupData, setTotpSetupData] = useState<TOTPSetupData | null>(null);
  const [totpSettingUp, setTotpSettingUp] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [totpVerifying, setTotpVerifying] = useState(false);
  const [totpSuccess, setTotpSuccess] = useState<string | null>(null);
  const [totpError, setTotpError] = useState<string | null>(null);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [copiedBackup, setCopiedBackup] = useState(false);

  // ---- SMS state ----
  const [smsPhone, setSmsPhone] = useState('+254');
  const [smsEnabling, setSmsEnabling] = useState(false);
  const [smsPendingVerify, setSmsPendingVerify] = useState(false);
  const [smsCode, setSmsCode] = useState('');
  const [smsVerifying, setSmsVerifying] = useState(false);
  const [smsSuccess, setSmsSuccess] = useState<string | null>(null);
  const [smsError, setSmsError] = useState<string | null>(null);

  // ---- Password state ----
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [passwordChanging, setPasswordChanging] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // =======================================================================
  // Fetch 2FA Status
  // =======================================================================

  const fetch2FAStatus = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/v1/instructor/account/2fa-status`, {
        headers: authHeaders(),
      });
      setTwoFaStatus(res.data);
    } catch (err: any) {
      console.error('Failed to fetch 2FA status:', err);
      // If 404, the user simply hasn't set up 2FA yet – treat as default off
      if (err?.response?.status === 404) {
        setTwoFaStatus(null);
      } else {
        setGlobalError('Failed to load security settings. Please try again.');
      }
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setPageLoading(true);
      await fetch2FAStatus();
      setPageLoading(false);
    };
    init();
  }, [fetch2FAStatus]);

  // =======================================================================
  // TOTP Setup
  // =======================================================================

  const handleTotpSetup = async () => {
    setTotpSettingUp(true);
    setTotpError(null);
    setTotpSuccess(null);
    setTotpCode('');
    setShowBackupCodes(false);
    try {
      const res = await axios.post(
        `${API_URL}/api/v1/instructor/account/2fa/totp/setup`,
        {},
        { headers: authHeaders() }
      );
      setTotpSetupData(res.data);
      setShowBackupCodes(true);
    } catch (err: any) {
      console.error('TOTP setup error:', err);
      setTotpError(err?.response?.data?.detail || 'Failed to set up authenticator. Please try again.');
    } finally {
      setTotpSettingUp(false);
    }
  };

  const handleTotpVerify = async () => {
    if (totpCode.length !== 6) {
      setTotpError('Please enter a 6-digit code.');
      return;
    }
    setTotpVerifying(true);
    setTotpError(null);
    setTotpSuccess(null);
    try {
      await axios.post(
        `${API_URL}/api/v1/instructor/account/2fa/totp/verify`,
        { code: totpCode },
        { headers: authHeaders() }
      );
      setTotpSuccess('Authenticator app has been enabled successfully.');
      setTotpCode('');
      // Refresh status
      await fetch2FAStatus();
    } catch (err: any) {
      console.error('TOTP verify error:', err);
      setTotpError(err?.response?.data?.detail || 'Invalid verification code. Please try again.');
    } finally {
      setTotpVerifying(false);
    }
  };

  const copyBackupCodes = () => {
    if (!totpSetupData) return;
    navigator.clipboard.writeText(totpSetupData.backup_codes.join('\n'));
    setCopiedBackup(true);
    setTimeout(() => setCopiedBackup(false), 2500);
  };

  // =======================================================================
  // SMS OTP
  // =======================================================================

  const handleSmsEnable = async () => {
    // Basic Kenya phone validation
    const phoneRegex = /^\+254[17]\d{8}$/;
    if (!phoneRegex.test(smsPhone)) {
      setSmsError('Enter a valid Kenyan number in +254 format (e.g. +254712345678).');
      return;
    }
    setSmsEnabling(true);
    setSmsError(null);
    setSmsSuccess(null);
    try {
      await axios.post(
        `${API_URL}/api/v1/instructor/account/2fa/sms/enable`,
        { phone: smsPhone },
        { headers: authHeaders() }
      );
      setSmsPendingVerify(true);
      setSmsSuccess('Verification code sent to your phone.');
    } catch (err: any) {
      console.error('SMS enable error:', err);
      setSmsError(err?.response?.data?.detail || 'Failed to send SMS. Please try again.');
    } finally {
      setSmsEnabling(false);
    }
  };

  const handleSmsVerify = async () => {
    if (smsCode.length !== 6) {
      setSmsError('Please enter the 6-digit code from your SMS.');
      return;
    }
    setSmsVerifying(true);
    setSmsError(null);
    setSmsSuccess(null);
    try {
      await axios.post(
        `${API_URL}/api/v1/instructor/account/2fa/sms/verify`,
        { code: smsCode },
        { headers: authHeaders() }
      );
      setSmsSuccess('SMS two-factor authentication has been enabled.');
      setSmsCode('');
      setSmsPendingVerify(false);
      await fetch2FAStatus();
    } catch (err: any) {
      console.error('SMS verify error:', err);
      setSmsError(err?.response?.data?.detail || 'Invalid code. Please try again.');
    } finally {
      setSmsVerifying(false);
    }
  };

  // =======================================================================
  // Password Change
  // =======================================================================

  const handlePasswordChange = async () => {
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setPasswordError('Current password is required.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordChanging(true);
    try {
      await axios.put(
        `${API_URL}/api/v1/instructor/account/password`,
        { current_password: currentPassword, new_password: newPassword },
        { headers: authHeaders() }
      );
      setPasswordSuccess('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
    } catch (err: any) {
      console.error('Password change error:', err);
      setPasswordError(err?.response?.data?.detail || 'Failed to change password. Please check your current password.');
    } finally {
      setPasswordChanging(false);
    }
  };

  // =======================================================================
  // Render
  // =======================================================================

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const totpEnabled = twoFaStatus?.totp_enabled ?? false;
  const smsEnabled = twoFaStatus?.sms_enabled ?? false;

  return (
    <div className="space-y-6">
      <InstructorPageHeader
        title="Security Settings"
        description="Manage your account security and two-factor authentication"
        icon={<Shield className="w-6 h-6 text-purple-400" />}
      />

      {globalError && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {globalError}
        </div>
      )}

      {/* ================================================================= */}
      {/* Password Section                                                  */}
      {/* ================================================================= */}
      <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-purple-500/10 rounded-lg">
            <Key className="w-5 h-5 text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Password</h3>
            <p className="text-sm text-gray-500 dark:text-white/60 mb-4">
              Change your password regularly to keep your account secure
            </p>

            {passwordSuccess && (
              <div className="flex items-center gap-2 mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
                <CheckCircle className="w-4 h-4 shrink-0" />
                {passwordSuccess}
              </div>
            )}

            {!showPasswordForm ? (
              <button
                onClick={() => {
                  setShowPasswordForm(true);
                  setPasswordError(null);
                  setPasswordSuccess(null);
                }}
                className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-400 dark:text-purple-300 rounded-lg transition-colors text-sm"
              >
                Change Password
              </button>
            ) : (
              <div className="space-y-4 max-w-md">
                {/* Current password */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-white/80 mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPw ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-2 pr-10 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New password */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-white/80 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPw ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2 pr-10 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50"
                      placeholder="At least 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm new password */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-white/80 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50"
                    placeholder="Repeat new password"
                  />
                </div>

                {passwordError && (
                  <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {passwordError}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePasswordChange}
                    disabled={passwordChanging}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    {passwordChanging ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                    {passwordChanging ? 'Changing...' : 'Update Password'}
                  </button>
                  <button
                    onClick={() => {
                      setShowPasswordForm(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setPasswordError(null);
                    }}
                    className="px-4 py-2 text-sm text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* TOTP Authenticator Section                                        */}
      {/* ================================================================= */}
      <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <Smartphone className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Authenticator App (TOTP)
              </h3>
              <p className="text-sm text-gray-500 dark:text-white/60">
                Use an authenticator app like Google Authenticator or Authy
              </p>
            </div>
          </div>

          {/* Status badge */}
          {totpEnabled ? (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-medium rounded-full">
              <CheckCircle className="w-3.5 h-3.5" />
              Enabled
            </span>
          ) : (
            <span className="px-3 py-1 bg-gray-200/50 dark:bg-white/10 text-gray-500 dark:text-white/50 text-xs font-medium rounded-full">
              Disabled
            </span>
          )}
        </div>

        {/* Setup flow – only show if TOTP is NOT already enabled */}
        {!totpEnabled && (
          <div className="mt-5 space-y-4">
            {/* Step 1: Initiate setup */}
            {!totpSetupData && (
              <button
                onClick={handleTotpSetup}
                disabled={totpSettingUp}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-400 dark:text-purple-300 rounded-lg transition-colors text-sm disabled:opacity-50"
              >
                {totpSettingUp ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                {totpSettingUp ? 'Setting up...' : 'Set Up Authenticator'}
              </button>
            )}

            {/* Step 2: Show provisioning URI + backup codes */}
            {totpSetupData && (
              <div className="space-y-4 p-4 bg-gray-100 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10">
                {/* QR / URI display */}
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-white/80 mb-2">
                    Scan this QR code with your authenticator app, or copy the provisioning URI below:
                  </p>
                  <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-white/10 break-all">
                    <code className="text-xs text-gray-800 dark:text-purple-300 select-all">
                      {totpSetupData.qr_code_uri}
                    </code>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(totpSetupData.qr_code_uri);
                    }}
                    className="mt-2 flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy URI
                  </button>
                </div>

                {/* TOTP secret (manual entry) */}
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-white/80 mb-1">Manual entry secret:</p>
                  <code className="inline-block px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 dark:text-purple-300 text-sm rounded-lg font-mono tracking-wider select-all">
                    {totpSetupData.secret}
                  </code>
                </div>

                {/* Backup codes */}
                {showBackupCodes && totpSetupData.backup_codes.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-700 dark:text-white/80">
                        Backup Codes
                      </p>
                      <button
                        onClick={copyBackupCodes}
                        className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        {copiedBackup ? 'Copied!' : 'Copy All'}
                      </button>
                    </div>
                    <div className="p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
                      <p className="text-xs text-yellow-400/80 mb-2">
                        Save these codes in a secure location. Each code can only be used once.
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {totpSetupData.backup_codes.map((code, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded text-xs font-mono text-gray-800 dark:text-white/90 text-center"
                          >
                            {code}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Verify code */}
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-white/80 mb-2">
                    Enter the 6-digit code from your authenticator app to verify:
                  </p>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={totpCode}
                      onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      className="w-40 px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white text-center text-lg tracking-[0.3em] font-mono focus:outline-none focus:border-purple-500/50"
                    />
                    <button
                      onClick={handleTotpVerify}
                      disabled={totpVerifying || totpCode.length !== 6}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      {totpVerifying ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      {totpVerifying ? 'Verifying...' : 'Verify & Enable'}
                    </button>
                  </div>
                </div>

                {totpError && (
                  <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {totpError}
                  </div>
                )}
                {totpSuccess && (
                  <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    {totpSuccess}
                  </div>
                )}
              </div>
            )}

            {/* Show error outside setup panel if setup itself failed */}
            {totpError && !totpSetupData && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {totpError}
              </div>
            )}
          </div>
        )}

        {/* Already enabled note */}
        {totpEnabled && (
          <div className="mt-4 flex items-center gap-2 p-3 bg-green-500/5 border border-green-500/20 rounded-lg text-green-400 text-sm">
            <CheckCircle className="w-4 h-4 shrink-0" />
            Authenticator app is active. Your account is protected with TOTP two-factor authentication.
          </div>
        )}
      </div>

      {/* ================================================================= */}
      {/* SMS OTP Section                                                   */}
      {/* ================================================================= */}
      <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <Smartphone className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                SMS One-Time Password
              </h3>
              <p className="text-sm text-gray-500 dark:text-white/60">
                Receive verification codes via SMS to your Kenyan phone number
              </p>
            </div>
          </div>

          {/* Status badge */}
          {smsEnabled ? (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-medium rounded-full">
              <CheckCircle className="w-3.5 h-3.5" />
              Enabled
            </span>
          ) : (
            <span className="px-3 py-1 bg-gray-200/50 dark:bg-white/10 text-gray-500 dark:text-white/50 text-xs font-medium rounded-full">
              Disabled
            </span>
          )}
        </div>

        {/* SMS setup flow */}
        {!smsEnabled && (
          <div className="mt-5 space-y-4">
            {!smsPendingVerify ? (
              <div className="space-y-3 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-white/80 mb-1">
                    Phone Number (Kenya +254)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="tel"
                      value={smsPhone}
                      onChange={(e) => {
                        let val = e.target.value;
                        // Ensure it starts with +254
                        if (!val.startsWith('+254')) {
                          val = '+254';
                        }
                        // Only allow digits after +254
                        const digits = val.slice(4).replace(/\D/g, '').slice(0, 9);
                        setSmsPhone('+254' + digits);
                      }}
                      placeholder="+254712345678"
                      className="w-52 px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white font-mono focus:outline-none focus:border-purple-500/50"
                    />
                    <button
                      onClick={handleSmsEnable}
                      disabled={smsEnabling}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-400 dark:text-purple-300 rounded-lg transition-colors text-sm disabled:opacity-50"
                    >
                      {smsEnabling ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Smartphone className="w-4 h-4" />
                      )}
                      {smsEnabling ? 'Sending...' : 'Send Code'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-white/40 mt-1">
                    Format: +254 followed by 9 digits (e.g. +254712345678)
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-w-md">
                {smsSuccess && (
                  <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    {smsSuccess}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-white/80 mb-1">
                    Enter the 6-digit code sent to {smsPhone}
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={smsCode}
                      onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      className="w-40 px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white text-center text-lg tracking-[0.3em] font-mono focus:outline-none focus:border-purple-500/50"
                    />
                    <button
                      onClick={handleSmsVerify}
                      disabled={smsVerifying || smsCode.length !== 6}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      {smsVerifying ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      {smsVerifying ? 'Verifying...' : 'Verify & Enable'}
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSmsPendingVerify(false);
                    setSmsCode('');
                    setSmsError(null);
                    setSmsSuccess(null);
                  }}
                  className="text-sm text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Change phone number
                </button>
              </div>
            )}

            {smsError && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm max-w-md">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {smsError}
              </div>
            )}
          </div>
        )}

        {/* Already enabled note */}
        {smsEnabled && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 p-3 bg-green-500/5 border border-green-500/20 rounded-lg text-green-400 text-sm">
              <CheckCircle className="w-4 h-4 shrink-0" />
              SMS OTP is active on {twoFaStatus?.sms_phone || 'your registered number'}.
            </div>
          </div>
        )}
      </div>

      {/* ================================================================= */}
      {/* Security Recommendations                                          */}
      {/* ================================================================= */}
      <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-6">
        <h4 className="text-sm font-semibold text-purple-300 dark:text-purple-200 mb-2">
          Security Recommendations
        </h4>
        <ul className="text-sm text-purple-300/80 dark:text-purple-200/80 space-y-1 list-disc list-inside">
          <li>Enable at least one form of two-factor authentication</li>
          <li>Use a strong, unique password for your account</li>
          <li>Store your backup codes in a secure location</li>
          <li>Regularly review your login history for suspicious activity</li>
        </ul>
      </div>
    </div>
  );
};
