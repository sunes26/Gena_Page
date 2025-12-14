// app/api/webhooks/paddle/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';
import { getPaddleSubscription } from '@/lib/paddle-server';
import { verifyWebhookSignature, logWebhookFailure } from '@/lib/paddle-webhook';
import {
  logSubscriptionCreated,
  logSubscriptionUpdated,
  logSubscriptionCanceled,
  logSubscriptionResumed,
  logPaymentCompleted,
  logPaymentFailed,
  logPaymentRefunded,
  logPlanUpgraded,
  logPlanDowngraded,
} from '@/lib/audit';

type PaddleEventType =
  | 'subscription.created'
  | 'subscription.updated'
  | 'subscription.canceled'
  | 'subscription.past_due'
  | 'subscription.paused'
  | 'subscription.resumed'
  | 'transaction.completed'
  | 'transaction.updated'
  | 'transaction.payment_failed'
  | 'transaction.refunded';

// ✅ any 타입 제거 - Paddle 이벤트 데이터 타입 정의
interface PaddleWebhookPayload {
  event_id: string;
  event_type: PaddleEventType;
  occurred_at: string;
  data: Record<string, unknown>;
}

// Paddle 구독 데이터 타입 가드
interface PaddleSubscriptionData {
  id: string;
  customer_id: string;
  status: string;
  custom_data?: Record<string, unknown>;
  current_billing_period: {
    ends_at: string;
  };
  next_billed_at?: string;
  scheduled_change?: {
    action: string;
  };
  items: Array<{
    price?: {
      id?: string;
      unit_price?: {
        amount?: number;
        currency_code?: string;
      };
    };
  }>;
}

// Paddle 트랜잭션 데이터 타입 가드
interface PaddleTransactionData {
  id: string;
  customer_id: string;
  subscription_id?: string;
  custom_data?: Record<string, unknown>;
  currency_code: string;
  payment_method_type?: string;
  status?: string;
  billed_at: string;
  details?: {
    totals?: {
      total?: number;
    };
  };
}

// 타입 가드 함수
function isPaddleSubscriptionData(data: unknown): data is PaddleSubscriptionData {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.id === 'string' &&
    typeof d.customer_id === 'string' &&
    typeof d.status === 'string' &&
    typeof d.current_billing_period === 'object' &&
    d.current_billing_period !== null &&
    Array.isArray(d.items)
  );
}

function isPaddleTransactionData(data: unknown): data is PaddleTransactionData {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.id === 'string' &&
    typeof d.customer_id === 'string' &&
    typeof d.currency_code === 'string' &&
    typeof d.billed_at === 'string'
  );
}

/**
 * 웹훅 이벤트 중복 처리 방지 (Transaction 기반)
 *
 * @returns true: 처리 가능 (첫 처리), false: 이미 처리됨 (중복)
 */
async function tryMarkEventAsProcessed(
  eventId: string,
  eventType: string
): Promise<boolean> {
  const db = getAdminFirestore();
  const eventRef = db.collection('processed_webhook_events').doc(eventId);

  try {
    // Firestore Transaction으로 atomic하게 체크 & 저장
    await db.runTransaction(async (transaction) => {
      const eventDoc = await transaction.get(eventRef);

      // 이미 처리된 이벤트면 에러 throw
      if (eventDoc.exists) {
        throw new Error('Event already processed');
      }

      // 처음 처리하는 이벤트면 저장
      transaction.set(eventRef, {
        eventId,
        eventType,
        processedAt: Timestamp.now(),
        expiresAt: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
      });
    });

    // Transaction 성공 = 처음 처리하는 이벤트
    console.log(`✅ Event marked as processed: ${eventId}`);
    return true;
  } catch (error) {
    // Transaction 실패 = 이미 처리된 이벤트 (중복)
    if (error instanceof Error && error.message === 'Event already processed') {
      console.log(`⚠️ Duplicate webhook ignored: ${eventId}`);
      return false;
    }

    // 다른 에러는 재시도를 위해 throw
    console.error(`❌ Failed to mark event as processed: ${eventId}`, error);
    throw error;
  }
}

