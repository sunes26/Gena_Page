// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Noto_Sans_KR } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { PaddleProvider } from '@/components/providers/PaddleProvider';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { Toaster } from 'react-hot-toast';
import { generateMetadata as genMeta } from '@/lib/metadata';

const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-noto-sans-kr',
});

// ✅ 기본 메타데이터 (한국어 기본)
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://gena.app'),
  ...genMeta({
    canonical: '/',
    locale: 'ko', // 기본 언어는 한국어
  }),
};

// ✅ Viewport 설정 (SEO & Mobile 최적화)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${notoSansKr.variable} font-sans antialiased`}>
        {/* ✅ Language Provider - 최상위에 배치 */}
        <LanguageProvider>
          {/* ✅ Auth Provider */}
          <AuthProvider>
            {/* ✅ Paddle Provider */}
            <PaddleProvider>
              {children}
              
              {/* Toast 알림 */}
              <Toaster
                position="top-center"
                reverseOrder={false}
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: '#333',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#10b981',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    duration: 4000,
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
            </PaddleProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}