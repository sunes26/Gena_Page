// app/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signInWithEmail, signInWithGoogle, createSession, getFirebaseErrorMessage } from '@/lib/auth';
import { getFirestoreInstance } from '@/lib/firebase/client';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  // ✅ users 문서 확인 및 생성 (마이그레이션 목적)
  const ensureUserProfile = async (userId: string, userEmail: string, userName?: string) => {
    try {
      const db = getFirestoreInstance();
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // users 문서가 없으면 생성
        console.log('Creating user profile for existing user:', userId);
        
        await setDoc(userRef, {
          email: userEmail,
          name: userName || null,
          isPremium: false,
          subscriptionPlan: 'free',
          emailVerified: true, // 로그인 성공했으므로 true
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        console.log('✅ User profile created (migration):', userId);
      } else {
        console.log('✅ User profile already exists:', userId);
      }
    } catch (error) {
      console.error('Failed to ensure user profile:', error);
      // 에러가 나도 계속 진행
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Firebase Auth로 로그인
      const userCredential = await signInWithEmail(email, password);
      const userId = userCredential.user.uid;
      const userEmail = userCredential.user.email || '';
      const userName = userCredential.user.displayName || undefined;

      // 2. ✅ users 문서 확인 및 생성
      await ensureUserProfile(userId, userEmail, userName);

      // 3. ID 토큰 가져오기
      const idToken = await userCredential.user.getIdToken();

      // 4. 세션 쿠키 생성
      await createSession(idToken);

      // 5. 리다이렉트
      router.push(redirect);
      router.refresh();
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.code 
        ? getFirebaseErrorMessage(error.code)
        : error.message || '로그인에 실패했습니다.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      // 1. Google로 로그인
      const userCredential = await signInWithGoogle();
      const userId = userCredential.user.uid;
      const userEmail = userCredential.user.email || '';
      const userName = userCredential.user.displayName || undefined;

      // 2. ✅ users 문서 확인 및 생성
      await ensureUserProfile(userId, userEmail, userName);

      // 3. ID 토큰 가져오기
      const idToken = await userCredential.user.getIdToken();

      // 4. 세션 쿠키 생성
      await createSession(idToken);

      // 5. 리다이렉트
      router.push(redirect);
      router.refresh();
    } catch (error: any) {
      console.error('Google login error:', error);
      const errorMessage = error.code
        ? getFirebaseErrorMessage(error.code)
        : 'Google 로그인에 실패했습니다.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">로그인</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              이메일
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">또는</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {loading ? 'Google 로그인 중...' : 'Google로 로그인'}
        </button>

        <p className="mt-6 text-center text-sm text-gray-600">
          계정이 없으신가요?{' '}
          <Link href="/signup" className="text-blue-600 hover:underline font-medium">
            회원가입
          </Link>
        </p>

        <p className="mt-2 text-center text-sm text-gray-600">
          <Link href="/forgot-password" className="text-blue-600 hover:underline">
            비밀번호를 잊으셨나요?
          </Link>
        </p>
      </div>
    </div>
  );
}