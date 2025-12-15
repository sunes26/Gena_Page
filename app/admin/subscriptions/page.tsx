// app/admin/subscriptions/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CreditCard, Filter, CheckCircle2, XCircle, AlertCircle, Clock, Download, RefreshCw } from 'lucide-react';
import { exportToCSV, formatDateForCSV, formatPriceForCSV } from '@/lib/csv-export';
import { Pagination } from '@/components/ui/pagination';
import { logDataExport } from '@/lib/admin-activity-logger';

interface SubscriptionData {
  id: string;
  userId: string;
  userEmail: string;
  status: string;
  paddleSubscriptionId: string;
  paddleCustomerId: string;
  priceId: string;
  price: number;
  currency: string;
  currentPeriodEnd: string;
  nextBillingDate: string | null;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function AdminSubscriptionsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'canceled' | 'past_due' | 'cancel_scheduled'>('all');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // 구독 목록 로드
  const loadSubscriptions = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const token = await user.getIdToken();
      const offset = (page - 1) * itemsPerPage;
      const params = new URLSearchParams({
        filter,
        limit: itemsPerPage.toString(),
        offset: offset.toString(),
      });

      const response = await fetch(`/api/admin/subscriptions?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || '구독 목록을 불러오는데 실패했습니다.');
      }

      setSubscriptions(result.data.subscriptions);
      setTotal(result.data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptions();
  }, [filter, user, page, loadSubscriptions]);

  // 필터 변경 시 페이지를 1로 리셋
  useEffect(() => {
    setPage(1);
  }, [filter]);

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

  // 상태 아이콘
  const getStatusIcon = (status: string, cancelAtPeriodEnd: boolean) => {
    if (cancelAtPeriodEnd) {
      return <Clock className="h-4 w-4 text-yellow-600" />;
    }
    switch (status) {
      case 'active':
      case 'trialing':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'canceled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'past_due':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default:
        return null;
    }
  };

  // 상태 표시 텍스트
  const getStatusText = (status: string, cancelAtPeriodEnd: boolean) => {
    if (cancelAtPeriodEnd) return '취소 예정';
    switch (status) {
      case 'active':
        return '활성';
      case 'trialing':
        return '체험판';
      case 'canceled':
        return '취소됨';
      case 'past_due':
        return '결제 실패';
      default:
        return status;
    }
  };

  // 가격 포맷
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: currency || 'KRW',
    }).format(price);
  };

  const handleExportCSV = async () => {
    if (subscriptions.length === 0) {
      alert('내보낼 데이터가 없습니다.');
      return;
    }

    const exportData = subscriptions.map(sub => ({
      userEmail: sub.userEmail,
      status: getStatusText(sub.status, sub.cancelAtPeriodEnd),
      price: formatPriceForCSV(sub.price, sub.currency),
      currentPeriodEnd: formatDateForCSV(sub.currentPeriodEnd),
      nextBillingDate: formatDateForCSV(sub.nextBillingDate),
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd ? '예' : '아니오',
      createdAt: formatDateForCSV(sub.createdAt),
      paddleSubscriptionId: sub.paddleSubscriptionId,
    }));

    exportToCSV(
      exportData,
      {
        userEmail: '사용자 이메일',
        status: '상태',
        price: '가격',
        currentPeriodEnd: '현재 기간 종료',
        nextBillingDate: '다음 결제일',
        cancelAtPeriodEnd: '취소 예정',
        createdAt: '생성일',
        paddleSubscriptionId: 'Paddle 구독 ID',
      },
      `subscriptions_${filter}_${new Date().toISOString().split('T')[0]}`
    );

    // 활동 로깅
    if (user) {
      await logDataExport(user, 'subscriptions', subscriptions.length, { filter });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">구독 관리</h1>
        <p className="text-muted-foreground">
          전체 구독 현황 및 관리
        </p>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-6 p-4 border border-red-500 bg-red-50 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* 필터 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            필터
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              size="sm"
            >
              전체
            </Button>
            <Button
              variant={filter === 'active' ? 'default' : 'outline'}
              onClick={() => setFilter('active')}
              size="sm"
            >
              활성
            </Button>
            <Button
              variant={filter === 'canceled' ? 'default' : 'outline'}
              onClick={() => setFilter('canceled')}
              size="sm"
            >
              취소됨
            </Button>
            <Button
              variant={filter === 'past_due' ? 'default' : 'outline'}
              onClick={() => setFilter('past_due')}
              size="sm"
            >
              결제 실패
            </Button>
            <Button
              variant={filter === 'cancel_scheduled' ? 'default' : 'outline'}
              onClick={() => setFilter('cancel_scheduled')}
              size="sm"
            >
              취소 예정
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 구독 목록 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                구독 목록 ({total}개)
              </CardTitle>
              <CardDescription>
                {filter === 'all' && '전체 구독'}
                {filter === 'active' && '활성 구독'}
                {filter === 'canceled' && '취소된 구독'}
                {filter === 'past_due' && '결제 실패 구독'}
                {filter === 'cancel_scheduled' && '취소 예정 구독'}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={loadSubscriptions}
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
                disabled={subscriptions.length === 0}
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
          ) : subscriptions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              구독이 없습니다.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="p-3">상태</th>
                    <th className="p-3">사용자</th>
                    <th className="p-3">플랜</th>
                    <th className="p-3 text-right">가격</th>
                    <th className="p-3">다음 결제일</th>
                    <th className="p-3">생성일</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((sub) => (
                    <tr key={sub.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(sub.status, sub.cancelAtPeriodEnd)}
                          <span className={`text-xs font-medium ${
                            sub.cancelAtPeriodEnd
                              ? 'text-yellow-700'
                              : sub.status === 'active' || sub.status === 'trialing'
                              ? 'text-green-700'
                              : sub.status === 'canceled'
                              ? 'text-red-700'
                              : 'text-orange-700'
                          }`}>
                            {getStatusText(sub.status, sub.cancelAtPeriodEnd)}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div>
                          <p className="font-mono text-xs">{sub.userEmail}</p>
                          <p className="text-xs text-muted-foreground">ID: {sub.userId.slice(0, 8)}...</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          Pro
                        </span>
                      </td>
                      <td className="p-3 text-right font-semibold">
                        {formatPrice(sub.price, sub.currency)}
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">
                        {sub.nextBillingDate
                          ? new Date(sub.nextBillingDate).toLocaleDateString('ko-KR')
                          : '-'}
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">
                        {new Date(sub.createdAt).toLocaleDateString('ko-KR')}
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
