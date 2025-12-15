// app/api/admin/webhooks/retry/route.ts
import { NextRequest } from 'next/server';
import { verifyIdToken } from '@/lib/firebase/admin-utils';
import { requireAdminToken } from '@/lib/admin-auth';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';
import { requireCSRFToken } from '@/lib/csrf';
import {
  successResponse,
  unauthorizedResponse,
  forbiddenResponse,
  safeInternalServerErrorResponse,
} from '@/lib/api-response';

/**
 * 웹훅 재시도 처리 함수
 * 실제 웹훅 핸들러 로직을 재사용
 */
async function processWebhookRetry(
  payload: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  try {
    // Note: 이 함수는 app/api/webhooks/paddle/route.ts의 핸들러 로직을 재사용해야 함
    // 실제 구현에서는 핸들러 로직을 별도 함수로 분리하여 재사용하는 것이 좋음

    // 임시 구현: 핸들러 모듈을 동적으로 import하여 처리
    const { processWebhookPayload } = await import('@/lib/paddle-webhook-handlers');
    await processWebhookPayload(payload);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * 웹훅 재시도 큐 처리 (관리자 전용)
 * POST /api/admin/webhooks/retry
 *
 * 실패한 웹훅을 재처리하며 exponential backoff 적용
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Firebase ID 토큰 인증
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorizedResponse('인증 헤더가 누락되었거나 올바르지 않습니다.');
    }

    const token = authHeader.split('Bearer ')[1];
    let decodedToken;

    try {
      decodedToken = await verifyIdToken(token);
    } catch (error) {
      console.error('Token verification error:', error);
      return unauthorizedResponse('토큰이 유효하지 않거나 만료되었습니다.');
    }

    // 2. 관리자 권한 확인
    try {
      requireAdminToken(decodedToken);
    } catch {
      console.error('Admin authorization failed:', {
        email: decodedToken.email,
      });
      return forbiddenResponse('관리자 권한이 필요합니다.');
    }

    // CSRF 보호
    const csrfResponse = await requireCSRFToken(request);
    if (csrfResponse) {
      return csrfResponse;
    }

    // 3. 재시도할 웹훅 조회
    const db = getAdminFirestore();
    const now = Timestamp.now();

    // 재시도 시간이 된 pending 상태의 웹훅 조회
    const retryQueueSnapshot = await db
      .collection('webhook_retry_queue')
      .where('status', '==', 'pending')
      .where('nextRetryAt', '<=', now)
      .orderBy('nextRetryAt', 'asc')
      .limit(50) // 한 번에 50개씩 처리
      .get();

    if (retryQueueSnapshot.empty) {
      return successResponse(
        {
          processed: 0,
          message: '재시도할 웹훅이 없습니다.',
        },
        '재시도 큐가 비어있습니다.'
      );
    }

    const stats = {
      total: retryQueueSnapshot.size,
      succeeded: 0,
      failed: 0,
      exhausted: 0, // max retries 초과
    };

    // 4. 각 웹훅 재시도
    for (const doc of retryQueueSnapshot.docs) {
      const retryData = doc.data();
      const {
        payload,
        eventId,
        eventType,
        retryCount = 0,
        maxRetries = 5,
      } = retryData;

      try {
        // 웹훅 재처리
        const result = await processWebhookRetry(payload as Record<string, unknown>);

        if (result.success) {
          // 성공 - 큐에서 제거하고 성공 로그 저장
          await doc.ref.update({
            status: 'succeeded',
            completedAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          });
          stats.succeeded++;

          console.log(`✅ Webhook retry succeeded: ${eventId} (${eventType})`);
        } else {
          // 실패 - 재시도 횟수 증가
          const newRetryCount = retryCount + 1;

          if (newRetryCount >= maxRetries) {
            // 최대 재시도 횟수 초과 - 실패로 마킹
            await doc.ref.update({
              status: 'failed',
              retryCount: newRetryCount,
              lastError: result.error || 'Unknown error',
              failedAt: Timestamp.now(),
              updatedAt: Timestamp.now(),
            });
            stats.exhausted++;

            console.error(`❌ Webhook retry exhausted: ${eventId} (${eventType}) after ${newRetryCount} attempts`);
          } else {
            // Exponential backoff: 1분, 2분, 4분, 8분, 16분
            const backoffMinutes = Math.pow(2, newRetryCount);
            const nextRetryAt = Timestamp.fromDate(
              new Date(Date.now() + backoffMinutes * 60000)
            );

            await doc.ref.update({
              retryCount: newRetryCount,
              lastError: result.error || 'Unknown error',
              nextRetryAt,
              updatedAt: Timestamp.now(),
            });
            stats.failed++;

            console.warn(`⚠️ Webhook retry failed: ${eventId} (${eventType}), will retry in ${backoffMinutes} minutes (attempt ${newRetryCount}/${maxRetries})`);
          }
        }
      } catch (error) {
        console.error(`Error processing webhook retry ${eventId}:`, error);

        // 처리 중 에러 - 재시도 횟수 증가
        const newRetryCount = retryCount + 1;

        if (newRetryCount >= maxRetries) {
          await doc.ref.update({
            status: 'failed',
            retryCount: newRetryCount,
            lastError: error instanceof Error ? error.message : String(error),
            failedAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          });
          stats.exhausted++;
        } else {
          const backoffMinutes = Math.pow(2, newRetryCount);
          const nextRetryAt = Timestamp.fromDate(
            new Date(Date.now() + backoffMinutes * 60000)
          );

          await doc.ref.update({
            retryCount: newRetryCount,
            lastError: error instanceof Error ? error.message : String(error),
            nextRetryAt,
            updatedAt: Timestamp.now(),
          });
          stats.failed++;
        }
      }
    }

    // 5. 성공 응답
    return successResponse(
      stats,
      `웹훅 재시도 처리 완료: ${stats.succeeded}개 성공, ${stats.failed}개 재시도 예정, ${stats.exhausted}개 실패`
    );

  } catch (error) {
    return safeInternalServerErrorResponse(
      '웹훅 재시도 처리 중 오류가 발생했습니다.',
      error,
      'Webhook retry error'
    );
  }
}
