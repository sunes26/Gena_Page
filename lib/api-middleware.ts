// lib/api-middleware.ts
/**
 * API 미들웨어
 * 인증, 에러 처리, 로깅 등의 공통 로직을 재사용 가능한 미들웨어로 제공
 */

import { NextRequest } from 'next/server';
import { verifyIdToken } from './firebase/admin-utils';
import {
  unauthorizedResponse,
  internalServerErrorResponse,
  type ApiResponse,
} from './api-response';
import { logSecurityEvent } from './audit';

/**
 * 인증된 사용자 정보
 */
export interface AuthenticatedUser {
  uid: string;
  email?: string;
  emailVerified: boolean;
}

/**
 * API 핸들러 타입 (인증 필요)
 */
export type AuthenticatedApiHandler<T = unknown> = (
  request: NextRequest,
  user: AuthenticatedUser
) => Promise<ApiResponse<T>>;

/**
 * ✅ 인증 미들웨어
 * Authorization Bearer 토큰을 검증하고 사용자 정보를 추출합니다.
 *
 * @param request - Next.js Request
 * @returns 인증된 사용자 정보 또는 에러 응답
 */
export async function withAuth(
  request: NextRequest
): Promise<{ success: true; user: AuthenticatedUser } | { success: false; response: ReturnType<typeof unauthorizedResponse> }> {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // 보안 이벤트 로깅
      await logSecurityEvent(
        'security.unauthorized_access',
        undefined,
        {
          reason: 'Missing or invalid Authorization header',
          path: request.nextUrl.pathname,
          method: request.method,
        },
        request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined
      ).catch((err) => {
        console.error('Failed to log security event:', err);
      });

      return {
        success: false,
        response: unauthorizedResponse('인증 헤더가 누락되었거나 올바르지 않습니다.'),
      };
    }

    const token = authHeader.split('Bearer ')[1];

    let decodedToken;
    try {
      decodedToken = await verifyIdToken(token);
    } catch (error) {
      console.error('Token verification error:', error);

      // 보안 이벤트 로깅
      await logSecurityEvent(
        'security.token_expired',
        undefined,
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          path: request.nextUrl.pathname,
          method: request.method,
        },
        request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined
      ).catch((err) => {
        console.error('Failed to log security event:', err);
      });

      return {
        success: false,
        response: unauthorizedResponse('토큰이 유효하지 않거나 만료되었습니다.'),
      };
    }

    return {
      success: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified || false,
      },
    };
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return {
      success: false,
      response: internalServerErrorResponse(
        '인증 처리 중 오류가 발생했습니다.',
        error instanceof Error ? error.message : 'Unknown error'
      ),
    };
  }
}

/**
 * ✅ 인증 필수 API 핸들러 래퍼
 * 인증을 자동으로 처리하고, 인증된 사용자 정보를 핸들러에 전달합니다.
 *
 * @param handler - 인증된 사용자와 함께 호출될 핸들러
 * @returns Next.js API 핸들러
 *
 * @example
 * export const POST = requireAuth(async (request, user) => {
 *   // user.uid 사용 가능
 *   return successResponse({ userId: user.uid });
 * });
 */
export function requireAuth<T = unknown>(
  handler: AuthenticatedApiHandler<T>
) {
  return async (request: NextRequest) => {
    const authResult = await withAuth(request);

    if (!authResult.success) {
      return authResult.response;
    }

    try {
      return await handler(request, authResult.user);
    } catch (error) {
      console.error('API handler error:', error);
      return internalServerErrorResponse(
        '요청 처리 중 오류가 발생했습니다.',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  };
}

/**
 * ✅ 에러 핸들링 미들웨어
 * 모든 에러를 잡아서 표준화된 에러 응답으로 변환합니다.
 *
 * @param handler - 실행할 핸들러
 * @returns 에러 처리가 적용된 핸들러
 */
export function withErrorHandler<T = unknown>(
  handler: (request: NextRequest) => Promise<ApiResponse<T>>
) {
  return async (request: NextRequest) => {
    try {
      return await handler(request);
    } catch (error) {
      console.error('Unhandled API error:', error);
      return internalServerErrorResponse(
        '요청 처리 중 예상치 못한 오류가 발생했습니다.',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  };
}

/**
 * ✅ 요청 로깅 미들웨어
 * API 요청과 응답을 로깅합니다.
 *
 * @param handler - 실행할 핸들러
 * @returns 로깅이 적용된 핸들러
 */
export function withRequestLogging<T = unknown>(
  handler: (request: NextRequest) => Promise<ApiResponse<T>>
) {
  return async (request: NextRequest) => {
    const startTime = Date.now();
    const method = request.method;
    const path = request.nextUrl.pathname;

    console.log(`📨 [${method}] ${path} - Request started`);

    try {
      const response = await handler(request);
      const duration = Date.now() - startTime;

      console.log(`✅ [${method}] ${path} - Completed in ${duration}ms`);

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      console.error(`❌ [${method}] ${path} - Failed in ${duration}ms:`, error);

      throw error;
    }
  };
}

/**
 * ✅ 미들웨어 체이닝 헬퍼
 * 여러 미들웨어를 조합하여 사용합니다.
 *
 * @param handler - 최종 핸들러
 * @param middlewares - 적용할 미들웨어 배열
 * @returns 미들웨어가 적용된 핸들러
 *
 * @example
 * export const POST = compose(
 *   async (request, user) => {
 *     return successResponse({ userId: user.uid });
 *   },
 *   [requireAuth, withErrorHandler, withRequestLogging]
 * );
 */
export function compose<T = unknown>(
  handler: AuthenticatedApiHandler<T>,
  options: {
    auth?: boolean;
    logging?: boolean;
    errorHandling?: boolean;
  } = {
    auth: true,
    logging: true,
    errorHandling: true,
  }
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let composedHandler: any;

  // 1. 인증 적용
  if (options.auth) {
    composedHandler = requireAuth(handler);
  } else {
    // 인증 없이 직접 핸들러 호출
    composedHandler = async (request: NextRequest) => {
      return await handler(request, {
        uid: '',
        emailVerified: false,
      });
    };
  }

  // 2. 에러 핸들링 적용
  if (options.errorHandling) {
    composedHandler = withErrorHandler(composedHandler);
  }

  // 3. 로깅 적용
  if (options.logging) {
    composedHandler = withRequestLogging(composedHandler);
  }

  return composedHandler;
}
