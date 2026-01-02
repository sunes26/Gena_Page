'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';

/**
 * 1회용 토큰 자동 로그인 페이지
 *
 * Chrome Extension에서 생성한 1회용 토큰으로 자동 로그인
 * 성공 시 구독 페이지 또는 지정된 경로로 리다이렉트
 */
export default function TokenLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleTokenLogin = async () => {
      try {
        // URL에서 토큰 가져오기
        const token = searchParams.get('token');
        const redirect = searchParams.get('redirect') || '/subscription';

        if (!token) {
          throw new Error('토큰이 없습니다');
        }

        setStatus('loading');

        // 백엔드 API 호출하여 토큰 검증 및 커스텀 토큰 받기
        const response = await fetch('/api/auth/token-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || '토큰 검증 실패');
        }

        const data = await response.json();

        if (!data.success || !data.customToken) {
          throw new Error('유효하지 않은 응답');
        }

        // Firebase signInWithCustomToken
        await signInWithCustomToken(auth, data.customToken);

        setStatus('success');

        // 성공 - 리다이렉트
        setTimeout(() => {
          router.push(redirect);
        }, 1000);

      } catch (error: any) {
        console.error('자동 로그인 실패:', error);
        setStatus('error');
        setErrorMessage(error.message || '자동 로그인에 실패했습니다');

        // 3초 후 로그인 페이지로 이동
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    };

    handleTokenLogin();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                자동 로그인 중...
              </h2>
              <p className="text-gray-600">
                잠시만 기다려주세요
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                로그인 성공!
              </h2>
              <p className="text-gray-600">
                페이지를 이동합니다...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                로그인 실패
              </h2>
              <p className="text-gray-600 mb-4">
                {errorMessage}
              </p>
              <p className="text-sm text-gray-500">
                잠시 후 로그인 페이지로 이동합니다...
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
