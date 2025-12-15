// lib/paddle-webhook.ts
import crypto from 'crypto';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * Paddle 웹훅 이벤트 타입
 */
export type PaddleEventType =
  | 'subscription.created'
  | 'subscription.updated'
  | 'subscription.canceled'
  | 'subscription.past_due'
  | 'subscription.paused'
  | 'subscription.resumed'
  | 'transaction.completed'
  | 'transaction.updated'
  | 'transaction.payment_failed'
  | 'transaction.refunded'
  | 'customer.created'
  | 'customer.updated';

/**
 * Paddle 웹훅 이벤트 구조
 */
export interface PaddleWebhookEvent<T = unknown> {
  event_id: string;
  event_type: PaddleEventType;
  occurred_at: string;
  notification_id?: string;
  data: T;
}

/**
 * Paddle Subscription 데이터
 */
export interface PaddleSubscriptionData {
  id: string;
  status: 'active' | 'canceled' | 'past_due' | 'paused' | 'trialing';
  customer_id: string;
  custom_data?: Record<string, unknown>;
  items: Array<{
    price_id: string;
    quantity: number;
    price?: {
      id: string;
      unit_price: {
        amount: string;
        currency_code: string;
      };
    };
  }>;
  current_billing_period: {
    starts_at: string;
    ends_at: string;
  };
  next_billed_at: string | null;
  created_at: string;
  updated_at: string;
  started_at: string | null;
  first_billed_at: string | null;
  scheduled_change: {
    action: 'cancel' | 'pause' | 'resume';
    effective_at: string;
  } | null;
}

/**
 * Paddle Transaction 데이터
 */
export interface PaddleTransactionData {
  id: string;
  status: string;
  customer_id: string;
  subscription_id?: string;
  currency_code: string;
  billed_at: string;
  created_at: string;
  updated_at: string;
  custom_data?: Record<string, unknown>;
  details: {
    totals: {
      subtotal: string;
      discount: string;
      tax: string;
      total: string;
    };
  };
  payments?: Array<{
    amount: string;
    status: string;
    created_at: string;
    captured_at?: string;
    method_details?: {
      type: string;
      card?: {
        type: string;
        last4: string;
      };
    };
  }>;
}

/**
 * 웹훅 검증 오류
 */
export class WebhookVerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WebhookVerificationError';
  }
}

/**
 * Paddle 웹훅 시그니처 검증
 * 
 * Paddle은 HMAC SHA256을 사용하여 웹훅에 서명합니다.
 * 
 * @param signature - Paddle-Signature 헤더 값
 * @param body - 원본 요청 본문 (문자열)
 * @param secret - Paddle 웹훅 시크릿 (기본값: 환경 변수)
 * @returns 검증 성공 여부
 * 
 * @throws {WebhookVerificationError} 시크릿이 설정되지 않은 경우
 * 
 * @example
 * ```ts
 * const signature = request.headers.get('paddle-signature');
 * const rawBody = await request.text();
 * 
 * if (!verifyWebhookSignature(signature, rawBody)) {
 *   throw new Error('Invalid signature');
 * }
 * ```
 */
