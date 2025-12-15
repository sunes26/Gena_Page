// hooks/useHistory.ts
'use client';

import { useState, useCallback } from 'react';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { getFirestoreInstance } from '@/lib/firebase/client';
import { HistoryDocument } from '@/lib/firebase/types';

interface UseHistoryOptions {
  pageSize?: number;
}

interface UseHistoryReturn {
  history: (HistoryDocument & { id: string })[];
  loading: boolean;
  error: Error | null;
  loadMore: () => void;
  hasMore: boolean;
  search: (term: string) => void;
  filterByDomain: (domain: string) => void;
  isLoadingMore: boolean;
  refresh: () => void;
}

// ✅ 페이지 데이터 타입 정의
interface PageData {
  data: (HistoryDocument & { id: string })[];
  lastDoc: QueryDocumentSnapshot | null;
  hasMore: boolean;
}

/**
 * 사용자의 요약 기록을 조회하는 훅 (무한 스크롤 지원)
 * ✅ 서브컬렉션 구조: /users/{userId}/history
 * ✅ deletedAt 필터링은 클라이언트에서 처리
 */
export function useHistory(
  userId: string | null,
  options: UseHistoryOptions = {}
): UseHistoryReturn {
  const { pageSize = 20 } = options;
  const [searchTerm, setSearchTerm] = useState('');
  const [domainFilter, setDomainFilter] = useState('');

  // ✅ getKey 함수 - 타입 명시
  const getKey = (
    pageIndex: number,
    previousPageData: PageData | null
  ): [string, string, string, string, number, number, string | null] | null => {
    if (!userId) return null;

    // 이전 페이지에 데이터가 없으면 더 이상 로드하지 않음
    if (previousPageData && !previousPageData.hasMore) return null;

    // ✅ lastDoc의 ID를 키에 포함 (객체가 아닌 ID만)
    const lastDocId = previousPageData?.lastDoc?.id || null;

    return ['history', userId, searchTerm, domainFilter, pageSize, pageIndex, lastDocId];
  };

  // ✅ fetcher 함수 - deletedAt 쿼리 조건 제거
  const fetcher = async (
    key: [string, string, string, string, number, number, string | null],
    previousPageData?: PageData
  ): Promise<PageData> => {
    const [_key, uid, search, domain, limitNum, pageIndex, lastDocId] = key;

    const db = getFirestoreInstance();

    // ✅ 서브컬렉션 경로: /users/{userId}/history
    const historyRef = collection(db, 'users', uid, 'history');

    // ✅ where('deletedAt', '==', null) 제거!
    // 대신 클라이언트 사이드에서 필터링
    let q = query(
      historyRef,
      orderBy('createdAt', 'desc')
    );

    // ✅ previousPageData에서 lastDoc 가져와서 페이지네이션
    if (previousPageData?.lastDoc) {
      q = query(q, startAfter(previousPageData.lastDoc));
    }

    // limit + 1로 hasMore 확인
    q = query(q, limit(limitNum + 1));

    const snapshot = await getDocs(q);
    const docs = snapshot.docs;

    // hasMore 확인
    const hasMore = docs.length > limitNum;
    const actualDocs = docs.slice(0, limitNum);

    let results = actualDocs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as HistoryDocument),
    }));

    // ✅ 1. deletedAt 필터링 (클라이언트 사이드)
    results = results.filter((item) => !item.deletedAt);

    // ✅ 2. 도메인 필터링 (클라이언트 사이드)
    if (domain) {
      results = results.filter((item) => item.metadata?.domain === domain);
    }

    // ✅ 3. 검색 필터링 (summary와 content 모두 검색)
    if (search) {
      const searchLower = search.toLowerCase();
      results = results.filter((item) => {
        const summaryContent = item.summary || item.content || '';
        return (
          item.title.toLowerCase().includes(searchLower) ||
          summaryContent.toLowerCase().includes(searchLower)
        );
      });
    }

    return {
      data: results,
      lastDoc: actualDocs.length > 0 ? actualDocs[actualDocs.length - 1] : null,
      hasMore,
    };
  };

  // ✅ useSWRInfinite 설정
  const { data, error, size, setSize, isValidating, mutate } = useSWRInfinite<
    PageData,
    Error
  >(
    getKey,
    (
      key: [string, string, string, string, number, number, string | null],
      previousPageData: PageData | undefined
    ) => fetcher(key, previousPageData),
    {
      revalidateFirstPage: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 2000,
    }
  );

  // ✅ 중복 제거 추가 - 명시적 타입 지정
  const history: (HistoryDocument & { id: string })[] = data
    ? Array.from(
        new Map<string, HistoryDocument & { id: string }>(
          data
            .flatMap((page: PageData) => page.data)
            .map((item: HistoryDocument & { id: string }) => [item.id, item])
        ).values()
      )
    : [];

  const hasMore = Boolean(data && data[data.length - 1]?.hasMore);
  const loading = !data && !error;
  const isLoadingMore = Boolean(
    isValidating || (size > 0 && data && typeof data[size - 1] === 'undefined')
  );

  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      setSize(size + 1);
    }
  }, [size, setSize, isLoadingMore, hasMore]);

  const search = useCallback(
    (term: string) => {
      setSearchTerm(term);
      setSize(1);
    },
    [setSize]
  );

  const filterByDomain = useCallback(
    (domain: string) => {
      setDomainFilter(domain);
      setSize(1);
    },
    [setSize]
  );

  const refresh = useCallback(() => {
    mutate();
  }, [mutate]);

  return {
    history,
    loading,
    error: error || null,
    loadMore,
    hasMore,
    search,
    filterByDomain,
    isLoadingMore,
    refresh,
  };
}

/**
 * ✅ 사용자의 총 요약 개수를 조회하는 훅 (loading 버그 수정!)
 * ✅ 서브컬렉션 구조: /users/{userId}/history
 * ✅ 에러 핸들링 강화
 */
export function useHistoryCount(userId: string | null) {
  const { data, error } = useSWR<number, Error>(
    userId ? ['history-count', userId] : null,
    async () => {
      if (!userId) {
        return 0;
      }

      try {
        const db = getFirestoreInstance();
        const historyRef = collection(db, 'users', userId, 'history');

        // ✅ 간단한 쿼리 (where 조건 제거)
        const snapshot = await getDocs(historyRef);

        // ✅ 클라이언트 사이드에서 deletedAt 필터링
        const validDocs = snapshot.docs.filter(
          (doc) => !doc.data().deletedAt
        );

        const count = validDocs.length;

        return count;
      } catch (err) {
        console.error('❌ Failed to count history:', err);
        
        // ✅ 에러가 발생해도 0 반환 (로딩 무한 방지)
        return 0;
      }
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      // ✅ 에러 발생 시 재시도 안 함
      shouldRetryOnError: false,
      // ✅ 에러 핸들러 추가
      onError: (err) => {
        console.error('❌ SWR error in useHistoryCount:', err);
      },
    }
  );

  // ✅✅✅ 핵심 수정: data가 0일 때도 로딩 false!
  return {
    count: data ?? 0,
    loading: typeof data === 'undefined' && !error,  // ✅ 수정!
    error: error || null,
  };
}