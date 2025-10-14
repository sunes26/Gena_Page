// app/(dashboard)/dashboard/page.tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useHistory, useHistoryCount } from '@/hooks/useHistory';
import { useMonthlyUsage, useRecentUsage } from '@/hooks/useUsageStats';
import StatsCard from '@/components/dashboard/StatsCard';
import UsageChart from '@/components/dashboard/UsageChart';
import RecentHistory from '@/components/dashboard/RecentHistory';
import {
  TrendingUp,
  FileText,
  Calendar,
  Zap,
  Chrome,
  Crown,
  Loader2,
} from 'lucide-react';

export default function DashboardPage() {
  // ✅ AuthContext에서 user, isPremium 가져오기
  const { user, isPremium, loading: authLoading } = useAuth();
  const userId = user?.uid || null;

  // ✅ userId 명시적으로 전달
  const { history, loading: historyLoading } = useHistory(userId, { pageSize: 5 });
  const { count: totalCount, loading: countLoading } = useHistoryCount(userId);
  const { total: monthlyTotal, loading: monthlyLoading } = useMonthlyUsage(userId);
  const { dailyStats, weeklyTotal, loading: statsLoading } = useRecentUsage(userId, 7);

  // 로딩 상태
  const isLoading = authLoading || historyLoading || countLoading || monthlyLoading || statsLoading;

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
            대시보드를 사용하려면 먼저 로그인해주세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          대시보드
        </h1>
        <p className="text-gray-600">
          안녕하세요, {user.displayName || '사용자'}님! 👋
        </p>
      </div>

      {/* 통계 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard
          title="이번 달 사용량"
          value={`${monthlyTotal}회`}
          icon={Calendar}
          description="이번 달 요약 횟수"
          color="blue"
          loading={isLoading}
        />

        <StatsCard
          title="총 요약 횟수"
          value={totalCount}
          icon={FileText}
          description="전체 요약 기록"
          color="green"
          loading={isLoading}
        />

        <StatsCard
          title="최근 7일"
          value={`${weeklyTotal}회`}
          icon={TrendingUp}
          description="일주일간 사용량"
          color="purple"
          loading={isLoading}
        />
      </div>

      {/* 빠른 액션 버튼 */}
      {!isPremium && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Crown className="w-6 h-6" />
                <h3 className="text-xl font-bold">Pro로 업그레이드</h3>
              </div>
              <p className="text-blue-100 mb-4">
                무제한 요약, 고성능 AI, 우선 지원을 경험해보세요
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="/subscription"
                  className="inline-flex items-center px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Pro 플랜 보기
                </a>
                <a
                  href="https://chrome.google.com/webstore"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition backdrop-blur-sm"
                >
                  <Chrome className="w-4 h-4 mr-2" />
                  확장 프로그램 설치
                </a>
              </div>
            </div>
            <Zap className="w-16 h-16 text-yellow-300 opacity-50" />
          </div>
        </div>
      )}

      {/* Chrome 확장 프로그램 설치 안내 (Pro 사용자용) */}
      {isPremium && (
        <div className="bg-white rounded-lg shadow p-6 border-2 border-blue-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Chrome className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">
                  Chrome 확장 프로그램
                </h3>
              </div>
              <p className="text-gray-600 mb-4">
                웹 서핑 중 언제든지 페이지를 요약하세요
              </p>
              <a
                href="https://chrome.google.com/webstore"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
              >
                <Chrome className="w-4 h-4 mr-2" />
                확장 프로그램 설치
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 차트와 최근 기록 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 최근 7일 사용량 차트 */}
        <UsageChart data={dailyStats} loading={statsLoading} />

        {/* 최근 요약 5개 */}
        <RecentHistory history={history} loading={historyLoading} />
      </div>

      {/* 도움말 섹션 */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          💡 시작하기
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
          <div>
            <p className="font-medium mb-1">1. 확장 프로그램 설치</p>
            <p className="text-blue-700">
              Chrome 웹스토어에서 SummaryGenie를 설치하세요
            </p>
          </div>
          <div>
            <p className="font-medium mb-1">2. 페이지 요약</p>
            <p className="text-blue-700">
              읽고 싶은 페이지에서 확장 프로그램 아이콘을 클릭하세요
            </p>
          </div>
          <div>
            <p className="font-medium mb-1">3. 기록 관리</p>
            <p className="text-blue-700">
              요약 기록은 자동으로 저장되어 언제든 확인할 수 있습니다
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}