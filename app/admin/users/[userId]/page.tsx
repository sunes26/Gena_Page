// app/admin/users/[userId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ArrowLeft, User, CreditCard, FileText, History, Crown, Mail, MessageSquare, Send } from 'lucide-react';
import Link from 'next/link';
import { logEmailSent } from '@/lib/admin-activity-logger';

interface UserDetail {
  user: {
    id: string;
    email: string;
    name: string;
    isPremium: boolean;
    subscriptionPlan: string;
    emailVerified: boolean;
    photoURL: string | null;
    createdAt: string;
    updatedAt: string;
    manualPremiumOverride?: boolean;
    manualPremiumAction?: string;
    manualPremiumReason?: string;
    manualPremiumUpdatedBy?: string;
  };
  subscription: {
    id: string;
    status: string;
    paddleSubscriptionId: string;
    price: number;
    currency: string;
    currentPeriodEnd: string;
    nextBillingDate: string | null;
    cancelAtPeriodEnd: boolean;
    createdAt: string;
  } | null;
  statistics: {
    totalHistories: number;
    deletedHistories: number;
    activeHistories: number;
    lastActivity: string | null;
    dailyStatsCount: number;
    averagePerDay: number;
  };
  recentHistories: Array<{
    id: string;
    title: string;
    url: string;
    createdAt: string;
  }>;
  payments: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    paidAt: string;
  }>;
}

