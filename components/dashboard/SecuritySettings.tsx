// components/dashboard/SecuritySettings.tsx
'use client';

import { useState } from 'react';
import { User } from 'firebase/auth';
import { Lock, Mail, Eye, EyeOff, Shield, Loader2 } from 'lucide-react';
import { updateUserEmail, changePassword } from '@/lib/auth';
import { showSuccess, showError } from '@/lib/toast-helpers';

interface SecuritySettingsProps {
  user: User;
  onUpdate: () => void;
}

export default function SecuritySettings({ user, onUpdate }: SecuritySettingsProps) {
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
      showError('새 이메일을 입력해주세요.');
      return;
    }

    if (!emailPassword) {
      showError('현재 비밀번호를 입력해주세요.');
      return;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      showError('올바른 이메일 형식이 아닙니다.');
      return;
    }

    setEmailLoading(true);

    try {
      await updateUserEmail(newEmail.trim(), emailPassword);
      showSuccess('이메일이 변경되었습니다. 새 이메일로 인증 메일이 발송되었습니다.');
      
      // 폼 리셋
      setNewEmail('');
      setEmailPassword('');
      onUpdate();
    } catch (error: any) {
      showError(error.message || '이메일 변경에 실패했습니다.');
    } finally {
      setEmailLoading(false);
    }
  };

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
      showError('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    if (newPassword !== confirmPassword) {
      showError('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (currentPassword === newPassword) {
      showError('현재 비밀번호와 동일한 비밀번호는 사용할 수 없습니다.');
      return;
    }

    setPasswordLoading(true);

    try {
      await changePassword(currentPassword, newPassword);
      showSuccess('비밀번호가 변경되었습니다.');
      
      // 폼 리셋
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      showError(error.message || '비밀번호 변경에 실패했습니다.');
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
            <h3 className="text-lg font-semibold text-gray-900">이메일 변경</h3>
            <p className="text-sm text-gray-500">로그인에 사용하는 이메일을 변경합니다.</p>
          </div>
        </div>

        <form onSubmit={handleEmailChange} className="space-y-4 mt-6">
          {/* 현재 이메일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              현재 이메일
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
              새 이메일
            </label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="새 이메일 주소"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={emailLoading}
            />
          </div>

          {/* 현재 비밀번호 확인 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              현재 비밀번호 확인
            </label>
            <input
              type="password"
              value={emailPassword}
              onChange={(e) => setEmailPassword(e.target.value)}
              placeholder="현재 비밀번호"
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
                변경 중...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                이메일 변경
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
            <h3 className="text-lg font-semibold text-gray-900">비밀번호 변경</h3>
            <p className="text-sm text-gray-500">계정 보안을 위해 주기적으로 비밀번호를 변경하세요.</p>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4 mt-6">
          {/* 현재 비밀번호 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              현재 비밀번호
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="현재 비밀번호"
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
              새 비밀번호
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
              새 비밀번호 확인
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="새 비밀번호 확인"
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
                변경 중...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                비밀번호 변경
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}