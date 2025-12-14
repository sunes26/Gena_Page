'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

/**
 * Marketing Error Page
 *
 * 마케팅 페이지 영역에서 발생하는 에러를 처리합니다.
 */
export default function MarketingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Marketing page error:', error);
  }, [error]);

  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
            페이지를 표시할 수 없습니다
          </h2>

          {/* Description */}
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
            페이지를 불러오는 중 문제가 발생했습니다.
            <br />
            잠시 후 다시 시도해주세요.
          </p>

          {/* Error Details (Development Only) */}
          {isDevelopment && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 rounded-md border border-red-200 dark:border-red-800">
              <p className="text-xs font-semibold text-red-900 dark:text-red-200 mb-2">
                Development Error:
              </p>
              <p className="text-sm font-mono text-red-800 dark:text-red-300 break-all">
                {error.message}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={reset}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-md"
            >
              <RefreshCw className="w-4 h-4" />
              다시 시도
            </button>

            <Link
              href="/"
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors font-medium border-2 border-gray-200 dark:border-gray-600"
            >
              <Home className="w-4 h-4" />
              홈으로 돌아가기
            </Link>
          </div>

          {/* Additional Help */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              문제가 계속되나요?
            </p>
            <a
              href="mailto:oceancode0321@gmail.com"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              고객 지원팀에 문의하기 →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
