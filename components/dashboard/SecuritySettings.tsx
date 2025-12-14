// components/dashboard/SecuritySettings.tsx
'use client';

import { useState } from 'react';
import { User } from 'firebase/auth';
import { Lock, Eye, EyeOff, Shield, Loader2 } from 'lucide-react';
import { changePassword } from '@/lib/auth';
import { showSuccess, showError } from '@/lib/toast-helpers';
import { translateAuthError } from '@/lib/auth-errors';
import { useTranslation } from '@/hooks/useTranslation';

interface SecuritySettingsProps {
  user: User;
  onUpdate: () => void;
}

export default function SecuritySettings({}: SecuritySettingsProps) {
  const { t, locale } = useTranslation();

  // 비밀번호 변경
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // 비밀번호 표시 토글
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 비밀번호 변경 핸들러
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      showError('현재 비밀번호를 입력해주세요.');
      return;
    }

    if (!newPassword) {
      showError('새 비밀번호를 입력해주세요.');
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
      showError('현재 비밀번호와 동일한 비밀번호는 사용할 수 없습니다.');
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
    } catch (error: unknown) {
      console.error('Password change error:', error);
      // ✅ 에러 메시지 번역 적용
      const errorMessage = translateAuthError(error, t);
      showError(errorMessage || t('common.error'));
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* 비밀번호 변경 */}
      <div>
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Lock className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{t('settings.security.changePassword')}</h3>
            <p className="text-sm text-gray-500">
              계정 보안을 위해 주기적으로 비밀번호를 변경하세요.
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
                placeholder="새 비밀번호 (최소 6자)"
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

          {/* 저장 버튼 */}
          <div className="pt-4">
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
          </div>
        </form>
      </div>

      {/* 안내 메시지 */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">
          {locale === 'ko' ? '💡 보안 팁' : '💡 Security Tips'}
        </h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>
            {locale === 'ko' 
              ? '비밀번호는 최소 6자 이상으로 설정하세요' 
              : 'Use at least 6 characters for your password'}
          </li>
          <li>
            {locale === 'ko' 
              ? '영문, 숫자, 특수문자를 조합하면 더 안전합니다' 
              : 'Combine letters, numbers, and special characters for better security'}
          </li>
          <li>
            {locale === 'ko' 
              ? '정기적으로 비밀번호를 변경하세요' 
              : 'Change your password regularly'}
          </li>
        </ul>
      </div>
    </div>
  );
}