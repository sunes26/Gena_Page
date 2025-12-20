// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // 환경 설정
  environment: process.env.NODE_ENV || 'development',

  // 샘플링 레이트 (프로덕션에서 100% 추적)
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 1.0 : 0.1,

  // 세션 리플레이 샘플링
  replaysSessionSampleRate: 0.1, // 10%의 세션만 기록
  replaysOnErrorSampleRate: 1.0, // 에러 발생 시 100% 기록

  // 디버그 모드 (개발 환경에서만)
  debug: process.env.NODE_ENV === 'development',

  // 민감한 데이터 필터링
  beforeSend(event, hint) {
    // 개발 환경에서는 Sentry로 전송하지 않음 (선택사항)
    if (process.env.NODE_ENV === 'development') {
      console.log('Sentry event (dev):', event);
      return null;
    }

    // 민감한 정보 제거
    if (event.request?.headers) {
      delete event.request.headers.authorization;
      delete event.request.headers.cookie;
    }

    return event;
  },

  // 무시할 에러들
  ignoreErrors: [
    // 브라우저 확장 프로그램 에러
    'top.GLOBALS',
    'originalCreateNotification',
    'canvas.contentDocument',
    'MyApp_RemoveAllHighlights',
    // 네트워크 에러 (일시적)
    'Network request failed',
    'NetworkError',
    // 취소된 요청
    'AbortError',
    'Request aborted',
  ],
});
