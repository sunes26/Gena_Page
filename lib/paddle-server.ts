// lib/paddle-server.ts
/**
 * 서버 사이드 Paddle API 유틸리티
 * Paddle Billing API를 사용하여 서버에서 구독 관리
 */

const PADDLE_API_KEY = process.env.PADDLE_API_KEY || '';
const PADDLE_ENVIRONMENT = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT || 'sandbox';

// Paddle API Base URL
const PADDLE_API_BASE_URL =
  PADDLE_ENVIRONMENT === 'production'
    ? 'https://api.paddle.com'
    : 'https://sandbox-api.paddle.com';

/**
 * Paddle API 요청 헬퍼
 */
async function paddleRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  if (!PADDLE_API_KEY) {
    throw new Error('PADDLE_API_KEY is not set');
  }

  const url = `${PADDLE_API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${PADDLE_API_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Paddle API Error:', errorData);
    throw new Error(
      `Paddle API Error: ${response.status} ${response.statusText}`
    );
  }

  return await response.json();
}

/**
 * Paddle Subscription 타입
 */
export interface PaddleSubscription {
  id: string;
  status: 'active' | 'canceled' | 'past_due' | 'paused' | 'trialing';
  customer_id: string;
  custom_data: Record<string, any>;
  current_billing_period: {
    starts_at: string;
    ends_at: string;
  };
  next_billed_at: string | null;
  created_at: string;
  updated_at: string;
  scheduled_change: any | null;
  items: Array<{
    price_id: string;
    quantity: number;
  }>;
}

/**
 * Paddle Transaction 타입
 */
export interface PaddleTransaction {
  id: string;
  status: string;
  checkout: {
    url: string | null;
  };
  customer_id: string | null;
  created_at: string;
}

/**
 * Paddle Transaction (Checkout) 생성
 */
export interface CreateTransactionOptions {
  priceId: string;
  userId: string;
  userEmail?: string;
  successUrl?: string;
  customData?: Record<string, any>;
}

export async function createPaddleTransaction(
  options: CreateTransactionOptions
): Promise<PaddleTransaction> {
  const {
    priceId,
    userId,
    userEmail,
    successUrl,
    customData = {},
  } = options;

  const requestBody = {
    items: [
      {
        price_id: priceId,
        quantity: 1,
      },
    ],
    custom_data: {
      user_id: userId,
      ...customData,
    },
    ...(userEmail && {
      customer_email: userEmail,
    }),
    ...(successUrl && {
      checkout: {
        settings: {
          success_url: successUrl,
        },
      },
    }),
  };

  const response = await paddleRequest<{ data: PaddleTransaction }>(
    '/transactions',
    {
      method: 'POST',
      body: JSON.stringify(requestBody),
    }
  );

  return response.data;
}

/**
 * Paddle 구독 조회
 */
export async function getPaddleSubscription(
  subscriptionId: string
): Promise<PaddleSubscription> {
  const response = await paddleRequest<{ data: PaddleSubscription }>(
    `/subscriptions/${subscriptionId}`,
    {
      method: 'GET',
    }
  );

  return response.data;
}

/**
 * Paddle 구독 취소 옵션
 */
export interface CancelSubscriptionOptions {
  effective_from?: 'immediately' | 'next_billing_period';
}

/**
 * Paddle 구독 취소
 */
export async function cancelPaddleSubscription(
  subscriptionId: string,
  options: CancelSubscriptionOptions = { effective_from: 'next_billing_period' }
): Promise<PaddleSubscription> {
  const response = await paddleRequest<{ data: PaddleSubscription }>(
    `/subscriptions/${subscriptionId}/cancel`,
    {
      method: 'POST',
      body: JSON.stringify(options),
    }
  );

  return response.data;
}

/**
 * Paddle 구독 재개
 */
export async function resumePaddleSubscription(
  subscriptionId: string
): Promise<PaddleSubscription> {
  const response = await paddleRequest<{ data: PaddleSubscription }>(
    `/subscriptions/${subscriptionId}/resume`,
    {
      method: 'POST',
      body: JSON.stringify({
        effective_from: 'immediately',
      }),
    }
  );

  return response.data;
}

/**
 * 고객의 모든 구독 조회
 */
export async function getCustomerSubscriptions(
  customerId: string
): Promise<PaddleSubscription[]> {
  const response = await paddleRequest<{
    data: PaddleSubscription[];
  }>(`/subscriptions?customer_id=${customerId}`, {
    method: 'GET',
  });

  return response.data;
}

/**
 * 결제 수단 업데이트 URL 생성
 */
export interface UpdatePaymentMethodOptions {
  subscriptionId: string;
  returnUrl?: string;
}

export async function getUpdatePaymentMethodUrl(
  options: UpdatePaymentMethodOptions
): Promise<string> {
  const { subscriptionId, returnUrl } = options;

  const response = await paddleRequest<{
    data: {
      url: string;
    };
  }>(`/subscriptions/${subscriptionId}/update-payment-method-transaction`, {
    method: 'POST',
    body: JSON.stringify({
      ...(returnUrl && {
        return_url: returnUrl,
      }),
    }),
  });

  return response.data.url;
}

/**
 * Webhook 서명 검증
 */
export function verifyPaddleWebhook(
  signature: string,
  rawBody: string,
  secret: string
): boolean {
  const crypto = require('crypto');
  
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(rawBody);
  const expectedSignature = hmac.digest('hex');

  return signature === expectedSignature;
}

/**
 * Custom Data에서 userId 추출
 */
export function extractUserIdFromCustomData(
  customData: Record<string, any>
): string | null {
  return customData?.user_id || customData?.userId || null;
}

// 기본 export
export default {
  createTransaction: createPaddleTransaction,
  getSubscription: getPaddleSubscription,
  cancelSubscription: cancelPaddleSubscription,
  resumeSubscription: resumePaddleSubscription,
  getCustomerSubscriptions,
  getUpdatePaymentMethodUrl,
  verifyWebhook: verifyPaddleWebhook,
  extractUserId: extractUserIdFromCustomData,
};