// ✅ any 타입 제거 - customData 타입 정의
function extractUserId(customData: Record<string, unknown> | null | undefined): string | null {
  if (!customData) return null;
  if (typeof customData.user_id === 'string') return customData.user_id;
  if (typeof customData.userId === 'string') return customData.userId;
  return null;
}

/**
 * ✅ Security: Validate that userId exists in Firestore
 * Prevents webhook injection attacks where an attacker provides a fake userId
 */
async function validateUserExists(userId: string): Promise<boolean> {
  const db = getAdminFirestore();
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    return userDoc.exists;
  } catch (error) {
    console.error('Error validating user existence:', error);
    return false;
  }
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
 *
 * N+1 쿼리 최적화:
 * - 오늘 이후만 업데이트 (과거 데이터는 이미 확정됨)
 * - 최대 90일로 제한 (3개월)
 * - 배치 크기 제한 (Firestore 500개 제한)
 */
async function updateDailyPremiumStatus(
  userId: string,
  isPremium: boolean,
  fromDate?: string
): Promise<void> {
  try {
    const db = getAdminFirestore();
    const today = new Date().toISOString().split('T')[0];

    // ✅ 최적화: 오늘 이후만 업데이트 (과거는 변경 불필요)
    const startDate = fromDate && fromDate > today ? fromDate : today;

    // ✅ 서브컬렉션 경로: /users/{userId}/daily
    const dailyRef = db
      .collection('users')
      .doc(userId)
      .collection('daily');

    // ✅ 최적화: 최대 90일로 제한 (N+1 쿼리 방지)
    const dailySnapshot = await dailyRef
      .where('date', '>=', startDate)
      .limit(90)
      .get();

    if (dailySnapshot.empty) {
      console.log(`No daily docs to update for user ${userId} (from ${startDate})`);
      return;
    }

    // ✅ 경고: 문서 수가 너무 많으면 로그
    if (dailySnapshot.size >= 90) {
      console.warn(`⚠️ Daily docs limit reached (${dailySnapshot.size}) for user ${userId}`);
    }

    // ✅ 최적화: Firestore 배치는 500개 제한
    const batchSize = 500;
    const docs = dailySnapshot.docs;

    for (let i = 0; i < docs.length; i += batchSize) {
      const batch = db.batch();
      const chunk = docs.slice(i, i + batchSize);

      chunk.forEach(doc => {
        batch.update(doc.ref, { isPremium, updatedAt: Timestamp.now() });
      });

      await batch.commit();
      console.log(`✅ Updated ${chunk.length} daily docs (batch ${Math.floor(i / batchSize) + 1})`);
    }

    console.log(`✅ Total updated: ${dailySnapshot.size} daily docs for user ${userId}`);
  } catch (error) {
    console.error('Failed to update daily stats:', error);
  }
}

/**
 * ✅ Paddle API에서 최신 구독 정보를 가져와 Firestore 업데이트
 */
async function syncSubscriptionFromPaddle(
  paddleSubscriptionId: string
): Promise<void> {
  try {
    console.log(`🔄 Syncing subscription from Paddle: ${paddleSubscriptionId}`);
    
    // Paddle API에서 최신 구독 정보 가져오기
    const paddleSubscription = await getPaddleSubscription(paddleSubscriptionId);
    
    const db = getAdminFirestore();
    
    // Firestore에서 구독 문서 찾기
    const subscriptionsSnapshot = await db
      .collection('subscription')
      .where('paddleSubscriptionId', '==', paddleSubscriptionId)
      .limit(1)
      .get();

    if (subscriptionsSnapshot.empty) {
      console.warn(`Subscription not found in Firestore: ${paddleSubscriptionId}`);
      return;
    }

    const subscriptionDoc = subscriptionsSnapshot.docs[0];
    const userId = subscriptionDoc.data().userId;

    // ✅ Firestore 업데이트
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

    // 가격 정보가 있으면 업데이트
    if (paddleSubscription.items && paddleSubscription.items.length > 0) {
      const firstItem = paddleSubscription.items[0];
      updateData.priceId = firstItem.price?.id || '';
      updateData.price = firstItem.price?.unit_price?.amount || 0;
      updateData.currency = firstItem.price?.unit_price?.currency_code || 'KRW';
    }

    await subscriptionDoc.ref.update(updateData);

    console.log(`✅ Subscription synced from Paddle: ${paddleSubscriptionId}`);
    console.log(`   Current Period End: ${paddleSubscription.current_billing_period.ends_at}`);

    // users 컬렉션도 업데이트
    if (paddleSubscription.status === 'active' || paddleSubscription.status === 'trialing') {
      await updateUserProfile(userId, {
        isPremium: true,
        subscriptionPlan: 'pro',
      });
      await updateDailyPremiumStatus(userId, true);
    }
  } catch (error) {
    console.error('Failed to sync subscription from Paddle:', error);
    throw error;
  }
}

