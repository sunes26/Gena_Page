# Sentry 설치 및 설정 가이드

## 📋 개요

Sentry는 프로덕션 환경에서 발생하는 에러를 실시간으로 추적하고 모니터링하는 서비스입니다.

**이미 준비된 것:**
- ✅ Sentry 설정 파일 (`lib/sentry.ts`)
- ✅ 환경변수 검증 (선택사항)
- ✅ Error Boundary 통합 준비

**해야 할 것:**
1. Sentry 계정 생성
2. npm 패키지 설치
3. 환경변수 설정
4. 앱에서 Sentry 초기화

---

## 1️⃣ Sentry 계정 생성

### Step 1: 회원가입

1. [https://sentry.io/signup/](https://sentry.io/signup/) 접속
2. GitHub, Google 또는 이메일로 가입
3. 무료 플랜 선택 (월 5,000 에러까지 무료)

### Step 2: 프로젝트 생성

1. "Create Project" 클릭
2. Platform: **Next.js** 선택
3. Project Name: `gena-web` (원하는 이름)
4. Team: Default 또는 새로운 팀 생성
5. "Create Project" 클릭

### Step 3: DSN 복사

프로젝트 생성 후 나오는 **DSN (Data Source Name)**을 복사합니다:

```
https://xxxxxxxxxxxxx@o123456.ingest.sentry.io/789012
```

---

## 2️⃣ npm 패키지 설치

```bash
npm install @sentry/nextjs
```

또는

```bash
yarn add @sentry/nextjs
```

---

## 3️⃣ 환경변수 설정

`.env.local` 파일에 다음 추가:

```env
# ============================================
# Sentry (에러 모니터링)
# ============================================
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
SENTRY_AUTH_TOKEN=your_sentry_auth_token
```

### 환경변수 설명

- **NEXT_PUBLIC_SENTRY_DSN**: Sentry 프로젝트 DSN (필수)
  - 위치: Sentry Dashboard → Settings → Client Keys (DSN)

- **SENTRY_AUTH_TOKEN**: 소스맵 업로드용 인증 토큰 (선택사항)
  - 위치: Sentry → Settings → Auth Tokens
  - Create New Token → Project: Write, Releases: Admin
  - 프로덕션 빌드 시 소스맵을 업로드하여 에러 위치를 정확히 파악 가능

---

## 4️⃣ 앱에서 Sentry 초기화

### 4.1 루트 레이아웃 수정

`app/layout.tsx` 파일 수정:

```typescript
import { initSentry } from '@/lib/sentry';

// 최상단에서 Sentry 초기화
if (typeof window !== 'undefined') {
  initSentry();
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // ... 기존 코드
}
```

### 4.2 AuthContext 통합

사용자 로그인/로그아웃 시 Sentry 사용자 정보 설정:

`contexts/AuthContext.tsx` 수정:

```typescript
import { setSentryUser, clearSentryUser } from '@/lib/sentry';

// 로그인 성공 후
if (authUser) {
  setSentryUser({
    id: authUser.uid,
    email: authUser.email || undefined,
    name: authUser.displayName || undefined,
  });
}

// 로그아웃 시
const logout = async () => {
  await signOut(auth);
  clearSentryUser();
};
```

### 4.3 Error Boundary 통합

`components/ErrorBoundary.tsx` 수정:

```typescript
import { captureError } from '@/lib/sentry';

componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
  // Sentry로 전송
  captureError(error, {
    errorInfo: errorInfo.componentStack,
  });

  // 기존 onError 호출
  this.props.onError?.(error, errorInfo);
}
```

### 4.4 API Route 에러 처리

```typescript
import { captureError } from '@/lib/sentry';

export async function POST(request: Request) {
  try {
    // API 로직
  } catch (error) {
    // Sentry로 전송
    captureError(error as Error, {
      endpoint: '/api/subscription/create',
      method: 'POST',
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## 5️⃣ 소스맵 업로드 (선택사항)

프로덕션 에러의 정확한 위치를 파악하려면 소스맵을 업로드해야 합니다.

### 5.1 Sentry Webpack Plugin 설정

`next.config.ts` 수정:

```typescript
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
  // ... 기존 설정
};

