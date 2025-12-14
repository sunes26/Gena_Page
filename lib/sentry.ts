/**
 * Sentry Error Monitoring Configuration
 *
 * 프로덕션 에러를 추적하고 모니터링합니다.
 *
 * 설치:
 * npm install @sentry/nextjs
 *
 * 환경변수 설정 (.env.local):
 * NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
 * SENTRY_AUTH_TOKEN=your_sentry_auth_token
 */

// Sentry는 선택적 의존성이므로 타입만 정의
type SeverityLevel = 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug';

// Sentry 모듈 동적 import
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Sentry: any = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function loadSentry(): Promise<any> {
  if (Sentry) return Sentry;

  try {
    // @ts-expect-error - Optional dependency, may not be installed
    Sentry = await import('@sentry/nextjs');
    return Sentry;
  } catch {
    console.warn('[Sentry] Package not installed. Run: npm install @sentry/nextjs');
    return null;
  }
}

import { env } from './env';

/**
 * Initialize Sentry
 * 앱 시작 시 호출되어야 합니다
 */
export async function initSentry() {
  // Sentry DSN이 없으면 초기화하지 않음
  if (!env.NEXT_PUBLIC_SENTRY_DSN) {
    console.warn('[Sentry] DSN not configured. Error monitoring is disabled.');
    return;
  }

  const sentry = await loadSentry();
  if (!sentry) return;

  sentry.init({
    dsn: env.NEXT_PUBLIC_SENTRY_DSN,

    // Environment
    environment: env.NODE_ENV,

    // Release tracking
    // release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,

    // Performance Monitoring
    tracesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Session Replay (선택사항)
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

    // Error Filtering
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    beforeSend(event: any, hint: any) {
      // 개발 환경에서는 Sentry로 전송하지 않음
      if (env.NODE_ENV === 'development') {
        console.error('[Sentry] Would send error:', hint.originalException || hint.syntheticException);
        return null;
      }

      // Filter out non-critical errors
      const error = hint.originalException;

      // 네트워크 에러 (일시적)
      if (error && typeof error === 'object' && 'message' in error) {
        const message = String(error.message).toLowerCase();
        if (
          message.includes('network') ||
          message.includes('fetch failed') ||
          message.includes('load failed')
        ) {
          // 네트워크 에러는 로그만 하고 Sentry로 전송하지 않음
          return null;
        }
      }

      return event;
    },

    // Ignore specific errors
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'chrome-extension://',
      'moz-extension://',

      // Facebook errors
      'fb_xd_fragment',

      // Random network errors
      'NetworkError',
      'Non-Error promise rejection',

      // AbortError (intentional cancellations)
      'AbortError',
    ],

    // Integrations
    integrations: [
      // Automatically capture unhandled promise rejections
      new sentry.BrowserTracing({
        tracePropagationTargets: [
          'localhost',
          /^https:\/\/gena\.app/,
          /^https:\/\/.*\.gena\.app/,
        ],
      }),

      // Session Replay
      new sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
  });

  console.log('[Sentry] Error monitoring initialized');
}

/**
 * Set user context for error tracking
 * 사용자 로그인 시 호출
 */
export async function setSentryUser(user: {
  id: string;
  email?: string;
  name?: string;
}) {
  if (!env.NEXT_PUBLIC_SENTRY_DSN) return;

  const sentry = await loadSentry();
  if (!sentry) return;

  sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.name || undefined,
  });
}

/**
 * Clear user context
 * 사용자 로그아웃 시 호출
 */
export async function clearSentryUser() {
  if (!env.NEXT_PUBLIC_SENTRY_DSN) return;

  const sentry = await loadSentry();
  if (!sentry) return;

  sentry.setUser(null);
}

/**
 * Capture custom error
 * 수동으로 에러를 Sentry로 전송
 */
export async function captureError(error: Error, context?: Record<string, unknown>) {
  if (!env.NEXT_PUBLIC_SENTRY_DSN) {
    console.error('[Sentry] Would capture error:', error, context);
    return;
  }

  const sentry = await loadSentry();
  if (!sentry) return;

  sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Capture custom message
 * 에러가 아닌 중요한 이벤트를 기록
 */
export async function captureMessage(message: string, level: SeverityLevel = 'info') {
  if (!env.NEXT_PUBLIC_SENTRY_DSN) {
    console.log('[Sentry] Would capture message:', message, level);
    return;
  }

  const sentry = await loadSentry();
  if (!sentry) return;

  sentry.captureMessage(message, level);
}

/**
 * Add breadcrumb
 * 에러 발생 전 사용자 행동을 추적
 */
export async function addBreadcrumb(breadcrumb: {
  message: string;
  category?: string;
  level?: SeverityLevel;
  data?: Record<string, unknown>;
}) {
  if (!env.NEXT_PUBLIC_SENTRY_DSN) return;

  const sentry = await loadSentry();
  if (!sentry) return;

  sentry.addBreadcrumb(breadcrumb);
}
