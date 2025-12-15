// app/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Users, FileText, Crown, TrendingUp, Activity, RefreshCw, DollarSign } from 'lucide-react';
import Link from 'next/link';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface Stats {
  overview: {
    totalUsers: number;
    freeUsers: number;
    premiumUsers: number;
    totalHistories: number;
    activeSubscriptions: number;
    cancelScheduled: number;
    conversionRate: number;
    totalRevenue: number;
  };
  activeUsers: {
    dau: number;
    wau: number;
    mau: number;
  };
}

interface ChartData {
  userGrowth: Array<{ date: string; total: number; free: number; premium: number }>;
  subscriptionTrend: Array<{ date: string; active: number; canceled: number }>;
  historyTrend: Array<{ date: string; count: number }>;
  monthlyRevenue: Array<{ month: string; amount: number }>;
}

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<Stats | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartDays, setChartDays] = useState(30);

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([loadStats(), loadChartData()]);
    setLoading(false);
  };

  const loadStats = async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message);

      setStats(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '통계를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadChartData = async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/admin/charts?days=${chartDays}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message);

      setChartData(result.data);
    } catch (err) {
      console.error('Failed to load chart data:', err);
    }
  };

  useEffect(() => {
    loadStats();
    loadChartData();
  }, [user, chartDays, loadStats, loadChartData]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">관리자 대시보드</h1>
          <p className="text-muted-foreground">서비스 전체 통계 및 현황</p>
        </div>
        <Button
          onClick={loadAll}
          variant="outline"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          새로고침
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 border border-red-500 bg-red-50 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* 빠른 링크 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link href="/admin/users">
          <Card className="hover:shadow-lg transition cursor-pointer">
            <CardContent className="p-6 flex items-center gap-4">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">사용자 관리</p>
                <p className="text-lg font-semibold">전체 사용자</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/tools">
          <Card className="hover:shadow-lg transition cursor-pointer">
            <CardContent className="p-6 flex items-center gap-4">
              <Activity className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">관리 도구</p>
                <p className="text-lg font-semibold">백필 & 테스트</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm text-muted-foreground">통계</p>
              <p className="text-lg font-semibold">서비스 현황</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : stats && (
        <>
          {/* 주요 지표 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  총 사용자
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.overview.totalUsers}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  무료: {stats.overview.freeUsers} / 유료: {stats.overview.premiumUsers}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  총 매출액
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">₩{stats.overview.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  활성 구독: {stats.overview.activeSubscriptions}개
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Crown className="h-4 w-4" />
                  프리미엄 전환율
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.overview.conversionRate}%</p>
                <p className="text-xs text-muted-foreground mt-2">
                  프리미엄: {stats.overview.premiumUsers}명
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  총 요약 수
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.overview.totalHistories}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  사용자당 평균: {(stats.overview.totalHistories / stats.overview.totalUsers).toFixed(1)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 추가 정보 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>구독 현황</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">활성 구독</span>
                  <span className="font-semibold">{stats.overview.activeSubscriptions}개</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">취소 예정</span>
                  <span className="font-semibold text-yellow-600">{stats.overview.cancelScheduled}개</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">이탈률</span>
                  <span className="font-semibold">
                    {stats.overview.activeSubscriptions > 0
                      ? ((stats.overview.cancelScheduled / stats.overview.activeSubscriptions) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 차트 날짜 범위 선택 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>차트 기간 설정</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 items-center">
                <span className="text-sm text-muted-foreground">기간:</span>
                <Button
                  variant={chartDays === 7 ? 'default' : 'outline'}
                  onClick={() => setChartDays(7)}
                  size="sm"
                >
                  7일
                </Button>
                <Button
                  variant={chartDays === 30 ? 'default' : 'outline'}
                  onClick={() => setChartDays(30)}
                  size="sm"
                >
                  30일
                </Button>
                <Button
                  variant={chartDays === 90 ? 'default' : 'outline'}
                  onClick={() => setChartDays(90)}
                  size="sm"
                >
                  90일
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 차트 섹션 */}
          {chartData && (
            <>
              {/* 월별 매출 */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    월별 매출
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData.monthlyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis
                        tickFormatter={(value) => `₩${(value / 1000).toFixed(0)}K`}
                      />
                      <Tooltip
                        formatter={(value: number) => [`₩${value.toLocaleString()}`, '매출']}
                      />
                      <Legend />
                      <Bar dataKey="amount" fill="#4f46e5" name="매출" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* 사용자 성장 추세 */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    사용자 성장 추세 (최근 {chartDays}일)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData.userGrowth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return `${date.getMonth() + 1}/${date.getDate()}`;
                        }}
                      />
                      <YAxis />
                      <Tooltip
                        labelFormatter={(value) => new Date(value).toLocaleDateString('ko-KR')}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="total" stroke="#8884d8" name="전체" strokeWidth={2} />
                      <Line type="monotone" dataKey="premium" stroke="#fbbf24" name="프리미엄" strokeWidth={2} />
                      <Line type="monotone" dataKey="free" stroke="#9ca3af" name="무료" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* 구독 & 히스토리 추세 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* 구독 추세 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="h-5 w-5" />
                      구독 추세
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={chartData.subscriptionTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(value) => {
                            const date = new Date(value);
                            return `${date.getMonth() + 1}/${date.getDate()}`;
                          }}
                        />
                        <YAxis />
                        <Tooltip
                          labelFormatter={(value) => new Date(value).toLocaleDateString('ko-KR')}
                        />
                        <Legend />
                        <Area type="monotone" dataKey="active" stackId="1" stroke="#10b981" fill="#10b981" name="활성" />
                        <Area type="monotone" dataKey="canceled" stackId="1" stroke="#ef4444" fill="#ef4444" name="취소됨" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* 요약 생성 추세 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      요약 생성 추세
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={chartData.historyTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(value) => {
                            const date = new Date(value);
                            return `${date.getMonth() + 1}/${date.getDate()}`;
                          }}
                        />
                        <YAxis />
                        <Tooltip
                          labelFormatter={(value) => new Date(value).toLocaleDateString('ko-KR')}
                        />
                        <Legend />
                        <Bar dataKey="count" fill="#8b5cf6" name="요약 수" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
