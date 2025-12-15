// app/admin/notifications/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Bell, Mail, Send, Plus, X, RefreshCw } from 'lucide-react';

interface NotificationSettings {
  enabled: boolean;
  recipients: string[];
  notifications: {
    newSubscription: boolean;
    subscriptionCanceled: boolean;
    paymentSuccess: boolean;
    paymentFailed: boolean;
    newUser: boolean;
    dailySummary: boolean;
  };
  dailySummaryTime: string;
}

export default function NotificationsSettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newRecipient, setNewRecipient] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);

  // 설정 로드
  const loadSettings = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/admin/notifications/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || '설정을 불러오는데 실패했습니다.');
      }

      setSettings(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, [user, loadSettings]);

  // 설정 저장
  const saveSettings = async () => {
    if (!user || !settings) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/admin/notifications/settings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || '설정 저장에 실패했습니다.');
      }

      setSuccess('설정이 저장되었습니다.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // 수신자 추가
  const addRecipient = () => {
    if (!settings || !newRecipient.trim()) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newRecipient)) {
      setError('유효한 이메일 주소를 입력하세요.');
      return;
    }

    if (settings.recipients.includes(newRecipient)) {
      setError('이미 등록된 이메일 주소입니다.');
      return;
    }

    setSettings({
      ...settings,
      recipients: [...settings.recipients, newRecipient],
    });
    setNewRecipient('');
    setError(null);
  };

  // 수신자 제거
  const removeRecipient = (email: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      recipients: settings.recipients.filter(r => r !== email),
    });
  };

  // 테스트 이메일 전송
  const sendTestEmail = async () => {
    if (!user || !testEmail.trim()) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      setError('유효한 이메일 주소를 입력하세요.');
      return;
    }

    setSendingTest(true);
    setError(null);
    setSuccess(null);

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/admin/notifications/test', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: testEmail }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || '테스트 이메일 전송에 실패했습니다.');
      }

      setSuccess(`테스트 이메일이 ${testEmail}로 전송되었습니다.`);
      setTestEmail('');
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setSendingTest(false);
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

  if (loading || !settings) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">이메일 알림 설정</h1>
          <p className="text-muted-foreground">
            중요한 이벤트 발생 시 이메일 알림을 받을 수 있습니다.
          </p>
        </div>
        <Button
          onClick={loadSettings}
          variant="outline"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          새로고침
        </Button>
      </div>

      {/* 알림 메시지 */}
      {error && (
        <div className="mb-6 p-4 border border-red-500 bg-red-50 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 border border-green-500 bg-green-50 rounded-lg">
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {/* 전체 활성화 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            알림 활성화
          </CardTitle>
          <CardDescription>
            이메일 알림을 전체적으로 활성화하거나 비활성화합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
              className="w-5 h-5"
            />
            <span className="font-medium">이메일 알림 활성화</span>
          </label>
        </CardContent>
      </Card>

      {/* 수신자 설정 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            수신자 설정
          </CardTitle>
          <CardDescription>
            알림을 받을 이메일 주소를 추가합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 기존 수신자 목록 */}
          {settings.recipients.length > 0 && (
            <div className="mb-4 space-y-2">
              {settings.recipients.map((email) => (
                <div key={email} className="flex items-center justify-between p-3 bg-muted rounded">
                  <span className="text-sm font-mono">{email}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRecipient(email)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* 새 수신자 추가 */}
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="이메일 주소 입력..."
              value={newRecipient}
              onChange={(e) => setNewRecipient(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addRecipient()}
            />
            <Button onClick={addRecipient}>
              <Plus className="h-4 w-4 mr-2" />
              추가
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 알림 유형 선택 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>알림 유형</CardTitle>
          <CardDescription>
            받고 싶은 알림 유형을 선택하세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.newSubscription}
                onChange={(e) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, newSubscription: e.target.checked }
                })}
                className="w-4 h-4"
              />
              <div>
                <p className="font-medium">새로운 구독</p>
                <p className="text-sm text-muted-foreground">사용자가 새로운 구독을 시작할 때</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.subscriptionCanceled}
                onChange={(e) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, subscriptionCanceled: e.target.checked }
                })}
                className="w-4 h-4"
              />
              <div>
                <p className="font-medium">구독 취소</p>
                <p className="text-sm text-muted-foreground">사용자가 구독을 취소할 때</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.paymentSuccess}
                onChange={(e) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, paymentSuccess: e.target.checked }
                })}
                className="w-4 h-4"
              />
              <div>
                <p className="font-medium">결제 성공</p>
                <p className="text-sm text-muted-foreground">결제가 성공적으로 처리될 때</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.paymentFailed}
                onChange={(e) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, paymentFailed: e.target.checked }
                })}
                className="w-4 h-4"
              />
              <div>
                <p className="font-medium">결제 실패</p>
                <p className="text-sm text-muted-foreground">결제가 실패했을 때</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.newUser}
                onChange={(e) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, newUser: e.target.checked }
                })}
                className="w-4 h-4"
              />
              <div>
                <p className="font-medium">새로운 사용자</p>
                <p className="text-sm text-muted-foreground">새로운 사용자가 가입할 때</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.dailySummary}
                onChange={(e) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, dailySummary: e.target.checked }
                })}
                className="w-4 h-4"
              />
              <div>
                <p className="font-medium">일일 요약</p>
                <p className="text-sm text-muted-foreground">매일 요약 리포트 받기</p>
              </div>
            </label>

            {settings.notifications.dailySummary && (
              <div className="ml-7 mt-2">
                <label className="text-sm text-muted-foreground mb-1 block">발송 시간</label>
                <Input
                  type="time"
                  value={settings.dailySummaryTime}
                  onChange={(e) => setSettings({ ...settings, dailySummaryTime: e.target.value })}
                  className="w-40"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 테스트 이메일 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            테스트 이메일 전송
          </CardTitle>
          <CardDescription>
            이메일 설정이 올바르게 작동하는지 테스트합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="테스트 이메일 주소..."
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendTestEmail()}
            />
            <Button onClick={sendTestEmail} disabled={sendingTest}>
              {sendingTest ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            환경변수가 설정되지 않은 경우 콘솔에 로그가 출력됩니다.
          </p>
        </CardContent>
      </Card>

      {/* 저장 버튼 */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={loadSettings}>
          취소
        </Button>
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              저장 중...
            </>
          ) : (
            '설정 저장'
          )}
        </Button>
      </div>
    </div>
  );
}
