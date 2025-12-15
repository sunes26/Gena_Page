// app/api/admin/webhooks/route.ts
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

interface WebhookLogData {
  id: string;
  eventId: string;
  eventType: string;
  status: 'success' | 'failed';
  occurredAt: string;
  processedAt: string;
  error?: {
    message: string;
    stack?: string;
  };
}

/**
 * 웹훅 로그 조회 API (관리자 전용)
 * GET /api/admin/webhooks
 *
 * Query Parameters:
 * - filter: 'all' | 'success' | 'failed'
 * - eventType: string (선택사항) - 이벤트 타입 필터
 * - limit: number (default: 50, max: 100)
 * - offset: number (default: 0)
 * - days: number (default: 7) - 조회 기간 (일)
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
    const eventType = searchParams.get('eventType') || '';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const days = parseInt(searchParams.get('days') || '7');

    // 4. Firestore 작업
    const db = getAdminFirestore();
    const logsCollection = db.collection('webhook_logs');

    // 조회 기간 계산
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startTimestamp = Timestamp.fromDate(startDate);

    // 쿼리 구성
    let query = logsCollection
      .where('processedAt', '>=', startTimestamp)
      .orderBy('processedAt', 'desc');

    // 상태 필터
    if (filter === 'success' || filter === 'failed') {
      query = query.where('status', '==', filter);
    }

    // 이벤트 타입 필터
    if (eventType) {
      query = query.where('eventType', '==', eventType);
    }

    const logsSnapshot = await query.get();

    // 로그 데이터 수집
    const logsData: WebhookLogData[] = [];

    for (const logDoc of logsSnapshot.docs) {
      const logData = logDoc.data();

      logsData.push({
        id: logDoc.id,
        eventId: logData.eventId || '',
        eventType: logData.eventType || '',
        status: logData.status || 'success',
        occurredAt: logData.occurredAt instanceof Timestamp
          ? logData.occurredAt.toDate().toISOString()
          : new Date().toISOString(),
        processedAt: logData.processedAt instanceof Timestamp
          ? logData.processedAt.toDate().toISOString()
          : new Date().toISOString(),
        ...(logData.error && {
          error: {
            message: logData.error.message || 'Unknown error',
            stack: logData.error.stack,
          },
        }),
      });
    }

    // 페이지네이션
    const total = logsData.length;
    const paginatedLogs = logsData.slice(offset, offset + limit);

    // 통계 계산
    const successCount = logsData.filter(log => log.status === 'success').length;
    const failedCount = logsData.filter(log => log.status === 'failed').length;
    const successRate = total > 0 ? (successCount / total) * 100 : 0;

    // 이벤트 타입별 통계
    const byEventType: Record<string, number> = {};
    logsData.forEach(log => {
      byEventType[log.eventType] = (byEventType[log.eventType] || 0) + 1;
    });

    // 5. 성공 응답
    return successResponse(
      {
        logs: paginatedLogs,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
        stats: {
          total,
          successCount,
          failedCount,
          successRate: Math.round(successRate * 100) / 100,
          byEventType,
        },
        filter,
        eventType: eventType || null,
        days,
      },
      `${total}개의 웹훅 로그를 조회했습니다.`
    );

  } catch (error) {
    return safeInternalServerErrorResponse(
      '웹훅 로그 조회 중 오류가 발생했습니다.',
      error,
      'Get webhook logs error'
    );
  }
}
