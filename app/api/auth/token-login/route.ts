import { NextRequest, NextResponse } from 'next/server';

/**
 * 1회용 토큰 자동 로그인 API
 *
 * Chrome Extension에서 생성한 토큰을 검증하고
 * Gena 백엔드 서버에서 Firebase 커스텀 토큰을 받아 반환
 *
 * POST /api/auth/token-login
 * @body {string} token - 1회용 로그인 토큰
 * @returns {Object} customToken - Firebase 커스텀 토큰
 * @returns {Object} user - 사용자 정보
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        {
          success: false,
          message: '토큰이 필요합니다',
        },
        { status: 400 }
      );
    }

    // Gena 백엔드 서버 URL (환경 변수에서 가져오기)
    const backendUrl = process.env.GENA_BACKEND_URL || 'http://localhost:3000';

    // Gena 백엔드 서버에 토큰 검증 요청
    const response = await fetch(
      `${backendUrl}/api/auth/verify-web-login-token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        {
          success: false,
          message: errorData.message || '토큰 검증 실패',
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!data.success || !data.customToken) {
      return NextResponse.json(
        {
          success: false,
          message: '유효하지 않은 응답',
        },
        { status: 500 }
      );
    }

    // 성공 - Firebase 커스텀 토큰 반환
    return NextResponse.json({
      success: true,
      customToken: data.customToken,
      user: data.user,
    });
  } catch (error: any) {
    console.error('토큰 로그인 API 에러:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || '서버 오류가 발생했습니다',
      },
      { status: 500 }
    );
  }
}
