/**
 * Google Analytics 4 Configuration
 *
 * 사용자 행동, 트래픽, 전환을 추적합니다.
 *
 * 설치:
 * 1. Google Analytics 4 계정 생성
 * 2. 측정 ID 발급 (G-XXXXXXXXXX)
 * 3. 환경변수 설정: NEXT_PUBLIC_GA_MEASUREMENT_ID
 * 4. app/layout.tsx에서 GoogleAnalytics 컴포넌트 추가
 */

import { env } from './env';

// Google Analytics가 활성화되어 있는지 확인
export const GA_MEASUREMENT_ID = env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
export const isGAEnabled = !!GA_MEASUREMENT_ID;

// Window 객체 타입 확장
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'set',
      targetId: string,
      config?: Record<string, unknown>
    ) => void;
    dataLayer?: unknown[];
  }
}

/**
 * Page View 추적
 * Next.js 라우터와 통합하여 자동으로 페이지 뷰 추적
 */
export function pageview(url: string) {
  if (!isGAEnabled || !window.gtag) return;

  window.gtag('config', GA_MEASUREMENT_ID!, {
    page_path: url,
  });
}

/**
 * Custom Event 추적
 * 사용자 행동을 추적합니다
 */
export function event(action: string, params?: Record<string, unknown>) {
  if (!isGAEnabled || !window.gtag) return;

  window.gtag('event', action, params);
}

// ============================================
// Predefined Events (자주 사용하는 이벤트)
// ============================================

/**
 * 회원가입 추적
 */
export function trackSignup(method: 'email' | 'google') {
  event('sign_up', {
    method,
  });
}

/**
 * 로그인 추적
 */
export function trackLogin(method: 'email' | 'google') {
  event('login', {
    method,
  });
}

/**
 * 구독 시작 추적 (Pro 플랜)
 */
export function trackSubscribeStart(plan: string) {
  event('begin_checkout', {
    items: [
      {
        item_id: plan,
        item_name: `${plan} Plan`,
        item_category: 'subscription',
      },
    ],
  });
}

/**
 * 구독 완료 추적
 */
export function trackPurchase(params: {
  transactionId: string;
  value: number;
  currency: string;
  plan: string;
}) {
  event('purchase', {
    transaction_id: params.transactionId,
    value: params.value,
    currency: params.currency,
    items: [
      {
        item_id: params.plan,
        item_name: `${params.plan} Plan`,
        item_category: 'subscription',
        price: params.value,
      },
    ],
  });
}

/**
 * 구독 취소 추적
 */
export function trackCancelSubscription(plan: string, reason?: string) {
  event('cancel_subscription', {
    plan,
    reason,
  });
}

/**
 * 검색 추적
 */
export function trackSearch(query: string, results?: number) {
  event('search', {
    search_term: query,
    ...(results !== undefined && { results }),
  });
}

/**
 * 콘텐츠 상호작용 추적
 */
export function trackContentInteraction(params: {
  contentType: string;
  contentId: string;
  action: 'view' | 'click' | 'share' | 'delete';
}) {
  event(params.action, {
    content_type: params.contentType,
    content_id: params.contentId,
  });
}

/**
 * 에러 추적
 */
export function trackError(params: {
  description: string;
  fatal?: boolean;
  location?: string;
}) {
  event('exception', {
    description: params.description,
    fatal: params.fatal || false,
    location: params.location,
  });
}

/**
 * 사용자 설정 변경 추적
 */
export function trackSettingsChange(setting: string, value: unknown) {
  event('settings_change', {
    setting,
    value: String(value),
  });
}

/**
 * 외부 링크 클릭 추적
 */
export function trackOutboundLink(url: string, label?: string) {
  event('click', {
    event_category: 'outbound',
    event_label: label || url,
    transport_type: 'beacon',
  });
}

/**
 * 파일 다운로드 추적
 */
export function trackDownload(fileName: string, fileType: string) {
  event('file_download', {
    file_name: fileName,
    file_extension: fileType,
  });
}

/**
 * 비디오 재생 추적
 */
export function trackVideoPlay(videoTitle: string) {
  event('video_start', {
    video_title: videoTitle,
  });
}

/**
 * 폼 제출 추적
 */
export function trackFormSubmit(formName: string, success: boolean) {
  event('form_submit', {
    form_name: formName,
    success,
  });
}

/**
 * 스크롤 깊이 추적
 */
export function trackScrollDepth(percentage: number) {
  event('scroll', {
    percent_scrolled: percentage,
  });
}

/**
 * 페이지 체류 시간 추적
 */
export function trackTimeOnPage(seconds: number, pagePath: string) {
  event('timing_complete', {
    name: 'time_on_page',
    value: seconds,
    event_category: 'engagement',
    event_label: pagePath,
  });
}
