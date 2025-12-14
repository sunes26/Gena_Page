// lib/constants.ts
/**
 * ✅ 문자열 상수 정의
 * 하드코딩된 문자열을 상수로 관리하여 오타 방지 및 타입 안전성 향상
 */

/**
 * 구독 플랜 상수
 */
export const SUBSCRIPTION_PLANS = {
  FREE: 'free',
  PRO: 'pro',
} as const;

/**
 * 구독 상태 상수
 */
export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  CANCELED: 'canceled',
  PAST_DUE: 'past_due',
  PAUSED: 'paused',
  TRIALING: 'trialing',
} as const;

/**
 * 사용량 제한 상수
 */
export const USAGE_LIMITS = {
  FREE_MONTHLY_LIMIT: 3, // 무료 플랜 월간 요약 제한
  WARNING_THRESHOLD: 0.66, // 66% 사용 시 경고 (2/3)
} as const;

/**
 * Paddle 이벤트 타입 상수
 */
export const PADDLE_EVENT_TYPES = {
  SUBSCRIPTION_CREATED: 'subscription.created',
  SUBSCRIPTION_UPDATED: 'subscription.updated',
  SUBSCRIPTION_CANCELED: 'subscription.canceled',
  SUBSCRIPTION_PAST_DUE: 'subscription.past_due',
  SUBSCRIPTION_PAUSED: 'subscription.paused',
  SUBSCRIPTION_RESUMED: 'subscription.resumed',
  TRANSACTION_COMPLETED: 'transaction.completed',
  TRANSACTION_UPDATED: 'transaction.updated',
  TRANSACTION_PAYMENT_FAILED: 'transaction.payment_failed',
} as const;

/**
 * 타입 추론을 위한 타입 정의
 */
export type SubscriptionPlan = typeof SUBSCRIPTION_PLANS[keyof typeof SUBSCRIPTION_PLANS];
export type SubscriptionStatus = typeof SUBSCRIPTION_STATUS[keyof typeof SUBSCRIPTION_STATUS];
export type PaddleEventType = typeof PADDLE_EVENT_TYPES[keyof typeof PADDLE_EVENT_TYPES];

/**
 * 타입 가드 함수
 */
export function isValidSubscriptionPlan(plan: string): plan is SubscriptionPlan {
  return Object.values(SUBSCRIPTION_PLANS).includes(plan as SubscriptionPlan);
}

export function isValidSubscriptionStatus(status: string): status is SubscriptionStatus {
  return Object.values(SUBSCRIPTION_STATUS).includes(status as SubscriptionStatus);
}

export function isValidPaddleEventType(eventType: string): eventType is PaddleEventType {
  return Object.values(PADDLE_EVENT_TYPES).includes(eventType as PaddleEventType);
}
