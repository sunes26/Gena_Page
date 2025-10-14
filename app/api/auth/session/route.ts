// app/api/auth/session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase/admin';

/**
 * 세션 쿠키 생성
 * POST /api/auth/session
 */
export async function POST(request: NextRequest) {
  try {
    // 1. 요청 본문에서 ID 토큰 추출
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: 'ID token is required' },
        { status: 400 }
      );
    }

    // 2. ID 토큰 검증
    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(idToken);

    // 3. 세션 쿠키 생성 (5일 유효)
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days in milliseconds
    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn,
    });

    // 4. NextResponse로 쿠키 설정
    const response = NextResponse.json(
      {
        success: true,
        message: 'Session created successfully',
        user: {
          uid: decodedToken.uid,
          email: decodedToken.email,
        },
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
    console.error('Session creation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 401 }
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
 */
export async function DELETE() {
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
    console.error('Session deletion error:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}