// app/(auth)/login/page.tsx
'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signInWithEmail, createSession } from '@/lib/auth';
import { getAuthErrorKey, getAuthErrorType, type AuthErrorType } from '@/lib/auth-errors';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { ensureUserProfile } from '@/lib/firebase/client-queries';
import DynamicMeta from '@/components/seo/DynamicMeta';

// 에러 타입에 따른 아이콘 컴포넌트
function ErrorIcon({ type }: { type: AuthErrorType }) {
  const iconClass = "w-5 h-5 flex-shrink-0";
  
  switch (type) {
    case 'credential':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      );
    case 'email':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    case 'network':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
        </svg>
      );
    case 'popup':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      );
    default:
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
  }
}

// 에러 타입에 따른 스타일 반환
function getErrorStyles(type: AuthErrorType): string {
  switch (type) {
    case 'credential':
      return 'bg-red-50 border-red-300 text-red-800';
    case 'email':
      return 'bg-orange-50 border-orange-300 text-orange-800';
    case 'network':
      return 'bg-yellow-50 border-yellow-300 text-yellow-800';
    case 'popup':
      return 'bg-blue-50 border-blue-300 text-blue-800';
    default:
      return 'bg-red-50 border-red-300 text-red-800';
  }
}

// ✅ useSearchParams를 사용하는 실제 로그인 컴포넌트 (분리)
function LoginFormContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState<AuthErrorType>('unknown');
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();

  // ✅ 이미 로그인한 사용자는 dashboard로 리다이렉트 (useEffect 사용)
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [authLoading, user, router]);

  const handleError = (err: unknown) => {
    console.error('Auth error:', err);
    const errorKey = getAuthErrorKey(err);
    const type = getAuthErrorType(err);
    setError(t(errorKey));
    setErrorType(type);
  };

  const clearError = () => {
    setError('');
    setErrorType('unknown');
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearError();

    if (!email.trim()) {
      setError(t('auth.errors.invalidEmail'));
      setErrorType('email');
      setLoading(false);
      return;
    }

    if (!password) {
      setError(t('auth.errors.passwordTooShort'));
      setErrorType('credential');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmail(email, password);

      // ✅ 최신 사용자 정보 가져오기 (이메일 인증 상태 포함)
      await userCredential.user.reload();

      const userId = userCredential.user.uid;
      const userEmail = userCredential.user.email || '';
      const emailVerified = userCredential.user.emailVerified; // ✅ Firebase Auth의 최신 값
      const userName = userCredential.user.displayName || undefined;
      const photoURL = userCredential.user.photoURL || undefined;

      // 🔍 디버깅: Firebase Auth 상태 확인
      console.log('🔐 Login - Firebase Auth state:', {
        userId,
        email: userEmail,
        emailVerified,
        displayName: userName,
      });

      // ✅ Firebase Auth의 emailVerified 값을 전달
      await ensureUserProfile(userId, userEmail, emailVerified, userName, photoURL);

      const idToken = await userCredential.user.getIdToken();
      await createSession(idToken);

      // ✅ 강제 페이지 새로고침으로 리다이렉트 (AuthContext 확실히 업데이트)
      window.location.href = redirect;
    } catch (error) {
      handleError(error);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">
          {t('auth.login.title')}
        </h1>

        <p className="text-center text-gray-600 mb-6 text-sm">
          {t('auth.login.subtitle')}
        </p>

        {error && (
          <div 
            className={`mb-4 p-4 border rounded-lg flex items-start gap-3 ${getErrorStyles(errorType)}`}
            role="alert"
            aria-live="polite"
          >
            <ErrorIcon type={errorType} />
            <div className="flex-1">
              <p className="text-sm font-medium">{error}</p>
              {errorType === 'credential' && (
                <p className="text-xs mt-1 opacity-80">
                  <Link href="/forgot-password" className="underline hover:no-underline">
                    {t('auth.login.forgotPassword')}
                  </Link>
                </p>
              )}
              {errorType === 'network' && (
                <p className="text-xs mt-1 opacity-80">
                  {t('auth.errors.networkError')}
                </p>
              )}
            </div>
            <button 
              onClick={clearError}
              className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
              aria-label="에러 메시지 닫기"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label 
              htmlFor="email" 
              className="block text-sm font-medium mb-1"
            >
              {t('auth.login.emailLabel')}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error && errorType === 'email') clearError();
              }}
              required
              autoComplete="email"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                error && errorType === 'email' 
                  ? 'border-orange-400 bg-orange-50' 
                  : 'border-gray-300'
              }`}
              placeholder="your@email.com"
              aria-describedby="email-help"
              aria-invalid={error && errorType === 'email' ? 'true' : 'false'}
            />
          </div>

          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium mb-1"
            >
              {t('auth.login.passwordLabel')}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error && errorType === 'credential') clearError();
              }}
              required
              autoComplete="current-password"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                error && errorType === 'credential' 
                  ? 'border-red-400 bg-red-50' 
                  : 'border-gray-300'
              }`}
              placeholder="••••••••"
              aria-invalid={error && errorType === 'credential' ? 'true' : 'false'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            aria-busy={loading}
          >
            {loading && (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {loading ? t('auth.login.loggingIn') : t('auth.login.loginButton')}
          </button>
        </form>

        <nav className="mt-6 space-y-2">
          <p className="text-center text-sm text-gray-600">
            {t('auth.login.noAccount')}{' '}
            <Link 
              href="/signup" 
              className="text-blue-600 hover:underline font-medium"
            >
              {t('auth.login.signup')}
            </Link>
          </p>

          <p className="text-center text-sm text-gray-600">
            <Link 
              href="/forgot-password" 
              className="text-blue-600 hover:underline"
            >
              {t('auth.login.forgotPassword')}
            </Link>
          </p>
        </nav>
      </div>
    </div>
  );
}

// ✅ 메인 페이지: Suspense로 LoginFormContent 감싸기
export default function LoginPage() {
  const { t } = useTranslation();

  return (
    <>
      <DynamicMeta
        title={t('auth.login.title')}
        description={t('auth.login.description')}
        keywords="로그인, 로그인 페이지, Gena 로그인"
      />
      
      <Suspense 
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="text-center">
              <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        }
      >
        <LoginFormContent />
      </Suspense>
    </>
  );
}