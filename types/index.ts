// types/index.ts
import { Timestamp } from 'firebase/firestore';

// ============================================
// 사용자 관련 타입
// ============================================

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  plan: 'free' | 'pro';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  emailVerified: boolean;
}

// ============================================
// 요약 기록 타입 (Chrome 확장에서 생성)
// ============================================

export interface HistoryItem {
  id: string;
  userId: string;
  title: string;
  url?: string;
  // ✅ Firebase에 summary로 저장되므로 summary 필드 추가
  summary?: string;
  // ✅ 하위 호환성을 위해 content도 유지
  content?: string;
  createdAt: Timestamp;
  deletedAt?: Timestamp;
  metadata?: {
    domain?: string;
    tags?: string[];
  };
}

// 클라이언트에서 사용할 변환된 타입 (Timestamp → Date)
export interface HistoryItemConverted extends Omit<HistoryItem, 'createdAt' | 'deletedAt'> {
  createdAt: Date;
  deletedAt?: Date;
}

// ============================================
// 일일 통계 타입 (Chrome 확장에서 생성)
// ============================================

export interface DailyStats {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD 형식
  count: number;
  isPremium: boolean;
  createdAt: Timestamp;
}

// 클라이언트에서 사용할 변환된 타입
export interface DailyStatsConverted extends Omit<DailyStats, 'createdAt'> {
  createdAt: Date;
}

// ============================================
// 구독 관련 타입
// ============================================

export type SubscriptionPlan = 'free' | 'pro';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due';

export interface Subscription {
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  billingKey?: string;
  currentPeriodEnd?: Timestamp;
  cancelAtPeriodEnd: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// 클라이언트에서 사용할 변환된 타입
export interface SubscriptionConverted extends Omit<Subscription, 'createdAt' | 'updatedAt' | 'currentPeriodEnd'> {
  createdAt: Date;
  updatedAt: Date;
  currentPeriodEnd?: Date;
}

// ============================================
// 결제 관련 타입
// ============================================

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentMethod = 'card' | 'bank_transfer' | 'virtual_account' | 'mobile';

export interface Payment {
  id: string;
  userId: string;
  orderId: string;
  amount: number;
  status: PaymentStatus;
  method: PaymentMethod;
  createdAt: Timestamp;
  paidAt?: Timestamp;
  failureReason?: string;
}

// 클라이언트에서 사용할 변환된 타입
export interface PaymentConverted extends Omit<Payment, 'createdAt' | 'paidAt'> {
  createdAt: Date;
  paidAt?: Date;
}

// ============================================
// API 응답 타입
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================
// 사용량 관련 타입
// ============================================

export interface UsageInfo {
  count: number;
  limit: number;
  remaining: number;
  isPro: boolean;
}

export interface UsageStats {
  daily: DailyStats[];
  monthlyTotal: number;
  weeklyTotal: number;
  averagePerDay: number;
}

// ============================================
// 검색 & 필터링 타입
// ============================================

export interface HistoryFilters {
  searchTerm?: string;
  domain?: string;
  startDate?: Date;
  endDate?: Date;
  isFavorite?: boolean;
}

export type SortOrder = 'asc' | 'desc';

export interface HistorySortOptions {
  field: 'createdAt' | 'title';
  order: SortOrder;
}

// ============================================
// 통계 타입
// ============================================

export interface DomainStats {
  domain: string;
  count: number;
  percentage: number;
}

export interface ActivityStats {
  totalSummaries: number;
  thisMonth: number;
  thisWeek: number;
  topDomains: DomainStats[];
  mostActiveDay: string;
  averagePerDay: number;
}

// ============================================
// 토스페이먼츠 관련 타입
// ============================================

export interface TossPaymentRequest {
  amount: number;
  orderId: string;
  orderName: string;
  customerKey: string;
  successUrl: string;
  failUrl: string;
}

export interface TossBillingKeyRequest {
  customerKey: string;
  cardNumber: string;
  cardExpirationYear: string;
  cardExpirationMonth: string;
  cardPassword: string;
  customerIdentityNumber: string;
}

export interface TossWebhookPayload {
  eventType: 'PAYMENT_CONFIRMED' | 'PAYMENT_FAILED' | 'BILLING_KEY_DELETED';
  orderId: string;
  amount?: number;
  customerKey: string;
  billingKey?: string;
  method?: string;
  createdAt: string;
}

// ============================================
// 폼 관련 타입
// ============================================

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  email: string;
  password: string;
  passwordConfirm: string;
  displayName?: string;
  agreeToTerms: boolean;
}

export interface ProfileUpdateFormData {
  displayName?: string;
  photoURL?: string;
}

export interface PasswordChangeFormData {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
}

// ============================================
// 유틸리티 타입
// ============================================

// Firestore 문서를 클라이언트 타입으로 변환
export type ConvertTimestamp<T> = {
  [K in keyof T]: T[K] extends Timestamp
    ? Date
    : T[K] extends Timestamp | undefined
    ? Date | undefined
    : T[K];
};

// Partial 타입의 특정 필드만 required로 변경
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

// 특정 필드만 optional로 변경
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;