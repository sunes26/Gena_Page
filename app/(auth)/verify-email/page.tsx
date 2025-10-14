// app/(auth)/verify-email/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAuthInstance } from '@/lib/firebase/client';
import { sendEmailVerification } from 'firebase/auth';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email');
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState('');
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (countdown > 0 && resendSuccess) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, resendSuccess]);

  const handleResend = async () => {
    setResending(true);
    setResendError('');
    setResendSuccess(false);

    try {
      const auth = getAuthInstance();
      const user = auth.currentUser;

      if (!user) {
        setResendError('로그인이 필요합니다.');
        setTimeout(() => router.push('/login'), 2000);
        return;
      }

      await sendEmailVerification(user);
      setResendSuccess(true);
      setCountdown(60);
    } catch (error: any) {
      console.error('Resend email error:', error);
      setResendError('이메일 재발송에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md text-center">
        {/* 이메일 아이콘 */}
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
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold mb-2">이메일을 확인해주세요</h1>

        {email && (
          <p className="text-gray-600 mb-4">
            <span className="font-medium text-gray-900">{email}</span>
            <br />
            로 인증 메일을 발송했습니다.
          </p>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-left">
          <p className="font-medium text-blue-900 mb-2">📧 다음 단계:</p>
          <ol className="space-y-1 text-blue-800 list-decimal list-inside">
            <li>이메일 수신함을 확인하세요</li>
            <li>인증 링크를 클릭하세요</li>
            <li>로그인하여 서비스를 이용하세요</li>
          </ol>
        </div>

        {/* 성공 메시지 */}
        {resendSuccess && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
            인증 메일이 재발송되었습니다!
          </div>
        )}

        {/* 에러 메시지 */}
        {resendError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {resendError}
          </div>
        )}

        {/* 재발송 버튼 */}
        <button
          onClick={handleResend}
          disabled={resending || (resendSuccess && countdown > 0)}
          className="w-full py-2 mb-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {resending
            ? '발송 중...'
            : resendSuccess && countdown > 0
            ? `재발송 (${countdown}초 후)`
            : '인증 메일 재발송'}
        </button>

        {/* 안내 텍스트 */}
        <p className="text-xs text-gray-500 mb-6">
          메일이 오지 않았나요? 스팸함을 확인해보세요.
          <br />
          또는 잠시 후 재발송 버튼을 클릭하세요.
        </p>

        {/* 로그인 링크 */}
        <Link
          href="/login"
          className="inline-block text-blue-600 hover:underline text-sm font-medium"
        >
          로그인 페이지로 이동 →
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}