// lib/metadata.ts
import { Metadata } from 'next';
import {
  Locale,
  defaultMetadataByLocale,
  getOGLocale,
  getAlternateLocales
} from './i18n-metadata';

/**
 * 기본 메타데이터 설정
 */
const defaultMetadata = {
  siteName: 'Gena',
  ogImage: '/og-image.png',
  twitterHandle: '@gena',
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
  locale?: Locale; // 언어 코드 (ko, en)
}

/**
 * 페이지별 메타데이터 생성 헬퍼 함수
 *
 * @example
 * // app/pricing/page.tsx
 * export const metadata = generateMetadata({
 *   title: '요금제',
 *   description: 'Gena의 요금제를 확인하세요',
 *   canonical: '/pricing',
 *   locale: 'ko',
 * });
 */
export function generateMetadata(options: MetadataOptions = {}): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gena.app';

  // locale 기본값 설정
  const locale = options.locale || 'ko';
  const localeDefaults = defaultMetadataByLocale[locale];

  const {
    title = localeDefaults.title,
    description = localeDefaults.description,
    keywords = localeDefaults.keywords || [],
    canonical,
    ogImage = defaultMetadata.ogImage,
    ogType = 'website',
    noIndex = false,
    author,
    publishedTime,
    modifiedTime,
  } = options;

  // 전체 제목 생성
  const fullTitle = title === localeDefaults.title
    ? title
    : `${title} | ${defaultMetadata.siteName}`;

  // OG 이미지 URL 생성
  const ogImageUrl = ogImage.startsWith('http')
    ? ogImage
    : `${baseUrl}${ogImage}`;

  // Canonical URL 생성 (언어 파라미터 포함)
  const canonicalPath = canonical || '/';
  const canonicalUrl = locale === 'ko'
    ? `${baseUrl}${canonicalPath}`
    : `${baseUrl}${canonicalPath}${canonicalPath.includes('?') ? '&' : '?'}lang=${locale}`;

  // 대체 언어 URL 생성 (hreflang용)
  const alternateLocales = getAlternateLocales(locale);
  const languages: Record<string, string> = {
    'x-default': `${baseUrl}${canonicalPath}`, // 기본은 한국어
  };

  // 현재 언어 추가
  languages[locale] = canonicalUrl;

  // 대체 언어들 추가
  alternateLocales.forEach(altLocale => {
    const altUrl = altLocale === 'ko'
      ? `${baseUrl}${canonicalPath}`
      : `${baseUrl}${canonicalPath}${canonicalPath.includes('?') ? '&' : '?'}lang=${altLocale}`;
    languages[altLocale] = altUrl;
  });

  const metadata: Metadata = {
    title: fullTitle,
    description,
    keywords,
    authors: author ? [{ name: author }] : [{ name: defaultMetadata.siteName }],

    alternates: {
      canonical: canonicalUrl,
      languages, // hreflang 태그
    },

    openGraph: {
      title: fullTitle,
      description,
      type: ogType,
      locale: getOGLocale(locale),
      alternateLocale: alternateLocales.map(getOGLocale), // OG locale alternates
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
  locale?: Locale;
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
  locale?: Locale;
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
export function generatePrivateMetadata(title: string, locale?: Locale): Metadata {
  const description = locale === 'en' ? 'Gena Dashboard' : 'Gena 대시보드';
  return generateMetadata({
    title,
    description,
    noIndex: true, // 검색 엔진에 노출하지 않음
    locale,
  });
}

/**
 * JSON-LD 스키마 생성 (구조화된 데이터)
 */
export function generateJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Organization Schema (회사 정보)
 */
export function getOrganizationSchema(locale: Locale = 'ko') {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gena.app';
  const description = defaultMetadataByLocale[locale].description;

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'gena',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'oceancode0321@gmail.com',
      availableLanguage: ['Korean', 'English'],
    },
    sameAs: [
      // 소셜 미디어 링크 (있다면 추가)
      // 'https://twitter.com/Gena',
      // 'https://www.facebook.com/Gena',
      // 'https://www.linkedin.com/company/Gena',
    ],
  };
}

/**
 * WebApplication Schema (웹 애플리케이션)
 */
export function getWebApplicationSchema(locale: Locale = 'ko') {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gena.app';
  const description = defaultMetadataByLocale[locale].description;

  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Gena',
    url: baseUrl,
    applicationCategory: 'ProductivityApplication',
    operatingSystem: 'Any',
    description,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'KRW',
    },
    // aggregateRating: 실제 평점 데이터가 수집되면 추가
    // {
    //   '@type': 'AggregateRating',
    //   ratingValue: '4.8',
    //   ratingCount: '1234',
    //   bestRating: '5',
    //   worstRating: '1',
    // },
  };
}

/**
 * Product Schema (Pro 구독)
 */
export function getProductSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gena.app';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Gena Pro',
    description: '무제한 AI 요약, 고성능 요약 엔진, 우선 지원',
    image: `${baseUrl}/og-image.png`,
    brand: {
      '@type': 'Brand',
      name: 'Gena',
    },
    offers: {
      '@type': 'Offer',
      price: '9900',
      priceCurrency: 'KRW',
      availability: 'https://schema.org/InStock',
      url: `${baseUrl}/pricing`,
      priceValidUntil: '2025-12-31',
    },
    // aggregateRating: 실제 리뷰 데이터가 수집되면 추가
    // {
    //   '@type': 'AggregateRating',
    //   ratingValue: '4.9',
    //   reviewCount: '856',
    //   bestRating: '5',
    //   worstRating: '1',
    // },
  };
}

/**
 * BreadcrumbList Schema (빵 부스러기)
 */
export function getBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gena.app';
  
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