// components/dashboard/StatsOverview.tsx
'use client';

import { useMemo } from 'react';
import { FileText, TrendingUp, Calendar, Award, Globe, BarChart3 } from 'lucide-react';
import { useHistory, useHistoryCount } from '@/hooks/useHistory';
import { useUsageStats } from '@/hooks/useUsageStats';
import StatsCard from './StatsCard';
import UsageChart from './UsageChart';

interface StatsOverviewProps {
  userId: string;
}

export default function StatsOverview({ userId }: StatsOverviewProps) {
  // 데이터 조회
  const { count: totalCount, loading: countLoading } = useHistoryCount(userId);
  const { dailyStats, monthlyTotal, loading: statsLoading } = useUsageStats(userId);
  const { history, loading: historyLoading } = useHistory(userId, { pageSize: 1000 });

  // 가장 많이 요약한 도메인 Top 5
  const topDomains = useMemo(() => {
    if (!history || history.length === 0) return [];

    const domainCounts: { [key: string]: number } = {};

    history.forEach((item) => {
      const domain = item.metadata?.domain;
      if (domain) {
        domainCounts[domain] = (domainCounts[domain] || 0) + 1;
      }
    });

    return Object.entries(domainCounts)
      .map(([domain, count]) => ({ domain, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [history]);

  // 가장 활발한 요일 계산
  const mostActiveDay = useMemo(() => {
    if (!dailyStats || dailyStats.length === 0) return null;

    const dayOfWeekCounts: { [key: string]: number } = {
      일: 0,
      월: 0,
      화: 0,
      수: 0,
      목: 0,
      금: 0,
      토: 0,
    };

    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

    dailyStats.forEach((stat) => {
      const date = new Date(stat.date);
      const dayOfWeek = dayNames[date.getDay()];
      dayOfWeekCounts[dayOfWeek] += stat.count || 0;
    });

    const maxDay = Object.entries(dayOfWeekCounts).reduce(
      (max, [day, count]) => (count > max.count ? { day, count } : max),
      { day: '', count: 0 }
    );

    return maxDay.count > 0 ? maxDay.day : null;
  }, [dailyStats]);

  // 평균 일일 사용량
  const averageDaily = useMemo(() => {
    if (dailyStats.length === 0) return 0;
    return Math.round((monthlyTotal / dailyStats.length) * 10) / 10;
  }, [dailyStats, monthlyTotal]);

  // 로딩 상태
  const isLoading = countLoading || statsLoading || historyLoading;

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
          사용 통계
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          최근 30일간의 요약 활동을 확인하세요.
        </p>
      </div>

      {/* 통계 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 총 요약 수 */}
        <StatsCard
          title="총 요약"
          value={totalCount.toLocaleString()}
          icon={FileText}
          description="전체 기간"
          color="blue"
          loading={isLoading}
        />

        {/* 이번 달 요약 */}
        <StatsCard
          title="최근 30일"
          value={monthlyTotal.toLocaleString()}
          icon={TrendingUp}
          description="최근 한 달"
          color="green"
          loading={isLoading}
        />

        {/* 평균 사용량 */}
        <StatsCard
          title="일평균"
          value={`${averageDaily}회`}
          icon={Calendar}
          description="하루 평균"
          color="purple"
          loading={isLoading}
        />

        {/* 가장 활발한 요일 */}
        <StatsCard
          title="활발한 요일"
          value={mostActiveDay ? `${mostActiveDay}요일` : '-'}
          icon={Award}
          description="가장 많이 사용"
          color="orange"
          loading={isLoading}
        />
      </div>

      {/* 사용량 차트 */}
      {!isLoading && dailyStats.length > 0 && (
        <UsageChart data={dailyStats} loading={statsLoading} />
      )}

      {/* 도메인 통계 */}
      {!isLoading && topDomains.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Globe className="w-5 h-5 mr-2 text-blue-600" />
            가장 많이 요약한 도메인 Top 5
          </h4>
          <div className="space-y-3">
            {topDomains.map((item, index) => {
              const percentage = totalCount > 0 ? (item.count / totalCount) * 100 : 0;
              const colors = [
                'bg-blue-500',
                'bg-green-500',
                'bg-purple-500',
                'bg-orange-500',
                'bg-pink-500',
              ];
              const bgColors = [
                'bg-blue-50',
                'bg-green-50',
                'bg-purple-50',
                'bg-orange-50',
                'bg-pink-50',
              ];
              const textColors = [
                'text-blue-700',
                'text-green-700',
                'text-purple-700',
                'text-orange-700',
                'text-pink-700',
              ];

              return (
                <div
                  key={item.domain}
                  className={`flex items-center justify-between p-4 ${bgColors[index]} rounded-lg border border-gray-200 hover:shadow-md transition`}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${bgColors[index]} border-2 ${colors[index].replace('bg-', 'border-')}`}
                    >
                      <span className={`text-sm font-bold ${textColors[index]}`}>
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {item.domain}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[200px]">
                          <div
                            className={`h-2 rounded-full ${colors[index]} transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-xl font-bold text-gray-900">{item.count}</p>
                    <p className="text-xs text-gray-500">요약</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 빈 상태 */}
      {!isLoading && history.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            아직 통계가 없습니다
          </h3>
          <p className="text-gray-500 mb-6">
            Chrome 확장 프로그램으로 페이지를 요약하면 통계가 표시됩니다.
          </p>
          <a
            href="https://chrome.google.com/webstore"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            확장 프로그램 설치하기
          </a>
        </div>
      )}

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="space-y-6">
          {/* 차트 스켈레톤 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="h-6 bg-gray-200 rounded w-40 mb-6 animate-pulse"></div>
            <div className="h-80 bg-gray-100 rounded animate-pulse"></div>
          </div>

          {/* 도메인 스켈레톤 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg animate-pulse"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}