/**
 * subscription.created 이벤트 처리
 */
async function handleSubscriptionCreated(data: unknown): Promise<void> {
  if (!isPaddleSubscriptionData(data)) {
    throw new Error('Invalid subscription data format');
  }

  const db = getAdminFirestore();
  const userId = extractUserId(data.custom_data);

  if (!userId) {
    console.error('No userId in custom_data:', data.custom_data);
    throw new Error('Missing userId in subscription data');
  }

  // ✅ Security: Validate userId exists in Firestore
  const userExists = await validateUserExists(userId);
  if (!userExists) {
    console.error('userId does not exist in Firestore:', userId);
    throw new Error('Invalid userId: user not found');
  }

  console.log(`✅ userId validated: ${userId}`);

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

  // ✅ Phase 3-1: Audit logging
  await logSubscriptionCreated(userId, data.id, {
    plan: 'pro',
    status: data.status,
    price: subscriptionData.price,
    currency: subscriptionData.currency,
    priceId: subscriptionData.priceId,
  }).catch((err) => {
    console.error('Failed to log audit trail:', err);
  });

  console.log(`✅ Subscription created for user ${userId}`);
}

/**
 * subscription.updated 이벤트 처리
 */
async function handleSubscriptionUpdated(data: unknown): Promise<void> {
  if (!isPaddleSubscriptionData(data)) {
    throw new Error('Invalid subscription data format');
  }

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

  // ✅ Phase 1-3: 플랜 변경 감지
  const oldPriceId = subscriptionData.priceId || '';
  const newPriceId = data.items[0]?.price?.id || '';
  const oldPrice = subscriptionData.price || 0;
  const newPrice = data.items[0]?.price?.unit_price?.amount || 0;

  // 1. subscription 컬렉션 업데이트
  const updateData: Record<string, unknown> = {
    status: data.status,
    currentPeriodEnd: Timestamp.fromDate(new Date(data.current_billing_period.ends_at)),
    nextBillingDate: data.next_billed_at
      ? Timestamp.fromDate(new Date(data.next_billed_at))
      : null,
    cancelAtPeriodEnd: data.scheduled_change?.action === 'cancel',
    price: newPrice,
    currency: data.items[0]?.price?.unit_price?.currency_code || 'KRW',
    priceId: newPriceId,
    updatedAt: Timestamp.now(),
  };

  await subscriptionDoc.ref.update(updateData);

  // ✅ Phase 1-3: 플랜 변경 로깅
  if (oldPriceId && newPriceId && oldPriceId !== newPriceId) {
    const changeType = parseFloat(newPrice.toString()) > parseFloat(oldPrice.toString())
      ? 'upgrade'
      : 'downgrade';

    const planChangeData = {
      userId,
      subscriptionId: data.id,
      paddleSubscriptionId: data.id,
      changeType,
      oldPriceId,
      newPriceId,
      oldPrice,
      newPrice,
      currency: data.items[0]?.price?.unit_price?.currency_code || 'KRW',
      changedAt: Timestamp.now(),
      effectiveAt: (data.current_billing_period as { starts_at?: string; ends_at: string })?.starts_at
        ? Timestamp.fromDate(new Date((data.current_billing_period as { starts_at?: string; ends_at: string }).starts_at!))
        : Timestamp.now(),
      status: data.status,
    };

    await db.collection('plan_changes').add(planChangeData);

    // ✅ Phase 3-1: Audit logging for plan changes
    if (changeType === 'upgrade') {
      await logPlanUpgraded(
        userId,
        data.id,
        { priceId: oldPriceId, price: parseFloat(oldPrice.toString()) },
        { priceId: newPriceId, price: parseFloat(newPrice.toString()) }
      ).catch((err) => {
        console.error('Failed to log plan upgrade audit:', err);
      });
    } else {
      await logPlanDowngraded(
        userId,
        data.id,
        { priceId: oldPriceId, price: parseFloat(oldPrice.toString()) },
        { priceId: newPriceId, price: parseFloat(newPrice.toString()) }
      ).catch((err) => {
        console.error('Failed to log plan downgrade audit:', err);
      });
    }

    console.log(`🔄 Plan ${changeType} detected: ${data.id}`);
    console.log(`   Old Price: ${oldPrice} (${oldPriceId})`);
    console.log(`   New Price: ${newPrice} (${newPriceId})`);
  }

  // ✅ Phase 3-1: Audit logging for subscription update (non-plan-change)
  await logSubscriptionUpdated(
    userId,
    data.id,
    {
      status: subscriptionData.status,
      price: oldPrice,
      priceId: oldPriceId,
    },
    {
      status: data.status,
      price: newPrice,
      priceId: newPriceId,
    }
  ).catch((err) => {
    console.error('Failed to log subscription update audit:', err);
  });

  console.log(`✅ Subscription updated: ${data.id}`);
  console.log(`   Status: ${data.status}`);
  console.log(`   Current Period End: ${data.current_billing_period.ends_at}`);
  console.log(`   Next Billing Date: ${data.next_billed_at}`);

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
}

