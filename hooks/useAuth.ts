// hooks/useAuth.ts
'use client';

/**
 * ✅ AuthContext를 사용하는 것을 권장
 * 이 파일은 하위 호환성을 위해 유지
 *
 * AuthContext에서 제공하는 기능:
 * - user: Firebase Auth User
 * - userProfile: Firestore users 컬렉션 데이터
 * - isPremium: 프리미엄 여부
 * - subscriptionPlan: 'free' | 'pro'
 * - loading: 로딩 상태
 * - error: 에러 상태
 */

import { useAuth as useAuthContext } from '@/contexts/AuthContext';

export {
  useAuth,
  useAuthContext,
  type UserProfile
} from '@/contexts/AuthContext';

/**
 * 사용자 로그인 여부만 확인하는 간단한 훅
 *
 * @returns boolean - 로그인 여부
 *
 * @example
 * const isLoggedIn = useIsAuthenticated();
 * if (isLoggedIn) {
 *   // 로그인한 사용자만 접근
 * }
 */
export function useIsAuthenticated(): boolean {
  const { user, loading } = useAuthContext();
  return !loading && user !== null;
}

/**
 * 현재 사용자 ID를 반환하는 훅
 *
 * @returns string | null - 사용자 ID (로그아웃 시 null)
 *
 * @example
 * const userId = useUserId();
 * if (userId) {
 *   fetchUserData(userId);
 * }
 */
export function useUserId(): string | null {
  const { user } = useAuthContext();
  return user?.uid || null;
}

/**
 * 사용자가 Pro 플랜인지 확인하는 훅
 *
 * @returns boolean - Pro 플랜 여부
 *
 * @example
 * const isPro = useIsPremium();
 * if (isPro) {
 *   // Pro 기능 표시
 * }
 */
export function useIsPremium(): boolean {
  const { isPremium } = useAuthContext();
  return isPremium;
}

/**
 * 구독 플랜을 반환하는 훅
 *
 * @returns 'free' | 'pro' - 구독 플랜
 *
 * @example
 * const plan = useSubscriptionPlan();
 * if (plan === 'pro') {
 *   // Pro 전용 UI
 * }
 */
export function useSubscriptionPlan(): 'free' | 'pro' {
  const { subscriptionPlan } = useAuthContext();
  return subscriptionPlan;
}