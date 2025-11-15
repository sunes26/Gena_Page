// app/robots.ts
import { MetadataRoute } from 'next';

/**
 * robots.txt 자동 생성
 * 검색 엔진 크롤러에게 크롤링 규칙 제공
 * URL: https://your-domain.com/robots.txt
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://summarygenie.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/*',      // 대시보드 크롤링 금지
          '/api/*',            // API 엔드포인트 크롤링 금지
          '/history/*',        // 기록 페이지 크롤링 금지
          '/subscription/*',   // 구독 페이지 크롤링 금지
          '/settings/*',       // 설정 페이지 크롤링 금지
          '/_next/*',          // Next.js 내부 파일 금지
          '/admin/*',          // 관리자 페이지 금지 (있다면)
        ],
      },
      {
        // Googlebot은 JavaScript를 실행할 수 있으므로 추가 규칙
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/dashboard/*',
          '/api/*',
          '/history/*',
          '/subscription/*',
          '/settings/*',
        ],
      },
      {
        // Bing Bot
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/dashboard/*',
          '/api/*',
          '/history/*',
          '/subscription/*',
          '/settings/*',
        ],
      },
      {
        // Naver Bot (한국 검색 엔진)
        userAgent: 'Yeti',
        allow: '/',
        disallow: [
          '/dashboard/*',
          '/api/*',
          '/history/*',
          '/subscription/*',
          '/settings/*',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}