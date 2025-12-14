'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw, LayoutDashboard } from 'lucide-react';

/**
 * Dashboard Error Page
 *
 * 대시보드 영역에서 발생하는 에러를 처리합니다.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
            데이터를 불러올 수 없습니다
          </h2>

          {/* Description */}
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
            대시보드 데이터를 로드하는 중 문제가 발생했습니다.
            <br />
            네트워크 연결을 확인하거나 잠시 후 다시 시도해주세요.
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
              {error.digest && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={reset}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              다시 시도
            </button>

            <a
              href="/dashboard"
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors font-medium"
            >
              <LayoutDashboard className="w-4 h-4" />
              대시보드 홈으로
            </a>
          </div>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-md border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-200">
              <strong>💡 도움말:</strong> 문제가 계속되면 브라우저의 캐시를 삭제하거나 다른 브라우저로 시도해보세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
