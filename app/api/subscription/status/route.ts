// app/api/subscription/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/firebase/admin-utils';
import { getAdminFirestore } from '@/lib/firebase/admin';

/**
 * 구독 상태 조회
 * GET /api/subscription/status
 * 
 * useSubscriptionAPI 훅을 위한 API 엔드포인트
 */
export async function GET(request: NextRequest) {
  try {
    // Firebase ID 토큰 인증
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

    // Firestore에서 구독 정보 조회
    const db = getAdminFirestore();
    const subscriptions = await db
      .collection('subscription')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    // 구독이 없으면 Free 플랜
    if (subscriptions.empty) {
      return NextResponse.json({
        subscription: null,
        plan: 'free',
        message: 'No active subscription',
      });
    }

    // 구독 정보 반환
    const subscriptionDoc = subscriptions.docs[0];
    const subscriptionData = subscriptionDoc.data();

    // ✅ Security: Explicit ownership verification
    if (subscriptionData.userId !== userId) {
      console.error('Subscription ownership mismatch:', {
        authenticated: userId,
        subscription: subscriptionData.userId,
      });
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: '이 구독에 대한 권한이 없습니다.',
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      subscription: {
        id: subscriptionDoc.id,
        userId: subscriptionData.userId,
        paddleSubscriptionId: subscriptionData.paddleSubscriptionId,
        paddleCustomerId: subscriptionData.paddleCustomerId,
        plan: subscriptionData.plan,
        status: subscriptionData.status,
        currentPeriodEnd: subscriptionData.currentPeriodEnd?.toDate().toISOString(),
        cancelAtPeriodEnd: subscriptionData.cancelAtPeriodEnd,
        nextBillingDate: subscriptionData.nextBillingDate?.toDate().toISOString() || null,
        price: subscriptionData.price,
        currency: subscriptionData.currency,
        priceId: subscriptionData.priceId,
        createdAt: subscriptionData.createdAt?.toDate().toISOString(),
        updatedAt: subscriptionData.updatedAt?.toDate().toISOString(),
      },
    });

  } catch (error) {
    console.error('Subscription status error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get subscription status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}