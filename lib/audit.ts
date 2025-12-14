// lib/audit.ts
/**
 * Audit Trail System
 * 구독 및 결제 시스템의 모든 중요한 작업을 추적합니다.
 */

import { getAdminFirestore } from './firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * Audit 이벤트 타입
 */
export type AuditEventType =
  // 구독 관련
  | 'subscription.created'
  | 'subscription.updated'
  | 'subscription.canceled'
  | 'subscription.resumed'
  | 'subscription.paused'
  | 'subscription.past_due'
  // 결제 관련
  | 'payment.completed'
  | 'payment.failed'
  | 'payment.refunded'
  // 플랜 변경
  | 'plan.upgraded'
  | 'plan.downgraded'
  // 사용자 작업
  | 'user.subscription_cancelled'
  | 'user.subscription_resumed'
  | 'user.payment_method_updated'
  // 관리자 작업
  | 'admin.subscription_modified'
  | 'admin.refund_issued'
  // 시스템 이벤트
  | 'system.webhook_received'
  | 'system.webhook_failed'
  | 'system.sync_completed'
  | 'system.sync_failed'
  // 보안 이벤트
  | 'security.unauthorized_access'
  | 'security.token_expired'
  | 'security.rate_limit_exceeded';

/**
 * Audit 이벤트 심각도
 */
export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical';

/**
 * Audit 로그 인터페이스
 */
export interface AuditLog {
  eventType: AuditEventType;
  severity: AuditSeverity;
  userId?: string;
  subscriptionId?: string;
  transactionId?: string;
  actor: {
    type: 'user' | 'system' | 'admin' | 'webhook';
    id?: string;
    ip?: string;
    userAgent?: string;
  };
  action: string;
  details?: Record<string, unknown>;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  timestamp: Timestamp;
  metadata?: {
    source?: string;
    environment?: string;
    version?: string;
  };
}

/**
 * ✅ Audit 로그 생성
 *
 * @param event - Audit 이벤트 정보
 * @returns Firestore document ID
 */
export async function createAuditLog(
  event: Omit<AuditLog, 'timestamp'>
): Promise<string> {
  const db = getAdminFirestore();

  const auditLog: AuditLog = {
    ...event,
    timestamp: Timestamp.now(),
  };

  // Firestore에 저장
  const docRef = await db.collection('audit_logs').add(auditLog);

  // 심각도에 따라 로그 레벨 조정
  const logPrefix = getSeverityLogPrefix(event.severity);
  console.log(
    `${logPrefix} [Audit] ${event.eventType}: ${event.action}`,
    event.userId ? `(User: ${event.userId})` : ''
  );

  return docRef.id;
}

/**
 * ✅ 구독 생성 감사 로그
 */
export async function logSubscriptionCreated(
  userId: string,
  subscriptionId: string,
  details: Record<string, unknown>
): Promise<void> {
  await createAuditLog({
    eventType: 'subscription.created',
    severity: 'info',
    userId,
    subscriptionId,
    actor: {
      type: 'webhook',
      id: 'paddle',
    },
    action: 'Subscription created via Paddle webhook',
    details,
  });
}

/**
 * ✅ 구독 업데이트 감사 로그
 */
export async function logSubscriptionUpdated(
  userId: string,
  subscriptionId: string,
  before: Record<string, unknown>,
  after: Record<string, unknown>
): Promise<void> {
  await createAuditLog({
    eventType: 'subscription.updated',
    severity: 'info',
    userId,
    subscriptionId,
    actor: {
      type: 'webhook',
      id: 'paddle',
    },
    action: 'Subscription updated via Paddle webhook',
    before,
    after,
  });
}

/**
 * ✅ 구독 취소 감사 로그
 */