export function verifyWebhookSignature(
  signature: string | null,
  body: string,
  secret?: string
): boolean {
  try {
    // 시크릿 가져오기
    const webhookSecret = secret || process.env.PADDLE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new WebhookVerificationError(
        'PADDLE_WEBHOOK_SECRET is not configured'
      );
    }

    // 시그니처가 없으면 실패
    if (!signature) {
      console.error('Missing Paddle signature');
      return false;
    }

    // Paddle v2는 다음 형식의 시그니처를 사용:
    // ts=<timestamp>;h1=<signature>
    // 예: "ts=1234567890;h1=abc123..."
    
    // 시그니처 파싱
    const signatureParts = signature.split(';');
    let timestamp = '';
    let hash = '';

    for (const part of signatureParts) {
      const [key, value] = part.split('=');
      if (key === 'ts') {
        timestamp = value;
      } else if (key === 'h1') {
        hash = value;
      }
    }

    if (!timestamp || !hash) {
      console.error('Invalid signature format');
      return false;
    }

    // 시그니처 생성: timestamp:body
    const signedPayload = `${timestamp}:${body}`;

    // HMAC SHA256으로 검증
    const hmac = crypto.createHmac('sha256', webhookSecret);
    hmac.update(signedPayload);
    const expectedHash = hmac.digest('hex');

    // 타이밍 공격 방지를 위한 상수 시간 비교
    const isValid = crypto.timingSafeEqual(
      Buffer.from(hash),
      Buffer.from(expectedHash)
    );

    if (!isValid) {
      console.error('Signature verification failed');
      return false;
    }

    // ✅ Security: Enhanced timestamp validation
    const now = Math.floor(Date.now() / 1000);
    const timestampNum = parseInt(timestamp, 10);

    // Validate timestamp is a valid number
    if (isNaN(timestampNum) || timestampNum <= 0) {
      console.error('Invalid timestamp format:', timestamp);
      return false;
    }

    // Validate timestamp is not too far in the past (max 1 hour old)
    const MAX_AGE_SECONDS = 60 * 60; // 1 hour
    if (timestampNum < now - MAX_AGE_SECONDS) {
      console.error(`Timestamp too old: ${now - timestampNum} seconds (max: ${MAX_AGE_SECONDS})`);
      return false;
    }

    // Validate timestamp is not in the future (allow 5 min clock skew tolerance)
    const MAX_FUTURE_TOLERANCE = 5 * 60; // 5 minutes
    if (timestampNum > now + MAX_FUTURE_TOLERANCE) {
      console.error(`Timestamp too far in future: ${timestampNum - now} seconds ahead`);
      return false;
    }

    // Final check: timestamp within acceptable window (5 minutes for normal operation)
    const timeDiff = Math.abs(now - timestampNum);
    if (timeDiff > 300) {
      console.error(`Timestamp outside acceptable window: ${timeDiff} seconds`);
      return false;
    }

    return true;
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      throw error;
    }
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * 웹훅 이벤트 파싱
 * 
 * @param body - 웹훅 요청 본문 (문자열 또는 객체)
 * @returns 파싱된 이벤트 객체
 * 
 * @throws {Error} JSON 파싱 실패 시
 * 
 * @example
 * ```ts
 * const event = parseWebhookEvent<PaddleSubscriptionData>(rawBody);
 * console.log(event.event_type); // "subscription.created"
 * console.log(event.data.id); // "sub_123"
 * ```
 */
