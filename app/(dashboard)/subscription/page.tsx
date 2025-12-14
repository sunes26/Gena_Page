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
import { useTranslation } from '@/hooks/useTranslation';
import { USAGE_LIMITS } from '@/lib/constants';
import { SubscriptionCardSkeleton } from '@/components/ui/SkeletonLoader';
import { formatCurrency } from '@/lib/currency';
import { RefreshCw } from 'lucide-react';

export default function SubscriptionPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  
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
  const [syncing, setSyncing] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  // ✅ 환경 변수 기반 Base URL (HTTPS 에러 방지)
  const getBaseUrl = () => {
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
  };

  useEffect(() => {
    if (!authLoading && !subscriptionLoading && isPremiumFromUsers !== isPro) {
      console.warn('⚠️ Subscription mismatch:', {
        isPremiumFromUsers,
        isPro,
        hasSubscription: !!subscription,
      });
    }
  }, [isPremiumFromUsers, isPro, subscription, authLoading, subscriptionLoading]);

  useEffect(() => {
    const success = searchParams.get('success');
    const paymentUpdated = searchParams.get('payment_updated');

    if (success === 'true' && !showSuccessAlert) {
      setShowSuccessAlert(true);
      showSuccess(t('subscription.alerts.successMessage'));

      const timer = setTimeout(() => {
        const newUrl = window.location.pathname;
        router.replace(newUrl);
      }, 100);

      return () => clearTimeout(timer);
    }

    if (paymentUpdated === 'true' && !showSuccessAlert) {
      setShowSuccessAlert(true);
      showSuccess('결제 수단이 성공적으로 업데이트되었습니다.');

      const timer = setTimeout(() => {
        const newUrl = window.location.pathname;
        router.replace(newUrl);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [searchParams, showSuccessAlert, router, t]);

  const handleSyncSubscription = async () => {
    setSyncing(true);
    const toastId = showLoading('구독 정보를 Paddle과 동기화하는 중...');

    try {
      const token = await getIdToken();

      if (!token) {
        throw new Error(t('common.error'));
      }

      const response = await fetch('/api/subscription/sync', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('common.error'));
      }

      dismissToast(toastId);
      showSuccess('✅ 구독 정보가 성공적으로 동기화되었습니다.');

      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      dismissToast(toastId);
      showError(error instanceof Error ? error.message : t('common.error'));
    } finally {
      setSyncing(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription?.paddleSubscriptionId) return;

    setCanceling(true);
    const toastId = showLoading(t('subscription.cancelModal.processing'));

    try {
      const token = await getIdToken();
      
      if (!token) {
        throw new Error(t('common.error'));
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
        throw new Error(data.error || t('common.error'));
      }

      dismissToast(toastId);
      showSuccess(data.message || t('common.success'));
      setShowCancelModal(false);

      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      dismissToast(toastId);
      showError(error instanceof Error ? error.message : t('common.error'));
    } finally {
      setCanceling(false);
    }
  };

  const handleResumeSubscription = async () => {
    if (!subscription?.paddleSubscriptionId) return;

    const toastId = showLoading(t('common.loading'));

    try {
      const token = await getIdToken();
      
      if (!token) {
        throw new Error(t('common.error'));
      }

      const response = await fetch('/api/subscription/resume', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('common.error'));
      }

      dismissToast(toastId);
      showSuccess(data.message || t('common.success'));

      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      dismissToast(toastId);
      showError(error instanceof Error ? error.message : t('common.error'));
    }
  };

  // ✅ 수정: 환경 변수 기반 returnUrl 사용
  const handleUpdatePayment = async () => {
    if (!subscription?.paddleSubscriptionId) return;

    const toastId = showLoading(t('common.loading'));

    try {
      const token = await getIdToken();
      
      if (!token) {
        throw new Error(t('common.error'));
      }

      const baseUrl = getBaseUrl();
      const returnUrl = `${baseUrl}/subscription?payment_updated=true`;

      console.log('🔗 Return URL:', returnUrl);

      const response = await fetch('/api/subscription/update-payment', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('common.error'));
      }

      dismissToast(toastId);

      if (data.updateUrl) {
        console.log('🚀 Redirecting to:', data.updateUrl);
        window.location.href = data.updateUrl;
      }

    } catch (error) {
      dismissToast(toastId);
      showError(error instanceof Error ? error.message : t('common.error'));
    }
  };

  // ✅ 로딩 상태 - 스켈레톤 UI로 개선
  if (authLoading || subscriptionLoading || usageLoading) {
    return (
      <div className="space-y-6">
        {/* 헤더 스켈레톤 */}
        <div className="space-y-2">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* 구독 카드 스켈레톤 */}
        <SubscriptionCardSkeleton />
      </div>
    );
  }

  const actualIsPremium = isPremiumFromUsers || isPro;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{t('subscription.title')}</h1>
        
        {actualIsPremium && subscription && (
          <button
            onClick={handleSyncSubscription}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title={t('subscription.sync')}
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? t('subscription.syncing') : t('subscription.sync')}
          </button>
        )}
      </div>

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
                {t('subscription.alerts.successTitle')}
              </h3>
              <p className="text-green-700">
                {t('subscription.alerts.successMessage')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 취소 예정 알림 */}
      {cancelScheduled && daysUntilRenewal !== null && subscription && (
        <div className="mb-6 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-yellow-900 mb-1">
                {t('subscription.alerts.cancelScheduledTitle')}
              </h3>
              <p className="text-yellow-700 mb-3">
                {t('subscription.alerts.cancelScheduledMessage', { 
                  days: daysUntilRenewal,
                  date: subscription.currentPeriodEnd.toLocaleDateString() || ''
                })}
              </p>
              <button
                onClick={handleResumeSubscription}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {t('subscription.pro.resume')}
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
                {t('subscription.alerts.pastDueTitle')}
              </h3>
              <p className="text-red-700 mb-3">
                {t('subscription.alerts.pastDueMessage')}
              </p>

              {/* 상세 안내 */}
              <div className="bg-white/70 rounded-lg p-3 mb-4 text-sm text-red-800">
                <p className="font-medium mb-2">⏰ 결제 재시도 안내:</p>
                <ul className="space-y-1 ml-4">
                  <li>• Paddle이 자동으로 결제를 재시도합니다</li>
                  <li>• 유예 기간 동안 Pro 기능을 계속 사용하실 수 있습니다</li>
                  <li>• 결제 수단을 업데이트하시면 즉시 해결됩니다</li>
                  <li>• 재시도 실패 시 구독이 취소될 수 있습니다</li>
                </ul>
              </div>

              <button
                onClick={handleUpdatePayment}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                {t('subscription.alerts.updatePaymentButton')}
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
              <h2 className="text-2xl font-bold">{t('subscription.free.title')}</h2>
              <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                {t('subscription.free.badge')}
              </span>
            </div>
            <p className="text-gray-600">
              {t('subscription.free.description')}
            </p>
          </div>

          {/* 이번 달 사용량 */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                {t('subscription.free.usageTitle')}
              </span>
              <span className="text-lg font-bold text-gray-900">
                {t('subscription.free.usageLimit', { current: monthlyTotal, limit: USAGE_LIMITS.FREE_MONTHLY_LIMIT })}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((monthlyTotal / USAGE_LIMITS.FREE_MONTHLY_LIMIT) * 100, 100)}%` }}
              />
            </div>
            {monthlyTotal >= USAGE_LIMITS.FREE_MONTHLY_LIMIT && (
              <p className="text-sm text-red-600 mt-2">
                {t('subscription.free.usageFull')}
              </p>
            )}
          </div>

          {/* 제한사항 */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">{t('subscription.free.limitationsTitle')}</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">✗</span>
                <span>{t('subscription.free.limitation1')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">✗</span>
                <span>{t('subscription.free.limitation2')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">✗</span>
                <span>{t('subscription.free.limitation3')}</span>
              </li>
            </ul>
          </div>

          {/* Pro 혜택 */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold mb-3 text-blue-900">
              {t('subscription.free.benefitsTitle')}
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span className="font-medium">{t('subscription.free.benefit1')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span className="font-medium">{t('subscription.free.benefit2')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span className="font-medium">{t('subscription.free.benefit3')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span className="font-medium">{t('subscription.free.benefit4')}</span>
              </li>
            </ul>
          </div>

          {/* 업그레이드 버튼 */}
          <PaddleCheckout
            buttonText={t('subscription.free.upgradeButton')}
            size="lg"
            className="w-full"
          />

          <p className="text-center text-sm text-gray-500 mt-4">
            {t('subscription.free.footer')}
          </p>
        </div>
      )}

      {/* Pro 플랜 */}
      {actualIsPremium && subscription && (
        <div className="border rounded-lg p-6">
          {/* 헤더 */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">{t('subscription.pro.title')}</h2>
                {isActive ? (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    {t('subscription.pro.active')}
                  </span>
                ) : isPastDue ? (
                  <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                    {t('subscription.pro.pastDue')}
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                    {subscription.status}
                  </span>
                )}
              </div>
              <p className="text-gray-600">
                {t('subscription.pro.description')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">
                {formatCurrency(subscription.price, subscription.currency)}
              </p>
              <p className="text-sm text-gray-600">{subscription.currency}/월</p>
            </div>
          </div>

          {/* 구독 정보 */}
          <div className="mb-6 space-y-3">
            <div className="flex justify-between p-3 bg-gray-50 rounded">
              <span className="text-gray-600">{t('subscription.pro.startDate')}</span>
              <span className="font-medium">
                {subscription.createdAt.toLocaleDateString()}
              </span>
            </div>
            
            <div className="flex justify-between p-3 bg-gray-50 rounded">
              <span className="text-gray-600">{t('subscription.pro.nextBilling')}</span>
              <span className="font-medium">
                {subscription.currentPeriodEnd.toLocaleDateString()}
              </span>
            </div>

            <div className="flex justify-between p-3 bg-gray-50 rounded">
              <span className="text-gray-600">{t('subscription.pro.amount')}</span>
              <span className="font-medium">
                {formatCurrency(subscription.price, subscription.currency)} / 월
              </span>
            </div>

            {daysUntilRenewal !== null && (
              <div className="flex justify-between p-3 bg-blue-50 rounded">
                <span className="text-blue-700 font-medium">
                  {cancelScheduled ? t('subscription.pro.cancellation') : t('subscription.pro.renewal')}
                </span>
                <span className="font-bold text-blue-900">
                  {t('subscription.pro.daysLeft', { days: daysUntilRenewal })}
                </span>
              </div>
            )}
          </div>

          {/* Pro 혜택 */}
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold mb-3 text-green-900">
              {t('subscription.pro.benefitsTitle')}
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>{t('subscription.pro.benefit1')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>{t('subscription.pro.benefit2')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>{t('subscription.pro.benefit3')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>{t('subscription.pro.benefit4')}</span>
              </li>
            </ul>
          </div>

          {/* 관리 버튼들 */}
          <div className="space-y-3">
            <button
              onClick={handleUpdatePayment}
              className="w-full px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              {t('subscription.pro.updatePayment')}
            </button>

            {!cancelScheduled ? (
              <button
                onClick={() => setShowCancelModal(true)}
                className="w-full px-6 py-3 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 font-medium transition-colors"
              >
                {t('subscription.pro.cancel')}
              </button>
            ) : (
              <button
                onClick={handleResumeSubscription}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                {t('subscription.pro.resume')}
              </button>
            )}
          </div>

          {/* 추가 정보 */}
          <p className="text-center text-sm text-gray-500 mt-6">
            {t('subscription.pro.footer')}
          </p>
        </div>
      )}

      {/* 구독 취소 확인 모달 */}
      {showCancelModal && subscription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">
              {t('subscription.cancelModal.title')}
            </h3>

            <p className="text-gray-600 mb-4">
              {t('subscription.cancelModal.message', {
                date: subscription.currentPeriodEnd.toLocaleDateString() || ''
              })}
            </p>

            {/* 데이터 보관 안내 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">
                ✅ 취소 후에도 데이터는 안전하게 보관됩니다
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 모든 요약 기록은 계정에 그대로 유지됩니다</li>
                <li>• {subscription.currentPeriodEnd.toLocaleDateString()}까지 Pro 기능 사용 가능</li>
                <li>• 언제든지 다시 구독을 재개할 수 있습니다</li>
                <li>• 구독 종료 후 무료 플랜으로 자동 전환됩니다</li>
              </ul>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleCancelSubscription}
                disabled={canceling}
                className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50"
              >
                {canceling ? t('subscription.cancelModal.processing') : t('subscription.cancelModal.confirmButton')}
              </button>

              <button
                onClick={() => setShowCancelModal(false)}
                disabled={canceling}
                className="w-full px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
              >
                {t('subscription.cancelModal.cancelButton')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}