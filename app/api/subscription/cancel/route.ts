
// app/api/subscription/cancel/route.ts
import { NextRequest } from 'next/server';
import { verifyIdToken } from '@/lib/firebase/admin-utils';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { cancelPaddleSubscription } from '@/lib/paddle-server';
import { Timestamp } from 'firebase-admin/firestore';
import { cancelSubscriptionSchema } from '@/lib/validation';
import { applyRateLimit, getIdentifier, RATE_LIMITS } from '@/lib/rate-limit';
import {
  successResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  validationErrorResponse,
  internalServerErrorResponse,
  businessLogicErrorResponse,
} from '@/lib/api-response';

/**
 * Pro 플랜 구독 취소
 * POST /api/subscription/cancel
 * 
 * 플로우:
 * 1. Firebase ID 토큰 인증
 * 2. Firestore에서 구독 정보 조회
 * 3. Paddle API로 구독 취소 요청
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

    // 2. 요청 본문 검증 (본문이 없으면 기본값 사용)
    let cancelImmediately = false;
    try {
      const body = await request.json();
      const validation = cancelSubscriptionSchema.safeParse(body);

      if (!validation.success) {
        return validationErrorResponse(
          '요청 데이터가 올바르지 않습니다.',
          validation.error.issues[0]?.message
        );
      }

      cancelImmediately = validation.data.cancelImmediately;
    } catch {
      // 본문이 없어도 괜찮음 (기본값 사용)
      cancelImmediately = false;
    }

    // 3. Firestore에서 구독 정보 조회
    const db = getAdminFirestore();
    const subscriptionRef = db.collection('subscription');
    
    const subscriptionsSnapshot = await subscriptionRef
      .where('userId', '==', userId)
      .where('status', 'in', ['active', 'trialing', 'past_due'])
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

    // 4. 이미 취소 예정인지 확인
    if (subscriptionData.cancelAtPeriodEnd && !cancelImmediately) {
      const currentPeriodEnd = subscriptionData.currentPeriodEnd;
      const endDate = currentPeriodEnd instanceof Timestamp
        ? currentPeriodEnd.toDate()
        : new Date(currentPeriodEnd);

      return businessLogicErrorResponse(
        `이미 ${endDate.toLocaleDateString('ko-KR')}에 종료 예정입니다.`,
        {
          alreadyCanceled: true,
          subscription: {
            status: subscriptionData.status,
            cancelAtPeriodEnd: true,
            currentPeriodEnd: endDate.toISOString(),
          },
        }
      );
    }

    // 5. Paddle API로 구독 취소
    let canceledSubscription;
    try {
      canceledSubscription = await cancelPaddleSubscription(
        paddleSubscriptionId,
        {
          effective_from: cancelImmediately ? 'immediately' : 'next_billing_period',
        }
      );
    } catch (error) {
      console.error('Paddle cancellation error:', error);

      // ✅ subscription_locked_pending_changes 에러 처리
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('subscription_locked_pending_changes') ||
          errorMessage.includes('pending scheduled changes')) {
        // 이미 취소 예정인 경우
        return businessLogicErrorResponse(
          '이미 구독 취소가 예정되어 있습니다. 취소 예정을 철회하려면 구독 재개를 선택하세요.',
          {
            alreadyCanceled: true,
            paddleError: 'subscription_locked_pending_changes',
          }
        );
      }

      return internalServerErrorResponse(
        'Paddle 구독 취소에 실패했습니다.',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }

    // 6. Firestore 업데이트
    const updateData: Record<string, unknown> = {
      status: canceledSubscription.status,
      updatedAt: Timestamp.now(),
    };

    if (cancelImmediately) {
      // 즉시 취소: canceled 상태
      updateData.cancelAtPeriodEnd = false;
      updateData.canceledAt = Timestamp.now();
    } else {
      // 기간 만료 시 취소: cancelAtPeriodEnd = true
      updateData.cancelAtPeriodEnd = true;
      updateData.canceledAt = null; // 아직 취소되지 않음
    }

    await subscriptionDoc.ref.update(updateData);

    // 7. daily 컬렉션의 isPremium도 업데이트 (즉시 취소인 경우만)
    if (cancelImmediately) {
      const today = new Date().toISOString().split('T')[0];

      // ✅ 서브컬렉션 사용 (일관성 유지)
      const dailyRef = db
        .collection('users')
        .doc(userId)
        .collection('daily');

      // ✅ 최적화: 오늘 이후만 업데이트 + limit 추가
      const dailySnapshot = await dailyRef
        .where('date', '>=', today)
        .limit(90)
        .get();

      if (!dailySnapshot.empty) {
        // ✅ 배치 크기 제한 (Firestore 500개 제한)
        const batchSize = 500;
        const docs = dailySnapshot.docs;

        for (let i = 0; i < docs.length; i += batchSize) {
          const batch = db.batch();
          const chunk = docs.slice(i, i + batchSize);

          chunk.forEach(doc => {
            batch.update(doc.ref, { isPremium: false, updatedAt: Timestamp.now() });
          });

          try {
            await batch.commit();
            console.log(`✅ Updated ${chunk.length} daily docs (immediate cancel)`);
          } catch (error) {
            console.error('Failed to update daily stats:', error);
            // 실패해도 계속 진행
          }
        }
      }
    }

    // 8. 성공 응답
    const currentPeriodEnd = new Date(canceledSubscription.current_billing_period.ends_at);

    return successResponse(
      {
        subscription: {
          id: canceledSubscription.id,
          status: canceledSubscription.status,
          cancelAtPeriodEnd: !cancelImmediately,
          currentPeriodEnd: currentPeriodEnd.toISOString(),
          canceledAt: cancelImmediately ? new Date().toISOString() : null,
        },
      },
      cancelImmediately
        ? '구독이 즉시 취소되었습니다.'
        : `구독이 ${currentPeriodEnd.toLocaleDateString('ko-KR')}에 종료됩니다.`
    );

  } catch (error) {
    console.error('Subscription cancellation error:', error);
    return internalServerErrorResponse(
      '구독 취소 중 오류가 발생했습니다.',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

/**
 * 구독 취소 상태 확인
 * GET /api/subscription/cancel
 * 
 * 취소 예정인 구독 정보 조회
 */
