// hooks/useSubscription.ts
'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
  DocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import { getFirestoreInstance } from '@/lib/firebase/client';
import { useAuthContext } from '@/contexts/AuthContext';

/**
 * Firestore Subscription 타입 (Paddle 버전)
 */
export interface Subscription {
  id: string;
  userId: string;
  paddleSubscriptionId: string;
  paddleCustomerId: string;
  plan: 'free' | 'pro';
  status: 'active' | 'canceled' | 'past_due' | 'paused' | 'trialing';
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  nextBillingDate: Date | null;
  price: number;
  currency: string;
  priceId: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Hook 반환 타입
 */
export interface UseSubscriptionReturn {
  subscription: Subscription | null;
  isPro: boolean;
  isFree: boolean;
  isActive: boolean;
  isPastDue: boolean;
  isCanceled: boolean;
  isTrialing: boolean;
  cancelScheduled: boolean;
  daysUntilRenewal: number | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Timestamp를 Date로 변환
 */
function timestampToDate(timestamp: unknown): Date {
  if (!timestamp) return new Date();
  if (timestamp instanceof Date) return timestamp;
  if (timestamp instanceof Timestamp) return timestamp.toDate();

  // Firestore Timestamp 객체 (toDate 메서드 있음)
  if (typeof timestamp === 'object' && timestamp !== null && 'toDate' in timestamp) {
    return (timestamp as { toDate: () => Date }).toDate();
  }

  // Legacy Timestamp 형식 (_seconds 필드)
  if (typeof timestamp === 'object' && timestamp !== null && '_seconds' in timestamp) {
    const seconds = (timestamp as { _seconds: number })._seconds;
    return new Date(seconds * 1000);
  }

  // 문자열이나 숫자로 변환 시도
  return new Date(timestamp as string | number);
}

/**
 * 구독 문서를 Subscription 타입으로 변환
 */
function convertSubscriptionDoc(doc: DocumentSnapshot<DocumentData>): Subscription {
  const data = doc.data();

  if (!data) {
    throw new Error('Document data is undefined');
  }

  return {
    id: doc.id,
    userId: data.userId as string,
    paddleSubscriptionId: (data.paddleSubscriptionId as string) || '',
    paddleCustomerId: (data.paddleCustomerId as string) || '',
    plan: (data.plan as 'free' | 'pro') || 'free',
    status: (data.status as Subscription['status']) || 'active',
    currentPeriodEnd: timestampToDate(data.currentPeriodEnd),
    cancelAtPeriodEnd: (data.cancelAtPeriodEnd as boolean) || false,
    nextBillingDate: data.nextBillingDate ? timestampToDate(data.nextBillingDate) : null,
    price: (data.price as number) || 0,
    currency: (data.currency as string) || 'KRW',
    priceId: (data.priceId as string) || '',
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
  };
}

/**
 * 만료일까지 남은 일수 계산
 */
function calculateDaysUntilRenewal(endDate: Date): number {
  const now = new Date();
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * 구독 상태 관리 훅 (실시간 업데이트)
 * ✅ 인덱스 불필요한 최적화된 쿼리
 * 
 * @returns UseSubscriptionReturn
 * 
 * @example
 * const { isPro, isActive, subscription, daysUntilRenewal } = useSubscription();
 * 
 * if (isPro && isActive) {
 *   // Pro 기능 표시
 * }
 */
export function useSubscription(): UseSubscriptionReturn {
  const { user } = useAuthContext();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Firestore 실시간 구독
  useEffect(() => {
    if (!user?.uid) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const db = getFirestoreInstance();
    const subscriptionsRef = collection(db, 'subscription');

    // ✅ 인덱스 불필요한 쿼리: userId만 필터링
    // orderBy를 제거하고 클라이언트 사이드에서 정렬
    const q = query(
      subscriptionsRef,
      where('userId', '==', user.uid)
    );

    // 실시간 리스너 설정
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          if (snapshot.empty) {
            // 구독이 없으면 Free 플랜
            setSubscription(null);
            setError(null);
          } else {
            // ✅ 클라이언트 사이드 정렬: 최신 구독 선택
            const docs = snapshot.docs
              .map(doc => ({
                doc,
                data: doc.data(),
              }))
              .sort((a, b) => {
                const timeA = a.data.createdAt?.toMillis() || 0;
                const timeB = b.data.createdAt?.toMillis() || 0;
                return timeB - timeA; // 내림차순 (최신 것 먼저)
              });

            const latestDoc = docs[0].doc;
            const sub = convertSubscriptionDoc(latestDoc);
            setSubscription(sub);
            setError(null);
          }
        } catch (err) {
          console.error('Subscription parsing error:', err);
          setError(err as Error);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error('Subscription listener error:', err);
        setError(err as Error);
        setLoading(false);
      }
    );

    // 클린업
    return () => {
      unsubscribe();
    };
  }, [user?.uid]);

  // 계산된 값들
  const isPro = subscription?.plan === 'pro';
  const isFree = !isPro;
  const isActive = subscription?.status === 'active' || subscription?.status === 'trialing';
  const isPastDue = subscription?.status === 'past_due';
  const isCanceled = subscription?.status === 'canceled';
  const isTrialing = subscription?.status === 'trialing';
  const cancelScheduled = subscription?.cancelAtPeriodEnd || false;

  const daysUntilRenewal = subscription?.currentPeriodEnd
    ? calculateDaysUntilRenewal(subscription.currentPeriodEnd)
    : null;

  return {
    subscription,
    isPro,
    isFree,
    isActive,
    isPastDue,
    isCanceled,
    isTrialing,
    cancelScheduled,
    daysUntilRenewal,
    loading,
    error,
  };
}

/**
 * 구독 상태 체크 유틸리티
 */
export function canAccessProFeatures(subscription: Subscription | null): boolean {
  if (!subscription) return false;
  return (
    subscription.plan === 'pro' &&
    (subscription.status === 'active' || subscription.status === 'trialing')
  );
}

/**
 * 구독 만료 경고가 필요한지 확인
 */
export function shouldShowRenewalWarning(
  subscription: Subscription | null,
  warningDays: number = 7
): boolean {
  if (!subscription) return false;
  if (!subscription.cancelAtPeriodEnd) return false;

  const daysUntilRenewal = calculateDaysUntilRenewal(subscription.currentPeriodEnd);
  return daysUntilRenewal <= warningDays && daysUntilRenewal > 0;
}