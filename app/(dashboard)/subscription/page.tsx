// app/(dashboard)/subscription/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useCurrentMonthlyUsage } from '@/hooks/useUsageStats';
import { PaddleCheckout } from '@/components/payment/PaddleCheckout';
import { showSuccess, showError, showLoading, dismissToast } from '@/lib/toast-helpers';
import { getIdToken } from '@/lib/auth';

/**
 * 구독 관리 페이지
 * ✅ users 컬렉션의 isPremium과 subscription 통합
 */
export default function SubscriptionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // ✅ AuthContext에서 isPremium 가져오기
  const { isPremium: isPremiumFromUsers, loading: authLoading } = useAuth();
  
  const { 
    subscription, 
    isPro, 
    isActive,
    isPastDue,
    cancelScheduled,
    daysUntilRenewal,
    loading: subscriptionLoading 
  } = useSubscription();

  const { total: monthlyTotal, loading: usageLoading } = useCurrentMonthlyUsage();

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  const FREE_LIMIT = 30;

  // ✅ users와 subscription 불일치 체크 (디버그용)
  useEffect(() => {
    if (!authLoading && !subscriptionLoading && isPremiumFromUsers !== isPro) {
      console.warn('⚠️ Subscription mismatch:', {
        isPremiumFromUsers,
        isPro,
        hasSubscription: !!subscription,
      });
    }
  }, [isPremiumFromUsers, isPro, subscription, authLoading, subscriptionLoading]);

  // 결제 성공 시 처리
  useEffect(() => {
    const success = searchParams.get('success');
    
    if (success === 'true' && !showSuccessAlert) {
      setShowSuccessAlert(true);
      showSuccess('🎉 Pro 구독이 시작되었습니다!');
      
      const timer = setTimeout(() => {
        const newUrl = window.location.pathname;
        router.replace(newUrl);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [searchParams, showSuccessAlert, router]);

  /**
   * 구독 취소
   */
  const handleCancelSubscription = async () => {
    if (!subscription?.paddleSubscriptionId) return;

    setCanceling(true);
    const toastId = showLoading('구독을 취소하는 중...');

    try {
      const token = await getIdToken();
      
      if (!token) {
        throw new Error('인증이 필요합니다.');
      }

      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
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

      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      dismissToast(toastId);
      showError(error instanceof Error ? error.message : '구독 취소에 실패했습니다.');
    } finally {
      setCanceling(false);
    }
  };

  /**
   * 구독 재개
   */
  const handleResumeSubscription = async () => {
    if (!subscription?.paddleSubscriptionId) return;

    const toastId = showLoading('구독을 재개하는 중...');

    try {
      const token = await getIdToken();
      
      if (!token) {
        throw new Error('인증이 필요합니다.');
      }

      const response = await fetch('/api/subscription/resume', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '구독 재개에 실패했습니다.');
      }

      dismissToast(toastId);
      showSuccess(data.message || '구독이 재개되었습니다.');

      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      dismissToast(toastId);
      showError(error instanceof Error ? error.message : '구독 재개에 실패했습니다.');
    }
  };

  /**
   * 결제 수단 변경
   */
  const handleUpdatePayment = async () => {
    if (!subscription?.paddleSubscriptionId) return;

    const toastId = showLoading('결제 페이지로 이동 중...');

    try {
      const token = await getIdToken();
      
      if (!token) {
        throw new Error('인증이 필요합니다.');
      }

      const response = await fetch('/api/subscription/update-payment', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnUrl: `${window.location.origin}/subscription?payment_updated=true`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '결제 수단 변경에 실패했습니다.');
      }

      dismissToast(toastId);

      if (data.updateUrl) {
        window.location.href = data.updateUrl;
      }

    } catch (error) {
      dismissToast(toastId);
      showError(error instanceof Error ? error.message : '결제 수단 변경에 실패했습니다.');
    }
  };

  // 로딩 중
  if (authLoading || subscriptionLoading || usageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // ✅ users.isPremium 또는 subscription.isPro 중 하나라도 true면 Pro로 처리
  const actualIsPremium = isPremiumFromUsers || isPro;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">구독 관리</h1>

      {/* ✅ 불일치 경고 (디버그용) */}
      {isPremiumFromUsers !== isPro && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">
            ⚠️ 구독 상태 불일치: users.isPremium={String(isPremiumFromUsers)}, subscription.isPro={String(isPro)}
          </p>
        </div>
      )}

      {/* 결제 성공 알림 */}
      {showSuccessAlert && (
        <div className="mb-6 p-6 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-900 mb-1">
                구독이 완료되었습니다!
              </h3>
              <p className="text-green-700">
                이제 Pro 플랜의 모든 기능을 무제한으로 사용할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 취소 예정 알림 */}
      {cancelScheduled && (
        <div className="mb-6 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-yellow-900 mb-1">
                구독 종료 예정
              </h3>
              <p className="text-yellow-700 mb-3">
                구독이 {daysUntilRenewal}일 후 종료됩니다.
                ({subscription?.currentPeriodEnd.toLocaleDateString('ko-KR')})
              </p>
              <button
                onClick={handleResumeSubscription}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                구독 재개하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 결제 연체 알림 */}
      {isPastDue && (
        <div className="mb-6 p-6 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900 mb-1">
                결제에 실패했습니다
              </h3>
              <p className="text-red-700 mb-3">
                결제 수단을 확인하고 업데이트해주세요.
              </p>
              <button
                onClick={handleUpdatePayment}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                결제 수단 업데이트
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Free 플랜 */}
      {!actualIsPremium && (
        <div className="border rounded-lg p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold">Free 플랜</h2>
              <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                무료
              </span>
            </div>
            <p className="text-gray-600">
              현재 무료 플랜을 사용 중입니다.
            </p>
          </div>

          {/* 이번 달 사용량 */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">이번 달 사용량</span>
              <span className="text-lg font-bold text-gray-900">
                {monthlyTotal} / {FREE_LIMIT}회
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((monthlyTotal / FREE_LIMIT) * 100, 100)}%` }}
              />
            </div>
            {monthlyTotal >= FREE_LIMIT && (
              <p className="text-sm text-red-600 mt-2">
                이번 달 무료 사용량을 모두 소진했습니다.
              </p>
            )}
          </div>

          {/* 제한사항 */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">현재 제한사항:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">✗</span>
                <span>월 30회 무료 요약 제한</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">✗</span>
                <span>기본 AI 모델만 사용 가능</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">✗</span>
                <span>광고 표시</span>
              </li>
            </ul>
          </div>

          {/* Pro 혜택 */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold mb-3 text-blue-900">Pro로 업그레이드하면:</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span className="font-medium">무제한 요약</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span className="font-medium">고성능 AI 모델 사용</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span className="font-medium">광고 제거</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span className="font-medium">우선 지원</span>
              </li>
            </ul>
          </div>

          {/* 업그레이드 버튼 */}
          <PaddleCheckout
            buttonText="Pro로 업그레이드 - ₩9,900/월"
            size="lg"
            className="w-full"
          />

          <p className="text-center text-sm text-gray-500 mt-4">
            언제든지 취소 가능 • 부가세 포함
          </p>
        </div>
      )}

      {/* Pro 플랜 */}
      {actualIsPremium && (
        <div className="border rounded-lg p-6">
          {/* 헤더 */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">Pro 플랜</h2>
                {isActive ? (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    활성
                  </span>
                ) : isPastDue ? (
                  <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                    결제 실패
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                    {subscription?.status}
                  </span>
                )}
              </div>
              <p className="text-gray-600">
                Pro 플랜의 모든 기능을 사용하고 계십니다.
              </p>
            </div>
            {subscription && (
              <div className="text-right">
                <p className="text-2xl font-bold">₩{subscription.price.toLocaleString()}</p>
                <p className="text-sm text-gray-600">{subscription.currency}/월</p>
              </div>
            )}
          </div>

          {/* 구독 정보 */}
          {subscription && (
            <div className="mb-6 space-y-3">
              <div className="flex justify-between p-3 bg-gray-50 rounded">
                <span className="text-gray-600">구독 시작일</span>
                <span className="font-medium">
                  {subscription.createdAt.toLocaleDateString('ko-KR')}
                </span>
              </div>
              
              <div className="flex justify-between p-3 bg-gray-50 rounded">
                <span className="text-gray-600">다음 결제일</span>
                <span className="font-medium">
                  {subscription.currentPeriodEnd.toLocaleDateString('ko-KR')}
                </span>
              </div>

              <div className="flex justify-between p-3 bg-gray-50 rounded">
                <span className="text-gray-600">결제 금액</span>
                <span className="font-medium">
                  ₩{subscription.price.toLocaleString()} / 월
                </span>
              </div>

              {daysUntilRenewal !== null && (
                <div className="flex justify-between p-3 bg-blue-50 rounded">
                  <span className="text-blue-700 font-medium">
                    {cancelScheduled ? '종료까지' : '갱신까지'}
                  </span>
                  <span className="font-bold text-blue-900">
                    {daysUntilRenewal}일 남음
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Pro 혜택 */}
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold mb-3 text-green-900">Pro 혜택 사용 중:</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>무제한 요약</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>고성능 AI 모델 사용</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>광고 제거</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>우선 지원</span>
              </li>
            </ul>
          </div>

          {/* 관리 버튼들 */}
          {subscription && (
            <div className="space-y-3">
              <button
                onClick={handleUpdatePayment}
                className="w-full px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                결제 수단 변경
              </button>

              {!cancelScheduled ? (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="w-full px-6 py-3 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 font-medium transition-colors"
                >
                  구독 해지
                </button>
              ) : (
                <button
                  onClick={handleResumeSubscription}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  구독 재개하기
                </button>
              )}
            </div>
          )}

          {/* 추가 정보 */}
          <p className="text-center text-sm text-gray-500 mt-6">
            구독을 해지해도 현재 결제 기간이 끝날 때까지 Pro 기능을 사용할 수 있습니다.
          </p>
        </div>
      )}

      {/* 구독 취소 확인 모달 */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">구독을 해지하시겠습니까?</h3>
            
            <p className="text-gray-600 mb-6">
              구독을 해지하면 현재 결제 기간({subscription?.currentPeriodEnd.toLocaleDateString('ko-KR')})이 
              끝날 때까지 Pro 기능을 계속 사용할 수 있습니다.
            </p>

            <div className="space-y-3">
              <button
                onClick={handleCancelSubscription}
                disabled={canceling}
                className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50"
              >
                {canceling ? '처리 중...' : '구독 해지하기'}
              </button>
              
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={canceling}
                className="w-full px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}