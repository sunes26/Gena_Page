// app/api/admin/notifications/test/route.ts
import { NextRequest } from 'next/server';
import { verifyIdToken } from '@/lib/firebase/admin-utils';
import { requireAdminToken } from '@/lib/admin-auth';
import { getEmailService } from '@/lib/email/service';
import { getTestEmail } from '@/lib/email/templates';
import { requireCSRFToken } from '@/lib/csrf';
import {
  successResponse,
  unauthorizedResponse,
  forbiddenResponse,
  validationErrorResponse,
  safeInternalServerErrorResponse,
} from '@/lib/api-response';

/**
 * 테스트 이메일 전송
 * POST /api/admin/notifications/test
 *
 * Body:
 * {
 *   "email": "test@example.com"
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
    } catch (error) {
      console.error('Token verification error:', error);
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
    const { email } = body;

    if (!email) {
      return validationErrorResponse('이메일 주소가 필요합니다.');
    }

    // 4. 이메일 유효성 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return validationErrorResponse('유효하지 않은 이메일 주소입니다.');
    }

    // 5. 테스트 이메일 생성 및 전송
    const emailService = getEmailService();
    const emailTemplate = getTestEmail(email);

    const sent = await emailService.sendEmail({
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
    });

    if (!sent) {
      return safeInternalServerErrorResponse(
        '이메일 전송에 실패했습니다.',
        new Error('Email sending failed'),
        'Test email send error'
      );
    }

    return successResponse(
      { sent: true, recipient: email },
      '테스트 이메일이 전송되었습니다.'
    );

  } catch (error) {
    return safeInternalServerErrorResponse(
      '테스트 이메일 전송 중 오류가 발생했습니다.',
      error,
      'Send test email error'
    );
  }
}
