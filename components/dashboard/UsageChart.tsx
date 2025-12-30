// components/dashboard/UsageChart.tsx
'use client';

import { useState, lazy, Suspense } from 'react';
import { DailyDocument } from '@/lib/firebase/types';
import { BarChart3, TrendingUp, Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

// ✅ Recharts Dynamic Import (300KB 절약)
const BarChart = lazy(() => 
  import('recharts').then(mod => ({ default: mod.BarChart }))
);
const Bar = lazy(() => 
  import('recharts').then(mod => ({ default: mod.Bar }))
);
const LineChart = lazy(() => 
  import('recharts').then(mod => ({ default: mod.LineChart }))
);
const Line = lazy(() => 
  import('recharts').then(mod => ({ default: mod.Line }))
);
const XAxis = lazy(() => 
  import('recharts').then(mod => ({ default: mod.XAxis }))
);
const YAxis = lazy(() => 
  import('recharts').then(mod => ({ default: mod.YAxis }))
);
const CartesianGrid = lazy(() => 
  import('recharts').then(mod => ({ default: mod.CartesianGrid }))
);
const Tooltip = lazy(() => 
  import('recharts').then(mod => ({ default: mod.Tooltip }))
);
const ResponsiveContainer = lazy(() => 
  import('recharts').then(mod => ({ default: mod.ResponsiveContainer }))
);

interface UsageChartProps {
  data: DailyDocument[];
  loading?: boolean;
  type?: 'bar' | 'line' | 'both';
}

type ChartType = 'weekly' | 'monthly';

// ✅ 로딩 스켈레톤
function ChartSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="h-6 bg-gray-200 rounded w-40 mb-6 animate-pulse"></div>
      <div className="h-80 bg-gray-100 rounded animate-pulse"></div>
    </div>
  );
}

interface ChartDataItem {
  date: string;
  label: string;
  count: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

// ✅ 차트 렌더링 컴포넌트 (Suspense 내부)
function ChartContent({
  weeklyData,
  monthlyData,
  activeChart,
  locale
}: {
  weeklyData: ChartDataItem[];
  monthlyData: ChartDataItem[];
  activeChart: ChartType;
  locale: string;
}) {
  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="text-sm font-semibold text-gray-900 mb-1">{label}</p>
          <p className="text-sm text-gray-600">
            {locale === 'ko' ? '요약 횟수: ' : 'Summaries: '}
            <span className="font-bold text-[#69D2E7]">
              {payload[0].value}{locale === 'ko' ? '회' : ''}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={320}>
      {activeChart === 'weekly' ? (
        <BarChart data={weeklyData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(105, 210, 231, 0.1)' }} />
          <Bar
            dataKey="count"
            fill="#69D2E7"
            radius={[8, 8, 0, 0]}
            maxBarSize={60}
          />
        </BarChart>
      ) : (
        <LineChart data={monthlyData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="label"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#69D2E7"
            strokeWidth={3}
            dot={{ fill: '#69D2E7', r: 4 }}
            activeDot={{ r: 6, fill: '#69D2E7' }}
          />
        </LineChart>
      )}
    </ResponsiveContainer>
  );
}

export default function UsageChart({ 
  data, 
  loading = false,
  type = 'both'
}: UsageChartProps) {
  const { t, locale } = useTranslation();
  const [activeChart, setActiveChart] = useState<ChartType>('weekly');

  if (loading) {
    return <ChartSkeleton />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('settings.stats.title')}
        </h3>
        <div className="h-80 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">
              {locale === 'ko' ? '아직 사용 데이터가 없습니다' : 'No usage data yet'}
            </p>
            <p className="text-sm">
              {locale === 'ko' 
                ? 'Chrome 확장 프로그램으로 페이지를 요약해보세요' 
                : 'Start summarizing pages with the Chrome extension'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 최근 7일 데이터 (막대 그래프용)
  const weeklyData = data.slice(-7).map((stat) => {
    const date = new Date(stat.date);
    const dayName = locale === 'ko'
      ? date.toLocaleDateString('ko-KR', {
          month: 'short',
          day: 'numeric',
          weekday: 'short'
        })
      : date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });

    return {
      date: stat.date,
      label: dayName,
      count: stat.total_count || stat.count || 0, // ✅ total_count 사용
    };
  });

  // 월별 데이터 (선 그래프용) - 최근 30일을 주 단위로 그룹화
  const monthlyData: Array<{ date: string; label: string; count: number }> = [];
  const groupedByWeek: { [key: string]: number } = {};
  
  data.forEach((stat) => {
    const date = new Date(stat.date);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekKey = weekStart.toISOString().split('T')[0];

    if (!groupedByWeek[weekKey]) {
      groupedByWeek[weekKey] = 0;
    }
    groupedByWeek[weekKey] += stat.total_count || stat.count || 0; // ✅ total_count 사용
  });

  Object.keys(groupedByWeek).sort().forEach((weekKey) => {
    const date = new Date(weekKey);
    const label = locale === 'ko'
      ? date.toLocaleDateString('ko-KR', { 
          month: 'short',
          day: 'numeric'
        })
      : date.toLocaleDateString('en-US', { 
          month: 'short',
          day: 'numeric'
        });
    
    monthlyData.push({
      date: weekKey,
      label,
      count: groupedByWeek[weekKey],
    });
  });

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          {activeChart === 'weekly' ? (
            <>
              <BarChart3 className="w-5 h-5 text-[#69D2E7]" />
              <span>
                {locale === 'ko' ? '최근 7일 사용량' : 'Last 7 Days Usage'}
              </span>
            </>
          ) : (
            <>
              <TrendingUp className="w-5 h-5 text-[#69D2E7]" />
              <span>
                {locale === 'ko' ? '월별 사용 추이' : 'Monthly Trend'}
              </span>
            </>
          )}
        </h3>

        {/* 차트 타입 전환 버튼 */}
        {type === 'both' && (
          <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveChart('weekly')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                activeChart === 'weekly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {locale === 'ko' ? '주간' : 'Weekly'}
            </button>
            <button
              onClick={() => setActiveChart('monthly')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                activeChart === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {locale === 'ko' ? '월간' : 'Monthly'}
            </button>
          </div>
        )}
      </div>

      {/* ✅ Suspense로 차트 감싸기 */}
      <Suspense fallback={
        <div className="h-80 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      }>
        <ChartContent 
          weeklyData={weeklyData} 
          monthlyData={monthlyData} 
          activeChart={activeChart}
          locale={locale}
        />
      </Suspense>

      {/* 통계 요약 */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-500 mb-1">
              {locale === 'ko' ? '평균' : 'Average'}
            </p>
            <p className="text-lg font-bold text-gray-900">
              {(weeklyData.reduce((sum, d) => sum + d.count, 0) / weeklyData.length).toFixed(1)}
              <span className="text-xs font-normal text-gray-500 ml-1">
                {locale === 'ko' ? '회/일' : '/day'}
              </span>
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">
              {locale === 'ko' ? '최대' : 'Maximum'}
            </p>
            <p className="text-lg font-bold text-gray-900">
              {Math.max(...weeklyData.map(d => d.count))}
              <span className="text-xs font-normal text-gray-500 ml-1">
                {locale === 'ko' ? '회' : ''}
              </span>
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">
              {locale === 'ko' ? '총합' : 'Total'}
            </p>
            <p className="text-lg font-bold text-gray-900">
              {weeklyData.reduce((sum, d) => sum + d.count, 0)}
              <span className="text-xs font-normal text-gray-500 ml-1">
                {locale === 'ko' ? '회' : ''}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}