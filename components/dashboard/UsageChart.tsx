// components/dashboard/UsageChart.tsx
'use client';

import { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { DailyDocument } from '@/lib/firebase/types';
import { BarChart3, TrendingUp } from 'lucide-react';

interface UsageChartProps {
  data: DailyDocument[];
  loading?: boolean;
  type?: 'bar' | 'line' | 'both';
}

type ChartType = 'weekly' | 'monthly';

export default function UsageChart({ 
  data, 
  loading = false,
  type = 'both'
}: UsageChartProps) {
  const [activeChart, setActiveChart] = useState<ChartType>('weekly');

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="h-6 bg-gray-200 rounded w-40 mb-6 animate-pulse"></div>
        <div className="h-80 bg-gray-100 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          사용량 통계
        </h3>
        <div className="h-80 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">아직 사용 데이터가 없습니다</p>
            <p className="text-sm">Chrome 확장 프로그램으로 페이지를 요약해보세요</p>
          </div>
        </div>
      </div>
    );
  }

  // 최근 7일 데이터 (막대 그래프용)
  const weeklyData = data.slice(-7).map((stat) => {
    const date = new Date(stat.date);
    const dayName = date.toLocaleDateString('ko-KR', { 
      month: 'short',
      day: 'numeric',
      weekday: 'short' 
    });
    
    return {
      date: stat.date,
      label: dayName,
      count: stat.count || 0,
    };
  });

  // 월별 데이터 (선 그래프용) - 최근 30일을 주 단위로 그룹화
  const monthlyData: Array<{ date: string; label: string; count: number }> = [];
  const groupedByWeek: { [key: string]: number } = {};
  
  data.forEach((stat) => {
    const date = new Date(stat.date);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay()); // 주의 시작 (일요일)
    const weekKey = weekStart.toISOString().split('T')[0];
    
    if (!groupedByWeek[weekKey]) {
      groupedByWeek[weekKey] = 0;
    }
    groupedByWeek[weekKey] += stat.count || 0;
  });

  Object.keys(groupedByWeek).sort().forEach((weekKey) => {
    const date = new Date(weekKey);
    const label = date.toLocaleDateString('ko-KR', { 
      month: 'short',
      day: 'numeric'
    });
    
    monthlyData.push({
      date: weekKey,
      label,
      count: groupedByWeek[weekKey],
    });
  });

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="text-sm font-semibold text-gray-900 mb-1">{label}</p>
          <p className="text-sm text-gray-600">
            요약 횟수: <span className="font-bold text-[#69D2E7]">{payload[0].value}회</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          {activeChart === 'weekly' ? (
            <>
              <BarChart3 className="w-5 h-5 text-[#69D2E7]" />
              <span>최근 7일 사용량</span>
            </>
          ) : (
            <>
              <TrendingUp className="w-5 h-5 text-[#69D2E7]" />
              <span>월별 사용 추이</span>
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
              주간
            </button>
            <button
              onClick={() => setActiveChart('monthly')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                activeChart === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              월간
            </button>
          </div>
        )}
      </div>

      {/* 차트 영역 */}
      <ResponsiveContainer width="100%" height={320}>
        {activeChart === 'weekly' || type === 'bar' ? (
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

      {/* 통계 요약 */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-500 mb-1">평균</p>
            <p className="text-lg font-bold text-gray-900">
              {(weeklyData.reduce((sum, d) => sum + d.count, 0) / weeklyData.length).toFixed(1)}
              <span className="text-xs font-normal text-gray-500 ml-1">회/일</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">최대</p>
            <p className="text-lg font-bold text-gray-900">
              {Math.max(...weeklyData.map(d => d.count))}
              <span className="text-xs font-normal text-gray-500 ml-1">회</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">총합</p>
            <p className="text-lg font-bold text-gray-900">
              {weeklyData.reduce((sum, d) => sum + d.count, 0)}
              <span className="text-xs font-normal text-gray-500 ml-1">회</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}