// lib/api-response.ts
/**
 * 표준화된 API 응답 형식
 * 모든 API 엔드포인트에서 일관된 응답 구조를 사용합니다.
 */

import { NextResponse } from 'next/server';

/**
 * 성공 응답 타입
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
}

/**
 * 에러 응답 타입
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
}

/**
 * API 응답 타입 (성공 또는 실패)
 */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * 표준 에러 코드
 */
export const API_ERROR_CODES = {
  // 인증 에러 (401)
  UNAUTHORIZED: 'UNAUTHORIZED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',

  // 권한 에러 (403)
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',

  // 리소스 에러 (404)
  NOT_FOUND: 'NOT_FOUND',
  SUBSCRIPTION_NOT_FOUND: 'SUBSCRIPTION_NOT_FOUND',
  USER_NOT_FOUND: 'USER_NOT_FOUND',

  // 검증 에러 (400)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_REQUEST: 'INVALID_REQUEST',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',

  // 비즈니스 로직 에러 (422)
  BUSINESS_LOGIC_ERROR: 'BUSINESS_LOGIC_ERROR',
  SUBSCRIPTION_ALREADY_CANCELED: 'SUBSCRIPTION_ALREADY_CANCELED',
  SUBSCRIPTION_NOT_ACTIVE: 'SUBSCRIPTION_NOT_ACTIVE',

  // 외부 서비스 에러 (502, 503)
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  PADDLE_API_ERROR: 'PADDLE_API_ERROR',
  FIREBASE_ERROR: 'FIREBASE_ERROR',

  // 서버 에러 (500)
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',

  // Rate limiting (429)
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
} as const;

/**
 * HTTP 상태 코드 매핑
 */
export const ERROR_STATUS_MAP: Record<string, number> = {
  // 401
  [API_ERROR_CODES.UNAUTHORIZED]: 401,
  [API_ERROR_CODES.TOKEN_EXPIRED]: 401,
  [API_ERROR_CODES.INVALID_TOKEN]: 401,

  // 403
  [API_ERROR_CODES.FORBIDDEN]: 403,
  [API_ERROR_CODES.INSUFFICIENT_PERMISSIONS]: 403,

  // 404
  [API_ERROR_CODES.NOT_FOUND]: 404,
  [API_ERROR_CODES.SUBSCRIPTION_NOT_FOUND]: 404,
  [API_ERROR_CODES.USER_NOT_FOUND]: 404,

  // 400
  [API_ERROR_CODES.VALIDATION_ERROR]: 400,
  [API_ERROR_CODES.INVALID_REQUEST]: 400,
  [API_ERROR_CODES.MISSING_REQUIRED_FIELD]: 400,

  // 422
  [API_ERROR_CODES.BUSINESS_LOGIC_ERROR]: 422,
  [API_ERROR_CODES.SUBSCRIPTION_ALREADY_CANCELED]: 422,
  [API_ERROR_CODES.SUBSCRIPTION_NOT_ACTIVE]: 422,

  // 502, 503
  [API_ERROR_CODES.EXTERNAL_SERVICE_ERROR]: 502,
  [API_ERROR_CODES.PADDLE_API_ERROR]: 502,
  [API_ERROR_CODES.FIREBASE_ERROR]: 503,

  // 500
  [API_ERROR_CODES.INTERNAL_SERVER_ERROR]: 500,
  [API_ERROR_CODES.UNKNOWN_ERROR]: 500,

  // 429
  [API_ERROR_CODES.RATE_LIMIT_EXCEEDED]: 429,
  [API_ERROR_CODES.TOO_MANY_REQUESTS]: 429,
};

/**
 * ✅ 성공 응답 생성
 *
 * @param data - 응답 데이터
 * @param message - 선택적 성공 메시지
 * @param status - HTTP 상태 코드 (기본값: 200)
 * @returns NextResponse
 */
export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiSuccessResponse<T>> {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };

  if (message) {
    response.message = message;
  }

  return NextResponse.json(response, { status });
}

/**
 * ✅ 에러 응답 생성
 *
 * @param code - 에러 코드 (API_ERROR_CODES 사용)
 * @param message - 에러 메시지
 * @param details - 선택적 에러 상세 정보
 * @param status - HTTP 상태 코드 (자동 매핑됨)
 * @returns NextResponse
 */
export function errorResponse(
  code: keyof typeof API_ERROR_CODES | string,
  message: string,
  details?: unknown,
  status?: number
): NextResponse<ApiErrorResponse> {
  const response: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
    },
    timestamp: new Date().toISOString(),
  };

  if (details) {
    response.error.details = details;
  }

  // 상태 코드 자동 매핑 (제공되지 않은 경우)
  const httpStatus = status || ERROR_STATUS_MAP[code] || 500;

  return NextResponse.json(response, { status: httpStatus });
}

/**
 * ✅ 인증 에러 응답 (401)
 */
export function unauthorizedResponse(message: string = '인증이 필요합니다.') {
  return errorResponse(
    API_ERROR_CODES.UNAUTHORIZED,
    message
  );
}

/**
 * ✅ 권한 에러 응답 (403)
 */
export function forbiddenResponse(message: string = '이 작업을 수행할 권한이 없습니다.') {
  return errorResponse(
    API_ERROR_CODES.FORBIDDEN,
    message
  );
}

/**
 * ✅ 리소스 없음 응답 (404)
 */
export function notFoundResponse(message: string = '요청한 리소스를 찾을 수 없습니다.') {
  return errorResponse(
    API_ERROR_CODES.NOT_FOUND,
    message
  );
}

/**
 * ✅ 검증 에러 응답 (400)
 */
export function validationErrorResponse(message: string, details?: unknown) {
  return errorResponse(
    API_ERROR_CODES.VALIDATION_ERROR,
    message,
    details
  );
}

/**
 * ✅ 비즈니스 로직 에러 응답 (422)
 */
export function businessLogicErrorResponse(message: string, details?: unknown) {
  return errorResponse(
    API_ERROR_CODES.BUSINESS_LOGIC_ERROR,
    message,
    details
  );
}

/**
 * ✅ 외부 서비스 에러 응답 (502)
 */
export function externalServiceErrorResponse(
  service: string,
  message: string,
  details?: unknown
) {
  return errorResponse(
    API_ERROR_CODES.EXTERNAL_SERVICE_ERROR,
    `${service} 서비스 오류: ${message}`,
    details
  );
}

/**
 * ✅ 서버 에러 응답 (500)
 */
export function internalServerErrorResponse(
  message: string = '서버 내부 오류가 발생했습니다.',
  details?: unknown
) {
  return errorResponse(
    API_ERROR_CODES.INTERNAL_SERVER_ERROR,
    message,
    details
  );
}

/**
 * ✅ Rate limit 에러 응답 (429)
 */
export function rateLimitErrorResponse(message: string = '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.') {
  return errorResponse(
    API_ERROR_CODES.RATE_LIMIT_EXCEEDED,
    message
  );
}
