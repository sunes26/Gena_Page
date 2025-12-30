// app/api/auth/session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase/admin';
import { validateRequestBody, createSessionSchema } from '@/lib/validation';
import { applyRateLimit, getIdentifier, RATE_LIMITS } from '@/lib/rate-limit';
import { requireCSRFToken, setCSRFToken } from '@/lib/csrf';
import { safeInternalServerErrorResponse } from '@/lib/api-response';

/**
 * 세션 쿠키 생성
 * POST /api/auth/session
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limiting (Brute Force 방지)
    const identifier = getIdentifier(request);
    const rateLimitResponse = await applyRateLimit(identifier, RATE_LIMITS.AUTH);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // 2. 요청 본문 검증
    const validation = await validateRequestBody(request, createSessionSchema);
    if (!validation.success) {
      return validation.response;
    }

    const { idToken } = validation.data;

    // 2. ID 토큰 검증
    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(idToken);

    // 3. 세션 쿠키 생성 (5일 유효)
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days in milliseconds
    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn,
    });

    // 4. CSRF 토큰 생성
    const csrfToken = await setCSRFToken();

    // 5. NextResponse로 쿠키 설정
    const response = NextResponse.json(
      {
        success: true,
        message: 'Session created successfully',
        user: {
          uid: decodedToken.uid,
          email: decodedToken.email,
        },
        csrfToken, // 클라이언트가 헤더에 사용할 수 있도록 반환
      },
      { status: 200 }
    );

    // 쿠키 설정
    response.cookies.set({
      name: 'session',
      value: sessionCookie,
      maxAge: expiresIn / 1000, // seconds
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return response;
  } catch (error) {
    return safeInternalServerErrorResponse(
      '세션 생성 중 오류가 발생했습니다.',
      error,
      'Session creation error'
    );
  }
}

/**
 * 세션 쿠키 검증
 * GET /api/auth/session
 */
export async function GET(request: NextRequest) {
  try {
    // Request에서 쿠키 가져오기
    const sessionCookie = request.cookies.get('session');

    if (!sessionCookie?.value) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    // 세션 쿠키 검증
    const auth = getAdminAuth();
    const decodedClaims = await auth.verifySessionCookie(
      sessionCookie.value,
      true
    );

    return NextResponse.json({
      authenticated: true,
      user: {
        uid: decodedClaims.uid,
        email: decodedClaims.email,
      },
    });
  } catch (error) {
    console.error('Session verification error:', error);
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );
  }
}

/**
 * 세션 쿠키 삭제 (로그아웃)
 * DELETE /api/auth/session
 *
 * ✅ CSRF 검증 제거: 로그아웃은 사용자 세션을 종료하는 작업으로,
 * CSRF 공격으로 로그아웃되더라도 보안상 큰 문제가 없습니다.
 * 오히려 CSRF 검증 실패로 로그아웃이 안 되는 것이 더 큰 문제입니다.
 */
export async function DELETE(request: NextRequest) {
  try {
    // NextResponse로 쿠키 삭제
    const response = NextResponse.json({
      success: true,
      message: 'Session deleted successfully',
    });

    // 쿠키 삭제 (만료 시간을 과거로 설정)
    response.cookies.set({
      name: 'session',
      value: '',
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return response;
  } catch (error) {
    return safeInternalServerErrorResponse(
      '세션 삭제 중 오류가 발생했습니다.',
      error,
      'Session deletion error'
    );
  }
}