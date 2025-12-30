// lib/csrf.ts
/**
 * CSRF (Cross-Site Request Forgery) 보호 유틸리티
 */

import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const CSRF_TOKEN_NAME = '__Host-csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const TOKEN_LENGTH = 32;

/**
 * 랜덤 CSRF 토큰 생성
 */
function generateToken(): string {
  const array = new Uint8Array(TOKEN_LENGTH);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * CSRF 토큰을 쿠키에 설정
 * ✅ httpOnly: false - 클라이언트가 헤더에 포함시킬 수 있도록
 */
export async function setCSRFToken(): Promise<string> {
  const token = generateToken();
  const cookieStore = await cookies();

  cookieStore.set(CSRF_TOKEN_NAME, token, {
    httpOnly: false, // ✅ 클라이언트에서 읽을 수 있도록 설정
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 24시간
  });

  return token;
}

/**
 * CSRF 토큰 가져오기
 */
export async function getCSRFToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(CSRF_TOKEN_NAME)?.value || null;
}

/**
 * 요청에서 CSRF 토큰 검증
 */
export async function verifyCSRFToken(request: NextRequest): Promise<boolean> {
  // GET, HEAD, OPTIONS는 CSRF 검증 불필요
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return true;
  }

  // 쿠키에서 저장된 토큰 가져오기
  const cookieToken = request.cookies.get(CSRF_TOKEN_NAME)?.value;
  if (!cookieToken) {
    console.error('CSRF token missing in cookie');
    return false;
  }

  // 헤더에서 클라이언트가 보낸 토큰 가져오기
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  if (!headerToken) {
    console.error('CSRF token missing in header');
    return false;
  }

  // 토큰 비교 (timing attack 방지를 위해 constant-time 비교)
  if (cookieToken.length !== headerToken.length) {
    return false;
  }

  let mismatch = 0;
  for (let i = 0; i < cookieToken.length; i++) {
    mismatch |= cookieToken.charCodeAt(i) ^ headerToken.charCodeAt(i);
  }

  if (mismatch !== 0) {
    console.error('CSRF token mismatch');
    return false;
  }

  return true;
}

/**
 * CSRF 보호 미들웨어
 */
export async function requireCSRFToken(request: NextRequest): Promise<Response | null> {
  const isValid = await verifyCSRFToken(request);

  if (!isValid) {
    return new Response(
      JSON.stringify({
        success: false,
        error: { message: 'Invalid CSRF token', code: 'CSRF_TOKEN_INVALID' },
      }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  return null;
}
