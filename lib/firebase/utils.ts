// lib/firebase/utils.ts
import { Timestamp } from 'firebase-admin/firestore';

/**
 * Firestore Timestamp를 Date로 변환
 */
export function timestampToDate(timestamp: Timestamp | any): Date {
  if (!timestamp) return new Date();
  if (timestamp.toDate) return timestamp.toDate();
  if (timestamp._seconds) {
    return new Date(timestamp._seconds * 1000);
  }
  return new Date(timestamp);
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