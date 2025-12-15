// app/api/subscription/sync/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase/admin';
import { getPaddleSubscription } from '@/lib/paddle-server';
import { Timestamp } from 'firebase-admin/firestore';
import { applyRateLimit, getIdentifier, RATE_LIMITS } from '@/lib/rate-limit';
import { tryClaimIdempotencyKey, getIdempotencyResult, storeIdempotencyResult } from '@/lib/idempotency';

/**
 * 구독 정보 수동 동기화 API
 * 
 * Paddle API에서 최신 구독 정보를 가져와 Firestore를 업데이트합니다.
 * 웹훅이 실패했거나 구독 정보가 맞지 않을 때 사용합니다.
 * 
 * POST /api/subscription/sync
 * Authorization: Bearer {firebase-id-token}
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Firebase ID 토큰 검증
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];
    const auth = getAdminAuth();
    
    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(idToken);
    } catch {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 인증 토큰입니다.' },
        { status: 401 }
      );
    }

    const userId = decodedToken.uid;

    // Rate Limiting (사용자별)
    const identifier = getIdentifier(request, userId);
    const rateLimitResponse = await applyRateLimit(identifier, RATE_LIMITS.GENERAL);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // ✅ Security: Idempotency check (prevent duplicate sync requests within 2 minutes)
    const idempotencyKey = `sync_${userId}_${Math.floor(Date.now() / (2 * 60 * 1000))}`;
    const canProceed = await tryClaimIdempotencyKey(idempotencyKey, userId, 'subscription.sync', 2);

    if (!canProceed) {
      // Check if we have a cached result
      const cachedResult = await getIdempotencyResult(idempotencyKey);
      if (cachedResult) {
        return NextResponse.json(cachedResult);
      }

      // No cached result, but this is a duplicate - return appropriate message
      return NextResponse.json(
        {
          success: true,
          message: '동기화가 이미 진행 중입니다. 잠시 후 다시 시도해주세요.',
          alreadyInProgress: true,
        },
        { status: 429 }
      );
    }

    // 2. Firestore에서 사용자의 구독 찾기
    const db = getAdminFirestore();
    const subscriptionsSnapshot = await db
      .collection('subscription')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    if (subscriptionsSnapshot.empty) {
      return NextResponse.json(
        { 
          success: false, 
          error: '활성 구독을 찾을 수 없습니다.',
          message: 'Free 플랜 사용자는 동기화할 구독이 없습니다.'
        },
        { status: 404 }
      );
    }

    const subscriptionDoc = subscriptionsSnapshot.docs[0];
    const subscriptionData = subscriptionDoc.data();

    // ✅ Security: Explicit ownership verification
    if (subscriptionData.userId !== userId) {
      console.error('Subscription ownership mismatch:', {
        authenticated: userId,
        subscription: subscriptionData.userId,
      });
      return NextResponse.json(
        {
          success: false,
          error: '이 구독에 대한 권한이 없습니다.',
        },
        { status: 403 }
      );
    }

    const paddleSubscriptionId = subscriptionData.paddleSubscriptionId;

    if (!paddleSubscriptionId) {
      return NextResponse.json(
        { success: false, error: 'Paddle 구독 ID가 없습니다.' },
        { status: 400 }
      );
    }

    // 3. Paddle API에서 최신 구독 정보 가져오기
    let paddleSubscription;
    try {
      paddleSubscription = await getPaddleSubscription(paddleSubscriptionId);
    } catch (error) {
      console.error('Failed to fetch from Paddle API:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Paddle API에서 구독 정보를 가져오는데 실패했습니다.',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

    // 4. Firestore 업데이트
    const updateData: Record<string, unknown> = {
      status: paddleSubscription.status,
      currentPeriodEnd: Timestamp.fromDate(
        new Date(paddleSubscription.current_billing_period.ends_at)
      ),
      nextBillingDate: paddleSubscription.next_billed_at
        ? Timestamp.fromDate(new Date(paddleSubscription.next_billed_at))
        : null,
      cancelAtPeriodEnd: paddleSubscription.scheduled_change?.action === 'cancel',
      updatedAt: Timestamp.now(),
    };

    // 가격 정보 업데이트
    if (paddleSubscription.items && paddleSubscription.items.length > 0) {
      const firstItem = paddleSubscription.items[0];
      updateData.priceId = firstItem.price?.id || '';
      updateData.price = firstItem.price?.unit_price?.amount || 0;
      updateData.currency = firstItem.price?.unit_price?.currency_code || 'KRW';
    }

    await subscriptionDoc.ref.update(updateData);

    // 5. users 컬렉션도 업데이트
    const isPremium = 
      paddleSubscription.status === 'active' || 
      paddleSubscription.status === 'trialing';

    await db.collection('users').doc(userId).update({
      isPremium,
      subscriptionPlan: isPremium ? 'pro' : 'free',
      updatedAt: Timestamp.now(),
    });

    // 6. daily 컬렉션 업데이트 (오늘 이후만)
    const today = new Date().toISOString().split('T')[0];
    const dailyRef = db
      .collection('users')
      .doc(userId)
      .collection('daily');

    // ✅ 최적화: limit 추가 (N+1 쿼리 방지)
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
          batch.update(doc.ref, { isPremium, updatedAt: Timestamp.now() });
        });

        await batch.commit();
      }
    }

    // 7. 응답
    const daysUntilRenewal = Math.ceil(
      (new Date(paddleSubscription.current_billing_period.ends_at).getTime() - new Date().getTime()) / 
      (1000 * 60 * 60 * 24)
    );

    const responseData = {
      success: true,
      message: '구독 정보가 동기화되었습니다.',
      subscription: {
        status: paddleSubscription.status,
        currentPeriodEnd: paddleSubscription.current_billing_period.ends_at,
        nextBillingDate: paddleSubscription.next_billed_at,
        cancelScheduled: paddleSubscription.scheduled_change?.action === 'cancel',
        daysUntilRenewal,
        isPremium,
      },
    };

    // ✅ Store result for idempotency
    await storeIdempotencyResult(idempotencyKey, responseData);

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Subscription sync error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '구독 동기화에 실패했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET 요청 - 헬스체크
 */
export async function GET() {
  return NextResponse.json({
    message: 'Subscription sync endpoint is active',
    usage: 'POST with Firebase ID token to sync subscription from Paddle',
  });
}