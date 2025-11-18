// components/dashboard/HistoryTable.tsx
'use client';

import { memo, useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import { ko } from 'date-fns/locale/ko';
import { enUS } from 'date-fns/locale/en-US';
import { FileText, Eye, ExternalLink } from 'lucide-react';
import { HistoryDocument } from '@/lib/firebase/types';
import { useTranslation } from '@/hooks/useTranslation';

interface HistoryTableProps {
  history: (HistoryDocument & { id: string })[];
  onView: (item: HistoryDocument & { id: string }) => void;
  loading?: boolean;
}

// ✅ summary 또는 content 가져오기 (summary 우선)
const getSummaryContent = (item: HistoryDocument & { id: string }) => {
  return item.summary || item.content || '';
};

// ✅ JavaScript로 화면 크기 감지하여 조건부 렌더링
const HistoryTable = memo(function HistoryTable({
  history,
  onView,
  loading = false,
}: HistoryTableProps) {
  const { t, locale } = useTranslation();
  const [isMobile, setIsMobile] = useState(false);

  // ✅ 화면 크기 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // 초기 체크
    checkMobile();

    // 리사이즈 이벤트 리스너
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 로딩 스켈레톤
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {!isMobile ? (
          // 데스크톱 스켈레톤
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
        ) : (
          // 모바일 스켈레톤
          <div className="space-y-3 p-4">
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
        )}
      </div>
    );
  }

  // 빈 상태
  if (!history || history.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t('dashboard.history.empty')}
        </h3>
        <p className="text-gray-500 mb-6">
          {t('dashboard.history.emptyDesc')}
        </p>
        <a
          href="https://chrome.google.com/webstore"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
        >
          {t('dashboard.home.extension.install')}
        </a>
      </div>
    );
  }

  const dateLocale = locale === 'ko' ? ko : enUS;

  // ✅ 조건부 렌더링: 하나만 렌더링
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {!isMobile ? (
        // 데스크톱 테이블
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('dashboard.history.table.title')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('dashboard.history.table.domain')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('dashboard.history.table.date')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('dashboard.history.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {history.map((item) => {
                const timeAgo = formatDistanceToNow(item.createdAt.toDate(), {
                  addSuffix: true,
                  locale: dateLocale,
                });
                const summaryContent = getSummaryContent(item);

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition cursor-pointer"
                    onClick={() => onView(item)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900 truncate hover:text-blue-600 transition">
                            {item.title || t('dashboard.modal.title')}
                          </div>
                          {summaryContent && (
                            <div className="text-xs text-gray-500 mt-0.5">
                              {summaryContent.length}{locale === 'ko' ? '자' : ' chars'}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {item.metadata?.domain ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {item.metadata.domain}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {timeAgo}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title={t('dashboard.modal.originalUrl')}
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
                          {t('dashboard.history.table.view')}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        // 모바일 카드
        <div className="space-y-3 p-4">
          {history.map((item) => {
            const timeAgo = formatDistanceToNow(item.createdAt.toDate(), {
              addSuffix: true,
              locale: dateLocale,
            });
            const summaryContent = getSummaryContent(item);

            return (
              <div
                key={item.id}
                onClick={() => onView(item)}
                className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 hover:shadow-md transition cursor-pointer"
              >
                <div className="flex items-start space-x-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
                      {item.title || t('dashboard.modal.title')}
                    </h3>
                    <div className="text-xs text-gray-500">{timeAgo}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {item.metadata?.domain && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {item.metadata.domain}
                      </span>
                    )}
                    {summaryContent && (
                      <span className="text-xs text-gray-500">
                        {summaryContent.length}{locale === 'ko' ? '자' : ' chars'}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onView(item);
                    }}
                    className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    <Eye className="w-3.5 h-3.5 mr-1" />
                    {t('dashboard.history.table.view')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

HistoryTable.displayName = 'HistoryTable';

export default HistoryTable;