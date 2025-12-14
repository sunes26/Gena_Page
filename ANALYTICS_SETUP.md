# Google Analytics 4 설치 및 설정 가이드

## 📋 개요

Google Analytics 4 (GA4)는 사용자 행동, 트래픽, 전환을 추적하는 무료 분석 도구입니다.

**이미 준비된 것:**
- ✅ Analytics 유틸리티 (`lib/analytics.ts`)
- ✅ GoogleAnalytics 컴포넌트 (`components/analytics/GoogleAnalytics.tsx`)
- ✅ 이벤트 추적 함수 (회원가입, 구독, 검색 등)

**해야 할 것:**
1. Google Analytics 계정 생성
2. 측정 ID 발급
3. 환경변수 설정
4. 컴포넌트 추가

---

## 1️⃣ Google Analytics 계정 생성

### Step 1: Google Analytics 계정 만들기

1. [https://analytics.google.com/](https://analytics.google.com/) 접속
2. Google 계정으로 로그인
3. "측정 시작" 클릭
4. 계정 이름 입력 (예: "Gena")
5. 데이터 공유 설정 (기본값 유지)
6. "다음" 클릭

### Step 2: 속성 만들기

1. 속성 이름: "Gena Web" (원하는 이름)
2. 보고 시간대: "대한민국 (GMT+09:00)"
3. 통화: "대한민국 원 (₩)"
4. "다음" 클릭

### Step 3: 비즈니스 정보

1. 업종 카테고리 선택 (예: "생산성 및 비즈니스")
2. 비즈니스 규모 선택 (예: "소규모 - 직원 1~10명")
3. GA 사용 목적 선택 (예: "사용자 행동 조사")
4. "만들기" 클릭

### Step 4: 데이터 스트림 설정

1. 플랫폼 선택: **"웹"** 클릭
2. 웹사이트 URL: `https://gena.app` (프로덕션 도메인)
3. 스트림 이름: "Gena Web"
4. "스트림 만들기" 클릭

### Step 5: 측정 ID 복사

데이터 스트림 생성 후 **측정 ID**를 복사합니다:

```
G-XXXXXXXXXX
```

이 ID를 환경변수에 사용합니다.

---

## 2️⃣ 환경변수 설정

`.env.local` 파일에 다음 추가:

```env
# ============================================
# Google Analytics 4
# ============================================
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

**프로덕션 환경 (Vercel):**
1. Vercel Dashboard → Project → Settings → Environment Variables
2. Name: `NEXT_PUBLIC_GA_MEASUREMENT_ID`
3. Value: `G-XXXXXXXXXX`
4. Environment: Production
5. "Save" 클릭

---

## 3️⃣ 앱에 GoogleAnalytics 컴포넌트 추가

`app/layout.tsx` 파일 수정:

```typescript
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        {/* Google Analytics */}
        <GoogleAnalytics />

        {/* 기존 Provider 및 children */}
        <LanguageProvider>
          <AuthProvider>
            <PaddleProvider>
              {children}
            </PaddleProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
```

---

## 4️⃣ 이벤트 추적 통합

### 4.1 회원가입 추적

`app/(auth)/signup/page.tsx`:

```typescript
import { trackSignup } from '@/lib/analytics';

// 이메일 회원가입 성공 후
await createUserWithEmailAndPassword(auth, email, password);
trackSignup('email');

// Google 로그인 성공 후
await signInWithPopup(auth, googleProvider);
trackSignup('google');
```

### 4.2 로그인 추적

`app/(auth)/login/page.tsx`:

```typescript
import { trackLogin } from '@/lib/analytics';

// 로그인 성공 후
trackLogin('email'); // or 'google'
```

### 4.3 구독 시작 추적

`components/payment/PaddleCheckout.tsx`:

```typescript
import { trackSubscribeStart } from '@/lib/analytics';

const handleCheckout = () => {
  trackSubscribeStart('pro-monthly');

  paddle?.Checkout.open({
    items: [{ priceId: PADDLE_PRICES.pro_monthly }],
  });
};
```

### 4.4 구독 완료 추적

`app/api/webhooks/paddle/route.ts`:

```typescript
import { trackPurchase } from '@/lib/analytics';

// subscription.created 이벤트 처리 후
trackPurchase({
  transactionId: subscription.id,
  value: Number(subscription.billing_details.totals.total) / 100,
  currency: subscription.currency_code,
  plan: 'pro-monthly',
});
```

### 4.5 검색 추적

`components/dashboard/SearchBar.tsx`:

```typescript
import { trackSearch } from '@/lib/analytics';

const handleSearch = (query: string) => {
  setSearchQuery(query);
  trackSearch(query, results.length);
};
```

### 4.6 설정 변경 추적

`components/dashboard/ProfileSettings.tsx`:

```typescript
import { trackSettingsChange } from '@/lib/analytics';

const handleLanguageChange = (locale: 'ko' | 'en') => {
  setLocale(locale);
  trackSettingsChange('language', locale);
};
```

---

## 5️⃣ 추가 설정 (선택사항)

### 5.1 Google Tag Manager (GTM) 통합

더 고급 추적이 필요한 경우 GTM 사용:

```env
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
```

### 5.2 Enhanced Measurement

GA4 대시보드에서 자동 추적 활성화:

1. 관리 → 데이터 스트림 → 웹 스트림 클릭
2. "향상된 측정" 섹션
3. 다음 항목 활성화:
   - ✅ 페이지 조회수
   - ✅ 스크롤
   - ✅ 이탈 클릭
   - ✅ 사이트 검색
   - ✅ 동영상 참여
   - ✅ 파일 다운로드

### 5.3 User-ID 추적

로그인한 사용자를 정확히 추적:

`contexts/AuthContext.tsx`:

```typescript
import { event } from '@/lib/analytics';

useEffect(() => {
  if (authUser && window.gtag) {
    window.gtag('set', 'user_properties', {
      user_id: authUser.uid,
    });
  }
}, [authUser]);
```

---

## 6️⃣ 주요 리포트

### 6.1 실시간 리포트

- 현재 활성 사용자 수
- 실시간 페이지 조회수
- 실시간 이벤트

### 6.2 사용자 획득 리포트

- 트래픽 소스 (Organic Search, Direct, Referral, Social)
- 신규 vs 재방문 사용자
- 전환율

### 6.3 참여도 리포트

- 페이지 조회수
- 평균 세션 시간
- 이탈률

### 6.4 전환 리포트

- 회원가입 수
- 구독 수
- 전환율

### 6.5 맞춤 이벤트

모든 `event()` 호출이 자동으로 추적됨:
- `sign_up`
- `login`
- `begin_checkout`
- `purchase`
- `search`
- 등등

---

## 7️⃣ 전환 이벤트 설정

중요한 이벤트를 전환으로 표시:

1. 관리 → 이벤트
2. "전환으로 표시" 토글 활성화:
   - `sign_up` ✅
   - `purchase` ✅
   - `begin_checkout` (선택)

---

## 8️⃣ 목표 설정

### 목표 1: 일일 회원가입 10명
### 목표 2: 월간 구독 전환율 5%
### 목표 3: 평균 세션 시간 2분 이상

---

## 9️⃣ GDPR & 개인정보 보호

### Cookie 배너 (필수 - EU 사용자)

```typescript
// 사용자 동의 후에만 GA 활성화
if (cookieConsent) {
  window.gtag('consent', 'update', {
    'analytics_storage': 'granted'
  });
}
```

### IP 익명화 (자동 적용)

GA4는 기본적으로 IP를 익명화합니다.

### 데이터 보관 기간

관리 → 데이터 설정 → 데이터 보관:
- 기본: 2개월
- 권장: 14개월

---

## 🔟 디버깅

### Google Analytics Debugger (Chrome Extension)

1. [GA Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/) 설치
2. 개발자 도구 → Console 탭
3. GA 이벤트가 전송되는지 확인

### Realtime Report

1. GA4 대시보드 → 보고서 → 실시간
2. 웹사이트에서 액션 수행
3. 1~2초 내에 실시간 리포트에 표시되어야 함

---

## 1️⃣1️⃣ 체크리스트

- [ ] Google Analytics 계정 생성
- [ ] 측정 ID 발급 (G-XXXXXXXXXX)
- [ ] `.env.local`에 `NEXT_PUBLIC_GA_MEASUREMENT_ID` 추가
- [ ] `app/layout.tsx`에 `<GoogleAnalytics />` 추가
- [ ] 프로덕션 배포
- [ ] Realtime Report에서 트래픽 확인
- [ ] 회원가입, 로그인 이벤트 추적 추가
- [ ] 구독 시작/완료 이벤트 추적 추가
- [ ] 전환 이벤트 설정
- [ ] 목표 설정
- [ ] Enhanced Measurement 활성화
- [ ] (선택) Cookie 배너 추가

---

## 1️⃣2️⃣ 유용한 팁

### 1. 필터 설정

개발 트래픽 제외:
- 관리 → 데이터 설정 → 데이터 필터
- "Internal Traffic" 필터 생성
- IP 주소 입력 (개발팀 IP)

### 2. 알림 설정

트래픽 급증/급감 알림:
- 관리 → 맞춤 알림
- 조건 설정 (예: 일일 사용자 50% 감소)

### 3. 탐색 분석

사용자 여정 분석:
- 탐색 → 경로 탐색
- 회원가입 → 구독 flow 분석

---

## 참고 자료

- [Google Analytics 4 공식 문서](https://support.google.com/analytics/answer/9304153)
- [GA4 이벤트 참조](https://developers.google.com/analytics/devguides/collection/ga4/reference/events)
- [Next.js with GA4](https://nextjs.org/docs/app/building-your-application/optimizing/analytics)

---

**설정 난이도**: ⭐☆☆☆☆ (매우 쉬움)
**예상 소요 시간**: 20분
**우선순위**: 🟡 Medium (프로덕션 배포 후 즉시 권장)
**비용**: 무료
