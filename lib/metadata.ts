// lib/metadata.ts
import { Metadata } from 'next';

/**
 * 기본 메타데이터 설정
 */
const defaultMetadata = {
  siteName: 'SummaryGenie',
  title: 'SummaryGenie - AI 웹페이지 요약',
  description: '웹 서핑 시간은 절반으로, 정보의 깊이는 두 배로. AI 기반 웹페이지 요약 서비스로 효율적인 정보 습득을 경험하세요.',
  keywords: [
    'AI 요약',
    '웹페이지 요약',
    '크롬 확장프로그램',
    'ChatGPT',
    '생산성',
    '요약 서비스',
    '한국어 요약',
    '정보 요약',
    '자동 요약',
    '문서 요약',
  ],
  ogImage: '/og-image.png',
  twitterHandle: '@summarygenie',
  locale: 'ko_KR',
  type: 'website' as const,
};

interface MetadataOptions {
  title?: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article'; // Next.js는 'product' 타입을 지원하지 않음
  noIndex?: boolean;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

/**
 * 페이지별 메타데이터 생성 헬퍼 함수
 * 
 * @example
 * // app/pricing/page.tsx
 * export const metadata = generateMetadata({
 *   title: '요금제',
 *   description: 'SummaryGenie의 요금제를 확인하세요',
 *   canonical: '/pricing',
 * });
 */
export function generateMetadata(options: MetadataOptions = {}): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://summarygenie.app';
  
  const {
    title = defaultMetadata.title,
    description = defaultMetadata.description,
    keywords = defaultMetadata.keywords,
    canonical,
    ogImage = defaultMetadata.ogImage,
    ogType = 'website', // 기본값을 'website'로 변경
    noIndex = false,
    author,
    publishedTime,
    modifiedTime,
  } = options;

  // 전체 제목 생성
  const fullTitle = title === defaultMetadata.title 
    ? title 
    : `${title} | ${defaultMetadata.siteName}`;

  // OG 이미지 URL 생성
  const ogImageUrl = ogImage.startsWith('http') 
    ? ogImage 
    : `${baseUrl}${ogImage}`;

  // Canonical URL 생성
  const canonicalUrl = canonical 
    ? `${baseUrl}${canonical}` 
    : baseUrl;

  const metadata: Metadata = {
    title: fullTitle,
    description,
    keywords,
    authors: author ? [{ name: author }] : [{ name: defaultMetadata.siteName }],
    
    alternates: {
      canonical: canonicalUrl,
    },

    openGraph: {
      title: fullTitle,
      description,
      type: ogType,
      locale: defaultMetadata.locale,
      url: canonicalUrl,
      siteName: defaultMetadata.siteName,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },

    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImageUrl],
      creator: defaultMetadata.twitterHandle,
    },

    robots: noIndex 
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
  };

  return metadata;
}

/**
 * 블로그/아티클용 메타데이터 생성
 */
export function generateArticleMetadata(options: {
  title: string;
  description: string;
  author: string;
  publishedTime: string;
  modifiedTime?: string;
  tags?: string[];
  section?: string;
  ogImage?: string;
  canonical?: string;
}): Metadata {
  return generateMetadata({
    ...options,
    ogType: 'article',
    keywords: options.tags,
  });
}

/**
 * 상품(구독) 페이지용 메타데이터 생성
 * 
 * 참고: Next.js OpenGraph는 'product' 타입을 지원하지 않으므로
 * 'website'를 사용하고, 상품 정보는 JSON-LD로 제공합니다.
 */
export function generateProductMetadata(options: {
  title: string;
  description: string;
  price?: string;
  currency?: string;
  availability?: string;
  ogImage?: string;
  canonical?: string;
}): Metadata {
  // OpenGraph는 'website' 타입 사용 (product는 지원 안 함)
  return generateMetadata({
    ...options,
    ogType: 'website', // 'product' 대신 'website' 사용
    // 실제 상품 정보는 getProductSchema()의 JSON-LD로 제공
  });
}

/**
 * 대시보드/비공개 페이지용 메타데이터
 */
export function generatePrivateMetadata(title: string): Metadata {
  return generateMetadata({
    title,
    description: 'SummaryGenie 대시보드',
    noIndex: true, // 검색 엔진에 노출하지 않음
  });
}

/**
 * JSON-LD 스키마 생성 (구조화된 데이터)
 */
export function generateJsonLd(data: Record<string, any>): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Organization Schema (회사 정보)
 */
export function getOrganizationSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://summarygenie.app';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'SummaryGenie',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: defaultMetadata.description,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'support@summarygenie.com',
      availableLanguage: ['Korean', 'English'],
    },
    sameAs: [
      // 소셜 미디어 링크 (있다면 추가)
      // 'https://twitter.com/summarygenie',
      // 'https://www.facebook.com/summarygenie',
      // 'https://www.linkedin.com/company/summarygenie',
    ],
  };
}

/**
 * WebApplication Schema (웹 애플리케이션)
 */
export function getWebApplicationSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://summarygenie.app';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'SummaryGenie',
    url: baseUrl,
    applicationCategory: 'ProductivityApplication',
    operatingSystem: 'Any',
    description: defaultMetadata.description,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'KRW',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1234',
      bestRating: '5',
      worstRating: '1',
    },
  };
}

/**
 * Product Schema (Pro 구독)
 */
export function getProductSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://summarygenie.app';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'SummaryGenie Pro',
    description: '무제한 AI 요약, 고성능 요약 엔진, 우선 지원',
    image: `${baseUrl}/og-image.png`,
    brand: {
      '@type': 'Brand',
      name: 'SummaryGenie',
    },
    offers: {
      '@type': 'Offer',
      price: '9900',
      priceCurrency: 'KRW',
      availability: 'https://schema.org/InStock',
      url: `${baseUrl}/pricing`,
      priceValidUntil: '2025-12-31',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '856',
      bestRating: '5',
      worstRating: '1',
    },
  };
}

/**
 * BreadcrumbList Schema (빵 부스러기)
 */
export function getBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://summarygenie.app';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`,
    })),
  };
}

/**
 * FAQ Schema (자주 묻는 질문)
 */
export function getFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}