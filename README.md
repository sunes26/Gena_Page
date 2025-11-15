# SummaryGenie Page

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
- [주요 기능 상세](#-주요-기능-상세)
- [API 엔드포인트](#-api-엔드포인트)
- [Firebase 데이터 구조](#-firebase-데이터-구조)
- [배포](#-배포)
- [트러블슈팅](#-트러블슈팅)
- [개발 로드맵](#-개발-로드맵)
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

### 프로젝트 현황

| Phase | 상태 | 설명 |
|-------|------|------|
| Phase 1 | ✅ 완료 | 프로젝트 기반 구축, Firebase 연동 |
| Phase 2 | ✅ 완료 | 요약 기록 관리, 검색/필터링 |
| Phase 3 | ✅ 완료 | Paddle 결제 시스템 연동 |
| Phase 4 | ✅ 완료 | 실시간 구독 동기화, 웹훅 처리 |
| Phase 5 | 🚧 진행중 | 최적화 & 추가 기능 |
| Phase 6 | 📅 예정 | 고급 기능 (팀 공유, 태그 관리) |

---

## ✨ 주요 기능

### 🔐 인증 시스템
- ✅ 이메일/비밀번호 로그인/회원가입
- ✅ Google 소셜 로그인
- ✅ 이메일 인증
- ✅ 비밀번호 재설정
- ✅ 세션 쿠키 기반 인증
- ✅ 보호된 라우트 (Middleware)

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
- ✅ Free/Pro 플랜 제공
- ✅ Paddle Checkout 오버레이 결제
- ✅ 구독 취소 및 재개
- ✅ 결제 수단 변경
- ✅ 구독 상태 실시간 추적
- ✅ Webhook을 통한 자동 동기화
- ✅ 구독 만료일 계산 및 알림
- ✅ 결제 내역 관리

### ⚙️ 설정
- ✅ 프로필 편집 (이름, 이메일, 프로필 사진)
- ✅ 비밀번호 변경 (재인증 포함)
- ✅ 알림 설정
- ✅ 사용 통계 확인
- ✅ 계정 보안 설정

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

### Backend & Database
- **Firebase Authentication** - 사용자 인증
- **Firebase Firestore** - NoSQL 데이터베이스 (서브컬렉션 구조)
- **Firebase Storage** - 파일 저장
- **Next.js API Routes** - 서버리스 API
- **Firebase Admin SDK** - 서버 사이드 Firebase 작업

### 결제 & 구독
- **Paddle Billing** - 결제 처리 및 구독 관리
- **Paddle Webhooks** - 구독 이벤트 처리
- **Paddle.js v2** - 클라이언트 SDK

### 배포 & 호스팅
- **Vercel** - 자동 배포 및 호스팅
- **GitHub Actions** - CI/CD (선택사항)

### 개발 도구
- **ESLint** - 코드 품질 관리
- **Prettier** - 코드 포맷팅 (권장)
- **TypeScript** - 정적 타입 검사

---

## 📁 프로젝트 구조

```
summarygenie_page/
│
├─ app/                                     # Next.js 14 App Router
│  ├─ (auth)/                              # 인증 관련 페이지 그룹
│  │  ├─ forgot-password/
│  │  │  └─ page.tsx                       # 비밀번호 재설정
│  │  ├─ login/
│  │  │  └─ page.tsx                       # 로그인
│  │  ├─ signup/
│  │  │  └─ page.tsx                       # 회원가입
│  │  └─ verify-email/
│  │     └─ page.tsx                       # 이메일 인증
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
│  │  ├─ pricing/                          # 요금제 페이지 (예정)
│  │  ├─ layout.tsx                        # 마케팅 레이아웃
│  │  └─ page.tsx                          # 랜딩 페이지
│  │
│  ├─ api/                                 # API Routes
│  │  ├─ auth/
│  │  │  └─ session/
│  │  │     └─ route.ts                    # 세션 쿠키 관리
│  │  ├─ subscription/
│  │  │  ├─ cancel/
│  │  │  │  └─ route.ts                    # 구독 취소
│  │  │  ├─ create/
│  │  │  │  └─ route.ts                    # 구독 생성
│  │  │  ├─ resume/
│  │  │  │  └─ route.ts                    # 구독 재개
│  │  │  ├─ status/
│  │  │  │  └─ route.ts                    # 구독 상태 조회
│  │  │  └─ update-payment/
│  │  │     └─ route.ts                    # 결제 수단 변경
│  │  ├─ test-admin/
│  │  │  └─ route.ts                       # Admin SDK 테스트
│  │  ├─ test-queries/
│  │  │  └─ route.ts                       # Firestore 쿼리 테스트
│  │  └─ webhooks/
│  │     └─ paddle/
│  │        └─ route.ts                    # Paddle 웹훅
│  │
│  ├─ test-firebase/
│  │  └─ page.tsx                          # Firebase 연결 테스트
│  ├─ favicon.ico                          # 파비콘
│  ├─ globals.css                          # 전역 스타일
│  └─ layout.tsx                           # 루트 레이아웃
│
├─ components/                              # React 컴포넌트
│  ├─ dashboard/                           # 대시보드 컴포넌트
│  │  ├─ DomainFilter.tsx                 # 도메인 필터
│  │  ├─ HistoryModal.tsx                 # 상세 모달
│  │  ├─ HistoryTable.tsx                 # 기록 테이블
│  │  ├─ MobileHeader.tsx                 # 모바일 헤더
│  │  ├─ NotificationSettings.tsx         # 알림 설정
│  │  ├─ page.tsx                         # (임시 파일)
│  │  ├─ ProfileSettings.tsx              # 프로필 설정
│  │  ├─ RecentHistory.tsx                # 최근 기록
│  │  ├─ SearchBar.tsx                    # 검색 바
│  │  ├─ SecuritySettings.tsx             # 보안 설정
│  │  ├─ Sidebar.tsx                      # 사이드바
│  │  ├─ StatsCard.tsx                    # 통계 카드
│  │  ├─ StatsOverview.tsx                # 통계 개요
│  │  └─ UsageChart.tsx                   # 사용량 차트
│  │
│  ├─ marketing/                           # 마케팅 컴포넌트
│  │  ├─ FAQ.tsx                          # FAQ 섹션
│  │  ├─ Features.tsx                     # 기능 소개
│  │  ├─ FinalCTA.tsx                     # 최종 CTA
│  │  ├─ Footer.tsx                       # 푸터
│  │  ├─ Header.tsx                       # 헤더
│  │  ├─ Hero.tsx                         # 히어로 섹션
│  │  ├─ HowItWorks.tsx                   # 작동 방식
│  │  ├─ Pricing.tsx                      # 요금제
│  │  ├─ ProblemStatement.tsx             # 문제 제기
│  │  ├─ ScrollReveal.tsx                 # 스크롤 애니메이션
│  │  └─ UseCases.tsx                     # 사용 사례
│  │
│  ├─ payment/                             # 결제 컴포넌트
│  │  ├─ PaddleCheckout.tsx               # Paddle 결제
│  │  └─ SubscriptionInfo.tsx             # 구독 정보
│  │
│  ├─ providers/                           # Context Provider
│  │  └─ PaddleProvider.tsx               # Paddle Provider
│  │
│  ├─ ui/                                  # 공통 UI 컴포넌트
│  │  ├─ button.tsx                       # 버튼
│  │  ├─ card.tsx                         # 카드
│  │  ├─ dialog.tsx                       # 다이얼로그
│  │  ├─ dropdown-menu.tsx                # 드롭다운 메뉴
│  │  ├─ input.tsx                        # 입력
│  │  ├─ label.tsx                        # 레이블
│  │  ├─ select.tsx                       # 선택
│  │  ├─ tabs.tsx                         # 탭
│  │  ├─ textarea.tsx                     # 텍스트 영역
│  │  └─ toast.tsx                        # 토스트 알림
│  │
│  ├─ Header.tsx                           # 공통 헤더
│  ├─ LogoutButton.tsx                     # 로그아웃 버튼
│  └─ UserProfile.tsx                      # 사용자 프로필
│
├─ contexts/                                # React Context
│  └─ AuthContext.tsx                      # 인증 컨텍스트
│
├─ hooks/                                   # Custom React Hooks
│  ├─ useAuth.ts                           # 인증 훅
│  ├─ useHistory.ts                        # 요약 기록 조회
│  ├─ useSubscription.ts                   # 구독 상태
│  └─ useUsageStats.ts                     # 사용량 통계
│
├─ lib/                                     # 유틸리티 & 설정
│  ├─ firebase/                            # Firebase 설정
│  │  ├─ admin-utils.ts                   # Admin 유틸리티
│  │  ├─ admin.ts                         # Admin SDK
│  │  ├─ client-queries.ts                # 클라이언트 쿼리
│  │  ├─ client.ts                        # 클라이언트 설정
│  │  ├─ queries.ts                       # Firestore 쿼리
│  │  ├─ storage.ts                       # Firebase Storage
│  │  ├─ types.ts                         # TypeScript 타입
│  │  └─ utils.ts                         # Firebase 유틸리티
│  │
│  ├─ api-client.ts                        # API 클라이언트
│  ├─ auth.ts                              # 인증 헬퍼
│  ├─ paddle-server.ts                     # Paddle 서버 API
│  ├─ paddle-webhook.ts                    # Paddle 웹훅 유틸
│  ├─ paddle.ts                            # Paddle 클라이언트
│  ├─ toast-helpers.ts                     # 토스트 헬퍼
│  └─ utils.ts                             # 공통 유틸리티
│
├─ public/                                  # 정적 파일
│  ├─ images/
│  │  └─ logo.png                          # 로고
│  ├─ file.svg                             # 파일 아이콘
│  ├─ globe.svg                            # 글로브 아이콘
│  ├─ manifest.json                        # PWA 매니페스트
│  ├─ next.svg                             # Next.js 로고
│  ├─ vercel.svg                           # Vercel 로고
│  └─ window.svg                           # 윈도우 아이콘
│
├─ types/                                   # TypeScript 타입 정의
│  ├─ index.ts                             # 공통 타입
│  └─ paddle.ts                            # Paddle 타입
│
├─ .env.example                             # 환경 변수 예시
├─ .env.local                               # 환경 변수 (git 제외)
├─ .gitignore                               # Git 제외 파일
├─ components.json                          # shadcn/ui 설정
├─ eslint.config.mjs                        # ESLint 설정
├─ middleware.ts                            # Next.js 미들웨어
├─ next-env.d.ts                            # Next.js TypeScript 정의
├─ next.config.ts                           # Next.js 설정
├─ package-lock.json                        # npm 잠금 파일
├─ package.json                             # npm 패키지 설정
├─ postcss.config.js                        # PostCSS 설정
├─ README.md                                # 프로젝트 문서
├─ tailwind.config.js                       # Tailwind CSS 설정
├─ tsconfig.json                            # TypeScript 설정
└─ tsconfig.tsbuildinfo                     # TypeScript 빌드 정보
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

### 3단계: 환경 변수 설정

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

### 4단계: 개발 서버 실행

```bash
npm run dev
# 또는
yarn dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인합니다.

### 5단계: 빌드 (프로덕션)

```bash
npm run build
npm start
# 또는
yarn build
yarn start
```

---

## 🔐 환경 변수 설정

### Firebase 클라이언트 설정

1. [Firebase Console](https://console.firebase.google.com/)에서 프로젝트 생성 또는 선택
2. **프로젝트 설정** > **일반** 탭에서 웹 앱 추가
3. 설정 정보를 `.env.local`에 복사

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:xxxxx
```

### Firebase Admin SDK 설정

1. **프로젝트 설정** > **서비스 계정** 탭
2. **새 비공개 키 생성** 클릭
3. 다운로드한 JSON 파일의 내용을 환경 변수에 설정

```env
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"
```

⚠️ **주의**: `FIREBASE_ADMIN_PRIVATE_KEY`는 큰따옴표로 감싸고, `\n`을 그대로 유지해야 합니다.

### Paddle 설정

#### 1. Paddle 계정 생성

- [Paddle Dashboard](https://vendors.paddle.com/)에서 계정 생성
- Sandbox 환경에서 테스트 시작

#### 2. API Key 생성

1. **Developer Tools** > **Authentication** 에서 API Key 생성
2. API Key를 안전한 곳에 보관

```env
PADDLE_API_KEY=your-paddle-api-key
```

#### 3. Client Token 생성

1. **Developer Tools** > **Client-side Tokens**에서 토큰 생성
2. 도메인 제한 설정 권장

```env
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=your-paddle-client-token
```

#### 4. Webhook 설정

1. **Developer Tools** > **Notifications** 에서 Webhook 설정
2. Webhook URL: `https://your-domain.com/api/webhooks/paddle`
3. 필요한 이벤트 선택:
   - ✅ `subscription.created`
   - ✅ `subscription.updated`
   - ✅ `subscription.canceled`
   - ✅ `subscription.past_due`
   - ✅ `subscription.paused`
   - ✅ `subscription.resumed`
   - ✅ `transaction.completed`

4. Webhook Secret 복사

```env
PADDLE_WEBHOOK_SECRET=your-webhook-secret
```

#### 5. 상품(Product) 생성

1. **Catalog** > **Products** 에서 새 상품 생성
   - 상품명: SummaryGenie Pro
   - 가격: ₩9,900/월 (또는 원하는 가격)

2. Price ID를 환경 변수에 설정

```env
NEXT_PUBLIC_PADDLE_PRICE_PRO_MONTHLY=pri_01xxxxxxxxxxxxxxxxx
```

#### 6. 환경 설정

```env
# 개발 환경
NEXT_PUBLIC_PADDLE_ENVIRONMENT=sandbox

# 프로덕션 환경
NEXT_PUBLIC_PADDLE_ENVIRONMENT=production
```

---

## 📚 주요 기능 상세

### 1. 인증 시스템

#### Firebase Authentication 연동

```typescript
// lib/auth.ts
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider 
} from 'firebase/auth';

// 이메일 로그인
export async function signInWithEmail(email: string, password: string) {
  const auth = getAuthInstance();
  return await signInWithEmailAndPassword(auth, email, password);
}

// Google 로그인
export async function signInWithGoogle() {
  const auth = getAuthInstance();
  const provider = new GoogleAuthProvider();
  return await signInWithPopup(auth, provider);
}
```

#### 세션 쿠키 관리

```typescript
// app/api/auth/session/route.ts
export async function POST(request: NextRequest) {
  const { idToken } = await request.json();
  
  // ID 토큰 검증
  const auth = getAdminAuth();
  const decodedToken = await auth.verifyIdToken(idToken);
  
  // 세션 쿠키 생성 (5일 유효)
  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: 60 * 60 * 24 * 5 * 1000, // 5 days
  });
  
  // 쿠키 설정 및 응답
  const response = NextResponse.json({ success: true });
  response.cookies.set('session', sessionCookie, {
    maxAge: 60 * 60 * 24 * 5,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });
  
  return response;
}
```

### 2. 대시보드

#### 실시간 통계 조회

```typescript
// hooks/useUsageStats.ts
export function useMonthlyUsage(userId: string | null) {
  const { data, error } = useSWR(
    userId ? ['monthly-usage', userId] : null,
    async () => {
      const now = new Date();
      const stats = await getMonthlyUsage(
        userId!, 
        now.getFullYear(), 
        now.getMonth() + 1
      );
      return stats;
    },
    {
      refreshInterval: 60000, // 1분마다 갱신
      revalidateOnFocus: true,
    }
  );
  
  return {
    total: data?.total || 0,
    loading: !error && !data,
    error,
  };
}
```

#### 사용량 차트

```typescript
// components/dashboard/UsageChart.tsx
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function UsageChart({ data }: { data: DailyStats[] }) {
  const chartData = data.map(stat => ({
    date: new Date(stat.date).toLocaleDateString('ko-KR', { 
      month: 'short', 
      day: 'numeric' 
    }),
    count: stat.count,
  }));
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line 
          type="monotone" 
          dataKey="count" 
          stroke="#3b82f6" 
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

### 3. 요약 기록 관리

#### 무한 스크롤 구현

```typescript
// hooks/useHistory.ts
export function useHistory(userId: string | null, options: HistoryOptions = {}) {
  const { data, size, setSize, isValidating } = useSWRInfinite(
    getKey,
    fetcher,
    {
      revalidateFirstPage: false,
      revalidateOnFocus: false,
    }
  );
  
  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      setSize(size + 1);
    }
  }, [size, setSize, isLoadingMore, hasMore]);
  
  return { history, loadMore, hasMore };
}
```

#### 실시간 검색 (디바운스)

```typescript
// components/dashboard/SearchBar.tsx
export default function SearchBar({ onSearch }: { onSearch: (term: string) => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // 500ms 디바운스
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchTerm);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm, onSearch]);
  
  return (
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="제목 또는 내용으로 검색..."
      className="w-full px-4 py-2 border rounded-lg"
    />
  );
}
```

### 4. 구독 관리 (Paddle)

#### Paddle Checkout 연동

```typescript
// components/payment/PaddleCheckout.tsx
'use client';

import { usePaddle } from '@/lib/paddle';
import { PADDLE_PRICES } from '@/lib/paddle';

export function PaddleCheckout() {
  const paddle = usePaddle();
  const { user } = useAuth();
  
  const handleUpgrade = async () => {
    if (!user) return;
    
    // Paddle Checkout 열기
    paddle.Checkout.open({
      items: [
        {
          priceId: PADDLE_PRICES.pro_monthly,
          quantity: 1,
        },
      ],
      customData: {
        userId: user.uid,
        email: user.email || '',
      },
      customer: user.email ? {
        email: user.email,
      } : undefined,
      settings: {
        displayMode: 'overlay',
        theme: 'dark',
        locale: 'ko',
        successUrl: `${window.location.origin}/subscription?success=true`,
      },
    });
  };
  
  return (
    <button onClick={handleUpgrade}>
      Pro로 업그레이드
    </button>
  );
}
```

#### Paddle 웹훅 처리

```typescript
// app/api/webhooks/paddle/route.ts
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get('paddle-signature');
  
  // 1. 시그니처 검증
  const isValid = verifyPaddleWebhook(signature, rawBody);
  
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }
  
  const payload = JSON.parse(rawBody);
  const { event_type, data } = payload;
  
  // 2. 중복 이벤트 체크
  const isDuplicate = await isDuplicateEvent(payload.event_id);
  if (isDuplicate) {
    return NextResponse.json({ success: true, message: 'Already processed' });
  }
  
  // 3. 이벤트별 처리
  switch (event_type) {
    case 'subscription.created':
      await handleSubscriptionCreated(data);
      break;
    case 'subscription.updated':
      await handleSubscriptionUpdated(data);
      break;
    case 'subscription.canceled':
      await handleSubscriptionCanceled(data);
      break;
    case 'transaction.completed':
      await handleTransactionCompleted(data);
      break;
  }
  
  // 4. 이벤트 처리 완료 기록
  await markEventAsProcessed(payload.event_id, event_type);
  
  return NextResponse.json({ success: true });
}
```

---

## 🔌 API 엔드포인트

### 인증

#### `POST /api/auth/session`
세션 쿠키 생성

**Request:**
```json
{
  "idToken": "eyJhbGciOiJSUzI1..."
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
- `Set-Cookie: session=...; HttpOnly; Secure; Max-Age=432000`

#### `DELETE /api/auth/session`
로그아웃 (세션 쿠키 삭제)

**Response:**
```json
{
  "success": true,
  "message": "Session deleted successfully"
}
```

### 구독

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
- `transaction.completed` - 결제 완료

**Response:**
```json
{
  "success": true
}
```

---

## 🗄️ Firebase 데이터 구조

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
  "photoURL": "https://...",
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
  deletedAt?: Timestamp;
  metadata?: {
    domain?: string;
    tags?: string[];
  };
}
```

**인덱스:**
- 복합 인덱스: `deletedAt` (ASC), `createdAt` (DESC)

**예시 문서:**
```json
{
  "userId": "user123",
  "title": "Next.js 14 완벽 가이드",
  "url": "https://example.com/nextjs-guide",
  "summary": "Next.js 14의 주요 기능: App Router, Server Components...",
  "createdAt": "2024-11-15T10:30:00Z",
  "metadata": {
    "domain": "example.com",
    "tags": ["개발", "웹"]
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

**인덱스:**
- 복합 인덱스: `date` (ASC)

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

**인덱스:**
- `userId` (ASC)
- `paddleSubscriptionId` (ASC)

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
  eventId: string;
  eventType: string;
  processedAt: Timestamp;
  expiresAt: Timestamp; // 30일 후 자동 삭제
  metadata?: Record<string, any>;
}
```

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

Vercel Dashboard에서 프로젝트 설정 > Environment Variables에 모든 환경 변수 추가

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

### 도메인 설정

#### 1. Vercel Dashboard에서 도메인 추가

1. Vercel Dashboard > Domains
2. Add Domain 클릭
3. 원하는 도메인 입력

#### 2. DNS 설정

**A 레코드:**
```
Type: A
Name: @
Value: 76.76.21.21
```

**CNAME 레코드:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

#### 3. 환경 변수 업데이트

프로덕션 도메인으로 환경 변수를 업데이트합니다.

```env
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Paddle 웹훅 URL 업데이트

#### 1. Paddle Dashboard 설정

1. Paddle Dashboard > Developer Tools > Notifications
2. Webhook URL을 프로덕션 도메인으로 변경:
   ```
   https://your-domain.com/api/webhooks/paddle
   ```

#### 2. Webhook 테스트

Paddle Dashboard에서 "Send Test Event" 버튼으로 웹훅이 정상 작동하는지 확인합니다.

#### 3. 웹훅 시그니처 검증

프로덕션 환경에서는 반드시 웹훅 시그니처 검증을 활성화해야 합니다:

```typescript
// app/api/webhooks/paddle/route.ts
const isValid = verifyWebhookSignature(
  signature,
  rawBody,
  process.env.PADDLE_WEBHOOK_SECRET!
);

if (!isValid) {
  return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
}
```

---

## 🔧 트러블슈팅

### 1. Firebase 연결 오류

**증상:**
```
Error: Firebase: Error (auth/invalid-api-key)
```

**해결 방법:**
1. `.env.local` 파일의 `NEXT_PUBLIC_FIREBASE_API_KEY` 확인
2. Firebase Console에서 API 키가 활성화되어 있는지 확인
3. 개발 서버 재시작: `npm run dev`

### 2. Paddle Checkout이 열리지 않음

**증상:**
```
Error: Paddle is not initialized
```

**해결 방법:**

1. `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`이 올바르게 설정되었는지 확인
2. Paddle.js 스크립트가 로드되었는지 확인
3. 브라우저 콘솔에서 `window.Paddle` 객체 확인

```typescript
// 디버깅 코드
console.log('Paddle loaded:', !!window.Paddle);
console.log('Paddle environment:', process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT);
```

### 3. 세션 쿠키가 설정되지 않음

**증상:**
로그인 후 페이지 새로고침 시 로그아웃됨

**해결 방법:**

1. 브라우저가 쿠키를 차단하지 않는지 확인
2. `httpOnly`, `secure` 속성 확인
3. 프로덕션에서는 `secure: true` 설정

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  
  if (!session) {
    console.log('❌ No session cookie found');
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // 세션 검증
  try {
    await getAdminAuth().verifySessionCookie(session);
    console.log('✅ Valid session');
  } catch (error) {
    console.error('❌ Invalid session:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}
```

### 4. Paddle Webhook 시그니처 검증 실패

**증상:**
```
Error: Invalid webhook signature
```

**해결 방법:**

1. `PADDLE_WEBHOOK_SECRET`이 올바른지 확인
2. Webhook URL이 올바른지 확인 (HTTPS 필수)
3. Paddle Dashboard에서 Webhook 재생성
4. 원본 요청 본문(raw body) 사용 확인

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

### 5. Firestore 쿼리 성능 문제

**증상:**
대시보드 로딩이 느림

**해결 방법:**

1. **인덱스 생성**: Firebase Console > Firestore > Indexes
2. **페이지네이션 최적화**: `pageSize` 조정
3. **SWR 캐싱 활용**: `revalidateOnFocus: false` 설정

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

**필수 인덱스:**

1. `users/{userId}/history`:
   - 복합 인덱스: `deletedAt` (ASC), `createdAt` (DESC)

2. `users/{userId}/daily`:
   - 복합 인덱스: `date` (ASC)

3. `subscription`:
   - 단일 인덱스: `userId` (ASC)
   - 단일 인덱스: `paddleSubscriptionId` (ASC)

### 6. CORS 오류

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
gsutil cors set cors.json gs://your-bucket-name
```

### 7. 서브컬렉션 쿼리 오류

**증상:**
```
Error: Missing or insufficient permissions
```

**해결 방법:**

Firestore 보안 규칙 업데이트:

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
    
    // subscription 컬렉션
    match /subscription/{subId} {
      allow read: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
      allow write: if false; // 서버에서만 쓰기
    }
  }
}
```

---

## 📈 개발 로드맵

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

### 🚧 Phase 5: 최적화 & 추가 기능 (진행 중)
- [ ] 성능 최적화 (이미지, 번들 크기)
- [ ] SEO 최적화 (메타 태그, Sitemap)
- [ ] 다국어 지원 (i18n)
- [ ] 에러 모니터링 (Sentry)
- [ ] 분석 도구 (Google Analytics)
- [x] PWA 지원
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
   git commit -m 'Add some AmazingFeature'
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

예시:
```
feat: Add infinite scroll to history page
fix: Fix Paddle webhook signature verification
docs: Update README with Paddle setup guide
refactor: Optimize Firestore queries with subcollections
```

---

## 📝 라이센스

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

*마지막 업데이트: 2025년 11월 15일*