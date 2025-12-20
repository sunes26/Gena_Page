// app/api/cron/webhook-retry/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';
import { notifyWebhookFailure } from '@/lib/notifications';
import type { PaddleEventType } from '@/app/api/webhooks/paddle/route';

/**
 * Webhook 재시도 Cron Job
 * GET /api/cron/webhook-retry
 *
 * Vercel Cron 설정 예시 (vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/webhook-retry",
 *     "schedule": "* /5 * * * *"
 *   }]
 * }
 *
 * 또는 외부 cron 서비스 (예: cron-job.org, EasyCron)에서 5분마다 호출
 *
 * 보안: CRON_SECRET 환경 변수를 사용하여 인증
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Cron 인증 (선택사항이지만 권장)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret) {
      if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    // 2. Firestore에서 재시도 대기 중인 웹훅 조회
    const db = getAdminFirestore();
    const now = Timestamp.now();

    const retryQueueSnapshot = await db
      .collection('webhook_retry_queue')
      .where('status', '==', 'pending')
      .where('nextRetryAt', '<=', now)
      .limit(50) // 한 번에 최대 50개 처리
      .get();

    if (retryQueueSnapshot.empty) {
      return NextResponse.json({
        success: true,
        message: 'No webhooks to retry',
        processed: 0,
      });
    }

    console.log(`🔄 Processing ${retryQueueSnapshot.size} webhook retries...`);

    // 3. 각 웹훅 재시도
    let successCount = 0;
    let failedCount = 0;
    let maxRetriesCount = 0;

    for (const doc of retryQueueSnapshot.docs) {
      const retryData = doc.data();
      const retryId = doc.id;

      try {
        console.log(`  🔄 Retrying webhook: ${retryData.eventId} (attempt ${retryData.retryCount + 1}/${retryData.maxRetries})`);

        // 웹훅 재처리 시도
        // NOTE: 실제 처리 로직은 webhook/paddle/route.ts의 processWebhookEvent 함수를 재사용해야 함
        // 여기서는 간단한 예시로 작성
        const webhookProcessed = await retryWebhookProcessing(
          retryData.eventType,
          retryData.payload,
          retryData.signature
        );

        if (webhookProcessed) {
          // 성공 시 큐에서 제거
          await db.collection('webhook_retry_queue').doc(retryId).delete();
          successCount++;
          console.log(`  ✅ Successfully processed: ${retryData.eventId}`);
        } else {
          throw new Error('Webhook processing returned false');
        }

      } catch (error) {
        console.error(`  ❌ Retry failed for ${retryData.eventId}:`, error);

        // 재시도 횟수 증가
        const newRetryCount = retryData.retryCount + 1;

        if (newRetryCount >= retryData.maxRetries) {
          // 최대 재시도 횟수 도달 - failed 상태로 변경
          await db.collection('webhook_retry_queue').doc(retryId).update({
            status: 'failed',
            retryCount: newRetryCount,
            lastError: error instanceof Error ? {
              message: error.message,
              stack: error.stack,
            } : { message: String(error) },
            updatedAt: Timestamp.now(),
          });
          maxRetriesCount++;
          console.log(`  ⛔ Max retries reached for ${retryData.eventId}`);

          // ✅ Critical: Slack/Discord 알림 전송
          await notifyWebhookFailure(
            retryData.eventId,
            retryData.eventType,
            newRetryCount,
            error instanceof Error ? error : new Error(String(error))
          ).catch(notifyErr => {
            console.error('Failed to send webhook failure notification:', notifyErr);
          });
        } else {
          // Exponential backoff: 1분 -> 5분 -> 15분 -> 30분 -> 60분
          const backoffMinutes = [1, 5, 15, 30, 60];
          const nextBackoff = backoffMinutes[Math.min(newRetryCount, backoffMinutes.length - 1)];
          const nextRetryAt = Timestamp.fromDate(
            new Date(Date.now() + nextBackoff * 60 * 1000)
          );

          await db.collection('webhook_retry_queue').doc(retryId).update({
            retryCount: newRetryCount,
            nextRetryAt,
            lastError: error instanceof Error ? {
              message: error.message,
              stack: error.stack,
            } : { message: String(error) },
            updatedAt: Timestamp.now(),
          });
          failedCount++;
          console.log(`  ⏰ Scheduled next retry for ${retryData.eventId} in ${nextBackoff} minutes`);
        }
      }
    }

    // 4. 성공 응답
    console.log(`✅ Webhook retry job completed: ${successCount} succeeded, ${failedCount} failed, ${maxRetriesCount} max retries`);

    return NextResponse.json({
      success: true,
      message: 'Webhook retry job completed',
      processed: retryQueueSnapshot.size,
      results: {
        succeeded: successCount,
        failed: failedCount,
        maxRetriesReached: maxRetriesCount,
      },
    });

  } catch (error) {
    console.error('Webhook retry job error:', error);
    return NextResponse.json(
      {
        error: 'Webhook retry job failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * 웹훅 재처리 함수
 *
 * webhook/paddle/route.ts의 processWebhookEvent를 재사용합니다.
 * 서명 검증은 생략 (이미 한 번 검증된 웹훅이므로)
 */
async function retryWebhookProcessing(
  eventType: string,
  payload: Record<string, unknown>,
  _signature?: string
): Promise<boolean> {
  try {
    console.log(`Processing webhook retry: ${eventType}`);

    // webhook/paddle/route.ts의 processWebhookEvent를 동적으로 import
    const { processWebhookEvent } = await import('@/app/api/webhooks/paddle/route');

    // payload에서 data 추출
    const data = payload.data || payload;

    await processWebhookEvent(eventType as PaddleEventType, data);

    console.log(`✅ Webhook retry successful: ${eventType}`);
    return true;

  } catch (error) {
    console.error('Webhook retry processing error:', error);
    return false;
  }
}

/**
 * 수동 트리거용 POST 엔드포인트 (테스트/디버깅용)
 */
export async function POST(request: NextRequest) {
  // POST는 GET과 동일한 로직 사용
  return GET(request);
}
