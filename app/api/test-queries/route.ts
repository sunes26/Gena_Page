// app/api/test-queries/route.ts
import { NextResponse } from 'next/server';
import {
  getUserHistory,
  getUserDailyStats,
  searchHistory,
  getHistoryByDomain,
  getUserHistoryCount,
  getUserDomains,
  getMonthlyUsage,
  getRecentUsage,
} from '@/lib/firebase/queries';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json(
      { error: 'userId parameter is required' },
      { status: 400 }
    );
  }

  try {
    // 1. 최근 히스토리 5개
    const history = await getUserHistory(userId, { limit: 5 });

    // 2. 최근 7일 통계
    const recentUsage = await getRecentUsage(userId, 7);

    // 3. 총 히스토리 개수
    const totalCount = await getUserHistoryCount(userId);

    // 4. 고유 도메인 목록
    const domains = await getUserDomains(userId);

    // 5. 이번 달 사용량
    const now = new Date();
    const monthlyUsage = await getMonthlyUsage(
      userId,
      now.getFullYear(),
      now.getMonth() + 1
    );

    return NextResponse.json({
      success: true,
      data: {
        recentHistory: history.data,
        hasMore: history.hasMore,
        recentUsage,
        totalCount,
        domains,
        monthlyUsage,
      },
    });
  } catch (error) {
    console.error('Query test error:', error);
    return NextResponse.json(
      {
        error: 'Query test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}