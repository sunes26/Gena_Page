// app/admin/webhooks/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Webhook, Filter, CheckCircle2, XCircle, Activity, RefreshCw } from 'lucide-react';

interface WebhookLogData {
  id: string;
  eventId: string;
  eventType: string;
  status: 'success' | 'failed';
  occurredAt: string;
  processedAt: string;
  error?: {
    message: string;
    stack?: string;
  };
}

interface Stats {
  total: number;
  successCount: number;
  failedCount: number;
  successRate: number;
  byEventType: Record<string, number>;
}

export default function AdminWebhooksPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [logs, setLogs] = useState<WebhookLogData[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'success' | 'failed'>('all');
  const [days, setDays] = useState(7);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  // 웹훅 로그 로드
  const loadLogs = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const token = await user.getIdToken();
      const params = new URLSearchParams({
        filter,
        days: days.toString(),
        limit: '100',
      });

      const response = await fetch(`/api/admin/webhooks?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || '웹훅 로그를 불러오는데 실패했습니다.');
      }

      setLogs(result.data.logs);
      setStats(result.data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [filter, days, user, loadLogs]);

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

  // 이벤트 타입 표시명
  const getEventTypeLabel = (eventType: string) => {
    const labels: Record<string, string> = {
      'subscription.created': '구독 생성',
      'subscription.updated': '구독 업데이트',
      'subscription.canceled': '구독 취소',
      'subscription.past_due': '결제 지연',
      'subscription.paused': '구독 일시정지',
      'subscription.resumed': '구독 재개',
      'transaction.completed': '결제 완료',
      'transaction.payment_failed': '결제 실패',
      'transaction.refunded': '환불',
    };
    return labels[eventType] || eventType;
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">웹훅 로그</h1>
        <p className="text-muted-foreground">
          Paddle 웹훅 이벤트 처리 로그
        </p>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-6 p-4 border border-red-500 bg-red-50 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* 통계 카드 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                전체 이벤트
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                성공
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">{stats.successCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                실패
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">{stats.failedCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Activity className="h-4 w-4" />
                성공률
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</p>
            </CardContent>
          </Card>
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
          <div className="flex gap-4 flex-wrap items-center">
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
                size="sm"
              >
                전체
              </Button>
              <Button
                variant={filter === 'success' ? 'default' : 'outline'}
                onClick={() => setFilter('success')}
                size="sm"
              >
                성공
              </Button>
              <Button
                variant={filter === 'failed' ? 'default' : 'outline'}
                onClick={() => setFilter('failed')}
                size="sm"
              >
                실패
              </Button>
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-sm text-muted-foreground">기간:</span>
              <Button
                variant={days === 1 ? 'default' : 'outline'}
                onClick={() => setDays(1)}
                size="sm"
              >
                1일
              </Button>
              <Button
                variant={days === 7 ? 'default' : 'outline'}
                onClick={() => setDays(7)}
                size="sm"
              >
                7일
              </Button>
              <Button
                variant={days === 30 ? 'default' : 'outline'}
                onClick={() => setDays(30)}
                size="sm"
              >
                30일
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 로그 목록 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5" />
                웹훅 로그 ({logs.length}개)
              </CardTitle>
              <CardDescription>
                최근 {days}일간의 웹훅 이벤트 처리 로그
              </CardDescription>
            </div>
            <Button
              onClick={loadLogs}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              새로고침
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              로그가 없습니다.
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition cursor-pointer"
                  onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {log.status === 'success' ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <span className="font-semibold">
                          {getEventTypeLabel(log.eventType)}
                        </span>
                        <span className="text-xs px-2 py-1 rounded bg-muted font-mono">
                          {log.eventType}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground ml-8">
                        <p>이벤트 ID: <span className="font-mono">{log.eventId}</span></p>
                        <p>
                          처리 시간: {new Date(log.processedAt).toLocaleString('ko-KR')}
                        </p>
                      </div>
                      {expandedLog === log.id && log.error && (
                        <div className="mt-3 ml-8 p-3 bg-red-50 border border-red-200 rounded text-sm">
                          <p className="font-semibold text-red-900 mb-1">에러 메시지:</p>
                          <p className="text-red-700">{log.error.message}</p>
                          {log.error.stack && (
                            <>
                              <p className="font-semibold text-red-900 mt-2 mb-1">스택 트레이스:</p>
                              <pre className="text-xs text-red-600 overflow-x-auto whitespace-pre-wrap">
                                {log.error.stack}
                              </pre>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                      log.status === 'success'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {log.status === 'success' ? '성공' : '실패'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
