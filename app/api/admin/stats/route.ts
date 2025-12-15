// app/api/admin/stats/route.ts
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

/**
 * 서비스 전체 통계 조회 (관리자 전용)
 * GET /api/admin/stats
 *
 * Query Parameters:
 * - days: number (default: 30) - 일별 추이 데이터 기간
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

    // 3. Query Parameters
    const { searchParams } = new URL(request.url);
    const days = Math.min(parseInt(searchParams.get('days') || '30'), 90);

    // 4. Firestore 작업
    const db = getAdminFirestore();

    // 4-1. 전체 사용자 통계 (✅ 최적화: denormalized fields 사용)
    const usersSnapshot = await db.collection('users').get();
    const totalUsers = usersSnapshot.size;

    let premiumUsers = 0;
    let freeUsers = 0;
    let totalHistories = 0; // ✅ denormalized field로 집계

    usersSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.isPremium) {
        premiumUsers++;
      } else {
        freeUsers++;
      }
      // ✅ 각 사용자의 historyCount를 합산 (N+1 쿼리 제거)
      totalHistories += data.historyCount || 0;
    });

    // 4-3. 일별 사용자 증가 추이
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const dailyUserGrowth: Array<{ date: string; count: number }> = [];

    // 날짜별로 가입한 사용자 계산
    const usersByDate = new Map<string, number>();
    usersSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.createdAt instanceof Timestamp) {
        const date = data.createdAt.toDate().toISOString().split('T')[0];
        usersByDate.set(date, (usersByDate.get(date) || 0) + 1);
      }
    });

    // 날짜 범위 생성
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      dailyUserGrowth.push({
        date: dateStr,
        count: usersByDate.get(dateStr) || 0,
      });
    }

    // 4-4. 일별 요약 생성 추이 (✅ 최적화: collection group query 사용)
    const dailySummaryTrend: Array<{ date: string; count: number }> = [];

    // ✅ N+1 제거: collection group query로 모든 daily 문서를 한 번에 조회
    const summariesByDate = new Map<string, number>();

    const dailyCollectionGroup = await db
      .collectionGroup('daily')
      .where('date', '>=', startDate.toISOString().split('T')[0])
      .where('date', '<=', endDate.toISOString().split('T')[0])
      .get();

    dailyCollectionGroup.docs.forEach(doc => {
      const data = doc.data();
      const date = data.date;
      const count = data.count || 0;
      summariesByDate.set(date, (summariesByDate.get(date) || 0) + count);
    });

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      dailySummaryTrend.push({
        date: dateStr,
        count: summariesByDate.get(dateStr) || 0,
      });
    }

    // 4-5. 활성 사용자 계산 (DAU, WAU, MAU) - ✅ 최적화: denormalized lastActivity 사용
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    let dau = 0;
    let wau = 0;
    let mau = 0;

    // ✅ N+1 제거: 이미 가져온 usersSnapshot에서 lastActivity 필드 사용
    usersSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const lastActivity = data.lastActivity;

      if (lastActivity instanceof Timestamp) {
        const activityDate = lastActivity.toDate();
        if (activityDate >= oneDayAgo) dau++;
        if (activityDate >= sevenDaysAgo) wau++;
        if (activityDate >= thirtyDaysAgo) mau++;
      }
    });

    // 4-6. 구독 통계
    const subscriptionsSnapshot = await db
      .collection('subscription')
      .where('status', 'in', ['active', 'trialing'])
      .get();

    const activeSubscriptions = subscriptionsSnapshot.size;

    let cancelScheduled = 0;
    subscriptionsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.cancelAtPeriodEnd) {
        cancelScheduled++;
      }
    });

    // 구독 전환율 계산
    const conversionRate = totalUsers > 0 ? (premiumUsers / totalUsers) * 100 : 0;

    // 총 매출 계산 (월 구독료 9,900원)
    const SUBSCRIPTION_PRICE = 9900;
    const totalRevenue = activeSubscriptions * SUBSCRIPTION_PRICE;

    // 5. 성공 응답
    return successResponse(
      {
        overview: {
          totalUsers,
          freeUsers,
          premiumUsers,
          totalHistories,
          activeSubscriptions,
          cancelScheduled,
          conversionRate: parseFloat(conversionRate.toFixed(2)),
          totalRevenue,
        },
        activeUsers: {
          dau,
          wau,
          mau,
        },
        trends: {
          dailyUserGrowth,
          dailySummaryTrend,
        },
      },
      '서비스 통계를 조회했습니다.'
    );

  } catch (error) {
    return safeInternalServerErrorResponse(
      '통계 조회 중 오류가 발생했습니다.',
      error,
      'Get stats error'
    );
  }
}
