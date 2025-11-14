// lib/firebase/queries.ts
import { getAdminFirestore } from './admin';
import { HistoryDocument, DailyDocument } from './types';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * 쿼리 결과 타입
 */
export interface QueryResult<T> {
  data: T[];
  lastDoc: any;
  hasMore: boolean;
}

/**
 * 에러 핸들링 래퍼
 */
async function handleQuery<T>(
  queryFn: () => Promise<T>,
  errorMessage: string
): Promise<T> {
  try {
    return await queryFn();
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    throw new Error(
      `${errorMessage}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * 1. 사용자의 히스토리 조회
 * ✅ 서브컬렉션 구조: /users/{userId}/history
 * - deletedAt이 null인 문서만 조회
 * - createdAt 기준 내림차순
 * - 페이지네이션 지원
 */
export async function getUserHistory(
  userId: string,
  options: {
    limit?: number;
    startAfter?: any;
  } = {}
): Promise<QueryResult<HistoryDocument & { id: string }>> {
  return handleQuery(async () => {
    const { limit = 20, startAfter } = options;

    const db = getAdminFirestore();
    
    // ✅ 서브컬렉션 경로
    let query = db
      .collection('users')
      .doc(userId)
      .collection('history')
      .where('deletedAt', '==', null)
      .orderBy('createdAt', 'desc')
      .limit(limit + 1); // +1로 hasMore 확인

    // 페이지네이션
    if (startAfter) {
      query = query.startAfter(startAfter);
    }

    const snapshot = await query.get();
    const docs = snapshot.docs;

    // hasMore 확인
    const hasMore = docs.length > limit;
    const data = docs.slice(0, limit).map((doc) => ({
      id: doc.id,
      ...(doc.data() as HistoryDocument),
    }));

    return {
      data,
      lastDoc: data.length > 0 ? docs[limit - 1] : null,
      hasMore,
    };
  }, 'Failed to get user history');
}

/**
 * 2. 사용자의 일일 통계 조회
 * ✅ 서브컬렉션 구조: /users/{userId}/daily
 * - 특정 기간의 daily 통계
 * - date 기준 오름차순
 */
export async function getUserDailyStats(
  userId: string,
  startDate: string, // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
): Promise<DailyDocument[]> {
  return handleQuery(async () => {
    const db = getAdminFirestore();
    
    // ✅ 서브컬렉션 경로
    const snapshot = await db
      .collection('users')
      .doc(userId)
      .collection('daily')
      .where('date', '>=', startDate)
      .where('date', '<=', endDate)
      .orderBy('date', 'asc')
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as DailyDocument),
    })) as DailyDocument[];
  }, 'Failed to get daily stats');
}

/**
 * 3. 히스토리 검색 (title + summary/content 기반)
 * ✅ 서브컬렉션 구조: /users/{userId}/history
 * - deletedAt이 null인 문서만
 * - 대소문자 구분 없는 검색 (클라이언트에서 필터링)
 * - ✅ summary 또는 content 필드 모두 검색
 */
export async function searchHistory(
  userId: string,
  searchTerm: string,
  options: {
    limit?: number;
    startAfter?: any;
  } = {}
): Promise<QueryResult<HistoryDocument & { id: string }>> {
  return handleQuery(async () => {
    const { limit = 20, startAfter } = options;

    const db = getAdminFirestore();

    // Firestore는 부분 문자열 검색을 지원하지 않으므로
    // 모든 데이터를 가져온 후 필터링
    let query = db
      .collection('users')
      .doc(userId)
      .collection('history')
      .where('deletedAt', '==', null)
      .orderBy('createdAt', 'desc');

    if (startAfter) {
      query = query.startAfter(startAfter);
    }

    const snapshot = await query.limit(100).get(); // 충분한 데이터 가져오기

    // ✅ 클라이언트 사이드 필터링 (summary와 content 모두 검색)
    const searchLower = searchTerm.toLowerCase();
    const filtered = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        doc: doc,
        ...(doc.data() as HistoryDocument),
      }))
      .filter((item) => {
        const summaryContent = item.summary || item.content || '';
        return (
          item.title.toLowerCase().includes(searchLower) ||
          summaryContent.toLowerCase().includes(searchLower)
        );
      });

    const hasMore = filtered.length > limit;
    const data = filtered.slice(0, limit);

    return {
      data: data.map(({ doc, ...rest }) => rest),
      lastDoc: data.length > 0 ? data[data.length - 1].doc : null,
      hasMore,
    };
  }, 'Failed to search history');
}

/**
 * 4. 도메인별 히스토리 조회
 * ✅ 서브컬렉션 구조: /users/{userId}/history
 * - metadata.domain으로 필터링
 * - deletedAt이 null인 문서만
 */
export async function getHistoryByDomain(
  userId: string,
  domain: string,
  options: {
    limit?: number;
    startAfter?: any;
  } = {}
): Promise<QueryResult<HistoryDocument & { id: string }>> {
  return handleQuery(async () => {
    const { limit = 20, startAfter } = options;

    const db = getAdminFirestore();

    let query = db
      .collection('users')
      .doc(userId)
      .collection('history')
      .where('deletedAt', '==', null)
      .where('metadata.domain', '==', domain)
      .orderBy('createdAt', 'desc')
      .limit(limit + 1);

    if (startAfter) {
      query = query.startAfter(startAfter);
    }

    const snapshot = await query.get();
    const docs = snapshot.docs;

    const hasMore = docs.length > limit;
    const data = docs.slice(0, limit).map((doc) => ({
      id: doc.id,
      ...(doc.data() as HistoryDocument),
    }));

    return {
      data,
      lastDoc: data.length > 0 ? docs[limit - 1] : null,
      hasMore,
    };
  }, 'Failed to get history by domain');
}

/**
 * 5. 단일 히스토리 문서 조회
 * ✅ 서브컬렉션 구조: /users/{userId}/history
 */
export async function getHistoryById(
  userId: string,
  historyId: string
): Promise<(HistoryDocument & { id: string }) | null> {
  return handleQuery(async () => {
    const db = getAdminFirestore();
    
    const doc = await db
      .collection('users')
      .doc(userId)
      .collection('history')
      .doc(historyId)
      .get();

    if (!doc.exists) {
      return null;
    }

    const data = doc.data() as HistoryDocument;

    // deletedAt이 있으면 null 반환
    if (data.deletedAt) {
      return null;
    }

    return {
      id: doc.id,
      ...data,
    };
  }, 'Failed to get history by ID');
}

/**
 * 6. 사용자의 총 히스토리 개수
 * ✅ 서브컬렉션 구조: /users/{userId}/history
 */
export async function getUserHistoryCount(userId: string): Promise<number> {
  return handleQuery(async () => {
    const db = getAdminFirestore();
    
    const snapshot = await db
      .collection('users')
      .doc(userId)
      .collection('history')
      .where('deletedAt', '==', null)
      .count()
      .get();

    return snapshot.data().count;
  }, 'Failed to get history count');
}

/**
 * 7. 사용자의 고유 도메인 목록
 * ✅ 서브컬렉션 구조: /users/{userId}/history
 */
export async function getUserDomains(userId: string): Promise<string[]> {
  return handleQuery(async () => {
    const db = getAdminFirestore();
    
    const snapshot = await db
      .collection('users')
      .doc(userId)
      .collection('history')
      .where('deletedAt', '==', null)
      .select('metadata.domain')
      .get();

    const domains = new Set<string>();

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data.metadata?.domain) {
        domains.add(data.metadata.domain);
      }
    });

    return Array.from(domains).sort();
  }, 'Failed to get user domains');
}

/**
 * 8. 월간 사용량 통계
 * ✅ 서브컬렉션 구조: /users/{userId}/daily
 */
export async function getMonthlyUsage(
  userId: string,
  year: number,
  month: number
): Promise<{
  totalCount: number;
  dailyStats: DailyDocument[];
  isPremium: boolean;
}> {
  return handleQuery(async () => {
    // 해당 월의 시작일과 종료일
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const dailyStats = await getUserDailyStats(userId, startDate, endDate);

    const totalCount = dailyStats.reduce((sum, stat) => sum + (stat.count || 0), 0);
    const isPremium = dailyStats.some((stat) => stat.isPremium);

    return {
      totalCount,
      dailyStats,
      isPremium,
    };
  }, 'Failed to get monthly usage');
}

/**
 * 9. 최근 N일 사용량 통계
 * ✅ 서브컬렉션 구조: /users/{userId}/daily
 */
export async function getRecentUsage(
  userId: string,
  days: number = 7
): Promise<DailyDocument[]> {
  return handleQuery(async () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0];
    };

    return await getUserDailyStats(
      userId,
      formatDate(startDate),
      formatDate(endDate)
    );
  }, 'Failed to get recent usage');
}

/**
 * 10. 히스토리 소프트 삭제
 * ✅ 서브컬렉션 구조: /users/{userId}/history
 */
export async function softDeleteHistory(
  userId: string,
  historyId: string
): Promise<void> {
  return handleQuery(async () => {
    const db = getAdminFirestore();
    
    await db
      .collection('users')
      .doc(userId)
      .collection('history')
      .doc(historyId)
      .update({
        deletedAt: Timestamp.now(),
      });
  }, 'Failed to soft delete history');
}

/**
 * 11. 여러 히스토리 일괄 소프트 삭제
 * ✅ 서브컬렉션 구조: /users/{userId}/history
 */
export async function bulkSoftDeleteHistory(
  userId: string,
  historyIds: string[]
): Promise<void> {
  return handleQuery(async () => {
    const db = getAdminFirestore();
    const batch = db.batch();
    const deletedAt = Timestamp.now();

    historyIds.forEach((id) => {
      const docRef = db
        .collection('users')
        .doc(userId)
        .collection('history')
        .doc(id);
      batch.update(docRef, { deletedAt });
    });

    await batch.commit();
  }, 'Failed to bulk soft delete history');
}