export async function logSubscriptionCanceled(
  userId: string,
  subscriptionId: string,
  actor: { type: 'user' | 'admin' | 'webhook'; id?: string; ip?: string },
  details: Record<string, unknown>
): Promise<void> {
  await createAuditLog({
    eventType: 'subscription.canceled',
    severity: 'warning',
    userId,
    subscriptionId,
    actor,
    action:
      actor.type === 'user'
        ? 'User canceled their subscription'
        : actor.type === 'admin'
          ? 'Admin canceled subscription'
          : 'Subscription canceled via webhook',
    details,
  });
}

/**
 * ✅ 구독 재개 감사 로그
 */
export async function logSubscriptionResumed(
  userId: string,
  subscriptionId: string,
  actor: { type: 'user' | 'admin' | 'webhook'; id?: string; ip?: string },
  details: Record<string, unknown>
): Promise<void> {
  await createAuditLog({
    eventType: 'subscription.resumed',
    severity: 'info',
    userId,
    subscriptionId,
    actor,
    action:
      actor.type === 'user'
        ? 'User resumed their subscription'
        : actor.type === 'admin'
          ? 'Admin resumed subscription'
          : 'Subscription resumed via webhook',
    details,
  });
}

/**
 * ✅ 결제 완료 감사 로그
 */
export async function logPaymentCompleted(
  userId: string,
  transactionId: string,
  subscriptionId: string | null,
  details: Record<string, unknown>
): Promise<void> {
  await createAuditLog({
    eventType: 'payment.completed',
    severity: 'info',
    userId,
    transactionId,
    subscriptionId: subscriptionId || undefined,
    actor: {
      type: 'webhook',
      id: 'paddle',
    },
    action: 'Payment completed successfully',
    details,
  });
}

/**
 * ✅ 결제 실패 감사 로그
 */
export async function logPaymentFailed(
  userId: string,
  transactionId: string,
  subscriptionId: string | null,
  details: Record<string, unknown>
): Promise<void> {
  await createAuditLog({
    eventType: 'payment.failed',
    severity: 'error',
    userId,
    transactionId,
    subscriptionId: subscriptionId || undefined,
    actor: {
      type: 'webhook',
      id: 'paddle',
    },
    action: 'Payment failed',
    details,
  });
}

/**
 * ✅ 환불 감사 로그
 */
export async function logPaymentRefunded(
  userId: string,
  transactionId: string,
  subscriptionId: string | null,
  details: Record<string, unknown>
): Promise<void> {
  await createAuditLog({
    eventType: 'payment.refunded',
    severity: 'warning',
    userId,
    transactionId,
    subscriptionId: subscriptionId || undefined,
    actor: {
      type: 'webhook',
      id: 'paddle',
    },
    action: 'Payment refunded',
    details,
  });
}

/**
 * ✅ 플랜 업그레이드 감사 로그
 */
export async function logPlanUpgraded(
  userId: string,
  subscriptionId: string,
  before: { priceId: string; price: number },
  after: { priceId: string; price: number }
): Promise<void> {
  await createAuditLog({
    eventType: 'plan.upgraded',
    severity: 'info',
    userId,
    subscriptionId,
    actor: {
      type: 'user',
      id: userId,
    },
    action: 'User upgraded their plan',
    before,
    after,
  });
}

/**
 * ✅ 플랜 다운그레이드 감사 로그
 */
export async function logPlanDowngraded(
  userId: string,
  subscriptionId: string,
  before: { priceId: string; price: number },
  after: { priceId: string; price: number }
): Promise<void> {
  await createAuditLog({
    eventType: 'plan.downgraded',
    severity: 'info',
    userId,
    subscriptionId,
    actor: {
      type: 'user',
      id: userId,
    },
    action: 'User downgraded their plan',
    before,
    after,
  });
}

/**
 * ✅ 보안 이벤트 로그
 */
