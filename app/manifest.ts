// app/manifest.ts
import { MetadataRoute } from 'next';

/**
 * PWA 매니페스트 자동 생성
 * 모바일 기기에서 앱처럼 설치 가능
 * URL: https://your-domain.com/manifest.json
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SummaryGenie - AI 웹페이지 요약',
    short_name: 'SummaryGenie',
    description: '웹 서핑 시간은 절반으로, 정보의 깊이는 두 배로. AI 기반 웹페이지 요약 서비스',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#3b82f6',
    orientation: 'portrait-primary',
    scope: '/',
    lang: 'ko-KR',
    dir: 'ltr',
    categories: ['productivity', 'utilities', 'education'],
    
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    
    screenshots: [
      {
        src: '/screenshots/desktop-1.png',
        sizes: '1280x720',
        type: 'image/png',
        form_factor: 'wide',
        label: 'SummaryGenie Dashboard',
      },
      {
        src: '/screenshots/mobile-1.png',
        sizes: '750x1334',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'SummaryGenie Mobile',
      },
    ],
    
    shortcuts: [
      {
        name: '대시보드',
        short_name: '대시보드',
        description: '요약 기록 대시보드 보기',
        url: '/dashboard',
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
        ],
      },
      {
        name: '요약 기록',
        short_name: '기록',
        description: '요약 기록 보기',
        url: '/history',
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
        ],
      },
    ],
    
    // 추가 PWA 기능
    prefer_related_applications: false,
  };
}