// lib/firebase/utils.ts
import { Timestamp } from 'firebase-admin/firestore';

/**
 * Firestore Timestamp 타입 정의
 */
export interface FirestoreTimestamp {
  _seconds?: number;
  _nanoseconds?: number;
  toDate?: () => Date;
}

/**
 * Firestore Timestamp를 Date로 변환
 * ✅ any 타입 제거 - 타입 안전성 개선
 */
export function timestampToDate(
  timestamp: Timestamp | FirestoreTimestamp | Date | string | number | null | undefined
): Date {
  if (!timestamp) return new Date();

  // Date 객체인 경우
  if (timestamp instanceof Date) return timestamp;

  // Timestamp 객체인 경우 (toDate 메서드 있음)
  if (typeof timestamp === 'object' && 'toDate' in timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }

  // _seconds 필드가 있는 경우
  if (typeof timestamp === 'object' && '_seconds' in timestamp && typeof timestamp._seconds === 'number') {
    return new Date(timestamp._seconds * 1000);
  }

  // 문자열이나 숫자인 경우
  if (typeof timestamp === 'string' || typeof timestamp === 'number') {
    return new Date(timestamp);
  }

  // 기타 경우 현재 시간 반환
  return new Date();
}

/**
 * Date를 YYYY-MM-DD 형식으로 변환
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * 날짜 범위 생성
 */
export function getDateRange(days: number): { startDate: string; endDate: string } {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
  };
}

/**
 * 도메인 추출
 */
export function extractDomain(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return null;
  }
}