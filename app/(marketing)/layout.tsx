// app/(marketing)/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SummaryGenie - AI 웹페이지 요약',
  description: '웹 서핑 시간은 절반으로, 정보의 깊이는 두 배로. AI 기반 웹페이지 요약 서비스',
  openGraph: {
    title: 'SummaryGenie - AI 웹페이지 요약',
    description: '웹 서핑 시간은 절반으로, 정보의 깊이는 두 배로',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SummaryGenie',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SummaryGenie - AI 웹페이지 요약',
    description: '웹 서핑 시간은 절반으로, 정보의 깊이는 두 배로',
    images: ['/og-image.png'],
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}