// app/api/subscription/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/firebase/admin-utils';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { createPaddleTransaction } from '@/lib/paddle-server';
import { PADDLE_PRICES } from '@/lib/paddle';
import { validateRequestBody, createSubscriptionSchema } from '@/lib/validation';
import { applyRateLimit, getIdentifier, RATE_LIMITS } from '@/lib/rate-limit';

/**
 * Pro 플랜 구독 생성
 * POST /api/subscription/create
 * 
 * 플로우:
 * 1. Firebase ID 토큰 인증
 * 2. 이미 Pro 구독 중인지 확인
 * 3. Paddle Checkout URL 생성
 * 4. Checkout URL 반환
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
    const userEmail = decodedToken.email;

    // Rate Limiting (사용자별)
    const identifier = getIdentifier(request, userId);
    const rateLimitResponse = await applyRateLimit(identifier, RATE_LIMITS.SUBSCRIPTION_CREATE);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // 2. 요청 본문 검증
    const validation = await validateRequestBody(request, createSubscriptionSchema);
    if (!validation.success) {
      return validation.response;
    }

    const {
      priceId = PADDLE_PRICES.pro_monthly,
      returnUrl,
    } = validation.data;

    // 3. 이미 Pro 구독 중인지 확인
    const db = getAdminFirestore();
    const subscriptionRef = db.collection('subscription');
    
    const existingSubscription = await subscriptionRef
      .where('userId', '==', userId)
      .where('status', 'in', ['active', 'trialing'])
      .limit(1)
      .get();

    if (!existingSubscription.empty) {
      const sub = existingSubscription.docs[0].data();
      return NextResponse.json(
        {
          error: 'Already subscribed',
          message: '이미 Pro 플랜을 구독 중입니다.',
          subscription: {
            plan: sub.plan,
            status: sub.status,
            currentPeriodEnd: sub.currentPeriodEnd,
          },
        },
        { status: 409 } // Conflict
      );
    }

    // 4. Paddle Transaction (Checkout) 생성
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const successUrl = returnUrl || `${baseUrl}/subscription?success=true`;

    let transaction;
    try {
      transaction = await createPaddleTransaction({
        priceId,
        userId,
        userEmail,
        successUrl,
        customData: {
          source: 'web_dashboard',
        },
      });
    } catch (error) {
      console.error('Paddle transaction creation error:', error);
      return NextResponse.json(
        {
          error: 'Failed to create checkout',
          message: 'Paddle 결제 생성에 실패했습니다.',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }

    // 5. Checkout URL 확인
    if (!transaction.checkout?.url) {
      console.error('No checkout URL in transaction:', transaction);
      return NextResponse.json(
        {
          error: 'No checkout URL',
          message: 'Checkout URL을 생성할 수 없습니다.',
        },
        { status: 500 }
      );
    }

    // 6. (선택사항) Firestore에 pending 트랜잭션 기록
    try {
      await db.collection('pending_transactions').doc(transaction.id).set({
        userId,
        transactionId: transaction.id,
        priceId,
        status: 'pending',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24시간
      });
    } catch (error) {
      console.error('Failed to save pending transaction:', error);
      // 실패해도 계속 진행 (중요하지 않음)
    }

    // 7. 성공 응답 반환
    return NextResponse.json({
      success: true,
      checkoutUrl: transaction.checkout.url,
      transactionId: transaction.id,
      message: 'Checkout URL이 생성되었습니다.',
    });

  } catch (error) {
    console.error('Subscription creation error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: '구독 생성 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * 구독 상태 확인
 * GET /api/subscription/create?userId={userId}
 *
 * 테스트용 엔드포인트 (선택사항)
 */
export async function GET(request: NextRequest) {
  try {
    // Query parameter 검증
    const searchParams = request.nextUrl.searchParams;

    // userId가 없으면 에러
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Firebase 인증 확인 (실제로는 토큰 검증 필요)
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      const token = authHeader.split('Bearer ')[1];
      try {
        const decodedToken = await verifyIdToken(token);
        if (decodedToken.uid !== userId) {
          return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 403 }
          );
        }
      } catch {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        );
      }
    }

    // 구독 상태 조회
    const db = getAdminFirestore();
    const subscriptions = await db
      .collection('subscription')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    if (subscriptions.empty) {
      return NextResponse.json({
        subscribed: false,
        message: '구독 정보가 없습니다.',
      });
    }

    const subscription = subscriptions.docs[0].data();

    return NextResponse.json({
      subscribed: true,
      subscription: {
        plan: subscription.plan,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      },
    });

  } catch (error) {
    console.error('Subscription check error:', error);
    return NextResponse.json(
      {
        error: 'Failed to check subscription',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}