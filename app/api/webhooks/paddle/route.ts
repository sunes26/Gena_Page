// app/api/webhooks/paddle/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';
import crypto from 'crypto';

/**
 * Paddle 웹훅 시그니처 검증
 * Paddle v2는 "ts=timestamp;h1=signature" 형식으로 보냅니다
 */
function verifyPaddleWebhook(
  signatureHeader: string,
  requestBody: string,
  secret: string
): boolean {
  try {
    // Paddle 시그니처 헤더 파싱: "ts=1234567890;h1=signature_value"
    const signatureParts: { [key: string]: string } = {};
    signatureHeader.split(';').forEach(part => {
      const [key, value] = part.split('=');
      if (key && value) {
        signatureParts[key.trim()] = value.trim();
      }
    });

    const timestamp = signatureParts['ts'];
    const signature = signatureParts['h1'];

    if (!timestamp || !signature) {
      console.error('Invalid signature format:', signatureHeader);
      return false;
    }

    // Paddle이 서명하는 내용: timestamp + ':' + request body
    const signedPayload = timestamp + ':' + requestBody;

    // HMAC SHA256으로 서명 생성
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(signedPayload);
    const expectedSignature = hmac.digest('hex');

    // 길이가 다르면 false 반환 (timingSafeEqual 에러 방지)
    if (signature.length !== expectedSignature.length) {
      console.error('Signature length mismatch:', {
        received: signature.length,
        expected: expectedSignature.length
      });
      return false;
    }

    // 타이밍 공격 방지를 위한 안전한 비교
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

type PaddleEventType =
  | 'subscription.created'
  | 'subscription.updated'
  | 'subscription.canceled'
  | 'subscription.past_due'
  | 'subscription.paused'
  | 'subscription.resumed'
  | 'transaction.completed'
  | 'transaction.updated'
  | 'transaction.payment_failed';

interface PaddleWebhookPayload {
  event_id: string;
  event_type: PaddleEventType;
  occurred_at: string;
  data: any;
}

async function isEventProcessed(eventId: string): Promise<boolean> {
  const db = getAdminFirestore();
  const eventDoc = await db.collection('processed_webhook_events').doc(eventId).get();
  return eventDoc.exists;
}

async function markEventAsProcessed(eventId: string, eventType: string): Promise<void> {
  const db = getAdminFirestore();
  await db.collection('processed_webhook_events').doc(eventId).set({
    eventId,
    eventType,
    processedAt: Timestamp.now(),
    expiresAt: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
  });
}

function extractUserId(customData: any): string | null {
  if (!customData) return null;
  return customData.user_id || customData.userId || null;
}

/**
 * ✅ users 컬렉션 업데이트
 */
async function updateUserProfile(
  userId: string,
  updates: {
    isPremium?: boolean;
    subscriptionPlan?: 'free' | 'pro';
  }
): Promise<void> {
  try {
    const db = getAdminFirestore();
    const userRef = db.collection('users').doc(userId);
    
    await userRef.update({
      ...updates,
      updatedAt: Timestamp.now(),
    });
    
    console.log(`✅ User profile updated: ${userId}`, updates);
  } catch (error) {
    console.error('Failed to update user profile:', error);
    // 에러가 나도 계속 진행
  }
}

/**
 * ✅ daily 컬렉션 일괄 업데이트 (서브컬렉션)
 */
async function updateDailyPremiumStatus(
  userId: string,
  isPremium: boolean,
  fromDate?: string
): Promise<void> {
  try {
    const db = getAdminFirestore();
    const today = new Date().toISOString().split('T')[0];
    const startDate = fromDate || today;
    
    // ✅ 서브컬렉션 경로: /users/{userId}/daily
    const dailyRef = db
      .collection('users')
      .doc(userId)
      .collection('daily');
    
    const dailySnapshot = await dailyRef
      .where('date', '>=', startDate)
      .get();

    if (dailySnapshot.empty) {
      console.log(`No daily docs to update for user ${userId}`);
      return;
    }

    const batch = db.batch();
    dailySnapshot.docs.forEach(doc => {
      batch.update(doc.ref, { isPremium });
    });
    
    await batch.commit();
    console.log(`✅ Updated ${dailySnapshot.size} daily docs for user ${userId}`);
  } catch (error) {
    console.error('Failed to update daily stats:', error);
  }
}

/**
 * subscription.created 이벤트 처리
 */
async function handleSubscriptionCreated(data: any): Promise<void> {
  const db = getAdminFirestore();
  const userId = extractUserId(data.custom_data);

  if (!userId) {
    console.error('No userId in custom_data:', data.custom_data);
    throw new Error('Missing userId in subscription data');
  }

  // 1. subscription 컬렉션에 저장
  const subscriptionData = {
    userId,
    paddleSubscriptionId: data.id,
    paddleCustomerId: data.customer_id,
    plan: 'pro' as const,
    status: data.status,
    currentPeriodEnd: Timestamp.fromDate(new Date(data.current_billing_period.ends_at)),
    nextBillingDate: data.next_billed_at
      ? Timestamp.fromDate(new Date(data.next_billed_at))
      : null,
    cancelAtPeriodEnd: data.scheduled_change?.action === 'cancel',
    price: data.items[0]?.price?.unit_price?.amount || 0,
    currency: data.items[0]?.price?.unit_price?.currency_code || 'KRW',
    priceId: data.items[0]?.price?.id || '',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  await db.collection('subscription').add(subscriptionData);

  // 2. ✅ users 컬렉션 업데이트
  await updateUserProfile(userId, {
    isPremium: true,
    subscriptionPlan: 'pro',
  });

  // 3. ✅ daily 컬렉션 업데이트 (서브컬렉션)
  await updateDailyPremiumStatus(userId, true);

  console.log(`✅ Subscription created for user ${userId}`);
}

/**
 * subscription.updated 이벤트 처리
 */
async function handleSubscriptionUpdated(data: any): Promise<void> {
  const db = getAdminFirestore();

  const subscriptionsSnapshot = await db
    .collection('subscription')
    .where('paddleSubscriptionId', '==', data.id)
    .limit(1)
    .get();

  if (subscriptionsSnapshot.empty) {
    console.warn(`Subscription not found: ${data.id}`);
    return;
  }

  const subscriptionDoc = subscriptionsSnapshot.docs[0];
  const subscriptionData = subscriptionDoc.data();
  const userId = subscriptionData.userId;

  // 1. subscription 컬렉션 업데이트
  const updateData: any = {
    status: data.status,
    currentPeriodEnd: Timestamp.fromDate(new Date(data.current_billing_period.ends_at)),
    nextBillingDate: data.next_billed_at
      ? Timestamp.fromDate(new Date(data.next_billed_at))
      : null,
    cancelAtPeriodEnd: data.scheduled_change?.action === 'cancel',
    price: data.items[0]?.price?.unit_price?.amount || 0,
    currency: data.items[0]?.price?.unit_price?.currency_code || 'KRW',
    priceId: data.items[0]?.price?.id || '',
    updatedAt: Timestamp.now(),
  };

  await subscriptionDoc.ref.update(updateData);

  // 2. ✅ users 컬렉션 업데이트 (상태에 따라)
  if (data.status === 'active' || data.status === 'trialing') {
    await updateUserProfile(userId, {
      isPremium: true,
      subscriptionPlan: 'pro',
    });
    await updateDailyPremiumStatus(userId, true);
  } else if (data.status === 'past_due' || data.status === 'paused') {
    await updateUserProfile(userId, {
      isPremium: false,
    });
    await updateDailyPremiumStatus(userId, false);
  }

  console.log(`✅ Subscription updated: ${data.id}`);
}

/**
 * subscription.canceled 이벤트 처리
 */
async function handleSubscriptionCanceled(data: any): Promise<void> {
  const db = getAdminFirestore();

  const subscriptionsSnapshot = await db
    .collection('subscription')
    .where('paddleSubscriptionId', '==', data.id)
    .limit(1)
    .get();

  if (subscriptionsSnapshot.empty) {
    console.warn(`Subscription not found: ${data.id}`);
    return;
  }

  const subscriptionDoc = subscriptionsSnapshot.docs[0];
  const subscriptionData = subscriptionDoc.data();
  const userId = subscriptionData.userId;

  // 1. subscription 컬렉션 업데이트
  const updateData: any = {
    status: 'canceled',
    cancelAtPeriodEnd: true,
    canceledAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  await subscriptionDoc.ref.update(updateData);

  // 2. ✅ 즉시 취소인 경우 users 업데이트
  if (data.scheduled_change?.action !== 'cancel') {
    await updateUserProfile(userId, {
      isPremium: false,
      subscriptionPlan: 'free',
    });
    await updateDailyPremiumStatus(userId, false);
  }

  console.log(`✅ Subscription canceled: ${data.id}`);
}

/**
 * subscription.past_due 이벤트 처리
 */
async function handleSubscriptionPastDue(data: any): Promise<void> {
  const db = getAdminFirestore();

  const subscriptionsSnapshot = await db
    .collection('subscription')
    .where('paddleSubscriptionId', '==', data.id)
    .limit(1)
    .get();

  if (subscriptionsSnapshot.empty) {
    console.warn(`Subscription not found: ${data.id}`);
    return;
  }

  const subscriptionDoc = subscriptionsSnapshot.docs[0];
  const userId = subscriptionDoc.data().userId;

  await subscriptionDoc.ref.update({
    status: 'past_due',
    updatedAt: Timestamp.now(),
  });

  // ✅ users 업데이트
  await updateUserProfile(userId, {
    isPremium: false,
  });

  console.log(`✅ Subscription past_due: ${data.id}`);
}

/**
 * subscription.paused 이벤트 처리
 */
async function handleSubscriptionPaused(data: any): Promise<void> {
  const db = getAdminFirestore();

  const subscriptionsSnapshot = await db
    .collection('subscription')
    .where('paddleSubscriptionId', '==', data.id)
    .limit(1)
    .get();

  if (subscriptionsSnapshot.empty) {
    console.warn(`Subscription not found: ${data.id}`);
    return;
  }

  const subscriptionDoc = subscriptionsSnapshot.docs[0];
  const userId = subscriptionDoc.data().userId;

  await subscriptionDoc.ref.update({
    status: 'paused',
    updatedAt: Timestamp.now(),
  });

  // ✅ users 업데이트
  await updateUserProfile(userId, {
    isPremium: false,
  });

  console.log(`✅ Subscription paused: ${data.id}`);
}

/**
 * subscription.resumed 이벤트 처리
 */
async function handleSubscriptionResumed(data: any): Promise<void> {
  const db = getAdminFirestore();

  const subscriptionsSnapshot = await db
    .collection('subscription')
    .where('paddleSubscriptionId', '==', data.id)
    .limit(1)
    .get();

  if (subscriptionsSnapshot.empty) {
    console.warn(`Subscription not found: ${data.id}`);
    return;
  }

  const subscriptionDoc = subscriptionsSnapshot.docs[0];
  const userId = subscriptionDoc.data().userId;

  await subscriptionDoc.ref.update({
    status: 'active',
    cancelAtPeriodEnd: false,
    canceledAt: null,
    updatedAt: Timestamp.now(),
  });

  // ✅ users 업데이트
  await updateUserProfile(userId, {
    isPremium: true,
    subscriptionPlan: 'pro',
  });

  await updateDailyPremiumStatus(userId, true);

  console.log(`✅ Subscription resumed: ${data.id}`);
}

/**
 * transaction.completed 이벤트 처리
 */
async function handleTransactionCompleted(data: any): Promise<void> {
  const db = getAdminFirestore();
  const userId = extractUserId(data.custom_data);

  if (!userId) {
    console.error('No userId in transaction custom_data:', data.custom_data);
    return;
  }

  const paymentData = {
    userId,
    transactionId: data.id,
    subscriptionId: data.subscription_id || null,
    customerId: data.customer_id,
    amount: data.details?.totals?.total || 0,
    currency: data.currency_code,
    status: 'completed',
    method: data.payment_method_type || 'card',
    paidAt: Timestamp.fromDate(new Date(data.billed_at)),
    createdAt: Timestamp.now(),
  };

  await db.collection('payments').doc(data.id).set(paymentData);

  console.log(`✅ Transaction completed: ${data.id} for user ${userId}`);
}

/**
 * transaction.payment_failed 이벤트 처리
 */
async function handleTransactionPaymentFailed(data: any): Promise<void> {
  const db = getAdminFirestore();
  const userId = extractUserId(data.custom_data);

  if (!userId) {
    console.error('No userId in transaction custom_data:', data.custom_data);
    return;
  }

  const paymentData = {
    userId,
    transactionId: data.id,
    subscriptionId: data.subscription_id || null,
    customerId: data.customer_id,
    amount: data.details?.totals?.total || 0,
    currency: data.currency_code,
    status: 'failed',
    method: data.payment_method_type || 'card',
    failureReason: data.status || 'payment_failed',
    createdAt: Timestamp.now(),
  };

  await db.collection('payments').doc(data.id).set(paymentData);

  console.log(`❌ Transaction payment failed: ${data.id} for user ${userId}`);
}

/**
 * Paddle 웹훅 핸들러
 * POST /api/webhooks/paddle
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();

    const signatureHeader = request.headers.get('paddle-signature');
    const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;

    // 🔍 디버깅: 웹훅 요청 정보 로깅
    console.log('📨 Paddle webhook received');
    console.log('Signature header:', signatureHeader);
    console.log('Body length:', rawBody.length);
    console.log('Has webhook secret:', !!webhookSecret);

    if (!webhookSecret) {
      console.error('PADDLE_WEBHOOK_SECRET is not set');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    if (!signatureHeader) {
      console.error('Missing Paddle signature');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      );
    }

    // Paddle 시그니처 검증
    const isValid = verifyPaddleWebhook(signatureHeader, rawBody, webhookSecret);

    if (!isValid) {
      console.error('Invalid Paddle signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    let payload: PaddleWebhookPayload;
    try {
      payload = JSON.parse(rawBody);
    } catch (error) {
      console.error('Failed to parse webhook payload:', error);
      return NextResponse.json(
        { error: 'Invalid JSON' },
        { status: 400 }
      );
    }

    const { event_id, event_type, data } = payload;

    console.log(`📨 Paddle webhook received: ${event_type} (${event_id})`);

    const alreadyProcessed = await isEventProcessed(event_id);

    if (alreadyProcessed) {
      console.log(`⏭️ Event already processed: ${event_id}`);
      return NextResponse.json({ 
        success: true, 
        message: 'Event already processed' 
      });
    }

    try {
      switch (event_type) {
        case 'subscription.created':
          await handleSubscriptionCreated(data);
          break;

        case 'subscription.updated':
          await handleSubscriptionUpdated(data);
          break;

        case 'subscription.canceled':
          await handleSubscriptionCanceled(data);
          break;

        case 'subscription.past_due':
          await handleSubscriptionPastDue(data);
          break;

        case 'subscription.paused':
          await handleSubscriptionPaused(data);
          break;

        case 'subscription.resumed':
          await handleSubscriptionResumed(data);
          break;

        case 'transaction.completed':
          await handleTransactionCompleted(data);
          break;

        case 'transaction.payment_failed':
          await handleTransactionPaymentFailed(data);
          break;

        default:
          console.log(`ℹ️ Unhandled event type: ${event_type}`);
      }

      await markEventAsProcessed(event_id, event_type);

      return NextResponse.json({
        success: true,
        message: 'Webhook processed successfully',
        eventId: event_id,
        eventType: event_type,
      });

    } catch (processingError) {
      console.error('Error processing webhook:', processingError);
      
      return NextResponse.json(
        {
          error: 'Failed to process webhook',
          details: processingError instanceof Error ? processingError.message : 'Unknown error',
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Paddle webhook endpoint is active',
    timestamp: new Date().toISOString(),
  });
}