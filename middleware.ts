// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * 보호된 경로 목록
 */
const protectedPaths = [
  '/dashboard',
  '/history',
  '/subscription',
  '/settings',
];

/**
 * 인증 경로 목록 (이미 로그인한 사용자는 접근 불가)
 * ✅ 제거: 로그인/회원가입 페이지는 클라이언트에서 처리
 */
const authPaths: string[] = [];

/**
 * 세션 쿠키 확인
 */
function hasSession(request: NextRequest): boolean {
  const sessionCookie = request.cookies.get('session');
  return !!sessionCookie?.value;
}

/**
 * Middleware 함수
 *
 * ✅ 간소화: Edge Runtime 제약으로 인해 세션 검증은 클라이언트/서버 컴포넌트에서 처리
 * - Middleware는 보호된 경로에 대한 1차 체크만 수행
 * - 실제 인증 상태는 각 페이지의 useAuth 훅에서 확인
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSessionCookie = hasSession(request);

  // 1. 보호된 경로 체크
  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  if (isProtectedPath && !hasSessionCookie) {
    // 로그인하지 않은 사용자 → /login으로 리다이렉트
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname); // 로그인 후 원래 페이지로
    return NextResponse.redirect(loginUrl);
  }

  // 2. 정상 접근 허용
  return NextResponse.next();
}

/**
 * Middleware가 실행될 경로 패턴
 */
export const config = {
  matcher: [
    /*
     * 다음 경로를 제외한 모든 경로에서 실행:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public 폴더의 파일들
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|test-firebase|test-admin|test-queries).*)',
  ],
};