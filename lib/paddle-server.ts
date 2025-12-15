// lib/paddle-server.ts
/**
 * 서버 사이드 Paddle API 유틸리티
 * Paddle Billing API를 사용하여 서버에서 구독 관리
 */

import crypto from 'crypto';
import {
  validatePaddleResponse,
  SubscriptionResponseSchema,
  TransactionResponseSchema,
  CustomerSubscriptionsResponseSchema,
  UpdatePaymentMethodResponseSchema,
  type PaddleSubscription as ValidatedPaddleSubscription,
  type PaddleTransaction as ValidatedPaddleTransaction,
} from './paddle-validation';

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

  // GET 요청에서는 body를 제거
  const requestOptions: RequestInit = {
    ...options,
    headers: {
      'Authorization': `Bearer ${PADDLE_API_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  // GET 요청에서 body가 있으면 제거
  if (options.method === 'GET' && requestOptions.body) {
    delete requestOptions.body;
  }

  const response = await fetch(url, requestOptions);

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
 * ✅ Now uses validated types from paddle-validation.ts
 */
export type PaddleSubscription = ValidatedPaddleSubscription;

/**
 * Paddle Transaction 타입
 * ✅ Now uses validated types from paddle-validation.ts
 */
export type PaddleTransaction = ValidatedPaddleTransaction;

/**
 * Paddle Transaction (Checkout) 생성
 */
export interface CreateTransactionOptions {
  priceId: string;
  userId: string;
  userEmail?: string;
  successUrl?: string;
  customData?: Record<string, unknown>;
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

  // ✅ Security: Validate response structure
  const validatedResponse = validatePaddleResponse(
    TransactionResponseSchema,
    response,
    'Create Transaction Response'
  );

  return validatedResponse.data;
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

  // ✅ Security: Validate response structure
  const validatedResponse = validatePaddleResponse(
    SubscriptionResponseSchema,
    response,
    'Get Subscription Response'
  );

  return validatedResponse.data;
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

  // ✅ Security: Validate response structure
  const validatedResponse = validatePaddleResponse(
    SubscriptionResponseSchema,
    response,
    'Cancel Subscription Response'
  );

  return validatedResponse.data;
}

/**
 * ✅ 구독 재개 (paused 상태에서만 작동)
 * 
 * 주의: 이 API는 "paused" 상태의 구독에서만 작동합니다.
 * "취소 예정" 상태를 취소하려면 cancelScheduledChange()를 사용하세요.
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

  // ✅ Security: Validate response structure
  const validatedResponse = validatePaddleResponse(
    SubscriptionResponseSchema,
    response,
    'Resume Subscription Response'
  );

  return validatedResponse.data;
}

/**
 * ✅ 예정된 변경 취소 (취소 예정 취소)
 * 
 * 구독이 "취소 예정(scheduled_change.action = cancel)" 상태일 때,
 * 이 함수를 호출하면 취소를 철회하고 구독을 계속 유지합니다.
 * 
 * @param subscriptionId - Paddle 구독 ID
 * @returns 업데이트된 구독 정보
 */
export async function cancelScheduledChange(
  subscriptionId: string
): Promise<PaddleSubscription> {
  const response = await paddleRequest<{ data: PaddleSubscription }>(
    `/subscriptions/${subscriptionId}`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        scheduled_change: null,  // 예정된 변경 취소
      }),
    }
  );

  // ✅ Security: Validate response structure
  const validatedResponse = validatePaddleResponse(
    SubscriptionResponseSchema,
    response,
    'Cancel Scheduled Change Response'
  );

  return validatedResponse.data;
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

  // ✅ Security: Validate response structure
  const validatedResponse = validatePaddleResponse(
    CustomerSubscriptionsResponseSchema,
    response,
    'Get Customer Subscriptions Response'
  );

  return validatedResponse.data;
}

/**
 * ✅ 결제 수단 업데이트 URL 생성 (수정됨)
 * 
 * Paddle Billing API에서는 GET 요청을 사용합니다.
 */
export interface UpdatePaymentMethodOptions {
  subscriptionId: string;
}

export async function getUpdatePaymentMethodUrl(
  options: UpdatePaymentMethodOptions
): Promise<string> {
  const { subscriptionId } = options;

  // ✅ GET 요청 사용 (POST 아님!)
  const response = await paddleRequest<{
    data: {
      transaction_id: string;
      subscription_id: string;
      checkout: {
        url: string;
      };
    };
  }>(`/subscriptions/${subscriptionId}/update-payment-method-transaction`, {
    method: 'GET',
  });

  // ✅ Security: Validate response structure
  const validatedResponse = validatePaddleResponse(
    UpdatePaymentMethodResponseSchema,
    response,
    'Update Payment Method Response'
  );

  return validatedResponse.data.checkout.url;
}

/**
 * Webhook 서명 검증
 */
export function verifyPaddleWebhook(
  signature: string,
  rawBody: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(rawBody);
  const expectedSignature = hmac.digest('hex');

  return signature === expectedSignature;
}

/**
 * Custom Data에서 userId 추출
 */
export function extractUserIdFromCustomData(
  customData: Record<string, unknown>
): string | null {
  const userId = customData?.user_id;
  const altUserId = customData?.userId;

  if (typeof userId === 'string') return userId;
  if (typeof altUserId === 'string') return altUserId;

  return null;
}

// 기본 export
const paddleServer = {
  createTransaction: createPaddleTransaction,
  getSubscription: getPaddleSubscription,
  cancelSubscription: cancelPaddleSubscription,
  resumeSubscription: resumePaddleSubscription,
  cancelScheduledChange,
  getCustomerSubscriptions,
  getUpdatePaymentMethodUrl,
  verifyWebhook: verifyPaddleWebhook,
  extractUserId: extractUserIdFromCustomData,
};

export default paddleServer;