/**
 * subscription.canceled 이벤트 처리
 */
async function handleSubscriptionCanceled(data: unknown): Promise<void> {
  if (!isPaddleSubscriptionData(data)) {
    throw new Error('Invalid subscription data format');
  }

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
  const updateData: Record<string, unknown> = {
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

  // ✅ Phase 3-1: Audit logging for subscription cancellation
  await logSubscriptionCanceled(
    userId,
    data.id,
    { type: 'webhook', id: 'paddle' },
    {
      status: data.status,
      immediatelyCanceled: data.scheduled_change?.action !== 'cancel',
      canceledAt: new Date().toISOString(),
    }
  ).catch((err) => {
    console.error('Failed to log subscription canceled audit:', err);
  });

  console.log(`✅ Subscription canceled: ${data.id}`);
}

/**
 * subscription.past_due 이벤트 처리
 */
async function handleSubscriptionPastDue(data: unknown): Promise<void> {
  if (!isPaddleSubscriptionData(data)) {
    throw new Error('Invalid subscription data format');
  }

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
async function handleSubscriptionPaused(data: unknown): Promise<void> {
  if (!isPaddleSubscriptionData(data)) {
    throw new Error('Invalid subscription data format');
  }

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
async function handleSubscriptionResumed(data: unknown): Promise<void> {
  if (!isPaddleSubscriptionData(data)) {
    throw new Error('Invalid subscription data format');
  }

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

  // ✅ Phase 3-1: Audit logging for subscription resumption
  await logSubscriptionResumed(
    userId,
    data.id,
    { type: 'webhook', id: 'paddle' },
    {
      status: data.status,
      resumedAt: new Date().toISOString(),
    }
  ).catch((err) => {
    console.error('Failed to log subscription resumed audit:', err);
  });

  console.log(`✅ Subscription resumed: ${data.id}`);
}

/**
 * ✅ transaction.completed 이벤트 처리 (개선됨)
 * 구독 갱신 결제 완료 시 Paddle API에서 최신 구독 정보를 가져와 동기화
 */
async function handleTransactionCompleted(data: unknown): Promise<void> {
  if (!isPaddleTransactionData(data)) {
    throw new Error('Invalid transaction data format');
  }

  const db = getAdminFirestore();
  const userId = extractUserId(data.custom_data);

  if (!userId) {
    console.error('No userId in transaction custom_data:', data.custom_data);
    return;
  }

  // ✅ Security: Validate userId exists in Firestore
  const userExists = await validateUserExists(userId);
  if (!userExists) {
    console.error('userId does not exist in Firestore:', userId);
    throw new Error('Invalid userId: user not found');
  }

  console.log(`✅ userId validated: ${userId}`);

  // 1. 결제 기록 저장
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

  // ✅ Phase 3-1: Audit logging for payment
  await logPaymentCompleted(
    userId,
    data.id,
    data.subscription_id || null,
    {
      amount: paymentData.amount,
      currency: paymentData.currency,
      method: paymentData.method,
    }
  ).catch((err) => {
    console.error('Failed to log payment completed audit:', err);
  });

  console.log(`✅ Transaction completed: ${data.id} for user ${userId}`);

  // 2. ✅ 구독 관련 결제인 경우 Paddle API에서 최신 구독 정보 동기화
  if (data.subscription_id) {
    try {
      console.log(`🔄 Syncing subscription after payment: ${data.subscription_id}`);
      await syncSubscriptionFromPaddle(data.subscription_id);
      console.log(`✅ Subscription synced successfully after payment`);

      // ✅ Phase 2-1: 구독 검증 - Firestore에 구독이 제대로 생성되었는지 확인
      const subscriptionSnapshot = await db
        .collection('subscription')
        .where('paddleSubscriptionId', '==', data.subscription_id)
        .limit(1)
        .get();

      if (!subscriptionSnapshot.empty) {
        const subscriptionDoc = subscriptionSnapshot.docs[0];
        const subscriptionData = subscriptionDoc.data();

        // 구독 검증 성공 로그
        const verificationData = {
          userId,
          transactionId: data.id,
          subscriptionId: data.subscription_id,
          paddleSubscriptionId: data.subscription_id,
          firestoreSubscriptionId: subscriptionDoc.id,
          subscriptionStatus: subscriptionData.status,
          verifiedAt: Timestamp.now(),
          verificationResult: 'success',
          message: 'Subscription successfully created and verified after payment',
        };

        await db.collection('payment_verifications').add(verificationData);
        console.log(`✅ Payment verification successful: Subscription ${data.subscription_id} exists in Firestore`);
      } else {
        // 구독이 없음 - 경고 로그
        const verificationData = {
          userId,
          transactionId: data.id,
          subscriptionId: data.subscription_id,
          paddleSubscriptionId: data.subscription_id,
          verifiedAt: Timestamp.now(),
          verificationResult: 'failed',
          message: 'Subscription not found in Firestore after payment and sync',
          severity: 'high',
        };

        await db.collection('payment_verifications').add(verificationData);
        console.error(`⚠️ Payment verification failed: Subscription ${data.subscription_id} not found in Firestore after sync`);
      }
    } catch (error) {
      console.error('❌ Failed to sync subscription after payment:', error);

      // ✅ Phase 2-1: 동기화 실패 로그
      const verificationData = {
        userId,
        transactionId: data.id,
        subscriptionId: data.subscription_id,
        paddleSubscriptionId: data.subscription_id,
        verifiedAt: Timestamp.now(),
        verificationResult: 'error',
        message: `Failed to sync subscription: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'high',
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
        } : { message: 'Unknown error' },
      };

      await db.collection('payment_verifications').add(verificationData);
      // 에러가 나도 계속 진행 (나중에 subscription.updated 이벤트로 복구됨)
    }
  }
}

/**
 * transaction.payment_failed 이벤트 처리
 */
async function handleTransactionPaymentFailed(data: unknown): Promise<void> {
  if (!isPaddleTransactionData(data)) {
    throw new Error('Invalid transaction data format');
  }

  const db = getAdminFirestore();
  const userId = extractUserId(data.custom_data);

  if (!userId) {
    console.error('No userId in transaction custom_data:', data.custom_data);
    return;
  }

  // ✅ Security: Validate userId exists in Firestore
  const userExists = await validateUserExists(userId);
  if (!userExists) {
    console.error('userId does not exist in Firestore:', userId);
    throw new Error('Invalid userId: user not found');
  }

  console.log(`✅ userId validated: ${userId}`);

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

  // ✅ Phase 3-1: Audit logging for payment failure
  await logPaymentFailed(
    userId,
    data.id,
    data.subscription_id || null,
    {
      amount: paymentData.amount,
      currency: paymentData.currency,
      method: paymentData.method,
      failureReason: paymentData.failureReason,
    }
  ).catch((err) => {
    console.error('Failed to log payment failed audit:', err);
  });

  console.log(`❌ Transaction payment failed: ${data.id} for user ${userId}`);
}

/**
 * ✅ transaction.refunded 이벤트 처리
 */
async function handleTransactionRefunded(data: unknown): Promise<void> {
  if (!isPaddleTransactionData(data)) {
    throw new Error('Invalid transaction data format');
  }

  const db = getAdminFirestore();
  const userId = extractUserId(data.custom_data);

  if (!userId) {
    console.error('No userId in transaction custom_data:', data.custom_data);
    return;
  }

  // ✅ Security: Validate userId exists in Firestore
  const userExists = await validateUserExists(userId);
  if (!userExists) {
    console.error('userId does not exist in Firestore:', userId);
    throw new Error('Invalid userId: user not found');
  }

  console.log(`✅ userId validated: ${userId}`);

  // 환불 기록 저장
  const refundData = {
    userId,
    transactionId: data.id,
    subscriptionId: data.subscription_id || null,
    customerId: data.customer_id,
    amount: data.details?.totals?.total || 0,
    currency: data.currency_code,
    refundedAt: Timestamp.now(),
    originalTransaction: data.id,
    status: data.status || 'refunded',
    createdAt: Timestamp.now(),
  };

  await db.collection('refunds').add(refundData);

  // payments 컬렉션도 업데이트 (있으면)
  const paymentRef = db.collection('payments').doc(data.id);
  const paymentDoc = await paymentRef.get();

  if (paymentDoc.exists) {
    await paymentRef.update({
      status: 'refunded',
      refundedAt: Timestamp.now(),
    });
  }

  // ✅ Phase 3-1: Audit logging for refund
  await logPaymentRefunded(
    userId,
    data.id,
    data.subscription_id || null,
    {
      amount: refundData.amount,
      currency: refundData.currency,
      status: refundData.status,
    }
  ).catch((err) => {
    console.error('Failed to log payment refunded audit:', err);
  });

  console.log(`💰 Transaction refunded: ${data.id} for user ${userId}`);
  console.log(`   Amount: ${refundData.amount} ${refundData.currency}`);

  // TODO: 사용자에게 환불 알림 이메일 발송 (선택사항)
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

    // Paddle 시그니처 검증 (타임스탬프 검증 포함 - 5분 이내)
    const isValid = verifyWebhookSignature(signatureHeader, rawBody, webhookSecret);

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

    // ✅ Transaction 기반 중복 처리 방지
    const canProcess = await tryMarkEventAsProcessed(event_id, event_type);

    if (!canProcess) {
      // 이미 처리된 이벤트 (중복 웹훅)
      return NextResponse.json({
        success: true,
        message: 'Duplicate event ignored',
        eventId: event_id,
      });
    }

    // 처음 처리하는 이벤트 - 핸들러 실행
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

        case 'transaction.refunded':
          await handleTransactionRefunded(data);
          break;

        default:
          console.log(`ℹ️ Unhandled event type: ${event_type}`);
      }

      // ✅ 이미 tryMarkEventAsProcessed에서 저장됨 - markEventAsProcessed 호출 불필요

      return NextResponse.json({
        success: true,
        message: 'Webhook processed successfully',
        eventId: event_id,
        eventType: event_type,
      });

    } catch (processingError) {
      console.error('Error processing webhook:', processingError);

      // ✅ 웹훅 실패 영구 로깅
      if (processingError instanceof Error) {
        await logWebhookFailure(payload, processingError, {
          attemptedHandler: event_type,
          timestamp: new Date().toISOString(),
        }).catch(logErr => {
          console.error('Failed to log webhook failure:', logErr);
        });
      }

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