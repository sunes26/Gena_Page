# Service Worker & PWA 오프라인 지원 가이드

## 📋 개요

Service Worker를 통해 앱을 오프라인에서도 사용 가능하게 만들고, 캐싱 전략을 구현할 수 있습니다.

**현재 상태:**
- ✅ PWA Manifest 설정 완료 (`app/manifest.ts`)
- ⚠️  Service Worker 미구현
- ⚠️  PWA 아이콘 미생성 (`ICONS_NEEDED.md` 참고)

**Service Worker 주요 기능:**
1. 오프라인 지원 (Offline fallback page)
2. 정적 파일 캐싱 (CSS, JS, 이미지)
3. API 응답 캐싱 (선택적)
4. 백그라운드 동기화

---

## 옵션 1: Workbox 사용 (권장)

Google의 Workbox는 Service Worker 구현을 간단하게 만들어줍니다.

### 설치

```bash
npm install next-pwa workbox-window
```

### next.config.ts 수정

```typescript
import withPWA from 'next-pwa';

const nextConfig: NextConfig = {
  // ... 기존 설정
};

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // 개발 환경에서는 비활성화
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-webfonts',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1년
        },
      },
    },
    {
      urlPattern: /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'google-fonts-stylesheets',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 1주
        },
      },
    },
    {
      urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-font-assets',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 1주
        },
      },
    },
    {
      urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-image-assets',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60, // 1일
        },
      },
    },
    {
      urlPattern: /\/_next\/image\?url=.+$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'next-image',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60, // 1일
        },
      },
    },
    {
      urlPattern: /\.(?:mp3|wav|ogg)$/i,
      handler: 'CacheFirst',
      options: {
        rangeRequests: true,
        cacheName: 'static-audio-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 1일
        },
      },
    },
    {
      urlPattern: /\.(?:mp4)$/i,
      handler: 'CacheFirst',
      options: {
        rangeRequests: true,
        cacheName: 'static-video-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 1일
        },
      },
    },
    {
      urlPattern: /\.(?:js)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-js-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 1일
        },
      },
    },
    {
      urlPattern: /\.(?:css|less)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-style-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 1일
        },
      },
    },
    {
      urlPattern: /\/_next\/data\/.+\/.+\.json$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'next-data',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 1일
        },
      },
    },
    {
      urlPattern: /\/api\/.*$/i,
      handler: 'NetworkFirst',
      method: 'GET',
      options: {
        cacheName: 'apis',
        expiration: {
          maxEntries: 16,
          maxAgeSeconds: 24 * 60 * 60, // 1일
        },
        networkTimeoutSeconds: 10, // 10초 후 캐시 사용
      },
    },
    {
      urlPattern: /.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'others',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 1일
        },
        networkTimeoutSeconds: 10,
      },
    },
  ],
})(nextConfig);
```

### 오프라인 페이지 생성

`app/offline/page.tsx`:

```typescript
export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">오프라인</h1>
        <p className="text-gray-600 mb-4">
          인터넷 연결을 확인해주세요.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}
```

---

## 옵션 2: 수동 구현 (고급)

더 세밀한 제어가 필요한 경우 직접 구현:

### public/sw.js

```javascript
const CACHE_NAME = 'gena-v1';
const OFFLINE_URL = '/offline';

// 캐시할 정적 파일
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/images/logo.png',
  // 추가 정적 파일
];

// Install 이벤트
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate 이벤트
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch 이벤트
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL);
      })
    );
  } else {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});
```

### Service Worker 등록

`app/layout.tsx`:

```typescript
useEffect(() => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('SW registered:', registration);
      })
      .catch((error) => {
        console.error('SW registration failed:', error);
      });
  }
}, []);
```

---

## PWA 설치 프롬프트

### 커스텀 설치 버튼

```typescript
'use client';

import { useState, useEffect } from 'react';

export function InstallPWA() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // 이미 설치되었는지 확인
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;

    installPrompt.prompt();
    const result = await installPrompt.userChoice;

    if (result.outcome === 'accepted') {
      setIsInstalled(true);
    }

    setInstallPrompt(null);
  };

  if (isInstalled || !installPrompt) return null;

  return (
    <button
      onClick={handleInstall}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg"
    >
      앱 설치
    </button>
  );
}
```

---

## 테스트

### 1. Lighthouse PWA Audit

```bash
npm run build
npm run start
```

Chrome DevTools → Lighthouse → PWA 카테고리 실행

### 2. 오프라인 테스트

1. 앱 실행
2. DevTools → Application → Service Workers
3. "Offline" 체크박스 활성화
4. 페이지 새로고침

### 3. 설치 테스트

1. Chrome 주소창 오른쪽 설치 아이콘 클릭
2. 또는 메뉴 → "Install Gena" 클릭

---

## 체크리스트

- [ ] Workbox 설치 또는 수동 Service Worker 구현
- [ ] 오프라인 페이지 생성
- [ ] PWA 아이콘 생성 (`ICONS_NEEDED.md` 참고)
- [ ] Service Worker 등록
- [ ] 캐싱 전략 설정
- [ ] Lighthouse PWA audit 통과 (90점 이상)
- [ ] 오프라인 테스트 완료
- [ ] 모바일에서 설치 테스트

---

**설정 난이도**: ⭐⭐⭐☆☆ (중간)
**예상 소요 시간**: 2-3시간
**우선순위**: 🟢 Low (PWA 완성도를 높이고 싶을 때)
**참고**: PWA는 선택사항이며, 기본 웹앱으로도 충분히 작동합니다.
