// lib/paddle.ts
import { initializePaddle, Paddle, CheckoutOpenOptions } from '@paddle/paddle-js';

/**
 * Paddle 가격 설정
 * Paddle Dashboard에서 생성한 Price ID를 여기에 입력하세요
 */
export const PADDLE_PRICES = {
  pro_monthly: process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO_MONTHLY || 'pri_01234567890',
  // pro_yearly: 'pri_01234567891', // 연간 플랜 (나중에 추가)
} as const;

/**
 * Paddle 환경 설정
 */
const PADDLE_ENVIRONMENT = (process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT || 'sandbox') as 'sandbox' | 'production';
const PADDLE_CLIENT_TOKEN = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || '';

/**
 * Paddle 인스턴스 (싱글톤)
 */
let paddleInstance: Paddle | undefined = undefined;

/**
 * Paddle.js 초기화
 * 
 * @returns Promise<Paddle> - Paddle 인스턴스
 * 
 * @example
 * const paddle = await initializePaddleClient();
 * paddle.Checkout.open({ ... });
 */
export async function initializePaddleClient(): Promise<Paddle> {
  // 이미 초기화된 인스턴스가 있으면 재사용
  if (paddleInstance) {
    return paddleInstance;
  }

  // 환경 변수 검증
  if (!PADDLE_CLIENT_TOKEN) {
    throw new Error(
      'Missing Paddle Client Token.\n' +
      'Please set NEXT_PUBLIC_PADDLE_CLIENT_TOKEN in your .env.local file.\n' +
      'You can get this from: Paddle Dashboard → Developer Tools → Authentication'
    );
  }

  try {
    // Paddle.js 초기화
    const paddle = await initializePaddle({
      environment: PADDLE_ENVIRONMENT,
      token: PADDLE_CLIENT_TOKEN,
      // 옵션: 이벤트 콜백 설정 가능
      eventCallback: (event) => {
        console.log('Paddle Event:', event);
      },
    });

    if (!paddle) {
      throw new Error('Failed to initialize Paddle: paddle instance is undefined');
    }

    paddleInstance = paddle;
    console.log(`✅ Paddle initialized successfully (${PADDLE_ENVIRONMENT} mode)`);
    
    return paddle;
  } catch (error) {
    console.error('❌ Failed to initialize Paddle:', error);
    throw new Error(
      `Failed to initialize Paddle: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Paddle 인스턴스 가져오기
 * 초기화되지 않았으면 자동으로 초기화
 */
export async function getPaddleInstance(): Promise<Paddle> {
  if (!paddleInstance) {
    return await initializePaddleClient();
  }
  return paddleInstance;
}

/**
 * 체크아웃 열기 옵션 타입
 */
export interface OpenCheckoutOptions {
  priceId: string;
  userId: string;
  userEmail?: string;
  successUrl?: string;
  customData?: Record<string, any>;
}

/**
 * Paddle 체크아웃 열기
 * Pro 플랜 구독을 시작하기 위한 결제 창을 엽니다
 * 
 * @param options - 체크아웃 옵션
 * @param options.priceId - Paddle Price ID (예: PADDLE_PRICES.pro_monthly)
 * @param options.userId - 사용자 ID (Firebase UID)
 * @param options.userEmail - 사용자 이메일 (선택)
 * @param options.successUrl - 결제 성공 후 리다이렉트 URL
 * @param options.customData - 추가 커스텀 데이터
 * 
 * @example
 * await openCheckout({
 *   priceId: PADDLE_PRICES.pro_monthly,
 *   userId: 'firebase-uid-123',
 *   userEmail: 'user@example.com',
 * });
 */
export async function openCheckout(options: OpenCheckoutOptions): Promise<void> {
  const {
    priceId,
    userId,
    userEmail,
    successUrl,
    customData = {},
  } = options;

  try {
    const paddle = await getPaddleInstance();

    // 체크아웃 설정
    const checkoutOptions: CheckoutOpenOptions = {
      items: [
        {
          priceId,
          quantity: 1,
        },
      ],
      // 고객 정보 (이메일이 있으면 자동 입력)
      ...(userEmail && {
        customer: {
          email: userEmail,
        },
      }),
      // 커스텀 데이터 (웹훅에서 사용)
      customData: {
        userId, // Firebase UID를 Paddle에 전달
        ...customData,
      },
      settings: {
        displayMode: 'overlay', // 오버레이 모드
        theme: 'dark', // 다크 테마
        locale: 'ko', // 한국어
        showAddDiscounts: true, // 할인 코드 입력 허용
        allowLogout: false, // 로그아웃 버튼 숨김
        successUrl: successUrl || `${window.location.origin}/subscription?success=true`,
      },
    };

    // 체크아웃 열기
    paddle.Checkout.open(checkoutOptions);

    console.log('✅ Paddle checkout opened');
  } catch (error) {
    console.error('❌ Failed to open checkout:', error);
    throw new Error(
      `Failed to open checkout: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Pro 플랜 구독 시작 (간편 함수)
 * 
 * @param userId - 사용자 ID
 * @param userEmail - 사용자 이메일 (선택)
 * 
 * @example
 * await startProSubscription('firebase-uid-123', 'user@example.com');
 */
export async function startProSubscription(
  userId: string,
  userEmail?: string
): Promise<void> {
  return await openCheckout({
    priceId: PADDLE_PRICES.pro_monthly,
    userId,
    userEmail,
  });
}

/**
 * 구독 취소
 * 서버 API를 통해 구독을 취소합니다
 * 
 * @param subscriptionId - Paddle Subscription ID
 * @returns Promise<boolean> - 성공 여부
 * 
 * @example
 * const success = await cancelSubscription('sub_01234567890');
 */
export async function cancelSubscription(subscriptionId: string): Promise<boolean> {
  try {
    // Firebase ID 토큰 가져오기
    const { getIdToken } = await import('./auth');
    const token = await getIdToken();

    if (!token) {
      throw new Error('User is not authenticated');
    }

    // 서버 API 호출
    const response = await fetch('/api/subscription/paddle/cancel', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subscriptionId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to cancel subscription');
    }

    const data = await response.json();
    console.log('✅ Subscription canceled:', data);
    
    return true;
  } catch (error) {
    console.error('❌ Failed to cancel subscription:', error);
    throw error;
  }
}

/**
 * 결제 수단 변경
 * Paddle 고객 포털로 리다이렉트하여 결제 수단을 변경합니다
 * 
 * @param subscriptionId - Paddle Subscription ID
 * 
 * @example
 * await updatePaymentMethod('sub_01234567890');
 */
export async function updatePaymentMethod(subscriptionId: string): Promise<void> {
  try {
    // Firebase ID 토큰 가져오기
    const { getIdToken } = await import('./auth');
    const token = await getIdToken();

    if (!token) {
      throw new Error('User is not authenticated');
    }

    // 서버 API 호출 (Update URL 생성)
    const response = await fetch('/api/subscription/paddle/update-payment', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subscriptionId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get update URL');
    }

    const { updateUrl } = await response.json();

    // Paddle 관리 페이지로 리다이렉트
    window.location.href = updateUrl;
  } catch (error) {
    console.error('❌ Failed to update payment method:', error);
    throw error;
  }
}

/**
 * 구독 재개 (취소된 구독을 다시 활성화)
 * 
 * @param subscriptionId - Paddle Subscription ID
 * @returns Promise<boolean> - 성공 여부
 */
export async function resumeSubscription(subscriptionId: string): Promise<boolean> {
  try {
    const { getIdToken } = await import('./auth');
    const token = await getIdToken();

    if (!token) {
      throw new Error('User is not authenticated');
    }

    const response = await fetch('/api/subscription/paddle/resume', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subscriptionId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to resume subscription');
    }

    console.log('✅ Subscription resumed');
    return true;
  } catch (error) {
    console.error('❌ Failed to resume subscription:', error);
    throw error;
  }
}

/**
 * Paddle 인스턴스 정리 (필요시)
 */
export function cleanupPaddle(): void {
  paddleInstance = undefined;
}

/**
 * 현재 환경 확인
 */
export function getPaddleEnvironment(): 'sandbox' | 'production' {
  return PADDLE_ENVIRONMENT;
}

/**
 * Sandbox 모드인지 확인
 */
export function isSandboxMode(): boolean {
  return PADDLE_ENVIRONMENT === 'sandbox';
}

// 기본 export
export default {
  initialize: initializePaddleClient,
  getInstance: getPaddleInstance,
  openCheckout,
  startProSubscription,
  cancelSubscription,
  updatePaymentMethod,
  resumeSubscription,
  cleanup: cleanupPaddle,
  prices: PADDLE_PRICES,
  environment: PADDLE_ENVIRONMENT,
};