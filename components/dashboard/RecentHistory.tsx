// components/dashboard/RecentHistory.tsx
'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { FileText, ExternalLink, ArrowRight } from 'lucide-react';
import { HistoryDocument } from '@/lib/firebase/types';

interface RecentHistoryProps {
  history: (HistoryDocument & { id: string })[];
  loading?: boolean;
}

export default function RecentHistory({
  history,
  loading = false,
}: RecentHistoryProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center space-x-3 p-3 rounded-lg animate-pulse"
            >
              <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          최근 요약
        </h3>
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">아직 요약 기록이 없습니다</p>
          <p className="text-sm text-gray-400">
            Chrome 확장 프로그램을 설치하고 웹페이지를 요약해보세요
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">최근 요약</h3>
        <Link
          href="/history"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
        >
          <span>전체보기</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-2">
        {history.slice(0, 5).map((item) => {
          const timeAgo = formatDistanceToNow(item.createdAt.toDate(), {
            addSuffix: true,
            locale: ko,
          });

          return (
            <div
              key={item.id}
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition group"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate mb-1 group-hover:text-blue-600 transition">
                  {item.title || '제목 없음'}
                </h4>

                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span>{timeAgo}</span>
                  {item.metadata?.domain && (
                    <>
                      <span>•</span>
                      <span className="truncate">
                        {item.metadata.domain}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="opacity-0 group-hover:opacity-100 transition"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-4 h-4 text-gray-400 hover:text-blue-600" />
                </a>
              )}
            </div>
          );
        })}
      </div>

      {history.length > 5 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <Link
            href="/history"
            className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {history.length - 5}개 더보기
          </Link>
        </div>
      )}
    </div>
  );
}