// hooks/useHistory.ts
'use client';

import { useState, useCallback } from 'react';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  DocumentSnapshot,
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

  // ✅ fetcher 함수 - 명시적 타입 지정
  const fetcher = async (
    key: [string, string, string, string, number, number, string | null],
    previousPageData?: PageData
  ): Promise<PageData> => {
    const [_key, uid, search, domain, limitNum, pageIndex, lastDocId] = key;

    const db = getFirestoreInstance();

    // 서브컬렉션 경로: /users/{userId}/history
    const historyRef = collection(db, 'users', uid, 'history');

    let q = query(
      historyRef,
      where('deletedAt', '==', null),
      orderBy('createdAt', 'desc')
    );

    // 도메인 필터링
    if (domain) {
      q = query(q, where('metadata.domain', '==', domain));
    }

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

    // ✅ 클라이언트 사이드 검색 (summary와 content 모두 검색)
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
 * 사용자의 총 요약 개수를 조회하는 훅
 * ✅ 서브컬렉션 구조: /users/{userId}/history
 */
export function useHistoryCount(userId: string | null) {
  const { data, error } = useSWR<number, Error>(
    userId ? ['history-count', userId] : null,
    async () => {
      if (!userId) return 0;

      const db = getFirestoreInstance();

      const historyRef = collection(db, 'users', userId, 'history');

      const q = query(historyRef, where('deletedAt', '==', null));

      const snapshot = await getDocs(q);
      return snapshot.size;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    count: data || 0,
    loading: !data && !error,
    error: error || null,
  };
}