// app/api/admin/users/[userId]/route.ts
import { NextRequest } from 'next/server';
import { verifyIdToken } from '@/lib/firebase/admin-utils';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';
import { requireAdminToken } from '@/lib/admin-auth';
import { validateUserId } from '@/lib/validation';
import {
  successResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  safeInternalServerErrorResponse,
} from '@/lib/api-response';

interface UserDetailData {
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

/**
 * 사용자 상세 정보 조회 (관리자 전용)
 * GET /api/admin/users/[userId]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
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

    // 3. userId 파라미터 확인 및 검증
    const { userId } = await params;

    const userIdValidationError = validateUserId(userId);
    if (userIdValidationError) {
      return userIdValidationError;
    }

    // 4. Firestore 작업
    const db = getAdminFirestore();

    // 사용자 기본 정보
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return notFoundResponse('사용자를 찾을 수 없습니다.');
    }

    const userData = userDoc.data()!;

    // 구독 정보
    let subscription = null;
    const subscriptionSnapshot = await db
      .collection('subscription')
      .where('userId', '==', userId)
      .limit(1)
      .get();

    if (!subscriptionSnapshot.empty) {
      const subDoc = subscriptionSnapshot.docs[0];
      const subData = subDoc.data();
      subscription = {
        id: subDoc.id,
        status: subData.status,
        paddleSubscriptionId: subData.paddleSubscriptionId,
        price: subData.price || 0,
        currency: subData.currency || 'KRW',
        currentPeriodEnd: subData.currentPeriodEnd instanceof Timestamp
          ? subData.currentPeriodEnd.toDate().toISOString()
          : '',
        nextBillingDate: subData.nextBillingDate instanceof Timestamp
          ? subData.nextBillingDate.toDate().toISOString()
          : null,
        cancelAtPeriodEnd: subData.cancelAtPeriodEnd || false,
        createdAt: subData.createdAt instanceof Timestamp
          ? subData.createdAt.toDate().toISOString()
          : '',
      };
    }

    // 히스토리 통계
    const historySnapshot = await db
      .collection('users')
      .doc(userId)
      .collection('history')
      .get();

    const allHistories = historySnapshot.docs.map(doc => doc.data());
    const activeHistories = allHistories.filter(h => !h.deletedAt);
    const deletedHistories = allHistories.filter(h => h.deletedAt);

    // 마지막 활동
    let lastActivity: string | null = null;
    if (activeHistories.length > 0) {
      const sorted = activeHistories
        .filter(h => h.createdAt instanceof Timestamp)
        .sort((a, b) => {
          const aTime = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : 0;
          const bTime = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : 0;
          return bTime - aTime;
        });

      if (sorted.length > 0 && sorted[0].createdAt instanceof Timestamp) {
        lastActivity = sorted[0].createdAt.toDate().toISOString();
      }
    }

    // 최근 히스토리 (최대 10개)
    const recentHistories = activeHistories
      .filter(h => h.createdAt instanceof Timestamp)
      .sort((a, b) => {
        const aTime = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : 0;
        const bTime = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : 0;
        return bTime - aTime;
      })
      .slice(0, 10)
      .map((h, index) => ({
        id: historySnapshot.docs.find(doc => doc.data() === h)?.id || `history-${index}`,
        title: h.title || 'Untitled',
        url: h.url || '',
        createdAt: h.createdAt instanceof Timestamp
          ? h.createdAt.toDate().toISOString()
          : '',
      }));

    // Daily 통계
    const dailySnapshot = await db
      .collection('users')
      .doc(userId)
      .collection('daily')
      .get();

    const dailyStatsCount = dailySnapshot.size;
    const averagePerDay = dailyStatsCount > 0
      ? activeHistories.length / dailyStatsCount
      : 0;

    // 결제 내역
    const paymentsSnapshot = await db
      .collection('payments')
      .where('userId', '==', userId)
      .orderBy('paidAt', 'desc')
      .limit(10)
      .get();

    const payments = paymentsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        amount: data.amount || 0,
        currency: data.currency || 'KRW',
        status: data.status || 'unknown',
        paidAt: data.paidAt instanceof Timestamp
          ? data.paidAt.toDate().toISOString()
          : '',
      };
    });

    // 5. 응답 데이터 구성
    const responseData: UserDetailData = {
      user: {
        id: userId,
        email: userData.email || '',
        name: userData.name || userData.email?.split('@')[0] || 'Unknown',
        isPremium: userData.isPremium || false,
        subscriptionPlan: userData.subscriptionPlan || 'free',
        emailVerified: userData.emailVerified || false,
        photoURL: userData.photoURL || null,
        createdAt: userData.createdAt instanceof Timestamp
          ? userData.createdAt.toDate().toISOString()
          : '',
        updatedAt: userData.updatedAt instanceof Timestamp
          ? userData.updatedAt.toDate().toISOString()
          : '',
        ...(userData.manualPremiumOverride && {
          manualPremiumOverride: userData.manualPremiumOverride,
          manualPremiumAction: userData.manualPremiumAction,
          manualPremiumReason: userData.manualPremiumReason,
          manualPremiumUpdatedBy: userData.manualPremiumUpdatedBy,
        }),
      },
      subscription,
      statistics: {
        totalHistories: allHistories.length,
        deletedHistories: deletedHistories.length,
        activeHistories: activeHistories.length,
        lastActivity,
        dailyStatsCount,
        averagePerDay: Math.round(averagePerDay * 10) / 10,
      },
      recentHistories,
      payments,
    };

    // 6. 성공 응답
    return successResponse(
      responseData,
      '사용자 상세 정보를 조회했습니다.'
    );

  } catch (error) {
    return safeInternalServerErrorResponse(
      '사용자 상세 정보 조회 중 오류가 발생했습니다.',
      error,
      'Get user detail error'
    );
  }
}
