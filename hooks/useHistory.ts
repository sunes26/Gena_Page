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

  // ✅ userId가 없으면 null 반환
  const getKey = (pageIndex: number, previousPageData: any) => {
    if (!userId) return null;

    if (previousPageData && previousPageData.data.length === 0) return null;

    if (pageIndex === 0) {
      return ['history', userId, searchTerm, domainFilter, pageSize];
    }

    return [
      'history',
      userId,
      searchTerm,
      domainFilter,
      pageSize,
      previousPageData.lastDoc,
    ];
  };

  // 데이터 가져오기 함수
  const fetcher = async ([
    _key,
    uid,
    search,
    domain,
    limitNum,
    lastDoc,
  ]: any) => {
    const db = getFirestoreInstance();

    // ✅ 서브컬렉션 경로: /users/{userId}/history
    const historyRef = collection(db, 'users', uid, 'history');

    // ✅ userId 필터 제거 (이미 경로에 포함)
    let q = query(
      historyRef,
      where('deletedAt', '==', null)
    );

    // 도메인 필터링
    if (domain) {
      q = query(q, where('metadata.domain', '==', domain));
    }

    // 정렬 및 페이지네이션
    q = query(q, orderBy('createdAt', 'desc'), limit(limitNum + 1));

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    const docs = snapshot.docs;

    const hasMore = docs.length > limitNum;
    const actualDocs = docs.slice(0, limitNum);

    let results = actualDocs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as HistoryDocument),
    }));

    // 클라이언트 사이드 검색
    if (search) {
      const searchLower = search.toLowerCase();
      results = results.filter((item) =>
        item.title.toLowerCase().includes(searchLower)
      );
    }

    return {
      data: results,
      lastDoc: hasMore ? actualDocs[actualDocs.length - 1] : null,
      hasMore,
    };
  };

  const { data, error, size, setSize, isValidating, mutate } = useSWRInfinite(
    getKey,
    fetcher,
    {
      revalidateFirstPage: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const history = data ? data.flatMap((page) => page.data) : [];
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

  const search = useCallback((term: string) => {
    setSearchTerm(term);
    setSize(1);
  }, [setSize]);

  const filterByDomain = useCallback((domain: string) => {
    setDomainFilter(domain);
    setSize(1);
  }, [setSize]);

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
  const { data, error } = useSWR(
    userId ? ['history-count', userId] : null,
    async () => {
      if (!userId) return 0;

      const db = getFirestoreInstance();
      
      // ✅ 서브컬렉션 경로
      const historyRef = collection(db, 'users', userId, 'history');
      
      const q = query(
        historyRef,
        where('deletedAt', '==', null)
      );

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