// app/api/admin/notifications/settings/route.ts
import { NextRequest } from 'next/server';
import { verifyIdToken } from '@/lib/firebase/admin-utils';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { requireAdminToken } from '@/lib/admin-auth';
import { requireCSRFToken } from '@/lib/csrf';
import {
  successResponse,
  unauthorizedResponse,
  forbiddenResponse,
  safeInternalServerErrorResponse,
} from '@/lib/api-response';

export interface NotificationSettings {
  enabled: boolean;
  recipients: string[]; // 이메일 주소 목록
  notifications: {
    newSubscription: boolean;
    subscriptionCanceled: boolean;
    paymentSuccess: boolean;
    paymentFailed: boolean;
    newUser: boolean;
    dailySummary: boolean;
  };
  dailySummaryTime: string; // HH:MM 형식 (예: "09:00")
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  recipients: [],
  notifications: {
    newSubscription: true,
    subscriptionCanceled: true,
    paymentSuccess: false,
    paymentFailed: true,
    newUser: false,
    dailySummary: false,
  },
  dailySummaryTime: '09:00',
};

/**
 * 알림 설정 조회
 * GET /api/admin/notifications/settings
 */
export async function GET(request: NextRequest) {
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

    // 3. Firestore에서 설정 조회
    const db = getAdminFirestore();
    const settingsDoc = await db.collection('admin_settings').doc('notifications').get();

    let settings: NotificationSettings;

    if (settingsDoc.exists) {
      settings = settingsDoc.data() as NotificationSettings;
    } else {
      settings = DEFAULT_SETTINGS;
    }

    return successResponse(settings, '알림 설정을 조회했습니다.');

  } catch (error) {
    return safeInternalServerErrorResponse(
      '알림 설정 조회 중 오류가 발생했습니다.',
      error,
      'Get notification settings error'
    );
  }
}

/**
 * 알림 설정 업데이트
 * POST /api/admin/notifications/settings
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
    const settings: NotificationSettings = {
      ...DEFAULT_SETTINGS,
      ...body,
    };

    // 4. Firestore에 저장
    const db = getAdminFirestore();
    await db.collection('admin_settings').doc('notifications').set(settings);

    return successResponse(settings, '알림 설정이 저장되었습니다.');

  } catch (error) {
    return safeInternalServerErrorResponse(
      '알림 설정 저장 중 오류가 발생했습니다.',
      error,
      'Update notification settings error'
    );
  }
}
