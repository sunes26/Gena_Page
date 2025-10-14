// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Noto_Sans_KR } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/components/ui/toast';

// Noto Sans KR 폰트 설정
const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-noto-sans-kr',
});

// Viewport 설정
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0A192F' },
  ],
};

// SEO 최적화 메타데이터
export const metadata: Metadata = {
  title: {
    default: 'SummaryGenie - AI 웹페이지 요약',
    template: '%s | SummaryGenie',
  },
  description: '웹 서핑 시간은 절반으로, 정보의 깊이는 두 배로. AI 기반 웹페이지 요약 서비스로 효율적인 정보 습득을 경험하세요.',
  keywords: [
    'AI 요약',
    '웹페이지 요약',
    '크롬 확장프로그램',
    'ChatGPT',
    '생산성',
    '요약 서비스',
    '한국어 요약',
  ],
  authors: [{ name: 'SummaryGenie' }],
  creator: 'SummaryGenie',
  publisher: 'SummaryGenie',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://summarygenie.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'SummaryGenie - AI 웹페이지 요약',
    description: '웹 서핑 시간은 절반으로, 정보의 깊이는 두 배로',
    type: 'website',
    locale: 'ko_KR',
    url: '/',
    siteName: 'SummaryGenie',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SummaryGenie - AI 웹페이지 요약',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SummaryGenie - AI 웹페이지 요약',
    description: '웹 서핑 시간은 절반으로, 정보의 깊이는 두 배로',
    images: ['/og-image.png'],
  },
  robots: {
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
  verification: {
    // Google Search Console 인증 코드 (실제 배포 시 추가)
    // google: 'your-google-verification-code',
    // Naver Search Advisor 인증 코드 (실제 배포 시 추가)
    // other: {
    //   'naver-site-verification': 'your-naver-verification-code',
    // },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* 추가 메타 태그 */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body 
        className={`${notoSansKR.variable} font-sans antialiased`}
        style={{
          // 다크 모드 배경색 적용
          backgroundColor: 'var(--background)',
        }}
      >
        <AuthProvider>
          {/* 메인 컨텐츠 */}
          <main className="min-h-screen">
            {children}
          </main>
        </AuthProvider>

        {/* Toast 알림 (전역) */}
        <ToastProvider />

        {/* 접근성을 위한 skip to main content 링크 */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
        >
          메인 컨텐츠로 건너뛰기
        </a>
      </body>
    </html>
  );
}