// app/api/admin/activity-log/route.ts
import { NextRequest } from 'next/server';
import { verifyIdToken } from '@/lib/firebase/admin-utils';
import { requireAdminToken } from '@/lib/admin-auth';
import { requireCSRFToken } from '@/lib/csrf';
import {
  logAdminPageAccess,
  logAdminUserView,
  logAdminDataExport,
  logAdminEmailSent,
} from '@/lib/audit';
import {
  successResponse,
  unauthorizedResponse,
  forbiddenResponse,
  validationErrorResponse,
  safeInternalServerErrorResponse,
} from '@/lib/api-response';

/**
 * 관리자 활동 로깅
 * POST /api/admin/activity-log
 *
 * Body:
 * {
 *   "action": "page_access" | "user_view" | "data_export" | "email_sent",
 *   "details": { ... }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. 인증
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorizedResponse('인증 헤더가 누락되었거나 올바르지 않습니다.');
    }

    const token = authHeader.split('Bearer ')[1];
    let decodedToken;

    try {
      decodedToken = await verifyIdToken(token);
    } catch {
      return unauthorizedResponse('토큰이 유효하지 않거나 만료되었습니다.');
    }

    // 2. 관리자 권한 확인
    try {
      requireAdminToken(decodedToken);
    } catch {
      return forbiddenResponse('관리자 권한이 필요합니다.');
    }

    // CSRF 보호
    const csrfResponse = await requireCSRFToken(request);
    if (csrfResponse) {
      return csrfResponse;
    }

    // 3. 요청 본문 파싱
    const body = await request.json();
    const { action, details } = body;

    if (!action) {
      return validationErrorResponse('액션이 필요합니다.');
    }

    const adminId = decodedToken.uid;
    const adminEmail = decodedToken.email || 'unknown';
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined;

    // 4. 액션에 따라 로깅
    switch (action) {
      case 'page_access':
        if (!details?.page) {
          return validationErrorResponse('페이지 경로가 필요합니다.');
        }
        await logAdminPageAccess(adminId, adminEmail, details.page, ip);
        break;

      case 'user_view':
        if (!details?.targetUserId || !details?.targetUserEmail) {
          return validationErrorResponse('대상 사용자 정보가 필요합니다.');
        }
        await logAdminUserView(
          adminId,
          adminEmail,
          details.targetUserId,
          details.targetUserEmail,
          ip
        );
        break;

      case 'data_export':
        if (!details?.exportType || details?.recordCount === undefined) {
          return validationErrorResponse('내보내기 타입과 레코드 수가 필요합니다.');
        }
        await logAdminDataExport(
          adminId,
          adminEmail,
          details.exportType,
          details.recordCount,
          details.filters,
          ip
        );
        break;

      case 'email_sent':
        if (!details?.recipientEmail || !details?.emailType) {
          return validationErrorResponse('수신자 이메일과 이메일 타입이 필요합니다.');
        }
        await logAdminEmailSent(
          adminId,
          adminEmail,
          details.recipientEmail,
          details.emailType,
          ip
        );
        break;

      default:
        return validationErrorResponse('알 수 없는 액션입니다.');
    }

    return successResponse(
      { logged: true, action },
      '관리자 활동이 기록되었습니다.'
    );

  } catch (error) {
    return safeInternalServerErrorResponse(
      '활동 로깅 중 오류가 발생했습니다.',
      error,
      'Log admin activity error'
    );
  }
}