export function parseWebhookEvent<T = unknown>(
  body: string | unknown
): PaddleWebhookEvent<T> {
  try {
    // 이미 객체면 그대로 반환
    if (typeof body === 'object' && body !== null) {
      return body as PaddleWebhookEvent<T>;
    }

    // 문자열이면 JSON 파싱
    const parsed = JSON.parse(body as string);

    // 필수 필드 검증
    if (!parsed.event_id || !parsed.event_type || !parsed.data) {
      throw new Error('Invalid webhook event structure');
    }

    return parsed as PaddleWebhookEvent<T>;
  } catch (error) {
    console.error('Failed to parse webhook event:', error);
    throw new Error(
      `Invalid webhook event: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * 중복 이벤트 확인
 * 
 * Firestore의 webhook_events 컬렉션에서 event_id를 확인하여
 * 이미 처리된 이벤트인지 판단합니다.
 * 
 * @param eventId - Paddle 이벤트 ID
 * @returns 중복 이벤트 여부 (true = 중복, false = 처음)
 * 
 * @example
 * ```ts
 * const isDuplicate = await isDuplicateEvent('evt_123');
 * if (isDuplicate) {
 *   return res.json({ success: true, message: 'Already processed' });
 * }
 * ```
 */
export async function isDuplicateEvent(eventId: string): Promise<boolean> {
  try {
    const db = getAdminFirestore();
    const eventDoc = await db.collection('webhook_events').doc(eventId).get();
    return eventDoc.exists;
  } catch (error) {
    console.error('Error checking duplicate event:', error);
    // 에러 발생 시 안전하게 false 반환 (중복이 아닌 것으로 처리)
    return false;
  }
}

/**
 * 이벤트 처리 완료 기록
 * 
 * 이벤트를 처리한 후 호출하여 중복 처리를 방지합니다.
 * 
 * @param eventId - Paddle 이벤트 ID
 * @param eventType - 이벤트 타입
 * @param metadata - 추가 메타데이터 (선택사항)
 * 
 * @example
 * ```ts
 * await markEventAsProcessed(
 *   'evt_123',
 *   'subscription.created',
 *   { userId: 'user_123' }
 * );
 * ```
 */
export async function markEventAsProcessed(
  eventId: string,
  eventType: PaddleEventType,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    const db = getAdminFirestore();

    // 30일 후 자동 삭제를 위한 만료 시간
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await db.collection('webhook_events').doc(eventId).set({
      eventId,
      eventType,
      processedAt: Timestamp.now(),
      expiresAt: Timestamp.fromDate(expiresAt),
      ...(metadata && { metadata }),
    });
  } catch (error) {
    console.error('Error marking event as processed:', error);
    throw error;
  }
}

/**
 * customData에서 userId 추출
 * 
 * @param customData - Paddle custom_data 객체
 * @returns userId 또는 null
 * 
 * @example
 * ```ts
 * const userId = extractUserId(event.data.custom_data);
 * if (!userId) {
 *   throw new Error('No userId in custom_data');
 * }
 * ```
 */
export function extractUserId(customData?: Record<string, unknown>): string | null {
  if (!customData) return null;

  const userId = customData.user_id;
  const altUserId = customData.userId;

  if (typeof userId === 'string') return userId;
  if (typeof altUserId === 'string') return altUserId;

  return null;
}

/**
 * 웹훅 이벤트 로깅
 * 
 * 디버깅을 위해 웹훅 이벤트를 Firestore에 기록합니다.
 * 
 * @param event - 웹훅 이벤트
 * @param status - 처리 상태
 * @param error - 에러 정보 (선택사항)
 */
export async function logWebhookEvent(
  event: PaddleWebhookEvent,
  status: 'success' | 'failed',
  error?: Error
): Promise<void> {
  try {
    const db = getAdminFirestore();

    await db.collection('webhook_logs').add({
      eventId: event.event_id,
      eventType: event.event_type,
      status,
      occurredAt: Timestamp.fromDate(new Date(event.occurred_at)),
      processedAt: Timestamp.now(),
      ...(error && {
        error: {
          message: error.message,
          stack: error.stack,
        },
      }),
      // 전체 이벤트 데이터 (옵션)
      // data: event.data,
    });
  } catch (logError) {
    console.error('Failed to log webhook event:', logError);
    // 로깅 실패는 무시 (중요하지 않음)
  }
}

/**
 * 오래된 웹훅 이벤트 정리
 * 
 * Cron job에서 주기적으로 호출하여 30일 이상 된 이벤트 기록을 삭제합니다.
 * 
 * @returns 삭제된 이벤트 수
 */
export async function cleanupOldWebhookEvents(): Promise<number> {
  try {
    const db = getAdminFirestore();
    const now = Timestamp.now();

    // 30일 이상 된 이벤트 조회
    const oldEventsSnapshot = await db
      .collection('webhook_events')
      .where('expiresAt', '<=', now)
      .limit(500) // 한 번에 500개씩 처리
      .get();

    if (oldEventsSnapshot.empty) {
      return 0;
    }

    // 배치 삭제
    const batch = db.batch();
    oldEventsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    return oldEventsSnapshot.size;
  } catch (error) {
    console.error('Failed to cleanup old webhook events:', error);
    throw error;
  }
}

/**
 * 웹훅 처리 통계 조회
 * 
 * @param days - 조회 기간 (일)
 * @returns 통계 정보
 */
export async function getWebhookStats(days: number = 7): Promise<{
  total: number;
  byEventType: Record<string, number>;
  successRate: number;
}> {
  try {
    const db = getAdminFirestore();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logsSnapshot = await db
      .collection('webhook_logs')
      .where('processedAt', '>=', Timestamp.fromDate(startDate))
      .get();

    const stats = {
      total: logsSnapshot.size,
      byEventType: {} as Record<string, number>,
      successCount: 0,
    };

    logsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const eventType = data.eventType as string;

      // 이벤트 타입별 카운트
      stats.byEventType[eventType] = (stats.byEventType[eventType] || 0) + 1;

      // 성공 카운트
      if (data.status === 'success') {
        stats.successCount++;
      }
    });

    const successRate = stats.total > 0
      ? (stats.successCount / stats.total) * 100
      : 0;

    return {
      total: stats.total,
      byEventType: stats.byEventType,
      successRate: Math.round(successRate * 100) / 100,
    };
  } catch (error) {
    console.error('Failed to get webhook stats:', error);
    throw error;
  }
}

/**
 * ✅ 웹훅 실패 로깅
 *
 * 처리에 실패한 웹훅 이벤트를 영구적으로 기록합니다.
 * 이를 통해 실패한 이벤트를 추적하고 수동으로 재처리할 수 있습니다.
 *
 * @param event - 웹훅 이벤트
 * @param error - 발생한 에러
 * @param context - 추가 컨텍스트 정보
 */
export async function logWebhookFailure(
  event: PaddleWebhookEvent,
  error: Error,
  context?: Record<string, unknown>
): Promise<void> {
  try {
    const db = getAdminFirestore();

    await db.collection('webhook_failures').add({
      eventId: event.event_id,
      eventType: event.event_type,
      occurredAt: Timestamp.fromDate(new Date(event.occurred_at)),
      failedAt: Timestamp.now(),
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      eventData: event.data,
      context: context || {},
      retryCount: 0,
      resolved: false,
      // 30일 후 자동 삭제
      expiresAt: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
    });

    console.error(`❌ Webhook failure logged: ${event.event_id} (${event.event_type})`);
  } catch (logError) {
    console.error('Failed to log webhook failure:', logError);
    // 로깅 실패는 무시 (원본 에러를 throw)
  }
}

/**
 * ✅ 실패한 웹훅 조회
 *
 * @param options - 조회 옵션
 * @returns 실패한 웹훅 목록
 */
export async function getWebhookFailures(options: {
  limit?: number;
  resolved?: boolean;
  eventType?: string;
} = {}): Promise<Array<{
  id: string;
  eventId: string;
  eventType: string;
  failedAt: Date;
  error: { message: string; stack?: string };
  retryCount: number;
  resolved: boolean;
}>> {
  try {
    const db = getAdminFirestore();
    const { limit = 50, resolved, eventType } = options;

    let query = db.collection('webhook_failures').orderBy('failedAt', 'desc');

    if (resolved !== undefined) {
      query = query.where('resolved', '==', resolved);
    }

    if (eventType) {
      query = query.where('eventType', '==', eventType);
    }

    const snapshot = await query.limit(limit).get();

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        eventId: data.eventId,
        eventType: data.eventType,
        failedAt: data.failedAt.toDate(),
        error: data.error,
        retryCount: data.retryCount || 0,
        resolved: data.resolved || false,
      };
    });
  } catch (error) {
    console.error('Failed to get webhook failures:', error);
    throw error;
  }
}

/**
 * ✅ 실패한 웹훅 재시도 표시
 */
export async function markWebhookFailureAsRetried(failureId: string): Promise<void> {
  try {
    const db = getAdminFirestore();
    const failureRef = db.collection('webhook_failures').doc(failureId);

    await failureRef.update({
      retryCount: (await failureRef.get()).data()?.retryCount + 1 || 1,
      lastRetryAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Failed to mark webhook failure as retried:', error);
    throw error;
  }
}

/**
 * ✅ 실패한 웹훅 해결됨으로 표시
 */
export async function markWebhookFailureAsResolved(
  failureId: string,
  resolution?: string
): Promise<void> {
  try {
    const db = getAdminFirestore();

    await db.collection('webhook_failures').doc(failureId).update({
      resolved: true,
      resolvedAt: Timestamp.now(),
      ...(resolution && { resolution }),
    });
  } catch (error) {
    console.error('Failed to mark webhook failure as resolved:', error);
    throw error;
  }
}

/**
 * ✅ 웹훅 실패 통계
 *
 * @param days - 조회 기간 (일)
 * @returns 실패 통계
 */
export async function getWebhookFailureStats(days: number = 7): Promise<{
  total: number;
  byEventType: Record<string, number>;
  unresolved: number;
  recentFailures: Array<{ eventType: string; count: number }>;
}> {
  try {
    const db = getAdminFirestore();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const failuresSnapshot = await db
      .collection('webhook_failures')
      .where('failedAt', '>=', Timestamp.fromDate(startDate))
      .get();

    const stats = {
      total: failuresSnapshot.size,
      byEventType: {} as Record<string, number>,
      unresolved: 0,
    };

    failuresSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const eventType = data.eventType as string;

      // 이벤트 타입별 카운트
      stats.byEventType[eventType] = (stats.byEventType[eventType] || 0) + 1;

      // 미해결 카운트
      if (!data.resolved) {
        stats.unresolved++;
      }
    });

    // 최근 실패 순위
    const recentFailures = Object.entries(stats.byEventType)
      .map(([eventType, count]) => ({ eventType, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      total: stats.total,
      byEventType: stats.byEventType,
      unresolved: stats.unresolved,
      recentFailures,
    };
  } catch (error) {
    console.error('Failed to get webhook failure stats:', error);
    throw error;
  }
}

/**
 * 기본 export
 */
const paddleWebhook = {
  verifyWebhookSignature,
  parseWebhookEvent,
  isDuplicateEvent,
  markEventAsProcessed,
  extractUserId,
  logWebhookEvent,
  cleanupOldWebhookEvents,
  getWebhookStats,
  logWebhookFailure,
  getWebhookFailures,
  markWebhookFailureAsRetried,
  markWebhookFailureAsResolved,
  getWebhookFailureStats,
};

export default paddleWebhook;