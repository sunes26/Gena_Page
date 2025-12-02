// app/(auth)/signup/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signUp } from '@/lib/auth';
import { translateAuthError } from '@/lib/auth-errors';
import { getFirestoreInstance } from '@/lib/firebase/client';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useTranslation } from '@/hooks/useTranslation';

export default function SignupPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // 유효성 검사
  const validateForm = (): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return t('auth.errors.invalidEmail');
    }

    if (password.length < 8) {
      return t('auth.errors.passwordTooShort');
    }

    if (password !== passwordConfirm) {
      return t('auth.errors.passwordMismatch');
    }

    if (!agreeTerms) {
      return t('auth.errors.agreeTermsRequired');
    }

    return null;
  };

  // users 컬렉션에 문서 생성
  const createUserProfile = async (userId: string, userEmail: string, userName?: string) => {
    try {
      const db = getFirestoreInstance();
      const userRef = doc(db, 'users', userId);
      
      await setDoc(userRef, {
        email: userEmail,
        name: userName || null,
        isPremium: false,
        subscriptionPlan: 'free',
        emailVerified: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log('✅ User profile created:', userId);
    } catch (error) {
      console.error('Failed to create user profile:', error);
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      const userCredential = await signUp(email, password, displayName || undefined);
      const userId = userCredential.user.uid;

      await createUserProfile(userId, email, displayName);

      router.push('/verify-email?email=' + encodeURIComponent(email));
    } catch (error: any) {
      console.error('Signup error:', error);
      const errorMessage = error.code
        ? translateAuthError(error, t)
        : error.message || t('auth.errors.signupFailed');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">
          {t('auth.signup.title')}
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailSignup} className="space-y-4">
          {/* 이름 (선택사항) */}
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium mb-1">
              {t('auth.signup.displayNameLabel')}
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('auth.signup.displayNamePlaceholder')}
            />
          </div>

          {/* 이메일 */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              {t('auth.signup.emailLabel')} <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('auth.signup.emailPlaceholder')}
            />
          </div>

          {/* 비밀번호 */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              {t('auth.signup.passwordLabel')} <span className="text-red-500">*</span>
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('auth.signup.passwordPlaceholder')}
            />
            <p className="mt-1 text-xs text-gray-500">
              {t('auth.signup.passwordHint')}
            </p>
          </div>

          {/* 비밀번호 확인 */}
          <div>
            <label htmlFor="passwordConfirm" className="block text-sm font-medium mb-1">
              {t('auth.signup.passwordConfirmLabel')} <span className="text-red-500">*</span>
            </label>
            <input
              id="passwordConfirm"
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('auth.signup.passwordConfirmPlaceholder')}
            />
          </div>

          {/* 이용약관 동의 */}
          <div className="flex items-start">
            <input
              id="agreeTerms"
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="agreeTerms" className="ml-2 text-sm text-gray-700">
              <Link href="/terms" target="_blank" className="text-blue-600 hover:underline">
                {t('auth.signup.terms')}
              </Link>
              {' '}{t('common.and')}{' '}
              <Link href="/privacy" target="_blank" className="text-blue-600 hover:underline">
                {t('auth.signup.privacy')}
              </Link>
              {t('auth.signup.agreeTerms')}
              {' '}<span className="text-red-500">*</span>
            </label>
          </div>

          {/* 회원가입 버튼 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? t('auth.signup.signingUp') : t('auth.signup.signupButton')}
          </button>
        </form>

        {/* 로그인 링크 */}
        <p className="mt-6 text-center text-sm text-gray-600">
          {t('auth.signup.haveAccount')}{' '}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">
            {t('auth.signup.login')}
          </Link>
        </p>
      </div>
    </div>
  );
}