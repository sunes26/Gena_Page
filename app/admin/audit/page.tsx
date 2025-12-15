// app/admin/audit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Shield, Filter, Download, Search, RefreshCw } from 'lucide-react';
import { exportToCSV, formatDateForCSV } from '@/lib/csv-export';
import { logDataExport } from '@/lib/admin-activity-logger';

interface AuditLogData {
  id: string;
  eventType: string;
  severity: string;
  userId?: string;
  userEmail?: string;
  subscriptionId?: string;
  transactionId?: string;
  actor: {
    type: string;
    id?: string;
  };
  action: string;
  timestamp: string;
}

interface Stats {
  total: number;
  byEventType: Record<string, number>;
  bySeverity: Record<string, number>;
}

export default function AdminAuditLogsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [logs, setLogs] = useState<AuditLogData[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [severity, setSeverity] = useState<string>('all');
  const [days, setDays] = useState(7);
  const [eventType, setEventType] = useState<string>('all');
  const [searchEmail, setSearchEmail] = useState('');

  // 감사 로그 로드
  const loadLogs = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const token = await user.getIdToken();
      const params = new URLSearchParams({
        days: days.toString(),
        limit: '100',
        ...(severity !== 'all' && { severity }),
        ...(eventType !== 'all' && { eventType }),
        ...(searchEmail && { userId: searchEmail }),
      });

      const response = await fetch(`/api/admin/audit-logs?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || '감사 로그를 불러오는데 실패했습니다.');
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
  }, [severity, days, eventType, user, loadLogs]);

  const handleSearch = () => {
    loadLogs();
  };

  const handleExportCSV = async () => {
    if (logs.length === 0) {
      alert('내보낼 데이터가 없습니다.');
      return;
    }

    const exportData = logs.map(log => ({
      timestamp: formatDateForCSV(log.timestamp),
      severity: log.severity,
      eventType: log.eventType,
      action: log.action,
      userEmail: log.userEmail || '',
      actorType: log.actor.type,
      actorId: log.actor.id || '',
    }));

    exportToCSV(
      exportData,
      {
        timestamp: '시간',
        severity: '심각도',
        eventType: '이벤트 유형',
        action: '작업',
        userEmail: '사용자',
        actorType: 'Actor 유형',
        actorId: 'Actor ID',
      },
      `audit_logs_${severity}_${new Date().toISOString().split('T')[0]}`
    );

    // 활동 로깅
    if (user) {
      await logDataExport(user, 'audit_logs', logs.length, {
        severity,
        eventType,
        days,
        searchEmail,
      });
    }
  };

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

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'error':
        return 'bg-orange-100 text-orange-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'info':
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">감사 로그</h1>
        <p className="text-muted-foreground">
          시스템 및 사용자 활동 추적
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 border border-red-500 bg-red-50 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* 통계 */}
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
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Critical
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">
                {stats.bySeverity.critical || 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-orange-600">
                {stats.bySeverity.error || 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Warning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.bySeverity.warning || 0}
              </p>
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
          <div className="flex flex-col gap-4">
            {/* 이메일 검색 */}
            <div className="flex gap-2">
              <Input
                placeholder="사용자 이메일로 검색..."
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="max-w-md"
              />
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {/* 심각도 필터 */}
            <div className="flex gap-2 flex-wrap items-center">
              <span className="text-sm text-muted-foreground">심각도:</span>
              <Button
                variant={severity === 'all' ? 'default' : 'outline'}
                onClick={() => setSeverity('all')}
                size="sm"
              >
                전체
              </Button>
              <Button
                variant={severity === 'critical' ? 'default' : 'outline'}
                onClick={() => setSeverity('critical')}
                size="sm"
              >
                Critical
              </Button>
              <Button
                variant={severity === 'error' ? 'default' : 'outline'}
                onClick={() => setSeverity('error')}
                size="sm"
              >
                Error
              </Button>
              <Button
                variant={severity === 'warning' ? 'default' : 'outline'}
                onClick={() => setSeverity('warning')}
                size="sm"
              >
                Warning
              </Button>
              <Button
                variant={severity === 'info' ? 'default' : 'outline'}
                onClick={() => setSeverity('info')}
                size="sm"
              >
                Info
              </Button>
            </div>

            {/* 이벤트 타입 필터 */}
            <div className="flex gap-2 flex-wrap items-center">
              <span className="text-sm text-muted-foreground">이벤트 유형:</span>
              <Button
                variant={eventType === 'all' ? 'default' : 'outline'}
                onClick={() => setEventType('all')}
                size="sm"
              >
                전체
              </Button>
              <Button
                variant={eventType === 'subscription' ? 'default' : 'outline'}
                onClick={() => setEventType('subscription')}
                size="sm"
              >
                구독
              </Button>
              <Button
                variant={eventType === 'payment' ? 'default' : 'outline'}
                onClick={() => setEventType('payment')}
                size="sm"
              >
                결제
              </Button>
              <Button
                variant={eventType === 'user' ? 'default' : 'outline'}
                onClick={() => setEventType('user')}
                size="sm"
              >
                사용자
              </Button>
              <Button
                variant={eventType === 'webhook' ? 'default' : 'outline'}
                onClick={() => setEventType('webhook')}
                size="sm"
              >
                웹훅
              </Button>
            </div>

            {/* 기간 필터 */}
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
                <Shield className="h-5 w-5" />
                감사 로그 ({logs.length}개)
              </CardTitle>
              <CardDescription>
                최근 {days}일간의 시스템 활동 로그
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={loadLogs}
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
                disabled={logs.length === 0}
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
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              로그가 없습니다.
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="border rounded-lg p-4 hover:bg-muted/50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(log.severity)}`}>
                          {log.severity}
                        </span>
                        <span className="text-xs px-2 py-1 rounded bg-muted font-mono">
                          {log.eventType}
                        </span>
                      </div>
                      <p className="font-semibold">{log.action}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString('ko-KR')}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {log.userEmail && <p>사용자: {log.userEmail}</p>}
                    <p>Actor: {log.actor.type}{log.actor.id && ` (${log.actor.id})`}</p>
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
