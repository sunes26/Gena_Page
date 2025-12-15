// app/api/admin/users/[userId]/send-email/route.ts
import { NextRequest } from 'next/server';
import { verifyIdToken } from '@/lib/firebase/admin-utils';
import { requireAdminToken } from '@/lib/admin-auth';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { getEmailService } from '@/lib/email/service';
import { requireCSRFToken } from '@/lib/csrf';
import { validateUserId } from '@/lib/validation';
import {
  successResponse,
  unauthorizedResponse,
  forbiddenResponse,
  validationErrorResponse,
  notFoundResponse,
  safeInternalServerErrorResponse,
} from '@/lib/api-response';

/**
 * 사용자에게 이메일 전송 (관리자 전용)
 * POST /api/admin/users/[userId]/send-email
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
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

    // 3. userId 파라미터 확인 및 검증
    const { userId } = await params;

    const userIdValidationError = validateUserId(userId);
    if (userIdValidationError) {
      return userIdValidationError;
    }

    // 4. 요청 본문 파싱
    const body = await request.json();
    const { subject, message } = body;

    if (!subject || !message) {
      return validationErrorResponse('제목과 메시지가 필요합니다.');
    }

    // 5. 사용자 정보 조회
    const db = getAdminFirestore();
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return notFoundResponse('사용자를 찾을 수 없습니다.');
    }

    const userData = userDoc.data();
    const userEmail = userData?.email;

    if (!userEmail) {
      return validationErrorResponse('사용자 이메일을 찾을 수 없습니다.');
    }

    // 6. 이메일 전송
    const emailService = getEmailService();
    const sent = await emailService.sendEmail({
      to: userEmail,
      subject,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">${subject}</h2>
          <div style="color: #666; white-space: pre-wrap;">${message}</div>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
          <p style="color: #999; font-size: 12px;">
            이 이메일은 관리자가 보낸 메시지입니다.
          </p>
        </div>
      `,
      text: message,
    });

    if (!sent) {
      return safeInternalServerErrorResponse(
        '이메일 전송에 실패했습니다.',
        new Error('Email sending failed'),
        'Send email error'
      );
    }

    return successResponse(
      { sent: true, recipient: userEmail },
      '이메일이 전송되었습니다.'
    );

  } catch (error) {
    return safeInternalServerErrorResponse(
      '이메일 전송 중 오류가 발생했습니다.',
      error,
      'Send email error'
    );
  }
}
