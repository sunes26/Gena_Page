// app/api/subscription/resume/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/firebase/admin-utils';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { resumePaddleSubscription } from '@/lib/paddle-server';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * 취소 예정인 구독 재개
 * POST /api/subscription/resume
 * 
 * 플로우:
 * 1. Firebase ID 토큰 인증
 * 2. Firestore에서 구독 정보 조회
 * 3. Paddle API로 구독 재개 요청
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

    // 2. Firestore에서 구독 정보 조회
    const db = getAdminFirestore();
    const subscriptionRef = db.collection('subscription');
    
    const subscriptionsSnapshot = await subscriptionRef
      .where('userId', '==', userId)
      .where('status', 'in', ['active', 'trialing'])
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

    // 3. 취소 예정이 아닌 경우
    if (!subscriptionData.cancelAtPeriodEnd) {
      return NextResponse.json({
        success: true,
        alreadyActive: true,
        message: '구독이 이미 활성화되어 있습니다.',
        subscription: {
          status: subscriptionData.status,
          cancelAtPeriodEnd: false,
        },
      });
    }

    // 4. Paddle API로 구독 재개
    let resumedSubscription;
    try {
      resumedSubscription = await resumePaddleSubscription(paddleSubscriptionId);
    } catch (error) {
      console.error('Paddle resume error:', error);
      return NextResponse.json(
        {
          error: 'Failed to resume subscription',
          message: 'Paddle 구독 재개에 실패했습니다.',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }

    // 5. Firestore 업데이트
    await subscriptionDoc.ref.update({
      status: resumedSubscription.status,
      cancelAtPeriodEnd: false,
      canceledAt: null,
      updatedAt: Timestamp.now(),
    });

    // 6. 성공 응답
    return NextResponse.json({
      success: true,
      message: '구독이 재개되었습니다. 다음 결제일에 정상적으로 갱신됩니다.',
      subscription: {
        id: resumedSubscription.id,
        status: resumedSubscription.status,
        cancelAtPeriodEnd: false,
        currentPeriodEnd: resumedSubscription.current_billing_period.ends_at,
        nextBilledAt: resumedSubscription.next_billed_at,
      },
    });

  } catch (error) {
    console.error('Subscription resume error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: '구독 재개 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}