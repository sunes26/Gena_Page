# Gena Page 프로젝트

> AI 기반 웹페이지 요약 Chrome 확장 프로그램과 웹 대시보드를 제공하는 SaaS 플랫폼

[![Next.js](https://img.shields.io/badge/Next.js-15.5.9-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-10.0-orange)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38bdf8)](https://tailwindcss.com/)
[![Paddle](https://img.shields.io/badge/Paddle-Billing-blue)](https://paddle.com/)

---

## 📋 목차

- [프로젝트 개요](#-프로젝트-개요)
- [기술 스택](#-기술-스택)
- [프로젝트 구조](#-프로젝트-구조)
- [시작하기](#-시작하기)
- [Firebase 설정](#-firebase-설정)
- [Paddle 결제 설정](#-paddle-결제-설정)
- [인증 에러 처리](#-인증-에러-처리)
- [구현된 기능](#-구현된-기능)
- [설정 페이지 변경사항](#-설정-페이지-변경사항)
- [코드 품질 개선](#-코드-품질-개선-v210)
- [해결된 주요 이슈](#-해결된-주요-이슈)
- [개발 가이드](#-개발-가이드)
- [배포](#-배포)

---

## 🎯 프로젝트 개요

### 서비스 개요
AI 기반 웹페이지 요약 Chrome 확장 프로그램과 웹 대시보드를 제공하는 SaaS 플랫폼

### 주요 목표
- ✅ 기존 Firebase 데이터를 활용한 웹 대시보드 구축
- ✅ 사용자가 요약 기록을 조회하고 관리할 수 있는 인터페이스 제공
- ✅ Paddle을 통한 프리미엄 구독 모델 수익화
- ✅ 사용 통계 및 분석 대시보드 제공

### 프로젝트명
**Gena_page**

---

## 🛠 기술 스택

### Frontend
- **Next.js 15.5.9** (App Router) - React 프레임워크
- **TypeScript** - 타입 안정성
- **Tailwind CSS** - 유틸리티 기반 스타일링
- **Shadcn/ui** - UI 컴포넌트 라이브러리
- **Zustand** - 클라이언트 상태 관리
- **SWR** - 서버 상태 관리 및 데이터 페칭

### Backend & Database
- **Firebase Firestore** - NoSQL 데이터베이스
- **Firebase Authentication** - 사용자 인증 (Email, Google)
- **Firebase Storage** - 파일 저장소
- **Firebase Admin SDK** - 서버 사이드 Firebase 작업
- **Next.js API Routes** - 서버리스 API

### 결제 시스템
- **Paddle Billing** - 글로벌 결제 처리
  - Sandbox (테스트) / Production (운영) 환경 지원
  - 구독 관리 (생성, 취소, 재개)
  - 결제 수단 변경
  - Webhook 이벤트 처리

### 외부 서비스
- **OpenAI API** - AI 요약 엔진
- **Vercel** - 호스팅 및 배포
- **Resend** - 이메일 발송

### 분석 & 모니터링
- **Google Analytics 4** - 웹사이트 방문자 추적 및 분석

---

## 📁 프로젝트 구조

```
C:.
│  .env.example                      # 환경 변수 예시
│  .env.local                        # 환경 변수 (gitignore)
│  .gitignore
│  components.json                   # shadcn/ui 설정
│  eslint.config.mjs
│  middleware.ts                     # 라우트 보호 미들웨어
│  next-env.d.ts
│  next.config.ts
│  package-lock.json
│  package.json
│  postcss.config.js
│  README.md
│  tailwind.config.js
│  tsconfig.json
│  tsconfig.tsbuildinfo
│
├─app
│  │  favicon.ico
│  │  globals.css                    # 전역 스타일
│  │  layout.tsx                     # 루트 레이아웃
│  │  manifest.ts                    # PWA 매니페스트
│  │  robots.ts                      # SEO robots.txt
│  │  sitemap.ts                     # SEO 사이트맵
│  │
│  ├─(auth)                          # 인증 페이지 그룹
│  │  ├─forgot-password
│  │  │      page.tsx                # 비밀번호 재설정
│  │  │
│  │  ├─login
│  │  │      layout.tsx
│  │  │      page.tsx                # 로그인 ✅ (에러 처리 개선)
│  │  │
│  │  ├─signup
│  │  │      page.tsx                # 회원가입 ✅
│  │  │
│  │  └─verify-email
│  │          page.tsx               # 이메일 인증
│  │
│  ├─(dashboard)                     # 대시보드 (보호된 영역)
│  │  │  layout.tsx                  # 대시보드 레이아웃 (사이드바)
│  │  │
│  │  ├─dashboard
│  │  │      page.tsx                # 대시보드 홈 ✅
│  │  │
│  │  ├─history
│  │  │      page.tsx                # 요약 기록 (Pro 전용) ✅
│  │  │
│  │  ├─settings
│  │  │      page.tsx                # 설정 페이지 ✅ (알림 탭 제거)
│  │  │
│  │  └─subscription
│  │          page.tsx               # 구독 관리 ✅
│  │
│  ├─(marketing)                     # 마케팅 페이지 그룹
│  │  │  layout.tsx                  # 마케팅 레이아웃
│  │  │  page.tsx                    # 랜딩 페이지 ✅
│  │  │
│  │  ├─about                        # About 페이지 (예정)
│  │  │
│  │  ├─pricing
│  │  │      page.tsx                # 요금제 페이지
│  │  │
│  │  ├─privacy
│  │  │      page.tsx                # 개인정보처리방침
│  │  │
│  │  └─terms
│  │          page.tsx               # 이용약관
│  │
│  ├─api                             # API Routes
│  │  ├─auth
│  │  │  └─session
│  │  │          route.ts            # 세션 관리
│  │  │
│  │  ├─subscription
│  │  │  ├─cancel
│  │  │  │      route.ts             # 구독 취소 ✅
│  │  │  │
│  │  │  ├─create
│  │  │  │      route.ts             # 구독 생성
│  │  │  │
│  │  │  ├─resume
│  │  │  │      route.ts             # 구독 재개 ✅
│  │  │  │
│  │  │  ├─status
│  │  │  │      route.ts             # 구독 상태 조회
│  │  │  │
│  │  │  ├─sync
│  │  │  │      route.ts             # 구독 동기화
│  │  │  │
│  │  │  └─update-payment
│  │  │          route.ts            # 결제수단 변경 ✅
│  │  │
│  │  ├─test-admin
│  │  │      route.ts                # Firebase Admin 테스트
│  │  │
│  │  ├─test-paddle
│  │  │      route.ts                # Paddle 설정 테스트
│  │  │
│  │  ├─test-queries
│  │  │      route.ts                # Firestore 쿼리 테스트
│  │  │
│  │  └─webhooks
│  │      └─paddle
│  │              route.ts           # Paddle 웹훅 ✅
│  │
│  ├─test-firebase
│  │      page.tsx                   # Firebase 연결 테스트
│  │
│  └─test-language
│          page.tsx                  # 다국어 테스트
│
├─components
│  │  Header.tsx                     # 공통 헤더
│  │  LanguageSwitcher.tsx           # 언어 전환 버튼
│  │  LogoutButton.tsx               # 로그아웃 버튼
│  │  UserProfile.tsx                # 사용자 프로필
│  │
│  ├─analytics                       # 분석 컴포넌트 ✅
│  │      GoogleAnalytics.tsx       # Google Analytics 4
│  │
│  ├─dashboard                       # 대시보드 컴포넌트
│  │      DomainFilter.tsx           # 도메인 필터
│  │      EmailVerificationModal.tsx # 이메일 인증 모달
│  │      EmptyState.tsx             # 빈 상태 UI ✅
│  │      HistoryModal.tsx           # 요약 상세 모달
│  │      HistoryTable.tsx           # 요약 기록 테이블
│  │      MobileHeader.tsx           # 모바일 헤더
│  │      OnboardingGuide.tsx        # 온보딩 가이드 ✅
│  │      ProfileSettings.tsx        # 프로필 설정 ✅ (사진 제거, 언어 추가)
│  │      RecentHistory.tsx          # 최근 기록 (Pro 전용) ✅
│  │      SearchBar.tsx              # 검색 바
│  │      SecuritySettings.tsx       # 보안 설정 ✅ (이메일 변경 제거)
│  │      Sidebar.tsx                # 사이드바
│  │      StatsCard.tsx              # 통계 카드
│  │      StatsOverview.tsx          # 통계 개요
│  │      UsageChart.tsx             # 사용량 차트
│  │
│  ├─marketing                       # 마케팅 컴포넌트
│  │      FAQ.tsx                    # FAQ 섹션
│  │      Features.tsx               # 기능 소개
│  │      FinalCTA.tsx               # 최종 CTA
│  │      Footer.tsx                 # 푸터
│  │      Header.tsx                 # 마케팅 헤더
│  │      Hero.tsx                   # 히어로 섹션
│  │      HowItWorks.tsx             # 사용 방법
│  │      Pricing.tsx                # 요금제 카드
│  │      ProblemStatement.tsx       # 문제 제기
│  │      ScrollReveal.tsx           # 스크롤 애니메이션
│  │      UseCases.tsx               # 사용 사례
│  │
│  ├─payment                         # 결제 컴포넌트
│  │      PaddleCheckout.tsx         # Paddle 체크아웃 ✅
│  │      SubscriptionInfo.tsx       # 구독 정보 표시
│  │
│  ├─providers
│  │      PaddleProvider.tsx         # Paddle 프로바이더 ✅
│  │
│  ├─seo                             # SEO 컴포넌트
│  │      DynamicMeta.tsx            # 동적 메타 태그
│  │      JsonLd.tsx                 # JSON-LD 구조화 데이터
│  │
│  └─ui                              # 공통 UI 컴포넌트 (shadcn/ui)
│          button.tsx
│          card.tsx
│          dialog.tsx
│          dropdown-menu.tsx
│          input.tsx
│          label.tsx
│          select.tsx
│          tabs.tsx
│          textarea.tsx
│          toast.tsx
│
├─contexts                           # React Context
│      AuthContext.tsx               # 인증 컨텍스트 ✅
│      LanguageContext.tsx           # 언어 컨텍스트 ✅
│
├─hooks                              # 커스텀 훅
│      useAuth.ts                    # 인증 훅 ✅
│      useHistory.ts                 # history 조회 훅 ✅
│      useSubscription.ts            # 구독 관리 훅 ✅
│      useTranslation.ts             # 다국어 훅 ✅
│      useUsageStats.ts              # daily 통계 조회 훅 ✅
│
├─lib                                # 유틸리티 라이브러리
│  │  api-client.ts                  # API 클라이언트
│  │  auth-errors.ts                 # 인증 에러 처리 ✅ (20+ 에러 코드)
│  │  auth.ts                        # 인증 유틸리티
│  │  image-loader.ts                # 이미지 로더
│  │  language.ts                    # 언어 유틸리티
│  │  metadata.ts                    # 메타데이터 헬퍼
│  │  paddle-server.ts               # Paddle 서버 API ✅
│  │  paddle-webhook.ts              # Paddle 웹훅 처리 ✅
│  │  paddle.ts                      # Paddle 클라이언트 ✅
│  │  toast-helpers.ts               # 토스트 헬퍼
│  │  utils.ts                       # 공통 유틸리티
│  │
│  └─firebase                        # Firebase 관련
│          admin-utils.ts            # Admin 유틸리티
│          admin.ts                  # Firebase Admin SDK
│          client-queries.ts         # Firestore 쿼리 헬퍼 ✅
│          client.ts                 # Firebase 클라이언트 ✅
│          queries.ts                # 서버 쿼리
│          storage.ts                # Storage 유틸리티
│          types.ts                  # Firebase 타입 정의 ✅
│          utils.ts                  # Firebase 유틸리티
│
├─messages                           # 다국어 파일
│      en.json                       # 영어 ✅ (에러 메시지 추가)
│      ko.json                       # 한국어 ✅ (에러 메시지 추가)
│
├─public                             # 정적 파일
│  │  file.svg
│  │  globe.svg
│  │  manifest.json                  # PWA 매니페스트
│  │  next.svg
│  │  og-image.png                   # Open Graph 이미지 (1200x630) ✅
│  │  vercel.svg
│  │  window.svg
│  │
│  └─images
│          logo.png                  # 로고 이미지
│
└─types                              # TypeScript 타입
        index.ts                     # 공통 타입 정의
        paddle.ts                    # Paddle 타입 정의

📁 특수 문서:
├── ICONS_NEEDED.md                  # SEO/PWA 아이콘 가이드 📖
└── 수정가이드.md                     # 설정 페이지 변경 가이드

✅ = 구현 완료
```

---

## 🚀 시작하기

### 1. 저장소 클론

```bash
git clone https://github.com/your-username/Gena_page.git
cd Gena_page
```

### 2. 의존성 설치

```bash
npm install
# 또는
yarn install
# 또는
pnpm install
```

### 3. 환경 변수 설정

`.env.example`을 복사하여 `.env.local` 생성:

```bash
cp .env.example .env.local
```

`.env.local` 파일 내용:

```env
# ============================================
# Firebase Client Configuration (공개 가능)
# ============================================
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# ============================================
# Firebase Admin SDK (비공개 - 서버 전용)
# ============================================
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk@your_project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# ============================================
# Paddle Billing Configuration
# ============================================
# Environment: sandbox (테스트) or production (실제 운영)
NEXT_PUBLIC_PADDLE_ENVIRONMENT=sandbox

# Client Token (Paddle Dashboard → Developer Tools → Authentication)
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=test_xxxxxxxxxxxxx

# API Key (서버에서만 사용)
PADDLE_API_KEY=pdl_sdbx_apikey_xxxxxxxxxxxxx

# Webhook Secret
PADDLE_WEBHOOK_SECRET=pdl_ntfset_xxxxxxxxxxxxx

# Price IDs (Paddle Dashboard → Catalog → Prices)
NEXT_PUBLIC_PADDLE_PRICE_PRO_MONTHLY=pri_xxxxxxxxxxxxx

# ============================================
# App Configuration
# ============================================
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ============================================
# Session Cookie Settings
# ============================================
SESSION_COOKIE_NAME=__session
SESSION_MAX_AGE=604800

# ============================================
# Cron Job Authentication
# ============================================
CRON_SECRET=your_random_secret_string_here

# ============================================
# Google Analytics 4 (선택사항)
# ============================================
# 웹사이트 방문자 추적을 위해 활성화
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# ============================================
# Development Settings
# ============================================
NODE_ENV=development
```

### 4. 개발 서버 실행

```bash
npm run dev
# 또는
yarn dev
# 또는
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

---

## 🔥 Firebase 설정

### Firestore 데이터 구조

```
firestore/
├── users/{visitorId}                  # 사용자 최상위 문서
│   ├── visitorId: string
│   ├── email: string
│   ├── name: string
│   ├── photoURL?: string
│   ├── isPremium: boolean
│   ├── subscriptionPlan: string       # free | pro
│   ├── emailVerified: boolean
│   ├── createdAt: Timestamp
│   └── updatedAt: Timestamp
│
├── users/{visitorId}/history/{historyId}  # 요약 기록 (서브컬렉션) ✅
│   ├── visitorId: string
│   ├── title: string
│   ├── url?: string
│   ├── content?: string
│   ├── summary?: string
│   ├── createdAt: Timestamp
│   ├── deletedAt?: Timestamp
│   └── metadata?: { domain?, tags? }
│
├── users/{visitorId}/daily/{dailyId}  # 일별 통계 (서브컬렉션) ✅
│   ├── visitorId: string
│   ├── date: string                   # YYYY-MM-DD
│   ├── count: number
│   ├── isPremium: boolean
│   └── createdAt: Timestamp
│
├── subscription/{visitorId}           # 구독 정보 (최상위) ✅
│   ├── orderId: string
│   ├── visitorId: string
│   ├── plan: string                   # free | pro
│   ├── status: string                 # active | canceled | past_due | paused
│   ├── price: number
│   ├── currency: string
│   ├── currentPeriodEnd: Timestamp
│   ├── cancelAtPeriodEnd: boolean
│   ├── createdAt: Timestamp
│   └── updatedAt: Timestamp
│
└── webhook_events/{eventId}           # 웹훅 이벤트 (중복 방지) ✅
    ├── eventId: string
    ├── eventType: string
    ├── processedAt: Timestamp
    └── expiresAt: Timestamp
```

### Firestore 보안 규칙

Firebase Console에서 다음 보안 규칙을 설정하세요:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(visitorId) {
      return isAuthenticated() && request.auth.uid == visitorId;
    }
    
    // users 컬렉션
    match /users/{visitorId} {
      allow read: if isOwner(visitorId);
      allow create: if isOwner(visitorId);
      allow update: if isOwner(visitorId);
      allow delete: if isOwner(visitorId);
      
      // history 서브컬렉션
      match /history/{historyId} {
        allow read: if isOwner(visitorId);
        allow write: if isOwner(visitorId);
      }
      
      // daily 서브컬렉션
      match /daily/{dailyId} {
        allow read: if isOwner(visitorId);
        allow write: if isOwner(visitorId);
      }
    }
    
    // subscription 컬렉션 (최상위)
    match /subscription/{visitorId} {
      allow read: if isAuthenticated() && 
                    resource.data.visitorId == request.auth.uid;
      allow write: if false; // 서버에서만 수정 가능
    }
    
    // webhook_events (서버 전용)
    match /webhook_events/{eventId} {
      allow read, write: if false;
    }
  }
}
```

---

## 💳 Paddle 결제 설정

### Paddle 환경

| 환경 | 용도 | API URL | 토큰 접두사 |
|------|------|---------|------------|
| Sandbox | 개발/테스트 | sandbox-api.paddle.com | `test_` |
| Production | 실제 운영 | api.paddle.com | `live_` |

### Paddle Dashboard 설정

1. **Developer Tools → Authentication**
   - Client Token 생성 → `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`
   - API Key 생성 → `PADDLE_API_KEY`

2. **Notifications → Webhooks**
   - Webhook URL: `https://your-domain.com/api/webhooks/paddle`
   - Secret Key 복사 → `PADDLE_WEBHOOK_SECRET`

3. **Catalog → Products**
   - Pro 플랜 상품 생성

4. **Catalog → Prices**
   - 월간 구독 가격 생성 → `NEXT_PUBLIC_PADDLE_PRICE_PRO_MONTHLY`

### Paddle 테스트 API

Paddle 설정을 검증하려면:

```bash
curl http://localhost:3000/api/test-paddle
```

응답 예시:
```json
{
  "success": true,
  "message": "Paddle 설정이 올바릅니다!",
  "checkList": {
    "priceExists": true,
    "priceActive": true,
    "productActive": true,
    "correctEnvironment": true
  }
}
```

### Paddle 초기화 흐름

```
1. PaddleProvider 로드
   └─ Script 태그로 paddle.js 로드
   
2. Paddle.Environment.set('sandbox')
   └─ Sandbox 환경 설정 (Setup 전에 필수!)
   
3. Paddle.Setup({ token: '...' })
   └─ 클라이언트 토큰으로 초기화
   
4. PaddleCheckout 버튼 클릭
   └─ Paddle.Checkout.open() 호출
```

---

## 🔐 인증 에러 처리

### 개요

Firebase Authentication v10+에서는 보안상의 이유로 일부 에러 코드가 통합되었습니다. 이 프로젝트에서는 20개 이상의 Firebase Auth 에러 코드를 사용자 친화적인 메시지로 변환합니다.

### 지원하는 에러 코드

#### 로그인 관련 에러

| 에러 코드 | 한국어 메시지 | 영어 메시지 |
|-----------|---------------|-------------|
| `auth/invalid-credential` | 이메일 또는 비밀번호가 올바르지 않습니다. | Invalid email or password. Please check and try again. |
| `auth/wrong-password` | 비밀번호가 올바르지 않습니다. | Incorrect password. Please try again. |
| `auth/user-not-found` | 존재하지 않는 계정입니다. | No account found with this email. |
| `auth/user-disabled` | 비활성화된 계정입니다. | This account has been disabled. |
| `auth/too-many-requests` | 로그인 시도가 너무 많습니다. | Too many login attempts. Please try again later. |

#### 이메일 관련 에러

| 에러 코드 | 한국어 메시지 | 영어 메시지 |
|-----------|---------------|-------------|
| `auth/invalid-email` | 유효하지 않은 이메일 형식입니다. | Please enter a valid email address. |
| `auth/email-already-in-use` | 이미 사용 중인 이메일입니다. | This email is already registered. |
| `auth/account-exists-with-different-credential` | 이 이메일은 다른 로그인 방법으로 가입되어 있습니다. | An account already exists with this email using a different sign-in method. |

#### 비밀번호 관련 에러

| 에러 코드 | 한국어 메시지 | 영어 메시지 |
|-----------|---------------|-------------|
| `auth/weak-password` | 비밀번호는 최소 6자 이상이어야 합니다. | Password must be at least 6 characters. |
| `auth/requires-recent-login` | 보안을 위해 다시 로그인해주세요. | Please sign in again for security verification. |

#### 소셜 로그인 관련 에러

| 에러 코드 | 한국어 메시지 | 영어 메시지 |
|-----------|---------------|-------------|
| `auth/popup-closed-by-user` | 로그인 창이 닫혔습니다. | Login popup was closed. |
| `auth/popup-blocked` | 팝업이 차단되었습니다. | Popup was blocked. Please allow popups. |
| `auth/cancelled-popup-request` | 이전 로그인 요청이 취소되었습니다. | Previous login request was cancelled. |

#### 네트워크 에러

| 에러 코드 | 한국어 메시지 | 영어 메시지 |
|-----------|---------------|-------------|
| `auth/network-request-failed` | 네트워크 연결을 확인해주세요. | Network error. Please check your connection. |
| `auth/timeout` | 서버 응답 시간이 초과되었습니다. | Server response timed out. |

### 사용 방법

```typescript
// lib/auth-errors.ts
import { getAuthErrorKey, getAuthErrorType, translateAuthError } from '@/lib/auth-errors';
import { useTranslation } from '@/hooks/useTranslation';

const { t } = useTranslation();

try {
  await signInWithEmail(email, password);
} catch (error: any) {
  // 방법 1: 에러 키를 가져와서 번역
  const errorKey = getAuthErrorKey(error);
  const message = t(errorKey);
  
  // 방법 2: 한 번에 번역
  const message = translateAuthError(error, t);
  
  // 방법 3: 에러 타입으로 UI 분기
  const errorType = getAuthErrorType(error);
  // errorType: 'credential' | 'email' | 'password' | 'network' | 'popup' | 'permission' | 'unknown'
  
  setError(message);
}
```

### 에러 UI 컴포넌트

로그인 페이지에서는 에러 타입에 따라 다른 스타일과 아이콘을 표시합니다:

| 에러 타입 | 색상 | 아이콘 |
|-----------|------|--------|
| `credential` | 빨간색 | 🔒 자물쇠 |
| `email` | 주황색 | ✉️ 이메일 |
| `network` | 노란색 | 📶 와이파이 |
| `popup` | 파란색 | 🔗 팝업 |
| `unknown` | 빨간색 | ⚠️ 경고 |

### 파일 구조

```
lib/
└── auth-errors.ts        # 에러 코드 매핑 및 헬퍼 함수

messages/
├── ko.json               # 한국어 에러 메시지 (auth.errors.*)
└── en.json               # 영어 에러 메시지 (auth.errors.*)

app/(auth)/login/
└── page.tsx              # 에러 UI 적용된 로그인 페이지
```

---

## ✅ 구현된 기능

### 인증 (Authentication)
- ✅ 이메일/비밀번호 회원가입 및 로그인
- ✅ Google 소셜 로그인
- ✅ 비밀번호 재설정
- ✅ 이메일 인증
- ✅ 자동 로그인 (세션 유지)
- ✅ 사용자 프로필 자동 생성
- ✅ **로그인 에러 처리 개선** (20+ 에러 코드 지원)
- ✅ **에러 타입별 UI 차별화** (색상, 아이콘)
- ✅ **다국어 에러 메시지** (한국어/영어)

### 대시보드
- ✅ 실시간 사용량 통계
- ✅ 사용량 차트 (recharts)
- ✅ 최근 요약 5개 표시 (Pro 전용)
- ✅ 빈 상태 UI
- ✅ 온보딩 가이드
- ✅ Pro 업그레이드 배너

### 요약 기록 관리 (Pro 전용)
- ✅ 무한 스크롤
- ✅ 검색 기능
- ✅ 도메인 필터링
- ✅ 소프트 삭제
- ✅ 상세 모달

### 구독 관리 (Paddle)
- ✅ Paddle Provider 설정
- ✅ Sandbox/Production 환경 분리
- ✅ Pro 플랜 구독 (체크아웃)
- ✅ 구독 취소 (기간 종료 시)
- ✅ 구독 재개 (취소 예정 철회)
- ✅ 결제 수단 변경
- ✅ Webhook 이벤트 처리
- ✅ 구독 상태 동기화

### 다국어 (i18n)
- ✅ 한국어 (기본)
- ✅ 영어
- ✅ useTranslation 훅
- ✅ **인증 에러 메시지 다국어 지원**
- ✅ **설정 페이지 언어 전환 UI** ⭐

---

## ⚙️ 설정 페이지 변경사항

### 개요

대시보드 설정 페이지를 단순화하고 핵심 기능에 집중하도록 개선했습니다.

### ❌ 제거된 기능

| 기능 | 위치 | 제거 이유 |
|------|------|----------|
| **프로필 사진 업로드** | ProfileSettings.tsx | 복잡도 감소, 유지보수 부담 경감 |
| **이메일 변경** | ProfileSettings.tsx<br>SecuritySettings.tsx | 보안 이슈, Firebase 제한사항 |
| **알림 설정 탭** | settings/page.tsx | 미사용 기능 |

### ✅ 유지된 기능

| 기능 | 위치 | 설명 |
|------|------|------|
| **이름 변경** | ProfileSettings.tsx | displayName 업데이트 |
| **이메일 표시** | ProfileSettings.tsx | 읽기 전용 표시 |
| **이메일 인증 상태** | ProfileSettings.tsx | ✓ 인증됨 / ⚠ 미인증 |
| **비밀번호 변경** | SecuritySettings.tsx | 현재/새/확인 비밀번호 |
| **통계** | StatsOverview.tsx | 사용량 통계 |

### ✨ 새로 추가된 기능

#### 언어 설정 (ProfileSettings.tsx)

```
🌐 언어 설정
   사용할 언어를 선택하세요

   ┌──────────────┐  ┌──────────────┐
   │  🇰🇷 한국어   │  │  🇺🇸 English  │
   │     ●        │  │              │ ← 선택된 언어는 파란색
   └──────────────┘  └──────────────┘

   💡 언어 변경은 즉시 적용되며, 모든 페이지에 반영됩니다.
```

**특징:**
- 한국어/English 2개 언어 지원
- 클릭 시 즉시 언어 전환 (페이지 새로고침 불필요)
- localStorage에 저장되어 재접속 시에도 유지
- 전체 애플리케이션에 자동 반영
- 시각적 피드백 (선택된 언어는 파란색 배경 + 점 표시)

### 최종 설정 페이지 구조

```
┌───────────────────────────────────────┐
│          ⚙️ 설정                       │
│   프로필, 보안 및 통계를 관리하세요      │
├───────────────────────────────────────┤
│                                       │
│  [👤 프로필]  [🛡️ 보안]  [📊 통계]     │
│                                       │
└───────────────────────────────────────┘

프로필 탭:
  - 이름 변경
  - 이메일 표시 (읽기 전용)
  - 이메일 인증 상태
  - 언어 설정 (한국어/English) ⭐

보안 탭:
  - 비밀번호 변경
  - 보안 팁

통계 탭:
  - 사용량 통계
  - 차트 및 분석
```

### 코드 통계

| 파일 | 이전 라인 수 | 이후 라인 수 | 차이 |
|------|-------------|-------------|------|
| settings/page.tsx | ~130 | ~117 | -13 |
| ProfileSettings.tsx | ~380 | ~220 | -160 |
| SecuritySettings.tsx | ~340 | ~190 | -150 |
| **합계** | **~850** | **~527** | **-323 (-38%)** |

### 적용 방법

수정된 파일들:
1. `app/(dashboard)/settings/page.tsx` - 알림 탭 제거
2. `components/dashboard/ProfileSettings.tsx` - 사진 제거, 언어 추가
3. `components/dashboard/SecuritySettings.tsx` - 이메일 변경 제거

상세한 변경 내용은 프로젝트의 `수정가이드.md` 파일을 참조하세요.

---

## 🐛 해결된 주요 이슈

### 1. Paddle 'environment' 옵션 에러 ✅

**문제:**
```
[PADDLE] Unknown option parameter 'environment'
```

**원인:**
- Paddle.js v2에서는 `Setup()` 옵션에 `environment`를 직접 전달할 수 없음

**해결:**
```typescript
// ❌ 잘못된 방식
Paddle.Setup({ token: '...', environment: 'sandbox' });

// ✅ 올바른 방식
Paddle.Environment.set('sandbox');  // Setup 전에 호출
Paddle.Setup({ token: '...' });
```

---

### 2. Paddle 체크아웃 403 에러 ✅

**문제:**
```
checkout-service.paddle.com/transaction-checkout: 403
```

**원인:**
- Paddle Dashboard에서 도메인 승인 미설정
- Default payment link가 잘못된 URL로 설정됨

**해결:**
1. Paddle Dashboard → Checkout → Checkout Settings
2. Default payment link 필드를 비우거나 올바른 URL로 변경
3. Sandbox 모드에서는 도메인 승인이 필수가 아님

---

### 3. 구독 재개 'subscription_must_be_paused' 에러 ✅

**문제:**
```
Paddle API Error: subscription_must_be_paused
```

**원인:**
- `resume` API는 `paused` 상태에서만 작동
- "취소 예정" 상태는 `scheduled_change`를 제거해야 함

**해결:**
```typescript
// paused 상태
await resumePaddleSubscription(subscriptionId);

// 취소 예정 상태 (cancelAtPeriodEnd = true)
await cancelScheduledChange(subscriptionId);  // PATCH 요청
```

---

### 4. 결제 수단 변경 'method_not_allowed' 에러 ✅

**문제:**
```
Paddle API Error: 405 Method Not Allowed
```

**원인:**
- `update-payment-method-transaction` 엔드포인트는 GET 요청 필요

**해결:**
```typescript
// ❌ 잘못된 방식
fetch('/subscriptions/{id}/update-payment-method-transaction', {
  method: 'POST'  
});

// ✅ 올바른 방식
fetch('/subscriptions/{id}/update-payment-method-transaction', {
  method: 'GET'
});
```

---

### 5. Firebase 권한 오류 ✅

**문제:**
```
FirebaseError: Missing or insufficient permissions
```

**해결:**
- `ensureUserProfile()` 함수로 사용자 문서 자동 생성
- Firestore 규칙에서 `id` 필드를 선택사항으로 변경

---

### 6. TypeScript Window.Paddle 타입 충돌 ✅

**문제:**
```
후속 속성 선언에 같은 형식이 있어야 합니다.
```

**해결:**
```typescript
// ❌ declare global 사용하지 않음

// ✅ 타입 단언 사용
const paddle = (window as any).Paddle as Paddle | undefined;
```

---

### 7. Firebase Auth v10+ 로그인 에러 처리 ✅

**문제:**
```
Firebase v10+에서 auth/wrong-password, auth/user-not-found 에러가 
auth/invalid-credential로 통합되어 기존 에러 처리 로직이 작동하지 않음
```

**원인:**
- Firebase v10부터 보안상의 이유로 이메일/비밀번호 관련 에러를 구분하지 않음
- 기존 에러 코드 매핑에 새로운 코드가 누락됨

**해결:**
```typescript
// lib/auth-errors.ts에 새로운 에러 코드 추가
const errorKeyMap: Record<string, string> = {
  // ✅ Firebase v10+ 통합 에러
  'auth/invalid-credential': 'auth.errors.invalidCredential',
  'auth/invalid-login-credentials': 'auth.errors.invalidCredential',
  
  // 기존 에러 (하위 호환성)
  'auth/wrong-password': 'auth.errors.wrongPassword',
  'auth/user-not-found': 'auth.errors.userNotFound',
  
  // 추가 에러 코드 20개+
  'auth/user-disabled': 'auth.errors.userDisabled',
  'auth/popup-blocked': 'auth.errors.popupBlocked',
  // ...
};
```

**개선된 UI:**
- 에러 타입별 색상 구분 (credential=빨강, email=주황, network=노랑)
- 에러 타입별 아이콘 표시
- 에러 닫기 버튼 추가
- 입력 필드 하이라이트 (에러 시 테두리 색상 변경)
- 비밀번호 에러 시 "비밀번호 찾기" 링크 자동 표시

---

## 📚 개발 가이드

### Paddle API 사용법

```typescript
// 1. 체크아웃 열기 (클라이언트)
import { getPaddleInstance, PADDLE_PRICES } from '@/lib/paddle';

const paddle = getPaddleInstance();
paddle?.Checkout.open({
  items: [{ priceId: PADDLE_PRICES.pro_monthly, quantity: 1 }],
  customData: { visitorId: 'xxx' },
});

// 2. 구독 취소 (서버)
import { cancelPaddleSubscription } from '@/lib/paddle-server';
await cancelPaddleSubscription(subscriptionId, {
  effective_from: 'next_billing_period'
});

// 3. 취소 예정 철회 (서버)
import { cancelScheduledChange } from '@/lib/paddle-server';
await cancelScheduledChange(subscriptionId);

// 4. 결제 수단 변경 URL 생성 (서버)
import { getUpdatePaymentMethodUrl } from '@/lib/paddle-server';
const url = await getUpdatePaymentMethodUrl({ subscriptionId });
```

### 구독 상태 관리

```typescript
import { useSubscription } from '@/hooks/useSubscription';

function Component() {
  const {
    subscription,
    isPro,           // Pro 플랜 여부
    isActive,        // 활성 상태
    isPastDue,       // 결제 연체
    cancelScheduled, // 취소 예정
    daysUntilRenewal // 갱신까지 남은 일수
  } = useSubscription();
  
  if (isPro && isActive) {
    // Pro 기능 표시
  }
}
```

### 인증 에러 처리

```typescript
import { getAuthErrorKey, getAuthErrorType } from '@/lib/auth-errors';
import { useTranslation } from '@/hooks/useTranslation';

function LoginForm() {
  const { t } = useTranslation();
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState<AuthErrorType>('unknown');

  const handleLogin = async () => {
    try {
      await signInWithEmail(email, password);
    } catch (err: any) {
      const errorKey = getAuthErrorKey(err);
      const type = getAuthErrorType(err);
      
      setError(t(errorKey));      // 번역된 에러 메시지
      setErrorType(type);          // UI 스타일링용 타입
    }
  };

  return (
    <div className={getErrorStyles(errorType)}>
      <ErrorIcon type={errorType} />
      <p>{error}</p>
    </div>
  );
}
```

### 언어 전환

```typescript
import { useTranslation } from '@/hooks/useTranslation';

function LanguageSelector() {
  const { locale, setLocale } = useTranslation();

  const handleLanguageChange = (newLocale: 'ko' | 'en') => {
    setLocale(newLocale);
    // localStorage에 자동 저장
    // 전체 앱에 즉시 반영
  };

  return (
    <div>
      <button onClick={() => handleLanguageChange('ko')}>
        🇰🇷 한국어
      </button>
      <button onClick={() => handleLanguageChange('en')}>
        🇺🇸 English
      </button>
    </div>
  );
}
```

### 테스트 API 엔드포인트

| 엔드포인트 | 용도 |
|-----------|------|
| `/api/test-paddle` | Paddle 설정 검증 |
| `/api/test-admin` | Firebase Admin SDK 테스트 |
| `/api/test-queries` | Firestore 쿼리 테스트 |

---

## 🚀 배포

### Vercel 배포

1. **Vercel 프로젝트 생성**
   ```bash
   npx vercel
   ```

2. **환경 변수 설정**
   - Vercel Dashboard → Settings → Environment Variables
   - `.env.local`의 모든 변수 추가
   - `NEXT_PUBLIC_PADDLE_ENVIRONMENT`를 `production`으로 변경

3. **Paddle Production 설정**
   - Paddle Dashboard에서 Live 환경으로 전환
   - Live 토큰/API Key로 환경 변수 업데이트
   - Webhook URL을 프로덕션 도메인으로 변경

4. **빌드 & 배포**
   ```bash
   npx vercel --prod
   ```

### 배포 전 체크리스트

- [x] 환경 변수 설정 완료
- [ ] Firebase 보안 규칙 배포
- [ ] Firestore 인덱스 생성
- [x] Paddle Sandbox 환경 설정 (테스트)
- [ ] Paddle Production 환경 설정 (운영)
- [ ] Paddle Webhook URL 업데이트
- [ ] 프로덕션 도메인 허용 설정
- [x] SEO 메타태그 확인
- [x] **OG 이미지 생성** (1200x630px) ✅
- [ ] PWA 아이콘 생성 (192x192, 512x512)
- [ ] Apple Touch Icon (180x180)
- [x] **Google Analytics 4 설정** ✅
- [ ] 에러 모니터링 설정 (Sentry 등)

---

## 🎨 SEO & PWA 아이콘 설정

### 필수 아이콘 파일

이 프로젝트는 SEO 최적화 및 PWA 기능을 위해 다음 아이콘 파일이 필요합니다:

| 파일 | 크기 | 용도 | 우선순위 | 상태 |
|------|------|------|---------|------|
| `favicon.ico` | 32x32 | 브라우저 탭 | 🔴 Critical | ⏳ Pending |
| `og-image.png` | 1200x630 | 소셜 미디어 미리보기 | 🔴 Critical | ✅ **완료** |
| `icon-192x192.png` | 192x192 | PWA 앱 아이콘 | 🟡 High |
| `icon-512x512.png` | 512x512 | PWA 앱 아이콘 (고해상도) | 🟡 High |
| `apple-touch-icon.png` | 180x180 | iOS 홈 화면 | 🟡 High |

자세한 설정 방법 및 아이콘 생성 가이드는 **[ICONS_NEEDED.md](./ICONS_NEEDED.md)** 문서를 참고하세요.

### 빠른 시작

```bash
# PWA 아이콘 생성기 사용 (권장)
# https://realfavicongenerator.net 또는
# https://www.pwabuilder.com/imageGenerator

# 또는 ImageMagick으로 기존 로고에서 생성
cd public
convert images/logo.png -resize 32x32 favicon.ico
convert images/logo.png -resize 192x192 icon-192x192.png
convert images/logo.png -resize 512x512 icon-512x512.png
convert images/logo.png -resize 180x180 apple-touch-icon.png
convert images/logo.png -resize 1200x630 -gravity center -extent 1200x630 og-image.png
```

---

## 📊 프로젝트 현황

### 완료된 기능 (✅)
- [x] Firebase 연동
- [x] 사용자 인증 (Email, Google)
- [x] **로그인 에러 처리 개선** (20+ 에러 코드)
- [x] **에러 타입별 UI 차별화**
- [x] 대시보드 홈
- [x] 사용량 통계
- [x] 요약 기록 조회 (Pro 전용)
- [x] 무한 스크롤
- [x] 검색 및 필터링
- [x] 빈 상태 UI
- [x] 온보딩 가이드
- [x] 다국어 (한/영)
- [x] **설정 페이지 언어 전환 UI** ⭐
- [x] Paddle 결제 연동
- [x] 구독 취소/재개
- [x] 결제 수단 변경
- [x] **설정 페이지 단순화** (사진/이메일 변경 제거)
- [x] **Google Analytics 4 통합** 📊
- [x] **OG 이미지 생성** (소셜 미디어 최적화)
- [x] **Next.js 15.5.9 보안 업데이트** 🔒

### 개발 중 (🚧)
- [ ] 프로필 편집 (고급 기능)
- [ ] 통계 상세 페이지
- [ ] About 페이지

### 계획 중 (📝)
- [ ] 팀 플랜
- [ ] API 제공
- [ ] Chrome 확장 개선
- [ ] 모바일 앱
- [ ] 추가 언어 지원 (일본어, 중국어 등)

---

## 🤝 기여하기

기여를 환영합니다! 다음 절차를 따라주세요:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.

---

## 📞 문의

- Email: oceancode0321@gmail.com
- Website: https://Gena.day
- GitHub: https://github.com/sunes/Gena_page

---

## 🙏 감사의 말

- [Next.js](https://nextjs.org/) - React 프레임워크
- [Firebase](https://firebase.google.com/) - 백엔드 서비스
- [Tailwind CSS](https://tailwindcss.com/) - CSS 프레임워크
- [Shadcn/ui](https://ui.shadcn.com/) - UI 컴포넌트
- [SWR](https://swr.vercel.app/) - 데이터 페칭
- [Paddle](https://paddle.com/) - 결제 플랫폼

---

## 📊 Google Analytics 4 설정

### 개요

웹사이트 방문자 추적 및 분석을 위해 Google Analytics 4를 통합했습니다.

### 설정 방법

#### 1. Google Analytics 계정 생성

1. [Google Analytics](https://analytics.google.com) 접속
2. 속성 생성 및 데이터 스트림 설정
3. **측정 ID** 발급 (G-XXXXXXXXXX)

#### 2. 환경 변수 설정

**로컬 환경 (.env.local)**
```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

**Vercel 환경 변수**
- Vercel Dashboard → Settings → Environment Variables
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` 추가
- Production, Preview, Development 모두 체크

#### 3. 추적 가능한 데이터

- **실시간 사용자**: 현재 접속 중인 사용자 수
- **페이지뷰**: 각 페이지 방문 횟수
- **사용자 수**: 총 방문자 수 (일간, 주간, 월간)
- **세션**: 방문 세션 수
- **이탈률**: 페이지 이탈률
- **유입 경로**: 검색, 직접 입력, 소셜 미디어 등
- **사용자 위치**: 국가, 도시
- **디바이스**: 모바일, 데스크톱, 태블릿
- **브라우저**: Chrome, Safari, Firefox 등

#### 4. 테스트 방법

**로컬 테스트:**
```bash
npm run dev
# 브라우저에서 http://localhost:3000 접속
# F12 → Console → 에러 없으면 정상
```

**실시간 확인:**
1. Google Analytics Dashboard
2. 보고서 → 실시간
3. 자신의 방문이 표시되는지 확인 (1-2분 소요)

### 구현 파일

```
components/analytics/
└── GoogleAnalytics.tsx       # GA4 스크립트 컴포넌트

app/
└── layout.tsx                # GA4 컴포넌트 통합
```

---

**Last Updated:** 2025년 12월 15일
**Version:** 2.2.0
**Status:** 🚀 Active Development

---

## 🎯 코드 품질 개선 (v2.1.0)

### ESLint 에러 전체 수정 완료 ✅

전체 코드베이스에서 발견된 모든 ESLint 에러를 수정하여 프로덕션 빌드가 성공적으로 완료되었습니다.

#### 수정된 에러 통계

| 카테고리 | 파일 수 | 에러 수 | 상태 |
|---------|---------|---------|------|
| **any 타입 제거** | 18개 | 60개 | ✅ 완료 |
| **특수문자 이스케이프** | 3개 | 50개+ | ✅ 완료 |
| **코드 품질** | 전체 | - | ✅ 완료 |

#### 1. 타입 안정성 개선 (60개 에러 수정)

모든 `any` 타입을 제거하고 적절한 TypeScript 타입으로 교체했습니다.

**Lib 파일 (7개 파일, 26개 에러)**
```typescript
// ❌ Before
function handleError(error: any) { ... }
const data: Record<string, any> = { ... };

// ✅ After
function handleError(error: unknown) {
  if (error && typeof error === 'object' && 'code' in error) {
    // 타입 가드로 안전하게 접근
  }
}
const data: Record<string, unknown> = { ... };
```

**수정된 파일:**
- `lib/auth-errors.ts` - 에러 처리 타입 개선
- `lib/auth.ts` - Firebase 인증 에러 타입 개선
- `lib/firebase/queries.ts` - QueryDocumentSnapshot 타입 사용
- `lib/metadata.ts` - Record 타입 개선
- `lib/paddle-server.ts` - crypto require → import 변환
- `lib/paddle-webhook.ts` - Paddle 웹훅 데이터 타입 개선
- `lib/paddle.ts` - Window 타입 확장

**API 라우트 (4개 파일, 16개 에러)**
```typescript
// ✅ Paddle 웹훅 데이터 타입 인터페이스 생성
interface PaddleSubscriptionData {
  id: string;
  status: string;
  customer_id: string;
  // ... 필요한 필드 정의
}

function isPaddleSubscriptionData(data: unknown): data is PaddleSubscriptionData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'status' in data
  );
}

async function handleSubscriptionCreated(data: unknown) {
  if (!isPaddleSubscriptionData(data)) {
    throw new Error('Invalid subscription data');
  }
  // 이제 data는 안전하게 타입이 지정됨
}
```

**수정된 파일:**
- `app/api/subscription/cancel/route.ts`
- `app/api/subscription/sync/route.ts`
- `app/api/test-paddle/route.ts`
- `app/api/webhooks/paddle/route.ts` - 타입 가드 추가

**컴포넌트 (6개 파일, 11개 에러)**
```typescript
// ✅ Recharts 타입 정의
interface ChartDataItem {
  date: string;
  label: string;
  count: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

// ✅ Paddle SDK 타입 정의
interface PaddleSDK {
  Environment?: { set: (env: 'sandbox' | 'production') => void };
  Setup: (options: PaddleSetupOptions) => void;
}
```

**수정된 파일:**
- `components/dashboard/EmailVerificationModal.tsx`
- `components/dashboard/ProfileSettings.tsx`
- `components/dashboard/SecuritySettings.tsx`
- `components/dashboard/UsageChart.tsx` - Recharts 타입 정의
- `components/providers/PaddleProvider.tsx` - Paddle SDK 타입 정의
- `components/seo/JsonLd.tsx`

#### 2. React JSX 특수문자 이스케이프 (50개+ 에러 수정)

법률 문서 및 테스트 페이지의 모든 특수문자를 올바르게 이스케이프했습니다.

```typescript
// ❌ Before
<li>"회원"이란 본 약관에 동의하고...</li>
<li>localStorage에 'Gena_locale' 저장</li>

// ✅ After
<li>&quot;회원&quot;이란 본 약관에 동의하고...</li>
<li>localStorage에 &apos;Gena_locale&apos; 저장</li>
```

**수정된 파일:**
- `app/(marketing)/privacy/page.tsx` - 개인정보처리방침
- `app/(marketing)/terms/page.tsx` - 이용약관
- `app/test-language/page.tsx` - 언어 테스트 페이지

#### 3. 빌드 결과

```bash
✓ Compiled successfully in 4.5s
✓ Linting and checking validity of types
✓ Generating static pages (32/32)

Route (app)                    Size     First Load JS
┌ ○ /                       5.91 kB         252 kB
├ ○ /dashboard              3.72 kB         251 kB
├ ○ /history               11.2 kB         272 kB
├ ○ /login                  3.19 kB         235 kB
└ ... (32개 페이지 성공)

✅ 블로킹 에러: 0개
⚠️  경고: 30개 (빌드에 영향 없음)
```

#### 4. 타입 안정성 향상 효과

**Before:**
- `any` 타입 사용: 60개 위치
- 런타임 타입 에러 가능성: 높음
- IDE 자동완성: 제한적

**After:**
- `any` 타입 사용: 0개
- 런타임 타입 에러 가능성: 낮음 (타입 가드 사용)
- IDE 자동완성: 완전한 타입 추론

#### 5. 주요 타입 패턴

**에러 처리:**
```typescript
// unknown + 타입 가드 패턴
catch (error: unknown) {
  if (error && typeof error === 'object' && 'code' in error) {
    // 안전하게 error.code 접근
  }
}
```

**외부 라이브러리 타입:**
```typescript
// Window 객체 확장
const paddle = (window as Window & { Paddle?: PaddleSDK }).Paddle;

// 제네릭 객체
const data: Record<string, unknown> = { ... };
```

**API 데이터 검증:**
```typescript
// 타입 가드 함수
function isValidData(data: unknown): data is ExpectedType {
  return (
    typeof data === 'object' &&
    data !== null &&
    'requiredField' in data
  );
}
```

---

## 📜 변경 이력

### v2.2.0 (2025-12-15) 📊
- 🔒 **Next.js 15.5.9 보안 업데이트**
  - CVE-2025-55182 (React2Shell) 취약점 수정
  - CVE-2025-55184 (DoS) 취약점 수정
  - CVE-2025-55183 (Source Code Exposure) 취약점 수정
  - 치명적인 보안 취약점 전체 패치 완료
- 📊 **Google Analytics 4 통합**
  - 웹사이트 방문자 추적 및 분석
  - 실시간 통계, 페이지뷰, 유입 경로 추적
  - 로컬 및 Vercel 환경 변수 설정 완료
  - components/analytics/GoogleAnalytics.tsx 생성
- 🖼️ **OG 이미지 생성** (1200x630px)
  - 소셜 미디어 공유 최적화
  - 카카오톡, 페이스북, 트위터 미리보기 지원
  - 보라색 그라데이션 배경 + 로고 + 브랜드 메시지
- 🔧 **환경 변수 개선**
  - CRON_SECRET 강력한 비밀번호로 업데이트
  - GA4 측정 ID 설정 완료
  - Paddle Sandbox 모드 유지 (테스트용)
- ✅ **빌드 테스트 성공**
  - 모든 페이지 정상 빌드 (28개)
  - 타입 체크 통과
  - ESLint 검사 통과

### v2.1.0 (2025-12-14) 🎯
- ✅ **코드 품질 대폭 개선**
  - ESLint 전체 에러 수정 완료 (60개)
  - TypeScript `any` 타입 전면 제거
  - 타입 가드 및 타입 안정성 강화
  - React JSX 특수문자 이스케이프 (50개+)
- 🔧 **타입 시스템 개선**
  - Paddle 웹훅 데이터 타입 인터페이스 정의
  - Recharts 컴포넌트 타입 정의
  - Firebase Firestore 쿼리 타입 개선
- 🚀 **빌드 최적화**
  - 프로덕션 빌드 성공 (32개 페이지)
  - ESLint 빌드 체크 활성화
  - 타입 체크 통과

### v2.0.0 (2025-12-02) ⭐
- ✨ **설정 페이지 대폭 개선**
  - 프로필 사진 업로드 기능 제거 (복잡도 감소)
  - 이메일 변경 기능 제거 (보안 및 유지보수)
  - 알림 탭 제거 (미사용 기능)
  - 고객 지원 안내 문구 제거
- ✨ **언어 설정 기능 추가**
  - 한국어/English 전환 UI
  - 실시간 언어 전환 (새로고침 불필요)
  - localStorage 영구 저장
  - 전체 애플리케이션 자동 반영
- 📉 코드 323줄 감소 (38% 감소)
- 🎨 UI/UX 단순화 및 개선

### v1.2.0 (2025-12-01)
- ✨ **로그인 에러 처리 대폭 개선**
  - Firebase Auth v10+ `auth/invalid-credential` 에러 지원
  - 20개 이상의 에러 코드 매핑 추가
  - 에러 타입별 UI 차별화 (색상, 아이콘)
  - 에러 닫기 버튼 및 입력 필드 하이라이트 추가
- 🌐 다국어 에러 메시지 추가 (한국어/영어)
- 📝 README.md 인증 에러 처리 가이드 추가

### v1.1.0 (2025-11-21)
- ✨ Paddle 결제 연동 완료
- 🔧 구독 취소/재개/결제수단 변경 기능
- 🐛 Paddle 환경 설정 버그 수정

### v1.0.0 (2025-11-01)
- 🎉 프로젝트 초기 릴리즈
- ✅ Firebase 인증 및 Firestore 연동
- ✅ 대시보드 및 요약 기록 관리
- ✅ 다국어 지원 (한/영)