// app/api/admin/backfill-daily-stats/route.ts
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
 * 일일 통계 백필 엔드포인트
 * POST /api/admin/backfill-daily-stats
 *
 * 기존 히스토리 레코드를 기반으로 일일 통계를 생성합니다.
 *
 * 플로우:
 * 1. Firebase ID 토큰 인증 (인증된 사용자만)
 * 2. 사용자의 모든 히스토리 레코드 조회
 * 3. 날짜별로 그룹화하여 일일 통계 생성
 * 4. 기존 통계와 병합 (덮어쓰지 않음)
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

    const userId = decodedToken.uid;

    // 3. CSRF 보호
    const csrfResponse = await requireCSRFToken(request);
    if (csrfResponse) {
      return csrfResponse;
    }

    // 4. Firestore 작업
    const db = getAdminFirestore();

    // 2-1. 사용자 프로필 조회
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return unauthorizedResponse('사용자 프로필을 찾을 수 없습니다.');
    }

    const userData = userDoc.data();
    const isPremium = userData?.isPremium || false;

    // 2-2. 모든 히스토리 레코드 조회 (deletedAt이 null인 것만)
    const historySnapshot = await db
      .collection('users')
      .doc(userId)
      .collection('history')
      .where('deletedAt', '==', null)
      .orderBy('createdAt', 'asc')
      .get();

    if (historySnapshot.empty) {
      return successResponse(
        {
          processed: 0,
          created: 0,
          message: '처리할 히스토리가 없습니다.',
        },
        '백필 작업이 완료되었습니다.'
      );
    }

    // 2-3. 날짜별로 그룹화
    const dailyCounts = new Map<string, number>();

    historySnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const createdAt = data.createdAt as Timestamp;
      const date = createdAt.toDate().toISOString().split('T')[0]; // YYYY-MM-DD

      const currentCount = dailyCounts.get(date) || 0;
      dailyCounts.set(date, currentCount + 1);
    });

    // 2-4. 일일 통계 생성/업데이트
    const dailyRef = db
      .collection('users')
      .doc(userId)
      .collection('daily');

    let createdCount = 0;
    let updatedCount = 0;

    // ✅ 배치 작업으로 최적화 (500개 제한)
    const batchSize = 500;
    const dates = Array.from(dailyCounts.keys());

    for (let i = 0; i < dates.length; i += batchSize) {
      const chunk = dates.slice(i, i + batchSize);

      // ✅ 배치로 모든 문서를 한 번에 조회 (N+1 쿼리 방지)
      const docRefs = chunk.map(date => dailyRef.doc(date));
      const existingDocs = await db.getAll(...docRefs);

      // 문서 존재 여부를 Map으로 저장
      const existingDocsMap = new Map<string, FirebaseFirestore.DocumentSnapshot>();
      existingDocs.forEach((doc) => {
        existingDocsMap.set(doc.id, doc);
      });

      // 배치 작업 수행
      const batch = db.batch();

      for (const date of chunk) {
        const count = dailyCounts.get(date) || 0;
        const docRef = dailyRef.doc(date);
        const existingDoc = existingDocsMap.get(date);

        if (existingDoc?.exists) {
          // 기존 문서가 있으면 count가 더 크면 업데이트
          const existingCount = existingDoc.data()?.count || 0;
          if (count > existingCount) {
            batch.update(docRef, {
              count,
              isPremium,
              updatedAt: Timestamp.now(),
            });
            updatedCount++;
          }
        } else {
          // 문서가 없으면 새로 생성
          batch.set(docRef, {
            userId,
            date,
            count,
            isPremium,
            createdAt: Timestamp.now(),
          });
          createdCount++;
        }
      }

      await batch.commit();
    }

    // 3. 성공 응답
    return successResponse(
      {
        processed: historySnapshot.size,
        uniqueDates: dailyCounts.size,
        created: createdCount,
        updated: updatedCount,
        dateRange: {
          start: dates[0],
          end: dates[dates.length - 1],
        },
      },
      `일일 통계가 백필되었습니다. (생성: ${createdCount}, 업데이트: ${updatedCount})`
    );

  } catch (error) {
    return safeInternalServerErrorResponse(
      '백필 작업 중 오류가 발생했습니다.',
      error,
      'Backfill error'
    );
  }
}

/**
 * GET 요청 - 엔드포인트 정보
 */
export async function GET() {
  return successResponse({
    message: 'Daily stats backfill endpoint',
    usage: 'POST with Firebase ID token to backfill daily stats from existing history',
  });
}
