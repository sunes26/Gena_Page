// app/sitemap.ts
import { MetadataRoute } from 'next';

/**
 * 동적 사이트맵 생성 (다국어 지원)
 * Google Search Console에서 자동으로 인식
 * URL: https://your-domain.com/sitemap.xml
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gena.app';
  const currentDate = new Date();

  // 정적 페이지 경로들
  const pageConfigs = [
    { path: '/', changeFrequency: 'daily' as const, priority: 1.0 },
    { path: '/pricing', changeFrequency: 'weekly' as const, priority: 0.8 },
    { path: '/privacy', changeFrequency: 'monthly' as const, priority: 0.5 },
    { path: '/terms', changeFrequency: 'monthly' as const, priority: 0.5 },
    { path: '/login', changeFrequency: 'monthly' as const, priority: 0.4 },
    { path: '/signup', changeFrequency: 'monthly' as const, priority: 0.4 },
  ];

  // 각 페이지에 대해 언어별 URL 생성
  const sitemapEntries: MetadataRoute.Sitemap = [];

  pageConfigs.forEach((config) => {
    const { path, changeFrequency, priority } = config;

    // 한국어 URL (기본)
    sitemapEntries.push({
      url: `${baseUrl}${path}`,
      lastModified: currentDate,
      changeFrequency,
      priority,
      alternates: {
        languages: {
          ko: `${baseUrl}${path}`,
          en: `${baseUrl}${path}${path.includes('?') ? '&' : '?'}lang=en`,
        },
      },
    });

    // 영어 URL도 별도 엔트리로 추가
    sitemapEntries.push({
      url: `${baseUrl}${path}${path.includes('?') ? '&' : '?'}lang=en`,
      lastModified: currentDate,
      changeFrequency,
      priority: priority * 0.9, // 영어 버전은 우선순위 약간 낮춤
      alternates: {
        languages: {
          ko: `${baseUrl}${path}`,
          en: `${baseUrl}${path}${path.includes('?') ? '&' : '?'}lang=en`,
        },
      },
    });
  });

  // 대시보드 페이지들 (noindex)
  // 참고: 실제로는 robots.txt에서 차단하지만 사이트맵에서도 제외
  // const dashboardPages = [
  //   '/dashboard',
  //   '/history',
  //   '/subscription',
  //   '/settings',
  // ];

  return sitemapEntries;
}