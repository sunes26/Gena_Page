// components/payment/SubscriptionInfo.tsx
'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Subscription } from '@/hooks/useSubscription';
import { getIdToken } from '@/lib/auth';
import { showSuccess, showError, showLoading, dismissToast } from '@/lib/toast-helpers';
import {
  Calendar,
  CreditCard,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Crown,
} from 'lucide-react';

/**
 * SubscriptionInfo Props
 */
export interface SubscriptionInfoProps {
  subscription: Subscription | null;
  onUpdate?: () => void;
  className?: string;
}

/**
 * ✅ Base URL 헬퍼 함수 (HTTPS 에러 방지)
 */
function getBaseUrl(): string {
  // 1순위: 환경 변수 (명시적으로 http://localhost:3000 설정)
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  
  // 2순위: window.location.origin (클라이언트에서만 사용 가능)
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // 3순위: 기본값
  return 'http://localhost:3000';
}

/**
 * 구독 상태 배지 컴포넌트
 */
function StatusBadge({ status }: { status: Subscription['status'] }) {
  const statusConfig = {
    active: {
      label: '활성',
      icon: CheckCircle,
      className: 'bg-green-100 text-green-800 border-green-200',
    },
    trialing: {
      label: '체험 중',
      icon: Clock,
      className: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    canceled: {
      label: '취소됨',
      icon: XCircle,
      className: 'bg-gray-100 text-gray-800 border-gray-200',
    },
    past_due: {
      label: '결제 실패',
      icon: AlertCircle,
      className: 'bg-red-100 text-red-800 border-red-200',
    },
    paused: {
      label: '일시중지',
      icon: Clock,
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${config.className}`}
    >
      <Icon className="w-4 h-4" />
      {config.label}
    </span>
  );
}

/**
 * 구독 정보 카드 컴포넌트
 * 
 * @example
 * ```tsx
 * const { subscription } = useSubscription();
 * 
 * <SubscriptionInfo 
 *   subscription={subscription}
 *   onUpdate={() => console.log('Updated!')}
 * />
 * ```
 */
export function SubscriptionInfo({
  subscription,
  onUpdate,
  className = '',
}: SubscriptionInfoProps) {
  const [cancelingLoading, setCancelingLoading] = useState(false);
  const [resumingLoading, setResumingLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // 구독이 없으면 null 반환
  if (!subscription) {
    return null;
  }

  /**
   * ✅ 결제 수단 변경 (환경 변수 기반 returnUrl 사용)
   */
  const handleUpdatePayment = async () => {
    const toastId = showLoading('결제 페이지로 이동 중...');

    try {
      const token = await getIdToken();

      if (!token) {
        throw new Error('인증이 필요합니다.');
      }

      const baseUrl = getBaseUrl();
      const returnUrl = `${baseUrl}/subscription?payment_updated=true`;

      console.log('🔗 Return URL:', returnUrl);

      const response = await fetch('/api/subscription/update-payment', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '결제 수단 변경에 실패했습니다.');
      }

      dismissToast(toastId);

      // Paddle 결제 수단 변경 페이지로 리다이렉트
      if (data.updateUrl) {
        console.log('🚀 Redirecting to:', data.updateUrl);
        window.location.href = data.updateUrl;
      }
    } catch (error) {
      dismissToast(toastId);
      showError(error instanceof Error ? error.message : '결제 수단 변경에 실패했습니다.');
    }
  };

  /**
   * 구독 취소
   */
  const handleCancelSubscription = async () => {
    setCancelingLoading(true);
    const toastId = showLoading('구독을 취소하는 중...');

    try {
      const token = await getIdToken();

      if (!token) {
        throw new Error('인증이 필요합니다.');
      }

      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cancelImmediately: false,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '구독 취소에 실패했습니다.');
      }

      dismissToast(toastId);
      showSuccess(data.message || '구독이 취소되었습니다.');
      setShowCancelModal(false);

      // 업데이트 콜백 호출
      if (onUpdate) {
        onUpdate();
      }

      // 페이지 새로고침
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      dismissToast(toastId);
      showError(error instanceof Error ? error.message : '구독 취소에 실패했습니다.');
    } finally {
      setCancelingLoading(false);
    }
  };

  /**
   * 구독 재개
   */
  const handleResumeSubscription = async () => {
    setResumingLoading(true);
    const toastId = showLoading('구독을 재개하는 중...');

    try {
      const token = await getIdToken();

      if (!token) {
        throw new Error('인증이 필요합니다.');
      }

      const response = await fetch('/api/subscription/resume', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '구독 재개에 실패했습니다.');
      }

      dismissToast(toastId);
      showSuccess(data.message || '구독이 재개되었습니다.');

      // 업데이트 콜백 호출
      if (onUpdate) {
        onUpdate();
      }

      // 페이지 새로고침
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      dismissToast(toastId);
      showError(error instanceof Error ? error.message : '구독 재개에 실패했습니다.');
    } finally {
      setResumingLoading(false);
    }
  };

  /**
   * 영수증 보기 (Paddle)
   */
  const handleViewReceipt = () => {
    // Paddle 고객 포털로 리다이렉트
    const paddleEnvironment = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT || 'sandbox';
    const portalUrl =
      paddleEnvironment === 'production'
        ? 'https://billing.paddle.com'
        : 'https://sandbox-billing.paddle.com';

    window.open(
      `${portalUrl}/subscriptions/${subscription.paddleSubscriptionId}`,
      '_blank'
    );
  };

  // 날짜 포맷팅
  const formatDate = (date: Date) => {
    return format(date, 'yyyy년 MM월 dd일', { locale: ko });
  };

  const formatDateShort = (date: Date) => {
    return format(date, 'M월 d일', { locale: ko });
  };

  // 다음 결제일까지 남은 일수
  const daysUntilRenewal = Math.ceil(
    (subscription.currentPeriodEnd.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  // 가격 포맷팅
  const formatPrice = () => {
    if (subscription.currency === 'KRW') {
      return `₩${subscription.price.toLocaleString()}`;
    }
    return `$${(subscription.price / 100).toFixed(2)}`;
  };

  return (
    <>
      <div className={`border rounded-xl overflow-hidden bg-white ${className}`}>
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Pro 플랜</h3>
                <p className="text-blue-100 text-sm mt-1">무제한 요약 & 고급 기능</p>
              </div>
            </div>
            <StatusBadge status={subscription.status} />
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold">{formatPrice()}</span>
            <span className="text-blue-100">/월</span>
          </div>
        </div>

        {/* 취소 예정 경고 */}
        {subscription.cancelAtPeriodEnd && (
          <div className="bg-yellow-50 border-b border-yellow-200 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-yellow-900">구독 종료 예정</p>
                <p className="text-sm text-yellow-700 mt-1">
                  {formatDate(subscription.currentPeriodEnd)}에 구독이 종료됩니다.
                  ({daysUntilRenewal}일 남음)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 구독 정보 */}
        <div className="p-6 space-y-4">
          {/* 구독 시작일 */}
          <div className="flex items-center justify-between py-3 border-b">
            <div className="flex items-center gap-3 text-gray-600">
              <Calendar className="w-5 h-5" />
              <span>구독 시작일</span>
            </div>
            <span className="font-medium text-gray-900">
              {formatDate(subscription.createdAt)}
            </span>
          </div>

          {/* 다음 결제일 */}
          <div className="flex items-center justify-between py-3 border-b">
            <div className="flex items-center gap-3 text-gray-600">
              <Calendar className="w-5 h-5" />
              <span>
                {subscription.cancelAtPeriodEnd ? '종료일' : '다음 결제일'}
              </span>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900">
                {formatDate(subscription.currentPeriodEnd)}
              </p>
              <p className="text-sm text-gray-500 mt-0.5">
                {daysUntilRenewal > 0
                  ? `${daysUntilRenewal}일 남음`
                  : '오늘'}
              </p>
            </div>
          </div>

          {/* 결제 금액 */}
          <div className="flex items-center justify-between py-3 border-b">
            <div className="flex items-center gap-3 text-gray-600">
              <CreditCard className="w-5 h-5" />
              <span>결제 금액</span>
            </div>
            <span className="font-medium text-gray-900">
              {formatPrice()} / 월
            </span>
          </div>

          {/* Subscription ID */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3 text-gray-600">
              <FileText className="w-5 h-5" />
              <span>구독 ID</span>
            </div>
            <span className="font-mono text-xs text-gray-500">
              {subscription.paddleSubscriptionId.substring(0, 20)}...
            </span>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="p-6 bg-gray-50 border-t space-y-3">
          {/* 결제 수단 변경 */}
          <button
            onClick={handleUpdatePayment}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-white transition-colors font-medium text-gray-700"
          >
            <CreditCard className="w-4 h-4" />
            결제 수단 변경
          </button>

          {/* 영수증 보기 */}
          <button
            onClick={handleViewReceipt}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-white transition-colors font-medium text-gray-700"
          >
            <FileText className="w-4 h-4" />
            영수증 보기
          </button>

          {/* 구독 재개 or 해지 */}
          {subscription.cancelAtPeriodEnd ? (
            <button
              onClick={handleResumeSubscription}
              disabled={resumingLoading}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resumingLoading ? '처리 중...' : '구독 재개하기'}
            </button>
          ) : (
            <button
              onClick={() => setShowCancelModal(true)}
              className="w-full px-6 py-3 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
            >
              구독 해지
            </button>
          )}
        </div>
      </div>

      {/* 구독 취소 확인 모달 */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-center mb-2">
                구독을 해지하시겠습니까?
              </h3>
              <p className="text-gray-600 text-center text-sm">
                구독을 해지하면 {formatDateShort(subscription.currentPeriodEnd)}까지
                Pro 기능을 계속 사용할 수 있습니다.
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleCancelSubscription}
                disabled={cancelingLoading}
                className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelingLoading ? '처리 중...' : '구독 해지하기'}
              </button>

              <button
                onClick={() => setShowCancelModal(false)}
                disabled={cancelingLoading}
                className="w-full px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * 간단한 구독 요약 카드 (대시보드용)
 */
export function SubscriptionSummaryCard({
  subscription,
  className = '',
}: SubscriptionInfoProps) {
  if (!subscription) {
    return null;
  }

  const formatPrice = () => {
    if (subscription.currency === 'KRW') {
      return `₩${subscription.price.toLocaleString()}`;
    }
    return `$${(subscription.price / 100).toFixed(2)}`;
  };

  const daysUntilRenewal = Math.ceil(
    (subscription.currentPeriodEnd.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className={`border rounded-lg p-6 bg-white ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Crown className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Pro 플랜</h3>
            <p className="text-sm text-gray-500">{formatPrice()}/월</p>
          </div>
        </div>
        <StatusBadge status={subscription.status} />
      </div>

      {subscription.cancelAtPeriodEnd ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm font-medium text-yellow-900">
            {daysUntilRenewal}일 후 종료 예정
          </p>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm font-medium text-blue-900">
            다음 결제: {daysUntilRenewal}일 후
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * 기본 export
 */
export default SubscriptionInfo;