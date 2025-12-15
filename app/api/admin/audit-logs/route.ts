// app/api/admin/audit-logs/route.ts
import { NextRequest } from 'next/server';
import { verifyIdToken } from '@/lib/firebase/admin-utils';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';
import { requireAdminToken } from '@/lib/admin-auth';
import type { AuditEventType, AuditSeverity } from '@/lib/audit';
import {
  successResponse,
  unauthorizedResponse,
  forbiddenResponse,
  safeInternalServerErrorResponse,
} from '@/lib/api-response';

interface AuditLogData {
  id: string;
  eventType: AuditEventType;
  severity: AuditSeverity;
  userId?: string;
  userEmail?: string;
  subscriptionId?: string;
  transactionId?: string;
  actor: {
    type: 'user' | 'system' | 'admin' | 'webhook';
    id?: string;
    ip?: string;
    userAgent?: string;
  };
  action: string;
  details?: Record<string, unknown>;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  timestamp: string;
  metadata?: {
    source?: string;
    environment?: string;
    version?: string;
  };
}

/**
 * 감사 로그 조회 (관리자 전용)
 * GET /api/admin/audit-logs
 *
 * Query Parameters:
 * - userId: string (선택사항)
 * - subscriptionId: string (선택사항)
 * - eventType: AuditEventType (선택사항)
 * - severity: AuditSeverity (선택사항)
 * - days: number (default: 7) - 조회 기간
 * - limit: number (default: 50, max: 200)
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
    const subscriptionId = searchParams.get('subscriptionId') || '';
    const eventType = searchParams.get('eventType') || '';
    const severity = searchParams.get('severity') || '';
    const days = parseInt(searchParams.get('days') || '7');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);
    const offset = parseInt(searchParams.get('offset') || '0');

    // 4. Firestore 작업
    const db = getAdminFirestore();

    // 조회 기간 계산
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startTimestamp = Timestamp.fromDate(startDate);

    // 기본 쿼리
    const query = db.collection('audit_logs')
      .where('timestamp', '>=', startTimestamp)
      .orderBy('timestamp', 'desc')
      .limit(500); // 최대 500개 가져와서 메모리에서 필터링

    const logsSnapshot = await query.get();

    // ✅ 최적화: 필터링 먼저 적용하여 필요한 로그만 선택
    const filteredLogs: Array<{ id: string; data: FirebaseFirestore.DocumentData }> = [];

    for (const logDoc of logsSnapshot.docs) {
      const logData = logDoc.data();

      // 필터 적용
      if (userId && logData.userId !== userId) continue;
      if (subscriptionId && logData.subscriptionId !== subscriptionId) continue;
      if (eventType && logData.eventType !== eventType) continue;
      if (severity && logData.severity !== severity) continue;

      filteredLogs.push({ id: logDoc.id, data: logData });
    }

    // ✅ 최적화: 사용자 이메일을 미리 가져와서 Map으로 저장 (N+1 쿼리 제거)
    const userIds = filteredLogs
      .map(log => log.data.userId)
      .filter((id): id is string => !!id);
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

    // 로그 데이터 수집
    const logsData: AuditLogData[] = [];

    for (const log of filteredLogs) {
      const logData = log.data;

      // ✅ Map에서 사용자 이메일 가져오기 (추가 쿼리 없음)
      const userEmail = logData.userId ? userEmailMap.get(logData.userId) : undefined;

      logsData.push({
        id: log.id,
        eventType: logData.eventType,
        severity: logData.severity,
        userId: logData.userId,
        userEmail,
        subscriptionId: logData.subscriptionId,
        transactionId: logData.transactionId,
        actor: logData.actor || { type: 'system' },
        action: logData.action || '',
        details: logData.details,
        before: logData.before,
        after: logData.after,
        timestamp: logData.timestamp instanceof Timestamp
          ? logData.timestamp.toDate().toISOString()
          : new Date().toISOString(),
        metadata: logData.metadata,
      });
    }

    // 페이지네이션
    const total = logsData.length;
    const paginatedLogs = logsData.slice(offset, offset + limit);

    // 통계 계산
    const byEventType: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};

    logsData.forEach(log => {
      byEventType[log.eventType] = (byEventType[log.eventType] || 0) + 1;
      bySeverity[log.severity] = (bySeverity[log.severity] || 0) + 1;
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
          byEventType,
          bySeverity,
        },
        filters: {
          userId: userId || null,
          subscriptionId: subscriptionId || null,
          eventType: eventType || null,
          severity: severity || null,
          days,
        },
      },
      `${total}개의 감사 로그를 조회했습니다.`
    );

  } catch (error) {
    return safeInternalServerErrorResponse(
      '감사 로그 조회 중 오류가 발생했습니다.',
      error,
      'Get audit logs error'
    );
  }
}
