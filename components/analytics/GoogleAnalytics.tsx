// components/analytics/GoogleAnalytics.tsx
'use client';

import Script from 'next/script';
import { useEffect } from 'react';

/**
 * Google Analytics 4 (GA4) 컴포넌트
 *
 * 사용법:
 * 1. Google Analytics 계정에서 측정 ID 발급 (G-XXXXXXXXXX)
 * 2. .env.local에 NEXT_PUBLIC_GA_MEASUREMENT_ID 추가
 * 3. app/layout.tsx에서 이 컴포넌트 import
 */

export default function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  // 개발 환경에서 GA4 로딩 상태 확인
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.info('[GA4] Measurement ID:', measurementId || 'Not set');
    }
  }, [measurementId]);

  // 측정 ID가 없으면 렌더링하지 않음
  if (!measurementId) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[GA4] NEXT_PUBLIC_GA_MEASUREMENT_ID is not set');
    }
    return null;
  }

  return (
    <>
      {/* Google Analytics 스크립트 */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
        onLoad={() => {
          if (process.env.NODE_ENV === 'development') {
            console.info('[GA4] Script loaded successfully');
          }
        }}
        onError={(e) => {
          console.error('[GA4] Failed to load script:', e);
        }}
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${measurementId}', {
            page_path: window.location.pathname,
            send_page_view: true
          });

          // 개발 환경에서 설정 확인
          if ('${process.env.NODE_ENV}' === 'development') {
            console.info('[GA4] Configured with ID: ${measurementId}');
            console.info('[GA4] Page path:', window.location.pathname);
          }
        `}
      </Script>
    </>
  );
}
