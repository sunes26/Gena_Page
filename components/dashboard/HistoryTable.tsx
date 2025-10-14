// components/dashboard/HistoryTable.tsx
'use client';

import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { FileText, Eye, ExternalLink } from 'lucide-react';
import { HistoryDocument } from '@/lib/firebase/types';

interface HistoryTableProps {
  history: (HistoryDocument & { id: string })[];
  onView: (item: HistoryDocument & { id: string }) => void;
  loading?: boolean;
}

export default function HistoryTable({
  history,
  onView,
  loading = false,
}: HistoryTableProps) {
  // 로딩 스켈레톤
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* 데스크톱 스켈레톤 */}
        <div className="hidden md:block">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                </th>
                <th className="px-6 py-3 text-right">
                  <div className="h-4 bg-gray-200 rounded w-16 ml-auto animate-pulse"></div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 bg-gray-200 rounded-full w-24"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-8 bg-gray-200 rounded w-20 ml-auto"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 모바일 스켈레톤 */}
        <div className="md:hidden space-y-3 p-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-white rounded-lg p-4 border border-gray-200 animate-pulse"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 빈 상태
  if (!history || history.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          아직 요약이 없습니다
        </h3>
        <p className="text-gray-500 mb-6">
          Chrome 확장 프로그램으로 웹페이지를 요약해보세요
        </p>
        <a
          href="https://chrome.google.com/webstore"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
        >
          확장 프로그램 설치
        </a>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* 데스크톱 테이블 */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                제목
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                도메인
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                생성일
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                액션
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {history.map((item) => {
              const timeAgo = formatDistanceToNow(item.createdAt.toDate(), {
                addSuffix: true,
                locale: ko,
              });

              return (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => onView(item)}
                >
                  {/* 제목 */}
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 truncate hover:text-blue-600 transition">
                          {item.title || '제목 없음'}
                        </div>
                        {item.content && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            {item.content.length}자
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* 도메인 */}
                  <td className="px-6 py-4">
                    {item.metadata?.domain ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {item.metadata.domain}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>

                  {/* 생성일 */}
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {timeAgo}
                  </td>

                  {/* 액션 */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="원본 페이지 열기"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onView(item);
                        }}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        상세보기
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 모바일 카드 */}
      <div className="md:hidden space-y-3 p-4">
        {history.map((item) => {
          const timeAgo = formatDistanceToNow(item.createdAt.toDate(), {
            addSuffix: true,
            locale: ko,
          });

          return (
            <div
              key={item.id}
              onClick={() => onView(item)}
              className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 hover:shadow-md transition cursor-pointer"
            >
              {/* 헤더 */}
              <div className="flex items-start space-x-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
                    {item.title || '제목 없음'}
                  </h3>
                  <div className="text-xs text-gray-500">{timeAgo}</div>
                </div>
              </div>

              {/* 메타 정보 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {item.metadata?.domain && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {item.metadata.domain}
                    </span>
                  )}
                  {item.content && (
                    <span className="text-xs text-gray-500">
                      {item.content.length}자
                    </span>
                  )}
                </div>

                {/* 액션 버튼 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onView(item);
                  }}
                  className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition"
                >
                  <Eye className="w-3.5 h-3.5 mr-1" />
                  보기
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}