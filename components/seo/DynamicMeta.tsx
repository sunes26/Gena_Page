// components/seo/DynamicMeta.tsx
'use client';

import Head from 'next/head';
import { useEffect } from 'react';

/**
 * 클라이언트 컴포넌트에서 동적으로 메타 태그를 설정하는 컴포넌트
 * 
 * 참고: Next.js 14 App Router에서는 이 방법보다
 * 서버 컴포넌트의 metadata export를 사용하는 것이 권장됩니다.
 * 
 * 하지만 'use client'를 사용하는 페이지에서는
 * 이 컴포넌트를 사용하여 메타데이터를 설정할 수 있습니다.
 * 
 * @example
 * <DynamicMeta
 *   title="로그인 | SummaryGenie"
 *   description="SummaryGenie에 로그인하세요"
 * />
 */

interface DynamicMetaProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  noIndex?: boolean;
}

export default function DynamicMeta({
  title,
  description,
  keywords,
  ogTitle,
  ogDescription,
  ogImage,
  noIndex = false,
}: DynamicMetaProps) {
  useEffect(() => {
    // 제목 설정
    if (title) {
      document.title = title;
    }

    // 메타 태그 설정
    const updateMetaTag = (name: string, content: string, property?: boolean) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector);
      
      if (!meta) {
        meta = document.createElement('meta');
        if (property) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };

    if (description) {
      updateMetaTag('description', description);
      updateMetaTag('og:description', description, true);
    }

    if (keywords) {
      updateMetaTag('keywords', keywords);
    }

    if (ogTitle || title) {
      updateMetaTag('og:title', ogTitle || title || '', true);
    }

    if (ogDescription || description) {
      updateMetaTag('og:description', ogDescription || description || '', true);
    }

    if (ogImage) {
      updateMetaTag('og:image', ogImage, true);
    }

    if (noIndex) {
      updateMetaTag('robots', 'noindex, nofollow');
    }

    // Cleanup
    return () => {
      // 메타 태그는 남겨둠 (다른 페이지로 이동 시 덮어씌워짐)
    };
  }, [title, description, keywords, ogTitle, ogDescription, ogImage, noIndex]);

  return null; // 렌더링할 내용 없음
}