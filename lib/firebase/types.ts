// lib/firebase/types.ts
import { Timestamp } from 'firebase-admin/firestore';

/**
 * History 컬렉션 문서 타입
 * ✅ Firebase에 summary로 저장되므로 summary 필드 추가
 */
export interface HistoryDocument {
  userId: string;
  title: string;
  url?: string;
  // ✅ Chrome 확장에서 summary로 저장
  summary?: string;
  // ✅ 하위 호환성을 위해 content도 지원
  content?: string;
  createdAt: Timestamp;
  deletedAt?: Timestamp | null;
  metadata?: {
    domain?: string;
    tags?: string[];
  };
}

/**
 * Daily 컬렉션 문서 타입
 */
export interface DailyDocument {
  id?: string;
  userId: string;
  date: string; // YYYY-MM-DD
  count: number;
  isPremium: boolean;
  createdAt: Timestamp;
}

/**
 * Subscription 컬렉션 문서 타입
 */
export interface SubscriptionDocument {
  userId: string;
  plan: 'free' | 'pro';
  status: 'active' | 'canceled' | 'past_due';
  billingKey?: string;
  currentPeriodEnd?: Timestamp;
  cancelAtPeriodEnd: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * 월간 사용량 통계
 */
export interface MonthlyUsage {
  totalCount: number;
  dailyStats: DailyDocument[];
  isPremium: boolean;
}

/**
 * 도메인 통계
 */
export interface DomainStats {
  domain: string;
  count: number;
}