export default function UserDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [userId, setUserId] = useState<string>('');
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 이메일 기능
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  // 노트 기능
  const [newNote, setNewNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [notes, setNotes] = useState<Array<{
    id: string;
    content: string;
    createdBy: string;
    createdAt: string;
  }>>([]);

  // params 처리
  useEffect(() => {
    params.then((p) => setUserId(p.userId));
  }, [params]);

  // 사용자 상세 정보 로드
  const loadUserDetail = async () => {
    if (!user || !userId) return;
    setLoading(true);
    setError(null);

    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/admin/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || '사용자 정보를 불러오는데 실패했습니다.');
      }

      setUserDetail(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 노트 로드
  const loadNotes = async () => {
    if (!user || !userId) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/admin/users/${userId}/notes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setNotes(result.data || []);
      }
    } catch (err) {
      console.error('Failed to load notes:', err);
    }
  };

  // 이메일 전송
  const handleSendEmail = async () => {
    if (!user || !userDetail) return;
    if (!emailSubject.trim() || !emailMessage.trim()) {
      setEmailError('제목과 메시지를 입력하세요.');
      return;
    }

    setSendingEmail(true);
    setEmailSuccess(null);
    setEmailError(null);

    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/admin/users/${userId}/send-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: emailSubject,
          message: emailMessage,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || '이메일 전송에 실패했습니다.');
      }

      setEmailSuccess('이메일이 전송되었습니다.');
      setEmailSubject('');
      setEmailMessage('');

      // 활동 로깅
      await logEmailSent(user, userDetail.user.email, 'admin-custom');

      setTimeout(() => setEmailSuccess(null), 3000);
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setSendingEmail(false);
    }
  };

  // 노트 저장
  const handleSaveNote = async () => {
    if (!user || !userId) return;
    if (!newNote.trim()) return;

    setSavingNote(true);

    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/admin/users/${userId}/notes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newNote,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || '노트 저장에 실패했습니다.');
      }

      setNewNote('');
      await loadNotes();
    } catch (err) {
      console.error('Failed to save note:', err);
      alert(err instanceof Error ? err.message : '노트 저장에 실패했습니다.');
    } finally {
      setSavingNote(false);
    }
  };

  useEffect(() => {
    loadUserDetail();
    loadNotes();
  }, [user, userId, loadUserDetail, loadNotes]);

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

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error || !userDetail) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="mb-6">
          <Link href="/admin/users">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              사용자 목록으로
            </Button>
          </Link>
        </div>
        <div className="p-4 border border-red-500 bg-red-50 rounded-lg">
          <p className="text-sm text-red-700">{error || '사용자를 찾을 수 없습니다.'}</p>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: currency || 'KRW',
    }).format(price);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* 헤더 */}
      <div className="mb-6">
        <Link href="/admin/users">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            사용자 목록으로
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">사용자 상세 정보</h1>
        <p className="text-muted-foreground">{userDetail.user.email}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* 기본 정보 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              기본 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">이름</p>
                <p className="font-semibold">{userDetail.user.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">플랜</p>
                <div className="flex items-center gap-2">
                  {userDetail.user.isPremium && <Crown className="h-4 w-4 text-yellow-500" />}
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    userDetail.user.isPremium
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {userDetail.user.subscriptionPlan}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">이메일 인증</p>
                <p className="font-semibold">{userDetail.user.emailVerified ? '완료' : '미완료'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">가입일</p>
                <p className="font-semibold">
                  {new Date(userDetail.user.createdAt).toLocaleDateString('ko-KR')}
                </p>
              </div>
            </div>

            {userDetail.user.manualPremiumOverride && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm font-semibold text-yellow-900 mb-1">수동 프리미엄 설정</p>
                <p className="text-xs text-yellow-700">
                  작업: {userDetail.user.manualPremiumAction} |
                  담당자: {userDetail.user.manualPremiumUpdatedBy}
                  {userDetail.user.manualPremiumReason && ` | 사유: ${userDetail.user.manualPremiumReason}`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 통계 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              사용 통계
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">전체 요약</p>
              <p className="text-2xl font-bold">{userDetail.statistics.activeHistories}</p>
              <p className="text-xs text-muted-foreground">
                (삭제됨: {userDetail.statistics.deletedHistories})
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">일평균</p>
              <p className="text-xl font-semibold">{userDetail.statistics.averagePerDay}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">마지막 활동</p>
              <p className="text-sm">
                {userDetail.statistics.lastActivity
                  ? new Date(userDetail.statistics.lastActivity).toLocaleString('ko-KR')
                  : '-'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 구독 정보 */}
      {userDetail.subscription && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              구독 정보
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">상태</p>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  userDetail.subscription.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {userDetail.subscription.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">가격</p>
                <p className="font-semibold">
                  {formatPrice(userDetail.subscription.price, userDetail.subscription.currency)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">다음 결제일</p>
                <p className="text-sm">
                  {userDetail.subscription.nextBillingDate
                    ? new Date(userDetail.subscription.nextBillingDate).toLocaleDateString('ko-KR')
                    : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">취소 예정</p>
                <p className="text-sm font-semibold">
                  {userDetail.subscription.cancelAtPeriodEnd ? '예' : '아니오'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 최근 히스토리 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            최근 요약 (최대 10개)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userDetail.recentHistories.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">요약이 없습니다.</p>
          ) : (
            <div className="space-y-2">
              {userDetail.recentHistories.map((history) => (
                <div key={history.id} className="p-3 border rounded hover:bg-muted/50">
                  <p className="font-semibold text-sm">{history.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{history.url}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(history.createdAt).toLocaleString('ko-KR')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 결제 내역 */}
      {userDetail.payments.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              결제 내역 (최근 10개)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="p-3">금액</th>
                    <th className="p-3">상태</th>
                    <th className="p-3">결제일</th>
                  </tr>
                </thead>
                <tbody>
                  {userDetail.payments.map((payment) => (
                    <tr key={payment.id} className="border-b">
                      <td className="p-3 font-semibold">
                        {formatPrice(payment.amount, payment.currency)}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          payment.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : payment.status === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {new Date(payment.paidAt).toLocaleString('ko-KR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 이메일 보내기 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            이메일 보내기
          </CardTitle>
        </CardHeader>
        <CardContent>
          {emailSuccess && (
            <div className="mb-4 p-3 border border-green-500 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">{emailSuccess}</p>
            </div>
          )}
          {emailError && (
            <div className="mb-4 p-3 border border-red-500 bg-red-50 rounded-lg">
              <p className="text-sm text-red-700">{emailError}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">받는 사람</label>
              <Input
                value={userDetail.user.email}
                disabled
                className="bg-muted"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">제목</label>
              <Input
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="이메일 제목을 입력하세요..."
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">메시지</label>
              <Textarea
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                placeholder="이메일 내용을 입력하세요..."
                rows={6}
              />
            </div>
            <Button onClick={handleSendEmail} disabled={sendingEmail}>
              {sendingEmail ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  전송 중...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  이메일 전송
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 관리자 노트 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            관리자 노트
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* 새 노트 작성 */}
          <div className="mb-6">
            <Textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="이 사용자에 대한 노트를 작성하세요..."
              rows={3}
              className="mb-2"
            />
            <Button onClick={handleSaveNote} disabled={savingNote || !newNote.trim()} size="sm">
              {savingNote ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  저장 중...
                </>
              ) : (
                '노트 추가'
              )}
            </Button>
          </div>

          {/* 노트 목록 */}
          {notes.length === 0 ? (
            <p className="text-center text-muted-foreground py-4 text-sm">
              작성된 노트가 없습니다.
            </p>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <div key={note.id} className="p-3 border rounded bg-muted/30">
                  <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium">{note.createdBy}</span>
                    <span>•</span>
                    <span>{new Date(note.createdAt).toLocaleString('ko-KR')}</span>
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
