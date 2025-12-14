// app/api/subscription/update-payment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/firebase/admin-utils';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { getUpdatePaymentMethodUrl } from '@/lib/paddle-server';
import { applyRateLimit, getIdentifier, RATE_LIMITS } from '@/lib/rate-limit';

/**
 * 결제 수단 변경 URL 생성
 * POST /api/subscription/update-payment
 * 
 * 플로우:
 * 1. Firebase ID 토큰 인증
 * 2. Firestore에서 구독 정보 조회
 * 3. Paddle API로 결제 수단 변경 URL 생성 (GET 요청)
 * 4. URL 반환 (클라이언트에서 리다이렉트)
 */
export async function POST(request: NextRequest) {
  try {
    console.log('📝 Update payment method request received');

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
    console.log(`👤 User authenticated: ${userId}`);

    // Rate Limiting (사용자별)
    const identifier = getIdentifier(request, userId);
    const rateLimitResponse = await applyRateLimit(identifier, RATE_LIMITS.SUBSCRIPTION_MUTATE);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // 2. Firestore에서 구독 정보 조회
    const db = getAdminFirestore();
    const subscriptionRef = db.collection('subscription');
    
    const subscriptionsSnapshot = await subscriptionRef
      .where('userId', '==', userId)
      .where('status', 'in', ['active', 'trialing', 'past_due'])
      .limit(1)
      .get();

    if (subscriptionsSnapshot.empty) {
      console.log('❌ No active subscription found');
      return NextResponse.json(
        {
          error: 'No active subscription',
          message: '활성화된 구독이 없습니다.',
        },
        { status: 404 }
      );
    }

    const subscriptionData = subscriptionsSnapshot.docs[0].data();

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

    const paddleSubscriptionId = subscriptionData.paddleSubscriptionId;

    console.log(`📋 Subscription found: ${paddleSubscriptionId}`);

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

    // 3. Paddle API로 결제 수단 변경 URL 생성
    let updateUrl;
    try {
      console.log(`🔄 Requesting update payment URL from Paddle...`);
      
      updateUrl = await getUpdatePaymentMethodUrl({
        subscriptionId: paddleSubscriptionId,
      });
      
      console.log(`✅ Update payment URL generated: ${updateUrl.substring(0, 50)}...`);
    } catch (error) {
      console.error('Failed to get update URL:', error);
      return NextResponse.json(
        {
          error: 'Failed to create update URL',
          message: '결제 수단 변경 URL 생성에 실패했습니다.',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }

    // 4. URL 반환
    return NextResponse.json({
      success: true,
      updateUrl,
      message: '결제 수단 변경 페이지로 이동합니다.',
    });

  } catch (error) {
    console.error('Update payment method error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: '결제 수단 변경 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * 구독의 현재 결제 수단 정보 조회 (선택사항)
 * GET /api/subscription/update-payment
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
    } catch {
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
      .where('status', 'in', ['active', 'trialing', 'past_due'])
      .limit(1)
      .get();

    if (subscriptions.empty) {
      return NextResponse.json(
        {
          error: 'No active subscription',
          message: '활성화된 구독이 없습니다.',
        },
        { status: 404 }
      );
    }

    const subscription = subscriptions.docs[0].data();

    // ✅ Security: Explicit ownership verification
    if (subscription.userId !== userId) {
      console.error('Subscription ownership mismatch:', {
        authenticated: userId,
        subscription: subscription.userId,
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
      success: true,
      subscription: {
        id: subscription.paddleSubscriptionId,
        status: subscription.status,
        hasPaymentMethod: true,
      },
    });

  } catch (error) {
    console.error('Get payment info error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get payment info',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}