export async function logSecurityEvent(
  eventType: Extract<
    AuditEventType,
    | 'security.unauthorized_access'
    | 'security.token_expired'
    | 'security.rate_limit_exceeded'
  >,
  userId: string | undefined,
  details: Record<string, unknown>,
  ip?: string
): Promise<void> {
  await createAuditLog({
    eventType,
    severity: 'critical',
    userId,
    actor: {
      type: 'user',
      id: userId,
      ip,
    },
    action: `Security event: ${eventType}`,
    details,
  });
}

/**
 * ✅ Audit 로그 조회
 *
 * @param options - 조회 옵션
 * @returns Audit 로그 배열
 */
export async function getAuditLogs(options: {
  userId?: string;
  subscriptionId?: string;
  transactionId?: string;
  eventType?: AuditEventType;
  severity?: AuditSeverity;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}): Promise<AuditLog[]> {
  const db = getAdminFirestore();
  let query = db.collection('audit_logs').orderBy('timestamp', 'desc');

  // 필터 적용
  if (options.userId) {
    query = query.where('userId', '==', options.userId) as FirebaseFirestore.Query;
  }

  if (options.subscriptionId) {
    query = query.where('subscriptionId', '==', options.subscriptionId) as FirebaseFirestore.Query;
  }

  if (options.transactionId) {
    query = query.where('transactionId', '==', options.transactionId) as FirebaseFirestore.Query;
  }

  if (options.eventType) {
    query = query.where('eventType', '==', options.eventType) as FirebaseFirestore.Query;
  }

  if (options.severity) {
    query = query.where('severity', '==', options.severity) as FirebaseFirestore.Query;
  }

  if (options.startDate) {
    query = query.where('timestamp', '>=', Timestamp.fromDate(options.startDate)) as FirebaseFirestore.Query;
  }

  if (options.endDate) {
    query = query.where('timestamp', '<=', Timestamp.fromDate(options.endDate)) as FirebaseFirestore.Query;
  }

  // Limit
  const limit = options.limit || 100;
  query = query.limit(limit) as FirebaseFirestore.Query;

  const snapshot = await query.get();

  return snapshot.docs.map((doc) => doc.data() as AuditLog);
}

/**
 * ✅ Audit 통계 조회
 *
 * @param userId - 사용자 ID (선택)
 * @param days - 조회 기간 (일)
 * @returns Audit 통계
 */
export async function getAuditStats(
  userId?: string,
  days: number = 30
): Promise<{
  total: number;
  byEventType: Record<string, number>;
  bySeverity: Record<string, number>;
  recentCritical: Array<{ eventType: string; action: string; timestamp: Date }>;
}> {
  const db = getAdminFirestore();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  let query = db
    .collection('audit_logs')
    .where('timestamp', '>=', Timestamp.fromDate(startDate));

  if (userId) {
    query = query.where('userId', '==', userId) as FirebaseFirestore.Query;
  }

  const snapshot = await query.get();
  const logs = snapshot.docs.map((doc) => doc.data() as AuditLog);

  // 이벤트 타입별 통계
  const byEventType: Record<string, number> = {};
  const bySeverity: Record<string, number> = {};

  logs.forEach((log) => {
    byEventType[log.eventType] = (byEventType[log.eventType] || 0) + 1;
    bySeverity[log.severity] = (bySeverity[log.severity] || 0) + 1;
  });

  // 최근 critical 이벤트
  const recentCritical = logs
    .filter((log) => log.severity === 'critical')
    .slice(0, 10)
    .map((log) => ({
      eventType: log.eventType,
      action: log.action,
      timestamp: log.timestamp.toDate(),
    }));

  return {
    total: logs.length,
    byEventType,
    bySeverity,
    recentCritical,
  };
}

/**
 * 심각도에 따른 로그 프리픽스
 */
function getSeverityLogPrefix(severity: AuditSeverity): string {
  switch (severity) {
    case 'critical':
      return '🚨';
    case 'error':
      return '❌';
    case 'warning':
      return '⚠️';
    case 'info':
    default:
      return 'ℹ️';
  }
}
