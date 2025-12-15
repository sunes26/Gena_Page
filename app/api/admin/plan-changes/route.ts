// app/api/admin/plan-changes/route.ts
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

interface PlanChangeData {
  id: string;
  userId: string;
  userEmail: string;
  subscriptionId: string;
  changeType: 'upgrade' | 'downgrade';
  oldPriceId: string;
  newPriceId: string;
  oldPrice: number;
  newPrice: number;
  currency: string;
  changedAt: string;
  effectiveAt: string;
  status: string;
}

/**
 * 플랜 변경 이력 조회 (관리자 전용)
 * GET /api/admin/plan-changes
 *
 * Query Parameters:
 * - userId: string (선택사항) - 특정 사용자의 변경 이력만 조회
 * - changeType: 'upgrade' | 'downgrade' (선택사항)
 * - limit: number (default: 50, max: 100)
 * - offset: number (default: 0)
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
    const userId = searchParams.get('userId') || '';
    const changeType = searchParams.get('changeType') || '';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // 4. Firestore 작업
    const db = getAdminFirestore();
    let query = db.collection('plan_changes').orderBy('changedAt', 'desc');

    // userId 필터
    if (userId) {
      query = query.where('userId', '==', userId);
    }

    // changeType 필터
    if (changeType === 'upgrade' || changeType === 'downgrade') {
      query = query.where('changeType', '==', changeType);
    }

    const changesSnapshot = await query.get();

    // ✅ 최적화: 사용자 정보를 미리 가져와서 Map으로 저장 (N+1 쿼리 제거)
    const userIds = changesSnapshot.docs.map(doc => doc.data().userId);
    const uniqueUserIds = [...new Set(userIds)];

    // 모든 사용자를 한 번에 조회
    const userEmailMap = new Map<string, string>();
    if (uniqueUserIds.length > 0) {
      // Firestore는 한 번에 최대 10개까지만 'in' 쿼리 가능
      const chunkSize = 10;
      for (let i = 0; i < uniqueUserIds.length; i += chunkSize) {
        const chunk = uniqueUserIds.slice(i, i + chunkSize);
        try {
          const usersSnapshot = await db
            .collection('users')
            .where('__name__', 'in', chunk)
            .get();

          usersSnapshot.docs.forEach(userDoc => {
            userEmailMap.set(userDoc.id, userDoc.data()?.email || 'Unknown');
          });
        } catch (err) {
          console.error('Failed to batch fetch user emails:', err);
        }
      }
    }

    // 플랜 변경 데이터 수집
    const changesData: PlanChangeData[] = [];

    for (const changeDoc of changesSnapshot.docs) {
      const changeData = changeDoc.data();

      // ✅ Map에서 사용자 이메일 가져오기 (추가 쿼리 없음)
      const userEmail = userEmailMap.get(changeData.userId) || 'Unknown';

      changesData.push({
        id: changeDoc.id,
        userId: changeData.userId,
        userEmail,
        subscriptionId: changeData.subscriptionId || changeData.paddleSubscriptionId || '',
        changeType: changeData.changeType,
        oldPriceId: changeData.oldPriceId,
        newPriceId: changeData.newPriceId,
        oldPrice: changeData.oldPrice || 0,
        newPrice: changeData.newPrice || 0,
        currency: changeData.currency || 'KRW',
        changedAt: changeData.changedAt instanceof Timestamp
          ? changeData.changedAt.toDate().toISOString()
          : new Date().toISOString(),
        effectiveAt: changeData.effectiveAt instanceof Timestamp
          ? changeData.effectiveAt.toDate().toISOString()
          : new Date().toISOString(),
        status: changeData.status || 'completed',
      });
    }

    // 페이지네이션
    const total = changesData.length;
    const paginatedChanges = changesData.slice(offset, offset + limit);

    // 통계
    const upgradeCount = changesData.filter(c => c.changeType === 'upgrade').length;
    const downgradeCount = changesData.filter(c => c.changeType === 'downgrade').length;

    // 5. 성공 응답
    return successResponse(
      {
        planChanges: paginatedChanges,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
        stats: {
          total,
          upgradeCount,
          downgradeCount,
        },
        filters: {
          userId: userId || null,
          changeType: changeType || null,
        },
      },
      `${total}개의 플랜 변경 이력을 조회했습니다.`
    );

  } catch (error) {
    return safeInternalServerErrorResponse(
      '플랜 변경 이력 조회 중 오류가 발생했습니다.',
      error,
      'Get plan changes error'
    );
  }
}
