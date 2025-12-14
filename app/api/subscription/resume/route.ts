// app/api/subscription/resume/route.ts
import { NextRequest } from 'next/server';
import { verifyIdToken } from '@/lib/firebase/admin-utils';
import { getAdminFirestore } from '@/lib/firebase/admin';
import {
  resumePaddleSubscription,
  cancelScheduledChange,
  getPaddleSubscription
} from '@/lib/paddle-server';
import { Timestamp } from 'firebase-admin/firestore';
import { applyRateLimit, getIdentifier, RATE_LIMITS } from '@/lib/rate-limit';
import { tryClaimIdempotencyKey, getIdempotencyResult, storeIdempotencyResult } from '@/lib/idempotency';
import {
  successResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  internalServerErrorResponse,
  businessLogicErrorResponse,
  rateLimitErrorResponse,
} from '@/lib/api-response';
import { logSubscriptionResumed } from '@/lib/audit';

/**
 * 취소 예정인 구독 재개
 * POST /api/subscription/resume
 * 
 * 플로우:
 * 1. Firebase ID 토큰 인증
 * 2. Firestore에서 구독 정보 조회
 * 3. 구독 상태에 따라:
 *    - paused: resumePaddleSubscription 호출
 *    - cancelAtPeriodEnd: cancelScheduledChange 호출
 * 4. Firestore subscription 업데이트
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

    const userId = decodedToken.uid;

    // Rate Limiting (사용자별)
    const identifier = getIdentifier(request, userId);
    const rateLimitResponse = await applyRateLimit(identifier, RATE_LIMITS.SUBSCRIPTION_MUTATE);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // ✅ Security: Idempotency check (prevent duplicate resume requests within 5 minutes)
    const idempotencyKey = `resume_${userId}_${Math.floor(Date.now() / (5 * 60 * 1000))}`;
    const canProceed = await tryClaimIdempotencyKey(idempotencyKey, userId, 'subscription.resume', 5);

    if (!canProceed) {
      // Check if we have a cached result
      const cachedResult = await getIdempotencyResult(idempotencyKey);
      if (cachedResult) {
        console.log(`✅ Returning cached result for duplicate resume request`);
        return Response.json(cachedResult);
      }

      // No cached result, but this is a duplicate - return appropriate message
      return rateLimitErrorResponse('구독 재개 요청이 이미 처리되었습니다. 잠시 후 다시 시도해주세요.');
    }

    // 2. Firestore에서 구독 정보 조회
    const db = getAdminFirestore();
    const subscriptionRef = db.collection('subscription');

    const subscriptionsSnapshot = await subscriptionRef
      .where('userId', '==', userId)
      .where('status', 'in', ['active', 'trialing', 'paused'])
      .limit(1)
      .get();

    if (subscriptionsSnapshot.empty) {
      return notFoundResponse('활성화된 구독이 없습니다.');
    }

    const subscriptionDoc = subscriptionsSnapshot.docs[0];
    const subscriptionData = subscriptionDoc.data();

    // ✅ Security: Explicit ownership verification
    if (subscriptionData.userId !== userId) {
      console.error('Subscription ownership mismatch:', {
        authenticated: userId,
        subscription: subscriptionData.userId,
      });
      return forbiddenResponse('이 구독에 대한 권한이 없습니다.');
    }

    const paddleSubscriptionId = subscriptionData.paddleSubscriptionId;

    if (!paddleSubscriptionId) {
      console.error('Missing paddleSubscriptionId:', subscriptionData);
      return internalServerErrorResponse('구독 정보가 올바르지 않습니다.');
    }

    console.log(`🔍 Subscription status check:`, {
      paddleSubscriptionId,
      status: subscriptionData.status,
      cancelAtPeriodEnd: subscriptionData.cancelAtPeriodEnd,
    });

    // 3. 이미 활성 상태이고 취소 예정이 아닌 경우
    if (!subscriptionData.cancelAtPeriodEnd && subscriptionData.status !== 'paused') {
      return businessLogicErrorResponse(
        '구독이 이미 활성화되어 있습니다.',
        {
          alreadyActive: true,
          subscription: {
            status: subscriptionData.status,
            cancelAtPeriodEnd: false,
          },
        }
      );
    }

    let updatedSubscription;

    // 4. 상태에 따라 다른 API 호출
    try {
      if (subscriptionData.status === 'paused') {
        // paused 상태: resume API 호출
        console.log(`⏯️ Resuming paused subscription: ${paddleSubscriptionId}`);
        updatedSubscription = await resumePaddleSubscription(paddleSubscriptionId);
      } else if (subscriptionData.cancelAtPeriodEnd) {
        // 취소 예정 상태: scheduled_change 취소
        console.log(`🔄 Canceling scheduled cancellation: ${paddleSubscriptionId}`);
        updatedSubscription = await cancelScheduledChange(paddleSubscriptionId);
      } else {
        // 그 외의 경우: 현재 상태 조회
        updatedSubscription = await getPaddleSubscription(paddleSubscriptionId);
      }
    } catch (error) {
      console.error('Paddle API error:', error);
      return internalServerErrorResponse(
        'Paddle 구독 재개에 실패했습니다.',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }

    // 5. Firestore 업데이트
    await subscriptionDoc.ref.update({
      status: updatedSubscription.status,
      cancelAtPeriodEnd: updatedSubscription.scheduled_change?.action === 'cancel' || false,
      canceledAt: null,
      updatedAt: Timestamp.now(),
    });

    console.log(`✅ Subscription resumed successfully: ${paddleSubscriptionId}`);

    // ✅ Audit logging
    const resumeType = subscriptionData.status === 'paused'
      ? 'paused_subscription_resumed'
      : 'cancellation_reverted';

    await logSubscriptionResumed(
      userId,
      paddleSubscriptionId,
      { type: 'user', id: userId, ip: request.headers.get('x-forwarded-for') || undefined },
      {
        resumeType,
        previousStatus: subscriptionData.status,
        wasCancelAtPeriodEnd: subscriptionData.cancelAtPeriodEnd,
        newStatus: updatedSubscription.status,
        nextBilledAt: updatedSubscription.next_billed_at,
      }
    ).catch((err) => {
      console.error('Failed to log subscription resumed audit:', err);
    });

    // 6. 성공 응답
    const message = subscriptionData.cancelAtPeriodEnd
      ? '구독 취소가 철회되었습니다. 다음 결제일에 정상적으로 갱신됩니다.'
      : '구독이 재개되었습니다. 다음 결제일에 정상적으로 갱신됩니다.';

    const responseData = {
      subscription: {
        id: updatedSubscription.id,
        status: updatedSubscription.status,
        cancelAtPeriodEnd: updatedSubscription.scheduled_change?.action === 'cancel' || false,
        currentPeriodEnd: updatedSubscription.current_billing_period.ends_at,
        nextBilledAt: updatedSubscription.next_billed_at,
      },
    };

    // ✅ Store result for idempotency
    await storeIdempotencyResult(idempotencyKey, { success: true, data: responseData, message });

    return successResponse(responseData, message);

  } catch (error) {
    console.error('Subscription resume error:', error);
    return internalServerErrorResponse(
      '구독 재개 중 오류가 발생했습니다.',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}