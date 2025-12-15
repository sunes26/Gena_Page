// app/api/admin/backfill-user-stats/route.ts
import { NextRequest } from 'next/server';
import { verifyIdToken } from '@/lib/firebase/admin-utils';
import { requireAdminToken } from '@/lib/admin-auth';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';
import { requireCSRFToken } from '@/lib/csrf';
import {
  successResponse,
  unauthorizedResponse,
  forbiddenResponse,
  safeInternalServerErrorResponse,
} from '@/lib/api-response';

/**
 * 사용자 통계 필드 백필 (관리자 전용)
 * POST /api/admin/backfill-user-stats
 *
 * 모든 사용자에 대해 historyCount와 lastActivity 필드를 계산하여 업데이트
 * 이 엔드포인트는 denormalized fields를 도입한 후 한 번만 실행하면 됨
 */
export async function POST(request: NextRequest) {
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
    } catch {
      console.error('Admin authorization failed:', {
        email: decodedToken.email,
      });
      return forbiddenResponse('관리자 권한이 필요합니다.');
    }

    // CSRF 보호
    const csrfResponse = await requireCSRFToken(request);
    if (csrfResponse) {
      return csrfResponse;
    }

    // 3. 모든 사용자 조회
    const db = getAdminFirestore();
    const usersSnapshot = await db.collection('users').get();

    const stats = {
      totalUsers: 0,
      updated: 0,
      skipped: 0,
      errors: 0,
    };

    // 4. 각 사용자의 통계 계산 및 업데이트
    for (const userDoc of usersSnapshot.docs) {
      stats.totalUsers++;
      const userId = userDoc.id;

      try {
        // 히스토리 개수 조회
        const historyCountSnapshot = await db
          .collection('users')
          .doc(userId)
          .collection('history')
          .where('deletedAt', '==', null)
          .count()
          .get();

        const historyCount = historyCountSnapshot.data().count;

        // 가장 최근 히스토리 조회
        const lastActivitySnapshot = await db
          .collection('users')
          .doc(userId)
          .collection('history')
          .where('deletedAt', '==', null)
          .orderBy('createdAt', 'desc')
          .limit(1)
          .get();

        let lastActivity: Timestamp | null = null;
        if (!lastActivitySnapshot.empty) {
          const lastHistoryData = lastActivitySnapshot.docs[0].data();
          if (lastHistoryData.createdAt instanceof Timestamp) {
            lastActivity = lastHistoryData.createdAt;
          }
        }

        // 사용자 문서 업데이트
        const updateData: Record<string, unknown> = {
          historyCount,
          lastActivity,
          updatedAt: Timestamp.now(),
        };

        await userDoc.ref.update(updateData);
        stats.updated++;

        // 진행 상황 로그 (100명마다)
        if (stats.updated % 100 === 0) {
          console.log(`Backfill progress: ${stats.updated}/${stats.totalUsers} users processed`);
        }

      } catch (error) {
        console.error(`Error processing user ${userId}:`, error);
        stats.errors++;
      }
    }

    // 5. 성공 응답
    return successResponse(
      stats,
      `${stats.updated}명의 사용자 통계가 업데이트되었습니다.`
    );

  } catch (error) {
    return safeInternalServerErrorResponse(
      '사용자 통계 백필 중 오류가 발생했습니다.',
      error,
      'Backfill user stats error'
    );
  }
}
