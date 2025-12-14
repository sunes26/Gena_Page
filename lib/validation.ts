// lib/validation.ts
import { z } from 'zod';
import { NextResponse } from 'next/server';

/**
 * Zod 검증 에러를 사용자 친화적인 에러 메시지로 변환
 */
export function formatZodError(error: z.ZodError): string {
  const firstError = error.issues[0];
  if (!firstError) return '입력값이 올바르지 않습니다.';

  const field = firstError.path.join('.');
  const message = firstError.message;

  return `${field}: ${message}`;
}

/**
 * 요청 본문을 검증하고 에러 시 NextResponse 반환
 */
export async function validateRequestBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; response: NextResponse }> {
  try {
    const body = await request.json();
    const validatedData = schema.parse(body);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        response: NextResponse.json(
          {
            error: 'Validation failed',
            message: '입력값이 올바르지 않습니다.',
            details: formatZodError(error),
            fields: error.issues.map((e: z.ZodIssue) => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          },
          { status: 400 }
        ),
      };
    }

    // JSON 파싱 에러
    return {
      success: false,
      response: NextResponse.json(
        {
          error: 'Invalid JSON',
          message: '요청 본문이 올바른 JSON 형식이 아닙니다.',
        },
        { status: 400 }
      ),
    };
  }
}

/**
 * API 검증 스키마
 */

// Auth 관련
export const createSessionSchema = z.object({
  idToken: z.string().min(1, 'ID token is required'),
});

// Subscription 관련
export const cancelSubscriptionSchema = z.object({
  cancelImmediately: z.boolean().optional().default(false),
});

export const createSubscriptionSchema = z.object({
  priceId: z.string().min(1, 'Price ID must not be empty').optional(),
  returnUrl: z.string().url('Return URL must be a valid URL').optional(),
});

// Query parameter 검증
export const userIdQuerySchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

/**
 * Query parameter 검증 헬퍼
 */
export function validateQueryParams<T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; response: NextResponse } {
  try {
    const params = Object.fromEntries(searchParams.entries());
    const validatedData = schema.parse(params);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        response: NextResponse.json(
          {
            error: 'Invalid query parameters',
            message: '쿼리 파라미터가 올바르지 않습니다.',
            details: formatZodError(error),
          },
          { status: 400 }
        ),
      };
    }

    return {
      success: false,
      response: NextResponse.json(
        {
          error: 'Validation error',
          message: '검증 중 오류가 발생했습니다.',
        },
        { status: 400 }
      ),
    };
  }
}
