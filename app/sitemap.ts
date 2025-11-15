// app/sitemap.ts
import { MetadataRoute } from 'next';

/**
 * 동적 사이트맵 생성
 * Google Search Console에서 자동으로 인식
 * URL: https://your-domain.com/sitemap.xml
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://summarygenie.app';
  const currentDate = new Date();

  // 정적 페이지들
  const staticPages = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
  ];

  // 대시보드 페이지들 (noindex)
  // 참고: 실제로는 robots.txt에서 차단하지만 사이트맵에서도 제외
  // const dashboardPages = [
  //   '/dashboard',
  //   '/history',
  //   '/subscription',
  //   '/settings',
  // ];

  return staticPages;
}