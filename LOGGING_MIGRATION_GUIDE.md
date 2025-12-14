# Logging Migration Guide

## 개요

이 프로젝트는 구조화된 로깅 시스템(`lib/logger.ts`)을 도입했습니다. `console.log`를 점진적으로 `logger`로 마이그레이션하여 더 나은 로그 관리를 할 수 있습니다.

## 현재 상태

- **프로덕션 보호**: `next.config.ts`에서 프로덕션 빌드 시 `console.log` 자동 제거됨 (console.error, console.warn은 유지)
- **console.log 개수**: 약 150개
- **마이그레이션 상태**: 로깅 시스템 준비 완료, 점진적 마이그레이션 대기중

## 로깅 시스템 사용법

### 기본 사용법

```typescript
import { logger } from '@/lib/logger';

// Before
console.log('User logged in:', userId);

// After
logger.info('User logged in', { userId });
```

### 로그 레벨

```typescript
import { logger } from '@/lib/logger';

// Debug (개발 환경에서만 표시)
logger.debug('Debugging info', { variable: value });

// Info (일반 정보)
logger.info('User action completed', { action: 'signup' });

// Warning (경고)
logger.warn('Deprecated function used', { function: 'oldMethod' });

// Error (에러)
logger.error('Failed to fetch data', error, { userId, endpoint });
```

### 모듈별 로거

```typescript
// 특정 모듈용 로거 (자동으로 module context 추가)
import { authLogger, apiLogger, paddleLogger, firebaseLogger } from '@/lib/logger';

// Auth 관련
authLogger.info('Login successful', { userId: 'abc123' });
// Output: [INFO] ℹ️ Login successful
//   Context: { module: 'auth', userId: 'abc123' }

// API 관련
apiLogger.error('API call failed', error, { endpoint: '/api/users' });

// Paddle 관련
paddleLogger.info('Checkout opened', { priceId });

// Firebase 관련
firebaseLogger.warn('Firestore query slow', { collection, duration });
```

### 커스텀 로거 생성

```typescript
import { createLogger } from '@/lib/logger';

const webhookLogger = createLogger({ module: 'webhook', service: 'paddle' });

webhookLogger.info('Webhook received', { eventType: 'subscription.created' });
```

## 마이그레이션 우선순위

### 1. 즉시 마이그레이션 (High Priority)

에러 처리 및 중요한 로직:

**파일:**
- `lib/paddle-webhook.ts` (10개) - Webhook 처리
- `lib/firebase/admin.ts` (3개) - Admin SDK 초기화
- `lib/firebase/queries.ts` (1개) - 중요한 쿼리 에러
- `app/api/webhooks/paddle/route.ts` (다수) - API 라우트

**예시:**

```typescript
// Before
console.error('⚠️ Firestore index required!');

// After
firebaseLogger.error('Firestore index required', undefined, {
  hint: 'Check the error message for the index creation link'
});
```

### 2. 중간 우선순위 (Medium Priority)

사용자 동작 및 상태 변경:

**파일:**
- `contexts/AuthContext.tsx` (7개) - 인증 상태
- `lib/paddle.ts` (13개) - Paddle 초기화 및 체크아웃
- `lib/paddle-server.ts` (6개) - Paddle 서버 API
- `hooks/useUsageStats.ts` (6개) - 통계 로딩
- `hooks/useHistory.ts` (8개) - 히스토리 로딩

**예시:**

```typescript
// Before
console.log('✅ User profile loaded:', userId);

// After
authLogger.info('User profile loaded', { userId });
```

### 3. 낮은 우선순위 (Low Priority)

디버깅 및 개발 로그:

**파일:**
- `contexts/LanguageContext.tsx` (4개) - 언어 변경
- `components/providers/PaddleProvider.tsx` (15개) - Paddle 초기화
- `lib/retry-helper.ts` (2개) - 재시도 로직

**예시:**

```typescript
// Before
console.log('Language changed to:', newLocale);

// After
logger.debug('Language changed', { locale: newLocale });
```

## 마이그레이션 패턴

### Pattern 1: 단순 로그

```typescript
// Before
console.log('Action completed');

// After
logger.info('Action completed');
```

### Pattern 2: 변수 포함 로그

```typescript
// Before
console.log('User ID:', userId);
console.log('✅ Profile created for:', email);

// After
logger.info('User profile created', { userId, email });
```

### Pattern 3: 에러 로그

