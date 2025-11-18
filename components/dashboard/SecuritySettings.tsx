// components/dashboard/SecuritySettings.tsx
'use client';

import { useState } from 'react';
import { User } from 'firebase/auth';
import { Lock, Mail, Eye, EyeOff, Shield, Loader2 } from 'lucide-react';
import { updateUserEmail, changePassword } from '@/lib/auth';
import { showSuccess, showError } from '@/lib/toast-helpers';
import { useTranslation } from '@/hooks/useTranslation';

interface SecuritySettingsProps {
  user: User;
  onUpdate: () => void;
}

export default function SecuritySettings({ user, onUpdate }: SecuritySettingsProps) {
  const { t, locale } = useTranslation();
  
  // 이메일 변경
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

  // 비밀번호 변경
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // 비밀번호 표시 토글
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 이메일 변경 핸들러
  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newEmail.trim()) {
      showError(locale === 'ko' ? '새 이메일을 입력해주세요.' : 'Please enter a new email.');
      return;
    }

    if (!emailPassword) {
      showError(locale === 'ko' ? '현재 비밀번호를 입력해주세요.' : 'Please enter your current password.');
      return;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      showError(t('auth.errors.invalidEmail'));
      return;
    }

    setEmailLoading(true);

    try {
      await updateUserEmail(newEmail.trim(), emailPassword);
      showSuccess(locale === 'ko' 
        ? '이메일이 변경되었습니다. 새 이메일로 인증 메일이 발송되었습니다.' 
        : 'Email changed successfully. Verification email sent to your new email.');
      
      // 폼 리셋
      setNewEmail('');
      setEmailPassword('');
      onUpdate();
    } catch (error: any) {
      showError(error.message || t('common.error'));
    } finally {
      setEmailLoading(false);
    }
  };

  // 비밀번호 변경 핸들러
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      showError(locale === 'ko' ? '현재 비밀번호를 입력해주세요.' : 'Please enter your current password.');
      return;
    }

    if (!newPassword) {
      showError(locale === 'ko' ? '새 비밀번호를 입력해주세요.' : 'Please enter a new password.');
      return;
    }

    if (newPassword.length < 6) {
      showError(t('auth.errors.passwordTooShort'));
      return;
    }

    if (newPassword !== confirmPassword) {
      showError(t('auth.errors.passwordMismatch'));
      return;
    }

    if (currentPassword === newPassword) {
      showError(locale === 'ko' 
        ? '현재 비밀번호와 동일한 비밀번호는 사용할 수 없습니다.' 
        : 'New password must be different from current password.');
      return;
    }

    setPasswordLoading(true);

    try {
      await changePassword(currentPassword, newPassword);
      showSuccess(t('settings.security.success'));
      
      // 폼 리셋
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      showError(error.message || t('common.error'));
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* 이메일 변경 */}
      <div className="pb-8 border-b border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Mail className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {locale === 'ko' ? '이메일 변경' : 'Change Email'}
            </h3>
            <p className="text-sm text-gray-500">
              {locale === 'ko' ? '로그인에 사용하는 이메일을 변경합니다.' : 'Update your login email address.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleEmailChange} className="space-y-4 mt-6">
          {/* 현재 이메일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {locale === 'ko' ? '현재 이메일' : 'Current Email'}
            </label>
            <input
              type="email"
              value={user.email || ''}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
            />
          </div>

          {/* 새 이메일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {locale === 'ko' ? '새 이메일' : 'New Email'}
            </label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder={locale === 'ko' ? '새 이메일 주소' : 'New email address'}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={emailLoading}
            />
          </div>

          {/* 현재 비밀번호 확인 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('settings.security.currentPassword')}
            </label>
            <input
              type="password"
              value={emailPassword}
              onChange={(e) => setEmailPassword(e.target.value)}
              placeholder={t('settings.security.currentPassword')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={emailLoading}
            />
          </div>

          <button
            type="submit"
            disabled={emailLoading || !newEmail || !emailPassword}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {emailLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {locale === 'ko' ? '변경 중...' : 'Updating...'}
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                {locale === 'ko' ? '이메일 변경' : 'Change Email'}
              </>
            )}
          </button>
        </form>
      </div>

      {/* 비밀번호 변경 */}
      <div>
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Lock className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{t('settings.security.changePassword')}</h3>
            <p className="text-sm text-gray-500">
              {locale === 'ko' 
                ? '계정 보안을 위해 주기적으로 비밀번호를 변경하세요.' 
                : 'Update your password regularly for better security.'}
            </p>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4 mt-6">
          {/* 현재 비밀번호 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('settings.security.currentPassword')}
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder={t('settings.security.currentPassword')}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={passwordLoading}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* 새 비밀번호 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('settings.security.newPassword')}
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={locale === 'ko' ? '새 비밀번호 (최소 6자)' : 'New password (min 6 chars)'}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={passwordLoading}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* 새 비밀번호 확인 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('settings.security.confirmPassword')}
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('settings.security.confirmPassword')}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={passwordLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {passwordLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('settings.security.updating')}
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                {t('settings.security.updateButton')}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}