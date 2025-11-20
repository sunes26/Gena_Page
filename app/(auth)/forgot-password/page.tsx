// app/(auth)/forgot-password/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { resetPassword } from '@/lib/auth';
import { translateAuthError } from '@/lib/auth-errors';
import { useTranslation } from '@/hooks/useTranslation';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    // 이메일 형식 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t('auth.errors.invalidEmail'));
      setLoading(false);
      return;
    }

    try {
      await resetPassword(email);
      setSuccess(true);
      setEmail('');
    } catch (error: any) {
      console.error('Reset password error:', error);
      // translateAuthError 사용 - 다국어 지원 에러 메시지
      const errorMessage = error.code
        ? translateAuthError(error, t)
        : t('auth.errors.resetFailed');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        {/* 아이콘 */}
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-center mb-2">
          {t('auth.forgotPassword.title')}
        </h1>
        <p className="text-center text-gray-600 mb-6 text-sm">
          {t('auth.forgotPassword.subtitle')}
        </p>

        {/* 성공 메시지 */}
        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            <p className="font-medium mb-1">{t('auth.forgotPassword.successTitle')}</p>
            <p className="text-sm">
              {t('auth.forgotPassword.successMessage')}
            </p>
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              {t('auth.forgotPassword.emailLabel')}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('auth.forgotPassword.emailPlaceholder')}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? t('auth.forgotPassword.sending') : t('auth.forgotPassword.sendButton')}
          </button>
        </form>

        {/* 링크들 */}
        <div className="mt-6 text-center space-y-2">
          <Link
            href="/login"
            className="block text-sm text-blue-600 hover:underline"
          >
            {t('auth.forgotPassword.backToLogin')}
          </Link>
          <p className="text-sm text-gray-600">
            {t('auth.forgotPassword.noAccount')}{' '}
            <Link href="/signup" className="text-blue-600 hover:underline font-medium">
              {t('auth.forgotPassword.signup')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}