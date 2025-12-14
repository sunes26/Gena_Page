// lib/rate-limit.ts
import { NextResponse } from 'next/server';

/**
 * Rate Limit 설정
 */
export interface RateLimitConfig {
  /** 시간 윈도우 내 최대 요청 수 */
  max: number;
  /** 시간 윈도우 (밀리초) */
  windowMs: number;
  /** 차단 시간 (밀리초, 선택사항) */
  blockDurationMs?: number;
  /** 에러 메시지 */
  message?: string;
}

/**
 * Rate Limit 저장소 인터페이스
 */
interface RateLimitEntry {
  count: number;
  resetTime: number;
  blockedUntil?: number;
}

/**
 * 메모리 기반 Rate Limit 저장소
 * 프로덕션에서는 Redis로 교체 권장
 */
class MemoryRateLimitStore {
  private store: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // 5분마다 만료된 항목 정리
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Rate limit 체크 및 업데이트
   */
  async check(key: string, config: RateLimitConfig): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
    blockedUntil?: number;
  }> {
    const now = Date.now();
    const entry = this.store.get(key);

    // 1. 차단 중인지 확인
    if (entry?.blockedUntil && entry.blockedUntil > now) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        blockedUntil: entry.blockedUntil,
      };
    }

    // 2. 기존 항목이 없거나 윈도우가 만료된 경우
    if (!entry || entry.resetTime <= now) {
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + config.windowMs,
      };
      this.store.set(key, newEntry);

      return {
        allowed: true,
        remaining: config.max - 1,
        resetTime: newEntry.resetTime,
      };
    }

    // 3. 제한 초과 확인
    if (entry.count >= config.max) {
      // 차단 시간 설정
      if (config.blockDurationMs) {
        entry.blockedUntil = now + config.blockDurationMs;
      }

      this.store.set(key, entry);

      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        blockedUntil: entry.blockedUntil,
      };
    }

    // 4. 카운트 증가
    entry.count++;
    this.store.set(key, entry);

    return {
      allowed: true,
      remaining: config.max - entry.count,
      resetTime: entry.resetTime,
    };
  }

  /**
   * 만료된 항목 정리
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      // 리셋 시간이 지나고 차단도 해제된 경우 삭제
      if (entry.resetTime <= now && (!entry.blockedUntil || entry.blockedUntil <= now)) {
        this.store.delete(key);
      }
    }
  }

  /**
   * 특정 키 초기화 (테스트용)
   */
  reset(key: string): void {
    this.store.delete(key);
  }

  /**
   * 전체 초기화 (테스트용)
   */
  resetAll(): void {
    this.store.clear();
  }

  /**
   * 정리 작업 중지
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
  }
}

// 싱글톤 인스턴스
const rateLimitStore = new MemoryRateLimitStore();

/**
 * Rate Limit 체크
 *
 * @param identifier - 식별자 (IP 주소, 사용자 ID 등)
 * @param config - Rate limit 설정
 * @returns 허용 여부와 상세 정보
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<{
  allowed: boolean;
  remaining: number;
  resetTime: number;
  blockedUntil?: number;
}> {
  return rateLimitStore.check(identifier, config);
}

/**
 * Rate Limit을 적용하고 초과 시 에러 응답 반환
 *
 * @param identifier - 식별자 (IP 주소, 사용자 ID 등)
 * @param config - Rate limit 설정
 * @returns 허용되면 null, 초과되면 NextResponse
 */
export async function applyRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<NextResponse | null> {
  const result = await checkRateLimit(identifier, config);

  if (!result.allowed) {
    const resetDate = new Date(result.resetTime);
    const blockedDate = result.blockedUntil ? new Date(result.blockedUntil) : null;

    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        message:
          config.message ||
          '요청 제한을 초과했습니다. 잠시 후 다시 시도해주세요.',
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
        resetAt: resetDate.toISOString(),
        ...(blockedDate && {
          blockedUntil: blockedDate.toISOString(),
        }),
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((result.resetTime - Date.now()) / 1000)),
          'X-RateLimit-Limit': String(config.max),
          'X-RateLimit-Remaining': String(result.remaining),
          'X-RateLimit-Reset': String(Math.ceil(result.resetTime / 1000)),
        },
      }
    );
  }

  return null;
}

/**
 * 요청에서 식별자 추출 (IP 주소 또는 사용자 ID)
 */
export function getIdentifier(request: Request, userId?: string): string {
  if (userId) {
    return `user:${userId}`;
  }

  // IP 주소 추출 (Vercel, Cloudflare, 일반 헤더 순서대로 확인)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');

  const ip =
    cfConnectingIp ||
    realIp ||
    forwarded?.split(',')[0]?.trim() ||
    'unknown';

  return `ip:${ip}`;
}

/**
 * 미리 정의된 Rate Limit 설정
 */
export const RATE_LIMITS = {
  /** 인증 API - 엄격 (Brute Force 방지) */
  AUTH: {
    max: 5,
    windowMs: 60 * 1000, // 1분
    blockDurationMs: 10 * 60 * 1000, // 10분 차단
    message: '로그인 시도 횟수를 초과했습니다. 10분 후 다시 시도해주세요.',
  },

  /** 구독 생성 - 보통 */
  SUBSCRIPTION_CREATE: {
    max: 3,
    windowMs: 60 * 60 * 1000, // 1시간
    blockDurationMs: 60 * 60 * 1000, // 1시간 차단
    message: '구독 생성 요청이 너무 많습니다. 1시간 후 다시 시도해주세요.',
  },

  /** 구독 조작 (취소, 재개 등) - 보통 */
  SUBSCRIPTION_MUTATE: {
    max: 10,
    windowMs: 60 * 1000, // 1분
    blockDurationMs: 5 * 60 * 1000, // 5분 차단
    message: '요청이 너무 많습니다. 5분 후 다시 시도해주세요.',
  },

  /** 일반 조회 API - 느슨 */
  GENERAL: {
    max: 60,
    windowMs: 60 * 1000, // 1분
    message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
  },
} as const;

/**
 * 테스트용 함수 (개발 환경에서만 사용)
 */
export const __testOnly = {
  reset: (identifier: string) => rateLimitStore.reset(identifier),
  resetAll: () => rateLimitStore.resetAll(),
  destroy: () => rateLimitStore.destroy(),
};
