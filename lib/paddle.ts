// lib/paddle.ts
import type { Paddle, CheckoutOpenOptions } from '@paddle/paddle-js';

/**
 * Paddle 가격 설정
 * Paddle Dashboard에서 생성한 Price ID를 여기에 입력하세요
 */
export const PADDLE_PRICES = {
  pro_monthly: process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO_MONTHLY || '',
  // pro_yearly: process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO_YEARLY || '',
} as const;

/**
 * Paddle 환경 설정
 */
export const PADDLE_ENVIRONMENT = (process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT || 'sandbox') as 'sandbox' | 'production';
const PADDLE_CLIENT_TOKEN = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || '';

/**
 * ✅ Paddle 인스턴스 가져오기
 * window.Paddle을 반환 (PaddleProvider에서 초기화됨)
 * 
 * @returns Paddle | undefined
 */
export function getPaddleInstance(): Paddle | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const windowWithPaddle = window as Window & { Paddle?: Paddle };
  const paddle = windowWithPaddle.Paddle;

  if (!paddle) {
    return undefined;
  }

  return paddle;
}

/**
 * ✅ Paddle 초기화 상태 확인
 */
export function isPaddleReady(): boolean {
  if (typeof window === 'undefined') return false;
  const windowWithPaddle = window as Window & { Paddle?: Paddle };
  return !!windowWithPaddle.Paddle;
}

/**
 * ✅ Paddle 설정 검증
 */
export function validatePaddleConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!PADDLE_CLIENT_TOKEN) {
    errors.push('NEXT_PUBLIC_PADDLE_CLIENT_TOKEN이 설정되지 않았습니다.');
  }

  if (!PADDLE_PRICES.pro_monthly) {
    errors.push('NEXT_PUBLIC_PADDLE_PRICE_PRO_MONTHLY가 설정되지 않았습니다.');
  }

  // 기본값인지 확인
  if (PADDLE_PRICES.pro_monthly === 'pri_01234567890') {
    errors.push('NEXT_PUBLIC_PADDLE_PRICE_PRO_MONTHLY가 기본값입니다. 실제 Price ID를 설정하세요.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 체크아웃 열기 옵션 타입
 */
export interface OpenCheckoutOptions {
  priceId: string;
  userId: string;
  userEmail?: string;
  successUrl?: string;
  customData?: Record<string, unknown>;
}

/**
 * ✅ Paddle 체크아웃 열기
 * Pro 플랜 구독을 시작하기 위한 결제 창을 엽니다
 * 
 * @param options - 체크아웃 옵션
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

  // 설정 검증
  const configValidation = validatePaddleConfig();
  if (!configValidation.valid) {
    console.error('❌ Paddle 설정 오류:', configValidation.errors);
    throw new Error(configValidation.errors.join('\n'));
  }

  try {
    const paddle = getPaddleInstance();

    if (!paddle) {
      throw new Error('Paddle이 초기화되지 않았습니다. PaddleProvider가 올바르게 설정되었는지 확인하세요.');
    }

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
        theme: 'light', // 라이트 테마
        locale: 'ko', // 한국어
        showAddDiscounts: true, // 할인 코드 입력 허용
        allowLogout: false, // 로그아웃 버튼 숨김
        successUrl: successUrl || `${window.location.origin}/subscription?success=true`,
      },
    };

    // 체크아웃 열기
    paddle.Checkout.open(checkoutOptions);
  } catch (error) {
    console.error('❌ 체크아웃 열기 실패:', error);
    throw new Error(
      `체크아웃을 열 수 없습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
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
 */
export async function cancelSubscription(subscriptionId: string): Promise<boolean> {
  try {
    // ✅ Security: Force refresh token before critical operation
    const { refreshIdToken } = await import('./auth');
    const token = await refreshIdToken();

    if (!token) {
      throw new Error('사용자가 인증되지 않았습니다.');
    }

    // 서버 API 호출
    const response = await fetch('/api/subscription/cancel', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subscriptionId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '구독 취소에 실패했습니다.');
    }

    await response.json();

    return true;
  } catch (error) {
    console.error('❌ 구독 취소 실패:', error);
    throw error;
  }
}

/**
 * 결제 수단 변경
 * Paddle 고객 포털로 리다이렉트하여 결제 수단을 변경합니다
 */
export async function updatePaymentMethod(subscriptionId: string): Promise<void> {
  try {
    // ✅ Security: Force refresh token before critical operation
    const { refreshIdToken } = await import('./auth');
    const token = await refreshIdToken();

    if (!token) {
      throw new Error('사용자가 인증되지 않았습니다.');
    }

    const response = await fetch('/api/subscription/update-payment', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subscriptionId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '결제 수단 변경 URL을 가져올 수 없습니다.');
    }

    const { updateUrl } = await response.json();

    // Paddle 관리 페이지로 리다이렉트
    window.location.href = updateUrl;
  } catch (error) {
    console.error('❌ 결제 수단 변경 실패:', error);
    throw error;
  }
}

/**
 * 구독 재개 (취소된 구독을 다시 활성화)
 */
export async function resumeSubscription(subscriptionId: string): Promise<boolean> {
  try {
    // ✅ Security: Force refresh token before critical operation
    const { refreshIdToken } = await import('./auth');
    const token = await refreshIdToken();

    if (!token) {
      throw new Error('사용자가 인증되지 않았습니다.');
    }

    const response = await fetch('/api/subscription/resume', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subscriptionId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '구독 재개에 실패했습니다.');
    }

    return true;
  } catch (error) {
    console.error('❌ 구독 재개 실패:', error);
    throw error;
  }
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

/**
 * 디버그 정보 출력
 */
export function logPaddleDebugInfo(): void {
  if (process.env.NODE_ENV !== 'development') return;

  const validation = validatePaddleConfig();
  if (!validation.valid) {
    console.error('Paddle Config Errors:', validation.errors);
  }
}

// 기본 export
const paddle = {
  getInstance: getPaddleInstance,
  isReady: isPaddleReady,
  validateConfig: validatePaddleConfig,
  openCheckout,
  startProSubscription,
  cancelSubscription,
  updatePaymentMethod,
  resumeSubscription,
  prices: PADDLE_PRICES,
  environment: PADDLE_ENVIRONMENT,
  logDebugInfo: logPaddleDebugInfo,
};

export default paddle;