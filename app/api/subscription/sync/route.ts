// app/api/subscription/sync/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase/admin';
import { getPaddleSubscription } from '@/lib/paddle-server';
import { Timestamp } from 'firebase-admin/firestore';

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
    } catch (error) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 인증 토큰입니다.' },
        { status: 401 }
      );
    }

    const userId = decodedToken.uid;

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
    const paddleSubscriptionId = subscriptionData.paddleSubscriptionId;

    if (!paddleSubscriptionId) {
      return NextResponse.json(
        { success: false, error: 'Paddle 구독 ID가 없습니다.' },
        { status: 400 }
      );
    }

    console.log(`🔄 Manual sync requested for user ${userId}, subscription ${paddleSubscriptionId}`);

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
    const updateData: any = {
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
      updateData.priceId = firstItem.price_id;
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
    
    const dailySnapshot = await dailyRef
      .where('date', '>=', today)
      .get();

    if (!dailySnapshot.empty) {
      const batch = db.batch();
      dailySnapshot.docs.forEach(doc => {
        batch.update(doc.ref, { isPremium });
      });
      await batch.commit();
      console.log(`✅ Updated ${dailySnapshot.size} daily docs`);
    }

    // 7. 응답
    const daysUntilRenewal = Math.ceil(
      (new Date(paddleSubscription.current_billing_period.ends_at).getTime() - new Date().getTime()) / 
      (1000 * 60 * 60 * 24)
    );

    console.log(`✅ Subscription synced successfully for user ${userId}`);
    console.log(`   Status: ${paddleSubscription.status}`);
    console.log(`   Current Period End: ${paddleSubscription.current_billing_period.ends_at}`);
    console.log(`   Days until renewal: ${daysUntilRenewal}`);

    return NextResponse.json({
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
    });

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