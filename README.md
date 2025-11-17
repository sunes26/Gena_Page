# SummaryGenie Page 🌟

> AI 기반 웹페이지 요약 Chrome 확장 프로그램을 위한 웹 대시보드 및 구독 관리 플랫폼

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-12-orange?logo=firebase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwind-css)
![Paddle](https://img.shields.io/badge/Paddle-Billing-7C3AED)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-production-success)

---

## 📋 목차

- [프로젝트 개요](#-프로젝트-개요)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [프로젝트 구조](#-프로젝트-구조)
- [빠른 시작](#-빠른-시작)
- [환경 변수 설정](#-환경-변수-설정)
- [Firebase 설정 가이드](#-firebase-설정-가이드)
- [Paddle 설정 가이드](#-paddle-설정-가이드)
- [개발 가이드](#-개발-가이드)
- [Firebase 데이터 구조](#-firebase-데이터-구조)
- [API 엔드포인트](#-api-엔드포인트)
- [배포](#-배포)
- [트러블슈팅](#-트러블슈팅)
- [개발 체크리스트](#-개발-체크리스트)
- [기여하기](#-기여하기)
- [라이센스](#-라이센스)

---

## 🎯 프로젝트 개요

**SummaryGenie Page**는 Chrome 확장 프로그램과 연동되는 웹 대시보드로, 사용자의 요약 기록을 관리하고 Pro 구독을 제공하는 SaaS 플랫폼입니다.

### 주요 목표

- ✅ **기존 Firebase 데이터**를 활용한 웹 대시보드 구축
- ✅ 사용자 요약 기록 조회 및 관리 인터페이스 제공
- ✅ **Paddle Billing**을 통한 프리미엄 구독 모델 수익화
- ✅ 사용 통계 및 분석 대시보드 제공
- ✅ 실시간 구독 상태 동기화 및 관리
- ✅ Paddle API 직접 조회를 통한 구독 정보 자동/수동 동기화
- ✅ **완벽한 SEO 최적화** (검색 엔진 노출 극대화)

### 프로젝트 현황

| Phase | 상태 | 기간 | 설명 |
|-------|------|------|------|
| Phase 1 | ✅ 완료 | 3주 | 프로젝트 기반 구축, Firebase 연동 |
| Phase 2 | ✅ 완료 | 2주 | 요약 기록 관리, 검색/필터링 |
| Phase 3 | ✅ 완료 | 2주 | Paddle 결제 시스템 연동 |
| Phase 4 | ✅ 완료 | 1주 | 실시간 구독 동기화, 웹훅 처리 |
| Phase 5 | ✅ 완료 | 1주 | SEO 최적화, 프로필 설정, 성능 개선 |
| Phase 6 | 📅 예정 | - | 고급 기능 (팀 공유, 태그 관리) |

---

## ✨ 주요 기능

### 🔐 인증 시스템
- ✅ 이메일/비밀번호 로그인/회원가입
- ✅ Google 소셜 로그인
- ✅ 이메일 인증
- ✅ 비밀번호 재설정
- ✅ 세션 쿠키 기반 인증 (5일 유효)
- ✅ 보호된 라우트 (Next.js Middleware)

### 📊 대시보드
- ✅ 실시간 사용량 통계
- ✅ 최근 7일 사용 그래프 (Recharts)
- ✅ 이번 달 요약 횟수
- ✅ 최근 요약 기록 5개
- ✅ 가장 활발한 요일 분석
- ✅ 도메인별 통계
- ✅ Pro/Free 플랜 상태 표시

### 📝 요약 기록 관리
- ✅ 무한 스크롤 페이지네이션
- ✅ 제목 + 내용 기반 실시간 검색 (디바운스 500ms)
- ✅ 도메인별 필터링
- ✅ 정렬 (최신순/오래된 순)
- ✅ 상세 내용 모달 뷰
- ✅ 요약문 복사 기능
- ✅ 반응형 디자인 (데스크톱/모바일)
- ✅ 중복 제거 및 최적화된 데이터 로딩

### 💳 구독 관리 (Paddle Billing)
- ✅ Free/Pro 플랜 제공 (₩9,900/월)
- ✅ Paddle Checkout 오버레이 결제
- ✅ 구독 취소 및 재개
- ✅ 결제 수단 변경
- ✅ 구독 상태 실시간 추적
- ✅ Webhook을 통한 자동 동기화
- ✅ **Paddle API 직접 조회를 통한 수동 동기화**
- ✅ 구독 만료일 계산 및 알림
- ✅ 결제 내역 관리
- ✅ **구독 갱신 시 자동 업데이트**

### ⚙️ 설정
- ✅ 프로필 편집 (이름, 프로필 사진)
- ✅ **프로필 사진 업로드** (Firebase Storage, 최대 2MB)
- ✅ **이미지 업로드 진행률 표시**
- ✅ 이메일 변경 (재인증 필요)
- ✅ 비밀번호 변경 (재인증 포함)
- ✅ 알림 설정
- ✅ 사용 통계 확인
- ✅ 계정 보안 설정

### 🔍 SEO 최적화 ⭐ NEW
- ✅ **동적 사이트맵 생성** (sitemap.xml)
- ✅ **robots.txt 자동 생성**
- ✅ **PWA 매니페스트** (앱 설치 가능)
- ✅ **구조화된 데이터** (JSON-LD Schema.org)
  - Organization Schema (회사 정보)
  - WebApplication Schema (앱 정보)
  - Product Schema (Pro 구독)
  - FAQ Schema (자주 묻는 질문)
  - Breadcrumb Schema (네비게이션)
- ✅ **페이지별 최적화된 메타데이터**
  - Open Graph (Facebook, LinkedIn)
  - Twitter Cards
  - Canonical URLs
- ✅ **완전한 요금제 페이지** (Pricing)
- ✅ **시맨틱 HTML** (접근성 개선)

---

## 🛠 기술 스택

### Frontend
- **Next.js 15** (App Router) - React 프레임워크
- **TypeScript 5** - 타입 안정성
- **Tailwind CSS 3** - 유틸리티 기반 스타일링
- **Shadcn/ui** - 고품질 UI 컴포넌트
- **Headless UI** - 접근성 높은 UI 컴포넌트
- **Recharts** - 데이터 시각화
- **React Hot Toast** - 알림 시스템
- **SWR** - 데이터 페칭 및 캐싱
- **React Hook Form** - 폼 관리
- **Lucide React** - 아이콘 라이브러리

### Backend & Database
- **Firebase Authentication** - 사용자 인증
- **Firebase Firestore** - NoSQL 데이터베이스 (서브컬렉션 구조)
- **Firebase Storage** - 파일 저장소
- **Next.js API Routes** - 서버리스 API
- **Firebase Admin SDK** - 서버 사이드 Firebase 작업

### 결제 & 구독
- **Paddle Billing** - 결제 처리 및 구독 관리
- **Paddle Webhooks** - 구독 이벤트 처리
- **Paddle.js v2** - 클라이언트 SDK
- **Paddle REST API** - 서버 사이드 구독 조회 및 관리

### SEO & 성능
- **Next.js Metadata API** - 서버 사이드 메타데이터
- **JSON-LD** - 구조화된 데이터
- **PWA Support** - 앱 설치 가능
- **Dynamic Imports** - 코드 스플리팅
- **Image Optimization** - WebP, AVIF 지원

### 배포 & 호스팅
- **Vercel** - 자동 배포 및 호스팅
- **GitHub Actions** - CI/CD (선택사항)

---

## 📁 프로젝트 구조

```
summarygenie_page/
│
├─ app/                                     # Next.js 15 App Router
│  ├─ (auth)/                              # 인증 관련 페이지 그룹
│  │  ├─ forgot-password/
│  │  │  └─ page.tsx                       # 비밀번호 재설정
│  │  ├─ login/
│  │  │  └─ page.tsx                       # 로그인
│  │  ├─ signup/
│  │  │  └─ page.tsx                       # 회원가입
│  │  ├─ verify-email/
│  │  │  └─ page.tsx                       # 이메일 인증
│  │  └─ layout.tsx                        # 인증 그룹 레이아웃 ⭐
│  │
│  ├─ (dashboard)/                         # 대시보드 (인증 필요)
│  │  ├─ dashboard/
│  │  │  └─ page.tsx                       # 대시보드 홈
│  │  ├─ history/
│  │  │  └─ page.tsx                       # 요약 기록
│  │  ├─ settings/
│  │  │  └─ page.tsx                       # 설정
│  │  ├─ subscription/
│  │  │  └─ page.tsx                       # 구독 관리
│  │  └─ layout.tsx                        # 대시보드 레이아웃
│  │
│  ├─ (marketing)/                         # 마케팅 페이지 그룹
│  │  ├─ about/                            # 소개 페이지 (예정)
│  │  ├─ pricing/
│  │  │  └─ page.tsx                       # 요금제 페이지 ⭐
│  │  ├─ layout.tsx                        # 마케팅 레이아웃
│  │  └─ page.tsx                          # 랜딩 페이지 (SEO 최적화)
│  │
│  ├─ api/                                 # API Routes
│  │  ├─ auth/
│  │  │  └─ session/
│  │  │     └─ route.ts                    # 세션 쿠키 관리
│  │  ├─ subscription/
│  │  │  ├─ cancel/route.ts                # 구독 취소
│  │  │  ├─ create/route.ts                # 구독 생성
│  │  │  ├─ resume/route.ts                # 구독 재개
│  │  │  ├─ status/route.ts                # 구독 상태 조회
│  │  │  ├─ sync/route.ts                  # 구독 수동 동기화 ⭐
│  │  │  └─ update-payment/route.ts        # 결제 수단 변경
│  │  └─ webhooks/
│  │     └─ paddle/route.ts                # Paddle 웹훅
│  │
│  ├─ sitemap.ts                           # 동적 사이트맵 ⭐
│  ├─ robots.ts                            # robots.txt ⭐
│  ├─ manifest.ts                          # PWA 매니페스트 ⭐
│  ├─ favicon.ico
│  ├─ globals.css
│  └─ layout.tsx                           # 루트 레이아웃 (SEO 최적화)
│
├─ components/                              # React 컴포넌트
│  ├─ dashboard/                           # 대시보드 컴포넌트
│  │  ├─ DomainFilter.tsx
│  │  ├─ HistoryModal.tsx
│  │  ├─ HistoryTable.tsx
│  │  ├─ MobileHeader.tsx
│  │  ├─ NotificationSettings.tsx
│  │  ├─ ProfileSettings.tsx               # 프로필 설정 ⭐
│  │  ├─ RecentHistory.tsx
│  │  ├─ SearchBar.tsx
│  │  ├─ SecuritySettings.tsx              # 보안 설정 ⭐
│  │  ├─ Sidebar.tsx
│  │  ├─ StatsCard.tsx
│  │  ├─ StatsOverview.tsx
│  │  └─ UsageChart.tsx
│  │
│  ├─ marketing/                           # 마케팅 컴포넌트
│  │  ├─ FAQ.tsx
│  │  ├─ Features.tsx
│  │  ├─ FinalCTA.tsx
│  │  ├─ Footer.tsx
│  │  ├─ Header.tsx
│  │  ├─ Hero.tsx
│  │  ├─ HowItWorks.tsx
│  │  ├─ Pricing.tsx
│  │  ├─ ProblemStatement.tsx
│  │  ├─ ScrollReveal.tsx
│  │  └─ UseCases.tsx
│  │
│  ├─ payment/                             # 결제 컴포넌트
│  │  ├─ PaddleCheckout.tsx
│  │  └─ SubscriptionInfo.tsx
│  │
│  ├─ providers/
│  │  └─ PaddleProvider.tsx
│  │
│  ├─ seo/                                 # SEO 컴포넌트 ⭐
│  │  ├─ JsonLd.tsx                       # JSON-LD 구조화된 데이터
│  │  └─ DynamicMeta.tsx                  # 동적 메타 태그
│  │
│  ├─ ui/                                  # Shadcn UI 컴포넌트
│  │  ├─ button.tsx
│  │  ├─ card.tsx
│  │  ├─ dialog.tsx
│  │  ├─ dropdown-menu.tsx
│  │  ├─ input.tsx
│  │  ├─ label.tsx
│  │  ├─ select.tsx
│  │  ├─ tabs.tsx
│  │  ├─ textarea.tsx
│  │  └─ toast.tsx
│  │
│  ├─ Header.tsx
│  ├─ LogoutButton.tsx
│  └─ UserProfile.tsx
│
├─ contexts/
│  └─ AuthContext.tsx                      # 인증 컨텍스트
│
├─ hooks/                                   # Custom React Hooks
│  ├─ useAuth.ts
│  ├─ useHistory.ts
│  ├─ useSubscription.ts
│  └─ useUsageStats.ts
│
├─ lib/                                     # 유틸리티 & 설정
│  ├─ firebase/
│  │  ├─ admin-utils.ts
│  │  ├─ admin.ts
│  │  ├─ client-queries.ts
│  │  ├─ client.ts
│  │  ├─ queries.ts
│  │  ├─ storage.ts                        # Firebase Storage ⭐
│  │  ├─ types.ts
│  │  └─ utils.ts
│  │
│  ├─ api-client.ts
│  ├─ auth.ts
│  ├─ metadata.ts                          # 메타데이터 헬퍼 ⭐
│  ├─ paddle-server.ts
│  ├─ paddle-webhook.ts
│  ├─ paddle.ts
│  ├─ toast-helpers.ts
│  └─ utils.ts
│
├─ public/
│  ├─ images/
│  │  └─ logo.png
│  ├─ favicon.ico
│  └─ manifest.json                        # PWA 매니페스트
│
├─ types/
│  ├─ index.ts
│  └─ paddle.ts
│
├─ .env.example                            # 환경 변수 예시
├─ .env.local                              # 환경 변수 (git 제외)
├─ .gitignore
├─ components.json                         # shadcn/ui 설정
├─ eslint.config.mjs
├─ middleware.ts                           # Next.js 미들웨어
├─ next.config.ts
├─ package.json
├─ postcss.config.js
├─ README.md
├─ tailwind.config.js
└─ tsconfig.json
```

---

## 🚀 빠른 시작

### 사전 요구사항

- **Node.js** 20.x 이상
- **npm** 또는 **yarn**
- **Firebase 프로젝트** (기존 프로젝트 연결)
- **Paddle 계정** (Sandbox 또는 Production)

### 1단계: 저장소 클론

```bash
git clone https://github.com/your-username/summarygenie_page.git
cd summarygenie_page
```

### 2단계: 의존성 설치

```bash
npm install
# 또는
yarn install
```

### 3단계: Shadcn/ui 초기화

```bash
npx shadcn-ui@latest init
```

설정 옵션:
- **Style**: Default
- **Base color**: Slate
- **CSS variables**: Yes

필요한 컴포넌트 설치:
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add select
npx shadcn-ui@latest add label
npx shadcn-ui@latest add textarea
```

### 4단계: 환경 변수 설정

`.env.local` 파일을 생성하고 아래 환경 변수를 설정합니다.

```env
# Firebase (클라이언트)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Firebase Admin (서버)
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account-email
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Paddle
NEXT_PUBLIC_PADDLE_ENVIRONMENT=sandbox # 또는 production
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=your-client-token
PADDLE_API_KEY=your-api-key
PADDLE_WEBHOOK_SECRET=your-webhook-secret

# Paddle Price IDs
NEXT_PUBLIC_PADDLE_PRICE_PRO_MONTHLY=pri_xxx

# 앱 설정
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5단계: 개발 서버 실행

```bash
npm run dev
# 또는
yarn dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인합니다.

### 6단계: 빌드 (프로덕션)

```bash
npm run build
npm start
# 또는
yarn build
yarn start
```

---

## 🔐 환경 변수 설정

### `.env.example` 파일

프로젝트 루트에 `.env.example` 파일을 생성하세요:

```env
# ========================================
# Firebase (클라이언트)
# ========================================
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# ========================================
# Firebase Admin (서버)
# ========================================
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# ========================================
# Paddle (결제)
# ========================================
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=
NEXT_PUBLIC_PADDLE_ENVIRONMENT=sandbox
# 프로덕션: production
PADDLE_API_KEY=
PADDLE_WEBHOOK_SECRET=

# Paddle Price IDs
NEXT_PUBLIC_PADDLE_PRICE_PRO_MONTHLY=

# ========================================
# 기타
# ========================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 환경 변수 설명

| 변수명 | 설명 | 필수 | 예시 |
|--------|------|------|------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API 키 | ✅ | `AIzaSyC...` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth 도메인 | ✅ | `my-project.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase 프로젝트 ID | ✅ | `my-project-12345` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage 버킷 | ✅ | `my-project.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | FCM Sender ID | ✅ | `123456789` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase App ID | ✅ | `1:123:web:abc` |
| `FIREBASE_ADMIN_PROJECT_ID` | Admin용 프로젝트 ID | ✅ | `my-project-12345` |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | 서비스 계정 이메일 | ✅ | `firebase-adminsdk-xxx@...` |
| `FIREBASE_ADMIN_PRIVATE_KEY` | 서비스 계정 Private Key | ✅ | `"-----BEGIN...` |
| `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` | Paddle 클라이언트 토큰 | ✅ | `test_xxx` |
| `NEXT_PUBLIC_PADDLE_ENVIRONMENT` | Paddle 환경 | ✅ | `sandbox` 또는 `production` |
| `PADDLE_API_KEY` | Paddle API 키 | ✅ | `xxx` |
| `PADDLE_WEBHOOK_SECRET` | Paddle 웹훅 시크릿 | ✅ | `pdl_xxx` |
| `NEXT_PUBLIC_PADDLE_PRICE_PRO_MONTHLY` | Pro 플랜 Price ID | ✅ | `pri_xxx` |
| `NEXT_PUBLIC_APP_URL` | 앱 기본 URL | ✅ | `https://summarygenie.app` |

---

## 🔥 Firebase 설정 가이드

### 1. Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름 입력: `SummaryGenie`
4. Google Analytics 활성화 (선택사항)
5. 프로젝트 생성

### 2. Firebase Authentication 설정

#### 이메일/비밀번호 인증 활성화

1. Firebase Console > **Authentication** > **Sign-in method**
2. **이메일/비밀번호** 활성화
3. 이메일 링크(비밀번호 없이 로그인) 비활성화

#### Google 소셜 로그인 활성화

1. **Google** 제공업체 활성화
2. 프로젝트 지원 이메일 설정
3. 저장

### 3. Firebase Firestore 설정

#### Firestore 데이터베이스 생성

1. Firebase Console > **Firestore Database** > **데이터베이스 만들기**
2. **테스트 모드에서 시작** 선택
3. 리전 선택: `asia-northeast3 (Seoul)`
4. 완료

#### Firestore 보안 규칙 설정

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // 사용자 문서
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // history 서브컬렉션
      match /history/{historyId} {
        allow read: if request.auth != null && request.auth.uid == userId;
        allow write: if request.auth != null && request.auth.uid == userId;
      }
      
      // daily 서브컬렉션
      match /daily/{dailyId} {
        allow read: if request.auth != null && request.auth.uid == userId;
        allow write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // subscription 컬렉션 (최상위)
    match /subscription/{subId} {
      allow read: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
      allow write: if false; // 서버에서만 쓰기
    }
    
    // webhook_events 컬렉션 (서버 전용)
    match /webhook_events/{eventId} {
      allow read, write: if false;
    }
    
    // webhook_logs 컬렉션 (서버 전용)
    match /webhook_logs/{logId} {
      allow read, write: if false;
    }
  }
}
```

#### Firestore 인덱스 생성

**필수 복합 인덱스:**

1. `users/{userId}/history`:
   ```
   Collection ID: history
   Fields indexed:
     - deletedAt (Ascending)
     - createdAt (Descending)
   Query scope: Collection
   ```

2. `users/{userId}/daily`:
   ```
   Collection ID: daily
   Fields indexed:
     - date (Ascending)
   Query scope: Collection
   ```

3. `subscription`:
   ```
   Collection ID: subscription
   Fields indexed:
     - userId (Ascending)
   Query scope: Collection
   ```

Firebase Console > Firestore > **인덱스** 탭에서 생성하세요.

### 4. Firebase Storage 설정

#### Storage 버킷 생성

1. Firebase Console > **Storage** > **시작하기**
2. 보안 규칙 모드 선택
3. 리전 선택: `asia-northeast3 (Seoul)`

#### Storage 보안 규칙 설정

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // 프로필 사진
    match /users/{userId}/profile/{fileName} {
      allow read: if true; // 공개 읽기
      allow write: if request.auth != null && 
                      request.auth.uid == userId &&
                      request.resource.size < 2 * 1024 * 1024 && // 최대 2MB
                      request.resource.contentType.matches('image/.*');
    }
  }
}
```

#### CORS 설정 (선택사항)

`cors.json` 파일 생성:

```json
[
  {
    "origin": ["https://your-domain.com", "http://localhost:3000"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "maxAgeSeconds": 3600
  }
]
```

CORS 적용:
```bash
gsutil cors set cors.json gs://your-bucket-name.appspot.com
```

### 5. Firebase Admin SDK 설정

#### 서비스 계정 키 생성

1. Firebase Console > **프로젝트 설정** > **서비스 계정**
2. **새 비공개 키 생성** 클릭
3. JSON 파일 다운로드
4. 파일 내용을 `.env.local`에 복사

```env
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"
```

⚠️ **주의**: Private Key는 큰따옴표로 감싸고, `\n`을 그대로 유지해야 합니다.

### 6. Firebase 웹 앱 설정

1. Firebase Console > **프로젝트 설정** > **일반**
2. 앱 섹션에서 **웹** 선택 (</>)
3. 앱 닉네임 입력: `SummaryGenie Web`
4. **Firebase Hosting 설정** 건너뛰기
5. 구성 정보 복사하여 `.env.local`에 붙여넣기

---

## 🎯 Paddle 설정 가이드

### 1. Paddle 계정 생성

1. [Paddle 웹사이트](https://www.paddle.com/) 방문
2. **Start Free** 클릭하여 계정 생성
3. 이메일 인증

### 2. Sandbox 환경 활성화

1. Paddle Dashboard 로그인
2. 우측 상단의 환경 전환 토글 확인
3. **Sandbox** 모드로 전환

### 3. API 키 생성

#### Client Token 생성

1. Paddle Dashboard > **Developer Tools** > **Authentication**
2. **Client-side Tokens** 탭
3. **New Client-side Token** 클릭
4. 이름: `SummaryGenie Web Client`
5. 도메인 제한 설정 (권장):
   - `localhost:3000` (개발)
   - `your-domain.com` (프로덕션)
6. 토큰 복사

```env
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=test_xxxxxxxxxxxxx
```

#### API Key 생성 (서버용)

1. **API Keys** 탭
2. **New API Key** 클릭
3. 이름: `SummaryGenie Server`
4. 권한 선택:
   - ✅ Read subscriptions
   - ✅ Write subscriptions
   - ✅ Read transactions
5. API Key 복사

```env
PADDLE_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4. 상품(Product) 생성

#### Pro 플랜 상품 생성

1. Paddle Dashboard > **Catalog** > **Products**
2. **New Product** 클릭
3. 상품 정보 입력:
   - **Name**: SummaryGenie Pro
   - **Description**: AI 기반 무제한 웹페이지 요약 서비스
   - **Type**: Standard
4. 저장

#### Price 생성

1. 생성한 Product > **Prices** 탭
2. **New Price** 클릭
3. 가격 설정:
   - **Billing Cycle**: Monthly (월간)
   - **Amount**: ₩9,900
   - **Currency**: KRW (한국 원화)
   - **Trial Period**: 없음 (또는 원하는 기간 설정)
4. Price ID 복사

```env
NEXT_PUBLIC_PADDLE_PRICE_PRO_MONTHLY=pri_01xxxxxxxxxxxxxxxxx
```

### 5. Webhook 설정

#### Webhook URL 등록

1. Paddle Dashboard > **Developer Tools** > **Notifications**
2. **New Destination** 클릭
3. Webhook 정보 입력:
   - **URL**: `https://your-domain.com/api/webhooks/paddle`
   - **Description**: SummaryGenie Production Webhook
   - **Active**: 체크

#### 이벤트 선택

다음 이벤트를 **모두 선택**하세요:

- ✅ `subscription.created` - 구독 생성
- ✅ `subscription.updated` - 구독 업데이트
- ✅ `subscription.canceled` - 구독 취소
- ✅ `subscription.past_due` - 결제 실패
- ✅ `subscription.paused` - 구독 일시정지
- ✅ `subscription.resumed` - 구독 재개
- ✅ `transaction.completed` - 결제 완료
- ✅ `transaction.updated` - 결제 업데이트

#### Webhook Secret 복사

1. 생성된 Webhook > **Secret** 복사
2. `.env.local`에 추가

```env
PADDLE_WEBHOOK_SECRET=pdl_ntfset_01xxxxxxxxxxxxxxxxx
```

### 6. 로컬 개발 Webhook 테스트

#### ngrok 설치 및 사용

로컬 개발 환경에서 Webhook을 테스트하려면 ngrok을 사용하세요:

```bash
# ngrok 설치 (macOS)
brew install ngrok

# ngrok 실행 (3000번 포트)
ngrok http 3000
```

ngrok이 제공하는 HTTPS URL을 Paddle Webhook 설정에 추가:
```
https://xxxx-xxx-xxx-xxx.ngrok.io/api/webhooks/paddle
```

#### Webhook 테스트

Paddle Dashboard에서 **Send Test Event** 버튼을 클릭하여 Webhook이 정상 작동하는지 확인하세요.

### 7. 환경별 설정

#### Sandbox (개발)

```env
NEXT_PUBLIC_PADDLE_ENVIRONMENT=sandbox
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=test_xxxxxxxxxxxxx
PADDLE_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PADDLE_WEBHOOK_SECRET=pdl_ntfset_01xxxxxxxxxxxxxxxxx
NEXT_PUBLIC_PADDLE_PRICE_PRO_MONTHLY=pri_01xxxxxxxxxxxxxxxxx
```

#### Production (프로덕션)

1. Paddle Dashboard에서 **Production** 모드로 전환
2. 위 단계를 반복하여 Production 전용 키 생성
3. Vercel 환경 변수에 Production 값 설정

```env
NEXT_PUBLIC_PADDLE_ENVIRONMENT=production
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=live_xxxxxxxxxxxxx
PADDLE_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PADDLE_WEBHOOK_SECRET=pdl_ntfset_01xxxxxxxxxxxxxxxxx
NEXT_PUBLIC_PADDLE_PRICE_PRO_MONTHLY=pri_01xxxxxxxxxxxxxxxxx
```

### 8. Paddle Checkout 커스터마이징 (선택사항)

#### 테마 설정

Paddle Dashboard > **Checkout** > **Checkout Theme**에서:
- 브랜드 색상 설정
- 로고 업로드
- 폰트 선택

#### 결제 수단

Paddle Dashboard > **Settings** > **Payment Methods**에서:
- 신용카드/체크카드
- PayPal
- Apple Pay
- Google Pay

---

## 📖 개발 가이드

### 코드 스타일

```bash
# ESLint 실행
npm run lint

# 타입 체크
npx tsc --noEmit

# 포맷팅 (Prettier 사용 시)
npm run format
```

### Git 커밋 컨벤션

```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅, 세미콜론 누락 등
refactor: 코드 리팩토링
test: 테스트 코드 추가/수정
chore: 빌드 프로세스 또는 도구 변경
perf: 성능 개선
```

**예시:**
```bash
git commit -m "feat: Add profile photo upload to settings page"
git commit -m "fix: Fix subscription renewal date sync issue"
git commit -m "docs: Update README with Firebase setup guide"
git commit -m "refactor: Optimize Firestore queries with subcollections"
git commit -m "perf: Add image upload progress tracking"
```

### 브랜치 전략

```
main        - 프로덕션 환경 (항상 배포 가능한 상태)
develop     - 개발 브랜치
feature/*   - 새 기능 개발
fix/*       - 버그 수정
hotfix/*    - 긴급 수정
release/*   - 릴리스 준비
```

**예시:**
```bash
git checkout -b feature/profile-photo-upload
git checkout -b fix/subscription-sync-error
git checkout -b hotfix/webhook-signature-validation
```

### 개발 워크플로우

1. **이슈 생성**: GitHub Issues에서 작업 내용 정의
2. **브랜치 생성**: `feature/`, `fix/` 등의 브랜치 생성
3. **개발 및 테스트**: 로컬에서 개발 및 테스트
4. **커밋**: 의미 있는 단위로 커밋
5. **Pull Request**: `develop` 브랜치로 PR 생성
6. **코드 리뷰**: 팀원의 리뷰 및 승인
7. **병합**: PR 병합
8. **배포**: `main` 브랜치로 병합 시 자동 배포

---

## 💾 Firebase 데이터 구조

### 서브컬렉션 구조 개요

```
users (Collection)
└── {userId} (Document)
    ├── email: string
    ├── name: string
    ├── isPremium: boolean
    ├── ...
    ├── history (Subcollection)
    │   └── {historyId} (Document)
    │       ├── title: string
    │       ├── summary: string
    │       ├── createdAt: Timestamp
    │       └── ...
    └── daily (Subcollection)
        └── {dailyId} (Document)
            ├── date: string
            ├── count: number
            └── ...

subscription (Collection, 최상위)
└── {subscriptionId} (Document)
    ├── userId: string
    ├── paddleSubscriptionId: string
    └── ...
```

### 1. `users/{userId}` 컬렉션

사용자 프로필 정보

```typescript
interface UserProfile {
  email: string;
  name: string | null;
  isPremium: boolean;
  subscriptionPlan: 'free' | 'pro';
  emailVerified: boolean;
  photoURL?: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**예시 문서:**
```json
{
  "email": "user@example.com",
  "name": "홍길동",
  "isPremium": true,
  "subscriptionPlan": "pro",
  "emailVerified": true,
  "photoURL": "https://firebasestorage.googleapis.com/...",
  "createdAt": "2024-01-15T09:00:00Z",
  "updatedAt": "2024-11-15T14:30:00Z"
}
```

### 2. `users/{userId}/history` 서브컬렉션

사용자의 요약 기록 (Chrome 확장에서 생성)

```typescript
interface HistoryDocument {
  userId: string;
  title: string;
  url?: string;
  summary?: string;  // Chrome 확장에서 summary로 저장
  content?: string;  // 하위 호환성 지원
  createdAt: Timestamp;
  deletedAt?: Timestamp;  // 소프트 삭제
  metadata?: {
    domain?: string;
    tags?: string[];
  };
}
```

**필수 인덱스:**
- 복합 인덱스: `deletedAt` (ASC), `createdAt` (DESC)

**예시 문서:**
```json
{
  "userId": "user123",
  "title": "Next.js 14 완벽 가이드",
  "url": "https://example.com/nextjs-guide",
  "summary": "Next.js 14의 주요 기능: App Router, Server Components, 서버 액션 등을 상세히 설명합니다...",
  "createdAt": "2024-11-15T10:30:00Z",
  "metadata": {
    "domain": "example.com",
    "tags": ["개발", "웹", "프론트엔드"]
  }
}
```

### 3. `users/{userId}/daily` 서브컬렉션

일일 사용량 통계 (Chrome 확장에서 생성)

```typescript
interface DailyDocument {
  userId: string;
  date: string; // YYYY-MM-DD
  count: number;
  isPremium: boolean;
  createdAt: Timestamp;
}
```

**필수 인덱스:**
- 단일 인덱스: `date` (ASC)

**예시 문서:**
```json
{
  "userId": "user123",
  "date": "2024-11-15",
  "count": 25,
  "isPremium": true,
  "createdAt": "2024-11-15T23:59:59Z"
}
```

### 4. `subscription` 컬렉션 (최상위)

Paddle 구독 정보

```typescript
interface SubscriptionDocument {
  userId: string;
  paddleSubscriptionId: string;
  paddleCustomerId: string;
  plan: 'free' | 'pro';
  status: 'active' | 'trialing' | 'past_due' | 'paused' | 'canceled';
  currentPeriodEnd: Timestamp;
  nextBillingDate: Timestamp | null;
  cancelAtPeriodEnd: boolean;
  price: number;
  currency: string;
  priceId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**필수 인덱스:**
- 단일 인덱스: `userId` (ASC)
- 단일 인덱스: `paddleSubscriptionId` (ASC)

**예시 문서:**
```json
{
  "userId": "user123",
  "paddleSubscriptionId": "sub_01xxxxxxxxx",
  "paddleCustomerId": "ctm_01xxxxxxxxx",
  "plan": "pro",
  "status": "active",
  "currentPeriodEnd": "2024-12-15T00:00:00Z",
  "nextBillingDate": "2024-12-15T00:00:00Z",
  "cancelAtPeriodEnd": false,
  "price": 9900,
  "currency": "KRW",
  "priceId": "pri_01xxxxxxxxx",
  "createdAt": "2024-11-15T10:00:00Z",
  "updatedAt": "2024-11-15T14:30:00Z"
}
```

### 5. `webhook_events` 컬렉션 (최상위)

Paddle 웹훅 이벤트 기록 (중복 방지용)

```typescript
interface WebhookEventDocument {
  eventId: string;              // Paddle event ID
  eventType: string;            // 이벤트 타입
  processedAt: Timestamp;       // 처리 시간
  expiresAt: Timestamp;         // 만료 시간 (30일 후)
  metadata?: Record<string, any>;
}
```

**TTL 설정:**
- `expiresAt` 필드에 TTL 인덱스 설정 (30일 후 자동 삭제)

### 6. `webhook_logs` 컬렉션 (최상위)

웹훅 처리 로그 (디버깅용)

```typescript
interface WebhookLogDocument {
  eventId: string;
  eventType: string;
  status: 'success' | 'failed';
  occurredAt: Timestamp;
  processedAt: Timestamp;
  error?: {
    message: string;
    stack?: string;
  };
}
```

---

## 🔌 API 엔드포인트

### 인증

#### `POST /api/auth/session`
Firebase ID 토큰으로 세션 쿠키 생성

**Request:**
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIs..."
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "uid": "user123",
    "email": "user@example.com"
  }
}
```

**Headers:**
```
Set-Cookie: session=...; HttpOnly; Secure; Max-Age=432000
```

---

#### `DELETE /api/auth/session`
로그아웃 (세션 쿠키 삭제)

**Response:**
```json
{
  "success": true,
  "message": "Session deleted successfully"
}
```

---

### 구독 관리

#### `POST /api/subscription/create`
Pro 플랜 구독 생성 (Paddle Checkout)

**Headers:**
```
Authorization: Bearer {firebase-id-token}
Content-Type: application/json
```

**Request:**
```json
{
  "priceId": "pri_xxxxxxxxxxxxx",
  "returnUrl": "https://your-domain.com/subscription?success=true"
}
```

**Response:**
```json
{
  "success": true,
  "checkoutUrl": "https://buy.paddle.com/checkout/...",
  "transactionId": "txn_xxxxx"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "이미 Pro 플랜을 사용 중입니다."
}
```

---

#### `POST /api/subscription/cancel`
구독 취소

**Headers:**
```
Authorization: Bearer {firebase-id-token}
Content-Type: application/json
```

**Request:**
```json
{
  "effective": "next_billing_period"
}
```

**Response:**
```json
{
  "success": true,
  "message": "구독이 2024-12-31에 종료됩니다.",
  "subscription": {
    "status": "active",
    "cancelAtPeriodEnd": true,
    "currentPeriodEnd": "2024-12-31T23:59:59Z"
  }
}
```

---

#### `POST /api/subscription/resume`
취소 예정인 구독 재개

**Headers:**
```
Authorization: Bearer {firebase-id-token}
```

**Response:**
```json
{
  "success": true,
  "message": "구독이 재개되었습니다.",
  "subscription": {
    "status": "active",
    "cancelAtPeriodEnd": false
  }
}
```

---

#### `POST /api/subscription/sync` ⭐ NEW
구독 정보 수동 동기화

**Headers:**
```
Authorization: Bearer {firebase-id-token}
```

**Response:**
```json
{
  "success": true,
  "message": "구독 정보가 동기화되었습니다.",
  "subscription": {
    "status": "active",
    "currentPeriodEnd": "2024-12-15T00:00:00Z",
    "nextBillingDate": "2024-12-15T00:00:00Z",
    "daysUntilRenewal": 30,
    "isPremium": true
  }
}
```

**사용 시나리오:**
- 웹훅이 실패했을 때
- 구독 정보가 맞지 않을 때 ("0일 남음" 문제 등)
- 사용자가 문제를 신고했을 때

---

#### `POST /api/subscription/update-payment`
결제 수단 변경 URL 생성

**Headers:**
```
Authorization: Bearer {firebase-id-token}
Content-Type: application/json
```

**Request:**
```json
{
  "returnUrl": "https://your-domain.com/subscription?payment_updated=true"
}
```

**Response:**
```json
{
  "success": true,
  "updateUrl": "https://buy.paddle.com/subscription/update/..."
}
```

---

### 웹훅

#### `POST /api/webhooks/paddle`
Paddle 웹훅 수신

**Headers:**
```
Paddle-Signature: ts=1234567890;h1=abc123...
Content-Type: application/json
```

**처리하는 이벤트:**
- `subscription.created` - 구독 생성
- `subscription.updated` - 구독 업데이트
- `subscription.canceled` - 구독 취소
- `subscription.past_due` - 결제 실패
- `subscription.paused` - 구독 일시정지
- `subscription.resumed` - 구독 재개
- `transaction.completed` - 결제 완료 (✅ Paddle API 직접 조회)

**Response:**
```json
{
  "success": true
}
```

---

## 🚢 배포

### Vercel 배포

#### 1. Vercel에 프로젝트 연결

```bash
# Vercel CLI 설치
npm install -g vercel

# 로그인
vercel login

# 프로젝트 배포
vercel
```

#### 2. 환경 변수 설정

Vercel Dashboard > 프로젝트 선택 > Settings > Environment Variables

**필수 환경 변수:**
- ✅ Firebase (클라이언트): `NEXT_PUBLIC_FIREBASE_*`
- ✅ Firebase (서버): `FIREBASE_ADMIN_*`
- ✅ Paddle: `NEXT_PUBLIC_PADDLE_*`, `PADDLE_*`
- ✅ 앱 설정: `NEXT_PUBLIC_APP_URL`

#### 3. 자동 배포 설정

GitHub 저장소와 연결하면 `main` 브랜치에 push할 때마다 자동 배포됩니다.

**GitHub 연동:**
1. Vercel Dashboard > Import Project
2. GitHub 저장소 선택
3. 환경 변수 설정
4. Deploy 클릭

#### 4. 도메인 설정

**Custom Domain 추가:**
1. Vercel Dashboard > Domains
2. Add Domain 클릭
3. 원하는 도메인 입력

**DNS 설정:**

A 레코드:
```
Type: A
Name: @
Value: 76.76.21.21
```

CNAME 레코드:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

#### 5. Paddle Webhook URL 업데이트

Paddle Dashboard > Developer Tools > Notifications에서 Webhook URL을 프로덕션 도메인으로 변경:

```
https://your-domain.com/api/webhooks/paddle
```

---

## 🐛 트러블슈팅

### 1. Firebase 연결 오류

**증상:**
```
Error: Firebase: Error (auth/invalid-api-key)
```

**해결 방법:**
1. `.env.local` 파일의 `NEXT_PUBLIC_FIREBASE_API_KEY` 확인
2. Firebase Console에서 API 키가 활성화되어 있는지 확인
3. 개발 서버 재시작:
   ```bash
   npm run dev
   ```

---

### 2. Paddle Checkout이 열리지 않음

**증상:**
```
Error: Paddle is not initialized
```

**해결 방법:**

1. `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`이 올바르게 설정되었는지 확인
2. Paddle.js 스크립트가 로드되었는지 확인
3. 브라우저 콘솔에서 확인:

```javascript
// 디버깅 코드
console.log('Paddle loaded:', !!window.Paddle);
console.log('Paddle environment:', process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT);
```

---

### 3. 세션 쿠키가 설정되지 않음

**증상:**
로그인 후 페이지 새로고침 시 로그아웃됨

**해결 방법:**

1. 브라우저가 쿠키를 차단하지 않는지 확인
2. 개발 환경에서 `secure: false` 설정 확인
3. Middleware 로그 확인:

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  
  if (!session) {
    console.log('❌ No session cookie found');
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  try {
    await getAdminAuth().verifySessionCookie(session);
    console.log('✅ Valid session');
  } catch (error) {
    console.error('❌ Invalid session:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}
```

---

### 4. Paddle Webhook 시그니처 검증 실패

**증상:**
```
Error: Invalid webhook signature
```

**해결 방법:**

1. `PADDLE_WEBHOOK_SECRET`이 올바른지 확인
2. Webhook URL이 HTTPS인지 확인
3. Paddle Dashboard에서 Webhook 재생성
4. 원본 요청 본문 확인:

```typescript
// app/api/webhooks/paddle/route.ts
export async function POST(request: NextRequest) {
  // ✅ 반드시 원본 텍스트로 읽기
  const rawBody = await request.text();
  const signature = request.headers.get('paddle-signature');
  
  console.log('Signature:', signature);
  console.log('Webhook Secret:', process.env.PADDLE_WEBHOOK_SECRET?.substring(0, 10) + '...');
  
  const isValid = verifyPaddleWebhook(signature, rawBody);
  
  if (!isValid) {
    console.error('❌ Invalid signature');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }
  
  console.log('✅ Valid signature');
  // ...
}
```

---

### 5. Firestore 쿼리 성능 문제

**증상:**
대시보드 로딩이 느림

**해결 방법:**

1. **인덱스 생성**: Firebase Console > Firestore > Indexes

2. **페이지네이션 최적화**:
```typescript
// hooks/useHistory.ts
const { data, error } = useSWRInfinite(
  getKey,
  fetcher,
  {
    revalidateFirstPage: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000, // 1분
  }
);
```

3. **필수 인덱스 생성**:

`users/{userId}/history`:
```
Fields indexed:
  - deletedAt (Ascending)
  - createdAt (Descending)
```

`users/{userId}/daily`:
```
Fields indexed:
  - date (Ascending)
```

---

### 6. 구독 갱신 후 "0일 남음" 문제 ⭐

**증상:**
- Pro 플랜 구독 중
- Paddle에서 결제가 완료되었지만 "다음 결제까지 0일 남음"으로 표시

**원인:**
- Paddle 웹훅의 이벤트 순서 문제
- `transaction.completed` 이벤트 처리 시 `currentPeriodEnd` 업데이트 누락

**해결 방법:**

**즉시 해결 (수동 동기화):**

구독 관리 페이지에서 "구독 정보 동기화" 버튼 클릭

**근본 해결 (자동 동기화):**

이미 적용됨 - `transaction.completed` 이벤트에서 Paddle API 직접 조회:

```typescript
// app/api/webhooks/paddle/route.ts
async function handleTransactionCompleted(data: any) {
  // 결제 기록 저장
  await savePaymentRecord(data);
  
  // ✅ 구독 관련 결제인 경우 Paddle API에서 최신 정보 동기화
  if (data.subscription_id) {
    await syncSubscriptionFromPaddle(data.subscription_id);
  }
}
```

---

### 7. TypeScript 타입 오류

**증상:**
```typescript
'type' 속성의 형식이 호환되지 않습니다.
```

**해결 방법:**

Nullish Coalescing 및 Optional Chaining 사용:

```tsx
// ❌ 나쁜 예
const value = obj?.prop  // string | undefined

// ✅ 좋은 예 1: Nullish Coalescing
const value = obj?.prop ?? ''  // string

// ✅ 좋은 예 2: Optional Chaining + 기본값
const value = obj?.prop || 'default'  // string

// ✅ 좋은 예 3: Type Guard
if (obj?.prop) {
  const value = obj.prop  // string
}
```

---

### 8. 프로필 사진 업로드 실패

**증상:**
```
Error: Firebase Storage: User does not have permission to access...
```

**해결 방법:**

1. **Storage 보안 규칙 확인**:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/profile/{fileName} {
      allow read: if true;
      allow write: if request.auth != null && 
                      request.auth.uid == userId &&
                      request.resource.size < 2 * 1024 * 1024 &&
                      request.resource.contentType.matches('image/.*');
    }
  }
}
```

2. **파일 크기 확인** (최대 2MB)
3. **파일 형식 확인** (JPEG, PNG, GIF, WebP만 허용)

---

### 9. Firestore 인덱스 필요 오류

**증상:**
```
Error: 9 FAILED_PRECONDITION: The query requires an index
```

**해결 방법:**

**옵션 1: 인덱스 생성 (권장)**

에러 메시지의 링크를 클릭하여 Firebase Console에서 인덱스 자동 생성

**옵션 2: 쿼리 수정**

인덱스가 필요 없도록 쿼리 변경:

```typescript
// Before (인덱스 필요)
const snapshot = await db
  .collection('subscription')
  .where('userId', '==', userId)
  .orderBy('createdAt', 'desc')
  .limit(1)
  .get();

// After (인덱스 불필요 - 클라이언트 정렬)
const snapshot = await db
  .collection('subscription')
  .where('userId', '==', userId)
  .get();

const sortedDocs = snapshot.docs.sort((a, b) => 
  b.data().createdAt.toMillis() - a.data().createdAt.toMillis()
);
const latestDoc = sortedDocs[0];
```

---

### 10. CORS 오류

**증상:**
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

**해결 방법:**

Firebase Storage CORS 설정:

1. `cors.json` 파일 생성:
```json
[
  {
    "origin": ["https://your-domain.com", "http://localhost:3000"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "maxAgeSeconds": 3600
  }
]
```

2. CORS 적용:
```bash
gsutil cors set cors.json gs://your-bucket-name.appspot.com
```

---

## ✅ 개발 체크리스트

### ✅ Phase 1: 기반 구축 (완료)
- [x] Next.js 15 프로젝트 셋업
- [x] Firebase 연동 (Authentication, Firestore)
- [x] 인증 시스템 구현
- [x] 대시보드 레이아웃
- [x] 환경 변수 설정
- [x] Middleware 보호

### ✅ Phase 2: 기록 관리 (완료)
- [x] 요약 기록 조회 (서브컬렉션)
- [x] 검색 및 필터링
- [x] 무한 스크롤 페이지네이션
- [x] 상세 모달
- [x] 도메인별 통계
- [x] 반응형 디자인

### ✅ Phase 3: 결제 시스템 (완료)
- [x] Paddle Billing 연동
- [x] 구독 생성/취소/재개
- [x] 웹훅 처리 및 시그니처 검증
- [x] 구독 관리 페이지
- [x] 결제 수단 변경
- [x] 중복 이벤트 방지

### ✅ Phase 4: 실시간 동기화 (완료)
- [x] 실시간 구독 상태 추적
- [x] Firestore 실시간 리스너
- [x] 웹훅 이벤트 로깅
- [x] 구독 상태 자동 업데이트
- [x] 사용자 프로필 실시간 동기화
- [x] **Paddle API 직접 조회 및 동기화** ⭐
- [x] **수동 구독 동기화 기능** ⭐
- [x] **구독 갱신 시 자동 업데이트** ⭐

### ✅ Phase 5: 최적화 & 추가 기능 (완료) ⭐ NEW
- [x] **SEO 최적화**
  - [x] 동적 사이트맵 (sitemap.xml)
  - [x] robots.txt 생성
  - [x] PWA 매니페스트
  - [x] 구조화된 데이터 (JSON-LD)
  - [x] 페이지별 메타데이터
  - [x] Open Graph & Twitter Cards
  - [x] 요금제 페이지 (Pricing)
  - [x] 클라이언트 컴포넌트용 동적 메타데이터
- [x] **프로필 설정 페이지 완성** ⭐
- [x] **프로필 사진 업로드** ⭐
- [x] **보안 설정 (이메일/비밀번호 변경)** ⭐
- [x] PWA 지원
- [x] 다국어 지원 (i18n)
- [ ] 에러 모니터링 (Sentry)
- [ ] 분석 도구 (Google Analytics)
- [ ] 다크 모드 개선
- [ ] 캐싱 전략 최적화

### 📅 Phase 6: 고급 기능 (예정)
- [ ] 팀 공유 기능
- [ ] 태그 관리 시스템
- [ ] 즐겨찾기
- [ ] PDF 내보내기
- [ ] API 키 발급 (외부 연동)
- [ ] 요약 템플릿
- [ ] 대량 작업 (일괄 삭제, 내보내기)
- [ ] 알림 시스템 (이메일, 푸시)
- [ ] Chrome 확장과 실시간 동기화
- [ ] 고급 필터링 (날짜 범위, 복합 조건)
- [ ] 블로그/컨텐츠 마케팅 섹션

---

## 🤝 기여하기

SummaryGenie Page 프로젝트에 기여해주셔서 감사합니다!

### 기여 가이드라인

1. **Fork the Project**
   ```bash
   git clone https://github.com/your-username/summarygenie_page.git
   ```

2. **Create your Feature Branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```

3. **Commit your Changes**
   ```bash
   git commit -m 'feat: Add some AmazingFeature'
   ```

4. **Push to the Branch**
   ```bash
   git push origin feature/AmazingFeature
   ```

5. **Open a Pull Request**

### 코드 스타일

- **ESLint** 규칙 준수
- **TypeScript** 타입 명시
- **Tailwind CSS** 유틸리티 클래스 사용
- **컴포넌트**: 단일 책임 원칙
- **함수**: 명확한 이름, JSDoc 주석

### 커밋 메시지 컨벤션

```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅, 세미콜론 누락 등
refactor: 코드 리팩토링
test: 테스트 코드 추가
chore: 빌드 작업, 패키지 매니저 설정 등
perf: 성능 개선
```

---

## 📄 라이센스

이 프로젝트는 **MIT 라이센스** 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

```
MIT License

Copyright (c) 2025 SummaryGenie Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 📧 문의

프로젝트에 대한 질문이나 제안사항이 있으시면 아래로 연락 주세요:

- **이메일**: support@summarygenie.com
- **웹사이트**: https://summarygenie.app
- **GitHub**: https://github.com/your-username/summarygenie_page
- **이슈 트래커**: https://github.com/your-username/summarygenie_page/issues

---

## 🙏 감사의 말

이 프로젝트는 다음 오픈소스 프로젝트들의 도움을 받았습니다:

- [Next.js](https://nextjs.org/) - React 프레임워크
- [Firebase](https://firebase.google.com/) - 백엔드 서비스
- [Paddle](https://www.paddle.com/) - 결제 플랫폼
- [Tailwind CSS](https://tailwindcss.com/) - CSS 프레임워크
- [Shadcn/ui](https://ui.shadcn.com/) - UI 컴포넌트
- [Recharts](https://recharts.org/) - 차트 라이브러리
- [Lucide Icons](https://lucide.dev/) - 아이콘
- [SWR](https://swr.vercel.app/) - 데이터 페칭
- [React Hot Toast](https://react-hot-toast.com/) - 알림 시스템

---

**Made with by SummaryGenie Team**

*마지막 업데이트: 2025년 11월 18일*