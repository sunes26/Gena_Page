// app/api/admin/users/[userId]/notes/route.ts
import { NextRequest } from 'next/server';
import { verifyIdToken } from '@/lib/firebase/admin-utils';
import { requireAdminToken } from '@/lib/admin-auth';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';
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
 * 사용자 노트 조회 (관리자 전용)
 * GET /api/admin/users/[userId]/notes
 */
export async function GET(
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

    // 3. userId 파라미터 확인 및 검증
    const { userId } = await params;

    const userIdValidationError = validateUserId(userId);
    if (userIdValidationError) {
      return userIdValidationError;
    }

    // 4. 노트 조회
    const db = getAdminFirestore();
    const notesSnapshot = await db
      .collection('users')
      .doc(userId)
      .collection('admin_notes')
      .orderBy('createdAt', 'desc')
      .get();

    const notes = notesSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        content: data.content,
        createdBy: data.createdBy || 'Unknown',
        createdAt:
          data.createdAt instanceof Timestamp
            ? data.createdAt.toDate().toISOString()
            : new Date().toISOString(),
      };
    });

    return successResponse(notes, `${notes.length}개의 노트를 조회했습니다.`);

  } catch (error) {
    return safeInternalServerErrorResponse(
      '노트 조회 중 오류가 발생했습니다.',
      error,
      'Get notes error'
    );
  }
}

/**
 * 사용자 노트 추가 (관리자 전용)
 * POST /api/admin/users/[userId]/notes
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
    const { content } = body;

    if (!content || !content.trim()) {
      return validationErrorResponse('노트 내용이 필요합니다.');
    }

    // 5. 노트 저장
    const db = getAdminFirestore();
    const noteData = {
      content: content.trim(),
      createdBy: decodedToken.email || decodedToken.uid,
      createdAt: Timestamp.now(),
    };

    const docRef = await db
      .collection('users')
      .doc(userId)
      .collection('admin_notes')
      .add(noteData);

    return successResponse(
      {
        id: docRef.id,
        ...noteData,
        createdAt: noteData.createdAt.toDate().toISOString(),
      },
      '노트가 저장되었습니다.'
    );

  } catch (error) {
    return safeInternalServerErrorResponse(
      '노트 저장 중 오류가 발생했습니다.',
      error,
      'Create note error'
    );
  }
}
