// app/api/admin/charts/route.ts
import { NextRequest } from 'next/server';
import { verifyIdToken } from '@/lib/firebase/admin-utils';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';
import { requireAdminToken } from '@/lib/admin-auth';
import {
  successResponse,
  unauthorizedResponse,
  forbiddenResponse,
  safeInternalServerErrorResponse,
} from '@/lib/api-response';

interface ChartData {
  userGrowth: Array<{ date: string; total: number; free: number; premium: number }>;
  subscriptionTrend: Array<{ date: string; active: number; canceled: number }>;
  historyTrend: Array<{ date: string; count: number }>;
  monthlyRevenue: Array<{ month: string; amount: number }>;
}

/**
 * 차트 데이터 조회 (관리자 전용)
 * GET /api/admin/charts?days=30
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Firebase ID 토큰 인증
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorizedResponse('인증 헤더가 누락되었거나 올바르지 않습니다.');
    }

    const token = authHeader.split('Bearer ')[1];
    let decodedToken;

    try {
      decodedToken = await verifyIdToken(token);
    } catch (error) {
      console.error('Token verification error:', error);
      return unauthorizedResponse('토큰이 유효하지 않거나 만료되었습니다.');
    }

    // 2. 관리자 권한 확인
    try {
      requireAdminToken(decodedToken);
    } catch (error) {
      console.error('Admin authorization failed:', {
        email: decodedToken.email,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return forbiddenResponse('관리자 권한이 필요합니다.');
    }

    // 3. 파라미터 처리
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30', 10);

    const db = getAdminFirestore();
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    // 4. 날짜별 사용자 수 집계 (✅ 최적화: 한 번만 조회 후 메모리에서 처리)
    const userGrowth: Array<{ date: string; total: number; free: number; premium: number }> = [];

    // ✅ 모든 사용자를 한 번만 조회
    const allUsersSnapshot = await db.collection('users').get();
    const allUsersData = allUsersSnapshot.docs.map(doc => ({
      createdAt: doc.data().createdAt,
      isPremium: doc.data().isPremium || false,
    }));

    // 최근 N일간의 데이터를 날짜별로 집계 (메모리에서 처리)
    for (let i = 0; i < days; i++) {
      const targetDate = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = targetDate.toISOString().split('T')[0];

      // 메모리에서 필터링 (N번의 쿼리 → 0번 추가 쿼리)
      const usersUpToDate = allUsersData.filter(u => {
        if (!(u.createdAt instanceof Timestamp)) return false;
        return u.createdAt.toDate() <= targetDate;
      });

      const premiumCount = usersUpToDate.filter(u => u.isPremium).length;

      userGrowth.push({
        date: dateStr,
        total: usersUpToDate.length,
        free: usersUpToDate.length - premiumCount,
        premium: premiumCount,
      });
    }

    // 5. 구독 추세 (샘플링)
    const subscriptionTrend: Array<{ date: string; active: number; canceled: number }> = [];

    for (let i = 0; i < days; i += Math.ceil(days / 10)) {
      const targetDate = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = targetDate.toISOString().split('T')[0];

      const activeSnapshot = await db
        .collection('subscription')
        .where('status', '==', 'active')
        .where('createdAt', '<=', Timestamp.fromDate(targetDate))
        .get();

      const canceledSnapshot = await db
        .collection('subscription')
        .where('status', '==', 'canceled')
        .where('createdAt', '<=', Timestamp.fromDate(targetDate))
        .get();

      subscriptionTrend.push({
        date: dateStr,
        active: activeSnapshot.size,
        canceled: canceledSnapshot.size,
      });
    }

    // 6. 히스토리 생성 추세 (✅ 최적화: collection group query 사용)
    const historyTrend: Array<{ date: string; count: number }> = [];

    // ✅ N+1 제거: collection group query로 모든 daily 문서를 한 번에 조회
    const dateMap = new Map<string, number>();
    const startDateStr = startDate.toISOString().split('T')[0];

    const dailyCollectionGroup = await db
      .collectionGroup('daily')
      .where('date', '>=', startDateStr)
      .get();

    dailyCollectionGroup.docs.forEach(dailyDoc => {
      const dailyData = dailyDoc.data();
      const dateStr = dailyData.date;
      if (dateStr) {
        dateMap.set(dateStr, (dateMap.get(dateStr) || 0) + (dailyData.count || 0));
      }
    });

    // 날짜순 정렬
    const sortedDates = Array.from(dateMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({ date, count }));

    historyTrend.push(...sortedDates);

    // 7. 월별 매출 (최근 6개월)
    const SUBSCRIPTION_PRICE = 9900;
    const monthlyRevenue: Array<{ month: string; amount: number }> = [];

    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i);
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);

      const monthStartTimestamp = Timestamp.fromDate(monthStart);
      const monthEndTimestamp = Timestamp.fromDate(monthEnd);

      // 해당 월에 생성된 구독 수
      const monthSubsSnapshot = await db
        .collection('subscription')
        .where('createdAt', '>=', monthStartTimestamp)
        .where('createdAt', '<', monthEndTimestamp)
        .get();

      const monthName = monthStart.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short' });
      monthlyRevenue.push({
        month: monthName,
        amount: monthSubsSnapshot.size * SUBSCRIPTION_PRICE,
      });
    }

    // 8. 응답 데이터 구성
    const responseData: ChartData = {
      userGrowth,
      subscriptionTrend,
      historyTrend,
      monthlyRevenue,
    };

    // 9. 성공 응답
    return successResponse(
      responseData,
      '차트 데이터를 조회했습니다.'
    );

  } catch (error) {
    return safeInternalServerErrorResponse(
      '차트 데이터 조회 중 오류가 발생했습니다.',
      error,
      'Get chart data error'
    );
  }
}
