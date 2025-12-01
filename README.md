# SummaryGenie Page 프로젝트

> AI 기반 웹페이지 요약 Chrome 확장 프로그램과 웹 대시보드를 제공하는 SaaS 플랫폼

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-10.0-orange)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38bdf8)](https://tailwindcss.com/)

---

## 📋 목차

- [프로젝트 개요](#-프로젝트-개요)
- [기술 스택](#-기술 스택)
- [프로젝트 구조](#-프로젝트-구조)
- [시작하기](#-시작하기)
- [Firebase 설정](#-firebase-설정)
- [구현된 기능](#-구현된-기능)
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
- 🚧 프리미엄 구독 모델을 통한 수익화 (개발 중)
- ✅ 사용 통계 및 분석 대시보드 제공

### 프로젝트명
**summarygenie_page**

---

## 🛠 기술 스택

### Frontend
- **Next.js 14** (App Router) - React 프레임워크
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

### 외부 서비스
- **OpenAI API** - AI 요약 엔진
- **Paddle** - 결제 처리 (토스페이먼츠에서 변경)
- **Vercel** - 호스팅 및 배포
- **Resend** - 이메일 발송

---

## 📁 프로젝트 구조

```
summarygenie_page/
├── app/
│   ├── (marketing)/              # 마케팅 페이지
│   │   ├── page.tsx              # 랜딩 페이지
│   │   ├── pricing/page.tsx      # 요금제 페이지
│   │   └── about/page.tsx        # 소개 페이지
│   │
│   ├── (auth)/                   # 인증 페이지
│   │   ├── login/page.tsx        # 로그인
│   │   ├── signup/page.tsx       # 회원가입
│   │   └── forgot-password/page.tsx
│   │
│   ├── (dashboard)/              # 대시보드 (보호된 영역)
│   │   ├── layout.tsx            # 대시보드 레이아웃
│   │   ├── dashboard/page.tsx    # 대시보드 홈 ✅
│   │   ├── history/page.tsx      # 요약 기록
│   │   ├── subscription/page.tsx # 구독 관리
│   │   └── settings/page.tsx     # 설정
│   │
│   ├── api/                      # API Routes
│   │   ├── subscription/
│   │   │   ├── create/route.ts
│   │   │   └── cancel/route.ts
│   │   └── webhooks/
│   │       └── paddle/route.ts
│   │
│   ├── layout.tsx                # 루트 레이아웃
│   └── globals.css               # 전역 스타일
│
├── components/
│   ├── marketing/                # 마케팅 컴포넌트
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   ├── Pricing.tsx
│   │   └── FAQ.tsx
│   │
│   ├── dashboard/                # 대시보드 컴포넌트
│   │   ├── Sidebar.tsx           # 사이드바
│   │   ├── StatsCard.tsx         # 통계 카드 ✅
│   │   ├── UsageChart.tsx        # 사용량 차트 ✅
│   │   ├── RecentHistory.tsx     # 최근 기록 ✅
│   │   ├── EmptyState.tsx        # 빈 상태 UI ✅ (NEW)
│   │   ├── OnboardingGuide.tsx   # 온보딩 가이드 ✅ (NEW)
│   │   ├── HistoryTable.tsx
│   │   ├── HistoryModal.tsx
│   │   ├── SearchBar.tsx
│   │   └── DomainFilter.tsx
│   │
│   ├── payment/                  # 결제 컴포넌트
│   │   ├── PaddleCheckout.tsx
│   │   └── SubscriptionInfo.tsx
│   │
│   └── ui/                       # 공통 UI 컴포넌트
│       ├── button.tsx
│       ├── input.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       └── toast.tsx
│
├── contexts/
│   ├── AuthContext.tsx           # 인증 컨텍스트 ✅
│   ├── PaddleProvider.tsx        # Paddle 프로바이더 ✅
│   └── ThemeProvider.tsx         # 테마 프로바이더
│
├── hooks/
│   ├── useAuth.ts                # 인증 훅 ✅
│   ├── useHistory.ts             # history 조회 훅 ✅
│   ├── useUsageStats.ts          # daily 통계 조회 훅 ✅
│   ├── useSubscription.ts        # 구독 관리 훅 ✅
│   └── useTranslation.ts         # 다국어 훅 ✅
│
├── lib/
│   ├── firebase/
│   │   ├── client.ts             # Firebase 클라이언트 ✅
│   │   ├── admin.ts              # Firebase Admin SDK
│   │   ├── client-queries.ts     # Firestore 쿼리 헬퍼 ✅
│   │   └── types.ts              # Firebase 타입 정의 ✅
│   │
│   ├── paddle/
│   │   └── config.ts             # Paddle 설정 ✅
│   │
│   └── utils.ts                  # 유틸리티 함수
│
├── types/
│   └── index.ts                  # TypeScript 타입 정의
│
├── public/                       # 정적 파일
│   ├── images/
│   └── icons/
│
├── locales/                      # 다국어 파일
│   ├── ko.json                   # 한국어 ✅
│   └── en.json                   # 영어 ✅
│
├── .env.local                    # 환경 변수 (gitignore)
├── .env.example                  # 환경 변수 예시
├── next.config.js                # Next.js 설정
├── tailwind.config.ts            # Tailwind 설정
├── tsconfig.json                 # TypeScript 설정
├── package.json                  # 패키지 정보
└── README.md                     # 프로젝트 문서

✅ = 구현 완료
🚧 = 개발 중
```

---

## 🚀 시작하기

### 1. 저장소 클론

```bash
git clone https://github.com/your-username/summarygenie_page.git
cd summarygenie_page
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
# Firebase (클라이언트)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase (서버 - Admin SDK)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Paddle (결제)
NEXT_PUBLIC_PADDLE_VENDOR_ID=your_vendor_id
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=your_client_token
PADDLE_API_KEY=your_api_key
PADDLE_WEBHOOK_SECRET=your_webhook_secret

# OpenAI (AI 요약)
OPENAI_API_KEY=sk-...

# 기타
NEXT_PUBLIC_BASE_URL=http://localhost:3000
CRON_SECRET=your_cron_secret
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
├── users/{userId}                     # 사용자 최상위 문서
│   ├── id: string                     # 사용자 ID
│   ├── email: string                  # 이메일
│   ├── name: string                   # 이름
│   ├── photoURL?: string              # 프로필 사진
│   ├── isPremium: boolean             # 프리미엄 여부
│   ├── subscriptionPlan: string       # free | pro
│   ├── emailVerified: boolean         # 이메일 인증 여부
│   ├── createdAt: Timestamp           # 가입일
│   └── updatedAt: Timestamp           # 수정일
│
├── users/{userId}/history/{historyId} # 요약 기록 (서브컬렉션) ✅
│   ├── userId: string
│   ├── title: string
│   ├── url?: string
│   ├── content?: string               # 요약 내용
│   ├── summary?: string               # 요약 내용 (동일)
│   ├── createdAt: Timestamp
│   ├── deletedAt?: Timestamp          # 소프트 삭제
│   └── metadata?: {
│       ├── domain?: string
│       └── tags?: string[]
│   }
│
├── users/{userId}/daily/{dailyId}     # 일별 통계 (서브컬렉션) ✅
│   ├── userId: string
│   ├── date: string                   # YYYY-MM-DD
│   ├── count: number                  # 요약 횟수
│   ├── isPremium: boolean
│   └── createdAt: Timestamp
│
└── users/{userId}/subscription/{subId} # 구독 정보 (서브컬렉션) 🚧
    ├── userId: string
    ├── plan: string                   # free | pro
    ├── status: string                 # active | canceled | past_due
    ├── paddleSubscriptionId?: string
    ├── currentPeriodEnd?: Timestamp
    ├── cancelAtPeriodEnd: boolean
    ├── createdAt: Timestamp
    └── updatedAt: Timestamp
```

### Firestore 보안 규칙

**중요:** Firebase Console에서 다음 보안 규칙을 설정하세요.

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // 헬퍼 함수
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // ✅ users 컬렉션 규칙
    match /users/{userId} {
      // 읽기: 본인만
      allow read: if isOwner(userId);
      
      // 생성: 본인만, 유효성 검사
      allow create: if isOwner(userId) && validateUserCreate();
      
      // 수정: 본인만
      allow update: if isOwner(userId);
      
      // 삭제: 본인만
      allow delete: if isOwner(userId);
      
      // ✅ history 서브컬렉션
      match /history/{historyId} {
        allow read: if isOwner(userId);
        allow write: if isOwner(userId);
      }
      
      // ✅ daily 서브컬렉션
      match /daily/{dailyId} {
        allow read: if isOwner(userId);
        allow write: if isOwner(userId);
      }
      
      // ✅ subscription 서브컬렉션
      match /subscription/{subscriptionId} {
        allow read: if isOwner(userId);
        allow write: if isOwner(userId);
      }
    }
    
    // 유효성 검사 함수
    function validateUserCreate() {
      let data = request.resource.data;
      return data.keys().hasAll(['email', 'createdAt', 'updatedAt']) &&
             (!data.keys().hasAny(['id']) || data.id == request.auth.uid) &&
             data.email is string &&
             data.email == request.auth.token.email;
    }
  }
}
```

### Firestore 인덱스

다음 복합 인덱스가 필요합니다:

1. **daily 컬렉션 (날짜 범위 조회)**
   - Collection: `users/{userId}/daily`
   - Fields: `date` (Ascending)
   - Query scope: Collection

인덱스 생성 방법:
- Firebase Console → Firestore → Indexes
- 또는 에러 발생 시 콘솔에 표시되는 링크 클릭

---

## ✅ 구현된 기능

### 인증 (Authentication)
- ✅ 이메일/비밀번호 회원가입 및 로그인
- ✅ Google 소셜 로그인
- ✅ 비밀번호 재설정
- ✅ 이메일 인증
- ✅ 자동 로그인 (세션 유지)
- ✅ 사용자 프로필 자동 생성

### 대시보드
- ✅ 실시간 사용량 통계
  - 이번 달 사용량
  - 총 요약 기록
  - 최근 7일 통계
- ✅ 사용량 차트 (recharts)
  - 최근 7일 막대 그래프
  - 빈 데이터 처리
- ✅ 최근 요약 5개 표시
- ✅ 빈 상태 UI (EmptyState)
- ✅ 온보딩 가이드 (첫 사용자)
- ✅ Pro 업그레이드 배너 (Free 사용자)

### 요약 기록 관리
- ✅ 무한 스크롤 (useSWRInfinite)
- ✅ 검색 기능 (title, content)
- ✅ 도메인 필터링
- ✅ 소프트 삭제 (deletedAt)
- 🚧 상세 모달
- 🚧 복사 기능

### 구독 관리 (Paddle)
- ✅ Paddle Provider 설정
- ✅ 샌드박스 모드
- 🚧 Pro 플랜 구독
- 🚧 구독 취소
- 🚧 결제 수단 관리

### 설정
- 🚧 프로필 편집
- 🚧 비밀번호 변경
- 🚧 알림 설정
- 🚧 통계 상세 페이지

### 다국어 (i18n)
- ✅ 한국어 (기본)
- ✅ 영어
- ✅ useTranslation 훅

---

## 🐛 해결된 주요 이슈

### 1. Firebase 권한 오류 ✅

**문제:**
```
FirebaseError: Missing or insufficient permissions
```

**원인:**
- 사용자 프로필 자동 생성 로직 부재
- Firestore 보안 규칙이 엄격함

**해결:**
- `ensureUserProfile()` 함수 추가 (`lib/firebase/client-queries.ts`)
- 로그인 시 자동으로 users/{userId} 문서 생성
- Firestore 규칙에서 `id` 필드를 선택사항으로 변경

**관련 파일:**
- `lib/firebase/client-queries.ts`
- `contexts/AuthContext.tsx`
- `firestore.rules`

---

### 2. 대시보드 데이터 미표시 문제 ✅

**문제:**
- 콘솔에는 `✅ Daily stats loaded` 표시
- 화면에는 데이터 없음

**원인:**
```typescript
// ❌ Firestore 쿼리
where('deletedAt', '==', null)
```
- Chrome 확장에서 생성한 문서는 `deletedAt` 필드 자체가 없음
- Firestore는 필드가 존재하고 값이 null인 문서만 반환

**해결:**
```typescript
// ✅ 쿼리에서 where 조건 제거
// 클라이언트 사이드에서 필터링
results = results.filter((item) => !item.deletedAt);
```

**관련 파일:**
- `hooks/useHistory.ts`
- `hooks/useUsageStats.ts`

---

### 3. 무한 로딩 스켈레톤 문제 ✅

**문제:**
- 콘솔: `✅ Valid history count: 0`
- 화면: 통계 카드가 무한 로딩

**원인:**
```typescript
// ❌ loading 로직 버그
loading: !data && !error

// data = 0일 때:
!0 = true → loading: true (무한 로딩!)
```

**해결:**
```typescript
// ✅ 수정된 로직
loading: typeof data === 'undefined' && !error

// data = 0일 때:
typeof 0 === 'undefined' = false → loading: false
```

**관련 파일:**
- `hooks/useHistory.ts` (useHistoryCount 함수)

---

### 4. 빈 상태 UI 개선 ✅

**문제:**
- 데이터 없을 때 사용자가 무엇을 해야 할지 모름
- "0회"만 표시되어 직관적이지 않음

**해결:**
- `EmptyState` 컴포넌트 추가 (재사용 가능)
- `OnboardingGuide` 컴포넌트 추가 (첫 사용자용)
- 4단계 온보딩 카드
  1. Chrome 확장 설치
  2. 페이지 요약
  3. 기록 확인
  4. Pro 업그레이드

**관련 파일:**
- `components/dashboard/EmptyState.tsx`
- `components/dashboard/OnboardingGuide.tsx`
- `components/dashboard/StatsCard.tsx`
- `app/(dashboard)/dashboard/page.tsx`

---

### 5. Firestore 인덱스 에러 ✅

**문제:**
```
The query requires an index
```

**원인:**
- `daily` 컬렉션에서 날짜 범위 조회 시 복합 인덱스 필요

**해결:**
- Firebase Console → Firestore → Indexes
- 에러 메시지의 링크를 통해 자동 생성
- 또는 수동으로 인덱스 추가

**인덱스:**
- Collection: `users/{userId}/daily`
- Fields: `date` (Ascending)

---

## 📚 개발 가이드

### 컴포넌트 작성 규칙

1. **파일명**: PascalCase (예: `StatsCard.tsx`)
2. **컴포넌트명**: 파일명과 동일
3. **Props 타입**: `ComponentNameProps` 인터페이스로 정의
4. **기본 export**: 하나의 컴포넌트만

```typescript
// ✅ 좋은 예
interface StatsCardProps {
  title: string;
  value: number;
  loading?: boolean;
}

export default function StatsCard({ title, value, loading }: StatsCardProps) {
  // ...
}
```

### Hooks 작성 규칙

1. **파일명**: camelCase, use로 시작 (예: `useHistory.ts`)
2. **반환 타입**: 명시적으로 정의
3. **에러 핸들링**: try-catch 사용
4. **로딩 상태**: `typeof data === 'undefined'` 사용

```typescript
// ✅ 좋은 예
export function useHistoryCount(userId: string | null) {
  const { data, error } = useSWR<number, Error>(
    userId ? ['history-count', userId] : null,
    async () => {
      try {
        // ... 로직
        return count;
      } catch (err) {
        console.error('Error:', err);
        return 0; // 기본값 반환
      }
    }
  );

  return {
    count: data ?? 0,
    loading: typeof data === 'undefined' && !error, // ✅
    error: error || null,
  };
}
```

### Firestore 쿼리 작성 규칙

1. **경로**: 서브컬렉션 구조 사용
2. **필터링**: 클라이언트 사이드에서 처리 (where 최소화)
3. **로깅**: 상세한 로그 추가
4. **에러 처리**: 항상 try-catch 사용

```typescript
// ✅ 좋은 예
try {
  console.log('🔍 Querying:', { userId, path });
  
  const historyRef = collection(db, 'users', userId, 'history');
  const q = query(historyRef, orderBy('createdAt', 'desc'));
  
  const snapshot = await getDocs(q);
  
  // ✅ 클라이언트 사이드 필터링
  const results = snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(item => !item.deletedAt);
  
  console.log('✅ Query success:', { count: results.length });
  
  return results;
} catch (err) {
  console.error('❌ Query failed:', err);
  throw err;
}
```

### SWR 설정 규칙

1. **키**: 배열 형태, 의존성 포함
2. **재검증**: 기본적으로 비활성화
3. **에러 재시도**: 비활성화
4. **에러 핸들러**: 항상 추가

```typescript
// ✅ 좋은 예
const { data, error } = useSWR(
  userId ? ['key', userId, ...deps] : null,
  fetcher,
  {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: false,
    onError: (err) => console.error('SWR error:', err),
  }
);
```

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

3. **빌드 & 배포**
   ```bash
   npx vercel --prod
   ```

### 배포 전 체크리스트

- [ ] 환경 변수 설정 완료
- [ ] Firebase 보안 규칙 배포
- [ ] Firestore 인덱스 생성
- [ ] 프로덕션 도메인 허용 (Firebase, Paddle)
- [ ] SEO 메타태그 확인
- [ ] 에러 모니터링 설정 (Sentry 등)

---

## 📊 프로젝트 현황

### 완료된 기능 (✅)
- [x] Firebase 연동
- [x] 사용자 인증 (Email, Google)
- [x] 대시보드 홈
- [x] 사용량 통계
- [x] 요약 기록 조회
- [x] 무한 스크롤
- [x] 검색 및 필터링
- [x] 빈 상태 UI
- [x] 온보딩 가이드
- [x] 다국어 (한/영)
- [x] Paddle 연동 준비

### 개발 중 (🚧)
- [ ] 요약 기록 상세 모달
- [ ] Pro 플랜 구독
- [ ] 구독 취소
- [ ] 결제 내역
- [ ] 프로필 편집
- [ ] 설정 페이지
- [ ] 이메일 알림

### 계획 중 (📝)
- [ ] 팀 플랜
- [ ] API 제공
- [ ] Chrome 확장 개선
- [ ] 모바일 앱

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

- Email: support@summarygenie.com
- Website: https://summarygenie.com
- GitHub: https://github.com/your-username/summarygenie_page

---

## 🙏 감사의 말

- [Next.js](https://nextjs.org/) - React 프레임워크
- [Firebase](https://firebase.google.com/) - 백엔드 서비스
- [Tailwind CSS](https://tailwindcss.com/) - CSS 프레임워크
- [Shadcn/ui](https://ui.shadcn.com/) - UI 컴포넌트
- [SWR](https://swr.vercel.app/) - 데이터 페칭
- [Paddle](https://paddle.com/) - 결제 플랫폼

---

**Last Updated:** 2025년 12월 1일  
**Version:** 1.0.0  
**Status:** 🚀 Active Development