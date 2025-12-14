# Rate Limiting Redis 마이그레이션 가이드

## 📋 개요

현재 Rate Limiting은 메모리 기반으로 구현되어 있습니다. 이는 단일 서버 환경에서는 잘 작동하지만, Vercel 등의 서버리스 환경에서는 제대로 작동하지 않습니다.

**현재 상태:**
- ✅ 메모리 기반 Rate Limiting 구현 (`lib/rate-limit.ts`)
- ⚠️  서버리스 환경에서 비효율적
- ⚠️  여러 인스턴스 간 공유 불가

**Redis 마이그레이션 장점:**
1. 분산 환경에서 작동
2. 여러 서버 인스턴스 간 공유
3. 더 정확한 Rate Limiting
4. 영구 저장 (서버 재시작 후에도 유지)

---

## 옵션 1: Upstash Redis (권장 - 서버리스)

Vercel과 완벽하게 통합되는 서버리스 Redis 서비스입니다.

### 1. Upstash 계정 생성

1. [https://upstash.com/](https://upstash.com/) 접속
2. GitHub 또는 이메일로 가입
3. "Create Database" 클릭
4. Name: `gena-rate-limit`
5. Region: Asia Pacific (ap-northeast-1) - 서울
6. Type: Regional (무료)
7. "Create" 클릭

### 2. 연결 정보 복사

데이터베이스 생성 후:
- REST API URL 복사
- REST API Token 복사

### 3. 환경변수 설정

`.env.local`:

```env
# ============================================
# Upstash Redis (Rate Limiting)
# ============================================
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here
```

### 4. 패키지 설치

```bash
npm install @upstash/redis
```

### 5. Redis Rate Limiter 생성

`lib/rate-limit-redis.ts` (새 파일):

```typescript
import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

// Redis 클라이언트 초기화
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export interface RateLimitConfig {
  max: number;
  windowMs: number;
  blockDurationMs?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  blockedUntil?: number;
}

/**
 * Redis 기반 Rate Limiting
 * 분산 환경에서 작동하며 여러 서버 인스턴스 간 공유 가능
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const key = `ratelimit:${identifier}`;
  const blockKey = `ratelimit:block:${identifier}`;
  const now = Date.now();

  // 1. 차단 상태 확인
  const blockedUntil = await redis.get<number>(blockKey);
  if (blockedUntil && blockedUntil > now) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: blockedUntil,
      blockedUntil,
    };
  }

  // 2. 현재 요청 수 가져오기
  const currentCount = await redis.incr(key);

  // 3. TTL 설정 (첫 요청인 경우)
  if (currentCount === 1) {
    await redis.expire(key, Math.ceil(config.windowMs / 1000));
  }

  // 4. TTL 가져오기
  const ttl = await redis.ttl(key);
  const resetTime = now + (ttl > 0 ? ttl * 1000 : config.windowMs);

  // 5. 제한 초과 확인
  if (currentCount > config.max) {
    // 차단 설정
    if (config.blockDurationMs) {
      const blockUntil = now + config.blockDurationMs;
      await redis.set(blockKey, blockUntil, {
        px: config.blockDurationMs,
      });

      return {
        allowed: false,
        remaining: 0,
        resetTime: blockUntil,
        blockedUntil: blockUntil,
      };
    }

    return {
      allowed: false,
      remaining: 0,
      resetTime,
    };
  }

  // 6. 허용
  return {
    allowed: true,
    remaining: Math.max(0, config.max - currentCount),
    resetTime,
  };
}

/**
 * Rate Limit 미들웨어
 */
export async function applyRateLimitRedis(
  identifier: string,
  config: RateLimitConfig
): Promise<NextResponse | null> {
  const result = await checkRateLimit(identifier, config);

  if (!result.allowed) {
    const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);

    return NextResponse.json(
      {
        error: 'Too many requests',
        message: result.blockedUntil
          ? `Too many requests. You are blocked for ${Math.ceil(
              (result.blockedUntil - Date.now()) / 1000 / 60
            )} minutes.`
          : 'Too many requests. Please try again later.',
        retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': config.max.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': result.resetTime.toString(),
        },
      }
    );
  }

  return null;
}

// Rate Limit 설정 (기존 설정 재사용)
export const RATE_LIMITS = {
  AUTH: {
    max: 5,
    windowMs: 60 * 1000,
    blockDurationMs: 10 * 60 * 1000,
  },
  SUBSCRIPTION_CREATE: {
    max: 3,
    windowMs: 60 * 60 * 1000,
  },
  SUBSCRIPTION_MUTATION: {
    max: 10,
    windowMs: 60 * 1000,
  },
  WEBHOOK: {
    max: 100,
    windowMs: 60 * 1000,
  },
} as const;
```

### 6. API 라우트 수정

기존 `applyRateLimit` 대신 `applyRateLimitRedis` 사용:

```typescript
// Before
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

// After
import { applyRateLimitRedis, RATE_LIMITS } from '@/lib/rate-limit-redis';

export async function POST(request: Request) {
  // Rate limiting
  const rateLimitError = await applyRateLimitRedis(
    identifier,
    RATE_LIMITS.AUTH
  );
  if (rateLimitError) return rateLimitError;

  // ... 나머지 로직
}
```

---

## 옵션 2: 기존 Redis 서버

이미 Redis 서버가 있는 경우:

### 1. 패키지 설치

```bash
npm install ioredis
```

### 2. Redis 클라이언트 생성

`lib/redis.ts`:

```typescript
import Redis from 'ioredis';

export const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD,
  db: Number(process.env.REDIS_DB) || 0,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('error', (error) => {
  console.error('Redis connection error:', error);
});

redis.on('connect', () => {
  console.log('Redis connected');
});
```

### 3. 환경변수

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password
REDIS_DB=0
```

---

## 성능 비교

| 항목 | 메모리 | Redis |
|------|--------|-------|
| **속도** | 매우 빠름 | 빠름 |
| **분산 환경** | ❌ | ✅ |
| **영구 저장** | ❌ | ✅ |
| **서버리스** | ❌ | ✅ (Upstash) |
| **비용** | 무료 | 무료 (Upstash 10K req/day) |
| **설정 난이도** | 쉬움 | 중간 |

---

## 마이그레이션 체크리스트

- [ ] Upstash 계정 생성 (또는 기존 Redis 서버 준비)
- [ ] 환경변수 설정 (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`)
- [ ] `@upstash/redis` 패키지 설치
- [ ] `lib/rate-limit-redis.ts` 생성
- [ ] 모든 API 라우트에서 `applyRateLimit` → `applyRateLimitRedis` 변경
- [ ] 로컬 테스트
- [ ] 프로덕션 배포
- [ ] Rate Limit 동작 확인

