// app/api/subscription/update-payment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/firebase/admin-utils';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { getUpdatePaymentMethodUrl } from '@/lib/paddle-server';

/**
 * 결제 수단 변경 URL 생성
 * POST /api/subscription/update-payment
 * 
 * 플로우:
 * 1. Firebase ID 토큰 인증
 * 2. Firestore에서 구독 정보 조회
 * 3. Paddle API로 결제 수단 변경 URL 생성
 * 4. URL 반환 (클라이언트에서 리다이렉트)
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

    // 2. 요청 본문 파싱 (선택사항)
    let body;
    try {
      body = await request.json();
    } catch (error) {
      body = {};
    }

    const { returnUrl } = body;

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

    const subscriptionData = subscriptionsSnapshot.docs[0].data();
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

    // 4. Paddle API로 결제 수단 변경 URL 생성
    let updateUrl;
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const finalReturnUrl = returnUrl || `${baseUrl}/subscription?payment_updated=true`;

      updateUrl = await getUpdatePaymentMethodUrl({
        subscriptionId: paddleSubscriptionId,
        returnUrl: finalReturnUrl,
      });
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

    // 5. URL 반환
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

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.paddleSubscriptionId,
        status: subscription.status,
        // 실제 결제 수단 정보는 Paddle API에서 가져와야 함
        // 여기서는 기본 정보만 반환
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