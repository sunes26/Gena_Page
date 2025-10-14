// components/payment/PaddleCheckout.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { getPaddleInstance, PADDLE_PRICES } from '@/lib/paddle';
import { CheckoutOpenOptions } from '@paddle/paddle-js';
import { showSuccess, showError, showLoading, dismissToast } from '@/lib/toast-helpers';

/**
 * PaddleCheckout 컴포넌트 Props
 */
interface PaddleCheckoutProps {
  /** 버튼 텍스트 */
  buttonText?: string;
  /** 버튼 스타일 클래스 */
  className?: string;
  /** 성공 시 콜백 */
  onSuccess?: () => void;
  /** 실패 시 콜백 */
  onError?: (error: Error) => void;
  /** Paddle Price ID (기본: Pro Monthly) */
  priceId?: string;
  /** 성공 URL */
  successUrl?: string;
  /** 닫기 URL */
  closeUrl?: string;
  /** 버튼 크기 */
  size?: 'sm' | 'md' | 'lg';
  /** 버튼 variant */
  variant?: 'primary' | 'secondary' | 'outline';
}

/**
 * Paddle Checkout을 띄우는 버튼 컴포넌트
 * 
 * @example
 * <PaddleCheckout 
 *   buttonText="Pro로 업그레이드"
 *   onSuccess={() => console.log('구독 완료!')}
 * />
 */
export function PaddleCheckout({
  buttonText = 'Pro로 업그레이드',
  className = '',
  onSuccess,
  onError,
  priceId = PADDLE_PRICES.pro_monthly,
  successUrl,
  closeUrl,
  size = 'md',
  variant = 'primary',
}: PaddleCheckoutProps) {
  const { user } = useAuth();
  const { isPro, isActive, loading: subscriptionLoading } = useSubscription();
  const [opening, setOpening] = useState(false);

  // 버튼 크기 스타일
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  // 버튼 variant 스타일
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
  };

  // 이미 Pro 구독 중인지 확인
  const isAlreadyPro = isPro && isActive;

  /**
   * Paddle Checkout 열기
   */
  const handleOpenCheckout = async () => {
    // 사용자 인증 확인
    if (!user) {
      showError('로그인이 필요합니다.');
      return;
    }

    // 이미 Pro 구독 중
    if (isAlreadyPro) {
      showError('이미 Pro 플랜을 사용 중입니다.');
      return;
    }

    setOpening(true);
    const toastId = showLoading('결제 페이지를 준비 중...');

    try {
      // Paddle 인스턴스 가져오기
      const paddle = await getPaddleInstance();

      // 체크아웃 옵션 설정
      const checkoutOptions: CheckoutOpenOptions = {
        items: [
          {
            priceId,
            quantity: 1,
          },
        ],
        // 커스텀 데이터 (Webhook에서 사용)
        customData: {
          userId: user.uid,
          email: user.email || '',
          source: 'web_dashboard',
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

      // 고객 정보 추가 (이메일이 있을 때만)
      if (user.email) {
        checkoutOptions.customer = {
          email: user.email,
        };
      }

      // 닫기 URL 설정 (선택사항) - 현재는 사용하지 않음
      // Paddle.js v2에서는 closeUrl이 없음

      // 체크아웃 열기
      paddle.Checkout.open(checkoutOptions);

      dismissToast(toastId);
      console.log('✅ Paddle checkout opened');

      // 성공 콜백
      if (onSuccess) {
        onSuccess();
      }

    } catch (error) {
      console.error('❌ Failed to open checkout:', error);
      dismissToast(toastId);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : '결제 페이지를 열 수 없습니다.';
      
      showError(errorMessage);

      // 에러 콜백
      if (onError) {
        onError(error as Error);
      }
    } finally {
      setOpening(false);
    }
  };

  // 로딩 중
  if (subscriptionLoading) {
    return (
      <button
        disabled
        className={`
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          rounded-lg font-medium
          opacity-50 cursor-not-allowed
          ${className}
        `}
      >
        로딩 중...
      </button>
    );
  }

  // 이미 Pro 구독 중
  if (isAlreadyPro) {
    return (
      <button
        disabled
        className={`
          ${sizeClasses[size]}
          bg-green-600 text-white
          rounded-lg font-medium
          opacity-75 cursor-not-allowed
          ${className}
        `}
      >
        ✓ Pro 사용 중
      </button>
    );
  }

  // 일반 버튼
  return (
    <button
      onClick={handleOpenCheckout}
      disabled={opening}
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        rounded-lg font-medium
        transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {opening ? '준비 중...' : buttonText}
    </button>
  );
}

/**
 * Pro 플랜 프라이싱 카드 컴포넌트
 * 
 * @example
 * <ProPricingCard />
 */
export function ProPricingCard() {
  const { isPro, isActive } = useSubscription();

  return (
    <div className="max-w-sm mx-auto border border-blue-200 rounded-2xl p-8 bg-gradient-to-br from-blue-50 to-white">
      {/* 헤더 */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Pro 플랜
        </h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-4xl font-bold text-blue-600">₩9,900</span>
          <span className="text-gray-600">/월</span>
        </div>
      </div>

      {/* 기능 목록 */}
      <ul className="space-y-3 mb-8">
        <li className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span className="text-gray-700">무제한 요약</span>
        </li>
        <li className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span className="text-gray-700">고급 AI 모델 사용</span>
        </li>
        <li className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span className="text-gray-700">우선 지원</span>
        </li>
        <li className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span className="text-gray-700">광고 없음</span>
        </li>
      </ul>

      {/* 버튼 */}
      <PaddleCheckout
        buttonText={isPro && isActive ? '✓ Pro 사용 중' : 'Pro 시작하기'}
        size="lg"
        className="w-full"
      />

      {/* 추가 정보 */}
      <p className="text-center text-sm text-gray-500 mt-4">
        언제든지 취소 가능
      </p>
    </div>
  );
}

/**
 * 업그레이드 프롬프트 컴포넌트
 * Free 사용자에게 표시
 * 
 * @example
 * <UpgradePrompt />
 */
export function UpgradePrompt() {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-start gap-4">
        {/* 아이콘 */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>

        {/* 내용 */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Pro로 업그레이드하세요
          </h3>
          <p className="text-gray-600 mb-4">
            무제한 요약과 고급 AI 기능을 사용하고, 생산성을 극대화하세요.
          </p>

          <PaddleCheckout
            buttonText="지금 시작하기 →"
            variant="primary"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * 인라인 업그레이드 버튼
 * 작은 CTA용
 * 
 * @example
 * <InlineUpgradeButton />
 */
export function InlineUpgradeButton() {
  return (
    <PaddleCheckout
      buttonText="Pro로 업그레이드"
      size="sm"
      variant="outline"
    />
  );
}