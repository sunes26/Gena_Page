// app/admin/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Users, Search, Filter, Crown, User, Download, RefreshCw } from 'lucide-react';
import { exportToCSV, formatDateForCSV } from '@/lib/csv-export';
import { Pagination } from '@/components/ui/pagination';
import { logDataExport } from '@/lib/admin-activity-logger';

interface UserData {
  id: string;
  email: string;
  name: string;
  isPremium: boolean;
  subscriptionPlan: string;
  emailVerified: boolean;
  createdAt: string;
  historyCount: number;
  lastActivity: string | null;
}

export default function AdminUsersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'free' | 'premium' | 'active' | 'inactive'>('all');
  const [total, setTotal] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // 사용자 목록 로드
  const loadUsers = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const token = await user.getIdToken();
      const offset = (page - 1) * itemsPerPage;
      const params = new URLSearchParams({
        filter,
        search,
        limit: itemsPerPage.toString(),
        offset: offset.toString(),
      });

      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`/api/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || '사용자 목록을 불러오는데 실패했습니다.');
      }

      setUsers(result.data.users);
      setTotal(result.data.pagination.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [filter, user, startDate, endDate, page, loadUsers]);

  // 필터 변경 시 페이지를 1로 리셋
  useEffect(() => {
    setPage(1);
  }, [filter, search, startDate, endDate]);

  // 로그인 확인
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  const handleSearch = () => {
    loadUsers();
  };

  const handleExportCSV = async () => {
    if (users.length === 0) {
      alert('내보낼 데이터가 없습니다.');
      return;
    }

    const exportData = users.map(u => ({
      email: u.email,
      name: u.name,
      plan: u.subscriptionPlan,
      isPremium: u.isPremium ? '예' : '아니오',
      emailVerified: u.emailVerified ? '예' : '아니오',
      historyCount: u.historyCount,
      createdAt: formatDateForCSV(u.createdAt),
      lastActivity: formatDateForCSV(u.lastActivity),
    }));

    exportToCSV(
      exportData,
      {
        email: '이메일',
        name: '이름',
        plan: '플랜',
        isPremium: '프리미엄',
        emailVerified: '이메일 인증',
        historyCount: '요약 수',
        createdAt: '가입일',
        lastActivity: '마지막 활동',
      },
      `users_${filter}_${new Date().toISOString().split('T')[0]}`
    );

    // 활동 로깅
    if (user) {
      await logDataExport(user, 'users', users.length, {
        filter,
        search,
        startDate,
        endDate,
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">사용자 관리</h1>
        <p className="text-muted-foreground">
          전체 사용자 목록 및 통계
        </p>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-6 p-4 border border-red-500 bg-red-50 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* 검색 및 필터 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            검색 및 필터
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {/* 검색 */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder="이메일로 검색..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilter('all')}
                  size="sm"
                >
                  전체
                </Button>
                <Button
                  variant={filter === 'free' ? 'default' : 'outline'}
                  onClick={() => setFilter('free')}
                  size="sm"
                >
                  무료
                </Button>
                <Button
                  variant={filter === 'premium' ? 'default' : 'outline'}
                  onClick={() => setFilter('premium')}
                  size="sm"
                >
                  프리미엄
                </Button>
                <Button
                  variant={filter === 'active' ? 'default' : 'outline'}
                  onClick={() => setFilter('active')}
                  size="sm"
                >
                  활성
                </Button>
                <Button
                  variant={filter === 'inactive' ? 'default' : 'outline'}
                  onClick={() => setFilter('inactive')}
                  size="sm"
                >
                  비활성
                </Button>
              </div>
            </div>

            {/* 날짜 범위 필터 */}
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="text-sm text-muted-foreground mb-1 block">가입일 시작</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="text-sm text-muted-foreground mb-1 block">가입일 종료</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                size="sm"
              >
                날짜 초기화
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 사용자 목록 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                사용자 목록 ({total}명)
              </CardTitle>
              <CardDescription>
                {filter === 'all' && '전체 사용자'}
                {filter === 'free' && '무료 플랜 사용자'}
                {filter === 'premium' && '프리미엄 사용자'}
                {filter === 'active' && '최근 30일 활성 사용자'}
                {filter === 'inactive' && '30일 이상 비활성 사용자'}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={loadUsers}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                새로고침
              </Button>
              <Button
                onClick={handleExportCSV}
                variant="outline"
                size="sm"
                disabled={users.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                CSV 내보내기
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              사용자가 없습니다.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="p-3">이메일</th>
                    <th className="p-3">이름</th>
                    <th className="p-3">플랜</th>
                    <th className="p-3 text-right">요약 수</th>
                    <th className="p-3">가입일</th>
                    <th className="p-3">마지막 활동</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((userData) => (
                    <tr
                      key={userData.id}
                      className="border-b hover:bg-muted/50 cursor-pointer"
                      onClick={() => router.push(`/admin/users/${userData.id}`)}
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {userData.isPremium ? (
                            <Crown className="h-4 w-4 text-yellow-500" />
                          ) : (
                            <User className="h-4 w-4 text-gray-400" />
                          )}
                          <span className="font-mono text-xs">{userData.email}</span>
                        </div>
                      </td>
                      <td className="p-3">{userData.name}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          userData.isPremium
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {userData.subscriptionPlan}
                        </span>
                      </td>
                      <td className="p-3 text-right font-semibold">{userData.historyCount}</td>
                      <td className="p-3 text-xs text-muted-foreground">
                        {new Date(userData.createdAt).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">
                        {userData.lastActivity
                          ? new Date(userData.lastActivity).toLocaleDateString('ko-KR')
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* 페이지네이션 */}
              {total > itemsPerPage && (
                <div className="mt-4">
                  <Pagination
                    currentPage={page}
                    totalPages={Math.ceil(total / itemsPerPage)}
                    onPageChange={setPage}
                    totalItems={total}
                    itemsPerPage={itemsPerPage}
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
