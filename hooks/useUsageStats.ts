// hooks/useUsageStats.ts
'use client';

import useSWR from 'swr';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from 'firebase/firestore';
import { getFirestoreInstance } from '@/lib/firebase/client';
import { DailyDocument } from '@/lib/firebase/types';
import { useAuth } from '@/contexts/AuthContext';

interface UseUsageStatsOptions {
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
}

interface UseUsageStatsReturn {
  dailyStats: DailyDocument[];
  monthlyTotal: number;
  weeklyTotal: number;
  loading: boolean;
  error: Error | null;
}

/**
 * 날짜를 YYYY-MM-DD 형식으로 변환
 */
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * 사용자의 사용량 통계를 조회하는 훅
 * ✅ 서브컬렉션 구조: /users/{userId}/daily
 */
export function useUsageStats(
  userId: string | null,
  options: UseUsageStatsOptions = {}
): UseUsageStatsReturn {
  const { startDate, endDate } = options;

  const defaultEndDate = formatDate(new Date());
  const defaultStartDate = formatDate(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  );

  const actualStartDate = startDate || defaultStartDate;
  const actualEndDate = endDate || defaultEndDate;

  const { data, error } = useSWR(
    userId ? ['usage-stats', userId, actualStartDate, actualEndDate] : null,
    async () => {
      if (!userId) return [];

      const db = getFirestoreInstance();
      
      // ✅ 서브컬렉션 경로: /users/{userId}/daily
      const dailyRef = collection(db, 'users', userId, 'daily');
      
      // ✅ userId 필터 제거 (이미 경로에 포함)
      const q = query(
        dailyRef,
        where('date', '>=', actualStartDate),
        where('date', '<=', actualEndDate),
        orderBy('date', 'asc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as DailyDocument[];
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const dailyStats = data || [];

  // 주간 합계 (최근 7일)
  const weeklyTotal = dailyStats
    .slice(-7)
    .reduce((sum, stat) => sum + (stat.count || 0), 0);

  // 월간 합계 (전체 기간)
  const monthlyTotal = dailyStats.reduce(
    (sum, stat) => sum + (stat.count || 0),
    0
  );

  return {
    dailyStats,
    monthlyTotal,
    weeklyTotal,
    loading: !data && !error,
    error: error || null,
  };
}

/**
 * 이번 달 사용량을 조회하는 훅
 * ✅ 서브컬렉션 구조: /users/{userId}/daily
 */
export function useMonthlyUsage(userId: string | null) {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const startDate = formatDate(startOfMonth);
  const endDate = formatDate(today);

  const { dailyStats, monthlyTotal, loading, error } = useUsageStats(userId, {
    startDate,
    endDate,
  });

  return {
    total: monthlyTotal,
    dailyStats,
    loading,
    error,
  };
}

/**
 * 최근 N일 사용량을 조회하는 훅
 * ✅ 서브컬렉션 구조: /users/{userId}/daily
 */
export function useRecentUsage(userId: string | null, days: number = 7) {
  const endDate = formatDate(new Date());
  const startDate = formatDate(
    new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  );

  return useUsageStats(userId, { startDate, endDate });
}

/**
 * 특정 연도/월의 사용량을 조회하는 훅
 * ✅ 서브컬렉션 구조: /users/{userId}/daily
 */
export function useMonthUsage(
  userId: string | null,
  year: number,
  month: number // 1-12
) {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  const { dailyStats, monthlyTotal, loading, error } = useUsageStats(userId, {
    startDate,
    endDate,
  });

  return {
    total: monthlyTotal,
    dailyStats,
    loading,
    error,
  };
}

/**
 * 현재 로그인한 사용자의 이번 달 사용량 조회 (간편 버전)
 * useAuth에서 자동으로 userId를 가져옴
 * ✅ 서브컬렉션 구조: /users/{userId}/daily
 */
export function useCurrentMonthlyUsage() {
  const { user } = useAuth();
  return useMonthlyUsage(user?.uid || null);
}