---

## 테스트

### 로컬 테스트

```bash
# Rate limit 트리거
curl -X POST http://localhost:3000/api/auth/session \
  -H "Content-Type: application/json" \
  -d '{"idToken": "test"}' \
  --repeat 10
```

6번째 요청부터 429 응답이 와야 함:

```json
{
  "error": "Too many requests",
  "retryAfter": 60
}
```

### Upstash 대시보드 확인

1. Upstash Dashboard → Database
2. "Data Browser" 탭
3. `ratelimit:*` 키 확인

---

## 비용

### Upstash 무료 플랜
- 일일 10,000 요청
- 256MB 저장소
- 무제한 데이터베이스

대부분의 앱에 충분합니다. 초과 시:

### Upstash Pro 플랜 ($10/월)
- 일일 100,000 요청
- 1GB 저장소

---

## 언제 마이그레이션해야 할까?

### 즉시 마이그레이션 필요:
- ✅ Vercel 등 서버리스 플랫폼 사용 중
- ✅ 여러 서버 인스턴스 운영
- ✅ Rate Limit이 제대로 작동하지 않음

### 나중에 마이그레이션 가능:
- 단일 서버 환경
- 트래픽이 적음
- 개발 환경

---

## 참고 자료

- [Upstash Redis 문서](https://docs.upstash.com/redis)
- [Redis Rate Limiting Pattern](https://redis.io/docs/manual/patterns/rate-limiting/)
- [Vercel + Upstash 통합](https://vercel.com/integrations/upstash)

---

**설정 난이도**: ⭐⭐☆☆☆ (쉬움 - Upstash 사용 시)
**예상 소요 시간**: 30분
**우선순위**: 🟡 Medium (서버리스 환경이면 High)
**비용**: 무료 (Upstash 무료 플랜)