export async function GET(request: NextRequest) {
  try {
    // Firebase 인증
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorizedResponse('인증 헤더가 누락되었거나 올바르지 않습니다.');
    }

    const token = authHeader.split('Bearer ')[1];
    let decodedToken;

    try {
      decodedToken = await verifyIdToken(token);
    } catch {
      return unauthorizedResponse('토큰이 유효하지 않거나 만료되었습니다.');
    }

    const userId = decodedToken.uid;

    // 구독 정보 조회
    const db = getAdminFirestore();
    const subscriptions = await db
      .collection('subscription')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    if (subscriptions.empty) {
      return successResponse({
        hasCancelScheduled: false,
      }, '구독 정보가 없습니다.');
    }

    const subscription = subscriptions.docs[0].data();

    // ✅ Security: Explicit ownership verification
    if (subscription.userId !== userId) {
      console.error('Subscription ownership mismatch:', {
        authenticated: userId,
        subscription: subscription.userId,
      });
      return forbiddenResponse('이 구독에 대한 권한이 없습니다.');
    }

    // 취소 예정 여부 확인
    if (!subscription.cancelAtPeriodEnd) {
      return successResponse({
        hasCancelScheduled: false,
        subscription: {
          status: subscription.status,
          currentPeriodEnd: subscription.currentPeriodEnd,
        },
      });
    }

    // 취소 예정
    const currentPeriodEnd = subscription.currentPeriodEnd instanceof Timestamp
      ? subscription.currentPeriodEnd.toDate()
      : new Date(subscription.currentPeriodEnd);

    return successResponse(
      {
        hasCancelScheduled: true,
        subscription: {
          status: subscription.status,
          cancelAtPeriodEnd: true,
          currentPeriodEnd: currentPeriodEnd.toISOString(),
        },
      },
      `구독이 ${currentPeriodEnd.toLocaleDateString('ko-KR')}에 종료 예정입니다.`
    );

  } catch (error) {
    console.error('Check cancellation error:', error);
    return internalServerErrorResponse(
      '취소 상태 확인 중 오류가 발생했습니다.',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}