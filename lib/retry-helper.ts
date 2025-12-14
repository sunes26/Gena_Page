// lib/retry-helper.ts
/**
 * ✅ 에러 처리 개선 - 재시도 로직
 * 일시적인 네트워크 오류나 데이터베이스 연결 실패 시 재시도
 */

interface RetryOptions {
  maxRetries?: number;
  delayMs?: number;
  backoffMultiplier?: number;
  onRetry?: (error: Error, attempt: number) => void;
}

/**
 * 함수를 재시도하는 헬퍼 함수
 *
 * @param fn - 실행할 비동기 함수
 * @param options - 재시도 옵션
 * @returns 함수 실행 결과
 *
 * @example
 * ```ts
 * const result = await retryAsync(
 *   () => updateUserProfile(userId, data),
 *   { maxRetries: 3, delayMs: 1000 }
 * );
 * ```
 */
export async function retryAsync<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    delayMs = 1000,
    backoffMultiplier = 2,
    onRetry,
  } = options;

  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // 마지막 시도였으면 에러 던지기
      if (attempt === maxRetries - 1) {
        throw lastError;
      }

      // 재시도 콜백 호출
      if (onRetry) {
        onRetry(lastError, attempt + 1);
      }

      // 지수 백오프 대기
      const delay = delayMs * Math.pow(backoffMultiplier, attempt);
      console.warn(
        `Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms. Error: ${lastError.message}`
      );

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // TypeScript를 위한 코드 (실제로는 도달하지 않음)
  throw lastError!;
}

/**
 * 특정 에러만 재시도하는 헬퍼 함수
 *
 * @param fn - 실행할 비동기 함수
 * @param shouldRetry - 재시도 여부를 판단하는 함수
 * @param options - 재시도 옵션
 * @returns 함수 실행 결과
 *
 * @example
 * ```ts
 * const result = await retryAsyncIf(
 *   () => fetchData(),
 *   (error) => error.message.includes('ECONNRESET'),
 *   { maxRetries: 3 }
 * );
 * ```
 */
export async function retryAsyncIf<T>(
  fn: () => Promise<T>,
  shouldRetry: (error: Error) => boolean,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    delayMs = 1000,
    backoffMultiplier = 2,
    onRetry,
  } = options;

  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // 재시도 조건 확인
      if (!shouldRetry(lastError) || attempt === maxRetries - 1) {
        throw lastError;
      }

      // 재시도 콜백 호출
      if (onRetry) {
        onRetry(lastError, attempt + 1);
      }

      // 지수 백오프 대기
      const delay = delayMs * Math.pow(backoffMultiplier, attempt);
      console.warn(
        `Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms. Error: ${lastError.message}`
      );

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * 네트워크 에러인지 확인하는 헬퍼 함수
 */
export function isNetworkError(error: Error): boolean {
  const message = error.message.toLowerCase();
  return (
    message.includes('network') ||
    message.includes('econnreset') ||
    message.includes('econnrefused') ||
    message.includes('timeout') ||
    message.includes('fetch failed')
  );
}

/**
 * Firestore 에러인지 확인하는 헬퍼 함수
 */
export function isFirestoreError(error: Error): boolean {
  const message = error.message.toLowerCase();
  return (
    message.includes('firestore') ||
    message.includes('unavailable') ||
    message.includes('deadline exceeded')
  );
}
