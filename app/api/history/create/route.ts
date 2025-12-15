// app/api/history/create/route.ts
import { NextRequest } from 'next/server';
import { verifyIdToken } from '@/lib/firebase/admin-utils';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import { applyRateLimit, getIdentifier, RATE_LIMITS } from '@/lib/rate-limit';
import { requireCSRFToken } from '@/lib/csrf';
import {
  successResponse,
  unauthorizedResponse,
  validationErrorResponse,
  safeInternalServerErrorResponse,
} from '@/lib/api-response';
import { z } from 'zod';

/**
 * 히스토리 생성 스키마
 */
const createHistorySchema = z.object({
  title: z.string().min(1, '제목은 필수입니다').max(500, '제목은 최대 500자입니다'),
  url: z.string().url('올바른 URL 형식이 아닙니다').optional(),
  summary: z.string().optional(),
  content: z.string().optional(),
  metadata: z.object({
    domain: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }).optional(),
});

/**
 * 히스토리 생성 및 일일 통계 업데이트
 * POST /api/history/create
 *
 * 플로우:
 * 1. Firebase ID 토큰 인증
 * 2. 요청 데이터 검증
 * 3. 히스토리 문서 생성 (/users/{userId}/history)
 * 4. 일일 통계 업데이트 (/users/{userId}/daily/{date}) - 원자적 증가
 * 5. 사용자 프로필 업데이트 (isPremium 확인)
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

    const userId = decodedToken.uid;

    // Rate Limiting (사용자별 - 일반 요청 제한)
    const identifier = getIdentifier(request, userId);
    const rateLimitResponse = await applyRateLimit(identifier, RATE_LIMITS.GENERAL);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // CSRF 보호
    const csrfResponse = await requireCSRFToken(request);
    if (csrfResponse) {
      return csrfResponse;
    }

    // 2. 요청 본문 검증
    const body = await request.json();
    const validation = createHistorySchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(
        '요청 데이터가 올바르지 않습니다.',
        validation.error.issues[0]?.message
      );
    }

    const { title, url, summary, content, metadata } = validation.data;

    // 3. Firestore 작업
    const db = getAdminFirestore();

    // 3-1. 사용자 프로필 조회 (isPremium 확인)
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    const isPremium = userData?.isPremium || false;

    // 3-2. 히스토리 문서 생성
    const historyRef = db
      .collection('users')
      .doc(userId)
      .collection('history')
      .doc(); // 자동 생성된 ID

    const now = Timestamp.now();
    const historyData = {
      userId,
      title,
      url: url || null,
      summary: summary || null,
      content: content || null,
      metadata: metadata || null,
      createdAt: now,
      deletedAt: null,
    };

    await historyRef.set(historyData);

    // 3-3. 일일 통계 업데이트 (원자적 증가)
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const dailyRef = db
      .collection('users')
      .doc(userId)
      .collection('daily')
      .doc(today); // 날짜를 문서 ID로 사용

    // ✅ set with merge를 사용하여 문서가 없으면 생성, 있으면 업데이트
    await dailyRef.set(
      {
        userId,
        date: today,
        count: FieldValue.increment(1), // 원자적 증가
        isPremium,
        createdAt: Timestamp.now(), // 최초 생성 시에만 설정됨
      },
      { merge: true }
    );

    // 3-4. 사용자 문서 통계 업데이트 (denormalized fields for performance)
    const userRef = db.collection('users').doc(userId);
    await userRef.update({
      historyCount: FieldValue.increment(1),
      lastActivity: now,
      updatedAt: now,
    });

    // 4. 성공 응답
    return successResponse(
      {
        history: {
          id: historyRef.id,
          title,
          url: url || null,
          createdAt: historyData.createdAt.toDate().toISOString(),
        },
        dailyStats: {
          date: today,
        },
      },
      '히스토리가 생성되었습니다.'
    );

  } catch (error) {
    return safeInternalServerErrorResponse(
      '히스토리 생성 중 오류가 발생했습니다.',
      error,
      'History creation error'
    );
  }
}

/**
 * GET 요청 - 엔드포인트 정보
 */
export async function GET() {
  return successResponse({
    message: 'History creation endpoint',
    usage: 'POST with Firebase ID token to create history and update daily stats',
  });
}