```typescript
// Before
console.error('Failed to fetch:', error);
console.error('Error details:', error.message);

// After
logger.error('Failed to fetch data', error);
```

### Pattern 4: 조건부 로그

```typescript
// Before
if (isDevelopment) {
  console.log('Dev info:', data);
}

// After
logger.debug('Development info', { data });
// debug는 자동으로 개발 환경에서만 표시됨
```

### Pattern 5: 복잡한 컨텍스트

```typescript
// Before
console.log('Paddle checkout:', {
  priceId: PADDLE_PRICES.pro_monthly,
  customData: { visitorId: user.id }
});

// After
paddleLogger.info('Checkout initiated', {
  priceId: PADDLE_PRICES.pro_monthly,
  visitorId: user.id
});
```

## 제거해도 되는 로그

다음 로그는 제거해도 됩니다:

1. **중복 정보 로그**
   ```typescript
   // 불필요 - 다음 줄에 더 자세한 로그가 있음
   console.log('Starting...');
   console.log('Process started with params:', params);
   ```

2. **테스트용 로그**
   ```typescript
   // 개발 중 임시로 추가한 로그
   console.log('test', data);
   console.log('here');
   ```

3. **너무 빈번한 로그**
   ```typescript
   // 매 렌더링마다 실행되는 로그 (성능 영향)
   useEffect(() => {
     console.log('Component rendered');
   });
   ```

## 파일별 마이그레이션 체크리스트

### contexts/

- [ ] `AuthContext.tsx` (7개)
- [ ] `LanguageContext.tsx` (4개)

### lib/

- [ ] `paddle.ts` (13개)
- [ ] `paddle-webhook.ts` (10개)
- [ ] `paddle-server.ts` (6개)
- [ ] `firebase/admin.ts` (3개)
- [ ] `firebase/queries.ts` (1개)
- [ ] `retry-helper.ts` (2개)

### hooks/

- [ ] `useUsageStats.ts` (6개)
- [ ] `useHistory.ts` (8개)

### components/

- [ ] `providers/PaddleProvider.tsx` (15개)
- [ ] 기타 컴포넌트 (적음)

### app/api/

- [ ] `webhooks/paddle/route.ts` (다수)
- [ ] `subscription/*/route.ts` (소수)

## 프로덕션 고려사항

### 1. Sentry 통합 (권장)

```typescript
// lib/logger.ts의 sendToExternalService 메서드 수정
private sendToExternalService(entry: LogEntry) {
  if (entry.level === 'error' && typeof window !== 'undefined' && window.Sentry) {
    window.Sentry.captureException(entry.error || new Error(entry.message), {
      level: entry.level,
      extra: entry.context,
    });
  }
}
```

### 2. 로그 레벨 환경변수 제어

```typescript
// .env에 추가
LOG_LEVEL=info # development
LOG_LEVEL=warn # production
```

### 3. 성능 고려

- 프로덕션에서는 `debug` 로그 자동 비활성화됨
- `info` 로그는 선택적으로 비활성화 가능
- `warn`, `error`는 항상 활성화

## 예제: 전체 마이그레이션

### Before (contexts/LanguageContext.tsx)

```typescript
const setLocale = (newLocale: Locale) => {
  setLocaleState(newLocale);
  saveLocale(newLocale);
  console.log('Language changed to:', newLocale);
};
```

### After

```typescript
import { logger } from '@/lib/logger';

const setLocale = (newLocale: Locale) => {
  setLocaleState(newLocale);
  saveLocale(newLocale);
  logger.debug('Language changed', { locale: newLocale });
};
```

## 마이그레이션 스크립트 (선택사항)

간단한 정규식 치환으로 일부 마이그레이션 가능:

```bash
# 주의: 수동 검토 필수!

# Pattern 1: console.log('message') -> logger.info('message')
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i "s/console\.log(/logger.info(/g"

# Pattern 2: console.error -> logger.error
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i "s/console\.error(/logger.error(/g"

# Pattern 3: console.warn -> logger.warn
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i "s/console\.warn(/logger.warn(/g"
```

## 참고사항

- **프로덕션 안전**: `next.config.ts`에서 이미 console.log 제거 설정 완료
- **점진적 마이그레이션**: 급하게 모두 바꿀 필요 없음
- **우선순위**: 중요한 파일부터 순차적으로 마이그레이션
- **테스트**: 마이그레이션 후 기능 동작 확인 필수

---

**마지막 업데이트**: 2025-12-14
**마이그레이션 진행률**: 0/150 (0%)
