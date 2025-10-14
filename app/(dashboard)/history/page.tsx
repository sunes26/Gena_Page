// app/(dashboard)/history/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useHistory } from '@/hooks/useHistory';
import { HistoryDocument } from '@/lib/firebase/types';
import HistoryTable from '@/components/dashboard/HistoryTable';
import HistoryModal from '@/components/dashboard/HistoryModal';
import SearchBar from '@/components/dashboard/SearchBar';
import DomainFilter from '@/components/dashboard/DomainFilter';
import { History, ArrowUpDown, Loader2 } from 'lucide-react';

type SortOrder = 'desc' | 'asc';

export default function HistoryPage() {
  // ✅ AuthContext에서 user 가져오기
  const { user, loading: authLoading } = useAuth();
  const userId = user?.uid || null;

  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedItem, setSelectedItem] = useState<(HistoryDocument & { id: string }) | null>(null);
  
  // ✅ userId 명시적으로 전달
  const {
    history,
    loading,
    error,
    loadMore,
    hasMore,
    search,
    filterByDomain,
    isLoadingMore,
  } = useHistory(userId, { pageSize: 20 });

  // 무한 스크롤 Intersection Observer
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!observerRef.current || isLoadingMore || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(observerRef.current);

    return () => observer.disconnect();
  }, [loadMore, hasMore, isLoadingMore]);

  // 정렬 처리
  const sortedHistory = [...history].sort((a, b) => {
    const timeA = a.createdAt.toMillis();
    const timeB = b.createdAt.toMillis();
    return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
  });

  // 검색 핸들러
  const handleSearch = (term: string) => {
    search(term);
  };

  // 도메인 필터 핸들러
  const [selectedDomain, setSelectedDomain] = useState('');
  const handleDomainChange = (domain: string) => {
    setSelectedDomain(domain);
    filterByDomain(domain);
  };

  // 정렬 토글
  const toggleSort = () => {
    setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
  };

  // 인증 확인
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            로그인이 필요합니다
          </h2>
          <p className="text-gray-600">
            요약 기록을 보려면 먼저 로그인해주세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <History className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">요약 기록</h1>
            {!loading && (
              <p className="text-gray-600 mt-1">
                총 {history.length}개의 요약
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 필터 & 검색 */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 검색 */}
          <div className="md:col-span-2">
            <SearchBar onSearch={handleSearch} />
          </div>

          {/* 도메인 필터 */}
          <DomainFilter
            history={history}
            selectedDomain={selectedDomain}
            onDomainChange={handleDomainChange}
          />
        </div>

        {/* 정렬 버튼 */}
        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={toggleSort}
            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            <ArrowUpDown className="w-4 h-4" />
            <span>{sortOrder === 'desc' ? '최신순' : '오래된 순'}</span>
          </button>

          <div className="text-sm text-gray-500">
            {selectedDomain && (
              <span>
                {selectedDomain} 필터링 중 •{' '}
              </span>
            )}
            페이지당 20개 표시
          </div>
        </div>
      </div>

      {/* 에러 상태 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            오류가 발생했습니다: {error.message}
          </p>
        </div>
      )}

      {/* 히스토리 리스트 */}
      <HistoryTable
        history={sortedHistory}
        onView={setSelectedItem}
        loading={loading}
      />

      {/* 무한 스크롤 트리거 */}
      {hasMore && !loading && (
        <div ref={observerRef} className="py-8 text-center">
          {isLoadingMore ? (
            <div className="flex items-center justify-center space-x-2 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>추가 로딩 중...</span>
            </div>
          ) : (
            <button
              onClick={loadMore}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              더 보기
            </button>
          )}
        </div>
      )}

      {/* 끝 표시 */}
      {!loading && !hasMore && history.length > 0 && (
        <div className="text-center py-8 text-gray-500 text-sm">
          모든 기록을 불러왔습니다
        </div>
      )}

      {/* 상세 모달 */}
      <HistoryModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
}