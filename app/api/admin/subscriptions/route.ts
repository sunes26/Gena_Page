// app/api/admin/subscriptions/route.ts
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

/**
 * 전체 구독 목록 조회 (관리자 전용)
 * GET /api/admin/subscriptions
 *
 * Query Parameters:
 * - filter: 'all' | 'active' | 'canceled' | 'past_due' | 'cancel_scheduled'
 * - sort: 'createdAt' | 'currentPeriodEnd' | 'price'
 * - order: 'asc' | 'desc'
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
    const filter = searchParams.get('filter') || 'all';
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // 4. Firestore 작업
    const db = getAdminFirestore();
    const subscriptionsCollection = db.collection('subscription');

    // 필터링
    let subscriptionsSnapshot;
    if (filter === 'active') {
      subscriptionsSnapshot = await subscriptionsCollection
        .where('status', 'in', ['active', 'trialing'])
        .get();
    } else if (filter === 'canceled') {
      subscriptionsSnapshot = await subscriptionsCollection
        .where('status', '==', 'canceled')
        .get();
    } else if (filter === 'past_due') {
      subscriptionsSnapshot = await subscriptionsCollection
        .where('status', '==', 'past_due')
        .get();
    } else {
      subscriptionsSnapshot = await subscriptionsCollection.get();
    }

    // ✅ 최적화: 사용자 정보를 미리 가져와서 Map으로 저장 (N+1 제거)
    const userIds = subscriptionsSnapshot.docs.map(doc => doc.data().userId);
    const uniqueUserIds = [...new Set(userIds)];

    // 모든 사용자를 한 번에 조회
    const userEmailMap = new Map<string, string>();
    if (uniqueUserIds.length > 0) {
      // Firestore는 한 번에 최대 10개까지만 'in' 쿼리 가능
      const chunkSize = 10;
      for (let i = 0; i < uniqueUserIds.length; i += chunkSize) {
        const chunk = uniqueUserIds.slice(i, i + chunkSize);
        const usersSnapshot = await db
          .collection('users')
          .where('__name__', 'in', chunk)
          .get();

        usersSnapshot.docs.forEach(userDoc => {
          userEmailMap.set(userDoc.id, userDoc.data()?.email || 'Unknown');
        });
      }
    }

    // 구독 데이터 수집
    const subscriptionsData: SubscriptionData[] = [];

    for (const subDoc of subscriptionsSnapshot.docs) {
      const subData = subDoc.data();

      // cancel_scheduled 필터
      if (filter === 'cancel_scheduled' && !subData.cancelAtPeriodEnd) {
        continue;
      }

      // ✅ Map에서 사용자 이메일 가져오기 (추가 쿼리 없음)
      const userEmail = userEmailMap.get(subData.userId) || 'Unknown';

      subscriptionsData.push({
        id: subDoc.id,
        userId: subData.userId,
        userEmail,
        status: subData.status,
        paddleSubscriptionId: subData.paddleSubscriptionId,
        paddleCustomerId: subData.paddleCustomerId,
        priceId: subData.priceId,
        price: subData.price || 0,
        currency: subData.currency || 'KRW',
        currentPeriodEnd: subData.currentPeriodEnd instanceof Timestamp
          ? subData.currentPeriodEnd.toDate().toISOString()
          : new Date().toISOString(),
        nextBillingDate: subData.nextBillingDate instanceof Timestamp
          ? subData.nextBillingDate.toDate().toISOString()
          : null,
        cancelAtPeriodEnd: subData.cancelAtPeriodEnd || false,
        canceledAt: subData.canceledAt instanceof Timestamp
          ? subData.canceledAt.toDate().toISOString()
          : null,
        createdAt: subData.createdAt instanceof Timestamp
          ? subData.createdAt.toDate().toISOString()
          : new Date().toISOString(),
        updatedAt: subData.updatedAt instanceof Timestamp
          ? subData.updatedAt.toDate().toISOString()
          : new Date().toISOString(),
      });
    }

    // 정렬
    subscriptionsData.sort((a, b) => {
      let aVal: string | number = '';
      let bVal: string | number = '';

      switch (sort) {
        case 'currentPeriodEnd':
          aVal = a.currentPeriodEnd;
          bVal = b.currentPeriodEnd;
          break;
        case 'price':
          aVal = a.price;
          bVal = b.price;
          break;
        case 'createdAt':
        default:
          aVal = a.createdAt;
          bVal = b.createdAt;
          break;
      }

      if (order === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    // 페이지네이션
    const total = subscriptionsData.length;
    const paginatedSubscriptions = subscriptionsData.slice(offset, offset + limit);

    // 5. 성공 응답
    return successResponse(
      {
        subscriptions: paginatedSubscriptions,
        total,
        pagination: {
          limit,
          offset,
          hasMore: offset + limit < total,
        },
        filter,
        sort,
        order,
      },
      `${total}개 중 ${paginatedSubscriptions.length}개의 구독을 조회했습니다.`
    );

  } catch (error) {
    return safeInternalServerErrorResponse(
      '구독 목록 조회 중 오류가 발생했습니다.',
      error,
      'Get subscriptions error'
    );
  }
}
