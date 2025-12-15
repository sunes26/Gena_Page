// app/api/admin/backfill-all-users/route.ts
import { NextRequest } from 'next/server';
import { verifyIdToken } from '@/lib/firebase/admin-utils';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';
import { requireAdminToken } from '@/lib/admin-auth';
import { requireCSRFToken } from '@/lib/csrf';
import {
  successResponse,
  unauthorizedResponse,
  forbiddenResponse,
  safeInternalServerErrorResponse,
} from '@/lib/api-response';

/**
 * 전체 사용자 일일 통계 백필 엔드포인트 (관리자 전용)
 * POST /api/admin/backfill-all-users
 *
 * 모든 사용자의 히스토리 레코드를 기반으로 일일 통계를 생성합니다.
 *
 * 플로우:
 * 1. Firebase ID 토큰 인증
 * 2. 관리자 권한 확인
 * 3. 모든 사용자 조회
 * 4. 각 사용자의 히스토리 레코드 조회
 * 5. 날짜별로 그룹화하여 일일 통계 생성
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
    } catch (error) {
      console.error('Admin authorization failed:', {
        email: decodedToken.email,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return forbiddenResponse('관리자 권한이 필요합니다.');
    }

    // CSRF 보호
    const csrfResponse = await requireCSRFToken(request);
    if (csrfResponse) {
      return csrfResponse;
    }

    // 3. Firestore 작업
    const db = getAdminFirestore();

    // 3-1. 모든 사용자 조회
    const usersSnapshot = await db.collection('users').get();

    if (usersSnapshot.empty) {
      return successResponse(
        {
          totalUsers: 0,
          processedUsers: 0,
          totalHistories: 0,
          totalCreated: 0,
          totalUpdated: 0,
        },
        '처리할 사용자가 없습니다.'
      );
    }

    console.log(`📊 Total users to process: ${usersSnapshot.size}`);

    // 통계 변수
    let processedUsers = 0;
    let totalHistories = 0;
    let totalCreated = 0;
    let totalUpdated = 0;
    let errorUsers = 0;

    const userResults: Array<{
      userId: string;
      email: string;
      histories: number;
      created: number;
      updated: number;
      error?: string;
    }> = [];

    // 3-2. 각 사용자에 대해 백필 수행
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();
      const userEmail = userData.email || 'unknown';
      const isPremium = userData.isPremium || false;

      try {
        console.log(`\n🔄 Processing user: ${userEmail} (${userId})`);

        // 사용자의 모든 히스토리 레코드 조회
        const historySnapshot = await db
          .collection('users')
          .doc(userId)
          .collection('history')
          .where('deletedAt', '==', null)
          .orderBy('createdAt', 'asc')
          .get();

        if (historySnapshot.empty) {
          console.log(`  ⚠️ No history found for user: ${userEmail}`);
          userResults.push({
            userId,
            email: userEmail,
            histories: 0,
            created: 0,
            updated: 0,
          });
          continue;
        }

        // 날짜별로 그룹화
        const dailyCounts = new Map<string, number>();

        historySnapshot.docs.forEach((doc) => {
          const data = doc.data();
          const createdAt = data.createdAt as Timestamp;
          const date = createdAt.toDate().toISOString().split('T')[0]; // YYYY-MM-DD

          const currentCount = dailyCounts.get(date) || 0;
          dailyCounts.set(date, currentCount + 1);
        });

        console.log(`  📝 Found ${historySnapshot.size} histories, ${dailyCounts.size} unique dates`);

        // 일일 통계 생성/업데이트
        const dailyRef = db
          .collection('users')
          .doc(userId)
          .collection('daily');

        let createdCount = 0;
        let updatedCount = 0;

        // 배치 작업으로 최적화 (500개 제한)
        const batchSize = 500;
        const dates = Array.from(dailyCounts.keys());

        for (let i = 0; i < dates.length; i += batchSize) {
          const chunk = dates.slice(i, i + batchSize);

          // ✅ 배치 최적화: 모든 문서를 한 번에 조회 (N+1 쿼리 방지)
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

        console.log(`  ✅ Created: ${createdCount}, Updated: ${updatedCount}`);

        totalHistories += historySnapshot.size;
        totalCreated += createdCount;
        totalUpdated += updatedCount;
        processedUsers++;

        userResults.push({
          userId,
          email: userEmail,
          histories: historySnapshot.size,
          created: createdCount,
          updated: updatedCount,
        });

      } catch (error) {
        console.error(`  ❌ Error processing user ${userEmail}:`, error);
        errorUsers++;
        userResults.push({
          userId,
          email: userEmail,
          histories: 0,
          created: 0,
          updated: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // 4. 성공 응답
    console.log(`\n✅ Backfill completed!`);
    console.log(`  Total users: ${usersSnapshot.size}`);
    console.log(`  Processed: ${processedUsers}`);
    console.log(`  Errors: ${errorUsers}`);
    console.log(`  Total histories: ${totalHistories}`);
    console.log(`  Total created: ${totalCreated}`);
    console.log(`  Total updated: ${totalUpdated}`);

    return successResponse(
      {
        totalUsers: usersSnapshot.size,
        processedUsers,
        errorUsers,
        totalHistories,
        totalCreated,
        totalUpdated,
        details: userResults,
      },
      `백필 완료: ${processedUsers}명 처리, ${totalCreated}개 생성, ${totalUpdated}개 업데이트`
    );

  } catch (error) {
    return safeInternalServerErrorResponse(
      '전체 사용자 백필 작업 중 오류가 발생했습니다.',
      error,
      'Backfill all users error'
    );
  }
}

/**
 * GET 요청 - 엔드포인트 정보
 */
export async function GET() {
  return successResponse({
    message: 'Admin-only: Backfill daily stats for all users',
    usage: 'POST with Firebase ID token (admin email required)',
    requiredPermission: 'Admin email must be configured in ADMIN_EMAILS environment variable',
  });
}
