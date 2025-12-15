// app/api/admin/premium/route.ts
import { NextRequest } from 'next/server';
import { verifyIdToken } from '@/lib/firebase/admin-utils';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';
import { requireAdminToken } from '@/lib/admin-auth';
import { requireCSRFToken } from '@/lib/csrf';
import { validateUserId } from '@/lib/validation';
import {
  successResponse,
  unauthorizedResponse,
  forbiddenResponse,
  validationErrorResponse,
  safeInternalServerErrorResponse,
} from '@/lib/api-response';

/**
 * 수동 프리미엄 부여/해제 API (관리자 전용)
 * POST /api/admin/premium
 *
 * Body:
 * - userId: string (필수)
 * - action: 'grant' | 'revoke' (필수)
 * - reason: string (선택사항) - 부여/해제 이유
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

    // 3. 요청 본문 파싱
    let body;
    try {
      body = await request.json();
    } catch {
      return validationErrorResponse('요청 본문이 올바른 JSON 형식이 아닙니다.');
    }

    const { userId, action, reason } = body;

    // 4. 입력 검증
    const userIdValidationError = validateUserId(userId);
    if (userIdValidationError) {
      return userIdValidationError;
    }

    if (!action || (action !== 'grant' && action !== 'revoke')) {
      return validationErrorResponse('action은 "grant" 또는 "revoke"여야 합니다.');
    }

    // 5. Firestore 작업
    const db = getAdminFirestore();

    // 사용자 존재 확인
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return validationErrorResponse('사용자를 찾을 수 없습니다.');
    }

    const userData = userDoc.data();
    const currentIsPremium = userData?.isPremium || false;

    // 이미 같은 상태인지 확인
    if (action === 'grant' && currentIsPremium) {
      return validationErrorResponse('이미 프리미엄 사용자입니다.');
    }

    if (action === 'revoke' && !currentIsPremium) {
      return validationErrorResponse('이미 무료 사용자입니다.');
    }

    const isPremium = action === 'grant';
    const subscriptionPlan = isPremium ? 'pro' : 'free';

    // 6. users 컬렉션 업데이트
    await userRef.update({
      isPremium,
      subscriptionPlan,
      updatedAt: Timestamp.now(),
      // 수동 부여/해제 표시
      manualPremiumOverride: true,
      manualPremiumAction: action,
      manualPremiumUpdatedAt: Timestamp.now(),
      manualPremiumUpdatedBy: decodedToken.email || 'admin',
      ...(reason && { manualPremiumReason: reason }),
    });

    // 7. daily 컬렉션 업데이트 (오늘부터 미래 데이터)
    const today = new Date().toISOString().split('T')[0];
    const dailyRef = db
      .collection('users')
      .doc(userId)
      .collection('daily');

    // 최대 90일로 제한
    const dailySnapshot = await dailyRef
      .where('date', '>=', today)
      .limit(90)
      .get();

    if (!dailySnapshot.empty) {
      // 배치로 업데이트
      const batchSize = 500;
      const docs = dailySnapshot.docs;

      for (let i = 0; i < docs.length; i += batchSize) {
        const batch = db.batch();
        const chunk = docs.slice(i, i + batchSize);

        chunk.forEach(doc => {
          batch.update(doc.ref, {
            isPremium,
            updatedAt: Timestamp.now(),
          });
        });

        await batch.commit();
      }
    }

    // 8. 감사 로그 저장
    await db.collection('premium_manual_actions').add({
      userId,
      action,
      isPremium,
      subscriptionPlan,
      reason: reason || null,
      performedBy: decodedToken.email || 'admin',
      performedByUid: decodedToken.uid,
      userEmail: userData?.email || 'Unknown',
      createdAt: Timestamp.now(),
    });

    // 9. 성공 응답
    const actionText = action === 'grant' ? '부여' : '해제';
    return successResponse(
      {
        userId,
        action,
        isPremium,
        subscriptionPlan,
        userEmail: userData?.email || 'Unknown',
        dailyStatsUpdated: dailySnapshot.size,
      },
      `프리미엄 ${actionText}이 완료되었습니다.`
    );

  } catch (error) {
    return safeInternalServerErrorResponse(
      '프리미엄 부여/해제 중 오류가 발생했습니다.',
      error,
      'Manual premium action error'
    );
  }
}
