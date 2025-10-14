// lib/firebase/types.ts
import { Timestamp } from 'firebase-admin/firestore';

/**
 * History 컬렉션 문서 타입
 */
export interface HistoryDocument {
  userId: string;
  title: string;
  url?: string;
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