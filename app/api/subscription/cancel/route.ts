
// app/api/subscription/cancel/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/firebase/admin-utils';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { cancelPaddleSubscription } from '@/lib/paddle-server';
import { Timestamp } from 'firebase-admin/firestore';

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
      return NextResponse.json(
        { error: 'Missing or invalid Authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    let decodedToken;

    try {
      decodedToken = await verifyIdToken(token);
    } catch (error) {
      console.error('Token verification error:', error);
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const userId = decodedToken.uid;

    // 2. 요청 본문 파싱
    let body;
    try {
      body = await request.json();
    } catch (error) {
      // 본문이 없어도 괜찮음 (기본값 사용)
      body = {};
    }

    const {
      cancelImmediately = false,
    } = body;

    // 3. Firestore에서 구독 정보 조회
    const db = getAdminFirestore();
    const subscriptionRef = db.collection('subscription');
    
    const subscriptionsSnapshot = await subscriptionRef
      .where('userId', '==', userId)
      .where('status', 'in', ['active', 'trialing', 'past_due'])
      .limit(1)
      .get();

    if (subscriptionsSnapshot.empty) {
      return NextResponse.json(
        {
          error: 'No active subscription',
          message: '활성화된 구독이 없습니다.',
        },
        { status: 404 }
      );
    }

    const subscriptionDoc = subscriptionsSnapshot.docs[0];
    const subscriptionData = subscriptionDoc.data();
    const paddleSubscriptionId = subscriptionData.paddleSubscriptionId;

    if (!paddleSubscriptionId) {
      console.error('Missing paddleSubscriptionId:', subscriptionData);
      return NextResponse.json(
        {
          error: 'Invalid subscription data',
          message: '구독 정보가 올바르지 않습니다.',
        },
        { status: 500 }
      );
    }

    // 4. 이미 취소 예정인지 확인
    if (subscriptionData.cancelAtPeriodEnd && !cancelImmediately) {
      const currentPeriodEnd = subscriptionData.currentPeriodEnd;
      const endDate = currentPeriodEnd instanceof Timestamp 
        ? currentPeriodEnd.toDate() 
        : new Date(currentPeriodEnd);

      return NextResponse.json({
        success: true,
        alreadyCanceled: true,
        message: `이미 ${endDate.toLocaleDateString('ko-KR')}에 종료 예정입니다.`,
        subscription: {
          status: subscriptionData.status,
          cancelAtPeriodEnd: true,
          currentPeriodEnd: endDate.toISOString(),
        },
      });
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
      return NextResponse.json(
        {
          error: 'Failed to cancel subscription',
          message: 'Paddle 구독 취소에 실패했습니다.',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }

    // 6. Firestore 업데이트
    const updateData: any = {
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
      const dailyRef = db.collection('daily');
      
      const dailySnapshot = await dailyRef
        .where('userId', '==', userId)
        .where('date', '>=', today)
        .get();

      // 배치 업데이트
      const batch = db.batch();
      dailySnapshot.docs.forEach(doc => {
        batch.update(doc.ref, { isPremium: false });
      });
      
      try {
        await batch.commit();
      } catch (error) {
        console.error('Failed to update daily stats:', error);
        // 실패해도 계속 진행
      }
    }

    // 8. 성공 응답
    const currentPeriodEnd = new Date(canceledSubscription.current_billing_period.ends_at);
    
    return NextResponse.json({
      success: true,
      message: cancelImmediately
        ? '구독이 즉시 취소되었습니다.'
        : `구독이 ${currentPeriodEnd.toLocaleDateString('ko-KR')}에 종료됩니다.`,
      subscription: {
        id: canceledSubscription.id,
        status: canceledSubscription.status,
        cancelAtPeriodEnd: !cancelImmediately,
        currentPeriodEnd: currentPeriodEnd.toISOString(),
        canceledAt: cancelImmediately ? new Date().toISOString() : null,
      },
    });

  } catch (error) {
    console.error('Subscription cancellation error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: '구독 취소 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
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
      return NextResponse.json(
        { error: 'Missing or invalid Authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    let decodedToken;

    try {
      decodedToken = await verifyIdToken(token);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
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
      return NextResponse.json({
        hasCancelScheduled: false,
        message: '구독 정보가 없습니다.',
      });
    }

    const subscription = subscriptions.docs[0].data();

    // 취소 예정 여부 확인
    if (!subscription.cancelAtPeriodEnd) {
      return NextResponse.json({
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

    return NextResponse.json({
      hasCancelScheduled: true,
      message: `구독이 ${currentPeriodEnd.toLocaleDateString('ko-KR')}에 종료 예정입니다.`,
      subscription: {
        status: subscription.status,
        cancelAtPeriodEnd: true,
        currentPeriodEnd: currentPeriodEnd.toISOString(),
      },
    });

  } catch (error) {
    console.error('Check cancellation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to check cancellation',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}