// Sentry 통합
const sentryWebpackPluginOptions = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: true,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
};

export default withSentryConfig(nextConfig, sentryWebpackPluginOptions);
```

### 5.2 추가 환경변수

```env
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=gena-web
```

---

## 6️⃣ 테스트

### 개발 환경 테스트

```typescript
// 아무 페이지에서 실행
import { captureMessage } from '@/lib/sentry';

// 버튼 클릭 핸들러
const testSentry = () => {
  captureMessage('Sentry test message', 'info');
  throw new Error('Sentry test error');
};
```

개발 환경에서는 콘솔에만 출력되고 Sentry로 전송되지 않습니다.

### 프로덕션 배포 후 테스트

1. 프로덕션 빌드 & 배포
2. 고의적으로 에러 발생
3. Sentry Dashboard에서 에러 확인

---

## 7️⃣ Sentry 기능

### 7.1 에러 추적

- 에러 발생 시각, 빈도, 영향받은 사용자 수
- 스택 트레이스 (소스맵 포함 시 정확한 위치)
- 브라우저, OS, 디바이스 정보

### 7.2 Breadcrumbs

에러 발생 전 사용자 행동 추적:

```typescript
import { addBreadcrumb } from '@/lib/sentry';

// 사용자 액션
addBreadcrumb({
  message: 'User clicked subscribe button',
  category: 'user-action',
  level: 'info',
  data: { plan: 'pro' },
});

// API 호출
addBreadcrumb({
  message: 'API request to /api/subscription/create',
  category: 'http',
  data: { method: 'POST', status: 200 },
});
```

### 7.3 Performance Monitoring

페이지 로딩 시간, API 응답 시간 추적 (이미 설정됨)

### 7.4 Session Replay

에러 발생 시 사용자 화면 녹화 (이미 설정됨, 민감정보 마스킹)

---

## 8️⃣ 알림 설정

### Slack 연동

1. Sentry Dashboard → Settings → Integrations
2. Slack 설치
3. 채널 선택 (예: #dev-alerts)
4. 알림 조건 설정 (예: 에러 첫 발생 시)

### 이메일 알림

1. Settings → Notifications
2. Email 활성화
3. 알림 빈도 설정 (즉시, 시간당, 일일)

---

## 9️⃣ 비용

### 무료 플랜
- **월 5,000 에러** 무료
- 1명 사용자
- 기본 알림

### Developer 플랜 ($26/월)
- **월 50,000 에러**
- 무제한 사용자
- 고급 알림
- Session Replay

대부분의 스타트업은 **무료 플랜으로 충분**합니다.

---

## 🔟 체크리스트

배포 전 확인사항:

- [ ] Sentry 계정 생성 완료
- [ ] `npm install @sentry/nextjs` 실행
- [ ] `.env.local`에 `NEXT_PUBLIC_SENTRY_DSN` 추가
- [ ] `app/layout.tsx`에서 `initSentry()` 호출
- [ ] `AuthContext`에서 사용자 정보 설정
- [ ] `ErrorBoundary`에서 에러 전송
- [ ] 프로덕션 배포
- [ ] Sentry Dashboard에서 에러 확인
- [ ] Slack 알림 설정 (선택)

---

## 참고 자료

- [Sentry Next.js 공식 문서](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Error Filtering](https://docs.sentry.io/platforms/javascript/configuration/filtering/)
- [Session Replay](https://docs.sentry.io/platforms/javascript/session-replay/)

---

**설정 난이도**: ⭐⭐☆☆☆ (쉬움)
**예상 소요 시간**: 30분
**우선순위**: 🔴 High (프로덕션 배포 전 필수)
