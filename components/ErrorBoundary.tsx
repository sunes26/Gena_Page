'use client';

import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary Component
 *
 * React 컴포넌트 트리에서 발생하는 에러를 포착하고
 * 폴백 UI를 표시합니다.
 *
 * @example
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 에러 로깅 (Sentry 등)
    console.error('Error Boundary caught an error:', error, errorInfo);

    // 사용자 정의 에러 핸들러 호출
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // 사용자 정의 폴백 UI가 있으면 사용
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 기본 폴백 UI
      return (
        <DefaultErrorFallback
          error={this.state.error}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Default Error Fallback UI
 */
interface DefaultErrorFallbackProps {
  error: Error | null;
  onReset: () => void;
}

function DefaultErrorFallback({ error, onReset }: DefaultErrorFallbackProps) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
            문제가 발생했습니다
          </h1>

          {/* Description */}
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
            예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
          </p>

          {/* Error Details (Development Only) */}
          {isDevelopment && error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 rounded-md border border-red-200 dark:border-red-800">
              <p className="text-sm font-mono text-red-800 dark:text-red-300 break-all">
                {error.message}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={onReset}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              다시 시도
            </button>

            <button
              onClick={() => window.location.href = '/'}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors font-medium"
            >
              <Home className="w-4 h-4" />
              홈으로 돌아가기
            </button>
          </div>

          {/* Support Link */}
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            문제가 계속되면{' '}
            <a
              href="mailto:oceancode0321@gmail.com"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              고객 지원팀
            </a>
            에 문의해주세요.
          </p>
        </div>
      </div>
    </div>
  );
}
