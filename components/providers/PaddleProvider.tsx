// components/providers/PaddleProvider.tsx
'use client';

import { useEffect, useState } from 'react';
import { initializePaddleClient } from '@/lib/paddle';

/**
 * Paddle.js를 로드하고 초기화하는 Provider
 * app/layout.tsx에 추가하세요
 * 
 * @example
 * <PaddleProvider>
 *   {children}
 * </PaddleProvider>
 */
export function PaddleProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Paddle 초기화
    initializePaddleClient()
      .then(() => {
        setIsReady(true);
        console.log('✅ Paddle initialized in provider');
      })
      .catch((error) => {
        console.error('❌ Failed to initialize Paddle:', error);
      });
  }, []);

  // Paddle이 준비되지 않아도 children을 렌더링
  // PaddleCheckout 컴포넌트에서 자체적으로 초기화를 처리함
  return <>{children}</>;
}

// ============================================
// app/layout.tsx에 추가하는 방법
// ============================================

/*
// app/layout.tsx
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/components/ui/toast';
import { PaddleProvider } from '@/components/providers/PaddleProvider';

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <AuthProvider>
          <PaddleProvider>
            {children}
          </PaddleProvider>
        </AuthProvider>
        <ToastProvider />
      </body>
    </html>
  );
}
*/

// ============================================
// 대안: Script 태그로 직접 로드
// ============================================

/*
// app/layout.tsx
import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <Script 
          src="https://cdn.paddle.com/paddle/v2/paddle.js"
          strategy="afterInteractive"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
*/