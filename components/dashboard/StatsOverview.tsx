// components/dashboard/StatsOverview.tsx
'use client';

import { useMemo } from 'react';
import { FileText, TrendingUp, Calendar, Award } from 'lucide-react';
import { useHistory, useHistoryCount } from '@/hooks/useHistory';
import { useUsageStats } from '@/hooks/useUsageStats';
import { useTranslation } from '@/hooks/useTranslation';
import StatsCard from './StatsCard';
import UsageChart from './UsageChart';

interface StatsOverviewProps {
  userId: string;
}

export default function StatsOverview({ userId }: StatsOverviewProps) {
  const { t, locale } = useTranslation();
  
  // 히스토리 총 개수
  const { count: totalCount, loading: countLoading } = useHistoryCount(userId);

  // 최근 30일 사용량
  const { dailyStats, monthlyTotal, loading: statsLoading } = useUsageStats(userId);

  // 히스토리 조회 (도메인 통계용)
  const { history, loading: historyLoading } = useHistory(userId, { pageSize: 100 });

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

    const dayOfWeekCounts: { [key: string]: number } = 
      locale === 'ko' 
        ? { 일: 0, 월: 0, 화: 0, 수: 0, 목: 0, 금: 0, 토: 0 }
        : { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };

    const dayNames = locale === 'ko' 
      ? ['일', '월', '화', '수', '목', '금', '토']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    dailyStats.forEach((stat) => {
      const date = new Date(stat.date);
      const dayOfWeek = dayNames[date.getDay()];
      dayOfWeekCounts[dayOfWeek] += stat.count || 0;
    });

    const maxDay = Object.entries(dayOfWeekCounts).reduce((max, [day, count]) =>
      count > max.count ? { day, count } : max,
      { day: '', count: 0 }
    );

    return maxDay.count > 0 ? maxDay.day : null;
  }, [dailyStats, locale]);

  // 평균 일일 사용량
  const averageDaily = dailyStats.length > 0
    ? Math.round(monthlyTotal / dailyStats.length * 10) / 10
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('settings.stats.title')}</h3>
        <p className="text-sm text-gray-500 mb-6">
          {locale === 'ko' 
            ? '최근 30일간의 요약 활동을 확인하세요.' 
            : 'Review your summary activity over the last 30 days.'}
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 총 요약 수 */}
        <StatsCard
          title={t('settings.stats.totalSummaries')}
          value={totalCount}
          icon={FileText}
          description={locale === 'ko' ? '전체 기간' : 'All time'}
          color="blue"
          loading={countLoading}
        />

        {/* 이번 달 요약 */}
        <StatsCard
          title={t('settings.stats.thisMonth')}
          value={monthlyTotal}
          icon={TrendingUp}
          description={locale === 'ko' ? '최근 30일' : 'Last 30 days'}
          color="green"
          loading={statsLoading}
        />

        {/* 평균 사용량 */}
        <StatsCard
          title={locale === 'ko' ? '일평균' : 'Daily Avg'}
          value={`${averageDaily}${locale === 'ko' ? '회' : ''}`}
          icon={Calendar}
          description={locale === 'ko' ? '하루 평균' : 'Per day'}
          color="purple"
          loading={statsLoading}
        />

        {/* 가장 활발한 요일 */}
        <StatsCard
          title={t('settings.stats.mostActiveDay')}
          value={mostActiveDay || '-'}
          icon={Award}
          description={locale === 'ko' ? '가장 많이 사용' : 'Most active'}
          color="orange"
          loading={statsLoading}
        />
      </div>

      {/* 사용량 차트 */}
      <UsageChart data={dailyStats} loading={statsLoading} />

      {/* 도메인 통계 */}
      {topDomains.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            {t('settings.stats.topDomains')}
          </h4>
          <div className="space-y-3">
            {topDomains.map((item, index) => (
              <div
                key={item.domain}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {item.domain}
                    </p>
                    <p className="text-xs text-gray-500">
                      {((item.count / totalCount) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{item.count}</p>
                  <p className="text-xs text-gray-500">
                    {locale === 'ko' ? '요약' : 'summaries'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 빈 상태 */}
      {!historyLoading && history.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {locale === 'ko' ? '아직 통계가 없습니다' : 'No statistics yet'}
          </h3>
          <p className="text-gray-500">
            {locale === 'ko' 
              ? 'Chrome 확장 프로그램으로 페이지를 요약하면 통계가 표시됩니다.' 
              : 'Start summarizing pages to see your statistics.'}
          </p>
        </div>
      )}
    </div>
  );
}